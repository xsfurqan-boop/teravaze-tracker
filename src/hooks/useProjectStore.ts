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

            // Map DB snake_case to Frontend camelCase
            const mappedProjects = (data || []).map((p: any) => ({
                ...p,
                startDate: p.start_date,
                endDate: p.end_date,
                teamMembers: p.team_members || []
            }));

            set({ projects: mappedProjects });
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

            // Map Frontend camelCase to DB snake_case
            const { startDate, endDate, teamMembers, ...rest } = project;
            const dbProject = {
                ...rest,
                start_date: startDate,
                end_date: endDate,
                team_members: teamMembers,
                user_id: user.id
            };

            const { data, error } = await supabase
                .from('projects')
                .insert([dbProject])
                .select()
                .single();

            if (error) throw error;

            // Map back to frontend model for state update
            const newProject = {
                ...data,
                startDate: project.startDate,
                endDate: project.endDate,
                teamMembers: project.teamMembers
            };

            set((state) => ({ projects: [newProject, ...state.projects] }));
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
            // Map updates to DB keys
            const dbUpdates: any = { ...updates };
            if ('startDate' in updates) {
                dbUpdates.start_date = updates.startDate;
                delete dbUpdates.startDate;
            }
            if ('endDate' in updates) {
                dbUpdates.end_date = updates.endDate;
                delete dbUpdates.endDate;
            }
            if ('teamMembers' in updates) {
                dbUpdates.team_members = updates.teamMembers;
                delete dbUpdates.teamMembers;
            }

            const { error } = await supabase
                .from('projects')
                .update(dbUpdates)
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
