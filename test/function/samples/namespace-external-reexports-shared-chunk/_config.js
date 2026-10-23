const assert = require('node:assert/strict');
const util = require('node:util');

module.exports = defineTest({
	description:
		'imports external reexports needed by a namespace object in a shared chunk that is not facaded by the namespace module',
	options: {
		input: ['main', 'other'],
		external: ['node:util']
	},
	async exports({ getNamespace }) {
		const namespace = await getNamespace();
		assert.deepEqual(Object.keys(namespace), ['describe', 'format', 'init', 'inspect', 'types']);
		assert.equal(namespace.format, util.format);
		assert.equal(namespace.inspect, util.inspect);
		assert.equal(namespace.types, util.types);
	}
});
