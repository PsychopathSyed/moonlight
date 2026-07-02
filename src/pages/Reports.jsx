import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  CalendarToday as CalendarIcon,
  Description as DocIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  ArrowDownward as DownIcon,
} from '@mui/icons-material';
import api from '../../api';

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    setError('');
    const response = await api.get('/api/reports/summary');
    if (response.success) {
      setSummary(response.data);
    } else {
      setError(response.detail || 'Failed to load report data');
    }
  };

  useEffect(() => {
    setLoading(true);
    loadSummary()
      .catch(() => setError('Failed to load reports. Please check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  const revenueData = summary?.monthly_revenue || [];
  const orderStats = summary?.order_stats || {};
  const topRentals = summary?.top_rentals || [];
  const inventory = summary?.inventory || {};
  const totalRevenue6m = summary?.total_revenue_6m || 0;
  const avgMonthly = revenueData.length ? totalRevenue6m / revenueData.length : 0;

  const rentalStats = [
    { label: 'Completed', count: orderStats.completed || 0, icon: <CalendarIcon />, color: '#10b981' },
    { label: 'Active', count: orderStats.active || 0, icon: <TrendIcon />, color: '#6366f1' },
    { label: 'Pending', count: orderStats.pending || 0, icon: <DocIcon />, color: '#f59e0b' },
    { label: 'Overdue', count: orderStats.overdue || 0, icon: <DownIcon />, color: '#ef4444' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'dispatched':
      case 'confirmed':
        return { bg: '#dcfce7', text: '#166534' };
      case 'pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'overdue': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const handleExport = () => {
    const header = 'Month,Revenue,Rentals\n';
    const body = revenueData.map((r) => `${r.month},${r.amount},${r.rentals}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'revenue-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revenue trends, rental statistics, and business insights
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} sx={{ borderRadius: 8 }}
            onClick={() => loadSummary().catch(() => setError('Failed to refresh.'))}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} sx={{ borderRadius: 8 }}
            onClick={() => window.print()}>
            Print
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            Export
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#6366f1', width: 36, height: 36 }}>
                    <TrendIcon sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    Revenue Trend (last 6 months)
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => loadSummary().catch(() => setError('Failed to refresh.'))}>
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Grid container spacing={1}>
                  {revenueData.map((data) => (
                    <Grid item xs={12} sm={6} md={4} key={data.month}>
                      <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          {data.month}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: '#6366f1' }}>
                          PKR {data.amount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="#10b981">
                          {data.rentals} rentals
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Grid container spacing={2} sx={{ mt: 3 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total Revenue (6 months)
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      PKR {totalRevenue6m.toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8 }}>
                    <Typography variant="caption" color="text.secondary">
                      Average Monthly
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981' }}>
                      PKR {Math.round(avgMonthly).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Rental Overview
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {rentalStats.map((stat) => (
                  <Paper
                    key={stat.label}
                    sx={{
                      p: 2,
                      bgcolor: '#f8fafc',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 40, height: 40 }}>
                        {stat.icon}
                      </Avatar>
                      <Typography variant="body1" fontWeight={500}>
                        {stat.label}
                      </Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {stat.count}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Top Rentals This Month
              </Typography>
              <Box>
                {topRentals.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No rentals recorded this month
                  </Typography>
                )}
                {topRentals.map((rental) => (
                  <Box
                    key={rental.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1.5,
                      px: 2,
                      mb: 1,
                      bgcolor: '#f8fafc',
                      borderRadius: 8,
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={600} gutterBottom>
                        {rental.customer}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rental.date}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={rental.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(rental.status).bg,
                          color: getStatusColor(rental.status).text,
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          mb: 0.5,
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                        PKR {rental.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#10b98120', width: 40, height: 40 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    This Month Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                    PKR {(summary?.month_revenue || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#6366f120', width: 40, height: 40 }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Inventory Utilization
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1' }}>
                    {inventory.utilization || 0}%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(inventory.utilization || 0, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#e2e8f0',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {inventory.rented_quantity || 0} of {inventory.total_quantity || 0} items currently out
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#f59e0b20', width: 40, height: 40 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    New Customers This Month
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                    {summary?.new_customers || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
