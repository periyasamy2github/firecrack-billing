<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CounterResource;
use App\Models\BillCounter;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CounterController extends Controller
{
    public function store(Request $request): CounterResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('counters', 'name')],
            'code' => ['required', 'string', 'alpha_num', 'max:6', Rule::unique('counters', 'code')],
            'nextNumber' => ['nullable', 'integer', 'min:1'],
            'active' => ['required', 'boolean'],
        ]);

        $counter = BillCounter::create([
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'active' => $data['active'],
        ]);
        $counter->next_number = $data['nextNumber'] ?? 1;
        $counter->save();

        return new CounterResource($counter);
    }

    public function update(Request $request, BillCounter $counter): CounterResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('counters', 'name')->ignore($counter->id)],
            'code' => ['required', 'string', 'alpha_num', 'max:6', Rule::unique('counters', 'code')->ignore($counter->id)],
            'nextNumber' => ['nullable', 'integer', 'min:1'],
            'active' => ['required', 'boolean'],
        ]);

        $counter->fill([
            'name' => $data['name'],
            'code' => strtoupper($data['code']),
            'active' => $data['active'],
        ]);
        if (isset($data['nextNumber'])) {
            $counter->next_number = $data['nextNumber'];
        }
        $counter->save();

        return new CounterResource($counter);
    }
}
