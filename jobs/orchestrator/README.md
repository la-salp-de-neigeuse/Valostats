# Job Orchestrator (production)

Ce module centralise l'execution des `SyncJob` pour eviter :
- la double execution
- les jobs bloques en `RUNNING`
- les analyses IA jamais declenchees

## Points clefs

- Claim atomique d'un job (`QUEUED` ou `RUNNING` stale).
- Verrouillage par `lockOwner` et `lockedAt`.
- Timeout par type de job avec reprise automatique.
- Retry exponentiel tant que `attempts < maxAttempts`.
- Statuts finaux fiables (`COMPLETED` / `FAILED`) et logs JSON.

## Interfaces d'execution

- API interne batch : `GET|POST /api/jobs/run`
- API legacy par job : `POST /api/jobs/riot-sync`
- Worker Node separable : `runJobWorkerLoop()` (`jobs/worker/loop.ts`)

## Cron / Vercel Cron

- Appeler `GET /api/jobs/run` avec `Authorization: Bearer <CRON_SECRET|INTERNAL_JOB_SECRET>`.
- Optionnel : `?limit=5` pour controler la taille de batch.

Exemple Vercel Cron:

```json
{
  "crons": [
    {
      "path": "/api/jobs/run?limit=5",
      "schedule": "*/1 * * * *"
    }
  ]
}
```
