import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const generateAi = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ prompt: z.string().min(1).max(60000) }).parse(d))
  .handler(async ({ data }) => {
    const { runAi } = await import("./ai.server");
    const text = await runAi(data.prompt);
    return { text };
  });
