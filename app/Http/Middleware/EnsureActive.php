<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActive
{
    // Rejects and revokes the token of a user deactivated mid-session.
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->active) {
            $user->currentAccessToken()?->delete();

            return response()->json(['message' => 'You have been signed out. Sign in again.'], 401);
        }

        return $next($request);
    }
}
