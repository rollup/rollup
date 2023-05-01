const json = require('@rollup/plugin-json').default;

module.exports = defineTest({
	description: 'removes unusued json keys',
	options: { plugins: [json()] }
});
