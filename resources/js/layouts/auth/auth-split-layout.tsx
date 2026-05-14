import AppLogoIcon from '@/components/app-logo-icon';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { useCompany } from '@/hooks/use-company';
import loginDarkSvg from '@images/auth/login-dark.svg';
import loginSvg from '@images/auth/login.svg';
import object1Png from '@images/auth/object-1.png';
import object2Png from '@images/auth/object-2.png';
import object3Png from '@images/auth/object-3.png';
import polygonObjectSvg from '@images/auth/polygon-object.svg';
import AuthFooter from '../auth-footer';
interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const company = useCompany();
    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="relative flex items-center justify-center bg-[url('/assets/images/map.png')] bg-cover bg-center bg-no-repeat px-6 py-10 sm:px-16">
                <img src={object1Png} alt="Object 1 Png" className="absolute top-1/2 left-0 h-full max-h-223.25 -translate-y-1/2" />
                <img src={object2Png} alt="Object 2 Png" className="absolute top-0 left-24 h-40 md:left-[30%]" />
                <img src={object3Png} alt="Object 3 Png" className="absolute top-0 right-0 h-75" />
                <img src={polygonObjectSvg} alt="Polygon Object Svg" className="inset-e-[28%] absolute bottom-0" />
                <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-md backdrop-blur-lg lg:flex-row lg:gap-10 xl:gap-0">
                    <div className="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,rgba(239,18,98,1)_0%,rgba(67,97,238,1)_100%)] p-5 lg:inline-flex lg:max-w-208.75 xl:-ms-32 ltr:xl:skew-x-14 rtl:xl:skew-x-[-14deg]">
                        <div className="from-primary/10 absolute inset-y-0 w-8 via-transparent to-transparent xl:w-16 ltr:-right-10 ltr:bg-linear-to-r ltr:xl:-right-20 rtl:-left-10 rtl:bg-linear-to-l rtl:xl:-left-20"></div>
                        <div className="ltr:xl:-skew-x-14 rtl:xl:skew-x-14">
                            <div className="mb-1 flex items-center justify-center gap-2 rounded-md">
                                <AppLogoIcon className="size-9 fill-current text-[var(--foreground)]" />
                                <p className="text-primary text-center text-2xl leading-snug! font-extrabold uppercase md:text-3xl">
                                    {company?.name}
                                </p>
                            </div>
                            <div className="mt-24 hidden w-full max-w-107.5 lg:block">
                                <img src={loginSvg} alt="Light Mode Login Svg" className="h-full w-full object-cover dark:hidden" />
                                <img src={loginDarkSvg} alt="Dark Mode Login Svg" className="hidden h-full w-full object-cover dark:block" />
                            </div>
                        </div>
                    </div>
                    <div className="relative flex w-full flex-col items-center justify-center gap-5">
                        <div className="m-4 ms-auto w-fit">
                            <AppearanceToggleDropdown />
                        </div>
                        <div className="w-full max-w-md px-4 lg:max-w-lg">
                            <div className="mb-5">
                                <h1 className="text-primary text-2xl leading-snug! font-extrabold uppercase md:text-3xl">{title}</h1>
                                <p className="text-base leading-normal font-bold">{description}</p>
                            </div>
                            {children}
                        </div>
                        <AuthFooter />
                    </div>
                </div>
            </div>
        </div>
    );
}
