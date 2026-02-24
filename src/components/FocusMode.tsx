import React from "react";
import { TimerState, TimerActions } from "../hooks/useTimer";

interface FocusModeProps {
    activeTaskName: string;
    timerState: TimerState;
    timerActions: TimerActions;
    onExit: () => void;
}

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const FocusMode: React.FC<FocusModeProps> = ({
    activeTaskName,
    timerState,
    timerActions,
    onExit,
}) => {
    const { phase, status, secondsLeft, totalSeconds } = timerState;
    const progress = 1 - secondsLeft / totalSeconds;
    const dashOffset = CIRCUMFERENCE * (1 - progress);

    return (
        <div className="app is-active">
            <div className="drag-region" />

            <button
                className="btn btn-text focus-exit no-drag"
                onClick={onExit}
                title="Exit focus mode"
            >
                ✕
            </button>

            <div className="focus-mode">
                <div className="timer-ring-container">
                    <svg className="timer-ring" viewBox="0 0 140 140">
                        <defs>
                            <linearGradient
                                id="gradient-work"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor="#6c63ff" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                            <linearGradient
                                id="gradient-break"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop offset="0%" stopColor="#00d9a6" />
                                <stop offset="100%" stopColor="#00b4d8" />
                            </linearGradient>
                        </defs>
                        <circle className="timer-ring-bg" cx="70" cy="70" r={RADIUS} />
                        <circle
                            className={`timer-ring-progress ${phase}`}
                            cx="70"
                            cy="70"
                            r={RADIUS}
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={dashOffset}
                        />
                    </svg>
                    <div className="timer-display">
                        <div className="timer-time">{formatTime(secondsLeft)}</div>
                        <div className="timer-label">
                            {phase === "work" ? "Focus" : phase === "break" ? "Break" : "Long Break"}
                        </div>
                    </div>
                </div>

                <div className="active-task-display">
                    <div className="active-task-label">Current Task</div>
                    <div className="active-task-name">{activeTaskName}</div>
                </div>

                <div className="controls">
                    {status === "running" ? (
                        <button
                            className={`btn btn-primary ${phase}`}
                            onClick={timerActions.pause}
                            title="Pause"
                        >
                            ⏸
                        </button>
                    ) : (
                        <button
                            className={`btn btn-primary ${phase}`}
                            onClick={timerActions.start}
                            title="Start"
                        >
                            ▶
                        </button>
                    )}
                    <button
                        className="btn btn-secondary"
                        onClick={timerActions.reset}
                        title="Reset"
                    >
                        ↺
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={timerActions.skip}
                        title={phase === "work" ? "Skip to Break" : "Skip to Focus"}
                    >
                        ⏭
                    </button>
                </div>
            </div>
        </div>
    );
};
