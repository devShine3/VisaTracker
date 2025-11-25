import { useState } from 'react';
import { AppProvider } from './context/AppProvider';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { DocumentList } from './components/DocumentList';
import { FamilyManager } from './components/FamilyManager';
import { CalendarView } from './components/CalendarView';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'documents': return <DocumentList />;
      case 'family': return <FamilyManager />;
      case 'calendar': return <CalendarView />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </AppProvider>
  );
}

export default App;
