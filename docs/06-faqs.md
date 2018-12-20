---
title: Frequently Asked Questions
---

#### Why are ES modules better than CommonJS Modules?

ES modules are an official standard and the clear path forward for JavaScript code structure, whereas CommonJS modules are an idiosyncratic legacy format that served as a stopgap solution before ES modules had been proposed. ES modules allow static analysis that helps with optimizations like tree-shaking, and provide advanced features like circular references and live bindings.

#### What Is "tree-shaking?"

Tree-shaking, also known as "live code inclusion," is the process of eliminating code that is not actually used in a given project. It is [similar to dead code elimination](https://medium.com/@Rich_Harris/tree-shaking-versus-dead-code-elimination-d3765df85c80#.jnypozs9n) but can be much more efficient.

#### How do I use Rollup in Node.js with CommonJS modules?

Rollup strives to implement the specification for ES modules, not necessarily the behaviors of Node.js, NPM, `require()`, and CommonJS. Consequently, loading of CommonJS modules and use of Node's module location resolution logic are both implemented as optional plugins, not included by default in the Rollup core. Just `npm install` the [CommonJS](https://github.com/rollup/rollup-plugin-commonjs) and [node-resolve](https://github.com/rollup/rollup-plugin-node-resolve) plugins and then enable them using a `rollup.config.js` file and you should be all set. If the modules import JSON files, you will also need the [json](https://github.com/rollup/rollup-plugin-json) plugin.

#### Why isn't node-resolve a built-in feature?

There are two primary reasons:

1. Philosophically, it's because Rollup is essentially a [polyfill](https://en.wikipedia.org/wiki/Polyfill_(programming)) of sorts for native module loaders in both Node and browsers. In a browser, `import foo from 'foo'` won't work, because browsers don't use Node's resolution algorithm.

2. On a practical level, it's just much easier to develop software if these concerns are neatly separated with a good API. Rollup's core is quite large, and everything that stops it getting larger is a good thing. Meanwhile, it's easier to fix bugs and add features. By keeping Rollup lean, the potential for technical debt is small.

Please see [this issue](https://github.com/rollup/rollup/issues/1555#issuecomment-322862209) for a more verbose explanation.

#### Is Rollup meant for building libraries or applications?

Rollup is already used by many major JavaScript libraries, and can also be used to build the vast majority of applications. However if you want to use code-splitting or dynamic imports with older browsers, you will need an additional runtime to handle loading missing chunks. We recommend using the [SystemJS Production Build](https://github.com/systemjs/systemjs#browser-production) as it integrates nicely with Rollup's system format output and is capable of properly handling all the ES module live bindings and re-export edge cases. Alternatively, an AMD loader can be used as well.

#### Who made the Rollup logo? It's lovely.

[Julian Lloyd](https://twitter.com/jlmakes)!
