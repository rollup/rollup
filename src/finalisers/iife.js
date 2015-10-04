import { blank } from '../utils/object';
import { getName } from '../utils/map-helpers';
import getInteropBlock from './shared/getInteropBlock';
import getExportBlock from './shared/getExportBlock';

export default function iife ( bundle, magicString, { exportMode, indentString }, options ) {
	const globalNames = options.globals || blank();

	let dependencies = bundle.externalModules.map( module => {
		return globalNames[ module.id ] || module.name;
	});

	let args = bundle.externalModules.map( getName );

	if ( exportMode !== 'none' && !options.moduleName ) {
		throw new Error( 'You must supply options.moduleName for IIFE bundles' );
	}

	if ( exportMode === 'named' ) {
		dependencies.unshift( `(this.${options.moduleName} = {})` );
		args.unshift( 'exports' );
	}

	const useStrict = options.useStrict !== false ? ` 'use strict';` : ``;
	let intro = `(function (${args}) {${useStrict}\n\n`;
	let outro = `\n\n})(${dependencies});`;

	if ( exportMode === 'default' ) {
		intro = `var ${options.moduleName} = ${intro}`;
	}

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock( bundle );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	const exportBlock = getExportBlock( bundle.entryModule, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );

	return magicString
		.indent( indentString )
		.prepend( intro )
		.append( outro );
}
