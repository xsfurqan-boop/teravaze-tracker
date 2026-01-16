import { useState, useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { supabase } from '../lib/supabase';

const TRIAL_DAYS = 7;

export function useTrial() {
    const { profile, user } = useAuthStore();
    const [daysLeft, setDaysLeft] = useState<number | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        if (!profile) {
            // Default safe state if not loaded
            return;
        }

        const premiumStatus = profile.is_premium;
        setIsPremium(premiumStatus);

        if (premiumStatus) {
            setDaysLeft(null);
            setIsExpired(false);
            return;
        }

        // Use profile creation date as trial start
        const startDate = new Date(profile.created_at);
        const now = new Date();

        const expirationDate = new Date(startDate);
        expirationDate.setDate(expirationDate.getDate() + TRIAL_DAYS);

        const msUntilExpiration = expirationDate.getTime() - now.getTime();
        const daysUntilExpiration = Math.ceil(msUntilExpiration / (1000 * 60 * 60 * 24));

        if (daysUntilExpiration <= 0) {
            setDaysLeft(0);
            setIsExpired(true);
        } else {
            setDaysLeft(daysUntilExpiration);
            setIsExpired(false);
        }
    }, [profile]);

    const activatePremium = async () => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_premium: true })
                .eq('id', user.id);

            if (error) throw error;

            // Optimistic update via store refresh could happen automatically due to subscription
            // but we can force refresh if needed, or rely on the real-time subscription in useAuthStore
            // For now, let's assume useAuthStore will pick it up or we can reload window to be safe/simple like before
            window.location.reload();

        } catch (error) {
            console.error('Error activating premium:', error);
            alert('Failed to activate premium. Please try again.');
        }
    };

    // Derived strictly from data now, no manual "expire" local hack needed for real app
    // But keeping interface compatible if needed, or we just remove expireTrialNow
    const expireTrialNow = () => {
        console.warn("Manual trial expiration not supported in Supabase mode (requires DB edit)");
    };

    return { daysLeft, isExpired, isPremium, expireTrialNow, activatePremium };
}
