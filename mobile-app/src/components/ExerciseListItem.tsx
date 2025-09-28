"use client";
import React from 'react';
import { Exercise } from '@/context/AppContext';

interface ExerciseListItemProps {
    exercise: Exercise;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onSelect: (id: number, isSelected: boolean) => void;
    isSelected: boolean;
}

export const ExerciseListItem: React.FC<ExerciseListItemProps> = ({ exercise, onEdit, onDelete, onSelect, isSelected }) => {
    const statusMap: Record<string, string> = {
        completed: 'تم الإنتهاء',
        'in-progress': 'قيد التنفيذ',
        paused: 'متوقف مؤقتاً',
        resting: 'في الراحة',
        pending: 'لم يبدأ',
    };

    const statusText = statusMap[exercise.status] || 'غير معروف';

    return (
        <div className={`exercise-item status-${exercise.status} ${isSelected ? 'selected' : ''}`} data-id={exercise.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <input
                    type="checkbox"
                    className="exercise-select-checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(exercise.id, e.target.checked)}
                />
                <div>
                    <div className="exercise-name">{exercise.name}</div>
                    <div className="exercise-muscle" style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>
                        {exercise.muscle} - {exercise.sessions} جلسات
                    </div>
                </div>
            </div>
            <div className="exercise-item-controls">
                 <div className={`exercise-status status-${exercise.status}`} style={{
                     padding: '4px 10px',
                     borderRadius: '12px',
                     fontSize: '0.8rem',
                     marginRight: '10px'
                 }}>
                    {statusText}
                </div>
                <button className="exercise-item-btn edit" onClick={() => onEdit(exercise.id)}>
                    <i className="fas fa-edit"></i>
                </button>
                <button className="exercise-item-btn delete" onClick={() => onDelete(exercise.id)}>
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

export default ExerciseListItem;