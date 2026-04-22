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
} from '@mui/material';
import {
  Add as AddIcon,
  ShoppingBasket as PurchaseIcon,
  Store as VendorIcon,
  Inventory as InventoryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TrendingUp as TrendIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';

export default function Purchase() {
  const { setHeaderActions } = useOutletContext();
  const [openVendor, setOpenVendor] = useState(false);
  const [openItem, setOpenItem] = useState(false);
  const [selectedTab, setSelectedTab] = useState('vendors');
  const [searchTerm, setSearchTerm] = useState('');

  const vendors = [
    { id: 1, name: 'Sound Systems Ltd', phone: '+92-300-1234567', date: '2026-01-15', items: 12, total: 'PKR 450,000' },
    { id: 2, name: 'Lighting Pro', phone: '+92-321-7654321', date: '2026-02-20', items: 8, total: 'PKR 280,000' },
    { id: 3, name: 'DJ Equipment Co', phone: '+92-333-1112233', date: '2026-03-10', items: 15, total: 'PKR 520,000' },
  ];

  const purchases = [
    { id: 1, vendor: 'Sound Systems Ltd', item: 'JBL Speakers 15"', category: 'Speakers', qty: 4, price: 15000, total: 60000, date: '2026-04-15' },
    { id: 2, vendor: 'Lighting Pro', item: 'SMD LED Panel P3', category: 'Lights', qty: 6, price: 25000, total: 150000, date: '2026-04-12' },
    { id: 3, vendor: 'DJ Equipment Co', item: 'Pioneer CDJ 2000', category: 'DJ', qty: 2, price: 45000, total: 90000, date: '2026-04-10' },
    { id: 4, vendor: 'Sound Systems Ltd', item: 'Subwoofer 18"', category: 'Speakers', qty: 2, price: 20000, total: 40000, date: '2026-04-08' },
    { id: 5, vendor: 'Lighting Pro', item: 'Moving Head Beam', category: 'Lights', qty: 4, price: 18000, total: 72000, date: '2026-04-05' },
  ];

  useEffect(() => {
    // Set header actions
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenItem(true)}
            size="small"
          >
            Add Purchase
          </Button>
        </>
      );
    }
  }, [searchTerm, setHeaderActions]);

  const categories = ['Speakers', 'Lights', 'DJ Equipment', 'Screens', 'Cables', 'Microphones', 'Stands', 'Other'];

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalItems = purchases.reduce((sum, p) => sum + p.qty, 0);

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <VendorIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Total Vendors
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {vendors.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <PurchaseIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Total Purchases
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {purchases.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <InventoryIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Items Added
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <MoneyIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Total Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(totalPurchases / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={selectedTab === 'purchases' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab('purchases')}
              sx={{ borderRadius: 8, ...(selectedTab === 'purchases' && { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }) }}
            >
              Purchase History
            </Button>
            <Button
              variant={selectedTab === 'vendors' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab('vendors')}
              sx={{ borderRadius: 8, ...(selectedTab === 'vendors' && { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }) }}
            >
              Vendors
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search purchases..."
              size="small"
              sx={{ minWidth: 300, borderRadius: 8 }}
            />
            <Select size="small" defaultValue="all" sx={{ minWidth: 150, borderRadius: 8 }}>
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </Box>

          {selectedTab === 'purchases' ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id} hover>
                      <TableCell>{purchase.date}</TableCell>
                      <TableCell>{purchase.vendor}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{purchase.item}</TableCell>
                      <TableCell>
                        <Chip label={purchase.category} size="small" sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }} />
                      </TableCell>
                      <TableCell>{purchase.qty}</TableCell>
                      <TableCell>PKR {purchase.price.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>
                        PKR {purchase.total.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <ViewIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Vendor Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Added On</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Items Purchased</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Purchases</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{vendor.name}</TableCell>
                      <TableCell>{vendor.phone}</TableCell>
                      <TableCell>{vendor.date}</TableCell>
                      <TableCell>{vendor.items}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>
                        {vendor.total}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={openVendor} onClose={() => setOpenVendor(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Vendor</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Vendor Name" fullWidth required />
            <TextField label="Phone Number" fullWidth required />
            <TextField label="Address" fullWidth multiline rows={2} />
            <TextField label="Email" fullWidth type="email" />
            <TextField label="Contact Person" fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVendor(false)}>Cancel</Button>
          <Button variant="contained" sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            Add Vendor
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openItem} onClose={() => setOpenItem(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Purchase</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Select label="Select Vendor" fullWidth size="small" defaultValue="" displayEmpty>
                  <MenuItem value="" disabled>Select Vendor</MenuItem>
                  {vendors.map((v) => (
                    <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Purchase Date" fullWidth type="date" size="small" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Item Name" fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <Select label="Category" fullWidth size="small" defaultValue="" displayEmpty>
                  <MenuItem value="" disabled>Select Category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" fullWidth multiline rows={2} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Quantity" fullWidth type="number" required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Purchase Price (PKR)" fullWidth type="number" required />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItem(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<InventoryIcon />}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            Add to Inventory
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
