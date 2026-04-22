import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  CircularProgress,
  Alert,
  Autocomplete,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Box as MuiBox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../api';
import { useOutletContext } from 'react-router-dom';

const ITEMS_PER_PAGE = 20;

const Inventory = () => {
  const { setHeaderActions } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemTypeFilter, setItemTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchingName, setSearchingName] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    total_quantity: '',
    min_stock_level: '',
    item_type: 'rentable',
    unit: 'pcs',
    is_active: true,
    tag: '',
    rate_type: 'per_day',
    rate: 0,
    per_day_rate: 0,
    per_event_rate: 0
  });
  const [rateType, setRateType] = useState('per_day');

  useEffect(() => {
    // Set header actions
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={itemTypeFilter}
              label="Type"
              onChange={(e) => setItemTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="rentable">Rentable</MenuItem>
              <MenuItem value="consumable">Consumables</MenuItem>
              <MenuItem value="tool">Tools</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="small"
          >
            Add Item
          </Button>
        </>
      );
    }
  }, [searchTerm, itemTypeFilter, setHeaderActions]);

  useEffect(() => {
    fetchItems();
  }, [page, itemTypeFilter, searchTerm]);

  const fetchItems = async () => {
    setLoading(true);
    setError('');

    try {
      let endpoint = api.endpoints.inventory.list;

      // Apply filters
      const params = {
        page: page,
        page_size: ITEMS_PER_PAGE
      };

      if (itemTypeFilter !== 'all') {
        params.item_type = itemTypeFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get(endpoint, params);
      console.log('Fetch items response:', response);

      // Handle both wrapped and flat responses
      if (response.success && response.data) {
        setItems(response.data.items || []);
        setTotalItems(response.data.pagination?.total || 0);
      } else if (Array.isArray(response)) {
        // Backend returns flat array
        setItems(response);
        setTotalItems(response.length);
      } else if (response.items) {
        // Backend returns object with items
        setItems(response.items);
        setTotalItems(response.total || response.items.length);
      } else {
        setError('Failed to load inventory items');
      }
    } catch (err) {
      setError('Failed to connect to server. Please check your connection.');
      console.error('Inventory error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNameSuggestions = async (search) => {
    try {
      const response = await api.get('/api/inventory/search', { search, limit: 10 });
      if (response.success && response.data) {
        setNameSuggestions(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching name suggestions:', err);
    }
  };

  const fetchCategorySuggestions = async (search) => {
    try {
      const response = await api.get('/api/inventory/categories/search', { search, limit: 10 });
      if (response.success && response.data) {
        setCategorySuggestions(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching category suggestions:', err);
    }
  };

  const fetchTagSuggestions = async (search) => {
    try {
      const response = await api.get('/api/inventory/tags/search', { search, limit: 10 });
      if (response.success && response.data) {
        setTagSuggestions(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching tag suggestions:', err);
    }
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      // Determine rate type based on which rate is set
      const rateType = item.per_day_rate > 0 ? 'per_day' : (item.per_event_rate > 0 ? 'per_event' : 'per_day');
      setFormData({
        name: item.name,
        category_id: item.category_id || '',
        total_quantity: item.total_quantity,
        per_day_rate: item.per_day_rate || 0,
        per_event_rate: item.per_event_rate || 0,
        min_stock_level: item.min_stock_level || '',
        item_type: item.item_type,
        unit: item.unit || 'pcs',
        is_active: item.is_active,
        tag: item.tag || '',
        rate_type: rateType,
        rate: rateType === 'per_day' ? (item.per_day_rate || 0) : (item.per_event_rate || 0)
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category_id: '',
        total_quantity: '',
        per_day_rate: 0,
        per_event_rate: 0,
        min_stock_level: '',
        item_type: 'rentable',
        unit: 'pcs',
        is_active: true,
        tag: '',
        rate_type: 'per_day',
        rate: 0
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        ...formData,
        total_quantity: parseInt(formData.total_quantity),
        // Set rates based on rate_type
        per_day_rate: formData.rate_type === 'per_day' ? parseFloat(formData.rate) : parseFloat(formData.per_day_rate) || 0,
        per_event_rate: formData.rate_type === 'per_event' ? parseFloat(formData.rate) : parseFloat(formData.per_event_rate) || 0,
        min_stock_level: formData.min_stock_level ? parseInt(formData.min_stock_level) : 5,
        // Convert empty strings to null for optional integer fields
        category_id: formData.category_id ? (typeof formData.category_id === 'string' ? null : parseInt(formData.category_id)) : null,
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        // Convert empty strings to null for optional string fields
        tag_serial: formData.tag_serial || null,
        description: formData.description || null,
        supplier: formData.supplier || null,
        unit: formData.unit || 'pcs',
        tag: formData.tag || null
      };

      console.log('Submitting item:', data);

      let response;
      if (editingItem) {
        response = await api.put(`${api.endpoints.inventory.update(editingItem.id)}`, data);
      } else {
        response = await api.post(api.endpoints.inventory.create, data);
      }

      console.log('Item save response:', response);

      // Handle both wrapped and flat responses
      if (response.success || response.id) {
        // Backend returns flat ItemResponse with id
        handleCloseDialog();
        fetchItems();
      } else {
        setError(response.message || 'Failed to save item');
      }
    } catch (err) {
      setError('Failed to connect to server. Please check your connection.');
      console.error('Save item error:', err);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await api.delete(api.endpoints.inventory.delete(itemId));
      console.log('Delete response:', response);

      // Handle both wrapped and flat responses
      if (response.success || response.detail === 'Item deleted successfully') {
        fetchItems();
      } else {
        setError(response.message || 'Failed to delete item');
      }
    } catch (err) {
      setError('Failed to connect to server. Please check your connection.');
      console.error('Delete item error:', err);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'rentable':
        return 'success';
      case 'consumable':
        return 'warning';
      case 'tool':
        return 'info';
      default:
        return 'default';
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={60} />
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
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Total Qty</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell>Rented</TableCell>
                    <TableCell>Day Rate</TableCell>
                    <TableCell>Event Rate</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Chip label={item.item_type} color={getTypeColor(item.item_type)} size="small" />
                      </TableCell>
                      <TableCell>{item.category_name || '-'}</TableCell>
                      <TableCell>{item.total_quantity}</TableCell>
                      <TableCell>{item.available_quantity || 0}</TableCell>
                      <TableCell>{item.rented_quantity || 0}</TableCell>
                      <TableCell>PKR {item.per_day_rate?.toLocaleString()}</TableCell>
                      <TableCell>PKR {item.per_event_rate?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.is_active ? 'Active' : 'Inactive'}
                          color={item.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => handleOpenDialog(item)}
                          startIcon={<EditIcon />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDelete(item.id)}
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                />
              </Box>
            )}
          </>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Autocomplete
              fullWidth
              freeSolo
              options={nameSuggestions}
              getOptionLabel={(option) => typeof option === 'object' ? option.name : option}
              value={formData.name}
              onInputChange={(event, newValue) => {
                setFormData({ ...formData, name: newValue });
                // Fetch suggestions as user types
                if (newValue && newValue.length > 2) {
                  fetchNameSuggestions(newValue);
                }
              }}
              onChange={(event, newValue) => {
                if (typeof newValue === 'object' && newValue) {
                  // User selected existing item
                  setFormData({
                    ...formData,
                    name: newValue.name,
                    category_id: newValue.category_id || '',
                    unit: newValue.unit || 'pcs',
                    rate_type: newValue.rate_type || 'per_day',
                    rate: newValue.rate || 0,
                    tag: newValue.tag || ''
                  });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Item Name"
                  margin="normal"
                  required
                  helperText="Search existing items or enter new name"
                />
              )}
            />
            
            <Autocomplete
              fullWidth
              freeSolo
              options={categorySuggestions}
              getOptionLabel={(option) => typeof option === 'object' ? option.name : option}
              value={formData.category_id}
              onInputChange={(event, newValue) => {
                setFormData({ ...formData, category_id: newValue });
                if (newValue && newValue.length > 2) {
                  fetchCategorySuggestions(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Category"
                  margin="normal"
                  helperText="Search existing categories or enter new category"
                />
              )}
            />

            <Autocomplete
              fullWidth
              freeSolo
              options={tagSuggestions}
              getOptionLabel={(option) => typeof option === 'object' ? option.name : option}
              value={formData.tag}
              onInputChange={(event, newValue) => {
                setFormData({ ...formData, tag: newValue });
                if (newValue && newValue.length > 2) {
                  fetchTagSuggestions(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tag"
                  margin="normal"
                  helperText="Search existing tags or enter new tag"
                />
              )}
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.item_type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
              >
                <MenuItem value="rentable">Rentable</MenuItem>
                <MenuItem value="consumable">Consumable</MenuItem>
                <MenuItem value="tool">Tool</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Total Quantity"
              type="number"
              value={formData.total_quantity}
              onChange={(e) => setFormData({ ...formData, total_quantity: e.target.value })}
              margin="normal"
              required
            />

            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Rate Type</FormLabel>
              <RadioGroup
                row
                value={formData.rate_type}
                onChange={(e) => setFormData({ ...formData, rate_type: e.target.value })}
              >
                <FormControlLabel value="per_day" control={<Radio />} label="Per Day" />
                <FormControlLabel value="per_event" control={<Radio />} label="Per Event" />
              </RadioGroup>
            </FormControl>

            <TextField
              fullWidth
              label={`${formData.rate_type === 'per_day' ? 'Per Day' : 'Per Event'} Rate (PKR)`}
              type="number"
              value={formData.rate}
              onChange={(e) => {
                const rate = parseFloat(e.target.value) || 0;
                setFormData({ ...formData, rate });
                // Update both rate fields based on selected type
                if (formData.rate_type === 'per_day') {
                  setFormData({ ...formData, rate, per_day_rate: rate, per_event_rate: 0 });
                } else {
                  setFormData({ ...formData, rate, per_day_rate: 0, per_event_rate: rate });
                }
              }}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Minimum Stock Level"
              type="number"
              value={formData.min_stock_level}
              onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
              margin="normal"
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Unit</InputLabel>
              <Select
                value={formData.unit}
                label="Unit"
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <MenuItem value="pcs">Pieces (pcs)</MenuItem>
                <MenuItem value="kg">Kilograms (kg)</MenuItem>
                <MenuItem value="packet">Packet</MenuItem>
                <MenuItem value="feet">Feet</MenuItem>
                <MenuItem value="meter">Meter</MenuItem>
                <MenuItem value="liter">Liter</MenuItem>
                <MenuItem value="box">Box</MenuItem>
                <MenuItem value="set">Set</MenuItem>
                <MenuItem value="pair">Pair</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Inventory;
