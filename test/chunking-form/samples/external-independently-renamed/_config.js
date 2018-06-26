'use strict';

let i = 0;

module.exports = {
	description: 'imports of the same external can be independently renamed',
	options: {
		input: ['main1.js', 'lib/main2.js'],
		external(id) {
			return id.endsWith('placeholder');
		},
		output: {
			paths() {
				return i++ === 0 ? './internal' : '../internal';
			}
		},
		experimentalPreserveModules: true
	}
};
