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
            'payments' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($payment) => [
                'typeId' => (string) $payment->payment_type_id,
                'type' => $payment->paymentType->name,
                'amount' => (float) $payment->amount,
            ])->values(), []),
            // Display label the SPA pills show: one type's name, 'Mixed', or null.
            'paymentMethod' => $this->paymentLabel(),
            'status' => $this->status,
            'reprintCount' => $this->reprint_count,
            // Edited bills carry a marker; the editor loads lazily since edits are rare.
            'editedAt' => $this->edited_at?->format('d-M-Y H:i'),
            'editedBy' => $this->edited_by ? $this->editor?->name : null,
            'gstApplicable' => $this->gst_applicable,
            // As the cashier entered it (percent or flat); pre-Phase-4 bills fall back to flat ₹.
            'billDiscount' => $discount > 0 ? [
                'type' => $this->discount_type ?? 'flat',
                'value' => $this->discount_value !== null ? (float) $this->discount_value : $discount,
            ] : null,
        ];
    }
}
