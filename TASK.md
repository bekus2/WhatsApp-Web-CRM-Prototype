# TASK.md

## Project Goal

Build a practical WhatsApp-to-CRM prototype that captures WhatsApp messages as leads and provides a lightweight dashboard, lead list, lead detail view, and sales pipeline.

Author: Beck Sarbassov  
Date created: 2026-06-23  
Last updated: 2026-06-23  
Copyright: © Beck Sarbassov. All rights reserved.

## Current Version

0.1.0

## Required Functionality

- Display CRM dashboard metrics.
- Display recent leads and messages.
- Search and open leads.
- Show WhatsApp connection status.
- Store WhatsApp messages in Supabase.
- Support local bridge startup through `bridge/index.js`.
- Protect local secrets and WhatsApp session files from Git.

## Pages and Modules

- Dashboard.
- Leads list.
- Lead detail.
- Pipeline view.
- WhatsApp connect view.
- Supabase schema.
- WhatsApp bridge.

## User Roles

Current prototype has no user roles. Future versions should add at least:

- Admin/owner.
- Sales manager.
- Read-only operator.

## Admin Panel Requirements

No admin panel exists yet. Future admin panel must include:

- Email/password login.
- Default local setup credentials documented only in README.
- Password change.
- Session protection.
- CSRF protection for sensitive actions.
- Role-based permissions.

## UI Requirements

- Responsive CRM layout for desktop and laptop screens first.
- Clear navigation between dashboard, leads, pipeline, and WhatsApp status.
- No public display of secrets or credentials.
- Fix current mojibake UI strings before production.

## Backend Requirements

- Current backend-like layer is `bridge/index.js`.
- Bridge must run with Supabase service role key from protected environment variables.
- Future production version should add a real server-side API for sensitive actions.

## API Requirements

- Current frontend uses Supabase client directly.
- Future API should validate inputs, apply authentication, and hide privileged writes from the browser.

## Data Storage Requirements

- Supabase PostgreSQL tables: leads, messages, pipelines, pipeline stages, lead activities, WhatsApp sessions.
- Local WhatsApp session/cache folders must remain ignored by Git.
- Backups and retention policies are required before production use.

## Form Requirements

Current app has search and CRM interaction controls. Future forms must validate input on both client and server/API side where applicable.

## Email and Notification Requirements

Email is not implemented. Future notifications must keep provider credentials in protected environment variables.

## SEO Requirements

SEO is low priority because this is an internal CRM. If public landing pages are added, they must include title, meta description, Open Graph tags, and semantic HTML.

## Performance Requirements

- Keep dashboard queries lightweight.
- Add pagination for leads and messages before using with large datasets.
- Avoid storing large QR/session blobs longer than necessary.

## Security Requirements

- Do not commit `.env` files, Supabase service keys, WhatsApp sessions, logs, dumps, or real customer data.
- Replace demo RLS before production.
- Add authentication before public deployment.
- Use HTTPS in deployed environments.
- Treat phone numbers and message content as personal data.

## Deployment Requirements

- Frontend builds with `npm run build`.
- Bridge deploys separately with protected environment variables.
- Production should use strict Supabase policies and a process manager for the bridge.

## Acceptance Criteria

- `npm run lint` completes or documented issues are recorded.
- `npm run typecheck` completes or documented issues are recorded.
- `npm run build` completes.
- README and handoff docs describe local setup and known limitations.
- Git status does not include WhatsApp session/cache folders.
