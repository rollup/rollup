const assert = require('node:assert');

const testedIds = [];

module.exports = defineTest({
	description: 'passes both unresolved and resolved ids to the external option',
	context: {
		require() {
			return true;
		}
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			resolvedExternal: true,
			resolvedObject: true,
			resolvedObjectExternal: true,
			resolvedString: true
		});
		assert.deepStrictEqual(testedIds, [
			'resolve-string',
			'resolve-external',
			'resolve-object',
			'resolve-object-external',
			'resolved-string',
			'resolved-object'
		]);
	},
	options: {
		external(id) {
			testedIds.push(id);
			return id.startsWith('resolved');
		},
		plugins: [
			{
				name: 'test-plugin',
				resolveId(source) {
					switch (source) {
						case 'resolve-string': {
							return 'resolved-string';
						}
						case 'resolve-external': {
							return false;
						}
						case 'resolve-object': {
							return { id: 'resolved-object', external: false };
						}
						case 'resolve-object-external': {
							return { id: 'resolved-object-external', external: true };
						}
						default: {
							return null;
						}
					}
				}
			}
		]
	}
});
