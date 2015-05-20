const reservedWords = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public'.split( ' ' );
const builtins = 'Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl'.split( ' ' );

let blacklisted = {};
reservedWords.concat( builtins ).forEach( word => blacklisted[ word ] = true );


export default function makeLegalIdentifier ( str ) {
	str = str.replace( /[^$_a-zA-Z0-9]/g, '_' );
	if ( /\d/.test( str[0] ) || blacklisted[ str ] ) str = `_${str}`;

	return str;
}
