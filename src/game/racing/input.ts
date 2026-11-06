export interface RaceInput {
  accelerate: boolean;
  brake: boolean;
  leanForward: boolean;
  leanBack: boolean;
  boost: boolean;
}

export const EMPTY_RACE_INPUT: RaceInput = {
  accelerate: false,
  brake: false,
  leanForward: false,
  leanBack: false,
  boost: false,
};

export const KEY_BINDINGS = {
  accelerate: ['RIGHT', 'D'],
  brake: ['LEFT', 'A'],
  leanForward: ['UP', 'W'],
  leanBack: ['DOWN', 'S'],
  boost: ['SPACE'],
} as const;