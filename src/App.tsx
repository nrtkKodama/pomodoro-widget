import { useState, useCallback } from "react";
import { useTimer, TimerPhase } from "./hooks/useTimer";
import { Timer } from "./components/Timer";
import { TodoList, Todo } from "./components/TodoList";
import { FocusMode } from "./components/FocusMode";
import { Settings } from "./components/Settings";

let nextId = 1;
function generateId(): string {
    return `task-${nextId++}-${Date.now()}`;
}

function App() {
    // --- State ---
    const [todos, setTodos] = useState<Todo[]>([]);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [focusMode, setFocusMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // --- Timer ---
    const handlePhaseComplete = useCallback((phase: TimerPhase) => {
        if (phase === "work") {
            // Automatically exit focus mode on work complete
            // (break begins, user can see full UI)
        }
    }, []);

    const [timerState, timerActions] = useTimer(handlePhaseComplete);

    // --- Todo Actions ---
    const addTodo = useCallback((text: string) => {
        const newTodo: Todo = { id: generateId(), text, done: false };
        setTodos((prev) => [...prev, newTodo]);
    }, []);

    const toggleTodo = useCallback(
        (id: string) => {
            setTodos((prev) =>
                prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
            );
            // If completing the active task, clear active
            if (id === activeTaskId) {
                const todo = todos.find((t) => t.id === id);
                if (todo && !todo.done) {
                    setActiveTaskId(null);
                }
            }
        },
        [activeTaskId, todos]
    );

    const setActiveTask = useCallback((id: string) => {
        setActiveTaskId((prev) => (prev === id ? null : id));
    }, []);

    const deleteTodo = useCallback(
        (id: string) => {
            setTodos((prev) => prev.filter((t) => t.id !== id));
            if (id === activeTaskId) {
                setActiveTaskId(null);
            }
        },
        [activeTaskId]
    );

    // --- Focus Mode ---
    const enterFocusMode = useCallback(() => {
        setFocusMode(true);
        if (timerState.status === "idle") {
            timerActions.start();
        }
    }, [timerState.status, timerActions]);

    const exitFocusMode = useCallback(() => {
        setFocusMode(false);
    }, []);

    // Get active task name
    const activeTask = todos.find((t) => t.id === activeTaskId);

    // --- Focus Mode View ---
    if (focusMode && activeTask) {
        return (
            <FocusMode
                activeTaskName={activeTask.text}
                timerState={timerState}
                timerActions={timerActions}
                onExit={exitFocusMode}
            />
        );
    }

    // --- Normal Mode View ---
    return (
        <div className={`app ${timerState.status !== "idle" ? "is-active" : ""}`}>
            <div className="drag-region" />

            {/* Header */}
            <div className="header">
                <span className="header-title">Pomodoro</span>
                <div className="header-status">
                    <button
                        className="btn-icon no-drag"
                        onClick={() => setShowSettings(true)}
                        style={{ marginRight: 8, fontSize: 14 }}
                        title="Settings"
                    >
                        ⚙️
                    </button>
                    <span
                        className={`status-dot ${timerState.status === "running"
                            ? timerState.phase
                            : "idle"
                            }`}
                    />
                    <span>
                        {timerState.sessionsCompleted > 0
                            ? `${timerState.sessionsCompleted} done`
                            : "Ready"}
                    </span>
                </div>
            </div>

            {/* Timer */}
            <Timer state={timerState} actions={timerActions} />

            {/* Active Task + Focus Button */}
            {activeTask && (
                <div style={{ textAlign: "center", paddingBottom: 8 }}>
                    <div className="active-task-display">
                        <div className="active-task-label">Active Task</div>
                        <div className="active-task-name">{activeTask.text}</div>
                    </div>
                    <button
                        className="btn btn-text no-drag"
                        onClick={enterFocusMode}
                        style={{
                            marginTop: 8,
                            background: "rgba(108, 99, 255, 0.15)",
                            borderColor: "rgba(108, 99, 255, 0.3)",
                        }}
                    >
                        ⚡ Enter Focus Mode
                    </button>
                </div>
            )}

            <div className="divider" />

            {/* Todo List */}
            <TodoList
                todos={todos}
                activeTaskId={activeTaskId}
                onAdd={addTodo}
                onToggle={toggleTodo}
                onSetActive={setActiveTask}
                onDelete={deleteTodo}
            />

            {/* Settings Overlay */}
            {showSettings && (
                <Settings
                    state={timerState}
                    actions={timerActions}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}

export default App;
