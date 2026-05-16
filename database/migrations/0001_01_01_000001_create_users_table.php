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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('mobile_no', 20)->nullable();
            $table->string('email')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('username');
            $table->string('password');
            $table->unsignedBigInteger('branch_id')->index();
            $table->string('avatar')->nullable();
            $table->rememberToken();
            $table->boolean('is_active')->default(true);
            
            // Audit fields
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();

            // Standard Laravel soft deletes
            $table->softDeletes();
            $table->timestamps();

             // Because MySQL doesn't support partial unique indexes
            $table->datetime('is_deleted')->nullable()->storedAs(SoftDeleteMarker::sql())->index();

            // Unique constraint on username
            $table->unique(['username']);

            // Foreign key constraint
            $table->foreign('branch_id')->references('id')->on('branches');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

         // Add a comment to explain the magic date
        DB::statement("ALTER TABLE users COMMENT = '" . SoftDeleteMarker::getTableComment() . "'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
