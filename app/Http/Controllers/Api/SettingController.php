<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /** saveShop — update the singleton settings row (also reseeds the invoice counter). */
    public function update(Request $request): SettingResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'gstin' => ['nullable', 'string', 'regex:/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/'],
            'invoicePrefix' => ['required', 'string', 'max:40'],
            'nextInvoiceNumber' => ['required', 'integer', 'min:1'],
            'declaration' => ['required', 'string'],
            'seasonTarget' => ['required', 'numeric', 'min:0'],
        ]);

        $setting = Setting::current();
        $setting->update([
            'name' => $data['name'],
            'address' => $data['address'],
            'phone' => $data['phone'],
            'gstin' => $data['gstin'],
            'invoice_prefix' => $data['invoicePrefix'],
            'next_number' => $data['nextInvoiceNumber'],
            'declaration' => $data['declaration'],
            'season_target' => $data['seasonTarget'],
        ]);

        return new SettingResource($setting);
    }
}
