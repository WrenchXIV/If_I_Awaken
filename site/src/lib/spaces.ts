import type { SpaceId, SpaceManifestEntry } from '@/types';

export const SPACE_ORDER: SpaceId[] = [
  'lounge',
  'space-1',
  'space-2',
  'space-3',
  'space-4',
  'space-5',
  'space-6',
  'space-7',
];

export const SPACE_MANIFEST: Record<SpaceId, SpaceManifestEntry> = {
  lounge: {
    id: 'lounge',
    index: 0,
    title: 'The Lounge',
    shortTitle: 'Lounge',
    href: '/lounge',
  },
  'space-1': {
    id: 'space-1',
    index: 1,
    title: 'Arrival & LED Introduction',
    shortTitle: 'Space 1',
    href: '/space-1',
  },
  'space-2': {
    id: 'space-2',
    index: 2,
    title: 'Boyle Heights · Chicano LA',
    shortTitle: 'Space 2',
    href: '/space-2',
  },
  'space-3': {
    id: 'space-3',
    index: 3,
    title: 'Five Asian Neighborhoods',
    shortTitle: 'Space 3',
    href: '/space-3',
  },
  'space-4': {
    id: 'space-4',
    index: 4,
    title: 'Black LA',
    shortTitle: 'Space 4',
    href: '/space-4',
  },
  'space-5': {
    id: 'space-5',
    index: 5,
    title: 'Folk LA',
    shortTitle: 'Space 5',
    href: '/space-5',
  },
  'space-6': {
    id: 'space-6',
    index: 6,
    title: 'The Stage',
    shortTitle: 'Space 6',
    href: '/space-6',
  },
  'space-7': {
    id: 'space-7',
    index: 7,
    title: 'The Real LA',
    shortTitle: 'Space 7',
    href: '/space-7',
  },
};

export function neighbors(id: SpaceId): { prev?: SpaceId; next?: SpaceId } {
  const i = SPACE_ORDER.indexOf(id);
  return {
    prev: i > 0 ? SPACE_ORDER[i - 1] : undefined,
    next: i < SPACE_ORDER.length - 1 ? SPACE_ORDER[i + 1] : undefined,
  };
}

/**
 * Index → human path label for the progress UI in tour mode.
 * The Lounge counts as 'Front of house' rather than a numbered room.
 */
export function progressLabel(index: number): string {
  if (index === 0) return 'FOH';
  return String(index).padStart(2, '0');
}
