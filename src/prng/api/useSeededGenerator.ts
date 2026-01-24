/**
 * API: Main Usage (useSeededGenerator)
 */

import type { SeededGeneratorOptions, SeededGeneratorAPI } from '../core/types'
import { createGenerator, getAlgorithmInfo } from '../algorithms'

/**
 * The main API for the user
 */
export function useSeededGenerator(
  seed: string | number,
  options: SeededGeneratorOptions = {}
): SeededGeneratorAPI {
  const algorithm = options.algorithm ?? 'mulberry32'
  const generator = createGenerator(algorithm)
  const info = getAlgorithmInfo(algorithm, seed)
  const gen = generator(seed)

  const random = (): number => gen.next().value as number

  const rndInt = (min: number, max: number): number =>
    Math.floor(random() * (max - min + 1)) + min

  const rndFloat = (min: number, max: number): number =>
    random() * (max - min) + min

  const rndItem = <T>(array: readonly T[]): T =>
    array[rndInt(0, array.length - 1)]

  /**
   * Gaussian distribution
   * @return {number} Random number
   */
  const generateGaussian = (): number => {
    const u1 = random()
    const u2 = random()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  /**
   * Produces a random number
   * @param {number} mean - mean value
   * @param {number} stdDev - standard deviation
   * @return {number}
   */
  const gauss = (mean: number, stdDev: number): number =>
    Math.round(generateGaussian() * stdDev + mean)

  const batch = (count: number): number[] => {
    const result: number[] = []
    for (let i = 0; i < count; i++) {
      result.push(random())
    }
    return result
  }

  const shuffle = <T>(array: readonly T[]): T[] => {
    const copy = [...array]
    for (let m = copy.length; m > 1; ) {
      const i = rndInt(0, --m);
      [copy[m], copy[i]] = [copy[i], copy[m]]
    }
    return copy
  }

  return {
    generator: gen,
    random,
    rndInt,
    rndFloat,
    rndItem,
    gauss,
    batch,
    shuffle,
    info
  }
}
