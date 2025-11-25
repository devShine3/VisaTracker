import { differenceInDays, parseISO, format } from 'date-fns';

export type ExpiryStatus = 'critical' | 'warning' | 'good' | 'expired';

export const getDaysRemaining = (expiryDate: string): number => {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    return differenceInDays(expiry, today);
};

export const getExpiryStatus = (daysRemaining: number): ExpiryStatus => {
    if (daysRemaining < 0) return 'expired';
    if (daysRemaining <= 30) return 'critical';
    if (daysRemaining <= 90) return 'warning';
    return 'good';
};

export const formatDate = (dateString: string): string => {
    return format(parseISO(dateString), 'MMM dd, yyyy');
};

export const getStatusColor = (status: ExpiryStatus): string => {
    switch (status) {
        case 'expired': return 'bg-gray-500 text-white';
        case 'critical': return 'bg-red-500 text-white';
        case 'warning': return 'bg-yellow-500 text-black';
        case 'good': return 'bg-green-500 text-white';
        default: return 'bg-gray-200 text-black';
    }
};
