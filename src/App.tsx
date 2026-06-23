import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadsList from './components/LeadsList';
import PipelineView from './components/PipelineView';
import WhatsAppConnect from './components/WhatsAppConnect';
import LeadDetail from './components/LeadDetail';

export type View = 'dashboard' | 'leads' | 'pipeline' | 'whatsapp' | 'lead';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const handleNavigate = (v: View, leadId?: string) => {
    if (leadId) setSelectedLeadId(leadId);
    setView(v);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar current={view} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-hidden">
        {view === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
        {view === 'leads' && <LeadsList onNavigate={handleNavigate} />}
        {view === 'pipeline' && <PipelineView onNavigate={handleNavigate} />}
        {view === 'whatsapp' && <WhatsAppConnect onNavigate={handleNavigate} />}
        {view === 'lead' && selectedLeadId && <LeadDetail leadId={selectedLeadId} onNavigate={handleNavigate} />}
      </main>
    </div>
  );
}

export default App;
