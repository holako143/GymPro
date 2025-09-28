"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext, Exercise } from '@/context/AppContext';

export const ExerciseModal = () => {
    const { state, dispatch } = useAppContext();
    const { isModalOpen, modalContext } = state;

    const [formData, setFormData] = useState({
        id: undefined,
        name: '',
        muscle: '',
        sessions: 3,
        restTime: 90,
    });

    useEffect(() => {
        if (isModalOpen.exercise && modalContext.exerciseId) {
            const exercise = state.exercises.find(ex => ex.id === modalContext.exerciseId);
            if (exercise) {
                setFormData({
                    id: exercise.id,
                    name: exercise.name,
                    muscle: exercise.muscle,
                    sessions: exercise.sessions,
                    restTime: exercise.restTime,
                });
            }
        } else {
            // Reset for new exercise
            setFormData({ id: undefined, name: '', muscle: '', sessions: 3, restTime: 90 });
        }
    }, [isModalOpen.exercise, modalContext.exerciseId, state.exercises]);

    const handleClose = () => {
        dispatch({ type: 'OPEN_MODAL', payload: { modal: 'exercise', isOpen: false } });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'sessions' || name === 'restTime' ? parseInt(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({
            type: 'ADD_OR_UPDATE_EXERCISE',
            payload: formData as Partial<Exercise>,
        });
        handleClose();
    };

    if (!isModalOpen.exercise) return null;

    return (
        <div className="modal active">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">{formData.id ? 'تعديل التمرين' : 'إضافة تمرين جديد'}</div>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">اسم التمرين</label>
                        <input type="text" className="form-input" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="muscle">مجموعة العضلات</label>
                        <select className="form-input" id="muscle" name="muscle" value={formData.muscle} onChange={handleChange} required>
                            <option value="">اختر مجموعة العضلات</option>
                            <option value="صدر">صدر</option>
                            <option value="ظهر">ظهر</option>
                            <option value="أكتاف">أكتاف</option>
                            <option value="أرجل">أرجل</option>
                            <option value="بايسبس">بايسبس</option>
                            <option value="ترايسبس">ترايسبس</option>
                            <option value="بطن">بطن</option>
                            <option value="ساعد">ساعد</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="sessions">عدد الجلسات</label>
                        <input type="number" className="form-input" id="sessions" name="sessions" value={formData.sessions} onChange={handleChange} min="1" max="10" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="restTime">وقت الراحة (بالثواني)</label>
                        <input type="number" className="form-input" id="restTime" name="restTime" value={formData.restTime} onChange={handleChange} min="30" max="300" required />
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