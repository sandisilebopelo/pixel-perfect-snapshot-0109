import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { generateAi } from "./ai.functions";

export function useAi() {
  const fn = useServerFn(generateAi);
  const [loading, setLoading] = useState(false);
  const run = async (prompt: string): Promise<string | null> => {
    setLoading(true);
    try {
      const { text } = await fn({ data: { prompt } });
      return text;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  };
  return { run, loading };
}
