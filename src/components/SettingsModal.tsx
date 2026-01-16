import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useTrial } from '../hooks/useTrial';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { expireTrialNow, daysLeft } = useTrial();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed z-50 w-full max-w-sm pointer-events-none"
                    >
                        <GlassCard className="relative p-6 pointer-events-auto">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>

                            <h2 className="text-xl font-bold mb-4">Settings</h2>

                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center gap-2 text-amber-400 mb-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Developer Tools</span>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">
                                    Current Status: {daysLeft !== null ? `${daysLeft} days left` : 'Checking...'}
                                </p>
                                <button
                                    onClick={expireTrialNow}
                                    className="w-full bg-red-500/20 text-red-500 border border-red-500/50 py-2 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                                >
                                    Expire Trial Now
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
