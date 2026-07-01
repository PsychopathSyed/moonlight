"""
Configuration for Event Rental Management System
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    """Application settings"""
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./event_rental.db")
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "10"))
    DATABASE_MAX_OVERFLOW: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "20"))

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))

    # CORS
    _cors_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
    try:
        import ast
        CORS_ORIGINS = ast.literal_eval(_cors_raw)
        if not isinstance(CORS_ORIGINS, list):
            raise ValueError
    except (ValueError, SyntaxError):
        CORS_ORIGINS = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()]

# Create settings instance
settings = Settings()
