# Lumina — Cyber Risk Portal

An open-source cyber risk management portal that brings enterprise-grade cyber risk practices into a hands-on, operational tool. Lumina combines a modern web front end with an AI service to help teams inventory, assess, and govern cyber risk.

By Bill Martin — Enterprise Architect focused on cybersecurity and cyber risk management.

## Overview

Lumina is built to demonstrate how cyber risk frameworks can be operationalized inside a real application: capturing risks, running assessments, and adding governance controls (including an AI use-case registry and an approval queue for review workflows).

## Tech stack

- **Front end:** React + TypeScript (Vite)
- **Back end:** Node.js server
- **AI service:** Python-based AI service (`ai-service/`)
- **Deployment:** Vercel (front end) + Railway (backend)

## Repository structure

- `src/` — React/TypeScript front-end application
- `server/` — Node.js backend and API
- `ai-service/` — Python AI service
- `index.html`, `vite.config.ts`, `tsconfig.json` — front-end build configuration
- `vercel.json` — deployment configuration
- `.env.example` — sample environment variables

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/BillMartin04/lumina-cyber-risk.git
cd lumina-cyber-risk

# 2. Copy environment variables and fill in your own values
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Run the development server
npm run dev
```

See `.env.example` for the required configuration. The Python AI service in `ai-service/` has its own setup — refer to that folder for details.

## Features

- Cyber risk inventory and assessment workflows
- AI use-case registry for governing GenAI adoption
- Approval queue for reviewing and approving items
- Architecture view (agent inventory, RAG security considerations)

## Related work

This is part of my broader open-source cyber risk work, alongside educational material and a ServiceNow-based cyber risk workspace. Follow the build and walkthroughs on my YouTube channel.

## License

Released under the MIT License. See the `LICENSE.md` file for details.

Copyright (c) 2026 Bill Martin
