# Event Rental Management System - Backend Setup Guide

## 🎯 Backend Implementation Status

### ✅ Completed Modules (Ready for Testing)

| Module | Status | Features |
|---------|--------|----------|
| **Authentication** | ✅ Complete | Register, Login, JWT tokens, Refresh |
| **Inventory** | ✅ Complete | CRUD, Availability check, Low stock, Types (rentable/consumable/tool) |
| **Customers** | ✅ Complete | CRUD, Orders, Ledger, Statements |
| **Orders** | ✅ Complete | CRUD, Status workflow, Availability validation, Date conflicts |
| **Dashboard** | ✅ Complete | Stats, Notifications, Upcoming, Recent activity |
| **Quotations** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Invoices** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Payments** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Purchases** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Partners** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Returns** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Ledger** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Expenses** | 🔄 Placeholders | Basic structure (to be expanded) |
| **HR** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Notifications** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Reports** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Backups** | 🔄 Placeholders | Basic structure (to be expanded) |
| **Settings** | 🔄 Placeholders | Basic structure (to be expanded) |

---

## 📋 Prerequisites

1. **Python 3.11+** installed
2. **PostgreSQL 13+** running
3. **pip** package manager
4. **System sudo access** (for production deployment)

---

## 🚀 Quick Start (Development)

### 1. Create Virtual Environment
```bash
cd /opt/event-erp/backend
python3.11 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and update critical settings:
# - DATABASE_URL (PostgreSQL connection)
# - SECRET_KEY (Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
```

**Required Settings:**
```bash
DATABASE_URL=postgresql://hadit7182:password@localhost:5432/event_rental
SECRET_KEY=<generate-a-secure-key>
```

### 4. Setup Database

**Option A: Automatic (Development)**
```bash
# Database and initial data created on first run
python main.py
```

**Option B: Manual SQL Import**
```bash
# Create database
sudo -u postgres psql -c "CREATE DATABASE event_rental OWNER hadit7182;"

# Import schema
psql -U hadit7182 -d event_rental -f database/schema.sql
```

### 5. Start Development Server
```bash
python main.py
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

---

## 🌐 Production Deployment

### 1. Install Dependencies
```bash
# Install Python 3.11 if not already installed
sudo apt update
sudo apt install python3.11 python3.11-venv postgresql-13 postgresql-contrib
```

### 2. Setup PostgreSQL Database
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE event_rental;

# Create user and grant privileges
CREATE USER hadit7182 WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE event_rental TO hadit7182;

# Exit
\q

# Import schema
psql -U hadit7182 -d event_rental -f database/schema.sql
```

### 3. Setup Application Directory
```bash
# Create backend directory on server
cd /home/hadit7182
mkdir -p event-erp/backend
cd event-erp/backend

# Copy backend files from development
# (Use scp, rsync, or git to copy files)

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Production Environment
```bash
# Create .env file
cat > .env << 'EOF'
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000
DATABASE_URL=postgresql://hadit7182:SECURE_PASSWORD@localhost:5432/event_rental
SECRET_KEY=GENERATE_SECURE_KEY
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30
CORS_ORIGINS=["http://haditex.net"]
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log
EOF

# Generate secure secret key
echo "SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")" >> .env
```

### 5. Setup Systemd Service
```bash
# Create systemd service file
sudo nano /etc/systemd/system/event-erp.service
```

**Add this content:**
```ini
[Unit]
Description=Event Rental Management System API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=notify
User=hadit7182
WorkingDirectory=/home/hadit7182/event-erp/backend
Environment="PATH=/home/hadit7182/event-erp/backend/venv/bin"
ExecStart=/home/hadit7182/event-erp/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 main:app
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=event-erp

[Install]
WantedBy=multi-user.target
```

**Enable and start service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable event-erp
sudo systemctl start event-erp

# Check status
sudo systemctl status event-erp
```

### 6. Configure Nginx Reverse Proxy
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/event-erp-api
```

**Add this content:**
```nginx
server {
    listen 80;
    server_name api.haditex.net;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_http_version 1.1;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }

    location /redoc {
        proxy_pass http://127.0.0.1:8000/redoc;
    }
}
```

**Enable configuration:**
```bash
sudo ln -s /etc/nginx/sites-available/event-erp-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Configure Firewall
```bash
# Allow port 8000 (if using directly)
sudo ufw allow 8000

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 🧪 Testing the API

### 1. Test Health Endpoint
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

### 2. Test Authentication

**Register New User:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "securepass123",
    "full_name": "Admin User",
    "role": "admin"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "securepass123"
  }'
```

Save the `access_token` from response for subsequent requests.

### 3. Test Inventory (with auth token)
```bash
# Replace YOUR_TOKEN_HERE with actual token
TOKEN="your-access-token-here"

# List all items
curl -X GET "http://localhost:8000/api/inventory?page=1&page_size=10" \
  -H "Authorization: Bearer $TOKEN"

# Create new item
curl -X POST http://localhost:8000/api/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "JBL Speakers 15\"",
    "category_id": 1,
    "total_quantity": 10,
    "per_day_rate": 1500,
    "per_event_rate": 12000,
    "min_stock_level": 3,
    "is_active": true,
    "item_type": "rentable"
  }'

# Check availability
curl -X POST http://localhost:8000/api/inventory/availability \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "start_date": "2026-05-01",
    "end_date": "2026-05-03"
  }'
```

### 4. Test Customers
```bash
# Create customer
curl -X POST http://localhost:8000/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Company",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+923001234567",
    "email": "john@example.com"
  }'

# Get customer ledger
curl -X GET "http://localhost:8000/api/customers/{customer_id}/ledger" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Test Orders
```bash
# Create order
curl -X POST http://localhost:8000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "customer-uuid-here",
    "event_name": "Test Event",
    "event_location": "Test Venue",
    "start_date": "2026-05-01",
    "end_date": "2026-05-03",
    "items": [
      {
        "item_id": "item-uuid-here",
        "item_name": "JBL Speakers",
        "quantity": 2,
        "rate_per_day": 1500,
        "rate_per_event": 12000,
        "days": 3,
        "is_partner_item": false
      }
    ]
  }'
```

### 6. Test Dashboard
```bash
# Get dashboard stats
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"

# Get upcoming orders
curl -X GET "http://localhost:8000/api/dashboard/upcoming" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Available Endpoints (Working)

### Authentication (`/api/auth`)
- ✅ `POST /register` - Register new user
- ✅ `POST /login` - User login
- ✅ `GET /me` - Get current user
- ✅ `POST /refresh` - Refresh token
- ✅ `POST /logout` - Logout

### Inventory (`/api/inventory`)
- ✅ `GET /` - List items (with filters, pagination)
- ✅ `POST /` - Create item
- ✅ `GET /{id}` - Get item by ID
- ✅ `PUT /{id}` - Update item
- ✅ `DELETE /{id}` - Delete item
- ✅ `POST /availability` - Check availability for dates
- ✅ `GET /low-stock` - Get low stock items
- ✅ `GET /rentable` - Get rentable items only
- ✅ `GET /consumables` - Get consumables only
- ✅ `GET /tools` - Get tools only
- ✅ `GET /stats` - Inventory statistics
- ✅ `GET /categories` - List categories
- ✅ `POST /categories` - Create category
- ✅ `GET /locations` - List locations
- ✅ `POST /locations` - Create location

### Customers (`/api/customers`)
- ✅ `GET /` - List customers (with search, pagination)
- ✅ `POST /` - Create customer
- ✅ `GET /{id}` - Get customer by ID
- ✅ `PUT /{id}` - Update customer
- ✅ `DELETE /{id}` - Delete customer
- ✅ `GET /{id}/orders` - Get customer orders
- ✅ `GET /{id}/ledger` - Get customer ledger
- ✅ `POST /{id}/statement` - Generate customer statement

### Orders (`/api/orders`)
- ✅ `GET /` - List orders (with filters, pagination)
- ✅ `POST /` - Create order
- ✅ `GET /{id}` - Get order by ID
- ✅ `PUT /{id}` - Update order
- ✅ `PATCH /{id}/status` - Quick status update
- ✅ `POST /{id}/dispatch` - Mark as dispatched
- ✅ `POST /{id}/return` - Initiate return
- ✅ `GET /upcoming` - Get upcoming orders
- ✅ `GET /availability` - Check items availability

### Dashboard (`/api/dashboard`)
- ✅ `GET /stats` - Dashboard statistics
- ✅ `GET /notifications` - Dashboard notifications
- ✅ `GET /upcoming` - Upcoming events
- ✅ `GET /overdue` - Overdue items and invoices
- ✅ `GET /recent` - Recent activity

---

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U hadit7182 -d event_rental -c "SELECT 1;"
```

### Port Already in Use
```bash
# Find process using port 8000
sudo lsof -i :8000

# Kill process
sudo kill -9 <PID>
```

### Permission Denied
```bash
# Fix file permissions
chmod +x main.py
chmod 755 logs uploads backups
```

### Module Import Error
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Service Won't Start
```bash
# Check service status
sudo journalctl -u event-erp -f

# Check service logs
sudo systemctl status event-erp

# Try starting manually first
source venv/bin/activate
python main.py
```

---

## 📝 Notes for Testing

### What to Test

1. **Authentication Flow**
   - Register new user
   - Login with credentials
   - Verify token expiration
   - Test refresh token

2. **Inventory Management**
   - Create items (rentable, consumable, tool)
   - List items with different filters
   - Update item quantities
   - Test availability check logic
   - Verify low stock alerts

3. **Order Creation**
   - Create order with items
   - Verify availability validation
   - Test date conflict detection
   - Check automatic calculations

4. **Order Status Workflow**
   - Create → Pending → Confirmed → Dispatched → In Progress → Returned → Completed
   - Test status transitions
   - Verify dispatch/return dates

5. **Customer Management**
   - Create customers
   - Get customer ledger
   - Generate statements

6. **Dashboard Widgets**
   - Verify statistics calculations
   - Check upcoming events
   - Test notifications

### Parameters Needed for Full Testing

After reviewing the system, you may need to provide:

1. **Database Connection**
   - PostgreSQL host, port, username, password
   - Database name

2. **Authentication**
   - Default admin user (if needed)
   - JWT secret key (for production)

3. **Business Rules**
   - Tax rate (currently 17%)
   - Currency (PKR, USD, EUR)
   - Payment modes accepted

4. **Notifications**
   - Email settings (SMTP host, port, user, password)
   - SMS provider settings (if applicable)

5. **File Storage**
   - Upload directory path
   - Backup directory path

### Potential Bugs/Limitations to Address

1. **Availability Check Logic**
   - May not account for partial availability
   - Partner item handling needs verification

2. **Order Status Transitions**
   - Need to verify all status transition rules are enforced
   - Auto-calculation on status change

3. **Ledger Calculations**
   - Opening balance calculation needs testing
   - Running balance accuracy with concurrent transactions

4. **Inventory Updates**
   - Verify rented quantity updates on order creation
   - Confirm availability updates on return completion

5. **Database Constraints**
   - Test foreign key relationships
   - Verify cascading deletes work correctly
   - Check data validation rules

6. **Authentication**
   - Token expiration handling
   - Refresh token rotation
   - Password reset flow (not yet implemented)

7. **Error Handling**
   - Verify user-friendly error messages
   - Test input validation
   - Check API response formats

---

## 📊 API Response Format

All endpoints follow this consistent format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

**Paginated Response:**
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

---

## 🔄 Next Steps for Development

### Immediate (High Priority)
1. Implement Quotation module
2. Implement Invoice module
3. Implement Payment module
4. Implement Return & Tally module
5. Implement Ledger module fully

### Medium Priority
6. Implement Purchase module
7. Implement Partner module
8. Implement Expenses module
9. Implement HR module
10. Implement Notifications with email

### Lower Priority
11. Implement Reports module
12. Implement Backup & Restore
13. Add file upload functionality
14. Add Excel import/export
15. Add PDF generation

---

## 📞 Support

For issues or questions:
- Check API docs: http://localhost:8000/docs
- Check logs: `tail -f logs/app.log`
- Check service: `sudo systemctl status event-erp`
- Review database schema: `database/schema.sql`
- Review API documentation: `API_DOCUMENTATION.md`

---

## ✅ Deployment Checklist

- [ ] Python 3.11+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] PostgreSQL database created
- [ ] Database schema imported
- [ ] Environment file configured
- [ ] Initial data created
- [ ] Development server tested
- [ ] Production service configured
- [ ] Nginx reverse proxy configured
- [ ] Firewall configured
- [ ] Health check passing
- [ ] Authentication working
- [ ] Core modules tested

---

**Last Updated:** 2026-04-17
**Version:** 1.0.0
**Status:** Core Backend Complete (Auth, Inventory, Customers, Orders, Dashboard) | Ready for Testing
