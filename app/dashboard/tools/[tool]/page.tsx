"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, FileSearch, RefreshCw, Star, Wrench } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui/kit";
import { Enter } from "@/components/motion";

const TOOLS: Record<
  string,
  { icon: React.ReactNode; title: string; description: string; details: string }
> = {
  "duplicate-remover": {
    icon: <Copy className="size-7" />,
    title: "Duplicate remover",
    description: "Scan your music library and clean out duplicate tracks safely.",
    details:
      "This tool needs access to files on your computer, so it ships as part of the upcoming NEXORA desktop companion app. It will detect duplicates by audio fingerprint — not just file name — and let you review everything before deleting.",
  },
  "missing-files": {
    icon: <FileSearch className="size-7" />,
    title: "Missing file finder",
    description: "Find tracks your DJ software references that no longer exist on disk.",
    details:
      "Point it at your Serato or Rekordbox library and it will list every broken reference, then help you relocate or re-download the originals. Coming with the desktop companion app.",
  },
  "library-sync": {
    icon: <RefreshCw className="size-7" />,
    title: "Library sync",
    description: "Keep playlists, cues, and grids in sync between Serato and Rekordbox.",
    details:
      "Two-way conversion of playlists and metadata between platforms, so you can switch software (or booths) without rebuilding your library. Coming with the desktop companion app.",
  },
  upgrade: {
    icon: <Star className="size-7" />,
    title: "Premium tools upgrade",
    description: "Unlock unlimited library tools, AI sorting, and format conversion.",
    details:
      "The Premium Tools add-on brings unlimited usage of every library tool, AI-powered file organization, and set curation help. It will be available as an add-on to your CRM plan.",
  },
};

export default function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = use(params);
  const router = useRouter();
  const info = TOOLS[tool];

  if (!info) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center text-ink-secondary">Tool not found.</div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <Enter>
        <Card className="p-10 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl bg-[#f0f4ff] text-accent">
            {info.icon}
          </div>
          <Badge tone="orange" className="mb-4">Coming soon</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{info.title}</h1>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-ink-secondary">{info.description}</p>

          <div className="mt-8 rounded-2xl bg-[#fafafa] p-6 text-left">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Wrench size={14} className="text-ink-tertiary" /> What to expect
            </h3>
            <p className="text-sm leading-relaxed text-ink-secondary">{info.details}</p>
          </div>

          <Button className="mt-8" variant="secondary" onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </Button>
        </Card>
      </Enter>
    </div>
  );
}
