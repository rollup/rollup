import { lstatSync, readFileSync, realpathSync } from './fs.js';
import { dirname, isAbsolute, resolve } from './path.js';
import { blank } from './object.js';

export function load ( id ) {
	return readFileSync( id, 'utf-8' );
}

function findFile ( file ) {
	try {
		const stats = lstatSync( file );
		if ( stats.isSymbolicLink() ) return findFile( realpathSync( file ) );
		if ( stats.isFile() ) return file;
	} catch ( err ) {
		// suppress
	}

	return null;
}

function addJsExtensionIfNecessary ( file ) {
	return findFile( file ) || findFile( file + '.js' );
}

export function resolveId ( importee, importer ) {
	// absolute paths are left untouched
	if ( isAbsolute( importee ) ) return addJsExtensionIfNecessary( importee );

	// if this is the entry point, resolve against cwd
	if ( importer === undefined ) return addJsExtensionIfNecessary( resolve( process.cwd(), importee ) );

	// external modules are skipped at this stage
	if ( importee[0] !== '.' ) return null;

	return addJsExtensionIfNecessary( resolve( dirname( importer ), importee ) );
}


export function makeOnwarn () {
	let warned = blank();

	return msg => {
		if ( msg in warned ) return;
		console.error( msg ); //eslint-disable-line no-console
		warned[ msg ] = true;
	};
}
