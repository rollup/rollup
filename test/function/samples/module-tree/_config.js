const assert = require('assert');
const path = require('path');

module.exports = {
	description: 'bundle.modules includes dependencies (#903)',
	bundle(bundle) {
		const modules = bundle.cache.modules.map(module => ({
			id: path.relative(__dirname, module.id),
			dependencies: module.dependencies.map(id => path.relative(__dirname, id))
		}));

		assert.deepEqual(modules, [
			{
				id: path.normalize('nested/qux.js'),
				dependencies: []
			},
			{
				id: path.normalize('nested/baz.js'),
				dependencies: [path.normalize('nested/qux.js')]
			},
			{
				id: 'bar.js',
				dependencies: [path.normalize('nested/baz.js')]
			},
			{
				id: 'foo.js',
				dependencies: ['bar.js']
			},
			{
				id: 'main.js',
				dependencies: ['foo.js', 'bar.js']
			}
		]);
	},
	warnings: [
		{
			chunkName: 'main',
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main"'
		}
	]
};
