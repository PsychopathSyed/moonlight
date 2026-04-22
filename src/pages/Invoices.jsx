import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  LinearProgress,
  InputAdornment,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';

export default function Invoices() {
  const { setHeaderActions } = useOutletContext();
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const invoices = [
    {
      id:1,
      invoiceNumber: 'INV-2026-001',
      customer: 'Ali Corporation',
      quotationId: 1,
      eventDate: '2026-04-20',
      totalAmount: 'PKR 60,000',
      paidAmount: 'PKR 30,000',
      remainingAmount: 'PKR 30,000',
      status: 'partial',
      dueDate: '2026-04-27',
      payments: [
        { date: '2026-04-17', amount: 'PKR 15,000', method: 'Cash' },
        { date: '2026-04-18', amount: 'PKR 15,000', method: 'Bank Transfer' },
      ],
    },
    {
      id: 2,
      invoiceNumber: 'INV-2026-002',
      customer: 'Tech Events Ltd',
      quotationId: 2,
      eventDate: '2026-04-25',
      totalAmount: 'PKR 22,000',
      paidAmount: 'PKR 0',
      remainingAmount: 'PKR 22,000',
      status: 'unpaid',
      dueDate: '2026-05-02',
      payments: [],
    },
    {
      id: 3,
      invoiceNumber: 'INV-2026-003',
      customer: 'Wedding Planners',
      quotationId: 3,
      eventDate: '2026-04-18',
      totalAmount: 'PKR 35,000',
      paidAmount: 'PKR 35,000',
      remainingAmount: 'PKR 0',
      status: 'paid',
      dueDate: '2026-04-25',
      payments: [
        { date: '2026-04-18', amount: 'PKR 35,000', method: 'Cash' },
      ],
    },
    {
      id: 4,
      invoiceNumber: 'INV-2026-004',
      customer: 'Corporate Events',
      quotationId: null,
      eventDate: '2026-04-15',
      totalAmount: 'PKR 8,000',
      paidAmount: 'PKR 8,000',
      remainingAmount: 'PKR 0',
      status: 'paid',
      dueDate: '2026-04-22',
      payments: [
        { date: '2026-04-16', amount: 'PKR 8,000', method: 'Bank Transfer' },
      ],
    },
    {
      id: 5,
      invoiceNumber: 'INV-2026-005',
      customer: 'Music Festival',
      quotationId: null,
      eventDate: '2026-04-01',
      totalAmount: 'PKR 75,000',
      paidAmount: 'PKR 50,000',
      remainingAmount: 'PKR 25,000',
      status: 'overdue',
      dueDate: '2026-04-15',
      payments: [
        { date: '2026-04-02', amount: 'PKR 25,000', method: 'Cash' },
        { date: '2026-04-05', amount: 'PKR 25,000', method: 'Bank Transfer' },
      ],
    },
  ];

  useEffect(() => {
    // Set header actions
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="partial">Partial</MenuItem>
              <MenuItem value="unpaid">Unpaid</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            size="small"
          >
            New Invoice
          </Button>
        </>
      );
    }
  }, [filterStatus, searchTerm, setHeaderActions]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return { bg: '#dcfce7', text: '#166534', progress: 100 };
      case 'partial': return { bg: '#fef3c7', text: '#92400e', progress: 50 };
      case 'unpaid': return { bg: '#dbeafe', text: '#1e40af', progress: 0 };
      case 'overdue': return { bg: '#fee2e2', text: '#991b1b', progress: 0 };
      default: return { bg: '#f1f5f9', text: '#475569', progress: 0 };
    }
  };

  const getPaymentPercentage = (paid, total) => {
    const paidNum = parseInt(paid.replace(/[^0-9]/g, ''));
    const totalNum = parseInt(total.replace(/[^0-9]/g, ''));
    return totalNum > 0 ? Math.round((paidNum / totalNum) * 100) : 0;
  };

  const filteredInvoices = searchTerm
    ? invoices.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.toLowerCase().includes(searchTerm.toLowerCase())
      ).filter(inv => filterStatus === 'all' ? true : inv.status === filterStatus)
    : filterStatus === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === filterStatus);

  return (
    <Box>
      <Grid container spacing={3}>
        {filteredInvoices.map((invoice) => (
          <Grid item xs={12} md={6} lg={4} key={invoice.id}>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                },
              }}
            >
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Avatar
                      sx={{
                        bgcolor: '#6366f1',
                        width: 48,
                        height: 48,
                        mb: 1,
                      }}
                    >
                      <ReceiptIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {invoice.invoiceNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {invoice.customer}
                    </Typography>
                  </Box>
                  <Chip
                    label={invoice.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(invoice.status).bg,
                      color: getStatusColor(invoice.status).text,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  />
                </Box>

                {/* Payment Progress */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Payment Progress
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color="#6366f1">
                      {getPaymentPercentage(invoice.paidAmount, invoice.totalAmount)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getPaymentPercentage(invoice.paidAmount, invoice.totalAmount)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: getStatusColor(invoice.status).progress === 100
                          ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                          : getStatusColor(invoice.status).progress === 0
                          ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                          : 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                      },
                    }}
                  />
                </Box>

                {/* Amount Details */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Total Amount
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#1e293b">
                      {invoice.totalAmount}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Paid Amount
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#10b981">
                      {invoice.paidAmount}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Remaining
                    </Typography>
                    <Typography variant="body1" fontWeight={600} color="#ef4444">
                      {invoice.remainingAmount}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Due Date
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {invoice.dueDate}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Recent Payments */}
                <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Recent Payments ({invoice.payments.length})
                  </Typography>
                  {invoice.payments.length > 0 ? (
                    invoice.payments.slice(0, 2).map((payment, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">
                          {payment.date} - {payment.method}
                        </Typography>
                        <Typography variant="caption" fontWeight={500} color="#10b981">
                          {payment.amount}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary" italic>
                      No payments yet
                    </Typography>
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small">
                    <PrintIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small">
                    <DownloadIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  {invoice.status !== 'paid' && (
                    <IconButton size="small" color="primary">
                      <MoneyIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                  <IconButton size="small">
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Customer" variant="outlined" select SelectProps={{ native: true }}>
                <option value="">Select Customer</option>
                <option value="1">Ali Corporation</option>
                <option value="2">Tech Events Ltd</option>
                <option value="3">Wedding Planners</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Quotation (Optional)" variant="outlined" select SelectProps={{ native: true }}>
                <option value="">Without Quotation</option>
                <option value="1">Quotation #1</option>
                <option value="3">Quotation #3</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount (PKR)"
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><MoneyIcon /></InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Due Date" type="date" variant="outlined" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Payment Amount (PKR)" variant="outlined" placeholder="0" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Payment Method" variant="outlined" select SelectProps={{ native: true }}>
                <option value="">Select Method</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="outlined" startIcon={<CheckIcon />}>
            Save Invoice
          </Button>
          <Button
            variant="contained"
            startIcon={<MoneyIcon />}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
            }}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
