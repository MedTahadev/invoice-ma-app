<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function initialData(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'settings' => $user->companySettings,
            'invoices' => $user->invoices()->with(['client', 'items'])->get()->map(function ($invoice) {
                $invoice->customer = $invoice->client;
                return $invoice;
            }),
            'clients' => $user->clients
        ]);
    }

    public function profile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'password' => 'sometimes|string|min:6',
            'profilePhoto' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $data = $request->only(['name', 'profilePhoto']);

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if (isset($data['profilePhoto'])) {
            $data['profile_photo'] = $data['profilePhoto'];
            unset($data['profilePhoto']);
        }

        $user->update($data);

        return response()->json([
            'user' => $user->fresh()
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'logo' => 'sometimes|string',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
            'ice' => 'sometimes|string|max:50',
            'iff' => 'sometimes|string|max:50',
            'rc' => 'sometimes|string|max:100',
            'default_tax_rate' => 'sometimes|numeric|min:0|max:100',
            'default_currency' => 'sometimes|in:MAD,EUR,USD',
            'business_type' => 'sometimes|in:company,auto-entrepreneur',
            'auto_entrepreneur_type' => 'sometimes|in:services,commercial,industrial,artisanal',
            'invoice_number_prefix' => 'sometimes|string|max:50',
            'default_notes' => 'sometimes|string',
            'mail' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $settings = $user->companySettings;
        
        $data = $request->except(['mail']);
        
        if ($request->has('mail')) {
            $data['mail_settings'] = $request->mail;
        }

        $settings->update($data);

        return response()->json($settings->fresh());
    }
}