const { assertIncludes } = require('../../../../utils.js');

module.exports = {
	description: 'onStart event hoot shell command executes correctly',
	command: 'rollup -cw --watch.onStart="echo onStart"',
	stdout: stdout => assertIncludes(stdout, 'onStart')
};
