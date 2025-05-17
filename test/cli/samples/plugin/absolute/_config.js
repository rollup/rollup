const path = require('node:path');

module.exports = defineTest({
	description: 'CLI --plugin /absolute/path',
	spawnArgs: ['main.js', '-p', `${__dirname}${path.sep}my-plugin.js={VALUE: 'absolute', ZZZ: 1}`]
});
