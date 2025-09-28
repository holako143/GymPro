"use client";
import React, { useState, useMemo } from 'react';
import { useAppContext, PlannedWorkout, SessionHistoryItem } from '@/context/AppContext';

interface CalendarProps {
    plannedWorkouts: PlannedWorkout[];
    sessionHistory: SessionHistoryItem[];
    onDateClick: (date: string) => void;
}

const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export const Calendar: React.FC<CalendarProps> = ({ plannedWorkouts, sessionHistory, onDateClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const completedDates = useMemo(() => {
        const dates = new Set<string>();
        sessionHistory.forEach(item => {
            dates.add(new Date(item.data.date).toISOString().split('T')[0]);
        });
        return dates;
    }, [sessionHistory]);

    const plannedDates = useMemo(() => {
        const dates = new Set<string>();
        plannedWorkouts.forEach(item => {
            dates.add(item.date);
        });
        return dates;
    }, [plannedWorkouts]);

    const renderCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const grid = [];
        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(<div key={`empty-${i}`} className="empty-day"></div>);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Add day cells
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];

            const isToday = date.getTime() === today.getTime();
            const isCompleted = completedDates.has(dateString);
            const isPlanned = plannedDates.has(dateString);

            let className = 'calendar-day';
            if (isToday) className += ' today';
            if (isCompleted) className += ' completed-day';
            if (isPlanned) className += ' planned-day';
            if (date < today) className += ' past-date';

            grid.push(
                <div key={day} className={className} onClick={() => date >= today && onDateClick(dateString)}>
                    {day}
                </div>
            );
        }
        return grid;
    };

    const goToPrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <div>
            <div className="calendar-nav">
                <button onClick={goToPrevMonth} className="btn btn-secondary">&lt;</button>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button onClick={goToNextMonth} className="btn btn-secondary">&gt;</button>
            </div>
            <div id="calendar-grid">
                <div className="day-name">أحد</div>
                <div className="day-name">إثنين</div>
                <div className="day-name">ثلاثاء</div>
                <div className="day-name">أربعاء</div>
                <div className="day-name">خميس</div>
                <div className="day-name">جمعة</div>
                <div className="day-name">سبت</div>
                {renderCalendarGrid()}
            </div>
        </div>
    );
};