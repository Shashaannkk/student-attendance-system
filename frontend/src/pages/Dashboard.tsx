import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import WeeklyChart from '../components/WeeklyChart';
import DonutChart from '../components/DonutChart';

const Dashboard = () => {
    const { user } = useAuth();

    // Determine theme based on institution type (default to school)
    const institutionType = user?.institution_type || 'school';

    const themes = {
        school: {
            gradient: 'from-blue-500 via-cyan-500 to-teal-400',
            textGradient: 'from-blue-600 to-cyan-600',
            stats: {
                students: { bg: 'bg-blue-100', text: 'text-blue-600' }
            }
        },
        college: {
            gradient: 'from-indigo-600 via-purple-600 to-pink-500',
            textGradient: 'from-indigo-600 to-purple-600',
            stats: {
                students: { bg: 'bg-indigo-100', text: 'text-indigo-600' }
            }
        }
    };

    const currentTheme = themes[institutionType];

    // Mock data - Replace with real API calls later
    const stats = {
        totalStudents: 485,
        presentToday: 445,
        absentToday: 25,
        lateToday: 15,
        trends: {
            total: 12,
            present: 5,
            absent: -2,
            late: 3
        }
    };

    // Mock weekly data
    const weeklyData = [450, 448, 452, 447, 449, 451, 445];
    const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Get current date
    const getCurrentDate = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date();
        return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Welcome Banner - Mobile Responsive */}
            <div className={`bg-gradient-to-r ${currentTheme.gradient} rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-lg`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
                            Welcome to {user?.institution_name || 'Your Institution'}! 👋
                        </h1>
                        <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                            Here's what's happening at your {institutionType} today
                        </p>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-white/80 text-xs sm:text-sm">Today's Date</p>
                        <p className="text-white font-semibold text-base sm:text-lg">{getCurrentDate()}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                    iconBgColor={currentTheme.stats.students.bg}
                    iconColor={currentTheme.stats.students.text}
                    trend={stats.trends.total}
                    trendDirection="up"
                />
                <StatCard
                    title="Present Today"
                    value={stats.presentToday}
                    icon={UserCheck}
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                    trend={stats.trends.present}
                    trendDirection="up"
                />
                <StatCard
                    title="Absent Today"
                    value={stats.absentToday}
                    icon={UserX}
                    iconBgColor="bg-red-100"
                    iconColor="text-red-600"
                    trend={stats.trends.absent}
                    trendDirection="down"
                />
                <StatCard
                    title="Late Today"
                    value={stats.lateToday}
                    icon={Clock}
                    iconBgColor="bg-yellow-100"
                    iconColor="text-yellow-600"
                    trend={stats.trends.late}
                    trendDirection="up"
                />
            </div>

            {/* Charts Row - Mobile Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                    <WeeklyChart data={weeklyData} labels={weeklyLabels} />
                </div>
                <div>
                    <DonutChart present={stats.presentToday} absent={stats.absentToday} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
