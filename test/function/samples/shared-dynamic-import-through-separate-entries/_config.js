const assert = require('node:assert/strict');
const path = require('node:path');

module.exports = defineTest({
	description:
		'does not depend on a chunk from a different entry when loading a shared dynamic import',
	options: {
		input: ['main.js', 'preview.js'],
		plugins: [
			{
				name: 'verify-shared-import',
				generateBundle(_options, bundle) {
					const chunks = Object.values(bundle);
					const findChunk = name =>
						chunks.find(
							chunk =>
								chunk.type === 'chunk' && chunk.moduleIds.some(id => path.basename(id) === name)
						);
					const host = findChunk('hostA.js');
					const settings = findChunk('settings.js');
					const shared = findChunk('shared.js');
					assert.ok(host);
					assert.ok(settings);
					assert.ok(shared);
					assert.ok(
						!settings.imports.includes(host.fileName),
						'settings must not import the primary host'
					);
					assert.ok(
						settings.imports.includes(shared.fileName),
						'settings must import the shared dependency'
					);
				}
			}
		]
	},
	context: {
		recordSharedLoad() {}
	}
});
