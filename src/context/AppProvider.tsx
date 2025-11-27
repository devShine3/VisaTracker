import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Document, Employee, AdminSettings } from '../types';

interface AppContextType {
    documents: Document[];
    employees: Employee[];
    addDocument: (doc: Document) => void;
    updateDocument: (doc: Document) => void;
    deleteDocument: (id: string) => void;
    addEmployee: (member: Employee) => void;
    deleteEmployee: (id: string) => void;
    adminSettings: AdminSettings;
    updateAdminSettings: (settings: AdminSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_DOCS = 'visa_tracker_docs';
const STORAGE_KEY_EMPLOYEES = 'visa_tracker_employees';
const STORAGE_KEY_ADMIN = 'visa_tracker_admin';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [documents, setDocuments] = useState<Document[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_DOCS);
        return saved ? JSON.parse(saved) : [];
    });

    const [employees, setEmployees] = useState<Employee[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
        return saved ? JSON.parse(saved) : [
            { id: '1', name: 'Me', role: 'Admin' } // Default member
        ];
    });

    const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
        const saved = localStorage.getItem(STORAGE_KEY_ADMIN);
        return saved ? JSON.parse(saved) : {
            contacts: [],
            autoReminders: false,
            lastReminderDate: null
        };
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    }, [documents]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
    }, [employees]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(adminSettings));
    }, [adminSettings]);

    const addDocument = (doc: Document) => {
        setDocuments(prev => [...prev, doc]);
    };

    const updateDocument = (doc: Document) => {
        setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
    };

    const deleteDocument = (id: string) => {
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    const addEmployee = (member: Employee) => {
        setEmployees(prev => [...prev, member]);
    };

    const deleteEmployee = (id: string) => {
        setEmployees(prev => prev.filter(m => m.id !== id));
    };

    const updateAdminSettings = (settings: AdminSettings) => {
        setAdminSettings(settings);
    };

    return (
        <AppContext.Provider value={{
            documents,
            employees,
            adminSettings,
            addDocument,
            updateDocument,
            deleteDocument,
            addEmployee,
            deleteEmployee,
            updateAdminSettings
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
