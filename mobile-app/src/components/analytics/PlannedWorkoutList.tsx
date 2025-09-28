"use client";
import React from 'react';
import { useAppContext, PlannedWorkout, TrainingPlan } from '@/context/AppContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface PlannedWorkoutListProps {
    plannedWorkouts: PlannedWorkout[];
    trainingPlans: TrainingPlan[];
}

export const PlannedWorkoutList: React.FC<PlannedWorkoutListProps> = ({ plannedWorkouts, trainingPlans }) => {
    const { dispatch } = useAppContext();

    const handleDelete = (id: number) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الخطة المجدولة؟')) {
            dispatch({ type: 'DELETE_PLANNED_WORKOUT', payload: id });
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingWorkouts = plannedWorkouts
        .filter(pw => new Date(pw.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (upcomingWorkouts.length === 0) {
        return <p style={{ textAlign: 'center', color: 'var(--gray)' }}>لا توجد خطط مجدولة.</p>;
    }

    return (
        <div id="scheduled-workouts-list">
            {upcomingWorkouts.map(planned => {
                const plan = trainingPlans.find(p => p.id === planned.planId);
                if (!plan) return null;

                const planDate = new Date(planned.date);
                // Adjust for timezone issues by working with UTC dates
                const utcDate = new Date(planDate.getUTCFullYear(), planDate.getUTCMonth(), planDate.getUTCDate());
                const formattedDate = format(utcDate, "d MMMM yyyy", { locale: ar });

                return (
                    <div key={planned.id} className="planned-workout-item">
                        <div className="planned-workout-info">
                            <div className="date">{formattedDate}</div>
                            <div className="plan-name">{plan.name}</div>
                        </div>
                        <div className="planned-workout-actions">
                            <button className="btn btn-danger" onClick={() => handleDelete(planned.id)}>
                                حذف
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};