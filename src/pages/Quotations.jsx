import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
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
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Money as MoneyIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import api from '../../api';
import { useOutletContext } from 'react-router-dom';

const ITEMS_PER_PAGE = 20;

export default function Quotations() {
  const { setHeaderActions } = useOutletContext();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalQuotations, setTotalQuotations] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    event_name: '',
    event_location: '',
    event_date: '',
    validity_date: '',
    status: 'draft',
    notes: '',
    terms: '',
    items: [{ item_name: '', quantity: 1, rate_per_day: 0, rate_per_event: 0, days: 1 }]
  });

  useEffect(() => {
    // Set header actions
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingQuotation(null);
              handleAddItem();
              setOpenDialog(true);
            }}
            size="small"
          >
            New Quotation
          </Button>
        </>
      );
    }
  }, [searchTerm, statusFilter, setHeaderActions]);

  useEffect(() => {
    fetchQuotations();
  }, [page, searchTerm, statusFilter]);

  const fetchQuotations = async () => {
    setLoading(true);
    setError('');

    try {
      let endpoint = api.endpoints.quotations.list;

      // Add query parameters
      const params = {
        page: page,
        page_size: ITEMS_PER_PAGE
      };

      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get(endpoint, params);
      console.log('Fetch quotations response:', response);

      if (response.success && response.data) {
        setQuotations(response.data.quotations || response.data);
        setTotalQuotations(response.data.total || response.data.pagination?.total || response.data.quotations?.length || 0);
      } else if (Array.isArray(response)) {
        // Handle flat array response
        setQuotations(response);
        setTotalQuotations(response.length);
      } else {
        setError('Failed to load quotations');
      }
    } catch (err) {
      console.error('Quotations error:', err);
      setError('Failed to connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { item_name: '', quantity: 1, rate_per_day: 0, rate_per_event: 0, days: 1, notes: '' }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let response;

      if (editingQuotation) {
        response = await api.put(`${api.endpoints.quotations.update(editingQuotation.id)}`, formData);
      } else {
        response = await api.post(api.endpoints.quotations.create, formData);
      }

      console.log('Quotation save response:', response);

      if (response.success || response.id) {
        handleCloseDialog();
        fetchQuotations();
      } else {
        setError(response.message || 'Failed to save quotation');
      }
    } catch (err) {
      console.error('Save quotation error:', err);
      setError('Failed to connect to server. Please check your connection.');
    }
  };

  const handleEdit = (quotation) => {
    setEditingQuotation(quotation);
    setFormData({
      customer_id: quotation.customer_id || '',
      event_name: quotation.event_name || '',
      event_location: quotation.event_location || '',
      event_date: quotation.event_date ? quotation.event_date.split('T')[0] : '',
      validity_date: quotation.validity_date ? quotation.validity_date.split('T')[0] : '',
      status: quotation.status || 'draft',
      notes: quotation.notes || '',
      terms: quotation.terms || '',
      items: quotation.items ? quotation.items.map(item => ({
        item_name: item.item_name || '',
        quantity: item.quantity || 1,
        rate_per_day: item.rate_per_day || 0,
        rate_per_event: item.rate_per_event || 0,
        days: item.days || 1,
        notes: item.notes || ''
      })) : [{ item_name: '', quantity: 1, rate_per_day: 0, rate_per_event: 0, days: 1, notes: '' }]
    });
    setOpenDialog(true);
  };

  const handleDelete = async (quotationId) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        const response = await api.delete(api.endpoints.quotations.delete(quotationId));
        console.log('Delete response:', response);

        if (response.success || response.detail === 'Quotation deleted successfully') {
          fetchQuotations();
        } else {
          setError(response.message || 'Failed to delete quotation');
        }
      } catch (err) {
        console.error('Delete quotation error:', err);
        setError('Failed to connect to server. Please check your connection.');
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuotation(null);
    setFormData({
      customer_id: '',
      event_name: '',
      event_location: '',
      event_date: '',
      validity_date: '',
      status: 'draft',
      notes: '',
      terms: '',
      items: [{ item_name: '', quantity: 1, rate_per_day: 0, rate_per_event: 0, days: 1, notes: '' }]
    });
  };

  const handleSend = async (quotationId) => {
    try {
      const response = await api.post(`${api.endpoints.quotations.update(quotationId)}/send`, {});
      console.log('Send quotation response:', response);

      if (response.success) {
        alert('Quotation sent successfully!');
      } else {
        setError(response.message || 'Failed to send quotation');
      }
    } catch (err) {
      console.error('Send quotation error:', err);
      setError('Failed to connect to server. Please check your connection.');
    }
  };

  const handleConvertToInvoice = async (quotation) => {
    if (!quotation.customer_id) {
      alert('Please select a customer first');
      return;
    }

    try {
      const invoiceData = {
        customer_id: quotation.customer_id,
        quotation_number: quotation.quotation_number,
        total_amount: quotation.total_amount,
        items: quotation.items
      };

      const response = await api.post(api.endpoints.invoices.create, invoiceData);
      console.log('Convert to invoice response:', response);

      if (response.success || response.id) {
        alert('Quotation converted to invoice successfully!');
      } else {
        setError(response.message || 'Failed to convert to invoice');
      }
    } catch (err) {
      console.error('Convert to invoice error:', err);
      setError('Failed to connect to server. Please check your connection.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'info';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const calculateItemTotal = (item) => {
    const rate = parseFloat(item.rate_per_day || 0);
    const quantity = parseInt(item.quantity || 1);
    const days = parseInt(item.days || 1);
    return rate * quantity * days;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 200px)' }}>
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
                    <TableCell>Quote #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Event Name</TableCell>
                    <TableCell>Event Date</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotations.map((quotation) => (
                    <TableRow key={quotation.id} hover>
                      <TableCell>
                        {quotation.quotation_number || `QT-${String(quotation.id).padStart(4, '0')}`}
                      </TableCell>
                      <TableCell>
                        {quotation.customer_name || '-'}
                      </TableCell>
                      <TableCell>
                        {quotation.event_name || '-'}
                      </TableCell>
                      <TableCell>
                        {quotation.event_date ? quotation.event_date.split('T')[0] : '-'}
                      </TableCell>
                      <TableCell>
                        PKR {parseFloat(quotation.total_amount || 0).toFixed(2).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={quotation.status}
                          color={getStatusColor(quotation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(quotation)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Convert to Invoice">
                            <IconButton size="small" onClick={() => handleConvertToInvoice(quotation)}>
                              <MoneyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send">
                            <IconButton size="small" onClick={() => handleSend(quotation.id)}>
                              <SendIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print">
                            <IconButton size="small">
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(quotation.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {quotations.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="textSecondary">
                  No quotations found. Click "New Quotation" to create one.
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Typography variant="body2" sx={{ mr: 2 }}>
                Page {page} of {Math.ceil(totalQuotations / ITEMS_PER_PAGE)} ({totalQuotations} total)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  disabled={page * ITEMS_PER_PAGE >= totalQuotations}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuotation ? 'Edit Quotation' : 'New Quotation'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Customer</InputLabel>
                  <Select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>Select a customer...</em>
                    </MenuItem>
                    {/* This would be populated from API */}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Name"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Location"
                  value={formData.event_location}
                  onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Event Date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Validity Date"
                  value={formData.validity_date}
                  onChange={(e) => setFormData({ ...formData, validity_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="sent">Sent</MenuItem>
                    <MenuItem value="accepted">Accepted</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Terms"
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Quotation Items
              </Typography>

              {formData.items.map((item, index) => (
                <Grid item xs={12} key={index} sx={{ border: '1px solid #ddd', p: 1, borderRadius: 1, mb: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Item Name"
                        value={item.item_name}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].item_name = e.target.value;
                          setFormData({ ...formData, items: newItems });
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].quantity = parseInt(e.target.value) || 1;
                          setFormData({ ...formData, items: newItems });
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Rate/Day"
                        value={item.rate_per_day}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].rate_per_day = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, items: newItems });
                        }}
                        size="small"
                        InputProps={{ startAdornment: <span style={{ fontSize: 12 }}>PKR</span> }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Rate/Event"
                        value={item.rate_per_event}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].rate_per_event = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, items: newItems });
                        }}
                        size="small"
                        InputProps={{ startAdornment: <span style={{ fontSize: 12 }}>PKR</span> }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Days"
                        value={item.days}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].days = parseInt(e.target.value) || 1;
                          setFormData({ ...formData, items: newItems });
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Notes"
                        value={item.notes || ''}
                        onChange={(e) => {
                          const newItems = [...formData.items];
                          newItems[index].notes = e.target.value;
                          setFormData({ ...formData, items: newItems });
                        }}
                        size="small"
                        multiline
                        rows={1}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                      {formData.items.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveItem(index)}
                          color="error"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  variant="outlined"
                  size="small"
                >
                  Add Item
                </Button>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingQuotation ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        message={error}
      />
    </Container>
  );
}
