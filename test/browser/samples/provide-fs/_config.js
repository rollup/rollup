const { Volume } = require('memfs');

const vol = Volume.fromJSON({
	main: "console.log('Hello, Rollup!');"
});

module.exports = defineTest({
	description: 'allows to provide an in-memory fs via option',
	options: {
		fs: vol.promises
	}
});
