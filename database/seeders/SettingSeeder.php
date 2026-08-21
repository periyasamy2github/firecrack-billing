<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

// The app needs exactly one shop row; real details are entered on the Settings page.
class SettingSeeder extends Seeder
{
    public function run(): void
    {
        if (Setting::exists()) {
            return;
        }

        Setting::create([
            'name' => 'SparkBill',
            'address' => '',
            'phone' => '',
            'gstin' => '',
            'invoice_prefix' => 'INV/',
            'next_number' => 1,
            'declaration' => 'Goods once sold will not be taken back. Fireworks to be stored and used per PESO safety norms.',
            'season_target' => 1000000,
        ]);
    }
}
