import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Plus, Trash2, Calendar as CalendarIcon, DollarSign, Flag, X, ChevronDown, Pencil } from 'lucide-react';
import { useProjectStore, type Project } from '../hooks/useProjectStore';
import { useTeamStore } from '../hooks/useTeamStore';
import { AnimatePresence, motion } from 'framer-motion';

export function Projects() {
    const { projects, addProject, updateProject, deleteProject, fetchProjects } = useProjectStore();
    const { members } = useTeamStore();

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Modal Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [priority, setPriority] = useState<Project['priority']>('Medium');
    const [category, setCategory] = useState<Project['category']>('Work');
    const [status, setStatus] = useState<Project['status']>('Planning');
    const [selectedTeam, setSelectedTeam] = useState<string[]>([]);

    const openCreateModal = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setBudget('');
        setPriority('Medium');
        setCategory('Work');
        setStatus('Planning');
        setSelectedTeam([]);
        setIsModalOpen(true);
    };

    const openEditModal = (p: Project) => {
        setEditingId(p.id);
        setTitle(p.title);
        setDescription(p.description);
        setStartDate(p.startDate);
        setEndDate(p.endDate);
        setBudget(p.budget);
        setPriority(p.priority);
        setCategory(p.category);
        setStatus(p.status);
        setSelectedTeam(p.teamMembers);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!title || !startDate || !endDate) return;

        // Auto assign color based on status (simplified logic for now)
        let color = 'text-gray-400';
        let bg = 'bg-gray-400/10';

        switch (status) {
            case 'In Progress': color = 'text-blue-400'; bg = 'bg-blue-400/10'; break;
            case 'Planning': color = 'text-purple-400'; bg = 'bg-purple-400/10'; break;
            case 'Completed': color = 'text-green-400'; bg = 'bg-green-400/10'; break;
        }

        const projectData = {
            title,
            description,
            startDate,
            endDate,
            budget,
            priority,
            category,
            teamMembers: selectedTeam,
            status,
            color,
            bg
        };

        try {
            if (editingId) {
                await updateProject(editingId, projectData);
            } else {
                await addProject(projectData);
            }

            // Check for store errors
            const error = useProjectStore.getState().error;
            if (error) {
                alert(`Error: ${error}`); // Using alert as toast hook isn't imported here yet
                return;
            }

            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save project');
        }
    };

    const toggleTeamMember = (name: string) => {
        if (selectedTeam.includes(name)) {
            setSelectedTeam(selectedTeam.filter(t => t !== name));
        } else {
            setSelectedTeam([...selectedTeam, name]);
        }
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Low': return 'text-green-400 bg-green-400/10 border-green-400/20';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="flex-1 h-screen overflow-hidden p-6 bg-background relative">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-gray-400">Track initiatives and goals</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20 max-h-[calc(100vh-150px)]">
                {useProjectStore.getState().error ? (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 text-red-400 gap-2">
                        <p className="font-bold">Error loading projects</p>
                        <p className="text-sm border border-red-500/20 bg-red-500/10 p-2 rounded">{useProjectStore.getState().error}</p>
                        <button onClick={() => fetchProjects()} className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20 mt-2 text-white">Retry</button>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-400">
                        <p>No projects yet.</p>
                    </div>
                ) : projects.map((p) => (
                    <GlassCard key={p.id} className="p-6 flex flex-col justify-between hover:translate-y-[-4px] transition-transform cursor-pointer relative group min-h-[250px]">

                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); openEditModal(p); }}
                                className="p-2 bg-black/40 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Edit Project"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                                className="p-2 bg-black/40 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition-all"
                                title="Delete Project"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.color} ${p.bg}`}>
                                    {p.status}
                                </span>
                                <div className="flex gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-white/10 text-gray-400 uppercase tracking-wider">
                                        {p.category}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityColor(p.priority)} uppercase tracking-wider`}>
                                        {p.priority}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2 leading-tight">{p.title}</h3>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                {p.description || "No description provided."}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                <div className="flex items-center gap-1.5">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    <span>Due: {new Date(p.endDate).toLocaleDateString()}</span>
                                </div>
                                {p.budget && (
                                    <div className="flex items-center gap-1.5">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        <span>${p.budget}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex -space-x-2">
                                {p.teamMembers && p.teamMembers.slice(0, 3).map((member, idx) => (
                                    <div key={idx} className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 border-2 border-[#121212] flex items-center justify-center text-[10px] font-bold text-white text-center leading-none" title={member}>
                                        {member.charAt(0)}
                                    </div>
                                ))}
                                {p.teamMembers && p.teamMembers.length > 3 && (
                                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#121212] flex items-center justify-center text-xs font-bold">
                                        +{p.teamMembers.length - 3}
                                    </div>
                                )}
                            </div>
                            <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${p.status === 'Completed' ? 'w-full bg-green-500' : p.status === 'In Progress' ? 'w-1/2 bg-blue-500' : 'w-1/6 bg-purple-500'}`} />
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Comprehensive Project Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <GlassCard className="p-8">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold">{editingId ? 'Edit Project' : 'Create New Project'}</h2>
                                        <p className="text-gray-400">Define goals, timeline, and resources.</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                                </div>

                                <div className="space-y-6">
                                    {/* Main Info */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Project Title</label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                                                placeholder="e.g. Q3 Marketing Sprint"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                                            <textarea
                                                value={description}
                                                onChange={e => setDescription(e.target.value)}
                                                rows={3}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600 resize-none"
                                                placeholder="Outline the main objectives and scope..."
                                            />
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Start Date</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={e => setStartDate(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">End Date</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={e => setEndDate(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Budget ($)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="number"
                                                    value={budget}
                                                    onChange={e => setBudget(e.target.value)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-primary"
                                                    placeholder="5000"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                                            <div className="relative">
                                                <select
                                                    value={category}
                                                    onChange={e => setCategory(e.target.value as any)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                                                >
                                                    <option value="Work">Work</option>
                                                    <option value="Personal">Personal</option>
                                                    <option value="Design">Design</option>
                                                    <option value="Meeting">Meeting</option>
                                                    <option value="Dev">Dev</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
                                            <div className="relative">
                                                <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <select
                                                    value={priority}
                                                    onChange={e => setPriority(e.target.value as any)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                                                >
                                                    <option value="High">🔴 High Priority</option>
                                                    <option value="Medium">🟡 Medium Priority</option>
                                                    <option value="Low">🟢 Low Priority</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team & Status */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Assign Team Members</label>
                                            <div className="flex flex-wrap gap-2 p-3 bg-black/20 border border-white/10 rounded-xl min-h-[50px]">
                                                {members.map(member => (
                                                    <button
                                                        key={member.id}
                                                        onClick={() => toggleTeamMember(member.name)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${selectedTeam.includes(member.name)
                                                            ? 'bg-primary/20 text-primary border-primary/30'
                                                            : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {member.name}
                                                    </button>
                                                ))}
                                                {members.length === 0 && <span className="text-gray-500 text-sm italic">No team members added yet. Go to Team page.</span>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Initial Status</label>
                                            <div className="flex gap-4">
                                                {['Planning', 'In Progress', 'Completed'].map((s) => (
                                                    <label key={s} className="flex items-center gap-2 cursor-pointer group">
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${status === s ? 'border-primary' : 'border-gray-500'}`}>
                                                            {status === s && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                                                        </div>
                                                        <span className={`text-sm ${status === s ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{s}</span>
                                                        <input
                                                            type="radio"
                                                            name="status"
                                                            value={s}
                                                            checked={status === s}
                                                            onChange={() => setStatus(s as any)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-4 rounded-xl mt-4 hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]"
                                    >
                                        {editingId ? 'Save Changes' : 'Create Project'}
                                    </button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
