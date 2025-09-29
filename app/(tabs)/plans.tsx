import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Plus, Play, CheckCircle, Edit, Trash2, XCircle, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFitnessStore } from '@/hooks/useFitnessStore';

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const {
    trainingPlans,
    exercises,
    activePlanId,
    activateTrainingPlan,
    deactivateAllPlans,
    deleteTrainingPlan,
    addTrainingPlan,
    updateTrainingPlan,
    settings
  } = useFitnessStore();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planName, setPlanName] = useState<string>('');
  const [planDescription, setPlanDescription] = useState<string>('');
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);

  const handleActivatePlan = (planId: number) => {
    if (activePlanId === planId) {
      if (Platform.OS === 'web') {
        if (confirm('هل تريد إلغاء تفعيل هذه الخطة؟')) {
          deactivateAllPlans();
        }
      } else {
        Alert.alert(
          'إلغاء التفعيل',
          'هل تريد إلغاء تفعيل هذه الخطة؟',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'نعم', onPress: () => deactivateAllPlans() }
          ]
        );
      }
    } else {
      if (Platform.OS === 'web') {
        if (confirm('هل تريد تفعيل هذه الخطة؟ سيتم إعادة تعيين جميع التمارين.')) {
          activateTrainingPlan(planId);
        }
      } else {
        Alert.alert(
          'تفعيل الخطة',
          'هل تريد تفعيل هذه الخطة؟ سيتم إعادة تعيين جميع التمارين.',
          [
            { text: 'إلغاء', style: 'cancel' },
            { text: 'نعم', onPress: () => activateTrainingPlan(planId) }
          ]
        );
      }
    }
  };

  const handleDeletePlan = (planId: number) => {
    if (Platform.OS === 'web') {
      if (confirm('هل أنت متأكد من حذف خطة التدريب هذه؟')) {
        deleteTrainingPlan(planId);
      }
    } else {
      Alert.alert(
        'حذف الخطة',
        'هل أنت متأكد من حذف خطة التدريب هذه؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'حذف', style: 'destructive', onPress: () => deleteTrainingPlan(planId) }
        ]
      );
    }
  };

  const handleEditPlan = (planId: number) => {
    const plan = trainingPlans.find(p => p.id === planId);
    if (plan) {
      setEditingPlanId(planId);
      setPlanName(plan.name);
      setPlanDescription(plan.description);
      setSelectedExercises(plan.exercises);
      setShowEditModal(true);
    }
  };

  const handleAddPlan = () => {
    if (!planName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الخطة');
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert('خطأ', 'يرجى اختيار تمرين واحد على الأقل');
      return;
    }

    addTrainingPlan({
      name: planName.trim(),
      description: planDescription.trim() || 'خطة تدريب مخصصة',
      exercises: selectedExercises,
      active: false
    });

    setPlanName('');
    setPlanDescription('');
    setSelectedExercises([]);
    setShowAddModal(false);
  };

  const handleUpdatePlan = () => {
    if (!editingPlanId) return;
    if (!planName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم الخطة');
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert('خطأ', 'يرجى اختيار تمرين واحد على الأقل');
      return;
    }

    updateTrainingPlan(editingPlanId, {
      name: planName.trim(),
      description: planDescription.trim() || 'خطة تدريب مخصصة',
      exercises: selectedExercises
    });

    setPlanName('');
    setPlanDescription('');
    setSelectedExercises([]);
    setEditingPlanId(null);
    setShowEditModal(false);
  };

  const toggleExerciseSelection = (exerciseId: number) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const getExerciseNames = (exerciseIds: number[]) => {
    return exerciseIds
      .map(id => exercises.find(e => e.id === id)?.name)
      .filter(Boolean);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>خطط التدريب</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {trainingPlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد خطط تدريب مضافة بعد</Text>
          </View>
        ) : (
          trainingPlans.map((plan) => {
            const isActive = activePlanId === plan.id;
            const exerciseNames = getExerciseNames(plan.exercises);

            return (
              <View key={plan.id} style={styles.planCard}>
                {/* Header */}
                <View style={styles.planHeader}>
                  <View style={styles.planTitleContainer}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    {isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>مفعلة</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.planActions}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        { backgroundColor: isActive ? '#4cc9f0' : settings.primaryColor }
                      ]}
                      onPress={() => handleActivatePlan(plan.id)}
                    >
                      {isActive ? (
                        <CheckCircle size={18} color="white" />
                      ) : (
                        <Play size={18} color="white" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: settings.primaryColor }]}
                      onPress={() => handleEditPlan(plan.id)}
                    >
                      <Edit size={18} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.planDescription}>{plan.description}</Text>

                {/* Exercises */}
                <View style={styles.exercisesContainer}>
                  {exerciseNames.length > 0 ? (
                    exerciseNames.map((exerciseName, index) => (
                      <View key={`${plan.id}-exercise-${index}`} style={styles.exerciseItem}>
                        <Text style={styles.exerciseText}>{exerciseName}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noExercisesText}>
                      لا توجد تمارين في هذه الخطة
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* Deactivate Button */}
        {activePlanId !== null && (
          <TouchableOpacity
            style={[styles.deactivateButton, styles.dangerButton]}
            onPress={() => {
              if (Platform.OS === 'web') {
                if (confirm('هل تريد إلغاء تفعيل الخطة الحالية؟')) {
                  deactivateAllPlans();
                }
              } else {
                Alert.alert(
                  'إلغاء التفعيل',
                  'هل تريد إلغاء تفعيل الخطة الحالية؟',
                  [
                    { text: 'إلغاء', style: 'cancel' },
                    { text: 'نعم', onPress: () => deactivateAllPlans() }
                  ]
                );
              }
            }}
          >
            <XCircle size={20} color="white" />
            <Text style={styles.deactivateButtonText}>إلغاء تفعيل الخطة الحالية</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add Plan Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: settings.primaryColor }]}
        onPress={() => setShowAddModal(true)}
      >
        <Plus size={20} color="white" />
        <Text style={styles.addButtonText}>إنشاء خطة تدريب جديدة</Text>
      </TouchableOpacity>

      {/* Add Plan Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إنشاء خطة تدريب جديدة</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>اسم الخطة</Text>
              <TextInput
                style={styles.input}
                value={planName}
                onChangeText={setPlanName}
                placeholder="مثال: خطة المبتدئين"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={planDescription}
                onChangeText={setPlanDescription}
                placeholder="وصف الخطة..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>اختر التمارين ({selectedExercises.length})</Text>
              <ScrollView style={styles.exercisesList}>
                {exercises.map(exercise => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      styles.exerciseSelectItem,
                      selectedExercises.includes(exercise.id) && styles.exerciseSelectItemSelected
                    ]}
                    onPress={() => toggleExerciseSelection(exercise.id)}
                  >
                    <View style={styles.exerciseSelectInfo}>
                      <Text style={styles.exerciseSelectName}>{exercise.name}</Text>
                      <Text style={styles.exerciseSelectMuscle}>{exercise.muscle}</Text>
                    </View>
                    {selectedExercises.includes(exercise.id) && (
                      <CheckCircle size={20} color={settings.primaryColor} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
                onPress={handleAddPlan}
              >
                <Text style={styles.confirmButtonText}>إنشاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تعديل خطة التدريب</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>اسم الخطة</Text>
              <TextInput
                style={styles.input}
                value={planName}
                onChangeText={setPlanName}
                placeholder="مثال: خطة المبتدئين"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>الوصف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={planDescription}
                onChangeText={setPlanDescription}
                placeholder="وصف الخطة..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>اختر التمارين ({selectedExercises.length})</Text>
              <ScrollView style={styles.exercisesList}>
                {exercises.map(exercise => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      styles.exerciseSelectItem,
                      selectedExercises.includes(exercise.id) && styles.exerciseSelectItemSelected
                    ]}
                    onPress={() => toggleExerciseSelection(exercise.id)}
                  >
                    <View style={styles.exerciseSelectInfo}>
                      <Text style={styles.exerciseSelectName}>{exercise.name}</Text>
                      <Text style={styles.exerciseSelectMuscle}>{exercise.muscle}</Text>
                    </View>
                    {selectedExercises.includes(exercise.id) && (
                      <CheckCircle size={20} color={settings.primaryColor} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: settings.primaryColor }]}
                onPress={handleUpdatePlan}
              >
                <Text style={styles.confirmButtonText}>حفظ</Text>
              </TouchableOpacity>
            </View>
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
  planCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  activeBadge: {
    backgroundColor: '#4cc9f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  activeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#e63946',
  },
  planDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 15,
    lineHeight: 20,
  },
  exercisesContainer: {
    marginTop: 10,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  exerciseText: {
    fontSize: 14,
    color: '#212529',
  },
  noExercisesText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    gap: 8,
  },
  dangerButton: {
    backgroundColor: '#e63946',
  },
  deactivateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  exercisesList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  exerciseSelectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  exerciseSelectItemSelected: {
    backgroundColor: '#eff6ff',
  },
  exerciseSelectInfo: {
    flex: 1,
  },
  exerciseSelectName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  exerciseSelectMuscle: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
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
});
