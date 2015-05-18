import { keys } from '../utils/object';

export default function cjs ( bundle, magicString ) {
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
			const name = bundle.entryModule.getCanonicalName( specifier.localName );

			return `exports.${key} = ${name};`;
		})
		.join( '\n' );

	if ( exportBlock ) {
		magicString.append( '\n\n' + exportBlock );
	}

	return magicString;
}