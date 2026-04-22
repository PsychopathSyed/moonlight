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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Notifications as BellIcon,
  Event as EventIcon,
  LocalShipping as DispatchIcon,
  AssignmentReturn as ReturnIcon,
  AttachMoney as PaymentIcon,
  TrendingUp as TrendIcon,
  Warning as AlertIcon,
  Check as ReadIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkAllIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';

export default function Notifications() {
  const { setHeaderActions } = useOutletContext();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [openSettings, setOpenSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const notifications = [
    { id: 1, type: 'dispatch', title: 'Dispatch Reminder', message: 'ORD-001: Ali Corporation items to dispatch today', date: '2026-04-20 09:00', order: 'ORD-001', status: 'unread' },
    { id: 2, type: 'return', title: 'Return Due', message: 'ORD-002: Tech Events Ltd items due for return', date: '2026-04-20 18:00', order: 'ORD-002', status: 'unread' },
    { id: 3, type: 'payment', title: 'Payment Reminder', message: 'INV-003: Wedding Planners payment overdue', date: '2026-04-19 10:00', invoice: 'INV-003', amount: 75000, status: 'unread' },
    { id: 4, type: 'dispatch', title: 'Dispatch Reminder', message: 'ORD-004: Party Makers items dispatch tomorrow', date: '2026-04-21 09:00', order: 'ORD-004', status: 'unread' },
    { id: 5, type: 'alert', title: 'Low Stock Alert', message: 'Solder Wire: Only 8 rolls remaining (min: 10)', date: '2026-04-18 14:00', item: 'Solder Wire', status: 'read' },
    { id: 6, type: 'return', title: 'Return Due', message: 'ORD-003: Wedding Planners items returned successfully', date: '2026-04-15 16:00', order: 'ORD-003', status: 'read' },
    { id: 7, type: 'payment', title: 'Payment Received', message: 'INV-001: Ali Corporation paid PKR 20,000', date: '2026-04-18 11:00', invoice: 'INV-001', amount: 20000, status: 'read' },
    { id: 8, type: 'trend', title: 'Revenue Alert', message: 'Monthly revenue exceeded target by 15%', date: '2026-04-17 08:00', status: 'read' },
  ];

  const upcomingEvents = [
    { id: 1, order: 'ORD-001', customer: 'Ali Corporation', event: 'Corporate Event', dispatchDate: '2026-04-20', returnDate: '2026-04-22', status: 'upcoming' },
    { id: 2, order: 'ORD-004', customer: 'Party Makers', event: 'Conference', dispatchDate: '2026-04-21', returnDate: '2026-04-23', status: 'upcoming' },
    { id: 3, order: 'ORD-005', customer: 'Event Pro', event: 'Wedding Reception', dispatchDate: '2026-04-25', returnDate: '2026-04-27', status: 'upcoming' },
  ];

  const pendingPayments = [
    { id: 1, invoice: 'INV-003', customer: 'Wedding Planners', amount: 75000, dueDate: '2026-04-15', daysOverdue: 5, status: 'overdue' },
    { id: 2, invoice: 'INV-004', customer: 'Party Makers', amount: 95000, dueDate: '2026-04-20', daysOverdue: 0, status: 'due' },
    { id: 3, invoice: 'INV-005', customer: 'Event Pro', amount: 45000, dueDate: '2026-04-22', daysOverdue: 0, status: 'upcoming' },
  ];

  const lowStockAlerts = [
    { id: 1, item: 'Solder Wire', category: 'Consumable', current: 8, minimum: 10, unit: 'rolls', percentage: 80 },
    { id: 2, item: 'Moving Head Beam', category: 'Lights', current: 2, minimum: 4, unit: 'pcs', percentage: 50 },
    { id: 3, item: 'XLR Connectors', category: 'Tool', current: 8, minimum: 15, unit: 'pcs', percentage: 53 },
  ];

  useEffect(() => {
    // Set header actions
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
          >
            Mark All Read
          </Button>
        </>
      );
    }
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
            startIcon={<MarkAllIcon />}
            sx={{ borderRadius: 8 }}
          >
            Mark All Read
          </Button>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setOpenSettings(true)}
            sx={{ borderRadius: 8 }}
          >
            Settings
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <DispatchIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Upcoming Dispatch
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {upcomingEvents.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <ReturnIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Returns Due
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {notifications.filter(n => n.type === 'return' && n.status === 'unread').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <PaymentIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Payment Overdue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {pendingPayments.filter(p => p.status === 'overdue').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <AlertIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Low Stock Alerts
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {lowStockAlerts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Notifications
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Select size="small" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} sx={{ minWidth: 150 }}>
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="dispatch">Dispatch</MenuItem>
                    <MenuItem value="return">Returns</MenuItem>
                    <MenuItem value="payment">Payments</MenuItem>
                    <MenuItem value="alert">Alerts</MenuItem>
                  </Select>
                  <TextField
                    placeholder="Search..."
                    size="small"
                    sx={{ minWidth: 200 }}
                  />
                </Box>
              </Box>
              <List>
                {notifications
                  .filter(n => selectedFilter === 'all' || n.type === selectedFilter)
                  .map((notification, index) => {
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
                          <IconButton size="small" color="primary">
                            <ReadIcon />
                          </IconButton>
                        </ListItem>
                        {index < notifications.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
              </List>
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
                        <Typography variant="caption" color="text.secondary">Due: {payment.dueDate}</Typography>
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

      <Dialog open={openSettings} onClose={() => setOpenSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure when and how you receive notifications
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Notification Types</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Dispatch Reminders</Typography>
                <Chip label="Enabled" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Return Alerts</Typography>
                <Chip label="Enabled" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Payment Reminders</Typography>
                <Chip label="Enabled" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Low Stock Alerts</Typography>
                <Chip label="Enabled" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600 }} />
              </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>Timing</Typography>
            <Select size="small" fullWidth defaultValue="1day">
              <MenuItem value="1day">1 day before</MenuItem>
              <MenuItem value="2days">2 days before</MenuItem>
              <MenuItem value="3days">3 days before</MenuItem>
              <MenuItem value="1week">1 week before</MenuItem>
            </Select>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2 }}>Channels</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Dashboard Alerts</Typography>
                <Chip label="Enabled" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Email Notifications</Typography>
                <Chip label="Disabled" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>SMS Alerts</Typography>
                <Chip label="Disabled" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettings(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
