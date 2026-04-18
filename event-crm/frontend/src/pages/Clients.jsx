import React, { useState, useEffect } from 'react';
import { clientsAPI } from '../api';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company || '',
        address: client.address || ''
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientsAPI.update(editingClient.id, formData);
      } else {
        await clientsAPI.create(formData);
      }
      loadClients();
      closeModal();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error saving client');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await clientsAPI.delete(id);
        loadClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="empty-state"><h3>Loading clients...</h3></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Clients</h2>
        <p>Manage your client relationships</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Clients</h3>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Add Client
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="empty-state">
            <h3>No clients yet</h3>
            <p>Add your first client to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Company</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.company || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal(client)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(client.id)}
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
              <h3>{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name *</label>
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
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    name="company"
                    className="form-control"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    className="form-control"
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Update' : 'Create'} Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;
