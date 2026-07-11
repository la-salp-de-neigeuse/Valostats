import { WidgetCard } from "./WidgetCard";

export function BestAgentWidget({ agent }: { agent: { name: string; winRate: number } | null }) {
  if (!agent) return null;
  return <WidgetCard label="Meilleur agent" value={`${agent.name} (${Math.round(agent.winRate)}%)`} accent />;
}
