export type DocType = 'Emirates ID' | 'Visa' | 'Passport' | 'Car Registration' | 'Car Insurance' | 'Health Insurance' | 'Other';

export interface FamilyMember {
    id: string;
    name: string;
    relation: string; // 'Self', 'Spouse', 'Child', etc.
}

export interface Document {
    id: string;
    type: DocType;
    name: string; // e.g., "Dad's Visa"
    expiryDate: string; // ISO date YYYY-MM-DD
    memberId: string;
    photo?: string; // DataURL or link
    notes?: string;
}
