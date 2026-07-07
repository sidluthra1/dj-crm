# Skill: Music library maintenance

## When to use
Weekly library upkeep: removing duplicate tracks, finding broken file references in DJ software, and keeping Serato and Rekordbox libraries in sync. (~5+ hrs/week; the biggest recurring time sink.)

## Steps, in order
1. This work happens **outside the web app** — it needs desktop file access. The intended behavior of each tool is specified in `app/dashboard/tools/[tool]/page.tsx` (the `TOOLS` record); treat those descriptions as the requirements.
2. **Duplicate removal:** scan the music folder and detect duplicates **by audio fingerprint — not just file name** (per the real spec: "It will detect duplicates by audio fingerprint — not just file name — and let you review everything before deleting"). Group matches, present them for review, and only delete after explicit confirmation.
3. **Missing-file finding:** "Point it at your Serato or Rekordbox library and it will list every broken reference, then help you relocate or re-download the originals." Parse the library database, check each track path against disk, and output the broken-reference list with relocation candidates.
4. **Library sync:** "Two-way conversion of playlists and metadata between platforms" — convert playlists, cues, and grids between Serato and Rekordbox so switching software doesn't mean rebuilding.
5. If building these as scripts, put them in a `tools/` or `desktop/` folder in this repo (they are the seed of the planned "NEXORA desktop companion app"). Inputs you need from the owner: the music folder path, the `_Serato_` folder (crates + `database V2`), and/or the Rekordbox `master.db` or exported XML.
6. Per-gig set prep connects back to the CRM: each event's `music_list_url` holds the client's request list — pull it when building crates for a specific gig.

## Example of a good final output (the real tool specs from app/dashboard/tools/[tool]/page.tsx)
```ts
const TOOLS = {
  "duplicate-remover": {
    title: "Duplicate remover",
    description: "Scan your music library and clean out duplicate tracks safely.",
    details: "…It will detect duplicates by audio fingerprint — not just file name — and let you review everything before deleting.",
  },
  "missing-files": {
    title: "Missing file finder",
    description: "Find tracks your DJ software references that no longer exist on disk.",
    details: "Point it at your Serato or Rekordbox library and it will list every broken reference, then help you relocate or re-download the originals.",
  },
  "library-sync": {
    title: "Library sync",
    description: "Keep playlists, cues, and grids in sync between Serato and Rekordbox.",
    details: "Two-way conversion of playlists and metadata between platforms, so you can switch software (or booths) without rebuilding your library.",
  },
};
```
A conforming duplicate-scan report therefore looks like: grouped candidate sets (fingerprint match), each showing file paths, bitrates, and sizes, with a keep/delete choice per group and **nothing deleted until the user reviews**.

## Mistakes to avoid (constraints stated in this repo)
- **Never auto-delete.** The spec is explicit: review everything before deleting. Output a report first; deletion is a separate confirmed step.
- **Don't match duplicates by filename alone** — the spec requires audio fingerprinting (same track, different names/bitrates must still match; different tracks with the same name must not).
- **Do not implement audio downloading.** CLAUDE.md: the Spotify-downloader idea "can't ship as-is for legal reasons" — relocating/re-downloading originals means pointing at files the user already owns, not fetching from streaming services.
- Don't try to build these into the Next.js web app — CLAUDE.md marks the Tools section intentionally "coming soon" because browsers can't access the local file system; keep the web pages as-is and build scripts/desktop tooling instead.
- Don't modify Serato/Rekordbox database files without backing them up first — a corrupted `database V2` loses cues and crates.
