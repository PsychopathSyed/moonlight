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
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as EmployeeIcon,
  AttachMoney as SalaryIcon,
  TrendingUp as AdvanceIcon,
  Receipt as SlipIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Work as RoleIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

export default function HR() {
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openAdvance, setOpenAdvance] = useState(false);
  const [openProcessSalary, setOpenProcessSalary] = useState(false);

  const employees = [
    { id: 1, name: 'Ahmed Khan', role: 'Technician', phone: '+92-300-1112233', salary: 45000, joinsDate: '2023-06-15', status: 'active' },
    { id: 2, name: 'Bilal Ahmed', role: 'Driver', phone: '+92-321-4445566', salary: 35000, joinsDate: '2023-08-20', status: 'active' },
    { id: 3, name: 'Ali Hassan', role: 'Event Manager', phone: '+92-333-6667788', salary: 55000, joinsDate: '2023-01-10', status: 'active' },
    { id: 4, name: 'Omer Farooq', role: 'Technician', phone: '+92-300-7778899', salary: 42000, joinsDate: '2024-02-01', status: 'active' },
    { id: 5, name: 'Saad Ali', role: 'Helper', phone: '+92-345-1234567', salary: 28000, joinsDate: '2024-03-15', status: 'inactive' },
  ];

  const advances = [
    { id: 1, employee: 'Ahmed Khan', amount: 15000, date: '2026-04-15', reason: 'Family emergency', deducted: false, deductionMonth: null },
    { id: 2, employee: 'Bilal Ahmed', amount: 8000, date: '2026-04-10', reason: 'Medical', deducted: false, deductionMonth: null },
    { id: 3, employee: 'Ali Hassan', amount: 10000, date: '2026-04-05', reason: 'Personal', deducted: true, deductionMonth: 'Apr-2026' },
    { id: 4, employee: 'Ahmed Khan', amount: 5000, date: '2026-03-20', reason: 'Rent advance', deducted: true, deductionMonth: 'Mar-2026' },
    { id: 5, employee: 'Omer Farooq', amount: 7000, date: '2026-03-15', reason: 'Vehicle repair', deducted: true, deductionMonth: 'Mar-2026' },
  ];

  const salaryProcess = [
    { id: 1, month: 'Apr-2026', employee: 'Ahmed Khan', basic: 45000, advance: 5000, incentives: 2000, deductions: 5000, netSalary: 42000, status: 'processed', ref: 'SLP-001' },
    { id: 2, month: 'Apr-2026', employee: 'Bilal Ahmed', basic: 35000, advance: 8000, incentives: 1500, deductions: 8000, netSalary: 28500, status: 'processed', ref: 'SLP-002' },
    { id: 3, month: 'Apr-2026', employee: 'Ali Hassan', basic: 55000, advance: 10000, incentives: 3000, deductions: 10000, netSalary: 48000, status: 'pending', ref: 'SLP-003' },
    { id: 4, month: 'Mar-2026', employee: 'Ahmed Khan', basic: 45000, advance: 5000, incentives: 0, deductions: 5000, netSalary: 40000, status: 'processed', ref: 'SLP-001' },
  ];

  const totalSalary = employees.filter(e => e.status === 'active').reduce((sum, e) => sum + e.salary, 0);
  const totalAdvances = advances.filter(a => !a.deducted).reduce((sum, a) => sum + a.amount, 0);
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
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
                {employees.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{employee.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.role}
                        size="small"
                        icon={<RoleIcon />}
                        sx={{ bgcolor: '#e0e7ff', color: '#4338ca', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>
                      PKR {employee.salary.toLocaleString()}
                    </TableCell>
                    <TableCell>{employee.joinsDate}</TableCell>
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Salary Processing
                </Typography>
                <Badge badgeContent={salaryProcess.filter(s => s.status === 'pending').length} color="error">
                  <Button variant="outlined" size="small" sx={{ borderRadius: 8 }}>
                    View All
                  </Button>
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
                    {salaryProcess.map((process) => (
                      <TableRow key={process.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{process.ref}</TableCell>
                        <TableCell>{process.month}</TableCell>
                        <TableCell>{process.employee}</TableCell>
                        <TableCell>PKR {process.basic.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: '#f59e0b', fontWeight: 600 }}>PKR {process.advance.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>PKR {process.incentives.toLocaleString()}</TableCell>
                        <TableCell sx={{ color: '#ef4444', fontWeight: 600 }}>PKR {process.deductions.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#6366f1' }}>PKR {process.netSalary.toLocaleString()}</TableCell>
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
                <Badge badgeContent={advances.filter(a => !a.deducted).length} color="error">
                  <AdvanceIcon />
                </Badge>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {advances.slice(0, 6).map((advance) => (
                  <Paper key={advance.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1" fontWeight={600}>{advance.employee}</Typography>
                      <Chip
                        label={advance.deducted ? 'Deducted' : 'Pending'}
                        size="small"
                        sx={{
                          bgcolor: advance.deducted ? '#dcfce7' : '#fef3c7',
                          color: advance.deducted ? '#166534' : '#92400e',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {advance.date} • {advance.reason}
                        </Typography>
                        {advance.deductionMonth && (
                          <Typography variant="caption" display="block" color="#10b981">
                            Deducted: {advance.deductionMonth}
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
                <TextField label="Full Name" fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <Select label="Role" fullWidth size="small" defaultValue="" displayEmpty>
                  <MenuItem value="" disabled>Select Role</MenuItem>
                  <MenuItem value="Technician">Technician</MenuItem>
                  <MenuItem value="Driver">Driver</MenuItem>
                  <MenuItem value="Event Manager">Event Manager</MenuItem>
                  <MenuItem value="Helper">Helper</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Phone Number" fullWidth required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="CNIC" fullWidth placeholder="xxxxx-xxxxxxx-x" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Monthly Salary (PKR)" fullWidth type="number" required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Join Date" fullWidth type="date" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Address" fullWidth multiline rows={2} />
              </Grid>
              <Grid item xs={12}>
                <Select label="Status" fullWidth size="small" defaultValue="active">
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmployee(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
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
            <Select label="Select Employee" fullWidth size="small" defaultValue="" displayEmpty>
              <MenuItem value="" disabled>Select Employee</MenuItem>
              {employees.filter(e => e.status === 'active').map((e) => (
                <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
              ))}
            </Select>
            <TextField label="Advance Amount (PKR)" fullWidth type="number" required />
            <TextField label="Reason" fullWidth required placeholder="Reason for advance..." />
            <Select label="Deduct From Month" fullWidth size="small" defaultValue="" displayEmpty>
              <MenuItem value="" disabled>Select Month</MenuItem>
              <MenuItem value="Apr-2026">April 2026</MenuItem>
              <MenuItem value="May-2026">May 2026</MenuItem>
              <MenuItem value="Jun-2026">June 2026</MenuItem>
            </Select>
            <TextField label="Notes" fullWidth multiline rows={2} placeholder="Additional notes..." />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdvance(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<AdvanceIcon />}
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
                <Select label="Select Month" fullWidth size="small" defaultValue="" displayEmpty>
                  <MenuItem value="" disabled>Select Month</MenuItem>
                  <MenuItem value="Apr-2026">April 2026</MenuItem>
                  <MenuItem value="May-2026">May 2026</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <Select label="Select Employee" fullWidth size="small" defaultValue="" displayEmpty>
                  <MenuItem value="" disabled>Select Employee</MenuItem>
                  {employees.filter(e => e.status === 'active').map((e) => (
                    <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Basic Salary" fullWidth type="number" value="45000" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Pending Advances" fullWidth type="number" value="5000" disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Incentives (PKR)" fullWidth type="number" placeholder="0" />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Other Deductions (PKR)" fullWidth type="number" placeholder="0" />
              </Grid>
            </Grid>
            <Paper sx={{ p: 2, bgcolor: '#f8fafc', mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" fontWeight={600}>Net Salary:</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#6366f1' }}>
                  PKR 40,000
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
            sx={{ borderRadius: 8, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            Generate Slip
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
