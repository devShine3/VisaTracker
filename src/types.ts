export type DocType = 'Emirates ID' | 'Visa' | 'Passport' | 'Car Registration' | 'Car Insurance' | 'Health Insurance' | 'Driving License' | 'ID Card' | 'Other';

export interface Employee {
    id: string;
    name: string;
    role: string; // 'Manager', 'Developer', 'Designer', etc.
}

export interface Document {
    id: string;
    type: DocType;
    name: string; // e.g., "John's Visa"
    expiryDate: string; // ISO date YYYY-MM-DD
    memberId: string;
    notes?: string;
    photo?: string;
}

export interface AdminContact {
    id: string;
    label: string; // e.g., "My Personal Mobile"
    type: 'whatsapp' | 'email';
    value: string;
}

export interface AdminSettings {
    contacts: AdminContact[];
    autoReminders: boolean;
    lastReminderDate: string | null; // ISO date YYYY-MM-DD
}
