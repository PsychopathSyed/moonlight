"""
Dashboard statistics and widgets routes
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy.sql import func, and_
from datetime import date, timedelta
from decimal import Decimal

from database.connection import get_db
from models import Order, Item, Customer, Invoice, Notification
from schemas import DashboardStatsResponse, NotificationResponse

# Router
router = APIRouter( tags=["Dashboard"])


def _window_for_range(rng: str):
    """Return (current_start, current_end, previous_start, previous_end) for a range."""
    today = date.today()
    if rng == "today":
        cur_start, cur_end = today, today
        prev_start, prev_end = today - timedelta(days=1), today - timedelta(days=1)
    elif rng == "week":
        # Rolling 7-day window ending today
        cur_start, cur_end = today - timedelta(days=6), today
        prev_start, prev_end = today - timedelta(days=13), today - timedelta(days=7)
    else:  # month -> current calendar month vs previous calendar month
        cur_start = today.replace(day=1)
        cur_end = today
        if today.month == 1:
            prev_start = today.replace(year=today.year - 1, month=12, day=1)
        else:
            prev_start = today.replace(month=today.month - 1, day=1)
        prev_end = cur_start - timedelta(days=1)
    return cur_start, cur_end, prev_start, prev_end


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(db: Session = Depends(get_db), range: str = Query("month", pattern="^(today|week|month)$")):
    """Get dashboard statistics. `range` scopes revenue (today/week/month); stock/order/invoice counts are live snapshots."""
    # Inventory stats
    total_inventory = db.query(func.count(Item.id)).scalar()
    rentable_items = db.query(func.count(Item.id)).filter(Item.item_type == 'rentable').scalar()
    consumables = db.query(func.count(Item.id)).filter(Item.item_type == 'consumable').scalar()
    tools = db.query(func.count(Item.id)).filter(Item.item_type == 'tool').scalar()

    # Low stock items
    low_stock_items = db.query(func.count(Item.id)).filter(
        func.coalesce(Item.available_quantity, 0) < func.coalesce(Item.min_stock_level, 0)
    ).scalar()

    # Order stats (live snapshots)
    active_rentals = db.query(func.count(Order.id)).filter(Order.status == 'in_progress').scalar()
    pending_orders = db.query(func.count(Order.id)).filter(Order.status == 'pending').scalar()

    # Invoice stats (live snapshots)
    pending_invoices = db.query(func.count(Invoice.id)).filter(Invoice.status == 'pending').scalar()
    overdue_invoices = db.query(func.count(Invoice.id)).filter(
        Invoice.status == 'overdue'
    ).scalar()
    # Defensive: also count unpaid invoices past their due date (covers status drift)
    overdue_invoices = (overdue_invoices or 0) + (db.query(func.count(Invoice.id)).filter(
        and_(
            Invoice.due_date < date.today(),
            Invoice.balance > 0,
            Invoice.status.in_(['pending', 'partial'])
        )
    ).scalar() or 0)

    # Customer stats
    total_customers = db.query(func.count(Customer.id)).scalar()

    # Revenue (range-scoped): current window vs previous window for delta
    cur_start, cur_end, prev_start, prev_end = _window_for_range(range)

    def _sum_revenue(start, end):
        return db.query(func.sum(Invoice.total_amount)).filter(
            Invoice.invoice_date >= start,
            Invoice.invoice_date <= end,
            Invoice.status != 'cancelled'
        ).scalar() or Decimal('0')

    revenue = float(_sum_revenue(cur_start, cur_end))
    revenue_previous = float(_sum_revenue(prev_start, prev_end))
    if revenue_previous > 0:
        revenue_delta_pct = round(((revenue - revenue_previous) / revenue_previous) * 100, 1)
    else:
        revenue_delta_pct = None

    # Notification stats
    pending_notifications = db.query(func.count(Notification.id)).filter(
        Notification.status == 'unread'
    ).scalar()

    return DashboardStatsResponse(
        total_inventory=total_inventory or 0,
        rentable_items=rentable_items or 0,
        consumables=consumables or 0,
        tools=tools or 0,
        active_rentals=active_rentals or 0,
        low_stock_items=low_stock_items or 0,
        pending_orders=pending_orders or 0,
        pending_invoices=pending_invoices or 0,
        overdue_invoices=overdue_invoices or 0,
        total_customers=total_customers or 0,
        pending_notifications=pending_notifications or 0,
        revenue=revenue,
        revenue_previous=revenue_previous,
        revenue_delta_pct=revenue_delta_pct,
        range=range,
    )

@router.get("/notifications", response_model=dict)
async def get_dashboard_notifications(db: Session = Depends(get_db)):
    """Get recent dashboard notifications"""
    from sqlalchemy.sql import desc

    notifications = db.query(Notification).filter(Notification.status == 'unread').order_by(
        desc(Notification.created_at)
    ).limit(10).all()

    return {
        "success": True,
        "data": [
            NotificationResponse(
                id=str(notif.id),
                type=notif.type,
                title=notif.title,
                message=notif.message,
                reference_id=str(notif.reference_id) if notif.reference_id else None,
                reference_type=notif.reference_type,
                status=notif.status,
                created_at=notif.created_at
            )
            for notif in notifications
        ]
    }

@router.get("/upcoming")
async def get_upcoming_events(db: Session = Depends(get_db)):
    """Get upcoming events (orders)"""
    future_date = date.today() + timedelta(days=7)

    from sqlalchemy import and_

    orders = db.query(Order).filter(
        and_(
            Order.start_date >= date.today(),
            Order.start_date <= future_date,
            Order.status.in_(['confirmed', 'pending'])
        )
    ).order_by(Order.start_date.asc()).all()

    return {
        "success": True,
        "data": [
            {
                "id": str(order.id),
                "order_number": order.order_number,
                "customer_name": order.customer.company_name if order.customer else f"{order.customer.first_name} {order.customer.last_name}" if order.customer else "Unknown",
                "event_name": order.event_name,
                "event_location": order.event_location,
                "start_date": order.start_date.isoformat() if order.start_date else None,
                "end_date": order.end_date.isoformat() if order.end_date else None,
                "status": order.status,
                "total_amount": float(order.total_amount),
                "days_until": (order.start_date - date.today()).days if order.start_date else None
            }
            for order in orders
        ]
    }

@router.get("/overdue")
async def get_overdue_items(db: Session = Depends(get_db)):
    """Get overdue items and invoices"""
    from sqlalchemy import or_

    # Overdue invoices
    overdue_invoices = db.query(Invoice).filter(
        and_(
            Invoice.due_date < date.today(),
            Invoice.balance > 0,
            Invoice.status.in_(['pending', 'partial'])
        )
    ).limit(10).all()

    # Low stock items
    low_stock_items = db.query(Item).filter(
        Item.available_quantity < Item.min_stock_level
    ).limit(10).all()

    return {
        "success": True,
        "data": {
            "overdue_invoices": [
                {
                    "id": str(inv.id),
                    "invoice_number": inv.invoice_number,
                    "customer_name": inv.customer.company_name if inv.customer else "Unknown",
                    "due_date": inv.due_date.isoformat() if inv.due_date else None,
                    "balance": float(inv.balance),
                    "total_amount": float(inv.total_amount)
                }
                for inv in overdue_invoices
            ],
            "low_stock_items": [
                {
                    "id": str(item.id),
                    "item_name": item.name,
                    "total_quantity": item.total_quantity,
                    "available_quantity": item.available_quantity,
                    "min_stock_level": item.min_stock_level,
                    "unit": item.unit
                }
                for item in low_stock_items
            ]
        }
    }

@router.get("/recent")
async def get_recent_activity(db: Session = Depends(get_db)):
    """Get recent activity across modules"""
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(5).all()
    recent_invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).limit(5).all()

    return {
        "success": True,
        "data": {
            "recent_orders": [
                {
                    "id": str(order.id),
                    "order_number": order.order_number,
                    "customer_name": order.customer.company_name if order.customer else f"{order.customer.first_name} {order.customer.last_name}",
                    "event_name": order.event_name,
                    "status": order.status,
                    "total_amount": float(order.total_amount),
                    "created_at": order.created_at.isoformat()
                }
                for order in recent_orders
            ],
            "recent_invoices": [
                {
                    "id": str(inv.id),
                    "invoice_number": inv.invoice_number,
                    "customer_name": inv.customer.company_name if inv.customer else "Unknown",
                    "total_amount": float(inv.total_amount),
                    "paid_amount": float(inv.paid_amount),
                    "status": inv.status,
                    "created_at": inv.created_at.isoformat()
                }
                for inv in recent_invoices
            ]
        }
    }
