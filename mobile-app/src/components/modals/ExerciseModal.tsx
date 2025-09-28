"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext, Exercise } from '@/context/AppContext';

interface ExerciseModalProps {
    exerciseToEdit: Exercise | null;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({ exerciseToEdit }) => {
    const { state, dispatch } = useAppContext();
    const { isModalOpen } = state;

    const [name, setName] = useState('');
    const [muscle, setMuscle] = useState('');
    const [sessions, setSessions] = useState(3);
    const [restTime, setRestTime] = useState(90);

    useEffect(() => {
        if (isModalOpen.exercise && exerciseToEdit) {
            setName(exerciseToEdit.name);
            setMuscle(exerciseToEdit.muscle);
            setSessions(exerciseToEdit.sessions);
            setRestTime(exerciseToEdit.restTime);
        } else {
            // Reset form for new exercise
            setName('');
            setMuscle('');
            setSessions(3);
            setRestTime(90);
        }
    }, [isModalOpen.exercise, exerciseToEdit]);

    const handleClose = () => {
        dispatch({ type: 'OPEN_MODAL', payload: { modal: 'exercise', isOpen: false } });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !muscle) {
            alert("الرجاء ملء جميع الحقول.");
            return;
        }

        const exerciseData = {
            id: exerciseToEdit ? exerciseToEdit.id : undefined,
            name,
            muscle,
            sessions,
            restTime,
        };

        dispatch({ type: 'ADD_OR_UPDATE_EXERCISE', payload: exerciseData });
        handleClose();
    };

    if (!isModalOpen.exercise) {
        return null;
    }

    return (
        <div className="modal active">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">{exerciseToEdit ? 'تعديل التمرين' : 'إضافة تمرين جديد'}</div>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="exercise-name-modal">اسم التمرين</label>
                        <input type="text" className="form-input" id="exercise-name-modal" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="exercise-muscle-modal">مجموعة العضلات</label>
                        <select className="form-input" id="exercise-muscle-modal" value={muscle} onChange={(e) => setMuscle(e.target.value)} required>
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
                        <label className="form-label" htmlFor="exercise-sessions-modal">عدد الجلسات</label>
                        <input type="number" className="form-input" id="exercise-sessions-modal" min="1" max="10" value={sessions} onChange={(e) => setSessions(parseInt(e.target.value))} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="exercise-rest-modal">وقت الراحة (بالثواني)</label>
                        <input type="number" className="form-input" id="exercise-rest-modal" min="30" max="300" value={restTime} onChange={(e) => setRestTime(parseInt(e.target.value))} required />
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