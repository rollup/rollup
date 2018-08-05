module.exports = {
	skip: true,
	description: 'resolves pathological cyclical dependencies gracefully',
	buble: true,
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'A.js',
			message: 'Circular dependency: A.js -> B.js -> A.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			importer: 'C.js',
			message: 'Circular dependency: C.js -> D.js -> C.js'
		}
	]
};
