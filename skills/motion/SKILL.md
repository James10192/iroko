---
name: motion
description: >
  Build animations with Motion (motion.dev, formerly Framer Motion): pick the right API for the job,
  use verified imports, keep every animation on the GPU, and respect reduced-motion preferences.
  Also audits existing Motion code against the same checklist.
  Construire des animations avec Motion (motion.dev, ex-Framer Motion) : choisir la bonne API,
  utiliser les imports vérifiés, garder les animations sur le GPU, respecter reduced motion.
  Audite aussi du code Motion existant avec la même grille.
argument-hint: "<what to animate> [--react | --vanilla] [--audit]"
---

# Motion — animate without guessing the API

Motion is one library with several entry points. Most Motion bugs are not animation bugs: they are the wrong import, the wrong API for the job, or a property the browser cannot animate cheaply. This skill settles all three before any code is written.

## When to use

- Adding or changing any animation, transition, gesture, scroll effect or page transition in a project that uses (or is about to use) Motion
- Migrating from `framer-motion` to `motion`
- `--audit`: reviewing existing Motion code for performance and accessibility problems

**Not for**: CSS-only transitions that already work, or a project that uses GSAP — do not introduce a second animation library to add one fade.

## Step 0 — Check what is installed

```bash
grep -E '"(motion|framer-motion|motion-v)"' package.json
```

- `motion` → current package. Continue.
- `framer-motion` → legacy name of the same library. The modern package is `motion` and imports move from `framer-motion` to `motion/react`. Propose the swap, never do it silently inside another task (`stay-in-scope`).
- nothing → `pnpm add motion` (React 18.2+ required).

If any API below looks different from what the installed version exposes, stop and run `/read-docs motion <topic>` — the docs win, never memory (`docs-first`).

FR : vérifier d'abord ce qui est installé. `framer-motion` est l'ancien nom du même outil, le paquet actuel s'appelle `motion`.

## Step 1 — Pick the API

| The job | Use | Import from |
|---|---|---|
| Animate a React element on state change | `<motion.div animate={...} />` | `motion/react` |
| Enter / exit of a React element | `<AnimatePresence>` | `motion/react` |
| Size, position or order change | `layout` / `layoutId` prop | `motion/react` |
| Imperative sequence, timeline, `await` | `useAnimate()` | `motion/react` |
| Scroll-linked values in React | `useScroll()` + `useTransform()` | `motion/react` |
| No React (vanilla JS) | `animate()`, `scroll()`, `inView()` | `motion` |

**Rule**: if the animation is a consequence of React state, express it with props (`animate`, `whileHover`, `whileInView`). Reach for `useAnimate()` only when you need sequencing or a promise. Never drive a Motion animation from `setInterval` or a hand-rolled `requestAnimationFrame`.

## Step 2 — Imports, framework by framework

```jsx
// React (client component)
import { motion, AnimatePresence } from "motion/react"

// Next.js App Router — either mark the file:
"use client"
import { motion } from "motion/react"

// ...or import the pre-marked client entry (ships less JS):
import * as motion from "motion/react-client"

// Vanilla JS
import { animate, scroll, inView, stagger } from "motion"
```

A missing `"use client"` in the App Router is the most common Motion error. It surfaces as a server-component error, not as an animation bug.

## Step 3 — Write the animation

```jsx
<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", visualDuration: 0.4, bounce: 0.2 }}
/>
```

- Transforms (`x`, `y`, `scale`, `rotate`) default to a **spring**; other values default to a tween. Say it explicitly when it matters.
- Prefer `visualDuration` (seconds — time to visually reach the target, bounces trail after) plus `bounce` (0 → 1) over hand-tuned physics. Setting `stiffness`, `damping` or `mass` overrides `bounce`.
- Site-wide defaults belong in one place: `<MotionConfig transition={{ duration: 0.3 }}>`.

### Exit animations

```jsx
<AnimatePresence mode="wait">
  {open && <motion.div key="panel" exit={{ opacity: 0 }} />}
</AnimatePresence>
```

- Every child needs a **stable, unique `key`**. No key, no exit animation — the second most common Motion bug.
- `mode`: `sync` (default, concurrent), `wait` (entering child waits for the exiting one, single child only), `popLayout` (exiting element leaves the layout flow so siblings reflow immediately; direct custom-component children must forward their ref).

### Layout changes

```jsx
<motion.div layout />                  // this element's own size / position
<motion.div layoutId="underline" />    // animate between two different elements
```

`layout` animates size and position with transforms and corrects the resulting scale distortion for you. Use it instead of animating `width`, `height`, `top` or `left`. When exit and layout animations mix, wrap them in `<LayoutGroup>`.

### Scroll

```jsx
const { scrollYProgress } = useScroll()
const filter = useTransform(scrollYProgress, [0, 1], ["blur(10px)", "blur(0px)"])
```

Feed scroll progress into GPU-friendly properties only: `opacity`, `transform`, `filter`, `clipPath`. For "animate once when it appears", `whileInView` with `viewport={{ once: true }}` beats any scroll listener.

## Step 4 — Performance checklist

Motion is built on the Web Animations API: animating the right properties gets the element promoted to its own graphical layer automatically. Animating the wrong ones puts layout and paint back in every frame.

- [ ] Animating `transform` / `opacity` (and `filter` / `clipPath` when needed) — not `width`, `height`, `top`, `left`, `margin`
- [ ] Size and position changes go through `layout`, not through animated dimensions
- [ ] Infinite animations use `whileInView` so they stop off-screen
- [ ] Bundle size matters (landing page, mobile): `<LazyMotion features={domAnimation} strict>` plus `import * as m from "motion/react-m"` — `strict` throws if a full `motion` component sneaks in
- [ ] No per-item animation on a list of hundreds of nodes without `stagger()` and a hard look at the count

## Step 5 — Reduced motion (not optional)

```jsx
<MotionConfig reducedMotion="user">   // respects the OS setting, site-wide
```

Or per component: `const shouldReduce = useReducedMotion()` from `motion/react`, then drop the movement and keep the fade. With `reducedMotion="user"`, transform and layout animations are disabled while opacity and colour animations still play — that is the intended behaviour, not a bug.

FR : une animation qui ignore le réglage « réduire les animations » du système est un défaut d'accessibilité, pas un choix esthétique.

## `--audit` mode

Read the Motion code in scope and report each finding as `file:line` — problem — fix:

1. Wrong import for the framework (`framer-motion` leftovers, missing `"use client"`)
2. Animated layout properties instead of `layout` / transforms
3. `AnimatePresence` children without stable keys
4. Infinite animations running off-screen
5. No reduced-motion handling anywhere in the project
6. Animation values duplicated across components instead of a shared `variants` object or `MotionConfig`

Report everything found; fix only what was asked (`stay-in-scope`).

## Anti-patterns to block

1. Importing from `framer-motion` in a project that already ships `motion`.
2. `motion/react` in a Next.js App Router file with neither `"use client"` nor `motion/react-client`.
3. Animating `width` / `height` / `top` / `left` when `layout` does it correctly with transforms.
4. `AnimatePresence` children keyed by array index — reorder the list and the exit animation plays on the wrong node.
5. Physics values copied from a blog post when `visualDuration` + `bounce` expresses the same intent readably.
6. Adding Motion to a project that already uses GSAP, just for one fade.
7. Shipping an animation with no reduced-motion path.

## En clair (FR)

Motion est une bibliothèque d'animation pour le web. La plupart des problèmes ne viennent pas de l'animation elle-même, mais de trois choix faits trop vite : le mauvais import (le paquet a changé de nom, et Next.js exige une ligne `"use client"`), la mauvaise API pour le besoin, et une propriété que le navigateur ne sait pas animer sans tout recalculer à chaque image.

Ce skill impose donc l'ordre inverse : vérifier ce qui est installé, choisir l'API dans un tableau, écrire l'animation avec des propriétés que la carte graphique gère (déplacement, opacité), et prévoir le cas des personnes qui ont demandé à leur système de réduire les animations.

## Next step

Animation written → `/visual-check` to see it run in a real browser, then `/commit`.

$ARGUMENTS
