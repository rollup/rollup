import { readFileSync } from './fs';
import { dirname, isAbsolute, resolve } from './path';

export function load ( id ) {
	return readFileSync( id, 'utf-8' );
}

export function resolveId ( importee, importer ) {
	// absolute paths are left untouched
	if ( isAbsolute( importee ) ) return importee;

	// if this is the entry point, resolve against cwd
	if ( importer === undefined ) return resolve( process.cwd(), importee );

	// external modules are skipped at this stage
	if ( importee[0] !== '.' ) return null;

	return resolve( dirname( importer ), importee ).replace( /\.js$/, '' ) + '.js';
}

export function onwarn ( msg ) {
	console.error( msg );
}
