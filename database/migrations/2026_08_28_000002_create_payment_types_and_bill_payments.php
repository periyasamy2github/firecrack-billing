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

        Schema::create('bill_payments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('bill_id')->constrained()->cascadeOnDelete();
            $t->foreignId('payment_type_id')->constrained()->restrictOnDelete();
            $t->decimal('amount', 12, 2);
            $t->timestamps();
            $t->index('payment_type_id');
        });

        // The three built-in ways to pay; more can be added from Settings.
        $now = now();
        DB::table('payment_types')->insert([
            ['name' => 'Cash', 'active' => true, 'sort' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'UPI', 'active' => true, 'sort' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Card', 'active' => true, 'sort' => 3, 'created_at' => $now, 'updated_at' => $now],
        ]);

        // Every existing bill paid one way in full — carry that over as a single payment row.
        $typeIds = DB::table('payment_types')->pluck('id', 'name');
        DB::table('bills')->whereNotNull('payment_method')->orderBy('id')
            ->each(function ($bill) use ($typeIds, $now) {
                DB::table('bill_payments')->insert([
                    'bill_id' => $bill->id,
                    'payment_type_id' => $typeIds[$bill->payment_method],
                    'amount' => $bill->grand_total,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            });

        Schema::table('bills', function (Blueprint $t) {
            $t->dropColumn('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('bills', function (Blueprint $t) {
            $t->enum('payment_method', ['Cash', 'UPI', 'Card'])->nullable();
        });

        // Best effort: single-payment bills get their method back; mixed bills stay null.
        DB::table('bill_payments')
            ->join('payment_types', 'payment_types.id', '=', 'bill_payments.payment_type_id')
            ->select('bill_payments.bill_id', 'payment_types.name')
            ->orderBy('bill_payments.bill_id')
            ->get()
            ->groupBy('bill_id')
            ->each(function ($payments, $billId) {
                if ($payments->count() === 1 && in_array($payments->first()->name, ['Cash', 'UPI', 'Card'], true)) {
                    DB::table('bills')->where('id', $billId)->update(['payment_method' => $payments->first()->name]);
                }
            });

        Schema::dropIfExists('bill_payments');
        Schema::dropIfExists('payment_types');
    }
};
