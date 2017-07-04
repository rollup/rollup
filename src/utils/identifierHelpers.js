import { blank } from './object.js';

export const reservedWords = 'break case class catch const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield enum await implements package protected static interface private public'.split( ' ' );
const builtins = 'Infinity NaN undefined null true false eval uneval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Symbol Error EvalError InternalError RangeError ReferenceError SyntaxError TypeError URIError Number Math Date String RegExp Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array Map Set WeakMap WeakSet SIMD ArrayBuffer DataView JSON Promise Generator GeneratorFunction Reflect Proxy Intl'.split( ' ' );

const blacklisted = blank();
reservedWords.concat( builtins ).forEach( word => blacklisted[ word ] = true );

const illegalCharacters = /[^$_a-zA-Z0-9]/g;

const startsWithDigit = str => /\d/.test( str[0] );

export function isLegal ( str ) {
	if ( startsWithDigit(str) || blacklisted[ str ] ) {
		return false;
	}
	if ( illegalCharacters.test(str) ) {
		return false;
	}
	return true;
}

export function makeLegal ( str ) {
	str = str
		.replace( /-(\w)/g, ( _, letter ) => letter.toUpperCase() )
		.replace( illegalCharacters, '_' );

	if ( startsWithDigit(str) || blacklisted[ str ] ) str = `_${str}`;

	return str;
}
