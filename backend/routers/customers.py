"""
Customer management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from decimal import Decimal

from database.connection import get_db
from models import Customer, Quotation, Order, Invoice, LedgerTransaction
from schemas import CustomerCreate, CustomerUpdate, CustomerResponse, PaginatedResponse, SuccessResponse
import uuid

# Router
router = APIRouter( tags=["Customers"])

def get_customer_with_relations(db: Session, customer_id: str):
    """Get customer with related data"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    return customer

@router.get("", response_model=PaginatedResponse)
async def list_customers(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None
):
    """List customers with pagination and search"""
    query = db.query(Customer)

    # Apply search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            db.or_(
                Customer.company_name.ilike(search_term),
                Customer.first_name.ilike(search_term),
                Customer.last_name.ilike(search_term),
                Customer.email.ilike(search_term)
            )
        )

    # Get total count
    total = query.count()

    # Apply pagination
    customers = query.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedResponse(
        success=True,
        data={
            "customers": [
                CustomerResponse(
                    id=str(customer.id),
                    company_name=customer.company_name,
                    first_name=customer.first_name,
                    last_name=customer.last_name,
                    phone=customer.phone,
                    email=customer.email,
                    address=customer.address,
                    city=customer.city,
                    country=customer.country,
                    cnic=customer.cnic,
                    created_at=customer.created_at,
                    updated_at=customer.updated_at
                )
                for customer in customers
            ],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size
            }
        }
    )

@router.post("", response_model=CustomerResponse)
async def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer"""
    db_customer = Customer(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)

    return CustomerResponse(
        id=str(db_customer.id),
        company_name=db_customer.company_name,
        first_name=db_customer.first_name,
        last_name=db_customer.last_name,
        phone=db_customer.phone,
        email=db_customer.email,
        address=db_customer.address,
        city=db_customer.city,
        country=db_customer.country,
        cnic=db_customer.cnic,
        created_at=db_customer.created_at,
        updated_at=db_customer.updated_at
    )

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str, db: Session = Depends(get_db)):
    """Get customer by ID"""
    customer = get_customer_with_relations(db, customer_id)

    return CustomerResponse(
        id=str(customer.id),
        company_name=customer.company_name,
        first_name=customer.first_name,
        last_name=customer.last_name,
        phone=customer.phone,
        email=customer.email,
        address=customer.address,
        city=customer.city,
        country=customer.country,
        cnic=customer.cnic,
        created_at=customer.created_at,
        updated_at=customer.updated_at
    )

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: str,
    customer: CustomerUpdate,
    db: Session = Depends(get_db)
):
    """Update customer"""
    db_customer = get_customer_with_relations(db, customer_id)

    # Update fields
    update_data = customer.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_customer, field, value)

    db.commit()
    db.refresh(db_customer)

    return CustomerResponse(
        id=str(db_customer.id),
        company_name=db_customer.company_name,
        first_name=db_customer.first_name,
        last_name=db_customer.last_name,
        phone=db_customer.phone,
        email=db_customer.email,
        address=db_customer.address,
        city=db_customer.city,
        country=db_customer.country,
        cnic=db_customer.cnic,
        created_at=db_customer.created_at,
        updated_at=db_customer.updated_at
    )

@router.delete("/{customer_id}", response_model=SuccessResponse)
async def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    """Delete customer"""
    customer = get_customer_with_relations(db, customer_id)

    db.delete(customer)
    db.commit()

    return SuccessResponse(message="Customer deleted successfully")

@router.get("/{customer_id}/orders")
async def get_customer_orders(customer_id: str, db: Session = Depends(get_db)):
    """Get all orders for a customer"""
    from models import Order

    customer = get_customer_with_relations(db, customer_id)

    orders = db.query(Order).filter(Order.customer_id == customer_id).all()

    return {
        "success": True,
        "data": {
            "customer_id": str(customer.id),
            "customer_name": customer.company_name or f"{customer.first_name} {customer.last_name}",
            "orders": [
                {
                    "id": str(order.id),
                    "order_number": order.order_number,
                    "event_name": order.event_name,
                    "event_location": order.event_location,
                    "start_date": order.start_date.isoformat() if order.start_date else None,
                    "end_date": order.end_date.isoformat() if order.end_date else None,
                    "status": order.status,
                    "total_amount": float(order.total_amount),
                    "created_at": order.created_at.isoformat()
                }
                for order in orders
            ]
        }
    }

@router.get("/{customer_id}/ledger")
async def get_customer_ledger(customer_id: str, db: Session = Depends(get_db)):
    """Get customer ledger with balance"""
    customer = get_customer_with_relations(db, customer_id)

    transactions = db.query(LedgerTransaction).filter(
        LedgerTransaction.customer_id == customer_id
    ).order_by(LedgerTransaction.transaction_date.desc()).all()

    # Calculate totals
    total_invoiced = sum(t.debit_amount for t in transactions)
    total_paid = sum(t.credit_amount for t in transactions)
    outstanding = total_invoiced - total_paid

    return {
        "success": True,
        "data": {
            "customer_id": str(customer.id),
            "customer_name": customer.company_name or f"{customer.first_name} {customer.last_name}",
            "total_invoiced": total_invoiced,
            "total_paid": total_paid,
            "outstanding_balance": outstanding,
            "transactions": [
                {
                    "id": str(t.id),
                    "transaction_date": t.transaction_date.isoformat(),
                    "type": t.type,
                    "description": t.description,
                    "debit_amount": float(t.debit_amount),
                    "credit_amount": float(t.credit_amount),
                    "balance": float(t.balance),
                    "created_at": t.created_at.isoformat()
                }
                for t in transactions
            ]
        }
    }

@router.post("/{customer_id}/statement")
async def generate_customer_statement(
    customer_id: str,
    month: str = Query(..., description="Format: YYYY-MM"),
    db: Session = Depends(get_db)
):
    """Generate customer statement for given month"""
    customer = get_customer_with_relations(db, customer_id)

    # Filter transactions by month
    transactions = db.query(LedgerTransaction).filter(
        db.and_(
            LedgerTransaction.customer_id == customer_id,
            LedgerTransaction.transaction_date.like(f"{month}%")
        )
    ).order_by(LedgerTransaction.transaction_date.asc()).all()

    # Calculate totals
    total_invoiced = sum(t.debit_amount for t in transactions)
    total_paid = sum(t.credit_amount for t in transactions)
    outstanding = total_invoiced - total_paid

    return {
        "success": True,
        "data": {
            "customer_id": str(customer.id),
            "customer_name": customer.company_name or f"{customer.first_name} {customer.last_name}",
            "month": month,
            "opening_balance": 0,  # Would need previous month's closing balance
            "total_invoiced": total_invoiced,
            "total_paid": total_paid,
            "outstanding_balance": outstanding,
            "transactions": [
                {
                    "id": str(t.id),
                    "transaction_date": t.transaction_date.isoformat(),
                    "type": t.type,
                    "description": t.description,
                    "debit_amount": float(t.debit_amount),
                    "credit_amount": float(t.credit_amount),
                    "balance": float(t.balance),
                    "created_at": t.created_at.isoformat()
                }
                for t in transactions
            ]
        }
    }
