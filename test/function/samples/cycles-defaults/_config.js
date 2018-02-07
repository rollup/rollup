module.exports = {
	description: 'cycles work with default exports',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'a.js',
			message: 'Circular dependency: a.js -> b.js -> a.js'
		}
	]
};

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/cycles-defaults
