import { blank } from '../utils/object.js';
import { getName } from '../utils/map-helpers.js';
import getInteropBlock from './shared/getInteropBlock.js';
import getExportBlock from './shared/getExportBlock.js';
import getGlobalNameMaker from './shared/getGlobalNameMaker.js';

function setupNamespace ( keypath ) {
	const parts = keypath.split( '.' ); // TODO support e.g. `foo['something-hyphenated']`?

	parts.pop();

	let acc = 'this';

	return parts
		.map( part => ( acc += `.${part}`, `${acc} = ${acc} || {};` ) )
		.join( '\n' ) + '\n';
}

export default function iife ( bundle, magicString, { exportMode, indentString, intro }, options ) {
	const globalNameMaker = getGlobalNameMaker( options.globals || blank(), bundle.onwarn );

	const name = options.moduleName;
	const isNamespaced = name && ~name.indexOf( '.' );

	const dependencies = bundle.externalModules.map( globalNameMaker );

	const args = bundle.externalModules.map( getName );

	if ( exportMode !== 'none' && !name ) {
		throw new Error( 'You must supply options.moduleName for IIFE bundles' );
	}

	if ( exportMode === 'named' ) {
		dependencies.unshift( `(this.${name} = this.${name} || {})` );
		args.unshift( 'exports' );
	}

	const useStrict = options.useStrict !== false ? `${indentString}'use strict';\n\n` : ``;

	let wrapperIntro = `(function (${args}) {\n${useStrict}`;
	const wrapperOutro = `\n\n}(${dependencies}));`;

	if ( exportMode === 'default' ) {
		wrapperIntro = ( isNamespaced ? `this.` : `${bundle.varOrConst} ` ) + `${name} = ${wrapperIntro}`;
	}

	if ( isNamespaced ) {
		wrapperIntro = setupNamespace( name ) + wrapperIntro;
	}

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock( bundle, options );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	if ( intro ) magicString.prepend( intro );

	const exportBlock = getExportBlock( bundle.entryModule, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( options.outro ) magicString.append( `\n${options.outro}` );

	return magicString
		.indent( indentString )
		.prepend( wrapperIntro )
		.append( wrapperOutro );
}
