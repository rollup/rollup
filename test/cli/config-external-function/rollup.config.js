import assert from 'assert';
import { resolve, sep } from 'path';

var config = resolve( './_config.js' ).split(sep).join('/');

export default {
	entry: 'main.js',
	format: 'cjs',

	external: function (id) {
		if (id === config) {
			return true;
		}

		return false;
	},

	plugins: [
		{
			load: function ( id ) {
				assert.notEqual( id, config );
			}
		}
	]
};
