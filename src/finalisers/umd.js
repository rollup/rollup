import { has } from '../utils/object';
import { getName, quoteId, req } from '../utils/map-helpers';

export default function umd ( bundle, magicString, exportMode, options ) {
	const indentStr = magicString.getIndentString();

	const globalNames = options.globals || {};

	let amdDeps = bundle.externalModules.map( quoteId );
	let cjsDeps = bundle.externalModules.map( req );
	let globalDeps = bundle.externalModules.map( module => {
		return has( globalNames, module.id ) ? globalNames[ module.id ] : module.name;
	});

	let args = bundle.externalModules.map( getName );

	if ( exportMode === 'named' ) {
		amdDeps.unshift( `'exports'` );
		cjsDeps.unshift( `'exports'` );
		globalDeps.unshift( `(global.${options.moduleName} = {})` );

		args.unshift( 'exports' );
	}

	const amdParams =
		( has( options, 'moduleId' ) ? `['${options.moduleId}'], ` : `` ) +
		( amdDeps.length ? `[${amdDeps.join( ', ' )}], ` : `` );

	const defaultExport = exportMode === 'default' ? `global.${options.moduleName} = ` : '';

	const intro =
		`(function (global, factory) {
			typeof exports === 'object' && typeof module !== 'undefined' ? factory(${cjsDeps.join( ', ' )}) :
			typeof define === 'function' && define.amd ? define(${amdParams}factory) :
			${defaultExport}factory(${globalDeps});
		}(this, function (${args}) { 'use strict';

		`.replace( /^\t\t/gm, '' ).replace( /^\t/gm, indentStr );

	const exports = bundle.entryModule.exports;

	let exportBlock;

	if ( exportMode === 'default' ) {
		const canonicalName = bundle.entryModule.getCanonicalName( 'default' );
		exportBlock = `return ${canonicalName};`;
	} else {
		exportBlock = Object.keys( exports ).map( name => {
			const canonicalName = bundle.entryModule.getCanonicalName( exports[ name ].localName );
			return `exports.${name} = ${canonicalName};`;
		}).join( '\n' );
	}

	if ( exportBlock ) {
		magicString.append( '\n\n' + exportBlock );
	}

	return magicString
		.trim()
		.indent()
		.append( '\n\n}));' )
		.prepend( intro );
}
