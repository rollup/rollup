const assert = require('assert');

module.exports = {
	options: {
		external: ['external', 'other'],
		pureExternalModules: ['external']
	},
	description: 'prunes pure unused external imports ([#1352])'
};
