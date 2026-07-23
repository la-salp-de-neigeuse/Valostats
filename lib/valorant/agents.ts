const AGENT_ID_TO_NAME: Record<string, string> = {
  "117ed9e3-49f3-6512-3ccf-0cada7e3823b": "Cypher",
  "1dbf2edd-4729-0984-3115-daa5eed44993": "Clove",
  "1e58de9c-4950-5125-93e9-a0aee9f98746": "Killjoy",
  "22697a3d-45bf-8dd7-4fec-84a9e28c69d7": "Chamber",
  "320b2a48-4d9b-a075-30f1-1f93a9b638fa": "Sova",
  "41fb69c1-4189-7b37-f117-bcaf1e96f1bf": "Astra",
  "569fdd95-4d10-64ab-9647-0a90640102e7": "Sage",
  "5f8d3a7f-467b-97f3-062c-13acf203c006": "Breach",
  "601dbbe7-43ce-be57-2a40-4bd9a7a0089c": "Skye",
  "6f2a04ca-43e0-be17-7f36-b3908628ee46": "Fade",
  "707eab51-4836-f488-046a-cda6bf494859": "Viper",
  "7f8d0a8a-43bf-bb09-e27e-58857c6a7f29": "Yoru",
  "8e253930-4c05-31dd-1b6c-c5297a014474": "Omen",
  "95b78ed7-463b-86d9-7e41-71ba5c9aee97": "Harbor",
  "9f0d8ba9-4140-b941-57d3-a7ad57c6b417": "Brimstone",
  "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc": "Reyna",
  "a79b1b2f-1c46-4d43-8a62-7a6376096210": "Iso",
  "add6443a-41bd-e414-f6ad-f58afd048ba7": "Jett",
  "bb2a4828-46eb-8cd1-e765-15848195d751": "Neon",
  "cc8b95c8-4f25-4ffa-b78d-52895b6237c7": "Deadlock",
  "dade69b4-4f5a-8528-247a-100d37a98484": "KAY/O",
  "e370fa57-4757-3604-3648-499e1f642d8f": "Gekko",
  "eb93336a-449b-9c1b-0a54-a89125279263": "Phoenix",
  "f94c3b30-42be-e889-8805-1e7922ce69f9": "Raze",
};

export function formatAgentName(agentId: string): string {
  const normalized = agentId.toLowerCase();
  return AGENT_ID_TO_NAME[normalized] ?? agentId;
}

const AGENT_NAME_TO_UUID: Record<string, string> = Object.fromEntries(
  Object.entries(AGENT_ID_TO_NAME).map(([uuid, name]) => [name, uuid])
);

export function getAgentUuid(name: string): string | null {
  return AGENT_NAME_TO_UUID[name] ?? null;
}
