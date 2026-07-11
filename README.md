# ValoStats

Base technique SaaS pour ValoStats, une plateforme d'analyse et d'amelioration pour joueurs de Valorant.

Cette premiere etape contient uniquement la fondation :

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- ESLint
- Prettier
- Prisma ORM
- PostgreSQL via `DATABASE_URL` et `DIRECT_URL`
- Schema Prisma conforme a l'architecture v2 validee

## Installation

```bash
npm install
```

## Variables d'environnement

Copier `.env.example` vers `.env`, puis adapter les valeurs :

```bash
cp .env.example .env
```

Variables principales :

- `DATABASE_URL` : connexion applicative PostgreSQL.
- `DIRECT_URL` : connexion directe utilisee par Prisma Migrate.
- `NEXTAUTH_URL` : URL locale ou publique de l'application.
- `NEXTAUTH_SECRET` : secret NextAuth.
- `REDIS_URL` : cache et file de jobs Redis-compatible.
- `INTERNAL_JOB_SECRET` : secret pour endpoints internes de jobs.
- `RIOT_TOKEN_ENCRYPTION_KEY` : cle de chiffrement des tokens externes.

## Prisma

Valider le schema :

```bash
npm run prisma:validate
```

Generer le client Prisma :

```bash
npm run prisma:generate
```

Appliquer les migrations en local quand PostgreSQL est disponible :

```bash
npm run prisma:migrate
```

## Developpement

Lancer l'application :

```bash
npm run dev
```

Ouvrir ensuite `http://localhost:3000`.

## Qualite

```bash
npm run lint
npm run typecheck
npm run format:check
```
