<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'counter_id',
        'barcode',
        'name',
        'category',
        'hsn',
        'mrp',
        'rate',
        'gst_rate',
        'stock',
        'reorder_level',
    ];

    protected $casts = [
        'mrp' => 'decimal:2',
        'rate' => 'decimal:2',
        'gst_rate' => 'decimal:2',
        'stock' => 'integer',
        'reorder_level' => 'integer',
    ];

    public function counter(): BelongsTo
    {
        return $this->belongsTo(BillCounter::class, 'counter_id');
    }
}
