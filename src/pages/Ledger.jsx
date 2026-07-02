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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as InIcon,
  TrendingDown as OutIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Ledger() {
  const { setHeaderActions } = useOutletContext();
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [openStatement, setOpenStatement] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [statementForm, setStatementForm] = useState({ customer_id: '', from: '', to: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = async () => {
    const response = await api.get('/api/ledger', { page_size: 100 });
    setTransactions(response.data?.transactions || []);
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    loadTransactions()
      .catch(() => setError('Failed to load ledger. Please check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search ledger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <Button
            variant="contained"
            startIcon={<ReceiptIcon />}
            onClick={() => setOpenStatement(true)}
            size="small"
          >
            Generate Statement
          </Button>
        </>
      );
    }
    return () => setHeaderActions && setHeaderActions(null);
  }, [searchTerm, setHeaderActions]);

  // Aggregate customer balances from transactions
  const customerMap = {};
  transactions.forEach((tx) => {
    if (!customerMap[tx.customer_id]) {
      customerMap[tx.customer_id] = {
        id: tx.customer_id,
        name: tx.customer_name,
        totalInvoiced: 0,
        paid: 0,
        lastPayment: null,
      };
    }
    const c = customerMap[tx.customer_id];
    c.totalInvoiced += tx.debit_amount;
    c.paid += tx.credit_amount;
    if (tx.credit_amount > 0 && (!c.lastPayment || tx.transaction_date > c.lastPayment)) {
      c.lastPayment = tx.transaction_date;
    }
  });
  const customers = Object.values(customerMap).map((c) => ({
    ...c,
    outstanding: c.totalInvoiced - c.paid,
    status: c.totalInvoiced - c.paid <= 0 ? 'paid' : c.paid > 0 ? 'partial' : 'unpaid',
  }));

  // Monthly stats from transactions
  const monthlyMap = {};
  transactions.forEach((tx) => {
    const key = tx.transaction_date.slice(0, 7);
    if (!monthlyMap[key]) monthlyMap[key] = { key, invoiced: 0, collected: 0 };
    monthlyMap[key].invoiced += tx.debit_amount;
    monthlyMap[key].collected += tx.credit_amount;
  });
  const monthlyStats = Object.values(monthlyMap)
    .sort((a, b) => b.key.localeCompare(a.key))
    .slice(0, 6)
    .map((m) => ({
      month: `${MONTH_NAMES[Number(m.key.slice(5, 7)) - 1]} ${m.key.slice(0, 4)}`,
      invoiced: m.invoiced,
      collected: m.collected,
      outstanding: m.invoiced - m.collected,
    }));

  const visibleTransactions = transactions.filter((tx) => {
    if (selectedCustomer !== 'all' && tx.customer_id !== selectedCustomer) return false;
    if (selectedType !== 'all' && tx.type !== selectedType) return false;
    if (searchTerm && !(tx.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(tx.description || '').toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const visibleCustomers = customers.filter((c) =>
    !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const totalInvoiced = customers.reduce((sum, c) => sum + c.totalInvoiced, 0);
  const totalPaid = customers.reduce((sum, c) => sum + c.paid, 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return { bg: '#dcfce7', text: '#166534' };
      case 'partial': return { bg: '#fef3c7', text: '#92400e' };
      case 'unpaid': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const exportCsv = (rows, filename) => {
    const header = 'Date,Type,Customer,Description,Debit,Credit,Balance\n';
    const body = rows.map((tx) =>
      [tx.transaction_date, tx.type, `"${tx.customer_name}"`, `"${tx.description || ''}"`,
        tx.debit_amount, tx.credit_amount, tx.balance].join(',')
    ).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleGenerateStatement = () => {
    const rows = transactions.filter((tx) => {
      if (statementForm.customer_id && tx.customer_id !== statementForm.customer_id) return false;
      if (statementForm.from && tx.transaction_date < statementForm.from) return false;
      if (statementForm.to && tx.transaction_date > statementForm.to) return false;
      return true;
    });
    exportCsv(rows, 'customer-statement.csv');
    setOpenStatement(false);
  };

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
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => exportCsv(transactions, 'ledger-export.csv')}
          sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
        >
          Export CSV
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Invoiced', value: `PKR ${(totalInvoiced / 1000).toFixed(0)}k`, icon: <ReceiptIcon />, bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
          { label: 'Total Collected', value: `PKR ${(totalPaid / 1000).toFixed(0)}k`, icon: <InIcon />, bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
          { label: 'Outstanding', value: `PKR ${(totalOutstanding / 1000).toFixed(0)}k`, icon: <OutIcon />, bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
          { label: 'Collection Rate', value: totalInvoiced > 0 ? `${((totalPaid / totalInvoiced) * 100).toFixed(0)}%` : '-', icon: <MoneyIcon />, bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
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

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Customer Balances
            </Typography>
            <TextField
              placeholder="Search customer..."
              size="small"
              sx={{ minWidth: 250 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
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
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ color: '#64748b', py: 4 }}>
                      No ledger entries yet — transactions appear here when invoices and payments are recorded
                    </TableCell>
                  </TableRow>
                )}
                {visibleCustomers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{customer.name}</TableCell>
                    <TableCell>PKR {customer.totalInvoiced.toLocaleString()}</TableCell>
                    <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                      PKR {customer.paid.toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: customer.outstanding <= 0 ? '#10b981' : '#ef4444' }}>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}
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
                <Select size="small" sx={{ minWidth: 180 }} value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}>
                  <MenuItem value="all">All Customers</MenuItem>
                  {customers.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
                <Select size="small" sx={{ minWidth: 120 }} value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="invoice">Invoices</MenuItem>
                  <MenuItem value="payment">Payments</MenuItem>
                </Select>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleTransactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ color: '#64748b', py: 4 }}>
                          No transactions found
                        </TableCell>
                      </TableRow>
                    )}
                    {visibleTransactions.map((tx) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>{tx.transaction_date}</TableCell>
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
                        <TableCell>{tx.customer_name}</TableCell>
                        <TableCell>{tx.description || '-'}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: tx.type === 'invoice' ? '#ef4444' : '#10b981' }}>
                          {tx.type === 'invoice' ? '+' : '-'}PKR {(tx.debit_amount || tx.credit_amount).toLocaleString()}
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
                {monthlyStats.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No transaction data yet
                  </Typography>
                )}
                {monthlyStats.map((stat) => (
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
            Generate detailed statement (CSV) for selected customer and period
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Customer</InputLabel>
              <Select label="Customer" value={statementForm.customer_id}
                onChange={(e) => setStatementForm({ ...statementForm, customer_id: e.target.value })}>
                <MenuItem value="">All Customers</MenuItem>
                {customers.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="From Date" fullWidth type="date" size="small" InputLabelProps={{ shrink: true }}
                value={statementForm.from}
                onChange={(e) => setStatementForm({ ...statementForm, from: e.target.value })} />
              <TextField label="To Date" fullWidth type="date" size="small" InputLabelProps={{ shrink: true }}
                value={statementForm.to}
                onChange={(e) => setStatementForm({ ...statementForm, to: e.target.value })} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatement(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerateStatement}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            Generate Statement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
