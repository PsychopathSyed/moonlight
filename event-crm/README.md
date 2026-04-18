# Event CRM - Event Management System

A full-featured Customer Relationship Management (CRM) system designed for event management businesses that provide event planning services and rental items like screens, microphones, sound systems, coffee machines, and more.

## Features

### 📊 Dashboard
- Overview statistics for your business
- Quick access to key metrics

### 👥 Client Management
- Add, edit, and delete clients
- Store contact information and company details
- Track client history

### 📅 Event Management
- Create and manage events
- Track event types (Wedding, Corporate, Conference, etc.)
- Manage event status (Planning, Confirmed, Completed, Cancelled)
- Link events to clients
- Set budgets and track guest counts

### 🎬 Rental Items Inventory
- Manage inventory of rental items
- Categories: Video, Audio, Lighting, Furniture, Appliances, Decor
- Track quantity available vs total
- Set pricing per day
- Activate/deactivate items

### 📋 Equipment Bookings
- Book rental items for events
- Track booking dates and duration
- Automatic price calculation
- Monitor availability in real-time
- Update booking status

### ⚙️ Services Management
- Add event services (Planning, Setup, Catering, etc.)
- Assign staff to services
- Track service status
- Price services

## Technology Stack

### Backend
- **Python Flask** - Web framework
- **Flask-SQLAlchemy** - Database ORM
- **SQLite** - Database
- **Flask-CORS** - Cross-Origin Resource Sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Axios** - HTTP client
- **CSS3** - Styling

## Project Structure

```
event-crm/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── models/
│   │   └── models.py       # Database models
│   ├── routes/
│   │   └── routes.py       # API endpoints
│   └── config/
└── frontend/
    ├── src/
    │   ├── App.jsx         # Main React component
    │   ├── main.jsx        # Entry point
    │   ├── api.js          # API client
    │   ├── index.css       # Styles
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Clients.jsx
    │   │   ├── Events.jsx
    │   │   ├── RentalItems.jsx
    │   │   ├── Bookings.jsx
    │   │   └── Services.jsx
    ├── package.json
    ├── vite.config.js
    └── index.html
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd event-crm/backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd event-crm/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Rental Items
- `GET /api/rental-items` - Get all rental items
- `GET /api/rental-items/:id` - Get item by ID
- `POST /api/rental-items` - Create new item
- `PUT /api/rental-items/:id` - Update item
- `DELETE /api/rental-items/:id` - Delete item

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Usage Guide

### Getting Started

1. **Add Clients First**: Start by adding your clients in the Clients section
2. **Create Events**: Link events to your clients
3. **Add Rental Items**: Populate your inventory with screens, sound systems, coffee machines, etc.
4. **Make Bookings**: Book rental items for your events
5. **Add Services**: Include event management services

### Managing Rental Items

When adding rental items:
- Choose appropriate categories (Video, Audio, Appliances, etc.)
- Set total quantity you own
- Available quantity updates automatically when booked
- Set daily rental prices

### Booking Equipment

When creating bookings:
- Select an event
- Choose from available rental items
- Specify quantity and dates
- System automatically calculates total price
- Available quantity is reduced automatically

## Sample Data Ideas

### Rental Items to Add:
- LED Screen 55" - Video - $150/day
- Wireless Microphone Set - Audio - $75/day
- Sound System Package - Audio - $200/day
- Coffee Machine Pro - Appliances - $100/day
- Projector HD - Video - $120/day
- Lighting Kit - Lighting - $90/day
- Round Tables (10-pack) - Furniture - $50/day
- Chairs (50-pack) - Furniture - $75/day

### Service Types:
- Event Planning
- Day-of Coordination
- Setup/Installation
- Technical Support
- Cleanup
- Staffing

## License

This project is open source and available for personal and commercial use.

## Support

For questions or issues, please check the code documentation or reach out to the developer.

---

**Built with ❤️ for Event Management Professionals**
