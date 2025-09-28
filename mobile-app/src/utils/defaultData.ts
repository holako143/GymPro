import { AppState } from '@/context/AppContext';

export const initialDefaultData: Pick<AppState, 'exercises' | 'trainingPlans' | 'activePlanId' | 'currentExerciseId'> = {
    exercises: [
        { id: 1, name: "تمرين الضغط (Dumbbell Press)", muscle: "صدر", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 4, completedSessions: 0, restTime: 90, currentSession: 1, sessionData: {} },
        { id: 2, name: "الضغط بالبار (Barbell Bench Press)", muscle: "صدر", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 3, completedSessions: 0, restTime: 60, currentSession: 1, sessionData: {} },
        { id: 3, name: "تفتيح بالدامبل (Dumbbell Fly)", muscle: "صدر", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 3, completedSessions: 0, restTime: 75, currentSession: 1, sessionData: {} },
        { id: 4, name: "الرفعة المميتة (Deadlift)", muscle: "ظهر", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 3, completedSessions: 0, restTime: 90, currentSession: 1, sessionData: {} },
        { id: 5, name: "سحب عالي بالبار (Lat Pulldown)", muscle: "ظهر", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 4, completedSessions: 0, restTime: 70, currentSession: 1, sessionData: {} },
        { id: 6, name: "الضغط العلوي بالدامبل (Overhead Dumbbell Press)", muscle: "أكتاف", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 3, completedSessions: 0, restTime: 60, currentSession: 1, sessionData: {} },
        { id: 7, name: "رفرفة جانبية بالدامبل (Lateral Raise)", muscle: "أكتاف", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 3, completedSessions: 0, restTime: 60, currentSession: 1, sessionData: {} },
        { id: 8, name: "القرفصاء بالبار (Barbell Squat)", muscle: "أرجل", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 4, completedSessions: 0, restTime: 120, currentSession: 1, sessionData: {} },
        { id: 9, name: "الطعنات بالدامبل (Dumbbell Lunges)", muscle: "أرجل", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 3, completedSessions: 0, restTime: 90, currentSession: 1, sessionData: {} },
        { id: 10, name: "تجعيد البايسبس بالبار (Barbell Bicep Curl)", muscle: "بايسبس", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 3, completedSessions: 0, restTime: 45, currentSession: 1, sessionData: {} },
        { id: 11, name: "تمديد الترايسبس بالحبل (Triceps Pushdown)", muscle: "ترايسبس", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 3, completedSessions: 0, restTime: 45, currentSession: 1, sessionData: {} },
        { id: 12, name: "تمرين العجلة (Ab Rollout)", muscle: "بطن", status: "pending", exerciseSeconds: 0, restSeconds: 0, sessions: 4, completedSessions: 0, restTime: 30, currentSession: 1, sessionData: {} },
    ],
    trainingPlans: [
        { id: 1, name: "خطة المبتدئين (كامل الجسم)", description: "خطة تدريب للمبتدئين تركز على بناء القوة الأساسية لجميع مجموعات العضلات الرئيسية.", exercises: [1, 4, 6, 8, 10, 11, 12] },
        { id: 2, name: "خطة الصدر والترايسبس", description: "خطة تدريب مكثفة تركز على عضلات الصدر والترايسبس.", exercises: [1, 2, 3, 11] },
        { id: 3, name: "خطة الظهر والبايسبس", description: "خطة تدريب مكثفة تركز على عضلات الظهر والبايسبس.", exercises: [4, 5, 10] },
    ],
    activePlanId: 1,
    currentExerciseId: 1,
};