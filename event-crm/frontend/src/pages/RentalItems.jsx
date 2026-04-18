import React, { useState, useEffect } from 'react';
import { rentalItemsAPI } from '../api';

function RentalItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    quantity_total: '',
    quantity_available: '',
    price_per_day: '',
    is_active: true
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await rentalItemsAPI.getAll();
      setItems(response.data);
    } catch (error) {
      console.error('Error loading rental items:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        description: item.description || '',
        quantity_total: item.quantity_total,
        quantity_available: item.quantity_available,
        price_per_day: item.price_per_day,
        is_active: item.is_active
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        quantity_total: '',
        quantity_available: '',
        price_per_day: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        quantity_total: parseInt(formData.quantity_total),
        quantity_available: formData.quantity_available ? parseInt(formData.quantity_available) : parseInt(formData.quantity_total),
        price_per_day: parseFloat(formData.price_per_day),
        is_active: formData.is_active
      };
      
      if (editingItem) {
        await rentalItemsAPI.update(editingItem.id, data);
      } else {
        await rentalItemsAPI.create(data);
      }
      loadItems();
      closeModal();
    } catch (error) {
      console.error('Error saving rental item:', error);
      alert('Error saving rental item');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await rentalItemsAPI.delete(id);
        loadItems();
      } catch (error) {
        console.error('Error deleting rental item:', error);
        alert('Error deleting rental item');
      }
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  if (loading) {
    return <div className="empty-state"><h3>Loading rental items...</h3></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Rental Items</h2>
        <p>Manage your inventory of screens, sound systems, coffee machines, and more</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Rental Items</h3>
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <h3>No rental items yet</h3>
            <p>Add your first rental item to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Available / Total</th>
                  <th>Price/Day</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.category}</td>
                    <td>{item.description || '-'}</td>
                    <td>
                      <span style={{ color: item.quantity_available === 0 ? '#e74c3c' : '#2ecc71', fontWeight: 'bold' }}>
                        {item.quantity_available} / {item.quantity_total}
                      </span>
                    </td>
                    <td>${item.price_per_day.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${item.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => openModal(item)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item.id)}
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
              <h3>{editingItem ? 'Edit Item' : 'Add New Rental Item'}</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., LED Screen 55 inch, Coffee Machine Pro"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    className="form-control"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Video">Video (Screens, Projectors)</option>
                    <option value="Audio">Audio (Speakers, Microphones)</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Furniture">Furniture (Tables, Chairs)</option>
                    <option value="Appliances">Appliances (Coffee Machines, etc.)</option>
                    <option value="Decor">Decor</option>
                    <option value="Other">Other</option>
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
                    placeholder="Brief description of the item"
                  />
                </div>
                <div className="form-group">
                  <label>Total Quantity *</label>
                  <input
                    type="number"
                    name="quantity_total"
                    className="form-control"
                    value={formData.quantity_total}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Available Quantity</label>
                  <input
                    type="number"
                    name="quantity_available"
                    className="form-control"
                    value={formData.quantity_available}
                    onChange={handleChange}
                    min="0"
                    placeholder="Leave empty to match total quantity"
                  />
                </div>
                <div className="form-group">
                  <label>Price Per Day ($) *</label>
                  <input
                    type="number"
                    name="price_per_day"
                    className="form-control"
                    value={formData.price_per_day}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      style={{ width: 'auto' }}
                    />
                    Active (available for booking)
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Create'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RentalItems;
