import { dirname, isAbsolute, resolve } from 'path';

export function defaultResolver ( importee, importer, options ) {
	// absolute paths are left untouched
	if ( isAbsolute( importee ) ) return importee;

	// we try to resolve external modules
	if ( importee[0] !== '.' ) {
		// unless we want to keep it external, that is
		if ( ~options.external.indexOf( importee ) ) return null;

		return resolveExternal( importee, importer, options );
	}

	return resolve( dirname( importer ), importee ).replace( /\.js$/, '' ) + '.js';
}

function resolveExternal ( id, importer, options ) {
	// for now, only node_modules is supported, and only jsnext:main

	throw new Error( "TODO" );
}
