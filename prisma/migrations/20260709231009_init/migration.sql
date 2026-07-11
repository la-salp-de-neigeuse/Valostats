-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'PRO', 'TEAM');

-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "RiotPlatform" AS ENUM ('BR1', 'EUN1', 'EUW1', 'JP1', 'KR', 'LA1', 'LA2', 'NA1', 'OC1', 'TR1');

-- CreateEnum
CREATE TYPE "RiotRegionGroup" AS ENUM ('AMERICAS', 'ASIA', 'EUROPE', 'SEA');

-- CreateEnum
CREATE TYPE "ValorantQueue" AS ENUM ('COMPETITIVE', 'UNRATED', 'PREMIER', 'SWIFTPLAY', 'SPIKERUSH', 'DEATHMATCH');

-- CreateEnum
CREATE TYPE "MatchResult" AS ENUM ('WIN', 'LOSS', 'DRAW');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SyncJobType" AS ENUM ('RIOT_MATCH_SYNC', 'STAT_AGGREGATION', 'AI_ANALYSIS', 'LEADERBOARD_REBUILD', 'PUBLIC_PROFILE_REBUILD');

-- CreateEnum
CREATE TYPE "AggregatePeriod" AS ENUM ('LAST_7_DAYS', 'LAST_30_DAYS', 'ACT', 'SEASON', 'ALL_TIME');

-- CreateEnum
CREATE TYPE "LeaderboardSortKey" AS ENUM ('KDA', 'WIN_RATE', 'AI_SCORE', 'PROGRESSION', 'MATCH_COUNT');

-- CreateEnum
CREATE TYPE "AiAnalysisStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DashboardWidgetType" AS ENUM ('CURRENT_RANK', 'RANK_PROGRESS', 'AVERAGE_KDA', 'WIN_RATE', 'MATCH_COUNT', 'MAIN_AGENT', 'BEST_MAPS', 'WORST_MAPS', 'PERFORMANCE_EVOLUTION', 'AI_SCORE', 'RECENT_MATCHES');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "normalizedEmail" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "plan" "UserPlan" NOT NULL DEFAULT 'FREE',
    "visibility" "ProfileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "publicSlug" TEXT NOT NULL,
    "privacyVersion" INTEGER NOT NULL DEFAULT 1,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Paris',
    "lastSeenAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordCredential" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "encryptedRefreshToken" BYTEA,
    "encryptedAccessToken" BYTEA,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "idTokenHash" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "showRankPublicly" BOOLEAN NOT NULL DEFAULT false,
    "showMatchHistory" BOOLEAN NOT NULL DEFAULT false,
    "showAiScore" BOOLEAN NOT NULL DEFAULT false,
    "allowLeaderboard" BOOLEAN NOT NULL DEFAULT false,
    "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
    "productEmails" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiotAccount" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "riotPuuid" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "platform" "RiotPlatform" NOT NULL,
    "regionGroup" "RiotRegionGroup" NOT NULL,
    "currentRank" TEXT,
    "currentRankTier" INTEGER,
    "encryptedAccessToken" BYTEA,
    "encryptedRefreshToken" BYTEA,
    "tokenExpiresAt" TIMESTAMP(3),
    "scopes" TEXT,
    "consentExpiresAt" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncAt" TIMESTAMP(3),
    "nextSyncAt" TIMESTAMP(3),
    "syncCursor" TEXT,
    "syncLockUntil" TIMESTAMP(3),
    "lastSyncError" TEXT,

    CONSTRAINT "RiotAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValorantMatch" (
    "id" BIGSERIAL NOT NULL,
    "riotMatchId" TEXT NOT NULL,
    "platform" "RiotPlatform" NOT NULL,
    "regionGroup" "RiotRegionGroup" NOT NULL,
    "queue" "ValorantQueue" NOT NULL,
    "mapId" TEXT NOT NULL,
    "mapName" TEXT NOT NULL,
    "gameStartedAt" TIMESTAMP(3) NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValorantMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMatchStats" (
    "id" BIGSERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "matchId" BIGINT NOT NULL,
    "matchStartedAt" TIMESTAMP(3) NOT NULL,
    "agentName" TEXT NOT NULL,
    "mapName" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "result" "MatchResult" NOT NULL,
    "rankAtMatch" TEXT,
    "rankTierAtMatch" INTEGER,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "headshotRate" DECIMAL(5,2) NOT NULL,
    "damagePerRound" DECIMAL(7,2) NOT NULL,
    "combatScore" DECIMAL(7,2) NOT NULL,
    "firstBloods" INTEGER NOT NULL,
    "firstDeaths" INTEGER NOT NULL,
    "openingDuelsTaken" INTEGER NOT NULL,
    "openingDuelsWon" INTEGER NOT NULL,
    "utilityCasts" INTEGER NOT NULL,
    "plants" INTEGER NOT NULL,
    "defuses" INTEGER NOT NULL,
    "attackRoundsWon" INTEGER NOT NULL,
    "attackRoundsPlayed" INTEGER NOT NULL,
    "defenseRoundsWon" INTEGER NOT NULL,
    "defenseRoundsPlayed" INTEGER NOT NULL,
    "roundsPlayed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerMatchStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStatAggregate" (
    "id" BIGSERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "period" "AggregatePeriod" NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "rank" TEXT,
    "rankTier" INTEGER,
    "matchCount" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "kills" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "averageKda" DECIMAL(7,3) NOT NULL,
    "winRate" DECIMAL(5,2) NOT NULL,
    "headshotRate" DECIMAL(5,2) NOT NULL,
    "damagePerRound" DECIMAL(7,2) NOT NULL,
    "combatScore" DECIMAL(7,2) NOT NULL,
    "firstDeathRate" DECIMAL(5,2) NOT NULL,
    "attackWinRate" DECIMAL(5,2) NOT NULL,
    "defenseWinRate" DECIMAL(5,2) NOT NULL,
    "utilityPerRound" DECIMAL(7,3) NOT NULL,
    "mainAgent" TEXT,
    "bestMap" TEXT,
    "worstMap" TEXT,
    "aiScore" DECIMAL(6,2),
    "rankProgressValue" DECIMAL(8,3) NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerStatAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerAgentAggregate" (
    "id" BIGSERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "period" "AggregatePeriod" NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "agentName" TEXT NOT NULL,
    "matchCount" INTEGER NOT NULL,
    "winRate" DECIMAL(5,2) NOT NULL,
    "averageKda" DECIMAL(7,3) NOT NULL,
    "damagePerRound" DECIMAL(7,2) NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerAgentAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerMapAggregate" (
    "id" BIGSERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "period" "AggregatePeriod" NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "mapName" TEXT NOT NULL,
    "matchCount" INTEGER NOT NULL,
    "winRate" DECIMAL(5,2) NOT NULL,
    "attackWinRate" DECIMAL(5,2) NOT NULL,
    "defenseWinRate" DECIMAL(5,2) NOT NULL,
    "averageKda" DECIMAL(7,3) NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerMapAggregate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAnalysis" (
    "id" BIGSERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "aggregateId" BIGINT,
    "status" "AiAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "score" DECIMAL(6,2),
    "summary" TEXT,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "estimatedCost" DECIMAL(10,4),
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiInsight" (
    "id" BIGSERIAL NOT NULL,
    "analysisId" BIGINT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" INTEGER NOT NULL,
    "problem" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "DashboardWidgetType" NOT NULL,
    "title" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "positionX" INTEGER NOT NULL,
    "positionY" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardSnapshot" (
    "id" BIGSERIAL NOT NULL,
    "period" "AggregatePeriod" NOT NULL,
    "sortKey" "LeaderboardSortKey" NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rowCount" INTEGER NOT NULL,

    CONSTRAINT "LeaderboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaderboardEntry" (
    "id" BIGSERIAL NOT NULL,
    "snapshotId" BIGINT NOT NULL,
    "userId" UUID NOT NULL,
    "rankPosition" INTEGER NOT NULL,
    "publicSlug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "rankName" TEXT,
    "rankTier" INTEGER,
    "kda" DECIMAL(7,3) NOT NULL,
    "winRate" DECIMAL(5,2) NOT NULL,
    "aiScore" DECIMAL(6,2),
    "progression" DECIMAL(8,3) NOT NULL,
    "matchCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaderboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicPlayerProfileCache" (
    "id" BIGSERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "publicSlug" TEXT NOT NULL,
    "privacyVersion" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "rebuiltAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicPlayerProfileCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" BIGSERIAL NOT NULL,
    "userId" UUID,
    "type" "SyncJobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "idempotencyKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMP(3),
    "lockOwner" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageCounter" (
    "id" BIGSERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "metric" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "cost" DECIMAL(12,4) NOT NULL DEFAULT 0,

    CONSTRAINT "UsageCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" BIGSERIAL NOT NULL,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_normalizedEmail_key" ON "User"("normalizedEmail");

-- CreateIndex
CREATE UNIQUE INDEX "User_publicSlug_key" ON "User"("publicSlug");

-- CreateIndex
CREATE INDEX "User_visibility_idx" ON "User"("visibility");

-- CreateIndex
CREATE INDEX "User_plan_idx" ON "User"("plan");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX "User_updatedAt_idx" ON "User"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordCredential_userId_key" ON "PasswordCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expires_idx" ON "Session"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE INDEX "VerificationToken_expires_idx" ON "VerificationToken"("expires");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RiotAccount_userId_key" ON "RiotAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RiotAccount_riotPuuid_key" ON "RiotAccount"("riotPuuid");

-- CreateIndex
CREATE INDEX "RiotAccount_gameName_tagLine_idx" ON "RiotAccount"("gameName", "tagLine");

-- CreateIndex
CREATE INDEX "RiotAccount_platform_idx" ON "RiotAccount"("platform");

-- CreateIndex
CREATE INDEX "RiotAccount_regionGroup_idx" ON "RiotAccount"("regionGroup");

-- CreateIndex
CREATE INDEX "RiotAccount_currentRankTier_idx" ON "RiotAccount"("currentRankTier");

-- CreateIndex
CREATE INDEX "RiotAccount_nextSyncAt_idx" ON "RiotAccount"("nextSyncAt");

-- CreateIndex
CREATE UNIQUE INDEX "ValorantMatch_riotMatchId_key" ON "ValorantMatch"("riotMatchId");

-- CreateIndex
CREATE INDEX "ValorantMatch_regionGroup_gameStartedAt_idx" ON "ValorantMatch"("regionGroup", "gameStartedAt");

-- CreateIndex
CREATE INDEX "ValorantMatch_platform_gameStartedAt_idx" ON "ValorantMatch"("platform", "gameStartedAt");

-- CreateIndex
CREATE INDEX "ValorantMatch_queue_gameStartedAt_idx" ON "ValorantMatch"("queue", "gameStartedAt");

-- CreateIndex
CREATE INDEX "ValorantMatch_mapName_idx" ON "ValorantMatch"("mapName");

-- CreateIndex
CREATE INDEX "PlayerMatchStats_userId_matchStartedAt_idx" ON "PlayerMatchStats"("userId", "matchStartedAt");

-- CreateIndex
CREATE INDEX "PlayerMatchStats_userId_agentName_matchStartedAt_idx" ON "PlayerMatchStats"("userId", "agentName", "matchStartedAt");

-- CreateIndex
CREATE INDEX "PlayerMatchStats_userId_mapName_matchStartedAt_idx" ON "PlayerMatchStats"("userId", "mapName", "matchStartedAt");

-- CreateIndex
CREATE INDEX "PlayerMatchStats_matchStartedAt_idx" ON "PlayerMatchStats"("matchStartedAt");

-- CreateIndex
CREATE INDEX "PlayerMatchStats_result_idx" ON "PlayerMatchStats"("result");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMatchStats_userId_matchId_key" ON "PlayerMatchStats"("userId", "matchId");

-- CreateIndex
CREATE INDEX "PlayerStatAggregate_period_windowEnd_idx" ON "PlayerStatAggregate"("period", "windowEnd");

-- CreateIndex
CREATE INDEX "PlayerStatAggregate_period_averageKda_idx" ON "PlayerStatAggregate"("period", "averageKda");

-- CreateIndex
CREATE INDEX "PlayerStatAggregate_period_winRate_idx" ON "PlayerStatAggregate"("period", "winRate");

-- CreateIndex
CREATE INDEX "PlayerStatAggregate_period_aiScore_idx" ON "PlayerStatAggregate"("period", "aiScore");

-- CreateIndex
CREATE INDEX "PlayerStatAggregate_period_rankProgressValue_idx" ON "PlayerStatAggregate"("period", "rankProgressValue");

-- CreateIndex
CREATE INDEX "PlayerStatAggregate_period_matchCount_idx" ON "PlayerStatAggregate"("period", "matchCount");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStatAggregate_userId_period_windowStart_windowEnd_key" ON "PlayerStatAggregate"("userId", "period", "windowStart", "windowEnd");

-- CreateIndex
CREATE INDEX "PlayerAgentAggregate_userId_period_windowEnd_idx" ON "PlayerAgentAggregate"("userId", "period", "windowEnd");

-- CreateIndex
CREATE INDEX "PlayerAgentAggregate_agentName_period_idx" ON "PlayerAgentAggregate"("agentName", "period");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAgentAggregate_userId_period_windowStart_windowEnd_ag_key" ON "PlayerAgentAggregate"("userId", "period", "windowStart", "windowEnd", "agentName");

-- CreateIndex
CREATE INDEX "PlayerMapAggregate_userId_period_windowEnd_idx" ON "PlayerMapAggregate"("userId", "period", "windowEnd");

-- CreateIndex
CREATE INDEX "PlayerMapAggregate_mapName_period_idx" ON "PlayerMapAggregate"("mapName", "period");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerMapAggregate_userId_period_windowStart_windowEnd_mapN_key" ON "PlayerMapAggregate"("userId", "period", "windowStart", "windowEnd", "mapName");

-- CreateIndex
CREATE INDEX "AiAnalysis_userId_createdAt_idx" ON "AiAnalysis"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiAnalysis_score_idx" ON "AiAnalysis"("score");

-- CreateIndex
CREATE UNIQUE INDEX "AiAnalysis_userId_modelName_modelVersion_promptVersion_inpu_key" ON "AiAnalysis"("userId", "modelName", "modelVersion", "promptVersion", "inputHash");

-- CreateIndex
CREATE INDEX "AiInsight_analysisId_idx" ON "AiInsight"("analysisId");

-- CreateIndex
CREATE INDEX "AiInsight_category_idx" ON "AiInsight"("category");

-- CreateIndex
CREATE INDEX "AiInsight_severity_idx" ON "AiInsight"("severity");

-- CreateIndex
CREATE INDEX "DashboardWidget_userId_visible_idx" ON "DashboardWidget"("userId", "visible");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardWidget_userId_type_key" ON "DashboardWidget"("userId", "type");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_period_sortKey_computedAt_idx" ON "LeaderboardSnapshot"("period", "sortKey", "computedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardSnapshot_period_sortKey_windowStart_windowEnd_key" ON "LeaderboardSnapshot"("period", "sortKey", "windowStart", "windowEnd");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_userId_idx" ON "LeaderboardEntry"("userId");

-- CreateIndex
CREATE INDEX "LeaderboardEntry_publicSlug_idx" ON "LeaderboardEntry"("publicSlug");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_snapshotId_userId_key" ON "LeaderboardEntry"("snapshotId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaderboardEntry_snapshotId_rankPosition_key" ON "LeaderboardEntry"("snapshotId", "rankPosition");

-- CreateIndex
CREATE UNIQUE INDEX "PublicPlayerProfileCache_userId_key" ON "PublicPlayerProfileCache"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicPlayerProfileCache_publicSlug_key" ON "PublicPlayerProfileCache"("publicSlug");

-- CreateIndex
CREATE INDEX "PublicPlayerProfileCache_publicSlug_idx" ON "PublicPlayerProfileCache"("publicSlug");

-- CreateIndex
CREATE INDEX "PublicPlayerProfileCache_expiresAt_idx" ON "PublicPlayerProfileCache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SyncJob_idempotencyKey_key" ON "SyncJob"("idempotencyKey");

-- CreateIndex
CREATE INDEX "SyncJob_status_runAt_idx" ON "SyncJob"("status", "runAt");

-- CreateIndex
CREATE INDEX "SyncJob_userId_type_createdAt_idx" ON "SyncJob"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "UsageCounter_metric_periodStart_periodEnd_idx" ON "UsageCounter"("metric", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "UsageCounter_userId_metric_periodStart_periodEnd_key" ON "UsageCounter"("userId", "metric", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "PasswordCredential" ADD CONSTRAINT "PasswordCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiotAccount" ADD CONSTRAINT "RiotAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchStats" ADD CONSTRAINT "PlayerMatchStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatchStats" ADD CONSTRAINT "PlayerMatchStats_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "ValorantMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatAggregate" ADD CONSTRAINT "PlayerStatAggregate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAgentAggregate" ADD CONSTRAINT "PlayerAgentAggregate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMapAggregate" ADD CONSTRAINT "PlayerMapAggregate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAnalysis" ADD CONSTRAINT "AiAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "AiAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "LeaderboardSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaderboardEntry" ADD CONSTRAINT "LeaderboardEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicPlayerProfileCache" ADD CONSTRAINT "PublicPlayerProfileCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncJob" ADD CONSTRAINT "SyncJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageCounter" ADD CONSTRAINT "UsageCounter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
