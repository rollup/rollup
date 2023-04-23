const { sep } = require('node:path');

module.exports = defineTest({
	description: 'ESM CLI --plugin /absolute/path',
	command: `rollup main.js -p "${__dirname}${sep}my-esm-plugin.mjs={comment: 'Absolute ESM'}"`
});
