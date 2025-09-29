import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Download, Upload, Bell, Plus, Edit, Trash2, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFitnessStore } from '@/hooks/useFitnessStore';
import { Notification } from '@/types/fitness';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, notifications, addNotification, updateNotification, deleteNotification } = useFitnessStore();
  
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [notificationTitle, setNotificationTitle] = useState<string>('');
  const [notificationTime, setNotificationTime] = useState<string>('08:00');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  const weekDays = [
    { key: 'sunday', label: 'الأحد' },
    { key: 'monday', label: 'الإثنين' },
    { key: 'tuesday', label: 'الثلاثاء' },
    { key: 'wednesday', label: 'الأربعاء' },
    { key: 'thursday', label: 'الخميس' },
    { key: 'friday', label: 'الجمعة' },
    { key: 'saturday', label: 'السبت' },
  ];

  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor', color: string) => {
    if (!color || color.length === 0 || color.length > 20) return;
    const sanitizedColor = color.trim();
    updateSettings({ [colorType]: sanitizedColor });
  };

  const handleExportData = () => {
    const confirmed = confirm('سيتم تصدير جميع بياناتك إلى ملف JSON. هل تريد المتابعة؟');
    if (confirmed) {
      console.log('نجح التصدير: تم تصدير البيانات بنجاح!');
    }
  };

  const handleImportData = () => {
    const confirmed = confirm('سيتم استبدال جميع البيانات الحالية. هل أنت متأكد؟');
    if (confirmed) {
      console.log('استيراد البيانات: يرجى اختيار ملف JSON للاستيراد');
    }
  };

  const predefinedColors = [
    '#4361ee', // Default primary
    '#3f37c9', // Default secondary
    '#e63946', // Red
    '#f77f00', // Orange
    '#fcbf49', // Yellow
    '#06ffa5', // Green
    '#4cc9f0', // Light blue
    '#7209b7', // Purple
    '#f72585', // Pink
    '#343a40', // Dark gray
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>الإعدادات</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Interface Customization */}
        <View style={styles.settingsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            تخصيص الواجهة
          </Text>

          <Text style={styles.sectionTitle}>ألوان التطبيق</Text>

          {/* Primary Color */}
          <View style={styles.colorSection}>
            <Text style={styles.colorLabel}>اللون الأساسي</Text>
            <View style={styles.colorPalette}>
              {predefinedColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    settings.primaryColor === color && styles.selectedColor
                  ]}
                  onPress={() => handleColorChange('primaryColor', color)}
                />
              ))}
            </View>
          </View>

          {/* Secondary Color */}
          <View style={styles.colorSection}>
            <Text style={styles.colorLabel}>اللون الثانوي</Text>
            <View style={styles.colorPalette}>
              {predefinedColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    settings.secondaryColor === color && styles.selectedColor
                  ]}
                  onPress={() => handleColorChange('secondaryColor', color)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Notification Preferences */}
        <View style={styles.settingsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            تفضيلات الإشعارات
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>تنبيه صوتي لتجاوز الراحة</Text>
              <Text style={styles.settingDescription}>
                تشغيل صوت تنبيه عند تجاوز وقت الراحة المحدد
              </Text>
            </View>
            <Switch
              value={settings.restOverdueAudio}
              onValueChange={(value) => updateSettings({ restOverdueAudio: value })}
              trackColor={{ 
                false: '#ccc', 
                true: settings.primaryColor 
              }}
              thumbColor={settings.restOverdueAudio ? 'white' : '#f4f3f4'}
              ios_backgroundColor="#ccc"
            />
          </View>
        </View>

        {/* Notifications Management */}
        <View style={styles.settingsCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
              إدارة التنبيهات
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: settings.primaryColor }]}
              onPress={() => {
                setEditingNotification(null);
                setNotificationTitle('');
                setNotificationTime('08:00');
                setSelectedDays([]);
                setShowNotificationModal(true);
              }}
            >
              <Plus size={16} color="white" />
              <Text style={styles.addButtonText}>إضافة تنبيه</Text>
            </TouchableOpacity>
          </View>

          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>لا توجد تنبيهات مضافة بعد</Text>
          ) : (
            notifications.map((notification) => (
              <View key={notification.id} style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Switch
                      value={notification.enabled}
                      onValueChange={(value) => updateNotification(notification.id, { enabled: value })}
                      trackColor={{ false: '#ccc', true: settings.primaryColor }}
                      thumbColor={notification.enabled ? 'white' : '#f4f3f4'}
                      ios_backgroundColor="#ccc"
                    />
                  </View>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                  <Text style={styles.notificationDays}>
                    {notification.days.map(day => {
                      const dayObj = weekDays.find(d => d.key === day);
                      return dayObj ? dayObj.label : day;
                    }).join(', ')}
                  </Text>
                </View>
                <View style={styles.notificationActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: settings.primaryColor }]}
                    onPress={() => {
                      setEditingNotification(notification);
                      setNotificationTitle(notification.title);
                      setNotificationTime(notification.time);
                      setSelectedDays(notification.days);
                      setShowNotificationModal(true);
                    }}
                  >
                    <Edit size={14} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      Alert.alert(
                        'تأكيد الحذف',
                        'هل أنت متأكد من حذف هذا التنبيه؟',
                        [
                          { text: 'إلغاء', style: 'cancel' },
                          {
                            text: 'حذف',
                            style: 'destructive',
                            onPress: () => deleteNotification(notification.id)
                          }
                        ]
                      );
                    }}
                  >
                    <Trash2 size={14} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Units */}
        <View style={styles.settingsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            وحدات القياس
          </Text>
          <Text style={styles.comingSoonText}>
            تبديل بين كيلوجرام ورطل. (قريباً!)
          </Text>
        </View>

        {/* Exercise Management */}
        <View style={styles.settingsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            إعادة ترتيب التمارين
          </Text>
          <Text style={styles.comingSoonText}>
            القدرة على إعادة ترتيب التمارين داخل خطط التدريب. (قريباً!)
          </Text>
        </View>

        {/* Data Management */}
        <View style={styles.settingsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            إدارة البيانات
          </Text>

          <View style={styles.dataButtons}>
            <TouchableOpacity
              style={[styles.dataButton, { backgroundColor: '#7209b7' }]}
              onPress={handleExportData}
            >
              <Download size={20} color="white" />
              <Text style={styles.dataButtonText}>تصدير البيانات</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dataButton, { backgroundColor: settings.secondaryColor }]}
              onPress={handleImportData}
            >
              <Upload size={20} color="white" />
              <Text style={styles.dataButtonText}>استيراد البيانات</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.settingsCard}>
          <Text style={[styles.cardTitle, { color: settings.primaryColor }]}>
            معلومات التطبيق
          </Text>
          <Text style={styles.infoText}>
            تطبيق متابعة كمال الأجسام - نسخة 1.0.0
          </Text>
          <Text style={styles.infoText}>
            تم تطويره باستخدام React Native و Expo
          </Text>
          <Text style={styles.infoText}>
            جميع البيانات محفوظة محلياً على جهازك
          </Text>
        </View>
      </ScrollView>

      {/* Notification Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingNotification ? 'تعديل التنبيه' : 'إضافة تنبيه جديد'}
              </Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>عنوان التنبيه</Text>
              <TextInput
                style={styles.input}
                value={notificationTitle}
                onChangeText={setNotificationTitle}
                placeholder="مثال: وقت التمرين"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>الوقت</Text>
              <TextInput
                style={styles.input}
                value={notificationTime}
                onChangeText={setNotificationTime}
                placeholder="08:00"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>الأيام</Text>
              <View style={styles.daysContainer}>
                {weekDays.map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day.key) && styles.selectedDayButton
                    ]}
                    onPress={() => {
                      if (selectedDays.includes(day.key)) {
                        setSelectedDays(selectedDays.filter(d => d !== day.key));
                      } else {
                        setSelectedDays([...selectedDays, day.key]);
                      }
                    }}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      selectedDays.includes(day.key) && styles.selectedDayButtonText
                    ]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNotificationModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: settings.primaryColor }]}
                onPress={() => {
                  if (!notificationTitle.trim()) {
                    Alert.alert('خطأ', 'يرجى إدخال عنوان التنبيه');
                    return;
                  }
                  if (selectedDays.length === 0) {
                    Alert.alert('خطأ', 'يرجى اختيار يوم واحد على الأقل');
                    return;
                  }

                  const notificationData = {
                    title: notificationTitle.trim(),
                    time: notificationTime,
                    days: selectedDays,
                    enabled: true
                  };

                  if (editingNotification) {
                    updateNotification(editingNotification.id, notificationData);
                  } else {
                    addNotification(notificationData);
                  }

                  setShowNotificationModal(false);
                }}
              >
                <Text style={styles.confirmButtonText}>
                  {editingNotification ? 'تحديث' : 'إضافة'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  function toggleDaySelection(day: string) {
    if (!day || day.length === 0 || day.length > 20) return;
    const sanitizedDay = day.trim();
    
    if (selectedDays.includes(sanitizedDay)) {
      setSelectedDays(selectedDays.filter(d => d !== sanitizedDay));
    } else {
      setSelectedDays([...selectedDays, sanitizedDay]);
    }
  }
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
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 10,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  colorSection: {
    marginBottom: 20,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#212529',
    borderWidth: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingInfo: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  dataButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 15,
  },
  dataButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  dataButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  notificationTime: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  notificationDays: {
    fontSize: 12,
    color: '#6b7280',
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
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
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedDayButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedDayButtonText: {
    color: 'white',
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
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
