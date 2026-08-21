<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bill_items', function (Blueprint $t) {
            $t->id();
            $t->foreignId('bill_id')->constrained()->cascadeOnDelete();
            $t->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $t->string('name');
            $t->string('hsn', 20)->default('');
            $t->string('unit', 40);
            $t->decimal('mrp', 12, 2);
            $t->decimal('rate', 12, 2);
            $t->decimal('gst_rate', 5, 2);
            $t->unsignedInteger('qty');
            $t->timestamps();
            $t->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bill_items');
    }
};
