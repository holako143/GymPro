"use client";
import React, { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { formatTime, getDifficultyLabel, getDifficultyEmoji } from '@/utils/formatters';
// Assuming an analytics service exists for complex calculations
// import * as AnalyticsService from '@/services/analyticsService';

export const AnalyticsPage: React.FC = () => {
    const { state } = useAppContext();

    // This is a simplified version of the analytics calculation.
    // In a real app, this would be more robust and likely memoized with useMemo.
    const analytics = useMemo(() => {
        const allSessionRecords = state.exercises.flatMap(exercise =>
            Object.values(exercise.sessionData).map(session => ({
                ...session,
                muscle: exercise.muscle
            }))
        );

        const totalSessionExerciseDuration = allSessionRecords.reduce((acc, s) => acc + (s.duration || 0), 0);
        const totalVolume = allSessionRecords.reduce((acc, s) => acc + (s.weight * s.reps), 0);
        const maxWeight = Math.max(0, ...allSessionRecords.map(s => s.weight));
        const max1RM = Math.max(0, ...allSessionRecords.map(s => Math.round(s.weight * (1 + s.reps / 30))));

        const difficultyStats = allSessionRecords.reduce((acc, s) => {
            acc[s.difficulty] = (acc[s.difficulty] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            completedExercises: state.exercises.filter(e => e.status === 'completed').length,
            totalExercises: state.exercises.length,
            totalSessionExerciseDuration,
            totalVolume,
            maxWeight,
            max1RM,
            difficultyStats,
        };
    }, [state.exercises]);

    return (
        <div className="page active" id="analytics">
            <div className="container">
                <h2 style={{ margin: '20px 0' }}>التحليلات والإحصائيات</h2>

                <div className="analytics-cards">
                    <div className="analytics-card">
                        <div className="analytics-title">تقدم الجلسة</div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${analytics.totalExercises > 0 ? (analytics.completedExercises / analytics.totalExercises) * 100 : 0}%` }}></div>
                        </div>
                        <div className="analytics-stats">
                            <div className="analytics-stat">
                                <div className="analytics-value">{analytics.completedExercises}</div>
                                <div className="analytics-label">تمارين مكتملة</div>
                            </div>
                            <div className="analytics-stat">
                                <div className="analytics-value">{analytics.totalExercises}</div>
                                <div className="analytics-label">إجمالي التمارين</div>
                            </div>
                        </div>
                    </div>

                     <div className="analytics-card">
                        <div className="analytics-title">تحليل الوقت</div>
                        <div className="analytics-stats">
                            <div className="analytics-stat">
                                <div className="analytics-value">{formatTime(analytics.totalSessionExerciseDuration)}</div>
                                <div className="analytics-label">وقت التمرين الفعلي الكلي</div>
                            </div>
                            {/* Placeholder for rest time */}
                            <div className="analytics-stat">
                                <div className="analytics-value">00:00</div>
                                <div className="analytics-label">وقت الراحة الكلي</div>
                            </div>
                        </div>
                    </div>

                    <div className="analytics-card">
                        <div className="analytics-title">تحليل الأوزان والحجم</div>
                        <div className="analytics-stats">
                            <div className="analytics-stat">
                                <div className="analytics-value">{analytics.maxWeight}</div>
                                <div className="analytics-label">أقصى وزن (كجم)</div>
                            </div>
                            <div className="analytics-stat">
                                <div className="analytics-value">{analytics.totalVolume}</div>
                                <div className="analytics-label">إجمالي الحجم (كجم)</div>
                            </div>
                             <div className="analytics-stat">
                                <div className="analytics-value">{analytics.max1RM}</div>
                                <div className="analytics-label">أقصى 1RM (كجم)</div>
                            </div>
                        </div>
                    </div>

                    <div className="analytics-card">
                        <div className="analytics-title">تحليل الصعوبة</div>
                        <div className="difficulty-stats">
                            {Object.entries(analytics.difficultyStats).map(([key, value]) => (
                                <div key={key} className="difficulty-stat">
                                    <div className="difficulty-emoji">{getDifficultyEmoji(key)}</div>
                                    <div className="difficulty-count">{value}</div>
                                    <div className="difficulty-label">{getDifficultyLabel(key)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};