<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

// No shell on shared hosting — open /optimize/<OPTIMIZE_KEY> after a deploy to clear and rebuild the caches.
Route::get('/optimize/{key}', function (string $key) {
    $expected = (string) config('app.optimize_key');
    abort_unless($expected !== '' && hash_equals($expected, $key), 404);

    // skips cache:clear, which would also wipe the login rate-limit counters
    Artisan::call('optimize:clear', ['--except' => 'cache']);
    Artisan::call('optimize');

    return 'Caches cleared and rebuilt.';
})->middleware('throttle:5,1');
