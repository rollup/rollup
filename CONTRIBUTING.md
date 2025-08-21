# Contribute

## Introduction

First, thank you for considering contributing to rollup! It's people like you that make the open source community such a great community! 😊

We welcome any type of contribution, not only code. You can help with

- **QA**: file bug reports, the more details you can give the better (i.e. [REPL](https://rollupjs.org/repl/)-links or repos that demonstrate the specific issue)
- **Marketing**: writing blog posts, howto's, printing stickers, ...
- **Community**: presenting the project at meetups, organizing a dedicated meetup for the local community, ...
- **Code**: take a look at the [open issues](https://github.com/rollup/rollup/issues). Even if you can't write code, commenting on them, showing that you care about a given issue matters. It helps us triage them.
- **Money**: we welcome financial contributions in full transparency on our [open collective](https://opencollective.com/rollup).

## Your First Contribution

Working on your first Pull Request? You can learn how from this _free_ course, [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

### Setting up the Rust toolchain

Rollup now includes some Rust code. To compile it, you need to set up the Rust toolchain. If you haven't installed it yet, please see https://www.rust-lang.org/tools/install to learn how to download Rustup and install Rust.

Make sure you use the same toolchain version as specified in the `/rust/rust-toolchain.toml` file. For example, if the file contains the following:

```toml
[toolchain]
profile = "default"
channel = "nightly-2025-07-25"
```

You should be able to install it with the following commands:

```shell
rustup toolchain install nightly-2025-07-25
rustup default nightly-2025-07-25
```

You should also install the `wasm32-unknown-unknown` target:

```shell
rustup target add wasm32-unknown-unknown
```

In the end, run

```shell
rustup update
```

If everything is set up correctly, `npm run build` should complete successfully. The first build will be rather slow, but subsequent builds will be much faster.

For local development and tests, it is even faster to run `npm run build:quick`, which does not perform a Rust production build, does not build WASM artefacts, and only builds the CommonJS version of Rollup. Note that with this build, a few tests will fail that rely on the other artefacts, see below.

### Git configuration to enable symlinks

The unit tests in this projects make use of symlinks in the git project. On Windows, this may not work as expected without extra configuration. To configure git to create symlinks on windows, you need to enable the Windows "Developer Mode" setting, and also set the `core.symlinks` git feature using either of the following commands:

```bash
# Global setting
git config --global core.symlinks true

# Local setting
git config core.symlinks true
```

After applying this setting, you may need to reset your local branch to ensure the files get rewritten as symlinks. Note that this step is destructive and you will want to push any changes you have made prior to resetting your branch.

```bash
git reset --hard
```

### Installing dependencies

Running `npm install` will install the necessary dependencies. If it fails, it might be because the Rust toolchain is not yet set up for WebAssembly, see above.

### How to run one test on your local machine

With `npm run test` you can run all tests together.

To save time for quick iterations, you can add `solo:true` to the `_config.js` file of any given test to run just this one test. To further speed up rebuilds, note that most tests just need the CommonJS build of Rollup.

For those tests, it is enough to run

```shell
npm run build:quick
npm run test:quick

```

Note that this does not run the browser tests and a few CLI tests will fail.

### How to write tests

For any new feature or bug fix, sufficient test coverage is crucial.

Note that Rollup does not really have unit tests, only the external APIs are tested with the full Rollup build. While this may seem unusual, the tests are still very stable and fast. This provides us with the ability to perform major refactorings of the code base while ensuring full compatibility with the previous versions.

There are different test categories. Most of these tests are directory-based where you have a directory with a `_config.js` file that contains the test description and configuration and several code files. See [/test/types.d.ts](./test/types.d.ts) for a full list of available test configuration options for all directory based test types. By default, unless specified otherwise, the `main.js` file is the entry point for the test. To run the tests in an IDE, configure a ["Mocha" compatible test runner](https://mochajs.org/#editor-plugins) that uses `test/test.js` as the entry point.

- **[`test/function`](./test/function/samples)**: These tests bundle to CommonJS and then run the entry point provided by `main.js`. The `assert` function from `node:assert` is injected as a global variable, so you can make inline assertions in the code. You can also use the `exports` configuration key to make assertions on the exported values. These are very stable and meaningful tests and should be your first choice for new tests.
  - For regression testing when Rollup produces invalid code or crashes
  - For testing plugin interactions. To do so, import `node:assert` in your `_config.js` file and make assertions in your plugin hooks as needed.
  - For testing expected bundling errors, warnings and logs (use the `error`, `generateError`, `warnings` and `logs` configuration keys)
  - For asserting on the generated bundle object (use the `bundle` configuration key)
- **[`test/form`](./test/form/samples)**: These tests bundle to all output formats and do not run the code. They compare the bundled code against an `_expected` directory that contains the output for all formats. If the format is not important, you can specify an `_expected.js` file instead, which will be compared against the output when bundling to ES module format.
  - For testing tree-shaking
  - For testing code that does not run on all supported NodeJS platforms
- **[`test/chunking-form`](./test/chunking-form/samples)**: Similar to the `form` tests, these tests support multiple output files and assets. Instead of a single file, there is a directory for each output format.
- **[`test/cli`](./test/cli/samples)**: These tests run the Rollup CLI with a given configuration. They can compare the generated files against provided files and make assertions on stderr output. They can also optionally run the generated files.
- **[`test/watch`](./test/watch)**: Test that watch mode works as expected. These tests are actually in the `index.js` file and only use the `samples` directory for input files.
- **[`test/browser`](./test/browser/samples)**: These tests bundle with the browser build of Rollup. They compare the output to an `_expected` directory and allow to make assertions on bundling errors. Note that you need to provide all input files via plugins.
- **[`test/sourcemaps`](./test/sourcemaps/samples)**: Tests to make assertions on the generated sourcemaps.
- **[`test/incremental`](./test/incremental)**: For testing the caching behaviour of Rollup. As these tests need to run Rollup more than once, it was not easily possible to implement them as directory-based tests.
- **[`test/file-hashes`](./test/file-hashes/samples)**: Relevant for testing that different outputs have different file hashes. With the new hashing algorithm, these tests are not as important as they used to be and are kept mostly for historical reasons.
- **[`test/hooks`](./test/hooks)**: Do not add new tests here. These tests were the original tests for the plugin interface. For new tests, `function` tests are preferred as they are much easier to maintain.
- **[`test/misc`](./test/misc)**: General tests that do not fit into the other categories.

### Developing with the website

Running

```shell
npm run dev
```

will start the website locally in development mode via Vite. This will give you a live preview of the documentation. It will also verify that the documentation does not contain any dead links.

A special feature of the website is that the REPL at `http://localhost:5173/repl/` is directly using the browser build of your local copy of Rollup created via Vite. It even supports full hot module replacement, which means that when you change anything within Rollup, the REPL will automatically rebundle the current code using your latest changes. This can come in very handy when working on a bug or tree-shaking improvement to allow extremely fast iterations.

## Navigating the codebase

See the [architecure documentation](ARCHITECTURE.md) for an overview of the codebase and a high-level explanation of how Rollup works.

## Submitting code

Any code change should be submitted as a pull request. The description should explain what the code does and give steps to execute it. The pull request should also contain tests.

## Code review process

The bigger the pull request, the longer it will take to review and merge. Try to break down large pull requests in smaller chunks that are easier to review and merge.

It is also always helpful to have some context for your pull request. What was the purpose? Why does it matter to you? Does it resolve any known Github issues? Adding a line "resolves #<issue number>" (e.g. "resolves #23") to the description of your pull request or of a specific commit will automatically close this issue once the pull request is merged.

## Financial contributions

We also welcome financial contributions in full transparency on our [open collective](https://opencollective.com/rollup). Anyone can file an expense. If the expense makes sense for the development of the community, it will be "merged" in the ledger of our open collective by the core contributors and the person who filed the expense will be reimbursed.

## Questions

If you require technical assistance, [Stackoverflow](https://stackoverflow.com/questions/tagged/rollupjs) or [Discord](https://is.gd/rollup_chat) are usually the best places to start. You can also create an [issue](issue) ( protip: do a quick search first to see if someone else didn't ask the same question before!).

## Credits

### Contributors

Thank you to all the people who have already contributed to rollup! <a href="https://github.com/rollup/rollup/graphs/contributors"><img src="https://opencollective.com/rollup/contributors.svg?width=890" /></a>

### Backers

Thank you to all our backers! [[Become a backer](https://opencollective.com/rollup#backer)]

<a href="https://opencollective.com/rollup#backers" target="_blank"><img src="https://opencollective.com/rollup/backers.svg?width=890"></a>

### Sponsors

Thank you to all our sponsors! (please ask your company to also support this open source project by [becoming a sponsor](https://opencollective.com/rollup#sponsor))

<a href="https://opencollective.com/rollup/sponsor/0/website" target="_blank"><img src="https://opencollective.com/rollup/sponsor/0/avatar.svg"></a> <a href="https://opencollective.com/rollup/sponsor/1/website" target="_blank"><img src="https://opencollective.com/rollup/sponsor/1/avatar.svg"></a> <a href="https://opencollective.com/rollup/sponsor/2/website" target="_blank"><img src="https://opencollective.com/rollup/sponsor/2/avatar.svg"></a> <a href="https://opencollective.com/rollup/sponsor/3/website" target="_blank"><img src="https://opencollective.com/rollup/sponsor/3/avatar.svg"></a> <a href="https://opencollective.com/rollup/sponsor/4/website" target="_blank"><img src="https://opencollective.com/rollup/sponsor/4/avatar.svg"></a> <a href="https://opencollective.com/rollup/sponsor/5/website" target="_blank"><img src="https://opencollective.com/rollup/sponsor/5/avatar.svg"></a> <a href="https://opencollective.com/rollup/sponsor/6/website" target="_blank"><img src="https://opencollective.com/rollup/sponsor/6/avatar.svg"></a> <a href="https://opencollective.com/rollup/sponsor/7/website" target="_blank"><img src="https://opencollective.com/rollup/sponsor/7/avatar.svg"></a> <a href="https://opencollective.com/rollup/sponsor/8/website" target="_blank"><img src="https://opencollective.com/rollup/sponsor/8/avatar.svg"></a> <a href="https://opencollective.com/rollup/sponsor/9/website" target="_blank"><img src="https://opencollective.com/rollup/sponsor/9/avatar.svg"></a>

<!-- This `CONTRIBUTING.md` is based on @nayafia's template https://github.com/nayafia/contributing-template -->
