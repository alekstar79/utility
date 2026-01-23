/** Generator creator */
export type PRNGFunctionGenerator = (seed: string | number) => Generator<number>

/** Names of algorithms */
export type PRNGAlgorithm =
  | 'mulberry32'
  | 'xorshift128'
  | 'sfc32'
  | 'lcg'
  | 'jsf32'

/** PRNG Quality */
export type PRNGQuality = 'good' | 'excellent' | 'outstanding'

/** PRNG Speed */
export type PRNGSpeed = 'fast' | 'very-fast'

/** PRNG Configuration */
export interface GeneratorConfig {
  readonly algorithm: PRNGAlgorithm;
  readonly name: string;
  readonly period: string;
  readonly quality: PRNGQuality;
  readonly speed: PRNGSpeed;
  readonly description: string;
  readonly seed: string | number
}

/** Options for useSeededGenerator */
export interface SeededGeneratorOptions {
  readonly algorithm?: PRNGAlgorithm;
  readonly batchSize?: number;
}

/** API being returned */
export interface SeededGeneratorAPI {
  readonly generator: Generator<number>;
  readonly random: () => number;
  readonly rndInt: (min: number, max: number) => number;
  readonly rndFloat: (min: number, max: number) => number;
  readonly rndItem: <T>(array: readonly T[]) => T;
  readonly gauss: (mean: number, stdDev: number) => number;
  readonly batch: (count: number) => number[];
  readonly shuffle: <T>(array: readonly T[]) => T[];
  readonly info: GeneratorConfig;
}

/** PRNG Constants */
export interface PRNGConstants {
  readonly MULTIPLIER: number;
  readonly INCREMENT?: number;
  readonly MAX_UINT32: number;
}
