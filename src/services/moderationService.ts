import { randomUUID } from "crypto";

export type ModerationIncident = {
  id: string;
  userId: string;
  personaId?: string;
  message: string;
  matches: string[];
  createdAt: string;
};

const incidents: ModerationIncident[] = [];

export const recordIncident = (incident: Omit<ModerationIncident, "id" | "createdAt">) => {
  const entry: ModerationIncident = {
    ...incident,
    id: randomUUID(),
    createdAt: new Date().toISOString()
  };
  incidents.push(entry);
  return entry;
};

export const listIncidents = () => incidents.slice();
