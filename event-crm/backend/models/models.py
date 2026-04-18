from app import db
from datetime import datetime

class Client(db.Model):
    __tablename__ = 'clients'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    company = db.Column(db.String(100))
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    events = db.relationship('Event', backref='client', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'company': self.company,
            'address': self.address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    event_type = db.Column(db.String(50))  # Wedding, Corporate, Conference, etc.
    event_date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    expected_guests = db.Column(db.Integer)
    budget = db.Column(db.Float)
    status = db.Column(db.String(20), default='planning')  # planning, confirmed, completed, cancelled
    notes = db.Column(db.Text)
    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='event', lazy=True, cascade='all, delete-orphan')
    services = db.relationship('Service', backref='event', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'event_type': self.event_type,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'location': self.location,
            'expected_guests': self.expected_guests,
            'budget': self.budget,
            'status': self.status,
            'notes': self.notes,
            'client_id': self.client_id,
            'client_name': self.client.name if self.client else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class RentalItem(db.Model):
    __tablename__ = 'rental_items'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # Audio, Video, Furniture, Appliances, etc.
    description = db.Column(db.Text)
    quantity_available = db.Column(db.Integer, default=1)
    quantity_total = db.Column(db.Integer, nullable=False)
    price_per_day = db.Column(db.Float, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='rental_item', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'quantity_available': self.quantity_available,
            'quantity_total': self.quantity_total,
            'price_per_day': self.price_per_day,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    rental_item_id = db.Column(db.Integer, db.ForeignKey('rental_items.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    total_price = db.Column(db.Float)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'event_name': self.event.name if self.event else None,
            'rental_item_id': self.rental_item_id,
            'rental_item_name': self.rental_item.name if self.rental_item else None,
            'quantity': self.quantity,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'total_price': self.total_price,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    service_name = db.Column(db.String(100), nullable=False)
    service_type = db.Column(db.String(50))  # Planning, Catering, Setup, Cleanup, etc.
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, cancelled
    assigned_to = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'event_name': self.event.name if self.event else None,
            'service_name': self.service_name,
            'service_type': self.service_type,
            'description': self.description,
            'price': self.price,
            'status': self.status,
            'assigned_to': self.assigned_to,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
