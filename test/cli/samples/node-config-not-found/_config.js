const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'throws if a config in node_modules cannot be found',
	command: 'rollup --config node:baz',
	error: () => true,
	stderr(stderr) {
		assertIncludes(stderr, '[!] Could not resolve config file "node:baz"');
	}
});
