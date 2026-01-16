import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Layout, Folder, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useTaskStore } from '../hooks/useTaskStore';
import { useProjectStore } from '../hooks/useProjectStore';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const { tasks } = useTaskStore();
    const { projects } = useProjectStore();

    // Keyboard shortcut (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                // This would need to be handled by a parent if we wanted to toggle, 
                // but since this is inside the modal, we can just focus input if open.
            }
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Filtering
    const filteredTasks = query ? tasks.filter(t => t.title.toLowerCase().includes(query.toLowerCase())) : [];
    const filteredProjects = query ? projects.filter(p => p.title.toLowerCase().includes(query.toLowerCase())) : [];

    const hasResults = filteredTasks.length > 0 || filteredProjects.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start pt-32 justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-2xl relative z-10"
                    >
                        <GlassCard className="overflow-hidden p-0 flex flex-col max-h-[60vh]">
                            {/* Input */}
                            <div className="p-4 border-b border-white/5 flex items-center gap-3">
                                <Search className="w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Search tasks, projects..."
                                    className="flex-1 bg-transparent text-lg text-white placeholder:text-gray-600 focus:outline-none"
                                    autoFocus
                                />
                                <div className="text-xs font-mono text-gray-600 border border-white/5 rounded px-1.5 py-0.5">ESC</div>
                            </div>

                            {/* Results */}
                            <div className="overflow-y-auto custom-scrollbar p-2">
                                {!query && (
                                    <div className="py-12 text-center text-gray-500 text-sm">
                                        Type to search...
                                    </div>
                                )}

                                {query && !hasResults && (
                                    <div className="py-12 text-center text-gray-500 text-sm">
                                        No results found.
                                    </div>
                                )}

                                {query && hasResults && (
                                    <div className="space-y-4 p-2">
                                        {filteredTasks.length > 0 && (
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-500 uppercase px-2 mb-2">Tasks</h3>
                                                <div className="space-y-1">
                                                    {filteredTasks.map(task => (
                                                        <div key={task.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group cursor-pointer transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <Layout className="w-4 h-4 text-primary" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-white">{task.title}</div>
                                                                    <div className="text-xs text-gray-500">{task.status} • {task.priority}</div>
                                                                </div>
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {filteredProjects.length > 0 && (
                                            <div>
                                                <h3 className="text-xs font-bold text-gray-500 uppercase px-2 mb-2">Projects</h3>
                                                <div className="space-y-1">
                                                    {filteredProjects.map(project => (
                                                        <div key={project.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg group cursor-pointer transition-colors">
                                                            <div className="flex items-center gap-3">
                                                                <Folder className="w-4 h-4 text-purple-500" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-white">{project.title}</div>
                                                                    <div className="text-xs text-gray-500">{project.status} • {project.category}</div>
                                                                </div>
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
