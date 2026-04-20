import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Event as RentalsIcon,
  People as CustomersIcon,
  Receipt as QuotationsIcon,
  AttachMoney as InvoicesIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  ShoppingBasket as PurchaseIcon,
  Business as PartnersIcon,
  AssignmentReturn as ReturnsIcon,
  AccountBalance as LedgerIcon,
  Description as ExpensesIcon,
  Work as HRIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 260;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', badge: null },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory', badge: null },
    { text: 'Rentals', icon: <RentalsIcon />, path: '/rentals', badge: '23' },
    { text: 'Customers', icon: <CustomersIcon />, path: '/customers', badge: null },
    { text: 'Quotations', icon: <QuotationsIcon />, path: '/quotations', badge: '8' },
    { text: 'Invoices', icon: <InvoicesIcon />, path: '/invoices', badge: '12' },
    { text: 'Purchase', icon: <PurchaseIcon />, path: '/purchase', badge: null },
    { text: 'Partners', icon: <PartnersIcon />, path: '/partners', badge: '3' },
    { text: 'Returns', icon: <ReturnsIcon />, path: '/returns', badge: '2' },
    { text: 'Ledger', icon: <LedgerIcon />, path: '/ledger', badge: '5' },
    { text: 'Expenses', icon: <ExpensesIcon />, path: '/expenses', badge: null },
    { text: 'HR & Salary', icon: <HRIcon />, path: '/hr', badge: null },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', badge: '4' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/reports', badge: null },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings', badge: null },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        py: 2,
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }} noWrap component="div">
          Event ERP
        </Typography>
      </Toolbar>
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#6366f1' : '#64748b' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: location.pathname === item.path ? '#6366f1' : '#475569',
                  '& .MuiTypography-root': { fontWeight: 500 },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: '#ef4444' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{ color: '#991b1b', '& .MuiTypography-root': { fontWeight: 500 } }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon sx={{ color: '#6366f1' }} />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: '#1e293b', fontWeight: 600 }}>
            Event Management ERP
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Admin
            </Typography>
            <Tooltip title="Logout">
              <IconButton onClick={handleLogout} size="small">
                <LogoutIcon sx={{ fontSize: 20, color: '#64748b' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid #e2e8f0',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid #e2e8f0',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          bgcolor: '#f8fafc',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
