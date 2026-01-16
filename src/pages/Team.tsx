import { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Plus, Trash2, X, Mail, Shield, Briefcase, AtSign, ChevronDown } from 'lucide-react';
import { useTeamStore, type TeamMember } from '../hooks/useTeamStore';
import { AnimatePresence, motion } from 'framer-motion';

export function Team() {
    const { members, addMember, updateMember, deleteMember, fetchMembers } = useTeamStore();

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Modal State
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState<TeamMember['department']>('Engineering');
    const [accessLevel, setAccessLevel] = useState<TeamMember['accessLevel']>('Member');
    const [status, setStatus] = useState<TeamMember['status']>('Online');

    const handleEdit = (member: TeamMember) => {
        setEditingId(member.id);
        setName(member.name);
        setRole(member.role);
        setEmail(member.email);
        setDepartment(member.department);
        setAccessLevel(member.accessLevel);
        setStatus(member.status);
        setIsModalOpen(true);
    };

    const handleCreateOrUpdate = () => {
        if (!name || !email || !role) return;

        if (editingId) {
            updateMember(editingId, {
                name, role, email, department, accessLevel, status
            });
        } else {
            addMember({
                name, role, email, department, accessLevel, status
            });
        }

        // Reset
        setName('');
        setRole('');
        setEmail('');
        setDepartment('Engineering');
        setAccessLevel('Member');
        setStatus('Online');
        setEditingId(null);
        setIsModalOpen(false);
    };

    const openNewModal = () => {
        setEditingId(null);
        setName('');
        setRole('');
        setEmail('');
        setDepartment('Engineering');
        setAccessLevel('Member');
        setStatus('Online');
        setIsModalOpen(true);
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Online': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'Busy': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'On Leave': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getAccessBadge = (l: string) => {
        switch (l) {
            case 'Admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'Member': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'Viewer': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default: return '';
        }
    };

    return (
        <div className="flex-1 h-screen overflow-hidden p-6 bg-background relative">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Team Directory</h1>
                    <p className="text-gray-400">Manage access and collaboration</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex items-center gap-2 bg-primary px-4 py-2 rounded-xl text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-20 max-h-[calc(100vh-150px)]">
                {members.map((m) => (
                    <GlassCard key={m.id} onClick={() => handleEdit(m)} className="p-0 overflow-hidden hover:translate-y-[-4px] transition-transform cursor-pointer relative group flex flex-col">
                        {/* Header Gradient */}
                        <div className="h-20 bg-gradient-to-r from-gray-800 to-gray-700 relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteMember(m.id); }}
                                className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/20 transition-all z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Avatar & Main Info */}
                        <div className="px-6 relative flex-1 flex flex-col items-center -mt-10">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border-4 border-[#121212] shadow-xl mb-3">
                                <span className="text-3xl font-bold text-white">{m.name.charAt(0)}</span>
                            </div>

                            <h3 className="text-lg font-bold text-center">{m.name}</h3>
                            <p className="text-sm text-primary font-medium mb-1">{m.role}</p>
                            <p className="text-xs text-gray-500 mb-4">{m.department}</p>

                            <div className="flex items-center gap-2 mb-6">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(m.status)} uppercase tracking-wider`}>
                                    {m.status}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getAccessBadge(m.accessLevel)} uppercase tracking-wider flex items-center gap-1`}>
                                    {m.accessLevel === 'Admin' && <Shield className="w-3 h-3" />}
                                    {m.accessLevel}
                                </span>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
                            <a href={`mailto:${m.email}`} className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors">
                                <Mail className="w-3.5 h-3.5" />
                                {m.email}
                            </a>
                        </div>
                    </GlassCard>
                ))}
            </div>

            {/* Comprehensive Team Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-lg overflow-y-auto max-h-[90vh] custom-scrollbar"
                        >
                            <GlassCard className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold">{editingId ? 'Edit Team Member' : 'Add Team Member'}</h3>
                                        <p className="text-gray-400 text-sm">{editingId ? 'Update member details' : 'Onboard a new user to the organization'}</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                                </div>

                                <div className="space-y-4">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary pl-10"
                                                placeholder="e.g. John Doe"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rounded-full border border-gray-500 flex items-center justify-center text-[10px] font-bold">?</div>
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Title / Role</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                value={role}
                                                onChange={e => setRole(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary pl-10"
                                                placeholder="e.g. Senior Developer"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
                                        <div className="relative">
                                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary pl-10"
                                                placeholder="john@company.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Department */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Department</label>
                                            <div className="relative">
                                                <select
                                                    value={department}
                                                    onChange={e => setDepartment(e.target.value as any)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary appearance-none cursor-pointer text-sm"
                                                >
                                                    <option value="Engineering">Engineering</option>
                                                    <option value="Design">Design</option>
                                                    <option value="Marketing">Marketing</option>
                                                    <option value="Sales">Sales</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Access Level */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Access Level</label>
                                            <div className="relative">
                                                <select
                                                    value={accessLevel}
                                                    onChange={e => setAccessLevel(e.target.value as any)}
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary appearance-none cursor-pointer text-sm"
                                                >
                                                    <option value="Member">Member</option>
                                                    <option value="Admin">Admin</option>
                                                    <option value="Viewer">Viewer</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Current Status</label>
                                        <div className="flex gap-2">
                                            {['Online', 'Busy', 'On Leave'].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setStatus(s as any)}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${status === s
                                                        ? 'bg-white/10 border-white/30 text-white'
                                                        : 'bg-transparent border-white/5 text-gray-500 hover:bg-white/5'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreateOrUpdate}
                                        className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]"
                                    >
                                        {editingId ? 'Update Member' : 'Add Member'}
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
