# Rollup

<p align="center">
  <a href="https://travis-ci.org/rollup/rollup">
    <img src="http://img.shields.io/travis/rollup/rollup.svg"
         alt="build status">
  </a>
  <a href="https://npmjs.org/package/rollup">
    <img src="https://img.shields.io/npm/v/rollup.svg"
         alt="npm version">
  </a>
  <a href="https://github.com/rollup/rollup/blob/master/LICENSE.md">
    <img src="https://img.shields.io/npm/l/rollup.svg"
         alt="license">
  </a>
  <a href="https://david-dm.org/rollup/rollup">
    <img src="https://david-dm.org/rollup/rollup.svg"
         alt="dependency status">
  </a>
  <a href="http://codecov.io/github/rollup/rollup?branch=master">
    <img src="http://codecov.io/github/rollup/rollup/coverage.svg?branch=master" alt="Coverage via Codecov" />
  </a>
</p>

> *I roll up, I roll up, I roll up, Shawty I roll up*
>
> *I roll up, I roll up, I roll up*
> &ndash;[Wiz Khalifa](https://www.youtube.com/watch?v=UhQz-0QVmQ0)


## Quickstart

Rollup can be used via a [JavaScript API](https://github.com/rollup/rollup/wiki/JavaScript-API) or a [Command Line Interface](https://github.com/rollup/rollup/wiki/Command-Line-Interface). Install with `npm install -g rollup` and run `rollup --help` to get started.

[Dive into the wiki](https://github.com/rollup/rollup/wiki) when you're ready to learn more about Rollup and ES6 modules.


## A next-generation ES6 module bundler

When you're developing software, it's much easier to break your library or application apart into separate pieces that you can work on separately. It's also very likely that you'll have dependencies on third party libraries. The result is lots of small files – but that's bad news for browsers, which get slowed down by having to make many requests. (It's also [bad news for Node!](https://kev.inburke.com/kevin/node-require-is-dog-slow/))

The solution is to write your code as **modules**, and use a **module bundler** to concatenate everything into a single file. [Browserify](http://browserify.org/) and [Webpack](http://webpack.github.io/) are examples of module bundlers.

So far, so good, **but there's a problem**. When you include a library in your bundle...

```js
var utils = require( 'utils' );

var query = 'Rollup';
utils.ajax( 'https://api.example.com?search=' + query ).then( handleResponse );
```

...you include the *whole* library, including lots of code you're not actually using.

**ES6 modules solve this problem.** Instead of importing the whole of `utils`, we can just import the `ajax` function we need:

```js
import { ajax } from 'utils';

var query = 'Rollup';
ajax( 'https://api.example.com?search=' + query ).then( handleResponse );
```

Rollup statically analyses your code, and your dependencies, and includes the bare minimum in your bundle.


## Shouldn't we be writing those utilities as small modules anyway?

[Not always, no.](https://medium.com/@Rich_Harris/small-modules-it-s-not-quite-that-simple-3ca532d65de4)


## Don't minifiers already do this?

If you minify code with something like [UglifyJS](https://github.com/mishoo/UglifyJS2) (and you should!) then some unused code will be removed:

```js
(function () {
  function foo () {
    console.log( 'this function was included!' );
  }

  function bar () {
    console.log( 'this function was not' );
    baz();
  }

  function baz () {
    console.log( 'neither was this' );
  }

  foo();
})();
```

A minifier can detect that `foo` gets called, but that `bar` doesn't. When we remove `bar`, it turns out that we can also remove `baz`.

But because of the limitations of static analysis, and the dynamic nature of JavaScript, it can't do the same thing with code like this:

```js
(function () {
  var obj = {
    foo: function () {
      console.log( 'this method was included!' );
    },

    bar: function () {
      console.log( 'so was this :-(' );
      this.baz();
    },

    baz: function () {
      console.log( 'and this :-(' );
    }
  };

  obj.foo();
})();
```

Unfortunately, **traditional modules – CommonJS and AMD – result in code more like the second example than the first, making them next-to-impossible to optimise**. Rather than *excluding dead code*, we should be *including live code*. That's only possible with ES6 modules.


## What's the catch?

Most libraries that you depend on aren't written as ES6 modules, so Rollup can't work with them directly. (You *can* bundle your own app or library code with Rollup as a CommonJS module, then pass the result over to Webpack or Browserify, of course.)

**You can help!** It's possible to write libraries as ES6 modules while still making it easy for other developers to use your code as they already do, using the [jsnext:main](https://github.com/rollup/rollup/wiki/jsnext:main) field in your package.json. You'll be writing your code in a more future-proof way, and helping to bring an end to the [dark days of JavaScript package management](https://medium.com/@trek/last-week-i-had-a-small-meltdown-on-twitter-about-npms-future-plans-around-front-end-packaging-b424dd8d367a).

See [rollup-starter-project](https://github.com/eventualbuddha/rollup-starter-project) for inspiration on how to get started.


## How does this compare to JSPM/SystemJS?

[JSPM](http://jspm.io/) is awesome! It's a little different to this project though – it combines a repository with a package manager and a client-side module loader, as opposed to simply bundling modules. JSPM allows you to use any module format and even develop without a build step, so it's a great choice for creating applications. Rollup generates smaller bundles that don't use the complex SystemJS format, and so is a better choice for creating libraries. A future version of JSPM [may use Rollup internally](https://github.com/systemjs/builder/pull/205), so you'll get the best of both worlds.


## License

Released under the [MIT license](https://github.com/rollup/rollup/blob/master/LICENSE.md).
