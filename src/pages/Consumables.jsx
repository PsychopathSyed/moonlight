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
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Build as ToolIcon,
  Cable as CableIcon,
  Inventory as ConsumableIcon,
  LocalOffer as TagIcon,
  ShoppingBasket as OrderIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TrendingUp as UsageIcon,
} from '@mui/icons-material';

export default function Consumables() {
  const [openItem, setOpenItem] = useState(false);
  const [openReorder, setOpenReorder] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const consumables = [
    { id: 1, name: 'Electrical Tape', category: 'Consumable', stock: 45, unit: 'rolls', minStock: 20, avgUsage: 15, lastOrder: '2026-03-15', supplier: 'Electrical Supplies Co' },
    { id: 2, name: 'Cable Ties', category: 'Consumable', stock: 200, unit: 'pcs', minStock: 100, avgUsage: 30, lastOrder: '2026-04-01', supplier: 'Hardware Depot' },
    { id: 3, name: 'Solder Wire', category: 'Consumable', stock: 8, unit: 'rolls', minStock: 10, avgUsage: 5, lastOrder: '2026-02-20', supplier: 'Electrical Supplies Co' },
    { id: 4, name: 'XLR Connectors', category: 'Tool', stock: 25, unit: 'pcs', minStock: 15, avgUsage: 8, lastOrder: '2026-03-28', supplier: 'Pro Audio Parts' },
    { id: 5, name: 'Power Cables (3m)', category: 'Consumable', stock: 35, unit: 'pcs', minStock: 20, avgUsage: 12, lastOrder: '2026-04-05', supplier: 'Cable World' },
    { id: 6, name: 'Wire Strippers', category: 'Tool', stock: 5, unit: 'pcs', minStock: 3, avgUsage: 1, lastOrder: '2026-01-10', supplier: 'Hardware Depot' },
    { id: 7, name: 'Multimeter', category: 'Tool', stock: 2, unit: 'pcs', minStock: 2, avgUsage: 0, lastOrder: '2025-12-15', supplier: 'Electrical Supplies Co' },
    { id: 8, name: 'Extension Cords (10m)', category: 'Consumable', stock: 18, unit: 'pcs', minStock: 15, avgUsage: 10, lastOrder: '2026-03-20', supplier: 'Cable World' },
  ];

  const reorderHistory = [
    { id: 1, date: '2026-04-01', item: 'Cable Ties', qty: 200, supplier: 'Hardware Depot', cost: 2500, status: 'received' },
    { id: 2, date: '2026-03-28', item: 'XLR Connectors', qty: 25, supplier: 'Pro Audio Parts', cost: 15000, status: 'received' },
    { id: 3, date: '2026-03-20', item: 'Extension Cords (10m)', qty: 20, supplier: 'Cable World', cost: 8000, status: 'received' },
    { id: 4, date: '2026-03-15', item: 'Electrical Tape', qty: 50, supplier: 'Electrical Supplies Co', cost: 3000, status: 'received' },
    { id: 5, date: '2026-02-20', item: 'Solder Wire', qty: 10, supplier: 'Electrical Supplies Co', cost: 4000, status: 'received' },
  ];

  const usageStats = {
    '6months': [
      { month: 'Nov', tapes: 18, ties: 35, solder: 6, connectors: 10, cables: 15, total: 84 },
      { month: 'Dec', tapes: 22, ties: 40, solder: 7, connectors: 12, cables: 18, total: 99 },
      { month: 'Jan', tapes: 15, ties: 28, solder: 5, connectors: 8, cables: 12, total: 68 },
      { month: 'Feb', tapes: 20, ties: 38, solder: 8, connectors: 10, cables: 16, total: 92 },
      { month: 'Mar', tapes: 25, ties: 45, solder: 9, connectors: 14, cables: 20, total: 113 },
      { month: 'Apr', tapes: 12, ties: 22, solder: 4, connectors: 6, cables: 10, total: 54 },
    ],
  };

  const getStockLevel = (stock, minStock) => {
    const ratio = stock / minStock;
    if (ratio >= 2) return { level: 'Good', color: '#10b981', value: 100 };
    if (ratio >= 1) return { level: 'Medium', color: '#f59e0b', value: 60 };
    return { level: 'Low', color: '#ef4444', value: 30 };
  };

  const getCategoryIcon = (category) => {
    return category === 'Consumable' ? <ConsumableIcon /> : <ToolIcon />;
  };

  const lowStockItems = consumables.filter((c) => c.stock < c.minStock);

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            Tools & Consumables
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track tools, consumables, and usage analysis
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenItem(true)}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Add Item
          </Button>
          <Button
            variant="contained"
            startIcon={<OrderIcon />}
            onClick={() => setOpenReorder(true)}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            Reorder
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <ConsumableIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Total Items
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {consumables.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <ConsumableIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Consumables
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {consumables.filter((c) => c.category === 'Consumable').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <ToolIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Tools
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {consumables.filter((c) => c.category === 'Tool').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <TagIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Low Stock
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {lowStockItems.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {lowStockItems.length > 0 && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#fee2e2', border: '2px solid #ef4444', borderRadius: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TagIcon sx={{ color: '#ef4444', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#991b1b' }}>
                Low Stock Alert
              </Typography>
              <Typography variant="body2" color="#991b1b">
                {lowStockItems.length} items below minimum stock level. Consider reordering.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<OrderIcon />}
              sx={{ ml: 'auto', borderRadius: 8, background: '#ef4444' }}
              onClick={() => setOpenReorder(true)}
            >
              Reorder Now
            </Button>
          </Box>
        </Paper>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Tools & Consumables Inventory
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search items..."
              size="small"
              sx={{ minWidth: 250, borderRadius: 8 }}
            />
            <Select size="small" defaultValue="all" sx={{ minWidth: 150 }}>
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="Consumable">Consumables</MenuItem>
              <MenuItem value="Tool">Tools</MenuItem>
            </Select>
            <Select size="small" defaultValue="all" sx={{ minWidth: 150 }}>
              <MenuItem value="all">All Stock Levels</MenuItem>
              <MenuItem value="low">Low Stock</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="good">Good</MenuItem>
            </Select>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Min Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stock Level</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Avg/Month</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Order</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Supplier</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consumables.map((item) => {
                  const stockLevel = getStockLevel(item.stock, item.minStock);
                  return (
                    <TableRow key={item.id} hover sx={{ bgcolor: item.stock < item.minStock ? '#fef3c750' : 'transparent' }}>
                      <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.category}
                          size="small"
                          icon={getCategoryIcon(item.category)}
                          sx={{ bgcolor: item.category === 'Consumable' ? '#e0e7ff' : '#fef3c7', color: item.category === 'Consumable' ? '#4338ca' : '#92400e', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: item.stock < item.minStock ? '#ef4444' : '#1e293b' }}>
                        {item.stock} {item.unit}
                      </TableCell>
                      <TableCell>{item.minStock} {item.unit}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={stockLevel.value}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              width: 80,
                              bgcolor: '#e2e8f0',
                            }}
                          />
                          <Chip
                            label={stockLevel.level}
                            size="small"
                            sx={{
                              bgcolor: stockLevel.color + '20',
                              color: stockLevel.color,
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{item.avgUsage} {item.unit}</TableCell>
                      <TableCell>{item.lastOrder}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Usage Analysis
                </Typography>
                <Select size="small" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                  <MenuItem value="6months">Last 6 Months</MenuItem>
                  <MenuItem value="12months">Last 12 Months</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tape</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Cable Ties</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Solder</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Connectors</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Cables</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usageStats[selectedPeriod]?.map((stat) => (
                      <TableRow key={stat.month} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{stat.month}</TableCell>
                        <TableCell>{stat.tapes}</TableCell>
                        <TableCell>{stat.ties}</TableCell>
                        <TableCell>{stat.solder}</TableCell>
                        <TableCell>{stat.connectors}</TableCell>
                        <TableCell>{stat.cables}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>{stat.total}</TableCell>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Reorder History
                </Typography>
                <IconButton size="small">
                  <UsageIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {reorderHistory.slice(0, 5).map((order) => (
                  <Paper key={order.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" fontWeight={600}>{order.item}</Typography>
                      <Chip label="Received" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600 }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {order.date} • {order.qty} pcs
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="#6366f1">
                        PKR {order.cost.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openItem} onClose={() => setOpenItem(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Item Name" fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <Select label="Category" fullWidth size="small" defaultValue="" displayEmpty>
                  <MenuItem value="" disabled>Select Category</MenuItem>
                  <MenuItem value="Consumable">Consumable</MenuItem>
                  <MenuItem value="Tool">Tool</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Current Stock" fullWidth type="number" required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Unit" fullWidth placeholder="e.g., pcs, rolls" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Minimum Stock" fullWidth type="number" required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Avg Monthly Usage" fullWidth type="number" placeholder="For usage tracking" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Supplier" fullWidth placeholder="Supplier name" />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Notes" fullWidth multiline rows={2} placeholder="Any special notes..." />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItem(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReorder} onClose={() => setOpenReorder(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Reorder</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select items to reorder and specify quantity
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Select label="Select Item" fullWidth size="small" defaultValue="" displayEmpty>
              <MenuItem value="" disabled>Select Item</MenuItem>
              {lowStockItems.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name} ({item.stock} {item.unit})
                </MenuItem>
              ))}
            </Select>
            <TextField label="Quantity to Order" fullWidth type="number" required />
            <Select label="Supplier" fullWidth size="small" defaultValue="" displayEmpty>
              <MenuItem value="" disabled>Select Supplier</MenuItem>
              <MenuItem value="Electrical Supplies Co">Electrical Supplies Co</MenuItem>
              <MenuItem value="Hardware Depot">Hardware Depot</MenuItem>
              <MenuItem value="Pro Audio Parts">Pro Audio Parts</MenuItem>
              <MenuItem value="Cable World">Cable World</MenuItem>
            </Select>
            <TextField label="Estimated Cost (PKR)" fullWidth type="number" />
            <TextField label="Notes" fullWidth multiline rows={2} placeholder="Any special requirements..." />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReorder(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<OrderIcon />}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
