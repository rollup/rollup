const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
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
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main".',
			names: ['main']
		}
	]
});
