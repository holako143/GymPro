"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext, Exercise } from '@/context/AppContext';

export const SessionFinishModal: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { isModalOpen, exercises, modalContext } = state;

    const exerciseToFinish = exercises.find(ex => ex.id === modalContext.exerciseId);

    const [weight, setWeight] = useState(20);
    const [reps, setReps] = useState(10);
    const [difficulty, setDifficulty] = useState('');

    useEffect(() => {
        if (exerciseToFinish) {
            const lastSessionNum = exerciseToFinish.currentSession - 1;
            const lastSession = exerciseToFinish.sessionData[lastSessionNum];
            if (lastSession) {
                setWeight(lastSession.weight);
                setReps(lastSession.reps);
            } else {
                setWeight(20);
                setReps(10);
            }
        }
        setDifficulty(''); // Reset difficulty each time modal opens
    }, [modalContext.exerciseId, exerciseToFinish]);


    const handleClose = () => {
        dispatch({ type: 'OPEN_MODAL', payload: { modal: 'finishSession', isOpen: false } });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!difficulty) {
            alert('يرجى اختيار مستوى الصعوبة');
            return;
        }
        if (!exerciseToFinish) return;

        dispatch({
            type: 'FINISH_SESSION',
            payload: {
                exerciseId: exerciseToFinish.id,
                sessionData: { weight, reps, difficulty: difficulty as any },
            },
        });
        handleClose();
    };

    if (!isModalOpen.finishSession || !exerciseToFinish) {
        return null;
    }

    const difficultyOptions = [
        { value: 'very-easy', emoji: '😊', label: 'سهل جداً' },
        { value: 'easy', emoji: '🙂', label: 'سهل' },
        { value: 'medium', emoji: '😐', label: 'متوسط' },
        { value: 'hard', emoji: '😟', label: 'ثقيل' },
        { value: 'very-hard', emoji: '😫', label: 'ثقيل جداً' },
    ];

    return (
        <div className="modal active">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">إنهاء الجلسة: {exerciseToFinish.name}</div>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="session-weight">الوزن المستخدم (كجم)</label>
                        <input type="number" className="form-input" id="session-weight" value={weight} onChange={(e) => setWeight(Number(e.target.value))} min="1" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="session-reps">عدد العدات</label>
                        <input type="number" className="form-input" id="session-reps" value={reps} onChange={(e) => setReps(Number(e.target.value))} min="1" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">مستوى الصعوبة</label>
                        <div className="difficulty-options">
                            {difficultyOptions.map(opt => (
                                <div key={opt.value} className={`difficulty-option ${difficulty === opt.value ? 'selected ' + opt.value : ''}`} onClick={() => setDifficulty(opt.value)}>
                                    <div className="difficulty-emoji-large">{opt.emoji}</div>
                                    <div className="difficulty-label">{opt.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>إلغاء</button>
                        <button type="submit" className="btn btn-primary">حفظ الجلسة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};