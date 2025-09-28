"use client";
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { initialDefaultData } from '@/utils/defaultData';

// --- TYPE DEFINITIONS ---
export interface SessionData {
    weight: number;
    reps: number;
    difficulty: 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard';
    date: string;
    duration: number;
    oneRM: number;
    volume: number;
}

export interface Exercise {
    id: number;
    name: string;
    muscle: string;
    sessions: number;
    restTime: number;
    completedSessions: number;
    currentSession: number;
    status: 'pending' | 'in-progress' | 'resting' | 'completed' | 'paused';
    sessionData: Record<number, SessionData>;
    exerciseSeconds: number;
    restSeconds: number;
}

export interface TrainingPlan {
    id: number;
    name: string;
    description: string;
    exercises: number[];
}

export interface Notification {
    id: number;
    title: string;
    time: string;
    enabled: boolean;
}

export interface PlannedWorkout {
    id: number;
    date: string; // YYYY-MM-DD
    planId: number;
}

export interface Settings {
    primaryColor: string;
    secondaryColor: string;
    restOverdueAudio: boolean;
}

export interface SessionHistoryItem {
    id: number;
    exerciseId: number;
    sessionNumber: number;
    data: SessionData;
}

export interface AppState {
    activePage: string;
    exercises: Exercise[];
    trainingPlans: TrainingPlan[];
    notifications: Notification[];
    plannedWorkouts: PlannedWorkout[];
    sessionHistory: SessionHistoryItem[];
    settings: Settings;
    activePlanId: number | null;
    currentExerciseId: number | null;
    sessionStartTime: number | null;
    isModalOpen: Record<string, boolean>;
    modalContext: { exerciseId?: number; planId?: number; date?: string };
    globalSessionSeconds: number;
}

// --- INITIAL STATE ---
export const initialState: AppState = {
    activePage: 'current-exercise',
    exercises: [],
    trainingPlans: [],
    notifications: [],
    plannedWorkouts: [],
    sessionHistory: [],
    settings: {
        primaryColor: '#4361ee',
        secondaryColor: '#3f37c9',
        restOverdueAudio: true,
    },
    activePlanId: null,
    currentExerciseId: null,
    sessionStartTime: null,
    isModalOpen: { exercise: false, plan: false, finishSession: false, planForDate: false, sessionDetails: false },
    modalContext: {},
    globalSessionSeconds: 0,
};

// --- ACTIONS ---
export type Action =
    | { type: 'SET_INITIAL_STATE'; payload: Partial<AppState> }
    | { type: 'LOAD_DEFAULT_DATA' }
    | { type: 'SET_PAGE'; payload: string }
    | { type: 'ADD_OR_UPDATE_EXERCISE'; payload: Partial<Exercise> }
    | { type: 'DELETE_EXERCISE'; payload: number }
    | { type: 'ADD_OR_UPDATE_PLAN'; payload: Partial<TrainingPlan> }
    | { type: 'DELETE_PLAN'; payload: number }
    | { type: 'ACTIVATE_PLAN'; payload: number | null }
    | { type: 'RESET_WORKOUT' }
    | { type: 'START_GLOBAL_SESSION' }
    | { type: 'STOP_GLOBAL_SESSION' }
    | { type: 'TICK_GLOBAL_TIMER' }
    | { type: 'START_EXERCISE_TIMER'; payload: number }
    | { type: 'PAUSE_EXERCISE_TIMER'; payload: number }
    | { type: 'RESUME_EXERCISE_TIMER'; payload: number }
    | { type: 'TICK_EXERCISE_SECONDS'; payload: { exerciseId: number } }
    | { type: 'TICK_REST_SECONDS'; payload: { exerciseId: number } }
    | { type: 'FINISH_SESSION'; payload: { exerciseId: number; sessionData: Omit<SessionData, 'date' | 'duration' | 'oneRM' | 'volume'> } }
    | { type: 'ADD_OR_UPDATE_PLANNED_WORKOUT'; payload: PlannedWorkout }
    | { type: 'DELETE_PLANNED_WORKOUT'; payload: number }
    | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
    | { type: 'OPEN_MODAL'; payload: { modal: string; isOpen: boolean; context?: any } };

// --- REDUCER ---
const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_INITIAL_STATE':
            return { ...state, ...action.payload, sessionStartTime: null };

        case 'LOAD_DEFAULT_DATA':
            const data = initialDefaultData as Partial<AppState>;
            return { ...state, ...data };

        case 'SET_PAGE':
            return { ...state, activePage: action.payload };

        case 'ADD_OR_UPDATE_EXERCISE': {
            const { id, ...rest } = action.payload;
            const exercises = [...state.exercises];
            const index = exercises.findIndex(ex => ex.id === id);
            if (index > -1) {
                exercises[index] = { ...exercises[index], ...rest };
            } else {
                const nextId = Math.max(0, ...state.exercises.map(e => e.id)) + 1;
                exercises.push({
                    id: nextId, name: '', muscle: '', sessions: 3, restTime: 90, completedSessions: 0,
                    currentSession: 1, status: 'pending', sessionData: {}, exerciseSeconds: 0, restSeconds: 0, ...rest,
                } as Exercise);
            }
            return { ...state, exercises };
        }

        case 'ADD_OR_UPDATE_PLAN': {
            const { id, ...rest } = action.payload;
            const plans = [...state.trainingPlans];
            const index = plans.findIndex(p => p.id === id);
            if (index > -1) {
                plans[index] = { ...plans[index], ...rest } as TrainingPlan;
            } else {
                const nextId = Math.max(0, ...state.trainingPlans.map(p => p.id)) + 1;
                plans.push({
                    id: nextId, name: 'خطة جديدة', description: '', exercises: [], ...rest,
                } as TrainingPlan);
            }
            return { ...state, trainingPlans: plans };
        }

        case 'DELETE_EXERCISE': {
            const exerciseIdToDelete = action.payload;
            const newExercises = state.exercises.filter(ex => ex.id !== exerciseIdToDelete);
            const newPlans = state.trainingPlans.map(plan => ({...plan, exercises: plan.exercises.filter(exId => exId !== exerciseIdToDelete)}));
            const newHistory = state.sessionHistory.filter(item => item.exerciseId !== exerciseIdToDelete);
            return { ...state, exercises: newExercises, trainingPlans: newPlans, sessionHistory: newHistory };
        }

        case 'DELETE_PLAN': {
            const planIdToDelete = action.payload;
            const newPlans = state.trainingPlans.filter(p => p.id !== planIdToDelete);
            const newPlannedWorkouts = state.plannedWorkouts.filter(pw => pw.planId !== planIdToDelete);
            let newActivePlanId = state.activePlanId;
            if (state.activePlanId === planIdToDelete) {
                newActivePlanId = null;
            }
            return { ...state, trainingPlans: newPlans, plannedWorkouts: newPlannedWorkouts, activePlanId: newActivePlanId };
        }

        case 'ACTIVATE_PLAN': {
            const exercisesWithResetState = state.exercises.map(ex => ({
                ...ex, status: 'pending', completedSessions: 0, currentSession: 1, sessionData: {}, exerciseSeconds: 0, restSeconds: 0,
            }));
            const activePlan = state.trainingPlans.find(p => p.id === action.payload);
            return { ...state, activePlanId: action.payload, exercises: exercisesWithResetState, currentExerciseId: activePlan?.exercises[0] || null };
        }

        case 'RESET_WORKOUT': {
             const exercisesWithResetState = state.exercises.map(ex => ({
                ...ex, status: 'pending', completedSessions: 0, currentSession: 1, sessionData: {}, exerciseSeconds: 0, restSeconds: 0,
            }));
            return { ...state, exercises: exercisesWithResetState, currentExerciseId: state.exercises[0]?.id || null };
        }

        case 'START_GLOBAL_SESSION':
            return { ...state, sessionStartTime: Date.now(), globalSessionSeconds: 0 };

        case 'STOP_GLOBAL_SESSION':
            return { ...state, sessionStartTime: null };

        case 'TICK_GLOBAL_TIMER':
            return { ...state, globalSessionSeconds: state.globalSessionSeconds + 1 };

        case 'START_EXERCISE_TIMER':
            return { ...state, currentExerciseId: action.payload, exercises: state.exercises.map(ex => ex.id === action.payload ? { ...ex, status: 'in-progress', restSeconds: 0 } : ex) };

        case 'PAUSE_EXERCISE_TIMER':
            return { ...state, exercises: state.exercises.map(ex => ex.id === action.payload ? { ...ex, status: 'paused' } : ex) };

        case 'RESUME_EXERCISE_TIMER':
             return { ...state, exercises: state.exercises.map(ex => ex.id === action.payload ? { ...ex, status: 'in-progress' } : ex) };

        case 'TICK_EXERCISE_SECONDS':
            return { ...state, exercises: state.exercises.map(ex => ex.id === action.payload.exerciseId ? { ...ex, exerciseSeconds: ex.exerciseSeconds + 1 } : ex) };

        case 'TICK_REST_SECONDS':
            return { ...state, exercises: state.exercises.map(ex => {
                if (ex.id === action.payload.exerciseId && ex.status === 'resting') {
                    const newRestSeconds = ex.restSeconds - 1;
                    if (newRestSeconds <= 0) return { ...ex, status: 'pending', restSeconds: 0 };
                    return { ...ex, restSeconds: newRestSeconds };
                }
                return ex;
            })};

        case 'FINISH_SESSION': {
            const { exerciseId, sessionData } = action.payload;
            let nextExerciseId = state.currentExerciseId;
            let finishedExercise: Exercise | undefined;
            let newHistory = [...state.sessionHistory];

            const exercisesWithFinishedSession = state.exercises.map(ex => {
                if (ex.id === exerciseId) {
                    finishedExercise = ex;
                    const newCompleted = ex.completedSessions + 1;
                    const isWorkoutComplete = newCompleted >= ex.sessions;
                    const oneRM = Math.round(sessionData.weight * (1 + (sessionData.reps / 30)));
                    const volume = sessionData.weight * sessionData.reps;

                    const newSessionData: SessionData = {
                        ...sessionData,
                        date: new Date().toISOString(),
                        duration: ex.exerciseSeconds,
                        oneRM,
                        volume
                    };

                    const nextHistoryId = Math.max(0, ...newHistory.map(h => h.id)) + 1;
                    newHistory.push({
                        id: nextHistoryId,
                        exerciseId: ex.id,
                        sessionNumber: ex.currentSession,
                        data: newSessionData
                    });

                    return {
                        ...ex,
                        completedSessions: newCompleted,
                        currentSession: ex.currentSession + 1,
                        status: isWorkoutComplete ? 'completed' : 'resting',
                        sessionData: { ...ex.sessionData, [ex.currentSession]: newSessionData },
                        exerciseSeconds: 0,
                        restSeconds: isWorkoutComplete ? 0 : ex.restTime,
                    };
                }
                return ex;
            });

            const currentPlan = state.trainingPlans.find(p => p.id === state.activePlanId);
            if (currentPlan && finishedExercise) {
                const currentIndex = currentPlan.exercises.indexOf(finishedExercise.id);
                const nextInPlanIndex = currentPlan.exercises.findIndex((id, index) => {
                    if (index <= currentIndex) return false;
                    const nextEx = exercisesWithFinishedSession.find(e => e.id === id);
                    return nextEx && nextEx.status !== 'completed';
                });

                if (nextInPlanIndex !== -1) {
                    nextExerciseId = currentPlan.exercises[nextInPlanIndex];
                } else {
                    nextExerciseId = null; // End of plan
                }
            }
            return { ...state, exercises: exercisesWithFinishedSession, sessionHistory: newHistory, currentExerciseId: nextExerciseId };
        }

        case 'ADD_OR_UPDATE_PLANNED_WORKOUT': {
            const newPlannedWorkouts = [...state.plannedWorkouts];
            const index = newPlannedWorkouts.findIndex(pw => pw.id === action.payload.id || pw.date === action.payload.date);
            if (index > -1) {
                newPlannedWorkouts[index] = action.payload;
            } else {
                const nextId = Math.max(0, ...newPlannedWorkouts.map(p => p.id)) + 1;
                newPlannedWorkouts.push({ ...action.payload, id: nextId });
            }
            return { ...state, plannedWorkouts: newPlannedWorkouts };
        }

        case 'DELETE_PLANNED_WORKOUT': {
            const newPlannedWorkouts = state.plannedWorkouts.filter(pw => pw.id !== action.payload);
            return { ...state, plannedWorkouts: newPlannedWorkouts };
        }

        case 'UPDATE_SETTINGS':
            return { ...state, settings: { ...state.settings, ...action.payload } };

        case 'OPEN_MODAL':
            return { ...state, isModalOpen: { ...state.isModalOpen, [action.payload.modal]: action.payload.isOpen }, modalContext: action.payload.isOpen ? { ...action.payload.context } : {} };

        default:
            return state;
    }
};

// --- CONTEXT & PROVIDER ---
const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> }>({ state: initialState, dispatch: () => null });
export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};
export const useAppContext = () => useContext(AppContext);