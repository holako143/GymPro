import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Animated } from 'react-native';
import { Exercise, DIFFICULTY_EMOJIS, DifficultyLevel, DIFFICULTY_LABELS } from '@/types/fitness';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import { Play, Pause, Check, X } from 'lucide-react-native';

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
    sessionStarted,
  } = useFitnessStore();

  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [weight, setWeight] = useState<string>('20');
  const [reps, setReps] = useState<string>('10');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const buttonPressAnim = useRef(new Animated.Value(1)).current;

  const getDifficultyColor = (difficulty: string | null) => {
    const colors = { 'very-easy': '#4ade80', 'easy': '#a3e635', 'medium': '#f59e0b', 'hard': '#ef4444', 'very-hard': '#b91c1c' };
    return difficulty ? colors[difficulty as keyof typeof colors] : 'transparent';
  };

  const getStatusText = (status: string) => {
    const statusMap = { 'completed': 'مكتمل', 'in-progress': 'قيد التمرين', 'resting': 'في راحة', 'pending': 'جاهز للبدء' };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = { 'completed': '#4ade80', 'in-progress': settings.primaryColor, 'resting': '#f59e0b', 'pending': '#6b7280' };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  const isRestOverdue = exercise.status === 'resting' && exercise.restSecondsCurrentSession < -15;

  const handleMainAction = () => {
    if (!sessionStarted) return;

    Animated.sequence([
      Animated.timing(buttonPressAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonPressAnim, { toValue: 1, duration: 150, useNativeDriver: true })
    ]).start();

    switch(exercise.status) {
      case 'pending':
        startExerciseTimer(exercise.id);
        break;
      case 'in-progress':
        pauseExerciseTimer(exercise.id);
        break;
      case 'resting':
        startExerciseTimer(exercise.id); // This will resume the exercise
        break;
    }
  };

  const [restReason, setRestReason] = useState<string>('');
  const PREDEFINED_REASONS = ["انتظار المعدات", "حديث اجتماعي", "تعب شديد", "تمرين شاق"];

  const handleFinishSubmit = () => {
    const weightNum = parseFloat(weight) || 20;
    const repsNum = parseInt(reps) || 10;
    const finalRestReason = restReason.trim() || undefined;
    finishSession(exercise.id, exercise.currentSession, weightNum, repsNum, selectedDifficulty, finalRestReason);
    setShowFinishModal(false);
    setRestReason('');
  };

  const handleSessionPress = (sessionNum: number) => {
    const sessionData = exercise.sessionData[sessionNum];
    if (sessionData) {
      setSelectedSession(sessionNum);
      setShowSessionModal(true);
    }
  };

  const isActionDisabled = !sessionStarted || exercise.status === 'completed';

  const renderMainTimer = () => {
    let time = '00:00';
    let label = 'وقت التمرين';
    let color = settings.primaryColor;

    if (exercise.status === 'in-progress') {
      time = formatTime(exercise.exerciseSecondsCurrentSession);
    } else if (exercise.status === 'resting') {
      time = formatTime(exercise.restSecondsCurrentSession);
      label = 'وقت الراحة';
      color = '#f59e0b';
    }

    return (
      <View style={styles.mainTimerContainer}>
        <Text style={[styles.mainTimerLabel, { color }]}>{label}</Text>
        <Text style={[styles.mainTimer, { color }]}>{time}</Text>
        {exercise.status === 'resting' && exercise.wastedTimeSeconds > 0 && (
            <Text style={styles.wastedTimeText}>
                (وقت ضائع: {formatTime(exercise.wastedTimeSeconds)})
            </Text>
        )}
      </View>
    );
  };

  const renderMainActionButton = () => {
    let text = 'بدء';
    let icon = <Play size={24} color="white" />;
    let style = { backgroundColor: settings.primaryColor };

    switch(exercise.status) {
      case 'in-progress':
        text = 'راحة';
        icon = <Pause size={24} color="white" />;
        style = { backgroundColor: '#f59e0b' };
        break;
      case 'resting':
        text = 'استئناف';
        icon = <Play size={24} color="white" />;
        style = { backgroundColor: '#10b981' };
        break;
    }

    return (
      <TouchableOpacity
        style={[styles.mainActionButton, style, isActionDisabled && styles.disabledButton]}
        onPress={handleMainAction}
        disabled={isActionDisabled}
      >
        {icon}
        <Text style={styles.mainActionButtonText}>{text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[styles.card, isActive && styles.activeCard, isRestOverdue && styles.restOverdueCard, { transform: [{ scale: scaleAnim }], opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.exerciseName} numberOfLines={1}>{exercise.name}</Text>
          <Text style={styles.muscleGroup}>{exercise.muscle}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(exercise.status) }]}>
          <Text style={styles.statusText}>{getStatusText(exercise.status)}</Text>
        </View>
      </View>

      {renderMainTimer()}

      <View style={styles.controlsContainer}>
        {renderMainActionButton()}
        <TouchableOpacity
          style={[styles.finishButton, isActionDisabled && styles.disabledButton]}
          onPress={() => setShowFinishModal(true)}
          disabled={isActionDisabled}
        >
          <Check size={20} color={settings.primaryColor} />
          <Text style={styles.finishButtonText}>إنهاء الجلسة</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionsContainer}>
        <Text style={styles.sessionsTitle}>الجلسات المكتملة</Text>
        <View style={styles.sessionsGrid}>
          {Array.from({ length: exercise.sessions }, (_, i) => {
            const sessionNum = i + 1;
            const isCompleted = sessionNum <= exercise.completedSessions;
            const sessionData = exercise.sessionData[sessionNum];
            return (
              <TouchableOpacity key={sessionNum} style={[styles.sessionChip, isCompleted ? { backgroundColor: getDifficultyColor(sessionData?.difficulty || null), borderColor: getDifficultyColor(sessionData?.difficulty || null) } : {}]} onPress={() => handleSessionPress(sessionNum)} disabled={!sessionData}>
                <Text style={[styles.sessionChipText, isCompleted && { color: 'white' }]}>{sessionNum}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Modals remain the same */}
      <Modal visible={showFinishModal} transparent={true} animationType="slide" onRequestClose={() => setShowFinishModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.modalContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>إنهاء الجلسة {exercise.currentSession}</Text><TouchableOpacity onPress={() => setShowFinishModal(false)}><X size={24} color="#6b7280" /></TouchableOpacity></View><View style={styles.inputContainer}><Text style={styles.inputLabel}>الوزن (كيلو)</Text><TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="20" /></View><View style={styles.inputContainer}><Text style={styles.inputLabel}>عدد العدات</Text><TextInput style={styles.input} value={reps} onChangeText={setReps} keyboardType="numeric" placeholder="10" /></View><View style={styles.difficultyContainer}><Text style={styles.inputLabel}>تقييم الصعوبة</Text><View style={styles.difficultyGrid}>{(['very-easy', 'easy', 'medium', 'hard', 'very-hard'] as DifficultyLevel[]).map((difficulty) => (<TouchableOpacity key={difficulty} style={[styles.difficultyButton, selectedDifficulty === difficulty && { borderColor: getDifficultyColor(difficulty), backgroundColor: getDifficultyColor(difficulty)+'20' }]} onPress={() => setSelectedDifficulty(difficulty)}><Text style={styles.difficultyEmoji}>{DIFFICULTY_EMOJIS[difficulty]}</Text><Text style={styles.difficultyLabel}>{DIFFICULTY_LABELS[difficulty]}</Text></TouchableOpacity>))}</View></View>
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>سبب إطالة الراحة (اختياري)</Text>
                <View style={styles.predefinedReasonsContainer}>
                    {PREDEFINED_REASONS.map(reason => (
                        <TouchableOpacity key={reason} style={[styles.reasonButton, restReason === reason && { backgroundColor: settings.secondaryColor }]} onPress={() => setRestReason(reason)}>
                            <Text style={[styles.reasonButtonText, restReason === reason && { color: 'white' }]}>{reason}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TextInput style={styles.input} value={restReason} onChangeText={setRestReason} placeholder="أو أدخل سببًا آخر..." />
            </View>
        <TouchableOpacity style={[styles.submitButton, { backgroundColor: settings.primaryColor }]} onPress={handleFinishSubmit}><Text style={styles.submitButtonText}>حفظ وإنهاء</Text></TouchableOpacity></View></View>
      </Modal>
      <Modal visible={showSessionModal} transparent={true} animationType="fade" onRequestClose={() => setShowSessionModal(false)}>
        <View style={styles.modalOverlay}><View style={styles.sessionModalContent}>{selectedSession && exercise.sessionData[selectedSession] && (<><View style={styles.modalHeader}><Text style={styles.modalTitle}>تفاصيل الجلسة {selectedSession}</Text><TouchableOpacity onPress={() => setShowSessionModal(false)}><X size={24} color="#6b7280" /></TouchableOpacity></View><View style={styles.sessionDetailContainer}><View style={styles.sessionDetailRow}><Text style={styles.sessionDetailLabel}>الوزن:</Text><Text style={styles.sessionDetailValue}>{exercise.sessionData[selectedSession].weight} كيلو</Text></View><View style={styles.sessionDetailRow}><Text style={styles.sessionDetailLabel}>العدات:</Text><Text style={styles.sessionDetailValue}>{exercise.sessionData[selectedSession].reps} عدة</Text></View><View style={styles.sessionDetailRow}><Text style={styles.sessionDetailLabel}>الصعوبة:</Text><View style={styles.difficultyDisplay}><Text style={styles.sessionDetailValue}>{DIFFICULTY_LABELS[exercise.sessionData[selectedSession].difficulty]}</Text><Text style={styles.sessionDetailEmoji}>{DIFFICULTY_EMOJIS[exercise.sessionData[selectedSession].difficulty]}</Text></View></View></View></>)}</View></View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginVertical: 8, shadowColor: '#9ca3af', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, borderWidth: 1, borderColor: '#e5e7eb' },
  activeCard: { borderColor: '#3b82f6', shadowColor: '#3b82f6' },
  restOverdueCard: { borderColor: '#ef4444', shadowColor: '#ef4444' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  titleSection: { flex: 1, marginRight: 12 },
  exerciseName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 2 },
  muscleGroup: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { color: 'white', fontSize: 11, fontWeight: '700' },
  mainTimerContainer: { alignItems: 'center', marginVertical: 12, paddingVertical: 10, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  mainTimerLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 4 },
  mainTimer: { fontSize: 48, fontWeight: '900', letterSpacing: 1 },
  wastedTimeText: { fontSize: 12, color: '#ef4444', fontWeight: '600', marginTop: 4 },
  controlsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 16, gap: 12 },
  mainActionButton: { flexDirection: 'row', flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  mainActionButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  finishButton: { flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12, backgroundColor: '#f1f5f9', gap: 6, borderWidth: 1, borderColor: '#e5e7eb' },
  finishButtonText: { color: '#374151', fontSize: 14, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#d1d5db', opacity: 0.8, shadowOpacity: 0 },
  sessionsContainer: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  sessionsTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, color: '#374151' },
  sessionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sessionChip: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e5e7eb' },
  sessionChipText: { fontSize: 14, fontWeight: 'bold', color: '#6b7280' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: '100%', maxWidth: 400 },
  sessionModalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: '100%', maxWidth: 350 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' },
  difficultyContainer: { marginBottom: 20 },
  difficultyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  difficultyButton: { flex: 1, minWidth: '30%', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, alignItems: 'center', gap: 4 },
  difficultyEmoji: { fontSize: 20 },
  difficultyLabel: { fontSize: 10, fontWeight: '600', color: '#6b7280' },
  predefinedReasonsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  reasonButton: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db' },
  reasonButtonText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  submitButton: { padding: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  sessionDetailContainer: { gap: 12 },
  sessionDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sessionDetailLabel: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  sessionDetailValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  difficultyDisplay: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sessionDetailEmoji: { fontSize: 16 },
});