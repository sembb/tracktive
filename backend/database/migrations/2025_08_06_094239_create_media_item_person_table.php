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
        Schema::create('media_item_person', function (Blueprint $table) {
            $table->uuid('media_item_id');
            $table->uuid('person_id');

            $table->string('role'); // e.g., actor, director, artist
            $table->string('character_name')->nullable(); // for actors
            $table->integer('credit_order')->nullable(); // optional sort order

            $table->timestamps();

            $table->foreign('media_item_id')->references('id')->on('media_items')->onDelete('cascade');
            $table->foreign('person_id')->references('id')->on('people')->onDelete('cascade');

            $table->unique(['media_item_id', 'person_id', 'role']); // optional composite uniqueness
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_item_person');
    }
};
