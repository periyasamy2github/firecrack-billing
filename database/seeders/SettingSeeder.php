<?php

namespace Database\Seeders;

use App\Models\PaymentType;
use App\Models\Setting;
use Illuminate\Database\Seeder;

// Seeds the shop row and the standard payment types; real details are entered on the Settings page.
class SettingSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Cash', 'UPI', 'Card'] as $name) {
            PaymentType::firstOrCreate(['name' => $name], ['active' => true]);
        }

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
