const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'bundle.modules includes dependencies (#903)',
	bundle(bundle) {
		const modules = bundle.modules.map(module => {
			return {
				id: path.relative(__dirname, module.id),
				dependencies: module.dependencies.map(id => path.relative(__dirname, id))
			};
		});

		assert.deepEqual(modules, [
			{
				id: 'main.js',
				dependencies: ['foo.js', 'bar.js']
			},
			{
				id: 'foo.js',
				dependencies: ['bar.js']
			},
			{
				id: 'bar.js',
				dependencies: [path.normalize('nested/baz.js')]
			},
			{
				id: path.normalize('nested/baz.js'),
				dependencies: [path.normalize('nested/qux.js')]
			},
			{
				id: path.normalize('nested/qux.js'),
				dependencies: []
			}
		]);
	},
	warnings: [
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty bundle'
		}
	]
};
