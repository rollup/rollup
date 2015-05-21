export default function iife ( bundle, magicString, exportMode, options ) {

	const intro = `(function () { 'use strict';\n\n`;
	const outro = `\n\n})();`;

	return magicString
		.trim()
		.indent()
		.prepend( intro )
		.append( outro );
}
