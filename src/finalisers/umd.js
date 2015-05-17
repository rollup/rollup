export default function umd ( bundle, magicString, options ) {
	const indentStr = magicString.getIndentString();

	const intro =
		`(function (global, factory) {
			typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
			typeof define === 'function' && define.amd ? define(factory) :
			factory((global.${options.globalName} = {}));
		}(this, function (exports) { 'use strict';

		`.replace( /^\t\t/gm, '' ).replace( /^\t/gm, indentStr );

	const exports = bundle.entryModule.exports;

	const exportBlock = '\n\n' + Object.keys( exports ).map( name => {
		return `exports.${name} = ${exports[name].localName};`;
	}).join( '\n' );

	return magicString
		.append( exportBlock )
		.indent()
		.append( '\n\n}));' )
		.prepend( intro );
}