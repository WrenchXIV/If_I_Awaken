import type { SpaceContent, SpaceId } from '@/types';

// Eager glob so all JSON content is bundled at build time.
const modules = import.meta.glob<{ default: SpaceContent }>(
  '../data/spaces/*.json',
  { eager: true }
);

const byId = new Map<SpaceId, SpaceContent>();
for (const [path, mod] of Object.entries(modules)) {
  const file = path.split('/').pop() ?? '';
  const id = file.replace('.json', '') as SpaceId;
  byId.set(id, mod.default);
}

export function getSpace(id: SpaceId): SpaceContent {
  const data = byId.get(id);
  if (!data) throw new Error(`No content for space "${id}"`);
  return data;
}

export function getAllSpaces(): SpaceContent[] {
  return Array.from(byId.values()).sort((a, b) => a.index - b.index);
}
