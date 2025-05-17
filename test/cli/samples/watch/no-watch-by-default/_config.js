const { assertIncludes } = require('../../../../testHelpers');

module.exports = defineTest({
	description: 'does not watch if --watch is missing',
	spawnScript: 'wrapper.js',
	spawnArgs: ['-c', '--no-watch.clearScreen'],
	stderr: stderr => assertIncludes(stderr, 'main.js → _actual.js...\ncreated _actual.js in'),
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			throw new Error('Watch initiated');
		}
	}
});
