<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $t) {
            $t->id();
            $t->string('bill_no', 60)->unique();
            $t->foreignId('counter_id')->constrained()->restrictOnDelete();
            $t->foreignId('user_id')->constrained()->restrictOnDelete();
            $t->dateTime('billed_at');
            $t->string('customer_name')->default('');
            $t->string('customer_mobile', 15)->default('');
            $t->enum('payment_method', ['Cash', 'UPI', 'Card'])->nullable();
            $t->enum('status', ['Paid', 'Cancelled'])->default('Paid');
            $t->unsignedInteger('reprint_count')->default(0);
            $t->boolean('gst_applicable')->default(false);
            $t->decimal('discount', 12, 2)->default(0); // input: flat rupees off the gross
            $t->decimal('tax_total', 14, 2);            // cached GST (cgst+sgst) for the GST-collected KPI
            $t->decimal('grand_total', 14, 2);          // cached headline for sales aggregation
            $t->timestamps();
            $t->index(['counter_id', 'status', 'billed_at']);
            $t->index('billed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
