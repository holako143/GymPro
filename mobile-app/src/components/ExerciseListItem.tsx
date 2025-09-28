import React from 'react';

interface Exercise {
    id: number;
    name: string;
    muscle: string;
    sessions: number;
    status: string;
}

interface ExerciseListItemProps {
    exercise: Exercise;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

const ExerciseListItem: React.FC<ExerciseListItemProps> = ({ exercise, onEdit, onDelete }) => {
    const statusText = {
        completed: 'تم الإنتهاء',
        'in-progress': 'قيد التنفيذ',
        resting: 'في الراحة',
        pending: 'لم يبدأ'
    }[exercise.status] || 'لم يبدأ';

    return (
        <div className={`exercise-item status-${exercise.status}`} data-id={exercise.id}>
            <div>
                <input type="checkbox" className="exercise-select-checkbox" data-id={exercise.id} style={{ marginLeft: '10px' }} />
                <div className="exercise-name">{exercise.name}</div>
                <div className="exercise-muscle">{exercise.muscle} - {exercise.sessions} جلسات</div>
                <div className="exercise-status">{statusText}</div>
            </div>
            <div className="exercise-item-controls">
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