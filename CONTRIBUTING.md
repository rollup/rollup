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

Rollup now includes some Rust code. To compile it, you need to set up Rust nightly. If you haven't installed it yet, please first see https://www.rust-lang.org/tools/install to learn how to download Rustup and install Rust, then see https://rust-lang.github.io/rustup/concepts/channels.html to learn how to install Rust nightly. If everything is set up correctly, `npm run build` should complete successfully. The first build will be rather slow, but subsequent builds will be much faster.

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

### How to run one test on your local machine

With `npm run test` you can run all tests together.

To save time for quick iterations, you can add `solo:true` to the `_config.js` file of any given test to run just this one test. To further speed up rebuilds, note that most tests just need the CommonJS build of Rollup.

For those tests, it is enough to run

```shell
npm run build:quick
npm run test:quick

```

Note that this does not run the browser tests and a few CLI tests will fail.

### Developing with the website

Running

```shell
npm run dev
```

will start the website locally in development mode via Vite. This will give you a live preview of the documentation. It will also verify that the documentation does not contain any dead links.

A special feature of the website is that the REPL at `http://localhost:5173/repl/` is directly using the browser build of your local copy of Rollup created via Vite. It even supports full hot module replacement, which means that when you change anything within Rollup, the REPL will automatically rebundle the current code using your latest changes. This can come in very handy when working on a bug or tree-shaking improvement to allow extremely fast iterations.

## Submitting code

Any code change should be submitted as a pull request. The description should explain what the code does and give steps to execute it. The pull request should also contain tests.

## Code review process

The bigger the pull request, the longer it will take to review and merge. Try to break down large pull requests in smaller chunks that are easier to review and merge.

It is also always helpful to have some context for your pull request. What was the purpose? Why does it matter to you? Does it resolve any known Github issues? Adding a line "resolves #<issue number>" (e.g. "resolves #23") to the description of your pull request or of a specific commit will automatically close this issue once the pull request is merged.

## Financial contributions

We also welcome financial contributions in full transparency on our [open collective](https://opencollective.com/rollup). Anyone can file an expense. If the expense makes sense for the development of the community, it will be "merged" in the ledger of our open collective by the core contributors and the person who filed the expense will be reimbursed.

## Questions

If you require technical assistance, [Stackoverflow](https://stackoverflow.com/questions/tagged/rollupjs) or [Discord](https://is.gd/rollup_chat) are usually the best places to start. You can also create an [issue](issue) (protip: do a quick search first to see if someone else didn't ask the same question before!).

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
