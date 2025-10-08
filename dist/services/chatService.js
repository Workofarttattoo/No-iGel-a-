import { env } from "../config/env.js";
import { getPersonaById } from "./personaService.js";
const VENICE_COMPLETIONS_URL = "https://api.venice.ai/v1/chat/completions";
export const streamChatCompletion = async (personaId, messages) => {
    const persona = await getPersonaById(personaId);
    if (!persona) {
        throw new Error("Persona not found");
    }
    const requestMessages = [
        { role: "system", content: persona.systemPrompt },
        ...messages
    ];
    const response = await fetch(VENICE_COMPLETIONS_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.VENICE_API_KEY}`
        },
        body: JSON.stringify({
            model: env.VENICE_PROFILE_ID,
            stream: true,
            messages: requestMessages
        })
    });
    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Venice request failed: ${response.status} ${body}`);
    }
    return response.body;
};
