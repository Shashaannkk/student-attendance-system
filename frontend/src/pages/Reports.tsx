import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import {
    Calendar, Download, FileText, Filter,
    TrendingUp, Users, BookOpen, Clock,
    AlertCircle, CheckCircle, XCircle,
    Printer, FileSpreadsheet, FileDown,
    RefreshCw, Loader, ChevronDown
} from 'lucide-react';
import { API_URL } from '../config';

type DateRange = 'today' | 'week' | 'month' | 'custom';

interface ReportRecord {
    id: number;
    student_id: string;
    name: string;
    roll_no: number;
    class_name: string;
    division: string;
    subject: string;
    date: string;
    status: 'P' | 'A' | 'L';
}

interface Stats {
    total_students: number;
    present: number;
    absent: number;
    late: number;
    records_today: number;
}

interface Defaulter {
    student_id: string;
    name: string;
    class_name: string;
    division: string;
    subject: string;
    percentage: number;
    present: number;
    absent: number;
    late: number;
    total: number;
}

const Reports = () => {
    const { user } = useAuth();
    const institutionType = user?.institution_type || 'school';
    const isSchool = institutionType === 'school';
    const theme = {
        gradient: isSchool ? 'from-blue-500 to-cyan-500' : 'from-indigo-600 to-purple-600',
        accent: isSchool ? 'blue' : 'indigo',
    };

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // ── Filter state ────────────────────────────────────────────────────────────
    const [dateRange, setDateRange] = useState<DateRange>('today');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showFilters, setShowFilters] = useState(true);

    // ── Live data state ─────────────────────────────────────────────────────────
    const [records, setRecords] = useState<ReportRecord[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastFetched, setLastFetched] = useState<string>('');

    // ── Compute date params from dateRange ──────────────────────────────────────
    const getDateParams = useCallback(() => {
        const today = new Date();
        const fmt = (d: Date) => d.toISOString().split('T')[0];

        if (dateRange === 'today') return { start: fmt(today), end: fmt(today) };
        if (dateRange === 'week') {
            const start = new Date(today);
            start.setDate(today.getDate() - 6);
            return { start: fmt(start), end: fmt(today) };
        }
        if (dateRange === 'month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            return { start: fmt(start), end: fmt(today) };
        }
        // custom
        return { start: startDate, end: endDate };
    }, [dateRange, startDate, endDate]);

    // ── Fetch everything ────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { start, end } = getDateParams();
            if (!start || !end) { setIsLoading(false); return; }

            // Build report URL
            let reportUrl = `${API_URL}/attendance/report?start_date=${start}&end_date=${end}&limit=300`;
            if (selectedSubject) reportUrl += `&subject=${encodeURIComponent(selectedSubject)}`;
            if (selectedStatus) reportUrl += `&status=${encodeURIComponent(selectedStatus)}`;

            const [recordsRes, statsRes, defaultersRes, subjectsRes] = await Promise.all([
                fetch(reportUrl, { headers }),
                fetch(`${API_URL}/attendance/stats`, { headers }),
                fetch(`${API_URL}/attendance/defaulters?threshold=75`, { headers }),
                fetch(`${API_URL}/attendance/subjects`, { headers }),
            ]);

            if (recordsRes.ok) setRecords(await recordsRes.json());
            if (statsRes.ok) setStats(await statsRes.json());
            if (defaultersRes.ok) setDefaulters(await defaultersRes.json());
            if (subjectsRes.ok) setSubjects(await subjectsRes.json());
            setLastFetched(new Date().toLocaleTimeString());
        } catch (e) {
            console.error('Report fetch error', e);
        } finally {
            setIsLoading(false);
        }
    }, [getDateParams, selectedSubject, selectedStatus, token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── CSV Export ──────────────────────────────────────────────────────────────
    const handleExportCSV = () => {
        if (records.length === 0) return;
        const header = ['Roll No', 'Name', 'Class', 'Division', 'Subject', 'Date', 'Status'];
        const rows = records.map(r => [r.roll_no, r.name, r.class_name, r.division, r.subject, r.date,
        r.status === 'P' ? 'Present' : r.status === 'A' ? 'Absent' : 'Late']);
        const csv = [header, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const handlePrint = () => window.print();

    // ── Helpers ─────────────────────────────────────────────────────────────────
    const statusBadge = (s: string) => {
        if (s === 'P') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (s === 'A') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    };
    const statusLabel = (s: string) => s === 'P' ? 'Present' : s === 'A' ? 'Absent' : 'Late';
    const pctColor = (p: number) => p >= 90 ? 'text-green-600' : p >= 75 ? 'text-yellow-600' : 'text-red-600';

    const present = records.filter(r => r.status === 'P').length;
    const absent = records.filter(r => r.status === 'A').length;
    const late = records.filter(r => r.status === 'L').length;
    const avgPct = records.length > 0 ? Math.round(((present + late) / records.length) * 100) : 0;

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Header />
            <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">

                {/* Banner */}
                <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-5 sm:p-8 shadow-lg`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                                <FileText className="w-7 h-7" /> Attendance Reports
                            </h1>
                            <p className="text-white/80 text-sm mt-1">Live data from your database</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={fetchData} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm transition-all">
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                            </button>
                            <button onClick={handleExportCSV} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm transition-all">
                                <Download className="w-4 h-4" /> CSV
                            </button>
                            <button onClick={handlePrint} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg text-sm transition-all">
                                <Printer className="w-4 h-4" /> Print
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Total Students', value: stats?.total_students ?? 0, icon: Users, color: 'text-blue-600' },
                        { label: 'Avg Attendance', value: `${avgPct}%`, icon: TrendingUp, color: 'text-green-600' },
                        { label: 'Present', value: present, icon: CheckCircle, color: 'text-green-600' },
                        { label: 'Absent', value: absent, icon: XCircle, color: 'text-red-600' },
                        { label: 'Late', value: late, icon: Clock, color: 'text-yellow-600' },
                        { label: 'Defaulters', value: defaulters.length, icon: AlertCircle, color: 'text-red-600' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Icon className={`w-4 h-4 ${color}`} />
                                <p className="text-[10px] sm:text-xs text-gray-500 leading-tight">{label}</p>
                            </div>
                            <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Filters
                            {lastFetched && <span className="text-xs font-normal text-gray-400 ml-2">Updated {lastFetched}</span>}
                        </h2>
                        <button onClick={() => setShowFilters(f => !f)}
                            className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                            {showFilters ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
                                <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {/* Subject — populated from real DB */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                    <option value="">All Subjects</option>
                                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Status filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                                    <option value="">All</option>
                                    <option value="P">Present</option>
                                    <option value="A">Absent</option>
                                    <option value="L">Late</option>
                                </select>
                            </div>

                            {/* Custom date pickers */}
                            {dateRange === 'custom' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Records Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Attendance Records</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{records.length} records found</p>
                        </div>
                        {isLoading && <Loader className="w-5 h-5 animate-spin text-indigo-500" />}
                    </div>

                    {records.length === 0 && !isLoading ? (
                        <div className="text-center py-20 text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No records found</p>
                            <p className="text-sm mt-1">Try changing the date range or filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px]">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        {['Roll No', 'Student Name', 'Class', 'Subject', 'Date', 'Status'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {records.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{record.roll_no}</td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div>{record.name}</div>
                                                <div className="text-xs text-gray-400">{record.student_id}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{record.class_name}-{record.division}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{record.subject}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{record.date}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(record.status)}`}>
                                                    {statusLabel(record.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 text-right">
                        {records.length} records · {present}P / {absent}A / {late}L
                    </div>
                </div>

                {/* Defaulters Table */}
                {defaulters.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500" /> Defaulters (Below 75%)
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">{defaulters.length} students at risk</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-red-50 dark:bg-red-900/20">
                                    <tr>
                                        {['Student', 'Class', 'Subject', 'P / A / L', 'Attendance %'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {defaulters.map((d, i) => (
                                        <tr key={i} className="hover:bg-red-50/40 dark:hover:bg-red-900/10 transition-colors">
                                            <td className="px-4 py-3 text-sm">
                                                <div className="font-medium text-gray-900 dark:text-white">{d.name}</div>
                                                <div className="text-xs text-gray-400">{d.student_id}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{d.class_name} {d.division}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{d.subject}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="text-green-600 font-medium">{d.present}P</span>
                                                {' / '}
                                                <span className="text-red-600 font-medium">{d.absent}A</span>
                                                {' / '}
                                                <span className="text-amber-600 font-medium">{d.late}L</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-sm font-bold ${pctColor(d.percentage)}`}>{d.percentage}%</span>
                                                <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1">
                                                    <div className={`h-1.5 rounded-full ${d.percentage < 60 ? 'bg-red-500' : 'bg-orange-400'}`}
                                                        style={{ width: `${d.percentage}%` }} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default Reports;
