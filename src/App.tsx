import React from 'react';
import { AppProvider } from './context/AppProvider';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DocumentList } from './components/DocumentList';
import { EmployeeManager } from './components/EmployeeManager';
import { CalendarView } from './components/CalendarView';
import { AuthPage } from './pages/AuthPage';
import { Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [filterStatus, setFilterStatus] = React.useState<string | undefined>(undefined);

  const handleNavigate = (tab: string, filter?: string) => {
    setActiveTab(tab);
    if (filter) {
      setFilterStatus(filter);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'documents':
        return <DocumentList initialFilterStatus={filterStatus} />;
      case 'employees':
        return <EmployeeManager />;
      case 'calendar':
        return <CalendarView />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </AppProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
