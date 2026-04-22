"""
Inventory management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from database.connection import get_db
from models import Item, Category, Location
from schemas import (
    ItemCreate, ItemUpdate, ItemResponse, CategoryCreate,
    CategoryResponse, LocationCreate, LocationResponse,
    AvailabilityCheck, AvailabilityResponse, PaginatedResponse,
    SuccessResponse
)
from database.connection import Base

# Router
router = APIRouter( tags=["Inventory"])

# ============================================
# Categories
# ============================================

@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(db: Session = Depends(get_db)):
    """List all categories"""
    categories = db.query(Category).all()
    return [
        CategoryResponse(
            id=cat.id,
            name=cat.name,
            description=cat.description,
            created_at=cat.created_at
        )
        for cat in categories
    ]

@router.post("/categories", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return CategoryResponse(
        id=db_category.id,
        name=db_category.name,
        description=db_category.description,
        created_at=db_category.created_at
    )

@router.get("/categories/{cat_id}", response_model=CategoryResponse)
async def get_category(cat_id: int, db: Session = Depends(get_db)):
    """Get category by ID"""
    category = db.query(Category).filter(Category.id == cat_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    return CategoryResponse(
        id=category.id,
        name=category.name,
        description=category.description,
        created_at=category.created_at
    )

# ============================================
# Locations
# ============================================

@router.get("/locations", response_model=List[LocationResponse])
async def list_locations(db: Session = Depends(get_db)):
    """List all locations"""
    locations = db.query(Location).all()
    return [
        LocationResponse(
            id=loc.id,
            name=loc.name,
            type=loc.type,
            description=loc.description,
            created_at=loc.created_at
        )
        for loc in locations
    ]

@router.post("/locations", response_model=LocationResponse)
async def create_location(location: LocationCreate, db: Session = Depends(get_db)):
    """Create a new location"""
    db_location = Location(**location.dict())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)

    return LocationResponse(
        id=db_location.id,
        name=db_location.name,
        type=db_location.type,
        description=db_location.description,
        created_at=db_location.created_at
    )

# ============================================
# Items
# ============================================

@router.get("", response_model=PaginatedResponse)
async def list_items(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    item_type: Optional[str] = Query(None, pattern="^(rentable|consumable|tool)$"),
    category_id: Optional[int] = None,
    location_id: Optional[int] = None,
    search: Optional[str] = None
):
    """List items with filters and pagination"""
    query = db.query(Item)

    # Apply filters
    if item_type:
        query = query.filter(Item.item_type == item_type)
    if category_id:
        query = query.filter(Item.category_id == category_id)
    if location_id:
        query = query.filter(Item.location_id == location_id)
    if search:
        query = query.filter(Item.name.ilike(f"%{search}%"))

    # Get total count
    total = query.count()

    # Apply pagination
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return PaginatedResponse(
        success=True,
        data={
            "items": [
                ItemResponse(
                    id=str(item.id),
                    name=item.name,
                    category_id=item.category_id,
                    category_name=item.category.name if item.category else None,
                    description=item.description,
                    total_quantity=item.total_quantity,
                    available_quantity=item.available_quantity,
                    rented_quantity=item.rented_quantity,
                    location_id=item.location_id,
                    location_name=item.location.name if item.location else None,
                    tag_serial=item.tag_serial,
                    per_day_rate=item.per_day_rate,
                    per_event_rate=item.per_event_rate,
                    min_stock_level=item.min_stock_level,
                    is_active=item.is_active,
                    item_type=item.item_type,
                    unit=item.unit,
                    avg_monthly_usage=item.avg_monthly_usage,
                    supplier=item.supplier,
                    created_at=item.created_at,
                    updated_at=item.updated_at
                )
                for item in items
            ],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": (total + page_size - 1) // page_size
            }
        }
    )

@router.get("/search", response_model=SuccessResponse)
async def search_items(
    search: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search items for autocomplete"""
    items = db.query(Item).filter(Item.name.ilike(f"%{search}%")).limit(limit).all()
    return SuccessResponse(
        success=True,
        data={
            "items": [
                {
                    "id": str(item.id),
                    "name": item.name,
                    "category_id": item.category_id,
                    "unit": item.unit,
                    "rate_type": "per_day" if item.per_day_rate > 0 else "per_event",
                    "rate": float(item.per_day_rate if item.per_day_rate > 0 else item.per_event_rate),
                    "tag": item.tag
                }
                for item in items
            ]
        }
    )

@router.get("/categories/search", response_model=SuccessResponse)
async def search_categories(
    search: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search categories for autocomplete"""
    categories = db.query(Category).filter(Category.name.ilike(f"%{search}%")).limit(limit).all()
    return SuccessResponse(
        success=True,
        data=[
            {
                "id": cat.id,
                "name": cat.name
            }
            for cat in categories
        ]
    )

@router.get("/tags/search", response_model=SuccessResponse)
async def search_tags(
    search: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search tags for autocomplete"""
    # Get unique tags that match search
    items = db.query(Item.tag).filter(Item.tag.ilike(f"%{search}%"), Item.tag.isnot(None)).distinct().limit(limit).all()
    return SuccessResponse(
        success=True,
        data=[
            {
                "name": tag[0]
            }
            for tag in items
        ]
    )

@router.post("", response_model=ItemResponse)
async def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """Create a new item"""
    # Set default values
    if not item.total_quantity:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="total_quantity is required"
        )

    # Create item with calculated values
    db_item = Item(
        name=item.name,
        category_id=item.category_id,
        description=item.description,
        total_quantity=item.total_quantity,
        available_quantity=item.total_quantity,
        rented_quantity=0,
        location_id=item.location_id,
        tag_serial=item.tag_serial,
        per_day_rate=item.per_day_rate,
        per_event_rate=item.per_event_rate,
        min_stock_level=item.min_stock_level,
        is_active=item.is_active,
        item_type=item.item_type,
        unit=item.unit,
        avg_monthly_usage=item.avg_monthly_usage,
        supplier=item.supplier
    )

    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return ItemResponse(
        id=str(db_item.id),
        name=db_item.name,
        category_id=db_item.category_id,
        category_name=db_item.category.name if db_item.category else None,
        description=db_item.description,
        total_quantity=db_item.total_quantity,
        available_quantity=db_item.available_quantity,
        rented_quantity=db_item.rented_quantity,
        location_id=db_item.location_id,
        location_name=db_item.location.name if db_item.location else None,
        tag_serial=db_item.tag_serial,
        per_day_rate=db_item.per_day_rate,
        per_event_rate=db_item.per_event_rate,
        min_stock_level=db_item.min_stock_level,
        is_active=db_item.is_active,
        item_type=db_item.item_type,
        unit=db_item.unit,
        avg_monthly_usage=db_item.avg_monthly_usage,
        supplier=db_item.supplier,
        created_at=db_item.created_at,
        updated_at=db_item.updated_at
    )

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: str, db: Session = Depends(get_db)):
    """Get item by ID"""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    return ItemResponse(
        id=str(item.id),
        name=item.name,
        category_id=item.category_id,
        category_name=item.category.name if item.category else None,
        description=item.description,
        total_quantity=item.total_quantity,
        available_quantity=item.available_quantity,
        rented_quantity=item.rented_quantity,
        location_id=item.location_id,
        location_name=item.location.name if item.location else None,
        tag_serial=item.tag_serial,
        per_day_rate=item.per_day_rate,
        per_event_rate=item.per_event_rate,
        min_stock_level=item.min_stock_level,
        is_active=item.is_active,
        item_type=item.item_type,
        unit=item.unit,
        avg_monthly_usage=item.avg_monthly_usage,
        supplier=item.supplier,
        created_at=item.created_at,
        updated_at=item.updated_at
    )

@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(item_id: str, item: ItemUpdate, db: Session = Depends(get_db)):
    """Update an item"""
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Update fields
    update_data = item.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)

    return ItemResponse(
        id=str(db_item.id),
        name=db_item.name,
        category_id=db_item.category_id,
        category_name=db_item.category.name if db_item.category else None,
        description=db_item.description,
        total_quantity=db_item.total_quantity,
        available_quantity=db_item.available_quantity,
        rented_quantity=db_item.rented_quantity,
        location_id=db_item.location_id,
        location_name=db_item.location.name if db_item.location else None,
        tag_serial=db_item.tag_serial,
        per_day_rate=db_item.per_day_rate,
        per_event_rate=db_item.per_event_rate,
        min_stock_level=db_item.min_stock_level,
        is_active=db_item.is_active,
        item_type=db_item.item_type,
        unit=db_item.unit,
        avg_monthly_usage=db_item.avg_monthly_usage,
        supplier=db_item.supplier,
        created_at=db_item.created_at,
        updated_at=db_item.updated_at
    )

@router.delete("/{item_id}")
async def delete_item(item_id: str, db: Session = Depends(get_db)):
    """Delete an item"""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    db.delete(item)
    db.commit()

    return SuccessResponse(message="Item deleted successfully")

# ============================================
# Availability Check
# ============================================

@router.post("/availability", response_model=List[AvailabilityResponse])
async def check_availability(availability: AvailabilityCheck, db: Session = Depends(get_db)):
    """Check item availability for given dates"""
    # Get all items or specific items
    query = db.query(Item).filter(Item.is_active == True)

    if availability.item_ids:
        from uuid import UUID
        item_uuids = [UUID(uid) for uid in availability.item_ids]
        query = query.filter(Item.id.in_(item_uuids))

    items = query.all()

    # Get orders that overlap with requested dates
    from sqlalchemy import and_, or_
    from models import OrderItem, Order

    overlapping_orders = db.query(Order).filter(
        and_(
            Order.start_date <= availability.end_date,
            Order.end_date >= availability.start_date,
            Order.status.in_(['confirmed', 'dispatched', 'in_progress'])
        )
    ).all()

    # Get items in overlapping orders
    booked_item_ids = set()
    for order in overlapping_orders:
        for order_item in order.order_items:
            booked_item_ids.add(order_item.item_id)

    availability_list = []
    for item in items:
        requested_qty = 0
        available_qty = item.available_quantity

        # Calculate how much is already booked
        for order_item in item.order_items:
            if order_item.order_id in [o.id for o in overlapping_orders]:
                available_qty -= order_item.quantity

        is_available = available_qty >= requested_qty

        availability_list.append(AvailabilityResponse(
            item_id=str(item.id),
            item_name=item.name,
            available_quantity=max(available_qty, 0),
            requested_quantity=requested_qty if requested_qty > 0 else available_qty,
            is_available=is_available
        ))

    return availability_list

@router.get("/low-stock", response_model=List[ItemResponse])
async def get_low_stock_items(db: Session = Depends(get_db)):
    """Get items with low stock"""
    from sqlalchemy import or_

    low_stock_items = db.query(Item).filter(
        and_(
            Item.is_active == True,
            or_(
                Item.available_quantity < Item.min_stock_level,
                Item.available_quantity <= 0
            )
        )
    ).all()

    return [
        ItemResponse(
            id=str(item.id),
            name=item.name,
            category_id=item.category_id,
            category_name=item.category.name if item.category else None,
            description=item.description,
            total_quantity=item.total_quantity,
            available_quantity=item.available_quantity,
            rented_quantity=item.rented_quantity,
            location_id=item.location_id,
            location_name=item.location.name if item.location else None,
            tag_serial=item.tag_serial,
            per_day_rate=item.per_day_rate,
            per_event_rate=item.per_event_rate,
            min_stock_level=item.min_stock_level,
            is_active=item.is_active,
            item_type=item.item_type,
            unit=item.unit,
            avg_monthly_usage=item.avg_monthly_usage,
            supplier=item.supplier,
            created_at=item.created_at,
            updated_at=item.updated_at
        )
        for item in low_stock_items
    ]

@router.get("/rentable", response_model=List[ItemResponse])
async def get_rentable_items(db: Session = Depends(get_db)):
    """Get only rentable items"""
    items = db.query(Item).filter(
        and_(
            Item.is_active == True,
            Item.item_type == 'rentable'
        )
    ).all()

    return [
        ItemResponse(
            id=str(item.id),
            name=item.name,
            category_id=item.category_id,
            category_name=item.category.name if item.category else None,
            description=item.description,
            total_quantity=item.total_quantity,
            available_quantity=item.available_quantity,
            rented_quantity=item.rented_quantity,
            location_id=item.location_id,
            location_name=item.location.name if item.location else None,
            tag_serial=item.tag_serial,
            per_day_rate=item.per_day_rate,
            per_event_rate=item.per_event_rate,
            min_stock_level=item.min_stock_level,
            is_active=item.is_active,
            item_type=item.item_type,
            unit=item.unit,
            avg_monthly_usage=item.avg_monthly_usage,
            supplier=item.supplier,
            created_at=item.created_at,
            updated_at=item.updated_at
        )
        for item in items
    ]

@router.get("/consumables", response_model=List[ItemResponse])
async def get_consumables(db: Session = Depends(get_db)):
    """Get only consumable items"""
    items = db.query(Item).filter(
        and_(
            Item.is_active == True,
            Item.item_type == 'consumable'
        )
    ).all()

    return [
        ItemResponse(
            id=str(item.id),
            name=item.name,
            category_id=item.category_id,
            category_name=item.category.name if item.category else None,
            description=item.description,
            total_quantity=item.total_quantity,
            available_quantity=item.available_quantity,
            rented_quantity=item.rented_quantity,
            location_id=item.location_id,
            location_name=item.location.name if item.location else None,
            tag_serial=item.tag_serial,
            per_day_rate=item.per_day_rate,
            per_event_rate=item.per_event_rate,
            min_stock_level=item.min_stock_level,
            is_active=item.is_active,
            item_type=item.item_type,
            unit=item.unit,
            avg_monthly_usage=item.avg_monthly_usage,
            supplier=item.supplier,
            created_at=item.created_at,
            updated_at=item.updated_at
        )
        for item in items
    ]

@router.get("/tools", response_model=List[ItemResponse])
async def get_tools(db: Session = Depends(get_db)):
    """Get only tool items"""
    items = db.query(Item).filter(
        and_(
            Item.is_active == True,
            Item.item_type == 'tool'
        )
    ).all()

    return [
        ItemResponse(
            id=str(item.id),
            name=item.name,
            category_id=item.category_id,
            category_name=item.category.name if item.category else None,
            description=item.description,
            total_quantity=item.total_quantity,
            available_quantity=item.available_quantity,
            rented_quantity=item.rented_quantity,
            location_id=item.location_id,
            location_name=item.location.name if item.location else None,
            tag_serial=item.tag_serial,
            per_day_rate=item.per_day_rate,
            per_event_rate=item.per_event_rate,
            min_stock_level=item.min_stock_level,
            is_active=item.is_active,
            item_type=item.item_type,
            unit=item.unit,
            avg_monthly_usage=item.avg_monthly_usage,
            supplier=item.supplier,
            created_at=item.created_at,
            updated_at=item.updated_at
        )
        for item in items
    ]

@router.get("/stats", response_model=dict)
async def get_inventory_stats(db: Session = Depends(get_db)):
    """Get inventory statistics"""
    from sqlalchemy import func

    total_items = db.query(func.count(Item.id)).scalar()

    rentable_items = db.query(func.count(Item.id)).filter(Item.item_type == 'rentable').scalar()

    consumable_items = db.query(func.count(Item.id)).filter(Item.item_type == 'consumable').scalar()

    tool_items = db.query(func.count(Item.id)).filter(Item.item_type == 'tool').scalar()

    low_stock_count = db.query(func.count(Item.id)).filter(
        func.coalesce(Item.available_quantity, 0) < func.coalesce(Item.min_stock_level, 0)
    ).scalar()

    total_available = db.query(func.sum(Item.available_quantity)).scalar() or 0

    total_rented = db.query(func.sum(Item.rented_quantity)).scalar() or 0

    total_value = db.query(func.sum(Item.total_quantity * Item.per_day_rate)).scalar() or 0

    return {
        "success": True,
        "data": {
            "total_items": total_items,
            "rentable_items": rentable_items,
            "consumables": consumable_items,
            "tools": tool_items,
            "low_stock_count": low_stock_count,
            "total_available": total_available,
            "total_rented": total_rented,
            "total_value": total_value
        }
    }
