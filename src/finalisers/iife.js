import { blank } from '../utils/object.js';
import { getName } from '../utils/map-helpers.js';
import error from '../utils/error.js';
import getInteropBlock from './shared/getInteropBlock.js';
import getExportBlock from './shared/getExportBlock.js';
import getGlobalNameMaker from './shared/getGlobalNameMaker.js';
import { property, keypath } from './shared/sanitize.js';
import warnOnBuiltins from './shared/warnOnBuiltins.js';
import trimEmptyImports from './shared/trimEmptyImports.js';

function setupNamespace ( keypath ) {
	const parts = keypath.split( '.' );

	parts.pop();

	let acc = 'this';

	return parts
		.map( part => ( acc += property( part ), `${acc} = ${acc} || {};` ) )
		.join( '\n' ) + '\n';
}

const thisProp = name => `this${keypath( name )}`;

export default function iife ( bundle, magicString, { exportMode, indentString, intro, outro }, options ) {
	const globalNameMaker = getGlobalNameMaker( options.globals || blank(), bundle, 'null' );

	const name = options.moduleName;
	const isNamespaced = name && ~name.indexOf( '.' );

	warnOnBuiltins( bundle );

	const external = trimEmptyImports( bundle.externalModules );
	const dependencies = external.map( globalNameMaker );
	const args = external.map( getName );

	if ( exportMode !== 'none' && !name ) {
		error({
			code: 'INVALID_OPTION',
			message: `You must supply options.moduleName for IIFE bundles`
		});
	}

	if ( exportMode === 'named' ) {
		dependencies.unshift( `(${thisProp(name)} = ${thisProp(name)} || {})` );
		args.unshift( 'exports' );
	}

	const useStrict = options.useStrict !== false ? `${indentString}'use strict';\n\n` : ``;

	let wrapperIntro = `(function (${args}) {\n${useStrict}`;
	const wrapperOutro = `\n\n}(${dependencies}));`;

	if ( exportMode === 'default' ) {
		wrapperIntro = ( isNamespaced ? thisProp(name) : `${bundle.varOrConst} ${name}` ) + ` = ${wrapperIntro}`;
	}

	if ( isNamespaced ) {
		wrapperIntro = setupNamespace( name ) + wrapperIntro;
	}

	// var foo__default = 'default' in foo ? foo['default'] : foo;
	const interopBlock = getInteropBlock( bundle, options );
	if ( interopBlock ) magicString.prepend( interopBlock + '\n\n' );

	if ( intro ) magicString.prepend( intro );

	const exportBlock = getExportBlock( bundle, exportMode );
	if ( exportBlock ) magicString.append( '\n\n' + exportBlock );
	if ( outro ) magicString.append( outro );

	return magicString
		.indent( indentString )
		.prepend( wrapperIntro )
		.append( wrapperOutro );
}
