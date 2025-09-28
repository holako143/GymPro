"use client";
import React from 'react';
import { useAppContext, SessionHistoryItem, Exercise } from '@/context/AppContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface WorkoutHistoryListProps {
    sessionHistory: SessionHistoryItem[];
    exercises: Exercise[];
    onItemClick: (exerciseId: number, sessionNumber: number) => void;
}

const getDifficultyLabelAndClass = (difficulty: string) => {
    const labels = { 'very-easy': 'سهل جداً', 'easy': 'سهل', 'medium': 'متوسط', 'hard': 'ثقيل', 'very-hard': 'ثقيل جداً' };
    return {
        label: labels[difficulty] || difficulty,
        className: `difficulty-${difficulty}`
    };
};

export const WorkoutHistoryList: React.FC<WorkoutHistoryListProps> = ({ sessionHistory, exercises, onItemClick }) => {

    const sortedHistory = [...sessionHistory].sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

    if (sortedHistory.length === 0) {
        return <p style={{ textAlign: 'center', color: 'var(--gray)' }}>لا توجد جلسات مكتملة لعرضها في السجل.</p>;
    }

    return (
        <div id="full-workout-history" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {sortedHistory.map(item => {
                const exercise = exercises.find(ex => ex.id === item.exerciseId);
                if (!exercise) return null;

                const { label: difficultyLabel, className: difficultyClass } = getDifficultyLabelAndClass(item.data.difficulty);
                const recordDate = new Date(item.data.date);
                const formattedDate = format(recordDate, "d MMMM yyyy", { locale: ar });
                const formattedTime = format(recordDate, "p", { locale: ar });

                return (
                    <div
                        key={item.id}
                        className={`history-item ${difficultyClass}`}
                        onClick={() => onItemClick(item.exerciseId, item.sessionNumber)}
                    >
                        <div className="history-item-header">
                            <span className="history-exercise-name">{exercise.name} - الجلسة {item.sessionNumber}</span>
                            <span className="history-date">{formattedDate} {formattedTime}</span>
                        </div>
                        <div className="history-details">
                            <span><span className="history-detail-label">الوزن:</span> {item.data.weight} كجم</span>
                            <span><span className="history-detail-label">العدات:</span> {item.data.reps}</span>
                            <span><span className="history-detail-label">الصعوبة:</span> {difficultyLabel}</span>
                            <span><span className="history-detail-label">الحجم:</span> {item.data.volume || 0} كجم</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};