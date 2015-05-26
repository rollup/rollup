import { has } from '../utils/object';
import { getName } from '../utils/map-helpers';

export default function iife ( bundle, magicString, exportMode, options ) {
	const globalNames = options.globals || {};

	let dependencies = bundle.externalModules.map( module => {
		return has( globalNames, module.id ) ? globalNames[ module.id ] : module.name;
	});

	let args = bundle.externalModules.map( getName );

	if ( exportMode !== 'none' && !options.moduleName ) {
		throw new Error( 'You must supply options.moduleName for IIFE bundles' );
	}

	if ( exportMode === 'named' ) {
		dependencies.unshift( `(window.${options.moduleName} = {})` );
		args.unshift( 'exports' );
	}

	let intro = `(function (${args}) { 'use strict';\n\n`;
	let outro = `\n\n})(${dependencies});`;

	if ( exportMode === 'default' ) {
		intro = `var ${options.moduleName} = ${intro}`;
		magicString.append( `\n\nreturn ${bundle.entryModule.getCanonicalName('default')};` );
	}

	return magicString
		.indent()
		.prepend( intro )
		.append( outro );
}
