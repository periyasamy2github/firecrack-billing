<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /** GET /users — every staff member with their counter (admin only). */
    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(User::with('counter')->orderBy('name')->get());
    }

    /** saveUser (new) — create a staff or admin account. */
    public function store(Request $request): UserResource
    {
        $user = User::create($this->toAttributes($this->validateUser($request, null), isCreate: true));

        return new UserResource($user->load('counter'));
    }

    /** saveUser (existing) — edit an account; deactivating it revokes all their tokens. */
    public function update(Request $request, User $user): UserResource
    {
        $user->update($this->toAttributes($this->validateUser($request, $user->id), isCreate: false));

        if ($user->wasChanged('active') && ! $user->active) {
            $user->tokens()->delete(); // deactivation logs the user out everywhere
        }

        return new UserResource($user->load('counter'));
    }

    /** Admin password reset — forces re-login by revoking existing tokens. */
    public function password(Request $request, User $user): Response
    {
        $request->validate(['password' => ['required', 'string', 'min:6']]);
        $user->forceFill(['password' => $request->input('password')])->save();
        $user->tokens()->delete();

        return response()->noContent();
    }

    private function validateUser(Request $request, ?int $id): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'initials' => ['required', 'string', 'max:8'],
            'staffId' => ['required', 'string', 'max:40', Rule::unique('users', 'staff_id')->ignore($id)],
            'mobile' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($id)],
            'password' => [$id ? 'nullable' : 'required', 'string', 'min:6'],
            'role' => ['required', Rule::in(['Super Admin', 'Counter Staff'])],
            'counterId' => ['nullable', 'integer', 'exists:counters,id'],
            'active' => ['required', 'boolean'],
            'joinedOn' => ['nullable', 'date'],
        ];

        // Counter Staff must belong to exactly one counter.
        if ($request->input('role') === 'Counter Staff') {
            $rules['counterId'] = ['required', 'integer', 'exists:counters,id'];
        }

        return $request->validate($rules);
    }

    private function toAttributes(array $data, bool $isCreate): array
    {
        $attrs = [
            'name' => $data['name'],
            'initials' => $data['initials'],
            'staff_id' => $data['staffId'],
            'mobile' => $data['mobile'] ?? null,
            'email' => $data['email'],
            'role' => $data['role'],
            'active' => $data['active'],
            // Super Admins are unscoped (no counter); staff belong to one.
            'counter_id' => $data['role'] === 'Super Admin' ? null : ($data['counterId'] ?? null),
        ];

        if (! empty($data['password'])) {
            $attrs['password'] = $data['password']; // 'hashed' cast on the model hashes it
        }

        if (! empty($data['joinedOn'])) {
            $attrs['joined_on'] = $data['joinedOn'];
        } elseif ($isCreate) {
            $attrs['joined_on'] = now()->toDateString();
        }

        return $attrs;
    }
}
