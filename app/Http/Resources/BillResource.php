<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $discount = (float) $this->discount;

        return [
            // Encrypted so the URL never exposes the raw row id.
            'id' => encrypt($this->id),
            'billNo' => $this->bill_no,
            'counterId' => (string) $this->counter_id,
            'date' => $this->billed_at?->format('d-M-Y'),
            'time' => $this->billed_at?->format('H:i'),
            'customerName' => $this->customer_name,
            'customerMobile' => $this->customer_mobile,
            'counter' => $this->whenLoaded('counter', fn () => $this->counter->name),
            'billedBy' => $this->whenLoaded('user', fn () => $this->user->name),
            'items' => BillItemResource::collection($this->whenLoaded('items')),
            'paymentMethod' => $this->payment_method,
            'status' => $this->status,
            'reprintCount' => $this->reprint_count,
            'gstApplicable' => $this->gst_applicable,
            // Stored flat; presented in the SPA's BillDiscount shape.
            'billDiscount' => $discount > 0 ? ['type' => 'flat', 'value' => $discount] : null,
        ];
    }
}
