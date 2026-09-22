<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $t) {
            $t->string('theme_rail_color', 7)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $t) {
            $t->dropColumn('theme_rail_color');
        });
    }
};
