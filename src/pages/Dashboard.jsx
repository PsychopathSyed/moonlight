import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  People as CustomersIcon,
  Notifications as NotificationsIcon,
  Warning as LowStockIcon
} from '@mui/icons-material';
import api from '../../api';

const StatCard = ({ title, value, icon, color, onClick }) => (
  <Card
    sx={{
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      '&:hover': onClick ? { boxShadow: 6 } : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 1.5,
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(api.endpoints.dashboard.stats);
      console.log('Dashboard response:', response);

      // Handle both wrapped and flat responses
      if (response.success && response.data) {
        setStats(response.data);
      } else if (response.total_inventory !== undefined) {
        // Backend returns flat response directly
        setStats(response);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError('Failed to connect to server. Please check your connection.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Inventory"
            value={stats?.total_inventory || 0}
            icon={<InventoryIcon />}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Rentals"
            value={stats?.active_rentals || 0}
            icon={<OrdersIcon />}
            color="#2e7d32"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="This Month Revenue"
            value={`PKR ${stats?.this_month_revenue?.toLocaleString() || 0}`}
            icon={<RevenueIcon />}
            color="#ed6c02"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={stats?.total_customers || 0}
            icon={<CustomersIcon />}
            color="#9c27b0"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Orders"
            value={stats?.pending_orders || 0}
            icon={<OrdersIcon />}
            color="#f57c00"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={stats?.pending_returns || 0}
            icon={<LowStockIcon />}
            color="#d32f2f"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Invoices"
            value={stats?.pending_invoices || 0}
            icon={<RevenueIcon />}
            color="#1976d2"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Notifications"
            value={stats?.pending_notifications || 0}
            icon={<NotificationsIcon />}
            color="#e91e63"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rentable Items"
            value={stats?.rentable_items || 0}
            icon={<InventoryIcon />}
            color="#009688"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Consumables"
            value={stats?.consumables || 0}
            icon={<InventoryIcon />}
            color="#673ab7"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tools"
            value={stats?.tools || 0}
            icon={<InventoryIcon />}
            color="#795548"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Returns"
            value={stats?.pending_returns || 0}
            icon={<OrdersIcon />}
            color="#c2185b"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
