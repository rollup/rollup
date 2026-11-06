const assert = require('node:assert/strict');
const path = require('node:path');

module.exports = defineTest({
	description:
		'does not treat a dependency as loaded when an implicit entry is reached from a second entry',
	options: {
		input: ['main.js', 'preview.js'],
		plugins: [
			{
				name: 'emit-offline-entry',
				buildStart() {
					this.emitFile({
						type: 'chunk',
						id: path.join(__dirname, 'offline.js'),
						implicitlyLoadedAfterOneOf: [path.join(__dirname, 'base.js')]
					});
				},
				generateBundle(_options, bundle) {
					const chunks = Object.values(bundle);
					const findChunk = name =>
						chunks.find(
							chunk =>
								chunk.type === 'chunk' && chunk.moduleIds.some(id => path.basename(id) === name)
						);
					const offline = findChunk('offline.js');
					const shared = findChunk('shared.js');
					assert.ok(offline);
					assert.ok(shared);
					assert.ok(
						!shared.moduleIds.some(id => path.basename(id) === 'main.js'),
						'the shared dependency must not be merged into the primary entry chunk'
					);
					assert.ok(
						offline.imports.includes(shared.fileName),
						'the implicit entry must import the shared dependency'
					);
				}
			}
		]
	}
});
