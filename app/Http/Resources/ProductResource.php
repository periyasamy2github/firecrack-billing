<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->barcode,
            // Two counters can each stock the same barcode, so the counter is part of a product's identity.
            'counterId' => (string) $this->counter_id,
            'counter' => $this->whenLoaded('counter', fn () => $this->counter->name),
            'name' => $this->name,
            'category' => $this->category,
            'hsn' => $this->hsn,
            'unit' => $this->unit,
            'mrp' => (float) $this->mrp,
            'rate' => (float) $this->rate,
            'gstRate' => (float) $this->gst_rate,
            'stock' => $this->stock,
            'lowStockThreshold' => $this->reorder_level,
        ];
    }
}
