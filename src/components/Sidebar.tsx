import { LayoutDashboard, Users, Kanban, Smartphone, MessageCircle } from 'lucide-react';
import type { View } from '../App';

interface SidebarProps {
  current: View;
  onNavigate: (v: View) => void;
}

const items: { key: View; label: string; icon: React.ReactNode }[] = [
  { key: 'dashboard', label: 'Дашборд', icon: <LayoutDashboard size={20} /> },
  { key: 'leads', label: 'Лиды', icon: <Users size={20} /> },
  { key: 'pipeline', label: 'Воронка', icon: <Kanban size={20} /> },
  { key: 'whatsapp', label: 'WhatsApp', icon: <Smartphone size={20} /> },
];

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <MessageCircle size={20} className="text-white" />
        </div>
        <h1 className="font-bold text-lg text-gray-900">WhatsApp CRM</h1>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              current === item.key
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
          <p className="font-semibold mb-1">Важно</p>
          <p>WhatsApp Web bridge требует запуска сервера. Инструкции в разделе WhatsApp.</p>
        </div>
      </div>
    </aside>
  );
}
