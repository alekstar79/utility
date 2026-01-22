/**
 * Easing function type - maps normalized progress [0,1] to [0,1]
 */
export type EasingFn = (progress: number) => number;

/**
 * Animation timing configuration
 */
export interface TimingOptions {
  /** Animation duration in milliseconds */
  duration: number;
  /** Number of iterations (1 = once, Infinity = infinite) */
  iterations?: number;
  /** Easing function for smooth interpolation */
  easing?: EasingFn;
  /** Delay before animation starts (ms) */
  delay?: number;
}

/**
 * Animation progress state
 */
export interface AnimationState {
  /** Current progress [0,1] across all iterations */
  progress: number;
  /** Normalized progress within current iteration [0,1] */
  normalizedProgress: number;
  /** Current iteration index (0-based) */
  iteration: number;
  /** Total elapsed time (ms) */
  elapsed: number;
  /** Is animation complete */
  isComplete: boolean;
}

/**
 * Animation update callback signature
 */
export type UpdateCallback<T> = (state: AnimationState, target: T) => void | boolean;
