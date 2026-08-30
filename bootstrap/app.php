<?php

use App\Http\Middleware\EnsureActive;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php'
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'active' => EnsureActive::class,
            'role' => RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (UniqueConstraintViolationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => 'Could not save. Try again.'], 409);
            }
        });

        // Crashes never leak internals to the app.
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') && ! config('app.debug') && ! $e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface && ! $e instanceof \Illuminate\Validation\ValidationException && ! $e instanceof \Illuminate\Auth\AuthenticationException) {
                return response()->json(['message' => 'Something went wrong. Try again.'], 500);
            }
        });
    })->create();
