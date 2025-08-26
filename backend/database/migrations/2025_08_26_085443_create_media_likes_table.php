<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media_likes', function (Blueprint $table) {
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('media_id')->constrained('media_items')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['user_id', 'media_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_likes');
    }
};
