import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { AppState, Exercise, TrainingPlan, SessionHistory, SessionData, DifficultyLevel, AppSettings, Notification, Achievement } from '@/types/fitness';
import { ACHIEVEMENTS_DATABASE, AchievementId } from '@/constants/achievements';

const STORAGE_KEYS = {
  EXERCISES: 'fitnessAppExercises',
  PLANS: 'fitnessAppPlans',
  NOTIFICATIONS: 'fitnessAppNotifications',
  PLANNED_WORKOUTS: 'fitnessAppPlannedWorkouts',
  SESSION_HISTORY: 'fitnessAppSessionHistory',
  ACTIVE_PLAN_ID: 'fitnessAppActivePlanId',
  SESSION_SECONDS: 'fitnessAppSessionSeconds',
  SETTINGS: 'fitnessAppSettings',
  ACHIEVEMENTS: 'fitnessAppAchievements'
};

const initialState: AppState = {
  sessionStarted: false,
  sessionSeconds: 0,
  currentExercise: null,
  exercises: [],
  trainingPlans: [],
  notifications: [],
  plannedWorkouts: [],
  sessionHistory: [],
  achievements: [],
  currentGlobalSession: null,
  totalExerciseTime: 0,
  totalRestTime: 0,
  nextExerciseId: 1,
  nextPlanId: 1,
  nextPlannedWorkoutId: 1,
  nextSessionHistoryId: 1,
  activePlanId: null,
  settings: {
    primaryColor: '#4361ee',
    secondaryColor: '#3f37c9',
    restOverdueAudio: true,
    units: 'kg'
  }
};

export const [FitnessProvider, useFitnessStore] = createContextHook(() => {
  const [state, setState] = useState<AppState>(initialState);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exerciseTimersRef = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());
  const restTimersRef = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());
  const restCountdownTimersRef = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());
  const wastedTimeTimersRef = useRef<Map<number, ReturnType<typeof setInterval>>>(new Map());

  // Load data from AsyncStorage
  const loadData = async () => {
    try {
      const [
        savedExercises,
        savedPlans,
        savedNotifications,
        savedPlannedWorkouts,
        savedSessionHistory,
        savedActivePlanId,
        savedSessionSeconds,
        savedSettings,
        savedAchievements
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.EXERCISES),
        AsyncStorage.getItem(STORAGE_KEYS.PLANS),
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.PLANNED_WORKOUTS),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_HISTORY),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN_ID),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_SECONDS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)
      ]);

      const newState = { ...initialState };

      if (savedExercises) {
        newState.exercises = JSON.parse(savedExercises);
        newState.nextExerciseId = Math.max(...newState.exercises.map(e => e.id), 0) + 1;
      }

      if (savedPlans) {
        newState.trainingPlans = JSON.parse(savedPlans);
        newState.nextPlanId = Math.max(...newState.trainingPlans.map(p => p.id), 0) + 1;
      }

      if (savedNotifications) {
        newState.notifications = JSON.parse(savedNotifications);
      }

      if (savedPlannedWorkouts) {
        newState.plannedWorkouts = JSON.parse(savedPlannedWorkouts);
        newState.nextPlannedWorkoutId = Math.max(...newState.plannedWorkouts.map(p => p.id), 0) + 1;
      }

      if (savedSessionHistory) {
        newState.sessionHistory = JSON.parse(savedSessionHistory);
        newState.nextSessionHistoryId = Math.max(...newState.sessionHistory.map(s => s.id), 0) + 1;
      }

      if (savedActivePlanId) {
        newState.activePlanId = parseInt(savedActivePlanId) || null;
      }

      if (savedSessionSeconds) {
        newState.sessionSeconds = parseInt(savedSessionSeconds);
      }

      if (savedSettings) {
        newState.settings = { ...newState.settings, ...JSON.parse(savedSettings) };
      }

      if (savedAchievements) {
        newState.achievements = JSON.parse(savedAchievements);
      }

      // Initialize with default data if empty
      if (newState.exercises.length === 0 && newState.trainingPlans.length === 0) {
        initializeDefaultData(newState);
      }

      // Set current exercise if there's an active plan
      if (newState.activePlanId !== null) {
        const activePlan = newState.trainingPlans.find(p => p.id === newState.activePlanId);
        if (activePlan && activePlan.exercises.length > 0) {
          const firstActivePlanExercise = newState.exercises.find(e => 
            activePlan.exercises.includes(e.id) && e.status !== 'completed'
          ) || newState.exercises.find(e => activePlan.exercises.includes(e.id));
          
          if (firstActivePlanExercise) {
            newState.currentExercise = firstActivePlanExercise.id;
          }
        }
      } else if (newState.exercises.length > 0) {
        newState.currentExercise = newState.exercises[0].id;
      }

      setState(newState);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Save data to AsyncStorage
  const saveData = async (newState: AppState) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(newState.exercises)),
        AsyncStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(newState.trainingPlans)),
        AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(newState.notifications)),
        AsyncStorage.setItem(STORAGE_KEYS.PLANNED_WORKOUTS, JSON.stringify(newState.plannedWorkouts)),
        AsyncStorage.setItem(STORAGE_KEYS.SESSION_HISTORY, JSON.stringify(newState.sessionHistory)),
        AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_ID, newState.activePlanId?.toString() || ''),
        AsyncStorage.setItem(STORAGE_KEYS.SESSION_SECONDS, newState.sessionSeconds.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newState.settings)),
        AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(newState.achievements))
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Initialize default data
  const initializeDefaultData = (newState: AppState) => {
    newState.exercises = [
      {
        id: 1, name: "تمرين الضغط (Dumbbell Press)", muscle: "صدر", status: "pending",
        exerciseSecondsCurrentSession: 0, restSecondsCurrentSession: 0,
        totalExerciseSecondsAccumulated: 0, totalRestSecondsAccumulated: 0,
        wastedTimeSeconds: 0, sessions: 4, completedSessions: 0, restTime: 90, currentSession: 1,
        difficulty: null, sessionData: {}, audioAlertTriggered: false,
        isRestPaused: false, restStartTime: null
      },
      {
        id: 2, name: "الضغط بالبار (Barbell Bench Press)", muscle: "صدر", status: "pending",
        exerciseSecondsCurrentSession: 0, restSecondsCurrentSession: 0,
        totalExerciseSecondsAccumulated: 0, totalRestSecondsAccumulated: 0,
        wastedTimeSeconds: 0, sessions: 3, completedSessions: 0, restTime: 60, currentSession: 1,
        difficulty: null, sessionData: {}, audioAlertTriggered: false,
        isRestPaused: false, restStartTime: null
      },
      {
        id: 3, name: "الرفعة المميتة (Deadlift)", muscle: "ظهر", status: "pending",
        exerciseSecondsCurrentSession: 0, restSecondsCurrentSession: 0,
        totalExerciseSecondsAccumulated: 0, totalRestSecondsAccumulated: 0,
        wastedTimeSeconds: 0, sessions: 3, completedSessions: 0, restTime: 90, currentSession: 1,
        difficulty: null, sessionData: {}, audioAlertTriggered: false,
        isRestPaused: false, restStartTime: null
      },
      {
        id: 4, name: "القرفصاء بالبار (Barbell Squat)", muscle: "أرجل", status: "pending",
        exerciseSecondsCurrentSession: 0, restSecondsCurrentSession: 0,
        totalExerciseSecondsAccumulated: 0, totalRestSecondsAccumulated: 0,
        wastedTimeSeconds: 0, sessions: 4, completedSessions: 0, restTime: 120, currentSession: 1,
        difficulty: null, sessionData: {}, audioAlertTriggered: false,
        isRestPaused: false, restStartTime: null
      }
    ];
    newState.nextExerciseId = 5;

    newState.trainingPlans = [
      {
        id: 1, name: "خطة المبتدئين (كامل الجسم)",
        description: "خطة تدريب للمبتدئين تركز على بناء القوة الأساسية لجميع مجموعات العضلات الرئيسية.",
        exercises: [1, 2, 3, 4], active: true
      }
    ];
    newState.nextPlanId = 2;
    newState.activePlanId = 1;
    newState.currentExercise = 1;

    newState.notifications = [
      {
        id: 1, title: "تذكير بالتمرين", time: "18:00",
        days: ["saturday", "monday", "wednesday"], enabled: true
      }
    ];
  };

  // Update state and save
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      saveData(newState);
      return newState;
    });
  }, []);

  // Format time helper
  const formatTime = useCallback((totalSeconds: number): string => {
    if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) {
      return '00:00';
    }
    const seconds = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Calculate 1RM
  const calculate1RM = useCallback((weight: number, reps: number): number => {
    if (reps === 0 || weight <= 0) return 0;
    return Math.round(weight * (1 + (reps / 30)));
  }, []);

  // Calculate Workout Efficiency
  const calculateWorkoutEfficiency = useCallback((session: SessionData): number => {
    const restInMinutes = session.sessionRestDuration / 60;
    if (!restInMinutes || restInMinutes === 0) {
      return session.volume || 0; // Return volume if rest is zero to avoid division by zero
    }
    const efficiency = session.volume / restInMinutes;
    return Math.round(efficiency);
  }, []);

  // Play sound effect
  const playSound = useCallback(async (soundType: 'start' | 'pause' | 'finish' | 'rest' | 'resume') => {
    try {
      console.log('Playing sound:', soundType);
    } catch (error) {
      console.log('Sound not available:', soundType);
    }
  }, []);

  // Exercise management functions
  const addExercise = useCallback((exercise: Pick<Exercise, 'name' | 'muscle' | 'sessions' | 'restTime'>) => {
    const newExercise: Exercise = {
      id: state.nextExerciseId,
      name: exercise.name,
      muscle: exercise.muscle,
      sessions: exercise.sessions,
      restTime: exercise.restTime,
      status: 'pending',
      exerciseSecondsCurrentSession: 0,
      restSecondsCurrentSession: 0,
      totalExerciseSecondsAccumulated: 0,
      totalRestSecondsAccumulated: 0,
      wastedTimeSeconds: 0,
      completedSessions: 0,
      currentSession: 1,
      difficulty: null,
      sessionData: {},
      audioAlertTriggered: false,
      isRestPaused: false,
      restStartTime: null
    };

    updateState({
      exercises: [...state.exercises, newExercise],
      nextExerciseId: state.nextExerciseId + 1
    });
  }, [state.nextExerciseId, updateState]);

  const updateExercise = useCallback((id: number, updates: Partial<Exercise>) => {
    const updatedExercises = state.exercises.map(exercise =>
      exercise.id === id ? { ...exercise, ...updates } : exercise
    );
    updateState({ exercises: updatedExercises });
  }, [state.exercises, updateState]);

  const deleteExercise = useCallback((id: number) => {
    const updatedExercises = state.exercises.filter(e => e.id !== id);
    const updatedPlans = state.trainingPlans.map(plan => ({
      ...plan,
      exercises: plan.exercises.filter(exId => exId !== id)
    }));
    const updatedPlannedWorkouts = state.plannedWorkouts.filter(pw => {
      const plan = updatedPlans.find(p => p.id === pw.planId);
      return plan && plan.exercises.length > 0;
    });

    updateState({
      exercises: updatedExercises,
      trainingPlans: updatedPlans,
      plannedWorkouts: updatedPlannedWorkouts
    });
  }, [state.exercises, state.trainingPlans, state.plannedWorkouts, updateState]);

  // Timer management
  const startExerciseTimer = useCallback((exerciseId: number) => {
    const exercise = state.exercises.find(e => e.id === exerciseId);
    if (!exercise || exercise.status === 'completed') return;

    // Clear any existing rest and wasted time timers for this exercise
    const restTimer = restTimersRef.current.get(exerciseId);
    const restCountdownTimer = restCountdownTimersRef.current.get(exerciseId);
    const wastedTimer = wastedTimeTimersRef.current.get(exerciseId);
    
    if (restTimer) {
      clearInterval(restTimer);
      restTimersRef.current.delete(exerciseId);
    }
    if (restCountdownTimer) {
      clearInterval(restCountdownTimer);
      restCountdownTimersRef.current.delete(exerciseId);
    }
    if (wastedTimer) {
      clearInterval(wastedTimer);
      wastedTimeTimersRef.current.delete(exerciseId);
    }

    // Reset audio alert and rest state
    updateExercise(exerciseId, { 
      audioAlertTriggered: false, 
      isRestPaused: false,
      restStartTime: null
    });

    // Start exercise timer if not already running
    if (!exerciseTimersRef.current.has(exerciseId)) {
      updateExercise(exerciseId, { status: 'in-progress' });
      playSound('start');
      
      const timer = setInterval(() => {
        setState(prevState => {
          const updatedExercises = prevState.exercises.map(ex => {
            if (ex.id === exerciseId) {
              return {
                ...ex,
                exerciseSecondsCurrentSession: ex.exerciseSecondsCurrentSession + 1,
                totalExerciseSecondsAccumulated: ex.totalExerciseSecondsAccumulated + 1
              };
            }
            return ex;
          });
          
          const newState = { ...prevState, exercises: updatedExercises };
          saveData(newState);
          return newState;
        });
      }, 1000);

      exerciseTimersRef.current.set(exerciseId, timer);
    }
  }, [state.exercises, playSound, updateExercise]);

  const pauseExerciseTimer = useCallback((exerciseId: number) => {
    const exercise = state.exercises.find(e => e.id === exerciseId);
    if (!exercise || exercise.status === 'completed') return;

    // Clear exercise timer
    const exerciseTimer = exerciseTimersRef.current.get(exerciseId);
    if (exerciseTimer) {
      clearInterval(exerciseTimer);
      exerciseTimersRef.current.delete(exerciseId);
    }

    // Start rest timer and track rest start time
    if (!restTimersRef.current.has(exerciseId)) {
      const now = Date.now();
      updateExercise(exerciseId, { 
        status: 'resting',
        restSecondsCurrentSession: 0,
        isRestPaused: true,
        restStartTime: now
      });
      playSound('rest');
      
      const timer = setInterval(() => {
        setState(prevState => {
          const updatedExercises = prevState.exercises.map(ex => {
            if (ex.id === exerciseId) {
              const newRestSeconds = ex.restSecondsCurrentSession + 1;
              const totalRestSeconds = ex.totalRestSecondsAccumulated + 1;
              
              // Check if rest time exceeds 40 seconds and start counting as wasted time
              if (newRestSeconds > 40 && !wastedTimeTimersRef.current.has(exerciseId)) {
                const wastedTimer = setInterval(() => {
                  setState(prevState => {
                    const updatedExercises = prevState.exercises.map(ex => {
                      if (ex.id === exerciseId) {
                        return {
                          ...ex,
                          wastedTimeSeconds: ex.wastedTimeSeconds + 1
                        };
                      }
                      return ex;
                    });
                    
                    const newState = { ...prevState, exercises: updatedExercises };
                    saveData(newState);
                    return newState;
                  });
                }, 1000);
                
                wastedTimeTimersRef.current.set(exerciseId, wastedTimer);
              }
              
              return {
                ...ex,
                restSecondsCurrentSession: newRestSeconds,
                totalRestSecondsAccumulated: totalRestSeconds
              };
            }
            return ex;
          });
          
          const newState = { ...prevState, exercises: updatedExercises };
          saveData(newState);
          return newState;
        });
      }, 1000);

      restTimersRef.current.set(exerciseId, timer);
    }
  }, [state.exercises, playSound, updateExercise]);

  const resumeExerciseTimer = useCallback((exerciseId: number) => {
    const exercise = state.exercises.find(e => e.id === exerciseId);
    if (!exercise || exercise.status !== 'resting') return;

    // Clear rest and wasted time timers
    const restTimer = restTimersRef.current.get(exerciseId);
    const wastedTimer = wastedTimeTimersRef.current.get(exerciseId);
    
    if (restTimer) {
      clearInterval(restTimer);
      restTimersRef.current.delete(exerciseId);
    }
    if (wastedTimer) {
      clearInterval(wastedTimer);
      wastedTimeTimersRef.current.delete(exerciseId);
    }

    // Reset rest state
    updateExercise(exerciseId, { 
      isRestPaused: false,
      restStartTime: null
    });

    // Resume exercise timer
    startExerciseTimer(exerciseId);
    playSound('resume');
  }, [state.exercises, startExerciseTimer, playSound, updateExercise]);

  const finishSession = useCallback((exerciseId: number, sessionNumber: number, weight: number, reps: number, difficulty: DifficultyLevel, restReason?: string) => {
    const exercise = state.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    // Clear all timers for this exercise
    [exerciseTimersRef, restTimersRef, restCountdownTimersRef, wastedTimeTimersRef].forEach(timerMap => {
      const timer = timerMap.current.get(exerciseId);
      if (timer) {
        clearInterval(timer);
        timerMap.current.delete(exerciseId);
      }
    });

    const oneRM = calculate1RM(weight, reps);
    const volume = weight * reps;
    const now = new Date().toISOString();

    const sessionData: SessionData = {
      weight,
      reps,
      difficulty,
      date: now,
      sessionExerciseDuration: exercise.exerciseSecondsCurrentSession,
      sessionRestDuration: exercise.restSecondsCurrentSession,
      wastedTime: exercise.wastedTimeSeconds,
      oneRM,
      volume,
      startTime: new Date(Date.now() - exercise.exerciseSecondsCurrentSession * 1000).toISOString(),
      endTime: now,
      restReason: restReason,
    };

    const updatedSessionData = { ...exercise.sessionData, [sessionNumber]: sessionData };
    const completedSessions = exercise.completedSessions + 1;
    const isCompleted = completedSessions === exercise.sessions;

    const newPersonalRecords = { ...(exercise.personalRecords || {}) };
    if (!newPersonalRecords.bestWeight || sessionData.weight > newPersonalRecords.bestWeight.value) {
        newPersonalRecords.bestWeight = { value: sessionData.weight, date: now };
    }
    if (!newPersonalRecords.bestVolume || sessionData.volume > newPersonalRecords.bestVolume.value) {
        newPersonalRecords.bestVolume = { value: sessionData.volume, date: now };
    }

    let updates: Partial<Exercise> = {
      completedSessions,
      sessionData: updatedSessionData,
      difficulty,
      personalRecords: newPersonalRecords,
      exerciseSecondsCurrentSession: 0,
      restSecondsCurrentSession: 0,
      wastedTimeSeconds: 0,
      audioAlertTriggered: false,
      isRestPaused: false,
      restStartTime: null
    };

    if (isCompleted) {
      updates.status = 'completed';
    } else {
      updates.currentSession = exercise.currentSession + 1;
      updates.status = 'resting';
      updates.restSecondsCurrentSession = exercise.restTime;

      // Start countdown timer
      const countdownTimer = setInterval(() => {
        setState(prevState => {
          const updatedExercises = prevState.exercises.map(ex => {
            if (ex.id === exerciseId) {
              const newRestSeconds = ex.restSecondsCurrentSession - 1;
              
              // Check for overdue rest alert
              if (newRestSeconds < -15 && ex.status === 'resting' && !ex.audioAlertTriggered && state.settings.restOverdueAudio) {
                // Audio alert would be triggered here in a real app
                console.log('Rest overdue audio alert');
                return { ...ex, restSecondsCurrentSession: newRestSeconds, audioAlertTriggered: true };
              }

              if (newRestSeconds <= -1) {
                // Rest period ended
                clearInterval(countdownTimer);
                restCountdownTimersRef.current.delete(exerciseId);
                return {
                  ...ex,
                  status: 'pending' as const,
                  restSecondsCurrentSession: 0,
                  audioAlertTriggered: false
                };
              }

              return { ...ex, restSecondsCurrentSession: newRestSeconds };
            }
            return ex;
          });
          
          const newState = { ...prevState, exercises: updatedExercises };
          saveData(newState);
          return newState;
        });
      }, 1000);

      restCountdownTimersRef.current.set(exerciseId, countdownTimer);
    }

    updateExercise(exerciseId, updates);
    playSound('finish');

    // Move to next exercise if current one is completed
    if (isCompleted) {
      const activePlan = state.trainingPlans.find(p => p.id === state.activePlanId);
      if (activePlan) {
        const remainingExerciseIds = activePlan.exercises.filter(id => {
          const ex = state.exercises.find(e => e.id === id);
          return ex && ex.status !== 'completed';
        });
        
        if (remainingExerciseIds.length > 0) {
          updateState({ currentExercise: remainingExerciseIds[0] });
        } else {
          // All exercises completed, stop session automatically
          stopGlobalSession('إكمال جميع التمارين');
        }
      }
    }
  }, [state.exercises, state.trainingPlans, state.activePlanId, calculate1RM, playSound, updateExercise, updateState]);

  // Session management
  const startGlobalSession = useCallback(() => {
    if (state.sessionStarted) return;

    const currentGlobalSession: SessionHistory = {
      id: state.nextSessionHistoryId,
      startTime: new Date().toISOString(),
      endTime: null,
      reasonForEarlyStop: null,
      planId: state.activePlanId,
      planName: state.activePlanId ? 
        state.trainingPlans.find(p => p.id === state.activePlanId)?.name || 'بدون خطة' : 
        'بدون خطة',
      exercisesCompleted: 0
    };

    updateState({
      sessionStarted: true,
      currentGlobalSession,
      nextSessionHistoryId: state.nextSessionHistoryId + 1
    });

    // Start global session timer
    sessionTimerRef.current = setInterval(() => {
      setState(prevState => {
        const newState = {
          ...prevState,
          sessionSeconds: prevState.sessionSeconds + 1
        };
        saveData(newState);
        return newState;
      });
    }, 1000);
  }, [state.sessionStarted, state.nextSessionHistoryId, state.activePlanId, state.trainingPlans, updateState]);

  const checkWorkoutAchievements = useCallback((completedSession: SessionHistory, allExercises: Exercise[], allSessions: SessionHistory[]) => {
    const now = new Date();

    const unlockAchievement = (achievementId: AchievementId) => {
        const isAlreadyUnlocked = state.achievements.some(a => a.id === achievementId);
        if (isAlreadyUnlocked) return;

        const achievementData = ACHIEVEMENTS_DATABASE[achievementId];
        if (!achievementData) return;

        const newAchievement: Achievement = {
            ...achievementData,
            unlocked: true,
            dateUnlocked: new Date().toISOString(),
        };
        updateState({ achievements: [...state.achievements, newAchievement] });
    };

    // FIRST_WORKOUT
    if (allSessions.length >= 1) {
      unlockAchievement('FIRST_WORKOUT');
    }

    // CONSISTENCY
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentSessions = allSessions.filter(s => new Date(s.startTime) > oneWeekAgo);
    const uniqueDays = new Set(recentSessions.map(s => new Date(s.startTime).toDateString())).size;

    if (uniqueDays >= 3) unlockAchievement('CONSISTENCY_BRONZE');
    if (uniqueDays >= 5) unlockAchievement('CONSISTENCY_SILVER');
    if (uniqueDays >= 7) unlockAchievement('CONSISTENCY_GOLD');

    // PERFECT_MONTH
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const plannedWorkoutsThisMonth = state.plannedWorkouts.filter(pw => {
        const d = new Date(pw.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const completedPlannedWorkoutsThisMonth = plannedWorkoutsThisMonth.every(pw =>
        allSessions.some(s => new Date(s.startTime).toDateString() === new Date(pw.date).toDateString() && s.endTime)
    );
    if (plannedWorkoutsThisMonth.length > 0 && completedPlannedWorkoutsThisMonth) {
        unlockAchievement('PERFECT_MONTH');
    }

    // VOLUME MILESTONES
    const totalVolume = allExercises.reduce((total, exercise) => {
        return total + Object.values(exercise.sessionData).reduce((subTotal, data) => subTotal + (data.volume || 0), 0);
    }, 0);

    if (totalVolume >= 1000) unlockAchievement('VOLUME_MILESTONE_1');
    if (totalVolume >= 10000) unlockAchievement('VOLUME_MILESTONE_2');
    if (totalVolume >= 100000) unlockAchievement('VOLUME_MILESTONE_3');

    // SESSION MILESTONES
    const completedSessionsCount = allSessions.filter(s => s.endTime).length;
    if (completedSessionsCount >= 10) unlockAchievement('SESSION_MILESTONE_1');
    if (completedSessionsCount >= 50) unlockAchievement('SESSION_MILESTONE_2');
    if (completedSessionsCount >= 100) unlockAchievement('SESSION_MILESTONE_3');

    // CHALLENGES
    if (completedSession.endTime) {
        const endHour = new Date(completedSession.endTime).getHours();
        if (endHour >= 22 || endHour < 4) {
            unlockAchievement('CHALLENGE_NIGHT_OWL');
        }
        if (endHour >= 4 && endHour < 7) {
            unlockAchievement('CHALLENGE_EARLY_BIRD');
        }
    }
  }, [state.achievements, state.plannedWorkouts, updateState]);

  const stopGlobalSession = useCallback((reason?: string) => {
    if (!state.sessionStarted || !state.currentGlobalSession) return;

    // Clear global timer
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }

    // Clear all exercise timers
    [exerciseTimersRef, restTimersRef, restCountdownTimersRef, wastedTimeTimersRef].forEach(timerMap => {
      timerMap.current.forEach(timer => clearInterval(timer));
      timerMap.current.clear();
    });

    const completedSession: SessionHistory = {
      ...state.currentGlobalSession,
      endTime: new Date().toISOString(),
      reasonForEarlyStop: reason || null,
    };

    const updatedSessionHistory = [...state.sessionHistory, completedSession];

    // Reset all exercises in active plan
    const updatedExercises = state.exercises.map(exercise => {
      const activePlan = state.trainingPlans.find(p => p.id === state.activePlanId);
      if (activePlan && activePlan.exercises.includes(exercise.id) && exercise.status !== 'completed') {
        return {
          ...exercise,
          status: 'pending' as const,
          exerciseSecondsCurrentSession: 0,
          restSecondsCurrentSession: 0,
          wastedTimeSeconds: 0,
          completedSessions: 0,
          currentSession: 1,
          difficulty: null,
          sessionData: {},
          audioAlertTriggered: false,
          isRestPaused: false,
          restStartTime: null
        };
      }
      return exercise;
    });

    updateState({
      sessionStarted: false,
      sessionSeconds: 0,
      currentGlobalSession: null,
      sessionHistory: updatedSessionHistory,
      exercises: updatedExercises
    });

    checkWorkoutAchievements(completedSession, updatedExercises, updatedSessionHistory);
  }, [state.sessionStarted, state.currentGlobalSession, state.sessionHistory, state.exercises, state.trainingPlans, state.activePlanId, updateState, checkWorkoutAchievements]);

  // Training plan management
  const addTrainingPlan = useCallback((plan: Omit<TrainingPlan, 'id'>) => {
    const newPlan: TrainingPlan = {
      ...plan,
      id: state.nextPlanId
    };

    if (state.trainingPlans.length === 0) {
        const achievementData = ACHIEVEMENTS_DATABASE['CHALLENGE_PLAN_MASTER'];
        if (achievementData) {
            const newAchievement: Achievement = {
                ...achievementData,
                unlocked: true,
                dateUnlocked: new Date().toISOString(),
            };
            updateState({ achievements: [...state.achievements, newAchievement] });
        }
    }

    updateState({
      trainingPlans: [...state.trainingPlans, newPlan],
      nextPlanId: state.nextPlanId + 1
    });
  }, [state.trainingPlans, state.nextPlanId, state.achievements, updateState]);

  const updateTrainingPlan = useCallback((id: number, updates: Partial<TrainingPlan>) => {
    const updatedPlans = state.trainingPlans.map(plan =>
      plan.id === id ? { ...plan, ...updates } : plan
    );
    updateState({ trainingPlans: updatedPlans });
  }, [state.trainingPlans, updateState]);

  const deleteTrainingPlan = useCallback((id: number) => {
    const updatedPlans = state.trainingPlans.filter(p => p.id !== id);
    const updatedPlannedWorkouts = state.plannedWorkouts.filter(pw => pw.planId !== id);
    
    let updates: Partial<AppState> = {
      trainingPlans: updatedPlans,
      plannedWorkouts: updatedPlannedWorkouts
    };

    if (state.activePlanId === id) {
      updates.activePlanId = null;
      updates.currentExercise = null;
    }

    updateState(updates);
  }, [state.trainingPlans, state.plannedWorkouts, state.activePlanId, updateState]);

  const activateTrainingPlan = useCallback((planId: number) => {
    const updatedPlans = state.trainingPlans.map(plan => ({
      ...plan,
      active: plan.id === planId
    }));

    const planToActivate = updatedPlans.find(p => p.id === planId);
    const currentExercise = planToActivate && planToActivate.exercises.length > 0 ? 
      planToActivate.exercises[0] : null;

    // Reset exercises in the plan
    const updatedExercises = state.exercises.map(exercise => {
      if (planToActivate && planToActivate.exercises.includes(exercise.id)) {
        return {
          ...exercise,
          status: 'pending' as const,
          exerciseSecondsCurrentSession: 0,
          restSecondsCurrentSession: 0,
          totalExerciseSecondsAccumulated: 0,
          totalRestSecondsAccumulated: 0,
          wastedTimeSeconds: 0,
          completedSessions: 0,
          currentSession: 1,
          difficulty: null,
          sessionData: {},
          audioAlertTriggered: false,
          isRestPaused: false,
          restStartTime: null
        };
      }
      return exercise;
    });

    updateState({
      trainingPlans: updatedPlans,
      activePlanId: planId,
      currentExercise,
      exercises: updatedExercises
    });
  }, [state.trainingPlans, state.exercises, updateState]);

  const deactivateAllPlans = useCallback(() => {
    const updatedPlans = state.trainingPlans.map(plan => ({
      ...plan,
      active: false
    }));

    updateState({
      trainingPlans: updatedPlans,
      activePlanId: null,
      currentExercise: null
    });
  }, [state.trainingPlans, updateState]);

  // Planned workout management
  const addPlannedWorkout = useCallback((date: string, planId: number) => {
    const plan = state.trainingPlans.find(p => p.id === planId);
    if (!plan) return;

    const newPlannedWorkout = {
      id: state.nextPlannedWorkoutId,
      date,
      planId,
      planName: plan.name,
    };

    updateState({
      plannedWorkouts: [...state.plannedWorkouts, newPlannedWorkout],
      nextPlannedWorkoutId: state.nextPlannedWorkoutId + 1,
    });
  }, [state.trainingPlans, state.plannedWorkouts, state.nextPlannedWorkoutId, updateState]);

  const deletePlannedWorkout = useCallback((date: string, planId: number) => {
    const updatedPlannedWorkouts = state.plannedWorkouts.filter(
      pw => !(pw.date === date && pw.planId === planId)
    );
    updateState({ plannedWorkouts: updatedPlannedWorkouts });
  }, [state.plannedWorkouts, updateState]);

  // Notification management
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.max(...state.notifications.map(n => n.id), 0) + 1
    };

    updateState({
      notifications: [...state.notifications, newNotification]
    });
  }, [state.notifications, updateState]);

  const updateNotification = useCallback((id: number, updates: Partial<Notification>) => {
    const updatedNotifications = state.notifications.map(notification =>
      notification.id === id ? { ...notification, ...updates } : notification
    );
    updateState({ notifications: updatedNotifications });
  }, [state.notifications, updateState]);

  const deleteNotification = useCallback((id: number) => {
    const updatedNotifications = state.notifications.filter(n => n.id !== id);
    updateState({ notifications: updatedNotifications });
  }, [state.notifications, updateState]);

  // Settings management
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    updateState({
      settings: { ...state.settings, ...updates }
    });
  }, [state.settings, updateState]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
      [exerciseTimersRef, restTimersRef, restCountdownTimersRef, wastedTimeTimersRef].forEach(timerMap => {
        timerMap.current.forEach(timer => {
          if (timer) {
            clearInterval(timer);
          }
        });
        timerMap.current.clear();
      });
    };
  }, []);

  return useMemo(() => ({
    // State
    ...state,
    
    // Helpers
    formatTime,
    calculate1RM,
    calculateWorkoutEfficiency,
    playSound,
    
    // Exercise management
    addExercise,
    updateExercise,
    deleteExercise,
    
    // Timer management
    startExerciseTimer,
    pauseExerciseTimer,
    resumeExerciseTimer,
    finishSession,
    
    // Session management
    startGlobalSession,
    stopGlobalSession,
    
    // Training plan management
    addTrainingPlan,
    updateTrainingPlan,
    deleteTrainingPlan,
    activateTrainingPlan,
    deactivateAllPlans,
    addPlannedWorkout,
    deletePlannedWorkout,
    
    // Notification management
    addNotification,
    updateNotification,
    deleteNotification,
    
    // Settings
    updateSettings,
    
    // State updates
    updateState
  }), [state, formatTime, calculate1RM, playSound, addExercise, updateExercise, deleteExercise, startExerciseTimer, pauseExerciseTimer, resumeExerciseTimer, finishSession, startGlobalSession, stopGlobalSession, addTrainingPlan, updateTrainingPlan, deleteTrainingPlan, activateTrainingPlan, deactivateAllPlans, addNotification, updateNotification, deleteNotification, updateSettings, updateState, checkWorkoutAchievements]);
});