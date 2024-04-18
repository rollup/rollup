const path = require('node:path');

const resolved = path.resolve(__dirname, 'foo.js');

module.exports = defineTest({
	description: 'external paths (#754)',
	options: {
		external: [resolved],
		output: {
			globals: { [resolved]: 'foo' },
			paths: { [resolved]: '../foo' }
		}
	}
});
