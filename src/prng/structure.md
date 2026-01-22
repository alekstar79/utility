# PRNG (Pseudorandom Number Generator) Library

A fully functional library of pseudorandom number generators with support for 5 algorithms.

## Project structure

```
prng/
├── core/
│   ├── types.ts              # Types and Interfaces
│   ├── constants.ts          # Constants of algorithms
│   └── utils.ts              # Utilities (buffer initialization)
├── algorithms/
│   ├── mulberry32.ts         # Mulberry32 PRNG
│   ├── xorshift128.ts        # Xorshift128+ PRNG
│   ├── sfc32.ts              # SFC32 PRNG
│   ├── lcg.ts                # LCG PRNG
│   ├── jsf32.ts              # JSF32 PRNG
│   └── index.ts              # Registry & Factory
├── api/
│   ├── useSeededGenerator.ts # Main API (everything is used)
│   └── selector.ts           # Algorithm Selection
├── presets/
│   └── defaults.ts           # Presets
├── index.ts                  # Main export
├── structure.md
└── README.md
```

## Separation logic

1. **`core/`** — the foundation, does not depend on anything
2. **`algorithms/`** — independent algorithms, depend only on `core/`
3. **`api/`** — algorithm composition, depends on `algorithms/` and `core/`
4. **`presets/`** — configs for the API
5. **`index.ts`** is the main export for the user

## Dependency graph

```
types.ts ← constants.ts, utils.ts
    ↓
mulberry32.ts, xorshift128.ts, sfc32.ts, lcg.ts, jsf32.ts
    ↓
algorithms/index.ts (Registry)
    ↓
useSeededGenerator.ts, benchmark.ts, selector.ts
    ↓
presets/defaults.ts
    ↓
index.ts (Main Export)
```

**Cyclical dependencies**: ❌ NO
