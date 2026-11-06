import type { TrackDefinition } from '../types';

export const TRACKS: TrackDefinition[] = [
  {
    id: 'genesis-ridge',
    name: 'Genesis Ridge',
    region: '01 / Genesis Network',
    subtitle: 'The first line starts here.',
    distance: 22500,
    difficulty: 'ROOKIE',
    reward: 55,
    xp: 35,
    accent: 0xd7fb69,
    unlocked: true,
    terrainSeed: 17,
    description: 'A fast introduction to momentum, slopes and the shared network beneath the championship.',
  },
  {
    id: 'asset-canyon',
    name: 'Asset Canyon',
    region: '02 / Digital Ownership',
    subtitle: 'Find your line. Keep what you earn.',
    distance: 25500,
    difficulty: 'RISING',
    reward: 85,
    xp: 55,
    accent: 0xff936f,
    unlocked: true,
    terrainSeed: 29,
    description: 'A rougher route through old depots, collectible signal fragments and equipment drops.',
  },
];