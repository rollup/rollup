const { unlinkSync } = require('node:fs');
const path = require('node:path');
const { assertIncludes } = require('../../../testHelpers.js');

module.exports = defineTest({
	description: 'displays warnings for broken sourcemaps',
	spawnArgs: ['-c'],
	stderr: stderr => {
		unlinkSync(path.resolve(__dirname, 'bundle'));
		unlinkSync(path.resolve(__dirname, 'bundle.map'));
		assertIncludes(
			stderr,
			'(!) Broken sourcemap\n' +
				'https://rollupjs.org/troubleshooting/#warning-sourcemap-is-likely-to-be-incorrect\n' +
				'Plugins that transform code (such as "test-plugin1", "test-plugin2" and "test-plugin3") should generate accompanying sourcemaps'
		);
	}
});
