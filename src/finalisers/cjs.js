export default function cjs ( bundle, magicString, options ) {
	const intro = `'use strict';\n\n`;

	// TODO group modules more intelligently
	bundle.externalModules.forEach( module => {
		console.log( 'module', module );
		//intro += `var
	});

	return magicString.prepend( intro );
}