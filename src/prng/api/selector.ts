/**
 * Selector: Smart selection of the optimal algorithm
 */

import type { PRNGAlgorithm } from '@/prng'
import { PRNG_INFO } from '@/prng'

/**
 * Choosing an algorithm by priority
 */
export const selectAlgorithm = (
  priority: 'speed' | 'quality' | 'period' | 'balanced' = 'balanced'
): PRNGAlgorithm => {
  switch (priority) {
    case 'speed':
      return 'mulberry32'   // Maximum speed
    case 'quality':
      return 'xorshift128'  // Highest quality
    case 'period':
      return 'sfc32'        // Best period (~2²⁵⁶)
    case 'balanced':
      return 'sfc32'        // Excellent balance: speed + quality + period
    default:
      return 'mulberry32'
  }
}

/**
 * Recommendation for the use case
 */
export const recommendAlgorithm = (useCase: string): PRNGAlgorithm => {
  const cases: Record<string, PRNGAlgorithm> = {
    'game-shuffle': 'mulberry32',     // Fast card shuffling
    'procedural-generation': 'sfc32', // Procedural generation (best period)
    'monte-carlo': 'xorshift128',     // Monte Carlo simulations (high quality)
    'cryptography': 'xorshift128',    // NOT for crypto! Use crypto.getRandomValues()
    'testing': 'lcg',                 // Simple tests
    'physics-simulation': 'jsf32',    // Physics simulations (chaos)
    'default': 'sfc32'
  }

  return cases[useCase] ?? cases['default']
}

/**
 * Compare all algorithms
 */
export const compareAlgorithms = (): string => {
  const rows = Object.entries(PRNG_INFO).map(([_key, info]) => {
    return `| ${info.name.padEnd(20)} | ${info.period.padEnd(12)} | ${info.quality.padEnd(12)} | ${info.speed.padEnd(10)} | ${info.description} |`
  })

  return `
| Algorithm            | Period       | Quality      | Speed      | Description |
|----------------------|--------------|--------------|------------|-------------|
${rows.join('\n')}
`
}
