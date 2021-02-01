module.exports = {
	description: 'handles circular synthetic exports',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['dep1.js', 'dep2.js', 'dep1.js'],
			importer: 'dep1.js',
			message: 'Circular dependency: dep1.js -> dep2.js -> dep1.js'
		}
	]
};
