const { assertIncludes } = require('../../../../utils');

module.exports = defineTest({
	description: 'does not watch if --watch is missing',
	command: 'node wrapper.js -c --no-watch.clearScreen',
	stderr: stderr => assertIncludes(stderr, 'main.js → _actual.js...\ncreated _actual.js in'),
	abortOnStderr(data) {
		if (data.includes('waiting for changes')) {
			throw new Error('Watch initiated');
		}
	}
});
