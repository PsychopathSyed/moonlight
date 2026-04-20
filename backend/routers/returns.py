"""
Returns Router - Complete Implementation
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
import uuid
import logging

from database.connection import get_db
from models import Return, ReturnItem, Order, Item
from schemas import ReturnResponse, ReturnCreate

router = APIRouter(prefix="/api/returns", tags=["Returns"])

logger = logging.getLogger(__name__)

# ============================================
# Return Operations
# ============================================

@router.get("", response_model=dict)
async def list_returns(
    page: int = 1,
    page_size: int = 20,
    status_filter: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List all returns with pagination and filtering
    """
    try:
        query = db.query(Return).order_by(Return.created_at.desc())

        # Apply filters
        if status_filter:
            query = query.filter(Return.status == status_filter)
        if from_date:
            query = query.filter(Return.return_date >= from_date)
        if to_date:
            query = query.filter(Return.return_date <= to_date)

        # Pagination
        total = query.count()
        offset = (page - 1) * page_size
        returns = query.offset(offset).limit(page_size).all()

        # Convert to response format
        return_list = []
        for ret in returns:
            # Get order details
            order = db.query(Order).filter(Order.id == ret.order_id).first()
            order_number = order.order_number if order else "Unknown"

            # Get return items
            items = db.query(ReturnItem).filter(ReturnItem.return_id == ret.id).all()

            return_list.append({
                "id": str(ret.id),
                "order_id": str(ret.order_id) if ret.order_id else None,
                "order_number": order_number,
                "return_date": ret.return_date.isoformat() if ret.return_date else None,
                "status": ret.status,
                "notes": ret.notes,
                "items_count": len(items),
                "created_at": ret.created_at.isoformat() if ret.created_at else None
            })

        return {
            "success": True,
            "data": {
                "returns": return_list,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "total_pages": (total + page_size - 1) // page_size
                }
            }
        }
    except Exception as e:
        logger.error(f"Error fetching returns: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching returns: {str(e)}"
        )

@router.get("/{return_id}", response_model=dict)
async def get_return(return_id: str, db: Session = Depends(get_db)):
    """
    Get return by ID with full details including items
    """
    try:
        ret = db.query(Return).filter(Return.id == uuid.UUID(return_id)).first()

        if not ret:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Return not found"
            )

        # Get order details
        order = db.query(Order).filter(Order.id == ret.order_id).first()
        order_number = order.order_number if order else None
        order_customer = order.customer_id if order else None

        # Get return items
        items = db.query(ReturnItem).filter(ReturnItem.return_id == ret.id).all()
        items_list = []
        for item in items:
            # Get item details
            inventory_item = db.query(Item).filter(Item.id == item.item_id).first()
            item_name = inventory_item.name if inventory_item else item.item_name

            items_list.append({
                "id": str(item.id),
                "item_id": str(item.item_id) if item.item_id else None,
                "item_name": item_name,
                "quantity": item.quantity,
                "condition": item.condition,
                "notes": item.notes
            })

        return {
            "success": True,
            "data": {
                "id": str(ret.id),
                "order_id": str(ret.order_id) if ret.order_id else None,
                "order_number": order_number,
                "order_customer_id": str(order_customer) if order_customer else None,
                "return_date": ret.return_date.isoformat() if ret.return_date else None,
                "status": ret.status,
                "notes": ret.notes,
                "items": items_list,
                "created_at": ret.created_at.isoformat() if ret.created_at else None,
                "updated_at": ret.updated_at.isoformat() if ret.updated_at else None
            }
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid return ID format"
        )
    except Exception as e:
        logger.error(f"Error fetching return: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching return: {str(e)}"
        )

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_return(return_data: dict, db: Session = Depends(get_db)):
    """
    Create new return
    """
    try:
        # Validate order exists
        if return_data.get("order_id"):
            order = db.query(Order).filter(Order.id == uuid.UUID(return_data["order_id"])).first()
            if not order:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Order not found"
                )

        # Create return
        new_return = Return(
            order_id=uuid.UUID(return_data["order_id"]) if return_data.get("order_id") else None,
            return_date=return_data.get("return_date") or date.today(),
            status=return_data.get("status", "pending"),
            notes=return_data.get("notes")
        )

        db.add(new_return)
        db.commit()
        db.refresh(new_return)

        # Create return items if provided
        items_data = return_data.get("items", [])
        for item_data in items_data:
            # Validate item exists
            if item_data.get("item_id"):
                inventory_item = db.query(Item).filter(Item.id == uuid.UUID(item_data["item_id"])).first()
                if not inventory_item:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Item not found: {item_data['item_id']}"
                    )

                # Update inventory: increase available quantity
                if inventory_item.rented_quantity >= item_data.get("quantity", 0):
                    inventory_item.rented_quantity -= item_data.get("quantity", 0)
                    inventory_item.available_quantity += item_data.get("quantity", 0)

            return_item = ReturnItem(
                return_id=new_return.id,
                item_id=uuid.UUID(item_data["item_id"]) if item_data.get("item_id") else None,
                item_name=item_data.get("item_name"),
                quantity=item_data.get("quantity", 1),
                condition=item_data.get("condition", "good"),
                notes=item_data.get("notes")
            )
            db.add(return_item)

        db.commit()

        logger.info(f"Return created successfully: id={new_return.id}")

        return {
            "success": True,
            "data": {
                "id": str(new_return.id),
                "return_date": new_return.return_date.isoformat() if new_return.return_date else None,
                "status": new_return.status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating return: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating return: {str(e)}"
        )

@router.put("/{return_id}", response_model=dict)
async def update_return(return_id: str, return_data: dict, db: Session = Depends(get_db)):
    """
    Update existing return
    """
    try:
        # Get existing return
        existing_return = db.query(Return).filter(Return.id == uuid.UUID(return_id)).first()

        if not existing_return:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Return not found"
            )

        # Update fields
        if "return_date" in return_data:
            existing_return.return_date = return_data["return_date"]
        if "status" in return_data:
            existing_return.status = return_data["status"]
        if "notes" in return_data:
            existing_return.notes = return_data["notes"]

        db.commit()
        db.refresh(existing_return)

        logger.info(f"Return updated successfully: id={existing_return.id}")

        return {
            "success": True,
            "data": {
                "id": str(existing_return.id),
                "status": existing_return.status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating return: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating return: {str(e)}"
        )

@router.delete("/{return_id}", response_model=dict)
async def delete_return(return_id: str, db: Session = Depends(get_db)):
    """
    Delete return
    """
    try:
        # Delete return items first
        db.query(ReturnItem).filter(ReturnItem.return_id == uuid.UUID(return_id)).delete()

        # Delete return
        ret = db.query(Return).filter(Return.id == uuid.UUID(return_id)).first()
        if not ret:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Return not found"
            )

        db.delete(ret)
        db.commit()

        logger.info(f"Return deleted successfully: id={return_id}")

        return {
            "success": True,
            "message": "Return deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting return: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting return: {str(e)}"
        )
