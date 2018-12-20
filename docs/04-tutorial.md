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

(Note that you can use CJS modules as well, to wit, `module.exports = {/* config */}`)

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

const version = "1.0.0";

const main = function () {
  console.log('version ' + version);
};

module.exports = main;
```

_Note: Only the data we actually need gets imported – `name` and `devDependencies` and other parts of `package.json` are ignored. That's **tree-shaking** in action!_

### Experimental Code Splitting

To use the new experimental code splitting feature, we add a second *entry point* called `src/main2.js` that itself dynamically loads main.js:

```js
// src/main2.js
export default function () {
  return import('./main.js').then(({ default: main }) => {
    main();
  });
}
```

We can then pass both entry points to the rollup build, and instead of an output file we set a folder to output to with the `--dir` option (also passing the experimental flags):

```console
rollup src/main.js src/main2.js -f cjs --dir dist --experimentalCodeSplitting
```

Either built entry point can then be run in NodeJS without duplicating any code between the modules:

```console
node -e "require('./dist/main2.js')()"
```

You can build the same code for the browser, for native ES modules, an AMD loader or SystemJS.

For example, with `-f esm` for native modules:

```console
rollup src/main.js src/main2.js -f esm --dir dist --experimentalCodeSplitting
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
rollup src/main.js src/main2.js -f system --dir dist --experimentalCodeSplitting
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
