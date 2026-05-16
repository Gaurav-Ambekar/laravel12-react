<?php

namespace App\Http\Requests\Auth;

use App\Models\Master\Branch;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

class RegisterRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fullname' => ['required', 'string', 'min:3', 'max:50'],
 
            'mobile_no' => [
                'nullable',
                'string',
                'regex:/^[0-9]{10}$/',
                'unique:users,mobile_no',
            ],
 
            'email' => [
                'nullable',
                'string',
                'email',
                'max:100',
                'unique:users,email',
            ],
 
            'username' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-zA-Z0-9_]+$/',
                'unique:users,username',
            ],
 
            'password' => [
                'required',
                'string',
                'confirmed',          // expects password_confirmation field
                Password::defaults(),
            ],
 
            // branch_id is either a positive integer (existing branch)
            // or a negative integer (locally created — controller will handle)
            'branch_id' => [
                'required',
                'integer',
                'not_in:0',
            ],
 
            // Only required when branch_id is negative (new branch)
            'branch_name' => [
                'required_if:branch_id,<0',   // custom check handled in withValidator
                'nullable',
                'string',
                'min:2',
                'max:100',
            ],
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
            'fullname.required'    => 'Full name is required.',
            'fullname.min'         => 'Full name must be at least 3 characters.',
            'mobile_no.regex'      => 'Mobile number must be exactly 10 digits.',
            'email.unique'         => 'This email address is already registered.',
            'username.required'    => 'Username is required.',
            'username.unique'      => 'This username is already taken.',
            'username.regex'       => 'Username can only contain letters, numbers, and underscores.',
            'password.confirmed'   => 'Passwords do not match.',
            'branch_id.required'   => 'Please select a branch.',
            'branch_id.not_in'     => 'Please select a valid branch.',
            'branch_name.required_if' => 'Branch name is required when creating a new branch.',
        ];
    }

    /**
     * Additional validation after standard rules pass.
     * Handles the case where branch_id is negative — branch_name must be present.
     * Handles the case where branch_id is positive — branch_id must exist.
     * 
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v) {
            $branchId = (int) $this->input('branch_id', 0);
        
            if ($branchId < 0 && ! $this->filled('branch_name')) {
                $v->errors()->add('branch_id', 'Branch name is required when creating a new branch.');
            }
 
            // If branch_id is positive, verify it actually exists
            if ($branchId > 0) {
                $exists = Branch::where('id', $branchId)->exists();
                if (! $exists) {
                    $v->errors()->add('branch_id', 'The selected branch does not exist.');
                }
            }
        });
    }

    /**
     * Whether the submitted branch_id is a locally-created (not yet persisted) option.
     * 
     * @return bool
     */
    public function isNewBranch(): bool
    {
        return (int) $this->input('branch_id', 0) < 0;
    }

    /**
     * The branch name to create — only relevant when isNewBranch() is true.
     * 
     * @return string
     */
    public function branchName(): string
    {
        return trim((string) $this->input('branch_name', ''));
    }
}
