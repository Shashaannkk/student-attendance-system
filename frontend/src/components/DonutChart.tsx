import React from 'react';

interface DonutChartProps {
    present: number;
    absent: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ present, absent }) => {
    const total = present + absent;
    const presentPercentage = total > 0 ? (present / total) * 100 : 0;
    const absentPercentage = total > 0 ? (absent / total) * 100 : 0;

    // Calculate SVG arc paths
    const size = 200;
    const strokeWidth = 30;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const presentDasharray = (presentPercentage / 100) * circumference;
    const absentDasharray = (absentPercentage / 100) * circumference;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Today's Overview</h3>

            <div className="flex items-center justify-center relative">
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        className="dark:stroke-gray-700"
                        strokeWidth={strokeWidth}
                    />

                    {/* Present segment (green) */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${presentDasharray} ${circumference}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />

                    {/* Absent segment (red) */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${absentDasharray} ${circumference}`}
                        strokeDashoffset={-presentDasharray}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{present}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Present</div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Present</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{present}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Absent</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{absent}</span>
                </div>
            </div>
        </div>
    );
};

export default DonutChart;
