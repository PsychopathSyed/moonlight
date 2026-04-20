"""
Invoices Router - Complete Implementation
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
from datetime import date
import uuid

from database.connection import get_db
from models import Invoice, InvoiceItem, Customer, Order
from schemas import InvoiceResponse, InvoiceCreate, InvoiceUpdate

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

# ============================================
# Invoice Operations
# ============================================

@router.get("", response_model=dict)
async def list_invoices(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
    customer_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all invoices with pagination and filtering
    """
    try:
        query = db.query(Invoice).order_by(Invoice.created_at.desc())

        # Apply filters
        if status_filter:
            query = query.filter(Invoice.status == status_filter)
        if customer_id:
            query = query.filter(Invoice.customer_id == customer_id)

        # Pagination
        total = query.count()
        offset = (page - 1) * page_size
        invoices = query.offset(offset).limit(page_size).all()

        # Convert to response format
        invoice_list = []
        for invoice in invoices:
            # Get customer name
            customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
            customer_name = customer.name if customer else "Unknown"

            # Get items
            items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()

            invoice_list.append({
                "id": str(invoice.id),
                "invoice_number": invoice.invoice_number,
                "customer_id": str(invoice.customer_id) if invoice.customer_id else None,
                "customer_name": customer_name,
                "invoice_date": invoice.invoice_date.isoformat() if invoice.invoice_date else None,
                "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
                "subtotal": float(invoice.subtotal),
                "tax_amount": float(invoice.tax_amount),
                "discount_amount": float(invoice.discount_amount),
                "total_amount": float(invoice.total_amount),
                "paid_amount": float(invoice.paid_amount),
                "balance": float(invoice.balance),
                "status": invoice.status,
                "payment_mode": invoice.payment_mode,
                "items_count": len(items),
                "created_at": invoice.created_at.isoformat() if invoice.created_at else None
            })

        return {
            "success": True,
            "data": {
                "invoices": invoice_list,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "total_pages": (total + page_size - 1) // page_size
                }
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching invoices: {str(e)}"
        )

@router.get("/{invoice_id}", response_model=dict)
async def get_invoice(invoice_id: str, db: Session = Depends(get_db)):
    """
    Get invoice by ID with full details including items
    """
    try:
        invoice = db.query(Invoice).filter(Invoice.id == uuid.UUID(invoice_id)).first()

        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )

        # Get customer name
        customer = db.query(Customer).filter(Customer.id == invoice.customer_id).first()
        customer_name = customer.name if customer else "Unknown"

        # Get items
        items = db.query(InvoiceItem).filter(InvoiceItem.invoice_id == invoice.id).all()
        items_list = [
            {
                "id": str(item.id),
                "item_id": str(item.item_id) if item.item_id else None,
                "item_name": item.item_name,
                "quantity": item.quantity,
                "days": item.days,
                "rate": float(item.rate),
                "total_amount": float(item.total_amount)
            }
            for item in items
        ]

        return {
            "success": True,
            "data": {
                "id": str(invoice.id),
                "invoice_number": invoice.invoice_number,
                "customer_id": str(invoice.customer_id) if invoice.customer_id else None,
                "customer_name": customer_name,
                "order_id": invoice.order_id,
                "invoice_date": invoice.invoice_date.isoformat() if invoice.invoice_date else None,
                "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
                "subtotal": float(invoice.subtotal),
                "tax_amount": float(invoice.tax_amount),
                "discount_amount": float(invoice.discount_amount),
                "total_amount": float(invoice.total_amount),
                "paid_amount": float(invoice.paid_amount),
                "balance": float(invoice.balance),
                "status": invoice.status,
                "payment_mode": invoice.payment_mode,
                "notes": invoice.notes,
                "items": items_list,
                "created_at": invoice.created_at.isoformat() if invoice.created_at else None,
                "updated_at": invoice.updated_at.isoformat() if invoice.updated_at else None
            }
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid invoice ID format"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching invoice: {str(e)}"
        )

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_invoice(invoice: dict, db: Session = Depends(get_db)):
    """
    Create new invoice
    """
    try:
        import logging
        logger = logging.getLogger(__name__)

        # Generate invoice number if not provided
        if not invoice.get("invoice_number"):
            last_invoice = db.query(Invoice).order_by(Invoice.created_at.desc()).first()
            if last_invoice and last_invoice.invoice_number:
                try:
                    last_num = int(last_invoice.invoice_number.replace("INV-", ""))
                    new_invoice_num = f"INV-{last_num + 1:04d}"
                except:
                    new_invoice_num = "INV-0001"
            else:
                new_invoice_num = "INV-0001"
            invoice["invoice_number"] = new_invoice_num

        # Create invoice
        new_invoice = Invoice(
            invoice_number=invoice.get("invoice_number"),
            customer_id=uuid.UUID(invoice["customer_id"]) if invoice.get("customer_id") else None,
            order_id=invoice.get("order_id"),
            invoice_date=invoice.get("invoice_date") or date.today(),
            due_date=invoice.get("due_date"),
            subtotal=Decimal(str(invoice.get("subtotal", 0))),
            tax_amount=Decimal(str(invoice.get("tax_amount", 0))),
            discount_amount=Decimal(str(invoice.get("discount_amount", 0))),
            total_amount=Decimal(str(invoice.get("total_amount", 0))),
            paid_amount=Decimal(str(invoice.get("paid_amount", 0))),
            balance=Decimal(str(invoice.get("total_amount", 0)) - Decimal(str(invoice.get("paid_amount", 0)))),
            status=invoice.get("status", "pending"),
            payment_mode=invoice.get("payment_mode"),
            notes=invoice.get("notes")
        )

        db.add(new_invoice)
        db.commit()
        db.refresh(new_invoice)

        # Create invoice items if provided
        items_data = invoice.get("items", [])
        for item_data in items_data:
            invoice_item = InvoiceItem(
                invoice_id=new_invoice.id,
                item_id=uuid.UUID(item_data["item_id"]) if item_data.get("item_id") else None,
                item_name=item_data.get("item_name"),
                quantity=item_data.get("quantity", 1),
                days=item_data.get("days", 1),
                rate=Decimal(str(item_data.get("rate", 0))),
                total_amount=Decimal(str(item_data.get("total_amount", 0)))
            )
            db.add(invoice_item)

        db.commit()

        logger.info(f"Invoice created successfully: id={new_invoice.id}, number={new_invoice.invoice_number}")

        return {
            "success": True,
            "data": {
                "id": str(new_invoice.id),
                "invoice_number": new_invoice.invoice_number,
                "total_amount": float(new_invoice.total_amount),
                "status": new_invoice.status
            }
        }
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error creating invoice: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating invoice: {str(e)}"
        )

@router.put("/{invoice_id}", response_model=dict)
async def update_invoice(invoice_id: str, invoice: dict, db: Session = Depends(get_db)):
    """
    Update existing invoice
    """
    try:
        import logging
        logger = logging.getLogger(__name__)

        # Get existing invoice
        existing_invoice = db.query(Invoice).filter(Invoice.id == uuid.UUID(invoice_id)).first()

        if not existing_invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )

        # Update fields
        if "subtotal" in invoice:
            existing_invoice.subtotal = Decimal(str(invoice["subtotal"]))
        if "tax_amount" in invoice:
            existing_invoice.tax_amount = Decimal(str(invoice["tax_amount"]))
        if "discount_amount" in invoice:
            existing_invoice.discount_amount = Decimal(str(invoice["discount_amount"]))
        if "total_amount" in invoice:
            existing_invoice.total_amount = Decimal(str(invoice["total_amount"]))
        if "paid_amount" in invoice:
            existing_invoice.paid_amount = Decimal(str(invoice["paid_amount"]))
            # Recalculate balance
            existing_invoice.balance = existing_invoice.total_amount - existing_invoice.paid_amount
        if "status" in invoice:
            existing_invoice.status = invoice["status"]
        if "payment_mode" in invoice:
            existing_invoice.payment_mode = invoice["payment_mode"]
        if "due_date" in invoice:
            existing_invoice.due_date = invoice["due_date"]
        if "notes" in invoice:
            existing_invoice.notes = invoice["notes"]

        db.commit()
        db.refresh(existing_invoice)

        logger.info(f"Invoice updated successfully: id={existing_invoice.id}")

        return {
            "success": True,
            "data": {
                "id": str(existing_invoice.id),
                "invoice_number": existing_invoice.invoice_number,
                "status": existing_invoice.status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error updating invoice: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating invoice: {str(e)}"
        )

@router.delete("/{invoice_id}", response_model=dict)
async def delete_invoice(invoice_id: str, db: Session = Depends(get_db)):
    """
    Delete invoice and associated items
    """
    try:
        import logging
        logger = logging.getLogger(__name__)

        # Delete invoice items first
        db.query(InvoiceItem).filter(InvoiceItem.invoice_id == uuid.UUID(invoice_id)).delete()

        # Delete invoice
        invoice = db.query(Invoice).filter(Invoice.id == uuid.UUID(invoice_id)).first()
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invoice not found"
            )

        db.delete(invoice)
        db.commit()

        logger.info(f"Invoice deleted successfully: id={invoice_id}")

        return {
            "success": True,
            "message": "Invoice deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error deleting invoice: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting invoice: {str(e)}"
        )
