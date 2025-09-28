"use client";
import React, { useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { AnalyticsCard } from '../analytics/AnalyticsCard';

export const SettingsPage = () => {
    const { state, dispatch } = useAppContext();
    const { settings } = state;
    const importFileInputRef = useRef<HTMLInputElement>(null);

    const handleSettingChange = (key: string, value: any) => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
    };

    const handleExport = () => {
        try {
            const stateToSave = { ...state };
            // Remove non-serializable parts from the state
            delete stateToSave.isModalOpen;
            delete stateToSave.modalContext;
            delete stateToSave.sessionStartTime;

            const dataStr = JSON.stringify(stateToSave, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "fitness_app_backup.json";
            a.click();
            URL.revokeObjectURL(url);
            alert("تم تصدير البيانات بنجاح!");
        } catch (error) {
            console.error("Failed to export data:", error);
            alert("حدث خطأ أثناء تصدير البيانات.");
        }
    };

    const handleImportClick = () => {
        importFileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                    const importedState = JSON.parse(text);
                    // Basic validation
                    if (importedState.exercises && importedState.settings) {
                        dispatch({ type: 'SET_INITIAL_STATE', payload: importedState });
                        alert("تم استيراد البيانات بنجاح! سيتم إعادة تحميل التطبيق.");
                        // Optionally force a reload to ensure all components reset correctly
                        window.location.reload();
                    } else {
                        throw new Error("Invalid file format");
                    }
                }
            } catch (error) {
                console.error("Failed to import data:", error);
                alert("فشل استيراد البيانات. يرجى التأكد من أن الملف صحيح.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="page active" id="settings">
            <div className="container">
                <h2 style={{ margin: '20px 0' }}>الإعدادات</h2>

                <AnalyticsCard title="تخصيص الواجهة">
                    <div className="settings-section-title">ألوان التطبيق</div>
                    <div className="form-group color-picker-group">
                        <label className="form-label">اللون الأساسي</label>
                        <input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                        />
                    </div>
                    <div className="form-group color-picker-group">
                        <label className="form-label">اللون الثانوي</label>
                        <input
                            type="color"
                            value={settings.secondaryColor}
                            onChange={(e) => handleSettingChange('secondaryColor', e.target.value)}
                        />
                    </div>
                </AnalyticsCard>

                <AnalyticsCard title="تفضيلات الإشعارات">
                     <div className="notification-item">
                        <div className="notification-info">
                            <div className="notification-title">تنبيه صوتي لتجاوز الراحة</div>
                        </div>
                        <label className="notification-toggle">
                            <input
                                type="checkbox"
                                checked={settings.restOverdueAudio}
                                onChange={(e) => handleSettingChange('restOverdueAudio', e.target.checked)}
                            />
                            <span className="notification-slider"></span>
                        </label>
                    </div>
                </AnalyticsCard>

                <AnalyticsCard title="إدارة البيانات">
                    <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                        <button onClick={handleExport} className="add-exercise-btn" style={{ backgroundColor: 'var(--info)', flex: 1 }}>
                            <i className="fas fa-file-export"></i> تصدير البيانات
                        </button>
                        <input
                            type="file"
                            ref={importFileInputRef}
                            onChange={handleFileImport}
                            accept=".json"
                            style={{ display: 'none' }}
                        />
                        <button onClick={handleImportClick} className="add-exercise-btn" style={{ backgroundColor: 'var(--secondary)', flex: 1 }}>
                            <i className="fas fa-file-import"></i> استيراد البيانات
                        </button>
                    </div>
                </AnalyticsCard>
            </div>
        </div>
    );
};