import * as foo from './foo.js';

try {
	foo();
} catch {}

try {
	foo``;
} catch {}
