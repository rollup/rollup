const path = require( 'path' );
const assert = require( 'assert' );

module.exports = {
	description: 'bundle.modules includes dependencies (#903)',
	bundle ( bundle ) {
		const modules = bundle.modules.map( module => {
			return {
				id: path.relative( __dirname, module.id ),
				dependencies: module.dependencies.map( id => path.relative( __dirname, id ) )
			};
		});

		assert.deepEqual( modules, [
			{
				id: 'nested/qux.js',
				dependencies: []
			},
			{
				id: 'nested/baz.js',
				dependencies: [ 'nested/qux.js' ]
			},
			{
				id: 'bar.js',
				dependencies: [ 'nested/baz.js' ]
			},
			{
				id: 'foo.js',
				dependencies: [ 'bar.js' ]
			},
			{
				id: 'main.js',
				dependencies: [ 'foo.js', 'bar.js' ]
			}
		]);
	}
};
