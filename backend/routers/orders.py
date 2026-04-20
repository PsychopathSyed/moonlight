"""
Order and rental management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from decimal import Decimal
from datetime import date
import uuid

from database.connection import get_db
from models import Order, OrderItem, Item, Quotation, Customer
from schemas import OrderCreate, OrderUpdate, OrderResponse, ItemCreate, AvailabilityCheck, SuccessResponse, ErrorResponse

# Router
router = APIRouter( tags=["Orders"])

def get_order_with_relations(db: Session, order_id: str):
    """Get order with related data"""
    from uuid import UUID
    try:
        order_uuid = UUID(order_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid order ID format"
        )

    order = db.query(Order).filter(Order.id == order_uuid).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order

@router.get("", response_model=dict)
async def list_orders(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    customer_id: Optional[str] = None,
    start_date_from: Optional[date] = None,
    start_date_to: Optional[date] = None
):
    """List orders with filters and pagination"""
    query = db.query(Order)

    # Apply filters
    if status:
        query = query.filter(Order.status == status)
    if customer_id:
        from uuid import UUID
        try:
            query = query.filter(Order.customer_id == UUID(customer_id))
        except ValueError:
            pass
    if start_date_from:
        query = query.filter(Order.start_date >= start_date_from)
    if start_date_to:
        query = query.filter(Order.start_date <= start_date_to)

    # Get total count
    total = query.count()

    # Apply pagination
    orders = query.order_by(Order.start_date.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "success": True,
        "data": {
            "orders": [
                {
                    "id": str(order.id),
                    "order_number": order.order_number,
                    "quotation_id": str(order.quotation_id) if order.quotation_id else None,
                    "customer_id": str(order.customer_id),
                    "customer_name": order.customer.company_name or f"{order.customer.first_name or ''} {order.customer.last_name or ''}" if order.customer else None,
                    "event_name": order.event_name,
                    "event_location": order.event_location,
                    "start_date": order.start_date.isoformat() if order.start_date else None,
                    "end_date": order.end_date.isoformat() if order.end_date else None,
                    "dispatch_date": order.dispatch_date.isoformat() if order.dispatch_date else None,
                    "return_date": order.return_date.isoformat() if order.return_date else None,
                    "status": order.status,
                    "subtotal": float(order.subtotal),
                    "tax_amount": float(order.tax_amount),
                    "discount_amount": float(order.discount_amount),
                    "total_amount": float(order.total_amount),
                    "advance_payment": float(order.advance_payment),
                    "notes": order.notes,
                    "items": [
                        {
                            "id": str(item.id),
                            "item_id": str(item.item_id) if item.item_id else None,
                            "item_name": item.item_name,
                            "quantity": item.quantity,
                            "rate_per_day": float(item.rate_per_day),
                            "rate_per_event": float(item.rate_per_event),
                            "days": item.days,
                            "total_amount": float(item.total_amount),
                            "is_partner_item": item.is_partner_item,
                            "notes": item.notes
                        }
                        for item in order.order_items
                    ],
                    "created_at": order.created_at.isoformat(),
                    "updated_at": order.updated_at.isoformat()
                }
                for order in orders
            ],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size
            }
        }
    }

@router.post("", response_model=dict)
async def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order"""
    from uuid import UUID

    # Check if customer exists
    from models import Customer
    customer = db.query(Customer).filter(Customer.id == UUID(order_data.customer_id)).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Check if quotation exists and get data
    if order_data.quotation_id:
        quotation = db.query(Quotation).filter(Quotation.id == UUID(order_data.quotation_id)).first()
        if quotation and quotation.status != 'approved':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Quotation must be approved before converting to order"
            )

    # Validate dates
    if order_data.end_date < order_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="End date must be after start date"
        )

    # Check availability for rentable items
    availability_check = AvailabilityCheck(
        start_date=order_data.start_date,
        end_date=order_data.end_date,
        item_ids=[item.item_id for item in order_data.items if not item.is_partner_item]
    )

    # Check availability
    from sqlalchemy import or_
    overlapping_items = []
    for item in order_data.items:
        if item.is_partner_item:
            continue

        item_available = db.query(Item).filter(Item.id == UUID(item.item_id)).first()
        if not item_available:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Item {item.item_name} not found"
            )

        # Check availability
        availability = db.query(OrderItem).join(Order).filter(
            and_(
                OrderItem.item_id == UUID(item.item_id),
                Order.status.in_(['confirmed', 'dispatched', 'in_progress']),
                Order.start_date <= order_data.end_date,
                Order.end_date >= order_data.start_date
            )
        ).all()

        total_booked = sum(ai.quantity for ai in availability)
        available_qty = item_available.total_quantity - item_available.rented_quantity

        if available_qty < item.quantity:
            overlapping_items.append({
                "item_id": item.item_id,
                "item_name": item.item_name,
                "requested_quantity": item.quantity,
                "available_quantity": available_qty,
                "booked_quantity": total_booked
            })

    if overlapping_items:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": "Items not available for requested dates",
                "conflicts": overlapping_items
            }
        )

    # Generate order number
    order_number = f"ORD-{db.query(Order).count() + 1000:05d}"

    # Create order
    db_order = Order(
        order_number=order_number,
        customer_id=UUID(order_data.customer_id),
        quotation_id=UUID(order_data.quotation_id) if order_data.quotation_id else None,
        event_name=order_data.event_name,
        event_location=order_data.event_location,
        start_date=order_data.start_date,
        end_date=order_data.end_date,
        status='pending',
        notes=order_data.notes
    )

    db.add(db_order)
    db.flush()

    # Create order items
    subtotal = Decimal('0')
    for item_data in order_data.items:
        days = (order_data.end_date - order_data.start_date).days + 1
        total = (item_data.rate_per_event if days == 1 else item_data.rate_per_day * days) * item_data.quantity
        subtotal += total

        db_order_item = OrderItem(
            order_id=db_order.id,
            item_id=UUID(item_data.item_id) if item_data.item_id else None,
            item_name=item_data.item_name,
            quantity=item_data.quantity,
            rate_per_day=item_data.rate_per_day,
            rate_per_event=item_data.rate_per_event,
            days=days,
            total_amount=total,
            is_partner_item=item_data.is_partner_item,
            notes=item_data.notes
        )

        db.add(db_order_item)

        # Update item availability (only for own items, not partner items)
        if item_data.item_id and not item_data.is_partner_item:
            item = db.query(Item).filter(Item.id == UUID(item_data.item_id)).first()
            if item:
                item.rented_quantity += item_data.quantity
                item.available_quantity -= item_data.quantity

    # Calculate totals
    tax_amount = subtotal * Decimal('0.17')  # 17% tax
    total_amount = subtotal + tax_amount

    db_order.subtotal = subtotal
    db_order.tax_amount = tax_amount
    db_order.total_amount = total_amount
    db_order.advance_payment = Decimal('0')

    db.commit()
    db.refresh(db_order)

    return {
        "success": True,
        "data": {
            "order": {
                "id": str(db_order.id),
                "order_number": db_order.order_number,
                "quotation_id": str(db_order.quotation_id) if db_order.quotation_id else None,
                "customer_id": str(db_order.customer_id),
                "customer_name": customer.company_name or f"{customer.first_name} {customer.last_name}",
                "event_name": db_order.event_name,
                "event_location": db_order.event_location,
                "start_date": db_order.start_date.isoformat(),
                "end_date": db_order.end_date.isoformat(),
                "dispatch_date": db_order.dispatch_date.isoformat() if db_order.dispatch_date else None,
                "return_date": db_order.return_date.isoformat() if db_order.return_date else None,
                "status": db_order.status,
                "subtotal": float(db_order.subtotal),
                "tax_amount": float(db_order.tax_amount),
                "discount_amount": float(db_order.discount_amount),
                "total_amount": float(db_order.total_amount),
                "advance_payment": float(db_order.advance_payment),
                "notes": db_order.notes,
                "items": [
                    {
                        "id": str(item.id),
                        "item_id": str(item.item_id) if item.item_id else None,
                        "item_name": item.item_name,
                        "quantity": item.quantity,
                        "rate_per_day": float(item.rate_per_day),
                        "rate_per_event": float(item.rate_per_event),
                        "days": item.days,
                        "total_amount": float(item.total_amount),
                        "is_partner_item": item.is_partner_item,
                        "notes": item.notes
                    }
                    for item in db_order.order_items
                ],
                "created_at": db_order.created_at.isoformat(),
                "updated_at": db_order.updated_at.isoformat()
            },
            "message": "Order created successfully"
        }
    }

@router.get("/{order_id}")
async def get_order(order_id: str, db: Session = Depends(get_db)):
    """Get order by ID"""
    order = get_order_with_relations(db, order_id)

    return {
        "success": True,
        "data": {
            "order": {
                "id": str(order.id),
                "order_number": order.order_number,
                "quotation_id": str(order.quotation_id) if order.quotation_id else None,
                "customer_id": str(order.customer_id),
                "customer_name": order.customer.company_name or f"{order.customer.first_name} {order.customer.last_name}" if order.customer else None,
                "event_name": order.event_name,
                "event_location": order.event_location,
                'start_date': order.start_date.isoformat() if order.start_date else None,
                "end_date": order.end_date.isoformat() if order.end_date else None,
                "dispatch_date": order.dispatch_date.isoformat() if order.dispatch_date else None,
                "return_date": order.return_date.isoformat() if order.return_date else None,
                "status": order.status,
                "subtotal": float(order.subtotal),
                "tax_amount": float(order.tax_amount),
                "discount_amount": float(order.discount_amount),
                "total_amount": float(order.total_amount),
                "advance_payment": float(order.advance_payment),
                "notes": order.notes,
                "items": [
                    {
                        "id": str(item.id),
                        "item_id": str(item.item_id) if item.item_id else None,
                        "item_name": item.item_name,
                        "quantity": item.quantity,
                        "rate_per_day": float(item.rate_per_day),
                        "rate_per_event": float(item.rate_per_event),
                        "days": item.days,
                        "total_amount": float(item.total_amount),
                        "is_partner_item": item.is_partner_item,
                        "notes": item.notes
                    }
                    for item in order.order_items
                ],
                "created_at": order.created_at.isoformat(),
                "updated_at": order.updated_at.isoformat()
            }
        }
    }

@router.put("/{order_id}")
async def update_order(order_id: str, order_update: OrderUpdate, db: Session = Depends(get_db)):
    """Update order"""
    order = get_order_with_relations(db, order_id)

    # Validate status transitions
    valid_transitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['dispatched', 'cancelled'],
        'dispatched': ['in_progress', 'cancelled'],
        'in_progress': ['returned', 'cancelled'],
        'returned': ['completed'],
        'completed': []
    }

    if order_update.status and order_update.status not in valid_transitions.get(order.status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from {order.status} to {order_update.status}"
        )

    # Update fields
    if order_update.event_name:
        order.event_name = order_update.event_name
    if order_update.event_location:
        order.event_location = order_update.event_location
    if order_update.start_date:
        order.start_date = order_update.start_date
    if order_update.end_date:
        order.end_date = order_update.end_date
    if order_update.status:
        order.status = order_update.status
    if order_update.notes:
        order.notes = order_update.notes

    # Update dispatch/return dates on status change
    if order_update.status == 'dispatched':
        order.dispatch_date = date.today()
    if order_update.status == 'returned':
        order.return_date = date.today()

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "data": {
            "order": {
                "id": str(order.id),
                "order_number": order.order_number,
                "status": order.status,
                "dispatch_date": order.dispatch_date.isoformat() if order.dispatch_date else None,
                "return_date": order.return_date.isoformat() if order.return_date else None,
                "updated_at": order.updated_at.isoformat()
            },
            "message": "Order updated successfully"
        }
    }

@router.patch("/{order_id}/status")
async def update_order_status(order_id: str, status: str = Query(...), db: Session = Depends(get_db)):
    """Quick update of order status"""
    order = get_order_with_relations(db, order_id)

    valid_status = ['pending', 'confirmed', 'dispatched', 'in_progress', 'returned', 'completed', 'cancelled']
    if status not in valid_status:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status. Must be one of: {', '.join(valid_status)}"
        )

    order.status = status

    # Update dispatch/return dates
    if status == 'dispatched' and not order.dispatch_date:
        order.dispatch_date = date.today()
    if status == 'returned' and not order.return_date:
        order.return_date = date.today()

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "data": {
            "order": {
                "id": str(order.id),
                "order_number": order.order_number,
                "status": order.status,
                "dispatch_date": order.dispatch_date.isoformat() if order.dispatch_date else None,
                "return_date": order.return_date.isoformat() if order.return_date else None,
                "updated_at": order.updated_at.isoformat()
            },
            "message": f"Order status updated to {status}"
        }
    }

@router.post("/{order_id}/dispatch")
async def dispatch_order(order_id: str, db: Session = Depends(get_db)):
    """Mark order as dispatched"""
    order = get_order_with_relations(db, order_id)

    if order.status != 'confirmed':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must be in 'confirmed' status before dispatching"
        )

    order.status = 'dispatched'
    order.dispatch_date = date.today()

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "data": {
            "order": {
                "id": str(order.id),
                "order_number": order.order_number,
                "status": order.status,
                "dispatch_date": order.dispatch_date.isoformat(),
                "updated_at": order.updated_at.isoformat()
            },
            "message": "Order dispatched successfully"
        }
    }

@router.post("/{order_id}/return")
async def initate_return(order_id: str, db: Session = Depends(get_db)):
    """Initiate return process"""
    order = get_order_with_relations(db, order_id)

    if order.status not in ['in_progress', 'dispatched']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must be dispatched before return process"
        )

    order.status = 'returned'
    order.return_date = date.today()

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "data": {
            "order": {
                "id": str(order.id),
                "order_number": order.order_number,
                "status": order.status,
                "return_date": order.return_date.isoformat(),
                "updated_at": order.updated_at.isoformat()
            },
            "message": "Return process initiated"
        }
    }

@router.get("/upcoming")
async def get_upcoming_orders(db: Session = Depends(get_db), days: int = Query(7, ge=1, le=30)):
    """Get upcoming orders (next N days)"""
    from datetime import timedelta, date

    future_date = date.today() + timedelta(days=days)

    orders = db.query(Order).filter(
        and_(
            Order.start_date >= date.today(),
            Order.start_date <= future_date,
            Order.status.in_(['confirmed', 'dispatched'])
        )
    ).order_by(Order.start_date.asc()).all()

    return {
        "success": True,
        "data": {
            "orders": [
                {
                    "id": str(order.id),
                    "order_number": order.order_number,
                    "customer_name": order.customer.company_name or f"{order.customer.first_name} {order.customer.last_name}",
                    "event_name": order.event_name,
                    "event_location": order.event_location,
                    'start_date': order.start_date.isoformat(),
                    'end_date': order.end_date.isoformat(),
                    "status": order.status,
                    "total_amount": float(order.total_amount),
                    "days_until": (order.start_date - date.today()).days
                }
                for order in orders
            ]
        }
    }

@router.get("/availability")
async def check_items_availability(
    start_date: date = Query(..., description="Start date for rental period"),
    end_date: date = Query(..., description="End date for rental period"),
    item_ids: Optional[str] = Query(None, description="Comma-separated item IDs"),
    db: Session = Depends(get_db)
):
    """Check availability for multiple items"""
    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="End date must be after start date"
        )

    # Get all items or specific items
    query = db.query(Item).filter(Item.is_active == True, Item.item_type == 'rentable')

    if item_ids:
        from uuid import UUID
        item_uuids = [UUID(uid.strip()) for uid in item_ids.split(',') if uid.strip()]
        query = query.filter(Item.id.in_(item_uuids))

    items = query.all()

    # Get orders that overlap with requested dates
    from models import OrderItem
    overlapping_orders = db.query(Order).filter(
        and_(
            Order.start_date <= end_date,
            Order.end_date >= start_date,
            Order.status.in_(['confirmed', 'dispatched', 'in_progress'])
        )
    ).all()

    # Get items in overlapping orders
    booked_item_ids = set()
    for order in overlapping_orders:
        for order_item in order.order_items:
            if order_item.item_id:
                booked_item_ids.add(order_item.item_id)

    availability_list = []
    for item in items:
        # Calculate how much is already booked
        booked_qty = 0
        for order_item in item.order_items:
            if order_item.order_id in [o.id for o in overlapping_orders]:
                booked_qty += order_item.quantity

        available_qty = item.total_quantity - item.rented_quantity
        is_available = available_qty > 0

        availability_list.append({
            "item_id": str(item.id),
            "item_name": item.name,
            "total_quantity": item.total_quantity,
            "rented_quantity": item.rented_quantity,
            "available_quantity": available_qty,
            "booked_quantity": booked_qty,
            "is_available": is_available
        })

    return {
        "success": True,
        "data": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "items": availability_list
        }
    }
