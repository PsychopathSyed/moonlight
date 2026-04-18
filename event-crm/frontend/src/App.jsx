import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Events from './pages/Events';
import RentalItems from './pages/RentalItems';
import Bookings from './pages/Bookings';
import Services from './pages/Services';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <Clients />;
      case 'events':
        return <Events />;
      case 'rental-items':
        return <RentalItems />;
      case 'bookings':
        return <Bookings />;
      case 'services':
        return <Services />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>🎉 Event CRM</h1>
          <p>Event Management System</p>
        </div>
        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <a 
                className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                📊 <span>Dashboard</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentPage === 'clients' ? 'active' : ''}`}
                onClick={() => setCurrentPage('clients')}
              >
                👥 <span>Clients</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentPage === 'events' ? 'active' : ''}`}
                onClick={() => setCurrentPage('events')}
              >
                📅 <span>Events</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentPage === 'rental-items' ? 'active' : ''}`}
                onClick={() => setCurrentPage('rental-items')}
              >
                🎬 <span>Rental Items</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentPage === 'bookings' ? 'active' : ''}`}
                onClick={() => setCurrentPage('bookings')}
              >
                📋 <span>Bookings</span>
              </a>
            </li>
            <li className="nav-item">
              <a 
                className={`nav-link ${currentPage === 'services' ? 'active' : ''}`}
                onClick={() => setCurrentPage('services')}
              >
                ⚙️ <span>Services</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
