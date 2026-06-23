/*
# CRM WhatsApp Mini CRM Schema

1. New Tables
- `leads` — Main leads/contacts table. Each WhatsApp message from a new phone creates a lead.
- `messages` — WhatsApp messages linked to leads.
- `pipelines` — Sales pipeline definitions.
- `pipeline_stages` — Individual stages within a pipeline.
- `lead_activities` — Activity log for leads (notes, status changes, etc).
- `whatsapp_sessions` — WhatsApp Web session state and QR code.

2. Security
- Single-tenant app (no auth required).
- All tables have RLS enabled with anon+authenticated access.
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  status text NOT NULL DEFAULT 'new',
  pipeline_stage_id uuid,
  notes text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  media_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  color text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('status_change', 'note', 'message', 'call', 'email')),
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text,
  status text NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connecting', 'connected', 'qr_ready')),
  qr_data text,
  info jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_pipelines" ON pipelines;
CREATE POLICY "anon_select_pipelines" ON pipelines FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pipelines" ON pipelines;
CREATE POLICY "anon_insert_pipelines" ON pipelines FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pipelines" ON pipelines;
CREATE POLICY "anon_update_pipelines" ON pipelines FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pipelines" ON pipelines;
CREATE POLICY "anon_delete_pipelines" ON pipelines FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_pipeline_stages" ON pipeline_stages;
CREATE POLICY "anon_select_pipeline_stages" ON pipeline_stages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_pipeline_stages" ON pipeline_stages;
CREATE POLICY "anon_insert_pipeline_stages" ON pipeline_stages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_pipeline_stages" ON pipeline_stages;
CREATE POLICY "anon_update_pipeline_stages" ON pipeline_stages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_pipeline_stages" ON pipeline_stages;
CREATE POLICY "anon_delete_pipeline_stages" ON pipeline_stages FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_lead_activities" ON lead_activities;
CREATE POLICY "anon_select_lead_activities" ON lead_activities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lead_activities" ON lead_activities;
CREATE POLICY "anon_insert_lead_activities" ON lead_activities FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lead_activities" ON lead_activities;
CREATE POLICY "anon_update_lead_activities" ON lead_activities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lead_activities" ON lead_activities;
CREATE POLICY "anon_delete_lead_activities" ON lead_activities FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_whatsapp_sessions" ON whatsapp_sessions;
CREATE POLICY "anon_select_whatsapp_sessions" ON whatsapp_sessions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_whatsapp_sessions" ON whatsapp_sessions;
CREATE POLICY "anon_insert_whatsapp_sessions" ON whatsapp_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_whatsapp_sessions" ON whatsapp_sessions;
CREATE POLICY "anon_update_whatsapp_sessions" ON whatsapp_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_whatsapp_sessions" ON whatsapp_sessions;
CREATE POLICY "anon_delete_whatsapp_sessions" ON whatsapp_sessions FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads(pipeline_stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_last_message ON leads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline ON pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id);
