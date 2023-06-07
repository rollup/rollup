const { assertIncludes } = require('../../../utils.js');

module.exports = defineTest({
	description: 'logs side effects',
	command: 'rollup --config',
	env: { FORCE_COLOR: undefined, NO_COLOR: true },
	stderr: stderr =>
		assertIncludes(
			stderr,
			`First side effect in dep-mapped.js is at (2:26)
1: const removed = true;
2: const alsoRemoved = true; console.log('mapped effect');
                             ^
dep-mapped.js (1:0)
1: console.log('mapped effect');
   ^
First side effect in dep-long-line.js is at (1:126)
1: /* This side effect is deeply hidden inside a very long line, beyond the 120-character limit that we impose for truncation */ console.lo...
                                                                                                                                 ^
dep-long-line.js (1:126)
1: /* This side effect is deeply hidden inside a very long line, beyond the 120-character limit that we impose for truncation */ console.lo...
                                                                                                                                 ^
First side effect in main.js is at (3:0)
1: import './dep-mapped';
2: import './dep-long-line';
3: console.log('main effect');
   ^
4: console.log('other effect');
main.js (3:0)
1: import './dep-mapped';
2: import './dep-long-line';
3: console.log('main effect');
   ^
4: console.log('other effect');`
		)
});
