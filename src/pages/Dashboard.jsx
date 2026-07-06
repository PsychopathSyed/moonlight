import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Grid,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Skeleton,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Button,
  List,
  ListItemButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Inventory2 as InventoryIcon,
  ShoppingCart as OrdersIcon,
  WarningAmber as LowStockIcon,
  ReportProblem as OverdueIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as InvoiceIcon,
  People as CustomersIcon,
  Category as ConsumablesIcon,
  Build as ToolsIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import api from '../../api';

// ── Semantic status palette (DESIGN.md: Restrained, status-only color) ──
const STATUS = {
  indigo: { dot: '#6366f1', fg: '#4338ca' },
  red: { dot: '#dc2626', fg: '#991b1b' },
  amber: { dot: '#d97706', fg: '#92400e' },
  emerald: { dot: '#059669', fg: '#047857' },
  neutral: { dot: '#94a3b8', fg: '#475569' },
};

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
];

const fmtPKR = (n) => `PKR ${(Number(n) || 0).toLocaleString()}`;

// ── KPI card: semantic dot, distinct slate icon, drilldown link, focus ring ──
function KpiCard({ label, value, sub, subTone = 'neutral', icon, to, loading, hint }) {
  const navigate = useNavigate();
  const tone = STATUS[subTone] || STATUS.neutral;
  return (
    <Card sx={{ height: '100%', backgroundImage: 'none', boxShadow: 'none' }}>
      <CardActionArea
        onClick={() => navigate(to)}
        sx={{
          height: '100%',
          borderRadius: 'inherit',
          '&:focus-visible': { outline: '2px solid #6366f1', outlineOffset: '-2px', borderRadius: '12px' },
          '&:hover': { backgroundColor: '#f8fafc' },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.75 }}>
                <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tone.dot, flexShrink: 0 }} />
                <Tooltip title={hint || ''} placement="top" arrow disableInteractive>
                  <Typography variant="body2" color="text.secondary" noWrap component="span">{label}</Typography>
                </Tooltip>
              </Stack>
              {loading ? (
                <Skeleton variant="text" width={90} height={40} />
              ) : (
                <Typography variant="h4" component="div" fontWeight={700} sx={{ color: '#1e293b', lineHeight: 1.1 }}>
                  {value}
                </Typography>
              )}
              {sub && !loading && (
                <Typography variant="caption" sx={{ color: tone.fg, mt: 0.5, display: 'block' }}>
                  {sub}
                </Typography>
              )}
            </Box>
            <Box sx={{ color: '#475569', flexShrink: 0 }}>{icon}</Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function SecondaryStat({ label, value, icon, loading }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        <Box sx={{ color: '#64748b' }}>{icon}</Box>
        <Typography variant="body2" color="text.secondary" noWrap>{label}</Typography>
      </Stack>
      {loading ? (
        <Skeleton variant="text" width={40} />
      ) : (
        <Typography variant="body2" fontWeight={600} sx={{ color: '#1e293b' }}>{value}</Typography>
      )}
    </Stack>
  );
}

function SectionError({ onRetry }) {
  return (
    <Alert
      severity="error"
      action={<Button color="inherit" size="small" onClick={onRetry}>Retry</Button>}
      sx={{ '& .MuiAlert-message': { width: '100%' } }}
    >
      Couldn't load this section.
    </Alert>
  );
}

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawRange = searchParams.get('range');
  const range = RANGES.some((r) => r.value === rawRange) ? rawRange : 'month';
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  const [overdue, setOverdue] = useState(null);
  const [overdueLoading, setOverdueLoading] = useState(true);
  const [overdueError, setOverdueError] = useState(false);

  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const navigate = useNavigate();

  const fetchStats = useCallback(async (selectedRange) => {
    try {
      const res = await api.get(api.endpoints.dashboard.stats, { range: selectedRange });
      if (res && res.success === false) {
        setStatsError(true);
      } else {
        setStats(res);
        setStatsError(false);
        setLastRefreshed(Date.now());
      }
    } catch (e) {
      console.error('Dashboard stats error:', e);
      setStatsError(true);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchOverdue = useCallback(async () => {
    try {
      const res = await api.get(api.endpoints.dashboard.overdue);
      setOverdue(res?.data || { overdue_invoices: [], low_stock_items: [] });
      setOverdueError(false);
      setLastRefreshed(Date.now());
    } catch (e) {
      console.error('Dashboard overdue error:', e);
      setOverdueError(true);
    } finally {
      setOverdueLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(range);
  }, [range, fetchStats]);

  useEffect(() => {
    fetchOverdue();
  }, [fetchOverdue]);

  // Tick once a second so the "Updated Xs ago" label stays fresh.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Keyboard shortcuts: R = refresh, 1/2/3 = today/week/month.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      if (key === 'r' || key === 'R') {
        setStatsLoading(true);
        fetchStats(range);
        fetchOverdue();
      } else if (key === '1') {
        setStatsLoading(true);
        setSearchParams({}, { replace: true });
      } else if (key === '2') {
        setStatsLoading(true);
        setSearchParams({ range: 'week' }, { replace: true });
      } else if (key === '3') {
        setStatsLoading(true);
        setSearchParams({ range: 'month' }, { replace: true });
      } else {
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [range, fetchStats, fetchOverdue, setSearchParams]);

  const handleRangeChange = (_, v) => {
    if (!v) return;
    setStatsLoading(true);
    setSearchParams(v === 'month' ? {} : { range: v }, { replace: true });
  };

  const handleRefresh = () => {
    setStatsLoading(true);
    fetchStats(range);
    fetchOverdue();
  };

  const delta = stats?.revenue_delta_pct;
  const deltaNode = !statsLoading && delta != null && (
    <Chip
      size="small"
      icon={delta >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
      label={`${delta >= 0 ? '+' : ''}${delta}% vs prev`}
      sx={{
        bgcolor: delta >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(220,38,38,0.12)',
        color: delta >= 0 ? '#047857' : '#991b1b',
        fontWeight: 600,
        '& .MuiChip-icon': { color: delta >= 0 ? '#059669' : '#dc2626' },
      }}
    />
  );

  const overdueInvoices = overdue?.overdue_invoices || [];
  const lowStockItems = overdue?.low_stock_items || [];

  const rangeLabel = RANGES.find((r) => r.value === range)?.label || '';

  const refreshedLabel = (() => {
    if (!lastRefreshed) return '';
    const s = Math.max(0, Math.floor((now - lastRefreshed) / 1000));
    if (s < 5) return 'Updated just now';
    if (s < 60) return `Updated ${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `Updated ${m}m ago`;
    return `Updated ${Math.floor(m / 60)}h ago`;
  })();

  return (
    <Stack spacing={3}>
      {/* Range selector + refresh */}
      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1.5}>
        {refreshedLabel && (
          <Typography variant="caption" sx={{ color: '#64748b' }} aria-live="polite">
            {refreshedLabel}
          </Typography>
        )}
        <ToggleButtonGroup
          value={range}
          exclusive
          size="small"
          onChange={handleRangeChange}
          aria-label="time range"
        >
          {RANGES.map((r) => (
            <ToggleButton key={r.value} value={r.value} sx={{ px: 1.5, py: 0.25, fontSize: '0.8rem' }}>
              {r.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Tooltip title="Refresh (R)">
          <IconButton size="small" onClick={handleRefresh} aria-label="refresh dashboard">
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Row 1: 4 KPI cards */}
      {statsError ? (
        <SectionError onRetry={() => fetchStats(range)} />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              label="Active rentals"
              value={stats?.active_rentals ?? 0}
              icon={<OrdersIcon fontSize="large" />}
              subTone="indigo"
              sub="In progress now"
              hint="Orders currently out on rent (in progress)."
              to="/rentals"
              loading={statsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              label="Overdue invoices"
              value={stats?.overdue_invoices ?? 0}
              icon={<OverdueIcon fontSize="large" />}
              subTone="red"
              sub={stats?.overdue_invoices ? 'Needs attention' : "You're current"}
              hint="Invoices past their due date with a balance owed."
              to="/invoices?status=overdue"
              loading={statsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              label="Low-stock SKUs"
              value={stats?.low_stock_items ?? 0}
              icon={<LowStockIcon fontSize="large" />}
              subTone="amber"
              sub={stats?.low_stock_items ? 'Reorder soon' : 'Stock healthy'}
              hint="Items below their minimum stock level."
              to="/inventory?filter=low_stock"
              loading={statsLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard
              label="Pending orders"
              value={stats?.pending_orders ?? 0}
              icon={<InvoiceIcon fontSize="large" />}
              subTone="indigo"
              sub="Awaiting confirmation"
              hint="Booked orders awaiting confirmation before they go active."
              to="/rentals?status=pending"
              loading={statsLoading}
            />
          </Grid>
        </Grid>
      )}

      {/* Row 2: Action needed (overdue + low-stock detail) */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1e293b', mb: 1.5 }}>
          Action needed
        </Typography>
        {overdueError ? (
          <SectionError onRetry={fetchOverdue} />
        ) : overdueLoading ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><Skeleton variant="rounded" height={160} /></Grid>
            <Grid item xs={12} md={6}><Skeleton variant="rounded" height={160} /></Grid>
          </Grid>
        ) : overdueInvoices.length === 0 && lowStockItems.length === 0 ? (
          <Card sx={{ backgroundImage: 'none', p: 3, boxShadow: 'none' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CheckIcon sx={{ color: '#059669' }} />
              <Box>
                <Typography fontWeight={600} sx={{ color: '#1e293b' }}>Nothing needs attention right now</Typography>
                <Typography variant="body2" color="text.secondary">No overdue invoices and no low-stock items.</Typography>
              </Box>
            </Stack>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {/* Overdue invoices */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundImage: 'none', height: '100%', boxShadow: 'none' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#991b1b' }}>Overdue invoices</Typography>
                    <Button size="small" onClick={() => navigate('/invoices?status=overdue')}>View all</Button>
                  </Stack>
                  <Divider sx={{ mb: 1 }} />
                  {overdueInvoices.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>No overdue invoices — you're current.</Typography>
                  ) : (
                    <List dense disablePadding>
                      {overdueInvoices.slice(0, 5).map((inv) => (
                        <ListItemButton
                          key={inv.id}
                          onClick={() => navigate('/invoices?status=overdue')}
                          sx={{ borderRadius: 1, mb: 0.5, '&:focus-visible': { outline: '2px solid #6366f1', outlineOffset: -2 } }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }} spacing={1}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>{inv.invoice_number}</Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>{inv.customer_name} · due {inv.due_date}</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#991b1b', whiteSpace: 'nowrap' }}>
                              {fmtPKR(inv.balance)}
                            </Typography>
                          </Stack>
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
            {/* Low stock */}
            <Grid item xs={12} md={6}>
              <Card sx={{ backgroundImage: 'none', height: '100%', boxShadow: 'none' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#92400e' }}>Low-stock items</Typography>
                    <Button size="small" onClick={() => navigate('/inventory?filter=low_stock')}>View all</Button>
                  </Stack>
                  <Divider sx={{ mb: 1 }} />
                  {lowStockItems.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Stock levels are healthy.</Typography>
                  ) : (
                    <List dense disablePadding>
                      {lowStockItems.slice(0, 5).map((item) => (
                        <ListItemButton
                          key={item.id}
                          onClick={() => navigate('/inventory?filter=low_stock')}
                          sx={{ borderRadius: 1, mb: 0.5, '&:focus-visible': { outline: '2px solid #6366f1', outlineOffset: -2 } }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }} spacing={1}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>{item.item_name}</Typography>
                              <Typography variant="caption" color="text.secondary">{item.available_quantity} available · min {item.min_stock_level}</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#92400e', whiteSpace: 'nowrap' }}>{item.available_quantity} left</Typography>
                          </Stack>
                        </ListItemButton>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Row 3: By the numbers (grouped, lower emphasis) */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1e293b', mb: 1.5 }}>
          By the numbers
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundImage: 'none', height: '100%', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: 0 }}>Finance</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Revenue · {rangeLabel.toLowerCase()}
                    </Typography>
                    {statsLoading ? (
                      <Skeleton variant="text" width={120} height={36} />
                    ) : (
                      <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
                        {fmtPKR(stats?.revenue)}
                      </Typography>
                    )}
                    <Box sx={{ mt: 0.5 }}>{deltaNode}</Box>
                  </Box>
                </Stack>
                <Divider />
                <SecondaryStat label="Pending invoices" value={stats?.pending_invoices ?? 0} icon={<InvoiceIcon fontSize="small" />} loading={statsLoading} />
                <SecondaryStat label="Total customers" value={stats?.total_customers ?? 0} icon={<CustomersIcon fontSize="small" />} loading={statsLoading} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ backgroundImage: 'none', height: '100%', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: 0 }}>Stock</Typography>
                <SecondaryStat label="Total inventory" value={stats?.total_inventory ?? 0} icon={<InventoryIcon fontSize="small" />} loading={statsLoading} />
                <SecondaryStat label="Rentable items" value={stats?.rentable_items ?? 0} icon={<InventoryIcon fontSize="small" />} loading={statsLoading} />
                <SecondaryStat label="Consumables" value={stats?.consumables ?? 0} icon={<ConsumablesIcon fontSize="small" />} loading={statsLoading} />
                <SecondaryStat label="Tools" value={stats?.tools ?? 0} icon={<ToolsIcon fontSize="small" />} loading={statsLoading} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Stack>
  );
};

export default Dashboard;
