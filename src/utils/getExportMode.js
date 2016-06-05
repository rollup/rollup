import { keys } from './object.js';

function badExports ( option, keys ) {
	throw new Error( `'${option}' was specified for options.exports, but entry module has following exports: ${keys.join(', ')}` );
}

export default function getExportMode ( bundle, exportMode, moduleName ) {
	const exportKeys = keys( bundle.entryModule.exports )
		.concat( keys( bundle.entryModule.reexports ) )
		.concat( bundle.entryModule.exportAllSources ); // not keys, but makes our job easier this way

	if ( exportMode === 'default' ) {
		if ( exportKeys.length !== 1 || exportKeys[0] !== 'default' ) {
			badExports( 'default', exportKeys );
		}
	} else if ( exportMode === 'none' && exportKeys.length ) {
		badExports( 'none', exportKeys );
	}

	if ( !exportMode || exportMode === 'auto' ) {
		if ( exportKeys.length === 0 ) {
			exportMode = 'none';
		} else if ( exportKeys.length === 1 && exportKeys[0] === 'default' ) {
			exportMode = 'default';
		} else {
			if ( bundle.entryModule.exports.default ) {
				bundle.onwarn( `Using named and default exports together. Consumers of your bundle will have to use ${moduleName || 'bundle'}['default'] to access the default export, which may not be what you want. Use \`exports: 'named'\` to disable this warning. See https://github.com/rollup/rollup/wiki/JavaScript-API#exports for more information` );
			}
			exportMode = 'named';
		}
	}

	if ( !/(?:default|named|none)/.test( exportMode ) ) {
		throw new Error( `options.exports must be 'default', 'named', 'none', 'auto', or left unspecified (defaults to 'auto')` );
	}

	return exportMode;
}
