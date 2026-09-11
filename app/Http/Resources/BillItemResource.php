<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Money fields come from the line snapshot; product fields from the product when it still exists.
class BillItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->relationLoaded('product') ? $this->product : null;

        return [
            'lineId' => (string) $this->id,
            'qty' => $this->qty,
            'product' => [
                'code' => $product->barcode ?? '',
                'counterId' => (string) ($product->counter_id ?? ''),
                'name' => $this->name,
                'category' => $product->category ?? '',
                'hsn' => $this->hsn,
                'mrp' => $this->mrp === null ? null : (float) $this->mrp,
                'rate' => (float) $this->rate,
                'gstRate' => (float) $this->gst_rate,
                'stock' => $product->stock ?? 0,
                'lowStockThreshold' => $product->reorder_level ?? 0,
            ],
        ];
    }
}
