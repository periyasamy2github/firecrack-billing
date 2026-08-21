<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('counters', function (Blueprint $t) {
            $t->id();
            $t->string('name')->unique();
            $t->boolean('active')->default(true);
            $t->timestamps();
        });

        // users is created before this table, so its counter link is wired up here.
        Schema::table('users', function (Blueprint $t) {
            $t->foreign('counter_id')->references('id')->on('counters')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->dropForeign(['counter_id']);
        });

        Schema::dropIfExists('counters');
    }
};
