const json = require('@rollup/plugin-json').default;

module.exports = defineTest({
	description: 'removes unused json keys',
	options: { plugins: [json()] }
});
