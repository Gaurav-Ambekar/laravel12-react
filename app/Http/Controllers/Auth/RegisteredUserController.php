<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Services\Branchservice;
use App\Services\DropDownService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Summary of __construct
     * @param DropDownService $dropDownService
     */
    public function __construct(
        private readonly DropDownService $dropDownService,
        private readonly Branchservice $branchService,
    ){}
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register', [
            "branches" => $this->dropDownService->branches(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(RegisterRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->fullname,
            'email' => $request->email,
            'mobile_no' => $request->mobile_no,
            'username' => $request->username,
            'password' => $request->password,
            'branch_id' => $request->branch_id,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }
}
