<?php

namespace App\Helpers;

/**
 * Centralized management of the MySQL soft delete workaround
 * 
 * MySQL doesn't support partial unique indexes (WHERE deleted_at IS NULL).
 * This class provides a single source of truth for the magic date used in
 * the generated 'delete_flag' column.
 * 
 * Active records: delete_flag = ACTIVE_MARKER
 * Deleted records: delete_flag = actual deleted_at timestamp
 */

class SoftDeleteMarker
{
    /**
     * The magic date used for active records
     * Can be overridden via config for different environments
     */
    private const ACTIVE_MARKER = '0000-01-01 00:00:00';

    /**
     * Singleton instance
     */
    private static ?self $instance = null;

    /**
     * The actual marker value
     */
    private string $marker;

    private function __construct()
    {
        // Load from config if available, otherwise use default
        $this->marker = config('constants.soft_delete_marker', self::ACTIVE_MARKER);
    }

    /**
     * Get the singleton instance
     */
    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Get the active marker value
     */
    public static function get(): string
    {
        return self::getInstance()->marker;
    }

    /**
     * Get the SQL expression for the derived column
     */
    public static function sql(): string
    {
        return "IFNULL(deleted_at, '" . self::get() . "')";
    }

    /**
     * Check if a value represents an active record
     */
    public static function isActive(string $value): bool
    {
        return $value === self::get();
    }

    /**
     * Check if a value represents a deleted record
     */
    public static function isDeleted(string $value): bool
    {
        return $value !== self::get();
    }

    /**
     * Get the comment for the table
     */
    public static function getTableComment(): string
    {
        return sprintf(
            'delete_flag uses "%s" for active records to work around MySQL partial unique index limitation. ' .
            'Active records have this value, deleted records have the actual deleted_at timestamp.',
            self::get()
        );
    }
}
