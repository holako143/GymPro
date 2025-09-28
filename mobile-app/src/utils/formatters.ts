/**
 * Formats a given number of seconds into a HH:MM:SS or MM:SS string.
 * @param {number} totalSeconds - The total seconds to format.
 * @returns {string} The formatted time string.
 */
export function formatTime(totalSeconds: number): string {
    totalSeconds = Math.max(0, Math.floor(totalSeconds || 0));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(seconds).padStart(2, '0');

    if (hours > 0) {
        const paddedHours = String(hours).padStart(2, '0');
        return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    } else {
        return `${paddedMinutes}:${paddedSeconds}`;
    }
}

/**
 * Returns the emoji for a given difficulty level.
 * @param {string} difficulty - The difficulty level (e.g., 'very-easy').
 * @returns {string} The corresponding emoji.
 */
export function getDifficultyEmoji(difficulty: string): string {
    const emojis: Record<string, string> = {
        'very-easy': '😊',
        'easy': '🙂',
        'medium': '😐',
        'hard': '😟',
        'very-hard': '😫'
    };
    return emojis[difficulty] || '';
}

/**
 * Returns the Arabic label for a given difficulty level.
 * @param {string} difficulty - The difficulty level.
 * @returns {string} The Arabic label.
 */
export function getDifficultyLabel(difficulty: string): string {
    const labels: Record<string, string> = {
        'very-easy': 'سهل جداً',
        'easy': 'سهل',
        'medium': 'متوسط',
        'hard': 'ثقيل',
        'very-hard': 'ثقيل جداً'
    };
    return labels[difficulty] || difficulty;
}