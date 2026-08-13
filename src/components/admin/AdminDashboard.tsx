import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  FileText,
  Briefcase,
  Zap,
  CreditCard,
  Activity,
  ShieldAlert,
  History,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  UserX,
  UserCheck,
  Trash2,
  DollarSign,
  Cpu,
  Server,
  Database,
  HardDrive,
  Lock,
  Layers,
  Sparkles,
  Award,
  Globe,
  Sliders,
  ArrowLeft,
} from 'lucide-react';
import {
  AdminTab,
  DateFilterOption,
  NorthStarMetrics,
  UserAccountItem,
  FunnelStageItem,
  ScoreDistribution,
  JobSkillAnalytics,
  TemplateUsageStats,
  AIUsageMetrics,
  SystemHealthMetrics,
  SecurityEventItem,
  AuditLogItem,
  RevenueMetrics,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { trackEvent } from '../../lib/analyticsService';

interface AdminDashboardProps {
  onExitAdmin?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitAdmin }) => {
  const { currentUser, userRole, toggleAdminRole } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [timeframe, setTimeframe] = useState<DateFilterOption>('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analytics Data States
  const [northStar, setNorthStar] = useState<NorthStarMetrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelStageItem[]>([]);
  const [scores, setScores] = useState<ScoreDistribution | null>(null);
  const [usersList, setUsersList] = useState<UserAccountItem[]>([]);
  const [jobSkills, setJobSkills] = useState<JobSkillAnalytics | null>(null);
  const [templates, setTemplates] = useState<TemplateUsageStats[]>([]);
  const [aiUsage, setAiUsage] = useState<AIUsageMetrics | null>(null);
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetrics | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEventItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // User Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // Cost Alert State
  const [costThresholdInput, setCostThresholdInput] = useState<string>('50.00');

  useEffect(() => {
    fetchAdminOverview();
    trackEvent('UserLoggedIn', { view: 'AdminDashboard' });
  }, [timeframe]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'jobs-skills') fetchJobsSkills();
    if (activeTab === 'ai-center') fetchAiUsage();
    if (activeTab === 'revenue') fetchRevenue();
    if (activeTab === 'system-health') fetchHealth();
    if (activeTab === 'security') fetchSecurity();
    if (activeTab === 'audit-logs') fetchAuditLogs();
  }, [activeTab]);

  const fetchAdminOverview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/overview?timeframe=${timeframe}`, {
        headers: { 'x-user-role': userRole },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNorthStar(data.northStar);
        setFunnel(data.funnel);
        setScores(data.scores);
        setSystemHealth(data.systemHealth);
        setAiUsage(data.aiUsage);
      } else {
        throw new Error(data.error || 'Failed to fetch overview metrics.');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching admin overview.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(userSearch)}&role=${userRoleFilter}&status=${userStatusFilter}`,
        { headers: { 'x-user-role': userRole } }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setUsersList(data.users);
      }
    } catch (_) {}
  };

  const fetchJobsSkills = async () => {
    try {
      const res = await fetch('/api/admin/analytics/jobs-skills', {
        headers: { 'x-user-role': userRole },
      });
      const data = await res.json();
      if (res.ok && data.success) setJobSkills(data.jobSkills);
    } catch (_) {}
  };

  const fetchAiUsage = async () => {
    try {
      const res = await fetch('/api/admin/analytics/ai', {
        headers: { 'x-user-role': userRole },
      });
      const data = await res.json();
      if (res.ok && data.success) setAiUsage(data.aiUsage);
    } catch (_) {}
  };

  const fetchRevenue = async () => {
    try {
      const res = await fetch('/api/admin/analytics/revenue', {
        headers: { 'x-user-role': userRole },
      });
      const data = await res.json();
      if (res.ok && data.success) setRevenue(data.revenue);
    } catch (_) {}
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/admin/system-health', {
        headers: { 'x-user-role': userRole },
      });
      const data = await res.json();
      if (res.ok && data.success) setSystemHealth(data.health);
    } catch (_) {}
  };

  const fetchSecurity = async () => {
    try {
      const res = await fetch('/api/admin/security', {
        headers: { 'x-user-role': userRole },
      });
      const data = await res.json();
      if (res.ok && data.success) setSecurityEvents(data.events);
    } catch (_) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: { 'x-user-role': userRole },
      });
      const data = await res.json();
      if (res.ok && data.success) setAuditLogs(data.logs);
    } catch (_) {}
  };

  const handleUserAction = async (userId: string, action: 'SUSPEND' | 'REACTIVATE' | 'DELETE') => {
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify({
          userId,
          action,
          adminEmail: currentUser?.email || 'chidifranklin40@gmail.com',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
      } else {
        alert(data.error || 'User action failed.');
      }
    } catch (err: any) {
      alert('Error executing user action: ' + err.message);
    }
  };

  const handleUpdateCostAlert = async () => {
    const threshold = parseFloat(costThresholdInput);
    if (isNaN(threshold) || threshold <= 0) return;

    try {
      const res = await fetch('/api/admin/ai/cost-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify({
          threshold,
          adminEmail: currentUser?.email || 'admin@atscvoptimizer.com',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`AI Daily Cost alert threshold updated to $${threshold.toFixed(2)}.`);
        fetchAiUsage();
      }
    } catch (err: any) {
      alert('Failed to update cost alert: ' + err.message);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/admin/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole,
        },
        body: JSON.stringify({ format: 'csv' }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ATS_Optimizer_Analytics_${timeframe}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Export failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Admin Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs mr-2"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Back to Candidate App</span>
            </button>
          )}

          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
              ATS CV OPTIMIZER — ADMIN CENTER
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Production Live
              </span>
            </h1>
            <p className="text-slate-400 text-xs">
              System Health, Conversion Analytics, User Accounts, AI Costs & Telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            {(['today', '7d', '30d', '90d', 'all'] as DateFilterOption[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  timeframe === tf ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800 text-xs font-semibold scrollbar-none">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'cv-ats', label: 'CV & ATS Analytics', icon: FileText },
            { id: 'jobs-skills', label: 'Jobs & Skills', icon: Briefcase },
            { id: 'ai-center', label: 'AI Operations & Cost', icon: Zap },
            { id: 'revenue', label: 'Revenue & Subscriptions', icon: CreditCard },
            { id: 'system-health', label: 'System Health', icon: Activity },
            { id: 'security', label: 'Security Threats', icon: ShieldAlert },
            { id: 'audit-logs', label: 'Audit Logs', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: OVERVIEW & KPIS */}
        {activeTab === 'overview' && northStar && (
          <div className="space-y-6">
            
            {/* North Star Metric Highlight Banner */}
            <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 p-6 rounded-2xl border border-blue-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/30">
                  Primary Product Metric
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Successful CV Optimization Completion Rate
                </h2>
                <p className="text-xs text-slate-300 max-w-xl">
                  Measures candidates who complete the end-to-end journey: CV upload → Job description → ATS analysis → AI optimization → Document download.
                </p>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-xl border border-blue-400/30 text-center shrink-0 min-w-[200px]">
                <div className="text-3xl font-black text-emerald-400 flex items-center justify-center gap-1">
                  {northStar.optimizationCompletionRate}%
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  CV Optimization Completion Rate
                </p>
              </div>
            </div>

            {/* Top KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Users</span>
                <p className="text-xl font-black text-white">{northStar.totalUsers.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> MAU: {northStar.mau.toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CVs Uploaded</span>
                <p className="text-xl font-black text-white">{northStar.cvsUploaded.toLocaleString()}</p>
                <p className="text-[10px] text-blue-400 font-semibold">Parsed: {northStar.cvsParsed.toLocaleString()}</p>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ATS Analyses</span>
                <p className="text-xl font-black text-white">{northStar.cvsAnalyzed.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">Initial Avg: {northStar.avgInitialScore}</p>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CVs Optimized</span>
                <p className="text-xl font-black text-emerald-400">{northStar.cvsOptimized.toLocaleString()}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">Post Score: {northStar.avgOptimizedScore}</p>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CV Downloads</span>
                <p className="text-xl font-black text-white">{northStar.cvsDownloaded.toLocaleString()}</p>
                <p className="text-[10px] text-purple-400 font-semibold">Download Rate: {northStar.downloadRate}%</p>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg ATS Boost</span>
                <p className="text-xl font-black text-emerald-400">+{northStar.avgScoreImprovement} pts</p>
                <p className="text-[10px] text-slate-400">Cost/Opt: ${northStar.aiCostPerOptimization}</p>
              </div>
            </div>

            {/* Conversion Funnel & Retention Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Funnel */}
              <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-400" />
                    CV Optimization Conversion Funnel
                  </h3>
                  <span className="text-xs text-slate-400">Overall Drop-off tracked per stage</span>
                </div>

                <div className="space-y-2">
                  {funnel.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">{item.stage}</span>
                        <span className="text-slate-400">
                          <strong className="text-white">{item.users.toLocaleString()} users</strong> ({item.conversionRate}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.conversionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Health & ATS Overview */}
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  System Health & AI Cost
                </h3>

                {systemHealth && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">Application Status</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {systemHealth.appStatus}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">App Uptime</span>
                      <span className="font-bold text-white">{systemHealth.appUptimePercent}%</span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">API Latency</span>
                      <span className="font-bold text-white">{systemHealth.apiLatencyMs} ms</span>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                      <span className="text-slate-400">AI Model Latency</span>
                      <span className="font-bold text-white">{systemHealth.aiLatencyMs} ms</span>
                    </div>

                    {aiUsage && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                        <span className="text-slate-400">Total AI Expense</span>
                        <span className="font-bold text-emerald-400">${aiUsage.estimatedCost.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base">User Management & Accounts</h3>
                <p className="text-slate-400 text-xs">View, filter, suspend, or reactivate user accounts safely.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      fetchUsers();
                    }}
                    placeholder="Search by name, email..."
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:border-blue-500 text-slate-200"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    fetchUsers();
                  }}
                  className="text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-medium"
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>

                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value);
                    fetchUsers();
                  }}
                  className="text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-medium"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Plan</th>
                    <th className="p-3.5">Country / Device</th>
                    <th className="p-3.5">CV Uploads</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <p className="font-bold text-white">{usr.displayName}</p>
                        <p className="text-[11px] text-slate-400">{usr.email}</p>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            usr.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            usr.plan === 'PREMIUM'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {usr.plan}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <p className="text-slate-200">{usr.country || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-500">{usr.device}</p>
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        {usr.cvsUploadedCount} uploaded / {usr.cvsOptimizedCount} optimized
                      </td>
                      <td className="p-3.5">
                        {usr.status === 'ACTIVE' ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {usr.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleUserAction(usr.id, 'SUSPEND')}
                            className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(usr.id, 'REACTIVATE')}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete user ${usr.email}?`)) {
                              handleUserAction(usr.id, 'DELETE');
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: CV & ATS ANALYTICS */}
        {activeTab === 'cv-ats' && scores && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-5">
              <h3 className="font-bold text-white text-base">ATS Score Distribution Across Candidates</h3>
              <p className="text-slate-400 text-xs">
                Candidate score grouping before and after AI optimization.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                {[
                  { range: '0–20 (Critical)', count: scores.range0_20, color: 'bg-rose-500' },
                  { range: '21–40 (Weak)', count: scores.range21_40, color: 'bg-amber-500' },
                  { range: '41–60 (Moderate)', count: scores.range41_60, color: 'bg-yellow-500' },
                  { range: '61–80 (Good Match)', count: scores.range61_80, color: 'bg-blue-500' },
                  { range: '81–100 (Strong Match)', count: scores.range81_100, color: 'bg-emerald-500' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.range}</span>
                    <p className="text-2xl font-black text-white">{item.count}</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                      <div className={`${item.color} h-full rounded-full`} style={{ width: `${Math.min(100, (item.count / 5000) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: JOBS & SKILL INTELLIGENCE */}
        {activeTab === 'jobs-skills' && jobSkills && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" />
                Most Target Job Titles
              </h3>
              <div className="space-y-2 text-xs">
                {jobSkills.topJobTitles.map((job, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-slate-200">{job.title}</span>
                    <span className="bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-md">{job.count} submissions</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Most Missing Skills Identified
              </h3>
              <div className="space-y-2 text-xs">
                {jobSkills.topMissingSkills.map((sk, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-slate-200">{sk.skill}</span>
                    <span className="bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded-md">{sk.count} candidates missing</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: AI OPERATIONS & COST */}
        {activeTab === 'ai-center' && aiUsage && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total AI Operations</span>
                <p className="text-2xl font-black text-white">{aiUsage.totalRequests.toLocaleString()}</p>
                <p className="text-xs text-emerald-400 font-semibold">{aiUsage.successfulRequests.toLocaleString()} Success</p>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tokens Processed</span>
                <p className="text-2xl font-black text-white">{(aiUsage.totalTokens / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-slate-400">Input: {(aiUsage.inputTokens / 1000000).toFixed(2)}M | Output: {(aiUsage.outputTokens / 1000000).toFixed(2)}M</p>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total AI Cost</span>
                <p className="text-2xl font-black text-emerald-400">${aiUsage.estimatedCost.toFixed(2)}</p>
                <p className="text-xs text-slate-400">${aiUsage.costPerOptimization} / Optimization</p>
              </div>

              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active AI Model</span>
                <p className="text-lg font-black text-blue-400 uppercase">{aiUsage.model}</p>
                <p className="text-xs text-slate-400">Avg Latency: {aiUsage.avgLatencyMs}ms</p>
              </div>
            </div>

            {/* Daily Cost Alert Threshold Configuration */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Configurable AI Cost Alert Threshold
              </h3>
              <p className="text-slate-400 text-xs">
                Trigger admin notifications if daily AI usage cost exceeds the threshold.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="number"
                  step="5"
                  value={costThresholdInput}
                  onChange={(e) => setCostThresholdInput(e.target.value)}
                  className="w-40 text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold"
                />
                <button
                  onClick={handleUpdateCostAlert}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Save Daily Limit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: REVENUE & SUBSCRIPTIONS */}
        {activeTab === 'revenue' && revenue && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Recurring Revenue (MRR)</span>
                <p className="text-2xl font-black text-emerald-400">${revenue.mrr.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 font-medium">Real live paid subscriptions</p>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Annual Run Rate (ARR)</span>
                <p className="text-2xl font-black text-white">${revenue.arr.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 font-medium">Projected 12-month run rate</p>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Paid Subscriptions</span>
                <p className="text-2xl font-black text-blue-400">{revenue.activeSubscriptions}</p>
                <p className="text-[11px] text-slate-500 font-medium">Out of {revenue.freeUsersCount + revenue.premiumUsersCount + revenue.trialUsersCount} total registered users</p>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ARPU / LTV</span>
                <p className="text-2xl font-black text-purple-400">${revenue.arpu} / ${revenue.ltv}</p>
                <p className="text-[11px] text-slate-500 font-medium">Average revenue per user</p>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-slate-200">Payment Gateway Status: Clean Real Data Mode</p>
                  <p className="text-slate-400 mt-0.5">
                    All sample subscription estimates have been removed. Registered users default to the Free plan ($0.00/mo).
                    Connect a live payment gateway (e.g. Stripe or PayPal) to enable live automated subscription billing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Free Plan Users</span>
                  <p className="text-2xl font-black text-white">{revenue.freeUsersCount}</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trial Users</span>
                  <p className="text-2xl font-black text-amber-400">{revenue.trialUsersCount}</p>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Premium Paid Subscribers</span>
                  <p className="text-2xl font-black text-emerald-400">{revenue.premiumUsersCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: SYSTEM HEALTH */}
        {activeTab === 'system-health' && systemHealth && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-5">
            <h3 className="font-bold text-white text-base">Application Infrastructure Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] font-bold">App Server</span>
                <p className="font-extrabold text-emerald-400 flex items-center gap-1 text-sm">
                  <Server className="w-4 h-4" /> {systemHealth.appStatus}
                </p>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Database</span>
                <p className="font-extrabold text-emerald-400 flex items-center gap-1 text-sm">
                  <Database className="w-4 h-4" /> {systemHealth.dbStatus}
                </p>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Gemini AI Engine</span>
                <p className="font-extrabold text-emerald-400 flex items-center gap-1 text-sm">
                  <Cpu className="w-4 h-4" /> {systemHealth.aiApiStatus}
                </p>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Storage Cluster</span>
                <p className="font-extrabold text-emerald-400 flex items-center gap-1 text-sm">
                  <HardDrive className="w-4 h-4" /> {systemHealth.storageStatus}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: SECURITY THREATS */}
        {activeTab === 'security' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Security Threats & Anomaly Logs
            </h3>

            <div className="space-y-2">
              {securityEvents.map((evt) => (
                <div key={evt.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded text-[10px] mr-2">
                      {evt.type}
                    </span>
                    <span className="text-slate-200">{evt.description}</span>
                    <p className="text-[10px] text-slate-500 mt-1">IP: {evt.ipAddress} • User: {evt.userEmail || 'Anon'}</p>
                  </div>
                  <span className="text-slate-400 text-[10px]">{new Date(evt.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 9: AUDIT LOGS */}
        {activeTab === 'audit-logs' && (
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              Admin Audit Log Trail
            </h3>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded text-[10px] mr-2">
                      {log.action}
                    </span>
                    <span className="text-slate-200">{log.resource}</span>
                    <p className="text-[10px] text-slate-500 mt-1">Admin: {log.adminEmail} • {log.details}</p>
                  </div>
                  <span className="text-slate-400 text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
