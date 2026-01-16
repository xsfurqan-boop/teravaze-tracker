import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    department: 'Engineering' | 'Design' | 'Marketing' | 'Sales';
    accessLevel: 'Admin' | 'Member' | 'Viewer';
    status: 'Online' | 'Busy' | 'On Leave' | 'Offline';
}

export interface TeamState {
    members: TeamMember[];
    isLoading: boolean;
    error: string | null;
    fetchMembers: () => Promise<void>;
    addMember: (member: Omit<TeamMember, 'id' | 'user_id'>) => Promise<void>;
    updateMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
    deleteMember: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
    members: [],
    isLoading: false,
    error: null,

    fetchMembers: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map DB snake_case to TS camelCase
            const mappedMembers = (data || []).map((m: any) => ({
                ...m,
                accessLevel: m.access_level
            }));

            set({ members: mappedMembers });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    addMember: async (member) => {
        set({ isLoading: true, error: null });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            // Map TS camelCase to DB snake_case
            const dbMember = {
                name: member.name,
                role: member.role,
                email: member.email,
                department: member.department,
                access_level: member.accessLevel,
                status: member.status,
                user_id: user.id
            };

            const { data, error } = await supabase
                .from('team_members')
                .insert([dbMember])
                .select()
                .single();

            if (error) throw error;

            const mappedMember = { ...data, accessLevel: data.access_level };
            set((state) => ({ members: [mappedMember, ...state.members] }));
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    updateMember: async (id, updates) => {
        // Optimistic
        set((state) => ({
            members: state.members.map((m) => m.id === id ? { ...m, ...updates } : m)
        }));

        try {
            // Map updates to DB format
            const dbUpdates: any = { ...updates };
            if (updates.accessLevel) {
                dbUpdates.access_level = updates.accessLevel;
                delete dbUpdates.accessLevel;
            }

            const { error } = await supabase
                .from('team_members')
                .update(dbUpdates)
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            set({ error: error.message });
            get().fetchMembers();
        }
    },

    deleteMember: async (id) => {
        // Optimistic
        set((state) => ({
            members: state.members.filter((m) => m.id !== id)
        }));

        try {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            set({ error: error.message });
            get().fetchMembers();
        }
    },
}));
