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

            $bill = new Bill([
                'counter_id' => $data['counterId'],
                'user_id' => $user->id,
                'customer_name' => $data['customerName'] ?? '',
                'customer_mobile' => $data['customerMobile'] ?? '',
                'payment_method' => $data['paymentMethod'] ?? null,
                'gst_applicable' => $gstApplicable,
                'discount' => $discount,
                'tax_total' => $totals['tax_total'],
                'grand_total' => $totals['grand_total'],
                'reprint_count' => 0,
                'status' => 'Paid',
                'billed_at' => now(),
            ]);
            $this->assignNextInvoiceNumber($bill);

            $bill->save();
            $bill->items()->createMany($lines);

            return $bill->load('items');
        });
    }

    /** Void a paid bill and put its stock back. */
    public function cancel(Bill $bill): Bill
    {
        $this->assertStatusIs($bill, 'Paid', 'Only a paid bill can be cancelled.');

        return DB::transaction(function () use ($bill) {
            $this->returnStock($bill);
            $bill->status = 'Cancelled';
            $bill->payment_method = null;
            $bill->save();

            return $bill->fresh('items');
        });
    }

    /** Count one more printout of a bill. */
    public function reprint(Bill $bill): Bill
    {
        $bill->increment('reprint_count');

        return $bill->fresh('items');
    }

    /** The touched products with their new stock, so the app can refresh without a reload. */
    public function affectedProducts(Bill $bill): array
    {
        $productIds = $bill->items->pluck('product_id')->filter()->unique()->all();

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
                $this->fail(422, "Unknown product: {$item['code']}");
            }

            $qty = (int) $item['qty'];

            if ($product->stock < $qty) {
                $this->fail(409, "{$product->name} is out of stock (only {$product->stock} left)");
            }

            $product->decrement('stock', $qty);

            $lines[] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'hsn' => $product->hsn,
                'unit' => $product->unit,
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
        $bill->bill_no = $settings->invoice_prefix.$settings->next_number;
        $settings->increment('next_number');
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
