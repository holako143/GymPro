import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import ExerciseCard from '@/components/ExerciseCard';
import { Link } from 'expo-router';
import { Flame, Info } from 'lucide-react-native';

export default function HomeScreen() {
  const { exercises, activePlanId, trainingPlans, sessionStarted, startGlobalSession, stopGlobalSession, sessionSeconds, formatTime } = useFitnessStore();

  const activePlan = useMemo(() => {
    return trainingPlans.find(p => p.id === activePlanId);
  }, [trainingPlans, activePlanId]);

  const activeExercises = useMemo(() => {
    if (!activePlan) return [];
    return exercises.filter(ex => activePlan.exercises.includes(ex.id));
  }, [exercises, activePlan]);

  const allExercisesCompleted = useMemo(() => {
    if (activeExercises.length === 0) return false;
    return activeExercises.every(ex => ex.status === 'completed');
  }, [activeExercises]);

  const handleSessionToggle = () => {
    if (sessionStarted) {
      stopGlobalSession();
    } else {
      startGlobalSession();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activePlan ? (
          <View style={styles.planContainer}>
            <Text style={styles.planTitle}>{activePlan.name}</Text>
            {activeExercises.length > 0 ? (
              activeExercises.map(exercise => (
                <ExerciseCard key={exercise.id} exercise={exercise} isActive={true} />
              ))
            ) : (
              <Text style={styles.noExercisesText}>لا توجد تمارين في هذه الخطة.</Text>
            )}
          </View>
        ) : (
          <View style={styles.noPlanContainer}>
            <Info size={48} color="#6b7280" />
            <Text style={styles.noPlanTitle}>لا توجد خطة تدريب نشطة</Text>
            <Text style={styles.noPlanSubtitle}>
              اذهب إلى قسم "المكتبة" لتفعيل خطة تدريب أو إنشاء واحدة جديدة.
            </Text>
            <Link href="/library" asChild>
              <TouchableOpacity style={styles.libraryButton}>
                <Text style={styles.libraryButtonText}>الانتقال إلى المكتبة</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </ScrollView>

      {activePlan && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sessionButton, sessionStarted ? styles.stopButton : styles.startButton]}
            onPress={handleSessionToggle}
            disabled={allExercisesCompleted}
          >
            <Flame size={20} color="white" />
            <Text style={styles.sessionButtonText}>
              {sessionStarted ? 'إنهاء الجلسة العامة' : 'بدء الجلسة العامة'}
            </Text>
          </TouchableOpacity>
          {sessionStarted && (
            <View style={styles.sessionTimerContainer}>
              <Text style={styles.sessionTimerText}>{formatTime(sessionSeconds)}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  planContainer: {
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  noExercisesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginTop: 20,
  },
  noPlanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: '30%',
  },
  noPlanTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  noPlanSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  libraryButton: {
    marginTop: 24,
    backgroundColor: '#4361ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  libraryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  sessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    gap: 8,
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  sessionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionTimerContainer: {
    marginTop: 12,
  },
  sessionTimerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
});