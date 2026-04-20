-- Event Rental Management System - Database Schema
-- PostgreSQL 13+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'accountant', 'storekeeper')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ============================================
-- INVENTORY MODULE
-- ============================================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('warehouse', 'room', 'rack')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    rented_quantity INTEGER NOT NULL DEFAULT 0,
    location_id INTEGER REFERENCES locations(id),
    tag_serial VARCHAR(100),
    per_day_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
    per_event_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
    min_stock_level INTEGER NOT NULL DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    item_type VARCHAR(20) NOT NULL DEFAULT 'rentable' CHECK (item_type IN ('rentable', 'consumable', 'tool')),
    unit VARCHAR(20),
    avg_monthly_usage INTEGER DEFAULT 0,
    supplier VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_location ON items(location_id);
CREATE INDEX idx_items_name ON items(name);

-- ============================================
-- VENDORS (PURCHASE MODULE)
-- ============================================

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    email VARCHAR(100),
    contact_person VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id),
    item_id UUID REFERENCES items(id),
    item_name VARCHAR(200),
    quantity INTEGER NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_vendor ON purchases(vendor_id);
CREATE INDEX idx_purchases_item ON purchases(item_id);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(200),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    cnic VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_company ON customers(company_name);
CREATE INDEX idx_customers_name ON customers(first_name, last_name);

-- ============================================
-- QUOTATIONS
-- ============================================

CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    quotation_number VARCHAR(50) UNIQUE NOT NULL,
    event_name VARCHAR(200),
    event_location VARCHAR(200),
    event_date DATE,
    creation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    validity_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    advance_payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    item_name VARCHAR(200),
    quantity INTEGER NOT NULL,
    rate_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
    rate_per_event DECIMAL(10, 2) NOT NULL DEFAULT 0,
    days INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quotations_customer ON quotations(customer_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotation_items_quotation ON quotation_items(quotation_id);

-- ============================================
-- ORDERS / RENTALS
-- ============================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    quotation_id UUID REFERENCES quotations(id),
    customer_id UUID REFERENCES customers(id),
    event_name VARCHAR(200),
    event_location VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    dispatch_date DATE,
    return_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'dispatched', 'in_progress', 'returned', 'completed', 'cancelled')),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    advance_payment DECIMAL(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    item_name VARCHAR(200),
    quantity INTEGER NOT NULL,
    rate_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
    rate_per_event DECIMAL(10, 2) NOT NULL DEFAULT 0,
    days INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    is_partner_item BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_dates ON orders(start_date, end_date);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- PARTNERS & RENT-IN
-- ============================================

CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    email VARCHAR(100),
    commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 15.00,
    contact_person VARCHAR(100),
    available_items TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE partner_rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    order_id UUID REFERENCES orders(id),
    item_name VARCHAR(200),
    category VARCHAR(50),
    quantity INTEGER NOT NULL,
    rate_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0,
    days INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'paid', 'overdue')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE partner_payables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    balance DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partner_rentals_partner ON partner_rentals(partner_id);
CREATE INDEX idx_partner_payables_partner ON partner_payables(partner_id);

-- ============================================
-- RETURNS & TALLY
-- ============================================

CREATE TABLE returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    return_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE return_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id),
    item_id UUID REFERENCES items(id),
    item_name VARCHAR(200),
    quantity_rented INTEGER NOT NULL,
    quantity_returned INTEGER NOT NULL DEFAULT 0,
    condition VARCHAR(20) NOT NULL DEFAULT 'good' CHECK (condition IN ('good', 'damaged', 'missing')),
    responsibility VARCHAR(20) CHECK (responsibility IN ('customer', 'internal')),
    damage_description TEXT,
    recovery_amount DECIMAL(10, 2) DEFAULT 0,
    added_to_stock BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_returns_order ON returns(order_id);
CREATE INDEX idx_return_items_return ON return_items(return_id);

-- ============================================
-- INVOICES
-- ============================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'closed')),
    payment_mode VARCHAR(20) CHECK (payment_mode IN ('cash', 'online', 'credit')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id),
    item_name VARCHAR(200),
    quantity INTEGER NOT NULL,
    days INTEGER NOT NULL DEFAULT 1,
    rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id),
    customer_id UUID REFERENCES customers(id),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(12, 2) NOT NULL,
    payment_mode VARCHAR(20) CHECK (payment_mode IN ('cash', 'online', 'credit', 'adjustment')),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);

-- ============================================
-- CUSTOMER LEDGER
-- ============================================

CREATE TABLE ledger_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    invoice_id UUID REFERENCES invoices(id),
    payment_id UUID REFERENCES payments(id),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('invoice', 'payment', 'refund', 'adjustment')),
    description TEXT,
    debit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    credit_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    balance DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ledger_customer ON ledger_transactions(customer_id);
CREATE INDEX idx_ledger_date ON ledger_transactions(transaction_date);

-- ============================================
-- EXPENSES
-- ============================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'monthly', 'employee')),
    amount DECIMAL(10, 2) NOT NULL,
    employee_id UUID,
    is_salary_deductible BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_type ON expenses(type);

-- ============================================
-- HR & SALARY
-- ============================================

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    cnic VARCHAR(20),
    address TEXT,
    salary DECIMAL(12, 2) NOT NULL,
    join_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE salary_advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    amount DECIMAL(10, 2) NOT NULL,
    advance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT,
    is_deducted BOOLEAN DEFAULT false,
    deduction_month VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE salary_process (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    month VARCHAR(7) NOT NULL,
    basic_salary DECIMAL(12, 2) NOT NULL,
    advance_deduction DECIMAL(12, 2) NOT NULL DEFAULT 0,
    incentives DECIMAL(12, 2) NOT NULL DEFAULT 0,
    other_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0,
    net_salary DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
    reference_number VARCHAR(50),
    processed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_salary_process_employee ON salary_process(employee_id);
CREATE INDEX idx_salary_process_month ON salary_process(month);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(30) NOT NULL CHECK (type IN ('dispatch', 'return', 'payment', 'alert', 'trend')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- SETTINGS
-- ============================================

CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BACKUPS
-- ============================================

CREATE TABLE backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_type VARCHAR(20) NOT NULL CHECK (backup_type IN ('full', 'selective')),
    modules TEXT,
    file_path TEXT NOT NULL,
    file_size DECIMAL(10, 2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Customer Ledger View
CREATE VIEW v_customer_ledger AS
SELECT
    c.id AS customer_id,
    c.company_name,
    COALESCE(c.first_name || ' ' || c.last_name, c.company_name) AS customer_name,
    COALESCE(SUM(CASE WHEN lt.type = 'invoice' THEN lt.debit_amount ELSE 0 END), 0) AS total_invoiced,
    COALESCE(SUM(CASE WHEN lt.type = 'payment' THEN lt.credit_amount ELSE 0 END), 0) AS total_paid,
    COALESCE(SUM(lt.balance), 0) AS outstanding_balance
FROM customers c
LEFT JOIN ledger_transactions lt ON c.id = lt.customer_id
GROUP BY c.id, c.company_name, c.first_name, c.last_name;

-- Inventory Status View
CREATE VIEW v_inventory_status AS
SELECT
    i.id,
    i.name,
    cat.name AS category,
    i.total_quantity,
    i.available_quantity,
    i.rented_quantity,
    i.min_stock_level,
    CASE
        WHEN i.available_quantity < i.min_stock_level THEN 'low'
        WHEN i.available_quantity < i.min_stock_level * 2 THEN 'medium'
        ELSE 'good'
    END AS stock_status,
    i.location_id,
    loc.name AS location_name
FROM items i
LEFT JOIN categories cat ON i.category_id = cat.id
LEFT JOIN locations loc ON i.location_id = loc.id;

-- Monthly Revenue View
CREATE VIEW v_monthly_revenue AS
SELECT
    TO_CHAR(created_at, 'YYYY-MM') AS month,
    SUM(total_amount) AS total_revenue,
    COUNT(*) AS order_count
FROM orders
WHERE status IN ('completed', 'returned')
GROUP BY TO_CHAR(created_at, 'YYYY-MM')
ORDER BY month DESC;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Update item quantities on order creation
CREATE OR REPLACE FUNCTION update_order_item_quantity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE items
    SET
        rented_quantity = rented_quantity + NEW.quantity,
        available_quantity = available_quantity - NEW.quantity
    WHERE id = NEW.item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_item_quantity
AFTER INSERT ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_order_item_quantity();

-- Update ledger balance on transaction
CREATE OR REPLACE FUNCTION update_ledger_balance()
RETURNS TRIGGER AS $$
DECLARE
    running_balance DECIMAL(12, 2);
BEGIN
    SELECT COALESCE(SUM(debit_amount - credit_amount), 0) + NEW.debit_amount - NEW.credit_amount
    INTO running_balance
    FROM ledger_transactions
    WHERE customer_id = NEW.customer_id;

    NEW.balance = running_balance;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ledger_balance
BEFORE INSERT ON ledger_transactions
FOR EACH ROW
EXECUTE FUNCTION update_ledger_balance();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Speakers', 'Audio speakers and sound systems'),
('Lights', 'Lighting equipment and fixtures'),
('DJ Equipment', 'DJ controllers, mixers, and decks'),
('Screens', 'LED screens and projectors'),
('Cables', 'Audio, video, and power cables'),
('Microphones', 'Wireless and wired microphones'),
('Stands', 'Speaker stands, light stands, trusses'),
('Other', 'Miscellaneous equipment'),
('Consumables', 'Non-rentable items (tape, cable ties, etc.)'),
('Tools', 'Maintenance and repair tools');

-- Insert default locations
INSERT INTO locations (name, type, description) VALUES
('Main Warehouse', 'warehouse', 'Primary storage facility'),
('Rack A', 'rack', 'Speaker rack A'),
('Rack B', 'rack', 'Speaker rack B'),
('Room 1', 'room', 'Event room 1');

-- Insert default settings
INSERT INTO settings (key, value, description, category) VALUES
('company_name', 'Event Rental Co', 'Company name', 'general'),
('currency', 'PKR', 'Default currency', 'general'),
('tax_rate', '17', 'Sales tax rate (%)', 'billing'),
('notification_email', 'admin@company.com', 'Notification email', 'notifications'),
('backup_retention_days', '30', 'Backup retention period', 'backup');

-- ============================================
-- COMPLETED
-- ============================================
