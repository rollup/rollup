const json = require('@rollup/plugin-json');

module.exports = defineRollupTest({
	description: 'removes unusued json keys',
	options: { plugins: [json()] }
});
