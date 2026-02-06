import React from 'react';

interface WeeklyChartProps {
    data: number[];
    labels: string[];
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data, labels }) => {
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    // Calculate points for the line
    const width = 700;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Weekly Attendance Trend</h3>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Filter">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Download">
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map((i) => {
                    const y = padding + (i / 4) * chartHeight;
                    return (
                        <line
                            key={i}
                            x1={padding}
                            y1={y}
                            x2={width - padding}
                            y2={y}
                            stroke="#e5e7eb"
                            className="dark:stroke-gray-700"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map((i) => {
                    const y = padding + (i / 4) * chartHeight;
                    const value = Math.round(maxValue - (i / 4) * range);
                    return (
                        <text
                            key={i}
                            x={padding - 10}
                            y={y + 5}
                            textAnchor="end"
                            fontSize="12"
                            fill="#9ca3af"
                            className="dark:fill-gray-500"
                        >
                            {value}
                        </text>
                    );
                })}

                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Gradient definition */}
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                </defs>

                {/* Data points */}
                {data.map((value, index) => {
                    const x = padding + (index / (data.length - 1)) * chartWidth;
                    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#3b82f6"
                            className="hover:r-6 transition-all cursor-pointer"
                        />
                    );
                })}

                {/* X-axis labels */}
                {labels.map((label, index) => {
                    const x = padding + (index / (data.length - 1)) * chartWidth;
                    return (
                        <text
                            key={index}
                            x={x}
                            y={height - 10}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#9ca3af"
                            className="dark:fill-gray-500"
                        >
                            {label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

export default WeeklyChart;
