<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;

class DeveloperHelper
{
    /**
     * Check if the provided password matches developer password
     */
    public static function isDeveloperPassword(string $password): bool
    {
        $devPassword = Config::get('developer.password');
        return Hash::check($password, Hash::make($devPassword)) || $password === $devPassword;
    }
    
    /**
     * Set developer mode in session
     */
    public static function setDeveloperMode(bool $isDeveloper = true): void
    {
        Session::put(Config::get('developer.session_key'), $isDeveloper);
    }
    
    /**
     * Check if current user is in developer mode
     */
    public static function isDeveloperMode(): bool
    {
        return Session::get(Config::get('developer.session_key'), false);
    }
    
    /**
     * Clear developer mode
     */
    public static function clearDeveloperMode(): void
    {
        Session::forget(Config::get('developer.session_key'));
    }
}