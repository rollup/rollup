const assert = require('assert');
let metaId;

module.exports = {
	description: 'allows adding additional entry points',
	options: {
		input: 'main',
		plugins: {
			buildStart() {
				metaId = this.addEntry('buildStart');
			},
			load(id) {
				switch (id) {
					case 'virtual': {
						return `import value from './dep.js';
console.log('virtual', value);
new Worker(import.meta.ROLLUP_CHUNK_URL_${this.addEntry('load')});`;
					}
					case 'load':
						return `import value from './dep.js';console.log('load', value);`;
					default:
						return null;
				}
			},
			renderChunk() {
				assert.strictEqual(this.getChunkFileName(metaId), 'buildStart.js');
			},
			resolveId(id) {
				if (['virtual', 'load'].indexOf(id) >= 0) {
					return id;
				}
				return null;
			}
		}
	}
};
