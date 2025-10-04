import { Achievement } from '@/types/fitness';

export type AchievementId =
  // Consistency Achievements
  | 'FIRST_WORKOUT'
  | 'CONSISTENCY_BRONZE' // 3 workouts in a week
  | 'CONSISTENCY_SILVER' // 5 workouts in a week
  | 'CONSISTENCY_GOLD' // 7 workouts in a week
  | 'PERFECT_MONTH' // Workout every planned day in a month
  // Milestone Achievements
  | 'VOLUME_MILESTONE_1' // 1,000 kg total volume
  | 'VOLUME_MILESTONE_2' // 10,000 kg total volume
  | 'VOLUME_MILESTONE_3' // 100,000 kg total volume
  | 'SESSION_MILESTONE_1' // 10 sessions completed
  | 'SESSION_MILESTONE_2' // 50 sessions completed
  | 'SESSION_MILESTONE_3' // 100 sessions completed
  // Challenge Achievements
  | 'CHALLENGE_EARLY_BIRD' // Complete a workout before 7 AM
  | 'CHALLENGE_NIGHT_OWL' // Complete a workout after 10 PM
  | 'CHALLENGE_PLAN_MASTER'; // Create your first training plan

export const ACHIEVEMENTS_DATABASE: Record<AchievementId, Omit<Achievement, 'unlocked' | 'dateUnlocked'>> = {
  // === Consistency Achievements ===
  FIRST_WORKOUT: {
    id: 'FIRST_WORKOUT',
    title: 'البداية القوية',
    description: 'أكملت أول تمرين لك. مرحباً بك في رحلة اللياقة!',
  },
  CONSISTENCY_BRONZE: {
    id: 'CONSISTENCY_BRONZE',
    title: 'ملتزم برونزي',
    description: 'أكملت 3 تمارين في أسبوع واحد. استمر في هذا التقدم!',
  },
  CONSISTENCY_SILVER: {
    id: 'CONSISTENCY_SILVER',
    title: 'ملتزم فضي',
    description: 'أكملت 5 تمارين في أسبوع واحد. أنت تكتسب الزخم!',
  },
  CONSISTENCY_GOLD: {
    id: 'CONSISTENCY_GOLD',
    title: 'ملتزم ذهبي',
    description: 'أكملت 7 تمارين في أسبوع واحد. التزامك لا يصدق!',
  },
  PERFECT_MONTH: {
    id: 'PERFECT_MONTH',
    title: 'الشهر المثالي',
    description: 'تمرنت في كل يوم مخطط له خلال شهر كامل.',
  },
  // === Milestone Achievements ===
  VOLUME_MILESTONE_1: {
    id: 'VOLUME_MILESTONE_1',
    title: 'رافع أثقال ناشئ',
    description: 'وصل إجمالي حجم تمرينك إلى 1,000 كجم. بداية رائعة!',
  },
  VOLUME_MILESTONE_2: {
    id: 'VOLUME_MILESTONE_2',
    title: 'وحش الأوزان',
    description: 'وصل إجمالي حجم تمرينك إلى 10,000 كجم. قوة حقيقية!',
  },
  VOLUME_MILESTONE_3: {
    id: 'VOLUME_MILESTONE_3',
    title: 'أسطورة الجيم',
    description: 'وصل إجمالي حجم تمرينك إلى 100,000 كجم. أنت في مستوى آخر!',
  },
  SESSION_MILESTONE_1: {
    id: 'SESSION_MILESTONE_1',
    title: 'عشرة كاملة',
    description: 'أكملت 10 جلسات تدريبية. لقد اعتدت على الأمر!',
  },
  SESSION_MILESTONE_2: {
    id: 'SESSION_MILESTONE_2',
    title: 'خمسون جلسة',
    description: 'أكملت 50 جلسة تدريبية. أنت الآن رياضي متمرس!',
  },
  SESSION_MILESTONE_3: {
    id: 'SESSION_MILESTONE_3',
    title: 'نادي المئة',
    description: 'أكملت 100 جلسة تدريبية. إنجاز مذهل!',
  },
  // === Challenge Achievements ===
  CHALLENGE_EARLY_BIRD: {
    id: 'CHALLENGE_EARLY_BIRD',
    title: 'الطائر المبكر',
    description: 'أكملت تمريناً قبل الساعة 7 صباحاً. بداية يوم موفقة!',
  },
  CHALLENGE_NIGHT_OWL: {
    id: 'CHALLENGE_NIGHT_OWL',
    title: 'بومة الليل',
    description: 'أكملت تمريناً بعد الساعة 10 مساءً. لا أعذار!',
  },
  CHALLENGE_PLAN_MASTER: {
    id: 'CHALLENGE_PLAN_MASTER',
    title: 'مخطط استراتيجي',
    description: 'أنشأت أول خطة تدريب خاصة بك. تحكم في مصيرك!',
  },
};

export const ACHIEVEMENT_LIST = Object.values(ACHIEVEMENTS_DATABASE);