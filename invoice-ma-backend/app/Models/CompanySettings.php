<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'logo',
        'email',
        'phone',
        'address',
        'ice',
        'iff',
        'rc',
        'default_tax_rate',
        'default_currency',
        'business_type',
        'auto_entrepreneur_type',
        'invoice_number_prefix',
        'default_notes',
        'mail_settings',
    ];

    protected $casts = [
        'mail_settings' => 'array',
        'default_tax_rate' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}