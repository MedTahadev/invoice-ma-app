<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AIController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/data/initial', [UserController::class, 'initialData']);
    Route::patch('/user/profile', [UserController::class, 'profile']);
    Route::patch('/settings', [UserController::class, 'updateSettings']);

    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::put('/invoices/{id}', [InvoiceController::class, 'update']);
    Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy']);

    Route::post('/clients', [ClientController::class, 'store']);
    Route::put('/clients/{id}', [ClientController::class, 'update']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);

    Route::post('/generate-ai-content', [AIController::class, 'generate']);

    Route::middleware('admin')->group(function () {
        Route::get('/admin/data', [AdminController::class, 'data']);
        Route::post('/admin/theme-settings', [AdminController::class, 'theme']);
        Route::post('/admin/notification', [AdminController::class, 'notification']);
        Route::post('/admin/general-settings', [AdminController::class, 'general']);
        Route::post('/admin/security/password', [AdminController::class, 'changePassword']);
        Route::post('/admin/users/{id}/credits', [AdminController::class, 'addCredits']);
        Route::post('/admin/users/{id}/settings', [AdminController::class, 'updateUserSettings']);
        Route::post('/admin/users/{id}/reset-password', [AdminController::class, 'resetPassword']);
    });
});

Route::get('/clients/{id}/portal', [ClientController::class, 'portal']);
