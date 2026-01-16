import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Tag, Flag, User, AlignLeft, CheckSquare, Plus, Check } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useTaskStore, type Task } from '../hooks/useTaskStore';
import { useTeamStore } from '../hooks/useTeamStore';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
}

import { useToast } from '../hooks/useToast';

export function TaskModal({ isOpen, onClose }: TaskModalProps) {
    const { addTask } = useTaskStore();
    const { members } = useTeamStore();
    const { showToast } = useToast();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [priority, setPriority] = useState<Task['priority']>('Normal');
    const [status, setStatus] = useState<Task['status']>('To Do');
    const [assignee, setAssignee] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Subtask State
    const [subtasks, setSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
    const [newSubtask, setNewSubtask] = useState('');

    const availableTags = ['Design', 'Dev', 'Marketing', 'Bug', 'Feature', 'Research'];

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        setSubtasks([...subtasks, { id: Math.random().toString(36).substring(7), title: newSubtask, completed: false }]);
        setNewSubtask('');
    };

    const removeSubtask = (id: string) => {
        setSubtasks(subtasks.filter(st => st.id !== id));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) return;

        addTask({
            title,
            description,
            date,
            time,
            priority,
            status,
            assignee: assignee || undefined,
            tags: selectedTags,
            subtasks,
            category: 'Work' // Default for now
        });

        // Reset
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setPriority('Normal');
        setStatus('To Do');
        setAssignee('');
        setSelectedTags([]);
        setSubtasks([]);
        showToast('Task created successfully!', 'success');
        onClose();
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar relative z-10"
                    >
                        <GlassCard className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Create New Task</h2>
                                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Title */}
                                <div>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Task Title"
                                        className="w-full bg-transparent text-xl font-bold text-white placeholder:text-gray-600 focus:outline-none border-b border-white/10 pb-2 focus:border-primary transition-colors"
                                        autoFocus
                                    />
                                </div>

                                {/* Description */}
                                <div className="flex gap-3">
                                    <AlignLeft className="w-5 h-5 text-gray-500 mt-1" />
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Add description..."
                                        rows={3}
                                        className="flex-1 bg-black/20 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none border border-white/5"
                                    />
                                </div>

                                {/* Checklist / Subtasks */}
                                <div className="flex gap-3">
                                    <CheckSquare className="w-5 h-5 text-gray-500 mt-1" />
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-gray-400">Checklist</label>
                                            <span className="text-xs text-gray-500">{subtasks.length} items</span>
                                        </div>

                                        {/* Subtask Input */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newSubtask}
                                                onChange={(e) => setNewSubtask(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                                                placeholder="Add a subtask..."
                                                className="flex-1 bg-black/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none border border-white/5 focus:border-primary/50"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddSubtask}
                                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Subtask List */}
                                        <div className="space-y-2">
                                            {subtasks.map(st => (
                                                <div key={st.id} className="flex items-center justify-between group p-2 rounded-lg hover:bg-white/5 transition-colors">
                                                    <span className="text-sm text-gray-300 flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                        {st.title}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSubtask(st.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-1"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Meta Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Flag className="w-3 h-3" /> Priority
                                        </label>
                                        <select
                                            value={priority}
                                            onChange={e => setPriority(e.target.value as any)}
                                            className="w-full bg-black/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none border border-white/5"
                                        >
                                            <option value="Critical">🔴 Critical</option>
                                            <option value="High">🟠 High</option>
                                            <option value="Normal">🔵 Normal</option>
                                            <option value="Low">🟢 Low</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Tag className="w-3 h-3" /> Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={e => setStatus(e.target.value as any)}
                                            className="w-full bg-black/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none border border-white/5"
                                        >
                                            <option value="To Do">To Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="In Review">In Review</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" /> Date
                                        </label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="w-full bg-black/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none border border-white/5"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> Time
                                        </label>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={e => setTime(e.target.value)}
                                            className="w-full bg-black/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none border border-white/5"
                                        />
                                    </div>

                                    <div className="space-y-1 col-span-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                            <User className="w-3 h-3" /> Assignee
                                        </label>
                                        <select
                                            value={assignee}
                                            onChange={e => setAssignee(e.target.value)}
                                            className="w-full bg-black/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none border border-white/5"
                                        >
                                            <option value="">Unassigned</option>
                                            {members.map(m => (
                                                <option key={m.id} value={m.name}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${selectedTags.includes(tag)
                                                    ? 'bg-primary/20 border-primary text-primary'
                                                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-4 rounded-xl mt-4 hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Check className="w-5 h-5" />
                                    <span>Create Task</span>
                                </button>
                            </form>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
