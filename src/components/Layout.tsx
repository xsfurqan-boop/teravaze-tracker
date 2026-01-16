import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden relative">
            {/* Background Ambient Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

            <Sidebar className="w-72 hidden md:flex shrink-0 z-10 p-4" />

            <main className="flex-1 h-full overflow-hidden flex flex-col p-4 relative z-10">
                <Outlet />
            </main>
        </div>
    );
}
