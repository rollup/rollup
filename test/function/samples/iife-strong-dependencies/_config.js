module.exports = {
	skip: true,
	description: 'does not treat references inside IIFEs as weak dependencies', // edge case encountered in THREE.js codebase
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
