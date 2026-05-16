<?php

use App\Helpers\SoftDeleteMarker;
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
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name', 10);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            
            // Audit fields
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();

            // Standard Laravel soft deletes
            $table->softDeletes();
            $table->timestamps();

            // Because MySQL doesn't support partial unique indexes
            $table->datetime('delete_flag')->nullable()->storedAs(SoftDeleteMarker::sql())->index();

            // Unique constraint on name where delete_flag is null
            $table->unique(['name', 'delete_flag']);
        });

        // Add a comment to explain the magic date
        DB::statement("ALTER TABLE branches COMMENT = '" . SoftDeleteMarker::getTableComment() . "'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
