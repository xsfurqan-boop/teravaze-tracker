import { useState } from 'react';
import type { Task } from '../hooks/useTaskStore';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
    tasks: Task[];
    onUpdateStatus: (taskId: string, newStatus: Task['status']) => void;
}

const COLUMNS: Task['status'][] = ['To Do', 'In Progress', 'In Review', 'Done'];

export function KanbanBoard({ tasks, onUpdateStatus }: KanbanBoardProps) {
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<Task['status'] | null>(null);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = 'move';
        // Transparent drag image or default
    };

    const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
        e.preventDefault();
        setDragOverColumn(status);
    };

    const handleDrop = (e: React.DragEvent, status: Task['status']) => {
        e.preventDefault();
        setDragOverColumn(null);
        if (draggedTaskId) {
            onUpdateStatus(draggedTaskId, status);
            setDraggedTaskId(null);
        }
    };

    const getColumnColor = (status: string) => {
        switch (status) {
            case 'To Do': return 'border-gray-500/30 bg-gray-500/5';
            case 'In Progress': return 'border-blue-500/30 bg-blue-500/5';
            case 'In Review': return 'border-purple-500/30 bg-purple-500/5';
            case 'Done': return 'border-green-500/30 bg-green-500/5';
            default: return 'border-white/10';
        }
    };

    return (
        <div className="flex gap-6 overflow-x-auto pb-4 h-full min-w-full">
            {COLUMNS.map((status) => {
                const columnTasks = tasks.filter(t => t.status === status);
                const isOver = dragOverColumn === status;

                return (
                    <div
                        key={status}
                        onDragOver={(e) => handleDragOver(e, status)}
                        onDrop={(e) => handleDrop(e, status)}
                        onDragLeave={() => setDragOverColumn(null)}
                        className={`flex-1 min-w-[300px] rounded-xl border transition-colors duration-200 flex flex-col ${getColumnColor(status)} ${isOver ? 'ring-2 ring-primary ring-inset' : ''}`}
                    >
                        {/* Column Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-sm z-10 rounded-t-xl">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${status === 'Done' ? 'bg-green-500' : status === 'In Progress' ? 'bg-blue-500' : status === 'In Review' ? 'bg-purple-500' : 'bg-gray-500'}`} />
                                {status}
                            </h3>
                            <span className="text-xs font-semibold bg-white/10 px-2 py-1 rounded-full text-gray-400">
                                {columnTasks.length}
                            </span>
                        </div>

                        {/* Tasks Container */}
                        <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                            {columnTasks.map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                    className="cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform"
                                >
                                    <TaskCard task={task} />
                                </div>
                            ))}
                            {columnTasks.length === 0 && (
                                <div className="h-24 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-500 text-sm italic">
                                    Drop items here
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
