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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  LocalGasStation as FuelIcon,
  Restaurant as FoodIcon,
  DirectionsCar as TransportIcon,
  ShoppingBag as MiscIcon,
  AttachMoney as MoneyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Person as EmployeeIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';

export default function Expenses() {
  const { setHeaderActions } = useOutletContext();
  const [openExpense, setOpenExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const expenses = [
    { id: 1, date: '2026-04-20', category: 'Transport', type: 'daily', description: 'Fuel for delivery van', amount: 5000, employee: null, isDeductible: false },
    { id: 2, date: '2026-04-19', category: 'Food', type: 'daily', description: 'Team lunch for event setup', amount: 2500, employee: null, isDeductible: false },
    { id: 3, date: '2026-04-18', category: 'Electricity', type: 'monthly', description: 'April electricity bill', amount: 15000, employee: null, isDeductible: false },
    { id: 4, date: '2026-04-17', category: 'Mobile', type: 'employee', description: 'Ahmed - Monthly mobile bill', amount: 1500, employee: 'Ahmed', isDeductible: true },
    { id: 5, date: '2026-04-16', category: 'Transport', type: 'daily', description: 'Courier charges', amount: 800, employee: null, isDeductible: false },
    { id: 6, date: '2026-04-15', category: 'Misc', type: 'daily', description: 'Office supplies', amount: 2000, employee: null, isDeductible: false },
    { id: 7, date: '2026-04-14', category: 'Internet', type: 'monthly', description: 'April internet bill', amount: 5000, employee: null, isDeductible: false },
    { id: 8, date: '2026-04-13', category: 'Package', type: 'employee', description: 'Bilal - Data package', amount: 2000, employee: 'Bilal', isDeductible: true },
  ];

  const categories = ['Transport', 'Food', 'Electricity', 'Rent', 'Internet', 'Mobile', 'Package', 'Misc'];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Transport': return <TransportIcon />;
      case 'Food': return <FoodIcon />;
      case 'Electricity': return <MoneyIcon />;
      case 'Rent': return <MoneyIcon />;
      case 'Internet': return <MoneyIcon />;
      case 'Mobile':
      case 'Package':
        return <EmployeeIcon />;
      default: return <MiscIcon />;
    }
  };

  useEffect(() => {
    // Set header actions
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Transport">Transport</MenuItem>
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Electricity">Electricity</MenuItem>
              <MenuItem value="Rent">Rent</MenuItem>
              <MenuItem value="Internet">Internet</MenuItem>
              <MenuItem value="Mobile">Mobile</MenuItem>
              <MenuItem value="Package">Package</MenuItem>
              <MenuItem value="Misc">Misc</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenExpense(true)}
            size="small"
          >
            Add Expense
          </Button>
        </>
      );
    }
  }, [searchTerm, selectedCategory, setHeaderActions]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyExpenses = expenses.filter(e => e.type === 'daily').reduce((sum, e) => sum + e.amount, 0);
  const monthlyExpenses = expenses.filter(e => e.type === 'monthly').reduce((sum, e) => sum + e.amount, 0);
  const employeeExpenses = expenses.filter(e => e.type === 'employee').reduce((sum, e) => sum + e.amount, 0);

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            Expense Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track daily, monthly, and employee-related expenses
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenExpense(true)}
          sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
        >
          Add Expense
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <MoneyIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Total Expenses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(totalExpenses / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <CalendarIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Daily Expenses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(dailyExpenses / 1000).toFixed(0)}k
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
                Monthly Fixed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(monthlyExpenses / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <EmployeeIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Employee Related
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(employeeExpenses / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Expense History
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Search expenses..."
                  size="small"
                  sx={{ minWidth: 250, borderRadius: 8 }}
                />
                <Select size="small" defaultValue="all" sx={{ minWidth: 150 }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
                <Select size="small" defaultValue="all" sx={{ minWidth: 150 }} value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="employee">Employee</MenuItem>
                </Select>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Deductible</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses
                      .filter((e) => {
                        if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
                        if (selectedType !== 'all' && e.type !== selectedType) return false;
                        return true;
                      })
                      .map((expense) => (
                      <TableRow key={expense.id} hover>
                        <TableCell>{expense.date}</TableCell>
                        <TableCell>
                          <Chip
                            label={expense.category}
                            size="small"
                            icon={getCategoryIcon(expense.category)}
                            sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{expense.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={expense.type}
                            size="small"
                            sx={{
                              bgcolor:
                                expense.type === 'daily'
                                  ? '#dcfce7'
                                  : expense.type === 'monthly'
                                  ? '#fef3c7'
                                  : '#e0e7ff',
                              color:
                                expense.type === 'daily'
                                  ? '#166534'
                                  : expense.type === 'monthly'
                                  ? '#92400e'
                                  : '#4338ca',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>{expense.employee || '-'}</TableCell>
                        <TableCell>
                          {expense.isDeductible ? (
                            <Chip label="Yes" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600 }} />
                          ) : (
                            <Chip label="No" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#ef4444' }}>
                          PKR {expense.amount.toLocaleString()}
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Category Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {categories.slice(0, 7).map((category) => {
                  const categoryTotal = expenses
                    .filter((e) => e.category === category)
                    .reduce((sum, e) => sum + e.amount, 0);
                  const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0;
                  return (
                    <Paper key={category} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#e0e7ff' }}>
                            {getCategoryIcon(category)}
                          </Avatar>
                          <Typography variant="body1" fontWeight={600}>{category}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {percentage.toFixed(0)}%
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                        PKR {categoryTotal.toLocaleString()}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openExpense} onClose={() => setOpenExpense(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Expense</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="Date" fullWidth type="date" size="small" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Select label="Category" fullWidth size="small" defaultValue="" displayEmpty>
                  <MenuItem value="" disabled>Select Category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" fullWidth required multiline rows={2} placeholder="Describe the expense..." />
              </Grid>
              <Grid item xs={12} md={6}>
                <Select label="Expense Type" fullWidth size="small" defaultValue="" displayEmpty>
                  <MenuItem value="" disabled>Select Type</MenuItem>
                  <MenuItem value="daily">Daily Expense</MenuItem>
                  <MenuItem value="monthly">Monthly Fixed</MenuItem>
                  <MenuItem value="employee">Employee Related</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Amount (PKR)" fullWidth type="number" required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Employee Name" fullWidth placeholder="For employee-related expenses" />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Checkbox />}
                  label="Salary Deductible"
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExpense(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Add Expense
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
