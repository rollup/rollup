var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var check = function (it) {
  return it && it.Math === Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var globalThis_1 =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();

var objectGetOwnPropertyDescriptor = {};

var fails$1z = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var fails$1y = fails$1z;

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails$1y(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
});

var fails$1x = fails$1z;

var functionBindNative = !fails$1x(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

var NATIVE_BIND$4 = functionBindNative;

var call$1i = Function.prototype.call;

var functionCall = NATIVE_BIND$4 ? call$1i.bind(call$1i) : function () {
  return call$1i.apply(call$1i, arguments);
};

var objectPropertyIsEnumerable = {};

var $propertyIsEnumerable$2 = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$d = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor$d && !$propertyIsEnumerable$2.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor$d(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable$2;

var createPropertyDescriptor$d = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var NATIVE_BIND$3 = functionBindNative;

var FunctionPrototype$5 = Function.prototype;
var call$1h = FunctionPrototype$5.call;
var uncurryThisWithBind = NATIVE_BIND$3 && FunctionPrototype$5.bind.bind(call$1h, call$1h);

var functionUncurryThis = NATIVE_BIND$3 ? uncurryThisWithBind : function (fn) {
  return function () {
    return call$1h.apply(fn, arguments);
  };
};

var uncurryThis$1Y = functionUncurryThis;

var toString$L = uncurryThis$1Y({}.toString);
var stringSlice$m = uncurryThis$1Y(''.slice);

var classofRaw$2 = function (it) {
  return stringSlice$m(toString$L(it), 8, -1);
};

var uncurryThis$1X = functionUncurryThis;
var fails$1w = fails$1z;
var classof$r = classofRaw$2;

var $Object$8 = Object;
var split$5 = uncurryThis$1X(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails$1w(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object$8('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof$r(it) === 'String' ? split$5(it, '') : $Object$8(it);
} : $Object$8;

// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
var isNullOrUndefined$j = function (it) {
  return it === null || it === undefined;
};

var isNullOrUndefined$i = isNullOrUndefined$j;

var $TypeError$M = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible$q = function (it) {
  if (isNullOrUndefined$i(it)) throw new $TypeError$M("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings
var IndexedObject$7 = indexedObject;
var requireObjectCoercible$p = requireObjectCoercible$q;

var toIndexedObject$k = function (it) {
  return IndexedObject$7(requireObjectCoercible$p(it));
};

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
var documentAll = typeof document == 'object' && document.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
var isCallable$I = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
  return typeof argument == 'function' || argument === documentAll;
} : function (argument) {
  return typeof argument == 'function';
};

var isCallable$H = isCallable$I;

var isObject$N = function (it) {
  return typeof it == 'object' ? it !== null : isCallable$H(it);
};

var globalThis$1k = globalThis_1;
var isCallable$G = isCallable$I;

var aFunction = function (argument) {
  return isCallable$G(argument) ? argument : undefined;
};

var getBuiltIn$O = function (namespace, method) {
  return arguments.length < 2 ? aFunction(globalThis$1k[namespace]) : globalThis$1k[namespace] && globalThis$1k[namespace][method];
};

var uncurryThis$1W = functionUncurryThis;

var objectIsPrototypeOf = uncurryThis$1W({}.isPrototypeOf);

var globalThis$1j = globalThis_1;

var navigator = globalThis$1j.navigator;
var userAgent$8 = navigator && navigator.userAgent;

var environmentUserAgent = userAgent$8 ? String(userAgent$8) : '';

var globalThis$1i = globalThis_1;
var userAgent$7 = environmentUserAgent;

var process$3 = globalThis$1i.process;
var Deno$1 = globalThis$1i.Deno;
var versions = process$3 && process$3.versions || Deno$1 && Deno$1.version;
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
if (!version && userAgent$7) {
  match = userAgent$7.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent$7.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

var environmentV8Version = version;

/* eslint-disable es/no-symbol -- required for testing */
var V8_VERSION$3 = environmentV8Version;
var fails$1v = fails$1z;
var globalThis$1h = globalThis_1;

var $String$a = globalThis$1h.String;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails$1v(function () {
  var symbol = Symbol('symbol detection');
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
  // of course, fail.
  return !$String$a(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION$3 && V8_VERSION$3 < 41;
});

/* eslint-disable es/no-symbol -- required for testing */
var NATIVE_SYMBOL$7 = symbolConstructorDetection;

var useSymbolAsUid = NATIVE_SYMBOL$7
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

var getBuiltIn$N = getBuiltIn$O;
var isCallable$F = isCallable$I;
var isPrototypeOf$f = objectIsPrototypeOf;
var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

var $Object$7 = Object;

var isSymbol$8 = USE_SYMBOL_AS_UID$1 ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn$N('Symbol');
  return isCallable$F($Symbol) && isPrototypeOf$f($Symbol.prototype, $Object$7(it));
};

var $String$9 = String;

var tryToString$7 = function (argument) {
  try {
    return $String$9(argument);
  } catch (error) {
    return 'Object';
  }
};

var isCallable$E = isCallable$I;
var tryToString$6 = tryToString$7;

var $TypeError$L = TypeError;

// `Assert: IsCallable(argument) is true`
var aCallable$N = function (argument) {
  if (isCallable$E(argument)) return argument;
  throw new $TypeError$L(tryToString$6(argument) + ' is not a function');
};

var aCallable$M = aCallable$N;
var isNullOrUndefined$h = isNullOrUndefined$j;

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
var getMethod$l = function (V, P) {
  var func = V[P];
  return isNullOrUndefined$h(func) ? undefined : aCallable$M(func);
};

var call$1g = functionCall;
var isCallable$D = isCallable$I;
var isObject$M = isObject$N;

var $TypeError$K = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
var ordinaryToPrimitive$2 = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable$D(fn = input.toString) && !isObject$M(val = call$1g(fn, input))) return val;
  if (isCallable$D(fn = input.valueOf) && !isObject$M(val = call$1g(fn, input))) return val;
  if (pref !== 'string' && isCallable$D(fn = input.toString) && !isObject$M(val = call$1g(fn, input))) return val;
  throw new $TypeError$K("Can't convert object to primitive value");
};

var sharedStore = {exports: {}};

var isPure = false;

var globalThis$1g = globalThis_1;

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$i = Object.defineProperty;

var defineGlobalProperty$3 = function (key, value) {
  try {
    defineProperty$i(globalThis$1g, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    globalThis$1g[key] = value;
  } return value;
};

var globalThis$1f = globalThis_1;
var defineGlobalProperty$2 = defineGlobalProperty$3;

var SHARED = '__core-js_shared__';
var store$5 = sharedStore.exports = globalThis$1f[SHARED] || defineGlobalProperty$2(SHARED, {});

(store$5.versions || (store$5.versions = [])).push({
  version: '3.38.1',
  mode: 'global',
  copyright: '© 2014-2024 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.38.1/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});

var sharedStoreExports = sharedStore.exports;

var store$4 = sharedStoreExports;

var shared$a = function (key, value) {
  return store$4[key] || (store$4[key] = value || {});
};

var requireObjectCoercible$o = requireObjectCoercible$q;

var $Object$6 = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject$E = function (argument) {
  return $Object$6(requireObjectCoercible$o(argument));
};

var uncurryThis$1V = functionUncurryThis;
var toObject$D = toObject$E;

var hasOwnProperty = uncurryThis$1V({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject$D(it), key);
};

var uncurryThis$1U = functionUncurryThis;

var id$2 = 0;
var postfix = Math.random();
var toString$K = uncurryThis$1U(1.0.toString);

var uid$7 = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$K(++id$2 + postfix, 36);
};

var globalThis$1e = globalThis_1;
var shared$9 = shared$a;
var hasOwn$G = hasOwnProperty_1;
var uid$6 = uid$7;
var NATIVE_SYMBOL$6 = symbolConstructorDetection;
var USE_SYMBOL_AS_UID = useSymbolAsUid;

var Symbol$7 = globalThis$1e.Symbol;
var WellKnownSymbolsStore$2 = shared$9('wks');
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$7['for'] || Symbol$7 : Symbol$7 && Symbol$7.withoutSetter || uid$6;

var wellKnownSymbol$S = function (name) {
  if (!hasOwn$G(WellKnownSymbolsStore$2, name)) {
    WellKnownSymbolsStore$2[name] = NATIVE_SYMBOL$6 && hasOwn$G(Symbol$7, name)
      ? Symbol$7[name]
      : createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore$2[name];
};

var call$1f = functionCall;
var isObject$L = isObject$N;
var isSymbol$7 = isSymbol$8;
var getMethod$k = getMethod$l;
var ordinaryToPrimitive$1 = ordinaryToPrimitive$2;
var wellKnownSymbol$R = wellKnownSymbol$S;

var $TypeError$J = TypeError;
var TO_PRIMITIVE$1 = wellKnownSymbol$R('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
var toPrimitive$4 = function (input, pref) {
  if (!isObject$L(input) || isSymbol$7(input)) return input;
  var exoticToPrim = getMethod$k(input, TO_PRIMITIVE$1);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call$1f(exoticToPrim, input, pref);
    if (!isObject$L(result) || isSymbol$7(result)) return result;
    throw new $TypeError$J("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive$1(input, pref);
};

var toPrimitive$3 = toPrimitive$4;
var isSymbol$6 = isSymbol$8;

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
var toPropertyKey$9 = function (argument) {
  var key = toPrimitive$3(argument, 'string');
  return isSymbol$6(key) ? key : key + '';
};

var globalThis$1d = globalThis_1;
var isObject$K = isObject$N;

var document$3 = globalThis$1d.document;
// typeof document.createElement is 'object' in old IE
var EXISTS$1 = isObject$K(document$3) && isObject$K(document$3.createElement);

var documentCreateElement$2 = function (it) {
  return EXISTS$1 ? document$3.createElement(it) : {};
};

var DESCRIPTORS$W = descriptors;
var fails$1u = fails$1z;
var createElement$1 = documentCreateElement$2;

// Thanks to IE8 for its funny defineProperty
var ie8DomDefine = !DESCRIPTORS$W && !fails$1u(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement$1('div'), 'a', {
    get: function () { return 7; }
  }).a !== 7;
});

var DESCRIPTORS$V = descriptors;
var call$1e = functionCall;
var propertyIsEnumerableModule$2 = objectPropertyIsEnumerable;
var createPropertyDescriptor$c = createPropertyDescriptor$d;
var toIndexedObject$j = toIndexedObject$k;
var toPropertyKey$8 = toPropertyKey$9;
var hasOwn$F = hasOwnProperty_1;
var IE8_DOM_DEFINE$1 = ie8DomDefine;

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
objectGetOwnPropertyDescriptor.f = DESCRIPTORS$V ? $getOwnPropertyDescriptor$2 : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject$j(O);
  P = toPropertyKey$8(P);
  if (IE8_DOM_DEFINE$1) try {
    return $getOwnPropertyDescriptor$2(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn$F(O, P)) return createPropertyDescriptor$c(!call$1e(propertyIsEnumerableModule$2.f, O, P), O[P]);
};

var objectDefineProperty = {};

var DESCRIPTORS$U = descriptors;
var fails$1t = fails$1z;

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
var v8PrototypeDefineBug = DESCRIPTORS$U && fails$1t(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype !== 42;
});

var isObject$J = isObject$N;

var $String$8 = String;
var $TypeError$I = TypeError;

// `Assert: Type(argument) is Object`
var anObject$1h = function (argument) {
  if (isObject$J(argument)) return argument;
  throw new $TypeError$I($String$8(argument) + ' is not an object');
};

var DESCRIPTORS$T = descriptors;
var IE8_DOM_DEFINE = ie8DomDefine;
var V8_PROTOTYPE_DEFINE_BUG$1 = v8PrototypeDefineBug;
var anObject$1g = anObject$1h;
var toPropertyKey$7 = toPropertyKey$9;

var $TypeError$H = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty$1 = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE$1 = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
objectDefineProperty.f = DESCRIPTORS$T ? V8_PROTOTYPE_DEFINE_BUG$1 ? function defineProperty(O, P, Attributes) {
  anObject$1g(O);
  P = toPropertyKey$7(P);
  anObject$1g(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor$1(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty$1(O, P, Attributes);
} : $defineProperty$1 : function defineProperty(O, P, Attributes) {
  anObject$1g(O);
  P = toPropertyKey$7(P);
  anObject$1g(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty$1(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError$H('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var DESCRIPTORS$S = descriptors;
var definePropertyModule$b = objectDefineProperty;
var createPropertyDescriptor$b = createPropertyDescriptor$d;

var createNonEnumerableProperty$j = DESCRIPTORS$S ? function (object, key, value) {
  return definePropertyModule$b.f(object, key, createPropertyDescriptor$b(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var makeBuiltIn$5 = {exports: {}};

var DESCRIPTORS$R = descriptors;
var hasOwn$E = hasOwnProperty_1;

var FunctionPrototype$4 = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS$R && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn$E(FunctionPrototype$4, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS$R || (DESCRIPTORS$R && getDescriptor(FunctionPrototype$4, 'name').configurable));

var functionName = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};

var uncurryThis$1T = functionUncurryThis;
var isCallable$C = isCallable$I;
var store$3 = sharedStoreExports;

var functionToString$1 = uncurryThis$1T(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable$C(store$3.inspectSource)) {
  store$3.inspectSource = function (it) {
    return functionToString$1(it);
  };
}

var inspectSource$4 = store$3.inspectSource;

var globalThis$1c = globalThis_1;
var isCallable$B = isCallable$I;

var WeakMap$4 = globalThis$1c.WeakMap;

var weakMapBasicDetection = isCallable$B(WeakMap$4) && /native code/.test(String(WeakMap$4));

var shared$8 = shared$a;
var uid$5 = uid$7;

var keys$2 = shared$8('keys');

var sharedKey$4 = function (key) {
  return keys$2[key] || (keys$2[key] = uid$5(key));
};

var hiddenKeys$6 = {};

var NATIVE_WEAK_MAP$1 = weakMapBasicDetection;
var globalThis$1b = globalThis_1;
var isObject$I = isObject$N;
var createNonEnumerableProperty$i = createNonEnumerableProperty$j;
var hasOwn$D = hasOwnProperty_1;
var shared$7 = sharedStoreExports;
var sharedKey$3 = sharedKey$4;
var hiddenKeys$5 = hiddenKeys$6;

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError$a = globalThis$1b.TypeError;
var WeakMap$3 = globalThis$1b.WeakMap;
var set$b, get$6, has$d;

var enforce = function (it) {
  return has$d(it) ? get$6(it) : set$b(it, {});
};

var getterFor$2 = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject$I(it) || (state = get$6(it)).type !== TYPE) {
      throw new TypeError$a('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP$1 || shared$7.state) {
  var store$2 = shared$7.state || (shared$7.state = new WeakMap$3());
  /* eslint-disable no-self-assign -- prototype methods protection */
  store$2.get = store$2.get;
  store$2.has = store$2.has;
  store$2.set = store$2.set;
  /* eslint-enable no-self-assign -- prototype methods protection */
  set$b = function (it, metadata) {
    if (store$2.has(it)) throw new TypeError$a(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    store$2.set(it, metadata);
    return metadata;
  };
  get$6 = function (it) {
    return store$2.get(it) || {};
  };
  has$d = function (it) {
    return store$2.has(it);
  };
} else {
  var STATE = sharedKey$3('state');
  hiddenKeys$5[STATE] = true;
  set$b = function (it, metadata) {
    if (hasOwn$D(it, STATE)) throw new TypeError$a(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty$i(it, STATE, metadata);
    return metadata;
  };
  get$6 = function (it) {
    return hasOwn$D(it, STATE) ? it[STATE] : {};
  };
  has$d = function (it) {
    return hasOwn$D(it, STATE);
  };
}

var internalState = {
  set: set$b,
  get: get$6,
  has: has$d,
  enforce: enforce,
  getterFor: getterFor$2
};

var uncurryThis$1S = functionUncurryThis;
var fails$1s = fails$1z;
var isCallable$A = isCallable$I;
var hasOwn$C = hasOwnProperty_1;
var DESCRIPTORS$Q = descriptors;
var CONFIGURABLE_FUNCTION_NAME$2 = functionName.CONFIGURABLE;
var inspectSource$3 = inspectSource$4;
var InternalStateModule$n = internalState;

var enforceInternalState$4 = InternalStateModule$n.enforce;
var getInternalState$g = InternalStateModule$n.get;
var $String$7 = String;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$h = Object.defineProperty;
var stringSlice$l = uncurryThis$1S(''.slice);
var replace$c = uncurryThis$1S(''.replace);
var join$a = uncurryThis$1S([].join);

var CONFIGURABLE_LENGTH = DESCRIPTORS$Q && !fails$1s(function () {
  return defineProperty$h(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn$4 = makeBuiltIn$5.exports = function (value, name, options) {
  if (stringSlice$l($String$7(name), 0, 7) === 'Symbol(') {
    name = '[' + replace$c($String$7(name), /^Symbol\(([^)]*)\).*$/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn$C(value, 'name') || (CONFIGURABLE_FUNCTION_NAME$2 && value.name !== name)) {
    if (DESCRIPTORS$Q) defineProperty$h(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn$C(options, 'arity') && value.length !== options.arity) {
    defineProperty$h(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn$C(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS$Q) defineProperty$h(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState$4(value);
  if (!hasOwn$C(state, 'source')) {
    state.source = join$a(TEMPLATE, typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn$4(function toString() {
  return isCallable$A(this) && getInternalState$g(this).source || inspectSource$3(this);
}, 'toString');

var makeBuiltInExports = makeBuiltIn$5.exports;

var isCallable$z = isCallable$I;
var definePropertyModule$a = objectDefineProperty;
var makeBuiltIn$3 = makeBuiltInExports;
var defineGlobalProperty$1 = defineGlobalProperty$3;

var defineBuiltIn$u = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable$z(value)) makeBuiltIn$3(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty$1(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule$a.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};

var objectGetOwnPropertyNames = {};

var ceil$1 = Math.ceil;
var floor$a = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
var mathTrunc = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor$a : ceil$1)(n);
};

var trunc$1 = mathTrunc;

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
var toIntegerOrInfinity$p = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc$1(number);
};

var toIntegerOrInfinity$o = toIntegerOrInfinity$p;

var max$9 = Math.max;
var min$f = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex$a = function (index, length) {
  var integer = toIntegerOrInfinity$o(index);
  return integer < 0 ? max$9(integer + length, 0) : min$f(integer, length);
};

var toIntegerOrInfinity$n = toIntegerOrInfinity$p;

var min$e = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength$d = function (argument) {
  var len = toIntegerOrInfinity$n(argument);
  return len > 0 ? min$e(len, 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var toLength$c = toLength$d;

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
var lengthOfArrayLike$B = function (obj) {
  return toLength$c(obj.length);
};

var toIndexedObject$i = toIndexedObject$k;
var toAbsoluteIndex$9 = toAbsoluteIndex$a;
var lengthOfArrayLike$A = lengthOfArrayLike$B;

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod$8 = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject$i($this);
    var length = lengthOfArrayLike$A(O);
    if (length === 0) return !IS_INCLUDES && -1;
    var index = toAbsoluteIndex$9(fromIndex, length);
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

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod$8(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod$8(false)
};

var uncurryThis$1R = functionUncurryThis;
var hasOwn$B = hasOwnProperty_1;
var toIndexedObject$h = toIndexedObject$k;
var indexOf$2 = arrayIncludes.indexOf;
var hiddenKeys$4 = hiddenKeys$6;

var push$s = uncurryThis$1R([].push);

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject$h(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn$B(hiddenKeys$4, key) && hasOwn$B(O, key) && push$s(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn$B(O, key = names[i++])) {
    ~indexOf$2(result, key) || push$s(result, key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys$3 = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var internalObjectKeys$1 = objectKeysInternal;
var enumBugKeys$2 = enumBugKeys$3;

var hiddenKeys$3 = enumBugKeys$2.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys$1(O, hiddenKeys$3);
};

var objectGetOwnPropertySymbols = {};

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

var getBuiltIn$M = getBuiltIn$O;
var uncurryThis$1Q = functionUncurryThis;
var getOwnPropertyNamesModule$2 = objectGetOwnPropertyNames;
var getOwnPropertySymbolsModule$3 = objectGetOwnPropertySymbols;
var anObject$1f = anObject$1h;

var concat$4 = uncurryThis$1Q([].concat);

// all object keys, includes non-enumerable and symbols
var ownKeys$3 = getBuiltIn$M('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule$2.f(anObject$1f(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule$3.f;
  return getOwnPropertySymbols ? concat$4(keys, getOwnPropertySymbols(it)) : keys;
};

var hasOwn$A = hasOwnProperty_1;
var ownKeys$2 = ownKeys$3;
var getOwnPropertyDescriptorModule$6 = objectGetOwnPropertyDescriptor;
var definePropertyModule$9 = objectDefineProperty;

var copyConstructorProperties$7 = function (target, source, exceptions) {
  var keys = ownKeys$2(source);
  var defineProperty = definePropertyModule$9.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$6.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn$A(target, key) && !(exceptions && hasOwn$A(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

var fails$1r = fails$1z;
var isCallable$y = isCallable$I;

var replacement = /#|\.prototype\./;

var isForced$5 = function (feature, detection) {
  var value = data[normalize(feature)];
  return value === POLYFILL ? true
    : value === NATIVE ? false
    : isCallable$y(detection) ? fails$1r(detection)
    : !!detection;
};

var normalize = isForced$5.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced$5.data = {};
var NATIVE = isForced$5.NATIVE = 'N';
var POLYFILL = isForced$5.POLYFILL = 'P';

var isForced_1 = isForced$5;

var globalThis$1a = globalThis_1;
var getOwnPropertyDescriptor$c = objectGetOwnPropertyDescriptor.f;
var createNonEnumerableProperty$h = createNonEnumerableProperty$j;
var defineBuiltIn$t = defineBuiltIn$u;
var defineGlobalProperty = defineGlobalProperty$3;
var copyConstructorProperties$6 = copyConstructorProperties$7;
var isForced$4 = isForced_1;

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
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = globalThis$1a;
  } else if (STATIC) {
    target = globalThis$1a[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = globalThis$1a[TARGET] && globalThis$1a[TARGET].prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor$c(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced$4(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties$6(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty$h(sourceProperty, 'sham', true);
    }
    defineBuiltIn$t(target, key, sourceProperty, options);
  }
};

var wellKnownSymbol$Q = wellKnownSymbol$S;

var TO_STRING_TAG$b = wellKnownSymbol$Q('toStringTag');
var test$2 = {};

test$2[TO_STRING_TAG$b] = 'z';

var toStringTagSupport = String(test$2) === '[object z]';

var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
var isCallable$x = isCallable$I;
var classofRaw$1 = classofRaw$2;
var wellKnownSymbol$P = wellKnownSymbol$S;

var TO_STRING_TAG$a = wellKnownSymbol$P('toStringTag');
var $Object$5 = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw$1(function () { return arguments; }()) === 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof$q = TO_STRING_TAG_SUPPORT$2 ? classofRaw$1 : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object$5(it), TO_STRING_TAG$a)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw$1(O)
    // ES3 arguments fallback
    : (result = classofRaw$1(O)) === 'Object' && isCallable$x(O.callee) ? 'Arguments' : result;
};

var classof$p = classof$q;

var $String$6 = String;

var toString$J = function (argument) {
  if (classof$p(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
  return $String$6(argument);
};

var objectDefineProperties = {};

var internalObjectKeys = objectKeysInternal;
var enumBugKeys$1 = enumBugKeys$3;

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
var objectKeys$6 = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys$1);
};

var DESCRIPTORS$P = descriptors;
var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
var definePropertyModule$8 = objectDefineProperty;
var anObject$1e = anObject$1h;
var toIndexedObject$g = toIndexedObject$k;
var objectKeys$5 = objectKeys$6;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
objectDefineProperties.f = DESCRIPTORS$P && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject$1e(O);
  var props = toIndexedObject$g(Properties);
  var keys = objectKeys$5(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule$8.f(O, key = keys[index++], props[key]);
  return O;
};

var getBuiltIn$L = getBuiltIn$O;

var html$2 = getBuiltIn$L('document', 'documentElement');

/* global ActiveXObject -- old IE, WSH */
var anObject$1d = anObject$1h;
var definePropertiesModule$1 = objectDefineProperties;
var enumBugKeys = enumBugKeys$3;
var hiddenKeys$2 = hiddenKeys$6;
var html$1 = html$2;
var documentCreateElement$1 = documentCreateElement$2;
var sharedKey$2 = sharedKey$4;

var GT = '>';
var LT = '<';
var PROTOTYPE$2 = 'prototype';
var SCRIPT = 'script';
var IE_PROTO$1 = sharedKey$2('IE_PROTO');

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
  var iframe = documentCreateElement$1('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html$1.appendChild(iframe);
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
  while (length--) delete NullProtoObject[PROTOTYPE$2][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys$2[IE_PROTO$1] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
var objectCreate$1 = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE$2] = anObject$1d(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE$2] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule$1.f(result, Properties);
};

var objectGetOwnPropertyNamesExternal = {};

var uncurryThis$1P = functionUncurryThis;

var arraySlice$a = uncurryThis$1P([].slice);

/* eslint-disable es/no-object-getownpropertynames -- safe */
var classof$o = classofRaw$2;
var toIndexedObject$f = toIndexedObject$k;
var $getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
var arraySlice$9 = arraySlice$a;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return $getOwnPropertyNames$1(it);
  } catch (error) {
    return arraySlice$9(windowNames);
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
  return windowNames && classof$o(it) === 'Window'
    ? getWindowNames(it)
    : $getOwnPropertyNames$1(toIndexedObject$f(it));
};

var makeBuiltIn$2 = makeBuiltInExports;
var defineProperty$g = objectDefineProperty;

var defineBuiltInAccessor$p = function (target, name, descriptor) {
  if (descriptor.get) makeBuiltIn$2(descriptor.get, name, { getter: true });
  if (descriptor.set) makeBuiltIn$2(descriptor.set, name, { setter: true });
  return defineProperty$g.f(target, name, descriptor);
};

var wellKnownSymbolWrapped = {};

var wellKnownSymbol$O = wellKnownSymbol$S;

wellKnownSymbolWrapped.f = wellKnownSymbol$O;

var globalThis$19 = globalThis_1;

var path$2 = globalThis$19;

var path$1 = path$2;
var hasOwn$z = hasOwnProperty_1;
var wrappedWellKnownSymbolModule$1 = wellKnownSymbolWrapped;
var defineProperty$f = objectDefineProperty.f;

var wellKnownSymbolDefine = function (NAME) {
  var Symbol = path$1.Symbol || (path$1.Symbol = {});
  if (!hasOwn$z(Symbol, NAME)) defineProperty$f(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule$1.f(NAME)
  });
};

var call$1d = functionCall;
var getBuiltIn$K = getBuiltIn$O;
var wellKnownSymbol$N = wellKnownSymbol$S;
var defineBuiltIn$s = defineBuiltIn$u;

var symbolDefineToPrimitive = function () {
  var Symbol = getBuiltIn$K('Symbol');
  var SymbolPrototype = Symbol && Symbol.prototype;
  var valueOf = SymbolPrototype && SymbolPrototype.valueOf;
  var TO_PRIMITIVE = wellKnownSymbol$N('toPrimitive');

  if (SymbolPrototype && !SymbolPrototype[TO_PRIMITIVE]) {
    // `Symbol.prototype[@@toPrimitive]` method
    // https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
    // eslint-disable-next-line no-unused-vars -- required for .length
    defineBuiltIn$s(SymbolPrototype, TO_PRIMITIVE, function (hint) {
      return call$1d(valueOf, this);
    }, { arity: 1 });
  }
};

var defineProperty$e = objectDefineProperty.f;
var hasOwn$y = hasOwnProperty_1;
var wellKnownSymbol$M = wellKnownSymbol$S;

var TO_STRING_TAG$9 = wellKnownSymbol$M('toStringTag');

var setToStringTag$e = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwn$y(target, TO_STRING_TAG$9)) {
    defineProperty$e(target, TO_STRING_TAG$9, { configurable: true, value: TAG });
  }
};

var classofRaw = classofRaw$2;
var uncurryThis$1O = functionUncurryThis;

var functionUncurryThisClause = function (fn) {
  // Nashorn bug:
  //   https://github.com/zloirock/core-js/issues/1128
  //   https://github.com/zloirock/core-js/issues/1130
  if (classofRaw(fn) === 'Function') return uncurryThis$1O(fn);
};

var uncurryThis$1N = functionUncurryThisClause;
var aCallable$L = aCallable$N;
var NATIVE_BIND$2 = functionBindNative;

var bind$v = uncurryThis$1N(uncurryThis$1N.bind);

// optional / simple context binding
var functionBindContext = function (fn, that) {
  aCallable$L(fn);
  return that === undefined ? fn : NATIVE_BIND$2 ? bind$v(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var classof$n = classofRaw$2;

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray$b = Array.isArray || function isArray(argument) {
  return classof$n(argument) === 'Array';
};

var uncurryThis$1M = functionUncurryThis;
var fails$1q = fails$1z;
var isCallable$w = isCallable$I;
var classof$m = classof$q;
var getBuiltIn$J = getBuiltIn$O;
var inspectSource$2 = inspectSource$4;

var noop = function () { /* empty */ };
var construct$1 = getBuiltIn$J('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec$h = uncurryThis$1M(constructorRegExp.exec);
var INCORRECT_TO_STRING$2 = !constructorRegExp.test(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable$w(argument)) return false;
  try {
    construct$1(noop, [], argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable$w(argument)) return false;
  switch (classof$m(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING$2 || !!exec$h(constructorRegExp, inspectSource$2(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
var isConstructor$a = !construct$1 || fails$1q(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;

var isArray$a = isArray$b;
var isConstructor$9 = isConstructor$a;
var isObject$H = isObject$N;
var wellKnownSymbol$L = wellKnownSymbol$S;

var SPECIES$6 = wellKnownSymbol$L('species');
var $Array$c = Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesConstructor$1 = function (originalArray) {
  var C;
  if (isArray$a(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor$9(C) && (C === $Array$c || isArray$a(C.prototype))) C = undefined;
    else if (isObject$H(C)) {
      C = C[SPECIES$6];
      if (C === null) C = undefined;
    }
  } return C === undefined ? $Array$c : C;
};

var arraySpeciesConstructor = arraySpeciesConstructor$1;

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate$5 = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};

var bind$u = functionBindContext;
var uncurryThis$1L = functionUncurryThis;
var IndexedObject$6 = indexedObject;
var toObject$C = toObject$E;
var lengthOfArrayLike$z = lengthOfArrayLike$B;
var arraySpeciesCreate$4 = arraySpeciesCreate$5;

var push$r = uncurryThis$1L([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod$7 = function (TYPE) {
  var IS_MAP = TYPE === 1;
  var IS_FILTER = TYPE === 2;
  var IS_SOME = TYPE === 3;
  var IS_EVERY = TYPE === 4;
  var IS_FIND_INDEX = TYPE === 6;
  var IS_FILTER_REJECT = TYPE === 7;
  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject$C($this);
    var self = IndexedObject$6(O);
    var length = lengthOfArrayLike$z(self);
    var boundFunction = bind$u(callbackfn, that);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate$4;
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
          case 2: push$r(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push$r(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$7(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod$7(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod$7(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod$7(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod$7(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod$7(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$7(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod$7(7)
};

var $$5z = _export;
var globalThis$18 = globalThis_1;
var call$1c = functionCall;
var uncurryThis$1K = functionUncurryThis;
var DESCRIPTORS$O = descriptors;
var NATIVE_SYMBOL$5 = symbolConstructorDetection;
var fails$1p = fails$1z;
var hasOwn$x = hasOwnProperty_1;
var isPrototypeOf$e = objectIsPrototypeOf;
var anObject$1c = anObject$1h;
var toIndexedObject$e = toIndexedObject$k;
var toPropertyKey$6 = toPropertyKey$9;
var $toString$3 = toString$J;
var createPropertyDescriptor$a = createPropertyDescriptor$d;
var nativeObjectCreate = objectCreate$1;
var objectKeys$4 = objectKeys$6;
var getOwnPropertyNamesModule$1 = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternal = objectGetOwnPropertyNamesExternal;
var getOwnPropertySymbolsModule$2 = objectGetOwnPropertySymbols;
var getOwnPropertyDescriptorModule$5 = objectGetOwnPropertyDescriptor;
var definePropertyModule$7 = objectDefineProperty;
var definePropertiesModule = objectDefineProperties;
var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
var defineBuiltIn$r = defineBuiltIn$u;
var defineBuiltInAccessor$o = defineBuiltInAccessor$p;
var shared$6 = shared$a;
var sharedKey$1 = sharedKey$4;
var hiddenKeys$1 = hiddenKeys$6;
var uid$4 = uid$7;
var wellKnownSymbol$K = wellKnownSymbol$S;
var wrappedWellKnownSymbolModule = wellKnownSymbolWrapped;
var defineWellKnownSymbol$m = wellKnownSymbolDefine;
var defineSymbolToPrimitive$1 = symbolDefineToPrimitive;
var setToStringTag$d = setToStringTag$e;
var InternalStateModule$m = internalState;
var $forEach$3 = arrayIteration.forEach;

var HIDDEN = sharedKey$1('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE$1 = 'prototype';

var setInternalState$m = InternalStateModule$m.set;
var getInternalState$f = InternalStateModule$m.getterFor(SYMBOL);

var ObjectPrototype$5 = Object[PROTOTYPE$1];
var $Symbol = globalThis$18.Symbol;
var SymbolPrototype$1 = $Symbol && $Symbol[PROTOTYPE$1];
var RangeError$4 = globalThis$18.RangeError;
var TypeError$9 = globalThis$18.TypeError;
var QObject = globalThis$18.QObject;
var nativeGetOwnPropertyDescriptor$2 = getOwnPropertyDescriptorModule$5.f;
var nativeDefineProperty$1 = definePropertyModule$7.f;
var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = propertyIsEnumerableModule$1.f;
var push$q = uncurryThis$1K([].push);

var AllSymbols = shared$6('symbols');
var ObjectPrototypeSymbols = shared$6('op-symbols');
var WellKnownSymbolsStore$1 = shared$6('wks');

// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var fallbackDefineProperty = function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$2(ObjectPrototype$5, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype$5[P];
  nativeDefineProperty$1(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype$5) {
    nativeDefineProperty$1(ObjectPrototype$5, P, ObjectPrototypeDescriptor);
  }
};

var setSymbolDescriptor = DESCRIPTORS$O && fails$1p(function () {
  return nativeObjectCreate(nativeDefineProperty$1({}, 'a', {
    get: function () { return nativeDefineProperty$1(this, 'a', { value: 7 }).a; }
  })).a !== 7;
}) ? fallbackDefineProperty : nativeDefineProperty$1;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = nativeObjectCreate(SymbolPrototype$1);
  setInternalState$m(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!DESCRIPTORS$O) symbol.description = description;
  return symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype$5) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject$1c(O);
  var key = toPropertyKey$6(P);
  anObject$1c(Attributes);
  if (hasOwn$x(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!hasOwn$x(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor$a(1, nativeObjectCreate(null)));
      O[HIDDEN][key] = true;
    } else {
      if (hasOwn$x(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor$a(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty$1(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject$1c(O);
  var properties = toIndexedObject$e(Properties);
  var keys = objectKeys$4(properties).concat($getOwnPropertySymbols(properties));
  $forEach$3(keys, function (key) {
    if (!DESCRIPTORS$O || call$1c($propertyIsEnumerable$1, properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
};

var $propertyIsEnumerable$1 = function propertyIsEnumerable(V) {
  var P = toPropertyKey$6(V);
  var enumerable = call$1c(nativePropertyIsEnumerable, this, P);
  if (this === ObjectPrototype$5 && hasOwn$x(AllSymbols, P) && !hasOwn$x(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !hasOwn$x(this, P) || !hasOwn$x(AllSymbols, P) || hasOwn$x(this, HIDDEN) && this[HIDDEN][P]
    ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject$e(O);
  var key = toPropertyKey$6(P);
  if (it === ObjectPrototype$5 && hasOwn$x(AllSymbols, key) && !hasOwn$x(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor$2(it, key);
  if (descriptor && hasOwn$x(AllSymbols, key) && !(hasOwn$x(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject$e(O));
  var result = [];
  $forEach$3(names, function (key) {
    if (!hasOwn$x(AllSymbols, key) && !hasOwn$x(hiddenKeys$1, key)) push$q(result, key);
  });
  return result;
};

var $getOwnPropertySymbols = function (O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$5;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject$e(O));
  var result = [];
  $forEach$3(names, function (key) {
    if (hasOwn$x(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || hasOwn$x(ObjectPrototype$5, key))) {
      push$q(result, AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.es/ecma262/#sec-symbol-constructor
if (!NATIVE_SYMBOL$5) {
  $Symbol = function Symbol() {
    if (isPrototypeOf$e(SymbolPrototype$1, this)) throw new TypeError$9('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : $toString$3(arguments[0]);
    var tag = uid$4(description);
    var setter = function (value) {
      var $this = this === undefined ? globalThis$18 : this;
      if ($this === ObjectPrototype$5) call$1c(setter, ObjectPrototypeSymbols, value);
      if (hasOwn$x($this, HIDDEN) && hasOwn$x($this[HIDDEN], tag)) $this[HIDDEN][tag] = false;
      var descriptor = createPropertyDescriptor$a(1, value);
      try {
        setSymbolDescriptor($this, tag, descriptor);
      } catch (error) {
        if (!(error instanceof RangeError$4)) throw error;
        fallbackDefineProperty($this, tag, descriptor);
      }
    };
    if (DESCRIPTORS$O && USE_SETTER) setSymbolDescriptor(ObjectPrototype$5, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  SymbolPrototype$1 = $Symbol[PROTOTYPE$1];

  defineBuiltIn$r(SymbolPrototype$1, 'toString', function toString() {
    return getInternalState$f(this).tag;
  });

  defineBuiltIn$r($Symbol, 'withoutSetter', function (description) {
    return wrap(uid$4(description), description);
  });

  propertyIsEnumerableModule$1.f = $propertyIsEnumerable$1;
  definePropertyModule$7.f = $defineProperty;
  definePropertiesModule.f = $defineProperties;
  getOwnPropertyDescriptorModule$5.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule$1.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule$2.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule.f = function (name) {
    return wrap(wellKnownSymbol$K(name), name);
  };

  if (DESCRIPTORS$O) {
    // https://github.com/tc39/proposal-Symbol-description
    defineBuiltInAccessor$o(SymbolPrototype$1, 'description', {
      configurable: true,
      get: function description() {
        return getInternalState$f(this).description;
      }
    });
    {
      defineBuiltIn$r(ObjectPrototype$5, 'propertyIsEnumerable', $propertyIsEnumerable$1, { unsafe: true });
    }
  }
}

$$5z({ global: true, constructor: true, wrap: true, forced: !NATIVE_SYMBOL$5, sham: !NATIVE_SYMBOL$5 }, {
  Symbol: $Symbol
});

$forEach$3(objectKeys$4(WellKnownSymbolsStore$1), function (name) {
  defineWellKnownSymbol$m(name);
});

$$5z({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL$5 }, {
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$$5z({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL$5, sham: !DESCRIPTORS$O }, {
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

$$5z({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL$5 }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames
});

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
defineSymbolToPrimitive$1();

// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag$d($Symbol, SYMBOL);

hiddenKeys$1[HIDDEN] = true;

var NATIVE_SYMBOL$4 = symbolConstructorDetection;

/* eslint-disable es/no-symbol -- safe */
var symbolRegistryDetection = NATIVE_SYMBOL$4 && !!Symbol['for'] && !!Symbol.keyFor;

var $$5y = _export;
var getBuiltIn$I = getBuiltIn$O;
var hasOwn$w = hasOwnProperty_1;
var toString$I = toString$J;
var shared$5 = shared$a;
var NATIVE_SYMBOL_REGISTRY$1 = symbolRegistryDetection;

var StringToSymbolRegistry = shared$5('string-to-symbol-registry');
var SymbolToStringRegistry$1 = shared$5('symbol-to-string-registry');

// `Symbol.for` method
// https://tc39.es/ecma262/#sec-symbol.for
$$5y({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY$1 }, {
  'for': function (key) {
    var string = toString$I(key);
    if (hasOwn$w(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = getBuiltIn$I('Symbol')(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry$1[symbol] = string;
    return symbol;
  }
});

var $$5x = _export;
var hasOwn$v = hasOwnProperty_1;
var isSymbol$5 = isSymbol$8;
var tryToString$5 = tryToString$7;
var shared$4 = shared$a;
var NATIVE_SYMBOL_REGISTRY = symbolRegistryDetection;

var SymbolToStringRegistry = shared$4('symbol-to-string-registry');

// `Symbol.keyFor` method
// https://tc39.es/ecma262/#sec-symbol.keyfor
$$5x({ target: 'Symbol', stat: true, forced: !NATIVE_SYMBOL_REGISTRY }, {
  keyFor: function keyFor(sym) {
    if (!isSymbol$5(sym)) throw new TypeError(tryToString$5(sym) + ' is not a symbol');
    if (hasOwn$v(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  }
});

var NATIVE_BIND$1 = functionBindNative;

var FunctionPrototype$3 = Function.prototype;
var apply$e = FunctionPrototype$3.apply;
var call$1b = FunctionPrototype$3.call;

// eslint-disable-next-line es/no-reflect -- safe
var functionApply$1 = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND$1 ? call$1b.bind(apply$e) : function () {
  return call$1b.apply(apply$e, arguments);
});

var uncurryThis$1J = functionUncurryThis;
var isArray$9 = isArray$b;
var isCallable$v = isCallable$I;
var classof$l = classofRaw$2;
var toString$H = toString$J;

var push$p = uncurryThis$1J([].push);

var getJsonReplacerFunction = function (replacer) {
  if (isCallable$v(replacer)) return replacer;
  if (!isArray$9(replacer)) return;
  var rawLength = replacer.length;
  var keys = [];
  for (var i = 0; i < rawLength; i++) {
    var element = replacer[i];
    if (typeof element == 'string') push$p(keys, element);
    else if (typeof element == 'number' || classof$l(element) === 'Number' || classof$l(element) === 'String') push$p(keys, toString$H(element));
  }
  var keysLength = keys.length;
  var root = true;
  return function (key, value) {
    if (root) {
      root = false;
      return value;
    }
    if (isArray$9(this)) return value;
    for (var j = 0; j < keysLength; j++) if (keys[j] === key) return value;
  };
};

var $$5w = _export;
var getBuiltIn$H = getBuiltIn$O;
var apply$d = functionApply$1;
var call$1a = functionCall;
var uncurryThis$1I = functionUncurryThis;
var fails$1o = fails$1z;
var isCallable$u = isCallable$I;
var isSymbol$4 = isSymbol$8;
var arraySlice$8 = arraySlice$a;
var getReplacerFunction$1 = getJsonReplacerFunction;
var NATIVE_SYMBOL$3 = symbolConstructorDetection;

var $String$5 = String;
var $stringify$1 = getBuiltIn$H('JSON', 'stringify');
var exec$g = uncurryThis$1I(/./.exec);
var charAt$m = uncurryThis$1I(''.charAt);
var charCodeAt$9 = uncurryThis$1I(''.charCodeAt);
var replace$b = uncurryThis$1I(''.replace);
var numberToString$5 = uncurryThis$1I(1.0.toString);

var tester = /[\uD800-\uDFFF]/g;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var WRONG_SYMBOLS_CONVERSION = !NATIVE_SYMBOL$3 || fails$1o(function () {
  var symbol = getBuiltIn$H('Symbol')('stringify detection');
  // MS Edge converts symbol values to JSON as {}
  return $stringify$1([symbol]) !== '[null]'
    // WebKit converts symbol values to JSON as null
    || $stringify$1({ a: symbol }) !== '{}'
    // V8 throws on boxed symbols
    || $stringify$1(Object(symbol)) !== '{}';
});

// https://github.com/tc39/proposal-well-formed-stringify
var ILL_FORMED_UNICODE = fails$1o(function () {
  return $stringify$1('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify$1('\uDEAD') !== '"\\udead"';
});

var stringifyWithSymbolsFix = function (it, replacer) {
  var args = arraySlice$8(arguments);
  var $replacer = getReplacerFunction$1(replacer);
  if (!isCallable$u($replacer) && (it === undefined || isSymbol$4(it))) return; // IE8 returns string on undefined
  args[1] = function (key, value) {
    // some old implementations (like WebKit) could pass numbers as keys
    if (isCallable$u($replacer)) value = call$1a($replacer, this, $String$5(key), value);
    if (!isSymbol$4(value)) return value;
  };
  return apply$d($stringify$1, null, args);
};

var fixIllFormed = function (match, offset, string) {
  var prev = charAt$m(string, offset - 1);
  var next = charAt$m(string, offset + 1);
  if ((exec$g(low, match) && !exec$g(hi, next)) || (exec$g(hi, match) && !exec$g(low, prev))) {
    return '\\u' + numberToString$5(charCodeAt$9(match, 0), 16);
  } return match;
};

if ($stringify$1) {
  // `JSON.stringify` method
  // https://tc39.es/ecma262/#sec-json.stringify
  $$5w({ target: 'JSON', stat: true, arity: 3, forced: WRONG_SYMBOLS_CONVERSION || ILL_FORMED_UNICODE }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      var args = arraySlice$8(arguments);
      var result = apply$d(WRONG_SYMBOLS_CONVERSION ? stringifyWithSymbolsFix : $stringify$1, null, args);
      return ILL_FORMED_UNICODE && typeof result == 'string' ? replace$b(result, tester, fixIllFormed) : result;
    }
  });
}

var $$5v = _export;
var NATIVE_SYMBOL$2 = symbolConstructorDetection;
var fails$1n = fails$1z;
var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
var toObject$B = toObject$E;

// V8 ~ Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
var FORCED$H = !NATIVE_SYMBOL$2 || fails$1n(function () { getOwnPropertySymbolsModule$1.f(1); });

// `Object.getOwnPropertySymbols` method
// https://tc39.es/ecma262/#sec-object.getownpropertysymbols
$$5v({ target: 'Object', stat: true, forced: FORCED$H }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    var $getOwnPropertySymbols = getOwnPropertySymbolsModule$1.f;
    return $getOwnPropertySymbols ? $getOwnPropertySymbols(toObject$B(it)) : [];
  }
});

var $$5u = _export;
var DESCRIPTORS$N = descriptors;
var globalThis$17 = globalThis_1;
var uncurryThis$1H = functionUncurryThis;
var hasOwn$u = hasOwnProperty_1;
var isCallable$t = isCallable$I;
var isPrototypeOf$d = objectIsPrototypeOf;
var toString$G = toString$J;
var defineBuiltInAccessor$n = defineBuiltInAccessor$p;
var copyConstructorProperties$5 = copyConstructorProperties$7;

var NativeSymbol = globalThis$17.Symbol;
var SymbolPrototype = NativeSymbol && NativeSymbol.prototype;

if (DESCRIPTORS$N && isCallable$t(NativeSymbol) && (!('description' in SymbolPrototype) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : toString$G(arguments[0]);
    var result = isPrototypeOf$d(SymbolPrototype, this)
      // eslint-disable-next-line sonar/inconsistent-function-call -- ok
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };

  copyConstructorProperties$5(SymbolWrapper, NativeSymbol);
  SymbolWrapper.prototype = SymbolPrototype;
  SymbolPrototype.constructor = SymbolWrapper;

  var NATIVE_SYMBOL$1 = String(NativeSymbol('description detection')) === 'Symbol(description detection)';
  var thisSymbolValue$2 = uncurryThis$1H(SymbolPrototype.valueOf);
  var symbolDescriptiveString = uncurryThis$1H(SymbolPrototype.toString);
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  var replace$a = uncurryThis$1H(''.replace);
  var stringSlice$k = uncurryThis$1H(''.slice);

  defineBuiltInAccessor$n(SymbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = thisSymbolValue$2(this);
      if (hasOwn$u(EmptyStringDescriptionStore, symbol)) return '';
      var string = symbolDescriptiveString(symbol);
      var desc = NATIVE_SYMBOL$1 ? stringSlice$k(string, 7, -1) : replace$a(string, regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  $$5u({ global: true, constructor: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}

var defineWellKnownSymbol$l = wellKnownSymbolDefine;

// `Symbol.asyncIterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.asynciterator
defineWellKnownSymbol$l('asyncIterator');

var defineWellKnownSymbol$k = wellKnownSymbolDefine;

// `Symbol.hasInstance` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.hasinstance
defineWellKnownSymbol$k('hasInstance');

var defineWellKnownSymbol$j = wellKnownSymbolDefine;

// `Symbol.isConcatSpreadable` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.isconcatspreadable
defineWellKnownSymbol$j('isConcatSpreadable');

var defineWellKnownSymbol$i = wellKnownSymbolDefine;

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
defineWellKnownSymbol$i('iterator');

var defineWellKnownSymbol$h = wellKnownSymbolDefine;

// `Symbol.match` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.match
defineWellKnownSymbol$h('match');

var defineWellKnownSymbol$g = wellKnownSymbolDefine;

// `Symbol.matchAll` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.matchall
defineWellKnownSymbol$g('matchAll');

var defineWellKnownSymbol$f = wellKnownSymbolDefine;

// `Symbol.replace` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.replace
defineWellKnownSymbol$f('replace');

var defineWellKnownSymbol$e = wellKnownSymbolDefine;

// `Symbol.search` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.search
defineWellKnownSymbol$e('search');

var defineWellKnownSymbol$d = wellKnownSymbolDefine;

// `Symbol.species` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.species
defineWellKnownSymbol$d('species');

var defineWellKnownSymbol$c = wellKnownSymbolDefine;

// `Symbol.split` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.split
defineWellKnownSymbol$c('split');

var defineWellKnownSymbol$b = wellKnownSymbolDefine;
var defineSymbolToPrimitive = symbolDefineToPrimitive;

// `Symbol.toPrimitive` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.toprimitive
defineWellKnownSymbol$b('toPrimitive');

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
defineSymbolToPrimitive();

var getBuiltIn$G = getBuiltIn$O;
var defineWellKnownSymbol$a = wellKnownSymbolDefine;
var setToStringTag$c = setToStringTag$e;

// `Symbol.toStringTag` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.tostringtag
defineWellKnownSymbol$a('toStringTag');

// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag$c(getBuiltIn$G('Symbol'), 'Symbol');

var defineWellKnownSymbol$9 = wellKnownSymbolDefine;

// `Symbol.unscopables` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.unscopables
defineWellKnownSymbol$9('unscopables');

var uncurryThis$1G = functionUncurryThis;
var aCallable$K = aCallable$N;

var functionUncurryThisAccessor = function (object, key, method) {
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    return uncurryThis$1G(aCallable$K(Object.getOwnPropertyDescriptor(object, key)[method]));
  } catch (error) { /* empty */ }
};

var isObject$G = isObject$N;

var isPossiblePrototype$2 = function (argument) {
  return isObject$G(argument) || argument === null;
};

var isPossiblePrototype$1 = isPossiblePrototype$2;

var $String$4 = String;
var $TypeError$G = TypeError;

var aPossiblePrototype$2 = function (argument) {
  if (isPossiblePrototype$1(argument)) return argument;
  throw new $TypeError$G("Can't set " + $String$4(argument) + ' as a prototype');
};

/* eslint-disable no-proto -- safe */
var uncurryThisAccessor$3 = functionUncurryThisAccessor;
var isObject$F = isObject$N;
var requireObjectCoercible$n = requireObjectCoercible$q;
var aPossiblePrototype$1 = aPossiblePrototype$2;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
var objectSetPrototypeOf$1 = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = uncurryThisAccessor$3(Object.prototype, '__proto__', 'set');
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    requireObjectCoercible$n(O);
    aPossiblePrototype$1(proto);
    if (!isObject$F(O)) return O;
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var defineProperty$d = objectDefineProperty.f;

var proxyAccessor$2 = function (Target, Source, key) {
  key in Target || defineProperty$d(Target, key, {
    configurable: true,
    get: function () { return Source[key]; },
    set: function (it) { Source[key] = it; }
  });
};

var isCallable$s = isCallable$I;
var isObject$E = isObject$N;
var setPrototypeOf$a = objectSetPrototypeOf$1;

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired$7 = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf$a &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable$s(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject$E(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf$a($this, NewTargetPrototype);
  return $this;
};

var toString$F = toString$J;

var normalizeStringArgument$6 = function (argument, $default) {
  return argument === undefined ? arguments.length < 2 ? '' : $default : toString$F(argument);
};

var isObject$D = isObject$N;
var createNonEnumerableProperty$g = createNonEnumerableProperty$j;

// `InstallErrorCause` abstract operation
// https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
var installErrorCause$2 = function (O, options) {
  if (isObject$D(options) && 'cause' in options) {
    createNonEnumerableProperty$g(O, 'cause', options.cause);
  }
};

var uncurryThis$1F = functionUncurryThis;

var $Error$2 = Error;
var replace$9 = uncurryThis$1F(''.replace);

var TEST = (function (arg) { return String(new $Error$2(arg).stack); })('zxcasd');
// eslint-disable-next-line redos/no-vulnerable -- safe
var V8_OR_CHAKRA_STACK_ENTRY = /\n\s*at [^:]*:[^\n]*/;
var IS_V8_OR_CHAKRA_STACK = V8_OR_CHAKRA_STACK_ENTRY.test(TEST);

var errorStackClear = function (stack, dropEntries) {
  if (IS_V8_OR_CHAKRA_STACK && typeof stack == 'string' && !$Error$2.prepareStackTrace) {
    while (dropEntries--) stack = replace$9(stack, V8_OR_CHAKRA_STACK_ENTRY, '');
  } return stack;
};

var fails$1m = fails$1z;
var createPropertyDescriptor$9 = createPropertyDescriptor$d;

var errorStackInstallable = !fails$1m(function () {
  var error = new Error('a');
  if (!('stack' in error)) return true;
  // eslint-disable-next-line es/no-object-defineproperty -- safe
  Object.defineProperty(error, 'stack', createPropertyDescriptor$9(1, 7));
  return error.stack !== 7;
});

var createNonEnumerableProperty$f = createNonEnumerableProperty$j;
var clearErrorStack$2 = errorStackClear;
var ERROR_STACK_INSTALLABLE$1 = errorStackInstallable;

// non-standard V8
var captureStackTrace = Error.captureStackTrace;

var errorStackInstall = function (error, C, stack, dropEntries) {
  if (ERROR_STACK_INSTALLABLE$1) {
    if (captureStackTrace) captureStackTrace(error, C);
    else createNonEnumerableProperty$f(error, 'stack', clearErrorStack$2(stack, dropEntries));
  }
};

var getBuiltIn$F = getBuiltIn$O;
var hasOwn$t = hasOwnProperty_1;
var createNonEnumerableProperty$e = createNonEnumerableProperty$j;
var isPrototypeOf$c = objectIsPrototypeOf;
var setPrototypeOf$9 = objectSetPrototypeOf$1;
var copyConstructorProperties$4 = copyConstructorProperties$7;
var proxyAccessor$1 = proxyAccessor$2;
var inheritIfRequired$6 = inheritIfRequired$7;
var normalizeStringArgument$5 = normalizeStringArgument$6;
var installErrorCause$1 = installErrorCause$2;
var installErrorStack$2 = errorStackInstall;
var DESCRIPTORS$M = descriptors;

var wrapErrorConstructorWithCause$2 = function (FULL_NAME, wrapper, FORCED, IS_AGGREGATE_ERROR) {
  var STACK_TRACE_LIMIT = 'stackTraceLimit';
  var OPTIONS_POSITION = IS_AGGREGATE_ERROR ? 2 : 1;
  var path = FULL_NAME.split('.');
  var ERROR_NAME = path[path.length - 1];
  var OriginalError = getBuiltIn$F.apply(null, path);

  if (!OriginalError) return;

  var OriginalErrorPrototype = OriginalError.prototype;

  // V8 9.3- bug https://bugs.chromium.org/p/v8/issues/detail?id=12006
  if (hasOwn$t(OriginalErrorPrototype, 'cause')) delete OriginalErrorPrototype.cause;

  if (!FORCED) return OriginalError;

  var BaseError = getBuiltIn$F('Error');

  var WrappedError = wrapper(function (a, b) {
    var message = normalizeStringArgument$5(IS_AGGREGATE_ERROR ? b : a, undefined);
    var result = IS_AGGREGATE_ERROR ? new OriginalError(a) : new OriginalError();
    if (message !== undefined) createNonEnumerableProperty$e(result, 'message', message);
    installErrorStack$2(result, WrappedError, result.stack, 2);
    if (this && isPrototypeOf$c(OriginalErrorPrototype, this)) inheritIfRequired$6(result, this, WrappedError);
    if (arguments.length > OPTIONS_POSITION) installErrorCause$1(result, arguments[OPTIONS_POSITION]);
    return result;
  });

  WrappedError.prototype = OriginalErrorPrototype;

  if (ERROR_NAME !== 'Error') {
    if (setPrototypeOf$9) setPrototypeOf$9(WrappedError, BaseError);
    else copyConstructorProperties$4(WrappedError, BaseError, { name: true });
  } else if (DESCRIPTORS$M && STACK_TRACE_LIMIT in OriginalError) {
    proxyAccessor$1(WrappedError, OriginalError, STACK_TRACE_LIMIT);
    proxyAccessor$1(WrappedError, OriginalError, 'prepareStackTrace');
  }

  copyConstructorProperties$4(WrappedError, OriginalError);

  try {
    // Safari 13- bug: WebAssembly errors does not have a proper `.name`
    if (OriginalErrorPrototype.name !== ERROR_NAME) {
      createNonEnumerableProperty$e(OriginalErrorPrototype, 'name', ERROR_NAME);
    }
    OriginalErrorPrototype.constructor = WrappedError;
  } catch (error) { /* empty */ }

  return WrappedError;
};

/* eslint-disable no-unused-vars -- required for functions `.length` */
var $$5t = _export;
var globalThis$16 = globalThis_1;
var apply$c = functionApply$1;
var wrapErrorConstructorWithCause$1 = wrapErrorConstructorWithCause$2;

var WEB_ASSEMBLY = 'WebAssembly';
var WebAssembly = globalThis$16[WEB_ASSEMBLY];

// eslint-disable-next-line es/no-error-cause -- feature detection
var FORCED$G = new Error('e', { cause: 7 }).cause !== 7;

var exportGlobalErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  var O = {};
  O[ERROR_NAME] = wrapErrorConstructorWithCause$1(ERROR_NAME, wrapper, FORCED$G);
  $$5t({ global: true, constructor: true, arity: 1, forced: FORCED$G }, O);
};

var exportWebAssemblyErrorCauseWrapper = function (ERROR_NAME, wrapper) {
  if (WebAssembly && WebAssembly[ERROR_NAME]) {
    var O = {};
    O[ERROR_NAME] = wrapErrorConstructorWithCause$1(WEB_ASSEMBLY + '.' + ERROR_NAME, wrapper, FORCED$G);
    $$5t({ target: WEB_ASSEMBLY, stat: true, constructor: true, arity: 1, forced: FORCED$G }, O);
  }
};

// https://tc39.es/ecma262/#sec-nativeerror
exportGlobalErrorCauseWrapper('Error', function (init) {
  return function Error(message) { return apply$c(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('EvalError', function (init) {
  return function EvalError(message) { return apply$c(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('RangeError', function (init) {
  return function RangeError(message) { return apply$c(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('ReferenceError', function (init) {
  return function ReferenceError(message) { return apply$c(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('SyntaxError', function (init) {
  return function SyntaxError(message) { return apply$c(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('TypeError', function (init) {
  return function TypeError(message) { return apply$c(init, this, arguments); };
});
exportGlobalErrorCauseWrapper('URIError', function (init) {
  return function URIError(message) { return apply$c(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('CompileError', function (init) {
  return function CompileError(message) { return apply$c(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('LinkError', function (init) {
  return function LinkError(message) { return apply$c(init, this, arguments); };
});
exportWebAssemblyErrorCauseWrapper('RuntimeError', function (init) {
  return function RuntimeError(message) { return apply$c(init, this, arguments); };
});

var DESCRIPTORS$L = descriptors;
var fails$1l = fails$1z;
var anObject$1b = anObject$1h;
var normalizeStringArgument$4 = normalizeStringArgument$6;

var nativeErrorToString = Error.prototype.toString;

var INCORRECT_TO_STRING$1 = fails$1l(function () {
  if (DESCRIPTORS$L) {
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

var errorToString$2 = INCORRECT_TO_STRING$1 ? function toString() {
  var O = anObject$1b(this);
  var name = normalizeStringArgument$4(O.name, 'Error');
  var message = normalizeStringArgument$4(O.message);
  return !name ? message : !message ? name : name + ': ' + message;
} : nativeErrorToString;

var defineBuiltIn$q = defineBuiltIn$u;
var errorToString$1 = errorToString$2;

var ErrorPrototype$1 = Error.prototype;

// `Error.prototype.toString` method fix
// https://tc39.es/ecma262/#sec-error.prototype.tostring
if (ErrorPrototype$1.toString !== errorToString$1) {
  defineBuiltIn$q(ErrorPrototype$1, 'toString', errorToString$1);
}

var fails$1k = fails$1z;

var correctPrototypeGetter = !fails$1k(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var hasOwn$s = hasOwnProperty_1;
var isCallable$r = isCallable$I;
var toObject$A = toObject$E;
var sharedKey = sharedKey$4;
var CORRECT_PROTOTYPE_GETTER$2 = correctPrototypeGetter;

var IE_PROTO = sharedKey('IE_PROTO');
var $Object$4 = Object;
var ObjectPrototype$4 = $Object$4.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
var objectGetPrototypeOf$2 = CORRECT_PROTOTYPE_GETTER$2 ? $Object$4.getPrototypeOf : function (O) {
  var object = toObject$A(O);
  if (hasOwn$s(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable$r(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object$4 ? ObjectPrototype$4 : null;
};

var iterators = {};

var wellKnownSymbol$J = wellKnownSymbol$S;
var Iterators$5 = iterators;

var ITERATOR$c = wellKnownSymbol$J('iterator');
var ArrayPrototype$1 = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod$3 = function (it) {
  return it !== undefined && (Iterators$5.Array === it || ArrayPrototype$1[ITERATOR$c] === it);
};

var classof$k = classof$q;
var getMethod$j = getMethod$l;
var isNullOrUndefined$g = isNullOrUndefined$j;
var Iterators$4 = iterators;
var wellKnownSymbol$I = wellKnownSymbol$S;

var ITERATOR$b = wellKnownSymbol$I('iterator');

var getIteratorMethod$8 = function (it) {
  if (!isNullOrUndefined$g(it)) return getMethod$j(it, ITERATOR$b)
    || getMethod$j(it, '@@iterator')
    || Iterators$4[classof$k(it)];
};

var call$19 = functionCall;
var aCallable$J = aCallable$N;
var anObject$1a = anObject$1h;
var tryToString$4 = tryToString$7;
var getIteratorMethod$7 = getIteratorMethod$8;

var $TypeError$F = TypeError;

var getIterator$7 = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$7(argument) : usingIterator;
  if (aCallable$J(iteratorMethod)) return anObject$1a(call$19(iteratorMethod, argument));
  throw new $TypeError$F(tryToString$4(argument) + ' is not iterable');
};

var call$18 = functionCall;
var anObject$19 = anObject$1h;
var getMethod$i = getMethod$l;

var iteratorClose$8 = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject$19(iterator);
  try {
    innerResult = getMethod$i(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = call$18(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject$19(innerResult);
  return value;
};

var bind$t = functionBindContext;
var call$17 = functionCall;
var anObject$18 = anObject$1h;
var tryToString$3 = tryToString$7;
var isArrayIteratorMethod$2 = isArrayIteratorMethod$3;
var lengthOfArrayLike$y = lengthOfArrayLike$B;
var isPrototypeOf$b = objectIsPrototypeOf;
var getIterator$6 = getIterator$7;
var getIteratorMethod$6 = getIteratorMethod$8;
var iteratorClose$7 = iteratorClose$8;

var $TypeError$E = TypeError;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var ResultPrototype = Result.prototype;

var iterate$H = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_RECORD = !!(options && options.IS_RECORD);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = bind$t(unboundFunction, that);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose$7(iterator, 'normal', condition);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject$18(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_RECORD) {
    iterator = iterable.iterator;
  } else if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod$6(iterable);
    if (!iterFn) throw new $TypeError$E(tryToString$3(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod$2(iterFn)) {
      for (index = 0, length = lengthOfArrayLike$y(iterable); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && isPrototypeOf$b(ResultPrototype, result)) return result;
      } return new Result(false);
    }
    iterator = getIterator$6(iterable, iterFn);
  }

  next = IS_RECORD ? iterable.next : iterator.next;
  while (!(step = call$17(next, iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose$7(iterator, 'throw', error);
    }
    if (typeof result == 'object' && result && isPrototypeOf$b(ResultPrototype, result)) return result;
  } return new Result(false);
};

var $$5s = _export;
var isPrototypeOf$a = objectIsPrototypeOf;
var getPrototypeOf$g = objectGetPrototypeOf$2;
var setPrototypeOf$8 = objectSetPrototypeOf$1;
var copyConstructorProperties$3 = copyConstructorProperties$7;
var create$i = objectCreate$1;
var createNonEnumerableProperty$d = createNonEnumerableProperty$j;
var createPropertyDescriptor$8 = createPropertyDescriptor$d;
var installErrorCause = installErrorCause$2;
var installErrorStack$1 = errorStackInstall;
var iterate$G = iterate$H;
var normalizeStringArgument$3 = normalizeStringArgument$6;
var wellKnownSymbol$H = wellKnownSymbol$S;

var TO_STRING_TAG$8 = wellKnownSymbol$H('toStringTag');
var $Error$1 = Error;
var push$o = [].push;

var $AggregateError$1 = function AggregateError(errors, message /* , options */) {
  var isInstance = isPrototypeOf$a(AggregateErrorPrototype, this);
  var that;
  if (setPrototypeOf$8) {
    that = setPrototypeOf$8(new $Error$1(), isInstance ? getPrototypeOf$g(this) : AggregateErrorPrototype);
  } else {
    that = isInstance ? this : create$i(AggregateErrorPrototype);
    createNonEnumerableProperty$d(that, TO_STRING_TAG$8, 'Error');
  }
  if (message !== undefined) createNonEnumerableProperty$d(that, 'message', normalizeStringArgument$3(message));
  installErrorStack$1(that, $AggregateError$1, that.stack, 1);
  if (arguments.length > 2) installErrorCause(that, arguments[2]);
  var errorsArray = [];
  iterate$G(errors, push$o, { that: errorsArray });
  createNonEnumerableProperty$d(that, 'errors', errorsArray);
  return that;
};

if (setPrototypeOf$8) setPrototypeOf$8($AggregateError$1, $Error$1);
else copyConstructorProperties$3($AggregateError$1, $Error$1, { name: true });

var AggregateErrorPrototype = $AggregateError$1.prototype = create$i($Error$1.prototype, {
  constructor: createPropertyDescriptor$8(1, $AggregateError$1),
  message: createPropertyDescriptor$8(1, ''),
  name: createPropertyDescriptor$8(1, 'AggregateError')
});

// `AggregateError` constructor
// https://tc39.es/ecma262/#sec-aggregate-error-constructor
$$5s({ global: true, constructor: true, arity: 2 }, {
  AggregateError: $AggregateError$1
});

var $$5r = _export;
var getBuiltIn$E = getBuiltIn$O;
var apply$b = functionApply$1;
var fails$1j = fails$1z;
var wrapErrorConstructorWithCause = wrapErrorConstructorWithCause$2;

var AGGREGATE_ERROR = 'AggregateError';
var $AggregateError = getBuiltIn$E(AGGREGATE_ERROR);

var FORCED$F = !fails$1j(function () {
  return $AggregateError([1]).errors[0] !== 1;
}) && fails$1j(function () {
  return $AggregateError([1], AGGREGATE_ERROR, { cause: 7 }).cause !== 7;
});

// https://tc39.es/ecma262/#sec-aggregate-error
$$5r({ global: true, constructor: true, arity: 2, forced: FORCED$F }, {
  AggregateError: wrapErrorConstructorWithCause(AGGREGATE_ERROR, function (init) {
    // eslint-disable-next-line no-unused-vars -- required for functions `.length`
    return function AggregateError(errors, message) { return apply$b(init, this, arguments); };
  }, FORCED$F, true)
});

var wellKnownSymbol$G = wellKnownSymbol$S;
var create$h = objectCreate$1;
var defineProperty$c = objectDefineProperty.f;

var UNSCOPABLES = wellKnownSymbol$G('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] === undefined) {
  defineProperty$c(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create$h(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables$n = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

var $$5q = _export;
var toObject$z = toObject$E;
var lengthOfArrayLike$x = lengthOfArrayLike$B;
var toIntegerOrInfinity$m = toIntegerOrInfinity$p;
var addToUnscopables$m = addToUnscopables$n;

// `Array.prototype.at` method
// https://tc39.es/ecma262/#sec-array.prototype.at
$$5q({ target: 'Array', proto: true }, {
  at: function at(index) {
    var O = toObject$z(this);
    var len = lengthOfArrayLike$x(O);
    var relativeIndex = toIntegerOrInfinity$m(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : O[k];
  }
});

addToUnscopables$m('at');

var $TypeError$D = TypeError;
var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

var doesNotExceedSafeInteger$7 = function (it) {
  if (it > MAX_SAFE_INTEGER$1) throw $TypeError$D('Maximum allowed index exceeded');
  return it;
};

var DESCRIPTORS$K = descriptors;
var definePropertyModule$6 = objectDefineProperty;
var createPropertyDescriptor$7 = createPropertyDescriptor$d;

var createProperty$b = function (object, key, value) {
  if (DESCRIPTORS$K) definePropertyModule$6.f(object, key, createPropertyDescriptor$7(0, value));
  else object[key] = value;
};

var fails$1i = fails$1z;
var wellKnownSymbol$F = wellKnownSymbol$S;
var V8_VERSION$2 = environmentV8Version;

var SPECIES$5 = wellKnownSymbol$F('species');

var arrayMethodHasSpeciesSupport$5 = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION$2 >= 51 || !fails$1i(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$5] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var $$5p = _export;
var fails$1h = fails$1z;
var isArray$8 = isArray$b;
var isObject$C = isObject$N;
var toObject$y = toObject$E;
var lengthOfArrayLike$w = lengthOfArrayLike$B;
var doesNotExceedSafeInteger$6 = doesNotExceedSafeInteger$7;
var createProperty$a = createProperty$b;
var arraySpeciesCreate$3 = arraySpeciesCreate$5;
var arrayMethodHasSpeciesSupport$4 = arrayMethodHasSpeciesSupport$5;
var wellKnownSymbol$E = wellKnownSymbol$S;
var V8_VERSION$1 = environmentV8Version;

var IS_CONCAT_SPREADABLE = wellKnownSymbol$E('isConcatSpreadable');

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION$1 >= 51 || !fails$1h(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var isConcatSpreadable = function (O) {
  if (!isObject$C(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray$8(O);
};

var FORCED$E = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport$4('concat');

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$$5p({ target: 'Array', proto: true, arity: 1, forced: FORCED$E }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    var O = toObject$y(this);
    var A = arraySpeciesCreate$3(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = lengthOfArrayLike$w(E);
        doesNotExceedSafeInteger$6(n + len);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty$a(A, n, E[k]);
      } else {
        doesNotExceedSafeInteger$6(n + 1);
        createProperty$a(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var tryToString$2 = tryToString$7;

var $TypeError$C = TypeError;

var deletePropertyOrThrow$4 = function (O, P) {
  if (!delete O[P]) throw new $TypeError$C('Cannot delete property ' + tryToString$2(P) + ' of ' + tryToString$2(O));
};

var toObject$x = toObject$E;
var toAbsoluteIndex$8 = toAbsoluteIndex$a;
var lengthOfArrayLike$v = lengthOfArrayLike$B;
var deletePropertyOrThrow$3 = deletePropertyOrThrow$4;

var min$d = Math.min;

// `Array.prototype.copyWithin` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
// eslint-disable-next-line es/no-array-prototype-copywithin -- safe
var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject$x(this);
  var len = lengthOfArrayLike$v(O);
  var to = toAbsoluteIndex$8(target, len);
  var from = toAbsoluteIndex$8(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = min$d((end === undefined ? len : toAbsoluteIndex$8(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else deletePropertyOrThrow$3(O, to);
    to += inc;
    from += inc;
  } return O;
};

var $$5o = _export;
var copyWithin = arrayCopyWithin;
var addToUnscopables$l = addToUnscopables$n;

// `Array.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
$$5o({ target: 'Array', proto: true }, {
  copyWithin: copyWithin
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$l('copyWithin');

var fails$1g = fails$1z;

var arrayMethodIsStrict$b = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails$1g(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};

var $$5n = _export;
var $every$2 = arrayIteration.every;
var arrayMethodIsStrict$a = arrayMethodIsStrict$b;

var STRICT_METHOD$4 = arrayMethodIsStrict$a('every');

// `Array.prototype.every` method
// https://tc39.es/ecma262/#sec-array.prototype.every
$$5n({ target: 'Array', proto: true, forced: !STRICT_METHOD$4 }, {
  every: function every(callbackfn /* , thisArg */) {
    return $every$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var toObject$w = toObject$E;
var toAbsoluteIndex$7 = toAbsoluteIndex$a;
var lengthOfArrayLike$u = lengthOfArrayLike$B;

// `Array.prototype.fill` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.fill
var arrayFill$1 = function fill(value /* , start = 0, end = @length */) {
  var O = toObject$w(this);
  var length = lengthOfArrayLike$u(O);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex$7(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex$7(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

var $$5m = _export;
var fill$1 = arrayFill$1;
var addToUnscopables$k = addToUnscopables$n;

// `Array.prototype.fill` method
// https://tc39.es/ecma262/#sec-array.prototype.fill
$$5m({ target: 'Array', proto: true }, {
  fill: fill$1
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$k('fill');

var $$5l = _export;
var $filter$1 = arrayIteration.filter;
var arrayMethodHasSpeciesSupport$3 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport$3('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$$5l({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$5k = _export;
var $find$2 = arrayIteration.find;
var addToUnscopables$j = addToUnscopables$n;

var FIND = 'find';
var SKIPS_HOLES$1 = true;

// Shouldn't skip holes
// eslint-disable-next-line es/no-array-prototype-find -- testing
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES$1 = false; });

// `Array.prototype.find` method
// https://tc39.es/ecma262/#sec-array.prototype.find
$$5k({ target: 'Array', proto: true, forced: SKIPS_HOLES$1 }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$j(FIND);

var $$5j = _export;
var $findIndex$1 = arrayIteration.findIndex;
var addToUnscopables$i = addToUnscopables$n;

var FIND_INDEX = 'findIndex';
var SKIPS_HOLES = true;

// Shouldn't skip holes
// eslint-disable-next-line es/no-array-prototype-findindex -- testing
if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

// `Array.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findindex
$$5j({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $findIndex$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$i(FIND_INDEX);

var bind$s = functionBindContext;
var IndexedObject$5 = indexedObject;
var toObject$v = toObject$E;
var lengthOfArrayLike$t = lengthOfArrayLike$B;

// `Array.prototype.{ findLast, findLastIndex }` methods implementation
var createMethod$6 = function (TYPE) {
  var IS_FIND_LAST_INDEX = TYPE === 1;
  return function ($this, callbackfn, that) {
    var O = toObject$v($this);
    var self = IndexedObject$5(O);
    var index = lengthOfArrayLike$t(self);
    var boundFunction = bind$s(callbackfn, that);
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

var arrayIterationFromLast = {
  // `Array.prototype.findLast` method
  // https://github.com/tc39/proposal-array-find-from-last
  findLast: createMethod$6(0),
  // `Array.prototype.findLastIndex` method
  // https://github.com/tc39/proposal-array-find-from-last
  findLastIndex: createMethod$6(1)
};

var $$5i = _export;
var $findLast$1 = arrayIterationFromLast.findLast;
var addToUnscopables$h = addToUnscopables$n;

// `Array.prototype.findLast` method
// https://tc39.es/ecma262/#sec-array.prototype.findlast
$$5i({ target: 'Array', proto: true }, {
  findLast: function findLast(callbackfn /* , that = undefined */) {
    return $findLast$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$h('findLast');

var $$5h = _export;
var $findLastIndex$1 = arrayIterationFromLast.findLastIndex;
var addToUnscopables$g = addToUnscopables$n;

// `Array.prototype.findLastIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findlastindex
$$5h({ target: 'Array', proto: true }, {
  findLastIndex: function findLastIndex(callbackfn /* , that = undefined */) {
    return $findLastIndex$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$g('findLastIndex');

var isArray$7 = isArray$b;
var lengthOfArrayLike$s = lengthOfArrayLike$B;
var doesNotExceedSafeInteger$5 = doesNotExceedSafeInteger$7;
var bind$r = functionBindContext;

// `FlattenIntoArray` abstract operation
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var flattenIntoArray$2 = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? bind$r(mapper, thisArg) : false;
  var element, elementLen;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

      if (depth > 0 && isArray$7(element)) {
        elementLen = lengthOfArrayLike$s(element);
        targetIndex = flattenIntoArray$2(target, original, element, elementLen, targetIndex, depth - 1) - 1;
      } else {
        doesNotExceedSafeInteger$5(targetIndex + 1);
        target[targetIndex] = element;
      }

      targetIndex++;
    }
    sourceIndex++;
  }
  return targetIndex;
};

var flattenIntoArray_1 = flattenIntoArray$2;

var $$5g = _export;
var flattenIntoArray$1 = flattenIntoArray_1;
var toObject$u = toObject$E;
var lengthOfArrayLike$r = lengthOfArrayLike$B;
var toIntegerOrInfinity$l = toIntegerOrInfinity$p;
var arraySpeciesCreate$2 = arraySpeciesCreate$5;

// `Array.prototype.flat` method
// https://tc39.es/ecma262/#sec-array.prototype.flat
$$5g({ target: 'Array', proto: true }, {
  flat: function flat(/* depthArg = 1 */) {
    var depthArg = arguments.length ? arguments[0] : undefined;
    var O = toObject$u(this);
    var sourceLen = lengthOfArrayLike$r(O);
    var A = arraySpeciesCreate$2(O, 0);
    A.length = flattenIntoArray$1(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toIntegerOrInfinity$l(depthArg));
    return A;
  }
});

var $$5f = _export;
var flattenIntoArray = flattenIntoArray_1;
var aCallable$I = aCallable$N;
var toObject$t = toObject$E;
var lengthOfArrayLike$q = lengthOfArrayLike$B;
var arraySpeciesCreate$1 = arraySpeciesCreate$5;

// `Array.prototype.flatMap` method
// https://tc39.es/ecma262/#sec-array.prototype.flatmap
$$5f({ target: 'Array', proto: true }, {
  flatMap: function flatMap(callbackfn /* , thisArg */) {
    var O = toObject$t(this);
    var sourceLen = lengthOfArrayLike$q(O);
    var A;
    aCallable$I(callbackfn);
    A = arraySpeciesCreate$1(O, 0);
    A.length = flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return A;
  }
});

var $forEach$2 = arrayIteration.forEach;
var arrayMethodIsStrict$9 = arrayMethodIsStrict$b;

var STRICT_METHOD$3 = arrayMethodIsStrict$9('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = !STRICT_METHOD$3 ? function forEach(callbackfn /* , thisArg */) {
  return $forEach$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
} : [].forEach;

var $$5e = _export;
var forEach$6 = arrayForEach;

// `Array.prototype.forEach` method
// https://tc39.es/ecma262/#sec-array.prototype.foreach
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
$$5e({ target: 'Array', proto: true, forced: [].forEach !== forEach$6 }, {
  forEach: forEach$6
});

var anObject$17 = anObject$1h;
var iteratorClose$6 = iteratorClose$8;

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing$3 = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject$17(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose$6(iterator, 'throw', error);
  }
};

var bind$q = functionBindContext;
var call$16 = functionCall;
var toObject$s = toObject$E;
var callWithSafeIterationClosing$2 = callWithSafeIterationClosing$3;
var isArrayIteratorMethod$1 = isArrayIteratorMethod$3;
var isConstructor$8 = isConstructor$a;
var lengthOfArrayLike$p = lengthOfArrayLike$B;
var createProperty$9 = createProperty$b;
var getIterator$5 = getIterator$7;
var getIteratorMethod$5 = getIteratorMethod$8;

var $Array$b = Array;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
var arrayFrom$1 = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject$s(arrayLike);
  var IS_CONSTRUCTOR = isConstructor$8(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  if (mapping) mapfn = bind$q(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
  var iteratorMethod = getIteratorMethod$5(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod && !(this === $Array$b && isArrayIteratorMethod$1(iteratorMethod))) {
    result = IS_CONSTRUCTOR ? new this() : [];
    iterator = getIterator$5(O, iteratorMethod);
    next = iterator.next;
    for (;!(step = call$16(next, iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing$2(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty$9(result, index, value);
    }
  } else {
    length = lengthOfArrayLike$p(O);
    result = IS_CONSTRUCTOR ? new this(length) : $Array$b(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty$9(result, index, value);
    }
  }
  result.length = index;
  return result;
};

var wellKnownSymbol$D = wellKnownSymbol$S;

var ITERATOR$a = wellKnownSymbol$D('iterator');
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
  iteratorWithReturn[ITERATOR$a] = function () {
    return this;
  };
  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration$4 = function (exec, SKIP_CLOSING) {
  try {
    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  } catch (error) { return false; } // workaround of old WebKit + `eval` bug
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$a] = function () {
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

var $$5d = _export;
var from = arrayFrom$1;
var checkCorrectnessOfIteration$3 = checkCorrectnessOfIteration$4;

var INCORRECT_ITERATION = !checkCorrectnessOfIteration$3(function (iterable) {
  // eslint-disable-next-line es/no-array-from -- required for testing
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
$$5d({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from
});

var $$5c = _export;
var $includes$1 = arrayIncludes.includes;
var fails$1f = fails$1z;
var addToUnscopables$f = addToUnscopables$n;

// FF99+ bug
var BROKEN_ON_SPARSE = fails$1f(function () {
  // eslint-disable-next-line es/no-array-prototype-includes -- detection
  return !Array(1).includes();
});

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$$5c({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes$1(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$f('includes');

/* eslint-disable es/no-array-prototype-indexof -- required for testing */
var $$5b = _export;
var uncurryThis$1E = functionUncurryThisClause;
var $indexOf$1 = arrayIncludes.indexOf;
var arrayMethodIsStrict$8 = arrayMethodIsStrict$b;

var nativeIndexOf = uncurryThis$1E([].indexOf);

var NEGATIVE_ZERO$1 = !!nativeIndexOf && 1 / nativeIndexOf([1], 1, -0) < 0;
var FORCED$D = NEGATIVE_ZERO$1 || !arrayMethodIsStrict$8('indexOf');

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
$$5b({ target: 'Array', proto: true, forced: FORCED$D }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
    return NEGATIVE_ZERO$1
      // convert -0 to +0
      ? nativeIndexOf(this, searchElement, fromIndex) || 0
      : $indexOf$1(this, searchElement, fromIndex);
  }
});

var $$5a = _export;
var isArray$6 = isArray$b;

// `Array.isArray` method
// https://tc39.es/ecma262/#sec-array.isarray
$$5a({ target: 'Array', stat: true }, {
  isArray: isArray$6
});

var fails$1e = fails$1z;
var isCallable$q = isCallable$I;
var isObject$B = isObject$N;
var getPrototypeOf$f = objectGetPrototypeOf$2;
var defineBuiltIn$p = defineBuiltIn$u;
var wellKnownSymbol$C = wellKnownSymbol$S;

var ITERATOR$9 = wellKnownSymbol$C('iterator');
var BUGGY_SAFARI_ITERATORS$1 = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype$6, PrototypeOfArrayIteratorPrototype, arrayIterator$1;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator$1 = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator$1)) BUGGY_SAFARI_ITERATORS$1 = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf$f(getPrototypeOf$f(arrayIterator$1));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$6 = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = !isObject$B(IteratorPrototype$6) || fails$1e(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype$6[ITERATOR$9].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$6 = {};

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable$q(IteratorPrototype$6[ITERATOR$9])) {
  defineBuiltIn$p(IteratorPrototype$6, ITERATOR$9, function () {
    return this;
  });
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype$6,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
};

var IteratorPrototype$5 = iteratorsCore.IteratorPrototype;
var create$g = objectCreate$1;
var createPropertyDescriptor$6 = createPropertyDescriptor$d;
var setToStringTag$b = setToStringTag$e;
var Iterators$3 = iterators;

var returnThis$1 = function () { return this; };

var iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create$g(IteratorPrototype$5, { next: createPropertyDescriptor$6(+!ENUMERABLE_NEXT, next) });
  setToStringTag$b(IteratorConstructor, TO_STRING_TAG, false);
  Iterators$3[TO_STRING_TAG] = returnThis$1;
  return IteratorConstructor;
};

var $$59 = _export;
var call$15 = functionCall;
var FunctionName$1 = functionName;
var isCallable$p = isCallable$I;
var createIteratorConstructor$6 = iteratorCreateConstructor;
var getPrototypeOf$e = objectGetPrototypeOf$2;
var setPrototypeOf$7 = objectSetPrototypeOf$1;
var setToStringTag$a = setToStringTag$e;
var createNonEnumerableProperty$c = createNonEnumerableProperty$j;
var defineBuiltIn$o = defineBuiltIn$u;
var wellKnownSymbol$B = wellKnownSymbol$S;
var Iterators$2 = iterators;
var IteratorsCore = iteratorsCore;

var PROPER_FUNCTION_NAME$3 = FunctionName$1.PROPER;
var CONFIGURABLE_FUNCTION_NAME$1 = FunctionName$1.CONFIGURABLE;
var IteratorPrototype$4 = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$8 = wellKnownSymbol$B('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

var iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor$6(IteratorConstructor, NAME, next);

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
  var nativeIterator = IterablePrototype[ITERATOR$8]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf$e(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (getPrototypeOf$e(CurrentIteratorPrototype) !== IteratorPrototype$4) {
        if (setPrototypeOf$7) {
          setPrototypeOf$7(CurrentIteratorPrototype, IteratorPrototype$4);
        } else if (!isCallable$p(CurrentIteratorPrototype[ITERATOR$8])) {
          defineBuiltIn$o(CurrentIteratorPrototype, ITERATOR$8, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag$a(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME$3 && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if (CONFIGURABLE_FUNCTION_NAME$1) {
      createNonEnumerableProperty$c(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return call$15(nativeIterator, this); };
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
        defineBuiltIn$o(IterablePrototype, KEY, methods[KEY]);
      }
    } else $$59({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if (IterablePrototype[ITERATOR$8] !== defaultIterator) {
    defineBuiltIn$o(IterablePrototype, ITERATOR$8, defaultIterator, { name: DEFAULT });
  }
  Iterators$2[NAME] = defaultIterator;

  return methods;
};

// `CreateIterResultObject` abstract operation
// https://tc39.es/ecma262/#sec-createiterresultobject
var createIterResultObject$h = function (value, done) {
  return { value: value, done: done };
};

var toIndexedObject$d = toIndexedObject$k;
var addToUnscopables$e = addToUnscopables$n;
var Iterators$1 = iterators;
var InternalStateModule$l = internalState;
var defineProperty$b = objectDefineProperty.f;
var defineIterator$2 = iteratorDefine;
var createIterResultObject$g = createIterResultObject$h;
var DESCRIPTORS$J = descriptors;

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$l = InternalStateModule$l.set;
var getInternalState$e = InternalStateModule$l.getterFor(ARRAY_ITERATOR);

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
var es_array_iterator = defineIterator$2(Array, 'Array', function (iterated, kind) {
  setInternalState$l(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject$d(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$e(this);
  var target = state.target;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = null;
    return createIterResultObject$g(undefined, true);
  }
  switch (state.kind) {
    case 'keys': return createIterResultObject$g(index, false);
    case 'values': return createIterResultObject$g(target[index], false);
  } return createIterResultObject$g([index, target[index]], false);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
var values = Iterators$1.Arguments = Iterators$1.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$e('keys');
addToUnscopables$e('values');
addToUnscopables$e('entries');

// V8 ~ Chrome 45- bug
if (DESCRIPTORS$J && values.name !== 'values') try {
  defineProperty$b(values, 'name', { value: 'values' });
} catch (error) { /* empty */ }

var $$58 = _export;
var uncurryThis$1D = functionUncurryThis;
var IndexedObject$4 = indexedObject;
var toIndexedObject$c = toIndexedObject$k;
var arrayMethodIsStrict$7 = arrayMethodIsStrict$b;

var nativeJoin = uncurryThis$1D([].join);

var ES3_STRINGS = IndexedObject$4 !== Object;
var FORCED$C = ES3_STRINGS || !arrayMethodIsStrict$7('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
$$58({ target: 'Array', proto: true, forced: FORCED$C }, {
  join: function join(separator) {
    return nativeJoin(toIndexedObject$c(this), separator === undefined ? ',' : separator);
  }
});

/* eslint-disable es/no-array-prototype-lastindexof -- safe */
var apply$a = functionApply$1;
var toIndexedObject$b = toIndexedObject$k;
var toIntegerOrInfinity$k = toIntegerOrInfinity$p;
var lengthOfArrayLike$o = lengthOfArrayLike$B;
var arrayMethodIsStrict$6 = arrayMethodIsStrict$b;

var min$c = Math.min;
var $lastIndexOf$1 = [].lastIndexOf;
var NEGATIVE_ZERO = !!$lastIndexOf$1 && 1 / [1].lastIndexOf(1, -0) < 0;
var STRICT_METHOD$2 = arrayMethodIsStrict$6('lastIndexOf');
var FORCED$B = NEGATIVE_ZERO || !STRICT_METHOD$2;

// `Array.prototype.lastIndexOf` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
var arrayLastIndexOf = FORCED$B ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
  // convert -0 to +0
  if (NEGATIVE_ZERO) return apply$a($lastIndexOf$1, this, arguments) || 0;
  var O = toIndexedObject$b(this);
  var length = lengthOfArrayLike$o(O);
  if (length === 0) return -1;
  var index = length - 1;
  if (arguments.length > 1) index = min$c(index, toIntegerOrInfinity$k(arguments[1]));
  if (index < 0) index = length + index;
  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
  return -1;
} : $lastIndexOf$1;

var $$57 = _export;
var lastIndexOf = arrayLastIndexOf;

// `Array.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
// eslint-disable-next-line es/no-array-prototype-lastindexof -- required for testing
$$57({ target: 'Array', proto: true, forced: lastIndexOf !== [].lastIndexOf }, {
  lastIndexOf: lastIndexOf
});

var $$56 = _export;
var $map$1 = arrayIteration.map;
var arrayMethodHasSpeciesSupport$2 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport$2('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
$$56({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$55 = _export;
var fails$1d = fails$1z;
var isConstructor$7 = isConstructor$a;
var createProperty$8 = createProperty$b;

var $Array$a = Array;

var ISNT_GENERIC = fails$1d(function () {
  function F() { /* empty */ }
  // eslint-disable-next-line es/no-array-of -- safe
  return !($Array$a.of.call(F) instanceof F);
});

// `Array.of` method
// https://tc39.es/ecma262/#sec-array.of
// WebKit Array.of isn't generic
$$55({ target: 'Array', stat: true, forced: ISNT_GENERIC }, {
  of: function of(/* ...args */) {
    var index = 0;
    var argumentsLength = arguments.length;
    var result = new (isConstructor$7(this) ? this : $Array$a)(argumentsLength);
    while (argumentsLength > index) createProperty$8(result, index, arguments[index++]);
    result.length = argumentsLength;
    return result;
  }
});

var DESCRIPTORS$I = descriptors;
var isArray$5 = isArray$b;

var $TypeError$B = TypeError;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$b = Object.getOwnPropertyDescriptor;

// Safari < 13 does not throw an error in this case
var SILENT_ON_NON_WRITABLE_LENGTH_SET = DESCRIPTORS$I && !function () {
  // makes no sense without proper strict mode support
  if (this !== undefined) return true;
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).length = 1;
  } catch (error) {
    return error instanceof TypeError;
  }
}();

var arraySetLength = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function (O, length) {
  if (isArray$5(O) && !getOwnPropertyDescriptor$b(O, 'length').writable) {
    throw new $TypeError$B('Cannot set read only .length');
  } return O.length = length;
} : function (O, length) {
  return O.length = length;
};

var $$54 = _export;
var toObject$r = toObject$E;
var lengthOfArrayLike$n = lengthOfArrayLike$B;
var setArrayLength$2 = arraySetLength;
var doesNotExceedSafeInteger$4 = doesNotExceedSafeInteger$7;
var fails$1c = fails$1z;

var INCORRECT_TO_LENGTH = fails$1c(function () {
  return [].push.call({ length: 0x100000000 }, 1) !== 4294967297;
});

// V8 <= 121 and Safari <= 15.4; FF < 23 throws InternalError
// https://bugs.chromium.org/p/v8/issues/detail?id=12681
var properErrorOnNonWritableLength$1 = function () {
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).push();
  } catch (error) {
    return error instanceof TypeError;
  }
};

var FORCED$A = INCORRECT_TO_LENGTH || !properErrorOnNonWritableLength$1();

// `Array.prototype.push` method
// https://tc39.es/ecma262/#sec-array.prototype.push
$$54({ target: 'Array', proto: true, arity: 1, forced: FORCED$A }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  push: function push(item) {
    var O = toObject$r(this);
    var len = lengthOfArrayLike$n(O);
    var argCount = arguments.length;
    doesNotExceedSafeInteger$4(len + argCount);
    for (var i = 0; i < argCount; i++) {
      O[len] = arguments[i];
      len++;
    }
    setArrayLength$2(O, len);
    return len;
  }
});

var aCallable$H = aCallable$N;
var toObject$q = toObject$E;
var IndexedObject$3 = indexedObject;
var lengthOfArrayLike$m = lengthOfArrayLike$B;

var $TypeError$A = TypeError;

var REDUCE_EMPTY = 'Reduce of empty array with no initial value';

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod$5 = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    var O = toObject$q(that);
    var self = IndexedObject$3(O);
    var length = lengthOfArrayLike$m(O);
    aCallable$H(callbackfn);
    if (length === 0 && argumentsLength < 2) throw new $TypeError$A(REDUCE_EMPTY);
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
        throw new $TypeError$A(REDUCE_EMPTY);
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

var arrayReduce = {
  // `Array.prototype.reduce` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduce
  left: createMethod$5(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod$5(true)
};

/* global Bun, Deno -- detection */
var globalThis$15 = globalThis_1;
var userAgent$6 = environmentUserAgent;
var classof$j = classofRaw$2;

var userAgentStartsWith = function (string) {
  return userAgent$6.slice(0, string.length) === string;
};

var environment = (function () {
  if (userAgentStartsWith('Bun/')) return 'BUN';
  if (userAgentStartsWith('Cloudflare-Workers')) return 'CLOUDFLARE';
  if (userAgentStartsWith('Deno/')) return 'DENO';
  if (userAgentStartsWith('Node.js/')) return 'NODE';
  if (globalThis$15.Bun && typeof Bun.version == 'string') return 'BUN';
  if (globalThis$15.Deno && typeof Deno.version == 'object') return 'DENO';
  if (classof$j(globalThis$15.process) === 'process') return 'NODE';
  if (globalThis$15.window && globalThis$15.document) return 'BROWSER';
  return 'REST';
})();

var ENVIRONMENT$3 = environment;

var environmentIsNode = ENVIRONMENT$3 === 'NODE';

var $$53 = _export;
var $reduce$1 = arrayReduce.left;
var arrayMethodIsStrict$5 = arrayMethodIsStrict$b;
var CHROME_VERSION$1 = environmentV8Version;
var IS_NODE$5 = environmentIsNode;

// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG$1 = !IS_NODE$5 && CHROME_VERSION$1 > 79 && CHROME_VERSION$1 < 83;
var FORCED$z = CHROME_BUG$1 || !arrayMethodIsStrict$5('reduce');

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
$$53({ target: 'Array', proto: true, forced: FORCED$z }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var length = arguments.length;
    return $reduce$1(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
  }
});

var $$52 = _export;
var $reduceRight$1 = arrayReduce.right;
var arrayMethodIsStrict$4 = arrayMethodIsStrict$b;
var CHROME_VERSION = environmentV8Version;
var IS_NODE$4 = environmentIsNode;

// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !IS_NODE$4 && CHROME_VERSION > 79 && CHROME_VERSION < 83;
var FORCED$y = CHROME_BUG || !arrayMethodIsStrict$4('reduceRight');

// `Array.prototype.reduceRight` method
// https://tc39.es/ecma262/#sec-array.prototype.reduceright
$$52({ target: 'Array', proto: true, forced: FORCED$y }, {
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return $reduceRight$1(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$51 = _export;
var uncurryThis$1C = functionUncurryThis;
var isArray$4 = isArray$b;

var nativeReverse = uncurryThis$1C([].reverse);
var test$1 = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.es/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
$$51({ target: 'Array', proto: true, forced: String(test$1) === String(test$1.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign -- dirty hack
    if (isArray$4(this)) this.length = this.length;
    return nativeReverse(this);
  }
});

var $$50 = _export;
var isArray$3 = isArray$b;
var isConstructor$6 = isConstructor$a;
var isObject$A = isObject$N;
var toAbsoluteIndex$6 = toAbsoluteIndex$a;
var lengthOfArrayLike$l = lengthOfArrayLike$B;
var toIndexedObject$a = toIndexedObject$k;
var createProperty$7 = createProperty$b;
var wellKnownSymbol$A = wellKnownSymbol$S;
var arrayMethodHasSpeciesSupport$1 = arrayMethodHasSpeciesSupport$5;
var nativeSlice = arraySlice$a;

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport$1('slice');

var SPECIES$4 = wellKnownSymbol$A('species');
var $Array$9 = Array;
var max$8 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$$50({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
  slice: function slice(start, end) {
    var O = toIndexedObject$a(this);
    var length = lengthOfArrayLike$l(O);
    var k = toAbsoluteIndex$6(start, length);
    var fin = toAbsoluteIndex$6(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray$3(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (isConstructor$6(Constructor) && (Constructor === $Array$9 || isArray$3(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject$A(Constructor)) {
        Constructor = Constructor[SPECIES$4];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === $Array$9 || Constructor === undefined) {
        return nativeSlice(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? $Array$9 : Constructor)(max$8(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty$7(result, n, O[k]);
    result.length = n;
    return result;
  }
});

var $$4$ = _export;
var $some$2 = arrayIteration.some;
var arrayMethodIsStrict$3 = arrayMethodIsStrict$b;

var STRICT_METHOD$1 = arrayMethodIsStrict$3('some');

// `Array.prototype.some` method
// https://tc39.es/ecma262/#sec-array.prototype.some
$$4$({ target: 'Array', proto: true, forced: !STRICT_METHOD$1 }, {
  some: function some(callbackfn /* , thisArg */) {
    return $some$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var arraySlice$7 = arraySlice$a;

var floor$9 = Math.floor;

var sort$2 = function (array, comparefn) {
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
    var middle = floor$9(length / 2);
    var left = sort$2(arraySlice$7(array, 0, middle), comparefn);
    var right = sort$2(arraySlice$7(array, middle), comparefn);
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

var arraySort$1 = sort$2;

var userAgent$5 = environmentUserAgent;

var firefox = userAgent$5.match(/firefox\/(\d+)/i);

var environmentFfVersion = !!firefox && +firefox[1];

var UA = environmentUserAgent;

var environmentIsIeOrEdge = /MSIE|Trident/.test(UA);

var userAgent$4 = environmentUserAgent;

var webkit = userAgent$4.match(/AppleWebKit\/(\d+)\./);

var environmentWebkitVersion = !!webkit && +webkit[1];

var $$4_ = _export;
var uncurryThis$1B = functionUncurryThis;
var aCallable$G = aCallable$N;
var toObject$p = toObject$E;
var lengthOfArrayLike$k = lengthOfArrayLike$B;
var deletePropertyOrThrow$2 = deletePropertyOrThrow$4;
var toString$E = toString$J;
var fails$1b = fails$1z;
var internalSort$1 = arraySort$1;
var arrayMethodIsStrict$2 = arrayMethodIsStrict$b;
var FF$1 = environmentFfVersion;
var IE_OR_EDGE$1 = environmentIsIeOrEdge;
var V8$2 = environmentV8Version;
var WEBKIT$2 = environmentWebkitVersion;

var test = [];
var nativeSort$1 = uncurryThis$1B(test.sort);
var push$n = uncurryThis$1B(test.push);

// IE8-
var FAILS_ON_UNDEFINED = fails$1b(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails$1b(function () {
  test.sort(null);
});
// Old WebKit
var STRICT_METHOD = arrayMethodIsStrict$2('sort');

var STABLE_SORT$1 = !fails$1b(function () {
  // feature detection can be too slow, so check engines versions
  if (V8$2) return V8$2 < 70;
  if (FF$1 && FF$1 > 3) return;
  if (IE_OR_EDGE$1) return true;
  if (WEBKIT$2) return WEBKIT$2 < 603;

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

var FORCED$x = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD || !STABLE_SORT$1;

var getSortCompare$1 = function (comparefn) {
  return function (x, y) {
    if (y === undefined) return -1;
    if (x === undefined) return 1;
    if (comparefn !== undefined) return +comparefn(x, y) || 0;
    return toString$E(x) > toString$E(y) ? 1 : -1;
  };
};

// `Array.prototype.sort` method
// https://tc39.es/ecma262/#sec-array.prototype.sort
$$4_({ target: 'Array', proto: true, forced: FORCED$x }, {
  sort: function sort(comparefn) {
    if (comparefn !== undefined) aCallable$G(comparefn);

    var array = toObject$p(this);

    if (STABLE_SORT$1) return comparefn === undefined ? nativeSort$1(array) : nativeSort$1(array, comparefn);

    var items = [];
    var arrayLength = lengthOfArrayLike$k(array);
    var itemsLength, index;

    for (index = 0; index < arrayLength; index++) {
      if (index in array) push$n(items, array[index]);
    }

    internalSort$1(items, getSortCompare$1(comparefn));

    itemsLength = lengthOfArrayLike$k(items);
    index = 0;

    while (index < itemsLength) array[index] = items[index++];
    while (index < arrayLength) deletePropertyOrThrow$2(array, index++);

    return array;
  }
});

var getBuiltIn$D = getBuiltIn$O;
var defineBuiltInAccessor$m = defineBuiltInAccessor$p;
var wellKnownSymbol$z = wellKnownSymbol$S;
var DESCRIPTORS$H = descriptors;

var SPECIES$3 = wellKnownSymbol$z('species');

var setSpecies$7 = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn$D(CONSTRUCTOR_NAME);

  if (DESCRIPTORS$H && Constructor && !Constructor[SPECIES$3]) {
    defineBuiltInAccessor$m(Constructor, SPECIES$3, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var setSpecies$6 = setSpecies$7;

// `Array[@@species]` getter
// https://tc39.es/ecma262/#sec-get-array-@@species
setSpecies$6('Array');

var $$4Z = _export;
var toObject$o = toObject$E;
var toAbsoluteIndex$5 = toAbsoluteIndex$a;
var toIntegerOrInfinity$j = toIntegerOrInfinity$p;
var lengthOfArrayLike$j = lengthOfArrayLike$B;
var setArrayLength$1 = arraySetLength;
var doesNotExceedSafeInteger$3 = doesNotExceedSafeInteger$7;
var arraySpeciesCreate = arraySpeciesCreate$5;
var createProperty$6 = createProperty$b;
var deletePropertyOrThrow$1 = deletePropertyOrThrow$4;
var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

var max$7 = Math.max;
var min$b = Math.min;

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
// with adding support of @@species
$$4Z({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject$o(this);
    var len = lengthOfArrayLike$j(O);
    var actualStart = toAbsoluteIndex$5(start, len);
    var argumentsLength = arguments.length;
    var insertCount, actualDeleteCount, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min$b(max$7(toIntegerOrInfinity$j(deleteCount), 0), len - actualStart);
    }
    doesNotExceedSafeInteger$3(len + insertCount - actualDeleteCount);
    A = arraySpeciesCreate(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty$6(A, k, O[from]);
    }
    A.length = actualDeleteCount;
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (from in O) O[to] = O[from];
        else deletePropertyOrThrow$1(O, to);
      }
      for (k = len; k > len - actualDeleteCount + insertCount; k--) deletePropertyOrThrow$1(O, k - 1);
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (from in O) O[to] = O[from];
        else deletePropertyOrThrow$1(O, to);
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    setArrayLength$1(O, len - actualDeleteCount + insertCount);
    return A;
  }
});

var lengthOfArrayLike$i = lengthOfArrayLike$B;

// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.toReversed
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.toReversed
var arrayToReversed$2 = function (O, C) {
  var len = lengthOfArrayLike$i(O);
  var A = new C(len);
  var k = 0;
  for (; k < len; k++) A[k] = O[len - k - 1];
  return A;
};

var $$4Y = _export;
var arrayToReversed$1 = arrayToReversed$2;
var toIndexedObject$9 = toIndexedObject$k;
var addToUnscopables$d = addToUnscopables$n;

var $Array$8 = Array;

// `Array.prototype.toReversed` method
// https://tc39.es/ecma262/#sec-array.prototype.toreversed
$$4Y({ target: 'Array', proto: true }, {
  toReversed: function toReversed() {
    return arrayToReversed$1(toIndexedObject$9(this), $Array$8);
  }
});

addToUnscopables$d('toReversed');

var lengthOfArrayLike$h = lengthOfArrayLike$B;

var arrayFromConstructorAndList$8 = function (Constructor, list, $length) {
  var index = 0;
  var length = arguments.length > 2 ? $length : lengthOfArrayLike$h(list);
  var result = new Constructor(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var globalThis$14 = globalThis_1;

var getBuiltInPrototypeMethod$2 = function (CONSTRUCTOR, METHOD) {
  var Constructor = globalThis$14[CONSTRUCTOR];
  var Prototype = Constructor && Constructor.prototype;
  return Prototype && Prototype[METHOD];
};

var $$4X = _export;
var uncurryThis$1A = functionUncurryThis;
var aCallable$F = aCallable$N;
var toIndexedObject$8 = toIndexedObject$k;
var arrayFromConstructorAndList$7 = arrayFromConstructorAndList$8;
var getBuiltInPrototypeMethod$1 = getBuiltInPrototypeMethod$2;
var addToUnscopables$c = addToUnscopables$n;

var $Array$7 = Array;
var sort$1 = uncurryThis$1A(getBuiltInPrototypeMethod$1('Array', 'sort'));

// `Array.prototype.toSorted` method
// https://tc39.es/ecma262/#sec-array.prototype.tosorted
$$4X({ target: 'Array', proto: true }, {
  toSorted: function toSorted(compareFn) {
    if (compareFn !== undefined) aCallable$F(compareFn);
    var O = toIndexedObject$8(this);
    var A = arrayFromConstructorAndList$7($Array$7, O);
    return sort$1(A, compareFn);
  }
});

addToUnscopables$c('toSorted');

var $$4W = _export;
var addToUnscopables$b = addToUnscopables$n;
var doesNotExceedSafeInteger$2 = doesNotExceedSafeInteger$7;
var lengthOfArrayLike$g = lengthOfArrayLike$B;
var toAbsoluteIndex$4 = toAbsoluteIndex$a;
var toIndexedObject$7 = toIndexedObject$k;
var toIntegerOrInfinity$i = toIntegerOrInfinity$p;

var $Array$6 = Array;
var max$6 = Math.max;
var min$a = Math.min;

// `Array.prototype.toSpliced` method
// https://tc39.es/ecma262/#sec-array.prototype.tospliced
$$4W({ target: 'Array', proto: true }, {
  toSpliced: function toSpliced(start, deleteCount /* , ...items */) {
    var O = toIndexedObject$7(this);
    var len = lengthOfArrayLike$g(O);
    var actualStart = toAbsoluteIndex$4(start, len);
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
      actualDeleteCount = min$a(max$6(toIntegerOrInfinity$i(deleteCount), 0), len - actualStart);
    }
    newLen = doesNotExceedSafeInteger$2(len + insertCount - actualDeleteCount);
    A = $Array$6(newLen);

    for (; k < actualStart; k++) A[k] = O[k];
    for (; k < actualStart + insertCount; k++) A[k] = arguments[k - actualStart + 2];
    for (; k < newLen; k++) A[k] = O[k + actualDeleteCount - insertCount];

    return A;
  }
});

addToUnscopables$b('toSpliced');

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$a = addToUnscopables$n;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$a('flat');

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$9 = addToUnscopables$n;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$9('flatMap');

var $$4V = _export;
var toObject$n = toObject$E;
var lengthOfArrayLike$f = lengthOfArrayLike$B;
var setArrayLength = arraySetLength;
var deletePropertyOrThrow = deletePropertyOrThrow$4;
var doesNotExceedSafeInteger$1 = doesNotExceedSafeInteger$7;

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

var FORCED$w = INCORRECT_RESULT || !properErrorOnNonWritableLength();

// `Array.prototype.unshift` method
// https://tc39.es/ecma262/#sec-array.prototype.unshift
$$4V({ target: 'Array', proto: true, arity: 1, forced: FORCED$w }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  unshift: function unshift(item) {
    var O = toObject$n(this);
    var len = lengthOfArrayLike$f(O);
    var argCount = arguments.length;
    if (argCount) {
      doesNotExceedSafeInteger$1(len + argCount);
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

var lengthOfArrayLike$e = lengthOfArrayLike$B;
var toIntegerOrInfinity$h = toIntegerOrInfinity$p;

var $RangeError$e = RangeError;

// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.with
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.with
var arrayWith$2 = function (O, C, index, value) {
  var len = lengthOfArrayLike$e(O);
  var relativeIndex = toIntegerOrInfinity$h(index);
  var actualIndex = relativeIndex < 0 ? len + relativeIndex : relativeIndex;
  if (actualIndex >= len || actualIndex < 0) throw new $RangeError$e('Incorrect index');
  var A = new C(len);
  var k = 0;
  for (; k < len; k++) A[k] = k === actualIndex ? value : O[k];
  return A;
};

var $$4U = _export;
var arrayWith$1 = arrayWith$2;
var toIndexedObject$6 = toIndexedObject$k;

var $Array$5 = Array;

// `Array.prototype.with` method
// https://tc39.es/ecma262/#sec-array.prototype.with
$$4U({ target: 'Array', proto: true }, {
  'with': function (index, value) {
    return arrayWith$1(toIndexedObject$6(this), $Array$5, index, value);
  }
});

// eslint-disable-next-line es/no-typed-arrays -- safe
var arrayBufferBasicDetection = typeof ArrayBuffer != 'undefined' && typeof DataView != 'undefined';

var defineBuiltIn$n = defineBuiltIn$u;

var defineBuiltIns$b = function (target, src, options) {
  for (var key in src) defineBuiltIn$n(target, key, src[key], options);
  return target;
};

var isPrototypeOf$9 = objectIsPrototypeOf;

var $TypeError$z = TypeError;

var anInstance$f = function (it, Prototype) {
  if (isPrototypeOf$9(Prototype, it)) return it;
  throw new $TypeError$z('Incorrect invocation');
};

var toIntegerOrInfinity$g = toIntegerOrInfinity$p;
var toLength$b = toLength$d;

var $RangeError$d = RangeError;

// `ToIndex` abstract operation
// https://tc39.es/ecma262/#sec-toindex
var toIndex$5 = function (it) {
  if (it === undefined) return 0;
  var number = toIntegerOrInfinity$g(it);
  var length = toLength$b(number);
  if (number !== length) throw new $RangeError$d('Wrong length or index');
  return length;
};

// `Math.sign` method implementation
// https://tc39.es/ecma262/#sec-math.sign
// eslint-disable-next-line es/no-math-sign -- safe
var mathSign = Math.sign || function sign(x) {
  var n = +x;
  // eslint-disable-next-line no-self-compare -- NaN check
  return n === 0 || n !== n ? n : n < 0 ? -1 : 1;
};

var sign$2 = mathSign;

var abs$9 = Math.abs;

var EPSILON = 2.220446049250313e-16; // Number.EPSILON
var INVERSE_EPSILON = 1 / EPSILON;

var roundTiesToEven = function (n) {
  return n + INVERSE_EPSILON - INVERSE_EPSILON;
};

var mathFloatRound = function (x, FLOAT_EPSILON, FLOAT_MAX_VALUE, FLOAT_MIN_VALUE) {
  var n = +x;
  var absolute = abs$9(n);
  var s = sign$2(n);
  if (absolute < FLOAT_MIN_VALUE) return s * roundTiesToEven(absolute / FLOAT_MIN_VALUE / FLOAT_EPSILON) * FLOAT_MIN_VALUE * FLOAT_EPSILON;
  var a = (1 + FLOAT_EPSILON / EPSILON) * absolute;
  var result = a - (a - absolute);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (result > FLOAT_MAX_VALUE || result !== result) return s * Infinity;
  return s * result;
};

var floatRound$1 = mathFloatRound;

var FLOAT32_EPSILON = 1.1920928955078125e-7; // 2 ** -23;
var FLOAT32_MAX_VALUE = 3.4028234663852886e+38; // 2 ** 128 - 2 ** 104
var FLOAT32_MIN_VALUE = 1.1754943508222875e-38; // 2 ** -126;

// `Math.fround` method implementation
// https://tc39.es/ecma262/#sec-math.fround
// eslint-disable-next-line es/no-math-fround -- safe
var mathFround = Math.fround || function fround(x) {
  return floatRound$1(x, FLOAT32_EPSILON, FLOAT32_MAX_VALUE, FLOAT32_MIN_VALUE);
};

// IEEE754 conversions based on https://github.com/feross/ieee754
var $Array$4 = Array;
var abs$8 = Math.abs;
var pow$6 = Math.pow;
var floor$8 = Math.floor;
var log$8 = Math.log;
var LN2$2 = Math.LN2;

var pack = function (number, mantissaLength, bytes) {
  var buffer = $Array$4(bytes);
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var rt = mantissaLength === 23 ? pow$6(2, -24) - pow$6(2, -77) : 0;
  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
  var index = 0;
  var exponent, mantissa, c;
  number = abs$8(number);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (number !== number || number === Infinity) {
    // eslint-disable-next-line no-self-compare -- NaN check
    mantissa = number !== number ? 1 : 0;
    exponent = eMax;
  } else {
    exponent = floor$8(log$8(number) / LN2$2);
    c = pow$6(2, -exponent);
    if (number * c < 1) {
      exponent--;
      c *= 2;
    }
    if (exponent + eBias >= 1) {
      number += rt / c;
    } else {
      number += rt * pow$6(2, 1 - eBias);
    }
    if (number * c >= 2) {
      exponent++;
      c /= 2;
    }
    if (exponent + eBias >= eMax) {
      mantissa = 0;
      exponent = eMax;
    } else if (exponent + eBias >= 1) {
      mantissa = (number * c - 1) * pow$6(2, mantissaLength);
      exponent += eBias;
    } else {
      mantissa = number * pow$6(2, eBias - 1) * pow$6(2, mantissaLength);
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
    mantissa += pow$6(2, mantissaLength);
    exponent -= eBias;
  } return (sign ? -1 : 1) * mantissa * pow$6(2, exponent - mantissaLength);
};

var ieee754 = {
  pack: pack,
  unpack: unpack
};

var globalThis$13 = globalThis_1;
var uncurryThis$1z = functionUncurryThis;
var DESCRIPTORS$G = descriptors;
var NATIVE_ARRAY_BUFFER$2 = arrayBufferBasicDetection;
var FunctionName = functionName;
var createNonEnumerableProperty$b = createNonEnumerableProperty$j;
var defineBuiltInAccessor$l = defineBuiltInAccessor$p;
var defineBuiltIns$a = defineBuiltIns$b;
var fails$1a = fails$1z;
var anInstance$e = anInstance$f;
var toIntegerOrInfinity$f = toIntegerOrInfinity$p;
var toLength$a = toLength$d;
var toIndex$4 = toIndex$5;
var fround$2 = mathFround;
var IEEE754 = ieee754;
var getPrototypeOf$d = objectGetPrototypeOf$2;
var setPrototypeOf$6 = objectSetPrototypeOf$1;
var arrayFill = arrayFill$1;
var arraySlice$6 = arraySlice$a;
var inheritIfRequired$5 = inheritIfRequired$7;
var copyConstructorProperties$2 = copyConstructorProperties$7;
var setToStringTag$9 = setToStringTag$e;
var InternalStateModule$k = internalState;

var PROPER_FUNCTION_NAME$2 = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var ARRAY_BUFFER$1 = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var WRONG_LENGTH$1 = 'Wrong length';
var WRONG_INDEX = 'Wrong index';
var getInternalArrayBufferState = InternalStateModule$k.getterFor(ARRAY_BUFFER$1);
var getInternalDataViewState = InternalStateModule$k.getterFor(DATA_VIEW);
var setInternalState$k = InternalStateModule$k.set;
var NativeArrayBuffer$1 = globalThis$13[ARRAY_BUFFER$1];
var $ArrayBuffer$1 = NativeArrayBuffer$1;
var ArrayBufferPrototype$4 = $ArrayBuffer$1 && $ArrayBuffer$1[PROTOTYPE];
var $DataView = globalThis$13[DATA_VIEW];
var DataViewPrototype$2 = $DataView && $DataView[PROTOTYPE];
var ObjectPrototype$3 = Object.prototype;
var Array$3 = globalThis$13.Array;
var RangeError$3 = globalThis$13.RangeError;
var fill = uncurryThis$1z(arrayFill);
var reverse = uncurryThis$1z([].reverse);

var packIEEE754$1 = IEEE754.pack;
var unpackIEEE754$1 = IEEE754.unpack;

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
  return packIEEE754$1(fround$2(number), 23, 4);
};

var packFloat64 = function (number) {
  return packIEEE754$1(number, 52, 8);
};

var addGetter$2 = function (Constructor, key, getInternalState) {
  defineBuiltInAccessor$l(Constructor[PROTOTYPE], key, {
    configurable: true,
    get: function () {
      return getInternalState(this)[key];
    }
  });
};

var get$5 = function (view, count, index, isLittleEndian) {
  var store = getInternalDataViewState(view);
  var intIndex = toIndex$4(index);
  var boolIsLittleEndian = !!isLittleEndian;
  if (intIndex + count > store.byteLength) throw new RangeError$3(WRONG_INDEX);
  var bytes = store.bytes;
  var start = intIndex + store.byteOffset;
  var pack = arraySlice$6(bytes, start, start + count);
  return boolIsLittleEndian ? pack : reverse(pack);
};

var set$a = function (view, count, index, conversion, value, isLittleEndian) {
  var store = getInternalDataViewState(view);
  var intIndex = toIndex$4(index);
  var pack = conversion(+value);
  var boolIsLittleEndian = !!isLittleEndian;
  if (intIndex + count > store.byteLength) throw new RangeError$3(WRONG_INDEX);
  var bytes = store.bytes;
  var start = intIndex + store.byteOffset;
  for (var i = 0; i < count; i++) bytes[start + i] = pack[boolIsLittleEndian ? i : count - i - 1];
};

if (!NATIVE_ARRAY_BUFFER$2) {
  $ArrayBuffer$1 = function ArrayBuffer(length) {
    anInstance$e(this, ArrayBufferPrototype$4);
    var byteLength = toIndex$4(length);
    setInternalState$k(this, {
      type: ARRAY_BUFFER$1,
      bytes: fill(Array$3(byteLength), 0),
      byteLength: byteLength
    });
    if (!DESCRIPTORS$G) {
      this.byteLength = byteLength;
      this.detached = false;
    }
  };

  ArrayBufferPrototype$4 = $ArrayBuffer$1[PROTOTYPE];

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance$e(this, DataViewPrototype$2);
    anInstance$e(buffer, ArrayBufferPrototype$4);
    var bufferState = getInternalArrayBufferState(buffer);
    var bufferLength = bufferState.byteLength;
    var offset = toIntegerOrInfinity$f(byteOffset);
    if (offset < 0 || offset > bufferLength) throw new RangeError$3('Wrong offset');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength$a(byteLength);
    if (offset + byteLength > bufferLength) throw new RangeError$3(WRONG_LENGTH$1);
    setInternalState$k(this, {
      type: DATA_VIEW,
      buffer: buffer,
      byteLength: byteLength,
      byteOffset: offset,
      bytes: bufferState.bytes
    });
    if (!DESCRIPTORS$G) {
      this.buffer = buffer;
      this.byteLength = byteLength;
      this.byteOffset = offset;
    }
  };

  DataViewPrototype$2 = $DataView[PROTOTYPE];

  if (DESCRIPTORS$G) {
    addGetter$2($ArrayBuffer$1, 'byteLength', getInternalArrayBufferState);
    addGetter$2($DataView, 'buffer', getInternalDataViewState);
    addGetter$2($DataView, 'byteLength', getInternalDataViewState);
    addGetter$2($DataView, 'byteOffset', getInternalDataViewState);
  }

  defineBuiltIns$a(DataViewPrototype$2, {
    getInt8: function getInt8(byteOffset) {
      return get$5(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get$5(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /* , littleEndian */) {
      var bytes = get$5(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : false);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /* , littleEndian */) {
      var bytes = get$5(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : false);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$5(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false));
    },
    getUint32: function getUint32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$5(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false)) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
      return unpackIEEE754$1(get$5(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false), 23);
    },
    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
      return unpackIEEE754$1(get$5(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : false), 52);
    },
    setInt8: function setInt8(byteOffset, value) {
      set$a(this, 1, byteOffset, packInt8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set$a(this, 1, byteOffset, packInt8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set$a(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : false);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set$a(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : false);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set$a(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : false);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set$a(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : false);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set$a(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : false);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set$a(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : false);
    }
  });
} else {
  var INCORRECT_ARRAY_BUFFER_NAME = PROPER_FUNCTION_NAME$2 && NativeArrayBuffer$1.name !== ARRAY_BUFFER$1;
  /* eslint-disable no-new, sonar/inconsistent-function-call -- required for testing */
  if (!fails$1a(function () {
    NativeArrayBuffer$1(1);
  }) || !fails$1a(function () {
    new NativeArrayBuffer$1(-1);
  }) || fails$1a(function () {
    new NativeArrayBuffer$1();
    new NativeArrayBuffer$1(1.5);
    new NativeArrayBuffer$1(NaN);
    return NativeArrayBuffer$1.length !== 1 || INCORRECT_ARRAY_BUFFER_NAME && !CONFIGURABLE_FUNCTION_NAME;
  })) {
    /* eslint-enable no-new, sonar/inconsistent-function-call -- required for testing */
    $ArrayBuffer$1 = function ArrayBuffer(length) {
      anInstance$e(this, ArrayBufferPrototype$4);
      return inheritIfRequired$5(new NativeArrayBuffer$1(toIndex$4(length)), this, $ArrayBuffer$1);
    };

    $ArrayBuffer$1[PROTOTYPE] = ArrayBufferPrototype$4;

    ArrayBufferPrototype$4.constructor = $ArrayBuffer$1;

    copyConstructorProperties$2($ArrayBuffer$1, NativeArrayBuffer$1);
  } else if (INCORRECT_ARRAY_BUFFER_NAME && CONFIGURABLE_FUNCTION_NAME) {
    createNonEnumerableProperty$b(NativeArrayBuffer$1, 'name', ARRAY_BUFFER$1);
  }

  // WebKit bug - the same parent prototype for typed arrays and data view
  if (setPrototypeOf$6 && getPrototypeOf$d(DataViewPrototype$2) !== ObjectPrototype$3) {
    setPrototypeOf$6(DataViewPrototype$2, ObjectPrototype$3);
  }

  // iOS Safari 7.x bug
  var testView = new $DataView(new $ArrayBuffer$1(2));
  var $setInt8 = uncurryThis$1z(DataViewPrototype$2.setInt8);
  testView.setInt8(0, 2147483648);
  testView.setInt8(1, 2147483649);
  if (testView.getInt8(0) || !testView.getInt8(1)) defineBuiltIns$a(DataViewPrototype$2, {
    setInt8: function setInt8(byteOffset, value) {
      $setInt8(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      $setInt8(this, byteOffset, value << 24 >> 24);
    }
  }, { unsafe: true });
}

setToStringTag$9($ArrayBuffer$1, ARRAY_BUFFER$1);
setToStringTag$9($DataView, DATA_VIEW);

var arrayBuffer = {
  ArrayBuffer: $ArrayBuffer$1,
  DataView: $DataView
};

var $$4T = _export;
var globalThis$12 = globalThis_1;
var arrayBufferModule = arrayBuffer;
var setSpecies$5 = setSpecies$7;

var ARRAY_BUFFER = 'ArrayBuffer';
var ArrayBuffer$7 = arrayBufferModule[ARRAY_BUFFER];
var NativeArrayBuffer = globalThis$12[ARRAY_BUFFER];

// `ArrayBuffer` constructor
// https://tc39.es/ecma262/#sec-arraybuffer-constructor
$$4T({ global: true, constructor: true, forced: NativeArrayBuffer !== ArrayBuffer$7 }, {
  ArrayBuffer: ArrayBuffer$7
});

setSpecies$5(ARRAY_BUFFER);

var NATIVE_ARRAY_BUFFER$1 = arrayBufferBasicDetection;
var DESCRIPTORS$F = descriptors;
var globalThis$11 = globalThis_1;
var isCallable$o = isCallable$I;
var isObject$z = isObject$N;
var hasOwn$r = hasOwnProperty_1;
var classof$i = classof$q;
var tryToString$1 = tryToString$7;
var createNonEnumerableProperty$a = createNonEnumerableProperty$j;
var defineBuiltIn$m = defineBuiltIn$u;
var defineBuiltInAccessor$k = defineBuiltInAccessor$p;
var isPrototypeOf$8 = objectIsPrototypeOf;
var getPrototypeOf$c = objectGetPrototypeOf$2;
var setPrototypeOf$5 = objectSetPrototypeOf$1;
var wellKnownSymbol$y = wellKnownSymbol$S;
var uid$3 = uid$7;
var InternalStateModule$j = internalState;

var enforceInternalState$3 = InternalStateModule$j.enforce;
var getInternalState$d = InternalStateModule$j.get;
var Int8Array$4 = globalThis$11.Int8Array;
var Int8ArrayPrototype$1 = Int8Array$4 && Int8Array$4.prototype;
var Uint8ClampedArray$1 = globalThis$11.Uint8ClampedArray;
var Uint8ClampedArrayPrototype = Uint8ClampedArray$1 && Uint8ClampedArray$1.prototype;
var TypedArray$1 = Int8Array$4 && getPrototypeOf$c(Int8Array$4);
var TypedArrayPrototype$2 = Int8ArrayPrototype$1 && getPrototypeOf$c(Int8ArrayPrototype$1);
var ObjectPrototype$2 = Object.prototype;
var TypeError$8 = globalThis$11.TypeError;

var TO_STRING_TAG$7 = wellKnownSymbol$y('toStringTag');
var TYPED_ARRAY_TAG$1 = uid$3('TYPED_ARRAY_TAG');
var TYPED_ARRAY_CONSTRUCTOR = 'TypedArrayConstructor';
// Fixing native typed arrays in Opera Presto crashes the browser, see #595
var NATIVE_ARRAY_BUFFER_VIEWS$3 = NATIVE_ARRAY_BUFFER$1 && !!setPrototypeOf$5 && classof$i(globalThis$11.opera) !== 'Opera';
var TYPED_ARRAY_TAG_REQUIRED = false;
var NAME$1, Constructor, Prototype;

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
  if (!isObject$z(it)) return false;
  var klass = classof$i(it);
  return klass === 'DataView'
    || hasOwn$r(TypedArrayConstructorsList, klass)
    || hasOwn$r(BigIntArrayConstructorsList, klass);
};

var getTypedArrayConstructor$6 = function (it) {
  var proto = getPrototypeOf$c(it);
  if (!isObject$z(proto)) return;
  var state = getInternalState$d(proto);
  return (state && hasOwn$r(state, TYPED_ARRAY_CONSTRUCTOR)) ? state[TYPED_ARRAY_CONSTRUCTOR] : getTypedArrayConstructor$6(proto);
};

var isTypedArray$1 = function (it) {
  if (!isObject$z(it)) return false;
  var klass = classof$i(it);
  return hasOwn$r(TypedArrayConstructorsList, klass)
    || hasOwn$r(BigIntArrayConstructorsList, klass);
};

var aTypedArray$x = function (it) {
  if (isTypedArray$1(it)) return it;
  throw new TypeError$8('Target is not a typed array');
};

var aTypedArrayConstructor$4 = function (C) {
  if (isCallable$o(C) && (!setPrototypeOf$5 || isPrototypeOf$8(TypedArray$1, C))) return C;
  throw new TypeError$8(tryToString$1(C) + ' is not a typed array constructor');
};

var exportTypedArrayMethod$y = function (KEY, property, forced, options) {
  if (!DESCRIPTORS$F) return;
  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
    var TypedArrayConstructor = globalThis$11[ARRAY];
    if (TypedArrayConstructor && hasOwn$r(TypedArrayConstructor.prototype, KEY)) try {
      delete TypedArrayConstructor.prototype[KEY];
    } catch (error) {
      // old WebKit bug - some methods are non-configurable
      try {
        TypedArrayConstructor.prototype[KEY] = property;
      } catch (error2) { /* empty */ }
    }
  }
  if (!TypedArrayPrototype$2[KEY] || forced) {
    defineBuiltIn$m(TypedArrayPrototype$2, KEY, forced ? property
      : NATIVE_ARRAY_BUFFER_VIEWS$3 && Int8ArrayPrototype$1[KEY] || property, options);
  }
};

var exportTypedArrayStaticMethod$3 = function (KEY, property, forced) {
  var ARRAY, TypedArrayConstructor;
  if (!DESCRIPTORS$F) return;
  if (setPrototypeOf$5) {
    if (forced) for (ARRAY in TypedArrayConstructorsList) {
      TypedArrayConstructor = globalThis$11[ARRAY];
      if (TypedArrayConstructor && hasOwn$r(TypedArrayConstructor, KEY)) try {
        delete TypedArrayConstructor[KEY];
      } catch (error) { /* empty */ }
    }
    if (!TypedArray$1[KEY] || forced) {
      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
      try {
        return defineBuiltIn$m(TypedArray$1, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS$3 && TypedArray$1[KEY] || property);
      } catch (error) { /* empty */ }
    } else return;
  }
  for (ARRAY in TypedArrayConstructorsList) {
    TypedArrayConstructor = globalThis$11[ARRAY];
    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
      defineBuiltIn$m(TypedArrayConstructor, KEY, property);
    }
  }
};

for (NAME$1 in TypedArrayConstructorsList) {
  Constructor = globalThis$11[NAME$1];
  Prototype = Constructor && Constructor.prototype;
  if (Prototype) enforceInternalState$3(Prototype)[TYPED_ARRAY_CONSTRUCTOR] = Constructor;
  else NATIVE_ARRAY_BUFFER_VIEWS$3 = false;
}

for (NAME$1 in BigIntArrayConstructorsList) {
  Constructor = globalThis$11[NAME$1];
  Prototype = Constructor && Constructor.prototype;
  if (Prototype) enforceInternalState$3(Prototype)[TYPED_ARRAY_CONSTRUCTOR] = Constructor;
}

// WebKit bug - typed arrays constructors prototype is Object.prototype
if (!NATIVE_ARRAY_BUFFER_VIEWS$3 || !isCallable$o(TypedArray$1) || TypedArray$1 === Function.prototype) {
  // eslint-disable-next-line no-shadow -- safe
  TypedArray$1 = function TypedArray() {
    throw new TypeError$8('Incorrect invocation');
  };
  if (NATIVE_ARRAY_BUFFER_VIEWS$3) for (NAME$1 in TypedArrayConstructorsList) {
    if (globalThis$11[NAME$1]) setPrototypeOf$5(globalThis$11[NAME$1], TypedArray$1);
  }
}

if (!NATIVE_ARRAY_BUFFER_VIEWS$3 || !TypedArrayPrototype$2 || TypedArrayPrototype$2 === ObjectPrototype$2) {
  TypedArrayPrototype$2 = TypedArray$1.prototype;
  if (NATIVE_ARRAY_BUFFER_VIEWS$3) for (NAME$1 in TypedArrayConstructorsList) {
    if (globalThis$11[NAME$1]) setPrototypeOf$5(globalThis$11[NAME$1].prototype, TypedArrayPrototype$2);
  }
}

// WebKit bug - one more object in Uint8ClampedArray prototype chain
if (NATIVE_ARRAY_BUFFER_VIEWS$3 && getPrototypeOf$c(Uint8ClampedArrayPrototype) !== TypedArrayPrototype$2) {
  setPrototypeOf$5(Uint8ClampedArrayPrototype, TypedArrayPrototype$2);
}

if (DESCRIPTORS$F && !hasOwn$r(TypedArrayPrototype$2, TO_STRING_TAG$7)) {
  TYPED_ARRAY_TAG_REQUIRED = true;
  defineBuiltInAccessor$k(TypedArrayPrototype$2, TO_STRING_TAG$7, {
    configurable: true,
    get: function () {
      return isObject$z(this) ? this[TYPED_ARRAY_TAG$1] : undefined;
    }
  });
  for (NAME$1 in TypedArrayConstructorsList) if (globalThis$11[NAME$1]) {
    createNonEnumerableProperty$a(globalThis$11[NAME$1], TYPED_ARRAY_TAG$1, NAME$1);
  }
}

var arrayBufferViewCore = {
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS$3,
  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQUIRED && TYPED_ARRAY_TAG$1,
  aTypedArray: aTypedArray$x,
  aTypedArrayConstructor: aTypedArrayConstructor$4,
  exportTypedArrayMethod: exportTypedArrayMethod$y,
  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod$3,
  getTypedArrayConstructor: getTypedArrayConstructor$6,
  isView: isView,
  isTypedArray: isTypedArray$1,
  TypedArray: TypedArray$1,
  TypedArrayPrototype: TypedArrayPrototype$2
};

var $$4S = _export;
var ArrayBufferViewCore$B = arrayBufferViewCore;

var NATIVE_ARRAY_BUFFER_VIEWS$2 = ArrayBufferViewCore$B.NATIVE_ARRAY_BUFFER_VIEWS;

// `ArrayBuffer.isView` method
// https://tc39.es/ecma262/#sec-arraybuffer.isview
$$4S({ target: 'ArrayBuffer', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS$2 }, {
  isView: ArrayBufferViewCore$B.isView
});

var isConstructor$5 = isConstructor$a;
var tryToString = tryToString$7;

var $TypeError$y = TypeError;

// `Assert: IsConstructor(argument) is true`
var aConstructor$4 = function (argument) {
  if (isConstructor$5(argument)) return argument;
  throw new $TypeError$y(tryToString(argument) + ' is not a constructor');
};

var anObject$16 = anObject$1h;
var aConstructor$3 = aConstructor$4;
var isNullOrUndefined$f = isNullOrUndefined$j;
var wellKnownSymbol$x = wellKnownSymbol$S;

var SPECIES$2 = wellKnownSymbol$x('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor$6 = function (O, defaultConstructor) {
  var C = anObject$16(O).constructor;
  var S;
  return C === undefined || isNullOrUndefined$f(S = anObject$16(C)[SPECIES$2]) ? defaultConstructor : aConstructor$3(S);
};

var $$4R = _export;
var uncurryThis$1y = functionUncurryThisClause;
var fails$19 = fails$1z;
var ArrayBufferModule$2 = arrayBuffer;
var anObject$15 = anObject$1h;
var toAbsoluteIndex$3 = toAbsoluteIndex$a;
var toLength$9 = toLength$d;
var speciesConstructor$5 = speciesConstructor$6;

var ArrayBuffer$6 = ArrayBufferModule$2.ArrayBuffer;
var DataView$3 = ArrayBufferModule$2.DataView;
var DataViewPrototype$1 = DataView$3.prototype;
var nativeArrayBufferSlice = uncurryThis$1y(ArrayBuffer$6.prototype.slice);
var getUint8$1 = uncurryThis$1y(DataViewPrototype$1.getUint8);
var setUint8$1 = uncurryThis$1y(DataViewPrototype$1.setUint8);

var INCORRECT_SLICE = fails$19(function () {
  return !new ArrayBuffer$6(2).slice(1, undefined).byteLength;
});

// `ArrayBuffer.prototype.slice` method
// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
$$4R({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  slice: function slice(start, end) {
    if (nativeArrayBufferSlice && end === undefined) {
      return nativeArrayBufferSlice(anObject$15(this), start); // FF fix
    }
    var length = anObject$15(this).byteLength;
    var first = toAbsoluteIndex$3(start, length);
    var fin = toAbsoluteIndex$3(end === undefined ? length : end, length);
    var result = new (speciesConstructor$5(this, ArrayBuffer$6))(toLength$9(fin - first));
    var viewSource = new DataView$3(this);
    var viewTarget = new DataView$3(result);
    var index = 0;
    while (first < fin) {
      setUint8$1(viewTarget, index++, getUint8$1(viewSource, first++));
    } return result;
  }
});

var $$4Q = _export;
var ArrayBufferModule$1 = arrayBuffer;
var NATIVE_ARRAY_BUFFER = arrayBufferBasicDetection;

// `DataView` constructor
// https://tc39.es/ecma262/#sec-dataview-constructor
$$4Q({ global: true, constructor: true, forced: !NATIVE_ARRAY_BUFFER }, {
  DataView: ArrayBufferModule$1.DataView
});

var globalThis$10 = globalThis_1;
var uncurryThisAccessor$2 = functionUncurryThisAccessor;
var classof$h = classofRaw$2;

var ArrayBuffer$5 = globalThis$10.ArrayBuffer;
var TypeError$7 = globalThis$10.TypeError;

// Includes
// - Perform ? RequireInternalSlot(O, [[ArrayBufferData]]).
// - If IsSharedArrayBuffer(O) is true, throw a TypeError exception.
var arrayBufferByteLength$2 = ArrayBuffer$5 && uncurryThisAccessor$2(ArrayBuffer$5.prototype, 'byteLength', 'get') || function (O) {
  if (classof$h(O) !== 'ArrayBuffer') throw new TypeError$7('ArrayBuffer expected');
  return O.byteLength;
};

var globalThis$$ = globalThis_1;
var uncurryThis$1x = functionUncurryThisClause;
var arrayBufferByteLength$1 = arrayBufferByteLength$2;

var ArrayBuffer$4 = globalThis$$.ArrayBuffer;
var ArrayBufferPrototype$3 = ArrayBuffer$4 && ArrayBuffer$4.prototype;
var slice$7 = ArrayBufferPrototype$3 && uncurryThis$1x(ArrayBufferPrototype$3.slice);

var arrayBufferIsDetached = function (O) {
  if (arrayBufferByteLength$1(O) !== 0) return false;
  if (!slice$7) return false;
  try {
    slice$7(O, 0, 0);
    return false;
  } catch (error) {
    return true;
  }
};

var DESCRIPTORS$E = descriptors;
var defineBuiltInAccessor$j = defineBuiltInAccessor$p;
var isDetached$1 = arrayBufferIsDetached;

var ArrayBufferPrototype$2 = ArrayBuffer.prototype;

if (DESCRIPTORS$E && !('detached' in ArrayBufferPrototype$2)) {
  defineBuiltInAccessor$j(ArrayBufferPrototype$2, 'detached', {
    configurable: true,
    get: function detached() {
      return isDetached$1(this);
    }
  });
}

var isDetached = arrayBufferIsDetached;

var $TypeError$x = TypeError;

var arrayBufferNotDetached = function (it) {
  if (isDetached(it)) throw new $TypeError$x('ArrayBuffer is detached');
  return it;
};

var globalThis$_ = globalThis_1;
var IS_NODE$3 = environmentIsNode;

var getBuiltInNodeModule$2 = function (name) {
  if (IS_NODE$3) {
    try {
      return globalThis$_.process.getBuiltinModule(name);
    } catch (error) { /* empty */ }
    try {
      // eslint-disable-next-line no-new-func -- safe
      return Function('return require("' + name + '")')();
    } catch (error) { /* empty */ }
  }
};

var globalThis$Z = globalThis_1;
var fails$18 = fails$1z;
var V8$1 = environmentV8Version;
var ENVIRONMENT$2 = environment;

var structuredClone$2 = globalThis$Z.structuredClone;

var structuredCloneProperTransfer = !!structuredClone$2 && !fails$18(function () {
  // prevent V8 ArrayBufferDetaching protector cell invalidation and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if ((ENVIRONMENT$2 === 'DENO' && V8$1 > 92) || (ENVIRONMENT$2 === 'NODE' && V8$1 > 94) || (ENVIRONMENT$2 === 'BROWSER' && V8$1 > 97)) return false;
  var buffer = new ArrayBuffer(8);
  var clone = structuredClone$2(buffer, { transfer: [buffer] });
  return buffer.byteLength !== 0 || clone.byteLength !== 8;
});

var globalThis$Y = globalThis_1;
var getBuiltInNodeModule$1 = getBuiltInNodeModule$2;
var PROPER_STRUCTURED_CLONE_TRANSFER$2 = structuredCloneProperTransfer;

var structuredClone$1 = globalThis$Y.structuredClone;
var $ArrayBuffer = globalThis$Y.ArrayBuffer;
var $MessageChannel = globalThis$Y.MessageChannel;
var detach = false;
var WorkerThreads, channel$1, buffer, $detach;

if (PROPER_STRUCTURED_CLONE_TRANSFER$2) {
  detach = function (transferable) {
    structuredClone$1(transferable, { transfer: [transferable] });
  };
} else if ($ArrayBuffer) try {
  if (!$MessageChannel) {
    WorkerThreads = getBuiltInNodeModule$1('worker_threads');
    if (WorkerThreads) $MessageChannel = WorkerThreads.MessageChannel;
  }

  if ($MessageChannel) {
    channel$1 = new $MessageChannel();
    buffer = new $ArrayBuffer(2);

    $detach = function (transferable) {
      channel$1.port1.postMessage(null, [transferable]);
    };

    if (buffer.byteLength === 2) {
      $detach(buffer);
      if (buffer.byteLength === 0) detach = $detach;
    }
  }
} catch (error) { /* empty */ }

var detachTransferable$2 = detach;

var globalThis$X = globalThis_1;
var uncurryThis$1w = functionUncurryThis;
var uncurryThisAccessor$1 = functionUncurryThisAccessor;
var toIndex$3 = toIndex$5;
var notDetached$4 = arrayBufferNotDetached;
var arrayBufferByteLength = arrayBufferByteLength$2;
var detachTransferable$1 = detachTransferable$2;
var PROPER_STRUCTURED_CLONE_TRANSFER$1 = structuredCloneProperTransfer;

var structuredClone = globalThis$X.structuredClone;
var ArrayBuffer$3 = globalThis$X.ArrayBuffer;
var DataView$2 = globalThis$X.DataView;
var min$9 = Math.min;
var ArrayBufferPrototype$1 = ArrayBuffer$3.prototype;
var DataViewPrototype = DataView$2.prototype;
var slice$6 = uncurryThis$1w(ArrayBufferPrototype$1.slice);
var isResizable = uncurryThisAccessor$1(ArrayBufferPrototype$1, 'resizable', 'get');
var maxByteLength = uncurryThisAccessor$1(ArrayBufferPrototype$1, 'maxByteLength', 'get');
var getInt8 = uncurryThis$1w(DataViewPrototype.getInt8);
var setInt8 = uncurryThis$1w(DataViewPrototype.setInt8);

var arrayBufferTransfer = (PROPER_STRUCTURED_CLONE_TRANSFER$1 || detachTransferable$1) && function (arrayBuffer, newLength, preserveResizability) {
  var byteLength = arrayBufferByteLength(arrayBuffer);
  var newByteLength = newLength === undefined ? byteLength : toIndex$3(newLength);
  var fixedLength = !isResizable || !isResizable(arrayBuffer);
  var newBuffer;
  notDetached$4(arrayBuffer);
  if (PROPER_STRUCTURED_CLONE_TRANSFER$1) {
    arrayBuffer = structuredClone(arrayBuffer, { transfer: [arrayBuffer] });
    if (byteLength === newByteLength && (preserveResizability || fixedLength)) return arrayBuffer;
  }
  if (byteLength >= newByteLength && (!preserveResizability || fixedLength)) {
    newBuffer = slice$6(arrayBuffer, 0, newByteLength);
  } else {
    var options = preserveResizability && !fixedLength && maxByteLength ? { maxByteLength: maxByteLength(arrayBuffer) } : undefined;
    newBuffer = new ArrayBuffer$3(newByteLength, options);
    var a = new DataView$2(arrayBuffer);
    var b = new DataView$2(newBuffer);
    var copyLength = min$9(newByteLength, byteLength);
    for (var i = 0; i < copyLength; i++) setInt8(b, i, getInt8(a, i));
  }
  if (!PROPER_STRUCTURED_CLONE_TRANSFER$1) detachTransferable$1(arrayBuffer);
  return newBuffer;
};

var $$4P = _export;
var $transfer$1 = arrayBufferTransfer;

// `ArrayBuffer.prototype.transfer` method
// https://tc39.es/proposal-arraybuffer-transfer/#sec-arraybuffer.prototype.transfer
if ($transfer$1) $$4P({ target: 'ArrayBuffer', proto: true }, {
  transfer: function transfer() {
    return $transfer$1(this, arguments.length ? arguments[0] : undefined, true);
  }
});

var $$4O = _export;
var $transfer = arrayBufferTransfer;

// `ArrayBuffer.prototype.transferToFixedLength` method
// https://tc39.es/proposal-arraybuffer-transfer/#sec-arraybuffer.prototype.transfertofixedlength
if ($transfer) $$4O({ target: 'ArrayBuffer', proto: true }, {
  transferToFixedLength: function transferToFixedLength() {
    return $transfer(this, arguments.length ? arguments[0] : undefined, false);
  }
});

var $$4N = _export;
var uncurryThis$1v = functionUncurryThis;
var fails$17 = fails$1z;

// IE8- non-standard case
var FORCED$v = fails$17(function () {
  // eslint-disable-next-line es/no-date-prototype-getyear-setyear -- detection
  return new Date(16e11).getYear() !== 120;
});

var getFullYear = uncurryThis$1v(Date.prototype.getFullYear);

// `Date.prototype.getYear` method
// https://tc39.es/ecma262/#sec-date.prototype.getyear
$$4N({ target: 'Date', proto: true, forced: FORCED$v }, {
  getYear: function getYear() {
    return getFullYear(this) - 1900;
  }
});

// TODO: Remove from `core-js@4`
var $$4M = _export;
var uncurryThis$1u = functionUncurryThis;

var $Date = Date;
var thisTimeValue$4 = uncurryThis$1u($Date.prototype.getTime);

// `Date.now` method
// https://tc39.es/ecma262/#sec-date.now
$$4M({ target: 'Date', stat: true }, {
  now: function now() {
    return thisTimeValue$4(new $Date());
  }
});

var $$4L = _export;
var uncurryThis$1t = functionUncurryThis;
var toIntegerOrInfinity$e = toIntegerOrInfinity$p;

var DatePrototype$3 = Date.prototype;
var thisTimeValue$3 = uncurryThis$1t(DatePrototype$3.getTime);
var setFullYear = uncurryThis$1t(DatePrototype$3.setFullYear);

// `Date.prototype.setYear` method
// https://tc39.es/ecma262/#sec-date.prototype.setyear
$$4L({ target: 'Date', proto: true }, {
  setYear: function setYear(year) {
    // validate
    thisTimeValue$3(this);
    var yi = toIntegerOrInfinity$e(year);
    var yyyy = yi >= 0 && yi <= 99 ? yi + 1900 : yi;
    return setFullYear(this, yyyy);
  }
});

var $$4K = _export;

// `Date.prototype.toGMTString` method
// https://tc39.es/ecma262/#sec-date.prototype.togmtstring
$$4K({ target: 'Date', proto: true }, {
  toGMTString: Date.prototype.toUTCString
});

var toIntegerOrInfinity$d = toIntegerOrInfinity$p;
var toString$D = toString$J;
var requireObjectCoercible$m = requireObjectCoercible$q;

var $RangeError$c = RangeError;

// `String.prototype.repeat` method implementation
// https://tc39.es/ecma262/#sec-string.prototype.repeat
var stringRepeat = function repeat(count) {
  var str = toString$D(requireObjectCoercible$m(this));
  var result = '';
  var n = toIntegerOrInfinity$d(count);
  if (n < 0 || n === Infinity) throw new $RangeError$c('Wrong number of repetitions');
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
  return result;
};

// https://github.com/tc39/proposal-string-pad-start-end
var uncurryThis$1s = functionUncurryThis;
var toLength$8 = toLength$d;
var toString$C = toString$J;
var $repeat$2 = stringRepeat;
var requireObjectCoercible$l = requireObjectCoercible$q;

var repeat$3 = uncurryThis$1s($repeat$2);
var stringSlice$j = uncurryThis$1s(''.slice);
var ceil = Math.ceil;

// `String.prototype.{ padStart, padEnd }` methods implementation
var createMethod$4 = function (IS_END) {
  return function ($this, maxLength, fillString) {
    var S = toString$C(requireObjectCoercible$l($this));
    var intMaxLength = toLength$8(maxLength);
    var stringLength = S.length;
    var fillStr = fillString === undefined ? ' ' : toString$C(fillString);
    var fillLen, stringFiller;
    if (intMaxLength <= stringLength || fillStr === '') return S;
    fillLen = intMaxLength - stringLength;
    stringFiller = repeat$3(fillStr, ceil(fillLen / fillStr.length));
    if (stringFiller.length > fillLen) stringFiller = stringSlice$j(stringFiller, 0, fillLen);
    return IS_END ? S + stringFiller : stringFiller + S;
  };
};

var stringPad = {
  // `String.prototype.padStart` method
  // https://tc39.es/ecma262/#sec-string.prototype.padstart
  start: createMethod$4(false),
  // `String.prototype.padEnd` method
  // https://tc39.es/ecma262/#sec-string.prototype.padend
  end: createMethod$4(true)
};

var uncurryThis$1r = functionUncurryThis;
var fails$16 = fails$1z;
var padStart$1 = stringPad.start;

var $RangeError$b = RangeError;
var $isFinite$1 = isFinite;
var abs$7 = Math.abs;
var DatePrototype$2 = Date.prototype;
var nativeDateToISOString = DatePrototype$2.toISOString;
var thisTimeValue$2 = uncurryThis$1r(DatePrototype$2.getTime);
var getUTCDate = uncurryThis$1r(DatePrototype$2.getUTCDate);
var getUTCFullYear = uncurryThis$1r(DatePrototype$2.getUTCFullYear);
var getUTCHours = uncurryThis$1r(DatePrototype$2.getUTCHours);
var getUTCMilliseconds = uncurryThis$1r(DatePrototype$2.getUTCMilliseconds);
var getUTCMinutes = uncurryThis$1r(DatePrototype$2.getUTCMinutes);
var getUTCMonth = uncurryThis$1r(DatePrototype$2.getUTCMonth);
var getUTCSeconds = uncurryThis$1r(DatePrototype$2.getUTCSeconds);

// `Date.prototype.toISOString` method implementation
// https://tc39.es/ecma262/#sec-date.prototype.toisostring
// PhantomJS / old WebKit fails here:
var dateToIsoString = (fails$16(function () {
  return nativeDateToISOString.call(new Date(-5e13 - 1)) !== '0385-07-25T07:06:39.999Z';
}) || !fails$16(function () {
  nativeDateToISOString.call(new Date(NaN));
})) ? function toISOString() {
  if (!$isFinite$1(thisTimeValue$2(this))) throw new $RangeError$b('Invalid time value');
  var date = this;
  var year = getUTCFullYear(date);
  var milliseconds = getUTCMilliseconds(date);
  var sign = year < 0 ? '-' : year > 9999 ? '+' : '';
  return sign + padStart$1(abs$7(year), sign ? 6 : 4, 0) +
    '-' + padStart$1(getUTCMonth(date) + 1, 2, 0) +
    '-' + padStart$1(getUTCDate(date), 2, 0) +
    'T' + padStart$1(getUTCHours(date), 2, 0) +
    ':' + padStart$1(getUTCMinutes(date), 2, 0) +
    ':' + padStart$1(getUTCSeconds(date), 2, 0) +
    '.' + padStart$1(milliseconds, 3, 0) +
    'Z';
} : nativeDateToISOString;

var $$4J = _export;
var toISOString = dateToIsoString;

// `Date.prototype.toISOString` method
// https://tc39.es/ecma262/#sec-date.prototype.toisostring
// PhantomJS / old WebKit has a broken implementations
$$4J({ target: 'Date', proto: true, forced: Date.prototype.toISOString !== toISOString }, {
  toISOString: toISOString
});

var $$4I = _export;
var fails$15 = fails$1z;
var toObject$m = toObject$E;
var toPrimitive$2 = toPrimitive$4;

var FORCED$u = fails$15(function () {
  return new Date(NaN).toJSON() !== null
    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
});

// `Date.prototype.toJSON` method
// https://tc39.es/ecma262/#sec-date.prototype.tojson
$$4I({ target: 'Date', proto: true, arity: 1, forced: FORCED$u }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  toJSON: function toJSON(key) {
    var O = toObject$m(this);
    var pv = toPrimitive$2(O, 'number');
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});

var anObject$14 = anObject$1h;
var ordinaryToPrimitive = ordinaryToPrimitive$2;

var $TypeError$w = TypeError;

// `Date.prototype[@@toPrimitive](hint)` method implementation
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
var dateToPrimitive$1 = function (hint) {
  anObject$14(this);
  if (hint === 'string' || hint === 'default') hint = 'string';
  else if (hint !== 'number') throw new $TypeError$w('Incorrect hint');
  return ordinaryToPrimitive(this, hint);
};

var hasOwn$q = hasOwnProperty_1;
var defineBuiltIn$l = defineBuiltIn$u;
var dateToPrimitive = dateToPrimitive$1;
var wellKnownSymbol$w = wellKnownSymbol$S;

var TO_PRIMITIVE = wellKnownSymbol$w('toPrimitive');
var DatePrototype$1 = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
if (!hasOwn$q(DatePrototype$1, TO_PRIMITIVE)) {
  defineBuiltIn$l(DatePrototype$1, TO_PRIMITIVE, dateToPrimitive);
}

// TODO: Remove from `core-js@4`
var uncurryThis$1q = functionUncurryThis;
var defineBuiltIn$k = defineBuiltIn$u;

var DatePrototype = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING$1 = 'toString';
var nativeDateToString = uncurryThis$1q(DatePrototype[TO_STRING$1]);
var thisTimeValue$1 = uncurryThis$1q(DatePrototype.getTime);

// `Date.prototype.toString` method
// https://tc39.es/ecma262/#sec-date.prototype.tostring
if (String(new Date(NaN)) !== INVALID_DATE) {
  defineBuiltIn$k(DatePrototype, TO_STRING$1, function toString() {
    var value = thisTimeValue$1(this);
    // eslint-disable-next-line no-self-compare -- NaN check
    return value === value ? nativeDateToString(this) : INVALID_DATE;
  });
}

var $$4H = _export;
var uncurryThis$1p = functionUncurryThis;
var toString$B = toString$J;

var charAt$l = uncurryThis$1p(''.charAt);
var charCodeAt$8 = uncurryThis$1p(''.charCodeAt);
var exec$f = uncurryThis$1p(/./.exec);
var numberToString$4 = uncurryThis$1p(1.0.toString);
var toUpperCase = uncurryThis$1p(''.toUpperCase);

var raw = /[\w*+\-./@]/;

var hex$1 = function (code, length) {
  var result = numberToString$4(code, 16);
  while (result.length < length) result = '0' + result;
  return result;
};

// `escape` method
// https://tc39.es/ecma262/#sec-escape-string
$$4H({ global: true }, {
  escape: function escape(string) {
    var str = toString$B(string);
    var result = '';
    var length = str.length;
    var index = 0;
    var chr, code;
    while (index < length) {
      chr = charAt$l(str, index++);
      if (exec$f(raw, chr)) {
        result += chr;
      } else {
        code = charCodeAt$8(chr, 0);
        if (code < 256) {
          result += '%' + hex$1(code, 2);
        } else {
          result += '%u' + toUpperCase(hex$1(code, 4));
        }
      }
    } return result;
  }
});

var uncurryThis$1o = functionUncurryThis;
var aCallable$E = aCallable$N;
var isObject$y = isObject$N;
var hasOwn$p = hasOwnProperty_1;
var arraySlice$5 = arraySlice$a;
var NATIVE_BIND = functionBindNative;

var $Function = Function;
var concat$3 = uncurryThis$1o([].concat);
var join$9 = uncurryThis$1o([].join);
var factories = {};

var construct = function (C, argsLength, args) {
  if (!hasOwn$p(factories, argsLength)) {
    var list = [];
    var i = 0;
    for (; i < argsLength; i++) list[i] = 'a[' + i + ']';
    factories[argsLength] = $Function('C,a', 'return new C(' + join$9(list, ',') + ')');
  } return factories[argsLength](C, args);
};

// `Function.prototype.bind` method implementation
// https://tc39.es/ecma262/#sec-function.prototype.bind
// eslint-disable-next-line es/no-function-prototype-bind -- detection
var functionBind = NATIVE_BIND ? $Function.bind : function bind(that /* , ...args */) {
  var F = aCallable$E(this);
  var Prototype = F.prototype;
  var partArgs = arraySlice$5(arguments, 1);
  var boundFunction = function bound(/* args... */) {
    var args = concat$3(partArgs, arraySlice$5(arguments));
    return this instanceof boundFunction ? construct(F, args.length, args) : F.apply(that, args);
  };
  if (isObject$y(Prototype)) boundFunction.prototype = Prototype;
  return boundFunction;
};

// TODO: Remove from `core-js@4`
var $$4G = _export;
var bind$p = functionBind;

// `Function.prototype.bind` method
// https://tc39.es/ecma262/#sec-function.prototype.bind
// eslint-disable-next-line es/no-function-prototype-bind -- detection
$$4G({ target: 'Function', proto: true, forced: Function.bind !== bind$p }, {
  bind: bind$p
});

var isCallable$n = isCallable$I;
var isObject$x = isObject$N;
var definePropertyModule$5 = objectDefineProperty;
var isPrototypeOf$7 = objectIsPrototypeOf;
var wellKnownSymbol$v = wellKnownSymbol$S;
var makeBuiltIn$1 = makeBuiltInExports;

var HAS_INSTANCE = wellKnownSymbol$v('hasInstance');
var FunctionPrototype$2 = Function.prototype;

// `Function.prototype[@@hasInstance]` method
// https://tc39.es/ecma262/#sec-function.prototype-@@hasinstance
if (!(HAS_INSTANCE in FunctionPrototype$2)) {
  definePropertyModule$5.f(FunctionPrototype$2, HAS_INSTANCE, { value: makeBuiltIn$1(function (O) {
    if (!isCallable$n(this) || !isObject$x(O)) return false;
    var P = this.prototype;
    return isObject$x(P) ? isPrototypeOf$7(P, O) : O instanceof this;
  }, HAS_INSTANCE) });
}

var DESCRIPTORS$D = descriptors;
var FUNCTION_NAME_EXISTS = functionName.EXISTS;
var uncurryThis$1n = functionUncurryThis;
var defineBuiltInAccessor$i = defineBuiltInAccessor$p;

var FunctionPrototype$1 = Function.prototype;
var functionToString = uncurryThis$1n(FunctionPrototype$1.toString);
var nameRE = /function\b(?:\s|\/\*[\S\s]*?\*\/|\/\/[^\n\r]*[\n\r]+)*([^\s(/]*)/;
var regExpExec$5 = uncurryThis$1n(nameRE.exec);
var NAME = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (DESCRIPTORS$D && !FUNCTION_NAME_EXISTS) {
  defineBuiltInAccessor$i(FunctionPrototype$1, NAME, {
    configurable: true,
    get: function () {
      try {
        return regExpExec$5(nameRE, functionToString(this))[1];
      } catch (error) {
        return '';
      }
    }
  });
}

var $$4F = _export;
var globalThis$W = globalThis_1;

// `globalThis` object
// https://tc39.es/ecma262/#sec-globalthis
$$4F({ global: true, forced: globalThis$W.globalThis !== globalThis$W }, {
  globalThis: globalThis$W
});

var globalThis$V = globalThis_1;
var setToStringTag$8 = setToStringTag$e;

// JSON[@@toStringTag] property
// https://tc39.es/ecma262/#sec-json-@@tostringtag
setToStringTag$8(globalThis$V.JSON, 'JSON', true);

var internalMetadata = {exports: {}};

// FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
var fails$14 = fails$1z;

var arrayBufferNonExtensible = fails$14(function () {
  if (typeof ArrayBuffer == 'function') {
    var buffer = new ArrayBuffer(8);
    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
  }
});

var fails$13 = fails$1z;
var isObject$w = isObject$N;
var classof$g = classofRaw$2;
var ARRAY_BUFFER_NON_EXTENSIBLE$2 = arrayBufferNonExtensible;

// eslint-disable-next-line es/no-object-isextensible -- safe
var $isExtensible$2 = Object.isExtensible;
var FAILS_ON_PRIMITIVES$6 = fails$13(function () { $isExtensible$2(1); });

// `Object.isExtensible` method
// https://tc39.es/ecma262/#sec-object.isextensible
var objectIsExtensible = (FAILS_ON_PRIMITIVES$6 || ARRAY_BUFFER_NON_EXTENSIBLE$2) ? function isExtensible(it) {
  if (!isObject$w(it)) return false;
  if (ARRAY_BUFFER_NON_EXTENSIBLE$2 && classof$g(it) === 'ArrayBuffer') return false;
  return $isExtensible$2 ? $isExtensible$2(it) : true;
} : $isExtensible$2;

var fails$12 = fails$1z;

var freezing = !fails$12(function () {
  // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
  return Object.isExtensible(Object.preventExtensions({}));
});

var $$4E = _export;
var uncurryThis$1m = functionUncurryThis;
var hiddenKeys = hiddenKeys$6;
var isObject$v = isObject$N;
var hasOwn$o = hasOwnProperty_1;
var defineProperty$a = objectDefineProperty.f;
var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternalModule = objectGetOwnPropertyNamesExternal;
var isExtensible$1 = objectIsExtensible;
var uid$2 = uid$7;
var FREEZING$7 = freezing;

var REQUIRED = false;
var METADATA$1 = uid$2('meta');
var id$1 = 0;

var setMetadata = function (it) {
  defineProperty$a(it, METADATA$1, { value: {
    objectID: 'O' + id$1++, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey$1 = function (it, create) {
  // return a primitive with prefix
  if (!isObject$v(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!hasOwn$o(it, METADATA$1)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible$1(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMetadata(it);
  // return object ID
  } return it[METADATA$1].objectID;
};

var getWeakData$1 = function (it, create) {
  if (!hasOwn$o(it, METADATA$1)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible$1(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMetadata(it);
  // return the store of weak collections IDs
  } return it[METADATA$1].weakData;
};

// add metadata on freeze-family methods calling
var onFreeze$3 = function (it) {
  if (FREEZING$7 && REQUIRED && isExtensible$1(it) && !hasOwn$o(it, METADATA$1)) setMetadata(it);
  return it;
};

var enable = function () {
  meta.enable = function () { /* empty */ };
  REQUIRED = true;
  var getOwnPropertyNames = getOwnPropertyNamesModule.f;
  var splice = uncurryThis$1m([].splice);
  var test = {};
  test[METADATA$1] = 1;

  // prevent exposing of metadata key
  if (getOwnPropertyNames(test).length) {
    getOwnPropertyNamesModule.f = function (it) {
      var result = getOwnPropertyNames(it);
      for (var i = 0, length = result.length; i < length; i++) {
        if (result[i] === METADATA$1) {
          splice(result, i, 1);
          break;
        }
      } return result;
    };

    $$4E({ target: 'Object', stat: true, forced: true }, {
      getOwnPropertyNames: getOwnPropertyNamesExternalModule.f
    });
  }
};

var meta = internalMetadata.exports = {
  enable: enable,
  fastKey: fastKey$1,
  getWeakData: getWeakData$1,
  onFreeze: onFreeze$3
};

hiddenKeys[METADATA$1] = true;

var internalMetadataExports = internalMetadata.exports;

var $$4D = _export;
var globalThis$U = globalThis_1;
var uncurryThis$1l = functionUncurryThis;
var isForced$3 = isForced_1;
var defineBuiltIn$j = defineBuiltIn$u;
var InternalMetadataModule$1 = internalMetadataExports;
var iterate$F = iterate$H;
var anInstance$d = anInstance$f;
var isCallable$m = isCallable$I;
var isNullOrUndefined$e = isNullOrUndefined$j;
var isObject$u = isObject$N;
var fails$11 = fails$1z;
var checkCorrectnessOfIteration$2 = checkCorrectnessOfIteration$4;
var setToStringTag$7 = setToStringTag$e;
var inheritIfRequired$4 = inheritIfRequired$7;

var collection$4 = function (CONSTRUCTOR_NAME, wrapper, common) {
  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
  var ADDER = IS_MAP ? 'set' : 'add';
  var NativeConstructor = globalThis$U[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var exported = {};

  var fixMethod = function (KEY) {
    var uncurriedNativeMethod = uncurryThis$1l(NativePrototype[KEY]);
    defineBuiltIn$j(NativePrototype, KEY,
      KEY === 'add' ? function add(value) {
        uncurriedNativeMethod(this, value === 0 ? 0 : value);
        return this;
      } : KEY === 'delete' ? function (key) {
        return IS_WEAK && !isObject$u(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY === 'get' ? function get(key) {
        return IS_WEAK && !isObject$u(key) ? undefined : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY === 'has' ? function has(key) {
        return IS_WEAK && !isObject$u(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  var REPLACE = isForced$3(
    CONSTRUCTOR_NAME,
    !isCallable$m(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails$11(function () {
      new NativeConstructor().entries().next();
    }))
  );

  if (REPLACE) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
    InternalMetadataModule$1.enable();
  } else if (isForced$3(CONSTRUCTOR_NAME, true)) {
    var instance = new Constructor();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) !== instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails$11(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new -- required for testing
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration$2(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails$11(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance$d(dummy, NativePrototype);
        var that = inheritIfRequired$4(new NativeConstructor(), dummy, Constructor);
        if (!isNullOrUndefined$e(iterable)) iterate$F(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
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
  $$4D({ global: true, constructor: true, forced: Constructor !== NativeConstructor }, exported);

  setToStringTag$7(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};

var create$f = objectCreate$1;
var defineBuiltInAccessor$h = defineBuiltInAccessor$p;
var defineBuiltIns$9 = defineBuiltIns$b;
var bind$o = functionBindContext;
var anInstance$c = anInstance$f;
var isNullOrUndefined$d = isNullOrUndefined$j;
var iterate$E = iterate$H;
var defineIterator$1 = iteratorDefine;
var createIterResultObject$f = createIterResultObject$h;
var setSpecies$4 = setSpecies$7;
var DESCRIPTORS$C = descriptors;
var fastKey = internalMetadataExports.fastKey;
var InternalStateModule$i = internalState;

var setInternalState$j = InternalStateModule$i.set;
var internalStateGetterFor$1 = InternalStateModule$i.getterFor;

var collectionStrong$2 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var Constructor = wrapper(function (that, iterable) {
      anInstance$c(that, Prototype);
      setInternalState$j(that, {
        type: CONSTRUCTOR_NAME,
        index: create$f(null),
        first: null,
        last: null,
        size: 0
      });
      if (!DESCRIPTORS$C) that.size = 0;
      if (!isNullOrUndefined$d(iterable)) iterate$E(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var Prototype = Constructor.prototype;

    var getInternalState = internalStateGetterFor$1(CONSTRUCTOR_NAME);

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
        if (DESCRIPTORS$C) state.size++;
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

    defineBuiltIns$9(Prototype, {
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
        state.index = create$f(null);
        if (DESCRIPTORS$C) state.size = 0;
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
          if (DESCRIPTORS$C) state.size--;
          else that.size--;
        } return !!entry;
      },
      // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.foreach
      // https://tc39.es/ecma262/#sec-set.prototype.foreach
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind$o(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
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

    defineBuiltIns$9(Prototype, IS_MAP ? {
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
    if (DESCRIPTORS$C) defineBuiltInAccessor$h(Prototype, 'size', {
      configurable: true,
      get: function () {
        return getInternalState(this).size;
      }
    });
    return Constructor;
  },
  setStrong: function (Constructor, CONSTRUCTOR_NAME, IS_MAP) {
    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
    var getInternalCollectionState = internalStateGetterFor$1(CONSTRUCTOR_NAME);
    var getInternalIteratorState = internalStateGetterFor$1(ITERATOR_NAME);
    // `{ Map, Set }.prototype.{ keys, values, entries, @@iterator }()` methods
    // https://tc39.es/ecma262/#sec-map.prototype.entries
    // https://tc39.es/ecma262/#sec-map.prototype.keys
    // https://tc39.es/ecma262/#sec-map.prototype.values
    // https://tc39.es/ecma262/#sec-map.prototype-@@iterator
    // https://tc39.es/ecma262/#sec-set.prototype.entries
    // https://tc39.es/ecma262/#sec-set.prototype.keys
    // https://tc39.es/ecma262/#sec-set.prototype.values
    // https://tc39.es/ecma262/#sec-set.prototype-@@iterator
    defineIterator$1(Constructor, CONSTRUCTOR_NAME, function (iterated, kind) {
      setInternalState$j(this, {
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
        return createIterResultObject$f(undefined, true);
      }
      // return step by kind
      if (kind === 'keys') return createIterResultObject$f(entry.key, false);
      if (kind === 'values') return createIterResultObject$f(entry.value, false);
      return createIterResultObject$f([entry.key, entry.value], false);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // `{ Map, Set }.prototype[@@species]` accessors
    // https://tc39.es/ecma262/#sec-get-map-@@species
    // https://tc39.es/ecma262/#sec-get-set-@@species
    setSpecies$4(CONSTRUCTOR_NAME);
  }
};

var collection$3 = collection$4;
var collectionStrong$1 = collectionStrong$2;

// `Map` constructor
// https://tc39.es/ecma262/#sec-map-objects
collection$3('Map', function (init) {
  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong$1);

var uncurryThis$1k = functionUncurryThis;

// eslint-disable-next-line es/no-map -- safe
var MapPrototype$1 = Map.prototype;

var mapHelpers = {
  // eslint-disable-next-line es/no-map -- safe
  Map: Map,
  set: uncurryThis$1k(MapPrototype$1.set),
  get: uncurryThis$1k(MapPrototype$1.get),
  has: uncurryThis$1k(MapPrototype$1.has),
  remove: uncurryThis$1k(MapPrototype$1['delete']),
  proto: MapPrototype$1
};

var $$4C = _export;
var uncurryThis$1j = functionUncurryThis;
var aCallable$D = aCallable$N;
var requireObjectCoercible$k = requireObjectCoercible$q;
var iterate$D = iterate$H;
var MapHelpers$b = mapHelpers;
var fails$10 = fails$1z;

var Map$b = MapHelpers$b.Map;
var has$c = MapHelpers$b.has;
var get$4 = MapHelpers$b.get;
var set$9 = MapHelpers$b.set;
var push$m = uncurryThis$1j([].push);

var DOES_NOT_WORK_WITH_PRIMITIVES$1 = fails$10(function () {
  return Map$b.groupBy('ab', function (it) {
    return it;
  }).get('a').length !== 1;
});

// `Map.groupBy` method
// https://github.com/tc39/proposal-array-grouping
$$4C({ target: 'Map', stat: true, forced: DOES_NOT_WORK_WITH_PRIMITIVES$1 }, {
  groupBy: function groupBy(items, callbackfn) {
    requireObjectCoercible$k(items);
    aCallable$D(callbackfn);
    var map = new Map$b();
    var k = 0;
    iterate$D(items, function (value) {
      var key = callbackfn(value, k++);
      if (!has$c(map, key)) set$9(map, key, [value]);
      else push$m(get$4(map, key), value);
    });
    return map;
  }
});

var log$7 = Math.log;

// `Math.log1p` method implementation
// https://tc39.es/ecma262/#sec-math.log1p
// eslint-disable-next-line es/no-math-log1p -- safe
var mathLog1p = Math.log1p || function log1p(x) {
  var n = +x;
  return n > -1e-8 && n < 1e-8 ? n - n * n / 2 : log$7(1 + n);
};

var $$4B = _export;
var log1p$1 = mathLog1p;

// eslint-disable-next-line es/no-math-acosh -- required for testing
var $acosh = Math.acosh;
var log$6 = Math.log;
var sqrt$2 = Math.sqrt;
var LN2$1 = Math.LN2;

var FORCED$t = !$acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  || Math.floor($acosh(Number.MAX_VALUE)) !== 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  || $acosh(Infinity) !== Infinity;

// `Math.acosh` method
// https://tc39.es/ecma262/#sec-math.acosh
$$4B({ target: 'Math', stat: true, forced: FORCED$t }, {
  acosh: function acosh(x) {
    var n = +x;
    return n < 1 ? NaN : n > 94906265.62425156
      ? log$6(n) + LN2$1
      : log1p$1(n - 1 + sqrt$2(n - 1) * sqrt$2(n + 1));
  }
});

var $$4A = _export;

// eslint-disable-next-line es/no-math-asinh -- required for testing
var $asinh = Math.asinh;
var log$5 = Math.log;
var sqrt$1 = Math.sqrt;

function asinh(x) {
  var n = +x;
  return !isFinite(n) || n === 0 ? n : n < 0 ? -asinh(-n) : log$5(n + sqrt$1(n * n + 1));
}

var FORCED$s = !($asinh && 1 / $asinh(0) > 0);

// `Math.asinh` method
// https://tc39.es/ecma262/#sec-math.asinh
// Tor Browser bug: Math.asinh(0) -> -0
$$4A({ target: 'Math', stat: true, forced: FORCED$s }, {
  asinh: asinh
});

var $$4z = _export;

// eslint-disable-next-line es/no-math-atanh -- required for testing
var $atanh = Math.atanh;
var log$4 = Math.log;

var FORCED$r = !($atanh && 1 / $atanh(-0) < 0);

// `Math.atanh` method
// https://tc39.es/ecma262/#sec-math.atanh
// Tor Browser bug: Math.atanh(-0) -> 0
$$4z({ target: 'Math', stat: true, forced: FORCED$r }, {
  atanh: function atanh(x) {
    var n = +x;
    return n === 0 ? n : log$4((1 + n) / (1 - n)) / 2;
  }
});

var $$4y = _export;
var sign$1 = mathSign;

var abs$6 = Math.abs;
var pow$5 = Math.pow;

// `Math.cbrt` method
// https://tc39.es/ecma262/#sec-math.cbrt
$$4y({ target: 'Math', stat: true }, {
  cbrt: function cbrt(x) {
    var n = +x;
    return sign$1(n) * pow$5(abs$6(n), 1 / 3);
  }
});

var $$4x = _export;

var floor$7 = Math.floor;
var log$3 = Math.log;
var LOG2E = Math.LOG2E;

// `Math.clz32` method
// https://tc39.es/ecma262/#sec-math.clz32
$$4x({ target: 'Math', stat: true }, {
  clz32: function clz32(x) {
    var n = x >>> 0;
    return n ? 31 - floor$7(log$3(n + 0.5) * LOG2E) : 32;
  }
});

// eslint-disable-next-line es/no-math-expm1 -- safe
var $expm1 = Math.expm1;
var exp$2 = Math.exp;

// `Math.expm1` method implementation
// https://tc39.es/ecma262/#sec-math.expm1
var mathExpm1 = (!$expm1
  // Old FF bug
  // eslint-disable-next-line no-loss-of-precision -- required for old engines
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) !== -2e-17
) ? function expm1(x) {
  var n = +x;
  return n === 0 ? n : n > -1e-6 && n < 1e-6 ? n + n * n / 2 : exp$2(n) - 1;
} : $expm1;

var $$4w = _export;
var expm1$3 = mathExpm1;

// eslint-disable-next-line es/no-math-cosh -- required for testing
var $cosh = Math.cosh;
var abs$5 = Math.abs;
var E$1 = Math.E;

var FORCED$q = !$cosh || $cosh(710) === Infinity;

// `Math.cosh` method
// https://tc39.es/ecma262/#sec-math.cosh
$$4w({ target: 'Math', stat: true, forced: FORCED$q }, {
  cosh: function cosh(x) {
    var t = expm1$3(abs$5(x) - 1) + 1;
    return (t + 1 / (t * E$1 * E$1)) * (E$1 / 2);
  }
});

var $$4v = _export;
var expm1$2 = mathExpm1;

// `Math.expm1` method
// https://tc39.es/ecma262/#sec-math.expm1
// eslint-disable-next-line es/no-math-expm1 -- required for testing
$$4v({ target: 'Math', stat: true, forced: expm1$2 !== Math.expm1 }, { expm1: expm1$2 });

var $$4u = _export;
var fround$1 = mathFround;

// `Math.fround` method
// https://tc39.es/ecma262/#sec-math.fround
$$4u({ target: 'Math', stat: true }, { fround: fround$1 });

var $$4t = _export;

// eslint-disable-next-line es/no-math-hypot -- required for testing
var $hypot = Math.hypot;
var abs$4 = Math.abs;
var sqrt = Math.sqrt;

// Chrome 77 bug
// https://bugs.chromium.org/p/v8/issues/detail?id=9546
var FORCED$p = !!$hypot && $hypot(Infinity, NaN) !== Infinity;

// `Math.hypot` method
// https://tc39.es/ecma262/#sec-math.hypot
$$4t({ target: 'Math', stat: true, arity: 2, forced: FORCED$p }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  hypot: function hypot(value1, value2) {
    var sum = 0;
    var i = 0;
    var aLen = arguments.length;
    var larg = 0;
    var arg, div;
    while (i < aLen) {
      arg = abs$4(arguments[i++]);
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

var $$4s = _export;
var fails$$ = fails$1z;

// eslint-disable-next-line es/no-math-imul -- required for testing
var $imul = Math.imul;

var FORCED$o = fails$$(function () {
  return $imul(0xFFFFFFFF, 5) !== -5 || $imul.length !== 2;
});

// `Math.imul` method
// https://tc39.es/ecma262/#sec-math.imul
// some WebKit versions fails with big numbers, some has wrong arity
$$4s({ target: 'Math', stat: true, forced: FORCED$o }, {
  imul: function imul(x, y) {
    var UINT16 = 0xFFFF;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});

var log$2 = Math.log;
var LOG10E = Math.LOG10E;

// eslint-disable-next-line es/no-math-log10 -- safe
var mathLog10 = Math.log10 || function log10(x) {
  return log$2(x) * LOG10E;
};

var $$4r = _export;
var log10$1 = mathLog10;

// `Math.log10` method
// https://tc39.es/ecma262/#sec-math.log10
$$4r({ target: 'Math', stat: true }, {
  log10: log10$1
});

var $$4q = _export;
var log1p = mathLog1p;

// `Math.log1p` method
// https://tc39.es/ecma262/#sec-math.log1p
$$4q({ target: 'Math', stat: true }, { log1p: log1p });

var $$4p = _export;

var log$1 = Math.log;
var LN2 = Math.LN2;

// `Math.log2` method
// https://tc39.es/ecma262/#sec-math.log2
$$4p({ target: 'Math', stat: true }, {
  log2: function log2(x) {
    return log$1(x) / LN2;
  }
});

var $$4o = _export;
var sign = mathSign;

// `Math.sign` method
// https://tc39.es/ecma262/#sec-math.sign
$$4o({ target: 'Math', stat: true }, {
  sign: sign
});

var $$4n = _export;
var fails$_ = fails$1z;
var expm1$1 = mathExpm1;

var abs$3 = Math.abs;
var exp$1 = Math.exp;
var E = Math.E;

var FORCED$n = fails$_(function () {
  // eslint-disable-next-line es/no-math-sinh -- required for testing
  return Math.sinh(-2e-17) !== -2e-17;
});

// `Math.sinh` method
// https://tc39.es/ecma262/#sec-math.sinh
// V8 near Chromium 38 has a problem with very small numbers
$$4n({ target: 'Math', stat: true, forced: FORCED$n }, {
  sinh: function sinh(x) {
    var n = +x;
    return abs$3(n) < 1 ? (expm1$1(n) - expm1$1(-n)) / 2 : (exp$1(n - 1) - exp$1(-n - 1)) * (E / 2);
  }
});

var $$4m = _export;
var expm1 = mathExpm1;

var exp = Math.exp;

// `Math.tanh` method
// https://tc39.es/ecma262/#sec-math.tanh
$$4m({ target: 'Math', stat: true }, {
  tanh: function tanh(x) {
    var n = +x;
    var a = expm1(n);
    var b = expm1(-n);
    return a === Infinity ? 1 : b === Infinity ? -1 : (a - b) / (exp(n) + exp(-n));
  }
});

var setToStringTag$6 = setToStringTag$e;

// Math[@@toStringTag] property
// https://tc39.es/ecma262/#sec-math-@@tostringtag
setToStringTag$6(Math, 'Math', true);

var $$4l = _export;
var trunc = mathTrunc;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
$$4l({ target: 'Math', stat: true }, {
  trunc: trunc
});

var uncurryThis$1i = functionUncurryThis;

// `thisNumberValue` abstract operation
// https://tc39.es/ecma262/#sec-thisnumbervalue
var thisNumberValue$5 = uncurryThis$1i(1.0.valueOf);

// a string of all valid unicode whitespaces
var whitespaces$6 = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var uncurryThis$1h = functionUncurryThis;
var requireObjectCoercible$j = requireObjectCoercible$q;
var toString$A = toString$J;
var whitespaces$5 = whitespaces$6;

var replace$8 = uncurryThis$1h(''.replace);
var ltrim = RegExp('^[' + whitespaces$5 + ']+');
var rtrim = RegExp('(^|[^' + whitespaces$5 + '])[' + whitespaces$5 + ']+$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$3 = function (TYPE) {
  return function ($this) {
    var string = toString$A(requireObjectCoercible$j($this));
    if (TYPE & 1) string = replace$8(string, ltrim, '');
    if (TYPE & 2) string = replace$8(string, rtrim, '$1');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod$3(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod$3(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod$3(3)
};

var $$4k = _export;
var IS_PURE$i = isPure;
var DESCRIPTORS$B = descriptors;
var globalThis$T = globalThis_1;
var path = path$2;
var uncurryThis$1g = functionUncurryThis;
var isForced$2 = isForced_1;
var hasOwn$n = hasOwnProperty_1;
var inheritIfRequired$3 = inheritIfRequired$7;
var isPrototypeOf$6 = objectIsPrototypeOf;
var isSymbol$3 = isSymbol$8;
var toPrimitive$1 = toPrimitive$4;
var fails$Z = fails$1z;
var getOwnPropertyNames$4 = objectGetOwnPropertyNames.f;
var getOwnPropertyDescriptor$a = objectGetOwnPropertyDescriptor.f;
var defineProperty$9 = objectDefineProperty.f;
var thisNumberValue$4 = thisNumberValue$5;
var trim$2 = stringTrim.trim;

var NUMBER = 'Number';
var NativeNumber = globalThis$T[NUMBER];
path[NUMBER];
var NumberPrototype = NativeNumber.prototype;
var TypeError$6 = globalThis$T.TypeError;
var stringSlice$i = uncurryThis$1g(''.slice);
var charCodeAt$7 = uncurryThis$1g(''.charCodeAt);

// `ToNumeric` abstract operation
// https://tc39.es/ecma262/#sec-tonumeric
var toNumeric = function (value) {
  var primValue = toPrimitive$1(value, 'number');
  return typeof primValue == 'bigint' ? primValue : toNumber(primValue);
};

// `ToNumber` abstract operation
// https://tc39.es/ecma262/#sec-tonumber
var toNumber = function (argument) {
  var it = toPrimitive$1(argument, 'number');
  var first, third, radix, maxCode, digits, length, index, code;
  if (isSymbol$3(it)) throw new TypeError$6('Cannot convert a Symbol value to a number');
  if (typeof it == 'string' && it.length > 2) {
    it = trim$2(it);
    first = charCodeAt$7(it, 0);
    if (first === 43 || first === 45) {
      third = charCodeAt$7(it, 2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (charCodeAt$7(it, 1)) {
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
      digits = stringSlice$i(it, 2);
      length = digits.length;
      for (index = 0; index < length; index++) {
        code = charCodeAt$7(digits, index);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

var FORCED$m = isForced$2(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'));

var calledWithNew = function (dummy) {
  // includes check on 1..constructor(foo) case
  return isPrototypeOf$6(NumberPrototype, dummy) && fails$Z(function () { thisNumberValue$4(dummy); });
};

// `Number` constructor
// https://tc39.es/ecma262/#sec-number-constructor
var NumberWrapper = function Number(value) {
  var n = arguments.length < 1 ? 0 : NativeNumber(toNumeric(value));
  return calledWithNew(this) ? inheritIfRequired$3(Object(n), this, NumberWrapper) : n;
};

NumberWrapper.prototype = NumberPrototype;
if (FORCED$m && !IS_PURE$i) NumberPrototype.constructor = NumberWrapper;

$$4k({ global: true, constructor: true, wrap: true, forced: FORCED$m }, {
  Number: NumberWrapper
});

// Use `internal/copy-constructor-properties` helper in `core-js@4`
var copyConstructorProperties$1 = function (target, source) {
  for (var keys = DESCRIPTORS$B ? getOwnPropertyNames$4(source) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,' +
    // ESNext
    'fromString,range'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (hasOwn$n(source, key = keys[j]) && !hasOwn$n(target, key)) {
      defineProperty$9(target, key, getOwnPropertyDescriptor$a(source, key));
    }
  }
};
if (FORCED$m || IS_PURE$i) copyConstructorProperties$1(path[NUMBER], NativeNumber);

var $$4j = _export;

// `Number.EPSILON` constant
// https://tc39.es/ecma262/#sec-number.epsilon
$$4j({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
  EPSILON: Math.pow(2, -52)
});

var globalThis$S = globalThis_1;

var globalIsFinite = globalThis$S.isFinite;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
// eslint-disable-next-line es/no-number-isfinite -- safe
var numberIsFinite$2 = Number.isFinite || function isFinite(it) {
  return typeof it == 'number' && globalIsFinite(it);
};

var $$4i = _export;
var numberIsFinite$1 = numberIsFinite$2;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
$$4i({ target: 'Number', stat: true }, { isFinite: numberIsFinite$1 });

var isObject$t = isObject$N;

var floor$6 = Math.floor;

// `IsIntegralNumber` abstract operation
// https://tc39.es/ecma262/#sec-isintegralnumber
// eslint-disable-next-line es/no-number-isinteger -- safe
var isIntegralNumber$3 = Number.isInteger || function isInteger(it) {
  return !isObject$t(it) && isFinite(it) && floor$6(it) === it;
};

var $$4h = _export;
var isIntegralNumber$2 = isIntegralNumber$3;

// `Number.isInteger` method
// https://tc39.es/ecma262/#sec-number.isinteger
$$4h({ target: 'Number', stat: true }, {
  isInteger: isIntegralNumber$2
});

var $$4g = _export;

// `Number.isNaN` method
// https://tc39.es/ecma262/#sec-number.isnan
$$4g({ target: 'Number', stat: true }, {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare -- NaN check
    return number !== number;
  }
});

var $$4f = _export;
var isIntegralNumber$1 = isIntegralNumber$3;

var abs$2 = Math.abs;

// `Number.isSafeInteger` method
// https://tc39.es/ecma262/#sec-number.issafeinteger
$$4f({ target: 'Number', stat: true }, {
  isSafeInteger: function isSafeInteger(number) {
    return isIntegralNumber$1(number) && abs$2(number) <= 0x1FFFFFFFFFFFFF;
  }
});

var $$4e = _export;

// `Number.MAX_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.max_safe_integer
$$4e({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
});

var $$4d = _export;

// `Number.MIN_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.min_safe_integer
$$4d({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
  MIN_SAFE_INTEGER: -0x1FFFFFFFFFFFFF
});

var globalThis$R = globalThis_1;
var fails$Y = fails$1z;
var uncurryThis$1f = functionUncurryThis;
var toString$z = toString$J;
var trim$1 = stringTrim.trim;
var whitespaces$4 = whitespaces$6;

var charAt$k = uncurryThis$1f(''.charAt);
var $parseFloat$1 = globalThis$R.parseFloat;
var Symbol$6 = globalThis$R.Symbol;
var ITERATOR$7 = Symbol$6 && Symbol$6.iterator;
var FORCED$l = 1 / $parseFloat$1(whitespaces$4 + '-0') !== -Infinity
  // MS Edge 18- broken with boxed symbols
  || (ITERATOR$7 && !fails$Y(function () { $parseFloat$1(Object(ITERATOR$7)); }));

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
var numberParseFloat = FORCED$l ? function parseFloat(string) {
  var trimmedString = trim$1(toString$z(string));
  var result = $parseFloat$1(trimmedString);
  return result === 0 && charAt$k(trimmedString, 0) === '-' ? -0 : result;
} : $parseFloat$1;

var $$4c = _export;
var parseFloat$1 = numberParseFloat;

// `Number.parseFloat` method
// https://tc39.es/ecma262/#sec-number.parseFloat
// eslint-disable-next-line es/no-number-parsefloat -- required for testing
$$4c({ target: 'Number', stat: true, forced: Number.parseFloat !== parseFloat$1 }, {
  parseFloat: parseFloat$1
});

var globalThis$Q = globalThis_1;
var fails$X = fails$1z;
var uncurryThis$1e = functionUncurryThis;
var toString$y = toString$J;
var trim = stringTrim.trim;
var whitespaces$3 = whitespaces$6;

var $parseInt$4 = globalThis$Q.parseInt;
var Symbol$5 = globalThis$Q.Symbol;
var ITERATOR$6 = Symbol$5 && Symbol$5.iterator;
var hex = /^[+-]?0x/i;
var exec$e = uncurryThis$1e(hex.exec);
var FORCED$k = $parseInt$4(whitespaces$3 + '08') !== 8 || $parseInt$4(whitespaces$3 + '0x16') !== 22
  // MS Edge 18- broken with boxed symbols
  || (ITERATOR$6 && !fails$X(function () { $parseInt$4(Object(ITERATOR$6)); }));

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
var numberParseInt = FORCED$k ? function parseInt(string, radix) {
  var S = trim(toString$y(string));
  return $parseInt$4(S, (radix >>> 0) || (exec$e(hex, S) ? 16 : 10));
} : $parseInt$4;

var $$4b = _export;
var parseInt$3 = numberParseInt;

// `Number.parseInt` method
// https://tc39.es/ecma262/#sec-number.parseint
// eslint-disable-next-line es/no-number-parseint -- required for testing
$$4b({ target: 'Number', stat: true, forced: Number.parseInt !== parseInt$3 }, {
  parseInt: parseInt$3
});

var $$4a = _export;
var uncurryThis$1d = functionUncurryThis;
var toIntegerOrInfinity$c = toIntegerOrInfinity$p;
var thisNumberValue$3 = thisNumberValue$5;
var $repeat$1 = stringRepeat;
var log10 = mathLog10;
var fails$W = fails$1z;

var $RangeError$a = RangeError;
var $String$3 = String;
var $isFinite = isFinite;
var abs$1 = Math.abs;
var floor$5 = Math.floor;
var pow$4 = Math.pow;
var round$1 = Math.round;
var nativeToExponential = uncurryThis$1d(1.0.toExponential);
var repeat$2 = uncurryThis$1d($repeat$1);
var stringSlice$h = uncurryThis$1d(''.slice);

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
  return fails$W(function () {
    nativeToExponential(1, Infinity);
  }) && fails$W(function () {
    nativeToExponential(1, -Infinity);
  });
};

// Safari <11 && FF <50
var properNonFiniteThisCheck = function () {
  return !fails$W(function () {
    nativeToExponential(Infinity, Infinity);
    nativeToExponential(NaN, Infinity);
  });
};

var FORCED$j = !ROUNDS_PROPERLY || !throwsOnInfinityFraction() || !properNonFiniteThisCheck();

// `Number.prototype.toExponential` method
// https://tc39.es/ecma262/#sec-number.prototype.toexponential
$$4a({ target: 'Number', proto: true, forced: FORCED$j }, {
  toExponential: function toExponential(fractionDigits) {
    var x = thisNumberValue$3(this);
    if (fractionDigits === undefined) return nativeToExponential(x);
    var f = toIntegerOrInfinity$c(fractionDigits);
    if (!$isFinite(x)) return String(x);
    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
    if (f < 0 || f > 20) throw new $RangeError$a('Incorrect fraction digits');
    if (ROUNDS_PROPERLY) return nativeToExponential(x, f);
    var s = '';
    var m, e, c, d;
    if (x < 0) {
      s = '-';
      x = -x;
    }
    if (x === 0) {
      e = 0;
      m = repeat$2('0', f + 1);
    } else {
      // this block is based on https://gist.github.com/SheetJSDev/1100ad56b9f856c95299ed0e068eea08
      // TODO: improve accuracy with big fraction digits
      var l = log10(x);
      e = floor$5(l);
      var w = pow$4(10, e - f);
      var n = round$1(x / w);
      if (2 * x >= (2 * n + 1) * w) {
        n += 1;
      }
      if (n >= pow$4(10, f + 1)) {
        n /= 10;
        e += 1;
      }
      m = $String$3(n);
    }
    if (f !== 0) {
      m = stringSlice$h(m, 0, 1) + '.' + stringSlice$h(m, 1);
    }
    if (e === 0) {
      c = '+';
      d = '0';
    } else {
      c = e > 0 ? '+' : '-';
      d = $String$3(abs$1(e));
    }
    m += 'e' + c + d;
    return s + m;
  }
});

var $$49 = _export;
var uncurryThis$1c = functionUncurryThis;
var toIntegerOrInfinity$b = toIntegerOrInfinity$p;
var thisNumberValue$2 = thisNumberValue$5;
var $repeat = stringRepeat;
var fails$V = fails$1z;

var $RangeError$9 = RangeError;
var $String$2 = String;
var floor$4 = Math.floor;
var repeat$1 = uncurryThis$1c($repeat);
var stringSlice$g = uncurryThis$1c(''.slice);
var nativeToFixed = uncurryThis$1c(1.0.toFixed);

var pow$3 = function (x, n, acc) {
  return n === 0 ? acc : n % 2 === 1 ? pow$3(x, n - 1, acc * x) : pow$3(x * x, n / 2, acc);
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
    c2 = floor$4(c2 / 1e7);
  }
};

var divide = function (data, n) {
  var index = 6;
  var c = 0;
  while (--index >= 0) {
    c += data[index];
    data[index] = floor$4(c / n);
    c = (c % n) * 1e7;
  }
};

var dataToString = function (data) {
  var index = 6;
  var s = '';
  while (--index >= 0) {
    if (s !== '' || index === 0 || data[index] !== 0) {
      var t = $String$2(data[index]);
      s = s === '' ? t : s + repeat$1('0', 7 - t.length) + t;
    }
  } return s;
};

var FORCED$i = fails$V(function () {
  return nativeToFixed(0.00008, 3) !== '0.000' ||
    nativeToFixed(0.9, 0) !== '1' ||
    nativeToFixed(1.255, 2) !== '1.25' ||
    nativeToFixed(1000000000000000128.0, 0) !== '1000000000000000128';
}) || !fails$V(function () {
  // V8 ~ Android 4.3-
  nativeToFixed({});
});

// `Number.prototype.toFixed` method
// https://tc39.es/ecma262/#sec-number.prototype.tofixed
$$49({ target: 'Number', proto: true, forced: FORCED$i }, {
  toFixed: function toFixed(fractionDigits) {
    var number = thisNumberValue$2(this);
    var fractDigits = toIntegerOrInfinity$b(fractionDigits);
    var data = [0, 0, 0, 0, 0, 0];
    var sign = '';
    var result = '0';
    var e, z, j, k;

    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
    if (fractDigits < 0 || fractDigits > 20) throw new $RangeError$9('Incorrect fraction digits');
    // eslint-disable-next-line no-self-compare -- NaN check
    if (number !== number) return 'NaN';
    if (number <= -1e21 || number >= 1e21) return $String$2(number);
    if (number < 0) {
      sign = '-';
      number = -number;
    }
    if (number > 1e-21) {
      e = log(number * pow$3(2, 69, 1)) - 69;
      z = e < 0 ? number * pow$3(2, -e, 1) : number / pow$3(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if (e > 0) {
        multiply(data, 0, z);
        j = fractDigits;
        while (j >= 7) {
          multiply(data, 1e7, 0);
          j -= 7;
        }
        multiply(data, pow$3(10, j, 1), 0);
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
        result = dataToString(data) + repeat$1('0', fractDigits);
      }
    }
    if (fractDigits > 0) {
      k = result.length;
      result = sign + (k <= fractDigits
        ? '0.' + repeat$1('0', fractDigits - k) + result
        : stringSlice$g(result, 0, k - fractDigits) + '.' + stringSlice$g(result, k - fractDigits));
    } else {
      result = sign + result;
    } return result;
  }
});

var $$48 = _export;
var uncurryThis$1b = functionUncurryThis;
var fails$U = fails$1z;
var thisNumberValue$1 = thisNumberValue$5;

var nativeToPrecision = uncurryThis$1b(1.0.toPrecision);

var FORCED$h = fails$U(function () {
  // IE7-
  return nativeToPrecision(1, undefined) !== '1';
}) || !fails$U(function () {
  // V8 ~ Android 4.3-
  nativeToPrecision({});
});

// `Number.prototype.toPrecision` method
// https://tc39.es/ecma262/#sec-number.prototype.toprecision
$$48({ target: 'Number', proto: true, forced: FORCED$h }, {
  toPrecision: function toPrecision(precision) {
    return precision === undefined
      ? nativeToPrecision(thisNumberValue$1(this))
      : nativeToPrecision(thisNumberValue$1(this), precision);
  }
});

var DESCRIPTORS$A = descriptors;
var uncurryThis$1a = functionUncurryThis;
var call$14 = functionCall;
var fails$T = fails$1z;
var objectKeys$3 = objectKeys$6;
var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
var propertyIsEnumerableModule = objectPropertyIsEnumerable;
var toObject$l = toObject$E;
var IndexedObject$2 = indexedObject;

// eslint-disable-next-line es/no-object-assign -- safe
var $assign = Object.assign;
// eslint-disable-next-line es/no-object-defineproperty -- required for testing
var defineProperty$8 = Object.defineProperty;
var concat$2 = uncurryThis$1a([].concat);

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
var objectAssign = !$assign || fails$T(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS$A && $assign({ b: 1 }, $assign(defineProperty$8({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty$8(this, 'b', {
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
  return $assign({}, A)[symbol] !== 7 || objectKeys$3($assign({}, B)).join('') !== alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject$l(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject$2(arguments[index++]);
    var keys = getOwnPropertySymbols ? concat$2(objectKeys$3(S), getOwnPropertySymbols(S)) : objectKeys$3(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS$A || call$14(propertyIsEnumerable, S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

var $$47 = _export;
var assign$1 = objectAssign;

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
// eslint-disable-next-line es/no-object-assign -- required for testing
$$47({ target: 'Object', stat: true, arity: 2, forced: Object.assign !== assign$1 }, {
  assign: assign$1
});

// TODO: Remove from `core-js@4`
var $$46 = _export;
var DESCRIPTORS$z = descriptors;
var create$e = objectCreate$1;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
$$46({ target: 'Object', stat: true, sham: !DESCRIPTORS$z }, {
  create: create$e
});

var globalThis$P = globalThis_1;
var fails$S = fails$1z;
var WEBKIT$1 = environmentWebkitVersion;

// Forced replacement object prototype accessors methods
var objectPrototypeAccessorsForced = !fails$S(function () {
  // This feature detection crashes old WebKit
  // https://github.com/zloirock/core-js/issues/232
  if (WEBKIT$1 && WEBKIT$1 < 535) return;
  var key = Math.random();
  // In FF throws only define methods
  __defineSetter__.call(null, key, function () { /* empty */ });
  delete globalThis$P[key];
});

var $$45 = _export;
var DESCRIPTORS$y = descriptors;
var FORCED$g = objectPrototypeAccessorsForced;
var aCallable$C = aCallable$N;
var toObject$k = toObject$E;
var definePropertyModule$4 = objectDefineProperty;

// `Object.prototype.__defineGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineGetter__
if (DESCRIPTORS$y) {
  $$45({ target: 'Object', proto: true, forced: FORCED$g }, {
    __defineGetter__: function __defineGetter__(P, getter) {
      definePropertyModule$4.f(toObject$k(this), P, { get: aCallable$C(getter), enumerable: true, configurable: true });
    }
  });
}

var $$44 = _export;
var DESCRIPTORS$x = descriptors;
var defineProperties = objectDefineProperties.f;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
$$44({ target: 'Object', stat: true, forced: Object.defineProperties !== defineProperties, sham: !DESCRIPTORS$x }, {
  defineProperties: defineProperties
});

var $$43 = _export;
var DESCRIPTORS$w = descriptors;
var defineProperty$7 = objectDefineProperty.f;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
// eslint-disable-next-line es/no-object-defineproperty -- safe
$$43({ target: 'Object', stat: true, forced: Object.defineProperty !== defineProperty$7, sham: !DESCRIPTORS$w }, {
  defineProperty: defineProperty$7
});

var $$42 = _export;
var DESCRIPTORS$v = descriptors;
var FORCED$f = objectPrototypeAccessorsForced;
var aCallable$B = aCallable$N;
var toObject$j = toObject$E;
var definePropertyModule$3 = objectDefineProperty;

// `Object.prototype.__defineSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineSetter__
if (DESCRIPTORS$v) {
  $$42({ target: 'Object', proto: true, forced: FORCED$f }, {
    __defineSetter__: function __defineSetter__(P, setter) {
      definePropertyModule$3.f(toObject$j(this), P, { set: aCallable$B(setter), enumerable: true, configurable: true });
    }
  });
}

var DESCRIPTORS$u = descriptors;
var fails$R = fails$1z;
var uncurryThis$19 = functionUncurryThis;
var objectGetPrototypeOf$1 = objectGetPrototypeOf$2;
var objectKeys$2 = objectKeys$6;
var toIndexedObject$5 = toIndexedObject$k;
var $propertyIsEnumerable = objectPropertyIsEnumerable.f;

var propertyIsEnumerable = uncurryThis$19($propertyIsEnumerable);
var push$l = uncurryThis$19([].push);

// in some IE versions, `propertyIsEnumerable` returns incorrect result on integer keys
// of `null` prototype objects
var IE_BUG = DESCRIPTORS$u && fails$R(function () {
  // eslint-disable-next-line es/no-object-create -- safe
  var O = Object.create(null);
  O[2] = 2;
  return !propertyIsEnumerable(O, 2);
});

// `Object.{ entries, values }` methods implementation
var createMethod$2 = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject$5(it);
    var keys = objectKeys$2(O);
    var IE_WORKAROUND = IE_BUG && objectGetPrototypeOf$1(O) === null;
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS$u || (IE_WORKAROUND ? key in O : propertyIsEnumerable(O, key))) {
        push$l(result, TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

var objectToArray = {
  // `Object.entries` method
  // https://tc39.es/ecma262/#sec-object.entries
  entries: createMethod$2(true),
  // `Object.values` method
  // https://tc39.es/ecma262/#sec-object.values
  values: createMethod$2(false)
};

var $$41 = _export;
var $entries = objectToArray.entries;

// `Object.entries` method
// https://tc39.es/ecma262/#sec-object.entries
$$41({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return $entries(O);
  }
});

var $$40 = _export;
var FREEZING$6 = freezing;
var fails$Q = fails$1z;
var isObject$s = isObject$N;
var onFreeze$2 = internalMetadataExports.onFreeze;

// eslint-disable-next-line es/no-object-freeze -- safe
var $freeze = Object.freeze;
var FAILS_ON_PRIMITIVES$5 = fails$Q(function () { $freeze(1); });

// `Object.freeze` method
// https://tc39.es/ecma262/#sec-object.freeze
$$40({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$5, sham: !FREEZING$6 }, {
  freeze: function freeze(it) {
    return $freeze && isObject$s(it) ? $freeze(onFreeze$2(it)) : it;
  }
});

var $$3$ = _export;
var iterate$C = iterate$H;
var createProperty$5 = createProperty$b;

// `Object.fromEntries` method
// https://github.com/tc39/proposal-object-from-entries
$$3$({ target: 'Object', stat: true }, {
  fromEntries: function fromEntries(iterable) {
    var obj = {};
    iterate$C(iterable, function (k, v) {
      createProperty$5(obj, k, v);
    }, { AS_ENTRIES: true });
    return obj;
  }
});

var $$3_ = _export;
var fails$P = fails$1z;
var toIndexedObject$4 = toIndexedObject$k;
var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var DESCRIPTORS$t = descriptors;

var FORCED$e = !DESCRIPTORS$t || fails$P(function () { nativeGetOwnPropertyDescriptor$1(1); });

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
$$3_({ target: 'Object', stat: true, forced: FORCED$e, sham: !DESCRIPTORS$t }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor$1(toIndexedObject$4(it), key);
  }
});

var $$3Z = _export;
var DESCRIPTORS$s = descriptors;
var ownKeys$1 = ownKeys$3;
var toIndexedObject$3 = toIndexedObject$k;
var getOwnPropertyDescriptorModule$4 = objectGetOwnPropertyDescriptor;
var createProperty$4 = createProperty$b;

// `Object.getOwnPropertyDescriptors` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
$$3Z({ target: 'Object', stat: true, sham: !DESCRIPTORS$s }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject$3(object);
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$4.f;
    var keys = ownKeys$1(O);
    var result = {};
    var index = 0;
    var key, descriptor;
    while (keys.length > index) {
      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
      if (descriptor !== undefined) createProperty$4(result, key, descriptor);
    }
    return result;
  }
});

var $$3Y = _export;
var fails$O = fails$1z;
var getOwnPropertyNames$3 = objectGetOwnPropertyNamesExternal.f;

// eslint-disable-next-line es/no-object-getownpropertynames -- required for testing
var FAILS_ON_PRIMITIVES$4 = fails$O(function () { return !Object.getOwnPropertyNames(1); });

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
$$3Y({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$4 }, {
  getOwnPropertyNames: getOwnPropertyNames$3
});

var $$3X = _export;
var fails$N = fails$1z;
var toObject$i = toObject$E;
var nativeGetPrototypeOf = objectGetPrototypeOf$2;
var CORRECT_PROTOTYPE_GETTER$1 = correctPrototypeGetter;

var FAILS_ON_PRIMITIVES$3 = fails$N(function () { nativeGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
$$3X({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$3, sham: !CORRECT_PROTOTYPE_GETTER$1 }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject$i(it));
  }
});

var $$3W = _export;
var getBuiltIn$C = getBuiltIn$O;
var uncurryThis$18 = functionUncurryThis;
var aCallable$A = aCallable$N;
var requireObjectCoercible$i = requireObjectCoercible$q;
var toPropertyKey$5 = toPropertyKey$9;
var iterate$B = iterate$H;
var fails$M = fails$1z;

// eslint-disable-next-line es/no-object-groupby -- testing
var nativeGroupBy = Object.groupBy;
var create$d = getBuiltIn$C('Object', 'create');
var push$k = uncurryThis$18([].push);

var DOES_NOT_WORK_WITH_PRIMITIVES = !nativeGroupBy || fails$M(function () {
  return nativeGroupBy('ab', function (it) {
    return it;
  }).a.length !== 1;
});

// `Object.groupBy` method
// https://github.com/tc39/proposal-array-grouping
$$3W({ target: 'Object', stat: true, forced: DOES_NOT_WORK_WITH_PRIMITIVES }, {
  groupBy: function groupBy(items, callbackfn) {
    requireObjectCoercible$i(items);
    aCallable$A(callbackfn);
    var obj = create$d(null);
    var k = 0;
    iterate$B(items, function (value) {
      var key = toPropertyKey$5(callbackfn(value, k++));
      // in some IE versions, `hasOwnProperty` returns incorrect result on integer keys
      // but since it's a `null` prototype object, we can safely use `in`
      if (key in obj) push$k(obj[key], value);
      else obj[key] = [value];
    });
    return obj;
  }
});

var $$3V = _export;
var hasOwn$m = hasOwnProperty_1;

// `Object.hasOwn` method
// https://tc39.es/ecma262/#sec-object.hasown
$$3V({ target: 'Object', stat: true }, {
  hasOwn: hasOwn$m
});

// `SameValue` abstract operation
// https://tc39.es/ecma262/#sec-samevalue
// eslint-disable-next-line es/no-object-is -- safe
var sameValue$1 = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y ? x !== 0 || 1 / x === 1 / y : x !== x && y !== y;
};

var $$3U = _export;
var is = sameValue$1;

// `Object.is` method
// https://tc39.es/ecma262/#sec-object.is
$$3U({ target: 'Object', stat: true }, {
  is: is
});

var $$3T = _export;
var $isExtensible$1 = objectIsExtensible;

// `Object.isExtensible` method
// https://tc39.es/ecma262/#sec-object.isextensible
// eslint-disable-next-line es/no-object-isextensible -- safe
$$3T({ target: 'Object', stat: true, forced: Object.isExtensible !== $isExtensible$1 }, {
  isExtensible: $isExtensible$1
});

var $$3S = _export;
var fails$L = fails$1z;
var isObject$r = isObject$N;
var classof$f = classofRaw$2;
var ARRAY_BUFFER_NON_EXTENSIBLE$1 = arrayBufferNonExtensible;

// eslint-disable-next-line es/no-object-isfrozen -- safe
var $isFrozen = Object.isFrozen;

var FORCED$d = ARRAY_BUFFER_NON_EXTENSIBLE$1 || fails$L(function () { $isFrozen(1); });

// `Object.isFrozen` method
// https://tc39.es/ecma262/#sec-object.isfrozen
$$3S({ target: 'Object', stat: true, forced: FORCED$d }, {
  isFrozen: function isFrozen(it) {
    if (!isObject$r(it)) return true;
    if (ARRAY_BUFFER_NON_EXTENSIBLE$1 && classof$f(it) === 'ArrayBuffer') return true;
    return $isFrozen ? $isFrozen(it) : false;
  }
});

var $$3R = _export;
var fails$K = fails$1z;
var isObject$q = isObject$N;
var classof$e = classofRaw$2;
var ARRAY_BUFFER_NON_EXTENSIBLE = arrayBufferNonExtensible;

// eslint-disable-next-line es/no-object-issealed -- safe
var $isSealed = Object.isSealed;

var FORCED$c = ARRAY_BUFFER_NON_EXTENSIBLE || fails$K(function () { $isSealed(1); });

// `Object.isSealed` method
// https://tc39.es/ecma262/#sec-object.issealed
$$3R({ target: 'Object', stat: true, forced: FORCED$c }, {
  isSealed: function isSealed(it) {
    if (!isObject$q(it)) return true;
    if (ARRAY_BUFFER_NON_EXTENSIBLE && classof$e(it) === 'ArrayBuffer') return true;
    return $isSealed ? $isSealed(it) : false;
  }
});

var $$3Q = _export;
var toObject$h = toObject$E;
var nativeKeys = objectKeys$6;
var fails$J = fails$1z;

var FAILS_ON_PRIMITIVES$2 = fails$J(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
$$3Q({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2 }, {
  keys: function keys(it) {
    return nativeKeys(toObject$h(it));
  }
});

var $$3P = _export;
var DESCRIPTORS$r = descriptors;
var FORCED$b = objectPrototypeAccessorsForced;
var toObject$g = toObject$E;
var toPropertyKey$4 = toPropertyKey$9;
var getPrototypeOf$b = objectGetPrototypeOf$2;
var getOwnPropertyDescriptor$9 = objectGetOwnPropertyDescriptor.f;

// `Object.prototype.__lookupGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupGetter__
if (DESCRIPTORS$r) {
  $$3P({ target: 'Object', proto: true, forced: FORCED$b }, {
    __lookupGetter__: function __lookupGetter__(P) {
      var O = toObject$g(this);
      var key = toPropertyKey$4(P);
      var desc;
      do {
        if (desc = getOwnPropertyDescriptor$9(O, key)) return desc.get;
      } while (O = getPrototypeOf$b(O));
    }
  });
}

var $$3O = _export;
var DESCRIPTORS$q = descriptors;
var FORCED$a = objectPrototypeAccessorsForced;
var toObject$f = toObject$E;
var toPropertyKey$3 = toPropertyKey$9;
var getPrototypeOf$a = objectGetPrototypeOf$2;
var getOwnPropertyDescriptor$8 = objectGetOwnPropertyDescriptor.f;

// `Object.prototype.__lookupSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupSetter__
if (DESCRIPTORS$q) {
  $$3O({ target: 'Object', proto: true, forced: FORCED$a }, {
    __lookupSetter__: function __lookupSetter__(P) {
      var O = toObject$f(this);
      var key = toPropertyKey$3(P);
      var desc;
      do {
        if (desc = getOwnPropertyDescriptor$8(O, key)) return desc.set;
      } while (O = getPrototypeOf$a(O));
    }
  });
}

var $$3N = _export;
var isObject$p = isObject$N;
var onFreeze$1 = internalMetadataExports.onFreeze;
var FREEZING$5 = freezing;
var fails$I = fails$1z;

// eslint-disable-next-line es/no-object-preventextensions -- safe
var $preventExtensions = Object.preventExtensions;
var FAILS_ON_PRIMITIVES$1 = fails$I(function () { $preventExtensions(1); });

// `Object.preventExtensions` method
// https://tc39.es/ecma262/#sec-object.preventextensions
$$3N({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$1, sham: !FREEZING$5 }, {
  preventExtensions: function preventExtensions(it) {
    return $preventExtensions && isObject$p(it) ? $preventExtensions(onFreeze$1(it)) : it;
  }
});

var DESCRIPTORS$p = descriptors;
var defineBuiltInAccessor$g = defineBuiltInAccessor$p;
var isObject$o = isObject$N;
var isPossiblePrototype = isPossiblePrototype$2;
var toObject$e = toObject$E;
var requireObjectCoercible$h = requireObjectCoercible$q;

// eslint-disable-next-line es/no-object-getprototypeof -- safe
var getPrototypeOf$9 = Object.getPrototypeOf;
// eslint-disable-next-line es/no-object-setprototypeof -- safe
var setPrototypeOf$4 = Object.setPrototypeOf;
var ObjectPrototype$1 = Object.prototype;
var PROTO = '__proto__';

// `Object.prototype.__proto__` accessor
// https://tc39.es/ecma262/#sec-object.prototype.__proto__
if (DESCRIPTORS$p && getPrototypeOf$9 && setPrototypeOf$4 && !(PROTO in ObjectPrototype$1)) try {
  defineBuiltInAccessor$g(ObjectPrototype$1, PROTO, {
    configurable: true,
    get: function __proto__() {
      return getPrototypeOf$9(toObject$e(this));
    },
    set: function __proto__(proto) {
      var O = requireObjectCoercible$h(this);
      if (isPossiblePrototype(proto) && isObject$o(O)) {
        setPrototypeOf$4(O, proto);
      }
    }
  });
} catch (error) { /* empty */ }

var $$3M = _export;
var isObject$n = isObject$N;
var onFreeze = internalMetadataExports.onFreeze;
var FREEZING$4 = freezing;
var fails$H = fails$1z;

// eslint-disable-next-line es/no-object-seal -- safe
var $seal = Object.seal;
var FAILS_ON_PRIMITIVES = fails$H(function () { $seal(1); });

// `Object.seal` method
// https://tc39.es/ecma262/#sec-object.seal
$$3M({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING$4 }, {
  seal: function seal(it) {
    return $seal && isObject$n(it) ? $seal(onFreeze(it)) : it;
  }
});

var $$3L = _export;
var setPrototypeOf$3 = objectSetPrototypeOf$1;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
$$3L({ target: 'Object', stat: true }, {
  setPrototypeOf: setPrototypeOf$3
});

var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
var classof$d = classof$q;

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
  return '[object ' + classof$d(this) + ']';
};

var TO_STRING_TAG_SUPPORT = toStringTagSupport;
var defineBuiltIn$i = defineBuiltIn$u;
var toString$x = objectToString;

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT) {
  defineBuiltIn$i(Object.prototype, 'toString', toString$x, { unsafe: true });
}

var $$3K = _export;
var $values = objectToArray.values;

// `Object.values` method
// https://tc39.es/ecma262/#sec-object.values
$$3K({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});

var $$3J = _export;
var $parseFloat = numberParseFloat;

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
$$3J({ global: true, forced: parseFloat !== $parseFloat }, {
  parseFloat: $parseFloat
});

var $$3I = _export;
var $parseInt$3 = numberParseInt;

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
$$3I({ global: true, forced: parseInt !== $parseInt$3 }, {
  parseInt: $parseInt$3
});

var $TypeError$v = TypeError;

var validateArgumentsLength$c = function (passed, required) {
  if (passed < required) throw new $TypeError$v('Not enough arguments');
  return passed;
};

var userAgent$3 = environmentUserAgent;

// eslint-disable-next-line redos/no-vulnerable -- safe
var environmentIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(userAgent$3);

var globalThis$O = globalThis_1;
var apply$9 = functionApply$1;
var bind$n = functionBindContext;
var isCallable$l = isCallable$I;
var hasOwn$l = hasOwnProperty_1;
var fails$G = fails$1z;
var html = html$2;
var arraySlice$4 = arraySlice$a;
var createElement = documentCreateElement$2;
var validateArgumentsLength$b = validateArgumentsLength$c;
var IS_IOS$1 = environmentIsIos;
var IS_NODE$2 = environmentIsNode;

var set$8 = globalThis$O.setImmediate;
var clear = globalThis$O.clearImmediate;
var process$2 = globalThis$O.process;
var Dispatch = globalThis$O.Dispatch;
var Function$2 = globalThis$O.Function;
var MessageChannel = globalThis$O.MessageChannel;
var String$1 = globalThis$O.String;
var counter = 0;
var queue$2 = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var $location, defer, channel, port;

fails$G(function () {
  // Deno throws a ReferenceError on `location` access without `--location` flag
  $location = globalThis$O.location;
});

var run = function (id) {
  if (hasOwn$l(queue$2, id)) {
    var fn = queue$2[id];
    delete queue$2[id];
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
  globalThis$O.postMessage(String$1(id), $location.protocol + '//' + $location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set$8 || !clear) {
  set$8 = function setImmediate(handler) {
    validateArgumentsLength$b(arguments.length, 1);
    var fn = isCallable$l(handler) ? handler : Function$2(handler);
    var args = arraySlice$4(arguments, 1);
    queue$2[++counter] = function () {
      apply$9(fn, undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue$2[id];
  };
  // Node.js 0.8-
  if (IS_NODE$2) {
    defer = function (id) {
      process$2.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !IS_IOS$1) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = eventListener;
    defer = bind$n(port.postMessage, port);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    globalThis$O.addEventListener &&
    isCallable$l(globalThis$O.postMessage) &&
    !globalThis$O.importScripts &&
    $location && $location.protocol !== 'file:' &&
    !fails$G(globalPostMessageDefer)
  ) {
    defer = globalPostMessageDefer;
    globalThis$O.addEventListener('message', eventListener, false);
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

var task$1 = {
  set: set$8,
  clear: clear
};

var globalThis$N = globalThis_1;
var DESCRIPTORS$o = descriptors;

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$7 = Object.getOwnPropertyDescriptor;

// Avoid NodeJS experimental warning
var safeGetBuiltIn$2 = function (name) {
  if (!DESCRIPTORS$o) return globalThis$N[name];
  var descriptor = getOwnPropertyDescriptor$7(globalThis$N, name);
  return descriptor && descriptor.value;
};

var Queue$2 = function () {
  this.head = null;
  this.tail = null;
};

Queue$2.prototype = {
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

var queue$1 = Queue$2;

var userAgent$2 = environmentUserAgent;

var environmentIsIosPebble = /ipad|iphone|ipod/i.test(userAgent$2) && typeof Pebble != 'undefined';

var userAgent$1 = environmentUserAgent;

var environmentIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent$1);

var globalThis$M = globalThis_1;
var safeGetBuiltIn$1 = safeGetBuiltIn$2;
var bind$m = functionBindContext;
var macrotask = task$1.set;
var Queue$1 = queue$1;
var IS_IOS = environmentIsIos;
var IS_IOS_PEBBLE = environmentIsIosPebble;
var IS_WEBOS_WEBKIT = environmentIsWebosWebkit;
var IS_NODE$1 = environmentIsNode;

var MutationObserver = globalThis$M.MutationObserver || globalThis$M.WebKitMutationObserver;
var document$2 = globalThis$M.document;
var process$1 = globalThis$M.process;
var Promise$7 = globalThis$M.Promise;
var microtask$2 = safeGetBuiltIn$1('queueMicrotask');
var notify$1, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!microtask$2) {
  var queue = new Queue$1();

  var flush = function () {
    var parent, fn;
    if (IS_NODE$1 && (parent = process$1.domain)) parent.exit();
    while (fn = queue.get()) try {
      fn();
    } catch (error) {
      if (queue.head) notify$1();
      throw error;
    }
    if (parent) parent.enter();
  };

  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
  if (!IS_IOS && !IS_NODE$1 && !IS_WEBOS_WEBKIT && MutationObserver && document$2) {
    toggle = true;
    node = document$2.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify$1 = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (!IS_IOS_PEBBLE && Promise$7 && Promise$7.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise$7.resolve(undefined);
    // workaround of WebKit ~ iOS Safari 10.1 bug
    promise.constructor = Promise$7;
    then = bind$m(promise.then, promise);
    notify$1 = function () {
      then(flush);
    };
  // Node.js without promises
  } else if (IS_NODE$1) {
    notify$1 = function () {
      process$1.nextTick(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessage
  // - onreadystatechange
  // - setTimeout
  } else {
    // `webpack` dev server bug on IE global methods - use bind(fn, global)
    macrotask = bind$m(macrotask, globalThis$M);
    notify$1 = function () {
      macrotask(flush);
    };
  }

  microtask$2 = function (fn) {
    if (!queue.head) notify$1();
    queue.add(fn);
  };
}

var microtask_1 = microtask$2;

var hostReportErrors$2 = function (a, b) {
  try {
    // eslint-disable-next-line no-console -- safe
    arguments.length === 1 ? console.error(a) : console.error(a, b);
  } catch (error) { /* empty */ }
};

var perform$7 = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

var globalThis$L = globalThis_1;

var promiseNativeConstructor = globalThis$L.Promise;

var globalThis$K = globalThis_1;
var NativePromiseConstructor$4 = promiseNativeConstructor;
var isCallable$k = isCallable$I;
var isForced$1 = isForced_1;
var inspectSource$1 = inspectSource$4;
var wellKnownSymbol$u = wellKnownSymbol$S;
var ENVIRONMENT$1 = environment;
var V8_VERSION = environmentV8Version;

NativePromiseConstructor$4 && NativePromiseConstructor$4.prototype;
var SPECIES$1 = wellKnownSymbol$u('species');
var SUBCLASSING = false;
var NATIVE_PROMISE_REJECTION_EVENT$1 = isCallable$k(globalThis$K.PromiseRejectionEvent);

var FORCED_PROMISE_CONSTRUCTOR$5 = isForced$1('Promise', function () {
  var PROMISE_CONSTRUCTOR_SOURCE = inspectSource$1(NativePromiseConstructor$4);
  var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(NativePromiseConstructor$4);
  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
  // We can't detect it synchronously, so just check versions
  if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (!V8_VERSION || V8_VERSION < 51 || !/native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) {
    // Detect correctness of subclassing with @@species support
    var promise = new NativePromiseConstructor$4(function (resolve) { resolve(1); });
    var FakePromise = function (exec) {
      exec(function () { /* empty */ }, function () { /* empty */ });
    };
    var constructor = promise.constructor = {};
    constructor[SPECIES$1] = FakePromise;
    SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
    if (!SUBCLASSING) return true;
  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
  } return !GLOBAL_CORE_JS_PROMISE && (ENVIRONMENT$1 === 'BROWSER' || ENVIRONMENT$1 === 'DENO') && !NATIVE_PROMISE_REJECTION_EVENT$1;
});

var promiseConstructorDetection = {
  CONSTRUCTOR: FORCED_PROMISE_CONSTRUCTOR$5,
  REJECTION_EVENT: NATIVE_PROMISE_REJECTION_EVENT$1,
  SUBCLASSING: SUBCLASSING
};

var newPromiseCapability$2 = {};

var aCallable$z = aCallable$N;

var $TypeError$u = TypeError;

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw new $TypeError$u('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aCallable$z(resolve);
  this.reject = aCallable$z(reject);
};

// `NewPromiseCapability` abstract operation
// https://tc39.es/ecma262/#sec-newpromisecapability
newPromiseCapability$2.f = function (C) {
  return new PromiseCapability(C);
};

var $$3H = _export;
var IS_NODE = environmentIsNode;
var globalThis$J = globalThis_1;
var call$13 = functionCall;
var defineBuiltIn$h = defineBuiltIn$u;
var setPrototypeOf$2 = objectSetPrototypeOf$1;
var setToStringTag$5 = setToStringTag$e;
var setSpecies$3 = setSpecies$7;
var aCallable$y = aCallable$N;
var isCallable$j = isCallable$I;
var isObject$m = isObject$N;
var anInstance$b = anInstance$f;
var speciesConstructor$4 = speciesConstructor$6;
var task = task$1.set;
var microtask$1 = microtask_1;
var hostReportErrors$1 = hostReportErrors$2;
var perform$6 = perform$7;
var Queue = queue$1;
var InternalStateModule$h = internalState;
var NativePromiseConstructor$3 = promiseNativeConstructor;
var PromiseConstructorDetection = promiseConstructorDetection;
var newPromiseCapabilityModule$7 = newPromiseCapability$2;

var PROMISE = 'Promise';
var FORCED_PROMISE_CONSTRUCTOR$4 = PromiseConstructorDetection.CONSTRUCTOR;
var NATIVE_PROMISE_REJECTION_EVENT = PromiseConstructorDetection.REJECTION_EVENT;
var NATIVE_PROMISE_SUBCLASSING = PromiseConstructorDetection.SUBCLASSING;
var getInternalPromiseState = InternalStateModule$h.getterFor(PROMISE);
var setInternalState$i = InternalStateModule$h.set;
var NativePromisePrototype$2 = NativePromiseConstructor$3 && NativePromiseConstructor$3.prototype;
var PromiseConstructor = NativePromiseConstructor$3;
var PromisePrototype = NativePromisePrototype$2;
var TypeError$5 = globalThis$J.TypeError;
var document$1 = globalThis$J.document;
var process = globalThis$J.process;
var newPromiseCapability$1 = newPromiseCapabilityModule$7.f;
var newGenericPromiseCapability = newPromiseCapability$1;

var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && globalThis$J.dispatchEvent);
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING$2 = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;

var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

// helpers
var isThenable = function (it) {
  var then;
  return isObject$m(it) && isCallable$j(then = it.then) ? then : false;
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
        reject(new TypeError$5('Promise-chain cycle'));
      } else if (then = isThenable(result)) {
        call$13(then, result, resolve, reject);
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
  microtask$1(function () {
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
    event = document$1.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    globalThis$J.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (!NATIVE_PROMISE_REJECTION_EVENT && (handler = globalThis$J['on' + name])) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors$1('Unhandled promise rejection', reason);
};

var onUnhandled = function (state) {
  call$13(task, globalThis$J, function () {
    var promise = state.facade;
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform$6(function () {
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
  call$13(task, globalThis$J, function () {
    var promise = state.facade;
    if (IS_NODE) {
      process.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind$l = function (fn, state, unwrap) {
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
    if (state.facade === value) throw new TypeError$5("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask$1(function () {
        var wrapper = { done: false };
        try {
          call$13(then, value,
            bind$l(internalResolve, wrapper, state),
            bind$l(internalReject, wrapper, state)
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
if (FORCED_PROMISE_CONSTRUCTOR$4) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance$b(this, PromisePrototype);
    aCallable$y(executor);
    call$13(Internal, this);
    var state = getInternalPromiseState(this);
    try {
      executor(bind$l(internalResolve, state), bind$l(internalReject, state));
    } catch (error) {
      internalReject(state, error);
    }
  };

  PromisePrototype = PromiseConstructor.prototype;

  // eslint-disable-next-line no-unused-vars -- required for `.length`
  Internal = function Promise(executor) {
    setInternalState$i(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: new Queue(),
      rejection: false,
      state: PENDING$2,
      value: null
    });
  };

  // `Promise.prototype.then` method
  // https://tc39.es/ecma262/#sec-promise.prototype.then
  Internal.prototype = defineBuiltIn$h(PromisePrototype, 'then', function then(onFulfilled, onRejected) {
    var state = getInternalPromiseState(this);
    var reaction = newPromiseCapability$1(speciesConstructor$4(this, PromiseConstructor));
    state.parent = true;
    reaction.ok = isCallable$j(onFulfilled) ? onFulfilled : true;
    reaction.fail = isCallable$j(onRejected) && onRejected;
    reaction.domain = IS_NODE ? process.domain : undefined;
    if (state.state === PENDING$2) state.reactions.add(reaction);
    else microtask$1(function () {
      callReaction(reaction, state);
    });
    return reaction.promise;
  });

  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalPromiseState(promise);
    this.promise = promise;
    this.resolve = bind$l(internalResolve, state);
    this.reject = bind$l(internalReject, state);
  };

  newPromiseCapabilityModule$7.f = newPromiseCapability$1 = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  if (isCallable$j(NativePromiseConstructor$3) && NativePromisePrototype$2 !== Object.prototype) {
    nativeThen = NativePromisePrototype$2.then;

    if (!NATIVE_PROMISE_SUBCLASSING) {
      // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
      defineBuiltIn$h(NativePromisePrototype$2, 'then', function then(onFulfilled, onRejected) {
        var that = this;
        return new PromiseConstructor(function (resolve, reject) {
          call$13(nativeThen, that, resolve, reject);
        }).then(onFulfilled, onRejected);
      // https://github.com/zloirock/core-js/issues/640
      }, { unsafe: true });
    }

    // make `.constructor === Promise` work for native promise-based APIs
    try {
      delete NativePromisePrototype$2.constructor;
    } catch (error) { /* empty */ }

    // make `instanceof Promise` work for native promise-based APIs
    if (setPrototypeOf$2) {
      setPrototypeOf$2(NativePromisePrototype$2, PromisePrototype);
    }
  }
}

$$3H({ global: true, constructor: true, wrap: true, forced: FORCED_PROMISE_CONSTRUCTOR$4 }, {
  Promise: PromiseConstructor
});

setToStringTag$5(PromiseConstructor, PROMISE, false);
setSpecies$3(PROMISE);

var NativePromiseConstructor$2 = promiseNativeConstructor;
var checkCorrectnessOfIteration$1 = checkCorrectnessOfIteration$4;
var FORCED_PROMISE_CONSTRUCTOR$3 = promiseConstructorDetection.CONSTRUCTOR;

var promiseStaticsIncorrectIteration = FORCED_PROMISE_CONSTRUCTOR$3 || !checkCorrectnessOfIteration$1(function (iterable) {
  NativePromiseConstructor$2.all(iterable).then(undefined, function () { /* empty */ });
});

var $$3G = _export;
var call$12 = functionCall;
var aCallable$x = aCallable$N;
var newPromiseCapabilityModule$6 = newPromiseCapability$2;
var perform$5 = perform$7;
var iterate$A = iterate$H;
var PROMISE_STATICS_INCORRECT_ITERATION$3 = promiseStaticsIncorrectIteration;

// `Promise.all` method
// https://tc39.es/ecma262/#sec-promise.all
$$3G({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION$3 }, {
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$6.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$5(function () {
      var $promiseResolve = aCallable$x(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$A(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        remaining++;
        call$12($promiseResolve, C, promise).then(function (value) {
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

var $$3F = _export;
var FORCED_PROMISE_CONSTRUCTOR$2 = promiseConstructorDetection.CONSTRUCTOR;
var NativePromiseConstructor$1 = promiseNativeConstructor;
var getBuiltIn$B = getBuiltIn$O;
var isCallable$i = isCallable$I;
var defineBuiltIn$g = defineBuiltIn$u;

var NativePromisePrototype$1 = NativePromiseConstructor$1 && NativePromiseConstructor$1.prototype;

// `Promise.prototype.catch` method
// https://tc39.es/ecma262/#sec-promise.prototype.catch
$$3F({ target: 'Promise', proto: true, forced: FORCED_PROMISE_CONSTRUCTOR$2, real: true }, {
  'catch': function (onRejected) {
    return this.then(undefined, onRejected);
  }
});

// makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
if (isCallable$i(NativePromiseConstructor$1)) {
  var method$1 = getBuiltIn$B('Promise').prototype['catch'];
  if (NativePromisePrototype$1['catch'] !== method$1) {
    defineBuiltIn$g(NativePromisePrototype$1, 'catch', method$1, { unsafe: true });
  }
}

var $$3E = _export;
var call$11 = functionCall;
var aCallable$w = aCallable$N;
var newPromiseCapabilityModule$5 = newPromiseCapability$2;
var perform$4 = perform$7;
var iterate$z = iterate$H;
var PROMISE_STATICS_INCORRECT_ITERATION$2 = promiseStaticsIncorrectIteration;

// `Promise.race` method
// https://tc39.es/ecma262/#sec-promise.race
$$3E({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION$2 }, {
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$5.f(C);
    var reject = capability.reject;
    var result = perform$4(function () {
      var $promiseResolve = aCallable$w(C.resolve);
      iterate$z(iterable, function (promise) {
        call$11($promiseResolve, C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$3D = _export;
var newPromiseCapabilityModule$4 = newPromiseCapability$2;
var FORCED_PROMISE_CONSTRUCTOR$1 = promiseConstructorDetection.CONSTRUCTOR;

// `Promise.reject` method
// https://tc39.es/ecma262/#sec-promise.reject
$$3D({ target: 'Promise', stat: true, forced: FORCED_PROMISE_CONSTRUCTOR$1 }, {
  reject: function reject(r) {
    var capability = newPromiseCapabilityModule$4.f(this);
    var capabilityReject = capability.reject;
    capabilityReject(r);
    return capability.promise;
  }
});

var anObject$13 = anObject$1h;
var isObject$l = isObject$N;
var newPromiseCapability = newPromiseCapability$2;

var promiseResolve$2 = function (C, x) {
  anObject$13(C);
  if (isObject$l(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var $$3C = _export;
var getBuiltIn$A = getBuiltIn$O;
var FORCED_PROMISE_CONSTRUCTOR = promiseConstructorDetection.CONSTRUCTOR;
var promiseResolve$1 = promiseResolve$2;

getBuiltIn$A('Promise');

// `Promise.resolve` method
// https://tc39.es/ecma262/#sec-promise.resolve
$$3C({ target: 'Promise', stat: true, forced: FORCED_PROMISE_CONSTRUCTOR }, {
  resolve: function resolve(x) {
    return promiseResolve$1(this, x);
  }
});

var $$3B = _export;
var call$10 = functionCall;
var aCallable$v = aCallable$N;
var newPromiseCapabilityModule$3 = newPromiseCapability$2;
var perform$3 = perform$7;
var iterate$y = iterate$H;
var PROMISE_STATICS_INCORRECT_ITERATION$1 = promiseStaticsIncorrectIteration;

// `Promise.allSettled` method
// https://tc39.es/ecma262/#sec-promise.allsettled
$$3B({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION$1 }, {
  allSettled: function allSettled(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$3.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$3(function () {
      var promiseResolve = aCallable$v(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$y(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        remaining++;
        call$10(promiseResolve, C, promise).then(function (value) {
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

var $$3A = _export;
var call$$ = functionCall;
var aCallable$u = aCallable$N;
var getBuiltIn$z = getBuiltIn$O;
var newPromiseCapabilityModule$2 = newPromiseCapability$2;
var perform$2 = perform$7;
var iterate$x = iterate$H;
var PROMISE_STATICS_INCORRECT_ITERATION = promiseStaticsIncorrectIteration;

var PROMISE_ANY_ERROR = 'No one promise resolved';

// `Promise.any` method
// https://tc39.es/ecma262/#sec-promise.any
$$3A({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION }, {
  any: function any(iterable) {
    var C = this;
    var AggregateError = getBuiltIn$z('AggregateError');
    var capability = newPromiseCapabilityModule$2.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$2(function () {
      var promiseResolve = aCallable$u(C.resolve);
      var errors = [];
      var counter = 0;
      var remaining = 1;
      var alreadyResolved = false;
      iterate$x(iterable, function (promise) {
        var index = counter++;
        var alreadyRejected = false;
        remaining++;
        call$$(promiseResolve, C, promise).then(function (value) {
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

var $$3z = _export;
var NativePromiseConstructor = promiseNativeConstructor;
var fails$F = fails$1z;
var getBuiltIn$y = getBuiltIn$O;
var isCallable$h = isCallable$I;
var speciesConstructor$3 = speciesConstructor$6;
var promiseResolve = promiseResolve$2;
var defineBuiltIn$f = defineBuiltIn$u;

var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;

// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
var NON_GENERIC = !!NativePromiseConstructor && fails$F(function () {
  // eslint-disable-next-line unicorn/no-thenable -- required for testing
  NativePromisePrototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
});

// `Promise.prototype.finally` method
// https://tc39.es/ecma262/#sec-promise.prototype.finally
$$3z({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
  'finally': function (onFinally) {
    var C = speciesConstructor$3(this, getBuiltIn$y('Promise'));
    var isFunction = isCallable$h(onFinally);
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
if (isCallable$h(NativePromiseConstructor)) {
  var method = getBuiltIn$y('Promise').prototype['finally'];
  if (NativePromisePrototype['finally'] !== method) {
    defineBuiltIn$f(NativePromisePrototype, 'finally', method, { unsafe: true });
  }
}

var $$3y = _export;
var newPromiseCapabilityModule$1 = newPromiseCapability$2;

// `Promise.withResolvers` method
// https://github.com/tc39/proposal-promise-with-resolvers
$$3y({ target: 'Promise', stat: true }, {
  withResolvers: function withResolvers() {
    var promiseCapability = newPromiseCapabilityModule$1.f(this);
    return {
      promise: promiseCapability.promise,
      resolve: promiseCapability.resolve,
      reject: promiseCapability.reject
    };
  }
});

var $$3x = _export;
var functionApply = functionApply$1;
var aCallable$t = aCallable$N;
var anObject$12 = anObject$1h;
var fails$E = fails$1z;

// MS Edge argumentsList argument is optional
var OPTIONAL_ARGUMENTS_LIST = !fails$E(function () {
  // eslint-disable-next-line es/no-reflect -- required for testing
  Reflect.apply(function () { /* empty */ });
});

// `Reflect.apply` method
// https://tc39.es/ecma262/#sec-reflect.apply
$$3x({ target: 'Reflect', stat: true, forced: OPTIONAL_ARGUMENTS_LIST }, {
  apply: function apply(target, thisArgument, argumentsList) {
    return functionApply(aCallable$t(target), thisArgument, anObject$12(argumentsList));
  }
});

var $$3w = _export;
var getBuiltIn$x = getBuiltIn$O;
var apply$8 = functionApply$1;
var bind$k = functionBind;
var aConstructor$2 = aConstructor$4;
var anObject$11 = anObject$1h;
var isObject$k = isObject$N;
var create$c = objectCreate$1;
var fails$D = fails$1z;

var nativeConstruct = getBuiltIn$x('Reflect', 'construct');
var ObjectPrototype = Object.prototype;
var push$j = [].push;

// `Reflect.construct` method
// https://tc39.es/ecma262/#sec-reflect.construct
// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails$D(function () {
  function F() { /* empty */ }
  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
});

var ARGS_BUG = !fails$D(function () {
  nativeConstruct(function () { /* empty */ });
});

var FORCED$9 = NEW_TARGET_BUG || ARGS_BUG;

$$3w({ target: 'Reflect', stat: true, forced: FORCED$9, sham: FORCED$9 }, {
  construct: function construct(Target, args /* , newTarget */) {
    aConstructor$2(Target);
    anObject$11(args);
    var newTarget = arguments.length < 3 ? Target : aConstructor$2(arguments[2]);
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
      apply$8(push$j, $args, args);
      return new (apply$8(bind$k, Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = create$c(isObject$k(proto) ? proto : ObjectPrototype);
    var result = apply$8(Target, instance, args);
    return isObject$k(result) ? result : instance;
  }
});

var $$3v = _export;
var DESCRIPTORS$n = descriptors;
var anObject$10 = anObject$1h;
var toPropertyKey$2 = toPropertyKey$9;
var definePropertyModule$2 = objectDefineProperty;
var fails$C = fails$1z;

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
var ERROR_INSTEAD_OF_FALSE = fails$C(function () {
  // eslint-disable-next-line es/no-reflect -- required for testing
  Reflect.defineProperty(definePropertyModule$2.f({}, 1, { value: 1 }), 1, { value: 2 });
});

// `Reflect.defineProperty` method
// https://tc39.es/ecma262/#sec-reflect.defineproperty
$$3v({ target: 'Reflect', stat: true, forced: ERROR_INSTEAD_OF_FALSE, sham: !DESCRIPTORS$n }, {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    anObject$10(target);
    var key = toPropertyKey$2(propertyKey);
    anObject$10(attributes);
    try {
      definePropertyModule$2.f(target, key, attributes);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$3u = _export;
var anObject$$ = anObject$1h;
var getOwnPropertyDescriptor$6 = objectGetOwnPropertyDescriptor.f;

// `Reflect.deleteProperty` method
// https://tc39.es/ecma262/#sec-reflect.deleteproperty
$$3u({ target: 'Reflect', stat: true }, {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var descriptor = getOwnPropertyDescriptor$6(anObject$$(target), propertyKey);
    return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
  }
});

var hasOwn$k = hasOwnProperty_1;

var isDataDescriptor$2 = function (descriptor) {
  return descriptor !== undefined && (hasOwn$k(descriptor, 'value') || hasOwn$k(descriptor, 'writable'));
};

var $$3t = _export;
var call$_ = functionCall;
var isObject$j = isObject$N;
var anObject$_ = anObject$1h;
var isDataDescriptor$1 = isDataDescriptor$2;
var getOwnPropertyDescriptorModule$3 = objectGetOwnPropertyDescriptor;
var getPrototypeOf$8 = objectGetPrototypeOf$2;

// `Reflect.get` method
// https://tc39.es/ecma262/#sec-reflect.get
function get$3(target, propertyKey /* , receiver */) {
  var receiver = arguments.length < 3 ? target : arguments[2];
  var descriptor, prototype;
  if (anObject$_(target) === receiver) return target[propertyKey];
  descriptor = getOwnPropertyDescriptorModule$3.f(target, propertyKey);
  if (descriptor) return isDataDescriptor$1(descriptor)
    ? descriptor.value
    : descriptor.get === undefined ? undefined : call$_(descriptor.get, receiver);
  if (isObject$j(prototype = getPrototypeOf$8(target))) return get$3(prototype, propertyKey, receiver);
}

$$3t({ target: 'Reflect', stat: true }, {
  get: get$3
});

var $$3s = _export;
var DESCRIPTORS$m = descriptors;
var anObject$Z = anObject$1h;
var getOwnPropertyDescriptorModule$2 = objectGetOwnPropertyDescriptor;

// `Reflect.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-reflect.getownpropertydescriptor
$$3s({ target: 'Reflect', stat: true, sham: !DESCRIPTORS$m }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return getOwnPropertyDescriptorModule$2.f(anObject$Z(target), propertyKey);
  }
});

var $$3r = _export;
var anObject$Y = anObject$1h;
var objectGetPrototypeOf = objectGetPrototypeOf$2;
var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

// `Reflect.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.getprototypeof
$$3r({ target: 'Reflect', stat: true, sham: !CORRECT_PROTOTYPE_GETTER }, {
  getPrototypeOf: function getPrototypeOf(target) {
    return objectGetPrototypeOf(anObject$Y(target));
  }
});

var $$3q = _export;

// `Reflect.has` method
// https://tc39.es/ecma262/#sec-reflect.has
$$3q({ target: 'Reflect', stat: true }, {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});

var $$3p = _export;
var anObject$X = anObject$1h;
var $isExtensible = objectIsExtensible;

// `Reflect.isExtensible` method
// https://tc39.es/ecma262/#sec-reflect.isextensible
$$3p({ target: 'Reflect', stat: true }, {
  isExtensible: function isExtensible(target) {
    anObject$X(target);
    return $isExtensible(target);
  }
});

var $$3o = _export;
var ownKeys = ownKeys$3;

// `Reflect.ownKeys` method
// https://tc39.es/ecma262/#sec-reflect.ownkeys
$$3o({ target: 'Reflect', stat: true }, {
  ownKeys: ownKeys
});

var $$3n = _export;
var getBuiltIn$w = getBuiltIn$O;
var anObject$W = anObject$1h;
var FREEZING$3 = freezing;

// `Reflect.preventExtensions` method
// https://tc39.es/ecma262/#sec-reflect.preventextensions
$$3n({ target: 'Reflect', stat: true, sham: !FREEZING$3 }, {
  preventExtensions: function preventExtensions(target) {
    anObject$W(target);
    try {
      var objectPreventExtensions = getBuiltIn$w('Object', 'preventExtensions');
      if (objectPreventExtensions) objectPreventExtensions(target);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$3m = _export;
var call$Z = functionCall;
var anObject$V = anObject$1h;
var isObject$i = isObject$N;
var isDataDescriptor = isDataDescriptor$2;
var fails$B = fails$1z;
var definePropertyModule$1 = objectDefineProperty;
var getOwnPropertyDescriptorModule$1 = objectGetOwnPropertyDescriptor;
var getPrototypeOf$7 = objectGetPrototypeOf$2;
var createPropertyDescriptor$5 = createPropertyDescriptor$d;

// `Reflect.set` method
// https://tc39.es/ecma262/#sec-reflect.set
function set$7(target, propertyKey, V /* , receiver */) {
  var receiver = arguments.length < 4 ? target : arguments[3];
  var ownDescriptor = getOwnPropertyDescriptorModule$1.f(anObject$V(target), propertyKey);
  var existingDescriptor, prototype, setter;
  if (!ownDescriptor) {
    if (isObject$i(prototype = getPrototypeOf$7(target))) {
      return set$7(prototype, propertyKey, V, receiver);
    }
    ownDescriptor = createPropertyDescriptor$5(0);
  }
  if (isDataDescriptor(ownDescriptor)) {
    if (ownDescriptor.writable === false || !isObject$i(receiver)) return false;
    if (existingDescriptor = getOwnPropertyDescriptorModule$1.f(receiver, propertyKey)) {
      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
      existingDescriptor.value = V;
      definePropertyModule$1.f(receiver, propertyKey, existingDescriptor);
    } else definePropertyModule$1.f(receiver, propertyKey, createPropertyDescriptor$5(0, V));
  } else {
    setter = ownDescriptor.set;
    if (setter === undefined) return false;
    call$Z(setter, receiver, V);
  } return true;
}

// MS Edge 17-18 Reflect.set allows setting the property to object
// with non-writable property on the prototype
var MS_EDGE_BUG = fails$B(function () {
  var Constructor = function () { /* empty */ };
  var object = definePropertyModule$1.f(new Constructor(), 'a', { configurable: true });
  // eslint-disable-next-line es/no-reflect -- required for testing
  return Reflect.set(Constructor.prototype, 'a', 1, object) !== false;
});

$$3m({ target: 'Reflect', stat: true, forced: MS_EDGE_BUG }, {
  set: set$7
});

var $$3l = _export;
var anObject$U = anObject$1h;
var aPossiblePrototype = aPossiblePrototype$2;
var objectSetPrototypeOf = objectSetPrototypeOf$1;

// `Reflect.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.setprototypeof
if (objectSetPrototypeOf) $$3l({ target: 'Reflect', stat: true }, {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    anObject$U(target);
    aPossiblePrototype(proto);
    try {
      objectSetPrototypeOf(target, proto);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$3k = _export;
var globalThis$I = globalThis_1;
var setToStringTag$4 = setToStringTag$e;

$$3k({ global: true }, { Reflect: {} });

// Reflect[@@toStringTag] property
// https://tc39.es/ecma262/#sec-reflect-@@tostringtag
setToStringTag$4(globalThis$I.Reflect, 'Reflect', true);

var isObject$h = isObject$N;
var classof$c = classofRaw$2;
var wellKnownSymbol$t = wellKnownSymbol$S;

var MATCH$2 = wellKnownSymbol$t('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject$h(it) && ((isRegExp = it[MATCH$2]) !== undefined ? !!isRegExp : classof$c(it) === 'RegExp');
};

var anObject$T = anObject$1h;

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags$1 = function () {
  var that = anObject$T(this);
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

var call$Y = functionCall;
var hasOwn$j = hasOwnProperty_1;
var isPrototypeOf$5 = objectIsPrototypeOf;
var regExpFlags$1 = regexpFlags$1;

var RegExpPrototype$7 = RegExp.prototype;

var regexpGetFlags = function (R) {
  var flags = R.flags;
  return flags === undefined && !('flags' in RegExpPrototype$7) && !hasOwn$j(R, 'flags') && isPrototypeOf$5(RegExpPrototype$7, R)
    ? call$Y(regExpFlags$1, R) : flags;
};

var fails$A = fails$1z;
var globalThis$H = globalThis_1;

// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
var $RegExp$2 = globalThis$H.RegExp;

var UNSUPPORTED_Y$3 = fails$A(function () {
  var re = $RegExp$2('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') !== null;
});

// UC Browser bug
// https://github.com/zloirock/core-js/issues/1008
var MISSED_STICKY$2 = UNSUPPORTED_Y$3 || fails$A(function () {
  return !$RegExp$2('a', 'y').sticky;
});

var BROKEN_CARET = UNSUPPORTED_Y$3 || fails$A(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = $RegExp$2('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') !== null;
});

var regexpStickyHelpers = {
  BROKEN_CARET: BROKEN_CARET,
  MISSED_STICKY: MISSED_STICKY$2,
  UNSUPPORTED_Y: UNSUPPORTED_Y$3
};

var fails$z = fails$1z;
var globalThis$G = globalThis_1;

// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
var $RegExp$1 = globalThis$G.RegExp;

var regexpUnsupportedDotAll = fails$z(function () {
  var re = $RegExp$1('.', 's');
  return !(re.dotAll && re.test('\n') && re.flags === 's');
});

var fails$y = fails$1z;
var globalThis$F = globalThis_1;

// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
var $RegExp = globalThis$F.RegExp;

var regexpUnsupportedNcg = fails$y(function () {
  var re = $RegExp('(?<a>b)', 'g');
  return re.exec('b').groups.a !== 'b' ||
    'b'.replace(re, '$<a>c') !== 'bc';
});

var DESCRIPTORS$l = descriptors;
var globalThis$E = globalThis_1;
var uncurryThis$17 = functionUncurryThis;
var isForced = isForced_1;
var inheritIfRequired$2 = inheritIfRequired$7;
var createNonEnumerableProperty$9 = createNonEnumerableProperty$j;
var create$b = objectCreate$1;
var getOwnPropertyNames$2 = objectGetOwnPropertyNames.f;
var isPrototypeOf$4 = objectIsPrototypeOf;
var isRegExp$3 = isRegexp;
var toString$w = toString$J;
var getRegExpFlags$4 = regexpGetFlags;
var stickyHelpers$2 = regexpStickyHelpers;
var proxyAccessor = proxyAccessor$2;
var defineBuiltIn$e = defineBuiltIn$u;
var fails$x = fails$1z;
var hasOwn$i = hasOwnProperty_1;
var enforceInternalState$2 = internalState.enforce;
var setSpecies$2 = setSpecies$7;
var wellKnownSymbol$s = wellKnownSymbol$S;
var UNSUPPORTED_DOT_ALL$2 = regexpUnsupportedDotAll;
var UNSUPPORTED_NCG$1 = regexpUnsupportedNcg;

var MATCH$1 = wellKnownSymbol$s('match');
var NativeRegExp = globalThis$E.RegExp;
var RegExpPrototype$6 = NativeRegExp.prototype;
var SyntaxError$4 = globalThis$E.SyntaxError;
var exec$d = uncurryThis$17(RegExpPrototype$6.exec);
var charAt$j = uncurryThis$17(''.charAt);
var replace$7 = uncurryThis$17(''.replace);
var stringIndexOf$4 = uncurryThis$17(''.indexOf);
var stringSlice$f = uncurryThis$17(''.slice);
// TODO: Use only proper RegExpIdentifierName
var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
var re1 = /a/g;
var re2 = /a/g;

// "new" should create a new object, old webkit bug
var CORRECT_NEW = new NativeRegExp(re1) !== re1;

var MISSED_STICKY$1 = stickyHelpers$2.MISSED_STICKY;
var UNSUPPORTED_Y$2 = stickyHelpers$2.UNSUPPORTED_Y;

var BASE_FORCED = DESCRIPTORS$l &&
  (!CORRECT_NEW || MISSED_STICKY$1 || UNSUPPORTED_DOT_ALL$2 || UNSUPPORTED_NCG$1 || fails$x(function () {
    re2[MATCH$1] = false;
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
    chr = charAt$j(string, index);
    if (chr === '\\') {
      result += chr + charAt$j(string, ++index);
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
  var names = create$b(null);
  var brackets = false;
  var ncg = false;
  var groupid = 0;
  var groupname = '';
  var chr;
  for (; index <= length; index++) {
    chr = charAt$j(string, index);
    if (chr === '\\') {
      chr += charAt$j(string, ++index);
    } else if (chr === ']') {
      brackets = false;
    } else if (!brackets) switch (true) {
      case chr === '[':
        brackets = true;
        break;
      case chr === '(':
        result += chr;
        // ignore non-capturing groups
        if (stringSlice$f(string, index + 1, index + 3) === '?:') {
          continue;
        }
        if (exec$d(IS_NCG, stringSlice$f(string, index + 1))) {
          index += 2;
          ncg = true;
        }
        groupid++;
        continue;
      case chr === '>' && ncg:
        if (groupname === '' || hasOwn$i(names, groupname)) {
          throw new SyntaxError$4('Invalid capture group name');
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
    var thisIsRegExp = isPrototypeOf$4(RegExpPrototype$6, this);
    var patternIsRegExp = isRegExp$3(pattern);
    var flagsAreUndefined = flags === undefined;
    var groups = [];
    var rawPattern = pattern;
    var rawFlags, dotAll, sticky, handled, result, state;

    if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
      return pattern;
    }

    if (patternIsRegExp || isPrototypeOf$4(RegExpPrototype$6, pattern)) {
      pattern = pattern.source;
      if (flagsAreUndefined) flags = getRegExpFlags$4(rawPattern);
    }

    pattern = pattern === undefined ? '' : toString$w(pattern);
    flags = flags === undefined ? '' : toString$w(flags);
    rawPattern = pattern;

    if (UNSUPPORTED_DOT_ALL$2 && 'dotAll' in re1) {
      dotAll = !!flags && stringIndexOf$4(flags, 's') > -1;
      if (dotAll) flags = replace$7(flags, /s/g, '');
    }

    rawFlags = flags;

    if (MISSED_STICKY$1 && 'sticky' in re1) {
      sticky = !!flags && stringIndexOf$4(flags, 'y') > -1;
      if (sticky && UNSUPPORTED_Y$2) flags = replace$7(flags, /y/g, '');
    }

    if (UNSUPPORTED_NCG$1) {
      handled = handleNCG(pattern);
      pattern = handled[0];
      groups = handled[1];
    }

    result = inheritIfRequired$2(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype$6, RegExpWrapper);

    if (dotAll || sticky || groups.length) {
      state = enforceInternalState$2(result);
      if (dotAll) {
        state.dotAll = true;
        state.raw = RegExpWrapper(handleDotAll(pattern), rawFlags);
      }
      if (sticky) state.sticky = true;
      if (groups.length) state.groups = groups;
    }

    if (pattern !== rawPattern) try {
      // fails in old engines, but we have no alternatives for unsupported regex syntax
      createNonEnumerableProperty$9(result, 'source', rawPattern === '' ? '(?:)' : rawPattern);
    } catch (error) { /* empty */ }

    return result;
  };

  for (var keys$1 = getOwnPropertyNames$2(NativeRegExp), index = 0; keys$1.length > index;) {
    proxyAccessor(RegExpWrapper, NativeRegExp, keys$1[index++]);
  }

  RegExpPrototype$6.constructor = RegExpWrapper;
  RegExpWrapper.prototype = RegExpPrototype$6;
  defineBuiltIn$e(globalThis$E, 'RegExp', RegExpWrapper, { constructor: true });
}

// https://tc39.es/ecma262/#sec-get-regexp-@@species
setSpecies$2('RegExp');

var DESCRIPTORS$k = descriptors;
var UNSUPPORTED_DOT_ALL$1 = regexpUnsupportedDotAll;
var classof$b = classofRaw$2;
var defineBuiltInAccessor$f = defineBuiltInAccessor$p;
var getInternalState$c = internalState.get;

var RegExpPrototype$5 = RegExp.prototype;
var $TypeError$t = TypeError;

// `RegExp.prototype.dotAll` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.dotall
if (DESCRIPTORS$k && UNSUPPORTED_DOT_ALL$1) {
  defineBuiltInAccessor$f(RegExpPrototype$5, 'dotAll', {
    configurable: true,
    get: function dotAll() {
      if (this === RegExpPrototype$5) return;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (classof$b(this) === 'RegExp') {
        return !!getInternalState$c(this).dotAll;
      }
      throw new $TypeError$t('Incompatible receiver, RegExp required');
    }
  });
}

/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */
var call$X = functionCall;
var uncurryThis$16 = functionUncurryThis;
var toString$v = toString$J;
var regexpFlags = regexpFlags$1;
var stickyHelpers$1 = regexpStickyHelpers;
var shared$3 = shared$a;
var create$a = objectCreate$1;
var getInternalState$b = internalState.get;
var UNSUPPORTED_DOT_ALL = regexpUnsupportedDotAll;
var UNSUPPORTED_NCG = regexpUnsupportedNcg;

var nativeReplace = shared$3('native-string-replace', String.prototype.replace);
var nativeExec = RegExp.prototype.exec;
var patchedExec = nativeExec;
var charAt$i = uncurryThis$16(''.charAt);
var indexOf$1 = uncurryThis$16(''.indexOf);
var replace$6 = uncurryThis$16(''.replace);
var stringSlice$e = uncurryThis$16(''.slice);

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  call$X(nativeExec, re1, 'a');
  call$X(nativeExec, re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y$1 = stickyHelpers$1.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH$1 = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1 || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;

if (PATCH$1) {
  patchedExec = function exec(string) {
    var re = this;
    var state = getInternalState$b(re);
    var str = toString$v(string);
    var raw = state.raw;
    var result, reCopy, lastIndex, match, i, object, group;

    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = call$X(patchedExec, raw, str);
      re.lastIndex = raw.lastIndex;
      return result;
    }

    var groups = state.groups;
    var sticky = UNSUPPORTED_Y$1 && re.sticky;
    var flags = call$X(regexpFlags, re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = replace$6(flags, 'y', '');
      if (indexOf$1(flags, 'g') === -1) {
        flags += 'g';
      }

      strCopy = stringSlice$e(str, re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt$i(str, re.lastIndex - 1) !== '\n')) {
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

    match = call$X(nativeExec, sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = stringSlice$e(match.input, charsAdded);
        match[0] = stringSlice$e(match[0], charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
      call$X(nativeReplace, match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    if (match && groups) {
      match.groups = object = create$a(null);
      for (i = 0; i < groups.length; i++) {
        group = groups[i];
        object[group[0]] = match[group[1]];
      }
    }

    return match;
  };
}

var regexpExec$2 = patchedExec;

var $$3j = _export;
var exec$c = regexpExec$2;

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
$$3j({ target: 'RegExp', proto: true, forced: /./.exec !== exec$c }, {
  exec: exec$c
});

var globalThis$D = globalThis_1;
var DESCRIPTORS$j = descriptors;
var defineBuiltInAccessor$e = defineBuiltInAccessor$p;
var regExpFlags = regexpFlags$1;
var fails$w = fails$1z;

// babel-minify and Closure Compiler transpiles RegExp('.', 'd') -> /./d and it causes SyntaxError
var RegExp$1 = globalThis$D.RegExp;
var RegExpPrototype$4 = RegExp$1.prototype;

var FORCED$8 = DESCRIPTORS$j && fails$w(function () {
  var INDICES_SUPPORT = true;
  try {
    RegExp$1('.', 'd');
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
  var result = Object.getOwnPropertyDescriptor(RegExpPrototype$4, 'flags').get.call(O);

  return result !== expected || calls !== expected;
});

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
if (FORCED$8) defineBuiltInAccessor$e(RegExpPrototype$4, 'flags', {
  configurable: true,
  get: regExpFlags
});

var DESCRIPTORS$i = descriptors;
var MISSED_STICKY = regexpStickyHelpers.MISSED_STICKY;
var classof$a = classofRaw$2;
var defineBuiltInAccessor$d = defineBuiltInAccessor$p;
var getInternalState$a = internalState.get;

var RegExpPrototype$3 = RegExp.prototype;
var $TypeError$s = TypeError;

// `RegExp.prototype.sticky` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.sticky
if (DESCRIPTORS$i && MISSED_STICKY) {
  defineBuiltInAccessor$d(RegExpPrototype$3, 'sticky', {
    configurable: true,
    get: function sticky() {
      if (this === RegExpPrototype$3) return;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (classof$a(this) === 'RegExp') {
        return !!getInternalState$a(this).sticky;
      }
      throw new $TypeError$s('Incompatible receiver, RegExp required');
    }
  });
}

// TODO: Remove from `core-js@4` since it's moved to entry points

var $$3i = _export;
var call$W = functionCall;
var isCallable$g = isCallable$I;
var anObject$S = anObject$1h;
var toString$u = toString$J;

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
$$3i({ target: 'RegExp', proto: true, forced: !DELEGATES_TO_EXEC }, {
  test: function (S) {
    var R = anObject$S(this);
    var string = toString$u(S);
    var exec = R.exec;
    if (!isCallable$g(exec)) return call$W(nativeTest, R, string);
    var result = call$W(exec, R, string);
    if (result === null) return false;
    anObject$S(result);
    return true;
  }
});

var PROPER_FUNCTION_NAME$1 = functionName.PROPER;
var defineBuiltIn$d = defineBuiltIn$u;
var anObject$R = anObject$1h;
var $toString$2 = toString$J;
var fails$v = fails$1z;
var getRegExpFlags$3 = regexpGetFlags;

var TO_STRING = 'toString';
var RegExpPrototype$2 = RegExp.prototype;
var nativeToString = RegExpPrototype$2[TO_STRING];

var NOT_GENERIC = fails$v(function () { return nativeToString.call({ source: 'a', flags: 'b' }) !== '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = PROPER_FUNCTION_NAME$1 && nativeToString.name !== TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  defineBuiltIn$d(RegExpPrototype$2, TO_STRING, function toString() {
    var R = anObject$R(this);
    var pattern = $toString$2(R.source);
    var flags = $toString$2(getRegExpFlags$3(R));
    return '/' + pattern + '/' + flags;
  }, { unsafe: true });
}

var collection$2 = collection$4;
var collectionStrong = collectionStrong$2;

// `Set` constructor
// https://tc39.es/ecma262/#sec-set-objects
collection$2('Set', function (init) {
  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong);

var uncurryThis$15 = functionUncurryThis;

// eslint-disable-next-line es/no-set -- safe
var SetPrototype$1 = Set.prototype;

var setHelpers = {
  // eslint-disable-next-line es/no-set -- safe
  Set: Set,
  add: uncurryThis$15(SetPrototype$1.add),
  has: uncurryThis$15(SetPrototype$1.has),
  remove: uncurryThis$15(SetPrototype$1['delete']),
  proto: SetPrototype$1
};

var has$b = setHelpers.has;

// Perform ? RequireInternalSlot(M, [[SetData]])
var aSet$g = function (it) {
  has$b(it);
  return it;
};

var call$V = functionCall;

var iterateSimple$8 = function (record, fn, ITERATOR_INSTEAD_OF_RECORD) {
  var iterator = ITERATOR_INSTEAD_OF_RECORD ? record : record.iterator;
  var next = record.next;
  var step, result;
  while (!(step = call$V(next, iterator)).done) {
    result = fn(step.value);
    if (result !== undefined) return result;
  }
};

var uncurryThis$14 = functionUncurryThis;
var iterateSimple$7 = iterateSimple$8;
var SetHelpers$a = setHelpers;

var Set$7 = SetHelpers$a.Set;
var SetPrototype = SetHelpers$a.proto;
var forEach$5 = uncurryThis$14(SetPrototype.forEach);
var keys = uncurryThis$14(SetPrototype.keys);
var next$1 = keys(new Set$7()).next;

var setIterate$1 = function (set, fn, interruptible) {
  return interruptible ? iterateSimple$7({ iterator: keys(set), next: next$1 }, fn) : forEach$5(set, fn);
};

var SetHelpers$9 = setHelpers;
var iterate$w = setIterate$1;

var Set$6 = SetHelpers$9.Set;
var add$7 = SetHelpers$9.add;

var setClone = function (set) {
  var result = new Set$6();
  iterate$w(set, function (it) {
    add$7(result, it);
  });
  return result;
};

var uncurryThisAccessor = functionUncurryThisAccessor;
var SetHelpers$8 = setHelpers;

var setSize = uncurryThisAccessor(SetHelpers$8.proto, 'size', 'get') || function (set) {
  return set.size;
};

// `GetIteratorDirect(obj)` abstract operation
// https://tc39.es/proposal-iterator-helpers/#sec-getiteratordirect
var getIteratorDirect$o = function (obj) {
  return {
    iterator: obj,
    next: obj.next,
    done: false
  };
};

var aCallable$s = aCallable$N;
var anObject$Q = anObject$1h;
var call$U = functionCall;
var toIntegerOrInfinity$a = toIntegerOrInfinity$p;
var getIteratorDirect$n = getIteratorDirect$o;

var INVALID_SIZE = 'Invalid size';
var $RangeError$8 = RangeError;
var $TypeError$r = TypeError;
var max$5 = Math.max;

var SetRecord = function (set, intSize) {
  this.set = set;
  this.size = max$5(intSize, 0);
  this.has = aCallable$s(set.has);
  this.keys = aCallable$s(set.keys);
};

SetRecord.prototype = {
  getIterator: function () {
    return getIteratorDirect$n(anObject$Q(call$U(this.keys, this.set)));
  },
  includes: function (it) {
    return call$U(this.has, this.set, it);
  }
};

// `GetSetRecord` abstract operation
// https://tc39.es/proposal-set-methods/#sec-getsetrecord
var getSetRecord$7 = function (obj) {
  anObject$Q(obj);
  var numSize = +obj.size;
  // NOTE: If size is undefined, then numSize will be NaN
  // eslint-disable-next-line no-self-compare -- NaN check
  if (numSize !== numSize) throw new $TypeError$r(INVALID_SIZE);
  var intSize = toIntegerOrInfinity$a(numSize);
  if (intSize < 0) throw new $RangeError$8(INVALID_SIZE);
  return new SetRecord(obj, intSize);
};

var aSet$f = aSet$g;
var SetHelpers$7 = setHelpers;
var clone$2 = setClone;
var size$4 = setSize;
var getSetRecord$6 = getSetRecord$7;
var iterateSet$2 = setIterate$1;
var iterateSimple$6 = iterateSimple$8;

var has$a = SetHelpers$7.has;
var remove$5 = SetHelpers$7.remove;

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
var setDifference = function difference(other) {
  var O = aSet$f(this);
  var otherRec = getSetRecord$6(other);
  var result = clone$2(O);
  if (size$4(O) <= otherRec.size) iterateSet$2(O, function (e) {
    if (otherRec.includes(e)) remove$5(result, e);
  });
  else iterateSimple$6(otherRec.getIterator(), function (e) {
    if (has$a(O, e)) remove$5(result, e);
  });
  return result;
};

var getBuiltIn$v = getBuiltIn$O;

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

var setMethodAcceptSetLike$7 = function (name) {
  var Set = getBuiltIn$v('Set');
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

var $$3h = _export;
var difference = setDifference;
var setMethodAcceptSetLike$6 = setMethodAcceptSetLike$7;

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
$$3h({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike$6('difference') }, {
  difference: difference
});

var aSet$e = aSet$g;
var SetHelpers$6 = setHelpers;
var size$3 = setSize;
var getSetRecord$5 = getSetRecord$7;
var iterateSet$1 = setIterate$1;
var iterateSimple$5 = iterateSimple$8;

var Set$5 = SetHelpers$6.Set;
var add$6 = SetHelpers$6.add;
var has$9 = SetHelpers$6.has;

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
var setIntersection = function intersection(other) {
  var O = aSet$e(this);
  var otherRec = getSetRecord$5(other);
  var result = new Set$5();

  if (size$3(O) > otherRec.size) {
    iterateSimple$5(otherRec.getIterator(), function (e) {
      if (has$9(O, e)) add$6(result, e);
    });
  } else {
    iterateSet$1(O, function (e) {
      if (otherRec.includes(e)) add$6(result, e);
    });
  }

  return result;
};

var $$3g = _export;
var fails$u = fails$1z;
var intersection = setIntersection;
var setMethodAcceptSetLike$5 = setMethodAcceptSetLike$7;

var INCORRECT = !setMethodAcceptSetLike$5('intersection') || fails$u(function () {
  // eslint-disable-next-line es/no-array-from, es/no-set -- testing
  return String(Array.from(new Set([1, 2, 3]).intersection(new Set([3, 2])))) !== '3,2';
});

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
$$3g({ target: 'Set', proto: true, real: true, forced: INCORRECT }, {
  intersection: intersection
});

var aSet$d = aSet$g;
var has$8 = setHelpers.has;
var size$2 = setSize;
var getSetRecord$4 = getSetRecord$7;
var iterateSet = setIterate$1;
var iterateSimple$4 = iterateSimple$8;
var iteratorClose$5 = iteratorClose$8;

// `Set.prototype.isDisjointFrom` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isDisjointFrom
var setIsDisjointFrom = function isDisjointFrom(other) {
  var O = aSet$d(this);
  var otherRec = getSetRecord$4(other);
  if (size$2(O) <= otherRec.size) return iterateSet(O, function (e) {
    if (otherRec.includes(e)) return false;
  }, true) !== false;
  var iterator = otherRec.getIterator();
  return iterateSimple$4(iterator, function (e) {
    if (has$8(O, e)) return iteratorClose$5(iterator, 'normal', false);
  }) !== false;
};

var $$3f = _export;
var isDisjointFrom = setIsDisjointFrom;
var setMethodAcceptSetLike$4 = setMethodAcceptSetLike$7;

// `Set.prototype.isDisjointFrom` method
// https://github.com/tc39/proposal-set-methods
$$3f({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike$4('isDisjointFrom') }, {
  isDisjointFrom: isDisjointFrom
});

var aSet$c = aSet$g;
var size$1 = setSize;
var iterate$v = setIterate$1;
var getSetRecord$3 = getSetRecord$7;

// `Set.prototype.isSubsetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
var setIsSubsetOf = function isSubsetOf(other) {
  var O = aSet$c(this);
  var otherRec = getSetRecord$3(other);
  if (size$1(O) > otherRec.size) return false;
  return iterate$v(O, function (e) {
    if (!otherRec.includes(e)) return false;
  }, true) !== false;
};

var $$3e = _export;
var isSubsetOf = setIsSubsetOf;
var setMethodAcceptSetLike$3 = setMethodAcceptSetLike$7;

// `Set.prototype.isSubsetOf` method
// https://github.com/tc39/proposal-set-methods
$$3e({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike$3('isSubsetOf') }, {
  isSubsetOf: isSubsetOf
});

var aSet$b = aSet$g;
var has$7 = setHelpers.has;
var size = setSize;
var getSetRecord$2 = getSetRecord$7;
var iterateSimple$3 = iterateSimple$8;
var iteratorClose$4 = iteratorClose$8;

// `Set.prototype.isSupersetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSupersetOf
var setIsSupersetOf = function isSupersetOf(other) {
  var O = aSet$b(this);
  var otherRec = getSetRecord$2(other);
  if (size(O) < otherRec.size) return false;
  var iterator = otherRec.getIterator();
  return iterateSimple$3(iterator, function (e) {
    if (!has$7(O, e)) return iteratorClose$4(iterator, 'normal', false);
  }) !== false;
};

var $$3d = _export;
var isSupersetOf = setIsSupersetOf;
var setMethodAcceptSetLike$2 = setMethodAcceptSetLike$7;

// `Set.prototype.isSupersetOf` method
// https://github.com/tc39/proposal-set-methods
$$3d({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike$2('isSupersetOf') }, {
  isSupersetOf: isSupersetOf
});

var aSet$a = aSet$g;
var SetHelpers$5 = setHelpers;
var clone$1 = setClone;
var getSetRecord$1 = getSetRecord$7;
var iterateSimple$2 = iterateSimple$8;

var add$5 = SetHelpers$5.add;
var has$6 = SetHelpers$5.has;
var remove$4 = SetHelpers$5.remove;

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
var setSymmetricDifference = function symmetricDifference(other) {
  var O = aSet$a(this);
  var keysIter = getSetRecord$1(other).getIterator();
  var result = clone$1(O);
  iterateSimple$2(keysIter, function (e) {
    if (has$6(O, e)) remove$4(result, e);
    else add$5(result, e);
  });
  return result;
};

var $$3c = _export;
var symmetricDifference = setSymmetricDifference;
var setMethodAcceptSetLike$1 = setMethodAcceptSetLike$7;

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
$$3c({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike$1('symmetricDifference') }, {
  symmetricDifference: symmetricDifference
});

var aSet$9 = aSet$g;
var add$4 = setHelpers.add;
var clone = setClone;
var getSetRecord = getSetRecord$7;
var iterateSimple$1 = iterateSimple$8;

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
var setUnion = function union(other) {
  var O = aSet$9(this);
  var keysIter = getSetRecord(other).getIterator();
  var result = clone(O);
  iterateSimple$1(keysIter, function (it) {
    add$4(result, it);
  });
  return result;
};

var $$3b = _export;
var union = setUnion;
var setMethodAcceptSetLike = setMethodAcceptSetLike$7;

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
$$3b({ target: 'Set', proto: true, real: true, forced: !setMethodAcceptSetLike('union') }, {
  union: union
});

var $$3a = _export;
var uncurryThis$13 = functionUncurryThis;
var requireObjectCoercible$g = requireObjectCoercible$q;
var toIntegerOrInfinity$9 = toIntegerOrInfinity$p;
var toString$t = toString$J;
var fails$t = fails$1z;

var charAt$h = uncurryThis$13(''.charAt);

var FORCED$7 = fails$t(function () {
  // eslint-disable-next-line es/no-string-prototype-at -- safe
  return '𠮷'.at(-2) !== '\uD842';
});

// `String.prototype.at` method
// https://tc39.es/ecma262/#sec-string.prototype.at
$$3a({ target: 'String', proto: true, forced: FORCED$7 }, {
  at: function at(index) {
    var S = toString$t(requireObjectCoercible$g(this));
    var len = S.length;
    var relativeIndex = toIntegerOrInfinity$9(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : charAt$h(S, k);
  }
});

var uncurryThis$12 = functionUncurryThis;
var toIntegerOrInfinity$8 = toIntegerOrInfinity$p;
var toString$s = toString$J;
var requireObjectCoercible$f = requireObjectCoercible$q;

var charAt$g = uncurryThis$12(''.charAt);
var charCodeAt$6 = uncurryThis$12(''.charCodeAt);
var stringSlice$d = uncurryThis$12(''.slice);

var createMethod$1 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString$s(requireObjectCoercible$f($this));
    var position = toIntegerOrInfinity$8(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt$6(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt$6(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt$g(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice$d(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$1(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$1(true)
};

var $$39 = _export;
var codeAt$2 = stringMultibyte.codeAt;

// `String.prototype.codePointAt` method
// https://tc39.es/ecma262/#sec-string.prototype.codepointat
$$39({ target: 'String', proto: true }, {
  codePointAt: function codePointAt(pos) {
    return codeAt$2(this, pos);
  }
});

var isRegExp$2 = isRegexp;

var $TypeError$q = TypeError;

var notARegexp = function (it) {
  if (isRegExp$2(it)) {
    throw new $TypeError$q("The method doesn't accept regular expressions");
  } return it;
};

var wellKnownSymbol$r = wellKnownSymbol$S;

var MATCH = wellKnownSymbol$r('match');

var correctIsRegexpLogic = function (METHOD_NAME) {
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

var $$38 = _export;
var uncurryThis$11 = functionUncurryThisClause;
var getOwnPropertyDescriptor$5 = objectGetOwnPropertyDescriptor.f;
var toLength$7 = toLength$d;
var toString$r = toString$J;
var notARegExp$2 = notARegexp;
var requireObjectCoercible$e = requireObjectCoercible$q;
var correctIsRegExpLogic$2 = correctIsRegexpLogic;

var slice$5 = uncurryThis$11(''.slice);
var min$8 = Math.min;

var CORRECT_IS_REGEXP_LOGIC$1 = correctIsRegExpLogic$2('endsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG$1 = !CORRECT_IS_REGEXP_LOGIC$1 && !!function () {
  var descriptor = getOwnPropertyDescriptor$5(String.prototype, 'endsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.endsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.endswith
$$38({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG$1 && !CORRECT_IS_REGEXP_LOGIC$1 }, {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = toString$r(requireObjectCoercible$e(this));
    notARegExp$2(searchString);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = that.length;
    var end = endPosition === undefined ? len : min$8(toLength$7(endPosition), len);
    var search = toString$r(searchString);
    return slice$5(that, end - search.length, end) === search;
  }
});

var $$37 = _export;
var uncurryThis$10 = functionUncurryThis;
var toAbsoluteIndex$2 = toAbsoluteIndex$a;

var $RangeError$7 = RangeError;
var fromCharCode$6 = String.fromCharCode;
// eslint-disable-next-line es/no-string-fromcodepoint -- required for testing
var $fromCodePoint = String.fromCodePoint;
var join$8 = uncurryThis$10([].join);

// length should be 1, old FF problem
var INCORRECT_LENGTH = !!$fromCodePoint && $fromCodePoint.length !== 1;

// `String.fromCodePoint` method
// https://tc39.es/ecma262/#sec-string.fromcodepoint
$$37({ target: 'String', stat: true, arity: 1, forced: INCORRECT_LENGTH }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  fromCodePoint: function fromCodePoint(x) {
    var elements = [];
    var length = arguments.length;
    var i = 0;
    var code;
    while (length > i) {
      code = +arguments[i++];
      if (toAbsoluteIndex$2(code, 0x10FFFF) !== code) throw new $RangeError$7(code + ' is not a valid code point');
      elements[i] = code < 0x10000
        ? fromCharCode$6(code)
        : fromCharCode$6(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00);
    } return join$8(elements, '');
  }
});

var $$36 = _export;
var uncurryThis$$ = functionUncurryThis;
var notARegExp$1 = notARegexp;
var requireObjectCoercible$d = requireObjectCoercible$q;
var toString$q = toString$J;
var correctIsRegExpLogic$1 = correctIsRegexpLogic;

var stringIndexOf$3 = uncurryThis$$(''.indexOf);

// `String.prototype.includes` method
// https://tc39.es/ecma262/#sec-string.prototype.includes
$$36({ target: 'String', proto: true, forced: !correctIsRegExpLogic$1('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~stringIndexOf$3(
      toString$q(requireObjectCoercible$d(this)),
      toString$q(notARegExp$1(searchString)),
      arguments.length > 1 ? arguments[1] : undefined
    );
  }
});

var $$35 = _export;
var uncurryThis$_ = functionUncurryThis;
var requireObjectCoercible$c = requireObjectCoercible$q;
var toString$p = toString$J;

var charCodeAt$5 = uncurryThis$_(''.charCodeAt);

// `String.prototype.isWellFormed` method
// https://github.com/tc39/proposal-is-usv-string
$$35({ target: 'String', proto: true }, {
  isWellFormed: function isWellFormed() {
    var S = toString$p(requireObjectCoercible$c(this));
    var length = S.length;
    for (var i = 0; i < length; i++) {
      var charCode = charCodeAt$5(S, i);
      // single UTF-16 code unit
      if ((charCode & 0xF800) !== 0xD800) continue;
      // unpaired surrogate
      if (charCode >= 0xDC00 || ++i >= length || (charCodeAt$5(S, i) & 0xFC00) !== 0xDC00) return false;
    } return true;
  }
});

var charAt$f = stringMultibyte.charAt;
var toString$o = toString$J;
var InternalStateModule$g = internalState;
var defineIterator = iteratorDefine;
var createIterResultObject$e = createIterResultObject$h;

var STRING_ITERATOR$1 = 'String Iterator';
var setInternalState$h = InternalStateModule$g.set;
var getInternalState$9 = InternalStateModule$g.getterFor(STRING_ITERATOR$1);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState$h(this, {
    type: STRING_ITERATOR$1,
    string: toString$o(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$9(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject$e(undefined, true);
  point = charAt$f(string, index);
  state.index += point.length;
  return createIterResultObject$e(point, false);
});

// TODO: Remove from `core-js@4` since it's moved to entry points

var call$T = functionCall;
var defineBuiltIn$c = defineBuiltIn$u;
var regexpExec$1 = regexpExec$2;
var fails$s = fails$1z;
var wellKnownSymbol$q = wellKnownSymbol$S;
var createNonEnumerableProperty$8 = createNonEnumerableProperty$j;

var SPECIES = wellKnownSymbol$q('species');
var RegExpPrototype$1 = RegExp.prototype;

var fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
  var SYMBOL = wellKnownSymbol$q(KEY);

  var DELEGATES_TO_SYMBOL = !fails$s(function () {
    // String methods call symbol-named RegExp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) !== 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$s(function () {
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
      if ($exec === regexpExec$1 || $exec === RegExpPrototype$1.exec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: call$T(nativeRegExpMethod, regexp, str, arg2) };
        }
        return { done: true, value: call$T(nativeMethod, str, regexp, arg2) };
      }
      return { done: false };
    });

    defineBuiltIn$c(String.prototype, KEY, methods[0]);
    defineBuiltIn$c(RegExpPrototype$1, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty$8(RegExpPrototype$1[SYMBOL], 'sham', true);
};

var charAt$e = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
var advanceStringIndex$4 = function (S, index, unicode) {
  return index + (unicode ? charAt$e(S, index).length : 1);
};

var call$S = functionCall;
var anObject$P = anObject$1h;
var isCallable$f = isCallable$I;
var classof$9 = classofRaw$2;
var regexpExec = regexpExec$2;

var $TypeError$p = TypeError;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
var regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (isCallable$f(exec)) {
    var result = call$S(exec, R, S);
    if (result !== null) anObject$P(result);
    return result;
  }
  if (classof$9(R) === 'RegExp') return call$S(regexpExec, R, S);
  throw new $TypeError$p('RegExp#exec called on incompatible receiver');
};

var call$R = functionCall;
var fixRegExpWellKnownSymbolLogic$3 = fixRegexpWellKnownSymbolLogic;
var anObject$O = anObject$1h;
var isNullOrUndefined$c = isNullOrUndefined$j;
var toLength$6 = toLength$d;
var toString$n = toString$J;
var requireObjectCoercible$b = requireObjectCoercible$q;
var getMethod$h = getMethod$l;
var advanceStringIndex$3 = advanceStringIndex$4;
var regExpExec$4 = regexpExecAbstract;

// @@match logic
fixRegExpWellKnownSymbolLogic$3('match', function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.es/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible$b(this);
      var matcher = isNullOrUndefined$c(regexp) ? undefined : getMethod$h(regexp, MATCH);
      return matcher ? call$R(matcher, regexp, O) : new RegExp(regexp)[MATCH](toString$n(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
    function (string) {
      var rx = anObject$O(this);
      var S = toString$n(string);
      var res = maybeCallNative(nativeMatch, rx, S);

      if (res.done) return res.value;

      if (!rx.global) return regExpExec$4(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec$4(rx, S)) !== null) {
        var matchStr = toString$n(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex$3(S, toLength$6(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

/* eslint-disable es/no-string-prototype-matchall -- safe */
var $$34 = _export;
var call$Q = functionCall;
var uncurryThis$Z = functionUncurryThisClause;
var createIteratorConstructor$5 = iteratorCreateConstructor;
var createIterResultObject$d = createIterResultObject$h;
var requireObjectCoercible$a = requireObjectCoercible$q;
var toLength$5 = toLength$d;
var toString$m = toString$J;
var anObject$N = anObject$1h;
var isNullOrUndefined$b = isNullOrUndefined$j;
var classof$8 = classofRaw$2;
var isRegExp$1 = isRegexp;
var getRegExpFlags$2 = regexpGetFlags;
var getMethod$g = getMethod$l;
var defineBuiltIn$b = defineBuiltIn$u;
var fails$r = fails$1z;
var wellKnownSymbol$p = wellKnownSymbol$S;
var speciesConstructor$2 = speciesConstructor$6;
var advanceStringIndex$2 = advanceStringIndex$4;
var regExpExec$3 = regexpExecAbstract;
var InternalStateModule$f = internalState;
var IS_PURE$h = isPure;

var MATCH_ALL = wellKnownSymbol$p('matchAll');
var REGEXP_STRING = 'RegExp String';
var REGEXP_STRING_ITERATOR = REGEXP_STRING + ' Iterator';
var setInternalState$g = InternalStateModule$f.set;
var getInternalState$8 = InternalStateModule$f.getterFor(REGEXP_STRING_ITERATOR);
var RegExpPrototype = RegExp.prototype;
var $TypeError$o = TypeError;
var stringIndexOf$2 = uncurryThis$Z(''.indexOf);
var nativeMatchAll = uncurryThis$Z(''.matchAll);

var WORKS_WITH_NON_GLOBAL_REGEX = !!nativeMatchAll && !fails$r(function () {
  nativeMatchAll('a', /./);
});

var $RegExpStringIterator = createIteratorConstructor$5(function RegExpStringIterator(regexp, string, $global, fullUnicode) {
  setInternalState$g(this, {
    type: REGEXP_STRING_ITERATOR,
    regexp: regexp,
    string: string,
    global: $global,
    unicode: fullUnicode,
    done: false
  });
}, REGEXP_STRING, function next() {
  var state = getInternalState$8(this);
  if (state.done) return createIterResultObject$d(undefined, true);
  var R = state.regexp;
  var S = state.string;
  var match = regExpExec$3(R, S);
  if (match === null) {
    state.done = true;
    return createIterResultObject$d(undefined, true);
  }
  if (state.global) {
    if (toString$m(match[0]) === '') R.lastIndex = advanceStringIndex$2(S, toLength$5(R.lastIndex), state.unicode);
    return createIterResultObject$d(match, false);
  }
  state.done = true;
  return createIterResultObject$d(match, false);
});

var $matchAll = function (string) {
  var R = anObject$N(this);
  var S = toString$m(string);
  var C = speciesConstructor$2(R, RegExp);
  var flags = toString$m(getRegExpFlags$2(R));
  var matcher, $global, fullUnicode;
  matcher = new C(C === RegExp ? R.source : R, flags);
  $global = !!~stringIndexOf$2(flags, 'g');
  fullUnicode = !!~stringIndexOf$2(flags, 'u');
  matcher.lastIndex = toLength$5(R.lastIndex);
  return new $RegExpStringIterator(matcher, S, $global, fullUnicode);
};

// `String.prototype.matchAll` method
// https://tc39.es/ecma262/#sec-string.prototype.matchall
$$34({ target: 'String', proto: true, forced: WORKS_WITH_NON_GLOBAL_REGEX }, {
  matchAll: function matchAll(regexp) {
    var O = requireObjectCoercible$a(this);
    var flags, S, matcher, rx;
    if (!isNullOrUndefined$b(regexp)) {
      if (isRegExp$1(regexp)) {
        flags = toString$m(requireObjectCoercible$a(getRegExpFlags$2(regexp)));
        if (!~stringIndexOf$2(flags, 'g')) throw new $TypeError$o('`.matchAll` does not allow non-global regexes');
      }
      if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll(O, regexp);
      matcher = getMethod$g(regexp, MATCH_ALL);
      if (matcher === undefined && IS_PURE$h && classof$8(regexp) === 'RegExp') matcher = $matchAll;
      if (matcher) return call$Q(matcher, regexp, O);
    } else if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll(O, regexp);
    S = toString$m(O);
    rx = new RegExp(regexp, 'g');
    return rx[MATCH_ALL](S);
  }
});

MATCH_ALL in RegExpPrototype || defineBuiltIn$b(RegExpPrototype, MATCH_ALL, $matchAll);

// https://github.com/zloirock/core-js/issues/280
var userAgent = environmentUserAgent;

var stringPadWebkitBug = /Version\/10(?:\.\d+){1,2}(?: [\w./]+)?(?: Mobile\/\w+)? Safari\//.test(userAgent);

var $$33 = _export;
var $padEnd = stringPad.end;
var WEBKIT_BUG$1 = stringPadWebkitBug;

// `String.prototype.padEnd` method
// https://tc39.es/ecma262/#sec-string.prototype.padend
$$33({ target: 'String', proto: true, forced: WEBKIT_BUG$1 }, {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return $padEnd(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$32 = _export;
var $padStart = stringPad.start;
var WEBKIT_BUG = stringPadWebkitBug;

// `String.prototype.padStart` method
// https://tc39.es/ecma262/#sec-string.prototype.padstart
$$32({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$31 = _export;
var uncurryThis$Y = functionUncurryThis;
var toIndexedObject$2 = toIndexedObject$k;
var toObject$d = toObject$E;
var toString$l = toString$J;
var lengthOfArrayLike$d = lengthOfArrayLike$B;

var push$i = uncurryThis$Y([].push);
var join$7 = uncurryThis$Y([].join);

// `String.raw` method
// https://tc39.es/ecma262/#sec-string.raw
$$31({ target: 'String', stat: true }, {
  raw: function raw(template) {
    var rawTemplate = toIndexedObject$2(toObject$d(template).raw);
    var literalSegments = lengthOfArrayLike$d(rawTemplate);
    if (!literalSegments) return '';
    var argumentsLength = arguments.length;
    var elements = [];
    var i = 0;
    while (true) {
      push$i(elements, toString$l(rawTemplate[i++]));
      if (i === literalSegments) return join$7(elements, '');
      if (i < argumentsLength) push$i(elements, toString$l(arguments[i]));
    }
  }
});

var $$30 = _export;
var repeat = stringRepeat;

// `String.prototype.repeat` method
// https://tc39.es/ecma262/#sec-string.prototype.repeat
$$30({ target: 'String', proto: true }, {
  repeat: repeat
});

var uncurryThis$X = functionUncurryThis;
var toObject$c = toObject$E;

var floor$3 = Math.floor;
var charAt$d = uncurryThis$X(''.charAt);
var replace$5 = uncurryThis$X(''.replace);
var stringSlice$c = uncurryThis$X(''.slice);
// eslint-disable-next-line redos/no-vulnerable -- safe
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

// `GetSubstitution` abstract operation
// https://tc39.es/ecma262/#sec-getsubstitution
var getSubstitution$2 = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject$c(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace$5(replacement, symbols, function (match, ch) {
    var capture;
    switch (charAt$d(ch, 0)) {
      case '$': return '$';
      case '&': return matched;
      case '`': return stringSlice$c(str, 0, position);
      case "'": return stringSlice$c(str, tailPos);
      case '<':
        capture = namedCaptures[stringSlice$c(ch, 1, -1)];
        break;
      default: // \d\d?
        var n = +ch;
        if (n === 0) return match;
        if (n > m) {
          var f = floor$3(n / 10);
          if (f === 0) return match;
          if (f <= m) return captures[f - 1] === undefined ? charAt$d(ch, 1) : captures[f - 1] + charAt$d(ch, 1);
          return match;
        }
        capture = captures[n - 1];
    }
    return capture === undefined ? '' : capture;
  });
};

var apply$7 = functionApply$1;
var call$P = functionCall;
var uncurryThis$W = functionUncurryThis;
var fixRegExpWellKnownSymbolLogic$2 = fixRegexpWellKnownSymbolLogic;
var fails$q = fails$1z;
var anObject$M = anObject$1h;
var isCallable$e = isCallable$I;
var isNullOrUndefined$a = isNullOrUndefined$j;
var toIntegerOrInfinity$7 = toIntegerOrInfinity$p;
var toLength$4 = toLength$d;
var toString$k = toString$J;
var requireObjectCoercible$9 = requireObjectCoercible$q;
var advanceStringIndex$1 = advanceStringIndex$4;
var getMethod$f = getMethod$l;
var getSubstitution$1 = getSubstitution$2;
var regExpExec$2 = regexpExecAbstract;
var wellKnownSymbol$o = wellKnownSymbol$S;

var REPLACE$1 = wellKnownSymbol$o('replace');
var max$4 = Math.max;
var min$7 = Math.min;
var concat$1 = uncurryThis$W([].concat);
var push$h = uncurryThis$W([].push);
var stringIndexOf$1 = uncurryThis$W(''.indexOf);
var stringSlice$b = uncurryThis$W(''.slice);

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
  if (/./[REPLACE$1]) {
    return /./[REPLACE$1]('a', '$0') === '';
  }
  return false;
})();

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails$q(function () {
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
fixRegExpWellKnownSymbolLogic$2('replace', function (_, nativeReplace, maybeCallNative) {
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible$9(this);
      var replacer = isNullOrUndefined$a(searchValue) ? undefined : getMethod$f(searchValue, REPLACE$1);
      return replacer
        ? call$P(replacer, searchValue, O, replaceValue)
        : call$P(nativeReplace, toString$k(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (string, replaceValue) {
      var rx = anObject$M(this);
      var S = toString$k(string);

      if (
        typeof replaceValue == 'string' &&
        stringIndexOf$1(replaceValue, UNSAFE_SUBSTITUTE) === -1 &&
        stringIndexOf$1(replaceValue, '$<') === -1
      ) {
        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
        if (res.done) return res.value;
      }

      var functionalReplace = isCallable$e(replaceValue);
      if (!functionalReplace) replaceValue = toString$k(replaceValue);

      var global = rx.global;
      var fullUnicode;
      if (global) {
        fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }

      var results = [];
      var result;
      while (true) {
        result = regExpExec$2(rx, S);
        if (result === null) break;

        push$h(results, result);
        if (!global) break;

        var matchStr = toString$k(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex$1(S, toLength$4(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = toString$k(result[0]);
        var position = max$4(min$7(toIntegerOrInfinity$7(result.index), S.length), 0);
        var captures = [];
        var replacement;
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) push$h(captures, maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = concat$1([matched], captures, position, S);
          if (namedCaptures !== undefined) push$h(replacerArgs, namedCaptures);
          replacement = toString$k(apply$7(replaceValue, undefined, replacerArgs));
        } else {
          replacement = getSubstitution$1(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += stringSlice$b(S, nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }

      return accumulatedResult + stringSlice$b(S, nextSourcePosition);
    }
  ];
}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);

var $$2$ = _export;
var call$O = functionCall;
var uncurryThis$V = functionUncurryThis;
var requireObjectCoercible$8 = requireObjectCoercible$q;
var isCallable$d = isCallable$I;
var isNullOrUndefined$9 = isNullOrUndefined$j;
var isRegExp = isRegexp;
var toString$j = toString$J;
var getMethod$e = getMethod$l;
var getRegExpFlags$1 = regexpGetFlags;
var getSubstitution = getSubstitution$2;
var wellKnownSymbol$n = wellKnownSymbol$S;

var REPLACE = wellKnownSymbol$n('replace');
var $TypeError$n = TypeError;
var indexOf = uncurryThis$V(''.indexOf);
uncurryThis$V(''.replace);
var stringSlice$a = uncurryThis$V(''.slice);
var max$3 = Math.max;

// `String.prototype.replaceAll` method
// https://tc39.es/ecma262/#sec-string.prototype.replaceall
$$2$({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    var O = requireObjectCoercible$8(this);
    var IS_REG_EXP, flags, replacer, string, searchString, functionalReplace, searchLength, advanceBy, position, replacement;
    var endOfLastMatch = 0;
    var result = '';
    if (!isNullOrUndefined$9(searchValue)) {
      IS_REG_EXP = isRegExp(searchValue);
      if (IS_REG_EXP) {
        flags = toString$j(requireObjectCoercible$8(getRegExpFlags$1(searchValue)));
        if (!~indexOf(flags, 'g')) throw new $TypeError$n('`.replaceAll` does not allow non-global regexes');
      }
      replacer = getMethod$e(searchValue, REPLACE);
      if (replacer) return call$O(replacer, searchValue, O, replaceValue);
    }
    string = toString$j(O);
    searchString = toString$j(searchValue);
    functionalReplace = isCallable$d(replaceValue);
    if (!functionalReplace) replaceValue = toString$j(replaceValue);
    searchLength = searchString.length;
    advanceBy = max$3(1, searchLength);
    position = indexOf(string, searchString);
    while (position !== -1) {
      replacement = functionalReplace
        ? toString$j(replaceValue(searchString, position, string))
        : getSubstitution(searchString, string, position, [], undefined, replaceValue);
      result += stringSlice$a(string, endOfLastMatch, position) + replacement;
      endOfLastMatch = position + searchLength;
      position = position + advanceBy > string.length ? -1 : indexOf(string, searchString, position + advanceBy);
    }
    if (endOfLastMatch < string.length) {
      result += stringSlice$a(string, endOfLastMatch);
    }
    return result;
  }
});

var call$N = functionCall;
var fixRegExpWellKnownSymbolLogic$1 = fixRegexpWellKnownSymbolLogic;
var anObject$L = anObject$1h;
var isNullOrUndefined$8 = isNullOrUndefined$j;
var requireObjectCoercible$7 = requireObjectCoercible$q;
var sameValue = sameValue$1;
var toString$i = toString$J;
var getMethod$d = getMethod$l;
var regExpExec$1 = regexpExecAbstract;

// @@search logic
fixRegExpWellKnownSymbolLogic$1('search', function (SEARCH, nativeSearch, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.es/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = requireObjectCoercible$7(this);
      var searcher = isNullOrUndefined$8(regexp) ? undefined : getMethod$d(regexp, SEARCH);
      return searcher ? call$N(searcher, regexp, O) : new RegExp(regexp)[SEARCH](toString$i(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@search
    function (string) {
      var rx = anObject$L(this);
      var S = toString$i(string);
      var res = maybeCallNative(nativeSearch, rx, S);

      if (res.done) return res.value;

      var previousLastIndex = rx.lastIndex;
      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = regExpExec$1(rx, S);
      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});

var call$M = functionCall;
var uncurryThis$U = functionUncurryThis;
var fixRegExpWellKnownSymbolLogic = fixRegexpWellKnownSymbolLogic;
var anObject$K = anObject$1h;
var isNullOrUndefined$7 = isNullOrUndefined$j;
var requireObjectCoercible$6 = requireObjectCoercible$q;
var speciesConstructor$1 = speciesConstructor$6;
var advanceStringIndex = advanceStringIndex$4;
var toLength$3 = toLength$d;
var toString$h = toString$J;
var getMethod$c = getMethod$l;
var regExpExec = regexpExecAbstract;
var stickyHelpers = regexpStickyHelpers;
var fails$p = fails$1z;

var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;
var MAX_UINT32 = 0xFFFFFFFF;
var min$6 = Math.min;
var push$g = uncurryThis$U([].push);
var stringSlice$9 = uncurryThis$U(''.slice);

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails$p(function () {
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
    return separator === undefined && limit === 0 ? [] : call$M(nativeSplit, this, separator, limit);
  } : nativeSplit;

  return [
    // `String.prototype.split` method
    // https://tc39.es/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible$6(this);
      var splitter = isNullOrUndefined$7(separator) ? undefined : getMethod$c(separator, SPLIT);
      return splitter
        ? call$M(splitter, separator, O, limit)
        : call$M(internalSplit, toString$h(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (string, limit) {
      var rx = anObject$K(this);
      var S = toString$h(string);

      if (!BUGGY) {
        var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);
        if (res.done) return res.value;
      }

      var C = speciesConstructor$1(rx, RegExp);
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
        var z = regExpExec(splitter, UNSUPPORTED_Y ? stringSlice$9(S, q) : S);
        var e;
        if (
          z === null ||
          (e = min$6(toLength$3(splitter.lastIndex + (UNSUPPORTED_Y ? q : 0)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          push$g(A, stringSlice$9(S, p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            push$g(A, z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      push$g(A, stringSlice$9(S, p));
      return A;
    }
  ];
}, BUGGY || !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y);

var $$2_ = _export;
var uncurryThis$T = functionUncurryThisClause;
var getOwnPropertyDescriptor$4 = objectGetOwnPropertyDescriptor.f;
var toLength$2 = toLength$d;
var toString$g = toString$J;
var notARegExp = notARegexp;
var requireObjectCoercible$5 = requireObjectCoercible$q;
var correctIsRegExpLogic = correctIsRegexpLogic;

var stringSlice$8 = uncurryThis$T(''.slice);
var min$5 = Math.min;

var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic('startsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG = !CORRECT_IS_REGEXP_LOGIC && !!function () {
  var descriptor = getOwnPropertyDescriptor$4(String.prototype, 'startsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.startsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.startswith
$$2_({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = toString$g(requireObjectCoercible$5(this));
    notARegExp(searchString);
    var index = toLength$2(min$5(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = toString$g(searchString);
    return stringSlice$8(that, index, index + search.length) === search;
  }
});

var $$2Z = _export;
var uncurryThis$S = functionUncurryThis;
var requireObjectCoercible$4 = requireObjectCoercible$q;
var toIntegerOrInfinity$6 = toIntegerOrInfinity$p;
var toString$f = toString$J;

var stringSlice$7 = uncurryThis$S(''.slice);
var max$2 = Math.max;
var min$4 = Math.min;

// eslint-disable-next-line unicorn/prefer-string-slice -- required for testing
var FORCED$6 = !''.substr || 'ab'.substr(-1) !== 'b';

// `String.prototype.substr` method
// https://tc39.es/ecma262/#sec-string.prototype.substr
$$2Z({ target: 'String', proto: true, forced: FORCED$6 }, {
  substr: function substr(start, length) {
    var that = toString$f(requireObjectCoercible$4(this));
    var size = that.length;
    var intStart = toIntegerOrInfinity$6(start);
    var intLength, intEnd;
    if (intStart === Infinity) intStart = 0;
    if (intStart < 0) intStart = max$2(size + intStart, 0);
    intLength = length === undefined ? size : toIntegerOrInfinity$6(length);
    if (intLength <= 0 || intLength === Infinity) return '';
    intEnd = min$4(intStart + intLength, size);
    return intStart >= intEnd ? '' : stringSlice$7(that, intStart, intEnd);
  }
});

var $$2Y = _export;
var call$L = functionCall;
var uncurryThis$R = functionUncurryThis;
var requireObjectCoercible$3 = requireObjectCoercible$q;
var toString$e = toString$J;
var fails$o = fails$1z;

var $Array$3 = Array;
var charAt$c = uncurryThis$R(''.charAt);
var charCodeAt$4 = uncurryThis$R(''.charCodeAt);
var join$6 = uncurryThis$R([].join);
// eslint-disable-next-line es/no-string-prototype-towellformed -- safe
var $toWellFormed = ''.toWellFormed;
var REPLACEMENT_CHARACTER = '\uFFFD';

// Safari bug
var TO_STRING_CONVERSION_BUG = $toWellFormed && fails$o(function () {
  return call$L($toWellFormed, 1) !== '1';
});

// `String.prototype.toWellFormed` method
// https://github.com/tc39/proposal-is-usv-string
$$2Y({ target: 'String', proto: true, forced: TO_STRING_CONVERSION_BUG }, {
  toWellFormed: function toWellFormed() {
    var S = toString$e(requireObjectCoercible$3(this));
    if (TO_STRING_CONVERSION_BUG) return call$L($toWellFormed, S);
    var length = S.length;
    var result = $Array$3(length);
    for (var i = 0; i < length; i++) {
      var charCode = charCodeAt$4(S, i);
      // single UTF-16 code unit
      if ((charCode & 0xF800) !== 0xD800) result[i] = charAt$c(S, i);
      // unpaired surrogate
      else if (charCode >= 0xDC00 || i + 1 >= length || (charCodeAt$4(S, i + 1) & 0xFC00) !== 0xDC00) result[i] = REPLACEMENT_CHARACTER;
      // surrogate pair
      else {
        result[i] = charAt$c(S, i);
        result[++i] = charAt$c(S, i);
      }
    } return join$6(result, '');
  }
});

var PROPER_FUNCTION_NAME = functionName.PROPER;
var fails$n = fails$1z;
var whitespaces$2 = whitespaces$6;

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
var stringTrimForced = function (METHOD_NAME) {
  return fails$n(function () {
    return !!whitespaces$2[METHOD_NAME]()
      || non[METHOD_NAME]() !== non
      || (PROPER_FUNCTION_NAME && whitespaces$2[METHOD_NAME].name !== METHOD_NAME);
  });
};

var $$2X = _export;
var $trim = stringTrim.trim;
var forcedStringTrimMethod$2 = stringTrimForced;

// `String.prototype.trim` method
// https://tc39.es/ecma262/#sec-string.prototype.trim
$$2X({ target: 'String', proto: true, forced: forcedStringTrimMethod$2('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});

var $trimEnd = stringTrim.end;
var forcedStringTrimMethod$1 = stringTrimForced;

// `String.prototype.{ trimEnd, trimRight }` method
// https://tc39.es/ecma262/#sec-string.prototype.trimend
// https://tc39.es/ecma262/#String.prototype.trimright
var stringTrimEnd = forcedStringTrimMethod$1('trimEnd') ? function trimEnd() {
  return $trimEnd(this);
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
} : ''.trimEnd;

var $$2W = _export;
var trimEnd$1 = stringTrimEnd;

// `String.prototype.trimRight` method
// https://tc39.es/ecma262/#sec-string.prototype.trimend
// eslint-disable-next-line es/no-string-prototype-trimleft-trimright -- safe
$$2W({ target: 'String', proto: true, name: 'trimEnd', forced: ''.trimRight !== trimEnd$1 }, {
  trimRight: trimEnd$1
});

// TODO: Remove this line from `core-js@4`

var $$2V = _export;
var trimEnd = stringTrimEnd;

// `String.prototype.trimEnd` method
// https://tc39.es/ecma262/#sec-string.prototype.trimend
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
$$2V({ target: 'String', proto: true, name: 'trimEnd', forced: ''.trimEnd !== trimEnd }, {
  trimEnd: trimEnd
});

var $trimStart = stringTrim.start;
var forcedStringTrimMethod = stringTrimForced;

// `String.prototype.{ trimStart, trimLeft }` method
// https://tc39.es/ecma262/#sec-string.prototype.trimstart
// https://tc39.es/ecma262/#String.prototype.trimleft
var stringTrimStart = forcedStringTrimMethod('trimStart') ? function trimStart() {
  return $trimStart(this);
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
} : ''.trimStart;

var $$2U = _export;
var trimStart$1 = stringTrimStart;

// `String.prototype.trimLeft` method
// https://tc39.es/ecma262/#sec-string.prototype.trimleft
// eslint-disable-next-line es/no-string-prototype-trimleft-trimright -- safe
$$2U({ target: 'String', proto: true, name: 'trimStart', forced: ''.trimLeft !== trimStart$1 }, {
  trimLeft: trimStart$1
});

// TODO: Remove this line from `core-js@4`

var $$2T = _export;
var trimStart = stringTrimStart;

// `String.prototype.trimStart` method
// https://tc39.es/ecma262/#sec-string.prototype.trimstart
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
$$2T({ target: 'String', proto: true, name: 'trimStart', forced: ''.trimStart !== trimStart }, {
  trimStart: trimStart
});

var uncurryThis$Q = functionUncurryThis;
var requireObjectCoercible$2 = requireObjectCoercible$q;
var toString$d = toString$J;

var quot = /"/g;
var replace$4 = uncurryThis$Q(''.replace);

// `CreateHTML` abstract operation
// https://tc39.es/ecma262/#sec-createhtml
var createHtml = function (string, tag, attribute, value) {
  var S = toString$d(requireObjectCoercible$2(string));
  var p1 = '<' + tag;
  if (attribute !== '') p1 += ' ' + attribute + '="' + replace$4(toString$d(value), quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};

var fails$m = fails$1z;

// check the existence of a method, lowercase
// of a tag and escaping quotes in arguments
var stringHtmlForced = function (METHOD_NAME) {
  return fails$m(function () {
    var test = ''[METHOD_NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  });
};

var $$2S = _export;
var createHTML$c = createHtml;
var forcedStringHTMLMethod$c = stringHtmlForced;

// `String.prototype.anchor` method
// https://tc39.es/ecma262/#sec-string.prototype.anchor
$$2S({ target: 'String', proto: true, forced: forcedStringHTMLMethod$c('anchor') }, {
  anchor: function anchor(name) {
    return createHTML$c(this, 'a', 'name', name);
  }
});

var $$2R = _export;
var createHTML$b = createHtml;
var forcedStringHTMLMethod$b = stringHtmlForced;

// `String.prototype.big` method
// https://tc39.es/ecma262/#sec-string.prototype.big
$$2R({ target: 'String', proto: true, forced: forcedStringHTMLMethod$b('big') }, {
  big: function big() {
    return createHTML$b(this, 'big', '', '');
  }
});

var $$2Q = _export;
var createHTML$a = createHtml;
var forcedStringHTMLMethod$a = stringHtmlForced;

// `String.prototype.blink` method
// https://tc39.es/ecma262/#sec-string.prototype.blink
$$2Q({ target: 'String', proto: true, forced: forcedStringHTMLMethod$a('blink') }, {
  blink: function blink() {
    return createHTML$a(this, 'blink', '', '');
  }
});

var $$2P = _export;
var createHTML$9 = createHtml;
var forcedStringHTMLMethod$9 = stringHtmlForced;

// `String.prototype.bold` method
// https://tc39.es/ecma262/#sec-string.prototype.bold
$$2P({ target: 'String', proto: true, forced: forcedStringHTMLMethod$9('bold') }, {
  bold: function bold() {
    return createHTML$9(this, 'b', '', '');
  }
});

var $$2O = _export;
var createHTML$8 = createHtml;
var forcedStringHTMLMethod$8 = stringHtmlForced;

// `String.prototype.fixed` method
// https://tc39.es/ecma262/#sec-string.prototype.fixed
$$2O({ target: 'String', proto: true, forced: forcedStringHTMLMethod$8('fixed') }, {
  fixed: function fixed() {
    return createHTML$8(this, 'tt', '', '');
  }
});

var $$2N = _export;
var createHTML$7 = createHtml;
var forcedStringHTMLMethod$7 = stringHtmlForced;

// `String.prototype.fontcolor` method
// https://tc39.es/ecma262/#sec-string.prototype.fontcolor
$$2N({ target: 'String', proto: true, forced: forcedStringHTMLMethod$7('fontcolor') }, {
  fontcolor: function fontcolor(color) {
    return createHTML$7(this, 'font', 'color', color);
  }
});

var $$2M = _export;
var createHTML$6 = createHtml;
var forcedStringHTMLMethod$6 = stringHtmlForced;

// `String.prototype.fontsize` method
// https://tc39.es/ecma262/#sec-string.prototype.fontsize
$$2M({ target: 'String', proto: true, forced: forcedStringHTMLMethod$6('fontsize') }, {
  fontsize: function fontsize(size) {
    return createHTML$6(this, 'font', 'size', size);
  }
});

var $$2L = _export;
var createHTML$5 = createHtml;
var forcedStringHTMLMethod$5 = stringHtmlForced;

// `String.prototype.italics` method
// https://tc39.es/ecma262/#sec-string.prototype.italics
$$2L({ target: 'String', proto: true, forced: forcedStringHTMLMethod$5('italics') }, {
  italics: function italics() {
    return createHTML$5(this, 'i', '', '');
  }
});

var $$2K = _export;
var createHTML$4 = createHtml;
var forcedStringHTMLMethod$4 = stringHtmlForced;

// `String.prototype.link` method
// https://tc39.es/ecma262/#sec-string.prototype.link
$$2K({ target: 'String', proto: true, forced: forcedStringHTMLMethod$4('link') }, {
  link: function link(url) {
    return createHTML$4(this, 'a', 'href', url);
  }
});

var $$2J = _export;
var createHTML$3 = createHtml;
var forcedStringHTMLMethod$3 = stringHtmlForced;

// `String.prototype.small` method
// https://tc39.es/ecma262/#sec-string.prototype.small
$$2J({ target: 'String', proto: true, forced: forcedStringHTMLMethod$3('small') }, {
  small: function small() {
    return createHTML$3(this, 'small', '', '');
  }
});

var $$2I = _export;
var createHTML$2 = createHtml;
var forcedStringHTMLMethod$2 = stringHtmlForced;

// `String.prototype.strike` method
// https://tc39.es/ecma262/#sec-string.prototype.strike
$$2I({ target: 'String', proto: true, forced: forcedStringHTMLMethod$2('strike') }, {
  strike: function strike() {
    return createHTML$2(this, 'strike', '', '');
  }
});

var $$2H = _export;
var createHTML$1 = createHtml;
var forcedStringHTMLMethod$1 = stringHtmlForced;

// `String.prototype.sub` method
// https://tc39.es/ecma262/#sec-string.prototype.sub
$$2H({ target: 'String', proto: true, forced: forcedStringHTMLMethod$1('sub') }, {
  sub: function sub() {
    return createHTML$1(this, 'sub', '', '');
  }
});

var $$2G = _export;
var createHTML = createHtml;
var forcedStringHTMLMethod = stringHtmlForced;

// `String.prototype.sup` method
// https://tc39.es/ecma262/#sec-string.prototype.sup
$$2G({ target: 'String', proto: true, forced: forcedStringHTMLMethod('sup') }, {
  sup: function sup() {
    return createHTML(this, 'sup', '', '');
  }
});

var typedArrayConstructor = {exports: {}};

/* eslint-disable no-new, sonar/inconsistent-function-call -- required for testing */
var globalThis$C = globalThis_1;
var fails$l = fails$1z;
var checkCorrectnessOfIteration = checkCorrectnessOfIteration$4;
var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

var ArrayBuffer$2 = globalThis$C.ArrayBuffer;
var Int8Array$3 = globalThis$C.Int8Array;

var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails$l(function () {
  Int8Array$3(1);
}) || !fails$l(function () {
  new Int8Array$3(-1);
}) || !checkCorrectnessOfIteration(function (iterable) {
  new Int8Array$3();
  new Int8Array$3(null);
  new Int8Array$3(1.5);
  new Int8Array$3(iterable);
}, true) || fails$l(function () {
  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
  return new Int8Array$3(new ArrayBuffer$2(2), 1, undefined).length !== 1;
});

var toIntegerOrInfinity$5 = toIntegerOrInfinity$p;

var $RangeError$6 = RangeError;

var toPositiveInteger$5 = function (it) {
  var result = toIntegerOrInfinity$5(it);
  if (result < 0) throw new $RangeError$6("The argument can't be less than 0");
  return result;
};

var toPositiveInteger$4 = toPositiveInteger$5;

var $RangeError$5 = RangeError;

var toOffset$2 = function (it, BYTES) {
  var offset = toPositiveInteger$4(it);
  if (offset % BYTES) throw new $RangeError$5('Wrong offset');
  return offset;
};

var round = Math.round;

var toUint8Clamped$2 = function (it) {
  var value = round(it);
  return value < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
};

var classof$7 = classof$q;

var isBigIntArray$3 = function (it) {
  var klass = classof$7(it);
  return klass === 'BigInt64Array' || klass === 'BigUint64Array';
};

var toPrimitive = toPrimitive$4;

var $TypeError$m = TypeError;

// `ToBigInt` abstract operation
// https://tc39.es/ecma262/#sec-tobigint
var toBigInt$4 = function (argument) {
  var prim = toPrimitive(argument, 'number');
  if (typeof prim == 'number') throw new $TypeError$m("Can't convert number to bigint");
  // eslint-disable-next-line es/no-bigint -- safe
  return BigInt(prim);
};

var bind$j = functionBindContext;
var call$K = functionCall;
var aConstructor$1 = aConstructor$4;
var toObject$b = toObject$E;
var lengthOfArrayLike$c = lengthOfArrayLike$B;
var getIterator$4 = getIterator$7;
var getIteratorMethod$4 = getIteratorMethod$8;
var isArrayIteratorMethod = isArrayIteratorMethod$3;
var isBigIntArray$2 = isBigIntArray$3;
var aTypedArrayConstructor$3 = arrayBufferViewCore.aTypedArrayConstructor;
var toBigInt$3 = toBigInt$4;

var typedArrayFrom$2 = function from(source /* , mapfn, thisArg */) {
  var C = aConstructor$1(this);
  var O = toObject$b(source);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod$4(O);
  var i, length, result, thisIsBigIntArray, value, step, iterator, next;
  if (iteratorMethod && !isArrayIteratorMethod(iteratorMethod)) {
    iterator = getIterator$4(O, iteratorMethod);
    next = iterator.next;
    O = [];
    while (!(step = call$K(next, iterator)).done) {
      O.push(step.value);
    }
  }
  if (mapping && argumentsLength > 2) {
    mapfn = bind$j(mapfn, arguments[2]);
  }
  length = lengthOfArrayLike$c(O);
  result = new (aTypedArrayConstructor$3(C))(length);
  thisIsBigIntArray = isBigIntArray$2(result);
  for (i = 0; length > i; i++) {
    value = mapping ? mapfn(O[i], i) : O[i];
    // FF30- typed arrays doesn't properly convert objects to typed array values
    result[i] = thisIsBigIntArray ? toBigInt$3(value) : +value;
  }
  return result;
};

var $$2F = _export;
var globalThis$B = globalThis_1;
var call$J = functionCall;
var DESCRIPTORS$h = descriptors;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$2 = typedArrayConstructorsRequireWrappers;
var ArrayBufferViewCore$A = arrayBufferViewCore;
var ArrayBufferModule = arrayBuffer;
var anInstance$a = anInstance$f;
var createPropertyDescriptor$4 = createPropertyDescriptor$d;
var createNonEnumerableProperty$7 = createNonEnumerableProperty$j;
var isIntegralNumber = isIntegralNumber$3;
var toLength$1 = toLength$d;
var toIndex$2 = toIndex$5;
var toOffset$1 = toOffset$2;
var toUint8Clamped$1 = toUint8Clamped$2;
var toPropertyKey$1 = toPropertyKey$9;
var hasOwn$h = hasOwnProperty_1;
var classof$6 = classof$q;
var isObject$g = isObject$N;
var isSymbol$2 = isSymbol$8;
var create$9 = objectCreate$1;
var isPrototypeOf$3 = objectIsPrototypeOf;
var setPrototypeOf$1 = objectSetPrototypeOf$1;
var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
var typedArrayFrom$1 = typedArrayFrom$2;
var forEach$4 = arrayIteration.forEach;
var setSpecies$1 = setSpecies$7;
var defineBuiltInAccessor$c = defineBuiltInAccessor$p;
var definePropertyModule = objectDefineProperty;
var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
var arrayFromConstructorAndList$6 = arrayFromConstructorAndList$8;
var InternalStateModule$e = internalState;
var inheritIfRequired$1 = inheritIfRequired$7;

var getInternalState$7 = InternalStateModule$e.get;
var setInternalState$f = InternalStateModule$e.set;
var enforceInternalState$1 = InternalStateModule$e.enforce;
var nativeDefineProperty = definePropertyModule.f;
var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
var RangeError$2 = globalThis$B.RangeError;
var ArrayBuffer$1 = ArrayBufferModule.ArrayBuffer;
var ArrayBufferPrototype = ArrayBuffer$1.prototype;
var DataView$1 = ArrayBufferModule.DataView;
var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore$A.NATIVE_ARRAY_BUFFER_VIEWS;
var TYPED_ARRAY_TAG = ArrayBufferViewCore$A.TYPED_ARRAY_TAG;
var TypedArray = ArrayBufferViewCore$A.TypedArray;
var TypedArrayPrototype$1 = ArrayBufferViewCore$A.TypedArrayPrototype;
var isTypedArray = ArrayBufferViewCore$A.isTypedArray;
var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
var WRONG_LENGTH = 'Wrong length';

var addGetter$1 = function (it, key) {
  defineBuiltInAccessor$c(it, key, {
    configurable: true,
    get: function () {
      return getInternalState$7(this)[key];
    }
  });
};

var isArrayBuffer = function (it) {
  var klass;
  return isPrototypeOf$3(ArrayBufferPrototype, it) || (klass = classof$6(it)) === 'ArrayBuffer' || klass === 'SharedArrayBuffer';
};

var isTypedArrayIndex = function (target, key) {
  return isTypedArray(target)
    && !isSymbol$2(key)
    && key in target
    && isIntegralNumber(+key)
    && key >= 0;
};

var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
  key = toPropertyKey$1(key);
  return isTypedArrayIndex(target, key)
    ? createPropertyDescriptor$4(2, target[key])
    : nativeGetOwnPropertyDescriptor(target, key);
};

var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
  key = toPropertyKey$1(key);
  if (isTypedArrayIndex(target, key)
    && isObject$g(descriptor)
    && hasOwn$h(descriptor, 'value')
    && !hasOwn$h(descriptor, 'get')
    && !hasOwn$h(descriptor, 'set')
    // TODO: add validation descriptor w/o calling accessors
    && !descriptor.configurable
    && (!hasOwn$h(descriptor, 'writable') || descriptor.writable)
    && (!hasOwn$h(descriptor, 'enumerable') || descriptor.enumerable)
  ) {
    target[key] = descriptor.value;
    return target;
  } return nativeDefineProperty(target, key, descriptor);
};

if (DESCRIPTORS$h) {
  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
    getOwnPropertyDescriptorModule.f = wrappedGetOwnPropertyDescriptor;
    definePropertyModule.f = wrappedDefineProperty;
    addGetter$1(TypedArrayPrototype$1, 'buffer');
    addGetter$1(TypedArrayPrototype$1, 'byteOffset');
    addGetter$1(TypedArrayPrototype$1, 'byteLength');
    addGetter$1(TypedArrayPrototype$1, 'length');
  }

  $$2F({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
    defineProperty: wrappedDefineProperty
  });

  typedArrayConstructor.exports = function (TYPE, wrapper, CLAMPED) {
    var BYTES = TYPE.match(/\d+/)[0] / 8;
    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + TYPE;
    var SETTER = 'set' + TYPE;
    var NativeTypedArrayConstructor = globalThis$B[CONSTRUCTOR_NAME];
    var TypedArrayConstructor = NativeTypedArrayConstructor;
    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
    var exported = {};

    var getter = function (that, index) {
      var data = getInternalState$7(that);
      return data.view[GETTER](index * BYTES + data.byteOffset, true);
    };

    var setter = function (that, index, value) {
      var data = getInternalState$7(that);
      data.view[SETTER](index * BYTES + data.byteOffset, CLAMPED ? toUint8Clamped$1(value) : value, true);
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
        anInstance$a(that, TypedArrayConstructorPrototype);
        var index = 0;
        var byteOffset = 0;
        var buffer, byteLength, length;
        if (!isObject$g(data)) {
          length = toIndex$2(data);
          byteLength = length * BYTES;
          buffer = new ArrayBuffer$1(byteLength);
        } else if (isArrayBuffer(data)) {
          buffer = data;
          byteOffset = toOffset$1(offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw new RangeError$2(WRONG_LENGTH);
            byteLength = $len - byteOffset;
            if (byteLength < 0) throw new RangeError$2(WRONG_LENGTH);
          } else {
            byteLength = toLength$1($length) * BYTES;
            if (byteLength + byteOffset > $len) throw new RangeError$2(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (isTypedArray(data)) {
          return arrayFromConstructorAndList$6(TypedArrayConstructor, data);
        } else {
          return call$J(typedArrayFrom$1, TypedArrayConstructor, data);
        }
        setInternalState$f(that, {
          buffer: buffer,
          byteOffset: byteOffset,
          byteLength: byteLength,
          length: length,
          view: new DataView$1(buffer)
        });
        while (index < length) addElement(that, index++);
      });

      if (setPrototypeOf$1) setPrototypeOf$1(TypedArrayConstructor, TypedArray);
      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = create$9(TypedArrayPrototype$1);
    } else if (TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$2) {
      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
        anInstance$a(dummy, TypedArrayConstructorPrototype);
        return inheritIfRequired$1(function () {
          if (!isObject$g(data)) return new NativeTypedArrayConstructor(toIndex$2(data));
          if (isArrayBuffer(data)) return $length !== undefined
            ? new NativeTypedArrayConstructor(data, toOffset$1(typedArrayOffset, BYTES), $length)
            : typedArrayOffset !== undefined
              ? new NativeTypedArrayConstructor(data, toOffset$1(typedArrayOffset, BYTES))
              : new NativeTypedArrayConstructor(data);
          if (isTypedArray(data)) return arrayFromConstructorAndList$6(TypedArrayConstructor, data);
          return call$J(typedArrayFrom$1, TypedArrayConstructor, data);
        }(), dummy, TypedArrayConstructor);
      });

      if (setPrototypeOf$1) setPrototypeOf$1(TypedArrayConstructor, TypedArray);
      forEach$4(getOwnPropertyNames$1(NativeTypedArrayConstructor), function (key) {
        if (!(key in TypedArrayConstructor)) {
          createNonEnumerableProperty$7(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
        }
      });
      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
    }

    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
      createNonEnumerableProperty$7(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
    }

    enforceInternalState$1(TypedArrayConstructorPrototype).TypedArrayConstructor = TypedArrayConstructor;

    if (TYPED_ARRAY_TAG) {
      createNonEnumerableProperty$7(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
    }

    var FORCED = TypedArrayConstructor !== NativeTypedArrayConstructor;

    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

    $$2F({ global: true, constructor: true, forced: FORCED, sham: !NATIVE_ARRAY_BUFFER_VIEWS }, exported);

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
      createNonEnumerableProperty$7(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
    }

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
      createNonEnumerableProperty$7(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
    }

    setSpecies$1(CONSTRUCTOR_NAME);
  };
} else typedArrayConstructor.exports = function () { /* empty */ };

var typedArrayConstructorExports = typedArrayConstructor.exports;

var createTypedArrayConstructor$8 = typedArrayConstructorExports;

// `Float32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$8('Float32', function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$7 = typedArrayConstructorExports;

// `Float64Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$7('Float64', function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$6 = typedArrayConstructorExports;

// `Int8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$6('Int8', function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$5 = typedArrayConstructorExports;

// `Int16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$5('Int16', function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$4 = typedArrayConstructorExports;

// `Int32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$4('Int32', function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$3 = typedArrayConstructorExports;

// `Uint8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$3('Uint8', function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$2 = typedArrayConstructorExports;

// `Uint8ClampedArray` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$2('Uint8', function (init) {
  return function Uint8ClampedArray(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
}, true);

var createTypedArrayConstructor$1 = typedArrayConstructorExports;

// `Uint16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$1('Uint16', function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor = typedArrayConstructorExports;

// `Uint32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor('Uint32', function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var ArrayBufferViewCore$z = arrayBufferViewCore;
var lengthOfArrayLike$b = lengthOfArrayLike$B;
var toIntegerOrInfinity$4 = toIntegerOrInfinity$p;

var aTypedArray$w = ArrayBufferViewCore$z.aTypedArray;
var exportTypedArrayMethod$x = ArrayBufferViewCore$z.exportTypedArrayMethod;

// `%TypedArray%.prototype.at` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.at
exportTypedArrayMethod$x('at', function at(index) {
  var O = aTypedArray$w(this);
  var len = lengthOfArrayLike$b(O);
  var relativeIndex = toIntegerOrInfinity$4(index);
  var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
  return (k < 0 || k >= len) ? undefined : O[k];
});

var uncurryThis$P = functionUncurryThis;
var ArrayBufferViewCore$y = arrayBufferViewCore;
var $ArrayCopyWithin = arrayCopyWithin;

var u$ArrayCopyWithin = uncurryThis$P($ArrayCopyWithin);
var aTypedArray$v = ArrayBufferViewCore$y.aTypedArray;
var exportTypedArrayMethod$w = ArrayBufferViewCore$y.exportTypedArrayMethod;

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
exportTypedArrayMethod$w('copyWithin', function copyWithin(target, start /* , end */) {
  return u$ArrayCopyWithin(aTypedArray$v(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
});

var ArrayBufferViewCore$x = arrayBufferViewCore;
var $every$1 = arrayIteration.every;

var aTypedArray$u = ArrayBufferViewCore$x.aTypedArray;
var exportTypedArrayMethod$v = ArrayBufferViewCore$x.exportTypedArrayMethod;

// `%TypedArray%.prototype.every` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
exportTypedArrayMethod$v('every', function every(callbackfn /* , thisArg */) {
  return $every$1(aTypedArray$u(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$w = arrayBufferViewCore;
var $fill = arrayFill$1;
var toBigInt$2 = toBigInt$4;
var classof$5 = classof$q;
var call$I = functionCall;
var uncurryThis$O = functionUncurryThis;
var fails$k = fails$1z;

var aTypedArray$t = ArrayBufferViewCore$w.aTypedArray;
var exportTypedArrayMethod$u = ArrayBufferViewCore$w.exportTypedArrayMethod;
var slice$4 = uncurryThis$O(''.slice);

// V8 ~ Chrome < 59, Safari < 14.1, FF < 55, Edge <=18
var CONVERSION_BUG = fails$k(function () {
  var count = 0;
  // eslint-disable-next-line es/no-typed-arrays -- safe
  new Int8Array(2).fill({ valueOf: function () { return count++; } });
  return count !== 1;
});

// `%TypedArray%.prototype.fill` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
exportTypedArrayMethod$u('fill', function fill(value /* , start, end */) {
  var length = arguments.length;
  aTypedArray$t(this);
  var actualValue = slice$4(classof$5(this), 0, 3) === 'Big' ? toBigInt$2(value) : +value;
  return call$I($fill, this, actualValue, length > 1 ? arguments[1] : undefined, length > 2 ? arguments[2] : undefined);
}, CONVERSION_BUG);

var ArrayBufferViewCore$v = arrayBufferViewCore;
var speciesConstructor = speciesConstructor$6;

var aTypedArrayConstructor$2 = ArrayBufferViewCore$v.aTypedArrayConstructor;
var getTypedArrayConstructor$5 = ArrayBufferViewCore$v.getTypedArrayConstructor;

// a part of `TypedArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#typedarray-species-create
var typedArraySpeciesConstructor$5 = function (originalArray) {
  return aTypedArrayConstructor$2(speciesConstructor(originalArray, getTypedArrayConstructor$5(originalArray)));
};

var arrayFromConstructorAndList$5 = arrayFromConstructorAndList$8;
var typedArraySpeciesConstructor$4 = typedArraySpeciesConstructor$5;

var typedArrayFromSpeciesAndList = function (instance, list) {
  return arrayFromConstructorAndList$5(typedArraySpeciesConstructor$4(instance), list);
};

var ArrayBufferViewCore$u = arrayBufferViewCore;
var $filter = arrayIteration.filter;
var fromSpeciesAndList$2 = typedArrayFromSpeciesAndList;

var aTypedArray$s = ArrayBufferViewCore$u.aTypedArray;
var exportTypedArrayMethod$t = ArrayBufferViewCore$u.exportTypedArrayMethod;

// `%TypedArray%.prototype.filter` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
exportTypedArrayMethod$t('filter', function filter(callbackfn /* , thisArg */) {
  var list = $filter(aTypedArray$s(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  return fromSpeciesAndList$2(this, list);
});

var ArrayBufferViewCore$t = arrayBufferViewCore;
var $find$1 = arrayIteration.find;

var aTypedArray$r = ArrayBufferViewCore$t.aTypedArray;
var exportTypedArrayMethod$s = ArrayBufferViewCore$t.exportTypedArrayMethod;

// `%TypedArray%.prototype.find` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
exportTypedArrayMethod$s('find', function find(predicate /* , thisArg */) {
  return $find$1(aTypedArray$r(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$s = arrayBufferViewCore;
var $findIndex = arrayIteration.findIndex;

var aTypedArray$q = ArrayBufferViewCore$s.aTypedArray;
var exportTypedArrayMethod$r = ArrayBufferViewCore$s.exportTypedArrayMethod;

// `%TypedArray%.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
exportTypedArrayMethod$r('findIndex', function findIndex(predicate /* , thisArg */) {
  return $findIndex(aTypedArray$q(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$r = arrayBufferViewCore;
var $findLast = arrayIterationFromLast.findLast;

var aTypedArray$p = ArrayBufferViewCore$r.aTypedArray;
var exportTypedArrayMethod$q = ArrayBufferViewCore$r.exportTypedArrayMethod;

// `%TypedArray%.prototype.findLast` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findlast
exportTypedArrayMethod$q('findLast', function findLast(predicate /* , thisArg */) {
  return $findLast(aTypedArray$p(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$q = arrayBufferViewCore;
var $findLastIndex = arrayIterationFromLast.findLastIndex;

var aTypedArray$o = ArrayBufferViewCore$q.aTypedArray;
var exportTypedArrayMethod$p = ArrayBufferViewCore$q.exportTypedArrayMethod;

// `%TypedArray%.prototype.findLastIndex` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findlastindex
exportTypedArrayMethod$p('findLastIndex', function findLastIndex(predicate /* , thisArg */) {
  return $findLastIndex(aTypedArray$o(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$p = arrayBufferViewCore;
var $forEach$1 = arrayIteration.forEach;

var aTypedArray$n = ArrayBufferViewCore$p.aTypedArray;
var exportTypedArrayMethod$o = ArrayBufferViewCore$p.exportTypedArrayMethod;

// `%TypedArray%.prototype.forEach` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
exportTypedArrayMethod$o('forEach', function forEach(callbackfn /* , thisArg */) {
  $forEach$1(aTypedArray$n(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1 = typedArrayConstructorsRequireWrappers;
var exportTypedArrayStaticMethod$2 = arrayBufferViewCore.exportTypedArrayStaticMethod;
var typedArrayFrom = typedArrayFrom$2;

// `%TypedArray%.from` method
// https://tc39.es/ecma262/#sec-%typedarray%.from
exportTypedArrayStaticMethod$2('from', typedArrayFrom, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1);

var ArrayBufferViewCore$o = arrayBufferViewCore;
var $includes = arrayIncludes.includes;

var aTypedArray$m = ArrayBufferViewCore$o.aTypedArray;
var exportTypedArrayMethod$n = ArrayBufferViewCore$o.exportTypedArrayMethod;

// `%TypedArray%.prototype.includes` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
exportTypedArrayMethod$n('includes', function includes(searchElement /* , fromIndex */) {
  return $includes(aTypedArray$m(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$n = arrayBufferViewCore;
var $indexOf = arrayIncludes.indexOf;

var aTypedArray$l = ArrayBufferViewCore$n.aTypedArray;
var exportTypedArrayMethod$m = ArrayBufferViewCore$n.exportTypedArrayMethod;

// `%TypedArray%.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
exportTypedArrayMethod$m('indexOf', function indexOf(searchElement /* , fromIndex */) {
  return $indexOf(aTypedArray$l(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var globalThis$A = globalThis_1;
var fails$j = fails$1z;
var uncurryThis$N = functionUncurryThis;
var ArrayBufferViewCore$m = arrayBufferViewCore;
var ArrayIterators = es_array_iterator;
var wellKnownSymbol$m = wellKnownSymbol$S;

var ITERATOR$5 = wellKnownSymbol$m('iterator');
var Uint8Array$4 = globalThis$A.Uint8Array;
var arrayValues = uncurryThis$N(ArrayIterators.values);
var arrayKeys = uncurryThis$N(ArrayIterators.keys);
var arrayEntries = uncurryThis$N(ArrayIterators.entries);
var aTypedArray$k = ArrayBufferViewCore$m.aTypedArray;
var exportTypedArrayMethod$l = ArrayBufferViewCore$m.exportTypedArrayMethod;
var TypedArrayPrototype = Uint8Array$4 && Uint8Array$4.prototype;

var GENERIC = !fails$j(function () {
  TypedArrayPrototype[ITERATOR$5].call([1]);
});

var ITERATOR_IS_VALUES = !!TypedArrayPrototype
  && TypedArrayPrototype.values
  && TypedArrayPrototype[ITERATOR$5] === TypedArrayPrototype.values
  && TypedArrayPrototype.values.name === 'values';

var typedArrayValues = function values() {
  return arrayValues(aTypedArray$k(this));
};

// `%TypedArray%.prototype.entries` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
exportTypedArrayMethod$l('entries', function entries() {
  return arrayEntries(aTypedArray$k(this));
}, GENERIC);
// `%TypedArray%.prototype.keys` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
exportTypedArrayMethod$l('keys', function keys() {
  return arrayKeys(aTypedArray$k(this));
}, GENERIC);
// `%TypedArray%.prototype.values` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
exportTypedArrayMethod$l('values', typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });
// `%TypedArray%.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
exportTypedArrayMethod$l(ITERATOR$5, typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });

var ArrayBufferViewCore$l = arrayBufferViewCore;
var uncurryThis$M = functionUncurryThis;

var aTypedArray$j = ArrayBufferViewCore$l.aTypedArray;
var exportTypedArrayMethod$k = ArrayBufferViewCore$l.exportTypedArrayMethod;
var $join = uncurryThis$M([].join);

// `%TypedArray%.prototype.join` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
exportTypedArrayMethod$k('join', function join(separator) {
  return $join(aTypedArray$j(this), separator);
});

var ArrayBufferViewCore$k = arrayBufferViewCore;
var apply$6 = functionApply$1;
var $lastIndexOf = arrayLastIndexOf;

var aTypedArray$i = ArrayBufferViewCore$k.aTypedArray;
var exportTypedArrayMethod$j = ArrayBufferViewCore$k.exportTypedArrayMethod;

// `%TypedArray%.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
exportTypedArrayMethod$j('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
  var length = arguments.length;
  return apply$6($lastIndexOf, aTypedArray$i(this), length > 1 ? [searchElement, arguments[1]] : [searchElement]);
});

var ArrayBufferViewCore$j = arrayBufferViewCore;
var $map = arrayIteration.map;
var typedArraySpeciesConstructor$3 = typedArraySpeciesConstructor$5;

var aTypedArray$h = ArrayBufferViewCore$j.aTypedArray;
var exportTypedArrayMethod$i = ArrayBufferViewCore$j.exportTypedArrayMethod;

// `%TypedArray%.prototype.map` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
exportTypedArrayMethod$i('map', function map(mapfn /* , thisArg */) {
  return $map(aTypedArray$h(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
    return new (typedArraySpeciesConstructor$3(O))(length);
  });
});

var ArrayBufferViewCore$i = arrayBufferViewCore;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = typedArrayConstructorsRequireWrappers;

var aTypedArrayConstructor$1 = ArrayBufferViewCore$i.aTypedArrayConstructor;
var exportTypedArrayStaticMethod$1 = ArrayBufferViewCore$i.exportTypedArrayStaticMethod;

// `%TypedArray%.of` method
// https://tc39.es/ecma262/#sec-%typedarray%.of
exportTypedArrayStaticMethod$1('of', function of(/* ...items */) {
  var index = 0;
  var length = arguments.length;
  var result = new (aTypedArrayConstructor$1(this))(length);
  while (length > index) result[index] = arguments[index++];
  return result;
}, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);

var ArrayBufferViewCore$h = arrayBufferViewCore;
var $reduce = arrayReduce.left;

var aTypedArray$g = ArrayBufferViewCore$h.aTypedArray;
var exportTypedArrayMethod$h = ArrayBufferViewCore$h.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduce` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
exportTypedArrayMethod$h('reduce', function reduce(callbackfn /* , initialValue */) {
  var length = arguments.length;
  return $reduce(aTypedArray$g(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$g = arrayBufferViewCore;
var $reduceRight = arrayReduce.right;

var aTypedArray$f = ArrayBufferViewCore$g.aTypedArray;
var exportTypedArrayMethod$g = ArrayBufferViewCore$g.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduceRight` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
exportTypedArrayMethod$g('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
  var length = arguments.length;
  return $reduceRight(aTypedArray$f(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$f = arrayBufferViewCore;

var aTypedArray$e = ArrayBufferViewCore$f.aTypedArray;
var exportTypedArrayMethod$f = ArrayBufferViewCore$f.exportTypedArrayMethod;
var floor$2 = Math.floor;

// `%TypedArray%.prototype.reverse` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
exportTypedArrayMethod$f('reverse', function reverse() {
  var that = this;
  var length = aTypedArray$e(that).length;
  var middle = floor$2(length / 2);
  var index = 0;
  var value;
  while (index < middle) {
    value = that[index];
    that[index++] = that[--length];
    that[length] = value;
  } return that;
});

var globalThis$z = globalThis_1;
var call$H = functionCall;
var ArrayBufferViewCore$e = arrayBufferViewCore;
var lengthOfArrayLike$a = lengthOfArrayLike$B;
var toOffset = toOffset$2;
var toIndexedObject$1 = toObject$E;
var fails$i = fails$1z;

var RangeError$1 = globalThis$z.RangeError;
var Int8Array$2 = globalThis$z.Int8Array;
var Int8ArrayPrototype = Int8Array$2 && Int8Array$2.prototype;
var $set = Int8ArrayPrototype && Int8ArrayPrototype.set;
var aTypedArray$d = ArrayBufferViewCore$e.aTypedArray;
var exportTypedArrayMethod$e = ArrayBufferViewCore$e.exportTypedArrayMethod;

var WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS = !fails$i(function () {
  // eslint-disable-next-line es/no-typed-arrays -- required for testing
  var array = new Uint8ClampedArray(2);
  call$H($set, array, { length: 1, 0: 3 }, 1);
  return array[1] !== 3;
});

// https://bugs.chromium.org/p/v8/issues/detail?id=11294 and other
var TO_OBJECT_BUG = WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS && ArrayBufferViewCore$e.NATIVE_ARRAY_BUFFER_VIEWS && fails$i(function () {
  var array = new Int8Array$2(2);
  array.set(1);
  array.set('2', 1);
  return array[0] !== 0 || array[1] !== 2;
});

// `%TypedArray%.prototype.set` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
exportTypedArrayMethod$e('set', function set(arrayLike /* , offset */) {
  aTypedArray$d(this);
  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
  var src = toIndexedObject$1(arrayLike);
  if (WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS) return call$H($set, this, src, offset);
  var length = this.length;
  var len = lengthOfArrayLike$a(src);
  var index = 0;
  if (len + offset > length) throw new RangeError$1('Wrong length');
  while (index < len) this[offset + index] = src[index++];
}, !WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS || TO_OBJECT_BUG);

var ArrayBufferViewCore$d = arrayBufferViewCore;
var typedArraySpeciesConstructor$2 = typedArraySpeciesConstructor$5;
var fails$h = fails$1z;
var arraySlice$3 = arraySlice$a;

var aTypedArray$c = ArrayBufferViewCore$d.aTypedArray;
var exportTypedArrayMethod$d = ArrayBufferViewCore$d.exportTypedArrayMethod;

var FORCED$5 = fails$h(function () {
  // eslint-disable-next-line es/no-typed-arrays -- required for testing
  new Int8Array(1).slice();
});

// `%TypedArray%.prototype.slice` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
exportTypedArrayMethod$d('slice', function slice(start, end) {
  var list = arraySlice$3(aTypedArray$c(this), start, end);
  var C = typedArraySpeciesConstructor$2(this);
  var index = 0;
  var length = list.length;
  var result = new C(length);
  while (length > index) result[index] = list[index++];
  return result;
}, FORCED$5);

var ArrayBufferViewCore$c = arrayBufferViewCore;
var $some$1 = arrayIteration.some;

var aTypedArray$b = ArrayBufferViewCore$c.aTypedArray;
var exportTypedArrayMethod$c = ArrayBufferViewCore$c.exportTypedArrayMethod;

// `%TypedArray%.prototype.some` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
exportTypedArrayMethod$c('some', function some(callbackfn /* , thisArg */) {
  return $some$1(aTypedArray$b(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var globalThis$y = globalThis_1;
var uncurryThis$L = functionUncurryThisClause;
var fails$g = fails$1z;
var aCallable$r = aCallable$N;
var internalSort = arraySort$1;
var ArrayBufferViewCore$b = arrayBufferViewCore;
var FF = environmentFfVersion;
var IE_OR_EDGE = environmentIsIeOrEdge;
var V8 = environmentV8Version;
var WEBKIT = environmentWebkitVersion;

var aTypedArray$a = ArrayBufferViewCore$b.aTypedArray;
var exportTypedArrayMethod$b = ArrayBufferViewCore$b.exportTypedArrayMethod;
var Uint16Array = globalThis$y.Uint16Array;
var nativeSort = Uint16Array && uncurryThis$L(Uint16Array.prototype.sort);

// WebKit
var ACCEPT_INCORRECT_ARGUMENTS = !!nativeSort && !(fails$g(function () {
  nativeSort(new Uint16Array(2), null);
}) && fails$g(function () {
  nativeSort(new Uint16Array(2), {});
}));

var STABLE_SORT = !!nativeSort && !fails$g(function () {
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
exportTypedArrayMethod$b('sort', function sort(comparefn) {
  if (comparefn !== undefined) aCallable$r(comparefn);
  if (STABLE_SORT) return nativeSort(this, comparefn);

  return internalSort(aTypedArray$a(this), getSortCompare(comparefn));
}, !STABLE_SORT || ACCEPT_INCORRECT_ARGUMENTS);

var ArrayBufferViewCore$a = arrayBufferViewCore;
var toLength = toLength$d;
var toAbsoluteIndex$1 = toAbsoluteIndex$a;
var typedArraySpeciesConstructor$1 = typedArraySpeciesConstructor$5;

var aTypedArray$9 = ArrayBufferViewCore$a.aTypedArray;
var exportTypedArrayMethod$a = ArrayBufferViewCore$a.exportTypedArrayMethod;

// `%TypedArray%.prototype.subarray` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
exportTypedArrayMethod$a('subarray', function subarray(begin, end) {
  var O = aTypedArray$9(this);
  var length = O.length;
  var beginIndex = toAbsoluteIndex$1(begin, length);
  var C = typedArraySpeciesConstructor$1(O);
  return new C(
    O.buffer,
    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
    toLength((end === undefined ? length : toAbsoluteIndex$1(end, length)) - beginIndex)
  );
});

var globalThis$x = globalThis_1;
var apply$5 = functionApply$1;
var ArrayBufferViewCore$9 = arrayBufferViewCore;
var fails$f = fails$1z;
var arraySlice$2 = arraySlice$a;

var Int8Array$1 = globalThis$x.Int8Array;
var aTypedArray$8 = ArrayBufferViewCore$9.aTypedArray;
var exportTypedArrayMethod$9 = ArrayBufferViewCore$9.exportTypedArrayMethod;
var $toLocaleString = [].toLocaleString;

// iOS Safari 6.x fails here
var TO_LOCALE_STRING_BUG = !!Int8Array$1 && fails$f(function () {
  $toLocaleString.call(new Int8Array$1(1));
});

var FORCED$4 = fails$f(function () {
  return [1, 2].toLocaleString() !== new Int8Array$1([1, 2]).toLocaleString();
}) || !fails$f(function () {
  Int8Array$1.prototype.toLocaleString.call([1, 2]);
});

// `%TypedArray%.prototype.toLocaleString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
exportTypedArrayMethod$9('toLocaleString', function toLocaleString() {
  return apply$5(
    $toLocaleString,
    TO_LOCALE_STRING_BUG ? arraySlice$2(aTypedArray$8(this)) : aTypedArray$8(this),
    arraySlice$2(arguments)
  );
}, FORCED$4);

var arrayToReversed = arrayToReversed$2;
var ArrayBufferViewCore$8 = arrayBufferViewCore;

var aTypedArray$7 = ArrayBufferViewCore$8.aTypedArray;
var exportTypedArrayMethod$8 = ArrayBufferViewCore$8.exportTypedArrayMethod;
var getTypedArrayConstructor$4 = ArrayBufferViewCore$8.getTypedArrayConstructor;

// `%TypedArray%.prototype.toReversed` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.toreversed
exportTypedArrayMethod$8('toReversed', function toReversed() {
  return arrayToReversed(aTypedArray$7(this), getTypedArrayConstructor$4(this));
});

var ArrayBufferViewCore$7 = arrayBufferViewCore;
var uncurryThis$K = functionUncurryThis;
var aCallable$q = aCallable$N;
var arrayFromConstructorAndList$4 = arrayFromConstructorAndList$8;

var aTypedArray$6 = ArrayBufferViewCore$7.aTypedArray;
var getTypedArrayConstructor$3 = ArrayBufferViewCore$7.getTypedArrayConstructor;
var exportTypedArrayMethod$7 = ArrayBufferViewCore$7.exportTypedArrayMethod;
var sort = uncurryThis$K(ArrayBufferViewCore$7.TypedArrayPrototype.sort);

// `%TypedArray%.prototype.toSorted` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tosorted
exportTypedArrayMethod$7('toSorted', function toSorted(compareFn) {
  if (compareFn !== undefined) aCallable$q(compareFn);
  var O = aTypedArray$6(this);
  var A = arrayFromConstructorAndList$4(getTypedArrayConstructor$3(O), O);
  return sort(A, compareFn);
});

var exportTypedArrayMethod$6 = arrayBufferViewCore.exportTypedArrayMethod;
var fails$e = fails$1z;
var globalThis$w = globalThis_1;
var uncurryThis$J = functionUncurryThis;

var Uint8Array$3 = globalThis$w.Uint8Array;
var Uint8ArrayPrototype = Uint8Array$3 && Uint8Array$3.prototype || {};
var arrayToString = [].toString;
var join$5 = uncurryThis$J([].join);

if (fails$e(function () { arrayToString.call({}); })) {
  arrayToString = function toString() {
    return join$5(this);
  };
}

var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString !== arrayToString;

// `%TypedArray%.prototype.toString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
exportTypedArrayMethod$6('toString', arrayToString, IS_NOT_ARRAY_METHOD);

var arrayWith = arrayWith$2;
var ArrayBufferViewCore$6 = arrayBufferViewCore;
var isBigIntArray$1 = isBigIntArray$3;
var toIntegerOrInfinity$3 = toIntegerOrInfinity$p;
var toBigInt$1 = toBigInt$4;

var aTypedArray$5 = ArrayBufferViewCore$6.aTypedArray;
var getTypedArrayConstructor$2 = ArrayBufferViewCore$6.getTypedArrayConstructor;
var exportTypedArrayMethod$5 = ArrayBufferViewCore$6.exportTypedArrayMethod;

var PROPER_ORDER$1 = !!function () {
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
exportTypedArrayMethod$5('with', { 'with': function (index, value) {
  var O = aTypedArray$5(this);
  var relativeIndex = toIntegerOrInfinity$3(index);
  var actualValue = isBigIntArray$1(O) ? toBigInt$1(value) : +value;
  return arrayWith(O, getTypedArrayConstructor$2(O), relativeIndex, actualValue);
} }['with'], !PROPER_ORDER$1);

var $$2E = _export;
var uncurryThis$I = functionUncurryThis;
var toString$c = toString$J;

var fromCharCode$5 = String.fromCharCode;
var charAt$b = uncurryThis$I(''.charAt);
var exec$b = uncurryThis$I(/./.exec);
var stringSlice$6 = uncurryThis$I(''.slice);

var hex2 = /^[\da-f]{2}$/i;
var hex4 = /^[\da-f]{4}$/i;

// `unescape` method
// https://tc39.es/ecma262/#sec-unescape-string
$$2E({ global: true }, {
  unescape: function unescape(string) {
    var str = toString$c(string);
    var result = '';
    var length = str.length;
    var index = 0;
    var chr, part;
    while (index < length) {
      chr = charAt$b(str, index++);
      if (chr === '%') {
        if (charAt$b(str, index) === 'u') {
          part = stringSlice$6(str, index + 1, index + 5);
          if (exec$b(hex4, part)) {
            result += fromCharCode$5(parseInt(part, 16));
            index += 5;
            continue;
          }
        } else {
          part = stringSlice$6(str, index, index + 2);
          if (exec$b(hex2, part)) {
            result += fromCharCode$5(parseInt(part, 16));
            index += 2;
            continue;
          }
        }
      }
      result += chr;
    } return result;
  }
});

var uncurryThis$H = functionUncurryThis;
var defineBuiltIns$8 = defineBuiltIns$b;
var getWeakData = internalMetadataExports.getWeakData;
var anInstance$9 = anInstance$f;
var anObject$J = anObject$1h;
var isNullOrUndefined$6 = isNullOrUndefined$j;
var isObject$f = isObject$N;
var iterate$u = iterate$H;
var ArrayIterationModule = arrayIteration;
var hasOwn$g = hasOwnProperty_1;
var InternalStateModule$d = internalState;

var setInternalState$e = InternalStateModule$d.set;
var internalStateGetterFor = InternalStateModule$d.getterFor;
var find$1 = ArrayIterationModule.find;
var findIndex = ArrayIterationModule.findIndex;
var splice$1 = uncurryThis$H([].splice);
var id = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function (state) {
  return state.frozen || (state.frozen = new UncaughtFrozenStore());
};

var UncaughtFrozenStore = function () {
  this.entries = [];
};

var findUncaughtFrozen = function (store, key) {
  return find$1(store.entries, function (it) {
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
    if (~index) splice$1(this.entries, index, 1);
    return !!~index;
  }
};

var collectionWeak$2 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var Constructor = wrapper(function (that, iterable) {
      anInstance$9(that, Prototype);
      setInternalState$e(that, {
        type: CONSTRUCTOR_NAME,
        id: id++,
        frozen: null
      });
      if (!isNullOrUndefined$6(iterable)) iterate$u(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var Prototype = Constructor.prototype;

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var data = getWeakData(anObject$J(key), true);
      if (data === true) uncaughtFrozenStore(state).set(key, value);
      else data[state.id] = value;
      return that;
    };

    defineBuiltIns$8(Prototype, {
      // `{ WeakMap, WeakSet }.prototype.delete(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.delete
      // https://tc39.es/ecma262/#sec-weakset.prototype.delete
      'delete': function (key) {
        var state = getInternalState(this);
        if (!isObject$f(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
        return data && hasOwn$g(data, state.id) && delete data[state.id];
      },
      // `{ WeakMap, WeakSet }.prototype.has(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.has
      // https://tc39.es/ecma262/#sec-weakset.prototype.has
      has: function has(key) {
        var state = getInternalState(this);
        if (!isObject$f(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state).has(key);
        return data && hasOwn$g(data, state.id);
      }
    });

    defineBuiltIns$8(Prototype, IS_MAP ? {
      // `WeakMap.prototype.get(key)` method
      // https://tc39.es/ecma262/#sec-weakmap.prototype.get
      get: function get(key) {
        var state = getInternalState(this);
        if (isObject$f(key)) {
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

var FREEZING$2 = freezing;
var globalThis$v = globalThis_1;
var uncurryThis$G = functionUncurryThis;
var defineBuiltIns$7 = defineBuiltIns$b;
var InternalMetadataModule = internalMetadataExports;
var collection$1 = collection$4;
var collectionWeak$1 = collectionWeak$2;
var isObject$e = isObject$N;
var enforceInternalState = internalState.enforce;
var fails$d = fails$1z;
var NATIVE_WEAK_MAP = weakMapBasicDetection;

var $Object$3 = Object;
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray$2 = Array.isArray;
// eslint-disable-next-line es/no-object-isextensible -- safe
var isExtensible = $Object$3.isExtensible;
// eslint-disable-next-line es/no-object-isfrozen -- safe
var isFrozen$2 = $Object$3.isFrozen;
// eslint-disable-next-line es/no-object-issealed -- safe
var isSealed = $Object$3.isSealed;
// eslint-disable-next-line es/no-object-freeze -- safe
var freeze$2 = $Object$3.freeze;
// eslint-disable-next-line es/no-object-seal -- safe
var seal = $Object$3.seal;

var IS_IE11 = !globalThis$v.ActiveXObject && 'ActiveXObject' in globalThis$v;
var InternalWeakMap;

var wrapper = function (init) {
  return function WeakMap() {
    return init(this, arguments.length ? arguments[0] : undefined);
  };
};

// `WeakMap` constructor
// https://tc39.es/ecma262/#sec-weakmap-constructor
var $WeakMap = collection$1('WeakMap', wrapper, collectionWeak$1);
var WeakMapPrototype$1 = $WeakMap.prototype;
var nativeSet = uncurryThis$G(WeakMapPrototype$1.set);

// Chakra Edge bug: adding frozen arrays to WeakMap unfreeze them
var hasMSEdgeFreezingBug = function () {
  return FREEZING$2 && fails$d(function () {
    var frozenArray = freeze$2([]);
    nativeSet(new $WeakMap(), frozenArray, 1);
    return !isFrozen$2(frozenArray);
  });
};

// IE11 WeakMap frozen keys fix
// We can't use feature detection because it crash some old IE builds
// https://github.com/zloirock/core-js/issues/485
if (NATIVE_WEAK_MAP) if (IS_IE11) {
  InternalWeakMap = collectionWeak$1.getConstructor(wrapper, 'WeakMap', true);
  InternalMetadataModule.enable();
  var nativeDelete = uncurryThis$G(WeakMapPrototype$1['delete']);
  var nativeHas = uncurryThis$G(WeakMapPrototype$1.has);
  var nativeGet = uncurryThis$G(WeakMapPrototype$1.get);
  defineBuiltIns$7(WeakMapPrototype$1, {
    'delete': function (key) {
      if (isObject$e(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeDelete(this, key) || state.frozen['delete'](key);
      } return nativeDelete(this, key);
    },
    has: function has(key) {
      if (isObject$e(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas(this, key) || state.frozen.has(key);
      } return nativeHas(this, key);
    },
    get: function get(key) {
      if (isObject$e(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas(this, key) ? nativeGet(this, key) : state.frozen.get(key);
      } return nativeGet(this, key);
    },
    set: function set(key, value) {
      if (isObject$e(key) && !isExtensible(key)) {
        var state = enforceInternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        nativeHas(this, key) ? nativeSet(this, key, value) : state.frozen.set(key, value);
      } else nativeSet(this, key, value);
      return this;
    }
  });
// Chakra Edge frozen keys fix
} else if (hasMSEdgeFreezingBug()) {
  defineBuiltIns$7(WeakMapPrototype$1, {
    set: function set(key, value) {
      var arrayIntegrityLevel;
      if (isArray$2(key)) {
        if (isFrozen$2(key)) arrayIntegrityLevel = freeze$2;
        else if (isSealed(key)) arrayIntegrityLevel = seal;
      }
      nativeSet(this, key, value);
      if (arrayIntegrityLevel) arrayIntegrityLevel(key);
      return this;
    }
  });
}

var collection = collection$4;
var collectionWeak = collectionWeak$2;

// `WeakSet` constructor
// https://tc39.es/ecma262/#sec-weakset-constructor
collection('WeakSet', function (init) {
  return function WeakSet() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionWeak);

var $$2D = _export;
var globalThis$u = globalThis_1;
var isPrototypeOf$2 = objectIsPrototypeOf;
var getPrototypeOf$6 = objectGetPrototypeOf$2;
var setPrototypeOf = objectSetPrototypeOf$1;
var copyConstructorProperties = copyConstructorProperties$7;
var create$8 = objectCreate$1;
var createNonEnumerableProperty$6 = createNonEnumerableProperty$j;
var createPropertyDescriptor$3 = createPropertyDescriptor$d;
var installErrorStack = errorStackInstall;
var normalizeStringArgument$2 = normalizeStringArgument$6;
var wellKnownSymbol$l = wellKnownSymbol$S;
var fails$c = fails$1z;
var IS_PURE$g = isPure;

var NativeSuppressedError = globalThis$u.SuppressedError;
var TO_STRING_TAG$6 = wellKnownSymbol$l('toStringTag');
var $Error = Error;

// https://github.com/oven-sh/bun/issues/9282
var WRONG_ARITY$4 = !!NativeSuppressedError && NativeSuppressedError.length !== 3;

// https://github.com/oven-sh/bun/issues/9283
var EXTRA_ARGS_SUPPORT = !!NativeSuppressedError && fails$c(function () {
  return new NativeSuppressedError(1, 2, 3, { cause: 4 }).cause === 4;
});

var PATCH = WRONG_ARITY$4 || EXTRA_ARGS_SUPPORT;

var $SuppressedError = function SuppressedError(error, suppressed, message) {
  var isInstance = isPrototypeOf$2(SuppressedErrorPrototype, this);
  var that;
  if (setPrototypeOf) {
    that = PATCH && (!isInstance || getPrototypeOf$6(this) === SuppressedErrorPrototype)
      ? new NativeSuppressedError()
      : setPrototypeOf(new $Error(), isInstance ? getPrototypeOf$6(this) : SuppressedErrorPrototype);
  } else {
    that = isInstance ? this : create$8(SuppressedErrorPrototype);
    createNonEnumerableProperty$6(that, TO_STRING_TAG$6, 'Error');
  }
  if (message !== undefined) createNonEnumerableProperty$6(that, 'message', normalizeStringArgument$2(message));
  installErrorStack(that, $SuppressedError, that.stack, 1);
  createNonEnumerableProperty$6(that, 'error', error);
  createNonEnumerableProperty$6(that, 'suppressed', suppressed);
  return that;
};

if (setPrototypeOf) setPrototypeOf($SuppressedError, $Error);
else copyConstructorProperties($SuppressedError, $Error, { name: true });

var SuppressedErrorPrototype = $SuppressedError.prototype = PATCH ? NativeSuppressedError.prototype : create$8($Error.prototype, {
  constructor: createPropertyDescriptor$3(1, $SuppressedError),
  message: createPropertyDescriptor$3(1, ''),
  name: createPropertyDescriptor$3(1, 'SuppressedError')
});

if (PATCH && !IS_PURE$g) SuppressedErrorPrototype.constructor = $SuppressedError;

// `SuppressedError` constructor
// https://github.com/tc39/proposal-explicit-resource-management
$$2D({ global: true, constructor: true, arity: 3, forced: PATCH }, {
  SuppressedError: $SuppressedError
});

var globalThis$t = globalThis_1;
var shared$2 = sharedStoreExports;
var isCallable$c = isCallable$I;
var getPrototypeOf$5 = objectGetPrototypeOf$2;
var defineBuiltIn$a = defineBuiltIn$u;
var wellKnownSymbol$k = wellKnownSymbol$S;

var USE_FUNCTION_CONSTRUCTOR = 'USE_FUNCTION_CONSTRUCTOR';
var ASYNC_ITERATOR$3 = wellKnownSymbol$k('asyncIterator');
var AsyncIterator = globalThis$t.AsyncIterator;
var PassedAsyncIteratorPrototype = shared$2.AsyncIteratorPrototype;
var AsyncIteratorPrototype$5, prototype;

if (PassedAsyncIteratorPrototype) {
  AsyncIteratorPrototype$5 = PassedAsyncIteratorPrototype;
} else if (isCallable$c(AsyncIterator)) {
  AsyncIteratorPrototype$5 = AsyncIterator.prototype;
} else if (shared$2[USE_FUNCTION_CONSTRUCTOR] || globalThis$t[USE_FUNCTION_CONSTRUCTOR]) {
  try {
    // eslint-disable-next-line no-new-func -- we have no alternatives without usage of modern syntax
    prototype = getPrototypeOf$5(getPrototypeOf$5(getPrototypeOf$5(Function('return async function*(){}()')())));
    if (getPrototypeOf$5(prototype) === Object.prototype) AsyncIteratorPrototype$5 = prototype;
  } catch (error) { /* empty */ }
}

if (!AsyncIteratorPrototype$5) AsyncIteratorPrototype$5 = {};

if (!isCallable$c(AsyncIteratorPrototype$5[ASYNC_ITERATOR$3])) {
  defineBuiltIn$a(AsyncIteratorPrototype$5, ASYNC_ITERATOR$3, function () {
    return this;
  });
}

var asyncIteratorPrototype = AsyncIteratorPrototype$5;

var call$G = functionCall;
var anObject$I = anObject$1h;
var create$7 = objectCreate$1;
var getMethod$b = getMethod$l;
var defineBuiltIns$6 = defineBuiltIns$b;
var InternalStateModule$c = internalState;
var getBuiltIn$u = getBuiltIn$O;
var AsyncIteratorPrototype$4 = asyncIteratorPrototype;
var createIterResultObject$c = createIterResultObject$h;

var Promise$6 = getBuiltIn$u('Promise');

var ASYNC_FROM_SYNC_ITERATOR = 'AsyncFromSyncIterator';
var setInternalState$d = InternalStateModule$c.set;
var getInternalState$6 = InternalStateModule$c.getterFor(ASYNC_FROM_SYNC_ITERATOR);

var asyncFromSyncIteratorContinuation = function (result, resolve, reject) {
  var done = result.done;
  Promise$6.resolve(result.value).then(function (value) {
    resolve(createIterResultObject$c(value, done));
  }, reject);
};

var AsyncFromSyncIterator$4 = function AsyncIterator(iteratorRecord) {
  iteratorRecord.type = ASYNC_FROM_SYNC_ITERATOR;
  setInternalState$d(this, iteratorRecord);
};

AsyncFromSyncIterator$4.prototype = defineBuiltIns$6(create$7(AsyncIteratorPrototype$4), {
  next: function next() {
    var state = getInternalState$6(this);
    return new Promise$6(function (resolve, reject) {
      var result = anObject$I(call$G(state.next, state.iterator));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  },
  'return': function () {
    var iterator = getInternalState$6(this).iterator;
    return new Promise$6(function (resolve, reject) {
      var $return = getMethod$b(iterator, 'return');
      if ($return === undefined) return resolve(createIterResultObject$c(undefined, true));
      var result = anObject$I(call$G($return, iterator));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  }
});

var asyncFromSyncIterator = AsyncFromSyncIterator$4;

var call$F = functionCall;
var AsyncFromSyncIterator$3 = asyncFromSyncIterator;
var anObject$H = anObject$1h;
var getIterator$3 = getIterator$7;
var getIteratorDirect$m = getIteratorDirect$o;
var getMethod$a = getMethod$l;
var wellKnownSymbol$j = wellKnownSymbol$S;

var ASYNC_ITERATOR$2 = wellKnownSymbol$j('asyncIterator');

var getAsyncIterator$1 = function (it, usingIterator) {
  var method = arguments.length < 2 ? getMethod$a(it, ASYNC_ITERATOR$2) : usingIterator;
  return method ? anObject$H(call$F(method, it)) : new AsyncFromSyncIterator$3(getIteratorDirect$m(getIterator$3(it)));
};

var call$E = functionCall;
var getBuiltIn$t = getBuiltIn$O;
var getMethod$9 = getMethod$l;

var asyncIteratorClose = function (iterator, method, argument, reject) {
  try {
    var returnMethod = getMethod$9(iterator, 'return');
    if (returnMethod) {
      return getBuiltIn$t('Promise').resolve(call$E(returnMethod, iterator)).then(function () {
        method(argument);
      }, function (error) {
        reject(error);
      });
    }
  } catch (error2) {
    return reject(error2);
  } method(argument);
};

// https://github.com/tc39/proposal-iterator-helpers
// https://github.com/tc39/proposal-array-from-async
var call$D = functionCall;
var aCallable$p = aCallable$N;
var anObject$G = anObject$1h;
var isObject$d = isObject$N;
var doesNotExceedSafeInteger = doesNotExceedSafeInteger$7;
var getBuiltIn$s = getBuiltIn$O;
var getIteratorDirect$l = getIteratorDirect$o;
var closeAsyncIteration$4 = asyncIteratorClose;

var createMethod = function (TYPE) {
  var IS_TO_ARRAY = TYPE === 0;
  var IS_FOR_EACH = TYPE === 1;
  var IS_EVERY = TYPE === 2;
  var IS_SOME = TYPE === 3;
  return function (object, fn, target) {
    anObject$G(object);
    var MAPPING = fn !== undefined;
    if (MAPPING || !IS_TO_ARRAY) aCallable$p(fn);
    var record = getIteratorDirect$l(object);
    var Promise = getBuiltIn$s('Promise');
    var iterator = record.iterator;
    var next = record.next;
    var counter = 0;

    return new Promise(function (resolve, reject) {
      var ifAbruptCloseAsyncIterator = function (error) {
        closeAsyncIteration$4(iterator, reject, error, reject);
      };

      var loop = function () {
        try {
          if (MAPPING) try {
            doesNotExceedSafeInteger(counter);
          } catch (error5) { ifAbruptCloseAsyncIterator(error5); }
          Promise.resolve(anObject$G(call$D(next, iterator))).then(function (step) {
            try {
              if (anObject$G(step).done) {
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
                        $result ? loop() : closeAsyncIteration$4(iterator, resolve, false, reject);
                      } else if (IS_TO_ARRAY) {
                        try {
                          target[counter++] = $result;
                          loop();
                        } catch (error4) { ifAbruptCloseAsyncIterator(error4); }
                      } else {
                        $result ? closeAsyncIteration$4(iterator, resolve, IS_SOME || value, reject) : loop();
                      }
                    };

                    if (isObject$d(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
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

var asyncIteratorIteration = {
  toArray: createMethod(0),
  forEach: createMethod(1),
  every: createMethod(2),
  some: createMethod(3),
  find: createMethod(4)
};

var bind$i = functionBindContext;
var uncurryThis$F = functionUncurryThis;
var toObject$a = toObject$E;
var isConstructor$4 = isConstructor$a;
var getAsyncIterator = getAsyncIterator$1;
var getIterator$2 = getIterator$7;
var getIteratorDirect$k = getIteratorDirect$o;
var getIteratorMethod$3 = getIteratorMethod$8;
var getMethod$8 = getMethod$l;
var getBuiltIn$r = getBuiltIn$O;
var getBuiltInPrototypeMethod = getBuiltInPrototypeMethod$2;
var wellKnownSymbol$i = wellKnownSymbol$S;
var AsyncFromSyncIterator$2 = asyncFromSyncIterator;
var toArray = asyncIteratorIteration.toArray;

var ASYNC_ITERATOR$1 = wellKnownSymbol$i('asyncIterator');
var arrayIterator = uncurryThis$F(getBuiltInPrototypeMethod('Array', 'values'));
var arrayIteratorNext = uncurryThis$F(arrayIterator([]).next);

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
var arrayFromAsync$1 = function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
  var C = this;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var thisArg = argumentsLength > 2 ? arguments[2] : undefined;
  return new (getBuiltIn$r('Promise'))(function (resolve) {
    var O = toObject$a(asyncItems);
    if (mapfn !== undefined) mapfn = bind$i(mapfn, thisArg);
    var usingAsyncIterator = getMethod$8(O, ASYNC_ITERATOR$1);
    var usingSyncIterator = usingAsyncIterator ? undefined : getIteratorMethod$3(O) || safeArrayIterator;
    var A = isConstructor$4(C) ? new C() : [];
    var iterator = usingAsyncIterator
      ? getAsyncIterator(O, usingAsyncIterator)
      : new AsyncFromSyncIterator$2(getIteratorDirect$k(getIterator$2(O, usingSyncIterator)));
    resolve(toArray(iterator, mapfn, A));
  });
};

var $$2C = _export;
var fromAsync = arrayFromAsync$1;
var fails$b = fails$1z;

var nativeFromAsync = Array.fromAsync;
// https://bugs.webkit.org/show_bug.cgi?id=271703
var INCORRECT_CONSTRUCTURING = !nativeFromAsync || fails$b(function () {
  var counter = 0;
  nativeFromAsync.call(function () {
    counter++;
    return [];
  }, { length: 0 });
  return counter !== 1;
});

// `Array.fromAsync` method
// https://github.com/tc39/proposal-array-from-async
$$2C({ target: 'Array', stat: true, forced: INCORRECT_CONSTRUCTURING }, {
  fromAsync: fromAsync
});

// TODO: remove from `core-js@4`
var $$2B = _export;
var $filterReject$3 = arrayIteration.filterReject;
var addToUnscopables$8 = addToUnscopables$n;

// `Array.prototype.filterOut` method
// https://github.com/tc39/proposal-array-filtering
$$2B({ target: 'Array', proto: true, forced: true }, {
  filterOut: function filterOut(callbackfn /* , thisArg */) {
    return $filterReject$3(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$8('filterOut');

var $$2A = _export;
var $filterReject$2 = arrayIteration.filterReject;
var addToUnscopables$7 = addToUnscopables$n;

// `Array.prototype.filterReject` method
// https://github.com/tc39/proposal-array-filtering
$$2A({ target: 'Array', proto: true, forced: true }, {
  filterReject: function filterReject(callbackfn /* , thisArg */) {
    return $filterReject$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$7('filterReject');

var bind$h = functionBindContext;
var uncurryThis$E = functionUncurryThis;
var IndexedObject$1 = indexedObject;
var toObject$9 = toObject$E;
var toPropertyKey = toPropertyKey$9;
var lengthOfArrayLike$9 = lengthOfArrayLike$B;
var objectCreate = objectCreate$1;
var arrayFromConstructorAndList$3 = arrayFromConstructorAndList$8;

var $Array$2 = Array;
var push$f = uncurryThis$E([].push);

var arrayGroup = function ($this, callbackfn, that, specificConstructor) {
  var O = toObject$9($this);
  var self = IndexedObject$1(O);
  var boundFunction = bind$h(callbackfn, that);
  var target = objectCreate(null);
  var length = lengthOfArrayLike$9(self);
  var index = 0;
  var Constructor, key, value;
  for (;length > index; index++) {
    value = self[index];
    key = toPropertyKey(boundFunction(value, index, O));
    // in some IE versions, `hasOwnProperty` returns incorrect result on integer keys
    // but since it's a `null` prototype object, we can safely use `in`
    if (key in target) push$f(target[key], value);
    else target[key] = [value];
  }
  // TODO: Remove this block from `core-js@4`
  if (specificConstructor) {
    Constructor = specificConstructor(O);
    if (Constructor !== $Array$2) {
      for (key in target) target[key] = arrayFromConstructorAndList$3(Constructor, target[key]);
    }
  } return target;
};

var $$2z = _export;
var $group$2 = arrayGroup;
var addToUnscopables$6 = addToUnscopables$n;

// `Array.prototype.group` method
// https://github.com/tc39/proposal-array-grouping
$$2z({ target: 'Array', proto: true }, {
  group: function group(callbackfn /* , thisArg */) {
    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
    return $group$2(this, callbackfn, thisArg);
  }
});

addToUnscopables$6('group');

// TODO: Remove from `core-js@4`
var $$2y = _export;
var $group$1 = arrayGroup;
var arrayMethodIsStrict$1 = arrayMethodIsStrict$b;
var addToUnscopables$5 = addToUnscopables$n;

// `Array.prototype.groupBy` method
// https://github.com/tc39/proposal-array-grouping
// https://bugs.webkit.org/show_bug.cgi?id=236541
$$2y({ target: 'Array', proto: true, forced: !arrayMethodIsStrict$1('groupBy') }, {
  groupBy: function groupBy(callbackfn /* , thisArg */) {
    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
    return $group$1(this, callbackfn, thisArg);
  }
});

addToUnscopables$5('groupBy');

var bind$g = functionBindContext;
var uncurryThis$D = functionUncurryThis;
var IndexedObject = indexedObject;
var toObject$8 = toObject$E;
var lengthOfArrayLike$8 = lengthOfArrayLike$B;
var MapHelpers$a = mapHelpers;

var Map$a = MapHelpers$a.Map;
var mapGet$1 = MapHelpers$a.get;
var mapHas$2 = MapHelpers$a.has;
var mapSet$2 = MapHelpers$a.set;
var push$e = uncurryThis$D([].push);

// `Array.prototype.groupToMap` method
// https://github.com/tc39/proposal-array-grouping
var arrayGroupToMap = function groupToMap(callbackfn /* , thisArg */) {
  var O = toObject$8(this);
  var self = IndexedObject(O);
  var boundFunction = bind$g(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  var map = new Map$a();
  var length = lengthOfArrayLike$8(self);
  var index = 0;
  var key, value;
  for (;length > index; index++) {
    value = self[index];
    key = boundFunction(value, index, O);
    if (mapHas$2(map, key)) push$e(mapGet$1(map, key), value);
    else mapSet$2(map, key, [value]);
  } return map;
};

// TODO: Remove from `core-js@4`
var $$2x = _export;
var arrayMethodIsStrict = arrayMethodIsStrict$b;
var addToUnscopables$4 = addToUnscopables$n;
var $groupToMap$1 = arrayGroupToMap;

// `Array.prototype.groupByToMap` method
// https://github.com/tc39/proposal-array-grouping
// https://bugs.webkit.org/show_bug.cgi?id=236541
$$2x({ target: 'Array', proto: true, name: 'groupToMap', forced: !arrayMethodIsStrict('groupByToMap') }, {
  groupByToMap: $groupToMap$1
});

addToUnscopables$4('groupByToMap');

var $$2w = _export;
var addToUnscopables$3 = addToUnscopables$n;
var $groupToMap = arrayGroupToMap;
var IS_PURE$f = isPure;

// `Array.prototype.groupToMap` method
// https://github.com/tc39/proposal-array-grouping
$$2w({ target: 'Array', proto: true, forced: IS_PURE$f }, {
  groupToMap: $groupToMap
});

addToUnscopables$3('groupToMap');

var $$2v = _export;
var isArray$1 = isArray$b;

// eslint-disable-next-line es/no-object-isfrozen -- safe
var isFrozen$1 = Object.isFrozen;

var isFrozenStringArray = function (array, allowUndefined) {
  if (!isFrozen$1 || !isArray$1(array) || !isFrozen$1(array)) return false;
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
$$2v({ target: 'Array', stat: true, sham: true, forced: true }, {
  isTemplateObject: function isTemplateObject(value) {
    if (!isFrozenStringArray(value, true)) return false;
    var raw = value.raw;
    return raw.length === value.length && isFrozenStringArray(raw, false);
  }
});

// TODO: Remove from `core-js@4`
var DESCRIPTORS$g = descriptors;
var addToUnscopables$2 = addToUnscopables$n;
var toObject$7 = toObject$E;
var lengthOfArrayLike$7 = lengthOfArrayLike$B;
var defineBuiltInAccessor$b = defineBuiltInAccessor$p;

// `Array.prototype.lastIndex` getter
// https://github.com/keithamus/proposal-array-last
if (DESCRIPTORS$g) {
  defineBuiltInAccessor$b(Array.prototype, 'lastIndex', {
    configurable: true,
    get: function lastIndex() {
      var O = toObject$7(this);
      var len = lengthOfArrayLike$7(O);
      return len === 0 ? 0 : len - 1;
    }
  });

  addToUnscopables$2('lastIndex');
}

// TODO: Remove from `core-js@4`
var DESCRIPTORS$f = descriptors;
var addToUnscopables$1 = addToUnscopables$n;
var toObject$6 = toObject$E;
var lengthOfArrayLike$6 = lengthOfArrayLike$B;
var defineBuiltInAccessor$a = defineBuiltInAccessor$p;

// `Array.prototype.lastIndex` accessor
// https://github.com/keithamus/proposal-array-last
if (DESCRIPTORS$f) {
  defineBuiltInAccessor$a(Array.prototype, 'lastItem', {
    configurable: true,
    get: function lastItem() {
      var O = toObject$6(this);
      var len = lengthOfArrayLike$6(O);
      return len === 0 ? undefined : O[len - 1];
    },
    set: function lastItem(value) {
      var O = toObject$6(this);
      var len = lengthOfArrayLike$6(O);
      return O[len === 0 ? 0 : len - 1] = value;
    }
  });

  addToUnscopables$1('lastItem');
}

var uncurryThis$C = functionUncurryThis;
var iterateSimple = iterateSimple$8;
var MapHelpers$9 = mapHelpers;

var Map$9 = MapHelpers$9.Map;
var MapPrototype = MapHelpers$9.proto;
var forEach$3 = uncurryThis$C(MapPrototype.forEach);
var entries = uncurryThis$C(MapPrototype.entries);
var next = entries(new Map$9()).next;

var mapIterate = function (map, fn, interruptible) {
  return interruptible ? iterateSimple({ iterator: entries(map), next: next }, function (entry) {
    return fn(entry[1], entry[0]);
  }) : forEach$3(map, fn);
};

var uncurryThis$B = functionUncurryThis;
var aCallable$o = aCallable$N;
var isNullOrUndefined$5 = isNullOrUndefined$j;
var lengthOfArrayLike$5 = lengthOfArrayLike$B;
var toObject$5 = toObject$E;
var MapHelpers$8 = mapHelpers;
var iterate$t = mapIterate;

var Map$8 = MapHelpers$8.Map;
var mapHas$1 = MapHelpers$8.has;
var mapSet$1 = MapHelpers$8.set;
var push$d = uncurryThis$B([].push);

// `Array.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
var arrayUniqueBy$2 = function uniqueBy(resolver) {
  var that = toObject$5(this);
  var length = lengthOfArrayLike$5(that);
  var result = [];
  var map = new Map$8();
  var resolverFunction = !isNullOrUndefined$5(resolver) ? aCallable$o(resolver) : function (value) {
    return value;
  };
  var index, item, key;
  for (index = 0; index < length; index++) {
    item = that[index];
    key = resolverFunction(item);
    if (!mapHas$1(map, key)) mapSet$1(map, key, item);
  }
  iterate$t(map, function (value) {
    push$d(result, value);
  });
  return result;
};

var $$2u = _export;
var addToUnscopables = addToUnscopables$n;
var uniqueBy = arrayUniqueBy$2;

// `Array.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
$$2u({ target: 'Array', proto: true, forced: true }, {
  uniqueBy: uniqueBy
});

addToUnscopables('uniqueBy');

var call$C = functionCall;
var uncurryThis$A = functionUncurryThis;
var bind$f = functionBindContext;
var anObject$F = anObject$1h;
var aCallable$n = aCallable$N;
var isNullOrUndefined$4 = isNullOrUndefined$j;
var getMethod$7 = getMethod$l;
var wellKnownSymbol$h = wellKnownSymbol$S;

var ASYNC_DISPOSE$2 = wellKnownSymbol$h('asyncDispose');
var DISPOSE$2 = wellKnownSymbol$h('dispose');

var push$c = uncurryThis$A([].push);

// `GetDisposeMethod` abstract operation
// https://tc39.es/proposal-explicit-resource-management/#sec-getdisposemethod
var getDisposeMethod = function (V, hint) {
  if (hint === 'async-dispose') {
    var method = getMethod$7(V, ASYNC_DISPOSE$2);
    if (method !== undefined) return method;
    method = getMethod$7(V, DISPOSE$2);
    if (method === undefined) return method;
    return function () {
      call$C(method, this);
    };
  } return getMethod$7(V, DISPOSE$2);
};

// `CreateDisposableResource` abstract operation
// https://tc39.es/proposal-explicit-resource-management/#sec-createdisposableresource
var createDisposableResource = function (V, hint, method) {
  if (arguments.length < 3 && !isNullOrUndefined$4(V)) {
    method = aCallable$n(getDisposeMethod(anObject$F(V), hint));
  }

  return method === undefined ? function () {
    return undefined;
  } : bind$f(method, V);
};

// `AddDisposableResource` abstract operation
// https://tc39.es/proposal-explicit-resource-management/#sec-adddisposableresource
var addDisposableResource$2 = function (disposable, V, hint, method) {
  var resource;
  if (arguments.length < 4) {
    // When `V`` is either `null` or `undefined` and hint is `async-dispose`,
    // we record that the resource was evaluated to ensure we will still perform an `Await` when resources are later disposed.
    if (isNullOrUndefined$4(V) && hint === 'sync-dispose') return;
    resource = createDisposableResource(V, hint);
  } else {
    resource = createDisposableResource(undefined, hint, method);
  }

  push$c(disposable.stack, resource);
};

// https://github.com/tc39/proposal-async-explicit-resource-management
var $$2t = _export;
var DESCRIPTORS$e = descriptors;
var getBuiltIn$q = getBuiltIn$O;
var aCallable$m = aCallable$N;
var anInstance$8 = anInstance$f;
var defineBuiltIn$9 = defineBuiltIn$u;
var defineBuiltIns$5 = defineBuiltIns$b;
var defineBuiltInAccessor$9 = defineBuiltInAccessor$p;
var wellKnownSymbol$g = wellKnownSymbol$S;
var InternalStateModule$b = internalState;
var addDisposableResource$1 = addDisposableResource$2;

var Promise$5 = getBuiltIn$q('Promise');
var SuppressedError$1 = getBuiltIn$q('SuppressedError');
var $ReferenceError$1 = ReferenceError;

var ASYNC_DISPOSE$1 = wellKnownSymbol$g('asyncDispose');
var TO_STRING_TAG$5 = wellKnownSymbol$g('toStringTag');

var ASYNC_DISPOSABLE_STACK = 'AsyncDisposableStack';
var setInternalState$c = InternalStateModule$b.set;
var getAsyncDisposableStackInternalState = InternalStateModule$b.getterFor(ASYNC_DISPOSABLE_STACK);

var HINT$1 = 'async-dispose';
var DISPOSED$1 = 'disposed';
var PENDING$1 = 'pending';

var getPendingAsyncDisposableStackInternalState = function (stack) {
  var internalState = getAsyncDisposableStackInternalState(stack);
  if (internalState.state === DISPOSED$1) throw new $ReferenceError$1(ASYNC_DISPOSABLE_STACK + ' already disposed');
  return internalState;
};

var $AsyncDisposableStack = function AsyncDisposableStack() {
  setInternalState$c(anInstance$8(this, AsyncDisposableStackPrototype), {
    type: ASYNC_DISPOSABLE_STACK,
    state: PENDING$1,
    stack: []
  });

  if (!DESCRIPTORS$e) this.disposed = false;
};

var AsyncDisposableStackPrototype = $AsyncDisposableStack.prototype;

defineBuiltIns$5(AsyncDisposableStackPrototype, {
  disposeAsync: function disposeAsync() {
    var asyncDisposableStack = this;
    return new Promise$5(function (resolve, reject) {
      var internalState = getAsyncDisposableStackInternalState(asyncDisposableStack);
      if (internalState.state === DISPOSED$1) return resolve(undefined);
      internalState.state = DISPOSED$1;
      if (!DESCRIPTORS$e) asyncDisposableStack.disposed = true;
      var stack = internalState.stack;
      var i = stack.length;
      var thrown = false;
      var suppressed;

      var handleError = function (result) {
        if (thrown) {
          suppressed = new SuppressedError$1(result, suppressed);
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
            Promise$5.resolve(disposeMethod()).then(loop, handleError);
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
    addDisposableResource$1(getPendingAsyncDisposableStackInternalState(this), value, HINT$1);
    return value;
  },
  adopt: function adopt(value, onDispose) {
    var internalState = getPendingAsyncDisposableStackInternalState(this);
    aCallable$m(onDispose);
    addDisposableResource$1(internalState, undefined, HINT$1, function () {
      return onDispose(value);
    });
    return value;
  },
  defer: function defer(onDispose) {
    var internalState = getPendingAsyncDisposableStackInternalState(this);
    aCallable$m(onDispose);
    addDisposableResource$1(internalState, undefined, HINT$1, onDispose);
  },
  move: function move() {
    var internalState = getPendingAsyncDisposableStackInternalState(this);
    var newAsyncDisposableStack = new $AsyncDisposableStack();
    getAsyncDisposableStackInternalState(newAsyncDisposableStack).stack = internalState.stack;
    internalState.stack = [];
    internalState.state = DISPOSED$1;
    if (!DESCRIPTORS$e) this.disposed = true;
    return newAsyncDisposableStack;
  }
});

if (DESCRIPTORS$e) defineBuiltInAccessor$9(AsyncDisposableStackPrototype, 'disposed', {
  configurable: true,
  get: function disposed() {
    return getAsyncDisposableStackInternalState(this).state === DISPOSED$1;
  }
});

defineBuiltIn$9(AsyncDisposableStackPrototype, ASYNC_DISPOSE$1, AsyncDisposableStackPrototype.disposeAsync, { name: 'disposeAsync' });
defineBuiltIn$9(AsyncDisposableStackPrototype, TO_STRING_TAG$5, ASYNC_DISPOSABLE_STACK, { nonWritable: true });

$$2t({ global: true, constructor: true }, {
  AsyncDisposableStack: $AsyncDisposableStack
});

var $$2s = _export;
var anInstance$7 = anInstance$f;
var getPrototypeOf$4 = objectGetPrototypeOf$2;
var createNonEnumerableProperty$5 = createNonEnumerableProperty$j;
var hasOwn$f = hasOwnProperty_1;
var wellKnownSymbol$f = wellKnownSymbol$S;
var AsyncIteratorPrototype$3 = asyncIteratorPrototype;
var IS_PURE$e = isPure;

var TO_STRING_TAG$4 = wellKnownSymbol$f('toStringTag');

var $TypeError$l = TypeError;

var AsyncIteratorConstructor = function AsyncIterator() {
  anInstance$7(this, AsyncIteratorPrototype$3);
  if (getPrototypeOf$4(this) === AsyncIteratorPrototype$3) throw new $TypeError$l('Abstract class AsyncIterator not directly constructable');
};

AsyncIteratorConstructor.prototype = AsyncIteratorPrototype$3;

if (!hasOwn$f(AsyncIteratorPrototype$3, TO_STRING_TAG$4)) {
  createNonEnumerableProperty$5(AsyncIteratorPrototype$3, TO_STRING_TAG$4, 'AsyncIterator');
}

if (!hasOwn$f(AsyncIteratorPrototype$3, 'constructor') || AsyncIteratorPrototype$3.constructor === Object) {
  createNonEnumerableProperty$5(AsyncIteratorPrototype$3, 'constructor', AsyncIteratorConstructor);
}

// `AsyncIterator` constructor
// https://github.com/tc39/proposal-async-iterator-helpers
$$2s({ global: true, constructor: true, forced: IS_PURE$e }, {
  AsyncIterator: AsyncIteratorConstructor
});

var call$B = functionCall;
var perform$1 = perform$7;
var anObject$E = anObject$1h;
var create$6 = objectCreate$1;
var createNonEnumerableProperty$4 = createNonEnumerableProperty$j;
var defineBuiltIns$4 = defineBuiltIns$b;
var wellKnownSymbol$e = wellKnownSymbol$S;
var InternalStateModule$a = internalState;
var getBuiltIn$p = getBuiltIn$O;
var getMethod$6 = getMethod$l;
var AsyncIteratorPrototype$2 = asyncIteratorPrototype;
var createIterResultObject$b = createIterResultObject$h;
var iteratorClose$3 = iteratorClose$8;

var Promise$4 = getBuiltIn$p('Promise');

var TO_STRING_TAG$3 = wellKnownSymbol$e('toStringTag');
var ASYNC_ITERATOR_HELPER = 'AsyncIteratorHelper';
var WRAP_FOR_VALID_ASYNC_ITERATOR = 'WrapForValidAsyncIterator';
var setInternalState$b = InternalStateModule$a.set;

var createAsyncIteratorProxyPrototype = function (IS_ITERATOR) {
  var IS_GENERATOR = !IS_ITERATOR;
  var getInternalState = InternalStateModule$a.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER);

  var getStateOrEarlyExit = function (that) {
    var stateCompletion = perform$1(function () {
      return getInternalState(that);
    });

    var stateError = stateCompletion.error;
    var state = stateCompletion.value;

    if (stateError || (IS_GENERATOR && state.done)) {
      return { exit: true, value: stateError ? Promise$4.reject(state) : Promise$4.resolve(createIterResultObject$b(undefined, true)) };
    } return { exit: false, value: state };
  };

  return defineBuiltIns$4(create$6(AsyncIteratorPrototype$2), {
    next: function next() {
      var stateCompletion = getStateOrEarlyExit(this);
      var state = stateCompletion.value;
      if (stateCompletion.exit) return state;
      var handlerCompletion = perform$1(function () {
        return anObject$E(state.nextHandler(Promise$4));
      });
      var handlerError = handlerCompletion.error;
      var value = handlerCompletion.value;
      if (handlerError) state.done = true;
      return handlerError ? Promise$4.reject(value) : Promise$4.resolve(value);
    },
    'return': function () {
      var stateCompletion = getStateOrEarlyExit(this);
      var state = stateCompletion.value;
      if (stateCompletion.exit) return state;
      state.done = true;
      var iterator = state.iterator;
      var returnMethod, result;
      var completion = perform$1(function () {
        if (state.inner) try {
          iteratorClose$3(state.inner.iterator, 'normal');
        } catch (error) {
          return iteratorClose$3(iterator, 'throw', error);
        }
        return getMethod$6(iterator, 'return');
      });
      returnMethod = result = completion.value;
      if (completion.error) return Promise$4.reject(result);
      if (returnMethod === undefined) return Promise$4.resolve(createIterResultObject$b(undefined, true));
      completion = perform$1(function () {
        return call$B(returnMethod, iterator);
      });
      result = completion.value;
      if (completion.error) return Promise$4.reject(result);
      return IS_ITERATOR ? Promise$4.resolve(result) : Promise$4.resolve(result).then(function (resolved) {
        anObject$E(resolved);
        return createIterResultObject$b(undefined, true);
      });
    }
  });
};

var WrapForValidAsyncIteratorPrototype = createAsyncIteratorProxyPrototype(true);
var AsyncIteratorHelperPrototype = createAsyncIteratorProxyPrototype(false);

createNonEnumerableProperty$4(AsyncIteratorHelperPrototype, TO_STRING_TAG$3, 'Async Iterator Helper');

var asyncIteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var AsyncIteratorProxy = function AsyncIterator(record, state) {
    if (state) {
      state.iterator = record.iterator;
      state.next = record.next;
    } else state = record;
    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ASYNC_ITERATOR : ASYNC_ITERATOR_HELPER;
    state.nextHandler = nextHandler;
    state.counter = 0;
    state.done = false;
    setInternalState$b(this, state);
  };

  AsyncIteratorProxy.prototype = IS_ITERATOR ? WrapForValidAsyncIteratorPrototype : AsyncIteratorHelperPrototype;

  return AsyncIteratorProxy;
};

var call$A = functionCall;
var aCallable$l = aCallable$N;
var anObject$D = anObject$1h;
var isObject$c = isObject$N;
var getIteratorDirect$j = getIteratorDirect$o;
var createAsyncIteratorProxy$5 = asyncIteratorCreateProxy;
var createIterResultObject$a = createIterResultObject$h;
var closeAsyncIteration$3 = asyncIteratorClose;

var AsyncIteratorProxy$4 = createAsyncIteratorProxy$5(function (Promise) {
  var state = this;
  var iterator = state.iterator;
  var mapper = state.mapper;

  return new Promise(function (resolve, reject) {
    var doneAndReject = function (error) {
      state.done = true;
      reject(error);
    };

    var ifAbruptCloseAsyncIterator = function (error) {
      closeAsyncIteration$3(iterator, doneAndReject, error, doneAndReject);
    };

    Promise.resolve(anObject$D(call$A(state.next, iterator))).then(function (step) {
      try {
        if (anObject$D(step).done) {
          state.done = true;
          resolve(createIterResultObject$a(undefined, true));
        } else {
          var value = step.value;
          try {
            var result = mapper(value, state.counter++);

            var handler = function (mapped) {
              resolve(createIterResultObject$a(mapped, false));
            };

            if (isObject$c(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
            else handler(result);
          } catch (error2) { ifAbruptCloseAsyncIterator(error2); }
        }
      } catch (error) { doneAndReject(error); }
    }, doneAndReject);
  });
});

// `AsyncIterator.prototype.map` method
// https://github.com/tc39/proposal-iterator-helpers
var asyncIteratorMap = function map(mapper) {
  anObject$D(this);
  aCallable$l(mapper);
  return new AsyncIteratorProxy$4(getIteratorDirect$j(this), {
    mapper: mapper
  });
};

var call$z = functionCall;
var map$3 = asyncIteratorMap;

var callback$1 = function (value, counter) {
  return [counter, value];
};

// `AsyncIterator.prototype.indexed` method
// https://github.com/tc39/proposal-iterator-helpers
var asyncIteratorIndexed = function indexed() {
  return call$z(map$3, this, callback$1);
};

// TODO: Remove from `core-js@4`
var $$2r = _export;
var indexed$3 = asyncIteratorIndexed;

// `AsyncIterator.prototype.asIndexedPairs` method
// https://github.com/tc39/proposal-iterator-helpers
$$2r({ target: 'AsyncIterator', name: 'indexed', proto: true, real: true, forced: true }, {
  asIndexedPairs: indexed$3
});

// https://github.com/tc39/proposal-async-explicit-resource-management
var call$y = functionCall;
var defineBuiltIn$8 = defineBuiltIn$u;
var getBuiltIn$o = getBuiltIn$O;
var getMethod$5 = getMethod$l;
var hasOwn$e = hasOwnProperty_1;
var wellKnownSymbol$d = wellKnownSymbol$S;
var AsyncIteratorPrototype$1 = asyncIteratorPrototype;

var ASYNC_DISPOSE = wellKnownSymbol$d('asyncDispose');
var Promise$3 = getBuiltIn$o('Promise');

if (!hasOwn$e(AsyncIteratorPrototype$1, ASYNC_DISPOSE)) {
  defineBuiltIn$8(AsyncIteratorPrototype$1, ASYNC_DISPOSE, function () {
    var O = this;
    return new Promise$3(function (resolve, reject) {
      var $return = getMethod$5(O, 'return');
      if ($return) {
        Promise$3.resolve(call$y($return, O)).then(function () {
          resolve(undefined);
        }, reject);
      } else resolve(undefined);
    });
  });
}

var $RangeError$4 = RangeError;

var notANan = function (it) {
  // eslint-disable-next-line no-self-compare -- NaN check
  if (it === it) return it;
  throw new $RangeError$4('NaN is not allowed');
};

var $$2q = _export;
var call$x = functionCall;
var anObject$C = anObject$1h;
var getIteratorDirect$i = getIteratorDirect$o;
var notANaN$3 = notANan;
var toPositiveInteger$3 = toPositiveInteger$5;
var createAsyncIteratorProxy$4 = asyncIteratorCreateProxy;
var createIterResultObject$9 = createIterResultObject$h;
var IS_PURE$d = isPure;

var AsyncIteratorProxy$3 = createAsyncIteratorProxy$4(function (Promise) {
  var state = this;

  return new Promise(function (resolve, reject) {
    var doneAndReject = function (error) {
      state.done = true;
      reject(error);
    };

    var loop = function () {
      try {
        Promise.resolve(anObject$C(call$x(state.next, state.iterator))).then(function (step) {
          try {
            if (anObject$C(step).done) {
              state.done = true;
              resolve(createIterResultObject$9(undefined, true));
            } else if (state.remaining) {
              state.remaining--;
              loop();
            } else resolve(createIterResultObject$9(step.value, false));
          } catch (err) { doneAndReject(err); }
        }, doneAndReject);
      } catch (error) { doneAndReject(error); }
    };

    loop();
  });
});

// `AsyncIterator.prototype.drop` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2q({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE$d }, {
  drop: function drop(limit) {
    anObject$C(this);
    var remaining = toPositiveInteger$3(notANaN$3(+limit));
    return new AsyncIteratorProxy$3(getIteratorDirect$i(this), {
      remaining: remaining
    });
  }
});

var $$2p = _export;
var $every = asyncIteratorIteration.every;

// `AsyncIterator.prototype.every` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2p({ target: 'AsyncIterator', proto: true, real: true }, {
  every: function every(predicate) {
    return $every(this, predicate);
  }
});

var $$2o = _export;
var call$w = functionCall;
var aCallable$k = aCallable$N;
var anObject$B = anObject$1h;
var isObject$b = isObject$N;
var getIteratorDirect$h = getIteratorDirect$o;
var createAsyncIteratorProxy$3 = asyncIteratorCreateProxy;
var createIterResultObject$8 = createIterResultObject$h;
var closeAsyncIteration$2 = asyncIteratorClose;
var IS_PURE$c = isPure;

var AsyncIteratorProxy$2 = createAsyncIteratorProxy$3(function (Promise) {
  var state = this;
  var iterator = state.iterator;
  var predicate = state.predicate;

  return new Promise(function (resolve, reject) {
    var doneAndReject = function (error) {
      state.done = true;
      reject(error);
    };

    var ifAbruptCloseAsyncIterator = function (error) {
      closeAsyncIteration$2(iterator, doneAndReject, error, doneAndReject);
    };

    var loop = function () {
      try {
        Promise.resolve(anObject$B(call$w(state.next, iterator))).then(function (step) {
          try {
            if (anObject$B(step).done) {
              state.done = true;
              resolve(createIterResultObject$8(undefined, true));
            } else {
              var value = step.value;
              try {
                var result = predicate(value, state.counter++);

                var handler = function (selected) {
                  selected ? resolve(createIterResultObject$8(value, false)) : loop();
                };

                if (isObject$b(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
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
$$2o({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE$c }, {
  filter: function filter(predicate) {
    anObject$B(this);
    aCallable$k(predicate);
    return new AsyncIteratorProxy$2(getIteratorDirect$h(this), {
      predicate: predicate
    });
  }
});

var $$2n = _export;
var $find = asyncIteratorIteration.find;

// `AsyncIterator.prototype.find` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2n({ target: 'AsyncIterator', proto: true, real: true }, {
  find: function find(predicate) {
    return $find(this, predicate);
  }
});

var call$v = functionCall;
var isCallable$b = isCallable$I;
var anObject$A = anObject$1h;
var getIteratorDirect$g = getIteratorDirect$o;
var getIteratorMethod$2 = getIteratorMethod$8;
var getMethod$4 = getMethod$l;
var wellKnownSymbol$c = wellKnownSymbol$S;
var AsyncFromSyncIterator$1 = asyncFromSyncIterator;

var ASYNC_ITERATOR = wellKnownSymbol$c('asyncIterator');

var getAsyncIteratorFlattenable$2 = function (obj) {
  var object = anObject$A(obj);
  var alreadyAsync = true;
  var method = getMethod$4(object, ASYNC_ITERATOR);
  var iterator;
  if (!isCallable$b(method)) {
    method = getIteratorMethod$2(object);
    alreadyAsync = false;
  }
  if (method !== undefined) {
    iterator = call$v(method, object);
  } else {
    iterator = object;
    alreadyAsync = true;
  }
  anObject$A(iterator);
  return getIteratorDirect$g(alreadyAsync ? iterator : new AsyncFromSyncIterator$1(getIteratorDirect$g(iterator)));
};

var $$2m = _export;
var call$u = functionCall;
var aCallable$j = aCallable$N;
var anObject$z = anObject$1h;
var isObject$a = isObject$N;
var getIteratorDirect$f = getIteratorDirect$o;
var createAsyncIteratorProxy$2 = asyncIteratorCreateProxy;
var createIterResultObject$7 = createIterResultObject$h;
var getAsyncIteratorFlattenable$1 = getAsyncIteratorFlattenable$2;
var closeAsyncIteration$1 = asyncIteratorClose;
var IS_PURE$b = isPure;

var AsyncIteratorProxy$1 = createAsyncIteratorProxy$2(function (Promise) {
  var state = this;
  var iterator = state.iterator;
  var mapper = state.mapper;

  return new Promise(function (resolve, reject) {
    var doneAndReject = function (error) {
      state.done = true;
      reject(error);
    };

    var ifAbruptCloseAsyncIterator = function (error) {
      closeAsyncIteration$1(iterator, doneAndReject, error, doneAndReject);
    };

    var outerLoop = function () {
      try {
        Promise.resolve(anObject$z(call$u(state.next, iterator))).then(function (step) {
          try {
            if (anObject$z(step).done) {
              state.done = true;
              resolve(createIterResultObject$7(undefined, true));
            } else {
              var value = step.value;
              try {
                var result = mapper(value, state.counter++);

                var handler = function (mapped) {
                  try {
                    state.inner = getAsyncIteratorFlattenable$1(mapped);
                    innerLoop();
                  } catch (error4) { ifAbruptCloseAsyncIterator(error4); }
                };

                if (isObject$a(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
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
          Promise.resolve(anObject$z(call$u(inner.next, inner.iterator))).then(function (result) {
            try {
              if (anObject$z(result).done) {
                state.inner = null;
                outerLoop();
              } else resolve(createIterResultObject$7(result.value, false));
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
$$2m({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE$b }, {
  flatMap: function flatMap(mapper) {
    anObject$z(this);
    aCallable$j(mapper);
    return new AsyncIteratorProxy$1(getIteratorDirect$f(this), {
      mapper: mapper,
      inner: null
    });
  }
});

var $$2l = _export;
var $forEach = asyncIteratorIteration.forEach;

// `AsyncIterator.prototype.forEach` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2l({ target: 'AsyncIterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    return $forEach(this, fn);
  }
});

var call$t = functionCall;
var createAsyncIteratorProxy$1 = asyncIteratorCreateProxy;

var asyncIteratorWrap = createAsyncIteratorProxy$1(function () {
  return call$t(this.next, this.iterator);
}, true);

var $$2k = _export;
var toObject$4 = toObject$E;
var isPrototypeOf$1 = objectIsPrototypeOf;
var getAsyncIteratorFlattenable = getAsyncIteratorFlattenable$2;
var AsyncIteratorPrototype = asyncIteratorPrototype;
var WrapAsyncIterator$1 = asyncIteratorWrap;
var IS_PURE$a = isPure;

// `AsyncIterator.from` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2k({ target: 'AsyncIterator', stat: true, forced: IS_PURE$a }, {
  from: function from(O) {
    var iteratorRecord = getAsyncIteratorFlattenable(typeof O == 'string' ? toObject$4(O) : O);
    return isPrototypeOf$1(AsyncIteratorPrototype, iteratorRecord.iterator)
      ? iteratorRecord.iterator
      : new WrapAsyncIterator$1(iteratorRecord);
  }
});

// TODO: Remove from `core-js@4`
var $$2j = _export;
var indexed$2 = asyncIteratorIndexed;

// `AsyncIterator.prototype.indexed` method
// https://github.com/tc39/proposal-iterator-helpers
$$2j({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  indexed: indexed$2
});

var $$2i = _export;
var map$2 = asyncIteratorMap;
var IS_PURE$9 = isPure;

// `AsyncIterator.prototype.map` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2i({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE$9 }, {
  map: map$2
});

var $$2h = _export;
var call$s = functionCall;
var aCallable$i = aCallable$N;
var anObject$y = anObject$1h;
var isObject$9 = isObject$N;
var getBuiltIn$n = getBuiltIn$O;
var getIteratorDirect$e = getIteratorDirect$o;
var closeAsyncIteration = asyncIteratorClose;

var Promise$2 = getBuiltIn$n('Promise');
var $TypeError$k = TypeError;

// `AsyncIterator.prototype.reduce` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2h({ target: 'AsyncIterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    anObject$y(this);
    aCallable$i(reducer);
    var record = getIteratorDirect$e(this);
    var iterator = record.iterator;
    var next = record.next;
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    var counter = 0;

    return new Promise$2(function (resolve, reject) {
      var ifAbruptCloseAsyncIterator = function (error) {
        closeAsyncIteration(iterator, reject, error, reject);
      };

      var loop = function () {
        try {
          Promise$2.resolve(anObject$y(call$s(next, iterator))).then(function (step) {
            try {
              if (anObject$y(step).done) {
                noInitial ? reject(new $TypeError$k('Reduce of empty iterator with no initial value')) : resolve(accumulator);
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

                  if (isObject$9(result)) Promise$2.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
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

var $$2g = _export;
var $some = asyncIteratorIteration.some;

// `AsyncIterator.prototype.some` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2g({ target: 'AsyncIterator', proto: true, real: true }, {
  some: function some(predicate) {
    return $some(this, predicate);
  }
});

var $$2f = _export;
var call$r = functionCall;
var anObject$x = anObject$1h;
var getIteratorDirect$d = getIteratorDirect$o;
var notANaN$2 = notANan;
var toPositiveInteger$2 = toPositiveInteger$5;
var createAsyncIteratorProxy = asyncIteratorCreateProxy;
var createIterResultObject$6 = createIterResultObject$h;
var IS_PURE$8 = isPure;

var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise) {
  var state = this;
  var iterator = state.iterator;
  var returnMethod;

  if (!state.remaining--) {
    var resultDone = createIterResultObject$6(undefined, true);
    state.done = true;
    returnMethod = iterator['return'];
    if (returnMethod !== undefined) {
      return Promise.resolve(call$r(returnMethod, iterator, undefined)).then(function () {
        return resultDone;
      });
    }
    return resultDone;
  } return Promise.resolve(call$r(state.next, iterator)).then(function (step) {
    if (anObject$x(step).done) {
      state.done = true;
      return createIterResultObject$6(undefined, true);
    } return createIterResultObject$6(step.value, false);
  }).then(null, function (error) {
    state.done = true;
    throw error;
  });
});

// `AsyncIterator.prototype.take` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2f({ target: 'AsyncIterator', proto: true, real: true, forced: IS_PURE$8 }, {
  take: function take(limit) {
    anObject$x(this);
    var remaining = toPositiveInteger$2(notANaN$2(+limit));
    return new AsyncIteratorProxy(getIteratorDirect$d(this), {
      remaining: remaining
    });
  }
});

var $$2e = _export;
var $toArray = asyncIteratorIteration.toArray;

// `AsyncIterator.prototype.toArray` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$2e({ target: 'AsyncIterator', proto: true, real: true }, {
  toArray: function toArray() {
    return $toArray(this, undefined, []);
  }
});

var InternalStateModule$9 = internalState;
var createIteratorConstructor$4 = iteratorCreateConstructor;
var createIterResultObject$5 = createIterResultObject$h;
var isNullOrUndefined$3 = isNullOrUndefined$j;
var isObject$8 = isObject$N;
var defineBuiltInAccessor$8 = defineBuiltInAccessor$p;
var DESCRIPTORS$d = descriptors;

var INCORRECT_RANGE = 'Incorrect Iterator.range arguments';
var NUMERIC_RANGE_ITERATOR = 'NumericRangeIterator';

var setInternalState$a = InternalStateModule$9.set;
var getInternalState$5 = InternalStateModule$9.getterFor(NUMERIC_RANGE_ITERATOR);

var $RangeError$3 = RangeError;
var $TypeError$j = TypeError;

var $RangeIterator = createIteratorConstructor$4(function NumericRangeIterator(start, end, option, type, zero, one) {
  // TODO: Drop the first `typeof` check after removing legacy methods in `core-js@4`
  if (typeof start != type || (end !== Infinity && end !== -Infinity && typeof end != type)) {
    throw new $TypeError$j(INCORRECT_RANGE);
  }
  if (start === Infinity || start === -Infinity) {
    throw new $RangeError$3(INCORRECT_RANGE);
  }
  var ifIncrease = end > start;
  var inclusiveEnd = false;
  var step;
  if (option === undefined) {
    step = undefined;
  } else if (isObject$8(option)) {
    step = option.step;
    inclusiveEnd = !!option.inclusive;
  } else if (typeof option == type) {
    step = option;
  } else {
    throw new $TypeError$j(INCORRECT_RANGE);
  }
  if (isNullOrUndefined$3(step)) {
    step = ifIncrease ? one : -one;
  }
  if (typeof step != type) {
    throw new $TypeError$j(INCORRECT_RANGE);
  }
  if (step === Infinity || step === -Infinity || (step === zero && start !== end)) {
    throw new $RangeError$3(INCORRECT_RANGE);
  }
  // eslint-disable-next-line no-self-compare -- NaN check
  var hitsEnd = start !== start || end !== end || step !== step || (end > start) !== (step > zero);
  setInternalState$a(this, {
    type: NUMERIC_RANGE_ITERATOR,
    start: start,
    end: end,
    step: step,
    inclusive: inclusiveEnd,
    hitsEnd: hitsEnd,
    currentCount: zero,
    zero: zero
  });
  if (!DESCRIPTORS$d) {
    this.start = start;
    this.end = end;
    this.step = step;
    this.inclusive = inclusiveEnd;
  }
}, NUMERIC_RANGE_ITERATOR, function next() {
  var state = getInternalState$5(this);
  if (state.hitsEnd) return createIterResultObject$5(undefined, true);
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
    return createIterResultObject$5(undefined, true);
  } return createIterResultObject$5(currentYieldingValue, false);
});

var addGetter = function (key) {
  defineBuiltInAccessor$8($RangeIterator.prototype, key, {
    get: function () {
      return getInternalState$5(this)[key];
    },
    set: function () { /* empty */ },
    configurable: true,
    enumerable: false
  });
};

if (DESCRIPTORS$d) {
  addGetter('start');
  addGetter('end');
  addGetter('inclusive');
  addGetter('step');
}

var numericRangeIterator = $RangeIterator;

/* eslint-disable es/no-bigint -- safe */
var $$2d = _export;
var NumericRangeIterator$2 = numericRangeIterator;

// `BigInt.range` method
// https://github.com/tc39/proposal-Number.range
// TODO: Remove from `core-js@4`
if (typeof BigInt == 'function') {
  $$2d({ target: 'BigInt', stat: true, forced: true }, {
    range: function range(start, end, option) {
      return new NumericRangeIterator$2(start, end, option, 'bigint', BigInt(0), BigInt(1));
    }
  });
}

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`


var getBuiltIn$m = getBuiltIn$O;
var create$5 = objectCreate$1;
var isObject$7 = isObject$N;

var $Object$2 = Object;
var $TypeError$i = TypeError;
var Map$7 = getBuiltIn$m('Map');
var WeakMap$2 = getBuiltIn$m('WeakMap');

var Node$1 = function () {
  // keys
  this.object = null;
  this.symbol = null;
  // child nodes
  this.primitives = null;
  this.objectsByIndex = create$5(null);
};

Node$1.prototype.get = function (key, initializer) {
  return this[key] || (this[key] = initializer());
};

Node$1.prototype.next = function (i, it, IS_OBJECT) {
  var store = IS_OBJECT
    ? this.objectsByIndex[i] || (this.objectsByIndex[i] = new WeakMap$2())
    : this.primitives || (this.primitives = new Map$7());
  var entry = store.get(it);
  if (!entry) store.set(it, entry = new Node$1());
  return entry;
};

var root = new Node$1();

var compositeKey = function () {
  var active = root;
  var length = arguments.length;
  var i, it;
  // for prevent leaking, start from objects
  for (i = 0; i < length; i++) {
    if (isObject$7(it = arguments[i])) active = active.next(i, it, true);
  }
  if (this === $Object$2 && active === root) throw new $TypeError$i('Composite keys must contain a non-primitive component');
  for (i = 0; i < length; i++) {
    if (!isObject$7(it = arguments[i])) active = active.next(i, it, false);
  } return active;
};

var $$2c = _export;
var apply$4 = functionApply$1;
var getCompositeKeyNode$1 = compositeKey;
var getBuiltIn$l = getBuiltIn$O;
var create$4 = objectCreate$1;

var $Object$1 = Object;

var initializer = function () {
  var freeze = getBuiltIn$l('Object', 'freeze');
  return freeze ? freeze(create$4(null)) : create$4(null);
};

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$$2c({ global: true, forced: true }, {
  compositeKey: function compositeKey() {
    return apply$4(getCompositeKeyNode$1, $Object$1, arguments).get('object', initializer);
  }
});

var $$2b = _export;
var getCompositeKeyNode = compositeKey;
var getBuiltIn$k = getBuiltIn$O;
var apply$3 = functionApply$1;

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$$2b({ global: true, forced: true }, {
  compositeSymbol: function compositeSymbol() {
    if (arguments.length === 1 && typeof arguments[0] == 'string') return getBuiltIn$k('Symbol')['for'](arguments[0]);
    return apply$3(getCompositeKeyNode, null, arguments).get('symbol', getBuiltIn$k('Symbol'));
  }
});

var $$2a = _export;
var uncurryThis$z = functionUncurryThis;
var unpackIEEE754 = ieee754.unpack;

// eslint-disable-next-line es/no-typed-arrays -- safe
var getUint16 = uncurryThis$z(DataView.prototype.getUint16);

// `DataView.prototype.getFloat16` method
// https://github.com/tc39/proposal-float16array
$$2a({ target: 'DataView', proto: true }, {
  getFloat16: function getFloat16(byteOffset /* , littleEndian */) {
    var uint16 = getUint16(this, byteOffset, arguments.length > 1 ? arguments[1] : false);
    return unpackIEEE754([uint16 & 0xFF, uint16 >> 8 & 0xFF], 10);
  }
});

var $$29 = _export;
var uncurryThis$y = functionUncurryThis;

// eslint-disable-next-line es/no-typed-arrays -- safe
var getUint8 = uncurryThis$y(DataView.prototype.getUint8);

// `DataView.prototype.getUint8Clamped` method
// https://github.com/tc39/proposal-dataview-get-set-uint8clamped
$$29({ target: 'DataView', proto: true, forced: true }, {
  getUint8Clamped: function getUint8Clamped(byteOffset) {
    return getUint8(this, byteOffset);
  }
});

var classof$4 = classof$q;

var $TypeError$h = TypeError;

var aDataView$2 = function (argument) {
  if (classof$4(argument) === 'DataView') return argument;
  throw new $TypeError$h('Argument is not a DataView');
};

var floatRound = mathFloatRound;

var FLOAT16_EPSILON = 0.0009765625;
var FLOAT16_MAX_VALUE = 65504;
var FLOAT16_MIN_VALUE = 6.103515625e-05;

// `Math.f16round` method implementation
// https://github.com/tc39/proposal-float16array
var mathF16round = Math.f16round || function f16round(x) {
  return floatRound(x, FLOAT16_EPSILON, FLOAT16_MAX_VALUE, FLOAT16_MIN_VALUE);
};

var $$28 = _export;
var uncurryThis$x = functionUncurryThis;
var aDataView$1 = aDataView$2;
var toIndex$1 = toIndex$5;
var packIEEE754 = ieee754.pack;
var f16round$1 = mathF16round;

// eslint-disable-next-line es/no-typed-arrays -- safe
var setUint16 = uncurryThis$x(DataView.prototype.setUint16);

// `DataView.prototype.setFloat16` method
// https://github.com/tc39/proposal-float16array
$$28({ target: 'DataView', proto: true }, {
  setFloat16: function setFloat16(byteOffset, value /* , littleEndian */) {
    aDataView$1(this);
    var offset = toIndex$1(byteOffset);
    var bytes = packIEEE754(f16round$1(value), 10, 2);
    return setUint16(this, offset, bytes[1] << 8 | bytes[0], arguments.length > 2 ? arguments[2] : false);
  }
});

var $$27 = _export;
var uncurryThis$w = functionUncurryThis;
var aDataView = aDataView$2;
var toIndex = toIndex$5;
var toUint8Clamped = toUint8Clamped$2;

// eslint-disable-next-line es/no-typed-arrays -- safe
var setUint8 = uncurryThis$w(DataView.prototype.setUint8);

// `DataView.prototype.setUint8Clamped` method
// https://github.com/tc39/proposal-dataview-get-set-uint8clamped
$$27({ target: 'DataView', proto: true, forced: true }, {
  setUint8Clamped: function setUint8Clamped(byteOffset, value) {
    aDataView(this);
    var offset = toIndex(byteOffset);
    return setUint8(this, offset, toUint8Clamped(value));
  }
});

// https://github.com/tc39/proposal-explicit-resource-management
var $$26 = _export;
var DESCRIPTORS$c = descriptors;
var getBuiltIn$j = getBuiltIn$O;
var aCallable$h = aCallable$N;
var anInstance$6 = anInstance$f;
var defineBuiltIn$7 = defineBuiltIn$u;
var defineBuiltIns$3 = defineBuiltIns$b;
var defineBuiltInAccessor$7 = defineBuiltInAccessor$p;
var wellKnownSymbol$b = wellKnownSymbol$S;
var InternalStateModule$8 = internalState;
var addDisposableResource = addDisposableResource$2;

var SuppressedError = getBuiltIn$j('SuppressedError');
var $ReferenceError = ReferenceError;

var DISPOSE$1 = wellKnownSymbol$b('dispose');
var TO_STRING_TAG$2 = wellKnownSymbol$b('toStringTag');

var DISPOSABLE_STACK = 'DisposableStack';
var setInternalState$9 = InternalStateModule$8.set;
var getDisposableStackInternalState = InternalStateModule$8.getterFor(DISPOSABLE_STACK);

var HINT = 'sync-dispose';
var DISPOSED = 'disposed';
var PENDING = 'pending';

var getPendingDisposableStackInternalState = function (stack) {
  var internalState = getDisposableStackInternalState(stack);
  if (internalState.state === DISPOSED) throw new $ReferenceError(DISPOSABLE_STACK + ' already disposed');
  return internalState;
};

var $DisposableStack = function DisposableStack() {
  setInternalState$9(anInstance$6(this, DisposableStackPrototype), {
    type: DISPOSABLE_STACK,
    state: PENDING,
    stack: []
  });

  if (!DESCRIPTORS$c) this.disposed = false;
};

var DisposableStackPrototype = $DisposableStack.prototype;

defineBuiltIns$3(DisposableStackPrototype, {
  dispose: function dispose() {
    var internalState = getDisposableStackInternalState(this);
    if (internalState.state === DISPOSED) return;
    internalState.state = DISPOSED;
    if (!DESCRIPTORS$c) this.disposed = true;
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
    aCallable$h(onDispose);
    addDisposableResource(internalState, undefined, HINT, function () {
      onDispose(value);
    });
    return value;
  },
  defer: function defer(onDispose) {
    var internalState = getPendingDisposableStackInternalState(this);
    aCallable$h(onDispose);
    addDisposableResource(internalState, undefined, HINT, onDispose);
  },
  move: function move() {
    var internalState = getPendingDisposableStackInternalState(this);
    var newDisposableStack = new $DisposableStack();
    getDisposableStackInternalState(newDisposableStack).stack = internalState.stack;
    internalState.stack = [];
    internalState.state = DISPOSED;
    if (!DESCRIPTORS$c) this.disposed = true;
    return newDisposableStack;
  }
});

if (DESCRIPTORS$c) defineBuiltInAccessor$7(DisposableStackPrototype, 'disposed', {
  configurable: true,
  get: function disposed() {
    return getDisposableStackInternalState(this).state === DISPOSED;
  }
});

defineBuiltIn$7(DisposableStackPrototype, DISPOSE$1, DisposableStackPrototype.dispose, { name: 'dispose' });
defineBuiltIn$7(DisposableStackPrototype, TO_STRING_TAG$2, DISPOSABLE_STACK, { nonWritable: true });

$$26({ global: true, constructor: true }, {
  DisposableStack: $DisposableStack
});

var uncurryThis$v = functionUncurryThis;
var aCallable$g = aCallable$N;

var functionDemethodize = function demethodize() {
  return uncurryThis$v(aCallable$g(this));
};

var $$25 = _export;
var demethodize$1 = functionDemethodize;

// `Function.prototype.demethodize` method
// https://github.com/js-choi/proposal-function-demethodize
$$25({ target: 'Function', proto: true, forced: true }, {
  demethodize: demethodize$1
});

var $$24 = _export;
var uncurryThis$u = functionUncurryThis;
var $isCallable = isCallable$I;
var inspectSource = inspectSource$4;
var hasOwn$d = hasOwnProperty_1;
var DESCRIPTORS$b = descriptors;

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$3 = Object.getOwnPropertyDescriptor;
var classRegExp = /^\s*class\b/;
var exec$a = uncurryThis$u(classRegExp.exec);

var isClassConstructor = function (argument) {
  try {
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    if (!DESCRIPTORS$b || !exec$a(classRegExp, inspectSource(argument))) return false;
  } catch (error) { /* empty */ }
  var prototype = getOwnPropertyDescriptor$3(argument, 'prototype');
  return !!prototype && hasOwn$d(prototype, 'writable') && !prototype.writable;
};

// `Function.isCallable` method
// https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md
$$24({ target: 'Function', stat: true, sham: true, forced: true }, {
  isCallable: function isCallable(argument) {
    return $isCallable(argument) && !isClassConstructor(argument);
  }
});

var $$23 = _export;
var isConstructor$3 = isConstructor$a;

// `Function.isConstructor` method
// https://github.com/caitp/TC39-Proposals/blob/trunk/tc39-reflect-isconstructor-iscallable.md
$$23({ target: 'Function', stat: true, forced: true }, {
  isConstructor: isConstructor$3
});

var wellKnownSymbol$a = wellKnownSymbol$S;
var defineProperty$6 = objectDefineProperty.f;

var METADATA = wellKnownSymbol$a('metadata');
var FunctionPrototype = Function.prototype;

// Function.prototype[@@metadata]
// https://github.com/tc39/proposal-decorator-metadata
if (FunctionPrototype[METADATA] === undefined) {
  defineProperty$6(FunctionPrototype, METADATA, {
    value: null
  });
}

var $$22 = _export;
var demethodize = functionDemethodize;

// `Function.prototype.unThis` method
// https://github.com/js-choi/proposal-function-demethodize
// TODO: Remove from `core-js@4`
$$22({ target: 'Function', proto: true, forced: true, name: 'demethodize' }, {
  unThis: demethodize
});

var $$21 = _export;
var globalThis$s = globalThis_1;
var anInstance$5 = anInstance$f;
var anObject$w = anObject$1h;
var isCallable$a = isCallable$I;
var getPrototypeOf$3 = objectGetPrototypeOf$2;
var defineBuiltInAccessor$6 = defineBuiltInAccessor$p;
var createProperty$3 = createProperty$b;
var fails$a = fails$1z;
var hasOwn$c = hasOwnProperty_1;
var wellKnownSymbol$9 = wellKnownSymbol$S;
var IteratorPrototype$3 = iteratorsCore.IteratorPrototype;
var DESCRIPTORS$a = descriptors;

var CONSTRUCTOR = 'constructor';
var ITERATOR$4 = 'Iterator';
var TO_STRING_TAG$1 = wellKnownSymbol$9('toStringTag');

var $TypeError$g = TypeError;
var NativeIterator = globalThis$s[ITERATOR$4];

// FF56- have non-standard global helper `Iterator`
var FORCED$3 = !isCallable$a(NativeIterator)
  || NativeIterator.prototype !== IteratorPrototype$3
  // FF44- non-standard `Iterator` passes previous tests
  || !fails$a(function () { NativeIterator({}); });

var IteratorConstructor = function Iterator() {
  anInstance$5(this, IteratorPrototype$3);
  if (getPrototypeOf$3(this) === IteratorPrototype$3) throw new $TypeError$g('Abstract class Iterator not directly constructable');
};

var defineIteratorPrototypeAccessor = function (key, value) {
  if (DESCRIPTORS$a) {
    defineBuiltInAccessor$6(IteratorPrototype$3, key, {
      configurable: true,
      get: function () {
        return value;
      },
      set: function (replacement) {
        anObject$w(this);
        if (this === IteratorPrototype$3) throw new $TypeError$g("You can't redefine this property");
        if (hasOwn$c(this, key)) this[key] = replacement;
        else createProperty$3(this, key, replacement);
      }
    });
  } else IteratorPrototype$3[key] = value;
};

if (!hasOwn$c(IteratorPrototype$3, TO_STRING_TAG$1)) defineIteratorPrototypeAccessor(TO_STRING_TAG$1, ITERATOR$4);

if (FORCED$3 || !hasOwn$c(IteratorPrototype$3, CONSTRUCTOR) || IteratorPrototype$3[CONSTRUCTOR] === Object) {
  defineIteratorPrototypeAccessor(CONSTRUCTOR, IteratorConstructor);
}

IteratorConstructor.prototype = IteratorPrototype$3;

// `Iterator` constructor
// https://github.com/tc39/proposal-iterator-helpers
$$21({ global: true, constructor: true, forced: FORCED$3 }, {
  Iterator: IteratorConstructor
});

var call$q = functionCall;
var create$3 = objectCreate$1;
var createNonEnumerableProperty$3 = createNonEnumerableProperty$j;
var defineBuiltIns$2 = defineBuiltIns$b;
var wellKnownSymbol$8 = wellKnownSymbol$S;
var InternalStateModule$7 = internalState;
var getMethod$3 = getMethod$l;
var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
var createIterResultObject$4 = createIterResultObject$h;
var iteratorClose$2 = iteratorClose$8;

var TO_STRING_TAG = wellKnownSymbol$8('toStringTag');
var ITERATOR_HELPER = 'IteratorHelper';
var WRAP_FOR_VALID_ITERATOR = 'WrapForValidIterator';
var setInternalState$8 = InternalStateModule$7.set;

var createIteratorProxyPrototype = function (IS_ITERATOR) {
  var getInternalState = InternalStateModule$7.getterFor(IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER);

  return defineBuiltIns$2(create$3(IteratorPrototype$2), {
    next: function next() {
      var state = getInternalState(this);
      // for simplification:
      //   for `%WrapForValidIteratorPrototype%.next` our `nextHandler` returns `IterResultObject`
      //   for `%IteratorHelperPrototype%.next` - just a value
      if (IS_ITERATOR) return state.nextHandler();
      try {
        var result = state.done ? undefined : state.nextHandler();
        return createIterResultObject$4(result, state.done);
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
        var returnMethod = getMethod$3(iterator, 'return');
        return returnMethod ? call$q(returnMethod, iterator) : createIterResultObject$4(undefined, true);
      }
      if (state.inner) try {
        iteratorClose$2(state.inner.iterator, 'normal');
      } catch (error) {
        return iteratorClose$2(iterator, 'throw', error);
      }
      iteratorClose$2(iterator, 'normal');
      return createIterResultObject$4(undefined, true);
    }
  });
};

var WrapForValidIteratorPrototype = createIteratorProxyPrototype(true);
var IteratorHelperPrototype = createIteratorProxyPrototype(false);

createNonEnumerableProperty$3(IteratorHelperPrototype, TO_STRING_TAG, 'Iterator Helper');

var iteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var IteratorProxy = function Iterator(record, state) {
    if (state) {
      state.iterator = record.iterator;
      state.next = record.next;
    } else state = record;
    state.type = IS_ITERATOR ? WRAP_FOR_VALID_ITERATOR : ITERATOR_HELPER;
    state.nextHandler = nextHandler;
    state.counter = 0;
    state.done = false;
    setInternalState$8(this, state);
  };

  IteratorProxy.prototype = IS_ITERATOR ? WrapForValidIteratorPrototype : IteratorHelperPrototype;

  return IteratorProxy;
};

var call$p = functionCall;
var aCallable$f = aCallable$N;
var anObject$v = anObject$1h;
var getIteratorDirect$c = getIteratorDirect$o;
var createIteratorProxy$5 = iteratorCreateProxy;
var callWithSafeIterationClosing$1 = callWithSafeIterationClosing$3;

var IteratorProxy$5 = createIteratorProxy$5(function () {
  var iterator = this.iterator;
  var result = anObject$v(call$p(this.next, iterator));
  var done = this.done = !!result.done;
  if (!done) return callWithSafeIterationClosing$1(iterator, this.mapper, [result.value, this.counter++], true);
});

// `Iterator.prototype.map` method
// https://github.com/tc39/proposal-iterator-helpers
var iteratorMap = function map(mapper) {
  anObject$v(this);
  aCallable$f(mapper);
  return new IteratorProxy$5(getIteratorDirect$c(this), {
    mapper: mapper
  });
};

var call$o = functionCall;
var map$1 = iteratorMap;

var callback = function (value, counter) {
  return [counter, value];
};

// `Iterator.prototype.indexed` method
// https://github.com/tc39/proposal-iterator-helpers
var iteratorIndexed = function indexed() {
  return call$o(map$1, this, callback);
};

// TODO: Remove from `core-js@4`
var $$20 = _export;
var indexed$1 = iteratorIndexed;

// `Iterator.prototype.asIndexedPairs` method
// https://github.com/tc39/proposal-iterator-helpers
$$20({ target: 'Iterator', name: 'indexed', proto: true, real: true, forced: true }, {
  asIndexedPairs: indexed$1
});

// https://github.com/tc39/proposal-explicit-resource-management
var call$n = functionCall;
var defineBuiltIn$6 = defineBuiltIn$u;
var getMethod$2 = getMethod$l;
var hasOwn$b = hasOwnProperty_1;
var wellKnownSymbol$7 = wellKnownSymbol$S;
var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

var DISPOSE = wellKnownSymbol$7('dispose');

if (!hasOwn$b(IteratorPrototype$1, DISPOSE)) {
  defineBuiltIn$6(IteratorPrototype$1, DISPOSE, function () {
    var $return = getMethod$2(this, 'return');
    if ($return) call$n($return, this);
  });
}

var $$1$ = _export;
var call$m = functionCall;
var anObject$u = anObject$1h;
var getIteratorDirect$b = getIteratorDirect$o;
var notANaN$1 = notANan;
var toPositiveInteger$1 = toPositiveInteger$5;
var createIteratorProxy$4 = iteratorCreateProxy;
var IS_PURE$7 = isPure;

var IteratorProxy$4 = createIteratorProxy$4(function () {
  var iterator = this.iterator;
  var next = this.next;
  var result, done;
  while (this.remaining) {
    this.remaining--;
    result = anObject$u(call$m(next, iterator));
    done = this.done = !!result.done;
    if (done) return;
  }
  result = anObject$u(call$m(next, iterator));
  done = this.done = !!result.done;
  if (!done) return result.value;
});

// `Iterator.prototype.drop` method
// https://github.com/tc39/proposal-iterator-helpers
$$1$({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$7 }, {
  drop: function drop(limit) {
    anObject$u(this);
    var remaining = toPositiveInteger$1(notANaN$1(+limit));
    return new IteratorProxy$4(getIteratorDirect$b(this), {
      remaining: remaining
    });
  }
});

var $$1_ = _export;
var iterate$s = iterate$H;
var aCallable$e = aCallable$N;
var anObject$t = anObject$1h;
var getIteratorDirect$a = getIteratorDirect$o;

// `Iterator.prototype.every` method
// https://github.com/tc39/proposal-iterator-helpers
$$1_({ target: 'Iterator', proto: true, real: true }, {
  every: function every(predicate) {
    anObject$t(this);
    aCallable$e(predicate);
    var record = getIteratorDirect$a(this);
    var counter = 0;
    return !iterate$s(record, function (value, stop) {
      if (!predicate(value, counter++)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});

var $$1Z = _export;
var call$l = functionCall;
var aCallable$d = aCallable$N;
var anObject$s = anObject$1h;
var getIteratorDirect$9 = getIteratorDirect$o;
var createIteratorProxy$3 = iteratorCreateProxy;
var callWithSafeIterationClosing = callWithSafeIterationClosing$3;
var IS_PURE$6 = isPure;

var IteratorProxy$3 = createIteratorProxy$3(function () {
  var iterator = this.iterator;
  var predicate = this.predicate;
  var next = this.next;
  var result, done, value;
  while (true) {
    result = anObject$s(call$l(next, iterator));
    done = this.done = !!result.done;
    if (done) return;
    value = result.value;
    if (callWithSafeIterationClosing(iterator, predicate, [value, this.counter++], true)) return value;
  }
});

// `Iterator.prototype.filter` method
// https://github.com/tc39/proposal-iterator-helpers
$$1Z({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$6 }, {
  filter: function filter(predicate) {
    anObject$s(this);
    aCallable$d(predicate);
    return new IteratorProxy$3(getIteratorDirect$9(this), {
      predicate: predicate
    });
  }
});

var $$1Y = _export;
var iterate$r = iterate$H;
var aCallable$c = aCallable$N;
var anObject$r = anObject$1h;
var getIteratorDirect$8 = getIteratorDirect$o;

// `Iterator.prototype.find` method
// https://github.com/tc39/proposal-iterator-helpers
$$1Y({ target: 'Iterator', proto: true, real: true }, {
  find: function find(predicate) {
    anObject$r(this);
    aCallable$c(predicate);
    var record = getIteratorDirect$8(this);
    var counter = 0;
    return iterate$r(record, function (value, stop) {
      if (predicate(value, counter++)) return stop(value);
    }, { IS_RECORD: true, INTERRUPTED: true }).result;
  }
});

var call$k = functionCall;
var anObject$q = anObject$1h;
var getIteratorDirect$7 = getIteratorDirect$o;
var getIteratorMethod$1 = getIteratorMethod$8;

var getIteratorFlattenable$2 = function (obj, stringHandling) {
  if (!stringHandling || typeof obj !== 'string') anObject$q(obj);
  var method = getIteratorMethod$1(obj);
  return getIteratorDirect$7(anObject$q(method !== undefined ? call$k(method, obj) : obj));
};

var $$1X = _export;
var call$j = functionCall;
var aCallable$b = aCallable$N;
var anObject$p = anObject$1h;
var getIteratorDirect$6 = getIteratorDirect$o;
var getIteratorFlattenable$1 = getIteratorFlattenable$2;
var createIteratorProxy$2 = iteratorCreateProxy;
var iteratorClose$1 = iteratorClose$8;
var IS_PURE$5 = isPure;

var IteratorProxy$2 = createIteratorProxy$2(function () {
  var iterator = this.iterator;
  var mapper = this.mapper;
  var result, inner;

  while (true) {
    if (inner = this.inner) try {
      result = anObject$p(call$j(inner.next, inner.iterator));
      if (!result.done) return result.value;
      this.inner = null;
    } catch (error) { iteratorClose$1(iterator, 'throw', error); }

    result = anObject$p(call$j(this.next, iterator));

    if (this.done = !!result.done) return;

    try {
      this.inner = getIteratorFlattenable$1(mapper(result.value, this.counter++), false);
    } catch (error) { iteratorClose$1(iterator, 'throw', error); }
  }
});

// `Iterator.prototype.flatMap` method
// https://github.com/tc39/proposal-iterator-helpers
$$1X({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$5 }, {
  flatMap: function flatMap(mapper) {
    anObject$p(this);
    aCallable$b(mapper);
    return new IteratorProxy$2(getIteratorDirect$6(this), {
      mapper: mapper,
      inner: null
    });
  }
});

var $$1W = _export;
var iterate$q = iterate$H;
var aCallable$a = aCallable$N;
var anObject$o = anObject$1h;
var getIteratorDirect$5 = getIteratorDirect$o;

// `Iterator.prototype.forEach` method
// https://github.com/tc39/proposal-iterator-helpers
$$1W({ target: 'Iterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    anObject$o(this);
    aCallable$a(fn);
    var record = getIteratorDirect$5(this);
    var counter = 0;
    iterate$q(record, function (value) {
      fn(value, counter++);
    }, { IS_RECORD: true });
  }
});

var $$1V = _export;
var call$i = functionCall;
var toObject$3 = toObject$E;
var isPrototypeOf = objectIsPrototypeOf;
var IteratorPrototype = iteratorsCore.IteratorPrototype;
var createIteratorProxy$1 = iteratorCreateProxy;
var getIteratorFlattenable = getIteratorFlattenable$2;
var IS_PURE$4 = isPure;

var IteratorProxy$1 = createIteratorProxy$1(function () {
  return call$i(this.next, this.iterator);
}, true);

// `Iterator.from` method
// https://github.com/tc39/proposal-iterator-helpers
$$1V({ target: 'Iterator', stat: true, forced: IS_PURE$4 }, {
  from: function from(O) {
    var iteratorRecord = getIteratorFlattenable(typeof O == 'string' ? toObject$3(O) : O, true);
    return isPrototypeOf(IteratorPrototype, iteratorRecord.iterator)
      ? iteratorRecord.iterator
      : new IteratorProxy$1(iteratorRecord);
  }
});

// TODO: Remove from `core-js@4`
var $$1U = _export;
var indexed = iteratorIndexed;

// `Iterator.prototype.indexed` method
// https://github.com/tc39/proposal-iterator-helpers
$$1U({ target: 'Iterator', proto: true, real: true, forced: true }, {
  indexed: indexed
});

var $$1T = _export;
var map = iteratorMap;
var IS_PURE$3 = isPure;

// `Iterator.prototype.map` method
// https://github.com/tc39/proposal-iterator-helpers
$$1T({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$3 }, {
  map: map
});

/* eslint-disable es/no-bigint -- safe */
var $$1S = _export;
var NumericRangeIterator$1 = numericRangeIterator;

var $TypeError$f = TypeError;

// `Iterator.range` method
// https://github.com/tc39/proposal-Number.range
$$1S({ target: 'Iterator', stat: true, forced: true }, {
  range: function range(start, end, option) {
    if (typeof start == 'number') return new NumericRangeIterator$1(start, end, option, 'number', 0, 1);
    if (typeof start == 'bigint') return new NumericRangeIterator$1(start, end, option, 'bigint', BigInt(0), BigInt(1));
    throw new $TypeError$f('Incorrect Iterator.range arguments');
  }
});

var $$1R = _export;
var iterate$p = iterate$H;
var aCallable$9 = aCallable$N;
var anObject$n = anObject$1h;
var getIteratorDirect$4 = getIteratorDirect$o;

var $TypeError$e = TypeError;

// `Iterator.prototype.reduce` method
// https://github.com/tc39/proposal-iterator-helpers
$$1R({ target: 'Iterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    anObject$n(this);
    aCallable$9(reducer);
    var record = getIteratorDirect$4(this);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    var counter = 0;
    iterate$p(record, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = reducer(accumulator, value, counter);
      }
      counter++;
    }, { IS_RECORD: true });
    if (noInitial) throw new $TypeError$e('Reduce of empty iterator with no initial value');
    return accumulator;
  }
});

var $$1Q = _export;
var iterate$o = iterate$H;
var aCallable$8 = aCallable$N;
var anObject$m = anObject$1h;
var getIteratorDirect$3 = getIteratorDirect$o;

// `Iterator.prototype.some` method
// https://github.com/tc39/proposal-iterator-helpers
$$1Q({ target: 'Iterator', proto: true, real: true }, {
  some: function some(predicate) {
    anObject$m(this);
    aCallable$8(predicate);
    var record = getIteratorDirect$3(this);
    var counter = 0;
    return iterate$o(record, function (value, stop) {
      if (predicate(value, counter++)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});

var $$1P = _export;
var call$h = functionCall;
var anObject$l = anObject$1h;
var getIteratorDirect$2 = getIteratorDirect$o;
var notANaN = notANan;
var toPositiveInteger = toPositiveInteger$5;
var createIteratorProxy = iteratorCreateProxy;
var iteratorClose = iteratorClose$8;
var IS_PURE$2 = isPure;

var IteratorProxy = createIteratorProxy(function () {
  var iterator = this.iterator;
  if (!this.remaining--) {
    this.done = true;
    return iteratorClose(iterator, 'normal', undefined);
  }
  var result = anObject$l(call$h(this.next, iterator));
  var done = this.done = !!result.done;
  if (!done) return result.value;
});

// `Iterator.prototype.take` method
// https://github.com/tc39/proposal-iterator-helpers
$$1P({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$2 }, {
  take: function take(limit) {
    anObject$l(this);
    var remaining = toPositiveInteger(notANaN(+limit));
    return new IteratorProxy(getIteratorDirect$2(this), {
      remaining: remaining
    });
  }
});

var $$1O = _export;
var anObject$k = anObject$1h;
var iterate$n = iterate$H;
var getIteratorDirect$1 = getIteratorDirect$o;

var push$b = [].push;

// `Iterator.prototype.toArray` method
// https://github.com/tc39/proposal-iterator-helpers
$$1O({ target: 'Iterator', proto: true, real: true }, {
  toArray: function toArray() {
    var result = [];
    iterate$n(getIteratorDirect$1(anObject$k(this)), push$b, { that: result, IS_RECORD: true });
    return result;
  }
});

var $$1N = _export;
var anObject$j = anObject$1h;
var AsyncFromSyncIterator = asyncFromSyncIterator;
var WrapAsyncIterator = asyncIteratorWrap;
var getIteratorDirect = getIteratorDirect$o;
var IS_PURE$1 = isPure;

// `Iterator.prototype.toAsync` method
// https://github.com/tc39/proposal-async-iterator-helpers
$$1N({ target: 'Iterator', proto: true, real: true, forced: IS_PURE$1 }, {
  toAsync: function toAsync() {
    return new WrapAsyncIterator(getIteratorDirect(new AsyncFromSyncIterator(getIteratorDirect(anObject$j(this)))));
  }
});

/* eslint-disable es/no-json -- safe */
var fails$9 = fails$1z;

var nativeRawJson = !fails$9(function () {
  var unsafeInt = '9007199254740993';
  var raw = JSON.rawJSON(unsafeInt);
  return !JSON.isRawJSON(raw) || JSON.stringify(raw) !== unsafeInt;
});

var isObject$6 = isObject$N;
var getInternalState$4 = internalState.get;

var isRawJson = function isRawJSON(O) {
  if (!isObject$6(O)) return false;
  var state = getInternalState$4(O);
  return !!state && state.type === 'RawJSON';
};

var $$1M = _export;
var NATIVE_RAW_JSON$1 = nativeRawJson;
var isRawJSON$1 = isRawJson;

// `JSON.parse` method
// https://tc39.es/proposal-json-parse-with-source/#sec-json.israwjson
// https://github.com/tc39/proposal-json-parse-with-source
$$1M({ target: 'JSON', stat: true, forced: !NATIVE_RAW_JSON$1 }, {
  isRawJSON: isRawJSON$1
});

var uncurryThis$t = functionUncurryThis;
var hasOwn$a = hasOwnProperty_1;

var $SyntaxError$2 = SyntaxError;
var $parseInt$2 = parseInt;
var fromCharCode$4 = String.fromCharCode;
var at$3 = uncurryThis$t(''.charAt);
var slice$3 = uncurryThis$t(''.slice);
var exec$9 = uncurryThis$t(/./.exec);

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

var parseJsonString = function (source, i) {
  var unterminated = true;
  var value = '';
  while (i < source.length) {
    var chr = at$3(source, i);
    if (chr === '\\') {
      var twoChars = slice$3(source, i, i + 2);
      if (hasOwn$a(codePoints, twoChars)) {
        value += codePoints[twoChars];
        i += 2;
      } else if (twoChars === '\\u') {
        i += 2;
        var fourHexDigits = slice$3(source, i, i + 4);
        if (!exec$9(IS_4_HEX_DIGITS, fourHexDigits)) throw new $SyntaxError$2('Bad Unicode escape at: ' + i);
        value += fromCharCode$4($parseInt$2(fourHexDigits, 16));
        i += 4;
      } else throw new $SyntaxError$2('Unknown escape sequence: "' + twoChars + '"');
    } else if (chr === '"') {
      unterminated = false;
      i++;
      break;
    } else {
      if (exec$9(IS_C0_CONTROL_CODE, chr)) throw new $SyntaxError$2('Bad control character in string literal at: ' + i);
      value += chr;
      i++;
    }
  }
  if (unterminated) throw new $SyntaxError$2('Unterminated string at: ' + i);
  return { value: value, end: i };
};

var $$1L = _export;
var DESCRIPTORS$9 = descriptors;
var globalThis$r = globalThis_1;
var getBuiltIn$i = getBuiltIn$O;
var uncurryThis$s = functionUncurryThis;
var call$g = functionCall;
var isCallable$9 = isCallable$I;
var isObject$5 = isObject$N;
var isArray = isArray$b;
var hasOwn$9 = hasOwnProperty_1;
var toString$b = toString$J;
var lengthOfArrayLike$4 = lengthOfArrayLike$B;
var createProperty$2 = createProperty$b;
var fails$8 = fails$1z;
var parseJSONString$1 = parseJsonString;
var NATIVE_SYMBOL = symbolConstructorDetection;

var JSON$1 = globalThis$r.JSON;
var Number$1 = globalThis$r.Number;
var SyntaxError$3 = globalThis$r.SyntaxError;
var nativeParse = JSON$1 && JSON$1.parse;
var enumerableOwnProperties = getBuiltIn$i('Object', 'keys');
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;
var at$2 = uncurryThis$s(''.charAt);
var slice$2 = uncurryThis$s(''.slice);
var exec$8 = uncurryThis$s(/./.exec);
var push$a = uncurryThis$s([].push);

var IS_DIGIT = /^\d$/;
var IS_NON_ZERO_DIGIT = /^[1-9]$/;
var IS_NUMBER_START = /^[\d-]$/;
var IS_WHITESPACE = /^[\t\n\r ]$/;

var PRIMITIVE = 0;
var OBJECT = 1;

var $parse = function (source, reviver) {
  source = toString$b(source);
  var context = new Context(source, 0);
  var root = context.parse();
  var value = root.value;
  var endIndex = context.skip(IS_WHITESPACE, root.end);
  if (endIndex < source.length) {
    throw new SyntaxError$3('Unexpected extra character: "' + at$2(source, endIndex) + '" after the parsed data at: ' + endIndex);
  }
  return isCallable$9(reviver) ? internalize({ '': value }, '', reviver, root) : value;
};

var internalize = function (holder, name, reviver, node) {
  var val = holder[name];
  var unmodified = node && val === node.value;
  var context = unmodified && typeof node.source == 'string' ? { source: node.source } : {};
  var elementRecordsLen, keys, len, i, P;
  if (isObject$5(val)) {
    var nodeIsArray = isArray(val);
    var nodes = unmodified ? node.nodes : nodeIsArray ? [] : {};
    if (nodeIsArray) {
      elementRecordsLen = nodes.length;
      len = lengthOfArrayLike$4(val);
      for (i = 0; i < len; i++) {
        internalizeProperty(val, i, internalize(val, '' + i, reviver, i < elementRecordsLen ? nodes[i] : undefined));
      }
    } else {
      keys = enumerableOwnProperties(val);
      len = lengthOfArrayLike$4(keys);
      for (i = 0; i < len; i++) {
        P = keys[i];
        internalizeProperty(val, P, internalize(val, P, reviver, hasOwn$9(nodes, P) ? nodes[P] : undefined));
      }
    }
  }
  return call$g(reviver, holder, name, val, context);
};

var internalizeProperty = function (object, key, value) {
  if (DESCRIPTORS$9) {
    var descriptor = getOwnPropertyDescriptor$2(object, key);
    if (descriptor && !descriptor.configurable) return;
  }
  if (value === undefined) delete object[key];
  else createProperty$2(object, key, value);
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
    var chr = at$2(source, i);
    if (exec$8(IS_NUMBER_START, chr)) return fork.number();
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
    } throw new SyntaxError$3('Unexpected character: "' + chr + '" at: ' + i);
  },
  node: function (type, value, start, end, nodes) {
    return new Node(value, end, type ? null : slice$2(this.source, start, end), nodes);
  },
  object: function () {
    var source = this.source;
    var i = this.index + 1;
    var expectKeypair = false;
    var object = {};
    var nodes = {};
    while (i < source.length) {
      i = this.until(['"', '}'], i);
      if (at$2(source, i) === '}' && !expectKeypair) {
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
      createProperty$2(nodes, key, result);
      createProperty$2(object, key, result.value);
      i = this.until([',', '}'], result.end);
      var chr = at$2(source, i);
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
      if (at$2(source, i) === ']' && !expectElement) {
        i++;
        break;
      }
      var result = this.fork(i).parse();
      push$a(nodes, result);
      push$a(array, result.value);
      i = this.until([',', ']'], result.end);
      if (at$2(source, i) === ',') {
        expectElement = true;
        i++;
      } else if (at$2(source, i) === ']') {
        i++;
        break;
      }
    }
    return this.node(OBJECT, array, this.index, i, nodes);
  },
  string: function () {
    var index = this.index;
    var parsed = parseJSONString$1(this.source, this.index + 1);
    return this.node(PRIMITIVE, parsed.value, index, parsed.end);
  },
  number: function () {
    var source = this.source;
    var startIndex = this.index;
    var i = startIndex;
    if (at$2(source, i) === '-') i++;
    if (at$2(source, i) === '0') i++;
    else if (exec$8(IS_NON_ZERO_DIGIT, at$2(source, i))) i = this.skip(IS_DIGIT, i + 1);
    else throw new SyntaxError$3('Failed to parse number at: ' + i);
    if (at$2(source, i) === '.') i = this.skip(IS_DIGIT, i + 1);
    if (at$2(source, i) === 'e' || at$2(source, i) === 'E') {
      i++;
      if (at$2(source, i) === '+' || at$2(source, i) === '-') i++;
      var exponentStartIndex = i;
      i = this.skip(IS_DIGIT, i);
      if (exponentStartIndex === i) throw new SyntaxError$3("Failed to parse number's exponent value at: " + i);
    }
    return this.node(PRIMITIVE, Number$1(slice$2(source, startIndex, i)), startIndex, i);
  },
  keyword: function (value) {
    var keyword = '' + value;
    var index = this.index;
    var endIndex = index + keyword.length;
    if (slice$2(this.source, index, endIndex) !== keyword) throw new SyntaxError$3('Failed to parse value at: ' + index);
    return this.node(PRIMITIVE, value, index, endIndex);
  },
  skip: function (regex, i) {
    var source = this.source;
    for (; i < source.length; i++) if (!exec$8(regex, at$2(source, i))) break;
    return i;
  },
  until: function (array, i) {
    i = this.skip(IS_WHITESPACE, i);
    var chr = at$2(this.source, i);
    for (var j = 0; j < array.length; j++) if (array[j] === chr) return i;
    throw new SyntaxError$3('Unexpected character: "' + chr + '" at: ' + i);
  }
};

var NO_SOURCE_SUPPORT = fails$8(function () {
  var unsafeInt = '9007199254740993';
  var source;
  nativeParse(unsafeInt, function (key, value, context) {
    source = context.source;
  });
  return source !== unsafeInt;
});

var PROPER_BASE_PARSE = NATIVE_SYMBOL && !fails$8(function () {
  // Safari 9 bug
  return 1 / nativeParse('-0 \t') !== -Infinity;
});

// `JSON.parse` method
// https://tc39.es/ecma262/#sec-json.parse
// https://github.com/tc39/proposal-json-parse-with-source
$$1L({ target: 'JSON', stat: true, forced: NO_SOURCE_SUPPORT }, {
  parse: function parse(text, reviver) {
    return PROPER_BASE_PARSE && !isCallable$9(reviver) ? nativeParse(text) : $parse(text, reviver);
  }
});

var $$1K = _export;
var FREEZING$1 = freezing;
var NATIVE_RAW_JSON = nativeRawJson;
var getBuiltIn$h = getBuiltIn$O;
var call$f = functionCall;
var uncurryThis$r = functionUncurryThis;
var isCallable$8 = isCallable$I;
var isRawJSON = isRawJson;
var toString$a = toString$J;
var createProperty$1 = createProperty$b;
var parseJSONString = parseJsonString;
var getReplacerFunction = getJsonReplacerFunction;
var uid$1 = uid$7;
var setInternalState$7 = internalState.set;

var $String$1 = String;
var $SyntaxError$1 = SyntaxError;
var parse$1 = getBuiltIn$h('JSON', 'parse');
var $stringify = getBuiltIn$h('JSON', 'stringify');
var create$2 = getBuiltIn$h('Object', 'create');
var freeze$1 = getBuiltIn$h('Object', 'freeze');
var at$1 = uncurryThis$r(''.charAt);
var slice$1 = uncurryThis$r(''.slice);
var push$9 = uncurryThis$r([].push);

var MARK = uid$1();
var MARK_LENGTH = MARK.length;
var ERROR_MESSAGE = 'Unacceptable as raw JSON';

var isWhitespace = function (it) {
  return it === ' ' || it === '\t' || it === '\n' || it === '\r';
};

// `JSON.parse` method
// https://tc39.es/proposal-json-parse-with-source/#sec-json.israwjson
// https://github.com/tc39/proposal-json-parse-with-source
$$1K({ target: 'JSON', stat: true, forced: !NATIVE_RAW_JSON }, {
  rawJSON: function rawJSON(text) {
    var jsonString = toString$a(text);
    if (jsonString === '' || isWhitespace(at$1(jsonString, 0)) || isWhitespace(at$1(jsonString, jsonString.length - 1))) {
      throw new $SyntaxError$1(ERROR_MESSAGE);
    }
    var parsed = parse$1(jsonString);
    if (typeof parsed == 'object' && parsed !== null) throw new $SyntaxError$1(ERROR_MESSAGE);
    var obj = create$2(null);
    setInternalState$7(obj, { type: 'RawJSON' });
    createProperty$1(obj, 'rawJSON', jsonString);
    return FREEZING$1 ? freeze$1(obj) : obj;
  }
});

// `JSON.stringify` method
// https://tc39.es/ecma262/#sec-json.stringify
// https://github.com/tc39/proposal-json-parse-with-source
if ($stringify) $$1K({ target: 'JSON', stat: true, arity: 3, forced: !NATIVE_RAW_JSON }, {
  stringify: function stringify(text, replacer, space) {
    var replacerFunction = getReplacerFunction(replacer);
    var rawStrings = [];

    var json = $stringify(text, function (key, value) {
      // some old implementations (like WebKit) could pass numbers as keys
      var v = isCallable$8(replacerFunction) ? call$f(replacerFunction, this, $String$1(key), value) : value;
      return isRawJSON(v) ? MARK + (push$9(rawStrings, v.rawJSON) - 1) : v;
    }, space);

    if (typeof json != 'string') return json;

    var result = '';
    var length = json.length;

    for (var i = 0; i < length; i++) {
      var chr = at$1(json, i);
      if (chr === '"') {
        var end = parseJSONString(json, ++i).end - 1;
        var string = slice$1(json, i, end);
        result += slice$1(string, 0, MARK_LENGTH) === MARK
          ? rawStrings[slice$1(string, MARK_LENGTH)]
          : '"' + string + '"';
        i = end;
      } else result += chr;
    }

    return result;
  }
});

var has$5 = mapHelpers.has;

// Perform ? RequireInternalSlot(M, [[MapData]])
var aMap$e = function (it) {
  has$5(it);
  return it;
};

var $$1J = _export;
var aMap$d = aMap$e;
var remove$3 = mapHelpers.remove;

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$1J({ target: 'Map', proto: true, real: true, forced: true }, {
  deleteAll: function deleteAll(/* ...elements */) {
    var collection = aMap$d(this);
    var allDeleted = true;
    var wasDeleted;
    for (var k = 0, len = arguments.length; k < len; k++) {
      wasDeleted = remove$3(collection, arguments[k]);
      allDeleted = allDeleted && wasDeleted;
    } return !!allDeleted;
  }
});

var $$1I = _export;
var aMap$c = aMap$e;
var MapHelpers$7 = mapHelpers;

var get$2 = MapHelpers$7.get;
var has$4 = MapHelpers$7.has;
var set$6 = MapHelpers$7.set;

// `Map.prototype.emplace` method
// https://github.com/tc39/proposal-upsert
$$1I({ target: 'Map', proto: true, real: true, forced: true }, {
  emplace: function emplace(key, handler) {
    var map = aMap$c(this);
    var value, inserted;
    if (has$4(map, key)) {
      value = get$2(map, key);
      if ('update' in handler) {
        value = handler.update(value, key, map);
        set$6(map, key, value);
      } return value;
    }
    inserted = handler.insert(key, map);
    set$6(map, key, inserted);
    return inserted;
  }
});

var $$1H = _export;
var bind$e = functionBindContext;
var aMap$b = aMap$e;
var iterate$m = mapIterate;

// `Map.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
$$1H({ target: 'Map', proto: true, real: true, forced: true }, {
  every: function every(callbackfn /* , thisArg */) {
    var map = aMap$b(this);
    var boundFunction = bind$e(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate$m(map, function (value, key) {
      if (!boundFunction(value, key, map)) return false;
    }, true) !== false;
  }
});

var $$1G = _export;
var bind$d = functionBindContext;
var aMap$a = aMap$e;
var MapHelpers$6 = mapHelpers;
var iterate$l = mapIterate;

var Map$6 = MapHelpers$6.Map;
var set$5 = MapHelpers$6.set;

// `Map.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$$1G({ target: 'Map', proto: true, real: true, forced: true }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var map = aMap$a(this);
    var boundFunction = bind$d(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map$6();
    iterate$l(map, function (value, key) {
      if (boundFunction(value, key, map)) set$5(newMap, key, value);
    });
    return newMap;
  }
});

var $$1F = _export;
var bind$c = functionBindContext;
var aMap$9 = aMap$e;
var iterate$k = mapIterate;

// `Map.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$$1F({ target: 'Map', proto: true, real: true, forced: true }, {
  find: function find(callbackfn /* , thisArg */) {
    var map = aMap$9(this);
    var boundFunction = bind$c(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var result = iterate$k(map, function (value, key) {
      if (boundFunction(value, key, map)) return { value: value };
    }, true);
    return result && result.value;
  }
});

var $$1E = _export;
var bind$b = functionBindContext;
var aMap$8 = aMap$e;
var iterate$j = mapIterate;

// `Map.prototype.findKey` method
// https://github.com/tc39/proposal-collection-methods
$$1E({ target: 'Map', proto: true, real: true, forced: true }, {
  findKey: function findKey(callbackfn /* , thisArg */) {
    var map = aMap$8(this);
    var boundFunction = bind$b(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var result = iterate$j(map, function (value, key) {
      if (boundFunction(value, key, map)) return { key: key };
    }, true);
    return result && result.key;
  }
});

// https://tc39.github.io/proposal-setmap-offrom/
var bind$a = functionBindContext;
var anObject$i = anObject$1h;
var toObject$2 = toObject$E;
var iterate$i = iterate$H;

var collectionFrom = function (C, adder, ENTRY) {
  return function from(source /* , mapFn, thisArg */) {
    var O = toObject$2(source);
    var length = arguments.length;
    var mapFn = length > 1 ? arguments[1] : undefined;
    var mapping = mapFn !== undefined;
    var boundFunction = mapping ? bind$a(mapFn, length > 2 ? arguments[2] : undefined) : undefined;
    var result = new C();
    var n = 0;
    iterate$i(O, function (nextItem) {
      var entry = mapping ? boundFunction(nextItem, n++) : nextItem;
      if (ENTRY) adder(result, anObject$i(entry)[0], entry[1]);
      else adder(result, entry);
    });
    return result;
  };
};

var $$1D = _export;
var MapHelpers$5 = mapHelpers;
var createCollectionFrom$3 = collectionFrom;

// `Map.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
$$1D({ target: 'Map', stat: true, forced: true }, {
  from: createCollectionFrom$3(MapHelpers$5.Map, MapHelpers$5.set, true)
});

// `SameValueZero` abstract operation
// https://tc39.es/ecma262/#sec-samevaluezero
var sameValueZero$1 = function (x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y || x !== x && y !== y;
};

var $$1C = _export;
var sameValueZero = sameValueZero$1;
var aMap$7 = aMap$e;
var iterate$h = mapIterate;

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
$$1C({ target: 'Map', proto: true, real: true, forced: true }, {
  includes: function includes(searchElement) {
    return iterate$h(aMap$7(this), function (value) {
      if (sameValueZero(value, searchElement)) return true;
    }, true) === true;
  }
});

var $$1B = _export;
var call$e = functionCall;
var iterate$g = iterate$H;
var isCallable$7 = isCallable$I;
var aCallable$7 = aCallable$N;
var Map$5 = mapHelpers.Map;

// `Map.keyBy` method
// https://github.com/tc39/proposal-collection-methods
$$1B({ target: 'Map', stat: true, forced: true }, {
  keyBy: function keyBy(iterable, keyDerivative) {
    var C = isCallable$7(this) ? this : Map$5;
    var newMap = new C();
    aCallable$7(keyDerivative);
    var setter = aCallable$7(newMap.set);
    iterate$g(iterable, function (element) {
      call$e(setter, newMap, keyDerivative(element), element);
    });
    return newMap;
  }
});

var $$1A = _export;
var aMap$6 = aMap$e;
var iterate$f = mapIterate;

// `Map.prototype.keyOf` method
// https://github.com/tc39/proposal-collection-methods
$$1A({ target: 'Map', proto: true, real: true, forced: true }, {
  keyOf: function keyOf(searchElement) {
    var result = iterate$f(aMap$6(this), function (value, key) {
      if (value === searchElement) return { key: key };
    }, true);
    return result && result.key;
  }
});

var $$1z = _export;
var bind$9 = functionBindContext;
var aMap$5 = aMap$e;
var MapHelpers$4 = mapHelpers;
var iterate$e = mapIterate;

var Map$4 = MapHelpers$4.Map;
var set$4 = MapHelpers$4.set;

// `Map.prototype.mapKeys` method
// https://github.com/tc39/proposal-collection-methods
$$1z({ target: 'Map', proto: true, real: true, forced: true }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = aMap$5(this);
    var boundFunction = bind$9(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map$4();
    iterate$e(map, function (value, key) {
      set$4(newMap, boundFunction(value, key, map), value);
    });
    return newMap;
  }
});

var $$1y = _export;
var bind$8 = functionBindContext;
var aMap$4 = aMap$e;
var MapHelpers$3 = mapHelpers;
var iterate$d = mapIterate;

var Map$3 = MapHelpers$3.Map;
var set$3 = MapHelpers$3.set;

// `Map.prototype.mapValues` method
// https://github.com/tc39/proposal-collection-methods
$$1y({ target: 'Map', proto: true, real: true, forced: true }, {
  mapValues: function mapValues(callbackfn /* , thisArg */) {
    var map = aMap$4(this);
    var boundFunction = bind$8(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map$3();
    iterate$d(map, function (value, key) {
      set$3(newMap, key, boundFunction(value, key, map));
    });
    return newMap;
  }
});

var $$1x = _export;
var aMap$3 = aMap$e;
var iterate$c = iterate$H;
var set$2 = mapHelpers.set;

// `Map.prototype.merge` method
// https://github.com/tc39/proposal-collection-methods
$$1x({ target: 'Map', proto: true, real: true, arity: 1, forced: true }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  merge: function merge(iterable /* ...iterables */) {
    var map = aMap$3(this);
    var argumentsLength = arguments.length;
    var i = 0;
    while (i < argumentsLength) {
      iterate$c(arguments[i++], function (key, value) {
        set$2(map, key, value);
      }, { AS_ENTRIES: true });
    }
    return map;
  }
});

var anObject$h = anObject$1h;

// https://tc39.github.io/proposal-setmap-offrom/
var collectionOf = function (C, adder, ENTRY) {
  return function of() {
    var result = new C();
    var length = arguments.length;
    for (var index = 0; index < length; index++) {
      var entry = arguments[index];
      if (ENTRY) adder(result, anObject$h(entry)[0], entry[1]);
      else adder(result, entry);
    } return result;
  };
};

var $$1w = _export;
var MapHelpers$2 = mapHelpers;
var createCollectionOf$3 = collectionOf;

// `Map.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
$$1w({ target: 'Map', stat: true, forced: true }, {
  of: createCollectionOf$3(MapHelpers$2.Map, MapHelpers$2.set, true)
});

var $$1v = _export;
var aCallable$6 = aCallable$N;
var aMap$2 = aMap$e;
var iterate$b = mapIterate;

var $TypeError$d = TypeError;

// `Map.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$$1v({ target: 'Map', proto: true, real: true, forced: true }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var map = aMap$2(this);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aCallable$6(callbackfn);
    iterate$b(map, function (value, key) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, key, map);
      }
    });
    if (noInitial) throw new $TypeError$d('Reduce of empty map with no initial value');
    return accumulator;
  }
});

var $$1u = _export;
var bind$7 = functionBindContext;
var aMap$1 = aMap$e;
var iterate$a = mapIterate;

// `Map.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
$$1u({ target: 'Map', proto: true, real: true, forced: true }, {
  some: function some(callbackfn /* , thisArg */) {
    var map = aMap$1(this);
    var boundFunction = bind$7(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate$a(map, function (value, key) {
      if (boundFunction(value, key, map)) return true;
    }, true) === true;
  }
});

var $$1t = _export;
var aCallable$5 = aCallable$N;
var aMap = aMap$e;
var MapHelpers$1 = mapHelpers;

var $TypeError$c = TypeError;
var get$1 = MapHelpers$1.get;
var has$3 = MapHelpers$1.has;
var set$1 = MapHelpers$1.set;

// `Map.prototype.update` method
// https://github.com/tc39/proposal-collection-methods
$$1t({ target: 'Map', proto: true, real: true, forced: true }, {
  update: function update(key, callback /* , thunk */) {
    var map = aMap(this);
    var length = arguments.length;
    aCallable$5(callback);
    var isPresentInMap = has$3(map, key);
    if (!isPresentInMap && length < 3) {
      throw new $TypeError$c('Updating absent value');
    }
    var value = isPresentInMap ? get$1(map, key) : aCallable$5(length > 2 ? arguments[2] : undefined)(key, map);
    set$1(map, key, callback(value, key, map));
    return map;
  }
});

var call$d = functionCall;
var aCallable$4 = aCallable$N;
var isCallable$6 = isCallable$I;
var anObject$g = anObject$1h;

var $TypeError$b = TypeError;

// `Map.prototype.upsert` method
// https://github.com/tc39/proposal-upsert
var mapUpsert = function upsert(key, updateFn /* , insertFn */) {
  var map = anObject$g(this);
  var get = aCallable$4(map.get);
  var has = aCallable$4(map.has);
  var set = aCallable$4(map.set);
  var insertFn = arguments.length > 2 ? arguments[2] : undefined;
  var value;
  if (!isCallable$6(updateFn) && !isCallable$6(insertFn)) {
    throw new $TypeError$b('At least one callback required');
  }
  if (call$d(has, map, key)) {
    value = call$d(get, map, key);
    if (isCallable$6(updateFn)) {
      value = updateFn(value);
      call$d(set, map, key, value);
    }
  } else if (isCallable$6(insertFn)) {
    value = insertFn();
    call$d(set, map, key, value);
  } return value;
};

// TODO: remove from `core-js@4`
var $$1s = _export;
var upsert$2 = mapUpsert;

// `Map.prototype.updateOrInsert` method (replaced by `Map.prototype.emplace`)
// https://github.com/thumbsupep/proposal-upsert
$$1s({ target: 'Map', proto: true, real: true, name: 'upsert', forced: true }, {
  updateOrInsert: upsert$2
});

// TODO: remove from `core-js@4`
var $$1r = _export;
var upsert$1 = mapUpsert;

// `Map.prototype.upsert` method (replaced by `Map.prototype.emplace`)
// https://github.com/thumbsupep/proposal-upsert
$$1r({ target: 'Map', proto: true, real: true, forced: true }, {
  upsert: upsert$1
});

var $$1q = _export;

var min$3 = Math.min;
var max$1 = Math.max;

// `Math.clamp` method
// https://rwaldron.github.io/proposal-math-extensions/
$$1q({ target: 'Math', stat: true, forced: true }, {
  clamp: function clamp(x, lower, upper) {
    return min$3(upper, max$1(lower, x));
  }
});

var $$1p = _export;

// `Math.DEG_PER_RAD` constant
// https://rwaldron.github.io/proposal-math-extensions/
$$1p({ target: 'Math', stat: true, nonConfigurable: true, nonWritable: true }, {
  DEG_PER_RAD: Math.PI / 180
});

var $$1o = _export;

var RAD_PER_DEG = 180 / Math.PI;

// `Math.degrees` method
// https://rwaldron.github.io/proposal-math-extensions/
$$1o({ target: 'Math', stat: true, forced: true }, {
  degrees: function degrees(radians) {
    return radians * RAD_PER_DEG;
  }
});

// `Math.scale` method implementation
// https://rwaldron.github.io/proposal-math-extensions/
var mathScale = Math.scale || function scale(x, inLow, inHigh, outLow, outHigh) {
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

var $$1n = _export;

var scale$1 = mathScale;
var fround = mathFround;

// `Math.fscale` method
// https://rwaldron.github.io/proposal-math-extensions/
$$1n({ target: 'Math', stat: true, forced: true }, {
  fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
    return fround(scale$1(x, inLow, inHigh, outLow, outHigh));
  }
});

var $$1m = _export;
var f16round = mathF16round;

// `Math.f16round` method
// https://github.com/tc39/proposal-float16array
$$1m({ target: 'Math', stat: true }, { f16round: f16round });

var $$1l = _export;

// `Math.iaddh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$1l({ target: 'Math', stat: true, forced: true }, {
  iaddh: function iaddh(x0, x1, y0, y1) {
    var $x0 = x0 >>> 0;
    var $x1 = x1 >>> 0;
    var $y0 = y0 >>> 0;
    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
  }
});

var $$1k = _export;

// `Math.imulh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$1k({ target: 'Math', stat: true, forced: true }, {
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

var $$1j = _export;

// `Math.isubh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$1j({ target: 'Math', stat: true, forced: true }, {
  isubh: function isubh(x0, x1, y0, y1) {
    var $x0 = x0 >>> 0;
    var $x1 = x1 >>> 0;
    var $y0 = y0 >>> 0;
    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
  }
});

var $$1i = _export;

// `Math.RAD_PER_DEG` constant
// https://rwaldron.github.io/proposal-math-extensions/
$$1i({ target: 'Math', stat: true, nonConfigurable: true, nonWritable: true }, {
  RAD_PER_DEG: 180 / Math.PI
});

var $$1h = _export;

var DEG_PER_RAD = Math.PI / 180;

// `Math.radians` method
// https://rwaldron.github.io/proposal-math-extensions/
$$1h({ target: 'Math', stat: true, forced: true }, {
  radians: function radians(degrees) {
    return degrees * DEG_PER_RAD;
  }
});

var $$1g = _export;
var scale = mathScale;

// `Math.scale` method
// https://rwaldron.github.io/proposal-math-extensions/
$$1g({ target: 'Math', stat: true, forced: true }, {
  scale: scale
});

var $$1f = _export;
var anObject$f = anObject$1h;
var numberIsFinite = numberIsFinite$2;
var createIteratorConstructor$3 = iteratorCreateConstructor;
var createIterResultObject$3 = createIterResultObject$h;
var InternalStateModule$6 = internalState;

var SEEDED_RANDOM = 'Seeded Random';
var SEEDED_RANDOM_GENERATOR = SEEDED_RANDOM + ' Generator';
var SEED_TYPE_ERROR = 'Math.seededPRNG() argument should have a "seed" field with a finite value.';
var setInternalState$6 = InternalStateModule$6.set;
var getInternalState$3 = InternalStateModule$6.getterFor(SEEDED_RANDOM_GENERATOR);
var $TypeError$a = TypeError;

var $SeededRandomGenerator = createIteratorConstructor$3(function SeededRandomGenerator(seed) {
  setInternalState$6(this, {
    type: SEEDED_RANDOM_GENERATOR,
    seed: seed % 2147483647
  });
}, SEEDED_RANDOM, function next() {
  var state = getInternalState$3(this);
  var seed = state.seed = (state.seed * 1103515245 + 12345) % 2147483647;
  return createIterResultObject$3((seed & 1073741823) / 1073741823, false);
});

// `Math.seededPRNG` method
// https://github.com/tc39/proposal-seeded-random
// based on https://github.com/tc39/proposal-seeded-random/blob/78b8258835b57fc2100d076151ab506bc3202ae6/demo.html
$$1f({ target: 'Math', stat: true, forced: true }, {
  seededPRNG: function seededPRNG(it) {
    var seed = anObject$f(it).seed;
    if (!numberIsFinite(seed)) throw new $TypeError$a(SEED_TYPE_ERROR);
    return new $SeededRandomGenerator(seed);
  }
});

var $$1e = _export;

// `Math.signbit` method
// https://github.com/tc39/proposal-Math.signbit
$$1e({ target: 'Math', stat: true, forced: true }, {
  signbit: function signbit(x) {
    var n = +x;
    // eslint-disable-next-line no-self-compare -- NaN check
    return n === n && n === 0 ? 1 / n === -Infinity : n < 0;
  }
});

// based on Shewchuk's algorithm for exactly floating point addition
// adapted from https://github.com/tc39/proposal-math-sum/blob/3513d58323a1ae25560e8700aa5294500c6c9287/polyfill/polyfill.mjs
var $$1d = _export;
var uncurryThis$q = functionUncurryThis;
var iterate$9 = iterate$H;

var $RangeError$2 = RangeError;
var $TypeError$9 = TypeError;
var $Infinity = Infinity;
var $NaN = NaN;
var abs = Math.abs;
var pow$2 = Math.pow;
var push$8 = uncurryThis$q([].push);

var POW_2_1023 = pow$2(2, 1023);
var MAX_SAFE_INTEGER = pow$2(2, 53) - 1; // 2 ** 53 - 1 === 9007199254740992
var MAX_DOUBLE = Number.MAX_VALUE; // 2 ** 1024 - 2 ** (1023 - 52) === 1.79769313486231570815e+308
var MAX_ULP = pow$2(2, 971); // 2 ** (1023 - 52) === 1.99584030953471981166e+292

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
$$1d({ target: 'Math', stat: true, forced: true }, {
  // eslint-disable-next-line max-statements -- ok
  sumPrecise: function sumPrecise(items) {
    var numbers = [];
    var count = 0;
    var state = MINUS_ZERO;

    iterate$9(items, function (n) {
      if (++count >= MAX_SAFE_INTEGER) throw new $RangeError$2('Maximum allowed index exceeded');
      if (typeof n != 'number') throw new $TypeError$9('Value is not a number');
      if (state !== NOT_A_NUMBER) {
        // eslint-disable-next-line no-self-compare -- NaN check
        if (n !== n) state = NOT_A_NUMBER;
        else if (n === $Infinity) state = state === MINUS_INFINITY ? NOT_A_NUMBER : PLUS_INFINITY;
        else if (n === -$Infinity) state = state === PLUS_INFINITY ? NOT_A_NUMBER : MINUS_INFINITY;
        else if ((n !== 0 || (1 / n) === $Infinity) && (state === MINUS_ZERO || state === FINITE)) {
          state = FINITE;
          push$8(numbers, n);
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
      if (x !== 0) push$8(partials, x);
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

var $$1c = _export;

// `Math.umulh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$1c({ target: 'Math', stat: true, forced: true }, {
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

var $$1b = _export;
var uncurryThis$p = functionUncurryThis;
var toIntegerOrInfinity$2 = toIntegerOrInfinity$p;

var INVALID_NUMBER_REPRESENTATION = 'Invalid number representation';
var INVALID_RADIX = 'Invalid radix';
var $RangeError$1 = RangeError;
var $SyntaxError = SyntaxError;
var $TypeError$8 = TypeError;
var $parseInt$1 = parseInt;
var pow$1 = Math.pow;
var valid = /^[\d.a-z]+$/;
var charAt$a = uncurryThis$p(''.charAt);
var exec$7 = uncurryThis$p(valid.exec);
var numberToString$3 = uncurryThis$p(1.0.toString);
var stringSlice$5 = uncurryThis$p(''.slice);
var split$4 = uncurryThis$p(''.split);

// `Number.fromString` method
// https://github.com/tc39/proposal-number-fromstring
$$1b({ target: 'Number', stat: true, forced: true }, {
  fromString: function fromString(string, radix) {
    var sign = 1;
    if (typeof string != 'string') throw new $TypeError$8(INVALID_NUMBER_REPRESENTATION);
    if (!string.length) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
    if (charAt$a(string, 0) === '-') {
      sign = -1;
      string = stringSlice$5(string, 1);
      if (!string.length) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
    }
    var R = radix === undefined ? 10 : toIntegerOrInfinity$2(radix);
    if (R < 2 || R > 36) throw new $RangeError$1(INVALID_RADIX);
    if (!exec$7(valid, string)) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
    var parts = split$4(string, '.');
    var mathNum = $parseInt$1(parts[0], R);
    if (parts.length > 1) mathNum += $parseInt$1(parts[1], R) / pow$1(R, parts[1].length);
    if (R === 10 && numberToString$3(mathNum, R) !== string) throw new $SyntaxError(INVALID_NUMBER_REPRESENTATION);
    return sign * mathNum;
  }
});

var $$1a = _export;
var NumericRangeIterator = numericRangeIterator;

// `Number.range` method
// https://github.com/tc39/proposal-Number.range
// TODO: Remove from `core-js@4`
$$1a({ target: 'Number', stat: true, forced: true }, {
  range: function range(start, end, option) {
    return new NumericRangeIterator(start, end, option, 'number', 0, 1);
  }
});

var InternalStateModule$5 = internalState;
var createIteratorConstructor$2 = iteratorCreateConstructor;
var createIterResultObject$2 = createIterResultObject$h;
var hasOwn$8 = hasOwnProperty_1;
var objectKeys$1 = objectKeys$6;
var toObject$1 = toObject$E;

var OBJECT_ITERATOR = 'Object Iterator';
var setInternalState$5 = InternalStateModule$5.set;
var getInternalState$2 = InternalStateModule$5.getterFor(OBJECT_ITERATOR);

var objectIterator = createIteratorConstructor$2(function ObjectIterator(source, mode) {
  var object = toObject$1(source);
  setInternalState$5(this, {
    type: OBJECT_ITERATOR,
    mode: mode,
    object: object,
    keys: objectKeys$1(object),
    index: 0
  });
}, 'Object', function next() {
  var state = getInternalState$2(this);
  var keys = state.keys;
  while (true) {
    if (keys === null || state.index >= keys.length) {
      state.object = state.keys = null;
      return createIterResultObject$2(undefined, true);
    }
    var key = keys[state.index++];
    var object = state.object;
    if (!hasOwn$8(object, key)) continue;
    switch (state.mode) {
      case 'keys': return createIterResultObject$2(key, false);
      case 'values': return createIterResultObject$2(object[key], false);
    } /* entries */ return createIterResultObject$2([key, object[key]], false);
  }
});

// TODO: Remove from `core-js@4`
var $$19 = _export;
var ObjectIterator$2 = objectIterator;

// `Object.iterateEntries` method
// https://github.com/tc39/proposal-object-iteration
$$19({ target: 'Object', stat: true, forced: true }, {
  iterateEntries: function iterateEntries(object) {
    return new ObjectIterator$2(object, 'entries');
  }
});

// TODO: Remove from `core-js@4`
var $$18 = _export;
var ObjectIterator$1 = objectIterator;

// `Object.iterateKeys` method
// https://github.com/tc39/proposal-object-iteration
$$18({ target: 'Object', stat: true, forced: true }, {
  iterateKeys: function iterateKeys(object) {
    return new ObjectIterator$1(object, 'keys');
  }
});

// TODO: Remove from `core-js@4`
var $$17 = _export;
var ObjectIterator = objectIterator;

// `Object.iterateValues` method
// https://github.com/tc39/proposal-object-iteration
$$17({ target: 'Object', stat: true, forced: true }, {
  iterateValues: function iterateValues(object) {
    return new ObjectIterator(object, 'values');
  }
});

// https://github.com/tc39/proposal-observable
var $$16 = _export;
var call$c = functionCall;
var DESCRIPTORS$8 = descriptors;
var setSpecies = setSpecies$7;
var aCallable$3 = aCallable$N;
var anObject$e = anObject$1h;
var anInstance$4 = anInstance$f;
var isCallable$5 = isCallable$I;
var isNullOrUndefined$2 = isNullOrUndefined$j;
var isObject$4 = isObject$N;
var getMethod$1 = getMethod$l;
var defineBuiltIn$5 = defineBuiltIn$u;
var defineBuiltIns$1 = defineBuiltIns$b;
var defineBuiltInAccessor$5 = defineBuiltInAccessor$p;
var hostReportErrors = hostReportErrors$2;
var wellKnownSymbol$6 = wellKnownSymbol$S;
var InternalStateModule$4 = internalState;

var $$OBSERVABLE$1 = wellKnownSymbol$6('observable');
var OBSERVABLE = 'Observable';
var SUBSCRIPTION = 'Subscription';
var SUBSCRIPTION_OBSERVER = 'SubscriptionObserver';
var getterFor$1 = InternalStateModule$4.getterFor;
var setInternalState$4 = InternalStateModule$4.set;
var getObservableInternalState = getterFor$1(OBSERVABLE);
var getSubscriptionInternalState = getterFor$1(SUBSCRIPTION);
var getSubscriptionObserverInternalState = getterFor$1(SUBSCRIPTION_OBSERVER);

var SubscriptionState = function (observer) {
  this.observer = anObject$e(observer);
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
    if (!DESCRIPTORS$8) {
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
  var subscriptionState = setInternalState$4(this, new SubscriptionState(observer));
  var start;
  if (!DESCRIPTORS$8) this.closed = false;
  try {
    if (start = getMethod$1(observer, 'start')) call$c(start, observer, this);
  } catch (error) {
    hostReportErrors(error);
  }
  if (subscriptionState.isClosed()) return;
  var subscriptionObserver = subscriptionState.subscriptionObserver = new SubscriptionObserver(subscriptionState);
  try {
    var cleanup = subscriber(subscriptionObserver);
    var subscription = cleanup;
    if (!isNullOrUndefined$2(cleanup)) subscriptionState.cleanup = isCallable$5(cleanup.unsubscribe)
      ? function () { subscription.unsubscribe(); }
      : aCallable$3(cleanup);
  } catch (error) {
    subscriptionObserver.error(error);
    return;
  } if (subscriptionState.isClosed()) subscriptionState.clean();
};

Subscription.prototype = defineBuiltIns$1({}, {
  unsubscribe: function unsubscribe() {
    var subscriptionState = getSubscriptionInternalState(this);
    if (!subscriptionState.isClosed()) {
      subscriptionState.close();
      subscriptionState.clean();
    }
  }
});

if (DESCRIPTORS$8) defineBuiltInAccessor$5(Subscription.prototype, 'closed', {
  configurable: true,
  get: function closed() {
    return getSubscriptionInternalState(this).isClosed();
  }
});

var SubscriptionObserver = function (subscriptionState) {
  setInternalState$4(this, {
    type: SUBSCRIPTION_OBSERVER,
    subscriptionState: subscriptionState
  });
  if (!DESCRIPTORS$8) this.closed = false;
};

SubscriptionObserver.prototype = defineBuiltIns$1({}, {
  next: function next(value) {
    var subscriptionState = getSubscriptionObserverInternalState(this).subscriptionState;
    if (!subscriptionState.isClosed()) {
      var observer = subscriptionState.observer;
      try {
        var nextMethod = getMethod$1(observer, 'next');
        if (nextMethod) call$c(nextMethod, observer, value);
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
        var errorMethod = getMethod$1(observer, 'error');
        if (errorMethod) call$c(errorMethod, observer, value);
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
        var completeMethod = getMethod$1(observer, 'complete');
        if (completeMethod) call$c(completeMethod, observer);
      } catch (error) {
        hostReportErrors(error);
      } subscriptionState.clean();
    }
  }
});

if (DESCRIPTORS$8) defineBuiltInAccessor$5(SubscriptionObserver.prototype, 'closed', {
  configurable: true,
  get: function closed() {
    return getSubscriptionObserverInternalState(this).subscriptionState.isClosed();
  }
});

var $Observable = function Observable(subscriber) {
  anInstance$4(this, ObservablePrototype);
  setInternalState$4(this, {
    type: OBSERVABLE,
    subscriber: aCallable$3(subscriber)
  });
};

var ObservablePrototype = $Observable.prototype;

defineBuiltIns$1(ObservablePrototype, {
  subscribe: function subscribe(observer) {
    var length = arguments.length;
    return new Subscription(isCallable$5(observer) ? {
      next: observer,
      error: length > 1 ? arguments[1] : undefined,
      complete: length > 2 ? arguments[2] : undefined
    } : isObject$4(observer) ? observer : {}, getObservableInternalState(this).subscriber);
  }
});

defineBuiltIn$5(ObservablePrototype, $$OBSERVABLE$1, function () { return this; });

$$16({ global: true, constructor: true, forced: true }, {
  Observable: $Observable
});

setSpecies(OBSERVABLE);

var $$15 = _export;
var getBuiltIn$g = getBuiltIn$O;
var call$b = functionCall;
var anObject$d = anObject$1h;
var isConstructor$2 = isConstructor$a;
var getIterator$1 = getIterator$7;
var getMethod = getMethod$l;
var iterate$8 = iterate$H;
var wellKnownSymbol$5 = wellKnownSymbol$S;

var $$OBSERVABLE = wellKnownSymbol$5('observable');

// `Observable.from` method
// https://github.com/tc39/proposal-observable
$$15({ target: 'Observable', stat: true, forced: true }, {
  from: function from(x) {
    var C = isConstructor$2(this) ? this : getBuiltIn$g('Observable');
    var observableMethod = getMethod(anObject$d(x), $$OBSERVABLE);
    if (observableMethod) {
      var observable = anObject$d(call$b(observableMethod, x));
      return observable.constructor === C ? observable : new C(function (observer) {
        return observable.subscribe(observer);
      });
    }
    var iterator = getIterator$1(x);
    return new C(function (observer) {
      iterate$8(iterator, function (it, stop) {
        observer.next(it);
        if (observer.closed) return stop();
      }, { IS_ITERATOR: true, INTERRUPTED: true });
      observer.complete();
    });
  }
});

var $$14 = _export;
var getBuiltIn$f = getBuiltIn$O;
var isConstructor$1 = isConstructor$a;

var Array$2 = getBuiltIn$f('Array');

// `Observable.of` method
// https://github.com/tc39/proposal-observable
$$14({ target: 'Observable', stat: true, forced: true }, {
  of: function of() {
    var C = isConstructor$1(this) ? this : getBuiltIn$f('Observable');
    var length = arguments.length;
    var items = Array$2(length);
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

var $$13 = _export;
var globalThis$q = globalThis_1;
var apply$2 = functionApply$1;
var slice = arraySlice$a;
var newPromiseCapabilityModule = newPromiseCapability$2;
var aCallable$2 = aCallable$N;
var perform = perform$7;

var Promise$1 = globalThis$q.Promise;

var ACCEPT_ARGUMENTS = false;
// Avoiding the use of polyfills of the previous iteration of this proposal
// that does not accept arguments of the callback
var FORCED$2 = !Promise$1 || !Promise$1['try'] || perform(function () {
  Promise$1['try'](function (argument) {
    ACCEPT_ARGUMENTS = argument === 8;
  }, 8);
}).error || !ACCEPT_ARGUMENTS;

// `Promise.try` method
// https://github.com/tc39/proposal-promise-try
$$13({ target: 'Promise', stat: true, forced: FORCED$2 }, {
  'try': function (callbackfn /* , ...args */) {
    var args = arguments.length > 1 ? slice(arguments, 1) : [];
    var promiseCapability = newPromiseCapabilityModule.f(this);
    var result = perform(function () {
      return apply$2(aCallable$2(callbackfn), undefined, args);
    });
    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
    return promiseCapability.promise;
  }
});

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`


var getBuiltIn$e = getBuiltIn$O;
var uncurryThis$o = functionUncurryThis;
var shared$1 = shared$a;

var Map$2 = getBuiltIn$e('Map');
var WeakMap$1 = getBuiltIn$e('WeakMap');
var push$7 = uncurryThis$o([].push);

var metadata = shared$1('metadata');
var store$1 = metadata.store || (metadata.store = new WeakMap$1());

var getOrCreateMetadataMap$1 = function (target, targetKey, create) {
  var targetMetadata = store$1.get(target);
  if (!targetMetadata) {
    if (!create) return;
    store$1.set(target, targetMetadata = new Map$2());
  }
  var keyMetadata = targetMetadata.get(targetKey);
  if (!keyMetadata) {
    if (!create) return;
    targetMetadata.set(targetKey, keyMetadata = new Map$2());
  } return keyMetadata;
};

var ordinaryHasOwnMetadata$3 = function (MetadataKey, O, P) {
  var metadataMap = getOrCreateMetadataMap$1(O, P, false);
  return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
};

var ordinaryGetOwnMetadata$2 = function (MetadataKey, O, P) {
  var metadataMap = getOrCreateMetadataMap$1(O, P, false);
  return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
};

var ordinaryDefineOwnMetadata$2 = function (MetadataKey, MetadataValue, O, P) {
  getOrCreateMetadataMap$1(O, P, true).set(MetadataKey, MetadataValue);
};

var ordinaryOwnMetadataKeys$2 = function (target, targetKey) {
  var metadataMap = getOrCreateMetadataMap$1(target, targetKey, false);
  var keys = [];
  if (metadataMap) metadataMap.forEach(function (_, key) { push$7(keys, key); });
  return keys;
};

var toMetadataKey$9 = function (it) {
  return it === undefined || typeof it == 'symbol' ? it : String(it);
};

var reflectMetadata = {
  store: store$1,
  getMap: getOrCreateMetadataMap$1,
  has: ordinaryHasOwnMetadata$3,
  get: ordinaryGetOwnMetadata$2,
  set: ordinaryDefineOwnMetadata$2,
  keys: ordinaryOwnMetadataKeys$2,
  toKey: toMetadataKey$9
};

// TODO: Remove from `core-js@4`
var $$12 = _export;
var ReflectMetadataModule$8 = reflectMetadata;
var anObject$c = anObject$1h;

var toMetadataKey$8 = ReflectMetadataModule$8.toKey;
var ordinaryDefineOwnMetadata$1 = ReflectMetadataModule$8.set;

// `Reflect.defineMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$12({ target: 'Reflect', stat: true }, {
  defineMetadata: function defineMetadata(metadataKey, metadataValue, target /* , targetKey */) {
    var targetKey = arguments.length < 4 ? undefined : toMetadataKey$8(arguments[3]);
    ordinaryDefineOwnMetadata$1(metadataKey, metadataValue, anObject$c(target), targetKey);
  }
});

var $$11 = _export;
var ReflectMetadataModule$7 = reflectMetadata;
var anObject$b = anObject$1h;

var toMetadataKey$7 = ReflectMetadataModule$7.toKey;
var getOrCreateMetadataMap = ReflectMetadataModule$7.getMap;
var store = ReflectMetadataModule$7.store;

// `Reflect.deleteMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$11({ target: 'Reflect', stat: true }, {
  deleteMetadata: function deleteMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$7(arguments[2]);
    var metadataMap = getOrCreateMetadataMap(anObject$b(target), targetKey, false);
    if (metadataMap === undefined || !metadataMap['delete'](metadataKey)) return false;
    if (metadataMap.size) return true;
    var targetMetadata = store.get(target);
    targetMetadata['delete'](targetKey);
    return !!targetMetadata.size || store['delete'](target);
  }
});

// TODO: Remove from `core-js@4`
var $$10 = _export;
var ReflectMetadataModule$6 = reflectMetadata;
var anObject$a = anObject$1h;
var getPrototypeOf$2 = objectGetPrototypeOf$2;

var ordinaryHasOwnMetadata$2 = ReflectMetadataModule$6.has;
var ordinaryGetOwnMetadata$1 = ReflectMetadataModule$6.get;
var toMetadataKey$6 = ReflectMetadataModule$6.toKey;

var ordinaryGetMetadata = function (MetadataKey, O, P) {
  var hasOwn = ordinaryHasOwnMetadata$2(MetadataKey, O, P);
  if (hasOwn) return ordinaryGetOwnMetadata$1(MetadataKey, O, P);
  var parent = getPrototypeOf$2(O);
  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
};

// `Reflect.getMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$10({ target: 'Reflect', stat: true }, {
  getMetadata: function getMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$6(arguments[2]);
    return ordinaryGetMetadata(metadataKey, anObject$a(target), targetKey);
  }
});

// TODO: Remove from `core-js@4`
var $$$ = _export;
var uncurryThis$n = functionUncurryThis;
var ReflectMetadataModule$5 = reflectMetadata;
var anObject$9 = anObject$1h;
var getPrototypeOf$1 = objectGetPrototypeOf$2;
var $arrayUniqueBy$1 = arrayUniqueBy$2;

var arrayUniqueBy$1 = uncurryThis$n($arrayUniqueBy$1);
var concat = uncurryThis$n([].concat);
var ordinaryOwnMetadataKeys$1 = ReflectMetadataModule$5.keys;
var toMetadataKey$5 = ReflectMetadataModule$5.toKey;

var ordinaryMetadataKeys = function (O, P) {
  var oKeys = ordinaryOwnMetadataKeys$1(O, P);
  var parent = getPrototypeOf$1(O);
  if (parent === null) return oKeys;
  var pKeys = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? arrayUniqueBy$1(concat(oKeys, pKeys)) : pKeys : oKeys;
};

// `Reflect.getMetadataKeys` method
// https://github.com/rbuckton/reflect-metadata
$$$({ target: 'Reflect', stat: true }, {
  getMetadataKeys: function getMetadataKeys(target /* , targetKey */) {
    var targetKey = arguments.length < 2 ? undefined : toMetadataKey$5(arguments[1]);
    return ordinaryMetadataKeys(anObject$9(target), targetKey);
  }
});

// TODO: Remove from `core-js@4`
var $$_ = _export;
var ReflectMetadataModule$4 = reflectMetadata;
var anObject$8 = anObject$1h;

var ordinaryGetOwnMetadata = ReflectMetadataModule$4.get;
var toMetadataKey$4 = ReflectMetadataModule$4.toKey;

// `Reflect.getOwnMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$_({ target: 'Reflect', stat: true }, {
  getOwnMetadata: function getOwnMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$4(arguments[2]);
    return ordinaryGetOwnMetadata(metadataKey, anObject$8(target), targetKey);
  }
});

// TODO: Remove from `core-js@4`
var $$Z = _export;
var ReflectMetadataModule$3 = reflectMetadata;
var anObject$7 = anObject$1h;

var ordinaryOwnMetadataKeys = ReflectMetadataModule$3.keys;
var toMetadataKey$3 = ReflectMetadataModule$3.toKey;

// `Reflect.getOwnMetadataKeys` method
// https://github.com/rbuckton/reflect-metadata
$$Z({ target: 'Reflect', stat: true }, {
  getOwnMetadataKeys: function getOwnMetadataKeys(target /* , targetKey */) {
    var targetKey = arguments.length < 2 ? undefined : toMetadataKey$3(arguments[1]);
    return ordinaryOwnMetadataKeys(anObject$7(target), targetKey);
  }
});

// TODO: Remove from `core-js@4`
var $$Y = _export;
var ReflectMetadataModule$2 = reflectMetadata;
var anObject$6 = anObject$1h;
var getPrototypeOf = objectGetPrototypeOf$2;

var ordinaryHasOwnMetadata$1 = ReflectMetadataModule$2.has;
var toMetadataKey$2 = ReflectMetadataModule$2.toKey;

var ordinaryHasMetadata = function (MetadataKey, O, P) {
  var hasOwn = ordinaryHasOwnMetadata$1(MetadataKey, O, P);
  if (hasOwn) return true;
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
};

// `Reflect.hasMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$Y({ target: 'Reflect', stat: true }, {
  hasMetadata: function hasMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$2(arguments[2]);
    return ordinaryHasMetadata(metadataKey, anObject$6(target), targetKey);
  }
});

// TODO: Remove from `core-js@4`
var $$X = _export;
var ReflectMetadataModule$1 = reflectMetadata;
var anObject$5 = anObject$1h;

var ordinaryHasOwnMetadata = ReflectMetadataModule$1.has;
var toMetadataKey$1 = ReflectMetadataModule$1.toKey;

// `Reflect.hasOwnMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$X({ target: 'Reflect', stat: true }, {
  hasOwnMetadata: function hasOwnMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$1(arguments[2]);
    return ordinaryHasOwnMetadata(metadataKey, anObject$5(target), targetKey);
  }
});

var $$W = _export;
var ReflectMetadataModule = reflectMetadata;
var anObject$4 = anObject$1h;

var toMetadataKey = ReflectMetadataModule.toKey;
var ordinaryDefineOwnMetadata = ReflectMetadataModule.set;

// `Reflect.metadata` method
// https://github.com/rbuckton/reflect-metadata
$$W({ target: 'Reflect', stat: true }, {
  metadata: function metadata(metadataKey, metadataValue) {
    return function decorator(target, key) {
      ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject$4(target), toMetadataKey(key));
    };
  }
});

var $TypeError$7 = TypeError;

var aString$4 = function (argument) {
  if (typeof argument == 'string') return argument;
  throw new $TypeError$7('Argument is not a string');
};

var $$V = _export;
var uncurryThis$m = functionUncurryThis;
var aString$3 = aString$4;
var hasOwn$7 = hasOwnProperty_1;
var padStart = stringPad.start;
var WHITESPACES = whitespaces$6;

var $Array$1 = Array;
var $escape = RegExp.escape;
var charAt$9 = uncurryThis$m(''.charAt);
var charCodeAt$3 = uncurryThis$m(''.charCodeAt);
var numberToString$2 = uncurryThis$m(1.1.toString);
var join$4 = uncurryThis$m([].join);
var FIRST_DIGIT_OR_ASCII = /^[0-9a-z]/i;
var SYNTAX_SOLIDUS = /^[$()*+./?[\\\]^{|}]/;
var OTHER_PUNCTUATORS_AND_WHITESPACES = RegExp('^[!"#%&\',\\-:;<=>@`~' + WHITESPACES + ']');
var exec$6 = uncurryThis$m(FIRST_DIGIT_OR_ASCII.exec);

var ControlEscape = {
  '\u0009': 't',
  '\u000A': 'n',
  '\u000B': 'v',
  '\u000C': 'f',
  '\u000D': 'r'
};

var escapeChar = function (chr) {
  var hex = numberToString$2(charCodeAt$3(chr, 0), 16);
  return hex.length < 3 ? '\\x' + padStart(hex, 2, '0') : '\\u' + padStart(hex, 4, '0');
};

// Avoiding the use of polyfills of the previous iteration of this proposal
var FORCED$1 = !$escape || $escape('ab') !== '\\x61b';

// `RegExp.escape` method
// https://github.com/tc39/proposal-regex-escaping
$$V({ target: 'RegExp', stat: true, forced: FORCED$1 }, {
  escape: function escape(S) {
    aString$3(S);
    var length = S.length;
    var result = $Array$1(length);

    for (var i = 0; i < length; i++) {
      var chr = charAt$9(S, i);
      if (i === 0 && exec$6(FIRST_DIGIT_OR_ASCII, chr)) {
        result[i] = escapeChar(chr);
      } else if (hasOwn$7(ControlEscape, chr)) {
        result[i] = '\\' + ControlEscape[chr];
      } else if (exec$6(SYNTAX_SOLIDUS, chr)) {
        result[i] = '\\' + chr;
      } else if (exec$6(OTHER_PUNCTUATORS_AND_WHITESPACES, chr)) {
        result[i] = escapeChar(chr);
      } else {
        var charCode = charCodeAt$3(chr, 0);
        // single UTF-16 code unit
        if ((charCode & 0xF800) !== 0xD800) result[i] = chr;
        // unpaired surrogate
        else if (charCode >= 0xDC00 || i + 1 >= length || (charCodeAt$3(S, i + 1) & 0xFC00) !== 0xDC00) result[i] = escapeChar(chr);
        // surrogate pair
        else {
          result[i] = chr;
          result[++i] = charAt$9(S, i);
        }
      }
    }

    return join$4(result, '');
  }
});

var $$U = _export;
var aSet$8 = aSet$g;
var add$3 = setHelpers.add;

// `Set.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$$U({ target: 'Set', proto: true, real: true, forced: true }, {
  addAll: function addAll(/* ...elements */) {
    var set = aSet$8(this);
    for (var k = 0, len = arguments.length; k < len; k++) {
      add$3(set, arguments[k]);
    } return set;
  }
});

var $$T = _export;
var aSet$7 = aSet$g;
var remove$2 = setHelpers.remove;

// `Set.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$T({ target: 'Set', proto: true, real: true, forced: true }, {
  deleteAll: function deleteAll(/* ...elements */) {
    var collection = aSet$7(this);
    var allDeleted = true;
    var wasDeleted;
    for (var k = 0, len = arguments.length; k < len; k++) {
      wasDeleted = remove$2(collection, arguments[k]);
      allDeleted = allDeleted && wasDeleted;
    } return !!allDeleted;
  }
});

var classof$3 = classof$q;
var hasOwn$6 = hasOwnProperty_1;
var isNullOrUndefined$1 = isNullOrUndefined$j;
var wellKnownSymbol$4 = wellKnownSymbol$S;
var Iterators = iterators;

var ITERATOR$3 = wellKnownSymbol$4('iterator');
var $Object = Object;

var isIterable$1 = function (it) {
  if (isNullOrUndefined$1(it)) return false;
  var O = $Object(it);
  return O[ITERATOR$3] !== undefined
    || '@@iterator' in O
    || hasOwn$6(Iterators, classof$3(O));
};

var getBuiltIn$d = getBuiltIn$O;
var isCallable$4 = isCallable$I;
var isIterable = isIterable$1;
var isObject$3 = isObject$N;

var Set$4 = getBuiltIn$d('Set');

var isSetLike = function (it) {
  return isObject$3(it)
    && typeof it.size == 'number'
    && isCallable$4(it.has)
    && isCallable$4(it.keys);
};

// fallback old -> new set methods proposal arguments
var toSetLike$7 = function (it) {
  if (isSetLike(it)) return it;
  return isIterable(it) ? new Set$4(it) : it;
};

var $$S = _export;
var call$a = functionCall;
var toSetLike$6 = toSetLike$7;
var $difference = setDifference;

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$$S({ target: 'Set', proto: true, real: true, forced: true }, {
  difference: function difference(other) {
    return call$a($difference, this, toSetLike$6(other));
  }
});

var $$R = _export;
var bind$6 = functionBindContext;
var aSet$6 = aSet$g;
var iterate$7 = setIterate$1;

// `Set.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
$$R({ target: 'Set', proto: true, real: true, forced: true }, {
  every: function every(callbackfn /* , thisArg */) {
    var set = aSet$6(this);
    var boundFunction = bind$6(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate$7(set, function (value) {
      if (!boundFunction(value, value, set)) return false;
    }, true) !== false;
  }
});

var $$Q = _export;
var bind$5 = functionBindContext;
var aSet$5 = aSet$g;
var SetHelpers$4 = setHelpers;
var iterate$6 = setIterate$1;

var Set$3 = SetHelpers$4.Set;
var add$2 = SetHelpers$4.add;

// `Set.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$$Q({ target: 'Set', proto: true, real: true, forced: true }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var set = aSet$5(this);
    var boundFunction = bind$5(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newSet = new Set$3();
    iterate$6(set, function (value) {
      if (boundFunction(value, value, set)) add$2(newSet, value);
    });
    return newSet;
  }
});

var $$P = _export;
var bind$4 = functionBindContext;
var aSet$4 = aSet$g;
var iterate$5 = setIterate$1;

// `Set.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$$P({ target: 'Set', proto: true, real: true, forced: true }, {
  find: function find(callbackfn /* , thisArg */) {
    var set = aSet$4(this);
    var boundFunction = bind$4(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var result = iterate$5(set, function (value) {
      if (boundFunction(value, value, set)) return { value: value };
    }, true);
    return result && result.value;
  }
});

var $$O = _export;
var SetHelpers$3 = setHelpers;
var createCollectionFrom$2 = collectionFrom;

// `Set.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
$$O({ target: 'Set', stat: true, forced: true }, {
  from: createCollectionFrom$2(SetHelpers$3.Set, SetHelpers$3.add, false)
});

var $$N = _export;
var call$9 = functionCall;
var toSetLike$5 = toSetLike$7;
var $intersection = setIntersection;

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$$N({ target: 'Set', proto: true, real: true, forced: true }, {
  intersection: function intersection(other) {
    return call$9($intersection, this, toSetLike$5(other));
  }
});

var $$M = _export;
var call$8 = functionCall;
var toSetLike$4 = toSetLike$7;
var $isDisjointFrom = setIsDisjointFrom;

// `Set.prototype.isDisjointFrom` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$$M({ target: 'Set', proto: true, real: true, forced: true }, {
  isDisjointFrom: function isDisjointFrom(other) {
    return call$8($isDisjointFrom, this, toSetLike$4(other));
  }
});

var $$L = _export;
var call$7 = functionCall;
var toSetLike$3 = toSetLike$7;
var $isSubsetOf = setIsSubsetOf;

// `Set.prototype.isSubsetOf` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$$L({ target: 'Set', proto: true, real: true, forced: true }, {
  isSubsetOf: function isSubsetOf(other) {
    return call$7($isSubsetOf, this, toSetLike$3(other));
  }
});

var $$K = _export;
var call$6 = functionCall;
var toSetLike$2 = toSetLike$7;
var $isSupersetOf = setIsSupersetOf;

// `Set.prototype.isSupersetOf` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$$K({ target: 'Set', proto: true, real: true, forced: true }, {
  isSupersetOf: function isSupersetOf(other) {
    return call$6($isSupersetOf, this, toSetLike$2(other));
  }
});

var $$J = _export;
var uncurryThis$l = functionUncurryThis;
var aSet$3 = aSet$g;
var iterate$4 = setIterate$1;
var toString$9 = toString$J;

var arrayJoin = uncurryThis$l([].join);
var push$6 = uncurryThis$l([].push);

// `Set.prototype.join` method
// https://github.com/tc39/proposal-collection-methods
$$J({ target: 'Set', proto: true, real: true, forced: true }, {
  join: function join(separator) {
    var set = aSet$3(this);
    var sep = separator === undefined ? ',' : toString$9(separator);
    var array = [];
    iterate$4(set, function (value) {
      push$6(array, value);
    });
    return arrayJoin(array, sep);
  }
});

var $$I = _export;
var bind$3 = functionBindContext;
var aSet$2 = aSet$g;
var SetHelpers$2 = setHelpers;
var iterate$3 = setIterate$1;

var Set$2 = SetHelpers$2.Set;
var add$1 = SetHelpers$2.add;

// `Set.prototype.map` method
// https://github.com/tc39/proposal-collection-methods
$$I({ target: 'Set', proto: true, real: true, forced: true }, {
  map: function map(callbackfn /* , thisArg */) {
    var set = aSet$2(this);
    var boundFunction = bind$3(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newSet = new Set$2();
    iterate$3(set, function (value) {
      add$1(newSet, boundFunction(value, value, set));
    });
    return newSet;
  }
});

var $$H = _export;
var SetHelpers$1 = setHelpers;
var createCollectionOf$2 = collectionOf;

// `Set.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
$$H({ target: 'Set', stat: true, forced: true }, {
  of: createCollectionOf$2(SetHelpers$1.Set, SetHelpers$1.add, false)
});

var $$G = _export;
var aCallable$1 = aCallable$N;
var aSet$1 = aSet$g;
var iterate$2 = setIterate$1;

var $TypeError$6 = TypeError;

// `Set.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$$G({ target: 'Set', proto: true, real: true, forced: true }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var set = aSet$1(this);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aCallable$1(callbackfn);
    iterate$2(set, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, value, set);
      }
    });
    if (noInitial) throw new $TypeError$6('Reduce of empty set with no initial value');
    return accumulator;
  }
});

var $$F = _export;
var bind$2 = functionBindContext;
var aSet = aSet$g;
var iterate$1 = setIterate$1;

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
$$F({ target: 'Set', proto: true, real: true, forced: true }, {
  some: function some(callbackfn /* , thisArg */) {
    var set = aSet(this);
    var boundFunction = bind$2(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return iterate$1(set, function (value) {
      if (boundFunction(value, value, set)) return true;
    }, true) === true;
  }
});

var $$E = _export;
var call$5 = functionCall;
var toSetLike$1 = toSetLike$7;
var $symmetricDifference = setSymmetricDifference;

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$$E({ target: 'Set', proto: true, real: true, forced: true }, {
  symmetricDifference: function symmetricDifference(other) {
    return call$5($symmetricDifference, this, toSetLike$1(other));
  }
});

var $$D = _export;
var call$4 = functionCall;
var toSetLike = toSetLike$7;
var $union = setUnion;

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
// TODO: Obsolete version, remove from `core-js@4`
$$D({ target: 'Set', proto: true, real: true, forced: true }, {
  union: function union(other) {
    return call$4($union, this, toSetLike(other));
  }
});

// TODO: Remove from `core-js@4`
var $$C = _export;
var charAt$8 = stringMultibyte.charAt;
var requireObjectCoercible$1 = requireObjectCoercible$q;
var toIntegerOrInfinity$1 = toIntegerOrInfinity$p;
var toString$8 = toString$J;

// `String.prototype.at` method
// https://github.com/mathiasbynens/String.prototype.at
$$C({ target: 'String', proto: true, forced: true }, {
  at: function at(index) {
    var S = toString$8(requireObjectCoercible$1(this));
    var len = S.length;
    var relativeIndex = toIntegerOrInfinity$1(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : charAt$8(S, k);
  }
});

var uncurryThis$k = functionUncurryThis;
var toIndexedObject = toIndexedObject$k;
var toString$7 = toString$J;
var lengthOfArrayLike$3 = lengthOfArrayLike$B;

var $TypeError$5 = TypeError;
var push$5 = uncurryThis$k([].push);
var join$3 = uncurryThis$k([].join);

// `String.cooked` method
// https://tc39.es/proposal-string-cooked/
var stringCooked = function cooked(template /* , ...substitutions */) {
  var cookedTemplate = toIndexedObject(template);
  var literalSegments = lengthOfArrayLike$3(cookedTemplate);
  if (!literalSegments) return '';
  var argumentsLength = arguments.length;
  var elements = [];
  var i = 0;
  while (true) {
    var nextVal = cookedTemplate[i++];
    if (nextVal === undefined) throw new $TypeError$5('Incorrect template');
    push$5(elements, toString$7(nextVal));
    if (i === literalSegments) return join$3(elements, '');
    if (i < argumentsLength) push$5(elements, toString$7(arguments[i]));
  }
};

var $$B = _export;
var cooked$1 = stringCooked;

// `String.cooked` method
// https://github.com/tc39/proposal-string-cooked
$$B({ target: 'String', stat: true, forced: true }, {
  cooked: cooked$1
});

var $$A = _export;
var createIteratorConstructor$1 = iteratorCreateConstructor;
var createIterResultObject$1 = createIterResultObject$h;
var requireObjectCoercible = requireObjectCoercible$q;
var toString$6 = toString$J;
var InternalStateModule$3 = internalState;
var StringMultibyteModule = stringMultibyte;

var codeAt$1 = StringMultibyteModule.codeAt;
var charAt$7 = StringMultibyteModule.charAt;
var STRING_ITERATOR = 'String Iterator';
var setInternalState$3 = InternalStateModule$3.set;
var getInternalState$1 = InternalStateModule$3.getterFor(STRING_ITERATOR);

// TODO: unify with String#@@iterator
var $StringIterator = createIteratorConstructor$1(function StringIterator(string) {
  setInternalState$3(this, {
    type: STRING_ITERATOR,
    string: string,
    index: 0
  });
}, 'String', function next() {
  var state = getInternalState$1(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject$1(undefined, true);
  point = charAt$7(string, index);
  state.index += point.length;
  return createIterResultObject$1({ codePoint: codeAt$1(point, 0), position: index }, false);
});

// `String.prototype.codePoints` method
// https://github.com/tc39/proposal-string-prototype-codepoints
$$A({ target: 'String', proto: true, forced: true }, {
  codePoints: function codePoints() {
    return new $StringIterator(toString$6(requireObjectCoercible(this)));
  }
});

var uncurryThis$j = functionUncurryThis;

// eslint-disable-next-line es/no-weak-map -- safe
var WeakMapPrototype = WeakMap.prototype;

var weakMapHelpers = {
  // eslint-disable-next-line es/no-weak-map -- safe
  WeakMap: WeakMap,
  set: uncurryThis$j(WeakMapPrototype.set),
  get: uncurryThis$j(WeakMapPrototype.get),
  has: uncurryThis$j(WeakMapPrototype.has),
  remove: uncurryThis$j(WeakMapPrototype['delete'])
};

// adapted from https://github.com/jridgewell/string-dedent
var getBuiltIn$c = getBuiltIn$O;
var uncurryThis$i = functionUncurryThis;

var fromCharCode$3 = String.fromCharCode;
var fromCodePoint$1 = getBuiltIn$c('String', 'fromCodePoint');
var charAt$6 = uncurryThis$i(''.charAt);
var charCodeAt$2 = uncurryThis$i(''.charCodeAt);
var stringIndexOf = uncurryThis$i(''.indexOf);
var stringSlice$4 = uncurryThis$i(''.slice);

var ZERO_CODE = 48;
var NINE_CODE = 57;
var LOWER_A_CODE = 97;
var LOWER_F_CODE = 102;
var UPPER_A_CODE = 65;
var UPPER_F_CODE = 70;

var isDigit = function (str, index) {
  var c = charCodeAt$2(str, index);
  return c >= ZERO_CODE && c <= NINE_CODE;
};

var parseHex = function (str, index, end) {
  if (end >= str.length) return -1;
  var n = 0;
  for (; index < end; index++) {
    var c = hexToInt(charCodeAt$2(str, index));
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

var stringParse = function (raw) {
  var out = '';
  var start = 0;
  // We need to find every backslash escape sequence, and cook the escape into a real char.
  var i = 0;
  var n;
  while ((i = stringIndexOf(raw, '\\', i)) > -1) {
    out += stringSlice$4(raw, start, i);
    // If the backslash is the last char of the string, then it was an invalid sequence.
    // This can't actually happen in a tagged template literal, but could happen if you manually
    // invoked the tag with an array.
    if (++i === raw.length) return;
    var next = charAt$6(raw, i++);
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
        if (i < raw.length && charAt$6(raw, i) === '\n') ++i;
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
        out += fromCharCode$3(n);
        break;
      // Unicode escapes contain either 4 chars, or an unlimited number between `{` and `}`.
      // The hex value must not overflow 0x10FFFF.
      case 'u':
        if (i < raw.length && charAt$6(raw, i) === '{') {
          var end = stringIndexOf(raw, '}', ++i);
          if (end === -1) return;
          n = parseHex(raw, i, end);
          i = end + 1;
        } else {
          n = parseHex(raw, i, i + 4);
          i += 4;
        }
        if (n === -1 || n > 0x10FFFF) return;
        out += fromCodePoint$1(n);
        break;
      default:
        if (isDigit(next, 0)) return;
        out += next;
    }
    start = i;
  }
  return out + stringSlice$4(raw, start);
};

var FREEZING = freezing;
var $$z = _export;
var makeBuiltIn = makeBuiltInExports;
var uncurryThis$h = functionUncurryThis;
var apply$1 = functionApply$1;
var anObject$3 = anObject$1h;
var toObject = toObject$E;
var isCallable$3 = isCallable$I;
var lengthOfArrayLike$2 = lengthOfArrayLike$B;
var defineProperty$5 = objectDefineProperty.f;
var createArrayFromList = arraySlice$a;
var WeakMapHelpers$3 = weakMapHelpers;
var cooked = stringCooked;
var parse = stringParse;
var whitespaces$1 = whitespaces$6;

var DedentMap = new WeakMapHelpers$3.WeakMap();
var weakMapGet = WeakMapHelpers$3.get;
var weakMapHas = WeakMapHelpers$3.has;
var weakMapSet = WeakMapHelpers$3.set;

var $Array = Array;
var $TypeError$4 = TypeError;
// eslint-disable-next-line es/no-object-freeze -- safe
var freeze = Object.freeze || Object;
// eslint-disable-next-line es/no-object-isfrozen -- safe
var isFrozen = Object.isFrozen;
var min$2 = Math.min;
var charAt$5 = uncurryThis$h(''.charAt);
var stringSlice$3 = uncurryThis$h(''.slice);
var split$3 = uncurryThis$h(''.split);
var exec$5 = uncurryThis$h(/./.exec);

var NEW_LINE = /([\n\u2028\u2029]|\r\n?)/g;
var LEADING_WHITESPACE = RegExp('^[' + whitespaces$1 + ']*');
var NON_WHITESPACE = RegExp('[^' + whitespaces$1 + ']');
var INVALID_TAG = 'Invalid tag';
var INVALID_OPENING_LINE = 'Invalid opening line';
var INVALID_CLOSING_LINE = 'Invalid closing line';

var dedentTemplateStringsArray = function (template) {
  var rawInput = template.raw;
  // https://github.com/tc39/proposal-string-dedent/issues/75
  if (FREEZING && !isFrozen(rawInput)) throw new $TypeError$4('Raw template should be frozen');
  if (weakMapHas(DedentMap, rawInput)) return weakMapGet(DedentMap, rawInput);
  var raw = dedentStringsArray(rawInput);
  var cookedArr = cookStrings(raw);
  defineProperty$5(cookedArr, 'raw', {
    value: freeze(raw)
  });
  freeze(cookedArr);
  weakMapSet(DedentMap, rawInput, cookedArr);
  return cookedArr;
};

var dedentStringsArray = function (template) {
  var t = toObject(template);
  var length = lengthOfArrayLike$2(t);
  var blocks = $Array(length);
  var dedented = $Array(length);
  var i = 0;
  var lines, common, quasi, k;

  if (!length) throw new $TypeError$4(INVALID_TAG);

  for (; i < length; i++) {
    var element = t[i];
    if (typeof element == 'string') blocks[i] = split$3(element, NEW_LINE);
    else throw new $TypeError$4(INVALID_TAG);
  }

  for (i = 0; i < length; i++) {
    var lastSplit = i + 1 === length;
    lines = blocks[i];
    if (i === 0) {
      if (lines.length === 1 || lines[0].length > 0) {
        throw new $TypeError$4(INVALID_OPENING_LINE);
      }
      lines[1] = '';
    }
    if (lastSplit) {
      if (lines.length === 1 || exec$5(NON_WHITESPACE, lines[lines.length - 1])) {
        throw new $TypeError$4(INVALID_CLOSING_LINE);
      }
      lines[lines.length - 2] = '';
      lines[lines.length - 1] = '';
    }
    // eslint-disable-next-line sonar/no-redundant-assignments -- false positive, https://github.com/SonarSource/SonarJS/issues/4767
    for (var j = 2; j < lines.length; j += 2) {
      var text = lines[j];
      var lineContainsTemplateExpression = j + 1 === lines.length && !lastSplit;
      var leading = exec$5(LEADING_WHITESPACE, text)[0];
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
      quasi += lines[k] + stringSlice$3(lines[k + 1], count);
    }
    dedented[i] = quasi;
  }

  return dedented;
};

var commonLeadingIndentation = function (a, b) {
  if (b === undefined || a === b) return a;
  var i = 0;
  for (var len = min$2(a.length, b.length); i < len; i++) {
    if (charAt$5(a, i) !== charAt$5(b, i)) break;
  }
  return stringSlice$3(a, 0, i);
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
    args[0] = dedentTemplateStringsArray(anObject$3(template));
    return apply$1(tag, this, args);
  }, '');
};

var cookedDedentTag = makeDedentTag(cooked);

// `String.dedent` method
// https://github.com/tc39/proposal-string-dedent
$$z({ target: 'String', stat: true, forced: true }, {
  dedent: function dedent(templateOrFn /* , ...substitutions */) {
    anObject$3(templateOrFn);
    if (isCallable$3(templateOrFn)) return makeDedentTag(templateOrFn);
    return apply$1(cookedDedentTag, this, arguments);
  }
});

var globalThis$p = globalThis_1;
var defineWellKnownSymbol$8 = wellKnownSymbolDefine;
var defineProperty$4 = objectDefineProperty.f;
var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;

var Symbol$4 = globalThis$p.Symbol;

// `Symbol.asyncDispose` well-known symbol
// https://github.com/tc39/proposal-async-explicit-resource-management
defineWellKnownSymbol$8('asyncDispose');

if (Symbol$4) {
  var descriptor$4 = getOwnPropertyDescriptor$1(Symbol$4, 'asyncDispose');
  // workaround of NodeJS 20.4 bug
  // https://github.com/nodejs/node/issues/48699
  // and incorrect descriptor from some transpilers and userland helpers
  if (descriptor$4.enumerable && descriptor$4.configurable && descriptor$4.writable) {
    defineProperty$4(Symbol$4, 'asyncDispose', { value: descriptor$4.value, enumerable: false, configurable: false, writable: false });
  }
}

var defineWellKnownSymbol$7 = wellKnownSymbolDefine;

// `Symbol.customMatcher` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol$7('customMatcher');

var globalThis$o = globalThis_1;
var defineWellKnownSymbol$6 = wellKnownSymbolDefine;
var defineProperty$3 = objectDefineProperty.f;
var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

var Symbol$3 = globalThis$o.Symbol;

// `Symbol.dispose` well-known symbol
// https://github.com/tc39/proposal-explicit-resource-management
defineWellKnownSymbol$6('dispose');

if (Symbol$3) {
  var descriptor$3 = getOwnPropertyDescriptor(Symbol$3, 'dispose');
  // workaround of NodeJS 20.4 bug
  // https://github.com/nodejs/node/issues/48699
  // and incorrect descriptor from some transpilers and userland helpers
  if (descriptor$3.enumerable && descriptor$3.configurable && descriptor$3.writable) {
    defineProperty$3(Symbol$3, 'dispose', { value: descriptor$3.value, enumerable: false, configurable: false, writable: false });
  }
}

var getBuiltIn$b = getBuiltIn$O;
var uncurryThis$g = functionUncurryThis;

var Symbol$2 = getBuiltIn$b('Symbol');
var keyFor = Symbol$2.keyFor;
var thisSymbolValue$1 = uncurryThis$g(Symbol$2.prototype.valueOf);

// `Symbol.isRegisteredSymbol` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
var symbolIsRegistered = Symbol$2.isRegisteredSymbol || function isRegisteredSymbol(value) {
  try {
    return keyFor(thisSymbolValue$1(value)) !== undefined;
  } catch (error) {
    return false;
  }
};

var $$y = _export;
var isRegisteredSymbol$1 = symbolIsRegistered;

// `Symbol.isRegisteredSymbol` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
$$y({ target: 'Symbol', stat: true }, {
  isRegisteredSymbol: isRegisteredSymbol$1
});

var $$x = _export;
var isRegisteredSymbol = symbolIsRegistered;

// `Symbol.isRegistered` method
// obsolete version of https://tc39.es/proposal-symbol-predicates/#sec-symbol-isregisteredsymbol
$$x({ target: 'Symbol', stat: true, name: 'isRegisteredSymbol' }, {
  isRegistered: isRegisteredSymbol
});

var shared = shared$a;
var getBuiltIn$a = getBuiltIn$O;
var uncurryThis$f = functionUncurryThis;
var isSymbol$1 = isSymbol$8;
var wellKnownSymbol$3 = wellKnownSymbol$S;

var Symbol$1 = getBuiltIn$a('Symbol');
var $isWellKnownSymbol = Symbol$1.isWellKnownSymbol;
var getOwnPropertyNames = getBuiltIn$a('Object', 'getOwnPropertyNames');
var thisSymbolValue = uncurryThis$f(Symbol$1.prototype.valueOf);
var WellKnownSymbolsStore = shared('wks');

for (var i = 0, symbolKeys = getOwnPropertyNames(Symbol$1), symbolKeysLength = symbolKeys.length; i < symbolKeysLength; i++) {
  // some old engines throws on access to some keys like `arguments` or `caller`
  try {
    var symbolKey = symbolKeys[i];
    if (isSymbol$1(Symbol$1[symbolKey])) wellKnownSymbol$3(symbolKey);
  } catch (error) { /* empty */ }
}

// `Symbol.isWellKnownSymbol` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
var symbolIsWellKnown = function isWellKnownSymbol(value) {
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

var $$w = _export;
var isWellKnownSymbol$1 = symbolIsWellKnown;

// `Symbol.isWellKnownSymbol` method
// https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
$$w({ target: 'Symbol', stat: true, forced: true }, {
  isWellKnownSymbol: isWellKnownSymbol$1
});

var $$v = _export;
var isWellKnownSymbol = symbolIsWellKnown;

// `Symbol.isWellKnown` method
// obsolete version of https://tc39.es/proposal-symbol-predicates/#sec-symbol-iswellknownsymbol
// We should patch it for newly added well-known symbols. If it's not required, this module just will not be injected
$$v({ target: 'Symbol', stat: true, name: 'isWellKnownSymbol', forced: true }, {
  isWellKnown: isWellKnownSymbol
});

var defineWellKnownSymbol$5 = wellKnownSymbolDefine;

// `Symbol.matcher` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol$5('matcher');

var defineWellKnownSymbol$4 = wellKnownSymbolDefine;

// `Symbol.metadata` well-known symbol
// https://github.com/tc39/proposal-decorators
defineWellKnownSymbol$4('metadata');

// TODO: Remove from `core-js@4`
var defineWellKnownSymbol$3 = wellKnownSymbolDefine;

// `Symbol.metadataKey` well-known symbol
// https://github.com/tc39/proposal-decorator-metadata
defineWellKnownSymbol$3('metadataKey');

var defineWellKnownSymbol$2 = wellKnownSymbolDefine;

// `Symbol.observable` well-known symbol
// https://github.com/tc39/proposal-observable
defineWellKnownSymbol$2('observable');

// TODO: remove from `core-js@4`
var defineWellKnownSymbol$1 = wellKnownSymbolDefine;

// `Symbol.patternMatch` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol$1('patternMatch');

// TODO: remove from `core-js@4`
var defineWellKnownSymbol = wellKnownSymbolDefine;

defineWellKnownSymbol('replaceAll');

// TODO: Remove from `core-js@4`
var getBuiltIn$9 = getBuiltIn$O;
var aConstructor = aConstructor$4;
var arrayFromAsync = arrayFromAsync$1;
var ArrayBufferViewCore$5 = arrayBufferViewCore;
var arrayFromConstructorAndList$2 = arrayFromConstructorAndList$8;

var aTypedArrayConstructor = ArrayBufferViewCore$5.aTypedArrayConstructor;
var exportTypedArrayStaticMethod = ArrayBufferViewCore$5.exportTypedArrayStaticMethod;

// `%TypedArray%.fromAsync` method
// https://github.com/tc39/proposal-array-from-async
exportTypedArrayStaticMethod('fromAsync', function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
  var C = this;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var thisArg = argumentsLength > 2 ? arguments[2] : undefined;
  return new (getBuiltIn$9('Promise'))(function (resolve) {
    aConstructor(C);
    resolve(arrayFromAsync(asyncItems, mapfn, thisArg));
  }).then(function (list) {
    return arrayFromConstructorAndList$2(aTypedArrayConstructor(C), list);
  });
}, true);

// TODO: Remove from `core-js@4`
var ArrayBufferViewCore$4 = arrayBufferViewCore;
var $filterReject$1 = arrayIteration.filterReject;
var fromSpeciesAndList$1 = typedArrayFromSpeciesAndList;

var aTypedArray$4 = ArrayBufferViewCore$4.aTypedArray;
var exportTypedArrayMethod$4 = ArrayBufferViewCore$4.exportTypedArrayMethod;

// `%TypedArray%.prototype.filterOut` method
// https://github.com/tc39/proposal-array-filtering
exportTypedArrayMethod$4('filterOut', function filterOut(callbackfn /* , thisArg */) {
  var list = $filterReject$1(aTypedArray$4(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  return fromSpeciesAndList$1(this, list);
}, true);

var ArrayBufferViewCore$3 = arrayBufferViewCore;
var $filterReject = arrayIteration.filterReject;
var fromSpeciesAndList = typedArrayFromSpeciesAndList;

var aTypedArray$3 = ArrayBufferViewCore$3.aTypedArray;
var exportTypedArrayMethod$3 = ArrayBufferViewCore$3.exportTypedArrayMethod;

// `%TypedArray%.prototype.filterReject` method
// https://github.com/tc39/proposal-array-filtering
exportTypedArrayMethod$3('filterReject', function filterReject(callbackfn /* , thisArg */) {
  var list = $filterReject(aTypedArray$3(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  return fromSpeciesAndList(this, list);
}, true);

// TODO: Remove from `core-js@4`
var ArrayBufferViewCore$2 = arrayBufferViewCore;
var $group = arrayGroup;
var typedArraySpeciesConstructor = typedArraySpeciesConstructor$5;

var aTypedArray$2 = ArrayBufferViewCore$2.aTypedArray;
var exportTypedArrayMethod$2 = ArrayBufferViewCore$2.exportTypedArrayMethod;

// `%TypedArray%.prototype.groupBy` method
// https://github.com/tc39/proposal-array-grouping
exportTypedArrayMethod$2('groupBy', function groupBy(callbackfn /* , thisArg */) {
  var thisArg = arguments.length > 1 ? arguments[1] : undefined;
  return $group(aTypedArray$2(this), callbackfn, thisArg, typedArraySpeciesConstructor);
}, true);

// TODO: Remove from `core-js@4`
var ArrayBufferViewCore$1 = arrayBufferViewCore;
var lengthOfArrayLike$1 = lengthOfArrayLike$B;
var isBigIntArray = isBigIntArray$3;
var toAbsoluteIndex = toAbsoluteIndex$a;
var toBigInt = toBigInt$4;
var toIntegerOrInfinity = toIntegerOrInfinity$p;
var fails$7 = fails$1z;

var aTypedArray$1 = ArrayBufferViewCore$1.aTypedArray;
var getTypedArrayConstructor$1 = ArrayBufferViewCore$1.getTypedArrayConstructor;
var exportTypedArrayMethod$1 = ArrayBufferViewCore$1.exportTypedArrayMethod;
var max = Math.max;
var min$1 = Math.min;

// some early implementations, like WebKit, does not follow the final semantic
var PROPER_ORDER = !fails$7(function () {
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
exportTypedArrayMethod$1('toSpliced', function toSpliced(start, deleteCount /* , ...items */) {
  var O = aTypedArray$1(this);
  var C = getTypedArrayConstructor$1(O);
  var len = lengthOfArrayLike$1(O);
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
    actualDeleteCount = min$1(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
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

var uncurryThis$e = functionUncurryThis;
var ArrayBufferViewCore = arrayBufferViewCore;
var arrayFromConstructorAndList$1 = arrayFromConstructorAndList$8;
var $arrayUniqueBy = arrayUniqueBy$2;

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var arrayUniqueBy = uncurryThis$e($arrayUniqueBy);

// `%TypedArray%.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
exportTypedArrayMethod('uniqueBy', function uniqueBy(resolver) {
  aTypedArray(this);
  return arrayFromConstructorAndList$1(getTypedArrayConstructor(this), arrayUniqueBy(this, resolver));
}, true);

var isObject$2 = isObject$N;

var $String = String;
var $TypeError$3 = TypeError;

var anObjectOrUndefined$2 = function (argument) {
  if (argument === undefined || isObject$2(argument)) return argument;
  throw new $TypeError$3($String(argument) + ' is not an object or undefined');
};

var commonAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
var base64Alphabet$2 = commonAlphabet + '+/';
var base64UrlAlphabet$2 = commonAlphabet + '-_';

var inverse = function (characters) {
  // TODO: use `Object.create(null)` in `core-js@4`
  var result = {};
  var index = 0;
  for (; index < 64; index++) result[characters.charAt(index)] = index;
  return result;
};

var base64Map$2 = {
  i2c: base64Alphabet$2,
  c2i: inverse(base64Alphabet$2),
  i2cUrl: base64UrlAlphabet$2,
  c2iUrl: inverse(base64UrlAlphabet$2)
};

var $TypeError$2 = TypeError;

var getAlphabetOption$2 = function (options) {
  var alphabet = options && options.alphabet;
  if (alphabet === undefined || alphabet === 'base64' || alphabet === 'base64url') return alphabet || 'base64';
  throw new $TypeError$2('Incorrect `alphabet` option');
};

var globalThis$n = globalThis_1;
var uncurryThis$d = functionUncurryThis;
var anObjectOrUndefined$1 = anObjectOrUndefined$2;
var aString$2 = aString$4;
var hasOwn$5 = hasOwnProperty_1;
var base64Map$1 = base64Map$2;
var getAlphabetOption$1 = getAlphabetOption$2;
var notDetached$3 = arrayBufferNotDetached;

var base64Alphabet$1 = base64Map$1.c2i;
var base64UrlAlphabet$1 = base64Map$1.c2iUrl;

var SyntaxError$2 = globalThis$n.SyntaxError;
var TypeError$4 = globalThis$n.TypeError;
var at = uncurryThis$d(''.charAt);

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
      throw new SyntaxError$2('Extra bits');
    }
    return [chunkBytes[0]];
  }

  if (chunkLength === 3) {
    if (throwOnExtraBits && chunkBytes[2] !== 0) {
      throw new SyntaxError$2('Extra bits');
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
var uint8FromBase64 = function (string, options, into, maxLength) {
  aString$2(string);
  anObjectOrUndefined$1(options);
  var alphabet = getAlphabetOption$1(options) === 'base64' ? base64Alphabet$1 : base64UrlAlphabet$1;
  var lastChunkHandling = options ? options.lastChunkHandling : undefined;

  if (lastChunkHandling === undefined) lastChunkHandling = 'loose';

  if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
    throw new TypeError$4('Incorrect `lastChunkHandling` option');
  }

  if (into) notDetached$3(into.buffer);

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
            throw new SyntaxError$2('Malformed padding: exactly one additional character');
          }
          written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, false), written);
        } else {
          throw new SyntaxError$2('Missing padding');
        }
      }
      read = string.length;
      break;
    }
    var chr = at(string, index);
    ++index;
    if (chr === '=') {
      if (chunk.length < 2) {
        throw new SyntaxError$2('Padding is too early');
      }
      index = skipAsciiWhitespace(string, index);
      if (chunk.length === 2) {
        if (index === string.length) {
          if (lastChunkHandling === 'stop-before-partial') {
            break;
          }
          throw new SyntaxError$2('Malformed padding: only one =');
        }
        if (at(string, index) === '=') {
          ++index;
          index = skipAsciiWhitespace(string, index);
        }
      }
      if (index < string.length) {
        throw new SyntaxError$2('Unexpected character after padding');
      }
      written = writeBytes(bytes, decodeBase64Chunk(chunk, alphabet, lastChunkHandling === 'strict'), written);
      read = string.length;
      break;
    }
    if (!hasOwn$5(alphabet, chr)) {
      throw new SyntaxError$2('Unexpected character');
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

var $$u = _export;
var globalThis$m = globalThis_1;
var arrayFromConstructorAndList = arrayFromConstructorAndList$8;
var $fromBase64$1 = uint8FromBase64;

var Uint8Array$2 = globalThis$m.Uint8Array;

// `Uint8Array.fromBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (Uint8Array$2) $$u({ target: 'Uint8Array', stat: true }, {
  fromBase64: function fromBase64(string /* , options */) {
    var result = $fromBase64$1(string, arguments.length > 1 ? arguments[1] : undefined, null, 0x1FFFFFFFFFFFFF);
    return arrayFromConstructorAndList(Uint8Array$2, result.bytes);
  }
});

var globalThis$l = globalThis_1;
var uncurryThis$c = functionUncurryThis;

var Uint8Array$1 = globalThis$l.Uint8Array;
var SyntaxError$1 = globalThis$l.SyntaxError;
var parseInt$2 = globalThis$l.parseInt;
var min = Math.min;
var NOT_HEX = /[^\da-f]/i;
var exec$4 = uncurryThis$c(NOT_HEX.exec);
var stringSlice$2 = uncurryThis$c(''.slice);

var uint8FromHex = function (string, into) {
  var stringLength = string.length;
  if (stringLength % 2 !== 0) throw new SyntaxError$1('String should be an even number of characters');
  var maxLength = into ? min(into.length, stringLength / 2) : stringLength / 2;
  var bytes = into || new Uint8Array$1(maxLength);
  var read = 0;
  var written = 0;
  while (written < maxLength) {
    var hexits = stringSlice$2(string, read, read += 2);
    if (exec$4(NOT_HEX, hexits)) throw new SyntaxError$1('String should only contain hex characters');
    bytes[written++] = parseInt$2(hexits, 16);
  }
  return { bytes: bytes, read: read };
};

var $$t = _export;
var globalThis$k = globalThis_1;
var aString$1 = aString$4;
var $fromHex$1 = uint8FromHex;

// `Uint8Array.fromHex` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (globalThis$k.Uint8Array) $$t({ target: 'Uint8Array', stat: true }, {
  fromHex: function fromHex(string) {
    return $fromHex$1(aString$1(string)).bytes;
  }
});

var classof$2 = classof$q;

var $TypeError$1 = TypeError;

// Perform ? RequireInternalSlot(argument, [[TypedArrayName]])
// If argument.[[TypedArrayName]] is not "Uint8Array", throw a TypeError exception
var anUint8Array$4 = function (argument) {
  if (classof$2(argument) === 'Uint8Array') return argument;
  throw new $TypeError$1('Argument is not an Uint8Array');
};

var $$s = _export;
var globalThis$j = globalThis_1;
var $fromBase64 = uint8FromBase64;
var anUint8Array$3 = anUint8Array$4;

var Uint8Array = globalThis$j.Uint8Array;

// `Uint8Array.prototype.setFromBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (Uint8Array) $$s({ target: 'Uint8Array', proto: true }, {
  setFromBase64: function setFromBase64(string /* , options */) {
    anUint8Array$3(this);

    var result = $fromBase64(string, arguments.length > 1 ? arguments[1] : undefined, this, this.length);

    return { read: result.read, written: result.written };
  }
});

var $$r = _export;
var globalThis$i = globalThis_1;
var aString = aString$4;
var anUint8Array$2 = anUint8Array$4;
var notDetached$2 = arrayBufferNotDetached;
var $fromHex = uint8FromHex;

// `Uint8Array.prototype.setFromHex` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (globalThis$i.Uint8Array) $$r({ target: 'Uint8Array', proto: true }, {
  setFromHex: function setFromHex(string) {
    anUint8Array$2(this);
    aString(string);
    notDetached$2(this.buffer);
    var read = $fromHex(string, this).read;
    return { read: read, written: read / 2 };
  }
});

var $$q = _export;
var globalThis$h = globalThis_1;
var uncurryThis$b = functionUncurryThis;
var anObjectOrUndefined = anObjectOrUndefined$2;
var anUint8Array$1 = anUint8Array$4;
var notDetached$1 = arrayBufferNotDetached;
var base64Map = base64Map$2;
var getAlphabetOption = getAlphabetOption$2;

var base64Alphabet = base64Map.i2c;
var base64UrlAlphabet = base64Map.i2cUrl;

var charAt$4 = uncurryThis$b(''.charAt);

// `Uint8Array.prototype.toBase64` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (globalThis$h.Uint8Array) $$q({ target: 'Uint8Array', proto: true }, {
  toBase64: function toBase64(/* options */) {
    var array = anUint8Array$1(this);
    var options = arguments.length ? anObjectOrUndefined(arguments[0]) : undefined;
    var alphabet = getAlphabetOption(options) === 'base64' ? base64Alphabet : base64UrlAlphabet;
    var omitPadding = !!options && !!options.omitPadding;
    notDetached$1(this.buffer);

    var result = '';
    var i = 0;
    var length = array.length;
    var triplet;

    var at = function (shift) {
      return charAt$4(alphabet, (triplet >> (6 * shift)) & 63);
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

var $$p = _export;
var globalThis$g = globalThis_1;
var uncurryThis$a = functionUncurryThis;
var anUint8Array = anUint8Array$4;
var notDetached = arrayBufferNotDetached;

var numberToString$1 = uncurryThis$a(1.0.toString);

// `Uint8Array.prototype.toHex` method
// https://github.com/tc39/proposal-arraybuffer-base64
if (globalThis$g.Uint8Array) $$p({ target: 'Uint8Array', proto: true }, {
  toHex: function toHex() {
    anUint8Array(this);
    notDetached(this.buffer);
    var result = '';
    for (var i = 0, length = this.length; i < length; i++) {
      var hex = numberToString$1(this[i], 16);
      result += hex.length === 1 ? '0' + hex : hex;
    }
    return result;
  }
});

var has$2 = weakMapHelpers.has;

// Perform ? RequireInternalSlot(M, [[WeakMapData]])
var aWeakMap$2 = function (it) {
  has$2(it);
  return it;
};

var $$o = _export;
var aWeakMap$1 = aWeakMap$2;
var remove$1 = weakMapHelpers.remove;

// `WeakMap.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$o({ target: 'WeakMap', proto: true, real: true, forced: true }, {
  deleteAll: function deleteAll(/* ...elements */) {
    var collection = aWeakMap$1(this);
    var allDeleted = true;
    var wasDeleted;
    for (var k = 0, len = arguments.length; k < len; k++) {
      wasDeleted = remove$1(collection, arguments[k]);
      allDeleted = allDeleted && wasDeleted;
    } return !!allDeleted;
  }
});

var $$n = _export;
var WeakMapHelpers$2 = weakMapHelpers;
var createCollectionFrom$1 = collectionFrom;

// `WeakMap.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from
$$n({ target: 'WeakMap', stat: true, forced: true }, {
  from: createCollectionFrom$1(WeakMapHelpers$2.WeakMap, WeakMapHelpers$2.set, true)
});

var $$m = _export;
var WeakMapHelpers$1 = weakMapHelpers;
var createCollectionOf$1 = collectionOf;

// `WeakMap.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of
$$m({ target: 'WeakMap', stat: true, forced: true }, {
  of: createCollectionOf$1(WeakMapHelpers$1.WeakMap, WeakMapHelpers$1.set, true)
});

var $$l = _export;
var aWeakMap = aWeakMap$2;
var WeakMapHelpers = weakMapHelpers;

var get = WeakMapHelpers.get;
var has$1 = WeakMapHelpers.has;
var set = WeakMapHelpers.set;

// `WeakMap.prototype.emplace` method
// https://github.com/tc39/proposal-upsert
$$l({ target: 'WeakMap', proto: true, real: true, forced: true }, {
  emplace: function emplace(key, handler) {
    var map = aWeakMap(this);
    var value, inserted;
    if (has$1(map, key)) {
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

// TODO: remove from `core-js@4`
var $$k = _export;
var upsert = mapUpsert;

// `WeakMap.prototype.upsert` method (replaced by `WeakMap.prototype.emplace`)
// https://github.com/tc39/proposal-upsert
$$k({ target: 'WeakMap', proto: true, real: true, forced: true }, {
  upsert: upsert
});

var uncurryThis$9 = functionUncurryThis;

// eslint-disable-next-line es/no-weak-set -- safe
var WeakSetPrototype = WeakSet.prototype;

var weakSetHelpers = {
  // eslint-disable-next-line es/no-weak-set -- safe
  WeakSet: WeakSet,
  add: uncurryThis$9(WeakSetPrototype.add),
  has: uncurryThis$9(WeakSetPrototype.has),
  remove: uncurryThis$9(WeakSetPrototype['delete'])
};

var has = weakSetHelpers.has;

// Perform ? RequireInternalSlot(M, [[WeakSetData]])
var aWeakSet$2 = function (it) {
  has(it);
  return it;
};

var $$j = _export;
var aWeakSet$1 = aWeakSet$2;
var add = weakSetHelpers.add;

// `WeakSet.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$$j({ target: 'WeakSet', proto: true, real: true, forced: true }, {
  addAll: function addAll(/* ...elements */) {
    var set = aWeakSet$1(this);
    for (var k = 0, len = arguments.length; k < len; k++) {
      add(set, arguments[k]);
    } return set;
  }
});

var $$i = _export;
var aWeakSet = aWeakSet$2;
var remove = weakSetHelpers.remove;

// `WeakSet.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$i({ target: 'WeakSet', proto: true, real: true, forced: true }, {
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

var $$h = _export;
var WeakSetHelpers$1 = weakSetHelpers;
var createCollectionFrom = collectionFrom;

// `WeakSet.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.from
$$h({ target: 'WeakSet', stat: true, forced: true }, {
  from: createCollectionFrom(WeakSetHelpers$1.WeakSet, WeakSetHelpers$1.add, false)
});

var $$g = _export;
var WeakSetHelpers = weakSetHelpers;
var createCollectionOf = collectionOf;

// `WeakSet.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of
$$g({ target: 'WeakSet', stat: true, forced: true }, {
  of: createCollectionOf(WeakSetHelpers.WeakSet, WeakSetHelpers.add, false)
});

var $$f = _export;
var globalThis$f = globalThis_1;
var getBuiltIn$8 = getBuiltIn$O;
var uncurryThis$8 = functionUncurryThis;
var call$3 = functionCall;
var fails$6 = fails$1z;
var toString$5 = toString$J;
var validateArgumentsLength$a = validateArgumentsLength$c;
var c2i = base64Map$2.c2i;

var disallowed = /[^\d+/a-z]/i;
var whitespaces = /[\t\n\f\r ]+/g;
var finalEq = /[=]{1,2}$/;

var $atob = getBuiltIn$8('atob');
var fromCharCode$2 = String.fromCharCode;
var charAt$3 = uncurryThis$8(''.charAt);
var replace$3 = uncurryThis$8(''.replace);
var exec$3 = uncurryThis$8(disallowed.exec);

var BASIC$1 = !!$atob && !fails$6(function () {
  return $atob('aGk=') !== 'hi';
});

var NO_SPACES_IGNORE = BASIC$1 && fails$6(function () {
  return $atob(' ') !== '';
});

var NO_ENCODING_CHECK = BASIC$1 && !fails$6(function () {
  $atob('a');
});

var NO_ARG_RECEIVING_CHECK$1 = BASIC$1 && !fails$6(function () {
  $atob();
});

var WRONG_ARITY$3 = BASIC$1 && $atob.length !== 1;

var FORCED = !BASIC$1 || NO_SPACES_IGNORE || NO_ENCODING_CHECK || NO_ARG_RECEIVING_CHECK$1 || WRONG_ARITY$3;

// `atob` method
// https://html.spec.whatwg.org/multipage/webappapis.html#dom-atob
$$f({ global: true, bind: true, enumerable: true, forced: FORCED }, {
  atob: function atob(data) {
    validateArgumentsLength$a(arguments.length, 1);
    // `webpack` dev server bug on IE global methods - use call(fn, global, ...)
    if (BASIC$1 && !NO_SPACES_IGNORE && !NO_ENCODING_CHECK) return call$3($atob, globalThis$f, data);
    var string = replace$3(toString$5(data), whitespaces, '');
    var output = '';
    var position = 0;
    var bc = 0;
    var length, chr, bs;
    if (string.length % 4 === 0) {
      string = replace$3(string, finalEq, '');
    }
    length = string.length;
    if (length % 4 === 1 || exec$3(disallowed, string)) {
      throw new (getBuiltIn$8('DOMException'))('The string is not correctly encoded', 'InvalidCharacterError');
    }
    while (position < length) {
      chr = charAt$3(string, position++);
      bs = bc % 4 ? bs * 64 + c2i[chr] : c2i[chr];
      if (bc++ % 4) output += fromCharCode$2(255 & bs >> (-2 * bc & 6));
    } return output;
  }
});

var $$e = _export;
var globalThis$e = globalThis_1;
var getBuiltIn$7 = getBuiltIn$O;
var uncurryThis$7 = functionUncurryThis;
var call$2 = functionCall;
var fails$5 = fails$1z;
var toString$4 = toString$J;
var validateArgumentsLength$9 = validateArgumentsLength$c;
var i2c = base64Map$2.i2c;

var $btoa = getBuiltIn$7('btoa');
var charAt$2 = uncurryThis$7(''.charAt);
var charCodeAt$1 = uncurryThis$7(''.charCodeAt);

var BASIC = !!$btoa && !fails$5(function () {
  return $btoa('hi') !== 'aGk=';
});

var NO_ARG_RECEIVING_CHECK = BASIC && !fails$5(function () {
  $btoa();
});

var WRONG_ARG_CONVERSION = BASIC && fails$5(function () {
  return $btoa(null) !== 'bnVsbA==';
});

var WRONG_ARITY$2 = BASIC && $btoa.length !== 1;

// `btoa` method
// https://html.spec.whatwg.org/multipage/webappapis.html#dom-btoa
$$e({ global: true, bind: true, enumerable: true, forced: !BASIC || NO_ARG_RECEIVING_CHECK || WRONG_ARG_CONVERSION || WRONG_ARITY$2 }, {
  btoa: function btoa(data) {
    validateArgumentsLength$9(arguments.length, 1);
    // `webpack` dev server bug on IE global methods - use call(fn, global, ...)
    if (BASIC) return call$2($btoa, globalThis$e, toString$4(data));
    var string = toString$4(data);
    var output = '';
    var position = 0;
    var map = i2c;
    var block, charCode;
    while (charAt$2(string, position) || (map = '=', position % 1)) {
      charCode = charCodeAt$1(string, position += 3 / 4);
      if (charCode > 0xFF) {
        throw new (getBuiltIn$7('DOMException'))('The string contains characters outside of the Latin1 range', 'InvalidCharacterError');
      }
      block = block << 8 | charCode;
      output += charAt$2(map, 63 & block >> 8 - position % 1 * 8);
    } return output;
  }
});

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
var domIterables = {
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

// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
var documentCreateElement = documentCreateElement$2;

var classList = documentCreateElement('span').classList;
var DOMTokenListPrototype$2 = classList && classList.constructor && classList.constructor.prototype;

var domTokenListPrototype = DOMTokenListPrototype$2 === Object.prototype ? undefined : DOMTokenListPrototype$2;

var globalThis$d = globalThis_1;
var DOMIterables$1 = domIterables;
var DOMTokenListPrototype$1 = domTokenListPrototype;
var forEach$2 = arrayForEach;
var createNonEnumerableProperty$2 = createNonEnumerableProperty$j;

var handlePrototype$1 = function (CollectionPrototype) {
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach$2) try {
    createNonEnumerableProperty$2(CollectionPrototype, 'forEach', forEach$2);
  } catch (error) {
    CollectionPrototype.forEach = forEach$2;
  }
};

for (var COLLECTION_NAME$1 in DOMIterables$1) {
  if (DOMIterables$1[COLLECTION_NAME$1]) {
    handlePrototype$1(globalThis$d[COLLECTION_NAME$1] && globalThis$d[COLLECTION_NAME$1].prototype);
  }
}

handlePrototype$1(DOMTokenListPrototype$1);

var globalThis$c = globalThis_1;
var DOMIterables = domIterables;
var DOMTokenListPrototype = domTokenListPrototype;
var ArrayIteratorMethods = es_array_iterator;
var createNonEnumerableProperty$1 = createNonEnumerableProperty$j;
var setToStringTag$3 = setToStringTag$e;
var wellKnownSymbol$2 = wellKnownSymbol$S;

var ITERATOR$2 = wellKnownSymbol$2('iterator');
var ArrayValues = ArrayIteratorMethods.values;

var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR$2] !== ArrayValues) try {
      createNonEnumerableProperty$1(CollectionPrototype, ITERATOR$2, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR$2] = ArrayValues;
    }
    setToStringTag$3(CollectionPrototype, COLLECTION_NAME, true);
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        createNonEnumerableProperty$1(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
};

for (var COLLECTION_NAME in DOMIterables) {
  handlePrototype(globalThis$c[COLLECTION_NAME] && globalThis$c[COLLECTION_NAME].prototype, COLLECTION_NAME);
}

handlePrototype(DOMTokenListPrototype, 'DOMTokenList');

var domExceptionConstants = {
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

var $$d = _export;
var getBuiltIn$6 = getBuiltIn$O;
var getBuiltInNodeModule = getBuiltInNodeModule$2;
var fails$4 = fails$1z;
var create$1 = objectCreate$1;
var createPropertyDescriptor$2 = createPropertyDescriptor$d;
var defineProperty$2 = objectDefineProperty.f;
var defineBuiltIn$4 = defineBuiltIn$u;
var defineBuiltInAccessor$4 = defineBuiltInAccessor$p;
var hasOwn$4 = hasOwnProperty_1;
var anInstance$3 = anInstance$f;
var anObject$2 = anObject$1h;
var errorToString = errorToString$2;
var normalizeStringArgument$1 = normalizeStringArgument$6;
var DOMExceptionConstants$1 = domExceptionConstants;
var clearErrorStack$1 = errorStackClear;
var InternalStateModule$2 = internalState;
var DESCRIPTORS$7 = descriptors;

var DOM_EXCEPTION$2 = 'DOMException';
var DATA_CLONE_ERR = 'DATA_CLONE_ERR';
var Error$3 = getBuiltIn$6('Error');
// NodeJS < 17.0 does not expose `DOMException` to global
var NativeDOMException$1 = getBuiltIn$6(DOM_EXCEPTION$2) || (function () {
  try {
    // NodeJS < 15.0 does not expose `MessageChannel` to global
    var MessageChannel = getBuiltIn$6('MessageChannel') || getBuiltInNodeModule('worker_threads').MessageChannel;
    // eslint-disable-next-line es/no-weak-map, unicorn/require-post-message-target-origin -- safe
    new MessageChannel().port1.postMessage(new WeakMap());
  } catch (error) {
    if (error.name === DATA_CLONE_ERR && error.code === 25) return error.constructor;
  }
})();
var NativeDOMExceptionPrototype = NativeDOMException$1 && NativeDOMException$1.prototype;
var ErrorPrototype = Error$3.prototype;
var setInternalState$2 = InternalStateModule$2.set;
var getInternalState = InternalStateModule$2.getterFor(DOM_EXCEPTION$2);
var HAS_STACK = 'stack' in new Error$3(DOM_EXCEPTION$2);

var codeFor = function (name) {
  return hasOwn$4(DOMExceptionConstants$1, name) && DOMExceptionConstants$1[name].m ? DOMExceptionConstants$1[name].c : 0;
};

var $DOMException$1 = function DOMException() {
  anInstance$3(this, DOMExceptionPrototype$1);
  var argumentsLength = arguments.length;
  var message = normalizeStringArgument$1(argumentsLength < 1 ? undefined : arguments[0]);
  var name = normalizeStringArgument$1(argumentsLength < 2 ? undefined : arguments[1], 'Error');
  var code = codeFor(name);
  setInternalState$2(this, {
    type: DOM_EXCEPTION$2,
    name: name,
    message: message,
    code: code
  });
  if (!DESCRIPTORS$7) {
    this.name = name;
    this.message = message;
    this.code = code;
  }
  if (HAS_STACK) {
    var error = new Error$3(message);
    error.name = DOM_EXCEPTION$2;
    defineProperty$2(this, 'stack', createPropertyDescriptor$2(1, clearErrorStack$1(error.stack, 1)));
  }
};

var DOMExceptionPrototype$1 = $DOMException$1.prototype = create$1(ErrorPrototype);

var createGetterDescriptor = function (get) {
  return { enumerable: true, configurable: true, get: get };
};

var getterFor = function (key) {
  return createGetterDescriptor(function () {
    return getInternalState(this)[key];
  });
};

if (DESCRIPTORS$7) {
  // `DOMException.prototype.code` getter
  defineBuiltInAccessor$4(DOMExceptionPrototype$1, 'code', getterFor('code'));
  // `DOMException.prototype.message` getter
  defineBuiltInAccessor$4(DOMExceptionPrototype$1, 'message', getterFor('message'));
  // `DOMException.prototype.name` getter
  defineBuiltInAccessor$4(DOMExceptionPrototype$1, 'name', getterFor('name'));
}

defineProperty$2(DOMExceptionPrototype$1, 'constructor', createPropertyDescriptor$2(1, $DOMException$1));

// FF36- DOMException is a function, but can't be constructed
var INCORRECT_CONSTRUCTOR = fails$4(function () {
  return !(new NativeDOMException$1() instanceof Error$3);
});

// Safari 10.1 / Chrome 32- / IE8- DOMException.prototype.toString bugs
var INCORRECT_TO_STRING = INCORRECT_CONSTRUCTOR || fails$4(function () {
  return ErrorPrototype.toString !== errorToString || String(new NativeDOMException$1(1, 2)) !== '2: 1';
});

// Deno 1.6.3- DOMException.prototype.code just missed
var INCORRECT_CODE = INCORRECT_CONSTRUCTOR || fails$4(function () {
  return new NativeDOMException$1(1, 'DataCloneError').code !== 25;
});

// Deno 1.6.3- DOMException constants just missed
INCORRECT_CONSTRUCTOR
  || NativeDOMException$1[DATA_CLONE_ERR] !== 25
  || NativeDOMExceptionPrototype[DATA_CLONE_ERR] !== 25;

var FORCED_CONSTRUCTOR$1 = INCORRECT_CONSTRUCTOR;

// `DOMException` constructor
// https://webidl.spec.whatwg.org/#idl-DOMException
$$d({ global: true, constructor: true, forced: FORCED_CONSTRUCTOR$1 }, {
  DOMException: FORCED_CONSTRUCTOR$1 ? $DOMException$1 : NativeDOMException$1
});

var PolyfilledDOMException$1 = getBuiltIn$6(DOM_EXCEPTION$2);
var PolyfilledDOMExceptionPrototype$1 = PolyfilledDOMException$1.prototype;

if (INCORRECT_TO_STRING && (NativeDOMException$1 === PolyfilledDOMException$1)) {
  defineBuiltIn$4(PolyfilledDOMExceptionPrototype$1, 'toString', errorToString);
}

if (INCORRECT_CODE && DESCRIPTORS$7 && NativeDOMException$1 === PolyfilledDOMException$1) {
  defineBuiltInAccessor$4(PolyfilledDOMExceptionPrototype$1, 'code', createGetterDescriptor(function () {
    return codeFor(anObject$2(this).name);
  }));
}

// `DOMException` constants
for (var key$1 in DOMExceptionConstants$1) if (hasOwn$4(DOMExceptionConstants$1, key$1)) {
  var constant$1 = DOMExceptionConstants$1[key$1];
  var constantName$1 = constant$1.s;
  var descriptor$2 = createPropertyDescriptor$2(6, constant$1.c);
  if (!hasOwn$4(PolyfilledDOMException$1, constantName$1)) {
    defineProperty$2(PolyfilledDOMException$1, constantName$1, descriptor$2);
  }
  if (!hasOwn$4(PolyfilledDOMExceptionPrototype$1, constantName$1)) {
    defineProperty$2(PolyfilledDOMExceptionPrototype$1, constantName$1, descriptor$2);
  }
}

var $$c = _export;
var globalThis$b = globalThis_1;
var getBuiltIn$5 = getBuiltIn$O;
var createPropertyDescriptor$1 = createPropertyDescriptor$d;
var defineProperty$1 = objectDefineProperty.f;
var hasOwn$3 = hasOwnProperty_1;
var anInstance$2 = anInstance$f;
var inheritIfRequired = inheritIfRequired$7;
var normalizeStringArgument = normalizeStringArgument$6;
var DOMExceptionConstants = domExceptionConstants;
var clearErrorStack = errorStackClear;
var DESCRIPTORS$6 = descriptors;

var DOM_EXCEPTION$1 = 'DOMException';
var Error$2 = getBuiltIn$5('Error');
var NativeDOMException = getBuiltIn$5(DOM_EXCEPTION$1);

var $DOMException = function DOMException() {
  anInstance$2(this, DOMExceptionPrototype);
  var argumentsLength = arguments.length;
  var message = normalizeStringArgument(argumentsLength < 1 ? undefined : arguments[0]);
  var name = normalizeStringArgument(argumentsLength < 2 ? undefined : arguments[1], 'Error');
  var that = new NativeDOMException(message, name);
  var error = new Error$2(message);
  error.name = DOM_EXCEPTION$1;
  defineProperty$1(that, 'stack', createPropertyDescriptor$1(1, clearErrorStack(error.stack, 1)));
  inheritIfRequired(that, this, $DOMException);
  return that;
};

var DOMExceptionPrototype = $DOMException.prototype = NativeDOMException.prototype;

var ERROR_HAS_STACK = 'stack' in new Error$2(DOM_EXCEPTION$1);
var DOM_EXCEPTION_HAS_STACK = 'stack' in new NativeDOMException(1, 2);

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var descriptor$1 = NativeDOMException && DESCRIPTORS$6 && Object.getOwnPropertyDescriptor(globalThis$b, DOM_EXCEPTION$1);

// Bun ~ 0.1.1 DOMException have incorrect descriptor and we can't redefine it
// https://github.com/Jarred-Sumner/bun/issues/399
var BUGGY_DESCRIPTOR = !!descriptor$1 && !(descriptor$1.writable && descriptor$1.configurable);

var FORCED_CONSTRUCTOR = ERROR_HAS_STACK && !BUGGY_DESCRIPTOR && !DOM_EXCEPTION_HAS_STACK;

// `DOMException` constructor patch for `.stack` where it's required
// https://webidl.spec.whatwg.org/#es-DOMException-specialness
$$c({ global: true, constructor: true, forced: FORCED_CONSTRUCTOR }, { // TODO: fix export logic
  DOMException: FORCED_CONSTRUCTOR ? $DOMException : NativeDOMException
});

var PolyfilledDOMException = getBuiltIn$5(DOM_EXCEPTION$1);
var PolyfilledDOMExceptionPrototype = PolyfilledDOMException.prototype;

if (PolyfilledDOMExceptionPrototype.constructor !== PolyfilledDOMException) {
  {
    defineProperty$1(PolyfilledDOMExceptionPrototype, 'constructor', createPropertyDescriptor$1(1, PolyfilledDOMException));
  }

  for (var key in DOMExceptionConstants) if (hasOwn$3(DOMExceptionConstants, key)) {
    var constant = DOMExceptionConstants[key];
    var constantName = constant.s;
    if (!hasOwn$3(PolyfilledDOMException, constantName)) {
      defineProperty$1(PolyfilledDOMException, constantName, createPropertyDescriptor$1(6, constant.c));
    }
  }
}

var getBuiltIn$4 = getBuiltIn$O;
var setToStringTag$2 = setToStringTag$e;

var DOM_EXCEPTION = 'DOMException';

// `DOMException.prototype[@@toStringTag]` property
setToStringTag$2(getBuiltIn$4(DOM_EXCEPTION), DOM_EXCEPTION);

var $$b = _export;
var globalThis$a = globalThis_1;
var clearImmediate = task$1.clear;

// `clearImmediate` method
// http://w3c.github.io/setImmediate/#si-clearImmediate
$$b({ global: true, bind: true, enumerable: true, forced: globalThis$a.clearImmediate !== clearImmediate }, {
  clearImmediate: clearImmediate
});

var globalThis$9 = globalThis_1;
var apply = functionApply$1;
var isCallable$2 = isCallable$I;
var ENVIRONMENT = environment;
var USER_AGENT = environmentUserAgent;
var arraySlice$1 = arraySlice$a;
var validateArgumentsLength$8 = validateArgumentsLength$c;

var Function$1 = globalThis$9.Function;
// dirty IE9- and Bun 0.3.0- checks
var WRAP = /MSIE .\./.test(USER_AGENT) || ENVIRONMENT === 'BUN' && (function () {
  var version = globalThis$9.Bun.version.split('.');
  return version.length < 3 || version[0] === '0' && (version[1] < 3 || version[1] === '3' && version[2] === '0');
})();

// IE9- / Bun 0.3.0- setTimeout / setInterval / setImmediate additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
// https://github.com/oven-sh/bun/issues/1633
var schedulersFix$3 = function (scheduler, hasTimeArg) {
  var firstParamIndex = hasTimeArg ? 2 : 1;
  return WRAP ? function (handler, timeout /* , ...arguments */) {
    var boundArgs = validateArgumentsLength$8(arguments.length, 1) > firstParamIndex;
    var fn = isCallable$2(handler) ? handler : Function$1(handler);
    var params = boundArgs ? arraySlice$1(arguments, firstParamIndex) : [];
    var callback = boundArgs ? function () {
      apply(fn, this, params);
    } : fn;
    return hasTimeArg ? scheduler(callback, timeout) : scheduler(callback);
  } : scheduler;
};

var $$a = _export;
var globalThis$8 = globalThis_1;
var setTask = task$1.set;
var schedulersFix$2 = schedulersFix$3;

// https://github.com/oven-sh/bun/issues/1633
var setImmediate = globalThis$8.setImmediate ? schedulersFix$2(setTask, false) : setTask;

// `setImmediate` method
// http://w3c.github.io/setImmediate/#si-setImmediate
$$a({ global: true, bind: true, enumerable: true, forced: globalThis$8.setImmediate !== setImmediate }, {
  setImmediate: setImmediate
});

var $$9 = _export;
var globalThis$7 = globalThis_1;
var microtask = microtask_1;
var aCallable = aCallable$N;
var validateArgumentsLength$7 = validateArgumentsLength$c;
var fails$3 = fails$1z;
var DESCRIPTORS$5 = descriptors;

// Bun ~ 1.0.30 bug
// https://github.com/oven-sh/bun/issues/9249
var WRONG_ARITY$1 = fails$3(function () {
  // getOwnPropertyDescriptor for prevent experimental warning in Node 11
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  return DESCRIPTORS$5 && Object.getOwnPropertyDescriptor(globalThis$7, 'queueMicrotask').value.length !== 1;
});

// `queueMicrotask` method
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask
$$9({ global: true, enumerable: true, dontCallGetSet: true, forced: WRONG_ARITY$1 }, {
  queueMicrotask: function queueMicrotask(fn) {
    validateArgumentsLength$7(arguments.length, 1);
    microtask(aCallable(fn));
  }
});

var $$8 = _export;
var globalThis$6 = globalThis_1;
var defineBuiltInAccessor$3 = defineBuiltInAccessor$p;
var DESCRIPTORS$4 = descriptors;

var $TypeError = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty = Object.defineProperty;
var INCORRECT_VALUE = globalThis$6.self !== globalThis$6;

// `self` getter
// https://html.spec.whatwg.org/multipage/window-object.html#dom-self
try {
  if (DESCRIPTORS$4) {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    var descriptor = Object.getOwnPropertyDescriptor(globalThis$6, 'self');
    // some engines have `self`, but with incorrect descriptor
    // https://github.com/denoland/deno/issues/15765
    if (INCORRECT_VALUE || !descriptor || !descriptor.get || !descriptor.enumerable) {
      defineBuiltInAccessor$3(globalThis$6, 'self', {
        get: function self() {
          return globalThis$6;
        },
        set: function self(value) {
          if (this !== globalThis$6) throw new $TypeError('Illegal invocation');
          defineProperty(globalThis$6, 'self', {
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
  } else $$8({ global: true, simple: true, forced: INCORRECT_VALUE }, {
    self: globalThis$6
  });
} catch (error) { /* empty */ }

var $$7 = _export;
var globalThis$5 = globalThis_1;
var getBuiltIn$3 = getBuiltIn$O;
var uncurryThis$6 = functionUncurryThis;
var fails$2 = fails$1z;
var uid = uid$7;
var isCallable$1 = isCallable$I;
var isConstructor = isConstructor$a;
var isNullOrUndefined = isNullOrUndefined$j;
var isObject$1 = isObject$N;
var isSymbol = isSymbol$8;
var iterate = iterate$H;
var anObject$1 = anObject$1h;
var classof$1 = classof$q;
var hasOwn$2 = hasOwnProperty_1;
var createProperty = createProperty$b;
var createNonEnumerableProperty = createNonEnumerableProperty$j;
var lengthOfArrayLike = lengthOfArrayLike$B;
var validateArgumentsLength$6 = validateArgumentsLength$c;
var getRegExpFlags = regexpGetFlags;
var MapHelpers = mapHelpers;
var SetHelpers = setHelpers;
var setIterate = setIterate$1;
var detachTransferable = detachTransferable$2;
var ERROR_STACK_INSTALLABLE = errorStackInstallable;
var PROPER_STRUCTURED_CLONE_TRANSFER = structuredCloneProperTransfer;

var Object$1 = globalThis$5.Object;
var Array$1 = globalThis$5.Array;
var Date$1 = globalThis$5.Date;
var Error$1 = globalThis$5.Error;
var TypeError$3 = globalThis$5.TypeError;
var PerformanceMark = globalThis$5.PerformanceMark;
var DOMException = getBuiltIn$3('DOMException');
var Map$1 = MapHelpers.Map;
var mapHas = MapHelpers.has;
var mapGet = MapHelpers.get;
var mapSet = MapHelpers.set;
var Set$1 = SetHelpers.Set;
var setAdd = SetHelpers.add;
var setHas = SetHelpers.has;
var objectKeys = getBuiltIn$3('Object', 'keys');
var push$4 = uncurryThis$6([].push);
var thisBooleanValue = uncurryThis$6(true.valueOf);
var thisNumberValue = uncurryThis$6(1.0.valueOf);
var thisStringValue = uncurryThis$6(''.valueOf);
var thisTimeValue = uncurryThis$6(Date$1.prototype.getTime);
var PERFORMANCE_MARK = uid('structuredClone');
var DATA_CLONE_ERROR = 'DataCloneError';
var TRANSFERRING = 'Transferring';

var checkBasicSemantic = function (structuredCloneImplementation) {
  return !fails$2(function () {
    var set1 = new globalThis$5.Set([7]);
    var set2 = structuredCloneImplementation(set1);
    var number = structuredCloneImplementation(Object$1(7));
    return set2 === set1 || !set2.has(7) || !isObject$1(number) || +number !== 7;
  }) && structuredCloneImplementation;
};

var checkErrorsCloning = function (structuredCloneImplementation, $Error) {
  return !fails$2(function () {
    var error = new $Error();
    var test = structuredCloneImplementation({ a: error, b: error });
    return !(test && test.a === test.b && test.a instanceof $Error && test.a.stack === error.stack);
  });
};

// https://github.com/whatwg/html/pull/5749
var checkNewErrorsCloningSemantic = function (structuredCloneImplementation) {
  return !fails$2(function () {
    var test = structuredCloneImplementation(new globalThis$5.AggregateError([1], PERFORMANCE_MARK, { cause: 3 }));
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
var nativeStructuredClone = globalThis$5.structuredClone;

var FORCED_REPLACEMENT = !checkErrorsCloning(nativeStructuredClone, Error$1)
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
    dataTransfer = new globalThis$5.DataTransfer();
  } catch (error) {
    try {
      dataTransfer = new globalThis$5.ClipboardEvent('').clipboardData;
    } catch (error2) { /* empty */ }
  }
  return dataTransfer && dataTransfer.items && dataTransfer.files ? dataTransfer : null;
};

var cloneBuffer = function (value, map, $type) {
  if (mapHas(map, value)) return mapGet(map, value);

  var type = $type || classof$1(value);
  var clone, length, options, source, target, i;

  if (type === 'SharedArrayBuffer') {
    if (nativeRestrictedStructuredClone) clone = nativeRestrictedStructuredClone(value);
    // SharedArrayBuffer should use shared memory, we can't polyfill it, so return the original
    else clone = value;
  } else {
    var DataView = globalThis$5.DataView;

    // `ArrayBuffer#slice` is not available in IE10
    // `ArrayBuffer#slice` and `DataView` are not available in old FF
    if (!DataView && !isCallable$1(value.slice)) throwUnpolyfillable('ArrayBuffer');
    // detached buffers throws in `DataView` and `.slice`
    try {
      if (isCallable$1(value.slice) && !value.resizable) {
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
  var C = globalThis$5[type];
  // in some old engines like Safari 9, typeof C is 'object'
  // on Uint8ClampedArray or some other constructors
  if (!isObject$1(C)) throwUnpolyfillable(type);
  return new C(cloneBuffer(value.buffer, map), offset, length);
};

var structuredCloneInternal = function (value, map) {
  if (isSymbol(value)) throwUncloneable('Symbol');
  if (!isObject$1(value)) return value;
  // effectively preserves circular references
  if (map) {
    if (mapHas(map, value)) return mapGet(map, value);
  } else map = new Map$1();

  var type = classof$1(value);
  var C, name, cloned, dataTransfer, i, length, keys, key;

  switch (type) {
    case 'Array':
      cloned = Array$1(lengthOfArrayLike(value));
      break;
    case 'Object':
      cloned = {};
      break;
    case 'Map':
      cloned = new Map$1();
      break;
    case 'Set':
      cloned = new Set$1();
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
          cloned = new (getBuiltIn$3(name))([]);
          break;
        case 'EvalError':
        case 'RangeError':
        case 'ReferenceError':
        case 'SuppressedError':
        case 'SyntaxError':
        case 'TypeError':
        case 'URIError':
          cloned = new (getBuiltIn$3(name))();
          break;
        case 'CompileError':
        case 'LinkError':
        case 'RuntimeError':
          cloned = new (getBuiltIn$3('WebAssembly', name))();
          break;
        default:
          cloned = new Error$1();
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
        if (classof$1(cloned) !== type) cloned = undefined;
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
          cloned = Object$1(value.valueOf());
          break;
        case 'Boolean':
          cloned = Object$1(thisBooleanValue(value));
          break;
        case 'Number':
          cloned = Object$1(thisNumberValue(value));
          break;
        case 'String':
          cloned = Object$1(thisStringValue(value));
          break;
        case 'Date':
          cloned = new Date$1(thisTimeValue(value));
          break;
        case 'Blob':
          try {
            cloned = value.slice(0, value.size, value.type);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'DOMPoint':
        case 'DOMPointReadOnly':
          C = globalThis$5[type];
          try {
            cloned = C.fromPoint
              ? C.fromPoint(value)
              : new C(value.x, value.y, value.z, value.w);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'DOMRect':
        case 'DOMRectReadOnly':
          C = globalThis$5[type];
          try {
            cloned = C.fromRect
              ? C.fromRect(value)
              : new C(value.x, value.y, value.width, value.height);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'DOMMatrix':
        case 'DOMMatrixReadOnly':
          C = globalThis$5[type];
          try {
            cloned = C.fromMatrix
              ? C.fromMatrix(value)
              : new C(value);
          } catch (error) {
            throwUnpolyfillable(type);
          } break;
        case 'AudioData':
        case 'VideoFrame':
          if (!isCallable$1(value.clone)) throwUnpolyfillable(type);
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
      if (hasOwn$2(value, 'cause')) {
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
  if (!isObject$1(rawTransfer)) throw new TypeError$3('Transfer option cannot be converted to a sequence');

  var transfer = [];

  iterate(rawTransfer, function (value) {
    push$4(transfer, anObject$1(value));
  });

  var i = 0;
  var length = lengthOfArrayLike(transfer);
  var buffers = new Set$1();
  var value, type, C, transferred, canvas, context;

  while (i < length) {
    value = transfer[i++];

    type = classof$1(value);

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
        C = globalThis$5.OffscreenCanvas;
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
        if (!isCallable$1(value.clone) || !isCallable$1(value.close)) throwUnpolyfillable(type, TRANSFERRING);
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
    } else if (isCallable$1(buffer.transfer)) {
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
$$7({ global: true, enumerable: true, sham: !PROPER_STRUCTURED_CLONE_TRANSFER, forced: FORCED_REPLACEMENT }, {
  structuredClone: function structuredClone(value /* , { transfer } */) {
    var options = validateArgumentsLength$6(arguments.length, 1) > 1 && !isNullOrUndefined(arguments[1]) ? anObject$1(arguments[1]) : undefined;
    var transfer = options ? options.transfer : undefined;
    var map, buffers;

    if (transfer !== undefined) {
      map = new Map$1();
      buffers = tryToTransfer(transfer, map);
    }

    var clone = structuredCloneInternal(value, map);

    // since of an issue with cloning views of transferred buffers, we a forced to detach them later
    // https://github.com/zloirock/core-js/issues/1265
    if (buffers) detachBuffers(buffers);

    return clone;
  }
});

var $$6 = _export;
var globalThis$4 = globalThis_1;
var schedulersFix$1 = schedulersFix$3;

var setInterval = schedulersFix$1(globalThis$4.setInterval, true);

// Bun / IE9- setInterval additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
$$6({ global: true, bind: true, forced: globalThis$4.setInterval !== setInterval }, {
  setInterval: setInterval
});

var $$5 = _export;
var globalThis$3 = globalThis_1;
var schedulersFix = schedulersFix$3;

var setTimeout$1 = schedulersFix(globalThis$3.setTimeout, true);

// Bun / IE9- setTimeout additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
$$5({ global: true, bind: true, forced: globalThis$3.setTimeout !== setTimeout$1 }, {
  setTimeout: setTimeout$1
});

var fails$1 = fails$1z;
var wellKnownSymbol$1 = wellKnownSymbol$S;
var DESCRIPTORS$3 = descriptors;
var IS_PURE = isPure;

var ITERATOR$1 = wellKnownSymbol$1('iterator');

var urlConstructorDetection = !fails$1(function () {
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
    || (!params.size && (IS_PURE || !DESCRIPTORS$3))
    || !params.sort
    || url.href !== 'https://a/c%20d?a=1&c=3'
    || params.get('c') !== '3'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !params[ITERATOR$1]
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

// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
var uncurryThis$5 = functionUncurryThis;

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
var exec$2 = uncurryThis$5(regexSeparators.exec);
var floor$1 = Math.floor;
var fromCharCode$1 = String.fromCharCode;
var charCodeAt = uncurryThis$5(''.charCodeAt);
var join$2 = uncurryThis$5([].join);
var push$3 = uncurryThis$5([].push);
var replace$2 = uncurryThis$5(''.replace);
var split$2 = uncurryThis$5(''.split);
var toLowerCase$1 = uncurryThis$5(''.toLowerCase);

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
        push$3(output, ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        push$3(output, value);
        counter--;
      }
    } else {
      push$3(output, value);
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
  delta = firstTime ? floor$1(delta / damp) : delta >> 1;
  delta += floor$1(delta / numPoints);
  while (delta > baseMinusTMin * tMax >> 1) {
    delta = floor$1(delta / baseMinusTMin);
    k += base;
  }
  return floor$1(k + (baseMinusTMin + 1) * delta / (delta + skew));
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
      push$3(output, fromCharCode$1(currentValue));
    }
  }

  var basicLength = output.length; // number of basic code points.
  var handledCPCount = basicLength; // number of code points that have been handled;

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    push$3(output, delimiter);
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
    if (m - n > floor$1((maxInt - delta) / handledCPCountPlusOne)) {
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
          push$3(output, fromCharCode$1(digitToBasic(t + qMinusT % baseMinusT)));
          q = floor$1(qMinusT / baseMinusT);
          k += base;
        }

        push$3(output, fromCharCode$1(digitToBasic(q)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
        delta = 0;
        handledCPCount++;
      }
    }

    delta++;
    n++;
  }
  return join$2(output, '');
};

var stringPunycodeToAscii = function (input) {
  var encoded = [];
  var labels = split$2(replace$2(toLowerCase$1(input), regexSeparators, '\u002E'), '.');
  var i, label;
  for (i = 0; i < labels.length; i++) {
    label = labels[i];
    push$3(encoded, exec$2(regexNonASCII, label) ? 'xn--' + encode(label) : label);
  }
  return join$2(encoded, '.');
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`


var $$4 = _export;
var globalThis$2 = globalThis_1;
var safeGetBuiltIn = safeGetBuiltIn$2;
var getBuiltIn$2 = getBuiltIn$O;
var call$1 = functionCall;
var uncurryThis$4 = functionUncurryThis;
var DESCRIPTORS$2 = descriptors;
var USE_NATIVE_URL$3 = urlConstructorDetection;
var defineBuiltIn$3 = defineBuiltIn$u;
var defineBuiltInAccessor$2 = defineBuiltInAccessor$p;
var defineBuiltIns = defineBuiltIns$b;
var setToStringTag$1 = setToStringTag$e;
var createIteratorConstructor = iteratorCreateConstructor;
var InternalStateModule$1 = internalState;
var anInstance$1 = anInstance$f;
var isCallable = isCallable$I;
var hasOwn$1 = hasOwnProperty_1;
var bind$1 = functionBindContext;
var classof = classof$q;
var anObject = anObject$1h;
var isObject = isObject$N;
var $toString$1 = toString$J;
var create = objectCreate$1;
var createPropertyDescriptor = createPropertyDescriptor$d;
var getIterator = getIterator$7;
var getIteratorMethod = getIteratorMethod$8;
var createIterResultObject = createIterResultObject$h;
var validateArgumentsLength$5 = validateArgumentsLength$c;
var wellKnownSymbol = wellKnownSymbol$S;
var arraySort = arraySort$1;

var ITERATOR = wellKnownSymbol('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState$1 = InternalStateModule$1.set;
var getInternalParamsState = InternalStateModule$1.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = InternalStateModule$1.getterFor(URL_SEARCH_PARAMS_ITERATOR);

var nativeFetch = safeGetBuiltIn('fetch');
var NativeRequest = safeGetBuiltIn('Request');
var Headers = safeGetBuiltIn('Headers');
var RequestPrototype = NativeRequest && NativeRequest.prototype;
var HeadersPrototype = Headers && Headers.prototype;
var TypeError$2 = globalThis$2.TypeError;
var encodeURIComponent$1 = globalThis$2.encodeURIComponent;
var fromCharCode = String.fromCharCode;
var fromCodePoint = getBuiltIn$2('String', 'fromCodePoint');
var $parseInt = parseInt;
var charAt$1 = uncurryThis$4(''.charAt);
var join$1 = uncurryThis$4([].join);
var push$2 = uncurryThis$4([].push);
var replace$1 = uncurryThis$4(''.replace);
var shift$1 = uncurryThis$4([].shift);
var splice = uncurryThis$4([].splice);
var split$1 = uncurryThis$4(''.split);
var stringSlice$1 = uncurryThis$4(''.slice);
var exec$1 = uncurryThis$4(/./.exec);

var plus = /\+/g;
var FALLBACK_REPLACER = '\uFFFD';
var VALID_HEX = /^[0-9a-f]+$/i;

var parseHexOctet = function (string, start) {
  var substr = stringSlice$1(string, start, start + 2);
  if (!exec$1(VALID_HEX, substr)) return NaN;

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
  input = replace$1(input, plus, ' ');
  var length = input.length;
  var result = '';
  var i = 0;

  while (i < length) {
    var decodedChar = charAt$1(input, i);

    if (decodedChar === '%') {
      if (charAt$1(input, i + 1) === '%' || i + 3 > length) {
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
          if (i + 3 > length || charAt$1(input, i) !== '%') break;

          var nextByte = parseHexOctet(input, i + 1);

          // eslint-disable-next-line no-self-compare -- NaN check
          if (nextByte !== nextByte) {
            i += 3;
            break;
          }
          if (nextByte > 191 || nextByte < 128) break;

          push$2(octets, nextByte);
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
  return replace$1(encodeURIComponent$1(it), find, replacer);
};

var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
  setInternalState$1(this, {
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
    else this.parseQuery(typeof init == 'string' ? charAt$1(init, 0) === '?' ? stringSlice$1(init, 1) : init : $toString$1(init));
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
      while (!(step = call$1(next, iterator)).done) {
        entryIterator = getIterator(anObject(step.value));
        entryNext = entryIterator.next;
        if (
          (first = call$1(entryNext, entryIterator)).done ||
          (second = call$1(entryNext, entryIterator)).done ||
          !call$1(entryNext, entryIterator).done
        ) throw new TypeError$2('Expected sequence with length 2');
        push$2(entries, { key: $toString$1(first.value), value: $toString$1(second.value) });
      }
    } else for (var key in object) if (hasOwn$1(object, key)) {
      push$2(entries, { key: key, value: $toString$1(object[key]) });
    }
  },
  parseQuery: function (query) {
    if (query) {
      var entries = this.entries;
      var attributes = split$1(query, '&');
      var index = 0;
      var attribute, entry;
      while (index < attributes.length) {
        attribute = attributes[index++];
        if (attribute.length) {
          entry = split$1(attribute, '=');
          push$2(entries, {
            key: decode(shift$1(entry)),
            value: decode(join$1(entry, '='))
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
      push$2(result, serialize(entry.key) + '=' + serialize(entry.value));
    } return join$1(result, '&');
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
  anInstance$1(this, URLSearchParamsPrototype$3);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  var state = setInternalState$1(this, new URLSearchParamsState(init));
  if (!DESCRIPTORS$2) this.size = state.entries.length;
};

var URLSearchParamsPrototype$3 = URLSearchParamsConstructor.prototype;

defineBuiltIns(URLSearchParamsPrototype$3, {
  // `URLSearchParams.prototype.append` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
  append: function append(name, value) {
    var state = getInternalParamsState(this);
    validateArgumentsLength$5(arguments.length, 2);
    push$2(state.entries, { key: $toString$1(name), value: $toString$1(value) });
    if (!DESCRIPTORS$2) this.length++;
    state.updateURL();
  },
  // `URLSearchParams.prototype.delete` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
  'delete': function (name /* , value */) {
    var state = getInternalParamsState(this);
    var length = validateArgumentsLength$5(arguments.length, 1);
    var entries = state.entries;
    var key = $toString$1(name);
    var $value = length < 2 ? undefined : arguments[1];
    var value = $value === undefined ? $value : $toString$1($value);
    var index = 0;
    while (index < entries.length) {
      var entry = entries[index];
      if (entry.key === key && (value === undefined || entry.value === value)) {
        splice(entries, index, 1);
        if (value !== undefined) break;
      } else index++;
    }
    if (!DESCRIPTORS$2) this.size = entries.length;
    state.updateURL();
  },
  // `URLSearchParams.prototype.get` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
  get: function get(name) {
    var entries = getInternalParamsState(this).entries;
    validateArgumentsLength$5(arguments.length, 1);
    var key = $toString$1(name);
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
    validateArgumentsLength$5(arguments.length, 1);
    var key = $toString$1(name);
    var result = [];
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) push$2(result, entries[index].value);
    }
    return result;
  },
  // `URLSearchParams.prototype.has` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
  has: function has(name /* , value */) {
    var entries = getInternalParamsState(this).entries;
    var length = validateArgumentsLength$5(arguments.length, 1);
    var key = $toString$1(name);
    var $value = length < 2 ? undefined : arguments[1];
    var value = $value === undefined ? $value : $toString$1($value);
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
    validateArgumentsLength$5(arguments.length, 1);
    var entries = state.entries;
    var found = false;
    var key = $toString$1(name);
    var val = $toString$1(value);
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
    if (!found) push$2(entries, { key: key, value: val });
    if (!DESCRIPTORS$2) this.size = entries.length;
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
    var boundFunction = bind$1(callback, arguments.length > 1 ? arguments[1] : undefined);
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
defineBuiltIn$3(URLSearchParamsPrototype$3, ITERATOR, URLSearchParamsPrototype$3.entries, { name: 'entries' });

// `URLSearchParams.prototype.toString` method
// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
defineBuiltIn$3(URLSearchParamsPrototype$3, 'toString', function toString() {
  return getInternalParamsState(this).serialize();
}, { enumerable: true });

// `URLSearchParams.prototype.size` getter
// https://github.com/whatwg/url/pull/734
if (DESCRIPTORS$2) defineBuiltInAccessor$2(URLSearchParamsPrototype$3, 'size', {
  get: function size() {
    return getInternalParamsState(this).entries.length;
  },
  configurable: true,
  enumerable: true
});

setToStringTag$1(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

$$4({ global: true, constructor: true, forced: !USE_NATIVE_URL$3 }, {
  URLSearchParams: URLSearchParamsConstructor
});

// Wrap `fetch` and `Request` for correct work with polyfilled `URLSearchParams`
if (!USE_NATIVE_URL$3 && isCallable(Headers)) {
  var headersHas = uncurryThis$4(HeadersPrototype.has);
  var headersSet = uncurryThis$4(HeadersPrototype.set);

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
          body: createPropertyDescriptor(0, $toString$1(body)),
          headers: createPropertyDescriptor(0, headers)
        });
      }
    } return init;
  };

  if (isCallable(nativeFetch)) {
    $$4({ global: true, enumerable: true, dontCallGetSet: true, forced: true }, {
      fetch: function fetch(input /* , init */) {
        return nativeFetch(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
      }
    });
  }

  if (isCallable(NativeRequest)) {
    var RequestConstructor = function Request(input /* , init */) {
      anInstance$1(this, RequestPrototype);
      return new NativeRequest(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
    };

    RequestPrototype.constructor = RequestConstructor;
    RequestConstructor.prototype = RequestPrototype;

    $$4({ global: true, constructor: true, dontCallGetSet: true, forced: true }, {
      Request: RequestConstructor
    });
  }
}

var web_urlSearchParams_constructor = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

var $$3 = _export;
var DESCRIPTORS$1 = descriptors;
var USE_NATIVE_URL$2 = urlConstructorDetection;
var globalThis$1 = globalThis_1;
var bind = functionBindContext;
var uncurryThis$3 = functionUncurryThis;
var defineBuiltIn$2 = defineBuiltIn$u;
var defineBuiltInAccessor$1 = defineBuiltInAccessor$p;
var anInstance = anInstance$f;
var hasOwn = hasOwnProperty_1;
var assign = objectAssign;
var arrayFrom = arrayFrom$1;
var arraySlice = arraySlice$a;
var codeAt = stringMultibyte.codeAt;
var toASCII = stringPunycodeToAscii;
var $toString = toString$J;
var setToStringTag = setToStringTag$e;
var validateArgumentsLength$4 = validateArgumentsLength$c;
var URLSearchParamsModule = web_urlSearchParams_constructor;
var InternalStateModule = internalState;

var setInternalState = InternalStateModule.set;
var getInternalURLState = InternalStateModule.getterFor('URL');
var URLSearchParams$1 = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;

var NativeURL = globalThis$1.URL;
var TypeError$1 = globalThis$1.TypeError;
var parseInt$1 = globalThis$1.parseInt;
var floor = Math.floor;
var pow = Math.pow;
var charAt = uncurryThis$3(''.charAt);
var exec = uncurryThis$3(/./.exec);
var join = uncurryThis$3([].join);
var numberToString = uncurryThis$3(1.0.toString);
var pop = uncurryThis$3([].pop);
var push$1 = uncurryThis$3([].push);
var replace = uncurryThis$3(''.replace);
var shift = uncurryThis$3([].shift);
var split = uncurryThis$3(''.split);
var stringSlice = uncurryThis$3(''.slice);
var toLowerCase = uncurryThis$3(''.toLowerCase);
var unshift = uncurryThis$3([].unshift);

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
      number = parseInt$1(part, radix);
    }
    push$1(numbers, number);
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
      value = value * 16 + parseInt$1(chr(), 16);
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
          number = parseInt$1(chr(), 10);
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
    if (failure) throw new TypeError$1(failure);
    this.searchParams = null;
  } else {
    if (base !== undefined) baseState = new URLState(base, true);
    failure = this.parse(urlString, null, baseState);
    if (failure) throw new TypeError$1(failure);
    searchParams = getInternalSearchParamsState(new URLSearchParams$1());
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
              push$1(url.path, '');
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
              var port = parseInt$1(buffer, 10);
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
            if (isWindowsDriveLetter(base.path[0], true)) push$1(url.path, base.path[0]);
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
                push$1(url.path, '');
              }
            } else if (isSingleDot(buffer)) {
              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
                push$1(url.path, '');
              }
            } else {
              if (url.scheme === 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
                if (url.host) url.host = '';
                buffer = charAt(buffer, 0) + ':'; // normalize windows drive letter
              }
              push$1(url.path, buffer);
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
    if (failure) throw new TypeError$1(failure);
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
  var base = validateArgumentsLength$4(arguments.length, 1) > 1 ? arguments[1] : undefined;
  var state = setInternalState(that, new URLState(url, false, base));
  if (!DESCRIPTORS$1) {
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

if (DESCRIPTORS$1) {
  // `URL.prototype.href` accessors pair
  // https://url.spec.whatwg.org/#dom-url-href
  defineBuiltInAccessor$1(URLPrototype, 'href', accessorDescriptor('serialize', 'setHref'));
  // `URL.prototype.origin` getter
  // https://url.spec.whatwg.org/#dom-url-origin
  defineBuiltInAccessor$1(URLPrototype, 'origin', accessorDescriptor('getOrigin'));
  // `URL.prototype.protocol` accessors pair
  // https://url.spec.whatwg.org/#dom-url-protocol
  defineBuiltInAccessor$1(URLPrototype, 'protocol', accessorDescriptor('getProtocol', 'setProtocol'));
  // `URL.prototype.username` accessors pair
  // https://url.spec.whatwg.org/#dom-url-username
  defineBuiltInAccessor$1(URLPrototype, 'username', accessorDescriptor('getUsername', 'setUsername'));
  // `URL.prototype.password` accessors pair
  // https://url.spec.whatwg.org/#dom-url-password
  defineBuiltInAccessor$1(URLPrototype, 'password', accessorDescriptor('getPassword', 'setPassword'));
  // `URL.prototype.host` accessors pair
  // https://url.spec.whatwg.org/#dom-url-host
  defineBuiltInAccessor$1(URLPrototype, 'host', accessorDescriptor('getHost', 'setHost'));
  // `URL.prototype.hostname` accessors pair
  // https://url.spec.whatwg.org/#dom-url-hostname
  defineBuiltInAccessor$1(URLPrototype, 'hostname', accessorDescriptor('getHostname', 'setHostname'));
  // `URL.prototype.port` accessors pair
  // https://url.spec.whatwg.org/#dom-url-port
  defineBuiltInAccessor$1(URLPrototype, 'port', accessorDescriptor('getPort', 'setPort'));
  // `URL.prototype.pathname` accessors pair
  // https://url.spec.whatwg.org/#dom-url-pathname
  defineBuiltInAccessor$1(URLPrototype, 'pathname', accessorDescriptor('getPathname', 'setPathname'));
  // `URL.prototype.search` accessors pair
  // https://url.spec.whatwg.org/#dom-url-search
  defineBuiltInAccessor$1(URLPrototype, 'search', accessorDescriptor('getSearch', 'setSearch'));
  // `URL.prototype.searchParams` getter
  // https://url.spec.whatwg.org/#dom-url-searchparams
  defineBuiltInAccessor$1(URLPrototype, 'searchParams', accessorDescriptor('getSearchParams'));
  // `URL.prototype.hash` accessors pair
  // https://url.spec.whatwg.org/#dom-url-hash
  defineBuiltInAccessor$1(URLPrototype, 'hash', accessorDescriptor('getHash', 'setHash'));
}

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
defineBuiltIn$2(URLPrototype, 'toJSON', function toJSON() {
  return getInternalURLState(this).serialize();
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
defineBuiltIn$2(URLPrototype, 'toString', function toString() {
  return getInternalURLState(this).serialize();
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  if (nativeCreateObjectURL) defineBuiltIn$2(URLConstructor, 'createObjectURL', bind(nativeCreateObjectURL, NativeURL));
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  if (nativeRevokeObjectURL) defineBuiltIn$2(URLConstructor, 'revokeObjectURL', bind(nativeRevokeObjectURL, NativeURL));
}

setToStringTag(URLConstructor, 'URL');

$$3({ global: true, constructor: true, forced: !USE_NATIVE_URL$2, sham: !DESCRIPTORS$1 }, {
  URL: URLConstructor
});

var $$2 = _export;
var getBuiltIn$1 = getBuiltIn$O;
var fails = fails$1z;
var validateArgumentsLength$3 = validateArgumentsLength$c;
var toString$3 = toString$J;
var USE_NATIVE_URL$1 = urlConstructorDetection;

var URL$2 = getBuiltIn$1('URL');

// https://github.com/nodejs/node/issues/47505
// https://github.com/denoland/deno/issues/18893
var THROWS_WITHOUT_ARGUMENTS = USE_NATIVE_URL$1 && fails(function () {
  URL$2.canParse();
});

// Bun ~ 1.0.30 bug
// https://github.com/oven-sh/bun/issues/9250
var WRONG_ARITY = fails(function () {
  return URL$2.canParse.length !== 1;
});

// `URL.canParse` method
// https://url.spec.whatwg.org/#dom-url-canparse
$$2({ target: 'URL', stat: true, forced: !THROWS_WITHOUT_ARGUMENTS || WRONG_ARITY }, {
  canParse: function canParse(url) {
    var length = validateArgumentsLength$3(arguments.length, 1);
    var urlString = toString$3(url);
    var base = length < 2 || arguments[1] === undefined ? undefined : toString$3(arguments[1]);
    try {
      return !!new URL$2(urlString, base);
    } catch (error) {
      return false;
    }
  }
});

var $$1 = _export;
var getBuiltIn = getBuiltIn$O;
var validateArgumentsLength$2 = validateArgumentsLength$c;
var toString$2 = toString$J;
var USE_NATIVE_URL = urlConstructorDetection;

var URL$1 = getBuiltIn('URL');

// `URL.parse` method
// https://url.spec.whatwg.org/#dom-url-canparse
$$1({ target: 'URL', stat: true, forced: !USE_NATIVE_URL }, {
  parse: function parse(url) {
    var length = validateArgumentsLength$2(arguments.length, 1);
    var urlString = toString$2(url);
    var base = length < 2 || arguments[1] === undefined ? undefined : toString$2(arguments[1]);
    try {
      return new URL$1(urlString, base);
    } catch (error) {
      return null;
    }
  }
});

var $ = _export;
var call = functionCall;

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
$({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return call(URL.prototype.toString, this);
  }
});

var defineBuiltIn$1 = defineBuiltIn$u;
var uncurryThis$2 = functionUncurryThis;
var toString$1 = toString$J;
var validateArgumentsLength$1 = validateArgumentsLength$c;

var $URLSearchParams$1 = URLSearchParams;
var URLSearchParamsPrototype$2 = $URLSearchParams$1.prototype;
var append = uncurryThis$2(URLSearchParamsPrototype$2.append);
var $delete = uncurryThis$2(URLSearchParamsPrototype$2['delete']);
var forEach$1 = uncurryThis$2(URLSearchParamsPrototype$2.forEach);
var push = uncurryThis$2([].push);
var params$1 = new $URLSearchParams$1('a=1&a=2&b=3');

params$1['delete']('a', 1);
// `undefined` case is a Chromium 117 bug
// https://bugs.chromium.org/p/v8/issues/detail?id=14222
params$1['delete']('b', undefined);

if (params$1 + '' !== 'a=2') {
  defineBuiltIn$1(URLSearchParamsPrototype$2, 'delete', function (name /* , value */) {
    var length = arguments.length;
    var $value = length < 2 ? undefined : arguments[1];
    if (length && $value === undefined) return $delete(this, name);
    var entries = [];
    forEach$1(this, function (v, k) { // also validates `this`
      push(entries, { key: k, value: v });
    });
    validateArgumentsLength$1(length, 1);
    var key = toString$1(name);
    var value = toString$1($value);
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

var defineBuiltIn = defineBuiltIn$u;
var uncurryThis$1 = functionUncurryThis;
var toString = toString$J;
var validateArgumentsLength = validateArgumentsLength$c;

var $URLSearchParams = URLSearchParams;
var URLSearchParamsPrototype$1 = $URLSearchParams.prototype;
var getAll = uncurryThis$1(URLSearchParamsPrototype$1.getAll);
var $has = uncurryThis$1(URLSearchParamsPrototype$1.has);
var params = new $URLSearchParams('a=1');

// `undefined` case is a Chromium 117 bug
// https://bugs.chromium.org/p/v8/issues/detail?id=14222
if (params.has('a', 2) || !params.has('a', undefined)) {
  defineBuiltIn(URLSearchParamsPrototype$1, 'has', function has(name /* , value */) {
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

var DESCRIPTORS = descriptors;
var uncurryThis = functionUncurryThis;
var defineBuiltInAccessor = defineBuiltInAccessor$p;

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
