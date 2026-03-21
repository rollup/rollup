const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description:
		'records namespace reexport side effects for every importer when export * resolution is cached (#6274)',
	verifyAst: false,
	options: {
		input: {
			main: path.join(__dirname, 'main.js'),
			entry1: path.join(__dirname, 'entry1.js'),
			entry2: path.join(__dirname, 'entry2.js')
		},
		treeshake: {
			moduleSideEffects(id) {
				if (id.endsWith('barrel.js')) return false;
				if (id.endsWith('foo/index.js')) return true;
				return false;
			}
		}
	},
	code(codeMap) {
		const marker = 'SIDE_EFFECT_MARKER';
		const entryChunkNames = Object.keys(codeMap).filter(
			name => name.startsWith('entry1') || name.startsWith('entry2')
		);
		assert.ok(entryChunkNames.length >= 2, 'expected entry1 and entry2 chunks');
		for (const name of entryChunkNames) {
			assert.ok(
				!codeMap[name].includes(marker),
				`expected ${name} not to inline the side-effect from the namespace target; it should live in a shared chunk once per importer is tracked (#6274)`
			);
		}
		assert.ok(
			Object.values(codeMap).some(code => code.includes(marker)),
			'expected the side-effect from lib/foo/index.js to be included in the bundle'
		);
	},
	warnings: [
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main".',
			names: ['main']
		}
	]
});
