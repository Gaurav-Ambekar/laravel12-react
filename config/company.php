<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Company Code
    |--------------------------------------------------------------------------
    */
    'code' => env('COMPANY_CODE', 'ILC'),
    
    /*
    |--------------------------------------------------------------------------
    | Fallback Company Details (used when no company in database)
    |--------------------------------------------------------------------------
    */
    'fallback' => [
        'code' => env('COMPANY_CODE', 'ILC'),
        'name' => env('COMPANY_NAME', 'INTERLINK'),
        'logo' => env('COMPANY_LOGO', 'https://via.placeholder.com/150'),
    ],
];