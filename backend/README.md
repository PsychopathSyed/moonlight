# Event Rental Management System - Backend Setup

## Prerequisites

- Python 3.11 or higher
- PostgreSQL 13+
- pip (Python package manager)
- git (optional)

## Installation

### 1. Clone Repository
```bash
cd /path/to/project
git clone <repository-url>
cd backend
```

### 2. Create Virtual Environment
```bash
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
Create a `.env` file in the backend directory:

```bash
# Environment
ENVIRONMENT=development

# Server
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/event_rental
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# CORS (add your frontend URL)
CORS_ORIGINS=["http://localhost:5173","http://haditex.net"]

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@haditex.net
SMTP_TLS=true

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

# Backups
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/app.log
```

### 5. Initialize Database

**Option A: Automatic (Development)**
```bash
python main.py
# Tables will be created automatically in development mode
```

**Option B: Manual with SQL Schema**
```bash
# Connect to PostgreSQL
psql -U postgres -d postgres

# Create database
CREATE DATABASE event_rental;

# Connect to database
\c event_rental

# Run schema
\i database/schema.sql

# Exit
\q
```

**Option C: Using Alembic (Production)**
```bash
# Initialize Alembic
alembic init alembic

# Generate migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### 6. Create Required Directories
```bash
mkdir -p uploads logs backups
```

## Running the Server

### Development Mode
```bash
# Activate virtual environment
source venv/bin/activate

# Run with auto-reload
python main.py
```

The API will be available at:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### Production Mode
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 main:app
```

Or using systemd (recommended for production):
```bash
# Create systemd service file
sudo nano /etc/systemd/system/event-erp.service
```

```ini
[Unit]
Description=Event Rental Management System
After=network.target

[Service]
Type=notify
User=hadit7182
WorkingDirectory=/home/hadit7182/event-erp/backend
Environment="PATH=/home/hadit7182/event-erp/backend/venv/bin"
ExecStart=/home/hadit7182/event-erp/backend/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 main:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable event-erp
sudo systemctl start event-erp

# Check status
sudo systemctl status event-erp
```

## Database Setup on Ubuntu

### Install PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# Create user
CREATE USER hadit7182 WITH PASSWORD 'your-password';

# Create database
CREATE DATABASE event_rental OWNER hadit7182;

# Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE event_rental TO hadit7182;

# Exit
\q
```

### Import Schema
```bash
# From backend directory
psql -U hadit7182 -d event_rental -f database/schema.sql
```

## Testing

### Run Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test
pytest tests/test_orders.py
```

### API Testing with cURL

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

**Create Customer:**
```bash
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "company_name": "Test Company",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+923001234567",
    "email": "john@example.com"
  }'
```

**Check Availability:**
```bash
curl "http://localhost:8000/api/inventory/availability?start_date=2026-05-01&end_date=2026-05-03" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Nginx Configuration

Create Nginx configuration for the API:

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

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }
}
```

Apply Nginx configuration:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/event-erp-api
sudo ln -s /etc/nginx/sites-available/event-erp-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Deployment Checklist

- [ ] Update SECRET_KEY in production
- [ ] Set ENVIRONMENT=production
- [ ] Configure PostgreSQL connection
- [ ] Import database schema
- [ ] Set up systemd service
- [ ] Configure Nginx reverse proxy
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Configure firewall (UFW)
- [ ] Set up automated backups
- [ ] Configure email notifications
- [ ] Enable monitoring (Prometheus/Grafana)
- [ ] Set up log rotation

## Troubleshooting

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
chmod 755 uploads logs backups
```

### ImportError: No module named 'fastapi'
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## Monitoring & Logs

### View Logs
```bash
# Application logs
tail -f logs/app.log

# System service logs
sudo journalctl -u event-erp -f
```

### Health Check
```bash
curl http://localhost:8000/health
```

### Database Connection Check
```bash
psql -U hadit7182 -d event_rental -c "SELECT version();"
```

## Backup Strategy

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

# Create database backup
pg_dump -U hadit7182 event_rental > backups/$BACKUP_FILE

# Compress
gzip backups/$BACKUP_FILE

# Delete old backups (older than 30 days)
find backups/ -name "*.sql.gz" -mtime +30 -delete
```

Add to crontab for daily backups:
```bash
crontab -e

# Add line (runs daily at 2 AM)
0 2 * * * /path/to/backend/backup.sh
```

## API Documentation

Once the server is running, access:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

Full API documentation is in `API_DOCUMENTATION.md`

## Support

For issues and questions:
- Check logs in `logs/` directory
- Review API documentation at `/docs`
- Test endpoints using Swagger UI
- Check database connectivity

## Production Security

1. **Change default passwords**
2. **Use strong SECRET_KEY** (generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
3. **Enable HTTPS** with valid SSL certificate
4. **Configure firewall** (allow only necessary ports)
5. **Regular updates** of dependencies
6. **Backup strategy** with offsite copies
7. **Monitor logs** for suspicious activity
8. **Rate limiting** is enabled by default
9. **Input validation** via Pydantic schemas
10. **SQL injection protection** via SQLAlchemy ORM
