<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\GlobalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function data(Request $request)
    {
        $users = User::with('companySettings')->get();
        
        return response()->json([
            'users' => $users,
            'themeSettings' => GlobalSetting::get('theme_settings', [
                'primaryColor' => '#4f46e5',
                'logo' => '',
                'favicon' => '',
                'colorMode' => 'system',
                'fontFamily' => 'Poppins',
                'borderRadius' => 'lg',
                'layoutDensity' => 'comfortable',
            ]),
            'globalNotification' => GlobalSetting::get('global_notification', [
                'id' => 'default-notification',
                'message' => '',
                'isActive' => false,
            ]),
            'adminGeneralSettings' => GlobalSetting::get('admin_general_settings', [
                'registration' => [
                    'allowRegistration' => true,
                    'initialCredits' => 5,
                ],
                'defaultInvoice' => [
                    'currency' => 'MAD',
                    'taxRate' => 20,
                ],
                'mail' => [
                    'host' => 'smtp.example.com',
                    'port' => 587,
                    'user' => 'user@example.com',
                    'pass' => '',
                    'encryption' => 'tls',
                ],
            ])
        ]);
    }

    public function theme(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'primaryColor' => 'sometimes|string',
            'logo' => 'sometimes|string',
            'favicon' => 'sometimes|string',
            'colorMode' => 'sometimes|in:light,dark,system',
            'fontFamily' => 'sometimes|in:Poppins,Inter,Roboto,Cairo',
            'borderRadius' => 'sometimes|in:none,sm,md,lg',
            'layoutDensity' => 'sometimes|in:comfortable,compact',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $currentSettings = GlobalSetting::get('theme_settings', []);
        $newSettings = array_merge($currentSettings, $request->all());
        
        GlobalSetting::set('theme_settings', $newSettings);

        return response()->json($newSettings);
    }

    public function notification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|string',
            'message' => 'required|string',
            'isActive' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $notification = [
            'id' => $request->id,
            'message' => $request->message,
            'isActive' => $request->isActive,
        ];

        GlobalSetting::set('global_notification', $notification);

        return response()->json($notification);
    }

    public function general(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'registration.allowRegistration' => 'required|boolean',
            'registration.initialCredits' => 'required|integer|min:0',
            'defaultInvoice.currency' => 'required|in:MAD,EUR,USD',
            'defaultInvoice.taxRate' => 'required|numeric|min:0|max:100',
            'mail.host' => 'required|string',
            'mail.port' => 'required|integer',
            'mail.user' => 'required|string',
            'mail.pass' => 'sometimes|string',
            'mail.encryption' => 'required|in:none,ssl,tls',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        GlobalSetting::set('admin_general_settings', $request->all());

        return response()->json($request->all());
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin = $request->user();
        $admin->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function addCredits(Request $request, $userId)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->increment('credits', $request->amount);

        return response()->json(['credits' => $user->fresh()->credits]);
    }

    public function updateUserSettings(Request $request, $userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

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
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $settings = $user->companySettings;
        $settings->update($request->all());

        return response()->json($settings->fresh());
    }

    public function resetPassword(Request $request, $userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->update([
            'password' => Hash::make('password123')
        ]);

        return response()->json(['message' => 'Password reset to: password123']);
    }
}