import React from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TimerState, TimerActions } from "../hooks/useTimer";
import { playNotificationSound, NotificationSound } from "../utils/sound";

interface SettingsProps {
    state: TimerState;
    actions: TimerActions;
    onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ state, actions, onClose }) => {
    const handleChange = (key: string, value: string) => {
        if (key === "notificationSound") {
            actions.updateSettings({ [key]: value as NotificationSound });
            return;
        }

        if (key === "volume") {
            actions.updateSettings({ [key]: parseFloat(value) });
            return;
        }

        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;

        if (key.includes("Duration")) {
            actions.updateSettings({ [key]: numValue * 60 });
        } else {
            actions.updateSettings({ [key]: numValue });
        }
    };

    const handleTestSound = () => {
        playNotificationSound("work", state.notificationSound, state.volume);
    };

    return (
        <div className="settings-overlay no-drag">
            <div className="settings-card">
                <div className="settings-header">
                    <h3>Settings</h3>
                    <button className="btn-icon" onClick={onClose}>✕</button>
                </div>

                <div className="settings-content">
                    <div className="settings-group">
                        <label>Work Duration (min)</label>
                        <input
                            type="number"
                            value={state.workDuration / 60}
                            onChange={(e) => handleChange("workDuration", e.target.value)}
                        />
                    </div>

                    <div className="settings-group">
                        <label>Short Break (min)</label>
                        <input
                            type="number"
                            value={state.breakDuration / 60}
                            onChange={(e) => handleChange("breakDuration", e.target.value)}
                        />
                    </div>

                    <div className="settings-group">
                        <label>Long Break (min)</label>
                        <input
                            type="number"
                            value={state.longBreakDuration / 60}
                            onChange={(e) => handleChange("longBreakDuration", e.target.value)}
                        />
                    </div>

                    <div className="settings-group">
                        <label>Sessions before Long Break</label>
                        <input
                            type="number"
                            value={state.sessionsBeforeLongBreak}
                            onChange={(e) => handleChange("sessionsBeforeLongBreak", e.target.value)}
                        />
                    </div>

                    <div className="settings-group">
                        <label>Finish Sound</label>
                        <div style={{ display: "flex", gap: 8 }}>
                            <select
                                value={state.notificationSound}
                                onChange={(e) => handleChange("notificationSound", e.target.value)}
                                style={{ flex: 1 }}
                            >
                                <option value="chime">Chime (Classic)</option>
                                <option value="digital">Digital (Beep)</option>
                                <option value="ring">Ring (Oscillating)</option>
                                <option value="nature">Nature (Wood Block)</option>
                            </select>
                            <button className="btn btn-text" onClick={handleTestSound} style={{ padding: "4px 12px" }}>
                                Test
                            </button>
                        </div>
                    </div>

                    <div className="settings-group">
                        <label>Sound Volume ({Math.round(state.volume * 100)}%)</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={state.volume}
                            onChange={(e) => handleChange("volume", e.target.value)}
                            style={{ width: "100%", marginTop: 8 }}
                        />
                    </div>
                </div>

                <button className="btn btn-text btn-block" onClick={onClose} style={{ marginTop: 16 }}>
                    Save & Close
                </button>

                <div className="divider" style={{ margin: "16px 0" }} />

                <button
                    className="btn btn-text btn-block no-drag"
                    onClick={() => getCurrentWindow().close()}
                    style={{
                        background: "rgba(255, 107, 107, 0.15)",
                        borderColor: "rgba(255, 107, 107, 0.3)",
                        color: "#ff6b6b"
                    }}
                >
                    Quit Application
                </button>
            </div>
        </div>
    );
};
