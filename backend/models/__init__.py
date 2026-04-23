"""
SQLAlchemy models for Event Rental Management System
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Date, DECIMAL, ForeignKey, Text, CheckConstraint, Index
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime, date

from database.connection import Base

class TimestampMixin:
    """
    Mixin for created_at and updated_at timestamps
    """
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class User(Base, TimestampMixin):
    """
    User model with authentication and role management
    """
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))
    role = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    relationships = []

class Category(Base):
    """
    Item categories
    """
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    items = relationship("Item", back_populates="category")

class Location(Base):
    """
    Storage locations
    """
    __tablename__ = 'locations'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    type = Column(String(20), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    items = relationship("Item", back_populates="location")

class Item(Base, TimestampMixin):
    """
    Inventory items - rentable, consumable, or tools
    """
    __tablename__ = 'items'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey('categories.id'))
    description = Column(Text)
    total_quantity = Column(Integer, default=0, nullable=False)
    available_quantity = Column(Integer, default=0, nullable=False)
    rented_quantity = Column(Integer, default=0, nullable=False)
    location_id = Column(Integer, ForeignKey('locations.id'))
    tag_serial = Column(String(100))
    tag = Column(String(100))
    per_day_rate = Column(DECIMAL(10, 2), default=0, nullable=False)
    per_event_rate = Column(DECIMAL(10, 2), default=0, nullable=False)
    min_stock_level = Column(Integer, default=5, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    item_type = Column(String(20), default='rentable', nullable=False)
    unit = Column(String(20))
    avg_monthly_usage = Column(Integer, default=0)
    supplier = Column(String(200))

    category = relationship("Category", back_populates="items")
    location = relationship("Location", back_populates="items")

    order_items = relationship("OrderItem", back_populates="item")
    return_items = relationship("ReturnItem", back_populates="item")

class Customer(Base, TimestampMixin):
    """
    Customer information
    """
    __tablename__ = 'customers'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(200), index=True)
    first_name = Column(String(100), index=True)
    last_name = Column(String(100), index=True)
    phone = Column(String(20))
    email = Column(String(100))
    address = Column(Text)
    city = Column(String(100))
    country = Column(String(100))
    cnic = Column(String(20))

    quotations = relationship("Quotation", back_populates="customer")
    orders = relationship("Order", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")
    ledger_transactions = relationship("LedgerTransaction", back_populates="customer")

class Quotation(Base, TimestampMixin):
    """
    Quotations for rental services
    """
    __tablename__ = 'quotations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'))
    quotation_number = Column(String(50), unique=True, nullable=False, index=True)
    event_name = Column(String(200))
    event_location = Column(String(200))
    event_date = Column(Date)
    creation_date = Column(Date, default=date.today(), nullable=False)
    validity_date = Column(Date)
    status = Column(String(20), default='pending', nullable=False, index=True)
    subtotal = Column(DECIMAL(12, 2), default=0, nullable=False)
    tax_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    discount_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    total_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    advance_payment = Column(DECIMAL(12, 2), default=0, nullable=False)
    notes = Column(Text)
    terms = Column(Text)

    customer = relationship("Customer", back_populates="quotations")
    quotation_items = relationship("QuotationItem", back_populates="quotation")
    order = relationship("Order", back_populates="quotation", uselist=False)

class QuotationItem(Base):
    """
    Individual items in a quotation
    """
    __tablename__ = 'quotation_items'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quotation_id = Column(UUID(as_uuid=True), ForeignKey('quotations.id', ondelete="CASCADE"))
    item_id = Column(UUID(as_uuid=True), ForeignKey('items.id'))
    item_name = Column(String(200))
    quantity = Column(Integer, nullable=False)
    rate_per_day = Column(DECIMAL(10, 2), default=0, nullable=False)
    rate_per_event = Column(DECIMAL(10, 2), default=0, nullable=False)
    days = Column(Integer, default=1, nullable=False)
    total_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    quotation = relationship("Quotation", back_populates="quotation_items")

class Order(Base, TimestampMixin):
    """
    Rental orders
    """
    __tablename__ = 'orders'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    quotation_id = Column(UUID(as_uuid=True), ForeignKey('quotations.id'))
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'))
    event_name = Column(String(200))
    event_location = Column(String(200))
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False, index=True)
    dispatch_date = Column(Date)
    return_date = Column(Date)
    status = Column(String(20), default='pending', nullable=False, index=True)
    subtotal = Column(DECIMAL(12, 2), default=0, nullable=False)
    tax_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    discount_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    total_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    advance_payment = Column(DECIMAL(12, 2), default=0, nullable=False)
    notes = Column(Text)

    customer = relationship("Customer", back_populates="orders")
    quotation = relationship("Quotation", back_populates="order")
    order_items = relationship("OrderItem", back_populates="order")
    returns = relationship("Return", back_populates="order")

class OrderItem(Base):
    """
    Individual items in an order
    """
    __tablename__ = 'order_items'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id', ondelete="CASCADE"))
    item_id = Column(UUID(as_uuid=True), ForeignKey('items.id'))
    item_name = Column(String(200))
    quantity = Column(Integer, nullable=False)
    rate_per_day = Column(DECIMAL(10, 2), default=0, nullable=False)
    rate_per_event = Column(DECIMAL(10, 2), default=0, nullable=False)
    days = Column(Integer, default=1, nullable=False)
    total_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    is_partner_item = Column(Boolean, default=False, nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    order = relationship("Order", back_populates="order_items")
    item = relationship("Item", back_populates="order_items")
    return_items = relationship("ReturnItem", back_populates="order_item")

class Invoice(Base, TimestampMixin):
    """
    Invoices
    """
    __tablename__ = 'invoices'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'))
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    invoice_date = Column(Date, default=date.today(), nullable=False)
    due_date = Column(Date)
    subtotal = Column(DECIMAL(12, 2), default=0, nullable=False)
    tax_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    discount_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    total_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    paid_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    balance = Column(DECIMAL(12, 2), default=0, nullable=False)
    status = Column(String(20), default='pending', nullable=False, index=True)
    payment_mode = Column(String(20))
    notes = Column(Text)

    customer = relationship("Customer", back_populates="invoices")
    invoice_items = relationship("InvoiceItem", back_populates="invoice")
    payments = relationship("Payment", back_populates="invoice")

class InvoiceItem(Base):
    """
    Individual items in an invoice
    """
    __tablename__ = 'invoice_items'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey('invoices.id', ondelete="CASCADE"))
    item_id = Column(UUID(as_uuid=True), ForeignKey('items.id'))
    item_name = Column(String(200))
    quantity = Column(Integer, nullable=False)
    days = Column(Integer, default=1, nullable=False)
    rate = Column(DECIMAL(10, 2), default=0, nullable=False)
    total_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    invoice = relationship("Invoice", back_populates="invoice_items")

class Payment(Base):
    """
    Payment records
    """
    __tablename__ = 'payments'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey('invoices.id'))
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'))
    payment_date = Column(Date, default=date.today(), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    payment_mode = Column(String(20))
    reference_number = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    invoice = relationship("Invoice", back_populates="payments")

class Vendor(Base, TimestampMixin):
    """
    Purchase vendors
    """
    __tablename__ = 'vendors'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    phone = Column(String(20))
    address = Column(Text)
    email = Column(String(100))
    contact_person = Column(String(100))

    purchases = relationship("Purchase", back_populates="vendor")

class Purchase(Base):
    """
    Purchase records
    """
    __tablename__ = 'purchases'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id'))
    item_id = Column(UUID(as_uuid=True), ForeignKey('items.id'))
    item_name = Column(String(200))
    quantity = Column(Integer, nullable=False)
    purchase_price = Column(DECIMAL(10, 2), nullable=False)
    total_price = Column(DECIMAL(10, 2), nullable=False)
    purchase_date = Column(Date, nullable=False, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    vendor = relationship("Vendor", back_populates="purchases")

class Partner(Base, TimestampMixin):
    """
    External rental partners
    """
    __tablename__ = 'partners'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    phone = Column(String(20))
    address = Column(Text)
    email = Column(String(100))
    commission_rate = Column(DECIMAL(5, 2), default=15.00, nullable=False)
    contact_person = Column(String(100))
    available_items = Column(Text)
    status = Column(String(20), default='active', nullable=False)
    balance = Column(DECIMAL(12, 2), default=0, nullable=False)

    partner_rentals = relationship("PartnerRental", back_populates="partner")
    partner_payables = relationship("PartnerPayable", back_populates="partner")

class PartnerRental(Base):
    """
    Items rented from partners
    """
    __tablename__ = 'partner_rentals'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id = Column(UUID(as_uuid=True), ForeignKey('partners.id'))
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))
    item_name = Column(String(200))
    category = Column(String(50))
    quantity = Column(Integer, nullable=False)
    rate_per_day = Column(DECIMAL(10, 2), default=0, nullable=False)
    days = Column(Integer, default=1, nullable=False)
    total_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    status = Column(String(20), default='pending', nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    partner = relationship("Partner", back_populates="partner_rentals")

class PartnerPayable(Base, TimestampMixin):
    """
    Partner payable balances
    """
    __tablename__ = 'partner_payables'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id = Column(UUID(as_uuid=True), ForeignKey('partners.id'))
    amount = Column(DECIMAL(12, 2), nullable=False)
    paid_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    balance = Column(DECIMAL(12, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(20), default='pending', nullable=False)

    partner = relationship("Partner", back_populates="partner_payables")

class Return(Base, TimestampMixin):
    """
    Return records
    """
    __tablename__ = 'returns'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey('orders.id'))
    return_date = Column(Date, default=date.today(), nullable=False)
    status = Column(String(20), default='pending', nullable=False)
    notes = Column(Text)

    order = relationship("Order", back_populates="returns")
    return_items = relationship("ReturnItem", back_populates="return_record")

class ReturnItem(Base):
    """
    Individual items being returned
    """
    __tablename__ = 'return_items'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    return_id = Column(UUID(as_uuid=True), ForeignKey('returns.id', ondelete="CASCADE"))
    order_item_id = Column(UUID(as_uuid=True), ForeignKey('order_items.id'))
    item_id = Column(UUID(as_uuid=True), ForeignKey('items.id'))
    item_name = Column(String(200))
    quantity_rented = Column(Integer, nullable=False)
    quantity_returned = Column(Integer, default=0, nullable=False)
    condition = Column(String(20), default='good', nullable=False)
    responsibility = Column(String(20))
    damage_description = Column(Text)
    recovery_amount = Column(DECIMAL(10, 2), default=0)
    added_to_stock = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    return_record = relationship("Return", back_populates="return_items")
    item = relationship("Item", back_populates="return_items")
    order_item = relationship("OrderItem", back_populates="return_items")

class LedgerTransaction(Base):
    """
    Customer ledger transactions
    """
    __tablename__ = 'ledger_transactions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey('customers.id'), index=True)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey('invoices.id'))
    payment_id = Column(UUID(as_uuid=True), ForeignKey('payments.id'))
    transaction_date = Column(Date, default=date.today(), nullable=False, index=True)
    type = Column(String(20), nullable=False)
    description = Column(Text)
    debit_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    credit_amount = Column(DECIMAL(12, 2), default=0, nullable=False)
    balance = Column(DECIMAL(12, 2), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    customer = relationship("Customer", back_populates="ledger_transactions")

class Expense(Base, TimestampMixin):
    """
    Expense records
    """
    __tablename__ = 'expenses'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    expense_date = Column(Date, default=date.today(), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    type = Column(String(20), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    employee_id = Column(UUID(as_uuid=True))
    is_salary_deductible = Column(Boolean, default=False, nullable=False)
    notes = Column(Text)

class Employee(Base, TimestampMixin):
    """
    Employee records
    """
    __tablename__ = 'employees'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_number = Column(String(50), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(String(50), nullable=False)
    phone = Column(String(20))
    email = Column(String(100))
    cnic = Column(String(20))
    address = Column(Text)
    salary = Column(DECIMAL(12, 2), nullable=False)
    join_date = Column(Date, nullable=False)
    status = Column(String(20), default='active', nullable=False)

    salary_advances = relationship("SalaryAdvance", back_populates="employee")
    salary_process = relationship("SalaryProcess", back_populates="employee")

class SalaryAdvance(Base):
    """
    Salary advances
    """
    __tablename__ = 'salary_advances'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id'))
    amount = Column(DECIMAL(10, 2), nullable=False)
    advance_date = Column(Date, default=date.today(), nullable=False)
    reason = Column(Text)
    is_deducted = Column(Boolean, default=False, nullable=False)
    deduction_month = Column(String(7))
    created_at = Column(DateTime, default=func.now(), nullable=False)

    employee = relationship("Employee", back_populates="salary_advances")

class SalaryProcess(Base):
    """
    Monthly salary processing
    """
    __tablename__ = 'salary_process'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey('employees.id'), index=True)
    month = Column(String(7), nullable=False, index=True)
    basic_salary = Column(DECIMAL(12, 2), nullable=False)
    advance_deduction = Column(DECIMAL(12, 2), default=0, nullable=False)
    incentives = Column(DECIMAL(12, 2), default=0, nullable=False)
    other_deductions = Column(DECIMAL(12, 2), default=0, nullable=False)
    net_salary = Column(DECIMAL(12, 2), nullable=False)
    status = Column(String(20), default='pending', nullable=False)
    reference_number = Column(String(50), unique=True, nullable=False)
    processed_date = Column(Date)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    employee = relationship("Employee", back_populates="salary_process")

class Notification(Base):
    """
    Notification records
    """
    __tablename__ = 'notifications'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), index=True)
    type = Column(String(30), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    reference_id = Column(UUID(as_uuid=True))
    reference_type = Column(String(50))
    status = Column(String(20), default='unread', nullable=False, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False, index=True)

class Setting(Base):
    """
    Application settings
    """
    __tablename__ = 'settings'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text)
    category = Column(String(50))
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class Backup(Base):
    """
    Backup records
    """
    __tablename__ = 'backups'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    backup_type = Column(String(20), nullable=False)
    modules = Column(Text)
    file_path = Column(Text, nullable=False)
    file_size = Column(DECIMAL(10, 2))
    created_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    created_at = Column(DateTime, default=func.now(), nullable=False)

class AuditLog(Base):
    """
    Audit log for tracking changes
    """
    __tablename__ = 'audit_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), index=True)
    action = Column(String(50), nullable=False)
    table_name = Column(String(50), nullable=False)
    record_id = Column(UUID(as_uuid=True))
    old_values = Column(JSON)
    new_values = Column(JSON)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, default=func.now(), nullable=False, index=True)
