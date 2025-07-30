# Invoice.ma Backend API

A complete Laravel 11 backend API for the Invoice.ma application - a comprehensive invoice management system for Moroccan businesses.

## Features

- **Authentication & Authorization**: Token-based auth with Laravel Sanctum
- **User Management**: Registration, login, profile management
- **Invoice Management**: Full CRUD with credit-based system
- **Client Management**: Customer database with portal access
- **Admin Panel**: System-wide settings and user management
- **AI Integration**: Secure Google Gemini API proxy
- **Multi-currency Support**: MAD, EUR, USD with exchange rates
- **Moroccan Compliance**: ICE, IF, RC fields and TVA handling

## Installation

1. **Clone and Install Dependencies**
   ```bash
   composer install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

3. **Configure Database**
   Update your `.env` file with database credentials:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=invoice_ma
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Configure Google Gemini API**
   Add your Gemini API key to `.env`:
   ```
   GEMINI_API_KEY=your-google-gemini-api-key-here
   ```

5. **Run Migrations and Seeders**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Start the Server**
   ```bash
   php artisan serve
   ```

## Default Admin Account

- **Email**: admin@invoice.ma
- **Password**: password

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout (auth required)

### User Data
- `GET /api/data/initial` - Get user's initial data (auth required)
- `PATCH /api/user/profile` - Update user profile (auth required)
- `PATCH /api/settings` - Update company settings (auth required)

### Invoices
- `POST /api/invoices` - Create invoice (auth required, costs 1 credit)
- `PUT /api/invoices/{id}` - Update invoice (auth required, may cost 1 credit)
- `DELETE /api/invoices/{id}` - Delete invoice (auth required)

### Clients
- `POST /api/clients` - Create client (auth required)
- `PUT /api/clients/{id}` - Update client (auth required)
- `DELETE /api/clients/{id}` - Delete client (auth required)
- `GET /api/clients/{id}/portal` - Public client portal (no auth)

### AI Service
- `POST /api/generate-ai-content` - Generate AI content (auth required)

### Admin Routes (admin@invoice.ma only)
- `GET /api/admin/data` - Get all admin data
- `POST /api/admin/theme-settings` - Update theme settings
- `POST /api/admin/notification` - Update global notification
- `POST /api/admin/general-settings` - Update general settings
- `POST /api/admin/security/password` - Change admin password
- `POST /api/admin/users/{id}/credits` - Add credits to user
- `POST /api/admin/users/{id}/settings` - Update user settings
- `POST /api/admin/users/{id}/reset-password` - Reset user password

## Business Logic

### Credit System
- New users get 5 credits by default (configurable by admin)
- Creating an invoice costs 1 credit
- First edit of an invoice is free, subsequent edits cost 1 credit each
- Insufficient credits prevent invoice creation/editing

### Invoice Numbering
- Invoice numbers must be unique per user
- Configurable prefix format (e.g., "INV-{YEAR}-")

### User Scoping
- All user data (invoices, clients, settings) is scoped to the authenticated user
- Users cannot access other users' data

### Admin Features
- System-wide theme customization
- Global notifications
- User management and credit allocation
- Registration control

## Database Schema

### Core Tables
- `users` - User accounts and credits
- `company_settings` - Per-user company information
- `clients` - Customer database
- `invoices` - Invoice records
- `invoice_items` - Invoice line items
- `global_settings` - System-wide configuration

### Key Relationships
- User hasOne CompanySettings
- User hasMany Invoices, Clients
- Invoice belongsTo User, Client
- Invoice hasMany InvoiceItems

## Security Features

- Laravel Sanctum token authentication
- Admin-only middleware for sensitive operations
- User data scoping and isolation
- Secure AI API proxy (API key never exposed)
- Input validation on all endpoints
- CORS configuration for frontend integration

## Configuration

The application uses environment variables for configuration:
- Database connection settings
- Google Gemini API key
- Application settings
- CORS origins for frontend integration

## Development

The API is designed to work seamlessly with the provided React frontend. All endpoints follow RESTful conventions and return consistent JSON responses.

For development, ensure your frontend is running on `http://localhost:3000` or update the CORS configuration accordingly.