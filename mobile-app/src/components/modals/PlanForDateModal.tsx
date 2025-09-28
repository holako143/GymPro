"use client";
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export const PlanForDateModal = () => {
    const { state, dispatch } = useAppContext();
    const { isModalOpen, modalContext, trainingPlans, plannedWorkouts } = state;
    const [planId, setPlanId] = useState('');

    useEffect(() => {
        if (isModalOpen.planForDate && modalContext.date) {
            const existingPlan = plannedWorkouts.find(p => p.date === modalContext.date);
            setPlanId(existingPlan ? String(existingPlan.planId) : '');
        }
    }, [isModalOpen.planForDate, modalContext.date, plannedWorkouts]);

    const handleClose = () => {
        dispatch({ type: 'OPEN_MODAL', payload: { modal: 'planForDate', isOpen: false } });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!planId || !modalContext.date) {
            alert('الرجاء اختيار خطة.');
            return;
        }

        const existingPlan = plannedWorkouts.find(p => p.date === modalContext.date);

        dispatch({
            type: 'ADD_OR_UPDATE_PLANNED_WORKOUT',
            payload: {
                id: existingPlan?.id || 0, // 0 will be replaced by new ID in reducer
                date: modalContext.date,
                planId: parseInt(planId),
            },
        });
        handleClose();
    };

    if (!isModalOpen.planForDate) return null;

    return (
        <div className="modal active">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">تخطيط تمرين ليوم {modalContext.date}</div>
                    <button className="modal-close" onClick={handleClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="select-plan-for-date">اختر خطة تدريب:</label>
                        <select
                            className="form-input"
                            id="select-plan-for-date"
                            value={planId}
                            onChange={(e) => setPlanId(e.target.value)}
                            required
                        >
                            <option value="">-- اختر خطة --</option>
                            {trainingPlans.map(plan => (
                                <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                        </select>
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