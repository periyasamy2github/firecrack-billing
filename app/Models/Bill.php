<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bill extends Model
{
    protected $fillable = [
        'bill_no',
        'counter_id',
        'user_id',
        'billed_at',
        'customer_name',
        'customer_mobile',
        'payment_method',
        'status',
        'reprint_count',
        'gst_applicable',
        'discount',
        'tax_total',
        'grand_total',
    ];

    protected $casts = [
        'billed_at' => 'datetime',
        'gst_applicable' => 'boolean',
        'reprint_count' => 'integer',
        'discount' => 'decimal:2',
        'tax_total' => 'decimal:2',
        'grand_total' => 'decimal:2',
    ];

    public function counter(): BelongsTo
    {
        return $this->belongsTo(BillCounter::class, 'counter_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(BillItem::class);
    }

    /** Super Admin sees every counter; staff see only their own counter's bills. */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        return $query->where('counter_id', $user->counter_id);
    }
}
