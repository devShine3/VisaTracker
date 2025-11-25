import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Document, FamilyMember } from '../types';

interface AppContextType {
    documents: Document[];
    familyMembers: FamilyMember[];
    addDocument: (doc: Document) => void;
    updateDocument: (doc: Document) => void;
    deleteDocument: (id: string) => void;
    addFamilyMember: (member: FamilyMember) => void;
    deleteFamilyMember: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_DOCS = 'visa_tracker_docs';
const STORAGE_KEY_FAMILY = 'visa_tracker_family';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<Document[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_DOCS);
        return saved ? JSON.parse(saved) : [];
    });

    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_FAMILY);
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'Me', relation: 'Self' } // Default member
        ];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    }, [documents]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_FAMILY, JSON.stringify(familyMembers));
    }, [familyMembers]);

    const addDocument = (doc: Document) => {
        setDocuments(prev => [...prev, doc]);
    };

    const updateDocument = (doc: Document) => {
        setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
    };

    const deleteDocument = (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const addFamilyMember = (member: FamilyMember) => {
        setFamilyMembers(prev => [...prev, member]);
    };

    const deleteFamilyMember = (id: string) => {
        setFamilyMembers(prev => prev.filter(m => m.id !== id));
    };

    return (
        <AppContext.Provider value={{
            documents,
            familyMembers,
            addDocument,
            updateDocument,
            deleteDocument,
            addFamilyMember,
            deleteFamilyMember
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
