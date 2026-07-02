"""
Gate Pass Router - Inward/outward movement of items through the gate
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date

from database.connection import get_db
from models import GatePass, GatePassItem, Item

router = APIRouter(prefix="/api/gatepass", tags=["Gate Pass"])


def serialize_gate_pass(gp: GatePass) -> dict:
    return {
        "id": str(gp.id),
        "gate_pass_number": gp.gate_pass_number,
        "type": gp.type,
        "gate_pass_date": gp.gate_pass_date.isoformat(),
        "person_name": gp.person_name,
        "vehicle_number": gp.vehicle_number,
        "purpose": gp.purpose,
        "reference_number": gp.reference_number,
        "status": gp.status,
        "remarks": gp.remarks,
        "items": [
            {
                "id": str(gi.id),
                "item_id": str(gi.item_id) if gi.item_id else None,
                "item_name": gi.item_name,
                "quantity": gi.quantity,
                "unit": gi.unit,
                "notes": gi.notes,
            }
            for gi in gp.items
        ],
        "total_quantity": sum(gi.quantity for gi in gp.items),
        "created_at": gp.created_at.isoformat() if gp.created_at else None,
    }


def _generate_number(db: Session, pass_type: str) -> str:
    prefix = "GP-IN" if pass_type == "in" else "GP-OUT"
    last = (
        db.query(GatePass)
        .filter(GatePass.gate_pass_number.like(f"{prefix}-%"))
        .order_by(GatePass.created_at.desc())
        .first()
    )
    if last:
        try:
            last_num = int(last.gate_pass_number.split("-")[-1])
        except ValueError:
            last_num = 0
        return f"{prefix}-{last_num + 1:04d}"
    return f"{prefix}-0001"


def _apply_stock(db: Session, pass_type: str, entries, reverse: bool = False):
    """Adjust inventory availability for gate pass items.

    'out' decreases available stock, 'in' increases it. reverse undoes it.
    """
    for entry in entries:
        item_id = entry.get("item_id") if isinstance(entry, dict) else entry.item_id
        quantity = int(entry.get("quantity") if isinstance(entry, dict) else entry.quantity)
        if not item_id:
            continue
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item:
            continue
        outgoing = (pass_type == "out") != reverse
        if outgoing:
            if item.available_quantity < quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{item.name}': available {item.available_quantity}, requested {quantity}",
                )
            item.available_quantity -= quantity
        else:
            item.available_quantity += quantity
            if item.available_quantity > item.total_quantity:
                item.total_quantity = item.available_quantity


@router.get("")
async def list_gate_passes(
    type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    """List gate passes, optionally filtered by type ('in'/'out') and date range"""
    query = db.query(GatePass)
    if type in ("in", "out"):
        query = query.filter(GatePass.type == type)
    if start_date:
        query = query.filter(GatePass.gate_pass_date >= start_date)
    if end_date:
        query = query.filter(GatePass.gate_pass_date <= end_date)

    total = query.count()
    offset = (page - 1) * page_size
    passes = query.order_by(GatePass.gate_pass_date.desc(), GatePass.created_at.desc()).offset(offset).limit(page_size).all()

    return {
        "success": True,
        "data": {
            "gate_passes": [serialize_gate_pass(gp) for gp in passes],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "pages": (total + page_size - 1) // page_size,
            },
        },
    }


@router.get("/{gate_pass_id}")
async def get_gate_pass(gate_pass_id: str, db: Session = Depends(get_db)):
    gp = db.query(GatePass).filter(GatePass.id == gate_pass_id).first()
    if not gp:
        raise HTTPException(status_code=404, detail="Gate pass not found")
    return {"success": True, "data": serialize_gate_pass(gp)}


@router.post("")
async def create_gate_pass(gate_pass_data: dict, db: Session = Depends(get_db)):
    """Create a gate pass and adjust inventory availability accordingly"""
    pass_type = gate_pass_data.get("type")
    if pass_type not in ("in", "out"):
        raise HTTPException(status_code=400, detail="type must be 'in' or 'out'")

    item_entries = gate_pass_data.get("items") or []
    if not item_entries:
        raise HTTPException(status_code=400, detail="At least one item is required")

    try:
        gp = GatePass(
            gate_pass_number=_generate_number(db, pass_type),
            type=pass_type,
            gate_pass_date=date.fromisoformat(gate_pass_data.get("gate_pass_date", date.today().isoformat())),
            person_name=gate_pass_data.get("person_name"),
            vehicle_number=gate_pass_data.get("vehicle_number"),
            purpose=gate_pass_data.get("purpose"),
            reference_number=gate_pass_data.get("reference_number"),
            status=gate_pass_data.get("status", "completed"),
            remarks=gate_pass_data.get("remarks"),
        )

        for entry in item_entries:
            item_name = entry.get("item_name")
            item_id = entry.get("item_id")
            if item_id and not item_name:
                item = db.query(Item).filter(Item.id == item_id).first()
                item_name = item.name if item else None
            gp.items.append(
                GatePassItem(
                    item_id=item_id or None,
                    item_name=item_name,
                    quantity=int(entry["quantity"]),
                    unit=entry.get("unit"),
                    notes=entry.get("notes"),
                )
            )

        _apply_stock(db, pass_type, item_entries)

        db.add(gp)
        db.commit()
        db.refresh(gp)

        return {
            "success": True,
            "message": f"Gate pass {gp.gate_pass_number} created successfully",
            "data": serialize_gate_pass(gp),
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{gate_pass_id}")
async def delete_gate_pass(gate_pass_id: str, db: Session = Depends(get_db)):
    """Delete a gate pass and revert its stock adjustment"""
    gp = db.query(GatePass).filter(GatePass.id == gate_pass_id).first()
    if not gp:
        raise HTTPException(status_code=404, detail="Gate pass not found")

    try:
        _apply_stock(db, gp.type, gp.items, reverse=True)
        db.delete(gp)
        db.commit()
        return {"success": True, "message": "Gate pass deleted successfully"}
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
