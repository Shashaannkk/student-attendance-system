import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import {
    Calendar,
    Download,
    FileText,
    Filter,
    TrendingUp,
    Users,
    BookOpen,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    Printer,
    FileSpreadsheet,
    FileDown
} from 'lucide-react';

type ReportType = 'student' | 'class' | 'subject' | 'defaulters' | 'summary';
type DateRange = 'today' | 'week' | 'month' | 'custom';

interface AttendanceRecord {
    id: string;
    studentName: string;
    rollNumber: string;
    class: string;
    subject: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    percentage: number;
}

const Reports = () => {
    const { user } = useAuth();
    const institutionType = user?.institution_type || 'school';
    const isSchool = institutionType === 'school';

    // Theme configuration
    const theme = {
        gradient: isSchool ? 'from-blue-500 to-cyan-500' : 'from-indigo-600 to-purple-600',
        primary: isSchool ? 'blue' : 'indigo',
        hover: isSchool ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
    };

    // State management
    const [reportType, setReportType] = useState<ReportType>('summary');
    const [dateRange, setDateRange] = useState<DateRange>('month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedClass, setSelectedClass] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    // Mock data - Replace with actual API calls
    const mockData: AttendanceRecord[] = [
        { id: '1', studentName: 'John Doe', rollNumber: '001', class: '10-A', subject: 'Mathematics', date: '2026-02-10', status: 'present', percentage: 95 },
        { id: '2', studentName: 'Jane Smith', rollNumber: '002', class: '10-A', subject: 'Mathematics', date: '2026-02-10', status: 'present', percentage: 92 },
        { id: '3', studentName: 'Bob Johnson', rollNumber: '003', class: '10-A', subject: 'Mathematics', date: '2026-02-10', status: 'absent', percentage: 68 },
        { id: '4', studentName: 'Alice Williams', rollNumber: '004', class: '10-B', subject: 'Science', date: '2026-02-10', status: 'late', percentage: 88 },
        { id: '5', studentName: 'Charlie Brown', rollNumber: '005', class: '10-B', subject: 'Science', date: '2026-02-10', status: 'present', percentage: 98 },
    ];

    const summaryStats = {
        totalStudents: 485,
        averageAttendance: 91.5,
        presentToday: 445,
        absentToday: 25,
        lateToday: 15,
        defaulters: 12,
    };

    // Report type options
    const reportTypes = [
        { value: 'summary', label: 'Summary Report', icon: FileText },
        { value: 'student', label: 'Student-wise', icon: Users },
        { value: 'class', label: 'Class-wise', icon: BookOpen },
        { value: 'subject', label: 'Subject-wise', icon: BookOpen },
        { value: 'defaulters', label: 'Defaulters (<75%)', icon: AlertCircle },
    ];

    // Export handlers
    const handleExportPDF = () => {
        console.log('Exporting to PDF...');
        // Implement PDF export logic
    };

    const handleExportExcel = () => {
        console.log('Exporting to Excel...');
        // Implement Excel export logic
    };

    const handleExportCSV = () => {
        console.log('Exporting to CSV...');
        // Implement CSV export logic
    };

    const handlePrint = () => {
        window.print();
    };

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'absent':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'late':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    // Get percentage color
    const getPercentageColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600 dark:text-green-400';
        if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Header />

            <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Page Header */}
                <div className={`bg-gradient-to-r ${theme.gradient} rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                                <FileText className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                                Attendance Reports
                            </h1>
                            <p className="text-white/90 text-sm sm:text-base">
                                Generate comprehensive attendance reports and analytics
                            </p>
                        </div>
                        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex-1 sm:flex-initial min-w-0"
                                title="Export as PDF"
                            >
                                <FileDown className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm sm:text-base">PDF</span>
                            </button>
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex-1 sm:flex-initial min-w-0"
                                title="Export as Excel"
                            >
                                <FileSpreadsheet className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm sm:text-base">Excel</span>
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex-1 sm:flex-initial min-w-0"
                                title="Export as CSV"
                            >
                                <Download className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm sm:text-base">CSV</span>
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-all flex-1 sm:flex-initial min-w-0"
                                title="Print Report"
                            >
                                <Printer className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm sm:text-base">Print</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">Total Students</p>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.totalStudents}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">Avg. Attendance</p>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{summaryStats.averageAttendance}%</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">Present</p>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.presentToday}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">Absent</p>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.absentToday}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">Late</p>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.lateToday}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">Defaulters</p>
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{summaryStats.defaulters}</p>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                            Filters
                        </h2>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`text-xs sm:text-sm ${theme.hover} px-3 py-1.5 sm:py-1 rounded-lg transition-colors text-${theme.primary}-600 dark:text-${theme.primary}-400 font-medium`}
                        >
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Report Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Report Type
                                </label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value as ReportType)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {reportTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Date Range
                                </label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value as DateRange)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            {/* Class Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Class
                                </label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="all">All Classes</option>
                                    <option value="10-A">10-A</option>
                                    <option value="10-B">10-B</option>
                                    <option value="11-A">11-A</option>
                                    <option value="11-B">11-B</option>
                                </select>
                            </div>

                            {/* Subject Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Subject
                                </label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="all">All Subjects</option>
                                    <option value="mathematics">Mathematics</option>
                                    <option value="science">Science</option>
                                    <option value="english">English</option>
                                    <option value="history">History</option>
                                </select>
                            </div>

                            {/* Custom Date Range */}
                            {dateRange === 'custom' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Report Data Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            {reportTypes.find(t => t.value === reportType)?.label || 'Report Data'}
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Showing results for {dateRange === 'custom' ? 'custom date range' : dateRange}
                        </p>
                    </div>

                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full min-w-[640px]">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Roll No.
                                    </th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Student Name
                                    </th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Class
                                    </th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Attendance %
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {mockData.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                            {record.rollNumber}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white">
                                            {record.studentName}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            {record.class}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            {record.subject}
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusBadge(record.status)}`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                            <span className={`text-xs sm:text-sm font-bold ${getPercentageColor(record.percentage)}`}>
                                                {record.percentage}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                            Showing 1 to {mockData.length} of {mockData.length} results
                        </p>
                        <div className="flex gap-2">
                            <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium">
                                Previous
                            </button>
                            <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs sm:text-sm font-medium">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Reports;
