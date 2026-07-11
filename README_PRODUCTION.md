# ValoStats — Mise en production

## Prérequis

- Node.js 20.x+
- PostgreSQL 15+
- Redis 7+ (optionnel — fallback mémoire pour le rate limiting)
- Clé API Riot Games (https://developer.riotgames.com)
- Compte Stripe

---

## Installation

```bash
git clone <repo-url>
cd valostats
npm install
```

### Base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npx prisma migrate deploy

# (Optionnel) Seed
npx prisma db seed
```

---

## Variables d'environnement

Copier `.env.example` vers `.env` et remplir toutes les valeurs :

| Variable | Description | Obligatoire |
|---|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL (lecture/écriture) | Oui |
| `DIRECT_URL` | URL directe PostgreSQL (migrations) | Oui |
| `NEXTAUTH_URL` | URL publique de l'application | Oui |
| `NEXTAUTH_SECRET` | Secret pour le chiffrement des sessions (min 32 car.) | Oui |
| `REDIS_URL` | URL Redis (rate limiting, file d'attente) | Oui |
| `RIOT_API_KEY` | Clé API Riot Games | Oui |
| `RIOT_TOKEN_ENCRYPTION_KEY` | Clé de chiffrement 32-byte (base64) | Oui |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | Oui |
| `STRIPE_WEBHOOK_SECRET` | Secret du webhook Stripe | Oui |
| `STRIPE_PRICE_PRO_MONTHLY` | ID du prix Stripe pour l'abonnement Pro | Oui |
| `INTERNAL_JOB_SECRET` | Secret pour les jobs internes (min 32 car.) | Oui |

Les variables sont validées au démarrage via `config/env.ts`. En cas d'absence ou d'invalidité, le démarrage échoue immédiatement.

---

## Stripe

1. Créer un produit et un prix mensuel à 9,99 € dans le dashboard Stripe.
2. Définir `STRIPE_PRICE_PRO_MONTHLY` avec l'ID du prix (ex. `price_xxxxx`).
3. Configurer le webhook Stripe vers `/api/stripe/webhook` avec le secret dans `STRIPE_WEBHOOK_SECRET`.
4. Événements à écouter : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

---

## Riot Games API

1. Obtenir une clé API sur https://developer.riotgames.com.
2. Définir `RIOT_API_KEY` dans les variables d'environnement.
3. (Optionnel) Régénérer `RIOT_TOKEN_ENCRYPTION_KEY` : `openssl rand -base64 32`.

L'API Riot est appelée avec un timeout de 10 secondes et jusqu'à 2 tentatives en cas de rate limit (429).

---

## Build

```bash
npm run build
```

Le build génère les fichiers statiques et les server components Next.js.

---

## Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

Variables à configurer dans le dashboard Vercel : toutes les variables de `.env.example`.

### Docker

Un `Dockerfile` multi-stage n'est pas encore inclus. Pour un déploiement conteneurisé :

```bash
npm run build
node .next/standalone/server.js
```

### Checks pré-déploiement

```bash
# Linter
npm run lint

# TypeScript
npm run typecheck

# Tests
npm run test

# Build
npm run build
```

---

## Maintenance

### Migrations

```bash
npx prisma migrate dev --name <nom_de_la_migration>
```

En production :

```bash
npx prisma migrate deploy
```

### Jobs planifiés

Un endpoint `/api/jobs/riot-sync` est disponible pour la synchronisation périodique des matchs. Appeler avec le header `x-job-secret` (valeur = `INTERNAL_JOB_SECRET`).

### Monitoring

- Logs Prisma en production : erreurs uniquement.
- Rate limiting : basé sur Redis (ou mémoire en fallback), réinitialisation toutes les 60 secondes.
- Verrouillage de compte : après 5 échecs consécutifs, 15 minutes de blocage.

---

## Architecture

| Couche | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| Base de données | PostgreSQL + Prisma 6 |
| Authentification | NextAuth 4 (Credentials) |
| Paiements | Stripe |
| API externe | Riot Games API |
| Tests | Vitest |
| UI | Tailwind CSS 4 |
| Langage | TypeScript 5 |
