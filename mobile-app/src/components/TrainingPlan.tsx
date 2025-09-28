import React from 'react';

interface Plan {
    id: number;
    name: string;
    description: string;
    exercises: number[];
}

interface Exercise {
    id: number;
    name: string;
}

interface TrainingPlanProps {
    plan: Plan;
    allExercises: Exercise[];
    isActive: boolean;
    onActivate: (id: number | null) => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
}

const TrainingPlan: React.FC<TrainingPlanProps> = ({ plan, allExercises, isActive, onActivate, onEdit, onDelete }) => {
    const planExercises = allExercises
        .filter(exercise => plan.exercises.includes(exercise.id))
        .map(exercise => exercise.name);

    return (
        <div className="plan-card">
            <div className="plan-header">
                <div className="plan-name">{plan.name} {isActive ? <span style={{ color: 'var(--success)' }}>(مفعلة)</span> : ''}</div>
                <div className="plan-actions">
                    <button className="plan-btn activate" onClick={() => onActivate(isActive ? null : plan.id)} title={isActive ? 'إلغاء تفعيل الخطة' : 'تفعيل الخطة'}>
                        <i className={`fas ${isActive ? 'fa-check-circle' : 'fa-play-circle'}`}></i>
                    </button>
                    <button className="plan-btn edit" onClick={() => onEdit(plan.id)} title="تعديل الخطة">
                        <i className="fas fa-edit"></i>
                    </button>
                    <button className="plan-btn delete" onClick={() => onDelete(plan.id)} title="حذف الخطة">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div className="plan-description">{plan.description}</div>
            <div className="plan-exercises">
                {planExercises.length > 0 ? (
                    planExercises.map(exerciseName => (
                        <div key={exerciseName} className="plan-exercise">
                            <span>{exerciseName}</span>
                        </div>
                    ))
                ) : (
                    <p style={{ color: 'var(--gray)', fontSize: '0.9em' }}>لا توجد تمارين في هذه الخطة.</p>
                )}
            </div>
        </div>
    );
};

export default TrainingPlan;