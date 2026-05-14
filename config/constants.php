<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Magic Date for Soft Deletes (MySQL Workaround)
    |--------------------------------------------------------------------------
    |
    | MySQL doesn't support partial unique indexes (WHERE deleted_at IS NULL).
    | This magic date is used in the generated 'is_deleted' column to:
    | - Mark active records with a constant value
    | - Allow unique constraints on (name, is_deleted) to work correctly
    |
    | Active records: is_deleted = ACTIVE_MARKER
    | Deleted records: is_deleted = actual deleted_at timestamp
    |
    */
    'soft_delete_marker' => env('SOFT_DELETE_MARKER', '0000-01-01 00:00:00'),
    
    /*
    |--------------------------------------------------------------------------
    | Pagination Defaults
    |--------------------------------------------------------------------------
    */
    'pagination' => [
        'per_page' => 15,
        'max_per_page' => 100,
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Financial Year Configuration
    |--------------------------------------------------------------------------
    */
    'financial_year' => [
        'start_day' => 1,
        'start_month' => 4, // April
    ],
];