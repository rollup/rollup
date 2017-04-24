import { isFile, readdirSync, readFileSync } from './fs.js';
import { basename, dirname, isAbsolute, resolve } from './path.js';
import { blank } from './object.js';

export function load ( id ) {
	return readFileSync( id, 'utf-8' );
}

function addJsExtensionIfNecessary ( file ) {
	try {
		const name = basename( file );
		const files = readdirSync( dirname( file ) );

		if ( ~files.indexOf( name ) && isFile( file ) ) return file;
		if ( ~files.indexOf( `${name}.js` ) && isFile( `${file}.js` ) ) return `${file}.js`;
	} catch ( err ) {
		// noop
	}

	return null;
}

export function resolveId ( importee, importer ) {
	if ( typeof process === 'undefined' ) throw new Error( `It looks like you're using Rollup in a non-Node.js environment. This means you must supply a plugin with custom resolveId and load functions. See https://github.com/rollup/rollup/wiki/Plugins for more information` );

	// external modules (non-entry modules that start with neither '.' or '/')
	// are skipped at this stage.
	if ( importer !== undefined && !/^[\/\.]/.test( importee[0] ) ) return null;

	// `resolve` processes paths from right to left, prepending them until an
	// absolute path is created. Absolute importees therefore shortcircuit the
	// resolve call and require no special handing on our part.
	// See https://nodejs.org/api/path.html#path_path_resolve_paths
	return addJsExtensionIfNecessary(
		resolve( importer ? dirname( importer ) : resolve(), importee ) );
}


export function makeOnwarn () {
	const warned = blank();

	return msg => {
		if ( msg in warned ) return;
		console.error( msg ); //eslint-disable-line no-console
		warned[ msg ] = true;
	};
}
