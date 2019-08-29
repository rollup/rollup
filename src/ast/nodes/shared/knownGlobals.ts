import { ObjectPath } from '../../values';

const globalObjects = new Set(['window', 'global', 'self', 'globalThis']);

const knownGlobals = new Set([
	'Array',
	'ArrayBuffer',
	'Atomics',
	'BigInt',
	'BigInt64Array',
	'BigUint64Array',
	'Boolean',
	'constructor',
	'DataView',
	'Date',
	'decodeURI',
	'decodeURIComponent',
	'encodeURI',
	'encodeURIComponent',
	'Error',
	'escape',
	'eval',
	'EvalError',
	'Float32Array',
	'Float64Array',
	'Function',
	'globalThis',
	'hasOwnProperty',
	'Infinity',
	'Int16Array',
	'Int32Array',
	'Int8Array',
	'isFinite',
	'isNaN',
	'isPrototypeOf',
	'JSON',
	'Map',
	'Math',
	'NaN',
	'Number',
	'Object',
	'parseFloat',
	'parseInt',
	'Promise',
	'propertyIsEnumerable',
	'Proxy',
	'RangeError',
	'ReferenceError',
	'Reflect',
	'RegExp',
	'Set',
	'SharedArrayBuffer',
	'String',
	'Symbol',
	'SyntaxError',
	'toLocaleString',
	'toString',
	'TypeError',
	'Uint16Array',
	'Uint32Array',
	'Uint8Array',
	'Uint8ClampedArray',
	'undefined',
	'unescape',
	'URIError',
	'valueOf',
	'WeakMap',
	'WeakSet',

	// Additional globals shared by Node and Browser that are not strictly part of the language
	'clearInterval',
	'clearTimeout',
	'console',
	'Intl',
	'setInterval',
	'setTimeout',
	'TextDecoder',
	'TextEncoder',
	'URL',
	'URLSearchParams'
]);

const pureFunctions = new Set([
	'Array.isArray',
	'Error',
	'EvalError',
	'InternalError',
	'RangeError',
	'ReferenceError',
	'SyntaxError',
	'TypeError',
	'URIError',
	'isFinite',
	'isNaN',
	'parseFloat',
	'parseInt',
	'decodeURI',
	'decodeURIComponent',
	'encodeURI',
	'encodeURIComponent',
	'escape',
	'unescape',
	'Object',
	'Object.create',
	'Object.getNotifier',
	'Object.getOwn',
	'Object.getOwnPropertyDescriptor',
	'Object.getOwnPropertyNames',
	'Object.getOwnPropertySymbols',
	'Object.getPrototypeOf',
	'Object.is',
	'Object.isExtensible',
	'Object.isFrozen',
	'Object.isSealed',
	'Object.keys',
	'Boolean',
	'Number',
	'Number.isFinite',
	'Number.isInteger',
	'Number.isNaN',
	'Number.isSafeInteger',
	'Number.parseFloat',
	'Number.parseInt',
	'Symbol',
	'Symbol.for',
	'Symbol.keyFor',
	'Math.abs',
	'Math.acos',
	'Math.acosh',
	'Math.asin',
	'Math.asinh',
	'Math.atan',
	'Math.atan2',
	'Math.atanh',
	'Math.cbrt',
	'Math.ceil',
	'Math.clz32',
	'Math.cos',
	'Math.cosh',
	'Math.exp',
	'Math.expm1',
	'Math.floor',
	'Math.fround',
	'Math.hypot',
	'Math.imul',
	'Math.log',
	'Math.log10',
	'Math.log1p',
	'Math.log2',
	'Math.max',
	'Math.min',
	'Math.pow',
	'Math.random',
	'Math.round',
	'Math.sign',
	'Math.sin',
	'Math.sinh',
	'Math.sqrt',
	'Math.tan',
	'Math.tanh',
	'Math.trunc',
	'Date',
	'Date.UTC',
	'Date.now',
	'Date.parse',
	'String',
	'String.fromCharCode',
	'String.fromCodePoint',
	'String.raw',
	'RegExp',
	'Map',
	'Set',
	'WeakMap',
	'WeakSet',
	'ArrayBuffer',
	'ArrayBuffer.isView',
	'DataView',
	'Promise.all',
	'Promise.race',
	'Promise.resolve',
	'Intl.Collator',
	'Intl.Collator.supportedLocalesOf',
	'Intl.DateTimeFormat',
	'Intl.DateTimeFormat.supportedLocalesOf',
	'Intl.NumberFormat',
	'Intl.NumberFormat.supportedLocalesOf'
]);

const arrayTypes = 'Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array'.split(
	' '
);

for (const type of arrayTypes) {
	pureFunctions.add(type);
	pureFunctions.add(`${type}.from`);
	pureFunctions.add(`${type}.of`);
}

const simdTypes = 'Int8x16 Int16x8 Int32x4 Float32x4 Float64x2'.split(' ');
const simdMethods = 'abs add and bool check div equal extractLane fromFloat32x4 fromFloat32x4Bits fromFloat64x2 fromFloat64x2Bits fromInt16x8Bits fromInt32x4 fromInt32x4Bits fromInt8x16Bits greaterThan greaterThanOrEqual lessThan lessThanOrEqual load max maxNum min minNum mul neg not notEqual or reciprocalApproximation reciprocalSqrtApproximation replaceLane select selectBits shiftLeftByScalar shiftRightArithmeticByScalar shiftRightLogicalByScalar shuffle splat sqrt store sub swizzle xor'.split(
	' '
);

for (const type of simdTypes) {
	const typeString = `SIMD.${type}`;
	pureFunctions.add(typeString);
	for (const method of simdMethods) {
		pureFunctions.add(`${typeString}.${method}`);
	}
}

export function isPureGlobal(path: ObjectPath) {
	if (globalObjects.has(path[0] as string)) {
		path = path.slice(1);
	}
	return pureFunctions.has(path.join('.'));
}

export function isGlobalMember(path: ObjectPath) {
	while (globalObjects.has(path[0] as string)) {
		if (path.length <= 2) {
			return true;
		}
		path = path.slice(1);
	}
	if (path.length <= 2) {
		const name = path[0];
		return typeof name === 'string' && knownGlobals.has(name);
	}
	return (
		pureFunctions.has(path.join('.')) ||
		pureFunctions.has(path.slice(0, -1).join('.')) ||
		(path[path.length - 2] === 'prototype' && pureFunctions.has(path.slice(0, -2).join('.')))
	);
}

// TODO add others to this list from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
