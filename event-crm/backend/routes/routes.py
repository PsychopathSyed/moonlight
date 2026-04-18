from flask import Blueprint, request, jsonify
from app import db
from models.models import Client, Event, RentalItem, Booking, Service
from datetime import datetime

bp = Blueprint('routes', __name__)

# ==================== CLIENT ROUTES ====================

@bp.route('/api/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    return jsonify([client.to_dict() for client in clients]), 200

@bp.route('/api/clients/<int:id>', methods=['GET'])
def get_client(id):
    client = Client.query.get_or_404(id)
    return jsonify(client.to_dict()), 200

@bp.route('/api/clients', methods=['POST'])
def create_client():
    data = request.get_json()
    client = Client(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        company=data.get('company'),
        address=data.get('address')
    )
    db.session.add(client)
    db.session.commit()
    return jsonify(client.to_dict()), 201

@bp.route('/api/clients/<int:id>', methods=['PUT'])
def update_client(id):
    client = Client.query.get_or_404(id)
    data = request.get_json()
    
    client.name = data.get('name', client.name)
    client.email = data.get('email', client.email)
    client.phone = data.get('phone', client.phone)
    client.company = data.get('company', client.company)
    client.address = data.get('address', client.address)
    
    db.session.commit()
    return jsonify(client.to_dict()), 200

@bp.route('/api/clients/<int:id>', methods=['DELETE'])
def delete_client(id):
    client = Client.query.get_or_404(id)
    db.session.delete(client)
    db.session.commit()
    return '', 204

# ==================== EVENT ROUTES ====================

@bp.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([event.to_dict() for event in events]), 200

@bp.route('/api/events/<int:id>', methods=['GET'])
def get_event(id):
    event = Event.query.get_or_404(id)
    return jsonify(event.to_dict()), 200

@bp.route('/api/events', methods=['POST'])
def create_event():
    data = request.get_json()
    event_date = datetime.fromisoformat(data['event_date'].replace('Z', '+00:00')) if 'Z' in data['event_date'] else datetime.fromisoformat(data['event_date'])
    
    event = Event(
        name=data['name'],
        event_type=data.get('event_type'),
        event_date=event_date,
        location=data['location'],
        expected_guests=data.get('expected_guests'),
        budget=data.get('budget'),
        status=data.get('status', 'planning'),
        notes=data.get('notes'),
        client_id=data['client_id']
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201

@bp.route('/api/events/<int:id>', methods=['PUT'])
def update_event(id):
    event = Event.query.get_or_404(id)
    data = request.get_json()
    
    event.name = data.get('name', event.name)
    event.event_type = data.get('event_type', event.event_type)
    if 'event_date' in data:
        event.event_date = datetime.fromisoformat(data['event_date'].replace('Z', '+00:00')) if 'Z' in data['event_date'] else datetime.fromisoformat(data['event_date'])
    event.location = data.get('location', event.location)
    event.expected_guests = data.get('expected_guests', event.expected_guests)
    event.budget = data.get('budget', event.budget)
    event.status = data.get('status', event.status)
    event.notes = data.get('notes', event.notes)
    event.client_id = data.get('client_id', event.client_id)
    
    db.session.commit()
    return jsonify(event.to_dict()), 200

@bp.route('/api/events/<int:id>', methods=['DELETE'])
def delete_event(id):
    event = Event.query.get_or_404(id)
    db.session.delete(event)
    db.session.commit()
    return '', 204

# ==================== RENTAL ITEM ROUTES ====================

@bp.route('/api/rental-items', methods=['GET'])
def get_rental_items():
    items = RentalItem.query.all()
    return jsonify([item.to_dict() for item in items]), 200

@bp.route('/api/rental-items/<int:id>', methods=['GET'])
def get_rental_item(id):
    item = RentalItem.query.get_or_404(id)
    return jsonify(item.to_dict()), 200

@bp.route('/api/rental-items', methods=['POST'])
def create_rental_item():
    data = request.get_json()
    item = RentalItem(
        name=data['name'],
        category=data['category'],
        description=data.get('description'),
        quantity_available=data.get('quantity_available', data['quantity_total']),
        quantity_total=data['quantity_total'],
        price_per_day=data['price_per_day'],
        is_active=data.get('is_active', True)
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@bp.route('/api/rental-items/<int:id>', methods=['PUT'])
def update_rental_item(id):
    item = RentalItem.query.get_or_404(id)
    data = request.get_json()
    
    item.name = data.get('name', item.name)
    item.category = data.get('category', item.category)
    item.description = data.get('description', item.description)
    item.quantity_available = data.get('quantity_available', item.quantity_available)
    item.quantity_total = data.get('quantity_total', item.quantity_total)
    item.price_per_day = data.get('price_per_day', item.price_per_day)
    item.is_active = data.get('is_active', item.is_active)
    
    db.session.commit()
    return jsonify(item.to_dict()), 200

@bp.route('/api/rental-items/<int:id>', methods=['DELETE'])
def delete_rental_item(id):
    item = RentalItem.query.get_or_404(id)
    db.session.delete(item)
    db.session.commit()
    return '', 204

# ==================== BOOKING ROUTES ====================

@bp.route('/api/bookings', methods=['GET'])
def get_bookings():
    bookings = Booking.query.all()
    return jsonify([booking.to_dict() for booking in bookings]), 200

@bp.route('/api/bookings/<int:id>', methods=['GET'])
def get_booking(id):
    booking = Booking.query.get_or_404(id)
    return jsonify(booking.to_dict()), 200

@bp.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.get_json()
    start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00')) if 'Z' in data['start_date'] else datetime.fromisoformat(data['start_date'])
    end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00')) if 'Z' in data['end_date'] else datetime.fromisoformat(data['end_date'])
    
    rental_item = RentalItem.query.get(data['rental_item_id'])
    total_price = rental_item.price_per_day * data['quantity'] * (end_date - start_date).days
    
    booking = Booking(
        event_id=data['event_id'],
        rental_item_id=data['rental_item_id'],
        quantity=data['quantity'],
        start_date=start_date,
        end_date=end_date,
        total_price=total_price,
        status=data.get('status', 'pending'),
        notes=data.get('notes')
    )
    
    # Update available quantity
    rental_item.quantity_available -= data['quantity']
    
    db.session.add(booking)
    db.session.commit()
    return jsonify(booking.to_dict()), 201

@bp.route('/api/bookings/<int:id>', methods=['PUT'])
def update_booking(id):
    booking = Booking.query.get_or_404(id)
    data = request.get_json()
    
    old_quantity = booking.quantity
    booking.event_id = data.get('event_id', booking.event_id)
    booking.rental_item_id = data.get('rental_item_id', booking.rental_item_id)
    booking.quantity = data.get('quantity', booking.quantity)
    if 'start_date' in data:
        booking.start_date = datetime.fromisoformat(data['start_date'].replace('Z', '+00:00')) if 'Z' in data['start_date'] else datetime.fromisoformat(data['start_date'])
    if 'end_date' in data:
        booking.end_date = datetime.fromisoformat(data['end_date'].replace('Z', '+00:00')) if 'Z' in data['end_date'] else datetime.fromisoformat(data['end_date'])
    booking.status = data.get('status', booking.status)
    booking.notes = data.get('notes', booking.notes)
    
    # Recalculate total price
    rental_item = RentalItem.query.get(booking.rental_item_id)
    days = (booking.end_date - booking.start_date).days
    booking.total_price = rental_item.price_per_day * booking.quantity * days
    
    # Update available quantity
    quantity_diff = old_quantity - booking.quantity
    rental_item.quantity_available += quantity_diff
    
    db.session.commit()
    return jsonify(booking.to_dict()), 200

@bp.route('/api/bookings/<int:id>', methods=['DELETE'])
def delete_booking(id):
    booking = Booking.query.get_or_404(id)
    rental_item = RentalItem.query.get(booking.rental_item_id)
    rental_item.quantity_available += booking.quantity
    db.session.delete(booking)
    db.session.commit()
    return '', 204

# ==================== SERVICE ROUTES ====================

@bp.route('/api/services', methods=['GET'])
def get_services():
    services = Service.query.all()
    return jsonify([service.to_dict() for service in services]), 200

@bp.route('/api/services/<int:id>', methods=['GET'])
def get_service(id):
    service = Service.query.get_or_404(id)
    return jsonify(service.to_dict()), 200

@bp.route('/api/services', methods=['POST'])
def create_service():
    data = request.get_json()
    service = Service(
        event_id=data['event_id'],
        service_name=data['service_name'],
        service_type=data.get('service_type'),
        description=data.get('description'),
        price=data.get('price'),
        status=data.get('status', 'pending'),
        assigned_to=data.get('assigned_to')
    )
    db.session.add(service)
    db.session.commit()
    return jsonify(service.to_dict()), 201

@bp.route('/api/services/<int:id>', methods=['PUT'])
def update_service(id):
    service = Service.query.get_or_404(id)
    data = request.get_json()
    
    service.event_id = data.get('event_id', service.event_id)
    service.service_name = data.get('service_name', service.service_name)
    service.service_type = data.get('service_type', service.service_type)
    service.description = data.get('description', service.description)
    service.price = data.get('price', service.price)
    service.status = data.get('status', service.status)
    service.assigned_to = data.get('assigned_to', service.assigned_to)
    
    db.session.commit()
    return jsonify(service.to_dict()), 200

@bp.route('/api/services/<int:id>', methods=['DELETE'])
def delete_service(id):
    service = Service.query.get_or_404(id)
    db.session.delete(service)
    db.session.commit()
    return '', 204

# ==================== DASHBOARD STATS ====================

@bp.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    total_clients = Client.query.count()
    total_events = Event.query.count()
    upcoming_events = Event.query.filter(Event.event_date >= datetime.utcnow()).count()
    total_rental_items = RentalItem.query.count()
    active_bookings = Booking.query.filter(Booking.status.in_(['pending', 'confirmed'])).count()
    
    return jsonify({
        'total_clients': total_clients,
        'total_events': total_events,
        'upcoming_events': upcoming_events,
        'total_rental_items': total_rental_items,
        'active_bookings': active_bookings
    }), 200
