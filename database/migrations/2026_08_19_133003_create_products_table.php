<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $t) {
            $t->id();
            $t->foreignId('counter_id')->constrained('counters')->cascadeOnDelete();
            $t->string('barcode', 60);
            $t->string('name');
            $t->string('category', 40);
            $t->string('hsn', 20)->default('');
            $t->decimal('mrp', 12, 2)->nullable();
            $t->decimal('rate', 12, 2);
            $t->decimal('gst_rate', 5, 2)->default(18);
            $t->integer('stock')->default(0);
            $t->integer('reorder_level')->default(15);
            $t->timestamps();
            $t->softDeletes();
            $t->unique(['counter_id', 'barcode']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
