# Rollup

<p align="center">
  <a href="https://travis-ci.org/rollup/rollup">
    <img src="https://api.travis-ci.org/rollup/rollup.svg?branch=master"
         alt="build status">
  </a>
  <a href="https://www.npmjs.com/package/rollup">
    <img src="https://img.shields.io/npm/v/rollup.svg"
         alt="npm version">
  </a>
  <a href="https://github.com/rollup/rollup/blob/master/LICENSE.md">
    <img src="https://img.shields.io/npm/l/rollup.svg"
         alt="license">
  </a>
  <a href="https://david-dm.org/rollup/rollup">
    <img src="https://david-dm.org/rollup/rollup/status.svg"
         alt="dependency status">
  </a>
  <a href="https://codecov.io/github/rollup/rollup?branch=master">
    <img src="https://codecov.io/gh/rollup/rollup/branch/master/graph/badge.svg" alt="Coverage via Codecov" />
  </a>
  <a href='https://gitter.im/rollup/rollup?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge'>
    <img src='https://badges.gitter.im/rollup/rollup.svg'
         alt='Join the chat at https://gitter.im/rollup/rollup'>
  </a>
</p>

## Overview

Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application. It uses the new standardized format for code modules included in the ES6 revision of JavaScript, instead of previous idiosyncratic solutions such as CommonJS and AMD. ES6 modules let you freely and seamlessly combine the most useful individual functions from your favorite libraries. This will eventually be possible natively, but Rollup lets you do it today.

## Quick Start Guide

Install with `npm install --global rollup`. Rollup can be used either through a [command line interface](https://rollupjs.org/#command-line-reference) with an optional configuration file, or else through its [JavaScript API](https://rollupjs.org/#javascript-api). Run `rollup --help` to see the available options and parameters. The starter project templates, [rollup-starter-lib](https://github.com/rollup/rollup-starter-lib) and [rollup-starter-app](https://github.com/rollup/rollup-starter-app), demonstrate common configuration options, and more detailed instructions are available throughout the [user guide](http://rollupjs.org/).

### Commands

These commands assume the entry point to your application is named main.js, and that you'd like all imports compiled into a single file named bundle.js.

For browsers:

```bash
# compile to a <script> containing a self-executing function
$ rollup main.js --output.format iife --output.file bundle.js
```

For Node.js:

```bash
# compile to a CommonJS module
$ rollup main.js --output.format cjs --output.file bundle.js
```

For both browsers and Node.js:

```bash
# UMD format requires a bundle name
$ rollup main.js --output.format umd --name "myBundle" --output.file bundle.js
```

## Why

Developing software is usually easier if you break your project into smaller separate pieces, since that often removes unexpected interactions and dramatically reduces the complexity of the problems you'll need to solve, and simply writing smaller projects in the first place [isn't necessarily the answer](https://medium.com/@Rich_Harris/small-modules-it-s-not-quite-that-simple-3ca532d65de4). Unfortunately, JavaScript has not historically included this capability as a core feature in the language.

This finally changed with the ES6 revision of JavaScript, which includes a syntax for importing and exporting functions and data so they can be shared between separate scripts. The specification is now fixed, but it is not yet implemented in browsers or Node.js. Rollup allows you to write your code using the new module system, and will then compile it back down to existing supported formats such as CommonJS modules, AMD modules, and IIFE-style scripts. This means that you get to *write future-proof code*, and you also get the tremendous benefits of...

## Tree Shaking

In addition to enabling the use of ES6 modules, Rollup also statically analyzes the code you are importing, and will exclude anything that isn't actually used. This allows you to build on top of existing tools and modules without adding extra dependencies or bloating the size of your project.

For example, with CommonJS, the *entire tool or library must be imported*.

```js
// import the entire utils object with CommonJS
var utils = require( 'utils' );
var query = 'Rollup';
// use the ajax method of the utils object
utils.ajax( 'https://api.example.com?search=' + query ).then( handleResponse );
```

But with ES6 modules, instead of importing the whole `utils` object, we can just import the one `ajax` function we need:

```js
// import the ajax function with an ES6 import statement
import { ajax } from 'utils';
var query = 'Rollup';
// call the ajax function
ajax( 'https://api.example.com?search=' + query ).then( handleResponse );
```

Because Rollup includes the bare minimum, it results in lighter, faster, and less complicated libraries and applications. Since this approach is based on explicit `import` and `export` statements, it is vastly more effective than simply running an automated minifier to detect unused variables in the compiled output code.

## Compatibility

### Importing CommonJS

Rollup can import existing CommonJS modules [through a plugin](https://github.com/rollup/rollup-plugin-commonjs).

### Publishing ES6 Modules

To make sure your ES6 modules are immediately usable by tools that work with CommonJS such as Node.js and webpack, you can use Rollup to compile to UMD or CommonJS format, and then point to that compiled version with the `main` property in your `package.json` file. If your `package.json` file also has a `module` field, ES6-aware tools like Rollup and [webpack 2](https://webpack.js.org/) will [import the ES6 module version](https://github.com/rollup/rollup/wiki/pkg.module) directly.

## Links

- step-by-step [tutorial video series](https://code.lengstorf.com/learn-rollup-js/), with accompanying written walkthrough
- miscellaneous issues in the [wiki](https://github.com/rollup/rollup/wiki)

## License

[MIT](https://github.com/rollup/rollup/blob/master/LICENSE.md)
