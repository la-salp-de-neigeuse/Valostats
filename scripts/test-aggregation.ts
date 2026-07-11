import { prisma } from "@/lib/prisma/client";
import { aggregateAllPlayerStats } from "@/services/aggregation/stats-aggregation-service";

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error("Usage: npx tsx scripts/test-aggregation.ts <userId>");
    process.exit(1);
  }

  console.log(`Testing aggregation for user: ${userId}`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { riotAccount: true },
  });

  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  if (!user.riotAccount) {
    console.error("No Riot account linked");
    process.exit(1);
  }

  console.log(`Riot account: ${user.riotAccount.gameName}#${user.riotAccount.tagLine}`);

  const matchCount = await prisma.playerMatchStats.count({
    where: { userId },
  });

  console.log(`Total matches in database: ${matchCount}`);

  if (matchCount === 0) {
    console.log("No matches to aggregate. Exiting.");
    process.exit(0);
  }

  console.log("Starting aggregation...");
  await aggregateAllPlayerStats(userId, ["ALL_TIME", "LAST_7_DAYS", "LAST_30_DAYS"]);

  console.log("Aggregation completed!");

  const aggregates = await prisma.playerStatAggregate.findMany({
    where: { userId },
    orderBy: { period: "asc" },
  });

  console.log("\nAggregates created:");
  for (const agg of aggregates) {
    console.log(`- ${agg.period}: ${agg.matchCount} matches, ${agg.wins}W/${agg.losses}L, ${Number(agg.winRate)}% WR, ${Number(agg.averageKda).toFixed(2)} K/D`);
  }

  const agentAggregates = await prisma.playerAgentAggregate.findMany({
    where: { userId, period: "ALL_TIME" },
    orderBy: { matchCount: "desc" },
    take: 5,
  });

  console.log("\nTop agents:");
  for (const agg of agentAggregates) {
    console.log(`- ${agg.agentName}: ${agg.matchCount} matches, ${Number(agg.winRate)}% WR, ${Number(agg.averageKda).toFixed(2)} K/D`);
  }

  const mapAggregates = await prisma.playerMapAggregate.findMany({
    where: { userId, period: "ALL_TIME" },
    orderBy: { matchCount: "desc" },
    take: 5,
  });

  console.log("\nTop maps:");
  for (const agg of mapAggregates) {
    console.log(`- ${agg.mapName}: ${agg.matchCount} matches, ${Number(agg.winRate)}% WR`);
  }
}

main()
  .then(() => {
    console.log("\n✅ Test completed successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
