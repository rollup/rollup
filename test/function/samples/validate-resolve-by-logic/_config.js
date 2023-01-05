const { resolve } = require('node:path');
const assert = require('node:assert');

const FOO_IMPORTED_PATH = './foo.js';
const BAR_IMPORTED_PATH = './bar.js';
const OTHER_IMPORTED_PATH = './other.js';
const MAIN_PATH = resolve(__dirname, 'main.js');

module.exports = {
	description: 'validate resolveBy logic',
	options: {
		plugins: [
			{
				name: 'plugin1',
				async resolveId(id) {
					if (id === FOO_IMPORTED_PATH) {
						return id;
					}
				}
			},
			{
				name: 'plugin2',
				async resolveId(id) {
					if (id === BAR_IMPORTED_PATH) {
						return {
							id,
							resolveBy: 'barByPlugin2'
						};
					}
				}
			},
			{
				name: 'plugin3',
				async buildEnd() {
					const [resolvedFooId, resolvedBarId, resolvedOtherId, resolvedMainId] = await Promise.all(
						[
							this.resolve(FOO_IMPORTED_PATH),
							this.resolve(BAR_IMPORTED_PATH),
							this.resolve(OTHER_IMPORTED_PATH),
							this.resolve(MAIN_PATH)
						]
					);
					assert.equal(resolvedFooId.resolveBy, 'plugin1');
					assert.equal(resolvedBarId.resolveBy, 'barByPlugin2');
					assert.equal(resolvedOtherId.resolveBy, 'rollup');
					assert.equal(resolvedMainId.resolveBy, 'rollup');
				}
			}
		]
	}
};
