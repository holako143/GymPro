import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Plus, Edit, Trash2, X, Dumbbell, Search } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import { MUSCLE_GROUPS } from '@/types/fitness';
import { EXERCISE_DATABASE, getDifficultyLabel, getEquipmentLabel, ExerciseTemplate } from '@/constants/exerciseDatabase';

export default function ExercisesScreen() {
  const insets = useSafeAreaInsets();
  const { exercises, deleteExercise, addExercise, settings } = useFitnessStore();
  const [selectedExercises, setSelectedExercises] = useState<Set<number>>(new Set());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showExerciseLibrary, setShowExerciseLibrary] = useState<boolean>(false);
  const [exerciseName, setExerciseName] = useState<string>('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('صدر');
  const [sessions, setSessions] = useState<string>('3');
  const [restTime, setRestTime] = useState<string>('90');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteModalType, setDeleteModalType] = useState<'single' | 'multiple'>('single');
  const [exerciseToDelete, setExerciseToDelete] = useState<number | null>(null);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getStatusText = (status: string) => {
    const statusMap = {
      'completed': 'تم الإنتهاء',
      'in-progress': 'قيد التنفيذ',
      'resting': 'في الراحة',
      'pending': 'لم يبدأ'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'completed': '#4cc9f0',
      'in-progress': settings.primaryColor,
      'resting': '#7209b7',
      'pending': '#fca311'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  const toggleExerciseSelection = (exerciseId: number) => {
    const newSelected = new Set(selectedExercises);
    if (newSelected.has(exerciseId)) {
      newSelected.delete(exerciseId);
    } else {
      newSelected.add(exerciseId);
    }
    setSelectedExercises(newSelected);
  };

  const selectAllExercises = () => {
    setSelectedExercises(new Set(exercises.map(e => e.id)));
  };

  const deselectAllExercises = () => {
    setSelectedExercises(new Set());
  };

  const deleteSelectedExercises = () => {
    if (selectedExercises.size === 0) {
      setErrorMessage('الرجاء تحديد تمارين للحذف.');
      setShowErrorModal(true);
      return;
    }

    setDeleteModalType('multiple');
    setShowDeleteModal(true);
  };

  const confirmDeleteSelected = () => {
    selectedExercises.forEach(id => deleteExercise(id));
    setSelectedExercises(new Set());
    setShowDeleteModal(false);
  };

  const handleDeleteExercise = (exerciseId: number) => {
    setExerciseToDelete(exerciseId);
    setDeleteModalType('single');
    setShowDeleteModal(true);
  };

  const confirmDeleteSingle = () => {
    if (exerciseToDelete) {
      deleteExercise(exerciseToDelete);
    }
    setShowDeleteModal(false);
    setExerciseToDelete(null);
  };

  const handleAddExercise = () => {
    const trimmedName = exerciseName.trim();
    if (!trimmedName) {
      setErrorMessage('يرجى إدخال اسم التمرين');
      setShowErrorModal(true);
      return;
    }

    if (trimmedName.length > 100) {
      setErrorMessage('اسم التمرين طويل جداً');
      setShowErrorModal(true);
      return;
    }

    const sanitizedMuscle = selectedMuscle.trim();
    if (!sanitizedMuscle) {
      setErrorMessage('يرجى اختيار المجموعة العضلية');
      setShowErrorModal(true);
      return;
    }

    const sessionsNum = parseInt(sessions) || 3;
    const restTimeNum = parseInt(restTime) || 90;

    addExercise({
      name: trimmedName,
      muscle: sanitizedMuscle,
      sessions: sessionsNum,
      restTime: restTimeNum
    });

    setExerciseName('');
    setSelectedMuscle('صدر');
    setSessions('3');
    setRestTime('90');
    setShowAddModal(false);

    setSuccessMessage('تم إضافة التمرين بنجاح!');
    setShowSuccessModal(true);
  };

  const handleSelectFromLibrary = (template: ExerciseTemplate) => {
    setExerciseName(template.name);
    setSelectedMuscle(template.muscle);
    setShowExerciseLibrary(false);
  };

  const filteredExercises = searchQuery.trim() 
    ? Object.entries(EXERCISE_DATABASE).flatMap(([muscle, exercises]) => 
        exercises.filter(ex => 
          ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.muscle.includes(searchQuery)
        )
      )
    : EXERCISE_DATABASE[selectedMuscle] || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>قائمة التمارين</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, styles.secondaryButton]}
          onPress={selectAllExercises}
        >
          <Text style={styles.controlButtonText}>تحديد الكل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.secondaryButton]}
          onPress={deselectAllExercises}
        >
          <Text style={styles.controlButtonText}>إلغاء التحديد</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.dangerButton]}
          onPress={deleteSelectedExercises}
        >
          <Text style={styles.controlButtonText}>حذف المحدد</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد تمارين مضافة بعد</Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseItem,
                selectedExercises.has(exercise.id) && styles.selectedExerciseItem,
                { borderLeftColor: getStatusColor(exercise.status) }
              ]}
              onPress={() => toggleExerciseSelection(exercise.id)}
            >
              <View style={styles.exerciseContent}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.muscle} - {exercise.sessions} جلسات
                  </Text>
                  <Text style={[styles.exerciseStatus, { color: getStatusColor(exercise.status) }]}>
                    {getStatusText(exercise.status)}
                  </Text>
                </View>

                <View style={styles.exerciseActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: settings.primaryColor }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      console.log('Edit exercise:', exercise.id);
                    }}
                  >
                    <Edit size={16} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteExercise(exercise.id);
                    }}
                  >
                    <Trash2 size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {selectedExercises.has(exercise.id) && (
                <View style={styles.selectionIndicator} />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add Exercise Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: settings.primaryColor }]}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={20} color="white" />
        <Text style={styles.addButtonText}>إضافة تمرين جديد</Text>
      </TouchableOpacity>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إضافة تمرين جديد</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>اسم التمرين</Text>
              <View style={styles.inputWithButton}>
                <TextInput
                  style={styles.inputFlex}
                  value={exerciseName}
                  onChangeText={setExerciseName}
                  placeholder="مثال: تمرين الضغط"
                />
                <TouchableOpacity
                  style={[styles.libraryButton, { backgroundColor: settings.primaryColor }]}
                  onPress={() => setShowExerciseLibrary(true)}
                >
                  <Dumbbell size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>المجموعة العضلية</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleSelector}>
                {MUSCLE_GROUPS.map((muscle) => {
                  const sanitizedMuscle = muscle.trim();
                  if (!sanitizedMuscle || sanitizedMuscle.length > 50) return null;
                  
                  return (
                    <TouchableOpacity
                      key={muscle}
                      style={[
                        styles.muscleButton,
                        selectedMuscle === muscle && styles.selectedMuscleButton
                      ]}
                      onPress={() => {
                        const validatedMuscle = muscle.trim();
                        if (validatedMuscle && validatedMuscle.length <= 50) {
                          setSelectedMuscle(validatedMuscle);
                        }
                      }}
                    >
                      <Text style={[
                        styles.muscleButtonText,
                        selectedMuscle === muscle && styles.selectedMuscleButtonText
                      ]}>
                        {muscle}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.inputLabel}>عدد الجلسات</Text>
                <TextInput
                  style={styles.input}
                  value={sessions}
                  onChangeText={setSessions}
                  keyboardType="numeric"
                  placeholder="3"
                />
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.inputLabel}>وقت الراحة (ثانية)</Text>
                <TextInput
                  style={styles.input}
                  value={restTime}
                  onChangeText={setRestTime}
                  keyboardType="numeric"
                  placeholder="90"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: settings.primaryColor }]}
                onPress={handleAddExercise}
              >
                <Text style={styles.confirmButtonText}>إضافة</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exercise Library Modal */}
      <Modal
        visible={showExerciseLibrary}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExerciseLibrary(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.libraryModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>مكتبة التمارين</Text>
              <TouchableOpacity onPress={() => setShowExerciseLibrary(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={18} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="ابحث عن تمرين..."
                placeholderTextColor="#9ca3af"
              />
            </View>

            {/* Muscle Group Tabs */}
            {!searchQuery.trim() && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleTabsContainer}>
                {MUSCLE_GROUPS.map((muscle) => (
                  <TouchableOpacity
                    key={muscle}
                    style={[
                      styles.muscleTab,
                      selectedMuscle === muscle && [styles.selectedMuscleTab, { backgroundColor: settings.primaryColor }]
                    ]}
                    onPress={() => setSelectedMuscle(muscle)}
                  >
                    <Text style={[
                      styles.muscleTabText,
                      selectedMuscle === muscle && styles.selectedMuscleTabText
                    ]}>
                      {muscle}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Exercise List */}
            <ScrollView style={styles.libraryScrollView} showsVerticalScrollIndicator={false}>
              {filteredExercises.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.libraryExerciseItem}
                  onPress={() => handleSelectFromLibrary(template)}
                >
                  <View style={styles.libraryExerciseImagePlaceholder}>
                    <Dumbbell size={24} color={settings.primaryColor} />
                  </View>
                  <View style={styles.libraryExerciseInfo}>
                    <Text style={styles.libraryExerciseName}>{template.name}</Text>
                    <Text style={styles.libraryExerciseNameEn}>{template.nameEn}</Text>
                    <Text style={styles.libraryExerciseDescription}>{template.description}</Text>
                    <View style={styles.libraryExerciseMeta}>
                      <View style={styles.libraryMetaItem}>
                        <Text style={styles.libraryMetaLabel}>المستوى:</Text>
                        <Text style={styles.libraryMetaValue}>{getDifficultyLabel(template.difficulty)}</Text>
                      </View>
                      <View style={styles.libraryMetaItem}>
                        <Text style={styles.libraryMetaLabel}>المعدات:</Text>
                        <Text style={styles.libraryMetaValue}>{getEquipmentLabel(template.equipment)}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              تأكيد الحذف
            </Text>
            <Text style={styles.modalMessage}>
              {deleteModalType === 'multiple'
                ? `هل أنت متأكد من حذف ${selectedExercises.size} تمرين محدد؟`
                : 'هل أنت متأكد من حذف هذا التمرين؟'
              }
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.dangerButton]}
                onPress={deleteModalType === 'multiple' ? confirmDeleteSelected : confirmDeleteSingle}
              >
                <Text style={styles.confirmButtonText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>خطأ</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: settings.primaryColor }]}
              onPress={() => setShowErrorModal(false)}
            >
              <Text style={styles.confirmButtonText}>موافق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>نجح</Text>
            <Text style={styles.modalMessage}>{successMessage}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: settings.primaryColor }]}
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={styles.confirmButtonText}>موافق</Text>
            </TouchableOpacity>
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
    fontWeight: 'bold' as const,
    color: '#212529',
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  dangerButton: {
    backgroundColor: '#e63946',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  exerciseItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 5,
    position: 'relative',
  },
  selectedExerciseItem: {
    backgroundColor: '#e6f7ff',
  },
  exerciseContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#212529',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  exerciseStatus: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#e63946',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4cc9f0',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  libraryModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  inputWithButton: {
    flexDirection: 'row',
    gap: 8,
  },
  inputFlex: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  libraryButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muscleSelector: {
    maxHeight: 50,
  },
  muscleButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedMuscleButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  muscleButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6b7280',
  },
  selectedMuscleButtonText: {
    color: 'white',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfInputContainer: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600' as const,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600' as const,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  muscleTabsContainer: {
    marginBottom: 16,
    maxHeight: 50,
  },
  muscleTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedMuscleTab: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  muscleTabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6b7280',
  },
  selectedMuscleTabText: {
    color: 'white',
  },
  libraryScrollView: {
    flex: 1,
  },
  libraryExerciseItem: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  libraryExerciseImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryExerciseInfo: {
    flex: 1,
  },
  libraryExerciseName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#111827',
    marginBottom: 2,
  },
  libraryExerciseNameEn: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  libraryExerciseDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
    lineHeight: 16,
  },
  libraryExerciseMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  libraryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  libraryMetaLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600' as const,
  },
  libraryMetaValue: {
    fontSize: 10,
    color: '#4b5563',
    fontWeight: '600' as const,
  },
});
