'use client';

/**
 * Small trust/polish badge surfacing the free MiniMax integration.
 * Silicon-Valley-startup vibe: crisp, monochrome, subtle glow.
 */
export default function FreeAIBadge({ model }: { model?: string }) {
  return (
    <span
      title="IA 100% gratuita via MiniMax (Puter.js) — modelo User-Pays, sem custo para você"
      role="status"
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-300"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </span>
      Free AI · MiniMax
      {model ? <span className="text-emerald-400/70">· {model.split('/').pop()}</span> : null}
    </span>
  );
}
