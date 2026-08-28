<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Widen, move the rows, then narrow — MySQL enums can't rename a value in place.
        DB::statement("ALTER TABLE users MODIFY role ENUM('Super Admin', 'Counter Staff', 'Staff') NOT NULL DEFAULT 'Staff'");
        DB::table('users')->where('role', 'Counter Staff')->update(['role' => 'Staff']);
        DB::statement("ALTER TABLE users MODIFY role ENUM('Super Admin', 'Staff') NOT NULL DEFAULT 'Staff'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('Super Admin', 'Staff', 'Counter Staff') NOT NULL DEFAULT 'Counter Staff'");
        DB::table('users')->where('role', 'Staff')->update(['role' => 'Counter Staff']);
        DB::statement("ALTER TABLE users MODIFY role ENUM('Super Admin', 'Counter Staff') NOT NULL DEFAULT 'Counter Staff'");
    }
};
