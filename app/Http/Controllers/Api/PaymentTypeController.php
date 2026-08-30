<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentTypeResource;
use App\Models\PaymentType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentTypeController extends Controller
{
    // savePaymentType — add a payment type.
    public function store(Request $request): PaymentTypeResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:40', Rule::unique('payment_types', 'name')],
        ]);

        $type = PaymentType::create([
            'name' => trim($data['name']),
            'active' => true,
            'sort' => ((int) PaymentType::max('sort')) + 1,
        ]);

        return new PaymentTypeResource($type);
    }

    // savePaymentType — rename or toggle a type; never deleted.
    public function update(Request $request, PaymentType $paymentType): PaymentTypeResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:40', Rule::unique('payment_types', 'name')->ignore($paymentType->id)],
            'active' => ['required', 'boolean'],
        ]);

        $paymentType->update([
            'name' => trim($data['name']),
            'active' => $data['active'],
        ]);

        return new PaymentTypeResource($paymentType);
    }
}
