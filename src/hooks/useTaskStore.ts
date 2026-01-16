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

            // Map backend fields to frontend model
            const mappedTasks = (data || []).map((t: any) => ({
                ...t,
                date: t.due_date ? t.due_date.split('T')[0] : '',
                time: t.due_date && t.due_date.includes('T') ? t.due_date.split('T')[1].substring(0, 5) : ''
            }));

            set({ tasks: mappedTasks });
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

            // Combine date and time into due_date
            const due_date = task.date && task.time ? `${task.date}T${task.time}:00` : task.date ? `${task.date}T00:00:00` : null;

            // Prepare object for Supabase (remove frontend-only fields)
            const { date, time, ...taskData } = task;

            const newTask = {
                ...taskData,
                user_id: user.id,
                due_date,
                completed: false,
                subtasks: task.subtasks || [], // Ensure JSONB compatibility
            };

            const { data, error } = await supabase
                .from('tasks')
                .insert([newTask])
                .select()
                .single();

            if (error) throw error;

            // Map back for local state
            const createdTask = {
                ...data,
                date: task.date,
                time: task.time
            };

            set((state) => ({ tasks: [createdTask, ...state.tasks] }));
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
            // Map frontend fields to backend
            const dbUpdates: any = { ...updates };

            // Handle date separation
            if ('date' in updates || 'time' in updates) {
                // We need the current task to merge if one field is missing, is trickier.
                // For simplicity, if either changes, we construct due_date from scratch if both present in updates,
                // or we rely on the caller passing both? 
                // Better approach: fetch current task to merge? No that's slow.
                // Alternative: just update what we have. 
                // Since this app usually updates them together via modal, let's look for both.
                // If only one, we might risk overwriting?
                // ACTUALLY, checking the modal, it updates everything.
                // But toggleTask only updates completed.

                // Let's safe check:
                if (updates.date && updates.time) {
                    dbUpdates.due_date = `${updates.date}T${updates.time}:00`;
                } else if (updates.date) {
                    // Assuming time is 00:00 or we can't fully update.
                    // This is an edge case. Let's just create due_date if possible.
                    dbUpdates.due_date = `${updates.date}T00:00:00`;
                }

                delete dbUpdates.date;
                delete dbUpdates.time;
            }

            const { error } = await supabase
                .from('tasks')
                .update(dbUpdates)
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
