import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Plus, Edit, Trash2, X, Dumbbell, Search, Play, CheckCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react-native';
import { MUSCLE_GROUPS, Exercise, TrainingPlan, SessionHistory, SessionData } from '@/types/fitness';
import { EXERCISE_DATABASE, getDifficultyLabel, getEquipmentLabel, ExerciseTemplate } from '@/constants/exerciseDatabase';

// Configure Calendar for Arabic
LocaleConfig.locales['ar'] = {
  monthNames: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  monthNamesShort: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'],
  dayNames: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  dayNamesShort: ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
  today: 'اليوم'
};
LocaleConfig.defaultLocale = 'ar';

// ExercisesView Component
const ExercisesView = () => {
    const { exercises, deleteExercise, addExercise, updateExercise, settings } = useFitnessStore();
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showExerciseLibrary, setShowExerciseLibrary] = useState<boolean>(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
    const [deleteModalType, setDeleteModalType] = useState<'single' | 'multiple'>('single');
    const [exerciseName, setExerciseName] = useState<string>('');
    const [selectedMuscle, setSelectedMuscle] = useState<string>('صدر');
    const [sessions, setSessions] = useState<string>('3');
    const [restTime, setRestTime] = useState<string>('90');
    const [selectedExercises, setSelectedExercises] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState<string>('');

    const getStatusText = (status: string) => ({ 'completed': 'تم الإنتهاء', 'in-progress': 'قيد التنفيذ', 'resting': 'في الراحة', 'pending': 'لم يبدأ' }[status as 'completed'] || status);
    const getStatusColor = (status: string) => ({ 'completed': '#4cc9f0', 'in-progress': settings.primaryColor, 'resting': '#7209b7', 'pending': '#fca311' }[status as 'completed'] || '#6c757d');
    const toggleExerciseSelection = (exerciseId: number) => { const newSelected = new Set(selectedExercises); if (newSelected.has(exerciseId)) { newSelected.delete(exerciseId); } else { newSelected.add(exerciseId); } setSelectedExercises(newSelected); };
    const selectAllExercises = () => setSelectedExercises(new Set(exercises.map(e => e.id)));
    const deselectAllExercises = () => setSelectedExercises(new Set());
    const deleteSelectedExercises = () => { if (selectedExercises.size === 0) { Alert.alert('خطأ', 'الرجاء تحديد تمارين للحذف.'); return; } setDeleteModalType('multiple'); setShowDeleteModal(true); };
    const confirmDeleteSelected = () => { selectedExercises.forEach(id => deleteExercise(id)); setSelectedExercises(new Set()); setShowDeleteModal(false); };
    const handleDeleteExercise = (exerciseId: number) => { setExerciseToDelete(exerciseId); setDeleteModalType('single'); setShowDeleteModal(true); };
    const confirmDeleteSingle = () => { if (exerciseToDelete) deleteExercise(exerciseToDelete); setShowDeleteModal(false); setExerciseToDelete(null); };
    const resetForm = () => { setExerciseName(''); setSelectedMuscle('صدر'); setSessions('3'); setRestTime('90'); };
    const handleOpenAddModal = () => { resetForm(); setEditingExercise(null); setShowAddModal(true); };
    const handleOpenEditModal = (exercise: Exercise) => { setEditingExercise(exercise); setExerciseName(exercise.name); setSelectedMuscle(exercise.muscle); setSessions(String(exercise.sessions)); setRestTime(String(exercise.restTime)); setShowEditModal(true); };
    const handleSave = () => {
        if (!exerciseName.trim()) { Alert.alert('خطأ','يرجى إدخال اسم التمرين'); return; }
        const exerciseData = { name: exerciseName.trim(), muscle: selectedMuscle, sessions: parseInt(sessions) || 3, restTime: parseInt(restTime) || 90 };
        if (editingExercise) { updateExercise(editingExercise.id, exerciseData); } else { addExercise(exerciseData); }
        setShowAddModal(false); setShowEditModal(false); setEditingExercise(null);
    };
    const handleSelectFromLibrary = (template: ExerciseTemplate) => { setExerciseName(template.name); setSelectedMuscle(template.muscle); setShowExerciseLibrary(false); };
    const filteredLibraryExercises = searchQuery.trim() ? Object.values(EXERCISE_DATABASE).flat().filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || ex.muscle.includes(searchQuery)) : EXERCISE_DATABASE[selectedMuscle as keyof typeof EXERCISE_DATABASE] || [];

    const renderExerciseForm = (isEditing: boolean) => (
        <><View style={styles.inputContainer}><Text style={styles.inputLabel}>اسم التمرين</Text><View style={styles.inputWithButton}><TextInput style={styles.inputFlex} value={exerciseName} onChangeText={setExerciseName} placeholder="مثال: تمرين الضغط" /><TouchableOpacity style={[styles.libraryButton, { backgroundColor: settings.primaryColor }]} onPress={() => setShowExerciseLibrary(true)}><Dumbbell size={16} color="white" /></TouchableOpacity></View></View><View style={styles.inputContainer}><Text style={styles.inputLabel}>المجموعة العضلية</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleSelector}>{MUSCLE_GROUPS.map((muscle) => (<TouchableOpacity key={muscle} style={[styles.muscleButton, selectedMuscle === muscle && styles.selectedMuscleButton]} onPress={() => setSelectedMuscle(muscle)}><Text style={[styles.muscleButtonText, selectedMuscle === muscle && styles.selectedMuscleButtonText]}>{muscle}</Text></TouchableOpacity>))}</ScrollView></View><View style={styles.inputRow}><View style={styles.halfInputContainer}><Text style={styles.inputLabel}>عدد الجلسات</Text><TextInput style={styles.input} value={sessions} onChangeText={setSessions} keyboardType="numeric" placeholder="3" /></View><View style={styles.halfInputContainer}><Text style={styles.inputLabel}>وقت الراحة (ثانية)</Text><TextInput style={styles.input} value={restTime} onChangeText={setRestTime} keyboardType="numeric" placeholder="90" /></View></View><View style={styles.modalButtons}><TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setShowAddModal(false); setShowEditModal(false); }}><Text style={styles.cancelButtonText}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={[styles.modalButton, { backgroundColor: settings.primaryColor }]} onPress={handleSave}><Text style={styles.confirmButtonText}>{isEditing ? 'حفظ التعديلات' : 'إضافة'}</Text></TouchableOpacity></View></>
    );

    return (
        <View style={styles.viewContainer}>
            <View style={styles.controlsContainer}><TouchableOpacity style={[styles.controlButton, styles.secondaryButton]} onPress={selectAllExercises}><Text style={styles.controlButtonText}>تحديد الكل</Text></TouchableOpacity><TouchableOpacity style={[styles.controlButton, styles.secondaryButton]} onPress={deselectAllExercises}><Text style={styles.controlButtonText}>إلغاء التحديد</Text></TouchableOpacity><TouchableOpacity style={[styles.controlButton, styles.dangerButton]} onPress={deleteSelectedExercises}><Text style={styles.controlButtonText}>حذف المحدد</Text></TouchableOpacity></View>
            <ScrollView style={styles.listScrollView} showsVerticalScrollIndicator={false}>{exercises.length === 0 ? <View style={styles.emptyContainer}><Text style={styles.emptyText}>لا توجد تمارين مضافة بعد</Text></View> : exercises.map((exercise) => (<TouchableOpacity key={exercise.id} style={[styles.exerciseItem, selectedExercises.has(exercise.id) && styles.selectedExerciseItem, { borderLeftColor: getStatusColor(exercise.status) }]} onPress={() => toggleExerciseSelection(exercise.id)}><View style={styles.exerciseContent}><View style={styles.exerciseInfo}><Text style={styles.exerciseName}>{exercise.name}</Text><Text style={styles.exerciseDetails}>{exercise.muscle} - {exercise.sessions} جلسات</Text><Text style={[styles.exerciseStatus, { color: getStatusColor(exercise.status) }]}>{getStatusText(exercise.status)}</Text></View><View style={styles.exerciseActions}><TouchableOpacity style={[styles.actionButton, { backgroundColor: settings.primaryColor }]} onPress={(e) => { e.stopPropagation(); handleOpenEditModal(exercise); }}><Edit size={16} color="white" /></TouchableOpacity><TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={(e) => { e.stopPropagation(); handleDeleteExercise(exercise.id); }}><Trash2 size={16} color="white" /></TouchableOpacity></View></View>{selectedExercises.has(exercise.id) && <View style={styles.selectionIndicator} />}</TouchableOpacity>))}</ScrollView>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: settings.primaryColor }]} onPress={handleOpenAddModal}><Plus size={20} color="white" /><Text style={styles.addButtonText}>إضافة تمرين جديد</Text></TouchableOpacity>
            <Modal visible={showAddModal || showEditModal} transparent={true} animationType="slide" onRequestClose={() => {setShowAddModal(false); setShowEditModal(false);}}><View style={styles.modalOverlay}><View style={styles.modalContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{editingExercise ? 'تعديل التمرين' : 'إضافة تمرين جديد'}</Text><TouchableOpacity onPress={() => {setShowAddModal(false); setShowEditModal(false);}}><X size={24} color="#6b7280" /></TouchableOpacity></View>{renderExerciseForm(!!editingExercise)}</View></View></Modal>
            <Modal visible={showExerciseLibrary} transparent={true} animationType="slide" onRequestClose={() => setShowExerciseLibrary(false)}><View style={styles.modalOverlay}><View style={styles.libraryModalContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>مكتبة التمارين</Text><TouchableOpacity onPress={() => setShowExerciseLibrary(false)}><X size={24} color="#6b7280" /></TouchableOpacity></View><View style={styles.searchContainer}><Search size={18} color="#6b7280" /><TextInput style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} placeholder="ابحث عن تمرين..." placeholderTextColor="#9ca3af" /></View>{!searchQuery.trim() && (<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleTabsContainer}>{MUSCLE_GROUPS.map((muscle) => (<TouchableOpacity key={muscle} style={[styles.muscleTab, selectedMuscle === muscle && [styles.selectedMuscleTab, { backgroundColor: settings.primaryColor }]]} onPress={() => setSelectedMuscle(muscle)}><Text style={[styles.muscleTabText, selectedMuscle === muscle && styles.selectedMuscleTabText]}>{muscle}</Text></TouchableOpacity>))}</ScrollView>)}<ScrollView style={styles.libraryScrollView} showsVerticalScrollIndicator={false}>{filteredLibraryExercises.map((template) => (<TouchableOpacity key={template.id} style={styles.libraryExerciseItem} onPress={() => handleSelectFromLibrary(template)}><View style={styles.libraryExerciseImagePlaceholder}><Dumbbell size={24} color={settings.primaryColor} /></View><View style={styles.libraryExerciseInfo}><Text style={styles.libraryExerciseName}>{template.name}</Text><Text style={styles.libraryExerciseNameEn}>{template.nameEn}</Text><Text style={styles.libraryExerciseDescription}>{template.description}</Text><View style={styles.libraryExerciseMeta}><View style={styles.libraryMetaItem}><Text style={styles.libraryMetaLabel}>المستوى:</Text><Text style={styles.libraryMetaValue}>{getDifficultyLabel(template.difficulty)}</Text></View><View style={styles.libraryMetaItem}><Text style={styles.libraryMetaLabel}>المعدات:</Text><Text style={styles.libraryMetaValue}>{getEquipmentLabel(template.equipment)}</Text></View></View></View></TouchableOpacity>))}</ScrollView></View></View></Modal>
            <Modal visible={showDeleteModal} transparent={true} animationType="fade" onRequestClose={() => setShowDeleteModal(false)}><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>تأكيد الحذف</Text><Text style={styles.modalMessage}>{deleteModalType === 'multiple' ? `هل أنت متأكد من حذف ${selectedExercises.size} تمرين محدد؟` : 'هل أنت متأكد من حذف هذا التمرين؟'}</Text><View style={styles.modalButtons}><TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowDeleteModal(false)}><Text style={styles.cancelButtonText}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={[styles.modalButton, styles.dangerButton]} onPress={deleteModalType === 'multiple' ? confirmDeleteSelected : confirmDeleteSingle}><Text style={styles.confirmButtonText}>حذف</Text></TouchableOpacity></View></View></View></Modal>
        </View>
    );
};

// AnalyticsView Component
const AnalyticsView = () => {
    const { sessionHistory, exercises, formatTime, trainingPlans, addPlannedWorkout, settings } = useFitnessStore();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isPlanModalVisible, setPlanModalVisible] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [compareMuscle, setCompareMuscle] = useState<string | null>(null);
    const [sessionAId, setSessionAId] = useState<number | null>(null);
    const [sessionBId, setSessionBId] = useState<number | null>(null);

    const onDayPress = (day: { dateString: string }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const pressedDate = new Date(day.dateString);
        pressedDate.setHours(0, 0, 0, 0);

        setSelectedDate(day.dateString);

        if (pressedDate >= today) {
            setPlanModalVisible(true);
        }
    };

    const handlePlanWorkout = () => {
        if (selectedDate && selectedPlanId !== null) { addPlannedWorkout(selectedDate, selectedPlanId); setPlanModalVisible(false); setSelectedPlanId(null); }
        else { Alert.alert("خطأ", "الرجاء تحديد خطة."); }
    };

    const getSessionStats = (sessionId: number | null): SessionData[] => {
        if (!sessionId) return [];
        const session = sessionHistory.find(s => s.id === sessionId);
        if (!session || !session.planId) return [];
        const plan = trainingPlans.find(p => p.id === session.planId);
        if (!plan) return [];
        const relevantExercises = exercises.filter(ex => plan.exercises.includes(ex.id));
        return relevantExercises.flatMap(ex => Object.values(ex.sessionData));
    };

    const calculateAggregateStats = (sessionData: SessionData[]) => {
        return sessionData.reduce((acc, current) => {
            acc.totalVolume += current.volume || 0;
            acc.totalReps += current.reps || 0;
            acc.totalExerciseTime += current.sessionExerciseDuration || 0;
            acc.totalRestTime += current.sessionRestDuration || 0;
            acc.totalWastedTime += current.wastedTime || 0;
            return acc;
        }, { totalVolume: 0, totalReps: 0, totalExerciseTime: 0, totalRestTime: 0, totalWastedTime: 0 });
    };

    const sessionAStats = useMemo(() => calculateAggregateStats(getSessionStats(sessionAId)), [sessionAId, exercises]);
    const sessionBStats = useMemo(() => calculateAggregateStats(getSessionStats(sessionBId)), [sessionBId, exercises]);

    const markedDates = useMemo(() => {
        const markings: { [key: string]: any } = {};
        sessionHistory.forEach(session => { const date = new Date(session.startTime).toISOString().split('T')[0]; if (!markings[date]) markings[date] = { dots: [] }; if (!markings[date].dots.some((d: any) => d.key === 'completed')) { markings[date].dots.push({ key: 'completed', color: '#10b981' }); } });
        // plannedWorkouts.forEach(workout => { const date = workout.date; if (!markings[date]) markings[date] = { dots: [] }; if (!markings[date].dots.some((d: any) => d.key === 'planned')) { markings[date].dots.push({ key: 'planned', color: settings.secondaryColor }); } });
        if (selectedDate) { markings[selectedDate] = { ...markings[selectedDate], selected: true, selectedColor: settings.primaryColor }; }
        return markings;
    }, [sessionHistory, selectedDate, settings.primaryColor, settings.secondaryColor]);

    const sessionsForMuscle = useMemo(() => {
        if (!compareMuscle) return [];
        return sessionHistory.filter(session => {
            const plan = trainingPlans.find(p => p.id === session.planId);
            return plan && plan.exercises.some(exId => exercises.find(e => e.id === exId)?.muscle === compareMuscle);
        });
    }, [compareMuscle, sessionHistory, trainingPlans, exercises]);

    const renderComparisonRow = (label: string, valueA: number, valueB: number, formatter: (val: number) => string | number = val => val) => {
        const delta = valueB - valueA;
        const color = delta > 0 ? '#10b981' : delta < 0 ? '#ef4444' : '#6b7280';
        const icon = delta > 0 ? <ArrowUp size={14} color={color} /> : delta < 0 ? <ArrowDown size={14} color={color} /> : <Minus size={14} color={color} />;
        return (
            <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>{label}</Text>
                <Text style={styles.comparisonValue}>{formatter(valueA)}</Text>
                <Text style={styles.comparisonValue}>{formatter(valueB)}</Text>
                <View style={styles.comparisonDelta}><Text style={{color}}>{formatter(Math.abs(delta))}</Text>{icon}</View>
            </View>
        );
    };

    return (
        <View style={styles.viewContainer}>
            <View style={styles.analyticsCard}>
                <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>مقارنة أداء العضلات</Text>
                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>اختر مجموعة عضلية:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>{MUSCLE_GROUPS.map(m => <TouchableOpacity key={m} style={[styles.muscleChip, compareMuscle === m && styles.muscleChipSelected]} onPress={() => setCompareMuscle(m)}><Text style={[styles.muscleChipText, compareMuscle === m && styles.muscleChipTextSelected]}>{m}</Text></TouchableOpacity>)}</ScrollView>
                </View>
                {compareMuscle && (
                    <View style={styles.sessionPickers}>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>الجلسة 1 (الأقدم):</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>{sessionsForMuscle.map(s => <TouchableOpacity key={s.id} style={[styles.sessionChip, sessionAId === s.id && styles.sessionChipSelected]} onPress={() => setSessionAId(s.id)}><Text style={[styles.sessionChipText, sessionAId === s.id && styles.sessionChipTextSelected]}>{new Date(s.startTime).toLocaleDateString('ar-EG')}</Text></TouchableOpacity>)}</ScrollView>
                        </View>
                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerLabel}>الجلسة 2 (الأحدث):</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>{sessionsForMuscle.map(s => <TouchableOpacity key={s.id} style={[styles.sessionChip, sessionBId === s.id && styles.sessionChipSelected]} onPress={() => setSessionBId(s.id)}><Text style={[styles.sessionChipText, sessionBId === s.id && styles.sessionChipTextSelected]}>{new Date(s.startTime).toLocaleDateString('ar-EG')}</Text></TouchableOpacity>)}</ScrollView>
                        </View>
                    </View>
                )}
                {sessionAId && sessionBId && (
                    <View style={styles.comparisonContainer}>
                        <View style={styles.comparisonHeaderRow}><Text style={styles.comparisonHeader}>المقياس</Text><Text style={styles.comparisonHeader}>جلسة 1</Text><Text style={styles.comparisonHeader}>جلسة 2</Text><Text style={styles.comparisonHeader}>الفرق</Text></View>
                        {renderComparisonRow("إجمالي الحجم (كج)", sessionAStats.totalVolume, sessionBStats.totalVolume)}
                        {renderComparisonRow("إجمالي العدات", sessionAStats.totalReps, sessionBStats.totalReps)}
                        {renderComparisonRow("وقت التمرين", sessionAStats.totalExerciseTime, sessionBStats.totalExerciseTime, formatTime)}
                        {renderComparisonRow("وقت الراحة", sessionAStats.totalRestTime, sessionBStats.totalRestTime, formatTime)}
                        {renderComparisonRow("الوقت الضائع", sessionAStats.totalWastedTime, sessionBStats.totalWastedTime, formatTime)}
                    </View>
                )}
            </View>
            <View style={styles.analyticsCard}><Text style={[styles.cardTitle, { color: settings.primaryColor }]}>تقويم الجلسات</Text><Calendar onDayPress={onDayPress} markedDates={markedDates} markingType={'multi-dot'} theme={{ backgroundColor: '#ffffff', calendarBackground: '#ffffff', textSectionTitleColor: '#b6c1cd', selectedDayBackgroundColor: settings.primaryColor, selectedDayTextColor: '#ffffff', todayTextColor: settings.primaryColor, dayTextColor: '#2d4150', arrowColor: settings.primaryColor, monthTextColor: settings.primaryColor }} style={styles.calendar} /></View>
        </View>
    );
};

// PlansView Component
const PlansView = () => {
    const { trainingPlans, exercises, activePlanId, activateTrainingPlan, deactivateAllPlans, deleteTrainingPlan, addTrainingPlan, updateTrainingPlan, settings } = useFitnessStore();
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
    const [planName, setPlanName] = useState<string>('');
    const [planDescription, setPlanDescription] = useState<string>('');
    const [selectedPlanExercises, setSelectedPlanExercises] = useState<number[]>([]);

    const handleActivatePlan = (planId: number) => {
        const action = () => activePlanId === planId ? deactivateAllPlans() : activateTrainingPlan(planId);
        const title = activePlanId === planId ? 'إلغاء التفعيل' : 'تفعيل الخطة';
        const message = activePlanId === planId ? 'هل تريد إلغاء تفعيل هذه الخطة؟' : 'هل تريد تفعيل هذه الخطة؟ سيتم إعادة تعيين جميع التمارين.';
        if (Platform.OS === 'web') { if (confirm(message)) action(); } else { Alert.alert(title, message, [{ text: 'إلغاء', style: 'cancel' }, { text: 'نعم', onPress: action }]); }
    };

    const handleDeletePlan = (planId: number) => { if (Platform.OS === 'web') { if (confirm('هل أنت متأكد من حذف خطة التدريب هذه؟')) deleteTrainingPlan(planId); } else { Alert.alert('حذف الخطة', 'هل أنت متأكد من حذف خطة التدريب هذه؟', [{ text: 'إلغاء', style: 'cancel' }, { text: 'حذف', style: 'destructive', onPress: () => deleteTrainingPlan(planId) }]); } };

    const openPlanModal = (plan: TrainingPlan | null) => {
        if (plan) {
            setEditingPlan(plan);
            setPlanName(plan.name);
            setPlanDescription(plan.description);
            setSelectedPlanExercises(plan.exercises);
            setShowEditModal(true);
        } else {
            setEditingPlan(null);
            setPlanName('');
            setPlanDescription('');
            setSelectedPlanExercises([]);
            setShowAddModal(true);
        }
    };

    const handleSavePlan = () => {
        if (!planName.trim()) { Alert.alert('خطأ', 'يرجى إدخال اسم الخطة'); return; }
        if (selectedPlanExercises.length === 0) { Alert.alert('خطأ', 'يرجى اختيار تمرين واحد على الأقل'); return; }
        const planData = { name: planName.trim(), description: planDescription.trim() || 'خطة تدريب مخصصة', exercises: selectedPlanExercises };
        if (editingPlan) { updateTrainingPlan(editingPlan.id, planData); } else { addTrainingPlan({ ...planData, active: false }); }
        setShowAddModal(false); setShowEditModal(false);
    };

    const toggleExerciseSelection = (exerciseId: number) => setSelectedPlanExercises(prev => prev.includes(exerciseId) ? prev.filter(id => id !== exerciseId) : [...prev, exerciseId]);

    const renderPlanForm = (isEditing: boolean) => (
        <><View style={styles.inputContainer}><Text style={styles.inputLabel}>اسم الخطة</Text><TextInput style={styles.input} value={planName} onChangeText={setPlanName} placeholder="مثال: خطة المبتدئين" /></View><View style={styles.inputContainer}><Text style={styles.inputLabel}>الوصف</Text><TextInput style={[styles.input, styles.textArea]} value={planDescription} onChangeText={setPlanDescription} placeholder="وصف الخطة..." multiline numberOfLines={3} /></View><View style={styles.inputContainer}><Text style={styles.inputLabel}>اختر التمارين ({selectedPlanExercises.length})</Text><ScrollView style={styles.exercisesList}>{exercises.map(exercise => (<TouchableOpacity key={exercise.id} style={[styles.exerciseSelectItem, selectedPlanExercises.includes(exercise.id) && styles.exerciseSelectItemSelected]} onPress={() => toggleExerciseSelection(exercise.id)}><View style={styles.exerciseSelectInfo}><Text style={styles.exerciseSelectName}>{exercise.name}</Text><Text style={styles.exerciseSelectMuscle}>{exercise.muscle}</Text></View>{selectedPlanExercises.includes(exercise.id) && <CheckCircle size={20} color={settings.primaryColor} />}</TouchableOpacity>))}</ScrollView></View><View style={styles.modalButtons}><TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => {setShowAddModal(false); setShowEditModal(false);}}><Text style={styles.cancelButtonText}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={[styles.modalButton, { backgroundColor: settings.primaryColor }]} onPress={handleSavePlan}><Text style={styles.confirmButtonText}>{isEditing ? 'حفظ' : 'إنشاء'}</Text></TouchableOpacity></View></>
    );

    return (
        <View style={styles.viewContainer}>
            <ScrollView style={styles.listScrollView} showsVerticalScrollIndicator={false}>{trainingPlans.length === 0 ? <View style={styles.emptyContainer}><Text style={styles.emptyText}>لا توجد خطط تدريب مضافة بعد</Text></View> : trainingPlans.map((plan) => (<View key={plan.id} style={styles.planCard}><View style={styles.planHeader}><View style={styles.planTitleContainer}><Text style={styles.planName}>{plan.name}</Text>{activePlanId === plan.id && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>مفعلة</Text></View>}</View><View style={styles.planActions}><TouchableOpacity style={[styles.actionButton, { backgroundColor: activePlanId === plan.id ? '#4cc9f0' : settings.primaryColor }]} onPress={() => handleActivatePlan(plan.id)}>{activePlanId === plan.id ? <CheckCircle size={18} color="white" /> : <Play size={18} color="white" />}</TouchableOpacity><TouchableOpacity style={[styles.actionButton, { backgroundColor: settings.primaryColor }]} onPress={() => openPlanModal(plan)}><Edit size={18} color="white" /></TouchableOpacity><TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeletePlan(plan.id)}><Trash2 size={18} color="white" /></TouchableOpacity></View></View><Text style={styles.planDescription}>{plan.description}</Text><View style={styles.exercisesContainer}>{plan.exercises.map(id => exercises.find(e => e.id === id)?.name).filter(Boolean).map((name, index) => <View key={index} style={styles.planExerciseItem}><Text style={styles.planExerciseText}>{name}</Text></View>)}</View></View>))}</ScrollView>
            <TouchableOpacity style={[styles.addButton, { backgroundColor: settings.primaryColor }]} onPress={() => openPlanModal(null)}><Plus size={20} color="white" /><Text style={styles.addButtonText}>إنشاء خطة تدريب جديدة</Text></TouchableOpacity>
            <Modal visible={showAddModal || showEditModal} transparent={true} animationType="slide" onRequestClose={() => {setShowAddModal(false); setShowEditModal(false);}}><View style={styles.modalOverlay}><View style={styles.modalContent}><View style={styles.modalHeader}><Text style={styles.modalTitle}>{editingPlan ? 'تعديل خطة التدريب' : 'إنشاء خطة تدريب جديدة'}</Text><TouchableOpacity onPress={() => {setShowAddModal(false); setShowEditModal(false);}}><X size={24} color="#6b7280" /></TouchableOpacity></View>{renderPlanForm(!!editingPlan)}</View></View></Modal>
        </View>
    );
};

type ViewType = 'exercises' | 'analytics' | 'plans';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useFitnessStore();
  const [activeView, setActiveView] = useState<ViewType>('exercises');
  const renderContent = () => { switch (activeView) { case 'exercises': return <ExercisesView />; case 'analytics': return <AnalyticsView />; case 'plans': return <PlansView />; default: return null; } };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>المكتبة</Text></View>
      <View style={styles.switcherContainer}><TouchableOpacity style={[styles.switchButton, activeView === 'exercises' && { backgroundColor: settings.primaryColor }]} onPress={() => setActiveView('exercises')}><Text style={[styles.switchButtonText, activeView === 'exercises' && styles.activeSwitchButtonText]}>التمارين</Text></TouchableOpacity><TouchableOpacity style={[styles.switchButton, activeView === 'analytics' && { backgroundColor: settings.primaryColor }]} onPress={() => setActiveView('analytics')}><Text style={[styles.switchButtonText, activeView === 'analytics' && styles.activeSwitchButtonText]}>التحليلات</Text></TouchableOpacity><TouchableOpacity style={[styles.switchButton, activeView === 'plans' && { backgroundColor: settings.primaryColor }]} onPress={() => setActiveView('plans')}><Text style={[styles.switchButtonText, activeView === 'plans' && styles.activeSwitchButtonText]}>الخطط</Text></TouchableOpacity></View>
      <ScrollView style={styles.contentScrollView}>{renderContent()}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' }, header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }, title: { fontSize: 28, fontWeight: '800', color: '#111827' },
    switcherContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#e2e8f0', borderRadius: 10, marginHorizontal: 16, marginVertical: 16, padding: 4 },
    switchButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }, switchButtonText: { fontSize: 14, fontWeight: '600', color: '#374151' }, activeSwitchButtonText: { color: 'white' },
    contentScrollView: { flex: 1, paddingHorizontal: 16, paddingBottom: 20 }, viewContainer: { flex: 1 }, listScrollView: { flex: 1 },
    controlsContainer: { flexDirection: 'row', paddingBottom: 15, gap: 10 }, controlButton: { flex: 1, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, alignItems: 'center' },
    secondaryButton: { backgroundColor: '#6c757d' }, dangerButton: { backgroundColor: '#e63946' }, controlButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 }, emptyText: { fontSize: 16, color: '#6c757d', textAlign: 'center' },
    exerciseItem: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderLeftWidth: 5, position: 'relative' },
    selectedExerciseItem: { backgroundColor: '#e6f7ff' }, exerciseContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: 16, fontWeight: 'bold', color: '#212529', marginBottom: 4 }, exerciseDetails: { fontSize: 14, color: '#6c757d', marginBottom: 4 }, exerciseStatus: { fontSize: 12, fontWeight: 'bold' },
    exerciseActions: { flexDirection: 'row', gap: 10 }, actionButton: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }, deleteButton: { backgroundColor: '#e63946' },
    selectionIndicator: { position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#4cc9f0' },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20, paddingVertical: 15, borderRadius: 10, gap: 8 }, addButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }, modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: '100%', maxWidth: 500, maxHeight: '90%' },
    libraryModalContent: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: '100%', maxWidth: 500, maxHeight: '90%' }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' }, inputContainer: { marginBottom: 16 }, inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' }, inputWithButton: { flexDirection: 'row', gap: 8 }, inputFlex: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9fafb' },
    libraryButton: { width: 48, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' }, muscleSelector: { maxHeight: 50 }, muscleButton: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#d1d5db' },
    selectedMuscleButton: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }, muscleButtonText: { fontSize: 14, fontWeight: '600', color: '#6b7280' }, selectedMuscleButtonText: { color: 'white' },
    inputRow: { flexDirection: 'row', gap: 12, marginBottom: 20 }, halfInputContainer: { flex: 1 }, modalButtons: { flexDirection: 'row', gap: 10, marginTop: 10 }, modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db' }, cancelButtonText: { color: '#6b7280', fontWeight: '600' }, confirmButtonText: { color: 'white', fontWeight: '600' },
    modalMessage: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 20, lineHeight: 24 }, searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', gap: 8 },
    searchInput: { flex: 1, fontSize: 14, color: '#111827' }, muscleTabsContainer: { marginBottom: 16, maxHeight: 50 }, muscleTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db' },
    selectedMuscleTab: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' }, muscleTabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' }, selectedMuscleTabText: { color: 'white' },
    libraryScrollView: { flex: 1 }, libraryExerciseItem: { flexDirection: 'row', backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 12 },
    libraryExerciseImagePlaceholder: { width: 60, height: 60, backgroundColor: '#e5e7eb', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }, libraryExerciseInfo: { flex: 1 },
    libraryExerciseName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 }, libraryExerciseNameEn: { fontSize: 12, color: '#6b7280', marginBottom: 4 }, libraryExerciseDescription: { fontSize: 12, color: '#6b7280', marginBottom: 6, lineHeight: 16 },
    libraryExerciseMeta: { flexDirection: 'row', gap: 12 }, libraryMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 }, libraryMetaLabel: { fontSize: 10, color: '#9ca3af', fontWeight: '600' }, libraryMetaValue: { fontSize: 10, color: '#4b5563', fontWeight: '600' },
    analyticsCard: { backgroundColor: 'white', borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 8 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }, calendar: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12 },
    sessionCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#4ade80' }, sessionPlanName: { fontSize: 16, fontWeight: '600', color: '#1f2937' }, sessionTime: { fontSize: 13, color: '#6b7280', marginTop: 4 },
    planCard: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, planTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    planName: { fontSize: 18, fontWeight: 'bold', color: '#212529' }, activeBadge: { backgroundColor: '#4cc9f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 10 },
    activeBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' }, planActions: { flexDirection: 'row', gap: 10 }, planDescription: { fontSize: 14, color: '#6c757d', marginBottom: 15, lineHeight: 20 },
    exercisesContainer: { marginTop: 10 }, planExerciseItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    planExerciseText: { fontSize: 14, color: '#212529' }, deactivateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 10, marginTop: 20, gap: 8 },
    deactivateButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }, textArea: { minHeight: 80, textAlignVertical: 'top' }, exercisesList: { maxHeight: 200, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, backgroundColor: '#f9fafb' },
    exerciseSelectItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    exerciseSelectItemSelected: { backgroundColor: '#eff6ff' }, exerciseSelectInfo: { flex: 1 }, exerciseSelectName: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 2 },
    exerciseSelectMuscle: { fontSize: 12, color: '#6b7280' },
    pickerContainer: { marginBottom: 12 }, pickerLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    sessionPickers: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    muscleChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8 },
    muscleChipSelected: { backgroundColor: '#4361ee', borderColor: '#4361ee' },
    muscleChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
    muscleChipTextSelected: { color: 'white' },
    sessionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8 },
    sessionChipSelected: { backgroundColor: '#3f37c9', borderColor: '#3f37c9' },
    sessionChipText: { fontSize: 13, fontWeight: '600', color: '#374151' },
    sessionChipTextSelected: { color: 'white' },
    comparisonContainer: { marginTop: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 },
    comparisonHeaderRow: { flexDirection: 'row', backgroundColor: '#f8fafc', padding: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
    comparisonHeader: { flex: 1, fontWeight: 'bold', color: '#374151', textAlign: 'center' },
    comparisonRow: { flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    comparisonLabel: { flex: 1, fontWeight: '600' },
    comparisonValue: { flex: 1, textAlign: 'center' },
    comparisonDelta: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
    legendContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendIndicator: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: 12, color: '#6b7280' },
});