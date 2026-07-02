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
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Login as InIcon,
  Logout as OutIcon,
  LocalShipping as VehicleIcon,
  Inventory as ItemsIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

const emptyForm = {
  gate_pass_date: '',
  person_name: '',
  vehicle_number: '',
  purpose: '',
  reference_number: '',
  remarks: '',
};
const emptyLine = { item_id: '', item_name: '', quantity: '', unit: 'pcs' };

export default function GatePass({ type }) {
  const { setHeaderActions } = useOutletContext();
  const isIn = type === 'in';
  const title = isIn ? 'Gate Pass — Inward' : 'Gate Pass — Outward';
  const accent = isIn
    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

  const [gatePasses, setGatePasses] = useState([]);
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [lines, setLines] = useState([{ ...emptyLine }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadGatePasses = async () => {
    const response = await api.get(api.endpoints.gatepass.list, { type });
    setGatePasses(response.data?.gate_passes || []);
  };

  const loadItems = async () => {
    const response = await api.get(api.endpoints.inventory.list, { page_size: 100 });
    setItems(response.data?.items || []);
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([loadGatePasses(), loadItems()])
      .catch(() => setError('Failed to load gate passes. Please check your connection.'))
      .finally(() => setLoading(false));
  }, [type]);

  useEffect(() => {
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search gate passes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            size="small"
          >
            New Gate Pass
          </Button>
        </>
      );
    }
    return () => setHeaderActions && setHeaderActions(null);
  }, [searchTerm, type, setHeaderActions]);

  const updateLine = (index, patch) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const handleCreate = async () => {
    try {
      setError('');
      const validLines = lines.filter((l) => (l.item_id || l.item_name) && Number(l.quantity) > 0);
      const response = await api.post(api.endpoints.gatepass.create, {
        type,
        ...form,
        gate_pass_date: form.gate_pass_date || undefined,
        items: validLines.map((l) => ({
          item_id: l.item_id || null,
          item_name: l.item_name || undefined,
          quantity: Number(l.quantity),
          unit: l.unit,
        })),
      });
      if (response.success) {
        setForm(emptyForm);
        setLines([{ ...emptyLine }]);
        setOpenDialog(false);
        await Promise.all([loadGatePasses(), loadItems()]);
      } else {
        setError(response.detail || response.message || 'Failed to create gate pass');
      }
    } catch {
      setError('Failed to create gate pass. Please check your connection.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this gate pass? Stock adjustments will be reverted.')) return;
    try {
      await api.delete(api.endpoints.gatepass.delete(id));
      await Promise.all([loadGatePasses(), loadItems()]);
    } catch {
      setError('Failed to delete gate pass.');
    }
  };

  const visiblePasses = gatePasses.filter((gp) =>
    !searchTerm ||
    gp.gate_pass_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (gp.person_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (gp.purpose || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = gatePasses.filter((gp) => gp.gate_pass_date === today).length;
  const totalQuantity = gatePasses.reduce((sum, gp) => sum + gp.total_quantity, 0);

  const hasValidLine = lines.some((l) => (l.item_id || l.item_name) && Number(l.quantity) > 0);

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isIn
              ? 'Record items coming back into the store (returns, new stock, repairs)'
              : 'Record items leaving the store (dispatch, repairs, transfers)'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: 8, background: accent }}
        >
          New Gate Pass
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Gate Passes', value: gatePasses.length, icon: isIn ? <InIcon /> : <OutIcon />, bg: accent },
          { label: 'Today', value: todayCount, icon: <CalendarIcon />, bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
          { label: `Items ${isIn ? 'Received' : 'Sent Out'}`, value: totalQuantity, icon: <ItemsIcon />, bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
        ].map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.label}>
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

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Gate Pass Register
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Gate Pass #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Person</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visiblePasses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ color: '#64748b', py: 4 }}>
                      No gate passes recorded yet
                    </TableCell>
                  </TableRow>
                )}
                {visiblePasses.map((gp) => (
                  <TableRow key={gp.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Chip
                        label={gp.gate_pass_number}
                        size="small"
                        icon={isIn ? <InIcon /> : <OutIcon />}
                        sx={{
                          bgcolor: isIn ? '#dcfce7' : '#fee2e2',
                          color: isIn ? '#166534' : '#991b1b',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{gp.gate_pass_date}</TableCell>
                    <TableCell sx={{ maxWidth: 250 }}>
                      {gp.items.map((gi) => `${gi.item_name} (${gi.quantity})`).join(', ')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>{gp.total_quantity}</TableCell>
                    <TableCell>{gp.person_name || '-'}</TableCell>
                    <TableCell>
                      {gp.vehicle_number ? (
                        <Chip label={gp.vehicle_number} size="small" icon={<VehicleIcon />}
                          sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 600 }} />
                      ) : '-'}
                    </TableCell>
                    <TableCell>{gp.purpose || '-'}</TableCell>
                    <TableCell>{gp.reference_number || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDelete(gp.id)}>
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{isIn ? 'New Inward Gate Pass' : 'New Outward Gate Pass'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Date" fullWidth type="date" size="small" InputLabelProps={{ shrink: true }}
                  value={form.gate_pass_date}
                  onChange={(e) => setForm({ ...form, gate_pass_date: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label={isIn ? 'Received From / Carried By' : 'Carried By'} fullWidth size="small"
                  value={form.person_name}
                  onChange={(e) => setForm({ ...form, person_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Vehicle Number" fullWidth size="small"
                  value={form.vehicle_number}
                  onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Purpose" fullWidth size="small"
                  placeholder={isIn ? 'e.g. Event return, New purchase' : 'e.g. Event dispatch, Repair'}
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Reference (Order / Invoice #)" fullWidth size="small"
                  value={form.reference_number}
                  onChange={(e) => setForm({ ...form, reference_number: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Remarks" fullWidth size="small"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>Items</Typography>
            {lines.map((line, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                <Grid item xs={12} md={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Item</InputLabel>
                    <Select label="Item" value={line.item_id}
                      onChange={(e) => {
                        const item = items.find((i) => i.id === e.target.value);
                        updateLine(index, {
                          item_id: e.target.value,
                          item_name: item ? item.name : line.item_name,
                          unit: item?.unit || line.unit,
                        });
                      }}>
                      <MenuItem value="">Unlisted item (type name)</MenuItem>
                      {items.map((i) => (
                        <MenuItem key={i.id} value={i.id}>
                          {i.name} (available: {i.available_quantity ?? '-'})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="Item Name" fullWidth size="small" disabled={!!line.item_id}
                    value={line.item_name}
                    onChange={(e) => updateLine(index, { item_name: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={2}>
                  <TextField label="Qty" fullWidth size="small" type="number"
                    value={line.quantity}
                    onChange={(e) => updateLine(index, { quantity: e.target.value })} />
                </Grid>
                <Grid item xs={6} md={2}>
                  <IconButton color="error" disabled={lines.length === 1}
                    onClick={() => setLines(lines.filter((_, i) => i !== index))}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button startIcon={<AddIcon />} size="small" sx={{ alignSelf: 'flex-start' }}
              onClick={() => setLines([...lines, { ...emptyLine }])}>
              Add Item Row
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={isIn ? <InIcon /> : <OutIcon />}
            onClick={handleCreate}
            disabled={!hasValidLine}
            sx={{ borderRadius: 8, background: accent }}
          >
            Create Gate Pass
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
