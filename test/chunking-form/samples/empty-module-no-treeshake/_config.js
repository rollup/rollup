const assert = require('node:assert');
const path = require('node:path');
const { getObject } = require('../../../testHelpers');

module.exports = defineTest({
	description: 'associates empty modules with chunks if tree-shaking is disabled for them',
	options: {
		input: ['main1.js', 'main2.js'],
		plugins: {
			name: 'test-plugin',
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
				assert.deepStrictEqual(
					getObject(
						[...this.getModuleIds()].map(id => [
							id.startsWith('empty') ? id : path.relative(__dirname, id),
							this.getModuleInfo(id).moduleSideEffects
						])
					),
					{
						empty: true,
						emptyLoaded: 'no-treeshake',
						emptyResolved: 'no-treeshake',
						emptyTransformed: 'no-treeshake',
						'main1.js': true,
						'main2.js': true
					}
				);
				assert.deepStrictEqual(
					getObject(
						Object.entries(bundle).map(([chunkId, chunk]) => [
							chunkId,
							Object.keys(chunk.modules).map(moduleId => path.relative(__dirname, moduleId))
						])
					),
					{
						'main1.js': ['emptyResolved', 'main1.js'],
						'main2.js': ['emptyLoaded', 'main2.js'],
						'generated-emptyTransformed.js': ['emptyTransformed']
					}
				);
			}
		}
	}
});
