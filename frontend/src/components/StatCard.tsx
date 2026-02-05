import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    iconBgColor: string;
    iconColor: string;
    trend?: number;
    trendDirection?: 'up' | 'down';
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    iconBgColor,
    iconColor,
    trend,
    trendDirection
}) => {
    return (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
                    {trend !== undefined && (
                        <div className="flex items-center mt-1 sm:mt-2">
                            <span className={`text-xs font-medium ${trendDirection === 'up'
                                ? trend > 0 ? 'text-green-600' : 'text-red-600'
                                : trend > 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            </span>
                        </div>
                    )}
                </div>
                <div className={`${iconBgColor} rounded-lg sm:rounded-xl p-2 sm:p-3`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
};

export default StatCard;
