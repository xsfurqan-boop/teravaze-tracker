import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { CheckCircle2, Circle, Trash2, LayoutGrid, List } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTaskStore } from '../hooks/useTaskStore';
import { KanbanBoard } from '../components/KanbanBoard';

export function MyTasks() {
    const { tasks, toggleTask, deleteTask, updateTask, fetchTasks } = useTaskStore();
    const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return (
        <div className="flex-1 h-screen overflow-hidden p-6 bg-background">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Tasks</h1>
                    <p className="text-gray-400">Manage your daily priorities</p>
                </div>

                <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            viewMode === 'list' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                        title="List View"
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('board')}
                        className={cn(
                            "p-2 rounded-lg transition-all",
                            viewMode === 'board' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                        title="Board View"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {viewMode === 'board' ? (
                <div className="h-[calc(100%-100px)]">
                    <KanbanBoard
                        tasks={tasks}
                        onUpdateStatus={(id, status) => updateTask(id, { status })}
                    />
                </div>
            ) : (
                <GlassCard className="h-[calc(100%-100px)] overflow-y-auto custom-scrollbar">
                    {tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <p>No tasks yet. Create one from the Dashboard!</p>
                        </div>
                    ) : (
                        <div className="space-y-4 p-2">
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border border-white/5 transition-all hover:bg-white/5 group",
                                        task.completed ? "bg-white/5 opacity-60" : "bg-transparent"
                                    )}
                                >
                                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleTask(task.id)}>
                                        {task.completed
                                            ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            : <Circle className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                                        }
                                        <div className="flex flex-col">
                                            <span className={cn("text-lg font-medium", task.completed && "line-through text-gray-500")}>
                                                {task.title}
                                            </span>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border border-white/10 uppercase tracking-wider ${task.priority === 'Critical' ? 'text-red-400 border-red-400/20 bg-red-400/10' :
                                                    task.priority === 'High' ? 'text-amber-400 border-amber-400/20 bg-amber-400/10' :
                                                        'text-blue-400 border-blue-400/20 bg-blue-400/10'
                                                    }`}>
                                                    {task.priority}
                                                </span>
                                                <span>•</span>
                                                <span className="text-gray-300">{task.status}</span>
                                                <span>•</span>
                                                <span>{task.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                                            {task.assignee ? task.assignee.charAt(0) : '?'}
                                        </div>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </GlassCard>
            )}
        </div>
    );
}
