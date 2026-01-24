/**
 * Presets: Готовые конфигурации для common use cases
 */

import type { SeededGeneratorOptions } from '../core/types'

/** Быстрые игровые PRNG */
export const PRESET_GAMING: SeededGeneratorOptions = {
  algorithm: 'mulberry32'
}

/** ✅ Высокое качество для симуляций */
export const PRESET_SIMULATION: SeededGeneratorOptions = {
  algorithm: 'xorshift128'
}

/** Процедурная генерация (лучший период) */
export const PRESET_PROCEDURAL: SeededGeneratorOptions = {
  algorithm: 'sfc32'
}

/** Balanced: скорость + качество */
export const PRESET_BALANCED: SeededGeneratorOptions = {
  algorithm: 'sfc32'
}

/** Хаотичные физические системы */
export const PRESET_CHAOS: SeededGeneratorOptions = {
  algorithm: 'jsf32'
}

/** Тестирование (быстро) */
export const PRESET_TESTING: SeededGeneratorOptions = {
  algorithm: 'lcg'
}

/** Экспорт всех пресетов */
export const PRESETS = {
  PRESET_GAMING,
  PRESET_SIMULATION,
  PRESET_PROCEDURAL,
  PRESET_BALANCED,
  PRESET_CHAOS,
  PRESET_TESTING
} as const
