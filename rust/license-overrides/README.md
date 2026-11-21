# License overrides

Some crates declare a license but do not ship its text in the published crate archive. The upstream text is committed here so that `npm run build:rust-licenses` never needs network access for license texts:

| Crate | License | Source |
| --- | --- | --- |
| `base-encode` | MIT | https://github.com/janispritzkau/rust-base-encode/blob/master/LICENSE |
| `base64-simd` | MIT | https://github.com/Nugine/simd/blob/main/LICENSE |
| `napi` | MIT | https://github.com/napi-rs/napi-rs/blob/main/LICENSE |
| `napi-sys` | MIT | https://github.com/napi-rs/napi-rs/blob/main/LICENSE |
| `swc_sourcemap` | BSD-3-Clause | https://github.com/getsentry/rust-sourcemap/blob/master/LICENSE |
| `vsimd` | MIT | https://github.com/Nugine/simd/blob/main/LICENSE |

`swc_sourcemap` is derived from `rust-sourcemap`, which is where its license text comes from.
