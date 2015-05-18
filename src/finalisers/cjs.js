import { keys } from '../utils/object';

export default function cjs ( bundle, magicString ) {
	let intro = `'use strict';\n\n`;

	// TODO handle ambiguous default imports
	// TODO handle empty imports, once they're supported
	const importBlock = bundle.externalModules
		.map( module => {
			let requireStatement = `var ${module.name} = require('${module.id}');`;

			if ( module.needsDefault ) {
				requireStatement += '\n' + ( module.needsNamed ? `var ${module.name}__default = ` : `${module.name} = ` ) +
					`'default' in ${module.name} ? ${module.name}['default'] : ${module.name};`;
			}

			return requireStatement;
		})
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