<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialYearService
{
    /**
     * Financial year start month and day
     */
    private const FY_START_DAY = 1;
    private const FY_START_MONTH = 4;

    /**
     * The actual financial year value
     */
    private string $start_day;
    private string $start_month;

    public function __construct()
    {
        // Load from config if available, otherwise use default
        $this->start_day = config('constants.financial_year.start_day', self::FY_START_DAY);
        $this->start_month = config('constants.financial_year.start_month', self::FY_START_MONTH);
    }

    /**
     * Get financial years for dropdown
     *
     * @param string|null $tableName Table name to check for oldest record (e.g., 'purchases')
     * @return array
     */
    public function getFinancialYears(?string $tableName = null): array
    {
        $today = Carbon::today();
        $currentFY = $this->getCurrentFinancialYear($today);
        
        // If table name is provided, check for oldest record
        if ($tableName && $this->tableExists($tableName)) {
            $oldestYear = $this->getOldestFinancialYear($tableName);
            
            if ($oldestYear) {
                return $this->generateFinancialYearRange($oldestYear, $currentFY);
            }
        }
        
        // If no data or table doesn't exist, return only current financial year
        return [
            [
                'id' => $currentFY,
                'name' => $currentFY
            ]
        ];
    }

    /**
     * Get current financial year based on date
     *
     * @param Carbon $date
     * @return string
     */
    public function getCurrentFinancialYear(Carbon $date): string
    {
        $year = $date->year;
        $fyStartDate = Carbon::create($year, $this->start_month, $this->start_day);
        
        if ($date->lessThan($fyStartDate)) {
            // Before April 1st - use previous year
            $startYear = $year - 1;
            $endYear = $year;
        } else {
            // On or after April 1st - use current year
            $startYear = $year;
            $endYear = $year + 1;
        }
        
        return "{$startYear}-{$endYear}";
    }

    /**
     * Check if table exists
     *
     * @param string $tableName
     * @return bool
     */
    private function tableExists(string $tableName): bool
    {
        return DB::getSchemaBuilder()->hasTable($tableName);
    }

    /**
     * Get oldest financial year from a table
     *
     * @param string $tableName
     * @return string|null
     */
    private function getOldestFinancialYear(string $tableName): ?string
    {
        $oldestRecord = DB::table($tableName)
            ->orderBy('created_at', 'asc')
            ->first();
        
        if (!$oldestRecord) {
            return null;
        }
        
        $oldestDate = Carbon::parse($oldestRecord->created_at);
        return $this->getCurrentFinancialYear($oldestDate);
    }

    /**
     * Generate financial year range from oldest to current
     *
     * @param string $oldestFY
     * @param string $currentFY
     * @return array
     */
    private function generateFinancialYearRange(string $oldestFY, string $currentFY): array
    {
        $years = [];
        
        [$oldestStart] = explode('-', $oldestFY);
        [$currentStart] = explode('-', $currentFY);
        
        // Generate from current (latest) to oldest (descending order)
        for ($year = (int)$currentStart; $year >= (int)$oldestStart; $year--) {
            $fy = "{$year}-" . ($year + 1);
            $years[] = [
                'id' => $fy,
                'name' => $fy
            ];
        }
        
        return $years;
    }
}