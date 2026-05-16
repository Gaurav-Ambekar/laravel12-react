<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fullname' => ['required', 'string', 'min:3', 'max:255'],
            'email' => ['nullable', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'mobile_no' => ['nullable', 'string', 'regex:/^[0-9]{10}$/'],
            'username' => ['required', 'string', 'min:3', 'max:255', 'unique:'.User::class, 'regex:/^[a-zA-Z0-9_]+$/'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'branch_name' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'fullname.required' => 'Full name is required',
            'fullname.min' => 'Full name must be at least 3 characters',
            'email.email' => 'Invalid email format',
            'email.unique' => 'Email already registered',
            'mobile_no.regex' => 'Mobile number must be exactly 10 digits',
            'username.required' => 'Username is required',
            'username.unique' => 'Username already taken',
            'username.regex' => 'Username can only contain letters, numbers, and underscores',
            'password.required' => 'Password is required',
            'password.confirmed' => 'Passwords do not match',
            'branch_id.required' => 'Branch is required',
            'branch_id.exists' => 'Invalid branch selected',
        ];
    }
}
