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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  AssignmentReturn as ReturnIcon,
  CheckCircle as GoodIcon,
  Warning as DamageIcon,
  RemoveCircle as MissingIcon,
  Person as CustomerIcon,
  Build as InternalIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  LocalShipping as DispatchIcon,
} from '@mui/icons-material';

export default function Returns() {
  const [openTally, setOpenTally] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const returns = [
    { id: 1, orderId: 'ORD-001', customer: 'Ali Corporation', event: 'Corporate Event', date: '2026-04-20', status: 'pending' },
    { id: 2, orderId: 'ORD-002', customer: 'Tech Events Ltd', event: 'Wedding Reception', date: '2026-04-18', status: 'pending' },
    { id: 3, orderId: 'ORD-003', customer: 'Wedding Planners', event: 'Birthday Party', date: '2026-04-15', status: 'completed' },
    { id: 4, orderId: 'ORD-004', customer: 'Party Makers', event: 'Conference', date: '2026-04-12', status: 'completed' },
  ];

  const returnItems = {
    1: [
      { id: 1, item: 'JBL Speakers 15"', category: 'Speakers', qty: 4, returned: 0, condition: 'pending', damage: null, responsibility: null },
      { id: 2, item: 'SMD LED Panel P3', category: 'Lights', qty: 6, returned: 0, condition: 'pending', damage: null, responsibility: null },
      { id: 3, item: 'Microphone Wireless', category: 'Microphones', qty: 3, returned: 0, condition: 'pending', damage: null, responsibility: null },
    ],
    2: [
      { id: 1, item: 'Moving Head Light', category: 'Lights', qty: 4, returned: 2, condition: 'partial', damage: 'Scratched lens', responsibility: 'customer' },
      { id: 2, item: 'Speaker Stand', category: 'Stands', qty: 8, returned: 8, condition: 'good', damage: null, responsibility: null },
    ],
  };

  const damageRecords = [
    { id: 1, orderId: 'ORD-002', item: 'Moving Head Light', damage: 'Scratched lens', qty: 2, responsibility: 'Customer', recovery: 'PKR 500', status: 'pending' },
    { id: 2, orderId: 'ORD-001', item: 'Speaker Cable', damage: 'Cut wire', qty: 1, responsibility: 'Internal', recovery: '-', status: 'write-off' },
    { id: 3, orderId: 'ORD-003', item: 'Microphone Stand', damage: 'Broken clip', qty: 1, responsibility: 'Internal', recovery: '-', status: 'repaired' },
  ];

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'good': return { bg: '#dcfce7', text: '#166534', icon: <GoodIcon /> };
      case 'partial': return { bg: '#fef3c7', text: '#92400e', icon: <WarningIcon /> };
      case 'damaged': return { bg: '#fee2e2', text: '#991b1b', icon: <DamageIcon /> };
      case 'missing': return { bg: '#fee2e2', text: '#991b1b', icon: <MissingIcon /> };
      default: return { bg: '#e0e7ff', text: '#4338ca', icon: <ViewIcon /> };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#dcfce7', text: '#166534' };
      case 'pending': return { bg: '#e0e7ff', text: '#4338ca' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            Return & Tally
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Process returns, track damage, and assign responsibility
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<DispatchIcon />}
          sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
        >
          View Active Orders
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <ReturnIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Pending Returns
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {returns.filter(r => r.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <GoodIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Good Returns
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                24
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <DamageIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Damaged Items
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {damageRecords.filter(d => d.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <MissingIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Missing Items
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                3
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Pending Returns
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {returns.filter(r => r.status === 'pending').map((return_) => (
                  <TableRow key={return_.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{return_.orderId}</TableCell>
                    <TableCell>{return_.customer}</TableCell>
                    <TableCell>{return_.event}</TableCell>
                    <TableCell>{return_.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={return_.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(return_.status).bg,
                          color: getStatusColor(return_.status).text,
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ReturnIcon />}
                        onClick={() => { setSelectedReturn(return_); setOpenTally(true); }}
                        sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                      >
                        Process Return
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Damage & Missing Records
            </Typography>
            <Button variant="outlined" size="small" sx={{ borderRadius: 8 }}>
              Export Report
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Damage Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Responsibility</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Recovery</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {damageRecords.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{record.orderId}</TableCell>
                    <TableCell>{record.item}</TableCell>
                    <TableCell sx={{ color: '#ef4444', fontWeight: 500 }}>{record.damage}</TableCell>
                    <TableCell>{record.qty}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.responsibility}
                        size="small"
                        icon={record.responsibility === 'Customer' ? <CustomerIcon /> : <InternalIcon />}
                        sx={{
                          bgcolor: record.responsibility === 'Customer' ? '#fef3c7' : '#e0e7ff',
                          color: record.responsibility === 'Customer' ? '#92400e' : '#4338ca',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{record.recovery}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.status}
                        size="small"
                        sx={{
                          bgcolor:
                            record.status === 'pending'
                              ? '#fef3c7'
                              : record.status === 'repaired'
                              ? '#dcfce7'
                              : '#f1f5f9',
                          color:
                            record.status === 'pending'
                              ? '#92400e'
                              : record.status === 'repaired'
                              ? '#166534'
                              : '#475569',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openTally} onClose={() => setOpenTally(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Process Return - {selectedReturn?.orderId}
          <Typography variant="body2" color="text.secondary">
            {selectedReturn?.customer} - {selectedReturn?.event}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Only owned inventory items will be added back to stock. Partner items are not added to inventory.
          </Alert>

          {selectedReturn && returnItems[selectedReturn.id] && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Items to Return
              </Typography>
              {returnItems[selectedReturn.id].map((item) => (
                <Paper key={item.id} sx={{ p: 2, mb: 2, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">Item</Typography>
                      <Typography variant="body1" fontWeight={600}>{item.item}</Typography>
                      <Chip label={item.category} size="small" sx={{ mt: 0.5, bgcolor: '#e0e7ff', color: '#4338ca' }} />
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="text.secondary">Quantity</Typography>
                      <Typography variant="body1" fontWeight={600}>{item.qty}</Typography>
                    </Grid>

                    <Grid item xs={12} md={2}>
                      <Typography variant="body2" color="text.secondary">Returned</Typography>
                      <TextField
                        type="number"
                        size="small"
                        defaultValue={item.returned}
                        inputProps={{ min: 0, max: item.qty }}
                        sx={{ width: 80 }}
                      />
                    </Grid>

                    <Grid item xs={12} md={5}>
                      <Typography variant="body2" color="text.secondary">Condition</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip
                          label="Good"
                          size="small"
                          icon={<GoodIcon />}
                          clickable
                          sx={{
                            bgcolor: item.condition === 'good' ? '#dcfce7' : '#f1f5f9',
                            color: item.condition === 'good' ? '#166534' : '#475569',
                          }}
                        />
                        <Chip
                          label="Damaged"
                          size="small"
                          icon={<DamageIcon />}
                          clickable
                          sx={{
                            bgcolor: item.condition === 'damaged' ? '#fee2e2' : '#f1f5f9',
                            color: item.condition === 'damaged' ? '#991b1b' : '#475569',
                          }}
                        />
                        <Chip
                          label="Missing"
                          size="small"
                          icon={<MissingIcon />}
                          clickable
                          sx={{
                            bgcolor: item.condition === 'missing' ? '#fee2e2' : '#f1f5f9',
                            color: item.condition === 'missing' ? '#991b1b' : '#475569',
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {(item.condition === 'damaged' || item.condition === 'missing') && (
                    <Box sx={{ mt: 2, pl: 2, borderLeft: 3, borderColor: '#ef4444' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Responsibility</Typography>
                          <Select size="small" fullWidth defaultValue="" displayEmpty>
                            <MenuItem value="" disabled>Select Responsibility</MenuItem>
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="internal">Internal</MenuItem>
                          </Select>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" color="text.secondary">Recovery Amount (PKR)</Typography>
                          <TextField size="small" fullWidth type="number" placeholder="0" />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Damage Description</Typography>
                          <TextField
                            size="small"
                            fullWidth
                            multiline
                            rows={2}
                            placeholder="Describe the damage..."
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Paper>
              ))}

              <Alert severity="warning" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  Owned items: {returnItems[selectedReturn.id].filter(i => i.condition === 'good').reduce((sum, i) => sum + i.qty, 0)} will be added back to stock
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTally(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<ReturnIcon />}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Complete Return
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
