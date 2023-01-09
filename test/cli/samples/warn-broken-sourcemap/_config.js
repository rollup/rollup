const { unlinkSync } = require('node:fs');
const path = require('node:path');
const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'displays warnings for broken sourcemaps',
	command: 'rollup -c',
	stderr: stderr => {
		unlinkSync(path.resolve(__dirname, 'bundle'));
		unlinkSync(path.resolve(__dirname, 'bundle.map'));
		assertIncludes(
			stderr,
			'(!) Broken sourcemap\n' +
				'https://rollupjs.org/08-troubleshooting.html#warning-sourcemap-is-likely-to-be-incorrect\n' +
				'Plugins that transform code (such as "test-plugin1") should generate accompanying sourcemaps.\n'
		);
	}
};
