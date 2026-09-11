<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BillResource;
use App\Models\Bill;
use App\Models\BillCounter;
use App\Models\BillItem;
use App\Models\BillPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // Dashboard totals computed in the database.
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        $scope = $request->query('scope');
        $counterId = $user->isSuperAdmin()
            ? (($scope && $scope !== 'all') ? $scope : null)
            : null;
        $userId = $user->isSuperAdmin() ? null : $user->id;

        $totals = $this->paidBills($counterId, $userId)
            ->selectRaw('COUNT(*) as bills, COALESCE(SUM(grand_total), 0) as sales, COALESCE(SUM(tax_total), 0) as gst')
            ->first();

        $sales = (float) $totals->sales;
        $billCount = (int) $totals->bills;

        $data = [
            'sales' => $sales,
            'billCount' => $billCount,
            'avgBill' => $billCount ? (int) round($sales / $billCount) : 0,
            'gstCollected' => (float) $totals->gst,
            'trend' => $this->dailyTrend($counterId, $userId),
            'paymentMix' => $this->paymentMix($counterId, $userId),
            'topItems' => $this->topItems($counterId, $userId),
            'recentBills' => BillResource::collection($this->recentBills($counterId, $userId)),
        ];

        if ($user->isSuperAdmin()) {
            $perCounter = $this->perCounter();
            $data['perCounter'] = $perCounter;
            $data['seasonSales'] = array_sum(array_column($perCounter, 'sales'));
        }

        return response()->json($data);
    }

    // Paid bills for the given counter and user scope.
    private function paidBills($counterId, $userId = null)
    {
        return Bill::where('status', 'Paid')
            ->when($counterId, fn ($query) => $query->where('counter_id', $counterId))
            ->when($userId, fn ($query) => $query->where('user_id', $userId));
    }

    // Sales per day for the last 10 selling days.
    private function dailyTrend($counterId, $userId = null): array
    {
        return $this->paidBills($counterId, $userId)
            ->selectRaw('DATE(billed_at) as day, SUM(grand_total) as total')
            ->groupBy('day')
            ->orderByDesc('day')
            ->limit(10)
            ->get()
            ->sortBy('day')
            ->map(fn ($row) => [
                'label' => date('d M', strtotime($row->day)),
                'value' => (float) $row->total,
            ])
            ->values()
            ->all();
    }

    // Takings per payment type, mixed bills split per payment.
    private function paymentMix($counterId, $userId = null): array
    {
        return BillPayment::query()
            ->join('bills', 'bills.id', '=', 'bill_payments.bill_id')
            ->join('payment_types', 'payment_types.id', '=', 'bill_payments.payment_type_id')
            ->where('bills.status', 'Paid')
            ->when($counterId, fn ($query) => $query->where('bills.counter_id', $counterId))
            ->when($userId, fn ($query) => $query->where('bills.user_id', $userId))
            ->selectRaw('payment_types.name as method, SUM(bill_payments.amount) as amount')
            ->groupBy('payment_types.name')
            ->orderByDesc('amount')
            ->get()
            ->map(fn ($row) => ['method' => $row->method, 'amount' => (float) $row->amount])
            ->all();
    }

    // Top products by revenue.
    private function topItems($counterId, $userId = null): array
    {
        return BillItem::join('bills', 'bills.id', '=', 'bill_items.bill_id')
            ->where('bills.status', 'Paid')
            ->when($counterId, fn ($query) => $query->where('bills.counter_id', $counterId))
            ->when($userId, fn ($query) => $query->where('bills.user_id', $userId))
            ->selectRaw('bill_items.name as name, SUM(bill_items.rate * bill_items.qty) as amount')
            ->groupBy('bill_items.name')
            ->orderByDesc('amount')
            ->limit(7)
            ->get()
            ->map(fn ($row) => ['name' => $row->name, 'amount' => (float) $row->amount])
            ->all();
    }

    private function recentBills($counterId, $userId = null)
    {
        return Bill::when($counterId, fn ($query) => $query->where('counter_id', $counterId))
            ->when($userId, fn ($query) => $query->where('user_id', $userId))
            ->with(['counter', 'user', 'items.product', 'payments.paymentType'])
            ->latest('billed_at')
            ->latest('id')
            ->limit(10)
            ->get();
    }

    // Takings per counter.
    private function perCounter(): array
    {
        $totals = $this->paidBills(null)
            ->selectRaw('counter_id, COUNT(*) as bills, SUM(grand_total) as sales')
            ->groupBy('counter_id')
            ->get()
            ->keyBy('counter_id');

        return BillCounter::orderBy('name')->get()->map(fn ($counter) => [
            'id' => (string) $counter->id,
            'name' => $counter->name,
            'sales' => (float) ($totals[$counter->id]->sales ?? 0),
            'billCount' => (int) ($totals[$counter->id]->bills ?? 0),
        ])->all();
    }
}
