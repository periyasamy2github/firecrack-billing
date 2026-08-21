<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'town' => $this->town,
            'phone' => $this->phone,
            'gstin' => $this->gstin,
            'address' => $this->address,
            'stateCode' => $this->state_code,
            'invoicePrefix' => $this->invoice_prefix,
            'nextInvoiceNumber' => $this->next_number,
            'declaration' => $this->declaration,
            'seasonTarget' => (float) $this->season_target,
        ];
    }
}
