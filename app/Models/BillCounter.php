<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BillCounter extends Model
{
    // Class renamed from Counter; the table + columns keep their original names.
    protected $table = 'counters';

    protected $fillable = [
        'name',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'counter_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'counter_id');
    }

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class, 'counter_id');
    }
}
