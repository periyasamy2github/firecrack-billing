<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'initials' => $this->initials,
            'staffId' => $this->staff_id,
            'mobile' => $this->mobile,
            'email' => $this->email,
            'role' => $this->role,
            'active' => $this->active,
            'joinedOn' => optional($this->joined_on)->toDateString(),
            'isSuperAdmin' => $this->role === 'Super Admin',
            'counterId' => $this->counter_id ? (string) $this->counter_id : null,
            'counter' => $this->whenLoaded('counter', fn () => $this->counter?->name),
        ];
    }
}
