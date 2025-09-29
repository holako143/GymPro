import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { ChevronLeft, ChevronRight, TrendingUp, BarChart3, Calendar, Target, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import { DIFFICULTY_EMOJIS, DIFFICULTY_LABELS } from '@/types/fitness';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { 
    exercises, 
    formatTime, 
    settings,
    plannedWorkouts 
  } = useFitnessStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'comparison'>('overview');
  const [comparisonPeriod, setComparisonPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [showDayDetails, setShowDayDetails] = useState<boolean>(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState<any[]>([]);

  // Calculate analytics
  const completedExercises = exercises.filter(e => e.status === 'completed').length;
  const totalExercises = exercises.length;
  const progressPercent = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Calculate time analytics
  let totalSessionExerciseDuration = 0;
  let totalSessionRestDuration = 0;
  let max1RM = 0;
  let maxWeight = 0;
  let totalWeight = 0;
  let weightCount = 0;

  exercises.forEach(exercise => {
    Object.values(exercise.sessionData).forEach(session => {
      totalSessionExerciseDuration += session.sessionExerciseDuration || 0;
      totalSessionRestDuration += session.sessionRestDuration || 0;
      if (session.oneRM > max1RM) max1RM = session.oneRM;
      if (session.weight > maxWeight) maxWeight = session.weight;
      totalWeight += session.weight;
      weightCount++;
    });
  });

  const avgWeight = weightCount > 0 ? Math.round(totalWeight / weightCount) : 0;

  // Calculate difficulty stats
  const difficultyStats = {
    'very-easy': 0,
    'easy': 0,
    'medium': 0,
    'hard': 0,
    'very-hard': 0
  };

  exercises.forEach(exercise => {
    Object.values(exercise.sessionData).forEach(session => {
      if (session.difficulty) {
        difficultyStats[session.difficulty]++;
      }
    });
  });

  // Calculate muscle stats
  const muscleStats: Record<string, number> = {};
  exercises.forEach(exercise => {
    if (!muscleStats[exercise.muscle]) {
      muscleStats[exercise.muscle] = 0;
    }
    muscleStats[exercise.muscle] += exercise.completedSessions;
  });

  let strongestMuscle = '-';
  let weakestMuscle = '-';
  let maxSessions = 0;
  let minSessions = Infinity;

  Object.entries(muscleStats).forEach(([muscle, sessions]) => {
    if (sessions > maxSessions) {
      maxSessions = sessions;
      strongestMuscle = muscle;
    }
    if (sessions < minSessions && sessions > 0) {
      minSessions = sessions;
      weakestMuscle = muscle;
    }
  });

  if (minSessions === Infinity) weakestMuscle = '-';

  // Calendar functions
  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const dayNames = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Empty days at the beginning
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const hasWorkoutOnDay = (day: number | null): { hasCompleted: boolean; hasPlanned: boolean } | false => {
    if (!day || typeof day !== 'number' || day < 1 || day > 31) return false;
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    
    // Check completed workouts
    const hasCompleted = exercises.some(exercise =>
      Object.values(exercise.sessionData).some(session => {
        const sessionDate = new Date(session.date).toISOString().split('T')[0];
        return sessionDate === dateStr;
      })
    );

    // Check planned workouts
    const hasPlanned = plannedWorkouts.some(pw => pw.date === dateStr);

    return { hasCompleted, hasPlanned };
  };

  const getDayWorkoutDetails = (day: number | null) => {
    if (!day || typeof day !== 'number' || day < 1 || day > 31) return [];
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    
    const details: any[] = [];
    
    exercises.forEach(exercise => {
      Object.entries(exercise.sessionData).forEach(([sessionNum, sessionData]) => {
        const sessionDate = new Date(sessionData.date).toISOString().split('T')[0];
        if (sessionDate === dateStr) {
          details.push({
            exerciseName: exercise.name,
            sessionNum: parseInt(sessionNum),
            ...sessionData
          });
        }
      });
    });
    
    return details;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDayPress = (day: number | null) => {
    if (day) {
      const details = getDayWorkoutDetails(day);
      if (details.length > 0) {
        setSelectedDayDetails(details);
        setShowDayDetails(true);
      }
    }
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <View style={styles.calendar}>
        {/* Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <ChevronRight size={24} color={settings.primaryColor} />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <ChevronLeft size={24} color={settings.primaryColor} />
          </TouchableOpacity>
        </View>

        {/* Day names */}
        <View style={styles.calendarRow}>
          {dayNames.map(day => (
            <View key={day} style={styles.dayName}>
              <Text style={styles.dayNameText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar days */}
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.calendarRow}>
            {week.map((day, dayIndex) => {
              const workoutStatus = hasWorkoutOnDay(day);
              const hasCompleted = workoutStatus && typeof workoutStatus === 'object' ? workoutStatus.hasCompleted : false;
              const hasPlanned = workoutStatus && typeof workoutStatus === 'object' ? workoutStatus.hasPlanned : false;
              
              return (
                <TouchableOpacity
                  key={`day-${weekIndex}-${dayIndex}`}
                  style={[
                    styles.calendarDay,
                    day === null && styles.emptyDay,
                    isToday(day) && styles.todayDay,
                    hasCompleted && styles.completedDay,
                    hasPlanned && styles.plannedDay,
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={!hasCompleted}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      day === null && styles.emptyDayText,
                      isToday(day) && styles.todayDayText,
                      hasCompleted && styles.completedDayText,
                    ]}
                  >
                    {day || ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>التحليلات والإحصائيات</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} color={activeTab === 'overview' ? 'white' : settings.primaryColor} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>نظرة عامة</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'charts' && styles.activeTab]}
          onPress={() => setActiveTab('charts')}
        >
          <TrendingUp size={16} color={activeTab === 'charts' ? 'white' : settings.primaryColor} />
          <Text style={[styles.tabText, activeTab === 'charts' && styles.activeTabText]}>الرسوم البيانية</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'comparison' && styles.activeTab]}
          onPress={() => setActiveTab('comparison')}
        >
          <Target size={16} color={activeTab === 'comparison' ? 'white' : settings.primaryColor} />
          <Text style={[styles.tabText, activeTab === 'comparison' && styles.activeTabText]}>مقارنة العضلات</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <>
            {/* Session Progress */}
            <View style={styles.analyticsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            تقدم الجلسة
          </Text>
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
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: settings.primaryColor }]}>
                {completedExercises}
              </Text>
              <Text style={styles.statLabel}>تمارين مكتملة</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: settings.primaryColor }]}>
                {totalExercises}
              </Text>
              <Text style={styles.statLabel}>إجمالي التمارين</Text>
            </View>
          </View>
        </View>

        {/* Time Analysis */}
        <View style={styles.analyticsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            تحليل الوقت
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: settings.primaryColor }]}>
                {formatTime(totalSessionExerciseDuration)}
              </Text>
              <Text style={styles.statLabel}>وقت التمرين الفعلي الكلي</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                {formatTime(totalSessionRestDuration)}
              </Text>
              <Text style={styles.statLabel}>وقت الراحة الكلي</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>
                {formatTime(exercises.reduce((sum, e) => sum + Object.values(e.sessionData).reduce((s, session) => s + (session.wastedTime || 0), 0), 0))}
              </Text>
              <Text style={styles.statLabel}>وقت ضائع كلي</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>
                {formatTime(totalSessionExerciseDuration + totalSessionRestDuration)}
              </Text>
              <Text style={styles.statLabel}>إجمالي وقت الجلسة</Text>
            </View>
          </View>
          
          {/* Session Start/End Times */}
          {exercises.some(e => Object.keys(e.sessionData).length > 0) && (
            <View style={styles.sessionTimesContainer}>
              <Text style={styles.sessionTimesTitle}>أوقات الجلسات:</Text>
              {exercises.map(exercise => 
                Object.entries(exercise.sessionData).map(([sessionNum, sessionData]) => {
                  const startTime = new Date(sessionData.startTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
                  const endTime = new Date(sessionData.endTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <View key={`${exercise.id}-${sessionNum}`} style={styles.sessionTimeItem}>
                      <Text style={styles.sessionTimeExercise}>{exercise.name} - جلسة {sessionNum}</Text>
                      <View style={styles.sessionTimeDetails}>
                        <Text style={styles.sessionTimeText}>بدء: {startTime}</Text>
                        <Text style={styles.sessionTimeText}>انتهاء: {endTime}</Text>
                        <Text style={styles.sessionTimeText}>المدة: {formatTime(sessionData.sessionExerciseDuration)}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}
        </View>

        {/* Weight and Reps Analysis */}
        <View style={styles.analyticsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            تحليل الأوزان والعدات
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: settings.primaryColor }]}>
                {maxWeight}
              </Text>
              <Text style={styles.statLabel}>أقصى وزن (كجم)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: settings.primaryColor }]}>
                {avgWeight}
              </Text>
              <Text style={styles.statLabel}>متوسط الوزن (كجم)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: settings.primaryColor }]}>
                {exercises.reduce((sum, e) => sum + Object.values(e.sessionData).reduce((s, session) => s + (session.reps || 0), 0), 0)}
              </Text>
              <Text style={styles.statLabel}>إجمالي العدات</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: settings.primaryColor }]}>
                {max1RM}
              </Text>
              <Text style={styles.statLabel}>أقصى 1RM (كجم)</Text>
            </View>
          </View>
        </View>

        {/* Difficulty Analysis */}
        <View style={styles.analyticsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            تحليل الصعوبة
          </Text>
          <View style={styles.difficultyStats}>
            {Object.entries(difficultyStats).map(([difficulty, count]) => (
              <View key={difficulty} style={styles.difficultyItem}>
                <Text style={styles.difficultyEmoji}>
                  {DIFFICULTY_EMOJIS[difficulty as keyof typeof DIFFICULTY_EMOJIS]}
                </Text>
                <Text style={styles.difficultyCount}>{count}</Text>
                <Text style={styles.difficultyLabel}>
                  {DIFFICULTY_LABELS[difficulty as keyof typeof DIFFICULTY_LABELS]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Muscle Analysis */}
        <View style={styles.analyticsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            تحليل العضلات
          </Text>
          <View style={styles.muscleStats}>
            <View style={styles.muscleItem}>
              <Text style={styles.muscleLabel}>أقوى عضلة</Text>
              <Text style={[styles.muscleValue, styles.strongMuscle]}>
                {strongestMuscle}
              </Text>
            </View>
            <View style={styles.muscleItem}>
              <Text style={styles.muscleLabel}>أضعف عضلة</Text>
              <Text style={[styles.muscleValue, styles.weakMuscle]}>
                {weakestMuscle}
              </Text>
            </View>
          </View>
        </View>

            {/* Calendar */}
            <View style={styles.analyticsCard}>
              <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
                تقويم التمارين
              </Text>
              {renderCalendar()}
            </View>
          </>
        )}

        {activeTab === 'charts' && (
          <>
            {/* Interactive Charts */}
            <View style={styles.analyticsCard}>
              <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
                رسوم بيانية تفاعلية لتقدم الأوزان، العدات، والوقت
              </Text>
          
          {/* Weight Progress Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>تقدم الأوزان</Text>
            <View style={styles.simpleChart}>
              {exercises.slice(0, 4).map((exercise, index) => {
                const maxWeight = Math.max(...Object.values(exercise.sessionData).map(s => s.weight || 0));
                const avgWeight = Object.values(exercise.sessionData).length > 0 ? 
                  Object.values(exercise.sessionData).reduce((sum, s) => sum + (s.weight || 0), 0) / Object.values(exercise.sessionData).length : 0;
                const barHeight = maxWeight > 0 ? (avgWeight / maxWeight) * 100 : 0;
                
                return (
                  <View key={exercise.id} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar, 
                          { 
                            height: `${Math.max(barHeight, 5)}%`,
                            backgroundColor: settings.primaryColor 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barLabel}>{exercise.name.split(' ')[0]}</Text>
                    <Text style={styles.barValue}>{Math.round(avgWeight)}كج</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Reps Progress Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>تقدم العدات</Text>
            <View style={styles.simpleChart}>
              {exercises.slice(0, 4).map((exercise, index) => {
                const maxReps = Math.max(...Object.values(exercise.sessionData).map(s => s.reps || 0));
                const avgReps = Object.values(exercise.sessionData).length > 0 ? 
                  Object.values(exercise.sessionData).reduce((sum, s) => sum + (s.reps || 0), 0) / Object.values(exercise.sessionData).length : 0;
                const barHeight = maxReps > 0 ? (avgReps / maxReps) * 100 : 0;
                
                return (
                  <View key={exercise.id} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar, 
                          { 
                            height: `${Math.max(barHeight, 5)}%`,
                            backgroundColor: '#10b981' 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barLabel}>{exercise.name.split(' ')[0]}</Text>
                    <Text style={styles.barValue}>{Math.round(avgReps)}×</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Time Progress Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>تقدم الوقت (دقيقة)</Text>
            <View style={styles.simpleChart}>
              {exercises.slice(0, 4).map((exercise, index) => {
                const totalTime = Object.values(exercise.sessionData).reduce((sum, s) => sum + (s.sessionExerciseDuration || 0), 0);
                const avgTime = Object.values(exercise.sessionData).length > 0 ? totalTime / Object.values(exercise.sessionData).length : 0;
                const maxTime = Math.max(...exercises.map(e => {
                  const total = Object.values(e.sessionData).reduce((sum, s) => sum + (s.sessionExerciseDuration || 0), 0);
                  return Object.values(e.sessionData).length > 0 ? total / Object.values(e.sessionData).length : 0;
                }));
                const barHeight = maxTime > 0 ? (avgTime / maxTime) * 100 : 0;
                
                return (
                  <View key={exercise.id} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar, 
                          { 
                            height: `${Math.max(barHeight, 5)}%`,
                            backgroundColor: '#f59e0b' 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barLabel}>{exercise.name.split(' ')[0]}</Text>
                    <Text style={styles.barValue}>{Math.round(avgTime / 60)}د</Text>
                  </View>
                );
              })}
            </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'comparison' && (
          <>
            {/* Period Selection */}
            <View style={styles.analyticsCard}>
              <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
                مقارنة التمارين بين العضلات
              </Text>
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[styles.periodButton, comparisonPeriod === 'day' && styles.activePeriodButton]}
                  onPress={() => setComparisonPeriod('day')}
                >
                  <Text style={[styles.periodButtonText, comparisonPeriod === 'day' && styles.activePeriodButtonText]}>يومي</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodButton, comparisonPeriod === 'week' && styles.activePeriodButton]}
                  onPress={() => setComparisonPeriod('week')}
                >
                  <Text style={[styles.periodButtonText, comparisonPeriod === 'week' && styles.activePeriodButtonText]}>أسبوعي</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodButton, comparisonPeriod === 'month' && styles.activePeriodButton]}
                  onPress={() => setComparisonPeriod('month')}
                >
                  <Text style={[styles.periodButtonText, comparisonPeriod === 'month' && styles.activePeriodButtonText]}>شهري</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Muscle Comparison Charts */}
            {Object.entries(muscleStats).map(([muscle, sessions]) => {
              const muscleExercises = exercises.filter(e => e.muscle === muscle);
              const totalSessions = muscleExercises.reduce((sum, e) => sum + e.completedSessions, 0);
              const avgWeight = muscleExercises.length > 0 ? 
                muscleExercises.reduce((sum, e) => {
                  const weights = Object.values(e.sessionData).map(s => s.weight || 0);
                  return sum + (weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0);
                }, 0) / muscleExercises.length : 0;
              
              return (
                <View key={muscle} style={styles.analyticsCard}>
                  <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
                    {muscle} - {comparisonPeriod === 'day' ? 'اليوم' : comparisonPeriod === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'}
                  </Text>
                  
                  <View style={styles.muscleStatsGrid}>
                    <View style={styles.muscleStatCard}>
                      <Text style={[styles.muscleStatValue, { color: settings.primaryColor }]}>{totalSessions}</Text>
                      <Text style={styles.muscleStatLabel}>جلسات مكتملة</Text>
                    </View>
                    <View style={styles.muscleStatCard}>
                      <Text style={[styles.muscleStatValue, { color: '#10b981' }]}>{Math.round(avgWeight)}</Text>
                      <Text style={styles.muscleStatLabel}>متوسط الوزن (كج)</Text>
                    </View>
                    <View style={styles.muscleStatCard}>
                      <Text style={[styles.muscleStatValue, { color: '#f59e0b' }]}>{muscleExercises.length}</Text>
                      <Text style={styles.muscleStatLabel}>عدد التمارين</Text>
                    </View>
                  </View>

                  {/* Exercise breakdown for this muscle */}
                  <View style={styles.exerciseBreakdown}>
                    <Text style={styles.breakdownTitle}>تفصيل التمارين:</Text>
                    {muscleExercises.map(exercise => {
                      const exerciseAvgWeight = Object.values(exercise.sessionData).length > 0 ?
                        Object.values(exercise.sessionData).reduce((sum, s) => sum + (s.weight || 0), 0) / Object.values(exercise.sessionData).length : 0;
                      const exerciseAvgReps = Object.values(exercise.sessionData).length > 0 ?
                        Object.values(exercise.sessionData).reduce((sum, s) => sum + (s.reps || 0), 0) / Object.values(exercise.sessionData).length : 0;
                      
                      return (
                        <View key={exercise.id} style={styles.exerciseBreakdownItem}>
                          <Text style={styles.exerciseBreakdownName}>{exercise.name}</Text>
                          <View style={styles.exerciseBreakdownStats}>
                            <Text style={styles.exerciseBreakdownStat}>{exercise.completedSessions} جلسة</Text>
                            <Text style={styles.exerciseBreakdownStat}>{Math.round(exerciseAvgWeight)} كج</Text>
                            <Text style={styles.exerciseBreakdownStat}>{Math.round(exerciseAvgReps)} عدة</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Day Details Modal */}
      <Modal
        visible={showDayDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDayDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dayDetailsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تفاصيل اليوم</Text>
              <TouchableOpacity onPress={() => setShowDayDetails(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.dayDetailsScroll}>
              {selectedDayDetails.map((detail, index) => (
                <View key={index} style={styles.dayDetailItem}>
                  <Text style={styles.dayDetailExercise}>{detail.exerciseName} - جلسة {detail.sessionNum}</Text>
                  <View style={styles.dayDetailStats}>
                    <Text style={styles.dayDetailStat}>الوزن: {detail.weight} كج</Text>
                    <Text style={styles.dayDetailStat}>العدات: {detail.reps}</Text>
                    <Text style={styles.dayDetailStat}>الصعوبة: {DIFFICULTY_LABELS[detail.difficulty as keyof typeof DIFFICULTY_LABELS]} {DIFFICULTY_EMOJIS[detail.difficulty as keyof typeof DIFFICULTY_EMOJIS]}</Text>
                    <Text style={styles.dayDetailStat}>وقت التمرين: {formatTime(detail.sessionExerciseDuration)}</Text>
                    <Text style={styles.dayDetailStat}>وقت الراحة: {formatTime(detail.sessionRestDuration)}</Text>
                    {detail.wastedTime > 0 && (
                      <Text style={[styles.dayDetailStat, { color: '#ef4444' }]}>وقت ضائع: {formatTime(detail.wastedTime)}</Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  analyticsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    minWidth: '45%',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
    textAlign: 'center',
  },
  difficultyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  difficultyItem: {
    alignItems: 'center',
    width: '18%',
    marginBottom: 10,
  },
  difficultyEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  difficultyCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  difficultyLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
  },
  muscleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  muscleItem: {
    alignItems: 'center',
  },
  muscleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
  },
  muscleValue: {
    fontSize: 16,
    marginTop: 5,
    fontWeight: 'bold',
  },
  strongMuscle: {
    color: '#4cc9f0',
  },
  weakMuscle: {
    color: '#e63946',
  },
  calendar: {
    marginTop: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dayName: {
    width: '14%',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212529',
  },
  calendarDay: {
    width: '14%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  emptyDay: {
    backgroundColor: '#f1f3f5',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#4361ee',
  },
  completedDay: {
    backgroundColor: '#4cc9f0',
  },
  plannedDay: {
    backgroundColor: '#89cff0',
  },
  calendarDayText: {
    fontSize: 12,
    color: '#212529',
  },
  emptyDayText: {
    color: '#6c757d',
  },
  todayDayText: {
    fontWeight: 'bold',
  },
  completedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chartsPlaceholder: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 10,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  simpleChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  barContainer: {
    height: 80,
    width: 20,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  barValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '700',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  activePeriodButtonText: {
    color: 'white',
  },
  muscleStatsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  muscleStatCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  muscleStatValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  muscleStatLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  exerciseBreakdown: {
    marginTop: 10,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  exerciseBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  exerciseBreakdownName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  exerciseBreakdownStats: {
    flexDirection: 'row',
    gap: 12,
  },
  exerciseBreakdownStat: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sessionTimesContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  sessionTimesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  sessionTimeItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sessionTimeExercise: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  sessionTimeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTimeText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dayDetailsModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
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
  dayDetailsScroll: {
    maxHeight: 400,
  },
  dayDetailItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dayDetailExercise: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  dayDetailStats: {
    gap: 4,
  },
  dayDetailStat: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
});
