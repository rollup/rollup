# rollup

*I roll up, I roll up, I roll up, Shawty I roll up*

*I roll up, I roll up, I roll up*

                -- [Wiz Khalifa](https://www.youtube.com/watch?v=UhQz-0QVmQ0)

This is an experimental project. You definitely shouldn't try and use it, yet.


## A next-generation ES6 module bundler

Right now, you have a few different options if you want to create a bundle out of your ES6 modules:

* The best option, in terms of performance, size of the resulting bundle, and accurate representation of ES6 module semantics, is to use [esperanto](esperantojs.org). It's used by [ractive.js](ractivejs.org), [moment.js](http://momentjs.com/), Facebook's [immutable.js](https://github.com/facebook/immutable-js), the jQuery Foundation's [pointer events polyfill](https://github.com/jquery/PEP), [Ember CLI](http://www.ember-cli.com/) and a bunch of other libraries and apps
* You could use [jspm](http://jspm.io/), which combines a module bundler with a loader and a package manager
* Or you could use [browserify](http://browserify.org/) or [webpack](http://webpack.github.io/), transpiling your modules into CommonJS along the way

But there's a flaw in how these systems work. Pretend it's the future, and lodash is available as an ES6 module, and you want to use a single helper function from it:

```js
// app.js
import { pluck } from 'lodash';
```

With that single import statement, you've just caused the whole of [lodash](https://lodash.com/) to be included in your bundle, even though you only need to use a tiny fraction of the code therein.

If you're using esperanto, that's not totally disastrous, because a sufficiently good minifier will be able to determine through [static analysis](http://en.wikipedia.org/wiki/Static_program_analysis) that most of the code will never run, and so remove it. But there are lots of situations where static analysis fails, and unused code will continue to clutter up your bundle.

If you're using any of the other tools, static analysis won't be able to even begin to determine which of lodash's exports aren't used by your app (AFAIK! please correct me if I'm wrong).


### The current solution is not future-proof

I picked lodash because it does offer one solution to this problem: modular builds. Today, in your CommonJS modules, you can do this:

```js
var pluck = require( 'lodash/collection/pluck' );
```

**This is not the answer.** Using a folder structure to define an interface is a bad idea - it makes it harder to guarantee backwards compatibility, it imposes awkward constraints on library authors, and it allows developers to do this sort of thing:

```js
var cheekyHack = require( 'undocumented/private/module' );
```

Sure enough, you [won't be able to do this with ES6 modules](https://github.com/esperantojs/esperanto/issues/68#issuecomment-73302346).


### A better approach?

This project is an attempt to prove a different idea: ES6 modules should define their interface through a single file (which, by convention, is currently exposed as the `jsnext:main` field in your package.json file), like so...

```js
// snippet from future-lodash.js
export { partition } from './src/collection/partition';
export { pluck } from './src/collection/pluck';
export { reduce } from './src/collection/reduce';
/* ...and so on... */
```

...and ES6 *bundlers* should handle importing in a much more granular fashion. Rather than importing an entire module, an intelligent bundler should be able to reason like so:

* I need to import `pluck` from `future-lodash.js`
* According to `future-lodash.js`, the definition of `pluck` can be found in `lodash/src/collection/pluck.js`
* It seems that `pluck` depends on `map` and `property`, which are in... *these* files
* ...
* Right, I've found all the function definitions I need. I can just include those in my bundle and disregard the rest

In other words, the 'tree-shaking' approach of throwing everything in then removing the bits you don't need is all wrong - instead, we should be selective about what we include in the first place.

This is not a trivial task. There are almost certainly a great many complex edge cases. Perhaps it's not possible. But I intend to find out.


## Goals

* Maximally efficient bundling
* Ease of use
* Flexible output - CommonJS, AMD, UMD, globals, ES6, System etc
* Speed
* Character-accurate sourcemaps
* Eventually, port the functionality to esperanto

### Secondary goals

* Support for legacy module formats
* Respect for original formatting and code comments


### API

The example below is aspirational. It isn't yet implemented - it exists in the name of [README driven development](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html).

```js
rollup.rollup( 'app.js', {
  /* options */
}).then( function ( bundle ) {
  // generate code and a sourcemap
  const { code, map } = bundle.generate({
    format: 'amd'
  });

  fs.writeFileSync( 'bundle.js', code + '\n//# sourceMappingURL=bundle.js.map' );
  fs.writeFileSync( 'bundle.js.map', map.toString() );

  // possible convenience method
  bundle.write({
    dest: 'bundle.js', // also writes sourcemap
    format: 'amd'
  });
});
```

The duplication (`rollup.rollup`) is intentional. You have to say it like you're in the circus, otherwise it won't work.


## License

Not that there's any code here at the time of writing, but this project is released under the MIT license.