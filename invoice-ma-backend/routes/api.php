<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AIController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/clients/{clientId}/portal', [ClientController::class, 'portal']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // User data
    Route::get('/data/initial', [UserController::class, 'initialData']);
    Route::patch('/user/profile', [UserController::class, 'profile']);
    Route::patch('/settings', [UserController::class, 'updateSettings']);

    // Invoices
    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::put('/invoices/{id}', [InvoiceController::class, 'update']);
    Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy']);

    // Clients
    Route::post('/clients', [ClientController::class, 'store']);
    Route::put('/clients/{id}', [ClientController::class, 'update']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);

    // AI Service
    Route::post('/generate-ai-content', [AIController::class, 'generate']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/data', [AdminController::class, 'data']);
        Route::post('/admin/theme-settings', [AdminController::class, 'theme']);
        Route::post('/admin/notification', [AdminController::class, 'notification']);
        Route::post('/admin/general-settings', [AdminController::class, 'general']);
        Route::post('/admin/security/password', [AdminController::class, 'changePassword']);
        Route::post('/admin/users/{userId}/credits', [AdminController::class, 'addCredits']);
        Route::post('/admin/users/{userId}/settings', [AdminController::class, 'updateUserSettings']);
        Route::post('/admin/users/{userId}/reset-password', [AdminController::class, 'resetPassword']);
    });
});