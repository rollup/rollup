# Rust standard library

The standard library is linked into every native and WebAssembly artifact but is not a crate in the dependency graph. It is therefore attributed approximately: the texts from https://github.com/rust-lang/rust (`LICENSE-MIT`, `LICENSE-APACHE`) are printed as `rust-std`. The standard library's own dependencies (e.g. `hashbrown`, `gimli`) and `compiler_builtins` carry their own copyright holders and are not covered by this entry.
