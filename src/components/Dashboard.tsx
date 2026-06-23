/**
 * Project: WhatsApp Web CRM Prototype
 * File: src/components/Dashboard.tsx
 * Author: Beck Sarbassov
 * Version: 0.1.0
 * Date created: 2026-06-23
 * Last updated: 2026-06-23
 * Copyright: © Beck Sarbassov. All rights reserved.
 *
 * EN: Loads dashboard CRM metrics, recent leads, and recent messages.
 * RU: Загружает метрики CRM, новых лидов и последние сообщения.
 */
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import type { Lead } from '../lib/supabase';
import type { View } from '../App';

interface DashboardProps {
  onNavigate: (v: View, leadId?: string) => void;
}

interface RecentMessage {
  id: string;
  lead_id: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  created_at: string;
  lead: Lead;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({ leads: 0, messages: 0, today: 0, newLeads: 0 });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
      const { count: messagesCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', today);
      const { count: newLeadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new');

      const { data: recentLeadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5);
      const { data: recentMessagesData } = await supabase.from('messages').select('*, lead:leads(*)').order('created_at', { ascending: false }).limit(8);

      setStats({
        leads: leadsCount || 0,
        messages: messagesCount || 0,
        today: todayCount || 0,
        newLeads: newLeadsCount || 0,
      });
      setRecentLeads(recentLeadsData || []);
      setRecentMessages((recentMessagesData || []) as RecentMessage[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8">Загрузка...</div>;

  const statCards = [
    { label: 'Всего лидов', value: stats.leads, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Всего сообщений', value: stats.messages, icon: <MessageSquare size={20} />, color: 'bg-green-50 text-green-600' },
    { label: 'Сообщений сегодня', value: stats.today, icon: <TrendingUp size={20} />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Новых лидов', value: stats.newLeads, icon: <Clock size={20} />, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="p-8 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Дашборд</h2>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Новые лиды</h3>
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => onNavigate('lead', lead.id)}>
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-500">{lead.phone}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{lead.status}</span>
              </div>
            ))}
            {recentLeads.length === 0 && <p className="text-sm text-gray-400">Нет новых лидов</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Последние сообщения</h3>
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => onNavigate('lead', msg.lead_id)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-gray-900">{msg.lead?.name || 'Неизвестно'}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${msg.direction === 'incoming' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {msg.direction === 'incoming' ? 'Входящее' : 'Исходящее'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{msg.content}</p>
              </div>
            ))}
            {recentMessages.length === 0 && <p className="text-sm text-gray-400">Нет сообщений</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
