import { randomUUID } from "crypto";
const incidents = [];
export const recordIncident = (incident) => {
    const entry = {
        ...incident,
        id: randomUUID(),
        createdAt: new Date().toISOString()
    };
    incidents.push(entry);
    return entry;
};
export const listIncidents = () => incidents.slice();
