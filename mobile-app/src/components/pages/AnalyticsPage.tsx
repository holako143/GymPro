"use client";
import React, { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { formatTime } from '@/utils/formatters';
import { AnalyticsCard } from '../analytics/AnalyticsCard';
import { Calendar } from '../analytics/Calendar';
import { WorkoutHistoryList } from '../analytics/WorkoutHistoryList';
import { PlannedWorkoutList } from '../analytics/PlannedWorkoutList';

export const AnalyticsPage = () => {
    const { state, dispatch } = useAppContext();
    const { exercises, sessionHistory, plannedWorkouts, trainingPlans } = state;

    const stats = useMemo(() => {
        let totalVolume = 0;
        let maxWeight = 0;
        let totalExerciseDuration = 0;
        let max1RM = 0;
        const difficultyCounts = { 'very-easy': 0, 'easy': 0, 'medium': 0, 'hard': 0, 'very-hard': 0 };
        const muscleVolume = {};

        sessionHistory.forEach(item => {
            const exercise = exercises.find(ex => ex.id === item.exerciseId);
            totalVolume += item.data.volume;
            totalExerciseDuration += item.data.duration;
            if (item.data.weight > maxWeight) maxWeight = item.data.weight;
            if (item.data.oneRM > max1RM) max1RM = item.data.oneRM;
            if (item.data.difficulty) difficultyCounts[item.data.difficulty]++;
            if (exercise) {
                if (!muscleVolume[exercise.muscle]) muscleVolume[exercise.muscle] = 0;
                muscleVolume[exercise.muscle] += item.data.volume;
            }
        });

        const weightCount = sessionHistory.filter(item => item.data.weight > 0).length;
        const avgWeight = weightCount > 0 ? totalVolume / weightCount : 0;

        let strongestMuscle = '-';
        let weakestMuscle = '-';
        if (Object.keys(muscleVolume).length > 0) {
            const sortedMuscles = Object.entries(muscleVolume).sort((a, b) => (b[1] as number) - (a[1] as number));
            strongestMuscle = sortedMuscles[0][0];
            weakestMuscle = sortedMuscles[sortedMuscles.length - 1][0];
        }

        return { totalVolume, maxWeight, totalExerciseDuration, max1RM, avgWeight, difficultyCounts, strongestMuscle, weakestMuscle };
    }, [sessionHistory, exercises]);

    const handleDateClick = (date: string) => {
        dispatch({ type: 'OPEN_MODAL', payload: { modal: 'planForDate', isOpen: true, context: { date } } });
    };

    const handleHistoryItemClick = (exerciseId: number, sessionNumber: number) => {
        dispatch({ type: 'OPEN_MODAL', payload: { modal: 'sessionDetails', isOpen: true, context: { exerciseId, sessionNumber } } });
    };

    const difficultyEmojis = { 'very-easy': '😊', 'easy': '🙂', 'medium': '😐', 'hard': '😟', 'very-hard': '😫' };
    const difficultyLabels = { 'very-easy': 'سهل جداً', 'easy': 'سهل', 'medium': 'متوسط', 'hard': 'ثقيل', 'very-hard': 'ثقيل جداً' };

    return (
        <div className="page active" id="analytics">
            <div className="container">
                <h2 style={{ margin: '20px 0' }}>التحليلات والإحصائيات</h2>

                <div className="analytics-cards">
                    <AnalyticsCard title="تحليل الأوزان والحجم">
                        <div className="analytics-stats">
                            <div className="analytics-stat">
                                <div className="analytics-value">{stats.maxWeight.toFixed(1)}</div>
                                <div className="analytics-label">أقصى وزن (كجم)</div>
                            </div>
                            <div className="analytics-stat">
                                <div className="analytics-value">{stats.avgWeight.toFixed(1)}</div>
                                <div className="analytics-label">متوسط الوزن (كجم)</div>
                            </div>
                            <div className="analytics-stat">
                                <div className="analytics-value">{stats.totalVolume.toFixed(0)}</div>
                                <div className="analytics-label">إجمالي الحجم (كجم)</div>
                            </div>
                            <div className="analytics-stat">
                                <div className="analytics-value">{stats.max1RM.toFixed(1)}</div>
                                <div className="analytics-label">أقصى 1RM (كجم)</div>
                            </div>
                        </div>
                    </AnalyticsCard>

                    <AnalyticsCard title="تحليل الصعوبة">
                         <div className="difficulty-stats">
                            {Object.entries(stats.difficultyCounts).map(([key, value]) => (
                                <div className="difficulty-stat" key={key}>
                                    <div className="difficulty-emoji">{difficultyEmojis[key]}</div>
                                    <div className="difficulty-count">{value}</div>
                                    <div className="difficulty-label">{difficultyLabels[key]}</div>
                                </div>
                            ))}
                        </div>
                    </AnalyticsCard>

                    <AnalyticsCard title="تحليل العضلات (حسب الحجم)">
                        <div className="muscle-stats">
                            <div className="muscle-stat">
                                <div className="muscle-name">أقوى عضلة</div>
                                <div className="muscle-value strong">{stats.strongestMuscle}</div>
                            </div>
                            <div className="muscle-stat">
                                <div className="muscle-name">أضعف عضلة</div>
                                <div className="muscle-value weak">{stats.weakestMuscle}</div>
                            </div>
                        </div>
                    </AnalyticsCard>

                    <AnalyticsCard title="تقويم التمارين">
                        <Calendar
                            plannedWorkouts={plannedWorkouts}
                            sessionHistory={sessionHistory}
                            onDateClick={handleDateClick}
                        />
                    </AnalyticsCard>

                    <AnalyticsCard title="خطط التمارين المجدولة">
                        <PlannedWorkoutList
                            plannedWorkouts={plannedWorkouts}
                            trainingPlans={trainingPlans}
                        />
                    </AnalyticsCard>

                    <AnalyticsCard title="سجل التمارين الكامل">
                        <WorkoutHistoryList
                            sessionHistory={sessionHistory}
                            exercises={exercises}
                            onItemClick={handleHistoryItemClick}
                        />
                    </AnalyticsCard>
                </div>
            </div>
        </div>
    );
};