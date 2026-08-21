<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

// Production seed: the shop row and the first Super Admin. Sample data lives in DemoSeeder.
class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            SettingSeeder::class,
            UserSeeder::class,
        ]);
    }
}
