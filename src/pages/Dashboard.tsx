import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useTaskStore } from '../hooks/useTaskStore';
import { useProjectStore } from '../hooks/useProjectStore';
import { useAuthStore } from '../hooks/useAuthStore';
import { useTrial } from '../hooks/useTrial';
import { TaskModal } from '../components/TaskModal';
import { PremiumModal } from '../components/PremiumModal';
import { TaskCard } from '../components/TaskCard';
import { Plus, Layout, Folder, Calendar as CalendarIcon, DollarSign, Filter, AlertTriangle } from 'lucide-react';

const categories = ['All', 'Work', 'Personal', 'Design', 'Meeting', 'Dev'];
const priorities = ['All Priorities', 'Critical', 'High', 'Normal', 'Low'];

export function Dashboard() {
    const { tasks, fetchTasks } = useTaskStore();
    const { projects, fetchProjects } = useProjectStore();
    const { profile, user } = useAuthStore();
    const { isExpired, isPremium } = useTrial();

    useEffect(() => {
        if (user) {
            fetchTasks();
            fetchProjects();
        }
    }, [user, fetchTasks, fetchProjects]);

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPriority, setSelectedPriority] = useState('All Priorities');
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

    const handleAddTask = () => {
        if (!isPremium && isExpired) {
            setIsPremiumModalOpen(true);
        } else {
            setIsTaskModalOpen(true);
        }
    };

    // --- AGGREGATION & FILTERING LOGIC ---
    const getFilteredItems = () => {
        const catQuery = selectedCategory.toLowerCase();

        let filteredTasks = tasks;
        let filteredProjects = projects;

        // 1. Category Filter
        if (selectedCategory !== 'All') {
            filteredTasks = filteredTasks.filter(t => t.category.toLowerCase() === catQuery);
            filteredProjects = filteredProjects.filter(p => p.category?.toLowerCase() === catQuery);
        }

        // 2. Priority Filter
        if (selectedPriority !== 'All Priorities') {
            filteredTasks = filteredTasks.filter(t => t.priority === selectedPriority);
            filteredProjects = filteredProjects.filter(p => p.priority === selectedPriority);
        }

        return { tasks: filteredTasks, projects: filteredProjects };
    };

    const { tasks: displayTasks, projects: displayProjects } = getFilteredItems();
    const hasItems = displayTasks.length > 0 || displayProjects.length > 0;

    return (
        <div className="flex-1 h-screen overflow-hidden flex flex-col relative">
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex justify-between items-center z-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        Welcome, {(() => {
                            const name = profile?.full_name?.split(' ')[0] ||
                                user?.user_metadata?.full_name?.split(' ')[0] ||
                                user?.email?.split('@')[0] ||
                                'Guest';
                            return name.charAt(0).toUpperCase() + name.slice(1);
                        })()}!
                    </h1>
                    <p className="text-gray-400">Your central hub for everything.</p>
                </div>
                <button
                    onClick={handleAddTask}
                    className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Task</span>
                </button>
            </div>

            {/* Filters Row */}
            <div className="px-8 mb-6 shrink-0 z-10 flex flex-col gap-4">
                {/* Categories */}
                <div className="overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === cat
                                    ? 'bg-white text-black shadow-lg shadow-white/10 scale-105'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                        <Filter className="w-4 h-4" />
                        <span>Filter by:</span>
                    </div>
                    <div className="flex gap-2">
                        {priorities.map(p => (
                            <button
                                key={p}
                                onClick={() => setSelectedPriority(p)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${selectedPriority === p
                                    ? 'bg-primary/20 text-primary border-primary/30'
                                    : 'bg-transparent text-gray-500 border-transparent hover:bg-white/5 hover:text-gray-300'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>


            {/* Analytics Section */}
            <div className="px-8 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Weekly Progress</p>
                        <h3 className="text-2xl font-bold text-white">
                            {Math.round((tasks.filter(t => t.completed).length / (tasks.length || 1)) * 100)}%
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Completion Rate</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent border-r-transparent -rotate-45" />
                    </div>
                </GlassCard>

                <GlassCard className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Pending Tasks</p>
                        <h3 className="text-2xl font-bold text-white">
                            {tasks.filter(t => !t.completed).length}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Total: {tasks.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Layout className="w-5 h-5" />
                    </div>
                </GlassCard>

                <GlassCard className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium mb-1">Active Projects</p>
                        <h3 className="text-2xl font-bold text-white">
                            {projects.filter(p => p.status !== 'Completed').length}
                        </h3>
                        <p className="text-xs text-xs text-gray-500 mt-1">Completed: {projects.filter(p => p.status === 'Completed').length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Folder className="w-5 h-5" />
                    </div>
                </GlassCard>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-32 custom-scrollbar">

                {/* Error State */}
                {(useTaskStore.getState().error || useProjectStore.getState().error) ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-center text-red-400 gap-4">
                        <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Unable to Load Data</h3>
                        <div className="max-w-md text-sm border border-red-500/20 bg-red-500/10 p-3 rounded-xl">
                            {useTaskStore.getState().error || useProjectStore.getState().error}
                        </div>
                        <button
                            onClick={() => { fetchTasks(); fetchProjects(); }}
                            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-xl text-white font-medium transition-all"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : !hasItems && (
                    <div className="flex flex-col items-center justify-center pt-20 text-center opacity-50">
                        <Folder className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Items Found</h3>
                        <p className="text-gray-400">
                            No items match your selected filters.
                        </p>
                    </div>
                )}

                {/* PROJECTS GRID (If any) */}
                {displayProjects.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Folder className="w-4 h-4" /> Active Projects
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayProjects.map(p => (
                                <GlassCard key={p.id} className="p-5 hover:bg-white/10 transition-colors cursor-pointer group relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${p.priority === 'High' ? 'border-red-500/30 text-red-500' : 'border-amber-500/30 text-amber-500'} uppercase`}>
                                                {p.priority}
                                            </span>
                                            <span className="px-2 py-1 rounded text-[10px] font-bold border border-white/10 text-gray-400 uppercase">
                                                {p.category}
                                            </span>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold mb-1">{p.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-3">
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="w-3 h-3" />
                                            {new Date(p.endDate).toLocaleDateString()}
                                        </div>
                                        {p.budget && (
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                ${p.budget}
                                            </div>
                                        )}
                                    </div>
                                    {/* Project Progress Bar */}
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                                        <div className={`h-full ${p.status === 'Completed' ? 'w-full bg-green-500' : p.status === 'In Progress' ? 'w-1/2 bg-blue-500' : 'w-1/6 bg-purple-500'}`} />
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}

                {/* TASKS GRID (If any) */}
                {displayTasks.length > 0 && (
                    <div>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Layout className="w-4 h-4" /> Tasks
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
            <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
            <div className="absolute bottom-2 right-4 text-xs text-gray-600 font-mono">v1.4 - Missing Col Fix</div>
        </div>
    );
}
