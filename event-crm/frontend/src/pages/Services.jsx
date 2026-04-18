import React, { useState, useEffect } from 'react';
import { servicesAPI, eventsAPI } from '../api';

function Services() {
  const [services, setServices] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    event_id: '',
    service_name: '',
    service_type: '',
    description: '',
    price: '',
    status: 'pending',
    assigned_to: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, eventsRes] = await Promise.all([
        servicesAPI.getAll(),
        eventsAPI.getAll()
      ]);
      setServices(servicesRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        event_id: service.event_id,
        service_name: service.service_name,
        service_type: service.service_type || '',
        description: service.description || '',
        price: service.price || '',
        status: service.status,
        assigned_to: service.assigned_to || ''
      });
    } else {
      setEditingService(null);
      setFormData({
        event_id: events.length > 0 ? events[0].id : '',
        service_name: '',
        service_type: '',
        description: '',
        price: '',
        status: 'pending',
        assigned_to: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null
      };
      
      if (editingService) {
        await servicesAPI.update(editingService.id, data);
      } else {
        await servicesAPI.create(data);
      }
      loadData();
      closeModal();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Error saving service');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await servicesAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Error deleting service');
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
    return <div className="empty-state"><h3>Loading services...</h3></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Services</h2>
        <p>Manage event management services like planning, setup, catering, etc.</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Services</h3>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Add Service
          </button>
        </div>

        {services.length === 0 ? (
          <div className="empty-state">
            <h3>No services yet</h3>
            <p>Add your first service to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Type</th>
                  <th>Event</th>
                  <th>Assigned To</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service.id}>
                    <td><strong>{service.service_name}</strong></td>
                    <td>{service.service_type || '-'}</td>
                    <td>{service.event_name || '-'}</td>
                    <td>{service.assigned_to || '-'}</td>
                    <td>{service.price ? `$${service.price.toFixed(2)}` : '-'}</td>
                    <td>
                      <span className={getStatusBadge(service.status)}>
                        {service.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal(service)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(service.id)}
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
              <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    name="service_name"
                    className="form-control"
                    value={formData.service_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Event Planning, Sound Setup, Coffee Service"
                  />
                </div>
                <div className="form-group">
                  <label>Service Type</label>
                  <select
                    name="service_type"
                    className="form-control"
                    value={formData.service_type}
                    onChange={handleChange}
                  >
                    <option value="">Select Type</option>
                    <option value="Planning">Event Planning</option>
                    <option value="Setup">Setup/Installation</option>
                    <option value="Cleanup">Cleanup</option>
                    <option value="Catering">Catering</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Staffing">Staffing</option>
                    <option value="Coordination">Day-of Coordination</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
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
                  <label>Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the service details"
                  />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="Service cost"
                  />
                </div>
                <div className="form-group">
                  <label>Assigned To</label>
                  <input
                    type="text"
                    name="assigned_to"
                    className="form-control"
                    value={formData.assigned_to}
                    onChange={handleChange}
                    placeholder="Staff member responsible"
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
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? 'Update' : 'Create'} Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;
