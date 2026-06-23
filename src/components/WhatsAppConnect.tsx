import { useEffect, useState } from 'react';
import { supabase, type WhatsAppSession } from '../lib/supabase';
import { Smartphone, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function WhatsAppConnect() {
  const [session, setSession] = useState<WhatsAppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
    const sub = supabase.channel('whatsapp-session')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_sessions' }, fetchSession)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const fetchSession = async () => {
    setLoading(true);
    const { data } = await supabase.from('whatsapp_sessions').select('*').limit(1).maybeSingle();
    setSession(data || null);
    setLoading(false);
  };

  const statusConfig = {
    disconnected: { color: 'text-red-600', bg: 'bg-red-50', icon: <AlertCircle size={20} />, label: 'Отключено' },
    connecting: { color: 'text-amber-600', bg: 'bg-amber-50', icon: <RefreshCw size={20} className="animate-spin" />, label: 'Подключение...' },
    qr_ready: { color: 'text-blue-600', bg: 'bg-blue-50', icon: <Smartphone size={20} />, label: 'Ожидание QR' },
    connected: { color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={20} />, label: 'Подключено' },
  };

  const cfg = statusConfig[session?.status || 'disconnected'];

  return (
    <div className="p-8 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">WhatsApp подключение</h2>
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cfg.bg}`}>
              {cfg.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Статус подключения</p>
              <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
            </div>
          </div>

          {session?.status === 'qr_ready' && session.qr_data && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Отсканируйте QR-код в WhatsApp:</p>
              <div className="bg-white p-4 rounded-xl border border-gray-200 inline-block">
                <img src={session.qr_data} alt="QR Code" className="w-64 h-64" />
              </div>
            </div>
          )}

          {session?.status === 'connected' && session.info && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle size={18} className="text-green-600" />
                <p className="text-sm text-green-800">WhatsApp успешно подключен!</p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Телефон: {session.phone || '—'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Как подключить WhatsApp</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <p>Запустите bridge сервер: <code className="bg-gray-100 px-2 py-1 rounded text-xs">cd bridge && npm install && npm start</code></p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <p>Откройте WhatsApp на телефоне → Настройки → Связанные устройства → Подключить устройство</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <p>Отсканируйте QR-код, который появится на этой странице</p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
              <p>Все входящие сообщения автоматически станут лидами в CRM</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <p className="font-semibold mb-1">Важное предупреждение</p>
            <p>Этот способ использует WhatsApp Web (не официальный API). Meta может ограничить или заблокировать аккаунт за использование неофициальных методов. Ответственность лежит на пользователе. Для production рекомендуется использовать официальный WhatsApp Business API.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
