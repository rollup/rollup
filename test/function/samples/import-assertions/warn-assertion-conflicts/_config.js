const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'warns for conflicting import attributes',
	options: {
		external: id => id.startsWith('external')
	},
	warnings: [
		{
			code: 'INCONSISTENT_IMPORT_ATTRIBUTES',
			frame: `
1: import './other.js';
2: import 'external' with { type: 'foo' };
3: import 'external' with { type: 'bar' };
   ^
4: import 'external';
5: import('external', { with: { type: 'baz' } });`,
			id: ID_MAIN,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 3
			},
			message:
				'Module "main.js" tried to import "external" with "type": "bar" attributes, but it was already imported elsewhere with "type": "foo" attributes. Please ensure that import attributes for the same module are always consistent.',
			pos: 61
		},
		{
			code: 'INCONSISTENT_IMPORT_ATTRIBUTES',
			frame: `
2: import 'external' with { type: 'foo' };
3: import 'external' with { type: 'bar' };
4: import 'external';
   ^
5: import('external', { with: { type: 'baz' } });
6: import './dep.js' with { type: 'foo' };`,
			id: ID_MAIN,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 4
			},
			message:
				'Module "main.js" tried to import "external" with no attributes, but it was already imported elsewhere with "type": "foo" attributes. Please ensure that import attributes for the same module are always consistent.',
			pos: 101
		},
		{
			code: 'INCONSISTENT_IMPORT_ATTRIBUTES',
			message:
				'Module "main.js" tried to import "external" with "type": "baz" attributes, but it was already imported elsewhere with "type": "foo" attributes. Please ensure that import attributes for the same module are always consistent.'
		},
		{
			code: 'INCONSISTENT_IMPORT_ATTRIBUTES',
			message:
				'Module "other.js" tried to import "external" with "type": "quuz" attributes, but it was already imported elsewhere with "type": "foo" attributes. Please ensure that import attributes for the same module are always consistent.'
		},
		{
			code: 'INCONSISTENT_IMPORT_ATTRIBUTES',
			message:
				'Module "other.js" tried to import "dep.js" with "type": "bar" attributes, but it was already imported elsewhere with "type": "foo" attributes. Please ensure that import attributes for the same module are always consistent.'
		}
	]
});
