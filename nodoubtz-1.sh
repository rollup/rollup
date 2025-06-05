{
      "scripts": {
            "build": "concurrently -c green,blue \"npm run build:wasm\" \"npm run build:ast-converters\" && concurrently -c green,blue \"npm run build:napi -- --release\" \"npm run build:js\" && npm run build:copy-native",
                "build:quick": "concurrently -c green,blue \"npm run build:napi\" \"npm run build:cjs\" && npm run build:copy-native",
                    "build:napi": "napi build --platform --dts native.d.ts --js false --cargo-cwd rust -p bindings_napi --cargo-name bindings_napi",
                        "build:wasm": "cross-env RUSTFLAGS=\"-C opt-level=z\" wasm-pack build rust/bindings_wasm --out-dir ../../wasm --target web --no-pack && shx rm wasm/.gitignore",
                            "build:js": "rollup --config rollup.config.ts --configPlugin typescript --forceExit",
                                "build:copy-native": "shx mkdir -p dist && shx cp rollup.*.node dist/",
                                    "test": "npm run build && npm run test:all",
                                        "test:all": "concurrently --kill-others-on-fail -c green,blue,magenta,cyan,red \"npm run test:only\" \"npm run test:browser\" \"npm run test:typescript\" \"npm run test:package\" \"npm run test:options\"",
                                            "test:only": "mocha test/test.js",
                                                "lint": "concurrently -c red,yellow,green,blue \"npm run lint:js\" \"npm run lint:native-js\" \"npm run lint:markdown\" \"npm run lint:rust\"",
                                                    "lint:js": "eslint . --fix --cache",
                                                        "lint:markdown": "prettier --write \"**/*.md\"",
                                                            "lint:rust": "cd rust && cargo fmt && cargo clippy --fix --allow-dirty"
      }
}
      }
}