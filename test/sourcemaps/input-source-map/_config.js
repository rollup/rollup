var path = require( 'path' );
var fs = require( 'fs' );
var assert = require( 'assert' );

module.exports = {
	description: 'input source map with relative sources (#1015)',
	options: {
		plugins: [
			{
				load: function ( id ) {
					var code = fs.readFileSync( id, 'utf-8' );

					return {
						code,
						map: {
							"version": 3,
							"sources": ["../../../../../../../../../../../../../../../../../../../../test.js"],
							"names": ["foo"],
							"mappings": "AAAA,OAAO,IAAMA,MAAM,KAAZ",
							"file": "main.js",
							"sourcesContent": ["export const foo = \"bar\";"]
						}
					};
				}
			}
		],
		moduleName: 'x'
	},
	test: function ( code, map ) {
		assert.deepEqual( map.sources, ["../../../../../../../../../../../../../../../../../../../../../test.js"] );
	}
};
