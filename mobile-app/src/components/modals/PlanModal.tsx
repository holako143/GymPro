"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext, TrainingPlan } from '@/context/AppContext';

export const PlanModal: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { isModalOpen, modalContext, exercises, trainingPlans } = state;

    const planToEdit = modalContext.planId ? trainingPlans.find(p => p.id === modalContext.planId) : null;

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedExercises, setSelectedExercises] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (isModalOpen.plan && planToEdit) {
            setName(planToEdit.name);
            setDescription(planToEdit.description);
            setSelectedExercises(new Set(planToEdit.exercises));
        } else {
            setName('');
            setDescription('');
            setSelectedExercises(new Set());
        }
    }, [isModalOpen.plan, planToEdit]);

    const handleClose = () => {
        dispatch({ type: 'OPEN_MODAL', payload: { modal: 'plan', isOpen: false } });
    };

    const handleExerciseToggle = (exerciseId: number) => {
        const newSelection = new Set(selectedExercises);
        if (newSelection.has(exerciseId)) {
            newSelection.delete(exerciseId);
        } else {
            newSelection.add(exerciseId);
        }
        setSelectedExercises(newSelection);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert("الرجاء إدخال اسم للخطة.");
            return;
        }

        const planData = {
            id: planToEdit ? planToEdit.id : undefined,
            name,
            description,
            exercises: Array.from(selectedExercises),
        };

        dispatch({ type: 'ADD_OR_UPDATE_PLAN', payload: planData });
        handleClose();
    };

    if (!isModalOpen.plan) {
        return null;
    }

    const muscleGroups = [...new Set(exercises.map(ex => ex.muscle))].sort();

    return (
        <div className="modal active">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">{planToEdit ? 'تعديل الخطة' : 'إنشاء خطة جديدة'}</div>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>
                <form id="plan-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="plan-name-modal">اسم الخطة</label>
                        <input type="text" id="plan-name-modal" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="plan-description-modal">وصف الخطة</label>
                        <textarea id="plan-description-modal" className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}></textarea>
                    </div>
                    <div className="form-group">
                        <label className="form-label">التمارين المضمنة</label>
                        <div id="plan-exercises-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {muscleGroups.map(muscle => (
                                <div key={muscle} className="muscle-group-selector">
                                    <h4>{muscle}</h4>
                                    <div className="muscle-group-exercises">
                                        {exercises.filter(ex => ex.muscle === muscle).map(exercise => (
                                            <div key={exercise.id} className="form-group">
                                                <label className="form-label">
                                                    <input
                                                        type="checkbox"
                                                        value={exercise.id}
                                                        checked={selectedExercises.has(exercise.id)}
                                                        onChange={() => handleExerciseToggle(exercise.id)}
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
                        <button type="submit" className="btn btn-primary">حفظ الخطة</button>
                    </div>
                </form>
            </div>
        </div>
    );
};