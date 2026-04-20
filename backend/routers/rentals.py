"""
Rentals Router - Complete Implementation (Partner Rentals)
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
import uuid
import logging

from database.connection import get_db
from models import PartnerRental, Partner, Order
from schemas import RentalResponse, RentalCreate

router = APIRouter(prefix="/api/rentals", tags=["Rentals"])

logger = logging.getLogger(__name__)

# ============================================
# Rental Operations
# ============================================

@router.get("", response_model=dict)
async def list_rentals(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
    partner_id: Optional[str] = None,
    order_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all partner rentals with pagination and filtering
    """
    try:
        query = db.query(PartnerRental).order_by(PartnerRental.created_at.desc())

        # Apply filters
        if status_filter:
            query = query.filter(PartnerRental.status == status_filter)
        if partner_id:
            query = query.filter(PartnerRental.partner_id == uuid.UUID(partner_id))
        if order_id:
            query = query.filter(PartnerRental.order_id == uuid.UUID(order_id))

        # Pagination
        total = query.count()
        offset = (page - 1) * page_size
        rentals = query.offset(offset).limit(page_size).all()

        # Convert to response format
        rental_list = []
        for rental in rentals:
            # Get partner details
            partner = db.query(Partner).filter(Partner.id == rental.partner_id).first()
            partner_name = partner.name if partner else "Unknown"

            rental_list.append({
                "id": str(rental.id),
                "partner_id": str(rental.partner_id) if rental.partner_id else None,
                "partner_name": partner_name,
                "order_id": str(rental.order_id) if rental.order_id else None,
                "item_name": rental.item_name,
                "category": rental.category,
                "quantity": rental.quantity,
                "rate_per_day": float(rental.rate_per_day),
                "days": rental.days,
                "total_amount": float(rental.total_amount),
                "status": rental.status,
                "created_at": rental.created_at.isoformat() if rental.created_at else None
            })

        return {
            "success": True,
            "data": {
                "rentals": rental_list,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "total_pages": (total + page_size - 1) // page_size
                }
            }
        }
    except Exception as e:
        logger.error(f"Error fetching rentals: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching rentals: {str(e)}"
        )

@router.get("/{rental_id}", response_model=dict)
async def get_rental(rental_id: str, db: Session = Depends(get_db)):
    """
    Get rental by ID with full details
    """
    try:
        rental = db.query(PartnerRental).filter(PartnerRental.id == uuid.UUID(rental_id)).first()

        if not rental:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rental not found"
            )

        # Get partner details
        partner = db.query(Partner).filter(Partner.id == rental.partner_id).first()
        partner_name = partner.name if partner else "Unknown"
        partner_contact = partner.contact_person if partner else None
        partner_phone = partner.phone if partner else None

        # Get order details if exists
        order = None
        if rental.order_id:
            order = db.query(Order).filter(Order.id == rental.order_id).first()

        return {
            "success": True,
            "data": {
                "id": str(rental.id),
                "partner_id": str(rental.partner_id) if rental.partner_id else None,
                "partner_name": partner_name,
                "partner_contact": partner_contact,
                "partner_phone": partner_phone,
                "order_id": str(rental.order_id) if rental.order_id else None,
                "order_number": order.order_number if order else None,
                "item_name": rental.item_name,
                "category": rental.category,
                "quantity": rental.quantity,
                "rate_per_day": float(rental.rate_per_day),
                "days": rental.days,
                "total_amount": float(rental.total_amount),
                "status": rental.status,
                "created_at": rental.created_at.isoformat() if rental.created_at else None
            }
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid rental ID format"
        )
    except Exception as e:
        logger.error(f"Error fetching rental: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching rental: {str(e)}"
        )

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_rental(rental: dict, db: Session = Depends(get_db)):
    """
    Create new partner rental
    """
    try:
        # Validate partner exists
        if rental.get("partner_id"):
            partner = db.query(Partner).filter(Partner.id == uuid.UUID(rental["partner_id"])).first()
            if not partner:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Partner not found"
                )

        # Validate order exists if provided
        if rental.get("order_id"):
            order = db.query(Order).filter(Order.id == uuid.UUID(rental["order_id"])).first()
            if not order:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Order not found"
                )

        # Calculate total amount if not provided
        rate_per_day = Decimal(str(rental.get("rate_per_day", 0)))
        days = rental.get("days", 1)
        quantity = rental.get("quantity", 1)
        total_amount = rental.get("total_amount")

        if not total_amount:
            total_amount = rate_per_day * days * quantity
            total_amount = Decimal(str(total_amount))

        # Create rental
        new_rental = PartnerRental(
            partner_id=uuid.UUID(rental["partner_id"]) if rental.get("partner_id") else None,
            order_id=uuid.UUID(rental["order_id"]) if rental.get("order_id") else None,
            item_name=rental.get("item_name"),
            category=rental.get("category"),
            quantity=quantity,
            rate_per_day=rate_per_day,
            days=days,
            total_amount=total_amount,
            status=rental.get("status", "active")
        )

        db.add(new_rental)
        db.commit()
        db.refresh(new_rental)

        logger.info(f"Rental created successfully: id={new_rental.id}, partner={new_rental.partner_id}")

        return {
            "success": True,
            "data": {
                "id": str(new_rental.id),
                "total_amount": float(new_rental.total_amount),
                "status": new_rental.status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating rental: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating rental: {str(e)}"
        )

@router.put("/{rental_id}", response_model=dict)
async def update_rental(rental_id: str, rental: dict, db: Session = Depends(get_db)):
    """
    Update existing rental
    """
    try:
        # Get existing rental
        existing_rental = db.query(PartnerRental).filter(PartnerRental.id == uuid.UUID(rental_id)).first()

        if not existing_rental:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rental not found"
            )

        # Update fields
        if "quantity" in rental:
            existing_rental.quantity = rental["quantity"]
        if "rate_per_day" in rental:
            existing_rental.rate_per_day = Decimal(str(rental["rate_per_day"]))
        if "days" in rental:
            existing_rental.days = rental["days"]
        if "total_amount" in rental:
            existing_rental.total_amount = Decimal(str(rental["total_amount"]))
        else:
            # Recalculate total if rate or days changed
            total_amount = existing_rental.rate_per_day * existing_rental.days * existing_rental.quantity
            existing_rental.total_amount = Decimal(str(total_amount))

        if "status" in rental:
            existing_rental.status = rental["status"]
        if "category" in rental:
            existing_rental.category = rental["category"]
        if "item_name" in rental:
            existing_rental.item_name = rental["item_name"]

        db.commit()
        db.refresh(existing_rental)

        logger.info(f"Rental updated successfully: id={existing_rental.id}")

        return {
            "success": True,
            "data": {
                "id": str(existing_rental.id),
                "total_amount": float(existing_rental.total_amount),
                "status": existing_rental.status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating rental: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating rental: {str(e)}"
        )

@router.delete("/{rental_id}", response_model=dict)
async def delete_rental(rental_id: str, db: Session = Depends(get_db)):
    """
    Delete rental
    """
    try:
        rental = db.query(PartnerRental).filter(PartnerRental.id == uuid.UUID(rental_id)).first()
        if not rental:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Rental not found"
            )

        db.delete(rental)
        db.commit()

        logger.info(f"Rental deleted successfully: id={rental_id}")

        return {
            "success": True,
            "message": "Rental deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting rental: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting rental: {str(e)}"
        )
