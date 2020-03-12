const { assertStderrIncludes } = require('../../../utils.js');

module.exports = {
	description: 'throws if a config in node_modules cannot be found',
	command: 'rollup --config node:baz',
	error: () => true,
	stderr(stderr) {
		assertStderrIncludes(stderr, '[!] Could not resolve config file node:baz');
	}
};
