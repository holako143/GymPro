"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';

export const SettingsPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { settings } = state;

    const handleColorChange = (key: string, value: string) => {
        // In a real app, you would dispatch an action to update the settings
        // dispatch({ type: 'UPDATE_SETTINGS', payload: { [key]: value } });
        console.log(`Setting ${key} to ${value}`);
    };

    const handleAudioToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        // dispatch({ type: 'UPDATE_SETTINGS', payload: { restOverdueAudio: e.target.checked } });
        console.log(`Audio toggle to ${e.target.checked}`);
    };

    return (
        <div className="page active" id="settings">
            <div className="container">
                <h2 style={{ margin: '20px 0' }}>الإعدادات</h2>

                <div className="analytics-card">
                    <div className="analytics-title">تخصيص الواجهة</div>
                    <div className="settings-section-title">ألوان التطبيق</div>
                    <div className="form-group color-picker-group">
                        <label className="form-label">اللون الأساسي</label>
                        <input
                            type="color"
                            id="primary-color-picker"
                            value={settings?.primaryColor || '#4361ee'}
                            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                        />
                    </div>
                    <div className="form-group color-picker-group">
                        <label className="form-label">اللون الثانوي</label>
                        <input
                            type="color"
                            id="secondary-color-picker"
                            value={settings?.secondaryColor || '#3f37c9'}
                            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                        />
                    </div>

                    <div className="settings-section-title">تفضيلات الإشعارات</div>
                    <div className="notification-item">
                        <div className="notification-info">
                            <div className="notification-title">تنبيه صوتي لتجاوز الراحة</div>
                        </div>
                        <label className="notification-toggle">
                            <input
                                type="checkbox"
                                id="rest-overdue-audio-toggle"
                                checked={settings?.restOverdueAudio || false}
                                onChange={handleAudioToggle}
                            />
                            <span className="notification-slider"></span>
                        </label>
                    </div>

                    <div className="settings-section-title">وحدات القياس</div>
                    <p style={{ color: 'var(--gray)', fontSize: '0.9em', marginBottom: '10px' }}>تبديل بين كيلوجرام ورطل. (قريباً!)</p>

                     <div className="settings-section-title">إعادة ترتيب التمارين</div>
                     <p style={{ color: 'var(--gray)', fontSize: '0.9em', marginBottom: '10px' }}>القدرة على إعادة ترتيب التمارين داخل خطط التدريب. (قريباً!)</p>
                </div>

                <div className="analytics-card" style={{ marginTop: '15px' }}>
                    <div className="analytics-title">إدارة البيانات</div>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                        <button className="add-exercise-btn" id="export-data-btn" style={{ backgroundColor: 'var(--info)', flex: 1 }}>
                            <i className="fas fa-file-export"></i> تصدير البيانات
                        </button>
                        <input type="file" id="import-file-input" accept=".json" style={{ display: 'none' }} />
                        <button className="add-exercise-btn" id="import-data-btn" style={{ backgroundColor: 'var(--secondary)', flex: 1 }}>
                            <i className="fas fa-file-import"></i> استيراد البيانات
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};