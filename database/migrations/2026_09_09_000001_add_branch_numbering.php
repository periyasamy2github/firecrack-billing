<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $t) {
            $t->enum('numbering_mode', ['shop', 'branch'])->default('shop')->after('next_number');
        });

        Schema::table('counters', function (Blueprint $t) {
            $t->string('code', 6)->nullable()->after('name');
            $t->unsignedInteger('next_number')->default(1)->after('code');
        });

        $used = [];
        foreach (DB::table('counters')->orderBy('id')->get() as $counter) {
            $code = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $counter->name) ?: 'BR', 0, 3));
            while (in_array($code, $used, true)) {
                $code = substr($code, 0, 2).count($used);
            }
            $used[] = $code;
            DB::table('counters')->where('id', $counter->id)->update(['code' => $code]);
        }

        Schema::table('counters', function (Blueprint $t) {
            $t->unique('code');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $t) {
            $t->dropColumn('numbering_mode');
        });

        Schema::table('counters', function (Blueprint $t) {
            $t->dropUnique(['code']);
            $t->dropColumn(['code', 'next_number']);
        });
    }
};
