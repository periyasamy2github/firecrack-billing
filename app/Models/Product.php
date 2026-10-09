<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
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

    // Units sold across paid bills, exposed as sales_count.
    public function scopeWithSalesCount(Builder $query): Builder
    {
        return $query->addSelect(['*'])->addSelect(['sales_count' => BillItem::query()
            ->join('bills', 'bills.id', '=', 'bill_items.bill_id')
            ->where('bills.status', 'Paid')
            ->whereColumn('bill_items.product_id', 'products.id')
            ->selectRaw('COALESCE(SUM(bill_items.qty), 0)')]);
    }
}
