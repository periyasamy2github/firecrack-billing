<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CounterResource;
use App\Models\BillCounter;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CounterController extends Controller
{
    /** saveCounter (new) — create a counter. */
    public function store(Request $request): CounterResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('counters', 'name')],
            'active' => ['required', 'boolean'],
        ]);

        return new CounterResource(BillCounter::create($data));
    }

    /** saveCounter (existing) — rename or activate/deactivate a counter. */
    public function update(Request $request, BillCounter $counter): CounterResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('counters', 'name')->ignore($counter->id)],
            'active' => ['required', 'boolean'],
        ]);

        $counter->update($data);

        return new CounterResource($counter);
    }
}
