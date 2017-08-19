import { keys } from './object.js';
import error from './error.js';

function badExports ( option, keys ) {
	error({
		code: 'INVALID_EXPORT_OPTION',
		message: `'${option}' was specified for options.exports, but entry module has following exports: ${keys.join(', ')}`
	});
}

export default function getExportMode ( bundle, {exports: exportMode, name, format} ) {
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
			if ( bundle.entryModule.exports.default && format !== 'es') {
				bundle.warn({
					code: 'MIXED_EXPORTS',
					message: `Using named and default exports together. Consumers of your bundle will have to use ${name || 'bundle'}['default'] to access the default export, which may not be what you want. Use \`exports: 'named'\` to disable this warning`,
					url: `https://github.com/rollup/rollup/wiki/JavaScript-API#exports`
				});
			}
			exportMode = 'named';
		}
	}

	if ( !/(?:default|named|none)/.test( exportMode ) ) {
		error({
			code: 'INVALID_EXPORT_OPTION',
			message: `options.exports must be 'default', 'named', 'none', 'auto', or left unspecified (defaults to 'auto')`
		});
	}

	return exportMode;
}
