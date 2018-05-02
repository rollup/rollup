const json = require('rollup-plugin-json');

module.exports = {
	// skipped until rollup-plugin-json properly fills the "value" field of Literals
	skip: true,
	description: 'removes unusued json keys',
	options: { plugins: [json()] }
};
