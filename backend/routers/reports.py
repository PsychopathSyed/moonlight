"""
Reports Router - Revenue, rental and inventory analytics
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date, timedelta

from database.connection import get_db
from models import Order, Invoice, Payment, Item, Customer

router = APIRouter(prefix="/api/reports", tags=["Reports"])

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@router.get("/summary")
async def get_reports_summary(db: Session = Depends(get_db)):
    """Aggregate report data for the Reports page"""
    today = date.today()

    # Revenue collected per month for the last 6 months (from payments)
    monthly_revenue = []
    for offset in range(5, -1, -1):
        month = (today.month - offset - 1) % 12 + 1
        year = today.year + (today.month - offset - 1) // 12
        amount = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
            extract("year", Payment.payment_date) == year,
            extract("month", Payment.payment_date) == month,
        ).scalar()
        rentals = db.query(func.count(Order.id)).filter(
            extract("year", Order.start_date) == year,
            extract("month", Order.start_date) == month,
        ).scalar()
        monthly_revenue.append({
            "month": MONTH_NAMES[month - 1],
            "amount": float(amount),
            "rentals": int(rentals or 0),
        })

    # Order status counts
    completed = db.query(func.count(Order.id)).filter(Order.status.in_(["completed", "returned"])).scalar() or 0
    active = db.query(func.count(Order.id)).filter(Order.status.in_(["dispatched", "active", "confirmed"])).scalar() or 0
    pending = db.query(func.count(Order.id)).filter(Order.status == "pending").scalar() or 0
    overdue = db.query(func.count(Order.id)).filter(
        Order.end_date < today,
        Order.status.in_(["dispatched", "active", "confirmed"]),
    ).scalar() or 0

    # Top orders this month by value
    top_orders = db.query(Order).filter(
        extract("year", Order.start_date) == today.year,
        extract("month", Order.start_date) == today.month,
    ).order_by(Order.total_amount.desc()).limit(5).all()

    def customer_name(order):
        c = order.customer
        if not c:
            return "Unknown"
        return f"{c.first_name or ''} {c.last_name or ''} {c.company_name or ''}".strip() or "Unknown"

    top_rentals = [{
        "id": str(o.id),
        "customer": customer_name(o),
        "amount": float(o.total_amount),
        "date": o.start_date.isoformat(),
        "status": o.status,
    } for o in top_orders]

    # This month's collected revenue
    month_revenue = float(db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
        extract("year", Payment.payment_date) == today.year,
        extract("month", Payment.payment_date) == today.month,
    ).scalar())

    # Inventory utilization
    totals = db.query(
        func.coalesce(func.sum(Item.total_quantity), 0),
        func.coalesce(func.sum(Item.rented_quantity), 0),
    ).filter(Item.is_active == True).first()
    total_qty, rented_qty = int(totals[0]), int(totals[1])
    utilization = round(rented_qty / total_qty * 100) if total_qty else 0

    # New customers this month
    month_start = today.replace(day=1)
    new_customers = db.query(func.count(Customer.id)).filter(
        Customer.created_at >= month_start,
    ).scalar() or 0

    return {
        "success": True,
        "data": {
            "monthly_revenue": monthly_revenue,
            "total_revenue_6m": sum(m["amount"] for m in monthly_revenue),
            "order_stats": {
                "completed": int(completed),
                "active": int(active),
                "pending": int(pending),
                "overdue": int(overdue),
            },
            "top_rentals": top_rentals,
            "month_revenue": month_revenue,
            "inventory": {
                "total_quantity": total_qty,
                "rented_quantity": rented_qty,
                "utilization": utilization,
            },
            "new_customers": int(new_customers),
        },
    }
