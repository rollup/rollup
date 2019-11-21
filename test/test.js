require('source-map-support').install();
require('console-group').install();

describe('rollup', function() {
	this.timeout(10000);
	require('./misc/index.js');
	require('./function/index.js');
	require('./form/index.js');
	require('./chunking-form/index.js');
	require('./file-hashes/index.js');
	require('./sourcemaps/index.js');
	require('./incremental/index.js');
	require('./hooks/index.js');
	require('./cli/index.js');
	require('./watch/index.js');
});
