<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\CompanySettings;
use App\Models\GlobalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'companyName' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if registration is allowed
        $adminSettings = GlobalSetting::get('admin_general_settings', [
            'registration' => ['allowRegistration' => true, 'initialCredits' => 5]
        ]);

        if (!$adminSettings['registration']['allowRegistration']) {
            return response()->json(['message' => 'Registration is currently disabled.'], 403);
        }

        // Check if user already exists
        if (User::where('email', $request->email)->exists()) {
            return response()->json(['message' => 'User already exists.'], 409);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'credits' => $adminSettings['registration']['initialCredits'],
        ]);

        // Create default company settings
        CompanySettings::create([
            'user_id' => $user->id,
            'name' => $request->companyName,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => '123 Business Street, Casablanca, Morocco',
            'ice' => '001234567000089',
            'iff' => '12345678',
            'rc' => 'Casablanca 12345',
            'default_tax_rate' => 20.00,
            'default_currency' => 'MAD',
            'business_type' => 'company',
            'invoice_number_prefix' => 'INV-{YEAR}-',
            'default_notes' => 'Merci pour votre confiance.',
            'mail_settings' => [
                'host' => '',
                'port' => 587,
                'user' => '',
                'pass' => '',
                'encryption' => 'tls',
            ],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}