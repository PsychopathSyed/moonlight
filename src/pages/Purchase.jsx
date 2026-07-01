import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  TextField,
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
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

const emptyVendorForm = { name: '', phone: '', address: '', email: '', contact_person: '' };
const emptyPurchaseForm = {
  vendor_id: '', item_id: '', item_name: '', purchase_date: '',
  description: '', quantity: '', purchase_price: ''
};

export default function Purchase() {
  const { setHeaderActions } = useOutletContext();
  const [openVendor, setOpenVendor] = useState(false);
  const [openItem, setOpenItem] = useState(false);
  const [selectedTab, setSelectedTab] = useState('vendors');
  const [searchTerm, setSearchTerm] = useState('');

  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [vendorForm, setVendorForm] = useState(emptyVendorForm);
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchaseForm);
  const [error, setError] = useState('');

  const loadVendors = async () => {
    const response = await api.get(api.endpoints.purchase.vendors);
    setVendors(response.data?.vendors || []);
  };

  const loadPurchases = async () => {
    const response = await api.get(api.endpoints.purchase.purchases);
    setPurchases(response.data?.purchases || []);
  };

  const loadItems = async () => {
    const response = await api.get(api.endpoints.inventory.list, { page_size: 100 });
    setItems(response.data?.items || []);
  };

  useEffect(() => {
    loadVendors().catch((e) => setError(e.message));
    loadPurchases().catch((e) => setError(e.message));
    loadItems().catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
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

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total_price, 0);
  const totalItems = purchases.reduce((sum, p) => sum + p.quantity, 0);

  const purchasesByVendor = (vendorId) => purchases.filter((p) => p.vendor_id === vendorId);

  const filteredPurchases = purchases.filter((p) =>
    !searchTerm || (p.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.vendor_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredVendors = vendors.filter((v) =>
    !searchTerm || v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddVendor = async () => {
    try {
      await api.post(api.endpoints.purchase.vendors, vendorForm);
      setVendorForm(emptyVendorForm);
      setOpenVendor(false);
      await loadVendors();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    try {
      await api.delete(api.endpoints.purchase.vendor(vendorId));
      await loadVendors();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddPurchase = async () => {
    try {
      await api.post(api.endpoints.purchase.purchases, {
        ...purchaseForm,
        item_id: purchaseForm.item_id || null,
        quantity: Number(purchaseForm.quantity),
        purchase_price: Number(purchaseForm.purchase_price),
        purchase_date: purchaseForm.purchase_date || undefined
      });
      setPurchaseForm(emptyPurchaseForm);
      setOpenItem(false);
      await Promise.all([loadPurchases(), loadItems()]);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeletePurchase = async (purchaseId) => {
    try {
      await api.delete(api.endpoints.purchase.purchase(purchaseId));
      await loadPurchases();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

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
                <PurchaseIcon />
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

          {selectedTab === 'purchases' ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id} hover>
                      <TableCell>{purchase.purchase_date}</TableCell>
                      <TableCell>{purchase.vendor_name || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{purchase.item_name}</TableCell>
                      <TableCell>{purchase.quantity}</TableCell>
                      <TableCell>PKR {purchase.purchase_price.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>
                        PKR {purchase.total_price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => handleDeletePurchase(purchase.id)}>
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
                    <TableCell sx={{ fontWeight: 600 }}>Items Purchased</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Purchases</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredVendors.map((vendor) => {
                    const vendorPurchases = purchasesByVendor(vendor.id);
                    const vendorTotal = vendorPurchases.reduce((sum, p) => sum + p.total_price, 0);
                    return (
                      <TableRow key={vendor.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{vendor.name}</TableCell>
                        <TableCell>{vendor.phone}</TableCell>
                        <TableCell>{vendorPurchases.length}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>
                          PKR {vendorTotal.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => handleDeleteVendor(vendor.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
            <TextField label="Vendor Name" fullWidth required
              value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} />
            <TextField label="Phone Number" fullWidth required
              value={vendorForm.phone} onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })} />
            <TextField label="Address" fullWidth multiline rows={2}
              value={vendorForm.address} onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })} />
            <TextField label="Email" fullWidth type="email"
              value={vendorForm.email} onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })} />
            <TextField label="Contact Person" fullWidth
              value={vendorForm.contact_person} onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVendor(false)}>Cancel</Button>
          <Button variant="contained" sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
            onClick={handleAddVendor} disabled={!vendorForm.name}>
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
                <Select fullWidth size="small" displayEmpty
                  value={purchaseForm.vendor_id}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, vendor_id: e.target.value })}>
                  <MenuItem value="" disabled>Select Vendor</MenuItem>
                  {vendors.map((v) => (
                    <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Purchase Date" fullWidth type="date" size="small" InputLabelProps={{ shrink: true }}
                  value={purchaseForm.purchase_date}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, purchase_date: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Select fullWidth size="small" displayEmpty
                  value={purchaseForm.item_id}
                  onChange={(e) => {
                    const item = items.find((i) => i.id === e.target.value);
                    setPurchaseForm({
                      ...purchaseForm,
                      item_id: e.target.value,
                      item_name: item ? item.name : purchaseForm.item_name
                    });
                  }}>
                  <MenuItem value="">New / unlisted item</MenuItem>
                  {items.map((i) => (
                    <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Item Name" fullWidth required
                  value={purchaseForm.item_name}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, item_name: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" fullWidth multiline rows={2}
                  value={purchaseForm.description}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, description: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Quantity" fullWidth type="number" required
                  value={purchaseForm.quantity}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Purchase Price (PKR)" fullWidth type="number" required
                  value={purchaseForm.purchase_price}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, purchase_price: e.target.value })} />
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
            onClick={handleAddPurchase}
            disabled={!purchaseForm.item_name || !purchaseForm.quantity || !purchaseForm.purchase_price}
          >
            Add Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
