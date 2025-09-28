"use client";
import React from 'react';
import { useAppContext, Exercise, SessionData } from '@/context/AppContext';
import { formatTime } from '@/utils/formatters';

const getDifficultyEmoji = (difficulty: string | null) => {
    if (!difficulty) return '';
    const emojis: Record<string, string> = { 'very-easy': '😊', 'easy': '🙂', 'medium': '😐', 'hard': '😟', 'very-hard': '😫' };
    return emojis[difficulty] || '';
};

interface ExerciseCardProps {
    exercise: Exercise;
    isActive: boolean;
    onStart: (id: number) => void;
    onPause: (id: number) => void;
    onResume: (id: number) => void;
    onFinish: (id: number) => void;
    onViewDetails: (exerciseId: number, sessionNumber: number) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isActive, onStart, onPause, onResume, onFinish, onViewDetails }) => {
    const statusMap: Record<string, { text: string, className: string }> = {
        completed: { text: 'تم الإنتهاء', className: 'status-completed' },
        'in-progress': { text: 'قيد التنفيذ', className: 'status-in-progress' },
        paused: { text: 'متوقف مؤقتاً', className: 'status-in-progress' },
        resting: { text: 'في الراحة', className: 'status-resting' },
        pending: { text: 'لم يبدأ', className: 'status-pending' },
    };

    let statusInfo = statusMap[exercise.status] || statusMap.pending;
    const isRestOverdue = exercise.status === 'resting' && exercise.restSeconds < 0;
    if (isRestOverdue) {
        statusInfo = { text: 'تجاوزت الراحة', className: 'status-rest-overdue' };
    }

    const progressPercent = exercise.sessions > 0 ? (exercise.completedSessions / exercise.sessions) * 100 : 0;

    const lastSessionDifficulty = exercise.sessionData[exercise.completedSessions]?.difficulty;

    return (
        <div className={`card ${isActive ? 'active' : ''} ${lastSessionDifficulty || ''} ${isRestOverdue ? 'rest-overdue' : ''}`} data-exercise={exercise.id}>
            <div className="exercise-header">
                <div className="exercise-name">{exercise.name}</div>
                <div className={`exercise-status ${statusInfo.className}`}>{statusInfo.text}</div>
            </div>

            <div className="exercise-timer">
                <span>
                    {exercise.status === 'resting'
                        ? `راحة: ${formatTime(exercise.restSeconds)}`
                        : formatTime(exercise.exerciseSeconds)}
                </span>
            </div>

            <div className="exercise-details">
                <div className="detail-item">
                    <div className="detail-label">الجلسات</div>
                    <div className="detail-value">{exercise.completedSessions}/{exercise.sessions}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-label">وقت الراحة المحدد</div>
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
                <button className="control-btn start-exercise" onClick={() => onStart(exercise.id)} disabled={exercise.status !== 'pending' && exercise.status !== 'resting'}>
                    بدء
                </button>
                {exercise.status === 'in-progress' ? (
                    <button className="control-btn pause-exercise" onClick={() => onPause(exercise.id)}>راحة</button>
                ) : (
                    <button className="control-btn start-exercise" onClick={() => onResume(exercise.id)} disabled={exercise.status !== 'paused'}>استئناف</button>
                )}
                <button className="control-btn finish-exercise" onClick={() => onFinish(exercise.id)} disabled={exercise.status !== 'in-progress' && exercise.status !== 'paused'}>
                    إنهاء
                </button>
            </div>

            <div className="sessions-container">
                <div className="sessions-title">جلسات التمرين</div>
                {Array.from({ length: exercise.sessions }, (_, i) => {
                    const sessionNum = i + 1;
                    const sessionData = exercise.sessionData[sessionNum];
                    const isCompleted = sessionNum <= exercise.completedSessions;
                    const difficultyClass = isCompleted && sessionData ? `difficulty-${sessionData.difficulty}` : '';

                    return (
                        <div
                            key={sessionNum}
                            className={`session-card ${isCompleted ? 'complete' : ''} ${difficultyClass}`}
                            onClick={() => isCompleted && onViewDetails(exercise.id, sessionNum)}
                        >
                            <div className="session-info">
                                <span className="session-number">الجلسة {sessionNum}</span>
                                {isCompleted && sessionData ? <span className="session-difficulty">{getDifficultyEmoji(sessionData.difficulty)}</span> : null}
                            </div>
                            {isCompleted && sessionData && (
                                <div className="session-data" style={{ display: 'flex', gap: '10px', fontSize: '0.9em', color: 'var(--gray)'}}>
                                    <span>{sessionData.weight} كجم</span>
                                    <span>{sessionData.reps} عدات</span>
                                </div>
                            )}
                             <button className={`session-btn ${isCompleted ? 'complete' : ''}`} disabled>
                                {isCompleted ? 'مكتمل' : (sessionNum === exercise.currentSession ? 'حالي' : 'قادم')}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExerciseCard;