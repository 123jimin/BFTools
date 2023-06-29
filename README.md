# BFTools

BFTools is a library for manipulating [BrainF**k](https://en.wikipedia.org/wiki/Brainfuck) codes.

There are several layers of representations.

- `bf`: Basic BF primitives.
    - 1:1 correspondence with raw BrainF**k code.
    - No optimization is performed other than run-length encoding.
- `bsm`: Assembly language for BF.
    - Extension to `bf`.
    - Can be easily converted to `bf`. 
    - Various optimizations can be performed.
    - Transpilable to various different languages.

## Goal
- Design an expressive language that can be transpiled to BF.
- Create a BF compiler/transpiler with high-level optimizations.