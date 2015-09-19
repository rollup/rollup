import { absolutePath, dirname, isAbsolute, resolve } from './path';
import { readFileSync } from 'sander';

export function defaultResolver ( importee, importer, options ) {
	// absolute paths are left untouched
	if ( isAbsolute( importee ) ) return importee;

	// if this is the entry point, resolve against cwd
	if ( importer === undefined ) return resolve( process.cwd(), importee );

	// we try to resolve external modules
	if ( importee[0] !== '.' ) {
		// unless we want to keep it external, that is
		if ( ~options.external.indexOf( importee ) ) return null;

		return options.resolveExternal( importee, importer, options );
	}

	return resolve( dirname( importer ), importee ).replace( /\.js$/, '' ) + '.js';
}

export function defaultExternalResolver ( id, importer ) {
	// for now, only node_modules is supported, and only jsnext:main
	const root = absolutePath.exec( importer )[0];
	let dir = dirname( importer );

	while ( dir !== root  && dir !== "." ) {
		const pkgPath = resolve( dir, 'node_modules', id, 'package.json' );
		let pkgJson;

		try {
			pkgJson = readFileSync( pkgPath ).toString();
		} catch ( err ) {
			// noop
		}

		if ( pkgJson ) {
			let pkg;

			try {
				pkg = JSON.parse( pkgJson );
			} catch ( err ) {
				throw new Error( `Malformed JSON: ${pkgPath}` );
			}

			const main = pkg[ 'jsnext:main' ];

			if ( !main ) {
				throw new Error( `Package ${id} does not have a jsnext:main field, and so cannot be included in your rollup. Try adding it as an external module instead (e.g. options.external = ['${id}']). See https://github.com/rollup/rollup/wiki/jsnext:main for more info` );
			}

			return resolve( dirname( pkgPath ), main ).replace( /\.js$/, '' ) + '.js';
		}

		dir = dirname( dir );
	}

	throw new Error( `Could not find package ${id} (required by ${importer})` );
}
