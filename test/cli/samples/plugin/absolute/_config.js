const { sep } = require('path');

module.exports = {
	description: 'CLI --plugin /absolute/path',
	minNodeVersion: 12,
	command: `rollup main.js -p "${__dirname}${sep}my-plugin.js={VALUE: 'absolute', ZZZ: 1}"`
};
