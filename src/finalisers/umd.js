import { blank } from '../utils/object.js';
import { getName, quoteId, req } from '../utils/map-helpers.js';
import getInteropBlock from './shared/getInteropBlock.js';
import getExportBlock from './shared/getExportBlock.js';
import getGlobalNameMaker from './shared/getGlobalNameMaker.js';

function setupNamespace ( name ) {
	const parts = name.split( '.' );
	parts.pop();

	let acc = 'global';
	return parts
		.map( part => ( acc += `.${part}`, `${acc} = ${acc} || {}` ) )
		.concat( `global.${name}` )
		.join( ', ' );
}

export default function umd ( bundle, magicString, { exportMode, indentString }, options ) {
	if ( exportMode !== 'none' && !options.moduleName ) {
		throw new Error( 'You must supply options.moduleName for UMD bundles' );
	}

	const globalNameMaker = getGlobalNameMaker( options.globals || blank(), bundle.onwarn );

	let amdDeps = bundle.externalModules.map( quoteId );
	let cjsDeps = bundle.externalModules.map( req );
	let globalDeps = bundle.externalModules.map( module => `global.${globalNameMaker( module )}` );

	let args = bundle.externalModules.map( getName );

	if ( exportMode === 'named' ) {
		amdDeps.unshift( `'exports'` );
		cjsDeps.unshift( `exports` );
		globalDeps.unshift( `(${setupNamespace(options.moduleName)} = global.${options.moduleName} || {})` );

		args.unshift( 'exports' );
	}

	const amdParams =
		( options.moduleId ? `'${options.moduleId}', ` : `` ) +
		( amdDeps.length ? `[${amdDeps.join( ', ' )}], ` : `` );

	const cjsExport = exportMode === 'default' ? `module.exports = ` : ``;
	const defaultExport = exportMode === 'default' ? `${setupNamespace(options.moduleName)} = ` : '';

	const useStrict = options.useStrict !== false ? ` 'use strict';` : ``;

	const intro =
		`(function (global, factory) {
			typeof exports === 'object' && typeof module !== 'undefined' ? ${cjsExport}factory(${cjsDeps.join( ', ' )}) :
			typeof define === 'function' && define.amd ? define(${amdParams}factory) :
			(${defaultExport}factory(${globalDeps}));
		}(this, function (${args}) {${useStrict}

		`.replace( /^\t\t/gm, '' ).replace( /^\t/gm, magicString.getIndentString() );

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock( bundle );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	const exportBlock = getExportBlock( bundle.entryModule, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );

	return magicString
		.trim()
		.indent( indentString )
		.append( '\n\n}));' )
		.prepend( intro );
}
