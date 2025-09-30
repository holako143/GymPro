import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import { Plus, Edit, Trash2, X, Dumbbell, Search } from 'lucide-react-native';
import { MUSCLE_GROUPS, Exercise } from '@/types/fitness';
import { EXERCISE_DATABASE, getDifficultyLabel, getEquipmentLabel, ExerciseTemplate } from '@/constants/exerciseDatabase';

// Placeholder for future views
const AnalyticsView = () => <View style={styles.viewContainer}><Text>عرض التحليلات سيظهر هنا</Text></View>;
const PlansView = () => <View style={styles.viewContainer}><Text>عرض الخطط سيظهر هنا</Text></View>;

// ExercisesView Component with full CRUD functionality
const ExercisesView = () => {
    const { exercises, deleteExercise, addExercise, updateExercise, settings } = useFitnessStore();

    // Modal visibility states
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showExerciseLibrary, setShowExerciseLibrary] = useState<boolean>(false);

    // Data states
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
    const [deleteModalType, setDeleteModalType] = useState<'single' | 'multiple'>('single');

    // Form input states
    const [exerciseName, setExerciseName] = useState<string>('');
    const [selectedMuscle, setSelectedMuscle] = useState<string>('صدر');
    const [sessions, setSessions] = useState<string>('3');
    const [restTime, setRestTime] = useState<string>('90');

    // UI states
    const [selectedExercises, setSelectedExercises] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState<string>('');

    const getStatusText = (status: string) => ({ 'completed': 'تم الإنتهاء', 'in-progress': 'قيد التنفيذ', 'resting': 'في الراحة', 'pending': 'لم يبدأ' }[status as 'completed'] || status);
    const getStatusColor = (status: string) => ({ 'completed': '#4cc9f0', 'in-progress': settings.primaryColor, 'resting': '#7209b7', 'pending': '#fca311' }[status as 'completed'] || '#6c757d');

    // Selection handlers
    const toggleExerciseSelection = (exerciseId: number) => { const newSelected = new Set(selectedExercises); if (newSelected.has(exerciseId)) { newSelected.delete(exerciseId); } else { newSelected.add(exerciseId); } setSelectedExercises(newSelected); };
    const selectAllExercises = () => setSelectedExercises(new Set(exercises.map(e => e.id)));
    const deselectAllExercises = () => setSelectedExercises(new Set());

    // Delete handlers
    const deleteSelectedExercises = () => { if (selectedExercises.size === 0) { Alert.alert('خطأ', 'الرجاء تحديد تمارين للحذف.'); return; } setDeleteModalType('multiple'); setShowDeleteModal(true); };
    const confirmDeleteSelected = () => { selectedExercises.forEach(id => deleteExercise(id)); setSelectedExercises(new Set()); setShowDeleteModal(false); };
    const handleDeleteExercise = (exerciseId: number) => { setExerciseToDelete(exerciseId); setDeleteModalType('single'); setShowDeleteModal(true); };
    const confirmDeleteSingle = () => { if (exerciseToDelete) deleteExercise(exerciseToDelete); setShowDeleteModal(false); setExerciseToDelete(null); };

    const resetForm = () => { setExerciseName(''); setSelectedMuscle('صدر'); setSessions('3'); setRestTime('90'); };

    // Add/Edit handlers
    const handleOpenAddModal = () => { resetForm(); setEditingExercise(null); setShowAddModal(true); };
    const handleOpenEditModal = (exercise: Exercise) => { setEditingExercise(exercise); setExerciseName(exercise.name); setSelectedMuscle(exercise.muscle); setSessions(String(exercise.sessions)); setRestTime(String(exercise.restTime)); setShowEditModal(true); };

    const handleSave = () => {
        if (!exerciseName.trim()) { Alert.alert('خطأ','يرجى إدخال اسم التمرين'); return; }
        const exerciseData = { name: exerciseName.trim(), muscle: selectedMuscle, sessions: parseInt(sessions) || 3, restTime: parseInt(restTime) || 90 };

        if (editingExercise) {
            updateExercise(editingExercise.id, exerciseData);
        } else {
            addExercise(exerciseData);
        }
        setShowAddModal(false); setShowEditModal(false); setEditingExercise(null);
    };

    const handleSelectFromLibrary = (template: ExerciseTemplate) => { setExerciseName(template.name); setSelectedMuscle(template.muscle); setShowExerciseLibrary(false); };
    const filteredLibraryExercises = searchQuery.trim() ? Object.values(EXERCISE_DATABASE).flat().filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || ex.muscle.includes(searchQuery)) : EXERCISE_DATABASE[selectedMuscle as keyof typeof EXERCISE_DATABASE] || [];

    const renderExerciseForm = (isEditing: boolean) => (
        <>
            <View style={styles.inputContainer}><Text style={styles.inputLabel}>اسم التمرين</Text><View style={styles.inputWithButton}><TextInput style={styles.inputFlex} value={exerciseName} onChangeText={setExerciseName} placeholder="مثال: تمرين الضغط" /><TouchableOpacity style={[styles.libraryButton, { backgroundColor: settings.primaryColor }]} onPress={() => setShowExerciseLibrary(true)}><Dumbbell size={16} color="white" /></TouchableOpacity></View></View>
            <View style={styles.inputContainer}><Text style={styles.inputLabel}>المجموعة العضلية</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleSelector}>{MUSCLE_GROUPS.map((muscle) => (<TouchableOpacity key={muscle} style={[styles.muscleButton, selectedMuscle === muscle && styles.selectedMuscleButton]} onPress={() => setSelectedMuscle(muscle)}><Text style={[styles.muscleButtonText, selectedMuscle === muscle && styles.selectedMuscleButtonText]}>{muscle}</Text></TouchableOpacity>))}</ScrollView></View>
            <View style={styles.inputRow}><View style={styles.halfInputContainer}><Text style={styles.inputLabel}>عدد الجلسات</Text><TextInput style={styles.input} value={sessions} onChangeText={setSessions} keyboardType="numeric" placeholder="3" /></View><View style={styles.halfInputContainer}><Text style={styles.inputLabel}>وقت الراحة (ثانية)</Text><TextInput style={styles.input} value={restTime} onChangeText={setRestTime} keyboardType="numeric" placeholder="90" /></View></View>
            <View style={styles.modalButtons}><TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setShowAddModal(false); setShowEditModal(false); }}><Text style={styles.cancelButtonText}>إلغاء</Text></TouchableOpacity><TouchableOpacity style={[styles.modalButton, { backgroundColor: settings.primaryColor }]} onPress={handleSave}><Text style={styles.confirmButtonText}>{isEditing ? 'حفظ التعديلات' : 'إضافة'}</Text></TouchableOpacity></View>
        </>
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

type ViewType = 'exercises' | 'analytics' | 'plans';

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { settings } = useFitnessStore();
  const [activeView, setActiveView] = useState<ViewType>('exercises');

  const renderContent = () => {
    switch (activeView) {
      case 'exercises': return <ExercisesView />;
      case 'analytics': return <AnalyticsView />;
      case 'plans': return <PlansView />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}><Text style={styles.title}>المكتبة</Text></View>
      <View style={styles.switcherContainer}>
        <TouchableOpacity style={[styles.switchButton, activeView === 'exercises' && { backgroundColor: settings.primaryColor }]} onPress={() => setActiveView('exercises')}><Text style={[styles.switchButtonText, activeView === 'exercises' && styles.activeSwitchButtonText]}>التمارين</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.switchButton, activeView === 'analytics' && { backgroundColor: settings.primaryColor }]} onPress={() => setActiveView('analytics')}><Text style={[styles.switchButtonText, activeView === 'analytics' && styles.activeSwitchButtonText]}>التحليلات</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.switchButton, activeView === 'plans' && { backgroundColor: settings.primaryColor }]} onPress={() => setActiveView('plans')}><Text style={[styles.switchButtonText, activeView === 'plans' && styles.activeSwitchButtonText]}>الخطط</Text></TouchableOpacity>
      </View>
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
});