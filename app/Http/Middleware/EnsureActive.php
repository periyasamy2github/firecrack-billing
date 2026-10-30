<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActive
{
    // Rejects and revokes the token of a user deactivated, or whose branch closed, mid-session.
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $branchClosed = $user && ! $user->isSuperAdmin() && $user->counter && ! $user->counter->active;

        if ($user && (! $user->active || $branchClosed)) {
            $user->currentAccessToken()?->delete();

            return response()->json(['message' => 'You have been signed out. Sign in again.'], 401);
        }

        return $next($request);
    }
}
