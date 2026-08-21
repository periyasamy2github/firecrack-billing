<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CounterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id, // the SPA uses string ids throughout
            'name' => $this->name,
            'active' => $this->active,
        ];
    }
}
