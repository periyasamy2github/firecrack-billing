<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'initials',
        'staff_id',
        'mobile',
        'email',
        'password',
        'role',
        'counter_id',
        'active',
        'joined_on',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'active' => 'boolean',
            'joined_on' => 'date',
        ];
    }

    public function counter(): BelongsTo
    {
        return $this->belongsTo(BillCounter::class, 'counter_id');
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'Super Admin';
    }
}
