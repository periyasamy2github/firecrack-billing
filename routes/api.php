<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\CounterController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', DashboardController::class);

    Route::get('/bills', [BillController::class, 'index']);
    Route::get('/bills/find', [BillController::class, 'show']);
    Route::post('/bills', [BillController::class, 'store']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/bills/cancel', [BillController::class, 'cancel']);
    Route::post('/bills/reprint', [BillController::class, 'reprint']);

    Route::middleware('role:Super Admin')->group(function () {
        Route::put('/shop', [SettingController::class, 'update']);

        Route::post('/counters', [CounterController::class, 'store']);
        Route::put('/counters/{counter}', [CounterController::class, 'update']);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::put('/users/{user}/password', [UserController::class, 'password']);

        Route::post('/products', [ProductController::class, 'store']);
        Route::delete('/products/{code}', [ProductController::class, 'destroy']);
        Route::post('/products/import', [ProductController::class, 'import']);
    });
});
