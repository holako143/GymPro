"use client";
import React from 'react';
import { useAppContext } from '@/context/AppContext';
import { formatTime } from '@/utils/formatters';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const SessionDetailsModal = () => {
    const { state, dispatch } = useAppContext();
    const { isModalOpen, modalContext, exercises, sessionHistory } = state;

    const handleClose = () => {
        dispatch({ type: 'OPEN_MODAL', payload: { modal: 'sessionDetails', isOpen: false } });
    };

    if (!isModalOpen.sessionDetails) return null;

    const { exerciseId, sessionNumber } = modalContext;
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const historyItem = sessionHistory.find(h => h.exerciseId === exerciseId && h.sessionNumber === sessionNumber);

    if (!exercise || !historyItem) {
        return (
             <div className="modal active">
                <div className="modal-content">
                    <p>لا يمكن العثور على تفاصيل الجلسة.</p>
                    <button onClick={handleClose}>إغلاق</button>
                </div>
            </div>
        );
    }

    const session = historyItem.data;
    const sessionDate = new Date(session.date);
    const formattedDate = format(sessionDate, "d MMMM yyyy", { locale: ar });
    const formattedTime = format(sessionDate, "p", { locale: ar });

    const difficultyLabels = { 'very-easy': 'سهل جداً', 'easy': 'سهل', 'medium': 'متوسط', 'hard': 'ثقيل', 'very-hard': 'ثقيل جداً' };
    const difficultyEmojis = { 'very-easy': '😊', 'easy': '🙂', 'medium': '😐', 'hard': '😟', 'very-hard': '😫' };

    return (
        <div className="modal active" id="session-details-modal">
            <div className="modal-content session-detail-modal-content">
                <div className="modal-header">
                    <div className="modal-title" id="session-details-title">تفاصيل الجلسة</div>
                    <button className="modal-close" id="session-details-close" onClick={handleClose}>&times;</button>
                </div>
                <div id="session-details-content">
                     <h3>{exercise.name} - الجلسة {sessionNumber}</h3>
                    <p><strong>التاريخ:</strong> {formattedDate} في {formattedTime}</p>
                    <p><strong>مدة التمرين:</strong> {formatTime(session.duration)}</p>
                    <p><strong>الوزن المستخدم:</strong> {session.weight} كجم</p>
                    <p><strong>عدد العدات:</strong> {session.reps}</p>
                    <p><strong>الحجم التدريبي:</strong> {session.volume || 0} كجم</p>
                    <p><strong>أقصى 1RM تقديري:</strong> {session.oneRM || 0} كجم</p>
                    <div className={`difficulty-info ${session.difficulty}`}>
                        <span className="difficulty-emoji-large">{difficultyEmojis[session.difficulty]}</span>
                        <span className="difficulty-label">الصعوبة: {difficultyLabels[session.difficulty]}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};