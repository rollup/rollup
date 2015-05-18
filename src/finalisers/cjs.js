import { keys } from '../utils/object';
import makeLegalIdentifier from '../utils/makeLegalIdentifier';

export default function cjs ( bundle, magicString, options ) {
	let intro = `'use strict';\n\n`;

	// TODO handle ambiguous default imports
	// TODO handle empty imports, once they're supported
	const importBlock = bundle.externalModules
		.map( module => `var ${module.name} = require('${module.id}');` )
		.join( '\n' );

	if ( importBlock ) {
		intro += importBlock + '\n\n';
	}

	magicString.prepend( intro );

	// TODO handle default exports
	const exportBlock = keys( bundle.entryModule.exports )
		.map( key => {
			const specifier = bundle.entryModule.exports[ key ];
			return `exports.${key} = ${specifier.localName}`;
		})
		.join( '\n' );

	if ( exportBlock ) {
		magicString.append( '\n\n' + exportBlock );
	}

	return magicString;
}