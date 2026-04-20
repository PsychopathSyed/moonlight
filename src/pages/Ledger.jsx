import React, { useState } from 'react';
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
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as InIcon,
  TrendingDown as OutIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

export default function Ledger() {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [openStatement, setOpenStatement] = useState(false);

  const customers = [
    { id: 1, name: 'Ali Corporation', totalInvoiced: 150000, paid: 120000, outstanding: 30000, lastPayment: '2026-04-15', status: 'partial' },
    { id: 2, name: 'Tech Events Ltd', totalInvoiced: 85000, paid: 85000, outstanding: 0, lastPayment: '2026-04-12', status: 'paid' },
    { id: 3, name: 'Wedding Planners', totalInvoiced: 125000, paid: 50000, outstanding: 75000, lastPayment: '2026-04-10', status: 'partial' },
    { id: 4, name: 'Party Makers', totalInvoiced: 95000, paid: 0, outstanding: 95000, lastPayment: null, status: 'unpaid' },
    { id: 5, name: 'Event Pro', totalInvoiced: 180000, paid: 180000, outstanding: 0, lastPayment: '2026-04-08', status: 'paid' },
  ];

  const transactions = [
    { id: 1, date: '2026-04-20', type: 'invoice', invoice: 'INV-001', customer: 'Ali Corporation', amount: 35000, balance: 65000 },
    { id: 2, date: '2026-04-18', type: 'payment', invoice: 'INV-001', customer: 'Ali Corporation', amount: -20000, balance: 45000 },
    { id: 3, date: '2026-04-15', type: 'invoice', invoice: 'INV-002', customer: 'Tech Events Ltd', amount: 28000, balance: 28000 },
    { id: 4, date: '2026-04-12', type: 'payment', invoice: 'INV-002', customer: 'Tech Events Ltd', amount: -28000, balance: 0 },
    { id: 5, date: '2026-04-10', type: 'invoice', invoice: 'INV-003', customer: 'Wedding Planners', amount: 45000, balance: 75000 },
    { id: 6, date: '2026-04-08', type: 'payment', invoice: 'INV-001', customer: 'Event Pro', amount: -180000, balance: 0 },
    { id: 7, date: '2026-04-05', type: 'invoice', invoice: 'INV-004', customer: 'Party Makers', amount: 65000, balance: 65000 },
    { id: 8, date: '2026-04-02', type: 'payment', invoice: 'INV-003', customer: 'Wedding Planners', amount: -45000, balance: 30000 },
  ];

  const monthlyStats = [
    { month: 'Jan', invoiced: 120000, collected: 100000, outstanding: 20000 },
    { month: 'Feb', invoiced: 145000, collected: 125000, outstanding: 20000 },
    { month: 'Mar', invoiced: 180000, collected: 155000, outstanding: 25000 },
    { month: 'Apr', invoiced: 165000, collected: 140000, outstanding: 25000 },
    { month: 'May', invoiced: 200000, collected: 0, outstanding: 200000 },
    { month: 'Jun', invoiced: 0, collected: 0, outstanding: 0 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return { bg: '#dcfce7', text: '#166534' };
      case 'partial': return { bg: '#fef3c7', text: '#92400e' };
      case 'unpaid': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const totalInvoiced = customers.reduce((sum, c) => sum + c.totalInvoiced, 0);
  const totalPaid = customers.reduce((sum, c) => sum + c.paid, 0);

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            Customer Ledger
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track outstanding balances and payment history
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ borderRadius: 8 }}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            Export to Excel
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <ReceiptIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Total Invoiced
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(totalInvoiced / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <InIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Total Collected
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(totalPaid / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <OutIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Outstanding
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(totalOutstanding / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <MoneyIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Collection Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {((totalPaid / totalInvoiced) * 100).toFixed(0)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Customer Balances
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Select size="small" defaultValue="all" sx={{ minWidth: 150 }}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
              </Select>
              <TextField
                placeholder="Search customer..."
                size="small"
                sx={{ minWidth: 250 }}
              />
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Invoiced</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Paid</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Outstanding</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Payment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{customer.name}</TableCell>
                    <TableCell>PKR {customer.totalInvoiced.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                      PKR {customer.paid.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: customer.outstanding === 0 ? '#10b981' : '#ef4444' }}>
                      PKR {customer.outstanding.toLocaleString()}
                    </TableCell>
                    <TableCell>{customer.lastPayment || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(customer.status).bg,
                          color: getStatusColor(customer.status).text,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Transaction History
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Select size="small" defaultValue="all" sx={{ minWidth: 150 }}>
                  <MenuItem value="all">All Customers</MenuItem>
                  {customers.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
                <Select size="small" defaultValue="all" sx={{ minWidth: 120 }}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="invoice">Invoices</MenuItem>
                  <MenuItem value="payment">Payments</MenuItem>
                </Select>
                <Select size="small" defaultValue="all" sx={{ minWidth: 150 }}>
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                </Select>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Invoice</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>
                          <Chip
                            label={tx.type}
                            size="small"
                            icon={tx.type === 'invoice' ? <ReceiptIcon /> : <MoneyIcon />}
                            sx={{
                              bgcolor: tx.type === 'invoice' ? '#e0e7ff' : '#dcfce7',
                              color: tx.type === 'invoice' ? '#4338ca' : '#166534',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{tx.invoice}</TableCell>
                        <TableCell>{tx.customer}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: tx.type === 'invoice' ? '#ef4444' : '#10b981' }}>
                          {tx.type === 'invoice' ? '+' : ''}PKR {Math.abs(tx.amount).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          PKR {tx.balance.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Monthly Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {monthlyStats.slice(0, 6).map((stat) => (
                  <Paper key={stat.month} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" fontWeight={600}>{stat.month}</Typography>
                      <Typography variant="caption" color={stat.outstanding > 0 ? '#ef4444' : '#10b981'}>
                        Outstanding: PKR {stat.outstanding.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Invoiced</Typography>
                        <Typography variant="body2" fontWeight={600}>PKR {(stat.invoiced / 1000).toFixed(0)}k</Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">Collected</Typography>
                        <Typography variant="body2" fontWeight={600} color="#10b981">PKR {(stat.collected / 1000).toFixed(0)}k</Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openStatement} onClose={() => setOpenStatement(false)} maxWidth="md" fullWidth>
        <DialogTitle>Customer Statement</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Generate detailed statement for selected customer and period
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Select size="small" fullWidth defaultValue="" displayEmpty>
              <MenuItem value="" disabled>Select Customer</MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="From Date" fullWidth type="date" size="small" InputLabelProps={{ shrink: true }} />
              <TextField label="To Date" fullWidth type="date" size="small" InputLabelProps={{ shrink: true }} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatement(false)}>Cancel</Button>
          <Button variant="contained" sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            Generate Statement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
