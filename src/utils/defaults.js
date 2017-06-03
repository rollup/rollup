import { lstatSync, readdirSync, readFileSync, realpathSync } from './fs.js'; // eslint-disable-line
import { basename, dirname, resolve } from './path.js';
import { blank } from './object.js';
import error from './error.js';

export function load ( id ) {
	return readFileSync( id, 'utf-8' );
}

function findFile ( file ) {
	try {
		const stats = lstatSync( file );
		if ( stats.isSymbolicLink() ) return findFile( realpathSync( file ) );
		if ( stats.isFile() ) {
			// check case
			const name = basename( file );
			const files = readdirSync( dirname( file ) );

			if ( ~files.indexOf( name ) ) return file;
		}
	} catch ( err ) {
		// suppress
	}
}

function addJsExtensionIfNecessary ( file ) {
	return findFile( file ) || findFile( file + '.js' );
}

export function resolveId ( importee, importer ) {
	if ( typeof process === 'undefined' ) {
		error({
			code: 'MISSING_PROCESS',
			message: `It looks like you're using Rollup in a non-Node.js environment. This means you must supply a plugin with custom resolveId and load functions`,
			url: 'https://github.com/rollup/rollup/wiki/Plugins'
		});
	}

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

	return warning => {
		const str = warning.toString();
		if ( str in warned ) return;
		console.error( str ); //eslint-disable-line no-console
		warned[ str ] = true;
	};
}
