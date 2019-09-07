import { ObjectPath } from '../../values';

const ValueProperties = Symbol('Value Properties');

interface ValueDescription {
	pure: boolean;
}

interface GlobalDescription {
	[ValueProperties]: ValueDescription;
	[pathKey: string]: GlobalDescription;
}

const PURE: ValueDescription = { pure: true };
const IMPURE: ValueDescription = { pure: false };

const OBJECT: GlobalDescription = {
	// @ts-ignore
	__proto__: null,
	[ValueProperties]: IMPURE
};

const PURE_FUNCTION: GlobalDescription = {
	// @ts-ignore
	__proto__: null,
	[ValueProperties]: PURE
};

const CONSTRUCTOR: GlobalDescription = {
	// @ts-ignore
	__proto__: null,
	[ValueProperties]: IMPURE,
	prototype: OBJECT
};

const PURE_CONSTRUCTOR: GlobalDescription = {
	// @ts-ignore
	__proto__: null,
	[ValueProperties]: PURE,
	prototype: OBJECT
};

const ARRAY_TYPE: GlobalDescription = {
	// @ts-ignore
	__proto__: null,
	[ValueProperties]: PURE,
	from: PURE_FUNCTION,
	of: PURE_FUNCTION,
	prototype: OBJECT
};

const INTL_MEMBER: GlobalDescription = {
	// @ts-ignore
	__proto__: null,
	[ValueProperties]: PURE,
	supportedLocalesOf: PURE_CONSTRUCTOR
};

const knownGlobals: GlobalDescription = {
	// @ts-ignore
	__proto__: null,
	[ValueProperties]: IMPURE,
	Array: {
		// @ts-ignore
		__proto__: null,
		[ValueProperties]: IMPURE,
		from: PURE_FUNCTION,
		isArray: PURE_FUNCTION,
		of: PURE_FUNCTION,
		prototype: OBJECT
	},
	ArrayBuffer: {
		// @ts-ignore
		__proto__: null,
		[ValueProperties]: PURE,
		isView: PURE_FUNCTION,
		prototype: OBJECT
	},
	Atomics: OBJECT,
	BigInt: CONSTRUCTOR,
	BigInt64Array: CONSTRUCTOR,
	BigUint64Array: CONSTRUCTOR,
	Boolean: PURE_CONSTRUCTOR,
	// @ts-ignore
	constructor: CONSTRUCTOR,
	DataView: PURE_CONSTRUCTOR,
	Date: {
		// @ts-ignore
		__proto__: null,
		[ValueProperties]: PURE,
		now: PURE_FUNCTION,
		parse: PURE_FUNCTION,
		prototype: OBJECT,
		UTC: PURE_FUNCTION
	},
	decodeURI: PURE_FUNCTION,
	decodeURIComponent: PURE_FUNCTION,
	encodeURI: PURE_FUNCTION,
	encodeURIComponent: PURE_FUNCTION,
	Error: PURE_CONSTRUCTOR,
	escape: PURE_FUNCTION,
	eval: OBJECT,
	EvalError: PURE_CONSTRUCTOR,
	Float32Array: ARRAY_TYPE,
	Float64Array: ARRAY_TYPE,
	Function: CONSTRUCTOR,
	// @ts-ignore
	hasOwnProperty: OBJECT,
	Infinity: OBJECT,
	Int16Array: ARRAY_TYPE,
	Int32Array: ARRAY_TYPE,
	Int8Array: ARRAY_TYPE,
	isFinite: PURE_FUNCTION,
	isNaN: PURE_FUNCTION,
	// @ts-ignore
	isPrototypeOf: OBJECT,
	JSON: OBJECT,
	Map: PURE_CONSTRUCTOR,
	Math: {
		// @ts-ignore
		__proto__: null,
		[ValueProperties]: IMPURE,
		abs: PURE_FUNCTION,
		acos: PURE_FUNCTION,
		acosh: PURE_FUNCTION,
		asin: PURE_FUNCTION,
		asinh: PURE_FUNCTION,
		atan: PURE_FUNCTION,
		atan2: PURE_FUNCTION,
		atanh: PURE_FUNCTION,
		cbrt: PURE_FUNCTION,
		ceil: PURE_FUNCTION,
		clz32: PURE_FUNCTION,
		cos: PURE_FUNCTION,
		cosh: PURE_FUNCTION,
		exp: PURE_FUNCTION,
		expm1: PURE_FUNCTION,
		floor: PURE_FUNCTION,
		fround: PURE_FUNCTION,
		hypot: PURE_FUNCTION,
		imul: PURE_FUNCTION,
		log: PURE_FUNCTION,
		log10: PURE_FUNCTION,
		log1p: PURE_FUNCTION,
		log2: PURE_FUNCTION,
		max: PURE_FUNCTION,
		min: PURE_FUNCTION,
		pow: PURE_FUNCTION,
		random: PURE_FUNCTION,
		round: PURE_FUNCTION,
		sign: PURE_FUNCTION,
		sin: PURE_FUNCTION,
		sinh: PURE_FUNCTION,
		sqrt: PURE_FUNCTION,
		tan: PURE_FUNCTION,
		tanh: PURE_FUNCTION,
		trunc: PURE_FUNCTION
	},
	NaN: OBJECT,
	Number: {
		// @ts-ignore
		__proto__: null,
		[ValueProperties]: PURE,
		isFinite: PURE_FUNCTION,
		isInteger: PURE_FUNCTION,
		isNaN: PURE_FUNCTION,
		isSafeInteger: PURE_FUNCTION,
		parseFloat: PURE_FUNCTION,
		parseInt: PURE_FUNCTION,
		prototype: OBJECT
	},
	Object: {
		// @ts-ignore
		__proto__: null,
		[ValueProperties]: PURE,
		create: PURE_FUNCTION,
		getNotifier: PURE_FUNCTION,
		getOwn: PURE_FUNCTION,
		getOwnPropertyDescriptor: PURE_FUNCTION,
		getOwnPropertyNames: PURE_FUNCTION,
		getOwnPropertySymbols: PURE_FUNCTION,
		getPrototypeOf: PURE_FUNCTION,
		is: PURE_FUNCTION,
		isExtensible: PURE_FUNCTION,
		isFrozen: PURE_FUNCTION,
		isSealed: PURE_FUNCTION,
		keys: PURE_FUNCTION,
		prototype: OBJECT
	},
	parseFloat: PURE_FUNCTION,
	parseInt: PURE_FUNCTION,
	Promise: {
		// @ts-ignore
		__proto__: null,
		[ValueProperties]: IMPURE,
		all: PURE_FUNCTION,
		prototype: OBJECT,
		race: PURE_FUNCTION,
		resolve: PURE_FUNCTION
	},
	// @ts-ignore
	propertyIsEnumerable: OBJECT,
	Proxy: OBJECT,
	RangeError: PURE_CONSTRUCTOR,
	ReferenceError: PURE_CONSTRUCTOR,
	Reflect: OBJECT,
	RegExp: PURE_CONSTRUCTOR,
	Set: PURE_CONSTRUCTOR,
	SharedArrayBuffer: CONSTRUCTOR,
	String: {
		// @ts-ignore
		__proto__: null,
		[ValueProperties]: PURE,
		fromCharCode: PURE_FUNCTION,
		fromCodePoint: PURE_FUNCTION,
		prototype: OBJECT,
		raw: PURE_FUNCTION
	},
	Symbol: {
		// @ts-ignore
		__proto__: null,
		[ValueProperties]: PURE,
		for: PURE_FUNCTION,
		keyFor: PURE_FUNCTION,
		prototype: OBJECT
	},
	SyntaxError: PURE_CONSTRUCTOR,
	// @ts-ignore
	toLocaleString: OBJECT,
	// @ts-ignore
	toString: OBJECT,
	TypeError: PURE_CONSTRUCTOR,
	Uint16Array: ARRAY_TYPE,
	Uint32Array: ARRAY_TYPE,
	Uint8Array: ARRAY_TYPE,
	Uint8ClampedArray: ARRAY_TYPE,
	// Technically, this is a global, but it needs special handling
	// undefined: ?,
	unescape: PURE_FUNCTION,
	URIError: PURE_CONSTRUCTOR,
	// @ts-ignore
	valueOf: OBJECT,
	WeakMap: PURE_CONSTRUCTOR,
	WeakSet: PURE_CONSTRUCTOR,

	// Additional globals shared by Node and Browser that are not strictly part of the language
	clearInterval: CONSTRUCTOR,
	clearTimeout: CONSTRUCTOR,
	console: OBJECT,
	Intl: {
		// @ts-ignore
		__proto__: null,
		[ValueProperties]: IMPURE,
		Collator: INTL_MEMBER,
		DateTimeFormat: INTL_MEMBER,
		ListFormat: INTL_MEMBER,
		NumberFormat: INTL_MEMBER,
		PluralRules: INTL_MEMBER,
		RelativeTimeFormat: INTL_MEMBER
	},
	setInterval: CONSTRUCTOR,
	setTimeout: CONSTRUCTOR,
	TextDecoder: CONSTRUCTOR,
	TextEncoder: CONSTRUCTOR,
	URL: CONSTRUCTOR,
	URLSearchParams: CONSTRUCTOR
};

for (const global of ['window', 'global', 'self', 'globalThis']) {
	knownGlobals[global] = knownGlobals;
}

function getGlobalAtPath(path: ObjectPath): ValueDescription | null {
	let currentGlobal = knownGlobals;
	for (const pathSegment of path) {
		if (typeof pathSegment !== 'string') {
			return null;
		}
		currentGlobal = currentGlobal[pathSegment];
		if (!currentGlobal) {
			return null;
		}
	}
	return currentGlobal[ValueProperties];
}

export function isPureGlobal(path: ObjectPath): boolean {
	const globalAtPath = getGlobalAtPath(path);
	return globalAtPath !== null && globalAtPath.pure;
}

export function isGlobalMember(path: ObjectPath): boolean {
	if (path.length === 1) {
		return path[0] === 'undefined' || getGlobalAtPath(path) !== null;
	}
	return getGlobalAtPath(path.slice(0, -1)) !== null;
}

// TODO add others to this list from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
