import React, { useState, useEffect } from 'react';
import { eventsAPI, clientsAPI } from '../api';

function Events() {
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    event_type: '',
    event_date: '',
    location: '',
    expected_guests: '',
    budget: '',
    status: 'planning',
    notes: '',
    client_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsRes, clientsRes] = await Promise.all([
        eventsAPI.getAll(),
        clientsAPI.getAll()
      ]);
      setEvents(eventsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        event_type: event.event_type || '',
        event_date: event.event_date ? event.event_date.split('T')[0] : '',
        location: event.location,
        expected_guests: event.expected_guests || '',
        budget: event.budget || '',
        status: event.status,
        notes: event.notes || '',
        client_id: event.client_id
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: '',
        event_type: '',
        event_date: '',
        location: '',
        expected_guests: '',
        budget: '',
        status: 'planning',
        notes: '',
        client_id: clients.length > 0 ? clients[0].id : ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        expected_guests: formData.expected_guests ? parseInt(formData.expected_guests) : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        event_date: new Date(formData.event_date).toISOString()
      };
      
      if (editingEvent) {
        await eventsAPI.update(editingEvent.id, data);
      } else {
        await eventsAPI.create(data);
      }
      loadData();
      closeModal();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event');
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
    return <div className="empty-state"><h3>Loading events...</h3></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Events</h2>
        <p>Manage your upcoming and past events</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Events</h3>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Add Event
          </button>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <h3>No events yet</h3>
            <p>Add your first event to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td>{event.name}</td>
                    <td>{event.event_type || '-'}</td>
                    <td>{event.event_date ? new Date(event.event_date).toLocaleDateString() : '-'}</td>
                    <td>{event.location}</td>
                    <td>{event.client_name || '-'}</td>
                    <td>
                      <span className={getStatusBadge(event.status)}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal(event)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(event.id)}
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
              <h3>{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Event Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Event Type</label>
                  <select
                    name="event_type"
                    className="form-control"
                    value={formData.event_type}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Conference">Conference</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Product Launch">Product Launch</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Event Date *</label>
                  <input
                    type="date"
                    name="event_date"
                    className="form-control"
                    value={formData.event_date}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expected Guests</label>
                  <input
                    type="number"
                    name="expected_guests"
                    className="form-control"
                    value={formData.expected_guests}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Budget</label>
                  <input
                    type="number"
                    name="budget"
                    className="form-control"
                    value={formData.budget}
                    onChange={handleChange}
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Client *</label>
                  <select
                    name="client_id"
                    className="form-control"
                    value={formData.client_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="planning">Planning</option>
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
                  {editingEvent ? 'Update' : 'Create'} Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
