import { useEffect, useState } from 'react';
import { supabase, type Lead, type PipelineStage } from '../lib/supabase';
import { Search, Phone, Mail, Calendar, ArrowRight } from 'lucide-react';
import type { View } from '../App';

interface LeadsListProps {
  onNavigate: (v: View, leadId?: string) => void;
}

export default function LeadsList({ onNavigate }: LeadsListProps) {
  const [leads, setLeads] = useState<(Lead & { stage: PipelineStage | null })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
    const sub = supabase.channel('leads-channel').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data } = await supabase.from('leads').select('*, stage:pipeline_stages(*)').order('last_message_at', { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  const filtered = leads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) ||
    (l.email && l.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Лиды</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, телефону..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Имя</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Контакты</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Статус</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Этап</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Последнее сообщение</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onNavigate('lead', lead.id)}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{lead.name}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-600"><Phone size={12} />{lead.phone}</div>
                    {lead.email && <div className="flex items-center gap-1.5 text-gray-600"><Mail size={12} />{lead.email}</div>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    lead.status === 'new' ? 'bg-blue-50 text-blue-700' :
                    lead.status === 'contacted' ? 'bg-amber-50 text-amber-700' :
                    lead.status === 'qualified' ? 'bg-green-50 text-green-700' :
                    lead.status === 'lost' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-700'
                  }`}>{lead.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{lead.stage?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-500">
                  <div className="flex items-center gap-1.5"><Calendar size={12} />{lead.last_message_at ? new Date(lead.last_message_at).toLocaleString('ru-RU') : '—'}</div>
                </td>
                <td className="px-4 py-3">
                  <ArrowRight size={16} className="text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-400">Лиды не найдены</div>
        )}
      </div>
    </div>
  );
}
