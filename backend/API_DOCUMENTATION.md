# Event Rental Management System - Backend API Documentation

## Tech Stack
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 13+
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Pydantic v2

## Project Structure
```
backend/
├── main.py                 # FastAPI app entry point
├── config.py               # Configuration settings
├── database/
│   ├── connection.py       # Database connection
│   └── schema.sql         # SQL schema
├── models/
│   ├── user.py           # User models
│   ├── inventory.py      # Inventory models
│   ├── customers.py      # Customer models
│   ├── orders.py         # Order/Rental models
│   ├── invoices.py       # Invoice models
│   ├── purchases.py      # Purchase models
│   ├── partners.py       # Partner models
│   ├── expenses.py       # Expense models
│   ├── hr.py            # HR models
│   └── notifications.py  # Notification models
├── schemas/
│   ├── user.py           # Pydantic schemas
│   ├── inventory.py
│   ├── customers.py
│   ├── orders.py
│   ├── invoices.py
│   ├── purchases.py
│   ├── partners.py
│   ├── expenses.py
│   ├── hr.py
│   └── notifications.py
├── routers/
│   ├── auth.py           # Authentication endpoints
│   ├── users.py          # User management
│   ├── inventory.py      # Inventory CRUD
│   ├── customers.py      # Customer CRUD
│   ├── orders.py         # Order/Booking management
│   ├── invoices.py       # Invoice management
│   ├── quotations.py     # Quotation management
│   ├── purchases.py      # Purchase management
│   ├── partners.py       # Partner management
│   ├── returns.py        # Return & tally
│   ├── ledger.py        # Customer ledger
│   ├── expenses.py       # Expense management
│   ├── consumables.py    # Consumables & tools
│   ├── hr.py            # HR & salary
│   ├── notifications.py   # Notifications
│   ├── reports.py        # Reporting & analytics
│   └── backups.py       # Backup & restore
├── services/
│   ├── auth.py           # Authentication service
│   ├── inventory.py      # Inventory service
│   ├── orders.py         # Order service
│   ├── ledger.py        # Ledger service
│   ├── notifications.py   # Notification service
│   └── backup.py        # Backup service
└── utils/
    ├── security.py       # Password hashing, JWT
    ├── email.py         # Email utilities
    └── excel.py         # Import/Export utilities
```

## API Endpoints

### Authentication (`/api/auth`)
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - User login
POST   /api/auth/refresh        - Refresh JWT token
POST   /api/auth/logout         - Logout
GET    /api/auth/me             - Get current user info
```

### Users (`/api/users`)
```
GET    /api/users               - List all users (Admin only)
POST   /api/users               - Create new user (Admin only)
GET    /api/users/{id}          - Get user by ID
PUT    /api/users/{id}          - Update user
DELETE /api/users/{id}          - Delete user
PATCH  /api/users/{id}/status   - Activate/deactivate user
```

### Inventory (`/api/inventory`)
```
GET    /api/inventory/categories          - List categories
POST   /api/inventory/categories          - Create category
GET    /api/inventory/locations           - List locations
POST   /api/inventory/locations           - Create location
GET    /api/inventory/items                - List items (with filters)
POST   /api/inventory/items                - Create item
GET    /api/inventory/items/{id}           - Get item by ID
PUT    /api/inventory/items/{id}           - Update item
DELETE /api/inventory/items/{id}           - Delete item
GET    /api/inventory/items/{id}/availability - Check availability for dates
POST   /api/inventory/items/batch           - Batch create items
GET    /api/inventory/low-stock           - Get low stock items
GET    /api/inventory/rentable            - Get rentable items
GET    /api/inventory/consumables         - Get consumables
GET    /api/inventory/tools               - Get tools
GET    /api/inventory/stats                - Inventory statistics
```

### Customers (`/api/customers`)
```
GET    /api/customers            - List customers (with search/filters)
POST   /api/customers            - Create customer
GET    /api/customers/{id}       - Get customer by ID
PUT    /api/customers/{id}       - Update customer
DELETE /api/customers/{id}       - Delete customer
GET    /api/customers/{id}/orders - Get customer orders
GET    /api/customers/{id}/ledger - Get customer ledger
POST   /api/customers/import     - Bulk import from Excel
GET    /api/customers/export     - Export to Excel template
```

### Quotations (`/api/quotations`)
```
GET    /api/quotations           - List quotations
POST   /api/quotations           - Create quotation
GET    /api/quotations/{id}      - Get quotation by ID
PUT    /api/quotations/{id}      - Update quotation
DELETE /api/quotations/{id}      - Delete quotation
POST   /api/quotations/{id}/approve - Approve quotation
POST   /api/quotations/{id}/reject   - Reject quotation
POST   /api/quotations/{id}/convert  - Convert to order
GET    /api/quotations/{id}/items     - Get quotation items
POST   /api/quotations/{id}/items     - Add item to quotation
PUT    /api/quotations/items/{id}       - Update quotation item
DELETE /api/quotations/items/{id}       - Remove item
```

### Orders/Rentals (`/api/orders`)
```
GET    /api/orders               - List orders (with filters)
POST   /api/orders               - Create order
GET    /api/orders/{id}          - Get order by ID
PUT    /api/orders/{id}          - Update order
DELETE /api/orders/{id}          - Delete order
PATCH  /api/orders/{id}/status   - Update order status
POST   /api/orders/{id}/dispatch - Mark as dispatched
POST   /api/orders/{id}/return   - Initiate return
GET    /api/orders/{id}/items   - Get order items
POST   /api/orders/{id}/items   - Add item to order
PUT    /api/orders/items/{id}         - Update order item
DELETE /api/orders/items/{id}         - Remove item
GET    /api/orders/upcoming      - Get upcoming orders
GET    /api/orders/availability  - Check item availability
POST   /api/orders/availability  - Batch availability check
```

### Partners (`/api/partners`)
```
GET    /api/partners            - List partners
POST   /api/partners            - Create partner
GET    /api/partners/{id}       - Get partner by ID
PUT    /api/partners/{id}       - Update partner
DELETE /api/partners/{id}       - Delete partner
GET    /api/partners/{id}/rentals - Get partner rentals
GET    /api/partners/{id}/payables - Get partner payables
POST   /api/partners/{id}/payment - Record partner payment
GET    /api/partners/balances    - Get all partner balances
```

### Purchases (`/api/purchases`)
```
GET    /api/purchases/vendors    - List vendors
POST   /api/purchases/vendors    - Create vendor
GET    /api/purchases/vendors/{id} - Get vendor by ID
PUT    /api/purchases/vendors/{id} - Update vendor
DELETE /api/purchases/vendors/{id} - Delete vendor
GET    /api/purchases            - List purchases
POST   /api/purchases            - Create purchase
GET    /api/purchases/{id}       - Get purchase by ID
GET    /api/purchases/vendor/{id} - Get purchases by vendor
```

### Returns (`/api/returns`)
```
GET    /api/returns              - List returns (pending, in_progress, completed)
POST   /api/returns              - Create return
GET    /api/returns/{id}         - Get return by ID
PUT    /api/returns/{id}         - Update return
POST   /api/returns/{id}/process  - Process return tally
POST   /api/returns/{id}/complete - Complete return
GET    /api/returns/{id}/items   - Get return items
POST   /api/returns/{id}/items   - Add return item
PUT    /api/returns/items/{id}       - Update return item condition
GET    /api/returns/damage      - Get damage records
POST   /api/returns/damage      - Record damage
```

### Invoices (`/api/invoices`)
```
GET    /api/invoices            - List invoices (with filters)
POST   /api/invoices            - Create invoice
GET    /api/invoices/{id}       - Get invoice by ID
PUT    /api/invoices/{id}       - Update invoice
DELETE /api/invoices/{id}       - Delete invoice
POST   /api/invoices/{id}/payment - Record payment
GET    /api/invoices/{id}/items   - Get invoice items
GET    /api/invoices/order/{id} - Get invoices by order
PATCH  /api/invoices/{id}/status   - Update invoice status
GET    /api/invoices/overdue    - Get overdue invoices
GET    /api/invoices/pending    - Get pending invoices
```

### Payments (`/api/payments`)
```
GET    /api/payments            - List payments
POST   /api/payments            - Create payment
GET    /api/payments/{id}       - Get payment by ID
PUT    /api/payments/{id}       - Update payment
DELETE /api/payments/{id}       - Delete payment (with restrictions)
GET    /api/payments/invoice/{id} - Get payments by invoice
```

### Ledger (`/api/ledger`)
```
GET    /api/ledger/customers      - List all customer balances
GET    /api/ledger/customer/{id} - Get customer ledger
POST   /api/ledger/statement      - Generate customer statement
GET    /api/ledger/outstanding   - Get outstanding invoices
GET    /api/ledger/monthly       - Monthly summary
GET    /api/ledger/export         - Export ledger to Excel
```

### Expenses (`/api/expenses`)
```
GET    /api/expenses            - List expenses (with filters)
POST   /api/expenses            - Create expense
GET    /api/expenses/{id}       - Get expense by ID
PUT    /api/expenses/{id}       - Update expense
DELETE /api/expenses/{id}       - Delete expense
GET    /api/expenses/summary    - Expense summary by category
GET    /api/expenses/monthly    - Monthly expense summary
GET    /api/expenses/deductible - Get salary-deductible expenses
```

### Consumables (`/api/consumables`)
```

```

### HR (`/api/hr`)
```
GET    /api/hr/employees          - List employees
POST   /api/hr/employees          - Create employee
GET    /api/hr/employees/{id}     - Get employee by ID
PUT    /api/hr/employees/{id}     - Update employee
DELETE /api/hr/employees/{id}     - Delete employee
PATCH  /api/hr/employees/{id}/status - Activate/deactivate
GET    /api/hr/advances           - List salary advances
POST   /api/hr/advances           - Record advance
GET    /api/hr/salary-process      - List salary processing
POST   /api/hr/salary-process      - Process salary
GET    /api/hr/salary/{id}/slip  - Generate salary slip
GET    /api/hr/employee/{id}/advances - Get employee advances
```

### Notifications (`/api/notifications`)
```
GET    /api/notifications       - List notifications for user
POST   /api/notifications       - Create notification
GET    /api/notifications/{id}  - Get notification by ID
PATCH  /api/notifications/{id}/read - Mark as read
POST   /api/notifications/read-all - Mark all as read
GET    /api/notifications/settings - Get notification settings
PUT    /api/notifications/settings - Update notification settings
POST   /api/notifications/send   - Send notification (system)
```

### Reports (`/api/reports`)
```
GET    /api/reports/revenue      - Revenue reports
GET    /api/reports/rentals      - Rental statistics
GET    /api/reports/items        - Most rented items
GET    /api/reports/customers    - Customer reports
GET    /api/reports/expenses     - Expense reports
GET    /api/reports/ledger       - Ledger reports
GET    /api/reports/inventory    - Inventory reports
GET    /api/reports/employees    - Employee reports
GET    /api/reports/partners     - Partner reports
GET    /api/reports/summary      - Business summary dashboard
GET    /api/reports/export       - Export any report
```

### Settings (`/api/settings`)
```
GET    /api/settings             - Get all settings
GET    /api/settings/{key}      - Get setting by key
PUT    /api/settings/{key}      - Update setting
POST   /api/settings             - Create setting
DELETE /api/settings/{key}      - Delete setting
GET    /api/settings/categories    - Get setting categories
```

### Backups (`/api/backups`)
```
GET    /api/backups              - List backups
POST   /api/backups              - Create backup
POST   /api/backups/full         - Create full backup
POST   /api/backups/selective    - Create selective backup
GET    /api/backups/{id}         - Get backup info
DELETE /api/backups/{id}         - Delete backup
POST   /api/backups/{id}/restore - Restore from backup
GET    /api/backups/download/{id} - Download backup file
```

### Dashboard (`/api/dashboard`)
```
GET    /api/dashboard/stats      - Dashboard statistics
GET    /api/dashboard/notifications - Dashboard notifications
GET    /api/dashboard/upcoming   - Upcoming events
GET    /api/dashboard/overdue    - Overdue items
GET    /api/dashboard/recent     - Recent activity
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100,
      "total_pages": 5
    }
  }
}
```

## Authentication

### JWT Token Format
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Request Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Filters & Search

### Common Query Parameters
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)
- `sort`: Sort field (e.g., `created_at`, `name`)
- `order`: Sort order (`asc`, `desc`)
- `search`: Search term
- `status`: Filter by status
- `date_from`: Start date filter
- `date_to`: End date filter

### Example Request
```
GET /api/orders?page=1&page_size=20&status=active&sort=start_date&order=asc&search=ali
```

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per minute per IP
- Headers returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |
