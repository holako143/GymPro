import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Animated, Easing } from 'react-native';
import { Exercise, DIFFICULTY_EMOJIS, DifficultyLevel, DIFFICULTY_LABELS } from '@/types/fitness';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import { Play, Pause, Square, Clock, Target, X, Dumbbell, Volume2, VolumeX, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

interface ExerciseCardProps {
  exercise: Exercise;
  isActive: boolean;
}

export default function ExerciseCard({ exercise, isActive }: ExerciseCardProps) {
  const { 
    startExerciseTimer, 
    pauseExerciseTimer,
    finishSession,
    formatTime,
    settings,
    updateState,
    exercises,
    activePlanId,
    trainingPlans,
    sessionStarted,
  } = useFitnessStore();

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [weight, setWeight] = useState<string>('20');
  const [reps, setReps] = useState<string>('10');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const buttonPressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // NOTE: Sound feature is temporarily disabled as the asset file is missing.
    // To enable, add 'click.mp3' to 'assets/sounds/' and uncomment the following lines.
    /*
    Audio.Sound.createAsync(require('@/assets/sounds/click.mp3'))
      .then(response => setSound(response.sound))
      .catch(() => console.log("Could not load sound asset. Sound will be disabled."));
    */

    return () => {
      sound?.unloadAsync();
    };
  }, []);

  const playSoundAndHaptic = async (hapticStyle: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (!isSoundMuted && sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        // silent fail
      }
    }
    Haptics.impactAsync(hapticStyle);
  };

  const getDifficultyColor = (difficulty: string | null) => {
    const colors = {
      'very-easy': '#4ade80',
      'easy': '#a3e635',
      'medium': '#f59e0b',
      'hard': '#ef4444',
      'very-hard': '#b91c1c'
    };
    return difficulty ? colors[difficulty as keyof typeof colors] : 'transparent';
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      'completed': 'تم الإنتهاء',
      'in-progress': 'قيد التنفيذ',
      'resting': 'في الراحة',
      'pending': 'لم يبدأ'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'completed': '#4cc9f0',
      'in-progress': settings.primaryColor,
      'resting': '#7209b7',
      'pending': '#fca311'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  const progressPercent = exercise.sessions > 0 ? 
    (exercise.completedSessions / exercise.sessions) * 100 : 0;

  const isRestOverdue = exercise.status === 'resting' && 
    exercise.restSecondsCurrentSession < -15;

  const handleStartExercise = () => {
    playSoundAndHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setShowSummary(false);
    startExerciseTimer(exercise.id);
  };

  const handlePauseResume = () => {
    playSoundAndHaptic();
    if (exercise.status === 'in-progress') {
      pauseExerciseTimer(exercise.id);
    } else if (exercise.isRestPaused) {
      startExerciseTimer(exercise.id);
    } else if (exercise.status === 'pending') {
      startExerciseTimer(exercise.id);
    }
  };

  const getPauseResumeText = () => {
    if (exercise.status === 'in-progress') {
      return 'راحة';
    } else if (exercise.isRestPaused) {
      return 'استئناف';
    }
    return 'بدء';
  };

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSummary(true);
  };

  const handleFinishSubmit = () => {
    const weightNum = parseFloat(weight) || 20;
    const repsNum = parseInt(reps) || 10;
    
    finishSession(exercise.id, exercise.currentSession, weightNum, repsNum, selectedDifficulty);
    setShowFinishModal(false);
    
    // Move to next exercise automatically if this one is completed
    setTimeout(() => {
      const updatedExercise = exercises.find(e => e.id === exercise.id);
      if (updatedExercise && updatedExercise.status === 'completed') {
        // Enhanced slide out animation
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 600,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        ]).start(() => {
          moveToNextExercise();
        });
      }
    }, 100);
  };

  const moveToNextExercise = useCallback(() => {
    if (activePlanId) {
      const activePlan = trainingPlans.find(p => p.id === activePlanId);
      if (activePlan) {
        const remainingExercises = activePlan.exercises.filter(id => {
          const ex = exercises.find(e => e.id === id);
          return ex && ex.status !== 'completed';
        });
        
        if (remainingExercises.length > 0) {
          updateState({ currentExercise: remainingExercises[0] });
        }
      }
    }
  }, [activePlanId, trainingPlans, exercises, updateState]);

  const handleSessionPress = (sessionNum: number) => {
    const sessionData = exercise.sessionData[sessionNum];
    if (sessionData) {
      setSelectedSession(sessionNum);
      setShowSessionModal(true);
    }
  };

  // Disable buttons if session hasn't started
  const isStartDisabled = !sessionStarted || exercise.status === 'completed' || 
    exercise.status === 'in-progress' || exercise.status === 'resting';
  
  const isPauseResumeDisabled = !sessionStarted || exercise.status === 'completed';
  
  const isFinishDisabled = !sessionStarted || exercise.status === 'completed' || 
    exercise.currentSession > exercise.sessions || exercise.status === 'pending';

  // Auto-move to next exercise when completed
  useEffect(() => {
    if (exercise.status === 'completed' && isActive) {
      const timer = setTimeout(() => {
        // Enhanced completion animation
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.7,
            duration: 800,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        ]).start(() => {
          moveToNextExercise();
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [exercise.status, isActive, slideAnim, scaleAnim, fadeAnim, moveToNextExercise]);

  // Entrance animation for active card
  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isActive, scaleAnim, fadeAnim]);

  const cardTransform = {
    transform: [
      {
        translateX: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 400],
        }),
      },
      {
        scale: Animated.multiply(scaleAnim, buttonPressAnim),
      },
      {
        rotateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '15deg'],
        }),
      },
    ],
    opacity: fadeAnim,
  };

  return (
    <Animated.View style={[
      styles.card,
      isActive && styles.activeCard,
      isRestOverdue && styles.restOverdueCard,
      { borderLeftColor: getDifficultyColor(exercise.difficulty) },
      cardTransform
    ]}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.difficulty && (
              <Text style={styles.headerDifficultyEmoji}>
                {DIFFICULTY_EMOJIS[exercise.difficulty]}
              </Text>
            )}
          </View>
          <View style={styles.muscleAndStatsRow}>
            <Text style={styles.muscleGroup}>{exercise.muscle}</Text>
            <View style={styles.compactStats}>
              <View style={styles.compactStatItem}>
                <Text style={styles.compactStatLabel}>الجلسة</Text>
                <Text style={[styles.compactStatValue, { color: settings.primaryColor }]}>
                  {exercise.currentSession}/{exercise.sessions}
                </Text>
              </View>
              <View style={styles.compactStatItem}>
                <Text style={styles.compactStatLabel}>مكتملة</Text>
                <Text style={[styles.compactStatValue, { color: '#10b981' }]}>
                  {exercise.completedSessions}/{exercise.sessions}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setIsSoundMuted(!isSoundMuted)} style={styles.muteButton}>
            {isSoundMuted ? <VolumeX size={18} color="#6b7280" /> : <Volume2 size={18} color="#6b7280" />}
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(exercise.status) }]}>
            <Text style={styles.statusText}>{getStatusText(exercise.status)}</Text>
          </View>
        </View>
      </View>

      {/* Main Display Area */}
      <View style={styles.mainDisplayContainer}>
        {showSummary ? (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>ملخص الجلسة الحالية</Text>
            <View style={styles.summaryStatRow}>
              <Text style={styles.summaryStatLabel}>وقت التمرين:</Text>
              <Text style={[styles.summaryStatValue, { color: settings.primaryColor }]}>{formatTime(exercise.exerciseSecondsCurrentSession)}</Text>
            </View>
            <View style={styles.summaryStatRow}>
              <Text style={styles.summaryStatLabel}>وقت الراحة:</Text>
              <Text style={[styles.summaryStatValue, { color: '#f59e0b' }]}>{formatTime(exercise.restSecondsCurrentSession)}</Text>
            </View>
            {exercise.wastedTimeSeconds > 0 && (
              <View style={styles.summaryStatRow}>
                <Text style={styles.summaryStatLabel}>الوقت الضائع:</Text>
                <Text style={[styles.summaryStatValue, { color: '#ef4444' }]}>{formatTime(exercise.wastedTimeSeconds)}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.logSessionButton, { backgroundColor: settings.primaryColor }]}
              onPress={() => {
                setShowSummary(false);
                setShowFinishModal(true);
              }}
            >
              <Text style={styles.logSessionButtonText}>تسجيل الجلسة و المتابعة</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {exercise.status === 'pending' && (
              <View style={styles.mainTimerContainer}>
                <Dumbbell size={48} color="#9ca3af" />
                <Text style={styles.mainTimerLabel}>جاهز للبدء</Text>
              </View>
            )}
            {exercise.status === 'in-progress' && (
              <View style={styles.mainTimerContainer}>
                <Text style={styles.mainTimerLabel}>وقت التمرين</Text>
                <Text style={[styles.mainTimerValue, { color: settings.primaryColor }]}>
                  {formatTime(exercise.exerciseSecondsCurrentSession)}
                </Text>
              </View>
            )}
            {exercise.status === 'resting' && (
              <View style={styles.mainTimerContainer}>
                <Text style={styles.mainTimerLabel}>وقت الراحة</Text>
                <Text style={[styles.mainTimerValue, { color: '#f59e0b' }]}>
                  {formatTime(exercise.restSecondsCurrentSession)}
                </Text>
              </View>
            )}
            {exercise.status === 'completed' && (
              <View style={styles.mainTimerContainer}>
                <CheckCircle2 size={48} color="#10b981" />
                <Text style={styles.mainTimerLabel}>اكتمل التمرين</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Enhanced Timer Section */}
      <View style={styles.timerSection}>
        <View style={styles.timersGrid}>
          <View style={styles.timerCard}>
            <Clock size={16} color={settings.primaryColor} />
            <Text style={[styles.timerValue, { color: settings.primaryColor }]}>
              {formatTime(exercise.exerciseSecondsCurrentSession)}
            </Text>
            <Text style={styles.timerLabel}>وقت التمرين</Text>
          </View>
          
          <View style={styles.timerCard}>
            <Clock size={16} color="#f59e0b" />
            <Text style={[styles.timerValue, { color: '#f59e0b' }]}>
              {formatTime(exercise.restSecondsCurrentSession)}
            </Text>
            <Text style={styles.timerLabel}>وقت الراحة</Text>
          </View>
          
          {exercise.wastedTimeSeconds > 0 && (
            <View style={styles.timerCard}>
              <Clock size={16} color="#ef4444" />
              <Text style={[styles.timerValue, { color: '#ef4444' }]}>
                {formatTime(exercise.wastedTimeSeconds)}
              </Text>
              <Text style={styles.timerLabel}>وقت ضائع</Text>
            </View>
          )}
        </View>
      </View>

      {/* Enhanced Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>التقدم</Text>
          <Text style={[styles.progressPercent, { color: settings.primaryColor }]}>
            {Math.round(progressPercent)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercent}%`,
                backgroundColor: settings.primaryColor 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {exercise.completedSessions} من {exercise.sessions} جلسة مكتملة
        </Text>
      </View>

      {/* Enhanced Controls */}
      <View style={styles.controlsContainer}>
        <Animated.View style={[styles.animatedButtonWrapper, { transform: [{ scale: buttonPressAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.modernControlButton,
              { backgroundColor: settings.primaryColor },
              isStartDisabled && styles.disabledButton
            ]}
            onPress={handleStartExercise}
            disabled={isStartDisabled}
          >
            <Play size={14} color="white" />
            <Text style={styles.modernControlButtonText}>بدء</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.animatedButtonWrapper, { transform: [{ scale: buttonPressAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.modernControlButton,
              exercise.status === 'in-progress' ? 
                { backgroundColor: '#f59e0b' } : 
                exercise.isRestPaused ?
                { backgroundColor: '#10b981' } :
                { backgroundColor: settings.primaryColor },
              isPauseResumeDisabled && styles.disabledButton
            ]}
            onPress={handlePauseResume}
            disabled={isPauseResumeDisabled}
          >
            {exercise.status === 'in-progress' ? (
              <Pause size={14} color="white" />
            ) : (
              <Play size={14} color="white" />
            )}
            <Text style={styles.modernControlButtonText}>{getPauseResumeText()}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.animatedButtonWrapper, { transform: [{ scale: buttonPressAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.modernControlButton,
              { backgroundColor: '#10b981' },
              isFinishDisabled && styles.disabledButton
            ]}
            onPress={handleFinish}
            disabled={isFinishDisabled}
          >
            <Square size={14} color="white" />
            <Text style={styles.modernControlButtonText}>إنهاء</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>



      {/* Enhanced Sessions Grid */}
      <View style={styles.sessionsContainer}>
        <Text style={styles.sessionsTitle}>الجلسات ({exercise.completedSessions}/{exercise.sessions})</Text>
        <View style={styles.sessionsGrid}>
          {Array.from({ length: exercise.sessions }, (_, i) => {
            const sessionNum = i + 1;
            const isCompleted = sessionNum <= exercise.completedSessions;
            const isCurrentSession = sessionNum === exercise.currentSession && 
              (exercise.status === 'in-progress' || exercise.status === 'resting');
            const sessionData = exercise.sessionData[sessionNum];

            return (
              <TouchableOpacity 
                key={sessionNum}
                style={[
                  styles.sessionCard,
                  isCurrentSession && styles.activeSessionCard,
                  isCompleted && [
                    styles.completedSessionCard,
                    { backgroundColor: sessionData ? getDifficultyColor(sessionData.difficulty) : '#10b981' }
                  ]
                ]}
                onPress={() => handleSessionPress(sessionNum)}
                disabled={!sessionData}
              >
                <Text style={[
                  styles.sessionNumber,
                  isCompleted && { color: 'white' },
                  isCurrentSession && { color: settings.primaryColor }
                ]}>
                  {sessionNum}
                </Text>
                {sessionData && (
                  <>
                    <View style={styles.sessionStats}>
                      <Text style={[
                        styles.sessionStatText,
                        isCompleted && { color: 'white' }
                      ]}>
                        {sessionData.weight}kg • {sessionData.reps}×
                      </Text>
                    </View>
                    <Text style={styles.sessionEmoji}>
                      {DIFFICULTY_EMOJIS[sessionData.difficulty]}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Finish Session Modal */}
      <Modal
        visible={showFinishModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFinishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إنهاء الجلسة {exercise.currentSession}</Text>
              <TouchableOpacity onPress={() => setShowFinishModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>الوزن (كيلو)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="20"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>عدد العدات</Text>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                keyboardType="numeric"
                placeholder="10"
              />
            </View>

            <View style={styles.difficultyContainer}>
              <Text style={styles.inputLabel}>حالة التمرين</Text>
              <View style={styles.difficultyGrid}>
                {(['very-easy', 'easy', 'medium', 'hard', 'very-hard'] as DifficultyLevel[]).map((difficulty) => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.difficultyButton,
                      selectedDifficulty === difficulty && styles.selectedDifficultyButton
                    ]}
                    onPress={() => {
                      if (difficulty && typeof difficulty === 'string' && difficulty.trim()) {
                        setSelectedDifficulty(difficulty);
                      }
                    }}
                  >
                    <Text style={styles.difficultyEmoji}>
                      {DIFFICULTY_EMOJIS[difficulty]}
                    </Text>
                    <Text style={[
                      styles.difficultyLabel,
                      selectedDifficulty === difficulty && styles.selectedDifficultyLabel
                    ]}>
                      {DIFFICULTY_LABELS[difficulty]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: settings.primaryColor }]}
              onPress={handleFinishSubmit}
            >
              <Text style={styles.submitButtonText}>حفظ وإنهاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Session Details Modal */}
      <Modal
        visible={showSessionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sessionModalContent}>
            {selectedSession && exercise.sessionData[selectedSession] && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>تفاصيل الجلسة {selectedSession}</Text>
                  <TouchableOpacity onPress={() => setShowSessionModal(false)}>
                    <X size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View style={styles.sessionDetailContainer}>
                  <View style={styles.sessionDetailRow}>
                    <Text style={styles.sessionDetailLabel}>الوزن:</Text>
                    <Text style={styles.sessionDetailValue}>{exercise.sessionData[selectedSession].weight} كيلو</Text>
                  </View>
                  <View style={styles.sessionDetailRow}>
                    <Text style={styles.sessionDetailLabel}>العدات:</Text>
                    <Text style={styles.sessionDetailValue}>{exercise.sessionData[selectedSession].reps} عدة</Text>
                  </View>
                  <View style={styles.sessionDetailRow}>
                    <Text style={styles.sessionDetailLabel}>وقت التمرين:</Text>
                    <Text style={styles.sessionDetailValue}>{formatTime(exercise.sessionData[selectedSession].sessionExerciseDuration)}</Text>
                  </View>
                  <View style={styles.sessionDetailRow}>
                    <Text style={styles.sessionDetailLabel}>وقت الراحة:</Text>
                    <Text style={styles.sessionDetailValue}>{formatTime(exercise.sessionData[selectedSession].sessionRestDuration)}</Text>
                  </View>
                  {exercise.sessionData[selectedSession].wastedTime > 0 && (
                    <View style={styles.sessionDetailRow}>
                      <Text style={styles.sessionDetailLabel}>وقت ضائع:</Text>
                      <Text style={[styles.sessionDetailValue, { color: '#ef4444' }]}>{formatTime(exercise.sessionData[selectedSession].wastedTime)}</Text>
                    </View>
                  )}
                  <View style={styles.sessionDetailRow}>
                    <Text style={styles.sessionDetailLabel}>الصعوبة:</Text>
                    <View style={styles.difficultyDisplay}>
                      <Text style={styles.sessionDetailValue}>{DIFFICULTY_LABELS[exercise.sessionData[selectedSession].difficulty]}</Text>
                      <Text style={styles.sessionDetailEmoji}>{DIFFICULTY_EMOJIS[exercise.sessionData[selectedSession].difficulty]}</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activeCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  restOverdueCard: {
    borderLeftColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOpacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  muteButton: {
    padding: 4,
  },
  titleSection: {
    flex: 1,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    letterSpacing: -0.2,
  },
  headerDifficultyEmoji: {
    fontSize: 18,
    marginLeft: 6,
  },
  muscleGroup: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  muscleAndStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  compactStats: {
    flexDirection: 'row',
    gap: 12,
  },
  compactStatItem: {
    alignItems: 'center',
  },
  compactStatLabel: {
    fontSize: 9,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 2,
  },
  compactStatValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  mainDisplayContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  mainTimerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  mainTimerLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600'
  },
  mainTimerValue: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  timer: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  timerLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 120,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.1,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 6,
  },
  modernControlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  modernControlButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.1,
  },
  sessionsContainer: {
    marginTop: 12,
  },
  sessionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
    letterSpacing: -0.1,
  },
  sessionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sessionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  activeSessionCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    borderWidth: 2,
  },
  completedSessionCard: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  sessionNumber: {
    fontWeight: '800',
    fontSize: 16,
    color: '#1f2937',
  },
  sessionStats: {
    alignItems: 'center',
  },
  sessionStatText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  sessionEmoji: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  sessionModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  difficultyContainer: {
    marginBottom: 20,
  },
  difficultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    gap: 4,
  },
  selectedDifficultyButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  difficultyEmoji: {
    fontSize: 20,
  },
  difficultyLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedDifficultyLabel: {
    color: '#3b82f6',
  },
  submitButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  sessionDetailContainer: {
    gap: 12,
  },
  sessionDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sessionDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  sessionDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  difficultyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionDetailEmoji: {
    fontSize: 16,
  },
  timersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 8,
  },
  timerCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  timerValue: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  animatedButtonWrapper: {
    flex: 1,
  },
  summaryContainer: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  summaryStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  summaryStatLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryStatValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  logSessionButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logSessionButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});
