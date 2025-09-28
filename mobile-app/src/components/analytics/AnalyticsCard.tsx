import React, { ReactNode } from 'react';

interface AnalyticsCardProps {
    title: string;
    children: ReactNode;
    className?: string;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, children, className = '' }) => {
    return (
        <div className={`analytics-card ${className}`}>
            <div className="analytics-title">{title}</div>
            {children}
        </div>
    );
};