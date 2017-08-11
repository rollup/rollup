const assert = require('assert');
const rollup = require('../dist/rollup');
const { loader } = require('./utils.js');

describe('rollup', function() {
	this.timeout(10000);

	require('./misc/index.js');
	require('./function/index.js');
	require('./form/index.js');
	require('./sourcemaps/index.js');
	require('./incremental/index.js');
	require('./hooks/index.js');
	require('./cli/index.js');
	require('./watch/index.js');
});
