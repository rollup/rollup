const assert = require('assert');
const { replaceDirInStringifiedObject } = require('../../../utils');

module.exports = {
	description:
		'transforms chunks in the renderChunk hook, also transforming hashes added in the hook',
	options: {
		input: ['main1', 'main2'],
		plugins: {
			transform(code) {
				const referenceId = this.emitFile({ type: 'asset', name: 'test', source: 'test' });
				return `${code}\nconsole.log('referenced asset', import.meta.ROLLUP_FILE_URL_${referenceId});`;
			},
			renderChunk(code, chunk, options, { chunks }) {
				// Ensure the entries in "chunks" reference the actual chunk objects
				assert.strictEqual(chunks[chunk.fileName], chunk);
				return (
					code +
					`\nconsole.log(${replaceDirInStringifiedObject(chunk, __dirname)});` +
					`\nconsole.log('all chunks', ${JSON.stringify(Object.keys(chunks))})` +
					`\nconsole.log('referenced asset in renderChunk', '${this.getFileName(
						this.emitFile({ type: 'asset', name: 'test', source: 'test' })
					)}');`
				);
			}
		},
		output: {
			entryFileNames: 'entry-[name]-[hash].js',
			chunkFileNames: 'chunk-[name]-[hash].js',
			assetFileNames: 'asset-[name]-[hash][extname]'
		}
	}
};
