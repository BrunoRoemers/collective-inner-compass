# Collective Inner Compass
Assessment tool for https://www.theblindspot.space/

The **main branch** of this repo is automatically deployed to https://cic.roemers.io

[![Netlify Status](https://api.netlify.com/api/v1/badges/c34b751b-a14c-45fb-8be4-d3cd4c64830b/deploy-status)](https://app.netlify.com/sites/collective-inner-compass/deploys)

# Development

## General
1. install dependencies
   - `npm install`
   - `brew install cockroachdb/tap/cockroach`
1. make a copy of `.env.example` and name it `.env`
1. `npm run dev` starts Remix in dev mode, starts a local (insecure) instance of Cockroach DB and launches Prisma Studio
   - `npm run dev:remix` starts Remix in dev mode (http://localhost:3000)
   - `npm run dev:studio` launches Prisma Studio (http://localhost:8080)
   - `npm run dev:db` starts a local (insecure) instance of Cockroach DB (http://localhost:5555)

## Prisma
- `npx prisma db push` to test out schema changes (does NOT create migration files)
- `npx prisma db seed` to run the seed script on the existing state of the database
- `npx prisma migrate dev` to commit to new schema (creates migration files needed for deployment in production)
- `npx prisma migrate reset` to revert to the state of the latest migration (ie. undo manual changes and/or `prisma db push` experiments)
- `npx prisma migrate deploy` to deploy in production (automatically triggered by a [Netlify plugin](netlify/plugins/deploy-to-cockroach-db/index.js))
- `npx prisma studio` to view/edit the database (configured in `.env`)
  - `npm run db:studio`: wrapper to help launch a Prisma Studio instance for a remote database