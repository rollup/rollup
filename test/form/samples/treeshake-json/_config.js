const json = require('@rollup/plugin-json');

module.exports = {
	description: 'removes unusued json keys',
	options: { plugins: [json()] }
};
