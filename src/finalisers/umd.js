import { blank } from '../utils/object.js';
import { getName, quotePath, req } from '../utils/map-helpers.js';
import getInteropBlock from './shared/getInteropBlock.js';
import getExportBlock from './shared/getExportBlock.js';
import getGlobalNameMaker from './shared/getGlobalNameMaker.js';
import esModuleExport from './shared/esModuleExport.js';

function setupNamespace ( name ) {
	const parts = name.split( '.' );
	parts.pop();

	let acc = 'global';
	return parts
		.map( part => ( acc += `.${part}`, `${acc} = ${acc} || {}` ) )
		.concat( `global.${name}` )
		.join( ', ' );
}

const wrapperOutro = '\n\n})));';

export default function umd ( bundle, magicString, { exportMode, indentString, intro }, options ) {
	if ( exportMode !== 'none' && !options.moduleName ) {
		throw new Error( 'You must supply options.moduleName for UMD bundles' );
	}

	const globalNameMaker = getGlobalNameMaker( options.globals || blank(), bundle.onwarn );

	const amdDeps = bundle.externalModules.map( quotePath );
	const cjsDeps = bundle.externalModules.map( req );
	const globalDeps = bundle.externalModules.map( module => `global.${globalNameMaker( module )}` );

	const args = bundle.externalModules.map( getName );

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

	const globalExport = options.noConflict === true ?
		`(function() {
				var current = global.${options.moduleName};
				var exports = factory(${globalDeps});
				global.${options.moduleName} = exports;
				exports.noConflict = function() { global.${options.moduleName} = current; return exports; };
			})()` : `(${defaultExport}factory(${globalDeps}))`;

	const wrapperIntro =
		`(function (global, factory) {
			typeof exports === 'object' && typeof module !== 'undefined' ? ${cjsExport}factory(${cjsDeps.join( ', ' )}) :
			typeof define === 'function' && define.amd ? define(${amdParams}factory) :
			${globalExport};
		}(this, (function (${args}) {${useStrict}

		`.replace( /^\t\t/gm, '' ).replace( /^\t/gm, magicString.getIndentString() );

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock( bundle );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	if ( intro ) magicString.prepend( intro );

	const exportBlock = getExportBlock( bundle.entryModule, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( exportMode === 'named' ) magicString.append( `\n\n${esModuleExport}` );
	if ( options.outro ) magicString.append( `\n${options.outro}` );

	return magicString
		.trim()
		.indent( indentString )
		.append( wrapperOutro )
		.prepend( wrapperIntro );
}
