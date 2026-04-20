"""
Quotations Router - Complete Implementation
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
from models import Quotation, QuotationItem, Customer
from schemas import QuotationResponse, QuotationCreate

router = APIRouter(prefix="/api/quotations", tags=["Quotations"])

logger = logging.getLogger(__name__)

# ============================================
# Quotation Operations
# ============================================

@router.get("", response_model=dict)
async def list_quotations(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
    customer_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all quotations with pagination and filtering
    """
    try:
        query = db.query(Quotation).order_by(Quotation.created_at.desc())

        # Apply filters
        if status_filter:
            query = query.filter(Quotation.status == status_filter)
        if customer_id:
            query = query.filter(Quotation.customer_id == customer_id)

        # Pagination
        total = query.count()
        offset = (page - 1) * page_size
        quotations = query.offset(offset).limit(page_size).all()

        # Convert to response format
        quotation_list = []
        for quotation in quotations:
            # Get customer name
            customer = db.query(Customer).filter(Customer.id == quotation.customer_id).first()
            customer_name = customer.name if customer else "Unknown"

            # Get items
            items = db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation.id).all()

            quotation_list.append({
                "id": str(quotation.id),
                "quotation_number": quotation.quotation_number,
                "customer_id": str(quotation.customer_id) if quotation.customer_id else None,
                "customer_name": customer_name,
                "event_name": quotation.event_name,
                "event_location": quotation.event_location,
                "event_date": quotation.event_date.isoformat() if quotation.event_date else None,
                "creation_date": quotation.creation_date.isoformat() if quotation.creation_date else None,
                "validity_date": quotation.validity_date.isoformat() if quotation.validity_date else None,
                "subtotal": float(quotation.subtotal),
                "tax_amount": float(quotation.tax_amount),
                "discount_amount": float(quotation.discount_amount),
                "total_amount": float(quotation.total_amount),
                "advance_payment": float(quotation.advance_payment),
                "status": quotation.status,
                "items_count": len(items),
                "created_at": quotation.created_at.isoformat() if quotation.created_at else None
            })

        return {
            "success": True,
            "data": {
                "quotations": quotation_list,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "total_pages": (total + page_size - 1) // page_size
                }
            }
        }
    except Exception as e:
        logger.error(f"Error fetching quotations: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching quotations: {str(e)}"
        )

@router.get("/{quotation_id}", response_model=dict)
async def get_quotation(quotation_id: str, db: Session = Depends(get_db)):
    """
    Get quotation by ID with full details including items
    """
    try:
        quotation = db.query(Quotation).filter(Quotation.id == uuid.UUID(quotation_id)).first()

        if not quotation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )

        # Get customer name
        customer = db.query(Customer).filter(Customer.id == quotation.customer_id).first()
        customer_name = customer.name if customer else "Unknown"

        # Get items
        items = db.query(QuotationItem).filter(QuotationItem.quotation_id == quotation.id).all()
        items_list = [
            {
                "id": str(item.id),
                "item_id": str(item.item_id) if item.item_id else None,
                "item_name": item.item_name,
                "quantity": item.quantity,
                "rate_per_day": float(item.rate_per_day),
                "rate_per_event": float(item.rate_per_event),
                "days": item.days,
                "total_amount": float(item.total_amount),
                "notes": item.notes
            }
            for item in items
        ]

        return {
            "success": True,
            "data": {
                "id": str(quotation.id),
                "quotation_number": quotation.quotation_number,
                "customer_id": str(quotation.customer_id) if quotation.customer_id else None,
                "customer_name": customer_name,
                "event_name": quotation.event_name,
                "event_location": quotation.event_location,
                "event_date": quotation.event_date.isoformat() if quotation.event_date else None,
                "creation_date": quotation.creation_date.isoformat() if quotation.creation_date else None,
                "validity_date": quotation.validity_date.isoformat() if quotation.validity_date else None,
                "subtotal": float(quotation.subtotal),
                "tax_amount": float(quotation.tax_amount),
                "discount_amount": float(quotation.discount_amount),
                "total_amount": float(quotation.total_amount),
                "advance_payment": float(quotation.advance_payment),
                "status": quotation.status,
                "notes": quotation.notes,
                "terms": quotation.terms,
                "items": items_list,
                "created_at": quotation.created_at.isoformat() if quotation.created_at else None,
                "updated_at": quotation.updated_at.isoformat() if quotation.updated_at else None
            }
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid quotation ID format"
        )
    except Exception as e:
        logger.error(f"Error fetching quotation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching quotation: {str(e)}"
        )

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_quotation(quotation: dict, db: Session = Depends(get_db)):
    """
    Create new quotation
    """
    try:
        # Generate quotation number if not provided
        if not quotation.get("quotation_number"):
            last_quotation = db.query(Quotation).order_by(Quotation.created_at.desc()).first()
            if last_quotation and last_quotation.quotation_number:
                try:
                    last_num = int(last_quotation.quotation_number.replace("QT-", ""))
                    new_quotation_num = f"QT-{last_num + 1:04d}"
                except:
                    new_quotation_num = "QT-0001"
            else:
                new_quotation_num = "QT-0001"
            quotation["quotation_number"] = new_quotation_num

        # Create quotation
        new_quotation = Quotation(
            quotation_number=quotation.get("quotation_number"),
            customer_id=uuid.UUID(quotation["customer_id"]) if quotation.get("customer_id") else None,
            event_name=quotation.get("event_name"),
            event_location=quotation.get("event_location"),
            event_date=quotation.get("event_date"),
            creation_date=quotation.get("creation_date") or date.today(),
            validity_date=quotation.get("validity_date"),
            subtotal=Decimal(str(quotation.get("subtotal", 0))),
            tax_amount=Decimal(str(quotation.get("tax_amount", 0))),
            discount_amount=Decimal(str(quotation.get("discount_amount", 0))),
            total_amount=Decimal(str(quotation.get("total_amount", 0))),
            advance_payment=Decimal(str(quotation.get("advance_payment", 0))),
            status=quotation.get("status", "draft"),
            notes=quotation.get("notes"),
            terms=quotation.get("terms")
        )

        db.add(new_quotation)
        db.commit()
        db.refresh(new_quotation)

        # Create quotation items if provided
        items_data = quotation.get("items", [])
        for item_data in items_data:
            quotation_item = QuotationItem(
                quotation_id=new_quotation.id,
                item_id=uuid.UUID(item_data["item_id"]) if item_data.get("item_id") else None,
                item_name=item_data.get("item_name"),
                quantity=item_data.get("quantity", 1),
                rate_per_day=Decimal(str(item_data.get("rate_per_day", 0))),
                rate_per_event=Decimal(str(item_data.get("rate_per_event", 0))),
                days=item_data.get("days", 1),
                total_amount=Decimal(str(item_data.get("total_amount", 0))),
                notes=item_data.get("notes")
            )
            db.add(quotation_item)

        db.commit()

        logger.info(f"Quotation created successfully: id={new_quotation.id}, number={new_quotation.quotation_number}")

        return {
            "success": True,
            "data": {
                "id": str(new_quotation.id),
                "quotation_number": new_quotation.quotation_number,
                "total_amount": float(new_quotation.total_amount),
                "status": new_quotation.status
            }
        }
    except Exception as e:
        logger.error(f"Error creating quotation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating quotation: {str(e)}"
        )

@router.put("/{quotation_id}", response_model=dict)
async def update_quotation(quotation_id: str, quotation: dict, db: Session = Depends(get_db)):
    """
    Update existing quotation
    """
    try:
        # Get existing quotation
        existing_quotation = db.query(Quotation).filter(Quotation.id == uuid.UUID(quotation_id)).first()

        if not existing_quotation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )

        # Update fields
        if "subtotal" in quotation:
            existing_quotation.subtotal = Decimal(str(quotation["subtotal"]))
        if "tax_amount" in quotation:
            existing_quotation.tax_amount = Decimal(str(quotation["tax_amount"]))
        if "discount_amount" in quotation:
            existing_quotation.discount_amount = Decimal(str(quotation["discount_amount"]))
        if "total_amount" in quotation:
            existing_quotation.total_amount = Decimal(str(quotation["total_amount"]))
        if "advance_payment" in quotation:
            existing_quotation.advance_payment = Decimal(str(quotation["advance_payment"]))
        if "status" in quotation:
            existing_quotation.status = quotation["status"]
        if "validity_date" in quotation:
            existing_quotation.validity_date = quotation["validity_date"]
        if "notes" in quotation:
            existing_quotation.notes = quotation["notes"]
        if "terms" in quotation:
            existing_quotation.terms = quotation["terms"]

        db.commit()
        db.refresh(existing_quotation)

        logger.info(f"Quotation updated successfully: id={existing_quotation.id}")

        return {
            "success": True,
            "data": {
                "id": str(existing_quotation.id),
                "quotation_number": existing_quotation.quotation_number,
                "status": existing_quotation.status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating quotation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating quotation: {str(e)}"
        )

@router.delete("/{quotation_id}", response_model=dict)
async def delete_quotation(quotation_id: str, db: Session = Depends(get_db)):
    """
    Delete quotation and associated items
    """
    try:
        # Delete quotation items first
        db.query(QuotationItem).filter(QuotationItem.quotation_id == uuid.UUID(quotation_id)).delete()

        # Delete quotation
        quotation = db.query(Quotation).filter(Quotation.id == uuid.UUID(quotation_id)).first()
        if not quotation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quotation not found"
            )

        db.delete(quotation)
        db.commit()

        logger.info(f"Quotation deleted successfully: id={quotation_id}")

        return {
            "success": True,
            "message": "Quotation deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting quotation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting quotation: {str(e)}"
        )
