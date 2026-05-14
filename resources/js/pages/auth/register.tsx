import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import { FormSelect } from '@/components/custom/select/form-select';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import AuthLayout from '@/layouts/auth-layout';
import { normalizeZodErrors } from '@/lib/utils';
import { register as registerRoute } from '@/routes';
import { RegisterFormData, RegisterSchema } from '@/types/form/register';
import { Entity } from '@/types/select';
import { Check, EyeIcon, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { toast } from 'sonner';

let tabIndex = 1;
export default function Register({ branches }: { branches: Entity[] }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<RegisterFormData>({
        fullname: 'Gaurav Ambekar',
        mobile_no: '9722229533',
        email: 'gaurav.interlink@gmail.com',
        username: 'Interlink',
        password: 'Interlink',
        password_confirmation: 'Interlink',
        branch_id: '',
        branch_name: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(registerRoute.url(), {
            onFinish: () => form.reset('password', 'password_confirmation'),
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Clear previous client-side errors
        form.clearErrors();

        const result = RegisterSchema.safeParse(form.data);

        // Client Validation
        if (!result.success) {
            const clientErrors = normalizeZodErrors(result.error);

            Object.entries(clientErrors).forEach(([field, message]) => {
                form.setError(field as keyof RegisterFormData, message);
            });

            // Show server error toast
            toast.error('Registration failed. Please check your details.', {
                duration: 5000,
                position: 'top-right',
            });

            return;
        }

        // Server Submit
        form.post(registerRoute.url(), {
            onSuccess: () => {
                form.reset('password', 'password_confirmation');
            },
            onError: ({ error }: { error?: string }) => {
                toast.error(error || 'Registration failed. Please try again.');
            },
        });
    };

    return (
        <AuthLayout title="Register" description="Create a new account">
            <Head title="Register" />
            <form onSubmit={handleSubmit} className="form-disable">
                <FieldSet className="w-full p-2">
                    {/* Name*/}
                    <Field>
                        <FieldLabel htmlFor="fullname" className="required">
                            Fullname
                        </FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id="fullname"
                                name="fullname"
                                value={form.data.fullname}
                                onChange={(e) => {
                                    form.setData('fullname', e.target.value);
                                    form.clearErrors('fullname');
                                }}
                                placeholder="Enter your fullname"
                                autoComplete="fullname"
                                tabIndex={tabIndex++}
                                aria-invalid={!!form.errors.fullname}
                                autoFocus
                            />
                            <InputGroupAddon align="inline-start">
                                <User className="text-muted-foreground h-4 w-4" />
                            </InputGroupAddon>
                        </InputGroup>
                        {form.errors.fullname && <FieldError>{form.errors.fullname}</FieldError>}
                    </Field>

                    {/* Mobile No & Email */}
                    <FieldGroup className="flex flex-col gap-4 md:flex-row">
                        {/* Mobile No */}
                        <Field>
                            <FieldLabel htmlFor="mobile_no">Mobile no</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="mobile_no"
                                    name="mobile_no"
                                    value={form.data.mobile_no}
                                    onChange={(e) => {
                                        form.setData('mobile_no', e.target.value);
                                        form.clearErrors('mobile_no');
                                    }}
                                    placeholder="Enter your mobile no"
                                    autoComplete="mobile_no"
                                    tabIndex={tabIndex++}
                                    aria-invalid={!!form.errors.mobile_no}
                                />
                                <InputGroupAddon align="inline-start">
                                    <Phone className="text-muted-foreground h-4 w-4" />
                                    +91
                                </InputGroupAddon>
                                <InputGroupAddon align="inline-end">
                                    {form.data.mobile_no?.length == 10 ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        `10 / ${form.data.mobile_no?.length}`
                                    )}
                                </InputGroupAddon>
                            </InputGroup>
                            {form.errors.mobile_no && <FieldError>{form.errors.mobile_no}</FieldError>}
                        </Field>

                        {/* Email */}
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="email"
                                    name="email"
                                    value={form.data.email}
                                    onChange={(e) => {
                                        form.setData('email', e.target.value);
                                        form.clearErrors('email');
                                    }}
                                    placeholder="Enter your email address"
                                    autoComplete="email"
                                    tabIndex={tabIndex++}
                                    aria-invalid={!!form.errors.email}
                                />
                                <InputGroupAddon align="inline-start">
                                    <Mail className="text-muted-foreground h-4 w-4" />
                                </InputGroupAddon>
                            </InputGroup>
                            {form.errors.email && <FieldError>{form.errors.email}</FieldError>}
                        </Field>
                    </FieldGroup>

                    {/*Branch & Username */}
                    <FieldGroup className="flex flex-col gap-4 md:flex-row">
                        {/* Branch */}
                        <Field>
                            <FieldLabel htmlFor="branch_id" className="required">
                                Branch
                            </FieldLabel>
                            {branches.length === 1 ? (
                                <FormSelect form={form} field="branch_id" newField="branch_name" items={branches} tabIndex={tabIndex++} creatable />
                            ) : (
                                <FormSelect form={form} field="branch_id" items={branches} tabIndex={tabIndex++} />
                            )}

                            {form.errors.branch_id && <FieldError>{form.errors.branch_id}</FieldError>}
                        </Field>

                        {/* Username */}
                        {/* Name*/}
                        <Field>
                            <FieldLabel htmlFor="username" className="required">
                                Username
                            </FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="username"
                                    name="username"
                                    value={form.data.username}
                                    onChange={(e) => {
                                        form.setData('username', e.target.value);
                                        form.clearErrors('username');
                                    }}
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    tabIndex={tabIndex++}
                                    aria-invalid={!!form.errors.username}
                                />
                                <InputGroupAddon align="inline-start">
                                    <User className="text-muted-foreground h-4 w-4" />
                                </InputGroupAddon>
                            </InputGroup>
                            {form.errors.username && <FieldError>{form.errors.username}</FieldError>}
                        </Field>
                    </FieldGroup>

                    {/* Password & Confirm Password */}
                    <FieldGroup className="flex flex-col gap-4 md:flex-row">
                        {/* Password */}
                        <Field>
                            <FieldLabel htmlFor="password" className="required">
                                Password
                            </FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="password"
                                    name="password"
                                    value={form.data.password}
                                    onChange={(e) => {
                                        form.setData('password', e.target.value);
                                        form.clearErrors('password');
                                    }}
                                    placeholder="Enter your password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    tabIndex={tabIndex++}
                                    aria-invalid={!!form.errors.password}
                                />
                                <InputGroupAddon align="inline-start">
                                    <Lock className="text-muted-foreground h-4 w-4" />
                                </InputGroupAddon>
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        type="button"
                                        size="icon-xs"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        tabIndex={tabIndex++}
                                    >
                                        {showPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                            {form.errors.password && <FieldError>{form.errors.password}</FieldError>}
                        </Field>

                        {/* Confirm Password */}
                        <Field>
                            <FieldLabel htmlFor="password_confirmation" className="required">
                                Confirm Password
                            </FieldLabel>
                            <InputGroup>
                                <InputGroupInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={form.data.password_confirmation}
                                    onChange={(e) => {
                                        form.setData('password_confirmation', e.target.value);
                                        form.clearErrors('password_confirmation');
                                    }}
                                    placeholder="Enter your confirm password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    tabIndex={tabIndex++}
                                    aria-invalid={!!form.errors.password_confirmation}
                                />
                                <InputGroupAddon align="inline-start">
                                    <Lock className="text-muted-foreground h-4 w-4" />
                                </InputGroupAddon>
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        type="button"
                                        size="icon-xs"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        tabIndex={tabIndex++}
                                    >
                                        {showConfirmPassword ? <EyeIcon className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                            {form.errors.password_confirmation && <FieldError>{form.errors.password_confirmation}</FieldError>}
                        </Field>
                    </FieldGroup>

                    {/* Submit Button */}
                    <Button type="submit" disabled={form.processing} className="w-full" tabIndex={tabIndex++}>
                        {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {form.processing ? 'Registering...' : 'Register'}
                    </Button>
                </FieldSet>
            </form>
        </AuthLayout>
    );
}
