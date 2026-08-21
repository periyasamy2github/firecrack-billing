<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Housekeeping — driven by the single Hostinger cron `php artisan schedule:run`.
Schedule::command('sanctum:prune-expired --hours=24')->daily();
Schedule::command('auth:clear-resets')->daily();
