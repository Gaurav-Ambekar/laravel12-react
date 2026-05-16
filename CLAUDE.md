# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Laravel 12 application with React frontend using Inertia.js for server-side rendering. It follows a modular architecture with feature-based organization.

## Common Commands

### PHP/Laravel
- `php artisan serve` - Start development server
- `php artisan migrate` - Run database migrations
- `php artisan db:seed` - Seed database
- `./vendor/bin/pest` - Run tests
- `./vendor/bin/pest --filter=TestName` - Run specific test
- `./vendor/bin/pest tests/Feature/Auth/AuthenticationTest.php` - Run single test file
- `composer pint` - Run PHP code style fixer
- `composer pint --test` - Check PHP code style without fixing

### Frontend/Node
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run lint` - Fix ESLint issues
- `npm run format` - Format code with Prettier

### Full Development Stack
- `composer dev` - Runs PHP server, queue listener, and npm dev concurrently

## Architecture

### Backend (Laravel)
- **Routes**: Defined in `routes/web.php`, `routes/auth.php`, `routes/settings.php`
- **Controllers**: Feature-organized under `app/Http/Controllers/`
  - `Auth/` - Login, registration, password reset, email verification
  - `Settings/` - Profile and password management
  - `Dashboards/` - Dashboard controllers
- **Services**: Business logic in `app/Services/` (CompanyService, BranchService, DropDownService, etc.)
- **Models**: Standard models in `app/Models/`, domain models under `app/Models/Master/`
- **Middleware**: Inertia handling at `app/Http/Middleware/HandleInertiaRequests.php`

### Frontend (React + Inertia)
- **Pages**: Located in `resources/js/pages/`
- **Components**: `resources/js/components/` with UI components in `resources/js/components/ui/`
- **Layouts**: `resources/js/layouts/` (app, auth, settings)
- **Type-safe Actions**: Auto-generated from controllers in `resources/js/actions/`
- **Styling**: Tailwind CSS 4 with custom components using Radix UI primitives

### Database
- MySQL for development (configured in .env)
- SQLite for testing (in-memory)
- Custom soft-delete implementation using `SOFT_DELETE_MARKER` env variable (date-based)

## Configuration

Key environment variables in `.env`:
- `DB_CONNECTION=mysql` - Database driver
- `COMPANY_CODE`, `COMPANY_NAME`, `COMPANY_LOGO` - Company configuration
- `SOFT_DELETE_MARKER="0000-01-01 00:00:00"` - Custom soft delete marker date
- `SESSION_DRIVER=database` - Session storage
- `QUEUE_CONNECTION=database` - Queue driver

## Testing

- Uses Pest PHP for testing
- Feature tests in `tests/Feature/`
- Unit tests in `tests/Unit/`
- Test database uses SQLite in-memory
- Authentication tests verify login, registration, password reset, email verification flows

## Code Style

- PHP: Laravel Pint (PSR-12 based)
- JavaScript/TypeScript: ESLint + Prettier
- Tailwind CSS 4 with `tailwindcss-animate` plugin