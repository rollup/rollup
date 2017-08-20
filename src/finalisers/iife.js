import { blank } from '../utils/object.js';
import error from '../utils/error.js';
import getInteropBlock from './shared/getInteropBlock.js';
import getExportBlock from './shared/getExportBlock.js';
import getGlobalNameMaker from './shared/getGlobalNameMaker.js';
import { property, keypath } from './shared/sanitize.js';
import warnOnBuiltins from './shared/warnOnBuiltins.js';
import trimEmptyImports from './shared/trimEmptyImports.js';
import { isLegal } from '../utils/identifierHelpers.js';

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

	const { extend, name } = options;
	const isNamespaced = name && name.indexOf( '.' ) !== -1;
	const possibleVariableAssignment = !extend && !isNamespaced;

	if ( name && possibleVariableAssignment && !isLegal(name) ) {
		error({
			code: 'ILLEGAL_IDENTIFIER_AS_NAME',
			message: `Given name (${name}) is not legal JS identifier. If you need this you can try --extend option`
		});
	}

	warnOnBuiltins( bundle );

	const external = trimEmptyImports( bundle.externalModules );
	const dependencies = external.map( globalNameMaker );
	const args = external.map( m => m.name );

	if ( exportMode !== 'none' && !name ) {
		error({
			code: 'INVALID_OPTION',
			message: `You must supply options.name for IIFE bundles`
		});
	}

	if ( extend ) {
		dependencies.unshift( `(${thisProp(name)} = ${thisProp(name)} || {})` );
		args.unshift( 'exports' );
	} else if ( exportMode === 'named' ) {
		dependencies.unshift( '{}' );
		args.unshift( 'exports' );
	}

	const useStrict = options.strict !== false ? `${indentString}'use strict';\n\n` : ``;

	let wrapperIntro = `(function (${args}) {\n${useStrict}`;

	if ( exportMode !== 'none' && !extend) {
		wrapperIntro = ( isNamespaced ? thisProp(name) : `${bundle.varOrConst} ${name}` ) + ` = ${wrapperIntro}`;
	}

	if ( isNamespaced ) {
		wrapperIntro = setupNamespace( name ) + wrapperIntro;
	}

	let wrapperOutro = `\n\n}(${dependencies}));`;

	if (!extend && exportMode === 'named') {
		wrapperOutro = `\n\n${indentString}return exports;${wrapperOutro}`;
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
