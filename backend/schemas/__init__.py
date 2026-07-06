"""
Pydantic schemas for request and response validation
"""
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime, date
from decimal import Decimal

# ============================================
# Common Schemas
# ============================================

class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

class PaginatedResponse(BaseModel):
    """Paginated response wrapper"""
    success: bool = True
    data: dict
    pagination: Optional[dict] = None

class SuccessResponse(BaseModel):
    """Standard success response"""
    success: bool = True
    message: str = "Operation successful"
    data: Optional[dict] = None

class ErrorResponse(BaseModel):
    """Standard error response"""
    success: bool = False
    error: dict
    message: Optional[str] = None

# ============================================
# Auth Schemas
# ============================================

class UserLogin(BaseModel):
    """User login request"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserRegister(BaseModel):
    """User registration request"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)
    role: str = Field(default="admin", pattern="^(admin|accountant|storekeeper)$")

class UserResponse(BaseModel):
    """User response"""
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    refresh_token: str

# ============================================
# Customer Schemas
# ============================================

class CustomerCreate(BaseModel):
    """Create customer"""
    company_name: Optional[str] = Field(None, max_length=200)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    cnic: Optional[str] = Field(None, max_length=20)

class CustomerUpdate(CustomerCreate):
    """Update customer"""
    pass

class CustomerResponse(BaseModel):
    """Customer response"""
    id: str
    company_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    cnic: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# ============================================
# Inventory Schemas
# ============================================

class CategoryCreate(BaseModel):
    """Create category"""
    name: str = Field(..., max_length=50)
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    """Category response"""
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime

class LocationCreate(BaseModel):
    """Create location"""
    name: str = Field(..., max_length=100)
    type: str = Field(..., pattern="^(warehouse|room|rack)$")
    description: Optional[str] = None

class LocationResponse(BaseModel):
    """Location response"""
    id: int
    name: str
    type: str
    description: Optional[str] = None
    created_at: datetime

class ItemCreate(BaseModel):
    """Create item"""
    name: str = Field(..., max_length=200)
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    description: Optional[str] = None
    total_quantity: int = Field(..., ge=0)
    location_id: Optional[int] = None
    tag_serial: Optional[str] = Field(None, max_length=100)
    tag: Optional[str] = Field(None, max_length=100)
    per_day_rate: Decimal = Field(0, ge=0)
    per_event_rate: Decimal = Field(0, ge=0)
    min_stock_level: int = Field(5, ge=0)
    is_active: bool = Field(True)
    item_type: str = Field(default="rentable", pattern="^(rentable|consumable|tool)$")
    unit: Optional[str] = Field(None, max_length=20)
    avg_monthly_usage: Optional[int] = Field(None, ge=0)
    supplier: Optional[str] = Field(None, max_length=200)

class ItemCreate(BaseModel):
    """Create item"""
    name: str = Field(..., max_length=200)
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    description: Optional[str] = None
    total_quantity: int = Field(..., ge=0)
    location_id: Optional[int] = None
    tag_serial: Optional[str] = Field(None, max_length=100)
    tag: Optional[str] = Field(None, max_length=100)
    per_day_rate: Decimal = Field(0, ge=0)
    per_event_rate: Decimal = Field(0, ge=0)
    min_stock_level: int = Field(5, ge=0)
    is_active: bool = Field(True)
    item_type: str = Field(default="rentable", pattern="^(rentable|consumable|tool)$")
    unit: Optional[str] = Field(None, max_length=20)
    avg_monthly_usage: Optional[int] = Field(None, ge=0)
    supplier: Optional[str] = Field(None, max_length=200)

class ItemUpdate(ItemCreate):
    """Update item"""
    pass

class ItemResponse(BaseModel):
    """Item response"""
    id: str
    name: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    description: Optional[str] = None
    total_quantity: int
    available_quantity: int
    rented_quantity: int
    location_id: Optional[int] = None
    location_name: Optional[str] = None
    tag_serial: Optional[str] = None
    tag: Optional[str] = None
    per_day_rate: Decimal
    per_event_rate: Decimal
    min_stock_level: int
    is_active: bool
    item_type: str
    unit: Optional[str] = None
    avg_monthly_usage: Optional[int] = None
    supplier: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class AvailabilityCheck(BaseModel):
    """Availability check request"""
    start_date: date = Field(..., description="Start date for rental period")
    end_date: date = Field(..., description="End date for rental period")
    item_ids: Optional[List[str]] = None

class AvailabilityResponse(BaseModel):
    """Availability check response"""
    item_id: str
    item_name: str
    available_quantity: int
    requested_quantity: int
    is_available: bool

# ============================================
# Order Schemas
# ============================================

class OrderItemCreate(BaseModel):
    """Create order item"""
    item_id: Optional[str] = None
    item_name: str = Field(..., max_length=200)
    quantity: int = Field(..., ge=1)
    rate_per_day: Decimal = Field(0, ge=0)
    rate_per_event: Decimal = Field(0, ge=0)
    days: int = Field(1, ge=1)
    is_partner_item: bool = False
    notes: Optional[str] = None

class OrderCreate(BaseModel):
    """Create order"""
    customer_id: str
    event_name: str = Field(..., max_length=200)
    event_location: str = Field(..., max_length=200)
    start_date: date = Field(..., description="Event start date")
    end_date: date = Field(..., description="Event end date")
    quotation_id: Optional[str] = None
    items: List[OrderItemCreate] = Field(..., min_items=1)
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    """Update order"""
    event_name: Optional[str] = Field(None, max_length=200)
    event_location: Optional[str] = Field(None, max_length=200)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    """Order response"""
    id: str
    order_number: str
    customer_id: str
    customer_name: Optional[str] = None
    event_name: str
    event_location: str
    start_date: date
    end_date: date
    dispatch_date: Optional[date] = None
    return_date: Optional[date] = None
    status: str
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    advance_payment: Decimal
    notes: Optional[str] = None
    items: List[dict]
    created_at: datetime
    updated_at: datetime

# ============================================
# Invoice Schemas
# ============================================

class InvoiceItemCreate(BaseModel):
    """Create invoice item"""
    item_id: Optional[str] = None
    item_name: str = Field(..., max_length=200)
    quantity: int = Field(..., ge=1)
    days: int = Field(1, ge=1)
    rate: Decimal = Field(0, ge=0)

class InvoiceCreate(BaseModel):
    """Create invoice"""
    order_id: str
    customer_id: str
    items: List[InvoiceItemCreate] = Field(..., min_items=1)
    notes: Optional[str] = None

class InvoiceUpdate(BaseModel):
    """Update invoice"""
    status: Optional[str] = None
    notes: Optional[str] = None

class InvoiceResponse(BaseModel):
    """Invoice response"""
    id: str
    order_id: str
    customer_id: str
    customer_name: Optional[str] = None
    invoice_number: str
    invoice_date: date
    due_date: Optional[date] = None
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    paid_amount: Decimal
    balance: Decimal
    status: str
    payment_mode: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class PaymentCreate(BaseModel):
    """Create payment"""
    amount: Decimal = Field(..., gt=0)
    payment_mode: str = Field(..., pattern="^(cash|online|credit|adjustment)$")
    reference_number: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class PaymentResponse(BaseModel):
    """Payment response"""
    id: str
    invoice_id: str
    customer_id: str
    payment_date: date
    amount: Decimal
    payment_mode: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

# ============================================
# Quotation Schemas
# ============================================

class QuotationItemCreate(OrderItemCreate):
    """Create quotation item"""
    pass

class QuotationItemResponse(BaseModel):
    """Quotation item response"""
    id: str
    quotation_id: str
    item_id: Optional[str] = None
    item_name: str
    quantity: int
    rate_per_day: Decimal
    rate_per_event: Decimal
    days: int
    total_amount: Decimal
    notes: Optional[str] = None
    created_at: datetime

class QuotationCreate(BaseModel):
    """Create quotation"""
    customer_id: str
    event_name: str = Field(..., max_length=200)
    event_location: str = Field(..., max_length=200)
    event_date: Optional[date] = None
    validity_date: Optional[date] = None
    items: List[QuotationItemCreate] = Field(..., min_items=1)
    notes: Optional[str] = None
    terms: Optional[str] = None

class QuotationUpdate(BaseModel):
    """Update quotation"""
    event_name: Optional[str] = None
    event_location: Optional[str] = None
    event_date: Optional[date] = None
    validity_date: Optional[date] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    terms: Optional[str] = None

class QuotationResponse(BaseModel):
    """Quotation response"""
    id: str
    customer_id: str
    customer_name: Optional[str] = None
    quotation_number: str
    event_name: str
    event_location: str
    event_date: Optional[date] = None
    creation_date: date
    validity_date: Optional[date] = None
    status: str
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    advance_payment: Decimal
    notes: Optional[str] = None
    terms: Optional[str] = None
    items: List[dict] = []
    created_at: datetime
    updated_at: datetime

# ============================================
# Rental Schemas
# ============================================

class RentalCreate(BaseModel):
    """Create rental (order-based)"""
    order_id: str
    dispatch_date: Optional[date] = None
    notes: Optional[str] = None

class RentalUpdate(BaseModel):
    """Update rental"""
    status: Optional[str] = None
    return_date: Optional[date] = None
    notes: Optional[str] = None

class RentalResponse(BaseModel):
    """Rental response"""
    id: str
    order_number: str
    customer_id: str
    customer_name: Optional[str] = None
    event_name: str
    event_location: str
    start_date: date
    end_date: date
    dispatch_date: Optional[date] = None
    return_date: Optional[date] = None
    status: str
    total_amount: Decimal
    advance_payment: Decimal
    balance: Decimal
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

# ============================================
# Return Schemas
# ============================================

class ReturnItemCreate(BaseModel):
    """Create return item"""
    order_item_id: str
    quantity_returned: int = Field(..., ge=0)
    condition: str = Field(default="good", pattern="^(good|damaged|missing)$")
    responsibility: Optional[str] = Field(None, pattern="^(customer|internal)$")
    damage_description: Optional[str] = None
    recovery_amount: Decimal = Field(0, ge=0)
    added_to_stock: bool = Field(False)

class ReturnCreate(BaseModel):
    """Create return"""
    order_id: str
    items: List[ReturnItemCreate]
    notes: Optional[str] = None

class ReturnResponse(BaseModel):
    """Return response"""
    id: str
    order_id: str
    order_number: str
    return_date: date
    status: str
    notes: Optional[str] = None
    items: List[dict] = []
    created_at: datetime
    updated_at: datetime

# ============================================
# Ledger Schemas
# ============================================

class LedgerBalanceResponse(BaseModel):
    """Customer ledger balance"""
    customer_id: str
    customer_name: str
    total_invoiced: Decimal
    total_paid: Decimal
    outstanding_balance: Decimal

class LedgerTransactionResponse(BaseModel):
    """Ledger transaction"""
    id: str
    customer_id: str
    invoice_id: Optional[str] = None
    payment_id: Optional[str] = None
    transaction_date: date
    type: str
    description: Optional[str] = None
    debit_amount: Decimal
    credit_amount: Decimal
    balance: Decimal
    created_at: datetime

# ============================================
# Dashboard Schemas
# ============================================

class DashboardStatsResponse(BaseModel):
    """Dashboard statistics"""
    total_inventory: int
    rentable_items: int
    consumables: int
    tools: int
    active_rentals: int
    low_stock_items: int
    pending_orders: int
    pending_invoices: int
    overdue_invoices: int
    total_customers: int
    pending_notifications: int
    revenue: float
    revenue_previous: float
    revenue_delta_pct: Optional[float] = None
    range: str

class NotificationResponse(BaseModel):
    """Notification response"""
    id: str
    type: str
    title: str
    message: str
    reference_id: Optional[str] = None
    reference_type: Optional[str] = None
    status: str
    created_at: datetime

# ============================================
# Settings Schemas
# ============================================

class SettingUpdate(BaseModel):
    """Update setting"""
    value: str = Field(..., min_length=1)
    description: Optional[str] = None

class SettingResponse(BaseModel):
    """Setting response"""
    key: str
    value: str
    description: Optional[str] = None
    category: Optional[str] = None
    updated_at: datetime
