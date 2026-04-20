"""
Ledger Router - Customer ledger and transaction endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
from decimal import Decimal

from database.connection import get_db
from models import LedgerTransaction, Customer, Invoice, Payment
from schemas import SuccessResponse

router = APIRouter(prefix="/api/ledger", tags=["Ledger"])


@router.get("")
async def list_ledger(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    customer_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """List all ledger transactions with filtering"""
    try:
        query = db.query(LedgerTransaction)
        
        if customer_id:
            query = query.filter(LedgerTransaction.customer_id == customer_id)
        if start_date:
            query = query.filter(LedgerTransaction.transaction_date >= start_date)
        if end_date:
            query = query.filter(LedgerTransaction.transaction_date <= end_date)
        
        total = query.count()
        offset = (page - 1) * page_size
        transactions = query.order_by(LedgerTransaction.transaction_date.desc()).offset(offset).limit(page_size).all()
        
        transaction_list = []
        for txn in transactions:
            customer = db.query(Customer).filter(Customer.id == txn.customer_id).first()
            transaction_list.append({
                "id": str(txn.id),
                "customer_id": str(txn.customer_id),
                "customer_name": f"{customer.first_name or ''} {customer.last_name or ''} {customer.company_name or ''}".strip() if customer else "Unknown",
                "invoice_id": str(txn.invoice_id) if txn.invoice_id else None,
                "payment_id": str(txn.payment_id) if txn.payment_id else None,
                "transaction_date": txn.transaction_date.isoformat(),
                "type": txn.type,
                "description": txn.description,
                "debit_amount": float(txn.debit_amount),
                "credit_amount": float(txn.credit_amount),
                "balance": float(txn.balance),
                "created_at": txn.created_at.isoformat() if txn.created_at else None
            })
        
        return {
            "success": True,
            "data": {
                "transactions": transaction_list,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "pages": (total + page_size - 1) // page_size
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/customers/{customer_id}")
async def get_customer_ledger(customer_id: str, db: Session = Depends(get_db)):
    """Get customer ledger summary"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Calculate totals
    total_invoiced = db.query(func.sum(LedgerTransaction.debit_amount)).filter(
        LedgerTransaction.customer_id == customer_id,
        LedgerTransaction.type == 'invoice'
    ).scalar() or 0
    
    total_paid = db.query(func.sum(LedgerTransaction.credit_amount)).filter(
        LedgerTransaction.customer_id == customer_id,
        LedgerTransaction.type == 'payment'
    ).scalar() or 0
    
    outstanding = Decimal(str(total_invoiced)) - Decimal(str(total_paid))
    
    # Get last transaction
    last_txn = db.query(LedgerTransaction).filter(
        LedgerTransaction.customer_id == customer_id
    ).order_by(LedgerTransaction.transaction_date.desc()).first()
    
    last_payment_date = last_txn.transaction_date.isoformat() if last_txn and last_txn.type == 'payment' else None
    
    return {
        "success": True,
        "data": {
            "customer_id": str(customer.id),
            "customer_name": f"{customer.first_name or ''} {customer.last_name or ''} {customer.company_name or ''}".strip(),
            "total_invoiced": float(total_invoiced),
            "total_paid": float(total_paid),
            "outstanding_balance": float(outstanding),
            "last_payment_date": last_payment_date,
            "status": "paid" if outstanding == 0 else "partial" if outstanding > 0 else "credit"
        }
    }


@router.get("/customers/{customer_id}/transactions")
async def get_customer_transactions(
    customer_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get detailed transactions for a customer"""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    total = db.query(LedgerTransaction).filter(LedgerTransaction.customer_id == customer_id).count()
    offset = (page - 1) * page_size
    
    transactions = db.query(LedgerTransaction).filter(
        LedgerTransaction.customer_id == customer_id
    ).order_by(LedgerTransaction.transaction_date.desc()).offset(offset).limit(page_size).all()
    
    transaction_list = []
    for txn in transactions:
        transaction_list.append({
            "id": str(txn.id),
            "transaction_date": txn.transaction_date.isoformat(),
            "type": txn.type,
            "description": txn.description,
            "invoice_number": None,
            "debit_amount": float(txn.debit_amount),
            "credit_amount": float(txn.credit_amount),
            "balance": float(txn.balance),
            "created_at": txn.created_at.isoformat() if txn.created_at else None
        })
    
    return {
        "success": True,
        "data": {
            "customer_id": str(customer.id),
            "customer_name": f"{customer.first_name or ''} {customer.last_name or ''} {customer.company_name or ''}".strip(),
            "transactions": transaction_list,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "pages": (total + page_size - 1) // page_size
            }
        }
    }


@router.post("/transactions")
async def create_transaction(transaction_data: dict, db: Session = Depends(get_db)):
    """Create a manual ledger transaction"""
    try:
        customer = db.query(Customer).filter(Customer.id == transaction_data["customer_id"]).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get last balance for customer
        last_txn = db.query(LedgerTransaction).filter(
            LedgerTransaction.customer_id == transaction_data["customer_id"]
        ).order_by(LedgerTransaction.transaction_date.desc()).first()
        
        last_balance = Decimal(str(last_txn.balance)) if last_txn else Decimal('0')
        
        debit = Decimal(str(transaction_data.get("debit_amount", 0)))
        credit = Decimal(str(transaction_data.get("credit_amount", 0)))
        
        new_balance = last_balance + debit - credit
        
        transaction = LedgerTransaction(
            customer_id=transaction_data["customer_id"],
            invoice_id=transaction_data.get("invoice_id"),
            payment_id=transaction_data.get("payment_id"),
            transaction_date=date.fromisoformat(transaction_data.get("transaction_date", date.today().isoformat())),
            type=transaction_data["type"],
            description=transaction_data.get("description"),
            debit_amount=debit,
            credit_amount=credit,
            balance=new_balance
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return {
            "success": True,
            "message": "Transaction created successfully",
            "data": {"id": str(transaction.id), "balance": float(new_balance)}
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
