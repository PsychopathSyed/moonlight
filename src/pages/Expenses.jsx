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
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Restaurant as FoodIcon,
  DirectionsCar as TransportIcon,
  ShoppingBag as MiscIcon,
  AttachMoney as MoneyIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as EmployeeIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

const emptyExpenseForm = {
  expense_date: '',
  category: '',
  description: '',
  type: '',
  amount: '',
  employee_id: '',
  is_salary_deductible: false,
};

const DEFAULT_CATEGORIES = ['Transport', 'Food', 'Electricity', 'Rent', 'Internet', 'Mobile', 'Package', 'Misc'];

export default function Expenses() {
  const { setHeaderActions } = useOutletContext();
  const [openExpense, setOpenExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadExpenses = async () => {
    const params = { page_size: 100 };
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedType !== 'all') params.type = selectedType;
    const response = await api.get('/api/expenses', params);
    setExpenses(response.data?.expenses || []);
  };

  const loadEmployees = async () => {
    const response = await api.get('/api/hr/employees', { page_size: 100 });
    setEmployees(response.data?.employees || []);
  };

  const loadCategories = async () => {
    const response = await api.get('/api/expenses/categories');
    if (response.data?.categories?.length) setCategories(response.data.categories);
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([loadExpenses(), loadEmployees(), loadCategories()])
      .catch(() => setError('Failed to load expenses. Please check your connection.'))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedType]);

  useEffect(() => {
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
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
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
    return () => setHeaderActions && setHeaderActions(null);
  }, [searchTerm, selectedCategory, categories, setHeaderActions]);

  const handleAddExpense = async () => {
    try {
      setError('');
      const response = await api.post('/api/expenses', {
        expense_date: expenseForm.expense_date || undefined,
        category: expenseForm.category,
        description: expenseForm.description,
        type: expenseForm.type,
        amount: Number(expenseForm.amount),
        employee_id: expenseForm.employee_id || null,
        is_salary_deductible: expenseForm.is_salary_deductible,
      });
      if (response.success) {
        setExpenseForm(emptyExpenseForm);
        setOpenExpense(false);
        await loadExpenses();
      } else {
        setError(response.detail || response.message || 'Failed to save expense');
      }
    } catch {
      setError('Failed to save expense. Please check your connection.');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/api/expenses/${expenseId}`);
      await loadExpenses();
    } catch {
      setError('Failed to delete expense.');
    }
  };

  const employeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.full_name : null;
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Transport': return <TransportIcon />;
      case 'Food': return <FoodIcon />;
      case 'Mobile':
      case 'Package':
        return <EmployeeIcon />;
      case 'Misc': return <MiscIcon />;
      default: return <MoneyIcon />;
    }
  };

  const visibleExpenses = expenses.filter((e) =>
    !searchTerm || (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Expenses', value: totalExpenses, icon: <MoneyIcon />, bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
          { label: 'Daily Expenses', value: dailyExpenses, icon: <CalendarIcon />, bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' },
          { label: 'Monthly Fixed', value: monthlyExpenses, icon: <MoneyIcon />, bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
          { label: 'Employee Related', value: employeeExpenses, icon: <EmployeeIcon />, bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
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
                  PKR {(stat.value / 1000).toFixed(0)}k
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Expense History
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Select size="small" sx={{ minWidth: 150 }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
                <Select size="small" sx={{ minWidth: 150 }} value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="employee">Employee</MenuItem>
                </Select>
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
                    {visibleExpenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ color: '#64748b', py: 4 }}>
                          No expenses recorded yet
                        </TableCell>
                      </TableRow>
                    )}
                    {visibleExpenses.map((expense) => (
                      <TableRow key={expense.id} hover>
                        <TableCell>{expense.expense_date}</TableCell>
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
                        <TableCell>{employeeName(expense.employee_id) || '-'}</TableCell>
                        <TableCell>
                          {expense.is_salary_deductible ? (
                            <Chip label="Yes" size="small" sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 600 }} />
                          ) : (
                            <Chip label="No" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#ef4444' }}>
                          PKR {expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => handleDeleteExpense(expense.id)}>
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
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Category Breakdown
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {categories.map((category) => {
                  const categoryTotal = expenses
                    .filter((e) => e.category === category)
                    .reduce((sum, e) => sum + e.amount, 0);
                  if (categoryTotal === 0) return null;
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
                {totalExpenses === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No expense data yet
                  </Typography>
                )}
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
                <TextField label="Date" fullWidth type="date" size="small" InputLabelProps={{ shrink: true }}
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expense_date: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select label="Category" value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Description" fullWidth required multiline rows={2} placeholder="Describe the expense..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Expense Type</InputLabel>
                  <Select label="Expense Type" value={expenseForm.type}
                    onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}>
                    <MenuItem value="daily">Daily Expense</MenuItem>
                    <MenuItem value="monthly">Monthly Fixed</MenuItem>
                    <MenuItem value="employee">Employee Related</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Amount (PKR)" fullWidth type="number" required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Employee</InputLabel>
                  <Select label="Employee" value={expenseForm.employee_id}
                    onChange={(e) => setExpenseForm({ ...expenseForm, employee_id: e.target.value })}>
                    <MenuItem value="">None</MenuItem>
                    {employees.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>{emp.full_name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Checkbox checked={expenseForm.is_salary_deductible}
                    onChange={(e) => setExpenseForm({ ...expenseForm, is_salary_deductible: e.target.checked })} />}
                  label="Salary Deductible"
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
            onClick={handleAddExpense}
            disabled={!expenseForm.category || !expenseForm.description || !expenseForm.type || !expenseForm.amount}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Add Expense
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
