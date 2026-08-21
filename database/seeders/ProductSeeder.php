<?php

namespace Database\Seeders;

use App\Models\BillCounter;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    // Each counter sells its own range, so no barcode is shared between them.
    private const CATALOGUE = [
        'Erode' => [
            ['SPK-15', 'Sparklers 15cm (10 pkt)', 'Sparklers', 'packet', 110, 33, 80],
            ['SPK-30', 'Sparklers 30cm (10 pkt)', 'Sparklers', 'packet', 180, 54, 60],
            ['SPK-COL', 'Colour Sparklers (10 pkt)', 'Sparklers', 'packet', 150, 52, 45],
            ['FLP-05', '5cm Flower Pot', 'Flower Pots', 'box of 10', 220, 48, 90],
            ['FLP-07', '7cm Flower Pot Special', 'Flower Pots', 'box of 10', 350, 70, 70],
            ['CHK-BIG', 'Ground Chakkar Big (10 pcs)', 'Chakkar', 'box', 260, 62, 55],
        ],
        'Chennai' => [
            ['RKT-STD', 'Standard Rocket (10 pcs)', 'Rockets', 'box', 240, 58, 70],
            ['RKT-WHS', 'Whistling Rocket (10 pcs)', 'Rockets', 'box', 300, 74, 50],
            ['SKY-10', 'Sky Shot 10 Shots', 'Rockets', 'box', 450, 99, 40],
            ['BMB-KUR', 'Kuruvi Bomb (100 pcs)', 'Bombs', 'box', 190, 45, 100],
            ['BMB-ATM', 'Atom Bomb (10 pcs)', 'Bombs', 'box', 320, 78, 60],
            ['BMB-LAX', 'Laxmi Bomb (10 pcs)', 'Bombs', 'box', 280, 66, 65],
        ],
        'Kovai' => [
            ['FNC-PEN', 'Pencil Fancy (5 pcs)', 'Fancy', 'packet', 210, 52, 60],
            ['FNC-TWL', 'Twinkling Star (10 pcs)', 'Fancy', 'packet', 170, 40, 75],
            ['FNC-BUT', 'Butterfly Fancy (5 pcs)', 'Fancy', 'packet', 230, 56, 50],
            ['GFT-101', 'Gift Box 101 Items', 'Gift Boxes', 'box', 1800, 720, 25],
            ['GFT-051', 'Gift Box 51 Items', 'Gift Boxes', 'box', 1100, 440, 30],
            ['GFT-KID', 'Kids Special Gift Box', 'Gift Boxes', 'box', 850, 340, 35],
        ],
    ];

    public function run(): void
    {
        foreach (self::CATALOGUE as $counterName => $products) {
            $counter = BillCounter::where('name', $counterName)->first();

            if (! $counter) {
                $this->command->warn("Counter {$counterName} is missing — skipped its products.");

                continue;
            }

            foreach ($products as [$barcode, $name, $category, $unit, $mrp, $rate, $stock]) {
                // Keyed on counter + barcode, so re-running tops the catalogue up instead of duplicating.
                Product::withTrashed()->updateOrCreate(
                    ['counter_id' => $counter->id, 'barcode' => $barcode],
                    [
                        'name' => $name,
                        'category' => $category,
                        'hsn' => '3604 90 00',
                        'unit' => $unit,
                        'mrp' => $mrp,
                        'rate' => $rate,
                        'gst_rate' => 18,
                        'stock' => $stock,
                        'reorder_level' => 15,
                        'deleted_at' => null,
                    ],
                );
            }

            $this->command->info("{$counterName}: ".count($products).' products');
        }
    }
}
