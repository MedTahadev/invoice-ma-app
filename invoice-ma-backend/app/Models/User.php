<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'profile_photo',
        'credits',
        'dismissed_notifications',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'dismissed_notifications' => 'array',
    ];

    public function companySettings()
    {
        return $this->hasOne(CompanySettings::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    public function isAdmin()
    {
        return $this->email === 'admin@invoice.ma';
    }
}