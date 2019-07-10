const assert = require('assert');

module.exports = {
	description: 'transforms chunks in the renderChunk hook',
	options: {
		input: ['main1', 'main2'],
		plugins: {
			renderChunk(code, chunk, options) {
				assert.strictEqual(options.chunkFileNames, 'chunk-[name].js');
				return (
					code +
					`\nconsole.log('fileName', '${chunk.fileName}');` +
					`\nconsole.log('imports', '${chunk.imports.join(', ')}');` +
					`\nconsole.log('isEntry', ${chunk.isEntry});` +
					`\nconsole.log('name', '${chunk.name}');` +
					`\nconsole.log('modules.length', ${Object.keys(chunk.modules).length});`
				);
			}
		},
		output: {
			chunkFileNames: 'chunk-[name].js'
		}
	}
};
