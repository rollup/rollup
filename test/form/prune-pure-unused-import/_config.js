const assert = require('assert');

module.exports = {
	options: {
		external: ['external', 'other'],
		pureExternalModules: true
	},
	description: 'prunes pure unused external imports ([#1352])'
};
