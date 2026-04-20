"""
Expenses Router - Expense management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

from database.connection import get_db
from models import Expense, Employee
from schemas import SuccessResponse, ErrorResponse

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


class ExpenseCreate:
    def __init__(self, expense_date: date, category: str, description: str, 
                 type: str, amount: Decimal, employee_id: Optional[str] = None,
                 is_salary_deductible: bool = False, notes: Optional[str] = None):
        self.expense_date = expense_date
        self.category = category
        self.description = description
        self.type = type
        self.amount = amount
        self.employee_id = employee_id
        self.is_salary_deductible = is_salary_deductible
        self.notes = notes


@router.get("")
async def list_expenses(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """List all expenses with filtering and pagination"""
    try:
        query = db.query(Expense)
        
        # Apply filters
        if category:
            query = query.filter(Expense.category == category)
        if type:
            query = query.filter(Expense.type == type)
        if start_date:
            query = query.filter(Expense.expense_date >= start_date)
        if end_date:
            query = query.filter(Expense.expense_date <= end_date)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * page_size
        expenses = query.order_by(Expense.expense_date.desc()).offset(offset).limit(page_size).all()
        
        expense_list = []
        for exp in expenses:
            expense_list.append({
                "id": str(exp.id),
                "expense_date": exp.expense_date.isoformat(),
                "category": exp.category,
                "description": exp.description,
                "type": exp.type,
                "amount": float(exp.amount),
                "employee_id": str(exp.employee_id) if exp.employee_id else None,
                "is_salary_deductible": exp.is_salary_deductible,
                "notes": exp.notes,
                "created_at": exp.created_at.isoformat() if exp.created_at else None
            })
        
        return {
            "success": True,
            "data": {
                "expenses": expense_list,
                "pagination": {
                    "page": page,
                    "page_size": page_size,
                    "total": total,
                    "pages": (total + page_size - 1) // page_size
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
async def get_expense_categories(db: Session = Depends(get_db)):
    """Get list of expense categories"""
    categories = [
        "Transport", "Food", "Electricity", "Rent", "Internet", 
        "Mobile", "Package", "Maintenance", "Office Supplies", "Misc"
    ]
    return {
        "success": True,
        "data": {"categories": categories}
    }


@router.get("/{expense_id}")
async def get_expense(expense_id: str, db: Session = Depends(get_db)):
    """Get expense by ID"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return {
        "success": True,
        "data": {
            "id": str(expense.id),
            "expense_date": expense.expense_date.isoformat(),
            "category": expense.category,
            "description": expense.description,
            "type": expense.type,
            "amount": float(expense.amount),
            "employee_id": str(expense.employee_id) if expense.employee_id else None,
            "is_salary_deductible": expense.is_salary_deductible,
            "notes": expense.notes
        }
    }


@router.post("")
async def create_expense(
    expense_data: dict,
    db: Session = Depends(get_db)
):
    """Create a new expense"""
    try:
        expense = Expense(
            expense_date=date.fromisoformat(expense_data.get("expense_date", date.today().isoformat())),
            category=expense_data["category"],
            description=expense_data["description"],
            type=expense_data["type"],
            amount=Decimal(str(expense_data["amount"])),
            employee_id=expense_data.get("employee_id"),
            is_salary_deductible=expense_data.get("is_salary_deductible", False),
            notes=expense_data.get("notes")
        )
        
        db.add(expense)
        db.commit()
        db.refresh(expense)
        
        return {
            "success": True,
            "message": "Expense created successfully",
            "data": {
                "id": str(expense.id),
                "expense_date": expense.expense_date.isoformat(),
                "category": expense.category,
                "amount": float(expense.amount)
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{expense_id}")
async def update_expense(
    expense_id: str,
    expense_data: dict,
    db: Session = Depends(get_db)
):
    """Update an existing expense"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    try:
        # Update fields
        if "expense_date" in expense_data:
            expense.expense_date = date.fromisoformat(expense_data["expense_date"])
        if "category" in expense_data:
            expense.category = expense_data["category"]
        if "description" in expense_data:
            expense.description = expense_data["description"]
        if "type" in expense_data:
            expense.type = expense_data["type"]
        if "amount" in expense_data:
            expense.amount = Decimal(str(expense_data["amount"]))
        if "employee_id" in expense_data:
            expense.employee_id = expense_data["employee_id"]
        if "is_salary_deductible" in expense_data:
            expense.is_salary_deductible = expense_data["is_salary_deductible"]
        if "notes" in expense_data:
            expense.notes = expense_data["notes"]
        
        db.commit()
        db.refresh(expense)
        
        return {
            "success": True,
            "message": "Expense updated successfully",
            "data": {"id": str(expense.id)}
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{expense_id}")
async def delete_expense(expense_id: str, db: Session = Depends(get_db)):
    """Delete an expense"""
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    try:
        db.delete(expense)
        db.commit()
        return {
            "success": True,
            "message": "Expense deleted successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary/monthly")
async def get_monthly_summary(
    year: int = Query(None),
    db: Session = Depends(get_db)
):
    """Get monthly expense summary"""
    if not year:
        year = datetime.now().year
    
    monthly_data = db.query(
        extract('month', Expense.expense_date).label('month'),
        func.sum(Expense.amount).label('total')
    ).filter(
        extract('year', Expense.expense_date) == year
    ).group_by(
        extract('month', Expense.expense_date)
    ).all()
    
    summary = {str(int(m.month)): float(m.total) for m in monthly_data}
    
    return {
        "success": True,
        "data": {
            "year": year,
            "monthly_totals": summary
        }
    }
