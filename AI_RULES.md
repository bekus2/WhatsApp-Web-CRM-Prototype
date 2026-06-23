# AI_RULES.md

## Required Reading Before Changes

Before modifying code, configuration, or documentation, read:

- `README.md`
- `HANDOFF.md`
- `PROJECT_CONTEXT.md`
- `Codex_History.md`
- `TASK.md`
- `AI_RULES.md`

Author: Beck Sarbassov  
Date created: 2026-06-23  
Last updated: 2026-06-23  
Copyright: © Beck Sarbassov. All rights reserved.

## Architecture Rules

- Keep the frontend in `src/`.
- Keep WhatsApp bridge code in `bridge/`.
- Keep Supabase schema changes in `supabase/migrations/`.
- Do not move secrets into frontend code.
- Do not replace Supabase/React architecture without a clear task and documented reason.

## Coding Style Rules

- Use TypeScript for frontend code.
- Keep React components focused and readable.
- Prefer typed Supabase data helpers over repeated ad hoc shapes.
- Add professional file headers to new or modified source files.
- Add short useful EN/RU comments only for important logic.

## Security Rules

- Never commit `.env`, real keys, tokens, WhatsApp session files, logs, dumps, or customer data.
- Never expose Supabase service role key in browser code.
- Keep `bridge/.wwebjs_auth/` and `bridge/.wwebjs_cache/` ignored.
- Treat phone numbers and message content as personal data.
- Tighten Supabase RLS before production deployment.

## Documentation Rules

Update relevant documentation after every meaningful change:

- `README.md`
- `HANDOFF.md`
- `PROJECT_CONTEXT.md`
- `Codex_History.md`
- `TASK.md`
- `AI_RULES.md`

Do not rewrite everything without need. Update only affected sections, but keep dates and current project state accurate.

## Forbidden Actions

- Do not delete working code without explanation.
- Do not commit generated secrets or local WhatsApp session state.
- Do not claim production readiness while RLS/authentication are prototype-level.
- Do not add unnecessary frameworks.
- Do not ignore failing validation without documenting it.

## Git and GitHub Workflow

- Work from a clean understanding of `git status`.
- Use clear commit messages.
- Keep `main` stable.
- Use feature/fix/docs branches for larger changes.
- Verify local branch, upstream, and ahead/behind status before pushing.

## Testing and Verification

Run the most relevant checks:

```bash
npm run lint
npm run typecheck
npm run build
```

For bridge changes, also run:

```bash
cd bridge
npm start
```

Document any failure and the exact follow-up needed.

## Final Report Format

After each update, report:

1. What changed.
2. Which files changed.
3. How to install, run, or test.
4. Which security protections were added or preserved.
5. Which documentation was updated.
6. Remaining improvements.
7. Risks or limitations.
