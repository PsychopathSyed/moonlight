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
  Business as PartnerIcon,
  ArrowDownward as RentInIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendIcon,
  Delete as DeleteIcon,
  Receipt as PayIcon,
  PendingActions as PendingIcon,
  CheckCircle as PaidIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import api from '../api';

const emptyPartnerForm = {
  name: '', phone: '', address: '', email: '',
  commission_rate: '15', contact_person: '', available_items: ''
};
const emptyRentalForm = {
  partner_id: '', order_id: '', item_name: '', category: '',
  quantity: '', rate_per_day: '', days: ''
};

export default function Partners() {
  const { setHeaderActions } = useOutletContext();
  const [openPartner, setOpenPartner] = useState(false);
  const [openRentIn, setOpenRentIn] = useState(false);
  const [selectedTab, setSelectedTab] = useState('partners');
  const [searchTerm, setSearchTerm] = useState('');

  const [partners, setPartners] = useState([]);
  const [partnerRentals, setPartnerRentals] = useState([]);
  const [payables, setPayables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [partnerForm, setPartnerForm] = useState(emptyPartnerForm);
  const [rentalForm, setRentalForm] = useState(emptyRentalForm);
  const [error, setError] = useState('');

  const loadPartnersData = async () => {
    const response = await api.get(api.endpoints.partners.list);
    setPartners(response.data?.partners || []);
    setPartnerRentals(response.data?.partner_rentals || []);
    setPayables(response.data?.payables || []);
  };

  const loadOrders = async () => {
    const response = await api.get(api.endpoints.orders.list, { page_size: 100 });
    setOrders(response.data?.orders || []);
  };

  useEffect(() => {
    loadPartnersData().catch((e) => setError(e.message));
    loadOrders().catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenPartner(true)}
            size="small"
          >
            Add Partner
          </Button>
        </>
      );
    }
  }, [searchTerm, setHeaderActions]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return { bg: '#dcfce7', text: '#166534', icon: <PaidIcon /> };
      case 'partial': return { bg: '#fef3c7', text: '#92400e', icon: <PendingIcon /> };
      case 'overdue': return { bg: '#fee2e2', text: '#991b1b', icon: <PendingIcon /> };
      case 'pending': return { bg: '#e0e7ff', text: '#4338ca', icon: <PendingIcon /> };
      default: return { bg: '#f1f5f9', text: '#475569', icon: <PendingIcon /> };
    }
  };

  const totalPayables = payables.reduce((sum, p) => sum + p.balance, 0);
  const totalPaid = payables.reduce((sum, p) => sum + p.paid_amount, 0);

  const filteredPartners = partners.filter((p) =>
    !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPartner = async () => {
    try {
      await api.post(api.endpoints.partners.create, partnerForm);
      setPartnerForm(emptyPartnerForm);
      setOpenPartner(false);
      await loadPartnersData();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeletePartner = async (partnerId) => {
    try {
      await api.delete(api.endpoints.partners.delete(partnerId));
      await loadPartnersData();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddRental = async () => {
    try {
      await api.post(api.endpoints.partners.rentals, {
        ...rentalForm,
        order_id: rentalForm.order_id || null,
        quantity: Number(rentalForm.quantity),
        rate_per_day: Number(rentalForm.rate_per_day),
        days: Number(rentalForm.days)
      });
      setRentalForm(emptyRentalForm);
      setOpenRentIn(false);
      await loadPartnersData();
    } catch (e) {
      setError(e.message);
    }
  };

  const handlePayPayable = async (payableId, balance) => {
    try {
      await api.put(`${api.endpoints.partners.payables}/${payableId}/pay`, { amount: balance });
      await loadPartnersData();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            Partner & Payables
          </Typography>
          <Typography variant="body2" color="text.secondary">
            External partners, rent-in tracking, and payables
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PartnerIcon />}
            onClick={() => setOpenPartner(true)}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Add Partner
          </Button>
          <Button
            variant="contained"
            startIcon={<RentInIcon />}
            onClick={() => setOpenRentIn(true)}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            Rent In
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <PartnerIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Total Partners
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {partners.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <RentInIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Rent-In Items
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {partnerRentals.length}
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
                Outstanding
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(totalPayables / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <TrendIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Paid
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(totalPaid / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant={selectedTab === 'partners' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab('partners')}
              sx={{ borderRadius: 8, ...(selectedTab === 'partners' && { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }) }}
            >
              Partners
            </Button>
            <Button
              variant={selectedTab === 'rentals' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab('rentals')}
              sx={{ borderRadius: 8, ...(selectedTab === 'rentals' && { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }) }}
            >
              Rent-In History
            </Button>
            <Button
              variant={selectedTab === 'payables' ? 'contained' : 'outlined'}
              onClick={() => setSelectedTab('payables')}
              sx={{ borderRadius: 8, ...(selectedTab === 'payables' && { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }) }}
            >
              Payables
            </Button>
          </Box>

          {selectedTab === 'partners' ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Partner Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Commission Rate</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow key={partner.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{partner.name}</TableCell>
                      <TableCell>{partner.phone}</TableCell>
                      <TableCell>{partner.commission_rate}%</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: partner.balance === 0 ? '#10b981' : '#ef4444' }}>
                        PKR {partner.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={partner.status}
                          size="small"
                          sx={{
                            bgcolor: partner.status === 'active' ? '#dcfce7' : '#fef3c7',
                            color: partner.status === 'active' ? '#166534' : '#92400e',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => handleDeletePartner(partner.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : selectedTab === 'rentals' ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Partner</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Qty</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rate/Day</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partnerRentals.map((rental) => (
                    <TableRow key={rental.id} hover>
                      <TableCell>{rental.partner_name}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{rental.item_name}</TableCell>
                      <TableCell>
                        {rental.category && (
                          <Chip label={rental.category} size="small" sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }} />
                        )}
                      </TableCell>
                      <TableCell>{rental.quantity}</TableCell>
                      <TableCell>PKR {rental.rate_per_day.toLocaleString()}</TableCell>
                      <TableCell>{rental.days}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>
                        PKR {rental.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rental.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(rental.status).bg,
                            color: getStatusColor(rental.status).text,
                            fontWeight: 600,
                          }}
                        />
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
                    <TableCell sx={{ fontWeight: 600 }}>Partner</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Paid</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payables.map((payable) => (
                    <TableRow key={payable.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{payable.partner_name}</TableCell>
                      <TableCell>PKR {payable.amount.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                        PKR {payable.paid_amount.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: payable.balance === 0 ? '#10b981' : '#ef4444' }}>
                        PKR {payable.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>{payable.due_date}</TableCell>
                      <TableCell>
                        <Chip
                          label={payable.status}
                          size="small"
                          icon={getStatusColor(payable.status).icon}
                          sx={{
                            bgcolor: getStatusColor(payable.status).bg,
                            color: getStatusColor(payable.status).text,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="success"
                          title="Mark Fully Paid"
                          disabled={payable.balance <= 0}
                          onClick={() => handlePayPayable(payable.id, payable.balance)}
                        >
                          <PayIcon />
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

      <Dialog open={openPartner} onClose={() => setOpenPartner(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Partner</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField label="Partner Name" fullWidth required
              value={partnerForm.name} onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })} />
            <TextField label="Phone Number" fullWidth required
              value={partnerForm.phone} onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })} />
            <TextField label="Address" fullWidth multiline rows={2}
              value={partnerForm.address} onChange={(e) => setPartnerForm({ ...partnerForm, address: e.target.value })} />
            <TextField label="Email" fullWidth type="email"
              value={partnerForm.email} onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })} />
            <TextField label="Commission Rate (%)" fullWidth type="number"
              value={partnerForm.commission_rate} onChange={(e) => setPartnerForm({ ...partnerForm, commission_rate: e.target.value })} />
            <TextField label="Contact Person" fullWidth
              value={partnerForm.contact_person} onChange={(e) => setPartnerForm({ ...partnerForm, contact_person: e.target.value })} />
            <TextField label="Available Items" fullWidth multiline rows={2} placeholder="List items available for rent-in..."
              value={partnerForm.available_items} onChange={(e) => setPartnerForm({ ...partnerForm, available_items: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPartner(false)}>Cancel</Button>
          <Button variant="contained" sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
            onClick={handleAddPartner} disabled={!partnerForm.name}>
            Add Partner
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRentIn} onClose={() => setOpenRentIn(false)} maxWidth="md" fullWidth>
        <DialogTitle>Rent Items from Partner</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Select fullWidth size="small" displayEmpty
                  value={rentalForm.partner_id}
                  onChange={(e) => setRentalForm({ ...rentalForm, partner_id: e.target.value })}>
                  <MenuItem value="" disabled>Select Partner</MenuItem>
                  {partners.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <Select fullWidth size="small" displayEmpty
                  value={rentalForm.order_id}
                  onChange={(e) => setRentalForm({ ...rentalForm, order_id: e.target.value })}>
                  <MenuItem value="">No linked order</MenuItem>
                  {orders.map((o) => (
                    <MenuItem key={o.id} value={o.id}>{o.order_number}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Item Name" fullWidth required
                  value={rentalForm.item_name} onChange={(e) => setRentalForm({ ...rentalForm, item_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Select fullWidth size="small" displayEmpty
                  value={rentalForm.category}
                  onChange={(e) => setRentalForm({ ...rentalForm, category: e.target.value })}>
                  <MenuItem value="" disabled>Select Category</MenuItem>
                  <MenuItem value="Speakers">Speakers</MenuItem>
                  <MenuItem value="Lights">Lights</MenuItem>
                  <MenuItem value="DJ">DJ Equipment</MenuItem>
                  <MenuItem value="Screens">Screens</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Quantity" fullWidth type="number" required
                  value={rentalForm.quantity} onChange={(e) => setRentalForm({ ...rentalForm, quantity: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Rate per Day (PKR)" fullWidth type="number" required
                  value={rentalForm.rate_per_day} onChange={(e) => setRentalForm({ ...rentalForm, rate_per_day: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Number of Days" fullWidth type="number" required
                  value={rentalForm.days} onChange={(e) => setRentalForm({ ...rentalForm, days: e.target.value })} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRentIn(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<RentInIcon />}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
            onClick={handleAddRental}
            disabled={!rentalForm.partner_id || !rentalForm.item_name || !rentalForm.quantity}
          >
            Add Rent-In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
