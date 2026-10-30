import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Download, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function Markdown({ text }: { text: string }) {
  return (
    <div className="prose-ai">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

export function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"));
}

export function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AiResult({ loading, text, filename }: { loading: boolean; text: string; filename?: string }) {
  if (loading)
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-highlight" />
        <p className="text-sm">AI is working on it…</p>
      </div>
    );
  if (!text)
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
        <Sparkles className="h-7 w-7 text-highlight" />
        <p className="text-sm">Your AI result will appear here.</p>
      </div>
    );
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => copyText(text)}><Copy className="h-4 w-4" />Copy</Button>
        {filename && (
          <Button size="sm" variant="outline" onClick={() => downloadText(text, filename)}>
            <Download className="h-4 w-4" />Download
          </Button>
        )}
      </div>
      <Markdown text={text} />
    </div>
  );
}
