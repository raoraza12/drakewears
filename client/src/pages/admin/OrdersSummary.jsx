import React, { useState, useEffect, useMemo } from 'react';
import { 
  FiFileText, 
  FiGlobe, 
  FiMessageCircle, 
  FiCalendar, 
  FiDownload, 
  FiPrinter, 
  FiRefreshCw, 
  FiTrendingUp, 
  FiDollarSign, 
  FiCheckCircle, 
  FiTruck, 
  FiClock, 
  FiXCircle, 
  FiBox, 
  FiMapPin, 
  FiCreditCard, 
  FiPhone,
  FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../../api';
import './OrdersSummary.css';

const OrdersSummary = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
  const [sourceTab, setSourceTab] = useState('all'); // 'all' | 'website' | 'whatsapp'
  const [timeMode, setTimeMode] = useState('weekly'); // 'weekly' | 'monthly' | 'custom'
  const [weeklyPreset, setWeeklyPreset] = useState('this_week'); // 'this_week' | 'last_7_days' | 'last_week'
  const [monthlyPreset, setMonthlyPreset] = useState('this_month'); // 'this_month' | 'last_30_days' | 'last_month'
  const [customMonth, setCustomMonth] = useState(''); // 'YYYY-MM'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await API.get('/admin/orders');
      setOrders(Array.isArray(res.data) ? res.data : []);
      if (isManual) toast.success('Orders summary refreshed!');
    } catch (err) {
      toast.error('Failed to load orders summary');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper: check if order is WhatsApp order
  const isWhatsAppOrder = (order) => {
    return order.paymentMethod === 'WhatsApp' || (order.notes && order.notes.includes('[WHATSAPP_ORDER]'));
  };

  // Helper: clean Pakistani phone number for WhatsApp links
  const cleanPhone = (phone) => {
    if (!phone) return '';
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0')) digits = '92' + digits.slice(1);
    else if (!digits.startsWith('92')) digits = '92' + digits;
    return digits;
  };

  // Generate available months for selector
  const availableMonths = useMemo(() => {
    const monthsMap = new Map();
    orders.forEach(o => {
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthsMap.set(key, label);
      }
    });
    // Add current month if not present
    const now = new Date();
    const currKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    if (!monthsMap.has(currKey)) {
      monthsMap.set(currKey, now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }
    return Array.from(monthsMap.entries()).map(([key, label]) => ({ key, label }));
  }, [orders]);

  // Compute Active Date Range
  const { rangeStart, rangeEnd, rangeLabel } = useMemo(() => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    let label = '';

    if (timeMode === 'weekly') {
      if (weeklyPreset === 'this_week') {
        const dayOfWeek = now.getDay(); // 0 is Sunday
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        label = `This Week (${start.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })} - Present)`;
      } else if (weeklyPreset === 'last_7_days') {
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        label = `Last 7 Days (${start.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })})`;
      } else if (weeklyPreset === 'last_week') {
        const dayOfWeek = now.getDay();
        const diffToLastMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek) - 7;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToLastMonday, 0, 0, 0, 0);
        end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
        end.setHours(23, 59, 59, 999);
        label = `Previous Week (${start.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })})`;
      }
    } else if (timeMode === 'monthly') {
      if (customMonth) {
        const [year, month] = customMonth.split('-').map(Number);
        start = new Date(year, month - 1, 1, 0, 0, 0, 0);
        end = new Date(year, month, 0, 23, 59, 59, 999);
        label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } else if (monthlyPreset === 'this_month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        label = `This Month (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
      } else if (monthlyPreset === 'last_30_days') {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        label = `Last 30 Days (${start.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })})`;
      } else if (monthlyPreset === 'last_month') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    } else if (timeMode === 'custom') {
      start = customStartDate ? new Date(customStartDate + 'T00:00:00') : new Date(0);
      end = customEndDate ? new Date(customEndDate + 'T23:59:59') : new Date();
      label = `Custom: ${start.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })} to ${end.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }

    return { rangeStart: start, rangeEnd: end, rangeLabel: label };
  }, [timeMode, weeklyPreset, monthlyPreset, customMonth, customStartDate, customEndDate]);

  // Filtered Orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Channel Filter (Website vs WhatsApp vs All)
      const isWA = isWhatsAppOrder(order);
      if (sourceTab === 'website' && isWA) return false;
      if (sourceTab === 'whatsapp' && !isWA) return false;

      // 2. Date Timeframe Filter
      const orderDate = new Date(order.createdAt);
      if (orderDate < rangeStart || orderDate > rangeEnd) return false;

      return true;
    });
  }, [orders, sourceTab, rangeStart, rangeEnd]);

  // Overall counts for tabs badges
  const tabCounts = useMemo(() => {
    let siteCount = 0;
    let waCount = 0;
    orders.forEach(o => {
      const orderDate = new Date(o.createdAt);
      if (orderDate >= rangeStart && orderDate <= rangeEnd) {
        if (isWhatsAppOrder(o)) waCount++;
        else siteCount++;
      }
    });
    return {
      all: siteCount + waCount,
      website: siteCount,
      whatsapp: waCount
    };
  }, [orders, rangeStart, rangeEnd]);

  // Calculate Comprehensive Metrics
  const summaryMetrics = useMemo(() => {
    let totalRevenue = 0;
    let deliveredRevenue = 0;
    let deliveredCount = 0;
    let shippedCount = 0;
    let shippedRevenue = 0;
    let processingCount = 0;
    let processingRevenue = 0;
    let pendingCount = 0;
    let pendingRevenue = 0;
    let cancelledCount = 0;
    let cancelledRevenue = 0;

    const cityMap = {};
    const paymentMap = {};
    const itemMap = {};

    filteredOrders.forEach(o => {
      const amount = Number(o.total) || 0;
      totalRevenue += amount;

      const st = (o.status || 'pending').toLowerCase();
      if (st === 'delivered') {
        deliveredCount++;
        deliveredRevenue += amount;
      } else if (st === 'shipped') {
        shippedCount++;
        shippedRevenue += amount;
      } else if (st === 'processing' || st === 'confirmed') {
        processingCount++;
        processingRevenue += amount;
      } else if (st === 'cancelled') {
        cancelledCount++;
        cancelledRevenue += amount;
      } else {
        pendingCount++;
        pendingRevenue += amount;
      }

      // City distribution
      const city = o.shippingAddress?.city?.trim() || 'Unspecified';
      cityMap[city] = (cityMap[city] || 0) + 1;

      // Payment method distribution
      const pay = isWhatsAppOrder(o) ? 'WhatsApp Order' : (o.paymentMethod || 'Cash on Delivery');
      paymentMap[pay] = (paymentMap[pay] || 0) + 1;

      // Top products sold
      if (Array.isArray(o.items)) {
        o.items.forEach(it => {
          const itemName = it.name || 'Custom Product';
          if (!itemMap[itemName]) {
            itemMap[itemName] = { name: itemName, quantity: 0, revenue: 0 };
          }
          itemMap[itemName].quantity += (it.quantity || 1);
          itemMap[itemName].revenue += (it.price || 0) * (it.quantity || 1);
        });
      }
    });

    const totalOrders = filteredOrders.length;
    const nonCancelledOrders = totalOrders - cancelledCount;
    const aov = nonCancelledOrders > 0 ? Math.round((totalRevenue - cancelledRevenue) / nonCancelledOrders) : 0;
    const cancellationRate = totalOrders > 0 ? ((cancelledCount / totalOrders) * 100).toFixed(1) : 0;

    // Top cities sorted
    const topCities = Object.entries(cityMap)
      .map(([name, count]) => ({ name, count, pct: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Payment methods sorted
    const topPayments = Object.entries(paymentMap)
      .map(([name, count]) => ({ name, count, pct: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0 }))
      .sort((a, b) => b.count - a.count);

    // Top products sorted
    const topProducts = Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      deliveredCount,
      deliveredRevenue,
      shippedCount,
      shippedRevenue,
      processingCount,
      processingRevenue,
      pendingCount,
      pendingRevenue,
      cancelledCount,
      cancelledRevenue,
      aov,
      cancellationRate,
      topCities,
      topPayments,
      topProducts
    };
  }, [filteredOrders]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      return toast.error('No orders to export in selected timeframe');
    }

    const headers = [
      'Order Number',
      'Order UUID',
      'Source',
      'Date Placed',
      'Customer Name',
      'Phone Number',
      'City',
      'Delivery Address',
      'Payment Method',
      'Status',
      'Items Count',
      'Items Summary',
      'Subtotal (PKR)',
      'Shipping (PKR)',
      'Discount (PKR)',
      'Total Amount (PKR)',
      'Delivery SLA'
    ];

    const rows = filteredOrders.map(o => {
      const isWA = isWhatsAppOrder(o);
      const orderNum = o.orderNumber ? `#${o.orderNumber}` : `#${String(o.id).slice(-6).toUpperCase()}`;
      const itemsSummary = (o.items || []).map(i => `${i.quantity}x ${i.name} (${i.size || '-'})`).join('; ');
      
      return [
        `"${orderNum}"`,
        `"${o.id}"`,
        `"${isWA ? 'WhatsApp' : 'Website'}"`,
        `"${new Date(o.createdAt).toLocaleString('en-PK')}"`,
        `"${o.shippingAddress?.name || o.user?.name || 'Customer'}"`,
        `"${o.shippingAddress?.phone || o.user?.phone || 'N/A'}"`,
        `"${o.shippingAddress?.city || 'Pakistan'}"`,
        `"${(o.shippingAddress?.street || '').replace(/"/g, '""')}"`,
        `"${o.paymentMethod || 'Cash on Delivery'}"`,
        `"${o.status}"`,
        o.items?.length || 0,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        o.subtotal || 0,
        o.shippingFee || 0,
        o.discount || 0,
        o.total || 0,
        '"2 to 4 Working Days"'
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fileTimestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `drakewears_${sourceTab}_summary_${fileTimestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders summary CSV downloaded!');
  };

  // Print Summary Report Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="orders-summary-page animate-fade-in">
      {/* Header Bar */}
      <div className="summary-header-row no-print">
        <div className="summary-header-title">
          <h1>
            <FiFileText color="var(--gold, #c9a84c)" /> Orders Summary & Analytics
          </h1>
          <p>Generate separate Weekly & Monthly performance summaries for Website and WhatsApp orders.</p>
        </div>

        <div className="summary-actions-wrap">
          <button 
            type="button" 
            className="summary-btn secondary"
            onClick={() => fetchOrders(true)} 
            disabled={refreshing}
            title="Reload live database numbers"
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} /> 
            {refreshing ? 'Syncing...' : 'Refresh'}
          </button>
          
          <button 
            type="button" 
            className="summary-btn secondary" 
            onClick={handleExportCSV}
            title="Download CSV for Excel / Google Sheets"
          >
            <FiDownload /> Export CSV
          </button>

          <button 
            type="button" 
            className="summary-btn primary" 
            onClick={handlePrint}
            title="Print or Save PDF report"
          >
            <FiPrinter /> Print Summary Report
          </button>
        </div>
      </div>

      {/* 1. CHANNEL SOURCE TABS (Website vs WhatsApp vs All) */}
      <div className="source-tabs-nav no-print">
        <button 
          type="button"
          className={`source-tab-btn ${sourceTab === 'all' ? 'active' : ''}`}
          onClick={() => setSourceTab('all')}
        >
          <FiTrendingUp className="tab-icon-all" size={18} />
          <span>Overall Summary</span>
          <span className="source-badge-count">{tabCounts.all}</span>
        </button>

        <button 
          type="button"
          className={`source-tab-btn ${sourceTab === 'website' ? 'active' : ''}`}
          onClick={() => setSourceTab('website')}
        >
          <FiGlobe className="tab-icon-site" size={18} />
          <span>Website Orders Summary</span>
          <span className="source-badge-count">{tabCounts.website}</span>
        </button>

        <button 
          type="button"
          className={`source-tab-btn ${sourceTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => setSourceTab('whatsapp')}
        >
          <FiMessageCircle className="tab-icon-wa" size={18} />
          <span>WhatsApp Orders Summary</span>
          <span className="source-badge-count">{tabCounts.whatsapp}</span>
        </button>
      </div>

      {/* 2. TIMEFRAME FILTERS BAR (Weekly vs Monthly vs Custom) */}
      <div className="timeframe-bar no-print">
        <div className="time-type-pills">
          <button 
            type="button"
            className={`time-pill-btn ${timeMode === 'weekly' ? 'active' : ''}`}
            onClick={() => { setTimeMode('weekly'); setCustomMonth(''); }}
          >
            <FiCalendar style={{ marginRight: 6 }} /> Weekly Basis
          </button>

          <button 
            type="button"
            className={`time-pill-btn ${timeMode === 'monthly' ? 'active' : ''}`}
            onClick={() => { setTimeMode('monthly'); }}
          >
            <FiClock style={{ marginRight: 6 }} /> Monthly Basis
          </button>

          <button 
            type="button"
            className={`time-pill-btn ${timeMode === 'custom' ? 'active' : ''}`}
            onClick={() => { setTimeMode('custom'); }}
          >
            Custom Dates
          </button>
        </div>

        <div className="time-subfilters">
          {timeMode === 'weekly' && (
            <select 
              className="time-select" 
              value={weeklyPreset} 
              onChange={e => setWeeklyPreset(e.target.value)}
            >
              <option value="this_week">Current Week (Mon – Today)</option>
              <option value="last_7_days">Rolling Last 7 Days</option>
              <option value="last_week">Previous Week (Full Mon – Sun)</option>
            </select>
          )}

          {timeMode === 'monthly' && (
            <>
              <select 
                className="time-select" 
                value={customMonth ? 'custom_month' : monthlyPreset} 
                onChange={e => {
                  if (e.target.value === 'custom_month') return;
                  setCustomMonth('');
                  setMonthlyPreset(e.target.value);
                }}
              >
                <option value="this_month">Current Month ({new Date().toLocaleDateString('en-US', { month: 'short' })})</option>
                <option value="last_30_days">Rolling Last 30 Days</option>
                <option value="last_month">Previous Month</option>
              </select>

              <select 
                className="time-select" 
                value={customMonth} 
                onChange={e => setCustomMonth(e.target.value)}
              >
                <option value="">Specific Month...</option>
                {availableMonths.map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </>
          )}

          {timeMode === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="date" 
                className="date-input" 
                value={customStartDate} 
                onChange={e => setCustomStartDate(e.target.value)} 
              />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input 
                type="date" 
                className="date-input" 
                value={customEndDate} 
                onChange={e => setCustomEndDate(e.target.value)} 
              />
            </div>
          )}

          <span style={{ fontSize: '0.82rem', color: 'var(--gold, #c9a84c)', fontWeight: 600, paddingLeft: 8 }}>
            ● {rangeLabel}
          </span>
        </div>
      </div>

      {/* PRINT-ONLY OFFICIAL REPORT HEADER */}
      <div className="print-report-container" style={{ display: 'none' }}>
        <div style={{ borderBottom: '2px solid #000', paddingBottom: '16px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '2px' }}>DRAKEWEARS</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#555' }}>Official Performance Summary Report</p>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}><strong>Channel:</strong> {sourceTab === 'all' ? 'All Orders' : sourceTab === 'website' ? 'Website Storefront' : 'WhatsApp Orders'}</p>
          <p style={{ margin: '2px 0 0', fontSize: '13px' }}><strong>Period:</strong> {rangeLabel}</p>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#666' }}>Generated on: {new Date().toLocaleString('en-PK')} • Official Business WhatsApp: +92 321 8254922</p>
        </div>
      </div>

      {/* 3. DRAKEWEARS 2 TO 4 DAYS DELIVERY SLA BANNER */}
      <div className="sla-performance-banner">
        <div className="sla-left">
          <div className="sla-icon-box">
            <FiTruck />
          </div>
          <div>
            <h3 className="sla-title">DrakeWears Delivery Standard: 2 to 4 Working Days</h3>
            <p className="sla-desc">
              Guaranteed delivery window across Pakistan. Orders must be dispatched promptly within max 4 days.
            </p>
          </div>
        </div>

        <div className="sla-stats-group">
          <div className="sla-stat-item">
            <div className="sla-stat-val">Min: 2 Days</div>
            <div className="sla-stat-lbl">Earliest Handover</div>
          </div>
          <div className="sla-stat-item">
            <div className="sla-stat-val" style={{ color: '#deb855' }}>Max: 4 Days</div>
            <div className="sla-stat-lbl">Delivery SLA Deadline</div>
          </div>
          <div className="sla-stat-item">
            <div className="sla-stat-val" style={{ color: '#38bdf8' }}>{summaryMetrics.shippedCount + summaryMetrics.processingCount}</div>
            <div className="sla-stat-lbl">Active In Pipeline</div>
          </div>
        </div>
      </div>

      {/* 4. EXECUTIVE SUMMARY KPI CARDS */}
      <div className="summary-kpi-grid">
        {/* Total Orders */}
        <div className="summary-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Total Orders</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <FiBox />
            </div>
          </div>
          <h2 className="kpi-val">{summaryMetrics.totalOrders}</h2>
          <div className="kpi-meta">
            <span>In {sourceTab === 'all' ? 'All Channels' : sourceTab === 'website' ? 'Website' : 'WhatsApp'}</span>
          </div>
        </div>

        {/* Total Gross Revenue */}
        <div className="summary-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Gross Revenue</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(201, 168, 76, 0.15)', color: 'var(--gold, #c9a84c)' }}>
              <FiDollarSign />
            </div>
          </div>
          <h2 className="kpi-val">Rs. {summaryMetrics.totalRevenue.toLocaleString()}</h2>
          <div className="kpi-meta">
            <span>Average: Rs. {summaryMetrics.aov.toLocaleString()} / order</span>
          </div>
        </div>

        {/* Delivered / Fulfilled */}
        <div className="summary-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Delivered & Fulfilled</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(85, 198, 136, 0.15)', color: '#55c688' }}>
              <FiCheckCircle />
            </div>
          </div>
          <h2 className="kpi-val">{summaryMetrics.deliveredCount}</h2>
          <div className="kpi-meta" style={{ color: '#55c688' }}>
            <span>Rs. {summaryMetrics.deliveredRevenue.toLocaleString()} realized</span>
          </div>
        </div>

        {/* In Transit / Shipped */}
        <div className="summary-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">In-Transit / Shipped</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <FiTruck />
            </div>
          </div>
          <h2 className="kpi-val">{summaryMetrics.shippedCount}</h2>
          <div className="kpi-meta">
            <span>Rs. {summaryMetrics.shippedRevenue.toLocaleString()} en route</span>
          </div>
        </div>

        {/* Under Processing / Confirmed */}
        <div className="summary-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Processing / Confirmed</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
              <FiClock />
            </div>
          </div>
          <h2 className="kpi-val">{summaryMetrics.processingCount}</h2>
          <div className="kpi-meta">
            <span>Ready to dispatch (2-4 Days)</span>
          </div>
        </div>

        {/* Cancellations */}
        <div className="summary-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-title">Cancelled</span>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <FiXCircle />
            </div>
          </div>
          <h2 className="kpi-val" style={{ color: '#f87171' }}>{summaryMetrics.cancelledCount}</h2>
          <div className="kpi-meta" style={{ color: '#f87171' }}>
            <span>{summaryMetrics.cancellationRate}% cancellation rate</span>
          </div>
        </div>
      </div>

      {/* 5. VISUAL ANALYTICS & INSIGHTS GRID */}
      <div className="summary-analytics-grid">
        {/* Status Distribution */}
        <div className="analytics-panel-card">
          <h3 className="analytics-card-title">
            <span>Status Pipeline Breakdown</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{summaryMetrics.totalOrders} total</span>
          </h3>

          <div className="distribution-list">
            {[
              { label: 'Delivered', count: summaryMetrics.deliveredCount, color: '#55c688' },
              { label: 'Shipped (In-Transit)', count: summaryMetrics.shippedCount, color: '#c084fc' },
              { label: 'Processing & Confirmed', count: summaryMetrics.processingCount, color: '#facc15' },
              { label: 'Pending Approval', count: summaryMetrics.pendingCount, color: '#deb855' },
              { label: 'Cancelled', count: summaryMetrics.cancelledCount, color: '#f87171' }
            ].map(item => {
              const pct = summaryMetrics.totalOrders > 0 ? Math.round((item.count / summaryMetrics.totalOrders) * 100) : 0;
              return (
                <div key={item.label} className="distribution-row">
                  <div className="distribution-label-flex">
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{item.count} orders ({pct}%)</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Destinations (Cities) */}
        <div className="analytics-panel-card">
          <h3 className="analytics-card-title">
            <span>Top Delivery Destinations</span>
            <FiMapPin color="var(--gold, #c9a84c)" />
          </h3>

          {summaryMetrics.topCities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No destination records found</p>
          ) : (
            <div className="distribution-list">
              {summaryMetrics.topCities.map(city => (
                <div key={city.name} className="distribution-row">
                  <div className="distribution-label-flex">
                    <strong style={{ color: '#fff' }}>{city.name}</strong>
                    <span>{city.count} orders ({city.pct}%)</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${city.pct}%`, background: 'var(--gold, #c9a84c)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. ORDERS LEDGER TABLE FOR SELECTED TIMEFRAME */}
      <div className="summary-ledger-card">
        <div className="ledger-header-bar">
          <div>
            <h3>Orders Ledger for Selected Period</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Showing {filteredOrders.length} orders from {rangeLabel}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="channel-pill site">🌐 Website: {tabCounts.website}</span>
            <span className="channel-pill whatsapp">💬 WhatsApp: {tabCounts.whatsapp}</span>
          </div>
        </div>

        {/* Desktop Ledger Table */}
        <div className="table-responsive desktop-table-view" style={{ overflowX: 'auto' }}>
          <table className="ledger-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Channel</th>
                <th>Date Placed</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>City</th>
                <th>Total (PKR)</th>
                <th>Delivery SLA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No orders recorded for this channel and timeframe filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const orderId = order.id || order._id;
                  const isWA = isWhatsAppOrder(order);
                  const orderNum = order.orderNumber ? `#${order.orderNumber}` : `#${String(orderId).slice(-6).toUpperCase()}`;
                  const customerName = order.shippingAddress?.name || order.user?.name || 'Customer';
                  const phone = order.shippingAddress?.phone || order.user?.phone || '';
                  const city = order.shippingAddress?.city || 'Pakistan';
                  const statusKey = (order.status || 'pending').toLowerCase();

                  return (
                    <tr key={orderId}>
                      {/* Order Number */}
                      <td>
                        <strong style={{ color: 'var(--gold, #c9a84c)', fontSize: '0.92rem' }}>
                          {orderNum}
                        </strong>
                      </td>

                      {/* Channel Badge */}
                      <td>
                        {isWA ? (
                          <span className="channel-pill whatsapp">
                            <FiMessageCircle size={11} /> WhatsApp
                          </span>
                        ) : (
                          <span className="channel-pill site">
                            <FiGlobe size={11} /> Website
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Customer */}
                      <td>
                        <strong style={{ color: '#fff' }}>{customerName}</strong>
                      </td>

                      {/* Phone & Direct WA */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{phone || 'N/A'}</span>
                          {phone && (
                            <a 
                              href={`https://wa.me/${cleanPhone(phone)}?text=Hi%20${encodeURIComponent(customerName)},%20this%20is%20DRAKEWEARS%20regarding%20Order%20${orderNum}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#25d366', display: 'inline-flex', alignItems: 'center' }}
                              title="Chat on WhatsApp"
                            >
                              <FiMessageCircle size={13} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* City */}
                      <td>{city}</td>

                      {/* Total */}
                      <td>
                        <strong style={{ color: '#fff' }}>
                          Rs. {Number(order.total || 0).toLocaleString()}
                        </strong>
                      </td>

                      {/* 2-4 Days Delivery SLA */}
                      <td>
                        <span style={{ 
                          fontSize: '0.74rem', 
                          fontWeight: 600, 
                          color: '#55c688', 
                          background: 'rgba(85, 198, 136, 0.1)', 
                          padding: '3px 8px', 
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <FiTruck size={11} /> 2–4 Days
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: statusKey === 'delivered' ? 'rgba(34, 197, 94, 0.15)' : (statusKey === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' : (statusKey === 'shipped' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(234, 179, 8, 0.15)')),
                          color: statusKey === 'delivered' ? '#22c55e' : (statusKey === 'cancelled' ? '#ef4444' : (statusKey === 'shipped' ? '#c084fc' : '#eab308')),
                          border: `1px solid ${statusKey === 'delivered' ? 'rgba(34, 197, 94, 0.3)' : (statusKey === 'cancelled' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(234, 179, 8, 0.3)')}`
                        }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Ledger Cards View */}
        <div className="mobile-cards-view admin-mobile-card-list" style={{ padding: '12px' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No orders recorded for this filter.
            </div>
          ) : (
            filteredOrders.map(order => {
              const orderId = order.id || order._id;
              const isWA = isWhatsAppOrder(order);
              const orderNum = order.orderNumber ? `#${order.orderNumber}` : `#${String(orderId).slice(-6).toUpperCase()}`;
              const customerName = order.shippingAddress?.name || order.user?.name || 'Customer';
              const phone = order.shippingAddress?.phone || order.user?.phone || '';
              const city = order.shippingAddress?.city || 'Pakistan';
              const statusKey = (order.status || 'pending').toLowerCase();

              return (
                <div key={orderId} className="admin-mobile-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: 'var(--gold, #c9a84c)', fontSize: '0.94rem' }}>{orderNum}</strong>
                      {isWA ? (
                        <span className="channel-pill whatsapp" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                          <FiMessageCircle size={10} /> WA
                        </span>
                      ) : (
                        <span className="channel-pill site" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                          <FiGlobe size={10} /> Web
                        </span>
                      )}
                    </div>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: statusKey === 'delivered' ? 'rgba(34, 197, 94, 0.15)' : (statusKey === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' : (statusKey === 'shipped' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(234, 179, 8, 0.15)')),
                      color: statusKey === 'delivered' ? '#22c55e' : (statusKey === 'cancelled' ? '#ef4444' : (statusKey === 'shipped' ? '#c084fc' : '#eab308')),
                    }}>
                      {order.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span><strong style={{ color: '#fff' }}>{customerName}</strong> ({city})</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</span>
                  </div>

                  {phone && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{phone}</span>
                      <a 
                        href={`https://wa.me/${cleanPhone(phone)}?text=Hi%20${encodeURIComponent(customerName)},%20this%20is%20DRAKEWEARS%20regarding%20Order%20${orderNum}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#25d366', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <FiMessageCircle size={13} /> Chat WhatsApp
                      </a>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#55c688', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FiTruck size={12} /> SLA: 2–4 Days
                    </span>
                    <strong style={{ color: 'var(--gold, #c9a84c)', fontSize: '1rem' }}>
                      Rs. {Number(order.total || 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersSummary;
