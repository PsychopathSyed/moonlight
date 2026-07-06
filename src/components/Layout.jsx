import React, { useState, useEffect } from 'react';
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
  Avatar,
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
  Login as GatePassInIcon,
  Logout as GatePassOutIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 260;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [headerActions, setHeaderActions] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const user = localStorage.getItem('user');
    if (user !== null && user !== undefined) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.username || 'User');
      } catch (e) {
        setUserName('User');
      }
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    const menuItems = [
      { text: 'Dashboard', path: '/dashboard' },
      { text: 'Inventory', path: '/inventory' },
      { text: 'Rentals', path: '/rentals' },
      { text: 'Customers', path: '/customers' },
      { text: 'Quotations', path: '/quotations' },
      { text: 'Invoices', path: '/invoices' },
      { text: 'Purchase', path: '/purchase' },
      { text: 'Partners', path: '/partners' },
      { text: 'Returns', path: '/returns' },
      { text: 'Gate Pass In', path: '/gatepass-in' },
      { text: 'Gate Pass Out', path: '/gatepass-out' },
      { text: 'Ledger', path: '/ledger' },
      { text: 'Expenses', path: '/expenses' },
      { text: 'HR & Salary', path: '/hr' },
      { text: 'Notifications', path: '/notifications' },
      { text: 'Reports', path: '/reports' },
      { text: 'Settings', path: '/settings' },
    ];
    const currentPage = menuItems.find(item => item.path === path);
    return currentPage ? currentPage.text : 'Dashboard';
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
    { text: 'Gate Pass In', icon: <GatePassInIcon />, path: '/gatepass-in', badge: null },
    { text: 'Gate Pass Out', icon: <GatePassOutIcon />, path: '/gatepass-out', badge: null },
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
        background: '#6366f1',
        py: 2,
        minHeight: 64,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 36,
            height: 36,
            bgcolor: 'white',
            color: '#6366f1',
            fontWeight: 600,
            fontSize: 14
          }}>
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{
              fontWeight: 600,
              color: '#fff',
              fontSize: '1.1rem',
              lineHeight: 1.2
            }} noWrap>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.75rem'
            }}>
              Welcome back!
            </Typography>
          </Box>
        </Box>
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
          background: '#ffffff',
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
            {getPageTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {headerActions && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {headerActions}
              </Box>
            )}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
              <Tooltip title="Logout">
                <IconButton onClick={handleLogout} size="small">
                  <LogoutIcon sx={{ fontSize: 20, color: '#64748b' }} />
                </IconButton>
              </Tooltip>
            </Box>
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
        <Outlet context={{ setHeaderActions }} />
      </Box>
    </Box>
  );
}
