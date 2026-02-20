import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, UserX, Clock, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import WeeklyChart from '../components/WeeklyChart';
import DonutChart from '../components/DonutChart';
import { API_URL } from '../config';

interface DayData {
    date: string;
    label: string;
    present: number;
    absent: number;
    late: number;
    total: number;
}

interface StatsData {
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
    roll_no: number;
    subject: string;
    percentage: number;
    present: number;
    absent: number;
    late: number;
    total: number;
}

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const institutionType = user?.institution_type || 'school';
    const themes = {
        school: {
            gradient: 'from-blue-500 via-cyan-500 to-teal-400',
            stats: { students: { bg: 'bg-blue-100', text: 'text-blue-600' } }
        },
        college: {
            gradient: 'from-indigo-600 via-purple-600 to-pink-500',
            stats: { students: { bg: 'bg-indigo-100', text: 'text-indigo-600' } }
        }
    };
    const currentTheme = themes[institutionType as keyof typeof themes] || themes.school;

    const [stats, setStats] = useState<StatsData | null>(null);
    const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
    const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    const token = localStorage.getItem('token');

    const fetchAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, weeklyRes, defaultersRes] = await Promise.all([
                fetch(`${API_URL}/attendance/stats`, { headers }),
                fetch(`${API_URL}/attendance/weekly`, { headers }),
                fetch(`${API_URL}/attendance/defaulters?threshold=75`, { headers }),
            ]);

            if (statsRes.ok) {
                const s = await statsRes.json();
                setStats(s);
            }
            if (weeklyRes.ok) {
                const w = await weeklyRes.json();
                setWeeklyData(w);
            }
            if (defaultersRes.ok) {
                const d = await defaultersRes.json();
                setDefaulters(d.slice(0, 10)); // top 10 worst
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setIsLoading(false);
            setLastRefreshed(new Date());
        }
    }, [token]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const getCurrentDate = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date();
        return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    };

    // Derive chart arrays from weeklyData
    const weeklyPresentArr = weeklyData.map(d => d.present);
    const weeklyLabels = weeklyData.map(d => d.label);

    const presentToday = stats?.present ?? 0;
    const absentToday = stats?.absent ?? 0;
    const lateToday = stats?.late ?? 0;
    const totalStudents = stats?.total_students ?? 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Header />

            <main role="main" aria-label="Dashboard content">
                {/* Welcome Banner */}
                <section className={`bg-gradient-to-r ${currentTheme.gradient} rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-lg`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
                                Welcome to {user?.institution_name || 'Your Institution'}! <span>👋</span>
                            </h1>
                            <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                                Here's what's happening at your {institutionType} today
                            </p>
                        </div>
                        <div className="text-left sm:text-right">
                            <p className="text-white/80 text-xs sm:text-sm">Today's Date</p>
                            <p className="text-white font-semibold text-base sm:text-lg">{getCurrentDate()}</p>
                            <button
                                onClick={fetchAll}
                                className="mt-2 flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-medium transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </section>

                {/* Stats Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <StatCard
                        title="Total Students"
                        value={totalStudents}
                        icon={Users}
                        iconBgColor={currentTheme.stats.students.bg}
                        iconColor={currentTheme.stats.students.text}
                        trend={0}
                        trendDirection="up"
                    />
                    <StatCard
                        title="Present Today"
                        value={presentToday}
                        icon={UserCheck}
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                        trend={totalStudents > 0 ? Math.round((presentToday / Math.max(totalStudents, 1)) * 100) : 0}
                        trendDirection="up"
                    />
                    <StatCard
                        title="Absent Today"
                        value={absentToday}
                        icon={UserX}
                        iconBgColor="bg-red-100"
                        iconColor="text-red-600"
                        trend={totalStudents > 0 ? Math.round((absentToday / Math.max(totalStudents, 1)) * 100) : 0}
                        trendDirection="down"
                    />
                    <StatCard
                        title="Late Today"
                        value={lateToday}
                        icon={Clock}
                        iconBgColor="bg-yellow-100"
                        iconColor="text-yellow-600"
                        trend={totalStudents > 0 ? Math.round((lateToday / Math.max(totalStudents, 1)) * 100) : 0}
                        trendDirection="up"
                    />
                </section>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                    <div className="lg:col-span-2">
                        <WeeklyChart data={weeklyPresentArr} labels={weeklyLabels} />
                    </div>
                    <div>
                        <DonutChart present={presentToday} absent={absentToday} />
                    </div>
                </div>

                {/* Defaulters Section */}
                {defaulters.length > 0 && (
                    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">⚠️ Defaulters</h2>
                                <p className="text-sm text-gray-500">Students with attendance below 75%</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700">
                                        <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Student</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Class</th>
                                        <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Subject</th>
                                        <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Attendance %</th>
                                        <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">P / A / L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {defaulters.map((d, i) => (
                                        <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                            <td className="py-3 px-3">
                                                <p className="font-medium text-gray-900 dark:text-white">{d.name}</p>
                                                <p className="text-xs text-gray-500">{d.student_id}</p>
                                            </td>
                                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{d.class_name} {d.division}</td>
                                            <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{d.subject}</td>
                                            <td className="py-3 px-3 text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                          ${d.percentage < 60 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {d.percentage}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <span className="text-green-600 font-medium">{d.present}P</span>
                                                {' / '}
                                                <span className="text-red-600 font-medium">{d.absent}A</span>
                                                {' / '}
                                                <span className="text-amber-600 font-medium">{d.late}L</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* Quick Actions */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => navigate('/take-attendance')}
                        className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg">Take Attendance</p>
                            <p className="text-white/80 text-sm">Mark today's attendance by class</p>
                        </div>
                        <TrendingUp className="w-6 h-6 ml-auto opacity-60" />
                    </button>
                    <button
                        onClick={() => navigate('/reports')}
                        className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg">View Reports</p>
                            <p className="text-white/80 text-sm">Detailed attendance analytics</p>
                        </div>
                        <TrendingUp className="w-6 h-6 ml-auto opacity-60" />
                    </button>
                </section>

                {/* Last refreshed */}
                <p className="text-center text-xs text-gray-400 pb-4">
                    Last updated: {lastRefreshed.toLocaleTimeString()}
                </p>
            </main>
        </div>
    );
};

export default Dashboard;
