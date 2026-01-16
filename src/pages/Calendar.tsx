import { useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTaskStore } from '../hooks/useTaskStore';

export function Calendar() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const { tasks, fetchTasks } = useTaskStore();

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Simple mock calendar logic for demonstration
    // In a real app, we'd calculate the actual days of the current month
    const dates = Array.from({ length: 35 }, (_, i) => {
        const day = i + 1;
        // Check if any tasks fall on this "mock" day (assuming current month)
        // For simplicity, let's just match day number if task date ends with that number
        // A real implementation would parse dates properly. 
        // Let's just map task dates to this grid loosely for visual effect.
        return {
            day: day <= 31 ? day : day - 31,
            isNextMonth: day > 31
        };
    });

    const getTasksForDay = (day: number) => {
        // Very basic matching: if task.date is '2026-01-08', day 8 matches.
        return tasks.filter(t => {
            const d = new Date(t.date);
            // Verify valid date
            if (isNaN(d.getTime())) return false;
            return d.getDate() === day;
        });
    };

    return (
        <div className="flex-1 h-screen overflow-hidden p-6 bg-background">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
                    <p className="text-gray-400">Your Schedule</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><ChevronLeft className="w-5 h-5" /></button>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>

            <GlassCard className="h-[calc(100%-100px)] flex flex-col">
                <div className="grid grid-cols-7 border-b border-white/10">
                    {days.map(day => (
                        <div key={day} className="p-4 text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 flex-1">
                    {dates.map((dateObj, i) => {
                        const dayTasks = !dateObj.isNextMonth ? getTasksForDay(dateObj.day) : [];

                        return (
                            <div key={i} className="border-r border-b border-white/5 p-2 relative min-h-[100px] hover:bg-white/5 transition-colors group">
                                <span className={`text-sm font-medium ${dateObj.isNextMonth ? 'text-gray-600' : 'text-gray-300'}`}>
                                    {dateObj.day}
                                </span>

                                <div className="mt-1 space-y-1">
                                    {dayTasks.map(t => (
                                        <div key={t.id} className={`text-xs p-1 rounded truncate ${t.completed ? 'opacity-50 line-through' : ''} bg-primary/20 text-blue-200`}>
                                            {t.title}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </GlassCard>
        </div>
    );
}
