# PROJECT_CONTEXT.md

## Purpose

WhatsApp Web CRM Prototype helps small businesses capture WhatsApp conversations as CRM leads and manage them in a lightweight sales pipeline.

Author: Beck Sarbassov  
Date created: 2026-06-23  
Last updated: 2026-06-23  
Copyright: © Beck Sarbassov. All rights reserved.

## Target Users

- Small business owners receiving leads through WhatsApp.
- Sales operators who need a simple lead list and pipeline.
- Developers evaluating a WhatsApp-to-CRM workflow before building a production product.

## Business Logic

1. A user starts the local WhatsApp bridge.
2. The bridge connects to WhatsApp Web and stores QR/session state in Supabase.
3. The frontend displays the current WhatsApp connection status.
4. Incoming messages create or update leads by phone number.
5. Messages are stored against leads.
6. CRM operators inspect leads, message history, and pipeline stages.

## Architecture Overview

- Browser frontend talks directly to Supabase using the anon key.
- Local bridge talks to Supabase using a service role key.
- Supabase stores CRM data and emits realtime updates.
- WhatsApp Web local session data is kept outside Git in ignored bridge folders.

## Data Flow

```text
WhatsApp account
  -> whatsapp-web.js bridge
  -> Supabase leads/messages/session tables
  -> React CRM dashboard
```

## Main Features

- Dashboard metrics.
- Lead list and search.
- Lead detail page.
- Pipeline view.
- WhatsApp QR/status page.
- Incoming and outgoing message persistence.
- Realtime updates through Supabase subscriptions.

## Security Logic

The current project is a prototype. It protects secrets from Git with `.gitignore` and `.env.example`, but the database migration currently uses broad anon/authenticated policies for development. Production work must replace those policies with real authentication, tenant boundaries, least-privilege access, and server-side controls for sensitive actions.

## Admin Logic

There is no admin panel yet. If added, it must include email/password login, password change, session protection, CSRF protection for state changes, and role-based access.

## API Logic

The frontend currently uses Supabase directly rather than a custom backend API. The local bridge is the operational integration layer for WhatsApp Web.

## Data Storage

Supabase PostgreSQL stores:

- leads;
- messages;
- pipelines;
- pipeline stages;
- lead activity logs;
- WhatsApp session state.

Local WhatsApp authentication and browser cache are stored in `bridge/.wwebjs_auth/` and `bridge/.wwebjs_cache/`.

## Constraints

- WhatsApp Web automation can break when WhatsApp changes its web client.
- WhatsApp Web automation is not the official Business API.
- Supabase anon policies are not production-safe yet.
- Current React UI text contains encoding damage in several files and needs cleanup.

## Development Direction

Next development should focus on production safety: authentication, strict RLS, clean UTF-8 UI copy, official WhatsApp Business API option, tests, and deployment documentation.
