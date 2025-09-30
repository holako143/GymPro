import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  TextInput,
  Alert,
  ToastAndroid,
  Platform,
  Animated,
  Easing,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import ExerciseCard from '@/components/ExerciseCard';
import { Play, Pause, X } from 'lucide-react-native';

export default function CurrentExerciseScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const {
    exercises,
    activePlanId,
    trainingPlans,
    currentExercise,
    sessionStarted,
    sessionSeconds,
    formatTime,
    startGlobalSession,
    stopGlobalSession,
    settings,
    updateState
  } = useFitnessStore();

  const [showStopModal, setShowStopModal] = useState<boolean>(false);
  const [stopReason, setStopReason] = useState<string>('');

  const scrollViewRef = useRef<ScrollView>(null);
  const cardSlideAnim = useRef(new Animated.Value(0)).current;
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Set<number>>(new Set());

  // Get exercises to display
  const exercisesToRender = activePlanId !== null ?
    exercises.filter(exercise => {
      const activePlan = trainingPlans.find(p => p.id === activePlanId);
      return activePlan ? activePlan.exercises.includes(exercise.id) : false;
    }) : exercises;

  // Calculate progress
  const completedExercisesCount = exercisesToRender.filter(e => e.status === 'completed').length;
  const totalExercisesCount = exercisesToRender.length;
  const progressPercent = totalExercisesCount > 0 ?
    (completedExercisesCount / totalExercisesCount) * 100 : 0;

  // Calculate total sessions
  const totalSessions = exercisesToRender.reduce((sum, e) => sum + e.sessions, 0);
  const completedSessions = exercisesToRender.reduce((sum, e) => sum + e.completedSessions, 0);

  // Calculate total times
  const totalExerciseTime = exercisesToRender.reduce((sum, e) => sum + e.totalExerciseSecondsAccumulated, 0);

  const handleSessionToggle = () => {
    if (sessionStarted) {
      // Check if all exercises are completed
      const allCompleted = exercisesToRender.every(e => e.status === 'completed');
      if (allCompleted) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('تم إنهاء جميع التمارين بنجاح! 🎉', ToastAndroid.LONG);
        } else {
          Alert.alert('تهانينا!', 'تم إنهاء جميع التمارين بنجاح! 🎉');
        }
        stopGlobalSession('إكمال جميع التمارين');
      } else {
        setShowStopModal(true);
      }
    } else {
      startGlobalSession();
    }
  };

  // Auto-scroll only when exercise is completed and moving to next
  const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(false);

  useEffect(() => {
    if (shouldAutoScroll && currentExercise && scrollViewRef.current) {
      const currentIndex = exercisesToRender.findIndex(e => e.id === currentExercise);
      if (currentIndex !== -1) {
        setTimeout(() => {
          console.log('[AutoScroll] Scrolling to index', currentIndex, 'x:', currentIndex * width);
          scrollViewRef.current?.scrollTo({
            x: currentIndex * width,
            animated: true
          });
          setShouldAutoScroll(false);
        }, 200);
      }
    }
  }, [shouldAutoScroll, currentExercise, exercisesToRender, width]);

  // Handle exercise completion animation
  useEffect(() => {
    const completedExercises = exercisesToRender.filter(e => e.status === 'completed');
    const newCompletedIds = new Set(completedExercises.map(e => e.id));
    const newlyCompleted = completedExercises.find(e => !completedExerciseIds.has(e.id));
    if (newlyCompleted) {
      Animated.timing(cardSlideAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }).start(() => {
        cardSlideAnim.setValue(0);
        setCompletedExerciseIds(newCompletedIds);
        setShouldAutoScroll(true);
      });
    }
  }, [exercisesToRender, completedExerciseIds, cardSlideAnim]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!shouldAutoScroll) {
      const scrollX = event.nativeEvent.contentOffset.x;
      const cardWidth = width;
      const currentIndex = Math.round(scrollX / cardWidth);
      if (currentIndex >= 0 && currentIndex < exercisesToRender.length) {
        const newCurrentExercise = exercisesToRender[currentIndex].id;
        if (newCurrentExercise !== currentExercise) {
          console.log('[ManualScroll] New index', currentIndex, 'exerciseId', newCurrentExercise);
          updateState({ currentExercise: newCurrentExercise });
        }
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="current-screen">
      {/* Improved Session Control Card */}
      <View style={styles.compactSessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>نظرة عامة على الجلسة</Text>
          <TouchableOpacity
            style={[styles.compactButton, { backgroundColor: sessionStarted ? '#ef4444' : settings.primaryColor }]}
            onPress={handleSessionToggle}
            testID="toggle-session"
          >
            {sessionStarted ? <Pause size={14} color="white" /> : <Play size={14} color="white" />}
            <Text style={styles.compactButtonText}>{sessionStarted ? 'إنهاء' : 'بدء'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainStatsContainer}>
          <Text style={styles.mainTimerLabel}>الوقت الإجمالي</Text>
          <Text style={[styles.mainTimer, { color: settings.primaryColor }]}>{formatTime(sessionSeconds)}</Text>
        </View>

        <View style={styles.secondaryStatsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedExercisesCount}/{totalExercisesCount}</Text>
            <Text style={styles.statLabel}>التمارين</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{completedSessions}/{totalSessions}</Text>
            <Text style={styles.statLabel}>الجلسات</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTime(totalExerciseTime)}</Text>
            <Text style={styles.statLabel}>وقت التمرين</Text>
          </View>
        </View>

        <View style={styles.compactProgressBar}>
          <View style={[styles.compactProgressFill, { width: `${progressPercent}%`, backgroundColor: settings.primaryColor }]} />
        </View>
      </View>

      {/* Exercise Cards with Horizontal Scroll */}
      {exercisesToRender.length > 0 ? (
        <View style={styles.cardsSection}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScrollView}
            contentContainerStyle={styles.horizontalCardsContainer}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            testID="cards-scroll"
          >
            {exercisesToRender.map((exercise) => {
              const isCompleted = completedExerciseIds.has(exercise.id);
              return (
                <Animated.View
                  key={exercise.id}
                  style={[
                    styles.cardWrapper,
                    { width: width },
                    isCompleted && {
                      transform: [{
                        translateX: cardSlideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, width],
                        })
                      }],
                      opacity: cardSlideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 0],
                      })
                    }
                  ]}
                  testID={`card-${exercise.id}`}
                >
                  <ExerciseCard
                    exercise={exercise}
                    isActive={exercise.id === currentExercise}
                  />
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            لا توجد تمارين لعرضها في الخطة الحالية
          </Text>
        </View>
      )}

      {/* Stop Session Modal */}
      <Modal
        visible={showStopModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStopModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إيقاف الجلسة</Text>
              <TouchableOpacity onPress={() => setShowStopModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              يرجى إدخال سبب إيقاف الجلسة قبل الانتهاء من جميع التمارين:
            </Text>

            <TextInput
              style={styles.reasonInput}
              value={stopReason}
              onChangeText={setStopReason}
              placeholder="مثال: إصابة، نقص في الوقت، تعب شديد..."
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowStopModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleSessionToggle}
              >
                <Text style={styles.confirmButtonText}>إيقاف الجلسة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  cardsSection: {
    flex: 1,
  },
  horizontalScrollView: {
    flex: 1,
  },
  horizontalCardsContainer: {
    alignItems: 'stretch',
  },
  cardWrapper: {
    paddingHorizontal: 16,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  compactSessionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  compactButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mainStatsContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  mainTimerLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  mainTimer: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },
  statBox: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  compactProgressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 3,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
    lineHeight: 20,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9fafb',
    textAlignVertical: 'top',
    marginBottom: 20,
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  confirmButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
