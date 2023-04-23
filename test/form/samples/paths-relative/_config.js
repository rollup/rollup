const { resolve } = require('node:path');

const resolved = resolve(__dirname, 'foo.js');

module.exports = defineRollupTest({
	description: 'external paths (#754)',
	options: {
		external: [resolved],
		output: {
			globals: { [resolved]: 'foo' },
			paths: { [resolved]: '../foo' }
		}
	}
});
