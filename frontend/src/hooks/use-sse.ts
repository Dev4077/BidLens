"use client";

import { useState, useCallback, useRef } from "react";

interface SSEMessage {
  type: string;
  data: string;
  phase?: string;
}

interface UseSSEOptions {
  onMessage?: (msg: SSEMessage) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useSSE(options: UseSSEOptions = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (url: string, body: unknown, token?: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsStreaming(true);
      setMessages([]);
      setCurrentPhase("");

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Stream failed: ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                options.onComplete?.();
                setIsStreaming(false);
                return;
              }

              try {
                const parsed: SSEMessage = JSON.parse(data);
                if (parsed.phase) {
                  setCurrentPhase(parsed.phase);
                }
                setMessages((prev) => [...prev, parsed]);
                options.onMessage?.(parsed);
              } catch {
                const msg: SSEMessage = { type: "token", data };
                setMessages((prev) => [...prev, msg]);
                options.onMessage?.(msg);
              }
            }
          }
        }

        options.onComplete?.();
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          options.onError?.(err as Error);
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [options]
  );

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    isStreaming,
    messages,
    currentPhase,
    startStream,
    stopStream,
  };
}
