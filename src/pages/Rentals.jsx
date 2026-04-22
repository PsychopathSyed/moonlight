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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';

export default function Rentals() {
  const { setHeaderActions } = useOutletContext();
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const rentals = [
    {
      id: 1,
      customer: 'Ali Corporation',
      items: 'Speaker System, Screens (x2)',
      eventDate: '2026-04-20',
      returnDate: '2026-04-22',
      status: 'active',
      amount: 'PKR 15,000',
      deposit: 'PKR 5,000',
    },
    {
      id: 2,
      customer: 'Tech Events Ltd',
      items: 'LED Lights, Microphones (x10)',
      eventDate: '2026-04-18',
      returnDate: '2026-04-19',
      status: 'active',
      amount: 'PKR 22,000',
      deposit: 'PKR 8,000',
    },
    {
      id: 3,
      customer: 'Wedding Planners',
      items: 'Coffee Machine, Projector',
      eventDate: '2026-04-15',
      returnDate: '2026-04-16',
      status: 'returned',
      amount: 'PKR 8,000',
      deposit: 'PKR 3,000',
    },
    {
      id: 4,
      customer: 'Corporate Events',
      items: 'Full Audio Setup, Stage',
      eventDate: '2026-04-25',
      returnDate: '2026-04-27',
      status: 'pending',
      amount: 'PKR 35,000',
      deposit: 'PKR 12,000',
    },
    {
      id: 5,
      customer: 'Music Festival',
      items: 'Screens (x5), Sound System',
      eventDate: '2026-05-01',
      returnDate: '2026-05-03',
      status: 'pending',
      amount: 'PKR 50,000',
      deposit: 'PKR 15,000',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'returned': return { bg: '#dbeafe', text: '#1e40af' };
      case 'pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'overdue': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  useEffect(() => {
    // Set header actions
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search rentals..."
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="returned">Returned</MenuItem>
              <MenuItem value="overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            size="small"
          >
            New Rental
          </Button>
        </>
      );
    }
  }, [filterStatus, searchTerm, setHeaderActions]);

  const filteredRentals = searchTerm
    ? rentals.filter(r => 
        r.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.items.toLowerCase().includes(searchTerm.toLowerCase())
      ).filter(r => filterStatus === 'all' ? true : r.status === filterStatus)
    : filterStatus === 'all'
    ? rentals
    : rentals.filter(r => r.status === filterStatus);

  return (
    <Box>

      <TableContainer component={Card} sx={{ maxHeight: 'calc(100vh - 200px)' }}>
        <Table sx={{
          '& .MuiTableHead-root': {
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: '#f8fafc',
          },
          '& .MuiTableCell-head': {
            backgroundColor: '#f1f5f9',
            fontWeight: 600,
            borderBottom: '2px solid #e2e8f0',
          },
        }}>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Event Date</TableCell>
              <TableCell>Return Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Deposit</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRentals.map((rental) => (
              <TableRow key={rental.id} hover>
                <TableCell>
                  <Typography fontWeight={500}>{rental.customer}</Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>{rental.items}</TableCell>
                <TableCell>{rental.eventDate}</TableCell>
                <TableCell>{rental.returnDate}</TableCell>
                <TableCell>
                  <Typography fontWeight={600} color="#6366f1">
                    {rental.amount}
                  </Typography>
                </TableCell>
                <TableCell>{rental.deposit}</TableCell>
                <TableCell>
                  <Chip
                    label={rental.status}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(rental.status).bg,
                      color: getStatusColor(rental.status).text,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  {rental.status === 'pending' && (
                    <IconButton size="small" sx={{ color: '#10b981' }}>
                      <CheckIcon />
                    </IconButton>
                  )}
                  {rental.status === 'active' && (
                    <IconButton size="small" sx={{ color: '#3b82f6' }}>
                      <CloseIcon />
                    </IconButton>
                  )}
                  <IconButton size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Rental</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Customer Name" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" variant="outlined" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Items (comma separated)"
                placeholder="Speaker System, Screens (x2), LED Lights"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Event Date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Return Date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount (PKR)"
                variant="outlined"
                placeholder="15000"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deposit Amount (PKR)"
                variant="outlined"
                placeholder="5000"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select label="Payment Status" defaultValue="pending">
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="partial">Partial Payment</MenuItem>
                  <MenuItem value="full">Full Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rental Status</InputLabel>
                <Select label="Rental Status" defaultValue="pending">
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="active">Active (Checked Out)</MenuItem>
                  <MenuItem value="returned">Returned</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              },
            }}
          >
            Create Rental
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
