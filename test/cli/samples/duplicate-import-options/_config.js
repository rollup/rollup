const { assertIncludes } = require('../../../utils.js');

module.exports = {
	description: 'throws if different types of entries are combined',
	command: 'rollup main.js --format es --input main.js',
	error: () => true,
	stderr(stderr) {
		assertIncludes(stderr, '[!] Either use --input, or pass input path as argument');
	}
};
