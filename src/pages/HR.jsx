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
  Badge,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as EmployeeIcon,
  AttachMoney as SalaryIcon,
  TrendingUp as AdvanceIcon,
  Receipt as SlipIcon,
  Delete as DeleteIcon,
  Work as RoleIcon,
} from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';
import api from '../../api';

const emptyEmployeeForm = {
  first_name: '', last_name: '', role: '', phone: '', cnic: '',
  salary: '', join_date: '', address: '', status: 'active',
};
const emptyAdvanceForm = { employee_id: '', amount: '', reason: '', advance_date: '' };
const emptySalaryForm = { employee_id: '', month: '', incentives: '', other_deductions: '' };

const currentMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = -1; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ value, label: d.toLocaleString('en', { month: 'long', year: 'numeric' }) });
  }
  return options;
};

export default function HR() {
  const { setHeaderActions } = useOutletContext();
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openAdvance, setOpenAdvance] = useState(false);
  const [openProcessSalary, setOpenProcessSalary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [salaryProcess, setSalaryProcess] = useState([]);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);
  const [advanceForm, setAdvanceForm] = useState(emptyAdvanceForm);
  const [salaryForm, setSalaryForm] = useState(emptySalaryForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEmployees = async () => {
    const params = { page_size: 100 };
    if (statusFilter !== 'all') params.status_filter = statusFilter;
    const response = await api.get('/api/hr/employees', params);
    setEmployees(response.data?.employees || []);
  };

  const loadAdvances = async () => {
    const response = await api.get('/api/hr/advances', { page_size: 100 });
    setAdvances(response.data?.advances || []);
  };

  const loadSalary = async () => {
    const response = await api.get('/api/hr/salary');
    setSalaryProcess(response.data?.salary_processes || []);
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([loadEmployees(), loadAdvances(), loadSalary()])
      .catch(() => setError('Failed to load HR data. Please check your connection.'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    if (setHeaderActions) {
      setHeaderActions(
        <>
          <TextField
            size="small"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />
          <FormControl size="small" sx={{ width: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenEmployee(true)}
            size="small"
          >
            Add Employee
          </Button>
        </>
      );
    }
    return () => setHeaderActions && setHeaderActions(null);
  }, [searchTerm, statusFilter, setHeaderActions]);

  const employeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.full_name : 'Unknown';
  };

  const handleAddEmployee = async () => {
    try {
      setError('');
      const response = await api.post('/api/hr/employees', {
        ...employeeForm,
        salary: Number(employeeForm.salary),
        join_date: employeeForm.join_date || new Date().toISOString().slice(0, 10),
      });
      if (response.success) {
        setEmployeeForm(emptyEmployeeForm);
        setOpenEmployee(false);
        await loadEmployees();
      } else {
        setError(response.detail || response.message || 'Failed to save employee');
      }
    } catch {
      setError('Failed to save employee. Please check your connection.');
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await api.delete(`/api/hr/employees/${employeeId}`);
      await loadEmployees();
    } catch {
      setError('Failed to delete employee.');
    }
  };

  const handleAddAdvance = async () => {
    try {
      setError('');
      const response = await api.post('/api/hr/advances', {
        employee_id: advanceForm.employee_id,
        amount: Number(advanceForm.amount),
        reason: advanceForm.reason,
        advance_date: advanceForm.advance_date || undefined,
      });
      if (response.success) {
        setAdvanceForm(emptyAdvanceForm);
        setOpenAdvance(false);
        await loadAdvances();
      } else {
        setError(response.detail || response.message || 'Failed to record advance');
      }
    } catch {
      setError('Failed to record advance. Please check your connection.');
    }
  };

  const selectedSalaryEmployee = employees.find((e) => e.id === salaryForm.employee_id);
  const pendingAdvanceFor = (employeeId) => advances
    .filter((a) => a.employee_id === employeeId && !a.is_deducted)
    .reduce((sum, a) => sum + a.amount, 0);

  const salaryBasic = selectedSalaryEmployee ? selectedSalaryEmployee.salary : 0;
  const salaryAdvance = selectedSalaryEmployee ? pendingAdvanceFor(selectedSalaryEmployee.id) : 0;
  const salaryNet = salaryBasic + Number(salaryForm.incentives || 0) - salaryAdvance - Number(salaryForm.other_deductions || 0);

  const handleProcessSalary = async () => {
    try {
      setError('');
      const response = await api.post('/api/hr/salary/process', {
        employee_id: salaryForm.employee_id,
        month: salaryForm.month,
        basic_salary: salaryBasic,
        advance_deduction: salaryAdvance,
        incentives: Number(salaryForm.incentives || 0),
        other_deductions: Number(salaryForm.other_deductions || 0),
        net_salary: salaryNet,
        status: 'processed',
      });
      if (response.success) {
        setSalaryForm(emptySalaryForm);
        setOpenProcessSalary(false);
        await Promise.all([loadSalary(), loadAdvances()]);
      } else {
        setError(response.detail || response.message || 'Failed to process salary');
      }
    } catch {
      setError('Failed to process salary. Please check your connection.');
    }
  };

  const visibleEmployees = employees.filter((e) =>
    !searchTerm || e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSalary = employees.filter(e => e.status === 'active').reduce((sum, e) => sum + e.salary, 0);
  const totalAdvances = advances.filter(a => !a.is_deducted).reduce((sum, a) => sum + a.amount, 0);
  const activeEmployees = employees.filter(e => e.status === 'active').length;

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1e293b' }}>
            HR & Salary Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Employees, advances, deductions, and salary processing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenEmployee(true)}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Add Employee
          </Button>
          <Button
            variant="contained"
            startIcon={<AdvanceIcon />}
            onClick={() => setOpenAdvance(true)}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            Record Advance
          </Button>
          <Button
            variant="contained"
            startIcon={<SalaryIcon />}
            onClick={() => setOpenProcessSalary(true)}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            Process Salary
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <EmployeeIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Active Employees
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {activeEmployees}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <SalaryIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Monthly Salary
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(totalSalary / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <AdvanceIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Pending Advances
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                PKR {(totalAdvances / 1000).toFixed(0)}k
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            <CardContent>
              <Avatar sx={{ bgcolor: '#ffffff20', color: '#ffffff', width: 48, height: 48, mb: 2 }}>
                <RoleIcon />
              </Avatar>
              <Typography variant="body2" sx={{ color: '#ffffff80', mb: 1 }}>
                Total Roles
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                {[...new Set(employees.map(e => e.role))].length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Employee Master
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
                  <TableCell sx={{ fontWeight: 600 }}>Emp #</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Salary</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Join Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: '#64748b', py: 4 }}>
                      No employees added yet
                    </TableCell>
                  </TableRow>
                )}
                {visibleEmployees.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>{employee.employee_number}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{employee.full_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.role}
                        size="small"
                        icon={<RoleIcon />}
                        sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{employee.phone || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>
                      PKR {employee.salary.toLocaleString()}
                    </TableCell>
                    <TableCell>{employee.join_date}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.status}
                        size="small"
                        sx={{
                          bgcolor: employee.status === 'active' ? '#dcfce7' : '#f1f5f9',
                          color: employee.status === 'active' ? '#166534' : '#475569',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDeleteEmployee(employee.id)}>
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Salary Processing
                </Typography>
                <Badge badgeContent={salaryProcess.filter(s => s.status === 'pending').length} color="error">
                  <SlipIcon sx={{ color: '#64748b' }} />
                </Badge>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Ref</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Month</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Basic</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Advance</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Incentives</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Deductions</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Net Salary</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salaryProcess.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ color: '#64748b', py: 4 }}>
                          No salaries processed yet
                        </TableCell>
                      </TableRow>
                    )}
                    {salaryProcess.map((process) => (
                      <TableRow key={process.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{process.reference_number}</TableCell>
                        <TableCell>{process.month}</TableCell>
                        <TableCell>{employeeName(process.employee_id)}</TableCell>
                        <TableCell>PKR {process.basic_salary.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>PKR {process.advance_deduction.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>PKR {process.incentives.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: '#ef4444', fontWeight: 600 }}>PKR {process.other_deductions.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>PKR {process.net_salary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={process.status}
                            size="small"
                            sx={{
                              bgcolor: process.status === 'processed' ? '#dcfce7' : '#fef3c7',
                              color: process.status === 'processed' ? '#166534' : '#92400e',
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
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Advances & Deductions
                </Typography>
                <Badge badgeContent={advances.filter(a => !a.is_deducted).length} color="error">
                  <AdvanceIcon />
                </Badge>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {advances.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No advances recorded
                  </Typography>
                )}
                {advances.slice(0, 6).map((advance) => (
                  <Paper key={advance.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" fontWeight={600}>{employeeName(advance.employee_id)}</Typography>
                      <Chip
                        label={advance.is_deducted ? 'Deducted' : 'Pending'}
                        size="small"
                        sx={{
                          bgcolor: advance.is_deducted ? '#dcfce7' : '#fef3c7',
                          color: advance.is_deducted ? '#166534' : '#92400e',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {advance.advance_date} • {advance.reason || '-'}
                        </Typography>
                        {advance.deduction_month && (
                          <Typography variant="caption" display="block" color="#10b981">
                            Deducted: {advance.deduction_month}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" fontWeight={700} color="#f59e0b">
                        PKR {advance.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openEmployee} onClose={() => setOpenEmployee(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField label="First Name" fullWidth required
                  value={employeeForm.first_name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, first_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Last Name" fullWidth required
                  value={employeeForm.last_name}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, last_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select label="Role" value={employeeForm.role}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}>
                    <MenuItem value="Technician">Technician</MenuItem>
                    <MenuItem value="Driver">Driver</MenuItem>
                    <MenuItem value="Event Manager">Event Manager</MenuItem>
                    <MenuItem value="Helper">Helper</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Phone Number" fullWidth
                  value={employeeForm.phone}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="CNIC" fullWidth placeholder="xxxxx-xxxxxxx-x"
                  value={employeeForm.cnic}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, cnic: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Monthly Salary (PKR)" fullWidth type="number" required
                  value={employeeForm.salary}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, salary: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Join Date" fullWidth type="date" InputLabelProps={{ shrink: true }}
                  value={employeeForm.join_date}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, join_date: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={employeeForm.status}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value })}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField label="Address" fullWidth multiline rows={2}
                  value={employeeForm.address}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmployee(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddEmployee}
            disabled={!employeeForm.first_name || !employeeForm.last_name || !employeeForm.role || !employeeForm.salary}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
          >
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAdvance} onClose={() => setOpenAdvance(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Salary Advance</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Record advance payment - will be deducted from next salary
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Employee</InputLabel>
              <Select label="Employee" value={advanceForm.employee_id}
                onChange={(e) => setAdvanceForm({ ...advanceForm, employee_id: e.target.value })}>
                {employees.filter(e => e.status === 'active').map((e) => (
                  <MenuItem key={e.id} value={e.id}>{e.full_name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Advance Amount (PKR)" fullWidth type="number" required
              value={advanceForm.amount}
              onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })} />
            <TextField label="Reason" fullWidth required placeholder="Reason for advance..."
              value={advanceForm.reason}
              onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })} />
            <TextField label="Advance Date" fullWidth type="date" InputLabelProps={{ shrink: true }}
              value={advanceForm.advance_date}
              onChange={(e) => setAdvanceForm({ ...advanceForm, advance_date: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdvance(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<AdvanceIcon />}
            onClick={handleAddAdvance}
            disabled={!advanceForm.employee_id || !advanceForm.amount}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            Record Advance
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openProcessSalary} onClose={() => setOpenProcessSalary(false)} maxWidth="md" fullWidth>
        <DialogTitle>Process Monthly Salary</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select month and employee to process salary with automatic calculations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Month</InputLabel>
                  <Select label="Month" value={salaryForm.month}
                    onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}>
                    {currentMonthOptions().map((m) => (
                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Employee</InputLabel>
                  <Select label="Employee" value={salaryForm.employee_id}
                    onChange={(e) => setSalaryForm({ ...salaryForm, employee_id: e.target.value })}>
                    {employees.filter(e => e.status === 'active').map((e) => (
                      <MenuItem key={e.id} value={e.id}>{e.full_name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Basic Salary" fullWidth type="number" value={salaryBasic} disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Pending Advances" fullWidth type="number" value={salaryAdvance} disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Incentives (PKR)" fullWidth type="number" placeholder="0"
                  value={salaryForm.incentives}
                  onChange={(e) => setSalaryForm({ ...salaryForm, incentives: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Other Deductions (PKR)" fullWidth type="number" placeholder="0"
                  value={salaryForm.other_deductions}
                  onChange={(e) => setSalaryForm({ ...salaryForm, other_deductions: e.target.value })} />
              </Grid>
            </Grid>
            <Paper sx={{ p: 2, bgcolor: '#f8fafc', mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight={600}>Net Salary:</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#6366f1' }}>
                  PKR {salaryNet.toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProcessSalary(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<SlipIcon />}
            onClick={handleProcessSalary}
            disabled={!salaryForm.employee_id || !salaryForm.month}
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            Generate Slip
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
