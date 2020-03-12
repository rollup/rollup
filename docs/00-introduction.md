---
title: Introduction
---

### Overview

Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application. It uses the new standardized format for code modules included in the ES6 revision of JavaScript, instead of previous idiosyncratic solutions such as CommonJS and AMD. ES modules let you freely and seamlessly combine the most useful individual functions from your favorite libraries. This will eventually be possible natively everywhere, but Rollup lets you do it today.

### Installation

```
npm install --global rollup
```

⚠️ If you are using TypeScript, we recommend you explicitly list the `@types` packages you want to use using the [`types` property in the "tsconfig.json" file](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types), or set it to `[]`. Rollup has a dependency on `@types/node`, which means (without this change) these types will automatically be available in your app even when some of them should not be available based on the `target` you are using.

### Quick start

 Rollup can be used either through a [command line interface](guide/en/#command-line-reference) with an optional configuration file, or else through its [JavaScript API](guide/en/#javascript-api). Run `rollup --help` to see the available options and parameters.

> See [rollup-starter-lib](https://github.com/rollup/rollup-starter-lib) and
[rollup-starter-app](https://github.com/rollup/rollup-starter-app) to see
example library and application projects using Rollup

These commands assume the entry point to your application is named `main.js`, and that you'd like all imports compiled into a single file named `bundle.js`.

For browsers:

```
# compile to a <script> containing a self-executing function ('iife')
rollup main.js --file bundle.js --format iife
```

For Node.js:

```
# compile to a CommonJS module ('cjs')
rollup main.js --file bundle.js --format cjs
```

For both browsers and Node.js:

```
# UMD format requires a bundle name
rollup main.js --file bundle.js --format umd --name "myBundle"
```

### The Why

Developing software is usually easier if you break your project into smaller separate pieces, since that often removes unexpected interactions and dramatically reduces the complexity of the problems you'll need to solve, and simply writing smaller projects in the first place [isn't necessarily the answer](https://medium.com/@Rich_Harris/small-modules-it-s-not-quite-that-simple-3ca532d65de4). Unfortunately, JavaScript has not historically included this capability as a core feature in the language.

This finally changed with the ES6 revision of JavaScript, which includes a syntax for importing and exporting functions and data so they can be shared between separate scripts. The specification is now fixed, but it is only implemented in modern browsers and not finalised in Node.js. Rollup allows you to write your code using the new module system, and will then compile it back down to existing supported formats such as CommonJS modules, AMD modules, and IIFE-style scripts. This means that you get to *write future-proof code*, and you also get the tremendous benefits of…

### Tree-Shaking

In addition to enabling the use of ES modules, Rollup also statically analyzes the code you are importing, and will exclude anything that isn't actually used. This allows you to build on top of existing tools and modules without adding extra dependencies or bloating the size of your project.

For example, with CommonJS, the *entire tool or library must be imported*.

```js
// import the entire utils object with CommonJS
const utils = require( './utils' );
const query = 'Rollup';
// use the ajax method of the utils object
utils.ajax(`https://api.example.com?search=${query}`).then(handleResponse);
```

With ES modules, instead of importing the whole `utils` object, we can just import the one `ajax` function we need:

```js
// import the ajax function with an ES6 import statement
import { ajax } from './utils';
const query = 'Rollup';
// call the ajax function
ajax(`https://api.example.com?search=${query}`).then(handleResponse);
```

Because Rollup includes the bare minimum, it results in lighter, faster, and less complicated libraries and applications. Since this approach can utilise explicit `import` and `export` statements, it is more effective than simply running an automated minifier to detect unused variables in the compiled output code.


### Compatibility

#### Importing CommonJS

Rollup can import existing CommonJS modules [through a plugin](https://github.com/rollup/plugins/tree/master/packages/commonjs).

#### Publishing ES Modules

To make sure your ES modules are immediately usable by tools that work with CommonJS such as Node.js and webpack, you can use Rollup to compile to UMD or CommonJS format, and then point to that compiled version with the `main` property in your `package.json` file. If your `package.json` file also has a `module` field, ES-module-aware tools like Rollup and [webpack 2+](https://webpack.js.org/) will [import the ES module version](https://github.com/rollup/rollup/wiki/pkg.module) directly.
