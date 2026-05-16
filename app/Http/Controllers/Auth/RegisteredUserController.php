<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Master\Branch;
use App\Models\User;
use App\Services\Branchservice;
use App\Services\DropDownService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
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
     * 
     * @return Response
     */
    public function create(): Response
    {
        return Inertia::render('auth/register', [
            "branches" => $this->dropDownService->branches(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     * 
     * @param RegisterRequest $request
     * @return RedirectResponse
     */
    public function store(RegisterRequest $request): RedirectResponse
    {
        try {
            $user = DB::transaction(function () use ($request): User {
                /**
                 * Step 1: resolve branch
                 *  BranchService handles the find-or-create logic cleanly.
                 *  Returns the branch and whether it was just created so we know
                 *  whether to bust the cache and set created_by on the branch.
                 */
                [$branch, $branchWasCreated] = $this->branchService->resolveFromRequest(
                    branchId:   $request->integer('branch_id'),
                    branchName: $request->string('branch_name')->trim()->value(),
                );

                /**
                 * Step 2: create user
                 */
                $user = $this->createUser($request, $branch);

                /**
                 * Step 3: set created_by now that we have the user ID
                 *  Can't do this in one shot at insert time — the ID doesn't exist yet.
                 *  saveQuietly() skips model events for this internal bookkeeping update.
                 */
                $user->created_by = $user->id;
                $user->saveQuietly();

                if ($branchWasCreated) {
                    $branch->created_by = $user->id;
                    $branch->saveQuietly();
 
                    // Bust the dropdown cache so the new branch appears immediately
                    $this->dropDownService->clearCache('branches');
                }

                return $user;
            });
            event(new Registered($user));
            session()->flash('success', 'Account created successfully. You may now log in.');
            return redirect()->route('login');
        } catch (ValidationException $th) {
            // Re-throw as-is — Inertia returns these as field errors
            throw $th;
        } catch (\Throwable $th) {
            Log::error('Registration failed', [
                'error'    => $th->getMessage(),
                'username' => $request->input('username'),
                'ip'       => $request->ip(),
            ]);
 
            throw ValidationException::withMessages([
                'username' => 'Registration failed due to a server error. Please try again.',
            ]);
        }
    }

    /**
     * Build and persist the new user record.
     * Extracted so the store() method reads as a sequence of clear steps.
     * 
     * @param RegisterRequest $request
     * @param Branch $branch
     * @return User
     */
    private function createUser(RegisterRequest $request, Branch $branch): User
    {
        return User::create([
            'name' => $request->string('fullname')->trim()->value(),
            'username' => $request->string('username')->trim()->value(),
            'password'  => $request->string('password')->value(),
            'branch_id' => $branch->id,
            'is_active' => true,
            'mobile_no' => $request->filled('mobile_no')
                            ? $request->string('mobile_no')->trim()->value()
                            : null,
            'email'     => $request->filled('email')
                            ? $request->string('email')->trim()->lower()->value()
                            : null,
        ]);

    }
}
