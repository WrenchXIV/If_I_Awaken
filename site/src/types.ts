// Content types for tour pages.
// Every space's JSON file conforms to SpaceContent.

export type SpaceId =
  | 'lounge'
  | 'space-1'
  | 'space-2'
  | 'space-3'
  | 'space-4'
  | 'space-5'
  | 'space-6'
  | 'space-7';

export type BeatKind =
  | 'light'
  | 'sound'
  | 'move'
  | 'perf'
  | 'wall'
  | 'floor'
  | 'dancers';

export interface BeatTag {
  kind: BeatKind;
  label?: string;
}

export interface MetaStat {
  label: string;
  value: string;
}

export interface Beat {
  number: string; // "01", "02" — kept as string so leading zeroes survive
  title: string;
  body: string; // can contain inline HTML
  tags?: BeatTag[];
}

export interface PerspectiveImage {
  src: string; // path under /images/<space>/
  alt: string;
  caption?: string;
}

export interface PlanView {
  /** Inline SVG markup. Pasted from the locked design HTML. */
  svg: string;
  caption?: string;
  /** Optional legend rows shown beside the plan. */
  legend?: { color: string; label: string; note?: string }[];
}

export interface DesignState {
  locked: string[];
  stillOpen: string[];
}

export interface SpaceContent {
  id: SpaceId;
  index: number; // 0 = lobby, 1..7 = spaces
  zoneNumber?: number; // for journey-chip color (1-6)
  eyebrow: string; // "If I Awaken in Los Angeles · Space 03"
  title: string; // "The Five Towns"
  tagline?: string | null; // optional second-line subtitle from H1 <em>
  summary?: string | null; // the .subtitle paragraph from the design HTML
  callout: string; // 1–2 paragraphs, can contain <em>
  hero: {
    src: string;
    alt: string;
    /** Where in the image to anchor on cover. e.g. "50% 60%" */
    position?: string;
  };
  meta: MetaStat[];
  plan: PlanView;
  perspectives?: PerspectiveImage[];
  beats: Beat[];
  design: DesignState;
  audio?: {
    src: string;
    label: string; // "Composer's score · Space 3"
  };
  /** Production status footer e.g. "v06 · LOCKED" */
  status?: string;
}

export interface SpaceManifestEntry {
  id: SpaceId;
  index: number;
  title: string;
  shortTitle: string;
  href: string; // base-aware URL, prepended with site base in components
}
