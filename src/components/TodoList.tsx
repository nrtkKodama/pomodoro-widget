import React, { useState, useCallback } from "react";

export interface Todo {
    id: string;
    text: string;
    done: boolean;
    parentId?: string | null;
}

interface TodoListProps {
    todos: Todo[];
    activeTaskId: string | null;
    onAdd: (text: string, parentId?: string | null) => void;
    onToggle: (id: string) => void;
    onSetActive: (id: string) => void;
    onDelete: (id: string) => void;
    onReorder: (draggedId: string, targetId: string | null, position: 'above' | 'below' | 'inside') => void;
}

export const TodoList: React.FC<TodoListProps> = ({
    todos,
    activeTaskId,
    onAdd,
    onToggle,
    onSetActive,
    onDelete,
    onReorder,
}) => {
    const [input, setInput] = useState("");
    const [subtaskInput, setSubtaskInput] = useState("");
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<'above' | 'below' | 'inside' | null>(null);

    // --- Context Menu State ---
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        taskId: string;
    } | null>(null);
    const [addingSubtaskTo, setAddingSubtaskTo] = useState<string | null>(null);

    // Close menu when clicking away
    React.useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("application/json", JSON.stringify({ type: "pomodoro-task", id }));
        e.dataTransfer.setData("text/plain", id);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        // Allow bubbling so the parent drop zone also recognizes the drag
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        // Allow bubbling

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        let position: 'above' | 'below' | 'inside';
        if (y < height * 0.15) {
            position = 'above';
        } else if (y > height * 0.85) {
            position = 'below';
        } else {
            position = 'inside';
        }

        // Only update state if it actually changed to prevent render thrashing
        if (dragOverId !== targetId || dropPosition !== position) {
            setDragOverId(targetId);
            setDropPosition(position);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if we are leaving the item itself, not entering a child element
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverId(null);
            setDropPosition(null);
        }
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        e.stopPropagation();

        let draggedId = "";
        try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            if (data.type === "pomodoro-task") draggedId = data.id;
        } catch {
            draggedId = e.dataTransfer.getData("text/plain");
        }

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        let position: 'above' | 'below' | 'inside';
        if (y < height * 0.15) {
            position = 'above';
        } else if (y > height * 0.85) {
            position = 'below';
        } else {
            position = 'inside';
        }

        if (draggedId && draggedId !== targetId) {
            onReorder(draggedId, targetId, position);
        }

        setDragOverId(null);
        setDropPosition(null);
    };

    const handleGlobalDrop = (e: React.DragEvent) => {
        let draggedId = "";
        try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            if (data.type === "pomodoro-task") draggedId = data.id;
        } catch {
            draggedId = e.dataTransfer.getData("text/plain");
        }
        if (draggedId) {
            // Drop on background = move to top level
            onReorder(draggedId, null, 'below');
        }
        setDragOverId(null);
        setDropPosition(null);
    };

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const text = input.trim();
            if (text) {
                onAdd(text);
                setInput("");
            }
        },
        [input, onAdd]
    );

    const handleSubtaskSubmit = useCallback(
        (e: React.FormEvent, parentId: string) => {
            e.preventDefault();
            const text = subtaskInput.trim();
            if (text) {
                onAdd(text, parentId);
                setSubtaskInput("");
                setAddingSubtaskTo(null);
            }
        },
        [subtaskInput, onAdd]
    );

    const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            taskId,
        });
    };

    const renderTasks = (parentId: string | null = null, depth: number = 0) => {
        const filteredTasks = todos.filter((t) => (t.parentId || null) === parentId);

        // Split filtered tasks into pending and done to maintain original grouping style if desired,
        // but for nested structure it's often better to just show them in order.
        // Let's stick to the parent's order but still distinguish done state.

        return filteredTasks.map((todo) => (
            <React.Fragment key={todo.id}>
                <div
                    className={`task-item ${todo.id === activeTaskId ? "active" : ""} ${dragOverId === todo.id ? `drag-over-${dropPosition}` : ""
                        }`}
                    style={{ marginLeft: depth * 20 }}
                    onClick={() => onSetActive(todo.id)}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, todo.id)}
                    onDragEnter={handleDragEnter}
                    onDragOver={(e) => handleDragOver(e, todo.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, todo.id)}
                    onContextMenu={(e) => handleContextMenu(e, todo.id)}
                >
                    <button
                        className={`task-checkbox ${todo.done ? "checked" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle(todo.id);
                        }}
                        title={todo.done ? "Undo" : "Mark done"}
                    >
                        {todo.done ? "✓" : ""}
                    </button>
                    <span className={`task-text ${todo.done ? "done" : ""}`}>{todo.text}</span>
                    {todo.id === activeTaskId && (
                        <span className="task-active-badge">Active</span>
                    )}
                    <button
                        className="task-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(todo.id);
                        }}
                        title="Delete"
                        style={todo.done ? { opacity: 0.5 } : {}}
                    >
                        ×
                    </button>
                </div>
                {addingSubtaskTo === todo.id && (
                    <form
                        className="add-task inline-add-task"
                        onSubmit={(e) => handleSubtaskSubmit(e, todo.id)}
                        style={{ marginLeft: (depth + 1) * 20 }}
                    >
                        <input
                            type="text"
                            placeholder="Add a subtask..."
                            value={subtaskInput}
                            onChange={(e) => setSubtaskInput(e.target.value)}
                            maxLength={100}
                            autoFocus
                        />
                        <button className="btn btn-secondary" type="submit" title="Add subtask">
                            +
                        </button>
                        <button
                            className="btn btn-icon cancel-add"
                            type="button"
                            onClick={() => setAddingSubtaskTo(null)}
                            title="Cancel"
                        >
                            ×
                        </button>
                    </form>
                )}
                {renderTasks(todo.id, depth + 1)}
            </React.Fragment>
        ));
    };

    const pendingTodos = todos.filter((t) => !t.done);

    return (
        <div className="todo-section">

            <div className="todo-header">
                <span className="todo-title">Tasks</span>
                <span className="todo-count">
                    {pendingTodos.length} remaining
                </span>
            </div>

            <form className="add-task" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Add a task..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    maxLength={100}
                />
                <button className="btn btn-secondary" type="submit" title="Add task">
                    +
                </button>
            </form>

            <div
                className="task-list"
                onDragEnter={(e) => e.preventDefault()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleGlobalDrop}
            >
                {todos.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-text">Add a task to get started</div>
                    </div>
                ) : (
                    <>
                        {renderTasks(null, 0)}
                    </>
                )}
            </div>

            {/* Context Menu Overlay */}
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing it immediately
                >
                    <button
                        className="context-menu-item"
                        onClick={() => {
                            setAddingSubtaskTo(contextMenu.taskId);
                            setContextMenu(null);
                            setSubtaskInput("");
                        }}
                    >
                        <span className="icon">↳</span> Add Subtask
                    </button>
                </div>
            )}
        </div>
    );
};
