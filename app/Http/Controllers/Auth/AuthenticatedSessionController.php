<?php

namespace App\Http\Controllers\Auth;

use App\Helpers\DeveloperHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Master\User;
use App\Services\DropDownService;
use App\Services\FinancialYearService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Summary of __construct
     * @param FinancialYearService $financialYearService
     * @param DropDownService $dropDownService
     */
    public function __construct(
        private FinancialYearService $financialYearService,
        private DropDownService $dropDownService
    ) {}

    /**
     * Show the login page.
     * 
     * @return \Inertia\Response
     * 
     * @throws \Illuminate\Validation\ValidationException
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'financialYears' => $this->financialYearService->getFinancialYears('purchases'),
            'branches' => $this->dropDownService->branches(),
            'canResetPassword' => Route::has('password.request'),
            'canRegister' => !User::where('is_active', true)->whereNull('deleted_at')->exists(),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     * 
     * @throws \Illuminate\Validation\ValidationException
     * 
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        try {
            $request->authenticate();
            $request->session()->regenerate();
            $financialYear = $this->financialYearService->getCurrentFinancialYear(Carbon::now());
            session(['financial_year' => $financialYear, 'is_developer' => DeveloperHelper::isDeveloperMode()]);
            session()->flash('success', 'You have been logged in.');
            return redirect()->intended(route("dashboard", absolute: false));
        } catch (\Throwable $th) {
            return back()->withErrors(['username' => $th->getMessage()]);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
        session()->flash('success', 'You have been logged out.');
        return redirect(route("login", absolute: false));
    }
}
