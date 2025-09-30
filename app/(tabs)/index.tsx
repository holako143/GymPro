import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
    sessionHistory,
    formatTime,
    startGlobalSession,
    stopGlobalSession,
    settings,
    updateState
  } = useFitnessStore();

  const [showStopModal, setShowStopModal] = useState<boolean>(false);
  const [stopReason, setStopReason] = useState<string>('');

  const flatListRef = useRef<FlatList<Exercise>>(null);

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
  const totalRestTime = exercisesToRender.reduce((sum, e) => sum + e.totalRestSecondsAccumulated, 0);
  const totalWastedTime = exercisesToRender.reduce((sum, e) => sum + e.wastedTimeSeconds, 0);

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

  // Effect to scroll to the active exercise card
  useEffect(() => {
    if (currentExercise && flatListRef.current) {
      const index = exercisesToRender.findIndex(e => e.id === currentExercise);
      if (index > -1) {
        // A short timeout can help ensure the list has rendered before scrolling.
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            animated: true,
            index: index,
            viewPosition: 0.5, // Center the item
          });
        }, 100);
      }
    }
  }, [currentExercise, exercisesToRender.length]); // Rerun when the exercise or list changes

  // Handler for when the user manually scrolls and changes the visible card
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      // Update the current exercise only if it's different, to avoid loops
      if (visibleItem.isViewable && visibleItem.item.id !== currentExercise) {
        updateState({ currentExercise: visibleItem.item.id });
      }
    }
  }).current;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} testID="current-screen">
      {/* Compact Session Control Card */}
      <View style={styles.compactSessionCard}>
        <View style={styles.compactContent}>
          <TouchableOpacity
            style={[
              styles.compactButton,
              { backgroundColor: sessionStarted ? '#ef4444' : settings.primaryColor }
            ]}
            onPress={handleSessionToggle}
            testID="toggle-session"
          >
            {sessionStarted ? (
              <Pause size={14} color="white" />
            ) : (
              <Play size={14} color="white" />
            )}
            <Text style={styles.compactButtonText}>
              {sessionStarted ? 'إنهاء الجلسة' : 'بدء الجلسة'}
            </Text>
          </TouchableOpacity>

          <View style={styles.compactStats}>
            <Text style={[styles.compactTime, { color: settings.primaryColor }]}>
              {formatTime(sessionSeconds)}
            </Text>
            <View style={styles.compactStatsRow}>
              <Text style={styles.compactProgress}>
                {Math.round(progressPercent)}% • {completedExercisesCount}/{totalExercisesCount} تمرين
              </Text>
              <Text style={styles.compactSessions}>
                {completedSessions}/{totalSessions} جلسة
              </Text>
            </View>
            <View style={styles.compactTimesRow}>
              <Text style={styles.compactTimeItem}>
                تمرين: {formatTime(totalExerciseTime)}
              </Text>
              <Text style={styles.compactTimeItem}>
                راحة: {formatTime(totalRestTime)}
              </Text>
              {totalWastedTime > 0 && (
                <Text style={[styles.compactTimeItem, { color: '#ef4444' }]}>
                  ضائع: {formatTime(totalWastedTime)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Compact Progress Bar */}
        <View style={styles.compactProgressBar}>
          <View 
            style={[
              styles.compactProgressFill, 
              { 
                width: `${progressPercent}%`,
                backgroundColor: settings.primaryColor 
              }
            ]} 
          />
        </View>
      </View>

      {/* Exercise Cards with Horizontal Scroll */}
      {exercisesToRender.length > 0 ? (
        <View style={styles.cardsSection}>
          <FlatList
            ref={flatListRef}
            data={exercisesToRender}
            renderItem={({ item: exercise }) => (
              <View style={[styles.cardWrapper, { width: width }]}>
                <ExerciseCard
                  exercise={exercise}
                  isActive={exercise.id === currentExercise}
                />
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50, // Trigger when 50% of the item is visible
            }}
            testID="cards-flatlist"
          />
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
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  compactButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  compactStats: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    marginLeft: 12,
  },
  compactTime: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  compactProgress: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  compactProgressBar: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  compactStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  compactSessions: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compactTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  compactTimeItem: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: '600',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 4,
    paddingVertical: 1,
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
