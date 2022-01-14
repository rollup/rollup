const path = require('path');

module.exports = {
	description: 'watches using a node_modules config files',
	command: 'rollup --watch --config node:custom',
	abortOnStderr(data) {
		if (data.includes(`created _actual${path.sep}main.js`)) {
			return true;
		}
	}
};
