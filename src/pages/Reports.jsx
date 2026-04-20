import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  LinearProgress,
  Button,
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
  Search as SearchIcon,
  ArrowDownward as DownIcon,
} from '@mui/icons-material';

export default function Reports() {
  const [revenuePeriod, setRevenuePeriod] = useState('PKR');

  const revenueData = [
    { month: 'Jan', amount: 45000, rentals: 12 },
    { month: 'Feb', amount: 52000, rentals: 15 },
    { month: 'Mar', amount: 48000, rentals: 13 },
    { month: 'Apr', amount: 65000, rentals: 18 },
    { month: 'May', amount: 72000, rentals: 22 },
    { month: 'Jun', amount: 68000, rentals: 20 },
  ];

  const topRentals = [
    { id: 1, customer: 'Ali Corporation', amount: 'PKR 35,000', date: '2026-04-20', status: 'active' },
    { id: 2, customer: 'Tech Events Ltd', amount: 'PKR 28,000', date: '2026-04-18', status: 'active' },
    { id: 3, customer: 'Wedding Planners', amount: 'PKR 22,000', date: '2026-04-25', status: 'pending' },
  ];

  const rentalStats = [
    { label: 'Completed', count: 45, icon: <CalendarIcon />, color: '#10b981' },
    { label: 'Active', count: 23, icon: <TrendIcon />, color: '#6366f1' },
    { label: 'Pending', count: 8, icon: <DocIcon />, color: '#f59e0b' },
    { label: 'Overdue', count: 3, icon: <DownIcon />, color: '#ef4444' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'overdue': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

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
          <Button variant="outlined" startIcon={<RefreshIcon />} sx={{ borderRadius: 8 }}>
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<PrintIcon />} sx={{ borderRadius: 8 }}>
            Print
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            Export
          </Button>
        </Box>
      </Box>

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
                    Revenue Trend
                  </Typography>
                </Box>
                <IconButton size="small">
                  <RefreshIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>

              <Paper sx={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                {['PKR', 'PKR 1', 'USD', 'EUR'].map((period) => (
                  <Box
                    key={period}
                    onClick={() => setRevenuePeriod(period)}
                    sx={{
                      px: 2,
                      py: 1,
                      cursor: 'pointer',
                      bgcolor: revenuePeriod === period ? '#1e293b' : 'transparent',
                      color: revenuePeriod === period ? '#ffffff' : '#64748b',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                    }}
                  >
                    {period}
                  </Box>
                ))}
              </Paper>

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
                      PKR 350,000
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8 }}>
                    <Typography variant="caption" color="text.secondary">
                      Average Monthly
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981' }}>
                      PKR 58,333
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top Rentals This Month
                </Typography>
                <IconButton size="small">
                  <SearchIcon />
                </IconButton>
              </Box>
              <Box>
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
                        {rental.amount}
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
                    PKR 65,000
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={85}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#e2e8f0',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                85% of target (PKR 75,000)
              </Typography>
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
                    78%
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={78}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#e2e8f0',
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                122 of 156 items currently rented
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
                    New Customers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                    12
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                +15% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
