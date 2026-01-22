/**
 * Registry & Factory: All algorithms in one place
 */

import type { PRNGAlgorithm, GeneratorConfig, PRNGCreator } from '@/prng/core/types'
import { mulberry32Generator } from './mulberry32'
import { xorshift128Generator } from './xorshift128'
import { sfc32Generator } from './sfc32'
import { lcgGenerator } from './lcg'
import { jsf32Generator } from './jsf32'

/** Registry: All generators */
export const PRNG_ALGORITHMS = {
  xorshift128: xorshift128Generator,
  mulberry32: mulberry32Generator,
  jsf32: jsf32Generator,
  sfc32: sfc32Generator,
  lcg: lcgGenerator
} as const;

/** Information about algorithms */
export const PRNG_INFO: Record<PRNGAlgorithm, GeneratorConfig> = {
  xorshift128: {
    algorithm: 'xorshift128',
    name: 'Xorshift128+',
    period: '2¹²⁸ - 1',
    quality: 'outstanding',
    speed: 'fast',
    description: 'High-quality 128-bit PRNG, passes BigCrush'
  },
  mulberry32: {
    algorithm: 'mulberry32',
    name: 'Mulberry32',
    period: '2³² - 1',
    quality: 'good',
    speed: 'very-fast',
    description: 'Fast 32-bit PRNG, good quality'
  },
  jsf32: {
    algorithm: 'jsf32',
    name: 'JSF32 (Jenkins)',
    period: '~2¹²⁷',
    quality: 'excellent',
    speed: 'fast',
    description: 'Bob Jenkins Small Fast, passes TestU01'
  },
  sfc32: {
    algorithm: 'sfc32',
    name: 'SFC32 (Chaotic)',
    period: '~2²⁵⁶',
    quality: 'excellent',
    speed: 'very-fast',
    description: 'Simple Fast Chaotic, excellent period'
  },
  lcg: {
    algorithm: 'lcg',
    name: 'LCG (Park-Miller)',
    period: '2³² - 1',
    quality: 'good',
    speed: 'very-fast',
    description: 'Simple but weak, good for testing only'
  }
}

/** Factory: get a generator by name */
export const createGenerator = (algorithm: PRNGAlgorithm): PRNGCreator => {
  const creator = PRNG_ALGORITHMS[algorithm]

  if (!creator) {
    throw new Error(`Unknown algorithm: ${algorithm}. Available: ${Object.keys(PRNG_ALGORITHMS).join(', ')}`);
  }

  return creator
}

/** Get information about the algorithm */
export const getAlgorithmInfo = (algorithm: PRNGAlgorithm): GeneratorConfig => {
  return PRNG_INFO[algorithm]
}

/** Get all available algorithms */
export const getAllAlgorithms = (): PRNGAlgorithm[] => {
  return Object.keys(PRNG_ALGORITHMS) as PRNGAlgorithm[]
}

export {
  xorshift128Generator,
  mulberry32Generator,
  jsf32Generator,
  sfc32Generator,
  lcgGenerator
}
