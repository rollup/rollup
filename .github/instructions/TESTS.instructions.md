---
applyTo: 'test/**'
description: 'How to write and run tests for this project'
---

# Test types

- directory based tests
  - should be preferred for tests if possible
  - reside in directories in test/<category>/samples
  - each test has a \_config.js file with a description field and potentially other configuration options
  - the preferred way to work on a single or few of those tests is to add "solo: true" to the test's \_config.js file first, and then run
    ```
    npm run build:quick
    npm run test:quick
    ```
  - each test category is run by a test/<category>/index.js file
  - the available options for each test category are defined in test/types.d.ts
  - see below for the different categories
- traditional file based tests
  - are run directly by mocha using "describe" and "it" blocks
  - can be found in test/misc/, test/hooks and test/incremental

# Test categories

- function
  - will bundle a main.js file next to the \_config.js file and then run it
  - have node:assert injected as a global variable in the bundled test code (main.js), allowing you to use `assert` directly without importing
  - in \_config.js, you must explicitly require assert: `const assert = require('node:assert/strict');` to use it in the `exports` function or other config functions
  - when testing if bundled code still works (use inline assert in the code or the exports field in \_config.js to make assertions)
  - when testing build errors
  - when testing warnings
  - when testing plugin hooks
- form
  - will bundle a main.js file next to the \_config.js file and store the output either as an \_actual directory with outputs for each format (es.js, cjs.js, amd.js, system.js, umd.js, iife.js) or an \_actual.js file for a single format. Those will be compared with an existing \_expected directory or \_expected.js file
  - the single \_actual.js file will be generated if an \_expected.js file is present. Having a single file is preferred, so when writing a form test, start with writing the \_expected.js file before running the test for the first time
- chunking-form
  - similar to form, but they always generate all formats and produce a separate directory for each format. The entire directory is compared with an \_expected directory
  - when multiple files are expected in the output
- cli
  - when running rollup as a command line tool
