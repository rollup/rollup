const assert = require('node:assert');
// @ts-expect-error file outside root
const { getObject } = require('../../../utils');

function getTestPlugin(index) {
	const pluginName = `test-${index}`;
	return {
		name: pluginName,
		async resolveId(id) {
			if (id.includes(`resolve${index}`)) {
				return { id, meta: { [pluginName]: { resolved: index } } };
			}
		},
		load(id) {
			if (id.includes(`load${index}`)) {
				return {
					code: "throw new Error('should be replaced');",
					meta: { [pluginName]: { loaded: index } }
				};
			}
		},
		transform(code, id) {
			if (id.includes(`transform${index}`)) {
				const { meta } = this.getModuleInfo(id);
				return {
					code: `export const value = ${JSON.stringify(meta)};`,
					meta: { [pluginName]: { transformed: index } }
				};
			}
		}
	};
}

module.exports = defineTest({
	description: 'supports adding custom options to modules',
	options: {
		plugins: [
			getTestPlugin(1),
			getTestPlugin(2),
			getTestPlugin(3),
			{
				name: 'wrap-up',
				buildEnd() {
					assert.deepStrictEqual(
						getObject(
							[...this.getModuleIds()]
								.filter(id => id.includes('resolve'))
								.map(id => [id, this.getModuleInfo(id).meta])
						),
						{
							'resolve1-load2-transform3': {
								'test-1': { resolved: 1 },
								'test-2': { loaded: 2 },
								'test-3': { transformed: 3 }
							},
							'resolve2-load2-transform3': {
								'test-2': { loaded: 2 },
								'test-3': { transformed: 3 }
							},
							'resolve3-load3-transform1-transform3': {
								'test-3': { transformed: 3 },
								'test-1': { transformed: 1 }
							}
						}
					);
				}
			}
		]
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			value1: { 'test-1': { resolved: 1 }, 'test-2': { loaded: 2 } },
			value2: { 'test-2': { loaded: 2 } },
			value3: { 'test-3': { loaded: 3 }, 'test-1': { transformed: 1 } }
		});
	}
});
