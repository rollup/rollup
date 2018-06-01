'use strict';

const { resolve } = require('path');

module.exports = {
	description: 'paths is called for internal and external modules',
	options: {
		input: 'main.js',
		external: [
			'https://external-url.com/changed-old.js',
			'https://external-url.com/unchanged.js',
			'external-changed-old',
			'external-unchanged',
			resolve(__dirname, '../external-relative-changed-old'),
			resolve(__dirname, '../external-relative-unchanged')
		],
		output: {
			paths(id, parent) {
				if (id === 'https://external-url.com/changed-old.js' && parent === './main.js') {
					return 'https://external-url.com/changed-new.js';
				}
				if (id === 'external-changed-old' && parent === './main.js') {
					return 'external-changed-new';
				}
				if (id === resolve(__dirname, '../external-relative-changed-old') && parent === './main.js') {
					return '../external-relative-changed-new';
				}
				if (id === './internal-changed-old.js' && parent === './main.js') {
					return './internal-changed-new';
				}
			}
		},
		experimentalPreserveModules: true
	}
};
