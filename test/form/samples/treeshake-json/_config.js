const json = require('@rollup/plugin-json');

module.exports = defineTest({
	description: 'removes unusued json keys',
	options: { plugins: [json()] }
});
