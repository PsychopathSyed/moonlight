import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';

function Dashboard() {
  const [stats, setStats] = useState({
    total_clients: 0,
    total_events: 0,
    upcoming_events: 0,
    total_rental_items: 0,
    active_bookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="empty-state"><h3>Loading dashboard...</h3></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your event management business</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <h4>Total Clients</h4>
          <div className="stat-number">{stats.total_clients}</div>
        </div>
        <div className="stat-card green">
          <h4>Total Events</h4>
          <div className="stat-number">{stats.total_events}</div>
        </div>
        <div className="stat-card orange">
          <h4>Upcoming Events</h4>
          <div className="stat-number">{stats.upcoming_events}</div>
        </div>
        <div className="stat-card purple">
          <h4>Rental Items</h4>
          <div className="stat-number">{stats.total_rental_items}</div>
        </div>
        <div className="stat-card red">
          <h4>Active Bookings</h4>
          <div className="stat-number">{stats.active_bookings}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Welcome to Event CRM</h3>
        </div>
        <div style={{ color: '#7f8c8d', lineHeight: '1.6' }}>
          <p>This system helps you manage:</p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>👥 Client relationships and contact information</li>
            <li>📅 Event planning and coordination</li>
            <li>🎬 Rental inventory (screens, sound systems, coffee machines, etc.)</li>
            <li>📋 Equipment bookings and availability</li>
            <li>⚙️ Event services and staffing</li>
          </ul>
          <p style={{ marginTop: '15px' }}>Use the navigation menu on the left to access different sections of the CRM.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
