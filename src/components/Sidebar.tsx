import { useState } from 'react';
import { LayoutGrid, Calendar, CheckSquare, Settings, Users, FolderKanban, Search } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { GlassCard } from './GlassCard';
import { useTrial } from '../hooks/useTrial';
import { SettingsModal } from './SettingsModal';
import { PremiumModal } from './PremiumModal';
import { SearchModal } from './SearchModal';

export function Sidebar({ className }: { className?: string }) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { daysLeft, isExpired, isPremium } = useTrial();

    const navItems = [
        { icon: LayoutGrid, label: 'Dashboard', to: '/' },
        { icon: CheckSquare, label: 'My Tasks', to: '/mytasks' },
        { icon: Calendar, label: 'Calendar', to: '/calendar' },
        { icon: FolderKanban, label: 'Projects', to: '/projects' },
        { icon: Users, label: 'Team', to: '/team' },
    ];

    const handleNavigation = (e: React.MouseEvent, path: string) => {
        if (path === '/') return; // Always allow Dashboard
        if (isExpired && !isPremium) {
            e.preventDefault();
            setIsPremiumModalOpen(true);
        }
    };

    return (
        <GlassCard className={cn("h-full flex flex-col w-64 border-r-0 rounded-r-none rounded-l-none", className)}>
            <div className="mb-6 px-2">
                <div className="flex items-center gap-3 group cursor-default">
                    {/* The Wing Icon */}
                    <div className="relative transform -rotate-10 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 ease-out">
                        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative drop-shadow-lg">
                            <defs>
                                <linearGradient id="wing-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#9333ea" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M22 2L11 13"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-50"
                            />
                            <path
                                d="M22 2L15 22L11 13L2 9L22 2Z"
                                fill="url(#wing-gradient)"
                                stroke="url(#wing-gradient)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <span className="text-3xl font-bold text-white tracking-tight group-hover:tracking-normal transition-all duration-300">
                        Aero
                    </span>
                </div>

                {/* Status Badges */}
                {isPremium && (
                    <div className="mt-2 text-xs font-semibold px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-md inline-block shadow-lg shadow-amber-500/20">
                        Premium Plan
                    </div>
                )}
                {!isPremium && !isExpired && daysLeft !== null && (
                    <div className="mt-2 text-xs font-semibold px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20 inline-block">
                        Trial: {daysLeft} days left
                    </div>
                )}
                {!isPremium && isExpired && (
                    <div className="mt-2 text-xs font-semibold px-2 py-1 bg-red-500/10 text-red-500 rounded-md border border-red-500/20 inline-block">
                        Trial Expired
                    </div>
                )}
            </div>

            {/* Quick Search */}
            <div className="px-2 mb-4">
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                    <Search className="w-4 h-4" />
                    Quick Search...
                    <span className="ml-auto text-[10px] bg-black/20 px-1.5 py-0.5 rounded border border-white/5 uppercase font-mono">
                        Ctrl K
                    </span>
                </button>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        onClick={(e) => handleNavigation(e, item.to)}
                        className={({ isActive }) => cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                            isActive
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5"
                                : "text-gray-400 hover:text-white hover:bg-white/5",
                            (isExpired && !isPremium && item.to !== '/') && "opacity-50 cursor-pointer"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                        {isExpired && !isPremium && item.to !== '/' && (
                            <div className="ml-auto text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">Locked</div>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-white/5">
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                    <Settings className="w-5 h-5" />
                    Settings
                </button>
            </div>

            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </GlassCard>
    );
}
