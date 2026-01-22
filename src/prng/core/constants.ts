/**
 * Constants: Algoritm parameters
 */

import type { PRNGConstants } from '@/prng'

/** Mulberry32 constants */
export const MULBERRY32 = {
  MULTIPLIER: 0x6C078965,
  MAX_UINT32: 0x100000000
} as const satisfies PRNGConstants

/** LCG (Park-Miller) constants */
export const LCG_CONSTANTS = {
  MULTIPLIER: 1664525,
  INCREMENT: 1013904223,
  MAX_UINT32: 0x100000000
} as const satisfies PRNGConstants

/** JSF32 seed constant */
export const JSF32_SEED = 0xF1EA5EED
