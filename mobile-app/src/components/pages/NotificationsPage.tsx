"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';

export const NotificationsPage = () => {
    const { state, dispatch } = useAppContext();
    const { notifications } = state;

    // In a real app, this would involve a dispatch call to update the state
    const handleToggle = (id: number) => {
        alert(`تم تبديل الإشعار رقم ${id}. (هذه الميزة للعرض فقط حاليًا)`);
        // Example of how it would work:
        // dispatch({ type: 'TOGGLE_NOTIFICATION', payload: id });
    };

    return (
        <div className="page active" id="notifications">
            <div className="container">
                <h2 style={{ margin: '20px 0' }}>التنبيهات والتذكيرات</h2>

                {notifications.length > 0 ? (
                    <div className="notifications-list">
                        {notifications.map(notification => (
                            <div key={notification.id} className="notification-item">
                                <div className="notification-info">
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-time">{notification.time}</div>
                                </div>
                                <label className="notification-toggle">
                                    <input
                                        type="checkbox"
                                        checked={notification.enabled}
                                        onChange={() => handleToggle(notification.id)}
                                    />
                                    <span className="notification-slider"></span>
                                </label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: 'var(--gray)' }}>لا توجد إشعارات مضافة.</p>
                )}
                 <div className="charts-placeholder" style={{marginTop: '20px'}}>
                    <i className="fas fa-bell-slash"></i>
                    <p>إدارة الإشعارات المتقدمة وإضافة تذكيرات مخصصة ستكون متاحة في التحديثات القادمة.</p>
                </div>
            </div>
        </div>
    );
};