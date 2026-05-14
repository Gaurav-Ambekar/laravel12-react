<?php
    namespace App\Services;

    use Illuminate\Support\Facades\Cache;

    class CompanyService {

        /**
         * Get company details from cache or database
         * 
         * @param string|null $code Company code (optional)
         * @return array
         */
        public function getSharedData(?string $code = NULL): array
        {
            $code = $code ?? config('company.code', 'ilc');
            $key = "company_{$code}";

            $company = Cache::rememberForever($key, function () use ($code) {
               $db = null; // DB call goes here
                if($db) return $db;
            });

            return [
                'code' => $company['code'] ?? config('company.fallback.code', 'ILC'),
                'name' => $company['name'] ?? config('company.fallback.name', 'INTERLINK'),
                'logo' => $company['logo'] ?? config('company.fallback.logo', 'https://via.placeholder.com/150'),
            ];
        }
    }