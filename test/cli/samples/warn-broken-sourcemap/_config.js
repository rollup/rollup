const fs = require('fs');
const path = require('path');
const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'displays warnings for broken sourcemaps',
	command: 'rollup -c',
	stderr: stderr => {
		fs.unlinkSync(path.resolve(__dirname, 'bundle'));
		fs.unlinkSync(path.resolve(__dirname, 'bundle.map'));
		assertIncludes(
			stderr,
			'(!) Broken sourcemap\n' +
				'https://rollupjs.org/guide/en/#warning-sourcemap-is-likely-to-be-incorrect\n' +
				"Plugins that transform code (such as 'test-plugin1') should generate accompanying sourcemaps\n"
		);
	}
};
