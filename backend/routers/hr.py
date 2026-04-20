"""
HR Router - Employee and salary management endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

from database.connection import get_db
from models import Employee, SalaryAdvance, SalaryProcess
from schemas import SuccessResponse

router = APIRouter(prefix="/api/hr", tags=["HR"])


@router.get("/employees")
async def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all employees with filtering and pagination"""
    try:
        query = db.query(Employee)
        
        if status_filter:
            query = query.filter(Employee.status == status_filter)
        
        total = query.count()
        offset = (page - 1) * page_size
        employees = query.order_by(Employee.employee_number).offset(offset).limit(page_size).all()
        
        employee_list = []
        for emp in employees:
            employee_list.append({
                "id": str(emp.id),
                "employee_number": emp.employee_number,
                "first_name": emp.first_name,
                "last_name": emp.last_name,
                "full_name": f"{emp.first_name} {emp.last_name}",
                "role": emp.role,
                "phone": emp.phone,
                "email": emp.email,
                "cnic": emp.cnic,
                "address": emp.address,
                "salary": float(emp.salary),
                "join_date": emp.join_date.isoformat(),
                "status": emp.status,
                "created_at": emp.created_at.isoformat() if emp.created_at else None
            })
        
        return {
            "success": True,
            "data": {
                "employees": employee_list,
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


@router.get("/employees/{employee_id}")
async def get_employee(employee_id: str, db: Session = Depends(get_db)):
    """Get employee by ID"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {
        "success": True,
        "data": {
            "id": str(employee.id),
            "employee_number": employee.employee_number,
            "first_name": employee.first_name,
            "last_name": employee.last_name,
            "role": employee.role,
            "phone": employee.phone,
            "email": employee.email,
            "cnic": employee.cnic,
            "address": employee.address,
            "salary": float(employee.salary),
            "join_date": employee.join_date.isoformat(),
            "status": employee.status
        }
    }


@router.post("/employees")
async def create_employee(employee_data: dict, db: Session = Depends(get_db)):
    """Create a new employee"""
    try:
        # Generate employee number
        last_emp = db.query(Employee).order_by(Employee.created_at.desc()).first()
        if last_emp:
            last_num = int(last_emp.employee_number.split('-')[1]) if '-' in last_emp.employee_number else 0
            emp_number = f"EMP-{last_num + 1:04d}"
        else:
            emp_number = "EMP-0001"
        
        employee = Employee(
            employee_number=emp_number,
            first_name=employee_data["first_name"],
            last_name=employee_data["last_name"],
            role=employee_data["role"],
            phone=employee_data.get("phone"),
            email=employee_data.get("email"),
            cnic=employee_data.get("cnic"),
            address=employee_data.get("address"),
            salary=Decimal(str(employee_data["salary"])),
            join_date=date.fromisoformat(employee_data["join_date"]),
            status=employee_data.get("status", "active")
        )
        
        db.add(employee)
        db.commit()
        db.refresh(employee)
        
        return {
            "success": True,
            "message": "Employee created successfully",
            "data": {
                "id": str(employee.id),
                "employee_number": employee.employee_number
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/employees/{employee_id}")
async def update_employee(employee_id: str, employee_data: dict, db: Session = Depends(get_db)):
    """Update an existing employee"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    try:
        if "first_name" in employee_data:
            employee.first_name = employee_data["first_name"]
        if "last_name" in employee_data:
            employee.last_name = employee_data["last_name"]
        if "role" in employee_data:
            employee.role = employee_data["role"]
        if "phone" in employee_data:
            employee.phone = employee_data["phone"]
        if "email" in employee_data:
            employee.email = employee_data["email"]
        if "cnic" in employee_data:
            employee.cnic = employee_data["cnic"]
        if "address" in employee_data:
            employee.address = employee_data["address"]
        if "salary" in employee_data:
            employee.salary = Decimal(str(employee_data["salary"]))
        if "status" in employee_data:
            employee.status = employee_data["status"]
        
        db.commit()
        db.refresh(employee)
        
        return {"success": True, "message": "Employee updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    """Delete an employee"""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    try:
        db.delete(employee)
        db.commit()
        return {"success": True, "message": "Employee deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/advances")
async def list_advances(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    employee_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List salary advances"""
    try:
        query = db.query(SalaryAdvance)
        
        if employee_id:
            query = query.filter(SalaryAdvance.employee_id == employee_id)
        
        total = query.count()
        offset = (page - 1) * page_size
        advances = query.order_by(SalaryAdvance.advance_date.desc()).offset(offset).limit(page_size).all()
        
        advance_list = []
        for adv in advances:
            advance_list.append({
                "id": str(adv.id),
                "employee_id": str(adv.employee_id),
                "amount": float(adv.amount),
                "advance_date": adv.advance_date.isoformat(),
                "reason": adv.reason,
                "is_deducted": adv.is_deducted,
                "deduction_month": adv.deduction_month,
                "created_at": adv.created_at.isoformat() if adv.created_at else None
            })
        
        return {
            "success": True,
            "data": {
                "advances": advance_list,
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


@router.post("/advances")
async def create_advance(advance_data: dict, db: Session = Depends(get_db)):
    """Create a salary advance"""
    try:
        advance = SalaryAdvance(
            employee_id=advance_data["employee_id"],
            amount=Decimal(str(advance_data["amount"])),
            advance_date=date.fromisoformat(advance_data.get("advance_date", date.today().isoformat())),
            reason=advance_data.get("reason"),
            is_deducted=False
        )
        
        db.add(advance)
        db.commit()
        db.refresh(advance)
        
        return {"success": True, "message": "Advance created successfully", "data": {"id": str(advance.id)}}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/salary")
async def list_salary_processes(
    month: Optional[str] = None,
    employee_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List salary processes"""
    try:
        query = db.query(SalaryProcess)
        
        if month:
            query = query.filter(SalaryProcess.month == month)
        if employee_id:
            query = query.filter(SalaryProcess.employee_id == employee_id)
        
        processes = query.order_by(SalaryProcess.month.desc()).all()
        
        process_list = []
        for proc in processes:
            process_list.append({
                "id": str(proc.id),
                "employee_id": str(proc.employee_id),
                "month": proc.month,
                "basic_salary": float(proc.basic_salary),
                "advance_deduction": float(proc.advance_deduction),
                "incentives": float(proc.incentives),
                "other_deductions": float(proc.other_deductions),
                "net_salary": float(proc.net_salary),
                "status": proc.status,
                "reference_number": proc.reference_number,
                "processed_date": proc.processed_date.isoformat() if proc.processed_date else None
            })
        
        return {"success": True, "data": {"salary_processes": process_list}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/salary/process")
async def process_salary(process_data: dict, db: Session = Depends(get_db)):
    """Process monthly salary"""
    try:
        # Generate reference number
        ref_prefix = f"SAL-{process_data['month'].replace('-', '')}"
        last_proc = db.query(SalaryProcess).filter(
            SalaryProcess.reference_number.like(f"{ref_prefix}%")
        ).order_by(SalaryProcess.reference_number.desc()).first()
        
        if last_proc:
            last_num = int(last_proc.reference_number.split('-')[-1])
            ref_number = f"{ref_prefix}-{last_num + 1:03d}"
        else:
            ref_number = f"{ref_prefix}-001"
        
        process = SalaryProcess(
            employee_id=process_data["employee_id"],
            month=process_data["month"],
            basic_salary=Decimal(str(process_data["basic_salary"])),
            advance_deduction=Decimal(str(process_data.get("advance_deduction", 0))),
            incentives=Decimal(str(process_data.get("incentives", 0))),
            other_deductions=Decimal(str(process_data.get("other_deductions", 0))),
            net_salary=Decimal(str(process_data["net_salary"])),
            status=process_data.get("status", "pending"),
            reference_number=ref_number,
            processed_date=date.fromisoformat(process_data.get("processed_date", date.today().isoformat()))
        )
        
        db.add(process)
        db.commit()
        db.refresh(process)
        
        return {"success": True, "message": "Salary processed successfully", "data": {"id": str(process.id)}}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
