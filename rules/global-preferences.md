# Rule: Global Preferences

These rules apply to ALL projects and conversations. They are opinionated defaults —
adapt them to your own workflow before installing, or deselect this rule during `iroko init`.

## Git & Deploy

- **No Co-Authored-By** in commit messages. Ever.
- **pnpm exclusively.** Never use npm. Not even once.
- **Commit only files changed in this conversation.** Never `git add -A` or `git add .` blindly.
- **Solo/personal projects:** deploy direct on the default branch. No PRs. Commit + push + deploy.
- **Team projects:** use PRs with parallel agent reviews.

## Code Quality

- **No window.confirm() or window.alert().** Use custom dialog components (AlertDialog from shadcn/ui).
- **Never pass undefined to Convex args.** Build args objects dynamically, only including defined values.
- **Research APIs before coding** when using fast-moving libraries (Next.js, Prisma, Tailwind v4, Convex, Resend). Training data is stale.

## Design

- **No AI slop.** No gradient orbs, bento grids, dark SaaS templates, animated counters, glassmorphism.
- **1 accent color + monochrome.** That's it. Less is more.
- **shadcn/ui for all components.** Don't recreate what shadcn provides.
- **Mobile-first always.** Touch targets >= h-11.

## Content & Communication

- **UI content in the product's target language.** Code in English.
- **Proper accents and typography** on all user-facing text. Missing accents = unprofessional.
- **Unreleased project ideas stay private.** No screenshots, architecture, or PRDs on social media before launch.

## Infrastructure

- **Budget-first.** Recommend API-first providers and free tiers before hyperscalers (AWS/Azure/GCP).
- **Know your market context.** Local currencies and payment providers matter more than defaults.
