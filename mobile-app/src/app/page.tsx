"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext, Exercise, SessionData, TrainingPlan, initialState } from '@/context/AppContext';
import { initialDefaultData } from '@/utils/defaultData';
import { formatTime, getDifficultyEmoji, getDifficultyLabel } from '@/utils/formatters';

import ExerciseCard from '@/components/ExerciseCard';
import TrainingPlan from '@/components/TrainingPlan';
import ExerciseListItem from '@/components/ExerciseListItem';
import { ExerciseModal } from '@/components/modals/ExerciseModal';
import { SessionFinishModal } from '@/components/modals/SessionFinishModal';
import { PlanModal } from '@/components/modals/PlanModal';
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { NotificationsPage } from '@/components/pages/NotificationsPage';

// --- Main App Component ---
export default function Home() {
    const { state, dispatch } = useAppContext();
    const [isLoaded, setIsLoaded] = useState(false);

    // --- DATA PERSISTENCE & TIMER EFFECTS ---
    useEffect(() => {
        try {
            const savedState = localStorage.getItem('fitnessAppState');
            if (savedState) {
                const loaded = JSON.parse(savedState);
                loaded.sessionStartTime = null; // Timers are not persisted
                loaded.exercises.forEach((ex: Exercise) => {
                    ex.exerciseSeconds = 0;
                    ex.restSeconds = 0;
                });
                dispatch({ type: 'SET_INITIAL_STATE', payload: loaded });
            } else {
                dispatch({ type: 'LOAD_DEFAULT_DATA' });
            }
        } catch (error) {
            console.error("Failed to load state, loading default data.", error);
            dispatch({ type: 'LOAD_DEFAULT_DATA' });
        }
        setIsLoaded(true);
    }, [dispatch]);

    useEffect(() => {
        if (isLoaded) {
            const stateToSave = { ...state, sessionStartTime: null, modalContext: {}, isModalOpen: initialState.isModalOpen };
            localStorage.setItem('fitnessAppState', JSON.stringify(stateToSave));
        }
    }, [state, isLoaded]);

    useEffect(() => {
        if (!state.sessionStartTime) return;
        const interval = setInterval(() => dispatch({ type: 'TICK_GLOBAL_TIMER' }), 1000);
        return () => clearInterval(interval);
    }, [state.sessionStartTime, dispatch]);

    useEffect(() => {
        const exercise = state.exercises.find(ex => ex.id === state.currentExerciseId);
        if (!exercise || !state.sessionStartTime) return;

        let interval: NodeJS.Timeout | undefined;
        if (exercise.status === 'in-progress') {
            interval = setInterval(() => dispatch({ type: 'TICK_EXERCISE_SECONDS', payload: { exerciseId: exercise.id } }), 1000);
        } else if (exercise.status === 'resting') {
             if (exercise.restSeconds > 0) {
                 interval = setInterval(() => dispatch({ type: 'TICK_REST_SECONDS', payload: { exerciseId: exercise.id } }), 1000);
             }
        }
        return () => { if (interval) clearInterval(interval); };
    }, [state.exercises, state.currentExerciseId, state.sessionStartTime, dispatch]);


    // --- EVENT HANDLERS ---
    const handleOpenModal = (modal: string, context: any = {}) => dispatch({ type: 'OPEN_MODAL', payload: { modal, isOpen: true, context } });
    const handleActivatePlan = useCallback((id: number | null) => dispatch({ type: 'ACTIVATE_PLAN', payload: id }), [dispatch]);
    const handleDeleteExercise = useCallback((id: number) => { if (window.confirm('هل أنت متأكد؟')) dispatch({ type: 'DELETE_EXERCISE', payload: id }); }, [dispatch]);
    const handleStartExercise = useCallback((id: number) => {
        if (!state.sessionStartTime) dispatch({ type: 'START_GLOBAL_SESSION' });
        dispatch({ type: 'START_EXERCISE_TIMER', payload: id });
    }, [dispatch, state.sessionStartTime]);
    const handlePauseExercise = useCallback((id: number) => dispatch({ type: 'PAUSE_EXERCISE_TIMER', payload: id }), [dispatch]);

    const renderPage = () => {
        const activePlan = state.trainingPlans.find(p => p.id === state.activePlanId);
        const exercisesToShow = activePlan ? state.exercises.filter(ex => activePlan.exercises.includes(ex.id)) : [];

        switch (state.activePage) {
            case 'current-exercise':
                return <CurrentExercisePage exercises={exercisesToShow} state={state} onStart={handleStartExercise} onPause={handlePauseExercise} onFinish={(id) => handleOpenModal('finishSession', { exerciseId: id })} onViewDetails={(id, s) => console.log('view', id, s)} />;
            case 'exercises-list':
                return <ExercisesListPage exercises={state.exercises} onEdit={(id) => handleOpenModal('exercise', { exerciseId: id })} onDelete={handleDeleteExercise} />;
            case 'training-plans':
                return <TrainingPlansPage plans={state.trainingPlans} allExercises={state.exercises} activePlanId={state.activePlanId} onActivate={handleActivatePlan} onEdit={(id) => handleOpenModal('plan', { planId: id })} onDelete={(id) => console.log('delete plan', id)} />;
            case 'analytics': return <AnalyticsPage />;
            case 'settings': return <SettingsPage />;
            case 'notifications': return <NotificationsPage />;
            default: return <CurrentExercisePage exercises={exercisesToShow} state={state} onStart={handleStartExercise} onPause={handlePauseExercise} onFinish={(id) => handleOpenModal('finishSession', { exerciseId: id })} onViewDetails={(id, s) => console.log('view', id, s)} />;
        }
    };

    if (!isLoaded) return <div className="container">جار التحميل...</div>;

    return (
        <>
            {renderPage()}
            <BottomNav activePage={state.activePage} setActivePage={(page) => dispatch({ type: 'SET_PAGE', payload: page })} />
            <ExerciseModal />
            <SessionFinishModal />
            <PlanModal />
        </>
    );
}

// --- Page & Nav Components ---
const CurrentExercisePage = ({ exercises, state, onStart, onPause, onFinish, onViewDetails }) => {
    const { dispatch } = useAppContext();
    return (
    <div className="page active"><div className="container">
        <div className="status-bar">
            <div className="timer">{formatTime(state.globalSessionSeconds)}</div>
            <button className="start-btn" onClick={() => dispatch({ type: state.sessionStartTime ? 'STOP_GLOBAL_SESSION' : 'START_GLOBAL_SESSION' })}>
                {state.sessionStartTime ? 'إنهاء الجلسة' : 'بدء الجلسة'}
            </button>
        </div>
        <div className="cards-container">
            {exercises.map(ex => <ExerciseCard key={ex.id} exercise={ex} isActive={ex.id === state.currentExerciseId} onStart={onStart} onPause={onPause} onFinish={onFinish} onViewDetails={onViewDetails} />)}
        </div>
    </div></div>
)};
const ExercisesListPage = ({ exercises, onEdit, onDelete }) => (
    <div className="page active"><div className="container">
        <h2 className="exercises-list-title">قائمة التمارين</h2>
        <div id="exercises-container">
            {exercises.map(ex => <ExerciseListItem key={ex.id} exercise={ex} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
        <button className="add-exercise-btn" onClick={() => onEdit(0)}><i className="fas fa-plus"></i> إضافة تمرين جديد</button>
    </div></div>
);
const TrainingPlansPage = ({ plans, allExercises, activePlanId, onActivate, onEdit, onDelete }) => (
    <div className="page active"><div className="container">
        <h2 style={{ margin: '20px 0' }}>خطط التدريب</h2>
        <div className="training-plans">
            {plans.map(plan => <TrainingPlan key={plan.id} plan={plan} allExercises={allExercises} isActive={plan.id === activePlanId} onActivate={onActivate} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
        <button className="add-exercise-btn" onClick={() => onEdit(0)}><i className="fas fa-plus"></i> إنشاء خطة تدريب جديدة</button>
    </div></div>
);
const BottomNav = ({ activePage, setActivePage }) => {
    const navItems = [
        { page: 'current-exercise', icon: 'fa-dumbbell', label: 'التمرين الحالي' },
        { page: 'exercises-list', icon: 'fa-list', label: 'قائمة التمارين' },
        { page: 'analytics', icon: 'fa-chart-line', label: 'التحليلات' },
        { page: 'training-plans', icon: 'fa-clipboard-list', label: 'خطط التدريب' },
        { page: 'notifications', icon: 'fa-bell', label: 'التنبيهات' },
        { page: 'settings', icon: 'fa-cog', label: 'الإعدادات' },
    ];
    return (
        <div className="bottom-nav">
            {navItems.map(item => (
                <a href="#" key={item.page} className={`nav-item ${activePage === item.page ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePage(item.page); }}>
                    <i className={`fas ${item.icon} nav-icon`}></i><span className="nav-label">{item.label}</span><div className="nav-indicator"></div>
                </a>
            ))}
        </div>
    );
};