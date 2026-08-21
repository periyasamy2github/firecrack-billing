<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('address');
            $t->string('phone', 40);
            $t->string('gstin', 15)->nullable();
            $t->string('invoice_prefix', 40);
            $t->unsignedInteger('next_number')->default(1); // invoice counter, locked on bill create
            $t->text('declaration');
            $t->decimal('season_target', 14, 2)->default(0);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
