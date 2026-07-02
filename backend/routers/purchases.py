"""
Purchases Router - Vendor and purchase record management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from decimal import Decimal

from database.connection import get_db
from models import Vendor, Purchase, Item, Category

router = APIRouter(prefix="/api/purchase", tags=["Purchases"])


def serialize_vendor(vendor: Vendor) -> dict:
    return {
        "id": str(vendor.id),
        "name": vendor.name,
        "phone": vendor.phone,
        "address": vendor.address,
        "email": vendor.email,
        "contact_person": vendor.contact_person,
        "created_at": vendor.created_at.isoformat() if vendor.created_at else None
    }


def serialize_purchase(purchase: Purchase) -> dict:
    return {
        "id": str(purchase.id),
        "vendor_id": str(purchase.vendor_id) if purchase.vendor_id else None,
        "vendor_name": purchase.vendor.name if purchase.vendor else None,
        "item_id": purchase.item_id,
        "item_name": purchase.item_name,
        "quantity": purchase.quantity,
        "purchase_price": float(purchase.purchase_price),
        "total_price": float(purchase.total_price),
        "purchase_date": purchase.purchase_date.isoformat(),
        "invoice_number": purchase.invoice_number,
        "payment_status": purchase.payment_status,
        "description": purchase.description,
        "created_at": purchase.created_at.isoformat() if purchase.created_at else None
    }


@router.get("/vendors")
async def list_vendors(db: Session = Depends(get_db)):
    """List vendors"""
    vendors = db.query(Vendor).order_by(Vendor.name).all()
    return {"success": True, "data": {"vendors": [serialize_vendor(v) for v in vendors]}}


@router.post("/vendors")
async def create_vendor(vendor_data: dict, db: Session = Depends(get_db)):
    """Create a new vendor"""
    try:
        vendor = Vendor(
            name=vendor_data["name"],
            phone=vendor_data.get("phone"),
            address=vendor_data.get("address"),
            email=vendor_data.get("email"),
            contact_person=vendor_data.get("contact_person")
        )
        db.add(vendor)
        db.commit()
        db.refresh(vendor)
        return {
            "success": True,
            "message": "Vendor created successfully",
            "data": serialize_vendor(vendor)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/vendors/{vendor_id}")
async def update_vendor(vendor_id: str, vendor_data: dict, db: Session = Depends(get_db)):
    """Update a vendor"""
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    try:
        for field in ("name", "phone", "address", "email", "contact_person"):
            if field in vendor_data:
                setattr(vendor, field, vendor_data[field])
        db.commit()
        db.refresh(vendor)
        return {
            "success": True,
            "message": "Vendor updated successfully",
            "data": serialize_vendor(vendor)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/vendors/{vendor_id}")
async def delete_vendor(vendor_id: str, db: Session = Depends(get_db)):
    """Delete a vendor"""
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    try:
        db.delete(vendor)
        db.commit()
        return {"success": True, "message": "Vendor deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/purchases")
async def list_purchases(
    vendor_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """List purchase records"""
    query = db.query(Purchase)
    if vendor_id:
        query = query.filter(Purchase.vendor_id == vendor_id)
    if start_date:
        query = query.filter(Purchase.purchase_date >= start_date)
    if end_date:
        query = query.filter(Purchase.purchase_date <= end_date)

    purchases = query.order_by(Purchase.purchase_date.desc()).all()
    return {"success": True, "data": {"purchases": [serialize_purchase(p) for p in purchases]}}


@router.post("/purchases")
async def create_purchase(purchase_data: dict, db: Session = Depends(get_db)):
    """Record a new purchase.

    If linked to an existing inventory item, increases its stock.
    If `new_item` inventory parameters are provided instead, creates the
    inventory item (same parameters as the inventory form) with the
    purchased quantity as opening stock.
    """
    try:
        quantity = int(purchase_data["quantity"])
        purchase_price = Decimal(str(purchase_data["purchase_price"]))
        item_id = purchase_data.get("item_id")
        vendor = db.query(Vendor).filter(Vendor.id == purchase_data["vendor_id"]).first() if purchase_data.get("vendor_id") else None

        new_item_data = purchase_data.get("new_item")
        if not item_id and new_item_data:
            category = None
            category_name = (new_item_data.get("category_name") or "").strip()
            if category_name:
                category = db.query(Category).filter(Category.name == category_name).first()
                if not category:
                    category = Category(name=category_name)
                    db.add(category)
                    db.flush()

            item = Item(
                name=new_item_data.get("name") or purchase_data.get("item_name"),
                category_id=category.id if category else None,
                description=purchase_data.get("description"),
                total_quantity=quantity,
                available_quantity=quantity,
                rented_quantity=0,
                tag=new_item_data.get("tag"),
                per_day_rate=Decimal(str(new_item_data.get("per_day_rate", 0) or 0)),
                per_event_rate=Decimal(str(new_item_data.get("per_event_rate", 0) or 0)),
                min_stock_level=int(new_item_data.get("min_stock_level") or 5),
                item_type=new_item_data.get("item_type", "rentable"),
                unit=new_item_data.get("unit", "pcs"),
                supplier=vendor.name if vendor else None,
                is_active=True,
            )
            db.add(item)
            db.flush()
            item_id = item.id

        purchase = Purchase(
            vendor_id=purchase_data.get("vendor_id"),
            item_id=item_id,
            item_name=purchase_data.get("item_name"),
            quantity=quantity,
            purchase_price=purchase_price,
            total_price=purchase_price * quantity,
            purchase_date=date.fromisoformat(purchase_data.get("purchase_date", date.today().isoformat())),
            invoice_number=purchase_data.get("invoice_number"),
            payment_status=purchase_data.get("payment_status", "paid"),
            description=purchase_data.get("description")
        )
        db.add(purchase)

        if item_id and not new_item_data:
            item = db.query(Item).filter(Item.id == item_id).first()
            if item:
                item.total_quantity += quantity
                item.available_quantity += quantity
                if not purchase.item_name:
                    purchase.item_name = item.name

        db.commit()
        db.refresh(purchase)

        return {
            "success": True,
            "message": "Purchase recorded successfully",
            "data": serialize_purchase(purchase)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/purchases/{purchase_id}")
async def update_purchase(purchase_id: str, purchase_data: dict, db: Session = Depends(get_db)):
    """Update a purchase record (does not retroactively adjust stock)"""
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    try:
        if "vendor_id" in purchase_data:
            purchase.vendor_id = purchase_data["vendor_id"]
        if "item_name" in purchase_data:
            purchase.item_name = purchase_data["item_name"]
        if "quantity" in purchase_data:
            purchase.quantity = int(purchase_data["quantity"])
        if "purchase_price" in purchase_data:
            purchase.purchase_price = Decimal(str(purchase_data["purchase_price"]))
        if "purchase_date" in purchase_data:
            purchase.purchase_date = date.fromisoformat(purchase_data["purchase_date"])
        if "description" in purchase_data:
            purchase.description = purchase_data["description"]

        purchase.total_price = purchase.purchase_price * purchase.quantity

        db.commit()
        db.refresh(purchase)
        return {
            "success": True,
            "message": "Purchase updated successfully",
            "data": serialize_purchase(purchase)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/purchases/{purchase_id}")
async def delete_purchase(purchase_id: str, db: Session = Depends(get_db)):
    """Delete a purchase record"""
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")

    try:
        db.delete(purchase)
        db.commit()
        return {"success": True, "message": "Purchase deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
