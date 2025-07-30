<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('logo')->nullable();
            $table->string('email');
            $table->string('phone');
            $table->text('address');
            $table->string('ice');
            $table->string('iff');
            $table->string('rc');
            $table->decimal('default_tax_rate', 5, 2)->default(20.00);
            $table->enum('default_currency', ['MAD', 'EUR', 'USD'])->default('MAD');
            $table->enum('business_type', ['company', 'auto-entrepreneur'])->default('company');
            $table->enum('auto_entrepreneur_type', ['services', 'commercial', 'industrial', 'artisanal'])->nullable();
            $table->string('invoice_number_prefix')->default('INV-{YEAR}-');
            $table->text('default_notes')->nullable();
            $table->json('mail_settings')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};