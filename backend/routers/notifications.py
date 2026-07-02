"""
Notifications Router - Derived operational notifications

Notifications are derived live from orders, invoices and inventory so they
are always in sync with the data (nothing needs to write notification rows).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, timedelta

from database.connection import get_db
from models import Order, Invoice, Item, Customer, Notification

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


def _customer_name(customer: Customer) -> str:
    if not customer:
        return "Unknown"
    return f"{customer.first_name or ''} {customer.last_name or ''} {customer.company_name or ''}".strip() or "Unknown"


@router.get("")
async def list_notifications(db: Session = Depends(get_db)):
    """List derived notifications plus upcoming events, pending payments and low stock"""
    today = date.today()
    soon = today + timedelta(days=3)
    week_ahead = today + timedelta(days=7)

    notifications = []

    # Dispatch reminders: orders starting within 3 days, not yet dispatched
    upcoming_orders = db.query(Order).filter(
        Order.start_date >= today,
        Order.start_date <= soon,
        Order.status.in_(["pending", "confirmed"]),
    ).all()
    for order in upcoming_orders:
        notifications.append({
            "id": f"dispatch-{order.id}",
            "type": "dispatch",
            "title": "Dispatch Reminder",
            "message": f"{order.order_number}: {_customer_name(order.customer)} items to dispatch on {order.start_date.isoformat()}",
            "date": order.start_date.isoformat(),
            "reference": order.order_number,
            "status": "unread",
        })

    # Return reminders: orders ending today or earlier, still out
    due_returns = db.query(Order).filter(
        Order.end_date <= today,
        Order.status.in_(["dispatched", "active", "confirmed"]),
    ).all()
    for order in due_returns:
        notifications.append({
            "id": f"return-{order.id}",
            "type": "return",
            "title": "Return Due",
            "message": f"{order.order_number}: {_customer_name(order.customer)} items due for return since {order.end_date.isoformat()}",
            "date": order.end_date.isoformat(),
            "reference": order.order_number,
            "status": "unread",
        })

    # Payment reminders: invoices with outstanding balance past due date
    overdue_invoices = db.query(Invoice).filter(
        Invoice.balance > 0,
        Invoice.due_date != None,
        Invoice.due_date < today,
    ).all()
    for inv in overdue_invoices:
        notifications.append({
            "id": f"payment-{inv.id}",
            "type": "payment",
            "title": "Payment Overdue",
            "message": f"{inv.invoice_number}: {_customer_name(inv.customer)} payment of PKR {float(inv.balance):,.0f} overdue",
            "date": inv.due_date.isoformat(),
            "reference": inv.invoice_number,
            "amount": float(inv.balance),
            "status": "unread",
        })

    # Low stock alerts
    low_stock_items = db.query(Item).filter(
        Item.is_active == True,
        Item.available_quantity < Item.min_stock_level,
    ).all()
    for item in low_stock_items:
        notifications.append({
            "id": f"alert-{item.id}",
            "type": "alert",
            "title": "Low Stock Alert",
            "message": f"{item.name}: Only {item.available_quantity} {item.unit or 'pcs'} remaining (min: {item.min_stock_level})",
            "date": today.isoformat(),
            "reference": item.name,
            "status": "unread",
        })

    # Persisted notifications, if anything writes them
    stored = db.query(Notification).order_by(Notification.created_at.desc()).limit(50).all()
    for n in stored:
        notifications.append({
            "id": str(n.id),
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "date": n.created_at.isoformat() if n.created_at else today.isoformat(),
            "status": n.status,
        })

    notifications.sort(key=lambda n: n["date"], reverse=True)

    # Side panels
    upcoming_events = [{
        "id": str(o.id),
        "order": o.order_number,
        "customer": _customer_name(o.customer),
        "event": o.event_name or "-",
        "dispatchDate": o.start_date.isoformat(),
        "returnDate": o.end_date.isoformat(),
        "status": o.status,
    } for o in db.query(Order).filter(
        Order.start_date >= today,
        Order.start_date <= week_ahead,
    ).order_by(Order.start_date).limit(10).all()]

    pending_payments = [{
        "id": str(i.id),
        "invoice": i.invoice_number,
        "customer": _customer_name(i.customer),
        "amount": float(i.balance),
        "dueDate": i.due_date.isoformat() if i.due_date else None,
        "daysOverdue": max(0, (today - i.due_date).days) if i.due_date else 0,
        "status": "overdue" if i.due_date and i.due_date < today else "due",
    } for i in db.query(Invoice).filter(Invoice.balance > 0).order_by(Invoice.due_date).limit(10).all()]

    low_stock = [{
        "id": str(i.id),
        "item": i.name,
        "category": i.category.name if i.category else (i.item_type or "-"),
        "current": i.available_quantity,
        "minimum": i.min_stock_level,
        "unit": i.unit or "pcs",
        "percentage": round(i.available_quantity / i.min_stock_level * 100) if i.min_stock_level else 0,
    } for i in low_stock_items]

    return {
        "success": True,
        "data": {
            "notifications": notifications,
            "unread_count": sum(1 for n in notifications if n["status"] == "unread"),
            "upcoming_events": upcoming_events,
            "pending_payments": pending_payments,
            "low_stock": low_stock,
        },
    }


@router.post("/read-all")
async def mark_all_read(db: Session = Depends(get_db)):
    """Mark all persisted notifications as read"""
    db.query(Notification).filter(Notification.status == "unread").update({"status": "read"})
    db.commit()
    return {"success": True, "message": "All notifications marked as read"}
