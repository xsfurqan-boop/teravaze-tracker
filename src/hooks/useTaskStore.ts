import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Task {
    id: string;
    title: string;
    description?: string;
    category: 'Work' | 'Personal' | 'Design' | 'Meeting' | 'Dev';
    priority: 'Critical' | 'High' | 'Normal' | 'Low';
    status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
    assignee?: string; // Storing the name/id of the team member
    tags: string[];
    subtasks: { id: string; title: string; completed: boolean }[];
    date: string;
    time: string;
    completed: boolean;
}

export interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;
    fetchTasks: () => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'completed' | 'user_id'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            set({ tasks: data || [] });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    addTask: async (task) => {
        set({ isLoading: true, error: null });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            const newTask = {
                ...task,
                user_id: user.id,
                completed: false,
                subtasks: task.subtasks || [], // Ensure JSONB compatibility
            };

            const { data, error } = await supabase
                .from('tasks')
                .insert([newTask])
                .select()
                .single();

            if (error) throw error;
            set((state) => ({ tasks: [data, ...state.tasks] }));
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    updateTask: async (id, updates) => {
        // Optimistic update
        set((state) => ({
            tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
        }));

        try {
            const { error } = await supabase
                .from('tasks')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            set({ error: error.message });
            // Rollback could be implemented here if complex
            get().fetchTasks(); // Revert to server state on error
        }
    },

    deleteTask: async (id) => {
        // Optimistic update
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id)
        }));

        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            set({ error: error.message });
            get().fetchTasks();
        }
    },

    toggleTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;

        const newStatus = !task.completed;

        // Optimistic
        set((state) => ({
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, completed: newStatus } : t
            )
        }));

        try {
            const { error } = await supabase
                .from('tasks')
                .update({ completed: newStatus })
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            set({ error: error.message });
            get().fetchTasks();
        }
    },
}));
