import * as ns from './foo.js';

assert.deepStrictEqual(Object.getOwnPropertyNames(ns), [
	'$',
	'$$$',
	'A',
	'AA',
	'Z',
	'ZZZ',
	'___',
	'aa',
	'default',
	'foo',
	'namespace',
	'z',
	'ö',
	'ø',
	'ς'
]);
