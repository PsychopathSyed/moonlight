#!/usr/bin/env python3
"""
List all users in database
"""
import sys
import os

backend_dir = "/opt/event-erp/backend"
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

from database.connection import SessionLocal
from models import User

db = SessionLocal()

try:
    users = db.query(User).all()
    if users:
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"  - Username: {user.username}, Email: {user.email}, Role: {user.role}, Active: {user.is_active}")
    else:
        print("No users found in database.")
        
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
