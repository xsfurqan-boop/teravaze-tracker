import { GlassCard } from './GlassCard';
import { Clock, CheckCircle2, Circle, Trash2, Flag } from 'lucide-react';
import { useTaskStore, type Task } from '../hooks/useTaskStore';
import { useToast } from '../hooks/useToast';

interface TaskCardProps {
    task: Task;
}

const PRIORITY_COLORS = {
    'Critical': 'text-red-500 bg-red-500/10 border-red-500/20',
    'High': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    'Normal': 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    'Low': 'text-green-500 bg-green-500/10 border-green-500/20'
};

export function TaskCard({ task }: TaskCardProps) {
    const { toggleTask, deleteTask } = useTaskStore();
    const { showToast } = useToast();

    // Prevent propagation
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleTask(task.id);
        if (!task.completed) {
            showToast('Task completed! Great job! 🎉', 'success');
        }
    };

    const getGradient = (cat: string) => {
        switch (cat) {
            case 'Design': return 'from-purple-500 to-indigo-500';
            case 'Meeting': return 'from-pink-500 to-rose-500';
            case 'Work': return 'from-blue-500 to-cyan-500';
            case 'Personal': return 'from-orange-500 to-amber-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    return (
        <GlassCard className="p-0 overflow-hidden group relative hover:translate-y-[-2px] transition-transform min-h-[220px] flex flex-col">
            {/* Delete Button */}
            <button
                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/20 transition-all z-20"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className={`h-1.5 w-full bg-gradient-to-r ${getGradient(task.category)}`} />

            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border border-white/10 px-2 py-0.5 rounded">
                            {task.category}
                        </span>
                        {task.priority && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded flex items-center gap-1 ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS['Normal']}`}>
                                <Flag className="w-2.5 h-2.5" /> {task.priority}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleToggle}
                        className={`transition-colors relative z-10 ${task.completed ? 'text-green-500' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                        {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                </div>

                <h3 className={`font-semibold text-lg mb-2 leading-tight ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                    {task.title}
                </h3>

                {task.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                        {task.description}
                    </p>
                )}

                {/* Subtask Progress */}
                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mb-3">
                        <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{task.subtasks.filter(t => t.completed).length}/{task.subtasks.length}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${(task.subtasks.filter(t => t.completed).length / task.subtasks.length) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(task.date).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Status Dot */}
                        {task.status && (
                            <span className="text-[10px] text-gray-500 font-medium">
                                {task.status}
                            </span>
                        )}

                        {/* Assignee Avatar */}
                        {task.assignee ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white border border-white/10" title={task.assignee}>
                                {task.assignee.charAt(0)}
                            </div>
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 border-dashed flex items-center justify-center" title="Unassigned">
                                <span className="text-[10px] text-gray-600">?</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tags row */}
                {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {task.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5">
                                #{tag}
                            </span>
                        ))}
                        {task.tags.length > 3 && <span className="text-[9px] text-gray-500">+{task.tags.length - 3}</span>}
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
