<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureActive
{
    /**
     * Reject requests whose token belongs to a user deactivated mid-session,
     * and revoke that token so it can't be used again.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->active) {
            $user->currentAccessToken()?->delete();

            return response()->json(['message' => 'Session ended'], 401);
        }

        return $next($request);
    }
}
