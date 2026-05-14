import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import { FormSelect } from '@/components/custom/select/form-select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';
import { normalizeZodErrors } from '@/lib/utils';
import { login as loginRoute, register } from '@/routes';
import { LoginFormData, loginSchema } from '@/types/form/login';
import { Entity } from '@/types/select';
import { EyeIcon, EyeOff, Loader2, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

type FinancialYear = {
    id: string;
    name: string;
};
type LoginProps = {
    financialYears: FinancialYear[];
    branches: Entity[];
    canResetPassword: boolean;
    canRegister: boolean;
};
let tabIndex = 1;
export default function Login({ financialYears, branches, canResetPassword, canRegister }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm<LoginFormData>({
        financial_year: financialYears[0]?.name || '',
        branch_id: branches.length === 1 ? String(branches[0].id) : '0',
        username: import.meta.env.DEV ? 'Interlink' : '',
        password: import.meta.env.DEV ? 'Interlink' : '',
        remember: true,
    });

    // Auto-focus determination
    const autoFocus = useMemo(() => (branches.length === 1 ? 'username' : 'branch_id'), [branches.length]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Clear previous client-side errors
        form.clearErrors();

        const result = loginSchema.safeParse(form.data);

        // Client Validation
        if (!result.success) {
            const clientErrors = normalizeZodErrors(result.error);

            Object.entries(clientErrors).forEach(([field, message]) => {
                form.setError(field as keyof LoginFormData, message);
            });

            // Show server error toast
            toast.error('Login failed. Please check your credentials.');

            return;
        }

        // Server Submit
        form.post(loginRoute.url(), {
            onFinish: () => form.reset('password'),
        });
    };

    return (
        <AuthLayout title="Login" description="Enter your username and password below to log in">
            <Head title="Log in" />

            <form onSubmit={handleSubmit} className="form-disable">
                <FieldSet className="w-full p-2">
                    {/* Financial Year and Branch Row */}
                    <FieldGroup className="flex flex-col gap-4 md:flex-row">
                        {/* Financial Year Field */}
                        <Field>
                            <FieldLabel htmlFor="financial_year" className="required">
                                Financial Year
                            </FieldLabel>
                            <Select
                                name="financial_year"
                                value={form.data.financial_year}
                                onValueChange={(value) => form.setData('financial_year', value)}
                            >
                                <SelectTrigger
                                    id="financial_year"
                                    tabIndex={tabIndex++}
                                    aria-invalid={!!form.errors.financial_year}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select">{financialYears[0]?.name}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {financialYears.map(({ id, name }) => (
                                            <SelectItem key={id} value={name}>
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {form.errors.financial_year && <FieldError>{form.errors.financial_year}</FieldError>}
                        </Field>

                        {/* Branch Field */}
                        <Field>
                            <FieldLabel htmlFor="branch_id" className="required">
                                Branch
                            </FieldLabel>
                            <FieldContent>
                                <FormSelect
                                    form={form}
                                    field="branch_id"
                                    items={branches}
                                    initial={branches[0] ? { value: String(branches[0].id), label: branches[0].name } : null}
                                    tabIndex={tabIndex++}
                                />
                            </FieldContent>
                            {form.errors.branch_id && <FieldError>{form.errors.branch_id}</FieldError>}
                        </Field>
                    </FieldGroup>

                    {/* Username Field */}
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
                                autoFocus={autoFocus === 'username'}
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
                    {/* Password Field */}
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
                    {/* Remember Me and Forgot Password */}
                    <FieldGroup className="flex-row items-center justify-between">
                        <Field orientation="horizontal" className="w-fit">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={form.data.remember}
                                onCheckedChange={(checked) => form.setData('remember', checked as boolean)}
                                tabIndex={tabIndex++}
                            />
                            <FieldLabel htmlFor="remember">Remember me</FieldLabel>
                        </Field>

                        {canResetPassword && (
                            <Field orientation="horizontal" className="w-fit">
                                <Link href="/forgot-password" className="text-primary text-sm hover:underline" tabIndex={tabIndex++}>
                                    Forgot password?
                                </Link>
                            </Field>
                        )}
                    </FieldGroup>
                    {/* Submit Button */}
                    <Button type="submit" disabled={form.processing} className="w-full" tabIndex={tabIndex++}>
                        {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {form.processing ? 'Logging in...' : 'Log In'}
                    </Button>
                </FieldSet>
            </form>

            {/* Registration Link */}
            {canRegister && (
                <div className="text-muted-foreground pt-4 text-center text-sm">
                    Don't have an account?{' '}
                    <Link href={register.url()} className="text-primary font-medium hover:underline" tabIndex={tabIndex++}>
                        Register
                    </Link>
                </div>
            )}
        </AuthLayout>
    );
}
