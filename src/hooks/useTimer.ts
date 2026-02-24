import { useState, useEffect, useRef, useCallback } from "react";
import { playNotificationSound, NotificationSound } from "../utils/sound";

export type TimerPhase = "work" | "break" | "long_break";
export type TimerStatus = "idle" | "running" | "paused";

export interface TimerSettings {
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
    notificationSound: NotificationSound;
}

export interface TimerState extends TimerSettings {
    phase: TimerPhase;
    status: TimerStatus;
    secondsLeft: number;
    totalSeconds: number;
    sessionsCompleted: number;
    currentSessionInCycle: number;
}

export interface TimerActions {
    start: () => void;
    pause: () => void;
    reset: () => void;
    skip: () => void;
    updateSettings: (settings: Partial<TimerSettings>) => void;
}

const DEFAULT_SETTINGS: TimerSettings = {
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    sessionsBeforeLongBreak: 4,
    notificationSound: "chime",
};

export function useTimer(
    onPhaseComplete?: (phase: TimerPhase) => void
): [TimerState, TimerActions] {
    const [settings, setSettings] = useState<TimerSettings>(() => {
        const saved = localStorage.getItem("pomodoro-settings");
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    });

    const [phase, setPhase] = useState<TimerPhase>("work");
    const [status, setStatus] = useState<TimerStatus>("idle");
    const [secondsLeft, setSecondsLeft] = useState(settings.workDuration);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);
    const [currentSessionInCycle, setCurrentSessionInCycle] = useState(1);

    const intervalRef = useRef<number | null>(null);

    const getDurationForPhase = useCallback((p: TimerPhase, s: TimerSettings) => {
        switch (p) {
            case "work": return s.workDuration;
            case "break": return s.breakDuration;
            case "long_break": return s.longBreakDuration;
        }
    }, []);

    const totalSeconds = getDurationForPhase(phase, settings);

    const clearTimer = useCallback(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const switchPhase = useCallback(
        (nextPhase: TimerPhase) => {
            clearTimer();
            setPhase(nextPhase);
            setSecondsLeft(getDurationForPhase(nextPhase, settings));
            setStatus("idle");
        },
        [clearTimer, getDurationForPhase, settings]
    );

    // Countdown logic
    useEffect(() => {
        if (status !== "running") {
            clearTimer();
            return;
        }

        intervalRef.current = window.setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    // Phase complete
                    playNotificationSound(
                        phase === "work" ? "work" : "break",
                        settings.notificationSound
                    );
                    onPhaseComplete?.(phase);

                    if (phase === "work") {
                        setSessionsCompleted((s) => s + 1);
                        if (currentSessionInCycle >= settings.sessionsBeforeLongBreak) {
                            setCurrentSessionInCycle(1);
                            switchPhase("long_break");
                        } else {
                            setCurrentSessionInCycle((c) => c + 1);
                            switchPhase("break");
                        }
                    } else {
                        switchPhase("work");
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return clearTimer;
    }, [status, phase, clearTimer, switchPhase, onPhaseComplete, currentSessionInCycle, settings]);

    const start = useCallback(() => setStatus("running"), []);
    const pause = useCallback(() => setStatus("paused"), []);

    const reset = useCallback(() => {
        clearTimer();
        setSecondsLeft(getDurationForPhase(phase, settings));
        setStatus("idle");
    }, [clearTimer, phase, getDurationForPhase, settings]);

    const skip = useCallback(() => {
        if (phase === "work") {
            setSessionsCompleted((s) => s + 1);
            if (currentSessionInCycle >= settings.sessionsBeforeLongBreak) {
                setCurrentSessionInCycle(1);
                switchPhase("long_break");
            } else {
                setCurrentSessionInCycle((c) => c + 1);
                switchPhase("break");
            }
        } else {
            switchPhase("work");
        }
    }, [phase, switchPhase, currentSessionInCycle, settings.sessionsBeforeLongBreak]);

    const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem("pomodoro-settings", JSON.stringify(updated));
            // If idle, update secondsLeft
            if (status === "idle") {
                setSecondsLeft(getDurationForPhase(phase, updated));
            }
            return updated;
        });
    }, [status, phase, getDurationForPhase]);

    const state: TimerState = {
        phase,
        status,
        secondsLeft,
        totalSeconds,
        sessionsCompleted,
        currentSessionInCycle,
        ...settings,
    };

    const actions: TimerActions = { start, pause, reset, skip, updateSettings };

    return [state, actions];
}
