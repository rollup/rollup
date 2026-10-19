const assert = require('node:assert/strict');
const external = /^external-/g;
external.lastIndex = 2;

module.exports = defineTest({
	description: 'matches global external regexes without changing their lastIndex',
	options: {
		external,
		plugins: [
			{
				name: 'fallback',
				resolveId(id) {
					if (id === 'internal' || id.startsWith('external-')) return id;
				},
				load(id) {
					if (id === 'internal') return "export default 'internal';";
					if (id.startsWith('external-')) return "export default 'incorrectly bundled';";
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
