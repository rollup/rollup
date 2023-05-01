const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'warns for conflicting import assertions',
	options: {
		external: id => id.startsWith('external')
	},
	warnings: [
		{
			code: 'INCONSISTENT_IMPORT_ASSERTIONS',
			frame: `
1: import './other.js';
2: import 'external' assert { type: 'foo' };
3: import 'external' assert { type: 'bar' };
   ^
4: import 'external';
5: import('external', { assert: { type: 'baz' } });`,
			id: ID_MAIN,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 3
			},
			message:
				'Module "main.js" tried to import "external" with "type": "bar" assertions, but it was already imported elsewhere with "type": "foo" assertions. Please ensure that import assertions for the same module are always consistent.',
			pos: 63
		},
		{
			code: 'INCONSISTENT_IMPORT_ASSERTIONS',
			frame: `
2: import 'external' assert { type: 'foo' };
3: import 'external' assert { type: 'bar' };
4: import 'external';
   ^
5: import('external', { assert: { type: 'baz' } });
6: import './dep.js' assert { type: 'foo' };`,
			id: ID_MAIN,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 4
			},
			message:
				'Module "main.js" tried to import "external" with no assertions, but it was already imported elsewhere with "type": "foo" assertions. Please ensure that import assertions for the same module are always consistent.',
			pos: 105
		},
		{
			code: 'INCONSISTENT_IMPORT_ASSERTIONS',
			message:
				'Module "main.js" tried to import "external" with "type": "baz" assertions, but it was already imported elsewhere with "type": "foo" assertions. Please ensure that import assertions for the same module are always consistent.'
		},
		{
			code: 'INCONSISTENT_IMPORT_ASSERTIONS',
			message:
				'Module "other.js" tried to import "external" with "type": "quuz" assertions, but it was already imported elsewhere with "type": "foo" assertions. Please ensure that import assertions for the same module are always consistent.'
		},
		{
			code: 'INCONSISTENT_IMPORT_ASSERTIONS',
			message:
				'Module "other.js" tried to import "dep.js" with "type": "bar" assertions, but it was already imported elsewhere with "type": "foo" assertions. Please ensure that import assertions for the same module are always consistent.'
		}
	]
});
