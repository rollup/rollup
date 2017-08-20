import assert from 'assert';
import { resolve } from 'path';

var config = resolve( './_config.js' );

export default {
	input: 'main.js',
	format: 'cjs',

	external: [ 'assert', config ],

	plugins: [
		{
			load: function ( id ) {
				assert.notEqual( id, config );
			}
		}
	]
};
