import { ExerciseTemplate, EXERCISE_DATABASE } from './exerciseDatabase';

export interface PlanExercise {
  id: string; // Exercise ID from EXERCISE_DATABASE
  sets: number;
  reps: number;
  rest: number; // Rest time in seconds
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  days: {
    day: number;
    name: string;
    exercises: PlanExercise[];
  }[];
}

// Helper to quickly find an exercise by its English name
const getExId = (muscle: keyof typeof EXERCISE_DATABASE, nameEn: string): string => {
  const exercise = EXERCISE_DATABASE[muscle]?.find(e => e.nameEn === nameEn);
  if (!exercise) {
    console.warn(`Exercise "${nameEn}" not found in muscle group "${muscle}". Using a fallback.`);
    // Fallback to the first exercise of the group or a default
    return EXERCISE_DATABASE[muscle]?.[0]?.id || EXERCISE_DATABASE['صدر']?.[0]?.id || '';
  }
  return exercise.id;
};

export const TRAINING_PLAN_DATABASE: TrainingPlan[] = [
  {
    id: 'plan-1',
    name: 'برنامج القوة للمبتدئين (3 أيام)',
    description: 'برنامج تدريبي يركز على الحركات المركبة الأساسية لبناء القوة للمبتدئين، مقسم على 3 أيام.',
    days: [
      {
        day: 1,
        name: 'يوم الدفع (صدر، أكتاف، ترايسبس)',
        exercises: [
          { id: getExId('صدر', 'Barbell Bench Press'), sets: 3, reps: 8, rest: 90 },
          { id: getExId('أكتاف', 'Military Press'), sets: 3, reps: 10, rest: 75 },
          { id: getExId('صدر', 'Incline Dumbbell Press'), sets: 3, reps: 10, rest: 75 },
          { id: getExId('ترايسبس', 'Tricep Pushdown'), sets: 3, reps: 12, rest: 60 },
          { id: getExId('أكتاف', 'Lateral Raises'), sets: 3, reps: 15, rest: 60 },
        ],
      },
      {
        day: 2,
        name: 'يوم السحب (ظهر، بايسبس)',
        exercises: [
          { id: getExId('ظهر', 'Deadlift'), sets: 3, reps: 5, rest: 120 },
          { id: getExId('ظهر', 'Wide Grip Lat Pulldown'), sets: 3, reps: 10, rest: 75 },
          { id: getExId('ظهر', 'Barbell Row'), sets: 3, reps: 8, rest: 90 },
          { id: getExId('بايسبس', 'Barbell Curl'), sets: 3, reps: 12, rest: 60 },
          { id: getExId('بايسبس', 'Hammer Curl'), sets: 3, reps: 12, rest: 60 },
        ],
      },
      {
        day: 3,
        name: 'يوم الأرجل',
        exercises: [
          { id: getExId('أرجل', 'Barbell Squat'), sets: 3, reps: 8, rest: 120 },
          { id: getExId('أرجل', 'Leg Press'), sets: 3, reps: 10, rest: 90 },
          { id: getExId('أرجل', 'Romanian Deadlift'), sets: 3, reps: 10, rest: 90 },
          { id: getExId('أرجل', 'Leg Curl'), sets: 3, reps: 12, rest: 60 },
          { id: getExId('أرجل', 'Standing Calf Raise'), sets: 4, reps: 15, rest: 45 },
        ],
      },
    ],
  },
  {
    id: 'plan-2',
    name: 'برنامج التضخيم (Push/Pull/Legs)',
    description: 'برنامج تدريبي شهير يركز على تضخيم العضلات من خلال تقسيم الجسم إلى دفع وسحب وأرجل.',
    days: [
      {
        day: 1,
        name: 'دفع (Push)',
        exercises: [
          { id: getExId('صدر', 'Incline Dumbbell Press'), sets: 4, reps: 10, rest: 75 },
          { id: getExId('أكتاف', 'Arnold Press'), sets: 3, reps: 12, rest: 75 },
          { id: getExId('صدر', 'Cable Crossover'), sets: 3, reps: 15, rest: 60 },
          { id: getExId('ترايسبس', 'Skull Crushers'), sets: 3, reps: 12, rest: 60 },
          { id: getExId('أكتاف', 'Lateral Raises'), sets: 4, reps: 15, rest: 60 },
          { id: getExId('ترايسبس', 'Rope Tricep Pushdown'), sets: 3, reps: 15, rest: 60 },
        ],
      },
      {
        day: 2,
        name: 'سحب (Pull)',
        exercises: [
          { id: getExId('ظهر', 'Pull-ups'), sets: 4, reps: 8, rest: 90 },
          { id: getExId('ظهر', 'T-Bar Row'), sets: 4, reps: 10, rest: 90 },
          { id: getExId('ظهر', 'Face Pulls'), sets: 3, reps: 15, rest: 60 },
          { id: getExId('بايسبس', 'Incline Dumbbell Curl'), sets: 3, reps: 12, rest: 60 },
          { id: getExId('بايسبس', 'Preacher Curl'), sets: 3, reps: 12, rest: 60 },
        ],
      },
      {
        day: 3,
        name: 'أرجل (Legs)',
        exercises: [
          { id: getExId('أرجل', 'Front Squat'), sets: 4, reps: 8, rest: 120 },
          { id: getExId('أرجل', 'Bulgarian Split Squat'), sets: 3, reps: 12, rest: 90 },
          { id: getExId('أرجل', 'Leg Extension'), sets: 3, reps: 15, rest: 60 },
          { id: getExId('أرجل', 'Leg Curl'), sets: 3, reps: 15, rest: 60 },
          { id: getExId('أرجل', 'Hip Thrust'), sets: 4, reps: 10, rest: 90 },
        ],
      },
    ],
  },
  {
    id: 'plan-3',
    name: 'برنامج كامل الجسم (للمبتدئين)',
    description: 'تمرين كامل الجسم 3 مرات في الأسبوع، مثالي للمبتدئين أو لمن لديهم وقت محدود.',
    days: [
      {
        day: 1,
        name: 'تمرين أ',
        exercises: [
          { id: getExId('أرجل', 'Goblet Squat'), sets: 3, reps: 10, rest: 90 },
          { id: getExId('صدر', 'Push-ups'), sets: 3, reps: 10, rest: 75 },
          { id: getExId('ظهر', 'Dumbbell Row'), sets: 3, reps: 10, rest: 75 },
          { id: getExId('أكتاف', 'Lateral Raises'), sets: 3, reps: 15, rest: 60 },
          { id: getExId('بطن', 'Plank'), sets: 3, reps: 60, rest: 60 }, // Reps as seconds for Plank
        ],
      },
      {
        day: 2,
        name: 'تمرين ب',
        exercises: [
          { id: getExId('ظهر', 'Deadlift'), sets: 3, reps: 8, rest: 120 },
          { id: getExId('أكتاف', 'Military Press'), sets: 3, reps: 10, rest: 90 },
          { id: getExId('ظهر', 'Wide Grip Lat Pulldown'), sets: 3, reps: 12, rest: 75 },
          { id: getExId('بايسبس', 'Alternating Dumbbell Curl'), sets: 3, reps: 12, rest: 60 },
          { id: getExId('بطن', 'Leg Raises'), sets: 3, reps: 15, rest: 60 },
        ],
      },
      {
        day: 3,
        name: 'تمرين ج',
        exercises: [
          { id: getExId('أرجل', 'Leg Press'), sets: 3, reps: 12, rest: 90 },
          { id: getExId('صدر', 'Incline Dumbbell Press'), sets: 3, reps: 10, rest: 75 },
          { id: getExId('ظهر', 'Seated Cable Row'), sets: 3, reps: 12, rest: 75 },
          { id: getExId('ترايسبس', 'Tricep Pushdown'), sets: 3, reps: 12, rest: 60 },
          { id: getExId('بطن', 'Russian Twists'), sets: 3, reps: 20, rest: 60 },
        ],
      },
    ],
  },
];