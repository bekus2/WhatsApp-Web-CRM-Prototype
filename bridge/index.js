const { Client, LocalAuth } = require('whatsapp-web.js');
const { createClient } = require('@supabase/supabase-js');
const qrcode = require('qrcode');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

let sessionId = null;

async function getSessionId() {
  if (sessionId) return sessionId;
  const { data } = await supabase.from('whatsapp_sessions').select('id').limit(1).maybeSingle();
  if (data) {
    sessionId = data.id;
  } else {
    const { data: inserted } = await supabase.from('whatsapp_sessions').insert({ status: 'disconnected' }).select().single();
    if (inserted) sessionId = inserted.id;
  }
  return sessionId;
}

async function updateSession(updates) {
  const id = await getSessionId();
  if (id) await supabase.from('whatsapp_sessions').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
}

async function findOrCreateLead(phone, name) {
  const cleanPhone = phone.replace(/\D/g, '').replace(/^\+?/, '+');
  const { data: existing } = await supabase.from('leads').select('*').eq('phone', cleanPhone).maybeSingle();
  if (existing) {
    await supabase.from('leads').update({ last_message_at: new Date().toISOString() }).eq('id', existing.id);
    return existing;
  }
  const { data: lead } = await supabase.from('leads').insert({
    name: name || cleanPhone,
    phone: cleanPhone,
    status: 'new',
    last_message_at: new Date().toISOString(),
  }).select().single();
  return lead;
}

async function saveMessage(leadId, content, direction) {
  await supabase.from('messages').insert({
    lead_id: leadId,
    content,
    direction,
  });
  await supabase.from('lead_activities').insert({
    lead_id: leadId,
    type: 'message',
    description: direction === 'incoming' ? `Получено сообщение: ${content.substring(0, 100)}` : `Отправлено сообщение: ${content.substring(0, 100)}`,
  });
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', async (qr) => {
  console.log('QR received, generating image...');
  const qrData = await qrcode.toDataURL(qr);
  await updateSession({ status: 'qr_ready', qr_data: qrData });
});

client.on('ready', async () => {
  console.log('WhatsApp client ready');
  const info = await client.info;
  await updateSession({
    status: 'connected',
    qr_data: null,
    phone: info.wid.user,
    info: { pushname: info.pushname, wid: info.wid.user },
  });
});

client.on('message', async (msg) => {
  if (msg.fromMe) return;
  const contact = await msg.getContact();
  const name = contact.pushname || contact.name || msg.from;
  const lead = await findOrCreateLead(msg.from, name);
  if (lead) {
    await saveMessage(lead.id, msg.body, 'incoming');
    console.log(`New message from ${lead.name}: ${msg.body.substring(0, 50)}`);
  }
});

client.on('message_create', async (msg) => {
  if (!msg.fromMe) return;
  const to = msg.to;
  const cleanPhone = to.replace(/\D/g, '').replace(/^\+?/, '+');
  const { data: lead } = await supabase.from('leads').select('id').eq('phone', cleanPhone).maybeSingle();
  if (lead) {
    await saveMessage(lead.id, msg.body, 'outgoing');
  }
});

client.on('auth_failure', async (msg) => {
  console.error('Auth failure:', msg);
  await updateSession({ status: 'disconnected', qr_data: null });
});

client.on('disconnected', async (reason) => {
  console.log('Disconnected:', reason);
  await updateSession({ status: 'disconnected', qr_data: null });
});

async function init() {
  await updateSession({ status: 'connecting' });
  await client.initialize();
}

init().catch(console.error);

process.on('SIGINT', async () => {
  await updateSession({ status: 'disconnected' });
  await client.destroy();
  process.exit(0);
});
