<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Gebruik UUID als primary key

            $table->uuid('user_id');
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            $table->string('avatar_url')->nullable();     // Profile picture
            $table->date('birth_date')->nullable();       // Date of birth
            $table->string('country')->nullable();        // Country (ISO code or full name)
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('bio')->nullable();              // Bio

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};