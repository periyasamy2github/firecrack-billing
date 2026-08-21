<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BillItem extends Model
{
    protected $fillable = [
        'bill_id',
        'product_id',
        'name',
        'hsn',
        'unit',
        'mrp',
        'rate',
        'gst_rate',
        'qty',
    ];

    protected $casts = [
        'mrp' => 'decimal:2',
        'rate' => 'decimal:2',
        'gst_rate' => 'decimal:2',
        'qty' => 'integer',
    ];

    public function bill(): BelongsTo
    {
        return $this->belongsTo(Bill::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
