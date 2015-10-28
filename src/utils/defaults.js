import { readFileSync } from './fs.js';
import { dirname, extname, isAbsolute, resolve } from './path.js';

export function load ( id ) {
	return readFileSync( id, 'utf-8' );
}

function addExt ( id ) {
	if ( !extname( id ) ) id += '.js';
	return id;
}

export function resolveId ( importee, importer ) {
	// absolute paths are left untouched
	if ( isAbsolute( importee ) ) return addExt( importee );

	// if this is the entry point, resolve against cwd
	if ( importer === undefined ) return resolve( process.cwd(), addExt( importee ) );

	// external modules are skipped at this stage
	if ( importee[0] !== '.' ) return null;

	return resolve( dirname( importer ), addExt( importee ) );
}

export function onwarn ( msg ) {
	console.error( msg );
}
