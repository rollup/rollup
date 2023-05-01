const assert = require('node:assert');
const { resolve } = require('node:path');

const FOO_IMPORTED_PATH = './foo.js';
const BAR_IMPORTED_PATH = './bar.js';
const OTHER_IMPORTED_PATH = './other.js';
const MAIN_PATH = resolve(__dirname, 'main.js');

module.exports = defineTest({
	description: 'validate resolvedBy logic',
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
							resolvedBy: 'barByPlugin2'
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
					assert.equal(resolvedFooId.resolvedBy, 'plugin1');
					assert.equal(resolvedBarId.resolvedBy, 'barByPlugin2');
					assert.equal(resolvedOtherId.resolvedBy, 'rollup');
					assert.equal(resolvedMainId.resolvedBy, 'rollup');
				}
			}
		]
	}
});
