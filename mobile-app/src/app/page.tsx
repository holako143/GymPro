"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppContext, Exercise, SessionData, TrainingPlan, initialState } from '@/context/AppContext';
import { initialDefaultData } from '@/utils/defaultData';
import { formatTime } from '@/utils/formatters';

// Import all components
import { ExerciseCard } from '@/components/ExerciseCard';
import { TrainingPlan as TrainingPlanComponent } from '@/components/TrainingPlan';
import { ExerciseListItem } from '@/components/ExerciseListItem';
import { ExerciseModal } from '@/components/modals/ExerciseModal';
import { SessionFinishModal } from '@/components/modals/SessionFinishModal';
import { PlanModal } from '@/components/modals/PlanModal';
import { PlanForDateModal } from '@/components/modals/PlanForDateModal';
import { SessionDetailsModal } from '@/components/modals/SessionDetailsModal';
import { AnalyticsPage } from '@/components/pages/AnalyticsPage';
import { SettingsPage } from '@/components/pages/SettingsPage';
import { NotificationsPage } from '@/components/pages/NotificationsPage';

// --- Main App Component ---
export default function Home() {
    const { state, dispatch } = useAppContext();
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedExercises, setSelectedExercises] = useState<number[]>([]);

    // --- DATA PERSISTENCE & GLOBAL TIMER EFFECTS ---
    useEffect(() => {
        // Load state from localStorage on initial render
        try {
            const savedState = localStorage.getItem('fitnessAppState');
            if (savedState) {
                const loaded = JSON.parse(savedState);
                // Reset transient state properties that shouldn't be persisted
                loaded.sessionStartTime = null;
                loaded.globalSessionSeconds = 0;
                loaded.isModalOpen = initialState.isModalOpen;
                loaded.modalContext = initialState.modalContext;
                loaded.exercises.forEach((ex: Exercise) => {
                    ex.exerciseSeconds = 0;
                    ex.restSeconds = 0;
                    ex.status = ex.status === 'completed' ? 'completed' : 'pending'; // Reset state
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
        // Save state to localStorage whenever it changes
        if (isLoaded) {
            const stateToSave = { ...state };
            // Don't save transient properties
            delete stateToSave.sessionStartTime;
            delete stateToSave.isModalOpen;
            delete stateToSave.modalContext;
            localStorage.setItem('fitnessAppState', JSON.stringify(stateToSave));
        }
    }, [state, isLoaded]);

    // Global session timer
    useEffect(() => {
        if (!state.sessionStartTime) return;
        const interval = setInterval(() => dispatch({ type: 'TICK_GLOBAL_TIMER' }), 1000);
        return () => clearInterval(interval);
    }, [state.sessionStartTime, dispatch]);

    // Individual exercise and rest timers
    useEffect(() => {
        const exercise = state.exercises.find(ex => ex.id === state.currentExerciseId);
        if (!exercise || !state.sessionStartTime) return;

        let interval: NodeJS.Timeout | undefined;
        if (exercise.status === 'in-progress') {
            interval = setInterval(() => dispatch({ type: 'TICK_EXERCISE_SECONDS', payload: { exerciseId: exercise.id } }), 1000);
        } else if (exercise.status === 'resting' && exercise.restSeconds > 0) {
            interval = setInterval(() => dispatch({ type: 'TICK_REST_SECONDS', payload: { exerciseId: exercise.id } }), 1000);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [state.exercises, state.currentExerciseId, state.sessionStartTime, dispatch]);

    // Apply color settings from state to CSS variables
    useEffect(() => {
        document.documentElement.style.setProperty('--app-primary-color', state.settings.primaryColor);
        document.documentElement.style.setProperty('--app-secondary-color', state.settings.secondaryColor);
    }, [state.settings.primaryColor, state.settings.secondaryColor]);

    // --- EVENT HANDLERS ---
    const handleOpenModal = (modal: string, context: any = {}) => dispatch({ type: 'OPEN_MODAL', payload: { modal, isOpen: true, context } });

    const handleActivatePlan = useCallback((id: number | null) => dispatch({ type: 'ACTIVATE_PLAN', payload: id }), [dispatch]);
    const handleDeletePlan = useCallback((id: number) => { if (window.confirm('هل أنت متأكد من حذف هذه الخطة؟ سيتم حذفها من التمارين المجدولة أيضاً.')) dispatch({ type: 'DELETE_PLAN', payload: id }); }, [dispatch]);

    const handleDeleteExercise = useCallback((id: number) => { if (window.confirm('هل أنت متأكد من حذف هذا التمرين؟ سيتم حذفه من جميع الخطط.')) dispatch({ type: 'DELETE_EXERCISE', payload: id }); }, [dispatch]);
    const handleSelectExercise = (id: number, isSelected: boolean) => {
        setSelectedExercises(prev => isSelected ? [...prev, id] : prev.filter(exId => exId !== id));
    };
    const handleDeleteSelected = () => {
        if (selectedExercises.length === 0) return alert('الرجاء تحديد تمرين واحد على الأقل.');
        if (window.confirm(`هل أنت متأكد من حذف ${selectedExercises.length} تمرين؟`)) {
            selectedExercises.forEach(id => dispatch({ type: 'DELETE_EXERCISE', payload: id }));
            setSelectedExercises([]);
        }
    };

    const handleStartExercise = useCallback((id: number) => {
        if (!state.sessionStartTime) dispatch({ type: 'START_GLOBAL_SESSION' });
        dispatch({ type: 'START_EXERCISE_TIMER', payload: id });
    }, [dispatch, state.sessionStartTime]);
    const handlePauseExercise = useCallback((id: number) => dispatch({ type: 'PAUSE_EXERCISE_TIMER', payload: id }), [dispatch]);
    const handleResumeExercise = useCallback((id: number) => dispatch({ type: 'RESUME_EXERCISE_TIMER', payload: id }), [dispatch]);

    const renderPage = () => {
        const activePlan = state.trainingPlans.find(p => p.id === state.activePlanId);
        const exercisesToShow = activePlan ? state.exercises.filter(ex => activePlan.exercises.includes(ex.id)) : [];

        switch (state.activePage) {
            case 'current-exercise':
                return <CurrentExercisePage
                            exercises={exercisesToShow}
                            onStart={handleStartExercise}
                            onPause={handlePauseExercise}
                            onResume={handleResumeExercise}
                            onFinish={(id) => handleOpenModal('finishSession', { exerciseId: id })}
                            onViewDetails={(exerciseId, sessionNumber) => handleOpenModal('sessionDetails', { exerciseId, sessionNumber })}
                        />;
            case 'exercises-list':
                return <ExercisesListPage
                            exercises={state.exercises}
                            onEdit={(id) => handleOpenModal('exercise', { exerciseId: id })}
                            onDelete={handleDeleteExercise}
                            selectedExercises={selectedExercises}
                            onSelect={handleSelectExercise}
                            onDeleteSelected={handleDeleteSelected}
                            onSelectAll={() => setSelectedExercises(state.exercises.map(e => e.id))}
                            onDeselectAll={() => setSelectedExercises([])}
                        />;
            case 'training-plans':
                return <TrainingPlansPage
                            plans={state.trainingPlans}
                            allExercises={state.exercises}
                            activePlanId={state.activePlanId}
                            onActivate={handleActivatePlan}
                            onEdit={(id) => handleOpenModal('plan', { planId: id })}
                            onDelete={handleDeletePlan}
                        />;
            case 'analytics': return <AnalyticsPage />;
            case 'settings': return <SettingsPage />;
            case 'notifications': return <NotificationsPage />;
            default: return <div>Page not found</div>;
        }
    };

    if (!isLoaded) return <div className="container" style={{textAlign: 'center', paddingTop: '50px'}}>جار التحميل...</div>;

    return (
        <>
            {renderPage()}
            <BottomNav activePage={state.activePage} setActivePage={(page) => dispatch({ type: 'SET_PAGE', payload: page })} />

            {/* Render all modals */}
            <ExerciseModal />
            <SessionFinishModal />
            <PlanModal />
            <PlanForDateModal />
            <SessionDetailsModal />
        </>
    );
}

// --- Page Components (defined here for simplicity, could be in separate files) ---
const CurrentExercisePage = ({ exercises, onStart, onPause, onResume, onFinish, onViewDetails }) => {
    const { state, dispatch } = useAppContext();
    const activePlan = state.trainingPlans.find(p => p.id === state.activePlanId);

    return (
    <div className="page active"><div className="container">
        <div className="status-bar">
            <div className="timer">{formatTime(state.globalSessionSeconds)}</div>
            <button className="start-btn" onClick={() => dispatch({ type: state.sessionStartTime ? 'STOP_GLOBAL_SESSION' : 'START_GLOBAL_SESSION' })}>
                {state.sessionStartTime ? 'إنهاء الجلسة' : 'بدء الجلسة'}
            </button>
        </div>
        {activePlan && <h2 style={{textAlign: 'center', margin: '15px 0', color: 'var(--app-primary-color)'}}>{activePlan.name}</h2>}
        <div className="cards-container">
            {exercises.length > 0 ? exercises.map(ex =>
                <ExerciseCard
                    key={ex.id}
                    exercise={ex}
                    isActive={ex.id === state.currentExerciseId}
                    onStart={onStart}
                    onPause={onPause}
                    onResume={onResume}
                    onFinish={onFinish}
                    onViewDetails={onViewDetails}
                />
            ) : <p style={{textAlign: 'center', width: '100%', color: 'var(--gray)'}}>الرجاء تفعيل خطة من صفحة "خطط التدريب" أولاً.</p>}
        </div>
    </div></div>
)};

const ExercisesListPage = ({ exercises, onEdit, onDelete, selectedExercises, onSelect, onDeleteSelected, onSelectAll, onDeselectAll }) => (
    <div className="page active"><div className="container">
        <h2 className="exercises-list-title">قائمة التمارين</h2>
        <div className="exercise-list-controls">
            <button className="control-btn btn-secondary" onClick={onSelectAll}>تحديد الكل</button>
            <button className="control-btn btn-secondary" onClick={onDeselectAll}>إلغاء التحديد</button>
            <button className="control-btn btn-danger" onClick={onDeleteSelected}>حذف المحدد</button>
        </div>
        <div id="exercises-container">
            {exercises.map(ex =>
                <ExerciseListItem
                    key={ex.id}
                    exercise={ex}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isSelected={selectedExercises.includes(ex.id)}
                    onSelect={onSelect}
                />
            )}
        </div>
        <button className="add-exercise-btn" onClick={() => onEdit(null)}><i className="fas fa-plus"></i> إضافة تمرين جديد</button>
    </div></div>
);

const TrainingPlansPage = ({ plans, allExercises, activePlanId, onActivate, onEdit, onDelete }) => (
    <div className="page active"><div className="container">
        <h2 style={{ margin: '20px 0' }}>خطط التدريب</h2>
        <div className="training-plans">
            {plans.map(plan =>
                <TrainingPlanComponent
                    key={plan.id}
                    plan={plan}
                    allExercises={allExercises}
                    isActive={plan.id === activePlanId}
                    onActivate={onActivate}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
        </div>
        <button className="add-exercise-btn" onClick={() => onEdit(null)}><i className="fas fa-plus"></i> إنشاء خطة تدريب جديدة</button>
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