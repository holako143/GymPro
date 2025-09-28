"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';

export const NotificationsPage: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { notifications } = state;

    const handleToggle = (id: number) => {
        // In a real app, you would dispatch an action to toggle the notification
        // dispatch({ type: 'TOGGLE_NOTIFICATION', payload: id });
        console.log(`Toggling notification ${id}`);
    };

    return (
        <div className="page active" id="notifications">
            <div className="container">
                <h2 style={{ margin: '20px 0' }}>التنبيهات والتذكيرات</h2>

                <div className="notifications-list" id="notifications-container">
                    {notifications && notifications.length > 0 ? (
                        notifications.map(notification => (
                            <div key={notification.id} className="notification-item">
                                <div className="notification-info">
                                    <div className="notification-title">{notification.title}</div>
                                    <div className="notification-time">{notification.time} - {notification.days.join('، ')}</div>
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
                        ))
                    ) : (
                        <p>لا توجد تنبيهات مضافة بعد.</p>
                    )}
                </div>
            </div>
        </div>
    );
};