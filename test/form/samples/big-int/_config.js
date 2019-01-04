const bigInt = require('acorn-bigint');

module.exports = {
	description: 'supports bigint via acorn plugin',
	options: {
		acornInjectPlugins: [bigInt]
	}
};
