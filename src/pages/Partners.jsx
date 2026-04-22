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
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as PartnerIcon,
  ArrowDownward as RentInIcon,
  ArrowUpward as RentOutIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Receipt as PayIcon,
  PendingActions as PendingIcon,
  CheckCircle as PaidIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';

export default function Partners() {
  const { setHeaderActions } = useOutletContext();
  const [openPartner, setOpenPartner] = useState(false);
  const [openRentIn, setOpenRentIn] = useState(false);
  const [selectedTab, setSelectedTab] = useState('partners');
  const [searchTerm, setSearchTerm] = useState('');

  const partners = [
    { id: 1, name: 'Event Gear Rentals', phone: '+92-300-1112223', items: 25, rate: '15%', balance: 'PKR 45,000', status: 'active' },
    { id: 2, name: 'Pro Sound Systems', phone: '+92-321-4445556', items: 18, rate: '12%', balance: 'PKR 22,000', status: 'active' },
    { id: 3, name: 'Light World', phone: '+92-333-6667788', items: 32, rate: '10%', balance: 'PKR 0', status: 'active' },
    { id: 4, name: 'DJ Equipment Pool', phone: '+92-300-7778899', items: 15, rate: '18%', balance: 'PKR 18,500', status: 'pending' },
  ];

  const partnerRentals = [
    { id: 1, partner: 'Event Gear Rentals', item: 'Meyer Sound Speaker', category: 'Speakers', qty: 4, rate: 2500, days: 3, total: 30000, order: 'ORD-001', status: 'pending' },
    { id: 2, partner: 'Pro Sound Systems', item: 'Line Array System', category: 'Speakers', qty: 8, rate: 1800, days: 2, total: 28800, order: 'ORD-002', status: 'pending' },
    { id: 3, partner: 'Light World', item: 'Robotic Moving Head', category: 'Lights', qty: 6, rate: 1200, days: 2, total: 14400, order: 'ORD-003', status: 'paid' },
    { id: 4, partner: 'Event Gear Rentals', item: 'Subwoofer Array', category: 'Speakers', qty: 4, rate: 2000, days: 3, total: 24000, order: 'ORD-004', status: 'pending' },
    { id: 5, partner: 'DJ Equipment Pool', item: 'Pioneer DJM Mixer', category: 'DJ', qty: 2, rate: 3000, days: 2, total: 12000, order: 'ORD-005', status: 'overdue' },
  ];

  const payables = [
    { id: 1, partner: 'Event Gear Rentals', amount: 45000, paid: 0, balance: 45000, dueDate: '2026-04-20', status: 'pending' },
    { id: 2, partner: 'Pro Sound Systems', amount: 22000, paid: 5000, balance: 17000, dueDate: '2026-04-18', status: 'partial' },
    { id: 3, partner: 'Light World', amount: 14400, paid: 14400, balance: 0, dueDate: '2026-04-15', status: 'paid' },
    { id: 4, partner: 'DJ Equipment Pool', amount: 18500, paid: 0, balance: 18500, dueDate: '2026-04-17', status: 'overdue' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return { bg: '#dcfce7', text: '#166534', icon: <PaidIcon /> };
      case 'partial': return { bg: '#fef3c7', text: '#92400e', icon: <PendingIcon /> };
      case 'overdue': return { bg: '#fee2e2', text: '#991b1b', icon: <PendingIcon /> };
      case 'pending': return { bg: '#e0e7ff', text: '#4338ca', icon: <PendingIcon /> };
      default: return { bg: '#f1f5f9', text: '#475569', icon: <PendingIcon /> };
    }
  };

  useEffect(() => {
    // Set header actions
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

  const totalPayables = payables.reduce((sum, p) => sum + p.balance, 0);
  const totalPaid = payables.reduce((sum, p) => sum + p.paid, 0);

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
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
                    <TableCell sx={{ fontWeight: 600 }}>Items Available</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Commission Rate</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{partner.name}</TableCell>
                      <TableCell>{partner.phone}</TableCell>
                      <TableCell>{partner.items}</TableCell>
                      <TableCell>{partner.rate}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: partner.balance === 'PKR 0' ? '#10b981' : '#ef4444' }}>
                        {partner.balance}
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
          ) : selectedTab === 'rentals' ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
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
                      <TableCell sx={{ fontWeight: 600 }}>{rental.order}</TableCell>
                      <TableCell>{rental.partner}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{rental.item}</TableCell>
                      <TableCell>
                        <Chip label={rental.category} size="small" sx={{ bgcolor: '#e0e7ff', color: '#4338ca' }} />
                      </TableCell>
                      <TableCell>{rental.qty}</TableCell>
                      <TableCell>PKR {rental.rate.toLocaleString()}</TableCell>
                      <TableCell>{rental.days}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>
                        PKR {rental.total.toLocaleString()}
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
                      <TableCell sx={{ fontWeight: 600 }}>{payable.partner}</TableCell>
                      <TableCell>PKR {payable.amount.toLocaleString()}</TableCell>
                      <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                        PKR {payable.paid.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: payable.balance === 0 ? '#10b981' : '#ef4444' }}>
                        PKR {payable.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>{payable.dueDate}</TableCell>
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
                        <IconButton size="small" color="success" title="Make Payment">
                          <PayIcon />
                        </IconButton>
                        <IconButton size="small" color="primary" title="View Details">
                          <MoneyIcon />
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
            <TextField label="Partner Name" fullWidth required />
            <TextField label="Phone Number" fullWidth required />
            <TextField label="Address" fullWidth multiline rows={2} />
            <TextField label="Email" fullWidth type="email" />
            <TextField label="Commission Rate (%)" fullWidth type="number" defaultValue="15" />
            <TextField label="Contact Person" fullWidth />
            <TextField label="Available Items" fullWidth multiline rows={2} placeholder="List items available for rent-in..." />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPartner(false)}>Cancel</Button>
          <Button variant="contained" sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
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
                <Select label="Select Partner" fullWidth size="small" defaultValue="" displayEmpty>
                  <MenuItem value="" disabled>Select Partner</MenuItem>
                  {partners.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Link to Order" fullWidth size="small" placeholder="e.g., ORD-001" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Item Name" fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <Select label="Category" fullWidth size="small" defaultValue="" displayEmpty>
                  <MenuItem value="" disabled>Select Category</MenuItem>
                  <MenuItem value="Speakers">Speakers</MenuItem>
                  <MenuItem value="Lights">Lights</MenuItem>
                  <MenuItem value="DJ">DJ Equipment</MenuItem>
                  <MenuItem value="Screens">Screens</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Quantity" fullWidth type="number" required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Rate per Day (PKR)" fullWidth type="number" required />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField label="Number of Days" fullWidth type="number" required />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Notes" fullWidth multiline rows={2} placeholder="Any special notes about this rental..." />
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
          >
            Add Rent-In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
