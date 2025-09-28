import React from 'react';

// A helper function that will be defined in a utils file later
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const getDifficultyEmoji = (difficulty) => {
    const emojis = { 'very-easy': '😊', 'easy': '🙂', 'medium': '😐', 'hard': '😟', 'very-hard': '😫' };
    return emojis[difficulty] || '';
};

// Define the types for the props
interface Exercise {
    id: number;
    name: string;
    difficulty: string | null;
    status: 'completed' | 'in-progress' | 'resting' | 'pending';
    restSecondsCurrentSession: number;
    exerciseSecondsCurrentSession: number;
    sessions: number;
    completedSessions: number;
    restTime: number;
    currentSession: number;
    sessionData: { [key: number]: any };
}

interface ExerciseCardProps {
    exercise: Exercise;
    isActive: boolean;
    // Callbacks for interactions
    onStart: (id: number) => void;
    onPause: (id: number) => void;
    onFinish: (id: number) => void;
    onViewDetails: (id: number, session: number) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isActive, onStart, onPause, onFinish, onViewDetails }) => {
    const statusMap = {
        completed: { text: 'تم الإنتهاء', className: 'status-completed' },
        'in-progress': { text: 'قيد التنفيذ', className: 'status-in-progress' },
        resting: { text: 'في الراحة', className: 'status-resting' },
        pending: { text: 'لم يبدأ', className: 'status-pending' },
    };

    let status = statusMap[exercise.status] || statusMap.pending;
    if (exercise.status === 'resting' && exercise.restSecondsCurrentSession < -15) {
        status = { text: 'تجاوزت الراحة', className: 'status-rest-overdue' };
    }

    const progressPercent = exercise.sessions > 0 ? (exercise.completedSessions / exercise.sessions) * 100 : 0;
    const difficultyEmoji = exercise.difficulty ? <span className="session-difficulty">{getDifficultyEmoji(exercise.difficulty)}</span> : null;

    return (
        <div className={`card ${isActive ? 'active' : ''} ${exercise.difficulty || ''} ${exercise.status === 'resting' && exercise.restSecondsCurrentSession < -15 ? 'rest-overdue' : ''}`} data-exercise={exercise.id}>
            <div className="exercise-header">
                <div className="exercise-name">{exercise.name} {difficultyEmoji}</div>
                <div className={`exercise-status ${status.className}`}>{status.text}</div>
            </div>
            <div className="exercise-timer">
                <span id={`exercise-timer-${exercise.id}`}>{formatTime(exercise.exerciseSecondsCurrentSession)}</span>
            </div>
            <div className="exercise-details">
                <div className="detail-item">
                    <div className="detail-label">الجلسات</div>
                    <div className="detail-value">{exercise.completedSessions}/{exercise.sessions}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-label">وقت الراحة (ث)</div>
                    <div className="detail-value">{formatTime(exercise.restTime)}</div>
                </div>
            </div>
            <div className="card-progress">
                <div className="card-progress-bar">
                    <div className="card-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="card-progress-text">{exercise.completedSessions} من {exercise.sessions} جلسة مكتملة</div>
            </div>
            <div className="controls">
                <button className="control-btn start-exercise" onClick={() => onStart(exercise.id)} disabled={exercise.status !== 'pending'}>بدء</button>
                <button className={`control-btn ${exercise.status === 'in-progress' ? 'pause-exercise' : 'start-exercise'}`} onClick={() => onPause(exercise.id)} disabled={exercise.status !== 'in-progress'}>
                    {exercise.status === 'in-progress' && exercise.exerciseTimer ? 'راحة' : 'استئناف'}
                </button>
                <button className="control-btn finish-exercise" onClick={() => onFinish(exercise.id)} disabled={exercise.status !== 'in-progress'}>إنهاء</button>
            </div>
            <div className="sessions-container">
                {Array.from({ length: exercise.sessions }).map((_, i) => {
                    const sessionNum = i + 1;
                    const sessionData = exercise.sessionData[sessionNum];
                    const isCompleted = sessionNum <= exercise.completedSessions;
                    return (
                        <div key={sessionNum} className={`session-card ${isCompleted && sessionData ? sessionData.difficulty : ''}`} onClick={() => isCompleted && onViewDetails(exercise.id, sessionNum)}>
                            <div className="session-info">
                                <span className="session-number">الجلسة {sessionNum}</span>
                                {isCompleted && sessionData ? <span className="session-difficulty">{getDifficultyEmoji(sessionData.difficulty)}</span> : null}
                            </div>
                            {isCompleted && sessionData && (
                                <div className="session-data" style={{ display: 'flex', gap: '10px', fontSize: '0.9em' }}>
                                    <div>{sessionData.weight} كجم</div>
                                    <div>{sessionData.reps} عدات</div>
                                </div>
                            )}
                            <button className={`session-btn ${isCompleted ? 'complete' : ''}`} disabled={!isCompleted}>
                                {isCompleted ? 'مكتمل' : 'قادم'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExerciseCard;