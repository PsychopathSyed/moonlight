import React, { useState, useEffect } from 'react';
import { bookingsAPI, eventsAPI, rentalItemsAPI } from '../api';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [rentalItems, setRentalItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [formData, setFormData] = useState({
    event_id: '',
    rental_item_id: '',
    quantity: '1',
    start_date: '',
    end_date: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, eventsRes, itemsRes] = await Promise.all([
        bookingsAPI.getAll(),
        eventsAPI.getAll(),
        rentalItemsAPI.getAll()
      ]);
      setBookings(bookingsRes.data);
      setEvents(eventsRes.data);
      setRentalItems(itemsRes.data.filter(item => item.is_active));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (booking = null) => {
    if (booking) {
      setEditingBooking(booking);
      setFormData({
        event_id: booking.event_id,
        rental_item_id: booking.rental_item_id,
        quantity: booking.quantity,
        start_date: booking.start_date ? booking.start_date.split('T')[0] : '',
        end_date: booking.end_date ? booking.end_date.split('T')[0] : '',
        status: booking.status,
        notes: booking.notes || ''
      });
    } else {
      setEditingBooking(null);
      setFormData({
        event_id: events.length > 0 ? events[0].id : '',
        rental_item_id: rentalItems.length > 0 ? rentalItems[0].id : '',
        quantity: '1',
        start_date: '',
        end_date: '',
        status: 'pending',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBooking(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        quantity: parseInt(formData.quantity),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      };
      
      if (editingBooking) {
        await bookingsAPI.update(editingBooking.id, data);
      } else {
        await bookingsAPI.create(data);
      }
      loadData();
      closeModal();
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Error saving booking');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        await bookingsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusBadge = (status) => {
    return `badge badge-${status}`;
  };

  if (loading) {
    return <div className="empty-state"><h3>Loading bookings...</h3></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Bookings</h2>
        <p>Manage equipment bookings for events</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Bookings</h3>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Add Booking
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Add your first booking to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Rental Item</th>
                  <th>Quantity</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.event_name || '-'}</td>
                    <td>{booking.rental_item_name || '-'}</td>
                    <td>{booking.quantity}</td>
                    <td>{booking.start_date ? new Date(booking.start_date).toLocaleDateString() : '-'}</td>
                    <td>{booking.end_date ? new Date(booking.end_date).toLocaleDateString() : '-'}</td>
                    <td>${booking.total_price ? booking.total_price.toFixed(2) : '0.00'}</td>
                    <td>
                      <span className={getStatusBadge(booking.status)}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal(booking)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(booking.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBooking ? 'Edit Booking' : 'Add New Booking'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Event *</label>
                  <select
                    name="event_id"
                    className="form-control"
                    value={formData.event_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Event</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.name} ({event.event_date ? new Date(event.event_date).toLocaleDateString() : 'No date'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Rental Item *</label>
                  <select
                    name="rental_item_id"
                    className="form-control"
                    value={formData.rental_item_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Item</option>
                    {rentalItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} (${item.price_per_day}/day) - Available: {item.quantity_available}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    className="form-control"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    className="form-control"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    className="form-control"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBooking ? 'Update' : 'Create'} Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
