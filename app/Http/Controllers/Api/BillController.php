<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BillResource;
use App\Models\Bill;
use App\Models\BillPayment;
use App\Models\PaymentType;
use App\Models\User;
use App\Services\BillService;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class BillController extends Controller
{
    public function __construct(private BillService $service) {}

    // One page of bills with search and filters.
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = Bill::query()
            ->forUser($user)
            ->with(['counter', 'user', 'items.product', 'payments.paymentType']);

        $scope = $request->query('scope');
        if ($user->isSuperAdmin() && $scope && $scope !== 'all') {
            $query->where('counter_id', $scope);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(fn ($q) => $q
                ->where('bill_no', 'like', "%{$search}%")
                ->orWhere('customer_name', 'like', "%{$search}%")
                ->orWhere('customer_mobile', 'like', "%{$search}%"));
        }

        if ($from = $request->query('from')) {
            $query->whereDate('billed_at', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->whereDate('billed_at', '<=', $to);
        }

        $perType = BillPayment::query()
            ->join('payment_types', 'payment_types.id', '=', 'bill_payments.payment_type_id')
            ->whereIn('bill_payments.bill_id', (clone $query)->select('bills.id'))
            ->selectRaw('payment_types.name as name, COUNT(DISTINCT bill_payments.bill_id) as tally')
            ->groupBy('payment_types.name')
            ->pluck('tally', 'name');

        $counts = ['All' => (clone $query)->count()];
        foreach (PaymentType::orderBy('sort')->orderBy('name')->pluck('name') as $typeName) {
            $counts[$typeName] = (int) ($perType[$typeName] ?? 0);
        }
        $counts['Mixed'] = (clone $query)->has('payments', '>', 1)->count();
        $counts['Cancelled'] = (clone $query)->where('status', 'Cancelled')->count();

        $this->applyFilter($query, (string) $request->query('filter', 'All'));

        $paidTotals = (clone $query)->where('status', 'Paid')
            ->selectRaw('COALESCE(SUM(discount), 0) as discount, COALESCE(SUM(tax_total), 0) as gst, COALESCE(SUM(grand_total), 0) as grand')
            ->first();

        $query->latest('billed_at')->latest('id');

        $bills = $request->boolean('all')
            ? $query->get()
            : $query->paginate($request->integer('perPage', 10));

        return BillResource::collection($bills)->additional([
            'counts' => $counts,
            'totals' => [
                'discount' => (float) $paidTotals->discount,
                'gst' => (float) $paidTotals->gst,
                'grand' => (float) $paidTotals->grand,
            ],
        ]);
    }

    // Finds one bill by its encrypted id.
    public function show(Request $request): JsonResponse
    {
        try {
            $id = decrypt((string) $request->query('id'));
        } catch (DecryptException) {
            abort(404, 'This bill was not found.');
        }

        $bill = Bill::find($id);
        if (! $bill) {
            abort(404, 'This bill was not found.');
        }

        $this->authorizeBill($request->user(), $bill);

        return response()->json($this->billResource($bill));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'counterId' => ['required', Rule::exists('counters', 'id')->where('active', true)],
            'customerName' => ['nullable', 'string', 'max:255'],
            'customerMobile' => ['nullable', 'string', 'max:15'],
            'gstApplicable' => ['required', 'boolean'],
            'discount' => ['nullable', 'numeric', 'gte:0'],
            'discountType' => ['nullable', 'required_with:discountValue', Rule::in(['percent', 'flat'])],
            'discountValue' => ['nullable', 'numeric', 'gte:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.code' => ['required', 'string'],
            'items.*.qty' => ['required', 'integer', 'gt:0'],
            'payments' => ['required', 'array', 'min:1'],
            'payments.*.typeId' => ['required', 'distinct', Rule::exists('payment_types', 'id')->where('active', true)],
            'payments.*.amount' => ['required', 'numeric', 'gt:0'],
        ], [
            'counterId.exists' => "This branch is closed. New bills can't be made.",
            'payments.*.typeId.exists' => 'This payment type is turned off. Pick another.',
        ]);

        $this->authorizeCounter($request->user(), (int) $data['counterId']);
        $bill = $this->service->create($request->user(), $data);

        return $this->saleResponse($bill);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customerName' => ['nullable', 'string', 'max:255'],
            'customerMobile' => ['nullable', 'string', 'max:15'],
            'gstApplicable' => ['required', 'boolean'],
            'discount' => ['nullable', 'numeric', 'gte:0'],
            'discountType' => ['nullable', 'required_with:discountValue', Rule::in(['percent', 'flat'])],
            'discountValue' => ['nullable', 'numeric', 'gte:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.code' => ['required', 'string'],
            'items.*.qty' => ['required', 'integer', 'gt:0'],
            'payments' => ['required', 'array', 'min:1'],
            'payments.*.typeId' => ['required', 'distinct', Rule::exists('payment_types', 'id')->where('active', true)],
            'payments.*.amount' => ['required', 'numeric', 'gt:0'],
        ], [
            'payments.*.typeId.exists' => 'This payment type is turned off. Pick another.',
        ]);

        $bill = $this->findByNo($request);
        $oldProductIds = $bill->items()->pluck('product_id')->filter()->all();
        $bill = $this->service->update($request->user(), $bill, $data);

        return response()->json([
            'bill' => $this->billResource($bill),
            'products' => $this->service->affectedProducts($bill, $oldProductIds),
        ]);
    }

    public function cancel(Request $request): JsonResponse
    {
        $bill = $this->service->cancel($this->findByNo($request));

        return $this->saleResponse($bill);
    }

    public function reprint(Request $request): JsonResponse
    {
        $bill = $this->service->reprint($this->findByNo($request));

        return response()->json(['bill' => $this->billResource($bill)]);
    }

    private function applyFilter($query, string $filter): void
    {
        if ($filter === 'Cancelled') {
            $query->where('status', 'Cancelled');

            return;
        }

        if ($filter === 'Mixed') {
            $query->has('payments', '>', 1);

            return;
        }

        if ($filter === '' || $filter === 'All') {
            return;
        }

        if ($typeId = PaymentType::where('name', $filter)->value('id')) {
            $query->whereHas('payments', fn ($q) => $q->where('payment_type_id', $typeId));
        }
    }

    private function saleResponse(Bill $bill): JsonResponse
    {
        return response()->json([
            'bill' => $this->billResource($bill),
            'products' => $this->service->affectedProducts($bill->loadMissing('items')),
        ]);
    }

    private function billResource(Bill $bill): BillResource
    {
        return new BillResource($bill->load(['counter', 'user', 'items.product', 'payments.paymentType']));
    }

    private function findByNo(Request $request): Bill
    {
        $request->validate(['billNo' => ['required', 'string']]);
        $bill = Bill::where('bill_no', $request->input('billNo'))->first();

        if (! $bill) {
            abort(404, 'This bill was not found.');
        }

        $this->authorizeBill($request->user(), $bill);

        return $bill;
    }

    private function authorizeCounter(User $user, int $counterId): void
    {
        if (! $user->isSuperAdmin() && $user->counter_id !== $counterId) {
            abort(response()->json(['message' => "You don't have access to this branch."], 403));
        }
    }

    private function authorizeBill(User $user, Bill $bill): void
    {
        if (! $user->isSuperAdmin() && $bill->user_id !== $user->id) {
            abort(response()->json(['message' => "You don't have access to this bill."], 403));
        }
    }
}
