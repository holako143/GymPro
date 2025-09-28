"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext, TrainingPlan, Exercise } from '@/context/AppContext';

export const PlanModal = () => {
    const { state, dispatch } = useAppContext();
    const { isModalOpen, modalContext, exercises, trainingPlans } = state;

    const [formData, setFormData] = useState({
        id: undefined,
        name: '',
        description: '',
        exercises: [] as number[],
    });

    useEffect(() => {
        if (isModalOpen.plan && modalContext.planId) {
            const plan = trainingPlans.find(p => p.id === modalContext.planId);
            if (plan) {
                setFormData({
                    id: plan.id,
                    name: plan.name,
                    description: plan.description,
                    exercises: [...plan.exercises],
                });
            }
        } else {
            setFormData({ id: undefined, name: '', description: '', exercises: [] });
        }
    }, [isModalOpen.plan, modalContext.planId, trainingPlans]);

    const handleClose = () => {
        dispatch({ type: 'OPEN_MODAL', payload: { modal: 'plan', isOpen: false } });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (exerciseId: number) => {
        setFormData(prev => {
            const newExercises = prev.exercises.includes(exerciseId)
                ? prev.exercises.filter(id => id !== exerciseId)
                : [...prev.exercises, exerciseId];
            return { ...prev, exercises: newExercises };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({
            type: 'ADD_OR_UPDATE_PLAN',
            payload: formData as Partial<TrainingPlan>,
        });
        handleClose();
    };

    const muscleGroups = useMemo(() => {
        return exercises.reduce((acc, exercise) => {
            (acc[exercise.muscle] = acc[exercise.muscle] || []).push(exercise);
            return acc;
        }, {} as Record<string, Exercise[]>);
    }, [exercises]);

    if (!isModalOpen.plan) return null;

    return (
        <div className="modal active">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">{formData.id ? 'تعديل الخطة' : 'إنشاء خطة جديدة'}</div>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>
                <form id="plan-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="plan-name">اسم الخطة</label>
                        <input type="text" className="form-input" id="plan-name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="plan-description">وصف الخطة</label>
                        <textarea className="form-input" id="plan-description" name="description" value={formData.description} onChange={handleChange} rows={3}></textarea>
                    </div>
                    <div className="form-group">
                        <label className="form-label">التمارين المضمنة</label>
                        <div id="plan-exercises-list">
                            {Object.entries(muscleGroups).map(([muscle, exercisesInGroup]) => (
                                <div key={muscle} className="muscle-group-selector">
                                    <h4>{muscle}</h4>
                                    <div className="muscle-group-exercises">
                                        {exercisesInGroup.map(exercise => (
                                            <div key={exercise.id} className="form-group">
                                                <label className="form-label">
                                                    <input
                                                        type="checkbox"
                                                        value={exercise.id}
                                                        checked={formData.exercises.includes(exercise.id)}
                                                        onChange={() => handleCheckboxChange(exercise.id)}
                                                    />
                                                    {exercise.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
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