import React, { useMemo, useEffect } from 'react';

interface CountdownTimerBarProps {
    duration: number; // Duration of the countdown in milliseconds
    timePassed: number | null; // time passed of the countdown in milliseconds
    onComplete?: () => void; // Callback when the countdown finishes
}

export const EliminationTimer: React.FC<CountdownTimerBarProps> = ({ duration, timePassed, onComplete }) => {
    const timeLeft = useMemo(() => duration - (timePassed ?? 0), [duration, timePassed]);
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (timeLeft <= 0) {
                if (onComplete) {
                    onComplete()
                }
                return;
            }
        }, 100);
        return () => clearInterval(intervalId);
    }, [timeLeft, onComplete]);

    // Calculate percentage of time elapsed
    const progressPercentage = 100 - (timeLeft / duration) * 100;

    return (
        <div className="timer-bar-container">
            <div
                className="timer-bar"
                style={{ width: `${progressPercentage}%`, transition: 'width 1s linear' }}
            />
            <span className="timer-label">{timeLeft > 0 ? timeLeft - (timeLeft % 1) : 0}s</span>
        </div>
    );
};

