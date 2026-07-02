"""
Event Rental Management System - FastAPI Main Application
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import logging
import re

from config import settings
from sqlalchemy import text
from database.connection import engine, SessionLocal, Base
from routers import (
    auth, inventory, customers,
    orders, dashboard, invoices, quotations,
    payments, rentals, returns,
    expenses, hr, ledger,
    purchases, partners, gatepass,
    notifications, reports,
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
    # Vercel gives every deployment a unique per-build URL in addition to the
    # stable production domain, so also allow any *.vercel.app subdomain that
    # starts with "moonlight" (covers preview/deployment-hash URLs automatically)
    allow_origin_regex=r"^https://moonlight[a-z0-9-]*\.vercel\.app$",
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
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Create tables if they don't exist yet (idempotent - safe to run every startup;
    # this app has no Alembic migrations in actual use, so this is the only thing
    # that ever creates the schema)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables verified/created")
    except Exception:
        logger.exception("Startup table creation failed")

    # create_all() never alters existing tables, so columns added to the
    # Purchase model after the table first shipped need explicit ALTERs
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE purchases ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100)"))
            conn.execute(text("ALTER TABLE purchases ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20)"))
    except Exception:
        logger.exception("Startup column migration failed")

    if settings.ENVIRONMENT == "development":
        try:
            from database.connection import init_db
            init_db()
            logger.info("Initial database data created")
        except Exception as e:
            logger.warning(f"Could not create initial data: {e}")

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
app.include_router(gatepass.router, tags=["Gate Pass"])
app.include_router(notifications.router, tags=["Notifications"])
app.include_router(reports.router, tags=["Reports"])
app.include_router(other_routers.settings_router, tags=["Settings"])

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
@app.get("/debug/create-tables")
async def debug_create_tables():
    """
    Temporary diagnostic endpoint: runs create_all() synchronously and returns
    the real exception (if any) directly, instead of relying on Vercel log digging.
    Remove once the table-creation issue is confirmed fixed.
    """
    import traceback
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        rows = db.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")).fetchall()
        db.close()
        return {"success": True, "tables": [r[0] for r in rows]}
    except Exception as e:
        return {"success": False, "error_type": type(e).__name__, "error": str(e), "traceback": traceback.format_exc()}


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    try:
        # Test database connection
        db = SessionLocal()
        db.execute(text("SELECT 1"))
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

CORS_ORIGIN_REGEX = re.compile(r"^https://moonlight[a-z0-9-]*\.vercel\.app$")


def _cors_headers_for(request) -> dict:
    """
    Manually compute CORS headers for a given request's Origin.
    Needed because responses built inside exception handling (whether via
    @app.exception_handler or BaseHTTPMiddleware) unreliably pass back through
    CORSMiddleware's own header injection in Starlette - so we don't rely on it here.
    """
    origin = request.headers.get("origin")
    if origin and (origin in settings.CORS_ORIGINS or CORS_ORIGIN_REGEX.match(origin)):
        return {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Vary": "Origin",
        }
    return {}


# Global exception handling, implemented as middleware (not @app.exception_handler)
# so the response still passes back out through CORSMiddleware. A handler registered
# via @app.exception_handler(Exception) is wired into Starlette's ServerErrorMiddleware,
# which sits OUTSIDE CORSMiddleware - its responses would never get CORS headers.
@app.middleware("http")
async def catch_exceptions_middleware(request, call_next):
    try:
        return await call_next(request)
    except Exception:
        logger.exception(f"Unhandled exception on {request.method} {request.url.path}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred"
                }
            },
            headers=_cors_headers_for(request)
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
