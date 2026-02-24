import React, { useState, useCallback } from "react";

export interface Todo {
    id: string;
    text: string;
    done: boolean;
}

interface TodoListProps {
    todos: Todo[];
    activeTaskId: string | null;
    onAdd: (text: string) => void;
    onToggle: (id: string) => void;
    onSetActive: (id: string) => void;
    onDelete: (id: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
    todos,
    activeTaskId,
    onAdd,
    onToggle,
    onSetActive,
    onDelete,
}) => {
    const [input, setInput] = useState("");

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

    const pendingTodos = todos.filter((t) => !t.done);
    const doneTodos = todos.filter((t) => t.done);

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

            <div className="task-list">
                {todos.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <div className="empty-state-text">Add a task to get started</div>
                    </div>
                ) : (
                    <>
                        {pendingTodos.map((todo) => (
                            <div
                                key={todo.id}
                                className={`task-item ${todo.id === activeTaskId ? "active" : ""
                                    }`}
                                onClick={() => onSetActive(todo.id)}
                            >
                                <button
                                    className="task-checkbox"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggle(todo.id);
                                    }}
                                    title="Mark done"
                                >
                                    {todo.done ? "✓" : ""}
                                </button>
                                <span className="task-text">{todo.text}</span>
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
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {doneTodos.map((todo) => (
                            <div key={todo.id} className="task-item">
                                <button
                                    className="task-checkbox checked"
                                    onClick={() => onToggle(todo.id)}
                                    title="Undo"
                                >
                                    ✓
                                </button>
                                <span className="task-text done">{todo.text}</span>
                                <button
                                    className="task-delete"
                                    onClick={() => onDelete(todo.id)}
                                    title="Delete"
                                    style={{ opacity: 0.5 }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};
