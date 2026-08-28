<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_types', function (Blueprint $t) {
            $t->id();
            $t->string('name', 40)->unique();
            $t->boolean('active')->default(true);
            $t->unsignedInteger('sort')->default(0);
            $t->timestamps();
        });

        // A bill holds one row per type used; a Mixed bill holds several that sum to the total.
        Schema::create('bill_payments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('bill_id')->constrained()->cascadeOnDelete();
            $t->foreignId('payment_type_id')->constrained()->restrictOnDelete();
            $t->decimal('amount', 12, 2);
            $t->timestamps();
            $t->index('payment_type_id');
        });

        // The built-in ways to pay; more can be added from Settings.
        $now = now();
        DB::table('payment_types')->insert([
            ['name' => 'Cash', 'active' => true, 'sort' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'UPI', 'active' => true, 'sort' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Card', 'active' => true, 'sort' => 3, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('bill_payments');
        Schema::dropIfExists('payment_types');
    }
};
