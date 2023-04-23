const assert = require('node:assert');

module.exports = defineTest({
	description:
		'creates a consistent chunking order (needs to be consistent with the other test of this kind)',
	options: {
		input: 'main',
		plugins: {
			resolveId(id) {
				if (id === 'emitted') {
					return id;
				}
			},
			load(id) {
				if (id === 'emitted') {
					return new Promise(resolve =>
						setTimeout(
							() =>
								resolve(`import value from './dep.js';
export const id = 'emitted';
console.log(id, value);
`),
							200
						)
					);
				}
			},
			buildStart() {
				this.emitFile({
					type: 'chunk',
					id: 'emitted'
				});
			},
			generateBundle(options, bundle) {
				assert.deepStrictEqual(
					Object.keys(bundle).map(key => bundle[key].name),
					['main', 'emitted', 'emitted']
				);
			}
		}
	}
});
