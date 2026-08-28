<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->dropColumn('unit');
            $t->decimal('mrp', 12, 2)->nullable()->change();
        });

        Schema::table('bill_items', function (Blueprint $t) {
            $t->dropColumn('unit');
            $t->decimal('mrp', 12, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->string('unit', 40)->default('');
            $t->decimal('mrp', 12, 2)->nullable(false)->change();
        });

        Schema::table('bill_items', function (Blueprint $t) {
            $t->string('unit', 40)->default('');
            $t->decimal('mrp', 12, 2)->nullable(false)->change();
        });
    }
};
