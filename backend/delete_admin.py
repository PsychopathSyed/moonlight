#!/usr/bin/env python3
"""
Delete problematic admin user from database
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
    # Find and delete admin user
    admin_user = db.query(User).filter(User.username == "admin").first()
    if admin_user:
        print(f"Found admin user: {admin_user.username}")
        db.delete(admin_user)
        db.commit()
        print("✅ Admin user deleted from database!")
        print("\nNow you can use registration to create a new admin user.")
        print("Go to: http://haditex.net")
        print("Click 'Register' and create admin account with:")
        print("  Username: admin")
        print("  Email: admin@example.com")
        print("  Password: admin123")
    else:
        print("Admin user not found in database.")
        
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
