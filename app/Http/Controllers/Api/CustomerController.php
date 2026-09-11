<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    // Customer list built from bills, one row per mobile.
    public function index(): JsonResponse
    {
        $stats = Bill::query()
            ->where('customer_mobile', '!=', '')
            ->groupBy('customer_mobile')
            ->selectRaw("customer_mobile as mobile, COUNT(*) as bills, SUM(CASE WHEN status = 'Paid' THEN grand_total ELSE 0 END) as spent, MAX(billed_at) as last_billed_at, MAX(id) as last_bill_id")
            ->orderByDesc('last_billed_at')
            ->get();

        $names = Bill::whereIn('id', $stats->pluck('last_bill_id'))->pluck('customer_name', 'id');

        return response()->json($stats->map(fn ($row) => [
            'mobile' => $row->mobile,
            'name' => $names[$row->last_bill_id] ?? '',
            'bills' => (int) $row->bills,
            'spent' => (float) $row->spent,
            'lastBilledAt' => $row->last_billed_at,
        ]));
    }
}
