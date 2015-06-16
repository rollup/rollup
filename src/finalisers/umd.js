import { blank } from '../utils/object';
import { getName, quoteId, req } from '../utils/map-helpers';

export default function umd ( bundle, magicString, { exportMode, indentString }, options ) {
	if ( exportMode !== 'none' && !options.moduleName ) {
		throw new Error( 'You must supply options.moduleName for UMD bundles' );
	}

	const globalNames = options.globals || blank();

	let amdDeps = bundle.externalModules.map( quoteId );
	let cjsDeps = bundle.externalModules.map( req );
	let globalDeps = bundle.externalModules.map( module => {
		return globalNames[ module.id ] || module.name;
	});

	let args = bundle.externalModules.map( getName );

	if ( exportMode === 'named' ) {
		amdDeps.unshift( `'exports'` );
		cjsDeps.unshift( `exports` );
		globalDeps.unshift( `(global.${options.moduleName} = {})` );

		args.unshift( 'exports' );
	}

	const amdParams =
		( options.moduleId ? `['${options.moduleId}'], ` : `` ) +
		( amdDeps.length ? `[${amdDeps.join( ', ' )}], ` : `` );

	const cjsExport = exportMode === 'default' ? `module.exports = ` : ``;
	const defaultExport = exportMode === 'default' ? `global.${options.moduleName} = ` : '';

	const intro =
		`(function (global, factory) {
			typeof exports === 'object' && typeof module !== 'undefined' ? ${cjsExport}factory(${cjsDeps.join( ', ' )}) :
			typeof define === 'function' && define.amd ? define(${amdParams}factory) :
			${defaultExport}factory(${globalDeps});
		}(this, function (${args}) { 'use strict';

		`.replace( /^\t\t/gm, '' ).replace( /^\t/gm, magicString.getIndentString() );

	const exports = bundle.entryModule.exports;

	let exportBlock;

	if ( exportMode === 'default' ) {
		const canonicalName = bundle.entryModule.getCanonicalName( 'default' );
		exportBlock = `return ${canonicalName};`;
	} else {
		exportBlock = bundle.toExport.map( name => {
			const canonicalName = bundle.entryModule.getCanonicalName( exports[ name ].localName );
			return `exports.${name} = ${canonicalName};`;
		}).join( '\n' );
	}

	if ( exportBlock ) {
		magicString.append( '\n\n' + exportBlock );
	}

	return magicString
		.trim()
		.indent( indentString )
		.append( '\n\n}));' )
		.prepend( intro );
}
