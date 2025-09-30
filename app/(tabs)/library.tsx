import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput, Platform } from 'react-native';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import { Exercise } from '@/types/fitness';
import { Plus, Upload, Download, Pencil, Trash2, X } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ExerciseLibraryScreen() {
  const { exercises, settings, deleteExercise, updateExercise, addExercise, replaceAllExercises } = useFitnessStore();

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState('');

  const handleExport = async () => {
    try {
      const jsonString = JSON.stringify(exercises, null, 2);
      const uri = FileSystem.cacheDirectory + 'my_exercises.json';
      await FileSystem.writeAsStringAsync(uri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/json',
            dialogTitle: 'تصدير مكتبة التمارين',
          });
        } else {
          Alert.alert("خطأ", "المشاركة غير متاحة على هذا الجهاز.");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("خطأ", "فشل تصدير البيانات.");
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const jsonString = await FileSystem.readAsStringAsync(uri);
        const importedExercises = JSON.parse(jsonString);

        // Basic validation
        if (Array.isArray(importedExercises) && importedExercises.every(e => e.id && e.name && e.muscle)) {
          Alert.alert(
            "تأكيد الاستيراد",
            `تم العثور على ${importedExercises.length} تمرين. هل تريد استبدال مكتبتك الحالية؟ سيتم حذف جميع الخطط الحالية.`,
            [
              { text: "إلغاء", style: "cancel" },
              { text: "استيراد", onPress: () => replaceAllExercises(importedExercises), style: "destructive" }
            ]
          );
        } else {
          Alert.alert("خطأ", "ملف JSON غير صالح أو لا يحتوي على البيانات المطلوبة.");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("خطأ", "فشل استيراد البيانات.");
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditModalVisible(true);
  };

  const handleSave = () => {
    if (editingExercise) {
      if (!editingExercise.name.trim() || !editingExercise.muscle.trim()) {
        Alert.alert("خطأ", "الرجاء تعبئة جميع الحقول.");
        return;
      }
      updateExercise(editingExercise.id, {
        name: editingExercise.name,
        muscle: editingExercise.muscle,
      });
      setEditModalVisible(false);
      setEditingExercise(null);
    }
  };

  const handleAddNewExercise = () => {
    if (!newExerciseName.trim() || !newExerciseMuscle.trim()) {
        Alert.alert("خطأ", "الرجاء تعبئة جميع الحقول.");
        return;
    }
    addExercise({
        name: newExerciseName,
        muscle: newExerciseMuscle,
        sessions: 3, // Default values
        restTime: 60, // Default values
    });
    setNewExerciseName('');
    setNewExerciseMuscle('');
    setAddModalVisible(false);
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      `حذف تمرين "${name}"`,
      "هل أنت متأكد؟ سيتم حذف هذا التمرين من جميع خطط التدريب الحالية.",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "حذف", onPress: () => deleteExercise(id), style: "destructive" }
      ]
    );
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseItem}>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        <Text style={styles.exerciseMuscle}>{item.muscle}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(item)}>
          <Pencil size={18} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(item.id, item.name)}>
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>مكتبة التمارين</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleExport}>
            <Download size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleImport}>
            <Upload size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: settings.primaryColor }]} onPress={() => setAddModalVisible(true)}>
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={exercises}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تعديل التمرين</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={editingExercise?.name || ''}
              onChangeText={(text) =>
                setEditingExercise(
                  (prev) => prev && { ...prev, name: text }
                )
              }
              placeholder="اسم التمرين"
            />
            <TextInput
              style={styles.input}
              value={editingExercise?.muscle || ''}
              onChangeText={(text) =>
                setEditingExercise(
                  (prev) => prev && { ...prev, muscle: text }
                )
              }
              placeholder="العضلة المستهدفة"
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: settings.primaryColor }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Add Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>إضافة تمرين جديد</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              placeholder="اسم التمرين (مثال: ضغط البنش)"
            />
            <TextInput
              style={styles.input}
              value={newExerciseMuscle}
              onChangeText={setNewExerciseMuscle}
              placeholder="العضلة المستهدفة (مثال: صدر)"
            />
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: settings.primaryColor }]}
              onPress={handleAddNewExercise}
            >
              <Text style={styles.saveButtonText}>إضافة التمرين</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  listContent: {
    padding: 16,
  },
  exerciseItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  exerciseMuscle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  // Modal Styles
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },
  saveButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});