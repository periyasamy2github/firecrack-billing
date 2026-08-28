<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // How the cashier ENTERED the discount. `discount` stays the applied ₹ used in totals.
        Schema::table('bills', function (Blueprint $t) {
            $t->enum('discount_type', ['percent', 'flat'])->nullable()->after('discount');
            $t->decimal('discount_value', 12, 2)->nullable()->after('discount_type');
        });

        DB::table('bills')->where('discount', '>', 0)->update([
            'discount_type' => 'flat',
            'discount_value' => DB::raw('discount'),
        ]);
    }

    public function down(): void
    {
        Schema::table('bills', function (Blueprint $t) {
            $t->dropColumn(['discount_type', 'discount_value']);
        });
    }
};
