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
    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(User::with('counter')->orderBy('name')->get());
    }

    public function store(Request $request): UserResource
    {
        $user = User::create($this->toAttributes($this->validateUser($request, null), isCreate: true));

        return new UserResource($user->load('counter'));
    }

    // Deactivating an account revokes its tokens.
    public function update(Request $request, User $user): UserResource
    {
        $user->update($this->toAttributes($this->validateUser($request, $user->id), isCreate: false));

        if ($user->wasChanged('active') && ! $user->active) {
            $user->tokens()->delete();
        }

        return new UserResource($user->load('counter'));
    }

    // Resets the password and revokes the user's tokens.
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
            'role' => ['required', Rule::in(['Super Admin', 'Staff'])],
            'counterId' => ['nullable', 'integer', 'exists:counters,id'],
            'active' => ['required', 'boolean'],
            'joinedOn' => ['nullable', 'date'],
        ];

        if ($request->input('role') === 'Staff') {
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
            'counter_id' => $data['role'] === 'Super Admin' ? null : ($data['counterId'] ?? null),
        ];

        if (! empty($data['password'])) {
            $attrs['password'] = $data['password'];
        }

        if (! empty($data['joinedOn'])) {
            $attrs['joined_on'] = $data['joinedOn'];
        } elseif ($isCreate) {
            $attrs['joined_on'] = now()->toDateString();
        }

        return $attrs;
    }
}
