import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList } from 'react-native';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import { BarChart2, Calendar as CalendarIcon, Activity, Clock } from 'lucide-react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configure Calendar for Arabic
LocaleConfig.locales['ar'] = {
  monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  monthNamesShort: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
  dayNames: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  dayNamesShort: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
  today: 'اليوم'
};
LocaleConfig.defaultLocale = 'ar';

export default function DashboardScreen() {
  const { settings, sessionHistory, formatTime } = useFitnessStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const markedDates = useMemo(() => {
    const markings: { [key: string]: any } = {};
    sessionHistory.forEach(session => {
      const date = session.startTime.split('T')[0];
      if (date) {
        markings[date] = { marked: true, dotColor: settings.primaryColor };
      }
    });
    // Add selected day styling
    if (markings[selectedDate]) {
      markings[selectedDate].selected = true;
    } else {
      markings[selectedDate] = { selected: true, selectedColor: settings.secondaryColor };
    }
    return markings;
  }, [sessionHistory, selectedDate, settings.primaryColor]);

  const sessionsForSelectedDay = useMemo(() => {
    return sessionHistory
      .filter(session => session.startTime.startsWith(selectedDate))
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [sessionHistory, selectedDate]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>لوحة المعلومات</Text>

        {/* Calendar Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={22} color={settings.primaryColor} />
            <Text style={styles.sectionTitle}>التقويم وبيانات الجلسات</Text>
          </View>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: settings.primaryColor,
              selectedDayTextColor: '#ffffff',
              todayTextColor: settings.primaryColor,
              dayTextColor: '#2d4150',
              arrowColor: settings.primaryColor,
              monthTextColor: settings.primaryColor,
              indicatorColor: 'blue',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14
            }}
            style={styles.calendar}
          />
        </View>

        {/* Sessions for selected day */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>جلسات يوم {selectedDate}</Text>
            {sessionsForSelectedDay.length > 0 ? (
                <FlatList
                    data={sessionsForSelectedDay}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({item}) => (
                        <View style={styles.sessionCard}>
                            <Text style={styles.sessionPlanName}>{item.planName}</Text>
                            <View style={styles.sessionTimeRow}>
                                <Clock size={14} color="#6b7280" />
                                <Text style={styles.sessionTime}>
                                    {new Date(item.startTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            <Text style={styles.sessionReason}>{item.reasonForEarlyStop || "اكتملت الجلسة"}</Text>
                        </View>
                    )}
                />
            ) : (
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>لا توجد جلسات مسجلة في هذا اليوم.</Text>
                </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  placeholder: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 100,
  },
  placeholderText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  calendar: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4ade80'
  },
  sessionPlanName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937'
  },
  sessionTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  sessionTime: {
    fontSize: 13,
    color: '#6b7280',
  },
  sessionReason: {
    fontSize: 14,
    color: '#475569',
  }
});