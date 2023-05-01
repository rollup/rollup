const { resolve } = require('node:path');

const throttle = resolve(__dirname, 'lib/throttle.js');

module.exports = defineTest({
	description: 'applies globals to externalised relative imports',
	options: {
		external: [throttle],
		output: { globals: { [throttle]: 'Lib.throttle' } }
	}
});
