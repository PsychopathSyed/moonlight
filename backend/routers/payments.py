"""
Payments Router - Complete Implementation
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import date
import uuid
import logging

from database.connection import get_db
from models import Payment, Invoice, Customer
from schemas import PaymentCreate, PaymentResponse

router = APIRouter(prefix="/api/payments", tags=["Payments"])

logger = logging.getLogger(__name__)

# ============================================
# Payment Operations
# ============================================

@router.get("", response_model=dict)
async def list_payments(
    page: int = 1,
    page_size: int = 20,
    invoice_id: Optional[str] = None,
    customer_id: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all payments with pagination and filtering
    """
    try:
        query = db.query(Payment).order_by(Payment.payment_date.desc(), Payment.created_at.desc())

        # Apply filters
        if invoice_id:
            query = query.filter(Payment.invoice_id == uuid.UUID(invoice_id))
        if customer_id:
            query = query.filter(Payment.customer_id == uuid.UUID(customer_id))
        if from_date:
            query = query.filter(Payment.payment_date >= from_date)
        if to_date:
            query = query.filter(Payment.payment_date <= to_date)

        # Pagination
        total = query.count()
        offset = (page - 1) * page_size
        payments = query.offset(offset).limit(page_size).all()

        # Convert to response format
        payment_list = []
        for payment in payments:
            # Get invoice details
            invoice = db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
            invoice_number = invoice.invoice_number if invoice else "Unknown"

            # Get customer details
            customer = db.query(Customer).filter(Customer.id == payment.customer_id).first()
            customer_name = customer.name if customer else "Unknown"

            payment_list.append({
                "id": str(payment.id),
                "invoice_id": str(payment.invoice_id) if payment.invoice_id else None,
                "invoice_number": invoice_number,
                "customer_id": str(payment.customer_id) if payment.customer_id else None,
                "customer_name": customer_name,
                "payment_date": payment.payment_date.isoformat() if payment.payment_date else None,
                "amount": float(payment.amount),
                "payment_mode": payment.payment_mode,
                "reference_number": payment.reference_number,
                "notes": payment.notes,
                "created_at": payment.created_at.isoformat() if payment.created_at else None
            })

        return {
            "success": True,
            "data": {
                "payments": payment_list,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "total_pages": (total + page_size - 1) // page_size
                }
            }
        }
    except Exception as e:
        logger.error(f"Error fetching payments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching payments: {str(e)}"
        )

@router.get("/{payment_id}", response_model=dict)
async def get_payment(payment_id: str, db: Session = Depends(get_db)):
    """
    Get payment by ID with full details
    """
    try:
        payment = db.query(Payment).filter(Payment.id == uuid.UUID(payment_id)).first()

        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )

        # Get invoice details
        invoice = db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
        invoice_number = invoice.invoice_number if invoice else "Unknown"
        invoice_total = float(invoice.total_amount) if invoice else 0.0

        # Get customer details
        customer = db.query(Customer).filter(Customer.id == payment.customer_id).first()
        customer_name = customer.name if customer else "Unknown"

        return {
            "success": True,
            "data": {
                "id": str(payment.id),
                "invoice_id": str(payment.invoice_id) if payment.invoice_id else None,
                "invoice_number": invoice_number,
                "invoice_total": invoice_total,
                "customer_id": str(payment.customer_id) if payment.customer_id else None,
                "customer_name": customer_name,
                "payment_date": payment.payment_date.isoformat() if payment.payment_date else None,
                "amount": float(payment.amount),
                "payment_mode": payment.payment_mode,
                "reference_number": payment.reference_number,
                "notes": payment.notes,
                "created_at": payment.created_at.isoformat() if payment.created_at else None
            }
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment ID format"
        )
    except Exception as e:
        logger.error(f"Error fetching payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching payment: {str(e)}"
        )

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_payment(payment: dict, db: Session = Depends(get_db)):
    """
    Create new payment and update invoice balance
    """
    try:
        # Validate invoice exists
        if payment.get("invoice_id"):
            invoice = db.query(Invoice).filter(Invoice.id == uuid.UUID(payment["invoice_id"])).first()
            if not invoice:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Invoice not found"
                )

        # Create payment
        new_payment = Payment(
            invoice_id=uuid.UUID(payment["invoice_id"]) if payment.get("invoice_id") else None,
            customer_id=uuid.UUID(payment["customer_id"]) if payment.get("customer_id") else None,
            payment_date=payment.get("payment_date") or date.today(),
            amount=Decimal(str(payment.get("amount", 0))),
            payment_mode=payment.get("payment_mode"),
            reference_number=payment.get("reference_number"),
            notes=payment.get("notes")
        )

        db.add(new_payment)
        db.commit()
        db.refresh(new_payment)

        # Update invoice paid amount if invoice_id provided
        if payment.get("invoice_id"):
            invoice.paid_amount += new_payment.amount
            invoice.balance = invoice.total_amount - invoice.paid_amount

            # Update invoice status if fully paid
            if invoice.balance <= 0:
                invoice.status = "paid"
            elif invoice.paid_amount > 0:
                invoice.status = "partial"

            db.commit()
            db.refresh(invoice)

        logger.info(f"Payment created successfully: id={new_payment.id}, amount={new_payment.amount}")

        return {
            "success": True,
            "data": {
                "id": str(new_payment.id),
                "invoice_id": str(new_payment.invoice_id) if new_payment.invoice_id else None,
                "amount": float(new_payment.amount),
                "payment_date": new_payment.payment_date.isoformat() if new_payment.payment_date else None,
                "created_at": new_payment.created_at.isoformat() if new_payment.created_at else None
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating payment: {str(e)}"
        )

@router.put("/{payment_id}", response_model=dict)
async def update_payment(payment_id: str, payment: dict, db: Session = Depends(get_db)):
    """
    Update existing payment
    """
    try:
        # Get existing payment
        existing_payment = db.query(Payment).filter(Payment.id == uuid.UUID(payment_id)).first()

        if not existing_payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )

        old_amount = existing_payment.amount

        # Update fields
        if "amount" in payment:
            existing_payment.amount = Decimal(str(payment["amount"]))
        if "payment_date" in payment:
            existing_payment.payment_date = payment["payment_date"]
        if "payment_mode" in payment:
            existing_payment.payment_mode = payment["payment_mode"]
        if "reference_number" in payment:
            existing_payment.reference_number = payment["reference_number"]
        if "notes" in payment:
            existing_payment.notes = payment["notes"]

        db.commit()
        db.refresh(existing_payment)

        # Update invoice if amount changed and payment has invoice
        if existing_payment.invoice_id and "amount" in payment:
            invoice = db.query(Invoice).filter(Invoice.id == existing_payment.invoice_id).first()
            if invoice:
                # Recalculate paid amount
                invoice.paid_amount = invoice.paid_amount - old_amount + existing_payment.amount
                invoice.balance = invoice.total_amount - invoice.paid_amount

                # Update invoice status
                if invoice.balance <= 0:
                    invoice.status = "paid"
                elif invoice.paid_amount > 0:
                    invoice.status = "partial"
                else:
                    invoice.status = "pending"

                db.commit()

        logger.info(f"Payment updated successfully: id={existing_payment.id}")

        return {
            "success": True,
            "data": {
                "id": str(existing_payment.id),
                "amount": float(existing_payment.amount)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating payment: {str(e)}"
        )

@router.delete("/{payment_id}", response_model=dict)
async def delete_payment(payment_id: str, db: Session = Depends(get_db)):
    """
    Delete payment and update invoice balance
    """
    try:
        # Get payment
        payment = db.query(Payment).filter(Payment.id == uuid.UUID(payment_id)).first()
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )

        # Update invoice if payment has invoice
        if payment.invoice_id:
            invoice = db.query(Invoice).filter(Invoice.id == payment.invoice_id).first()
            if invoice:
                invoice.paid_amount -= payment.amount
                invoice.balance = invoice.total_amount - invoice.paid_amount

                # Update invoice status
                if invoice.balance <= 0:
                    invoice.status = "paid"
                elif invoice.paid_amount > 0:
                    invoice.status = "partial"
                else:
                    invoice.status = "pending"

                db.commit()

        # Delete payment
        db.delete(payment)
        db.commit()

        logger.info(f"Payment deleted successfully: id={payment_id}")

        return {
            "success": True,
            "message": "Payment deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting payment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting payment: {str(e)}"
        )
