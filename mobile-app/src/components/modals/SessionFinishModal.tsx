"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export const SessionFinishModal = () => {
    const { state, dispatch } = useAppContext();
    const { isModalOpen, modalContext, exercises } = state;

    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [difficulty, setDifficulty] = useState('');

    useEffect(() => {
        if (isModalOpen.finishSession && modalContext.exerciseId) {
            // Reset fields when modal opens
            setWeight('20'); // Default value
            setReps('10');   // Default value
            setDifficulty('');
        }
    }, [isModalOpen.finishSession, modalContext.exerciseId]);

    const handleClose = () => {
        dispatch({ type: 'OPEN_MODAL', payload: { modal: 'finishSession', isOpen: false } });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!difficulty) {
            alert('يرجى اختيار مستوى الصعوبة.');
            return;
        }
        dispatch({
            type: 'FINISH_SESSION',
            payload: {
                exerciseId: modalContext.exerciseId!,
                sessionData: {
                    weight: parseInt(weight),
                    reps: parseInt(reps),
                    difficulty: difficulty as any,
                },
            },
        });
        handleClose();
    };

    if (!isModalOpen.finishSession) return null;

    const difficultyOptions = [
        { key: 'very-easy', emoji: '😊', label: 'سهل جداً' },
        { key: 'easy', emoji: '🙂', label: 'سهل' },
        { key: 'medium', emoji: '😐', label: 'متوسط' },
        { key: 'hard', emoji: '😟', label: 'ثقيل' },
        { key: 'very-hard', emoji: '😫', label: 'ثقيل جداً' },
    ];

    return (
        <div className="modal active">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">إنهاء الجلسة</div>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="session-weight">الوزن المستخدم (كجم)</label>
                        <input type="number" className="form-input" id="session-weight" value={weight} onChange={(e) => setWeight(e.target.value)} required min="0" />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="session-reps">عدد العدات</label>
                        <input type="number" className="form-input" id="session-reps" value={reps} onChange={(e) => setReps(e.target.value)} required min="1" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">مستوى الصعوبة</label>
                        <div className="difficulty-options">
                            {difficultyOptions.map(opt => (
                                <div
                                    key={opt.key}
                                    className={`difficulty-option ${opt.key} ${difficulty === opt.key ? 'selected' : ''}`}
                                    onClick={() => setDifficulty(opt.key)}
                                >
                                    <div className="difficulty-emoji-large">{opt.emoji}</div>
                                    <div className="difficulty-label">{opt.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>إلغاء</button>
                        <button type="submit" className="btn btn-primary">حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    );
};