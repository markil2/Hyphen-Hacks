# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

Expo (SDK 57) / React Native / TypeScript with expo-router, one codebase for iPhone and Android (`frontend/`). The teammate's backend (`backend/`) is Node, Express, Prisma and SQLite, running in demo-login mode for now. The frontend talks to it only through `frontend/src/services`; see `frontend/docs/BACKEND_INTEGRATION.md`.

## Users

New parents in the first year. They are often tired, short on time, using the app one-handed, and sometimes in the middle of the night.

## Product Purpose

Nurture is a calm digital home where parents keep simple notes on everyday care (sleep, feeding, diapers) and, above all, find trustworthy human support: experts, useful resources and other parents. Built for the Hyphen Hacks hackathon (theme: "Connecting Constellations", expressed through connecting parents to people, not through space imagery).

## Positioning

Not another generic AI answer box: Nurture's centre of gravity is connecting parents with qualified people and supportive communities, inside an interactive, illustrated home rather than a dashboard.

## Operating Context

- Two-person hackathon team: one person on the frontend, one on the backend.
- Used on phones, often at night, in short moments between caring for a baby.

## Capabilities and Constraints

- Navigation is spatial: the rooms are the middle of the app (swipe left/right between nursery, kitchen, living room, changing area and play corner), Home sits above, Settings below.
- Nursery: tapping the crib opens a baby-monitor device (illustrated night-vision view, plus a dashboard of logged sleep). There are no sensors, so vitals tiles stay empty. The lamp chain starts and ends sleep sessions.
- Play corner: a height ruler on the growth board, recorded milestones, play ideas.
- Data comes from the backend. An offline demo mode (no API URL) uses device-only sample data, clearly labelled.
- Community and profile were removed for now.
- Never fabricate experts, credentials, endorsements, product claims, reviews or community activity. Sample content is labelled as fictional or unverified.
- Not medical advice: no diagnosis, no interpreting logs, no rigid milestone deadlines. Urgent concerns are pointed to a pediatrician or emergency services first.
- No guilt or judgment about sleep, feeding choices or development.

## Brand Commitments

- Name: Nurture.
- Visual reference: `frontend/design/reference/nursery-reference.png`. Warm photoreal nursery at night, interpreted as layered 2.5D illustrations.
- Fonts: Lora (headings) and Nunito Sans (body).
- Monitor reference: `frontend/design/reference/IMG_0492.png`.
- Palette: warm cream `#D8C6AC` (dominant), sage `#879783`, dusty blue `#A9B9C6`, warm white `#F5F0E7`, charcoal `#352F29`, terracotta `#B9826B` for small accents.
- Gender-neutral, editorial, calm; no cartoonish, clinical or space-themed styling; no emoji standing in for illustrations.

## Evidence on Hand

None yet. There are no real users, testimonials, partners, experts or reviewed content. Future work must not invent any.

## Product Principles

1. People over answers: route parents toward qualified humans and each other.
2. One hand, tired brain: every core action works one-handed, half-awake, in the dark.
3. Trustworthy, not alarming: plain language, honest labels, urgent help first.
4. Notes, not scores: logs are observations; the app never judges them.

## Accessibility & Inclusion

Large tap targets (48pt), labelled controls, button alternatives for every gesture (the lamp chain can be tapped or pressed as a button), status never shown by colour alone, and a reduce-motion option that honours the OS setting.
