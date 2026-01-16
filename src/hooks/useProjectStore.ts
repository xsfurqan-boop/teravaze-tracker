import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Project {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    budget: string;
    priority: 'High' | 'Medium' | 'Low';
    category: 'Work' | 'Personal' | 'Design' | 'Meeting' | 'Dev';
    teamMembers: string[];
    status: 'In Progress' | 'Planning' | 'Completed';
    color: string;
    bg: string;
}

export interface ProjectState {
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    fetchProjects: () => Promise<void>;
    addProject: (project: Omit<Project, 'id' | 'user_id'>) => Promise<void>;
    updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,

    fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ projects: data || [] });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    addProject: async (project) => {
        set({ isLoading: true, error: null });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            const { data, error } = await supabase
                .from('projects')
                .insert([{ ...project, user_id: user.id }])
                .select()
                .single();

            if (error) throw error;
            set((state) => ({ projects: [data, ...state.projects] }));
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    updateProject: async (id, updates) => {
        // Optimistic
        set((state) => ({
            projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p)
        }));

        try {
            const { error } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            set({ error: error.message });
            get().fetchProjects();
        }
    },

    deleteProject: async (id) => {
        // Optimistic
        set((state) => ({
            projects: state.projects.filter((p) => p.id !== id)
        }));

        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            set({ error: error.message });
            get().fetchProjects();
        }
    },
}));
