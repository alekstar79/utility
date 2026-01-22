# PRNG - Complete Guide

Full-featured pseudorandom number generators (PRNG) with support for **5 algorithms**.

<!-- TOC -->
* [PRNG - Complete Guide](#prng---complete-guide)
  * [🚀 Quick Start](#-quick-start)
  * [🎮 Usage examples](#-usage-examples)
    * [1. Shuffling cards (games)](#1-shuffling-cards-games)
    * [3. Statistical distributions](#3-statistical-distributions)
  * [📊 Algorithms](#-algorithms)
  * [🔧 API Help](#-api-help)
    * [`useSeededGenerator(seed, options?)`](#useseededgeneratorseed-options)
    * [`selectAlgorithm(priority)`](#selectalgorithmpriority)
    * [`recommendAlgorithm(useCase)`](#recommendalgorithmusecase)
  * [Encryption](#encryption)
  * [📁 Architecture](#-architecture)
  * [🧪 Testing](#-testing)
  * [📈 Performance](#-performance)
  * [📚 Links](#-links)
  * [📝 License](#-license)
<!-- TOC -->

## 🚀 Quick Start

```typescript
import { useSeededGenerator } from '@alekstar79/utils/prng'

// Default: Mulberry32 (fast, good quality)
const rng = useSeededGenerator('my-seed')

// Basic methods
console.log(rng.random())                 // [0, 1]
console.log(rng.rndInt(1, 100))           // [1, 100]
console.log(rng.rndFloat(0, 1)) // [0, 1]
console.log(rng.rndItem(['A', 'B', 'C'])) // random element
````

## 🎮 Usage examples

### 1. Shuffling cards (games)

```typescript
import { useSeededGenerator, PRESETS } from '@alekstar79/utils/prng'

const deck = ['♥A', '♥K', '♦Q', '♠J']
const rng = useSeededGenerator('deck-seed', PRESETS.PRESET_GAMING)

const shuffled = rng.shuffle(deck)
console.log(shuffled) // Random order, but reproducible
```

###2. Procedural generation (routes, levels)

```typescript
import { useSeededGenerator, PRESETS } from '@alekstar79/utils/prng'

const rng = useSeededGenerator('level-123', PRESETS.PRESET_PROCEDURAL)

// Generating enemy characteristics
const enemy = {
  health: rng.rndInt(50, 150),
  armor: rng.rndInt(0, 10),
  loot: rng.shuffle(['gold', 'silver', 'gems'])
}
```

### 3. Statistical distributions

```typescript
import { useSeededGenerator } from '@alekstar79/utils/prng'

const rng = useSeededGenerator('stats-seed')

// Gaussian distribution (mean=100, std.deviation=15)
const iq = rng.gauss(100, 15)
console.log(iq) // ~95-105 (in most cases)

// Batch generation
const randomNumbers = rng.batch(1000)
```

###4. Monte Carlo simulations

```typescript
import { useSeededGenerator, PRESETS } from '@alekstar79/utils/prng'

const rng = useSeededGenerator('mc-seed', PRESETS.PRESET_SIMULATION)

// Estimation of π by the Monte Carlo method
let inside = 0
for (let i = 0; i < 100000; i++) {
  const x = rng.random()
  const y = rng.random()
  if (x * x + y * y < 1) {
    inside++
  }
}
const piEstimate = (inside / 100000) * 4
console.log(piEstimate) // ~3.14159
```

###5. Choosing an algorithm

```typescript
import { useSeededGenerator, selectAlgorithm, recommendAlgorithm } from '@alekstar79/utils/prng'

// By priority
const rng1 = useSeededGenerator('seed', { 
  algorithm: selectAlgorithm('speed')     // Mulberry32
})

const rng2 = useSeededGenerator('seed', { 
  algorithm: selectAlgorithm('quality')   // Xorshift128+
})

// By use case
const rng3 = useSeededGenerator('seed', { 
  algorithm: recommendAlgorithm('procedural-generation') // SFC32
})
```

## 📊 Algorithms

| Algorithm        | Period | Quality   | Speed  | Application              |
|------------------|--------|-----------|--------|--------------------------|
| **Mulberry32**   | 2³²    | Good      | ⚡ Макс | Shuffle, games           |
| **Xorshift128+** | 2¹²⁸   | Excellent | Fast   | Monte-Carlo, simulations |
| **SFC32**        | ~2²⁵⁶  | Excellent | ⚡ Макс | Procedural generation    |
| **LCG**          | 2³²    | Weak      | ⚡ Max  | Tests only               |
| **JSF32**        | ~2¹²⁷  | Excellent | Fast   | Physical Systems         |

## 🔧 API Help

### `useSeededGenerator(seed, options?)`

The main function. Returns an object with methods.

```typescript
interface SeededGeneratorAPI {
  random(): number;                     // [0...1]
  rndInt(min, max): number;             // [min, max]
  rndFloat(min, max): number;           // [min, max]
  rndItem<T>(array): T;                 // random element
  gauss(mean, stdDev): number;          // Gaussian distribution
  batch(count): number[];               // N random numbers
  shuffle<T>(array): T[];               // Fisher-Yates shuffle
  info: GeneratorConfig;                // information about the algorithm
  generator: Generator<number>;         // the generator itself
}
```

### `selectAlgorithm(priority)`

Select an algorithm by priority.

```typescript
import { selectAlgorithm } from '@alekstar79/utils/prng'

selectAlgorithm('speed')     // Mulberry32
selectAlgorithm('quality')   // Xorshift128+
selectAlgorithm('period')    // SFC32
selectAlgorithm('balanced')  // SFC32
```

### `recommendAlgorithm(useCase)`

Recommend a case-based algorithm.

```typescript
import { recommendAlgorithm } from '@alekstar79/utils/prng'

recommendAlgorithm('game-shuffle')           // Mulberry32
recommendAlgorithm('procedural-generation')  // SFC32
recommendAlgorithm('monte-carlo')            // Xorshift128+
recommendAlgorithm('physics-simulation')     // JSF32
```

## Encryption

**NEVER use PRNG for encryption!** They are not cryptographically secure.

Use instead:

```typescript
// ✅ Cryptographic proof
const key = new Uint8Array(32)
crypto.getRandomValues(key) // WebCrypto API

// ❌ NOT Crypto-resistant
const prng = useSeededGenerator('secret')
const key = prng.batch(32)  // Vulnerable!
```

## 📁 Architecture

```text
prng/
├── core/         # Types, constants, utilities
├── algorithms/   # 5 implementations of the PRNG
├── api/          # useSeededGenerator, selector
└── presets/      # Ready-made configs
```

**Principles**:
- ✅ SRP (Single Responsibility)
- ✅ DRY (Don't Repeat Yourself)
- ✅ Zero circular dependencies
- Type Safety (100% TypeScript)

## 🧪 Testing

```typescript
// Reproducibility
const rng1 = useSeededGenerator('test')
const rng2 = useSeededGenerator('test')
console.log(rng1.random() === rng2.random()) // true

// Different seed = different results
const rng3 = useSeededGenerator('test2')
console.log(rng1.random() !== rng3.random()) // true
```

## 📈 Performance

On an i7-10700K machine, 1M iterations:

```text
Mulberry32: ~8ms (125k ops/ms) ⚡ Max
SFC32: ~12ms (83k ops/ms) ⚡ Excellent balance
JSF32: ~15ms (67k ops/ms) ⚡ Good
Xorshift128+: ~20ms (50k ops/ms) ⚡ Quality
LCG: ~7ms (143k ops/ms) ⚡ Fastest
```

## 📚 Links

- [PRNG Wikipedia](https://en.wikipedia.org/wiki/Pseudorandom_number_generator)
- [Seeding random number generator in JavaScript](https://stackoverflow.com/a/47593316)
- [Xorshift128+ (Marsaglia)](https://en.wikipedia.org/wiki/Xorshift)
- [ECMA Math.random](https://tc39.es/ecma262/#sec-math.random)
- [SFC32 (Doty-Humphrey)](https://gist.github.com/justmoon/89b4945b80e1caaa79fbc1500dea63e8 )
- [CSPRNG for crypto](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues )

## 📝 License

MIT
