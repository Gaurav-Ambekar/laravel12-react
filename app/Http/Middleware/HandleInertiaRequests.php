<?php

namespace App\Http\Middleware;

use App\Services\CompanyService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $shared = array_merge(parent::share($request), [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'financial_year' => fn () => $request->session()->get('financial_year'),
                'is_developer' => fn () => $request->session()->get('is_developer'),
            ],
            'company' => fn () => app(CompanyService::class)->getSharedData(),
        ]);

        $success_flash = $request->session()->get('success');
        if($success_flash) $shared['flash'] = ['success' => $success_flash];

        $error_flash = $request->session()->get('error');
        if($error_flash) $shared['flash'] = ['error' => $error_flash];

        return $shared;
    }
}
