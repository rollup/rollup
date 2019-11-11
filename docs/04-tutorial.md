---
title: Tutorial
---

### Creating Your First Bundle

*Before we begin, you'll need to have [Node.js](https://nodejs.org) installed so that you can use [NPM](https://npmjs.com). You'll also need to know how to access the [command line](https://www.codecademy.com/learn/learn-the-command-line) on your machine.*

The easiest way to use Rollup is via the Command Line Interface (or CLI). For now, we'll install it globally (later on we'll learn how to install it locally to your project so that your build process is portable, but don't worry about that yet). Type this into the command line:

```console
npm install rollup --global
# or `npm i rollup -g` for short
```

You can now run the `rollup` command. Try it!

```console
rollup
```

Because no arguments were passed, Rollup prints usage instructions. This is the same as running `rollup --help`, or `rollup -h`.

Let's create a simple project:

```console
mkdir -p my-rollup-project/src
cd my-rollup-project
```

First, we need an *entry point*. Paste this into a new file called `src/main.js`:

```js
// src/main.js
import foo from './foo.js';
export default function () {
  console.log(foo);
}
```

Then, let's create the `foo.js` module that our entry point imports:

```js
// src/foo.js
export default 'hello world!';
```

Now we're ready to create a bundle:

```console
rollup src/main.js -f cjs
```

The `-f` option (short for `--format`) specifies what kind of bundle we're creating — in this case, CommonJS (which will run in Node.js). Because we didn't specify an output file, it will be printed straight to `stdout`:

```js
'use strict';

const foo = 'hello world!';

const main = function () {
  console.log(foo);
};

module.exports = main;
```

You can save the bundle as a file like so:

```console
rollup src/main.js -o bundle.js -f cjs
```

(You could also do `rollup src/main.js -f cjs > bundle.js`, but as we'll see later, this is less flexible if you're generating sourcemaps.)

Try running the code:

```console
node
> var myBundle = require('./bundle.js');
> myBundle();
'hello world!'
```

Congratulations! You've created your first bundle with Rollup.

### Using Config Files

So far, so good, but as we start adding more options it becomes a bit of a nuisance to type out the command.

To save repeating ourselves, we can create a config file containing all the options we need. A config file is written in JavaScript and is more flexible than the raw CLI.

Create a file in the project root called `rollup.config.js`, and add the following code:

```js
// rollup.config.js
export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  }
};
```

(Note that you can use CJS modules and therefore `module.exports = {/* config */}`)

To use the config file, we use the `--config` or `-c` flag:

```console
rm bundle.js # so we can check the command works!
rollup -c
```

You can override any of the options in the config file with the equivalent command line options:

```console
rollup -c -o bundle-2.js # `-o` is equivalent to `--file` (formerly "output")
```

_Note: Rollup itself processes the config file, which is why we're able to use `export default` syntax – the code isn't being transpiled with Babel or anything similar, so you can only use ES2015 features that are supported in the version of Node.js that you're running._

You can, if you like, specify a different config file from the default `rollup.config.js`:

```console
rollup --config rollup.config.dev.js
rollup --config rollup.config.prod.js
```

### Installing Rollup locally

When working within teams or distributed environments it can be wise to add Rollup as a _local_ dependency. Installing Rollup locally prevents the requirement that multiple contributors install Rollup separately as an extra step, and ensures that all contributors are using the same version of Rollup.

To install Rollup locally with NPM:

```console
npm install rollup --save-dev
```

Or with Yarn:

```console
yarn -D add rollup
```

After installing, Rollup can be run within the root directory of your project:

```console
npx rollup --config
```

Or with Yarn:

```console
yarn rollup --config
```

Once installed, it's common practice to add a single build script to `package.json`, providing a convenient command for all contributors. e.g.

```json
{
  "scripts": {
    "build": "rollup --config"
  }
}
```

_Note: Once installed locally, both NPM and Yarn will resolve the dependency's bin file and execute Rollup when called from a package script._

### Using plugins

So far, we've created a simple bundle from an entry point and a module imported via a relative path. As you build more complex bundles, you'll often need more flexibility – importing modules installed with NPM, compiling code with Babel, working with JSON files and so on.

For that, we use *plugins*, which change the behaviour of Rollup at key points in the bundling process. A list of awesome plugins is maintained on [the Rollup Awesome List](https://github.com/rollup/awesome).

For this tutorial, we'll use [rollup-plugin-json](https://github.com/rollup/rollup-plugin-json), which allows Rollup to import data from a JSON file.

Create a file in the project root called `package.json`, and add the following content:

```json
{
  "name": "rollup-tutorial",
  "version": "1.0.0",
  "scripts": {
    "build": "rollup -c"
  }
}
```

Install rollup-plugin-json as a development dependency:

```console
npm install --save-dev rollup-plugin-json
```

(We're using `--save-dev` rather than `--save` because our code doesn't actually depend on the plugin when it runs – only when we're building the bundle.)

Update your `src/main.js` file so that it imports from your package.json instead of `src/foo.js`:

```js
// src/main.js
import { version } from '../package.json';

export default function () {
  console.log('version ' + version);
}
```

Edit your `rollup.config.js` file to include the JSON plugin:

```js
// rollup.config.js
import json from 'rollup-plugin-json';

export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [ json() ]
};
```

Run Rollup with `npm run build`. The result should look like this:

```js
'use strict';

var version = "1.0.0";

function main () {
  console.log('version ' + version);
}

module.exports = main;
```

_Note: Only the data we actually need gets imported – `name` and `devDependencies` and other parts of `package.json` are ignored. That's **tree-shaking** in action._

### Using output plugins

Some plugins can also be applied specifically to some outputs. See [plugin hooks](guide/en/#hooks) for the technical details of what output-specific plugins can do. In a nut-shell, those plugins can only modify code after the main analysis of Rollup has completed. Rollup will warn if an incompatible plugin is used as an output-specific plugin. One possible use-case is minification of bundles to be consumed in a browser.

Let us extend the previous example to provide a minified build together with the non-minified one. To that end, we install `rollup-plugin-terser`:

```console
npm install --save-dev rollup-plugin-terser
```

Edit your `rollup.config.js` file to add a second minified output. As format, we choose `iife`. This format wraps the code so that it can be consumed via a `script` tag in the browser while avoiding unwanted interactions with other code. As we have an export, we need to provide the name of a global variable that will be created by our bundle so that other code can access our export via this variable.

```js
// rollup.config.js
import json from 'rollup-plugin-json';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/main.js',
  output: [
    {
      file: 'bundle.js',
      format: 'cjs'
    },
    {
      file: 'bundle.min.js',
      format: 'iife',
      name: 'version',
      plugins: [terser()]
    }
  ],
  plugins: [ json() ]
};
```

Besides `bundle.js`, Rollup will now create a second file `bundle.min.js`:

```js
var version = (function () {
  'use strict';

  var version = "1.0.0";

  function main () {
    console.log('version ' + version);
  }

  return main;

}());
```


### Code Splitting

To use the code splitting feature, we got back to the original example and modify `src/main.js` to load `src/foo.js` dynamically instead of statically:

```js
// src/main.js
export default function () {
  import('./foo.js').then(({ default: foo }) => console.log(foo));
}
```

Rollup will use the dynamic import to create a separate chunk that is only loaded on demand. In order for Rollup to know where to place the second chunk, instead of passing the `--file` option we set a folder to output to with the `--dir` option:

```console
rollup src/main.js -f cjs -d dist
```

This will create a folder `dist` containing two files, `main.js` and `chunk-[hash].js`, where `[hash]` is a content based hash string. You can supply your own naming patterns by specifying the [`output.chunkFileNames`](guide/en/#outputchunkfilenames) and [`output.entryFileNames`](guide/en/#outputentryfilenames) options.

You can still run your code as before with the same output, albeit a little slower as loading and parsing of `./foo.js` will only commence once we call the exported function for the first time.

```console
node -e "require('./dist/main.js')()"
```

If we do not use the `--dir` option, Rollup will again print the chunks to `stdout`, adding comments to highlight the chunk boundaries:

```js
//→ main.js:
'use strict';

function main () {
  Promise.resolve(require('./chunk-b8774ea3.js')).then(({ default: foo }) => console.log(foo));
}

module.exports = main;

//→ chunk-b8774ea3.js:
'use strict';

var foo = 'hello world!';

exports.default = foo;
```

This is useful if you want to load and parse expensive features only once they are used.

A different use for code-splitting is the ability to specify several entry points that share some dependencies. Again we extend our example to add a second entry point `src/main2.js` that statically imports `src/foo.js` just like we did in the original example:

```js
// src/main2.js
import foo from './foo.js';
export default function () {
  console.log(foo);
}
```

If we supply both entry points to rollup, three chunks are created:

```console
rollup src/main.js src/main2.js -f cjs
```

will output

```js
//→ main.js:
'use strict';

function main () {
  Promise.resolve(require('./chunk-b8774ea3.js')).then(({ default: foo }) => console.log(foo));
}

module.exports = main;

//→ main2.js:
'use strict';

var foo_js = require('./chunk-b8774ea3.js');

function main2 () {
  console.log(foo_js.default);
}

module.exports = main2;

//→ chunk-b8774ea3.js:
'use strict';

var foo = 'hello world!';

exports.default = foo;
```

Notice how both entry points import the same shared chunk. Rollup will never duplicate code and instead create additional chunks to only ever load the bare minimum necessary. Again, passing the `--dir` option will write the files to disk.

You can build the same code for the browser via native ES modules, an AMD loader or SystemJS.

For example, with `-f esm` for native modules:

```console
rollup src/main.js src/main2.js -f esm -d dist
```

```html
<!doctype html>
<script type="module">
  import main2 from './dist/main2.js';
  main2();
</script>
```

Or alternatively, for SystemJS with `-f system`:

```console
rollup src/main.js src/main2.js -f system -d dist
```

Install SystemJS via

```console
npm install --save-dev systemjs
```

And then load either or both entry points in an HTML page as needed:

```html
<!doctype html>
<script src="node_modules/systemjs/dist/system-production.js"></script>
<script>
  System.import('./dist/main2.js')
  .then(({ default: main }) => main());
</script>
```

See [rollup-starter-code-splitting](https://github.com/rollup/rollup-starter-code-splitting) for an example on how to set up a web app that uses native ES modules on browsers that support them with a fallback to SystemJS if necessary.
