const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'warns for dynamic import attributes that cannot be resolved',
	verifyAst: false,
	options: {
		external: id => id.startsWith('external')
	},
	warnings: [
		{
			code: 'INVALID_IMPORT_ATTRIBUTE',
			message:
				'main.js (1:0): Rollup could not statically analyze an import attribute of a dynamic import in "main.js". Import attributes need to have string keys and values. The attribute will be removed.',
			id: ID_MAIN,
			pos: 0,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 1
			},
			frame: `
			1: import('external1', undefined);
			   ^
			2: import('external2', global);
			3: import('external3', { with: 'invalid' });`
		},
		{
			code: 'INVALID_IMPORT_ATTRIBUTE',
			message:
				'main.js (2:0): Rollup could not statically analyze an import attribute of a dynamic import in "main.js". Import attributes need to have string keys and values. The attribute will be removed.',
			id: ID_MAIN,
			pos: 32,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 2
			},
			frame: `
				1: import('external1', undefined);
				2: import('external2', global);
				   ^
				3: import('external3', { with: 'invalid' });
				4: import('external4', { with: { foo } });`
		},
		{
			code: 'INVALID_IMPORT_ATTRIBUTE',
			message:
				'main.js (4:30): Rollup could not statically analyze an import attribute of a dynamic import in "main.js". Import attributes need to have string keys and values. The attribute will be removed.',
			id: ID_MAIN,
			pos: 133,
			loc: {
				column: 30,
				file: ID_MAIN,
				line: 4
			},
			frame: `
				2: import('external2', global);
				3: import('external3', { with: 'invalid' });
				4: import('external4', { with: { foo } });
				                                 ^
				5: import('external5', { with: { foo: bar } });
				6: import('external6', { with: { foo() {} } });`
		},
		{
			code: 'INVALID_IMPORT_ATTRIBUTE',
			message:
				'main.js (5:30): Rollup could not statically analyze an import attribute of a dynamic import in "main.js". Import attributes need to have string keys and values. The attribute will be removed.',
			id: ID_MAIN,
			pos: 173,
			loc: {
				column: 30,
				file: ID_MAIN,
				line: 5
			},
			frame: `
				3: import('external3', { with: 'invalid' });
				4: import('external4', { with: { foo } });
				5: import('external5', { with: { foo: bar } });
				                                 ^
				6: import('external6', { with: { foo() {} } });
				7: import('external7', { with: { [invalid]: 'foo' } });`
		},
		{
			code: 'INVALID_IMPORT_ATTRIBUTE',
			message:
				'main.js (6:30): Rollup could not statically analyze an import attribute of a dynamic import in "main.js". Import attributes need to have string keys and values. The attribute will be removed.',
			id: ID_MAIN,
			pos: 218,
			loc: {
				column: 30,
				file: ID_MAIN,
				line: 6
			},
			frame: `
				4: import('external4', { with: { foo } });
				5: import('external5', { with: { foo: bar } });
				6: import('external6', { with: { foo() {} } });
				                                 ^
				7: import('external7', { with: { [invalid]: 'foo' } });
				8: import('external8', { with: { foo: 'valid' } });`
		},
		{
			code: 'INVALID_IMPORT_ATTRIBUTE',
			message:
				'main.js (7:30): Rollup could not statically analyze an import attribute of a dynamic import in "main.js". Import attributes need to have string keys and values. The attribute will be removed.',
			id: ID_MAIN,
			pos: 263,
			loc: {
				column: 30,
				file: ID_MAIN,
				line: 7
			},
			frame: `
				5: import('external5', { with: { foo: bar } });
				6: import('external6', { with: { foo() {} } });
				7: import('external7', { with: { [invalid]: 'foo' } });
				                                 ^
				8: import('external8', { with: { foo: 'valid' } });`
		},
		{
			code: 'INVALID_IMPORT_ATTRIBUTE',
			message:
				'main.js (3:0): Rollup could not statically analyze the options argument of a dynamic import in "main.js". Dynamic import options need to be an object with a nested attributes object.',
			id: ID_MAIN,
			pos: 61,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 3
			},
			frame: `
				1: import('external1', undefined);
				2: import('external2', global);
				3: import('external3', { with: 'invalid' });
				   ^
				4: import('external4', { with: { foo } });
				5: import('external5', { with: { foo: bar } });`
		}
	]
});
