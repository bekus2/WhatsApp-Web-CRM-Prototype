# Codex_History.md

## 2026-06-23 - v0.1.0

### Summary

Added the missing project documentation set, environment examples, package metadata cleanup, and Git ignore rules for WhatsApp Web local session/cache data.

### Changed Files

- `.gitignore`
- `.env.example`
- `bridge/.env.example`
- `package.json`
- `package-lock.json`
- `README.md`
- `HANDOFF.md`
- `PROJECT_CONTEXT.md`
- `Codex_History.md`
- `TASK.md`
- `AI_RULES.md`

### Added

- Bilingual README with setup, run, security, deployment, and scaling notes.
- Handoff documentation for another developer.
- Project context for AI coding agents.
- Technical task specification.
- AI agent rules for future changes.
- Safe env example files.

### Fixed

- Project package name changed from generic Vite starter name to `whatsapp-web-crm-prototype`.
- WhatsApp Web session/cache folders are now ignored by Git.

### Security

- Documented that `.env`, Supabase service role keys, WhatsApp session data, logs, and real customer data must not be committed.
- Documented that current Supabase RLS is demo-level and must be tightened before production.

### Notes

- Source files still need professional headers.
- React UI text contains mojibake and should be cleaned in a separate focused update.
- Production deployment needs strict authentication/RLS and ideally the official WhatsApp Business API.

Author: Beck Sarbassov  
Date created: 2026-06-23  
Last updated: 2026-06-23  
Copyright: © Beck Sarbassov. All rights reserved.
