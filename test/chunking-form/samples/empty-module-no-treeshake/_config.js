const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'associates empty modules with chunks if tree-shaking is disabled for them',
	options: {
		input: ['main1.js', 'main2.js'],
		plugins: {
			resolveId(id) {
				if (id.startsWith('empty')) {
					if (id === 'emptyResolved') {
						return {
							id,
							moduleSideEffects: 'no-treeshake'
						};
					}
					return id;
				}
			},
			load(id) {
				if (id.startsWith('empty')) {
					if (id === 'emptyLoaded') {
						return { code: '', moduleSideEffects: 'no-treeshake' };
					}
					return '';
				}
			},
			transform(code, id) {
				if (id === 'emptyTransformed') {
					return { code: '', moduleSideEffects: 'no-treeshake' };
				}
			},
			generateBundle(options, bundle) {
				const result = {};
				for (const chunkId of Object.keys(bundle)) {
					result[chunkId] = Object.keys(bundle[chunkId].modules).map(moduleId =>
						path.relative(__dirname, moduleId)
					);
				}
				assert.deepStrictEqual(result, {
					'main1.js': ['emptyResolved', 'main1.js'],
					'main2.js': ['emptyLoaded', 'main2.js'],
					'generated-emptyTransformed.js': ['emptyTransformed']
				});
			}
		}
	}
};
