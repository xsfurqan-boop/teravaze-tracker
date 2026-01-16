import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { X, Crown, Check } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { cn } from '../lib/utils';
import { useTrial } from '../hooks/useTrial';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
    const { activatePremium } = useTrial();

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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-50 w-full max-w-lg pointer-events-none"
                    >
                        <GlassCard className="relative p-6 border-amber-500/20 shadow-amber-500/10 pointer-events-auto">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>

                                <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-orange-400">
                                    Upgrade to Premium
                                </h2>
                                <p className="text-gray-400 mb-6 text-sm">
                                    Unlock unlimited tasks and team collaboration.
                                </p>

                                {/* Plan Selection */}
                                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                                    <div
                                        onClick={() => setSelectedPlan('monthly')}
                                        className={cn(
                                            "relative p-4 rounded-xl border cursor-pointer transition-all",
                                            selectedPlan === 'monthly'
                                                ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="text-sm font-medium text-gray-300">Monthly</div>
                                        <div className="text-xl font-bold text-white">$1.00</div>
                                        {selectedPlan === 'monthly' && (
                                            <div className="absolute top-2 right-2 text-amber-500"><Check className="w-4 h-4" /></div>
                                        )}
                                    </div>

                                    <div
                                        onClick={() => setSelectedPlan('yearly')}
                                        className={cn(
                                            "relative p-4 rounded-xl border cursor-pointer transition-all",
                                            selectedPlan === 'yearly'
                                                ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5"
                                                : "bg-white/5 border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            BEST VALUE
                                        </div>
                                        <div className="text-sm font-medium text-gray-300">Yearly</div>
                                        <div className="text-xl font-bold text-white">$10.00</div>
                                        <div className="text-[10px] text-green-400 mt-1">Save ~20%</div>
                                        {selectedPlan === 'yearly' && (
                                            <div className="absolute top-2 right-2 text-amber-500"><Check className="w-4 h-4" /></div>
                                        )}
                                    </div>
                                </div>

                                <div className="w-full bg-white/5 rounded-xl p-4">
                                    <PayPalScriptProvider options={{ clientId: "test", currency: "USD" }}>
                                        <PayPalButtons
                                            forceReRender={[selectedPlan]}
                                            style={{ layout: "vertical", color: "gold", shape: "rect", label: "checkout" }}
                                            createOrder={(_data, actions) => {
                                                return actions.order.create({
                                                    intent: "CAPTURE",
                                                    purchase_units: [
                                                        {
                                                            description: `Banana Todo Premium - ${selectedPlan} plan`,
                                                            amount: {
                                                                currency_code: "USD",
                                                                value: selectedPlan === 'yearly' ? "10.00" : "1.00"
                                                            }
                                                        }
                                                    ]
                                                });
                                            }}
                                            onApprove={async (_data, actions) => {
                                                if (actions.order) {
                                                    await actions.order.capture();
                                                    await activatePremium();
                                                    onClose();
                                                }
                                            }}
                                        />
                                    </PayPalScriptProvider>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
