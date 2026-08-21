<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

// First Super Admin only — credentials come from .env so no password ships in code.
class UserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('SEED_ADMIN_EMAIL');
        $password = env('SEED_ADMIN_PASSWORD');

        if (!$email || !$password) {
            $this->command->warn('Super Admin not seeded: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env, then run db:seed again.');
            return;
        }

        $name = env('SEED_ADMIN_NAME', 'Super Admin');

        User::firstOrCreate(['email' => $email], [
            'name' => $name,
            'initials' => mb_strtoupper(mb_substr($name, 0, 2)),
            'staff_id' => 'ADMIN',
            'password' => Hash::make($password),
            'role' => 'Super Admin',
            'active' => true,
            'joined_on' => now()->toDateString(),
        ]);
    }
}
