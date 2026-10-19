const assert = require('node:assert/strict');
const external = /external-/y;
external.lastIndex = 2;
const frozenExternal = Object.freeze(Object.assign(/^frozen-external-/i, { lastIndex: 2 }));

module.exports = defineTest({
	description: 'matches sticky external regexes at the start without changing their lastIndex',
	options: {
		external: [external, frozenExternal, 'external-string'],
		plugins: [
			{
				name: 'fallback',
				resolveId(id) {
					if (id === 'internal' || id === 'prefix-external-fourth' || id.startsWith('external-'))
						return id;
				},
				load(id) {
					if (id === 'internal') return "export default 'internal';";
					if (id === 'prefix-external-fourth' || id.startsWith('external-'))
						return "export default 'bundled';";
				}
			}
		]
	},
	context: {
		require: id => id
	},
	after() {
		assert.strictEqual(external.lastIndex, 2);
	}
});
