<?php

namespace App\Services;

use App\Models\Master\Branch;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DropDownService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }
    /**
     * Get branches for dropdown/select components
     * @return array|array{id: int, name: string}
     */
    public function branches(): array
    {
        $branches = cache()->remember('branches-dropdown', 3600, function () {
            return Branch::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        });
        
        if (!$branches->isEmpty()) return $branches->toArray();

        return [['id' => 0, 'name' => 'No Active Branch']];
    }

    /**
     * Clear cache
     * @return void
     */
    public function clearCache($table): void
    {
        Cache::forget("$table-dropdown");
    }
}
