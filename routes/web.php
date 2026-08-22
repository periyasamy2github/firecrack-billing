<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

// No shell on shared hosting — open /optimize after a deploy to clear and rebuild the caches.
Route::get('/optimize', function () {
    Artisan::call('optimize:clear');
    Artisan::call('optimize');

    return 'Caches cleared and rebuilt.';
});
