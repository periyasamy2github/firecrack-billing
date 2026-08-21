<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BillResource;
use App\Models\Bill;
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

    /** GET /bills — one page of bills, filtered and searched in the database. */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $query = Bill::query()
            ->visibleTo($user)
            ->with(['counter', 'user', 'items.product']);

        // A super admin can narrow to one counter; staff are already limited to their own.
        $scope = $request->query('scope');
        if ($user->isSuperAdmin() && $scope && $scope !== 'all') {
            $query->where('counter_id', $scope);
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(fn ($q) => $q
                ->where('bill_no', 'like', "%{$search}%")
                ->orWhere('customer_mobile', 'like', "%{$search}%"));
        }

        if ($from = $request->query('from')) {
            $query->whereDate('billed_at', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->whereDate('billed_at', '<=', $to);
        }

        // Chip tallies, counted before the active filter narrows things down — one query, not six.
        $tally = (clone $query)->selectRaw("
            COUNT(*) as `all`,
            SUM(payment_method = 'Cash') as cash,
            SUM(payment_method = 'UPI') as upi,
            SUM(payment_method = 'Card') as card,
            SUM(status = 'Cancelled') as cancelled
        ")->first();

        $counts = [
            'All' => (int) $tally->all,
            'Cash' => (int) $tally->cash,
            'UPI' => (int) $tally->upi,
            'Card' => (int) $tally->card,
            'Cancelled' => (int) $tally->cancelled,
        ];

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

    /** GET /bills/find?id=… — one bill by its encrypted id, used by the print page on a fresh load. */
    public function show(Request $request): JsonResponse
    {
        try {
            $id = decrypt((string) $request->query('id'));
        } catch (DecryptException) {
            abort(404, 'Bill not found');
        }

        $bill = Bill::find($id);
        if (! $bill) {
            abort(404, 'Bill not found');
        }

        $this->authorizeBill($request->user(), $bill);

        return response()->json($this->billResource($bill));
    }

    /** createBill — record a finalized sale. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'counterId' => ['required', Rule::exists('counters', 'id')->where('active', true)],
            'customerName' => ['nullable', 'string', 'max:255'],
            'customerMobile' => ['nullable', 'string', 'max:15'],
            'paymentMethod' => ['nullable', Rule::in(['Cash', 'UPI', 'Card'])],
            'gstApplicable' => ['required', 'boolean'],
            'discount' => ['nullable', 'numeric', 'gte:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.code' => ['required', 'string'],
            'items.*.qty' => ['required', 'integer', 'gt:0'],
        ], [
            'counterId.exists' => 'This counter is closed, so it cannot take new bills.',
        ]);

        $this->authorizeCounter($request->user(), (int) $data['counterId']);
        $bill = $this->service->create($request->user(), $data);

        return $this->saleResponse($bill);
    }

    /** cancelBill — Paid → Cancelled, stock restored. */
    public function cancel(Request $request): JsonResponse
    {
        $bill = $this->service->cancel($this->findByNo($request));

        return $this->saleResponse($bill);
    }

    /** reprintBill — bumps reprint_count. */
    public function reprint(Request $request): JsonResponse
    {
        $bill = $this->service->reprint($this->findByNo($request));

        return response()->json(['bill' => $this->billResource($bill)]);
    }

    private function applyFilter($query, string $filter): void
    {
        if (in_array($filter, ['Cash', 'UPI', 'Card'], true)) {
            $query->where('payment_method', $filter);
        } elseif ($filter === 'Cancelled') {
            $query->where('status', 'Cancelled');
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
        return new BillResource($bill->load(['counter', 'user', 'items.product']));
    }

    private function findByNo(Request $request): Bill
    {
        $request->validate(['billNo' => ['required', 'string']]);
        $bill = Bill::where('bill_no', $request->input('billNo'))->first();

        if (! $bill) {
            abort(404, 'Bill not found');
        }

        $this->authorizeBill($request->user(), $bill);

        return $bill;
    }

    private function authorizeCounter(User $user, int $counterId): void
    {
        if (! $user->isSuperAdmin() && $user->counter_id !== $counterId) {
            abort(response()->json(['message' => 'You are not assigned to this counter'], 403));
        }
    }

    private function authorizeBill(User $user, Bill $bill): void
    {
        $this->authorizeCounter($user, $bill->counter_id);
    }
}
