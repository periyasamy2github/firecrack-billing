<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CounterResource;
use App\Http\Resources\SettingResource;
use App\Http\Resources\UserResource;
use App\Models\BillCounter;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        if (! $user->active) {
            return response()->json(['message' => 'This account is disabled. Ask an Administrator.'], 403);
        }

        $user->load('counter');

        // A closed counter stops trading, so its staff cannot sign in either.
        if (! $user->isSuperAdmin() && $user->counter && ! $user->counter->active) {
            return response()->json(['message' => 'Your counter is closed. Ask an Administrator.'], 403);
        }

        $token = $user->createToken('spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    // The signed-in user info
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('counter')),
            'shop' => new SettingResource(Setting::current()),
            'counters' => $request->user()->isSuperAdmin() ? CounterResource::collection(BillCounter::orderBy('name')->get()) : [],
        ]);
    }

    // Sign out - revoke only the current device's token.
    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();
        return response()->noContent();
    }
}
