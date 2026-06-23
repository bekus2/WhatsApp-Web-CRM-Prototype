/**
 * Project: WhatsApp Web CRM Prototype
 * File: src/components/PipelineView.tsx
 * Author: Beck Sarbassov
 * Version: 0.1.0
 * Date created: 2026-06-23
 * Last updated: 2026-06-23
 * Copyright: © Beck Sarbassov. All rights reserved.
 *
 * EN: Displays leads grouped by pipeline stages and initializes a default pipeline.
 * RU: Показывает лиды по этапам воронки и создает стандартную воронку.
 */
import { useEffect, useState } from 'react';
import { supabase, type Lead, type Pipeline, type PipelineStage } from '../lib/supabase';
import type { View } from '../App';

interface PipelineViewProps {
  onNavigate: (v: View, leadId?: string) => void;
}

export default function PipelineView({ onNavigate }: PipelineViewProps) {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
    const sub = supabase.channel('pipeline-channel').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchPipeline).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchPipeline = async () => {
    setLoading(true);
    const { data: pipelines } = await supabase.from('pipelines').select('*').limit(1);
    if (pipelines && pipelines.length > 0) {
      const p = pipelines[0];
      setPipeline(p);
      const { data: stagesData } = await supabase.from('pipeline_stages').select('*').eq('pipeline_id', p.id).order('position', { ascending: true });
      setStages(stagesData || []);
      const { data: leadsData } = await supabase.from('leads').select('*').order('last_message_at', { ascending: false });
      setLeads(leadsData || []);
    }
    setLoading(false);
  };

  const handleStageChange = async (leadId: string, stageId: string | null) => {
    await supabase.from('leads').update({ pipeline_stage_id: stageId }).eq('id', leadId);
    await supabase.from('lead_activities').insert({
      lead_id: leadId,
      type: 'status_change',
      description: `Изменен этап воронки`,
    });
    fetchPipeline();
  };

  if (loading) return <div className="p-8">Загрузка...</div>;
  if (!pipeline) return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Воронка продаж</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500 mb-4">Воронка не настроена. Создайте воронку и этапы.</p>
        <button onClick={createDefaultPipeline} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Создать стандартную воронку
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 h-full overflow-x-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Воронка: {pipeline.name}</h2>
      <div className="flex gap-4 min-w-max">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.pipeline_stage_id === stage.id);
          return (
            <div key={stage.id} className="w-72 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color || '#3b82f6' }} />
                  <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                </div>
                <span className="text-xs text-gray-500 font-medium">{stageLeads.length}</span>
              </div>
              <div className="space-y-2">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onNavigate('lead', lead.id)}
                  >
                    <div className="font-medium text-sm text-gray-900 mb-1">{lead.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{lead.phone}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        lead.status === 'new' ? 'bg-blue-50 text-blue-700' :
                        lead.status === 'contacted' ? 'bg-amber-50 text-amber-700' :
                        lead.status === 'qualified' ? 'bg-green-50 text-green-700' :
                        lead.status === 'lost' ? 'bg-red-50 text-red-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>{lead.status}</span>
                    </div>
                    <select
                      value={lead.pipeline_stage_id || ''}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => handleStageChange(lead.id, event.target.value || null)}
                      className="mt-3 w-full rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Р‘РµР· СЌС‚Р°РїР°</option>
                      {stages.map((targetStage) => (
                        <option key={targetStage.id} value={targetStage.id}>{targetStage.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {stageLeads.length === 0 && <div className="text-xs text-gray-400 text-center py-4">Нет лидов</div>}
              </div>
            </div>
          );
        })}
        <div className="w-72 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-500">Без этапа</h3>
            <span className="text-xs text-gray-500 font-medium">{leads.filter((l) => !l.pipeline_stage_id).length}</span>
          </div>
          <div className="space-y-2">
            {leads.filter((l) => !l.pipeline_stage_id).map((lead) => (
              <div
                key={lead.id}
                className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onNavigate('lead', lead.id)}
              >
                <div className="font-medium text-sm text-gray-900 mb-1">{lead.name}</div>
                <div className="text-xs text-gray-500 mb-2">{lead.phone}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    lead.status === 'new' ? 'bg-blue-50 text-blue-700' :
                    lead.status === 'contacted' ? 'bg-amber-50 text-amber-700' :
                    lead.status === 'qualified' ? 'bg-green-50 text-green-700' :
                    lead.status === 'lost' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-700'
                  }`}>{lead.status}</span>
                </div>
                <select
                  value={lead.pipeline_stage_id || ''}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => handleStageChange(lead.id, event.target.value || null)}
                  className="mt-3 w-full rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Р‘РµР· СЌС‚Р°РїР°</option>
                  {stages.map((targetStage) => (
                    <option key={targetStage.id} value={targetStage.id}>{targetStage.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  async function createDefaultPipeline() {
    const { data: p } = await supabase.from('pipelines').insert({ name: 'Продажи' }).select().single();
    if (p) {
      await supabase.from('pipeline_stages').insert([
        { pipeline_id: p.id, name: 'Новый', position: 0, color: '#3b82f6' },
        { pipeline_id: p.id, name: 'В работе', position: 1, color: '#f59e0b' },
        { pipeline_id: p.id, name: 'Предложение', position: 2, color: '#8b5cf6' },
        { pipeline_id: p.id, name: 'Переговоры', position: 3, color: '#ec4899' },
        { pipeline_id: p.id, name: 'Закрыто', position: 4, color: '#10b981' },
      ]);
      fetchPipeline();
    }
  }
}
