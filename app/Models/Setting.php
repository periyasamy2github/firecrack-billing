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
        'numbering_mode',
        'declaration',
        'season_target',
        'theme',
        'theme_color',
        'theme_rail_color',
    ];

    protected $casts = [
        'next_number' => 'integer',
        'season_target' => 'decimal:2',
    ];

    // Always row 1.
    public static function current(): self
    {
        return static::firstOrFail();
    }
}
