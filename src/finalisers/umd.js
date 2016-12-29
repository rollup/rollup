import { blank } from '../utils/object.js';
import { getName, quotePath, req } from '../utils/map-helpers.js';
import getInteropBlock from './shared/getInteropBlock.js';
import getExportBlock from './shared/getExportBlock.js';
import getGlobalNameMaker from './shared/getGlobalNameMaker.js';
import esModuleExport from './shared/esModuleExport.js';
import propertyStringFor from './shared/propertyStringFor.js';
import warnOnBuiltins from './shared/warnOnBuiltins.js';

// globalProp('foo.bar-baz') === "global.foo['bar-baz']"
const globalProp = propertyStringFor('global');

// propString('foo.bar-baz') === ".foo['bar']"
const propString = propertyStringFor('');

function setupNamespace ( name ) {
	const parts = name.split( '.' );
	parts.pop();

	let acc = 'global';
	return parts
		.map( part => ( acc += propString(part), `${acc} = ${acc} || {}` ) )
		.concat( globalProp(name) )
		.join( ', ' );
}

const wrapperOutro = '\n\n})));';

export default function umd ( bundle, magicString, { exportMode, indentString, intro, outro }, options ) {
	if ( exportMode !== 'none' && !options.moduleName ) {
		throw new Error( 'You must supply options.moduleName for UMD bundles' );
	}

	warnOnBuiltins( bundle );

	const globalNameMaker = getGlobalNameMaker( options.globals || blank(), bundle );

	const amdDeps = bundle.externalModules.map( quotePath );
	const cjsDeps = bundle.externalModules.map( req );
	const globalDeps = bundle.externalModules.map( module => globalProp(globalNameMaker( module )) );

	const args = bundle.externalModules.map( getName );

	if ( exportMode === 'named' ) {
		amdDeps.unshift( `'exports'` );
		cjsDeps.unshift( `exports` );
		globalDeps.unshift( `(${setupNamespace(options.moduleName)} = ${globalProp(options.moduleName)} || {})` );

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
				var current = ${globalProp(options.moduleName)};
				var exports = factory(${globalDeps});
				${globalProp(options.moduleName)} = exports;
				exports.noConflict = function() { ${globalProp(options.moduleName)} = current; return exports; };
			})()` : `(${defaultExport}factory(${globalDeps}))`;

	const wrapperIntro =
		`(function (global, factory) {
			typeof exports === 'object' && typeof module !== 'undefined' ? ${cjsExport}factory(${cjsDeps.join( ', ' )}) :
			typeof define === 'function' && define.amd ? define(${amdParams}factory) :
			${globalExport};
		}(this, (function (${args}) {${useStrict}

		`.replace( /^\t\t/gm, '' ).replace( /^\t/gm, magicString.getIndentString() );

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock( bundle, options );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	if ( intro ) magicString.prepend( intro );

	const exportBlock = getExportBlock( bundle.entryModule, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( exportMode === 'named' && options.legacy !== true ) magicString.append( `\n\n${esModuleExport}` );
	if ( outro ) magicString.append( outro );

	return magicString
		.trim()
		.indent( indentString )
		.append( wrapperOutro )
		.prepend( wrapperIntro );
}
