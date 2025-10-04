import { Achievement } from '@/types/fitness';

export const ACHIEVEMENTS_DATABASE: Achievement[] = [
  {
    id: 'first_session',
    title: 'البداية القوية',
    description: 'أكمل جلستك التدريبية الأولى بنجاح.',
    unlocked: false,
  },
  {
    id: 'ten_sessions',
    title: 'المثابر',
    description: 'أكمل 10 جلسات تدريبية. عمل رائع!',
    unlocked: false,
  },
  {
    id: 'first_pr',
    title: 'محطم الأرقام',
    description: 'حقق أول رقم قياسي شخصي لك في أي تمرين.',
    unlocked: false,
  },
  {
    id: 'consistency_week',
    title: 'بطل الاستمرارية',
    description: 'تمرن لمدة 7 أيام متتالية.',
    unlocked: false,
  },
];