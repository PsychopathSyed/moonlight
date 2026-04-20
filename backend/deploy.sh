#!/bin/bash
# ============================================
# Event Rental Management System - Backend Deployment Script
# ============================================

set -e

# Configuration
APP_USER="hadit7182"
APP_DIR="/home/${APP_USER}/event-erp/backend"
SERVICE_NAME="event-erp"
PYTHON_VERSION="3.11"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_warning "This script should NOT be run as root. It uses sudo where needed."
    exit 1
fi

# ============================================
# Step 1: System Updates
# ============================================
log_header "Step 1: System Updates"

log_info "Updating package lists..."
sudo apt update -qq

log_info "Installing required packages..."
sudo apt install -y python${PYTHON_VERSION} python${PYTHON_VERSION}-venv postgresql-13 postgresql-contrib git curl

log_success "System packages installed successfully"

# ============================================
# Step 2: Database Setup
# ============================================
log_header "Step 2: Database Setup"

log_info "Checking if PostgreSQL service is running..."
if ! systemctl is-active --quiet postgresql; then
    sudo systemctl start postgresql
    log_success "PostgreSQL started"
else
    log_info "PostgreSQL is already running"
fi

# ============================================
# Step 3: Application Setup
# ============================================
log_header "Step 3: Application Setup"

log_info "Creating application directory..."
mkdir -p ${APP_DIR}

if [ -d "${APP_DIR}" ]; then
    log_warning "Application directory already exists"
    read -p "Do you want to reinstall? (y/n): " reinstall
    if [ "$reinstall" != "y" ]; then
        log_info "Skipping installation"
        exit 0
    fi
    log_info "Removing existing directory..."
    sudo rm -rf ${APP_DIR}
    mkdir -p ${APP_DIR}
fi

log_info "Copying application files..."
# Note: You need to copy files from /opt/event-erp/backend to ${APP_DIR}
log_warning "Please manually copy backend files to ${APP_DIR}"
log_info "Run: sudo cp -r /opt/event-erp/backend/* ${APP_DIR}/"

# ============================================
# Step 4: Python Environment
# ============================================
log_header "Step 4: Python Environment"

log_info "Creating virtual environment..."
cd ${APP_DIR}
python${PYTHON_VERSION} -m venv venv

log_info "Activating virtual environment..."
source venv/bin/activate

log_info "Upgrading pip..."
pip install --upgrade pip -q

log_info "Installing Python dependencies..."
pip install -r requirements.txt -q

log_success "Python environment setup completed"

# ============================================
# Step 5: Environment Configuration
# ============================================
log_header "Step 5: Environment Configuration"

log_info "Creating .env file..."
cat > .env << 'EOF'
# ============================================
# Application Settings
# ============================================

ENVIRONMENT=production

# Server Settings
HOST=0.0.0.0
PORT=8000

# ============================================
# Database Settings
# ============================================

# PostgreSQL Connection String
# IMPORTANT: Change the password below!
DATABASE_URL=postgresql://hadit7182:CHANGE_PASSWORD_NOW@localhost:5432/event_rental

# Database Connection Pool Settings
DATABASE_POOL_SIZE=10
DATABASE_MAX_OVERFLOW=20

# ============================================
# Security Settings
# ============================================

# JWT Secret Key
# IMPORTANT: Run: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=CHANGE_THIS_SECURE_KEY_MIN_32_CHARACTERS

# JWT Algorithm
ALGORITHM=HS256

# Token Expiration Times
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# ============================================
# CORS Settings
# ============================================

CORS_ORIGINS=["http://haditex.net","http://localhost:5173","http://localhost:3000"]

# ============================================
# Email Settings (Optional)
# ============================================

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_TLS=true
EMAIL_FROM=noreply@haditex.net

# ============================================
# File Upload Settings
# ============================================

MAX_FILE_SIZE_MB=10
UPLOAD_DIR=./uploads

# ============================================
# Backup Settings
# ============================================

BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30

# ============================================
# Rate Limiting Settings
# ============================================

RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_MINUTE_IP=1000

# ============================================
# Logging Settings
# ============================================

LOG_LEVEL=INFO
LOG_FILE=./logs/app.log

# ============================================
# Additional Settings
# ============================================

DEFAULT_CURRENCY=PKR
DEFAULT_TAX_RATE=17
DEFAULT_COMPANY_NAME=Event Rental Co
EOF

log_success ".env file created"
log_warning "IMPORTANT: Update DATABASE_URL password and SECRET_KEY in .env!"

# ============================================
# Step 6: Database Setup
# ============================================
log_header "Step 6: Database Setup"

read -p "PostgreSQL password for hadit7182: " db_password

log_info "Creating database..."
sudo -u postgres psql -c "CREATE DATABASE event_rental OWNER hadit7182;" 2>/dev/null || log_info "Database may already exist"

log_info "Importing schema..."
psql -U hadit7182 -d event_rental -f database/schema.sql 2>/dev/null && log_success "Schema imported successfully" || log_error "Failed to import schema"

# ============================================
# Step 7: Directory Setup
# ============================================
log_header "Step 7: Directory Setup"

log_info "Creating required directories..."
mkdir -p uploads logs backups

log_success "Directories created"

# ============================================
# Step 8: Systemd Service Setup
# ============================================
log_header "Step 8: Systemd Service"

log_info "Creating systemd service file..."
sudo bash -c "cat > /etc/systemd/system/${SERVICE_NAME}.service << 'SERVICEEOF'
[Unit]
Description=Event Rental Management System API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=notify
User=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=\"PATH=${APP_DIR}/venv/bin\"
ExecStart=${APP_DIR}/venv/bin/gunicorn -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 main:app
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}

[Install]
WantedBy=multi-user.target
SERVICEEOF"

log_success "Systemd service file created"

log_info "Reloading systemd daemon..."
sudo systemctl daemon-reload

log_info "Enabling service..."
sudo systemctl enable ${SERVICE_NAME}

log_info "Starting service..."
sudo systemctl start ${SERVICE_NAME}

# ============================================
# Step 9: Nginx Configuration
# ============================================
log_header "Step 9: Nginx Configuration"

log_info "Creating Nginx configuration..."
sudo bash -c "cat > /etc/nginx/sites-available/${SERVICE_NAME}-api << 'NGINXEOF'
server {
    listen 80;
    server_name api.haditex.net;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";

        proxy_http_version 1.1;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
    }

    location /redoc {
        proxy_pass http://127.0.0.1:8000/redoc;
    }
}
NGINXEOF"

log_success "Nginx configuration created"

log_info "Enabling site..."
sudo ln -sf /etc/nginx/sites-available/${SERVICE_NAME}-api /etc/nginx/sites-enabled/

log_info "Testing Nginx configuration..."
sudo nginx -t 2>/dev/null || log_error "Nginx configuration test failed"

log_info "Reloading Nginx..."
sudo systemctl reload nginx

log_success "Nginx reloaded successfully"

# ============================================
# Step 10: Firewall Configuration
# ============================================
log_header "Step 10: Firewall Configuration"

log_info "Configuring firewall..."
sudo ufw allow 8000/tcp 2>/dev/null || log_warning "UFW not available or already configured"
sudo ufw allow 80/tcp 2>/dev/null || log_warning "UFW not available or already configured"
sudo ufw allow 443/tcp 2>/dev/null || log_warning "UFW not available or already configured"
sudo ufw enable 2>/dev/null || log_info "UFW not available or already enabled"

log_success "Firewall configured"

# ============================================
# Final Checks
# ============================================
log_header "Final Checks"

log_info "Checking service status..."
sleep 2
sudo systemctl status ${SERVICE_NAME} --no-pager -l

log_info "Checking API health..."
sleep 2
curl -s http://localhost:8000/health && log_success "API is responding!" || log_error "API is not responding"

log_info "Checking logs..."
sudo journalctl -u ${SERVICE_NAME} -n --no-pager -l 5

# ============================================
# Summary
# ============================================
log_header "Deployment Complete!"

echo -e "${GREEN}✅${NC} Backend deployed successfully!"
echo ""
log_info "Next Steps:"
log_info "1. Update .env file with DATABASE_URL password"
log_info "2. Update .env file with SECRET_KEY (generate with: python -c \"import secrets; print(secrets.token_urlsafe(32))\")"
log_info "3. Copy backend files: sudo cp -r /opt/event-erp/backend/* ${APP_DIR}/"
log_info "4. Test API: curl https://api.haditex.net/health"
log_info "5. View API docs: https://api.haditex.net/docs"
log_info "6. Check logs: sudo journalctl -u ${SERVICE_NAME} -f"
log_info "7. Restart service: sudo systemctl restart ${SERVICE_NAME}"
echo ""
log_warning "Don't forget to:"
log_warning "- Set a strong SECRET_KEY in .env"
log_warning "- Update DATABASE_URL with correct password"
log_warning "- Configure email settings in .env for notifications"
echo ""
log_info "Documentation available in:"
log_info "- SETUP_GUIDE.md"
log_info "- BACKEND_STATUS.md"
log_info "- API_DOCUMENTATION.md"
echo ""
log_success "All done! Ready for testing."
