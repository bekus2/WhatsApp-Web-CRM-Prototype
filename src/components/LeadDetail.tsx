import { useEffect, useState, useRef } from 'react';
import { supabase, type Lead, type Message, type PipelineStage, type LeadActivity } from '../lib/supabase';
import { ArrowLeft, Send, Phone, Mail, User, MessageCircle, FileText, Clock } from 'lucide-react';
import type { View } from '../App';

interface LeadDetailProps {
  leadId: string;
  onNavigate: (v: View) => void;
}

export default function LeadDetail({ leadId, onNavigate }: LeadDetailProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [note, setNote] = useState('');
  const [tab, setTab] = useState<'chat' | 'info' | 'activity'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLead();
    const sub = supabase.channel(`lead-${leadId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `lead_id=eq.${leadId}` }, fetchLead)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [leadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchLead = async () => {
    const { data: leadData } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (leadData) setLead(leadData);
    const { data: msgData } = await supabase.from('messages').select('*').eq('lead_id', leadId).order('created_at', { ascending: true });
    setMessages(msgData || []);
    const { data: stagesData } = await supabase.from('pipeline_stages').select('*').order('position', { ascending: true });
    setStages(stagesData || []);
    const { data: actData } = await supabase.from('lead_activities').select('*').eq('lead_id', leadId).order('created_at', { ascending: false });
    setActivities(actData || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase.from('messages').insert({ lead_id: leadId, content: newMessage, direction: 'outgoing' });
    await supabase.from('lead_activities').insert({ lead_id: leadId, type: 'message', description: `Отправлено сообщение: ${newMessage}` });
    setNewMessage('');
    fetchLead();
  };

  const addNote = async () => {
    if (!note.trim()) return;
    await supabase.from('lead_activities').insert({ lead_id: leadId, type: 'note', description: note });
    setNote('');
    fetchLead();
  };

  const updateLead = async (updates: Partial<Lead>) => {
    await supabase.from('leads').update(updates).eq('id', leadId);
    if (updates.status) {
      await supabase.from('lead_activities').insert({ lead_id: leadId, type: 'status_change', description: `Статус изменен на: ${updates.status}` });
    }
    fetchLead();
  };

  if (!lead) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => onNavigate('leads')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-gray-900">{lead.name}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Phone size={12} />{lead.phone}</span>
            {lead.email && <span className="flex items-center gap-1"><Mail size={12} />{lead.email}</span>}
          </div>
        </div>
        <select
          value={lead.status}
          onChange={(e) => updateLead({ status: e.target.value })}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="new">Новый</option>
          <option value="contacted">Контакт установлен</option>
          <option value="qualified">Квалифицирован</option>
          <option value="proposal">Предложение</option>
          <option value="negotiation">Переговоры</option>
          <option value="won">Выигран</option>
          <option value="lost">Потерян</option>
        </select>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'chat' as const, label: 'Переписка', icon: <MessageCircle size={16} /> },
              { key: 'info' as const, label: 'Карточка', icon: <FileText size={16} /> },
              { key: 'activity' as const, label: 'Активность', icon: <Clock size={16} /> },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {tab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                      msg.direction === 'outgoing'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.direction === 'outgoing' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Написать сообщение..."
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={sendMessage} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === 'info' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Имя</label>
                  <input
                    value={lead.name}
                    onChange={(e) => updateLead({ name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Телефон</label>
                  <input
                    value={lead.phone}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <input
                    value={lead.email || ''}
                    onChange={(e) => updateLead({ email: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Этап воронки</label>
                  <select
                    value={lead.pipeline_stage_id || ''}
                    onChange={(e) => updateLead({ pipeline_stage_id: e.target.value || null })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Без этапа</option>
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Заметки</label>
                <textarea
                  value={lead.notes || ''}
                  onChange={(e) => updateLead({ notes: e.target.value || null })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Добавить заметку</label>
                <div className="flex gap-2">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                    placeholder="Введите заметку..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={addNote} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Добавить
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      act.type === 'message' ? 'bg-blue-500' :
                      act.type === 'status_change' ? 'bg-amber-500' :
                      act.type === 'note' ? 'bg-green-500' :
                      'bg-gray-500'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-900">{act.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(act.created_at).toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && <p className="text-sm text-gray-400 text-center">Нет активности</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
