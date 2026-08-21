<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'name',
        'town',
        'address',
        'phone',
        'gstin',
        'state_code',
        'invoice_prefix',
        'next_number',
        'declaration',
        'season_target',
    ];

    protected $casts = [
        'next_number' => 'integer',
        'season_target' => 'decimal:2',
    ];

    /** The shop is a singleton — always row 1. */
    public static function current(): self
    {
        return static::firstOrFail();
    }
}
