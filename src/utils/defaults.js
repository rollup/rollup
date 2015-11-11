import { isFile, readFileSync } from './fs.js';
import { dirname, isAbsolute, resolve } from './path.js';

export function load ( id ) {
	return readFileSync( id, 'utf-8' );
}

function addJsExtensionIfNecessary ( file ) {
	if ( isFile( file ) ) return file;

	file += '.js';
	if ( isFile( file ) ) return file;

	return null;
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

export function onwarn ( msg ) {
	console.error( msg ); //eslint-disable-line no-console
}
