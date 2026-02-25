import { useState, useCallback, useEffect } from "react";
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
    const [todos, setTodos] = useState<Todo[]>(() => {
        const saved = localStorage.getItem("pomodoro-todos");
        try {
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
        const saved = localStorage.getItem("pomodoro-active-task");
        try {
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [focusMode, setFocusMode] = useState(false);

    useEffect(() => {
        localStorage.setItem("pomodoro-todos", JSON.stringify(todos));
    }, [todos]);

    useEffect(() => {
        localStorage.setItem("pomodoro-active-task", JSON.stringify(activeTaskId));
    }, [activeTaskId]);
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
    const addTodo = useCallback((text: string, parentId?: string | null) => {
        const newTodo: Todo = { id: generateId(), text, done: false, parentId: parentId || null };
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
            // Also delete all descendants
            const getDescendants = (parentId: string): string[] => {
                const children = todos.filter(t => t.parentId === parentId);
                return [...children.map(c => c.id), ...children.flatMap(c => getDescendants(c.id))];
            };
            const toDelete = [id, ...getDescendants(id)];

            setTodos((prev) => prev.filter((t) => !toDelete.includes(t.id)));
            if (toDelete.includes(activeTaskId as string)) {
                setActiveTaskId(null);
            }
        },
        [activeTaskId, todos]
    );

    const handleReorder = useCallback((draggedId: string, targetId: string | null, position: 'above' | 'below' | 'inside') => {
        setTodos(prev => {
            const dragIdx = prev.findIndex(t => t.id === draggedId);
            if (dragIdx === -1) return prev;

            const newTodos = [...prev];
            const [draggedItem] = newTodos.splice(dragIdx, 1);

            if (targetId === null) {
                // Drop on background - move to end of top level
                draggedItem.parentId = null;
                newTodos.push(draggedItem);
                return newTodos;
            }

            const targetIdx = newTodos.findIndex(t => t.id === targetId);
            if (targetIdx === -1) {
                // Should not happen if targetId is valid
                newTodos.splice(dragIdx, 0, draggedItem);
                return newTodos;
            }

            const targetItem = newTodos[targetIdx];

            if (position === 'inside') {
                // Avoid nesting inside itself or its children
                const isDescendant = (parent: Todo, potentialChildId: string): boolean => {
                    const children = prev.filter(t => t.parentId === parent.id);
                    if (children.some(c => c.id === potentialChildId)) return true;
                    return children.some(c => isDescendant(c, potentialChildId));
                };

                if (draggedId === targetId || isDescendant(draggedItem, targetId)) {
                    newTodos.splice(dragIdx, 0, draggedItem);
                    return newTodos;
                }

                draggedItem.parentId = targetId;
                // Move to after the target (effectively at the end of its children list in a flat array)
                newTodos.splice(targetIdx + 1, 0, draggedItem);
            } else {
                draggedItem.parentId = targetItem.parentId;
                const insertIdx = position === 'above' ? targetIdx : targetIdx + 1;
                newTodos.splice(insertIdx, 0, draggedItem);
            }

            return newTodos;
        });
    }, []);

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
        <div
            className={`app ${timerState.status !== "idle" ? "is-active" : ""}`}
            onDragOver={(e) => e.preventDefault()}
        >
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
                onReorder={handleReorder}
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
