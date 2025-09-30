import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import { Award, BarChart2, Star } from 'lucide-react-native';

export default function ProgressScreen() {
  const { settings } = useFitnessStore();

  // Placeholder data for stats and achievements
  const stats = [
    { label: 'إجمالي التمارين المكتملة', value: '128', icon: <BarChart2 size={24} color={settings.primaryColor} /> },
    { label: 'أفضل رفعة (بنش)', value: '85 كجم', icon: <Award size={24} color={settings.primaryColor} /> },
    { label: 'أيام التمرين المتتالية', value: '14', icon: <Star size={24} color={settings.primaryColor} /> },
  ];

  const achievements = [
    { title: 'المحارب الأول', description: 'أكمل أول تمرين لك', unlocked: true },
    { title: 'سيد الأوزان', description: 'ارفع ما مجموعه 1000 كجم', unlocked: true },
    { title: 'المثابر', description: 'تمرن 5 أيام في أسبوع واحد', unlocked: false },
    { title: 'عاشق الصدر', description: 'أكمل 20 تمرينًا للصدر', unlocked: true },
    { title: 'أسطورة الظهر', description: 'أكمل 20 تمرينًا للظهر', unlocked: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>ملخص التقدم</Text>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إحصائيات رئيسية</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                {stat.icon}
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإنجازات</Text>
          <View style={styles.achievementsList}>
            {achievements.map((ach, index) => (
              <View key={index} style={[styles.achievementCard, !ach.unlocked && styles.achievementLocked]}>
                <View style={[styles.achievementIcon, !ach.unlocked && { backgroundColor: '#d1d5db' }]}>
                  <Award size={24} color={ach.unlocked ? 'white' : '#6b7280'} />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[styles.achievementTitle, !ach.unlocked && { color: '#6b7280' }]}>{ach.title}</Text>
                  <Text style={styles.achievementDescription}>{ach.description}</Text>
                </View>
              </View>
            ))}
          </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementLocked: {
    backgroundColor: '#f3f4f6',
  },
  achievementIcon: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 8,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
});