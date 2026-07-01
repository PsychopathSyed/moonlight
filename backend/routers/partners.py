"""
Partners Router - External rental partner, partner-rental, and payable management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from decimal import Decimal
from datetime import date

from database.connection import get_db
from models import Partner, PartnerRental, PartnerPayable

router = APIRouter(prefix="/api/partners", tags=["Partners"])


def serialize_partner(partner: Partner) -> dict:
    return {
        "id": str(partner.id),
        "name": partner.name,
        "phone": partner.phone,
        "address": partner.address,
        "email": partner.email,
        "commission_rate": float(partner.commission_rate),
        "contact_person": partner.contact_person,
        "available_items": partner.available_items,
        "status": partner.status,
        "balance": float(partner.balance)
    }


def serialize_rental(rental: PartnerRental) -> dict:
    return {
        "id": str(rental.id),
        "partner_id": str(rental.partner_id) if rental.partner_id else None,
        "partner_name": rental.partner.name if rental.partner else None,
        "order_id": str(rental.order_id) if rental.order_id else None,
        "item_name": rental.item_name,
        "category": rental.category,
        "quantity": rental.quantity,
        "rate_per_day": float(rental.rate_per_day),
        "days": rental.days,
        "total_amount": float(rental.total_amount),
        "status": rental.status,
        "created_at": rental.created_at.isoformat() if rental.created_at else None
    }


def serialize_payable(payable: PartnerPayable) -> dict:
    return {
        "id": str(payable.id),
        "partner_id": str(payable.partner_id) if payable.partner_id else None,
        "partner_name": payable.partner.name if payable.partner else None,
        "amount": float(payable.amount),
        "paid_amount": float(payable.paid_amount),
        "balance": float(payable.balance),
        "due_date": payable.due_date.isoformat(),
        "status": payable.status
    }


@router.get("")
async def list_partners(status: Optional[str] = None, db: Session = Depends(get_db)):
    """List partners, their rentals, and payables"""
    query = db.query(Partner)
    if status:
        query = query.filter(Partner.status == status)
    partners = query.order_by(Partner.name).all()

    rentals = db.query(PartnerRental).order_by(PartnerRental.created_at.desc()).all()
    payables = db.query(PartnerPayable).order_by(PartnerPayable.due_date).all()

    return {
        "success": True,
        "data": {
            "partners": [serialize_partner(p) for p in partners],
            "partner_rentals": [serialize_rental(r) for r in rentals],
            "payables": [serialize_payable(p) for p in payables]
        }
    }


@router.get("/{partner_id}")
async def get_partner(partner_id: str, db: Session = Depends(get_db)):
    """Get a single partner by ID"""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return {"success": True, "data": serialize_partner(partner)}


@router.post("")
async def create_partner(partner_data: dict, db: Session = Depends(get_db)):
    """Create a new partner"""
    try:
        partner = Partner(
            name=partner_data["name"],
            phone=partner_data.get("phone"),
            address=partner_data.get("address"),
            email=partner_data.get("email"),
            commission_rate=Decimal(str(partner_data.get("commission_rate", "15.00"))),
            contact_person=partner_data.get("contact_person"),
            available_items=partner_data.get("available_items"),
            status=partner_data.get("status", "active")
        )
        db.add(partner)
        db.commit()
        db.refresh(partner)
        return {
            "success": True,
            "message": "Partner created successfully",
            "data": serialize_partner(partner)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{partner_id}")
async def update_partner(partner_id: str, partner_data: dict, db: Session = Depends(get_db)):
    """Update a partner"""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    try:
        for field in ("name", "phone", "address", "email", "contact_person", "available_items", "status"):
            if field in partner_data:
                setattr(partner, field, partner_data[field])
        if "commission_rate" in partner_data:
            partner.commission_rate = Decimal(str(partner_data["commission_rate"]))

        db.commit()
        db.refresh(partner)
        return {
            "success": True,
            "message": "Partner updated successfully",
            "data": serialize_partner(partner)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{partner_id}")
async def delete_partner(partner_id: str, db: Session = Depends(get_db)):
    """Delete a partner"""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    try:
        db.delete(partner)
        db.commit()
        return {"success": True, "message": "Partner deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/rentals")
async def create_partner_rental(rental_data: dict, db: Session = Depends(get_db)):
    """Record a rental of an item from a partner. Increases the partner's balance owed."""
    partner_id = rental_data.get("partner_id")
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    try:
        quantity = int(rental_data["quantity"])
        rate_per_day = Decimal(str(rental_data.get("rate_per_day", 0)))
        days = int(rental_data.get("days", 1))
        total_amount = rate_per_day * quantity * days

        rental = PartnerRental(
            partner_id=partner_id,
            order_id=rental_data.get("order_id"),
            item_name=rental_data.get("item_name"),
            category=rental_data.get("category"),
            quantity=quantity,
            rate_per_day=rate_per_day,
            days=days,
            total_amount=total_amount,
            status=rental_data.get("status", "pending")
        )
        db.add(rental)

        partner.balance += total_amount

        db.commit()
        db.refresh(rental)
        return {
            "success": True,
            "message": "Partner rental recorded successfully",
            "data": serialize_rental(rental)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/rentals/{rental_id}")
async def update_partner_rental(rental_id: str, rental_data: dict, db: Session = Depends(get_db)):
    """Update a partner rental status (e.g. mark as paid), adjusting partner balance accordingly"""
    rental = db.query(PartnerRental).filter(PartnerRental.id == rental_id).first()
    if not rental:
        raise HTTPException(status_code=404, detail="Partner rental not found")

    try:
        new_status = rental_data.get("status")
        if new_status and new_status != rental.status:
            partner = db.query(Partner).filter(Partner.id == rental.partner_id).first()
            if new_status == "paid" and rental.status != "paid":
                partner.balance -= rental.total_amount
            elif rental.status == "paid" and new_status != "paid":
                partner.balance += rental.total_amount
            rental.status = new_status

        db.commit()
        db.refresh(rental)
        return {
            "success": True,
            "message": "Partner rental updated successfully",
            "data": serialize_rental(rental)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/payables")
async def create_payable(payable_data: dict, db: Session = Depends(get_db)):
    """Create a partner payable record"""
    partner_id = payable_data.get("partner_id")
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    try:
        amount = Decimal(str(payable_data["amount"]))
        paid_amount = Decimal(str(payable_data.get("paid_amount", 0)))

        payable = PartnerPayable(
            partner_id=partner_id,
            amount=amount,
            paid_amount=paid_amount,
            balance=amount - paid_amount,
            due_date=date.fromisoformat(payable_data["due_date"]),
            status=payable_data.get("status", "pending")
        )
        db.add(payable)
        db.commit()
        db.refresh(payable)
        return {
            "success": True,
            "message": "Partner payable created successfully",
            "data": serialize_payable(payable)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/payables/{payable_id}/pay")
async def pay_payable(payable_id: str, payment_data: dict, db: Session = Depends(get_db)):
    """Record a payment against a payable, updating its balance and status"""
    payable = db.query(PartnerPayable).filter(PartnerPayable.id == payable_id).first()
    if not payable:
        raise HTTPException(status_code=404, detail="Payable not found")

    try:
        payment_amount = Decimal(str(payment_data["amount"]))
        payable.paid_amount += payment_amount
        payable.balance = payable.amount - payable.paid_amount
        payable.status = "paid" if payable.balance <= 0 else "pending"

        db.commit()
        db.refresh(payable)
        return {
            "success": True,
            "message": "Payment recorded successfully",
            "data": serialize_payable(payable)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
