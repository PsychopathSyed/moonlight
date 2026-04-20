import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Switch,
  FormControlLabel,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';

export default function Settings() {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@haditex.net',
    phone: '+92 300 1234567',
    company: 'Event Rentals',
    address: '123 Main Street, Lahore',
    avatar: null,
  });

  const [businessSettings, setBusinessSettings] = useState({
    name: 'Event Rentals',
    email: 'info@haditex.net',
    phone: '+92 300 1234567',
    address: '123 Main Street, Lahore, Pakistan',
    taxId: '0000000-0',
    currency: 'PKR',
    rentalTerms: 'Payment due within 7 days of invoice',
  });

  const handleSaveProfile = () => {
    console.log('Saving profile:', profile);
  };

  const handleSaveBusiness = () => {
    console.log('Saving business settings:', businessSettings);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b', mb: 4 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#6366f1',
                    fontSize: '2rem',
                  }}
                >
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Box>
                  <IconButton size="small" sx={{ bgcolor: '#6366f115' }}>
                    <CameraIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Profile Settings
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    variant="outlined"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Company / Role"
                    variant="outlined"
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><BusinessIcon /></InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    variant="outlined"
                    multiline
                    rows={2}
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LocationIcon /></InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
                sx={{
                  mt: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  },
                }}
              >
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Business Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Business Settings
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Name"
                    variant="outlined"
                    value={businessSettings.name}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Business Email"
                    variant="outlined"
                    value={businessSettings.email}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    variant="outlined"
                    value={businessSettings.phone}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Currency"
                    variant="outlined"
                    value={businessSettings.currency}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, currency: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    variant="outlined"
                    multiline
                    rows={2}
                    value={businessSettings.address}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="NTN / Tax ID"
                    variant="outlined"
                    value={businessSettings.taxId}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, taxId: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Default Rental Terms"
                    variant="outlined"
                    multiline
                    rows={2}
                    value={businessSettings.rentalTerms}
                    onChange={(e) => setBusinessSettings({ ...businessSettings, rentalTerms: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveBusiness}
                sx={{
                  mt: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  },
                }}
              >
                Save Business Settings
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}>
                  <NotificationsIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notifications
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Low stock alerts', checked: true },
                  { label: 'New quotation requests', checked: true },
                  { label: 'Payment reminders', checked: true },
                  { label: 'Rental due dates', checked: true },
                  { label: 'Email notifications', checked: true },
                  { label: 'SMS notifications', checked: false },
                ].map((item) => (
                  <Paper key={item.label} sx={{ p: 1.5, bgcolor: '#f8fafc' }}>
                    <FormControlLabel
                      control={<Switch checked={item.checked} />}
                      label={item.label}
                    />
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#ef4444', width: 48, height: 48 }}>
                  <SecurityIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Change Password
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Current Password"
                        type="password"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="New Password"
                        type="password"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Update Password
                  </Button>
                </Box>

                <Divider />

                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Two-Factor Authentication
                  </Typography>
                  <FormControlLabel
                    control={<Switch checked={false} />}
                    label="Enable 2FA via SMS"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Add an extra layer of security to your account
                  </Typography>
                </Box>

                <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Data Export
                  </Typography>
                  <Button variant="outlined" size="small" fullWidth startIcon={<SaveIcon />}>
                    Export All Data
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    Export your business data (customers, rentals, invoices)
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
