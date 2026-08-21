<?php

namespace Database\Seeders;

use App\Models\BillCounter;
use Illuminate\Database\Seeder;

class CounterSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Erode', 'Chennai', 'Kovai'] as $name) {
            BillCounter::firstOrCreate(['name' => $name], ['active' => true]);
        }
    }
}
