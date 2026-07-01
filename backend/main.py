"""
Event Rental Management System - FastAPI Main Application
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import logging

from config import settings
from database.connection import engine, SessionLocal, Base
from routers import (
    auth, inventory, customers,
    orders, dashboard, invoices, quotations,
    payments, rentals, returns,
    expenses, hr, ledger,
    purchases, partners,
    placeholders as other_routers
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Event Rental Management System",
    description="Complete ERP for event rental business",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lifespan events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Event Rental Management System...")
    logger.info(f"Database: {settings.DATABASE_URL}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Create tables (for development - use Alembic for production)
    if settings.ENVIRONMENT == "development":
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created")
            # Create initial data
            from database.connection import init_db
            init_db()
            logger.info("Initial database data created")
        except Exception:
            logger.exception("Startup database initialization failed")
            raise

    yield

    # Shutdown
    logger.info("Shutting down Event Rental Management System...")

# Set lifespan
app.router.lifespan_context = lifespan

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(invoices.router, tags=["Invoices"])
app.include_router(quotations.router, tags=["Quotations"])
app.include_router(payments.router, tags=["Payments"])
app.include_router(rentals.router, tags=["Rentals"])
app.include_router(returns.router, tags=["Returns"])

# New module routers
app.include_router(expenses.router, tags=["Expenses"])
app.include_router(hr.router, tags=["HR"])
app.include_router(ledger.router, tags=["Ledger"])
app.include_router(purchases.router, tags=["Purchases"])
app.include_router(partners.router, tags=["Partners"])

# Placeholder routers for remaining modules
app.include_router(other_routers.router, tags=["Other Modules"])

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint - API information
    """
    return {
        "name": "Event Rental Management System API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    try:
        # Test database connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()

        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unavailable"
        )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse ( 
	        status_code=500,
	content={
        "success": False,
        "error": {
            "code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred"
        }
    }
)
# Run server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
