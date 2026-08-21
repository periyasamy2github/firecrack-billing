<?php

namespace Database\Seeders;

use App\Models\BillCounter;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

// Sample counters, logins and products for a dev database only: php artisan db:seed --class=DemoSeeder
class DemoSeeder extends Seeder
{
    private const PASSWORD = '123456';

    // [name, initials, staff id, mobile, email, role, counter, active]
    private const USERS = [
        ['Admin User', 'AU', 'ADMIN', '9000000001', 'admin@gmail.com', 'Super Admin', null, true],
        ['Erode Cashier', 'EC', 'USER', '9000000002', 'user@gmail.com', 'Counter Staff', 'Erode', true],
        ['Chennai Cashier', 'CC', 'MULTI', '9000000003', 'user1@gmail.com', 'Counter Staff', 'Chennai', true],
        ['Jhone Doe', 'JD', 'STAFF', '9000000004', 'user2@gmail.com', 'Counter Staff', 'Kovai', true],
        ['Inactive User', 'IU', 'INACTIVE', '9000000005', 'inactive@gmail.com', 'Counter Staff', 'Erode', false],
    ];

    public function run(): void
    {
        $this->call([SettingSeeder::class, CounterSeeder::class]);

        $counterIds = BillCounter::pluck('id', 'name');

        foreach (self::USERS as [$name, $initials, $staffId, $mobile, $email, $role, $counter, $active]) {
            User::firstOrCreate(['email' => $email], [
                'name' => $name,
                'initials' => $initials,
                'staff_id' => $staffId,
                'mobile' => $mobile,
                'password' => Hash::make(self::PASSWORD),
                'role' => $role,
                'counter_id' => $counter ? $counterIds[$counter] : null,
                'active' => $active,
                'joined_on' => now()->toDateString(),
            ]);
        }

        $this->call(ProductSeeder::class);
    }
}
