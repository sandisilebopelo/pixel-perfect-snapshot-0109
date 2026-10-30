import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const BASE_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

export const SYSTEM_PROMPT = `You are an intelligent AI Productivity Assistant specializing in professional email writing, meeting notes summarization, task prioritization, and schedule planning.
Interpret user input carefully and never invent facts, decisions, deadlines, or commitments. Mark missing information as "Not specified."
Use Markdown headings, bullet points, and tables where appropriate. Keep outputs clear, organized, actionable and easy to understand. Do not add preamble or ask follow-up questions; produce the deliverable directly.`;

export async function runAi(prompt: string): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured.");
  const provider = createOpenAI({
    baseURL: BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses(MODEL),
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
    onError: ({ error }) => {
      failure = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text;
  if (failure || !text.trim()) {
    const status = (failure as { statusCode?: number })?.statusCode;
    if (status === 429) throw new Error("Too many requests right now. Please wait a moment and try again.");
    if (status === 402 || status === 403)
      throw new Error("AI credits are used up or AI access is blocked for this workspace.");
    throw new Error("The AI could not generate a response. Please try again.");
  }
  return text.trim();
}
