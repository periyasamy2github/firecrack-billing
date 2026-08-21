<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BillResource;
use App\Models\Bill;
use App\Models\BillCounter;
use App\Models\BillItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    // The dashboard's totals, added up in the database so the app never downloads every bill.
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        // Staff see their own counter. A super admin sees all counters, or the one they clicked.
        $scope = $request->query('scope');
        $counterId = $user->isSuperAdmin()
            ? (($scope && $scope !== 'all') ? $scope : null)
            : $user->counter_id;

        $totals = $this->paidBills($counterId)
            ->selectRaw('COUNT(*) as bills, COALESCE(SUM(grand_total), 0) as sales, COALESCE(SUM(tax_total), 0) as gst')
            ->first();

        $sales = (float) $totals->sales;
        $billCount = (int) $totals->bills;

        $data = [
            'sales' => $sales,
            'billCount' => $billCount,
            'avgBill' => $billCount ? (int) round($sales / $billCount) : 0,
            'gstCollected' => (float) $totals->gst,
            'trend' => $this->dailyTrend($counterId),
            'paymentMix' => $this->paymentMix($counterId),
            'topItems' => $this->topItems($counterId),
            'recentBills' => BillResource::collection($this->recentBills($counterId)),
        ];

        if ($user->isSuperAdmin()) {
            $perCounter = $this->perCounter();
            $data['perCounter'] = $perCounter;
            $data['seasonSales'] = array_sum(array_column($perCounter, 'sales'));
        }

        return response()->json($data);
    }

    // Paid bills, limited to one counter (or all counters when $counterId is null).
    private function paidBills($counterId)
    {
        return Bill::where('status', 'Paid')
            ->when($counterId, fn ($query) => $query->where('counter_id', $counterId));
    }

    // Sales per day for the last 10 selling days, in thousands of rupees.
    private function dailyTrend($counterId): array
    {
        return $this->paidBills($counterId)
            ->selectRaw('DATE(billed_at) as day, SUM(grand_total) as total')
            ->groupBy('day')
            ->orderByDesc('day')
            ->limit(10)
            ->get()
            ->sortBy('day')
            ->map(fn ($row) => [
                'label' => date('d M', strtotime($row->day)),
                'value' => (int) round($row->total / 1000),
            ])
            ->values()
            ->all();
    }

    // How much came in by Cash / UPI / Card.
    private function paymentMix($counterId): array
    {
        return $this->paidBills($counterId)
            ->whereNotNull('payment_method')
            ->selectRaw('payment_method as method, SUM(grand_total) as amount')
            ->groupBy('payment_method')
            ->orderByDesc('amount')
            ->get()
            ->map(fn ($row) => ['method' => $row->method, 'amount' => (float) $row->amount])
            ->all();
    }

    // The six products that brought in the most money.
    private function topItems($counterId): array
    {
        return BillItem::join('bills', 'bills.id', '=', 'bill_items.bill_id')
            ->where('bills.status', 'Paid')
            ->when($counterId, fn ($query) => $query->where('bills.counter_id', $counterId))
            ->selectRaw('bill_items.name as name, SUM(bill_items.rate * bill_items.qty) as amount')
            ->groupBy('bill_items.name')
            ->orderByDesc('amount')
            ->limit(6)
            ->get()
            ->map(fn ($row) => ['name' => $row->name, 'amount' => (float) $row->amount])
            ->all();
    }

    // The eight newest bills for the "Recent bills" panel.
    private function recentBills($counterId)
    {
        return Bill::when($counterId, fn ($query) => $query->where('counter_id', $counterId))
            ->with(['counter', 'user', 'items.product'])
            ->latest('billed_at')
            ->latest('id')
            ->limit(8)
            ->get();
    }

    // Each counter's takings in one grouped query, then matched to the counter list.
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
