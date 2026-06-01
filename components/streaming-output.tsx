"use client";

import { useEffect, useRef } from "react";

interface StreamingOutputProps {
  content: string;
  isStreaming: boolean;
}

export function StreamingOutput({ content, isStreaming }: StreamingOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll as content streams in
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [content]);

  return (
    <div className="relative bg-paper border border-line rounded-xl overflow-hidden">
      <div className="px-6 py-5 max-h-[600px] overflow-y-auto">
        <div
          className="text-sm text-ink-2 leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {content}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-accent animate-pulse ml-0.5 align-middle" />
          )}
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
