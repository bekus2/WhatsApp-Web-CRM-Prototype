# HANDOFF.md

## Project

WhatsApp Web CRM Prototype is a Vite React CRM connected to Supabase, with a local Node.js WhatsApp Web bridge for turning messages into CRM leads.

Author: Beck Sarbassov  
Date created: 2026-06-23  
Last updated: 2026-06-23  
Copyright: © Beck Sarbassov. All rights reserved.

## Technology

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Lucide React.
- Data layer: Supabase PostgreSQL and realtime subscriptions.
- Bridge: Node.js, `whatsapp-web.js`, Puppeteer, Supabase service role client.
- Package manager: npm.

## Important Files

- `src/App.tsx` - main view routing.
- `src/components/` - CRM screens.
- `src/lib/supabase.ts` - Supabase client and shared types.
- `bridge/index.js` - local WhatsApp Web bridge.
- `supabase/migrations/20260623120653_create_crm_schema.sql` - database schema and RLS policies.
- `.env.example` - frontend environment example.
- `bridge/.env.example` - bridge environment example.

## Install and Run

```bash
npm install
cp .env.example .env
cd bridge
npm install
cp .env.example .env
```

Run frontend:

```bash
npm run dev
```

Run bridge:

```bash
cd bridge
npm start
```

## Deployment

Build frontend with `npm run build` and deploy `dist/` to static hosting. Run the bridge separately on a protected server with `SUPABASE_SERVICE_ROLE_KEY` supplied through secure environment variables.

## Configuration

- Frontend config: `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Bridge config: `bridge/.env` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Do not commit real `.env` files or WhatsApp session/cache folders.

## Do Not Change Without Understanding

- `bridge/index.js` session handling and Supabase service role usage.
- `supabase/migrations/20260623120653_create_crm_schema.sql` RLS policies.
- `src/lib/supabase.ts` shared types used by multiple components.
- `.gitignore` rules protecting `.env` and WhatsApp session folders.

## Unfinished Work

- Add real authentication and role-based access.
- Replace demo RLS policies with strict production policies.
- Fix mojibake text in React components.
- Add code headers to source files according to project rules.
- Add automated tests for frontend and bridge.
- Decide whether to migrate from WhatsApp Web automation to the official WhatsApp Business API.

## Future Improvements

- Server-side API layer for sensitive operations.
- Audit logs and rate limiting.
- Better pipeline editing UI.
- Message retention policy and privacy controls.
- Production deployment guide with process manager examples.
