# Rule: Marcel's Global Preferences

These rules apply to ALL projects and conversations.

## Git & Deploy

- **No Co-Authored-By** in commit messages. Ever. The user has explicitly rejected this multiple times.
- **pnpm exclusively.** Never use npm. Not even once.
- **Commit only files changed in this conversation.** Never `git add -A` or `git add .` blindly.
- **Personal projects (E-pagne, MailPulse, KALGA, DUKA, ImmoBidjan):** deploy direct on master. No PRs. Commit + push + deploy.
- **Team projects (KLASSCI):** use PRs with parallel agent reviews.

## Code Quality

- **No window.confirm() or window.alert().** Use custom dialog components (AlertDialog from shadcn/ui).
- **Never pass undefined to Convex args.** Build args objects dynamically, only including defined values.
- **Research APIs before coding** when using Next.js 16, Prisma 7, Tailwind v4, Convex, Resend v6. Training data is stale.

## Design

- **No AI slop.** No gradient orbs, bento grids, dark SaaS templates, animated counters, glassmorphism.
- **1 accent color + monochrome.** That's it. Less is more.
- **shadcn/ui for all components.** Don't recreate what shadcn provides.
- **Mobile-first always.** Touch targets >= h-11.

## Content & Communication

- **All UI content in French.** Code in English.
- **No em dashes** in French text. Use commas, colons, or periods.
- **Proper French accents** on all text. Missing accents = unprofessional.
- **LinkedIn:** never expose bugs/mistakes. Frame as industry observations. Solutions-first storytelling. Never condescending.
- **LinkedIn:** NEVER expose unreleased project ideas (ImmoBidjan, DUKA, MailPulse concepts). Chasseurs d'idées risk. Only promote KLASSCI (in production). Talk about acquired skills, industry trends, and expertise without naming private projects.
- **Personal projects (ImmoBidjan, DUKA, MailPulse, E-pagne, KALGA):** are PRIVATE until launched. No screenshots, no architecture, no PRDs on social media.

## Infrastructure

- **Budget-first.** Recommend RunPod, Together AI, API-first, free tiers before hyperscalers (AWS/Azure/GCP).
- **West Africa context.** Currency XOF, payments via Wave/Orange Money/MTN MoMo.
