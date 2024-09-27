var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var es_symbol = {};

var es_symbol_constructor = {};

var globalThis_1;
var hasRequiredGlobalThis;

function requireGlobalThis () {
	if (hasRequiredGlobalThis) return globalThis_1;
	hasRequiredGlobalThis = 1;
	var check = function (it) {
	  return it && it.Math === Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	globalThis_1 =
	  // eslint-disable-next-line es/no-global-this -- safe
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  // eslint-disable-next-line no-restricted-globals -- safe
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  check(typeof globalThis_1 == 'object' && globalThis_1) ||
	  // eslint-disable-next-line no-new-func -- fallback
	  (function () { return this; })() || Function('return this')();
	return globalThis_1;
}

var objectGetOwnPropertyDescriptor = {};

var fails;
var hasRequiredFails;

function requireFails () {
	if (hasRequiredFails) return fails;
	hasRequiredFails = 1;
	fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};
	return fails;
}

var descriptors;
var hasRequiredDescriptors;

function requireDescriptors () {
	if (hasRequiredDescriptors) return descriptors;
	hasRequiredDescriptors = 1;
	var fails = requireFails();

	// Detect IE8's incomplete defineProperty implementation
	descriptors = !fails(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
	});
	return descriptors;
}

var functionBindNative;
var hasRequiredFunctionBindNative;

function requireFunctionBindNative () {
	if (hasRequiredFunctionBindNative) return functionBindNative;
	hasRequiredFunctionBindNative = 1;
	var fails = requireFails();

	functionBindNative = !fails(function () {
	  // eslint-disable-next-line es/no-function-prototype-bind -- safe
	  var test = (function () { /* empty */ }).bind();
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return typeof test != 'function' || test.hasOwnProperty('prototype');
	});
	return functionBindNative;
}

var functionCall;
var hasRequiredFunctionCall;

function requireFunctionCall () {
	if (hasRequiredFunctionCall) return functionCall;
	hasRequiredFunctionCall = 1;
	var NATIVE_BIND = requireFunctionBindNative();

	var call = Function.prototype.call;

	functionCall = NATIVE_BIND ? call.bind(call) : function () {
	  return call.apply(call, arguments);
	};
	return functionCall;
}

var objectPropertyIsEnumerable = {};

var hasRequiredObjectPropertyIsEnumerable;

function requireObjectPropertyIsEnumerable () {
	if (hasRequiredObjectPropertyIsEnumerable) return objectPropertyIsEnumerable;
	hasRequiredObjectPropertyIsEnumerable = 1;
	var $propertyIsEnumerable = {}.propertyIsEnumerable;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
	objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : $propertyIsEnumerable;
	return objectPropertyIsEnumerable;
}

var createPropertyDescriptor;
var hasRequiredCreatePropertyDescriptor;

function requireCreatePropertyDescriptor () {
	if (hasRequiredCreatePropertyDescriptor) return createPropertyDescriptor;
	hasRequiredCreatePropertyDescriptor = 1;
	createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};
	return createPropertyDescriptor;
}

var functionUncurryThis;
var hasRequiredFunctionUncurryThis;

function requireFunctionUncurryThis () {
	if (hasRequiredFunctionUncurryThis) return functionUncurryThis;
	hasRequiredFunctionUncurryThis = 1;
	var NATIVE_BIND = requireFunctionBindNative();

	var FunctionPrototype = Function.prototype;
	var call = FunctionPrototype.call;
	var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);

	functionUncurryThis = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
	  return function () {
	    return call.apply(fn, arguments);
	  };
	};
	return functionUncurryThis;
}

var classofRaw;
var hasRequiredClassofRaw;

function requireClassofRaw () {
	if (hasRequiredClassofRaw) return classofRaw;
	hasRequiredClassofRaw = 1;
	var uncurryThis = requireFunctionUncurryThis();

	var toString = uncurryThis({}.toString);
	var stringSlice = uncurryThis(''.slice);

	classofRaw = function (it) {
	  return stringSlice(toString(it), 8, -1);
	};
	return classofRaw;
}

var indexedObject;
var hasRequiredIndexedObject;

function requireIndexedObject () {
	if (hasRequiredIndexedObject) return indexedObject;
	hasRequiredIndexedObject = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var fails = requireFails();
	var classof = requireClassofRaw();

	var $Object = Object;
	var split = uncurryThis(''.split);

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return !$Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classof(it) === 'String' ? split(it, '') : $Object(it);
	} : $Object;
	return indexedObject;
}

var isNullOrUndefined;
var hasRequiredIsNullOrUndefined;

function requireIsNullOrUndefined () {
	if (hasRequiredIsNullOrUndefined) return isNullOrUndefined;
	hasRequiredIsNullOrUndefined = 1;
	// we can't use just `it == null` since of `document.all` special case
	// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
	isNullOrUndefined = function (it) {
	  return it === null || it === undefined;
	};
	return isNullOrUndefined;
}

var requireObjectCoercible;
var hasRequiredRequireObjectCoercible;

function requireRequireObjectCoercible () {
	if (hasRequiredRequireObjectCoercible) return requireObjectCoercible;
	hasRequiredRequireObjectCoercible = 1;
	var isNullOrUndefined = requireIsNullOrUndefined();

	var $TypeError = TypeError;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	requireObjectCoercible = function (it) {
	  if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
	  return it;
	};
	return requireObjectCoercible;
}

var toIndexedObject;
var hasRequiredToIndexedObject;

function requireToIndexedObject () {
	if (hasRequiredToIndexedObject) return toIndexedObject;
	hasRequiredToIndexedObject = 1;
	// toObject with fallback for non-array-like ES3 strings
	var IndexedObject = requireIndexedObject();
	var requireObjectCoercible = requireRequireObjectCoercible();

	toIndexedObject = function (it) {
	  return IndexedObject(requireObjectCoercible(it));
	};
	return toIndexedObject;
}

var isCallable;
var hasRequiredIsCallable;

function requireIsCallable () {
	if (hasRequiredIsCallable) return isCallable;
	hasRequiredIsCallable = 1;
	// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
	var documentAll = typeof document == 'object' && document.all;

	// `IsCallable` abstract operation
	// https://tc39.es/ecma262/#sec-iscallable
	// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
	isCallable = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
	  return typeof argument == 'function' || argument === documentAll;
	} : function (argument) {
	  return typeof argument == 'function';
	};
	return isCallable;
}

var isObject;
var hasRequiredIsObject;

function requireIsObject () {
	if (hasRequiredIsObject) return isObject;
	hasRequiredIsObject = 1;
	var isCallable = requireIsCallable();

	isObject = function (it) {
	  return typeof it == 'object' ? it !== null : isCallable(it);
	};
	return isObject;
}

var getBuiltIn;
var hasRequiredGetBuiltIn;

function requireGetBuiltIn () {
	if (hasRequiredGetBuiltIn) return getBuiltIn;
	hasRequiredGetBuiltIn = 1;
	var globalThis = requireGlobalThis();
	var isCallable = requireIsCallable();

	var aFunction = function (argument) {
	  return isCallable(argument) ? argument : undefined;
	};

	getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(globalThis[namespace]) : globalThis[namespace] && globalThis[namespace][method];
	};
	return getBuiltIn;
}

var objectIsPrototypeOf;
var hasRequiredObjectIsPrototypeOf;

function requireObjectIsPrototypeOf () {
	if (hasRequiredObjectIsPrototypeOf) return objectIsPrototypeOf;
	hasRequiredObjectIsPrototypeOf = 1;
	var uncurryThis = requireFunctionUncurryThis();

	objectIsPrototypeOf = uncurryThis({}.isPrototypeOf);
	return objectIsPrototypeOf;
}

var environmentUserAgent;
var hasRequiredEnvironmentUserAgent;

function requireEnvironmentUserAgent () {
	if (hasRequiredEnvironmentUserAgent) return environmentUserAgent;
	hasRequiredEnvironmentUserAgent = 1;
	var globalThis = requireGlobalThis();

	var navigator = globalThis.navigator;
	var userAgent = navigator && navigator.userAgent;

	environmentUserAgent = userAgent ? String(userAgent) : '';
	return environmentUserAgent;
}

var environmentV8Version;
var hasRequiredEnvironmentV8Version;

function requireEnvironmentV8Version () {
	if (hasRequiredEnvironmentV8Version) return environmentV8Version;
	hasRequiredEnvironmentV8Version = 1;
	var globalThis = requireGlobalThis();
	var userAgent = requireEnvironmentUserAgent();

	var process = globalThis.process;
	var Deno = globalThis.Deno;
	var versions = process && process.versions || Deno && Deno.version;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
	  // but their correct versions are not interesting for us
	  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
	}

	// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
	// so check `userAgent` even if `.v8` exists, but 0
	if (!version && userAgent) {
	  match = userAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = userAgent.match(/Chrome\/(\d+)/);
	    if (match) version = +match[1];
	  }
	}

	environmentV8Version = version;
	return environmentV8Version;
}

var symbolConstructorDetection;
var hasRequiredSymbolConstructorDetection;

function requireSymbolConstructorDetection () {
	if (hasRequiredSymbolConstructorDetection) return symbolConstructorDetection;
	hasRequiredSymbolConstructorDetection = 1;
	/* eslint-disable es/no-symbol -- required for testing */
	var V8_VERSION = requireEnvironmentV8Version();
	var fails = requireFails();
	var globalThis = requireGlobalThis();

	var $String = globalThis.String;

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
	symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails(function () {
	  var symbol = Symbol('symbol detection');
	  // Chrome 38 Symbol has incorrect toString conversion
	  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
	  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
	  // of course, fail.
	  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
	    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
	    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
	});
	return symbolConstructorDetection;
}

var useSymbolAsUid;
var hasRequiredUseSymbolAsUid;

function requireUseSymbolAsUid () {
	if (hasRequiredUseSymbolAsUid) return useSymbolAsUid;
	hasRequiredUseSymbolAsUid = 1;
	/* eslint-disable es/no-symbol -- required for testing */
	var NATIVE_SYMBOL = requireSymbolConstructorDetection();

	useSymbolAsUid = NATIVE_SYMBOL
	  && !Symbol.sham
	  && typeof Symbol.iterator == 'symbol';
	return useSymbolAsUid;
}

var isSymbol;
var hasRequiredIsSymbol;

function requireIsSymbol () {
	if (hasRequiredIsSymbol) return isSymbol;
	hasRequiredIsSymbol = 1;
	var getBuiltIn = requireGetBuiltIn();
	var isCallable = requireIsCallable();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var USE_SYMBOL_AS_UID = requireUseSymbolAsUid();

	var $Object = Object;

	isSymbol = USE_SYMBOL_AS_UID ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  var $Symbol = getBuiltIn('Symbol');
	  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
	};
	return isSymbol;
}

var tryToString;
var hasRequiredTryToString;

function requireTryToString () {
	if (hasRequiredTryToString) return tryToString;
	hasRequiredTryToString = 1;
	var $String = String;

	tryToString = function (argument) {
	  try {
	    return $String(argument);
	  } catch (error) {
	    return 'Object';
	  }
	};
	return tryToString;
}

var aCallable;
var hasRequiredACallable;

function requireACallable () {
	if (hasRequiredACallable) return aCallable;
	hasRequiredACallable = 1;
	var isCallable = requireIsCallable();
	var tryToString = requireTryToString();

	var $TypeError = TypeError;

	// `Assert: IsCallable(argument) is true`
	aCallable = function (argument) {
	  if (isCallable(argument)) return argument;
	  throw new $TypeError(tryToString(argument) + ' is not a function');
	};
	return aCallable;
}

var getMethod;
var hasRequiredGetMethod;

function requireGetMethod () {
	if (hasRequiredGetMethod) return getMethod;
	hasRequiredGetMethod = 1;
	var aCallable = requireACallable();
	var isNullOrUndefined = requireIsNullOrUndefined();

	// `GetMethod` abstract operation
	// https://tc39.es/ecma262/#sec-getmethod
	getMethod = function (V, P) {
	  var func = V[P];
	  return isNullOrUndefined(func) ? undefined : aCallable(func);
	};
	return getMethod;
}

var ordinaryToPrimitive;
var hasRequiredOrdinaryToPrimitive;

function requireOrdinaryToPrimitive () {
	if (hasRequiredOrdinaryToPrimitive) return ordinaryToPrimitive;
	hasRequiredOrdinaryToPrimitive = 1;
	var call = requireFunctionCall();
	var isCallable = requireIsCallable();
	var isObject = requireIsObject();

	var $TypeError = TypeError;

	// `OrdinaryToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-ordinarytoprimitive
	ordinaryToPrimitive = function (input, pref) {
	  var fn, val;
	  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
	  if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
	  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
	  throw new $TypeError("Can't convert object to primitive value");
	};
	return ordinaryToPrimitive;
}

var sharedStore = {exports: {}};

var isPure;
var hasRequiredIsPure;

function requireIsPure () {
	if (hasRequiredIsPure) return isPure;
	hasRequiredIsPure = 1;
	isPure = false;
	return isPure;
}

var defineGlobalProperty;
var hasRequiredDefineGlobalProperty;

function requireDefineGlobalProperty () {
	if (hasRequiredDefineGlobalProperty) return defineGlobalProperty;
	hasRequiredDefineGlobalProperty = 1;
	var globalThis = requireGlobalThis();

	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty = Object.defineProperty;

	defineGlobalProperty = function (key, value) {
	  try {
	    defineProperty(globalThis, key, { value: value, configurable: true, writable: true });
	  } catch (error) {
	    globalThis[key] = value;
	  } return value;
	};
	return defineGlobalProperty;
}

var hasRequiredSharedStore;

function requireSharedStore () {
	if (hasRequiredSharedStore) return sharedStore.exports;
	hasRequiredSharedStore = 1;
	var IS_PURE = requireIsPure();
	var globalThis = requireGlobalThis();
	var defineGlobalProperty = requireDefineGlobalProperty();

	var SHARED = '__core-js_shared__';
	var store = sharedStore.exports = globalThis[SHARED] || defineGlobalProperty(SHARED, {});

	(store.versions || (store.versions = [])).push({
	  version: '3.38.1',
	  mode: IS_PURE ? 'pure' : 'global',
	  copyright: '© 2014-2024 Denis Pushkarev (zloirock.ru)',
	  license: 'https://github.com/zloirock/core-js/blob/v3.38.1/LICENSE',
	  source: 'https://github.com/zloirock/core-js'
	});
	return sharedStore.exports;
}

var shared;
var hasRequiredShared;

function requireShared () {
	if (hasRequiredShared) return shared;
	hasRequiredShared = 1;
	var store = requireSharedStore();

	shared = function (key, value) {
	  return store[key] || (store[key] = value || {});
	};
	return shared;
}

var toObject;
var hasRequiredToObject;

function requireToObject () {
	if (hasRequiredToObject) return toObject;
	hasRequiredToObject = 1;
	var requireObjectCoercible = requireRequireObjectCoercible();

	var $Object = Object;

	// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	toObject = function (argument) {
	  return $Object(requireObjectCoercible(argument));
	};
	return toObject;
}

var hasOwnProperty_1;
var hasRequiredHasOwnProperty;

function requireHasOwnProperty () {
	if (hasRequiredHasOwnProperty) return hasOwnProperty_1;
	hasRequiredHasOwnProperty = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var toObject = requireToObject();

	var hasOwnProperty = uncurryThis({}.hasOwnProperty);

	// `HasOwnProperty` abstract operation
	// https://tc39.es/ecma262/#sec-hasownproperty
	// eslint-disable-next-line es/no-object-hasown -- safe
	hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
	  return hasOwnProperty(toObject(it), key);
	};
	return hasOwnProperty_1;
}

var uid;
var hasRequiredUid;

function requireUid () {
	if (hasRequiredUid) return uid;
	hasRequiredUid = 1;
	var uncurryThis = requireFunctionUncurryThis();

	var id = 0;
	var postfix = Math.random();
	var toString = uncurryThis(1.0.toString);

	uid = function (key) {
	  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
	};
	return uid;
}

var wellKnownSymbol;
var hasRequiredWellKnownSymbol;

function requireWellKnownSymbol () {
	if (hasRequiredWellKnownSymbol) return wellKnownSymbol;
	hasRequiredWellKnownSymbol = 1;
	var globalThis = requireGlobalThis();
	var shared = requireShared();
	var hasOwn = requireHasOwnProperty();
	var uid = requireUid();
	var NATIVE_SYMBOL = requireSymbolConstructorDetection();
	var USE_SYMBOL_AS_UID = requireUseSymbolAsUid();

	var Symbol = globalThis.Symbol;
	var WellKnownSymbolsStore = shared('wks');
	var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol['for'] || Symbol : Symbol && Symbol.withoutSetter || uid;

	wellKnownSymbol = function (name) {
	  if (!hasOwn(WellKnownSymbolsStore, name)) {
	    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol, name)
	      ? Symbol[name]
	      : createWellKnownSymbol('Symbol.' + name);
	  } return WellKnownSymbolsStore[name];
	};
	return wellKnownSymbol;
}

var toPrimitive;
var hasRequiredToPrimitive;

function requireToPrimitive () {
	if (hasRequiredToPrimitive) return toPrimitive;
	hasRequiredToPrimitive = 1;
	var call = requireFunctionCall();
	var isObject = requireIsObject();
	var isSymbol = requireIsSymbol();
	var getMethod = requireGetMethod();
	var ordinaryToPrimitive = requireOrdinaryToPrimitive();
	var wellKnownSymbol = requireWellKnownSymbol();

	var $TypeError = TypeError;
	var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

	// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	toPrimitive = function (input, pref) {
	  if (!isObject(input) || isSymbol(input)) return input;
	  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
	  var result;
	  if (exoticToPrim) {
	    if (pref === undefined) pref = 'default';
	    result = call(exoticToPrim, input, pref);
	    if (!isObject(result) || isSymbol(result)) return result;
	    throw new $TypeError("Can't convert object to primitive value");
	  }
	  if (pref === undefined) pref = 'number';
	  return ordinaryToPrimitive(input, pref);
	};
	return toPrimitive;
}

var toPropertyKey;
var hasRequiredToPropertyKey;

function requireToPropertyKey () {
	if (hasRequiredToPropertyKey) return toPropertyKey;
	hasRequiredToPropertyKey = 1;
	var toPrimitive = requireToPrimitive();
	var isSymbol = requireIsSymbol();

	// `ToPropertyKey` abstract operation
	// https://tc39.es/ecma262/#sec-topropertykey
	toPropertyKey = function (argument) {
	  var key = toPrimitive(argument, 'string');
	  return isSymbol(key) ? key : key + '';
	};
	return toPropertyKey;
}

var documentCreateElement;
var hasRequiredDocumentCreateElement;

function requireDocumentCreateElement () {
	if (hasRequiredDocumentCreateElement) return documentCreateElement;
	hasRequiredDocumentCreateElement = 1;
	var globalThis = requireGlobalThis();
	var isObject = requireIsObject();

	var document = globalThis.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document) && isObject(document.createElement);

	documentCreateElement = function (it) {
	  return EXISTS ? document.createElement(it) : {};
	};
	return documentCreateElement;
}

var ie8DomDefine;
var hasRequiredIe8DomDefine;

function requireIe8DomDefine () {
	if (hasRequiredIe8DomDefine) return ie8DomDefine;
	hasRequiredIe8DomDefine = 1;
	var DESCRIPTORS = requireDescriptors();
	var fails = requireFails();
	var createElement = requireDocumentCreateElement();

	// Thanks to IE8 for its funny defineProperty
	ie8DomDefine = !DESCRIPTORS && !fails(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty(createElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a !== 7;
	});
	return ie8DomDefine;
}

var hasRequiredObjectGetOwnPropertyDescriptor;

function requireObjectGetOwnPropertyDescriptor () {
	if (hasRequiredObjectGetOwnPropertyDescriptor) return objectGetOwnPropertyDescriptor;
	hasRequiredObjectGetOwnPropertyDescriptor = 1;
	var DESCRIPTORS = requireDescriptors();
	var call = requireFunctionCall();
	var propertyIsEnumerableModule = requireObjectPropertyIsEnumerable();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();
	var toIndexedObject = requireToIndexedObject();
	var toPropertyKey = requireToPropertyKey();
	var hasOwn = requireHasOwnProperty();
	var IE8_DOM_DEFINE = requireIe8DomDefine();

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	objectGetOwnPropertyDescriptor.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPropertyKey(P);
	  if (IE8_DOM_DEFINE) try {
	    return $getOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
	};
	return objectGetOwnPropertyDescriptor;
}

var objectDefineProperty = {};

var v8PrototypeDefineBug;
var hasRequiredV8PrototypeDefineBug;

function requireV8PrototypeDefineBug () {
	if (hasRequiredV8PrototypeDefineBug) return v8PrototypeDefineBug;
	hasRequiredV8PrototypeDefineBug = 1;
	var DESCRIPTORS = requireDescriptors();
	var fails = requireFails();

	// V8 ~ Chrome 36-
	// https://bugs.chromium.org/p/v8/issues/detail?id=3334
	v8PrototypeDefineBug = DESCRIPTORS && fails(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
	    value: 42,
	    writable: false
	  }).prototype !== 42;
	});
	return v8PrototypeDefineBug;
}

var anObject;
var hasRequiredAnObject;

function requireAnObject () {
	if (hasRequiredAnObject) return anObject;
	hasRequiredAnObject = 1;
	var isObject = requireIsObject();

	var $String = String;
	var $TypeError = TypeError;

	// `Assert: Type(argument) is Object`
	anObject = function (argument) {
	  if (isObject(argument)) return argument;
	  throw new $TypeError($String(argument) + ' is not an object');
	};
	return anObject;
}

var hasRequiredObjectDefineProperty;

function requireObjectDefineProperty () {
	if (hasRequiredObjectDefineProperty) return objectDefineProperty;
	hasRequiredObjectDefineProperty = 1;
	var DESCRIPTORS = requireDescriptors();
	var IE8_DOM_DEFINE = requireIe8DomDefine();
	var V8_PROTOTYPE_DEFINE_BUG = requireV8PrototypeDefineBug();
	var anObject = requireAnObject();
	var toPropertyKey = requireToPropertyKey();

	var $TypeError = TypeError;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var $defineProperty = Object.defineProperty;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var ENUMERABLE = 'enumerable';
	var CONFIGURABLE = 'configurable';
	var WRITABLE = 'writable';

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	objectDefineProperty.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPropertyKey(P);
	  anObject(Attributes);
	  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
	    var current = $getOwnPropertyDescriptor(O, P);
	    if (current && current[WRITABLE]) {
	      O[P] = Attributes.value;
	      Attributes = {
	        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
	        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
	        writable: false
	      };
	    }
	  } return $defineProperty(O, P, Attributes);
	} : $defineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPropertyKey(P);
	  anObject(Attributes);
	  if (IE8_DOM_DEFINE) try {
	    return $defineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};
	return objectDefineProperty;
}

var createNonEnumerableProperty;
var hasRequiredCreateNonEnumerableProperty;

function requireCreateNonEnumerableProperty () {
	if (hasRequiredCreateNonEnumerableProperty) return createNonEnumerableProperty;
	hasRequiredCreateNonEnumerableProperty = 1;
	var DESCRIPTORS = requireDescriptors();
	var definePropertyModule = requireObjectDefineProperty();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();

	createNonEnumerableProperty = DESCRIPTORS ? function (object, key, value) {
	  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};
	return createNonEnumerableProperty;
}

var makeBuiltIn = {exports: {}};

var functionName;
var hasRequiredFunctionName;

function requireFunctionName () {
	if (hasRequiredFunctionName) return functionName;
	hasRequiredFunctionName = 1;
	var DESCRIPTORS = requireDescriptors();
	var hasOwn = requireHasOwnProperty();

	var FunctionPrototype = Function.prototype;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;

	var EXISTS = hasOwn(FunctionPrototype, 'name');
	// additional protection from minified / mangled / dropped function names
	var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
	var CONFIGURABLE = EXISTS && (!DESCRIPTORS || (DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable));

	functionName = {
	  EXISTS: EXISTS,
	  PROPER: PROPER,
	  CONFIGURABLE: CONFIGURABLE
	};
	return functionName;
}

var inspectSource;
var hasRequiredInspectSource;

function requireInspectSource () {
	if (hasRequiredInspectSource) return inspectSource;
	hasRequiredInspectSource = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var isCallable = requireIsCallable();
	var store = requireSharedStore();

	var functionToString = uncurryThis(Function.toString);

	// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
	if (!isCallable(store.inspectSource)) {
	  store.inspectSource = function (it) {
	    return functionToString(it);
	  };
	}

	inspectSource = store.inspectSource;
	return inspectSource;
}

var weakMapBasicDetection;
var hasRequiredWeakMapBasicDetection;

function requireWeakMapBasicDetection () {
	if (hasRequiredWeakMapBasicDetection) return weakMapBasicDetection;
	hasRequiredWeakMapBasicDetection = 1;
	var globalThis = requireGlobalThis();
	var isCallable = requireIsCallable();

	var WeakMap = globalThis.WeakMap;

	weakMapBasicDetection = isCallable(WeakMap) && /native code/.test(String(WeakMap));
	return weakMapBasicDetection;
}

var sharedKey;
var hasRequiredSharedKey;

function requireSharedKey () {
	if (hasRequiredSharedKey) return sharedKey;
	hasRequiredSharedKey = 1;
	var shared = requireShared();
	var uid = requireUid();

	var keys = shared('keys');

	sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};
	return sharedKey;
}

var hiddenKeys;
var hasRequiredHiddenKeys;

function requireHiddenKeys () {
	if (hasRequiredHiddenKeys) return hiddenKeys;
	hasRequiredHiddenKeys = 1;
	hiddenKeys = {};
	return hiddenKeys;
}

var internalState;
var hasRequiredInternalState;

function requireInternalState () {
	if (hasRequiredInternalState) return internalState;
	hasRequiredInternalState = 1;
	var NATIVE_WEAK_MAP = requireWeakMapBasicDetection();
	var globalThis = requireGlobalThis();
	var isObject = requireIsObject();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var hasOwn = requireHasOwnProperty();
	var shared = requireSharedStore();
	var sharedKey = requireSharedKey();
	var hiddenKeys = requireHiddenKeys();

	var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
	var TypeError = globalThis.TypeError;
	var WeakMap = globalThis.WeakMap;
	var set, get, has;

	var enforce = function (it) {
	  return has(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw new TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (NATIVE_WEAK_MAP || shared.state) {
	  var store = shared.state || (shared.state = new WeakMap());
	  /* eslint-disable no-self-assign -- prototype methods protection */
	  store.get = store.get;
	  store.has = store.has;
	  store.set = store.set;
	  /* eslint-enable no-self-assign -- prototype methods protection */
	  set = function (it, metadata) {
	    if (store.has(it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    store.set(it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return store.get(it) || {};
	  };
	  has = function (it) {
	    return store.has(it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return hasOwn(it, STATE) ? it[STATE] : {};
	  };
	  has = function (it) {
	    return hasOwn(it, STATE);
	  };
	}

	internalState = {
	  set: set,
	  get: get,
	  has: has,
	  enforce: enforce,
	  getterFor: getterFor
	};
	return internalState;
}

var hasRequiredMakeBuiltIn;

function requireMakeBuiltIn () {
	if (hasRequiredMakeBuiltIn) return makeBuiltIn.exports;
	hasRequiredMakeBuiltIn = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var fails = requireFails();
	var isCallable = requireIsCallable();
	var hasOwn = requireHasOwnProperty();
	var DESCRIPTORS = requireDescriptors();
	var CONFIGURABLE_FUNCTION_NAME = requireFunctionName().CONFIGURABLE;
	var inspectSource = requireInspectSource();
	var InternalStateModule = requireInternalState();

	var enforceInternalState = InternalStateModule.enforce;
	var getInternalState = InternalStateModule.get;
	var $String = String;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty = Object.defineProperty;
	var stringSlice = uncurryThis(''.slice);
	var replace = uncurryThis(''.replace);
	var join = uncurryThis([].join);

	var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails(function () {
	  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
	});

	var TEMPLATE = String(String).split('String');

	var makeBuiltIn$1 = makeBuiltIn.exports = function (value, name, options) {
	  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
	    name = '[' + replace($String(name), /^Symbol\(([^)]*)\).*$/, '$1') + ']';
	  }
	  if (options && options.getter) name = 'get ' + name;
	  if (options && options.setter) name = 'set ' + name;
	  if (!hasOwn(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
	    if (DESCRIPTORS) defineProperty(value, 'name', { value: name, configurable: true });
	    else value.name = name;
	  }
	  if (CONFIGURABLE_LENGTH && options && hasOwn(options, 'arity') && value.length !== options.arity) {
	    defineProperty(value, 'length', { value: options.arity });
	  }
	  try {
	    if (options && hasOwn(options, 'constructor') && options.constructor) {
	      if (DESCRIPTORS) defineProperty(value, 'prototype', { writable: false });
	    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
	    } else if (value.prototype) value.prototype = undefined;
	  } catch (error) { /* empty */ }
	  var state = enforceInternalState(value);
	  if (!hasOwn(state, 'source')) {
	    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
	  } return value;
	};

	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	// eslint-disable-next-line no-extend-native -- required
	Function.prototype.toString = makeBuiltIn$1(function toString() {
	  return isCallable(this) && getInternalState(this).source || inspectSource(this);
	}, 'toString');
	return makeBuiltIn.exports;
}

var defineBuiltIn;
var hasRequiredDefineBuiltIn;

function requireDefineBuiltIn () {
	if (hasRequiredDefineBuiltIn) return defineBuiltIn;
	hasRequiredDefineBuiltIn = 1;
	var isCallable = requireIsCallable();
	var definePropertyModule = requireObjectDefineProperty();
	var makeBuiltIn = requireMakeBuiltIn();
	var defineGlobalProperty = requireDefineGlobalProperty();

	defineBuiltIn = function (O, key, value, options) {
	  if (!options) options = {};
	  var simple = options.enumerable;
	  var name = options.name !== undefined ? options.name : key;
	  if (isCallable(value)) makeBuiltIn(value, name, options);
	  if (options.global) {
	    if (simple) O[key] = value;
	    else defineGlobalProperty(key, value);
	  } else {
	    try {
	      if (!options.unsafe) delete O[key];
	      else if (O[key]) simple = true;
	    } catch (error) { /* empty */ }
	    if (simple) O[key] = value;
	    else definePropertyModule.f(O, key, {
	      value: value,
	      enumerable: false,
	      configurable: !options.nonConfigurable,
	      writable: !options.nonWritable
	    });
	  } return O;
	};
	return defineBuiltIn;
}

var objectGetOwnPropertyNames = {};

var mathTrunc;
var hasRequiredMathTrunc;

function requireMathTrunc () {
	if (hasRequiredMathTrunc) return mathTrunc;
	hasRequiredMathTrunc = 1;
	var ceil = Math.ceil;
	var floor = Math.floor;

	// `Math.trunc` method
	// https://tc39.es/ecma262/#sec-math.trunc
	// eslint-disable-next-line es/no-math-trunc -- safe
	mathTrunc = Math.trunc || function trunc(x) {
	  var n = +x;
	  return (n > 0 ? floor : ceil)(n);
	};
	return mathTrunc;
}

var toIntegerOrInfinity;
var hasRequiredToIntegerOrInfinity;

function requireToIntegerOrInfinity () {
	if (hasRequiredToIntegerOrInfinity) return toIntegerOrInfinity;
	hasRequiredToIntegerOrInfinity = 1;
	var trunc = requireMathTrunc();

	// `ToIntegerOrInfinity` abstract operation
	// https://tc39.es/ecma262/#sec-tointegerorinfinity
	toIntegerOrInfinity = function (argument) {
	  var number = +argument;
	  // eslint-disable-next-line no-self-compare -- NaN check
	  return number !== number || number === 0 ? 0 : trunc(number);
	};
	return toIntegerOrInfinity;
}

var toAbsoluteIndex;
var hasRequiredToAbsoluteIndex;

function requireToAbsoluteIndex () {
	if (hasRequiredToAbsoluteIndex) return toAbsoluteIndex;
	hasRequiredToAbsoluteIndex = 1;
	var toIntegerOrInfinity = requireToIntegerOrInfinity();

	var max = Math.max;
	var min = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	toAbsoluteIndex = function (index, length) {
	  var integer = toIntegerOrInfinity(index);
	  return integer < 0 ? max(integer + length, 0) : min(integer, length);
	};
	return toAbsoluteIndex;
}

var toLength;
var hasRequiredToLength;

function requireToLength () {
	if (hasRequiredToLength) return toLength;
	hasRequiredToLength = 1;
	var toIntegerOrInfinity = requireToIntegerOrInfinity();

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	toLength = function (argument) {
	  var len = toIntegerOrInfinity(argument);
	  return len > 0 ? min(len, 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};
	return toLength;
}

var lengthOfArrayLike;
var hasRequiredLengthOfArrayLike;

function requireLengthOfArrayLike () {
	if (hasRequiredLengthOfArrayLike) return lengthOfArrayLike;
	hasRequiredLengthOfArrayLike = 1;
	var toLength = requireToLength();

	// `LengthOfArrayLike` abstract operation
	// https://tc39.es/ecma262/#sec-lengthofarraylike
	lengthOfArrayLike = function (obj) {
	  return toLength(obj.length);
	};
	return lengthOfArrayLike;
}

var arrayIncludes;
var hasRequiredArrayIncludes;

function requireArrayIncludes () {
	if (hasRequiredArrayIncludes) return arrayIncludes;
	hasRequiredArrayIncludes = 1;
	var toIndexedObject = requireToIndexedObject();
	var toAbsoluteIndex = requireToAbsoluteIndex();
	var lengthOfArrayLike = requireLengthOfArrayLike();

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = lengthOfArrayLike(O);
	    if (length === 0) return !IS_INCLUDES && -1;
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (IS_INCLUDES && el !== el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare -- NaN check
	      if (value !== value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.es/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.es/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};
	return arrayIncludes;
}

var objectKeysInternal;
var hasRequiredObjectKeysInternal;

function requireObjectKeysInternal () {
	if (hasRequiredObjectKeysInternal) return objectKeysInternal;
	hasRequiredObjectKeysInternal = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var hasOwn = requireHasOwnProperty();
	var toIndexedObject = requireToIndexedObject();
	var indexOf = requireArrayIncludes().indexOf;
	var hiddenKeys = requireHiddenKeys();

	var push = uncurryThis([].push);

	objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (hasOwn(O, key = names[i++])) {
	    ~indexOf(result, key) || push(result, key);
	  }
	  return result;
	};
	return objectKeysInternal;
}

var enumBugKeys;
var hasRequiredEnumBugKeys;

function requireEnumBugKeys () {
	if (hasRequiredEnumBugKeys) return enumBugKeys;
	hasRequiredEnumBugKeys = 1;
	// IE8- don't enum bug keys
	enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];
	return enumBugKeys;
}

var hasRequiredObjectGetOwnPropertyNames;

function requireObjectGetOwnPropertyNames () {
	if (hasRequiredObjectGetOwnPropertyNames) return objectGetOwnPropertyNames;
	hasRequiredObjectGetOwnPropertyNames = 1;
	var internalObjectKeys = requireObjectKeysInternal();
	var enumBugKeys = requireEnumBugKeys();

	var hiddenKeys = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	// eslint-disable-next-line es/no-object-getownpropertynames -- safe
	objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return internalObjectKeys(O, hiddenKeys);
	};
	return objectGetOwnPropertyNames;
}

var objectGetOwnPropertySymbols = {};

var hasRequiredObjectGetOwnPropertySymbols;

function requireObjectGetOwnPropertySymbols () {
	if (hasRequiredObjectGetOwnPropertySymbols) return objectGetOwnPropertySymbols;
	hasRequiredObjectGetOwnPropertySymbols = 1;
	// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
	objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;
	return objectGetOwnPropertySymbols;
}

var ownKeys;
var hasRequiredOwnKeys;

function requireOwnKeys () {
	if (hasRequiredOwnKeys) return ownKeys;
	hasRequiredOwnKeys = 1;
	var getBuiltIn = requireGetBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var getOwnPropertyNamesModule = requireObjectGetOwnPropertyNames();
	var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
	var anObject = requireAnObject();

	var concat = uncurryThis([].concat);

	// all object keys, includes non-enumerable and symbols
	ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = getOwnPropertyNamesModule.f(anObject(it));
	  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
	  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
	};
	return ownKeys;
}

var copyConstructorProperties;
var hasRequiredCopyConstructorProperties;

function requireCopyConstructorProperties () {
	if (hasRequiredCopyConstructorProperties) return copyConstructorProperties;
	hasRequiredCopyConstructorProperties = 1;
	var hasOwn = requireHasOwnProperty();
	var ownKeys = requireOwnKeys();
	var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
	var definePropertyModule = requireObjectDefineProperty();

	copyConstructorProperties = function (target, source, exceptions) {
	  var keys = ownKeys(source);
	  var defineProperty = definePropertyModule.f;
	  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
	      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	    }
	  }
	};
	return copyConstructorProperties;
}

var isForced_1;
var hasRequiredIsForced;

function requireIsForced () {
	if (hasRequiredIsForced) return isForced_1;
	hasRequiredIsForced = 1;
	var fails = requireFails();
	var isCallable = requireIsCallable();

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value === POLYFILL ? true
	    : value === NATIVE ? false
	    : isCallable(detection) ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	isForced_1 = isForced;
	return isForced_1;
}

var _export;
var hasRequired_export;

function require_export () {
	if (hasRequired_export) return _export;
	hasRequired_export = 1;
	var globalThis = requireGlobalThis();
	var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var defineBuiltIn = requireDefineBuiltIn();
	var defineGlobalProperty = requireDefineGlobalProperty();
	var copyConstructorProperties = requireCopyConstructorProperties();
	var isForced = requireIsForced();

	/*
	  options.target         - name of the target object
	  options.global         - target is the global object
	  options.stat           - export as static methods of target
	  options.proto          - export as prototype methods of target
	  options.real           - real prototype method for the `pure` version
	  options.forced         - export even if the native feature is available
	  options.bind           - bind methods to the target, required for the `pure` version
	  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
	  options.sham           - add a flag to not completely full polyfills
	  options.enumerable     - export as enumerable property
	  options.dontCallGetSet - prevent calling a getter on target
	  options.name           - the .name of the function if it does not match the key
	*/
	_export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = globalThis;
	  } else if (STATIC) {
	    target = globalThis[TARGET] || defineGlobalProperty(TARGET, {});
	  } else {
	    target = globalThis[TARGET] && globalThis[TARGET].prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.dontCallGetSet) {
	      descriptor = getOwnPropertyDescriptor(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty == typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    }
	    defineBuiltIn(target, key, sourceProperty, options);
	  }
	};
	return _export;
}

var toStringTagSupport;
var hasRequiredToStringTagSupport;

function requireToStringTagSupport () {
	if (hasRequiredToStringTagSupport) return toStringTagSupport;
	hasRequiredToStringTagSupport = 1;
	var wellKnownSymbol = requireWellKnownSymbol();

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var test = {};

	test[TO_STRING_TAG] = 'z';

	toStringTagSupport = String(test) === '[object z]';
	return toStringTagSupport;
}

var classof;
var hasRequiredClassof;

function requireClassof () {
	if (hasRequiredClassof) return classof;
	hasRequiredClassof = 1;
	var TO_STRING_TAG_SUPPORT = requireToStringTagSupport();
	var isCallable = requireIsCallable();
	var classofRaw = requireClassofRaw();
	var wellKnownSymbol = requireWellKnownSymbol();

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var $Object = Object;

	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	classof = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
	};
	return classof;
}

var toString;
var hasRequiredToString;

function requireToString () {
	if (hasRequiredToString) return toString;
	hasRequiredToString = 1;
	var classof = requireClassof();

	var $String = String;

	toString = function (argument) {
	  if (classof(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
	  return $String(argument);
	};
	return toString;
}

var objectDefineProperties = {};

var objectKeys;
var hasRequiredObjectKeys;

function requireObjectKeys () {
	if (hasRequiredObjectKeys) return objectKeys;
	hasRequiredObjectKeys = 1;
	var internalObjectKeys = requireObjectKeysInternal();
	var enumBugKeys = requireEnumBugKeys();

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	// eslint-disable-next-line es/no-object-keys -- safe
	objectKeys = Object.keys || function keys(O) {
	  return internalObjectKeys(O, enumBugKeys);
	};
	return objectKeys;
}

var hasRequiredObjectDefineProperties;

function requireObjectDefineProperties () {
	if (hasRequiredObjectDefineProperties) return objectDefineProperties;
	hasRequiredObjectDefineProperties = 1;
	var DESCRIPTORS = requireDescriptors();
	var V8_PROTOTYPE_DEFINE_BUG = requireV8PrototypeDefineBug();
	var definePropertyModule = requireObjectDefineProperty();
	var anObject = requireAnObject();
	var toIndexedObject = requireToIndexedObject();
	var objectKeys = requireObjectKeys();

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	// eslint-disable-next-line es/no-object-defineproperties -- safe
	objectDefineProperties.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var props = toIndexedObject(Properties);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
	  return O;
	};
	return objectDefineProperties;
}

var html;
var hasRequiredHtml;

function requireHtml () {
	if (hasRequiredHtml) return html;
	hasRequiredHtml = 1;
	var getBuiltIn = requireGetBuiltIn();

	html = getBuiltIn('document', 'documentElement');
	return html;
}

var objectCreate;
var hasRequiredObjectCreate;

function requireObjectCreate () {
	if (hasRequiredObjectCreate) return objectCreate;
	hasRequiredObjectCreate = 1;
	/* global ActiveXObject -- old IE, WSH */
	var anObject = requireAnObject();
	var definePropertiesModule = requireObjectDefineProperties();
	var enumBugKeys = requireEnumBugKeys();
	var hiddenKeys = requireHiddenKeys();
	var html = requireHtml();
	var documentCreateElement = requireDocumentCreateElement();
	var sharedKey = requireSharedKey();

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  // eslint-disable-next-line no-useless-assignment -- avoid memory leak
	  activeXDocument = null;
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    activeXDocument = new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = typeof document != 'undefined'
	    ? document.domain && activeXDocument
	      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
	      : NullProtoObjectViaIFrame()
	    : NullProtoObjectViaActiveX(activeXDocument); // WSH
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true;

	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	// eslint-disable-next-line es/no-object-create -- safe
	objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
	};
	return objectCreate;
}

var objectGetOwnPropertyNamesExternal = {};

var arraySlice;
var hasRequiredArraySlice;

function requireArraySlice () {
	if (hasRequiredArraySlice) return arraySlice;
	hasRequiredArraySlice = 1;
	var uncurryThis = requireFunctionUncurryThis();

	arraySlice = uncurryThis([].slice);
	return arraySlice;
}

var hasRequiredObjectGetOwnPropertyNamesExternal;

function requireObjectGetOwnPropertyNamesExternal () {
	if (hasRequiredObjectGetOwnPropertyNamesExternal) return objectGetOwnPropertyNamesExternal;
	hasRequiredObjectGetOwnPropertyNamesExternal = 1;
	/* eslint-disable es/no-object-getownpropertynames -- safe */
	var classof = requireClassofRaw();
	var toIndexedObject = requireToIndexedObject();
	var $getOwnPropertyNames = requireObjectGetOwnPropertyNames().f;
	var arraySlice = requireArraySlice();

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return $getOwnPropertyNames(it);
	  } catch (error) {
	    return arraySlice(windowNames);
	  }
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
	  return windowNames && classof(it) === 'Window'
	    ? getWindowNames(it)
	    : $getOwnPropertyNames(toIndexedObject(it));
	};
	return objectGetOwnPropertyNamesExternal;
}

var defineBuiltInAccessor;
var hasRequiredDefineBuiltInAccessor;

function requireDefineBuiltInAccessor () {
	if (hasRequiredDefineBuiltInAccessor) return defineBuiltInAccessor;
	hasRequiredDefineBuiltInAccessor = 1;
	var makeBuiltIn = requireMakeBuiltIn();
	var defineProperty = requireObjectDefineProperty();

	defineBuiltInAccessor = function (target, name, descriptor) {
	  if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
	  if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
	  return defineProperty.f(target, name, descriptor);
	};
	return defineBuiltInAccessor;
}

var wellKnownSymbolWrapped = {};

var hasRequiredWellKnownSymbolWrapped;

function requireWellKnownSymbolWrapped () {
	if (hasRequiredWellKnownSymbolWrapped) return wellKnownSymbolWrapped;
	hasRequiredWellKnownSymbolWrapped = 1;
	var wellKnownSymbol = requireWellKnownSymbol();

	wellKnownSymbolWrapped.f = wellKnownSymbol;
	return wellKnownSymbolWrapped;
}

var path;
var hasRequiredPath;

function requirePath () {
	if (hasRequiredPath) return path;
	hasRequiredPath = 1;
	var globalThis = requireGlobalThis();

	path = globalThis;
	return path;
}

var wellKnownSymbolDefine;
var hasRequiredWellKnownSymbolDefine;

function requireWellKnownSymbolDefine () {
	if (hasRequiredWellKnownSymbolDefine) return wellKnownSymbolDefine;
	hasRequiredWellKnownSymbolDefine = 1;
	var path = requirePath();
	var hasOwn = requireHasOwnProperty();
	var wrappedWellKnownSymbolModule = requireWellKnownSymbolWrapped();
	var defineProperty = requireObjectDefineProperty().f;

	wellKnownSymbolDefine = function (NAME) {
	  var Symbol = path.Symbol || (path.Symbol = {});
	  if (!hasOwn(Symbol, NAME)) defineProperty(Symbol, NAME, {
	    value: wrappedWellKnownSymbolModule.f(NAME)
	  });
	};
	return wellKnownSymbolDefine;
}

var symbolDefineToPrimitive;
var hasRequiredSymbolDefineToPrimitive;

function requireSymbolDefineToPrimitive () {
	if (hasRequiredSymbolDefineToPrimitive) return symbolDefineToPrimitive;
	hasRequiredSymbolDefineToPrimitive = 1;
	var call = requireFunctionCall();
	var getBuiltIn = requireGetBuiltIn();
	var wellKnownSymbol = requireWellKnownSymbol();
	var defineBuiltIn = requireDefineBuiltIn();

	symbolDefineToPrimitive = function () {
	  var Symbol = getBuiltIn('Symbol');
	  var SymbolPrototype = Symbol && Symbol.prototype;
	  var valueOf = SymbolPrototype && SymbolPrototype.valueOf;
	  var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

	  if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
	    // `Symbol.prototype[@@toPrimitive]` method
	    // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
	    // eslint-disable-next-line no-unused-vars -- required for .length
	    defineBuiltIn(SymbolPrototype, TO_PRIMITIVE, function (hint) {
	      return call(valueOf, this);
	    }, { arity: 1 });
	  }
	};
	return symbolDefineToPrimitive;
}

var setToStringTag;
var hasRequiredSetToStringTag;

function requireSetToStringTag () {
	if (hasRequiredSetToStringTag) return setToStringTag;
	hasRequiredSetToStringTag = 1;
	var defineProperty = requireObjectDefineProperty().f;
	var hasOwn = requireHasOwnProperty();
	var wellKnownSymbol = requireWellKnownSymbol();

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	setToStringTag = function (target, TAG, STATIC) {
	  if (target && !STATIC) target = target.prototype;
	  if (target && !hasOwn(target, TO_STRING_TAG)) {
	    defineProperty(target, TO_STRING_TAG, { configurable: true, value: TAG });
	  }
	};
	return setToStringTag;
}

var functionUncurryThisClause;
var hasRequiredFunctionUncurryThisClause;

function requireFunctionUncurryThisClause () {
	if (hasRequiredFunctionUncurryThisClause) return functionUncurryThisClause;
	hasRequiredFunctionUncurryThisClause = 1;
	var classofRaw = requireClassofRaw();
	var uncurryThis = requireFunctionUncurryThis();

	functionUncurryThisClause = function (fn) {
	  // Nashorn bug:
	  //   https://github.com/zloirock/core-js/issues/1128
	  //   https://github.com/zloirock/core-js/issues/1130
	  if (classofRaw(fn) === 'Function') return uncurryThis(fn);
	};
	return functionUncurryThisClause;
}

var functionBindContext;
var hasRequiredFunctionBindContext;

function requireFunctionBindContext () {
	if (hasRequiredFunctionBindContext) return functionBindContext;
	hasRequiredFunctionBindContext = 1;
	var uncurryThis = requireFunctionUncurryThisClause();
	var aCallable = requireACallable();
	var NATIVE_BIND = requireFunctionBindNative();

	var bind = uncurryThis(uncurryThis.bind);

	// optional / simple context binding
	functionBindContext = function (fn, that) {
	  aCallable(fn);
	  return that === undefined ? fn : NATIVE_BIND ? bind(fn, that) : function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};
	return functionBindContext;
}

var isArray;
var hasRequiredIsArray;

function requireIsArray () {
	if (hasRequiredIsArray) return isArray;
	hasRequiredIsArray = 1;
	var classof = requireClassofRaw();

	// `IsArray` abstract operation
	// https://tc39.es/ecma262/#sec-isarray
	// eslint-disable-next-line es/no-array-isarray -- safe
	isArray = Array.isArray || function isArray(argument) {
	  return classof(argument) === 'Array';
	};
	return isArray;
}

var isConstructor;
var hasRequiredIsConstructor;

function requireIsConstructor () {
	if (hasRequiredIsConstructor) return isConstructor;
	hasRequiredIsConstructor = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var fails = requireFails();
	var isCallable = requireIsCallable();
	var classof = requireClassof();
	var getBuiltIn = requireGetBuiltIn();
	var inspectSource = requireInspectSource();

	var noop = function () { /* empty */ };
	var construct = getBuiltIn('Reflect', 'construct');
	var constructorRegExp = /^\s*(?:class|function)\b/;
	var exec = uncurryThis(constructorRegExp.exec);
	var INCORRECT_TO_STRING = !constructorRegExp.test(noop);

	var isConstructorModern = function isConstructor(argument) {
	  if (!isCallable(argument)) return false;
	  try {
	    construct(noop, [], argument);
	    return true;
	  } catch (error) {
	    return false;
	  }
	};

	var isConstructorLegacy = function isConstructor(argument) {
	  if (!isCallable(argument)) return false;
	  switch (classof(argument)) {
	    case 'AsyncFunction':
	    case 'GeneratorFunction':
	    case 'AsyncGeneratorFunction': return false;
	  }
	  try {
	    // we can't check .prototype since constructors produced by .bind haven't it
	    // `Function#toString` throws on some built-it function in some legacy engines
	    // (for example, `DOMQuad` and similar in FF41-)
	    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
	  } catch (error) {
	    return true;
	  }
	};

	isConstructorLegacy.sham = true;

	// `IsConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-isconstructor
	isConstructor = !construct || fails(function () {
	  var called;
	  return isConstructorModern(isConstructorModern.call)
	    || !isConstructorModern(Object)
	    || !isConstructorModern(function () { called = true; })
	    || called;
	}) ? isConstructorLegacy : isConstructorModern;
	return isConstructor;
}

var arraySpeciesConstructor;
var hasRequiredArraySpeciesConstructor;

function requireArraySpeciesConstructor () {
	if (hasRequiredArraySpeciesConstructor) return arraySpeciesConstructor;
	hasRequiredArraySpeciesConstructor = 1;
	var isArray = requireIsArray();
	var isConstructor = requireIsConstructor();
	var isObject = requireIsObject();
	var wellKnownSymbol = requireWellKnownSymbol();

	var SPECIES = wellKnownSymbol('species');
	var $Array = Array;

	// a part of `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	arraySpeciesConstructor = function (originalArray) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (isConstructor(C) && (C === $Array || isArray(C.prototype))) C = undefined;
	    else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return C === undefined ? $Array : C;
	};
	return arraySpeciesConstructor;
}

var arraySpeciesCreate;
var hasRequiredArraySpeciesCreate;

function requireArraySpeciesCreate () {
	if (hasRequiredArraySpeciesCreate) return arraySpeciesCreate;
	hasRequiredArraySpeciesCreate = 1;
	var arraySpeciesConstructor = requireArraySpeciesConstructor();

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	arraySpeciesCreate = function (originalArray, length) {
	  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
	};
	return arraySpeciesCreate;
}

var arrayIteration;
var hasRequiredArrayIteration;

function requireArrayIteration () {
	if (hasRequiredArrayIteration) return arrayIteration;
	hasRequiredArrayIteration = 1;
	var bind = requireFunctionBindContext();
	var uncurryThis = requireFunctionUncurryThis();
	var IndexedObject = requireIndexedObject();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var arraySpeciesCreate = requireArraySpeciesCreate();

	var push = uncurryThis([].push);

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
	var createMethod = function (TYPE) {
	  var IS_MAP = TYPE === 1;
	  var IS_FILTER = TYPE === 2;
	  var IS_SOME = TYPE === 3;
	  var IS_EVERY = TYPE === 4;
	  var IS_FIND_INDEX = TYPE === 6;
	  var IS_FILTER_REJECT = TYPE === 7;
	  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = IndexedObject(O);
	    var length = lengthOfArrayLike(self);
	    var boundFunction = bind(callbackfn, that);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push(target, value);      // filter
	        } else switch (TYPE) {
	          case 4: return false;             // every
	          case 7: push(target, value);      // filterReject
	        }
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.es/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod(0),
	  // `Array.prototype.map` method
	  // https://tc39.es/ecma262/#sec-array.prototype.map
	  map: createMethod(1),
	  // `Array.prototype.filter` method
	  // https://tc39.es/ecma262/#sec-array.prototype.filter
	  filter: createMethod(2),
	  // `Array.prototype.some` method
	  // https://tc39.es/ecma262/#sec-array.prototype.some
	  some: createMethod(3),
	  // `Array.prototype.every` method
	  // https://tc39.es/ecma262/#sec-array.prototype.every
	  every: createMethod(4),
	  // `Array.prototype.find` method
	  // https://tc39.es/ecma262/#sec-array.prototype.find
	  find: createMethod(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod(6),
	  // `Array.prototype.filterReject` method
	  // https://github.com/tc39/proposal-array-filtering
	  filterReject: createMethod(7)
	};
	return arrayIteration;
}

var hasRequiredEs_symbol_constructor;

function requireEs_symbol_constructor () {
	if (hasRequiredEs_symbol_constructor) return es_symbol_constructor;
	hasRequiredEs_symbol_constructor = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var IS_PURE = requireIsPure();
	var DESCRIPTORS = requireDescriptors();
	var NATIVE_SYMBOL = requireSymbolConstructorDetection();
	var fails = requireFails();
	var hasOwn = requireHasOwnProperty();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var anObject = requireAnObject();
	var toIndexedObject = requireToIndexedObject();
	var toPropertyKey = requireToPropertyKey();
	var $toString = requireToString();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();
	var nativeObjectCreate = requireObjectCreate();
	var objectKeys = requireObjectKeys();
	var getOwnPropertyNamesModule = requireObjectGetOwnPropertyNames();
	var getOwnPropertyNamesExternal = requireObjectGetOwnPropertyNamesExternal();
	var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
	var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
	var definePropertyModule = requireObjectDefineProperty();
	var definePropertiesModule = requireObjectDefineProperties();
	var propertyIsEnumerableModule = requireObjectPropertyIsEnumerable();
	var defineBuiltIn = requireDefineBuiltIn();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var shared = requireShared();
	var sharedKey = requireSharedKey();
	var hiddenKeys = requireHiddenKeys();
	var uid = requireUid();
	var wellKnownSymbol = requireWellKnownSymbol();
	var wrappedWellKnownSymbolModule = requireWellKnownSymbolWrapped();
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();
	var defineSymbolToPrimitive = requireSymbolDefineToPrimitive();
	var setToStringTag = requireSetToStringTag();
	var InternalStateModule = requireInternalState();
	var $forEach = requireArrayIteration().forEach;

	var HIDDEN = sharedKey('hidden');
	var SYMBOL = 'Symbol';
	var PROTOTYPE = 'prototype';

	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(SYMBOL);

	var ObjectPrototype = Object[PROTOTYPE];
	var $Symbol = globalThis.Symbol;
	var SymbolPrototype = $Symbol && $Symbol[PROTOTYPE];
	var RangeError = globalThis.RangeError;
	var TypeError = globalThis.TypeError;
	var QObject = globalThis.QObject;
	var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
	var nativeDefineProperty = definePropertyModule.f;
	var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
	var nativePropertyIsEnumerable = propertyIsEnumerableModule.f;
	var push = uncurryThis([].push);

	var AllSymbols = shared('symbols');
	var ObjectPrototypeSymbols = shared('op-symbols');
	var WellKnownSymbolsStore = shared('wks');

	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var USE_SETTER = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var fallbackDefineProperty = function (O, P, Attributes) {
	  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor(ObjectPrototype, P);
	  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
	  nativeDefineProperty(O, P, Attributes);
	  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
	    nativeDefineProperty(ObjectPrototype, P, ObjectPrototypeDescriptor);
	  }
	};

	var setSymbolDescriptor = DESCRIPTORS && fails(function () {
	  return nativeObjectCreate(nativeDefineProperty({}, 'a', {
	    get: function () { return nativeDefineProperty(this, 'a', { value: 7 }).a; }
	  })).a !== 7;
	}) ? fallbackDefineProperty : nativeDefineProperty;

	var wrap = function (tag, description) {
	  var symbol = AllSymbols[tag] = nativeObjectCreate(SymbolPrototype);
	  setInternalState(symbol, {
	    type: SYMBOL,
	    tag: tag,
	    description: description
	  });
	  if (!DESCRIPTORS) symbol.description = description;
	  return symbol;
	};

	var $defineProperty = function defineProperty(O, P, Attributes) {
	  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
	  anObject(O);
	  var key = toPropertyKey(P);
	  anObject(Attributes);
	  if (hasOwn(AllSymbols, key)) {
	    if (!Attributes.enumerable) {
	      if (!hasOwn(O, HIDDEN)) nativeDefineProperty(O, HIDDEN, createPropertyDescriptor(1, nativeObjectCreate(null)));
	      O[HIDDEN][key] = true;
	    } else {
	      if (hasOwn(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
	      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor(0, false) });
	    } return setSymbolDescriptor(O, key, Attributes);
	  } return nativeDefineProperty(O, key, Attributes);
	};

	var $defineProperties = function defineProperties(O, Properties) {
	  anObject(O);
	  var properties = toIndexedObject(Properties);
	  var keys = objectKeys(properties).concat($getOwnPropertySymbols(properties));
	  $forEach(keys, function (key) {
	    if (!DESCRIPTORS || call($propertyIsEnumerable, properties, key)) $defineProperty(O, key, properties[key]);
	  });
	  return O;
	};

	var $create = function create(O, Properties) {
	  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
	};

	var $propertyIsEnumerable = function propertyIsEnumerable(V) {
	  var P = toPropertyKey(V);
	  var enumerable = call(nativePropertyIsEnumerable, this, P);
	  if (this === ObjectPrototype && hasOwn(AllSymbols, P) && !hasOwn(ObjectPrototypeSymbols, P)) return false;
	  return enumerable || !hasOwn(this, P) || !hasOwn(AllSymbols, P) || hasOwn(this, HIDDEN) && this[HIDDEN][P]
	    ? enumerable : true;
	};

	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
	  var it = toIndexedObject(O);
	  var key = toPropertyKey(P);
	  if (it === ObjectPrototype && hasOwn(AllSymbols, key) && !hasOwn(ObjectPrototypeSymbols, key)) return;
	  var descriptor = nativeGetOwnPropertyDescriptor(it, key);
	  if (descriptor && hasOwn(AllSymbols, key) && !(hasOwn(it, HIDDEN) && it[HIDDEN][key])) {
	    descriptor.enumerable = true;
	  }
	  return descriptor;
	};

	var $getOwnPropertyNames = function getOwnPropertyNames(O) {
	  var names = nativeGetOwnPropertyNames(toIndexedObject(O));
	  var result = [];
	  $forEach(names, function (key) {
	    if (!hasOwn(AllSymbols, key) && !hasOwn(hiddenKeys, key)) push(result, key);
	  });
	  return result;
	};

	var $getOwnPropertySymbols = function (O) {
	  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
	  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject(O));
	  var result = [];
	  $forEach(names, function (key) {
	    if (hasOwn(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwn(ObjectPrototype, key))) {
	      push(result, AllSymbols[key]);
	    }
	  });
	  return result;
	};

	// `Symbol` constructor
	// https://tc39.es/ecma262/#sec-symbol-constructor
	if (!NATIVE_SYMBOL) {
	  $Symbol = function Symbol() {
	    if (isPrototypeOf(SymbolPrototype, this)) throw new TypeError('Symbol is not a constructor');
	    var description = !arguments.length || arguments[0] === undefined ? undefined : $toString(arguments[0]);
	    var tag = uid(description);
	    var setter = function (value) {
	      var $this = this === undefined ? globalThis : this;
	      if ($this === ObjectPrototype) call(setter, ObjectPrototypeSymbols, value);
	      if (hasOwn($this, HIDDEN) && hasOwn($this[HIDDEN], tag)) $this[HIDDEN][tag] = false;
	      var descriptor = createPropertyDescriptor(1, value);
	      try {
	        setSymbolDescriptor($this, tag, descriptor);
	      } catch (error) {
	        if (!(error instanceof RangeError)) throw error;
	        fallbackDefineProperty($this, tag, descriptor);
	      }
	    };
	    if (DESCRIPTORS && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
	    return wrap(tag, description);
	  };

	  SymbolPrototype = $Symbol[PROTOTYPE];

	  defineBuiltIn(SymbolPrototype, 'toString', function toString() {
	    return getInternalState(this).tag;
	  });

	  defineBuiltIn($Symbol, 'withoutSetter', function (description) {
	    return wrap(uid(description), description);
	  });

	  propertyIsEnumerableModule.f = $propertyIsEnumerable;
	  definePropertyModule.f = $defineProperty;
	  definePropertiesModule.f = $defineProperties;
	  getOwnPropertyDescriptorModule.f = $getOwnPropertyDescriptor;
	  getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
	  getOwnPropertySymbolsModule.f = $getOwnPropertySymbols;

	  wrappedWellKnownSymbolModule.f = function (name) {
	    return wrap(wellKnownSymbol(name), name);
	  };

	  if (DESCRIPTORS) {
	    // https://github.com/tc39/proposal-Symbol-description
	    defineBuiltInAccessor(SymbolPrototype, 'description', {
	      configurable: true,
	      get: function description() {
	        return getInternalState(this).description;
	      }
	    });
	    if (!IS_PURE) {
	      defineBuiltIn(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
	    }
	  }
	}

	$({ global: true, constructor: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
	  Symbol: $Symbol
	});

	$forEach(objectKeys(WellKnownSymbolsStore), function (name) {
	  defineWellKnownSymbol(name);
	});

	$({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
	  useSetter: function () { USE_SETTER = true; },
	  useSimple: function () { USE_SETTER = false; }
	});

	$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS }, {
	  // `Object.create` method
	  // https://tc39.es/ecma262/#sec-object.create
	  create: $create,
	  // `Object.defineProperty` method
	  // https://tc39.es/ecma262/#sec-object.defineproperty
	  defineProperty: $defineProperty,
	  // `Object.defineProperties` method
	  // https://tc39.es/ecma262/#sec-object.defineproperties
	  defineProperties: $defineProperties,
	  // `Object.getOwnPropertyDescriptor` method
	  // https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor
	});

	$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL }, {
	  // `Object.getOwnPropertyNames` method
	  // https://tc39.es/ecma262/#sec-object.getownpropertynames
	  getOwnPropertyNames: $getOwnPropertyNames
	});

	// `Symbol.prototype[@@toPrimitive]` method
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
	defineSymbolToPrimitive();

	// `Symbol.prototype[@@toStringTag]` property
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
	setToStringTag($Symbol, SYMBOL);

	hiddenKeys[HIDDEN] = true;
	return es_symbol_constructor;
}

var es_symbol_for = {};

var symbolRegistryDetection;
var hasRequiredSymbolRegistryDetection;

function requireSymbolRegistryDetection () {
	if (hasRequiredSymbolRegistryDetection) return symbolRegistryDetection;
	hasRequiredSymbolRegistryDetection = 1;
	var NATIVE_SYMBOL = requireSymbolConstructorDetection();

	/* eslint-disable es/no-symbol -- safe */
	symbolRegistryDetection = NATIVE_SYMBOL && !!Symbol['for'] && !!Symbol.keyFor;
	return symbolRegistryDetection;
}

var hasRequiredEs_symbol_for;

function requireEs_symbol_for () {
	if (hasRequiredEs_symbol_for) return es_symbol_for;
	hasRequiredEs_symbol_for = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var hasOwn = requireHasOwnProperty();
	var toString = requireToString();
	var shared = requireShared();
	var NATIVE_SYMBOL_REGISTRY = requireSymbolRegistryDetection();

	var StringToSymbolRegistry = shared('string-to-symbol-registry');
	var SymbolToStringRegistry = shared('symbol-to-string-registry');

	// `Symbol.for` method
	// https://tc39.es/ecma262/#sec-symbol.for
	$({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
	  'for': function (key) {
	    var string = toString(key);
	    if (hasOwn(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
	    var symbol = getBuiltIn('Symbol')(string);
	    StringToSymbolRegistry[string] = symbol;
	    SymbolToStringRegistry[symbol] = string;
	    return symbol;
	  }
	});
	return es_symbol_for;
}

var es_symbol_keyFor = {};

var hasRequiredEs_symbol_keyFor;

function requireEs_symbol_keyFor () {
	if (hasRequiredEs_symbol_keyFor) return es_symbol_keyFor;
	hasRequiredEs_symbol_keyFor = 1;
	var $ = require_export();
	var hasOwn = requireHasOwnProperty();
	var isSymbol = requireIsSymbol();
	var tryToString = requireTryToString();
	var shared = requireShared();
	var NATIVE_SYMBOL_REGISTRY = requireSymbolRegistryDetection();

	var SymbolToStringRegistry = shared('symbol-to-string-registry');

	// `Symbol.keyFor` method
	// https://tc39.es/ecma262/#sec-symbol.keyfor
	$({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw new TypeError(tryToString(sym) + ' is not a symbol');
	    if (hasOwn(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
	  }
	});
	return es_symbol_keyFor;
}

var es_json_stringify = {};

var functionApply;
var hasRequiredFunctionApply;

function requireFunctionApply () {
	if (hasRequiredFunctionApply) return functionApply;
	hasRequiredFunctionApply = 1;
	var NATIVE_BIND = requireFunctionBindNative();

	var FunctionPrototype = Function.prototype;
	var apply = FunctionPrototype.apply;
	var call = FunctionPrototype.call;

	// eslint-disable-next-line es/no-reflect -- safe
	functionApply = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function () {
	  return call.apply(apply, arguments);
	});
	return functionApply;
}

var getJsonReplacerFunction;
var hasRequiredGetJsonReplacerFunction;

function requireGetJsonReplacerFunction () {
	if (hasRequiredGetJsonReplacerFunction) return getJsonReplacerFunction;
	hasRequiredGetJsonReplacerFunction = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var isArray = requireIsArray();
	var isCallable = requireIsCallable();
	var classof = requireClassofRaw();
	var toString = requireToString();

	var push = uncurryThis([].push);

	getJsonReplacerFunction = function (replacer) {
	  if (isCallable(replacer)) return replacer;
	  if (!isArray(replacer)) return;
	  var rawLength = replacer.length;
	  var keys = [];
	  for (var i = 0; i < rawLength; i++) {
	    var element = replacer[i];
	    if (typeof element == 'string') push(keys, element);
	    else if (typeof element == 'number' || classof(element) === 'Number' || classof(element) === 'String') push(keys, toString(element));
	  }
	  var keysLength = keys.length;
	  var root = true;
	  return function (key, value) {
	    if (root) {
	      root = false;
	      return value;
	    }
	    if (isArray(this)) return value;
	    for (var j = 0; j < keysLength; j++) if (keys[j] === key) return value;
	  };
	};
	return getJsonReplacerFunction;
}

var hasRequiredEs_json_stringify;

function requireEs_json_stringify () {
	if (hasRequiredEs_json_stringify) return es_json_stringify;
	hasRequiredEs_json_stringify = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var apply = requireFunctionApply();
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var fails = requireFails();
	var isCallable = requireIsCallable();
	var isSymbol = requireIsSymbol();
	var arraySlice = requireArraySlice();
	var getReplacerFunction = requireGetJsonReplacerFunction();
	var NATIVE_SYMBOL = requireSymbolConstructorDetection();

	var $String = String;
	var $stringify = getBuiltIn('JSON', 'stringify');
	var exec = uncurryThis(/./.exec);
	var charAt = uncurryThis(''.charAt);
	var charCodeAt = uncurryThis(''.charCodeAt);
	var replace = uncurryThis(''.replace);
	var numberToString = uncurryThis(1.0.toString);

	var tester = /[\uD800-\uDFFF]/g;
	var low = /^[\uD800-\uDBFF]$/;
	var hi = /^[\uDC00-\uDFFF]$/;

	var WRONG_SYMBOLS_CONVERSION = !NATIVE_SYMBOL || fails(function () {
	  var symbol = getBuiltIn('Symbol')('stringify detection');
	  // MS Edge converts symbol values to JSON as {}
	  return $stringify([symbol]) !== '[null]'
	    // WebKit converts symbol values to JSON as null
	    || $stringify({ a: symbol }) !== '{}'
	    // V8 throws on boxed symbols
	    || $stringify(Object(symbol)) !== '{}';
	});

	// https://github.com/tc39/proposal-well-formed-stringify
	var ILL_FORMED_UNICODE = fails(function () {
	  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
	    || $stringify('\uDEAD') !== '"\\udead"';
	});

	var stringifyWithSymbolsFix = function (it, replacer) {
	  var args = arraySlice(arguments);
	  var $replacer = getReplacerFunction(replacer);
	  if (!isCallable($replacer) && (it === undefined || isSymbol(it))) return; // IE8 returns string on undefined
	  args[1] = function (key, value) {
	    // some old implementations (like WebKit) could pass numbers as keys
	    if (isCallable($replacer)) value = call($replacer, this, $String(key), value);
	    if (!isSymbol(value)) return value;
	  };
	  return apply($stringify, null, args);
	};

	var fixIllFormed = function (match, offset, string) {
	  var prev = charAt(string, offset - 1);
	  var next = charAt(string, offset + 1);
	  if ((exec(low, match) && !exec(hi, next)) || (exec(hi, match) && !exec(low, prev))) {
	    return '\\u' + numberToString(charCodeAt(match, 0), 16);
	  } return match;
	};

	if ($stringify) {
	  // `JSON.stringify` method
	  // https://tc39.es/ecma262/#sec-json.stringify
	  $({ target: 'JSON', stat: true, arity: 3, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE }, {
	    // eslint-disable-next-line no-unused-vars -- required for `.length`
	    stringify: function stringify(it, replacer, space) {
	      var args = arraySlice(arguments);
	      var result = apply(WRONG_SYMBOLS_CONVERSION ? stringifyWithSymbolsFix : $stringify, null, args);
	      return ILL_FORMED_UNICODE && typeof result == 'string' ? replace(result, tester, fixIllFormed) : result;
	    }
	  });
	}
	return es_json_stringify;
}

var es_object_getOwnPropertySymbols = {};

var hasRequiredEs_object_getOwnPropertySymbols;

function requireEs_object_getOwnPropertySymbols () {
	if (hasRequiredEs_object_getOwnPropertySymbols) return es_object_getOwnPropertySymbols;
	hasRequiredEs_object_getOwnPropertySymbols = 1;
	var $ = require_export();
	var NATIVE_SYMBOL = requireSymbolConstructorDetection();
	var fails = requireFails();
	var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
	var toObject = requireToObject();

	// V8 ~ Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
	// https://bugs.chromium.org/p/v8/issues/detail?id=3443
	var FORCED = !NATIVE_SYMBOL || fails(function () { getOwnPropertySymbolsModule.f(1); });

	// `Object.getOwnPropertySymbols` method
	// https://tc39.es/ecma262/#sec-object.getownpropertysymbols
	$({ target: 'Object', stat: true, forced: FORCED }, {
	  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
	    var $getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
	    return $getOwnPropertySymbols ? $getOwnPropertySymbols(toObject(it)) : [];
	  }
	});
	return es_object_getOwnPropertySymbols;
}

var hasRequiredEs_symbol;

function requireEs_symbol () {
	if (hasRequiredEs_symbol) return es_symbol;
	hasRequiredEs_symbol = 1;
	// TODO: Remove this module from `core-js@4` since it's split to modules listed below
	requireEs_symbol_constructor();
	requireEs_symbol_for();
	requireEs_symbol_keyFor();
	requireEs_json_stringify();
	requireEs_object_getOwnPropertySymbols();
	return es_symbol;
}

var es_symbol_description = {};

var hasRequiredEs_symbol_description;

function requireEs_symbol_description () {
	if (hasRequiredEs_symbol_description) return es_symbol_description;
	hasRequiredEs_symbol_description = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();
	var hasOwn = requireHasOwnProperty();
	var isCallable = requireIsCallable();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var toString = requireToString();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var copyConstructorProperties = requireCopyConstructorProperties();

	var NativeSymbol = globalThis.Symbol;
	var SymbolPrototype = NativeSymbol && NativeSymbol.prototype;

	if (DESCRIPTORS && isCallable(NativeSymbol) && (!('description' in SymbolPrototype) ||
	  // Safari 12 bug
	  NativeSymbol().description !== undefined
	)) {
	  var EmptyStringDescriptionStore = {};
	  // wrap Symbol constructor for correct work with undefined description
	  var SymbolWrapper = function Symbol() {
	    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString(arguments[0]);
	    var result = isPrototypeOf(SymbolPrototype, this)
	      // eslint-disable-next-line sonar/inconsistent-function-call -- ok
	      ? new NativeSymbol(description)
	      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
	      : description === undefined ? NativeSymbol() : NativeSymbol(description);
	    if (description === '') EmptyStringDescriptionStore[result] = true;
	    return result;
	  };

	  copyConstructorProperties(SymbolWrapper, NativeSymbol);
	  SymbolWrapper.prototype = SymbolPrototype;
	  SymbolPrototype.constructor = SymbolWrapper;

	  var NATIVE_SYMBOL = String(NativeSymbol('description detection')) === 'Symbol(description detection)';
	  var thisSymbolValue = uncurryThis(SymbolPrototype.valueOf);
	  var symbolDescriptiveString = uncurryThis(SymbolPrototype.toString);
	  var regexp = /^Symbol\((.*)\)[^)]+$/;
	  var replace = uncurryThis(''.replace);
	  var stringSlice = uncurryThis(''.slice);

	  defineBuiltInAccessor(SymbolPrototype, 'description', {
	    configurable: true,
	    get: function description() {
	      var symbol = thisSymbolValue(this);
	      if (hasOwn(EmptyStringDescriptionStore, symbol)) return '';
	      var string = symbolDescriptiveString(symbol);
	      var desc = NATIVE_SYMBOL ? stringSlice(string, 7, -1) : replace(string, regexp, '$1');
	      return desc === '' ? undefined : desc;
	    }
	  });

	  $({ global: true, constructor: true, forced: true }, {
	    Symbol: SymbolWrapper
	  });
	}
	return es_symbol_description;
}

var es_symbol_asyncIterator = {};

var hasRequiredEs_symbol_asyncIterator;

function requireEs_symbol_asyncIterator () {
	if (hasRequiredEs_symbol_asyncIterator) return es_symbol_asyncIterator;
	hasRequiredEs_symbol_asyncIterator = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.asyncIterator` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.asynciterator
	defineWellKnownSymbol('asyncIterator');
	return es_symbol_asyncIterator;
}

var es_symbol_hasInstance = {};

var hasRequiredEs_symbol_hasInstance;

function requireEs_symbol_hasInstance () {
	if (hasRequiredEs_symbol_hasInstance) return es_symbol_hasInstance;
	hasRequiredEs_symbol_hasInstance = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.hasInstance` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.hasinstance
	defineWellKnownSymbol('hasInstance');
	return es_symbol_hasInstance;
}

var es_symbol_isConcatSpreadable = {};

var hasRequiredEs_symbol_isConcatSpreadable;

function requireEs_symbol_isConcatSpreadable () {
	if (hasRequiredEs_symbol_isConcatSpreadable) return es_symbol_isConcatSpreadable;
	hasRequiredEs_symbol_isConcatSpreadable = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.isConcatSpreadable` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.isconcatspreadable
	defineWellKnownSymbol('isConcatSpreadable');
	return es_symbol_isConcatSpreadable;
}

var es_symbol_iterator = {};

var hasRequiredEs_symbol_iterator;

function requireEs_symbol_iterator () {
	if (hasRequiredEs_symbol_iterator) return es_symbol_iterator;
	hasRequiredEs_symbol_iterator = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.iterator` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.iterator
	defineWellKnownSymbol('iterator');
	return es_symbol_iterator;
}

var es_symbol_match = {};

var hasRequiredEs_symbol_match;

function requireEs_symbol_match () {
	if (hasRequiredEs_symbol_match) return es_symbol_match;
	hasRequiredEs_symbol_match = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.match` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.match
	defineWellKnownSymbol('match');
	return es_symbol_match;
}

var es_symbol_matchAll = {};

var hasRequiredEs_symbol_matchAll;

function requireEs_symbol_matchAll () {
	if (hasRequiredEs_symbol_matchAll) return es_symbol_matchAll;
	hasRequiredEs_symbol_matchAll = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.matchAll` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.matchall
	defineWellKnownSymbol('matchAll');
	return es_symbol_matchAll;
}

var es_symbol_replace = {};

var hasRequiredEs_symbol_replace;

function requireEs_symbol_replace () {
	if (hasRequiredEs_symbol_replace) return es_symbol_replace;
	hasRequiredEs_symbol_replace = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.replace` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.replace
	defineWellKnownSymbol('replace');
	return es_symbol_replace;
}

var es_symbol_search = {};

var hasRequiredEs_symbol_search;

function requireEs_symbol_search () {
	if (hasRequiredEs_symbol_search) return es_symbol_search;
	hasRequiredEs_symbol_search = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.search` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.search
	defineWellKnownSymbol('search');
	return es_symbol_search;
}

var es_symbol_species = {};

var hasRequiredEs_symbol_species;

function requireEs_symbol_species () {
	if (hasRequiredEs_symbol_species) return es_symbol_species;
	hasRequiredEs_symbol_species = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.species` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.species
	defineWellKnownSymbol('species');
	return es_symbol_species;
}

var es_symbol_split = {};

var hasRequiredEs_symbol_split;

function requireEs_symbol_split () {
	if (hasRequiredEs_symbol_split) return es_symbol_split;
	hasRequiredEs_symbol_split = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.split` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.split
	defineWellKnownSymbol('split');
	return es_symbol_split;
}

var es_symbol_toPrimitive = {};

var hasRequiredEs_symbol_toPrimitive;

function requireEs_symbol_toPrimitive () {
	if (hasRequiredEs_symbol_toPrimitive) return es_symbol_toPrimitive;
	hasRequiredEs_symbol_toPrimitive = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();
	var defineSymbolToPrimitive = requireSymbolDefineToPrimitive();

	// `Symbol.toPrimitive` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.toprimitive
	defineWellKnownSymbol('toPrimitive');

	// `Symbol.prototype[@@toPrimitive]` method
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
	defineSymbolToPrimitive();
	return es_symbol_toPrimitive;
}

var es_symbol_toStringTag = {};

var hasRequiredEs_symbol_toStringTag;

function requireEs_symbol_toStringTag () {
	if (hasRequiredEs_symbol_toStringTag) return es_symbol_toStringTag;
	hasRequiredEs_symbol_toStringTag = 1;
	var getBuiltIn = requireGetBuiltIn();
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();
	var setToStringTag = requireSetToStringTag();

	// `Symbol.toStringTag` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.tostringtag
	defineWellKnownSymbol('toStringTag');

	// `Symbol.prototype[@@toStringTag]` property
	// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
	setToStringTag(getBuiltIn('Symbol'), 'Symbol');
	return es_symbol_toStringTag;
}

var es_symbol_unscopables = {};

var hasRequiredEs_symbol_unscopables;

function requireEs_symbol_unscopables () {
	if (hasRequiredEs_symbol_unscopables) return es_symbol_unscopables;
	hasRequiredEs_symbol_unscopables = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.unscopables` well-known symbol
	// https://tc39.es/ecma262/#sec-symbol.unscopables
	defineWellKnownSymbol('unscopables');
	return es_symbol_unscopables;
}

var es_error_cause = {};

var functionUncurryThisAccessor;
var hasRequiredFunctionUncurryThisAccessor;

function requireFunctionUncurryThisAccessor () {
	if (hasRequiredFunctionUncurryThisAccessor) return functionUncurryThisAccessor;
	hasRequiredFunctionUncurryThisAccessor = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var aCallable = requireACallable();

	functionUncurryThisAccessor = function (object, key, method) {
	  try {
	    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	    return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
	  } catch (error) { /* empty */ }
	};
	return functionUncurryThisAccessor;
}

var isPossiblePrototype;
var hasRequiredIsPossiblePrototype;

function requireIsPossiblePrototype () {
	if (hasRequiredIsPossiblePrototype) return isPossiblePrototype;
	hasRequiredIsPossiblePrototype = 1;
	var isObject = requireIsObject();

	isPossiblePrototype = function (argument) {
	  return isObject(argument) || argument === null;
	};
	return isPossiblePrototype;
}

var aPossiblePrototype;
var hasRequiredAPossiblePrototype;

function requireAPossiblePrototype () {
	if (hasRequiredAPossiblePrototype) return aPossiblePrototype;
	hasRequiredAPossiblePrototype = 1;
	var isPossiblePrototype = requireIsPossiblePrototype();

	var $String = String;
	var $TypeError = TypeError;

	aPossiblePrototype = function (argument) {
	  if (isPossiblePrototype(argument)) return argument;
	  throw new $TypeError("Can't set " + $String(argument) + ' as a prototype');
	};
	return aPossiblePrototype;
}

var objectSetPrototypeOf;
var hasRequiredObjectSetPrototypeOf;

function requireObjectSetPrototypeOf () {
	if (hasRequiredObjectSetPrototypeOf) return objectSetPrototypeOf;
	hasRequiredObjectSetPrototypeOf = 1;
	/* eslint-disable no-proto -- safe */
	var uncurryThisAccessor = requireFunctionUncurryThisAccessor();
	var isObject = requireIsObject();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var aPossiblePrototype = requireAPossiblePrototype();

	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	// eslint-disable-next-line es/no-object-setprototypeof -- safe
	objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = uncurryThisAccessor(Object.prototype, '__proto__', 'set');
	    setter(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    requireObjectCoercible(O);
	    aPossiblePrototype(proto);
	    if (!isObject(O)) return O;
	    if (CORRECT_SETTER) setter(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);
	return objectSetPrototypeOf;
}

var proxyAccessor;
var hasRequiredProxyAccessor;

function requireProxyAccessor () {
	if (hasRequiredProxyAccessor) return proxyAccessor;
	hasRequiredProxyAccessor = 1;
	var defineProperty = requireObjectDefineProperty().f;

	proxyAccessor = function (Target, Source, key) {
	  key in Target || defineProperty(Target, key, {
	    configurable: true,
	    get: function () { return Source[key]; },
	    set: function (it) { Source[key] = it; }
	  });
	};
	return proxyAccessor;
}

var inheritIfRequired;
var hasRequiredInheritIfRequired;

function requireInheritIfRequired () {
	if (hasRequiredInheritIfRequired) return inheritIfRequired;
	hasRequiredInheritIfRequired = 1;
	var isCallable = requireIsCallable();
	var isObject = requireIsObject();
	var setPrototypeOf = requireObjectSetPrototypeOf();

	// makes subclassing work correct for wrapped built-ins
	inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if (
	    // it can work only with native `setPrototypeOf`
	    setPrototypeOf &&
	    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	    isCallable(NewTarget = dummy.constructor) &&
	    NewTarget !== Wrapper &&
	    isObject(NewTargetPrototype = NewTarget.prototype) &&
	    NewTargetPrototype !== Wrapper.prototype
	  ) setPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};
	return inheritIfRequired;
}

var normalizeStringArgument;
var hasRequiredNormalizeStringArgument;

function requireNormalizeStringArgument () {
	if (hasRequiredNormalizeStringArgument) return normalizeStringArgument;
	hasRequiredNormalizeStringArgument = 1;
	var toString = requireToString();

	normalizeStringArgument = function (argument, $default) {
	  return argument === undefined ? arguments.length < 2 ? '' : $default : toString(argument);
	};
	return normalizeStringArgument;
}

var installErrorCause;
var hasRequiredInstallErrorCause;

function requireInstallErrorCause () {
	if (hasRequiredInstallErrorCause) return installErrorCause;
	hasRequiredInstallErrorCause = 1;
	var isObject = requireIsObject();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();

	// `InstallErrorCause` abstract operation
	// https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
	installErrorCause = function (O, options) {
	  if (isObject(options) && 'cause' in options) {
	    createNonEnumerableProperty(O, 'cause', options.cause);
	  }
	};
	return installErrorCause;
}

var errorStackClear;
var hasRequiredErrorStackClear;

function requireErrorStackClear () {
	if (hasRequiredErrorStackClear) return errorStackClear;
	hasRequiredErrorStackClear = 1;
	var uncurryThis = requireFunctionUncurryThis();

	var $Error = Error;
	var replace = uncurryThis(''.replace);

	var TEST = (function (arg) { return String(new $Error(arg).stack); })('zxcasd');
	// eslint-disable-next-line redos/no-vulnerable -- safe
	var V8_OR_CHAKRA_STACK_ENTRY = /\n\s*at [^:]*:[^\n]*/;
	var IS_V8_OR_CHAKRA_STACK = V8_OR_CHAKRA_STACK_ENTRY.test(TEST);

	errorStackClear = function (stack, dropEntries) {
	  if (IS_V8_OR_CHAKRA_STACK && typeof stack == 'string' && !$Error.prepareStackTrace) {
	    while (dropEntries--) stack = replace(stack, V8_OR_CHAKRA_STACK_ENTRY, '');
	  } return stack;
	};
	return errorStackClear;
}

var errorStackInstallable;
var hasRequiredErrorStackInstallable;

function requireErrorStackInstallable () {
	if (hasRequiredErrorStackInstallable) return errorStackInstallable;
	hasRequiredErrorStackInstallable = 1;
	var fails = requireFails();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();

	errorStackInstallable = !fails(function () {
	  var error = new Error('a');
	  if (!('stack' in error)) return true;
	  // eslint-disable-next-line es/no-object-defineproperty -- safe
	  Object.defineProperty(error, 'stack', createPropertyDescriptor(1, 7));
	  return error.stack !== 7;
	});
	return errorStackInstallable;
}

var errorStackInstall;
var hasRequiredErrorStackInstall;

function requireErrorStackInstall () {
	if (hasRequiredErrorStackInstall) return errorStackInstall;
	hasRequiredErrorStackInstall = 1;
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var clearErrorStack = requireErrorStackClear();
	var ERROR_STACK_INSTALLABLE = requireErrorStackInstallable();

	// non-standard V8
	var captureStackTrace = Error.captureStackTrace;

	errorStackInstall = function (error, C, stack, dropEntries) {
	  if (ERROR_STACK_INSTALLABLE) {
	    if (captureStackTrace) captureStackTrace(error, C);
	    else createNonEnumerableProperty(error, 'stack', clearErrorStack(stack, dropEntries));
	  }
	};
	return errorStackInstall;
}

var wrapErrorConstructorWithCause;
var hasRequiredWrapErrorConstructorWithCause;

function requireWrapErrorConstructorWithCause () {
	if (hasRequiredWrapErrorConstructorWithCause) return wrapErrorConstructorWithCause;
	hasRequiredWrapErrorConstructorWithCause = 1;
	var getBuiltIn = requireGetBuiltIn();
	var hasOwn = requireHasOwnProperty();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var setPrototypeOf = requireObjectSetPrototypeOf();
	var copyConstructorProperties = requireCopyConstructorProperties();
	var proxyAccessor = requireProxyAccessor();
	var inheritIfRequired = requireInheritIfRequired();
	var normalizeStringArgument = requireNormalizeStringArgument();
	var installErrorCause = requireInstallErrorCause();
	var installErrorStack = requireErrorStackInstall();
	var DESCRIPTORS = requireDescriptors();
	var IS_PURE = requireIsPure();

	wrapErrorConstructorWithCause = function (FULL_NAME, wrapper, FORCED, IS_AGGREGATE_ERROR) {
	  var STACK_TRACE_LIMIT = 'stackTraceLimit';
	  var OPTIONS_POSITION = IS_AGGREGATE_ERROR ? 2 : 1;
	  var path = FULL_NAME.split('.');
	  var ERROR_NAME = path[path.length - 1];
	  var OriginalError = getBuiltIn.apply(null, path);

	  if (!OriginalError) return;

	  var OriginalErrorPrototype = OriginalError.prototype;

	  // V8 9.3- bug https://bugs.chromium.org/p/v8/issues/detail?id=12006
	  if (!IS_PURE && hasOwn(OriginalErrorPrototype, 'cause')) delete OriginalErrorPrototype.cause;

	  if (!FORCED) return OriginalError;

	  var BaseError = getBuiltIn('Error');

	  var WrappedError = wrapper(function (a, b) {
	    var message = normalizeStringArgument(IS_AGGREGATE_ERROR ? b : a, undefined);
	    var result = IS_AGGREGATE_ERROR ? new OriginalError(a) : new OriginalError();
	    if (message !== undefined) createNonEnumerableProperty(result, 'message', message);
	    installErrorStack(result, WrappedError, result.stack, 2);
	    if (this && isPrototypeOf(OriginalErrorPrototype, this)) inheritIfRequired(result, this, WrappedError);
	    if (arguments.length > OPTIONS_POSITION) installErrorCause(result, arguments[OPTIONS_POSITION]);
	    return result;
	  });

	  WrappedError.prototype = OriginalErrorPrototype;

	  if (ERROR_NAME !== 'Error') {
	    if (setPrototypeOf) setPrototypeOf(WrappedError, BaseError);
	    else copyConstructorProperties(WrappedError, BaseError, { name: true });
	  } else if (DESCRIPTORS && STACK_TRACE_LIMIT in OriginalError) {
	    proxyAccessor(WrappedError, OriginalError, STACK_TRACE_LIMIT);
	    proxyAccessor(WrappedError, OriginalError, 'prepareStackTrace');
	  }

	  copyConstructorProperties(WrappedError, OriginalError);

	  if (!IS_PURE) try {
	    // Safari 13- bug: WebAssembly errors does not have a proper `.name`
	    if (OriginalErrorPrototype.name !== ERROR_NAME) {
	      createNonEnumerableProperty(OriginalErrorPrototype, 'name', ERROR_NAME);
	    }
	    OriginalErrorPrototype.constructor = WrappedError;
	  } catch (error) { /* empty */ }

	  return WrappedError;
	};
	return wrapErrorConstructorWithCause;
}

var hasRequiredEs_error_cause;

function requireEs_error_cause () {
	if (hasRequiredEs_error_cause) return es_error_cause;
	hasRequiredEs_error_cause = 1;
	/* eslint-disable no-unused-vars -- required for functions `.length` */
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var apply = requireFunctionApply();
	var wrapErrorConstructorWithCause = requireWrapErrorConstructorWithCause();

	var WEB_ASSEMBLY = 'WebAssembly';
	var WebAssembly = globalThis[WEB_ASSEMBLY];

	// eslint-disable-next-line es/no-error-cause -- feature detection
	var FORCED = new Error('e', { cause: 7 }).cause !== 7;

	var exportGlobalErrorCauseWrapper = function (ERROR_NAME, wrapper) {
	  var O = {};
	  O[ERROR_NAME] = wrapErrorConstructorWithCause(ERROR_NAME, wrapper, FORCED);
	  $({ global: true, constructor: true, arity: 1, forced: FORCED }, O);
	};

	var exportWebAssemblyErrorCauseWrapper = function (ERROR_NAME, wrapper) {
	  if (WebAssembly && WebAssembly[ERROR_NAME]) {
	    var O = {};
	    O[ERROR_NAME] = wrapErrorConstructorWithCause(WEB_ASSEMBLY + '.' + ERROR_NAME, wrapper, FORCED);
	    $({ target: WEB_ASSEMBLY, stat: true, constructor: true, arity: 1, forced: FORCED }, O);
	  }
	};

	// https://tc39.es/ecma262/#sec-nativeerror
	exportGlobalErrorCauseWrapper('Error', function (init) {
	  return function Error(message) { return apply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('EvalError', function (init) {
	  return function EvalError(message) { return apply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('RangeError', function (init) {
	  return function RangeError(message) { return apply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('ReferenceError', function (init) {
	  return function ReferenceError(message) { return apply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('SyntaxError', function (init) {
	  return function SyntaxError(message) { return apply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('TypeError', function (init) {
	  return function TypeError(message) { return apply(init, this, arguments); };
	});
	exportGlobalErrorCauseWrapper('URIError', function (init) {
	  return function URIError(message) { return apply(init, this, arguments); };
	});
	exportWebAssemblyErrorCauseWrapper('CompileError', function (init) {
	  return function CompileError(message) { return apply(init, this, arguments); };
	});
	exportWebAssemblyErrorCauseWrapper('LinkError', function (init) {
	  return function LinkError(message) { return apply(init, this, arguments); };
	});
	exportWebAssemblyErrorCauseWrapper('RuntimeError', function (init) {
	  return function RuntimeError(message) { return apply(init, this, arguments); };
	});
	return es_error_cause;
}

var es_error_toString = {};

var errorToString;
var hasRequiredErrorToString;

function requireErrorToString () {
	if (hasRequiredErrorToString) return errorToString;
	hasRequiredErrorToString = 1;
	var DESCRIPTORS = requireDescriptors();
	var fails = requireFails();
	var anObject = requireAnObject();
	var normalizeStringArgument = requireNormalizeStringArgument();

	var nativeErrorToString = Error.prototype.toString;

	var INCORRECT_TO_STRING = fails(function () {
	  if (DESCRIPTORS) {
	    // Chrome 32- incorrectly call accessor
	    // eslint-disable-next-line es/no-object-create, es/no-object-defineproperty -- safe
	    var object = Object.create(Object.defineProperty({}, 'name', { get: function () {
	      return this === object;
	    } }));
	    if (nativeErrorToString.call(object) !== 'true') return true;
	  }
	  // FF10- does not properly handle non-strings
	  return nativeErrorToString.call({ message: 1, name: 2 }) !== '2: 1'
	    // IE8 does not properly handle defaults
	    || nativeErrorToString.call({}) !== 'Error';
	});

	errorToString = INCORRECT_TO_STRING ? function toString() {
	  var O = anObject(this);
	  var name = normalizeStringArgument(O.name, 'Error');
	  var message = normalizeStringArgument(O.message);
	  return !name ? message : !message ? name : name + ': ' + message;
	} : nativeErrorToString;
	return errorToString;
}

var hasRequiredEs_error_toString;

function requireEs_error_toString () {
	if (hasRequiredEs_error_toString) return es_error_toString;
	hasRequiredEs_error_toString = 1;
	var defineBuiltIn = requireDefineBuiltIn();
	var errorToString = requireErrorToString();

	var ErrorPrototype = Error.prototype;

	// `Error.prototype.toString` method fix
	// https://tc39.es/ecma262/#sec-error.prototype.tostring
	if (ErrorPrototype.toString !== errorToString) {
	  defineBuiltIn(ErrorPrototype, 'toString', errorToString);
	}
	return es_error_toString;
}

var es_aggregateError = {};

var es_aggregateError_constructor = {};

var correctPrototypeGetter;
var hasRequiredCorrectPrototypeGetter;

function requireCorrectPrototypeGetter () {
	if (hasRequiredCorrectPrototypeGetter) return correctPrototypeGetter;
	hasRequiredCorrectPrototypeGetter = 1;
	var fails = requireFails();

	correctPrototypeGetter = !fails(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});
	return correctPrototypeGetter;
}

var objectGetPrototypeOf;
var hasRequiredObjectGetPrototypeOf;

function requireObjectGetPrototypeOf () {
	if (hasRequiredObjectGetPrototypeOf) return objectGetPrototypeOf;
	hasRequiredObjectGetPrototypeOf = 1;
	var hasOwn = requireHasOwnProperty();
	var isCallable = requireIsCallable();
	var toObject = requireToObject();
	var sharedKey = requireSharedKey();
	var CORRECT_PROTOTYPE_GETTER = requireCorrectPrototypeGetter();

	var IE_PROTO = sharedKey('IE_PROTO');
	var $Object = Object;
	var ObjectPrototype = $Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	// eslint-disable-next-line es/no-object-getprototypeof -- safe
	objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
	  var object = toObject(O);
	  if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
	  var constructor = object.constructor;
	  if (isCallable(constructor) && object instanceof constructor) {
	    return constructor.prototype;
	  } return object instanceof $Object ? ObjectPrototype : null;
	};
	return objectGetPrototypeOf;
}

var iterators;
var hasRequiredIterators;

function requireIterators () {
	if (hasRequiredIterators) return iterators;
	hasRequiredIterators = 1;
	iterators = {};
	return iterators;
}

var isArrayIteratorMethod;
var hasRequiredIsArrayIteratorMethod;

function requireIsArrayIteratorMethod () {
	if (hasRequiredIsArrayIteratorMethod) return isArrayIteratorMethod;
	hasRequiredIsArrayIteratorMethod = 1;
	var wellKnownSymbol = requireWellKnownSymbol();
	var Iterators = requireIterators();

	var ITERATOR = wellKnownSymbol('iterator');
	var ArrayPrototype = Array.prototype;

	// check on default Array iterator
	isArrayIteratorMethod = function (it) {
	  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
	};
	return isArrayIteratorMethod;
}

var getIteratorMethod;
var hasRequiredGetIteratorMethod;

function requireGetIteratorMethod () {
	if (hasRequiredGetIteratorMethod) return getIteratorMethod;
	hasRequiredGetIteratorMethod = 1;
	var classof = requireClassof();
	var getMethod = requireGetMethod();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var Iterators = requireIterators();
	var wellKnownSymbol = requireWellKnownSymbol();

	var ITERATOR = wellKnownSymbol('iterator');

	getIteratorMethod = function (it) {
	  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR)
	    || getMethod(it, '@@iterator')
	    || Iterators[classof(it)];
	};
	return getIteratorMethod;
}

var getIterator;
var hasRequiredGetIterator;

function requireGetIterator () {
	if (hasRequiredGetIterator) return getIterator;
	hasRequiredGetIterator = 1;
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var tryToString = requireTryToString();
	var getIteratorMethod = requireGetIteratorMethod();

	var $TypeError = TypeError;

	getIterator = function (argument, usingIterator) {
	  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
	  if (aCallable(iteratorMethod)) return anObject(call(iteratorMethod, argument));
	  throw new $TypeError(tryToString(argument) + ' is not iterable');
	};
	return getIterator;
}

var iteratorClose;
var hasRequiredIteratorClose;

function requireIteratorClose () {
	if (hasRequiredIteratorClose) return iteratorClose;
	hasRequiredIteratorClose = 1;
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var getMethod = requireGetMethod();

	iteratorClose = function (iterator, kind, value) {
	  var innerResult, innerError;
	  anObject(iterator);
	  try {
	    innerResult = getMethod(iterator, 'return');
	    if (!innerResult) {
	      if (kind === 'throw') throw value;
	      return value;
	    }
	    innerResult = call(innerResult, iterator);
	  } catch (error) {
	    innerError = true;
	    innerResult = error;
	  }
	  if (kind === 'throw') throw value;
	  if (innerError) throw innerResult;
	  anObject(innerResult);
	  return value;
	};
	return iteratorClose;
}

var iterate;
var hasRequiredIterate;

function requireIterate () {
	if (hasRequiredIterate) return iterate;
	hasRequiredIterate = 1;
	var bind = requireFunctionBindContext();
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var tryToString = requireTryToString();
	var isArrayIteratorMethod = requireIsArrayIteratorMethod();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var getIterator = requireGetIterator();
	var getIteratorMethod = requireGetIteratorMethod();
	var iteratorClose = requireIteratorClose();

	var $TypeError = TypeError;

	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var ResultPrototype = Result.prototype;

	iterate = function (iterable, unboundFunction, options) {
	  var that = options && options.that;
	  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
	  var IS_RECORD = !!(options && options.IS_RECORD);
	  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
	  var INTERRUPTED = !!(options && options.INTERRUPTED);
	  var fn = bind(unboundFunction, that);
	  var iterator, iterFn, index, length, result, next, step;

	  var stop = function (condition) {
	    if (iterator) iteratorClose(iterator, 'normal', condition);
	    return new Result(true, condition);
	  };

	  var callFn = function (value) {
	    if (AS_ENTRIES) {
	      anObject(value);
	      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
	    } return INTERRUPTED ? fn(value, stop) : fn(value);
	  };

	  if (IS_RECORD) {
	    iterator = iterable.iterator;
	  } else if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (!iterFn) throw new $TypeError(tryToString(iterable) + ' is not iterable');
	    // optimisation for array iterators
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
	        result = callFn(iterable[index]);
	        if (result && isPrototypeOf(ResultPrototype, result)) return result;
	      } return new Result(false);
	    }
	    iterator = getIterator(iterable, iterFn);
	  }

	  next = IS_RECORD ? iterable.next : iterator.next;
	  while (!(step = call(next, iterator)).done) {
	    try {
	      result = callFn(step.value);
	    } catch (error) {
	      iteratorClose(iterator, 'throw', error);
	    }
	    if (typeof result == 'object' && result && isPrototypeOf(ResultPrototype, result)) return result;
	  } return new Result(false);
	};
	return iterate;
}

var hasRequiredEs_aggregateError_constructor;

function requireEs_aggregateError_constructor () {
	if (hasRequiredEs_aggregateError_constructor) return es_aggregateError_constructor;
	hasRequiredEs_aggregateError_constructor = 1;
	var $ = require_export();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var setPrototypeOf = requireObjectSetPrototypeOf();
	var copyConstructorProperties = requireCopyConstructorProperties();
	var create = requireObjectCreate();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();
	var installErrorCause = requireInstallErrorCause();
	var installErrorStack = requireErrorStackInstall();
	var iterate = requireIterate();
	var normalizeStringArgument = requireNormalizeStringArgument();
	var wellKnownSymbol = requireWellKnownSymbol();

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var $Error = Error;
	var push = [].push;

	var $AggregateError = function AggregateError(errors, message /* , options */) {
	  var isInstance = isPrototypeOf(AggregateErrorPrototype, this);
	  var that;
	  if (setPrototypeOf) {
	    that = setPrototypeOf(new $Error(), isInstance ? getPrototypeOf(this) : AggregateErrorPrototype);
	  } else {
	    that = isInstance ? this : create(AggregateErrorPrototype);
	    createNonEnumerableProperty(that, TO_STRING_TAG, 'Error');
	  }
	  if (message !== undefined) createNonEnumerableProperty(that, 'message', normalizeStringArgument(message));
	  installErrorStack(that, $AggregateError, that.stack, 1);
	  if (arguments.length > 2) installErrorCause(that, arguments[2]);
	  var errorsArray = [];
	  iterate(errors, push, { that: errorsArray });
	  createNonEnumerableProperty(that, 'errors', errorsArray);
	  return that;
	};

	if (setPrototypeOf) setPrototypeOf($AggregateError, $Error);
	else copyConstructorProperties($AggregateError, $Error, { name: true });

	var AggregateErrorPrototype = $AggregateError.prototype = create($Error.prototype, {
	  constructor: createPropertyDescriptor(1, $AggregateError),
	  message: createPropertyDescriptor(1, ''),
	  name: createPropertyDescriptor(1, 'AggregateError')
	});

	// `AggregateError` constructor
	// https://tc39.es/ecma262/#sec-aggregate-error-constructor
	$({ global: true, constructor: true, arity: 2 }, {
	  AggregateError: $AggregateError
	});
	return es_aggregateError_constructor;
}

var hasRequiredEs_aggregateError;

function requireEs_aggregateError () {
	if (hasRequiredEs_aggregateError) return es_aggregateError;
	hasRequiredEs_aggregateError = 1;
	// TODO: Remove this module from `core-js@4` since it's replaced to module below
	requireEs_aggregateError_constructor();
	return es_aggregateError;
}

var es_aggregateError_cause = {};

var hasRequiredEs_aggregateError_cause;

function requireEs_aggregateError_cause () {
	if (hasRequiredEs_aggregateError_cause) return es_aggregateError_cause;
	hasRequiredEs_aggregateError_cause = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var apply = requireFunctionApply();
	var fails = requireFails();
	var wrapErrorConstructorWithCause = requireWrapErrorConstructorWithCause();

	var AGGREGATE_ERROR = 'AggregateError';
	var $AggregateError = getBuiltIn(AGGREGATE_ERROR);

	var FORCED = !fails(function () {
	  return $AggregateError([1]).errors[0] !== 1;
	}) && fails(function () {
	  return $AggregateError([1], AGGREGATE_ERROR, { cause: 7 }).cause !== 7;
	});

	// https://tc39.es/ecma262/#sec-aggregate-error
	$({ global: true, constructor: true, arity: 2, forced: FORCED }, {
	  AggregateError: wrapErrorConstructorWithCause(AGGREGATE_ERROR, function (init) {
	    // eslint-disable-next-line no-unused-vars -- required for functions `.length`
	    return function AggregateError(errors, message) { return apply(init, this, arguments); };
	  }, FORCED, true)
	});
	return es_aggregateError_cause;
}

var es_array_at = {};

var addToUnscopables;
var hasRequiredAddToUnscopables;

function requireAddToUnscopables () {
	if (hasRequiredAddToUnscopables) return addToUnscopables;
	hasRequiredAddToUnscopables = 1;
	var wellKnownSymbol = requireWellKnownSymbol();
	var create = requireObjectCreate();
	var defineProperty = requireObjectDefineProperty().f;

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype[UNSCOPABLES] === undefined) {
	  defineProperty(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: create(null)
	  });
	}

	// add a key to Array.prototype[@@unscopables]
	addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};
	return addToUnscopables;
}

var hasRequiredEs_array_at;

function requireEs_array_at () {
	if (hasRequiredEs_array_at) return es_array_at;
	hasRequiredEs_array_at = 1;
	var $ = require_export();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var addToUnscopables = requireAddToUnscopables();

	// `Array.prototype.at` method
	// https://tc39.es/ecma262/#sec-array.prototype.at
	$({ target: 'Array', proto: true }, {
	  at: function at(index) {
	    var O = toObject(this);
	    var len = lengthOfArrayLike(O);
	    var relativeIndex = toIntegerOrInfinity(index);
	    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
	    return (k < 0 || k >= len) ? undefined : O[k];
	  }
	});

	addToUnscopables('at');
	return es_array_at;
}

var es_array_concat = {};

var doesNotExceedSafeInteger;
var hasRequiredDoesNotExceedSafeInteger;

function requireDoesNotExceedSafeInteger () {
	if (hasRequiredDoesNotExceedSafeInteger) return doesNotExceedSafeInteger;
	hasRequiredDoesNotExceedSafeInteger = 1;
	var $TypeError = TypeError;
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

	doesNotExceedSafeInteger = function (it) {
	  if (it > MAX_SAFE_INTEGER) throw $TypeError('Maximum allowed index exceeded');
	  return it;
	};
	return doesNotExceedSafeInteger;
}

var createProperty;
var hasRequiredCreateProperty;

function requireCreateProperty () {
	if (hasRequiredCreateProperty) return createProperty;
	hasRequiredCreateProperty = 1;
	var DESCRIPTORS = requireDescriptors();
	var definePropertyModule = requireObjectDefineProperty();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();

	createProperty = function (object, key, value) {
	  if (DESCRIPTORS) definePropertyModule.f(object, key, createPropertyDescriptor(0, value));
	  else object[key] = value;
	};
	return createProperty;
}

var arrayMethodHasSpeciesSupport;
var hasRequiredArrayMethodHasSpeciesSupport;

function requireArrayMethodHasSpeciesSupport () {
	if (hasRequiredArrayMethodHasSpeciesSupport) return arrayMethodHasSpeciesSupport;
	hasRequiredArrayMethodHasSpeciesSupport = 1;
	var fails = requireFails();
	var wellKnownSymbol = requireWellKnownSymbol();
	var V8_VERSION = requireEnvironmentV8Version();

	var SPECIES = wellKnownSymbol('species');

	arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return V8_VERSION >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};
	return arrayMethodHasSpeciesSupport;
}

var hasRequiredEs_array_concat;

function requireEs_array_concat () {
	if (hasRequiredEs_array_concat) return es_array_concat;
	hasRequiredEs_array_concat = 1;
	var $ = require_export();
	var fails = requireFails();
	var isArray = requireIsArray();
	var isObject = requireIsObject();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var doesNotExceedSafeInteger = requireDoesNotExceedSafeInteger();
	var createProperty = requireCreateProperty();
	var arraySpeciesCreate = requireArraySpeciesCreate();
	var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();
	var wellKnownSymbol = requireWellKnownSymbol();
	var V8_VERSION = requireEnvironmentV8Version();

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');

	// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679
	var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});

	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};

	var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport('concat');

	// `Array.prototype.concat` method
	// https://tc39.es/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species
	$({ target: 'Array', proto: true, arity: 1, forced: FORCED }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  concat: function concat(arg) {
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;
	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];
	      if (isConcatSpreadable(E)) {
	        len = lengthOfArrayLike(E);
	        doesNotExceedSafeInteger(n + len);
	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        doesNotExceedSafeInteger(n + 1);
	        createProperty(A, n++, E);
	      }
	    }
	    A.length = n;
	    return A;
	  }
	});
	return es_array_concat;
}

var es_array_copyWithin = {};

var deletePropertyOrThrow;
var hasRequiredDeletePropertyOrThrow;

function requireDeletePropertyOrThrow () {
	if (hasRequiredDeletePropertyOrThrow) return deletePropertyOrThrow;
	hasRequiredDeletePropertyOrThrow = 1;
	var tryToString = requireTryToString();

	var $TypeError = TypeError;

	deletePropertyOrThrow = function (O, P) {
	  if (!delete O[P]) throw new $TypeError('Cannot delete property ' + tryToString(P) + ' of ' + tryToString(O));
	};
	return deletePropertyOrThrow;
}

var arrayCopyWithin;
var hasRequiredArrayCopyWithin;

function requireArrayCopyWithin () {
	if (hasRequiredArrayCopyWithin) return arrayCopyWithin;
	hasRequiredArrayCopyWithin = 1;
	var toObject = requireToObject();
	var toAbsoluteIndex = requireToAbsoluteIndex();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var deletePropertyOrThrow = requireDeletePropertyOrThrow();

	var min = Math.min;

	// `Array.prototype.copyWithin` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.copywithin
	// eslint-disable-next-line es/no-array-prototype-copywithin -- safe
	arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
	  var O = toObject(this);
	  var len = lengthOfArrayLike(O);
	  var to = toAbsoluteIndex(target, len);
	  var from = toAbsoluteIndex(start, len);
	  var end = arguments.length > 2 ? arguments[2] : undefined;
	  var count = min((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
	  var inc = 1;
	  if (from < to && to < from + count) {
	    inc = -1;
	    from += count - 1;
	    to += count - 1;
	  }
	  while (count-- > 0) {
	    if (from in O) O[to] = O[from];
	    else deletePropertyOrThrow(O, to);
	    to += inc;
	    from += inc;
	  } return O;
	};
	return arrayCopyWithin;
}

var hasRequiredEs_array_copyWithin;

function requireEs_array_copyWithin () {
	if (hasRequiredEs_array_copyWithin) return es_array_copyWithin;
	hasRequiredEs_array_copyWithin = 1;
	var $ = require_export();
	var copyWithin = requireArrayCopyWithin();
	var addToUnscopables = requireAddToUnscopables();

	// `Array.prototype.copyWithin` method
	// https://tc39.es/ecma262/#sec-array.prototype.copywithin
	$({ target: 'Array', proto: true }, {
	  copyWithin: copyWithin
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('copyWithin');
	return es_array_copyWithin;
}

var es_array_every = {};

var arrayMethodIsStrict;
var hasRequiredArrayMethodIsStrict;

function requireArrayMethodIsStrict () {
	if (hasRequiredArrayMethodIsStrict) return arrayMethodIsStrict;
	hasRequiredArrayMethodIsStrict = 1;
	var fails = requireFails();

	arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call -- required for testing
	    method.call(null, argument || function () { return 1; }, 1);
	  });
	};
	return arrayMethodIsStrict;
}

var hasRequiredEs_array_every;

function requireEs_array_every () {
	if (hasRequiredEs_array_every) return es_array_every;
	hasRequiredEs_array_every = 1;
	var $ = require_export();
	var $every = requireArrayIteration().every;
	var arrayMethodIsStrict = requireArrayMethodIsStrict();

	var STRICT_METHOD = arrayMethodIsStrict('every');

	// `Array.prototype.every` method
	// https://tc39.es/ecma262/#sec-array.prototype.every
	$({ target: 'Array', proto: true, forced: !STRICT_METHOD }, {
	  every: function every(callbackfn /* , thisArg */) {
	    return $every(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	return es_array_every;
}

var es_array_fill = {};

var arrayFill;
var hasRequiredArrayFill;

function requireArrayFill () {
	if (hasRequiredArrayFill) return arrayFill;
	hasRequiredArrayFill = 1;
	var toObject = requireToObject();
	var toAbsoluteIndex = requireToAbsoluteIndex();
	var lengthOfArrayLike = requireLengthOfArrayLike();

	// `Array.prototype.fill` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.fill
	arrayFill = function fill(value /* , start = 0, end = @length */) {
	  var O = toObject(this);
	  var length = lengthOfArrayLike(O);
	  var argumentsLength = arguments.length;
	  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
	  var end = argumentsLength > 2 ? arguments[2] : undefined;
	  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
	  while (endPos > index) O[index++] = value;
	  return O;
	};
	return arrayFill;
}

var hasRequiredEs_array_fill;

function requireEs_array_fill () {
	if (hasRequiredEs_array_fill) return es_array_fill;
	hasRequiredEs_array_fill = 1;
	var $ = require_export();
	var fill = requireArrayFill();
	var addToUnscopables = requireAddToUnscopables();

	// `Array.prototype.fill` method
	// https://tc39.es/ecma262/#sec-array.prototype.fill
	$({ target: 'Array', proto: true }, {
	  fill: fill
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('fill');
	return es_array_fill;
}

var es_array_filter = {};

var hasRequiredEs_array_filter;

function requireEs_array_filter () {
	if (hasRequiredEs_array_filter) return es_array_filter;
	hasRequiredEs_array_filter = 1;
	var $ = require_export();
	var $filter = requireArrayIteration().filter;
	var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');

	// `Array.prototype.filter` method
	// https://tc39.es/ecma262/#sec-array.prototype.filter
	// with adding support of @@species
	$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	return es_array_filter;
}

var es_array_find = {};

var hasRequiredEs_array_find;

function requireEs_array_find () {
	if (hasRequiredEs_array_find) return es_array_find;
	hasRequiredEs_array_find = 1;
	var $ = require_export();
	var $find = requireArrayIteration().find;
	var addToUnscopables = requireAddToUnscopables();

	var FIND = 'find';
	var SKIPS_HOLES = true;

	// Shouldn't skip holes
	// eslint-disable-next-line es/no-array-prototype-find -- testing
	if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

	// `Array.prototype.find` method
	// https://tc39.es/ecma262/#sec-array.prototype.find
	$({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
	  find: function find(callbackfn /* , that = undefined */) {
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables(FIND);
	return es_array_find;
}

var es_array_findIndex = {};

var hasRequiredEs_array_findIndex;

function requireEs_array_findIndex () {
	if (hasRequiredEs_array_findIndex) return es_array_findIndex;
	hasRequiredEs_array_findIndex = 1;
	var $ = require_export();
	var $findIndex = requireArrayIteration().findIndex;
	var addToUnscopables = requireAddToUnscopables();

	var FIND_INDEX = 'findIndex';
	var SKIPS_HOLES = true;

	// Shouldn't skip holes
	// eslint-disable-next-line es/no-array-prototype-findindex -- testing
	if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

	// `Array.prototype.findIndex` method
	// https://tc39.es/ecma262/#sec-array.prototype.findindex
	$({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
	  findIndex: function findIndex(callbackfn /* , that = undefined */) {
	    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables(FIND_INDEX);
	return es_array_findIndex;
}

var es_array_findLast = {};

var arrayIterationFromLast;
var hasRequiredArrayIterationFromLast;

function requireArrayIterationFromLast () {
	if (hasRequiredArrayIterationFromLast) return arrayIterationFromLast;
	hasRequiredArrayIterationFromLast = 1;
	var bind = requireFunctionBindContext();
	var IndexedObject = requireIndexedObject();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();

	// `Array.prototype.{ findLast, findLastIndex }` methods implementation
	var createMethod = function (TYPE) {
	  var IS_FIND_LAST_INDEX = TYPE === 1;
	  return function ($this, callbackfn, that) {
	    var O = toObject($this);
	    var self = IndexedObject(O);
	    var index = lengthOfArrayLike(self);
	    var boundFunction = bind(callbackfn, that);
	    var value, result;
	    while (index-- > 0) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (result) switch (TYPE) {
	        case 0: return value; // findLast
	        case 1: return index; // findLastIndex
	      }
	    }
	    return IS_FIND_LAST_INDEX ? -1 : undefined;
	  };
	};

	arrayIterationFromLast = {
	  // `Array.prototype.findLast` method
	  // https://github.com/tc39/proposal-array-find-from-last
	  findLast: createMethod(0),
	  // `Array.prototype.findLastIndex` method
	  // https://github.com/tc39/proposal-array-find-from-last
	  findLastIndex: createMethod(1)
	};
	return arrayIterationFromLast;
}

var hasRequiredEs_array_findLast;

function requireEs_array_findLast () {
	if (hasRequiredEs_array_findLast) return es_array_findLast;
	hasRequiredEs_array_findLast = 1;
	var $ = require_export();
	var $findLast = requireArrayIterationFromLast().findLast;
	var addToUnscopables = requireAddToUnscopables();

	// `Array.prototype.findLast` method
	// https://tc39.es/ecma262/#sec-array.prototype.findlast
	$({ target: 'Array', proto: true }, {
	  findLast: function findLast(callbackfn /* , that = undefined */) {
	    return $findLast(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	addToUnscopables('findLast');
	return es_array_findLast;
}

var es_array_findLastIndex = {};

var hasRequiredEs_array_findLastIndex;

function requireEs_array_findLastIndex () {
	if (hasRequiredEs_array_findLastIndex) return es_array_findLastIndex;
	hasRequiredEs_array_findLastIndex = 1;
	var $ = require_export();
	var $findLastIndex = requireArrayIterationFromLast().findLastIndex;
	var addToUnscopables = requireAddToUnscopables();

	// `Array.prototype.findLastIndex` method
	// https://tc39.es/ecma262/#sec-array.prototype.findlastindex
	$({ target: 'Array', proto: true }, {
	  findLastIndex: function findLastIndex(callbackfn /* , that = undefined */) {
	    return $findLastIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	addToUnscopables('findLastIndex');
	return es_array_findLastIndex;
}

var es_array_flat = {};

var flattenIntoArray_1;
var hasRequiredFlattenIntoArray;

function requireFlattenIntoArray () {
	if (hasRequiredFlattenIntoArray) return flattenIntoArray_1;
	hasRequiredFlattenIntoArray = 1;
	var isArray = requireIsArray();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var doesNotExceedSafeInteger = requireDoesNotExceedSafeInteger();
	var bind = requireFunctionBindContext();

	// `FlattenIntoArray` abstract operation
	// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
	var flattenIntoArray = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
	  var targetIndex = start;
	  var sourceIndex = 0;
	  var mapFn = mapper ? bind(mapper, thisArg) : false;
	  var element, elementLen;

	  while (sourceIndex < sourceLen) {
	    if (sourceIndex in source) {
	      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

	      if (depth > 0 && isArray(element)) {
	        elementLen = lengthOfArrayLike(element);
	        targetIndex = flattenIntoArray(target, original, element, elementLen, targetIndex, depth - 1) - 1;
	      } else {
	        doesNotExceedSafeInteger(targetIndex + 1);
	        target[targetIndex] = element;
	      }

	      targetIndex++;
	    }
	    sourceIndex++;
	  }
	  return targetIndex;
	};

	flattenIntoArray_1 = flattenIntoArray;
	return flattenIntoArray_1;
}

var hasRequiredEs_array_flat;

function requireEs_array_flat () {
	if (hasRequiredEs_array_flat) return es_array_flat;
	hasRequiredEs_array_flat = 1;
	var $ = require_export();
	var flattenIntoArray = requireFlattenIntoArray();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var arraySpeciesCreate = requireArraySpeciesCreate();

	// `Array.prototype.flat` method
	// https://tc39.es/ecma262/#sec-array.prototype.flat
	$({ target: 'Array', proto: true }, {
	  flat: function flat(/* depthArg = 1 */) {
	    var depthArg = arguments.length ? arguments[0] : undefined;
	    var O = toObject(this);
	    var sourceLen = lengthOfArrayLike(O);
	    var A = arraySpeciesCreate(O, 0);
	    A.length = flattenIntoArray(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toIntegerOrInfinity(depthArg));
	    return A;
	  }
	});
	return es_array_flat;
}

var es_array_flatMap = {};

var hasRequiredEs_array_flatMap;

function requireEs_array_flatMap () {
	if (hasRequiredEs_array_flatMap) return es_array_flatMap;
	hasRequiredEs_array_flatMap = 1;
	var $ = require_export();
	var flattenIntoArray = requireFlattenIntoArray();
	var aCallable = requireACallable();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var arraySpeciesCreate = requireArraySpeciesCreate();

	// `Array.prototype.flatMap` method
	// https://tc39.es/ecma262/#sec-array.prototype.flatmap
	$({ target: 'Array', proto: true }, {
	  flatMap: function flatMap(callbackfn /* , thisArg */) {
	    var O = toObject(this);
	    var sourceLen = lengthOfArrayLike(O);
	    var A;
	    aCallable(callbackfn);
	    A = arraySpeciesCreate(O, 0);
	    A.length = flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return A;
	  }
	});
	return es_array_flatMap;
}

var es_array_forEach = {};

var arrayForEach;
var hasRequiredArrayForEach;

function requireArrayForEach () {
	if (hasRequiredArrayForEach) return arrayForEach;
	hasRequiredArrayForEach = 1;
	var $forEach = requireArrayIteration().forEach;
	var arrayMethodIsStrict = requireArrayMethodIsStrict();

	var STRICT_METHOD = arrayMethodIsStrict('forEach');

	// `Array.prototype.forEach` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	arrayForEach = !STRICT_METHOD ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	// eslint-disable-next-line es/no-array-prototype-foreach -- safe
	} : [].forEach;
	return arrayForEach;
}

var hasRequiredEs_array_forEach;

function requireEs_array_forEach () {
	if (hasRequiredEs_array_forEach) return es_array_forEach;
	hasRequiredEs_array_forEach = 1;
	var $ = require_export();
	var forEach = requireArrayForEach();

	// `Array.prototype.forEach` method
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	// eslint-disable-next-line es/no-array-prototype-foreach -- safe
	$({ target: 'Array', proto: true, forced: [].forEach !== forEach }, {
	  forEach: forEach
	});
	return es_array_forEach;
}

var es_array_from = {};

var callWithSafeIterationClosing;
var hasRequiredCallWithSafeIterationClosing;

function requireCallWithSafeIterationClosing () {
	if (hasRequiredCallWithSafeIterationClosing) return callWithSafeIterationClosing;
	hasRequiredCallWithSafeIterationClosing = 1;
	var anObject = requireAnObject();
	var iteratorClose = requireIteratorClose();

	// call something on iterator step with safe closing on error
	callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  } catch (error) {
	    iteratorClose(iterator, 'throw', error);
	  }
	};
	return callWithSafeIterationClosing;
}

var arrayFrom;
var hasRequiredArrayFrom;

function requireArrayFrom () {
	if (hasRequiredArrayFrom) return arrayFrom;
	hasRequiredArrayFrom = 1;
	var bind = requireFunctionBindContext();
	var call = requireFunctionCall();
	var toObject = requireToObject();
	var callWithSafeIterationClosing = requireCallWithSafeIterationClosing();
	var isArrayIteratorMethod = requireIsArrayIteratorMethod();
	var isConstructor = requireIsConstructor();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var createProperty = requireCreateProperty();
	var getIterator = requireGetIterator();
	var getIteratorMethod = requireGetIteratorMethod();

	var $Array = Array;

	// `Array.from` method implementation
	// https://tc39.es/ecma262/#sec-array.from
	arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	  var O = toObject(arrayLike);
	  var IS_CONSTRUCTOR = isConstructor(this);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  // if the target is not iterable or it's an array with the default iterator - use a simple case
	  if (iteratorMethod && !(this === $Array && isArrayIteratorMethod(iteratorMethod))) {
	    result = IS_CONSTRUCTOR ? new this() : [];
	    iterator = getIterator(O, iteratorMethod);
	    next = iterator.next;
	    for (;!(step = call(next, iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty(result, index, value);
	    }
	  } else {
	    length = lengthOfArrayLike(O);
	    result = IS_CONSTRUCTOR ? new this(length) : $Array(length);
	    for (;length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty(result, index, value);
	    }
	  }
	  result.length = index;
	  return result;
	};
	return arrayFrom;
}

var checkCorrectnessOfIteration;
var hasRequiredCheckCorrectnessOfIteration;

function requireCheckCorrectnessOfIteration () {
	if (hasRequiredCheckCorrectnessOfIteration) return checkCorrectnessOfIteration;
	hasRequiredCheckCorrectnessOfIteration = 1;
	var wellKnownSymbol = requireWellKnownSymbol();

	var ITERATOR = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR] = function () {
	    return this;
	  };
	  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  try {
	    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  } catch (error) { return false; } // workaround of old WebKit + `eval` bug
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) { /* empty */ }
	  return ITERATION_SUPPORT;
	};
	return checkCorrectnessOfIteration;
}

var hasRequiredEs_array_from;

function requireEs_array_from () {
	if (hasRequiredEs_array_from) return es_array_from;
	hasRequiredEs_array_from = 1;
	var $ = require_export();
	var from = requireArrayFrom();
	var checkCorrectnessOfIteration = requireCheckCorrectnessOfIteration();

	var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
	  // eslint-disable-next-line es/no-array-from -- required for testing
	  Array.from(iterable);
	});

	// `Array.from` method
	// https://tc39.es/ecma262/#sec-array.from
	$({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
	  from: from
	});
	return es_array_from;
}

var es_array_includes = {};

var hasRequiredEs_array_includes;

function requireEs_array_includes () {
	if (hasRequiredEs_array_includes) return es_array_includes;
	hasRequiredEs_array_includes = 1;
	var $ = require_export();
	var $includes = requireArrayIncludes().includes;
	var fails = requireFails();
	var addToUnscopables = requireAddToUnscopables();

	// FF99+ bug
	var BROKEN_ON_SPARSE = fails(function () {
	  // eslint-disable-next-line es/no-array-prototype-includes -- detection
	  return !Array(1).includes();
	});

	// `Array.prototype.includes` method
	// https://tc39.es/ecma262/#sec-array.prototype.includes
	$({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE }, {
	  includes: function includes(el /* , fromIndex = 0 */) {
	    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('includes');
	return es_array_includes;
}

var es_array_indexOf = {};

var hasRequiredEs_array_indexOf;

function requireEs_array_indexOf () {
	if (hasRequiredEs_array_indexOf) return es_array_indexOf;
	hasRequiredEs_array_indexOf = 1;
	/* eslint-disable es/no-array-prototype-indexof -- required for testing */
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThisClause();
	var $indexOf = requireArrayIncludes().indexOf;
	var arrayMethodIsStrict = requireArrayMethodIsStrict();

	var nativeIndexOf = uncurryThis([].indexOf);

	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / nativeIndexOf([1], 1, -0) < 0;
	var FORCED = NEGATIVE_ZERO || !arrayMethodIsStrict('indexOf');

	// `Array.prototype.indexOf` method
	// https://tc39.es/ecma262/#sec-array.prototype.indexof
	$({ target: 'Array', proto: true, forced: FORCED }, {
	  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
	    var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
	    return NEGATIVE_ZERO
	      // convert -0 to +0
	      ? nativeIndexOf(this, searchElement, fromIndex) || 0
	      : $indexOf(this, searchElement, fromIndex);
	  }
	});
	return es_array_indexOf;
}

var es_array_isArray = {};

var hasRequiredEs_array_isArray;

function requireEs_array_isArray () {
	if (hasRequiredEs_array_isArray) return es_array_isArray;
	hasRequiredEs_array_isArray = 1;
	var $ = require_export();
	var isArray = requireIsArray();

	// `Array.isArray` method
	// https://tc39.es/ecma262/#sec-array.isarray
	$({ target: 'Array', stat: true }, {
	  isArray: isArray
	});
	return es_array_isArray;
}

var iteratorsCore;
var hasRequiredIteratorsCore;

function requireIteratorsCore () {
	if (hasRequiredIteratorsCore) return iteratorsCore;
	hasRequiredIteratorsCore = 1;
	var fails = requireFails();
	var isCallable = requireIsCallable();
	var isObject = requireIsObject();
	var create = requireObjectCreate();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var defineBuiltIn = requireDefineBuiltIn();
	var wellKnownSymbol = requireWellKnownSymbol();
	var IS_PURE = requireIsPure();

	var ITERATOR = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	// `%IteratorPrototype%` object
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	/* eslint-disable es/no-array-prototype-keys -- safe */
	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}

	var NEW_ITERATOR_PROTOTYPE = !isObject(IteratorPrototype) || fails(function () {
	  var test = {};
	  // FF44- legacy iterators case
	  return IteratorPrototype[ITERATOR].call(test) !== test;
	});

	if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};
	else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);

	// `%IteratorPrototype%[@@iterator]()` method
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
	if (!isCallable(IteratorPrototype[ITERATOR])) {
	  defineBuiltIn(IteratorPrototype, ITERATOR, function () {
	    return this;
	  });
	}

	iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};
	return iteratorsCore;
}

var iteratorCreateConstructor;
var hasRequiredIteratorCreateConstructor;

function requireIteratorCreateConstructor () {
	if (hasRequiredIteratorCreateConstructor) return iteratorCreateConstructor;
	hasRequiredIteratorCreateConstructor = 1;
	var IteratorPrototype = requireIteratorsCore().IteratorPrototype;
	var create = requireObjectCreate();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();
	var setToStringTag = requireSetToStringTag();
	var Iterators = requireIterators();

	var returnThis = function () { return this; };

	iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
	  Iterators[TO_STRING_TAG] = returnThis;
	  return IteratorConstructor;
	};
	return iteratorCreateConstructor;
}

var iteratorDefine;
var hasRequiredIteratorDefine;

function requireIteratorDefine () {
	if (hasRequiredIteratorDefine) return iteratorDefine;
	hasRequiredIteratorDefine = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var IS_PURE = requireIsPure();
	var FunctionName = requireFunctionName();
	var isCallable = requireIsCallable();
	var createIteratorConstructor = requireIteratorCreateConstructor();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var setPrototypeOf = requireObjectSetPrototypeOf();
	var setToStringTag = requireSetToStringTag();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var defineBuiltIn = requireDefineBuiltIn();
	var wellKnownSymbol = requireWellKnownSymbol();
	var Iterators = requireIterators();
	var IteratorsCore = requireIteratorsCore();

	var PROPER_FUNCTION_NAME = FunctionName.PROPER;
	var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
	var IteratorPrototype = IteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis = function () { return this; };

	iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    }

	    return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
	      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
	        if (setPrototypeOf) {
	          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
	        } else if (!isCallable(CurrentIteratorPrototype[ITERATOR])) {
	          defineBuiltIn(CurrentIteratorPrototype, ITERATOR, returnThis);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
	      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
	    }
	  }

	  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
	  if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    if (!IS_PURE && CONFIGURABLE_FUNCTION_NAME) {
	      createNonEnumerableProperty(IterablePrototype, 'name', VALUES);
	    } else {
	      INCORRECT_VALUES_NAME = true;
	      defaultIterator = function values() { return call(nativeIterator, this); };
	    }
	  }

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        defineBuiltIn(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
	  }

	  // define iterator
	  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
	    defineBuiltIn(IterablePrototype, ITERATOR, defaultIterator, { name: DEFAULT });
	  }
	  Iterators[NAME] = defaultIterator;

	  return methods;
	};
	return iteratorDefine;
}

var createIterResultObject;
var hasRequiredCreateIterResultObject;

function requireCreateIterResultObject () {
	if (hasRequiredCreateIterResultObject) return createIterResultObject;
	hasRequiredCreateIterResultObject = 1;
	// `CreateIterResultObject` abstract operation
	// https://tc39.es/ecma262/#sec-createiterresultobject
	createIterResultObject = function (value, done) {
	  return { value: value, done: done };
	};
	return createIterResultObject;
}

var es_array_iterator;
var hasRequiredEs_array_iterator;

function requireEs_array_iterator () {
	if (hasRequiredEs_array_iterator) return es_array_iterator;
	hasRequiredEs_array_iterator = 1;
	var toIndexedObject = requireToIndexedObject();
	var addToUnscopables = requireAddToUnscopables();
	var Iterators = requireIterators();
	var InternalStateModule = requireInternalState();
	var defineProperty = requireObjectDefineProperty().f;
	var defineIterator = requireIteratorDefine();
	var createIterResultObject = requireCreateIterResultObject();
	var IS_PURE = requireIsPure();
	var DESCRIPTORS = requireDescriptors();

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.es/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.es/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.es/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.es/ecma262/#sec-createarrayiterator
	es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState(this);
	  var target = state.target;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = null;
	    return createIterResultObject(undefined, true);
	  }
	  switch (state.kind) {
	    case 'keys': return createIterResultObject(index, false);
	    case 'values': return createIterResultObject(target[index], false);
	  } return createIterResultObject([index, target[index]], false);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.es/ecma262/#sec-createmappedargumentsobject
	var values = Iterators.Arguments = Iterators.Array;

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	// V8 ~ Chrome 45- bug
	if (!IS_PURE && DESCRIPTORS && values.name !== 'values') try {
	  defineProperty(values, 'name', { value: 'values' });
	} catch (error) { /* empty */ }
	return es_array_iterator;
}

var es_array_join = {};

var hasRequiredEs_array_join;

function requireEs_array_join () {
	if (hasRequiredEs_array_join) return es_array_join;
	hasRequiredEs_array_join = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var IndexedObject = requireIndexedObject();
	var toIndexedObject = requireToIndexedObject();
	var arrayMethodIsStrict = requireArrayMethodIsStrict();

	var nativeJoin = uncurryThis([].join);

	var ES3_STRINGS = IndexedObject !== Object;
	var FORCED = ES3_STRINGS || !arrayMethodIsStrict('join', ',');

	// `Array.prototype.join` method
	// https://tc39.es/ecma262/#sec-array.prototype.join
	$({ target: 'Array', proto: true, forced: FORCED }, {
	  join: function join(separator) {
	    return nativeJoin(toIndexedObject(this), separator === undefined ? ',' : separator);
	  }
	});
	return es_array_join;
}

var es_array_lastIndexOf = {};

var arrayLastIndexOf;
var hasRequiredArrayLastIndexOf;

function requireArrayLastIndexOf () {
	if (hasRequiredArrayLastIndexOf) return arrayLastIndexOf;
	hasRequiredArrayLastIndexOf = 1;
	/* eslint-disable es/no-array-prototype-lastindexof -- safe */
	var apply = requireFunctionApply();
	var toIndexedObject = requireToIndexedObject();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var arrayMethodIsStrict = requireArrayMethodIsStrict();

	var min = Math.min;
	var $lastIndexOf = [].lastIndexOf;
	var NEGATIVE_ZERO = !!$lastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
	var STRICT_METHOD = arrayMethodIsStrict('lastIndexOf');
	var FORCED = NEGATIVE_ZERO || !STRICT_METHOD;

	// `Array.prototype.lastIndexOf` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
	arrayLastIndexOf = FORCED ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
	  // convert -0 to +0
	  if (NEGATIVE_ZERO) return apply($lastIndexOf, this, arguments) || 0;
	  var O = toIndexedObject(this);
	  var length = lengthOfArrayLike(O);
	  if (length === 0) return -1;
	  var index = length - 1;
	  if (arguments.length > 1) index = min(index, toIntegerOrInfinity(arguments[1]));
	  if (index < 0) index = length + index;
	  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
	  return -1;
	} : $lastIndexOf;
	return arrayLastIndexOf;
}

var hasRequiredEs_array_lastIndexOf;

function requireEs_array_lastIndexOf () {
	if (hasRequiredEs_array_lastIndexOf) return es_array_lastIndexOf;
	hasRequiredEs_array_lastIndexOf = 1;
	var $ = require_export();
	var lastIndexOf = requireArrayLastIndexOf();

	// `Array.prototype.lastIndexOf` method
	// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
	// eslint-disable-next-line es/no-array-prototype-lastindexof -- required for testing
	$({ target: 'Array', proto: true, forced: lastIndexOf !== [].lastIndexOf }, {
	  lastIndexOf: lastIndexOf
	});
	return es_array_lastIndexOf;
}

var es_array_map = {};

var hasRequiredEs_array_map;

function requireEs_array_map () {
	if (hasRequiredEs_array_map) return es_array_map;
	hasRequiredEs_array_map = 1;
	var $ = require_export();
	var $map = requireArrayIteration().map;
	var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');

	// `Array.prototype.map` method
	// https://tc39.es/ecma262/#sec-array.prototype.map
	// with adding support of @@species
	$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
	  map: function map(callbackfn /* , thisArg */) {
	    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	return es_array_map;
}

var es_array_of = {};

var hasRequiredEs_array_of;

function requireEs_array_of () {
	if (hasRequiredEs_array_of) return es_array_of;
	hasRequiredEs_array_of = 1;
	var $ = require_export();
	var fails = requireFails();
	var isConstructor = requireIsConstructor();
	var createProperty = requireCreateProperty();

	var $Array = Array;

	var ISNT_GENERIC = fails(function () {
	  function F() { /* empty */ }
	  // eslint-disable-next-line es/no-array-of -- safe
	  return !($Array.of.call(F) instanceof F);
	});

	// `Array.of` method
	// https://tc39.es/ecma262/#sec-array.of
	// WebKit Array.of isn't generic
	$({ target: 'Array', stat: true, forced: ISNT_GENERIC }, {
	  of: function of(/* ...args */) {
	    var index = 0;
	    var argumentsLength = arguments.length;
	    var result = new (isConstructor(this) ? this : $Array)(argumentsLength);
	    while (argumentsLength > index) createProperty(result, index, arguments[index++]);
	    result.length = argumentsLength;
	    return result;
	  }
	});
	return es_array_of;
}

var es_array_push = {};

var arraySetLength;
var hasRequiredArraySetLength;

function requireArraySetLength () {
	if (hasRequiredArraySetLength) return arraySetLength;
	hasRequiredArraySetLength = 1;
	var DESCRIPTORS = requireDescriptors();
	var isArray = requireIsArray();

	var $TypeError = TypeError;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Safari < 13 does not throw an error in this case
	var SILENT_ON_NON_WRITABLE_LENGTH_SET = DESCRIPTORS && !function () {
	  // makes no sense without proper strict mode support
	  if (this !== undefined) return true;
	  try {
	    // eslint-disable-next-line es/no-object-defineproperty -- safe
	    Object.defineProperty([], 'length', { writable: false }).length = 1;
	  } catch (error) {
	    return error instanceof TypeError;
	  }
	}();

	arraySetLength = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function (O, length) {
	  if (isArray(O) && !getOwnPropertyDescriptor(O, 'length').writable) {
	    throw new $TypeError('Cannot set read only .length');
	  } return O.length = length;
	} : function (O, length) {
	  return O.length = length;
	};
	return arraySetLength;
}

var hasRequiredEs_array_push;

function requireEs_array_push () {
	if (hasRequiredEs_array_push) return es_array_push;
	hasRequiredEs_array_push = 1;
	var $ = require_export();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var setArrayLength = requireArraySetLength();
	var doesNotExceedSafeInteger = requireDoesNotExceedSafeInteger();
	var fails = requireFails();

	var INCORRECT_TO_LENGTH = fails(function () {
	  return [].push.call({ length: 0x100000000 }, 1) !== 4294967297;
	});

	// V8 <= 121 and Safari <= 15.4; FF < 23 throws InternalError
	// https://bugs.chromium.org/p/v8/issues/detail?id=12681
	var properErrorOnNonWritableLength = function () {
	  try {
	    // eslint-disable-next-line es/no-object-defineproperty -- safe
	    Object.defineProperty([], 'length', { writable: false }).push();
	  } catch (error) {
	    return error instanceof TypeError;
	  }
	};

	var FORCED = INCORRECT_TO_LENGTH || !properErrorOnNonWritableLength();

	// `Array.prototype.push` method
	// https://tc39.es/ecma262/#sec-array.prototype.push
	$({ target: 'Array', proto: true, arity: 1, forced: FORCED }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  push: function push(item) {
	    var O = toObject(this);
	    var len = lengthOfArrayLike(O);
	    var argCount = arguments.length;
	    doesNotExceedSafeInteger(len + argCount);
	    for (var i = 0; i < argCount; i++) {
	      O[len] = arguments[i];
	      len++;
	    }
	    setArrayLength(O, len);
	    return len;
	  }
	});
	return es_array_push;
}

var es_array_reduce = {};

var arrayReduce;
var hasRequiredArrayReduce;

function requireArrayReduce () {
	if (hasRequiredArrayReduce) return arrayReduce;
	hasRequiredArrayReduce = 1;
	var aCallable = requireACallable();
	var toObject = requireToObject();
	var IndexedObject = requireIndexedObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();

	var $TypeError = TypeError;

	var REDUCE_EMPTY = 'Reduce of empty array with no initial value';

	// `Array.prototype.{ reduce, reduceRight }` methods implementation
	var createMethod = function (IS_RIGHT) {
	  return function (that, callbackfn, argumentsLength, memo) {
	    var O = toObject(that);
	    var self = IndexedObject(O);
	    var length = lengthOfArrayLike(O);
	    aCallable(callbackfn);
	    if (length === 0 && argumentsLength < 2) throw new $TypeError(REDUCE_EMPTY);
	    var index = IS_RIGHT ? length - 1 : 0;
	    var i = IS_RIGHT ? -1 : 1;
	    if (argumentsLength < 2) while (true) {
	      if (index in self) {
	        memo = self[index];
	        index += i;
	        break;
	      }
	      index += i;
	      if (IS_RIGHT ? index < 0 : length <= index) {
	        throw new $TypeError(REDUCE_EMPTY);
	      }
	    }
	    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
	      memo = callbackfn(memo, self[index], index, O);
	    }
	    return memo;
	  };
	};

	arrayReduce = {
	  // `Array.prototype.reduce` method
	  // https://tc39.es/ecma262/#sec-array.prototype.reduce
	  left: createMethod(false),
	  // `Array.prototype.reduceRight` method
	  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
	  right: createMethod(true)
	};
	return arrayReduce;
}

var environment;
var hasRequiredEnvironment;

function requireEnvironment () {
	if (hasRequiredEnvironment) return environment;
	hasRequiredEnvironment = 1;
	/* global Bun, Deno -- detection */
	var globalThis = requireGlobalThis();
	var userAgent = requireEnvironmentUserAgent();
	var classof = requireClassofRaw();

	var userAgentStartsWith = function (string) {
	  return userAgent.slice(0, string.length) === string;
	};

	environment = (function () {
	  if (userAgentStartsWith('Bun/')) return 'BUN';
	  if (userAgentStartsWith('Cloudflare-Workers')) return 'CLOUDFLARE';
	  if (userAgentStartsWith('Deno/')) return 'DENO';
	  if (userAgentStartsWith('Node.js/')) return 'NODE';
	  if (globalThis.Bun && typeof Bun.version == 'string') return 'BUN';
	  if (globalThis.Deno && typeof Deno.version == 'object') return 'DENO';
	  if (classof(globalThis.process) === 'process') return 'NODE';
	  if (globalThis.window && globalThis.document) return 'BROWSER';
	  return 'REST';
	})();
	return environment;
}

var environmentIsNode;
var hasRequiredEnvironmentIsNode;

function requireEnvironmentIsNode () {
	if (hasRequiredEnvironmentIsNode) return environmentIsNode;
	hasRequiredEnvironmentIsNode = 1;
	var ENVIRONMENT = requireEnvironment();

	environmentIsNode = ENVIRONMENT === 'NODE';
	return environmentIsNode;
}

var hasRequiredEs_array_reduce;

function requireEs_array_reduce () {
	if (hasRequiredEs_array_reduce) return es_array_reduce;
	hasRequiredEs_array_reduce = 1;
	var $ = require_export();
	var $reduce = requireArrayReduce().left;
	var arrayMethodIsStrict = requireArrayMethodIsStrict();
	var CHROME_VERSION = requireEnvironmentV8Version();
	var IS_NODE = requireEnvironmentIsNode();

	// Chrome 80-82 has a critical bug
	// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
	var CHROME_BUG = !IS_NODE && CHROME_VERSION > 79 && CHROME_VERSION < 83;
	var FORCED = CHROME_BUG || !arrayMethodIsStrict('reduce');

	// `Array.prototype.reduce` method
	// https://tc39.es/ecma262/#sec-array.prototype.reduce
	$({ target: 'Array', proto: true, forced: FORCED }, {
	  reduce: function reduce(callbackfn /* , initialValue */) {
	    var length = arguments.length;
	    return $reduce(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
	  }
	});
	return es_array_reduce;
}

var es_array_reduceRight = {};

var hasRequiredEs_array_reduceRight;

function requireEs_array_reduceRight () {
	if (hasRequiredEs_array_reduceRight) return es_array_reduceRight;
	hasRequiredEs_array_reduceRight = 1;
	var $ = require_export();
	var $reduceRight = requireArrayReduce().right;
	var arrayMethodIsStrict = requireArrayMethodIsStrict();
	var CHROME_VERSION = requireEnvironmentV8Version();
	var IS_NODE = requireEnvironmentIsNode();

	// Chrome 80-82 has a critical bug
	// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
	var CHROME_BUG = !IS_NODE && CHROME_VERSION > 79 && CHROME_VERSION < 83;
	var FORCED = CHROME_BUG || !arrayMethodIsStrict('reduceRight');

	// `Array.prototype.reduceRight` method
	// https://tc39.es/ecma262/#sec-array.prototype.reduceright
	$({ target: 'Array', proto: true, forced: FORCED }, {
	  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
	    return $reduceRight(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	return es_array_reduceRight;
}

var es_array_reverse = {};

var hasRequiredEs_array_reverse;

function requireEs_array_reverse () {
	if (hasRequiredEs_array_reverse) return es_array_reverse;
	hasRequiredEs_array_reverse = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var isArray = requireIsArray();

	var nativeReverse = uncurryThis([].reverse);
	var test = [1, 2];

	// `Array.prototype.reverse` method
	// https://tc39.es/ecma262/#sec-array.prototype.reverse
	// fix for Safari 12.0 bug
	// https://bugs.webkit.org/show_bug.cgi?id=188794
	$({ target: 'Array', proto: true, forced: String(test) === String(test.reverse()) }, {
	  reverse: function reverse() {
	    // eslint-disable-next-line no-self-assign -- dirty hack
	    if (isArray(this)) this.length = this.length;
	    return nativeReverse(this);
	  }
	});
	return es_array_reverse;
}

var es_array_slice = {};

var hasRequiredEs_array_slice;

function requireEs_array_slice () {
	if (hasRequiredEs_array_slice) return es_array_slice;
	hasRequiredEs_array_slice = 1;
	var $ = require_export();
	var isArray = requireIsArray();
	var isConstructor = requireIsConstructor();
	var isObject = requireIsObject();
	var toAbsoluteIndex = requireToAbsoluteIndex();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var toIndexedObject = requireToIndexedObject();
	var createProperty = requireCreateProperty();
	var wellKnownSymbol = requireWellKnownSymbol();
	var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();
	var nativeSlice = requireArraySlice();

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');

	var SPECIES = wellKnownSymbol('species');
	var $Array = Array;
	var max = Math.max;

	// `Array.prototype.slice` method
	// https://tc39.es/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = lengthOfArrayLike(O);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	    var Constructor, result, n;
	    if (isArray(O)) {
	      Constructor = O.constructor;
	      // cross-realm fallback
	      if (isConstructor(Constructor) && (Constructor === $Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === $Array || Constructor === undefined) {
	        return nativeSlice(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? $Array : Constructor)(max(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});
	return es_array_slice;
}

var es_array_some = {};

var hasRequiredEs_array_some;

function requireEs_array_some () {
	if (hasRequiredEs_array_some) return es_array_some;
	hasRequiredEs_array_some = 1;
	var $ = require_export();
	var $some = requireArrayIteration().some;
	var arrayMethodIsStrict = requireArrayMethodIsStrict();

	var STRICT_METHOD = arrayMethodIsStrict('some');

	// `Array.prototype.some` method
	// https://tc39.es/ecma262/#sec-array.prototype.some
	$({ target: 'Array', proto: true, forced: !STRICT_METHOD }, {
	  some: function some(callbackfn /* , thisArg */) {
	    return $some(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	return es_array_some;
}

var es_array_sort = {};

var arraySort;
var hasRequiredArraySort;

function requireArraySort () {
	if (hasRequiredArraySort) return arraySort;
	hasRequiredArraySort = 1;
	var arraySlice = requireArraySlice();

	var floor = Math.floor;

	var sort = function (array, comparefn) {
	  var length = array.length;

	  if (length < 8) {
	    // insertion sort
	    var i = 1;
	    var element, j;

	    while (i < length) {
	      j = i;
	      element = array[i];
	      while (j && comparefn(array[j - 1], element) > 0) {
	        array[j] = array[--j];
	      }
	      if (j !== i++) array[j] = element;
	    }
	  } else {
	    // merge sort
	    var middle = floor(length / 2);
	    var left = sort(arraySlice(array, 0, middle), comparefn);
	    var right = sort(arraySlice(array, middle), comparefn);
	    var llength = left.length;
	    var rlength = right.length;
	    var lindex = 0;
	    var rindex = 0;

	    while (lindex < llength || rindex < rlength) {
	      array[lindex + rindex] = (lindex < llength && rindex < rlength)
	        ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
	        : lindex < llength ? left[lindex++] : right[rindex++];
	    }
	  }

	  return array;
	};

	arraySort = sort;
	return arraySort;
}

var environmentFfVersion;
var hasRequiredEnvironmentFfVersion;

function requireEnvironmentFfVersion () {
	if (hasRequiredEnvironmentFfVersion) return environmentFfVersion;
	hasRequiredEnvironmentFfVersion = 1;
	var userAgent = requireEnvironmentUserAgent();

	var firefox = userAgent.match(/firefox\/(\d+)/i);

	environmentFfVersion = !!firefox && +firefox[1];
	return environmentFfVersion;
}

var environmentIsIeOrEdge;
var hasRequiredEnvironmentIsIeOrEdge;

function requireEnvironmentIsIeOrEdge () {
	if (hasRequiredEnvironmentIsIeOrEdge) return environmentIsIeOrEdge;
	hasRequiredEnvironmentIsIeOrEdge = 1;
	var UA = requireEnvironmentUserAgent();

	environmentIsIeOrEdge = /MSIE|Trident/.test(UA);
	return environmentIsIeOrEdge;
}

var environmentWebkitVersion;
var hasRequiredEnvironmentWebkitVersion;

function requireEnvironmentWebkitVersion () {
	if (hasRequiredEnvironmentWebkitVersion) return environmentWebkitVersion;
	hasRequiredEnvironmentWebkitVersion = 1;
	var userAgent = requireEnvironmentUserAgent();

	var webkit = userAgent.match(/AppleWebKit\/(\d+)\./);

	environmentWebkitVersion = !!webkit && +webkit[1];
	return environmentWebkitVersion;
}

var hasRequiredEs_array_sort;

function requireEs_array_sort () {
	if (hasRequiredEs_array_sort) return es_array_sort;
	hasRequiredEs_array_sort = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var aCallable = requireACallable();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var deletePropertyOrThrow = requireDeletePropertyOrThrow();
	var toString = requireToString();
	var fails = requireFails();
	var internalSort = requireArraySort();
	var arrayMethodIsStrict = requireArrayMethodIsStrict();
	var FF = requireEnvironmentFfVersion();
	var IE_OR_EDGE = requireEnvironmentIsIeOrEdge();
	var V8 = requireEnvironmentV8Version();
	var WEBKIT = requireEnvironmentWebkitVersion();

	var test = [];
	var nativeSort = uncurryThis(test.sort);
	var push = uncurryThis(test.push);

	// IE8-
	var FAILS_ON_UNDEFINED = fails(function () {
	  test.sort(undefined);
	});
	// V8 bug
	var FAILS_ON_NULL = fails(function () {
	  test.sort(null);
	});
	// Old WebKit
	var STRICT_METHOD = arrayMethodIsStrict('sort');

	var STABLE_SORT = !fails(function () {
	  // feature detection can be too slow, so check engines versions
	  if (V8) return V8 < 70;
	  if (FF && FF > 3) return;
	  if (IE_OR_EDGE) return true;
	  if (WEBKIT) return WEBKIT < 603;

	  var result = '';
	  var code, chr, value, index;

	  // generate an array with more 512 elements (Chakra and old V8 fails only in this case)
	  for (code = 65; code < 76; code++) {
	    chr = String.fromCharCode(code);

	    switch (code) {
	      case 66: case 69: case 70: case 72: value = 3; break;
	      case 68: case 71: value = 4; break;
	      default: value = 2;
	    }

	    for (index = 0; index < 47; index++) {
	      test.push({ k: chr + index, v: value });
	    }
	  }

	  test.sort(function (a, b) { return b.v - a.v; });

	  for (index = 0; index < test.length; index++) {
	    chr = test[index].k.charAt(0);
	    if (result.charAt(result.length - 1) !== chr) result += chr;
	  }

	  return result !== 'DGBEFHACIJK';
	});

	var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD || !STABLE_SORT;

	var getSortCompare = function (comparefn) {
	  return function (x, y) {
	    if (y === undefined) return -1;
	    if (x === undefined) return 1;
	    if (comparefn !== undefined) return +comparefn(x, y) || 0;
	    return toString(x) > toString(y) ? 1 : -1;
	  };
	};

	// `Array.prototype.sort` method
	// https://tc39.es/ecma262/#sec-array.prototype.sort
	$({ target: 'Array', proto: true, forced: FORCED }, {
	  sort: function sort(comparefn) {
	    if (comparefn !== undefined) aCallable(comparefn);

	    var array = toObject(this);

	    if (STABLE_SORT) return comparefn === undefined ? nativeSort(array) : nativeSort(array, comparefn);

	    var items = [];
	    var arrayLength = lengthOfArrayLike(array);
	    var itemsLength, index;

	    for (index = 0; index < arrayLength; index++) {
	      if (index in array) push(items, array[index]);
	    }

	    internalSort(items, getSortCompare(comparefn));

	    itemsLength = lengthOfArrayLike(items);
	    index = 0;

	    while (index < itemsLength) array[index] = items[index++];
	    while (index < arrayLength) deletePropertyOrThrow(array, index++);

	    return array;
	  }
	});
	return es_array_sort;
}

var es_array_species = {};

var setSpecies;
var hasRequiredSetSpecies;

function requireSetSpecies () {
	if (hasRequiredSetSpecies) return setSpecies;
	hasRequiredSetSpecies = 1;
	var getBuiltIn = requireGetBuiltIn();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var wellKnownSymbol = requireWellKnownSymbol();
	var DESCRIPTORS = requireDescriptors();

	var SPECIES = wellKnownSymbol('species');

	setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);

	  if (DESCRIPTORS && Constructor && !Constructor[SPECIES]) {
	    defineBuiltInAccessor(Constructor, SPECIES, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};
	return setSpecies;
}

var hasRequiredEs_array_species;

function requireEs_array_species () {
	if (hasRequiredEs_array_species) return es_array_species;
	hasRequiredEs_array_species = 1;
	var setSpecies = requireSetSpecies();

	// `Array[@@species]` getter
	// https://tc39.es/ecma262/#sec-get-array-@@species
	setSpecies('Array');
	return es_array_species;
}

var es_array_splice = {};

var hasRequiredEs_array_splice;

function requireEs_array_splice () {
	if (hasRequiredEs_array_splice) return es_array_splice;
	hasRequiredEs_array_splice = 1;
	var $ = require_export();
	var toObject = requireToObject();
	var toAbsoluteIndex = requireToAbsoluteIndex();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var setArrayLength = requireArraySetLength();
	var doesNotExceedSafeInteger = requireDoesNotExceedSafeInteger();
	var arraySpeciesCreate = requireArraySpeciesCreate();
	var createProperty = requireCreateProperty();
	var deletePropertyOrThrow = requireDeletePropertyOrThrow();
	var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();

	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

	var max = Math.max;
	var min = Math.min;

	// `Array.prototype.splice` method
	// https://tc39.es/ecma262/#sec-array.prototype.splice
	// with adding support of @@species
	$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
	  splice: function splice(start, deleteCount /* , ...items */) {
	    var O = toObject(this);
	    var len = lengthOfArrayLike(O);
	    var actualStart = toAbsoluteIndex(start, len);
	    var argumentsLength = arguments.length;
	    var insertCount, actualDeleteCount, A, k, from, to;
	    if (argumentsLength === 0) {
	      insertCount = actualDeleteCount = 0;
	    } else if (argumentsLength === 1) {
	      insertCount = 0;
	      actualDeleteCount = len - actualStart;
	    } else {
	      insertCount = argumentsLength - 2;
	      actualDeleteCount = min(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
	    }
	    doesNotExceedSafeInteger(len + insertCount - actualDeleteCount);
	    A = arraySpeciesCreate(O, actualDeleteCount);
	    for (k = 0; k < actualDeleteCount; k++) {
	      from = actualStart + k;
	      if (from in O) createProperty(A, k, O[from]);
	    }
	    A.length = actualDeleteCount;
	    if (insertCount < actualDeleteCount) {
	      for (k = actualStart; k < len - actualDeleteCount; k++) {
	        from = k + actualDeleteCount;
	        to = k + insertCount;
	        if (from in O) O[to] = O[from];
	        else deletePropertyOrThrow(O, to);
	      }
	      for (k = len; k > len - actualDeleteCount + insertCount; k--) deletePropertyOrThrow(O, k - 1);
	    } else if (insertCount > actualDeleteCount) {
	      for (k = len - actualDeleteCount; k > actualStart; k--) {
	        from = k + actualDeleteCount - 1;
	        to = k + insertCount - 1;
	        if (from in O) O[to] = O[from];
	        else deletePropertyOrThrow(O, to);
	      }
	    }
	    for (k = 0; k < insertCount; k++) {
	      O[k + actualStart] = arguments[k + 2];
	    }
	    setArrayLength(O, len - actualDeleteCount + insertCount);
	    return A;
	  }
	});
	return es_array_splice;
}

var es_array_toReversed = {};

var arrayToReversed;
var hasRequiredArrayToReversed;

function requireArrayToReversed () {
	if (hasRequiredArrayToReversed) return arrayToReversed;
	hasRequiredArrayToReversed = 1;
	var lengthOfArrayLike = requireLengthOfArrayLike();

	// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.toReversed
	// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.toReversed
	arrayToReversed = function (O, C) {
	  var len = lengthOfArrayLike(O);
	  var A = new C(len);
	  var k = 0;
	  for (; k < len; k++) A[k] = O[len - k - 1];
	  return A;
	};
	return arrayToReversed;
}

var hasRequiredEs_array_toReversed;

function requireEs_array_toReversed () {
	if (hasRequiredEs_array_toReversed) return es_array_toReversed;
	hasRequiredEs_array_toReversed = 1;
	var $ = require_export();
	var arrayToReversed = requireArrayToReversed();
	var toIndexedObject = requireToIndexedObject();
	var addToUnscopables = requireAddToUnscopables();

	var $Array = Array;

	// `Array.prototype.toReversed` method
	// https://tc39.es/ecma262/#sec-array.prototype.toreversed
	$({ target: 'Array', proto: true }, {
	  toReversed: function toReversed() {
	    return arrayToReversed(toIndexedObject(this), $Array);
	  }
	});

	addToUnscopables('toReversed');
	return es_array_toReversed;
}

var es_array_toSorted = {};

var arrayFromConstructorAndList;
var hasRequiredArrayFromConstructorAndList;

function requireArrayFromConstructorAndList () {
	if (hasRequiredArrayFromConstructorAndList) return arrayFromConstructorAndList;
	hasRequiredArrayFromConstructorAndList = 1;
	var lengthOfArrayLike = requireLengthOfArrayLike();

	arrayFromConstructorAndList = function (Constructor, list, $length) {
	  var index = 0;
	  var length = arguments.length > 2 ? $length : lengthOfArrayLike(list);
	  var result = new Constructor(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	};
	return arrayFromConstructorAndList;
}

var getBuiltInPrototypeMethod;
var hasRequiredGetBuiltInPrototypeMethod;

function requireGetBuiltInPrototypeMethod () {
	if (hasRequiredGetBuiltInPrototypeMethod) return getBuiltInPrototypeMethod;
	hasRequiredGetBuiltInPrototypeMethod = 1;
	var globalThis = requireGlobalThis();

	getBuiltInPrototypeMethod = function (CONSTRUCTOR, METHOD) {
	  var Constructor = globalThis[CONSTRUCTOR];
	  var Prototype = Constructor && Constructor.prototype;
	  return Prototype && Prototype[METHOD];
	};
	return getBuiltInPrototypeMethod;
}

var hasRequiredEs_array_toSorted;

function requireEs_array_toSorted () {
	if (hasRequiredEs_array_toSorted) return es_array_toSorted;
	hasRequiredEs_array_toSorted = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var aCallable = requireACallable();
	var toIndexedObject = requireToIndexedObject();
	var arrayFromConstructorAndList = requireArrayFromConstructorAndList();
	var getBuiltInPrototypeMethod = requireGetBuiltInPrototypeMethod();
	var addToUnscopables = requireAddToUnscopables();

	var $Array = Array;
	var sort = uncurryThis(getBuiltInPrototypeMethod('Array', 'sort'));

	// `Array.prototype.toSorted` method
	// https://tc39.es/ecma262/#sec-array.prototype.tosorted
	$({ target: 'Array', proto: true }, {
	  toSorted: function toSorted(compareFn) {
	    if (compareFn !== undefined) aCallable(compareFn);
	    var O = toIndexedObject(this);
	    var A = arrayFromConstructorAndList($Array, O);
	    return sort(A, compareFn);
	  }
	});

	addToUnscopables('toSorted');
	return es_array_toSorted;
}

var es_array_toSpliced = {};

var hasRequiredEs_array_toSpliced;

function requireEs_array_toSpliced () {
	if (hasRequiredEs_array_toSpliced) return es_array_toSpliced;
	hasRequiredEs_array_toSpliced = 1;
	var $ = require_export();
	var addToUnscopables = requireAddToUnscopables();
	var doesNotExceedSafeInteger = requireDoesNotExceedSafeInteger();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var toAbsoluteIndex = requireToAbsoluteIndex();
	var toIndexedObject = requireToIndexedObject();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();

	var $Array = Array;
	var max = Math.max;
	var min = Math.min;

	// `Array.prototype.toSpliced` method
	// https://tc39.es/ecma262/#sec-array.prototype.tospliced
	$({ target: 'Array', proto: true }, {
	  toSpliced: function toSpliced(start, deleteCount /* , ...items */) {
	    var O = toIndexedObject(this);
	    var len = lengthOfArrayLike(O);
	    var actualStart = toAbsoluteIndex(start, len);
	    var argumentsLength = arguments.length;
	    var k = 0;
	    var insertCount, actualDeleteCount, newLen, A;
	    if (argumentsLength === 0) {
	      insertCount = actualDeleteCount = 0;
	    } else if (argumentsLength === 1) {
	      insertCount = 0;
	      actualDeleteCount = len - actualStart;
	    } else {
	      insertCount = argumentsLength - 2;
	      actualDeleteCount = min(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
	    }
	    newLen = doesNotExceedSafeInteger(len + insertCount - actualDeleteCount);
	    A = $Array(newLen);

	    for (; k < actualStart; k++) A[k] = O[k];
	    for (; k < actualStart + insertCount; k++) A[k] = arguments[k - actualStart + 2];
	    for (; k < newLen; k++) A[k] = O[k + actualDeleteCount - insertCount];

	    return A;
	  }
	});

	addToUnscopables('toSpliced');
	return es_array_toSpliced;
}

var es_array_unscopables_flat = {};

var hasRequiredEs_array_unscopables_flat;

function requireEs_array_unscopables_flat () {
	if (hasRequiredEs_array_unscopables_flat) return es_array_unscopables_flat;
	hasRequiredEs_array_unscopables_flat = 1;
	// this method was added to unscopables after implementation
	// in popular engines, so it's moved to a separate module
	var addToUnscopables = requireAddToUnscopables();

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('flat');
	return es_array_unscopables_flat;
}

var es_array_unscopables_flatMap = {};

var hasRequiredEs_array_unscopables_flatMap;

function requireEs_array_unscopables_flatMap () {
	if (hasRequiredEs_array_unscopables_flatMap) return es_array_unscopables_flatMap;
	hasRequiredEs_array_unscopables_flatMap = 1;
	// this method was added to unscopables after implementation
	// in popular engines, so it's moved to a separate module
	var addToUnscopables = requireAddToUnscopables();

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('flatMap');
	return es_array_unscopables_flatMap;
}

var es_array_unshift = {};

var hasRequiredEs_array_unshift;

function requireEs_array_unshift () {
	if (hasRequiredEs_array_unshift) return es_array_unshift;
	hasRequiredEs_array_unshift = 1;
	var $ = require_export();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var setArrayLength = requireArraySetLength();
	var deletePropertyOrThrow = requireDeletePropertyOrThrow();
	var doesNotExceedSafeInteger = requireDoesNotExceedSafeInteger();

	// IE8-
	var INCORRECT_RESULT = [].unshift(0) !== 1;

	// V8 ~ Chrome < 71 and Safari <= 15.4, FF < 23 throws InternalError
	var properErrorOnNonWritableLength = function () {
	  try {
	    // eslint-disable-next-line es/no-object-defineproperty -- safe
	    Object.defineProperty([], 'length', { writable: false }).unshift();
	  } catch (error) {
	    return error instanceof TypeError;
	  }
	};

	var FORCED = INCORRECT_RESULT || !properErrorOnNonWritableLength();

	// `Array.prototype.unshift` method
	// https://tc39.es/ecma262/#sec-array.prototype.unshift
	$({ target: 'Array', proto: true, arity: 1, forced: FORCED }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  unshift: function unshift(item) {
	    var O = toObject(this);
	    var len = lengthOfArrayLike(O);
	    var argCount = arguments.length;
	    if (argCount) {
	      doesNotExceedSafeInteger(len + argCount);
	      var k = len;
	      while (k--) {
	        var to = k + argCount;
	        if (k in O) O[to] = O[k];
	        else deletePropertyOrThrow(O, to);
	      }
	      for (var j = 0; j < argCount; j++) {
	        O[j] = arguments[j];
	      }
	    } return setArrayLength(O, len + argCount);
	  }
	});
	return es_array_unshift;
}

var es_array_with = {};

var arrayWith;
var hasRequiredArrayWith;

function requireArrayWith () {
	if (hasRequiredArrayWith) return arrayWith;
	hasRequiredArrayWith = 1;
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();

	var $RangeError = RangeError;

	// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.with
	// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.with
	arrayWith = function (O, C, index, value) {
	  var len = lengthOfArrayLike(O);
	  var relativeIndex = toIntegerOrInfinity(index);
	  var actualIndex = relativeIndex < 0 ? len + relativeIndex : relativeIndex;
	  if (actualIndex >= len || actualIndex < 0) throw new $RangeError('Incorrect index');
	  var A = new C(len);
	  var k = 0;
	  for (; k < len; k++) A[k] = k === actualIndex ? value : O[k];
	  return A;
	};
	return arrayWith;
}

var hasRequiredEs_array_with;

function requireEs_array_with () {
	if (hasRequiredEs_array_with) return es_array_with;
	hasRequiredEs_array_with = 1;
	var $ = require_export();
	var arrayWith = requireArrayWith();
	var toIndexedObject = requireToIndexedObject();

	var $Array = Array;

	// `Array.prototype.with` method
	// https://tc39.es/ecma262/#sec-array.prototype.with
	$({ target: 'Array', proto: true }, {
	  'with': function (index, value) {
	    return arrayWith(toIndexedObject(this), $Array, index, value);
	  }
	});
	return es_array_with;
}

var es_arrayBuffer_constructor = {};

var arrayBufferBasicDetection;
var hasRequiredArrayBufferBasicDetection;

function requireArrayBufferBasicDetection () {
	if (hasRequiredArrayBufferBasicDetection) return arrayBufferBasicDetection;
	hasRequiredArrayBufferBasicDetection = 1;
	// eslint-disable-next-line es/no-typed-arrays -- safe
	arrayBufferBasicDetection = typeof ArrayBuffer != 'undefined' && typeof DataView != 'undefined';
	return arrayBufferBasicDetection;
}

var defineBuiltIns;
var hasRequiredDefineBuiltIns;

function requireDefineBuiltIns () {
	if (hasRequiredDefineBuiltIns) return defineBuiltIns;
	hasRequiredDefineBuiltIns = 1;
	var defineBuiltIn = requireDefineBuiltIn();

	defineBuiltIns = function (target, src, options) {
	  for (var key in src) defineBuiltIn(target, key, src[key], options);
	  return target;
	};
	return defineBuiltIns;
}

var anInstance;
var hasRequiredAnInstance;

function requireAnInstance () {
	if (hasRequiredAnInstance) return anInstance;
	hasRequiredAnInstance = 1;
	var isPrototypeOf = requireObjectIsPrototypeOf();

	var $TypeError = TypeError;

	anInstance = function (it, Prototype) {
	  if (isPrototypeOf(Prototype, it)) return it;
	  throw new $TypeError('Incorrect invocation');
	};
	return anInstance;
}

var toIndex;
var hasRequiredToIndex;

function requireToIndex () {
	if (hasRequiredToIndex) return toIndex;
	hasRequiredToIndex = 1;
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var toLength = requireToLength();

	var $RangeError = RangeError;

	// `ToIndex` abstract operation
	// https://tc39.es/ecma262/#sec-toindex
	toIndex = function (it) {
	  if (it === undefined) return 0;
	  var number = toIntegerOrInfinity(it);
	  var length = toLength(number);
	  if (number !== length) throw new $RangeError('Wrong length or index');
	  return length;
	};
	return toIndex;
}

var mathSign;
var hasRequiredMathSign;

function requireMathSign () {
	if (hasRequiredMathSign) return mathSign;
	hasRequiredMathSign = 1;
	// `Math.sign` method implementation
	// https://tc39.es/ecma262/#sec-math.sign
	// eslint-disable-next-line es/no-math-sign -- safe
	mathSign = Math.sign || function sign(x) {
	  var n = +x;
	  // eslint-disable-next-line no-self-compare -- NaN check
	  return n === 0 || n !== n ? n : n < 0 ? -1 : 1;
	};
	return mathSign;
}

var mathFloatRound;
var hasRequiredMathFloatRound;

function requireMathFloatRound () {
	if (hasRequiredMathFloatRound) return mathFloatRound;
	hasRequiredMathFloatRound = 1;
	var sign = requireMathSign();

	var abs = Math.abs;

	var EPSILON = 2.220446049250313e-16; // Number.EPSILON
	var INVERSE_EPSILON = 1 / EPSILON;

	var roundTiesToEven = function (n) {
	  return n + INVERSE_EPSILON - INVERSE_EPSILON;
	};

	mathFloatRound = function (x, FLOAT_EPSILON, FLOAT_MAX_VALUE, FLOAT_MIN_VALUE) {
	  var n = +x;
	  var absolute = abs(n);
	  var s = sign(n);
	  if (absolute < FLOAT_MIN_VALUE) return s * roundTiesToEven(absolute / FLOAT_MIN_VALUE / FLOAT_EPSILON) * FLOAT_MIN_VALUE * FLOAT_EPSILON;
	  var a = (1 + FLOAT_EPSILON / EPSILON) * absolute;
	  var result = a - (a - absolute);
	  // eslint-disable-next-line no-self-compare -- NaN check
	  if (result > FLOAT_MAX_VALUE || result !== result) return s * Infinity;
	  return s * result;
	};
	return mathFloatRound;
}

var mathFround;
var hasRequiredMathFround;

function requireMathFround () {
	if (hasRequiredMathFround) return mathFround;
	hasRequiredMathFround = 1;
	var floatRound = requireMathFloatRound();

	var FLOAT32_EPSILON = 1.1920928955078125e-7; // 2 ** -23;
	var FLOAT32_MAX_VALUE = 3.4028234663852886e+38; // 2 ** 128 - 2 ** 104
	var FLOAT32_MIN_VALUE = 1.1754943508222875e-38; // 2 ** -126;

	// `Math.fround` method implementation
	// https://tc39.es/ecma262/#sec-math.fround
	// eslint-disable-next-line es/no-math-fround -- safe
	mathFround = Math.fround || function fround(x) {
	  return floatRound(x, FLOAT32_EPSILON, FLOAT32_MAX_VALUE, FLOAT32_MIN_VALUE);
	};
	return mathFround;
}

var ieee754;
var hasRequiredIeee754;

function requireIeee754 () {
	if (hasRequiredIeee754) return ieee754;
	hasRequiredIeee754 = 1;
	// IEEE754 conversions based on https://github.com/feross/ieee754
	var $Array = Array;
	var abs = Math.abs;
	var pow = Math.pow;
	var floor = Math.floor;
	var log = Math.log;
	var LN2 = Math.LN2;

	var pack = function (number, mantissaLength, bytes) {
	  var buffer = $Array(bytes);
	  var exponentLength = bytes * 8 - mantissaLength - 1;
	  var eMax = (1 << exponentLength) - 1;
	  var eBias = eMax >> 1;
	  var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
	  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
	  var index = 0;
	  var exponent, mantissa, c;
	  number = abs(number);
	  // eslint-disable-next-line no-self-compare -- NaN check
	  if (number !== number || number === Infinity) {
	    // eslint-disable-next-line no-self-compare -- NaN check
	    mantissa = number !== number ? 1 : 0;
	    exponent = eMax;
	  } else {
	    exponent = floor(log(number) / LN2);
	    c = pow(2, -exponent);
	    if (number * c < 1) {
	      exponent--;
	      c *= 2;
	    }
	    if (exponent + eBias >= 1) {
	      number += rt / c;
	    } else {
	      number += rt * pow(2, 1 - eBias);
	    }
	    if (number * c >= 2) {
	      exponent++;
	      c /= 2;
	    }
	    if (exponent + eBias >= eMax) {
	      mantissa = 0;
	      exponent = eMax;
	    } else if (exponent + eBias >= 1) {
	      mantissa = (number * c - 1) * pow(2, mantissaLength);
	      exponent += eBias;
	    } else {
	      mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
	      exponent = 0;
	    }
	  }
	  while (mantissaLength >= 8) {
	    buffer[index++] = mantissa & 255;
	    mantissa /= 256;
	    mantissaLength -= 8;
	  }
	  exponent = exponent << mantissaLength | mantissa;
	  exponentLength += mantissaLength;
	  while (exponentLength > 0) {
	    buffer[index++] = exponent & 255;
	    exponent /= 256;
	    exponentLength -= 8;
	  }
	  buffer[index - 1] |= sign * 128;
	  return buffer;
	};

	var unpack = function (buffer, mantissaLength) {
	  var bytes = buffer.length;
	  var exponentLength = bytes * 8 - mantissaLength - 1;
	  var eMax = (1 << exponentLength) - 1;
	  var eBias = eMax >> 1;
	  var nBits = exponentLength - 7;
	  var index = bytes - 1;
	  var sign = buffer[index--];
	  var exponent = sign & 127;
	  var mantissa;
	  sign >>= 7;
	  while (nBits > 0) {
	    exponent = exponent * 256 + buffer[index--];
	    nBits -= 8;
	  }
	  mantissa = exponent & (1 << -nBits) - 1;
	  exponent >>= -nBits;
	  nBits += mantissaLength;
	  while (nBits > 0) {
	    mantissa = mantissa * 256 + buffer[index--];
	    nBits -= 8;
	  }
	  if (exponent === 0) {
	    exponent = 1 - eBias;
	  } else if (exponent === eMax) {
	    return mantissa ? NaN : sign ? -Infinity : Infinity;
	  } else {
	    mantissa += pow(2, mantissaLength);
	    exponent -= eBias;
	  } return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
	};

	ieee754 = {
	  pack: pack,
	  unpack: unpack
	};
	return ieee754;
}

var arrayBuffer;
var hasRequiredArrayBuffer;

function requireArrayBuffer () {
	if (hasRequiredArrayBuffer) return arrayBuffer;
	hasRequiredArrayBuffer = 1;
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();
	var DESCRIPTORS = requireDescriptors();
	var NATIVE_ARRAY_BUFFER = requireArrayBufferBasicDetection();
	var FunctionName = requireFunctionName();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var defineBuiltIns = requireDefineBuiltIns();
	var fails = requireFails();
	var anInstance = requireAnInstance();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var toLength = requireToLength();
	var toIndex = requireToIndex();
	var fround = requireMathFround();
	var IEEE754 = requireIeee754();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var setPrototypeOf = requireObjectSetPrototypeOf();
	var arrayFill = requireArrayFill();
	var arraySlice = requireArraySlice();
	var inheritIfRequired = requireInheritIfRequired();
	var copyConstructorProperties = requireCopyConstructorProperties();
	var setToStringTag = requireSetToStringTag();
	var InternalStateModule = requireInternalState();

	var PROPER_FUNCTION_NAME = FunctionName.PROPER;
	var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
	var ARRAY_BUFFER = 'ArrayBuffer';
	var DATA_VIEW = 'DataView';
	var PROTOTYPE = 'prototype';
	var WRONG_LENGTH = 'Wrong length';
	var WRONG_INDEX = 'Wrong index';
	var getInternalArrayBufferState = InternalStateModule.getterFor(ARRAY_BUFFER);
	var getInternalDataViewState = InternalStateModule.getterFor(DATA_VIEW);
	var setInternalState = InternalStateModule.set;
	var NativeArrayBuffer = globalThis[ARRAY_BUFFER];
	var $ArrayBuffer = NativeArrayBuffer;
	var ArrayBufferPrototype = $ArrayBuffer && $ArrayBuffer[PROTOTYPE];
	var $DataView = globalThis[DATA_VIEW];
	var DataViewPrototype = $DataView && $DataView[PROTOTYPE];
	var ObjectPrototype = Object.prototype;
	var Array = globalThis.Array;
	var RangeError = globalThis.RangeError;
	var fill = uncurryThis(arrayFill);
	var reverse = uncurryThis([].reverse);

	var packIEEE754 = IEEE754.pack;
	var unpackIEEE754 = IEEE754.unpack;

	var packInt8 = function (number) {
	  return [number & 0xFF];
	};

	var packInt16 = function (number) {
	  return [number & 0xFF, number >> 8 & 0xFF];
	};

	var packInt32 = function (number) {
	  return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
	};

	var unpackInt32 = function (buffer) {
	  return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
	};

	var packFloat32 = function (number) {
	  return packIEEE754(fround(number), 23, 4);
	};

	var packFloat64 = function (number) {
	  return packIEEE754(number, 52, 8);
	};

	var addGetter = function (Constructor, key, getInternalState) {
	  defineBuiltInAccessor(Constructor[PROTOTYPE], key, {
	    configurable: true,
	    get: function () {
	      return getInternalState(this)[key];
	    }
	  });
	};

	var get = function (view, count, index, isLittleEndian) {
	  var store = getInternalDataViewState(view);
	  var intIndex = toIndex(index);
	  var boolIsLittleEndian = !!isLittleEndian;
	  if (intIndex + count > store.byteLength) throw new RangeError(WRONG_INDEX);
	  var bytes = store.bytes;
	  var start = intIndex + store.byteOffset;
	  var pack = arraySlice(bytes, start, start + count);
	  return boolIsLittleEndian ? pack : reverse(pack);
	};

	var set = function (view, count, index, conversion, value, isLittleEndian) {
	  var store = getInternalDataViewState(view);
	  var intIndex = toIndex(index);
	  var pack = conversion(+value);
	  var boolIsLittleEndian = !!isLittleEndian;
	  if (intIndex + count > store.byteLength) throw new RangeError(WRONG_INDEX);
	  var bytes = store.bytes;
	  var start = intIndex + store.byteOffset;
	  for (var i = 0; i < count; i++) bytes[start + i] = pack[boolIsLittleEndian ? i : count - i - 1];
	};

	if (!NATIVE_ARRAY_BUFFER) {
	  $ArrayBuffer = function ArrayBuffer(length) {
	    anInstance(this, ArrayBufferPrototype);
	    var byteLength = toIndex(length);
	    setInternalState(this, {
	      type: ARRAY_BUFFER,
	      bytes: fill(Array(byteLength), 0),
	      byteLength: byteLength
	    });
	    if (!DESCRIPTORS) {
	      this.byteLength = byteLength;
	      this.detached = false;
	    }
	  };

	  ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE];

	  $DataView = function DataView(buffer, byteOffset, byteLength) {
	    anInstance(this, DataViewPrototype);
	    anInstance(buffer, ArrayBufferPrototype);
	    var bufferState = getInternalArrayBufferState(buffer);
	    var bufferLength = bufferState.byteLength;
	    var offset = toIntegerOrInfinity(byteOffset);
	    if (offset < 0 || offset > bufferLength) throw new RangeError('Wrong offset');
	    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
	    if (offset + byteLength > bufferLength) throw new RangeError(WRONG_LENGTH);
	    setInternalState(this, {
	      type: DATA_VIEW,
	      buffer: buffer,
	      byteLength: byteLength,
	      byteOffset: offset,
	      bytes: bufferState.bytes
	    });
	    if (!DESCRIPTORS) {
	      this.buffer = buffer;
	      this.byteLength = byteLength;
	      this.byteOffset = offset;
	    }
	  };

	  DataViewPrototype = $DataView[PROTOTYPE];

	  if (DESCRIPTORS) {
	    addGetter($ArrayBuffer, 'byteLength', getInternalArrayBufferState);
	    addGetter($DataView, 'buffer', getInternalDataViewState);
	    addGetter($DataView, 'byteLength', getInternalDataViewState);
	    addGetter($DataView, 'byteOffset', getInternalDataViewState);
	  }

	  defineBuiltIns(DataViewPrototype, {
	    getInt8: function getInt8(byteOffset) {
	      return get(this, 1, byteOffset)[0] << 24 >> 24;
	    },
	    getUint8: function getUint8(byteOffset) {
	      return get(this, 1, byteOffset)[0];
	    },
	    getInt16: function getInt16(byteOffset /* , littleEndian */) {
	      var bytes = get(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : false);
	      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
	    },
	    getUint16: function getUint16(byteOffset /* , littleEndian */) {
	      var bytes = get(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : false);
	      return bytes[1] << 8 | bytes[0];
	    },
	    getInt32: function getInt32(byteOffset /* , littleEndian */) {
	      return unpackInt32(get(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false));
	    },
	    getUint32: function getUint32(byteOffset /* , littleEndian */) {
	      return unpackInt32(get(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false)) >>> 0;
	    },
	    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
	      return unpackIEEE754(get(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false), 23);
	    },
	    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
	      return unpackIEEE754(get(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : false), 52);
	    },
	    setInt8: function setInt8(byteOffset, value) {
	      set(this, 1, byteOffset, packInt8, value);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      set(this, 1, byteOffset, packInt8, value);
	    },
	    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
	      set(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : false);
	    },
	    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
	      set(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : false);
	    },
	    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
	      set(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : false);
	    },
	    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
	      set(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : false);
	    },
	    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
	      set(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : false);
	    },
	    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
	      set(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : false);
	    }
	  });
	} else {
	  var INCORRECT_ARRAY_BUFFER_NAME = PROPER_FUNCTION_NAME && NativeArrayBuffer.name !== ARRAY_BUFFER;
	  /* eslint-disable no-new, sonar/inconsistent-function-call -- required for testing */
	  if (!fails(function () {
	    NativeArrayBuffer(1);
	  }) || !fails(function () {
	    new NativeArrayBuffer(-1);
	  }) || fails(function () {
	    new NativeArrayBuffer();
	    new NativeArrayBuffer(1.5);
	    new NativeArrayBuffer(NaN);
	    return NativeArrayBuffer.length !== 1 || INCORRECT_ARRAY_BUFFER_NAME && !CONFIGURABLE_FUNCTION_NAME;
	  })) {
	    /* eslint-enable no-new, sonar/inconsistent-function-call -- required for testing */
	    $ArrayBuffer = function ArrayBuffer(length) {
	      anInstance(this, ArrayBufferPrototype);
	      return inheritIfRequired(new NativeArrayBuffer(toIndex(length)), this, $ArrayBuffer);
	    };

	    $ArrayBuffer[PROTOTYPE] = ArrayBufferPrototype;

	    ArrayBufferPrototype.constructor = $ArrayBuffer;

	    copyConstructorProperties($ArrayBuffer, NativeArrayBuffer);
	  } else if (INCORRECT_ARRAY_BUFFER_NAME && CONFIGURABLE_FUNCTION_NAME) {
	    createNonEnumerableProperty(NativeArrayBuffer, 'name', ARRAY_BUFFER);
	  }

	  // WebKit bug - the same parent prototype for typed arrays and data view
	  if (setPrototypeOf && getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
	    setPrototypeOf(DataViewPrototype, ObjectPrototype);
	  }

	  // iOS Safari 7.x bug
	  var testView = new $DataView(new $ArrayBuffer(2));
	  var $setInt8 = uncurryThis(DataViewPrototype.setInt8);
	  testView.setInt8(0, 2147483648);
	  testView.setInt8(1, 2147483649);
	  if (testView.getInt8(0) || !testView.getInt8(1)) defineBuiltIns(DataViewPrototype, {
	    setInt8: function setInt8(byteOffset, value) {
	      $setInt8(this, byteOffset, value << 24 >> 24);
	    },
	    setUint8: function setUint8(byteOffset, value) {
	      $setInt8(this, byteOffset, value << 24 >> 24);
	    }
	  }, { unsafe: true });
	}

	setToStringTag($ArrayBuffer, ARRAY_BUFFER);
	setToStringTag($DataView, DATA_VIEW);

	arrayBuffer = {
	  ArrayBuffer: $ArrayBuffer,
	  DataView: $DataView
	};
	return arrayBuffer;
}

var hasRequiredEs_arrayBuffer_constructor;

function requireEs_arrayBuffer_constructor () {
	if (hasRequiredEs_arrayBuffer_constructor) return es_arrayBuffer_constructor;
	hasRequiredEs_arrayBuffer_constructor = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var arrayBufferModule = requireArrayBuffer();
	var setSpecies = requireSetSpecies();

	var ARRAY_BUFFER = 'ArrayBuffer';
	var ArrayBuffer = arrayBufferModule[ARRAY_BUFFER];
	var NativeArrayBuffer = globalThis[ARRAY_BUFFER];

	// `ArrayBuffer` constructor
	// https://tc39.es/ecma262/#sec-arraybuffer-constructor
	$({ global: true, constructor: true, forced: NativeArrayBuffer !== ArrayBuffer }, {
	  ArrayBuffer: ArrayBuffer
	});

	setSpecies(ARRAY_BUFFER);
	return es_arrayBuffer_constructor;
}

var es_arrayBuffer_isView = {};

var arrayBufferViewCore;
var hasRequiredArrayBufferViewCore;

function requireArrayBufferViewCore () {
	if (hasRequiredArrayBufferViewCore) return arrayBufferViewCore;
	hasRequiredArrayBufferViewCore = 1;
	var NATIVE_ARRAY_BUFFER = requireArrayBufferBasicDetection();
	var DESCRIPTORS = requireDescriptors();
	var globalThis = requireGlobalThis();
	var isCallable = requireIsCallable();
	var isObject = requireIsObject();
	var hasOwn = requireHasOwnProperty();
	var classof = requireClassof();
	var tryToString = requireTryToString();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var defineBuiltIn = requireDefineBuiltIn();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var setPrototypeOf = requireObjectSetPrototypeOf();
	var wellKnownSymbol = requireWellKnownSymbol();
	var uid = requireUid();
	var InternalStateModule = requireInternalState();

	var enforceInternalState = InternalStateModule.enforce;
	var getInternalState = InternalStateModule.get;
	var Int8Array = globalThis.Int8Array;
	var Int8ArrayPrototype = Int8Array && Int8Array.prototype;
	var Uint8ClampedArray = globalThis.Uint8ClampedArray;
	var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
	var TypedArray = Int8Array && getPrototypeOf(Int8Array);
	var TypedArrayPrototype = Int8ArrayPrototype && getPrototypeOf(Int8ArrayPrototype);
	var ObjectPrototype = Object.prototype;
	var TypeError = globalThis.TypeError;

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
	var TYPED_ARRAY_CONSTRUCTOR = 'TypedArrayConstructor';
	// Fixing native typed arrays in Opera Presto crashes the browser, see #595
	var NATIVE_ARRAY_BUFFER_VIEWS = NATIVE_ARRAY_BUFFER && !!setPrototypeOf && classof(globalThis.opera) !== 'Opera';
	var TYPED_ARRAY_TAG_REQUIRED = false;
	var NAME, Constructor, Prototype;

	var TypedArrayConstructorsList = {
	  Int8Array: 1,
	  Uint8Array: 1,
	  Uint8ClampedArray: 1,
	  Int16Array: 2,
	  Uint16Array: 2,
	  Int32Array: 4,
	  Uint32Array: 4,
	  Float32Array: 4,
	  Float64Array: 8
	};

	var BigIntArrayConstructorsList = {
	  BigInt64Array: 8,
	  BigUint64Array: 8
	};

	var isView = function isView(it) {
	  if (!isObject(it)) return false;
	  var klass = classof(it);
	  return klass === 'DataView'
	    || hasOwn(TypedArrayConstructorsList, klass)
	    || hasOwn(BigIntArrayConstructorsList, klass);
	};

	var getTypedArrayConstructor = function (it) {
	  var proto = getPrototypeOf(it);
	  if (!isObject(proto)) return;
	  var state = getInternalState(proto);
	  return (state && hasOwn(state, TYPED_ARRAY_CONSTRUCTOR)) ? state[TYPED_ARRAY_CONSTRUCTOR] : getTypedArrayConstructor(proto);
	};

	var isTypedArray = function (it) {
	  if (!isObject(it)) return false;
	  var klass = classof(it);
	  return hasOwn(TypedArrayConstructorsList, klass)
	    || hasOwn(BigIntArrayConstructorsList, klass);
	};

	var aTypedArray = function (it) {
	  if (isTypedArray(it)) return it;
	  throw new TypeError('Target is not a typed array');
	};

	var aTypedArrayConstructor = function (C) {
	  if (isCallable(C) && (!setPrototypeOf || isPrototypeOf(TypedArray, C))) return C;
	  throw new TypeError(tryToString(C) + ' is not a typed array constructor');
	};

	var exportTypedArrayMethod = function (KEY, property, forced, options) {
	  if (!DESCRIPTORS) return;
	  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
	    var TypedArrayConstructor = globalThis[ARRAY];
	    if (TypedArrayConstructor && hasOwn(TypedArrayConstructor.prototype, KEY)) try {
	      delete TypedArrayConstructor.prototype[KEY];
	    } catch (error) {
	      // old WebKit bug - some methods are non-configurable
	      try {
	        TypedArrayConstructor.prototype[KEY] = property;
	      } catch (error2) { /* empty */ }
	    }
	  }
	  if (!TypedArrayPrototype[KEY] || forced) {
	    defineBuiltIn(TypedArrayPrototype, KEY, forced ? property
	      : NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property, options);
	  }
	};

	var exportTypedArrayStaticMethod = function (KEY, property, forced) {
	  var ARRAY, TypedArrayConstructor;
	  if (!DESCRIPTORS) return;
	  if (setPrototypeOf) {
	    if (forced) for (ARRAY in TypedArrayConstructorsList) {
	      TypedArrayConstructor = globalThis[ARRAY];
	      if (TypedArrayConstructor && hasOwn(TypedArrayConstructor, KEY)) try {
	        delete TypedArrayConstructor[KEY];
	      } catch (error) { /* empty */ }
	    }
	    if (!TypedArray[KEY] || forced) {
	      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
	      try {
	        return defineBuiltIn(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && TypedArray[KEY] || property);
	      } catch (error) { /* empty */ }
	    } else return;
	  }
	  for (ARRAY in TypedArrayConstructorsList) {
	    TypedArrayConstructor = globalThis[ARRAY];
	    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
	      defineBuiltIn(TypedArrayConstructor, KEY, property);
	    }
	  }
	};

	for (NAME in TypedArrayConstructorsList) {
	  Constructor = globalThis[NAME];
	  Prototype = Constructor && Constructor.prototype;
	  if (Prototype) enforceInternalState(Prototype)[TYPED_ARRAY_CONSTRUCTOR] = Constructor;
	  else NATIVE_ARRAY_BUFFER_VIEWS = false;
	}

	for (NAME in BigIntArrayConstructorsList) {
	  Constructor = globalThis[NAME];
	  Prototype = Constructor && Constructor.prototype;
	  if (Prototype) enforceInternalState(Prototype)[TYPED_ARRAY_CONSTRUCTOR] = Constructor;
	}

	// WebKit bug - typed arrays constructors prototype is Object.prototype
	if (!NATIVE_ARRAY_BUFFER_VIEWS || !isCallable(TypedArray) || TypedArray === Function.prototype) {
	  // eslint-disable-next-line no-shadow -- safe
	  TypedArray = function TypedArray() {
	    throw new TypeError('Incorrect invocation');
	  };
	  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
	    if (globalThis[NAME]) setPrototypeOf(globalThis[NAME], TypedArray);
	  }
	}

	if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype) {
	  TypedArrayPrototype = TypedArray.prototype;
	  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
	    if (globalThis[NAME]) setPrototypeOf(globalThis[NAME].prototype, TypedArrayPrototype);
	  }
	}

	// WebKit bug - one more object in Uint8ClampedArray prototype chain
	if (NATIVE_ARRAY_BUFFER_VIEWS && getPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
	  setPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
	}

	if (DESCRIPTORS && !hasOwn(TypedArrayPrototype, TO_STRING_TAG)) {
	  TYPED_ARRAY_TAG_REQUIRED = true;
	  defineBuiltInAccessor(TypedArrayPrototype, TO_STRING_TAG, {
	    configurable: true,
	    get: function () {
	      return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined;
	    }
	  });
	  for (NAME in TypedArrayConstructorsList) if (globalThis[NAME]) {
	    createNonEnumerableProperty(globalThis[NAME], TYPED_ARRAY_TAG, NAME);
	  }
	}

	arrayBufferViewCore = {
	  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
	  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQUIRED && TYPED_ARRAY_TAG,
	  aTypedArray: aTypedArray,
	  aTypedArrayConstructor: aTypedArrayConstructor,
	  exportTypedArrayMethod: exportTypedArrayMethod,
	  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
	  getTypedArrayConstructor: getTypedArrayConstructor,
	  isView: isView,
	  isTypedArray: isTypedArray,
	  TypedArray: TypedArray,
	  TypedArrayPrototype: TypedArrayPrototype
	};
	return arrayBufferViewCore;
}

var hasRequiredEs_arrayBuffer_isView;

function requireEs_arrayBuffer_isView () {
	if (hasRequiredEs_arrayBuffer_isView) return es_arrayBuffer_isView;
	hasRequiredEs_arrayBuffer_isView = 1;
	var $ = require_export();
	var ArrayBufferViewCore = requireArrayBufferViewCore();

	var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

	// `ArrayBuffer.isView` method
	// https://tc39.es/ecma262/#sec-arraybuffer.isview
	$({ target: 'ArrayBuffer', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
	  isView: ArrayBufferViewCore.isView
	});
	return es_arrayBuffer_isView;
}

var es_arrayBuffer_slice = {};

var aConstructor;
var hasRequiredAConstructor;

function requireAConstructor () {
	if (hasRequiredAConstructor) return aConstructor;
	hasRequiredAConstructor = 1;
	var isConstructor = requireIsConstructor();
	var tryToString = requireTryToString();

	var $TypeError = TypeError;

	// `Assert: IsConstructor(argument) is true`
	aConstructor = function (argument) {
	  if (isConstructor(argument)) return argument;
	  throw new $TypeError(tryToString(argument) + ' is not a constructor');
	};
	return aConstructor;
}

var speciesConstructor;
var hasRequiredSpeciesConstructor;

function requireSpeciesConstructor () {
	if (hasRequiredSpeciesConstructor) return speciesConstructor;
	hasRequiredSpeciesConstructor = 1;
	var anObject = requireAnObject();
	var aConstructor = requireAConstructor();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var wellKnownSymbol = requireWellKnownSymbol();

	var SPECIES = wellKnownSymbol('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-speciesconstructor
	speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || isNullOrUndefined(S = anObject(C)[SPECIES]) ? defaultConstructor : aConstructor(S);
	};
	return speciesConstructor;
}

var hasRequiredEs_arrayBuffer_slice;

function requireEs_arrayBuffer_slice () {
	if (hasRequiredEs_arrayBuffer_slice) return es_arrayBuffer_slice;
	hasRequiredEs_arrayBuffer_slice = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThisClause();
	var fails = requireFails();
	var ArrayBufferModule = requireArrayBuffer();
	var anObject = requireAnObject();
	var toAbsoluteIndex = requireToAbsoluteIndex();
	var toLength = requireToLength();
	var speciesConstructor = requireSpeciesConstructor();

	var ArrayBuffer = ArrayBufferModule.ArrayBuffer;
	var DataView = ArrayBufferModule.DataView;
	var DataViewPrototype = DataView.prototype;
	var nativeArrayBufferSlice = uncurryThis(ArrayBuffer.prototype.slice);
	var getUint8 = uncurryThis(DataViewPrototype.getUint8);
	var setUint8 = uncurryThis(DataViewPrototype.setUint8);

	var INCORRECT_SLICE = fails(function () {
	  return !new ArrayBuffer(2).slice(1, undefined).byteLength;
	});

	// `ArrayBuffer.prototype.slice` method
	// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
	$({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
	  slice: function slice(start, end) {
	    if (nativeArrayBufferSlice && end === undefined) {
	      return nativeArrayBufferSlice(anObject(this), start); // FF fix
	    }
	    var length = anObject(this).byteLength;
	    var first = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    var result = new (speciesConstructor(this, ArrayBuffer))(toLength(fin - first));
	    var viewSource = new DataView(this);
	    var viewTarget = new DataView(result);
	    var index = 0;
	    while (first < fin) {
	      setUint8(viewTarget, index++, getUint8(viewSource, first++));
	    } return result;
	  }
	});
	return es_arrayBuffer_slice;
}

var es_dataView = {};

var es_dataView_constructor = {};

var hasRequiredEs_dataView_constructor;

function requireEs_dataView_constructor () {
	if (hasRequiredEs_dataView_constructor) return es_dataView_constructor;
	hasRequiredEs_dataView_constructor = 1;
	var $ = require_export();
	var ArrayBufferModule = requireArrayBuffer();
	var NATIVE_ARRAY_BUFFER = requireArrayBufferBasicDetection();

	// `DataView` constructor
	// https://tc39.es/ecma262/#sec-dataview-constructor
	$({ global: true, constructor: true, forced: !NATIVE_ARRAY_BUFFER }, {
	  DataView: ArrayBufferModule.DataView
	});
	return es_dataView_constructor;
}

var hasRequiredEs_dataView;

function requireEs_dataView () {
	if (hasRequiredEs_dataView) return es_dataView;
	hasRequiredEs_dataView = 1;
	// TODO: Remove this module from `core-js@4` since it's replaced to module below
	requireEs_dataView_constructor();
	return es_dataView;
}

var es_arrayBuffer_detached = {};

var arrayBufferByteLength;
var hasRequiredArrayBufferByteLength;

function requireArrayBufferByteLength () {
	if (hasRequiredArrayBufferByteLength) return arrayBufferByteLength;
	hasRequiredArrayBufferByteLength = 1;
	var globalThis = requireGlobalThis();
	var uncurryThisAccessor = requireFunctionUncurryThisAccessor();
	var classof = requireClassofRaw();

	var ArrayBuffer = globalThis.ArrayBuffer;
	var TypeError = globalThis.TypeError;

	// Includes
	// - Perform ? RequireInternalSlot(O, [[ArrayBufferData]]).
	// - If IsSharedArrayBuffer(O) is true, throw a TypeError exception.
	arrayBufferByteLength = ArrayBuffer && uncurryThisAccessor(ArrayBuffer.prototype, 'byteLength', 'get') || function (O) {
	  if (classof(O) !== 'ArrayBuffer') throw new TypeError('ArrayBuffer expected');
	  return O.byteLength;
	};
	return arrayBufferByteLength;
}

var arrayBufferIsDetached;
var hasRequiredArrayBufferIsDetached;

function requireArrayBufferIsDetached () {
	if (hasRequiredArrayBufferIsDetached) return arrayBufferIsDetached;
	hasRequiredArrayBufferIsDetached = 1;
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThisClause();
	var arrayBufferByteLength = requireArrayBufferByteLength();

	var ArrayBuffer = globalThis.ArrayBuffer;
	var ArrayBufferPrototype = ArrayBuffer && ArrayBuffer.prototype;
	var slice = ArrayBufferPrototype && uncurryThis(ArrayBufferPrototype.slice);

	arrayBufferIsDetached = function (O) {
	  if (arrayBufferByteLength(O) !== 0) return false;
	  if (!slice) return false;
	  try {
	    slice(O, 0, 0);
	    return false;
	  } catch (error) {
	    return true;
	  }
	};
	return arrayBufferIsDetached;
}

var hasRequiredEs_arrayBuffer_detached;

function requireEs_arrayBuffer_detached () {
	if (hasRequiredEs_arrayBuffer_detached) return es_arrayBuffer_detached;
	hasRequiredEs_arrayBuffer_detached = 1;
	var DESCRIPTORS = requireDescriptors();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var isDetached = requireArrayBufferIsDetached();

	var ArrayBufferPrototype = ArrayBuffer.prototype;

	if (DESCRIPTORS && !('detached' in ArrayBufferPrototype)) {
	  defineBuiltInAccessor(ArrayBufferPrototype, 'detached', {
	    configurable: true,
	    get: function detached() {
	      return isDetached(this);
	    }
	  });
	}
	return es_arrayBuffer_detached;
}

var es_arrayBuffer_transfer = {};

var arrayBufferNotDetached;
var hasRequiredArrayBufferNotDetached;

function requireArrayBufferNotDetached () {
	if (hasRequiredArrayBufferNotDetached) return arrayBufferNotDetached;
	hasRequiredArrayBufferNotDetached = 1;
	var isDetached = requireArrayBufferIsDetached();

	var $TypeError = TypeError;

	arrayBufferNotDetached = function (it) {
	  if (isDetached(it)) throw new $TypeError('ArrayBuffer is detached');
	  return it;
	};
	return arrayBufferNotDetached;
}

var getBuiltInNodeModule;
var hasRequiredGetBuiltInNodeModule;

function requireGetBuiltInNodeModule () {
	if (hasRequiredGetBuiltInNodeModule) return getBuiltInNodeModule;
	hasRequiredGetBuiltInNodeModule = 1;
	var globalThis = requireGlobalThis();
	var IS_NODE = requireEnvironmentIsNode();

	getBuiltInNodeModule = function (name) {
	  if (IS_NODE) {
	    try {
	      return globalThis.process.getBuiltinModule(name);
	    } catch (error) { /* empty */ }
	    try {
	      // eslint-disable-next-line no-new-func -- safe
	      return Function('return require("' + name + '")')();
	    } catch (error) { /* empty */ }
	  }
	};
	return getBuiltInNodeModule;
}

var structuredCloneProperTransfer;
var hasRequiredStructuredCloneProperTransfer;

function requireStructuredCloneProperTransfer () {
	if (hasRequiredStructuredCloneProperTransfer) return structuredCloneProperTransfer;
	hasRequiredStructuredCloneProperTransfer = 1;
	var globalThis = requireGlobalThis();
	var fails = requireFails();
	var V8 = requireEnvironmentV8Version();
	var ENVIRONMENT = requireEnvironment();

	var structuredClone = globalThis.structuredClone;

	structuredCloneProperTransfer = !!structuredClone && !fails(function () {
	  // prevent V8 ArrayBufferDetaching protector cell invalidation and performance degradation
	  // https://github.com/zloirock/core-js/issues/679
	  if ((ENVIRONMENT === 'DENO' && V8 > 92) || (ENVIRONMENT === 'NODE' && V8 > 94) || (ENVIRONMENT === 'BROWSER' && V8 > 97)) return false;
	  var buffer = new ArrayBuffer(8);
	  var clone = structuredClone(buffer, { transfer: [buffer] });
	  return buffer.byteLength !== 0 || clone.byteLength !== 8;
	});
	return structuredCloneProperTransfer;
}

var detachTransferable;
var hasRequiredDetachTransferable;

function requireDetachTransferable () {
	if (hasRequiredDetachTransferable) return detachTransferable;
	hasRequiredDetachTransferable = 1;
	var globalThis = requireGlobalThis();
	var getBuiltInNodeModule = requireGetBuiltInNodeModule();
	var PROPER_STRUCTURED_CLONE_TRANSFER = requireStructuredCloneProperTransfer();

	var structuredClone = globalThis.structuredClone;
	var $ArrayBuffer = globalThis.ArrayBuffer;
	var $MessageChannel = globalThis.MessageChannel;
	var detach = false;
	var WorkerThreads, channel, buffer, $detach;

	if (PROPER_STRUCTURED_CLONE_TRANSFER) {
	  detach = function (transferable) {
	    structuredClone(transferable, { transfer: [transferable] });
	  };
	} else if ($ArrayBuffer) try {
	  if (!$MessageChannel) {
	    WorkerThreads = getBuiltInNodeModule('worker_threads');
	    if (WorkerThreads) $MessageChannel = WorkerThreads.MessageChannel;
	  }

	  if ($MessageChannel) {
	    channel = new $MessageChannel();
	    buffer = new $ArrayBuffer(2);

	    $detach = function (transferable) {
	      channel.port1.postMessage(null, [transferable]);
	    };

	    if (buffer.byteLength === 2) {
	      $detach(buffer);
	      if (buffer.byteLength === 0) detach = $detach;
	    }
	  }
	} catch (error) { /* empty */ }

	detachTransferable = detach;
	return detachTransferable;
}

var arrayBufferTransfer;
var hasRequiredArrayBufferTransfer;

function requireArrayBufferTransfer () {
	if (hasRequiredArrayBufferTransfer) return arrayBufferTransfer;
	hasRequiredArrayBufferTransfer = 1;
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();
	var uncurryThisAccessor = requireFunctionUncurryThisAccessor();
	var toIndex = requireToIndex();
	var notDetached = requireArrayBufferNotDetached();
	var arrayBufferByteLength = requireArrayBufferByteLength();
	var detachTransferable = requireDetachTransferable();
	var PROPER_STRUCTURED_CLONE_TRANSFER = requireStructuredCloneProperTransfer();

	var structuredClone = globalThis.structuredClone;
	var ArrayBuffer = globalThis.ArrayBuffer;
	var DataView = globalThis.DataView;
	var min = Math.min;
	var ArrayBufferPrototype = ArrayBuffer.prototype;
	var DataViewPrototype = DataView.prototype;
	var slice = uncurryThis(ArrayBufferPrototype.slice);
	var isResizable = uncurryThisAccessor(ArrayBufferPrototype, 'resizable', 'get');
	var maxByteLength = uncurryThisAccessor(ArrayBufferPrototype, 'maxByteLength', 'get');
	var getInt8 = uncurryThis(DataViewPrototype.getInt8);
	var setInt8 = uncurryThis(DataViewPrototype.setInt8);

	arrayBufferTransfer = (PROPER_STRUCTURED_CLONE_TRANSFER || detachTransferable) && function (arrayBuffer, newLength, preserveResizability) {
	  var byteLength = arrayBufferByteLength(arrayBuffer);
	  var newByteLength = newLength === undefined ? byteLength : toIndex(newLength);
	  var fixedLength = !isResizable || !isResizable(arrayBuffer);
	  var newBuffer;
	  notDetached(arrayBuffer);
	  if (PROPER_STRUCTURED_CLONE_TRANSFER) {
	    arrayBuffer = structuredClone(arrayBuffer, { transfer: [arrayBuffer] });
	    if (byteLength === newByteLength && (preserveResizability || fixedLength)) return arrayBuffer;
	  }
	  if (byteLength >= newByteLength && (!preserveResizability || fixedLength)) {
	    newBuffer = slice(arrayBuffer, 0, newByteLength);
	  } else {
	    var options = preserveResizability && !fixedLength && maxByteLength ? { maxByteLength: maxByteLength(arrayBuffer) } : undefined;
	    newBuffer = new ArrayBuffer(newByteLength, options);
	    var a = new DataView(arrayBuffer);
	    var b = new DataView(newBuffer);
	    var copyLength = min(newByteLength, byteLength);
	    for (var i = 0; i < copyLength; i++) setInt8(b, i, getInt8(a, i));
	  }
	  if (!PROPER_STRUCTURED_CLONE_TRANSFER) detachTransferable(arrayBuffer);
	  return newBuffer;
	};
	return arrayBufferTransfer;
}

var hasRequiredEs_arrayBuffer_transfer;

function requireEs_arrayBuffer_transfer () {
	if (hasRequiredEs_arrayBuffer_transfer) return es_arrayBuffer_transfer;
	hasRequiredEs_arrayBuffer_transfer = 1;
	var $ = require_export();
	var $transfer = requireArrayBufferTransfer();

	// `ArrayBuffer.prototype.transfer` method
	// https://tc39.es/proposal-arraybuffer-transfer/#sec-arraybuffer.prototype.transfer
	if ($transfer) $({ target: 'ArrayBuffer', proto: true }, {
	  transfer: function transfer() {
	    return $transfer(this, arguments.length ? arguments[0] : undefined, true);
	  }
	});
	return es_arrayBuffer_transfer;
}

var es_arrayBuffer_transferToFixedLength = {};

var hasRequiredEs_arrayBuffer_transferToFixedLength;

function requireEs_arrayBuffer_transferToFixedLength () {
	if (hasRequiredEs_arrayBuffer_transferToFixedLength) return es_arrayBuffer_transferToFixedLength;
	hasRequiredEs_arrayBuffer_transferToFixedLength = 1;
	var $ = require_export();
	var $transfer = requireArrayBufferTransfer();

	// `ArrayBuffer.prototype.transferToFixedLength` method
	// https://tc39.es/proposal-arraybuffer-transfer/#sec-arraybuffer.prototype.transfertofixedlength
	if ($transfer) $({ target: 'ArrayBuffer', proto: true }, {
	  transferToFixedLength: function transferToFixedLength() {
	    return $transfer(this, arguments.length ? arguments[0] : undefined, false);
	  }
	});
	return es_arrayBuffer_transferToFixedLength;
}

var es_date_getYear = {};

var hasRequiredEs_date_getYear;

function requireEs_date_getYear () {
	if (hasRequiredEs_date_getYear) return es_date_getYear;
	hasRequiredEs_date_getYear = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var fails = requireFails();

	// IE8- non-standard case
	var FORCED = fails(function () {
	  // eslint-disable-next-line es/no-date-prototype-getyear-setyear -- detection
	  return new Date(16e11).getYear() !== 120;
	});

	var getFullYear = uncurryThis(Date.prototype.getFullYear);

	// `Date.prototype.getYear` method
	// https://tc39.es/ecma262/#sec-date.prototype.getyear
	$({ target: 'Date', proto: true, forced: FORCED }, {
	  getYear: function getYear() {
	    return getFullYear(this) - 1900;
	  }
	});
	return es_date_getYear;
}

var es_date_now = {};

var hasRequiredEs_date_now;

function requireEs_date_now () {
	if (hasRequiredEs_date_now) return es_date_now;
	hasRequiredEs_date_now = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();

	var $Date = Date;
	var thisTimeValue = uncurryThis($Date.prototype.getTime);

	// `Date.now` method
	// https://tc39.es/ecma262/#sec-date.now
	$({ target: 'Date', stat: true }, {
	  now: function now() {
	    return thisTimeValue(new $Date());
	  }
	});
	return es_date_now;
}

var es_date_setYear = {};

var hasRequiredEs_date_setYear;

function requireEs_date_setYear () {
	if (hasRequiredEs_date_setYear) return es_date_setYear;
	hasRequiredEs_date_setYear = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();

	var DatePrototype = Date.prototype;
	var thisTimeValue = uncurryThis(DatePrototype.getTime);
	var setFullYear = uncurryThis(DatePrototype.setFullYear);

	// `Date.prototype.setYear` method
	// https://tc39.es/ecma262/#sec-date.prototype.setyear
	$({ target: 'Date', proto: true }, {
	  setYear: function setYear(year) {
	    // validate
	    thisTimeValue(this);
	    var yi = toIntegerOrInfinity(year);
	    var yyyy = yi >= 0 && yi <= 99 ? yi + 1900 : yi;
	    return setFullYear(this, yyyy);
	  }
	});
	return es_date_setYear;
}

var es_date_toGmtString = {};

var hasRequiredEs_date_toGmtString;

function requireEs_date_toGmtString () {
	if (hasRequiredEs_date_toGmtString) return es_date_toGmtString;
	hasRequiredEs_date_toGmtString = 1;
	var $ = require_export();

	// `Date.prototype.toGMTString` method
	// https://tc39.es/ecma262/#sec-date.prototype.togmtstring
	$({ target: 'Date', proto: true }, {
	  toGMTString: Date.prototype.toUTCString
	});
	return es_date_toGmtString;
}

var es_date_toIsoString = {};

var stringRepeat;
var hasRequiredStringRepeat;

function requireStringRepeat () {
	if (hasRequiredStringRepeat) return stringRepeat;
	hasRequiredStringRepeat = 1;
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var toString = requireToString();
	var requireObjectCoercible = requireRequireObjectCoercible();

	var $RangeError = RangeError;

	// `String.prototype.repeat` method implementation
	// https://tc39.es/ecma262/#sec-string.prototype.repeat
	stringRepeat = function repeat(count) {
	  var str = toString(requireObjectCoercible(this));
	  var result = '';
	  var n = toIntegerOrInfinity(count);
	  if (n < 0 || n === Infinity) throw new $RangeError('Wrong number of repetitions');
	  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
	  return result;
	};
	return stringRepeat;
}

var stringPad;
var hasRequiredStringPad;

function requireStringPad () {
	if (hasRequiredStringPad) return stringPad;
	hasRequiredStringPad = 1;
	// https://github.com/tc39/proposal-string-pad-start-end
	var uncurryThis = requireFunctionUncurryThis();
	var toLength = requireToLength();
	var toString = requireToString();
	var $repeat = requireStringRepeat();
	var requireObjectCoercible = requireRequireObjectCoercible();

	var repeat = uncurryThis($repeat);
	var stringSlice = uncurryThis(''.slice);
	var ceil = Math.ceil;

	// `String.prototype.{ padStart, padEnd }` methods implementation
	var createMethod = function (IS_END) {
	  return function ($this, maxLength, fillString) {
	    var S = toString(requireObjectCoercible($this));
	    var intMaxLength = toLength(maxLength);
	    var stringLength = S.length;
	    var fillStr = fillString === undefined ? ' ' : toString(fillString);
	    var fillLen, stringFiller;
	    if (intMaxLength <= stringLength || fillStr === '') return S;
	    fillLen = intMaxLength - stringLength;
	    stringFiller = repeat(fillStr, ceil(fillLen / fillStr.length));
	    if (stringFiller.length > fillLen) stringFiller = stringSlice(stringFiller, 0, fillLen);
	    return IS_END ? S + stringFiller : stringFiller + S;
	  };
	};

	stringPad = {
	  // `String.prototype.padStart` method
	  // https://tc39.es/ecma262/#sec-string.prototype.padstart
	  start: createMethod(false),
	  // `String.prototype.padEnd` method
	  // https://tc39.es/ecma262/#sec-string.prototype.padend
	  end: createMethod(true)
	};
	return stringPad;
}

var dateToIsoString;
var hasRequiredDateToIsoString;

function requireDateToIsoString () {
	if (hasRequiredDateToIsoString) return dateToIsoString;
	hasRequiredDateToIsoString = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var fails = requireFails();
	var padStart = requireStringPad().start;

	var $RangeError = RangeError;
	var $isFinite = isFinite;
	var abs = Math.abs;
	var DatePrototype = Date.prototype;
	var nativeDateToISOString = DatePrototype.toISOString;
	var thisTimeValue = uncurryThis(DatePrototype.getTime);
	var getUTCDate = uncurryThis(DatePrototype.getUTCDate);
	var getUTCFullYear = uncurryThis(DatePrototype.getUTCFullYear);
	var getUTCHours = uncurryThis(DatePrototype.getUTCHours);
	var getUTCMilliseconds = uncurryThis(DatePrototype.getUTCMilliseconds);
	var getUTCMinutes = uncurryThis(DatePrototype.getUTCMinutes);
	var getUTCMonth = uncurryThis(DatePrototype.getUTCMonth);
	var getUTCSeconds = uncurryThis(DatePrototype.getUTCSeconds);

	// `Date.prototype.toISOString` method implementation
	// https://tc39.es/ecma262/#sec-date.prototype.toisostring
	// PhantomJS / old WebKit fails here:
	dateToIsoString = (fails(function () {
	  return nativeDateToISOString.call(new Date(-5e13 - 1)) !== '0385-07-25T07:06:39.999Z';
	}) || !fails(function () {
	  nativeDateToISOString.call(new Date(NaN));
	})) ? function toISOString() {
	  if (!$isFinite(thisTimeValue(this))) throw new $RangeError('Invalid time value');
	  var date = this;
	  var year = getUTCFullYear(date);
	  var milliseconds = getUTCMilliseconds(date);
	  var sign = year < 0 ? '-' : year > 9999 ? '+' : '';
	  return sign + padStart(abs(year), sign ? 6 : 4, 0) +
	    '-' + padStart(getUTCMonth(date) + 1, 2, 0) +
	    '-' + padStart(getUTCDate(date), 2, 0) +
	    'T' + padStart(getUTCHours(date), 2, 0) +
	    ':' + padStart(getUTCMinutes(date), 2, 0) +
	    ':' + padStart(getUTCSeconds(date), 2, 0) +
	    '.' + padStart(milliseconds, 3, 0) +
	    'Z';
	} : nativeDateToISOString;
	return dateToIsoString;
}

var hasRequiredEs_date_toIsoString;

function requireEs_date_toIsoString () {
	if (hasRequiredEs_date_toIsoString) return es_date_toIsoString;
	hasRequiredEs_date_toIsoString = 1;
	var $ = require_export();
	var toISOString = requireDateToIsoString();

	// `Date.prototype.toISOString` method
	// https://tc39.es/ecma262/#sec-date.prototype.toisostring
	// PhantomJS / old WebKit has a broken implementations
	$({ target: 'Date', proto: true, forced: Date.prototype.toISOString !== toISOString }, {
	  toISOString: toISOString
	});
	return es_date_toIsoString;
}

var es_date_toJson = {};

var hasRequiredEs_date_toJson;

function requireEs_date_toJson () {
	if (hasRequiredEs_date_toJson) return es_date_toJson;
	hasRequiredEs_date_toJson = 1;
	var $ = require_export();
	var fails = requireFails();
	var toObject = requireToObject();
	var toPrimitive = requireToPrimitive();

	var FORCED = fails(function () {
	  return new Date(NaN).toJSON() !== null
	    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
	});

	// `Date.prototype.toJSON` method
	// https://tc39.es/ecma262/#sec-date.prototype.tojson
	$({ target: 'Date', proto: true, arity: 1, forced: FORCED }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  toJSON: function toJSON(key) {
	    var O = toObject(this);
	    var pv = toPrimitive(O, 'number');
	    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
	  }
	});
	return es_date_toJson;
}

var es_date_toPrimitive = {};

var dateToPrimitive;
var hasRequiredDateToPrimitive;

function requireDateToPrimitive () {
	if (hasRequiredDateToPrimitive) return dateToPrimitive;
	hasRequiredDateToPrimitive = 1;
	var anObject = requireAnObject();
	var ordinaryToPrimitive = requireOrdinaryToPrimitive();

	var $TypeError = TypeError;

	// `Date.prototype[@@toPrimitive](hint)` method implementation
	// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
	dateToPrimitive = function (hint) {
	  anObject(this);
	  if (hint === 'string' || hint === 'default') hint = 'string';
	  else if (hint !== 'number') throw new $TypeError('Incorrect hint');
	  return ordinaryToPrimitive(this, hint);
	};
	return dateToPrimitive;
}

var hasRequiredEs_date_toPrimitive;

function requireEs_date_toPrimitive () {
	if (hasRequiredEs_date_toPrimitive) return es_date_toPrimitive;
	hasRequiredEs_date_toPrimitive = 1;
	var hasOwn = requireHasOwnProperty();
	var defineBuiltIn = requireDefineBuiltIn();
	var dateToPrimitive = requireDateToPrimitive();
	var wellKnownSymbol = requireWellKnownSymbol();

	var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');
	var DatePrototype = Date.prototype;

	// `Date.prototype[@@toPrimitive]` method
	// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
	if (!hasOwn(DatePrototype, TO_PRIMITIVE)) {
	  defineBuiltIn(DatePrototype, TO_PRIMITIVE, dateToPrimitive);
	}
	return es_date_toPrimitive;
}

var es_date_toString = {};

var hasRequiredEs_date_toString;

function requireEs_date_toString () {
	if (hasRequiredEs_date_toString) return es_date_toString;
	hasRequiredEs_date_toString = 1;
	// TODO: Remove from `core-js@4`
	var uncurryThis = requireFunctionUncurryThis();
	var defineBuiltIn = requireDefineBuiltIn();

	var DatePrototype = Date.prototype;
	var INVALID_DATE = 'Invalid Date';
	var TO_STRING = 'toString';
	var nativeDateToString = uncurryThis(DatePrototype[TO_STRING]);
	var thisTimeValue = uncurryThis(DatePrototype.getTime);

	// `Date.prototype.toString` method
	// https://tc39.es/ecma262/#sec-date.prototype.tostring
	if (String(new Date(NaN)) !== INVALID_DATE) {
	  defineBuiltIn(DatePrototype, TO_STRING, function toString() {
	    var value = thisTimeValue(this);
	    // eslint-disable-next-line no-self-compare -- NaN check
	    return value === value ? nativeDateToString(this) : INVALID_DATE;
	  });
	}
	return es_date_toString;
}

var es_escape = {};

var hasRequiredEs_escape;

function requireEs_escape () {
	if (hasRequiredEs_escape) return es_escape;
	hasRequiredEs_escape = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var toString = requireToString();

	var charAt = uncurryThis(''.charAt);
	var charCodeAt = uncurryThis(''.charCodeAt);
	var exec = uncurryThis(/./.exec);
	var numberToString = uncurryThis(1.0.toString);
	var toUpperCase = uncurryThis(''.toUpperCase);

	var raw = /[\w*+\-./@]/;

	var hex = function (code, length) {
	  var result = numberToString(code, 16);
	  while (result.length < length) result = '0' + result;
	  return result;
	};

	// `escape` method
	// https://tc39.es/ecma262/#sec-escape-string
	$({ global: true }, {
	  escape: function escape(string) {
	    var str = toString(string);
	    var result = '';
	    var length = str.length;
	    var index = 0;
	    var chr, code;
	    while (index < length) {
	      chr = charAt(str, index++);
	      if (exec(raw, chr)) {
	        result += chr;
	      } else {
	        code = charCodeAt(chr, 0);
	        if (code < 256) {
	          result += '%' + hex(code, 2);
	        } else {
	          result += '%u' + toUpperCase(hex(code, 4));
	        }
	      }
	    } return result;
	  }
	});
	return es_escape;
}

var es_function_bind = {};

var functionBind;
var hasRequiredFunctionBind;

function requireFunctionBind () {
	if (hasRequiredFunctionBind) return functionBind;
	hasRequiredFunctionBind = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var aCallable = requireACallable();
	var isObject = requireIsObject();
	var hasOwn = requireHasOwnProperty();
	var arraySlice = requireArraySlice();
	var NATIVE_BIND = requireFunctionBindNative();

	var $Function = Function;
	var concat = uncurryThis([].concat);
	var join = uncurryThis([].join);
	var factories = {};

	var construct = function (C, argsLength, args) {
	  if (!hasOwn(factories, argsLength)) {
	    var list = [];
	    var i = 0;
	    for (; i < argsLength; i++) list[i] = 'a[' + i + ']';
	    factories[argsLength] = $Function('C,a', 'return new C(' + join(list, ',') + ')');
	  } return factories[argsLength](C, args);
	};

	// `Function.prototype.bind` method implementation
	// https://tc39.es/ecma262/#sec-function.prototype.bind
	// eslint-disable-next-line es/no-function-prototype-bind -- detection
	functionBind = NATIVE_BIND ? $Function.bind : function bind(that /* , ...args */) {
	  var F = aCallable(this);
	  var Prototype = F.prototype;
	  var partArgs = arraySlice(arguments, 1);
	  var boundFunction = function bound(/* args... */) {
	    var args = concat(partArgs, arraySlice(arguments));
	    return this instanceof boundFunction ? construct(F, args.length, args) : F.apply(that, args);
	  };
	  if (isObject(Prototype)) boundFunction.prototype = Prototype;
	  return boundFunction;
	};
	return functionBind;
}

var hasRequiredEs_function_bind;

function requireEs_function_bind () {
	if (hasRequiredEs_function_bind) return es_function_bind;
	hasRequiredEs_function_bind = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var bind = requireFunctionBind();

	// `Function.prototype.bind` method
	// https://tc39.es/ecma262/#sec-function.prototype.bind
	// eslint-disable-next-line es/no-function-prototype-bind -- detection
	$({ target: 'Function', proto: true, forced: Function.bind !== bind }, {
	  bind: bind
	});
	return es_function_bind;
}

var es_function_hasInstance = {};

var hasRequiredEs_function_hasInstance;

function requireEs_function_hasInstance () {
	if (hasRequiredEs_function_hasInstance) return es_function_hasInstance;
	hasRequiredEs_function_hasInstance = 1;
	var isCallable = requireIsCallable();
	var isObject = requireIsObject();
	var definePropertyModule = requireObjectDefineProperty();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var wellKnownSymbol = requireWellKnownSymbol();
	var makeBuiltIn = requireMakeBuiltIn();

	var HAS_INSTANCE = wellKnownSymbol('hasInstance');
	var FunctionPrototype = Function.prototype;

	// `Function.prototype[@@hasInstance]` method
	// https://tc39.es/ecma262/#sec-function.prototype-@@hasinstance
	if (!(HAS_INSTANCE in FunctionPrototype)) {
	  definePropertyModule.f(FunctionPrototype, HAS_INSTANCE, { value: makeBuiltIn(function (O) {
	    if (!isCallable(this) || !isObject(O)) return false;
	    var P = this.prototype;
	    return isObject(P) ? isPrototypeOf(P, O) : O instanceof this;
	  }, HAS_INSTANCE) });
	}
	return es_function_hasInstance;
}

var es_function_name = {};

var hasRequiredEs_function_name;

function requireEs_function_name () {
	if (hasRequiredEs_function_name) return es_function_name;
	hasRequiredEs_function_name = 1;
	var DESCRIPTORS = requireDescriptors();
	var FUNCTION_NAME_EXISTS = requireFunctionName().EXISTS;
	var uncurryThis = requireFunctionUncurryThis();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();

	var FunctionPrototype = Function.prototype;
	var functionToString = uncurryThis(FunctionPrototype.toString);
	var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
	var regExpExec = uncurryThis(nameRE.exec);
	var NAME = 'name';

	// Function instances `.name` property
	// https://tc39.es/ecma262/#sec-function-instances-name
	if (DESCRIPTORS && !FUNCTION_NAME_EXISTS) {
	  defineBuiltInAccessor(FunctionPrototype, NAME, {
	    configurable: true,
	    get: function () {
	      try {
	        return regExpExec(nameRE, functionToString(this))[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}
	return es_function_name;
}

var es_globalThis = {};

var hasRequiredEs_globalThis;

function requireEs_globalThis () {
	if (hasRequiredEs_globalThis) return es_globalThis;
	hasRequiredEs_globalThis = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();

	// `globalThis` object
	// https://tc39.es/ecma262/#sec-globalthis
	$({ global: true, forced: globalThis.globalThis !== globalThis }, {
	  globalThis: globalThis
	});
	return es_globalThis;
}

var es_json_toStringTag = {};

var hasRequiredEs_json_toStringTag;

function requireEs_json_toStringTag () {
	if (hasRequiredEs_json_toStringTag) return es_json_toStringTag;
	hasRequiredEs_json_toStringTag = 1;
	var globalThis = requireGlobalThis();
	var setToStringTag = requireSetToStringTag();

	// JSON[@@toStringTag] property
	// https://tc39.es/ecma262/#sec-json-@@tostringtag
	setToStringTag(globalThis.JSON, 'JSON', true);
	return es_json_toStringTag;
}

var es_map = {};

var es_map_constructor = {};

var internalMetadata = {exports: {}};

var arrayBufferNonExtensible;
var hasRequiredArrayBufferNonExtensible;

function requireArrayBufferNonExtensible () {
	if (hasRequiredArrayBufferNonExtensible) return arrayBufferNonExtensible;
	hasRequiredArrayBufferNonExtensible = 1;
	// FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
	var fails = requireFails();

	arrayBufferNonExtensible = fails(function () {
	  if (typeof ArrayBuffer == 'function') {
	    var buffer = new ArrayBuffer(8);
	    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
	    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
	  }
	});
	return arrayBufferNonExtensible;
}

var objectIsExtensible;
var hasRequiredObjectIsExtensible;

function requireObjectIsExtensible () {
	if (hasRequiredObjectIsExtensible) return objectIsExtensible;
	hasRequiredObjectIsExtensible = 1;
	var fails = requireFails();
	var isObject = requireIsObject();
	var classof = requireClassofRaw();
	var ARRAY_BUFFER_NON_EXTENSIBLE = requireArrayBufferNonExtensible();

	// eslint-disable-next-line es/no-object-isextensible -- safe
	var $isExtensible = Object.isExtensible;
	var FAILS_ON_PRIMITIVES = fails(function () { });

	// `Object.isExtensible` method
	// https://tc39.es/ecma262/#sec-object.isextensible
	objectIsExtensible = (FAILS_ON_PRIMITIVES || ARRAY_BUFFER_NON_EXTENSIBLE) ? function isExtensible(it) {
	  if (!isObject(it)) return false;
	  if (ARRAY_BUFFER_NON_EXTENSIBLE && classof(it) === 'ArrayBuffer') return false;
	  return $isExtensible ? $isExtensible(it) : true;
	} : $isExtensible;
	return objectIsExtensible;
}

var freezing;
var hasRequiredFreezing;

function requireFreezing () {
	if (hasRequiredFreezing) return freezing;
	hasRequiredFreezing = 1;
	var fails = requireFails();

	freezing = !fails(function () {
	  // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
	  return Object.isExtensible(Object.preventExtensions({}));
	});
	return freezing;
}

var hasRequiredInternalMetadata;

function requireInternalMetadata () {
	if (hasRequiredInternalMetadata) return internalMetadata.exports;
	hasRequiredInternalMetadata = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var hiddenKeys = requireHiddenKeys();
	var isObject = requireIsObject();
	var hasOwn = requireHasOwnProperty();
	var defineProperty = requireObjectDefineProperty().f;
	var getOwnPropertyNamesModule = requireObjectGetOwnPropertyNames();
	var getOwnPropertyNamesExternalModule = requireObjectGetOwnPropertyNamesExternal();
	var isExtensible = requireObjectIsExtensible();
	var uid = requireUid();
	var FREEZING = requireFreezing();

	var REQUIRED = false;
	var METADATA = uid('meta');
	var id = 0;

	var setMetadata = function (it) {
	  defineProperty(it, METADATA, { value: {
	    objectID: 'O' + id++, // object ID
	    weakData: {}          // weak collections IDs
	  } });
	};

	var fastKey = function (it, create) {
	  // return a primitive with prefix
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!hasOwn(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMetadata(it);
	  // return object ID
	  } return it[METADATA].objectID;
	};

	var getWeakData = function (it, create) {
	  if (!hasOwn(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMetadata(it);
	  // return the store of weak collections IDs
	  } return it[METADATA].weakData;
	};

	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (FREEZING && REQUIRED && isExtensible(it) && !hasOwn(it, METADATA)) setMetadata(it);
	  return it;
	};

	var enable = function () {
	  meta.enable = function () { /* empty */ };
	  REQUIRED = true;
	  var getOwnPropertyNames = getOwnPropertyNamesModule.f;
	  var splice = uncurryThis([].splice);
	  var test = {};
	  test[METADATA] = 1;

	  // prevent exposing of metadata key
	  if (getOwnPropertyNames(test).length) {
	    getOwnPropertyNamesModule.f = function (it) {
	      var result = getOwnPropertyNames(it);
	      for (var i = 0, length = result.length; i < length; i++) {
	        if (result[i] === METADATA) {
	          splice(result, i, 1);
	          break;
	        }
	      } return result;
	    };

	    $({ target: 'Object', stat: true, forced: true }, {
	      getOwnPropertyNames: getOwnPropertyNamesExternalModule.f
	    });
	  }
	};

	var meta = internalMetadata.exports = {
	  enable: enable,
	  fastKey: fastKey,
	  getWeakData: getWeakData,
	  onFreeze: onFreeze
	};

	hiddenKeys[METADATA] = true;
	return internalMetadata.exports;
}

var collection;
var hasRequiredCollection;

function requireCollection () {
	if (hasRequiredCollection) return collection;
	hasRequiredCollection = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();
	var isForced = requireIsForced();
	var defineBuiltIn = requireDefineBuiltIn();
	var InternalMetadataModule = requireInternalMetadata();
	var iterate = requireIterate();
	var anInstance = requireAnInstance();
	var isCallable = requireIsCallable();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var isObject = requireIsObject();
	var fails = requireFails();
	var checkCorrectnessOfIteration = requireCheckCorrectnessOfIteration();
	var setToStringTag = requireSetToStringTag();
	var inheritIfRequired = requireInheritIfRequired();

	collection = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = globalThis[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var Constructor = NativeConstructor;
	  var exported = {};

	  var fixMethod = function (KEY) {
	    var uncurriedNativeMethod = uncurryThis(NativePrototype[KEY]);
	    defineBuiltIn(NativePrototype, KEY,
	      KEY === 'add' ? function add(value) {
	        uncurriedNativeMethod(this, value === 0 ? 0 : value);
	        return this;
	      } : KEY === 'delete' ? function (key) {
	        return IS_WEAK && !isObject(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
	      } : KEY === 'get' ? function get(key) {
	        return IS_WEAK && !isObject(key) ? undefined : uncurriedNativeMethod(this, key === 0 ? 0 : key);
	      } : KEY === 'has' ? function has(key) {
	        return IS_WEAK && !isObject(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
	      } : function set(key, value) {
	        uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
	        return this;
	      }
	    );
	  };

	  var REPLACE = isForced(
	    CONSTRUCTOR_NAME,
	    !isCallable(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
	      new NativeConstructor().entries().next();
	    }))
	  );

	  if (REPLACE) {
	    // create collection constructor
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    InternalMetadataModule.enable();
	  } else if (isForced(CONSTRUCTOR_NAME, true)) {
	    var instance = new Constructor();
	    // early implementations not supports chaining
	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) !== instance;
	    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
	    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
	    // most early implementations doesn't supports iterables, most modern - not close it correctly
	    // eslint-disable-next-line no-new -- required for testing
	    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
	    // for early implementations -0 and +0 not the same
	    var BUGGY_ZERO = !IS_WEAK && fails(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new NativeConstructor();
	      var index = 5;
	      while (index--) $instance[ADDER](index, index);
	      return !$instance.has(-0);
	    });

	    if (!ACCEPT_ITERABLES) {
	      Constructor = wrapper(function (dummy, iterable) {
	        anInstance(dummy, NativePrototype);
	        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
	        if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
	        return that;
	      });
	      Constructor.prototype = NativePrototype;
	      NativePrototype.constructor = Constructor;
	    }

	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }

	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

	    // weak collections should not contains .clear method
	    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
	  }

	  exported[CONSTRUCTOR_NAME] = Constructor;
	  $({ global: true, constructor: true, forced: Constructor !== NativeConstructor }, exported);

	  setToStringTag(Constructor, CONSTRUCTOR_NAME);

	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

	  return Constructor;
	};
	return collection;
}

var collectionStrong;
var hasRequiredCollectionStrong;

function requireCollectionStrong () {
	if (hasRequiredCollectionStrong) return collectionStrong;
	hasRequiredCollectionStrong = 1;
	var create = requireObjectCreate();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var defineBuiltIns = requireDefineBuiltIns();
	var bind = requireFunctionBindContext();
	var anInstance = requireAnInstance();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var iterate = requireIterate();
	var defineIterator = requireIteratorDefine();
	var createIterResultObject = requireCreateIterResultObject();
	var setSpecies = requireSetSpecies();
	var DESCRIPTORS = requireDescriptors();
	var fastKey = requireInternalMetadata().fastKey;
	var InternalStateModule = requireInternalState();

	var setInternalState = InternalStateModule.set;
	var internalStateGetterFor = InternalStateModule.getterFor;

	collectionStrong = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var Constructor = wrapper(function (that, iterable) {
	      anInstance(that, Prototype);
	      setInternalState(that, {
	        type: CONSTRUCTOR_NAME,
	        index: create(null),
	        first: null,
	        last: null,
	        size: 0
	      });
	      if (!DESCRIPTORS) that.size = 0;
	      if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
	    });

	    var Prototype = Constructor.prototype;

	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var entry = getEntry(that, key);
	      var previous, index;
	      // change existing entry
	      if (entry) {
	        entry.value = value;
	      // create new entry
	      } else {
	        state.last = entry = {
	          index: index = fastKey(key, true),
	          key: key,
	          value: value,
	          previous: previous = state.last,
	          next: null,
	          removed: false
	        };
	        if (!state.first) state.first = entry;
	        if (previous) previous.next = entry;
	        if (DESCRIPTORS) state.size++;
	        else that.size++;
	        // add to index
	        if (index !== 'F') state.index[index] = entry;
	      } return that;
	    };

	    var getEntry = function (that, key) {
	      var state = getInternalState(that);
	      // fast case
	      var index = fastKey(key);
	      var entry;
	      if (index !== 'F') return state.index[index];
	      // frozen object case
	      for (entry = state.first; entry; entry = entry.next) {
	        if (entry.key === key) return entry;
	      }
	    };

	    defineBuiltIns(Prototype, {
	      // `{ Map, Set }.prototype.clear()` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.clear
	      // https://tc39.es/ecma262/#sec-set.prototype.clear
	      clear: function clear() {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = state.first;
	        while (entry) {
	          entry.removed = true;
	          if (entry.previous) entry.previous = entry.previous.next = null;
	          entry = entry.next;
	        }
	        state.first = state.last = null;
	        state.index = create(null);
	        if (DESCRIPTORS) state.size = 0;
	        else that.size = 0;
	      },
	      // `{ Map, Set }.prototype.delete(key)` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.delete
	      // https://tc39.es/ecma262/#sec-set.prototype.delete
	      'delete': function (key) {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = getEntry(that, key);
	        if (entry) {
	          var next = entry.next;
	          var prev = entry.previous;
	          delete state.index[entry.index];
	          entry.removed = true;
	          if (prev) prev.next = next;
	          if (next) next.previous = prev;
	          if (state.first === entry) state.first = next;
	          if (state.last === entry) state.last = prev;
	          if (DESCRIPTORS) state.size--;
	          else that.size--;
	        } return !!entry;
	      },
	      // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.foreach
	      // https://tc39.es/ecma262/#sec-set.prototype.foreach
	      forEach: function forEach(callbackfn /* , that = undefined */) {
	        var state = getInternalState(this);
	        var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	        var entry;
	        while (entry = entry ? entry.next : state.first) {
	          boundFunction(entry.value, entry.key, this);
	          // revert to the last existing entry
	          while (entry && entry.removed) entry = entry.previous;
	        }
	      },
	      // `{ Map, Set}.prototype.has(key)` methods
	      // https://tc39.es/ecma262/#sec-map.prototype.has
	      // https://tc39.es/ecma262/#sec-set.prototype.has
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });

	    defineBuiltIns(Prototype, IS_MAP ? {
	      // `Map.prototype.get(key)` method
	      // https://tc39.es/ecma262/#sec-map.prototype.get
	      get: function get(key) {
	        var entry = getEntry(this, key);
	        return entry && entry.value;
	      },
	      // `Map.prototype.set(key, value)` method
	      // https://tc39.es/ecma262/#sec-map.prototype.set
	      set: function set(key, value) {
	        return define(this, key === 0 ? 0 : key, value);
	      }
	    } : {
	      // `Set.prototype.add(value)` method
	      // https://tc39.es/ecma262/#sec-set.prototype.add
	      add: function add(value) {
	        return define(this, value = value === 0 ? 0 : value, value);
	      }
	    });
	    if (DESCRIPTORS) defineBuiltInAccessor(Prototype, 'size', {
	      configurable: true,
	      get: function () {
	        return getInternalState(this).size;
	      }
	    });
	    return Constructor;
	  },
	  setStrong: function (Constructor, CONSTRUCTOR_NAME, IS_MAP) {
	    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
	    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
	    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
	    // `{ Map, Set }.prototype.{ keys, values, entries, @@iterator }()` methods
	    // https://tc39.es/ecma262/#sec-map.prototype.entries
	    // https://tc39.es/ecma262/#sec-map.prototype.keys
	    // https://tc39.es/ecma262/#sec-map.prototype.values
	    // https://tc39.es/ecma262/#sec-map.prototype-@@iterator
	    // https://tc39.es/ecma262/#sec-set.prototype.entries
	    // https://tc39.es/ecma262/#sec-set.prototype.keys
	    // https://tc39.es/ecma262/#sec-set.prototype.values
	    // https://tc39.es/ecma262/#sec-set.prototype-@@iterator
	    defineIterator(Constructor, CONSTRUCTOR_NAME, function (iterated, kind) {
	      setInternalState(this, {
	        type: ITERATOR_NAME,
	        target: iterated,
	        state: getInternalCollectionState(iterated),
	        kind: kind,
	        last: null
	      });
	    }, function () {
	      var state = getInternalIteratorState(this);
	      var kind = state.kind;
	      var entry = state.last;
	      // revert to the last existing entry
	      while (entry && entry.removed) entry = entry.previous;
	      // get next entry
	      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
	        // or finish the iteration
	        state.target = null;
	        return createIterResultObject(undefined, true);
	      }
	      // return step by kind
	      if (kind === 'keys') return createIterResultObject(entry.key, false);
	      if (kind === 'values') return createIterResultObject(entry.value, false);
	      return createIterResultObject([entry.key, entry.value], false);
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

	    // `{ Map, Set }.prototype[@@species]` accessors
	    // https://tc39.es/ecma262/#sec-get-map-@@species
	    // https://tc39.es/ecma262/#sec-get-set-@@species
	    setSpecies(CONSTRUCTOR_NAME);
	  }
	};
	return collectionStrong;
}

var hasRequiredEs_map_constructor;

function requireEs_map_constructor () {
	if (hasRequiredEs_map_constructor) return es_map_constructor;
	hasRequiredEs_map_constructor = 1;
	var collection = requireCollection();
	var collectionStrong = requireCollectionStrong();

	// `Map` constructor
	// https://tc39.es/ecma262/#sec-map-objects
	collection('Map', function (init) {
	  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);
	return es_map_constructor;
}

var hasRequiredEs_map;

function requireEs_map () {
	if (hasRequiredEs_map) return es_map;
	hasRequiredEs_map = 1;
	// TODO: Remove this module from `core-js@4` since it's replaced to module below
	requireEs_map_constructor();
	return es_map;
}

var es_map_groupBy = {};

var mapHelpers;
var hasRequiredMapHelpers;

function requireMapHelpers () {
	if (hasRequiredMapHelpers) return mapHelpers;
	hasRequiredMapHelpers = 1;
	var uncurryThis = requireFunctionUncurryThis();

	// eslint-disable-next-line es/no-map -- safe
	var MapPrototype = Map.prototype;

	mapHelpers = {
	  // eslint-disable-next-line es/no-map -- safe
	  Map: Map,
	  set: uncurryThis(MapPrototype.set),
	  get: uncurryThis(MapPrototype.get),
	  has: uncurryThis(MapPrototype.has),
	  remove: uncurryThis(MapPrototype['delete']),
	  proto: MapPrototype
	};
	return mapHelpers;
}

var hasRequiredEs_map_groupBy;

function requireEs_map_groupBy () {
	if (hasRequiredEs_map_groupBy) return es_map_groupBy;
	hasRequiredEs_map_groupBy = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var aCallable = requireACallable();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var iterate = requireIterate();
	var MapHelpers = requireMapHelpers();
	var IS_PURE = requireIsPure();
	var fails = requireFails();

	var Map = MapHelpers.Map;
	var has = MapHelpers.has;
	var get = MapHelpers.get;
	var set = MapHelpers.set;
	var push = uncurryThis([].push);

	var DOES_NOT_WORK_WITH_PRIMITIVES = IS_PURE || fails(function () {
	  return Map.groupBy('ab', function (it) {
	    return it;
	  }).get('a').length !== 1;
	});

	// `Map.groupBy` method
	// https://github.com/tc39/proposal-array-grouping
	$({ target: 'Map', stat: true, forced: IS_PURE || DOES_NOT_WORK_WITH_PRIMITIVES }, {
	  groupBy: function groupBy(items, callbackfn) {
	    requireObjectCoercible(items);
	    aCallable(callbackfn);
	    var map = new Map();
	    var k = 0;
	    iterate(items, function (value) {
	      var key = callbackfn(value, k++);
	      if (!has(map, key)) set(map, key, [value]);
	      else push(get(map, key), value);
	    });
	    return map;
	  }
	});
	return es_map_groupBy;
}

var es_math_acosh = {};

var mathLog1p;
var hasRequiredMathLog1p;

function requireMathLog1p () {
	if (hasRequiredMathLog1p) return mathLog1p;
	hasRequiredMathLog1p = 1;
	var log = Math.log;

	// `Math.log1p` method implementation
	// https://tc39.es/ecma262/#sec-math.log1p
	// eslint-disable-next-line es/no-math-log1p -- safe
	mathLog1p = Math.log1p || function log1p(x) {
	  var n = +x;
	  return n > -1e-8 && n < 1e-8 ? n - n * n / 2 : log(1 + n);
	};
	return mathLog1p;
}

var hasRequiredEs_math_acosh;

function requireEs_math_acosh () {
	if (hasRequiredEs_math_acosh) return es_math_acosh;
	hasRequiredEs_math_acosh = 1;
	var $ = require_export();
	var log1p = requireMathLog1p();

	// eslint-disable-next-line es/no-math-acosh -- required for testing
	var $acosh = Math.acosh;
	var log = Math.log;
	var sqrt = Math.sqrt;
	var LN2 = Math.LN2;

	var FORCED = !$acosh
	  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
	  || Math.floor($acosh(Number.MAX_VALUE)) !== 710
	  // Tor Browser bug: Math.acosh(Infinity) -> NaN
	  || $acosh(Infinity) !== Infinity;

	// `Math.acosh` method
	// https://tc39.es/ecma262/#sec-math.acosh
	$({ target: 'Math', stat: true, forced: FORCED }, {
	  acosh: function acosh(x) {
	    var n = +x;
	    return n < 1 ? NaN : n > 94906265.62425156
	      ? log(n) + LN2
	      : log1p(n - 1 + sqrt(n - 1) * sqrt(n + 1));
	  }
	});
	return es_math_acosh;
}

var es_math_asinh = {};

var hasRequiredEs_math_asinh;

function requireEs_math_asinh () {
	if (hasRequiredEs_math_asinh) return es_math_asinh;
	hasRequiredEs_math_asinh = 1;
	var $ = require_export();

	// eslint-disable-next-line es/no-math-asinh -- required for testing
	var $asinh = Math.asinh;
	var log = Math.log;
	var sqrt = Math.sqrt;

	function asinh(x) {
	  var n = +x;
	  return !isFinite(n) || n === 0 ? n : n < 0 ? -asinh(-n) : log(n + sqrt(n * n + 1));
	}

	var FORCED = !($asinh && 1 / $asinh(0) > 0);

	// `Math.asinh` method
	// https://tc39.es/ecma262/#sec-math.asinh
	// Tor Browser bug: Math.asinh(0) -> -0
	$({ target: 'Math', stat: true, forced: FORCED }, {
	  asinh: asinh
	});
	return es_math_asinh;
}

var es_math_atanh = {};

var hasRequiredEs_math_atanh;

function requireEs_math_atanh () {
	if (hasRequiredEs_math_atanh) return es_math_atanh;
	hasRequiredEs_math_atanh = 1;
	var $ = require_export();

	// eslint-disable-next-line es/no-math-atanh -- required for testing
	var $atanh = Math.atanh;
	var log = Math.log;

	var FORCED = !($atanh && 1 / $atanh(-0) < 0);

	// `Math.atanh` method
	// https://tc39.es/ecma262/#sec-math.atanh
	// Tor Browser bug: Math.atanh(-0) -> 0
	$({ target: 'Math', stat: true, forced: FORCED }, {
	  atanh: function atanh(x) {
	    var n = +x;
	    return n === 0 ? n : log((1 + n) / (1 - n)) / 2;
	  }
	});
	return es_math_atanh;
}

var es_math_cbrt = {};

var hasRequiredEs_math_cbrt;

function requireEs_math_cbrt () {
	if (hasRequiredEs_math_cbrt) return es_math_cbrt;
	hasRequiredEs_math_cbrt = 1;
	var $ = require_export();
	var sign = requireMathSign();

	var abs = Math.abs;
	var pow = Math.pow;

	// `Math.cbrt` method
	// https://tc39.es/ecma262/#sec-math.cbrt
	$({ target: 'Math', stat: true }, {
	  cbrt: function cbrt(x) {
	    var n = +x;
	    return sign(n) * pow(abs(n), 1 / 3);
	  }
	});
	return es_math_cbrt;
}

var es_math_clz32 = {};

var hasRequiredEs_math_clz32;

function requireEs_math_clz32 () {
	if (hasRequiredEs_math_clz32) return es_math_clz32;
	hasRequiredEs_math_clz32 = 1;
	var $ = require_export();

	var floor = Math.floor;
	var log = Math.log;
	var LOG2E = Math.LOG2E;

	// `Math.clz32` method
	// https://tc39.es/ecma262/#sec-math.clz32
	$({ target: 'Math', stat: true }, {
	  clz32: function clz32(x) {
	    var n = x >>> 0;
	    return n ? 31 - floor(log(n + 0.5) * LOG2E) : 32;
	  }
	});
	return es_math_clz32;
}

var es_math_cosh = {};

var mathExpm1;
var hasRequiredMathExpm1;

function requireMathExpm1 () {
	if (hasRequiredMathExpm1) return mathExpm1;
	hasRequiredMathExpm1 = 1;
	// eslint-disable-next-line es/no-math-expm1 -- safe
	var $expm1 = Math.expm1;
	var exp = Math.exp;

	// `Math.expm1` method implementation
	// https://tc39.es/ecma262/#sec-math.expm1
	mathExpm1 = (!$expm1
	  // Old FF bug
	  // eslint-disable-next-line no-loss-of-precision -- required for old engines
	  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
	  // Tor Browser bug
	  || $expm1(-2e-17) !== -2e-17
	) ? function expm1(x) {
	  var n = +x;
	  return n === 0 ? n : n > -1e-6 && n < 1e-6 ? n + n * n / 2 : exp(n) - 1;
	} : $expm1;
	return mathExpm1;
}

var hasRequiredEs_math_cosh;

function requireEs_math_cosh () {
	if (hasRequiredEs_math_cosh) return es_math_cosh;
	hasRequiredEs_math_cosh = 1;
	var $ = require_export();
	var expm1 = requireMathExpm1();

	// eslint-disable-next-line es/no-math-cosh -- required for testing
	var $cosh = Math.cosh;
	var abs = Math.abs;
	var E = Math.E;

	var FORCED = !$cosh || $cosh(710) === Infinity;

	// `Math.cosh` method
	// https://tc39.es/ecma262/#sec-math.cosh
	$({ target: 'Math', stat: true, forced: FORCED }, {
	  cosh: function cosh(x) {
	    var t = expm1(abs(x) - 1) + 1;
	    return (t + 1 / (t * E * E)) * (E / 2);
	  }
	});
	return es_math_cosh;
}

var es_math_expm1 = {};

var hasRequiredEs_math_expm1;

function requireEs_math_expm1 () {
	if (hasRequiredEs_math_expm1) return es_math_expm1;
	hasRequiredEs_math_expm1 = 1;
	var $ = require_export();
	var expm1 = requireMathExpm1();

	// `Math.expm1` method
	// https://tc39.es/ecma262/#sec-math.expm1
	// eslint-disable-next-line es/no-math-expm1 -- required for testing
	$({ target: 'Math', stat: true, forced: expm1 !== Math.expm1 }, { expm1: expm1 });
	return es_math_expm1;
}

var es_math_fround = {};

var hasRequiredEs_math_fround;

function requireEs_math_fround () {
	if (hasRequiredEs_math_fround) return es_math_fround;
	hasRequiredEs_math_fround = 1;
	var $ = require_export();
	var fround = requireMathFround();

	// `Math.fround` method
	// https://tc39.es/ecma262/#sec-math.fround
	$({ target: 'Math', stat: true }, { fround: fround });
	return es_math_fround;
}

var es_math_hypot = {};

var hasRequiredEs_math_hypot;

function requireEs_math_hypot () {
	if (hasRequiredEs_math_hypot) return es_math_hypot;
	hasRequiredEs_math_hypot = 1;
	var $ = require_export();

	// eslint-disable-next-line es/no-math-hypot -- required for testing
	var $hypot = Math.hypot;
	var abs = Math.abs;
	var sqrt = Math.sqrt;

	// Chrome 77 bug
	// https://bugs.chromium.org/p/v8/issues/detail?id=9546
	var FORCED = !!$hypot && $hypot(Infinity, NaN) !== Infinity;

	// `Math.hypot` method
	// https://tc39.es/ecma262/#sec-math.hypot
	$({ target: 'Math', stat: true, arity: 2, forced: FORCED }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  hypot: function hypot(value1, value2) {
	    var sum = 0;
	    var i = 0;
	    var aLen = arguments.length;
	    var larg = 0;
	    var arg, div;
	    while (i < aLen) {
	      arg = abs(arguments[i++]);
	      if (larg < arg) {
	        div = larg / arg;
	        sum = sum * div * div + 1;
	        larg = arg;
	      } else if (arg > 0) {
	        div = arg / larg;
	        sum += div * div;
	      } else sum += arg;
	    }
	    return larg === Infinity ? Infinity : larg * sqrt(sum);
	  }
	});
	return es_math_hypot;
}

var es_math_imul = {};

var hasRequiredEs_math_imul;

function requireEs_math_imul () {
	if (hasRequiredEs_math_imul) return es_math_imul;
	hasRequiredEs_math_imul = 1;
	var $ = require_export();
	var fails = requireFails();

	// eslint-disable-next-line es/no-math-imul -- required for testing
	var $imul = Math.imul;

	var FORCED = fails(function () {
	  return $imul(0xFFFFFFFF, 5) !== -5 || $imul.length !== 2;
	});

	// `Math.imul` method
	// https://tc39.es/ecma262/#sec-math.imul
	// some WebKit versions fails with big numbers, some has wrong arity
	$({ target: 'Math', stat: true, forced: FORCED }, {
	  imul: function imul(x, y) {
	    var UINT16 = 0xFFFF;
	    var xn = +x;
	    var yn = +y;
	    var xl = UINT16 & xn;
	    var yl = UINT16 & yn;
	    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
	  }
	});
	return es_math_imul;
}

var es_math_log10 = {};

var mathLog10;
var hasRequiredMathLog10;

function requireMathLog10 () {
	if (hasRequiredMathLog10) return mathLog10;
	hasRequiredMathLog10 = 1;
	var log = Math.log;
	var LOG10E = Math.LOG10E;

	// eslint-disable-next-line es/no-math-log10 -- safe
	mathLog10 = Math.log10 || function log10(x) {
	  return log(x) * LOG10E;
	};
	return mathLog10;
}

var hasRequiredEs_math_log10;

function requireEs_math_log10 () {
	if (hasRequiredEs_math_log10) return es_math_log10;
	hasRequiredEs_math_log10 = 1;
	var $ = require_export();
	var log10 = requireMathLog10();

	// `Math.log10` method
	// https://tc39.es/ecma262/#sec-math.log10
	$({ target: 'Math', stat: true }, {
	  log10: log10
	});
	return es_math_log10;
}

var es_math_log1p = {};

var hasRequiredEs_math_log1p;

function requireEs_math_log1p () {
	if (hasRequiredEs_math_log1p) return es_math_log1p;
	hasRequiredEs_math_log1p = 1;
	var $ = require_export();
	var log1p = requireMathLog1p();

	// `Math.log1p` method
	// https://tc39.es/ecma262/#sec-math.log1p
	$({ target: 'Math', stat: true }, { log1p: log1p });
	return es_math_log1p;
}

var es_math_log2 = {};

var hasRequiredEs_math_log2;

function requireEs_math_log2 () {
	if (hasRequiredEs_math_log2) return es_math_log2;
	hasRequiredEs_math_log2 = 1;
	var $ = require_export();

	var log = Math.log;
	var LN2 = Math.LN2;

	// `Math.log2` method
	// https://tc39.es/ecma262/#sec-math.log2
	$({ target: 'Math', stat: true }, {
	  log2: function log2(x) {
	    return log(x) / LN2;
	  }
	});
	return es_math_log2;
}

var es_math_sign = {};

var hasRequiredEs_math_sign;

function requireEs_math_sign () {
	if (hasRequiredEs_math_sign) return es_math_sign;
	hasRequiredEs_math_sign = 1;
	var $ = require_export();
	var sign = requireMathSign();

	// `Math.sign` method
	// https://tc39.es/ecma262/#sec-math.sign
	$({ target: 'Math', stat: true }, {
	  sign: sign
	});
	return es_math_sign;
}

var es_math_sinh = {};

var hasRequiredEs_math_sinh;

function requireEs_math_sinh () {
	if (hasRequiredEs_math_sinh) return es_math_sinh;
	hasRequiredEs_math_sinh = 1;
	var $ = require_export();
	var fails = requireFails();
	var expm1 = requireMathExpm1();

	var abs = Math.abs;
	var exp = Math.exp;
	var E = Math.E;

	var FORCED = fails(function () {
	  // eslint-disable-next-line es/no-math-sinh -- required for testing
	  return Math.sinh(-2e-17) !== -2e-17;
	});

	// `Math.sinh` method
	// https://tc39.es/ecma262/#sec-math.sinh
	// V8 near Chromium 38 has a problem with very small numbers
	$({ target: 'Math', stat: true, forced: FORCED }, {
	  sinh: function sinh(x) {
	    var n = +x;
	    return abs(n) < 1 ? (expm1(n) - expm1(-n)) / 2 : (exp(n - 1) - exp(-n - 1)) * (E / 2);
	  }
	});
	return es_math_sinh;
}

var es_math_tanh = {};

var hasRequiredEs_math_tanh;

function requireEs_math_tanh () {
	if (hasRequiredEs_math_tanh) return es_math_tanh;
	hasRequiredEs_math_tanh = 1;
	var $ = require_export();
	var expm1 = requireMathExpm1();

	var exp = Math.exp;

	// `Math.tanh` method
	// https://tc39.es/ecma262/#sec-math.tanh
	$({ target: 'Math', stat: true }, {
	  tanh: function tanh(x) {
	    var n = +x;
	    var a = expm1(n);
	    var b = expm1(-n);
	    return a === Infinity ? 1 : b === Infinity ? -1 : (a - b) / (exp(n) + exp(-n));
	  }
	});
	return es_math_tanh;
}

var es_math_toStringTag = {};

var hasRequiredEs_math_toStringTag;

function requireEs_math_toStringTag () {
	if (hasRequiredEs_math_toStringTag) return es_math_toStringTag;
	hasRequiredEs_math_toStringTag = 1;
	var setToStringTag = requireSetToStringTag();

	// Math[@@toStringTag] property
	// https://tc39.es/ecma262/#sec-math-@@tostringtag
	setToStringTag(Math, 'Math', true);
	return es_math_toStringTag;
}

var es_math_trunc = {};

var hasRequiredEs_math_trunc;

function requireEs_math_trunc () {
	if (hasRequiredEs_math_trunc) return es_math_trunc;
	hasRequiredEs_math_trunc = 1;
	var $ = require_export();
	var trunc = requireMathTrunc();

	// `Math.trunc` method
	// https://tc39.es/ecma262/#sec-math.trunc
	$({ target: 'Math', stat: true }, {
	  trunc: trunc
	});
	return es_math_trunc;
}

var es_number_constructor = {};

var thisNumberValue;
var hasRequiredThisNumberValue;

function requireThisNumberValue () {
	if (hasRequiredThisNumberValue) return thisNumberValue;
	hasRequiredThisNumberValue = 1;
	var uncurryThis = requireFunctionUncurryThis();

	// `thisNumberValue` abstract operation
	// https://tc39.es/ecma262/#sec-thisnumbervalue
	thisNumberValue = uncurryThis(1.0.valueOf);
	return thisNumberValue;
}

var whitespaces;
var hasRequiredWhitespaces;

function requireWhitespaces () {
	if (hasRequiredWhitespaces) return whitespaces;
	hasRequiredWhitespaces = 1;
	// a string of all valid unicode whitespaces
	whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
	  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
	return whitespaces;
}

var stringTrim;
var hasRequiredStringTrim;

function requireStringTrim () {
	if (hasRequiredStringTrim) return stringTrim;
	hasRequiredStringTrim = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toString = requireToString();
	var whitespaces = requireWhitespaces();

	var replace = uncurryThis(''.replace);
	var ltrim = RegExp('^[' + whitespaces + ']+');
	var rtrim = RegExp('(^|[^' + whitespaces + '])[' + whitespaces + ']+$');

	// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
	var createMethod = function (TYPE) {
	  return function ($this) {
	    var string = toString(requireObjectCoercible($this));
	    if (TYPE & 1) string = replace(string, ltrim, '');
	    if (TYPE & 2) string = replace(string, rtrim, '$1');
	    return string;
	  };
	};

	stringTrim = {
	  // `String.prototype.{ trimLeft, trimStart }` methods
	  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
	  start: createMethod(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.es/ecma262/#sec-string.prototype.trimend
	  end: createMethod(2),
	  // `String.prototype.trim` method
	  // https://tc39.es/ecma262/#sec-string.prototype.trim
	  trim: createMethod(3)
	};
	return stringTrim;
}

var hasRequiredEs_number_constructor;

function requireEs_number_constructor () {
	if (hasRequiredEs_number_constructor) return es_number_constructor;
	hasRequiredEs_number_constructor = 1;
	var $ = require_export();
	var IS_PURE = requireIsPure();
	var DESCRIPTORS = requireDescriptors();
	var globalThis = requireGlobalThis();
	var path = requirePath();
	var uncurryThis = requireFunctionUncurryThis();
	var isForced = requireIsForced();
	var hasOwn = requireHasOwnProperty();
	var inheritIfRequired = requireInheritIfRequired();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var isSymbol = requireIsSymbol();
	var toPrimitive = requireToPrimitive();
	var fails = requireFails();
	var getOwnPropertyNames = requireObjectGetOwnPropertyNames().f;
	var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
	var defineProperty = requireObjectDefineProperty().f;
	var thisNumberValue = requireThisNumberValue();
	var trim = requireStringTrim().trim;

	var NUMBER = 'Number';
	var NativeNumber = globalThis[NUMBER];
	var PureNumberNamespace = path[NUMBER];
	var NumberPrototype = NativeNumber.prototype;
	var TypeError = globalThis.TypeError;
	var stringSlice = uncurryThis(''.slice);
	var charCodeAt = uncurryThis(''.charCodeAt);

	// `ToNumeric` abstract operation
	// https://tc39.es/ecma262/#sec-tonumeric
	var toNumeric = function (value) {
	  var primValue = toPrimitive(value, 'number');
	  return typeof primValue == 'bigint' ? primValue : toNumber(primValue);
	};

	// `ToNumber` abstract operation
	// https://tc39.es/ecma262/#sec-tonumber
	var toNumber = function (argument) {
	  var it = toPrimitive(argument, 'number');
	  var first, third, radix, maxCode, digits, length, index, code;
	  if (isSymbol(it)) throw new TypeError('Cannot convert a Symbol value to a number');
	  if (typeof it == 'string' && it.length > 2) {
	    it = trim(it);
	    first = charCodeAt(it, 0);
	    if (first === 43 || first === 45) {
	      third = charCodeAt(it, 2);
	      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
	    } else if (first === 48) {
	      switch (charCodeAt(it, 1)) {
	        // fast equal of /^0b[01]+$/i
	        case 66:
	        case 98:
	          radix = 2;
	          maxCode = 49;
	          break;
	        // fast equal of /^0o[0-7]+$/i
	        case 79:
	        case 111:
	          radix = 8;
	          maxCode = 55;
	          break;
	        default:
	          return +it;
	      }
	      digits = stringSlice(it, 2);
	      length = digits.length;
	      for (index = 0; index < length; index++) {
	        code = charCodeAt(digits, index);
	        // parseInt parses a string to a first unavailable symbol
	        // but ToNumber should return NaN if a string contains unavailable symbols
	        if (code < 48 || code > maxCode) return NaN;
	      } return parseInt(digits, radix);
	    }
	  } return +it;
	};

	var FORCED = isForced(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'));

	var calledWithNew = function (dummy) {
	  // includes check on 1..constructor(foo) case
	  return isPrototypeOf(NumberPrototype, dummy) && fails(function () { thisNumberValue(dummy); });
	};

	// `Number` constructor
	// https://tc39.es/ecma262/#sec-number-constructor
	var NumberWrapper = function Number(value) {
	  var n = arguments.length < 1 ? 0 : NativeNumber(toNumeric(value));
	  return calledWithNew(this) ? inheritIfRequired(Object(n), this, NumberWrapper) : n;
	};

	NumberWrapper.prototype = NumberPrototype;
	if (FORCED && !IS_PURE) NumberPrototype.constructor = NumberWrapper;

	$({ global: true, constructor: true, wrap: true, forced: FORCED }, {
	  Number: NumberWrapper
	});

	// Use `internal/copy-constructor-properties` helper in `core-js@4`
	var copyConstructorProperties = function (target, source) {
	  for (var keys = DESCRIPTORS ? getOwnPropertyNames(source) : (
	    // ES3:
	    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	    // ES2015 (in case, if modules with ES2015 Number statics required before):
	    'EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,' +
	    // ESNext
	    'fromString,range'
	  ).split(','), j = 0, key; keys.length > j; j++) {
	    if (hasOwn(source, key = keys[j]) && !hasOwn(target, key)) {
	      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	    }
	  }
	};

	if (IS_PURE && PureNumberNamespace) copyConstructorProperties(path[NUMBER], PureNumberNamespace);
	if (FORCED || IS_PURE) copyConstructorProperties(path[NUMBER], NativeNumber);
	return es_number_constructor;
}

var es_number_epsilon = {};

var hasRequiredEs_number_epsilon;

function requireEs_number_epsilon () {
	if (hasRequiredEs_number_epsilon) return es_number_epsilon;
	hasRequiredEs_number_epsilon = 1;
	var $ = require_export();

	// `Number.EPSILON` constant
	// https://tc39.es/ecma262/#sec-number.epsilon
	$({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
	  EPSILON: Math.pow(2, -52)
	});
	return es_number_epsilon;
}

var es_number_isFinite = {};

var numberIsFinite;
var hasRequiredNumberIsFinite;

function requireNumberIsFinite () {
	if (hasRequiredNumberIsFinite) return numberIsFinite;
	hasRequiredNumberIsFinite = 1;
	var globalThis = requireGlobalThis();

	var globalIsFinite = globalThis.isFinite;

	// `Number.isFinite` method
	// https://tc39.es/ecma262/#sec-number.isfinite
	// eslint-disable-next-line es/no-number-isfinite -- safe
	numberIsFinite = Number.isFinite || function isFinite(it) {
	  return typeof it == 'number' && globalIsFinite(it);
	};
	return numberIsFinite;
}

var hasRequiredEs_number_isFinite;

function requireEs_number_isFinite () {
	if (hasRequiredEs_number_isFinite) return es_number_isFinite;
	hasRequiredEs_number_isFinite = 1;
	var $ = require_export();
	var numberIsFinite = requireNumberIsFinite();

	// `Number.isFinite` method
	// https://tc39.es/ecma262/#sec-number.isfinite
	$({ target: 'Number', stat: true }, { isFinite: numberIsFinite });
	return es_number_isFinite;
}

var es_number_isInteger = {};

var isIntegralNumber;
var hasRequiredIsIntegralNumber;

function requireIsIntegralNumber () {
	if (hasRequiredIsIntegralNumber) return isIntegralNumber;
	hasRequiredIsIntegralNumber = 1;
	var isObject = requireIsObject();

	var floor = Math.floor;

	// `IsIntegralNumber` abstract operation
	// https://tc39.es/ecma262/#sec-isintegralnumber
	// eslint-disable-next-line es/no-number-isinteger -- safe
	isIntegralNumber = Number.isInteger || function isInteger(it) {
	  return !isObject(it) && isFinite(it) && floor(it) === it;
	};
	return isIntegralNumber;
}

var hasRequiredEs_number_isInteger;

function requireEs_number_isInteger () {
	if (hasRequiredEs_number_isInteger) return es_number_isInteger;
	hasRequiredEs_number_isInteger = 1;
	var $ = require_export();
	var isIntegralNumber = requireIsIntegralNumber();

	// `Number.isInteger` method
	// https://tc39.es/ecma262/#sec-number.isinteger
	$({ target: 'Number', stat: true }, {
	  isInteger: isIntegralNumber
	});
	return es_number_isInteger;
}

var es_number_isNan = {};

var hasRequiredEs_number_isNan;

function requireEs_number_isNan () {
	if (hasRequiredEs_number_isNan) return es_number_isNan;
	hasRequiredEs_number_isNan = 1;
	var $ = require_export();

	// `Number.isNaN` method
	// https://tc39.es/ecma262/#sec-number.isnan
	$({ target: 'Number', stat: true }, {
	  isNaN: function isNaN(number) {
	    // eslint-disable-next-line no-self-compare -- NaN check
	    return number !== number;
	  }
	});
	return es_number_isNan;
}

var es_number_isSafeInteger = {};

var hasRequiredEs_number_isSafeInteger;

function requireEs_number_isSafeInteger () {
	if (hasRequiredEs_number_isSafeInteger) return es_number_isSafeInteger;
	hasRequiredEs_number_isSafeInteger = 1;
	var $ = require_export();
	var isIntegralNumber = requireIsIntegralNumber();

	var abs = Math.abs;

	// `Number.isSafeInteger` method
	// https://tc39.es/ecma262/#sec-number.issafeinteger
	$({ target: 'Number', stat: true }, {
	  isSafeInteger: function isSafeInteger(number) {
	    return isIntegralNumber(number) && abs(number) <= 0x1FFFFFFFFFFFFF;
	  }
	});
	return es_number_isSafeInteger;
}

var es_number_maxSafeInteger = {};

var hasRequiredEs_number_maxSafeInteger;

function requireEs_number_maxSafeInteger () {
	if (hasRequiredEs_number_maxSafeInteger) return es_number_maxSafeInteger;
	hasRequiredEs_number_maxSafeInteger = 1;
	var $ = require_export();

	// `Number.MAX_SAFE_INTEGER` constant
	// https://tc39.es/ecma262/#sec-number.max_safe_integer
	$({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
	  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
	});
	return es_number_maxSafeInteger;
}

var es_number_minSafeInteger = {};

var hasRequiredEs_number_minSafeInteger;

function requireEs_number_minSafeInteger () {
	if (hasRequiredEs_number_minSafeInteger) return es_number_minSafeInteger;
	hasRequiredEs_number_minSafeInteger = 1;
	var $ = require_export();

	// `Number.MIN_SAFE_INTEGER` constant
	// https://tc39.es/ecma262/#sec-number.min_safe_integer
	$({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
	  MIN_SAFE_INTEGER: -0x1FFFFFFFFFFFFF
	});
	return es_number_minSafeInteger;
}

var es_number_parseFloat = {};

var numberParseFloat;
var hasRequiredNumberParseFloat;

function requireNumberParseFloat () {
	if (hasRequiredNumberParseFloat) return numberParseFloat;
	hasRequiredNumberParseFloat = 1;
	var globalThis = requireGlobalThis();
	var fails = requireFails();
	var uncurryThis = requireFunctionUncurryThis();
	var toString = requireToString();
	var trim = requireStringTrim().trim;
	var whitespaces = requireWhitespaces();

	var charAt = uncurryThis(''.charAt);
	var $parseFloat = globalThis.parseFloat;
	var Symbol = globalThis.Symbol;
	var ITERATOR = Symbol && Symbol.iterator;
	var FORCED = 1 / $parseFloat(whitespaces + '-0') !== -Infinity
	  // MS Edge 18- broken with boxed symbols
	  || (ITERATOR && !fails(function () { $parseFloat(Object(ITERATOR)); }));

	// `parseFloat` method
	// https://tc39.es/ecma262/#sec-parsefloat-string
	numberParseFloat = FORCED ? function parseFloat(string) {
	  var trimmedString = trim(toString(string));
	  var result = $parseFloat(trimmedString);
	  return result === 0 && charAt(trimmedString, 0) === '-' ? -0 : result;
	} : $parseFloat;
	return numberParseFloat;
}

var hasRequiredEs_number_parseFloat;

function requireEs_number_parseFloat () {
	if (hasRequiredEs_number_parseFloat) return es_number_parseFloat;
	hasRequiredEs_number_parseFloat = 1;
	var $ = require_export();
	var parseFloat = requireNumberParseFloat();

	// `Number.parseFloat` method
	// https://tc39.es/ecma262/#sec-number.parseFloat
	// eslint-disable-next-line es/no-number-parsefloat -- required for testing
	$({ target: 'Number', stat: true, forced: Number.parseFloat !== parseFloat }, {
	  parseFloat: parseFloat
	});
	return es_number_parseFloat;
}

var es_number_parseInt = {};

var numberParseInt;
var hasRequiredNumberParseInt;

function requireNumberParseInt () {
	if (hasRequiredNumberParseInt) return numberParseInt;
	hasRequiredNumberParseInt = 1;
	var globalThis = requireGlobalThis();
	var fails = requireFails();
	var uncurryThis = requireFunctionUncurryThis();
	var toString = requireToString();
	var trim = requireStringTrim().trim;
	var whitespaces = requireWhitespaces();

	var $parseInt = globalThis.parseInt;
	var Symbol = globalThis.Symbol;
	var ITERATOR = Symbol && Symbol.iterator;
	var hex = /^[+-]?0x/i;
	var exec = uncurryThis(hex.exec);
	var FORCED = $parseInt(whitespaces + '08') !== 8 || $parseInt(whitespaces + '0x16') !== 22
	  // MS Edge 18- broken with boxed symbols
	  || (ITERATOR && !fails(function () { $parseInt(Object(ITERATOR)); }));

	// `parseInt` method
	// https://tc39.es/ecma262/#sec-parseint-string-radix
	numberParseInt = FORCED ? function parseInt(string, radix) {
	  var S = trim(toString(string));
	  return $parseInt(S, (radix >>> 0) || (exec(hex, S) ? 16 : 10));
	} : $parseInt;
	return numberParseInt;
}

var hasRequiredEs_number_parseInt;

function requireEs_number_parseInt () {
	if (hasRequiredEs_number_parseInt) return es_number_parseInt;
	hasRequiredEs_number_parseInt = 1;
	var $ = require_export();
	var parseInt = requireNumberParseInt();

	// `Number.parseInt` method
	// https://tc39.es/ecma262/#sec-number.parseint
	// eslint-disable-next-line es/no-number-parseint -- required for testing
	$({ target: 'Number', stat: true, forced: Number.parseInt !== parseInt }, {
	  parseInt: parseInt
	});
	return es_number_parseInt;
}

var es_number_toExponential = {};

var hasRequiredEs_number_toExponential;

function requireEs_number_toExponential () {
	if (hasRequiredEs_number_toExponential) return es_number_toExponential;
	hasRequiredEs_number_toExponential = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var thisNumberValue = requireThisNumberValue();
	var $repeat = requireStringRepeat();
	var log10 = requireMathLog10();
	var fails = requireFails();

	var $RangeError = RangeError;
	var $String = String;
	var $isFinite = isFinite;
	var abs = Math.abs;
	var floor = Math.floor;
	var pow = Math.pow;
	var round = Math.round;
	var nativeToExponential = uncurryThis(1.0.toExponential);
	var repeat = uncurryThis($repeat);
	var stringSlice = uncurryThis(''.slice);

	// Edge 17-
	var ROUNDS_PROPERLY = nativeToExponential(-6.9e-11, 4) === '-6.9000e-11'
	  // IE11- && Edge 14-
	  && nativeToExponential(1.255, 2) === '1.25e+0'
	  // FF86-, V8 ~ Chrome 49-50
	  && nativeToExponential(12345, 3) === '1.235e+4'
	  // FF86-, V8 ~ Chrome 49-50
	  && nativeToExponential(25, 0) === '3e+1';

	// IE8-
	var throwsOnInfinityFraction = function () {
	  return fails(function () {
	    nativeToExponential(1, Infinity);
	  }) && fails(function () {
	    nativeToExponential(1, -Infinity);
	  });
	};

	// Safari <11 && FF <50
	var properNonFiniteThisCheck = function () {
	  return !fails(function () {
	    nativeToExponential(Infinity, Infinity);
	    nativeToExponential(NaN, Infinity);
	  });
	};

	var FORCED = !ROUNDS_PROPERLY || !throwsOnInfinityFraction() || !properNonFiniteThisCheck();

	// `Number.prototype.toExponential` method
	// https://tc39.es/ecma262/#sec-number.prototype.toexponential
	$({ target: 'Number', proto: true, forced: FORCED }, {
	  toExponential: function toExponential(fractionDigits) {
	    var x = thisNumberValue(this);
	    if (fractionDigits === undefined) return nativeToExponential(x);
	    var f = toIntegerOrInfinity(fractionDigits);
	    if (!$isFinite(x)) return String(x);
	    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
	    if (f < 0 || f > 20) throw new $RangeError('Incorrect fraction digits');
	    if (ROUNDS_PROPERLY) return nativeToExponential(x, f);
	    var s = '';
	    var m, e, c, d;
	    if (x < 0) {
	      s = '-';
	      x = -x;
	    }
	    if (x === 0) {
	      e = 0;
	      m = repeat('0', f + 1);
	    } else {
	      // this block is based on https://gist.github.com/SheetJSDev/1100ad56b9f856c95299ed0e068eea08
	      // TODO: improve accuracy with big fraction digits
	      var l = log10(x);
	      e = floor(l);
	      var w = pow(10, e - f);
	      var n = round(x / w);
	      if (2 * x >= (2 * n + 1) * w) {
	        n += 1;
	      }
	      if (n >= pow(10, f + 1)) {
	        n /= 10;
	        e += 1;
	      }
	      m = $String(n);
	    }
	    if (f !== 0) {
	      m = stringSlice(m, 0, 1) + '.' + stringSlice(m, 1);
	    }
	    if (e === 0) {
	      c = '+';
	      d = '0';
	    } else {
	      c = e > 0 ? '+' : '-';
	      d = $String(abs(e));
	    }
	    m += 'e' + c + d;
	    return s + m;
	  }
	});
	return es_number_toExponential;
}

var es_number_toFixed = {};

var hasRequiredEs_number_toFixed;

function requireEs_number_toFixed () {
	if (hasRequiredEs_number_toFixed) return es_number_toFixed;
	hasRequiredEs_number_toFixed = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var thisNumberValue = requireThisNumberValue();
	var $repeat = requireStringRepeat();
	var fails = requireFails();

	var $RangeError = RangeError;
	var $String = String;
	var floor = Math.floor;
	var repeat = uncurryThis($repeat);
	var stringSlice = uncurryThis(''.slice);
	var nativeToFixed = uncurryThis(1.0.toFixed);

	var pow = function (x, n, acc) {
	  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
	};

	var log = function (x) {
	  var n = 0;
	  var x2 = x;
	  while (x2 >= 4096) {
	    n += 12;
	    x2 /= 4096;
	  }
	  while (x2 >= 2) {
	    n += 1;
	    x2 /= 2;
	  } return n;
	};

	var multiply = function (data, n, c) {
	  var index = -1;
	  var c2 = c;
	  while (++index < 6) {
	    c2 += n * data[index];
	    data[index] = c2 % 1e7;
	    c2 = floor(c2 / 1e7);
	  }
	};

	var divide = function (data, n) {
	  var index = 6;
	  var c = 0;
	  while (--index >= 0) {
	    c += data[index];
	    data[index] = floor(c / n);
	    c = (c % n) * 1e7;
	  }
	};

	var dataToString = function (data) {
	  var index = 6;
	  var s = '';
	  while (--index >= 0) {
	    if (s !== '' || index === 0 || data[index] !== 0) {
	      var t = $String(data[index]);
	      s = s === '' ? t : s + repeat('0', 7 - t.length) + t;
	    }
	  } return s;
	};

	var FORCED = fails(function () {
	  return nativeToFixed(0.00008, 3) !== '0.000' ||
	    nativeToFixed(0.9, 0) !== '1' ||
	    nativeToFixed(1.255, 2) !== '1.25' ||
	    nativeToFixed(1000000000000000128.0, 0) !== '1000000000000000128';
	}) || !fails(function () {
	  // V8 ~ Android 4.3-
	  nativeToFixed({});
	});

	// `Number.prototype.toFixed` method
	// https://tc39.es/ecma262/#sec-number.prototype.tofixed
	$({ target: 'Number', proto: true, forced: FORCED }, {
	  toFixed: function toFixed(fractionDigits) {
	    var number = thisNumberValue(this);
	    var fractDigits = toIntegerOrInfinity(fractionDigits);
	    var data = [0, 0, 0, 0, 0, 0];
	    var sign = '';
	    var result = '0';
	    var e, z, j, k;

	    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
	    if (fractDigits < 0 || fractDigits > 20) throw new $RangeError('Incorrect fraction digits');
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (number !== number) return 'NaN';
	    if (number <= -1e21 || number >= 1e21) return $String(number);
	    if (number < 0) {
	      sign = '-';
	      number = -number;
	    }
	    if (number > 1e-21) {
	      e = log(number * pow(2, 69, 1)) - 69;
	      z = e < 0 ? number * pow(2, -e, 1) : number / pow(2, e, 1);
	      z *= 0x10000000000000;
	      e = 52 - e;
	      if (e > 0) {
	        multiply(data, 0, z);
	        j = fractDigits;
	        while (j >= 7) {
	          multiply(data, 1e7, 0);
	          j -= 7;
	        }
	        multiply(data, pow(10, j, 1), 0);
	        j = e - 1;
	        while (j >= 23) {
	          divide(data, 1 << 23);
	          j -= 23;
	        }
	        divide(data, 1 << j);
	        multiply(data, 1, 1);
	        divide(data, 2);
	        result = dataToString(data);
	      } else {
	        multiply(data, 0, z);
	        multiply(data, 1 << -e, 0);
	        result = dataToString(data) + repeat('0', fractDigits);
	      }
	    }
	    if (fractDigits > 0) {
	      k = result.length;
	      result = sign + (k <= fractDigits
	        ? '0.' + repeat('0', fractDigits - k) + result
	        : stringSlice(result, 0, k - fractDigits) + '.' + stringSlice(result, k - fractDigits));
	    } else {
	      result = sign + result;
	    } return result;
	  }
	});
	return es_number_toFixed;
}

var es_number_toPrecision = {};

var hasRequiredEs_number_toPrecision;

function requireEs_number_toPrecision () {
	if (hasRequiredEs_number_toPrecision) return es_number_toPrecision;
	hasRequiredEs_number_toPrecision = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var fails = requireFails();
	var thisNumberValue = requireThisNumberValue();

	var nativeToPrecision = uncurryThis(1.0.toPrecision);

	var FORCED = fails(function () {
	  // IE7-
	  return nativeToPrecision(1, undefined) !== '1';
	}) || !fails(function () {
	  // V8 ~ Android 4.3-
	  nativeToPrecision({});
	});

	// `Number.prototype.toPrecision` method
	// https://tc39.es/ecma262/#sec-number.prototype.toprecision
	$({ target: 'Number', proto: true, forced: FORCED }, {
	  toPrecision: function toPrecision(precision) {
	    return precision === undefined
	      ? nativeToPrecision(thisNumberValue(this))
	      : nativeToPrecision(thisNumberValue(this), precision);
	  }
	});
	return es_number_toPrecision;
}

var es_object_assign = {};

var objectAssign;
var hasRequiredObjectAssign;

function requireObjectAssign () {
	if (hasRequiredObjectAssign) return objectAssign;
	hasRequiredObjectAssign = 1;
	var DESCRIPTORS = requireDescriptors();
	var uncurryThis = requireFunctionUncurryThis();
	var call = requireFunctionCall();
	var fails = requireFails();
	var objectKeys = requireObjectKeys();
	var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
	var propertyIsEnumerableModule = requireObjectPropertyIsEnumerable();
	var toObject = requireToObject();
	var IndexedObject = requireIndexedObject();

	// eslint-disable-next-line es/no-object-assign -- safe
	var $assign = Object.assign;
	// eslint-disable-next-line es/no-object-defineproperty -- required for testing
	var defineProperty = Object.defineProperty;
	var concat = uncurryThis([].concat);

	// `Object.assign` method
	// https://tc39.es/ecma262/#sec-object.assign
	objectAssign = !$assign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (DESCRIPTORS && $assign({ b: 1 }, $assign(defineProperty({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line es/no-symbol -- safe
	  var symbol = Symbol('assign detection');
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return $assign({}, A)[symbol] !== 7 || objectKeys($assign({}, B)).join('') !== alphabet;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
	  var propertyIsEnumerable = propertyIsEnumerableModule.f;
	  while (argumentsLength > index) {
	    var S = IndexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? concat(objectKeys(S), getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!DESCRIPTORS || call(propertyIsEnumerable, S, key)) T[key] = S[key];
	    }
	  } return T;
	} : $assign;
	return objectAssign;
}

var hasRequiredEs_object_assign;

function requireEs_object_assign () {
	if (hasRequiredEs_object_assign) return es_object_assign;
	hasRequiredEs_object_assign = 1;
	var $ = require_export();
	var assign = requireObjectAssign();

	// `Object.assign` method
	// https://tc39.es/ecma262/#sec-object.assign
	// eslint-disable-next-line es/no-object-assign -- required for testing
	$({ target: 'Object', stat: true, arity: 2, forced: Object.assign !== assign }, {
	  assign: assign
	});
	return es_object_assign;
}

var es_object_create = {};

var hasRequiredEs_object_create;

function requireEs_object_create () {
	if (hasRequiredEs_object_create) return es_object_create;
	hasRequiredEs_object_create = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var create = requireObjectCreate();

	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	$({ target: 'Object', stat: true, sham: !DESCRIPTORS }, {
	  create: create
	});
	return es_object_create;
}

var es_object_defineGetter = {};

var objectPrototypeAccessorsForced;
var hasRequiredObjectPrototypeAccessorsForced;

function requireObjectPrototypeAccessorsForced () {
	if (hasRequiredObjectPrototypeAccessorsForced) return objectPrototypeAccessorsForced;
	hasRequiredObjectPrototypeAccessorsForced = 1;
	/* eslint-disable no-undef, no-useless-call, sonar/no-reference-error -- required for testing */
	/* eslint-disable es/no-legacy-object-prototype-accessor-methods -- required for testing */
	var IS_PURE = requireIsPure();
	var globalThis = requireGlobalThis();
	var fails = requireFails();
	var WEBKIT = requireEnvironmentWebkitVersion();

	// Forced replacement object prototype accessors methods
	objectPrototypeAccessorsForced = IS_PURE || !fails(function () {
	  // This feature detection crashes old WebKit
	  // https://github.com/zloirock/core-js/issues/232
	  if (WEBKIT && WEBKIT < 535) return;
	  var key = Math.random();
	  // In FF throws only define methods
	  __defineSetter__.call(null, key, function () { /* empty */ });
	  delete globalThis[key];
	});
	return objectPrototypeAccessorsForced;
}

var hasRequiredEs_object_defineGetter;

function requireEs_object_defineGetter () {
	if (hasRequiredEs_object_defineGetter) return es_object_defineGetter;
	hasRequiredEs_object_defineGetter = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var FORCED = requireObjectPrototypeAccessorsForced();
	var aCallable = requireACallable();
	var toObject = requireToObject();
	var definePropertyModule = requireObjectDefineProperty();

	// `Object.prototype.__defineGetter__` method
	// https://tc39.es/ecma262/#sec-object.prototype.__defineGetter__
	if (DESCRIPTORS) {
	  $({ target: 'Object', proto: true, forced: FORCED }, {
	    __defineGetter__: function __defineGetter__(P, getter) {
	      definePropertyModule.f(toObject(this), P, { get: aCallable(getter), enumerable: true, configurable: true });
	    }
	  });
	}
	return es_object_defineGetter;
}

var es_object_defineProperties = {};

var hasRequiredEs_object_defineProperties;

function requireEs_object_defineProperties () {
	if (hasRequiredEs_object_defineProperties) return es_object_defineProperties;
	hasRequiredEs_object_defineProperties = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var defineProperties = requireObjectDefineProperties().f;

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	// eslint-disable-next-line es/no-object-defineproperties -- safe
	$({ target: 'Object', stat: true, forced: Object.defineProperties !== defineProperties, sham: !DESCRIPTORS }, {
	  defineProperties: defineProperties
	});
	return es_object_defineProperties;
}

var es_object_defineProperty = {};

var hasRequiredEs_object_defineProperty;

function requireEs_object_defineProperty () {
	if (hasRequiredEs_object_defineProperty) return es_object_defineProperty;
	hasRequiredEs_object_defineProperty = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var defineProperty = requireObjectDefineProperty().f;

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	$({ target: 'Object', stat: true, forced: Object.defineProperty !== defineProperty, sham: !DESCRIPTORS }, {
	  defineProperty: defineProperty
	});
	return es_object_defineProperty;
}

var es_object_defineSetter = {};

var hasRequiredEs_object_defineSetter;

function requireEs_object_defineSetter () {
	if (hasRequiredEs_object_defineSetter) return es_object_defineSetter;
	hasRequiredEs_object_defineSetter = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var FORCED = requireObjectPrototypeAccessorsForced();
	var aCallable = requireACallable();
	var toObject = requireToObject();
	var definePropertyModule = requireObjectDefineProperty();

	// `Object.prototype.__defineSetter__` method
	// https://tc39.es/ecma262/#sec-object.prototype.__defineSetter__
	if (DESCRIPTORS) {
	  $({ target: 'Object', proto: true, forced: FORCED }, {
	    __defineSetter__: function __defineSetter__(P, setter) {
	      definePropertyModule.f(toObject(this), P, { set: aCallable(setter), enumerable: true, configurable: true });
	    }
	  });
	}
	return es_object_defineSetter;
}

var es_object_entries = {};

var objectToArray;
var hasRequiredObjectToArray;

function requireObjectToArray () {
	if (hasRequiredObjectToArray) return objectToArray;
	hasRequiredObjectToArray = 1;
	var DESCRIPTORS = requireDescriptors();
	var fails = requireFails();
	var uncurryThis = requireFunctionUncurryThis();
	var objectGetPrototypeOf = requireObjectGetPrototypeOf();
	var objectKeys = requireObjectKeys();
	var toIndexedObject = requireToIndexedObject();
	var $propertyIsEnumerable = requireObjectPropertyIsEnumerable().f;

	var propertyIsEnumerable = uncurryThis($propertyIsEnumerable);
	var push = uncurryThis([].push);

	// in some IE versions, `propertyIsEnumerable` returns incorrect result on integer keys
	// of `null` prototype objects
	var IE_BUG = DESCRIPTORS && fails(function () {
	  // eslint-disable-next-line es/no-object-create -- safe
	  var O = Object.create(null);
	  O[2] = 2;
	  return !propertyIsEnumerable(O, 2);
	});

	// `Object.{ entries, values }` methods implementation
	var createMethod = function (TO_ENTRIES) {
	  return function (it) {
	    var O = toIndexedObject(it);
	    var keys = objectKeys(O);
	    var IE_WORKAROUND = IE_BUG && objectGetPrototypeOf(O) === null;
	    var length = keys.length;
	    var i = 0;
	    var result = [];
	    var key;
	    while (length > i) {
	      key = keys[i++];
	      if (!DESCRIPTORS || (IE_WORKAROUND ? key in O : propertyIsEnumerable(O, key))) {
	        push(result, TO_ENTRIES ? [key, O[key]] : O[key]);
	      }
	    }
	    return result;
	  };
	};

	objectToArray = {
	  // `Object.entries` method
	  // https://tc39.es/ecma262/#sec-object.entries
	  entries: createMethod(true),
	  // `Object.values` method
	  // https://tc39.es/ecma262/#sec-object.values
	  values: createMethod(false)
	};
	return objectToArray;
}

var hasRequiredEs_object_entries;

function requireEs_object_entries () {
	if (hasRequiredEs_object_entries) return es_object_entries;
	hasRequiredEs_object_entries = 1;
	var $ = require_export();
	var $entries = requireObjectToArray().entries;

	// `Object.entries` method
	// https://tc39.es/ecma262/#sec-object.entries
	$({ target: 'Object', stat: true }, {
	  entries: function entries(O) {
	    return $entries(O);
	  }
	});
	return es_object_entries;
}

var es_object_freeze = {};

var hasRequiredEs_object_freeze;

function requireEs_object_freeze () {
	if (hasRequiredEs_object_freeze) return es_object_freeze;
	hasRequiredEs_object_freeze = 1;
	var $ = require_export();
	var FREEZING = requireFreezing();
	var fails = requireFails();
	var isObject = requireIsObject();
	var onFreeze = requireInternalMetadata().onFreeze;

	// eslint-disable-next-line es/no-object-freeze -- safe
	var $freeze = Object.freeze;
	var FAILS_ON_PRIMITIVES = fails(function () { $freeze(1); });

	// `Object.freeze` method
	// https://tc39.es/ecma262/#sec-object.freeze
	$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING }, {
	  freeze: function freeze(it) {
	    return $freeze && isObject(it) ? $freeze(onFreeze(it)) : it;
	  }
	});
	return es_object_freeze;
}

var es_object_fromEntries = {};

var hasRequiredEs_object_fromEntries;

function requireEs_object_fromEntries () {
	if (hasRequiredEs_object_fromEntries) return es_object_fromEntries;
	hasRequiredEs_object_fromEntries = 1;
	var $ = require_export();
	var iterate = requireIterate();
	var createProperty = requireCreateProperty();

	// `Object.fromEntries` method
	// https://github.com/tc39/proposal-object-from-entries
	$({ target: 'Object', stat: true }, {
	  fromEntries: function fromEntries(iterable) {
	    var obj = {};
	    iterate(iterable, function (k, v) {
	      createProperty(obj, k, v);
	    }, { AS_ENTRIES: true });
	    return obj;
	  }
	});
	return es_object_fromEntries;
}

var es_object_getOwnPropertyDescriptor = {};

var hasRequiredEs_object_getOwnPropertyDescriptor;

function requireEs_object_getOwnPropertyDescriptor () {
	if (hasRequiredEs_object_getOwnPropertyDescriptor) return es_object_getOwnPropertyDescriptor;
	hasRequiredEs_object_getOwnPropertyDescriptor = 1;
	var $ = require_export();
	var fails = requireFails();
	var toIndexedObject = requireToIndexedObject();
	var nativeGetOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
	var DESCRIPTORS = requireDescriptors();

	var FORCED = !DESCRIPTORS || fails(function () { nativeGetOwnPropertyDescriptor(1); });

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	$({ target: 'Object', stat: true, forced: FORCED, sham: !DESCRIPTORS }, {
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
	    return nativeGetOwnPropertyDescriptor(toIndexedObject(it), key);
	  }
	});
	return es_object_getOwnPropertyDescriptor;
}

var es_object_getOwnPropertyDescriptors = {};

var hasRequiredEs_object_getOwnPropertyDescriptors;

function requireEs_object_getOwnPropertyDescriptors () {
	if (hasRequiredEs_object_getOwnPropertyDescriptors) return es_object_getOwnPropertyDescriptors;
	hasRequiredEs_object_getOwnPropertyDescriptors = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var ownKeys = requireOwnKeys();
	var toIndexedObject = requireToIndexedObject();
	var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
	var createProperty = requireCreateProperty();

	// `Object.getOwnPropertyDescriptors` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
	$({ target: 'Object', stat: true, sham: !DESCRIPTORS }, {
	  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
	    var O = toIndexedObject(object);
	    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
	    var keys = ownKeys(O);
	    var result = {};
	    var index = 0;
	    var key, descriptor;
	    while (keys.length > index) {
	      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
	      if (descriptor !== undefined) createProperty(result, key, descriptor);
	    }
	    return result;
	  }
	});
	return es_object_getOwnPropertyDescriptors;
}

var es_object_getOwnPropertyNames = {};

var hasRequiredEs_object_getOwnPropertyNames;

function requireEs_object_getOwnPropertyNames () {
	if (hasRequiredEs_object_getOwnPropertyNames) return es_object_getOwnPropertyNames;
	hasRequiredEs_object_getOwnPropertyNames = 1;
	var $ = require_export();
	var fails = requireFails();
	var getOwnPropertyNames = requireObjectGetOwnPropertyNamesExternal().f;

	// eslint-disable-next-line es/no-object-getownpropertynames -- required for testing
	var FAILS_ON_PRIMITIVES = fails(function () { return !Object.getOwnPropertyNames(1); });

	// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
	  getOwnPropertyNames: getOwnPropertyNames
	});
	return es_object_getOwnPropertyNames;
}

var es_object_getPrototypeOf = {};

var hasRequiredEs_object_getPrototypeOf;

function requireEs_object_getPrototypeOf () {
	if (hasRequiredEs_object_getPrototypeOf) return es_object_getPrototypeOf;
	hasRequiredEs_object_getPrototypeOf = 1;
	var $ = require_export();
	var fails = requireFails();
	var toObject = requireToObject();
	var nativeGetPrototypeOf = requireObjectGetPrototypeOf();
	var CORRECT_PROTOTYPE_GETTER = requireCorrectPrototypeGetter();

	var FAILS_ON_PRIMITIVES = fails(function () { nativeGetPrototypeOf(1); });

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !CORRECT_PROTOTYPE_GETTER }, {
	  getPrototypeOf: function getPrototypeOf(it) {
	    return nativeGetPrototypeOf(toObject(it));
	  }
	});
	return es_object_getPrototypeOf;
}

var es_object_groupBy = {};

var hasRequiredEs_object_groupBy;

function requireEs_object_groupBy () {
	if (hasRequiredEs_object_groupBy) return es_object_groupBy;
	hasRequiredEs_object_groupBy = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var aCallable = requireACallable();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toPropertyKey = requireToPropertyKey();
	var iterate = requireIterate();
	var fails = requireFails();

	// eslint-disable-next-line es/no-object-groupby -- testing
	var nativeGroupBy = Object.groupBy;
	var create = getBuiltIn('Object', 'create');
	var push = uncurryThis([].push);

	var DOES_NOT_WORK_WITH_PRIMITIVES = !nativeGroupBy || fails(function () {
	  return nativeGroupBy('ab', function (it) {
	    return it;
	  }).a.length !== 1;
	});

	// `Object.groupBy` method
	// https://github.com/tc39/proposal-array-grouping
	$({ target: 'Object', stat: true, forced: DOES_NOT_WORK_WITH_PRIMITIVES }, {
	  groupBy: function groupBy(items, callbackfn) {
	    requireObjectCoercible(items);
	    aCallable(callbackfn);
	    var obj = create(null);
	    var k = 0;
	    iterate(items, function (value) {
	      var key = toPropertyKey(callbackfn(value, k++));
	      // in some IE versions, `hasOwnProperty` returns incorrect result on integer keys
	      // but since it's a `null` prototype object, we can safely use `in`
	      if (key in obj) push(obj[key], value);
	      else obj[key] = [value];
	    });
	    return obj;
	  }
	});
	return es_object_groupBy;
}

var es_object_hasOwn = {};

var hasRequiredEs_object_hasOwn;

function requireEs_object_hasOwn () {
	if (hasRequiredEs_object_hasOwn) return es_object_hasOwn;
	hasRequiredEs_object_hasOwn = 1;
	var $ = require_export();
	var hasOwn = requireHasOwnProperty();

	// `Object.hasOwn` method
	// https://tc39.es/ecma262/#sec-object.hasown
	$({ target: 'Object', stat: true }, {
	  hasOwn: hasOwn
	});
	return es_object_hasOwn;
}

var es_object_is = {};

var sameValue;
var hasRequiredSameValue;

function requireSameValue () {
	if (hasRequiredSameValue) return sameValue;
	hasRequiredSameValue = 1;
	// `SameValue` abstract operation
	// https://tc39.es/ecma262/#sec-samevalue
	// eslint-disable-next-line es/no-object-is -- safe
	sameValue = Object.is || function is(x, y) {
	  // eslint-disable-next-line no-self-compare -- NaN check
	  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
	};
	return sameValue;
}

var hasRequiredEs_object_is;

function requireEs_object_is () {
	if (hasRequiredEs_object_is) return es_object_is;
	hasRequiredEs_object_is = 1;
	var $ = require_export();
	var is = requireSameValue();

	// `Object.is` method
	// https://tc39.es/ecma262/#sec-object.is
	$({ target: 'Object', stat: true }, {
	  is: is
	});
	return es_object_is;
}

var es_object_isExtensible = {};

var hasRequiredEs_object_isExtensible;

function requireEs_object_isExtensible () {
	if (hasRequiredEs_object_isExtensible) return es_object_isExtensible;
	hasRequiredEs_object_isExtensible = 1;
	var $ = require_export();
	var $isExtensible = requireObjectIsExtensible();

	// `Object.isExtensible` method
	// https://tc39.es/ecma262/#sec-object.isextensible
	// eslint-disable-next-line es/no-object-isextensible -- safe
	$({ target: 'Object', stat: true, forced: Object.isExtensible !== $isExtensible }, {
	  isExtensible: $isExtensible
	});
	return es_object_isExtensible;
}

var es_object_isFrozen = {};

var hasRequiredEs_object_isFrozen;

function requireEs_object_isFrozen () {
	if (hasRequiredEs_object_isFrozen) return es_object_isFrozen;
	hasRequiredEs_object_isFrozen = 1;
	var $ = require_export();
	var fails = requireFails();
	var isObject = requireIsObject();
	var classof = requireClassofRaw();
	var ARRAY_BUFFER_NON_EXTENSIBLE = requireArrayBufferNonExtensible();

	// eslint-disable-next-line es/no-object-isfrozen -- safe
	var $isFrozen = Object.isFrozen;

	var FORCED = ARRAY_BUFFER_NON_EXTENSIBLE || fails(function () { });

	// `Object.isFrozen` method
	// https://tc39.es/ecma262/#sec-object.isfrozen
	$({ target: 'Object', stat: true, forced: FORCED }, {
	  isFrozen: function isFrozen(it) {
	    if (!isObject(it)) return true;
	    if (ARRAY_BUFFER_NON_EXTENSIBLE && classof(it) === 'ArrayBuffer') return true;
	    return $isFrozen ? $isFrozen(it) : false;
	  }
	});
	return es_object_isFrozen;
}

var es_object_isSealed = {};

var hasRequiredEs_object_isSealed;

function requireEs_object_isSealed () {
	if (hasRequiredEs_object_isSealed) return es_object_isSealed;
	hasRequiredEs_object_isSealed = 1;
	var $ = require_export();
	var fails = requireFails();
	var isObject = requireIsObject();
	var classof = requireClassofRaw();
	var ARRAY_BUFFER_NON_EXTENSIBLE = requireArrayBufferNonExtensible();

	// eslint-disable-next-line es/no-object-issealed -- safe
	var $isSealed = Object.isSealed;

	var FORCED = ARRAY_BUFFER_NON_EXTENSIBLE || fails(function () { });

	// `Object.isSealed` method
	// https://tc39.es/ecma262/#sec-object.issealed
	$({ target: 'Object', stat: true, forced: FORCED }, {
	  isSealed: function isSealed(it) {
	    if (!isObject(it)) return true;
	    if (ARRAY_BUFFER_NON_EXTENSIBLE && classof(it) === 'ArrayBuffer') return true;
	    return $isSealed ? $isSealed(it) : false;
	  }
	});
	return es_object_isSealed;
}

var es_object_keys = {};

var hasRequiredEs_object_keys;

function requireEs_object_keys () {
	if (hasRequiredEs_object_keys) return es_object_keys;
	hasRequiredEs_object_keys = 1;
	var $ = require_export();
	var toObject = requireToObject();
	var nativeKeys = requireObjectKeys();
	var fails = requireFails();

	var FAILS_ON_PRIMITIVES = fails(function () { nativeKeys(1); });

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
	  keys: function keys(it) {
	    return nativeKeys(toObject(it));
	  }
	});
	return es_object_keys;
}

var es_object_lookupGetter = {};

var hasRequiredEs_object_lookupGetter;

function requireEs_object_lookupGetter () {
	if (hasRequiredEs_object_lookupGetter) return es_object_lookupGetter;
	hasRequiredEs_object_lookupGetter = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var FORCED = requireObjectPrototypeAccessorsForced();
	var toObject = requireToObject();
	var toPropertyKey = requireToPropertyKey();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;

	// `Object.prototype.__lookupGetter__` method
	// https://tc39.es/ecma262/#sec-object.prototype.__lookupGetter__
	if (DESCRIPTORS) {
	  $({ target: 'Object', proto: true, forced: FORCED }, {
	    __lookupGetter__: function __lookupGetter__(P) {
	      var O = toObject(this);
	      var key = toPropertyKey(P);
	      var desc;
	      do {
	        if (desc = getOwnPropertyDescriptor(O, key)) return desc.get;
	      } while (O = getPrototypeOf(O));
	    }
	  });
	}
	return es_object_lookupGetter;
}

var es_object_lookupSetter = {};

var hasRequiredEs_object_lookupSetter;

function requireEs_object_lookupSetter () {
	if (hasRequiredEs_object_lookupSetter) return es_object_lookupSetter;
	hasRequiredEs_object_lookupSetter = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var FORCED = requireObjectPrototypeAccessorsForced();
	var toObject = requireToObject();
	var toPropertyKey = requireToPropertyKey();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;

	// `Object.prototype.__lookupSetter__` method
	// https://tc39.es/ecma262/#sec-object.prototype.__lookupSetter__
	if (DESCRIPTORS) {
	  $({ target: 'Object', proto: true, forced: FORCED }, {
	    __lookupSetter__: function __lookupSetter__(P) {
	      var O = toObject(this);
	      var key = toPropertyKey(P);
	      var desc;
	      do {
	        if (desc = getOwnPropertyDescriptor(O, key)) return desc.set;
	      } while (O = getPrototypeOf(O));
	    }
	  });
	}
	return es_object_lookupSetter;
}

var es_object_preventExtensions = {};

var hasRequiredEs_object_preventExtensions;

function requireEs_object_preventExtensions () {
	if (hasRequiredEs_object_preventExtensions) return es_object_preventExtensions;
	hasRequiredEs_object_preventExtensions = 1;
	var $ = require_export();
	var isObject = requireIsObject();
	var onFreeze = requireInternalMetadata().onFreeze;
	var FREEZING = requireFreezing();
	var fails = requireFails();

	// eslint-disable-next-line es/no-object-preventextensions -- safe
	var $preventExtensions = Object.preventExtensions;
	var FAILS_ON_PRIMITIVES = fails(function () { $preventExtensions(1); });

	// `Object.preventExtensions` method
	// https://tc39.es/ecma262/#sec-object.preventextensions
	$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING }, {
	  preventExtensions: function preventExtensions(it) {
	    return $preventExtensions && isObject(it) ? $preventExtensions(onFreeze(it)) : it;
	  }
	});
	return es_object_preventExtensions;
}

var es_object_proto = {};

var hasRequiredEs_object_proto;

function requireEs_object_proto () {
	if (hasRequiredEs_object_proto) return es_object_proto;
	hasRequiredEs_object_proto = 1;
	var DESCRIPTORS = requireDescriptors();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var isObject = requireIsObject();
	var isPossiblePrototype = requireIsPossiblePrototype();
	var toObject = requireToObject();
	var requireObjectCoercible = requireRequireObjectCoercible();

	// eslint-disable-next-line es/no-object-getprototypeof -- safe
	var getPrototypeOf = Object.getPrototypeOf;
	// eslint-disable-next-line es/no-object-setprototypeof -- safe
	var setPrototypeOf = Object.setPrototypeOf;
	var ObjectPrototype = Object.prototype;
	var PROTO = '__proto__';

	// `Object.prototype.__proto__` accessor
	// https://tc39.es/ecma262/#sec-object.prototype.__proto__
	if (DESCRIPTORS && getPrototypeOf && setPrototypeOf && !(PROTO in ObjectPrototype)) try {
	  defineBuiltInAccessor(ObjectPrototype, PROTO, {
	    configurable: true,
	    get: function __proto__() {
	      return getPrototypeOf(toObject(this));
	    },
	    set: function __proto__(proto) {
	      var O = requireObjectCoercible(this);
	      if (isPossiblePrototype(proto) && isObject(O)) {
	        setPrototypeOf(O, proto);
	      }
	    }
	  });
	} catch (error) { /* empty */ }
	return es_object_proto;
}

var es_object_seal = {};

var hasRequiredEs_object_seal;

function requireEs_object_seal () {
	if (hasRequiredEs_object_seal) return es_object_seal;
	hasRequiredEs_object_seal = 1;
	var $ = require_export();
	var isObject = requireIsObject();
	var onFreeze = requireInternalMetadata().onFreeze;
	var FREEZING = requireFreezing();
	var fails = requireFails();

	// eslint-disable-next-line es/no-object-seal -- safe
	var $seal = Object.seal;
	var FAILS_ON_PRIMITIVES = fails(function () { $seal(1); });

	// `Object.seal` method
	// https://tc39.es/ecma262/#sec-object.seal
	$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING }, {
	  seal: function seal(it) {
	    return $seal && isObject(it) ? $seal(onFreeze(it)) : it;
	  }
	});
	return es_object_seal;
}

var es_object_setPrototypeOf = {};

var hasRequiredEs_object_setPrototypeOf;

function requireEs_object_setPrototypeOf () {
	if (hasRequiredEs_object_setPrototypeOf) return es_object_setPrototypeOf;
	hasRequiredEs_object_setPrototypeOf = 1;
	var $ = require_export();
	var setPrototypeOf = requireObjectSetPrototypeOf();

	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	$({ target: 'Object', stat: true }, {
	  setPrototypeOf: setPrototypeOf
	});
	return es_object_setPrototypeOf;
}

var es_object_toString = {};

var objectToString;
var hasRequiredObjectToString;

function requireObjectToString () {
	if (hasRequiredObjectToString) return objectToString;
	hasRequiredObjectToString = 1;
	var TO_STRING_TAG_SUPPORT = requireToStringTagSupport();
	var classof = requireClassof();

	// `Object.prototype.toString` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	objectToString = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};
	return objectToString;
}

var hasRequiredEs_object_toString;

function requireEs_object_toString () {
	if (hasRequiredEs_object_toString) return es_object_toString;
	hasRequiredEs_object_toString = 1;
	var TO_STRING_TAG_SUPPORT = requireToStringTagSupport();
	var defineBuiltIn = requireDefineBuiltIn();
	var toString = requireObjectToString();

	// `Object.prototype.toString` method
	// https://tc39.es/ecma262/#sec-object.prototype.tostring
	if (!TO_STRING_TAG_SUPPORT) {
	  defineBuiltIn(Object.prototype, 'toString', toString, { unsafe: true });
	}
	return es_object_toString;
}

var es_object_values = {};

var hasRequiredEs_object_values;

function requireEs_object_values () {
	if (hasRequiredEs_object_values) return es_object_values;
	hasRequiredEs_object_values = 1;
	var $ = require_export();
	var $values = requireObjectToArray().values;

	// `Object.values` method
	// https://tc39.es/ecma262/#sec-object.values
	$({ target: 'Object', stat: true }, {
	  values: function values(O) {
	    return $values(O);
	  }
	});
	return es_object_values;
}

var es_parseFloat = {};

var hasRequiredEs_parseFloat;

function requireEs_parseFloat () {
	if (hasRequiredEs_parseFloat) return es_parseFloat;
	hasRequiredEs_parseFloat = 1;
	var $ = require_export();
	var $parseFloat = requireNumberParseFloat();

	// `parseFloat` method
	// https://tc39.es/ecma262/#sec-parsefloat-string
	$({ global: true, forced: parseFloat !== $parseFloat }, {
	  parseFloat: $parseFloat
	});
	return es_parseFloat;
}

var es_parseInt = {};

var hasRequiredEs_parseInt;

function requireEs_parseInt () {
	if (hasRequiredEs_parseInt) return es_parseInt;
	hasRequiredEs_parseInt = 1;
	var $ = require_export();
	var $parseInt = requireNumberParseInt();

	// `parseInt` method
	// https://tc39.es/ecma262/#sec-parseint-string-radix
	$({ global: true, forced: parseInt !== $parseInt }, {
	  parseInt: $parseInt
	});
	return es_parseInt;
}

var es_promise = {};

var es_promise_constructor = {};

var validateArgumentsLength;
var hasRequiredValidateArgumentsLength;

function requireValidateArgumentsLength () {
	if (hasRequiredValidateArgumentsLength) return validateArgumentsLength;
	hasRequiredValidateArgumentsLength = 1;
	var $TypeError = TypeError;

	validateArgumentsLength = function (passed, required) {
	  if (passed < required) throw new $TypeError('Not enough arguments');
	  return passed;
	};
	return validateArgumentsLength;
}

var environmentIsIos;
var hasRequiredEnvironmentIsIos;

function requireEnvironmentIsIos () {
	if (hasRequiredEnvironmentIsIos) return environmentIsIos;
	hasRequiredEnvironmentIsIos = 1;
	var userAgent = requireEnvironmentUserAgent();

	// eslint-disable-next-line redos/no-vulnerable -- safe
	environmentIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(userAgent);
	return environmentIsIos;
}

var task;
var hasRequiredTask;

function requireTask () {
	if (hasRequiredTask) return task;
	hasRequiredTask = 1;
	var globalThis = requireGlobalThis();
	var apply = requireFunctionApply();
	var bind = requireFunctionBindContext();
	var isCallable = requireIsCallable();
	var hasOwn = requireHasOwnProperty();
	var fails = requireFails();
	var html = requireHtml();
	var arraySlice = requireArraySlice();
	var createElement = requireDocumentCreateElement();
	var validateArgumentsLength = requireValidateArgumentsLength();
	var IS_IOS = requireEnvironmentIsIos();
	var IS_NODE = requireEnvironmentIsNode();

	var set = globalThis.setImmediate;
	var clear = globalThis.clearImmediate;
	var process = globalThis.process;
	var Dispatch = globalThis.Dispatch;
	var Function = globalThis.Function;
	var MessageChannel = globalThis.MessageChannel;
	var String = globalThis.String;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var $location, defer, channel, port;

	fails(function () {
	  // Deno throws a ReferenceError on `location` access without `--location` flag
	  $location = globalThis.location;
	});

	var run = function (id) {
	  if (hasOwn(queue, id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};

	var runner = function (id) {
	  return function () {
	    run(id);
	  };
	};

	var eventListener = function (event) {
	  run(event.data);
	};

	var globalPostMessageDefer = function (id) {
	  // old engines have not location.origin
	  globalThis.postMessage(String(id), $location.protocol + '//' + $location.host);
	};

	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!set || !clear) {
	  set = function setImmediate(handler) {
	    validateArgumentsLength(arguments.length, 1);
	    var fn = isCallable(handler) ? handler : Function(handler);
	    var args = arraySlice(arguments, 1);
	    queue[++counter] = function () {
	      apply(fn, undefined, args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clear = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (IS_NODE) {
	    defer = function (id) {
	      process.nextTick(runner(id));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(runner(id));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  // except iOS - https://github.com/zloirock/core-js/issues/624
	  } else if (MessageChannel && !IS_IOS) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = eventListener;
	    defer = bind(port.postMessage, port);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (
	    globalThis.addEventListener &&
	    isCallable(globalThis.postMessage) &&
	    !globalThis.importScripts &&
	    $location && $location.protocol !== 'file:' &&
	    !fails(globalPostMessageDefer)
	  ) {
	    defer = globalPostMessageDefer;
	    globalThis.addEventListener('message', eventListener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in createElement('script')) {
	    defer = function (id) {
	      html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(runner(id), 0);
	    };
	  }
	}

	task = {
	  set: set,
	  clear: clear
	};
	return task;
}

var safeGetBuiltIn;
var hasRequiredSafeGetBuiltIn;

function requireSafeGetBuiltIn () {
	if (hasRequiredSafeGetBuiltIn) return safeGetBuiltIn;
	hasRequiredSafeGetBuiltIn = 1;
	var globalThis = requireGlobalThis();
	var DESCRIPTORS = requireDescriptors();

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Avoid NodeJS experimental warning
	safeGetBuiltIn = function (name) {
	  if (!DESCRIPTORS) return globalThis[name];
	  var descriptor = getOwnPropertyDescriptor(globalThis, name);
	  return descriptor && descriptor.value;
	};
	return safeGetBuiltIn;
}

var queue;
var hasRequiredQueue;

function requireQueue () {
	if (hasRequiredQueue) return queue;
	hasRequiredQueue = 1;
	var Queue = function () {
	  this.head = null;
	  this.tail = null;
	};

	Queue.prototype = {
	  add: function (item) {
	    var entry = { item: item, next: null };
	    var tail = this.tail;
	    if (tail) tail.next = entry;
	    else this.head = entry;
	    this.tail = entry;
	  },
	  get: function () {
	    var entry = this.head;
	    if (entry) {
	      var next = this.head = entry.next;
	      if (next === null) this.tail = null;
	      return entry.item;
	    }
	  }
	};

	queue = Queue;
	return queue;
}

var environmentIsIosPebble;
var hasRequiredEnvironmentIsIosPebble;

function requireEnvironmentIsIosPebble () {
	if (hasRequiredEnvironmentIsIosPebble) return environmentIsIosPebble;
	hasRequiredEnvironmentIsIosPebble = 1;
	var userAgent = requireEnvironmentUserAgent();

	environmentIsIosPebble = /ipad|iphone|ipod/i.test(userAgent) && typeof Pebble != 'undefined';
	return environmentIsIosPebble;
}

var environmentIsWebosWebkit;
var hasRequiredEnvironmentIsWebosWebkit;

function requireEnvironmentIsWebosWebkit () {
	if (hasRequiredEnvironmentIsWebosWebkit) return environmentIsWebosWebkit;
	hasRequiredEnvironmentIsWebosWebkit = 1;
	var userAgent = requireEnvironmentUserAgent();

	environmentIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent);
	return environmentIsWebosWebkit;
}

var microtask_1;
var hasRequiredMicrotask;

function requireMicrotask () {
	if (hasRequiredMicrotask) return microtask_1;
	hasRequiredMicrotask = 1;
	var globalThis = requireGlobalThis();
	var safeGetBuiltIn = requireSafeGetBuiltIn();
	var bind = requireFunctionBindContext();
	var macrotask = requireTask().set;
	var Queue = requireQueue();
	var IS_IOS = requireEnvironmentIsIos();
	var IS_IOS_PEBBLE = requireEnvironmentIsIosPebble();
	var IS_WEBOS_WEBKIT = requireEnvironmentIsWebosWebkit();
	var IS_NODE = requireEnvironmentIsNode();

	var MutationObserver = globalThis.MutationObserver || globalThis.WebKitMutationObserver;
	var document = globalThis.document;
	var process = globalThis.process;
	var Promise = globalThis.Promise;
	var microtask = safeGetBuiltIn('queueMicrotask');
	var notify, toggle, node, promise, then;

	// modern engines have queueMicrotask method
	if (!microtask) {
	  var queue = new Queue();

	  var flush = function () {
	    var parent, fn;
	    if (IS_NODE && (parent = process.domain)) parent.exit();
	    while (fn = queue.get()) try {
	      fn();
	    } catch (error) {
	      if (queue.head) notify();
	      throw error;
	    }
	    if (parent) parent.enter();
	  };

	  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
	  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
	  if (!IS_IOS && !IS_NODE && !IS_WEBOS_WEBKIT && MutationObserver && document) {
	    toggle = true;
	    node = document.createTextNode('');
	    new MutationObserver(flush).observe(node, { characterData: true });
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (!IS_IOS_PEBBLE && Promise && Promise.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    promise = Promise.resolve(undefined);
	    // workaround of WebKit ~ iOS Safari 10.1 bug
	    promise.constructor = Promise;
	    then = bind(promise.then, promise);
	    notify = function () {
	      then(flush);
	    };
	  // Node.js without promises
	  } else if (IS_NODE) {
	    notify = function () {
	      process.nextTick(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessage
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    // `webpack` dev server bug on IE global methods - use bind(fn, global)
	    macrotask = bind(macrotask, globalThis);
	    notify = function () {
	      macrotask(flush);
	    };
	  }

	  microtask = function (fn) {
	    if (!queue.head) notify();
	    queue.add(fn);
	  };
	}

	microtask_1 = microtask;
	return microtask_1;
}

var hostReportErrors;
var hasRequiredHostReportErrors;

function requireHostReportErrors () {
	if (hasRequiredHostReportErrors) return hostReportErrors;
	hasRequiredHostReportErrors = 1;
	hostReportErrors = function (a, b) {
	  try {
	    // eslint-disable-next-line no-console -- safe
	    arguments.length === 1 ? console.error(a) : console.error(a, b);
	  } catch (error) { /* empty */ }
	};
	return hostReportErrors;
}

var perform;
var hasRequiredPerform;

function requirePerform () {
	if (hasRequiredPerform) return perform;
	hasRequiredPerform = 1;
	perform = function (exec) {
	  try {
	    return { error: false, value: exec() };
	  } catch (error) {
	    return { error: true, value: error };
	  }
	};
	return perform;
}

var promiseNativeConstructor;
var hasRequiredPromiseNativeConstructor;

function requirePromiseNativeConstructor () {
	if (hasRequiredPromiseNativeConstructor) return promiseNativeConstructor;
	hasRequiredPromiseNativeConstructor = 1;
	var globalThis = requireGlobalThis();

	promiseNativeConstructor = globalThis.Promise;
	return promiseNativeConstructor;
}

var promiseConstructorDetection;
var hasRequiredPromiseConstructorDetection;

function requirePromiseConstructorDetection () {
	if (hasRequiredPromiseConstructorDetection) return promiseConstructorDetection;
	hasRequiredPromiseConstructorDetection = 1;
	var globalThis = requireGlobalThis();
	var NativePromiseConstructor = requirePromiseNativeConstructor();
	var isCallable = requireIsCallable();
	var isForced = requireIsForced();
	var inspectSource = requireInspectSource();
	var wellKnownSymbol = requireWellKnownSymbol();
	var ENVIRONMENT = requireEnvironment();
	var IS_PURE = requireIsPure();
	var V8_VERSION = requireEnvironmentV8Version();

	var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
	var SPECIES = wellKnownSymbol('species');
	var SUBCLASSING = false;
	var NATIVE_PROMISE_REJECTION_EVENT = isCallable(globalThis.PromiseRejectionEvent);

	var FORCED_PROMISE_CONSTRUCTOR = isForced('Promise', function () {
	  var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(NativePromiseConstructor);
	  var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(NativePromiseConstructor);
	  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	  // We can't detect it synchronously, so just check versions
	  if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
	  // We need Promise#{ catch, finally } in the pure version for preventing prototype pollution
	  if (IS_PURE && !(NativePromisePrototype['catch'] && NativePromisePrototype['finally'])) return true;
	  // We can't use @@species feature detection in V8 since it causes
	  // deoptimization and performance degradation
	  // https://github.com/zloirock/core-js/issues/679
	  if (!V8_VERSION || V8_VERSION < 51 || !/native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) {
	    // Detect correctness of subclassing with @@species support
	    var promise = new NativePromiseConstructor(function (resolve) { resolve(1); });
	    var FakePromise = function (exec) {
	      exec(function () { /* empty */ }, function () { /* empty */ });
	    };
	    var constructor = promise.constructor = {};
	    constructor[SPECIES] = FakePromise;
	    SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
	    if (!SUBCLASSING) return true;
	  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	  } return !GLOBAL_CORE_JS_PROMISE && (ENVIRONMENT === 'BROWSER' || ENVIRONMENT === 'DENO') && !NATIVE_PROMISE_REJECTION_EVENT;
	});

	promiseConstructorDetection = {
	  CONSTRUCTOR: FORCED_PROMISE_CONSTRUCTOR,
	  REJECTION_EVENT: NATIVE_PROMISE_REJECTION_EVENT,
	  SUBCLASSING: SUBCLASSING
	};
	return promiseConstructorDetection;
}

var newPromiseCapability = {};

var hasRequiredNewPromiseCapability;

function requireNewPromiseCapability () {
	if (hasRequiredNewPromiseCapability) return newPromiseCapability;
	hasRequiredNewPromiseCapability = 1;
	var aCallable = requireACallable();

	var $TypeError = TypeError;

	var PromiseCapability = function (C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw new $TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aCallable(resolve);
	  this.reject = aCallable(reject);
	};

	// `NewPromiseCapability` abstract operation
	// https://tc39.es/ecma262/#sec-newpromisecapability
	newPromiseCapability.f = function (C) {
	  return new PromiseCapability(C);
	};
	return newPromiseCapability;
}

var hasRequiredEs_promise_constructor;

function requireEs_promise_constructor () {
	if (hasRequiredEs_promise_constructor) return es_promise_constructor;
	hasRequiredEs_promise_constructor = 1;
	var $ = require_export();
	var IS_PURE = requireIsPure();
	var IS_NODE = requireEnvironmentIsNode();
	var globalThis = requireGlobalThis();
	var call = requireFunctionCall();
	var defineBuiltIn = requireDefineBuiltIn();
	var setPrototypeOf = requireObjectSetPrototypeOf();
	var setToStringTag = requireSetToStringTag();
	var setSpecies = requireSetSpecies();
	var aCallable = requireACallable();
	var isCallable = requireIsCallable();
	var isObject = requireIsObject();
	var anInstance = requireAnInstance();
	var speciesConstructor = requireSpeciesConstructor();
	var task = requireTask().set;
	var microtask = requireMicrotask();
	var hostReportErrors = requireHostReportErrors();
	var perform = requirePerform();
	var Queue = requireQueue();
	var InternalStateModule = requireInternalState();
	var NativePromiseConstructor = requirePromiseNativeConstructor();
	var PromiseConstructorDetection = requirePromiseConstructorDetection();
	var newPromiseCapabilityModule = requireNewPromiseCapability();

	var PROMISE = 'Promise';
	var FORCED_PROMISE_CONSTRUCTOR = PromiseConstructorDetection.CONSTRUCTOR;
	var NATIVE_PROMISE_REJECTION_EVENT = PromiseConstructorDetection.REJECTION_EVENT;
	var NATIVE_PROMISE_SUBCLASSING = PromiseConstructorDetection.SUBCLASSING;
	var getInternalPromiseState = InternalStateModule.getterFor(PROMISE);
	var setInternalState = InternalStateModule.set;
	var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
	var PromiseConstructor = NativePromiseConstructor;
	var PromisePrototype = NativePromisePrototype;
	var TypeError = globalThis.TypeError;
	var document = globalThis.document;
	var process = globalThis.process;
	var newPromiseCapability = newPromiseCapabilityModule.f;
	var newGenericPromiseCapability = newPromiseCapability;

	var DISPATCH_EVENT = !!(document && document.createEvent && globalThis.dispatchEvent);
	var UNHANDLED_REJECTION = 'unhandledrejection';
	var REJECTION_HANDLED = 'rejectionhandled';
	var PENDING = 0;
	var FULFILLED = 1;
	var REJECTED = 2;
	var HANDLED = 1;
	var UNHANDLED = 2;

	var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

	// helpers
	var isThenable = function (it) {
	  var then;
	  return isObject(it) && isCallable(then = it.then) ? then : false;
	};

	var callReaction = function (reaction, state) {
	  var value = state.value;
	  var ok = state.state === FULFILLED;
	  var handler = ok ? reaction.ok : reaction.fail;
	  var resolve = reaction.resolve;
	  var reject = reaction.reject;
	  var domain = reaction.domain;
	  var result, then, exited;
	  try {
	    if (handler) {
	      if (!ok) {
	        if (state.rejection === UNHANDLED) onHandleUnhandled(state);
	        state.rejection = HANDLED;
	      }
	      if (handler === true) result = value;
	      else {
	        if (domain) domain.enter();
	        result = handler(value); // can throw
	        if (domain) {
	          domain.exit();
	          exited = true;
	        }
	      }
	      if (result === reaction.promise) {
	        reject(new TypeError('Promise-chain cycle'));
	      } else if (then = isThenable(result)) {
	        call(then, result, resolve, reject);
	      } else resolve(result);
	    } else reject(value);
	  } catch (error) {
	    if (domain && !exited) domain.exit();
	    reject(error);
	  }
	};

	var notify = function (state, isReject) {
	  if (state.notified) return;
	  state.notified = true;
	  microtask(function () {
	    var reactions = state.reactions;
	    var reaction;
	    while (reaction = reactions.get()) {
	      callReaction(reaction, state);
	    }
	    state.notified = false;
	    if (isReject && !state.rejection) onUnhandled(state);
	  });
	};

	var dispatchEvent = function (name, promise, reason) {
	  var event, handler;
	  if (DISPATCH_EVENT) {
	    event = document.createEvent('Event');
	    event.promise = promise;
	    event.reason = reason;
	    event.initEvent(name, false, true);
	    globalThis.dispatchEvent(event);
	  } else event = { promise: promise, reason: reason };
	  if (!NATIVE_PROMISE_REJECTION_EVENT && (handler = globalThis['on' + name])) handler(event);
	  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
	};

	var onUnhandled = function (state) {
	  call(task, globalThis, function () {
	    var promise = state.facade;
	    var value = state.value;
	    var IS_UNHANDLED = isUnhandled(state);
	    var result;
	    if (IS_UNHANDLED) {
	      result = perform(function () {
	        if (IS_NODE) {
	          process.emit('unhandledRejection', value, promise);
	        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
	      if (result.error) throw result.value;
	    }
	  });
	};

	var isUnhandled = function (state) {
	  return state.rejection !== HANDLED && !state.parent;
	};

	var onHandleUnhandled = function (state) {
	  call(task, globalThis, function () {
	    var promise = state.facade;
	    if (IS_NODE) {
	      process.emit('rejectionHandled', promise);
	    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
	  });
	};

	var bind = function (fn, state, unwrap) {
	  return function (value) {
	    fn(state, value, unwrap);
	  };
	};

	var internalReject = function (state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  state.value = value;
	  state.state = REJECTED;
	  notify(state, true);
	};

	var internalResolve = function (state, value, unwrap) {
	  if (state.done) return;
	  state.done = true;
	  if (unwrap) state = unwrap;
	  try {
	    if (state.facade === value) throw new TypeError("Promise can't be resolved itself");
	    var then = isThenable(value);
	    if (then) {
	      microtask(function () {
	        var wrapper = { done: false };
	        try {
	          call(then, value,
	            bind(internalResolve, wrapper, state),
	            bind(internalReject, wrapper, state)
	          );
	        } catch (error) {
	          internalReject(wrapper, error, state);
	        }
	      });
	    } else {
	      state.value = value;
	      state.state = FULFILLED;
	      notify(state, false);
	    }
	  } catch (error) {
	    internalReject({ done: false }, error, state);
	  }
	};

	// constructor polyfill
	if (FORCED_PROMISE_CONSTRUCTOR) {
	  // 25.4.3.1 Promise(executor)
	  PromiseConstructor = function Promise(executor) {
	    anInstance(this, PromisePrototype);
	    aCallable(executor);
	    call(Internal, this);
	    var state = getInternalPromiseState(this);
	    try {
	      executor(bind(internalResolve, state), bind(internalReject, state));
	    } catch (error) {
	      internalReject(state, error);
	    }
	  };

	  PromisePrototype = PromiseConstructor.prototype;

	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  Internal = function Promise(executor) {
	    setInternalState(this, {
	      type: PROMISE,
	      done: false,
	      notified: false,
	      parent: false,
	      reactions: new Queue(),
	      rejection: false,
	      state: PENDING,
	      value: null
	    });
	  };

	  // `Promise.prototype.then` method
	  // https://tc39.es/ecma262/#sec-promise.prototype.then
	  Internal.prototype = defineBuiltIn(PromisePrototype, 'then', function then(onFulfilled, onRejected) {
	    var state = getInternalPromiseState(this);
	    var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
	    state.parent = true;
	    reaction.ok = isCallable(onFulfilled) ? onFulfilled : true;
	    reaction.fail = isCallable(onRejected) && onRejected;
	    reaction.domain = IS_NODE ? process.domain : undefined;
	    if (state.state === PENDING) state.reactions.add(reaction);
	    else microtask(function () {
	      callReaction(reaction, state);
	    });
	    return reaction.promise;
	  });

	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    var state = getInternalPromiseState(promise);
	    this.promise = promise;
	    this.resolve = bind(internalResolve, state);
	    this.reject = bind(internalReject, state);
	  };

	  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
	    return C === PromiseConstructor || C === PromiseWrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };

	  if (!IS_PURE && isCallable(NativePromiseConstructor) && NativePromisePrototype !== Object.prototype) {
	    nativeThen = NativePromisePrototype.then;

	    if (!NATIVE_PROMISE_SUBCLASSING) {
	      // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
	      defineBuiltIn(NativePromisePrototype, 'then', function then(onFulfilled, onRejected) {
	        var that = this;
	        return new PromiseConstructor(function (resolve, reject) {
	          call(nativeThen, that, resolve, reject);
	        }).then(onFulfilled, onRejected);
	      // https://github.com/zloirock/core-js/issues/640
	      }, { unsafe: true });
	    }

	    // make `.constructor === Promise` work for native promise-based APIs
	    try {
	      delete NativePromisePrototype.constructor;
	    } catch (error) { /* empty */ }

	    // make `instanceof Promise` work for native promise-based APIs
	    if (setPrototypeOf) {
	      setPrototypeOf(NativePromisePrototype, PromisePrototype);
	    }
	  }
	}

	$({ global: true, constructor: true, wrap: true, forced: FORCED_PROMISE_CONSTRUCTOR }, {
	  Promise: PromiseConstructor
	});

	setToStringTag(PromiseConstructor, PROMISE, false, true);
	setSpecies(PROMISE);
	return es_promise_constructor;
}

var es_promise_all = {};

var promiseStaticsIncorrectIteration;
var hasRequiredPromiseStaticsIncorrectIteration;

function requirePromiseStaticsIncorrectIteration () {
	if (hasRequiredPromiseStaticsIncorrectIteration) return promiseStaticsIncorrectIteration;
	hasRequiredPromiseStaticsIncorrectIteration = 1;
	var NativePromiseConstructor = requirePromiseNativeConstructor();
	var checkCorrectnessOfIteration = requireCheckCorrectnessOfIteration();
	var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;

	promiseStaticsIncorrectIteration = FORCED_PROMISE_CONSTRUCTOR || !checkCorrectnessOfIteration(function (iterable) {
	  NativePromiseConstructor.all(iterable).then(undefined, function () { /* empty */ });
	});
	return promiseStaticsIncorrectIteration;
}

var hasRequiredEs_promise_all;

function requireEs_promise_all () {
	if (hasRequiredEs_promise_all) return es_promise_all;
	hasRequiredEs_promise_all = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var newPromiseCapabilityModule = requireNewPromiseCapability();
	var perform = requirePerform();
	var iterate = requireIterate();
	var PROMISE_STATICS_INCORRECT_ITERATION = requirePromiseStaticsIncorrectIteration();

	// `Promise.all` method
	// https://tc39.es/ecma262/#sec-promise.all
	$({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION }, {
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapabilityModule.f(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aCallable(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        remaining++;
	        call($promiseResolve, C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});
	return es_promise_all;
}

var es_promise_catch = {};

var hasRequiredEs_promise_catch;

function requireEs_promise_catch () {
	if (hasRequiredEs_promise_catch) return es_promise_catch;
	hasRequiredEs_promise_catch = 1;
	var $ = require_export();
	var IS_PURE = requireIsPure();
	var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;
	var NativePromiseConstructor = requirePromiseNativeConstructor();
	var getBuiltIn = requireGetBuiltIn();
	var isCallable = requireIsCallable();
	var defineBuiltIn = requireDefineBuiltIn();

	var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;

	// `Promise.prototype.catch` method
	// https://tc39.es/ecma262/#sec-promise.prototype.catch
	$({ target: 'Promise', proto: true, forced: FORCED_PROMISE_CONSTRUCTOR, real: true }, {
	  'catch': function (onRejected) {
	    return this.then(undefined, onRejected);
	  }
	});

	// makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
	if (!IS_PURE && isCallable(NativePromiseConstructor)) {
	  var method = getBuiltIn('Promise').prototype['catch'];
	  if (NativePromisePrototype['catch'] !== method) {
	    defineBuiltIn(NativePromisePrototype, 'catch', method, { unsafe: true });
	  }
	}
	return es_promise_catch;
}

var es_promise_race = {};

var hasRequiredEs_promise_race;

function requireEs_promise_race () {
	if (hasRequiredEs_promise_race) return es_promise_race;
	hasRequiredEs_promise_race = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var newPromiseCapabilityModule = requireNewPromiseCapability();
	var perform = requirePerform();
	var iterate = requireIterate();
	var PROMISE_STATICS_INCORRECT_ITERATION = requirePromiseStaticsIncorrectIteration();

	// `Promise.race` method
	// https://tc39.es/ecma262/#sec-promise.race
	$({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION }, {
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapabilityModule.f(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      var $promiseResolve = aCallable(C.resolve);
	      iterate(iterable, function (promise) {
	        call($promiseResolve, C, promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});
	return es_promise_race;
}

var es_promise_reject = {};

var hasRequiredEs_promise_reject;

function requireEs_promise_reject () {
	if (hasRequiredEs_promise_reject) return es_promise_reject;
	hasRequiredEs_promise_reject = 1;
	var $ = require_export();
	var newPromiseCapabilityModule = requireNewPromiseCapability();
	var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;

	// `Promise.reject` method
	// https://tc39.es/ecma262/#sec-promise.reject
	$({ target: 'Promise', stat: true, forced: FORCED_PROMISE_CONSTRUCTOR }, {
	  reject: function reject(r) {
	    var capability = newPromiseCapabilityModule.f(this);
	    var capabilityReject = capability.reject;
	    capabilityReject(r);
	    return capability.promise;
	  }
	});
	return es_promise_reject;
}

var es_promise_resolve = {};

var promiseResolve;
var hasRequiredPromiseResolve;

function requirePromiseResolve () {
	if (hasRequiredPromiseResolve) return promiseResolve;
	hasRequiredPromiseResolve = 1;
	var anObject = requireAnObject();
	var isObject = requireIsObject();
	var newPromiseCapability = requireNewPromiseCapability();

	promiseResolve = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};
	return promiseResolve;
}

var hasRequiredEs_promise_resolve;

function requireEs_promise_resolve () {
	if (hasRequiredEs_promise_resolve) return es_promise_resolve;
	hasRequiredEs_promise_resolve = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var IS_PURE = requireIsPure();
	var NativePromiseConstructor = requirePromiseNativeConstructor();
	var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;
	var promiseResolve = requirePromiseResolve();

	var PromiseConstructorWrapper = getBuiltIn('Promise');
	var CHECK_WRAPPER = IS_PURE && !FORCED_PROMISE_CONSTRUCTOR;

	// `Promise.resolve` method
	// https://tc39.es/ecma262/#sec-promise.resolve
	$({ target: 'Promise', stat: true, forced: IS_PURE || FORCED_PROMISE_CONSTRUCTOR }, {
	  resolve: function resolve(x) {
	    return promiseResolve(CHECK_WRAPPER && this === PromiseConstructorWrapper ? NativePromiseConstructor : this, x);
	  }
	});
	return es_promise_resolve;
}

var hasRequiredEs_promise;

function requireEs_promise () {
	if (hasRequiredEs_promise) return es_promise;
	hasRequiredEs_promise = 1;
	// TODO: Remove this module from `core-js@4` since it's split to modules listed below
	requireEs_promise_constructor();
	requireEs_promise_all();
	requireEs_promise_catch();
	requireEs_promise_race();
	requireEs_promise_reject();
	requireEs_promise_resolve();
	return es_promise;
}

var es_promise_allSettled = {};

var hasRequiredEs_promise_allSettled;

function requireEs_promise_allSettled () {
	if (hasRequiredEs_promise_allSettled) return es_promise_allSettled;
	hasRequiredEs_promise_allSettled = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var newPromiseCapabilityModule = requireNewPromiseCapability();
	var perform = requirePerform();
	var iterate = requireIterate();
	var PROMISE_STATICS_INCORRECT_ITERATION = requirePromiseStaticsIncorrectIteration();

	// `Promise.allSettled` method
	// https://tc39.es/ecma262/#sec-promise.allsettled
	$({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION }, {
	  allSettled: function allSettled(iterable) {
	    var C = this;
	    var capability = newPromiseCapabilityModule.f(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var promiseResolve = aCallable(C.resolve);
	      var values = [];
	      var counter = 0;
	      var remaining = 1;
	      iterate(iterable, function (promise) {
	        var index = counter++;
	        var alreadyCalled = false;
	        remaining++;
	        call(promiseResolve, C, promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = { status: 'fulfilled', value: value };
	          --remaining || resolve(values);
	        }, function (error) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[index] = { status: 'rejected', reason: error };
	          --remaining || resolve(values);
	        });
	      });
	      --remaining || resolve(values);
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});
	return es_promise_allSettled;
}

var es_promise_any = {};

var hasRequiredEs_promise_any;

function requireEs_promise_any () {
	if (hasRequiredEs_promise_any) return es_promise_any;
	hasRequiredEs_promise_any = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var getBuiltIn = requireGetBuiltIn();
	var newPromiseCapabilityModule = requireNewPromiseCapability();
	var perform = requirePerform();
	var iterate = requireIterate();
	var PROMISE_STATICS_INCORRECT_ITERATION = requirePromiseStaticsIncorrectIteration();

	var PROMISE_ANY_ERROR = 'No one promise resolved';

	// `Promise.any` method
	// https://tc39.es/ecma262/#sec-promise.any
	$({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION }, {
	  any: function any(iterable) {
	    var C = this;
	    var AggregateError = getBuiltIn('AggregateError');
	    var capability = newPromiseCapabilityModule.f(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var promiseResolve = aCallable(C.resolve);
	      var errors = [];
	      var counter = 0;
	      var remaining = 1;
	      var alreadyResolved = false;
	      iterate(iterable, function (promise) {
	        var index = counter++;
	        var alreadyRejected = false;
	        remaining++;
	        call(promiseResolve, C, promise).then(function (value) {
	          if (alreadyRejected || alreadyResolved) return;
	          alreadyResolved = true;
	          resolve(value);
	        }, function (error) {
	          if (alreadyRejected || alreadyResolved) return;
	          alreadyRejected = true;
	          errors[index] = error;
	          --remaining || reject(new AggregateError(errors, PROMISE_ANY_ERROR));
	        });
	      });
	      --remaining || reject(new AggregateError(errors, PROMISE_ANY_ERROR));
	    });
	    if (result.error) reject(result.value);
	    return capability.promise;
	  }
	});
	return es_promise_any;
}

var es_promise_finally = {};

var hasRequiredEs_promise_finally;

function requireEs_promise_finally () {
	if (hasRequiredEs_promise_finally) return es_promise_finally;
	hasRequiredEs_promise_finally = 1;
	var $ = require_export();
	var IS_PURE = requireIsPure();
	var NativePromiseConstructor = requirePromiseNativeConstructor();
	var fails = requireFails();
	var getBuiltIn = requireGetBuiltIn();
	var isCallable = requireIsCallable();
	var speciesConstructor = requireSpeciesConstructor();
	var promiseResolve = requirePromiseResolve();
	var defineBuiltIn = requireDefineBuiltIn();

	var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;

	// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
	var NON_GENERIC = !!NativePromiseConstructor && fails(function () {
	  // eslint-disable-next-line unicorn/no-thenable -- required for testing
	  NativePromisePrototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
	});

	// `Promise.prototype.finally` method
	// https://tc39.es/ecma262/#sec-promise.prototype.finally
	$({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
	  'finally': function (onFinally) {
	    var C = speciesConstructor(this, getBuiltIn('Promise'));
	    var isFunction = isCallable(onFinally);
	    return this.then(
	      isFunction ? function (x) {
	        return promiseResolve(C, onFinally()).then(function () { return x; });
	      } : onFinally,
	      isFunction ? function (e) {
	        return promiseResolve(C, onFinally()).then(function () { throw e; });
	      } : onFinally
	    );
	  }
	});

	// makes sure that native promise-based APIs `Promise#finally` properly works with patched `Promise#then`
	if (!IS_PURE && isCallable(NativePromiseConstructor)) {
	  var method = getBuiltIn('Promise').prototype['finally'];
	  if (NativePromisePrototype['finally'] !== method) {
	    defineBuiltIn(NativePromisePrototype, 'finally', method, { unsafe: true });
	  }
	}
	return es_promise_finally;
}

var es_promise_withResolvers = {};

var hasRequiredEs_promise_withResolvers;

function requireEs_promise_withResolvers () {
	if (hasRequiredEs_promise_withResolvers) return es_promise_withResolvers;
	hasRequiredEs_promise_withResolvers = 1;
	var $ = require_export();
	var newPromiseCapabilityModule = requireNewPromiseCapability();

	// `Promise.withResolvers` method
	// https://github.com/tc39/proposal-promise-with-resolvers
	$({ target: 'Promise', stat: true }, {
	  withResolvers: function withResolvers() {
	    var promiseCapability = newPromiseCapabilityModule.f(this);
	    return {
	      promise: promiseCapability.promise,
	      resolve: promiseCapability.resolve,
	      reject: promiseCapability.reject
	    };
	  }
	});
	return es_promise_withResolvers;
}

var es_reflect_apply = {};

var hasRequiredEs_reflect_apply;

function requireEs_reflect_apply () {
	if (hasRequiredEs_reflect_apply) return es_reflect_apply;
	hasRequiredEs_reflect_apply = 1;
	var $ = require_export();
	var functionApply = requireFunctionApply();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var fails = requireFails();

	// MS Edge argumentsList argument is optional
	var OPTIONAL_ARGUMENTS_LIST = !fails(function () {
	  // eslint-disable-next-line es/no-reflect -- required for testing
	  Reflect.apply(function () { /* empty */ });
	});

	// `Reflect.apply` method
	// https://tc39.es/ecma262/#sec-reflect.apply
	$({ target: 'Reflect', stat: true, forced: OPTIONAL_ARGUMENTS_LIST }, {
	  apply: function apply(target, thisArgument, argumentsList) {
	    return functionApply(aCallable(target), thisArgument, anObject(argumentsList));
	  }
	});
	return es_reflect_apply;
}

var es_reflect_construct = {};

var hasRequiredEs_reflect_construct;

function requireEs_reflect_construct () {
	if (hasRequiredEs_reflect_construct) return es_reflect_construct;
	hasRequiredEs_reflect_construct = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var apply = requireFunctionApply();
	var bind = requireFunctionBind();
	var aConstructor = requireAConstructor();
	var anObject = requireAnObject();
	var isObject = requireIsObject();
	var create = requireObjectCreate();
	var fails = requireFails();

	var nativeConstruct = getBuiltIn('Reflect', 'construct');
	var ObjectPrototype = Object.prototype;
	var push = [].push;

	// `Reflect.construct` method
	// https://tc39.es/ecma262/#sec-reflect.construct
	// MS Edge supports only 2 arguments and argumentsList argument is optional
	// FF Nightly sets third argument as `new.target`, but does not create `this` from it
	var NEW_TARGET_BUG = fails(function () {
	  function F() { /* empty */ }
	  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
	});

	var ARGS_BUG = !fails(function () {
	  nativeConstruct(function () { /* empty */ });
	});

	var FORCED = NEW_TARGET_BUG || ARGS_BUG;

	$({ target: 'Reflect', stat: true, forced: FORCED, sham: FORCED }, {
	  construct: function construct(Target, args /* , newTarget */) {
	    aConstructor(Target);
	    anObject(args);
	    var newTarget = arguments.length < 3 ? Target : aConstructor(arguments[2]);
	    if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);
	    if (Target === newTarget) {
	      // w/o altered newTarget, optimization for 0-4 arguments
	      switch (args.length) {
	        case 0: return new Target();
	        case 1: return new Target(args[0]);
	        case 2: return new Target(args[0], args[1]);
	        case 3: return new Target(args[0], args[1], args[2]);
	        case 4: return new Target(args[0], args[1], args[2], args[3]);
	      }
	      // w/o altered newTarget, lot of arguments case
	      var $args = [null];
	      apply(push, $args, args);
	      return new (apply(bind, Target, $args))();
	    }
	    // with altered newTarget, not support built-in constructors
	    var proto = newTarget.prototype;
	    var instance = create(isObject(proto) ? proto : ObjectPrototype);
	    var result = apply(Target, instance, args);
	    return isObject(result) ? result : instance;
	  }
	});
	return es_reflect_construct;
}

var es_reflect_defineProperty = {};

var hasRequiredEs_reflect_defineProperty;

function requireEs_reflect_defineProperty () {
	if (hasRequiredEs_reflect_defineProperty) return es_reflect_defineProperty;
	hasRequiredEs_reflect_defineProperty = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var anObject = requireAnObject();
	var toPropertyKey = requireToPropertyKey();
	var definePropertyModule = requireObjectDefineProperty();
	var fails = requireFails();

	// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
	var ERROR_INSTEAD_OF_FALSE = fails(function () {
	  // eslint-disable-next-line es/no-reflect -- required for testing
	  Reflect.defineProperty(definePropertyModule.f({}, 1, { value: 1 }), 1, { value: 2 });
	});

	// `Reflect.defineProperty` method
	// https://tc39.es/ecma262/#sec-reflect.defineproperty
	$({ target: 'Reflect', stat: true, forced: ERROR_INSTEAD_OF_FALSE, sham: !DESCRIPTORS }, {
	  defineProperty: function defineProperty(target, propertyKey, attributes) {
	    anObject(target);
	    var key = toPropertyKey(propertyKey);
	    anObject(attributes);
	    try {
	      definePropertyModule.f(target, key, attributes);
	      return true;
	    } catch (error) {
	      return false;
	    }
	  }
	});
	return es_reflect_defineProperty;
}

var es_reflect_deleteProperty = {};

var hasRequiredEs_reflect_deleteProperty;

function requireEs_reflect_deleteProperty () {
	if (hasRequiredEs_reflect_deleteProperty) return es_reflect_deleteProperty;
	hasRequiredEs_reflect_deleteProperty = 1;
	var $ = require_export();
	var anObject = requireAnObject();
	var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;

	// `Reflect.deleteProperty` method
	// https://tc39.es/ecma262/#sec-reflect.deleteproperty
	$({ target: 'Reflect', stat: true }, {
	  deleteProperty: function deleteProperty(target, propertyKey) {
	    var descriptor = getOwnPropertyDescriptor(anObject(target), propertyKey);
	    return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
	  }
	});
	return es_reflect_deleteProperty;
}

var es_reflect_get = {};

var isDataDescriptor;
var hasRequiredIsDataDescriptor;

function requireIsDataDescriptor () {
	if (hasRequiredIsDataDescriptor) return isDataDescriptor;
	hasRequiredIsDataDescriptor = 1;
	var hasOwn = requireHasOwnProperty();

	isDataDescriptor = function (descriptor) {
	  return descriptor !== undefined && (hasOwn(descriptor, 'value') || hasOwn(descriptor, 'writable'));
	};
	return isDataDescriptor;
}

var hasRequiredEs_reflect_get;

function requireEs_reflect_get () {
	if (hasRequiredEs_reflect_get) return es_reflect_get;
	hasRequiredEs_reflect_get = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var isObject = requireIsObject();
	var anObject = requireAnObject();
	var isDataDescriptor = requireIsDataDescriptor();
	var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
	var getPrototypeOf = requireObjectGetPrototypeOf();

	// `Reflect.get` method
	// https://tc39.es/ecma262/#sec-reflect.get
	function get(target, propertyKey /* , receiver */) {
	  var receiver = arguments.length < 3 ? target : arguments[2];
	  var descriptor, prototype;
	  if (anObject(target) === receiver) return target[propertyKey];
	  descriptor = getOwnPropertyDescriptorModule.f(target, propertyKey);
	  if (descriptor) return isDataDescriptor(descriptor)
	    ? descriptor.value
	    : descriptor.get === undefined ? undefined : call(descriptor.get, receiver);
	  if (isObject(prototype = getPrototypeOf(target))) return get(prototype, propertyKey, receiver);
	}

	$({ target: 'Reflect', stat: true }, {
	  get: get
	});
	return es_reflect_get;
}

var es_reflect_getOwnPropertyDescriptor = {};

var hasRequiredEs_reflect_getOwnPropertyDescriptor;

function requireEs_reflect_getOwnPropertyDescriptor () {
	if (hasRequiredEs_reflect_getOwnPropertyDescriptor) return es_reflect_getOwnPropertyDescriptor;
	hasRequiredEs_reflect_getOwnPropertyDescriptor = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var anObject = requireAnObject();
	var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();

	// `Reflect.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-reflect.getownpropertydescriptor
	$({ target: 'Reflect', stat: true, sham: !DESCRIPTORS }, {
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
	    return getOwnPropertyDescriptorModule.f(anObject(target), propertyKey);
	  }
	});
	return es_reflect_getOwnPropertyDescriptor;
}

var es_reflect_getPrototypeOf = {};

var hasRequiredEs_reflect_getPrototypeOf;

function requireEs_reflect_getPrototypeOf () {
	if (hasRequiredEs_reflect_getPrototypeOf) return es_reflect_getPrototypeOf;
	hasRequiredEs_reflect_getPrototypeOf = 1;
	var $ = require_export();
	var anObject = requireAnObject();
	var objectGetPrototypeOf = requireObjectGetPrototypeOf();
	var CORRECT_PROTOTYPE_GETTER = requireCorrectPrototypeGetter();

	// `Reflect.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-reflect.getprototypeof
	$({ target: 'Reflect', stat: true, sham: !CORRECT_PROTOTYPE_GETTER }, {
	  getPrototypeOf: function getPrototypeOf(target) {
	    return objectGetPrototypeOf(anObject(target));
	  }
	});
	return es_reflect_getPrototypeOf;
}

var es_reflect_has = {};

var hasRequiredEs_reflect_has;

function requireEs_reflect_has () {
	if (hasRequiredEs_reflect_has) return es_reflect_has;
	hasRequiredEs_reflect_has = 1;
	var $ = require_export();

	// `Reflect.has` method
	// https://tc39.es/ecma262/#sec-reflect.has
	$({ target: 'Reflect', stat: true }, {
	  has: function has(target, propertyKey) {
	    return propertyKey in target;
	  }
	});
	return es_reflect_has;
}

var es_reflect_isExtensible = {};

var hasRequiredEs_reflect_isExtensible;

function requireEs_reflect_isExtensible () {
	if (hasRequiredEs_reflect_isExtensible) return es_reflect_isExtensible;
	hasRequiredEs_reflect_isExtensible = 1;
	var $ = require_export();
	var anObject = requireAnObject();
	var $isExtensible = requireObjectIsExtensible();

	// `Reflect.isExtensible` method
	// https://tc39.es/ecma262/#sec-reflect.isextensible
	$({ target: 'Reflect', stat: true }, {
	  isExtensible: function isExtensible(target) {
	    anObject(target);
	    return $isExtensible(target);
	  }
	});
	return es_reflect_isExtensible;
}

var es_reflect_ownKeys = {};

var hasRequiredEs_reflect_ownKeys;

function requireEs_reflect_ownKeys () {
	if (hasRequiredEs_reflect_ownKeys) return es_reflect_ownKeys;
	hasRequiredEs_reflect_ownKeys = 1;
	var $ = require_export();
	var ownKeys = requireOwnKeys();

	// `Reflect.ownKeys` method
	// https://tc39.es/ecma262/#sec-reflect.ownkeys
	$({ target: 'Reflect', stat: true }, {
	  ownKeys: ownKeys
	});
	return es_reflect_ownKeys;
}

var es_reflect_preventExtensions = {};

var hasRequiredEs_reflect_preventExtensions;

function requireEs_reflect_preventExtensions () {
	if (hasRequiredEs_reflect_preventExtensions) return es_reflect_preventExtensions;
	hasRequiredEs_reflect_preventExtensions = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var anObject = requireAnObject();
	var FREEZING = requireFreezing();

	// `Reflect.preventExtensions` method
	// https://tc39.es/ecma262/#sec-reflect.preventextensions
	$({ target: 'Reflect', stat: true, sham: !FREEZING }, {
	  preventExtensions: function preventExtensions(target) {
	    anObject(target);
	    try {
	      var objectPreventExtensions = getBuiltIn('Object', 'preventExtensions');
	      if (objectPreventExtensions) objectPreventExtensions(target);
	      return true;
	    } catch (error) {
	      return false;
	    }
	  }
	});
	return es_reflect_preventExtensions;
}

var es_reflect_set = {};

var hasRequiredEs_reflect_set;

function requireEs_reflect_set () {
	if (hasRequiredEs_reflect_set) return es_reflect_set;
	hasRequiredEs_reflect_set = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var isObject = requireIsObject();
	var isDataDescriptor = requireIsDataDescriptor();
	var fails = requireFails();
	var definePropertyModule = requireObjectDefineProperty();
	var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();

	// `Reflect.set` method
	// https://tc39.es/ecma262/#sec-reflect.set
	function set(target, propertyKey, V /* , receiver */) {
	  var receiver = arguments.length < 4 ? target : arguments[3];
	  var ownDescriptor = getOwnPropertyDescriptorModule.f(anObject(target), propertyKey);
	  var existingDescriptor, prototype, setter;
	  if (!ownDescriptor) {
	    if (isObject(prototype = getPrototypeOf(target))) {
	      return set(prototype, propertyKey, V, receiver);
	    }
	    ownDescriptor = createPropertyDescriptor(0);
	  }
	  if (isDataDescriptor(ownDescriptor)) {
	    if (ownDescriptor.writable === false || !isObject(receiver)) return false;
	    if (existingDescriptor = getOwnPropertyDescriptorModule.f(receiver, propertyKey)) {
	      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
	      existingDescriptor.value = V;
	      definePropertyModule.f(receiver, propertyKey, existingDescriptor);
	    } else definePropertyModule.f(receiver, propertyKey, createPropertyDescriptor(0, V));
	  } else {
	    setter = ownDescriptor.set;
	    if (setter === undefined) return false;
	    call(setter, receiver, V);
	  } return true;
	}

	// MS Edge 17-18 Reflect.set allows setting the property to object
	// with non-writable property on the prototype
	var MS_EDGE_BUG = fails(function () {
	  var Constructor = function () { /* empty */ };
	  var object = definePropertyModule.f(new Constructor(), 'a', { configurable: true });
	  // eslint-disable-next-line es/no-reflect -- required for testing
	  return Reflect.set(Constructor.prototype, 'a', 1, object) !== false;
	});

	$({ target: 'Reflect', stat: true, forced: MS_EDGE_BUG }, {
	  set: set
	});
	return es_reflect_set;
}

var es_reflect_setPrototypeOf = {};

var hasRequiredEs_reflect_setPrototypeOf;

function requireEs_reflect_setPrototypeOf () {
	if (hasRequiredEs_reflect_setPrototypeOf) return es_reflect_setPrototypeOf;
	hasRequiredEs_reflect_setPrototypeOf = 1;
	var $ = require_export();
	var anObject = requireAnObject();
	var aPossiblePrototype = requireAPossiblePrototype();
	var objectSetPrototypeOf = requireObjectSetPrototypeOf();

	// `Reflect.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-reflect.setprototypeof
	if (objectSetPrototypeOf) $({ target: 'Reflect', stat: true }, {
	  setPrototypeOf: function setPrototypeOf(target, proto) {
	    anObject(target);
	    aPossiblePrototype(proto);
	    try {
	      objectSetPrototypeOf(target, proto);
	      return true;
	    } catch (error) {
	      return false;
	    }
	  }
	});
	return es_reflect_setPrototypeOf;
}

var es_reflect_toStringTag = {};

var hasRequiredEs_reflect_toStringTag;

function requireEs_reflect_toStringTag () {
	if (hasRequiredEs_reflect_toStringTag) return es_reflect_toStringTag;
	hasRequiredEs_reflect_toStringTag = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var setToStringTag = requireSetToStringTag();

	$({ global: true }, { Reflect: {} });

	// Reflect[@@toStringTag] property
	// https://tc39.es/ecma262/#sec-reflect-@@tostringtag
	setToStringTag(globalThis.Reflect, 'Reflect', true);
	return es_reflect_toStringTag;
}

var es_regexp_constructor = {};

var isRegexp;
var hasRequiredIsRegexp;

function requireIsRegexp () {
	if (hasRequiredIsRegexp) return isRegexp;
	hasRequiredIsRegexp = 1;
	var isObject = requireIsObject();
	var classof = requireClassofRaw();
	var wellKnownSymbol = requireWellKnownSymbol();

	var MATCH = wellKnownSymbol('match');

	// `IsRegExp` abstract operation
	// https://tc39.es/ecma262/#sec-isregexp
	isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classof(it) === 'RegExp');
	};
	return isRegexp;
}

var regexpFlags;
var hasRequiredRegexpFlags;

function requireRegexpFlags () {
	if (hasRequiredRegexpFlags) return regexpFlags;
	hasRequiredRegexpFlags = 1;
	var anObject = requireAnObject();

	// `RegExp.prototype.flags` getter implementation
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
	regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.hasIndices) result += 'd';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.unicodeSets) result += 'v';
	  if (that.sticky) result += 'y';
	  return result;
	};
	return regexpFlags;
}

var regexpGetFlags;
var hasRequiredRegexpGetFlags;

function requireRegexpGetFlags () {
	if (hasRequiredRegexpGetFlags) return regexpGetFlags;
	hasRequiredRegexpGetFlags = 1;
	var call = requireFunctionCall();
	var hasOwn = requireHasOwnProperty();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var regExpFlags = requireRegexpFlags();

	var RegExpPrototype = RegExp.prototype;

	regexpGetFlags = function (R) {
	  var flags = R.flags;
	  return flags === undefined && !('flags' in RegExpPrototype) && !hasOwn(R, 'flags') && isPrototypeOf(RegExpPrototype, R)
	    ? call(regExpFlags, R) : flags;
	};
	return regexpGetFlags;
}

var regexpStickyHelpers;
var hasRequiredRegexpStickyHelpers;

function requireRegexpStickyHelpers () {
	if (hasRequiredRegexpStickyHelpers) return regexpStickyHelpers;
	hasRequiredRegexpStickyHelpers = 1;
	var fails = requireFails();
	var globalThis = requireGlobalThis();

	// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	var $RegExp = globalThis.RegExp;

	var UNSUPPORTED_Y = fails(function () {
	  var re = $RegExp('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') !== null;
	});

	// UC Browser bug
	// https://github.com/zloirock/core-js/issues/1008
	var MISSED_STICKY = UNSUPPORTED_Y || fails(function () {
	  return !$RegExp('a', 'y').sticky;
	});

	var BROKEN_CARET = UNSUPPORTED_Y || fails(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = $RegExp('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') !== null;
	});

	regexpStickyHelpers = {
	  BROKEN_CARET: BROKEN_CARET,
	  MISSED_STICKY: MISSED_STICKY,
	  UNSUPPORTED_Y: UNSUPPORTED_Y
	};
	return regexpStickyHelpers;
}

var regexpUnsupportedDotAll;
var hasRequiredRegexpUnsupportedDotAll;

function requireRegexpUnsupportedDotAll () {
	if (hasRequiredRegexpUnsupportedDotAll) return regexpUnsupportedDotAll;
	hasRequiredRegexpUnsupportedDotAll = 1;
	var fails = requireFails();
	var globalThis = requireGlobalThis();

	// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
	var $RegExp = globalThis.RegExp;

	regexpUnsupportedDotAll = fails(function () {
	  var re = $RegExp('.', 's');
	  return !(re.dotAll && re.test('\n') && re.flags === 's');
	});
	return regexpUnsupportedDotAll;
}

var regexpUnsupportedNcg;
var hasRequiredRegexpUnsupportedNcg;

function requireRegexpUnsupportedNcg () {
	if (hasRequiredRegexpUnsupportedNcg) return regexpUnsupportedNcg;
	hasRequiredRegexpUnsupportedNcg = 1;
	var fails = requireFails();
	var globalThis = requireGlobalThis();

	// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
	var $RegExp = globalThis.RegExp;

	regexpUnsupportedNcg = fails(function () {
	  var re = $RegExp('(?<a>b)', 'g');
	  return re.exec('b').groups.a !== 'b' ||
	    'b'.replace(re, '$<a>c') !== 'bc';
	});
	return regexpUnsupportedNcg;
}

var hasRequiredEs_regexp_constructor;

function requireEs_regexp_constructor () {
	if (hasRequiredEs_regexp_constructor) return es_regexp_constructor;
	hasRequiredEs_regexp_constructor = 1;
	var DESCRIPTORS = requireDescriptors();
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();
	var isForced = requireIsForced();
	var inheritIfRequired = requireInheritIfRequired();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var create = requireObjectCreate();
	var getOwnPropertyNames = requireObjectGetOwnPropertyNames().f;
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var isRegExp = requireIsRegexp();
	var toString = requireToString();
	var getRegExpFlags = requireRegexpGetFlags();
	var stickyHelpers = requireRegexpStickyHelpers();
	var proxyAccessor = requireProxyAccessor();
	var defineBuiltIn = requireDefineBuiltIn();
	var fails = requireFails();
	var hasOwn = requireHasOwnProperty();
	var enforceInternalState = requireInternalState().enforce;
	var setSpecies = requireSetSpecies();
	var wellKnownSymbol = requireWellKnownSymbol();
	var UNSUPPORTED_DOT_ALL = requireRegexpUnsupportedDotAll();
	var UNSUPPORTED_NCG = requireRegexpUnsupportedNcg();

	var MATCH = wellKnownSymbol('match');
	var NativeRegExp = globalThis.RegExp;
	var RegExpPrototype = NativeRegExp.prototype;
	var SyntaxError = globalThis.SyntaxError;
	var exec = uncurryThis(RegExpPrototype.exec);
	var charAt = uncurryThis(''.charAt);
	var replace = uncurryThis(''.replace);
	var stringIndexOf = uncurryThis(''.indexOf);
	var stringSlice = uncurryThis(''.slice);
	// TODO: Use only proper RegExpIdentifierName
	var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
	var re1 = /a/g;
	var re2 = /a/g;

	// "new" should create a new object, old webkit bug
	var CORRECT_NEW = new NativeRegExp(re1) !== re1;

	var MISSED_STICKY = stickyHelpers.MISSED_STICKY;
	var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;

	var BASE_FORCED = DESCRIPTORS &&
	  (!CORRECT_NEW || MISSED_STICKY || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG || fails(function () {
	    re2[MATCH] = false;
	    // RegExp constructor can alter flags and IsRegExp works correct with @@match
	    // eslint-disable-next-line sonar/inconsistent-function-call -- required for testing
	    return NativeRegExp(re1) !== re1 || NativeRegExp(re2) === re2 || String(NativeRegExp(re1, 'i')) !== '/a/i';
	  }));

	var handleDotAll = function (string) {
	  var length = string.length;
	  var index = 0;
	  var result = '';
	  var brackets = false;
	  var chr;
	  for (; index <= length; index++) {
	    chr = charAt(string, index);
	    if (chr === '\\') {
	      result += chr + charAt(string, ++index);
	      continue;
	    }
	    if (!brackets && chr === '.') {
	      result += '[\\s\\S]';
	    } else {
	      if (chr === '[') {
	        brackets = true;
	      } else if (chr === ']') {
	        brackets = false;
	      } result += chr;
	    }
	  } return result;
	};

	var handleNCG = function (string) {
	  var length = string.length;
	  var index = 0;
	  var result = '';
	  var named = [];
	  var names = create(null);
	  var brackets = false;
	  var ncg = false;
	  var groupid = 0;
	  var groupname = '';
	  var chr;
	  for (; index <= length; index++) {
	    chr = charAt(string, index);
	    if (chr === '\\') {
	      chr += charAt(string, ++index);
	    } else if (chr === ']') {
	      brackets = false;
	    } else if (!brackets) switch (true) {
	      case chr === '[':
	        brackets = true;
	        break;
	      case chr === '(':
	        result += chr;
	        // ignore non-capturing groups
	        if (stringSlice(string, index + 1, index + 3) === '?:') {
	          continue;
	        }
	        if (exec(IS_NCG, stringSlice(string, index + 1))) {
	          index += 2;
	          ncg = true;
	        }
	        groupid++;
	        continue;
	      case chr === '>' && ncg:
	        if (groupname === '' || hasOwn(names, groupname)) {
	          throw new SyntaxError('Invalid capture group name');
	        }
	        names[groupname] = true;
	        named[named.length] = [groupname, groupid];
	        ncg = false;
	        groupname = '';
	        continue;
	    }
	    if (ncg) groupname += chr;
	    else result += chr;
	  } return [result, named];
	};

	// `RegExp` constructor
	// https://tc39.es/ecma262/#sec-regexp-constructor
	if (isForced('RegExp', BASE_FORCED)) {
	  var RegExpWrapper = function RegExp(pattern, flags) {
	    var thisIsRegExp = isPrototypeOf(RegExpPrototype, this);
	    var patternIsRegExp = isRegExp(pattern);
	    var flagsAreUndefined = flags === undefined;
	    var groups = [];
	    var rawPattern = pattern;
	    var rawFlags, dotAll, sticky, handled, result, state;

	    if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
	      return pattern;
	    }

	    if (patternIsRegExp || isPrototypeOf(RegExpPrototype, pattern)) {
	      pattern = pattern.source;
	      if (flagsAreUndefined) flags = getRegExpFlags(rawPattern);
	    }

	    pattern = pattern === undefined ? '' : toString(pattern);
	    flags = flags === undefined ? '' : toString(flags);
	    rawPattern = pattern;

	    if (UNSUPPORTED_DOT_ALL && 'dotAll' in re1) {
	      dotAll = !!flags && stringIndexOf(flags, 's') > -1;
	      if (dotAll) flags = replace(flags, /s/g, '');
	    }

	    rawFlags = flags;

	    if (MISSED_STICKY && 'sticky' in re1) {
	      sticky = !!flags && stringIndexOf(flags, 'y') > -1;
	      if (sticky && UNSUPPORTED_Y) flags = replace(flags, /y/g, '');
	    }

	    if (UNSUPPORTED_NCG) {
	      handled = handleNCG(pattern);
	      pattern = handled[0];
	      groups = handled[1];
	    }

	    result = inheritIfRequired(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype, RegExpWrapper);

	    if (dotAll || sticky || groups.length) {
	      state = enforceInternalState(result);
	      if (dotAll) {
	        state.dotAll = true;
	        state.raw = RegExpWrapper(handleDotAll(pattern), rawFlags);
	      }
	      if (sticky) state.sticky = true;
	      if (groups.length) state.groups = groups;
	    }

	    if (pattern !== rawPattern) try {
	      // fails in old engines, but we have no alternatives for unsupported regex syntax
	      createNonEnumerableProperty(result, 'source', rawPattern === '' ? '(?:)' : rawPattern);
	    } catch (error) { /* empty */ }

	    return result;
	  };

	  for (var keys = getOwnPropertyNames(NativeRegExp), index = 0; keys.length > index;) {
	    proxyAccessor(RegExpWrapper, NativeRegExp, keys[index++]);
	  }

	  RegExpPrototype.constructor = RegExpWrapper;
	  RegExpWrapper.prototype = RegExpPrototype;
	  defineBuiltIn(globalThis, 'RegExp', RegExpWrapper, { constructor: true });
	}

	// https://tc39.es/ecma262/#sec-get-regexp-@@species
	setSpecies('RegExp');
	return es_regexp_constructor;
}

var es_regexp_dotAll = {};

var hasRequiredEs_regexp_dotAll;

function requireEs_regexp_dotAll () {
	if (hasRequiredEs_regexp_dotAll) return es_regexp_dotAll;
	hasRequiredEs_regexp_dotAll = 1;
	var DESCRIPTORS = requireDescriptors();
	var UNSUPPORTED_DOT_ALL = requireRegexpUnsupportedDotAll();
	var classof = requireClassofRaw();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var getInternalState = requireInternalState().get;

	var RegExpPrototype = RegExp.prototype;
	var $TypeError = TypeError;

	// `RegExp.prototype.dotAll` getter
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.dotall
	if (DESCRIPTORS && UNSUPPORTED_DOT_ALL) {
	  defineBuiltInAccessor(RegExpPrototype, 'dotAll', {
	    configurable: true,
	    get: function dotAll() {
	      if (this === RegExpPrototype) return;
	      // We can't use InternalStateModule.getterFor because
	      // we don't add metadata for regexps created by a literal.
	      if (classof(this) === 'RegExp') {
	        return !!getInternalState(this).dotAll;
	      }
	      throw new $TypeError('Incompatible receiver, RegExp required');
	    }
	  });
	}
	return es_regexp_dotAll;
}

var es_regexp_exec = {};

var regexpExec;
var hasRequiredRegexpExec;

function requireRegexpExec () {
	if (hasRequiredRegexpExec) return regexpExec;
	hasRequiredRegexpExec = 1;
	/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
	/* eslint-disable regexp/no-useless-quantifier -- testing */
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var toString = requireToString();
	var regexpFlags = requireRegexpFlags();
	var stickyHelpers = requireRegexpStickyHelpers();
	var shared = requireShared();
	var create = requireObjectCreate();
	var getInternalState = requireInternalState().get;
	var UNSUPPORTED_DOT_ALL = requireRegexpUnsupportedDotAll();
	var UNSUPPORTED_NCG = requireRegexpUnsupportedNcg();

	var nativeReplace = shared('native-string-replace', String.prototype.replace);
	var nativeExec = RegExp.prototype.exec;
	var patchedExec = nativeExec;
	var charAt = uncurryThis(''.charAt);
	var indexOf = uncurryThis(''.indexOf);
	var replace = uncurryThis(''.replace);
	var stringSlice = uncurryThis(''.slice);

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  call(nativeExec, re1, 'a');
	  call(nativeExec, re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();

	var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;

	if (PATCH) {
	  patchedExec = function exec(string) {
	    var re = this;
	    var state = getInternalState(re);
	    var str = toString(string);
	    var raw = state.raw;
	    var result, reCopy, lastIndex, match, i, object, group;

	    if (raw) {
	      raw.lastIndex = re.lastIndex;
	      result = call(patchedExec, raw, str);
	      re.lastIndex = raw.lastIndex;
	      return result;
	    }

	    var groups = state.groups;
	    var sticky = UNSUPPORTED_Y && re.sticky;
	    var flags = call(regexpFlags, re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = replace(flags, 'y', '');
	      if (indexOf(flags, 'g') === -1) {
	        flags += 'g';
	      }

	      strCopy = stringSlice(str, re.lastIndex);
	      // Support anchored sticky behavior.
	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt(str, re.lastIndex - 1) !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      }
	      // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.
	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

	    match = call(nativeExec, sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = stringSlice(match.input, charsAdded);
	        match[0] = stringSlice(match[0], charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
	      call(nativeReplace, match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    if (match && groups) {
	      match.groups = object = create(null);
	      for (i = 0; i < groups.length; i++) {
	        group = groups[i];
	        object[group[0]] = match[group[1]];
	      }
	    }

	    return match;
	  };
	}

	regexpExec = patchedExec;
	return regexpExec;
}

var hasRequiredEs_regexp_exec;

function requireEs_regexp_exec () {
	if (hasRequiredEs_regexp_exec) return es_regexp_exec;
	hasRequiredEs_regexp_exec = 1;
	var $ = require_export();
	var exec = requireRegexpExec();

	// `RegExp.prototype.exec` method
	// https://tc39.es/ecma262/#sec-regexp.prototype.exec
	$({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
	  exec: exec
	});
	return es_regexp_exec;
}

var es_regexp_flags = {};

var hasRequiredEs_regexp_flags;

function requireEs_regexp_flags () {
	if (hasRequiredEs_regexp_flags) return es_regexp_flags;
	hasRequiredEs_regexp_flags = 1;
	var globalThis = requireGlobalThis();
	var DESCRIPTORS = requireDescriptors();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var regExpFlags = requireRegexpFlags();
	var fails = requireFails();

	// babel-minify and Closure Compiler transpiles RegExp('.', 'd') -> /./d and it causes SyntaxError
	var RegExp = globalThis.RegExp;
	var RegExpPrototype = RegExp.prototype;

	var FORCED = DESCRIPTORS && fails(function () {
	  var INDICES_SUPPORT = true;
	  try {
	    RegExp('.', 'd');
	  } catch (error) {
	    INDICES_SUPPORT = false;
	  }

	  var O = {};
	  // modern V8 bug
	  var calls = '';
	  var expected = INDICES_SUPPORT ? 'dgimsy' : 'gimsy';

	  var addGetter = function (key, chr) {
	    // eslint-disable-next-line es/no-object-defineproperty -- safe
	    Object.defineProperty(O, key, { get: function () {
	      calls += chr;
	      return true;
	    } });
	  };

	  var pairs = {
	    dotAll: 's',
	    global: 'g',
	    ignoreCase: 'i',
	    multiline: 'm',
	    sticky: 'y'
	  };

	  if (INDICES_SUPPORT) pairs.hasIndices = 'd';

	  for (var key in pairs) addGetter(key, pairs[key]);

	  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	  var result = Object.getOwnPropertyDescriptor(RegExpPrototype, 'flags').get.call(O);

	  return result !== expected || calls !== expected;
	});

	// `RegExp.prototype.flags` getter
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
	if (FORCED) defineBuiltInAccessor(RegExpPrototype, 'flags', {
	  configurable: true,
	  get: regExpFlags
	});
	return es_regexp_flags;
}

var es_regexp_sticky = {};

var hasRequiredEs_regexp_sticky;

function requireEs_regexp_sticky () {
	if (hasRequiredEs_regexp_sticky) return es_regexp_sticky;
	hasRequiredEs_regexp_sticky = 1;
	var DESCRIPTORS = requireDescriptors();
	var MISSED_STICKY = requireRegexpStickyHelpers().MISSED_STICKY;
	var classof = requireClassofRaw();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var getInternalState = requireInternalState().get;

	var RegExpPrototype = RegExp.prototype;
	var $TypeError = TypeError;

	// `RegExp.prototype.sticky` getter
	// https://tc39.es/ecma262/#sec-get-regexp.prototype.sticky
	if (DESCRIPTORS && MISSED_STICKY) {
	  defineBuiltInAccessor(RegExpPrototype, 'sticky', {
	    configurable: true,
	    get: function sticky() {
	      if (this === RegExpPrototype) return;
	      // We can't use InternalStateModule.getterFor because
	      // we don't add metadata for regexps created by a literal.
	      if (classof(this) === 'RegExp') {
	        return !!getInternalState(this).sticky;
	      }
	      throw new $TypeError('Incompatible receiver, RegExp required');
	    }
	  });
	}
	return es_regexp_sticky;
}

var es_regexp_test = {};

var hasRequiredEs_regexp_test;

function requireEs_regexp_test () {
	if (hasRequiredEs_regexp_test) return es_regexp_test;
	hasRequiredEs_regexp_test = 1;
	// TODO: Remove from `core-js@4` since it's moved to entry points
	requireEs_regexp_exec();
	var $ = require_export();
	var call = requireFunctionCall();
	var isCallable = requireIsCallable();
	var anObject = requireAnObject();
	var toString = requireToString();

	var DELEGATES_TO_EXEC = function () {
	  var execCalled = false;
	  var re = /[ac]/;
	  re.exec = function () {
	    execCalled = true;
	    return /./.exec.apply(this, arguments);
	  };
	  return re.test('abc') === true && execCalled;
	}();

	var nativeTest = /./.test;

	// `RegExp.prototype.test` method
	// https://tc39.es/ecma262/#sec-regexp.prototype.test
	$({ target: 'RegExp', proto: true, forced: !DELEGATES_TO_EXEC }, {
	  test: function (S) {
	    var R = anObject(this);
	    var string = toString(S);
	    var exec = R.exec;
	    if (!isCallable(exec)) return call(nativeTest, R, string);
	    var result = call(exec, R, string);
	    if (result === null) return false;
	    anObject(result);
	    return true;
	  }
	});
	return es_regexp_test;
}

var es_regexp_toString = {};

var hasRequiredEs_regexp_toString;

function requireEs_regexp_toString () {
	if (hasRequiredEs_regexp_toString) return es_regexp_toString;
	hasRequiredEs_regexp_toString = 1;
	var PROPER_FUNCTION_NAME = requireFunctionName().PROPER;
	var defineBuiltIn = requireDefineBuiltIn();
	var anObject = requireAnObject();
	var $toString = requireToString();
	var fails = requireFails();
	var getRegExpFlags = requireRegexpGetFlags();

	var TO_STRING = 'toString';
	var RegExpPrototype = RegExp.prototype;
	var nativeToString = RegExpPrototype[TO_STRING];

	var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) !== '/a/b'; });
	// FF44- RegExp#toString has a wrong name
	var INCORRECT_NAME = PROPER_FUNCTION_NAME && nativeToString.name !== TO_STRING;

	// `RegExp.prototype.toString` method
	// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
	if (NOT_GENERIC || INCORRECT_NAME) {
	  defineBuiltIn(RegExpPrototype, TO_STRING, function toString() {
	    var R = anObject(this);
	    var pattern = $toString(R.source);
	    var flags = $toString(getRegExpFlags(R));
	    return '/' + pattern + '/' + flags;
	  }, { unsafe: true });
	}
	return es_regexp_toString;
}

var es_set = {};

var es_set_constructor = {};

var hasRequiredEs_set_constructor;

function requireEs_set_constructor () {
	if (hasRequiredEs_set_constructor) return es_set_constructor;
	hasRequiredEs_set_constructor = 1;
	var collection = requireCollection();
	var collectionStrong = requireCollectionStrong();

	// `Set` constructor
	// https://tc39.es/ecma262/#sec-set-objects
	collection('Set', function (init) {
	  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);
	return es_set_constructor;
}

var hasRequiredEs_set;

function requireEs_set () {
	if (hasRequiredEs_set) return es_set;
	hasRequiredEs_set = 1;
	// TODO: Remove this module from `core-js@4` since it's replaced to module below
	requireEs_set_constructor();
	return es_set;
}

var es_set_difference_v2 = {};

var setHelpers;
var hasRequiredSetHelpers;

function requireSetHelpers () {
	if (hasRequiredSetHelpers) return setHelpers;
	hasRequiredSetHelpers = 1;
	var uncurryThis = requireFunctionUncurryThis();

	// eslint-disable-next-line es/no-set -- safe
	var SetPrototype = Set.prototype;

	setHelpers = {
	  // eslint-disable-next-line es/no-set -- safe
	  Set: Set,
	  add: uncurryThis(SetPrototype.add),
	  has: uncurryThis(SetPrototype.has),
	  remove: uncurryThis(SetPrototype['delete']),
	  proto: SetPrototype
	};
	return setHelpers;
}

var aSet;
var hasRequiredASet;

function requireASet () {
	if (hasRequiredASet) return aSet;
	hasRequiredASet = 1;
	var has = requireSetHelpers().has;

	// Perform ? RequireInternalSlot(M, [[SetData]])
	aSet = function (it) {
	  has(it);
	  return it;
	};
	return aSet;
}

var iterateSimple;
var hasRequiredIterateSimple;

function requireIterateSimple () {
	if (hasRequiredIterateSimple) return iterateSimple;
	hasRequiredIterateSimple = 1;
	var call = requireFunctionCall();

	iterateSimple = function (record, fn, ITERATOR_INSTEAD_OF_RECORD) {
	  var iterator = ITERATOR_INSTEAD_OF_RECORD ? record : record.iterator;
	  var next = record.next;
	  var step, result;
	  while (!(step = call(next, iterator)).done) {
	    result = fn(step.value);
	    if (result !== undefined) return result;
	  }
	};
	return iterateSimple;
}

var setIterate;
var hasRequiredSetIterate;

function requireSetIterate () {
	if (hasRequiredSetIterate) return setIterate;
	hasRequiredSetIterate = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var iterateSimple = requireIterateSimple();
	var SetHelpers = requireSetHelpers();

	var Set = SetHelpers.Set;
	var SetPrototype = SetHelpers.proto;
	var forEach = uncurryThis(SetPrototype.forEach);
	var keys = uncurryThis(SetPrototype.keys);
	var next = keys(new Set()).next;

	setIterate = function (set, fn, interruptible) {
	  return interruptible ? iterateSimple({ iterator: keys(set), next: next }, fn) : forEach(set, fn);
	};
	return setIterate;
}

var setClone;
var hasRequiredSetClone;

function requireSetClone () {
	if (hasRequiredSetClone) return setClone;
	hasRequiredSetClone = 1;
	var SetHelpers = requireSetHelpers();
	var iterate = requireSetIterate();

	var Set = SetHelpers.Set;
	var add = SetHelpers.add;

	setClone = function (set) {
	  var result = new Set();
	  iterate(set, function (it) {
	    add(result, it);
	  });
	  return result;
	};
	return setClone;
}

var setSize;
var hasRequiredSetSize;

function requireSetSize () {
	if (hasRequiredSetSize) return setSize;
	hasRequiredSetSize = 1;
	var uncurryThisAccessor = requireFunctionUncurryThisAccessor();
	var SetHelpers = requireSetHelpers();

	setSize = uncurryThisAccessor(SetHelpers.proto, 'size', 'get') || function (set) {
	  return set.size;
	};
	return setSize;
}

var getIteratorDirect;
var hasRequiredGetIteratorDirect;

function requireGetIteratorDirect () {
	if (hasRequiredGetIteratorDirect) return getIteratorDirect;
	hasRequiredGetIteratorDirect = 1;
	// `GetIteratorDirect(obj)` abstract operation
	// https://tc39.es/proposal-iterator-helpers/#sec-getiteratordirect
	getIteratorDirect = function (obj) {
	  return {
	    iterator: obj,
	    next: obj.next,
	    done: false
	  };
	};
	return getIteratorDirect;
}

var getSetRecord;
var hasRequiredGetSetRecord;

function requireGetSetRecord () {
	if (hasRequiredGetSetRecord) return getSetRecord;
	hasRequiredGetSetRecord = 1;
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var call = requireFunctionCall();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var getIteratorDirect = requireGetIteratorDirect();

	var INVALID_SIZE = 'Invalid size';
	var $RangeError = RangeError;
	var $TypeError = TypeError;
	var max = Math.max;

	var SetRecord = function (set, intSize) {
	  this.set = set;
	  this.size = max(intSize, 0);
	  this.has = aCallable(set.has);
	  this.keys = aCallable(set.keys);
	};

	SetRecord.prototype = {
	  getIterator: function () {
	    return getIteratorDirect(anObject(call(this.keys, this.set)));
	  },
	  includes: function (it) {
	    return call(this.has, this.set, it);
	  }
	};

	// `GetSetRecord` abstract operation
	// https://tc39.es/proposal-set-methods/#sec-getsetrecord
	getSetRecord = function (obj) {
	  anObject(obj);
	  var numSize = +obj.size;
	  // NOTE: If size is undefined, then numSize will be NaN
	  // eslint-disable-next-line no-self-compare -- NaN check
	  if (numSize !== numSize) throw new $TypeError(INVALID_SIZE);
	  var intSize = toIntegerOrInfinity(numSize);
	  if (intSize < 0) throw new $RangeError(INVALID_SIZE);
	  return new SetRecord(obj, intSize);
	};
	return getSetRecord;
}

var setDifference;
var hasRequiredSetDifference;

function requireSetDifference () {
	if (hasRequiredSetDifference) return setDifference;
	hasRequiredSetDifference = 1;
	var aSet = requireASet();
	var SetHelpers = requireSetHelpers();
	var clone = requireSetClone();
	var size = requireSetSize();
	var getSetRecord = requireGetSetRecord();
	var iterateSet = requireSetIterate();
	var iterateSimple = requireIterateSimple();

	var has = SetHelpers.has;
	var remove = SetHelpers.remove;

	// `Set.prototype.difference` method
	// https://github.com/tc39/proposal-set-methods
	setDifference = function difference(other) {
	  var O = aSet(this);
	  var otherRec = getSetRecord(other);
	  var result = clone(O);
	  if (size(O) <= otherRec.size) iterateSet(O, function (e) {
	    if (otherRec.includes(e)) remove(result, e);
	  });
	  else iterateSimple(otherRec.getIterator(), function (e) {
	    if (has(O, e)) remove(result, e);
	  });
	  return result;
	};
	return setDifference;
}

var setMethodAcceptSetLike;
var hasRequiredSetMethodAcceptSetLike;

function requireSetMethodAcceptSetLike () {
	if (hasRequiredSetMethodAcceptSetLike) return setMethodAcceptSetLike;
	hasRequiredSetMethodAcceptSetLike = 1;
	var getBuiltIn = requireGetBuiltIn();

	var createSetLike = function (size) {
	  return {
	    size: size,
	    has: function () {
	      return false;
	    },
	    keys: function () {
	      return {
	        next: function () {
	          return { done: true };
	        }
	      };
	    }
	  };
	};

	setMethodAcceptSetLike = function (name) {
	  var Set = getBuiltIn('Set');
	  try {
	    new Set()[name](createSetLike(0));
	    try {
	      // late spec change, early WebKit ~ Safari 17.0 beta implementation does not pass it
	      // https://github.com/tc39/proposal-set-methods/pull/88
	      new Set()[name](createSetLike(-1));
	      return false;
	    } catch (error2) {
	      return true;
	    }
	  } catch (error) {
	    return false;
	  }
	};
	return setMethodAcceptSetLike;
}

var hasRequiredEs_set_difference_v2;

function requireEs_set_difference_v2 () {
	if (hasRequiredEs_set_difference_v2) return es_set_difference_v2;
	hasRequiredEs_set_difference_v2 = 1;
	var $ = require_export();
	var difference = requireSetDifference();
	var setMethodAcceptSetLike = requireSetMethodAcceptSetLike();

	// `Set.prototype.difference` method
	// https://github.com/tc39/proposal-set-methods
	$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('difference') }, {
	  difference: difference
	});
	return es_set_difference_v2;
}

var es_set_intersection_v2 = {};

var setIntersection;
var hasRequiredSetIntersection;

function requireSetIntersection () {
	if (hasRequiredSetIntersection) return setIntersection;
	hasRequiredSetIntersection = 1;
	var aSet = requireASet();
	var SetHelpers = requireSetHelpers();
	var size = requireSetSize();
	var getSetRecord = requireGetSetRecord();
	var iterateSet = requireSetIterate();
	var iterateSimple = requireIterateSimple();

	var Set = SetHelpers.Set;
	var add = SetHelpers.add;
	var has = SetHelpers.has;

	// `Set.prototype.intersection` method
	// https://github.com/tc39/proposal-set-methods
	setIntersection = function intersection(other) {
	  var O = aSet(this);
	  var otherRec = getSetRecord(other);
	  var result = new Set();

	  if (size(O) > otherRec.size) {
	    iterateSimple(otherRec.getIterator(), function (e) {
	      if (has(O, e)) add(result, e);
	    });
	  } else {
	    iterateSet(O, function (e) {
	      if (otherRec.includes(e)) add(result, e);
	    });
	  }

	  return result;
	};
	return setIntersection;
}

var hasRequiredEs_set_intersection_v2;

function requireEs_set_intersection_v2 () {
	if (hasRequiredEs_set_intersection_v2) return es_set_intersection_v2;
	hasRequiredEs_set_intersection_v2 = 1;
	var $ = require_export();
	var fails = requireFails();
	var intersection = requireSetIntersection();
	var setMethodAcceptSetLike = requireSetMethodAcceptSetLike();

	var INCORRECT = !setMethodAcceptSetLike('intersection') || fails(function () {
	  // eslint-disable-next-line es/no-array-from, es/no-set -- testing
	  return String(Array.from(new Set([1, 2, 3]).intersection(new Set([3, 2])))) !== '3,2';
	});

	// `Set.prototype.intersection` method
	// https://github.com/tc39/proposal-set-methods
	$({ target: 'Set', proto: true, real: true, forced: INCORRECT }, {
	  intersection: intersection
	});
	return es_set_intersection_v2;
}

var es_set_isDisjointFrom_v2 = {};

var setIsDisjointFrom;
var hasRequiredSetIsDisjointFrom;

function requireSetIsDisjointFrom () {
	if (hasRequiredSetIsDisjointFrom) return setIsDisjointFrom;
	hasRequiredSetIsDisjointFrom = 1;
	var aSet = requireASet();
	var has = requireSetHelpers().has;
	var size = requireSetSize();
	var getSetRecord = requireGetSetRecord();
	var iterateSet = requireSetIterate();
	var iterateSimple = requireIterateSimple();
	var iteratorClose = requireIteratorClose();

	// `Set.prototype.isDisjointFrom` method
	// https://tc39.github.io/proposal-set-methods/#Set.prototype.isDisjointFrom
	setIsDisjointFrom = function isDisjointFrom(other) {
	  var O = aSet(this);
	  var otherRec = getSetRecord(other);
	  if (size(O) <= otherRec.size) return iterateSet(O, function (e) {
	    if (otherRec.includes(e)) return false;
	  }, true) !== false;
	  var iterator = otherRec.getIterator();
	  return iterateSimple(iterator, function (e) {
	    if (has(O, e)) return iteratorClose(iterator, 'normal', false);
	  }) !== false;
	};
	return setIsDisjointFrom;
}

var hasRequiredEs_set_isDisjointFrom_v2;

function requireEs_set_isDisjointFrom_v2 () {
	if (hasRequiredEs_set_isDisjointFrom_v2) return es_set_isDisjointFrom_v2;
	hasRequiredEs_set_isDisjointFrom_v2 = 1;
	var $ = require_export();
	var isDisjointFrom = requireSetIsDisjointFrom();
	var setMethodAcceptSetLike = requireSetMethodAcceptSetLike();

	// `Set.prototype.isDisjointFrom` method
	// https://github.com/tc39/proposal-set-methods
	$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('isDisjointFrom') }, {
	  isDisjointFrom: isDisjointFrom
	});
	return es_set_isDisjointFrom_v2;
}

var es_set_isSubsetOf_v2 = {};

var setIsSubsetOf;
var hasRequiredSetIsSubsetOf;

function requireSetIsSubsetOf () {
	if (hasRequiredSetIsSubsetOf) return setIsSubsetOf;
	hasRequiredSetIsSubsetOf = 1;
	var aSet = requireASet();
	var size = requireSetSize();
	var iterate = requireSetIterate();
	var getSetRecord = requireGetSetRecord();

	// `Set.prototype.isSubsetOf` method
	// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
	setIsSubsetOf = function isSubsetOf(other) {
	  var O = aSet(this);
	  var otherRec = getSetRecord(other);
	  if (size(O) > otherRec.size) return false;
	  return iterate(O, function (e) {
	    if (!otherRec.includes(e)) return false;
	  }, true) !== false;
	};
	return setIsSubsetOf;
}

var hasRequiredEs_set_isSubsetOf_v2;

function requireEs_set_isSubsetOf_v2 () {
	if (hasRequiredEs_set_isSubsetOf_v2) return es_set_isSubsetOf_v2;
	hasRequiredEs_set_isSubsetOf_v2 = 1;
	var $ = require_export();
	var isSubsetOf = requireSetIsSubsetOf();
	var setMethodAcceptSetLike = requireSetMethodAcceptSetLike();

	// `Set.prototype.isSubsetOf` method
	// https://github.com/tc39/proposal-set-methods
	$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('isSubsetOf') }, {
	  isSubsetOf: isSubsetOf
	});
	return es_set_isSubsetOf_v2;
}

var es_set_isSupersetOf_v2 = {};

var setIsSupersetOf;
var hasRequiredSetIsSupersetOf;

function requireSetIsSupersetOf () {
	if (hasRequiredSetIsSupersetOf) return setIsSupersetOf;
	hasRequiredSetIsSupersetOf = 1;
	var aSet = requireASet();
	var has = requireSetHelpers().has;
	var size = requireSetSize();
	var getSetRecord = requireGetSetRecord();
	var iterateSimple = requireIterateSimple();
	var iteratorClose = requireIteratorClose();

	// `Set.prototype.isSupersetOf` method
	// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSupersetOf
	setIsSupersetOf = function isSupersetOf(other) {
	  var O = aSet(this);
	  var otherRec = getSetRecord(other);
	  if (size(O) < otherRec.size) return false;
	  var iterator = otherRec.getIterator();
	  return iterateSimple(iterator, function (e) {
	    if (!has(O, e)) return iteratorClose(iterator, 'normal', false);
	  }) !== false;
	};
	return setIsSupersetOf;
}

var hasRequiredEs_set_isSupersetOf_v2;

function requireEs_set_isSupersetOf_v2 () {
	if (hasRequiredEs_set_isSupersetOf_v2) return es_set_isSupersetOf_v2;
	hasRequiredEs_set_isSupersetOf_v2 = 1;
	var $ = require_export();
	var isSupersetOf = requireSetIsSupersetOf();
	var setMethodAcceptSetLike = requireSetMethodAcceptSetLike();

	// `Set.prototype.isSupersetOf` method
	// https://github.com/tc39/proposal-set-methods
	$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('isSupersetOf') }, {
	  isSupersetOf: isSupersetOf
	});
	return es_set_isSupersetOf_v2;
}

var es_set_symmetricDifference_v2 = {};

var setSymmetricDifference;
var hasRequiredSetSymmetricDifference;

function requireSetSymmetricDifference () {
	if (hasRequiredSetSymmetricDifference) return setSymmetricDifference;
	hasRequiredSetSymmetricDifference = 1;
	var aSet = requireASet();
	var SetHelpers = requireSetHelpers();
	var clone = requireSetClone();
	var getSetRecord = requireGetSetRecord();
	var iterateSimple = requireIterateSimple();

	var add = SetHelpers.add;
	var has = SetHelpers.has;
	var remove = SetHelpers.remove;

	// `Set.prototype.symmetricDifference` method
	// https://github.com/tc39/proposal-set-methods
	setSymmetricDifference = function symmetricDifference(other) {
	  var O = aSet(this);
	  var keysIter = getSetRecord(other).getIterator();
	  var result = clone(O);
	  iterateSimple(keysIter, function (e) {
	    if (has(O, e)) remove(result, e);
	    else add(result, e);
	  });
	  return result;
	};
	return setSymmetricDifference;
}

var hasRequiredEs_set_symmetricDifference_v2;

function requireEs_set_symmetricDifference_v2 () {
	if (hasRequiredEs_set_symmetricDifference_v2) return es_set_symmetricDifference_v2;
	hasRequiredEs_set_symmetricDifference_v2 = 1;
	var $ = require_export();
	var symmetricDifference = requireSetSymmetricDifference();
	var setMethodAcceptSetLike = requireSetMethodAcceptSetLike();

	// `Set.prototype.symmetricDifference` method
	// https://github.com/tc39/proposal-set-methods
	$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('symmetricDifference') }, {
	  symmetricDifference: symmetricDifference
	});
	return es_set_symmetricDifference_v2;
}

var es_set_union_v2 = {};

var setUnion;
var hasRequiredSetUnion;

function requireSetUnion () {
	if (hasRequiredSetUnion) return setUnion;
	hasRequiredSetUnion = 1;
	var aSet = requireASet();
	var add = requireSetHelpers().add;
	var clone = requireSetClone();
	var getSetRecord = requireGetSetRecord();
	var iterateSimple = requireIterateSimple();

	// `Set.prototype.union` method
	// https://github.com/tc39/proposal-set-methods
	setUnion = function union(other) {
	  var O = aSet(this);
	  var keysIter = getSetRecord(other).getIterator();
	  var result = clone(O);
	  iterateSimple(keysIter, function (it) {
	    add(result, it);
	  });
	  return result;
	};
	return setUnion;
}

var hasRequiredEs_set_union_v2;

function requireEs_set_union_v2 () {
	if (hasRequiredEs_set_union_v2) return es_set_union_v2;
	hasRequiredEs_set_union_v2 = 1;
	var $ = require_export();
	var union = requireSetUnion();
	var setMethodAcceptSetLike = requireSetMethodAcceptSetLike();

	// `Set.prototype.union` method
	// https://github.com/tc39/proposal-set-methods
	$({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('union') }, {
	  union: union
	});
	return es_set_union_v2;
}

var es_string_atAlternative = {};

var hasRequiredEs_string_atAlternative;

function requireEs_string_atAlternative () {
	if (hasRequiredEs_string_atAlternative) return es_string_atAlternative;
	hasRequiredEs_string_atAlternative = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var toString = requireToString();
	var fails = requireFails();

	var charAt = uncurryThis(''.charAt);

	var FORCED = fails(function () {
	  // eslint-disable-next-line es/no-string-prototype-at -- safe
	  return '𠮷'.at(-2) !== '\uD842';
	});

	// `String.prototype.at` method
	// https://tc39.es/ecma262/#sec-string.prototype.at
	$({ target: 'String', proto: true, forced: FORCED }, {
	  at: function at(index) {
	    var S = toString(requireObjectCoercible(this));
	    var len = S.length;
	    var relativeIndex = toIntegerOrInfinity(index);
	    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
	    return (k < 0 || k >= len) ? undefined : charAt(S, k);
	  }
	});
	return es_string_atAlternative;
}

var es_string_codePointAt = {};

var stringMultibyte;
var hasRequiredStringMultibyte;

function requireStringMultibyte () {
	if (hasRequiredStringMultibyte) return stringMultibyte;
	hasRequiredStringMultibyte = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var toString = requireToString();
	var requireObjectCoercible = requireRequireObjectCoercible();

	var charAt = uncurryThis(''.charAt);
	var charCodeAt = uncurryThis(''.charCodeAt);
	var stringSlice = uncurryThis(''.slice);

	var createMethod = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = toString(requireObjectCoercible($this));
	    var position = toIntegerOrInfinity(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = charCodeAt(S, position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING
	          ? charAt(S, position)
	          : first
	        : CONVERT_TO_STRING
	          ? stringSlice(S, position, position + 2)
	          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod(true)
	};
	return stringMultibyte;
}

var hasRequiredEs_string_codePointAt;

function requireEs_string_codePointAt () {
	if (hasRequiredEs_string_codePointAt) return es_string_codePointAt;
	hasRequiredEs_string_codePointAt = 1;
	var $ = require_export();
	var codeAt = requireStringMultibyte().codeAt;

	// `String.prototype.codePointAt` method
	// https://tc39.es/ecma262/#sec-string.prototype.codepointat
	$({ target: 'String', proto: true }, {
	  codePointAt: function codePointAt(pos) {
	    return codeAt(this, pos);
	  }
	});
	return es_string_codePointAt;
}

var es_string_endsWith = {};

var notARegexp;
var hasRequiredNotARegexp;

function requireNotARegexp () {
	if (hasRequiredNotARegexp) return notARegexp;
	hasRequiredNotARegexp = 1;
	var isRegExp = requireIsRegexp();

	var $TypeError = TypeError;

	notARegexp = function (it) {
	  if (isRegExp(it)) {
	    throw new $TypeError("The method doesn't accept regular expressions");
	  } return it;
	};
	return notARegexp;
}

var correctIsRegexpLogic;
var hasRequiredCorrectIsRegexpLogic;

function requireCorrectIsRegexpLogic () {
	if (hasRequiredCorrectIsRegexpLogic) return correctIsRegexpLogic;
	hasRequiredCorrectIsRegexpLogic = 1;
	var wellKnownSymbol = requireWellKnownSymbol();

	var MATCH = wellKnownSymbol('match');

	correctIsRegexpLogic = function (METHOD_NAME) {
	  var regexp = /./;
	  try {
	    '/./'[METHOD_NAME](regexp);
	  } catch (error1) {
	    try {
	      regexp[MATCH] = false;
	      return '/./'[METHOD_NAME](regexp);
	    } catch (error2) { /* empty */ }
	  } return false;
	};
	return correctIsRegexpLogic;
}

var hasRequiredEs_string_endsWith;

function requireEs_string_endsWith () {
	if (hasRequiredEs_string_endsWith) return es_string_endsWith;
	hasRequiredEs_string_endsWith = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThisClause();
	var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
	var toLength = requireToLength();
	var toString = requireToString();
	var notARegExp = requireNotARegexp();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var correctIsRegExpLogic = requireCorrectIsRegexpLogic();
	var IS_PURE = requireIsPure();

	var slice = uncurryThis(''.slice);
	var min = Math.min;

	var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic('endsWith');
	// https://github.com/zloirock/core-js/pull/702
	var MDN_POLYFILL_BUG = !IS_PURE && !CORRECT_IS_REGEXP_LOGIC && !!function () {
	  var descriptor = getOwnPropertyDescriptor(String.prototype, 'endsWith');
	  return descriptor && !descriptor.writable;
	}();

	// `String.prototype.endsWith` method
	// https://tc39.es/ecma262/#sec-string.prototype.endswith
	$({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
	  endsWith: function endsWith(searchString /* , endPosition = @length */) {
	    var that = toString(requireObjectCoercible(this));
	    notARegExp(searchString);
	    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
	    var len = that.length;
	    var end = endPosition === undefined ? len : min(toLength(endPosition), len);
	    var search = toString(searchString);
	    return slice(that, end - search.length, end) === search;
	  }
	});
	return es_string_endsWith;
}

var es_string_fromCodePoint = {};

var hasRequiredEs_string_fromCodePoint;

function requireEs_string_fromCodePoint () {
	if (hasRequiredEs_string_fromCodePoint) return es_string_fromCodePoint;
	hasRequiredEs_string_fromCodePoint = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var toAbsoluteIndex = requireToAbsoluteIndex();

	var $RangeError = RangeError;
	var fromCharCode = String.fromCharCode;
	// eslint-disable-next-line es/no-string-fromcodepoint -- required for testing
	var $fromCodePoint = String.fromCodePoint;
	var join = uncurryThis([].join);

	// length should be 1, old FF problem
	var INCORRECT_LENGTH = !!$fromCodePoint && $fromCodePoint.length !== 1;

	// `String.fromCodePoint` method
	// https://tc39.es/ecma262/#sec-string.fromcodepoint
	$({ target: 'String', stat: true, arity: 1, forced: INCORRECT_LENGTH }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  fromCodePoint: function fromCodePoint(x) {
	    var elements = [];
	    var length = arguments.length;
	    var i = 0;
	    var code;
	    while (length > i) {
	      code = +arguments[i++];
	      if (toAbsoluteIndex(code, 0x10FFFF) !== code) throw new $RangeError(code + ' is not a valid code point');
	      elements[i] = code < 0x10000
	        ? fromCharCode(code)
	        : fromCharCode(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00);
	    } return join(elements, '');
	  }
	});
	return es_string_fromCodePoint;
}

var es_string_includes = {};

var hasRequiredEs_string_includes;

function requireEs_string_includes () {
	if (hasRequiredEs_string_includes) return es_string_includes;
	hasRequiredEs_string_includes = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var notARegExp = requireNotARegexp();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toString = requireToString();
	var correctIsRegExpLogic = requireCorrectIsRegexpLogic();

	var stringIndexOf = uncurryThis(''.indexOf);

	// `String.prototype.includes` method
	// https://tc39.es/ecma262/#sec-string.prototype.includes
	$({ target: 'String', proto: true, forced: !correctIsRegExpLogic('includes') }, {
	  includes: function includes(searchString /* , position = 0 */) {
	    return !!~stringIndexOf(
	      toString(requireObjectCoercible(this)),
	      toString(notARegExp(searchString)),
	      arguments.length > 1 ? arguments[1] : undefined
	    );
	  }
	});
	return es_string_includes;
}

var es_string_isWellFormed = {};

var hasRequiredEs_string_isWellFormed;

function requireEs_string_isWellFormed () {
	if (hasRequiredEs_string_isWellFormed) return es_string_isWellFormed;
	hasRequiredEs_string_isWellFormed = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toString = requireToString();

	var charCodeAt = uncurryThis(''.charCodeAt);

	// `String.prototype.isWellFormed` method
	// https://github.com/tc39/proposal-is-usv-string
	$({ target: 'String', proto: true }, {
	  isWellFormed: function isWellFormed() {
	    var S = toString(requireObjectCoercible(this));
	    var length = S.length;
	    for (var i = 0; i < length; i++) {
	      var charCode = charCodeAt(S, i);
	      // single UTF-16 code unit
	      if ((charCode & 0xF800) !== 0xD800) continue;
	      // unpaired surrogate
	      if (charCode >= 0xDC00 || ++i >= length || (charCodeAt(S, i) & 0xFC00) !== 0xDC00) return false;
	    } return true;
	  }
	});
	return es_string_isWellFormed;
}

var es_string_iterator = {};

var hasRequiredEs_string_iterator;

function requireEs_string_iterator () {
	if (hasRequiredEs_string_iterator) return es_string_iterator;
	hasRequiredEs_string_iterator = 1;
	var charAt = requireStringMultibyte().charAt;
	var toString = requireToString();
	var InternalStateModule = requireInternalState();
	var defineIterator = requireIteratorDefine();
	var createIterResultObject = requireCreateIterResultObject();

	var STRING_ITERATOR = 'String Iterator';
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState(this, {
	    type: STRING_ITERATOR,
	    string: toString(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return createIterResultObject(undefined, true);
	  point = charAt(string, index);
	  state.index += point.length;
	  return createIterResultObject(point, false);
	});
	return es_string_iterator;
}

var es_string_match = {};

var fixRegexpWellKnownSymbolLogic;
var hasRequiredFixRegexpWellKnownSymbolLogic;

function requireFixRegexpWellKnownSymbolLogic () {
	if (hasRequiredFixRegexpWellKnownSymbolLogic) return fixRegexpWellKnownSymbolLogic;
	hasRequiredFixRegexpWellKnownSymbolLogic = 1;
	// TODO: Remove from `core-js@4` since it's moved to entry points
	requireEs_regexp_exec();
	var call = requireFunctionCall();
	var defineBuiltIn = requireDefineBuiltIn();
	var regexpExec = requireRegexpExec();
	var fails = requireFails();
	var wellKnownSymbol = requireWellKnownSymbol();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();

	var SPECIES = wellKnownSymbol('species');
	var RegExpPrototype = RegExp.prototype;

	fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
	  var SYMBOL = wellKnownSymbol(KEY);

	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    // String methods call symbol-named RegExp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) !== 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {};
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES] = function () { return re; };
	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () {
	      execCalled = true;
	      return null;
	    };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    FORCED
	  ) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      var $exec = regexp.exec;
	      if ($exec === regexpExec || $exec === RegExpPrototype.exec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return { done: true, value: call(nativeRegExpMethod, regexp, str, arg2) };
	        }
	        return { done: true, value: call(nativeMethod, str, regexp, arg2) };
	      }
	      return { done: false };
	    });

	    defineBuiltIn(String.prototype, KEY, methods[0]);
	    defineBuiltIn(RegExpPrototype, SYMBOL, methods[1]);
	  }

	  if (SHAM) createNonEnumerableProperty(RegExpPrototype[SYMBOL], 'sham', true);
	};
	return fixRegexpWellKnownSymbolLogic;
}

var advanceStringIndex;
var hasRequiredAdvanceStringIndex;

function requireAdvanceStringIndex () {
	if (hasRequiredAdvanceStringIndex) return advanceStringIndex;
	hasRequiredAdvanceStringIndex = 1;
	var charAt = requireStringMultibyte().charAt;

	// `AdvanceStringIndex` abstract operation
	// https://tc39.es/ecma262/#sec-advancestringindex
	advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt(S, index).length : 1);
	};
	return advanceStringIndex;
}

var regexpExecAbstract;
var hasRequiredRegexpExecAbstract;

function requireRegexpExecAbstract () {
	if (hasRequiredRegexpExecAbstract) return regexpExecAbstract;
	hasRequiredRegexpExecAbstract = 1;
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var isCallable = requireIsCallable();
	var classof = requireClassofRaw();
	var regexpExec = requireRegexpExec();

	var $TypeError = TypeError;

	// `RegExpExec` abstract operation
	// https://tc39.es/ecma262/#sec-regexpexec
	regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (isCallable(exec)) {
	    var result = call(exec, R, S);
	    if (result !== null) anObject(result);
	    return result;
	  }
	  if (classof(R) === 'RegExp') return call(regexpExec, R, S);
	  throw new $TypeError('RegExp#exec called on incompatible receiver');
	};
	return regexpExecAbstract;
}

var hasRequiredEs_string_match;

function requireEs_string_match () {
	if (hasRequiredEs_string_match) return es_string_match;
	hasRequiredEs_string_match = 1;
	var call = requireFunctionCall();
	var fixRegExpWellKnownSymbolLogic = requireFixRegexpWellKnownSymbolLogic();
	var anObject = requireAnObject();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var toLength = requireToLength();
	var toString = requireToString();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var getMethod = requireGetMethod();
	var advanceStringIndex = requireAdvanceStringIndex();
	var regExpExec = requireRegexpExecAbstract();

	// @@match logic
	fixRegExpWellKnownSymbolLogic('match', function (MATCH, nativeMatch, maybeCallNative) {
	  return [
	    // `String.prototype.match` method
	    // https://tc39.es/ecma262/#sec-string.prototype.match
	    function match(regexp) {
	      var O = requireObjectCoercible(this);
	      var matcher = isNullOrUndefined(regexp) ? undefined : getMethod(regexp, MATCH);
	      return matcher ? call(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString(O));
	    },
	    // `RegExp.prototype[@@match]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
	    function (string) {
	      var rx = anObject(this);
	      var S = toString(string);
	      var res = maybeCallNative(nativeMatch, rx, S);

	      if (res.done) return res.value;

	      if (!rx.global) return regExpExec(rx, S);

	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	      var A = [];
	      var n = 0;
	      var result;
	      while ((result = regExpExec(rx, S)) !== null) {
	        var matchStr = toString(result[0]);
	        A[n] = matchStr;
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	        n++;
	      }
	      return n === 0 ? null : A;
	    }
	  ];
	});
	return es_string_match;
}

var es_string_matchAll = {};

var hasRequiredEs_string_matchAll;

function requireEs_string_matchAll () {
	if (hasRequiredEs_string_matchAll) return es_string_matchAll;
	hasRequiredEs_string_matchAll = 1;
	/* eslint-disable es/no-string-prototype-matchall -- safe */
	var $ = require_export();
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThisClause();
	var createIteratorConstructor = requireIteratorCreateConstructor();
	var createIterResultObject = requireCreateIterResultObject();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toLength = requireToLength();
	var toString = requireToString();
	var anObject = requireAnObject();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var classof = requireClassofRaw();
	var isRegExp = requireIsRegexp();
	var getRegExpFlags = requireRegexpGetFlags();
	var getMethod = requireGetMethod();
	var defineBuiltIn = requireDefineBuiltIn();
	var fails = requireFails();
	var wellKnownSymbol = requireWellKnownSymbol();
	var speciesConstructor = requireSpeciesConstructor();
	var advanceStringIndex = requireAdvanceStringIndex();
	var regExpExec = requireRegexpExecAbstract();
	var InternalStateModule = requireInternalState();
	var IS_PURE = requireIsPure();

	var MATCH_ALL = wellKnownSymbol('matchAll');
	var REGEXP_STRING = 'RegExp String';
	var REGEXP_STRING_ITERATOR = REGEXP_STRING + ' Iterator';
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(REGEXP_STRING_ITERATOR);
	var RegExpPrototype = RegExp.prototype;
	var $TypeError = TypeError;
	var stringIndexOf = uncurryThis(''.indexOf);
	var nativeMatchAll = uncurryThis(''.matchAll);

	var WORKS_WITH_NON_GLOBAL_REGEX = !!nativeMatchAll && !fails(function () {
	  nativeMatchAll('a', /./);
	});

	var $RegExpStringIterator = createIteratorConstructor(function RegExpStringIterator(regexp, string, $global, fullUnicode) {
	  setInternalState(this, {
	    type: REGEXP_STRING_ITERATOR,
	    regexp: regexp,
	    string: string,
	    global: $global,
	    unicode: fullUnicode,
	    done: false
	  });
	}, REGEXP_STRING, function next() {
	  var state = getInternalState(this);
	  if (state.done) return createIterResultObject(undefined, true);
	  var R = state.regexp;
	  var S = state.string;
	  var match = regExpExec(R, S);
	  if (match === null) {
	    state.done = true;
	    return createIterResultObject(undefined, true);
	  }
	  if (state.global) {
	    if (toString(match[0]) === '') R.lastIndex = advanceStringIndex(S, toLength(R.lastIndex), state.unicode);
	    return createIterResultObject(match, false);
	  }
	  state.done = true;
	  return createIterResultObject(match, false);
	});

	var $matchAll = function (string) {
	  var R = anObject(this);
	  var S = toString(string);
	  var C = speciesConstructor(R, RegExp);
	  var flags = toString(getRegExpFlags(R));
	  var matcher, $global, fullUnicode;
	  matcher = new C(C === RegExp ? R.source : R, flags);
	  $global = !!~stringIndexOf(flags, 'g');
	  fullUnicode = !!~stringIndexOf(flags, 'u');
	  matcher.lastIndex = toLength(R.lastIndex);
	  return new $RegExpStringIterator(matcher, S, $global, fullUnicode);
	};

	// `String.prototype.matchAll` method
	// https://tc39.es/ecma262/#sec-string.prototype.matchall
	$({ target: 'String', proto: true, forced: WORKS_WITH_NON_GLOBAL_REGEX }, {
	  matchAll: function matchAll(regexp) {
	    var O = requireObjectCoercible(this);
	    var flags, S, matcher, rx;
	    if (!isNullOrUndefined(regexp)) {
	      if (isRegExp(regexp)) {
	        flags = toString(requireObjectCoercible(getRegExpFlags(regexp)));
	        if (!~stringIndexOf(flags, 'g')) throw new $TypeError('`.matchAll` does not allow non-global regexes');
	      }
	      if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll(O, regexp);
	      matcher = getMethod(regexp, MATCH_ALL);
	      if (matcher === undefined && IS_PURE && classof(regexp) === 'RegExp') matcher = $matchAll;
	      if (matcher) return call(matcher, regexp, O);
	    } else if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll(O, regexp);
	    S = toString(O);
	    rx = new RegExp(regexp, 'g');
	    return IS_PURE ? call($matchAll, rx, S) : rx[MATCH_ALL](S);
	  }
	});

	IS_PURE || MATCH_ALL in RegExpPrototype || defineBuiltIn(RegExpPrototype, MATCH_ALL, $matchAll);
	return es_string_matchAll;
}

var es_string_padEnd = {};

var stringPadWebkitBug;
var hasRequiredStringPadWebkitBug;

function requireStringPadWebkitBug () {
	if (hasRequiredStringPadWebkitBug) return stringPadWebkitBug;
	hasRequiredStringPadWebkitBug = 1;
	// https://github.com/zloirock/core-js/issues/280
	var userAgent = requireEnvironmentUserAgent();

	stringPadWebkitBug = /Version\/10(?:\.\d+){1,2}(?: [\w./]+)?(?: Mobile\/\w+)? Safari\//.test(userAgent);
	return stringPadWebkitBug;
}

var hasRequiredEs_string_padEnd;

function requireEs_string_padEnd () {
	if (hasRequiredEs_string_padEnd) return es_string_padEnd;
	hasRequiredEs_string_padEnd = 1;
	var $ = require_export();
	var $padEnd = requireStringPad().end;
	var WEBKIT_BUG = requireStringPadWebkitBug();

	// `String.prototype.padEnd` method
	// https://tc39.es/ecma262/#sec-string.prototype.padend
	$({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
	  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
	    return $padEnd(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	return es_string_padEnd;
}

var es_string_padStart = {};

var hasRequiredEs_string_padStart;

function requireEs_string_padStart () {
	if (hasRequiredEs_string_padStart) return es_string_padStart;
	hasRequiredEs_string_padStart = 1;
	var $ = require_export();
	var $padStart = requireStringPad().start;
	var WEBKIT_BUG = requireStringPadWebkitBug();

	// `String.prototype.padStart` method
	// https://tc39.es/ecma262/#sec-string.prototype.padstart
	$({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
	  padStart: function padStart(maxLength /* , fillString = ' ' */) {
	    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});
	return es_string_padStart;
}

var es_string_raw = {};

var hasRequiredEs_string_raw;

function requireEs_string_raw () {
	if (hasRequiredEs_string_raw) return es_string_raw;
	hasRequiredEs_string_raw = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var toIndexedObject = requireToIndexedObject();
	var toObject = requireToObject();
	var toString = requireToString();
	var lengthOfArrayLike = requireLengthOfArrayLike();

	var push = uncurryThis([].push);
	var join = uncurryThis([].join);

	// `String.raw` method
	// https://tc39.es/ecma262/#sec-string.raw
	$({ target: 'String', stat: true }, {
	  raw: function raw(template) {
	    var rawTemplate = toIndexedObject(toObject(template).raw);
	    var literalSegments = lengthOfArrayLike(rawTemplate);
	    if (!literalSegments) return '';
	    var argumentsLength = arguments.length;
	    var elements = [];
	    var i = 0;
	    while (true) {
	      push(elements, toString(rawTemplate[i++]));
	      if (i === literalSegments) return join(elements, '');
	      if (i < argumentsLength) push(elements, toString(arguments[i]));
	    }
	  }
	});
	return es_string_raw;
}

var es_string_repeat = {};

var hasRequiredEs_string_repeat;

function requireEs_string_repeat () {
	if (hasRequiredEs_string_repeat) return es_string_repeat;
	hasRequiredEs_string_repeat = 1;
	var $ = require_export();
	var repeat = requireStringRepeat();

	// `String.prototype.repeat` method
	// https://tc39.es/ecma262/#sec-string.prototype.repeat
	$({ target: 'String', proto: true }, {
	  repeat: repeat
	});
	return es_string_repeat;
}

var es_string_replace = {};

var getSubstitution;
var hasRequiredGetSubstitution;

function requireGetSubstitution () {
	if (hasRequiredGetSubstitution) return getSubstitution;
	hasRequiredGetSubstitution = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var toObject = requireToObject();

	var floor = Math.floor;
	var charAt = uncurryThis(''.charAt);
	var replace = uncurryThis(''.replace);
	var stringSlice = uncurryThis(''.slice);
	// eslint-disable-next-line redos/no-vulnerable -- safe
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

	// `GetSubstitution` abstract operation
	// https://tc39.es/ecma262/#sec-getsubstitution
	getSubstitution = function (matched, str, position, captures, namedCaptures, replacement) {
	  var tailPos = position + matched.length;
	  var m = captures.length;
	  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
	  if (namedCaptures !== undefined) {
	    namedCaptures = toObject(namedCaptures);
	    symbols = SUBSTITUTION_SYMBOLS;
	  }
	  return replace(replacement, symbols, function (match, ch) {
	    var capture;
	    switch (charAt(ch, 0)) {
	      case '$': return '$';
	      case '&': return matched;
	      case '`': return stringSlice(str, 0, position);
	      case "'": return stringSlice(str, tailPos);
	      case '<':
	        capture = namedCaptures[stringSlice(ch, 1, -1)];
	        break;
	      default: // \d\d?
	        var n = +ch;
	        if (n === 0) return match;
	        if (n > m) {
	          var f = floor(n / 10);
	          if (f === 0) return match;
	          if (f <= m) return captures[f - 1] === undefined ? charAt(ch, 1) : captures[f - 1] + charAt(ch, 1);
	          return match;
	        }
	        capture = captures[n - 1];
	    }
	    return capture === undefined ? '' : capture;
	  });
	};
	return getSubstitution;
}

var hasRequiredEs_string_replace;

function requireEs_string_replace () {
	if (hasRequiredEs_string_replace) return es_string_replace;
	hasRequiredEs_string_replace = 1;
	var apply = requireFunctionApply();
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var fixRegExpWellKnownSymbolLogic = requireFixRegexpWellKnownSymbolLogic();
	var fails = requireFails();
	var anObject = requireAnObject();
	var isCallable = requireIsCallable();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var toLength = requireToLength();
	var toString = requireToString();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var advanceStringIndex = requireAdvanceStringIndex();
	var getMethod = requireGetMethod();
	var getSubstitution = requireGetSubstitution();
	var regExpExec = requireRegexpExecAbstract();
	var wellKnownSymbol = requireWellKnownSymbol();

	var REPLACE = wellKnownSymbol('replace');
	var max = Math.max;
	var min = Math.min;
	var concat = uncurryThis([].concat);
	var push = uncurryThis([].push);
	var stringIndexOf = uncurryThis(''.indexOf);
	var stringSlice = uncurryThis(''.slice);

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	};

	// IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
	var REPLACE_KEEPS_$0 = (function () {
	  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
	  return 'a'.replace(/./, '$0') === '$0';
	})();

	// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
	  if (/./[REPLACE]) {
	    return /./[REPLACE]('a', '$0') === '';
	  }
	  return false;
	})();

	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
	  return ''.replace(re, '$<a>') !== '7';
	});

	// @@replace logic
	fixRegExpWellKnownSymbolLogic('replace', function (_, nativeReplace, maybeCallNative) {
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

	  return [
	    // `String.prototype.replace` method
	    // https://tc39.es/ecma262/#sec-string.prototype.replace
	    function replace(searchValue, replaceValue) {
	      var O = requireObjectCoercible(this);
	      var replacer = isNullOrUndefined(searchValue) ? undefined : getMethod(searchValue, REPLACE);
	      return replacer
	        ? call(replacer, searchValue, O, replaceValue)
	        : call(nativeReplace, toString(O), searchValue, replaceValue);
	    },
	    // `RegExp.prototype[@@replace]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
	    function (string, replaceValue) {
	      var rx = anObject(this);
	      var S = toString(string);

	      if (
	        typeof replaceValue == 'string' &&
	        stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
	        stringIndexOf(replaceValue, '$<') === -1
	      ) {
	        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
	        if (res.done) return res.value;
	      }

	      var functionalReplace = isCallable(replaceValue);
	      if (!functionalReplace) replaceValue = toString(replaceValue);

	      var global = rx.global;
	      var fullUnicode;
	      if (global) {
	        fullUnicode = rx.unicode;
	        rx.lastIndex = 0;
	      }

	      var results = [];
	      var result;
	      while (true) {
	        result = regExpExec(rx, S);
	        if (result === null) break;

	        push(results, result);
	        if (!global) break;

	        var matchStr = toString(result[0]);
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	      }

	      var accumulatedResult = '';
	      var nextSourcePosition = 0;
	      for (var i = 0; i < results.length; i++) {
	        result = results[i];

	        var matched = toString(result[0]);
	        var position = max(min(toIntegerOrInfinity(result.index), S.length), 0);
	        var captures = [];
	        var replacement;
	        // NOTE: This is equivalent to
	        //   captures = result.slice(1).map(maybeToString)
	        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
	        for (var j = 1; j < result.length; j++) push(captures, maybeToString(result[j]));
	        var namedCaptures = result.groups;
	        if (functionalReplace) {
	          var replacerArgs = concat([matched], captures, position, S);
	          if (namedCaptures !== undefined) push(replacerArgs, namedCaptures);
	          replacement = toString(apply(replaceValue, undefined, replacerArgs));
	        } else {
	          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	        }
	        if (position >= nextSourcePosition) {
	          accumulatedResult += stringSlice(S, nextSourcePosition, position) + replacement;
	          nextSourcePosition = position + matched.length;
	        }
	      }

	      return accumulatedResult + stringSlice(S, nextSourcePosition);
	    }
	  ];
	}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);
	return es_string_replace;
}

var es_string_replaceAll = {};

var hasRequiredEs_string_replaceAll;

function requireEs_string_replaceAll () {
	if (hasRequiredEs_string_replaceAll) return es_string_replaceAll;
	hasRequiredEs_string_replaceAll = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var isCallable = requireIsCallable();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var isRegExp = requireIsRegexp();
	var toString = requireToString();
	var getMethod = requireGetMethod();
	var getRegExpFlags = requireRegexpGetFlags();
	var getSubstitution = requireGetSubstitution();
	var wellKnownSymbol = requireWellKnownSymbol();
	var IS_PURE = requireIsPure();

	var REPLACE = wellKnownSymbol('replace');
	var $TypeError = TypeError;
	var indexOf = uncurryThis(''.indexOf);
	var replace = uncurryThis(''.replace);
	var stringSlice = uncurryThis(''.slice);
	var max = Math.max;

	// `String.prototype.replaceAll` method
	// https://tc39.es/ecma262/#sec-string.prototype.replaceall
	$({ target: 'String', proto: true }, {
	  replaceAll: function replaceAll(searchValue, replaceValue) {
	    var O = requireObjectCoercible(this);
	    var IS_REG_EXP, flags, replacer, string, searchString, functionalReplace, searchLength, advanceBy, position, replacement;
	    var endOfLastMatch = 0;
	    var result = '';
	    if (!isNullOrUndefined(searchValue)) {
	      IS_REG_EXP = isRegExp(searchValue);
	      if (IS_REG_EXP) {
	        flags = toString(requireObjectCoercible(getRegExpFlags(searchValue)));
	        if (!~indexOf(flags, 'g')) throw new $TypeError('`.replaceAll` does not allow non-global regexes');
	      }
	      replacer = getMethod(searchValue, REPLACE);
	      if (replacer) return call(replacer, searchValue, O, replaceValue);
	      if (IS_PURE && IS_REG_EXP) return replace(toString(O), searchValue, replaceValue);
	    }
	    string = toString(O);
	    searchString = toString(searchValue);
	    functionalReplace = isCallable(replaceValue);
	    if (!functionalReplace) replaceValue = toString(replaceValue);
	    searchLength = searchString.length;
	    advanceBy = max(1, searchLength);
	    position = indexOf(string, searchString);
	    while (position !== -1) {
	      replacement = functionalReplace
	        ? toString(replaceValue(searchString, position, string))
	        : getSubstitution(searchString, string, position, [], undefined, replaceValue);
	      result += stringSlice(string, endOfLastMatch, position) + replacement;
	      endOfLastMatch = position + searchLength;
	      position = position + advanceBy > string.length ? -1 : indexOf(string, searchString, position + advanceBy);
	    }
	    if (endOfLastMatch < string.length) {
	      result += stringSlice(string, endOfLastMatch);
	    }
	    return result;
	  }
	});
	return es_string_replaceAll;
}

var es_string_search = {};

var hasRequiredEs_string_search;

function requireEs_string_search () {
	if (hasRequiredEs_string_search) return es_string_search;
	hasRequiredEs_string_search = 1;
	var call = requireFunctionCall();
	var fixRegExpWellKnownSymbolLogic = requireFixRegexpWellKnownSymbolLogic();
	var anObject = requireAnObject();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var sameValue = requireSameValue();
	var toString = requireToString();
	var getMethod = requireGetMethod();
	var regExpExec = requireRegexpExecAbstract();

	// @@search logic
	fixRegExpWellKnownSymbolLogic('search', function (SEARCH, nativeSearch, maybeCallNative) {
	  return [
	    // `String.prototype.search` method
	    // https://tc39.es/ecma262/#sec-string.prototype.search
	    function search(regexp) {
	      var O = requireObjectCoercible(this);
	      var searcher = isNullOrUndefined(regexp) ? undefined : getMethod(regexp, SEARCH);
	      return searcher ? call(searcher, regexp, O) : new RegExp(regexp)[SEARCH](toString(O));
	    },
	    // `RegExp.prototype[@@search]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@search
	    function (string) {
	      var rx = anObject(this);
	      var S = toString(string);
	      var res = maybeCallNative(nativeSearch, rx, S);

	      if (res.done) return res.value;

	      var previousLastIndex = rx.lastIndex;
	      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
	      var result = regExpExec(rx, S);
	      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
	      return result === null ? -1 : result.index;
	    }
	  ];
	});
	return es_string_search;
}

var es_string_split = {};

var hasRequiredEs_string_split;

function requireEs_string_split () {
	if (hasRequiredEs_string_split) return es_string_split;
	hasRequiredEs_string_split = 1;
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var fixRegExpWellKnownSymbolLogic = requireFixRegexpWellKnownSymbolLogic();
	var anObject = requireAnObject();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var speciesConstructor = requireSpeciesConstructor();
	var advanceStringIndex = requireAdvanceStringIndex();
	var toLength = requireToLength();
	var toString = requireToString();
	var getMethod = requireGetMethod();
	var regExpExec = requireRegexpExecAbstract();
	var stickyHelpers = requireRegexpStickyHelpers();
	var fails = requireFails();

	var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;
	var MAX_UINT32 = 0xFFFFFFFF;
	var min = Math.min;
	var push = uncurryThis([].push);
	var stringSlice = uncurryThis(''.slice);

	// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper
	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  // eslint-disable-next-line regexp/no-empty-group -- required for testing
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	var BUGGY = 'abbc'.split(/(b)*/)[1] === 'c' ||
	  // eslint-disable-next-line regexp/no-empty-group -- required for testing
	  'test'.split(/(?:)/, -1).length !== 4 ||
	  'ab'.split(/(?:ab)*/).length !== 2 ||
	  '.'.split(/(.?)(.?)/).length !== 4 ||
	  // eslint-disable-next-line regexp/no-empty-capturing-group, regexp/no-empty-group -- required for testing
	  '.'.split(/()()/).length > 1 ||
	  ''.split(/.?/).length;

	// @@split logic
	fixRegExpWellKnownSymbolLogic('split', function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit = '0'.split(undefined, 0).length ? function (separator, limit) {
	    return separator === undefined && limit === 0 ? [] : call(nativeSplit, this, separator, limit);
	  } : nativeSplit;

	  return [
	    // `String.prototype.split` method
	    // https://tc39.es/ecma262/#sec-string.prototype.split
	    function split(separator, limit) {
	      var O = requireObjectCoercible(this);
	      var splitter = isNullOrUndefined(separator) ? undefined : getMethod(separator, SPLIT);
	      return splitter
	        ? call(splitter, separator, O, limit)
	        : call(internalSplit, toString(O), separator, limit);
	    },
	    // `RegExp.prototype[@@split]` method
	    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
	    //
	    // NOTE: This cannot be properly polyfilled in engines that don't support
	    // the 'y' flag.
	    function (string, limit) {
	      var rx = anObject(this);
	      var S = toString(string);

	      if (!BUGGY) {
	        var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);
	        if (res.done) return res.value;
	      }

	      var C = speciesConstructor(rx, RegExp);
	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (UNSUPPORTED_Y ? 'g' : 'y');
	      // ^(? + rx + ) is needed, in combination with some S slicing, to
	      // simulate the 'y' flag.
	      var splitter = new C(UNSUPPORTED_Y ? '^(?:' + rx.source + ')' : rx, flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return regExpExec(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = UNSUPPORTED_Y ? 0 : q;
	        var z = regExpExec(splitter, UNSUPPORTED_Y ? stringSlice(S, q) : S);
	        var e;
	        if (
	          z === null ||
	          (e = min(toLength(splitter.lastIndex + (UNSUPPORTED_Y ? q : 0)), S.length)) === p
	        ) {
	          q = advanceStringIndex(S, q, unicodeMatching);
	        } else {
	          push(A, stringSlice(S, p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            push(A, z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      push(A, stringSlice(S, p));
	      return A;
	    }
	  ];
	}, BUGGY || !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y);
	return es_string_split;
}

var es_string_startsWith = {};

var hasRequiredEs_string_startsWith;

function requireEs_string_startsWith () {
	if (hasRequiredEs_string_startsWith) return es_string_startsWith;
	hasRequiredEs_string_startsWith = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThisClause();
	var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
	var toLength = requireToLength();
	var toString = requireToString();
	var notARegExp = requireNotARegexp();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var correctIsRegExpLogic = requireCorrectIsRegexpLogic();
	var IS_PURE = requireIsPure();

	var stringSlice = uncurryThis(''.slice);
	var min = Math.min;

	var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic('startsWith');
	// https://github.com/zloirock/core-js/pull/702
	var MDN_POLYFILL_BUG = !IS_PURE && !CORRECT_IS_REGEXP_LOGIC && !!function () {
	  var descriptor = getOwnPropertyDescriptor(String.prototype, 'startsWith');
	  return descriptor && !descriptor.writable;
	}();

	// `String.prototype.startsWith` method
	// https://tc39.es/ecma262/#sec-string.prototype.startswith
	$({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
	  startsWith: function startsWith(searchString /* , position = 0 */) {
	    var that = toString(requireObjectCoercible(this));
	    notARegExp(searchString);
	    var index = toLength(min(arguments.length > 1 ? arguments[1] : undefined, that.length));
	    var search = toString(searchString);
	    return stringSlice(that, index, index + search.length) === search;
	  }
	});
	return es_string_startsWith;
}

var es_string_substr = {};

var hasRequiredEs_string_substr;

function requireEs_string_substr () {
	if (hasRequiredEs_string_substr) return es_string_substr;
	hasRequiredEs_string_substr = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var toString = requireToString();

	var stringSlice = uncurryThis(''.slice);
	var max = Math.max;
	var min = Math.min;

	// eslint-disable-next-line unicorn/prefer-string-slice -- required for testing
	var FORCED = !''.substr || 'ab'.substr(-1) !== 'b';

	// `String.prototype.substr` method
	// https://tc39.es/ecma262/#sec-string.prototype.substr
	$({ target: 'String', proto: true, forced: FORCED }, {
	  substr: function substr(start, length) {
	    var that = toString(requireObjectCoercible(this));
	    var size = that.length;
	    var intStart = toIntegerOrInfinity(start);
	    var intLength, intEnd;
	    if (intStart === Infinity) intStart = 0;
	    if (intStart < 0) intStart = max(size + intStart, 0);
	    intLength = length === undefined ? size : toIntegerOrInfinity(length);
	    if (intLength <= 0 || intLength === Infinity) return '';
	    intEnd = min(intStart + intLength, size);
	    return intStart >= intEnd ? '' : stringSlice(that, intStart, intEnd);
	  }
	});
	return es_string_substr;
}

var es_string_toWellFormed = {};

var hasRequiredEs_string_toWellFormed;

function requireEs_string_toWellFormed () {
	if (hasRequiredEs_string_toWellFormed) return es_string_toWellFormed;
	hasRequiredEs_string_toWellFormed = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toString = requireToString();
	var fails = requireFails();

	var $Array = Array;
	var charAt = uncurryThis(''.charAt);
	var charCodeAt = uncurryThis(''.charCodeAt);
	var join = uncurryThis([].join);
	// eslint-disable-next-line es/no-string-prototype-towellformed -- safe
	var $toWellFormed = ''.toWellFormed;
	var REPLACEMENT_CHARACTER = '\uFFFD';

	// Safari bug
	var TO_STRING_CONVERSION_BUG = $toWellFormed && fails(function () {
	  return call($toWellFormed, 1) !== '1';
	});

	// `String.prototype.toWellFormed` method
	// https://github.com/tc39/proposal-is-usv-string
	$({ target: 'String', proto: true, forced: TO_STRING_CONVERSION_BUG }, {
	  toWellFormed: function toWellFormed() {
	    var S = toString(requireObjectCoercible(this));
	    if (TO_STRING_CONVERSION_BUG) return call($toWellFormed, S);
	    var length = S.length;
	    var result = $Array(length);
	    for (var i = 0; i < length; i++) {
	      var charCode = charCodeAt(S, i);
	      // single UTF-16 code unit
	      if ((charCode & 0xF800) !== 0xD800) result[i] = charAt(S, i);
	      // unpaired surrogate
	      else if (charCode >= 0xDC00 || i + 1 >= length || (charCodeAt(S, i + 1) & 0xFC00) !== 0xDC00) result[i] = REPLACEMENT_CHARACTER;
	      // surrogate pair
	      else {
	        result[i] = charAt(S, i);
	        result[++i] = charAt(S, i);
	      }
	    } return join(result, '');
	  }
	});
	return es_string_toWellFormed;
}

var es_string_trim = {};

var stringTrimForced;
var hasRequiredStringTrimForced;

function requireStringTrimForced () {
	if (hasRequiredStringTrimForced) return stringTrimForced;
	hasRequiredStringTrimForced = 1;
	var PROPER_FUNCTION_NAME = requireFunctionName().PROPER;
	var fails = requireFails();
	var whitespaces = requireWhitespaces();

	var non = '\u200B\u0085\u180E';

	// check that a method works with the correct list
	// of whitespaces and has a correct name
	stringTrimForced = function (METHOD_NAME) {
	  return fails(function () {
	    return !!whitespaces[METHOD_NAME]()
	      || non[METHOD_NAME]() !== non
	      || (PROPER_FUNCTION_NAME && whitespaces[METHOD_NAME].name !== METHOD_NAME);
	  });
	};
	return stringTrimForced;
}

var hasRequiredEs_string_trim;

function requireEs_string_trim () {
	if (hasRequiredEs_string_trim) return es_string_trim;
	hasRequiredEs_string_trim = 1;
	var $ = require_export();
	var $trim = requireStringTrim().trim;
	var forcedStringTrimMethod = requireStringTrimForced();

	// `String.prototype.trim` method
	// https://tc39.es/ecma262/#sec-string.prototype.trim
	$({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
	  trim: function trim() {
	    return $trim(this);
	  }
	});
	return es_string_trim;
}

var es_string_trimEnd = {};

var es_string_trimRight = {};

var stringTrimEnd;
var hasRequiredStringTrimEnd;

function requireStringTrimEnd () {
	if (hasRequiredStringTrimEnd) return stringTrimEnd;
	hasRequiredStringTrimEnd = 1;
	var $trimEnd = requireStringTrim().end;
	var forcedStringTrimMethod = requireStringTrimForced();

	// `String.prototype.{ trimEnd, trimRight }` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimend
	// https://tc39.es/ecma262/#String.prototype.trimright
	stringTrimEnd = forcedStringTrimMethod('trimEnd') ? function trimEnd() {
	  return $trimEnd(this);
	// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
	} : ''.trimEnd;
	return stringTrimEnd;
}

var hasRequiredEs_string_trimRight;

function requireEs_string_trimRight () {
	if (hasRequiredEs_string_trimRight) return es_string_trimRight;
	hasRequiredEs_string_trimRight = 1;
	var $ = require_export();
	var trimEnd = requireStringTrimEnd();

	// `String.prototype.trimRight` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimend
	// eslint-disable-next-line es/no-string-prototype-trimleft-trimright -- safe
	$({ target: 'String', proto: true, name: 'trimEnd', forced: ''.trimRight !== trimEnd }, {
	  trimRight: trimEnd
	});
	return es_string_trimRight;
}

var hasRequiredEs_string_trimEnd;

function requireEs_string_trimEnd () {
	if (hasRequiredEs_string_trimEnd) return es_string_trimEnd;
	hasRequiredEs_string_trimEnd = 1;
	// TODO: Remove this line from `core-js@4`
	requireEs_string_trimRight();
	var $ = require_export();
	var trimEnd = requireStringTrimEnd();

	// `String.prototype.trimEnd` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimend
	// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
	$({ target: 'String', proto: true, name: 'trimEnd', forced: ''.trimEnd !== trimEnd }, {
	  trimEnd: trimEnd
	});
	return es_string_trimEnd;
}

var es_string_trimStart = {};

var es_string_trimLeft = {};

var stringTrimStart;
var hasRequiredStringTrimStart;

function requireStringTrimStart () {
	if (hasRequiredStringTrimStart) return stringTrimStart;
	hasRequiredStringTrimStart = 1;
	var $trimStart = requireStringTrim().start;
	var forcedStringTrimMethod = requireStringTrimForced();

	// `String.prototype.{ trimStart, trimLeft }` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimstart
	// https://tc39.es/ecma262/#String.prototype.trimleft
	stringTrimStart = forcedStringTrimMethod('trimStart') ? function trimStart() {
	  return $trimStart(this);
	// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
	} : ''.trimStart;
	return stringTrimStart;
}

var hasRequiredEs_string_trimLeft;

function requireEs_string_trimLeft () {
	if (hasRequiredEs_string_trimLeft) return es_string_trimLeft;
	hasRequiredEs_string_trimLeft = 1;
	var $ = require_export();
	var trimStart = requireStringTrimStart();

	// `String.prototype.trimLeft` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimleft
	// eslint-disable-next-line es/no-string-prototype-trimleft-trimright -- safe
	$({ target: 'String', proto: true, name: 'trimStart', forced: ''.trimLeft !== trimStart }, {
	  trimLeft: trimStart
	});
	return es_string_trimLeft;
}

var hasRequiredEs_string_trimStart;

function requireEs_string_trimStart () {
	if (hasRequiredEs_string_trimStart) return es_string_trimStart;
	hasRequiredEs_string_trimStart = 1;
	// TODO: Remove this line from `core-js@4`
	requireEs_string_trimLeft();
	var $ = require_export();
	var trimStart = requireStringTrimStart();

	// `String.prototype.trimStart` method
	// https://tc39.es/ecma262/#sec-string.prototype.trimstart
	// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
	$({ target: 'String', proto: true, name: 'trimStart', forced: ''.trimStart !== trimStart }, {
	  trimStart: trimStart
	});
	return es_string_trimStart;
}

var es_string_anchor = {};

var createHtml;
var hasRequiredCreateHtml;

function requireCreateHtml () {
	if (hasRequiredCreateHtml) return createHtml;
	hasRequiredCreateHtml = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toString = requireToString();

	var quot = /"/g;
	var replace = uncurryThis(''.replace);

	// `CreateHTML` abstract operation
	// https://tc39.es/ecma262/#sec-createhtml
	createHtml = function (string, tag, attribute, value) {
	  var S = toString(requireObjectCoercible(string));
	  var p1 = '<' + tag;
	  if (attribute !== '') p1 += ' ' + attribute + '="' + replace(toString(value), quot, '&quot;') + '"';
	  return p1 + '>' + S + '</' + tag + '>';
	};
	return createHtml;
}

var stringHtmlForced;
var hasRequiredStringHtmlForced;

function requireStringHtmlForced () {
	if (hasRequiredStringHtmlForced) return stringHtmlForced;
	hasRequiredStringHtmlForced = 1;
	var fails = requireFails();

	// check the existence of a method, lowercase
	// of a tag and escaping quotes in arguments
	stringHtmlForced = function (METHOD_NAME) {
	  return fails(function () {
	    var test = ''[METHOD_NAME]('"');
	    return test !== test.toLowerCase() || test.split('"').length > 3;
	  });
	};
	return stringHtmlForced;
}

var hasRequiredEs_string_anchor;

function requireEs_string_anchor () {
	if (hasRequiredEs_string_anchor) return es_string_anchor;
	hasRequiredEs_string_anchor = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.anchor` method
	// https://tc39.es/ecma262/#sec-string.prototype.anchor
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('anchor') }, {
	  anchor: function anchor(name) {
	    return createHTML(this, 'a', 'name', name);
	  }
	});
	return es_string_anchor;
}

var es_string_big = {};

var hasRequiredEs_string_big;

function requireEs_string_big () {
	if (hasRequiredEs_string_big) return es_string_big;
	hasRequiredEs_string_big = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.big` method
	// https://tc39.es/ecma262/#sec-string.prototype.big
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('big') }, {
	  big: function big() {
	    return createHTML(this, 'big', '', '');
	  }
	});
	return es_string_big;
}

var es_string_blink = {};

var hasRequiredEs_string_blink;

function requireEs_string_blink () {
	if (hasRequiredEs_string_blink) return es_string_blink;
	hasRequiredEs_string_blink = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.blink` method
	// https://tc39.es/ecma262/#sec-string.prototype.blink
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('blink') }, {
	  blink: function blink() {
	    return createHTML(this, 'blink', '', '');
	  }
	});
	return es_string_blink;
}

var es_string_bold = {};

var hasRequiredEs_string_bold;

function requireEs_string_bold () {
	if (hasRequiredEs_string_bold) return es_string_bold;
	hasRequiredEs_string_bold = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.bold` method
	// https://tc39.es/ecma262/#sec-string.prototype.bold
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('bold') }, {
	  bold: function bold() {
	    return createHTML(this, 'b', '', '');
	  }
	});
	return es_string_bold;
}

var es_string_fixed = {};

var hasRequiredEs_string_fixed;

function requireEs_string_fixed () {
	if (hasRequiredEs_string_fixed) return es_string_fixed;
	hasRequiredEs_string_fixed = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.fixed` method
	// https://tc39.es/ecma262/#sec-string.prototype.fixed
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('fixed') }, {
	  fixed: function fixed() {
	    return createHTML(this, 'tt', '', '');
	  }
	});
	return es_string_fixed;
}

var es_string_fontcolor = {};

var hasRequiredEs_string_fontcolor;

function requireEs_string_fontcolor () {
	if (hasRequiredEs_string_fontcolor) return es_string_fontcolor;
	hasRequiredEs_string_fontcolor = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.fontcolor` method
	// https://tc39.es/ecma262/#sec-string.prototype.fontcolor
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('fontcolor') }, {
	  fontcolor: function fontcolor(color) {
	    return createHTML(this, 'font', 'color', color);
	  }
	});
	return es_string_fontcolor;
}

var es_string_fontsize = {};

var hasRequiredEs_string_fontsize;

function requireEs_string_fontsize () {
	if (hasRequiredEs_string_fontsize) return es_string_fontsize;
	hasRequiredEs_string_fontsize = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.fontsize` method
	// https://tc39.es/ecma262/#sec-string.prototype.fontsize
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('fontsize') }, {
	  fontsize: function fontsize(size) {
	    return createHTML(this, 'font', 'size', size);
	  }
	});
	return es_string_fontsize;
}

var es_string_italics = {};

var hasRequiredEs_string_italics;

function requireEs_string_italics () {
	if (hasRequiredEs_string_italics) return es_string_italics;
	hasRequiredEs_string_italics = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.italics` method
	// https://tc39.es/ecma262/#sec-string.prototype.italics
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('italics') }, {
	  italics: function italics() {
	    return createHTML(this, 'i', '', '');
	  }
	});
	return es_string_italics;
}

var es_string_link = {};

var hasRequiredEs_string_link;

function requireEs_string_link () {
	if (hasRequiredEs_string_link) return es_string_link;
	hasRequiredEs_string_link = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.link` method
	// https://tc39.es/ecma262/#sec-string.prototype.link
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('link') }, {
	  link: function link(url) {
	    return createHTML(this, 'a', 'href', url);
	  }
	});
	return es_string_link;
}

var es_string_small = {};

var hasRequiredEs_string_small;

function requireEs_string_small () {
	if (hasRequiredEs_string_small) return es_string_small;
	hasRequiredEs_string_small = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.small` method
	// https://tc39.es/ecma262/#sec-string.prototype.small
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('small') }, {
	  small: function small() {
	    return createHTML(this, 'small', '', '');
	  }
	});
	return es_string_small;
}

var es_string_strike = {};

var hasRequiredEs_string_strike;

function requireEs_string_strike () {
	if (hasRequiredEs_string_strike) return es_string_strike;
	hasRequiredEs_string_strike = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.strike` method
	// https://tc39.es/ecma262/#sec-string.prototype.strike
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('strike') }, {
	  strike: function strike() {
	    return createHTML(this, 'strike', '', '');
	  }
	});
	return es_string_strike;
}

var es_string_sub = {};

var hasRequiredEs_string_sub;

function requireEs_string_sub () {
	if (hasRequiredEs_string_sub) return es_string_sub;
	hasRequiredEs_string_sub = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.sub` method
	// https://tc39.es/ecma262/#sec-string.prototype.sub
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('sub') }, {
	  sub: function sub() {
	    return createHTML(this, 'sub', '', '');
	  }
	});
	return es_string_sub;
}

var es_string_sup = {};

var hasRequiredEs_string_sup;

function requireEs_string_sup () {
	if (hasRequiredEs_string_sup) return es_string_sup;
	hasRequiredEs_string_sup = 1;
	var $ = require_export();
	var createHTML = requireCreateHtml();
	var forcedStringHTMLMethod = requireStringHtmlForced();

	// `String.prototype.sup` method
	// https://tc39.es/ecma262/#sec-string.prototype.sup
	$({ target: 'String', proto: true, forced: forcedStringHTMLMethod('sup') }, {
	  sup: function sup() {
	    return createHTML(this, 'sup', '', '');
	  }
	});
	return es_string_sup;
}

var es_typedArray_float32Array = {};

var typedArrayConstructor = {exports: {}};

var typedArrayConstructorsRequireWrappers;
var hasRequiredTypedArrayConstructorsRequireWrappers;

function requireTypedArrayConstructorsRequireWrappers () {
	if (hasRequiredTypedArrayConstructorsRequireWrappers) return typedArrayConstructorsRequireWrappers;
	hasRequiredTypedArrayConstructorsRequireWrappers = 1;
	/* eslint-disable no-new, sonar/inconsistent-function-call -- required for testing */
	var globalThis = requireGlobalThis();
	var fails = requireFails();
	var checkCorrectnessOfIteration = requireCheckCorrectnessOfIteration();
	var NATIVE_ARRAY_BUFFER_VIEWS = requireArrayBufferViewCore().NATIVE_ARRAY_BUFFER_VIEWS;

	var ArrayBuffer = globalThis.ArrayBuffer;
	var Int8Array = globalThis.Int8Array;

	typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS || !fails(function () {
	  Int8Array(1);
	}) || !fails(function () {
	  new Int8Array(-1);
	}) || !checkCorrectnessOfIteration(function (iterable) {
	  new Int8Array();
	  new Int8Array(null);
	  new Int8Array(1.5);
	  new Int8Array(iterable);
	}, true) || fails(function () {
	  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
	  return new Int8Array(new ArrayBuffer(2), 1, undefined).length !== 1;
	});
	return typedArrayConstructorsRequireWrappers;
}

var toPositiveInteger;
var hasRequiredToPositiveInteger;

function requireToPositiveInteger () {
	if (hasRequiredToPositiveInteger) return toPositiveInteger;
	hasRequiredToPositiveInteger = 1;
	var toIntegerOrInfinity = requireToIntegerOrInfinity();

	var $RangeError = RangeError;

	toPositiveInteger = function (it) {
	  var result = toIntegerOrInfinity(it);
	  if (result < 0) throw new $RangeError("The argument can't be less than 0");
	  return result;
	};
	return toPositiveInteger;
}

var toOffset;
var hasRequiredToOffset;

function requireToOffset () {
	if (hasRequiredToOffset) return toOffset;
	hasRequiredToOffset = 1;
	var toPositiveInteger = requireToPositiveInteger();

	var $RangeError = RangeError;

	toOffset = function (it, BYTES) {
	  var offset = toPositiveInteger(it);
	  if (offset % BYTES) throw new $RangeError('Wrong offset');
	  return offset;
	};
	return toOffset;
}

var toUint8Clamped;
var hasRequiredToUint8Clamped;

function requireToUint8Clamped () {
	if (hasRequiredToUint8Clamped) return toUint8Clamped;
	hasRequiredToUint8Clamped = 1;
	var round = Math.round;

	toUint8Clamped = function (it) {
	  var value = round(it);
	  return value < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
	};
	return toUint8Clamped;
}

var isBigIntArray;
var hasRequiredIsBigIntArray;

function requireIsBigIntArray () {
	if (hasRequiredIsBigIntArray) return isBigIntArray;
	hasRequiredIsBigIntArray = 1;
	var classof = requireClassof();

	isBigIntArray = function (it) {
	  var klass = classof(it);
	  return klass === 'BigInt64Array' || klass === 'BigUint64Array';
	};
	return isBigIntArray;
}

var toBigInt;
var hasRequiredToBigInt;

function requireToBigInt () {
	if (hasRequiredToBigInt) return toBigInt;
	hasRequiredToBigInt = 1;
	var toPrimitive = requireToPrimitive();

	var $TypeError = TypeError;

	// `ToBigInt` abstract operation
	// https://tc39.es/ecma262/#sec-tobigint
	toBigInt = function (argument) {
	  var prim = toPrimitive(argument, 'number');
	  if (typeof prim == 'number') throw new $TypeError("Can't convert number to bigint");
	  // eslint-disable-next-line es/no-bigint -- safe
	  return BigInt(prim);
	};
	return toBigInt;
}

var typedArrayFrom;
var hasRequiredTypedArrayFrom;

function requireTypedArrayFrom () {
	if (hasRequiredTypedArrayFrom) return typedArrayFrom;
	hasRequiredTypedArrayFrom = 1;
	var bind = requireFunctionBindContext();
	var call = requireFunctionCall();
	var aConstructor = requireAConstructor();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var getIterator = requireGetIterator();
	var getIteratorMethod = requireGetIteratorMethod();
	var isArrayIteratorMethod = requireIsArrayIteratorMethod();
	var isBigIntArray = requireIsBigIntArray();
	var aTypedArrayConstructor = requireArrayBufferViewCore().aTypedArrayConstructor;
	var toBigInt = requireToBigInt();

	typedArrayFrom = function from(source /* , mapfn, thisArg */) {
	  var C = aConstructor(this);
	  var O = toObject(source);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var i, length, result, thisIsBigIntArray, value, step, iterator, next;
	  if (iteratorMethod && !isArrayIteratorMethod(iteratorMethod)) {
	    iterator = getIterator(O, iteratorMethod);
	    next = iterator.next;
	    O = [];
	    while (!(step = call(next, iterator)).done) {
	      O.push(step.value);
	    }
	  }
	  if (mapping && argumentsLength > 2) {
	    mapfn = bind(mapfn, arguments[2]);
	  }
	  length = lengthOfArrayLike(O);
	  result = new (aTypedArrayConstructor(C))(length);
	  thisIsBigIntArray = isBigIntArray(result);
	  for (i = 0; length > i; i++) {
	    value = mapping ? mapfn(O[i], i) : O[i];
	    // FF30- typed arrays doesn't properly convert objects to typed array values
	    result[i] = thisIsBigIntArray ? toBigInt(value) : +value;
	  }
	  return result;
	};
	return typedArrayFrom;
}

var hasRequiredTypedArrayConstructor;

function requireTypedArrayConstructor () {
	if (hasRequiredTypedArrayConstructor) return typedArrayConstructor.exports;
	hasRequiredTypedArrayConstructor = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var call = requireFunctionCall();
	var DESCRIPTORS = requireDescriptors();
	var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = requireTypedArrayConstructorsRequireWrappers();
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var ArrayBufferModule = requireArrayBuffer();
	var anInstance = requireAnInstance();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var isIntegralNumber = requireIsIntegralNumber();
	var toLength = requireToLength();
	var toIndex = requireToIndex();
	var toOffset = requireToOffset();
	var toUint8Clamped = requireToUint8Clamped();
	var toPropertyKey = requireToPropertyKey();
	var hasOwn = requireHasOwnProperty();
	var classof = requireClassof();
	var isObject = requireIsObject();
	var isSymbol = requireIsSymbol();
	var create = requireObjectCreate();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var setPrototypeOf = requireObjectSetPrototypeOf();
	var getOwnPropertyNames = requireObjectGetOwnPropertyNames().f;
	var typedArrayFrom = requireTypedArrayFrom();
	var forEach = requireArrayIteration().forEach;
	var setSpecies = requireSetSpecies();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var definePropertyModule = requireObjectDefineProperty();
	var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
	var arrayFromConstructorAndList = requireArrayFromConstructorAndList();
	var InternalStateModule = requireInternalState();
	var inheritIfRequired = requireInheritIfRequired();

	var getInternalState = InternalStateModule.get;
	var setInternalState = InternalStateModule.set;
	var enforceInternalState = InternalStateModule.enforce;
	var nativeDefineProperty = definePropertyModule.f;
	var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
	var RangeError = globalThis.RangeError;
	var ArrayBuffer = ArrayBufferModule.ArrayBuffer;
	var ArrayBufferPrototype = ArrayBuffer.prototype;
	var DataView = ArrayBufferModule.DataView;
	var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
	var TYPED_ARRAY_TAG = ArrayBufferViewCore.TYPED_ARRAY_TAG;
	var TypedArray = ArrayBufferViewCore.TypedArray;
	var TypedArrayPrototype = ArrayBufferViewCore.TypedArrayPrototype;
	var isTypedArray = ArrayBufferViewCore.isTypedArray;
	var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
	var WRONG_LENGTH = 'Wrong length';

	var addGetter = function (it, key) {
	  defineBuiltInAccessor(it, key, {
	    configurable: true,
	    get: function () {
	      return getInternalState(this)[key];
	    }
	  });
	};

	var isArrayBuffer = function (it) {
	  var klass;
	  return isPrototypeOf(ArrayBufferPrototype, it) || (klass = classof(it)) === 'ArrayBuffer' || klass === 'SharedArrayBuffer';
	};

	var isTypedArrayIndex = function (target, key) {
	  return isTypedArray(target)
	    && !isSymbol(key)
	    && key in target
	    && isIntegralNumber(+key)
	    && key >= 0;
	};

	var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
	  key = toPropertyKey(key);
	  return isTypedArrayIndex(target, key)
	    ? createPropertyDescriptor(2, target[key])
	    : nativeGetOwnPropertyDescriptor(target, key);
	};

	var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
	  key = toPropertyKey(key);
	  if (isTypedArrayIndex(target, key)
	    && isObject(descriptor)
	    && hasOwn(descriptor, 'value')
	    && !hasOwn(descriptor, 'get')
	    && !hasOwn(descriptor, 'set')
	    // TODO: add validation descriptor w/o calling accessors
	    && !descriptor.configurable
	    && (!hasOwn(descriptor, 'writable') || descriptor.writable)
	    && (!hasOwn(descriptor, 'enumerable') || descriptor.enumerable)
	  ) {
	    target[key] = descriptor.value;
	    return target;
	  } return nativeDefineProperty(target, key, descriptor);
	};

	if (DESCRIPTORS) {
	  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	    getOwnPropertyDescriptorModule.f = wrappedGetOwnPropertyDescriptor;
	    definePropertyModule.f = wrappedDefineProperty;
	    addGetter(TypedArrayPrototype, 'buffer');
	    addGetter(TypedArrayPrototype, 'byteOffset');
	    addGetter(TypedArrayPrototype, 'byteLength');
	    addGetter(TypedArrayPrototype, 'length');
	  }

	  $({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
	    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
	    defineProperty: wrappedDefineProperty
	  });

	  typedArrayConstructor.exports = function (TYPE, wrapper, CLAMPED) {
	    var BYTES = TYPE.match(/\d+/)[0] / 8;
	    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
	    var GETTER = 'get' + TYPE;
	    var SETTER = 'set' + TYPE;
	    var NativeTypedArrayConstructor = globalThis[CONSTRUCTOR_NAME];
	    var TypedArrayConstructor = NativeTypedArrayConstructor;
	    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
	    var exported = {};

	    var getter = function (that, index) {
	      var data = getInternalState(that);
	      return data.view[GETTER](index * BYTES + data.byteOffset, true);
	    };

	    var setter = function (that, index, value) {
	      var data = getInternalState(that);
	      data.view[SETTER](index * BYTES + data.byteOffset, CLAMPED ? toUint8Clamped(value) : value, true);
	    };

	    var addElement = function (that, index) {
	      nativeDefineProperty(that, index, {
	        get: function () {
	          return getter(this, index);
	        },
	        set: function (value) {
	          return setter(this, index, value);
	        },
	        enumerable: true
	      });
	    };

	    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
	      TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
	        anInstance(that, TypedArrayConstructorPrototype);
	        var index = 0;
	        var byteOffset = 0;
	        var buffer, byteLength, length;
	        if (!isObject(data)) {
	          length = toIndex(data);
	          byteLength = length * BYTES;
	          buffer = new ArrayBuffer(byteLength);
	        } else if (isArrayBuffer(data)) {
	          buffer = data;
	          byteOffset = toOffset(offset, BYTES);
	          var $len = data.byteLength;
	          if ($length === undefined) {
	            if ($len % BYTES) throw new RangeError(WRONG_LENGTH);
	            byteLength = $len - byteOffset;
	            if (byteLength < 0) throw new RangeError(WRONG_LENGTH);
	          } else {
	            byteLength = toLength($length) * BYTES;
	            if (byteLength + byteOffset > $len) throw new RangeError(WRONG_LENGTH);
	          }
	          length = byteLength / BYTES;
	        } else if (isTypedArray(data)) {
	          return arrayFromConstructorAndList(TypedArrayConstructor, data);
	        } else {
	          return call(typedArrayFrom, TypedArrayConstructor, data);
	        }
	        setInternalState(that, {
	          buffer: buffer,
	          byteOffset: byteOffset,
	          byteLength: byteLength,
	          length: length,
	          view: new DataView(buffer)
	        });
	        while (index < length) addElement(that, index++);
	      });

	      if (setPrototypeOf) setPrototypeOf(TypedArrayConstructor, TypedArray);
	      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = create(TypedArrayPrototype);
	    } else if (TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS) {
	      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
	        anInstance(dummy, TypedArrayConstructorPrototype);
	        return inheritIfRequired(function () {
	          if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
	          if (isArrayBuffer(data)) return $length !== undefined
	            ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length)
	            : typedArrayOffset !== undefined
	              ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES))
	              : new NativeTypedArrayConstructor(data);
	          if (isTypedArray(data)) return arrayFromConstructorAndList(TypedArrayConstructor, data);
	          return call(typedArrayFrom, TypedArrayConstructor, data);
	        }(), dummy, TypedArrayConstructor);
	      });

	      if (setPrototypeOf) setPrototypeOf(TypedArrayConstructor, TypedArray);
	      forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
	        if (!(key in TypedArrayConstructor)) {
	          createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
	        }
	      });
	      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
	    }

	    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
	    }

	    enforceInternalState(TypedArrayConstructorPrototype).TypedArrayConstructor = TypedArrayConstructor;

	    if (TYPED_ARRAY_TAG) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
	    }

	    var FORCED = TypedArrayConstructor !== NativeTypedArrayConstructor;

	    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

	    $({ global: true, constructor: true, forced: FORCED, sham: !NATIVE_ARRAY_BUFFER_VIEWS }, exported);

	    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
	      createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
	    }

	    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
	      createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
	    }

	    setSpecies(CONSTRUCTOR_NAME);
	  };
	} else typedArrayConstructor.exports = function () { /* empty */ };
	return typedArrayConstructor.exports;
}

var hasRequiredEs_typedArray_float32Array;

function requireEs_typedArray_float32Array () {
	if (hasRequiredEs_typedArray_float32Array) return es_typedArray_float32Array;
	hasRequiredEs_typedArray_float32Array = 1;
	var createTypedArrayConstructor = requireTypedArrayConstructor();

	// `Float32Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	createTypedArrayConstructor('Float32', function (init) {
	  return function Float32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});
	return es_typedArray_float32Array;
}

var es_typedArray_float64Array = {};

var hasRequiredEs_typedArray_float64Array;

function requireEs_typedArray_float64Array () {
	if (hasRequiredEs_typedArray_float64Array) return es_typedArray_float64Array;
	hasRequiredEs_typedArray_float64Array = 1;
	var createTypedArrayConstructor = requireTypedArrayConstructor();

	// `Float64Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	createTypedArrayConstructor('Float64', function (init) {
	  return function Float64Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});
	return es_typedArray_float64Array;
}

var es_typedArray_int8Array = {};

var hasRequiredEs_typedArray_int8Array;

function requireEs_typedArray_int8Array () {
	if (hasRequiredEs_typedArray_int8Array) return es_typedArray_int8Array;
	hasRequiredEs_typedArray_int8Array = 1;
	var createTypedArrayConstructor = requireTypedArrayConstructor();

	// `Int8Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	createTypedArrayConstructor('Int8', function (init) {
	  return function Int8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});
	return es_typedArray_int8Array;
}

var es_typedArray_int16Array = {};

var hasRequiredEs_typedArray_int16Array;

function requireEs_typedArray_int16Array () {
	if (hasRequiredEs_typedArray_int16Array) return es_typedArray_int16Array;
	hasRequiredEs_typedArray_int16Array = 1;
	var createTypedArrayConstructor = requireTypedArrayConstructor();

	// `Int16Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	createTypedArrayConstructor('Int16', function (init) {
	  return function Int16Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});
	return es_typedArray_int16Array;
}

var es_typedArray_int32Array = {};

var hasRequiredEs_typedArray_int32Array;

function requireEs_typedArray_int32Array () {
	if (hasRequiredEs_typedArray_int32Array) return es_typedArray_int32Array;
	hasRequiredEs_typedArray_int32Array = 1;
	var createTypedArrayConstructor = requireTypedArrayConstructor();

	// `Int32Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	createTypedArrayConstructor('Int32', function (init) {
	  return function Int32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});
	return es_typedArray_int32Array;
}

var es_typedArray_uint8Array = {};

var hasRequiredEs_typedArray_uint8Array;

function requireEs_typedArray_uint8Array () {
	if (hasRequiredEs_typedArray_uint8Array) return es_typedArray_uint8Array;
	hasRequiredEs_typedArray_uint8Array = 1;
	var createTypedArrayConstructor = requireTypedArrayConstructor();

	// `Uint8Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	createTypedArrayConstructor('Uint8', function (init) {
	  return function Uint8Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});
	return es_typedArray_uint8Array;
}

var es_typedArray_uint8ClampedArray = {};

var hasRequiredEs_typedArray_uint8ClampedArray;

function requireEs_typedArray_uint8ClampedArray () {
	if (hasRequiredEs_typedArray_uint8ClampedArray) return es_typedArray_uint8ClampedArray;
	hasRequiredEs_typedArray_uint8ClampedArray = 1;
	var createTypedArrayConstructor = requireTypedArrayConstructor();

	// `Uint8ClampedArray` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	createTypedArrayConstructor('Uint8', function (init) {
	  return function Uint8ClampedArray(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	}, true);
	return es_typedArray_uint8ClampedArray;
}

var es_typedArray_uint16Array = {};

var hasRequiredEs_typedArray_uint16Array;

function requireEs_typedArray_uint16Array () {
	if (hasRequiredEs_typedArray_uint16Array) return es_typedArray_uint16Array;
	hasRequiredEs_typedArray_uint16Array = 1;
	var createTypedArrayConstructor = requireTypedArrayConstructor();

	// `Uint16Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	createTypedArrayConstructor('Uint16', function (init) {
	  return function Uint16Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});
	return es_typedArray_uint16Array;
}

var es_typedArray_uint32Array = {};

var hasRequiredEs_typedArray_uint32Array;

function requireEs_typedArray_uint32Array () {
	if (hasRequiredEs_typedArray_uint32Array) return es_typedArray_uint32Array;
	hasRequiredEs_typedArray_uint32Array = 1;
	var createTypedArrayConstructor = requireTypedArrayConstructor();

	// `Uint32Array` constructor
	// https://tc39.es/ecma262/#sec-typedarray-objects
	createTypedArrayConstructor('Uint32', function (init) {
	  return function Uint32Array(data, byteOffset, length) {
	    return init(this, data, byteOffset, length);
	  };
	});
	return es_typedArray_uint32Array;
}

var es_typedArray_at = {};

var hasRequiredEs_typedArray_at;

function requireEs_typedArray_at () {
	if (hasRequiredEs_typedArray_at) return es_typedArray_at;
	hasRequiredEs_typedArray_at = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.at` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.at
	exportTypedArrayMethod('at', function at(index) {
	  var O = aTypedArray(this);
	  var len = lengthOfArrayLike(O);
	  var relativeIndex = toIntegerOrInfinity(index);
	  var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
	  return (k < 0 || k >= len) ? undefined : O[k];
	});
	return es_typedArray_at;
}

var es_typedArray_copyWithin = {};

var hasRequiredEs_typedArray_copyWithin;

function requireEs_typedArray_copyWithin () {
	if (hasRequiredEs_typedArray_copyWithin) return es_typedArray_copyWithin;
	hasRequiredEs_typedArray_copyWithin = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $ArrayCopyWithin = requireArrayCopyWithin();

	var u$ArrayCopyWithin = uncurryThis($ArrayCopyWithin);
	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.copyWithin` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
	exportTypedArrayMethod('copyWithin', function copyWithin(target, start /* , end */) {
	  return u$ArrayCopyWithin(aTypedArray(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
	});
	return es_typedArray_copyWithin;
}

var es_typedArray_every = {};

var hasRequiredEs_typedArray_every;

function requireEs_typedArray_every () {
	if (hasRequiredEs_typedArray_every) return es_typedArray_every;
	hasRequiredEs_typedArray_every = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $every = requireArrayIteration().every;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.every` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
	exportTypedArrayMethod('every', function every(callbackfn /* , thisArg */) {
	  return $every(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_every;
}

var es_typedArray_fill = {};

var hasRequiredEs_typedArray_fill;

function requireEs_typedArray_fill () {
	if (hasRequiredEs_typedArray_fill) return es_typedArray_fill;
	hasRequiredEs_typedArray_fill = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $fill = requireArrayFill();
	var toBigInt = requireToBigInt();
	var classof = requireClassof();
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var fails = requireFails();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
	var slice = uncurryThis(''.slice);

	// V8 ~ Chrome < 59, Safari < 14.1, FF < 55, Edge <=18
	var CONVERSION_BUG = fails(function () {
	  var count = 0;
	  // eslint-disable-next-line es/no-typed-arrays -- safe
	  new Int8Array(2).fill({ valueOf: function () { return count++; } });
	  return count !== 1;
	});

	// `%TypedArray%.prototype.fill` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
	exportTypedArrayMethod('fill', function fill(value /* , start, end */) {
	  var length = arguments.length;
	  aTypedArray(this);
	  var actualValue = slice(classof(this), 0, 3) === 'Big' ? toBigInt(value) : +value;
	  return call($fill, this, actualValue, length > 1 ? arguments[1] : undefined, length > 2 ? arguments[2] : undefined);
	}, CONVERSION_BUG);
	return es_typedArray_fill;
}

var es_typedArray_filter = {};

var typedArraySpeciesConstructor;
var hasRequiredTypedArraySpeciesConstructor;

function requireTypedArraySpeciesConstructor () {
	if (hasRequiredTypedArraySpeciesConstructor) return typedArraySpeciesConstructor;
	hasRequiredTypedArraySpeciesConstructor = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var speciesConstructor = requireSpeciesConstructor();

	var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;
	var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;

	// a part of `TypedArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#typedarray-species-create
	typedArraySpeciesConstructor = function (originalArray) {
	  return aTypedArrayConstructor(speciesConstructor(originalArray, getTypedArrayConstructor(originalArray)));
	};
	return typedArraySpeciesConstructor;
}

var typedArrayFromSpeciesAndList;
var hasRequiredTypedArrayFromSpeciesAndList;

function requireTypedArrayFromSpeciesAndList () {
	if (hasRequiredTypedArrayFromSpeciesAndList) return typedArrayFromSpeciesAndList;
	hasRequiredTypedArrayFromSpeciesAndList = 1;
	var arrayFromConstructorAndList = requireArrayFromConstructorAndList();
	var typedArraySpeciesConstructor = requireTypedArraySpeciesConstructor();

	typedArrayFromSpeciesAndList = function (instance, list) {
	  return arrayFromConstructorAndList(typedArraySpeciesConstructor(instance), list);
	};
	return typedArrayFromSpeciesAndList;
}

var hasRequiredEs_typedArray_filter;

function requireEs_typedArray_filter () {
	if (hasRequiredEs_typedArray_filter) return es_typedArray_filter;
	hasRequiredEs_typedArray_filter = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $filter = requireArrayIteration().filter;
	var fromSpeciesAndList = requireTypedArrayFromSpeciesAndList();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.filter` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
	exportTypedArrayMethod('filter', function filter(callbackfn /* , thisArg */) {
	  var list = $filter(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  return fromSpeciesAndList(this, list);
	});
	return es_typedArray_filter;
}

var es_typedArray_find = {};

var hasRequiredEs_typedArray_find;

function requireEs_typedArray_find () {
	if (hasRequiredEs_typedArray_find) return es_typedArray_find;
	hasRequiredEs_typedArray_find = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $find = requireArrayIteration().find;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.find` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
	exportTypedArrayMethod('find', function find(predicate /* , thisArg */) {
	  return $find(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_find;
}

var es_typedArray_findIndex = {};

var hasRequiredEs_typedArray_findIndex;

function requireEs_typedArray_findIndex () {
	if (hasRequiredEs_typedArray_findIndex) return es_typedArray_findIndex;
	hasRequiredEs_typedArray_findIndex = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $findIndex = requireArrayIteration().findIndex;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.findIndex` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
	exportTypedArrayMethod('findIndex', function findIndex(predicate /* , thisArg */) {
	  return $findIndex(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_findIndex;
}

var es_typedArray_findLast = {};

var hasRequiredEs_typedArray_findLast;

function requireEs_typedArray_findLast () {
	if (hasRequiredEs_typedArray_findLast) return es_typedArray_findLast;
	hasRequiredEs_typedArray_findLast = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $findLast = requireArrayIterationFromLast().findLast;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.findLast` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findlast
	exportTypedArrayMethod('findLast', function findLast(predicate /* , thisArg */) {
	  return $findLast(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_findLast;
}

var es_typedArray_findLastIndex = {};

var hasRequiredEs_typedArray_findLastIndex;

function requireEs_typedArray_findLastIndex () {
	if (hasRequiredEs_typedArray_findLastIndex) return es_typedArray_findLastIndex;
	hasRequiredEs_typedArray_findLastIndex = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $findLastIndex = requireArrayIterationFromLast().findLastIndex;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.findLastIndex` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findlastindex
	exportTypedArrayMethod('findLastIndex', function findLastIndex(predicate /* , thisArg */) {
	  return $findLastIndex(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_findLastIndex;
}

var es_typedArray_forEach = {};

var hasRequiredEs_typedArray_forEach;

function requireEs_typedArray_forEach () {
	if (hasRequiredEs_typedArray_forEach) return es_typedArray_forEach;
	hasRequiredEs_typedArray_forEach = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $forEach = requireArrayIteration().forEach;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.forEach` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
	exportTypedArrayMethod('forEach', function forEach(callbackfn /* , thisArg */) {
	  $forEach(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_forEach;
}

var es_typedArray_from = {};

var hasRequiredEs_typedArray_from;

function requireEs_typedArray_from () {
	if (hasRequiredEs_typedArray_from) return es_typedArray_from;
	hasRequiredEs_typedArray_from = 1;
	var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = requireTypedArrayConstructorsRequireWrappers();
	var exportTypedArrayStaticMethod = requireArrayBufferViewCore().exportTypedArrayStaticMethod;
	var typedArrayFrom = requireTypedArrayFrom();

	// `%TypedArray%.from` method
	// https://tc39.es/ecma262/#sec-%typedarray%.from
	exportTypedArrayStaticMethod('from', typedArrayFrom, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);
	return es_typedArray_from;
}

var es_typedArray_includes = {};

var hasRequiredEs_typedArray_includes;

function requireEs_typedArray_includes () {
	if (hasRequiredEs_typedArray_includes) return es_typedArray_includes;
	hasRequiredEs_typedArray_includes = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $includes = requireArrayIncludes().includes;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.includes` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
	exportTypedArrayMethod('includes', function includes(searchElement /* , fromIndex */) {
	  return $includes(aTypedArray(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_includes;
}

var es_typedArray_indexOf = {};

var hasRequiredEs_typedArray_indexOf;

function requireEs_typedArray_indexOf () {
	if (hasRequiredEs_typedArray_indexOf) return es_typedArray_indexOf;
	hasRequiredEs_typedArray_indexOf = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $indexOf = requireArrayIncludes().indexOf;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.indexOf` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
	exportTypedArrayMethod('indexOf', function indexOf(searchElement /* , fromIndex */) {
	  return $indexOf(aTypedArray(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_indexOf;
}

var es_typedArray_iterator = {};

var hasRequiredEs_typedArray_iterator;

function requireEs_typedArray_iterator () {
	if (hasRequiredEs_typedArray_iterator) return es_typedArray_iterator;
	hasRequiredEs_typedArray_iterator = 1;
	var globalThis = requireGlobalThis();
	var fails = requireFails();
	var uncurryThis = requireFunctionUncurryThis();
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var ArrayIterators = requireEs_array_iterator();
	var wellKnownSymbol = requireWellKnownSymbol();

	var ITERATOR = wellKnownSymbol('iterator');
	var Uint8Array = globalThis.Uint8Array;
	var arrayValues = uncurryThis(ArrayIterators.values);
	var arrayKeys = uncurryThis(ArrayIterators.keys);
	var arrayEntries = uncurryThis(ArrayIterators.entries);
	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
	var TypedArrayPrototype = Uint8Array && Uint8Array.prototype;

	var GENERIC = !fails(function () {
	  TypedArrayPrototype[ITERATOR].call([1]);
	});

	var ITERATOR_IS_VALUES = !!TypedArrayPrototype
	  && TypedArrayPrototype.values
	  && TypedArrayPrototype[ITERATOR] === TypedArrayPrototype.values
	  && TypedArrayPrototype.values.name === 'values';

	var typedArrayValues = function values() {
	  return arrayValues(aTypedArray(this));
	};

	// `%TypedArray%.prototype.entries` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
	exportTypedArrayMethod('entries', function entries() {
	  return arrayEntries(aTypedArray(this));
	}, GENERIC);
	// `%TypedArray%.prototype.keys` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
	exportTypedArrayMethod('keys', function keys() {
	  return arrayKeys(aTypedArray(this));
	}, GENERIC);
	// `%TypedArray%.prototype.values` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
	exportTypedArrayMethod('values', typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });
	// `%TypedArray%.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
	exportTypedArrayMethod(ITERATOR, typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });
	return es_typedArray_iterator;
}

var es_typedArray_join = {};

var hasRequiredEs_typedArray_join;

function requireEs_typedArray_join () {
	if (hasRequiredEs_typedArray_join) return es_typedArray_join;
	hasRequiredEs_typedArray_join = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var uncurryThis = requireFunctionUncurryThis();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
	var $join = uncurryThis([].join);

	// `%TypedArray%.prototype.join` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
	exportTypedArrayMethod('join', function join(separator) {
	  return $join(aTypedArray(this), separator);
	});
	return es_typedArray_join;
}

var es_typedArray_lastIndexOf = {};

var hasRequiredEs_typedArray_lastIndexOf;

function requireEs_typedArray_lastIndexOf () {
	if (hasRequiredEs_typedArray_lastIndexOf) return es_typedArray_lastIndexOf;
	hasRequiredEs_typedArray_lastIndexOf = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var apply = requireFunctionApply();
	var $lastIndexOf = requireArrayLastIndexOf();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.lastIndexOf` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
	exportTypedArrayMethod('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
	  var length = arguments.length;
	  return apply($lastIndexOf, aTypedArray(this), length > 1 ? [searchElement, arguments[1]] : [searchElement]);
	});
	return es_typedArray_lastIndexOf;
}

var es_typedArray_map = {};

var hasRequiredEs_typedArray_map;

function requireEs_typedArray_map () {
	if (hasRequiredEs_typedArray_map) return es_typedArray_map;
	hasRequiredEs_typedArray_map = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $map = requireArrayIteration().map;
	var typedArraySpeciesConstructor = requireTypedArraySpeciesConstructor();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.map` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
	exportTypedArrayMethod('map', function map(mapfn /* , thisArg */) {
	  return $map(aTypedArray(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
	    return new (typedArraySpeciesConstructor(O))(length);
	  });
	});
	return es_typedArray_map;
}

var es_typedArray_of = {};

var hasRequiredEs_typedArray_of;

function requireEs_typedArray_of () {
	if (hasRequiredEs_typedArray_of) return es_typedArray_of;
	hasRequiredEs_typedArray_of = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = requireTypedArrayConstructorsRequireWrappers();

	var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayStaticMethod = ArrayBufferViewCore.exportTypedArrayStaticMethod;

	// `%TypedArray%.of` method
	// https://tc39.es/ecma262/#sec-%typedarray%.of
	exportTypedArrayStaticMethod('of', function of(/* ...items */) {
	  var index = 0;
	  var length = arguments.length;
	  var result = new (aTypedArrayConstructor(this))(length);
	  while (length > index) result[index] = arguments[index++];
	  return result;
	}, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);
	return es_typedArray_of;
}

var es_typedArray_reduce = {};

var hasRequiredEs_typedArray_reduce;

function requireEs_typedArray_reduce () {
	if (hasRequiredEs_typedArray_reduce) return es_typedArray_reduce;
	hasRequiredEs_typedArray_reduce = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $reduce = requireArrayReduce().left;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.reduce` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
	exportTypedArrayMethod('reduce', function reduce(callbackfn /* , initialValue */) {
	  var length = arguments.length;
	  return $reduce(aTypedArray(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_reduce;
}

var es_typedArray_reduceRight = {};

var hasRequiredEs_typedArray_reduceRight;

function requireEs_typedArray_reduceRight () {
	if (hasRequiredEs_typedArray_reduceRight) return es_typedArray_reduceRight;
	hasRequiredEs_typedArray_reduceRight = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $reduceRight = requireArrayReduce().right;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.reduceRight` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
	exportTypedArrayMethod('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
	  var length = arguments.length;
	  return $reduceRight(aTypedArray(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_reduceRight;
}

var es_typedArray_reverse = {};

var hasRequiredEs_typedArray_reverse;

function requireEs_typedArray_reverse () {
	if (hasRequiredEs_typedArray_reverse) return es_typedArray_reverse;
	hasRequiredEs_typedArray_reverse = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
	var floor = Math.floor;

	// `%TypedArray%.prototype.reverse` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
	exportTypedArrayMethod('reverse', function reverse() {
	  var that = this;
	  var length = aTypedArray(that).length;
	  var middle = floor(length / 2);
	  var index = 0;
	  var value;
	  while (index < middle) {
	    value = that[index];
	    that[index++] = that[--length];
	    that[length] = value;
	  } return that;
	});
	return es_typedArray_reverse;
}

var es_typedArray_set = {};

var hasRequiredEs_typedArray_set;

function requireEs_typedArray_set () {
	if (hasRequiredEs_typedArray_set) return es_typedArray_set;
	hasRequiredEs_typedArray_set = 1;
	var globalThis = requireGlobalThis();
	var call = requireFunctionCall();
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var toOffset = requireToOffset();
	var toIndexedObject = requireToObject();
	var fails = requireFails();

	var RangeError = globalThis.RangeError;
	var Int8Array = globalThis.Int8Array;
	var Int8ArrayPrototype = Int8Array && Int8Array.prototype;
	var $set = Int8ArrayPrototype && Int8ArrayPrototype.set;
	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	var WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS = !fails(function () {
	  // eslint-disable-next-line es/no-typed-arrays -- required for testing
	  var array = new Uint8ClampedArray(2);
	  call($set, array, { length: 1, 0: 3 }, 1);
	  return array[1] !== 3;
	});

	// https://bugs.chromium.org/p/v8/issues/detail?id=11294 and other
	var TO_OBJECT_BUG = WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS && ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS && fails(function () {
	  var array = new Int8Array(2);
	  array.set(1);
	  array.set('2', 1);
	  return array[0] !== 0 || array[1] !== 2;
	});

	// `%TypedArray%.prototype.set` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
	exportTypedArrayMethod('set', function set(arrayLike /* , offset */) {
	  aTypedArray(this);
	  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
	  var src = toIndexedObject(arrayLike);
	  if (WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS) return call($set, this, src, offset);
	  var length = this.length;
	  var len = lengthOfArrayLike(src);
	  var index = 0;
	  if (len + offset > length) throw new RangeError('Wrong length');
	  while (index < len) this[offset + index] = src[index++];
	}, !WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS || TO_OBJECT_BUG);
	return es_typedArray_set;
}

var es_typedArray_slice = {};

var hasRequiredEs_typedArray_slice;

function requireEs_typedArray_slice () {
	if (hasRequiredEs_typedArray_slice) return es_typedArray_slice;
	hasRequiredEs_typedArray_slice = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var typedArraySpeciesConstructor = requireTypedArraySpeciesConstructor();
	var fails = requireFails();
	var arraySlice = requireArraySlice();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	var FORCED = fails(function () {
	  // eslint-disable-next-line es/no-typed-arrays -- required for testing
	  new Int8Array(1).slice();
	});

	// `%TypedArray%.prototype.slice` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
	exportTypedArrayMethod('slice', function slice(start, end) {
	  var list = arraySlice(aTypedArray(this), start, end);
	  var C = typedArraySpeciesConstructor(this);
	  var index = 0;
	  var length = list.length;
	  var result = new C(length);
	  while (length > index) result[index] = list[index++];
	  return result;
	}, FORCED);
	return es_typedArray_slice;
}

var es_typedArray_some = {};

var hasRequiredEs_typedArray_some;

function requireEs_typedArray_some () {
	if (hasRequiredEs_typedArray_some) return es_typedArray_some;
	hasRequiredEs_typedArray_some = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $some = requireArrayIteration().some;

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.some` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
	exportTypedArrayMethod('some', function some(callbackfn /* , thisArg */) {
	  return $some(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	});
	return es_typedArray_some;
}

var es_typedArray_sort = {};

var hasRequiredEs_typedArray_sort;

function requireEs_typedArray_sort () {
	if (hasRequiredEs_typedArray_sort) return es_typedArray_sort;
	hasRequiredEs_typedArray_sort = 1;
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThisClause();
	var fails = requireFails();
	var aCallable = requireACallable();
	var internalSort = requireArraySort();
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var FF = requireEnvironmentFfVersion();
	var IE_OR_EDGE = requireEnvironmentIsIeOrEdge();
	var V8 = requireEnvironmentV8Version();
	var WEBKIT = requireEnvironmentWebkitVersion();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
	var Uint16Array = globalThis.Uint16Array;
	var nativeSort = Uint16Array && uncurryThis(Uint16Array.prototype.sort);

	// WebKit
	var ACCEPT_INCORRECT_ARGUMENTS = !!nativeSort && !(fails(function () {
	  nativeSort(new Uint16Array(2), null);
	}) && fails(function () {
	  nativeSort(new Uint16Array(2), {});
	}));

	var STABLE_SORT = !!nativeSort && !fails(function () {
	  // feature detection can be too slow, so check engines versions
	  if (V8) return V8 < 74;
	  if (FF) return FF < 67;
	  if (IE_OR_EDGE) return true;
	  if (WEBKIT) return WEBKIT < 602;

	  var array = new Uint16Array(516);
	  var expected = Array(516);
	  var index, mod;

	  for (index = 0; index < 516; index++) {
	    mod = index % 4;
	    array[index] = 515 - index;
	    expected[index] = index - 2 * mod + 3;
	  }

	  nativeSort(array, function (a, b) {
	    return (a / 4 | 0) - (b / 4 | 0);
	  });

	  for (index = 0; index < 516; index++) {
	    if (array[index] !== expected[index]) return true;
	  }
	});

	var getSortCompare = function (comparefn) {
	  return function (x, y) {
	    if (comparefn !== undefined) return +comparefn(x, y) || 0;
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (y !== y) return -1;
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (x !== x) return 1;
	    if (x === 0 && y === 0) return 1 / x > 0 && 1 / y < 0 ? 1 : -1;
	    return x > y;
	  };
	};

	// `%TypedArray%.prototype.sort` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.sort
	exportTypedArrayMethod('sort', function sort(comparefn) {
	  if (comparefn !== undefined) aCallable(comparefn);
	  if (STABLE_SORT) return nativeSort(this, comparefn);

	  return internalSort(aTypedArray(this), getSortCompare(comparefn));
	}, !STABLE_SORT || ACCEPT_INCORRECT_ARGUMENTS);
	return es_typedArray_sort;
}

var es_typedArray_subarray = {};

var hasRequiredEs_typedArray_subarray;

function requireEs_typedArray_subarray () {
	if (hasRequiredEs_typedArray_subarray) return es_typedArray_subarray;
	hasRequiredEs_typedArray_subarray = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var toLength = requireToLength();
	var toAbsoluteIndex = requireToAbsoluteIndex();
	var typedArraySpeciesConstructor = requireTypedArraySpeciesConstructor();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.subarray` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
	exportTypedArrayMethod('subarray', function subarray(begin, end) {
	  var O = aTypedArray(this);
	  var length = O.length;
	  var beginIndex = toAbsoluteIndex(begin, length);
	  var C = typedArraySpeciesConstructor(O);
	  return new C(
	    O.buffer,
	    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
	    toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
	  );
	});
	return es_typedArray_subarray;
}

var es_typedArray_toLocaleString = {};

var hasRequiredEs_typedArray_toLocaleString;

function requireEs_typedArray_toLocaleString () {
	if (hasRequiredEs_typedArray_toLocaleString) return es_typedArray_toLocaleString;
	hasRequiredEs_typedArray_toLocaleString = 1;
	var globalThis = requireGlobalThis();
	var apply = requireFunctionApply();
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var fails = requireFails();
	var arraySlice = requireArraySlice();

	var Int8Array = globalThis.Int8Array;
	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
	var $toLocaleString = [].toLocaleString;

	// iOS Safari 6.x fails here
	var TO_LOCALE_STRING_BUG = !!Int8Array && fails(function () {
	  $toLocaleString.call(new Int8Array(1));
	});

	var FORCED = fails(function () {
	  return [1, 2].toLocaleString() !== new Int8Array([1, 2]).toLocaleString();
	}) || !fails(function () {
	  Int8Array.prototype.toLocaleString.call([1, 2]);
	});

	// `%TypedArray%.prototype.toLocaleString` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
	exportTypedArrayMethod('toLocaleString', function toLocaleString() {
	  return apply(
	    $toLocaleString,
	    TO_LOCALE_STRING_BUG ? arraySlice(aTypedArray(this)) : aTypedArray(this),
	    arraySlice(arguments)
	  );
	}, FORCED);
	return es_typedArray_toLocaleString;
}

var es_typedArray_toReversed = {};

var hasRequiredEs_typedArray_toReversed;

function requireEs_typedArray_toReversed () {
	if (hasRequiredEs_typedArray_toReversed) return es_typedArray_toReversed;
	hasRequiredEs_typedArray_toReversed = 1;
	var arrayToReversed = requireArrayToReversed();
	var ArrayBufferViewCore = requireArrayBufferViewCore();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
	var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;

	// `%TypedArray%.prototype.toReversed` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.toreversed
	exportTypedArrayMethod('toReversed', function toReversed() {
	  return arrayToReversed(aTypedArray(this), getTypedArrayConstructor(this));
	});
	return es_typedArray_toReversed;
}

var es_typedArray_toSorted = {};

var hasRequiredEs_typedArray_toSorted;

function requireEs_typedArray_toSorted () {
	if (hasRequiredEs_typedArray_toSorted) return es_typedArray_toSorted;
	hasRequiredEs_typedArray_toSorted = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var uncurryThis = requireFunctionUncurryThis();
	var aCallable = requireACallable();
	var arrayFromConstructorAndList = requireArrayFromConstructorAndList();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
	var sort = uncurryThis(ArrayBufferViewCore.TypedArrayPrototype.sort);

	// `%TypedArray%.prototype.toSorted` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tosorted
	exportTypedArrayMethod('toSorted', function toSorted(compareFn) {
	  if (compareFn !== undefined) aCallable(compareFn);
	  var O = aTypedArray(this);
	  var A = arrayFromConstructorAndList(getTypedArrayConstructor(O), O);
	  return sort(A, compareFn);
	});
	return es_typedArray_toSorted;
}

var es_typedArray_toString = {};

var hasRequiredEs_typedArray_toString;

function requireEs_typedArray_toString () {
	if (hasRequiredEs_typedArray_toString) return es_typedArray_toString;
	hasRequiredEs_typedArray_toString = 1;
	var exportTypedArrayMethod = requireArrayBufferViewCore().exportTypedArrayMethod;
	var fails = requireFails();
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();

	var Uint8Array = globalThis.Uint8Array;
	var Uint8ArrayPrototype = Uint8Array && Uint8Array.prototype || {};
	var arrayToString = [].toString;
	var join = uncurryThis([].join);

	if (fails(function () { arrayToString.call({}); })) {
	  arrayToString = function toString() {
	    return join(this);
	  };
	}

	var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString !== arrayToString;

	// `%TypedArray%.prototype.toString` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
	exportTypedArrayMethod('toString', arrayToString, IS_NOT_ARRAY_METHOD);
	return es_typedArray_toString;
}

var es_typedArray_with = {};

var hasRequiredEs_typedArray_with;

function requireEs_typedArray_with () {
	if (hasRequiredEs_typedArray_with) return es_typedArray_with;
	hasRequiredEs_typedArray_with = 1;
	var arrayWith = requireArrayWith();
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var isBigIntArray = requireIsBigIntArray();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var toBigInt = requireToBigInt();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	var PROPER_ORDER = !!function () {
	  try {
	    // eslint-disable-next-line no-throw-literal, es/no-typed-arrays, es/no-array-prototype-with -- required for testing
	    new Int8Array(1)['with'](2, { valueOf: function () { throw 8; } });
	  } catch (error) {
	    // some early implementations, like WebKit, does not follow the final semantic
	    // https://github.com/tc39/proposal-change-array-by-copy/pull/86
	    return error === 8;
	  }
	}();

	// `%TypedArray%.prototype.with` method
	// https://tc39.es/ecma262/#sec-%typedarray%.prototype.with
	exportTypedArrayMethod('with', { 'with': function (index, value) {
	  var O = aTypedArray(this);
	  var relativeIndex = toIntegerOrInfinity(index);
	  var actualValue = isBigIntArray(O) ? toBigInt(value) : +value;
	  return arrayWith(O, getTypedArrayConstructor(O), relativeIndex, actualValue);
	} }['with'], !PROPER_ORDER);
	return es_typedArray_with;
}

var es_unescape = {};

var hasRequiredEs_unescape;

function requireEs_unescape () {
	if (hasRequiredEs_unescape) return es_unescape;
	hasRequiredEs_unescape = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var toString = requireToString();

	var fromCharCode = String.fromCharCode;
	var charAt = uncurryThis(''.charAt);
	var exec = uncurryThis(/./.exec);
	var stringSlice = uncurryThis(''.slice);

	var hex2 = /^[\da-f]{2}$/i;
	var hex4 = /^[\da-f]{4}$/i;

	// `unescape` method
	// https://tc39.es/ecma262/#sec-unescape-string
	$({ global: true }, {
	  unescape: function unescape(string) {
	    var str = toString(string);
	    var result = '';
	    var length = str.length;
	    var index = 0;
	    var chr, part;
	    while (index < length) {
	      chr = charAt(str, index++);
	      if (chr === '%') {
	        if (charAt(str, index) === 'u') {
	          part = stringSlice(str, index + 1, index + 5);
	          if (exec(hex4, part)) {
	            result += fromCharCode(parseInt(part, 16));
	            index += 5;
	            continue;
	          }
	        } else {
	          part = stringSlice(str, index, index + 2);
	          if (exec(hex2, part)) {
	            result += fromCharCode(parseInt(part, 16));
	            index += 2;
	            continue;
	          }
	        }
	      }
	      result += chr;
	    } return result;
	  }
	});
	return es_unescape;
}

var es_weakMap = {};

var es_weakMap_constructor = {};

var collectionWeak;
var hasRequiredCollectionWeak;

function requireCollectionWeak () {
	if (hasRequiredCollectionWeak) return collectionWeak;
	hasRequiredCollectionWeak = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var defineBuiltIns = requireDefineBuiltIns();
	var getWeakData = requireInternalMetadata().getWeakData;
	var anInstance = requireAnInstance();
	var anObject = requireAnObject();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var isObject = requireIsObject();
	var iterate = requireIterate();
	var ArrayIterationModule = requireArrayIteration();
	var hasOwn = requireHasOwnProperty();
	var InternalStateModule = requireInternalState();

	var setInternalState = InternalStateModule.set;
	var internalStateGetterFor = InternalStateModule.getterFor;
	var find = ArrayIterationModule.find;
	var findIndex = ArrayIterationModule.findIndex;
	var splice = uncurryThis([].splice);
	var id = 0;

	// fallback for uncaught frozen keys
	var uncaughtFrozenStore = function (state) {
	  return state.frozen || (state.frozen = new UncaughtFrozenStore());
	};

	var UncaughtFrozenStore = function () {
	  this.entries = [];
	};

	var findUncaughtFrozen = function (store, key) {
	  return find(store.entries, function (it) {
	    return it[0] === key;
	  });
	};

	UncaughtFrozenStore.prototype = {
	  get: function (key) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) return entry[1];
	  },
	  has: function (key) {
	    return !!findUncaughtFrozen(this, key);
	  },
	  set: function (key, value) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) entry[1] = value;
	    else this.entries.push([key, value]);
	  },
	  'delete': function (key) {
	    var index = findIndex(this.entries, function (it) {
	      return it[0] === key;
	    });
	    if (~index) splice(this.entries, index, 1);
	    return !!~index;
	  }
	};

	collectionWeak = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var Constructor = wrapper(function (that, iterable) {
	      anInstance(that, Prototype);
	      setInternalState(that, {
	        type: CONSTRUCTOR_NAME,
	        id: id++,
	        frozen: null
	      });
	      if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
	    });

	    var Prototype = Constructor.prototype;

	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var data = getWeakData(anObject(key), true);
	      if (data === true) uncaughtFrozenStore(state).set(key, value);
	      else data[state.id] = value;
	      return that;
	    };

	    defineBuiltIns(Prototype, {
	      // `{ WeakMap, WeakSet }.prototype.delete(key)` methods
	      // https://tc39.es/ecma262/#sec-weakmap.prototype.delete
	      // https://tc39.es/ecma262/#sec-weakset.prototype.delete
	      'delete': function (key) {
	        var state = getInternalState(this);
	        if (!isObject(key)) return false;
	        var data = getWeakData(key);
	        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
	        return data && hasOwn(data, state.id) && delete data[state.id];
	      },
	      // `{ WeakMap, WeakSet }.prototype.has(key)` methods
	      // https://tc39.es/ecma262/#sec-weakmap.prototype.has
	      // https://tc39.es/ecma262/#sec-weakset.prototype.has
	      has: function has(key) {
	        var state = getInternalState(this);
	        if (!isObject(key)) return false;
	        var data = getWeakData(key);
	        if (data === true) return uncaughtFrozenStore(state).has(key);
	        return data && hasOwn(data, state.id);
	      }
	    });

	    defineBuiltIns(Prototype, IS_MAP ? {
	      // `WeakMap.prototype.get(key)` method
	      // https://tc39.es/ecma262/#sec-weakmap.prototype.get
	      get: function get(key) {
	        var state = getInternalState(this);
	        if (isObject(key)) {
	          var data = getWeakData(key);
	          if (data === true) return uncaughtFrozenStore(state).get(key);
	          if (data) return data[state.id];
	        }
	      },
	      // `WeakMap.prototype.set(key, value)` method
	      // https://tc39.es/ecma262/#sec-weakmap.prototype.set
	      set: function set(key, value) {
	        return define(this, key, value);
	      }
	    } : {
	      // `WeakSet.prototype.add(value)` method
	      // https://tc39.es/ecma262/#sec-weakset.prototype.add
	      add: function add(value) {
	        return define(this, value, true);
	      }
	    });

	    return Constructor;
	  }
	};
	return collectionWeak;
}

var hasRequiredEs_weakMap_constructor;

function requireEs_weakMap_constructor () {
	if (hasRequiredEs_weakMap_constructor) return es_weakMap_constructor;
	hasRequiredEs_weakMap_constructor = 1;
	var FREEZING = requireFreezing();
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();
	var defineBuiltIns = requireDefineBuiltIns();
	var InternalMetadataModule = requireInternalMetadata();
	var collection = requireCollection();
	var collectionWeak = requireCollectionWeak();
	var isObject = requireIsObject();
	var enforceInternalState = requireInternalState().enforce;
	var fails = requireFails();
	var NATIVE_WEAK_MAP = requireWeakMapBasicDetection();

	var $Object = Object;
	// eslint-disable-next-line es/no-array-isarray -- safe
	var isArray = Array.isArray;
	// eslint-disable-next-line es/no-object-isextensible -- safe
	var isExtensible = $Object.isExtensible;
	// eslint-disable-next-line es/no-object-isfrozen -- safe
	var isFrozen = $Object.isFrozen;
	// eslint-disable-next-line es/no-object-issealed -- safe
	var isSealed = $Object.isSealed;
	// eslint-disable-next-line es/no-object-freeze -- safe
	var freeze = $Object.freeze;
	// eslint-disable-next-line es/no-object-seal -- safe
	var seal = $Object.seal;

	var IS_IE11 = !globalThis.ActiveXObject && 'ActiveXObject' in globalThis;
	var InternalWeakMap;

	var wrapper = function (init) {
	  return function WeakMap() {
	    return init(this, arguments.length ? arguments[0] : undefined);
	  };
	};

	// `WeakMap` constructor
	// https://tc39.es/ecma262/#sec-weakmap-constructor
	var $WeakMap = collection('WeakMap', wrapper, collectionWeak);
	var WeakMapPrototype = $WeakMap.prototype;
	var nativeSet = uncurryThis(WeakMapPrototype.set);

	// Chakra Edge bug: adding frozen arrays to WeakMap unfreeze them
	var hasMSEdgeFreezingBug = function () {
	  return FREEZING && fails(function () {
	    var frozenArray = freeze([]);
	    nativeSet(new $WeakMap(), frozenArray, 1);
	    return !isFrozen(frozenArray);
	  });
	};

	// IE11 WeakMap frozen keys fix
	// We can't use feature detection because it crash some old IE builds
	// https://github.com/zloirock/core-js/issues/485
	if (NATIVE_WEAK_MAP) if (IS_IE11) {
	  InternalWeakMap = collectionWeak.getConstructor(wrapper, 'WeakMap', true);
	  InternalMetadataModule.enable();
	  var nativeDelete = uncurryThis(WeakMapPrototype['delete']);
	  var nativeHas = uncurryThis(WeakMapPrototype.has);
	  var nativeGet = uncurryThis(WeakMapPrototype.get);
	  defineBuiltIns(WeakMapPrototype, {
	    'delete': function (key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceInternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeDelete(this, key) || state.frozen['delete'](key);
	      } return nativeDelete(this, key);
	    },
	    has: function has(key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceInternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeHas(this, key) || state.frozen.has(key);
	      } return nativeHas(this, key);
	    },
	    get: function get(key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceInternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeHas(this, key) ? nativeGet(this, key) : state.frozen.get(key);
	      } return nativeGet(this, key);
	    },
	    set: function set(key, value) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceInternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        nativeHas(this, key) ? nativeSet(this, key, value) : state.frozen.set(key, value);
	      } else nativeSet(this, key, value);
	      return this;
	    }
	  });
	// Chakra Edge frozen keys fix
	} else if (hasMSEdgeFreezingBug()) {
	  defineBuiltIns(WeakMapPrototype, {
	    set: function set(key, value) {
	      var arrayIntegrityLevel;
	      if (isArray(key)) {
	        if (isFrozen(key)) arrayIntegrityLevel = freeze;
	        else if (isSealed(key)) arrayIntegrityLevel = seal;
	      }
	      nativeSet(this, key, value);
	      if (arrayIntegrityLevel) arrayIntegrityLevel(key);
	      return this;
	    }
	  });
	}
	return es_weakMap_constructor;
}

var hasRequiredEs_weakMap;

function requireEs_weakMap () {
	if (hasRequiredEs_weakMap) return es_weakMap;
	hasRequiredEs_weakMap = 1;
	// TODO: Remove this module from `core-js@4` since it's replaced to module below
	requireEs_weakMap_constructor();
	return es_weakMap;
}

var es_weakSet = {};

var es_weakSet_constructor = {};

var hasRequiredEs_weakSet_constructor;

function requireEs_weakSet_constructor () {
	if (hasRequiredEs_weakSet_constructor) return es_weakSet_constructor;
	hasRequiredEs_weakSet_constructor = 1;
	var collection = requireCollection();
	var collectionWeak = requireCollectionWeak();

	// `WeakSet` constructor
	// https://tc39.es/ecma262/#sec-weakset-constructor
	collection('WeakSet', function (init) {
	  return function WeakSet() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionWeak);
	return es_weakSet_constructor;
}

var hasRequiredEs_weakSet;

function requireEs_weakSet () {
	if (hasRequiredEs_weakSet) return es_weakSet;
	hasRequiredEs_weakSet = 1;
	// TODO: Remove this module from `core-js@4` since it's replaced to module below
	requireEs_weakSet_constructor();
	return es_weakSet;
}

var esnext_aggregateError = {};

var hasRequiredEsnext_aggregateError;

function requireEsnext_aggregateError () {
	if (hasRequiredEsnext_aggregateError) return esnext_aggregateError;
	hasRequiredEsnext_aggregateError = 1;
	// TODO: Remove from `core-js@4`
	requireEs_aggregateError();
	return esnext_aggregateError;
}

var esnext_suppressedError_constructor = {};

var hasRequiredEsnext_suppressedError_constructor;

function requireEsnext_suppressedError_constructor () {
	if (hasRequiredEsnext_suppressedError_constructor) return esnext_suppressedError_constructor;
	hasRequiredEsnext_suppressedError_constructor = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var setPrototypeOf = requireObjectSetPrototypeOf();
	var copyConstructorProperties = requireCopyConstructorProperties();
	var create = requireObjectCreate();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();
	var installErrorStack = requireErrorStackInstall();
	var normalizeStringArgument = requireNormalizeStringArgument();
	var wellKnownSymbol = requireWellKnownSymbol();
	var fails = requireFails();
	var IS_PURE = requireIsPure();

	var NativeSuppressedError = globalThis.SuppressedError;
	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var $Error = Error;

	// https://github.com/oven-sh/bun/issues/9282
	var WRONG_ARITY = !!NativeSuppressedError && NativeSuppressedError.length !== 3;

	// https://github.com/oven-sh/bun/issues/9283
	var EXTRA_ARGS_SUPPORT = !!NativeSuppressedError && fails(function () {
	  return new NativeSuppressedError(1, 2, 3, { cause: 4 }).cause === 4;
	});

	var PATCH = WRONG_ARITY || EXTRA_ARGS_SUPPORT;

	var $SuppressedError = function SuppressedError(error, suppressed, message) {
	  var isInstance = isPrototypeOf(SuppressedErrorPrototype, this);
	  var that;
	  if (setPrototypeOf) {
	    that = PATCH && (!isInstance || getPrototypeOf(this) === SuppressedErrorPrototype)
	      ? new NativeSuppressedError()
	      : setPrototypeOf(new $Error(), isInstance ? getPrototypeOf(this) : SuppressedErrorPrototype);
	  } else {
	    that = isInstance ? this : create(SuppressedErrorPrototype);
	    createNonEnumerableProperty(that, TO_STRING_TAG, 'Error');
	  }
	  if (message !== undefined) createNonEnumerableProperty(that, 'message', normalizeStringArgument(message));
	  installErrorStack(that, $SuppressedError, that.stack, 1);
	  createNonEnumerableProperty(that, 'error', error);
	  createNonEnumerableProperty(that, 'suppressed', suppressed);
	  return that;
	};

	if (setPrototypeOf) setPrototypeOf($SuppressedError, $Error);
	else copyConstructorProperties($SuppressedError, $Error, { name: true });

	var SuppressedErrorPrototype = $SuppressedError.prototype = PATCH ? NativeSuppressedError.prototype : create($Error.prototype, {
	  constructor: createPropertyDescriptor(1, $SuppressedError),
	  message: createPropertyDescriptor(1, ''),
	  name: createPropertyDescriptor(1, 'SuppressedError')
	});

	if (PATCH && !IS_PURE) SuppressedErrorPrototype.constructor = $SuppressedError;

	// `SuppressedError` constructor
	// https://github.com/tc39/proposal-explicit-resource-management
	$({ global: true, constructor: true, arity: 3, forced: PATCH }, {
	  SuppressedError: $SuppressedError
	});
	return esnext_suppressedError_constructor;
}

var esnext_array_fromAsync = {};

var asyncIteratorPrototype;
var hasRequiredAsyncIteratorPrototype;

function requireAsyncIteratorPrototype () {
	if (hasRequiredAsyncIteratorPrototype) return asyncIteratorPrototype;
	hasRequiredAsyncIteratorPrototype = 1;
	var globalThis = requireGlobalThis();
	var shared = requireSharedStore();
	var isCallable = requireIsCallable();
	var create = requireObjectCreate();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var defineBuiltIn = requireDefineBuiltIn();
	var wellKnownSymbol = requireWellKnownSymbol();
	var IS_PURE = requireIsPure();

	var USE_FUNCTION_CONSTRUCTOR = 'USE_FUNCTION_CONSTRUCTOR';
	var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');
	var AsyncIterator = globalThis.AsyncIterator;
	var PassedAsyncIteratorPrototype = shared.AsyncIteratorPrototype;
	var AsyncIteratorPrototype, prototype;

	if (PassedAsyncIteratorPrototype) {
	  AsyncIteratorPrototype = PassedAsyncIteratorPrototype;
	} else if (isCallable(AsyncIterator)) {
	  AsyncIteratorPrototype = AsyncIterator.prototype;
	} else if (shared[USE_FUNCTION_CONSTRUCTOR] || globalThis[USE_FUNCTION_CONSTRUCTOR]) {
	  try {
	    // eslint-disable-next-line no-new-func -- we have no alternatives without usage of modern syntax
	    prototype = getPrototypeOf(getPrototypeOf(getPrototypeOf(Function('return async function*(){}()')())));
	    if (getPrototypeOf(prototype) === Object.prototype) AsyncIteratorPrototype = prototype;
	  } catch (error) { /* empty */ }
	}

	if (!AsyncIteratorPrototype) AsyncIteratorPrototype = {};
	else if (IS_PURE) AsyncIteratorPrototype = create(AsyncIteratorPrototype);

	if (!isCallable(AsyncIteratorPrototype[ASYNC_ITERATOR])) {
	  defineBuiltIn(AsyncIteratorPrototype, ASYNC_ITERATOR, function () {
	    return this;
	  });
	}

	asyncIteratorPrototype = AsyncIteratorPrototype;
	return asyncIteratorPrototype;
}

var asyncFromSyncIterator;
var hasRequiredAsyncFromSyncIterator;

function requireAsyncFromSyncIterator () {
	if (hasRequiredAsyncFromSyncIterator) return asyncFromSyncIterator;
	hasRequiredAsyncFromSyncIterator = 1;
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var create = requireObjectCreate();
	var getMethod = requireGetMethod();
	var defineBuiltIns = requireDefineBuiltIns();
	var InternalStateModule = requireInternalState();
	var getBuiltIn = requireGetBuiltIn();
	var AsyncIteratorPrototype = requireAsyncIteratorPrototype();
	var createIterResultObject = requireCreateIterResultObject();

	var Promise = getBuiltIn('Promise');

	var ASYNC_FROM_SYNC_ITERATOR = 'AsyncFromSyncIterator';
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(ASYNC_FROM_SYNC_ITERATOR);

	var asyncFromSyncIteratorContinuation = function (result, resolve, reject) {
	  var done = result.done;
	  Promise.resolve(result.value).then(function (value) {
	    resolve(createIterResultObject(value, done));
	  }, reject);
	};

	var AsyncFromSyncIterator = function AsyncIterator(iteratorRecord) {
	  iteratorRecord.type = ASYNC_FROM_SYNC_ITERATOR;
	  setInternalState(this, iteratorRecord);
	};

	AsyncFromSyncIterator.prototype = defineBuiltIns(create(AsyncIteratorPrototype), {
	  next: function next() {
	    var state = getInternalState(this);
	    return new Promise(function (resolve, reject) {
	      var result = anObject(call(state.next, state.iterator));
	      asyncFromSyncIteratorContinuation(result, resolve, reject);
	    });
	  },
	  'return': function () {
	    var iterator = getInternalState(this).iterator;
	    return new Promise(function (resolve, reject) {
	      var $return = getMethod(iterator, 'return');
	      if ($return === undefined) return resolve(createIterResultObject(undefined, true));
	      var result = anObject(call($return, iterator));
	      asyncFromSyncIteratorContinuation(result, resolve, reject);
	    });
	  }
	});

	asyncFromSyncIterator = AsyncFromSyncIterator;
	return asyncFromSyncIterator;
}

var getAsyncIterator;
var hasRequiredGetAsyncIterator;

function requireGetAsyncIterator () {
	if (hasRequiredGetAsyncIterator) return getAsyncIterator;
	hasRequiredGetAsyncIterator = 1;
	var call = requireFunctionCall();
	var AsyncFromSyncIterator = requireAsyncFromSyncIterator();
	var anObject = requireAnObject();
	var getIterator = requireGetIterator();
	var getIteratorDirect = requireGetIteratorDirect();
	var getMethod = requireGetMethod();
	var wellKnownSymbol = requireWellKnownSymbol();

	var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');

	getAsyncIterator = function (it, usingIterator) {
	  var method = arguments.length < 2 ? getMethod(it, ASYNC_ITERATOR) : usingIterator;
	  return method ? anObject(call(method, it)) : new AsyncFromSyncIterator(getIteratorDirect(getIterator(it)));
	};
	return getAsyncIterator;
}

var asyncIteratorClose;
var hasRequiredAsyncIteratorClose;

function requireAsyncIteratorClose () {
	if (hasRequiredAsyncIteratorClose) return asyncIteratorClose;
	hasRequiredAsyncIteratorClose = 1;
	var call = requireFunctionCall();
	var getBuiltIn = requireGetBuiltIn();
	var getMethod = requireGetMethod();

	asyncIteratorClose = function (iterator, method, argument, reject) {
	  try {
	    var returnMethod = getMethod(iterator, 'return');
	    if (returnMethod) {
	      return getBuiltIn('Promise').resolve(call(returnMethod, iterator)).then(function () {
	        method(argument);
	      }, function (error) {
	        reject(error);
	      });
	    }
	  } catch (error2) {
	    return reject(error2);
	  } method(argument);
	};
	return asyncIteratorClose;
}

var asyncIteratorIteration;
var hasRequiredAsyncIteratorIteration;

function requireAsyncIteratorIteration () {
	if (hasRequiredAsyncIteratorIteration) return asyncIteratorIteration;
	hasRequiredAsyncIteratorIteration = 1;
	// https://github.com/tc39/proposal-iterator-helpers
	// https://github.com/tc39/proposal-array-from-async
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var isObject = requireIsObject();
	var doesNotExceedSafeInteger = requireDoesNotExceedSafeInteger();
	var getBuiltIn = requireGetBuiltIn();
	var getIteratorDirect = requireGetIteratorDirect();
	var closeAsyncIteration = requireAsyncIteratorClose();

	var createMethod = function (TYPE) {
	  var IS_TO_ARRAY = TYPE === 0;
	  var IS_FOR_EACH = TYPE === 1;
	  var IS_EVERY = TYPE === 2;
	  var IS_SOME = TYPE === 3;
	  return function (object, fn, target) {
	    anObject(object);
	    var MAPPING = fn !== undefined;
	    if (MAPPING || !IS_TO_ARRAY) aCallable(fn);
	    var record = getIteratorDirect(object);
	    var Promise = getBuiltIn('Promise');
	    var iterator = record.iterator;
	    var next = record.next;
	    var counter = 0;

	    return new Promise(function (resolve, reject) {
	      var ifAbruptCloseAsyncIterator = function (error) {
	        closeAsyncIteration(iterator, reject, error, reject);
	      };

	      var loop = function () {
	        try {
	          if (MAPPING) try {
	            doesNotExceedSafeInteger(counter);
	          } catch (error5) { ifAbruptCloseAsyncIterator(error5); }
	          Promise.resolve(anObject(call(next, iterator))).then(function (step) {
	            try {
	              if (anObject(step).done) {
	                if (IS_TO_ARRAY) {
	                  target.length = counter;
	                  resolve(target);
	                } else resolve(IS_SOME ? false : IS_EVERY || undefined);
	              } else {
	                var value = step.value;
	                try {
	                  if (MAPPING) {
	                    var result = fn(value, counter);

	                    var handler = function ($result) {
	                      if (IS_FOR_EACH) {
	                        loop();
	                      } else if (IS_EVERY) {
	                        $result ? loop() : closeAsyncIteration(iterator, resolve, false, reject);
	                      } else if (IS_TO_ARRAY) {
	                        try {
	                          target[counter++] = $result;
	                          loop();
	                        } catch (error4) { ifAbruptCloseAsyncIterator(error4); }
	                      } else {
	                        $result ? closeAsyncIteration(iterator, resolve, IS_SOME || value, reject) : loop();
	                      }
	                    };

	                    if (isObject(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
	                    else handler(result);
	                  } else {
	                    target[counter++] = value;
	                    loop();
	                  }
	                } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
	              }
	            } catch (error2) { reject(error2); }
	          }, reject);
	        } catch (error) { reject(error); }
	      };

	      loop();
	    });
	  };
	};

	asyncIteratorIteration = {
	  toArray: createMethod(0),
	  forEach: createMethod(1),
	  every: createMethod(2),
	  some: createMethod(3),
	  find: createMethod(4)
	};
	return asyncIteratorIteration;
}

var arrayFromAsync;
var hasRequiredArrayFromAsync;

function requireArrayFromAsync () {
	if (hasRequiredArrayFromAsync) return arrayFromAsync;
	hasRequiredArrayFromAsync = 1;
	var bind = requireFunctionBindContext();
	var uncurryThis = requireFunctionUncurryThis();
	var toObject = requireToObject();
	var isConstructor = requireIsConstructor();
	var getAsyncIterator = requireGetAsyncIterator();
	var getIterator = requireGetIterator();
	var getIteratorDirect = requireGetIteratorDirect();
	var getIteratorMethod = requireGetIteratorMethod();
	var getMethod = requireGetMethod();
	var getBuiltIn = requireGetBuiltIn();
	var getBuiltInPrototypeMethod = requireGetBuiltInPrototypeMethod();
	var wellKnownSymbol = requireWellKnownSymbol();
	var AsyncFromSyncIterator = requireAsyncFromSyncIterator();
	var toArray = requireAsyncIteratorIteration().toArray;

	var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');
	var arrayIterator = uncurryThis(getBuiltInPrototypeMethod('Array', 'values'));
	var arrayIteratorNext = uncurryThis(arrayIterator([]).next);

	var safeArrayIterator = function () {
	  return new SafeArrayIterator(this);
	};

	var SafeArrayIterator = function (O) {
	  this.iterator = arrayIterator(O);
	};

	SafeArrayIterator.prototype.next = function () {
	  return arrayIteratorNext(this.iterator);
	};

	// `Array.fromAsync` method implementation
	// https://github.com/tc39/proposal-array-from-async
	arrayFromAsync = function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
	  var C = this;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var thisArg = argumentsLength > 2 ? arguments[2] : undefined;
	  return new (getBuiltIn('Promise'))(function (resolve) {
	    var O = toObject(asyncItems);
	    if (mapfn !== undefined) mapfn = bind(mapfn, thisArg);
	    var usingAsyncIterator = getMethod(O, ASYNC_ITERATOR);
	    var usingSyncIterator = usingAsyncIterator ? undefined : getIteratorMethod(O) || safeArrayIterator;
	    var A = isConstructor(C) ? new C() : [];
	    var iterator = usingAsyncIterator
	      ? getAsyncIterator(O, usingAsyncIterator)
	      : new AsyncFromSyncIterator(getIteratorDirect(getIterator(O, usingSyncIterator)));
	    resolve(toArray(iterator, mapfn, A));
	  });
	};
	return arrayFromAsync;
}

var hasRequiredEsnext_array_fromAsync;

function requireEsnext_array_fromAsync () {
	if (hasRequiredEsnext_array_fromAsync) return esnext_array_fromAsync;
	hasRequiredEsnext_array_fromAsync = 1;
	var $ = require_export();
	var fromAsync = requireArrayFromAsync();
	var fails = requireFails();

	var nativeFromAsync = Array.fromAsync;
	// https://bugs.webkit.org/show_bug.cgi?id=271703
	var INCORRECT_CONSTRUCTURING = !nativeFromAsync || fails(function () {
	  var counter = 0;
	  nativeFromAsync.call(function () {
	    counter++;
	    return [];
	  }, { length: 0 });
	  return counter !== 1;
	});

	// `Array.fromAsync` method
	// https://github.com/tc39/proposal-array-from-async
	$({ target: 'Array', stat: true, forced: INCORRECT_CONSTRUCTURING }, {
	  fromAsync: fromAsync
	});
	return esnext_array_fromAsync;
}

var esnext_array_at = {};

var hasRequiredEsnext_array_at;

function requireEsnext_array_at () {
	if (hasRequiredEsnext_array_at) return esnext_array_at;
	hasRequiredEsnext_array_at = 1;
	// TODO: Remove from `core-js@4`
	requireEs_array_at();
	return esnext_array_at;
}

var esnext_array_filterOut = {};

var hasRequiredEsnext_array_filterOut;

function requireEsnext_array_filterOut () {
	if (hasRequiredEsnext_array_filterOut) return esnext_array_filterOut;
	hasRequiredEsnext_array_filterOut = 1;
	// TODO: remove from `core-js@4`
	var $ = require_export();
	var $filterReject = requireArrayIteration().filterReject;
	var addToUnscopables = requireAddToUnscopables();

	// `Array.prototype.filterOut` method
	// https://github.com/tc39/proposal-array-filtering
	$({ target: 'Array', proto: true, forced: true }, {
	  filterOut: function filterOut(callbackfn /* , thisArg */) {
	    return $filterReject(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	addToUnscopables('filterOut');
	return esnext_array_filterOut;
}

var esnext_array_filterReject = {};

var hasRequiredEsnext_array_filterReject;

function requireEsnext_array_filterReject () {
	if (hasRequiredEsnext_array_filterReject) return esnext_array_filterReject;
	hasRequiredEsnext_array_filterReject = 1;
	var $ = require_export();
	var $filterReject = requireArrayIteration().filterReject;
	var addToUnscopables = requireAddToUnscopables();

	// `Array.prototype.filterReject` method
	// https://github.com/tc39/proposal-array-filtering
	$({ target: 'Array', proto: true, forced: true }, {
	  filterReject: function filterReject(callbackfn /* , thisArg */) {
	    return $filterReject(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	addToUnscopables('filterReject');
	return esnext_array_filterReject;
}

var esnext_array_findLast = {};

var hasRequiredEsnext_array_findLast;

function requireEsnext_array_findLast () {
	if (hasRequiredEsnext_array_findLast) return esnext_array_findLast;
	hasRequiredEsnext_array_findLast = 1;
	// TODO: Remove from `core-js@4`
	requireEs_array_findLast();
	return esnext_array_findLast;
}

var esnext_array_findLastIndex = {};

var hasRequiredEsnext_array_findLastIndex;

function requireEsnext_array_findLastIndex () {
	if (hasRequiredEsnext_array_findLastIndex) return esnext_array_findLastIndex;
	hasRequiredEsnext_array_findLastIndex = 1;
	// TODO: Remove from `core-js@4`
	requireEs_array_findLastIndex();
	return esnext_array_findLastIndex;
}

var esnext_array_group = {};

var arrayGroup;
var hasRequiredArrayGroup;

function requireArrayGroup () {
	if (hasRequiredArrayGroup) return arrayGroup;
	hasRequiredArrayGroup = 1;
	var bind = requireFunctionBindContext();
	var uncurryThis = requireFunctionUncurryThis();
	var IndexedObject = requireIndexedObject();
	var toObject = requireToObject();
	var toPropertyKey = requireToPropertyKey();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var objectCreate = requireObjectCreate();
	var arrayFromConstructorAndList = requireArrayFromConstructorAndList();

	var $Array = Array;
	var push = uncurryThis([].push);

	arrayGroup = function ($this, callbackfn, that, specificConstructor) {
	  var O = toObject($this);
	  var self = IndexedObject(O);
	  var boundFunction = bind(callbackfn, that);
	  var target = objectCreate(null);
	  var length = lengthOfArrayLike(self);
	  var index = 0;
	  var Constructor, key, value;
	  for (;length > index; index++) {
	    value = self[index];
	    key = toPropertyKey(boundFunction(value, index, O));
	    // in some IE versions, `hasOwnProperty` returns incorrect result on integer keys
	    // but since it's a `null` prototype object, we can safely use `in`
	    if (key in target) push(target[key], value);
	    else target[key] = [value];
	  }
	  // TODO: Remove this block from `core-js@4`
	  if (specificConstructor) {
	    Constructor = specificConstructor(O);
	    if (Constructor !== $Array) {
	      for (key in target) target[key] = arrayFromConstructorAndList(Constructor, target[key]);
	    }
	  } return target;
	};
	return arrayGroup;
}

var hasRequiredEsnext_array_group;

function requireEsnext_array_group () {
	if (hasRequiredEsnext_array_group) return esnext_array_group;
	hasRequiredEsnext_array_group = 1;
	var $ = require_export();
	var $group = requireArrayGroup();
	var addToUnscopables = requireAddToUnscopables();

	// `Array.prototype.group` method
	// https://github.com/tc39/proposal-array-grouping
	$({ target: 'Array', proto: true }, {
	  group: function group(callbackfn /* , thisArg */) {
	    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
	    return $group(this, callbackfn, thisArg);
	  }
	});

	addToUnscopables('group');
	return esnext_array_group;
}

var esnext_array_groupBy = {};

var hasRequiredEsnext_array_groupBy;

function requireEsnext_array_groupBy () {
	if (hasRequiredEsnext_array_groupBy) return esnext_array_groupBy;
	hasRequiredEsnext_array_groupBy = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var $group = requireArrayGroup();
	var arrayMethodIsStrict = requireArrayMethodIsStrict();
	var addToUnscopables = requireAddToUnscopables();

	// `Array.prototype.groupBy` method
	// https://github.com/tc39/proposal-array-grouping
	// https://bugs.webkit.org/show_bug.cgi?id=236541
	$({ target: 'Array', proto: true, forced: !arrayMethodIsStrict('groupBy') }, {
	  groupBy: function groupBy(callbackfn /* , thisArg */) {
	    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
	    return $group(this, callbackfn, thisArg);
	  }
	});

	addToUnscopables('groupBy');
	return esnext_array_groupBy;
}

var esnext_array_groupByToMap = {};

var arrayGroupToMap;
var hasRequiredArrayGroupToMap;

function requireArrayGroupToMap () {
	if (hasRequiredArrayGroupToMap) return arrayGroupToMap;
	hasRequiredArrayGroupToMap = 1;
	var bind = requireFunctionBindContext();
	var uncurryThis = requireFunctionUncurryThis();
	var IndexedObject = requireIndexedObject();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var MapHelpers = requireMapHelpers();

	var Map = MapHelpers.Map;
	var mapGet = MapHelpers.get;
	var mapHas = MapHelpers.has;
	var mapSet = MapHelpers.set;
	var push = uncurryThis([].push);

	// `Array.prototype.groupToMap` method
	// https://github.com/tc39/proposal-array-grouping
	arrayGroupToMap = function groupToMap(callbackfn /* , thisArg */) {
	  var O = toObject(this);
	  var self = IndexedObject(O);
	  var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  var map = new Map();
	  var length = lengthOfArrayLike(self);
	  var index = 0;
	  var key, value;
	  for (;length > index; index++) {
	    value = self[index];
	    key = boundFunction(value, index, O);
	    if (mapHas(map, key)) push(mapGet(map, key), value);
	    else mapSet(map, key, [value]);
	  } return map;
	};
	return arrayGroupToMap;
}

var hasRequiredEsnext_array_groupByToMap;

function requireEsnext_array_groupByToMap () {
	if (hasRequiredEsnext_array_groupByToMap) return esnext_array_groupByToMap;
	hasRequiredEsnext_array_groupByToMap = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var arrayMethodIsStrict = requireArrayMethodIsStrict();
	var addToUnscopables = requireAddToUnscopables();
	var $groupToMap = requireArrayGroupToMap();
	var IS_PURE = requireIsPure();

	// `Array.prototype.groupByToMap` method
	// https://github.com/tc39/proposal-array-grouping
	// https://bugs.webkit.org/show_bug.cgi?id=236541
	$({ target: 'Array', proto: true, name: 'groupToMap', forced: IS_PURE || !arrayMethodIsStrict('groupByToMap') }, {
	  groupByToMap: $groupToMap
	});

	addToUnscopables('groupByToMap');
	return esnext_array_groupByToMap;
}

var esnext_array_groupToMap = {};

var hasRequiredEsnext_array_groupToMap;

function requireEsnext_array_groupToMap () {
	if (hasRequiredEsnext_array_groupToMap) return esnext_array_groupToMap;
	hasRequiredEsnext_array_groupToMap = 1;
	var $ = require_export();
	var addToUnscopables = requireAddToUnscopables();
	var $groupToMap = requireArrayGroupToMap();
	var IS_PURE = requireIsPure();

	// `Array.prototype.groupToMap` method
	// https://github.com/tc39/proposal-array-grouping
	$({ target: 'Array', proto: true, forced: IS_PURE }, {
	  groupToMap: $groupToMap
	});

	addToUnscopables('groupToMap');
	return esnext_array_groupToMap;
}

var esnext_array_isTemplateObject = {};

var hasRequiredEsnext_array_isTemplateObject;

function requireEsnext_array_isTemplateObject () {
	if (hasRequiredEsnext_array_isTemplateObject) return esnext_array_isTemplateObject;
	hasRequiredEsnext_array_isTemplateObject = 1;
	var $ = require_export();
	var isArray = requireIsArray();

	// eslint-disable-next-line es/no-object-isfrozen -- safe
	var isFrozen = Object.isFrozen;

	var isFrozenStringArray = function (array, allowUndefined) {
	  if (!isFrozen || !isArray(array) || !isFrozen(array)) return false;
	  var index = 0;
	  var length = array.length;
	  var element;
	  while (index < length) {
	    element = array[index++];
	    if (!(typeof element == 'string' || (allowUndefined && element === undefined))) {
	      return false;
	    }
	  } return length !== 0;
	};

	// `Array.isTemplateObject` method
	// https://github.com/tc39/proposal-array-is-template-object
	$({ target: 'Array', stat: true, sham: true, forced: true }, {
	  isTemplateObject: function isTemplateObject(value) {
	    if (!isFrozenStringArray(value, true)) return false;
	    var raw = value.raw;
	    return raw.length === value.length && isFrozenStringArray(raw, false);
	  }
	});
	return esnext_array_isTemplateObject;
}

var esnext_array_lastIndex = {};

var hasRequiredEsnext_array_lastIndex;

function requireEsnext_array_lastIndex () {
	if (hasRequiredEsnext_array_lastIndex) return esnext_array_lastIndex;
	hasRequiredEsnext_array_lastIndex = 1;
	// TODO: Remove from `core-js@4`
	var DESCRIPTORS = requireDescriptors();
	var addToUnscopables = requireAddToUnscopables();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();

	// `Array.prototype.lastIndex` getter
	// https://github.com/keithamus/proposal-array-last
	if (DESCRIPTORS) {
	  defineBuiltInAccessor(Array.prototype, 'lastIndex', {
	    configurable: true,
	    get: function lastIndex() {
	      var O = toObject(this);
	      var len = lengthOfArrayLike(O);
	      return len === 0 ? 0 : len - 1;
	    }
	  });

	  addToUnscopables('lastIndex');
	}
	return esnext_array_lastIndex;
}

var esnext_array_lastItem = {};

var hasRequiredEsnext_array_lastItem;

function requireEsnext_array_lastItem () {
	if (hasRequiredEsnext_array_lastItem) return esnext_array_lastItem;
	hasRequiredEsnext_array_lastItem = 1;
	// TODO: Remove from `core-js@4`
	var DESCRIPTORS = requireDescriptors();
	var addToUnscopables = requireAddToUnscopables();
	var toObject = requireToObject();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();

	// `Array.prototype.lastIndex` accessor
	// https://github.com/keithamus/proposal-array-last
	if (DESCRIPTORS) {
	  defineBuiltInAccessor(Array.prototype, 'lastItem', {
	    configurable: true,
	    get: function lastItem() {
	      var O = toObject(this);
	      var len = lengthOfArrayLike(O);
	      return len === 0 ? undefined : O[len - 1];
	    },
	    set: function lastItem(value) {
	      var O = toObject(this);
	      var len = lengthOfArrayLike(O);
	      return O[len === 0 ? 0 : len - 1] = value;
	    }
	  });

	  addToUnscopables('lastItem');
	}
	return esnext_array_lastItem;
}

var esnext_array_toReversed = {};

var hasRequiredEsnext_array_toReversed;

function requireEsnext_array_toReversed () {
	if (hasRequiredEsnext_array_toReversed) return esnext_array_toReversed;
	hasRequiredEsnext_array_toReversed = 1;
	// TODO: Remove from `core-js@4`
	requireEs_array_toReversed();
	return esnext_array_toReversed;
}

var esnext_array_toSorted = {};

var hasRequiredEsnext_array_toSorted;

function requireEsnext_array_toSorted () {
	if (hasRequiredEsnext_array_toSorted) return esnext_array_toSorted;
	hasRequiredEsnext_array_toSorted = 1;
	// TODO: Remove from `core-js@4`
	requireEs_array_toSorted();
	return esnext_array_toSorted;
}

var esnext_array_toSpliced = {};

var hasRequiredEsnext_array_toSpliced;

function requireEsnext_array_toSpliced () {
	if (hasRequiredEsnext_array_toSpliced) return esnext_array_toSpliced;
	hasRequiredEsnext_array_toSpliced = 1;
	// TODO: Remove from `core-js@4`
	requireEs_array_toSpliced();
	return esnext_array_toSpliced;
}

var esnext_array_uniqueBy = {};

var mapIterate;
var hasRequiredMapIterate;

function requireMapIterate () {
	if (hasRequiredMapIterate) return mapIterate;
	hasRequiredMapIterate = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var iterateSimple = requireIterateSimple();
	var MapHelpers = requireMapHelpers();

	var Map = MapHelpers.Map;
	var MapPrototype = MapHelpers.proto;
	var forEach = uncurryThis(MapPrototype.forEach);
	var entries = uncurryThis(MapPrototype.entries);
	var next = entries(new Map()).next;

	mapIterate = function (map, fn, interruptible) {
	  return interruptible ? iterateSimple({ iterator: entries(map), next: next }, function (entry) {
	    return fn(entry[1], entry[0]);
	  }) : forEach(map, fn);
	};
	return mapIterate;
}

var arrayUniqueBy;
var hasRequiredArrayUniqueBy;

function requireArrayUniqueBy () {
	if (hasRequiredArrayUniqueBy) return arrayUniqueBy;
	hasRequiredArrayUniqueBy = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var aCallable = requireACallable();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var toObject = requireToObject();
	var MapHelpers = requireMapHelpers();
	var iterate = requireMapIterate();

	var Map = MapHelpers.Map;
	var mapHas = MapHelpers.has;
	var mapSet = MapHelpers.set;
	var push = uncurryThis([].push);

	// `Array.prototype.uniqueBy` method
	// https://github.com/tc39/proposal-array-unique
	arrayUniqueBy = function uniqueBy(resolver) {
	  var that = toObject(this);
	  var length = lengthOfArrayLike(that);
	  var result = [];
	  var map = new Map();
	  var resolverFunction = !isNullOrUndefined(resolver) ? aCallable(resolver) : function (value) {
	    return value;
	  };
	  var index, item, key;
	  for (index = 0; index < length; index++) {
	    item = that[index];
	    key = resolverFunction(item);
	    if (!mapHas(map, key)) mapSet(map, key, item);
	  }
	  iterate(map, function (value) {
	    push(result, value);
	  });
	  return result;
	};
	return arrayUniqueBy;
}

var hasRequiredEsnext_array_uniqueBy;

function requireEsnext_array_uniqueBy () {
	if (hasRequiredEsnext_array_uniqueBy) return esnext_array_uniqueBy;
	hasRequiredEsnext_array_uniqueBy = 1;
	var $ = require_export();
	var addToUnscopables = requireAddToUnscopables();
	var uniqueBy = requireArrayUniqueBy();

	// `Array.prototype.uniqueBy` method
	// https://github.com/tc39/proposal-array-unique
	$({ target: 'Array', proto: true, forced: true }, {
	  uniqueBy: uniqueBy
	});

	addToUnscopables('uniqueBy');
	return esnext_array_uniqueBy;
}

var esnext_array_with = {};

var hasRequiredEsnext_array_with;

function requireEsnext_array_with () {
	if (hasRequiredEsnext_array_with) return esnext_array_with;
	hasRequiredEsnext_array_with = 1;
	// TODO: Remove from `core-js@4`
	requireEs_array_with();
	return esnext_array_with;
}

var esnext_arrayBuffer_detached = {};

var hasRequiredEsnext_arrayBuffer_detached;

function requireEsnext_arrayBuffer_detached () {
	if (hasRequiredEsnext_arrayBuffer_detached) return esnext_arrayBuffer_detached;
	hasRequiredEsnext_arrayBuffer_detached = 1;
	// TODO: Remove from `core-js@4`
	requireEs_arrayBuffer_detached();
	return esnext_arrayBuffer_detached;
}

var esnext_arrayBuffer_transfer = {};

var hasRequiredEsnext_arrayBuffer_transfer;

function requireEsnext_arrayBuffer_transfer () {
	if (hasRequiredEsnext_arrayBuffer_transfer) return esnext_arrayBuffer_transfer;
	hasRequiredEsnext_arrayBuffer_transfer = 1;
	// TODO: Remove from `core-js@4`
	requireEs_arrayBuffer_transfer();
	return esnext_arrayBuffer_transfer;
}

var esnext_arrayBuffer_transferToFixedLength = {};

var hasRequiredEsnext_arrayBuffer_transferToFixedLength;

function requireEsnext_arrayBuffer_transferToFixedLength () {
	if (hasRequiredEsnext_arrayBuffer_transferToFixedLength) return esnext_arrayBuffer_transferToFixedLength;
	hasRequiredEsnext_arrayBuffer_transferToFixedLength = 1;
	// TODO: Remove from `core-js@4`
	requireEs_arrayBuffer_transferToFixedLength();
	return esnext_arrayBuffer_transferToFixedLength;
}

var esnext_asyncDisposableStack_constructor = {};

var addDisposableResource;
var hasRequiredAddDisposableResource;

function requireAddDisposableResource () {
	if (hasRequiredAddDisposableResource) return addDisposableResource;
	hasRequiredAddDisposableResource = 1;
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var bind = requireFunctionBindContext();
	var anObject = requireAnObject();
	var aCallable = requireACallable();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var getMethod = requireGetMethod();
	var wellKnownSymbol = requireWellKnownSymbol();

	var ASYNC_DISPOSE = wellKnownSymbol('asyncDispose');
	var DISPOSE = wellKnownSymbol('dispose');

	var push = uncurryThis([].push);

	// `GetDisposeMethod` abstract operation
	// https://tc39.es/proposal-explicit-resource-management/#sec-getdisposemethod
	var getDisposeMethod = function (V, hint) {
	  if (hint === 'async-dispose') {
	    var method = getMethod(V, ASYNC_DISPOSE);
	    if (method !== undefined) return method;
	    method = getMethod(V, DISPOSE);
	    if (method === undefined) return method;
	    return function () {
	      call(method, this);
	    };
	  } return getMethod(V, DISPOSE);
	};

	// `CreateDisposableResource` abstract operation
	// https://tc39.es/proposal-explicit-resource-management/#sec-createdisposableresource
	var createDisposableResource = function (V, hint, method) {
	  if (arguments.length < 3 && !isNullOrUndefined(V)) {
	    method = aCallable(getDisposeMethod(anObject(V), hint));
	  }

	  return method === undefined ? function () {
	    return undefined;
	  } : bind(method, V);
	};

	// `AddDisposableResource` abstract operation
	// https://tc39.es/proposal-explicit-resource-management/#sec-adddisposableresource
	addDisposableResource = function (disposable, V, hint, method) {
	  var resource;
	  if (arguments.length < 4) {
	    // When `V`` is either `null` or `undefined` and hint is `async-dispose`,
	    // we record that the resource was evaluated to ensure we will still perform an `Await` when resources are later disposed.
	    if (isNullOrUndefined(V) && hint === 'sync-dispose') return;
	    resource = createDisposableResource(V, hint);
	  } else {
	    resource = createDisposableResource(undefined, hint, method);
	  }

	  push(disposable.stack, resource);
	};
	return addDisposableResource;
}

var hasRequiredEsnext_asyncDisposableStack_constructor;

function requireEsnext_asyncDisposableStack_constructor () {
	if (hasRequiredEsnext_asyncDisposableStack_constructor) return esnext_asyncDisposableStack_constructor;
	hasRequiredEsnext_asyncDisposableStack_constructor = 1;
	// https://github.com/tc39/proposal-async-explicit-resource-management
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var getBuiltIn = requireGetBuiltIn();
	var aCallable = requireACallable();
	var anInstance = requireAnInstance();
	var defineBuiltIn = requireDefineBuiltIn();
	var defineBuiltIns = requireDefineBuiltIns();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var wellKnownSymbol = requireWellKnownSymbol();
	var InternalStateModule = requireInternalState();
	var addDisposableResource = requireAddDisposableResource();

	var Promise = getBuiltIn('Promise');
	var SuppressedError = getBuiltIn('SuppressedError');
	var $ReferenceError = ReferenceError;

	var ASYNC_DISPOSE = wellKnownSymbol('asyncDispose');
	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var ASYNC_DISPOSABLE_STACK = 'AsyncDisposableStack';
	var setInternalState = InternalStateModule.set;
	var getAsyncDisposableStackInternalState = InternalStateModule.getterFor(ASYNC_DISPOSABLE_STACK);

	var HINT = 'async-dispose';
	var DISPOSED = 'disposed';
	var PENDING = 'pending';

	var getPendingAsyncDisposableStackInternalState = function (stack) {
	  var internalState = getAsyncDisposableStackInternalState(stack);
	  if (internalState.state === DISPOSED) throw new $ReferenceError(ASYNC_DISPOSABLE_STACK + ' already disposed');
	  return internalState;
	};

	var $AsyncDisposableStack = function AsyncDisposableStack() {
	  setInternalState(anInstance(this, AsyncDisposableStackPrototype), {
	    type: ASYNC_DISPOSABLE_STACK,
	    state: PENDING,
	    stack: []
	  });

	  if (!DESCRIPTORS) this.disposed = false;
	};

	var AsyncDisposableStackPrototype = $AsyncDisposableStack.prototype;

	defineBuiltIns(AsyncDisposableStackPrototype, {
	  disposeAsync: function disposeAsync() {
	    var asyncDisposableStack = this;
	    return new Promise(function (resolve, reject) {
	      var internalState = getAsyncDisposableStackInternalState(asyncDisposableStack);
	      if (internalState.state === DISPOSED) return resolve(undefined);
	      internalState.state = DISPOSED;
	      if (!DESCRIPTORS) asyncDisposableStack.disposed = true;
	      var stack = internalState.stack;
	      var i = stack.length;
	      var thrown = false;
	      var suppressed;

	      var handleError = function (result) {
	        if (thrown) {
	          suppressed = new SuppressedError(result, suppressed);
	        } else {
	          thrown = true;
	          suppressed = result;
	        }

	        loop();
	      };

	      var loop = function () {
	        if (i) {
	          var disposeMethod = stack[--i];
	          stack[i] = null;
	          try {
	            Promise.resolve(disposeMethod()).then(loop, handleError);
	          } catch (error) {
	            handleError(error);
	          }
	        } else {
	          internalState.stack = null;
	          thrown ? reject(suppressed) : resolve(undefined);
	        }
	      };

	      loop();
	    });
	  },
	  use: function use(value) {
	    addDisposableResource(getPendingAsyncDisposableStackInternalState(this), value, HINT);
	    return value;
	  },
	  adopt: function adopt(value, onDispose) {
	    var internalState = getPendingAsyncDisposableStackInternalState(this);
	    aCallable(onDispose);
	    addDisposableResource(internalState, undefined, HINT, function () {
	      return onDispose(value);
	    });
	    return value;
	  },
	  defer: function defer(onDispose) {
	    var internalState = getPendingAsyncDisposableStackInternalState(this);
	    aCallable(onDispose);
	    addDisposableResource(internalState, undefined, HINT, onDispose);
	  },
	  move: function move() {
	    var internalState = getPendingAsyncDisposableStackInternalState(this);
	    var newAsyncDisposableStack = new $AsyncDisposableStack();
	    getAsyncDisposableStackInternalState(newAsyncDisposableStack).stack = internalState.stack;
	    internalState.stack = [];
	    internalState.state = DISPOSED;
	    if (!DESCRIPTORS) this.disposed = true;
	    return newAsyncDisposableStack;
	  }
	});

	if (DESCRIPTORS) defineBuiltInAccessor(AsyncDisposableStackPrototype, 'disposed', {
	  configurable: true,
	  get: function disposed() {
	    return getAsyncDisposableStackInternalState(this).state === DISPOSED;
	  }
	});

	defineBuiltIn(AsyncDisposableStackPrototype, ASYNC_DISPOSE, AsyncDisposableStackPrototype.disposeAsync, { name: 'disposeAsync' });
	defineBuiltIn(AsyncDisposableStackPrototype, TO_STRING_TAG, ASYNC_DISPOSABLE_STACK, { nonWritable: true });

	$({ global: true, constructor: true }, {
	  AsyncDisposableStack: $AsyncDisposableStack
	});
	return esnext_asyncDisposableStack_constructor;
}

var esnext_asyncIterator_constructor = {};

var hasRequiredEsnext_asyncIterator_constructor;

function requireEsnext_asyncIterator_constructor () {
	if (hasRequiredEsnext_asyncIterator_constructor) return esnext_asyncIterator_constructor;
	hasRequiredEsnext_asyncIterator_constructor = 1;
	var $ = require_export();
	var anInstance = requireAnInstance();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var hasOwn = requireHasOwnProperty();
	var wellKnownSymbol = requireWellKnownSymbol();
	var AsyncIteratorPrototype = requireAsyncIteratorPrototype();
	var IS_PURE = requireIsPure();

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var $TypeError = TypeError;

	var AsyncIteratorConstructor = function AsyncIterator() {
	  anInstance(this, AsyncIteratorPrototype);
	  if (getPrototypeOf(this) === AsyncIteratorPrototype) throw new $TypeError('Abstract class AsyncIterator not directly constructable');
	};

	AsyncIteratorConstructor.prototype = AsyncIteratorPrototype;

	if (!hasOwn(AsyncIteratorPrototype, TO_STRING_TAG)) {
	  createNonEnumerableProperty(AsyncIteratorPrototype, TO_STRING_TAG, 'AsyncIterator');
	}

	if (IS_PURE || !hasOwn(AsyncIteratorPrototype, 'constructor') || AsyncIteratorPrototype.constructor === Object) {
	  createNonEnumerableProperty(AsyncIteratorPrototype, 'constructor', AsyncIteratorConstructor);
	}

	// `AsyncIterator` constructor
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ global: true, constructor: true, forced: IS_PURE }, {
	  AsyncIterator: AsyncIteratorConstructor
	});
	return esnext_asyncIterator_constructor;
}

var esnext_asyncIterator_asIndexedPairs = {};

var asyncIteratorCreateProxy;
var hasRequiredAsyncIteratorCreateProxy;

function requireAsyncIteratorCreateProxy () {
	if (hasRequiredAsyncIteratorCreateProxy) return asyncIteratorCreateProxy;
	hasRequiredAsyncIteratorCreateProxy = 1;
	var call = requireFunctionCall();
	var perform = requirePerform();
	var anObject = requireAnObject();
	var create = requireObjectCreate();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var defineBuiltIns = requireDefineBuiltIns();
	var wellKnownSymbol = requireWellKnownSymbol();
	var InternalStateModule = requireInternalState();
	var getBuiltIn = requireGetBuiltIn();
	var getMethod = requireGetMethod();
	var AsyncIteratorPrototype = requireAsyncIteratorPrototype();
	var createIterResultObject = requireCreateIterResultObject();
	var iteratorClose = requireIteratorClose();

	var Promise = getBuiltIn('Promise');

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var ASYNC_ITERATOR_HELPER = 'AsyncIteratorHelper';
	var WRAP_FOR_VALID_ASYNC_ITERATOR = 'WrapForValidAsyncIterator';
	var setInternalState = InternalStateModule.set;

	var createAsyncIteratorProxyPrototype = function (IS_ITERATOR) {
	  var IS_GENERATOR = !IS_ITERATOR;
	  var getInternalState = InternalStateModule.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER);

	  var getStateOrEarlyExit = function (that) {
	    var stateCompletion = perform(function () {
	      return getInternalState(that);
	    });

	    var stateError = stateCompletion.error;
	    var state = stateCompletion.value;

	    if (stateError || (IS_GENERATOR && state.done)) {
	      return { exit: true, value: stateError ? Promise.reject(state) : Promise.resolve(createIterResultObject(undefined, true)) };
	    } return { exit: false, value: state };
	  };

	  return defineBuiltIns(create(AsyncIteratorPrototype), {
	    next: function next() {
	      var stateCompletion = getStateOrEarlyExit(this);
	      var state = stateCompletion.value;
	      if (stateCompletion.exit) return state;
	      var handlerCompletion = perform(function () {
	        return anObject(state.nextHandler(Promise));
	      });
	      var handlerError = handlerCompletion.error;
	      var value = handlerCompletion.value;
	      if (handlerError) state.done = true;
	      return handlerError ? Promise.reject(value) : Promise.resolve(value);
	    },
	    'return': function () {
	      var stateCompletion = getStateOrEarlyExit(this);
	      var state = stateCompletion.value;
	      if (stateCompletion.exit) return state;
	      state.done = true;
	      var iterator = state.iterator;
	      var returnMethod, result;
	      var completion = perform(function () {
	        if (state.inner) try {
	          iteratorClose(state.inner.iterator, 'normal');
	        } catch (error) {
	          return iteratorClose(iterator, 'throw', error);
	        }
	        return getMethod(iterator, 'return');
	      });
	      returnMethod = result = completion.value;
	      if (completion.error) return Promise.reject(result);
	      if (returnMethod === undefined) return Promise.resolve(createIterResultObject(undefined, true));
	      completion = perform(function () {
	        return call(returnMethod, iterator);
	      });
	      result = completion.value;
	      if (completion.error) return Promise.reject(result);
	      return IS_ITERATOR ? Promise.resolve(result) : Promise.resolve(result).then(function (resolved) {
	        anObject(resolved);
	        return createIterResultObject(undefined, true);
	      });
	    }
	  });
	};

	var WrapForValidAsyncIteratorPrototype = createAsyncIteratorProxyPrototype(true);
	var AsyncIteratorHelperPrototype = createAsyncIteratorProxyPrototype(false);

	createNonEnumerableProperty(AsyncIteratorHelperPrototype, TO_STRING_TAG, 'Async Iterator Helper');

	asyncIteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
	  var AsyncIteratorProxy = function AsyncIterator(record, state) {
	    if (state) {
	      state.iterator = record.iterator;
	      state.next = record.next;
	    } else state = record;
	    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER;
	    state.nextHandler = nextHandler;
	    state.counter = 0;
	    state.done = false;
	    setInternalState(this, state);
	  };

	  AsyncIteratorProxy.prototype = IS_ITERATOR ? WrapForValidAsyncIteratorPrototype : AsyncIteratorHelperPrototype;

	  return AsyncIteratorProxy;
	};
	return asyncIteratorCreateProxy;
}

var asyncIteratorMap;
var hasRequiredAsyncIteratorMap;

function requireAsyncIteratorMap () {
	if (hasRequiredAsyncIteratorMap) return asyncIteratorMap;
	hasRequiredAsyncIteratorMap = 1;
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var isObject = requireIsObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var createAsyncIteratorProxy = requireAsyncIteratorCreateProxy();
	var createIterResultObject = requireCreateIterResultObject();
	var closeAsyncIteration = requireAsyncIteratorClose();

	var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
	  var state = this;
	  var iterator = state.iterator;
	  var mapper = state.mapper;

	  return new Promise(function (resolve, reject) {
	    var doneAndReject = function (error) {
	      state.done = true;
	      reject(error);
	    };

	    var ifAbruptCloseAsyncIterator = function (error) {
	      closeAsyncIteration(iterator, doneAndReject, error, doneAndReject);
	    };

	    Promise.resolve(anObject(call(state.next, iterator))).then(function (step) {
	      try {
	        if (anObject(step).done) {
	          state.done = true;
	          resolve(createIterResultObject(undefined, true));
	        } else {
	          var value = step.value;
	          try {
	            var result = mapper(value, state.counter++);

	            var handler = function (mapped) {
	              resolve(createIterResultObject(mapped, false));
	            };

	            if (isObject(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
	            else handler(result);
	          } catch (error2) { ifAbruptCloseAsyncIterator(error2); }
	        }
	      } catch (error) { doneAndReject(error); }
	    }, doneAndReject);
	  });
	});

	// `AsyncIterator.prototype.map` method
	// https://github.com/tc39/proposal-iterator-helpers
	asyncIteratorMap = function map(mapper) {
	  anObject(this);
	  aCallable(mapper);
	  return new AsyncIteratorProxy(getIteratorDirect(this), {
	    mapper: mapper
	  });
	};
	return asyncIteratorMap;
}

var asyncIteratorIndexed;
var hasRequiredAsyncIteratorIndexed;

function requireAsyncIteratorIndexed () {
	if (hasRequiredAsyncIteratorIndexed) return asyncIteratorIndexed;
	hasRequiredAsyncIteratorIndexed = 1;
	var call = requireFunctionCall();
	var map = requireAsyncIteratorMap();

	var callback = function (value, counter) {
	  return [counter, value];
	};

	// `AsyncIterator.prototype.indexed` method
	// https://github.com/tc39/proposal-iterator-helpers
	asyncIteratorIndexed = function indexed() {
	  return call(map, this, callback);
	};
	return asyncIteratorIndexed;
}

var hasRequiredEsnext_asyncIterator_asIndexedPairs;

function requireEsnext_asyncIterator_asIndexedPairs () {
	if (hasRequiredEsnext_asyncIterator_asIndexedPairs) return esnext_asyncIterator_asIndexedPairs;
	hasRequiredEsnext_asyncIterator_asIndexedPairs = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var indexed = requireAsyncIteratorIndexed();

	// `AsyncIterator.prototype.asIndexedPairs` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'AsyncIterator', name: 'indexed', proto: true, real: true, forced: true }, {
	  asIndexedPairs: indexed
	});
	return esnext_asyncIterator_asIndexedPairs;
}

var esnext_asyncIterator_asyncDispose = {};

var hasRequiredEsnext_asyncIterator_asyncDispose;

function requireEsnext_asyncIterator_asyncDispose () {
	if (hasRequiredEsnext_asyncIterator_asyncDispose) return esnext_asyncIterator_asyncDispose;
	hasRequiredEsnext_asyncIterator_asyncDispose = 1;
	// https://github.com/tc39/proposal-async-explicit-resource-management
	var call = requireFunctionCall();
	var defineBuiltIn = requireDefineBuiltIn();
	var getBuiltIn = requireGetBuiltIn();
	var getMethod = requireGetMethod();
	var hasOwn = requireHasOwnProperty();
	var wellKnownSymbol = requireWellKnownSymbol();
	var AsyncIteratorPrototype = requireAsyncIteratorPrototype();

	var ASYNC_DISPOSE = wellKnownSymbol('asyncDispose');
	var Promise = getBuiltIn('Promise');

	if (!hasOwn(AsyncIteratorPrototype, ASYNC_DISPOSE)) {
	  defineBuiltIn(AsyncIteratorPrototype, ASYNC_DISPOSE, function () {
	    var O = this;
	    return new Promise(function (resolve, reject) {
	      var $return = getMethod(O, 'return');
	      if ($return) {
	        Promise.resolve(call($return, O)).then(function () {
	          resolve(undefined);
	        }, reject);
	      } else resolve(undefined);
	    });
	  });
	}
	return esnext_asyncIterator_asyncDispose;
}

var esnext_asyncIterator_drop = {};

var notANan;
var hasRequiredNotANan;

function requireNotANan () {
	if (hasRequiredNotANan) return notANan;
	hasRequiredNotANan = 1;
	var $RangeError = RangeError;

	notANan = function (it) {
	  // eslint-disable-next-line no-self-compare -- NaN check
	  if (it === it) return it;
	  throw new $RangeError('NaN is not allowed');
	};
	return notANan;
}

var hasRequiredEsnext_asyncIterator_drop;

function requireEsnext_asyncIterator_drop () {
	if (hasRequiredEsnext_asyncIterator_drop) return esnext_asyncIterator_drop;
	hasRequiredEsnext_asyncIterator_drop = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var notANaN = requireNotANan();
	var toPositiveInteger = requireToPositiveInteger();
	var createAsyncIteratorProxy = requireAsyncIteratorCreateProxy();
	var createIterResultObject = requireCreateIterResultObject();
	var IS_PURE = requireIsPure();

	var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
	  var state = this;

	  return new Promise(function (resolve, reject) {
	    var doneAndReject = function (error) {
	      state.done = true;
	      reject(error);
	    };

	    var loop = function () {
	      try {
	        Promise.resolve(anObject(call(state.next, state.iterator))).then(function (step) {
	          try {
	            if (anObject(step).done) {
	              state.done = true;
	              resolve(createIterResultObject(undefined, true));
	            } else if (state.remaining) {
	              state.remaining--;
	              loop();
	            } else resolve(createIterResultObject(step.value, false));
	          } catch (err) { doneAndReject(err); }
	        }, doneAndReject);
	      } catch (error) { doneAndReject(error); }
	    };

	    loop();
	  });
	});

	// `AsyncIterator.prototype.drop` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE }, {
	  drop: function drop(limit) {
	    anObject(this);
	    var remaining = toPositiveInteger(notANaN(+limit));
	    return new AsyncIteratorProxy(getIteratorDirect(this), {
	      remaining: remaining
	    });
	  }
	});
	return esnext_asyncIterator_drop;
}

var esnext_asyncIterator_every = {};

var hasRequiredEsnext_asyncIterator_every;

function requireEsnext_asyncIterator_every () {
	if (hasRequiredEsnext_asyncIterator_every) return esnext_asyncIterator_every;
	hasRequiredEsnext_asyncIterator_every = 1;
	var $ = require_export();
	var $every = requireAsyncIteratorIteration().every;

	// `AsyncIterator.prototype.every` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true }, {
	  every: function every(predicate) {
	    return $every(this, predicate);
	  }
	});
	return esnext_asyncIterator_every;
}

var esnext_asyncIterator_filter = {};

var hasRequiredEsnext_asyncIterator_filter;

function requireEsnext_asyncIterator_filter () {
	if (hasRequiredEsnext_asyncIterator_filter) return esnext_asyncIterator_filter;
	hasRequiredEsnext_asyncIterator_filter = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var isObject = requireIsObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var createAsyncIteratorProxy = requireAsyncIteratorCreateProxy();
	var createIterResultObject = requireCreateIterResultObject();
	var closeAsyncIteration = requireAsyncIteratorClose();
	var IS_PURE = requireIsPure();

	var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
	  var state = this;
	  var iterator = state.iterator;
	  var predicate = state.predicate;

	  return new Promise(function (resolve, reject) {
	    var doneAndReject = function (error) {
	      state.done = true;
	      reject(error);
	    };

	    var ifAbruptCloseAsyncIterator = function (error) {
	      closeAsyncIteration(iterator, doneAndReject, error, doneAndReject);
	    };

	    var loop = function () {
	      try {
	        Promise.resolve(anObject(call(state.next, iterator))).then(function (step) {
	          try {
	            if (anObject(step).done) {
	              state.done = true;
	              resolve(createIterResultObject(undefined, true));
	            } else {
	              var value = step.value;
	              try {
	                var result = predicate(value, state.counter++);

	                var handler = function (selected) {
	                  selected ? resolve(createIterResultObject(value, false)) : loop();
	                };

	                if (isObject(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
	                else handler(result);
	              } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
	            }
	          } catch (error2) { doneAndReject(error2); }
	        }, doneAndReject);
	      } catch (error) { doneAndReject(error); }
	    };

	    loop();
	  });
	});

	// `AsyncIterator.prototype.filter` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE }, {
	  filter: function filter(predicate) {
	    anObject(this);
	    aCallable(predicate);
	    return new AsyncIteratorProxy(getIteratorDirect(this), {
	      predicate: predicate
	    });
	  }
	});
	return esnext_asyncIterator_filter;
}

var esnext_asyncIterator_find = {};

var hasRequiredEsnext_asyncIterator_find;

function requireEsnext_asyncIterator_find () {
	if (hasRequiredEsnext_asyncIterator_find) return esnext_asyncIterator_find;
	hasRequiredEsnext_asyncIterator_find = 1;
	var $ = require_export();
	var $find = requireAsyncIteratorIteration().find;

	// `AsyncIterator.prototype.find` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true }, {
	  find: function find(predicate) {
	    return $find(this, predicate);
	  }
	});
	return esnext_asyncIterator_find;
}

var esnext_asyncIterator_flatMap = {};

var getAsyncIteratorFlattenable;
var hasRequiredGetAsyncIteratorFlattenable;

function requireGetAsyncIteratorFlattenable () {
	if (hasRequiredGetAsyncIteratorFlattenable) return getAsyncIteratorFlattenable;
	hasRequiredGetAsyncIteratorFlattenable = 1;
	var call = requireFunctionCall();
	var isCallable = requireIsCallable();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var getIteratorMethod = requireGetIteratorMethod();
	var getMethod = requireGetMethod();
	var wellKnownSymbol = requireWellKnownSymbol();
	var AsyncFromSyncIterator = requireAsyncFromSyncIterator();

	var ASYNC_ITERATOR = wellKnownSymbol('asyncIterator');

	getAsyncIteratorFlattenable = function (obj) {
	  var object = anObject(obj);
	  var alreadyAsync = true;
	  var method = getMethod(object, ASYNC_ITERATOR);
	  var iterator;
	  if (!isCallable(method)) {
	    method = getIteratorMethod(object);
	    alreadyAsync = false;
	  }
	  if (method !== undefined) {
	    iterator = call(method, object);
	  } else {
	    iterator = object;
	    alreadyAsync = true;
	  }
	  anObject(iterator);
	  return getIteratorDirect(alreadyAsync ? iterator : new AsyncFromSyncIterator(getIteratorDirect(iterator)));
	};
	return getAsyncIteratorFlattenable;
}

var hasRequiredEsnext_asyncIterator_flatMap;

function requireEsnext_asyncIterator_flatMap () {
	if (hasRequiredEsnext_asyncIterator_flatMap) return esnext_asyncIterator_flatMap;
	hasRequiredEsnext_asyncIterator_flatMap = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var isObject = requireIsObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var createAsyncIteratorProxy = requireAsyncIteratorCreateProxy();
	var createIterResultObject = requireCreateIterResultObject();
	var getAsyncIteratorFlattenable = requireGetAsyncIteratorFlattenable();
	var closeAsyncIteration = requireAsyncIteratorClose();
	var IS_PURE = requireIsPure();

	var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
	  var state = this;
	  var iterator = state.iterator;
	  var mapper = state.mapper;

	  return new Promise(function (resolve, reject) {
	    var doneAndReject = function (error) {
	      state.done = true;
	      reject(error);
	    };

	    var ifAbruptCloseAsyncIterator = function (error) {
	      closeAsyncIteration(iterator, doneAndReject, error, doneAndReject);
	    };

	    var outerLoop = function () {
	      try {
	        Promise.resolve(anObject(call(state.next, iterator))).then(function (step) {
	          try {
	            if (anObject(step).done) {
	              state.done = true;
	              resolve(createIterResultObject(undefined, true));
	            } else {
	              var value = step.value;
	              try {
	                var result = mapper(value, state.counter++);

	                var handler = function (mapped) {
	                  try {
	                    state.inner = getAsyncIteratorFlattenable(mapped);
	                    innerLoop();
	                  } catch (error4) { ifAbruptCloseAsyncIterator(error4); }
	                };

	                if (isObject(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
	                else handler(result);
	              } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
	            }
	          } catch (error2) { doneAndReject(error2); }
	        }, doneAndReject);
	      } catch (error) { doneAndReject(error); }
	    };

	    var innerLoop = function () {
	      var inner = state.inner;
	      if (inner) {
	        try {
	          Promise.resolve(anObject(call(inner.next, inner.iterator))).then(function (result) {
	            try {
	              if (anObject(result).done) {
	                state.inner = null;
	                outerLoop();
	              } else resolve(createIterResultObject(result.value, false));
	            } catch (error1) { ifAbruptCloseAsyncIterator(error1); }
	          }, ifAbruptCloseAsyncIterator);
	        } catch (error) { ifAbruptCloseAsyncIterator(error); }
	      } else outerLoop();
	    };

	    innerLoop();
	  });
	});

	// `AsyncIterator.prototype.flaMap` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE }, {
	  flatMap: function flatMap(mapper) {
	    anObject(this);
	    aCallable(mapper);
	    return new AsyncIteratorProxy(getIteratorDirect(this), {
	      mapper: mapper,
	      inner: null
	    });
	  }
	});
	return esnext_asyncIterator_flatMap;
}

var esnext_asyncIterator_forEach = {};

var hasRequiredEsnext_asyncIterator_forEach;

function requireEsnext_asyncIterator_forEach () {
	if (hasRequiredEsnext_asyncIterator_forEach) return esnext_asyncIterator_forEach;
	hasRequiredEsnext_asyncIterator_forEach = 1;
	var $ = require_export();
	var $forEach = requireAsyncIteratorIteration().forEach;

	// `AsyncIterator.prototype.forEach` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true }, {
	  forEach: function forEach(fn) {
	    return $forEach(this, fn);
	  }
	});
	return esnext_asyncIterator_forEach;
}

var esnext_asyncIterator_from = {};

var asyncIteratorWrap;
var hasRequiredAsyncIteratorWrap;

function requireAsyncIteratorWrap () {
	if (hasRequiredAsyncIteratorWrap) return asyncIteratorWrap;
	hasRequiredAsyncIteratorWrap = 1;
	var call = requireFunctionCall();
	var createAsyncIteratorProxy = requireAsyncIteratorCreateProxy();

	asyncIteratorWrap = createAsyncIteratorProxy(function () {
	  return call(this.next, this.iterator);
	}, true);
	return asyncIteratorWrap;
}

var hasRequiredEsnext_asyncIterator_from;

function requireEsnext_asyncIterator_from () {
	if (hasRequiredEsnext_asyncIterator_from) return esnext_asyncIterator_from;
	hasRequiredEsnext_asyncIterator_from = 1;
	var $ = require_export();
	var toObject = requireToObject();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var getAsyncIteratorFlattenable = requireGetAsyncIteratorFlattenable();
	var AsyncIteratorPrototype = requireAsyncIteratorPrototype();
	var WrapAsyncIterator = requireAsyncIteratorWrap();
	var IS_PURE = requireIsPure();

	// `AsyncIterator.from` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', stat: true, forced: IS_PURE }, {
	  from: function from(O) {
	    var iteratorRecord = getAsyncIteratorFlattenable(typeof O == 'string' ? toObject(O) : O);
	    return isPrototypeOf(AsyncIteratorPrototype, iteratorRecord.iterator)
	      ? iteratorRecord.iterator
	      : new WrapAsyncIterator(iteratorRecord);
	  }
	});
	return esnext_asyncIterator_from;
}

var esnext_asyncIterator_indexed = {};

var hasRequiredEsnext_asyncIterator_indexed;

function requireEsnext_asyncIterator_indexed () {
	if (hasRequiredEsnext_asyncIterator_indexed) return esnext_asyncIterator_indexed;
	hasRequiredEsnext_asyncIterator_indexed = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var indexed = requireAsyncIteratorIndexed();

	// `AsyncIterator.prototype.indexed` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
	  indexed: indexed
	});
	return esnext_asyncIterator_indexed;
}

var esnext_asyncIterator_map = {};

var hasRequiredEsnext_asyncIterator_map;

function requireEsnext_asyncIterator_map () {
	if (hasRequiredEsnext_asyncIterator_map) return esnext_asyncIterator_map;
	hasRequiredEsnext_asyncIterator_map = 1;
	var $ = require_export();
	var map = requireAsyncIteratorMap();
	var IS_PURE = requireIsPure();

	// `AsyncIterator.prototype.map` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE }, {
	  map: map
	});
	return esnext_asyncIterator_map;
}

var esnext_asyncIterator_reduce = {};

var hasRequiredEsnext_asyncIterator_reduce;

function requireEsnext_asyncIterator_reduce () {
	if (hasRequiredEsnext_asyncIterator_reduce) return esnext_asyncIterator_reduce;
	hasRequiredEsnext_asyncIterator_reduce = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var isObject = requireIsObject();
	var getBuiltIn = requireGetBuiltIn();
	var getIteratorDirect = requireGetIteratorDirect();
	var closeAsyncIteration = requireAsyncIteratorClose();

	var Promise = getBuiltIn('Promise');
	var $TypeError = TypeError;

	// `AsyncIterator.prototype.reduce` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true }, {
	  reduce: function reduce(reducer /* , initialValue */) {
	    anObject(this);
	    aCallable(reducer);
	    var record = getIteratorDirect(this);
	    var iterator = record.iterator;
	    var next = record.next;
	    var noInitial = arguments.length < 2;
	    var accumulator = noInitial ? undefined : arguments[1];
	    var counter = 0;

	    return new Promise(function (resolve, reject) {
	      var ifAbruptCloseAsyncIterator = function (error) {
	        closeAsyncIteration(iterator, reject, error, reject);
	      };

	      var loop = function () {
	        try {
	          Promise.resolve(anObject(call(next, iterator))).then(function (step) {
	            try {
	              if (anObject(step).done) {
	                noInitial ? reject(new $TypeError('Reduce of empty iterator with no initial value')) : resolve(accumulator);
	              } else {
	                var value = step.value;
	                if (noInitial) {
	                  noInitial = false;
	                  accumulator = value;
	                  loop();
	                } else try {
	                  var result = reducer(accumulator, value, counter);

	                  var handler = function ($result) {
	                    accumulator = $result;
	                    loop();
	                  };

	                  if (isObject(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
	                  else handler(result);
	                } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
	              }
	              counter++;
	            } catch (error2) { reject(error2); }
	          }, reject);
	        } catch (error) { reject(error); }
	      };

	      loop();
	    });
	  }
	});
	return esnext_asyncIterator_reduce;
}

var esnext_asyncIterator_some = {};

var hasRequiredEsnext_asyncIterator_some;

function requireEsnext_asyncIterator_some () {
	if (hasRequiredEsnext_asyncIterator_some) return esnext_asyncIterator_some;
	hasRequiredEsnext_asyncIterator_some = 1;
	var $ = require_export();
	var $some = requireAsyncIteratorIteration().some;

	// `AsyncIterator.prototype.some` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true }, {
	  some: function some(predicate) {
	    return $some(this, predicate);
	  }
	});
	return esnext_asyncIterator_some;
}

var esnext_asyncIterator_take = {};

var hasRequiredEsnext_asyncIterator_take;

function requireEsnext_asyncIterator_take () {
	if (hasRequiredEsnext_asyncIterator_take) return esnext_asyncIterator_take;
	hasRequiredEsnext_asyncIterator_take = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var notANaN = requireNotANan();
	var toPositiveInteger = requireToPositiveInteger();
	var createAsyncIteratorProxy = requireAsyncIteratorCreateProxy();
	var createIterResultObject = requireCreateIterResultObject();
	var IS_PURE = requireIsPure();

	var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
	  var state = this;
	  var iterator = state.iterator;
	  var returnMethod;

	  if (!state.remaining--) {
	    var resultDone = createIterResultObject(undefined, true);
	    state.done = true;
	    returnMethod = iterator['return'];
	    if (returnMethod !== undefined) {
	      return Promise.resolve(call(returnMethod, iterator, undefined)).then(function () {
	        return resultDone;
	      });
	    }
	    return resultDone;
	  } return Promise.resolve(call(state.next, iterator)).then(function (step) {
	    if (anObject(step).done) {
	      state.done = true;
	      return createIterResultObject(undefined, true);
	    } return createIterResultObject(step.value, false);
	  }).then(null, function (error) {
	    state.done = true;
	    throw error;
	  });
	});

	// `AsyncIterator.prototype.take` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE }, {
	  take: function take(limit) {
	    anObject(this);
	    var remaining = toPositiveInteger(notANaN(+limit));
	    return new AsyncIteratorProxy(getIteratorDirect(this), {
	      remaining: remaining
	    });
	  }
	});
	return esnext_asyncIterator_take;
}

var esnext_asyncIterator_toArray = {};

var hasRequiredEsnext_asyncIterator_toArray;

function requireEsnext_asyncIterator_toArray () {
	if (hasRequiredEsnext_asyncIterator_toArray) return esnext_asyncIterator_toArray;
	hasRequiredEsnext_asyncIterator_toArray = 1;
	var $ = require_export();
	var $toArray = requireAsyncIteratorIteration().toArray;

	// `AsyncIterator.prototype.toArray` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'AsyncIterator', proto: true, real: true }, {
	  toArray: function toArray() {
	    return $toArray(this, undefined, []);
	  }
	});
	return esnext_asyncIterator_toArray;
}

var esnext_bigint_range = {};

var numericRangeIterator;
var hasRequiredNumericRangeIterator;

function requireNumericRangeIterator () {
	if (hasRequiredNumericRangeIterator) return numericRangeIterator;
	hasRequiredNumericRangeIterator = 1;
	var InternalStateModule = requireInternalState();
	var createIteratorConstructor = requireIteratorCreateConstructor();
	var createIterResultObject = requireCreateIterResultObject();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var isObject = requireIsObject();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var DESCRIPTORS = requireDescriptors();

	var INCORRECT_RANGE = 'Incorrect Iterator.range arguments';
	var NUMERIC_RANGE_ITERATOR = 'NumericRangeIterator';

	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(NUMERIC_RANGE_ITERATOR);

	var $RangeError = RangeError;
	var $TypeError = TypeError;

	var $RangeIterator = createIteratorConstructor(function NumericRangeIterator(start, end, option, type, zero, one) {
	  // TODO: Drop the first `typeof` check after removing legacy methods in `core-js@4`
	  if (typeof start != type || (end !== Infinity && end !== -Infinity && typeof end != type)) {
	    throw new $TypeError(INCORRECT_RANGE);
	  }
	  if (start === Infinity || start === -Infinity) {
	    throw new $RangeError(INCORRECT_RANGE);
	  }
	  var ifIncrease = end > start;
	  var inclusiveEnd = false;
	  var step;
	  if (option === undefined) {
	    step = undefined;
	  } else if (isObject(option)) {
	    step = option.step;
	    inclusiveEnd = !!option.inclusive;
	  } else if (typeof option == type) {
	    step = option;
	  } else {
	    throw new $TypeError(INCORRECT_RANGE);
	  }
	  if (isNullOrUndefined(step)) {
	    step = ifIncrease ? one : -one;
	  }
	  if (typeof step != type) {
	    throw new $TypeError(INCORRECT_RANGE);
	  }
	  if (step === Infinity || step === -Infinity || (step === zero && start !== end)) {
	    throw new $RangeError(INCORRECT_RANGE);
	  }
	  // eslint-disable-next-line no-self-compare -- NaN check
	  var hitsEnd = start !== start || end !== end || step !== step || (end > start) !== (step > zero);
	  setInternalState(this, {
	    type: NUMERIC_RANGE_ITERATOR,
	    start: start,
	    end: end,
	    step: step,
	    inclusive: inclusiveEnd,
	    hitsEnd: hitsEnd,
	    currentCount: zero,
	    zero: zero
	  });
	  if (!DESCRIPTORS) {
	    this.start = start;
	    this.end = end;
	    this.step = step;
	    this.inclusive = inclusiveEnd;
	  }
	}, NUMERIC_RANGE_ITERATOR, function next() {
	  var state = getInternalState(this);
	  if (state.hitsEnd) return createIterResultObject(undefined, true);
	  var start = state.start;
	  var end = state.end;
	  var step = state.step;
	  var currentYieldingValue = start + (step * state.currentCount++);
	  if (currentYieldingValue === end) state.hitsEnd = true;
	  var inclusiveEnd = state.inclusive;
	  var endCondition;
	  if (end > start) {
	    endCondition = inclusiveEnd ? currentYieldingValue > end : currentYieldingValue >= end;
	  } else {
	    endCondition = inclusiveEnd ? end > currentYieldingValue : end >= currentYieldingValue;
	  }
	  if (endCondition) {
	    state.hitsEnd = true;
	    return createIterResultObject(undefined, true);
	  } return createIterResultObject(currentYieldingValue, false);
	});

	var addGetter = function (key) {
	  defineBuiltInAccessor($RangeIterator.prototype, key, {
	    get: function () {
	      return getInternalState(this)[key];
	    },
	    set: function () { /* empty */ },
	    configurable: true,
	    enumerable: false
	  });
	};

	if (DESCRIPTORS) {
	  addGetter('start');
	  addGetter('end');
	  addGetter('inclusive');
	  addGetter('step');
	}

	numericRangeIterator = $RangeIterator;
	return numericRangeIterator;
}

var hasRequiredEsnext_bigint_range;

function requireEsnext_bigint_range () {
	if (hasRequiredEsnext_bigint_range) return esnext_bigint_range;
	hasRequiredEsnext_bigint_range = 1;
	/* eslint-disable es/no-bigint -- safe */
	var $ = require_export();
	var NumericRangeIterator = requireNumericRangeIterator();

	// `BigInt.range` method
	// https://github.com/tc39/proposal-Number.range
	// TODO: Remove from `core-js@4`
	if (typeof BigInt == 'function') {
	  $({ target: 'BigInt', stat: true, forced: true }, {
	    range: function range(start, end, option) {
	      return new NumericRangeIterator(start, end, option, 'bigint', BigInt(0), BigInt(1));
	    }
	  });
	}
	return esnext_bigint_range;
}

var esnext_compositeKey = {};

var compositeKey;
var hasRequiredCompositeKey;

function requireCompositeKey () {
	if (hasRequiredCompositeKey) return compositeKey;
	hasRequiredCompositeKey = 1;
	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
	requireEs_map();
	requireEs_weakMap();
	var getBuiltIn = requireGetBuiltIn();
	var create = requireObjectCreate();
	var isObject = requireIsObject();

	var $Object = Object;
	var $TypeError = TypeError;
	var Map = getBuiltIn('Map');
	var WeakMap = getBuiltIn('WeakMap');

	var Node = function () {
	  // keys
	  this.object = null;
	  this.symbol = null;
	  // child nodes
	  this.primitives = null;
	  this.objectsByIndex = create(null);
	};

	Node.prototype.get = function (key, initializer) {
	  return this[key] || (this[key] = initializer());
	};

	Node.prototype.next = function (i, it, IS_OBJECT) {
	  var store = IS_OBJECT
	    ? this.objectsByIndex[i] || (this.objectsByIndex[i] = new WeakMap())
	    : this.primitives || (this.primitives = new Map());
	  var entry = store.get(it);
	  if (!entry) store.set(it, entry = new Node());
	  return entry;
	};

	var root = new Node();

	compositeKey = function () {
	  var active = root;
	  var length = arguments.length;
	  var i, it;
	  // for prevent leaking, start from objects
	  for (i = 0; i < length; i++) {
	    if (isObject(it = arguments[i])) active = active.next(i, it, true);
	  }
	  if (this === $Object && active === root) throw new $TypeError('Composite keys must contain a non-primitive component');
	  for (i = 0; i < length; i++) {
	    if (!isObject(it = arguments[i])) active = active.next(i, it, false);
	  } return active;
	};
	return compositeKey;
}

var hasRequiredEsnext_compositeKey;

function requireEsnext_compositeKey () {
	if (hasRequiredEsnext_compositeKey) return esnext_compositeKey;
	hasRequiredEsnext_compositeKey = 1;
	var $ = require_export();
	var apply = requireFunctionApply();
	var getCompositeKeyNode = requireCompositeKey();
	var getBuiltIn = requireGetBuiltIn();
	var create = requireObjectCreate();

	var $Object = Object;

	var initializer = function () {
	  var freeze = getBuiltIn('Object', 'freeze');
	  return freeze ? freeze(create(null)) : create(null);
	};

	// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
	$({ global: true, forced: true }, {
	  compositeKey: function compositeKey() {
	    return apply(getCompositeKeyNode, $Object, arguments).get('object', initializer);
	  }
	});
	return esnext_compositeKey;
}

var esnext_compositeSymbol = {};

var hasRequiredEsnext_compositeSymbol;

function requireEsnext_compositeSymbol () {
	if (hasRequiredEsnext_compositeSymbol) return esnext_compositeSymbol;
	hasRequiredEsnext_compositeSymbol = 1;
	var $ = require_export();
	var getCompositeKeyNode = requireCompositeKey();
	var getBuiltIn = requireGetBuiltIn();
	var apply = requireFunctionApply();

	// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
	$({ global: true, forced: true }, {
	  compositeSymbol: function compositeSymbol() {
	    if (arguments.length === 1 && typeof arguments[0] == 'string') return getBuiltIn('Symbol')['for'](arguments[0]);
	    return apply(getCompositeKeyNode, null, arguments).get('symbol', getBuiltIn('Symbol'));
	  }
	});
	return esnext_compositeSymbol;
}

var esnext_dataView_getFloat16 = {};

var hasRequiredEsnext_dataView_getFloat16;

function requireEsnext_dataView_getFloat16 () {
	if (hasRequiredEsnext_dataView_getFloat16) return esnext_dataView_getFloat16;
	hasRequiredEsnext_dataView_getFloat16 = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var unpackIEEE754 = requireIeee754().unpack;

	// eslint-disable-next-line es/no-typed-arrays -- safe
	var getUint16 = uncurryThis(DataView.prototype.getUint16);

	// `DataView.prototype.getFloat16` method
	// https://github.com/tc39/proposal-float16array
	$({ target: 'DataView', proto: true }, {
	  getFloat16: function getFloat16(byteOffset /* , littleEndian */) {
	    var uint16 = getUint16(this, byteOffset, arguments.length > 1 ? arguments[1] : false);
	    return unpackIEEE754([uint16 & 0xFF, uint16 >> 8 & 0xFF], 10);
	  }
	});
	return esnext_dataView_getFloat16;
}

var esnext_dataView_getUint8Clamped = {};

var hasRequiredEsnext_dataView_getUint8Clamped;

function requireEsnext_dataView_getUint8Clamped () {
	if (hasRequiredEsnext_dataView_getUint8Clamped) return esnext_dataView_getUint8Clamped;
	hasRequiredEsnext_dataView_getUint8Clamped = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();

	// eslint-disable-next-line es/no-typed-arrays -- safe
	var getUint8 = uncurryThis(DataView.prototype.getUint8);

	// `DataView.prototype.getUint8Clamped` method
	// https://github.com/tc39/proposal-dataview-get-set-uint8clamped
	$({ target: 'DataView', proto: true, forced: true }, {
	  getUint8Clamped: function getUint8Clamped(byteOffset) {
	    return getUint8(this, byteOffset);
	  }
	});
	return esnext_dataView_getUint8Clamped;
}

var esnext_dataView_setFloat16 = {};

var aDataView;
var hasRequiredADataView;

function requireADataView () {
	if (hasRequiredADataView) return aDataView;
	hasRequiredADataView = 1;
	var classof = requireClassof();

	var $TypeError = TypeError;

	aDataView = function (argument) {
	  if (classof(argument) === 'DataView') return argument;
	  throw new $TypeError('Argument is not a DataView');
	};
	return aDataView;
}

var mathF16round;
var hasRequiredMathF16round;

function requireMathF16round () {
	if (hasRequiredMathF16round) return mathF16round;
	hasRequiredMathF16round = 1;
	var floatRound = requireMathFloatRound();

	var FLOAT16_EPSILON = 0.0009765625;
	var FLOAT16_MAX_VALUE = 65504;
	var FLOAT16_MIN_VALUE = 6.103515625e-05;

	// `Math.f16round` method implementation
	// https://github.com/tc39/proposal-float16array
	mathF16round = Math.f16round || function f16round(x) {
	  return floatRound(x, FLOAT16_EPSILON, FLOAT16_MAX_VALUE, FLOAT16_MIN_VALUE);
	};
	return mathF16round;
}

var hasRequiredEsnext_dataView_setFloat16;

function requireEsnext_dataView_setFloat16 () {
	if (hasRequiredEsnext_dataView_setFloat16) return esnext_dataView_setFloat16;
	hasRequiredEsnext_dataView_setFloat16 = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var aDataView = requireADataView();
	var toIndex = requireToIndex();
	var packIEEE754 = requireIeee754().pack;
	var f16round = requireMathF16round();

	// eslint-disable-next-line es/no-typed-arrays -- safe
	var setUint16 = uncurryThis(DataView.prototype.setUint16);

	// `DataView.prototype.setFloat16` method
	// https://github.com/tc39/proposal-float16array
	$({ target: 'DataView', proto: true }, {
	  setFloat16: function setFloat16(byteOffset, value /* , littleEndian */) {
	    aDataView(this);
	    var offset = toIndex(byteOffset);
	    var bytes = packIEEE754(f16round(value), 10, 2);
	    return setUint16(this, offset, bytes[1] << 8 | bytes[0], arguments.length > 2 ? arguments[2] : false);
	  }
	});
	return esnext_dataView_setFloat16;
}

var esnext_dataView_setUint8Clamped = {};

var hasRequiredEsnext_dataView_setUint8Clamped;

function requireEsnext_dataView_setUint8Clamped () {
	if (hasRequiredEsnext_dataView_setUint8Clamped) return esnext_dataView_setUint8Clamped;
	hasRequiredEsnext_dataView_setUint8Clamped = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var aDataView = requireADataView();
	var toIndex = requireToIndex();
	var toUint8Clamped = requireToUint8Clamped();

	// eslint-disable-next-line es/no-typed-arrays -- safe
	var setUint8 = uncurryThis(DataView.prototype.setUint8);

	// `DataView.prototype.setUint8Clamped` method
	// https://github.com/tc39/proposal-dataview-get-set-uint8clamped
	$({ target: 'DataView', proto: true, forced: true }, {
	  setUint8Clamped: function setUint8Clamped(byteOffset, value) {
	    aDataView(this);
	    var offset = toIndex(byteOffset);
	    return setUint8(this, offset, toUint8Clamped(value));
	  }
	});
	return esnext_dataView_setUint8Clamped;
}

var esnext_disposableStack_constructor = {};

var hasRequiredEsnext_disposableStack_constructor;

function requireEsnext_disposableStack_constructor () {
	if (hasRequiredEsnext_disposableStack_constructor) return esnext_disposableStack_constructor;
	hasRequiredEsnext_disposableStack_constructor = 1;
	// https://github.com/tc39/proposal-explicit-resource-management
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var getBuiltIn = requireGetBuiltIn();
	var aCallable = requireACallable();
	var anInstance = requireAnInstance();
	var defineBuiltIn = requireDefineBuiltIn();
	var defineBuiltIns = requireDefineBuiltIns();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var wellKnownSymbol = requireWellKnownSymbol();
	var InternalStateModule = requireInternalState();
	var addDisposableResource = requireAddDisposableResource();

	var SuppressedError = getBuiltIn('SuppressedError');
	var $ReferenceError = ReferenceError;

	var DISPOSE = wellKnownSymbol('dispose');
	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var DISPOSABLE_STACK = 'DisposableStack';
	var setInternalState = InternalStateModule.set;
	var getDisposableStackInternalState = InternalStateModule.getterFor(DISPOSABLE_STACK);

	var HINT = 'sync-dispose';
	var DISPOSED = 'disposed';
	var PENDING = 'pending';

	var getPendingDisposableStackInternalState = function (stack) {
	  var internalState = getDisposableStackInternalState(stack);
	  if (internalState.state === DISPOSED) throw new $ReferenceError(DISPOSABLE_STACK + ' already disposed');
	  return internalState;
	};

	var $DisposableStack = function DisposableStack() {
	  setInternalState(anInstance(this, DisposableStackPrototype), {
	    type: DISPOSABLE_STACK,
	    state: PENDING,
	    stack: []
	  });

	  if (!DESCRIPTORS) this.disposed = false;
	};

	var DisposableStackPrototype = $DisposableStack.prototype;

	defineBuiltIns(DisposableStackPrototype, {
	  dispose: function dispose() {
	    var internalState = getDisposableStackInternalState(this);
	    if (internalState.state === DISPOSED) return;
	    internalState.state = DISPOSED;
	    if (!DESCRIPTORS) this.disposed = true;
	    var stack = internalState.stack;
	    var i = stack.length;
	    var thrown = false;
	    var suppressed;
	    while (i) {
	      var disposeMethod = stack[--i];
	      stack[i] = null;
	      try {
	        disposeMethod();
	      } catch (errorResult) {
	        if (thrown) {
	          suppressed = new SuppressedError(errorResult, suppressed);
	        } else {
	          thrown = true;
	          suppressed = errorResult;
	        }
	      }
	    }
	    internalState.stack = null;
	    if (thrown) throw suppressed;
	  },
	  use: function use(value) {
	    addDisposableResource(getPendingDisposableStackInternalState(this), value, HINT);
	    return value;
	  },
	  adopt: function adopt(value, onDispose) {
	    var internalState = getPendingDisposableStackInternalState(this);
	    aCallable(onDispose);
	    addDisposableResource(internalState, undefined, HINT, function () {
	      onDispose(value);
	    });
	    return value;
	  },
	  defer: function defer(onDispose) {
	    var internalState = getPendingDisposableStackInternalState(this);
	    aCallable(onDispose);
	    addDisposableResource(internalState, undefined, HINT, onDispose);
	  },
	  move: function move() {
	    var internalState = getPendingDisposableStackInternalState(this);
	    var newDisposableStack = new $DisposableStack();
	    getDisposableStackInternalState(newDisposableStack).stack = internalState.stack;
	    internalState.stack = [];
	    internalState.state = DISPOSED;
	    if (!DESCRIPTORS) this.disposed = true;
	    return newDisposableStack;
	  }
	});

	if (DESCRIPTORS) defineBuiltInAccessor(DisposableStackPrototype, 'disposed', {
	  configurable: true,
	  get: function disposed() {
	    return getDisposableStackInternalState(this).state === DISPOSED;
	  }
	});

	defineBuiltIn(DisposableStackPrototype, DISPOSE, DisposableStackPrototype.dispose, { name: 'dispose' });
	defineBuiltIn(DisposableStackPrototype, TO_STRING_TAG, DISPOSABLE_STACK, { nonWritable: true });

	$({ global: true, constructor: true }, {
	  DisposableStack: $DisposableStack
	});
	return esnext_disposableStack_constructor;
}

var esnext_function_demethodize = {};

var functionDemethodize;
var hasRequiredFunctionDemethodize;

function requireFunctionDemethodize () {
	if (hasRequiredFunctionDemethodize) return functionDemethodize;
	hasRequiredFunctionDemethodize = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var aCallable = requireACallable();

	functionDemethodize = function demethodize() {
	  return uncurryThis(aCallable(this));
	};
	return functionDemethodize;
}

var hasRequiredEsnext_function_demethodize;

function requireEsnext_function_demethodize () {
	if (hasRequiredEsnext_function_demethodize) return esnext_function_demethodize;
	hasRequiredEsnext_function_demethodize = 1;
	var $ = require_export();
	var demethodize = requireFunctionDemethodize();

	// `Function.prototype.demethodize` method
	// https://github.com/js-choi/proposal-function-demethodize
	$({ target: 'Function', proto: true, forced: true }, {
	  demethodize: demethodize
	});
	return esnext_function_demethodize;
}

var esnext_function_isCallable = {};

var hasRequiredEsnext_function_isCallable;

function requireEsnext_function_isCallable () {
	if (hasRequiredEsnext_function_isCallable) return esnext_function_isCallable;
	hasRequiredEsnext_function_isCallable = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var $isCallable = requireIsCallable();
	var inspectSource = requireInspectSource();
	var hasOwn = requireHasOwnProperty();
	var DESCRIPTORS = requireDescriptors();

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var classRegExp = /^\s*class\b/;
	var exec = uncurryThis(classRegExp.exec);

	var isClassConstructor = function (argument) {
	  try {
	    // `Function#toString` throws on some built-it function in some legacy engines
	    // (for example, `DOMQuad` and similar in FF41-)
	    if (!DESCRIPTORS || !exec(classRegExp, inspectSource(argument))) return false;
	  } catch (error) { /* empty */ }
	  var prototype = getOwnPropertyDescriptor(argument, 'prototype');
	  return !!prototype && hasOwn(prototype, 'writable') && !prototype.writable;
	};

	// `Function.isCallable` method
	// https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md
	$({ target: 'Function', stat: true, sham: true, forced: true }, {
	  isCallable: function isCallable(argument) {
	    return $isCallable(argument) && !isClassConstructor(argument);
	  }
	});
	return esnext_function_isCallable;
}

var esnext_function_isConstructor = {};

var hasRequiredEsnext_function_isConstructor;

function requireEsnext_function_isConstructor () {
	if (hasRequiredEsnext_function_isConstructor) return esnext_function_isConstructor;
	hasRequiredEsnext_function_isConstructor = 1;
	var $ = require_export();
	var isConstructor = requireIsConstructor();

	// `Function.isConstructor` method
	// https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md
	$({ target: 'Function', stat: true, forced: true }, {
	  isConstructor: isConstructor
	});
	return esnext_function_isConstructor;
}

var esnext_function_metadata = {};

var hasRequiredEsnext_function_metadata;

function requireEsnext_function_metadata () {
	if (hasRequiredEsnext_function_metadata) return esnext_function_metadata;
	hasRequiredEsnext_function_metadata = 1;
	var wellKnownSymbol = requireWellKnownSymbol();
	var defineProperty = requireObjectDefineProperty().f;

	var METADATA = wellKnownSymbol('metadata');
	var FunctionPrototype = Function.prototype;

	// Function.prototype[@@metadata]
	// https://github.com/tc39/proposal-decorator-metadata
	if (FunctionPrototype[METADATA] === undefined) {
	  defineProperty(FunctionPrototype, METADATA, {
	    value: null
	  });
	}
	return esnext_function_metadata;
}

var esnext_function_unThis = {};

var hasRequiredEsnext_function_unThis;

function requireEsnext_function_unThis () {
	if (hasRequiredEsnext_function_unThis) return esnext_function_unThis;
	hasRequiredEsnext_function_unThis = 1;
	var $ = require_export();
	var demethodize = requireFunctionDemethodize();

	// `Function.prototype.unThis` method
	// https://github.com/js-choi/proposal-function-demethodize
	// TODO: Remove from `core-js@4`
	$({ target: 'Function', proto: true, forced: true, name: 'demethodize' }, {
	  unThis: demethodize
	});
	return esnext_function_unThis;
}

var esnext_globalThis = {};

var hasRequiredEsnext_globalThis;

function requireEsnext_globalThis () {
	if (hasRequiredEsnext_globalThis) return esnext_globalThis;
	hasRequiredEsnext_globalThis = 1;
	// TODO: Remove from `core-js@4`
	requireEs_globalThis();
	return esnext_globalThis;
}

var esnext_iterator_constructor = {};

var hasRequiredEsnext_iterator_constructor;

function requireEsnext_iterator_constructor () {
	if (hasRequiredEsnext_iterator_constructor) return esnext_iterator_constructor;
	hasRequiredEsnext_iterator_constructor = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var anInstance = requireAnInstance();
	var anObject = requireAnObject();
	var isCallable = requireIsCallable();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var createProperty = requireCreateProperty();
	var fails = requireFails();
	var hasOwn = requireHasOwnProperty();
	var wellKnownSymbol = requireWellKnownSymbol();
	var IteratorPrototype = requireIteratorsCore().IteratorPrototype;
	var DESCRIPTORS = requireDescriptors();
	var IS_PURE = requireIsPure();

	var CONSTRUCTOR = 'constructor';
	var ITERATOR = 'Iterator';
	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var $TypeError = TypeError;
	var NativeIterator = globalThis[ITERATOR];

	// FF56- have non-standard global helper `Iterator`
	var FORCED = IS_PURE
	  || !isCallable(NativeIterator)
	  || NativeIterator.prototype !== IteratorPrototype
	  // FF44- non-standard `Iterator` passes previous tests
	  || !fails(function () { NativeIterator({}); });

	var IteratorConstructor = function Iterator() {
	  anInstance(this, IteratorPrototype);
	  if (getPrototypeOf(this) === IteratorPrototype) throw new $TypeError('Abstract class Iterator not directly constructable');
	};

	var defineIteratorPrototypeAccessor = function (key, value) {
	  if (DESCRIPTORS) {
	    defineBuiltInAccessor(IteratorPrototype, key, {
	      configurable: true,
	      get: function () {
	        return value;
	      },
	      set: function (replacement) {
	        anObject(this);
	        if (this === IteratorPrototype) throw new $TypeError("You can't redefine this property");
	        if (hasOwn(this, key)) this[key] = replacement;
	        else createProperty(this, key, replacement);
	      }
	    });
	  } else IteratorPrototype[key] = value;
	};

	if (!hasOwn(IteratorPrototype, TO_STRING_TAG)) defineIteratorPrototypeAccessor(TO_STRING_TAG, ITERATOR);

	if (FORCED || !hasOwn(IteratorPrototype, CONSTRUCTOR) || IteratorPrototype[CONSTRUCTOR] === Object) {
	  defineIteratorPrototypeAccessor(CONSTRUCTOR, IteratorConstructor);
	}

	IteratorConstructor.prototype = IteratorPrototype;

	// `Iterator` constructor
	// https://github.com/tc39/proposal-iterator-helpers
	$({ global: true, constructor: true, forced: FORCED }, {
	  Iterator: IteratorConstructor
	});
	return esnext_iterator_constructor;
}

var esnext_iterator_asIndexedPairs = {};

var iteratorCreateProxy;
var hasRequiredIteratorCreateProxy;

function requireIteratorCreateProxy () {
	if (hasRequiredIteratorCreateProxy) return iteratorCreateProxy;
	hasRequiredIteratorCreateProxy = 1;
	var call = requireFunctionCall();
	var create = requireObjectCreate();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var defineBuiltIns = requireDefineBuiltIns();
	var wellKnownSymbol = requireWellKnownSymbol();
	var InternalStateModule = requireInternalState();
	var getMethod = requireGetMethod();
	var IteratorPrototype = requireIteratorsCore().IteratorPrototype;
	var createIterResultObject = requireCreateIterResultObject();
	var iteratorClose = requireIteratorClose();

	var TO_STRING_TAG = wellKnownSymbol('toStringTag');
	var ITERATOR_HELPER = 'IteratorHelper';
	var WRAP_FOR_VALID_ITERATOR = 'WrapForValidIterator';
	var setInternalState = InternalStateModule.set;

	var createIteratorProxyPrototype = function (IS_ITERATOR) {
	  var getInternalState = InternalStateModule.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER);

	  return defineBuiltIns(create(IteratorPrototype), {
	    next: function next() {
	      var state = getInternalState(this);
	      // for simplification:
	      //   for `%WrapForValidIteratorPrototype%.next` our `nextHandler` returns `IterResultObject`
	      //   for `%IteratorHelperPrototype%.next` - just a value
	      if (IS_ITERATOR) return state.nextHandler();
	      try {
	        var result = state.done ? undefined : state.nextHandler();
	        return createIterResultObject(result, state.done);
	      } catch (error) {
	        state.done = true;
	        throw error;
	      }
	    },
	    'return': function () {
	      var state = getInternalState(this);
	      var iterator = state.iterator;
	      state.done = true;
	      if (IS_ITERATOR) {
	        var returnMethod = getMethod(iterator, 'return');
	        return returnMethod ? call(returnMethod, iterator) : createIterResultObject(undefined, true);
	      }
	      if (state.inner) try {
	        iteratorClose(state.inner.iterator, 'normal');
	      } catch (error) {
	        return iteratorClose(iterator, 'throw', error);
	      }
	      iteratorClose(iterator, 'normal');
	      return createIterResultObject(undefined, true);
	    }
	  });
	};

	var WrapForValidIteratorPrototype = createIteratorProxyPrototype(true);
	var IteratorHelperPrototype = createIteratorProxyPrototype(false);

	createNonEnumerableProperty(IteratorHelperPrototype, TO_STRING_TAG, 'Iterator Helper');

	iteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
	  var IteratorProxy = function Iterator(record, state) {
	    if (state) {
	      state.iterator = record.iterator;
	      state.next = record.next;
	    } else state = record;
	    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER;
	    state.nextHandler = nextHandler;
	    state.counter = 0;
	    state.done = false;
	    setInternalState(this, state);
	  };

	  IteratorProxy.prototype = IS_ITERATOR ? WrapForValidIteratorPrototype : IteratorHelperPrototype;

	  return IteratorProxy;
	};
	return iteratorCreateProxy;
}

var iteratorMap;
var hasRequiredIteratorMap;

function requireIteratorMap () {
	if (hasRequiredIteratorMap) return iteratorMap;
	hasRequiredIteratorMap = 1;
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var createIteratorProxy = requireIteratorCreateProxy();
	var callWithSafeIterationClosing = requireCallWithSafeIterationClosing();

	var IteratorProxy = createIteratorProxy(function () {
	  var iterator = this.iterator;
	  var result = anObject(call(this.next, iterator));
	  var done = this.done = !!result.done;
	  if (!done) return callWithSafeIterationClosing(iterator, this.mapper, [result.value, this.counter++], true);
	});

	// `Iterator.prototype.map` method
	// https://github.com/tc39/proposal-iterator-helpers
	iteratorMap = function map(mapper) {
	  anObject(this);
	  aCallable(mapper);
	  return new IteratorProxy(getIteratorDirect(this), {
	    mapper: mapper
	  });
	};
	return iteratorMap;
}

var iteratorIndexed;
var hasRequiredIteratorIndexed;

function requireIteratorIndexed () {
	if (hasRequiredIteratorIndexed) return iteratorIndexed;
	hasRequiredIteratorIndexed = 1;
	var call = requireFunctionCall();
	var map = requireIteratorMap();

	var callback = function (value, counter) {
	  return [counter, value];
	};

	// `Iterator.prototype.indexed` method
	// https://github.com/tc39/proposal-iterator-helpers
	iteratorIndexed = function indexed() {
	  return call(map, this, callback);
	};
	return iteratorIndexed;
}

var hasRequiredEsnext_iterator_asIndexedPairs;

function requireEsnext_iterator_asIndexedPairs () {
	if (hasRequiredEsnext_iterator_asIndexedPairs) return esnext_iterator_asIndexedPairs;
	hasRequiredEsnext_iterator_asIndexedPairs = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var indexed = requireIteratorIndexed();

	// `Iterator.prototype.asIndexedPairs` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', name: 'indexed', proto: true, real: true, forced: true }, {
	  asIndexedPairs: indexed
	});
	return esnext_iterator_asIndexedPairs;
}

var esnext_iterator_dispose = {};

var hasRequiredEsnext_iterator_dispose;

function requireEsnext_iterator_dispose () {
	if (hasRequiredEsnext_iterator_dispose) return esnext_iterator_dispose;
	hasRequiredEsnext_iterator_dispose = 1;
	// https://github.com/tc39/proposal-explicit-resource-management
	var call = requireFunctionCall();
	var defineBuiltIn = requireDefineBuiltIn();
	var getMethod = requireGetMethod();
	var hasOwn = requireHasOwnProperty();
	var wellKnownSymbol = requireWellKnownSymbol();
	var IteratorPrototype = requireIteratorsCore().IteratorPrototype;

	var DISPOSE = wellKnownSymbol('dispose');

	if (!hasOwn(IteratorPrototype, DISPOSE)) {
	  defineBuiltIn(IteratorPrototype, DISPOSE, function () {
	    var $return = getMethod(this, 'return');
	    if ($return) call($return, this);
	  });
	}
	return esnext_iterator_dispose;
}

var esnext_iterator_drop = {};

var hasRequiredEsnext_iterator_drop;

function requireEsnext_iterator_drop () {
	if (hasRequiredEsnext_iterator_drop) return esnext_iterator_drop;
	hasRequiredEsnext_iterator_drop = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var notANaN = requireNotANan();
	var toPositiveInteger = requireToPositiveInteger();
	var createIteratorProxy = requireIteratorCreateProxy();
	var IS_PURE = requireIsPure();

	var IteratorProxy = createIteratorProxy(function () {
	  var iterator = this.iterator;
	  var next = this.next;
	  var result, done;
	  while (this.remaining) {
	    this.remaining--;
	    result = anObject(call(next, iterator));
	    done = this.done = !!result.done;
	    if (done) return;
	  }
	  result = anObject(call(next, iterator));
	  done = this.done = !!result.done;
	  if (!done) return result.value;
	});

	// `Iterator.prototype.drop` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true, forced: IS_PURE }, {
	  drop: function drop(limit) {
	    anObject(this);
	    var remaining = toPositiveInteger(notANaN(+limit));
	    return new IteratorProxy(getIteratorDirect(this), {
	      remaining: remaining
	    });
	  }
	});
	return esnext_iterator_drop;
}

var esnext_iterator_every = {};

var hasRequiredEsnext_iterator_every;

function requireEsnext_iterator_every () {
	if (hasRequiredEsnext_iterator_every) return esnext_iterator_every;
	hasRequiredEsnext_iterator_every = 1;
	var $ = require_export();
	var iterate = requireIterate();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();

	// `Iterator.prototype.every` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true }, {
	  every: function every(predicate) {
	    anObject(this);
	    aCallable(predicate);
	    var record = getIteratorDirect(this);
	    var counter = 0;
	    return !iterate(record, function (value, stop) {
	      if (!predicate(value, counter++)) return stop();
	    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
	  }
	});
	return esnext_iterator_every;
}

var esnext_iterator_filter = {};

var hasRequiredEsnext_iterator_filter;

function requireEsnext_iterator_filter () {
	if (hasRequiredEsnext_iterator_filter) return esnext_iterator_filter;
	hasRequiredEsnext_iterator_filter = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var createIteratorProxy = requireIteratorCreateProxy();
	var callWithSafeIterationClosing = requireCallWithSafeIterationClosing();
	var IS_PURE = requireIsPure();

	var IteratorProxy = createIteratorProxy(function () {
	  var iterator = this.iterator;
	  var predicate = this.predicate;
	  var next = this.next;
	  var result, done, value;
	  while (true) {
	    result = anObject(call(next, iterator));
	    done = this.done = !!result.done;
	    if (done) return;
	    value = result.value;
	    if (callWithSafeIterationClosing(iterator, predicate, [value, this.counter++], true)) return value;
	  }
	});

	// `Iterator.prototype.filter` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true, forced: IS_PURE }, {
	  filter: function filter(predicate) {
	    anObject(this);
	    aCallable(predicate);
	    return new IteratorProxy(getIteratorDirect(this), {
	      predicate: predicate
	    });
	  }
	});
	return esnext_iterator_filter;
}

var esnext_iterator_find = {};

var hasRequiredEsnext_iterator_find;

function requireEsnext_iterator_find () {
	if (hasRequiredEsnext_iterator_find) return esnext_iterator_find;
	hasRequiredEsnext_iterator_find = 1;
	var $ = require_export();
	var iterate = requireIterate();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();

	// `Iterator.prototype.find` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true }, {
	  find: function find(predicate) {
	    anObject(this);
	    aCallable(predicate);
	    var record = getIteratorDirect(this);
	    var counter = 0;
	    return iterate(record, function (value, stop) {
	      if (predicate(value, counter++)) return stop(value);
	    }, { IS_RECORD: true, INTERRUPTED: true }).result;
	  }
	});
	return esnext_iterator_find;
}

var esnext_iterator_flatMap = {};

var getIteratorFlattenable;
var hasRequiredGetIteratorFlattenable;

function requireGetIteratorFlattenable () {
	if (hasRequiredGetIteratorFlattenable) return getIteratorFlattenable;
	hasRequiredGetIteratorFlattenable = 1;
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var getIteratorMethod = requireGetIteratorMethod();

	getIteratorFlattenable = function (obj, stringHandling) {
	  if (!stringHandling || typeof obj !== 'string') anObject(obj);
	  var method = getIteratorMethod(obj);
	  return getIteratorDirect(anObject(method !== undefined ? call(method, obj) : obj));
	};
	return getIteratorFlattenable;
}

var hasRequiredEsnext_iterator_flatMap;

function requireEsnext_iterator_flatMap () {
	if (hasRequiredEsnext_iterator_flatMap) return esnext_iterator_flatMap;
	hasRequiredEsnext_iterator_flatMap = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var getIteratorFlattenable = requireGetIteratorFlattenable();
	var createIteratorProxy = requireIteratorCreateProxy();
	var iteratorClose = requireIteratorClose();
	var IS_PURE = requireIsPure();

	var IteratorProxy = createIteratorProxy(function () {
	  var iterator = this.iterator;
	  var mapper = this.mapper;
	  var result, inner;

	  while (true) {
	    if (inner = this.inner) try {
	      result = anObject(call(inner.next, inner.iterator));
	      if (!result.done) return result.value;
	      this.inner = null;
	    } catch (error) { iteratorClose(iterator, 'throw', error); }

	    result = anObject(call(this.next, iterator));

	    if (this.done = !!result.done) return;

	    try {
	      this.inner = getIteratorFlattenable(mapper(result.value, this.counter++), false);
	    } catch (error) { iteratorClose(iterator, 'throw', error); }
	  }
	});

	// `Iterator.prototype.flatMap` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true, forced: IS_PURE }, {
	  flatMap: function flatMap(mapper) {
	    anObject(this);
	    aCallable(mapper);
	    return new IteratorProxy(getIteratorDirect(this), {
	      mapper: mapper,
	      inner: null
	    });
	  }
	});
	return esnext_iterator_flatMap;
}

var esnext_iterator_forEach = {};

var hasRequiredEsnext_iterator_forEach;

function requireEsnext_iterator_forEach () {
	if (hasRequiredEsnext_iterator_forEach) return esnext_iterator_forEach;
	hasRequiredEsnext_iterator_forEach = 1;
	var $ = require_export();
	var iterate = requireIterate();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();

	// `Iterator.prototype.forEach` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true }, {
	  forEach: function forEach(fn) {
	    anObject(this);
	    aCallable(fn);
	    var record = getIteratorDirect(this);
	    var counter = 0;
	    iterate(record, function (value) {
	      fn(value, counter++);
	    }, { IS_RECORD: true });
	  }
	});
	return esnext_iterator_forEach;
}

var esnext_iterator_from = {};

var hasRequiredEsnext_iterator_from;

function requireEsnext_iterator_from () {
	if (hasRequiredEsnext_iterator_from) return esnext_iterator_from;
	hasRequiredEsnext_iterator_from = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var toObject = requireToObject();
	var isPrototypeOf = requireObjectIsPrototypeOf();
	var IteratorPrototype = requireIteratorsCore().IteratorPrototype;
	var createIteratorProxy = requireIteratorCreateProxy();
	var getIteratorFlattenable = requireGetIteratorFlattenable();
	var IS_PURE = requireIsPure();

	var IteratorProxy = createIteratorProxy(function () {
	  return call(this.next, this.iterator);
	}, true);

	// `Iterator.from` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', stat: true, forced: IS_PURE }, {
	  from: function from(O) {
	    var iteratorRecord = getIteratorFlattenable(typeof O == 'string' ? toObject(O) : O, true);
	    return isPrototypeOf(IteratorPrototype, iteratorRecord.iterator)
	      ? iteratorRecord.iterator
	      : new IteratorProxy(iteratorRecord);
	  }
	});
	return esnext_iterator_from;
}

var esnext_iterator_indexed = {};

var hasRequiredEsnext_iterator_indexed;

function requireEsnext_iterator_indexed () {
	if (hasRequiredEsnext_iterator_indexed) return esnext_iterator_indexed;
	hasRequiredEsnext_iterator_indexed = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var indexed = requireIteratorIndexed();

	// `Iterator.prototype.indexed` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true, forced: true }, {
	  indexed: indexed
	});
	return esnext_iterator_indexed;
}

var esnext_iterator_map = {};

var hasRequiredEsnext_iterator_map;

function requireEsnext_iterator_map () {
	if (hasRequiredEsnext_iterator_map) return esnext_iterator_map;
	hasRequiredEsnext_iterator_map = 1;
	var $ = require_export();
	var map = requireIteratorMap();
	var IS_PURE = requireIsPure();

	// `Iterator.prototype.map` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true, forced: IS_PURE }, {
	  map: map
	});
	return esnext_iterator_map;
}

var esnext_iterator_range = {};

var hasRequiredEsnext_iterator_range;

function requireEsnext_iterator_range () {
	if (hasRequiredEsnext_iterator_range) return esnext_iterator_range;
	hasRequiredEsnext_iterator_range = 1;
	/* eslint-disable es/no-bigint -- safe */
	var $ = require_export();
	var NumericRangeIterator = requireNumericRangeIterator();

	var $TypeError = TypeError;

	// `Iterator.range` method
	// https://github.com/tc39/proposal-Number.range
	$({ target: 'Iterator', stat: true, forced: true }, {
	  range: function range(start, end, option) {
	    if (typeof start == 'number') return new NumericRangeIterator(start, end, option, 'number', 0, 1);
	    if (typeof start == 'bigint') return new NumericRangeIterator(start, end, option, 'bigint', BigInt(0), BigInt(1));
	    throw new $TypeError('Incorrect Iterator.range arguments');
	  }
	});
	return esnext_iterator_range;
}

var esnext_iterator_reduce = {};

var hasRequiredEsnext_iterator_reduce;

function requireEsnext_iterator_reduce () {
	if (hasRequiredEsnext_iterator_reduce) return esnext_iterator_reduce;
	hasRequiredEsnext_iterator_reduce = 1;
	var $ = require_export();
	var iterate = requireIterate();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();

	var $TypeError = TypeError;

	// `Iterator.prototype.reduce` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true }, {
	  reduce: function reduce(reducer /* , initialValue */) {
	    anObject(this);
	    aCallable(reducer);
	    var record = getIteratorDirect(this);
	    var noInitial = arguments.length < 2;
	    var accumulator = noInitial ? undefined : arguments[1];
	    var counter = 0;
	    iterate(record, function (value) {
	      if (noInitial) {
	        noInitial = false;
	        accumulator = value;
	      } else {
	        accumulator = reducer(accumulator, value, counter);
	      }
	      counter++;
	    }, { IS_RECORD: true });
	    if (noInitial) throw new $TypeError('Reduce of empty iterator with no initial value');
	    return accumulator;
	  }
	});
	return esnext_iterator_reduce;
}

var esnext_iterator_some = {};

var hasRequiredEsnext_iterator_some;

function requireEsnext_iterator_some () {
	if (hasRequiredEsnext_iterator_some) return esnext_iterator_some;
	hasRequiredEsnext_iterator_some = 1;
	var $ = require_export();
	var iterate = requireIterate();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();

	// `Iterator.prototype.some` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true }, {
	  some: function some(predicate) {
	    anObject(this);
	    aCallable(predicate);
	    var record = getIteratorDirect(this);
	    var counter = 0;
	    return iterate(record, function (value, stop) {
	      if (predicate(value, counter++)) return stop();
	    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
	  }
	});
	return esnext_iterator_some;
}

var esnext_iterator_take = {};

var hasRequiredEsnext_iterator_take;

function requireEsnext_iterator_take () {
	if (hasRequiredEsnext_iterator_take) return esnext_iterator_take;
	hasRequiredEsnext_iterator_take = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var getIteratorDirect = requireGetIteratorDirect();
	var notANaN = requireNotANan();
	var toPositiveInteger = requireToPositiveInteger();
	var createIteratorProxy = requireIteratorCreateProxy();
	var iteratorClose = requireIteratorClose();
	var IS_PURE = requireIsPure();

	var IteratorProxy = createIteratorProxy(function () {
	  var iterator = this.iterator;
	  if (!this.remaining--) {
	    this.done = true;
	    return iteratorClose(iterator, 'normal', undefined);
	  }
	  var result = anObject(call(this.next, iterator));
	  var done = this.done = !!result.done;
	  if (!done) return result.value;
	});

	// `Iterator.prototype.take` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true, forced: IS_PURE }, {
	  take: function take(limit) {
	    anObject(this);
	    var remaining = toPositiveInteger(notANaN(+limit));
	    return new IteratorProxy(getIteratorDirect(this), {
	      remaining: remaining
	    });
	  }
	});
	return esnext_iterator_take;
}

var esnext_iterator_toArray = {};

var hasRequiredEsnext_iterator_toArray;

function requireEsnext_iterator_toArray () {
	if (hasRequiredEsnext_iterator_toArray) return esnext_iterator_toArray;
	hasRequiredEsnext_iterator_toArray = 1;
	var $ = require_export();
	var anObject = requireAnObject();
	var iterate = requireIterate();
	var getIteratorDirect = requireGetIteratorDirect();

	var push = [].push;

	// `Iterator.prototype.toArray` method
	// https://github.com/tc39/proposal-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true }, {
	  toArray: function toArray() {
	    var result = [];
	    iterate(getIteratorDirect(anObject(this)), push, { that: result, IS_RECORD: true });
	    return result;
	  }
	});
	return esnext_iterator_toArray;
}

var esnext_iterator_toAsync = {};

var hasRequiredEsnext_iterator_toAsync;

function requireEsnext_iterator_toAsync () {
	if (hasRequiredEsnext_iterator_toAsync) return esnext_iterator_toAsync;
	hasRequiredEsnext_iterator_toAsync = 1;
	var $ = require_export();
	var anObject = requireAnObject();
	var AsyncFromSyncIterator = requireAsyncFromSyncIterator();
	var WrapAsyncIterator = requireAsyncIteratorWrap();
	var getIteratorDirect = requireGetIteratorDirect();
	var IS_PURE = requireIsPure();

	// `Iterator.prototype.toAsync` method
	// https://github.com/tc39/proposal-async-iterator-helpers
	$({ target: 'Iterator', proto: true, real: true, forced: IS_PURE }, {
	  toAsync: function toAsync() {
	    return new WrapAsyncIterator(getIteratorDirect(new AsyncFromSyncIterator(getIteratorDirect(anObject(this)))));
	  }
	});
	return esnext_iterator_toAsync;
}

var esnext_json_isRawJson = {};

var nativeRawJson;
var hasRequiredNativeRawJson;

function requireNativeRawJson () {
	if (hasRequiredNativeRawJson) return nativeRawJson;
	hasRequiredNativeRawJson = 1;
	/* eslint-disable es/no-json -- safe */
	var fails = requireFails();

	nativeRawJson = !fails(function () {
	  var unsafeInt = '9007199254740993';
	  var raw = JSON.rawJSON(unsafeInt);
	  return !JSON.isRawJSON(raw) || JSON.stringify(raw) !== unsafeInt;
	});
	return nativeRawJson;
}

var isRawJson;
var hasRequiredIsRawJson;

function requireIsRawJson () {
	if (hasRequiredIsRawJson) return isRawJson;
	hasRequiredIsRawJson = 1;
	var isObject = requireIsObject();
	var getInternalState = requireInternalState().get;

	isRawJson = function isRawJSON(O) {
	  if (!isObject(O)) return false;
	  var state = getInternalState(O);
	  return !!state && state.type === 'RawJSON';
	};
	return isRawJson;
}

var hasRequiredEsnext_json_isRawJson;

function requireEsnext_json_isRawJson () {
	if (hasRequiredEsnext_json_isRawJson) return esnext_json_isRawJson;
	hasRequiredEsnext_json_isRawJson = 1;
	var $ = require_export();
	var NATIVE_RAW_JSON = requireNativeRawJson();
	var isRawJSON = requireIsRawJson();

	// `JSON.parse` method
	// https://tc39.es/proposal-json-parse-with-source/#sec-json.israwjson
	// https://github.com/tc39/proposal-json-parse-with-source
	$({ target: 'JSON', stat: true, forced: !NATIVE_RAW_JSON }, {
	  isRawJSON: isRawJSON
	});
	return esnext_json_isRawJson;
}

var esnext_json_parse = {};

var parseJsonString;
var hasRequiredParseJsonString;

function requireParseJsonString () {
	if (hasRequiredParseJsonString) return parseJsonString;
	hasRequiredParseJsonString = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var hasOwn = requireHasOwnProperty();

	var $SyntaxError = SyntaxError;
	var $parseInt = parseInt;
	var fromCharCode = String.fromCharCode;
	var at = uncurryThis(''.charAt);
	var slice = uncurryThis(''.slice);
	var exec = uncurryThis(/./.exec);

	var codePoints = {
	  '\\"': '"',
	  '\\\\': '\\',
	  '\\/': '/',
	  '\\b': '\b',
	  '\\f': '\f',
	  '\\n': '\n',
	  '\\r': '\r',
	  '\\t': '\t'
	};

	var IS_4_HEX_DIGITS = /^[\da-f]{4}$/i;
	// eslint-disable-next-line regexp/no-control-character -- safe
	var IS_C0_CONTROL_CODE = /^[\u0000-\u001F]$/;

	parseJsonString = function (source, i) {
	  var unterminated = true;
	  var value = '';
	  while (i < source.length) {
	    var chr = at(source, i);
	    if (chr === '\\') {
	      var twoChars = slice(source, i, i + 2);
	      if (hasOwn(codePoints, twoChars)) {
	        value += codePoints[twoChars];
	        i += 2;
	      } else if (twoChars === '\\u') {
	        i += 2;
	        var fourHexDigits = slice(source, i, i + 4);
	        if (!exec(IS_4_HEX_DIGITS, fourHexDigits)) throw new $SyntaxError('Bad Unicode escape at: ' + i);
	        value += fromCharCode($parseInt(fourHexDigits, 16));
	        i += 4;
	      } else throw new $SyntaxError('Unknown escape sequence: "' + twoChars + '"');
	    } else if (chr === '"') {
	      unterminated = false;
	      i++;
	      break;
	    } else {
	      if (exec(IS_C0_CONTROL_CODE, chr)) throw new $SyntaxError('Bad control character in string literal at: ' + i);
	      value += chr;
	      i++;
	    }
	  }
	  if (unterminated) throw new $SyntaxError('Unterminated string at: ' + i);
	  return { value: value, end: i };
	};
	return parseJsonString;
}

var hasRequiredEsnext_json_parse;

function requireEsnext_json_parse () {
	if (hasRequiredEsnext_json_parse) return esnext_json_parse;
	hasRequiredEsnext_json_parse = 1;
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var globalThis = requireGlobalThis();
	var getBuiltIn = requireGetBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var call = requireFunctionCall();
	var isCallable = requireIsCallable();
	var isObject = requireIsObject();
	var isArray = requireIsArray();
	var hasOwn = requireHasOwnProperty();
	var toString = requireToString();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var createProperty = requireCreateProperty();
	var fails = requireFails();
	var parseJSONString = requireParseJsonString();
	var NATIVE_SYMBOL = requireSymbolConstructorDetection();

	var JSON = globalThis.JSON;
	var Number = globalThis.Number;
	var SyntaxError = globalThis.SyntaxError;
	var nativeParse = JSON && JSON.parse;
	var enumerableOwnProperties = getBuiltIn('Object', 'keys');
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var at = uncurryThis(''.charAt);
	var slice = uncurryThis(''.slice);
	var exec = uncurryThis(/./.exec);
	var push = uncurryThis([].push);

	var IS_DIGIT = /^\d$/;
	var IS_NON_ZERO_DIGIT = /^[1-9]$/;
	var IS_NUMBER_START = /^[\d-]$/;
	var IS_WHITESPACE = /^[\t\n\r ]$/;

	var PRIMITIVE = 0;
	var OBJECT = 1;

	var $parse = function (source, reviver) {
	  source = toString(source);
	  var context = new Context(source, 0);
	  var root = context.parse();
	  var value = root.value;
	  var endIndex = context.skip(IS_WHITESPACE, root.end);
	  if (endIndex < source.length) {
	    throw new SyntaxError('Unexpected extra character: "' + at(source, endIndex) + '" after the parsed data at: ' + endIndex);
	  }
	  return isCallable(reviver) ? internalize({ '': value }, '', reviver, root) : value;
	};

	var internalize = function (holder, name, reviver, node) {
	  var val = holder[name];
	  var unmodified = node && val === node.value;
	  var context = unmodified && typeof node.source == 'string' ? { source: node.source } : {};
	  var elementRecordsLen, keys, len, i, P;
	  if (isObject(val)) {
	    var nodeIsArray = isArray(val);
	    var nodes = unmodified ? node.nodes : nodeIsArray ? [] : {};
	    if (nodeIsArray) {
	      elementRecordsLen = nodes.length;
	      len = lengthOfArrayLike(val);
	      for (i = 0; i < len; i++) {
	        internalizeProperty(val, i, internalize(val, '' + i, reviver, i < elementRecordsLen ? nodes[i] : undefined));
	      }
	    } else {
	      keys = enumerableOwnProperties(val);
	      len = lengthOfArrayLike(keys);
	      for (i = 0; i < len; i++) {
	        P = keys[i];
	        internalizeProperty(val, P, internalize(val, P, reviver, hasOwn(nodes, P) ? nodes[P] : undefined));
	      }
	    }
	  }
	  return call(reviver, holder, name, val, context);
	};

	var internalizeProperty = function (object, key, value) {
	  if (DESCRIPTORS) {
	    var descriptor = getOwnPropertyDescriptor(object, key);
	    if (descriptor && !descriptor.configurable) return;
	  }
	  if (value === undefined) delete object[key];
	  else createProperty(object, key, value);
	};

	var Node = function (value, end, source, nodes) {
	  this.value = value;
	  this.end = end;
	  this.source = source;
	  this.nodes = nodes;
	};

	var Context = function (source, index) {
	  this.source = source;
	  this.index = index;
	};

	// https://www.json.org/json-en.html
	Context.prototype = {
	  fork: function (nextIndex) {
	    return new Context(this.source, nextIndex);
	  },
	  parse: function () {
	    var source = this.source;
	    var i = this.skip(IS_WHITESPACE, this.index);
	    var fork = this.fork(i);
	    var chr = at(source, i);
	    if (exec(IS_NUMBER_START, chr)) return fork.number();
	    switch (chr) {
	      case '{':
	        return fork.object();
	      case '[':
	        return fork.array();
	      case '"':
	        return fork.string();
	      case 't':
	        return fork.keyword(true);
	      case 'f':
	        return fork.keyword(false);
	      case 'n':
	        return fork.keyword(null);
	    } throw new SyntaxError('Unexpected character: "' + chr + '" at: ' + i);
	  },
	  node: function (type, value, start, end, nodes) {
	    return new Node(value, end, type ? null : slice(this.source, start, end), nodes);
	  },
	  object: function () {
	    var source = this.source;
	    var i = this.index + 1;
	    var expectKeypair = false;
	    var object = {};
	    var nodes = {};
	    while (i < source.length) {
	      i = this.until(['"', '}'], i);
	      if (at(source, i) === '}' && !expectKeypair) {
	        i++;
	        break;
	      }
	      // Parsing the key
	      var result = this.fork(i).string();
	      var key = result.value;
	      i = result.end;
	      i = this.until([':'], i) + 1;
	      // Parsing value
	      i = this.skip(IS_WHITESPACE, i);
	      result = this.fork(i).parse();
	      createProperty(nodes, key, result);
	      createProperty(object, key, result.value);
	      i = this.until([',', '}'], result.end);
	      var chr = at(source, i);
	      if (chr === ',') {
	        expectKeypair = true;
	        i++;
	      } else if (chr === '}') {
	        i++;
	        break;
	      }
	    }
	    return this.node(OBJECT, object, this.index, i, nodes);
	  },
	  array: function () {
	    var source = this.source;
	    var i = this.index + 1;
	    var expectElement = false;
	    var array = [];
	    var nodes = [];
	    while (i < source.length) {
	      i = this.skip(IS_WHITESPACE, i);
	      if (at(source, i) === ']' && !expectElement) {
	        i++;
	        break;
	      }
	      var result = this.fork(i).parse();
	      push(nodes, result);
	      push(array, result.value);
	      i = this.until([',', ']'], result.end);
	      if (at(source, i) === ',') {
	        expectElement = true;
	        i++;
	      } else if (at(source, i) === ']') {
	        i++;
	        break;
	      }
	    }
	    return this.node(OBJECT, array, this.index, i, nodes);
	  },
	  string: function () {
	    var index = this.index;
	    var parsed = parseJSONString(this.source, this.index + 1);
	    return this.node(PRIMITIVE, parsed.value, index, parsed.end);
	  },
	  number: function () {
	    var source = this.source;
	    var startIndex = this.index;
	    var i = startIndex;
	    if (at(source, i) === '-') i++;
	    if (at(source, i) === '0') i++;
	    else if (exec(IS_NON_ZERO_DIGIT, at(source, i))) i = this.skip(IS_DIGIT, i + 1);
	    else throw new SyntaxError('Failed to parse number at: ' + i);
	    if (at(source, i) === '.') i = this.skip(IS_DIGIT, i + 1);
	    if (at(source, i) === 'e' || at(source, i) === 'E') {
	      i++;
	      if (at(source, i) === '+' || at(source, i) === '-') i++;
	      var exponentStartIndex = i;
	      i = this.skip(IS_DIGIT, i);
	      if (exponentStartIndex === i) throw new SyntaxError("Failed to parse number's exponent value at: " + i);
	    }
	    return this.node(PRIMITIVE, Number(slice(source, startIndex, i)), startIndex, i);
	  },
	  keyword: function (value) {
	    var keyword = '' + value;
	    var index = this.index;
	    var endIndex = index + keyword.length;
	    if (slice(this.source, index, endIndex) !== keyword) throw new SyntaxError('Failed to parse value at: ' + index);
	    return this.node(PRIMITIVE, value, index, endIndex);
	  },
	  skip: function (regex, i) {
	    var source = this.source;
	    for (; i < source.length; i++) if (!exec(regex, at(source, i))) break;
	    return i;
	  },
	  until: function (array, i) {
	    i = this.skip(IS_WHITESPACE, i);
	    var chr = at(this.source, i);
	    for (var j = 0; j < array.length; j++) if (array[j] === chr) return i;
	    throw new SyntaxError('Unexpected character: "' + chr + '" at: ' + i);
	  }
	};

	var NO_SOURCE_SUPPORT = fails(function () {
	  var unsafeInt = '9007199254740993';
	  var source;
	  nativeParse(unsafeInt, function (key, value, context) {
	    source = context.source;
	  });
	  return source !== unsafeInt;
	});

	var PROPER_BASE_PARSE = NATIVE_SYMBOL && !fails(function () {
	  // Safari 9 bug
	  return 1 / nativeParse('-0 \t') !== -Infinity;
	});

	// `JSON.parse` method
	// https://tc39.es/ecma262/#sec-json.parse
	// https://github.com/tc39/proposal-json-parse-with-source
	$({ target: 'JSON', stat: true, forced: NO_SOURCE_SUPPORT }, {
	  parse: function parse(text, reviver) {
	    return PROPER_BASE_PARSE && !isCallable(reviver) ? nativeParse(text) : $parse(text, reviver);
	  }
	});
	return esnext_json_parse;
}

var esnext_json_rawJson = {};

var hasRequiredEsnext_json_rawJson;

function requireEsnext_json_rawJson () {
	if (hasRequiredEsnext_json_rawJson) return esnext_json_rawJson;
	hasRequiredEsnext_json_rawJson = 1;
	var $ = require_export();
	var FREEZING = requireFreezing();
	var NATIVE_RAW_JSON = requireNativeRawJson();
	var getBuiltIn = requireGetBuiltIn();
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var isCallable = requireIsCallable();
	var isRawJSON = requireIsRawJson();
	var toString = requireToString();
	var createProperty = requireCreateProperty();
	var parseJSONString = requireParseJsonString();
	var getReplacerFunction = requireGetJsonReplacerFunction();
	var uid = requireUid();
	var setInternalState = requireInternalState().set;

	var $String = String;
	var $SyntaxError = SyntaxError;
	var parse = getBuiltIn('JSON', 'parse');
	var $stringify = getBuiltIn('JSON', 'stringify');
	var create = getBuiltIn('Object', 'create');
	var freeze = getBuiltIn('Object', 'freeze');
	var at = uncurryThis(''.charAt);
	var slice = uncurryThis(''.slice);
	var push = uncurryThis([].push);

	var MARK = uid();
	var MARK_LENGTH = MARK.length;
	var ERROR_MESSAGE = 'Unacceptable as raw JSON';

	var isWhitespace = function (it) {
	  return it === ' ' || it === '\t' || it === '\n' || it === '\r';
	};

	// `JSON.parse` method
	// https://tc39.es/proposal-json-parse-with-source/#sec-json.israwjson
	// https://github.com/tc39/proposal-json-parse-with-source
	$({ target: 'JSON', stat: true, forced: !NATIVE_RAW_JSON }, {
	  rawJSON: function rawJSON(text) {
	    var jsonString = toString(text);
	    if (jsonString === '' || isWhitespace(at(jsonString, 0)) || isWhitespace(at(jsonString, jsonString.length - 1))) {
	      throw new $SyntaxError(ERROR_MESSAGE);
	    }
	    var parsed = parse(jsonString);
	    if (typeof parsed == 'object' && parsed !== null) throw new $SyntaxError(ERROR_MESSAGE);
	    var obj = create(null);
	    setInternalState(obj, { type: 'RawJSON' });
	    createProperty(obj, 'rawJSON', jsonString);
	    return FREEZING ? freeze(obj) : obj;
	  }
	});

	// `JSON.stringify` method
	// https://tc39.es/ecma262/#sec-json.stringify
	// https://github.com/tc39/proposal-json-parse-with-source
	if ($stringify) $({ target: 'JSON', stat: true, arity: 3, forced: !NATIVE_RAW_JSON }, {
	  stringify: function stringify(text, replacer, space) {
	    var replacerFunction = getReplacerFunction(replacer);
	    var rawStrings = [];

	    var json = $stringify(text, function (key, value) {
	      // some old implementations (like WebKit) could pass numbers as keys
	      var v = isCallable(replacerFunction) ? call(replacerFunction, this, $String(key), value) : value;
	      return isRawJSON(v) ? MARK + (push(rawStrings, v.rawJSON) - 1) : v;
	    }, space);

	    if (typeof json != 'string') return json;

	    var result = '';
	    var length = json.length;

	    for (var i = 0; i < length; i++) {
	      var chr = at(json, i);
	      if (chr === '"') {
	        var end = parseJSONString(json, ++i).end - 1;
	        var string = slice(json, i, end);
	        result += slice(string, 0, MARK_LENGTH) === MARK
	          ? rawStrings[slice(string, MARK_LENGTH)]
	          : '"' + string + '"';
	        i = end;
	      } else result += chr;
	    }

	    return result;
	  }
	});
	return esnext_json_rawJson;
}

var esnext_map_deleteAll = {};

var aMap;
var hasRequiredAMap;

function requireAMap () {
	if (hasRequiredAMap) return aMap;
	hasRequiredAMap = 1;
	var has = requireMapHelpers().has;

	// Perform ? RequireInternalSlot(M, [[MapData]])
	aMap = function (it) {
	  has(it);
	  return it;
	};
	return aMap;
}

var hasRequiredEsnext_map_deleteAll;

function requireEsnext_map_deleteAll () {
	if (hasRequiredEsnext_map_deleteAll) return esnext_map_deleteAll;
	hasRequiredEsnext_map_deleteAll = 1;
	var $ = require_export();
	var aMap = requireAMap();
	var remove = requireMapHelpers().remove;

	// `Map.prototype.deleteAll` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  deleteAll: function deleteAll(/* ...elements */) {
	    var collection = aMap(this);
	    var allDeleted = true;
	    var wasDeleted;
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      wasDeleted = remove(collection, arguments[k]);
	      allDeleted = allDeleted && wasDeleted;
	    } return !!allDeleted;
	  }
	});
	return esnext_map_deleteAll;
}

var esnext_map_emplace = {};

var hasRequiredEsnext_map_emplace;

function requireEsnext_map_emplace () {
	if (hasRequiredEsnext_map_emplace) return esnext_map_emplace;
	hasRequiredEsnext_map_emplace = 1;
	var $ = require_export();
	var aMap = requireAMap();
	var MapHelpers = requireMapHelpers();

	var get = MapHelpers.get;
	var has = MapHelpers.has;
	var set = MapHelpers.set;

	// `Map.prototype.emplace` method
	// https://github.com/tc39/proposal-upsert
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  emplace: function emplace(key, handler) {
	    var map = aMap(this);
	    var value, inserted;
	    if (has(map, key)) {
	      value = get(map, key);
	      if ('update' in handler) {
	        value = handler.update(value, key, map);
	        set(map, key, value);
	      } return value;
	    }
	    inserted = handler.insert(key, map);
	    set(map, key, inserted);
	    return inserted;
	  }
	});
	return esnext_map_emplace;
}

var esnext_map_every = {};

var hasRequiredEsnext_map_every;

function requireEsnext_map_every () {
	if (hasRequiredEsnext_map_every) return esnext_map_every;
	hasRequiredEsnext_map_every = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aMap = requireAMap();
	var iterate = requireMapIterate();

	// `Map.prototype.every` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  every: function every(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return iterate(map, function (value, key) {
	      if (!boundFunction(value, key, map)) return false;
	    }, true) !== false;
	  }
	});
	return esnext_map_every;
}

var esnext_map_filter = {};

var hasRequiredEsnext_map_filter;

function requireEsnext_map_filter () {
	if (hasRequiredEsnext_map_filter) return esnext_map_filter;
	hasRequiredEsnext_map_filter = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aMap = requireAMap();
	var MapHelpers = requireMapHelpers();
	var iterate = requireMapIterate();

	var Map = MapHelpers.Map;
	var set = MapHelpers.set;

	// `Map.prototype.filter` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var newMap = new Map();
	    iterate(map, function (value, key) {
	      if (boundFunction(value, key, map)) set(newMap, key, value);
	    });
	    return newMap;
	  }
	});
	return esnext_map_filter;
}

var esnext_map_find = {};

var hasRequiredEsnext_map_find;

function requireEsnext_map_find () {
	if (hasRequiredEsnext_map_find) return esnext_map_find;
	hasRequiredEsnext_map_find = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aMap = requireAMap();
	var iterate = requireMapIterate();

	// `Map.prototype.find` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  find: function find(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var result = iterate(map, function (value, key) {
	      if (boundFunction(value, key, map)) return { value: value };
	    }, true);
	    return result && result.value;
	  }
	});
	return esnext_map_find;
}

var esnext_map_findKey = {};

var hasRequiredEsnext_map_findKey;

function requireEsnext_map_findKey () {
	if (hasRequiredEsnext_map_findKey) return esnext_map_findKey;
	hasRequiredEsnext_map_findKey = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aMap = requireAMap();
	var iterate = requireMapIterate();

	// `Map.prototype.findKey` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  findKey: function findKey(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var result = iterate(map, function (value, key) {
	      if (boundFunction(value, key, map)) return { key: key };
	    }, true);
	    return result && result.key;
	  }
	});
	return esnext_map_findKey;
}

var esnext_map_from = {};

var collectionFrom;
var hasRequiredCollectionFrom;

function requireCollectionFrom () {
	if (hasRequiredCollectionFrom) return collectionFrom;
	hasRequiredCollectionFrom = 1;
	// https://tc39.github.io/proposal-setmap-offrom/
	var bind = requireFunctionBindContext();
	var anObject = requireAnObject();
	var toObject = requireToObject();
	var iterate = requireIterate();

	collectionFrom = function (C, adder, ENTRY) {
	  return function from(source /* , mapFn, thisArg */) {
	    var O = toObject(source);
	    var length = arguments.length;
	    var mapFn = length > 1 ? arguments[1] : undefined;
	    var mapping = mapFn !== undefined;
	    var boundFunction = mapping ? bind(mapFn, length > 2 ? arguments[2] : undefined) : undefined;
	    var result = new C();
	    var n = 0;
	    iterate(O, function (nextItem) {
	      var entry = mapping ? boundFunction(nextItem, n++) : nextItem;
	      if (ENTRY) adder(result, anObject(entry)[0], entry[1]);
	      else adder(result, entry);
	    });
	    return result;
	  };
	};
	return collectionFrom;
}

var hasRequiredEsnext_map_from;

function requireEsnext_map_from () {
	if (hasRequiredEsnext_map_from) return esnext_map_from;
	hasRequiredEsnext_map_from = 1;
	var $ = require_export();
	var MapHelpers = requireMapHelpers();
	var createCollectionFrom = requireCollectionFrom();

	// `Map.from` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
	$({ target: 'Map', stat: true, forced: true }, {
	  from: createCollectionFrom(MapHelpers.Map, MapHelpers.set, true)
	});
	return esnext_map_from;
}

var esnext_map_groupBy = {};

var hasRequiredEsnext_map_groupBy;

function requireEsnext_map_groupBy () {
	if (hasRequiredEsnext_map_groupBy) return esnext_map_groupBy;
	hasRequiredEsnext_map_groupBy = 1;
	// TODO: Remove from `core-js@4`
	requireEs_map_groupBy();
	return esnext_map_groupBy;
}

var esnext_map_includes = {};

var sameValueZero;
var hasRequiredSameValueZero;

function requireSameValueZero () {
	if (hasRequiredSameValueZero) return sameValueZero;
	hasRequiredSameValueZero = 1;
	// `SameValueZero` abstract operation
	// https://tc39.es/ecma262/#sec-samevaluezero
	sameValueZero = function (x, y) {
	  // eslint-disable-next-line no-self-compare -- NaN check
	  return x === y || x !== x && y !== y;
	};
	return sameValueZero;
}

var hasRequiredEsnext_map_includes;

function requireEsnext_map_includes () {
	if (hasRequiredEsnext_map_includes) return esnext_map_includes;
	hasRequiredEsnext_map_includes = 1;
	var $ = require_export();
	var sameValueZero = requireSameValueZero();
	var aMap = requireAMap();
	var iterate = requireMapIterate();

	// `Map.prototype.includes` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  includes: function includes(searchElement) {
	    return iterate(aMap(this), function (value) {
	      if (sameValueZero(value, searchElement)) return true;
	    }, true) === true;
	  }
	});
	return esnext_map_includes;
}

var esnext_map_keyBy = {};

var hasRequiredEsnext_map_keyBy;

function requireEsnext_map_keyBy () {
	if (hasRequiredEsnext_map_keyBy) return esnext_map_keyBy;
	hasRequiredEsnext_map_keyBy = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var iterate = requireIterate();
	var isCallable = requireIsCallable();
	var aCallable = requireACallable();
	var Map = requireMapHelpers().Map;

	// `Map.keyBy` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', stat: true, forced: true }, {
	  keyBy: function keyBy(iterable, keyDerivative) {
	    var C = isCallable(this) ? this : Map;
	    var newMap = new C();
	    aCallable(keyDerivative);
	    var setter = aCallable(newMap.set);
	    iterate(iterable, function (element) {
	      call(setter, newMap, keyDerivative(element), element);
	    });
	    return newMap;
	  }
	});
	return esnext_map_keyBy;
}

var esnext_map_keyOf = {};

var hasRequiredEsnext_map_keyOf;

function requireEsnext_map_keyOf () {
	if (hasRequiredEsnext_map_keyOf) return esnext_map_keyOf;
	hasRequiredEsnext_map_keyOf = 1;
	var $ = require_export();
	var aMap = requireAMap();
	var iterate = requireMapIterate();

	// `Map.prototype.keyOf` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  keyOf: function keyOf(searchElement) {
	    var result = iterate(aMap(this), function (value, key) {
	      if (value === searchElement) return { key: key };
	    }, true);
	    return result && result.key;
	  }
	});
	return esnext_map_keyOf;
}

var esnext_map_mapKeys = {};

var hasRequiredEsnext_map_mapKeys;

function requireEsnext_map_mapKeys () {
	if (hasRequiredEsnext_map_mapKeys) return esnext_map_mapKeys;
	hasRequiredEsnext_map_mapKeys = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aMap = requireAMap();
	var MapHelpers = requireMapHelpers();
	var iterate = requireMapIterate();

	var Map = MapHelpers.Map;
	var set = MapHelpers.set;

	// `Map.prototype.mapKeys` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var newMap = new Map();
	    iterate(map, function (value, key) {
	      set(newMap, boundFunction(value, key, map), value);
	    });
	    return newMap;
	  }
	});
	return esnext_map_mapKeys;
}

var esnext_map_mapValues = {};

var hasRequiredEsnext_map_mapValues;

function requireEsnext_map_mapValues () {
	if (hasRequiredEsnext_map_mapValues) return esnext_map_mapValues;
	hasRequiredEsnext_map_mapValues = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aMap = requireAMap();
	var MapHelpers = requireMapHelpers();
	var iterate = requireMapIterate();

	var Map = MapHelpers.Map;
	var set = MapHelpers.set;

	// `Map.prototype.mapValues` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  mapValues: function mapValues(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var newMap = new Map();
	    iterate(map, function (value, key) {
	      set(newMap, key, boundFunction(value, key, map));
	    });
	    return newMap;
	  }
	});
	return esnext_map_mapValues;
}

var esnext_map_merge = {};

var hasRequiredEsnext_map_merge;

function requireEsnext_map_merge () {
	if (hasRequiredEsnext_map_merge) return esnext_map_merge;
	hasRequiredEsnext_map_merge = 1;
	var $ = require_export();
	var aMap = requireAMap();
	var iterate = requireIterate();
	var set = requireMapHelpers().set;

	// `Map.prototype.merge` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, arity: 1, forced: true }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  merge: function merge(iterable /* ...iterables */) {
	    var map = aMap(this);
	    var argumentsLength = arguments.length;
	    var i = 0;
	    while (i < argumentsLength) {
	      iterate(arguments[i++], function (key, value) {
	        set(map, key, value);
	      }, { AS_ENTRIES: true });
	    }
	    return map;
	  }
	});
	return esnext_map_merge;
}

var esnext_map_of = {};

var collectionOf;
var hasRequiredCollectionOf;

function requireCollectionOf () {
	if (hasRequiredCollectionOf) return collectionOf;
	hasRequiredCollectionOf = 1;
	var anObject = requireAnObject();

	// https://tc39.github.io/proposal-setmap-offrom/
	collectionOf = function (C, adder, ENTRY) {
	  return function of() {
	    var result = new C();
	    var length = arguments.length;
	    for (var index = 0; index < length; index++) {
	      var entry = arguments[index];
	      if (ENTRY) adder(result, anObject(entry)[0], entry[1]);
	      else adder(result, entry);
	    } return result;
	  };
	};
	return collectionOf;
}

var hasRequiredEsnext_map_of;

function requireEsnext_map_of () {
	if (hasRequiredEsnext_map_of) return esnext_map_of;
	hasRequiredEsnext_map_of = 1;
	var $ = require_export();
	var MapHelpers = requireMapHelpers();
	var createCollectionOf = requireCollectionOf();

	// `Map.of` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
	$({ target: 'Map', stat: true, forced: true }, {
	  of: createCollectionOf(MapHelpers.Map, MapHelpers.set, true)
	});
	return esnext_map_of;
}

var esnext_map_reduce = {};

var hasRequiredEsnext_map_reduce;

function requireEsnext_map_reduce () {
	if (hasRequiredEsnext_map_reduce) return esnext_map_reduce;
	hasRequiredEsnext_map_reduce = 1;
	var $ = require_export();
	var aCallable = requireACallable();
	var aMap = requireAMap();
	var iterate = requireMapIterate();

	var $TypeError = TypeError;

	// `Map.prototype.reduce` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  reduce: function reduce(callbackfn /* , initialValue */) {
	    var map = aMap(this);
	    var noInitial = arguments.length < 2;
	    var accumulator = noInitial ? undefined : arguments[1];
	    aCallable(callbackfn);
	    iterate(map, function (value, key) {
	      if (noInitial) {
	        noInitial = false;
	        accumulator = value;
	      } else {
	        accumulator = callbackfn(accumulator, value, key, map);
	      }
	    });
	    if (noInitial) throw new $TypeError('Reduce of empty map with no initial value');
	    return accumulator;
	  }
	});
	return esnext_map_reduce;
}

var esnext_map_some = {};

var hasRequiredEsnext_map_some;

function requireEsnext_map_some () {
	if (hasRequiredEsnext_map_some) return esnext_map_some;
	hasRequiredEsnext_map_some = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aMap = requireAMap();
	var iterate = requireMapIterate();

	// `Map.prototype.some` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  some: function some(callbackfn /* , thisArg */) {
	    var map = aMap(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return iterate(map, function (value, key) {
	      if (boundFunction(value, key, map)) return true;
	    }, true) === true;
	  }
	});
	return esnext_map_some;
}

var esnext_map_update = {};

var hasRequiredEsnext_map_update;

function requireEsnext_map_update () {
	if (hasRequiredEsnext_map_update) return esnext_map_update;
	hasRequiredEsnext_map_update = 1;
	var $ = require_export();
	var aCallable = requireACallable();
	var aMap = requireAMap();
	var MapHelpers = requireMapHelpers();

	var $TypeError = TypeError;
	var get = MapHelpers.get;
	var has = MapHelpers.has;
	var set = MapHelpers.set;

	// `Map.prototype.update` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  update: function update(key, callback /* , thunk */) {
	    var map = aMap(this);
	    var length = arguments.length;
	    aCallable(callback);
	    var isPresentInMap = has(map, key);
	    if (!isPresentInMap && length < 3) {
	      throw new $TypeError('Updating absent value');
	    }
	    var value = isPresentInMap ? get(map, key) : aCallable(length > 2 ? arguments[2] : undefined)(key, map);
	    set(map, key, callback(value, key, map));
	    return map;
	  }
	});
	return esnext_map_update;
}

var esnext_map_updateOrInsert = {};

var mapUpsert;
var hasRequiredMapUpsert;

function requireMapUpsert () {
	if (hasRequiredMapUpsert) return mapUpsert;
	hasRequiredMapUpsert = 1;
	var call = requireFunctionCall();
	var aCallable = requireACallable();
	var isCallable = requireIsCallable();
	var anObject = requireAnObject();

	var $TypeError = TypeError;

	// `Map.prototype.upsert` method
	// https://github.com/tc39/proposal-upsert
	mapUpsert = function upsert(key, updateFn /* , insertFn */) {
	  var map = anObject(this);
	  var get = aCallable(map.get);
	  var has = aCallable(map.has);
	  var set = aCallable(map.set);
	  var insertFn = arguments.length > 2 ? arguments[2] : undefined;
	  var value;
	  if (!isCallable(updateFn) && !isCallable(insertFn)) {
	    throw new $TypeError('At least one callback required');
	  }
	  if (call(has, map, key)) {
	    value = call(get, map, key);
	    if (isCallable(updateFn)) {
	      value = updateFn(value);
	      call(set, map, key, value);
	    }
	  } else if (isCallable(insertFn)) {
	    value = insertFn();
	    call(set, map, key, value);
	  } return value;
	};
	return mapUpsert;
}

var hasRequiredEsnext_map_updateOrInsert;

function requireEsnext_map_updateOrInsert () {
	if (hasRequiredEsnext_map_updateOrInsert) return esnext_map_updateOrInsert;
	hasRequiredEsnext_map_updateOrInsert = 1;
	// TODO: remove from `core-js@4`
	var $ = require_export();
	var upsert = requireMapUpsert();

	// `Map.prototype.updateOrInsert` method (replaced by `Map.prototype.emplace`)
	// https://github.com/thumbsupep/proposal-upsert
	$({ target: 'Map', proto: true, real: true, name: 'upsert', forced: true }, {
	  updateOrInsert: upsert
	});
	return esnext_map_updateOrInsert;
}

var esnext_map_upsert = {};

var hasRequiredEsnext_map_upsert;

function requireEsnext_map_upsert () {
	if (hasRequiredEsnext_map_upsert) return esnext_map_upsert;
	hasRequiredEsnext_map_upsert = 1;
	// TODO: remove from `core-js@4`
	var $ = require_export();
	var upsert = requireMapUpsert();

	// `Map.prototype.upsert` method (replaced by `Map.prototype.emplace`)
	// https://github.com/thumbsupep/proposal-upsert
	$({ target: 'Map', proto: true, real: true, forced: true }, {
	  upsert: upsert
	});
	return esnext_map_upsert;
}

var esnext_math_clamp = {};

var hasRequiredEsnext_math_clamp;

function requireEsnext_math_clamp () {
	if (hasRequiredEsnext_math_clamp) return esnext_math_clamp;
	hasRequiredEsnext_math_clamp = 1;
	var $ = require_export();

	var min = Math.min;
	var max = Math.max;

	// `Math.clamp` method
	// https://rwaldron.github.io/proposal-math-extensions/
	$({ target: 'Math', stat: true, forced: true }, {
	  clamp: function clamp(x, lower, upper) {
	    return min(upper, max(lower, x));
	  }
	});
	return esnext_math_clamp;
}

var esnext_math_degPerRad = {};

var hasRequiredEsnext_math_degPerRad;

function requireEsnext_math_degPerRad () {
	if (hasRequiredEsnext_math_degPerRad) return esnext_math_degPerRad;
	hasRequiredEsnext_math_degPerRad = 1;
	var $ = require_export();

	// `Math.DEG_PER_RAD` constant
	// https://rwaldron.github.io/proposal-math-extensions/
	$({ target: 'Math', stat: true, nonConfigurable: true, nonWritable: true }, {
	  DEG_PER_RAD: Math.PI / 180
	});
	return esnext_math_degPerRad;
}

var esnext_math_degrees = {};

var hasRequiredEsnext_math_degrees;

function requireEsnext_math_degrees () {
	if (hasRequiredEsnext_math_degrees) return esnext_math_degrees;
	hasRequiredEsnext_math_degrees = 1;
	var $ = require_export();

	var RAD_PER_DEG = 180 / Math.PI;

	// `Math.degrees` method
	// https://rwaldron.github.io/proposal-math-extensions/
	$({ target: 'Math', stat: true, forced: true }, {
	  degrees: function degrees(radians) {
	    return radians * RAD_PER_DEG;
	  }
	});
	return esnext_math_degrees;
}

var esnext_math_fscale = {};

var mathScale;
var hasRequiredMathScale;

function requireMathScale () {
	if (hasRequiredMathScale) return mathScale;
	hasRequiredMathScale = 1;
	// `Math.scale` method implementation
	// https://rwaldron.github.io/proposal-math-extensions/
	mathScale = Math.scale || function scale(x, inLow, inHigh, outLow, outHigh) {
	  var nx = +x;
	  var nInLow = +inLow;
	  var nInHigh = +inHigh;
	  var nOutLow = +outLow;
	  var nOutHigh = +outHigh;
	  // eslint-disable-next-line no-self-compare -- NaN check
	  if (nx !== nx || nInLow !== nInLow || nInHigh !== nInHigh || nOutLow !== nOutLow || nOutHigh !== nOutHigh) return NaN;
	  if (nx === Infinity || nx === -Infinity) return nx;
	  return (nx - nInLow) * (nOutHigh - nOutLow) / (nInHigh - nInLow) + nOutLow;
	};
	return mathScale;
}

var hasRequiredEsnext_math_fscale;

function requireEsnext_math_fscale () {
	if (hasRequiredEsnext_math_fscale) return esnext_math_fscale;
	hasRequiredEsnext_math_fscale = 1;
	var $ = require_export();

	var scale = requireMathScale();
	var fround = requireMathFround();

	// `Math.fscale` method
	// https://rwaldron.github.io/proposal-math-extensions/
	$({ target: 'Math', stat: true, forced: true }, {
	  fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
	    return fround(scale(x, inLow, inHigh, outLow, outHigh));
	  }
	});
	return esnext_math_fscale;
}

var esnext_math_f16round = {};

var hasRequiredEsnext_math_f16round;

function requireEsnext_math_f16round () {
	if (hasRequiredEsnext_math_f16round) return esnext_math_f16round;
	hasRequiredEsnext_math_f16round = 1;
	var $ = require_export();
	var f16round = requireMathF16round();

	// `Math.f16round` method
	// https://github.com/tc39/proposal-float16array
	$({ target: 'Math', stat: true }, { f16round: f16round });
	return esnext_math_f16round;
}

var esnext_math_iaddh = {};

var hasRequiredEsnext_math_iaddh;

function requireEsnext_math_iaddh () {
	if (hasRequiredEsnext_math_iaddh) return esnext_math_iaddh;
	hasRequiredEsnext_math_iaddh = 1;
	var $ = require_export();

	// `Math.iaddh` method
	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	// TODO: Remove from `core-js@4`
	$({ target: 'Math', stat: true, forced: true }, {
	  iaddh: function iaddh(x0, x1, y0, y1) {
	    var $x0 = x0 >>> 0;
	    var $x1 = x1 >>> 0;
	    var $y0 = y0 >>> 0;
	    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
	  }
	});
	return esnext_math_iaddh;
}

var esnext_math_imulh = {};

var hasRequiredEsnext_math_imulh;

function requireEsnext_math_imulh () {
	if (hasRequiredEsnext_math_imulh) return esnext_math_imulh;
	hasRequiredEsnext_math_imulh = 1;
	var $ = require_export();

	// `Math.imulh` method
	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	// TODO: Remove from `core-js@4`
	$({ target: 'Math', stat: true, forced: true }, {
	  imulh: function imulh(u, v) {
	    var UINT16 = 0xFFFF;
	    var $u = +u;
	    var $v = +v;
	    var u0 = $u & UINT16;
	    var v0 = $v & UINT16;
	    var u1 = $u >> 16;
	    var v1 = $v >> 16;
	    var t = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
	    return u1 * v1 + (t >> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >> 16);
	  }
	});
	return esnext_math_imulh;
}

var esnext_math_isubh = {};

var hasRequiredEsnext_math_isubh;

function requireEsnext_math_isubh () {
	if (hasRequiredEsnext_math_isubh) return esnext_math_isubh;
	hasRequiredEsnext_math_isubh = 1;
	var $ = require_export();

	// `Math.isubh` method
	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	// TODO: Remove from `core-js@4`
	$({ target: 'Math', stat: true, forced: true }, {
	  isubh: function isubh(x0, x1, y0, y1) {
	    var $x0 = x0 >>> 0;
	    var $x1 = x1 >>> 0;
	    var $y0 = y0 >>> 0;
	    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
	  }
	});
	return esnext_math_isubh;
}

var esnext_math_radPerDeg = {};

var hasRequiredEsnext_math_radPerDeg;

function requireEsnext_math_radPerDeg () {
	if (hasRequiredEsnext_math_radPerDeg) return esnext_math_radPerDeg;
	hasRequiredEsnext_math_radPerDeg = 1;
	var $ = require_export();

	// `Math.RAD_PER_DEG` constant
	// https://rwaldron.github.io/proposal-math-extensions/
	$({ target: 'Math', stat: true, nonConfigurable: true, nonWritable: true }, {
	  RAD_PER_DEG: 180 / Math.PI
	});
	return esnext_math_radPerDeg;
}

var esnext_math_radians = {};

var hasRequiredEsnext_math_radians;

function requireEsnext_math_radians () {
	if (hasRequiredEsnext_math_radians) return esnext_math_radians;
	hasRequiredEsnext_math_radians = 1;
	var $ = require_export();

	var DEG_PER_RAD = Math.PI / 180;

	// `Math.radians` method
	// https://rwaldron.github.io/proposal-math-extensions/
	$({ target: 'Math', stat: true, forced: true }, {
	  radians: function radians(degrees) {
	    return degrees * DEG_PER_RAD;
	  }
	});
	return esnext_math_radians;
}

var esnext_math_scale = {};

var hasRequiredEsnext_math_scale;

function requireEsnext_math_scale () {
	if (hasRequiredEsnext_math_scale) return esnext_math_scale;
	hasRequiredEsnext_math_scale = 1;
	var $ = require_export();
	var scale = requireMathScale();

	// `Math.scale` method
	// https://rwaldron.github.io/proposal-math-extensions/
	$({ target: 'Math', stat: true, forced: true }, {
	  scale: scale
	});
	return esnext_math_scale;
}

var esnext_math_seededPrng = {};

var hasRequiredEsnext_math_seededPrng;

function requireEsnext_math_seededPrng () {
	if (hasRequiredEsnext_math_seededPrng) return esnext_math_seededPrng;
	hasRequiredEsnext_math_seededPrng = 1;
	var $ = require_export();
	var anObject = requireAnObject();
	var numberIsFinite = requireNumberIsFinite();
	var createIteratorConstructor = requireIteratorCreateConstructor();
	var createIterResultObject = requireCreateIterResultObject();
	var InternalStateModule = requireInternalState();

	var SEEDED_RANDOM = 'Seeded Random';
	var SEEDED_RANDOM_GENERATOR = SEEDED_RANDOM + ' Generator';
	var SEED_TYPE_ERROR = 'Math.seededPRNG() argument should have a "seed" field with a finite value.';
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(SEEDED_RANDOM_GENERATOR);
	var $TypeError = TypeError;

	var $SeededRandomGenerator = createIteratorConstructor(function SeededRandomGenerator(seed) {
	  setInternalState(this, {
	    type: SEEDED_RANDOM_GENERATOR,
	    seed: seed % 2147483647
	  });
	}, SEEDED_RANDOM, function next() {
	  var state = getInternalState(this);
	  var seed = state.seed = (state.seed * 1103515245 + 12345) % 2147483647;
	  return createIterResultObject((seed & 1073741823) / 1073741823, false);
	});

	// `Math.seededPRNG` method
	// https://github.com/tc39/proposal-seeded-random
	// based on https://github.com/tc39/proposal-seeded-random/blob/78b8258835b57fc2100d076151ab506bc3202ae6/demo.html
	$({ target: 'Math', stat: true, forced: true }, {
	  seededPRNG: function seededPRNG(it) {
	    var seed = anObject(it).seed;
	    if (!numberIsFinite(seed)) throw new $TypeError(SEED_TYPE_ERROR);
	    return new $SeededRandomGenerator(seed);
	  }
	});
	return esnext_math_seededPrng;
}

var esnext_math_signbit = {};

var hasRequiredEsnext_math_signbit;

function requireEsnext_math_signbit () {
	if (hasRequiredEsnext_math_signbit) return esnext_math_signbit;
	hasRequiredEsnext_math_signbit = 1;
	var $ = require_export();

	// `Math.signbit` method
	// https://github.com/tc39/proposal-Math.signbit
	$({ target: 'Math', stat: true, forced: true }, {
	  signbit: function signbit(x) {
	    var n = +x;
	    // eslint-disable-next-line no-self-compare -- NaN check
	    return n === n && n === 0 ? 1 / n === -Infinity : n < 0;
	  }
	});
	return esnext_math_signbit;
}

var esnext_math_sumPrecise = {};

var hasRequiredEsnext_math_sumPrecise;

function requireEsnext_math_sumPrecise () {
	if (hasRequiredEsnext_math_sumPrecise) return esnext_math_sumPrecise;
	hasRequiredEsnext_math_sumPrecise = 1;
	// based on Shewchuk's algorithm for exactly floating point addition
	// adapted from https://github.com/tc39/proposal-math-sum/blob/3513d58323a1ae25560e8700aa5294500c6c9287/polyfill/polyfill.mjs
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var iterate = requireIterate();

	var $RangeError = RangeError;
	var $TypeError = TypeError;
	var $Infinity = Infinity;
	var $NaN = NaN;
	var abs = Math.abs;
	var pow = Math.pow;
	var push = uncurryThis([].push);

	var POW_2_1023 = pow(2, 1023);
	var MAX_SAFE_INTEGER = pow(2, 53) - 1; // 2 ** 53 - 1 === 9007199254740992
	var MAX_DOUBLE = Number.MAX_VALUE; // 2 ** 1024 - 2 ** (1023 - 52) === 1.79769313486231570815e+308
	var MAX_ULP = pow(2, 971); // 2 ** (1023 - 52) === 1.99584030953471981166e+292

	var NOT_A_NUMBER = {};
	var MINUS_INFINITY = {};
	var PLUS_INFINITY = {};
	var MINUS_ZERO = {};
	var FINITE = {};

	// prerequisite: abs(x) >= abs(y)
	var twosum = function (x, y) {
	  var hi = x + y;
	  var lo = y - (hi - x);
	  return { hi: hi, lo: lo };
	};

	// `Math.sumPrecise` method
	// https://github.com/tc39/proposal-math-sum
	$({ target: 'Math', stat: true, forced: true }, {
	  // eslint-disable-next-line max-statements -- ok
	  sumPrecise: function sumPrecise(items) {
	    var numbers = [];
	    var count = 0;
	    var state = MINUS_ZERO;

	    iterate(items, function (n) {
	      if (++count >= MAX_SAFE_INTEGER) throw new $RangeError('Maximum allowed index exceeded');
	      if (typeof n != 'number') throw new $TypeError('Value is not a number');
	      if (state !== NOT_A_NUMBER) {
	        // eslint-disable-next-line no-self-compare -- NaN check
	        if (n !== n) state = NOT_A_NUMBER;
	        else if (n === $Infinity) state = state === MINUS_INFINITY ? NOT_A_NUMBER : PLUS_INFINITY;
	        else if (n === -$Infinity) state = state === PLUS_INFINITY ? NOT_A_NUMBER : MINUS_INFINITY;
	        else if ((n !== 0 || (1 / n) === $Infinity) && (state === MINUS_ZERO || state === FINITE)) {
	          state = FINITE;
	          push(numbers, n);
	        }
	      }
	    });

	    switch (state) {
	      case NOT_A_NUMBER: return $NaN;
	      case MINUS_INFINITY: return -$Infinity;
	      case PLUS_INFINITY: return $Infinity;
	      case MINUS_ZERO: return -0;
	    }

	    var partials = [];
	    var overflow = 0; // conceptually 2 ** 1024 times this value; the final partial is biased by this amount
	    var x, y, sum, hi, lo, tmp;

	    for (var i = 0; i < numbers.length; i++) {
	      x = numbers[i];
	      var actuallyUsedPartials = 0;
	      for (var j = 0; j < partials.length; j++) {
	        y = partials[j];
	        if (abs(x) < abs(y)) {
	          tmp = x;
	          x = y;
	          y = tmp;
	        }
	        sum = twosum(x, y);
	        hi = sum.hi;
	        lo = sum.lo;
	        if (abs(hi) === $Infinity) {
	          var sign = hi === $Infinity ? 1 : -1;
	          overflow += sign;

	          x = (x - (sign * POW_2_1023)) - (sign * POW_2_1023);
	          if (abs(x) < abs(y)) {
	            tmp = x;
	            x = y;
	            y = tmp;
	          }
	          sum = twosum(x, y);
	          hi = sum.hi;
	          lo = sum.lo;
	        }
	        if (lo !== 0) partials[actuallyUsedPartials++] = lo;
	        x = hi;
	      }
	      partials.length = actuallyUsedPartials;
	      if (x !== 0) push(partials, x);
	    }

	    // compute the exact sum of partials, stopping once we lose precision
	    var n = partials.length - 1;
	    hi = 0;
	    lo = 0;

	    if (overflow !== 0) {
	      var next = n >= 0 ? partials[n] : 0;
	      n--;
	      if (abs(overflow) > 1 || (overflow > 0 && next > 0) || (overflow < 0 && next < 0)) {
	        return overflow > 0 ? $Infinity : -$Infinity;
	      }
	      // here we actually have to do the arithmetic
	      // drop a factor of 2 so we can do it without overflow
	      // assert(abs(overflow) === 1)
	      sum = twosum(overflow * POW_2_1023, next / 2);
	      hi = sum.hi;
	      lo = sum.lo;
	      lo *= 2;
	      if (abs(2 * hi) === $Infinity) {
	        // rounding to the maximum value
	        if (hi > 0) {
	          return (hi === POW_2_1023 && lo === -(MAX_ULP / 2) && n >= 0 && partials[n] < 0) ? MAX_DOUBLE : $Infinity;
	        } return (hi === -POW_2_1023 && lo === (MAX_ULP / 2) && n >= 0 && partials[n] > 0) ? -MAX_DOUBLE : -$Infinity;
	      }

	      if (lo !== 0) {
	        partials[++n] = lo;
	        lo = 0;
	      }

	      hi *= 2;
	    }

	    while (n >= 0) {
	      sum = twosum(hi, partials[n--]);
	      hi = sum.hi;
	      lo = sum.lo;
	      if (lo !== 0) break;
	    }

	    if (n >= 0 && ((lo < 0 && partials[n] < 0) || (lo > 0 && partials[n] > 0))) {
	      y = lo * 2;
	      x = hi + y;
	      if (y === x - hi) hi = x;
	    }

	    return hi;
	  }
	});
	return esnext_math_sumPrecise;
}

var esnext_math_umulh = {};

var hasRequiredEsnext_math_umulh;

function requireEsnext_math_umulh () {
	if (hasRequiredEsnext_math_umulh) return esnext_math_umulh;
	hasRequiredEsnext_math_umulh = 1;
	var $ = require_export();

	// `Math.umulh` method
	// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
	// TODO: Remove from `core-js@4`
	$({ target: 'Math', stat: true, forced: true }, {
	  umulh: function umulh(u, v) {
	    var UINT16 = 0xFFFF;
	    var $u = +u;
	    var $v = +v;
	    var u0 = $u & UINT16;
	    var v0 = $v & UINT16;
	    var u1 = $u >>> 16;
	    var v1 = $v >>> 16;
	    var t = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
	    return u1 * v1 + (t >>> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >>> 16);
	  }
	});
	return esnext_math_umulh;
}

var esnext_number_fromString = {};

var hasRequiredEsnext_number_fromString;

function requireEsnext_number_fromString () {
	if (hasRequiredEsnext_number_fromString) return esnext_number_fromString;
	hasRequiredEsnext_number_fromString = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();

	var INVALID_NUMBER_REPRESENTATION = 'Invalid number representation';
	var INVALID_RADIX = 'Invalid radix';
	var $RangeError = RangeError;
	var $SyntaxError = SyntaxError;
	var $TypeError = TypeError;
	var $parseInt = parseInt;
	var pow = Math.pow;
	var valid = /^[\d.a-z]+$/;
	var charAt = uncurryThis(''.charAt);
	var exec = uncurryThis(valid.exec);
	var numberToString = uncurryThis(1.0.toString);
	var stringSlice = uncurryThis(''.slice);
	var split = uncurryThis(''.split);

	// `Number.fromString` method
	// https://github.com/tc39/proposal-number-fromstring
	$({ target: 'Number', stat: true, forced: true }, {
	  fromString: function fromString(string, radix) {
	    var sign = 1;
	    if (typeof string != 'string') throw new $TypeError(INVALID_NUMBER_REPRESENTATION);
	    if (!string.length) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
	    if (charAt(string, 0) === '-') {
	      sign = -1;
	      string = stringSlice(string, 1);
	      if (!string.length) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
	    }
	    var R = radix === undefined ? 10 : toIntegerOrInfinity(radix);
	    if (R < 2 || R > 36) throw new $RangeError(INVALID_RADIX);
	    if (!exec(valid, string)) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
	    var parts = split(string, '.');
	    var mathNum = $parseInt(parts[0], R);
	    if (parts.length > 1) mathNum += $parseInt(parts[1], R) / pow(R, parts[1].length);
	    if (R === 10 && numberToString(mathNum, R) !== string) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
	    return sign * mathNum;
	  }
	});
	return esnext_number_fromString;
}

var esnext_number_range = {};

var hasRequiredEsnext_number_range;

function requireEsnext_number_range () {
	if (hasRequiredEsnext_number_range) return esnext_number_range;
	hasRequiredEsnext_number_range = 1;
	var $ = require_export();
	var NumericRangeIterator = requireNumericRangeIterator();

	// `Number.range` method
	// https://github.com/tc39/proposal-Number.range
	// TODO: Remove from `core-js@4`
	$({ target: 'Number', stat: true, forced: true }, {
	  range: function range(start, end, option) {
	    return new NumericRangeIterator(start, end, option, 'number', 0, 1);
	  }
	});
	return esnext_number_range;
}

var esnext_object_hasOwn = {};

var hasRequiredEsnext_object_hasOwn;

function requireEsnext_object_hasOwn () {
	if (hasRequiredEsnext_object_hasOwn) return esnext_object_hasOwn;
	hasRequiredEsnext_object_hasOwn = 1;
	// TODO: Remove from `core-js@4`
	requireEs_object_hasOwn();
	return esnext_object_hasOwn;
}

var esnext_object_iterateEntries = {};

var objectIterator;
var hasRequiredObjectIterator;

function requireObjectIterator () {
	if (hasRequiredObjectIterator) return objectIterator;
	hasRequiredObjectIterator = 1;
	var InternalStateModule = requireInternalState();
	var createIteratorConstructor = requireIteratorCreateConstructor();
	var createIterResultObject = requireCreateIterResultObject();
	var hasOwn = requireHasOwnProperty();
	var objectKeys = requireObjectKeys();
	var toObject = requireToObject();

	var OBJECT_ITERATOR = 'Object Iterator';
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(OBJECT_ITERATOR);

	objectIterator = createIteratorConstructor(function ObjectIterator(source, mode) {
	  var object = toObject(source);
	  setInternalState(this, {
	    type: OBJECT_ITERATOR,
	    mode: mode,
	    object: object,
	    keys: objectKeys(object),
	    index: 0
	  });
	}, 'Object', function next() {
	  var state = getInternalState(this);
	  var keys = state.keys;
	  while (true) {
	    if (keys === null || state.index >= keys.length) {
	      state.object = state.keys = null;
	      return createIterResultObject(undefined, true);
	    }
	    var key = keys[state.index++];
	    var object = state.object;
	    if (!hasOwn(object, key)) continue;
	    switch (state.mode) {
	      case 'keys': return createIterResultObject(key, false);
	      case 'values': return createIterResultObject(object[key], false);
	    } /* entries */ return createIterResultObject([key, object[key]], false);
	  }
	});
	return objectIterator;
}

var hasRequiredEsnext_object_iterateEntries;

function requireEsnext_object_iterateEntries () {
	if (hasRequiredEsnext_object_iterateEntries) return esnext_object_iterateEntries;
	hasRequiredEsnext_object_iterateEntries = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var ObjectIterator = requireObjectIterator();

	// `Object.iterateEntries` method
	// https://github.com/tc39/proposal-object-iteration
	$({ target: 'Object', stat: true, forced: true }, {
	  iterateEntries: function iterateEntries(object) {
	    return new ObjectIterator(object, 'entries');
	  }
	});
	return esnext_object_iterateEntries;
}

var esnext_object_iterateKeys = {};

var hasRequiredEsnext_object_iterateKeys;

function requireEsnext_object_iterateKeys () {
	if (hasRequiredEsnext_object_iterateKeys) return esnext_object_iterateKeys;
	hasRequiredEsnext_object_iterateKeys = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var ObjectIterator = requireObjectIterator();

	// `Object.iterateKeys` method
	// https://github.com/tc39/proposal-object-iteration
	$({ target: 'Object', stat: true, forced: true }, {
	  iterateKeys: function iterateKeys(object) {
	    return new ObjectIterator(object, 'keys');
	  }
	});
	return esnext_object_iterateKeys;
}

var esnext_object_iterateValues = {};

var hasRequiredEsnext_object_iterateValues;

function requireEsnext_object_iterateValues () {
	if (hasRequiredEsnext_object_iterateValues) return esnext_object_iterateValues;
	hasRequiredEsnext_object_iterateValues = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var ObjectIterator = requireObjectIterator();

	// `Object.iterateValues` method
	// https://github.com/tc39/proposal-object-iteration
	$({ target: 'Object', stat: true, forced: true }, {
	  iterateValues: function iterateValues(object) {
	    return new ObjectIterator(object, 'values');
	  }
	});
	return esnext_object_iterateValues;
}

var esnext_object_groupBy = {};

var hasRequiredEsnext_object_groupBy;

function requireEsnext_object_groupBy () {
	if (hasRequiredEsnext_object_groupBy) return esnext_object_groupBy;
	hasRequiredEsnext_object_groupBy = 1;
	// TODO: Remove from `core-js@4`
	requireEs_object_groupBy();
	return esnext_object_groupBy;
}

var esnext_observable = {};

var esnext_observable_constructor = {};

var hasRequiredEsnext_observable_constructor;

function requireEsnext_observable_constructor () {
	if (hasRequiredEsnext_observable_constructor) return esnext_observable_constructor;
	hasRequiredEsnext_observable_constructor = 1;
	// https://github.com/tc39/proposal-observable
	var $ = require_export();
	var call = requireFunctionCall();
	var DESCRIPTORS = requireDescriptors();
	var setSpecies = requireSetSpecies();
	var aCallable = requireACallable();
	var anObject = requireAnObject();
	var anInstance = requireAnInstance();
	var isCallable = requireIsCallable();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var isObject = requireIsObject();
	var getMethod = requireGetMethod();
	var defineBuiltIn = requireDefineBuiltIn();
	var defineBuiltIns = requireDefineBuiltIns();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var hostReportErrors = requireHostReportErrors();
	var wellKnownSymbol = requireWellKnownSymbol();
	var InternalStateModule = requireInternalState();

	var $$OBSERVABLE = wellKnownSymbol('observable');
	var OBSERVABLE = 'Observable';
	var SUBSCRIPTION = 'Subscription';
	var SUBSCRIPTION_OBSERVER = 'SubscriptionObserver';
	var getterFor = InternalStateModule.getterFor;
	var setInternalState = InternalStateModule.set;
	var getObservableInternalState = getterFor(OBSERVABLE);
	var getSubscriptionInternalState = getterFor(SUBSCRIPTION);
	var getSubscriptionObserverInternalState = getterFor(SUBSCRIPTION_OBSERVER);

	var SubscriptionState = function (observer) {
	  this.observer = anObject(observer);
	  this.cleanup = null;
	  this.subscriptionObserver = null;
	};

	SubscriptionState.prototype = {
	  type: SUBSCRIPTION,
	  clean: function () {
	    var cleanup = this.cleanup;
	    if (cleanup) {
	      this.cleanup = null;
	      try {
	        cleanup();
	      } catch (error) {
	        hostReportErrors(error);
	      }
	    }
	  },
	  close: function () {
	    if (!DESCRIPTORS) {
	      var subscription = this.facade;
	      var subscriptionObserver = this.subscriptionObserver;
	      subscription.closed = true;
	      if (subscriptionObserver) subscriptionObserver.closed = true;
	    } this.observer = null;
	  },
	  isClosed: function () {
	    return this.observer === null;
	  }
	};

	var Subscription = function (observer, subscriber) {
	  var subscriptionState = setInternalState(this, new SubscriptionState(observer));
	  var start;
	  if (!DESCRIPTORS) this.closed = false;
	  try {
	    if (start = getMethod(observer, 'start')) call(start, observer, this);
	  } catch (error) {
	    hostReportErrors(error);
	  }
	  if (subscriptionState.isClosed()) return;
	  var subscriptionObserver = subscriptionState.subscriptionObserver = new SubscriptionObserver(subscriptionState);
	  try {
	    var cleanup = subscriber(subscriptionObserver);
	    var subscription = cleanup;
	    if (!isNullOrUndefined(cleanup)) subscriptionState.cleanup = isCallable(cleanup.unsubscribe)
	      ? function () { subscription.unsubscribe(); }
	      : aCallable(cleanup);
	  } catch (error) {
	    subscriptionObserver.error(error);
	    return;
	  } if (subscriptionState.isClosed()) subscriptionState.clean();
	};

	Subscription.prototype = defineBuiltIns({}, {
	  unsubscribe: function unsubscribe() {
	    var subscriptionState = getSubscriptionInternalState(this);
	    if (!subscriptionState.isClosed()) {
	      subscriptionState.close();
	      subscriptionState.clean();
	    }
	  }
	});

	if (DESCRIPTORS) defineBuiltInAccessor(Subscription.prototype, 'closed', {
	  configurable: true,
	  get: function closed() {
	    return getSubscriptionInternalState(this).isClosed();
	  }
	});

	var SubscriptionObserver = function (subscriptionState) {
	  setInternalState(this, {
	    type: SUBSCRIPTION_OBSERVER,
	    subscriptionState: subscriptionState
	  });
	  if (!DESCRIPTORS) this.closed = false;
	};

	SubscriptionObserver.prototype = defineBuiltIns({}, {
	  next: function next(value) {
	    var subscriptionState = getSubscriptionObserverInternalState(this).subscriptionState;
	    if (!subscriptionState.isClosed()) {
	      var observer = subscriptionState.observer;
	      try {
	        var nextMethod = getMethod(observer, 'next');
	        if (nextMethod) call(nextMethod, observer, value);
	      } catch (error) {
	        hostReportErrors(error);
	      }
	    }
	  },
	  error: function error(value) {
	    var subscriptionState = getSubscriptionObserverInternalState(this).subscriptionState;
	    if (!subscriptionState.isClosed()) {
	      var observer = subscriptionState.observer;
	      subscriptionState.close();
	      try {
	        var errorMethod = getMethod(observer, 'error');
	        if (errorMethod) call(errorMethod, observer, value);
	        else hostReportErrors(value);
	      } catch (err) {
	        hostReportErrors(err);
	      } subscriptionState.clean();
	    }
	  },
	  complete: function complete() {
	    var subscriptionState = getSubscriptionObserverInternalState(this).subscriptionState;
	    if (!subscriptionState.isClosed()) {
	      var observer = subscriptionState.observer;
	      subscriptionState.close();
	      try {
	        var completeMethod = getMethod(observer, 'complete');
	        if (completeMethod) call(completeMethod, observer);
	      } catch (error) {
	        hostReportErrors(error);
	      } subscriptionState.clean();
	    }
	  }
	});

	if (DESCRIPTORS) defineBuiltInAccessor(SubscriptionObserver.prototype, 'closed', {
	  configurable: true,
	  get: function closed() {
	    return getSubscriptionObserverInternalState(this).subscriptionState.isClosed();
	  }
	});

	var $Observable = function Observable(subscriber) {
	  anInstance(this, ObservablePrototype);
	  setInternalState(this, {
	    type: OBSERVABLE,
	    subscriber: aCallable(subscriber)
	  });
	};

	var ObservablePrototype = $Observable.prototype;

	defineBuiltIns(ObservablePrototype, {
	  subscribe: function subscribe(observer) {
	    var length = arguments.length;
	    return new Subscription(isCallable(observer) ? {
	      next: observer,
	      error: length > 1 ? arguments[1] : undefined,
	      complete: length > 2 ? arguments[2] : undefined
	    } : isObject(observer) ? observer : {}, getObservableInternalState(this).subscriber);
	  }
	});

	defineBuiltIn(ObservablePrototype, $$OBSERVABLE, function () { return this; });

	$({ global: true, constructor: true, forced: true }, {
	  Observable: $Observable
	});

	setSpecies(OBSERVABLE);
	return esnext_observable_constructor;
}

var esnext_observable_from = {};

var hasRequiredEsnext_observable_from;

function requireEsnext_observable_from () {
	if (hasRequiredEsnext_observable_from) return esnext_observable_from;
	hasRequiredEsnext_observable_from = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var call = requireFunctionCall();
	var anObject = requireAnObject();
	var isConstructor = requireIsConstructor();
	var getIterator = requireGetIterator();
	var getMethod = requireGetMethod();
	var iterate = requireIterate();
	var wellKnownSymbol = requireWellKnownSymbol();

	var $$OBSERVABLE = wellKnownSymbol('observable');

	// `Observable.from` method
	// https://github.com/tc39/proposal-observable
	$({ target: 'Observable', stat: true, forced: true }, {
	  from: function from(x) {
	    var C = isConstructor(this) ? this : getBuiltIn('Observable');
	    var observableMethod = getMethod(anObject(x), $$OBSERVABLE);
	    if (observableMethod) {
	      var observable = anObject(call(observableMethod, x));
	      return observable.constructor === C ? observable : new C(function (observer) {
	        return observable.subscribe(observer);
	      });
	    }
	    var iterator = getIterator(x);
	    return new C(function (observer) {
	      iterate(iterator, function (it, stop) {
	        observer.next(it);
	        if (observer.closed) return stop();
	      }, { IS_ITERATOR: true, INTERRUPTED: true });
	      observer.complete();
	    });
	  }
	});
	return esnext_observable_from;
}

var esnext_observable_of = {};

var hasRequiredEsnext_observable_of;

function requireEsnext_observable_of () {
	if (hasRequiredEsnext_observable_of) return esnext_observable_of;
	hasRequiredEsnext_observable_of = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var isConstructor = requireIsConstructor();

	var Array = getBuiltIn('Array');

	// `Observable.of` method
	// https://github.com/tc39/proposal-observable
	$({ target: 'Observable', stat: true, forced: true }, {
	  of: function of() {
	    var C = isConstructor(this) ? this : getBuiltIn('Observable');
	    var length = arguments.length;
	    var items = Array(length);
	    var index = 0;
	    while (index < length) items[index] = arguments[index++];
	    return new C(function (observer) {
	      for (var i = 0; i < length; i++) {
	        observer.next(items[i]);
	        if (observer.closed) return;
	      } observer.complete();
	    });
	  }
	});
	return esnext_observable_of;
}

var hasRequiredEsnext_observable;

function requireEsnext_observable () {
	if (hasRequiredEsnext_observable) return esnext_observable;
	hasRequiredEsnext_observable = 1;
	// TODO: Remove this module from `core-js@4` since it's split to modules listed below
	requireEsnext_observable_constructor();
	requireEsnext_observable_from();
	requireEsnext_observable_of();
	return esnext_observable;
}

var esnext_promise_allSettled = {};

var hasRequiredEsnext_promise_allSettled;

function requireEsnext_promise_allSettled () {
	if (hasRequiredEsnext_promise_allSettled) return esnext_promise_allSettled;
	hasRequiredEsnext_promise_allSettled = 1;
	// TODO: Remove from `core-js@4`
	requireEs_promise_allSettled();
	return esnext_promise_allSettled;
}

var esnext_promise_any = {};

var hasRequiredEsnext_promise_any;

function requireEsnext_promise_any () {
	if (hasRequiredEsnext_promise_any) return esnext_promise_any;
	hasRequiredEsnext_promise_any = 1;
	// TODO: Remove from `core-js@4`
	requireEs_promise_any();
	return esnext_promise_any;
}

var esnext_promise_try = {};

var hasRequiredEsnext_promise_try;

function requireEsnext_promise_try () {
	if (hasRequiredEsnext_promise_try) return esnext_promise_try;
	hasRequiredEsnext_promise_try = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var apply = requireFunctionApply();
	var slice = requireArraySlice();
	var newPromiseCapabilityModule = requireNewPromiseCapability();
	var aCallable = requireACallable();
	var perform = requirePerform();

	var Promise = globalThis.Promise;

	var ACCEPT_ARGUMENTS = false;
	// Avoiding the use of polyfills of the previous iteration of this proposal
	// that does not accept arguments of the callback
	var FORCED = !Promise || !Promise['try'] || perform(function () {
	  Promise['try'](function (argument) {
	    ACCEPT_ARGUMENTS = argument === 8;
	  }, 8);
	}).error || !ACCEPT_ARGUMENTS;

	// `Promise.try` method
	// https://github.com/tc39/proposal-promise-try
	$({ target: 'Promise', stat: true, forced: FORCED }, {
	  'try': function (callbackfn /* , ...args */) {
	    var args = arguments.length > 1 ? slice(arguments, 1) : [];
	    var promiseCapability = newPromiseCapabilityModule.f(this);
	    var result = perform(function () {
	      return apply(aCallable(callbackfn), undefined, args);
	    });
	    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
	    return promiseCapability.promise;
	  }
	});
	return esnext_promise_try;
}

var esnext_promise_withResolvers = {};

var hasRequiredEsnext_promise_withResolvers;

function requireEsnext_promise_withResolvers () {
	if (hasRequiredEsnext_promise_withResolvers) return esnext_promise_withResolvers;
	hasRequiredEsnext_promise_withResolvers = 1;
	// TODO: Remove from `core-js@4`
	requireEs_promise_withResolvers();
	return esnext_promise_withResolvers;
}

var esnext_reflect_defineMetadata = {};

var reflectMetadata;
var hasRequiredReflectMetadata;

function requireReflectMetadata () {
	if (hasRequiredReflectMetadata) return reflectMetadata;
	hasRequiredReflectMetadata = 1;
	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
	requireEs_map();
	requireEs_weakMap();
	var getBuiltIn = requireGetBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var shared = requireShared();

	var Map = getBuiltIn('Map');
	var WeakMap = getBuiltIn('WeakMap');
	var push = uncurryThis([].push);

	var metadata = shared('metadata');
	var store = metadata.store || (metadata.store = new WeakMap());

	var getOrCreateMetadataMap = function (target, targetKey, create) {
	  var targetMetadata = store.get(target);
	  if (!targetMetadata) {
	    if (!create) return;
	    store.set(target, targetMetadata = new Map());
	  }
	  var keyMetadata = targetMetadata.get(targetKey);
	  if (!keyMetadata) {
	    if (!create) return;
	    targetMetadata.set(targetKey, keyMetadata = new Map());
	  } return keyMetadata;
	};

	var ordinaryHasOwnMetadata = function (MetadataKey, O, P) {
	  var metadataMap = getOrCreateMetadataMap(O, P, false);
	  return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
	};

	var ordinaryGetOwnMetadata = function (MetadataKey, O, P) {
	  var metadataMap = getOrCreateMetadataMap(O, P, false);
	  return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
	};

	var ordinaryDefineOwnMetadata = function (MetadataKey, MetadataValue, O, P) {
	  getOrCreateMetadataMap(O, P, true).set(MetadataKey, MetadataValue);
	};

	var ordinaryOwnMetadataKeys = function (target, targetKey) {
	  var metadataMap = getOrCreateMetadataMap(target, targetKey, false);
	  var keys = [];
	  if (metadataMap) metadataMap.forEach(function (_, key) { push(keys, key); });
	  return keys;
	};

	var toMetadataKey = function (it) {
	  return it === undefined || typeof it == 'symbol' ? it : String(it);
	};

	reflectMetadata = {
	  store: store,
	  getMap: getOrCreateMetadataMap,
	  has: ordinaryHasOwnMetadata,
	  get: ordinaryGetOwnMetadata,
	  set: ordinaryDefineOwnMetadata,
	  keys: ordinaryOwnMetadataKeys,
	  toKey: toMetadataKey
	};
	return reflectMetadata;
}

var hasRequiredEsnext_reflect_defineMetadata;

function requireEsnext_reflect_defineMetadata () {
	if (hasRequiredEsnext_reflect_defineMetadata) return esnext_reflect_defineMetadata;
	hasRequiredEsnext_reflect_defineMetadata = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var ReflectMetadataModule = requireReflectMetadata();
	var anObject = requireAnObject();

	var toMetadataKey = ReflectMetadataModule.toKey;
	var ordinaryDefineOwnMetadata = ReflectMetadataModule.set;

	// `Reflect.defineMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	$({ target: 'Reflect', stat: true }, {
	  defineMetadata: function defineMetadata(metadataKey, metadataValue, target /* , targetKey */) {
	    var targetKey = arguments.length < 4 ? undefined : toMetadataKey(arguments[3]);
	    ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), targetKey);
	  }
	});
	return esnext_reflect_defineMetadata;
}

var esnext_reflect_deleteMetadata = {};

var hasRequiredEsnext_reflect_deleteMetadata;

function requireEsnext_reflect_deleteMetadata () {
	if (hasRequiredEsnext_reflect_deleteMetadata) return esnext_reflect_deleteMetadata;
	hasRequiredEsnext_reflect_deleteMetadata = 1;
	var $ = require_export();
	var ReflectMetadataModule = requireReflectMetadata();
	var anObject = requireAnObject();

	var toMetadataKey = ReflectMetadataModule.toKey;
	var getOrCreateMetadataMap = ReflectMetadataModule.getMap;
	var store = ReflectMetadataModule.store;

	// `Reflect.deleteMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	$({ target: 'Reflect', stat: true }, {
	  deleteMetadata: function deleteMetadata(metadataKey, target /* , targetKey */) {
	    var targetKey = arguments.length < 3 ? undefined : toMetadataKey(arguments[2]);
	    var metadataMap = getOrCreateMetadataMap(anObject(target), targetKey, false);
	    if (metadataMap === undefined || !metadataMap['delete'](metadataKey)) return false;
	    if (metadataMap.size) return true;
	    var targetMetadata = store.get(target);
	    targetMetadata['delete'](targetKey);
	    return !!targetMetadata.size || store['delete'](target);
	  }
	});
	return esnext_reflect_deleteMetadata;
}

var esnext_reflect_getMetadata = {};

var hasRequiredEsnext_reflect_getMetadata;

function requireEsnext_reflect_getMetadata () {
	if (hasRequiredEsnext_reflect_getMetadata) return esnext_reflect_getMetadata;
	hasRequiredEsnext_reflect_getMetadata = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var ReflectMetadataModule = requireReflectMetadata();
	var anObject = requireAnObject();
	var getPrototypeOf = requireObjectGetPrototypeOf();

	var ordinaryHasOwnMetadata = ReflectMetadataModule.has;
	var ordinaryGetOwnMetadata = ReflectMetadataModule.get;
	var toMetadataKey = ReflectMetadataModule.toKey;

	var ordinaryGetMetadata = function (MetadataKey, O, P) {
	  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
	  if (hasOwn) return ordinaryGetOwnMetadata(MetadataKey, O, P);
	  var parent = getPrototypeOf(O);
	  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
	};

	// `Reflect.getMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	$({ target: 'Reflect', stat: true }, {
	  getMetadata: function getMetadata(metadataKey, target /* , targetKey */) {
	    var targetKey = arguments.length < 3 ? undefined : toMetadataKey(arguments[2]);
	    return ordinaryGetMetadata(metadataKey, anObject(target), targetKey);
	  }
	});
	return esnext_reflect_getMetadata;
}

var esnext_reflect_getMetadataKeys = {};

var hasRequiredEsnext_reflect_getMetadataKeys;

function requireEsnext_reflect_getMetadataKeys () {
	if (hasRequiredEsnext_reflect_getMetadataKeys) return esnext_reflect_getMetadataKeys;
	hasRequiredEsnext_reflect_getMetadataKeys = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var ReflectMetadataModule = requireReflectMetadata();
	var anObject = requireAnObject();
	var getPrototypeOf = requireObjectGetPrototypeOf();
	var $arrayUniqueBy = requireArrayUniqueBy();

	var arrayUniqueBy = uncurryThis($arrayUniqueBy);
	var concat = uncurryThis([].concat);
	var ordinaryOwnMetadataKeys = ReflectMetadataModule.keys;
	var toMetadataKey = ReflectMetadataModule.toKey;

	var ordinaryMetadataKeys = function (O, P) {
	  var oKeys = ordinaryOwnMetadataKeys(O, P);
	  var parent = getPrototypeOf(O);
	  if (parent === null) return oKeys;
	  var pKeys = ordinaryMetadataKeys(parent, P);
	  return pKeys.length ? oKeys.length ? arrayUniqueBy(concat(oKeys, pKeys)) : pKeys : oKeys;
	};

	// `Reflect.getMetadataKeys` method
	// https://github.com/rbuckton/reflect-metadata
	$({ target: 'Reflect', stat: true }, {
	  getMetadataKeys: function getMetadataKeys(target /* , targetKey */) {
	    var targetKey = arguments.length < 2 ? undefined : toMetadataKey(arguments[1]);
	    return ordinaryMetadataKeys(anObject(target), targetKey);
	  }
	});
	return esnext_reflect_getMetadataKeys;
}

var esnext_reflect_getOwnMetadata = {};

var hasRequiredEsnext_reflect_getOwnMetadata;

function requireEsnext_reflect_getOwnMetadata () {
	if (hasRequiredEsnext_reflect_getOwnMetadata) return esnext_reflect_getOwnMetadata;
	hasRequiredEsnext_reflect_getOwnMetadata = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var ReflectMetadataModule = requireReflectMetadata();
	var anObject = requireAnObject();

	var ordinaryGetOwnMetadata = ReflectMetadataModule.get;
	var toMetadataKey = ReflectMetadataModule.toKey;

	// `Reflect.getOwnMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	$({ target: 'Reflect', stat: true }, {
	  getOwnMetadata: function getOwnMetadata(metadataKey, target /* , targetKey */) {
	    var targetKey = arguments.length < 3 ? undefined : toMetadataKey(arguments[2]);
	    return ordinaryGetOwnMetadata(metadataKey, anObject(target), targetKey);
	  }
	});
	return esnext_reflect_getOwnMetadata;
}

var esnext_reflect_getOwnMetadataKeys = {};

var hasRequiredEsnext_reflect_getOwnMetadataKeys;

function requireEsnext_reflect_getOwnMetadataKeys () {
	if (hasRequiredEsnext_reflect_getOwnMetadataKeys) return esnext_reflect_getOwnMetadataKeys;
	hasRequiredEsnext_reflect_getOwnMetadataKeys = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var ReflectMetadataModule = requireReflectMetadata();
	var anObject = requireAnObject();

	var ordinaryOwnMetadataKeys = ReflectMetadataModule.keys;
	var toMetadataKey = ReflectMetadataModule.toKey;

	// `Reflect.getOwnMetadataKeys` method
	// https://github.com/rbuckton/reflect-metadata
	$({ target: 'Reflect', stat: true }, {
	  getOwnMetadataKeys: function getOwnMetadataKeys(target /* , targetKey */) {
	    var targetKey = arguments.length < 2 ? undefined : toMetadataKey(arguments[1]);
	    return ordinaryOwnMetadataKeys(anObject(target), targetKey);
	  }
	});
	return esnext_reflect_getOwnMetadataKeys;
}

var esnext_reflect_hasMetadata = {};

var hasRequiredEsnext_reflect_hasMetadata;

function requireEsnext_reflect_hasMetadata () {
	if (hasRequiredEsnext_reflect_hasMetadata) return esnext_reflect_hasMetadata;
	hasRequiredEsnext_reflect_hasMetadata = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var ReflectMetadataModule = requireReflectMetadata();
	var anObject = requireAnObject();
	var getPrototypeOf = requireObjectGetPrototypeOf();

	var ordinaryHasOwnMetadata = ReflectMetadataModule.has;
	var toMetadataKey = ReflectMetadataModule.toKey;

	var ordinaryHasMetadata = function (MetadataKey, O, P) {
	  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
	  if (hasOwn) return true;
	  var parent = getPrototypeOf(O);
	  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
	};

	// `Reflect.hasMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	$({ target: 'Reflect', stat: true }, {
	  hasMetadata: function hasMetadata(metadataKey, target /* , targetKey */) {
	    var targetKey = arguments.length < 3 ? undefined : toMetadataKey(arguments[2]);
	    return ordinaryHasMetadata(metadataKey, anObject(target), targetKey);
	  }
	});
	return esnext_reflect_hasMetadata;
}

var esnext_reflect_hasOwnMetadata = {};

var hasRequiredEsnext_reflect_hasOwnMetadata;

function requireEsnext_reflect_hasOwnMetadata () {
	if (hasRequiredEsnext_reflect_hasOwnMetadata) return esnext_reflect_hasOwnMetadata;
	hasRequiredEsnext_reflect_hasOwnMetadata = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var ReflectMetadataModule = requireReflectMetadata();
	var anObject = requireAnObject();

	var ordinaryHasOwnMetadata = ReflectMetadataModule.has;
	var toMetadataKey = ReflectMetadataModule.toKey;

	// `Reflect.hasOwnMetadata` method
	// https://github.com/rbuckton/reflect-metadata
	$({ target: 'Reflect', stat: true }, {
	  hasOwnMetadata: function hasOwnMetadata(metadataKey, target /* , targetKey */) {
	    var targetKey = arguments.length < 3 ? undefined : toMetadataKey(arguments[2]);
	    return ordinaryHasOwnMetadata(metadataKey, anObject(target), targetKey);
	  }
	});
	return esnext_reflect_hasOwnMetadata;
}

var esnext_reflect_metadata = {};

var hasRequiredEsnext_reflect_metadata;

function requireEsnext_reflect_metadata () {
	if (hasRequiredEsnext_reflect_metadata) return esnext_reflect_metadata;
	hasRequiredEsnext_reflect_metadata = 1;
	var $ = require_export();
	var ReflectMetadataModule = requireReflectMetadata();
	var anObject = requireAnObject();

	var toMetadataKey = ReflectMetadataModule.toKey;
	var ordinaryDefineOwnMetadata = ReflectMetadataModule.set;

	// `Reflect.metadata` method
	// https://github.com/rbuckton/reflect-metadata
	$({ target: 'Reflect', stat: true }, {
	  metadata: function metadata(metadataKey, metadataValue) {
	    return function decorator(target, key) {
	      ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), toMetadataKey(key));
	    };
	  }
	});
	return esnext_reflect_metadata;
}

var esnext_regexp_escape = {};

var aString;
var hasRequiredAString;

function requireAString () {
	if (hasRequiredAString) return aString;
	hasRequiredAString = 1;
	var $TypeError = TypeError;

	aString = function (argument) {
	  if (typeof argument == 'string') return argument;
	  throw new $TypeError('Argument is not a string');
	};
	return aString;
}

var hasRequiredEsnext_regexp_escape;

function requireEsnext_regexp_escape () {
	if (hasRequiredEsnext_regexp_escape) return esnext_regexp_escape;
	hasRequiredEsnext_regexp_escape = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var aString = requireAString();
	var hasOwn = requireHasOwnProperty();
	var padStart = requireStringPad().start;
	var WHITESPACES = requireWhitespaces();

	var $Array = Array;
	var $escape = RegExp.escape;
	var charAt = uncurryThis(''.charAt);
	var charCodeAt = uncurryThis(''.charCodeAt);
	var numberToString = uncurryThis(1.1.toString);
	var join = uncurryThis([].join);
	var FIRST_DIGIT_OR_ASCII = /^[0-9a-z]/i;
	var SYNTAX_SOLIDUS = /^[$()*+./?[\\\]^{|}]/;
	var OTHER_PUNCTUATORS_AND_WHITESPACES = RegExp('^[!"#%&\',\\-:;<=>@`~' + WHITESPACES + ']');
	var exec = uncurryThis(FIRST_DIGIT_OR_ASCII.exec);

	var ControlEscape = {
	  '\u0009': 't',
	  '\u000A': 'n',
	  '\u000B': 'v',
	  '\u000C': 'f',
	  '\u000D': 'r'
	};

	var escapeChar = function (chr) {
	  var hex = numberToString(charCodeAt(chr, 0), 16);
	  return hex.length < 3 ? '\\x' + padStart(hex, 2, '0') : '\\u' + padStart(hex, 4, '0');
	};

	// Avoiding the use of polyfills of the previous iteration of this proposal
	var FORCED = !$escape || $escape('ab') !== '\\x61b';

	// `RegExp.escape` method
	// https://github.com/tc39/proposal-regex-escaping
	$({ target: 'RegExp', stat: true, forced: FORCED }, {
	  escape: function escape(S) {
	    aString(S);
	    var length = S.length;
	    var result = $Array(length);

	    for (var i = 0; i < length; i++) {
	      var chr = charAt(S, i);
	      if (i === 0 && exec(FIRST_DIGIT_OR_ASCII, chr)) {
	        result[i] = escapeChar(chr);
	      } else if (hasOwn(ControlEscape, chr)) {
	        result[i] = '\\' + ControlEscape[chr];
	      } else if (exec(SYNTAX_SOLIDUS, chr)) {
	        result[i] = '\\' + chr;
	      } else if (exec(OTHER_PUNCTUATORS_AND_WHITESPACES, chr)) {
	        result[i] = escapeChar(chr);
	      } else {
	        var charCode = charCodeAt(chr, 0);
	        // single UTF-16 code unit
	        if ((charCode & 0xF800) !== 0xD800) result[i] = chr;
	        // unpaired surrogate
	        else if (charCode >= 0xDC00 || i + 1 >= length || (charCodeAt(S, i + 1) & 0xFC00) !== 0xDC00) result[i] = escapeChar(chr);
	        // surrogate pair
	        else {
	          result[i] = chr;
	          result[++i] = charAt(S, i);
	        }
	      }
	    }

	    return join(result, '');
	  }
	});
	return esnext_regexp_escape;
}

var esnext_set_addAll = {};

var hasRequiredEsnext_set_addAll;

function requireEsnext_set_addAll () {
	if (hasRequiredEsnext_set_addAll) return esnext_set_addAll;
	hasRequiredEsnext_set_addAll = 1;
	var $ = require_export();
	var aSet = requireASet();
	var add = requireSetHelpers().add;

	// `Set.prototype.addAll` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  addAll: function addAll(/* ...elements */) {
	    var set = aSet(this);
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      add(set, arguments[k]);
	    } return set;
	  }
	});
	return esnext_set_addAll;
}

var esnext_set_deleteAll = {};

var hasRequiredEsnext_set_deleteAll;

function requireEsnext_set_deleteAll () {
	if (hasRequiredEsnext_set_deleteAll) return esnext_set_deleteAll;
	hasRequiredEsnext_set_deleteAll = 1;
	var $ = require_export();
	var aSet = requireASet();
	var remove = requireSetHelpers().remove;

	// `Set.prototype.deleteAll` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  deleteAll: function deleteAll(/* ...elements */) {
	    var collection = aSet(this);
	    var allDeleted = true;
	    var wasDeleted;
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      wasDeleted = remove(collection, arguments[k]);
	      allDeleted = allDeleted && wasDeleted;
	    } return !!allDeleted;
	  }
	});
	return esnext_set_deleteAll;
}

var esnext_set_difference_v2 = {};

var hasRequiredEsnext_set_difference_v2;

function requireEsnext_set_difference_v2 () {
	if (hasRequiredEsnext_set_difference_v2) return esnext_set_difference_v2;
	hasRequiredEsnext_set_difference_v2 = 1;
	// TODO: Remove from `core-js@4`
	requireEs_set_difference_v2();
	return esnext_set_difference_v2;
}

var esnext_set_difference = {};

var isIterable;
var hasRequiredIsIterable;

function requireIsIterable () {
	if (hasRequiredIsIterable) return isIterable;
	hasRequiredIsIterable = 1;
	var classof = requireClassof();
	var hasOwn = requireHasOwnProperty();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var wellKnownSymbol = requireWellKnownSymbol();
	var Iterators = requireIterators();

	var ITERATOR = wellKnownSymbol('iterator');
	var $Object = Object;

	isIterable = function (it) {
	  if (isNullOrUndefined(it)) return false;
	  var O = $Object(it);
	  return O[ITERATOR] !== undefined
	    || '@@iterator' in O
	    || hasOwn(Iterators, classof(O));
	};
	return isIterable;
}

var toSetLike;
var hasRequiredToSetLike;

function requireToSetLike () {
	if (hasRequiredToSetLike) return toSetLike;
	hasRequiredToSetLike = 1;
	var getBuiltIn = requireGetBuiltIn();
	var isCallable = requireIsCallable();
	var isIterable = requireIsIterable();
	var isObject = requireIsObject();

	var Set = getBuiltIn('Set');

	var isSetLike = function (it) {
	  return isObject(it)
	    && typeof it.size == 'number'
	    && isCallable(it.has)
	    && isCallable(it.keys);
	};

	// fallback old -> new set methods proposal arguments
	toSetLike = function (it) {
	  if (isSetLike(it)) return it;
	  return isIterable(it) ? new Set(it) : it;
	};
	return toSetLike;
}

var hasRequiredEsnext_set_difference;

function requireEsnext_set_difference () {
	if (hasRequiredEsnext_set_difference) return esnext_set_difference;
	hasRequiredEsnext_set_difference = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var toSetLike = requireToSetLike();
	var $difference = requireSetDifference();

	// `Set.prototype.difference` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  difference: function difference(other) {
	    return call($difference, this, toSetLike(other));
	  }
	});
	return esnext_set_difference;
}

var esnext_set_every = {};

var hasRequiredEsnext_set_every;

function requireEsnext_set_every () {
	if (hasRequiredEsnext_set_every) return esnext_set_every;
	hasRequiredEsnext_set_every = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aSet = requireASet();
	var iterate = requireSetIterate();

	// `Set.prototype.every` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  every: function every(callbackfn /* , thisArg */) {
	    var set = aSet(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return iterate(set, function (value) {
	      if (!boundFunction(value, value, set)) return false;
	    }, true) !== false;
	  }
	});
	return esnext_set_every;
}

var esnext_set_filter = {};

var hasRequiredEsnext_set_filter;

function requireEsnext_set_filter () {
	if (hasRequiredEsnext_set_filter) return esnext_set_filter;
	hasRequiredEsnext_set_filter = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aSet = requireASet();
	var SetHelpers = requireSetHelpers();
	var iterate = requireSetIterate();

	var Set = SetHelpers.Set;
	var add = SetHelpers.add;

	// `Set.prototype.filter` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    var set = aSet(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var newSet = new Set();
	    iterate(set, function (value) {
	      if (boundFunction(value, value, set)) add(newSet, value);
	    });
	    return newSet;
	  }
	});
	return esnext_set_filter;
}

var esnext_set_find = {};

var hasRequiredEsnext_set_find;

function requireEsnext_set_find () {
	if (hasRequiredEsnext_set_find) return esnext_set_find;
	hasRequiredEsnext_set_find = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aSet = requireASet();
	var iterate = requireSetIterate();

	// `Set.prototype.find` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  find: function find(callbackfn /* , thisArg */) {
	    var set = aSet(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var result = iterate(set, function (value) {
	      if (boundFunction(value, value, set)) return { value: value };
	    }, true);
	    return result && result.value;
	  }
	});
	return esnext_set_find;
}

var esnext_set_from = {};

var hasRequiredEsnext_set_from;

function requireEsnext_set_from () {
	if (hasRequiredEsnext_set_from) return esnext_set_from;
	hasRequiredEsnext_set_from = 1;
	var $ = require_export();
	var SetHelpers = requireSetHelpers();
	var createCollectionFrom = requireCollectionFrom();

	// `Set.from` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
	$({ target: 'Set', stat: true, forced: true }, {
	  from: createCollectionFrom(SetHelpers.Set, SetHelpers.add, false)
	});
	return esnext_set_from;
}

var esnext_set_intersection_v2 = {};

var hasRequiredEsnext_set_intersection_v2;

function requireEsnext_set_intersection_v2 () {
	if (hasRequiredEsnext_set_intersection_v2) return esnext_set_intersection_v2;
	hasRequiredEsnext_set_intersection_v2 = 1;
	// TODO: Remove from `core-js@4`
	requireEs_set_intersection_v2();
	return esnext_set_intersection_v2;
}

var esnext_set_intersection = {};

var hasRequiredEsnext_set_intersection;

function requireEsnext_set_intersection () {
	if (hasRequiredEsnext_set_intersection) return esnext_set_intersection;
	hasRequiredEsnext_set_intersection = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var toSetLike = requireToSetLike();
	var $intersection = requireSetIntersection();

	// `Set.prototype.intersection` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  intersection: function intersection(other) {
	    return call($intersection, this, toSetLike(other));
	  }
	});
	return esnext_set_intersection;
}

var esnext_set_isDisjointFrom_v2 = {};

var hasRequiredEsnext_set_isDisjointFrom_v2;

function requireEsnext_set_isDisjointFrom_v2 () {
	if (hasRequiredEsnext_set_isDisjointFrom_v2) return esnext_set_isDisjointFrom_v2;
	hasRequiredEsnext_set_isDisjointFrom_v2 = 1;
	// TODO: Remove from `core-js@4`
	requireEs_set_isDisjointFrom_v2();
	return esnext_set_isDisjointFrom_v2;
}

var esnext_set_isDisjointFrom = {};

var hasRequiredEsnext_set_isDisjointFrom;

function requireEsnext_set_isDisjointFrom () {
	if (hasRequiredEsnext_set_isDisjointFrom) return esnext_set_isDisjointFrom;
	hasRequiredEsnext_set_isDisjointFrom = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var toSetLike = requireToSetLike();
	var $isDisjointFrom = requireSetIsDisjointFrom();

	// `Set.prototype.isDisjointFrom` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  isDisjointFrom: function isDisjointFrom(other) {
	    return call($isDisjointFrom, this, toSetLike(other));
	  }
	});
	return esnext_set_isDisjointFrom;
}

var esnext_set_isSubsetOf_v2 = {};

var hasRequiredEsnext_set_isSubsetOf_v2;

function requireEsnext_set_isSubsetOf_v2 () {
	if (hasRequiredEsnext_set_isSubsetOf_v2) return esnext_set_isSubsetOf_v2;
	hasRequiredEsnext_set_isSubsetOf_v2 = 1;
	// TODO: Remove from `core-js@4`
	requireEs_set_isSubsetOf_v2();
	return esnext_set_isSubsetOf_v2;
}

var esnext_set_isSubsetOf = {};

var hasRequiredEsnext_set_isSubsetOf;

function requireEsnext_set_isSubsetOf () {
	if (hasRequiredEsnext_set_isSubsetOf) return esnext_set_isSubsetOf;
	hasRequiredEsnext_set_isSubsetOf = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var toSetLike = requireToSetLike();
	var $isSubsetOf = requireSetIsSubsetOf();

	// `Set.prototype.isSubsetOf` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  isSubsetOf: function isSubsetOf(other) {
	    return call($isSubsetOf, this, toSetLike(other));
	  }
	});
	return esnext_set_isSubsetOf;
}

var esnext_set_isSupersetOf_v2 = {};

var hasRequiredEsnext_set_isSupersetOf_v2;

function requireEsnext_set_isSupersetOf_v2 () {
	if (hasRequiredEsnext_set_isSupersetOf_v2) return esnext_set_isSupersetOf_v2;
	hasRequiredEsnext_set_isSupersetOf_v2 = 1;
	// TODO: Remove from `core-js@4`
	requireEs_set_isSupersetOf_v2();
	return esnext_set_isSupersetOf_v2;
}

var esnext_set_isSupersetOf = {};

var hasRequiredEsnext_set_isSupersetOf;

function requireEsnext_set_isSupersetOf () {
	if (hasRequiredEsnext_set_isSupersetOf) return esnext_set_isSupersetOf;
	hasRequiredEsnext_set_isSupersetOf = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var toSetLike = requireToSetLike();
	var $isSupersetOf = requireSetIsSupersetOf();

	// `Set.prototype.isSupersetOf` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  isSupersetOf: function isSupersetOf(other) {
	    return call($isSupersetOf, this, toSetLike(other));
	  }
	});
	return esnext_set_isSupersetOf;
}

var esnext_set_join = {};

var hasRequiredEsnext_set_join;

function requireEsnext_set_join () {
	if (hasRequiredEsnext_set_join) return esnext_set_join;
	hasRequiredEsnext_set_join = 1;
	var $ = require_export();
	var uncurryThis = requireFunctionUncurryThis();
	var aSet = requireASet();
	var iterate = requireSetIterate();
	var toString = requireToString();

	var arrayJoin = uncurryThis([].join);
	var push = uncurryThis([].push);

	// `Set.prototype.join` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  join: function join(separator) {
	    var set = aSet(this);
	    var sep = separator === undefined ? ',' : toString(separator);
	    var array = [];
	    iterate(set, function (value) {
	      push(array, value);
	    });
	    return arrayJoin(array, sep);
	  }
	});
	return esnext_set_join;
}

var esnext_set_map = {};

var hasRequiredEsnext_set_map;

function requireEsnext_set_map () {
	if (hasRequiredEsnext_set_map) return esnext_set_map;
	hasRequiredEsnext_set_map = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aSet = requireASet();
	var SetHelpers = requireSetHelpers();
	var iterate = requireSetIterate();

	var Set = SetHelpers.Set;
	var add = SetHelpers.add;

	// `Set.prototype.map` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  map: function map(callbackfn /* , thisArg */) {
	    var set = aSet(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    var newSet = new Set();
	    iterate(set, function (value) {
	      add(newSet, boundFunction(value, value, set));
	    });
	    return newSet;
	  }
	});
	return esnext_set_map;
}

var esnext_set_of = {};

var hasRequiredEsnext_set_of;

function requireEsnext_set_of () {
	if (hasRequiredEsnext_set_of) return esnext_set_of;
	hasRequiredEsnext_set_of = 1;
	var $ = require_export();
	var SetHelpers = requireSetHelpers();
	var createCollectionOf = requireCollectionOf();

	// `Set.of` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
	$({ target: 'Set', stat: true, forced: true }, {
	  of: createCollectionOf(SetHelpers.Set, SetHelpers.add, false)
	});
	return esnext_set_of;
}

var esnext_set_reduce = {};

var hasRequiredEsnext_set_reduce;

function requireEsnext_set_reduce () {
	if (hasRequiredEsnext_set_reduce) return esnext_set_reduce;
	hasRequiredEsnext_set_reduce = 1;
	var $ = require_export();
	var aCallable = requireACallable();
	var aSet = requireASet();
	var iterate = requireSetIterate();

	var $TypeError = TypeError;

	// `Set.prototype.reduce` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  reduce: function reduce(callbackfn /* , initialValue */) {
	    var set = aSet(this);
	    var noInitial = arguments.length < 2;
	    var accumulator = noInitial ? undefined : arguments[1];
	    aCallable(callbackfn);
	    iterate(set, function (value) {
	      if (noInitial) {
	        noInitial = false;
	        accumulator = value;
	      } else {
	        accumulator = callbackfn(accumulator, value, value, set);
	      }
	    });
	    if (noInitial) throw new $TypeError('Reduce of empty set with no initial value');
	    return accumulator;
	  }
	});
	return esnext_set_reduce;
}

var esnext_set_some = {};

var hasRequiredEsnext_set_some;

function requireEsnext_set_some () {
	if (hasRequiredEsnext_set_some) return esnext_set_some;
	hasRequiredEsnext_set_some = 1;
	var $ = require_export();
	var bind = requireFunctionBindContext();
	var aSet = requireASet();
	var iterate = requireSetIterate();

	// `Set.prototype.some` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  some: function some(callbackfn /* , thisArg */) {
	    var set = aSet(this);
	    var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	    return iterate(set, function (value) {
	      if (boundFunction(value, value, set)) return true;
	    }, true) === true;
	  }
	});
	return esnext_set_some;
}

var esnext_set_symmetricDifference_v2 = {};

var hasRequiredEsnext_set_symmetricDifference_v2;

function requireEsnext_set_symmetricDifference_v2 () {
	if (hasRequiredEsnext_set_symmetricDifference_v2) return esnext_set_symmetricDifference_v2;
	hasRequiredEsnext_set_symmetricDifference_v2 = 1;
	// TODO: Remove from `core-js@4`
	requireEs_set_symmetricDifference_v2();
	return esnext_set_symmetricDifference_v2;
}

var esnext_set_symmetricDifference = {};

var hasRequiredEsnext_set_symmetricDifference;

function requireEsnext_set_symmetricDifference () {
	if (hasRequiredEsnext_set_symmetricDifference) return esnext_set_symmetricDifference;
	hasRequiredEsnext_set_symmetricDifference = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var toSetLike = requireToSetLike();
	var $symmetricDifference = requireSetSymmetricDifference();

	// `Set.prototype.symmetricDifference` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  symmetricDifference: function symmetricDifference(other) {
	    return call($symmetricDifference, this, toSetLike(other));
	  }
	});
	return esnext_set_symmetricDifference;
}

var esnext_set_union_v2 = {};

var hasRequiredEsnext_set_union_v2;

function requireEsnext_set_union_v2 () {
	if (hasRequiredEsnext_set_union_v2) return esnext_set_union_v2;
	hasRequiredEsnext_set_union_v2 = 1;
	// TODO: Remove from `core-js@4`
	requireEs_set_union_v2();
	return esnext_set_union_v2;
}

var esnext_set_union = {};

var hasRequiredEsnext_set_union;

function requireEsnext_set_union () {
	if (hasRequiredEsnext_set_union) return esnext_set_union;
	hasRequiredEsnext_set_union = 1;
	var $ = require_export();
	var call = requireFunctionCall();
	var toSetLike = requireToSetLike();
	var $union = requireSetUnion();

	// `Set.prototype.union` method
	// https://github.com/tc39/proposal-set-methods
	// TODO: Obsolete version, remove from `core-js@4`
	$({ target: 'Set', proto: true, real: true, forced: true }, {
	  union: function union(other) {
	    return call($union, this, toSetLike(other));
	  }
	});
	return esnext_set_union;
}

var esnext_string_at = {};

var hasRequiredEsnext_string_at;

function requireEsnext_string_at () {
	if (hasRequiredEsnext_string_at) return esnext_string_at;
	hasRequiredEsnext_string_at = 1;
	// TODO: Remove from `core-js@4`
	var $ = require_export();
	var charAt = requireStringMultibyte().charAt;
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var toString = requireToString();

	// `String.prototype.at` method
	// https://github.com/mathiasbynens/String.prototype.at
	$({ target: 'String', proto: true, forced: true }, {
	  at: function at(index) {
	    var S = toString(requireObjectCoercible(this));
	    var len = S.length;
	    var relativeIndex = toIntegerOrInfinity(index);
	    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
	    return (k < 0 || k >= len) ? undefined : charAt(S, k);
	  }
	});
	return esnext_string_at;
}

var esnext_string_cooked = {};

var stringCooked;
var hasRequiredStringCooked;

function requireStringCooked () {
	if (hasRequiredStringCooked) return stringCooked;
	hasRequiredStringCooked = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var toIndexedObject = requireToIndexedObject();
	var toString = requireToString();
	var lengthOfArrayLike = requireLengthOfArrayLike();

	var $TypeError = TypeError;
	var push = uncurryThis([].push);
	var join = uncurryThis([].join);

	// `String.cooked` method
	// https://tc39.es/proposal-string-cooked/
	stringCooked = function cooked(template /* , ...substitutions */) {
	  var cookedTemplate = toIndexedObject(template);
	  var literalSegments = lengthOfArrayLike(cookedTemplate);
	  if (!literalSegments) return '';
	  var argumentsLength = arguments.length;
	  var elements = [];
	  var i = 0;
	  while (true) {
	    var nextVal = cookedTemplate[i++];
	    if (nextVal === undefined) throw new $TypeError('Incorrect template');
	    push(elements, toString(nextVal));
	    if (i === literalSegments) return join(elements, '');
	    if (i < argumentsLength) push(elements, toString(arguments[i]));
	  }
	};
	return stringCooked;
}

var hasRequiredEsnext_string_cooked;

function requireEsnext_string_cooked () {
	if (hasRequiredEsnext_string_cooked) return esnext_string_cooked;
	hasRequiredEsnext_string_cooked = 1;
	var $ = require_export();
	var cooked = requireStringCooked();

	// `String.cooked` method
	// https://github.com/tc39/proposal-string-cooked
	$({ target: 'String', stat: true, forced: true }, {
	  cooked: cooked
	});
	return esnext_string_cooked;
}

var esnext_string_codePoints = {};

var hasRequiredEsnext_string_codePoints;

function requireEsnext_string_codePoints () {
	if (hasRequiredEsnext_string_codePoints) return esnext_string_codePoints;
	hasRequiredEsnext_string_codePoints = 1;
	var $ = require_export();
	var createIteratorConstructor = requireIteratorCreateConstructor();
	var createIterResultObject = requireCreateIterResultObject();
	var requireObjectCoercible = requireRequireObjectCoercible();
	var toString = requireToString();
	var InternalStateModule = requireInternalState();
	var StringMultibyteModule = requireStringMultibyte();

	var codeAt = StringMultibyteModule.codeAt;
	var charAt = StringMultibyteModule.charAt;
	var STRING_ITERATOR = 'String Iterator';
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

	// TODO: unify with String#@@iterator
	var $StringIterator = createIteratorConstructor(function StringIterator(string) {
	  setInternalState(this, {
	    type: STRING_ITERATOR,
	    string: string,
	    index: 0
	  });
	}, 'String', function next() {
	  var state = getInternalState(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return createIterResultObject(undefined, true);
	  point = charAt(string, index);
	  state.index += point.length;
	  return createIterResultObject({ codePoint: codeAt(point, 0), position: index }, false);
	});

	// `String.prototype.codePoints` method
	// https://github.com/tc39/proposal-string-prototype-codepoints
	$({ target: 'String', proto: true, forced: true }, {
	  codePoints: function codePoints() {
	    return new $StringIterator(toString(requireObjectCoercible(this)));
	  }
	});
	return esnext_string_codePoints;
}

var esnext_string_dedent = {};

var weakMapHelpers;
var hasRequiredWeakMapHelpers;

function requireWeakMapHelpers () {
	if (hasRequiredWeakMapHelpers) return weakMapHelpers;
	hasRequiredWeakMapHelpers = 1;
	var uncurryThis = requireFunctionUncurryThis();

	// eslint-disable-next-line es/no-weak-map -- safe
	var WeakMapPrototype = WeakMap.prototype;

	weakMapHelpers = {
	  // eslint-disable-next-line es/no-weak-map -- safe
	  WeakMap: WeakMap,
	  set: uncurryThis(WeakMapPrototype.set),
	  get: uncurryThis(WeakMapPrototype.get),
	  has: uncurryThis(WeakMapPrototype.has),
	  remove: uncurryThis(WeakMapPrototype['delete'])
	};
	return weakMapHelpers;
}

var stringParse;
var hasRequiredStringParse;

function requireStringParse () {
	if (hasRequiredStringParse) return stringParse;
	hasRequiredStringParse = 1;
	// adapted from https://github.com/jridgewell/string-dedent
	var getBuiltIn = requireGetBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();

	var fromCharCode = String.fromCharCode;
	var fromCodePoint = getBuiltIn('String', 'fromCodePoint');
	var charAt = uncurryThis(''.charAt);
	var charCodeAt = uncurryThis(''.charCodeAt);
	var stringIndexOf = uncurryThis(''.indexOf);
	var stringSlice = uncurryThis(''.slice);

	var ZERO_CODE = 48;
	var NINE_CODE = 57;
	var LOWER_A_CODE = 97;
	var LOWER_F_CODE = 102;
	var UPPER_A_CODE = 65;
	var UPPER_F_CODE = 70;

	var isDigit = function (str, index) {
	  var c = charCodeAt(str, index);
	  return c >= ZERO_CODE && c <= NINE_CODE;
	};

	var parseHex = function (str, index, end) {
	  if (end >= str.length) return -1;
	  var n = 0;
	  for (; index < end; index++) {
	    var c = hexToInt(charCodeAt(str, index));
	    if (c === -1) return -1;
	    n = n * 16 + c;
	  }
	  return n;
	};

	var hexToInt = function (c) {
	  if (c >= ZERO_CODE && c <= NINE_CODE) return c - ZERO_CODE;
	  if (c >= LOWER_A_CODE && c <= LOWER_F_CODE) return c - LOWER_A_CODE + 10;
	  if (c >= UPPER_A_CODE && c <= UPPER_F_CODE) return c - UPPER_A_CODE + 10;
	  return -1;
	};

	stringParse = function (raw) {
	  var out = '';
	  var start = 0;
	  // We need to find every backslash escape sequence, and cook the escape into a real char.
	  var i = 0;
	  var n;
	  while ((i = stringIndexOf(raw, '\\', i)) > -1) {
	    out += stringSlice(raw, start, i);
	    // If the backslash is the last char of the string, then it was an invalid sequence.
	    // This can't actually happen in a tagged template literal, but could happen if you manually
	    // invoked the tag with an array.
	    if (++i === raw.length) return;
	    var next = charAt(raw, i++);
	    switch (next) {
	      // Escaped control codes need to be individually processed.
	      case 'b':
	        out += '\b';
	        break;
	      case 't':
	        out += '\t';
	        break;
	      case 'n':
	        out += '\n';
	        break;
	      case 'v':
	        out += '\v';
	        break;
	      case 'f':
	        out += '\f';
	        break;
	      case 'r':
	        out += '\r';
	        break;
	      // Escaped line terminators just skip the char.
	      case '\r':
	        // Treat `\r\n` as a single terminator.
	        if (i < raw.length && charAt(raw, i) === '\n') ++i;
	      // break omitted
	      case '\n':
	      case '\u2028':
	      case '\u2029':
	        break;
	      // `\0` is a null control char, but `\0` followed by another digit is an illegal octal escape.
	      case '0':
	        if (isDigit(raw, i)) return;
	        out += '\0';
	        break;
	      // Hex escapes must contain 2 hex chars.
	      case 'x':
	        n = parseHex(raw, i, i + 2);
	        if (n === -1) return;
	        i += 2;
	        out += fromCharCode(n);
	        break;
	      // Unicode escapes contain either 4 chars, or an unlimited number between `{` and `}`.
	      // The hex value must not overflow 0x10FFFF.
	      case 'u':
	        if (i < raw.length && charAt(raw, i) === '{') {
	          var end = stringIndexOf(raw, '}', ++i);
	          if (end === -1) return;
	          n = parseHex(raw, i, end);
	          i = end + 1;
	        } else {
	          n = parseHex(raw, i, i + 4);
	          i += 4;
	        }
	        if (n === -1 || n > 0x10FFFF) return;
	        out += fromCodePoint(n);
	        break;
	      default:
	        if (isDigit(next, 0)) return;
	        out += next;
	    }
	    start = i;
	  }
	  return out + stringSlice(raw, start);
	};
	return stringParse;
}

var hasRequiredEsnext_string_dedent;

function requireEsnext_string_dedent () {
	if (hasRequiredEsnext_string_dedent) return esnext_string_dedent;
	hasRequiredEsnext_string_dedent = 1;
	var FREEZING = requireFreezing();
	var $ = require_export();
	var makeBuiltIn = requireMakeBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var apply = requireFunctionApply();
	var anObject = requireAnObject();
	var toObject = requireToObject();
	var isCallable = requireIsCallable();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var defineProperty = requireObjectDefineProperty().f;
	var createArrayFromList = requireArraySlice();
	var WeakMapHelpers = requireWeakMapHelpers();
	var cooked = requireStringCooked();
	var parse = requireStringParse();
	var whitespaces = requireWhitespaces();

	var DedentMap = new WeakMapHelpers.WeakMap();
	var weakMapGet = WeakMapHelpers.get;
	var weakMapHas = WeakMapHelpers.has;
	var weakMapSet = WeakMapHelpers.set;

	var $Array = Array;
	var $TypeError = TypeError;
	// eslint-disable-next-line es/no-object-freeze -- safe
	var freeze = Object.freeze || Object;
	// eslint-disable-next-line es/no-object-isfrozen -- safe
	var isFrozen = Object.isFrozen;
	var min = Math.min;
	var charAt = uncurryThis(''.charAt);
	var stringSlice = uncurryThis(''.slice);
	var split = uncurryThis(''.split);
	var exec = uncurryThis(/./.exec);

	var NEW_LINE = /([\n\u2028\u2029]|\r\n?)/g;
	var LEADING_WHITESPACE = RegExp('^[' + whitespaces + ']*');
	var NON_WHITESPACE = RegExp('[^' + whitespaces + ']');
	var INVALID_TAG = 'Invalid tag';
	var INVALID_OPENING_LINE = 'Invalid opening line';
	var INVALID_CLOSING_LINE = 'Invalid closing line';

	var dedentTemplateStringsArray = function (template) {
	  var rawInput = template.raw;
	  // https://github.com/tc39/proposal-string-dedent/issues/75
	  if (FREEZING && !isFrozen(rawInput)) throw new $TypeError('Raw template should be frozen');
	  if (weakMapHas(DedentMap, rawInput)) return weakMapGet(DedentMap, rawInput);
	  var raw = dedentStringsArray(rawInput);
	  var cookedArr = cookStrings(raw);
	  defineProperty(cookedArr, 'raw', {
	    value: freeze(raw)
	  });
	  freeze(cookedArr);
	  weakMapSet(DedentMap, rawInput, cookedArr);
	  return cookedArr;
	};

	var dedentStringsArray = function (template) {
	  var t = toObject(template);
	  var length = lengthOfArrayLike(t);
	  var blocks = $Array(length);
	  var dedented = $Array(length);
	  var i = 0;
	  var lines, common, quasi, k;

	  if (!length) throw new $TypeError(INVALID_TAG);

	  for (; i < length; i++) {
	    var element = t[i];
	    if (typeof element == 'string') blocks[i] = split(element, NEW_LINE);
	    else throw new $TypeError(INVALID_TAG);
	  }

	  for (i = 0; i < length; i++) {
	    var lastSplit = i + 1 === length;
	    lines = blocks[i];
	    if (i === 0) {
	      if (lines.length === 1 || lines[0].length > 0) {
	        throw new $TypeError(INVALID_OPENING_LINE);
	      }
	      lines[1] = '';
	    }
	    if (lastSplit) {
	      if (lines.length === 1 || exec(NON_WHITESPACE, lines[lines.length - 1])) {
	        throw new $TypeError(INVALID_CLOSING_LINE);
	      }
	      lines[lines.length - 2] = '';
	      lines[lines.length - 1] = '';
	    }
	    // eslint-disable-next-line sonar/no-redundant-assignments -- false positive, https://github.com/SonarSource/SonarJS/issues/4767
	    for (var j = 2; j < lines.length; j += 2) {
	      var text = lines[j];
	      var lineContainsTemplateExpression = j + 1 === lines.length && !lastSplit;
	      var leading = exec(LEADING_WHITESPACE, text)[0];
	      if (!lineContainsTemplateExpression && leading.length === text.length) {
	        lines[j] = '';
	        continue;
	      }
	      common = commonLeadingIndentation(leading, common);
	    }
	  }

	  var count = common ? common.length : 0;

	  for (i = 0; i < length; i++) {
	    lines = blocks[i];
	    quasi = lines[0];
	    k = 1;
	    for (; k < lines.length; k += 2) {
	      quasi += lines[k] + stringSlice(lines[k + 1], count);
	    }
	    dedented[i] = quasi;
	  }

	  return dedented;
	};

	var commonLeadingIndentation = function (a, b) {
	  if (b === undefined || a === b) return a;
	  var i = 0;
	  for (var len = min(a.length, b.length); i < len; i++) {
	    if (charAt(a, i) !== charAt(b, i)) break;
	  }
	  return stringSlice(a, 0, i);
	};

	var cookStrings = function (raw) {
	  var i = 0;
	  var length = raw.length;
	  var result = $Array(length);
	  for (; i < length; i++) {
	    result[i] = parse(raw[i]);
	  } return result;
	};

	var makeDedentTag = function (tag) {
	  return makeBuiltIn(function (template /* , ...substitutions */) {
	    var args = createArrayFromList(arguments);
	    args[0] = dedentTemplateStringsArray(anObject(template));
	    return apply(tag, this, args);
	  }, '');
	};

	var cookedDedentTag = makeDedentTag(cooked);

	// `String.dedent` method
	// https://github.com/tc39/proposal-string-dedent
	$({ target: 'String', stat: true, forced: true }, {
	  dedent: function dedent(templateOrFn /* , ...substitutions */) {
	    anObject(templateOrFn);
	    if (isCallable(templateOrFn)) return makeDedentTag(templateOrFn);
	    return apply(cookedDedentTag, this, arguments);
	  }
	});
	return esnext_string_dedent;
}

var esnext_string_isWellFormed = {};

var hasRequiredEsnext_string_isWellFormed;

function requireEsnext_string_isWellFormed () {
	if (hasRequiredEsnext_string_isWellFormed) return esnext_string_isWellFormed;
	hasRequiredEsnext_string_isWellFormed = 1;
	// TODO: Remove from `core-js@4`
	requireEs_string_isWellFormed();
	return esnext_string_isWellFormed;
}

var esnext_string_matchAll = {};

var hasRequiredEsnext_string_matchAll;

function requireEsnext_string_matchAll () {
	if (hasRequiredEsnext_string_matchAll) return esnext_string_matchAll;
	hasRequiredEsnext_string_matchAll = 1;
	// TODO: Remove from `core-js@4`
	requireEs_string_matchAll();
	return esnext_string_matchAll;
}

var esnext_string_replaceAll = {};

var hasRequiredEsnext_string_replaceAll;

function requireEsnext_string_replaceAll () {
	if (hasRequiredEsnext_string_replaceAll) return esnext_string_replaceAll;
	hasRequiredEsnext_string_replaceAll = 1;
	// TODO: Remove from `core-js@4`
	requireEs_string_replaceAll();
	return esnext_string_replaceAll;
}

var esnext_string_toWellFormed = {};

var hasRequiredEsnext_string_toWellFormed;

function requireEsnext_string_toWellFormed () {
	if (hasRequiredEsnext_string_toWellFormed) return esnext_string_toWellFormed;
	hasRequiredEsnext_string_toWellFormed = 1;
	// TODO: Remove from `core-js@4`
	requireEs_string_toWellFormed();
	return esnext_string_toWellFormed;
}

var esnext_symbol_asyncDispose = {};

var hasRequiredEsnext_symbol_asyncDispose;

function requireEsnext_symbol_asyncDispose () {
	if (hasRequiredEsnext_symbol_asyncDispose) return esnext_symbol_asyncDispose;
	hasRequiredEsnext_symbol_asyncDispose = 1;
	var globalThis = requireGlobalThis();
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();
	var defineProperty = requireObjectDefineProperty().f;
	var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;

	var Symbol = globalThis.Symbol;

	// `Symbol.asyncDispose` well-known symbol
	// https://github.com/tc39/proposal-async-explicit-resource-management
	defineWellKnownSymbol('asyncDispose');

	if (Symbol) {
	  var descriptor = getOwnPropertyDescriptor(Symbol, 'asyncDispose');
	  // workaround of NodeJS 20.4 bug
	  // https://github.com/nodejs/node/issues/48699
	  // and incorrect descriptor from some transpilers and userland helpers
	  if (descriptor.enumerable && descriptor.configurable && descriptor.writable) {
	    defineProperty(Symbol, 'asyncDispose', { value: descriptor.value, enumerable: false, configurable: false, writable: false });
	  }
	}
	return esnext_symbol_asyncDispose;
}

var esnext_symbol_customMatcher = {};

var hasRequiredEsnext_symbol_customMatcher;

function requireEsnext_symbol_customMatcher () {
	if (hasRequiredEsnext_symbol_customMatcher) return esnext_symbol_customMatcher;
	hasRequiredEsnext_symbol_customMatcher = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.customMatcher` well-known symbol
	// https://github.com/tc39/proposal-pattern-matching
	defineWellKnownSymbol('customMatcher');
	return esnext_symbol_customMatcher;
}

var esnext_symbol_dispose = {};

var hasRequiredEsnext_symbol_dispose;

function requireEsnext_symbol_dispose () {
	if (hasRequiredEsnext_symbol_dispose) return esnext_symbol_dispose;
	hasRequiredEsnext_symbol_dispose = 1;
	var globalThis = requireGlobalThis();
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();
	var defineProperty = requireObjectDefineProperty().f;
	var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;

	var Symbol = globalThis.Symbol;

	// `Symbol.dispose` well-known symbol
	// https://github.com/tc39/proposal-explicit-resource-management
	defineWellKnownSymbol('dispose');

	if (Symbol) {
	  var descriptor = getOwnPropertyDescriptor(Symbol, 'dispose');
	  // workaround of NodeJS 20.4 bug
	  // https://github.com/nodejs/node/issues/48699
	  // and incorrect descriptor from some transpilers and userland helpers
	  if (descriptor.enumerable && descriptor.configurable && descriptor.writable) {
	    defineProperty(Symbol, 'dispose', { value: descriptor.value, enumerable: false, configurable: false, writable: false });
	  }
	}
	return esnext_symbol_dispose;
}

var esnext_symbol_isRegisteredSymbol = {};

var symbolIsRegistered;
var hasRequiredSymbolIsRegistered;

function requireSymbolIsRegistered () {
	if (hasRequiredSymbolIsRegistered) return symbolIsRegistered;
	hasRequiredSymbolIsRegistered = 1;
	var getBuiltIn = requireGetBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();

	var Symbol = getBuiltIn('Symbol');
	var keyFor = Symbol.keyFor;
	var thisSymbolValue = uncurryThis(Symbol.prototype.valueOf);

	// `Symbol.isRegisteredSymbol` method
	// https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
	symbolIsRegistered = Symbol.isRegisteredSymbol || function isRegisteredSymbol(value) {
	  try {
	    return keyFor(thisSymbolValue(value)) !== undefined;
	  } catch (error) {
	    return false;
	  }
	};
	return symbolIsRegistered;
}

var hasRequiredEsnext_symbol_isRegisteredSymbol;

function requireEsnext_symbol_isRegisteredSymbol () {
	if (hasRequiredEsnext_symbol_isRegisteredSymbol) return esnext_symbol_isRegisteredSymbol;
	hasRequiredEsnext_symbol_isRegisteredSymbol = 1;
	var $ = require_export();
	var isRegisteredSymbol = requireSymbolIsRegistered();

	// `Symbol.isRegisteredSymbol` method
	// https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
	$({ target: 'Symbol', stat: true }, {
	  isRegisteredSymbol: isRegisteredSymbol
	});
	return esnext_symbol_isRegisteredSymbol;
}

var esnext_symbol_isRegistered = {};

var hasRequiredEsnext_symbol_isRegistered;

function requireEsnext_symbol_isRegistered () {
	if (hasRequiredEsnext_symbol_isRegistered) return esnext_symbol_isRegistered;
	hasRequiredEsnext_symbol_isRegistered = 1;
	var $ = require_export();
	var isRegisteredSymbol = requireSymbolIsRegistered();

	// `Symbol.isRegistered` method
	// obsolete version of https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
	$({ target: 'Symbol', stat: true, name: 'isRegisteredSymbol' }, {
	  isRegistered: isRegisteredSymbol
	});
	return esnext_symbol_isRegistered;
}

var esnext_symbol_isWellKnownSymbol = {};

var symbolIsWellKnown;
var hasRequiredSymbolIsWellKnown;

function requireSymbolIsWellKnown () {
	if (hasRequiredSymbolIsWellKnown) return symbolIsWellKnown;
	hasRequiredSymbolIsWellKnown = 1;
	var shared = requireShared();
	var getBuiltIn = requireGetBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var isSymbol = requireIsSymbol();
	var wellKnownSymbol = requireWellKnownSymbol();

	var Symbol = getBuiltIn('Symbol');
	var $isWellKnownSymbol = Symbol.isWellKnownSymbol;
	var getOwnPropertyNames = getBuiltIn('Object', 'getOwnPropertyNames');
	var thisSymbolValue = uncurryThis(Symbol.prototype.valueOf);
	var WellKnownSymbolsStore = shared('wks');

	for (var i = 0, symbolKeys = getOwnPropertyNames(Symbol), symbolKeysLength = symbolKeys.length; i < symbolKeysLength; i++) {
	  // some old engines throws on access to some keys like `arguments` or `caller`
	  try {
	    var symbolKey = symbolKeys[i];
	    if (isSymbol(Symbol[symbolKey])) wellKnownSymbol(symbolKey);
	  } catch (error) { /* empty */ }
	}

	// `Symbol.isWellKnownSymbol` method
	// https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
	// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
	symbolIsWellKnown = function isWellKnownSymbol(value) {
	  if ($isWellKnownSymbol && $isWellKnownSymbol(value)) return true;
	  try {
	    var symbol = thisSymbolValue(value);
	    for (var j = 0, keys = getOwnPropertyNames(WellKnownSymbolsStore), keysLength = keys.length; j < keysLength; j++) {
	      // eslint-disable-next-line eqeqeq -- polyfilled symbols case
	      if (WellKnownSymbolsStore[keys[j]] == symbol) return true;
	    }
	  } catch (error) { /* empty */ }
	  return false;
	};
	return symbolIsWellKnown;
}

var hasRequiredEsnext_symbol_isWellKnownSymbol;

function requireEsnext_symbol_isWellKnownSymbol () {
	if (hasRequiredEsnext_symbol_isWellKnownSymbol) return esnext_symbol_isWellKnownSymbol;
	hasRequiredEsnext_symbol_isWellKnownSymbol = 1;
	var $ = require_export();
	var isWellKnownSymbol = requireSymbolIsWellKnown();

	// `Symbol.isWellKnownSymbol` method
	// https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
	// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
	$({ target: 'Symbol', stat: true, forced: true }, {
	  isWellKnownSymbol: isWellKnownSymbol
	});
	return esnext_symbol_isWellKnownSymbol;
}

var esnext_symbol_isWellKnown = {};

var hasRequiredEsnext_symbol_isWellKnown;

function requireEsnext_symbol_isWellKnown () {
	if (hasRequiredEsnext_symbol_isWellKnown) return esnext_symbol_isWellKnown;
	hasRequiredEsnext_symbol_isWellKnown = 1;
	var $ = require_export();
	var isWellKnownSymbol = requireSymbolIsWellKnown();

	// `Symbol.isWellKnown` method
	// obsolete version of https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
	// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
	$({ target: 'Symbol', stat: true, name: 'isWellKnownSymbol', forced: true }, {
	  isWellKnown: isWellKnownSymbol
	});
	return esnext_symbol_isWellKnown;
}

var esnext_symbol_matcher = {};

var hasRequiredEsnext_symbol_matcher;

function requireEsnext_symbol_matcher () {
	if (hasRequiredEsnext_symbol_matcher) return esnext_symbol_matcher;
	hasRequiredEsnext_symbol_matcher = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.matcher` well-known symbol
	// https://github.com/tc39/proposal-pattern-matching
	defineWellKnownSymbol('matcher');
	return esnext_symbol_matcher;
}

var esnext_symbol_metadata = {};

var hasRequiredEsnext_symbol_metadata;

function requireEsnext_symbol_metadata () {
	if (hasRequiredEsnext_symbol_metadata) return esnext_symbol_metadata;
	hasRequiredEsnext_symbol_metadata = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.metadata` well-known symbol
	// https://github.com/tc39/proposal-decorators
	defineWellKnownSymbol('metadata');
	return esnext_symbol_metadata;
}

var esnext_symbol_metadataKey = {};

var hasRequiredEsnext_symbol_metadataKey;

function requireEsnext_symbol_metadataKey () {
	if (hasRequiredEsnext_symbol_metadataKey) return esnext_symbol_metadataKey;
	hasRequiredEsnext_symbol_metadataKey = 1;
	// TODO: Remove from `core-js@4`
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.metadataKey` well-known symbol
	// https://github.com/tc39/proposal-decorator-metadata
	defineWellKnownSymbol('metadataKey');
	return esnext_symbol_metadataKey;
}

var esnext_symbol_observable = {};

var hasRequiredEsnext_symbol_observable;

function requireEsnext_symbol_observable () {
	if (hasRequiredEsnext_symbol_observable) return esnext_symbol_observable;
	hasRequiredEsnext_symbol_observable = 1;
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.observable` well-known symbol
	// https://github.com/tc39/proposal-observable
	defineWellKnownSymbol('observable');
	return esnext_symbol_observable;
}

var esnext_symbol_patternMatch = {};

var hasRequiredEsnext_symbol_patternMatch;

function requireEsnext_symbol_patternMatch () {
	if (hasRequiredEsnext_symbol_patternMatch) return esnext_symbol_patternMatch;
	hasRequiredEsnext_symbol_patternMatch = 1;
	// TODO: remove from `core-js@4`
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	// `Symbol.patternMatch` well-known symbol
	// https://github.com/tc39/proposal-pattern-matching
	defineWellKnownSymbol('patternMatch');
	return esnext_symbol_patternMatch;
}

var esnext_symbol_replaceAll = {};

var hasRequiredEsnext_symbol_replaceAll;

function requireEsnext_symbol_replaceAll () {
	if (hasRequiredEsnext_symbol_replaceAll) return esnext_symbol_replaceAll;
	hasRequiredEsnext_symbol_replaceAll = 1;
	// TODO: remove from `core-js@4`
	var defineWellKnownSymbol = requireWellKnownSymbolDefine();

	defineWellKnownSymbol('replaceAll');
	return esnext_symbol_replaceAll;
}

var esnext_typedArray_fromAsync = {};

var hasRequiredEsnext_typedArray_fromAsync;

function requireEsnext_typedArray_fromAsync () {
	if (hasRequiredEsnext_typedArray_fromAsync) return esnext_typedArray_fromAsync;
	hasRequiredEsnext_typedArray_fromAsync = 1;
	// TODO: Remove from `core-js@4`
	var getBuiltIn = requireGetBuiltIn();
	var aConstructor = requireAConstructor();
	var arrayFromAsync = requireArrayFromAsync();
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var arrayFromConstructorAndList = requireArrayFromConstructorAndList();

	var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;
	var exportTypedArrayStaticMethod = ArrayBufferViewCore.exportTypedArrayStaticMethod;

	// `%TypedArray%.fromAsync` method
	// https://github.com/tc39/proposal-array-from-async
	exportTypedArrayStaticMethod('fromAsync', function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
	  var C = this;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var thisArg = argumentsLength > 2 ? arguments[2] : undefined;
	  return new (getBuiltIn('Promise'))(function (resolve) {
	    aConstructor(C);
	    resolve(arrayFromAsync(asyncItems, mapfn, thisArg));
	  }).then(function (list) {
	    return arrayFromConstructorAndList(aTypedArrayConstructor(C), list);
	  });
	}, true);
	return esnext_typedArray_fromAsync;
}

var esnext_typedArray_at = {};

var hasRequiredEsnext_typedArray_at;

function requireEsnext_typedArray_at () {
	if (hasRequiredEsnext_typedArray_at) return esnext_typedArray_at;
	hasRequiredEsnext_typedArray_at = 1;
	// TODO: Remove from `core-js@4`
	requireEs_typedArray_at();
	return esnext_typedArray_at;
}

var esnext_typedArray_filterOut = {};

var hasRequiredEsnext_typedArray_filterOut;

function requireEsnext_typedArray_filterOut () {
	if (hasRequiredEsnext_typedArray_filterOut) return esnext_typedArray_filterOut;
	hasRequiredEsnext_typedArray_filterOut = 1;
	// TODO: Remove from `core-js@4`
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $filterReject = requireArrayIteration().filterReject;
	var fromSpeciesAndList = requireTypedArrayFromSpeciesAndList();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.filterOut` method
	// https://github.com/tc39/proposal-array-filtering
	exportTypedArrayMethod('filterOut', function filterOut(callbackfn /* , thisArg */) {
	  var list = $filterReject(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  return fromSpeciesAndList(this, list);
	}, true);
	return esnext_typedArray_filterOut;
}

var esnext_typedArray_filterReject = {};

var hasRequiredEsnext_typedArray_filterReject;

function requireEsnext_typedArray_filterReject () {
	if (hasRequiredEsnext_typedArray_filterReject) return esnext_typedArray_filterReject;
	hasRequiredEsnext_typedArray_filterReject = 1;
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $filterReject = requireArrayIteration().filterReject;
	var fromSpeciesAndList = requireTypedArrayFromSpeciesAndList();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.filterReject` method
	// https://github.com/tc39/proposal-array-filtering
	exportTypedArrayMethod('filterReject', function filterReject(callbackfn /* , thisArg */) {
	  var list = $filterReject(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  return fromSpeciesAndList(this, list);
	}, true);
	return esnext_typedArray_filterReject;
}

var esnext_typedArray_findLast = {};

var hasRequiredEsnext_typedArray_findLast;

function requireEsnext_typedArray_findLast () {
	if (hasRequiredEsnext_typedArray_findLast) return esnext_typedArray_findLast;
	hasRequiredEsnext_typedArray_findLast = 1;
	// TODO: Remove from `core-js@4`
	requireEs_typedArray_findLast();
	return esnext_typedArray_findLast;
}

var esnext_typedArray_findLastIndex = {};

var hasRequiredEsnext_typedArray_findLastIndex;

function requireEsnext_typedArray_findLastIndex () {
	if (hasRequiredEsnext_typedArray_findLastIndex) return esnext_typedArray_findLastIndex;
	hasRequiredEsnext_typedArray_findLastIndex = 1;
	// TODO: Remove from `core-js@4`
	requireEs_typedArray_findLastIndex();
	return esnext_typedArray_findLastIndex;
}

var esnext_typedArray_groupBy = {};

var hasRequiredEsnext_typedArray_groupBy;

function requireEsnext_typedArray_groupBy () {
	if (hasRequiredEsnext_typedArray_groupBy) return esnext_typedArray_groupBy;
	hasRequiredEsnext_typedArray_groupBy = 1;
	// TODO: Remove from `core-js@4`
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var $group = requireArrayGroup();
	var typedArraySpeciesConstructor = requireTypedArraySpeciesConstructor();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

	// `%TypedArray%.prototype.groupBy` method
	// https://github.com/tc39/proposal-array-grouping
	exportTypedArrayMethod('groupBy', function groupBy(callbackfn /* , thisArg */) {
	  var thisArg = arguments.length > 1 ? arguments[1] : undefined;
	  return $group(aTypedArray(this), callbackfn, thisArg, typedArraySpeciesConstructor);
	}, true);
	return esnext_typedArray_groupBy;
}

var esnext_typedArray_toReversed = {};

var hasRequiredEsnext_typedArray_toReversed;

function requireEsnext_typedArray_toReversed () {
	if (hasRequiredEsnext_typedArray_toReversed) return esnext_typedArray_toReversed;
	hasRequiredEsnext_typedArray_toReversed = 1;
	// TODO: Remove from `core-js@4`
	requireEs_typedArray_toReversed();
	return esnext_typedArray_toReversed;
}

var esnext_typedArray_toSorted = {};

var hasRequiredEsnext_typedArray_toSorted;

function requireEsnext_typedArray_toSorted () {
	if (hasRequiredEsnext_typedArray_toSorted) return esnext_typedArray_toSorted;
	hasRequiredEsnext_typedArray_toSorted = 1;
	// TODO: Remove from `core-js@4`
	requireEs_typedArray_toSorted();
	return esnext_typedArray_toSorted;
}

var esnext_typedArray_toSpliced = {};

var hasRequiredEsnext_typedArray_toSpliced;

function requireEsnext_typedArray_toSpliced () {
	if (hasRequiredEsnext_typedArray_toSpliced) return esnext_typedArray_toSpliced;
	hasRequiredEsnext_typedArray_toSpliced = 1;
	// TODO: Remove from `core-js@4`
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var isBigIntArray = requireIsBigIntArray();
	var toAbsoluteIndex = requireToAbsoluteIndex();
	var toBigInt = requireToBigInt();
	var toIntegerOrInfinity = requireToIntegerOrInfinity();
	var fails = requireFails();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
	var max = Math.max;
	var min = Math.min;

	// some early implementations, like WebKit, does not follow the final semantic
	var PROPER_ORDER = !fails(function () {
	  // eslint-disable-next-line es/no-typed-arrays -- required for testing
	  var array = new Int8Array([1]);

	  var spliced = array.toSpliced(1, 0, {
	    valueOf: function () {
	      array[0] = 2;
	      return 3;
	    }
	  });

	  return spliced[0] !== 2 || spliced[1] !== 3;
	});

	// `%TypedArray%.prototype.toSpliced` method
	// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.toSpliced
	exportTypedArrayMethod('toSpliced', function toSpliced(start, deleteCount /* , ...items */) {
	  var O = aTypedArray(this);
	  var C = getTypedArrayConstructor(O);
	  var len = lengthOfArrayLike(O);
	  var actualStart = toAbsoluteIndex(start, len);
	  var argumentsLength = arguments.length;
	  var k = 0;
	  var insertCount, actualDeleteCount, thisIsBigIntArray, convertedItems, value, newLen, A;
	  if (argumentsLength === 0) {
	    insertCount = actualDeleteCount = 0;
	  } else if (argumentsLength === 1) {
	    insertCount = 0;
	    actualDeleteCount = len - actualStart;
	  } else {
	    actualDeleteCount = min(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
	    insertCount = argumentsLength - 2;
	    if (insertCount) {
	      convertedItems = new C(insertCount);
	      thisIsBigIntArray = isBigIntArray(convertedItems);
	      for (var i = 2; i < argumentsLength; i++) {
	        value = arguments[i];
	        // FF30- typed arrays doesn't properly convert objects to typed array values
	        convertedItems[i - 2] = thisIsBigIntArray ? toBigInt(value) : +value;
	      }
	    }
	  }
	  newLen = len + insertCount - actualDeleteCount;
	  A = new C(newLen);

	  for (; k < actualStart; k++) A[k] = O[k];
	  for (; k < actualStart + insertCount; k++) A[k] = convertedItems[k - actualStart];
	  for (; k < newLen; k++) A[k] = O[k + actualDeleteCount - insertCount];

	  return A;
	}, !PROPER_ORDER);
	return esnext_typedArray_toSpliced;
}

var esnext_typedArray_uniqueBy = {};

var hasRequiredEsnext_typedArray_uniqueBy;

function requireEsnext_typedArray_uniqueBy () {
	if (hasRequiredEsnext_typedArray_uniqueBy) return esnext_typedArray_uniqueBy;
	hasRequiredEsnext_typedArray_uniqueBy = 1;
	var uncurryThis = requireFunctionUncurryThis();
	var ArrayBufferViewCore = requireArrayBufferViewCore();
	var arrayFromConstructorAndList = requireArrayFromConstructorAndList();
	var $arrayUniqueBy = requireArrayUniqueBy();

	var aTypedArray = ArrayBufferViewCore.aTypedArray;
	var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;
	var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
	var arrayUniqueBy = uncurryThis($arrayUniqueBy);

	// `%TypedArray%.prototype.uniqueBy` method
	// https://github.com/tc39/proposal-array-unique
	exportTypedArrayMethod('uniqueBy', function uniqueBy(resolver) {
	  aTypedArray(this);
	  return arrayFromConstructorAndList(getTypedArrayConstructor(this), arrayUniqueBy(this, resolver));
	}, true);
	return esnext_typedArray_uniqueBy;
}

var esnext_typedArray_with = {};

var hasRequiredEsnext_typedArray_with;

function requireEsnext_typedArray_with () {
	if (hasRequiredEsnext_typedArray_with) return esnext_typedArray_with;
	hasRequiredEsnext_typedArray_with = 1;
	// TODO: Remove from `core-js@4`
	requireEs_typedArray_with();
	return esnext_typedArray_with;
}

var esnext_uint8Array_fromBase64 = {};

var anObjectOrUndefined;
var hasRequiredAnObjectOrUndefined;

function requireAnObjectOrUndefined () {
	if (hasRequiredAnObjectOrUndefined) return anObjectOrUndefined;
	hasRequiredAnObjectOrUndefined = 1;
	var isObject = requireIsObject();

	var $String = String;
	var $TypeError = TypeError;

	anObjectOrUndefined = function (argument) {
	  if (argument === undefined || isObject(argument)) return argument;
	  throw new $TypeError($String(argument) + ' is not an object or undefined');
	};
	return anObjectOrUndefined;
}

var base64Map;
var hasRequiredBase64Map;

function requireBase64Map () {
	if (hasRequiredBase64Map) return base64Map;
	hasRequiredBase64Map = 1;
	var commonAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var base64Alphabet = commonAlphabet + '+/';
	var base64UrlAlphabet = commonAlphabet + '-_';

	var inverse = function (characters) {
	  // TODO: use `Object.create(null)` in `core-js@4`
	  var result = {};
	  var index = 0;
	  for (; index < 64; index++) result[characters.charAt(index)] = index;
	  return result;
	};

	base64Map = {
	  i2c: base64Alphabet,
	  c2i: inverse(base64Alphabet),
	  i2cUrl: base64UrlAlphabet,
	  c2iUrl: inverse(base64UrlAlphabet)
	};
	return base64Map;
}

var getAlphabetOption;
var hasRequiredGetAlphabetOption;

function requireGetAlphabetOption () {
	if (hasRequiredGetAlphabetOption) return getAlphabetOption;
	hasRequiredGetAlphabetOption = 1;
	var $TypeError = TypeError;

	getAlphabetOption = function (options) {
	  var alphabet = options && options.alphabet;
	  if (alphabet === undefined || alphabet === 'base64' || alphabet === 'base64url') return alphabet || 'base64';
	  throw new $TypeError('Incorrect `alphabet` option');
	};
	return getAlphabetOption;
}

var uint8FromBase64;
var hasRequiredUint8FromBase64;

function requireUint8FromBase64 () {
	if (hasRequiredUint8FromBase64) return uint8FromBase64;
	hasRequiredUint8FromBase64 = 1;
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();
	var anObjectOrUndefined = requireAnObjectOrUndefined();
	var aString = requireAString();
	var hasOwn = requireHasOwnProperty();
	var base64Map = requireBase64Map();
	var getAlphabetOption = requireGetAlphabetOption();
	var notDetached = requireArrayBufferNotDetached();

	var base64Alphabet = base64Map.c2i;
	var base64UrlAlphabet = base64Map.c2iUrl;

	var SyntaxError = globalThis.SyntaxError;
	var TypeError = globalThis.TypeError;
	var at = uncurryThis(''.charAt);

	var skipAsciiWhitespace = function (string, index) {
	  var length = string.length;
	  for (;index < length; index++) {
	    var chr = at(string, index);
	    if (chr !== ' ' && chr !== '\t' && chr !== '\n' && chr !== '\f' && chr !== '\r') break;
	  } return index;
	};

	var decodeBase64Chunk = function (chunk, alphabet, throwOnExtraBits) {
	  var chunkLength = chunk.length;

	  if (chunkLength < 4) {
	    chunk += chunkLength === 2 ? 'AA' : 'A';
	  }

	  var triplet = (alphabet[at(chunk, 0)] << 18)
	    + (alphabet[at(chunk, 1)] << 12)
	    + (alphabet[at(chunk, 2)] << 6)
	    + alphabet[at(chunk, 3)];

	  var chunkBytes = [
	    (triplet >> 16) & 255,
	    (triplet >> 8) & 255,
	    triplet & 255
	  ];

	  if (chunkLength === 2) {
	    if (throwOnExtraBits && chunkBytes[1] !== 0) {
	      throw new SyntaxError('Extra bits');
	    }
	    return [chunkBytes[0]];
	  }

	  if (chunkLength === 3) {
	    if (throwOnExtraBits && chunkBytes[2] !== 0) {
	      throw new SyntaxError('Extra bits');
	    }
	    return [chunkBytes[0], chunkBytes[1]];
	  }

	  return chunkBytes;
	};

	var writeBytes = function (bytes, elements, written) {
	  var elementsLength = elements.length;
	  for (var index = 0; index < elementsLength; index++) {
	    bytes[written + index] = elements[index];
	  }
	  return written + elementsLength;
	};

	/* eslint-disable max-statements, max-depth -- TODO */
	uint8FromBase64 = function (string, options, into, maxLength) {
	  aString(string);
	  anObjectOrUndefined(options);
	  var alphabet = getAlphabetOption(options) === 'base64' ? base64Alphabet : base64UrlAlphabet;
	  var lastChunkHandling = options ? options.lastChunkHandling : undefined;

	  if (lastChunkHandling === undefined) lastChunkHandling = 'loose';

	  if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
	    throw new TypeError('Incorrect `lastChunkHandling` option');
	  }

	  if (into) notDetached(into.buffer);

	  var bytes = into || [];
	  var written = 0;
	  var read = 0;
	  var chunk = '';
	  var index = 0;

	  if (maxLength) while (true) {
	    index = skipAsciiWhitespace(string, index);
	    if (index === string.length) {
	      if (chunk.length > 0) {
	        if (lastChunkHandling === 'stop-before-partial') {
	          break;
	        }
	        if (lastChunkHandling === 'loose') {
	          if (chunk.length === 1) {
	            throw new SyntaxError('Malformed padding: exactly one additional character');
	          }
	          written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, false), written);
	        } else {
	          throw new SyntaxError('Missing padding');
	        }
	      }
	      read = string.length;
	      break;
	    }
	    var chr = at(string, index);
	    ++index;
	    if (chr === '=') {
	      if (chunk.length < 2) {
	        throw new SyntaxError('Padding is too early');
	      }
	      index = skipAsciiWhitespace(string, index);
	      if (chunk.length === 2) {
	        if (index === string.length) {
	          if (lastChunkHandling === 'stop-before-partial') {
	            break;
	          }
	          throw new SyntaxError('Malformed padding: only one =');
	        }
	        if (at(string, index) === '=') {
	          ++index;
	          index = skipAsciiWhitespace(string, index);
	        }
	      }
	      if (index < string.length) {
	        throw new SyntaxError('Unexpected character after padding');
	      }
	      written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, lastChunkHandling === 'strict'), written);
	      read = string.length;
	      break;
	    }
	    if (!hasOwn(alphabet, chr)) {
	      throw new SyntaxError('Unexpected character');
	    }
	    var remainingBytes = maxLength - written;
	    if (remainingBytes === 1 && chunk.length === 2 || remainingBytes === 2 && chunk.length === 3) {
	      // special case: we can fit exactly the number of bytes currently represented by chunk, so we were just checking for `=`
	      break;
	    }

	    chunk += chr;
	    if (chunk.length === 4) {
	      written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, false), written);
	      chunk = '';
	      read = index;
	      if (written === maxLength) {
	        break;
	      }
	    }
	  }

	  return { bytes: bytes, read: read, written: written };
	};
	return uint8FromBase64;
}

var hasRequiredEsnext_uint8Array_fromBase64;

function requireEsnext_uint8Array_fromBase64 () {
	if (hasRequiredEsnext_uint8Array_fromBase64) return esnext_uint8Array_fromBase64;
	hasRequiredEsnext_uint8Array_fromBase64 = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var arrayFromConstructorAndList = requireArrayFromConstructorAndList();
	var $fromBase64 = requireUint8FromBase64();

	var Uint8Array = globalThis.Uint8Array;

	// `Uint8Array.fromBase64` method
	// https://github.com/tc39/proposal-arraybuffer-base64
	if (Uint8Array) $({ target: 'Uint8Array', stat: true }, {
	  fromBase64: function fromBase64(string /* , options */) {
	    var result = $fromBase64(string, arguments.length > 1 ? arguments[1] : undefined, null, 0x1FFFFFFFFFFFFF);
	    return arrayFromConstructorAndList(Uint8Array, result.bytes);
	  }
	});
	return esnext_uint8Array_fromBase64;
}

var esnext_uint8Array_fromHex = {};

var uint8FromHex;
var hasRequiredUint8FromHex;

function requireUint8FromHex () {
	if (hasRequiredUint8FromHex) return uint8FromHex;
	hasRequiredUint8FromHex = 1;
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();

	var Uint8Array = globalThis.Uint8Array;
	var SyntaxError = globalThis.SyntaxError;
	var parseInt = globalThis.parseInt;
	var min = Math.min;
	var NOT_HEX = /[^\da-f]/i;
	var exec = uncurryThis(NOT_HEX.exec);
	var stringSlice = uncurryThis(''.slice);

	uint8FromHex = function (string, into) {
	  var stringLength = string.length;
	  if (stringLength % 2 !== 0) throw new SyntaxError('String should be an even number of characters');
	  var maxLength = into ? min(into.length, stringLength / 2) : stringLength / 2;
	  var bytes = into || new Uint8Array(maxLength);
	  var read = 0;
	  var written = 0;
	  while (written < maxLength) {
	    var hexits = stringSlice(string, read, read += 2);
	    if (exec(NOT_HEX, hexits)) throw new SyntaxError('String should only contain hex characters');
	    bytes[written++] = parseInt(hexits, 16);
	  }
	  return { bytes: bytes, read: read };
	};
	return uint8FromHex;
}

var hasRequiredEsnext_uint8Array_fromHex;

function requireEsnext_uint8Array_fromHex () {
	if (hasRequiredEsnext_uint8Array_fromHex) return esnext_uint8Array_fromHex;
	hasRequiredEsnext_uint8Array_fromHex = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var aString = requireAString();
	var $fromHex = requireUint8FromHex();

	// `Uint8Array.fromHex` method
	// https://github.com/tc39/proposal-arraybuffer-base64
	if (globalThis.Uint8Array) $({ target: 'Uint8Array', stat: true }, {
	  fromHex: function fromHex(string) {
	    return $fromHex(aString(string)).bytes;
	  }
	});
	return esnext_uint8Array_fromHex;
}

var esnext_uint8Array_setFromBase64 = {};

var anUint8Array;
var hasRequiredAnUint8Array;

function requireAnUint8Array () {
	if (hasRequiredAnUint8Array) return anUint8Array;
	hasRequiredAnUint8Array = 1;
	var classof = requireClassof();

	var $TypeError = TypeError;

	// Perform ? RequireInternalSlot(argument, [[TypedArrayName]])
	// If argument.[[TypedArrayName]] is not "Uint8Array", throw a TypeError exception
	anUint8Array = function (argument) {
	  if (classof(argument) === 'Uint8Array') return argument;
	  throw new $TypeError('Argument is not an Uint8Array');
	};
	return anUint8Array;
}

var hasRequiredEsnext_uint8Array_setFromBase64;

function requireEsnext_uint8Array_setFromBase64 () {
	if (hasRequiredEsnext_uint8Array_setFromBase64) return esnext_uint8Array_setFromBase64;
	hasRequiredEsnext_uint8Array_setFromBase64 = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var $fromBase64 = requireUint8FromBase64();
	var anUint8Array = requireAnUint8Array();

	var Uint8Array = globalThis.Uint8Array;

	// `Uint8Array.prototype.setFromBase64` method
	// https://github.com/tc39/proposal-arraybuffer-base64
	if (Uint8Array) $({ target: 'Uint8Array', proto: true }, {
	  setFromBase64: function setFromBase64(string /* , options */) {
	    anUint8Array(this);

	    var result = $fromBase64(string, arguments.length > 1 ? arguments[1] : undefined, this, this.length);

	    return { read: result.read, written: result.written };
	  }
	});
	return esnext_uint8Array_setFromBase64;
}

var esnext_uint8Array_setFromHex = {};

var hasRequiredEsnext_uint8Array_setFromHex;

function requireEsnext_uint8Array_setFromHex () {
	if (hasRequiredEsnext_uint8Array_setFromHex) return esnext_uint8Array_setFromHex;
	hasRequiredEsnext_uint8Array_setFromHex = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var aString = requireAString();
	var anUint8Array = requireAnUint8Array();
	var notDetached = requireArrayBufferNotDetached();
	var $fromHex = requireUint8FromHex();

	// `Uint8Array.prototype.setFromHex` method
	// https://github.com/tc39/proposal-arraybuffer-base64
	if (globalThis.Uint8Array) $({ target: 'Uint8Array', proto: true }, {
	  setFromHex: function setFromHex(string) {
	    anUint8Array(this);
	    aString(string);
	    notDetached(this.buffer);
	    var read = $fromHex(string, this).read;
	    return { read: read, written: read / 2 };
	  }
	});
	return esnext_uint8Array_setFromHex;
}

var esnext_uint8Array_toBase64 = {};

var hasRequiredEsnext_uint8Array_toBase64;

function requireEsnext_uint8Array_toBase64 () {
	if (hasRequiredEsnext_uint8Array_toBase64) return esnext_uint8Array_toBase64;
	hasRequiredEsnext_uint8Array_toBase64 = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();
	var anObjectOrUndefined = requireAnObjectOrUndefined();
	var anUint8Array = requireAnUint8Array();
	var notDetached = requireArrayBufferNotDetached();
	var base64Map = requireBase64Map();
	var getAlphabetOption = requireGetAlphabetOption();

	var base64Alphabet = base64Map.i2c;
	var base64UrlAlphabet = base64Map.i2cUrl;

	var charAt = uncurryThis(''.charAt);

	// `Uint8Array.prototype.toBase64` method
	// https://github.com/tc39/proposal-arraybuffer-base64
	if (globalThis.Uint8Array) $({ target: 'Uint8Array', proto: true }, {
	  toBase64: function toBase64(/* options */) {
	    var array = anUint8Array(this);
	    var options = arguments.length ? anObjectOrUndefined(arguments[0]) : undefined;
	    var alphabet = getAlphabetOption(options) === 'base64' ? base64Alphabet : base64UrlAlphabet;
	    var omitPadding = !!options && !!options.omitPadding;
	    notDetached(this.buffer);

	    var result = '';
	    var i = 0;
	    var length = array.length;
	    var triplet;

	    var at = function (shift) {
	      return charAt(alphabet, (triplet >> (6 * shift)) & 63);
	    };

	    for (; i + 2 < length; i += 3) {
	      triplet = (array[i] << 16) + (array[i + 1] << 8) + array[i + 2];
	      result += at(3) + at(2) + at(1) + at(0);
	    }
	    if (i + 2 === length) {
	      triplet = (array[i] << 16) + (array[i + 1] << 8);
	      result += at(3) + at(2) + at(1) + (omitPadding ? '' : '=');
	    } else if (i + 1 === length) {
	      triplet = array[i] << 16;
	      result += at(3) + at(2) + (omitPadding ? '' : '==');
	    }

	    return result;
	  }
	});
	return esnext_uint8Array_toBase64;
}

var esnext_uint8Array_toHex = {};

var hasRequiredEsnext_uint8Array_toHex;

function requireEsnext_uint8Array_toHex () {
	if (hasRequiredEsnext_uint8Array_toHex) return esnext_uint8Array_toHex;
	hasRequiredEsnext_uint8Array_toHex = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var uncurryThis = requireFunctionUncurryThis();
	var anUint8Array = requireAnUint8Array();
	var notDetached = requireArrayBufferNotDetached();

	var numberToString = uncurryThis(1.0.toString);

	// `Uint8Array.prototype.toHex` method
	// https://github.com/tc39/proposal-arraybuffer-base64
	if (globalThis.Uint8Array) $({ target: 'Uint8Array', proto: true }, {
	  toHex: function toHex() {
	    anUint8Array(this);
	    notDetached(this.buffer);
	    var result = '';
	    for (var i = 0, length = this.length; i < length; i++) {
	      var hex = numberToString(this[i], 16);
	      result += hex.length === 1 ? '0' + hex : hex;
	    }
	    return result;
	  }
	});
	return esnext_uint8Array_toHex;
}

var esnext_weakMap_deleteAll = {};

var aWeakMap;
var hasRequiredAWeakMap;

function requireAWeakMap () {
	if (hasRequiredAWeakMap) return aWeakMap;
	hasRequiredAWeakMap = 1;
	var has = requireWeakMapHelpers().has;

	// Perform ? RequireInternalSlot(M, [[WeakMapData]])
	aWeakMap = function (it) {
	  has(it);
	  return it;
	};
	return aWeakMap;
}

var hasRequiredEsnext_weakMap_deleteAll;

function requireEsnext_weakMap_deleteAll () {
	if (hasRequiredEsnext_weakMap_deleteAll) return esnext_weakMap_deleteAll;
	hasRequiredEsnext_weakMap_deleteAll = 1;
	var $ = require_export();
	var aWeakMap = requireAWeakMap();
	var remove = requireWeakMapHelpers().remove;

	// `WeakMap.prototype.deleteAll` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'WeakMap', proto: true, real: true, forced: true }, {
	  deleteAll: function deleteAll(/* ...elements */) {
	    var collection = aWeakMap(this);
	    var allDeleted = true;
	    var wasDeleted;
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      wasDeleted = remove(collection, arguments[k]);
	      allDeleted = allDeleted && wasDeleted;
	    } return !!allDeleted;
	  }
	});
	return esnext_weakMap_deleteAll;
}

var esnext_weakMap_from = {};

var hasRequiredEsnext_weakMap_from;

function requireEsnext_weakMap_from () {
	if (hasRequiredEsnext_weakMap_from) return esnext_weakMap_from;
	hasRequiredEsnext_weakMap_from = 1;
	var $ = require_export();
	var WeakMapHelpers = requireWeakMapHelpers();
	var createCollectionFrom = requireCollectionFrom();

	// `WeakMap.from` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from
	$({ target: 'WeakMap', stat: true, forced: true }, {
	  from: createCollectionFrom(WeakMapHelpers.WeakMap, WeakMapHelpers.set, true)
	});
	return esnext_weakMap_from;
}

var esnext_weakMap_of = {};

var hasRequiredEsnext_weakMap_of;

function requireEsnext_weakMap_of () {
	if (hasRequiredEsnext_weakMap_of) return esnext_weakMap_of;
	hasRequiredEsnext_weakMap_of = 1;
	var $ = require_export();
	var WeakMapHelpers = requireWeakMapHelpers();
	var createCollectionOf = requireCollectionOf();

	// `WeakMap.of` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of
	$({ target: 'WeakMap', stat: true, forced: true }, {
	  of: createCollectionOf(WeakMapHelpers.WeakMap, WeakMapHelpers.set, true)
	});
	return esnext_weakMap_of;
}

var esnext_weakMap_emplace = {};

var hasRequiredEsnext_weakMap_emplace;

function requireEsnext_weakMap_emplace () {
	if (hasRequiredEsnext_weakMap_emplace) return esnext_weakMap_emplace;
	hasRequiredEsnext_weakMap_emplace = 1;
	var $ = require_export();
	var aWeakMap = requireAWeakMap();
	var WeakMapHelpers = requireWeakMapHelpers();

	var get = WeakMapHelpers.get;
	var has = WeakMapHelpers.has;
	var set = WeakMapHelpers.set;

	// `WeakMap.prototype.emplace` method
	// https://github.com/tc39/proposal-upsert
	$({ target: 'WeakMap', proto: true, real: true, forced: true }, {
	  emplace: function emplace(key, handler) {
	    var map = aWeakMap(this);
	    var value, inserted;
	    if (has(map, key)) {
	      value = get(map, key);
	      if ('update' in handler) {
	        value = handler.update(value, key, map);
	        set(map, key, value);
	      } return value;
	    }
	    inserted = handler.insert(key, map);
	    set(map, key, inserted);
	    return inserted;
	  }
	});
	return esnext_weakMap_emplace;
}

var esnext_weakMap_upsert = {};

var hasRequiredEsnext_weakMap_upsert;

function requireEsnext_weakMap_upsert () {
	if (hasRequiredEsnext_weakMap_upsert) return esnext_weakMap_upsert;
	hasRequiredEsnext_weakMap_upsert = 1;
	// TODO: remove from `core-js@4`
	var $ = require_export();
	var upsert = requireMapUpsert();

	// `WeakMap.prototype.upsert` method (replaced by `WeakMap.prototype.emplace`)
	// https://github.com/tc39/proposal-upsert
	$({ target: 'WeakMap', proto: true, real: true, forced: true }, {
	  upsert: upsert
	});
	return esnext_weakMap_upsert;
}

var esnext_weakSet_addAll = {};

var weakSetHelpers;
var hasRequiredWeakSetHelpers;

function requireWeakSetHelpers () {
	if (hasRequiredWeakSetHelpers) return weakSetHelpers;
	hasRequiredWeakSetHelpers = 1;
	var uncurryThis = requireFunctionUncurryThis();

	// eslint-disable-next-line es/no-weak-set -- safe
	var WeakSetPrototype = WeakSet.prototype;

	weakSetHelpers = {
	  // eslint-disable-next-line es/no-weak-set -- safe
	  WeakSet: WeakSet,
	  add: uncurryThis(WeakSetPrototype.add),
	  has: uncurryThis(WeakSetPrototype.has),
	  remove: uncurryThis(WeakSetPrototype['delete'])
	};
	return weakSetHelpers;
}

var aWeakSet;
var hasRequiredAWeakSet;

function requireAWeakSet () {
	if (hasRequiredAWeakSet) return aWeakSet;
	hasRequiredAWeakSet = 1;
	var has = requireWeakSetHelpers().has;

	// Perform ? RequireInternalSlot(M, [[WeakSetData]])
	aWeakSet = function (it) {
	  has(it);
	  return it;
	};
	return aWeakSet;
}

var hasRequiredEsnext_weakSet_addAll;

function requireEsnext_weakSet_addAll () {
	if (hasRequiredEsnext_weakSet_addAll) return esnext_weakSet_addAll;
	hasRequiredEsnext_weakSet_addAll = 1;
	var $ = require_export();
	var aWeakSet = requireAWeakSet();
	var add = requireWeakSetHelpers().add;

	// `WeakSet.prototype.addAll` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'WeakSet', proto: true, real: true, forced: true }, {
	  addAll: function addAll(/* ...elements */) {
	    var set = aWeakSet(this);
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      add(set, arguments[k]);
	    } return set;
	  }
	});
	return esnext_weakSet_addAll;
}

var esnext_weakSet_deleteAll = {};

var hasRequiredEsnext_weakSet_deleteAll;

function requireEsnext_weakSet_deleteAll () {
	if (hasRequiredEsnext_weakSet_deleteAll) return esnext_weakSet_deleteAll;
	hasRequiredEsnext_weakSet_deleteAll = 1;
	var $ = require_export();
	var aWeakSet = requireAWeakSet();
	var remove = requireWeakSetHelpers().remove;

	// `WeakSet.prototype.deleteAll` method
	// https://github.com/tc39/proposal-collection-methods
	$({ target: 'WeakSet', proto: true, real: true, forced: true }, {
	  deleteAll: function deleteAll(/* ...elements */) {
	    var collection = aWeakSet(this);
	    var allDeleted = true;
	    var wasDeleted;
	    for (var k = 0, len = arguments.length; k < len; k++) {
	      wasDeleted = remove(collection, arguments[k]);
	      allDeleted = allDeleted && wasDeleted;
	    } return !!allDeleted;
	  }
	});
	return esnext_weakSet_deleteAll;
}

var esnext_weakSet_from = {};

var hasRequiredEsnext_weakSet_from;

function requireEsnext_weakSet_from () {
	if (hasRequiredEsnext_weakSet_from) return esnext_weakSet_from;
	hasRequiredEsnext_weakSet_from = 1;
	var $ = require_export();
	var WeakSetHelpers = requireWeakSetHelpers();
	var createCollectionFrom = requireCollectionFrom();

	// `WeakSet.from` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.from
	$({ target: 'WeakSet', stat: true, forced: true }, {
	  from: createCollectionFrom(WeakSetHelpers.WeakSet, WeakSetHelpers.add, false)
	});
	return esnext_weakSet_from;
}

var esnext_weakSet_of = {};

var hasRequiredEsnext_weakSet_of;

function requireEsnext_weakSet_of () {
	if (hasRequiredEsnext_weakSet_of) return esnext_weakSet_of;
	hasRequiredEsnext_weakSet_of = 1;
	var $ = require_export();
	var WeakSetHelpers = requireWeakSetHelpers();
	var createCollectionOf = requireCollectionOf();

	// `WeakSet.of` method
	// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of
	$({ target: 'WeakSet', stat: true, forced: true }, {
	  of: createCollectionOf(WeakSetHelpers.WeakSet, WeakSetHelpers.add, false)
	});
	return esnext_weakSet_of;
}

var web_atob = {};

var hasRequiredWeb_atob;

function requireWeb_atob () {
	if (hasRequiredWeb_atob) return web_atob;
	hasRequiredWeb_atob = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var getBuiltIn = requireGetBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var call = requireFunctionCall();
	var fails = requireFails();
	var toString = requireToString();
	var validateArgumentsLength = requireValidateArgumentsLength();
	var c2i = requireBase64Map().c2i;

	var disallowed = /[^\d+/a-z]/i;
	var whitespaces = /[\t\n\f\r ]+/g;
	var finalEq = /[=]{1,2}$/;

	var $atob = getBuiltIn('atob');
	var fromCharCode = String.fromCharCode;
	var charAt = uncurryThis(''.charAt);
	var replace = uncurryThis(''.replace);
	var exec = uncurryThis(disallowed.exec);

	var BASIC = !!$atob && !fails(function () {
	  return $atob('aGk=') !== 'hi';
	});

	var NO_SPACES_IGNORE = BASIC && fails(function () {
	  return $atob(' ') !== '';
	});

	var NO_ENCODING_CHECK = BASIC && !fails(function () {
	  $atob('a');
	});

	var NO_ARG_RECEIVING_CHECK = BASIC && !fails(function () {
	  $atob();
	});

	var WRONG_ARITY = BASIC && $atob.length !== 1;

	var FORCED = !BASIC || NO_SPACES_IGNORE || NO_ENCODING_CHECK || NO_ARG_RECEIVING_CHECK || WRONG_ARITY;

	// `atob` method
	// https://html.spec.whatwg.org/multipage/webappapis.html#dom-atob
	$({ global: true, bind: true, enumerable: true, forced: FORCED }, {
	  atob: function atob(data) {
	    validateArgumentsLength(arguments.length, 1);
	    // `webpack` dev server bug on IE global methods - use call(fn, global, ...)
	    if (BASIC && !NO_SPACES_IGNORE && !NO_ENCODING_CHECK) return call($atob, globalThis, data);
	    var string = replace(toString(data), whitespaces, '');
	    var output = '';
	    var position = 0;
	    var bc = 0;
	    var length, chr, bs;
	    if (string.length % 4 === 0) {
	      string = replace(string, finalEq, '');
	    }
	    length = string.length;
	    if (length % 4 === 1 || exec(disallowed, string)) {
	      throw new (getBuiltIn('DOMException'))('The string is not correctly encoded', 'InvalidCharacterError');
	    }
	    while (position < length) {
	      chr = charAt(string, position++);
	      bs = bc % 4 ? bs * 64 + c2i[chr] : c2i[chr];
	      if (bc++ % 4) output += fromCharCode(255 & bs >> (-2 * bc & 6));
	    } return output;
	  }
	});
	return web_atob;
}

var web_btoa = {};

var hasRequiredWeb_btoa;

function requireWeb_btoa () {
	if (hasRequiredWeb_btoa) return web_btoa;
	hasRequiredWeb_btoa = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var getBuiltIn = requireGetBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var call = requireFunctionCall();
	var fails = requireFails();
	var toString = requireToString();
	var validateArgumentsLength = requireValidateArgumentsLength();
	var i2c = requireBase64Map().i2c;

	var $btoa = getBuiltIn('btoa');
	var charAt = uncurryThis(''.charAt);
	var charCodeAt = uncurryThis(''.charCodeAt);

	var BASIC = !!$btoa && !fails(function () {
	  return $btoa('hi') !== 'aGk=';
	});

	var NO_ARG_RECEIVING_CHECK = BASIC && !fails(function () {
	  $btoa();
	});

	var WRONG_ARG_CONVERSION = BASIC && fails(function () {
	  return $btoa(null) !== 'bnVsbA==';
	});

	var WRONG_ARITY = BASIC && $btoa.length !== 1;

	// `btoa` method
	// https://html.spec.whatwg.org/multipage/webappapis.html#dom-btoa
	$({ global: true, bind: true, enumerable: true, forced: !BASIC || NO_ARG_RECEIVING_CHECK || WRONG_ARG_CONVERSION || WRONG_ARITY }, {
	  btoa: function btoa(data) {
	    validateArgumentsLength(arguments.length, 1);
	    // `webpack` dev server bug on IE global methods - use call(fn, global, ...)
	    if (BASIC) return call($btoa, globalThis, toString(data));
	    var string = toString(data);
	    var output = '';
	    var position = 0;
	    var map = i2c;
	    var block, charCode;
	    while (charAt(string, position) || (map = '=', position % 1)) {
	      charCode = charCodeAt(string, position += 3 / 4);
	      if (charCode > 0xFF) {
	        throw new (getBuiltIn('DOMException'))('The string contains characters outside of the Latin1 range', 'InvalidCharacterError');
	      }
	      block = block << 8 | charCode;
	      output += charAt(map, 63 & block >> 8 - position % 1 * 8);
	    } return output;
	  }
	});
	return web_btoa;
}

var web_domCollections_forEach = {};

var domIterables;
var hasRequiredDomIterables;

function requireDomIterables () {
	if (hasRequiredDomIterables) return domIterables;
	hasRequiredDomIterables = 1;
	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};
	return domIterables;
}

var domTokenListPrototype;
var hasRequiredDomTokenListPrototype;

function requireDomTokenListPrototype () {
	if (hasRequiredDomTokenListPrototype) return domTokenListPrototype;
	hasRequiredDomTokenListPrototype = 1;
	// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
	var documentCreateElement = requireDocumentCreateElement();

	var classList = documentCreateElement('span').classList;
	var DOMTokenListPrototype = classList && classList.constructor && classList.constructor.prototype;

	domTokenListPrototype = DOMTokenListPrototype === Object.prototype ? undefined : DOMTokenListPrototype;
	return domTokenListPrototype;
}

var hasRequiredWeb_domCollections_forEach;

function requireWeb_domCollections_forEach () {
	if (hasRequiredWeb_domCollections_forEach) return web_domCollections_forEach;
	hasRequiredWeb_domCollections_forEach = 1;
	var globalThis = requireGlobalThis();
	var DOMIterables = requireDomIterables();
	var DOMTokenListPrototype = requireDomTokenListPrototype();
	var forEach = requireArrayForEach();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();

	var handlePrototype = function (CollectionPrototype) {
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
	    createNonEnumerableProperty(CollectionPrototype, 'forEach', forEach);
	  } catch (error) {
	    CollectionPrototype.forEach = forEach;
	  }
	};

	for (var COLLECTION_NAME in DOMIterables) {
	  if (DOMIterables[COLLECTION_NAME]) {
	    handlePrototype(globalThis[COLLECTION_NAME] && globalThis[COLLECTION_NAME].prototype);
	  }
	}

	handlePrototype(DOMTokenListPrototype);
	return web_domCollections_forEach;
}

var web_domCollections_iterator = {};

var hasRequiredWeb_domCollections_iterator;

function requireWeb_domCollections_iterator () {
	if (hasRequiredWeb_domCollections_iterator) return web_domCollections_iterator;
	hasRequiredWeb_domCollections_iterator = 1;
	var globalThis = requireGlobalThis();
	var DOMIterables = requireDomIterables();
	var DOMTokenListPrototype = requireDomTokenListPrototype();
	var ArrayIteratorMethods = requireEs_array_iterator();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var setToStringTag = requireSetToStringTag();
	var wellKnownSymbol = requireWellKnownSymbol();

	var ITERATOR = wellKnownSymbol('iterator');
	var ArrayValues = ArrayIteratorMethods.values;

	var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
	  if (CollectionPrototype) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
	    } catch (error) {
	      CollectionPrototype[ITERATOR] = ArrayValues;
	    }
	    setToStringTag(CollectionPrototype, COLLECTION_NAME, true);
	    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
	      }
	    }
	  }
	};

	for (var COLLECTION_NAME in DOMIterables) {
	  handlePrototype(globalThis[COLLECTION_NAME] && globalThis[COLLECTION_NAME].prototype, COLLECTION_NAME);
	}

	handlePrototype(DOMTokenListPrototype, 'DOMTokenList');
	return web_domCollections_iterator;
}

var web_domException_constructor = {};

var domExceptionConstants;
var hasRequiredDomExceptionConstants;

function requireDomExceptionConstants () {
	if (hasRequiredDomExceptionConstants) return domExceptionConstants;
	hasRequiredDomExceptionConstants = 1;
	domExceptionConstants = {
	  IndexSizeError: { s: 'INDEX_SIZE_ERR', c: 1, m: 1 },
	  DOMStringSizeError: { s: 'DOMSTRING_SIZE_ERR', c: 2, m: 0 },
	  HierarchyRequestError: { s: 'HIERARCHY_REQUEST_ERR', c: 3, m: 1 },
	  WrongDocumentError: { s: 'WRONG_DOCUMENT_ERR', c: 4, m: 1 },
	  InvalidCharacterError: { s: 'INVALID_CHARACTER_ERR', c: 5, m: 1 },
	  NoDataAllowedError: { s: 'NO_DATA_ALLOWED_ERR', c: 6, m: 0 },
	  NoModificationAllowedError: { s: 'NO_MODIFICATION_ALLOWED_ERR', c: 7, m: 1 },
	  NotFoundError: { s: 'NOT_FOUND_ERR', c: 8, m: 1 },
	  NotSupportedError: { s: 'NOT_SUPPORTED_ERR', c: 9, m: 1 },
	  InUseAttributeError: { s: 'INUSE_ATTRIBUTE_ERR', c: 10, m: 1 },
	  InvalidStateError: { s: 'INVALID_STATE_ERR', c: 11, m: 1 },
	  SyntaxError: { s: 'SYNTAX_ERR', c: 12, m: 1 },
	  InvalidModificationError: { s: 'INVALID_MODIFICATION_ERR', c: 13, m: 1 },
	  NamespaceError: { s: 'NAMESPACE_ERR', c: 14, m: 1 },
	  InvalidAccessError: { s: 'INVALID_ACCESS_ERR', c: 15, m: 1 },
	  ValidationError: { s: 'VALIDATION_ERR', c: 16, m: 0 },
	  TypeMismatchError: { s: 'TYPE_MISMATCH_ERR', c: 17, m: 1 },
	  SecurityError: { s: 'SECURITY_ERR', c: 18, m: 1 },
	  NetworkError: { s: 'NETWORK_ERR', c: 19, m: 1 },
	  AbortError: { s: 'ABORT_ERR', c: 20, m: 1 },
	  URLMismatchError: { s: 'URL_MISMATCH_ERR', c: 21, m: 1 },
	  QuotaExceededError: { s: 'QUOTA_EXCEEDED_ERR', c: 22, m: 1 },
	  TimeoutError: { s: 'TIMEOUT_ERR', c: 23, m: 1 },
	  InvalidNodeTypeError: { s: 'INVALID_NODE_TYPE_ERR', c: 24, m: 1 },
	  DataCloneError: { s: 'DATA_CLONE_ERR', c: 25, m: 1 }
	};
	return domExceptionConstants;
}

var hasRequiredWeb_domException_constructor;

function requireWeb_domException_constructor () {
	if (hasRequiredWeb_domException_constructor) return web_domException_constructor;
	hasRequiredWeb_domException_constructor = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var getBuiltInNodeModule = requireGetBuiltInNodeModule();
	var fails = requireFails();
	var create = requireObjectCreate();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();
	var defineProperty = requireObjectDefineProperty().f;
	var defineBuiltIn = requireDefineBuiltIn();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var hasOwn = requireHasOwnProperty();
	var anInstance = requireAnInstance();
	var anObject = requireAnObject();
	var errorToString = requireErrorToString();
	var normalizeStringArgument = requireNormalizeStringArgument();
	var DOMExceptionConstants = requireDomExceptionConstants();
	var clearErrorStack = requireErrorStackClear();
	var InternalStateModule = requireInternalState();
	var DESCRIPTORS = requireDescriptors();
	var IS_PURE = requireIsPure();

	var DOM_EXCEPTION = 'DOMException';
	var DATA_CLONE_ERR = 'DATA_CLONE_ERR';
	var Error = getBuiltIn('Error');
	// NodeJS < 17.0 does not expose `DOMException` to global
	var NativeDOMException = getBuiltIn(DOM_EXCEPTION) || (function () {
	  try {
	    // NodeJS < 15.0 does not expose `MessageChannel` to global
	    var MessageChannel = getBuiltIn('MessageChannel') || getBuiltInNodeModule('worker_threads').MessageChannel;
	    // eslint-disable-next-line es/no-weak-map, unicorn/require-post-message-target-origin -- safe
	    new MessageChannel().port1.postMessage(new WeakMap());
	  } catch (error) {
	    if (error.name === DATA_CLONE_ERR && error.code === 25) return error.constructor;
	  }
	})();
	var NativeDOMExceptionPrototype = NativeDOMException && NativeDOMException.prototype;
	var ErrorPrototype = Error.prototype;
	var setInternalState = InternalStateModule.set;
	var getInternalState = InternalStateModule.getterFor(DOM_EXCEPTION);
	var HAS_STACK = 'stack' in new Error(DOM_EXCEPTION);

	var codeFor = function (name) {
	  return hasOwn(DOMExceptionConstants, name) && DOMExceptionConstants[name].m ? DOMExceptionConstants[name].c : 0;
	};

	var $DOMException = function DOMException() {
	  anInstance(this, DOMExceptionPrototype);
	  var argumentsLength = arguments.length;
	  var message = normalizeStringArgument(argumentsLength < 1 ? undefined : arguments[0]);
	  var name = normalizeStringArgument(argumentsLength < 2 ? undefined : arguments[1], 'Error');
	  var code = codeFor(name);
	  setInternalState(this, {
	    type: DOM_EXCEPTION,
	    name: name,
	    message: message,
	    code: code
	  });
	  if (!DESCRIPTORS) {
	    this.name = name;
	    this.message = message;
	    this.code = code;
	  }
	  if (HAS_STACK) {
	    var error = new Error(message);
	    error.name = DOM_EXCEPTION;
	    defineProperty(this, 'stack', createPropertyDescriptor(1, clearErrorStack(error.stack, 1)));
	  }
	};

	var DOMExceptionPrototype = $DOMException.prototype = create(ErrorPrototype);

	var createGetterDescriptor = function (get) {
	  return { enumerable: true, configurable: true, get: get };
	};

	var getterFor = function (key) {
	  return createGetterDescriptor(function () {
	    return getInternalState(this)[key];
	  });
	};

	if (DESCRIPTORS) {
	  // `DOMException.prototype.code` getter
	  defineBuiltInAccessor(DOMExceptionPrototype, 'code', getterFor('code'));
	  // `DOMException.prototype.message` getter
	  defineBuiltInAccessor(DOMExceptionPrototype, 'message', getterFor('message'));
	  // `DOMException.prototype.name` getter
	  defineBuiltInAccessor(DOMExceptionPrototype, 'name', getterFor('name'));
	}

	defineProperty(DOMExceptionPrototype, 'constructor', createPropertyDescriptor(1, $DOMException));

	// FF36- DOMException is a function, but can't be constructed
	var INCORRECT_CONSTRUCTOR = fails(function () {
	  return !(new NativeDOMException() instanceof Error);
	});

	// Safari 10.1 / Chrome 32- / IE8- DOMException.prototype.toString bugs
	var INCORRECT_TO_STRING = INCORRECT_CONSTRUCTOR || fails(function () {
	  return ErrorPrototype.toString !== errorToString || String(new NativeDOMException(1, 2)) !== '2: 1';
	});

	// Deno 1.6.3- DOMException.prototype.code just missed
	var INCORRECT_CODE = INCORRECT_CONSTRUCTOR || fails(function () {
	  return new NativeDOMException(1, 'DataCloneError').code !== 25;
	});

	// Deno 1.6.3- DOMException constants just missed
	var MISSED_CONSTANTS = INCORRECT_CONSTRUCTOR
	  || NativeDOMException[DATA_CLONE_ERR] !== 25
	  || NativeDOMExceptionPrototype[DATA_CLONE_ERR] !== 25;

	var FORCED_CONSTRUCTOR = IS_PURE ? INCORRECT_TO_STRING || INCORRECT_CODE || MISSED_CONSTANTS : INCORRECT_CONSTRUCTOR;

	// `DOMException` constructor
	// https://webidl.spec.whatwg.org/#idl-DOMException
	$({ global: true, constructor: true, forced: FORCED_CONSTRUCTOR }, {
	  DOMException: FORCED_CONSTRUCTOR ? $DOMException : NativeDOMException
	});

	var PolyfilledDOMException = getBuiltIn(DOM_EXCEPTION);
	var PolyfilledDOMExceptionPrototype = PolyfilledDOMException.prototype;

	if (INCORRECT_TO_STRING && (IS_PURE || NativeDOMException === PolyfilledDOMException)) {
	  defineBuiltIn(PolyfilledDOMExceptionPrototype, 'toString', errorToString);
	}

	if (INCORRECT_CODE && DESCRIPTORS && NativeDOMException === PolyfilledDOMException) {
	  defineBuiltInAccessor(PolyfilledDOMExceptionPrototype, 'code', createGetterDescriptor(function () {
	    return codeFor(anObject(this).name);
	  }));
	}

	// `DOMException` constants
	for (var key in DOMExceptionConstants) if (hasOwn(DOMExceptionConstants, key)) {
	  var constant = DOMExceptionConstants[key];
	  var constantName = constant.s;
	  var descriptor = createPropertyDescriptor(6, constant.c);
	  if (!hasOwn(PolyfilledDOMException, constantName)) {
	    defineProperty(PolyfilledDOMException, constantName, descriptor);
	  }
	  if (!hasOwn(PolyfilledDOMExceptionPrototype, constantName)) {
	    defineProperty(PolyfilledDOMExceptionPrototype, constantName, descriptor);
	  }
	}
	return web_domException_constructor;
}

var web_domException_stack = {};

var hasRequiredWeb_domException_stack;

function requireWeb_domException_stack () {
	if (hasRequiredWeb_domException_stack) return web_domException_stack;
	hasRequiredWeb_domException_stack = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var getBuiltIn = requireGetBuiltIn();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();
	var defineProperty = requireObjectDefineProperty().f;
	var hasOwn = requireHasOwnProperty();
	var anInstance = requireAnInstance();
	var inheritIfRequired = requireInheritIfRequired();
	var normalizeStringArgument = requireNormalizeStringArgument();
	var DOMExceptionConstants = requireDomExceptionConstants();
	var clearErrorStack = requireErrorStackClear();
	var DESCRIPTORS = requireDescriptors();
	var IS_PURE = requireIsPure();

	var DOM_EXCEPTION = 'DOMException';
	var Error = getBuiltIn('Error');
	var NativeDOMException = getBuiltIn(DOM_EXCEPTION);

	var $DOMException = function DOMException() {
	  anInstance(this, DOMExceptionPrototype);
	  var argumentsLength = arguments.length;
	  var message = normalizeStringArgument(argumentsLength < 1 ? undefined : arguments[0]);
	  var name = normalizeStringArgument(argumentsLength < 2 ? undefined : arguments[1], 'Error');
	  var that = new NativeDOMException(message, name);
	  var error = new Error(message);
	  error.name = DOM_EXCEPTION;
	  defineProperty(that, 'stack', createPropertyDescriptor(1, clearErrorStack(error.stack, 1)));
	  inheritIfRequired(that, this, $DOMException);
	  return that;
	};

	var DOMExceptionPrototype = $DOMException.prototype = NativeDOMException.prototype;

	var ERROR_HAS_STACK = 'stack' in new Error(DOM_EXCEPTION);
	var DOM_EXCEPTION_HAS_STACK = 'stack' in new NativeDOMException(1, 2);

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var descriptor = NativeDOMException && DESCRIPTORS && Object.getOwnPropertyDescriptor(globalThis, DOM_EXCEPTION);

	// Bun ~ 0.1.1 DOMException have incorrect descriptor and we can't redefine it
	// https://github.com/Jarred-Sumner/bun/issues/399
	var BUGGY_DESCRIPTOR = !!descriptor && !(descriptor.writable && descriptor.configurable);

	var FORCED_CONSTRUCTOR = ERROR_HAS_STACK && !BUGGY_DESCRIPTOR && !DOM_EXCEPTION_HAS_STACK;

	// `DOMException` constructor patch for `.stack` where it's required
	// https://webidl.spec.whatwg.org/#es-DOMException-specialness
	$({ global: true, constructor: true, forced: IS_PURE || FORCED_CONSTRUCTOR }, { // TODO: fix export logic
	  DOMException: FORCED_CONSTRUCTOR ? $DOMException : NativeDOMException
	});

	var PolyfilledDOMException = getBuiltIn(DOM_EXCEPTION);
	var PolyfilledDOMExceptionPrototype = PolyfilledDOMException.prototype;

	if (PolyfilledDOMExceptionPrototype.constructor !== PolyfilledDOMException) {
	  if (!IS_PURE) {
	    defineProperty(PolyfilledDOMExceptionPrototype, 'constructor', createPropertyDescriptor(1, PolyfilledDOMException));
	  }

	  for (var key in DOMExceptionConstants) if (hasOwn(DOMExceptionConstants, key)) {
	    var constant = DOMExceptionConstants[key];
	    var constantName = constant.s;
	    if (!hasOwn(PolyfilledDOMException, constantName)) {
	      defineProperty(PolyfilledDOMException, constantName, createPropertyDescriptor(6, constant.c));
	    }
	  }
	}
	return web_domException_stack;
}

var web_domException_toStringTag = {};

var hasRequiredWeb_domException_toStringTag;

function requireWeb_domException_toStringTag () {
	if (hasRequiredWeb_domException_toStringTag) return web_domException_toStringTag;
	hasRequiredWeb_domException_toStringTag = 1;
	var getBuiltIn = requireGetBuiltIn();
	var setToStringTag = requireSetToStringTag();

	var DOM_EXCEPTION = 'DOMException';

	// `DOMException.prototype[@@toStringTag]` property
	setToStringTag(getBuiltIn(DOM_EXCEPTION), DOM_EXCEPTION);
	return web_domException_toStringTag;
}

var web_immediate = {};

var web_clearImmediate = {};

var hasRequiredWeb_clearImmediate;

function requireWeb_clearImmediate () {
	if (hasRequiredWeb_clearImmediate) return web_clearImmediate;
	hasRequiredWeb_clearImmediate = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var clearImmediate = requireTask().clear;

	// `clearImmediate` method
	// http://w3c.github.io/setImmediate/#si-clearImmediate
	$({ global: true, bind: true, enumerable: true, forced: globalThis.clearImmediate !== clearImmediate }, {
	  clearImmediate: clearImmediate
	});
	return web_clearImmediate;
}

var web_setImmediate = {};

var schedulersFix;
var hasRequiredSchedulersFix;

function requireSchedulersFix () {
	if (hasRequiredSchedulersFix) return schedulersFix;
	hasRequiredSchedulersFix = 1;
	var globalThis = requireGlobalThis();
	var apply = requireFunctionApply();
	var isCallable = requireIsCallable();
	var ENVIRONMENT = requireEnvironment();
	var USER_AGENT = requireEnvironmentUserAgent();
	var arraySlice = requireArraySlice();
	var validateArgumentsLength = requireValidateArgumentsLength();

	var Function = globalThis.Function;
	// dirty IE9- and Bun 0.3.0- checks
	var WRAP = /MSIE .\./.test(USER_AGENT) || ENVIRONMENT === 'BUN' && (function () {
	  var version = globalThis.Bun.version.split('.');
	  return version.length < 3 || version[0] === '0' && (version[1] < 3 || version[1] === '3' && version[2] === '0');
	})();

	// IE9- / Bun 0.3.0- setTimeout / setInterval / setImmediate additional parameters fix
	// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
	// https://github.com/oven-sh/bun/issues/1633
	schedulersFix = function (scheduler, hasTimeArg) {
	  var firstParamIndex = hasTimeArg ? 2 : 1;
	  return WRAP ? function (handler, timeout /* , ...arguments */) {
	    var boundArgs = validateArgumentsLength(arguments.length, 1) > firstParamIndex;
	    var fn = isCallable(handler) ? handler : Function(handler);
	    var params = boundArgs ? arraySlice(arguments, firstParamIndex) : [];
	    var callback = boundArgs ? function () {
	      apply(fn, this, params);
	    } : fn;
	    return hasTimeArg ? scheduler(callback, timeout) : scheduler(callback);
	  } : scheduler;
	};
	return schedulersFix;
}

var hasRequiredWeb_setImmediate;

function requireWeb_setImmediate () {
	if (hasRequiredWeb_setImmediate) return web_setImmediate;
	hasRequiredWeb_setImmediate = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var setTask = requireTask().set;
	var schedulersFix = requireSchedulersFix();

	// https://github.com/oven-sh/bun/issues/1633
	var setImmediate = globalThis.setImmediate ? schedulersFix(setTask, false) : setTask;

	// `setImmediate` method
	// http://w3c.github.io/setImmediate/#si-setImmediate
	$({ global: true, bind: true, enumerable: true, forced: globalThis.setImmediate !== setImmediate }, {
	  setImmediate: setImmediate
	});
	return web_setImmediate;
}

var hasRequiredWeb_immediate;

function requireWeb_immediate () {
	if (hasRequiredWeb_immediate) return web_immediate;
	hasRequiredWeb_immediate = 1;
	// TODO: Remove this module from `core-js@4` since it's split to modules listed below
	requireWeb_clearImmediate();
	requireWeb_setImmediate();
	return web_immediate;
}

var web_queueMicrotask = {};

var hasRequiredWeb_queueMicrotask;

function requireWeb_queueMicrotask () {
	if (hasRequiredWeb_queueMicrotask) return web_queueMicrotask;
	hasRequiredWeb_queueMicrotask = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var microtask = requireMicrotask();
	var aCallable = requireACallable();
	var validateArgumentsLength = requireValidateArgumentsLength();
	var fails = requireFails();
	var DESCRIPTORS = requireDescriptors();

	// Bun ~ 1.0.30 bug
	// https://github.com/oven-sh/bun/issues/9249
	var WRONG_ARITY = fails(function () {
	  // getOwnPropertyDescriptor for prevent experimental warning in Node 11
	  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	  return DESCRIPTORS && Object.getOwnPropertyDescriptor(globalThis, 'queueMicrotask').value.length !== 1;
	});

	// `queueMicrotask` method
	// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask
	$({ global: true, enumerable: true, dontCallGetSet: true, forced: WRONG_ARITY }, {
	  queueMicrotask: function queueMicrotask(fn) {
	    validateArgumentsLength(arguments.length, 1);
	    microtask(aCallable(fn));
	  }
	});
	return web_queueMicrotask;
}

var web_self = {};

var hasRequiredWeb_self;

function requireWeb_self () {
	if (hasRequiredWeb_self) return web_self;
	hasRequiredWeb_self = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var DESCRIPTORS = requireDescriptors();

	var $TypeError = TypeError;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty = Object.defineProperty;
	var INCORRECT_VALUE = globalThis.self !== globalThis;

	// `self` getter
	// https://html.spec.whatwg.org/multipage/window-object.html#dom-self
	try {
	  if (DESCRIPTORS) {
	    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	    var descriptor = Object.getOwnPropertyDescriptor(globalThis, 'self');
	    // some engines have `self`, but with incorrect descriptor
	    // https://github.com/denoland/deno/issues/15765
	    if (INCORRECT_VALUE || !descriptor || !descriptor.get || !descriptor.enumerable) {
	      defineBuiltInAccessor(globalThis, 'self', {
	        get: function self() {
	          return globalThis;
	        },
	        set: function self(value) {
	          if (this !== globalThis) throw new $TypeError('Illegal invocation');
	          defineProperty(globalThis, 'self', {
	            value: value,
	            writable: true,
	            configurable: true,
	            enumerable: true
	          });
	        },
	        configurable: true,
	        enumerable: true
	      });
	    }
	  } else $({ global: true, simple: true, forced: INCORRECT_VALUE }, {
	    self: globalThis
	  });
	} catch (error) { /* empty */ }
	return web_self;
}

var web_structuredClone = {};

var hasRequiredWeb_structuredClone;

function requireWeb_structuredClone () {
	if (hasRequiredWeb_structuredClone) return web_structuredClone;
	hasRequiredWeb_structuredClone = 1;
	var IS_PURE = requireIsPure();
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var getBuiltIn = requireGetBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var fails = requireFails();
	var uid = requireUid();
	var isCallable = requireIsCallable();
	var isConstructor = requireIsConstructor();
	var isNullOrUndefined = requireIsNullOrUndefined();
	var isObject = requireIsObject();
	var isSymbol = requireIsSymbol();
	var iterate = requireIterate();
	var anObject = requireAnObject();
	var classof = requireClassof();
	var hasOwn = requireHasOwnProperty();
	var createProperty = requireCreateProperty();
	var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
	var lengthOfArrayLike = requireLengthOfArrayLike();
	var validateArgumentsLength = requireValidateArgumentsLength();
	var getRegExpFlags = requireRegexpGetFlags();
	var MapHelpers = requireMapHelpers();
	var SetHelpers = requireSetHelpers();
	var setIterate = requireSetIterate();
	var detachTransferable = requireDetachTransferable();
	var ERROR_STACK_INSTALLABLE = requireErrorStackInstallable();
	var PROPER_STRUCTURED_CLONE_TRANSFER = requireStructuredCloneProperTransfer();

	var Object = globalThis.Object;
	var Array = globalThis.Array;
	var Date = globalThis.Date;
	var Error = globalThis.Error;
	var TypeError = globalThis.TypeError;
	var PerformanceMark = globalThis.PerformanceMark;
	var DOMException = getBuiltIn('DOMException');
	var Map = MapHelpers.Map;
	var mapHas = MapHelpers.has;
	var mapGet = MapHelpers.get;
	var mapSet = MapHelpers.set;
	var Set = SetHelpers.Set;
	var setAdd = SetHelpers.add;
	var setHas = SetHelpers.has;
	var objectKeys = getBuiltIn('Object', 'keys');
	var push = uncurryThis([].push);
	var thisBooleanValue = uncurryThis(true.valueOf);
	var thisNumberValue = uncurryThis(1.0.valueOf);
	var thisStringValue = uncurryThis(''.valueOf);
	var thisTimeValue = uncurryThis(Date.prototype.getTime);
	var PERFORMANCE_MARK = uid('structuredClone');
	var DATA_CLONE_ERROR = 'DataCloneError';
	var TRANSFERRING = 'Transferring';

	var checkBasicSemantic = function (structuredCloneImplementation) {
	  return !fails(function () {
	    var set1 = new globalThis.Set([7]);
	    var set2 = structuredCloneImplementation(set1);
	    var number = structuredCloneImplementation(Object(7));
	    return set2 === set1 || !set2.has(7) || !isObject(number) || +number !== 7;
	  }) && structuredCloneImplementation;
	};

	var checkErrorsCloning = function (structuredCloneImplementation, $Error) {
	  return !fails(function () {
	    var error = new $Error();
	    var test = structuredCloneImplementation({ a: error, b: error });
	    return !(test && test.a === test.b && test.a instanceof $Error && test.a.stack === error.stack);
	  });
	};

	// https://github.com/whatwg/html/pull/5749
	var checkNewErrorsCloningSemantic = function (structuredCloneImplementation) {
	  return !fails(function () {
	    var test = structuredCloneImplementation(new globalThis.AggregateError([1], PERFORMANCE_MARK, { cause: 3 }));
	    return test.name !== 'AggregateError' || test.errors[0] !== 1 || test.message !== PERFORMANCE_MARK || test.cause !== 3;
	  });
	};

	// FF94+, Safari 15.4+, Chrome 98+, NodeJS 17.0+, Deno 1.13+
	// FF<103 and Safari implementations can't clone errors
	// https://bugzilla.mozilla.org/show_bug.cgi?id=1556604
	// FF103 can clone errors, but `.stack` of clone is an empty string
	// https://bugzilla.mozilla.org/show_bug.cgi?id=1778762
	// FF104+ fixed it on usual errors, but not on DOMExceptions
	// https://bugzilla.mozilla.org/show_bug.cgi?id=1777321
	// Chrome <102 returns `null` if cloned object contains multiple references to one error
	// https://bugs.chromium.org/p/v8/issues/detail?id=12542
	// NodeJS implementation can't clone DOMExceptions
	// https://github.com/nodejs/node/issues/41038
	// only FF103+ supports new (html/5749) error cloning semantic
	var nativeStructuredClone = globalThis.structuredClone;

	var FORCED_REPLACEMENT = IS_PURE
	  || !checkErrorsCloning(nativeStructuredClone, Error)
	  || !checkErrorsCloning(nativeStructuredClone, DOMException)
	  || !checkNewErrorsCloningSemantic(nativeStructuredClone);

	// Chrome 82+, Safari 14.1+, Deno 1.11+
	// Chrome 78-81 implementation swaps `.name` and `.message` of cloned `DOMException`
	// Chrome returns `null` if cloned object contains multiple references to one error
	// Safari 14.1 implementation doesn't clone some `RegExp` flags, so requires a workaround
	// Safari implementation can't clone errors
	// Deno 1.2-1.10 implementations too naive
	// NodeJS 16.0+ does not have `PerformanceMark` constructor
	// NodeJS <17.2 structured cloning implementation from `performance.mark` is too naive
	// and can't clone, for example, `RegExp` or some boxed primitives
	// https://github.com/nodejs/node/issues/40840
	// no one of those implementations supports new (html/5749) error cloning semantic
	var structuredCloneFromMark = !nativeStructuredClone && checkBasicSemantic(function (value) {
	  return new PerformanceMark(PERFORMANCE_MARK, { detail: value }).detail;
	});

	var nativeRestrictedStructuredClone = checkBasicSemantic(nativeStructuredClone) || structuredCloneFromMark;

	var throwUncloneable = function (type) {
	  throw new DOMException('Uncloneable type: ' + type, DATA_CLONE_ERROR);
	};

	var throwUnpolyfillable = function (type, action) {
	  throw new DOMException((action || 'Cloning') + ' of ' + type + ' cannot be properly polyfilled in this engine', DATA_CLONE_ERROR);
	};

	var tryNativeRestrictedStructuredClone = function (value, type) {
	  if (!nativeRestrictedStructuredClone) throwUnpolyfillable(type);
	  return nativeRestrictedStructuredClone(value);
	};

	var createDataTransfer = function () {
	  var dataTransfer;
	  try {
	    dataTransfer = new globalThis.DataTransfer();
	  } catch (error) {
	    try {
	      dataTransfer = new globalThis.ClipboardEvent('').clipboardData;
	    } catch (error2) { /* empty */ }
	  }
	  return dataTransfer && dataTransfer.items && dataTransfer.files ? dataTransfer : null;
	};

	var cloneBuffer = function (value, map, $type) {
	  if (mapHas(map, value)) return mapGet(map, value);

	  var type = $type || classof(value);
	  var clone, length, options, source, target, i;

	  if (type === 'SharedArrayBuffer') {
	    if (nativeRestrictedStructuredClone) clone = nativeRestrictedStructuredClone(value);
	    // SharedArrayBuffer should use shared memory, we can't polyfill it, so return the original
	    else clone = value;
	  } else {
	    var DataView = globalThis.DataView;

	    // `ArrayBuffer#slice` is not available in IE10
	    // `ArrayBuffer#slice` and `DataView` are not available in old FF
	    if (!DataView && !isCallable(value.slice)) throwUnpolyfillable('ArrayBuffer');
	    // detached buffers throws in `DataView` and `.slice`
	    try {
	      if (isCallable(value.slice) && !value.resizable) {
	        clone = value.slice(0);
	      } else {
	        length = value.byteLength;
	        options = 'maxByteLength' in value ? { maxByteLength: value.maxByteLength } : undefined;
	        // eslint-disable-next-line es/no-resizable-and-growable-arraybuffers -- safe
	        clone = new ArrayBuffer(length, options);
	        source = new DataView(value);
	        target = new DataView(clone);
	        for (i = 0; i < length; i++) {
	          target.setUint8(i, source.getUint8(i));
	        }
	      }
	    } catch (error) {
	      throw new DOMException('ArrayBuffer is detached', DATA_CLONE_ERROR);
	    }
	  }

	  mapSet(map, value, clone);

	  return clone;
	};

	var cloneView = function (value, type, offset, length, map) {
	  var C = globalThis[type];
	  // in some old engines like Safari 9, typeof C is 'object'
	  // on Uint8ClampedArray or some other constructors
	  if (!isObject(C)) throwUnpolyfillable(type);
	  return new C(cloneBuffer(value.buffer, map), offset, length);
	};

	var structuredCloneInternal = function (value, map) {
	  if (isSymbol(value)) throwUncloneable('Symbol');
	  if (!isObject(value)) return value;
	  // effectively preserves circular references
	  if (map) {
	    if (mapHas(map, value)) return mapGet(map, value);
	  } else map = new Map();

	  var type = classof(value);
	  var C, name, cloned, dataTransfer, i, length, keys, key;

	  switch (type) {
	    case 'Array':
	      cloned = Array(lengthOfArrayLike(value));
	      break;
	    case 'Object':
	      cloned = {};
	      break;
	    case 'Map':
	      cloned = new Map();
	      break;
	    case 'Set':
	      cloned = new Set();
	      break;
	    case 'RegExp':
	      // in this block because of a Safari 14.1 bug
	      // old FF does not clone regexes passed to the constructor, so get the source and flags directly
	      cloned = new RegExp(value.source, getRegExpFlags(value));
	      break;
	    case 'Error':
	      name = value.name;
	      switch (name) {
	        case 'AggregateError':
	          cloned = new (getBuiltIn(name))([]);
	          break;
	        case 'EvalError':
	        case 'RangeError':
	        case 'ReferenceError':
	        case 'SuppressedError':
	        case 'SyntaxError':
	        case 'TypeError':
	        case 'URIError':
	          cloned = new (getBuiltIn(name))();
	          break;
	        case 'CompileError':
	        case 'LinkError':
	        case 'RuntimeError':
	          cloned = new (getBuiltIn('WebAssembly', name))();
	          break;
	        default:
	          cloned = new Error();
	      }
	      break;
	    case 'DOMException':
	      cloned = new DOMException(value.message, value.name);
	      break;
	    case 'ArrayBuffer':
	    case 'SharedArrayBuffer':
	      cloned = cloneBuffer(value, map, type);
	      break;
	    case 'DataView':
	    case 'Int8Array':
	    case 'Uint8Array':
	    case 'Uint8ClampedArray':
	    case 'Int16Array':
	    case 'Uint16Array':
	    case 'Int32Array':
	    case 'Uint32Array':
	    case 'Float16Array':
	    case 'Float32Array':
	    case 'Float64Array':
	    case 'BigInt64Array':
	    case 'BigUint64Array':
	      length = type === 'DataView' ? value.byteLength : value.length;
	      cloned = cloneView(value, type, value.byteOffset, length, map);
	      break;
	    case 'DOMQuad':
	      try {
	        cloned = new DOMQuad(
	          structuredCloneInternal(value.p1, map),
	          structuredCloneInternal(value.p2, map),
	          structuredCloneInternal(value.p3, map),
	          structuredCloneInternal(value.p4, map)
	        );
	      } catch (error) {
	        cloned = tryNativeRestrictedStructuredClone(value, type);
	      }
	      break;
	    case 'File':
	      if (nativeRestrictedStructuredClone) try {
	        cloned = nativeRestrictedStructuredClone(value);
	        // NodeJS 20.0.0 bug, https://github.com/nodejs/node/issues/47612
	        if (classof(cloned) !== type) cloned = undefined;
	      } catch (error) { /* empty */ }
	      if (!cloned) try {
	        cloned = new File([value], value.name, value);
	      } catch (error) { /* empty */ }
	      if (!cloned) throwUnpolyfillable(type);
	      break;
	    case 'FileList':
	      dataTransfer = createDataTransfer();
	      if (dataTransfer) {
	        for (i = 0, length = lengthOfArrayLike(value); i < length; i++) {
	          dataTransfer.items.add(structuredCloneInternal(value[i], map));
	        }
	        cloned = dataTransfer.files;
	      } else cloned = tryNativeRestrictedStructuredClone(value, type);
	      break;
	    case 'ImageData':
	      // Safari 9 ImageData is a constructor, but typeof ImageData is 'object'
	      try {
	        cloned = new ImageData(
	          structuredCloneInternal(value.data, map),
	          value.width,
	          value.height,
	          { colorSpace: value.colorSpace }
	        );
	      } catch (error) {
	        cloned = tryNativeRestrictedStructuredClone(value, type);
	      } break;
	    default:
	      if (nativeRestrictedStructuredClone) {
	        cloned = nativeRestrictedStructuredClone(value);
	      } else switch (type) {
	        case 'BigInt':
	          // can be a 3rd party polyfill
	          cloned = Object(value.valueOf());
	          break;
	        case 'Boolean':
	          cloned = Object(thisBooleanValue(value));
	          break;
	        case 'Number':
	          cloned = Object(thisNumberValue(value));
	          break;
	        case 'String':
	          cloned = Object(thisStringValue(value));
	          break;
	        case 'Date':
	          cloned = new Date(thisTimeValue(value));
	          break;
	        case 'Blob':
	          try {
	            cloned = value.slice(0, value.size, value.type);
	          } catch (error) {
	            throwUnpolyfillable(type);
	          } break;
	        case 'DOMPoint':
	        case 'DOMPointReadOnly':
	          C = globalThis[type];
	          try {
	            cloned = C.fromPoint
	              ? C.fromPoint(value)
	              : new C(value.x, value.y, value.z, value.w);
	          } catch (error) {
	            throwUnpolyfillable(type);
	          } break;
	        case 'DOMRect':
	        case 'DOMRectReadOnly':
	          C = globalThis[type];
	          try {
	            cloned = C.fromRect
	              ? C.fromRect(value)
	              : new C(value.x, value.y, value.width, value.height);
	          } catch (error) {
	            throwUnpolyfillable(type);
	          } break;
	        case 'DOMMatrix':
	        case 'DOMMatrixReadOnly':
	          C = globalThis[type];
	          try {
	            cloned = C.fromMatrix
	              ? C.fromMatrix(value)
	              : new C(value);
	          } catch (error) {
	            throwUnpolyfillable(type);
	          } break;
	        case 'AudioData':
	        case 'VideoFrame':
	          if (!isCallable(value.clone)) throwUnpolyfillable(type);
	          try {
	            cloned = value.clone();
	          } catch (error) {
	            throwUncloneable(type);
	          } break;
	        case 'CropTarget':
	        case 'CryptoKey':
	        case 'FileSystemDirectoryHandle':
	        case 'FileSystemFileHandle':
	        case 'FileSystemHandle':
	        case 'GPUCompilationInfo':
	        case 'GPUCompilationMessage':
	        case 'ImageBitmap':
	        case 'RTCCertificate':
	        case 'WebAssembly.Module':
	          throwUnpolyfillable(type);
	          // break omitted
	        default:
	          throwUncloneable(type);
	      }
	  }

	  mapSet(map, value, cloned);

	  switch (type) {
	    case 'Array':
	    case 'Object':
	      keys = objectKeys(value);
	      for (i = 0, length = lengthOfArrayLike(keys); i < length; i++) {
	        key = keys[i];
	        createProperty(cloned, key, structuredCloneInternal(value[key], map));
	      } break;
	    case 'Map':
	      value.forEach(function (v, k) {
	        mapSet(cloned, structuredCloneInternal(k, map), structuredCloneInternal(v, map));
	      });
	      break;
	    case 'Set':
	      value.forEach(function (v) {
	        setAdd(cloned, structuredCloneInternal(v, map));
	      });
	      break;
	    case 'Error':
	      createNonEnumerableProperty(cloned, 'message', structuredCloneInternal(value.message, map));
	      if (hasOwn(value, 'cause')) {
	        createNonEnumerableProperty(cloned, 'cause', structuredCloneInternal(value.cause, map));
	      }
	      if (name === 'AggregateError') {
	        cloned.errors = structuredCloneInternal(value.errors, map);
	      } else if (name === 'SuppressedError') {
	        cloned.error = structuredCloneInternal(value.error, map);
	        cloned.suppressed = structuredCloneInternal(value.suppressed, map);
	      } // break omitted
	    case 'DOMException':
	      if (ERROR_STACK_INSTALLABLE) {
	        createNonEnumerableProperty(cloned, 'stack', structuredCloneInternal(value.stack, map));
	      }
	  }

	  return cloned;
	};

	var tryToTransfer = function (rawTransfer, map) {
	  if (!isObject(rawTransfer)) throw new TypeError('Transfer option cannot be converted to a sequence');

	  var transfer = [];

	  iterate(rawTransfer, function (value) {
	    push(transfer, anObject(value));
	  });

	  var i = 0;
	  var length = lengthOfArrayLike(transfer);
	  var buffers = new Set();
	  var value, type, C, transferred, canvas, context;

	  while (i < length) {
	    value = transfer[i++];

	    type = classof(value);

	    if (type === 'ArrayBuffer' ? setHas(buffers, value) : mapHas(map, value)) {
	      throw new DOMException('Duplicate transferable', DATA_CLONE_ERROR);
	    }

	    if (type === 'ArrayBuffer') {
	      setAdd(buffers, value);
	      continue;
	    }

	    if (PROPER_STRUCTURED_CLONE_TRANSFER) {
	      transferred = nativeStructuredClone(value, { transfer: [value] });
	    } else switch (type) {
	      case 'ImageBitmap':
	        C = globalThis.OffscreenCanvas;
	        if (!isConstructor(C)) throwUnpolyfillable(type, TRANSFERRING);
	        try {
	          canvas = new C(value.width, value.height);
	          context = canvas.getContext('bitmaprenderer');
	          context.transferFromImageBitmap(value);
	          transferred = canvas.transferToImageBitmap();
	        } catch (error) { /* empty */ }
	        break;
	      case 'AudioData':
	      case 'VideoFrame':
	        if (!isCallable(value.clone) || !isCallable(value.close)) throwUnpolyfillable(type, TRANSFERRING);
	        try {
	          transferred = value.clone();
	          value.close();
	        } catch (error) { /* empty */ }
	        break;
	      case 'MediaSourceHandle':
	      case 'MessagePort':
	      case 'OffscreenCanvas':
	      case 'ReadableStream':
	      case 'TransformStream':
	      case 'WritableStream':
	        throwUnpolyfillable(type, TRANSFERRING);
	    }

	    if (transferred === undefined) throw new DOMException('This object cannot be transferred: ' + type, DATA_CLONE_ERROR);

	    mapSet(map, value, transferred);
	  }

	  return buffers;
	};

	var detachBuffers = function (buffers) {
	  setIterate(buffers, function (buffer) {
	    if (PROPER_STRUCTURED_CLONE_TRANSFER) {
	      nativeRestrictedStructuredClone(buffer, { transfer: [buffer] });
	    } else if (isCallable(buffer.transfer)) {
	      buffer.transfer();
	    } else if (detachTransferable) {
	      detachTransferable(buffer);
	    } else {
	      throwUnpolyfillable('ArrayBuffer', TRANSFERRING);
	    }
	  });
	};

	// `structuredClone` method
	// https://html.spec.whatwg.org/multipage/structured-data.html#dom-structuredclone
	$({ global: true, enumerable: true, sham: !PROPER_STRUCTURED_CLONE_TRANSFER, forced: FORCED_REPLACEMENT }, {
	  structuredClone: function structuredClone(value /* , { transfer } */) {
	    var options = validateArgumentsLength(arguments.length, 1) > 1 && !isNullOrUndefined(arguments[1]) ? anObject(arguments[1]) : undefined;
	    var transfer = options ? options.transfer : undefined;
	    var map, buffers;

	    if (transfer !== undefined) {
	      map = new Map();
	      buffers = tryToTransfer(transfer, map);
	    }

	    var clone = structuredCloneInternal(value, map);

	    // since of an issue with cloning views of transferred buffers, we a forced to detach them later
	    // https://github.com/zloirock/core-js/issues/1265
	    if (buffers) detachBuffers(buffers);

	    return clone;
	  }
	});
	return web_structuredClone;
}

var web_timers = {};

var web_setInterval = {};

var hasRequiredWeb_setInterval;

function requireWeb_setInterval () {
	if (hasRequiredWeb_setInterval) return web_setInterval;
	hasRequiredWeb_setInterval = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var schedulersFix = requireSchedulersFix();

	var setInterval = schedulersFix(globalThis.setInterval, true);

	// Bun / IE9- setInterval additional parameters fix
	// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
	$({ global: true, bind: true, forced: globalThis.setInterval !== setInterval }, {
	  setInterval: setInterval
	});
	return web_setInterval;
}

var web_setTimeout = {};

var hasRequiredWeb_setTimeout;

function requireWeb_setTimeout () {
	if (hasRequiredWeb_setTimeout) return web_setTimeout;
	hasRequiredWeb_setTimeout = 1;
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var schedulersFix = requireSchedulersFix();

	var setTimeout = schedulersFix(globalThis.setTimeout, true);

	// Bun / IE9- setTimeout additional parameters fix
	// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
	$({ global: true, bind: true, forced: globalThis.setTimeout !== setTimeout }, {
	  setTimeout: setTimeout
	});
	return web_setTimeout;
}

var hasRequiredWeb_timers;

function requireWeb_timers () {
	if (hasRequiredWeb_timers) return web_timers;
	hasRequiredWeb_timers = 1;
	// TODO: Remove this module from `core-js@4` since it's split to modules listed below
	requireWeb_setInterval();
	requireWeb_setTimeout();
	return web_timers;
}

var web_url = {};

var web_url_constructor = {};

var urlConstructorDetection;
var hasRequiredUrlConstructorDetection;

function requireUrlConstructorDetection () {
	if (hasRequiredUrlConstructorDetection) return urlConstructorDetection;
	hasRequiredUrlConstructorDetection = 1;
	var fails = requireFails();
	var wellKnownSymbol = requireWellKnownSymbol();
	var DESCRIPTORS = requireDescriptors();
	var IS_PURE = requireIsPure();

	var ITERATOR = wellKnownSymbol('iterator');

	urlConstructorDetection = !fails(function () {
	  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
	  var url = new URL('b?a=1&b=2&c=3', 'https://a');
	  var params = url.searchParams;
	  var params2 = new URLSearchParams('a=1&a=2&b=3');
	  var result = '';
	  url.pathname = 'c%20d';
	  params.forEach(function (value, key) {
	    params['delete']('b');
	    result += key + value;
	  });
	  params2['delete']('a', 2);
	  // `undefined` case is a Chromium 117 bug
	  // https://bugs.chromium.org/p/v8/issues/detail?id=14222
	  params2['delete']('b', undefined);
	  return (IS_PURE && (!url.toJSON || !params2.has('a', 1) || params2.has('a', 2) || !params2.has('a', undefined) || params2.has('b')))
	    || (!params.size && (IS_PURE || !DESCRIPTORS))
	    || !params.sort
	    || url.href !== 'https://a/c%20d?a=1&c=3'
	    || params.get('c') !== '3'
	    || String(new URLSearchParams('?a=1')) !== 'a=1'
	    || !params[ITERATOR]
	    // throws in Edge
	    || new URL('https://a@b').username !== 'a'
	    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
	    // not punycoded in Edge
	    || new URL('https://тест').host !== 'xn--e1aybc'
	    // not escaped in Chrome 62-
	    || new URL('https://a#б').hash !== '#%D0%B1'
	    // fails in Chrome 66-
	    || result !== 'a1c3'
	    // throws in Safari
	    || new URL('https://x', undefined).host !== 'x';
	});
	return urlConstructorDetection;
}

var stringPunycodeToAscii;
var hasRequiredStringPunycodeToAscii;

function requireStringPunycodeToAscii () {
	if (hasRequiredStringPunycodeToAscii) return stringPunycodeToAscii;
	hasRequiredStringPunycodeToAscii = 1;
	// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
	var uncurryThis = requireFunctionUncurryThis();

	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'
	var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
	var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
	var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
	var baseMinusTMin = base - tMin;

	var $RangeError = RangeError;
	var exec = uncurryThis(regexSeparators.exec);
	var floor = Math.floor;
	var fromCharCode = String.fromCharCode;
	var charCodeAt = uncurryThis(''.charCodeAt);
	var join = uncurryThis([].join);
	var push = uncurryThis([].push);
	var replace = uncurryThis(''.replace);
	var split = uncurryThis(''.split);
	var toLowerCase = uncurryThis(''.toLowerCase);

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 */
	var ucs2decode = function (string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;
	  while (counter < length) {
	    var value = charCodeAt(string, counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // It's a high surrogate, and there is a next character.
	      var extra = charCodeAt(string, counter++);
	      if ((extra & 0xFC00) === 0xDC00) { // Low surrogate.
	        push(output, ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // It's an unmatched surrogate; only append this code unit, in case the
	        // next code unit is the high surrogate of a surrogate pair.
	        push(output, value);
	        counter--;
	      }
	    } else {
	      push(output, value);
	    }
	  }
	  return output;
	};

	/**
	 * Converts a digit/integer into a basic code point.
	 */
	var digitToBasic = function (digit) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26);
	};

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 */
	var adapt = function (delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor(delta / damp) : delta >> 1;
	  delta += floor(delta / numPoints);
	  while (delta > baseMinusTMin * tMax >> 1) {
	    delta = floor(delta / baseMinusTMin);
	    k += base;
	  }
	  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 */
	var encode = function (input) {
	  var output = [];

	  // Convert the input in UCS-2 to an array of Unicode code points.
	  input = ucs2decode(input);

	  // Cache the length.
	  var inputLength = input.length;

	  // Initialize the state.
	  var n = initialN;
	  var delta = 0;
	  var bias = initialBias;
	  var i, currentValue;

	  // Handle the basic code points.
	  for (i = 0; i < input.length; i++) {
	    currentValue = input[i];
	    if (currentValue < 0x80) {
	      push(output, fromCharCode(currentValue));
	    }
	  }

	  var basicLength = output.length; // number of basic code points.
	  var handledCPCount = basicLength; // number of code points that have been handled;

	  // Finish the basic string with a delimiter unless it's empty.
	  if (basicLength) {
	    push(output, delimiter);
	  }

	  // Main encoding loop:
	  while (handledCPCount < inputLength) {
	    // All non-basic code points < n have been handled already. Find the next larger one:
	    var m = maxInt;
	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }

	    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
	    var handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
	      throw new $RangeError(OVERFLOW_ERROR);
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue < n && ++delta > maxInt) {
	        throw new $RangeError(OVERFLOW_ERROR);
	      }
	      if (currentValue === n) {
	        // Represent delta as a generalized variable-length integer.
	        var q = delta;
	        var k = base;
	        while (true) {
	          var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
	          if (q < t) break;
	          var qMinusT = q - t;
	          var baseMinusT = base - t;
	          push(output, fromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
	          q = floor(qMinusT / baseMinusT);
	          k += base;
	        }

	        push(output, fromCharCode(digitToBasic(q)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
	        delta = 0;
	        handledCPCount++;
	      }
	    }

	    delta++;
	    n++;
	  }
	  return join(output, '');
	};

	stringPunycodeToAscii = function (input) {
	  var encoded = [];
	  var labels = split(replace(toLowerCase(input), regexSeparators, '\u002E'), '.');
	  var i, label;
	  for (i = 0; i < labels.length; i++) {
	    label = labels[i];
	    push(encoded, exec(regexNonASCII, label) ? 'xn--' + encode(label) : label);
	  }
	  return join(encoded, '.');
	};
	return stringPunycodeToAscii;
}

var web_urlSearchParams_constructor;
var hasRequiredWeb_urlSearchParams_constructor;

function requireWeb_urlSearchParams_constructor () {
	if (hasRequiredWeb_urlSearchParams_constructor) return web_urlSearchParams_constructor;
	hasRequiredWeb_urlSearchParams_constructor = 1;
	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
	requireEs_array_iterator();
	requireEs_string_fromCodePoint();
	var $ = require_export();
	var globalThis = requireGlobalThis();
	var safeGetBuiltIn = requireSafeGetBuiltIn();
	var getBuiltIn = requireGetBuiltIn();
	var call = requireFunctionCall();
	var uncurryThis = requireFunctionUncurryThis();
	var DESCRIPTORS = requireDescriptors();
	var USE_NATIVE_URL = requireUrlConstructorDetection();
	var defineBuiltIn = requireDefineBuiltIn();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var defineBuiltIns = requireDefineBuiltIns();
	var setToStringTag = requireSetToStringTag();
	var createIteratorConstructor = requireIteratorCreateConstructor();
	var InternalStateModule = requireInternalState();
	var anInstance = requireAnInstance();
	var isCallable = requireIsCallable();
	var hasOwn = requireHasOwnProperty();
	var bind = requireFunctionBindContext();
	var classof = requireClassof();
	var anObject = requireAnObject();
	var isObject = requireIsObject();
	var $toString = requireToString();
	var create = requireObjectCreate();
	var createPropertyDescriptor = requireCreatePropertyDescriptor();
	var getIterator = requireGetIterator();
	var getIteratorMethod = requireGetIteratorMethod();
	var createIterResultObject = requireCreateIterResultObject();
	var validateArgumentsLength = requireValidateArgumentsLength();
	var wellKnownSymbol = requireWellKnownSymbol();
	var arraySort = requireArraySort();

	var ITERATOR = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState = InternalStateModule.set;
	var getInternalParamsState = InternalStateModule.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = InternalStateModule.getterFor(URL_SEARCH_PARAMS_ITERATOR);

	var nativeFetch = safeGetBuiltIn('fetch');
	var NativeRequest = safeGetBuiltIn('Request');
	var Headers = safeGetBuiltIn('Headers');
	var RequestPrototype = NativeRequest && NativeRequest.prototype;
	var HeadersPrototype = Headers && Headers.prototype;
	var TypeError = globalThis.TypeError;
	var encodeURIComponent = globalThis.encodeURIComponent;
	var fromCharCode = String.fromCharCode;
	var fromCodePoint = getBuiltIn('String', 'fromCodePoint');
	var $parseInt = parseInt;
	var charAt = uncurryThis(''.charAt);
	var join = uncurryThis([].join);
	var push = uncurryThis([].push);
	var replace = uncurryThis(''.replace);
	var shift = uncurryThis([].shift);
	var splice = uncurryThis([].splice);
	var split = uncurryThis(''.split);
	var stringSlice = uncurryThis(''.slice);
	var exec = uncurryThis(/./.exec);

	var plus = /\+/g;
	var FALLBACK_REPLACER = '\uFFFD';
	var VALID_HEX = /^[0-9a-f]+$/i;

	var parseHexOctet = function (string, start) {
	  var substr = stringSlice(string, start, start + 2);
	  if (!exec(VALID_HEX, substr)) return NaN;

	  return $parseInt(substr, 16);
	};

	var getLeadingOnes = function (octet) {
	  var count = 0;
	  for (var mask = 0x80; mask > 0 && (octet & mask) !== 0; mask >>= 1) {
	    count++;
	  }
	  return count;
	};

	var utf8Decode = function (octets) {
	  var codePoint = null;

	  switch (octets.length) {
	    case 1:
	      codePoint = octets[0];
	      break;
	    case 2:
	      codePoint = (octets[0] & 0x1F) << 6 | (octets[1] & 0x3F);
	      break;
	    case 3:
	      codePoint = (octets[0] & 0x0F) << 12 | (octets[1] & 0x3F) << 6 | (octets[2] & 0x3F);
	      break;
	    case 4:
	      codePoint = (octets[0] & 0x07) << 18 | (octets[1] & 0x3F) << 12 | (octets[2] & 0x3F) << 6 | (octets[3] & 0x3F);
	      break;
	  }

	  return codePoint > 0x10FFFF ? null : codePoint;
	};

	var decode = function (input) {
	  input = replace(input, plus, ' ');
	  var length = input.length;
	  var result = '';
	  var i = 0;

	  while (i < length) {
	    var decodedChar = charAt(input, i);

	    if (decodedChar === '%') {
	      if (charAt(input, i + 1) === '%' || i + 3 > length) {
	        result += '%';
	        i++;
	        continue;
	      }

	      var octet = parseHexOctet(input, i + 1);

	      // eslint-disable-next-line no-self-compare -- NaN check
	      if (octet !== octet) {
	        result += decodedChar;
	        i++;
	        continue;
	      }

	      i += 2;
	      var byteSequenceLength = getLeadingOnes(octet);

	      if (byteSequenceLength === 0) {
	        decodedChar = fromCharCode(octet);
	      } else {
	        if (byteSequenceLength === 1 || byteSequenceLength > 4) {
	          result += FALLBACK_REPLACER;
	          i++;
	          continue;
	        }

	        var octets = [octet];
	        var sequenceIndex = 1;

	        while (sequenceIndex < byteSequenceLength) {
	          i++;
	          if (i + 3 > length || charAt(input, i) !== '%') break;

	          var nextByte = parseHexOctet(input, i + 1);

	          // eslint-disable-next-line no-self-compare -- NaN check
	          if (nextByte !== nextByte) {
	            i += 3;
	            break;
	          }
	          if (nextByte > 191 || nextByte < 128) break;

	          push(octets, nextByte);
	          i += 2;
	          sequenceIndex++;
	        }

	        if (octets.length !== byteSequenceLength) {
	          result += FALLBACK_REPLACER;
	          continue;
	        }

	        var codePoint = utf8Decode(octets);
	        if (codePoint === null) {
	          result += FALLBACK_REPLACER;
	        } else {
	          decodedChar = fromCodePoint(codePoint);
	        }
	      }
	    }

	    result += decodedChar;
	    i++;
	  }

	  return result;
	};

	var find = /[!'()~]|%20/g;

	var replacements = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};

	var replacer = function (match) {
	  return replacements[match];
	};

	var serialize = function (it) {
	  return replace(encodeURIComponent(it), find, replacer);
	};

	var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
	  setInternalState(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    target: getInternalParamsState(params).entries,
	    index: 0,
	    kind: kind
	  });
	}, URL_SEARCH_PARAMS, function next() {
	  var state = getInternalIteratorState(this);
	  var target = state.target;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = null;
	    return createIterResultObject(undefined, true);
	  }
	  var entry = target[index];
	  switch (state.kind) {
	    case 'keys': return createIterResultObject(entry.key, false);
	    case 'values': return createIterResultObject(entry.value, false);
	  } return createIterResultObject([entry.key, entry.value], false);
	}, true);

	var URLSearchParamsState = function (init) {
	  this.entries = [];
	  this.url = null;

	  if (init !== undefined) {
	    if (isObject(init)) this.parseObject(init);
	    else this.parseQuery(typeof init == 'string' ? charAt(init, 0) === '?' ? stringSlice(init, 1) : init : $toString(init));
	  }
	};

	URLSearchParamsState.prototype = {
	  type: URL_SEARCH_PARAMS,
	  bindURL: function (url) {
	    this.url = url;
	    this.update();
	  },
	  parseObject: function (object) {
	    var entries = this.entries;
	    var iteratorMethod = getIteratorMethod(object);
	    var iterator, next, step, entryIterator, entryNext, first, second;

	    if (iteratorMethod) {
	      iterator = getIterator(object, iteratorMethod);
	      next = iterator.next;
	      while (!(step = call(next, iterator)).done) {
	        entryIterator = getIterator(anObject(step.value));
	        entryNext = entryIterator.next;
	        if (
	          (first = call(entryNext, entryIterator)).done ||
	          (second = call(entryNext, entryIterator)).done ||
	          !call(entryNext, entryIterator).done
	        ) throw new TypeError('Expected sequence with length 2');
	        push(entries, { key: $toString(first.value), value: $toString(second.value) });
	      }
	    } else for (var key in object) if (hasOwn(object, key)) {
	      push(entries, { key: key, value: $toString(object[key]) });
	    }
	  },
	  parseQuery: function (query) {
	    if (query) {
	      var entries = this.entries;
	      var attributes = split(query, '&');
	      var index = 0;
	      var attribute, entry;
	      while (index < attributes.length) {
	        attribute = attributes[index++];
	        if (attribute.length) {
	          entry = split(attribute, '=');
	          push(entries, {
	            key: decode(shift(entry)),
	            value: decode(join(entry, '='))
	          });
	        }
	      }
	    }
	  },
	  serialize: function () {
	    var entries = this.entries;
	    var result = [];
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      push(result, serialize(entry.key) + '=' + serialize(entry.value));
	    } return join(result, '&');
	  },
	  update: function () {
	    this.entries.length = 0;
	    this.parseQuery(this.url.query);
	  },
	  updateURL: function () {
	    if (this.url) this.url.update();
	  }
	};

	// `URLSearchParams` constructor
	// https://url.spec.whatwg.org/#interface-urlsearchparams
	var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
	  anInstance(this, URLSearchParamsPrototype);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var state = setInternalState(this, new URLSearchParamsState(init));
	  if (!DESCRIPTORS) this.size = state.entries.length;
	};

	var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

	defineBuiltIns(URLSearchParamsPrototype, {
	  // `URLSearchParams.prototype.append` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
	  append: function append(name, value) {
	    var state = getInternalParamsState(this);
	    validateArgumentsLength(arguments.length, 2);
	    push(state.entries, { key: $toString(name), value: $toString(value) });
	    if (!DESCRIPTORS) this.length++;
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.delete` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
	  'delete': function (name /* , value */) {
	    var state = getInternalParamsState(this);
	    var length = validateArgumentsLength(arguments.length, 1);
	    var entries = state.entries;
	    var key = $toString(name);
	    var $value = length < 2 ? undefined : arguments[1];
	    var value = $value === undefined ? $value : $toString($value);
	    var index = 0;
	    while (index < entries.length) {
	      var entry = entries[index];
	      if (entry.key === key && (value === undefined || entry.value === value)) {
	        splice(entries, index, 1);
	        if (value !== undefined) break;
	      } else index++;
	    }
	    if (!DESCRIPTORS) this.size = entries.length;
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.get` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
	  get: function get(name) {
	    var entries = getInternalParamsState(this).entries;
	    validateArgumentsLength(arguments.length, 1);
	    var key = $toString(name);
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) return entries[index].value;
	    }
	    return null;
	  },
	  // `URLSearchParams.prototype.getAll` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
	  getAll: function getAll(name) {
	    var entries = getInternalParamsState(this).entries;
	    validateArgumentsLength(arguments.length, 1);
	    var key = $toString(name);
	    var result = [];
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) push(result, entries[index].value);
	    }
	    return result;
	  },
	  // `URLSearchParams.prototype.has` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
	  has: function has(name /* , value */) {
	    var entries = getInternalParamsState(this).entries;
	    var length = validateArgumentsLength(arguments.length, 1);
	    var key = $toString(name);
	    var $value = length < 2 ? undefined : arguments[1];
	    var value = $value === undefined ? $value : $toString($value);
	    var index = 0;
	    while (index < entries.length) {
	      var entry = entries[index++];
	      if (entry.key === key && (value === undefined || entry.value === value)) return true;
	    }
	    return false;
	  },
	  // `URLSearchParams.prototype.set` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
	  set: function set(name, value) {
	    var state = getInternalParamsState(this);
	    validateArgumentsLength(arguments.length, 1);
	    var entries = state.entries;
	    var found = false;
	    var key = $toString(name);
	    var val = $toString(value);
	    var index = 0;
	    var entry;
	    for (; index < entries.length; index++) {
	      entry = entries[index];
	      if (entry.key === key) {
	        if (found) splice(entries, index--, 1);
	        else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }
	    if (!found) push(entries, { key: key, value: val });
	    if (!DESCRIPTORS) this.size = entries.length;
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.sort` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    arraySort(state.entries, function (a, b) {
	      return a.key > b.key ? 1 : -1;
	    });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.forEach` method
	  forEach: function forEach(callback /* , thisArg */) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = bind(callback, arguments.length > 1 ? arguments[1] : undefined);
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  // `URLSearchParams.prototype.keys` method
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  // `URLSearchParams.prototype.values` method
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  // `URLSearchParams.prototype.entries` method
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, { enumerable: true });

	// `URLSearchParams.prototype[@@iterator]` method
	defineBuiltIn(URLSearchParamsPrototype, ITERATOR, URLSearchParamsPrototype.entries, { name: 'entries' });

	// `URLSearchParams.prototype.toString` method
	// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
	defineBuiltIn(URLSearchParamsPrototype, 'toString', function toString() {
	  return getInternalParamsState(this).serialize();
	}, { enumerable: true });

	// `URLSearchParams.prototype.size` getter
	// https://github.com/whatwg/url/pull/734
	if (DESCRIPTORS) defineBuiltInAccessor(URLSearchParamsPrototype, 'size', {
	  get: function size() {
	    return getInternalParamsState(this).entries.length;
	  },
	  configurable: true,
	  enumerable: true
	});

	setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

	$({ global: true, constructor: true, forced: !USE_NATIVE_URL }, {
	  URLSearchParams: URLSearchParamsConstructor
	});

	// Wrap `fetch` and `Request` for correct work with polyfilled `URLSearchParams`
	if (!USE_NATIVE_URL && isCallable(Headers)) {
	  var headersHas = uncurryThis(HeadersPrototype.has);
	  var headersSet = uncurryThis(HeadersPrototype.set);

	  var wrapRequestOptions = function (init) {
	    if (isObject(init)) {
	      var body = init.body;
	      var headers;
	      if (classof(body) === URL_SEARCH_PARAMS) {
	        headers = init.headers ? new Headers(init.headers) : new Headers();
	        if (!headersHas(headers, 'content-type')) {
	          headersSet(headers, 'content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	        }
	        return create(init, {
	          body: createPropertyDescriptor(0, $toString(body)),
	          headers: createPropertyDescriptor(0, headers)
	        });
	      }
	    } return init;
	  };

	  if (isCallable(nativeFetch)) {
	    $({ global: true, enumerable: true, dontCallGetSet: true, forced: true }, {
	      fetch: function fetch(input /* , init */) {
	        return nativeFetch(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
	      }
	    });
	  }

	  if (isCallable(NativeRequest)) {
	    var RequestConstructor = function Request(input /* , init */) {
	      anInstance(this, RequestPrototype);
	      return new NativeRequest(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
	    };

	    RequestPrototype.constructor = RequestConstructor;
	    RequestConstructor.prototype = RequestPrototype;

	    $({ global: true, constructor: true, dontCallGetSet: true, forced: true }, {
	      Request: RequestConstructor
	    });
	  }
	}

	web_urlSearchParams_constructor = {
	  URLSearchParams: URLSearchParamsConstructor,
	  getState: getInternalParamsState
	};
	return web_urlSearchParams_constructor;
}

var hasRequiredWeb_url_constructor;

function requireWeb_url_constructor () {
	if (hasRequiredWeb_url_constructor) return web_url_constructor;
	hasRequiredWeb_url_constructor = 1;
	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
	requireEs_string_iterator();
	var $ = require_export();
	var DESCRIPTORS = requireDescriptors();
	var USE_NATIVE_URL = requireUrlConstructorDetection();
	var globalThis = requireGlobalThis();
	var bind = requireFunctionBindContext();
	var uncurryThis = requireFunctionUncurryThis();
	var defineBuiltIn = requireDefineBuiltIn();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();
	var anInstance = requireAnInstance();
	var hasOwn = requireHasOwnProperty();
	var assign = requireObjectAssign();
	var arrayFrom = requireArrayFrom();
	var arraySlice = requireArraySlice();
	var codeAt = requireStringMultibyte().codeAt;
	var toASCII = requireStringPunycodeToAscii();
	var $toString = requireToString();
	var setToStringTag = requireSetToStringTag();
	var validateArgumentsLength = requireValidateArgumentsLength();
	var URLSearchParamsModule = requireWeb_urlSearchParams_constructor();
	var InternalStateModule = requireInternalState();

	var setInternalState = InternalStateModule.set;
	var getInternalURLState = InternalStateModule.getterFor('URL');
	var URLSearchParams = URLSearchParamsModule.URLSearchParams;
	var getInternalSearchParamsState = URLSearchParamsModule.getState;

	var NativeURL = globalThis.URL;
	var TypeError = globalThis.TypeError;
	var parseInt = globalThis.parseInt;
	var floor = Math.floor;
	var pow = Math.pow;
	var charAt = uncurryThis(''.charAt);
	var exec = uncurryThis(/./.exec);
	var join = uncurryThis([].join);
	var numberToString = uncurryThis(1.0.toString);
	var pop = uncurryThis([].pop);
	var push = uncurryThis([].push);
	var replace = uncurryThis(''.replace);
	var shift = uncurryThis([].shift);
	var split = uncurryThis(''.split);
	var stringSlice = uncurryThis(''.slice);
	var toLowerCase = uncurryThis(''.toLowerCase);
	var unshift = uncurryThis([].unshift);

	var INVALID_AUTHORITY = 'Invalid authority';
	var INVALID_SCHEME = 'Invalid scheme';
	var INVALID_HOST = 'Invalid host';
	var INVALID_PORT = 'Invalid port';

	var ALPHA = /[a-z]/i;
	// eslint-disable-next-line regexp/no-obscure-range -- safe
	var ALPHANUMERIC = /[\d+-.a-z]/i;
	var DIGIT = /\d/;
	var HEX_START = /^0x/i;
	var OCT = /^[0-7]+$/;
	var DEC = /^\d+$/;
	var HEX = /^[\da-f]+$/i;
	/* eslint-disable regexp/no-control-character -- safe */
	var FORBIDDEN_HOST_CODE_POINT = /[\0\t\n\r #%/:<>?@[\\\]^|]/;
	var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\0\t\n\r #/:<>?@[\\\]^|]/;
	var LEADING_C0_CONTROL_OR_SPACE = /^[\u0000-\u0020]+/;
	var TRAILING_C0_CONTROL_OR_SPACE = /(^|[^\u0000-\u0020])[\u0000-\u0020]+$/;
	var TAB_AND_NEW_LINE = /[\t\n\r]/g;
	/* eslint-enable regexp/no-control-character -- safe */
	var EOF;

	// https://url.spec.whatwg.org/#ipv4-number-parser
	var parseIPv4 = function (input) {
	  var parts = split(input, '.');
	  var partsLength, numbers, index, part, radix, number, ipv4;
	  if (parts.length && parts[parts.length - 1] === '') {
	    parts.length--;
	  }
	  partsLength = parts.length;
	  if (partsLength > 4) return input;
	  numbers = [];
	  for (index = 0; index < partsLength; index++) {
	    part = parts[index];
	    if (part === '') return input;
	    radix = 10;
	    if (part.length > 1 && charAt(part, 0) === '0') {
	      radix = exec(HEX_START, part) ? 16 : 8;
	      part = stringSlice(part, radix === 8 ? 1 : 2);
	    }
	    if (part === '') {
	      number = 0;
	    } else {
	      if (!exec(radix === 10 ? DEC : radix === 8 ? OCT : HEX, part)) return input;
	      number = parseInt(part, radix);
	    }
	    push(numbers, number);
	  }
	  for (index = 0; index < partsLength; index++) {
	    number = numbers[index];
	    if (index === partsLength - 1) {
	      if (number >= pow(256, 5 - partsLength)) return null;
	    } else if (number > 255) return null;
	  }
	  ipv4 = pop(numbers);
	  for (index = 0; index < numbers.length; index++) {
	    ipv4 += numbers[index] * pow(256, 3 - index);
	  }
	  return ipv4;
	};

	// https://url.spec.whatwg.org/#concept-ipv6-parser
	// eslint-disable-next-line max-statements -- TODO
	var parseIPv6 = function (input) {
	  var address = [0, 0, 0, 0, 0, 0, 0, 0];
	  var pieceIndex = 0;
	  var compress = null;
	  var pointer = 0;
	  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

	  var chr = function () {
	    return charAt(input, pointer);
	  };

	  if (chr() === ':') {
	    if (charAt(input, 1) !== ':') return;
	    pointer += 2;
	    pieceIndex++;
	    compress = pieceIndex;
	  }
	  while (chr()) {
	    if (pieceIndex === 8) return;
	    if (chr() === ':') {
	      if (compress !== null) return;
	      pointer++;
	      pieceIndex++;
	      compress = pieceIndex;
	      continue;
	    }
	    value = length = 0;
	    while (length < 4 && exec(HEX, chr())) {
	      value = value * 16 + parseInt(chr(), 16);
	      pointer++;
	      length++;
	    }
	    if (chr() === '.') {
	      if (length === 0) return;
	      pointer -= length;
	      if (pieceIndex > 6) return;
	      numbersSeen = 0;
	      while (chr()) {
	        ipv4Piece = null;
	        if (numbersSeen > 0) {
	          if (chr() === '.' && numbersSeen < 4) pointer++;
	          else return;
	        }
	        if (!exec(DIGIT, chr())) return;
	        while (exec(DIGIT, chr())) {
	          number = parseInt(chr(), 10);
	          if (ipv4Piece === null) ipv4Piece = number;
	          else if (ipv4Piece === 0) return;
	          else ipv4Piece = ipv4Piece * 10 + number;
	          if (ipv4Piece > 255) return;
	          pointer++;
	        }
	        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
	        numbersSeen++;
	        if (numbersSeen === 2 || numbersSeen === 4) pieceIndex++;
	      }
	      if (numbersSeen !== 4) return;
	      break;
	    } else if (chr() === ':') {
	      pointer++;
	      if (!chr()) return;
	    } else if (chr()) return;
	    address[pieceIndex++] = value;
	  }
	  if (compress !== null) {
	    swaps = pieceIndex - compress;
	    pieceIndex = 7;
	    while (pieceIndex !== 0 && swaps > 0) {
	      swap = address[pieceIndex];
	      address[pieceIndex--] = address[compress + swaps - 1];
	      address[compress + --swaps] = swap;
	    }
	  } else if (pieceIndex !== 8) return;
	  return address;
	};

	var findLongestZeroSequence = function (ipv6) {
	  var maxIndex = null;
	  var maxLength = 1;
	  var currStart = null;
	  var currLength = 0;
	  var index = 0;
	  for (; index < 8; index++) {
	    if (ipv6[index] !== 0) {
	      if (currLength > maxLength) {
	        maxIndex = currStart;
	        maxLength = currLength;
	      }
	      currStart = null;
	      currLength = 0;
	    } else {
	      if (currStart === null) currStart = index;
	      ++currLength;
	    }
	  }
	  return currLength > maxLength ? currStart : maxIndex;
	};

	// https://url.spec.whatwg.org/#host-serializing
	var serializeHost = function (host) {
	  var result, index, compress, ignore0;

	  // ipv4
	  if (typeof host == 'number') {
	    result = [];
	    for (index = 0; index < 4; index++) {
	      unshift(result, host % 256);
	      host = floor(host / 256);
	    }
	    return join(result, '.');
	  }

	  // ipv6
	  if (typeof host == 'object') {
	    result = '';
	    compress = findLongestZeroSequence(host);
	    for (index = 0; index < 8; index++) {
	      if (ignore0 && host[index] === 0) continue;
	      if (ignore0) ignore0 = false;
	      if (compress === index) {
	        result += index ? ':' : '::';
	        ignore0 = true;
	      } else {
	        result += numberToString(host[index], 16);
	        if (index < 7) result += ':';
	      }
	    }
	    return '[' + result + ']';
	  }

	  return host;
	};

	var C0ControlPercentEncodeSet = {};
	var fragmentPercentEncodeSet = assign({}, C0ControlPercentEncodeSet, {
	  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
	});
	var pathPercentEncodeSet = assign({}, fragmentPercentEncodeSet, {
	  '#': 1, '?': 1, '{': 1, '}': 1
	});
	var userinfoPercentEncodeSet = assign({}, pathPercentEncodeSet, {
	  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
	});

	var percentEncode = function (chr, set) {
	  var code = codeAt(chr, 0);
	  return code > 0x20 && code < 0x7F && !hasOwn(set, chr) ? chr : encodeURIComponent(chr);
	};

	// https://url.spec.whatwg.org/#special-scheme
	var specialSchemes = {
	  ftp: 21,
	  file: null,
	  http: 80,
	  https: 443,
	  ws: 80,
	  wss: 443
	};

	// https://url.spec.whatwg.org/#windows-drive-letter
	var isWindowsDriveLetter = function (string, normalized) {
	  var second;
	  return string.length === 2 && exec(ALPHA, charAt(string, 0))
	    && ((second = charAt(string, 1)) === ':' || (!normalized && second === '|'));
	};

	// https://url.spec.whatwg.org/#start-with-a-windows-drive-letter
	var startsWithWindowsDriveLetter = function (string) {
	  var third;
	  return string.length > 1 && isWindowsDriveLetter(stringSlice(string, 0, 2)) && (
	    string.length === 2 ||
	    ((third = charAt(string, 2)) === '/' || third === '\\' || third === '?' || third === '#')
	  );
	};

	// https://url.spec.whatwg.org/#single-dot-path-segment
	var isSingleDot = function (segment) {
	  return segment === '.' || toLowerCase(segment) === '%2e';
	};

	// https://url.spec.whatwg.org/#double-dot-path-segment
	var isDoubleDot = function (segment) {
	  segment = toLowerCase(segment);
	  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
	};

	// States:
	var SCHEME_START = {};
	var SCHEME = {};
	var NO_SCHEME = {};
	var SPECIAL_RELATIVE_OR_AUTHORITY = {};
	var PATH_OR_AUTHORITY = {};
	var RELATIVE = {};
	var RELATIVE_SLASH = {};
	var SPECIAL_AUTHORITY_SLASHES = {};
	var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
	var AUTHORITY = {};
	var HOST = {};
	var HOSTNAME = {};
	var PORT = {};
	var FILE = {};
	var FILE_SLASH = {};
	var FILE_HOST = {};
	var PATH_START = {};
	var PATH = {};
	var CANNOT_BE_A_BASE_URL_PATH = {};
	var QUERY = {};
	var FRAGMENT = {};

	var URLState = function (url, isBase, base) {
	  var urlString = $toString(url);
	  var baseState, failure, searchParams;
	  if (isBase) {
	    failure = this.parse(urlString);
	    if (failure) throw new TypeError(failure);
	    this.searchParams = null;
	  } else {
	    if (base !== undefined) baseState = new URLState(base, true);
	    failure = this.parse(urlString, null, baseState);
	    if (failure) throw new TypeError(failure);
	    searchParams = getInternalSearchParamsState(new URLSearchParams());
	    searchParams.bindURL(this);
	    this.searchParams = searchParams;
	  }
	};

	URLState.prototype = {
	  type: 'URL',
	  // https://url.spec.whatwg.org/#url-parsing
	  // eslint-disable-next-line max-statements -- TODO
	  parse: function (input, stateOverride, base) {
	    var url = this;
	    var state = stateOverride || SCHEME_START;
	    var pointer = 0;
	    var buffer = '';
	    var seenAt = false;
	    var seenBracket = false;
	    var seenPasswordToken = false;
	    var codePoints, chr, bufferCodePoints, failure;

	    input = $toString(input);

	    if (!stateOverride) {
	      url.scheme = '';
	      url.username = '';
	      url.password = '';
	      url.host = null;
	      url.port = null;
	      url.path = [];
	      url.query = null;
	      url.fragment = null;
	      url.cannotBeABaseURL = false;
	      input = replace(input, LEADING_C0_CONTROL_OR_SPACE, '');
	      input = replace(input, TRAILING_C0_CONTROL_OR_SPACE, '$1');
	    }

	    input = replace(input, TAB_AND_NEW_LINE, '');

	    codePoints = arrayFrom(input);

	    while (pointer <= codePoints.length) {
	      chr = codePoints[pointer];
	      switch (state) {
	        case SCHEME_START:
	          if (chr && exec(ALPHA, chr)) {
	            buffer += toLowerCase(chr);
	            state = SCHEME;
	          } else if (!stateOverride) {
	            state = NO_SCHEME;
	            continue;
	          } else return INVALID_SCHEME;
	          break;

	        case SCHEME:
	          if (chr && (exec(ALPHANUMERIC, chr) || chr === '+' || chr === '-' || chr === '.')) {
	            buffer += toLowerCase(chr);
	          } else if (chr === ':') {
	            if (stateOverride && (
	              (url.isSpecial() !== hasOwn(specialSchemes, buffer)) ||
	              (buffer === 'file' && (url.includesCredentials() || url.port !== null)) ||
	              (url.scheme === 'file' && !url.host)
	            )) return;
	            url.scheme = buffer;
	            if (stateOverride) {
	              if (url.isSpecial() && specialSchemes[url.scheme] === url.port) url.port = null;
	              return;
	            }
	            buffer = '';
	            if (url.scheme === 'file') {
	              state = FILE;
	            } else if (url.isSpecial() && base && base.scheme === url.scheme) {
	              state = SPECIAL_RELATIVE_OR_AUTHORITY;
	            } else if (url.isSpecial()) {
	              state = SPECIAL_AUTHORITY_SLASHES;
	            } else if (codePoints[pointer + 1] === '/') {
	              state = PATH_OR_AUTHORITY;
	              pointer++;
	            } else {
	              url.cannotBeABaseURL = true;
	              push(url.path, '');
	              state = CANNOT_BE_A_BASE_URL_PATH;
	            }
	          } else if (!stateOverride) {
	            buffer = '';
	            state = NO_SCHEME;
	            pointer = 0;
	            continue;
	          } else return INVALID_SCHEME;
	          break;

	        case NO_SCHEME:
	          if (!base || (base.cannotBeABaseURL && chr !== '#')) return INVALID_SCHEME;
	          if (base.cannotBeABaseURL && chr === '#') {
	            url.scheme = base.scheme;
	            url.path = arraySlice(base.path);
	            url.query = base.query;
	            url.fragment = '';
	            url.cannotBeABaseURL = true;
	            state = FRAGMENT;
	            break;
	          }
	          state = base.scheme === 'file' ? FILE : RELATIVE;
	          continue;

	        case SPECIAL_RELATIVE_OR_AUTHORITY:
	          if (chr === '/' && codePoints[pointer + 1] === '/') {
	            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	            pointer++;
	          } else {
	            state = RELATIVE;
	            continue;
	          } break;

	        case PATH_OR_AUTHORITY:
	          if (chr === '/') {
	            state = AUTHORITY;
	            break;
	          } else {
	            state = PATH;
	            continue;
	          }

	        case RELATIVE:
	          url.scheme = base.scheme;
	          if (chr === EOF) {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.query = base.query;
	          } else if (chr === '/' || (chr === '\\' && url.isSpecial())) {
	            state = RELATIVE_SLASH;
	          } else if (chr === '?') {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.query = '';
	            state = QUERY;
	          } else if (chr === '#') {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.query = base.query;
	            url.fragment = '';
	            state = FRAGMENT;
	          } else {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.path.length--;
	            state = PATH;
	            continue;
	          } break;

	        case RELATIVE_SLASH:
	          if (url.isSpecial() && (chr === '/' || chr === '\\')) {
	            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          } else if (chr === '/') {
	            state = AUTHORITY;
	          } else {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            state = PATH;
	            continue;
	          } break;

	        case SPECIAL_AUTHORITY_SLASHES:
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          if (chr !== '/' || charAt(buffer, pointer + 1) !== '/') continue;
	          pointer++;
	          break;

	        case SPECIAL_AUTHORITY_IGNORE_SLASHES:
	          if (chr !== '/' && chr !== '\\') {
	            state = AUTHORITY;
	            continue;
	          } break;

	        case AUTHORITY:
	          if (chr === '@') {
	            if (seenAt) buffer = '%40' + buffer;
	            seenAt = true;
	            bufferCodePoints = arrayFrom(buffer);
	            for (var i = 0; i < bufferCodePoints.length; i++) {
	              var codePoint = bufferCodePoints[i];
	              if (codePoint === ':' && !seenPasswordToken) {
	                seenPasswordToken = true;
	                continue;
	              }
	              var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
	              if (seenPasswordToken) url.password += encodedCodePoints;
	              else url.username += encodedCodePoints;
	            }
	            buffer = '';
	          } else if (
	            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
	            (chr === '\\' && url.isSpecial())
	          ) {
	            if (seenAt && buffer === '') return INVALID_AUTHORITY;
	            pointer -= arrayFrom(buffer).length + 1;
	            buffer = '';
	            state = HOST;
	          } else buffer += chr;
	          break;

	        case HOST:
	        case HOSTNAME:
	          if (stateOverride && url.scheme === 'file') {
	            state = FILE_HOST;
	            continue;
	          } else if (chr === ':' && !seenBracket) {
	            if (buffer === '') return INVALID_HOST;
	            failure = url.parseHost(buffer);
	            if (failure) return failure;
	            buffer = '';
	            state = PORT;
	            if (stateOverride === HOSTNAME) return;
	          } else if (
	            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
	            (chr === '\\' && url.isSpecial())
	          ) {
	            if (url.isSpecial() && buffer === '') return INVALID_HOST;
	            if (stateOverride && buffer === '' && (url.includesCredentials() || url.port !== null)) return;
	            failure = url.parseHost(buffer);
	            if (failure) return failure;
	            buffer = '';
	            state = PATH_START;
	            if (stateOverride) return;
	            continue;
	          } else {
	            if (chr === '[') seenBracket = true;
	            else if (chr === ']') seenBracket = false;
	            buffer += chr;
	          } break;

	        case PORT:
	          if (exec(DIGIT, chr)) {
	            buffer += chr;
	          } else if (
	            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
	            (chr === '\\' && url.isSpecial()) ||
	            stateOverride
	          ) {
	            if (buffer !== '') {
	              var port = parseInt(buffer, 10);
	              if (port > 0xFFFF) return INVALID_PORT;
	              url.port = (url.isSpecial() && port === specialSchemes[url.scheme]) ? null : port;
	              buffer = '';
	            }
	            if (stateOverride) return;
	            state = PATH_START;
	            continue;
	          } else return INVALID_PORT;
	          break;

	        case FILE:
	          url.scheme = 'file';
	          if (chr === '/' || chr === '\\') state = FILE_SLASH;
	          else if (base && base.scheme === 'file') {
	            switch (chr) {
	              case EOF:
	                url.host = base.host;
	                url.path = arraySlice(base.path);
	                url.query = base.query;
	                break;
	              case '?':
	                url.host = base.host;
	                url.path = arraySlice(base.path);
	                url.query = '';
	                state = QUERY;
	                break;
	              case '#':
	                url.host = base.host;
	                url.path = arraySlice(base.path);
	                url.query = base.query;
	                url.fragment = '';
	                state = FRAGMENT;
	                break;
	              default:
	                if (!startsWithWindowsDriveLetter(join(arraySlice(codePoints, pointer), ''))) {
	                  url.host = base.host;
	                  url.path = arraySlice(base.path);
	                  url.shortenPath();
	                }
	                state = PATH;
	                continue;
	            }
	          } else {
	            state = PATH;
	            continue;
	          } break;

	        case FILE_SLASH:
	          if (chr === '/' || chr === '\\') {
	            state = FILE_HOST;
	            break;
	          }
	          if (base && base.scheme === 'file' && !startsWithWindowsDriveLetter(join(arraySlice(codePoints, pointer), ''))) {
	            if (isWindowsDriveLetter(base.path[0], true)) push(url.path, base.path[0]);
	            else url.host = base.host;
	          }
	          state = PATH;
	          continue;

	        case FILE_HOST:
	          if (chr === EOF || chr === '/' || chr === '\\' || chr === '?' || chr === '#') {
	            if (!stateOverride && isWindowsDriveLetter(buffer)) {
	              state = PATH;
	            } else if (buffer === '') {
	              url.host = '';
	              if (stateOverride) return;
	              state = PATH_START;
	            } else {
	              failure = url.parseHost(buffer);
	              if (failure) return failure;
	              if (url.host === 'localhost') url.host = '';
	              if (stateOverride) return;
	              buffer = '';
	              state = PATH_START;
	            } continue;
	          } else buffer += chr;
	          break;

	        case PATH_START:
	          if (url.isSpecial()) {
	            state = PATH;
	            if (chr !== '/' && chr !== '\\') continue;
	          } else if (!stateOverride && chr === '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (!stateOverride && chr === '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          } else if (chr !== EOF) {
	            state = PATH;
	            if (chr !== '/') continue;
	          } break;

	        case PATH:
	          if (
	            chr === EOF || chr === '/' ||
	            (chr === '\\' && url.isSpecial()) ||
	            (!stateOverride && (chr === '?' || chr === '#'))
	          ) {
	            if (isDoubleDot(buffer)) {
	              url.shortenPath();
	              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
	                push(url.path, '');
	              }
	            } else if (isSingleDot(buffer)) {
	              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
	                push(url.path, '');
	              }
	            } else {
	              if (url.scheme === 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
	                if (url.host) url.host = '';
	                buffer = charAt(buffer, 0) + ':'; // normalize windows drive letter
	              }
	              push(url.path, buffer);
	            }
	            buffer = '';
	            if (url.scheme === 'file' && (chr === EOF || chr === '?' || chr === '#')) {
	              while (url.path.length > 1 && url.path[0] === '') {
	                shift(url.path);
	              }
	            }
	            if (chr === '?') {
	              url.query = '';
	              state = QUERY;
	            } else if (chr === '#') {
	              url.fragment = '';
	              state = FRAGMENT;
	            }
	          } else {
	            buffer += percentEncode(chr, pathPercentEncodeSet);
	          } break;

	        case CANNOT_BE_A_BASE_URL_PATH:
	          if (chr === '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (chr === '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          } else if (chr !== EOF) {
	            url.path[0] += percentEncode(chr, C0ControlPercentEncodeSet);
	          } break;

	        case QUERY:
	          if (!stateOverride && chr === '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          } else if (chr !== EOF) {
	            if (chr === "'" && url.isSpecial()) url.query += '%27';
	            else if (chr === '#') url.query += '%23';
	            else url.query += percentEncode(chr, C0ControlPercentEncodeSet);
	          } break;

	        case FRAGMENT:
	          if (chr !== EOF) url.fragment += percentEncode(chr, fragmentPercentEncodeSet);
	          break;
	      }

	      pointer++;
	    }
	  },
	  // https://url.spec.whatwg.org/#host-parsing
	  parseHost: function (input) {
	    var result, codePoints, index;
	    if (charAt(input, 0) === '[') {
	      if (charAt(input, input.length - 1) !== ']') return INVALID_HOST;
	      result = parseIPv6(stringSlice(input, 1, -1));
	      if (!result) return INVALID_HOST;
	      this.host = result;
	    // opaque host
	    } else if (!this.isSpecial()) {
	      if (exec(FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT, input)) return INVALID_HOST;
	      result = '';
	      codePoints = arrayFrom(input);
	      for (index = 0; index < codePoints.length; index++) {
	        result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
	      }
	      this.host = result;
	    } else {
	      input = toASCII(input);
	      if (exec(FORBIDDEN_HOST_CODE_POINT, input)) return INVALID_HOST;
	      result = parseIPv4(input);
	      if (result === null) return INVALID_HOST;
	      this.host = result;
	    }
	  },
	  // https://url.spec.whatwg.org/#cannot-have-a-username-password-port
	  cannotHaveUsernamePasswordPort: function () {
	    return !this.host || this.cannotBeABaseURL || this.scheme === 'file';
	  },
	  // https://url.spec.whatwg.org/#include-credentials
	  includesCredentials: function () {
	    return this.username !== '' || this.password !== '';
	  },
	  // https://url.spec.whatwg.org/#is-special
	  isSpecial: function () {
	    return hasOwn(specialSchemes, this.scheme);
	  },
	  // https://url.spec.whatwg.org/#shorten-a-urls-path
	  shortenPath: function () {
	    var path = this.path;
	    var pathSize = path.length;
	    if (pathSize && (this.scheme !== 'file' || pathSize !== 1 || !isWindowsDriveLetter(path[0], true))) {
	      path.length--;
	    }
	  },
	  // https://url.spec.whatwg.org/#concept-url-serializer
	  serialize: function () {
	    var url = this;
	    var scheme = url.scheme;
	    var username = url.username;
	    var password = url.password;
	    var host = url.host;
	    var port = url.port;
	    var path = url.path;
	    var query = url.query;
	    var fragment = url.fragment;
	    var output = scheme + ':';
	    if (host !== null) {
	      output += '//';
	      if (url.includesCredentials()) {
	        output += username + (password ? ':' + password : '') + '@';
	      }
	      output += serializeHost(host);
	      if (port !== null) output += ':' + port;
	    } else if (scheme === 'file') output += '//';
	    output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + join(path, '/') : '';
	    if (query !== null) output += '?' + query;
	    if (fragment !== null) output += '#' + fragment;
	    return output;
	  },
	  // https://url.spec.whatwg.org/#dom-url-href
	  setHref: function (href) {
	    var failure = this.parse(href);
	    if (failure) throw new TypeError(failure);
	    this.searchParams.update();
	  },
	  // https://url.spec.whatwg.org/#dom-url-origin
	  getOrigin: function () {
	    var scheme = this.scheme;
	    var port = this.port;
	    if (scheme === 'blob') try {
	      return new URLConstructor(scheme.path[0]).origin;
	    } catch (error) {
	      return 'null';
	    }
	    if (scheme === 'file' || !this.isSpecial()) return 'null';
	    return scheme + '://' + serializeHost(this.host) + (port !== null ? ':' + port : '');
	  },
	  // https://url.spec.whatwg.org/#dom-url-protocol
	  getProtocol: function () {
	    return this.scheme + ':';
	  },
	  setProtocol: function (protocol) {
	    this.parse($toString(protocol) + ':', SCHEME_START);
	  },
	  // https://url.spec.whatwg.org/#dom-url-username
	  getUsername: function () {
	    return this.username;
	  },
	  setUsername: function (username) {
	    var codePoints = arrayFrom($toString(username));
	    if (this.cannotHaveUsernamePasswordPort()) return;
	    this.username = '';
	    for (var i = 0; i < codePoints.length; i++) {
	      this.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	    }
	  },
	  // https://url.spec.whatwg.org/#dom-url-password
	  getPassword: function () {
	    return this.password;
	  },
	  setPassword: function (password) {
	    var codePoints = arrayFrom($toString(password));
	    if (this.cannotHaveUsernamePasswordPort()) return;
	    this.password = '';
	    for (var i = 0; i < codePoints.length; i++) {
	      this.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	    }
	  },
	  // https://url.spec.whatwg.org/#dom-url-host
	  getHost: function () {
	    var host = this.host;
	    var port = this.port;
	    return host === null ? ''
	      : port === null ? serializeHost(host)
	      : serializeHost(host) + ':' + port;
	  },
	  setHost: function (host) {
	    if (this.cannotBeABaseURL) return;
	    this.parse(host, HOST);
	  },
	  // https://url.spec.whatwg.org/#dom-url-hostname
	  getHostname: function () {
	    var host = this.host;
	    return host === null ? '' : serializeHost(host);
	  },
	  setHostname: function (hostname) {
	    if (this.cannotBeABaseURL) return;
	    this.parse(hostname, HOSTNAME);
	  },
	  // https://url.spec.whatwg.org/#dom-url-port
	  getPort: function () {
	    var port = this.port;
	    return port === null ? '' : $toString(port);
	  },
	  setPort: function (port) {
	    if (this.cannotHaveUsernamePasswordPort()) return;
	    port = $toString(port);
	    if (port === '') this.port = null;
	    else this.parse(port, PORT);
	  },
	  // https://url.spec.whatwg.org/#dom-url-pathname
	  getPathname: function () {
	    var path = this.path;
	    return this.cannotBeABaseURL ? path[0] : path.length ? '/' + join(path, '/') : '';
	  },
	  setPathname: function (pathname) {
	    if (this.cannotBeABaseURL) return;
	    this.path = [];
	    this.parse(pathname, PATH_START);
	  },
	  // https://url.spec.whatwg.org/#dom-url-search
	  getSearch: function () {
	    var query = this.query;
	    return query ? '?' + query : '';
	  },
	  setSearch: function (search) {
	    search = $toString(search);
	    if (search === '') {
	      this.query = null;
	    } else {
	      if (charAt(search, 0) === '?') search = stringSlice(search, 1);
	      this.query = '';
	      this.parse(search, QUERY);
	    }
	    this.searchParams.update();
	  },
	  // https://url.spec.whatwg.org/#dom-url-searchparams
	  getSearchParams: function () {
	    return this.searchParams.facade;
	  },
	  // https://url.spec.whatwg.org/#dom-url-hash
	  getHash: function () {
	    var fragment = this.fragment;
	    return fragment ? '#' + fragment : '';
	  },
	  setHash: function (hash) {
	    hash = $toString(hash);
	    if (hash === '') {
	      this.fragment = null;
	      return;
	    }
	    if (charAt(hash, 0) === '#') hash = stringSlice(hash, 1);
	    this.fragment = '';
	    this.parse(hash, FRAGMENT);
	  },
	  update: function () {
	    this.query = this.searchParams.serialize() || null;
	  }
	};

	// `URL` constructor
	// https://url.spec.whatwg.org/#url-class
	var URLConstructor = function URL(url /* , base */) {
	  var that = anInstance(this, URLPrototype);
	  var base = validateArgumentsLength(arguments.length, 1) > 1 ? arguments[1] : undefined;
	  var state = setInternalState(that, new URLState(url, false, base));
	  if (!DESCRIPTORS) {
	    that.href = state.serialize();
	    that.origin = state.getOrigin();
	    that.protocol = state.getProtocol();
	    that.username = state.getUsername();
	    that.password = state.getPassword();
	    that.host = state.getHost();
	    that.hostname = state.getHostname();
	    that.port = state.getPort();
	    that.pathname = state.getPathname();
	    that.search = state.getSearch();
	    that.searchParams = state.getSearchParams();
	    that.hash = state.getHash();
	  }
	};

	var URLPrototype = URLConstructor.prototype;

	var accessorDescriptor = function (getter, setter) {
	  return {
	    get: function () {
	      return getInternalURLState(this)[getter]();
	    },
	    set: setter && function (value) {
	      return getInternalURLState(this)[setter](value);
	    },
	    configurable: true,
	    enumerable: true
	  };
	};

	if (DESCRIPTORS) {
	  // `URL.prototype.href` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-href
	  defineBuiltInAccessor(URLPrototype, 'href', accessorDescriptor('serialize', 'setHref'));
	  // `URL.prototype.origin` getter
	  // https://url.spec.whatwg.org/#dom-url-origin
	  defineBuiltInAccessor(URLPrototype, 'origin', accessorDescriptor('getOrigin'));
	  // `URL.prototype.protocol` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-protocol
	  defineBuiltInAccessor(URLPrototype, 'protocol', accessorDescriptor('getProtocol', 'setProtocol'));
	  // `URL.prototype.username` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-username
	  defineBuiltInAccessor(URLPrototype, 'username', accessorDescriptor('getUsername', 'setUsername'));
	  // `URL.prototype.password` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-password
	  defineBuiltInAccessor(URLPrototype, 'password', accessorDescriptor('getPassword', 'setPassword'));
	  // `URL.prototype.host` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-host
	  defineBuiltInAccessor(URLPrototype, 'host', accessorDescriptor('getHost', 'setHost'));
	  // `URL.prototype.hostname` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-hostname
	  defineBuiltInAccessor(URLPrototype, 'hostname', accessorDescriptor('getHostname', 'setHostname'));
	  // `URL.prototype.port` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-port
	  defineBuiltInAccessor(URLPrototype, 'port', accessorDescriptor('getPort', 'setPort'));
	  // `URL.prototype.pathname` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-pathname
	  defineBuiltInAccessor(URLPrototype, 'pathname', accessorDescriptor('getPathname', 'setPathname'));
	  // `URL.prototype.search` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-search
	  defineBuiltInAccessor(URLPrototype, 'search', accessorDescriptor('getSearch', 'setSearch'));
	  // `URL.prototype.searchParams` getter
	  // https://url.spec.whatwg.org/#dom-url-searchparams
	  defineBuiltInAccessor(URLPrototype, 'searchParams', accessorDescriptor('getSearchParams'));
	  // `URL.prototype.hash` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-hash
	  defineBuiltInAccessor(URLPrototype, 'hash', accessorDescriptor('getHash', 'setHash'));
	}

	// `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson
	defineBuiltIn(URLPrototype, 'toJSON', function toJSON() {
	  return getInternalURLState(this).serialize();
	}, { enumerable: true });

	// `URL.prototype.toString` method
	// https://url.spec.whatwg.org/#URL-stringification-behavior
	defineBuiltIn(URLPrototype, 'toString', function toString() {
	  return getInternalURLState(this).serialize();
	}, { enumerable: true });

	if (NativeURL) {
	  var nativeCreateObjectURL = NativeURL.createObjectURL;
	  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
	  // `URL.createObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
	  if (nativeCreateObjectURL) defineBuiltIn(URLConstructor, 'createObjectURL', bind(nativeCreateObjectURL, NativeURL));
	  // `URL.revokeObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
	  if (nativeRevokeObjectURL) defineBuiltIn(URLConstructor, 'revokeObjectURL', bind(nativeRevokeObjectURL, NativeURL));
	}

	setToStringTag(URLConstructor, 'URL');

	$({ global: true, constructor: true, forced: !USE_NATIVE_URL, sham: !DESCRIPTORS }, {
	  URL: URLConstructor
	});
	return web_url_constructor;
}

var hasRequiredWeb_url;

function requireWeb_url () {
	if (hasRequiredWeb_url) return web_url;
	hasRequiredWeb_url = 1;
	// TODO: Remove this module from `core-js@4` since it's replaced to module below
	requireWeb_url_constructor();
	return web_url;
}

var web_url_canParse = {};

var hasRequiredWeb_url_canParse;

function requireWeb_url_canParse () {
	if (hasRequiredWeb_url_canParse) return web_url_canParse;
	hasRequiredWeb_url_canParse = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var fails = requireFails();
	var validateArgumentsLength = requireValidateArgumentsLength();
	var toString = requireToString();
	var USE_NATIVE_URL = requireUrlConstructorDetection();

	var URL = getBuiltIn('URL');

	// https://github.com/nodejs/node/issues/47505
	// https://github.com/denoland/deno/issues/18893
	var THROWS_WITHOUT_ARGUMENTS = USE_NATIVE_URL && fails(function () {
	  URL.canParse();
	});

	// Bun ~ 1.0.30 bug
	// https://github.com/oven-sh/bun/issues/9250
	var WRONG_ARITY = fails(function () {
	  return URL.canParse.length !== 1;
	});

	// `URL.canParse` method
	// https://url.spec.whatwg.org/#dom-url-canparse
	$({ target: 'URL', stat: true, forced: !THROWS_WITHOUT_ARGUMENTS || WRONG_ARITY }, {
	  canParse: function canParse(url) {
	    var length = validateArgumentsLength(arguments.length, 1);
	    var urlString = toString(url);
	    var base = length < 2 || arguments[1] === undefined ? undefined : toString(arguments[1]);
	    try {
	      return !!new URL(urlString, base);
	    } catch (error) {
	      return false;
	    }
	  }
	});
	return web_url_canParse;
}

var web_url_parse = {};

var hasRequiredWeb_url_parse;

function requireWeb_url_parse () {
	if (hasRequiredWeb_url_parse) return web_url_parse;
	hasRequiredWeb_url_parse = 1;
	var $ = require_export();
	var getBuiltIn = requireGetBuiltIn();
	var validateArgumentsLength = requireValidateArgumentsLength();
	var toString = requireToString();
	var USE_NATIVE_URL = requireUrlConstructorDetection();

	var URL = getBuiltIn('URL');

	// `URL.parse` method
	// https://url.spec.whatwg.org/#dom-url-canparse
	$({ target: 'URL', stat: true, forced: !USE_NATIVE_URL }, {
	  parse: function parse(url) {
	    var length = validateArgumentsLength(arguments.length, 1);
	    var urlString = toString(url);
	    var base = length < 2 || arguments[1] === undefined ? undefined : toString(arguments[1]);
	    try {
	      return new URL(urlString, base);
	    } catch (error) {
	      return null;
	    }
	  }
	});
	return web_url_parse;
}

var web_url_toJson = {};

var hasRequiredWeb_url_toJson;

function requireWeb_url_toJson () {
	if (hasRequiredWeb_url_toJson) return web_url_toJson;
	hasRequiredWeb_url_toJson = 1;
	var $ = require_export();
	var call = requireFunctionCall();

	// `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson
	$({ target: 'URL', proto: true, enumerable: true }, {
	  toJSON: function toJSON() {
	    return call(URL.prototype.toString, this);
	  }
	});
	return web_url_toJson;
}

var web_urlSearchParams = {};

var hasRequiredWeb_urlSearchParams;

function requireWeb_urlSearchParams () {
	if (hasRequiredWeb_urlSearchParams) return web_urlSearchParams;
	hasRequiredWeb_urlSearchParams = 1;
	// TODO: Remove this module from `core-js@4` since it's replaced to module below
	requireWeb_urlSearchParams_constructor();
	return web_urlSearchParams;
}

var web_urlSearchParams_delete = {};

var hasRequiredWeb_urlSearchParams_delete;

function requireWeb_urlSearchParams_delete () {
	if (hasRequiredWeb_urlSearchParams_delete) return web_urlSearchParams_delete;
	hasRequiredWeb_urlSearchParams_delete = 1;
	var defineBuiltIn = requireDefineBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var toString = requireToString();
	var validateArgumentsLength = requireValidateArgumentsLength();

	var $URLSearchParams = URLSearchParams;
	var URLSearchParamsPrototype = $URLSearchParams.prototype;
	var append = uncurryThis(URLSearchParamsPrototype.append);
	var $delete = uncurryThis(URLSearchParamsPrototype['delete']);
	var forEach = uncurryThis(URLSearchParamsPrototype.forEach);
	var push = uncurryThis([].push);
	var params = new $URLSearchParams('a=1&a=2&b=3');

	params['delete']('a', 1);
	// `undefined` case is a Chromium 117 bug
	// https://bugs.chromium.org/p/v8/issues/detail?id=14222
	params['delete']('b', undefined);

	if (params + '' !== 'a=2') {
	  defineBuiltIn(URLSearchParamsPrototype, 'delete', function (name /* , value */) {
	    var length = arguments.length;
	    var $value = length < 2 ? undefined : arguments[1];
	    if (length && $value === undefined) return $delete(this, name);
	    var entries = [];
	    forEach(this, function (v, k) { // also validates `this`
	      push(entries, { key: k, value: v });
	    });
	    validateArgumentsLength(length, 1);
	    var key = toString(name);
	    var value = toString($value);
	    var index = 0;
	    var dindex = 0;
	    var found = false;
	    var entriesLength = entries.length;
	    var entry;
	    while (index < entriesLength) {
	      entry = entries[index++];
	      if (found || entry.key === key) {
	        found = true;
	        $delete(this, entry.key);
	      } else dindex++;
	    }
	    while (dindex < entriesLength) {
	      entry = entries[dindex++];
	      if (!(entry.key === key && entry.value === value)) append(this, entry.key, entry.value);
	    }
	  }, { enumerable: true, unsafe: true });
	}
	return web_urlSearchParams_delete;
}

var web_urlSearchParams_has = {};

var hasRequiredWeb_urlSearchParams_has;

function requireWeb_urlSearchParams_has () {
	if (hasRequiredWeb_urlSearchParams_has) return web_urlSearchParams_has;
	hasRequiredWeb_urlSearchParams_has = 1;
	var defineBuiltIn = requireDefineBuiltIn();
	var uncurryThis = requireFunctionUncurryThis();
	var toString = requireToString();
	var validateArgumentsLength = requireValidateArgumentsLength();

	var $URLSearchParams = URLSearchParams;
	var URLSearchParamsPrototype = $URLSearchParams.prototype;
	var getAll = uncurryThis(URLSearchParamsPrototype.getAll);
	var $has = uncurryThis(URLSearchParamsPrototype.has);
	var params = new $URLSearchParams('a=1');

	// `undefined` case is a Chromium 117 bug
	// https://bugs.chromium.org/p/v8/issues/detail?id=14222
	if (params.has('a', 2) || !params.has('a', undefined)) {
	  defineBuiltIn(URLSearchParamsPrototype, 'has', function has(name /* , value */) {
	    var length = arguments.length;
	    var $value = length < 2 ? undefined : arguments[1];
	    if (length && $value === undefined) return $has(this, name);
	    var values = getAll(this, name); // also validates `this`
	    validateArgumentsLength(length, 1);
	    var value = toString($value);
	    var index = 0;
	    while (index < values.length) {
	      if (values[index++] === value) return true;
	    } return false;
	  }, { enumerable: true, unsafe: true });
	}
	return web_urlSearchParams_has;
}

var web_urlSearchParams_size = {};

var hasRequiredWeb_urlSearchParams_size;

function requireWeb_urlSearchParams_size () {
	if (hasRequiredWeb_urlSearchParams_size) return web_urlSearchParams_size;
	hasRequiredWeb_urlSearchParams_size = 1;
	var DESCRIPTORS = requireDescriptors();
	var uncurryThis = requireFunctionUncurryThis();
	var defineBuiltInAccessor = requireDefineBuiltInAccessor();

	var URLSearchParamsPrototype = URLSearchParams.prototype;
	var forEach = uncurryThis(URLSearchParamsPrototype.forEach);

	// `URLSearchParams.prototype.size` getter
	// https://github.com/whatwg/url/pull/734
	if (DESCRIPTORS && !('size' in URLSearchParamsPrototype)) {
	  defineBuiltInAccessor(URLSearchParamsPrototype, 'size', {
	    get: function size() {
	      var count = 0;
	      forEach(this, function () { count++; });
	      return count;
	    },
	    configurable: true,
	    enumerable: true
	  });
	}
	return web_urlSearchParams_size;
}

var full;
var hasRequiredFull;

function requireFull () {
	if (hasRequiredFull) return full;
	hasRequiredFull = 1;
	requireEs_symbol();
	requireEs_symbol_description();
	requireEs_symbol_asyncIterator();
	requireEs_symbol_hasInstance();
	requireEs_symbol_isConcatSpreadable();
	requireEs_symbol_iterator();
	requireEs_symbol_match();
	requireEs_symbol_matchAll();
	requireEs_symbol_replace();
	requireEs_symbol_search();
	requireEs_symbol_species();
	requireEs_symbol_split();
	requireEs_symbol_toPrimitive();
	requireEs_symbol_toStringTag();
	requireEs_symbol_unscopables();
	requireEs_error_cause();
	requireEs_error_toString();
	requireEs_aggregateError();
	requireEs_aggregateError_cause();
	requireEs_array_at();
	requireEs_array_concat();
	requireEs_array_copyWithin();
	requireEs_array_every();
	requireEs_array_fill();
	requireEs_array_filter();
	requireEs_array_find();
	requireEs_array_findIndex();
	requireEs_array_findLast();
	requireEs_array_findLastIndex();
	requireEs_array_flat();
	requireEs_array_flatMap();
	requireEs_array_forEach();
	requireEs_array_from();
	requireEs_array_includes();
	requireEs_array_indexOf();
	requireEs_array_isArray();
	requireEs_array_iterator();
	requireEs_array_join();
	requireEs_array_lastIndexOf();
	requireEs_array_map();
	requireEs_array_of();
	requireEs_array_push();
	requireEs_array_reduce();
	requireEs_array_reduceRight();
	requireEs_array_reverse();
	requireEs_array_slice();
	requireEs_array_some();
	requireEs_array_sort();
	requireEs_array_species();
	requireEs_array_splice();
	requireEs_array_toReversed();
	requireEs_array_toSorted();
	requireEs_array_toSpliced();
	requireEs_array_unscopables_flat();
	requireEs_array_unscopables_flatMap();
	requireEs_array_unshift();
	requireEs_array_with();
	requireEs_arrayBuffer_constructor();
	requireEs_arrayBuffer_isView();
	requireEs_arrayBuffer_slice();
	requireEs_dataView();
	requireEs_arrayBuffer_detached();
	requireEs_arrayBuffer_transfer();
	requireEs_arrayBuffer_transferToFixedLength();
	requireEs_date_getYear();
	requireEs_date_now();
	requireEs_date_setYear();
	requireEs_date_toGmtString();
	requireEs_date_toIsoString();
	requireEs_date_toJson();
	requireEs_date_toPrimitive();
	requireEs_date_toString();
	requireEs_escape();
	requireEs_function_bind();
	requireEs_function_hasInstance();
	requireEs_function_name();
	requireEs_globalThis();
	requireEs_json_stringify();
	requireEs_json_toStringTag();
	requireEs_map();
	requireEs_map_groupBy();
	requireEs_math_acosh();
	requireEs_math_asinh();
	requireEs_math_atanh();
	requireEs_math_cbrt();
	requireEs_math_clz32();
	requireEs_math_cosh();
	requireEs_math_expm1();
	requireEs_math_fround();
	requireEs_math_hypot();
	requireEs_math_imul();
	requireEs_math_log10();
	requireEs_math_log1p();
	requireEs_math_log2();
	requireEs_math_sign();
	requireEs_math_sinh();
	requireEs_math_tanh();
	requireEs_math_toStringTag();
	requireEs_math_trunc();
	requireEs_number_constructor();
	requireEs_number_epsilon();
	requireEs_number_isFinite();
	requireEs_number_isInteger();
	requireEs_number_isNan();
	requireEs_number_isSafeInteger();
	requireEs_number_maxSafeInteger();
	requireEs_number_minSafeInteger();
	requireEs_number_parseFloat();
	requireEs_number_parseInt();
	requireEs_number_toExponential();
	requireEs_number_toFixed();
	requireEs_number_toPrecision();
	requireEs_object_assign();
	requireEs_object_create();
	requireEs_object_defineGetter();
	requireEs_object_defineProperties();
	requireEs_object_defineProperty();
	requireEs_object_defineSetter();
	requireEs_object_entries();
	requireEs_object_freeze();
	requireEs_object_fromEntries();
	requireEs_object_getOwnPropertyDescriptor();
	requireEs_object_getOwnPropertyDescriptors();
	requireEs_object_getOwnPropertyNames();
	requireEs_object_getPrototypeOf();
	requireEs_object_groupBy();
	requireEs_object_hasOwn();
	requireEs_object_is();
	requireEs_object_isExtensible();
	requireEs_object_isFrozen();
	requireEs_object_isSealed();
	requireEs_object_keys();
	requireEs_object_lookupGetter();
	requireEs_object_lookupSetter();
	requireEs_object_preventExtensions();
	requireEs_object_proto();
	requireEs_object_seal();
	requireEs_object_setPrototypeOf();
	requireEs_object_toString();
	requireEs_object_values();
	requireEs_parseFloat();
	requireEs_parseInt();
	requireEs_promise();
	requireEs_promise_allSettled();
	requireEs_promise_any();
	requireEs_promise_finally();
	requireEs_promise_withResolvers();
	requireEs_reflect_apply();
	requireEs_reflect_construct();
	requireEs_reflect_defineProperty();
	requireEs_reflect_deleteProperty();
	requireEs_reflect_get();
	requireEs_reflect_getOwnPropertyDescriptor();
	requireEs_reflect_getPrototypeOf();
	requireEs_reflect_has();
	requireEs_reflect_isExtensible();
	requireEs_reflect_ownKeys();
	requireEs_reflect_preventExtensions();
	requireEs_reflect_set();
	requireEs_reflect_setPrototypeOf();
	requireEs_reflect_toStringTag();
	requireEs_regexp_constructor();
	requireEs_regexp_dotAll();
	requireEs_regexp_exec();
	requireEs_regexp_flags();
	requireEs_regexp_sticky();
	requireEs_regexp_test();
	requireEs_regexp_toString();
	requireEs_set();
	requireEs_set_difference_v2();
	requireEs_set_intersection_v2();
	requireEs_set_isDisjointFrom_v2();
	requireEs_set_isSubsetOf_v2();
	requireEs_set_isSupersetOf_v2();
	requireEs_set_symmetricDifference_v2();
	requireEs_set_union_v2();
	requireEs_string_atAlternative();
	requireEs_string_codePointAt();
	requireEs_string_endsWith();
	requireEs_string_fromCodePoint();
	requireEs_string_includes();
	requireEs_string_isWellFormed();
	requireEs_string_iterator();
	requireEs_string_match();
	requireEs_string_matchAll();
	requireEs_string_padEnd();
	requireEs_string_padStart();
	requireEs_string_raw();
	requireEs_string_repeat();
	requireEs_string_replace();
	requireEs_string_replaceAll();
	requireEs_string_search();
	requireEs_string_split();
	requireEs_string_startsWith();
	requireEs_string_substr();
	requireEs_string_toWellFormed();
	requireEs_string_trim();
	requireEs_string_trimEnd();
	requireEs_string_trimStart();
	requireEs_string_anchor();
	requireEs_string_big();
	requireEs_string_blink();
	requireEs_string_bold();
	requireEs_string_fixed();
	requireEs_string_fontcolor();
	requireEs_string_fontsize();
	requireEs_string_italics();
	requireEs_string_link();
	requireEs_string_small();
	requireEs_string_strike();
	requireEs_string_sub();
	requireEs_string_sup();
	requireEs_typedArray_float32Array();
	requireEs_typedArray_float64Array();
	requireEs_typedArray_int8Array();
	requireEs_typedArray_int16Array();
	requireEs_typedArray_int32Array();
	requireEs_typedArray_uint8Array();
	requireEs_typedArray_uint8ClampedArray();
	requireEs_typedArray_uint16Array();
	requireEs_typedArray_uint32Array();
	requireEs_typedArray_at();
	requireEs_typedArray_copyWithin();
	requireEs_typedArray_every();
	requireEs_typedArray_fill();
	requireEs_typedArray_filter();
	requireEs_typedArray_find();
	requireEs_typedArray_findIndex();
	requireEs_typedArray_findLast();
	requireEs_typedArray_findLastIndex();
	requireEs_typedArray_forEach();
	requireEs_typedArray_from();
	requireEs_typedArray_includes();
	requireEs_typedArray_indexOf();
	requireEs_typedArray_iterator();
	requireEs_typedArray_join();
	requireEs_typedArray_lastIndexOf();
	requireEs_typedArray_map();
	requireEs_typedArray_of();
	requireEs_typedArray_reduce();
	requireEs_typedArray_reduceRight();
	requireEs_typedArray_reverse();
	requireEs_typedArray_set();
	requireEs_typedArray_slice();
	requireEs_typedArray_some();
	requireEs_typedArray_sort();
	requireEs_typedArray_subarray();
	requireEs_typedArray_toLocaleString();
	requireEs_typedArray_toReversed();
	requireEs_typedArray_toSorted();
	requireEs_typedArray_toString();
	requireEs_typedArray_with();
	requireEs_unescape();
	requireEs_weakMap();
	requireEs_weakSet();
	requireEsnext_aggregateError();
	requireEsnext_suppressedError_constructor();
	requireEsnext_array_fromAsync();
	requireEsnext_array_at();
	requireEsnext_array_filterOut();
	requireEsnext_array_filterReject();
	requireEsnext_array_findLast();
	requireEsnext_array_findLastIndex();
	requireEsnext_array_group();
	requireEsnext_array_groupBy();
	requireEsnext_array_groupByToMap();
	requireEsnext_array_groupToMap();
	requireEsnext_array_isTemplateObject();
	requireEsnext_array_lastIndex();
	requireEsnext_array_lastItem();
	requireEsnext_array_toReversed();
	requireEsnext_array_toSorted();
	requireEsnext_array_toSpliced();
	requireEsnext_array_uniqueBy();
	requireEsnext_array_with();
	requireEsnext_arrayBuffer_detached();
	requireEsnext_arrayBuffer_transfer();
	requireEsnext_arrayBuffer_transferToFixedLength();
	requireEsnext_asyncDisposableStack_constructor();
	requireEsnext_asyncIterator_constructor();
	requireEsnext_asyncIterator_asIndexedPairs();
	requireEsnext_asyncIterator_asyncDispose();
	requireEsnext_asyncIterator_drop();
	requireEsnext_asyncIterator_every();
	requireEsnext_asyncIterator_filter();
	requireEsnext_asyncIterator_find();
	requireEsnext_asyncIterator_flatMap();
	requireEsnext_asyncIterator_forEach();
	requireEsnext_asyncIterator_from();
	requireEsnext_asyncIterator_indexed();
	requireEsnext_asyncIterator_map();
	requireEsnext_asyncIterator_reduce();
	requireEsnext_asyncIterator_some();
	requireEsnext_asyncIterator_take();
	requireEsnext_asyncIterator_toArray();
	requireEsnext_bigint_range();
	requireEsnext_compositeKey();
	requireEsnext_compositeSymbol();
	requireEsnext_dataView_getFloat16();
	requireEsnext_dataView_getUint8Clamped();
	requireEsnext_dataView_setFloat16();
	requireEsnext_dataView_setUint8Clamped();
	requireEsnext_disposableStack_constructor();
	requireEsnext_function_demethodize();
	requireEsnext_function_isCallable();
	requireEsnext_function_isConstructor();
	requireEsnext_function_metadata();
	requireEsnext_function_unThis();
	requireEsnext_globalThis();
	requireEsnext_iterator_constructor();
	requireEsnext_iterator_asIndexedPairs();
	requireEsnext_iterator_dispose();
	requireEsnext_iterator_drop();
	requireEsnext_iterator_every();
	requireEsnext_iterator_filter();
	requireEsnext_iterator_find();
	requireEsnext_iterator_flatMap();
	requireEsnext_iterator_forEach();
	requireEsnext_iterator_from();
	requireEsnext_iterator_indexed();
	requireEsnext_iterator_map();
	requireEsnext_iterator_range();
	requireEsnext_iterator_reduce();
	requireEsnext_iterator_some();
	requireEsnext_iterator_take();
	requireEsnext_iterator_toArray();
	requireEsnext_iterator_toAsync();
	requireEsnext_json_isRawJson();
	requireEsnext_json_parse();
	requireEsnext_json_rawJson();
	requireEsnext_map_deleteAll();
	requireEsnext_map_emplace();
	requireEsnext_map_every();
	requireEsnext_map_filter();
	requireEsnext_map_find();
	requireEsnext_map_findKey();
	requireEsnext_map_from();
	requireEsnext_map_groupBy();
	requireEsnext_map_includes();
	requireEsnext_map_keyBy();
	requireEsnext_map_keyOf();
	requireEsnext_map_mapKeys();
	requireEsnext_map_mapValues();
	requireEsnext_map_merge();
	requireEsnext_map_of();
	requireEsnext_map_reduce();
	requireEsnext_map_some();
	requireEsnext_map_update();
	requireEsnext_map_updateOrInsert();
	requireEsnext_map_upsert();
	requireEsnext_math_clamp();
	requireEsnext_math_degPerRad();
	requireEsnext_math_degrees();
	requireEsnext_math_fscale();
	requireEsnext_math_f16round();
	requireEsnext_math_iaddh();
	requireEsnext_math_imulh();
	requireEsnext_math_isubh();
	requireEsnext_math_radPerDeg();
	requireEsnext_math_radians();
	requireEsnext_math_scale();
	requireEsnext_math_seededPrng();
	requireEsnext_math_signbit();
	requireEsnext_math_sumPrecise();
	requireEsnext_math_umulh();
	requireEsnext_number_fromString();
	requireEsnext_number_range();
	requireEsnext_object_hasOwn();
	requireEsnext_object_iterateEntries();
	requireEsnext_object_iterateKeys();
	requireEsnext_object_iterateValues();
	requireEsnext_object_groupBy();
	requireEsnext_observable();
	requireEsnext_promise_allSettled();
	requireEsnext_promise_any();
	requireEsnext_promise_try();
	requireEsnext_promise_withResolvers();
	requireEsnext_reflect_defineMetadata();
	requireEsnext_reflect_deleteMetadata();
	requireEsnext_reflect_getMetadata();
	requireEsnext_reflect_getMetadataKeys();
	requireEsnext_reflect_getOwnMetadata();
	requireEsnext_reflect_getOwnMetadataKeys();
	requireEsnext_reflect_hasMetadata();
	requireEsnext_reflect_hasOwnMetadata();
	requireEsnext_reflect_metadata();
	requireEsnext_regexp_escape();
	requireEsnext_set_addAll();
	requireEsnext_set_deleteAll();
	requireEsnext_set_difference_v2();
	requireEsnext_set_difference();
	requireEsnext_set_every();
	requireEsnext_set_filter();
	requireEsnext_set_find();
	requireEsnext_set_from();
	requireEsnext_set_intersection_v2();
	requireEsnext_set_intersection();
	requireEsnext_set_isDisjointFrom_v2();
	requireEsnext_set_isDisjointFrom();
	requireEsnext_set_isSubsetOf_v2();
	requireEsnext_set_isSubsetOf();
	requireEsnext_set_isSupersetOf_v2();
	requireEsnext_set_isSupersetOf();
	requireEsnext_set_join();
	requireEsnext_set_map();
	requireEsnext_set_of();
	requireEsnext_set_reduce();
	requireEsnext_set_some();
	requireEsnext_set_symmetricDifference_v2();
	requireEsnext_set_symmetricDifference();
	requireEsnext_set_union_v2();
	requireEsnext_set_union();
	requireEsnext_string_at();
	requireEsnext_string_cooked();
	requireEsnext_string_codePoints();
	requireEsnext_string_dedent();
	requireEsnext_string_isWellFormed();
	requireEsnext_string_matchAll();
	requireEsnext_string_replaceAll();
	requireEsnext_string_toWellFormed();
	requireEsnext_symbol_asyncDispose();
	requireEsnext_symbol_customMatcher();
	requireEsnext_symbol_dispose();
	requireEsnext_symbol_isRegisteredSymbol();
	requireEsnext_symbol_isRegistered();
	requireEsnext_symbol_isWellKnownSymbol();
	requireEsnext_symbol_isWellKnown();
	requireEsnext_symbol_matcher();
	requireEsnext_symbol_metadata();
	requireEsnext_symbol_metadataKey();
	requireEsnext_symbol_observable();
	requireEsnext_symbol_patternMatch();
	requireEsnext_symbol_replaceAll();
	requireEsnext_typedArray_fromAsync();
	requireEsnext_typedArray_at();
	requireEsnext_typedArray_filterOut();
	requireEsnext_typedArray_filterReject();
	requireEsnext_typedArray_findLast();
	requireEsnext_typedArray_findLastIndex();
	requireEsnext_typedArray_groupBy();
	requireEsnext_typedArray_toReversed();
	requireEsnext_typedArray_toSorted();
	requireEsnext_typedArray_toSpliced();
	requireEsnext_typedArray_uniqueBy();
	requireEsnext_typedArray_with();
	requireEsnext_uint8Array_fromBase64();
	requireEsnext_uint8Array_fromHex();
	requireEsnext_uint8Array_setFromBase64();
	requireEsnext_uint8Array_setFromHex();
	requireEsnext_uint8Array_toBase64();
	requireEsnext_uint8Array_toHex();
	requireEsnext_weakMap_deleteAll();
	requireEsnext_weakMap_from();
	requireEsnext_weakMap_of();
	requireEsnext_weakMap_emplace();
	requireEsnext_weakMap_upsert();
	requireEsnext_weakSet_addAll();
	requireEsnext_weakSet_deleteAll();
	requireEsnext_weakSet_from();
	requireEsnext_weakSet_of();
	requireWeb_atob();
	requireWeb_btoa();
	requireWeb_domCollections_forEach();
	requireWeb_domCollections_iterator();
	requireWeb_domException_constructor();
	requireWeb_domException_stack();
	requireWeb_domException_toStringTag();
	requireWeb_immediate();
	requireWeb_queueMicrotask();
	requireWeb_self();
	requireWeb_structuredClone();
	requireWeb_timers();
	requireWeb_url();
	requireWeb_url_canParse();
	requireWeb_url_parse();
	requireWeb_url_toJson();
	requireWeb_urlSearchParams();
	requireWeb_urlSearchParams_delete();
	requireWeb_urlSearchParams_has();
	requireWeb_urlSearchParams_size();

	full = requirePath();
	return full;
}

var coreJs;
var hasRequiredCoreJs;

function requireCoreJs () {
	if (hasRequiredCoreJs) return coreJs;
	hasRequiredCoreJs = 1;
	coreJs = requireFull();
	return coreJs;
}

requireCoreJs();
