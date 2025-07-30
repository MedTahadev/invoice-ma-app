<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CompanySettings;
use App\Models\GlobalSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@invoice.ma',
            'phone' => '+212 600 000 000',
            'password' => Hash::make('password'),
            'credits' => 999999,
        ]);

        // Create admin company settings
        CompanySettings::create([
            'user_id' => $admin->id,
            'name' => 'Invoice.ma Administration',
            'email' => 'admin@invoice.ma',
            'phone' => '+212 600 000 000',
            'address' => 'Casablanca, Morocco',
            'ice' => '001234567000089',
            'iff' => '12345678',
            'rc' => 'Casablanca 12345',
            'default_tax_rate' => 20.00,
            'default_currency' => 'MAD',
            'business_type' => 'company',
            'invoice_number_prefix' => 'ADM-{YEAR}-',
            'default_notes' => 'Administration Invoice',
            'mail_settings' => [
                'host' => 'smtp.example.com',
                'port' => 587,
                'user' => 'admin@invoice.ma',
                'pass' => '',
                'encryption' => 'tls',
            ],
        ]);

        // Create default global settings
        GlobalSetting::create([
            'key' => 'theme_settings',
            'value' => [
                'primaryColor' => '#4f46e5',
                'logo' => '',
                'favicon' => '',
                'colorMode' => 'system',
                'fontFamily' => 'Poppins',
                'borderRadius' => 'lg',
                'layoutDensity' => 'comfortable',
            ],
        ]);

        GlobalSetting::create([
            'key' => 'global_notification',
            'value' => [
                'id' => 'default-notification',
                'message' => '',
                'isActive' => false,
            ],
        ]);

        GlobalSetting::create([
            'key' => 'admin_general_settings',
            'value' => [
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
            ],
        ]);
    }
}