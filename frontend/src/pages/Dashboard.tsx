import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
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
        },
        college: {
            gradient: 'from-indigo-600 via-purple-600 to-pink-500',
            textGradient: 'from-indigo-600 to-purple-600',
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
            {/* Welcome Banner */}
            <div className={`bg-gradient-to-r ${currentTheme.gradient} rounded-3xl p-8 mb-6 shadow-lg`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                            Welcome Back, {user?.username}! 👋
                        </h1>
                        <p className="text-white/90 text-lg">
                            Here's what's happening at your {institutionType} today
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/80 text-sm">Today's Date</p>
                        <p className="text-white font-semibold text-lg">{getCurrentDate()}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
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

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
