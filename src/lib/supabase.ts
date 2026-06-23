import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  pipeline_stage_id: string | null;
  notes: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  lead_id: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  media_url: string | null;
  created_at: string;
};

export type Pipeline = {
  id: string;
  name: string;
  created_at: string;
};

export type PipelineStage = {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  color: string | null;
  created_at: string;
};

export type LeadActivity = {
  id: string;
  lead_id: string;
  type: 'status_change' | 'note' | 'message' | 'call' | 'email';
  description: string;
  created_at: string;
};

export type WhatsAppSession = {
  id: string;
  phone: string | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'qr_ready';
  qr_data: string | null;
  info: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};
