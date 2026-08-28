<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\BillCounter;
use App\Models\BillItem;
use App\Models\BillPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /** GET /reports/daily-statement — one day's takings, ready to print at day close. */
    public function dailyStatement(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $user = $request->user();
        $scope = $request->query('scope');
        $counterId = $user->isSuperAdmin()
            ? (($scope && $scope !== 'all') ? (int) $scope : null)
            : $user->counter_id;

        $date = $data['date'];
        $dayBills = fn () => Bill::whereDate('billed_at', $date)
            ->when($counterId, fn ($query) => $query->where('counter_id', $counterId));

        $summary = $dayBills()->where('status', 'Paid')
            ->selectRaw('COUNT(*) as bills, COALESCE(SUM(grand_total), 0) as sales, COALESCE(SUM(discount), 0) as discount, COALESCE(SUM(tax_total), 0) as gst')
            ->first();

        $paymentTotals = BillPayment::query()
            ->join('bills', 'bills.id', '=', 'bill_payments.bill_id')
            ->join('payment_types', 'payment_types.id', '=', 'bill_payments.payment_type_id')
            ->where('bills.status', 'Paid')
            ->whereDate('bills.billed_at', $date)
            ->when($counterId, fn ($query) => $query->where('bills.counter_id', $counterId))
            ->selectRaw('payment_types.name as type, SUM(bill_payments.amount) as amount, COUNT(DISTINCT bill_payments.bill_id) as bills')
            ->groupBy('payment_types.name')
            ->orderByDesc('amount')
            ->get()
            ->map(fn ($row) => ['type' => $row->type, 'amount' => (float) $row->amount, 'bills' => (int) $row->bills])
            ->all();

        $itemSales = BillItem::query()
            ->join('bills', 'bills.id', '=', 'bill_items.bill_id')
            ->where('bills.status', 'Paid')
            ->whereDate('bills.billed_at', $date)
            ->when($counterId, fn ($query) => $query->where('bills.counter_id', $counterId))
            ->selectRaw('bill_items.name as name, SUM(bill_items.qty) as qty, SUM(bill_items.rate * bill_items.qty) as amount')
            ->groupBy('bill_items.name')
            ->orderByDesc('amount')
            ->get()
            ->map(fn ($row) => ['name' => $row->name, 'qty' => (int) $row->qty, 'amount' => (float) $row->amount])
            ->all();

        // Whole-shop statements break the day down per counter as well.
        $perCounter = [];
        if ($counterId === null) {
            $totals = $dayBills()->where('status', 'Paid')
                ->selectRaw('counter_id, COUNT(*) as bills, SUM(grand_total) as sales')
                ->groupBy('counter_id')
                ->get()
                ->keyBy('counter_id');

            $perCounter = BillCounter::orderBy('name')->get()
                ->map(fn ($counter) => [
                    'name' => $counter->name,
                    'bills' => (int) ($totals[$counter->id]->bills ?? 0),
                    'sales' => (float) ($totals[$counter->id]->sales ?? 0),
                ])
                ->filter(fn ($row) => $row['bills'] > 0)
                ->values()
                ->all();
        }

        $bills = $dayBills()->with(['counter', 'user', 'payments.paymentType'])
            ->orderBy('billed_at')
            ->orderBy('id')
            ->get()
            ->map(fn (Bill $bill) => [
                'billNo' => $bill->bill_no,
                'time' => $bill->billed_at?->format('H:i'),
                'counter' => $bill->counter?->name,
                'customerName' => $bill->customer_name,
                'billedBy' => $bill->user?->name,
                'grandTotal' => (float) $bill->grand_total,
                'payment' => $bill->paymentLabel(),
                'status' => $bill->status,
            ])
            ->all();

        return response()->json([
            'date' => $date,
            'counter' => $counterId ? BillCounter::find($counterId)?->name : null,
            'billCount' => (int) $summary->bills,
            'sales' => (float) $summary->sales,
            'discount' => (float) $summary->discount,
            'gst' => (float) $summary->gst,
            'cancelledCount' => $dayBills()->where('status', 'Cancelled')->count(),
            'refundCount' => $dayBills()->where('status', 'Refund')->count(),
            'paymentTotals' => $paymentTotals,
            'itemSales' => $itemSales,
            'perCounter' => $perCounter,
            'bills' => $bills,
        ]);
    }
}
