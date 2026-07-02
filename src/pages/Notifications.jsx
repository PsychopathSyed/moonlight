import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  TextField,
  Paper,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as BellIcon,
  Event as EventIcon,
  LocalShipping as DispatchIcon,
  AssignmentReturn as ReturnIcon,
  AttachMoney as PaymentIcon,
  TrendingUp as TrendIcon,
  Warning as AlertIcon,
  MarkEmailRead as MarkAllIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

export default function Notifications() {
  const { setHeaderActions } = useOutletContext();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    const response = await api.get('/api/notifications');
    const data = response.data || {};
    setNotifications(data.notifications || []);
    setUpcomingEvents(data.upcoming_events || []);
    setPendingPayments(data.pending_payments || []);
    setLowStockAlerts(data.low_stock || []);
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    loadNotifications()
      .catch(() => setError('Failed to load notifications. Please check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    } catch {
      setError('Failed to mark notifications as read.');
    }
  };

  useEffect(() => {
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedFilter}
              label="Type"
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="dispatch">Dispatch</MenuItem>
              <MenuItem value="return">Returns</MenuItem>
              <MenuItem value="payment">Payments</MenuItem>
              <MenuItem value="alert">Alerts</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<MarkAllIcon />}
            size="small"
            onClick={handleMarkAllRead}
          >
            Mark All Read
          </Button>
        </>
      );
    }
    return () => setHeaderActions && setHeaderActions(null);
  }, [searchTerm, selectedFilter, setHeaderActions]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'dispatch': return <DispatchIcon />;
      case 'return': return <ReturnIcon />;
      case 'payment': return <PaymentIcon />;
      case 'alert': return <AlertIcon />;
      case 'trend': return <TrendIcon />;
      default: return <BellIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'dispatch': return { bg: '#6366f120', color: '#6366f1' };
      case 'return': return { bg: '#f59e0b20', color: '#f59e0b' };
      case 'payment': return { bg: '#10b98120', color: '#10b981' };
      case 'alert': return { bg: '#ef444420', color: '#ef4444' };
      case 'trend': return { bg: '#8b5cf620', color: '#8b5cf6' };
      default: return { bg: '#e0e7ff', color: '#4338ca' };
    }
  };

  const visibleNotifications = notifications.filter((n) => {
    if (selectedFilter !== 'all' && n.type !== selectedFilter) return false;
    if (searchTerm && !(n.title + ' ' + n.message).toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            Notifications
            <Badge badgeContent={unreadCount} color="error" sx={{ ml: 2 }}>
              <BellIcon />
            </Badge>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Dispatch reminders, return alerts, and notifications
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => loadNotifications().catch(() => setError('Failed to refresh.'))}
            sx={{ borderRadius: 8 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<MarkAllIcon />}
            onClick={handleMarkAllRead}
            sx={{ borderRadius: 8 }}
          >
            Mark All Read
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Upcoming Dispatch', value: upcomingEvents.length, icon: <DispatchIcon />, bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
          { label: 'Returns Due', value: notifications.filter(n => n.type === 'return').length, icon: <ReturnIcon />, bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
          { label: 'Payment Overdue', value: pendingPayments.filter(p => p.status === 'overdue').length, icon: <PaymentIcon />, bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
          { label: 'Low Stock Alerts', value: lowStockAlerts.length, icon: <AlertIcon />, bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ background: stat.bg }}>
              <CardContent>
                <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                  {stat.icon}
                </Avatar>
                <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Notifications
                </Typography>
                <Select size="small" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} sx={{ minWidth: 150 }}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="dispatch">Dispatch</MenuItem>
                  <MenuItem value="return">Returns</MenuItem>
                  <MenuItem value="payment">Payments</MenuItem>
                  <MenuItem value="alert">Alerts</MenuItem>
                </Select>
              </Box>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
              <List>
                {visibleNotifications.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                    No notifications — you're all caught up
                  </Typography>
                )}
                {visibleNotifications.map((notification, index) => {
                  const colors = getNotificationColor(notification.type);
                  return (
                    <React.Fragment key={notification.id}>
                      <ListItem
                        sx={{
                          bgcolor: notification.status === 'unread' ? '#f8fafc' : 'transparent',
                          borderRadius: 2,
                          mb: 1,
                        }}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ ...colors, width: 40, height: 40 }}>
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight={600}>
                                {notification.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {notification.status === 'unread' && (
                                  <Chip label="New" size="small" sx={{ bgcolor: '#6366f1', color: '#ffffff', fontWeight: 600 }} />
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {notification.date}
                                </Typography>
                              </Box>
                            </Box>
                          }
                          secondary={notification.message}
                        />
                      </ListItem>
                      {index < visibleNotifications.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Upcoming Events
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {upcomingEvents.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No upcoming events</Typography>
                )}
                {upcomingEvents.map((event) => (
                  <Paper key={event.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{event.order}</Typography>
                      <EventIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                    </Box>
                    <Typography variant="body1">{event.customer}</Typography>
                    <Typography variant="caption" color="text.secondary">{event.event}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Dispatch</Typography>
                        <Typography variant="body2" fontWeight={600} color="#6366f1">{event.dispatchDate}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Return</Typography>
                        <Typography variant="body2" fontWeight={600} color="#f59e0b">{event.returnDate}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Pending Payments
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {pendingPayments.length === 0 && (
                  <Typography variant="body2" color="text.secondary">No pending payments</Typography>
                )}
                {pendingPayments.map((payment) => (
                  <Paper key={payment.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{payment.invoice}</Typography>
                      <Chip
                        label={payment.status}
                        size="small"
                        sx={{
                          bgcolor: payment.status === 'overdue' ? '#fee2e2' : payment.status === 'due' ? '#fef3c7' : '#e0e7ff',
                          color: payment.status === 'overdue' ? '#991b1b' : payment.status === 'due' ? '#92400e' : '#4338ca',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Typography variant="body1">{payment.customer}</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Due: {payment.dueDate || '-'}</Typography>
                        {payment.daysOverdue > 0 && (
                          <Typography variant="caption" display="block" color="#ef4444">
                            {payment.daysOverdue} days overdue
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={700} color="#ef4444">
                        PKR {payment.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
