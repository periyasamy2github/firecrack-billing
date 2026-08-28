<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Who reworked a saved bill, and when — shown as the "Edited" marker in the SPA.
        Schema::table('bills', function (Blueprint $t) {
            $t->timestamp('edited_at')->nullable()->after('reprint_count');
            $t->foreignId('edited_by')->nullable()->after('edited_at')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('bills', function (Blueprint $t) {
            $t->dropConstrainedForeignId('edited_by');
            $t->dropColumn('edited_at');
        });
    }
};
