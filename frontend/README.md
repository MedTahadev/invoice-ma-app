# Invoice.ma - Full-Stack Application Blueprint

## Project Overview

Invoice.ma is a comprehensive invoice management application designed for the Moroccan market. It supports bilingual (French/Arabic) interfaces, local tax and legal requirements (ICE, IF, TVA), and features for both standard companies and auto-entrepreneurs.

This document serves as the technical specification for the backend API required to power the already-built React frontend.

## Frontend Stack

*   **Framework:** React
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **API Communication:** Fetch API

The frontend has been architected to be a "backend-ready" Single Page Application (SPA). It manages its own state and relies on the API specified below as its single source of truth.

---

## Backend API Specification

A backend needs to be created that implements the following API endpoints. All endpoints should be prefixed (e.g., `/api`).

### Authentication

**1. User Registration**
*   **Endpoint:** `POST /register`
*   **Description:** Creates a new user and their default company settings.
*   **Request Body:**
    ```json
    {
      "name": "string",
      "companyName": "string",
      "phone": "string",
      "email": "string",
      "password": "string"
    }
    ```
*   **Success Response (201):**
    ```json
    {
      "user": { /* User Object */ },
      "token": "string"
    }
    ```

**2. User Login**
*   **Endpoint:** `POST /login`
*   **Description:** Authenticates a user and returns a session token.
*   **Request Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
*   **Success Response (200):**
    ```json
    {
      "user": { /* User Object */ },
      "token": "string"
    }
    ```

### Initial Data Fetch

**1. Fetch User Data**
*   **Endpoint:** `GET /data/initial`
*   **Description:** Fetches all necessary data for a logged-in user to start a session.
*   **Authentication:** Required (Token-based).
*   **Success Response (200):**
    ```json
    {
      "settings": { /* CompanySettings Object */ },
      "invoices": [ /* Array of Invoice Objects */ ],
      "clients": [ /* Array of Client Objects */ ]
    }
    ```
    
**2. Fetch Admin Data**
*   **Endpoint:** `GET /admin/data`
*   **Description:** Fetches all data required for the admin panel.
*   **Authentication:** Required (Admin role).
*   **Success Response (200):**
    ```json
    {
      "users": [ /* Array of User Objects */ ],
      "themeSettings": { /* ThemeSettings Object */ },
      "globalNotification": { /* GlobalNotification Object */ },
      "adminGeneralSettings": { /* AdminGeneralSettings Object */ }
    }
    ```

### User Data Management

**1. Update User Profile**
*   **Endpoint:** `PATCH /user/profile`
*   **Description:** Updates the logged-in user's profile information (name, password, photo).
*   **Authentication:** Required.
*   **Success Response (200):**
    ```json
    {
      "user": { /* Updated User Object */ }
    }
    ```

**2. Update Company Settings**
*   **Endpoint:** `PATCH /settings`
*   **Description:** Updates the logged-in user's company settings.
*   **Authentication:** Required.
*   **Success Response (200):** `{ /* Updated CompanySettings Object */ }`

### Invoice Management

*   **Endpoint:** `POST /invoices`
*   **Description:** Creates a new invoice for the user. The backend should handle credit deduction.
*   **Success Response (201):** `{ /* New Invoice Object */ }`

*   **Endpoint:** `PUT /invoices/{id}`
*   **Description:** Updates an existing invoice. The backend should handle the pay-per-edit logic.
*   **Success Response (200):** `{ /* Updated Invoice Object */ }`

*   **Endpoint:** `DELETE /invoices/{id}`
*   **Description:** Deletes an invoice.
*   **Success Response (204):** No Content.

### Client Management

*   **Endpoint:** `POST /clients`
*   **Description:** Creates a new client for the user.
*   **Success Response (201):** `{ /* New Client Object */ }`

*   **Endpoint:** `PUT /clients/{id}`
*   **Description:** Updates an existing client.
*   **Success Response (200):** `{ /* Updated Client Object */ }`

*   **Endpoint:** `DELETE /clients/{id}`
*   **Description:** Deletes a client.
*   **Success Response (204):** No Content.

*   **Endpoint:** `GET /clients/{id}/portal`
*   **Description:** Retrieves all necessary data for the public client portal.
*   **Authentication:** This should be a publicly accessible endpoint, but perhaps using a signed/temporary URL for security.
*   **Success Response (200):** `{ /* ClientPortalData Object */ }`

### AI Service Proxy (Security)

**1. Generate AI Content**
*   **Endpoint:** `POST /generate-ai-content`
*   **Description:** Acts as a secure proxy to the Google Gemini API. This endpoint receives the prompt from the frontend, adds the secret API key on the server, calls the Google API, and returns the result. **The Gemini API key must never leave the backend.**
*   **Authentication:** Required.
*   **Request Body:**
    ```json
    {
      "type": "generate_description | generate_email",
      // ... other relevant data like itemName or invoice object
      "language": "fr | ar"
    }
    ```
*   **Success Response (200):**
    ```json
    {
      "text": "Generated text..." 
      // or { "subject": "...", "body": "..." } for emails
    }
    ```

### Admin Panel Management

*   **Endpoint:** `POST /admin/theme-settings` -> Updates `ThemeSettings`.
*   **Endpoint:** `POST /admin/notification` -> Updates `GlobalNotification`.
*   **Endpoint:** `POST /admin/general-settings` -> Updates `AdminGeneralSettings`.
*   **Endpoint:** `POST /admin/security/password` -> Updates the admin's password.
*   **Endpoint:** `POST /admin/users/{userId}/credits` -> Adds credits to a user.
*   **Endpoint:** `POST /admin/users/{userId}/settings` -> Updates a specific user's `CompanySettings`.
*   **Endpoint:** `POST /admin/users/{userId}/reset-password` -> Resets a user's password.

---

## Database Schema Guidance

The database should contain the following tables. The `types.ts` file is the source of truth for all fields.

**`users` table**
*   id, name, email, phone, password_hash, profile_photo_path, credits

**`company_settings` table**
*   id, user_id (foreign key), name, logo_path, email, phone, address, ice, iff, rc, default_tax_rate, default_currency, business_type, auto_entrepreneur_type, invoice_number_prefix, default_notes, mail_settings (as JSON or separate columns)

**`clients` table**
*   id, user_id (foreign key), name, email, phone, address, cin, ice

**`invoices` table**
*   id, user_id (foreign key), client_id (foreign key), invoice_number, issue_date, due_date, status, currency, notes, sub_total, tax_amount, total, edit_count, payment_date

**`invoice_items` table**
*   id, invoice_id (foreign key), description, quantity, price, tax_rate

**Global Settings Tables**
*   A table (or key-value store) to hold `ThemeSettings`, `GlobalNotification`, and `AdminGeneralSettings`.

---

## Required Environment Variables (for Backend)

The backend's environment variable file (e.g., a `.env` file) will need to include:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=invoice_ma
DB_USERNAME=root
DB_PASSWORD=

# Gemini API Key (Must be kept secret on the server)
GEMINI_API_KEY="your-google-gemini-api-key"

# A unique, random string for application encryption
APP_KEY=
```
