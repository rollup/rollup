'use strict';

const path = require('path');
const walkSync = require('walk-sync');

const input = walkSync('node_modules/lodash-es', {
	directories: false,
	globs: ['**/*.js']
}).map(input => path.join(process.cwd(), 'node_modules/lodash-es', input));

module.exports = {
	description: 'bug',
	options: {
		input
	}
};
