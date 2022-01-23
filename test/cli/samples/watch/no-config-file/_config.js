const path = require('path');

module.exports = {
	description: 'watches without a config file',
	command: 'rollup main.js --watch --format es --file _actual/main.js',
	abortOnStderr(data) {
		if (data.includes(`created _actual${path.sep}main.js`)) {
			return true;
		}
	}
};
