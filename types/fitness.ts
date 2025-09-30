export interface Exercise {
  id: number;
  name: string;
  muscle: string;
  status: 'pending' | 'in-progress' | 'resting' | 'completed';
  exerciseSecondsCurrentSession: number;
  restSecondsCurrentSession: number;
  totalExerciseSecondsAccumulated: number;
  totalRestSecondsAccumulated: number;
  wastedTimeSeconds: number;
  sessions: number;
  completedSessions: number;
  restTime: number;
  currentSession: number;
  difficulty: 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard' | null;
  sessionData: Record<number, SessionData>;
  audioAlertTriggered: boolean;
  isRestPaused: boolean;
  restStartTime: number | null;
}

export interface SessionData {
  weight: number;
  reps: number;
  difficulty: 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard';
  date: string;
  sessionExerciseDuration: number;
  sessionRestDuration: number;
  wastedTime: number;
  oneRM: number;
  volume: number;
  startTime: string;
  endTime: string;
}

export interface TrainingPlan {
  id: number;
  name: string;
  description: string;
  exercises: number[];
  active: boolean;
}

export interface Notification {
  id: number;
  title: string;
  time: string;
  days: string[];
  enabled: boolean;
}

export interface PlannedWorkout {
  id: number;
  date: string;
  planId: number;
  planName: string;
}

export interface SessionHistory {
  id: number;
  startTime: string;
  endTime: string | null;
  reasonForEarlyStop: string | null;
  planId: number | null;
  planName: string;
  exercisesCompleted: number;
}

export interface AppSettings {
  primaryColor: string;
  secondaryColor: string;
  restOverdueAudio: boolean;
  units: 'kg' | 'lb';
}

export interface AppState {
  sessionStarted: boolean;
  sessionSeconds: number;
  currentExercise: number | null;
  exercises: Exercise[];
  trainingPlans: TrainingPlan[];
  notifications: Notification[];
  plannedWorkouts: PlannedWorkout[];
  sessionHistory: SessionHistory[];
  currentGlobalSession: SessionHistory | null;
  totalExerciseTime: number;
  totalRestTime: number;
  nextExerciseId: number;
  nextPlanId: number;
  nextPlannedWorkoutId: number;
  nextSessionHistoryId: number;
  activePlanId: number | null;
  settings: AppSettings;
}

export type DifficultyLevel = 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard';

export const DIFFICULTY_EMOJIS: Record<DifficultyLevel, string> = {
  'very-easy': '😊',
  'easy': '🙂',
  'medium': '😐',
  'hard': '😟',
  'very-hard': '😫'
};

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  'very-easy': 'سهل جداً',
  'easy': 'سهل',
  'medium': 'متوسط',
  'hard': 'ثقيل',
  'very-hard': 'ثقيل جداً'
};

export const MUSCLE_GROUPS = [
  'صدر',
  'ظهر',
  'أكتاف',
  'أرجل',
  'بايسبس',
  'ترايسبس',
  'بطن',
  'ساعد'
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];
