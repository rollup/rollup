import { absolutePath, dirname, isAbsolute, resolve } from './path';
import { readdirSync, readFileSync } from './fs';

function dirExists ( dir ) {
	try {
		readdirSync( dir );
		return true;
	} catch ( err ) {
		return false;
	}
}

export function defaultResolver ( importee, importer, options ) {
	// absolute paths are left untouched
	if ( isAbsolute( importee ) ) return importee;

	// if this is the entry point, resolve against cwd
	if ( importer === undefined ) return resolve( process.cwd(), importee );

	// we try to resolve external modules
	if ( importee[0] !== '.' ) {
		const [ id ] = importee.split( /[\/\\]/ );

		// unless we want to keep it external, that is
		if ( ~options.external.indexOf( id ) ) return null;

		return options.resolveExternal( importee, importer, options );
	}

	return resolve( dirname( importer ), importee ).replace( /\.js$/, '' ) + '.js';
}

export function defaultExternalResolver ( id, importer ) {
	// for now, only node_modules is supported, and only jsnext:main
	const root = absolutePath.exec( importer )[0];
	let dir = dirname( importer );

	// `foo` should use jsnext:main, but `foo/src/bar` shouldn't
	const parts = id.split( /[\/\\]/ );

	// npm scoped packages – @user/package
	if ( parts[0][0] === '@' && parts[1] ) {
		var user = parts.shift();
		parts[0] = user + '/' + parts[0];
	}

	while ( dir !== root && dir !== '.' ) {
		const modulePath = resolve( dir, 'node_modules', parts[0] );

		if ( dirExists( modulePath ) ) {
			// `foo/src/bar`
			if ( parts.length > 1 ) {
				return resolve( modulePath, ...parts.slice( 1 ) ).replace( /\.js$/, '' ) + '.js';
			}

			// `foo`
			const pkgPath = resolve( modulePath, 'package.json' );
			let pkg;

			try {
				pkg = JSON.parse( readFileSync( pkgPath, 'utf-8' ) );
			} catch ( err ) {
				throw new Error( `Missing or malformed package.json: ${modulePath}` );
			}

			const main = pkg[ 'jsnext:main' ];

			if ( !main ) {
				throw new Error( `Package ${id} (imported by ${importer}) does not have a jsnext:main field, and so cannot be included in your rollup. Try adding it as an external module instead (e.g. options.external = ['${id}']). See https://github.com/rollup/rollup/wiki/jsnext:main for more info` );
			}

			return resolve( dirname( pkgPath ), main ).replace( /\.js$/, '' ) + '.js';
		}

		dir = dirname( dir );
	}

	throw new Error( `Could not find package ${id} (required by ${importer})` );
}
