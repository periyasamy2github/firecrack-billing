<?php

namespace App\Services;

use App\Models\Bill;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BillService
{
    /** Record a completed sale: number it, take the stock, total it, and save — all or nothing. */
    public function create(User $user, array $data): Bill
    {
        return DB::transaction(function () use ($user, $data) {
            $gstApplicable = (bool) ($data['gstApplicable'] ?? false);
            $discount = (float) ($data['discount'] ?? 0);

            $lines = $this->deductStock((int) $data['counterId'], $data['items']);
            $totals = $this->calculateTotals($lines, $gstApplicable, $discount);
            $this->assertPaymentsCoverTotal($data['payments'], $totals['grand_total']);

            $bill = new Bill([
                'counter_id' => $data['counterId'],
                'user_id' => $user->id,
                'customer_name' => $data['customerName'] ?? '',
                'customer_mobile' => $data['customerMobile'] ?? '',
                'gst_applicable' => $gstApplicable,
                'discount' => $discount,
                'discount_type' => $discount > 0 ? ($data['discountType'] ?? 'flat') : null,
                'discount_value' => $discount > 0 ? ($data['discountValue'] ?? $discount) : null,
                'tax_total' => $totals['tax_total'],
                'grand_total' => $totals['grand_total'],
                'reprint_count' => 0,
                'status' => 'Paid',
                'billed_at' => now(),
            ]);
            $this->assignNextInvoiceNumber($bill);

            $bill->save();
            $bill->items()->createMany($lines);
            $bill->payments()->createMany(array_map(fn ($payment) => [
                'payment_type_id' => $payment['typeId'],
                'amount' => $payment['amount'],
            ], $data['payments']));

            return $bill->load(['items', 'payments.paymentType']);
        });
    }

    // Edit a paid bill in place; the bill number stays.
    public function update(User $user, Bill $bill, array $data): Bill
    {
        $this->assertStatusIs($bill, 'Paid', "This bill can't be changed.");

        return DB::transaction(function () use ($user, $bill, $data) {
            $gstApplicable = (bool) ($data['gstApplicable'] ?? false);
            $discount = (float) ($data['discount'] ?? 0);

            $this->returnStock($bill->load('items'));
            $bill->items()->delete();
            $bill->payments()->delete();

            $lines = $this->deductStock($bill->counter_id, $data['items']);
            $totals = $this->calculateTotals($lines, $gstApplicable, $discount);
            $this->assertPaymentsCoverTotal($data['payments'], $totals['grand_total']);

            $bill->fill([
                'customer_name' => $data['customerName'] ?? '',
                'customer_mobile' => $data['customerMobile'] ?? '',
                'gst_applicable' => $gstApplicable,
                'discount' => $discount,
                'discount_type' => $discount > 0 ? ($data['discountType'] ?? 'flat') : null,
                'discount_value' => $discount > 0 ? ($data['discountValue'] ?? $discount) : null,
                'tax_total' => $totals['tax_total'],
                'grand_total' => $totals['grand_total'],
            ]);
            $bill->edited_at = now();
            $bill->edited_by = $user->id;
            $bill->save();

            $bill->items()->createMany($lines);
            $bill->payments()->createMany(array_map(fn ($payment) => [
                'payment_type_id' => $payment['typeId'],
                'amount' => $payment['amount'],
            ], $data['payments']));

            return $bill->load(['items', 'payments.paymentType']);
        });
    }

    /** Void a paid bill and put its stock back. */
    public function cancel(Bill $bill): Bill
    {
        $this->assertStatusIs($bill, 'Paid', "This bill can't be cancelled.");

        return DB::transaction(function () use ($bill) {
            $this->returnStock($bill);
            $bill->status = 'Cancelled';
            $bill->save();
            // The money back to the customer — a cancelled bill.
            $bill->payments()->delete();

            return $bill->fresh(['items', 'payments.paymentType']);
        });
    }

    /** Count one more printout of a bill. */
    public function reprint(Bill $bill): Bill
    {
        $bill->increment('reprint_count');

        return $bill->fresh(['items', 'payments.paymentType']);
    }

    // Payments must add up to the grand total.
    private function assertPaymentsCoverTotal(array $payments, float $grandTotal): void
    {
        $tendered = round(array_sum(array_map(fn ($payment) => (float) $payment['amount'], $payments)), 2);

        if (abs($tendered - $grandTotal) > 0.009) {
            $this->fail(422, "Payment amount doesn't match the bill total.");
        }
    }

    // Touched products with their new stock.
    public function affectedProducts(Bill $bill, array $extraProductIds = []): array
    {
        $productIds = $bill->items->pluck('product_id')->filter()->merge($extraProductIds)->unique()->all();

        // The counter goes along too — the same barcode can exist on another counter.
        return Product::whereIn('id', $productIds)->get()
            ->map(fn (Product $product) => [
                'code' => $product->barcode,
                'counterId' => (string) $product->counter_id,
                'stock' => $product->stock,
            ])
            ->all();
    }

    /** Prices are GST-inclusive, so tax is taken out of the rate rather than added on top.
     *  Only these two numbers are stored — the app works the rest out from the bill's items. */
    private function calculateTotals(array $lines, bool $gstApplicable, float $flatDiscount): array
    {
        $sellingTotal = 0.0;
        foreach ($lines as $line) {
            $sellingTotal += $line['rate'] * $line['qty'];
        }

        $discount = ($flatDiscount > 0 && $sellingTotal > 0) ? min($flatDiscount, $sellingTotal) : 0.0;
        $payable = $sellingTotal - $discount;
        $discountRatio = $sellingTotal > 0 ? $payable / $sellingTotal : 1.0;

        $gst = 0.0;
        if ($gstApplicable) {
            foreach ($lines as $line) {
                $lineAfterDiscount = $line['rate'] * $line['qty'] * $discountRatio;
                $gst += $lineAfterDiscount - $lineAfterDiscount / (1 + $line['gst_rate'] / 100);
            }
        }

        return [
            'tax_total' => $gst,
            'grand_total' => round($payable),
        ];
    }

    private function deductStock(int $counterId, array $items): array
    {
        $lines = [];

        foreach ($items as $item) {
            $product = Product::where('counter_id', $counterId)->where('barcode', $item['code'])->lockForUpdate()->first();

            if (! $product) {
                $this->fail(422, 'This item is not available.');
            }

            $qty = (int) $item['qty'];

            if ($product->stock < $qty) {
                $this->fail(409, "Not enough stock for {$product->name}.");
            }

            $product->decrement('stock', $qty);

            $lines[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'hsn' => $product->hsn,
                'mrp' => $product->mrp,
                'rate' => $product->rate,
                'gst_rate' => $product->gst_rate,
                'qty' => $qty,
            ];
        }

        return $lines;
    }

    private function returnStock(Bill $bill): void
    {
        foreach ($bill->items as $item) {
            if ($item->product_id) {
                Product::where('id', $item->product_id)->lockForUpdate()->first()?->increment('stock', $item->qty);
            }
        }
    }

    private function assignNextInvoiceNumber(Bill $bill): void
    {
        $settings = Setting::lockForUpdate()->find(1);

        // Skip numbers already used.
        $number = $settings->next_number;
        while (Bill::where('bill_no', $settings->invoice_prefix.$number)->exists()) {
            $number++;
        }

        $bill->bill_no = $settings->invoice_prefix.$number;
        $settings->next_number = $number + 1;
        $settings->save();
    }

    private function assertStatusIs(Bill $bill, string $status, string $message): void
    {
        if ($bill->status !== $status) {
            $this->fail(422, $message);
        }
    }

    private function fail(int $status, string $message): void
    {
        abort(response()->json(['message' => $message], $status));
    }
}
