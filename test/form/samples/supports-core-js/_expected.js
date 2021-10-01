var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global$R =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();

var objectGetOwnPropertyDescriptor = {};

var fails$15 = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var fails$14 = fails$15;

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails$14(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var objectPropertyIsEnumerable = {};

var $propertyIsEnumerable$1 = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$8 = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor$8 && !$propertyIsEnumerable$1.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor$8(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable$1;

var createPropertyDescriptor$9 = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var toString$u = {}.toString;

var classofRaw$1 = function (it) {
  return toString$u.call(it).slice(8, -1);
};

var fails$13 = fails$15;
var classof$e = classofRaw$1;

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails$13(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof$e(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible$j = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings
var IndexedObject$6 = indexedObject;
var requireObjectCoercible$i = requireObjectCoercible$j;

var toIndexedObject$d = function (it) {
  return IndexedObject$6(requireObjectCoercible$i(it));
};

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
var isCallable$z = function (argument) {
  return typeof argument === 'function';
};

var isCallable$y = isCallable$z;

var isObject$C = function (it) {
  return typeof it === 'object' ? it !== null : isCallable$y(it);
};

var global$Q = global$R;
var isCallable$x = isCallable$z;

var aFunction = function (argument) {
  return isCallable$x(argument) ? argument : undefined;
};

var getBuiltIn$w = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global$Q[namespace]) : global$Q[namespace] && global$Q[namespace][method];
};

var getBuiltIn$v = getBuiltIn$w;

var engineUserAgent = getBuiltIn$v('navigator', 'userAgent') || '';

var global$P = global$R;
var userAgent$7 = engineUserAgent;

var process$4 = global$P.process;
var Deno = global$P.Deno;
var versions = process$4 && process$4.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] < 4 ? 1 : match[0] + match[1];
} else if (userAgent$7) {
  match = userAgent$7.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent$7.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

var engineV8Version = version && +version;

/* eslint-disable es/no-symbol -- required for testing */

var V8_VERSION$3 = engineV8Version;
var fails$12 = fails$15;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
var nativeSymbol$1 = !!Object.getOwnPropertySymbols && !fails$12(function () {
  var symbol = Symbol();
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION$3 && V8_VERSION$3 < 41;
});

/* eslint-disable es/no-symbol -- required for testing */

var NATIVE_SYMBOL$2 = nativeSymbol$1;

var useSymbolAsUid = NATIVE_SYMBOL$2
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

var isCallable$w = isCallable$z;
var getBuiltIn$u = getBuiltIn$w;
var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

var isSymbol$5 = USE_SYMBOL_AS_UID$1 ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn$u('Symbol');
  return isCallable$w($Symbol) && Object(it) instanceof $Symbol;
};

var tryToString$3 = function (argument) {
  try {
    return String(argument);
  } catch (error) {
    return 'Object';
  }
};

var isCallable$v = isCallable$z;
var tryToString$2 = tryToString$3;

// `Assert: IsCallable(argument) is true`
var aCallable$Q = function (argument) {
  if (isCallable$v(argument)) return argument;
  throw TypeError(tryToString$2(argument) + ' is not a function');
};

var aCallable$P = aCallable$Q;

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
var getMethod$h = function (V, P) {
  var func = V[P];
  return func == null ? undefined : aCallable$P(func);
};

var isCallable$u = isCallable$z;
var isObject$B = isObject$C;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
var ordinaryToPrimitive$2 = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable$u(fn = input.toString) && !isObject$B(val = fn.call(input))) return val;
  if (isCallable$u(fn = input.valueOf) && !isObject$B(val = fn.call(input))) return val;
  if (pref !== 'string' && isCallable$u(fn = input.toString) && !isObject$B(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var shared$7 = {exports: {}};

var isPure = false;

var global$O = global$R;

var setGlobal$3 = function (key, value) {
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty(global$O, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global$O[key] = value;
  } return value;
};

var global$N = global$R;
var setGlobal$2 = setGlobal$3;

var SHARED = '__core-js_shared__';
var store$5 = global$N[SHARED] || setGlobal$2(SHARED, {});

var sharedStore = store$5;

var store$4 = sharedStore;

(shared$7.exports = function (key, value) {
  return store$4[key] || (store$4[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.18.1',
  mode: 'global',
  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
});

var requireObjectCoercible$h = requireObjectCoercible$j;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject$z = function (argument) {
  return Object(requireObjectCoercible$h(argument));
};

var toObject$y = toObject$z;

var hasOwnProperty = {}.hasOwnProperty;

var has$m = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty.call(toObject$y(it), key);
};

var id$2 = 0;
var postfix = Math.random();

var uid$5 = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id$2 + postfix).toString(36);
};

var global$M = global$R;
var shared$6 = shared$7.exports;
var has$l = has$m;
var uid$4 = uid$5;
var NATIVE_SYMBOL$1 = nativeSymbol$1;
var USE_SYMBOL_AS_UID = useSymbolAsUid;

var WellKnownSymbolsStore$1 = shared$6('wks');
var Symbol$3 = global$M.Symbol;
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$3 : Symbol$3 && Symbol$3.withoutSetter || uid$4;

var wellKnownSymbol$G = function (name) {
  if (!has$l(WellKnownSymbolsStore$1, name) || !(NATIVE_SYMBOL$1 || typeof WellKnownSymbolsStore$1[name] == 'string')) {
    if (NATIVE_SYMBOL$1 && has$l(Symbol$3, name)) {
      WellKnownSymbolsStore$1[name] = Symbol$3[name];
    } else {
      WellKnownSymbolsStore$1[name] = createWellKnownSymbol('Symbol.' + name);
    }
  } return WellKnownSymbolsStore$1[name];
};

var isObject$A = isObject$C;
var isSymbol$4 = isSymbol$5;
var getMethod$g = getMethod$h;
var ordinaryToPrimitive$1 = ordinaryToPrimitive$2;
var wellKnownSymbol$F = wellKnownSymbol$G;

var TO_PRIMITIVE$2 = wellKnownSymbol$F('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
var toPrimitive$3 = function (input, pref) {
  if (!isObject$A(input) || isSymbol$4(input)) return input;
  var exoticToPrim = getMethod$g(input, TO_PRIMITIVE$2);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = exoticToPrim.call(input, pref);
    if (!isObject$A(result) || isSymbol$4(result)) return result;
    throw TypeError("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive$1(input, pref);
};

var toPrimitive$2 = toPrimitive$3;
var isSymbol$3 = isSymbol$5;

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
var toPropertyKey$9 = function (argument) {
  var key = toPrimitive$2(argument, 'string');
  return isSymbol$3(key) ? key : String(key);
};

var global$L = global$R;
var isObject$z = isObject$C;

var document$3 = global$L.document;
// typeof document.createElement is 'object' in old IE
var EXISTS$1 = isObject$z(document$3) && isObject$z(document$3.createElement);

var documentCreateElement$2 = function (it) {
  return EXISTS$1 ? document$3.createElement(it) : {};
};

var DESCRIPTORS$A = descriptors;
var fails$11 = fails$15;
var createElement$1 = documentCreateElement$2;

// Thank's IE8 for his funny defineProperty
var ie8DomDefine = !DESCRIPTORS$A && !fails$11(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- requied for testing
  return Object.defineProperty(createElement$1('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

var DESCRIPTORS$z = descriptors;
var propertyIsEnumerableModule$2 = objectPropertyIsEnumerable;
var createPropertyDescriptor$8 = createPropertyDescriptor$9;
var toIndexedObject$c = toIndexedObject$d;
var toPropertyKey$8 = toPropertyKey$9;
var has$k = has$m;
var IE8_DOM_DEFINE$1 = ie8DomDefine;

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
objectGetOwnPropertyDescriptor.f = DESCRIPTORS$z ? $getOwnPropertyDescriptor$1 : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject$c(O);
  P = toPropertyKey$8(P);
  if (IE8_DOM_DEFINE$1) try {
    return $getOwnPropertyDescriptor$1(O, P);
  } catch (error) { /* empty */ }
  if (has$k(O, P)) return createPropertyDescriptor$8(!propertyIsEnumerableModule$2.f.call(O, P), O[P]);
};

var objectDefineProperty = {};

var isObject$y = isObject$C;

// `Assert: Type(argument) is Object`
var anObject$1C = function (argument) {
  if (isObject$y(argument)) return argument;
  throw TypeError(String(argument) + ' is not an object');
};

var DESCRIPTORS$y = descriptors;
var IE8_DOM_DEFINE = ie8DomDefine;
var anObject$1B = anObject$1C;
var toPropertyKey$7 = toPropertyKey$9;

// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty$1 = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
objectDefineProperty.f = DESCRIPTORS$y ? $defineProperty$1 : function defineProperty(O, P, Attributes) {
  anObject$1B(O);
  P = toPropertyKey$7(P);
  anObject$1B(Attributes);
  if (IE8_DOM_DEFINE) try {
    return $defineProperty$1(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var DESCRIPTORS$x = descriptors;
var definePropertyModule$c = objectDefineProperty;
var createPropertyDescriptor$7 = createPropertyDescriptor$9;

var createNonEnumerableProperty$h = DESCRIPTORS$x ? function (object, key, value) {
  return definePropertyModule$c.f(object, key, createPropertyDescriptor$7(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var redefine$l = {exports: {}};

var isCallable$t = isCallable$z;
var store$3 = sharedStore;

var functionToString = Function.toString;

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable$t(store$3.inspectSource)) {
  store$3.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

var inspectSource$4 = store$3.inspectSource;

var global$K = global$R;
var isCallable$s = isCallable$z;
var inspectSource$3 = inspectSource$4;

var WeakMap$3 = global$K.WeakMap;

var nativeWeakMap = isCallable$s(WeakMap$3) && /native code/.test(inspectSource$3(WeakMap$3));

var shared$5 = shared$7.exports;
var uid$3 = uid$5;

var keys$3 = shared$5('keys');

var sharedKey$4 = function (key) {
  return keys$3[key] || (keys$3[key] = uid$3(key));
};

var hiddenKeys$6 = {};

var NATIVE_WEAK_MAP$1 = nativeWeakMap;
var global$J = global$R;
var isObject$x = isObject$C;
var createNonEnumerableProperty$g = createNonEnumerableProperty$h;
var objectHas = has$m;
var shared$4 = sharedStore;
var sharedKey$3 = sharedKey$4;
var hiddenKeys$5 = hiddenKeys$6;

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var WeakMap$2 = global$J.WeakMap;
var set$3, get$2, has$j;

var enforce = function (it) {
  return has$j(it) ? get$2(it) : set$3(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject$x(it) || (state = get$2(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP$1 || shared$4.state) {
  var store$2 = shared$4.state || (shared$4.state = new WeakMap$2());
  var wmget = store$2.get;
  var wmhas = store$2.has;
  var wmset = store$2.set;
  set$3 = function (it, metadata) {
    if (wmhas.call(store$2, it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    wmset.call(store$2, it, metadata);
    return metadata;
  };
  get$2 = function (it) {
    return wmget.call(store$2, it) || {};
  };
  has$j = function (it) {
    return wmhas.call(store$2, it);
  };
} else {
  var STATE = sharedKey$3('state');
  hiddenKeys$5[STATE] = true;
  set$3 = function (it, metadata) {
    if (objectHas(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty$g(it, STATE, metadata);
    return metadata;
  };
  get$2 = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has$j = function (it) {
    return objectHas(it, STATE);
  };
}

var internalState = {
  set: set$3,
  get: get$2,
  has: has$j,
  enforce: enforce,
  getterFor: getterFor
};

var DESCRIPTORS$w = descriptors;
var has$i = has$m;

var FunctionPrototype$2 = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS$w && Object.getOwnPropertyDescriptor;

var EXISTS = has$i(FunctionPrototype$2, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS$w || (DESCRIPTORS$w && getDescriptor(FunctionPrototype$2, 'name').configurable));

var functionName = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};

var global$I = global$R;
var isCallable$r = isCallable$z;
var has$h = has$m;
var createNonEnumerableProperty$f = createNonEnumerableProperty$h;
var setGlobal$1 = setGlobal$3;
var inspectSource$2 = inspectSource$4;
var InternalStateModule$j = internalState;
var CONFIGURABLE_FUNCTION_NAME$2 = functionName.CONFIGURABLE;

var getInternalState$i = InternalStateModule$j.get;
var enforceInternalState$1 = InternalStateModule$j.enforce;
var TEMPLATE = String(String).split('String');

(redefine$l.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  var name = options && options.name !== undefined ? options.name : key;
  var state;
  if (isCallable$r(value)) {
    if (String(name).slice(0, 7) === 'Symbol(') {
      name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
    }
    if (!has$h(value, 'name') || (CONFIGURABLE_FUNCTION_NAME$2 && value.name !== name)) {
      createNonEnumerableProperty$f(value, 'name', name);
    }
    state = enforceInternalState$1(value);
    if (!state.source) {
      state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
    }
  }
  if (O === global$I) {
    if (simple) O[key] = value;
    else setGlobal$1(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty$f(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return isCallable$r(this) && getInternalState$i(this).source || inspectSource$2(this);
});

var objectGetOwnPropertyNames = {};

var ceil$2 = Math.ceil;
var floor$a = Math.floor;

// `ToInteger` abstract operation
// https://tc39.es/ecma262/#sec-tointeger
var toInteger$i = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor$a : ceil$2)(argument);
};

var toInteger$h = toInteger$i;

var min$a = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength$D = function (argument) {
  return argument > 0 ? min$a(toInteger$h(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var toInteger$g = toInteger$i;

var max$6 = Math.max;
var min$9 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex$8 = function (index, length) {
  var integer = toInteger$g(index);
  return integer < 0 ? max$6(integer + length, 0) : min$9(integer, length);
};

var toIndexedObject$b = toIndexedObject$d;
var toLength$C = toLength$D;
var toAbsoluteIndex$7 = toAbsoluteIndex$8;

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod$8 = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject$b($this);
    var length = toLength$C(O.length);
    var index = toAbsoluteIndex$7(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value != value) return true;
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

var has$g = has$m;
var toIndexedObject$a = toIndexedObject$d;
var indexOf = arrayIncludes.indexOf;
var hiddenKeys$4 = hiddenKeys$6;

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject$a(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has$g(hiddenKeys$4, key) && has$g(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has$g(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
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

var getBuiltIn$t = getBuiltIn$w;
var getOwnPropertyNamesModule$2 = objectGetOwnPropertyNames;
var getOwnPropertySymbolsModule$2 = objectGetOwnPropertySymbols;
var anObject$1A = anObject$1C;

// all object keys, includes non-enumerable and symbols
var ownKeys$3 = getBuiltIn$t('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule$2.f(anObject$1A(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule$2.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

var has$f = has$m;
var ownKeys$2 = ownKeys$3;
var getOwnPropertyDescriptorModule$6 = objectGetOwnPropertyDescriptor;
var definePropertyModule$b = objectDefineProperty;

var copyConstructorProperties$2 = function (target, source) {
  var keys = ownKeys$2(source);
  var defineProperty = definePropertyModule$b.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$6.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has$f(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

var fails$10 = fails$15;
var isCallable$q = isCallable$z;

var replacement = /#|\.prototype\./;

var isForced$5 = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : isCallable$q(detection) ? fails$10(detection)
    : !!detection;
};

var normalize = isForced$5.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced$5.data = {};
var NATIVE = isForced$5.NATIVE = 'N';
var POLYFILL = isForced$5.POLYFILL = 'P';

var isForced_1 = isForced$5;

var global$H = global$R;
var getOwnPropertyDescriptor$7 = objectGetOwnPropertyDescriptor.f;
var createNonEnumerableProperty$e = createNonEnumerableProperty$h;
var redefine$k = redefine$l.exports;
var setGlobal = setGlobal$3;
var copyConstructorProperties$1 = copyConstructorProperties$2;
var isForced$4 = isForced_1;

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
  options.name        - the .name of the function if it does not match the key
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global$H;
  } else if (STATIC) {
    target = global$H[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global$H[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$7(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced$4(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties$1(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty$e(sourceProperty, 'sham', true);
    }
    // extend global
    redefine$k(target, key, sourceProperty, options);
  }
};

var classof$d = classofRaw$1;

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray$8 = Array.isArray || function isArray(argument) {
  return classof$d(argument) == 'Array';
};

var wellKnownSymbol$E = wellKnownSymbol$G;

var TO_STRING_TAG$8 = wellKnownSymbol$E('toStringTag');
var test$2 = {};

test$2[TO_STRING_TAG$8] = 'z';

var toStringTagSupport = String(test$2) === '[object z]';

var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
var isCallable$p = isCallable$z;
var classofRaw = classofRaw$1;
var wellKnownSymbol$D = wellKnownSymbol$G;

var TO_STRING_TAG$7 = wellKnownSymbol$D('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof$c = TO_STRING_TAG_SUPPORT$2 ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$7)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && isCallable$p(O.callee) ? 'Arguments' : result;
};

var classof$b = classof$c;

var toString$t = function (argument) {
  if (classof$b(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
  return String(argument);
};

var internalObjectKeys = objectKeysInternal;
var enumBugKeys$1 = enumBugKeys$3;

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
var objectKeys$5 = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys$1);
};

var DESCRIPTORS$v = descriptors;
var definePropertyModule$a = objectDefineProperty;
var anObject$1z = anObject$1C;
var objectKeys$4 = objectKeys$5;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
var objectDefineProperties = DESCRIPTORS$v ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject$1z(O);
  var keys = objectKeys$4(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule$a.f(O, key = keys[index++], Properties[key]);
  return O;
};

var getBuiltIn$s = getBuiltIn$w;

var html$2 = getBuiltIn$s('document', 'documentElement');

/* global ActiveXObject -- old IE, WSH */

var anObject$1y = anObject$1C;
var defineProperties$3 = objectDefineProperties;
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
  activeXDocument = null; // avoid memory leak
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
var objectCreate$1 = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE$2] = anObject$1y(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE$2] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : defineProperties$3(result, Properties);
};

var objectGetOwnPropertyNamesExternal = {};

/* eslint-disable es/no-object-getownpropertynames -- safe */

var toIndexedObject$9 = toIndexedObject$d;
var $getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;

var toString$s = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return $getOwnPropertyNames$1(it);
  } catch (error) {
    return windowNames.slice();
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
  return windowNames && toString$s.call(it) == '[object Window]'
    ? getWindowNames(it)
    : $getOwnPropertyNames$1(toIndexedObject$9(it));
};

var wellKnownSymbolWrapped = {};

var wellKnownSymbol$C = wellKnownSymbol$G;

wellKnownSymbolWrapped.f = wellKnownSymbol$C;

var global$G = global$R;

var path$1 = global$G;

var path = path$1;
var has$e = has$m;
var wrappedWellKnownSymbolModule$1 = wellKnownSymbolWrapped;
var defineProperty$f = objectDefineProperty.f;

var defineWellKnownSymbol$l = function (NAME) {
  var Symbol = path.Symbol || (path.Symbol = {});
  if (!has$e(Symbol, NAME)) defineProperty$f(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule$1.f(NAME)
  });
};

var defineProperty$e = objectDefineProperty.f;
var has$d = has$m;
var wellKnownSymbol$B = wellKnownSymbol$G;

var TO_STRING_TAG$6 = wellKnownSymbol$B('toStringTag');

var setToStringTag$b = function (it, TAG, STATIC) {
  if (it && !has$d(it = STATIC ? it : it.prototype, TO_STRING_TAG$6)) {
    defineProperty$e(it, TO_STRING_TAG$6, { configurable: true, value: TAG });
  }
};

var aCallable$O = aCallable$Q;

// optional / simple context binding
var functionBindContext = function (fn, that, length) {
  aCallable$O(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var fails$$ = fails$15;
var isCallable$o = isCallable$z;
var classof$a = classof$c;
var getBuiltIn$r = getBuiltIn$w;
var inspectSource$1 = inspectSource$4;

var empty = [];
var construct$1 = getBuiltIn$r('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec$1 = constructorRegExp.exec;
var INCORRECT_TO_STRING = !constructorRegExp.exec(function () { /* empty */ });

var isConstructorModern = function (argument) {
  if (!isCallable$o(argument)) return false;
  try {
    construct$1(Object, empty, argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function (argument) {
  if (!isCallable$o(argument)) return false;
  switch (classof$a(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
    // we can't check .prototype since constructors produced by .bind haven't it
  } return INCORRECT_TO_STRING || !!exec$1.call(constructorRegExp, inspectSource$1(argument));
};

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
var isConstructor$7 = !construct$1 || fails$$(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;

var isArray$7 = isArray$8;
var isConstructor$6 = isConstructor$7;
var isObject$w = isObject$C;
var wellKnownSymbol$A = wellKnownSymbol$G;

var SPECIES$6 = wellKnownSymbol$A('species');

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesConstructor$2 = function (originalArray) {
  var C;
  if (isArray$7(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor$6(C) && (C === Array || isArray$7(C.prototype))) C = undefined;
    else if (isObject$w(C)) {
      C = C[SPECIES$6];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

var arraySpeciesConstructor$1 = arraySpeciesConstructor$2;

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate$6 = function (originalArray, length) {
  return new (arraySpeciesConstructor$1(originalArray))(length === 0 ? 0 : length);
};

var bind$q = functionBindContext;
var IndexedObject$5 = indexedObject;
var toObject$x = toObject$z;
var toLength$B = toLength$D;
var arraySpeciesCreate$5 = arraySpeciesCreate$6;

var push$4 = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod$7 = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var IS_FILTER_REJECT = TYPE == 7;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject$x($this);
    var self = IndexedObject$5(O);
    var boundFunction = bind$q(callbackfn, that, 3);
    var length = toLength$B(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate$5;
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
          case 2: push$4.call(target, value); // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push$4.call(target, value); // filterReject
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

var $$4i = _export;
var global$F = global$R;
var getBuiltIn$q = getBuiltIn$w;
var DESCRIPTORS$u = descriptors;
var NATIVE_SYMBOL = nativeSymbol$1;
var fails$_ = fails$15;
var has$c = has$m;
var isArray$6 = isArray$8;
var isCallable$n = isCallable$z;
var isObject$v = isObject$C;
var isSymbol$2 = isSymbol$5;
var anObject$1x = anObject$1C;
var toObject$w = toObject$z;
var toIndexedObject$8 = toIndexedObject$d;
var toPropertyKey$6 = toPropertyKey$9;
var $toString$3 = toString$t;
var createPropertyDescriptor$6 = createPropertyDescriptor$9;
var nativeObjectCreate = objectCreate$1;
var objectKeys$3 = objectKeys$5;
var getOwnPropertyNamesModule$1 = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternal = objectGetOwnPropertyNamesExternal;
var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
var getOwnPropertyDescriptorModule$5 = objectGetOwnPropertyDescriptor;
var definePropertyModule$9 = objectDefineProperty;
var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
var redefine$j = redefine$l.exports;
var shared$3 = shared$7.exports;
var sharedKey$1 = sharedKey$4;
var hiddenKeys$1 = hiddenKeys$6;
var uid$2 = uid$5;
var wellKnownSymbol$z = wellKnownSymbol$G;
var wrappedWellKnownSymbolModule = wellKnownSymbolWrapped;
var defineWellKnownSymbol$k = defineWellKnownSymbol$l;
var setToStringTag$a = setToStringTag$b;
var InternalStateModule$i = internalState;
var $forEach$3 = arrayIteration.forEach;

var HIDDEN = sharedKey$1('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE$1 = 'prototype';
var TO_PRIMITIVE$1 = wellKnownSymbol$z('toPrimitive');
var setInternalState$i = InternalStateModule$i.set;
var getInternalState$h = InternalStateModule$i.getterFor(SYMBOL);
var ObjectPrototype$3 = Object[PROTOTYPE$1];
var $Symbol = global$F.Symbol;
var $stringify$1 = getBuiltIn$q('JSON', 'stringify');
var nativeGetOwnPropertyDescriptor$2 = getOwnPropertyDescriptorModule$5.f;
var nativeDefineProperty$1 = definePropertyModule$9.f;
var nativeGetOwnPropertyNames = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = propertyIsEnumerableModule$1.f;
var AllSymbols = shared$3('symbols');
var ObjectPrototypeSymbols = shared$3('op-symbols');
var StringToSymbolRegistry = shared$3('string-to-symbol-registry');
var SymbolToStringRegistry = shared$3('symbol-to-string-registry');
var WellKnownSymbolsStore = shared$3('wks');
var QObject = global$F.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDescriptor = DESCRIPTORS$u && fails$_(function () {
  return nativeObjectCreate(nativeDefineProperty$1({}, 'a', {
    get: function () { return nativeDefineProperty$1(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$2(ObjectPrototype$3, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype$3[P];
  nativeDefineProperty$1(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype$3) {
    nativeDefineProperty$1(ObjectPrototype$3, P, ObjectPrototypeDescriptor);
  }
} : nativeDefineProperty$1;

var wrap$1 = function (tag, description) {
  var symbol = AllSymbols[tag] = nativeObjectCreate($Symbol[PROTOTYPE$1]);
  setInternalState$i(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!DESCRIPTORS$u) symbol.description = description;
  return symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype$3) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject$1x(O);
  var key = toPropertyKey$6(P);
  anObject$1x(Attributes);
  if (has$c(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!has$c(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor$6(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (has$c(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor$6(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty$1(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject$1x(O);
  var properties = toIndexedObject$8(Properties);
  var keys = objectKeys$3(properties).concat($getOwnPropertySymbols(properties));
  $forEach$3(keys, function (key) {
    if (!DESCRIPTORS$u || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
};

var $propertyIsEnumerable = function propertyIsEnumerable(V) {
  var P = toPropertyKey$6(V);
  var enumerable = nativePropertyIsEnumerable.call(this, P);
  if (this === ObjectPrototype$3 && has$c(AllSymbols, P) && !has$c(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !has$c(this, P) || !has$c(AllSymbols, P) || has$c(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject$8(O);
  var key = toPropertyKey$6(P);
  if (it === ObjectPrototype$3 && has$c(AllSymbols, key) && !has$c(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor$2(it, key);
  if (descriptor && has$c(AllSymbols, key) && !(has$c(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames(toIndexedObject$8(O));
  var result = [];
  $forEach$3(names, function (key) {
    if (!has$c(AllSymbols, key) && !has$c(hiddenKeys$1, key)) result.push(key);
  });
  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$3;
  var names = nativeGetOwnPropertyNames(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject$8(O));
  var result = [];
  $forEach$3(names, function (key) {
    if (has$c(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has$c(ObjectPrototype$3, key))) {
      result.push(AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.es/ecma262/#sec-symbol-constructor
if (!NATIVE_SYMBOL) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : $toString$3(arguments[0]);
    var tag = uid$2(description);
    var setter = function (value) {
      if (this === ObjectPrototype$3) setter.call(ObjectPrototypeSymbols, value);
      if (has$c(this, HIDDEN) && has$c(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDescriptor(this, tag, createPropertyDescriptor$6(1, value));
    };
    if (DESCRIPTORS$u && USE_SETTER) setSymbolDescriptor(ObjectPrototype$3, tag, { configurable: true, set: setter });
    return wrap$1(tag, description);
  };

  redefine$j($Symbol[PROTOTYPE$1], 'toString', function toString() {
    return getInternalState$h(this).tag;
  });

  redefine$j($Symbol, 'withoutSetter', function (description) {
    return wrap$1(uid$2(description), description);
  });

  propertyIsEnumerableModule$1.f = $propertyIsEnumerable;
  definePropertyModule$9.f = $defineProperty;
  getOwnPropertyDescriptorModule$5.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule$1.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule$1.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule.f = function (name) {
    return wrap$1(wellKnownSymbol$z(name), name);
  };

  if (DESCRIPTORS$u) {
    // https://github.com/tc39/proposal-Symbol-description
    nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
      configurable: true,
      get: function description() {
        return getInternalState$h(this).description;
      }
    });
    {
      redefine$j(ObjectPrototype$3, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
    }
  }
}

$$4i({ global: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
  Symbol: $Symbol
});

$forEach$3(objectKeys$3(WellKnownSymbolsStore), function (name) {
  defineWellKnownSymbol$k(name);
});

$$4i({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
  // `Symbol.for` method
  // https://tc39.es/ecma262/#sec-symbol.for
  'for': function (key) {
    var string = $toString$3(key);
    if (has$c(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = $Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
  // `Symbol.keyFor` method
  // https://tc39.es/ecma262/#sec-symbol.keyfor
  keyFor: function keyFor(sym) {
    if (!isSymbol$2(sym)) throw TypeError(sym + ' is not a symbol');
    if (has$c(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$$4i({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS$u }, {
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

$$4i({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames,
  // `Object.getOwnPropertySymbols` method
  // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
$$4i({ target: 'Object', stat: true, forced: fails$_(function () { getOwnPropertySymbolsModule$1.f(1); }) }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return getOwnPropertySymbolsModule$1.f(toObject$w(it));
  }
});

// `JSON.stringify` method behavior with symbols
// https://tc39.es/ecma262/#sec-json.stringify
if ($stringify$1) {
  var FORCED_JSON_STRINGIFY = !NATIVE_SYMBOL || fails$_(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return $stringify$1([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify$1({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || $stringify$1(Object(symbol)) != '{}';
  });

  $$4i({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      var args = [it];
      var index = 1;
      var $replacer;
      while (arguments.length > index) args.push(arguments[index++]);
      $replacer = replacer;
      if (!isObject$v(replacer) && it === undefined || isSymbol$2(it)) return; // IE8 returns string on undefined
      if (!isArray$6(replacer)) replacer = function (key, value) {
        if (isCallable$n($replacer)) value = $replacer.call(this, key, value);
        if (!isSymbol$2(value)) return value;
      };
      args[1] = replacer;
      return $stringify$1.apply(null, args);
    }
  });
}

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE$1]) {
  var valueOf$1 = $Symbol[PROTOTYPE$1].valueOf;
  redefine$j($Symbol[PROTOTYPE$1], TO_PRIMITIVE$1, function () {
    return valueOf$1.apply(this, arguments);
  });
}
// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag$a($Symbol, SYMBOL);

hiddenKeys$1[HIDDEN] = true;

var $$4h = _export;
var DESCRIPTORS$t = descriptors;
var global$E = global$R;
var has$b = has$m;
var isCallable$m = isCallable$z;
var isObject$u = isObject$C;
var defineProperty$d = objectDefineProperty.f;
var copyConstructorProperties = copyConstructorProperties$2;

var NativeSymbol = global$E.Symbol;

if (DESCRIPTORS$t && isCallable$m(NativeSymbol) && (!('description' in NativeSymbol.prototype) ||
  // Safari 12 bug
  NativeSymbol().description !== undefined
)) {
  var EmptyStringDescriptionStore = {};
  // wrap Symbol constructor for correct work with undefined description
  var SymbolWrapper = function Symbol() {
    var description = arguments.length < 1 || arguments[0] === undefined ? undefined : String(arguments[0]);
    var result = this instanceof SymbolWrapper
      ? new NativeSymbol(description)
      // in Edge 13, String(Symbol(undefined)) === 'Symbol(undefined)'
      : description === undefined ? NativeSymbol() : NativeSymbol(description);
    if (description === '') EmptyStringDescriptionStore[result] = true;
    return result;
  };
  copyConstructorProperties(SymbolWrapper, NativeSymbol);
  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
  symbolPrototype.constructor = SymbolWrapper;

  var symbolToString = symbolPrototype.toString;
  var nativeSymbol = String(NativeSymbol('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  defineProperty$d(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject$u(this) ? this.valueOf() : this;
      var string = symbolToString.call(symbol);
      if (has$b(EmptyStringDescriptionStore, symbol)) return '';
      var desc = nativeSymbol ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  $$4h({ global: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}

var defineWellKnownSymbol$j = defineWellKnownSymbol$l;

// `Symbol.asyncIterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.asynciterator
defineWellKnownSymbol$j('asyncIterator');

var defineWellKnownSymbol$i = defineWellKnownSymbol$l;

// `Symbol.hasInstance` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.hasinstance
defineWellKnownSymbol$i('hasInstance');

var defineWellKnownSymbol$h = defineWellKnownSymbol$l;

// `Symbol.isConcatSpreadable` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.isconcatspreadable
defineWellKnownSymbol$h('isConcatSpreadable');

var defineWellKnownSymbol$g = defineWellKnownSymbol$l;

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
defineWellKnownSymbol$g('iterator');

var defineWellKnownSymbol$f = defineWellKnownSymbol$l;

// `Symbol.match` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.match
defineWellKnownSymbol$f('match');

var defineWellKnownSymbol$e = defineWellKnownSymbol$l;

// `Symbol.matchAll` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.matchall
defineWellKnownSymbol$e('matchAll');

var defineWellKnownSymbol$d = defineWellKnownSymbol$l;

// `Symbol.replace` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.replace
defineWellKnownSymbol$d('replace');

var defineWellKnownSymbol$c = defineWellKnownSymbol$l;

// `Symbol.search` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.search
defineWellKnownSymbol$c('search');

var defineWellKnownSymbol$b = defineWellKnownSymbol$l;

// `Symbol.species` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.species
defineWellKnownSymbol$b('species');

var defineWellKnownSymbol$a = defineWellKnownSymbol$l;

// `Symbol.split` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.split
defineWellKnownSymbol$a('split');

var defineWellKnownSymbol$9 = defineWellKnownSymbol$l;

// `Symbol.toPrimitive` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.toprimitive
defineWellKnownSymbol$9('toPrimitive');

var defineWellKnownSymbol$8 = defineWellKnownSymbol$l;

// `Symbol.toStringTag` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.tostringtag
defineWellKnownSymbol$8('toStringTag');

var defineWellKnownSymbol$7 = defineWellKnownSymbol$l;

// `Symbol.unscopables` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.unscopables
defineWellKnownSymbol$7('unscopables');

var fails$Z = fails$15;

var correctPrototypeGetter = !fails$Z(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var has$a = has$m;
var isCallable$l = isCallable$z;
var toObject$v = toObject$z;
var sharedKey = sharedKey$4;
var CORRECT_PROTOTYPE_GETTER$2 = correctPrototypeGetter;

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype$2 = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
var objectGetPrototypeOf$1 = CORRECT_PROTOTYPE_GETTER$2 ? Object.getPrototypeOf : function (O) {
  var object = toObject$v(O);
  if (has$a(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable$l(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof Object ? ObjectPrototype$2 : null;
};

var isCallable$k = isCallable$z;

var aPossiblePrototype$2 = function (argument) {
  if (typeof argument === 'object' || isCallable$k(argument)) return argument;
  throw TypeError("Can't set " + String(argument) + ' as a prototype');
};

/* eslint-disable no-proto -- safe */

var anObject$1w = anObject$1C;
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
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject$1w(O);
    aPossiblePrototype$1(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var isObject$t = isObject$C;
var createNonEnumerableProperty$d = createNonEnumerableProperty$h;

// `InstallErrorCause` abstract operation
// https://tc39.es/proposal-error-cause/#sec-errorobjects-install-error-cause
var installErrorCause$1 = function (O, options) {
  if (isObject$t(options) && 'cause' in options) {
    createNonEnumerableProperty$d(O, 'cause', O.cause);
  }
};

var iterators = {};

var wellKnownSymbol$y = wellKnownSymbol$G;
var Iterators$4 = iterators;

var ITERATOR$a = wellKnownSymbol$y('iterator');
var ArrayPrototype$2 = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod$3 = function (it) {
  return it !== undefined && (Iterators$4.Array === it || ArrayPrototype$2[ITERATOR$a] === it);
};

var classof$9 = classof$c;
var getMethod$f = getMethod$h;
var Iterators$3 = iterators;
var wellKnownSymbol$x = wellKnownSymbol$G;

var ITERATOR$9 = wellKnownSymbol$x('iterator');

var getIteratorMethod$9 = function (it) {
  if (it != undefined) return getMethod$f(it, ITERATOR$9)
    || getMethod$f(it, '@@iterator')
    || Iterators$3[classof$9(it)];
};

var aCallable$N = aCallable$Q;
var anObject$1v = anObject$1C;
var getIteratorMethod$8 = getIteratorMethod$9;

var getIterator$b = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$8(argument) : usingIterator;
  if (aCallable$N(iteratorMethod)) return anObject$1v(iteratorMethod.call(argument));
  throw TypeError(String(argument) + ' is not iterable');
};

var anObject$1u = anObject$1C;
var getMethod$e = getMethod$h;

var iteratorClose$4 = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject$1u(iterator);
  try {
    innerResult = getMethod$e(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = innerResult.call(iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject$1u(innerResult);
  return value;
};

var anObject$1t = anObject$1C;
var isArrayIteratorMethod$2 = isArrayIteratorMethod$3;
var toLength$A = toLength$D;
var bind$p = functionBindContext;
var getIterator$a = getIterator$b;
var getIteratorMethod$7 = getIteratorMethod$9;
var iteratorClose$3 = iteratorClose$4;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var iterate$I = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = bind$p(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose$3(iterator, 'normal', condition);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject$1t(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod$7(iterable);
    if (!iterFn) throw TypeError(String(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod$2(iterFn)) {
      for (index = 0, length = toLength$A(iterable.length); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && result instanceof Result) return result;
      } return new Result(false);
    }
    iterator = getIterator$a(iterable, iterFn);
  }

  next = iterator.next;
  while (!(step = next.call(iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose$3(iterator, 'throw', error);
    }
    if (typeof result == 'object' && result && result instanceof Result) return result;
  } return new Result(false);
};

var $$4g = _export;
var getPrototypeOf$d = objectGetPrototypeOf$1;
var setPrototypeOf$7 = objectSetPrototypeOf$1;
var create$e = objectCreate$1;
var createNonEnumerableProperty$c = createNonEnumerableProperty$h;
var createPropertyDescriptor$5 = createPropertyDescriptor$9;
var installErrorCause = installErrorCause$1;
var iterate$H = iterate$I;
var toString$r = toString$t;

var $AggregateError = function AggregateError(errors, message /* , options */) {
  var that = this;
  if (!(that instanceof $AggregateError)) return new $AggregateError(errors, message);
  if (setPrototypeOf$7) {
    // eslint-disable-next-line unicorn/error-message -- expected
    that = setPrototypeOf$7(new Error(undefined), getPrototypeOf$d(that));
  }
  if (message !== undefined) createNonEnumerableProperty$c(that, 'message', toString$r(message));
  if (arguments.length > 2) installErrorCause(that, arguments[2]);
  var errorsArray = [];
  iterate$H(errors, errorsArray.push, { that: errorsArray });
  createNonEnumerableProperty$c(that, 'errors', errorsArray);
  return that;
};

$AggregateError.prototype = create$e(Error.prototype, {
  constructor: createPropertyDescriptor$5(5, $AggregateError),
  message: createPropertyDescriptor$5(5, ''),
  name: createPropertyDescriptor$5(5, 'AggregateError')
});

// `AggregateError` constructor
// https://tc39.es/ecma262/#sec-aggregate-error-constructor
$$4g({ global: true }, {
  AggregateError: $AggregateError
});

var wellKnownSymbol$w = wellKnownSymbol$G;
var create$d = objectCreate$1;
var definePropertyModule$8 = objectDefineProperty;

var UNSCOPABLES = wellKnownSymbol$w('unscopables');
var ArrayPrototype$1 = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
  definePropertyModule$8.f(ArrayPrototype$1, UNSCOPABLES, {
    configurable: true,
    value: create$d(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables$h = function (key) {
  ArrayPrototype$1[UNSCOPABLES][key] = true;
};

var $$4f = _export;
var toObject$u = toObject$z;
var toLength$z = toLength$D;
var toInteger$f = toInteger$i;
var addToUnscopables$g = addToUnscopables$h;

// `Array.prototype.at` method
// https://github.com/tc39/proposal-relative-indexing-method
$$4f({ target: 'Array', proto: true }, {
  at: function at(index) {
    var O = toObject$u(this);
    var len = toLength$z(O.length);
    var relativeIndex = toInteger$f(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : O[k];
  }
});

addToUnscopables$g('at');

var toPropertyKey$5 = toPropertyKey$9;
var definePropertyModule$7 = objectDefineProperty;
var createPropertyDescriptor$4 = createPropertyDescriptor$9;

var createProperty$7 = function (object, key, value) {
  var propertyKey = toPropertyKey$5(key);
  if (propertyKey in object) definePropertyModule$7.f(object, propertyKey, createPropertyDescriptor$4(0, value));
  else object[propertyKey] = value;
};

var fails$Y = fails$15;
var wellKnownSymbol$v = wellKnownSymbol$G;
var V8_VERSION$2 = engineV8Version;

var SPECIES$5 = wellKnownSymbol$v('species');

var arrayMethodHasSpeciesSupport$5 = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION$2 >= 51 || !fails$Y(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$5] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var $$4e = _export;
var fails$X = fails$15;
var isArray$5 = isArray$8;
var isObject$s = isObject$C;
var toObject$t = toObject$z;
var toLength$y = toLength$D;
var createProperty$6 = createProperty$7;
var arraySpeciesCreate$4 = arraySpeciesCreate$6;
var arrayMethodHasSpeciesSupport$4 = arrayMethodHasSpeciesSupport$5;
var wellKnownSymbol$u = wellKnownSymbol$G;
var V8_VERSION$1 = engineV8Version;

var IS_CONCAT_SPREADABLE = wellKnownSymbol$u('isConcatSpreadable');
var MAX_SAFE_INTEGER$2 = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION$1 >= 51 || !fails$X(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport$4('concat');

var isConcatSpreadable = function (O) {
  if (!isObject$s(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray$5(O);
};

var FORCED$u = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$$4e({ target: 'Array', proto: true, forced: FORCED$u }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    var O = toObject$t(this);
    var A = arraySpeciesCreate$4(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = toLength$y(E.length);
        if (n + len > MAX_SAFE_INTEGER$2) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty$6(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER$2) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty$6(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var toObject$s = toObject$z;
var toAbsoluteIndex$6 = toAbsoluteIndex$8;
var toLength$x = toLength$D;

var min$8 = Math.min;

// `Array.prototype.copyWithin` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
// eslint-disable-next-line es/no-array-prototype-copywithin -- safe
var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject$s(this);
  var len = toLength$x(O.length);
  var to = toAbsoluteIndex$6(target, len);
  var from = toAbsoluteIndex$6(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = min$8((end === undefined ? len : toAbsoluteIndex$6(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else delete O[to];
    to += inc;
    from += inc;
  } return O;
};

var $$4d = _export;
var copyWithin = arrayCopyWithin;
var addToUnscopables$f = addToUnscopables$h;

// `Array.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
$$4d({ target: 'Array', proto: true }, {
  copyWithin: copyWithin
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$f('copyWithin');

var fails$W = fails$15;

var arrayMethodIsStrict$9 = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails$W(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal -- required for testing
    method.call(null, argument || function () { throw 1; }, 1);
  });
};

var $$4c = _export;
var $every$2 = arrayIteration.every;
var arrayMethodIsStrict$8 = arrayMethodIsStrict$9;

var STRICT_METHOD$8 = arrayMethodIsStrict$8('every');

// `Array.prototype.every` method
// https://tc39.es/ecma262/#sec-array.prototype.every
$$4c({ target: 'Array', proto: true, forced: !STRICT_METHOD$8 }, {
  every: function every(callbackfn /* , thisArg */) {
    return $every$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var toObject$r = toObject$z;
var toAbsoluteIndex$5 = toAbsoluteIndex$8;
var toLength$w = toLength$D;

// `Array.prototype.fill` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.fill
var arrayFill$1 = function fill(value /* , start = 0, end = @length */) {
  var O = toObject$r(this);
  var length = toLength$w(O.length);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex$5(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex$5(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

var $$4b = _export;
var fill = arrayFill$1;
var addToUnscopables$e = addToUnscopables$h;

// `Array.prototype.fill` method
// https://tc39.es/ecma262/#sec-array.prototype.fill
$$4b({ target: 'Array', proto: true }, {
  fill: fill
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$e('fill');

var $$4a = _export;
var $filter$1 = arrayIteration.filter;
var arrayMethodHasSpeciesSupport$3 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport$3('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$$4a({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$49 = _export;
var $find$2 = arrayIteration.find;
var addToUnscopables$d = addToUnscopables$h;

var FIND = 'find';
var SKIPS_HOLES$1 = true;

// Shouldn't skip holes
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES$1 = false; });

// `Array.prototype.find` method
// https://tc39.es/ecma262/#sec-array.prototype.find
$$49({ target: 'Array', proto: true, forced: SKIPS_HOLES$1 }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$d(FIND);

var $$48 = _export;
var $findIndex$1 = arrayIteration.findIndex;
var addToUnscopables$c = addToUnscopables$h;

var FIND_INDEX = 'findIndex';
var SKIPS_HOLES = true;

// Shouldn't skip holes
if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

// `Array.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findindex
$$48({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $findIndex$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$c(FIND_INDEX);

var isArray$4 = isArray$8;
var toLength$v = toLength$D;
var bind$o = functionBindContext;

// `FlattenIntoArray` abstract operation
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var flattenIntoArray$2 = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? bind$o(mapper, thisArg, 3) : false;
  var element;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

      if (depth > 0 && isArray$4(element)) {
        targetIndex = flattenIntoArray$2(target, original, element, toLength$v(element.length), targetIndex, depth - 1) - 1;
      } else {
        if (targetIndex >= 0x1FFFFFFFFFFFFF) throw TypeError('Exceed the acceptable array length');
        target[targetIndex] = element;
      }

      targetIndex++;
    }
    sourceIndex++;
  }
  return targetIndex;
};

var flattenIntoArray_1 = flattenIntoArray$2;

var $$47 = _export;
var flattenIntoArray$1 = flattenIntoArray_1;
var toObject$q = toObject$z;
var toLength$u = toLength$D;
var toInteger$e = toInteger$i;
var arraySpeciesCreate$3 = arraySpeciesCreate$6;

// `Array.prototype.flat` method
// https://tc39.es/ecma262/#sec-array.prototype.flat
$$47({ target: 'Array', proto: true }, {
  flat: function flat(/* depthArg = 1 */) {
    var depthArg = arguments.length ? arguments[0] : undefined;
    var O = toObject$q(this);
    var sourceLen = toLength$u(O.length);
    var A = arraySpeciesCreate$3(O, 0);
    A.length = flattenIntoArray$1(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toInteger$e(depthArg));
    return A;
  }
});

var $$46 = _export;
var flattenIntoArray = flattenIntoArray_1;
var aCallable$M = aCallable$Q;
var toObject$p = toObject$z;
var toLength$t = toLength$D;
var arraySpeciesCreate$2 = arraySpeciesCreate$6;

// `Array.prototype.flatMap` method
// https://tc39.es/ecma262/#sec-array.prototype.flatmap
$$46({ target: 'Array', proto: true }, {
  flatMap: function flatMap(callbackfn /* , thisArg */) {
    var O = toObject$p(this);
    var sourceLen = toLength$t(O.length);
    var A;
    aCallable$M(callbackfn);
    A = arraySpeciesCreate$2(O, 0);
    A.length = flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return A;
  }
});

var $forEach$2 = arrayIteration.forEach;
var arrayMethodIsStrict$7 = arrayMethodIsStrict$9;

var STRICT_METHOD$7 = arrayMethodIsStrict$7('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = !STRICT_METHOD$7 ? function forEach(callbackfn /* , thisArg */) {
  return $forEach$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
} : [].forEach;

var $$45 = _export;
var forEach$2 = arrayForEach;

// `Array.prototype.forEach` method
// https://tc39.es/ecma262/#sec-array.prototype.foreach
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
$$45({ target: 'Array', proto: true, forced: [].forEach != forEach$2 }, {
  forEach: forEach$2
});

var anObject$1s = anObject$1C;
var iteratorClose$2 = iteratorClose$4;

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing$3 = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject$1s(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose$2(iterator, 'throw', error);
  }
};

var bind$n = functionBindContext;
var toObject$o = toObject$z;
var callWithSafeIterationClosing$2 = callWithSafeIterationClosing$3;
var isArrayIteratorMethod$1 = isArrayIteratorMethod$3;
var isConstructor$5 = isConstructor$7;
var toLength$s = toLength$D;
var createProperty$5 = createProperty$7;
var getIterator$9 = getIterator$b;
var getIteratorMethod$6 = getIteratorMethod$9;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
var arrayFrom$1 = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject$o(arrayLike);
  var IS_CONSTRUCTOR = isConstructor$5(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  if (mapping) mapfn = bind$n(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  var iteratorMethod = getIteratorMethod$6(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod && !(this == Array && isArrayIteratorMethod$1(iteratorMethod))) {
    iterator = getIterator$9(O, iteratorMethod);
    next = iterator.next;
    result = IS_CONSTRUCTOR ? new this() : [];
    for (;!(step = next.call(iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing$2(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty$5(result, index, value);
    }
  } else {
    length = toLength$s(O.length);
    result = IS_CONSTRUCTOR ? new this(length) : Array(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty$5(result, index, value);
    }
  }
  result.length = index;
  return result;
};

var wellKnownSymbol$t = wellKnownSymbol$G;

var ITERATOR$8 = wellKnownSymbol$t('iterator');
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
  iteratorWithReturn[ITERATOR$8] = function () {
    return this;
  };
  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration$4 = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$8] = function () {
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

var $$44 = _export;
var from$5 = arrayFrom$1;
var checkCorrectnessOfIteration$3 = checkCorrectnessOfIteration$4;

var INCORRECT_ITERATION$1 = !checkCorrectnessOfIteration$3(function (iterable) {
  // eslint-disable-next-line es/no-array-from -- required for testing
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
$$44({ target: 'Array', stat: true, forced: INCORRECT_ITERATION$1 }, {
  from: from$5
});

var $$43 = _export;
var $includes$1 = arrayIncludes.includes;
var addToUnscopables$b = addToUnscopables$h;

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$$43({ target: 'Array', proto: true }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes$1(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$b('includes');

/* eslint-disable es/no-array-prototype-indexof -- required for testing */
var $$42 = _export;
var $indexOf$1 = arrayIncludes.indexOf;
var arrayMethodIsStrict$6 = arrayMethodIsStrict$9;

var nativeIndexOf = [].indexOf;

var NEGATIVE_ZERO$1 = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
var STRICT_METHOD$6 = arrayMethodIsStrict$6('indexOf');

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
$$42({ target: 'Array', proto: true, forced: NEGATIVE_ZERO$1 || !STRICT_METHOD$6 }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return NEGATIVE_ZERO$1
      // convert -0 to +0
      ? nativeIndexOf.apply(this, arguments) || 0
      : $indexOf$1(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$41 = _export;
var isArray$3 = isArray$8;

// `Array.isArray` method
// https://tc39.es/ecma262/#sec-array.isarray
$$41({ target: 'Array', stat: true }, {
  isArray: isArray$3
});

var fails$V = fails$15;
var isCallable$j = isCallable$z;
var getPrototypeOf$c = objectGetPrototypeOf$1;
var redefine$i = redefine$l.exports;
var wellKnownSymbol$s = wellKnownSymbol$G;

var ITERATOR$7 = wellKnownSymbol$s('iterator');
var BUGGY_SAFARI_ITERATORS$1 = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype$5, PrototypeOfArrayIteratorPrototype, arrayIterator$1;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator$1 = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator$1)) BUGGY_SAFARI_ITERATORS$1 = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf$c(getPrototypeOf$c(arrayIterator$1));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$5 = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = IteratorPrototype$5 == undefined || fails$V(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype$5[ITERATOR$7].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$5 = {};

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable$j(IteratorPrototype$5[ITERATOR$7])) {
  redefine$i(IteratorPrototype$5, ITERATOR$7, function () {
    return this;
  });
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype$5,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
};

var IteratorPrototype$4 = iteratorsCore.IteratorPrototype;
var create$c = objectCreate$1;
var createPropertyDescriptor$3 = createPropertyDescriptor$9;
var setToStringTag$9 = setToStringTag$b;
var Iterators$2 = iterators;

var returnThis$1 = function () { return this; };

var createIteratorConstructor$7 = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create$c(IteratorPrototype$4, { next: createPropertyDescriptor$3(1, next) });
  setToStringTag$9(IteratorConstructor, TO_STRING_TAG, false);
  Iterators$2[TO_STRING_TAG] = returnThis$1;
  return IteratorConstructor;
};

var $$40 = _export;
var FunctionName$1 = functionName;
var isCallable$i = isCallable$z;
var createIteratorConstructor$6 = createIteratorConstructor$7;
var getPrototypeOf$b = objectGetPrototypeOf$1;
var setPrototypeOf$6 = objectSetPrototypeOf$1;
var setToStringTag$8 = setToStringTag$b;
var createNonEnumerableProperty$b = createNonEnumerableProperty$h;
var redefine$h = redefine$l.exports;
var wellKnownSymbol$r = wellKnownSymbol$G;
var Iterators$1 = iterators;
var IteratorsCore = iteratorsCore;

var PROPER_FUNCTION_NAME$4 = FunctionName$1.PROPER;
var CONFIGURABLE_FUNCTION_NAME$1 = FunctionName$1.CONFIGURABLE;
var IteratorPrototype$3 = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$6 = wellKnownSymbol$r('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

var defineIterator$3 = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor$6(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$6]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf$b(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (getPrototypeOf$b(CurrentIteratorPrototype) !== IteratorPrototype$3) {
        if (setPrototypeOf$6) {
          setPrototypeOf$6(CurrentIteratorPrototype, IteratorPrototype$3);
        } else if (!isCallable$i(CurrentIteratorPrototype[ITERATOR$6])) {
          redefine$h(CurrentIteratorPrototype, ITERATOR$6, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag$8(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME$4 && DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if (CONFIGURABLE_FUNCTION_NAME$1) {
      createNonEnumerableProperty$b(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return nativeIterator.call(this); };
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
        redefine$h(IterablePrototype, KEY, methods[KEY]);
      }
    } else $$40({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if (IterablePrototype[ITERATOR$6] !== defaultIterator) {
    redefine$h(IterablePrototype, ITERATOR$6, defaultIterator, { name: DEFAULT });
  }
  Iterators$1[NAME] = defaultIterator;

  return methods;
};

var toIndexedObject$7 = toIndexedObject$d;
var addToUnscopables$a = addToUnscopables$h;
var Iterators = iterators;
var InternalStateModule$h = internalState;
var defineIterator$2 = defineIterator$3;

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$h = InternalStateModule$h.set;
var getInternalState$g = InternalStateModule$h.getterFor(ARRAY_ITERATOR);

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
  setInternalState$h(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject$7(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$g(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
Iterators.Arguments = Iterators.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$a('keys');
addToUnscopables$a('values');
addToUnscopables$a('entries');

var $$3$ = _export;
var IndexedObject$4 = indexedObject;
var toIndexedObject$6 = toIndexedObject$d;
var arrayMethodIsStrict$5 = arrayMethodIsStrict$9;

var nativeJoin = [].join;

var ES3_STRINGS = IndexedObject$4 != Object;
var STRICT_METHOD$5 = arrayMethodIsStrict$5('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
$$3$({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$5 }, {
  join: function join(separator) {
    return nativeJoin.call(toIndexedObject$6(this), separator === undefined ? ',' : separator);
  }
});

/* eslint-disable es/no-array-prototype-lastindexof -- safe */
var toIndexedObject$5 = toIndexedObject$d;
var toInteger$d = toInteger$i;
var toLength$r = toLength$D;
var arrayMethodIsStrict$4 = arrayMethodIsStrict$9;

var min$7 = Math.min;
var $lastIndexOf$1 = [].lastIndexOf;
var NEGATIVE_ZERO = !!$lastIndexOf$1 && 1 / [1].lastIndexOf(1, -0) < 0;
var STRICT_METHOD$4 = arrayMethodIsStrict$4('lastIndexOf');
var FORCED$t = NEGATIVE_ZERO || !STRICT_METHOD$4;

// `Array.prototype.lastIndexOf` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
var arrayLastIndexOf = FORCED$t ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
  // convert -0 to +0
  if (NEGATIVE_ZERO) return $lastIndexOf$1.apply(this, arguments) || 0;
  var O = toIndexedObject$5(this);
  var length = toLength$r(O.length);
  var index = length - 1;
  if (arguments.length > 1) index = min$7(index, toInteger$d(arguments[1]));
  if (index < 0) index = length + index;
  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
  return -1;
} : $lastIndexOf$1;

var $$3_ = _export;
var lastIndexOf = arrayLastIndexOf;

// `Array.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
// eslint-disable-next-line es/no-array-prototype-lastindexof -- required for testing
$$3_({ target: 'Array', proto: true, forced: lastIndexOf !== [].lastIndexOf }, {
  lastIndexOf: lastIndexOf
});

var $$3Z = _export;
var $map$1 = arrayIteration.map;
var arrayMethodHasSpeciesSupport$2 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport$2('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
$$3Z({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3Y = _export;
var fails$U = fails$15;
var isConstructor$4 = isConstructor$7;
var createProperty$4 = createProperty$7;

var ISNT_GENERIC = fails$U(function () {
  function F() { /* empty */ }
  // eslint-disable-next-line es/no-array-of -- required for testing
  return !(Array.of.call(F) instanceof F);
});

// `Array.of` method
// https://tc39.es/ecma262/#sec-array.of
// WebKit Array.of isn't generic
$$3Y({ target: 'Array', stat: true, forced: ISNT_GENERIC }, {
  of: function of(/* ...args */) {
    var index = 0;
    var argumentsLength = arguments.length;
    var result = new (isConstructor$4(this) ? this : Array)(argumentsLength);
    while (argumentsLength > index) createProperty$4(result, index, arguments[index++]);
    result.length = argumentsLength;
    return result;
  }
});

var aCallable$L = aCallable$Q;
var toObject$n = toObject$z;
var IndexedObject$3 = indexedObject;
var toLength$q = toLength$D;

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod$6 = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    aCallable$L(callbackfn);
    var O = toObject$n(that);
    var self = IndexedObject$3(O);
    var length = toLength$q(O.length);
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
        throw TypeError('Reduce of empty array with no initial value');
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
  left: createMethod$6(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod$6(true)
};

var classof$8 = classofRaw$1;
var global$D = global$R;

var engineIsNode = classof$8(global$D.process) == 'process';

var $$3X = _export;
var $reduce$1 = arrayReduce.left;
var arrayMethodIsStrict$3 = arrayMethodIsStrict$9;
var CHROME_VERSION$1 = engineV8Version;
var IS_NODE$5 = engineIsNode;

var STRICT_METHOD$3 = arrayMethodIsStrict$3('reduce');
// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG$1 = !IS_NODE$5 && CHROME_VERSION$1 > 79 && CHROME_VERSION$1 < 83;

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
$$3X({ target: 'Array', proto: true, forced: !STRICT_METHOD$3 || CHROME_BUG$1 }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce$1(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3W = _export;
var $reduceRight$1 = arrayReduce.right;
var arrayMethodIsStrict$2 = arrayMethodIsStrict$9;
var CHROME_VERSION = engineV8Version;
var IS_NODE$4 = engineIsNode;

var STRICT_METHOD$2 = arrayMethodIsStrict$2('reduceRight');
// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !IS_NODE$4 && CHROME_VERSION > 79 && CHROME_VERSION < 83;

// `Array.prototype.reduceRight` method
// https://tc39.es/ecma262/#sec-array.prototype.reduceright
$$3W({ target: 'Array', proto: true, forced: !STRICT_METHOD$2 || CHROME_BUG }, {
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return $reduceRight$1(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3V = _export;
var isArray$2 = isArray$8;

var nativeReverse = [].reverse;
var test$1 = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.es/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
$$3V({ target: 'Array', proto: true, forced: String(test$1) === String(test$1.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign -- dirty hack
    if (isArray$2(this)) this.length = this.length;
    return nativeReverse.call(this);
  }
});

var $$3U = _export;
var isArray$1 = isArray$8;
var isConstructor$3 = isConstructor$7;
var isObject$r = isObject$C;
var toAbsoluteIndex$4 = toAbsoluteIndex$8;
var toLength$p = toLength$D;
var toIndexedObject$4 = toIndexedObject$d;
var createProperty$3 = createProperty$7;
var wellKnownSymbol$q = wellKnownSymbol$G;
var arrayMethodHasSpeciesSupport$1 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport$1('slice');

var SPECIES$4 = wellKnownSymbol$q('species');
var nativeSlice = [].slice;
var max$5 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$$3U({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
  slice: function slice(start, end) {
    var O = toIndexedObject$4(this);
    var length = toLength$p(O.length);
    var k = toAbsoluteIndex$4(start, length);
    var fin = toAbsoluteIndex$4(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray$1(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (isConstructor$3(Constructor) && (Constructor === Array || isArray$1(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject$r(Constructor)) {
        Constructor = Constructor[SPECIES$4];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array || Constructor === undefined) {
        return nativeSlice.call(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array : Constructor)(max$5(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty$3(result, n, O[k]);
    result.length = n;
    return result;
  }
});

var $$3T = _export;
var $some$2 = arrayIteration.some;
var arrayMethodIsStrict$1 = arrayMethodIsStrict$9;

var STRICT_METHOD$1 = arrayMethodIsStrict$1('some');

// `Array.prototype.some` method
// https://tc39.es/ecma262/#sec-array.prototype.some
$$3T({ target: 'Array', proto: true, forced: !STRICT_METHOD$1 }, {
  some: function some(callbackfn /* , thisArg */) {
    return $some$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// TODO: use something more complex like timsort?
var floor$9 = Math.floor;

var mergeSort = function (array, comparefn) {
  var length = array.length;
  var middle = floor$9(length / 2);
  return length < 8 ? insertionSort(array, comparefn) : merge(
    mergeSort(array.slice(0, middle), comparefn),
    mergeSort(array.slice(middle), comparefn),
    comparefn
  );
};

var insertionSort = function (array, comparefn) {
  var length = array.length;
  var i = 1;
  var element, j;

  while (i < length) {
    j = i;
    element = array[i];
    while (j && comparefn(array[j - 1], element) > 0) {
      array[j] = array[--j];
    }
    if (j !== i++) array[j] = element;
  } return array;
};

var merge = function (left, right, comparefn) {
  var llength = left.length;
  var rlength = right.length;
  var lindex = 0;
  var rindex = 0;
  var result = [];

  while (lindex < llength || rindex < rlength) {
    if (lindex < llength && rindex < rlength) {
      result.push(comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]);
    } else {
      result.push(lindex < llength ? left[lindex++] : right[rindex++]);
    }
  } return result;
};

var arraySort = mergeSort;

var userAgent$6 = engineUserAgent;

var firefox = userAgent$6.match(/firefox\/(\d+)/i);

var engineFfVersion = !!firefox && +firefox[1];

var UA = engineUserAgent;

var engineIsIeOrEdge = /MSIE|Trident/.test(UA);

var userAgent$5 = engineUserAgent;

var webkit = userAgent$5.match(/AppleWebKit\/(\d+)\./);

var engineWebkitVersion = !!webkit && +webkit[1];

var $$3S = _export;
var aCallable$K = aCallable$Q;
var toObject$m = toObject$z;
var toLength$o = toLength$D;
var toString$q = toString$t;
var fails$T = fails$15;
var internalSort$1 = arraySort;
var arrayMethodIsStrict = arrayMethodIsStrict$9;
var FF$1 = engineFfVersion;
var IE_OR_EDGE$1 = engineIsIeOrEdge;
var V8$1 = engineV8Version;
var WEBKIT$2 = engineWebkitVersion;

var test = [];
var nativeSort$1 = test.sort;

// IE8-
var FAILS_ON_UNDEFINED = fails$T(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails$T(function () {
  test.sort(null);
});
// Old WebKit
var STRICT_METHOD = arrayMethodIsStrict('sort');

var STABLE_SORT$1 = !fails$T(function () {
  // feature detection can be too slow, so check engines versions
  if (V8$1) return V8$1 < 70;
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

var FORCED$s = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD || !STABLE_SORT$1;

var getSortCompare$1 = function (comparefn) {
  return function (x, y) {
    if (y === undefined) return -1;
    if (x === undefined) return 1;
    if (comparefn !== undefined) return +comparefn(x, y) || 0;
    return toString$q(x) > toString$q(y) ? 1 : -1;
  };
};

// `Array.prototype.sort` method
// https://tc39.es/ecma262/#sec-array.prototype.sort
$$3S({ target: 'Array', proto: true, forced: FORCED$s }, {
  sort: function sort(comparefn) {
    if (comparefn !== undefined) aCallable$K(comparefn);

    var array = toObject$m(this);

    if (STABLE_SORT$1) return comparefn === undefined ? nativeSort$1.call(array) : nativeSort$1.call(array, comparefn);

    var items = [];
    var arrayLength = toLength$o(array.length);
    var itemsLength, index;

    for (index = 0; index < arrayLength; index++) {
      if (index in array) items.push(array[index]);
    }

    items = internalSort$1(items, getSortCompare$1(comparefn));
    itemsLength = items.length;
    index = 0;

    while (index < itemsLength) array[index] = items[index++];
    while (index < arrayLength) delete array[index++];

    return array;
  }
});

var getBuiltIn$p = getBuiltIn$w;
var definePropertyModule$6 = objectDefineProperty;
var wellKnownSymbol$p = wellKnownSymbol$G;
var DESCRIPTORS$s = descriptors;

var SPECIES$3 = wellKnownSymbol$p('species');

var setSpecies$7 = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn$p(CONSTRUCTOR_NAME);
  var defineProperty = definePropertyModule$6.f;

  if (DESCRIPTORS$s && Constructor && !Constructor[SPECIES$3]) {
    defineProperty(Constructor, SPECIES$3, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var setSpecies$6 = setSpecies$7;

// `Array[@@species]` getter
// https://tc39.es/ecma262/#sec-get-array-@@species
setSpecies$6('Array');

var $$3R = _export;
var toAbsoluteIndex$3 = toAbsoluteIndex$8;
var toInteger$c = toInteger$i;
var toLength$n = toLength$D;
var toObject$l = toObject$z;
var arraySpeciesCreate$1 = arraySpeciesCreate$6;
var createProperty$2 = createProperty$7;
var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

var max$4 = Math.max;
var min$6 = Math.min;
var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
// with adding support of @@species
$$3R({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject$l(this);
    var len = toLength$n(O.length);
    var actualStart = toAbsoluteIndex$3(start, len);
    var argumentsLength = arguments.length;
    var insertCount, actualDeleteCount, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min$6(max$4(toInteger$c(deleteCount), 0), len - actualStart);
    }
    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER$1) {
      throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
    }
    A = arraySpeciesCreate$1(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty$2(A, k, O[from]);
    }
    A.length = actualDeleteCount;
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (from in O) O[to] = O[from];
        else delete O[to];
      }
      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (from in O) O[to] = O[from];
        else delete O[to];
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    O.length = len - actualDeleteCount + insertCount;
    return A;
  }
});

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$9 = addToUnscopables$h;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$9('flat');

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$8 = addToUnscopables$h;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$8('flatMap');

// eslint-disable-next-line es/no-typed-arrays -- safe
var arrayBufferNative = typeof ArrayBuffer !== 'undefined' && typeof DataView !== 'undefined';

var redefine$g = redefine$l.exports;

var redefineAll$a = function (target, src, options) {
  for (var key in src) redefine$g(target, key, src[key], options);
  return target;
};

var anInstance$b = function (it, Constructor, name) {
  if (it instanceof Constructor) return it;
  throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
};

var toInteger$b = toInteger$i;
var toLength$m = toLength$D;

// `ToIndex` abstract operation
// https://tc39.es/ecma262/#sec-toindex
var toIndex$2 = function (it) {
  if (it === undefined) return 0;
  var number = toInteger$b(it);
  var length = toLength$m(number);
  if (number !== length) throw RangeError('Wrong length or index');
  return length;
};

// IEEE754 conversions based on https://github.com/feross/ieee754
var abs$7 = Math.abs;
var pow$4 = Math.pow;
var floor$8 = Math.floor;
var log$8 = Math.log;
var LN2$2 = Math.LN2;

var pack = function (number, mantissaLength, bytes) {
  var buffer = new Array(bytes);
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var rt = mantissaLength === 23 ? pow$4(2, -24) - pow$4(2, -77) : 0;
  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
  var index = 0;
  var exponent, mantissa, c;
  number = abs$7(number);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (number != number || number === Infinity) {
    // eslint-disable-next-line no-self-compare -- NaN check
    mantissa = number != number ? 1 : 0;
    exponent = eMax;
  } else {
    exponent = floor$8(log$8(number) / LN2$2);
    if (number * (c = pow$4(2, -exponent)) < 1) {
      exponent--;
      c *= 2;
    }
    if (exponent + eBias >= 1) {
      number += rt / c;
    } else {
      number += rt * pow$4(2, 1 - eBias);
    }
    if (number * c >= 2) {
      exponent++;
      c /= 2;
    }
    if (exponent + eBias >= eMax) {
      mantissa = 0;
      exponent = eMax;
    } else if (exponent + eBias >= 1) {
      mantissa = (number * c - 1) * pow$4(2, mantissaLength);
      exponent = exponent + eBias;
    } else {
      mantissa = number * pow$4(2, eBias - 1) * pow$4(2, mantissaLength);
      exponent = 0;
    }
  }
  for (; mantissaLength >= 8; buffer[index++] = mantissa & 255, mantissa /= 256, mantissaLength -= 8);
  exponent = exponent << mantissaLength | mantissa;
  exponentLength += mantissaLength;
  for (; exponentLength > 0; buffer[index++] = exponent & 255, exponent /= 256, exponentLength -= 8);
  buffer[--index] |= sign * 128;
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
  for (; nBits > 0; exponent = exponent * 256 + buffer[index], index--, nBits -= 8);
  mantissa = exponent & (1 << -nBits) - 1;
  exponent >>= -nBits;
  nBits += mantissaLength;
  for (; nBits > 0; mantissa = mantissa * 256 + buffer[index], index--, nBits -= 8);
  if (exponent === 0) {
    exponent = 1 - eBias;
  } else if (exponent === eMax) {
    return mantissa ? NaN : sign ? -Infinity : Infinity;
  } else {
    mantissa = mantissa + pow$4(2, mantissaLength);
    exponent = exponent - eBias;
  } return (sign ? -1 : 1) * mantissa * pow$4(2, exponent - mantissaLength);
};

var ieee754 = {
  pack: pack,
  unpack: unpack
};

var global$C = global$R;
var DESCRIPTORS$r = descriptors;
var NATIVE_ARRAY_BUFFER$2 = arrayBufferNative;
var FunctionName = functionName;
var createNonEnumerableProperty$a = createNonEnumerableProperty$h;
var redefineAll$9 = redefineAll$a;
var fails$S = fails$15;
var anInstance$a = anInstance$b;
var toInteger$a = toInteger$i;
var toLength$l = toLength$D;
var toIndex$1 = toIndex$2;
var IEEE754 = ieee754;
var getPrototypeOf$a = objectGetPrototypeOf$1;
var setPrototypeOf$5 = objectSetPrototypeOf$1;
var getOwnPropertyNames$4 = objectGetOwnPropertyNames.f;
var defineProperty$c = objectDefineProperty.f;
var arrayFill = arrayFill$1;
var setToStringTag$7 = setToStringTag$b;
var InternalStateModule$g = internalState;

var PROPER_FUNCTION_NAME$3 = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var getInternalState$f = InternalStateModule$g.get;
var setInternalState$g = InternalStateModule$g.set;
var ARRAY_BUFFER$1 = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var WRONG_LENGTH$1 = 'Wrong length';
var WRONG_INDEX = 'Wrong index';
var NativeArrayBuffer$1 = global$C[ARRAY_BUFFER$1];
var $ArrayBuffer = NativeArrayBuffer$1;
var $DataView = global$C[DATA_VIEW];
var $DataViewPrototype = $DataView && $DataView[PROTOTYPE];
var ObjectPrototype$1 = Object.prototype;
var RangeError$2 = global$C.RangeError;

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
  return packIEEE754(number, 23, 4);
};

var packFloat64 = function (number) {
  return packIEEE754(number, 52, 8);
};

var addGetter$1 = function (Constructor, key) {
  defineProperty$c(Constructor[PROTOTYPE], key, { get: function () { return getInternalState$f(this)[key]; } });
};

var get$1 = function (view, count, index, isLittleEndian) {
  var intIndex = toIndex$1(index);
  var store = getInternalState$f(view);
  if (intIndex + count > store.byteLength) throw RangeError$2(WRONG_INDEX);
  var bytes = getInternalState$f(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = bytes.slice(start, start + count);
  return isLittleEndian ? pack : pack.reverse();
};

var set$2 = function (view, count, index, conversion, value, isLittleEndian) {
  var intIndex = toIndex$1(index);
  var store = getInternalState$f(view);
  if (intIndex + count > store.byteLength) throw RangeError$2(WRONG_INDEX);
  var bytes = getInternalState$f(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = conversion(+value);
  for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
};

if (!NATIVE_ARRAY_BUFFER$2) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance$a(this, $ArrayBuffer, ARRAY_BUFFER$1);
    var byteLength = toIndex$1(length);
    setInternalState$g(this, {
      bytes: arrayFill.call(new Array(byteLength), 0),
      byteLength: byteLength
    });
    if (!DESCRIPTORS$r) this.byteLength = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance$a(this, $DataView, DATA_VIEW);
    anInstance$a(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = getInternalState$f(buffer).byteLength;
    var offset = toInteger$a(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError$2('Wrong offset');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength$l(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError$2(WRONG_LENGTH$1);
    setInternalState$g(this, {
      buffer: buffer,
      byteLength: byteLength,
      byteOffset: offset
    });
    if (!DESCRIPTORS$r) {
      this.buffer = buffer;
      this.byteLength = byteLength;
      this.byteOffset = offset;
    }
  };

  if (DESCRIPTORS$r) {
    addGetter$1($ArrayBuffer, 'byteLength');
    addGetter$1($DataView, 'buffer');
    addGetter$1($DataView, 'byteLength');
    addGetter$1($DataView, 'byteOffset');
  }

  redefineAll$9($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset) {
      return get$1(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get$1(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /* , littleEndian */) {
      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /* , littleEndian */) {
      var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined));
    },
    getUint32: function getUint32(byteOffset /* , littleEndian */) {
      return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined)) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 23);
    },
    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get$1(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 52);
    },
    setInt8: function setInt8(byteOffset, value) {
      set$2(this, 1, byteOffset, packInt8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set$2(this, 1, byteOffset, packInt8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set$2(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set$2(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set$2(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set$2(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set$2(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set$2(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : undefined);
    }
  });
} else {
  var INCORRECT_ARRAY_BUFFER_NAME = PROPER_FUNCTION_NAME$3 && NativeArrayBuffer$1.name !== ARRAY_BUFFER$1;
  /* eslint-disable no-new -- required for testing */
  if (!fails$S(function () {
    NativeArrayBuffer$1(1);
  }) || !fails$S(function () {
    new NativeArrayBuffer$1(-1);
  }) || fails$S(function () {
    new NativeArrayBuffer$1();
    new NativeArrayBuffer$1(1.5);
    new NativeArrayBuffer$1(NaN);
    return INCORRECT_ARRAY_BUFFER_NAME && !CONFIGURABLE_FUNCTION_NAME;
  })) {
  /* eslint-enable no-new -- required for testing */
    $ArrayBuffer = function ArrayBuffer(length) {
      anInstance$a(this, $ArrayBuffer);
      return new NativeArrayBuffer$1(toIndex$1(length));
    };
    var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE] = NativeArrayBuffer$1[PROTOTYPE];
    for (var keys$2 = getOwnPropertyNames$4(NativeArrayBuffer$1), j$1 = 0, key$1; keys$2.length > j$1;) {
      if (!((key$1 = keys$2[j$1++]) in $ArrayBuffer)) {
        createNonEnumerableProperty$a($ArrayBuffer, key$1, NativeArrayBuffer$1[key$1]);
      }
    }
    ArrayBufferPrototype.constructor = $ArrayBuffer;
  } else if (INCORRECT_ARRAY_BUFFER_NAME && CONFIGURABLE_FUNCTION_NAME) {
    createNonEnumerableProperty$a(NativeArrayBuffer$1, 'name', ARRAY_BUFFER$1);
  }

  // WebKit bug - the same parent prototype for typed arrays and data view
  if (setPrototypeOf$5 && getPrototypeOf$a($DataViewPrototype) !== ObjectPrototype$1) {
    setPrototypeOf$5($DataViewPrototype, ObjectPrototype$1);
  }

  // iOS Safari 7.x bug
  var testView = new $DataView(new $ArrayBuffer(2));
  var $setInt8 = $DataViewPrototype.setInt8;
  testView.setInt8(0, 2147483648);
  testView.setInt8(1, 2147483649);
  if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll$9($DataViewPrototype, {
    setInt8: function setInt8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, { unsafe: true });
}

setToStringTag$7($ArrayBuffer, ARRAY_BUFFER$1);
setToStringTag$7($DataView, DATA_VIEW);

var arrayBuffer = {
  ArrayBuffer: $ArrayBuffer,
  DataView: $DataView
};

var $$3Q = _export;
var global$B = global$R;
var arrayBufferModule = arrayBuffer;
var setSpecies$5 = setSpecies$7;

var ARRAY_BUFFER = 'ArrayBuffer';
var ArrayBuffer$4 = arrayBufferModule[ARRAY_BUFFER];
var NativeArrayBuffer = global$B[ARRAY_BUFFER];

// `ArrayBuffer` constructor
// https://tc39.es/ecma262/#sec-arraybuffer-constructor
$$3Q({ global: true, forced: NativeArrayBuffer !== ArrayBuffer$4 }, {
  ArrayBuffer: ArrayBuffer$4
});

setSpecies$5(ARRAY_BUFFER);

var NATIVE_ARRAY_BUFFER$1 = arrayBufferNative;
var DESCRIPTORS$q = descriptors;
var global$A = global$R;
var isCallable$h = isCallable$z;
var isObject$q = isObject$C;
var has$9 = has$m;
var classof$7 = classof$c;
var tryToString$1 = tryToString$3;
var createNonEnumerableProperty$9 = createNonEnumerableProperty$h;
var redefine$f = redefine$l.exports;
var defineProperty$b = objectDefineProperty.f;
var getPrototypeOf$9 = objectGetPrototypeOf$1;
var setPrototypeOf$4 = objectSetPrototypeOf$1;
var wellKnownSymbol$o = wellKnownSymbol$G;
var uid$1 = uid$5;

var Int8Array$3 = global$A.Int8Array;
var Int8ArrayPrototype = Int8Array$3 && Int8Array$3.prototype;
var Uint8ClampedArray = global$A.Uint8ClampedArray;
var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
var TypedArray$1 = Int8Array$3 && getPrototypeOf$9(Int8Array$3);
var TypedArrayPrototype$1 = Int8ArrayPrototype && getPrototypeOf$9(Int8ArrayPrototype);
var ObjectPrototype = Object.prototype;
var isPrototypeOf$2 = ObjectPrototype.isPrototypeOf;

var TO_STRING_TAG$5 = wellKnownSymbol$o('toStringTag');
var TYPED_ARRAY_TAG$1 = uid$1('TYPED_ARRAY_TAG');
var TYPED_ARRAY_CONSTRUCTOR$2 = uid$1('TYPED_ARRAY_CONSTRUCTOR');
// Fixing native typed arrays in Opera Presto crashes the browser, see #595
var NATIVE_ARRAY_BUFFER_VIEWS$3 = NATIVE_ARRAY_BUFFER$1 && !!setPrototypeOf$4 && classof$7(global$A.opera) !== 'Opera';
var TYPED_ARRAY_TAG_REQIRED = false;
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
  if (!isObject$q(it)) return false;
  var klass = classof$7(it);
  return klass === 'DataView'
    || has$9(TypedArrayConstructorsList, klass)
    || has$9(BigIntArrayConstructorsList, klass);
};

var isTypedArray$1 = function (it) {
  if (!isObject$q(it)) return false;
  var klass = classof$7(it);
  return has$9(TypedArrayConstructorsList, klass)
    || has$9(BigIntArrayConstructorsList, klass);
};

var aTypedArray$t = function (it) {
  if (isTypedArray$1(it)) return it;
  throw TypeError('Target is not a typed array');
};

var aTypedArrayConstructor$5 = function (C) {
  if (isCallable$h(C) && (!setPrototypeOf$4 || isPrototypeOf$2.call(TypedArray$1, C))) return C;
  throw TypeError(tryToString$1(C) + ' is not a typed array constructor');
};

var exportTypedArrayMethod$u = function (KEY, property, forced) {
  if (!DESCRIPTORS$q) return;
  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
    var TypedArrayConstructor = global$A[ARRAY];
    if (TypedArrayConstructor && has$9(TypedArrayConstructor.prototype, KEY)) try {
      delete TypedArrayConstructor.prototype[KEY];
    } catch (error) { /* empty */ }
  }
  if (!TypedArrayPrototype$1[KEY] || forced) {
    redefine$f(TypedArrayPrototype$1, KEY, forced ? property
      : NATIVE_ARRAY_BUFFER_VIEWS$3 && Int8ArrayPrototype[KEY] || property);
  }
};

var exportTypedArrayStaticMethod$3 = function (KEY, property, forced) {
  var ARRAY, TypedArrayConstructor;
  if (!DESCRIPTORS$q) return;
  if (setPrototypeOf$4) {
    if (forced) for (ARRAY in TypedArrayConstructorsList) {
      TypedArrayConstructor = global$A[ARRAY];
      if (TypedArrayConstructor && has$9(TypedArrayConstructor, KEY)) try {
        delete TypedArrayConstructor[KEY];
      } catch (error) { /* empty */ }
    }
    if (!TypedArray$1[KEY] || forced) {
      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
      try {
        return redefine$f(TypedArray$1, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS$3 && TypedArray$1[KEY] || property);
      } catch (error) { /* empty */ }
    } else return;
  }
  for (ARRAY in TypedArrayConstructorsList) {
    TypedArrayConstructor = global$A[ARRAY];
    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
      redefine$f(TypedArrayConstructor, KEY, property);
    }
  }
};

for (NAME$1 in TypedArrayConstructorsList) {
  Constructor = global$A[NAME$1];
  Prototype = Constructor && Constructor.prototype;
  if (Prototype) createNonEnumerableProperty$9(Prototype, TYPED_ARRAY_CONSTRUCTOR$2, Constructor);
  else NATIVE_ARRAY_BUFFER_VIEWS$3 = false;
}

for (NAME$1 in BigIntArrayConstructorsList) {
  Constructor = global$A[NAME$1];
  Prototype = Constructor && Constructor.prototype;
  if (Prototype) createNonEnumerableProperty$9(Prototype, TYPED_ARRAY_CONSTRUCTOR$2, Constructor);
}

// WebKit bug - typed arrays constructors prototype is Object.prototype
if (!NATIVE_ARRAY_BUFFER_VIEWS$3 || !isCallable$h(TypedArray$1) || TypedArray$1 === Function.prototype) {
  // eslint-disable-next-line no-shadow -- safe
  TypedArray$1 = function TypedArray() {
    throw TypeError('Incorrect invocation');
  };
  if (NATIVE_ARRAY_BUFFER_VIEWS$3) for (NAME$1 in TypedArrayConstructorsList) {
    if (global$A[NAME$1]) setPrototypeOf$4(global$A[NAME$1], TypedArray$1);
  }
}

if (!NATIVE_ARRAY_BUFFER_VIEWS$3 || !TypedArrayPrototype$1 || TypedArrayPrototype$1 === ObjectPrototype) {
  TypedArrayPrototype$1 = TypedArray$1.prototype;
  if (NATIVE_ARRAY_BUFFER_VIEWS$3) for (NAME$1 in TypedArrayConstructorsList) {
    if (global$A[NAME$1]) setPrototypeOf$4(global$A[NAME$1].prototype, TypedArrayPrototype$1);
  }
}

// WebKit bug - one more object in Uint8ClampedArray prototype chain
if (NATIVE_ARRAY_BUFFER_VIEWS$3 && getPrototypeOf$9(Uint8ClampedArrayPrototype) !== TypedArrayPrototype$1) {
  setPrototypeOf$4(Uint8ClampedArrayPrototype, TypedArrayPrototype$1);
}

if (DESCRIPTORS$q && !has$9(TypedArrayPrototype$1, TO_STRING_TAG$5)) {
  TYPED_ARRAY_TAG_REQIRED = true;
  defineProperty$b(TypedArrayPrototype$1, TO_STRING_TAG$5, { get: function () {
    return isObject$q(this) ? this[TYPED_ARRAY_TAG$1] : undefined;
  } });
  for (NAME$1 in TypedArrayConstructorsList) if (global$A[NAME$1]) {
    createNonEnumerableProperty$9(global$A[NAME$1], TYPED_ARRAY_TAG$1, NAME$1);
  }
}

var arrayBufferViewCore = {
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS$3,
  TYPED_ARRAY_CONSTRUCTOR: TYPED_ARRAY_CONSTRUCTOR$2,
  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG$1,
  aTypedArray: aTypedArray$t,
  aTypedArrayConstructor: aTypedArrayConstructor$5,
  exportTypedArrayMethod: exportTypedArrayMethod$u,
  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod$3,
  isView: isView,
  isTypedArray: isTypedArray$1,
  TypedArray: TypedArray$1,
  TypedArrayPrototype: TypedArrayPrototype$1
};

var $$3P = _export;
var ArrayBufferViewCore$x = arrayBufferViewCore;

var NATIVE_ARRAY_BUFFER_VIEWS$2 = ArrayBufferViewCore$x.NATIVE_ARRAY_BUFFER_VIEWS;

// `ArrayBuffer.isView` method
// https://tc39.es/ecma262/#sec-arraybuffer.isview
$$3P({ target: 'ArrayBuffer', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS$2 }, {
  isView: ArrayBufferViewCore$x.isView
});

var isConstructor$2 = isConstructor$7;
var tryToString = tryToString$3;

// `Assert: IsConstructor(argument) is true`
var aConstructor$5 = function (argument) {
  if (isConstructor$2(argument)) return argument;
  throw TypeError(tryToString(argument) + ' is not a constructor');
};

var anObject$1r = anObject$1C;
var aConstructor$4 = aConstructor$5;
var wellKnownSymbol$n = wellKnownSymbol$G;

var SPECIES$2 = wellKnownSymbol$n('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor$f = function (O, defaultConstructor) {
  var C = anObject$1r(O).constructor;
  var S;
  return C === undefined || (S = anObject$1r(C)[SPECIES$2]) == undefined ? defaultConstructor : aConstructor$4(S);
};

var $$3O = _export;
var fails$R = fails$15;
var ArrayBufferModule$2 = arrayBuffer;
var anObject$1q = anObject$1C;
var toAbsoluteIndex$2 = toAbsoluteIndex$8;
var toLength$k = toLength$D;
var speciesConstructor$e = speciesConstructor$f;

var ArrayBuffer$3 = ArrayBufferModule$2.ArrayBuffer;
var DataView$2 = ArrayBufferModule$2.DataView;
var nativeArrayBufferSlice = ArrayBuffer$3.prototype.slice;

var INCORRECT_SLICE = fails$R(function () {
  return !new ArrayBuffer$3(2).slice(1, undefined).byteLength;
});

// `ArrayBuffer.prototype.slice` method
// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
$$3O({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  slice: function slice(start, end) {
    if (nativeArrayBufferSlice !== undefined && end === undefined) {
      return nativeArrayBufferSlice.call(anObject$1q(this), start); // FF fix
    }
    var length = anObject$1q(this).byteLength;
    var first = toAbsoluteIndex$2(start, length);
    var fin = toAbsoluteIndex$2(end === undefined ? length : end, length);
    var result = new (speciesConstructor$e(this, ArrayBuffer$3))(toLength$k(fin - first));
    var viewSource = new DataView$2(this);
    var viewTarget = new DataView$2(result);
    var index = 0;
    while (first < fin) {
      viewTarget.setUint8(index++, viewSource.getUint8(first++));
    } return result;
  }
});

var $$3N = _export;
var ArrayBufferModule$1 = arrayBuffer;
var NATIVE_ARRAY_BUFFER = arrayBufferNative;

// `DataView` constructor
// https://tc39.es/ecma262/#sec-dataview-constructor
$$3N({ global: true, forced: !NATIVE_ARRAY_BUFFER }, {
  DataView: ArrayBufferModule$1.DataView
});

var $$3M = _export;
var fails$Q = fails$15;

var FORCED$r = fails$Q(function () {
  return new Date(16e11).getYear() !== 120;
});

var getFullYear = Date.prototype.getFullYear;

// `Date.prototype.getYear` method
// https://tc39.es/ecma262/#sec-date.prototype.getyear
$$3M({ target: 'Date', proto: true, forced: FORCED$r }, {
  getYear: function getYear() {
    return getFullYear.call(this) - 1900;
  }
});

var $$3L = _export;

// `Date.now` method
// https://tc39.es/ecma262/#sec-date.now
$$3L({ target: 'Date', stat: true }, {
  now: function now() {
    return new Date().getTime();
  }
});

var $$3K = _export;
var toInteger$9 = toInteger$i;

var getTime$2 = Date.prototype.getTime;
var setFullYear = Date.prototype.setFullYear;

// `Date.prototype.setYear` method
// https://tc39.es/ecma262/#sec-date.prototype.setyear
$$3K({ target: 'Date', proto: true }, {
  setYear: function setYear(year) {
    // validate
    getTime$2.call(this);
    var yi = toInteger$9(year);
    var yyyy = 0 <= yi && yi <= 99 ? yi + 1900 : yi;
    return setFullYear.call(this, yyyy);
  }
});

var $$3J = _export;

// `Date.prototype.toGMTString` method
// https://tc39.es/ecma262/#sec-date.prototype.togmtstring
$$3J({ target: 'Date', proto: true }, {
  toGMTString: Date.prototype.toUTCString
});

var toInteger$8 = toInteger$i;
var toString$p = toString$t;
var requireObjectCoercible$g = requireObjectCoercible$j;

// `String.prototype.repeat` method implementation
// https://tc39.es/ecma262/#sec-string.prototype.repeat
var stringRepeat = function repeat(count) {
  var str = toString$p(requireObjectCoercible$g(this));
  var result = '';
  var n = toInteger$8(count);
  if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
  return result;
};

// https://github.com/tc39/proposal-string-pad-start-end
var toLength$j = toLength$D;
var toString$o = toString$t;
var repeat$2 = stringRepeat;
var requireObjectCoercible$f = requireObjectCoercible$j;

var ceil$1 = Math.ceil;

// `String.prototype.{ padStart, padEnd }` methods implementation
var createMethod$5 = function (IS_END) {
  return function ($this, maxLength, fillString) {
    var S = toString$o(requireObjectCoercible$f($this));
    var stringLength = S.length;
    var fillStr = fillString === undefined ? ' ' : toString$o(fillString);
    var intMaxLength = toLength$j(maxLength);
    var fillLen, stringFiller;
    if (intMaxLength <= stringLength || fillStr == '') return S;
    fillLen = intMaxLength - stringLength;
    stringFiller = repeat$2.call(fillStr, ceil$1(fillLen / fillStr.length));
    if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
    return IS_END ? S + stringFiller : stringFiller + S;
  };
};

var stringPad = {
  // `String.prototype.padStart` method
  // https://tc39.es/ecma262/#sec-string.prototype.padstart
  start: createMethod$5(false),
  // `String.prototype.padEnd` method
  // https://tc39.es/ecma262/#sec-string.prototype.padend
  end: createMethod$5(true)
};

var fails$P = fails$15;
var padStart = stringPad.start;

var abs$6 = Math.abs;
var DatePrototype$2 = Date.prototype;
var getTime$1 = DatePrototype$2.getTime;
var nativeDateToISOString = DatePrototype$2.toISOString;

// `Date.prototype.toISOString` method implementation
// https://tc39.es/ecma262/#sec-date.prototype.toisostring
// PhantomJS / old WebKit fails here:
var dateToIsoString = (fails$P(function () {
  return nativeDateToISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
}) || !fails$P(function () {
  nativeDateToISOString.call(new Date(NaN));
})) ? function toISOString() {
  if (!isFinite(getTime$1.call(this))) throw RangeError('Invalid time value');
  var date = this;
  var year = date.getUTCFullYear();
  var milliseconds = date.getUTCMilliseconds();
  var sign = year < 0 ? '-' : year > 9999 ? '+' : '';
  return sign + padStart(abs$6(year), sign ? 6 : 4, 0) +
    '-' + padStart(date.getUTCMonth() + 1, 2, 0) +
    '-' + padStart(date.getUTCDate(), 2, 0) +
    'T' + padStart(date.getUTCHours(), 2, 0) +
    ':' + padStart(date.getUTCMinutes(), 2, 0) +
    ':' + padStart(date.getUTCSeconds(), 2, 0) +
    '.' + padStart(milliseconds, 3, 0) +
    'Z';
} : nativeDateToISOString;

var $$3I = _export;
var toISOString = dateToIsoString;

// `Date.prototype.toISOString` method
// https://tc39.es/ecma262/#sec-date.prototype.toisostring
// PhantomJS / old WebKit has a broken implementations
$$3I({ target: 'Date', proto: true, forced: Date.prototype.toISOString !== toISOString }, {
  toISOString: toISOString
});

var $$3H = _export;
var fails$O = fails$15;
var toObject$k = toObject$z;
var toPrimitive$1 = toPrimitive$3;

var FORCED$q = fails$O(function () {
  return new Date(NaN).toJSON() !== null
    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
});

// `Date.prototype.toJSON` method
// https://tc39.es/ecma262/#sec-date.prototype.tojson
$$3H({ target: 'Date', proto: true, forced: FORCED$q }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  toJSON: function toJSON(key) {
    var O = toObject$k(this);
    var pv = toPrimitive$1(O, 'number');
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});

var anObject$1p = anObject$1C;
var ordinaryToPrimitive = ordinaryToPrimitive$2;

// `Date.prototype[@@toPrimitive](hint)` method implementation
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
var dateToPrimitive$1 = function (hint) {
  anObject$1p(this);
  if (hint === 'string' || hint === 'default') hint = 'string';
  else if (hint !== 'number') throw TypeError('Incorrect hint');
  return ordinaryToPrimitive(this, hint);
};

var redefine$e = redefine$l.exports;
var dateToPrimitive = dateToPrimitive$1;
var wellKnownSymbol$m = wellKnownSymbol$G;

var TO_PRIMITIVE = wellKnownSymbol$m('toPrimitive');
var DatePrototype$1 = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
if (!(TO_PRIMITIVE in DatePrototype$1)) {
  redefine$e(DatePrototype$1, TO_PRIMITIVE, dateToPrimitive);
}

var redefine$d = redefine$l.exports;

var DatePrototype = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING$1 = 'toString';
var nativeDateToString = DatePrototype[TO_STRING$1];
var getTime = DatePrototype.getTime;

// `Date.prototype.toString` method
// https://tc39.es/ecma262/#sec-date.prototype.tostring
if (String(new Date(NaN)) != INVALID_DATE) {
  redefine$d(DatePrototype, TO_STRING$1, function toString() {
    var value = getTime.call(this);
    // eslint-disable-next-line no-self-compare -- NaN check
    return value === value ? nativeDateToString.call(this) : INVALID_DATE;
  });
}

var $$3G = _export;
var toString$n = toString$t;

var raw = /[\w*+\-./@]/;

var hex$1 = function (code, length) {
  var result = code.toString(16);
  while (result.length < length) result = '0' + result;
  return result;
};

// `escape` method
// https://tc39.es/ecma262/#sec-escape-string
$$3G({ global: true }, {
  escape: function escape(string) {
    var str = toString$n(string);
    var result = '';
    var length = str.length;
    var index = 0;
    var chr, code;
    while (index < length) {
      chr = str.charAt(index++);
      if (raw.test(chr)) {
        result += chr;
      } else {
        code = chr.charCodeAt(0);
        if (code < 256) {
          result += '%' + hex$1(code, 2);
        } else {
          result += '%u' + hex$1(code, 4).toUpperCase();
        }
      }
    } return result;
  }
});

var aCallable$J = aCallable$Q;
var isObject$p = isObject$C;

var slice$2 = [].slice;
var factories = {};

var construct = function (C, argsLength, args) {
  if (!(argsLength in factories)) {
    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
    // eslint-disable-next-line no-new-func -- we have no proper alternatives, IE8- only
    factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
  } return factories[argsLength](C, args);
};

// `Function.prototype.bind` method implementation
// https://tc39.es/ecma262/#sec-function.prototype.bind
var functionBind = Function.bind || function bind(that /* , ...args */) {
  var fn = aCallable$J(this);
  var partArgs = slice$2.call(arguments, 1);
  var boundFunction = function bound(/* args... */) {
    var args = partArgs.concat(slice$2.call(arguments));
    return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
  };
  if (isObject$p(fn.prototype)) boundFunction.prototype = fn.prototype;
  return boundFunction;
};

var $$3F = _export;
var bind$m = functionBind;

// `Function.prototype.bind` method
// https://tc39.es/ecma262/#sec-function.prototype.bind
$$3F({ target: 'Function', proto: true }, {
  bind: bind$m
});

var isCallable$g = isCallable$z;
var isObject$o = isObject$C;
var definePropertyModule$5 = objectDefineProperty;
var getPrototypeOf$8 = objectGetPrototypeOf$1;
var wellKnownSymbol$l = wellKnownSymbol$G;

var HAS_INSTANCE = wellKnownSymbol$l('hasInstance');
var FunctionPrototype$1 = Function.prototype;

// `Function.prototype[@@hasInstance]` method
// https://tc39.es/ecma262/#sec-function.prototype-@@hasinstance
if (!(HAS_INSTANCE in FunctionPrototype$1)) {
  definePropertyModule$5.f(FunctionPrototype$1, HAS_INSTANCE, { value: function (O) {
    if (!isCallable$g(this) || !isObject$o(O)) return false;
    if (!isObject$o(this.prototype)) return O instanceof this;
    // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
    while (O = getPrototypeOf$8(O)) if (this.prototype === O) return true;
    return false;
  } });
}

var DESCRIPTORS$p = descriptors;
var FUNCTION_NAME_EXISTS = functionName.EXISTS;
var defineProperty$a = objectDefineProperty.f;

var FunctionPrototype = Function.prototype;
var FunctionPrototypeToString = FunctionPrototype.toString;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (DESCRIPTORS$p && !FUNCTION_NAME_EXISTS) {
  defineProperty$a(FunctionPrototype, NAME, {
    configurable: true,
    get: function () {
      try {
        return FunctionPrototypeToString.call(this).match(nameRE)[1];
      } catch (error) {
        return '';
      }
    }
  });
}

var $$3E = _export;
var global$z = global$R;

// `globalThis` object
// https://tc39.es/ecma262/#sec-globalthis
$$3E({ global: true }, {
  globalThis: global$z
});

var $$3D = _export;
var getBuiltIn$o = getBuiltIn$w;
var fails$N = fails$15;

var $stringify = getBuiltIn$o('JSON', 'stringify');
var re = /[\uD800-\uDFFF]/g;
var low = /^[\uD800-\uDBFF]$/;
var hi = /^[\uDC00-\uDFFF]$/;

var fix = function (match, offset, string) {
  var prev = string.charAt(offset - 1);
  var next = string.charAt(offset + 1);
  if ((low.test(match) && !hi.test(next)) || (hi.test(match) && !low.test(prev))) {
    return '\\u' + match.charCodeAt(0).toString(16);
  } return match;
};

var FORCED$p = fails$N(function () {
  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify('\uDEAD') !== '"\\udead"';
});

if ($stringify) {
  // `JSON.stringify` method
  // https://tc39.es/ecma262/#sec-json.stringify
  // https://github.com/tc39/proposal-well-formed-stringify
  $$3D({ target: 'JSON', stat: true, forced: FORCED$p }, {
    // eslint-disable-next-line no-unused-vars -- required for `.length`
    stringify: function stringify(it, replacer, space) {
      var result = $stringify.apply(null, arguments);
      return typeof result == 'string' ? result.replace(re, fix) : result;
    }
  });
}

var global$y = global$R;
var setToStringTag$6 = setToStringTag$b;

// JSON[@@toStringTag] property
// https://tc39.es/ecma262/#sec-json-@@tostringtag
setToStringTag$6(global$y.JSON, 'JSON', true);

var internalMetadata = {exports: {}};

var fails$M = fails$15;

var freezing = !fails$M(function () {
  // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
  return Object.isExtensible(Object.preventExtensions({}));
});

var $$3C = _export;
var hiddenKeys = hiddenKeys$6;
var isObject$n = isObject$C;
var has$8 = has$m;
var defineProperty$9 = objectDefineProperty.f;
var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternalModule = objectGetOwnPropertyNamesExternal;
var uid = uid$5;
var FREEZING$4 = freezing;

var REQUIRED = false;
var METADATA = uid('meta');
var id$1 = 0;

// eslint-disable-next-line es/no-object-isextensible -- safe
var isExtensible$1 = Object.isExtensible || function () {
  return true;
};

var setMetadata = function (it) {
  defineProperty$9(it, METADATA, { value: {
    objectID: 'O' + id$1++, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey$1 = function (it, create) {
  // return a primitive with prefix
  if (!isObject$n(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has$8(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible$1(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMetadata(it);
  // return object ID
  } return it[METADATA].objectID;
};

var getWeakData$1 = function (it, create) {
  if (!has$8(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible$1(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMetadata(it);
  // return the store of weak collections IDs
  } return it[METADATA].weakData;
};

// add metadata on freeze-family methods calling
var onFreeze$3 = function (it) {
  if (FREEZING$4 && REQUIRED && isExtensible$1(it) && !has$8(it, METADATA)) setMetadata(it);
  return it;
};

var enable = function () {
  meta.enable = function () { /* empty */ };
  REQUIRED = true;
  var getOwnPropertyNames = getOwnPropertyNamesModule.f;
  var splice = [].splice;
  var test = {};
  test[METADATA] = 1;

  // prevent exposing of metadata key
  if (getOwnPropertyNames(test).length) {
    getOwnPropertyNamesModule.f = function (it) {
      var result = getOwnPropertyNames(it);
      for (var i = 0, length = result.length; i < length; i++) {
        if (result[i] === METADATA) {
          splice.call(result, i, 1);
          break;
        }
      } return result;
    };

    $$3C({ target: 'Object', stat: true, forced: true }, {
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

hiddenKeys[METADATA] = true;

var isCallable$f = isCallable$z;
var isObject$m = isObject$C;
var setPrototypeOf$3 = objectSetPrototypeOf$1;

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired$4 = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf$3 &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable$f(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject$m(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf$3($this, NewTargetPrototype);
  return $this;
};

var $$3B = _export;
var global$x = global$R;
var isForced$3 = isForced_1;
var redefine$c = redefine$l.exports;
var InternalMetadataModule$1 = internalMetadata.exports;
var iterate$G = iterate$I;
var anInstance$9 = anInstance$b;
var isCallable$e = isCallable$z;
var isObject$l = isObject$C;
var fails$L = fails$15;
var checkCorrectnessOfIteration$2 = checkCorrectnessOfIteration$4;
var setToStringTag$5 = setToStringTag$b;
var inheritIfRequired$3 = inheritIfRequired$4;

var collection$4 = function (CONSTRUCTOR_NAME, wrapper, common) {
  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
  var ADDER = IS_MAP ? 'set' : 'add';
  var NativeConstructor = global$x[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var exported = {};

  var fixMethod = function (KEY) {
    var nativeMethod = NativePrototype[KEY];
    redefine$c(NativePrototype, KEY,
      KEY == 'add' ? function add(value) {
        nativeMethod.call(this, value === 0 ? 0 : value);
        return this;
      } : KEY == 'delete' ? function (key) {
        return IS_WEAK && !isObject$l(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'get' ? function get(key) {
        return IS_WEAK && !isObject$l(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'has' ? function has(key) {
        return IS_WEAK && !isObject$l(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        nativeMethod.call(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  var REPLACE = isForced$3(
    CONSTRUCTOR_NAME,
    !isCallable$e(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails$L(function () {
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
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails$L(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new -- required for testing
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration$2(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails$L(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance$9(dummy, Constructor, CONSTRUCTOR_NAME);
        var that = inheritIfRequired$3(new NativeConstructor(), dummy, Constructor);
        if (iterable != undefined) iterate$G(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
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
  $$3B({ global: true, forced: Constructor != NativeConstructor }, exported);

  setToStringTag$5(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};

var defineProperty$8 = objectDefineProperty.f;
var create$b = objectCreate$1;
var redefineAll$8 = redefineAll$a;
var bind$l = functionBindContext;
var anInstance$8 = anInstance$b;
var iterate$F = iterate$I;
var defineIterator$1 = defineIterator$3;
var setSpecies$4 = setSpecies$7;
var DESCRIPTORS$o = descriptors;
var fastKey = internalMetadata.exports.fastKey;
var InternalStateModule$f = internalState;

var setInternalState$f = InternalStateModule$f.set;
var internalStateGetterFor$1 = InternalStateModule$f.getterFor;

var collectionStrong$2 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance$8(that, C, CONSTRUCTOR_NAME);
      setInternalState$f(that, {
        type: CONSTRUCTOR_NAME,
        index: create$b(null),
        first: undefined,
        last: undefined,
        size: 0
      });
      if (!DESCRIPTORS$o) that.size = 0;
      if (iterable != undefined) iterate$F(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

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
          next: undefined,
          removed: false
        };
        if (!state.first) state.first = entry;
        if (previous) previous.next = entry;
        if (DESCRIPTORS$o) state.size++;
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
        if (entry.key == key) return entry;
      }
    };

    redefineAll$8(C.prototype, {
      // `{ Map, Set }.prototype.clear()` methods
      // https://tc39.es/ecma262/#sec-map.prototype.clear
      // https://tc39.es/ecma262/#sec-set.prototype.clear
      clear: function clear() {
        var that = this;
        var state = getInternalState(that);
        var data = state.index;
        var entry = state.first;
        while (entry) {
          entry.removed = true;
          if (entry.previous) entry.previous = entry.previous.next = undefined;
          delete data[entry.index];
          entry = entry.next;
        }
        state.first = state.last = undefined;
        if (DESCRIPTORS$o) state.size = 0;
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
          if (state.first == entry) state.first = next;
          if (state.last == entry) state.last = prev;
          if (DESCRIPTORS$o) state.size--;
          else that.size--;
        } return !!entry;
      },
      // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.foreach
      // https://tc39.es/ecma262/#sec-set.prototype.foreach
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind$l(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
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

    redefineAll$8(C.prototype, IS_MAP ? {
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
    if (DESCRIPTORS$o) defineProperty$8(C.prototype, 'size', {
      get: function () {
        return getInternalState(this).size;
      }
    });
    return C;
  },
  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
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
    defineIterator$1(C, CONSTRUCTOR_NAME, function (iterated, kind) {
      setInternalState$f(this, {
        type: ITERATOR_NAME,
        target: iterated,
        state: getInternalCollectionState(iterated),
        kind: kind,
        last: undefined
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
        state.target = undefined;
        return { value: undefined, done: true };
      }
      // return step by kind
      if (kind == 'keys') return { value: entry.key, done: false };
      if (kind == 'values') return { value: entry.value, done: false };
      return { value: [entry.key, entry.value], done: false };
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
var es_map = collection$3('Map', function (init) {
  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong$1);

var log$7 = Math.log;

// `Math.log1p` method implementation
// https://tc39.es/ecma262/#sec-math.log1p
// eslint-disable-next-line es/no-math-log1p -- safe
var mathLog1p = Math.log1p || function log1p(x) {
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log$7(1 + x);
};

var $$3A = _export;
var log1p$1 = mathLog1p;

// eslint-disable-next-line es/no-math-acosh -- required for testing
var $acosh = Math.acosh;
var log$6 = Math.log;
var sqrt$2 = Math.sqrt;
var LN2$1 = Math.LN2;

var FORCED$o = !$acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  || Math.floor($acosh(Number.MAX_VALUE)) != 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  || $acosh(Infinity) != Infinity;

// `Math.acosh` method
// https://tc39.es/ecma262/#sec-math.acosh
$$3A({ target: 'Math', stat: true, forced: FORCED$o }, {
  acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? log$6(x) + LN2$1
      : log1p$1(x - 1 + sqrt$2(x - 1) * sqrt$2(x + 1));
  }
});

var $$3z = _export;

// eslint-disable-next-line es/no-math-asinh -- required for testing
var $asinh = Math.asinh;
var log$5 = Math.log;
var sqrt$1 = Math.sqrt;

function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log$5(x + sqrt$1(x * x + 1));
}

// `Math.asinh` method
// https://tc39.es/ecma262/#sec-math.asinh
// Tor Browser bug: Math.asinh(0) -> -0
$$3z({ target: 'Math', stat: true, forced: !($asinh && 1 / $asinh(0) > 0) }, {
  asinh: asinh
});

var $$3y = _export;

// eslint-disable-next-line es/no-math-atanh -- required for testing
var $atanh = Math.atanh;
var log$4 = Math.log;

// `Math.atanh` method
// https://tc39.es/ecma262/#sec-math.atanh
// Tor Browser bug: Math.atanh(-0) -> 0
$$3y({ target: 'Math', stat: true, forced: !($atanh && 1 / $atanh(-0) < 0) }, {
  atanh: function atanh(x) {
    return (x = +x) == 0 ? x : log$4((1 + x) / (1 - x)) / 2;
  }
});

// `Math.sign` method implementation
// https://tc39.es/ecma262/#sec-math.sign
// eslint-disable-next-line es/no-math-sign -- safe
var mathSign = Math.sign || function sign(x) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};

var $$3x = _export;
var sign$2 = mathSign;

var abs$5 = Math.abs;
var pow$3 = Math.pow;

// `Math.cbrt` method
// https://tc39.es/ecma262/#sec-math.cbrt
$$3x({ target: 'Math', stat: true }, {
  cbrt: function cbrt(x) {
    return sign$2(x = +x) * pow$3(abs$5(x), 1 / 3);
  }
});

var $$3w = _export;

var floor$7 = Math.floor;
var log$3 = Math.log;
var LOG2E = Math.LOG2E;

// `Math.clz32` method
// https://tc39.es/ecma262/#sec-math.clz32
$$3w({ target: 'Math', stat: true }, {
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - floor$7(log$3(x + 0.5) * LOG2E) : 32;
  }
});

// eslint-disable-next-line es/no-math-expm1 -- safe
var $expm1 = Math.expm1;
var exp$2 = Math.exp;

// `Math.expm1` method implementation
// https://tc39.es/ecma262/#sec-math.expm1
var mathExpm1 = (!$expm1
  // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) != -2e-17
) ? function expm1(x) {
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp$2(x) - 1;
} : $expm1;

var $$3v = _export;
var expm1$3 = mathExpm1;

// eslint-disable-next-line es/no-math-cosh -- required for testing
var $cosh = Math.cosh;
var abs$4 = Math.abs;
var E$1 = Math.E;

// `Math.cosh` method
// https://tc39.es/ecma262/#sec-math.cosh
$$3v({ target: 'Math', stat: true, forced: !$cosh || $cosh(710) === Infinity }, {
  cosh: function cosh(x) {
    var t = expm1$3(abs$4(x) - 1) + 1;
    return (t + 1 / (t * E$1 * E$1)) * (E$1 / 2);
  }
});

var $$3u = _export;
var expm1$2 = mathExpm1;

// `Math.expm1` method
// https://tc39.es/ecma262/#sec-math.expm1
// eslint-disable-next-line es/no-math-expm1 -- required for testing
$$3u({ target: 'Math', stat: true, forced: expm1$2 != Math.expm1 }, { expm1: expm1$2 });

var sign$1 = mathSign;

var abs$3 = Math.abs;
var pow$2 = Math.pow;
var EPSILON = pow$2(2, -52);
var EPSILON32 = pow$2(2, -23);
var MAX32 = pow$2(2, 127) * (2 - EPSILON32);
var MIN32 = pow$2(2, -126);

var roundTiesToEven = function (n) {
  return n + 1 / EPSILON - 1 / EPSILON;
};

// `Math.fround` method implementation
// https://tc39.es/ecma262/#sec-math.fround
// eslint-disable-next-line es/no-math-fround -- safe
var mathFround = Math.fround || function fround(x) {
  var $abs = abs$3(x);
  var $sign = sign$1(x);
  var a, result;
  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
  a = (1 + EPSILON32 / EPSILON) * $abs;
  result = a - (a - $abs);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (result > MAX32 || result != result) return $sign * Infinity;
  return $sign * result;
};

var $$3t = _export;
var fround$1 = mathFround;

// `Math.fround` method
// https://tc39.es/ecma262/#sec-math.fround
$$3t({ target: 'Math', stat: true }, { fround: fround$1 });

var $$3s = _export;

// eslint-disable-next-line es/no-math-hypot -- required for testing
var $hypot = Math.hypot;
var abs$2 = Math.abs;
var sqrt = Math.sqrt;

// Chrome 77 bug
// https://bugs.chromium.org/p/v8/issues/detail?id=9546
var BUGGY = !!$hypot && $hypot(Infinity, NaN) !== Infinity;

// `Math.hypot` method
// https://tc39.es/ecma262/#sec-math.hypot
$$3s({ target: 'Math', stat: true, forced: BUGGY }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  hypot: function hypot(value1, value2) {
    var sum = 0;
    var i = 0;
    var aLen = arguments.length;
    var larg = 0;
    var arg, div;
    while (i < aLen) {
      arg = abs$2(arguments[i++]);
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

var $$3r = _export;
var fails$K = fails$15;

// eslint-disable-next-line es/no-math-imul -- required for testing
var $imul = Math.imul;

var FORCED$n = fails$K(function () {
  return $imul(0xFFFFFFFF, 5) != -5 || $imul.length != 2;
});

// `Math.imul` method
// https://tc39.es/ecma262/#sec-math.imul
// some WebKit versions fails with big numbers, some has wrong arity
$$3r({ target: 'Math', stat: true, forced: FORCED$n }, {
  imul: function imul(x, y) {
    var UINT16 = 0xFFFF;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});

var $$3q = _export;

var log$2 = Math.log;
var LOG10E = Math.LOG10E;

// `Math.log10` method
// https://tc39.es/ecma262/#sec-math.log10
$$3q({ target: 'Math', stat: true }, {
  log10: function log10(x) {
    return log$2(x) * LOG10E;
  }
});

var $$3p = _export;
var log1p = mathLog1p;

// `Math.log1p` method
// https://tc39.es/ecma262/#sec-math.log1p
$$3p({ target: 'Math', stat: true }, { log1p: log1p });

var $$3o = _export;

var log$1 = Math.log;
var LN2 = Math.LN2;

// `Math.log2` method
// https://tc39.es/ecma262/#sec-math.log2
$$3o({ target: 'Math', stat: true }, {
  log2: function log2(x) {
    return log$1(x) / LN2;
  }
});

var $$3n = _export;
var sign = mathSign;

// `Math.sign` method
// https://tc39.es/ecma262/#sec-math.sign
$$3n({ target: 'Math', stat: true }, {
  sign: sign
});

var $$3m = _export;
var fails$J = fails$15;
var expm1$1 = mathExpm1;

var abs$1 = Math.abs;
var exp$1 = Math.exp;
var E = Math.E;

var FORCED$m = fails$J(function () {
  // eslint-disable-next-line es/no-math-sinh -- required for testing
  return Math.sinh(-2e-17) != -2e-17;
});

// `Math.sinh` method
// https://tc39.es/ecma262/#sec-math.sinh
// V8 near Chromium 38 has a problem with very small numbers
$$3m({ target: 'Math', stat: true, forced: FORCED$m }, {
  sinh: function sinh(x) {
    return abs$1(x = +x) < 1 ? (expm1$1(x) - expm1$1(-x)) / 2 : (exp$1(x - 1) - exp$1(-x - 1)) * (E / 2);
  }
});

var $$3l = _export;
var expm1 = mathExpm1;

var exp = Math.exp;

// `Math.tanh` method
// https://tc39.es/ecma262/#sec-math.tanh
$$3l({ target: 'Math', stat: true }, {
  tanh: function tanh(x) {
    var a = expm1(x = +x);
    var b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});

var setToStringTag$4 = setToStringTag$b;

// Math[@@toStringTag] property
// https://tc39.es/ecma262/#sec-math-@@tostringtag
setToStringTag$4(Math, 'Math', true);

var $$3k = _export;

var ceil = Math.ceil;
var floor$6 = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
$$3k({ target: 'Math', stat: true }, {
  trunc: function trunc(it) {
    return (it > 0 ? floor$6 : ceil)(it);
  }
});

// a string of all valid unicode whitespaces
var whitespaces$4 = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var requireObjectCoercible$e = requireObjectCoercible$j;
var toString$m = toString$t;
var whitespaces$3 = whitespaces$4;

var whitespace = '[' + whitespaces$3 + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$4 = function (TYPE) {
  return function ($this) {
    var string = toString$m(requireObjectCoercible$e($this));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod$4(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod$4(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod$4(3)
};

var DESCRIPTORS$n = descriptors;
var global$w = global$R;
var isForced$2 = isForced_1;
var redefine$b = redefine$l.exports;
var has$7 = has$m;
var classof$6 = classofRaw$1;
var inheritIfRequired$2 = inheritIfRequired$4;
var isSymbol$1 = isSymbol$5;
var toPrimitive = toPrimitive$3;
var fails$I = fails$15;
var create$a = objectCreate$1;
var getOwnPropertyNames$3 = objectGetOwnPropertyNames.f;
var getOwnPropertyDescriptor$6 = objectGetOwnPropertyDescriptor.f;
var defineProperty$7 = objectDefineProperty.f;
var trim$2 = stringTrim.trim;

var NUMBER = 'Number';
var NativeNumber = global$w[NUMBER];
var NumberPrototype = NativeNumber.prototype;

// Opera ~12 has broken Object#toString
var BROKEN_CLASSOF = classof$6(create$a(NumberPrototype)) == NUMBER;

// `ToNumber` abstract operation
// https://tc39.es/ecma262/#sec-tonumber
var toNumber = function (argument) {
  if (isSymbol$1(argument)) throw TypeError('Cannot convert a Symbol value to a number');
  var it = toPrimitive(argument, 'number');
  var first, third, radix, maxCode, digits, length, index, code;
  if (typeof it == 'string' && it.length > 2) {
    it = trim$2(it);
    first = it.charCodeAt(0);
    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal of /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal of /^0o[0-7]+$/i
        default: return +it;
      }
      digits = it.slice(2);
      length = digits.length;
      for (index = 0; index < length; index++) {
        code = digits.charCodeAt(index);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

// `Number` constructor
// https://tc39.es/ecma262/#sec-number-constructor
if (isForced$2(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
  var NumberWrapper = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var dummy = this;
    return dummy instanceof NumberWrapper
      // check on 1..constructor(foo) case
      && (BROKEN_CLASSOF ? fails$I(function () { NumberPrototype.valueOf.call(dummy); }) : classof$6(dummy) != NUMBER)
        ? inheritIfRequired$2(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
  };
  for (var keys$1 = DESCRIPTORS$n ? getOwnPropertyNames$3(NativeNumber) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger,' +
    // ESNext
    'fromString,range'
  ).split(','), j = 0, key; keys$1.length > j; j++) {
    if (has$7(NativeNumber, key = keys$1[j]) && !has$7(NumberWrapper, key)) {
      defineProperty$7(NumberWrapper, key, getOwnPropertyDescriptor$6(NativeNumber, key));
    }
  }
  NumberWrapper.prototype = NumberPrototype;
  NumberPrototype.constructor = NumberWrapper;
  redefine$b(global$w, NUMBER, NumberWrapper);
}

var $$3j = _export;

// `Number.EPSILON` constant
// https://tc39.es/ecma262/#sec-number.epsilon
$$3j({ target: 'Number', stat: true }, {
  EPSILON: Math.pow(2, -52)
});

var global$v = global$R;

var globalIsFinite = global$v.isFinite;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
// eslint-disable-next-line es/no-number-isfinite -- safe
var numberIsFinite$2 = Number.isFinite || function isFinite(it) {
  return typeof it == 'number' && globalIsFinite(it);
};

var $$3i = _export;
var numberIsFinite$1 = numberIsFinite$2;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
$$3i({ target: 'Number', stat: true }, { isFinite: numberIsFinite$1 });

var isObject$k = isObject$C;

var floor$5 = Math.floor;

// `Number.isInteger` method implementation
// https://tc39.es/ecma262/#sec-number.isinteger
var isInteger$3 = function isInteger(it) {
  return !isObject$k(it) && isFinite(it) && floor$5(it) === it;
};

var $$3h = _export;
var isInteger$2 = isInteger$3;

// `Number.isInteger` method
// https://tc39.es/ecma262/#sec-number.isinteger
$$3h({ target: 'Number', stat: true }, {
  isInteger: isInteger$2
});

var $$3g = _export;

// `Number.isNaN` method
// https://tc39.es/ecma262/#sec-number.isnan
$$3g({ target: 'Number', stat: true }, {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare -- NaN check
    return number != number;
  }
});

var $$3f = _export;
var isInteger$1 = isInteger$3;

var abs = Math.abs;

// `Number.isSafeInteger` method
// https://tc39.es/ecma262/#sec-number.issafeinteger
$$3f({ target: 'Number', stat: true }, {
  isSafeInteger: function isSafeInteger(number) {
    return isInteger$1(number) && abs(number) <= 0x1FFFFFFFFFFFFF;
  }
});

var $$3e = _export;

// `Number.MAX_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.max_safe_integer
$$3e({ target: 'Number', stat: true }, {
  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
});

var $$3d = _export;

// `Number.MIN_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.min_safe_integer
$$3d({ target: 'Number', stat: true }, {
  MIN_SAFE_INTEGER: -0x1FFFFFFFFFFFFF
});

var global$u = global$R;
var fails$H = fails$15;
var toString$l = toString$t;
var trim$1 = stringTrim.trim;
var whitespaces$2 = whitespaces$4;

var $parseFloat$1 = global$u.parseFloat;
var Symbol$2 = global$u.Symbol;
var ITERATOR$5 = Symbol$2 && Symbol$2.iterator;
var FORCED$l = 1 / $parseFloat$1(whitespaces$2 + '-0') !== -Infinity
  // MS Edge 18- broken with boxed symbols
  || (ITERATOR$5 && !fails$H(function () { $parseFloat$1(Object(ITERATOR$5)); }));

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
var numberParseFloat = FORCED$l ? function parseFloat(string) {
  var trimmedString = trim$1(toString$l(string));
  var result = $parseFloat$1(trimmedString);
  return result === 0 && trimmedString.charAt(0) == '-' ? -0 : result;
} : $parseFloat$1;

var $$3c = _export;
var parseFloat$1 = numberParseFloat;

// `Number.parseFloat` method
// https://tc39.es/ecma262/#sec-number.parseFloat
// eslint-disable-next-line es/no-number-parsefloat -- required for testing
$$3c({ target: 'Number', stat: true, forced: Number.parseFloat != parseFloat$1 }, {
  parseFloat: parseFloat$1
});

var global$t = global$R;
var fails$G = fails$15;
var toString$k = toString$t;
var trim = stringTrim.trim;
var whitespaces$1 = whitespaces$4;

var $parseInt$1 = global$t.parseInt;
var Symbol$1 = global$t.Symbol;
var ITERATOR$4 = Symbol$1 && Symbol$1.iterator;
var hex = /^[+-]?0[Xx]/;
var FORCED$k = $parseInt$1(whitespaces$1 + '08') !== 8 || $parseInt$1(whitespaces$1 + '0x16') !== 22
  // MS Edge 18- broken with boxed symbols
  || (ITERATOR$4 && !fails$G(function () { $parseInt$1(Object(ITERATOR$4)); }));

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
var numberParseInt = FORCED$k ? function parseInt(string, radix) {
  var S = trim(toString$k(string));
  return $parseInt$1(S, (radix >>> 0) || (hex.test(S) ? 16 : 10));
} : $parseInt$1;

var $$3b = _export;
var parseInt$2 = numberParseInt;

// `Number.parseInt` method
// https://tc39.es/ecma262/#sec-number.parseint
// eslint-disable-next-line es/no-number-parseint -- required for testing
$$3b({ target: 'Number', stat: true, forced: Number.parseInt != parseInt$2 }, {
  parseInt: parseInt$2
});

var valueOf = 1.0.valueOf;

// `thisNumberValue` abstract operation
// https://tc39.es/ecma262/#sec-thisnumbervalue
var thisNumberValue$2 = function (value) {
  return valueOf.call(value);
};

var $$3a = _export;
var toInteger$7 = toInteger$i;
var thisNumberValue$1 = thisNumberValue$2;
var repeat$1 = stringRepeat;
var fails$F = fails$15;

var nativeToFixed = 1.0.toFixed;
var floor$4 = Math.floor;

var pow$1 = function (x, n, acc) {
  return n === 0 ? acc : n % 2 === 1 ? pow$1(x, n - 1, acc * x) : pow$1(x * x, n / 2, acc);
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
      var t = String(data[index]);
      s = s === '' ? t : s + repeat$1.call('0', 7 - t.length) + t;
    }
  } return s;
};

var FORCED$j = nativeToFixed && (
  0.00008.toFixed(3) !== '0.000' ||
  0.9.toFixed(0) !== '1' ||
  1.255.toFixed(2) !== '1.25' ||
  1000000000000000128.0.toFixed(0) !== '1000000000000000128'
) || !fails$F(function () {
  // V8 ~ Android 4.3-
  nativeToFixed.call({});
});

// `Number.prototype.toFixed` method
// https://tc39.es/ecma262/#sec-number.prototype.tofixed
$$3a({ target: 'Number', proto: true, forced: FORCED$j }, {
  toFixed: function toFixed(fractionDigits) {
    var number = thisNumberValue$1(this);
    var fractDigits = toInteger$7(fractionDigits);
    var data = [0, 0, 0, 0, 0, 0];
    var sign = '';
    var result = '0';
    var e, z, j, k;

    if (fractDigits < 0 || fractDigits > 20) throw RangeError('Incorrect fraction digits');
    // eslint-disable-next-line no-self-compare -- NaN check
    if (number != number) return 'NaN';
    if (number <= -1e21 || number >= 1e21) return String(number);
    if (number < 0) {
      sign = '-';
      number = -number;
    }
    if (number > 1e-21) {
      e = log(number * pow$1(2, 69, 1)) - 69;
      z = e < 0 ? number * pow$1(2, -e, 1) : number / pow$1(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if (e > 0) {
        multiply(data, 0, z);
        j = fractDigits;
        while (j >= 7) {
          multiply(data, 1e7, 0);
          j -= 7;
        }
        multiply(data, pow$1(10, j, 1), 0);
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
        result = dataToString(data) + repeat$1.call('0', fractDigits);
      }
    }
    if (fractDigits > 0) {
      k = result.length;
      result = sign + (k <= fractDigits
        ? '0.' + repeat$1.call('0', fractDigits - k) + result
        : result.slice(0, k - fractDigits) + '.' + result.slice(k - fractDigits));
    } else {
      result = sign + result;
    } return result;
  }
});

var $$39 = _export;
var fails$E = fails$15;
var thisNumberValue = thisNumberValue$2;

var nativeToPrecision = 1.0.toPrecision;

var FORCED$i = fails$E(function () {
  // IE7-
  return nativeToPrecision.call(1, undefined) !== '1';
}) || !fails$E(function () {
  // V8 ~ Android 4.3-
  nativeToPrecision.call({});
});

// `Number.prototype.toPrecision` method
// https://tc39.es/ecma262/#sec-number.prototype.toprecision
$$39({ target: 'Number', proto: true, forced: FORCED$i }, {
  toPrecision: function toPrecision(precision) {
    return precision === undefined
      ? nativeToPrecision.call(thisNumberValue(this))
      : nativeToPrecision.call(thisNumberValue(this), precision);
  }
});

var DESCRIPTORS$m = descriptors;
var fails$D = fails$15;
var objectKeys$2 = objectKeys$5;
var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
var propertyIsEnumerableModule = objectPropertyIsEnumerable;
var toObject$j = toObject$z;
var IndexedObject$2 = indexedObject;

// eslint-disable-next-line es/no-object-assign -- safe
var $assign = Object.assign;
// eslint-disable-next-line es/no-object-defineproperty -- required for testing
var defineProperty$6 = Object.defineProperty;

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
var objectAssign = !$assign || fails$D(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS$m && $assign({ b: 1 }, $assign(defineProperty$6({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty$6(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line es/no-symbol -- safe
  var symbol = Symbol();
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return $assign({}, A)[symbol] != 7 || objectKeys$2($assign({}, B)).join('') != alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
  var T = toObject$j(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject$2(arguments[index++]);
    var keys = getOwnPropertySymbols ? objectKeys$2(S).concat(getOwnPropertySymbols(S)) : objectKeys$2(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS$m || propertyIsEnumerable.call(S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

var $$38 = _export;
var assign$1 = objectAssign;

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
// eslint-disable-next-line es/no-object-assign -- required for testing
$$38({ target: 'Object', stat: true, forced: Object.assign !== assign$1 }, {
  assign: assign$1
});

var $$37 = _export;
var DESCRIPTORS$l = descriptors;
var create$9 = objectCreate$1;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
$$37({ target: 'Object', stat: true, sham: !DESCRIPTORS$l }, {
  create: create$9
});

var global$s = global$R;
var fails$C = fails$15;
var WEBKIT$1 = engineWebkitVersion;

// Forced replacement object prototype accessors methods
var objectPrototypeAccessorsForced = !fails$C(function () {
  // This feature detection crashes old WebKit
  // https://github.com/zloirock/core-js/issues/232
  if (WEBKIT$1 && WEBKIT$1 < 535) return;
  var key = Math.random();
  // In FF throws only define methods
  // eslint-disable-next-line no-undef, no-useless-call -- required for testing
  __defineSetter__.call(null, key, function () { /* empty */ });
  delete global$s[key];
});

var $$36 = _export;
var DESCRIPTORS$k = descriptors;
var FORCED$h = objectPrototypeAccessorsForced;
var aCallable$I = aCallable$Q;
var toObject$i = toObject$z;
var definePropertyModule$4 = objectDefineProperty;

// `Object.prototype.__defineGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineGetter__
if (DESCRIPTORS$k) {
  $$36({ target: 'Object', proto: true, forced: FORCED$h }, {
    __defineGetter__: function __defineGetter__(P, getter) {
      definePropertyModule$4.f(toObject$i(this), P, { get: aCallable$I(getter), enumerable: true, configurable: true });
    }
  });
}

var $$35 = _export;
var DESCRIPTORS$j = descriptors;
var defineProperties$2 = objectDefineProperties;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
$$35({ target: 'Object', stat: true, forced: !DESCRIPTORS$j, sham: !DESCRIPTORS$j }, {
  defineProperties: defineProperties$2
});

var $$34 = _export;
var DESCRIPTORS$i = descriptors;
var objectDefinePropertyModile = objectDefineProperty;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
$$34({ target: 'Object', stat: true, forced: !DESCRIPTORS$i, sham: !DESCRIPTORS$i }, {
  defineProperty: objectDefinePropertyModile.f
});

var $$33 = _export;
var DESCRIPTORS$h = descriptors;
var FORCED$g = objectPrototypeAccessorsForced;
var aCallable$H = aCallable$Q;
var toObject$h = toObject$z;
var definePropertyModule$3 = objectDefineProperty;

// `Object.prototype.__defineSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineSetter__
if (DESCRIPTORS$h) {
  $$33({ target: 'Object', proto: true, forced: FORCED$g }, {
    __defineSetter__: function __defineSetter__(P, setter) {
      definePropertyModule$3.f(toObject$h(this), P, { set: aCallable$H(setter), enumerable: true, configurable: true });
    }
  });
}

var DESCRIPTORS$g = descriptors;
var objectKeys$1 = objectKeys$5;
var toIndexedObject$3 = toIndexedObject$d;
var propertyIsEnumerable = objectPropertyIsEnumerable.f;

// `Object.{ entries, values }` methods implementation
var createMethod$3 = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject$3(it);
    var keys = objectKeys$1(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS$g || propertyIsEnumerable.call(O, key)) {
        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

var objectToArray = {
  // `Object.entries` method
  // https://tc39.es/ecma262/#sec-object.entries
  entries: createMethod$3(true),
  // `Object.values` method
  // https://tc39.es/ecma262/#sec-object.values
  values: createMethod$3(false)
};

var $$32 = _export;
var $entries = objectToArray.entries;

// `Object.entries` method
// https://tc39.es/ecma262/#sec-object.entries
$$32({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return $entries(O);
  }
});

var $$31 = _export;
var FREEZING$3 = freezing;
var fails$B = fails$15;
var isObject$j = isObject$C;
var onFreeze$2 = internalMetadata.exports.onFreeze;

// eslint-disable-next-line es/no-object-freeze -- safe
var $freeze = Object.freeze;
var FAILS_ON_PRIMITIVES$9 = fails$B(function () { $freeze(1); });

// `Object.freeze` method
// https://tc39.es/ecma262/#sec-object.freeze
$$31({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$9, sham: !FREEZING$3 }, {
  freeze: function freeze(it) {
    return $freeze && isObject$j(it) ? $freeze(onFreeze$2(it)) : it;
  }
});

var $$30 = _export;
var iterate$E = iterate$I;
var createProperty$1 = createProperty$7;

// `Object.fromEntries` method
// https://github.com/tc39/proposal-object-from-entries
$$30({ target: 'Object', stat: true }, {
  fromEntries: function fromEntries(iterable) {
    var obj = {};
    iterate$E(iterable, function (k, v) {
      createProperty$1(obj, k, v);
    }, { AS_ENTRIES: true });
    return obj;
  }
});

var $$2$ = _export;
var fails$A = fails$15;
var toIndexedObject$2 = toIndexedObject$d;
var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var DESCRIPTORS$f = descriptors;

var FAILS_ON_PRIMITIVES$8 = fails$A(function () { nativeGetOwnPropertyDescriptor$1(1); });
var FORCED$f = !DESCRIPTORS$f || FAILS_ON_PRIMITIVES$8;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
$$2$({ target: 'Object', stat: true, forced: FORCED$f, sham: !DESCRIPTORS$f }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor$1(toIndexedObject$2(it), key);
  }
});

var $$2_ = _export;
var DESCRIPTORS$e = descriptors;
var ownKeys$1 = ownKeys$3;
var toIndexedObject$1 = toIndexedObject$d;
var getOwnPropertyDescriptorModule$4 = objectGetOwnPropertyDescriptor;
var createProperty = createProperty$7;

// `Object.getOwnPropertyDescriptors` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
$$2_({ target: 'Object', stat: true, sham: !DESCRIPTORS$e }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject$1(object);
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$4.f;
    var keys = ownKeys$1(O);
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

var $$2Z = _export;
var fails$z = fails$15;
var getOwnPropertyNames$2 = objectGetOwnPropertyNamesExternal.f;

// eslint-disable-next-line es/no-object-getownpropertynames -- required for testing
var FAILS_ON_PRIMITIVES$7 = fails$z(function () { return !Object.getOwnPropertyNames(1); });

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
$$2Z({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$7 }, {
  getOwnPropertyNames: getOwnPropertyNames$2
});

var $$2Y = _export;
var fails$y = fails$15;
var toObject$g = toObject$z;
var nativeGetPrototypeOf = objectGetPrototypeOf$1;
var CORRECT_PROTOTYPE_GETTER$1 = correctPrototypeGetter;

var FAILS_ON_PRIMITIVES$6 = fails$y(function () { nativeGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
$$2Y({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$6, sham: !CORRECT_PROTOTYPE_GETTER$1 }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject$g(it));
  }
});

var $$2X = _export;
var hasOwn$1 = has$m;

// `Object.hasOwn` method
// https://github.com/tc39/proposal-accessible-object-hasownproperty
$$2X({ target: 'Object', stat: true }, {
  hasOwn: hasOwn$1
});

// `SameValue` abstract operation
// https://tc39.es/ecma262/#sec-samevalue
// eslint-disable-next-line es/no-object-is -- safe
var sameValue$1 = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

var $$2W = _export;
var is = sameValue$1;

// `Object.is` method
// https://tc39.es/ecma262/#sec-object.is
$$2W({ target: 'Object', stat: true }, {
  is: is
});

var $$2V = _export;
var fails$x = fails$15;
var isObject$i = isObject$C;

// eslint-disable-next-line es/no-object-isextensible -- safe
var $isExtensible = Object.isExtensible;
var FAILS_ON_PRIMITIVES$5 = fails$x(function () { $isExtensible(1); });

// `Object.isExtensible` method
// https://tc39.es/ecma262/#sec-object.isextensible
$$2V({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$5 }, {
  isExtensible: function isExtensible(it) {
    return isObject$i(it) ? $isExtensible ? $isExtensible(it) : true : false;
  }
});

var $$2U = _export;
var fails$w = fails$15;
var isObject$h = isObject$C;

// eslint-disable-next-line es/no-object-isfrozen -- safe
var $isFrozen = Object.isFrozen;
var FAILS_ON_PRIMITIVES$4 = fails$w(function () { $isFrozen(1); });

// `Object.isFrozen` method
// https://tc39.es/ecma262/#sec-object.isfrozen
$$2U({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$4 }, {
  isFrozen: function isFrozen(it) {
    return isObject$h(it) ? $isFrozen ? $isFrozen(it) : false : true;
  }
});

var $$2T = _export;
var fails$v = fails$15;
var isObject$g = isObject$C;

// eslint-disable-next-line es/no-object-issealed -- safe
var $isSealed = Object.isSealed;
var FAILS_ON_PRIMITIVES$3 = fails$v(function () { $isSealed(1); });

// `Object.isSealed` method
// https://tc39.es/ecma262/#sec-object.issealed
$$2T({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$3 }, {
  isSealed: function isSealed(it) {
    return isObject$g(it) ? $isSealed ? $isSealed(it) : false : true;
  }
});

var $$2S = _export;
var toObject$f = toObject$z;
var nativeKeys = objectKeys$5;
var fails$u = fails$15;

var FAILS_ON_PRIMITIVES$2 = fails$u(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
$$2S({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2 }, {
  keys: function keys(it) {
    return nativeKeys(toObject$f(it));
  }
});

var $$2R = _export;
var DESCRIPTORS$d = descriptors;
var FORCED$e = objectPrototypeAccessorsForced;
var toObject$e = toObject$z;
var toPropertyKey$4 = toPropertyKey$9;
var getPrototypeOf$7 = objectGetPrototypeOf$1;
var getOwnPropertyDescriptor$5 = objectGetOwnPropertyDescriptor.f;

// `Object.prototype.__lookupGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupGetter__
if (DESCRIPTORS$d) {
  $$2R({ target: 'Object', proto: true, forced: FORCED$e }, {
    __lookupGetter__: function __lookupGetter__(P) {
      var O = toObject$e(this);
      var key = toPropertyKey$4(P);
      var desc;
      do {
        if (desc = getOwnPropertyDescriptor$5(O, key)) return desc.get;
      } while (O = getPrototypeOf$7(O));
    }
  });
}

var $$2Q = _export;
var DESCRIPTORS$c = descriptors;
var FORCED$d = objectPrototypeAccessorsForced;
var toObject$d = toObject$z;
var toPropertyKey$3 = toPropertyKey$9;
var getPrototypeOf$6 = objectGetPrototypeOf$1;
var getOwnPropertyDescriptor$4 = objectGetOwnPropertyDescriptor.f;

// `Object.prototype.__lookupSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupSetter__
if (DESCRIPTORS$c) {
  $$2Q({ target: 'Object', proto: true, forced: FORCED$d }, {
    __lookupSetter__: function __lookupSetter__(P) {
      var O = toObject$d(this);
      var key = toPropertyKey$3(P);
      var desc;
      do {
        if (desc = getOwnPropertyDescriptor$4(O, key)) return desc.set;
      } while (O = getPrototypeOf$6(O));
    }
  });
}

var $$2P = _export;
var isObject$f = isObject$C;
var onFreeze$1 = internalMetadata.exports.onFreeze;
var FREEZING$2 = freezing;
var fails$t = fails$15;

// eslint-disable-next-line es/no-object-preventextensions -- safe
var $preventExtensions = Object.preventExtensions;
var FAILS_ON_PRIMITIVES$1 = fails$t(function () { $preventExtensions(1); });

// `Object.preventExtensions` method
// https://tc39.es/ecma262/#sec-object.preventextensions
$$2P({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$1, sham: !FREEZING$2 }, {
  preventExtensions: function preventExtensions(it) {
    return $preventExtensions && isObject$f(it) ? $preventExtensions(onFreeze$1(it)) : it;
  }
});

var $$2O = _export;
var isObject$e = isObject$C;
var onFreeze = internalMetadata.exports.onFreeze;
var FREEZING$1 = freezing;
var fails$s = fails$15;

// eslint-disable-next-line es/no-object-seal -- safe
var $seal = Object.seal;
var FAILS_ON_PRIMITIVES = fails$s(function () { $seal(1); });

// `Object.seal` method
// https://tc39.es/ecma262/#sec-object.seal
$$2O({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING$1 }, {
  seal: function seal(it) {
    return $seal && isObject$e(it) ? $seal(onFreeze(it)) : it;
  }
});

var $$2N = _export;
var setPrototypeOf$2 = objectSetPrototypeOf$1;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
$$2N({ target: 'Object', stat: true }, {
  setPrototypeOf: setPrototypeOf$2
});

var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
var classof$5 = classof$c;

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
  return '[object ' + classof$5(this) + ']';
};

var TO_STRING_TAG_SUPPORT = toStringTagSupport;
var redefine$a = redefine$l.exports;
var toString$j = objectToString;

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT) {
  redefine$a(Object.prototype, 'toString', toString$j, { unsafe: true });
}

var $$2M = _export;
var $values = objectToArray.values;

// `Object.values` method
// https://tc39.es/ecma262/#sec-object.values
$$2M({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});

var $$2L = _export;
var $parseFloat = numberParseFloat;

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
$$2L({ global: true, forced: parseFloat != $parseFloat }, {
  parseFloat: $parseFloat
});

var $$2K = _export;
var $parseInt = numberParseInt;

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
$$2K({ global: true, forced: parseInt != $parseInt }, {
  parseInt: $parseInt
});

var global$r = global$R;

var nativePromiseConstructor = global$r.Promise;

var userAgent$4 = engineUserAgent;

var engineIsIos = /(?:ipad|iphone|ipod).*applewebkit/i.test(userAgent$4);

var global$q = global$R;
var isCallable$d = isCallable$z;
var fails$r = fails$15;
var bind$k = functionBindContext;
var html = html$2;
var createElement = documentCreateElement$2;
var IS_IOS$1 = engineIsIos;
var IS_NODE$3 = engineIsNode;

var set$1 = global$q.setImmediate;
var clear = global$q.clearImmediate;
var process$3 = global$q.process;
var MessageChannel = global$q.MessageChannel;
var Dispatch = global$q.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var location, defer, channel, port;

try {
  // Deno throws a ReferenceError on `location` access without `--location` flag
  location = global$q.location;
} catch (error) { /* empty */ }

var run = function (id) {
  // eslint-disable-next-line no-prototype-builtins -- safe
  if (queue.hasOwnProperty(id)) {
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

var listener = function (event) {
  run(event.data);
};

var post = function (id) {
  // old engines have not location.origin
  global$q.postMessage(String(id), location.protocol + '//' + location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set$1 || !clear) {
  set$1 = function setImmediate(fn) {
    var args = [];
    var argumentsLength = arguments.length;
    var i = 1;
    while (argumentsLength > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func -- spec requirement
      (isCallable$d(fn) ? fn : Function(fn)).apply(undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (IS_NODE$3) {
    defer = function (id) {
      process$3.nextTick(runner(id));
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
    channel.port1.onmessage = listener;
    defer = bind$k(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    global$q.addEventListener &&
    isCallable$d(global$q.postMessage) &&
    !global$q.importScripts &&
    location && location.protocol !== 'file:' &&
    !fails$r(post)
  ) {
    defer = post;
    global$q.addEventListener('message', listener, false);
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

var task$2 = {
  set: set$1,
  clear: clear
};

var userAgent$3 = engineUserAgent;
var global$p = global$R;

var engineIsIosPebble = /ipad|iphone|ipod/i.test(userAgent$3) && global$p.Pebble !== undefined;

var userAgent$2 = engineUserAgent;

var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent$2);

var global$o = global$R;
var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
var macrotask = task$2.set;
var IS_IOS = engineIsIos;
var IS_IOS_PEBBLE = engineIsIosPebble;
var IS_WEBOS_WEBKIT = engineIsWebosWebkit;
var IS_NODE$2 = engineIsNode;

var MutationObserver = global$o.MutationObserver || global$o.WebKitMutationObserver;
var document$2 = global$o.document;
var process$2 = global$o.process;
var Promise$4 = global$o.Promise;
// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
var queueMicrotaskDescriptor = getOwnPropertyDescriptor$3(global$o, 'queueMicrotask');
var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

var flush, head, last, notify$1, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!queueMicrotask) {
  flush = function () {
    var parent, fn;
    if (IS_NODE$2 && (parent = process$2.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (error) {
        if (head) notify$1();
        else last = undefined;
        throw error;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
  if (!IS_IOS && !IS_NODE$2 && !IS_WEBOS_WEBKIT && MutationObserver && document$2) {
    toggle = true;
    node = document$2.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify$1 = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (!IS_IOS_PEBBLE && Promise$4 && Promise$4.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise$4.resolve(undefined);
    // workaround of WebKit ~ iOS Safari 10.1 bug
    promise.constructor = Promise$4;
    then = promise.then;
    notify$1 = function () {
      then.call(promise, flush);
    };
  // Node.js without promises
  } else if (IS_NODE$2) {
    notify$1 = function () {
      process$2.nextTick(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify$1 = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global$o, flush);
    };
  }
}

var microtask$2 = queueMicrotask || function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify$1();
  } last = task;
};

var newPromiseCapability$2 = {};

var aCallable$G = aCallable$Q;

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aCallable$G(resolve);
  this.reject = aCallable$G(reject);
};

// `NewPromiseCapability` abstract operation
// https://tc39.es/ecma262/#sec-newpromisecapability
newPromiseCapability$2.f = function (C) {
  return new PromiseCapability(C);
};

var anObject$1o = anObject$1C;
var isObject$d = isObject$C;
var newPromiseCapability$1 = newPromiseCapability$2;

var promiseResolve$2 = function (C, x) {
  anObject$1o(C);
  if (isObject$d(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability$1.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var global$n = global$R;

var hostReportErrors$2 = function (a, b) {
  var console = global$n.console;
  if (console && console.error) {
    arguments.length === 1 ? console.error(a) : console.error(a, b);
  }
};

var perform$4 = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

var engineIsBrowser = typeof window == 'object';

var $$2J = _export;
var global$m = global$R;
var getBuiltIn$n = getBuiltIn$w;
var NativePromise$1 = nativePromiseConstructor;
var redefine$9 = redefine$l.exports;
var redefineAll$7 = redefineAll$a;
var setPrototypeOf$1 = objectSetPrototypeOf$1;
var setToStringTag$3 = setToStringTag$b;
var setSpecies$3 = setSpecies$7;
var aCallable$F = aCallable$Q;
var isCallable$c = isCallable$z;
var isObject$c = isObject$C;
var anInstance$7 = anInstance$b;
var inspectSource = inspectSource$4;
var iterate$D = iterate$I;
var checkCorrectnessOfIteration$1 = checkCorrectnessOfIteration$4;
var speciesConstructor$d = speciesConstructor$f;
var task$1 = task$2.set;
var microtask$1 = microtask$2;
var promiseResolve$1 = promiseResolve$2;
var hostReportErrors$1 = hostReportErrors$2;
var newPromiseCapabilityModule$3 = newPromiseCapability$2;
var perform$3 = perform$4;
var InternalStateModule$e = internalState;
var isForced$1 = isForced_1;
var wellKnownSymbol$k = wellKnownSymbol$G;
var IS_BROWSER = engineIsBrowser;
var IS_NODE$1 = engineIsNode;
var V8_VERSION = engineV8Version;

var SPECIES$1 = wellKnownSymbol$k('species');
var PROMISE = 'Promise';
var getInternalState$e = InternalStateModule$e.get;
var setInternalState$e = InternalStateModule$e.set;
var getInternalPromiseState = InternalStateModule$e.getterFor(PROMISE);
var NativePromisePrototype = NativePromise$1 && NativePromise$1.prototype;
var PromiseConstructor = NativePromise$1;
var PromiseConstructorPrototype = NativePromisePrototype;
var TypeError$1 = global$m.TypeError;
var document$1 = global$m.document;
var process$1 = global$m.process;
var newPromiseCapability = newPromiseCapabilityModule$3.f;
var newGenericPromiseCapability = newPromiseCapability;
var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && global$m.dispatchEvent);
var NATIVE_REJECTION_EVENT = isCallable$c(global$m.PromiseRejectionEvent);
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var SUBCLASSING = false;
var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

var FORCED$c = isForced$1(PROMISE, function () {
  var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(PromiseConstructor);
  var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(PromiseConstructor);
  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
  // We can't detect it synchronously, so just check versions
  if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (V8_VERSION >= 51 && /native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) return false;
  // Detect correctness of subclassing with @@species support
  var promise = new PromiseConstructor(function (resolve) { resolve(1); });
  var FakePromise = function (exec) {
    exec(function () { /* empty */ }, function () { /* empty */ });
  };
  var constructor = promise.constructor = {};
  constructor[SPECIES$1] = FakePromise;
  SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
  if (!SUBCLASSING) return true;
  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
  return !GLOBAL_CORE_JS_PROMISE && IS_BROWSER && !NATIVE_REJECTION_EVENT;
});

var INCORRECT_ITERATION = FORCED$c || !checkCorrectnessOfIteration$1(function (iterable) {
  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
});

// helpers
var isThenable = function (it) {
  var then;
  return isObject$c(it) && isCallable$c(then = it.then) ? then : false;
};

var notify = function (state, isReject) {
  if (state.notified) return;
  state.notified = true;
  var chain = state.reactions;
  microtask$1(function () {
    var value = state.value;
    var ok = state.state == FULFILLED;
    var index = 0;
    // variable length - can't use forEach
    while (chain.length > index) {
      var reaction = chain[index++];
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
            reject(TypeError$1('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (error) {
        if (domain && !exited) domain.exit();
        reject(error);
      }
    }
    state.reactions = [];
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
    global$m.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (!NATIVE_REJECTION_EVENT && (handler = global$m['on' + name])) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors$1('Unhandled promise rejection', reason);
};

var onUnhandled = function (state) {
  task$1.call(global$m, function () {
    var promise = state.facade;
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform$3(function () {
        if (IS_NODE$1) {
          process$1.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (state) {
  task$1.call(global$m, function () {
    var promise = state.facade;
    if (IS_NODE$1) {
      process$1.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind$j = function (fn, state, unwrap) {
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
    if (state.facade === value) throw TypeError$1("Promise can't be resolved itself");
    var then = isThenable(value);
    if (then) {
      microtask$1(function () {
        var wrapper = { done: false };
        try {
          then.call(value,
            bind$j(internalResolve, wrapper, state),
            bind$j(internalReject, wrapper, state)
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
if (FORCED$c) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance$7(this, PromiseConstructor, PROMISE);
    aCallable$F(executor);
    Internal.call(this);
    var state = getInternalState$e(this);
    try {
      executor(bind$j(internalResolve, state), bind$j(internalReject, state));
    } catch (error) {
      internalReject(state, error);
    }
  };
  PromiseConstructorPrototype = PromiseConstructor.prototype;
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  Internal = function Promise(executor) {
    setInternalState$e(this, {
      type: PROMISE,
      done: false,
      notified: false,
      parent: false,
      reactions: [],
      rejection: false,
      state: PENDING,
      value: undefined
    });
  };
  Internal.prototype = redefineAll$7(PromiseConstructorPrototype, {
    // `Promise.prototype.then` method
    // https://tc39.es/ecma262/#sec-promise.prototype.then
    then: function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability(speciesConstructor$d(this, PromiseConstructor));
      reaction.ok = isCallable$c(onFulfilled) ? onFulfilled : true;
      reaction.fail = isCallable$c(onRejected) && onRejected;
      reaction.domain = IS_NODE$1 ? process$1.domain : undefined;
      state.parent = true;
      state.reactions.push(reaction);
      if (state.state != PENDING) notify(state, false);
      return reaction.promise;
    },
    // `Promise.prototype.catch` method
    // https://tc39.es/ecma262/#sec-promise.prototype.catch
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    var state = getInternalState$e(promise);
    this.promise = promise;
    this.resolve = bind$j(internalResolve, state);
    this.reject = bind$j(internalReject, state);
  };
  newPromiseCapabilityModule$3.f = newPromiseCapability = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  if (isCallable$c(NativePromise$1) && NativePromisePrototype !== Object.prototype) {
    nativeThen = NativePromisePrototype.then;

    if (!SUBCLASSING) {
      // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
      redefine$9(NativePromisePrototype, 'then', function then(onFulfilled, onRejected) {
        var that = this;
        return new PromiseConstructor(function (resolve, reject) {
          nativeThen.call(that, resolve, reject);
        }).then(onFulfilled, onRejected);
      // https://github.com/zloirock/core-js/issues/640
      }, { unsafe: true });

      // makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
      redefine$9(NativePromisePrototype, 'catch', PromiseConstructorPrototype['catch'], { unsafe: true });
    }

    // make `.constructor === Promise` work for native promise-based APIs
    try {
      delete NativePromisePrototype.constructor;
    } catch (error) { /* empty */ }

    // make `instanceof Promise` work for native promise-based APIs
    if (setPrototypeOf$1) {
      setPrototypeOf$1(NativePromisePrototype, PromiseConstructorPrototype);
    }
  }
}

$$2J({ global: true, wrap: true, forced: FORCED$c }, {
  Promise: PromiseConstructor
});

setToStringTag$3(PromiseConstructor, PROMISE, false);
setSpecies$3(PROMISE);

PromiseWrapper = getBuiltIn$n(PROMISE);

// statics
$$2J({ target: PROMISE, stat: true, forced: FORCED$c }, {
  // `Promise.reject` method
  // https://tc39.es/ecma262/#sec-promise.reject
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    capability.reject.call(undefined, r);
    return capability.promise;
  }
});

$$2J({ target: PROMISE, stat: true, forced: FORCED$c }, {
  // `Promise.resolve` method
  // https://tc39.es/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve$1(this, x);
  }
});

$$2J({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
  // `Promise.all` method
  // https://tc39.es/ecma262/#sec-promise.all
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$3(function () {
      var $promiseResolve = aCallable$F(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$D(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        $promiseResolve.call(C, promise).then(function (value) {
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
  },
  // `Promise.race` method
  // https://tc39.es/ecma262/#sec-promise.race
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform$3(function () {
      var $promiseResolve = aCallable$F(C.resolve);
      iterate$D(iterable, function (promise) {
        $promiseResolve.call(C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$2I = _export;
var aCallable$E = aCallable$Q;
var newPromiseCapabilityModule$2 = newPromiseCapability$2;
var perform$2 = perform$4;
var iterate$C = iterate$I;

// `Promise.allSettled` method
// https://tc39.es/ecma262/#sec-promise.allsettled
$$2I({ target: 'Promise', stat: true }, {
  allSettled: function allSettled(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$2.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$2(function () {
      var promiseResolve = aCallable$E(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$C(iterable, function (promise) {
        var index = counter++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        promiseResolve.call(C, promise).then(function (value) {
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

var $$2H = _export;
var aCallable$D = aCallable$Q;
var getBuiltIn$m = getBuiltIn$w;
var newPromiseCapabilityModule$1 = newPromiseCapability$2;
var perform$1 = perform$4;
var iterate$B = iterate$I;

var PROMISE_ANY_ERROR = 'No one promise resolved';

// `Promise.any` method
// https://tc39.es/ecma262/#sec-promise.any
$$2H({ target: 'Promise', stat: true }, {
  any: function any(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$1.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$1(function () {
      var promiseResolve = aCallable$D(C.resolve);
      var errors = [];
      var counter = 0;
      var remaining = 1;
      var alreadyResolved = false;
      iterate$B(iterable, function (promise) {
        var index = counter++;
        var alreadyRejected = false;
        errors.push(undefined);
        remaining++;
        promiseResolve.call(C, promise).then(function (value) {
          if (alreadyRejected || alreadyResolved) return;
          alreadyResolved = true;
          resolve(value);
        }, function (error) {
          if (alreadyRejected || alreadyResolved) return;
          alreadyRejected = true;
          errors[index] = error;
          --remaining || reject(new (getBuiltIn$m('AggregateError'))(errors, PROMISE_ANY_ERROR));
        });
      });
      --remaining || reject(new (getBuiltIn$m('AggregateError'))(errors, PROMISE_ANY_ERROR));
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$2G = _export;
var NativePromise = nativePromiseConstructor;
var fails$q = fails$15;
var getBuiltIn$l = getBuiltIn$w;
var isCallable$b = isCallable$z;
var speciesConstructor$c = speciesConstructor$f;
var promiseResolve = promiseResolve$2;
var redefine$8 = redefine$l.exports;

// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
var NON_GENERIC = !!NativePromise && fails$q(function () {
  NativePromise.prototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
});

// `Promise.prototype.finally` method
// https://tc39.es/ecma262/#sec-promise.prototype.finally
$$2G({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
  'finally': function (onFinally) {
    var C = speciesConstructor$c(this, getBuiltIn$l('Promise'));
    var isFunction = isCallable$b(onFinally);
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
if (isCallable$b(NativePromise)) {
  var method = getBuiltIn$l('Promise').prototype['finally'];
  if (NativePromise.prototype['finally'] !== method) {
    redefine$8(NativePromise.prototype, 'finally', method, { unsafe: true });
  }
}

var $$2F = _export;
var getBuiltIn$k = getBuiltIn$w;
var aCallable$C = aCallable$Q;
var anObject$1n = anObject$1C;
var fails$p = fails$15;

var nativeApply = getBuiltIn$k('Reflect', 'apply');
var functionApply = Function.apply;

// MS Edge argumentsList argument is optional
var OPTIONAL_ARGUMENTS_LIST = !fails$p(function () {
  nativeApply(function () { /* empty */ });
});

// `Reflect.apply` method
// https://tc39.es/ecma262/#sec-reflect.apply
$$2F({ target: 'Reflect', stat: true, forced: OPTIONAL_ARGUMENTS_LIST }, {
  apply: function apply(target, thisArgument, argumentsList) {
    aCallable$C(target);
    anObject$1n(argumentsList);
    return nativeApply
      ? nativeApply(target, thisArgument, argumentsList)
      : functionApply.call(target, thisArgument, argumentsList);
  }
});

var $$2E = _export;
var getBuiltIn$j = getBuiltIn$w;
var aConstructor$3 = aConstructor$5;
var anObject$1m = anObject$1C;
var isObject$b = isObject$C;
var create$8 = objectCreate$1;
var bind$i = functionBind;
var fails$o = fails$15;

var nativeConstruct = getBuiltIn$j('Reflect', 'construct');

// `Reflect.construct` method
// https://tc39.es/ecma262/#sec-reflect.construct
// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails$o(function () {
  function F() { /* empty */ }
  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
});
var ARGS_BUG = !fails$o(function () {
  nativeConstruct(function () { /* empty */ });
});
var FORCED$b = NEW_TARGET_BUG || ARGS_BUG;

$$2E({ target: 'Reflect', stat: true, forced: FORCED$b, sham: FORCED$b }, {
  construct: function construct(Target, args /* , newTarget */) {
    aConstructor$3(Target);
    anObject$1m(args);
    var newTarget = arguments.length < 3 ? Target : aConstructor$3(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return nativeConstruct(Target, args, newTarget);
    if (Target == newTarget) {
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
      $args.push.apply($args, args);
      return new (bind$i.apply(Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = create$8(isObject$b(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return isObject$b(result) ? result : instance;
  }
});

var $$2D = _export;
var DESCRIPTORS$b = descriptors;
var anObject$1l = anObject$1C;
var toPropertyKey$2 = toPropertyKey$9;
var definePropertyModule$2 = objectDefineProperty;
var fails$n = fails$15;

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
var ERROR_INSTEAD_OF_FALSE = fails$n(function () {
  // eslint-disable-next-line es/no-reflect -- required for testing
  Reflect.defineProperty(definePropertyModule$2.f({}, 1, { value: 1 }), 1, { value: 2 });
});

// `Reflect.defineProperty` method
// https://tc39.es/ecma262/#sec-reflect.defineproperty
$$2D({ target: 'Reflect', stat: true, forced: ERROR_INSTEAD_OF_FALSE, sham: !DESCRIPTORS$b }, {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    anObject$1l(target);
    var key = toPropertyKey$2(propertyKey);
    anObject$1l(attributes);
    try {
      definePropertyModule$2.f(target, key, attributes);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$2C = _export;
var anObject$1k = anObject$1C;
var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;

// `Reflect.deleteProperty` method
// https://tc39.es/ecma262/#sec-reflect.deleteproperty
$$2C({ target: 'Reflect', stat: true }, {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var descriptor = getOwnPropertyDescriptor$2(anObject$1k(target), propertyKey);
    return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
  }
});

var has$6 = has$m;

var isDataDescriptor$2 = function (descriptor) {
  return descriptor !== undefined && (has$6(descriptor, 'value') || has$6(descriptor, 'writable'));
};

var $$2B = _export;
var isObject$a = isObject$C;
var anObject$1j = anObject$1C;
var isDataDescriptor$1 = isDataDescriptor$2;
var getOwnPropertyDescriptorModule$3 = objectGetOwnPropertyDescriptor;
var getPrototypeOf$5 = objectGetPrototypeOf$1;

// `Reflect.get` method
// https://tc39.es/ecma262/#sec-reflect.get
function get(target, propertyKey /* , receiver */) {
  var receiver = arguments.length < 3 ? target : arguments[2];
  var descriptor, prototype;
  if (anObject$1j(target) === receiver) return target[propertyKey];
  descriptor = getOwnPropertyDescriptorModule$3.f(target, propertyKey);
  if (descriptor) return isDataDescriptor$1(descriptor)
    ? descriptor.value
    : descriptor.get === undefined ? undefined : descriptor.get.call(receiver);
  if (isObject$a(prototype = getPrototypeOf$5(target))) return get(prototype, propertyKey, receiver);
}

$$2B({ target: 'Reflect', stat: true }, {
  get: get
});

var $$2A = _export;
var DESCRIPTORS$a = descriptors;
var anObject$1i = anObject$1C;
var getOwnPropertyDescriptorModule$2 = objectGetOwnPropertyDescriptor;

// `Reflect.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-reflect.getownpropertydescriptor
$$2A({ target: 'Reflect', stat: true, sham: !DESCRIPTORS$a }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return getOwnPropertyDescriptorModule$2.f(anObject$1i(target), propertyKey);
  }
});

var $$2z = _export;
var anObject$1h = anObject$1C;
var objectGetPrototypeOf = objectGetPrototypeOf$1;
var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

// `Reflect.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.getprototypeof
$$2z({ target: 'Reflect', stat: true, sham: !CORRECT_PROTOTYPE_GETTER }, {
  getPrototypeOf: function getPrototypeOf(target) {
    return objectGetPrototypeOf(anObject$1h(target));
  }
});

var $$2y = _export;

// `Reflect.has` method
// https://tc39.es/ecma262/#sec-reflect.has
$$2y({ target: 'Reflect', stat: true }, {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});

var $$2x = _export;
var anObject$1g = anObject$1C;

// eslint-disable-next-line es/no-object-isextensible -- safe
var objectIsExtensible = Object.isExtensible;

// `Reflect.isExtensible` method
// https://tc39.es/ecma262/#sec-reflect.isextensible
$$2x({ target: 'Reflect', stat: true }, {
  isExtensible: function isExtensible(target) {
    anObject$1g(target);
    return objectIsExtensible ? objectIsExtensible(target) : true;
  }
});

var $$2w = _export;
var ownKeys = ownKeys$3;

// `Reflect.ownKeys` method
// https://tc39.es/ecma262/#sec-reflect.ownkeys
$$2w({ target: 'Reflect', stat: true }, {
  ownKeys: ownKeys
});

var $$2v = _export;
var getBuiltIn$i = getBuiltIn$w;
var anObject$1f = anObject$1C;
var FREEZING = freezing;

// `Reflect.preventExtensions` method
// https://tc39.es/ecma262/#sec-reflect.preventextensions
$$2v({ target: 'Reflect', stat: true, sham: !FREEZING }, {
  preventExtensions: function preventExtensions(target) {
    anObject$1f(target);
    try {
      var objectPreventExtensions = getBuiltIn$i('Object', 'preventExtensions');
      if (objectPreventExtensions) objectPreventExtensions(target);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$2u = _export;
var anObject$1e = anObject$1C;
var isObject$9 = isObject$C;
var isDataDescriptor = isDataDescriptor$2;
var fails$m = fails$15;
var definePropertyModule$1 = objectDefineProperty;
var getOwnPropertyDescriptorModule$1 = objectGetOwnPropertyDescriptor;
var getPrototypeOf$4 = objectGetPrototypeOf$1;
var createPropertyDescriptor$2 = createPropertyDescriptor$9;

// `Reflect.set` method
// https://tc39.es/ecma262/#sec-reflect.set
function set(target, propertyKey, V /* , receiver */) {
  var receiver = arguments.length < 4 ? target : arguments[3];
  var ownDescriptor = getOwnPropertyDescriptorModule$1.f(anObject$1e(target), propertyKey);
  var existingDescriptor, prototype, setter;
  if (!ownDescriptor) {
    if (isObject$9(prototype = getPrototypeOf$4(target))) {
      return set(prototype, propertyKey, V, receiver);
    }
    ownDescriptor = createPropertyDescriptor$2(0);
  }
  if (isDataDescriptor(ownDescriptor)) {
    if (ownDescriptor.writable === false || !isObject$9(receiver)) return false;
    if (existingDescriptor = getOwnPropertyDescriptorModule$1.f(receiver, propertyKey)) {
      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
      existingDescriptor.value = V;
      definePropertyModule$1.f(receiver, propertyKey, existingDescriptor);
    } else definePropertyModule$1.f(receiver, propertyKey, createPropertyDescriptor$2(0, V));
  } else {
    setter = ownDescriptor.set;
    if (setter === undefined) return false;
    setter.call(receiver, V);
  } return true;
}

// MS Edge 17-18 Reflect.set allows setting the property to object
// with non-writable property on the prototype
var MS_EDGE_BUG = fails$m(function () {
  var Constructor = function () { /* empty */ };
  var object = definePropertyModule$1.f(new Constructor(), 'a', { configurable: true });
  // eslint-disable-next-line es/no-reflect -- required for testing
  return Reflect.set(Constructor.prototype, 'a', 1, object) !== false;
});

$$2u({ target: 'Reflect', stat: true, forced: MS_EDGE_BUG }, {
  set: set
});

var $$2t = _export;
var anObject$1d = anObject$1C;
var aPossiblePrototype = aPossiblePrototype$2;
var objectSetPrototypeOf = objectSetPrototypeOf$1;

// `Reflect.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.setprototypeof
if (objectSetPrototypeOf) $$2t({ target: 'Reflect', stat: true }, {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    anObject$1d(target);
    aPossiblePrototype(proto);
    try {
      objectSetPrototypeOf(target, proto);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$2s = _export;
var global$l = global$R;
var setToStringTag$2 = setToStringTag$b;

$$2s({ global: true }, { Reflect: {} });

// Reflect[@@toStringTag] property
// https://tc39.es/ecma262/#sec-reflect-@@tostringtag
setToStringTag$2(global$l.Reflect, 'Reflect', true);

var isObject$8 = isObject$C;
var classof$4 = classofRaw$1;
var wellKnownSymbol$j = wellKnownSymbol$G;

var MATCH$2 = wellKnownSymbol$j('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject$8(it) && ((isRegExp = it[MATCH$2]) !== undefined ? !!isRegExp : classof$4(it) == 'RegExp');
};

var anObject$1c = anObject$1C;

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags$1 = function () {
  var that = anObject$1c(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

var regexpStickyHelpers = {};

var fails$l = fails$15;
var global$k = global$R;

// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
var $RegExp$2 = global$k.RegExp;

regexpStickyHelpers.UNSUPPORTED_Y = fails$l(function () {
  var re = $RegExp$2('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

regexpStickyHelpers.BROKEN_CARET = fails$l(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = $RegExp$2('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});

var fails$k = fails$15;
var global$j = global$R;

// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
var $RegExp$1 = global$j.RegExp;

var regexpUnsupportedDotAll = fails$k(function () {
  var re = $RegExp$1('.', 's');
  return !(re.dotAll && re.exec('\n') && re.flags === 's');
});

var fails$j = fails$15;
var global$i = global$R;

// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
var $RegExp = global$i.RegExp;

var regexpUnsupportedNcg = fails$j(function () {
  var re = $RegExp('(?<a>b)', 'g');
  return re.exec('b').groups.a !== 'b' ||
    'b'.replace(re, '$<a>c') !== 'bc';
});

var DESCRIPTORS$9 = descriptors;
var global$h = global$R;
var isForced = isForced_1;
var inheritIfRequired$1 = inheritIfRequired$4;
var createNonEnumerableProperty$8 = createNonEnumerableProperty$h;
var defineProperty$5 = objectDefineProperty.f;
var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
var isRegExp$4 = isRegexp;
var toString$i = toString$t;
var getFlags = regexpFlags$1;
var stickyHelpers$2 = regexpStickyHelpers;
var redefine$7 = redefine$l.exports;
var fails$i = fails$15;
var has$5 = has$m;
var enforceInternalState = internalState.enforce;
var setSpecies$2 = setSpecies$7;
var wellKnownSymbol$i = wellKnownSymbol$G;
var UNSUPPORTED_DOT_ALL$2 = regexpUnsupportedDotAll;
var UNSUPPORTED_NCG$1 = regexpUnsupportedNcg;

var MATCH$1 = wellKnownSymbol$i('match');
var NativeRegExp = global$h.RegExp;
var RegExpPrototype$6 = NativeRegExp.prototype;
// TODO: Use only propper RegExpIdentifierName
var IS_NCG = /^\?<[^\s\d!#%&*+<=>@^][^\s!#%&*+<=>@^]*>/;
var re1 = /a/g;
var re2 = /a/g;

// "new" should create a new object, old webkit bug
var CORRECT_NEW = new NativeRegExp(re1) !== re1;

var UNSUPPORTED_Y$3 = stickyHelpers$2.UNSUPPORTED_Y;

var BASE_FORCED = DESCRIPTORS$9 &&
  (!CORRECT_NEW || UNSUPPORTED_Y$3 || UNSUPPORTED_DOT_ALL$2 || UNSUPPORTED_NCG$1 || fails$i(function () {
    re2[MATCH$1] = false;
    // RegExp constructor can alter flags and IsRegExp works correct with @@match
    return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
  }));

var handleDotAll = function (string) {
  var length = string.length;
  var index = 0;
  var result = '';
  var brackets = false;
  var chr;
  for (; index <= length; index++) {
    chr = string.charAt(index);
    if (chr === '\\') {
      result += chr + string.charAt(++index);
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
  var names = {};
  var brackets = false;
  var ncg = false;
  var groupid = 0;
  var groupname = '';
  var chr;
  for (; index <= length; index++) {
    chr = string.charAt(index);
    if (chr === '\\') {
      chr = chr + string.charAt(++index);
    } else if (chr === ']') {
      brackets = false;
    } else if (!brackets) switch (true) {
      case chr === '[':
        brackets = true;
        break;
      case chr === '(':
        if (IS_NCG.test(string.slice(index + 1))) {
          index += 2;
          ncg = true;
        }
        result += chr;
        groupid++;
        continue;
      case chr === '>' && ncg:
        if (groupname === '' || has$5(names, groupname)) {
          throw new SyntaxError('Invalid capture group name');
        }
        names[groupname] = true;
        named.push([groupname, groupid]);
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
    var thisIsRegExp = this instanceof RegExpWrapper;
    var patternIsRegExp = isRegExp$4(pattern);
    var flagsAreUndefined = flags === undefined;
    var groups = [];
    var rawPattern = pattern;
    var rawFlags, dotAll, sticky, handled, result, state;

    if (!thisIsRegExp && patternIsRegExp && flagsAreUndefined && pattern.constructor === RegExpWrapper) {
      return pattern;
    }

    if (patternIsRegExp || pattern instanceof RegExpWrapper) {
      pattern = pattern.source;
      if (flagsAreUndefined) flags = 'flags' in rawPattern ? rawPattern.flags : getFlags.call(rawPattern);
    }

    pattern = pattern === undefined ? '' : toString$i(pattern);
    flags = flags === undefined ? '' : toString$i(flags);
    rawPattern = pattern;

    if (UNSUPPORTED_DOT_ALL$2 && 'dotAll' in re1) {
      dotAll = !!flags && flags.indexOf('s') > -1;
      if (dotAll) flags = flags.replace(/s/g, '');
    }

    rawFlags = flags;

    if (UNSUPPORTED_Y$3 && 'sticky' in re1) {
      sticky = !!flags && flags.indexOf('y') > -1;
      if (sticky) flags = flags.replace(/y/g, '');
    }

    if (UNSUPPORTED_NCG$1) {
      handled = handleNCG(pattern);
      pattern = handled[0];
      groups = handled[1];
    }

    result = inheritIfRequired$1(NativeRegExp(pattern, flags), thisIsRegExp ? this : RegExpPrototype$6, RegExpWrapper);

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
      createNonEnumerableProperty$8(result, 'source', rawPattern === '' ? '(?:)' : rawPattern);
    } catch (error) { /* empty */ }

    return result;
  };

  var proxy = function (key) {
    key in RegExpWrapper || defineProperty$5(RegExpWrapper, key, {
      configurable: true,
      get: function () { return NativeRegExp[key]; },
      set: function (it) { NativeRegExp[key] = it; }
    });
  };

  for (var keys = getOwnPropertyNames$1(NativeRegExp), index = 0; keys.length > index;) {
    proxy(keys[index++]);
  }

  RegExpPrototype$6.constructor = RegExpWrapper;
  RegExpWrapper.prototype = RegExpPrototype$6;
  redefine$7(global$h, 'RegExp', RegExpWrapper);
}

// https://tc39.es/ecma262/#sec-get-regexp-@@species
setSpecies$2('RegExp');

var DESCRIPTORS$8 = descriptors;
var UNSUPPORTED_DOT_ALL$1 = regexpUnsupportedDotAll;
var defineProperty$4 = objectDefineProperty.f;
var getInternalState$d = internalState.get;
var RegExpPrototype$5 = RegExp.prototype;

// `RegExp.prototype.dotAll` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.dotall
if (DESCRIPTORS$8 && UNSUPPORTED_DOT_ALL$1) {
  defineProperty$4(RegExpPrototype$5, 'dotAll', {
    configurable: true,
    get: function () {
      if (this === RegExpPrototype$5) return undefined;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (this instanceof RegExp) {
        return !!getInternalState$d(this).dotAll;
      }
      throw TypeError('Incompatible receiver, RegExp required');
    }
  });
}

/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
/* eslint-disable regexp/no-useless-quantifier -- testing */
var toString$h = toString$t;
var regexpFlags = regexpFlags$1;
var stickyHelpers$1 = regexpStickyHelpers;
var shared$2 = shared$7.exports;
var create$7 = objectCreate$1;
var getInternalState$c = internalState.get;
var UNSUPPORTED_DOT_ALL = regexpUnsupportedDotAll;
var UNSUPPORTED_NCG = regexpUnsupportedNcg;

var nativeExec = RegExp.prototype.exec;
var nativeReplace = shared$2('native-string-replace', String.prototype.replace);

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y$2 = stickyHelpers$1.UNSUPPORTED_Y || stickyHelpers$1.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$2 || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;

if (PATCH) {
  // eslint-disable-next-line max-statements -- TODO
  patchedExec = function exec(string) {
    var re = this;
    var state = getInternalState$c(re);
    var str = toString$h(string);
    var raw = state.raw;
    var result, reCopy, lastIndex, match, i, object, group;

    if (raw) {
      raw.lastIndex = re.lastIndex;
      result = patchedExec.call(raw, str);
      re.lastIndex = raw.lastIndex;
      return result;
    }

    var groups = state.groups;
    var sticky = UNSUPPORTED_Y$2 && re.sticky;
    var flags = regexpFlags.call(re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = flags.replace('y', '');
      if (flags.indexOf('g') === -1) {
        flags += 'g';
      }

      strCopy = str.slice(re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str.charAt(re.lastIndex - 1) !== '\n')) {
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

    match = nativeExec.call(sticky ? reCopy : re, strCopy);

    if (sticky) {
      if (match) {
        match.input = match.input.slice(charsAdded);
        match[0] = match[0].slice(charsAdded);
        match.index = re.lastIndex;
        re.lastIndex += match[0].length;
      } else re.lastIndex = 0;
    } else if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    if (match && groups) {
      match.groups = object = create$7(null);
      for (i = 0; i < groups.length; i++) {
        group = groups[i];
        object[group[0]] = match[group[1]];
      }
    }

    return match;
  };
}

var regexpExec$3 = patchedExec;

var $$2r = _export;
var exec = regexpExec$3;

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
$$2r({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
  exec: exec
});

var DESCRIPTORS$7 = descriptors;
var objectDefinePropertyModule = objectDefineProperty;
var regExpFlags = regexpFlags$1;
var fails$h = fails$15;

var FORCED$a = DESCRIPTORS$7 && fails$h(function () {
  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
  return Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get.call({ dotAll: true, sticky: true }) !== 'sy';
});

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
if (FORCED$a) objectDefinePropertyModule.f(RegExp.prototype, 'flags', {
  configurable: true,
  get: regExpFlags
});

var DESCRIPTORS$6 = descriptors;
var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y;
var defineProperty$3 = objectDefineProperty.f;
var getInternalState$b = internalState.get;
var RegExpPrototype$4 = RegExp.prototype;

// `RegExp.prototype.sticky` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.sticky
if (DESCRIPTORS$6 && UNSUPPORTED_Y$1) {
  defineProperty$3(RegExpPrototype$4, 'sticky', {
    configurable: true,
    get: function () {
      if (this === RegExpPrototype$4) return undefined;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (this instanceof RegExp) {
        return !!getInternalState$b(this).sticky;
      }
      throw TypeError('Incompatible receiver, RegExp required');
    }
  });
}

// TODO: Remove from `core-js@4` since it's moved to entry points

var $$2q = _export;
var isCallable$a = isCallable$z;
var isObject$7 = isObject$C;

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
$$2q({ target: 'RegExp', proto: true, forced: !DELEGATES_TO_EXEC }, {
  test: function (str) {
    var exec = this.exec;
    if (!isCallable$a(exec)) return nativeTest.call(this, str);
    var result = exec.call(this, str);
    if (result !== null && !isObject$7(result)) {
      throw new Error('RegExp exec method returned something other than an Object or null');
    }
    return !!result;
  }
});

var PROPER_FUNCTION_NAME$2 = functionName.PROPER;
var redefine$6 = redefine$l.exports;
var anObject$1b = anObject$1C;
var $toString$2 = toString$t;
var fails$g = fails$15;
var flags = regexpFlags$1;

var TO_STRING = 'toString';
var RegExpPrototype$3 = RegExp.prototype;
var nativeToString = RegExpPrototype$3[TO_STRING];

var NOT_GENERIC = fails$g(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = PROPER_FUNCTION_NAME$2 && nativeToString.name != TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine$6(RegExp.prototype, TO_STRING, function toString() {
    var R = anObject$1b(this);
    var p = $toString$2(R.source);
    var rf = R.flags;
    var f = $toString$2(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype$3) ? flags.call(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}

var collection$2 = collection$4;
var collectionStrong = collectionStrong$2;

// `Set` constructor
// https://tc39.es/ecma262/#sec-set-objects
var es_set = collection$2('Set', function (init) {
  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong);

var $$2p = _export;
var requireObjectCoercible$d = requireObjectCoercible$j;
var toInteger$6 = toInteger$i;
var toLength$i = toLength$D;
var toString$g = toString$t;
var fails$f = fails$15;

var FORCED$9 = fails$f(function () {
  return '𠮷'.at(0) !== '\uD842';
});

// `String.prototype.at` method
// https://github.com/tc39/proposal-relative-indexing-method
$$2p({ target: 'String', proto: true, forced: FORCED$9 }, {
  at: function at(index) {
    var S = toString$g(requireObjectCoercible$d(this));
    var len = toLength$i(S.length);
    var relativeIndex = toInteger$6(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : S.charAt(k);
  }
});

var toInteger$5 = toInteger$i;
var toString$f = toString$t;
var requireObjectCoercible$c = requireObjectCoercible$j;

// `String.prototype.codePointAt` methods implementation
var createMethod$2 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString$f(requireObjectCoercible$c($this));
    var position = toInteger$5(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$2(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$2(true)
};

var $$2o = _export;
var codeAt$2 = stringMultibyte.codeAt;

// `String.prototype.codePointAt` method
// https://tc39.es/ecma262/#sec-string.prototype.codepointat
$$2o({ target: 'String', proto: true }, {
  codePointAt: function codePointAt(pos) {
    return codeAt$2(this, pos);
  }
});

var isRegExp$3 = isRegexp;

var notARegexp = function (it) {
  if (isRegExp$3(it)) {
    throw TypeError("The method doesn't accept regular expressions");
  } return it;
};

var wellKnownSymbol$h = wellKnownSymbol$G;

var MATCH = wellKnownSymbol$h('match');

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

var $$2n = _export;
var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var toLength$h = toLength$D;
var toString$e = toString$t;
var notARegExp$2 = notARegexp;
var requireObjectCoercible$b = requireObjectCoercible$j;
var correctIsRegExpLogic$2 = correctIsRegexpLogic;

// eslint-disable-next-line es/no-string-prototype-endswith -- safe
var $endsWith = ''.endsWith;
var min$5 = Math.min;

var CORRECT_IS_REGEXP_LOGIC$1 = correctIsRegExpLogic$2('endsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG$1 = !CORRECT_IS_REGEXP_LOGIC$1 && !!function () {
  var descriptor = getOwnPropertyDescriptor$1(String.prototype, 'endsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.endsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.endswith
$$2n({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG$1 && !CORRECT_IS_REGEXP_LOGIC$1 }, {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = toString$e(requireObjectCoercible$b(this));
    notARegExp$2(searchString);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength$h(that.length);
    var end = endPosition === undefined ? len : min$5(toLength$h(endPosition), len);
    var search = toString$e(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});

var $$2m = _export;
var toAbsoluteIndex$1 = toAbsoluteIndex$8;

var fromCharCode$1 = String.fromCharCode;
// eslint-disable-next-line es/no-string-fromcodepoint -- required for testing
var $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
var INCORRECT_LENGTH = !!$fromCodePoint && $fromCodePoint.length != 1;

// `String.fromCodePoint` method
// https://tc39.es/ecma262/#sec-string.fromcodepoint
$$2m({ target: 'String', stat: true, forced: INCORRECT_LENGTH }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  fromCodePoint: function fromCodePoint(x) {
    var elements = [];
    var length = arguments.length;
    var i = 0;
    var code;
    while (length > i) {
      code = +arguments[i++];
      if (toAbsoluteIndex$1(code, 0x10FFFF) !== code) throw RangeError(code + ' is not a valid code point');
      elements.push(code < 0x10000
        ? fromCharCode$1(code)
        : fromCharCode$1(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00)
      );
    } return elements.join('');
  }
});

var $$2l = _export;
var notARegExp$1 = notARegexp;
var requireObjectCoercible$a = requireObjectCoercible$j;
var toString$d = toString$t;
var correctIsRegExpLogic$1 = correctIsRegexpLogic;

// `String.prototype.includes` method
// https://tc39.es/ecma262/#sec-string.prototype.includes
$$2l({ target: 'String', proto: true, forced: !correctIsRegExpLogic$1('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~toString$d(requireObjectCoercible$a(this))
      .indexOf(toString$d(notARegExp$1(searchString)), arguments.length > 1 ? arguments[1] : undefined);
  }
});

var charAt$3 = stringMultibyte.charAt;
var toString$c = toString$t;
var InternalStateModule$d = internalState;
var defineIterator = defineIterator$3;

var STRING_ITERATOR$1 = 'String Iterator';
var setInternalState$d = InternalStateModule$d.set;
var getInternalState$a = InternalStateModule$d.getterFor(STRING_ITERATOR$1);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState$d(this, {
    type: STRING_ITERATOR$1,
    string: toString$c(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$a(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt$3(string, index);
  state.index += point.length;
  return { value: point, done: false };
});

// TODO: Remove from `core-js@4` since it's moved to entry points

var redefine$5 = redefine$l.exports;
var regexpExec$2 = regexpExec$3;
var fails$e = fails$15;
var wellKnownSymbol$g = wellKnownSymbol$G;
var createNonEnumerableProperty$7 = createNonEnumerableProperty$h;

var SPECIES = wellKnownSymbol$g('species');
var RegExpPrototype$2 = RegExp.prototype;

var fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
  var SYMBOL = wellKnownSymbol$g(KEY);

  var DELEGATES_TO_SYMBOL = !fails$e(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$e(function () {
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

    re.exec = function () { execCalled = true; return null; };

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
      if ($exec === regexpExec$2 || $exec === RegExpPrototype$2.exec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    });

    redefine$5(String.prototype, KEY, methods[0]);
    redefine$5(RegExpPrototype$2, SYMBOL, methods[1]);
  }

  if (SHAM) createNonEnumerableProperty$7(RegExpPrototype$2[SYMBOL], 'sham', true);
};

var charAt$2 = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
var advanceStringIndex$4 = function (S, index, unicode) {
  return index + (unicode ? charAt$2(S, index).length : 1);
};

var anObject$1a = anObject$1C;
var isCallable$9 = isCallable$z;
var classof$3 = classofRaw$1;
var regexpExec$1 = regexpExec$3;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
var regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (isCallable$9(exec)) {
    var result = exec.call(R, S);
    if (result !== null) anObject$1a(result);
    return result;
  }
  if (classof$3(R) === 'RegExp') return regexpExec$1.call(R, S);
  throw TypeError('RegExp#exec called on incompatible receiver');
};

var fixRegExpWellKnownSymbolLogic$3 = fixRegexpWellKnownSymbolLogic;
var anObject$19 = anObject$1C;
var toLength$g = toLength$D;
var toString$b = toString$t;
var requireObjectCoercible$9 = requireObjectCoercible$j;
var getMethod$d = getMethod$h;
var advanceStringIndex$3 = advanceStringIndex$4;
var regExpExec$3 = regexpExecAbstract;

// @@match logic
fixRegExpWellKnownSymbolLogic$3('match', function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.es/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible$9(this);
      var matcher = regexp == undefined ? undefined : getMethod$d(regexp, MATCH);
      return matcher ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](toString$b(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
    function (string) {
      var rx = anObject$19(this);
      var S = toString$b(string);
      var res = maybeCallNative(nativeMatch, rx, S);

      if (res.done) return res.value;

      if (!rx.global) return regExpExec$3(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec$3(rx, S)) !== null) {
        var matchStr = toString$b(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex$3(S, toLength$g(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

/* eslint-disable es/no-string-prototype-matchall -- safe */
var $$2k = _export;
var createIteratorConstructor$5 = createIteratorConstructor$7;
var requireObjectCoercible$8 = requireObjectCoercible$j;
var toLength$f = toLength$D;
var toString$a = toString$t;
var anObject$18 = anObject$1C;
var classof$2 = classofRaw$1;
var isRegExp$2 = isRegexp;
var getRegExpFlags$1 = regexpFlags$1;
var getMethod$c = getMethod$h;
var redefine$4 = redefine$l.exports;
var fails$d = fails$15;
var wellKnownSymbol$f = wellKnownSymbol$G;
var speciesConstructor$b = speciesConstructor$f;
var advanceStringIndex$2 = advanceStringIndex$4;
var regExpExec$2 = regexpExecAbstract;
var InternalStateModule$c = internalState;
var IS_PURE$D = isPure;

var MATCH_ALL = wellKnownSymbol$f('matchAll');
var REGEXP_STRING = 'RegExp String';
var REGEXP_STRING_ITERATOR = REGEXP_STRING + ' Iterator';
var setInternalState$c = InternalStateModule$c.set;
var getInternalState$9 = InternalStateModule$c.getterFor(REGEXP_STRING_ITERATOR);
var RegExpPrototype$1 = RegExp.prototype;
var nativeMatchAll = ''.matchAll;

var WORKS_WITH_NON_GLOBAL_REGEX = !!nativeMatchAll && !fails$d(function () {
  'a'.matchAll(/./);
});

// eslint-disable-next-line max-len -- ignore
var $RegExpStringIterator = createIteratorConstructor$5(function RegExpStringIterator(regexp, string, global, fullUnicode) {
  setInternalState$c(this, {
    type: REGEXP_STRING_ITERATOR,
    regexp: regexp,
    string: string,
    global: global,
    unicode: fullUnicode,
    done: false
  });
}, REGEXP_STRING, function next() {
  var state = getInternalState$9(this);
  if (state.done) return { value: undefined, done: true };
  var R = state.regexp;
  var S = state.string;
  var match = regExpExec$2(R, S);
  if (match === null) return { value: undefined, done: state.done = true };
  if (state.global) {
    if (toString$a(match[0]) === '') R.lastIndex = advanceStringIndex$2(S, toLength$f(R.lastIndex), state.unicode);
    return { value: match, done: false };
  }
  state.done = true;
  return { value: match, done: false };
});

var $matchAll = function (string) {
  var R = anObject$18(this);
  var S = toString$a(string);
  var C, flagsValue, flags, matcher, global, fullUnicode;
  C = speciesConstructor$b(R, RegExp);
  flagsValue = R.flags;
  if (flagsValue === undefined && R instanceof RegExp && !('flags' in RegExpPrototype$1)) {
    flagsValue = getRegExpFlags$1.call(R);
  }
  flags = flagsValue === undefined ? '' : toString$a(flagsValue);
  matcher = new C(C === RegExp ? R.source : R, flags);
  global = !!~flags.indexOf('g');
  fullUnicode = !!~flags.indexOf('u');
  matcher.lastIndex = toLength$f(R.lastIndex);
  return new $RegExpStringIterator(matcher, S, global, fullUnicode);
};

// `String.prototype.matchAll` method
// https://tc39.es/ecma262/#sec-string.prototype.matchall
$$2k({ target: 'String', proto: true, forced: WORKS_WITH_NON_GLOBAL_REGEX }, {
  matchAll: function matchAll(regexp) {
    var O = requireObjectCoercible$8(this);
    var flags, S, matcher, rx;
    if (regexp != null) {
      if (isRegExp$2(regexp)) {
        flags = toString$a(requireObjectCoercible$8('flags' in RegExpPrototype$1
          ? regexp.flags
          : getRegExpFlags$1.call(regexp)
        ));
        if (!~flags.indexOf('g')) throw TypeError('`.matchAll` does not allow non-global regexes');
      }
      if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll.apply(O, arguments);
      matcher = getMethod$c(regexp, MATCH_ALL);
      if (matcher === undefined && IS_PURE$D && classof$2(regexp) == 'RegExp') matcher = $matchAll;
      if (matcher) return matcher.call(regexp, O);
    } else if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll.apply(O, arguments);
    S = toString$a(O);
    rx = new RegExp(regexp, 'g');
    return rx[MATCH_ALL](S);
  }
});

MATCH_ALL in RegExpPrototype$1 || redefine$4(RegExpPrototype$1, MATCH_ALL, $matchAll);

// https://github.com/zloirock/core-js/issues/280
var userAgent$1 = engineUserAgent;

var stringPadWebkitBug = /Version\/10(?:\.\d+){1,2}(?: [\w./]+)?(?: Mobile\/\w+)? Safari\//.test(userAgent$1);

var $$2j = _export;
var $padEnd = stringPad.end;
var WEBKIT_BUG$1 = stringPadWebkitBug;

// `String.prototype.padEnd` method
// https://tc39.es/ecma262/#sec-string.prototype.padend
$$2j({ target: 'String', proto: true, forced: WEBKIT_BUG$1 }, {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return $padEnd(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$2i = _export;
var $padStart = stringPad.start;
var WEBKIT_BUG = stringPadWebkitBug;

// `String.prototype.padStart` method
// https://tc39.es/ecma262/#sec-string.prototype.padstart
$$2i({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$2h = _export;
var toIndexedObject = toIndexedObject$d;
var toObject$c = toObject$z;
var toLength$e = toLength$D;
var toString$9 = toString$t;

var ArrayPrototype = Array.prototype;
var push$3 = ArrayPrototype.push;
var join = ArrayPrototype.join;

// `String.raw` method
// https://tc39.es/ecma262/#sec-string.raw
$$2h({ target: 'String', stat: true }, {
  raw: function raw(template) {
    var rawTemplate = toIndexedObject(toObject$c(template).raw);
    var literalSegments = toLength$e(rawTemplate.length);
    var argumentsLength = arguments.length;
    var elements = [];
    var i = 0;
    while (literalSegments > i) {
      push$3.call(elements, toString$9(rawTemplate[i++]));
      if (i < argumentsLength) push$3.call(elements, toString$9(arguments[i]));
    } return join.call(elements, '');
  }
});

var $$2g = _export;
var repeat = stringRepeat;

// `String.prototype.repeat` method
// https://tc39.es/ecma262/#sec-string.prototype.repeat
$$2g({ target: 'String', proto: true }, {
  repeat: repeat
});

var toObject$b = toObject$z;

var floor$3 = Math.floor;
var replace$1 = ''.replace;
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

// `GetSubstitution` abstract operation
// https://tc39.es/ecma262/#sec-getsubstitution
var getSubstitution$2 = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject$b(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace$1.call(replacement, symbols, function (match, ch) {
    var capture;
    switch (ch.charAt(0)) {
      case '$': return '$';
      case '&': return matched;
      case '`': return str.slice(0, position);
      case "'": return str.slice(tailPos);
      case '<':
        capture = namedCaptures[ch.slice(1, -1)];
        break;
      default: // \d\d?
        var n = +ch;
        if (n === 0) return match;
        if (n > m) {
          var f = floor$3(n / 10);
          if (f === 0) return match;
          if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
          return match;
        }
        capture = captures[n - 1];
    }
    return capture === undefined ? '' : capture;
  });
};

var fixRegExpWellKnownSymbolLogic$2 = fixRegexpWellKnownSymbolLogic;
var fails$c = fails$15;
var anObject$17 = anObject$1C;
var isCallable$8 = isCallable$z;
var toInteger$4 = toInteger$i;
var toLength$d = toLength$D;
var toString$8 = toString$t;
var requireObjectCoercible$7 = requireObjectCoercible$j;
var advanceStringIndex$1 = advanceStringIndex$4;
var getMethod$b = getMethod$h;
var getSubstitution$1 = getSubstitution$2;
var regExpExec$1 = regexpExecAbstract;
var wellKnownSymbol$e = wellKnownSymbol$G;

var REPLACE$1 = wellKnownSymbol$e('replace');
var max$3 = Math.max;
var min$4 = Math.min;

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

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails$c(function () {
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
      var O = requireObjectCoercible$7(this);
      var replacer = searchValue == undefined ? undefined : getMethod$b(searchValue, REPLACE$1);
      return replacer
        ? replacer.call(searchValue, O, replaceValue)
        : nativeReplace.call(toString$8(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (string, replaceValue) {
      var rx = anObject$17(this);
      var S = toString$8(string);

      if (
        typeof replaceValue === 'string' &&
        replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1 &&
        replaceValue.indexOf('$<') === -1
      ) {
        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
        if (res.done) return res.value;
      }

      var functionalReplace = isCallable$8(replaceValue);
      if (!functionalReplace) replaceValue = toString$8(replaceValue);

      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec$1(rx, S);
        if (result === null) break;

        results.push(result);
        if (!global) break;

        var matchStr = toString$8(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex$1(S, toLength$d(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = toString$8(result[0]);
        var position = max$3(min$4(toInteger$4(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = toString$8(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution$1(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];
}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);

var $$2f = _export;
var requireObjectCoercible$6 = requireObjectCoercible$j;
var isCallable$7 = isCallable$z;
var isRegExp$1 = isRegexp;
var toString$7 = toString$t;
var getMethod$a = getMethod$h;
var getRegExpFlags = regexpFlags$1;
var getSubstitution = getSubstitution$2;
var wellKnownSymbol$d = wellKnownSymbol$G;

var REPLACE = wellKnownSymbol$d('replace');
var RegExpPrototype = RegExp.prototype;
var max$2 = Math.max;

var stringIndexOf = function (string, searchValue, fromIndex) {
  if (fromIndex > string.length) return -1;
  if (searchValue === '') return fromIndex;
  return string.indexOf(searchValue, fromIndex);
};

// `String.prototype.replaceAll` method
// https://tc39.es/ecma262/#sec-string.prototype.replaceall
$$2f({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    var O = requireObjectCoercible$6(this);
    var IS_REG_EXP, flags, replacer, string, searchString, functionalReplace, searchLength, advanceBy, replacement;
    var position = 0;
    var endOfLastMatch = 0;
    var result = '';
    if (searchValue != null) {
      IS_REG_EXP = isRegExp$1(searchValue);
      if (IS_REG_EXP) {
        flags = toString$7(requireObjectCoercible$6('flags' in RegExpPrototype
          ? searchValue.flags
          : getRegExpFlags.call(searchValue)
        ));
        if (!~flags.indexOf('g')) throw TypeError('`.replaceAll` does not allow non-global regexes');
      }
      replacer = getMethod$a(searchValue, REPLACE);
      if (replacer) {
        return replacer.call(searchValue, O, replaceValue);
      }
    }
    string = toString$7(O);
    searchString = toString$7(searchValue);
    functionalReplace = isCallable$7(replaceValue);
    if (!functionalReplace) replaceValue = toString$7(replaceValue);
    searchLength = searchString.length;
    advanceBy = max$2(1, searchLength);
    position = stringIndexOf(string, searchString, 0);
    while (position !== -1) {
      if (functionalReplace) {
        replacement = toString$7(replaceValue(searchString, position, string));
      } else {
        replacement = getSubstitution(searchString, string, position, [], undefined, replaceValue);
      }
      result += string.slice(endOfLastMatch, position) + replacement;
      endOfLastMatch = position + searchLength;
      position = stringIndexOf(string, searchString, position + advanceBy);
    }
    if (endOfLastMatch < string.length) {
      result += string.slice(endOfLastMatch);
    }
    return result;
  }
});

var fixRegExpWellKnownSymbolLogic$1 = fixRegexpWellKnownSymbolLogic;
var anObject$16 = anObject$1C;
var requireObjectCoercible$5 = requireObjectCoercible$j;
var sameValue = sameValue$1;
var toString$6 = toString$t;
var getMethod$9 = getMethod$h;
var regExpExec = regexpExecAbstract;

// @@search logic
fixRegExpWellKnownSymbolLogic$1('search', function (SEARCH, nativeSearch, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.es/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = requireObjectCoercible$5(this);
      var searcher = regexp == undefined ? undefined : getMethod$9(regexp, SEARCH);
      return searcher ? searcher.call(regexp, O) : new RegExp(regexp)[SEARCH](toString$6(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@search
    function (string) {
      var rx = anObject$16(this);
      var S = toString$6(string);
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

var fixRegExpWellKnownSymbolLogic = fixRegexpWellKnownSymbolLogic;
var isRegExp = isRegexp;
var anObject$15 = anObject$1C;
var requireObjectCoercible$4 = requireObjectCoercible$j;
var speciesConstructor$a = speciesConstructor$f;
var advanceStringIndex = advanceStringIndex$4;
var toLength$c = toLength$D;
var toString$5 = toString$t;
var getMethod$8 = getMethod$h;
var callRegExpExec = regexpExecAbstract;
var regexpExec = regexpExec$3;
var stickyHelpers = regexpStickyHelpers;
var fails$b = fails$15;

var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y;
var arrayPush = [].push;
var min$3 = Math.min;
var MAX_UINT32 = 0xFFFFFFFF;

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails$b(function () {
  // eslint-disable-next-line regexp/no-empty-group -- required for testing
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

// @@split logic
fixRegExpWellKnownSymbolLogic('split', function (SPLIT, nativeSplit, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'.split(/(b)*/)[1] == 'c' ||
    // eslint-disable-next-line regexp/no-empty-group -- required for testing
    'test'.split(/(?:)/, -1).length != 4 ||
    'ab'.split(/(?:ab)*/).length != 2 ||
    '.'.split(/(.?)(.?)/).length != 4 ||
    // eslint-disable-next-line regexp/no-empty-capturing-group, regexp/no-empty-group -- required for testing
    '.'.split(/()()/).length > 1 ||
    ''.split(/.?/).length
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = toString$5(requireObjectCoercible$4(this));
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (separator === undefined) return [string];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) {
        return nativeSplit.call(string, separator, lim);
      }
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy.lastIndex;
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
          lastLength = match[0].length;
          lastLastIndex = lastIndex;
          if (output.length >= lim) break;
        }
        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
      }
      if (lastLastIndex === string.length) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output.length > lim ? output.slice(0, lim) : output;
    };
  // Chakra, V8
  } else if ('0'.split(undefined, 0).length) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
    };
  } else internalSplit = nativeSplit;

  return [
    // `String.prototype.split` method
    // https://tc39.es/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible$4(this);
      var splitter = separator == undefined ? undefined : getMethod$8(separator, SPLIT);
      return splitter
        ? splitter.call(separator, O, limit)
        : internalSplit.call(toString$5(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (string, limit) {
      var rx = anObject$15(this);
      var S = toString$5(string);
      var res = maybeCallNative(internalSplit, rx, S, limit, internalSplit !== nativeSplit);

      if (res.done) return res.value;

      var C = speciesConstructor$a(rx, RegExp);

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
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = UNSUPPORTED_Y ? 0 : q;
        var z = callRegExpExec(splitter, UNSUPPORTED_Y ? S.slice(q) : S);
        var e;
        if (
          z === null ||
          (e = min$3(toLength$c(splitter.lastIndex + (UNSUPPORTED_Y ? q : 0)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
}, !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC, UNSUPPORTED_Y);

var $$2e = _export;
var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
var toLength$b = toLength$D;
var toString$4 = toString$t;
var notARegExp = notARegexp;
var requireObjectCoercible$3 = requireObjectCoercible$j;
var correctIsRegExpLogic = correctIsRegexpLogic;

// eslint-disable-next-line es/no-string-prototype-startswith -- safe
var $startsWith = ''.startsWith;
var min$2 = Math.min;

var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic('startsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG = !CORRECT_IS_REGEXP_LOGIC && !!function () {
  var descriptor = getOwnPropertyDescriptor(String.prototype, 'startsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.startsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.startswith
$$2e({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = toString$4(requireObjectCoercible$3(this));
    notARegExp(searchString);
    var index = toLength$b(min$2(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = toString$4(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});

var $$2d = _export;
var requireObjectCoercible$2 = requireObjectCoercible$j;
var toInteger$3 = toInteger$i;
var toString$3 = toString$t;

var slice$1 = ''.slice;
var max$1 = Math.max;
var min$1 = Math.min;

// eslint-disable-next-line unicorn/prefer-string-slice -- required for testing
var FORCED$8 = !''.substr || 'ab'.substr(-1) !== 'b';

// `String.prototype.substr` method
// https://tc39.es/ecma262/#sec-string.prototype.substr
$$2d({ target: 'String', proto: true, forced: FORCED$8 }, {
  substr: function substr(start, length) {
    var that = toString$3(requireObjectCoercible$2(this));
    var size = that.length;
    var intStart = toInteger$3(start);
    var intLength, intEnd;
    if (intStart === Infinity) intStart = 0;
    if (intStart < 0) intStart = max$1(size + intStart, 0);
    intLength = length === undefined ? size : toInteger$3(length);
    if (intLength <= 0 || intLength === Infinity) return '';
    intEnd = min$1(intStart + intLength, size);
    return intStart >= intEnd ? '' : slice$1.call(that, intStart, intEnd);
  }
});

var PROPER_FUNCTION_NAME$1 = functionName.PROPER;
var fails$a = fails$15;
var whitespaces = whitespaces$4;

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
var stringTrimForced = function (METHOD_NAME) {
  return fails$a(function () {
    return !!whitespaces[METHOD_NAME]()
      || non[METHOD_NAME]() !== non
      || (PROPER_FUNCTION_NAME$1 && whitespaces[METHOD_NAME].name !== METHOD_NAME);
  });
};

var $$2c = _export;
var $trim = stringTrim.trim;
var forcedStringTrimMethod$2 = stringTrimForced;

// `String.prototype.trim` method
// https://tc39.es/ecma262/#sec-string.prototype.trim
$$2c({ target: 'String', proto: true, forced: forcedStringTrimMethod$2('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});

var $$2b = _export;
var $trimEnd = stringTrim.end;
var forcedStringTrimMethod$1 = stringTrimForced;

var FORCED$7 = forcedStringTrimMethod$1('trimEnd');

var trimEnd = FORCED$7 ? function trimEnd() {
  return $trimEnd(this);
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
} : ''.trimEnd;

// `String.prototype.{ trimEnd, trimRight }` methods
// https://tc39.es/ecma262/#sec-string.prototype.trimend
// https://tc39.es/ecma262/#String.prototype.trimright
$$2b({ target: 'String', proto: true, name: 'trimEnd', forced: FORCED$7 }, {
  trimEnd: trimEnd,
  trimRight: trimEnd
});

var $$2a = _export;
var $trimStart = stringTrim.start;
var forcedStringTrimMethod = stringTrimForced;

var FORCED$6 = forcedStringTrimMethod('trimStart');

var trimStart = FORCED$6 ? function trimStart() {
  return $trimStart(this);
// eslint-disable-next-line es/no-string-prototype-trimstart-trimend -- safe
} : ''.trimStart;

// `String.prototype.{ trimStart, trimLeft }` methods
// https://tc39.es/ecma262/#sec-string.prototype.trimstart
// https://tc39.es/ecma262/#String.prototype.trimleft
$$2a({ target: 'String', proto: true, name: 'trimStart', forced: FORCED$6 }, {
  trimStart: trimStart,
  trimLeft: trimStart
});

var requireObjectCoercible$1 = requireObjectCoercible$j;
var toString$2 = toString$t;

var quot = /"/g;

// `CreateHTML` abstract operation
// https://tc39.es/ecma262/#sec-createhtml
var createHtml = function (string, tag, attribute, value) {
  var S = toString$2(requireObjectCoercible$1(string));
  var p1 = '<' + tag;
  if (attribute !== '') p1 += ' ' + attribute + '="' + toString$2(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};

var fails$9 = fails$15;

// check the existence of a method, lowercase
// of a tag and escaping quotes in arguments
var stringHtmlForced = function (METHOD_NAME) {
  return fails$9(function () {
    var test = ''[METHOD_NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  });
};

var $$29 = _export;
var createHTML$c = createHtml;
var forcedStringHTMLMethod$c = stringHtmlForced;

// `String.prototype.anchor` method
// https://tc39.es/ecma262/#sec-string.prototype.anchor
$$29({ target: 'String', proto: true, forced: forcedStringHTMLMethod$c('anchor') }, {
  anchor: function anchor(name) {
    return createHTML$c(this, 'a', 'name', name);
  }
});

var $$28 = _export;
var createHTML$b = createHtml;
var forcedStringHTMLMethod$b = stringHtmlForced;

// `String.prototype.big` method
// https://tc39.es/ecma262/#sec-string.prototype.big
$$28({ target: 'String', proto: true, forced: forcedStringHTMLMethod$b('big') }, {
  big: function big() {
    return createHTML$b(this, 'big', '', '');
  }
});

var $$27 = _export;
var createHTML$a = createHtml;
var forcedStringHTMLMethod$a = stringHtmlForced;

// `String.prototype.blink` method
// https://tc39.es/ecma262/#sec-string.prototype.blink
$$27({ target: 'String', proto: true, forced: forcedStringHTMLMethod$a('blink') }, {
  blink: function blink() {
    return createHTML$a(this, 'blink', '', '');
  }
});

var $$26 = _export;
var createHTML$9 = createHtml;
var forcedStringHTMLMethod$9 = stringHtmlForced;

// `String.prototype.bold` method
// https://tc39.es/ecma262/#sec-string.prototype.bold
$$26({ target: 'String', proto: true, forced: forcedStringHTMLMethod$9('bold') }, {
  bold: function bold() {
    return createHTML$9(this, 'b', '', '');
  }
});

var $$25 = _export;
var createHTML$8 = createHtml;
var forcedStringHTMLMethod$8 = stringHtmlForced;

// `String.prototype.fixed` method
// https://tc39.es/ecma262/#sec-string.prototype.fixed
$$25({ target: 'String', proto: true, forced: forcedStringHTMLMethod$8('fixed') }, {
  fixed: function fixed() {
    return createHTML$8(this, 'tt', '', '');
  }
});

var $$24 = _export;
var createHTML$7 = createHtml;
var forcedStringHTMLMethod$7 = stringHtmlForced;

// `String.prototype.fontcolor` method
// https://tc39.es/ecma262/#sec-string.prototype.fontcolor
$$24({ target: 'String', proto: true, forced: forcedStringHTMLMethod$7('fontcolor') }, {
  fontcolor: function fontcolor(color) {
    return createHTML$7(this, 'font', 'color', color);
  }
});

var $$23 = _export;
var createHTML$6 = createHtml;
var forcedStringHTMLMethod$6 = stringHtmlForced;

// `String.prototype.fontsize` method
// https://tc39.es/ecma262/#sec-string.prototype.fontsize
$$23({ target: 'String', proto: true, forced: forcedStringHTMLMethod$6('fontsize') }, {
  fontsize: function fontsize(size) {
    return createHTML$6(this, 'font', 'size', size);
  }
});

var $$22 = _export;
var createHTML$5 = createHtml;
var forcedStringHTMLMethod$5 = stringHtmlForced;

// `String.prototype.italics` method
// https://tc39.es/ecma262/#sec-string.prototype.italics
$$22({ target: 'String', proto: true, forced: forcedStringHTMLMethod$5('italics') }, {
  italics: function italics() {
    return createHTML$5(this, 'i', '', '');
  }
});

var $$21 = _export;
var createHTML$4 = createHtml;
var forcedStringHTMLMethod$4 = stringHtmlForced;

// `String.prototype.link` method
// https://tc39.es/ecma262/#sec-string.prototype.link
$$21({ target: 'String', proto: true, forced: forcedStringHTMLMethod$4('link') }, {
  link: function link(url) {
    return createHTML$4(this, 'a', 'href', url);
  }
});

var $$20 = _export;
var createHTML$3 = createHtml;
var forcedStringHTMLMethod$3 = stringHtmlForced;

// `String.prototype.small` method
// https://tc39.es/ecma262/#sec-string.prototype.small
$$20({ target: 'String', proto: true, forced: forcedStringHTMLMethod$3('small') }, {
  small: function small() {
    return createHTML$3(this, 'small', '', '');
  }
});

var $$1$ = _export;
var createHTML$2 = createHtml;
var forcedStringHTMLMethod$2 = stringHtmlForced;

// `String.prototype.strike` method
// https://tc39.es/ecma262/#sec-string.prototype.strike
$$1$({ target: 'String', proto: true, forced: forcedStringHTMLMethod$2('strike') }, {
  strike: function strike() {
    return createHTML$2(this, 'strike', '', '');
  }
});

var $$1_ = _export;
var createHTML$1 = createHtml;
var forcedStringHTMLMethod$1 = stringHtmlForced;

// `String.prototype.sub` method
// https://tc39.es/ecma262/#sec-string.prototype.sub
$$1_({ target: 'String', proto: true, forced: forcedStringHTMLMethod$1('sub') }, {
  sub: function sub() {
    return createHTML$1(this, 'sub', '', '');
  }
});

var $$1Z = _export;
var createHTML = createHtml;
var forcedStringHTMLMethod = stringHtmlForced;

// `String.prototype.sup` method
// https://tc39.es/ecma262/#sec-string.prototype.sup
$$1Z({ target: 'String', proto: true, forced: forcedStringHTMLMethod('sup') }, {
  sup: function sup() {
    return createHTML(this, 'sup', '', '');
  }
});

var typedArrayConstructor = {exports: {}};

/* eslint-disable no-new -- required for testing */

var global$g = global$R;
var fails$8 = fails$15;
var checkCorrectnessOfIteration = checkCorrectnessOfIteration$4;
var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

var ArrayBuffer$2 = global$g.ArrayBuffer;
var Int8Array$2 = global$g.Int8Array;

var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails$8(function () {
  Int8Array$2(1);
}) || !fails$8(function () {
  new Int8Array$2(-1);
}) || !checkCorrectnessOfIteration(function (iterable) {
  new Int8Array$2();
  new Int8Array$2(null);
  new Int8Array$2(1.5);
  new Int8Array$2(iterable);
}, true) || fails$8(function () {
  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
  return new Int8Array$2(new ArrayBuffer$2(2), 1, undefined).length !== 1;
});

var toInteger$2 = toInteger$i;

var toPositiveInteger$5 = function (it) {
  var result = toInteger$2(it);
  if (result < 0) throw RangeError("The argument can't be less than 0");
  return result;
};

var toPositiveInteger$4 = toPositiveInteger$5;

var toOffset$2 = function (it, BYTES) {
  var offset = toPositiveInteger$4(it);
  if (offset % BYTES) throw RangeError('Wrong offset');
  return offset;
};

var aConstructor$2 = aConstructor$5;
var toObject$a = toObject$z;
var toLength$a = toLength$D;
var getIterator$8 = getIterator$b;
var getIteratorMethod$5 = getIteratorMethod$9;
var isArrayIteratorMethod = isArrayIteratorMethod$3;
var bind$h = functionBindContext;
var aTypedArrayConstructor$4 = arrayBufferViewCore.aTypedArrayConstructor;

var typedArrayFrom$2 = function from(source /* , mapfn, thisArg */) {
  var C = aConstructor$2(this);
  var O = toObject$a(source);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod$5(O);
  var i, length, result, step, iterator, next;
  if (iteratorMethod && !isArrayIteratorMethod(iteratorMethod)) {
    iterator = getIterator$8(O, iteratorMethod);
    next = iterator.next;
    O = [];
    while (!(step = next.call(iterator)).done) {
      O.push(step.value);
    }
  }
  if (mapping && argumentsLength > 2) {
    mapfn = bind$h(mapfn, arguments[2], 2);
  }
  length = toLength$a(O.length);
  result = new (aTypedArrayConstructor$4(C))(length);
  for (i = 0; length > i; i++) {
    result[i] = mapping ? mapfn(O[i], i) : O[i];
  }
  return result;
};

var $$1Y = _export;
var global$f = global$R;
var DESCRIPTORS$5 = descriptors;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$3 = typedArrayConstructorsRequireWrappers;
var ArrayBufferViewCore$w = arrayBufferViewCore;
var ArrayBufferModule = arrayBuffer;
var anInstance$6 = anInstance$b;
var createPropertyDescriptor$1 = createPropertyDescriptor$9;
var createNonEnumerableProperty$6 = createNonEnumerableProperty$h;
var isInteger = isInteger$3;
var toLength$9 = toLength$D;
var toIndex = toIndex$2;
var toOffset$1 = toOffset$2;
var toPropertyKey$1 = toPropertyKey$9;
var has$4 = has$m;
var classof$1 = classof$c;
var isObject$6 = isObject$C;
var isSymbol = isSymbol$5;
var create$6 = objectCreate$1;
var setPrototypeOf = objectSetPrototypeOf$1;
var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var typedArrayFrom$1 = typedArrayFrom$2;
var forEach$1 = arrayIteration.forEach;
var setSpecies$1 = setSpecies$7;
var definePropertyModule = objectDefineProperty;
var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
var InternalStateModule$b = internalState;
var inheritIfRequired = inheritIfRequired$4;

var getInternalState$8 = InternalStateModule$b.get;
var setInternalState$b = InternalStateModule$b.set;
var nativeDefineProperty = definePropertyModule.f;
var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
var round = Math.round;
var RangeError$1 = global$f.RangeError;
var ArrayBuffer$1 = ArrayBufferModule.ArrayBuffer;
var DataView$1 = ArrayBufferModule.DataView;
var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore$w.NATIVE_ARRAY_BUFFER_VIEWS;
var TYPED_ARRAY_CONSTRUCTOR$1 = ArrayBufferViewCore$w.TYPED_ARRAY_CONSTRUCTOR;
var TYPED_ARRAY_TAG = ArrayBufferViewCore$w.TYPED_ARRAY_TAG;
var TypedArray = ArrayBufferViewCore$w.TypedArray;
var TypedArrayPrototype = ArrayBufferViewCore$w.TypedArrayPrototype;
var aTypedArrayConstructor$3 = ArrayBufferViewCore$w.aTypedArrayConstructor;
var isTypedArray = ArrayBufferViewCore$w.isTypedArray;
var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
var WRONG_LENGTH = 'Wrong length';

var fromList = function (C, list) {
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor$3(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var addGetter = function (it, key) {
  nativeDefineProperty(it, key, { get: function () {
    return getInternalState$8(this)[key];
  } });
};

var isArrayBuffer = function (it) {
  var klass;
  return it instanceof ArrayBuffer$1 || (klass = classof$1(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
};

var isTypedArrayIndex = function (target, key) {
  return isTypedArray(target)
    && !isSymbol(key)
    && key in target
    && isInteger(+key)
    && key >= 0;
};

var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
  key = toPropertyKey$1(key);
  return isTypedArrayIndex(target, key)
    ? createPropertyDescriptor$1(2, target[key])
    : nativeGetOwnPropertyDescriptor(target, key);
};

var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
  key = toPropertyKey$1(key);
  if (isTypedArrayIndex(target, key)
    && isObject$6(descriptor)
    && has$4(descriptor, 'value')
    && !has$4(descriptor, 'get')
    && !has$4(descriptor, 'set')
    // TODO: add validation descriptor w/o calling accessors
    && !descriptor.configurable
    && (!has$4(descriptor, 'writable') || descriptor.writable)
    && (!has$4(descriptor, 'enumerable') || descriptor.enumerable)
  ) {
    target[key] = descriptor.value;
    return target;
  } return nativeDefineProperty(target, key, descriptor);
};

if (DESCRIPTORS$5) {
  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
    getOwnPropertyDescriptorModule.f = wrappedGetOwnPropertyDescriptor;
    definePropertyModule.f = wrappedDefineProperty;
    addGetter(TypedArrayPrototype, 'buffer');
    addGetter(TypedArrayPrototype, 'byteOffset');
    addGetter(TypedArrayPrototype, 'byteLength');
    addGetter(TypedArrayPrototype, 'length');
  }

  $$1Y({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
    defineProperty: wrappedDefineProperty
  });

  typedArrayConstructor.exports = function (TYPE, wrapper, CLAMPED) {
    var BYTES = TYPE.match(/\d+$/)[0] / 8;
    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + TYPE;
    var SETTER = 'set' + TYPE;
    var NativeTypedArrayConstructor = global$f[CONSTRUCTOR_NAME];
    var TypedArrayConstructor = NativeTypedArrayConstructor;
    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
    var exported = {};

    var getter = function (that, index) {
      var data = getInternalState$8(that);
      return data.view[GETTER](index * BYTES + data.byteOffset, true);
    };

    var setter = function (that, index, value) {
      var data = getInternalState$8(that);
      if (CLAMPED) value = (value = round(value)) < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
      data.view[SETTER](index * BYTES + data.byteOffset, value, true);
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
        anInstance$6(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
        var index = 0;
        var byteOffset = 0;
        var buffer, byteLength, length;
        if (!isObject$6(data)) {
          length = toIndex(data);
          byteLength = length * BYTES;
          buffer = new ArrayBuffer$1(byteLength);
        } else if (isArrayBuffer(data)) {
          buffer = data;
          byteOffset = toOffset$1(offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw RangeError$1(WRONG_LENGTH);
            byteLength = $len - byteOffset;
            if (byteLength < 0) throw RangeError$1(WRONG_LENGTH);
          } else {
            byteLength = toLength$9($length) * BYTES;
            if (byteLength + byteOffset > $len) throw RangeError$1(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (isTypedArray(data)) {
          return fromList(TypedArrayConstructor, data);
        } else {
          return typedArrayFrom$1.call(TypedArrayConstructor, data);
        }
        setInternalState$b(that, {
          buffer: buffer,
          byteOffset: byteOffset,
          byteLength: byteLength,
          length: length,
          view: new DataView$1(buffer)
        });
        while (index < length) addElement(that, index++);
      });

      if (setPrototypeOf) setPrototypeOf(TypedArrayConstructor, TypedArray);
      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = create$6(TypedArrayPrototype);
    } else if (TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$3) {
      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
        anInstance$6(dummy, TypedArrayConstructor, CONSTRUCTOR_NAME);
        return inheritIfRequired(function () {
          if (!isObject$6(data)) return new NativeTypedArrayConstructor(toIndex(data));
          if (isArrayBuffer(data)) return $length !== undefined
            ? new NativeTypedArrayConstructor(data, toOffset$1(typedArrayOffset, BYTES), $length)
            : typedArrayOffset !== undefined
              ? new NativeTypedArrayConstructor(data, toOffset$1(typedArrayOffset, BYTES))
              : new NativeTypedArrayConstructor(data);
          if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
          return typedArrayFrom$1.call(TypedArrayConstructor, data);
        }(), dummy, TypedArrayConstructor);
      });

      if (setPrototypeOf) setPrototypeOf(TypedArrayConstructor, TypedArray);
      forEach$1(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
        if (!(key in TypedArrayConstructor)) {
          createNonEnumerableProperty$6(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
        }
      });
      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
    }

    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
      createNonEnumerableProperty$6(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
    }

    createNonEnumerableProperty$6(TypedArrayConstructorPrototype, TYPED_ARRAY_CONSTRUCTOR$1, TypedArrayConstructor);

    if (TYPED_ARRAY_TAG) {
      createNonEnumerableProperty$6(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
    }

    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

    $$1Y({
      global: true, forced: TypedArrayConstructor != NativeTypedArrayConstructor, sham: !NATIVE_ARRAY_BUFFER_VIEWS
    }, exported);

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
      createNonEnumerableProperty$6(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
    }

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
      createNonEnumerableProperty$6(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
    }

    setSpecies$1(CONSTRUCTOR_NAME);
  };
} else typedArrayConstructor.exports = function () { /* empty */ };

var createTypedArrayConstructor$8 = typedArrayConstructor.exports;

// `Float32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$8('Float32', function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$7 = typedArrayConstructor.exports;

// `Float64Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$7('Float64', function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$6 = typedArrayConstructor.exports;

// `Int8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$6('Int8', function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$5 = typedArrayConstructor.exports;

// `Int16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$5('Int16', function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$4 = typedArrayConstructor.exports;

// `Int32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$4('Int32', function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$3 = typedArrayConstructor.exports;

// `Uint8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$3('Uint8', function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$2 = typedArrayConstructor.exports;

// `Uint8ClampedArray` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$2('Uint8', function (init) {
  return function Uint8ClampedArray(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
}, true);

var createTypedArrayConstructor$1 = typedArrayConstructor.exports;

// `Uint16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$1('Uint16', function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor = typedArrayConstructor.exports;

// `Uint32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor('Uint32', function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var ArrayBufferViewCore$v = arrayBufferViewCore;
var toLength$8 = toLength$D;
var toInteger$1 = toInteger$i;

var aTypedArray$s = ArrayBufferViewCore$v.aTypedArray;
var exportTypedArrayMethod$t = ArrayBufferViewCore$v.exportTypedArrayMethod;

// `%TypedArray%.prototype.at` method
// https://github.com/tc39/proposal-relative-indexing-method
exportTypedArrayMethod$t('at', function at(index) {
  var O = aTypedArray$s(this);
  var len = toLength$8(O.length);
  var relativeIndex = toInteger$1(index);
  var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
  return (k < 0 || k >= len) ? undefined : O[k];
});

var ArrayBufferViewCore$u = arrayBufferViewCore;
var $copyWithin = arrayCopyWithin;

var aTypedArray$r = ArrayBufferViewCore$u.aTypedArray;
var exportTypedArrayMethod$s = ArrayBufferViewCore$u.exportTypedArrayMethod;

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
exportTypedArrayMethod$s('copyWithin', function copyWithin(target, start /* , end */) {
  return $copyWithin.call(aTypedArray$r(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
});

var ArrayBufferViewCore$t = arrayBufferViewCore;
var $every$1 = arrayIteration.every;

var aTypedArray$q = ArrayBufferViewCore$t.aTypedArray;
var exportTypedArrayMethod$r = ArrayBufferViewCore$t.exportTypedArrayMethod;

// `%TypedArray%.prototype.every` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
exportTypedArrayMethod$r('every', function every(callbackfn /* , thisArg */) {
  return $every$1(aTypedArray$q(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$s = arrayBufferViewCore;
var $fill = arrayFill$1;

var aTypedArray$p = ArrayBufferViewCore$s.aTypedArray;
var exportTypedArrayMethod$q = ArrayBufferViewCore$s.exportTypedArrayMethod;

// `%TypedArray%.prototype.fill` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
// eslint-disable-next-line no-unused-vars -- required for `.length`
exportTypedArrayMethod$q('fill', function fill(value /* , start, end */) {
  return $fill.apply(aTypedArray$p(this), arguments);
});

var arrayFromConstructorAndList$3 = function (Constructor, list) {
  var index = 0;
  var length = list.length;
  var result = new Constructor(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var ArrayBufferViewCore$r = arrayBufferViewCore;
var speciesConstructor$9 = speciesConstructor$f;

var TYPED_ARRAY_CONSTRUCTOR = ArrayBufferViewCore$r.TYPED_ARRAY_CONSTRUCTOR;
var aTypedArrayConstructor$2 = ArrayBufferViewCore$r.aTypedArrayConstructor;

// a part of `TypedArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#typedarray-species-create
var typedArraySpeciesConstructor$5 = function (originalArray) {
  return aTypedArrayConstructor$2(speciesConstructor$9(originalArray, originalArray[TYPED_ARRAY_CONSTRUCTOR]));
};

var arrayFromConstructorAndList$2 = arrayFromConstructorAndList$3;
var typedArraySpeciesConstructor$4 = typedArraySpeciesConstructor$5;

var typedArrayFromSpeciesAndList = function (instance, list) {
  return arrayFromConstructorAndList$2(typedArraySpeciesConstructor$4(instance), list);
};

var ArrayBufferViewCore$q = arrayBufferViewCore;
var $filter = arrayIteration.filter;
var fromSpeciesAndList$3 = typedArrayFromSpeciesAndList;

var aTypedArray$o = ArrayBufferViewCore$q.aTypedArray;
var exportTypedArrayMethod$p = ArrayBufferViewCore$q.exportTypedArrayMethod;

// `%TypedArray%.prototype.filter` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
exportTypedArrayMethod$p('filter', function filter(callbackfn /* , thisArg */) {
  var list = $filter(aTypedArray$o(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  return fromSpeciesAndList$3(this, list);
});

var ArrayBufferViewCore$p = arrayBufferViewCore;
var $find$1 = arrayIteration.find;

var aTypedArray$n = ArrayBufferViewCore$p.aTypedArray;
var exportTypedArrayMethod$o = ArrayBufferViewCore$p.exportTypedArrayMethod;

// `%TypedArray%.prototype.find` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
exportTypedArrayMethod$o('find', function find(predicate /* , thisArg */) {
  return $find$1(aTypedArray$n(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$o = arrayBufferViewCore;
var $findIndex = arrayIteration.findIndex;

var aTypedArray$m = ArrayBufferViewCore$o.aTypedArray;
var exportTypedArrayMethod$n = ArrayBufferViewCore$o.exportTypedArrayMethod;

// `%TypedArray%.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
exportTypedArrayMethod$n('findIndex', function findIndex(predicate /* , thisArg */) {
  return $findIndex(aTypedArray$m(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$n = arrayBufferViewCore;
var $forEach$1 = arrayIteration.forEach;

var aTypedArray$l = ArrayBufferViewCore$n.aTypedArray;
var exportTypedArrayMethod$m = ArrayBufferViewCore$n.exportTypedArrayMethod;

// `%TypedArray%.prototype.forEach` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
exportTypedArrayMethod$m('forEach', function forEach(callbackfn /* , thisArg */) {
  $forEach$1(aTypedArray$l(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$2 = typedArrayConstructorsRequireWrappers;
var exportTypedArrayStaticMethod$2 = arrayBufferViewCore.exportTypedArrayStaticMethod;
var typedArrayFrom = typedArrayFrom$2;

// `%TypedArray%.from` method
// https://tc39.es/ecma262/#sec-%typedarray%.from
exportTypedArrayStaticMethod$2('from', typedArrayFrom, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$2);

var ArrayBufferViewCore$m = arrayBufferViewCore;
var $includes = arrayIncludes.includes;

var aTypedArray$k = ArrayBufferViewCore$m.aTypedArray;
var exportTypedArrayMethod$l = ArrayBufferViewCore$m.exportTypedArrayMethod;

// `%TypedArray%.prototype.includes` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
exportTypedArrayMethod$l('includes', function includes(searchElement /* , fromIndex */) {
  return $includes(aTypedArray$k(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$l = arrayBufferViewCore;
var $indexOf = arrayIncludes.indexOf;

var aTypedArray$j = ArrayBufferViewCore$l.aTypedArray;
var exportTypedArrayMethod$k = ArrayBufferViewCore$l.exportTypedArrayMethod;

// `%TypedArray%.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
exportTypedArrayMethod$k('indexOf', function indexOf(searchElement /* , fromIndex */) {
  return $indexOf(aTypedArray$j(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var global$e = global$R;
var PROPER_FUNCTION_NAME = functionName.PROPER;
var ArrayBufferViewCore$k = arrayBufferViewCore;
var ArrayIterators = es_array_iterator;
var wellKnownSymbol$c = wellKnownSymbol$G;

var ITERATOR$3 = wellKnownSymbol$c('iterator');
var Uint8Array$1 = global$e.Uint8Array;
var arrayValues = ArrayIterators.values;
var arrayKeys = ArrayIterators.keys;
var arrayEntries = ArrayIterators.entries;
var aTypedArray$i = ArrayBufferViewCore$k.aTypedArray;
var exportTypedArrayMethod$j = ArrayBufferViewCore$k.exportTypedArrayMethod;
var nativeTypedArrayIterator = Uint8Array$1 && Uint8Array$1.prototype[ITERATOR$3];

var PROPER_ARRAY_VALUES_NAME = !!nativeTypedArrayIterator && nativeTypedArrayIterator.name === 'values';

var typedArrayValues = function values() {
  return arrayValues.call(aTypedArray$i(this));
};

// `%TypedArray%.prototype.entries` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
exportTypedArrayMethod$j('entries', function entries() {
  return arrayEntries.call(aTypedArray$i(this));
});
// `%TypedArray%.prototype.keys` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
exportTypedArrayMethod$j('keys', function keys() {
  return arrayKeys.call(aTypedArray$i(this));
});
// `%TypedArray%.prototype.values` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
exportTypedArrayMethod$j('values', typedArrayValues, PROPER_FUNCTION_NAME && !PROPER_ARRAY_VALUES_NAME);
// `%TypedArray%.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
exportTypedArrayMethod$j(ITERATOR$3, typedArrayValues, PROPER_FUNCTION_NAME && !PROPER_ARRAY_VALUES_NAME);

var ArrayBufferViewCore$j = arrayBufferViewCore;

var aTypedArray$h = ArrayBufferViewCore$j.aTypedArray;
var exportTypedArrayMethod$i = ArrayBufferViewCore$j.exportTypedArrayMethod;
var $join = [].join;

// `%TypedArray%.prototype.join` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
// eslint-disable-next-line no-unused-vars -- required for `.length`
exportTypedArrayMethod$i('join', function join(separator) {
  return $join.apply(aTypedArray$h(this), arguments);
});

var ArrayBufferViewCore$i = arrayBufferViewCore;
var $lastIndexOf = arrayLastIndexOf;

var aTypedArray$g = ArrayBufferViewCore$i.aTypedArray;
var exportTypedArrayMethod$h = ArrayBufferViewCore$i.exportTypedArrayMethod;

// `%TypedArray%.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
// eslint-disable-next-line no-unused-vars -- required for `.length`
exportTypedArrayMethod$h('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
  return $lastIndexOf.apply(aTypedArray$g(this), arguments);
});

var ArrayBufferViewCore$h = arrayBufferViewCore;
var $map = arrayIteration.map;
var typedArraySpeciesConstructor$3 = typedArraySpeciesConstructor$5;

var aTypedArray$f = ArrayBufferViewCore$h.aTypedArray;
var exportTypedArrayMethod$g = ArrayBufferViewCore$h.exportTypedArrayMethod;

// `%TypedArray%.prototype.map` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
exportTypedArrayMethod$g('map', function map(mapfn /* , thisArg */) {
  return $map(aTypedArray$f(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
    return new (typedArraySpeciesConstructor$3(O))(length);
  });
});

var ArrayBufferViewCore$g = arrayBufferViewCore;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1 = typedArrayConstructorsRequireWrappers;

var aTypedArrayConstructor$1 = ArrayBufferViewCore$g.aTypedArrayConstructor;
var exportTypedArrayStaticMethod$1 = ArrayBufferViewCore$g.exportTypedArrayStaticMethod;

// `%TypedArray%.of` method
// https://tc39.es/ecma262/#sec-%typedarray%.of
exportTypedArrayStaticMethod$1('of', function of(/* ...items */) {
  var index = 0;
  var length = arguments.length;
  var result = new (aTypedArrayConstructor$1(this))(length);
  while (length > index) result[index] = arguments[index++];
  return result;
}, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1);

var ArrayBufferViewCore$f = arrayBufferViewCore;
var $reduce = arrayReduce.left;

var aTypedArray$e = ArrayBufferViewCore$f.aTypedArray;
var exportTypedArrayMethod$f = ArrayBufferViewCore$f.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduce` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
exportTypedArrayMethod$f('reduce', function reduce(callbackfn /* , initialValue */) {
  return $reduce(aTypedArray$e(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$e = arrayBufferViewCore;
var $reduceRight = arrayReduce.right;

var aTypedArray$d = ArrayBufferViewCore$e.aTypedArray;
var exportTypedArrayMethod$e = ArrayBufferViewCore$e.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduceRicht` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
exportTypedArrayMethod$e('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
  return $reduceRight(aTypedArray$d(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$d = arrayBufferViewCore;

var aTypedArray$c = ArrayBufferViewCore$d.aTypedArray;
var exportTypedArrayMethod$d = ArrayBufferViewCore$d.exportTypedArrayMethod;
var floor$2 = Math.floor;

// `%TypedArray%.prototype.reverse` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
exportTypedArrayMethod$d('reverse', function reverse() {
  var that = this;
  var length = aTypedArray$c(that).length;
  var middle = floor$2(length / 2);
  var index = 0;
  var value;
  while (index < middle) {
    value = that[index];
    that[index++] = that[--length];
    that[length] = value;
  } return that;
});

var ArrayBufferViewCore$c = arrayBufferViewCore;
var toLength$7 = toLength$D;
var toOffset = toOffset$2;
var toObject$9 = toObject$z;
var fails$7 = fails$15;

var aTypedArray$b = ArrayBufferViewCore$c.aTypedArray;
var exportTypedArrayMethod$c = ArrayBufferViewCore$c.exportTypedArrayMethod;

var FORCED$5 = fails$7(function () {
  // eslint-disable-next-line es/no-typed-arrays -- required for testing
  new Int8Array(1).set({});
});

// `%TypedArray%.prototype.set` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
exportTypedArrayMethod$c('set', function set(arrayLike /* , offset */) {
  aTypedArray$b(this);
  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
  var length = this.length;
  var src = toObject$9(arrayLike);
  var len = toLength$7(src.length);
  var index = 0;
  if (len + offset > length) throw RangeError('Wrong length');
  while (index < len) this[offset + index] = src[index++];
}, FORCED$5);

var ArrayBufferViewCore$b = arrayBufferViewCore;
var typedArraySpeciesConstructor$2 = typedArraySpeciesConstructor$5;
var fails$6 = fails$15;

var aTypedArray$a = ArrayBufferViewCore$b.aTypedArray;
var exportTypedArrayMethod$b = ArrayBufferViewCore$b.exportTypedArrayMethod;
var $slice$1 = [].slice;

var FORCED$4 = fails$6(function () {
  // eslint-disable-next-line es/no-typed-arrays -- required for testing
  new Int8Array(1).slice();
});

// `%TypedArray%.prototype.slice` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
exportTypedArrayMethod$b('slice', function slice(start, end) {
  var list = $slice$1.call(aTypedArray$a(this), start, end);
  var C = typedArraySpeciesConstructor$2(this);
  var index = 0;
  var length = list.length;
  var result = new C(length);
  while (length > index) result[index] = list[index++];
  return result;
}, FORCED$4);

var ArrayBufferViewCore$a = arrayBufferViewCore;
var $some$1 = arrayIteration.some;

var aTypedArray$9 = ArrayBufferViewCore$a.aTypedArray;
var exportTypedArrayMethod$a = ArrayBufferViewCore$a.exportTypedArrayMethod;

// `%TypedArray%.prototype.some` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
exportTypedArrayMethod$a('some', function some(callbackfn /* , thisArg */) {
  return $some$1(aTypedArray$9(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$9 = arrayBufferViewCore;
var global$d = global$R;
var fails$5 = fails$15;
var aCallable$B = aCallable$Q;
var toLength$6 = toLength$D;
var internalSort = arraySort;
var FF = engineFfVersion;
var IE_OR_EDGE = engineIsIeOrEdge;
var V8 = engineV8Version;
var WEBKIT = engineWebkitVersion;

var aTypedArray$8 = ArrayBufferViewCore$9.aTypedArray;
var exportTypedArrayMethod$9 = ArrayBufferViewCore$9.exportTypedArrayMethod;
var Uint16Array = global$d.Uint16Array;
var nativeSort = Uint16Array && Uint16Array.prototype.sort;

// WebKit
var ACCEPT_INCORRECT_ARGUMENTS = !!nativeSort && !fails$5(function () {
  var array = new Uint16Array(2);
  array.sort(null);
  array.sort({});
});

var STABLE_SORT = !!nativeSort && !fails$5(function () {
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

  array.sort(function (a, b) {
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
exportTypedArrayMethod$9('sort', function sort(comparefn) {
  var array = this;
  if (comparefn !== undefined) aCallable$B(comparefn);
  if (STABLE_SORT) return nativeSort.call(array, comparefn);

  aTypedArray$8(array);
  var arrayLength = toLength$6(array.length);
  var items = Array(arrayLength);
  var index;

  for (index = 0; index < arrayLength; index++) {
    items[index] = array[index];
  }

  items = internalSort(array, getSortCompare(comparefn));

  for (index = 0; index < arrayLength; index++) {
    array[index] = items[index];
  }

  return array;
}, !STABLE_SORT || ACCEPT_INCORRECT_ARGUMENTS);

var ArrayBufferViewCore$8 = arrayBufferViewCore;
var toLength$5 = toLength$D;
var toAbsoluteIndex = toAbsoluteIndex$8;
var typedArraySpeciesConstructor$1 = typedArraySpeciesConstructor$5;

var aTypedArray$7 = ArrayBufferViewCore$8.aTypedArray;
var exportTypedArrayMethod$8 = ArrayBufferViewCore$8.exportTypedArrayMethod;

// `%TypedArray%.prototype.subarray` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
exportTypedArrayMethod$8('subarray', function subarray(begin, end) {
  var O = aTypedArray$7(this);
  var length = O.length;
  var beginIndex = toAbsoluteIndex(begin, length);
  var C = typedArraySpeciesConstructor$1(O);
  return new C(
    O.buffer,
    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
    toLength$5((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
  );
});

var global$c = global$R;
var ArrayBufferViewCore$7 = arrayBufferViewCore;
var fails$4 = fails$15;

var Int8Array$1 = global$c.Int8Array;
var aTypedArray$6 = ArrayBufferViewCore$7.aTypedArray;
var exportTypedArrayMethod$7 = ArrayBufferViewCore$7.exportTypedArrayMethod;
var $toLocaleString = [].toLocaleString;
var $slice = [].slice;

// iOS Safari 6.x fails here
var TO_LOCALE_STRING_BUG = !!Int8Array$1 && fails$4(function () {
  $toLocaleString.call(new Int8Array$1(1));
});

var FORCED$3 = fails$4(function () {
  return [1, 2].toLocaleString() != new Int8Array$1([1, 2]).toLocaleString();
}) || !fails$4(function () {
  Int8Array$1.prototype.toLocaleString.call([1, 2]);
});

// `%TypedArray%.prototype.toLocaleString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
exportTypedArrayMethod$7('toLocaleString', function toLocaleString() {
  return $toLocaleString.apply(TO_LOCALE_STRING_BUG ? $slice.call(aTypedArray$6(this)) : aTypedArray$6(this), arguments);
}, FORCED$3);

var exportTypedArrayMethod$6 = arrayBufferViewCore.exportTypedArrayMethod;
var fails$3 = fails$15;
var global$b = global$R;

var Uint8Array = global$b.Uint8Array;
var Uint8ArrayPrototype = Uint8Array && Uint8Array.prototype || {};
var arrayToString = [].toString;
var arrayJoin = [].join;

if (fails$3(function () { arrayToString.call({}); })) {
  arrayToString = function toString() {
    return arrayJoin.call(this);
  };
}

var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString;

// `%TypedArray%.prototype.toString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
exportTypedArrayMethod$6('toString', arrayToString, IS_NOT_ARRAY_METHOD);

var $$1X = _export;
var toString$1 = toString$t;

var fromCharCode = String.fromCharCode;
var hex2 = /^[\da-f]{2}$/i;
var hex4 = /^[\da-f]{4}$/i;

// `unescape` method
// https://tc39.es/ecma262/#sec-unescape-string
$$1X({ global: true }, {
  unescape: function unescape(string) {
    var str = toString$1(string);
    var result = '';
    var length = str.length;
    var index = 0;
    var chr, slice;
    while (index < length) {
      chr = str.charAt(index++);
      if (chr === '%') {
        if (str.charAt(index) === 'u') {
          slice = str.slice(index + 1, index + 5);
          if (hex4.test(slice)) {
            result += fromCharCode(parseInt(slice, 16));
            index += 5;
            continue;
          }
        } else {
          slice = str.slice(index, index + 2);
          if (hex2.test(slice)) {
            result += fromCharCode(parseInt(slice, 16));
            index += 2;
            continue;
          }
        }
      }
      result += chr;
    } return result;
  }
});

var es_weakMap = {exports: {}};

var redefineAll$6 = redefineAll$a;
var getWeakData = internalMetadata.exports.getWeakData;
var anObject$14 = anObject$1C;
var isObject$5 = isObject$C;
var anInstance$5 = anInstance$b;
var iterate$A = iterate$I;
var ArrayIterationModule = arrayIteration;
var $has = has$m;
var InternalStateModule$a = internalState;

var setInternalState$a = InternalStateModule$a.set;
var internalStateGetterFor = InternalStateModule$a.getterFor;
var find$1 = ArrayIterationModule.find;
var findIndex = ArrayIterationModule.findIndex;
var id = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function (store) {
  return store.frozen || (store.frozen = new UncaughtFrozenStore());
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
    if (~index) this.entries.splice(index, 1);
    return !!~index;
  }
};

var collectionWeak$2 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance$5(that, C, CONSTRUCTOR_NAME);
      setInternalState$a(that, {
        type: CONSTRUCTOR_NAME,
        id: id++,
        frozen: undefined
      });
      if (iterable != undefined) iterate$A(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var data = getWeakData(anObject$14(key), true);
      if (data === true) uncaughtFrozenStore(state).set(key, value);
      else data[state.id] = value;
      return that;
    };

    redefineAll$6(C.prototype, {
      // `{ WeakMap, WeakSet }.prototype.delete(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.delete
      // https://tc39.es/ecma262/#sec-weakset.prototype.delete
      'delete': function (key) {
        var state = getInternalState(this);
        if (!isObject$5(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
        return data && $has(data, state.id) && delete data[state.id];
      },
      // `{ WeakMap, WeakSet }.prototype.has(key)` methods
      // https://tc39.es/ecma262/#sec-weakmap.prototype.has
      // https://tc39.es/ecma262/#sec-weakset.prototype.has
      has: function has(key) {
        var state = getInternalState(this);
        if (!isObject$5(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state).has(key);
        return data && $has(data, state.id);
      }
    });

    redefineAll$6(C.prototype, IS_MAP ? {
      // `WeakMap.prototype.get(key)` method
      // https://tc39.es/ecma262/#sec-weakmap.prototype.get
      get: function get(key) {
        var state = getInternalState(this);
        if (isObject$5(key)) {
          var data = getWeakData(key);
          if (data === true) return uncaughtFrozenStore(state).get(key);
          return data ? data[state.id] : undefined;
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

    return C;
  }
};

var global$a = global$R;
var redefineAll$5 = redefineAll$a;
var InternalMetadataModule = internalMetadata.exports;
var collection$1 = collection$4;
var collectionWeak$1 = collectionWeak$2;
var isObject$4 = isObject$C;
var enforceIternalState = internalState.enforce;
var NATIVE_WEAK_MAP = nativeWeakMap;

var IS_IE11 = !global$a.ActiveXObject && 'ActiveXObject' in global$a;
// eslint-disable-next-line es/no-object-isextensible -- safe
var isExtensible = Object.isExtensible;
var InternalWeakMap;

var wrapper = function (init) {
  return function WeakMap() {
    return init(this, arguments.length ? arguments[0] : undefined);
  };
};

// `WeakMap` constructor
// https://tc39.es/ecma262/#sec-weakmap-constructor
var $WeakMap = es_weakMap.exports = collection$1('WeakMap', wrapper, collectionWeak$1);

// IE11 WeakMap frozen keys fix
// We can't use feature detection because it crash some old IE builds
// https://github.com/zloirock/core-js/issues/485
if (NATIVE_WEAK_MAP && IS_IE11) {
  InternalWeakMap = collectionWeak$1.getConstructor(wrapper, 'WeakMap', true);
  InternalMetadataModule.enable();
  var WeakMapPrototype = $WeakMap.prototype;
  var nativeDelete = WeakMapPrototype['delete'];
  var nativeHas = WeakMapPrototype.has;
  var nativeGet = WeakMapPrototype.get;
  var nativeSet = WeakMapPrototype.set;
  redefineAll$5(WeakMapPrototype, {
    'delete': function (key) {
      if (isObject$4(key) && !isExtensible(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeDelete.call(this, key) || state.frozen['delete'](key);
      } return nativeDelete.call(this, key);
    },
    has: function has(key) {
      if (isObject$4(key) && !isExtensible(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas.call(this, key) || state.frozen.has(key);
      } return nativeHas.call(this, key);
    },
    get: function get(key) {
      if (isObject$4(key) && !isExtensible(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas.call(this, key) ? nativeGet.call(this, key) : state.frozen.get(key);
      } return nativeGet.call(this, key);
    },
    set: function set(key, value) {
      if (isObject$4(key) && !isExtensible(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        nativeHas.call(this, key) ? nativeSet.call(this, key, value) : state.frozen.set(key, value);
      } else nativeSet.call(this, key, value);
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

var global$9 = global$R;
var shared$1 = sharedStore;
var isCallable$6 = isCallable$z;
var getPrototypeOf$3 = objectGetPrototypeOf$1;
var redefine$3 = redefine$l.exports;
var wellKnownSymbol$b = wellKnownSymbol$G;

var USE_FUNCTION_CONSTRUCTOR = 'USE_FUNCTION_CONSTRUCTOR';
var ASYNC_ITERATOR$3 = wellKnownSymbol$b('asyncIterator');
var AsyncIterator = global$9.AsyncIterator;
var PassedAsyncIteratorPrototype = shared$1.AsyncIteratorPrototype;
var AsyncIteratorPrototype$4, prototype;

if (PassedAsyncIteratorPrototype) {
  AsyncIteratorPrototype$4 = PassedAsyncIteratorPrototype;
} else if (isCallable$6(AsyncIterator)) {
  AsyncIteratorPrototype$4 = AsyncIterator.prototype;
} else if (shared$1[USE_FUNCTION_CONSTRUCTOR] || global$9[USE_FUNCTION_CONSTRUCTOR]) {
  try {
    // eslint-disable-next-line no-new-func -- we have no alternatives without usage of modern syntax
    prototype = getPrototypeOf$3(getPrototypeOf$3(getPrototypeOf$3(Function('return async function*(){}()')())));
    if (getPrototypeOf$3(prototype) === Object.prototype) AsyncIteratorPrototype$4 = prototype;
  } catch (error) { /* empty */ }
}

if (!AsyncIteratorPrototype$4) AsyncIteratorPrototype$4 = {};

if (!isCallable$6(AsyncIteratorPrototype$4[ASYNC_ITERATOR$3])) {
  redefine$3(AsyncIteratorPrototype$4, ASYNC_ITERATOR$3, function () {
    return this;
  });
}

var asyncIteratorPrototype = AsyncIteratorPrototype$4;

var anObject$13 = anObject$1C;
var create$5 = objectCreate$1;
var getMethod$7 = getMethod$h;
var redefineAll$4 = redefineAll$a;
var InternalStateModule$9 = internalState;
var getBuiltIn$h = getBuiltIn$w;
var AsyncIteratorPrototype$3 = asyncIteratorPrototype;

var Promise$3 = getBuiltIn$h('Promise');

var setInternalState$9 = InternalStateModule$9.set;
var getInternalState$7 = InternalStateModule$9.get;

var asyncFromSyncIteratorContinuation = function (result, resolve, reject) {
  var done = result.done;
  Promise$3.resolve(result.value).then(function (value) {
    resolve({ done: done, value: value });
  }, reject);
};

var AsyncFromSyncIterator$3 = function AsyncIterator(iterator) {
  setInternalState$9(this, {
    iterator: anObject$13(iterator),
    next: iterator.next
  });
};

AsyncFromSyncIterator$3.prototype = redefineAll$4(create$5(AsyncIteratorPrototype$3), {
  next: function next(arg) {
    var state = getInternalState$7(this);
    var hasArg = !!arguments.length;
    return new Promise$3(function (resolve, reject) {
      var result = anObject$13(state.next.apply(state.iterator, hasArg ? [arg] : []));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  },
  'return': function (arg) {
    var iterator = getInternalState$7(this).iterator;
    var hasArg = !!arguments.length;
    return new Promise$3(function (resolve, reject) {
      var $return = getMethod$7(iterator, 'return');
      if ($return === undefined) return resolve({ done: true, value: arg });
      var result = anObject$13($return.apply(iterator, hasArg ? [arg] : []));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  },
  'throw': function (arg) {
    var iterator = getInternalState$7(this).iterator;
    var hasArg = !!arguments.length;
    return new Promise$3(function (resolve, reject) {
      var $throw = getMethod$7(iterator, 'throw');
      if ($throw === undefined) return reject(arg);
      var result = anObject$13($throw.apply(iterator, hasArg ? [arg] : []));
      asyncFromSyncIteratorContinuation(result, resolve, reject);
    });
  }
});

var asyncFromSyncIterator = AsyncFromSyncIterator$3;

var AsyncFromSyncIterator$2 = asyncFromSyncIterator;
var anObject$12 = anObject$1C;
var getIterator$7 = getIterator$b;
var getMethod$6 = getMethod$h;
var wellKnownSymbol$a = wellKnownSymbol$G;

var ASYNC_ITERATOR$2 = wellKnownSymbol$a('asyncIterator');

var getAsyncIterator$3 = function (it, usingIterator) {
  var method = arguments.length < 2 ? getMethod$6(it, ASYNC_ITERATOR$2) : usingIterator;
  return method ? anObject$12(method.call(it)) : new AsyncFromSyncIterator$2(getIterator$7(it));
};

var global$8 = global$R;

var entryVirtual = function (CONSTRUCTOR) {
  return global$8[CONSTRUCTOR].prototype;
};

// https://github.com/tc39/proposal-iterator-helpers
// https://github.com/tc39/proposal-array-from-async
var aCallable$A = aCallable$Q;
var anObject$11 = anObject$1C;
var getBuiltIn$g = getBuiltIn$w;
var getMethod$5 = getMethod$h;

var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;

var createMethod$1 = function (TYPE) {
  var IS_TO_ARRAY = TYPE == 0;
  var IS_FOR_EACH = TYPE == 1;
  var IS_EVERY = TYPE == 2;
  var IS_SOME = TYPE == 3;
  return function (iterator, fn, target) {
    anObject$11(iterator);
    var Promise = getBuiltIn$g('Promise');
    var next = aCallable$A(iterator.next);
    var index = 0;
    var MAPPING = fn !== undefined;
    if (MAPPING || !IS_TO_ARRAY) aCallable$A(fn);

    return new Promise(function (resolve, reject) {
      var closeIteration = function (method, argument) {
        try {
          var returnMethod = getMethod$5(iterator, 'return');
          if (returnMethod) {
            return Promise.resolve(returnMethod.call(iterator)).then(function () {
              method(argument);
            }, function (error) {
              reject(error);
            });
          }
        } catch (error2) {
          return reject(error2);
        } method(argument);
      };

      var onError = function (error) {
        closeIteration(reject, error);
      };

      var loop = function () {
        try {
          if (IS_TO_ARRAY && (index > MAX_SAFE_INTEGER) && MAPPING) {
            throw TypeError('The allowed number of iterations has been exceeded');
          }
          Promise.resolve(anObject$11(next.call(iterator))).then(function (step) {
            try {
              if (anObject$11(step).done) {
                if (IS_TO_ARRAY) {
                  target.length = index;
                  resolve(target);
                } else resolve(IS_SOME ? false : IS_EVERY || undefined);
              } else {
                var value = step.value;
                if (MAPPING) {
                  Promise.resolve(IS_TO_ARRAY ? fn(value, index) : fn(value)).then(function (result) {
                    if (IS_FOR_EACH) {
                      loop();
                    } else if (IS_EVERY) {
                      result ? loop() : closeIteration(resolve, false);
                    } else if (IS_TO_ARRAY) {
                      target[index++] = result;
                      loop();
                    } else {
                      result ? closeIteration(resolve, IS_SOME || value) : loop();
                    }
                  }, onError);
                } else {
                  target[index++] = value;
                  loop();
                }
              }
            } catch (error) { onError(error); }
          }, onError);
        } catch (error2) { onError(error2); }
      };

      loop();
    });
  };
};

var asyncIteratorIteration = {
  toArray: createMethod$1(0),
  forEach: createMethod$1(1),
  every: createMethod$1(2),
  some: createMethod$1(3),
  find: createMethod$1(4)
};

var bind$g = functionBindContext;
var toObject$8 = toObject$z;
var isConstructor$1 = isConstructor$7;
var getAsyncIterator$2 = getAsyncIterator$3;
var getIterator$6 = getIterator$b;
var getIteratorMethod$4 = getIteratorMethod$9;
var getMethod$4 = getMethod$h;
var getVirtual = entryVirtual;
var wellKnownSymbol$9 = wellKnownSymbol$G;
var AsyncFromSyncIterator$1 = asyncFromSyncIterator;
var toArray = asyncIteratorIteration.toArray;

var ASYNC_ITERATOR$1 = wellKnownSymbol$9('asyncIterator');
var arrayIterator = getVirtual('Array').values;

// `Array.fromAsync` method implementation
// https://github.com/tc39/proposal-array-from-async
var arrayFromAsync$1 = function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject$8(asyncItems);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  if (mapfn !== undefined) mapfn = bind$g(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  var usingAsyncIterator = getMethod$4(O, ASYNC_ITERATOR$1);
  var usingSyncIterator = usingAsyncIterator ? undefined : getIteratorMethod$4(O) || arrayIterator;
  var A = isConstructor$1(this) ? new this() : [];
  var iterator = usingAsyncIterator
    ? getAsyncIterator$2(O, usingAsyncIterator)
    : new AsyncFromSyncIterator$1(getIterator$6(O, usingSyncIterator));
  return toArray(iterator, mapfn, A);
};

var $$1W = _export;
var fromAsync = arrayFromAsync$1;

// `Array.fromAsync` method
// https://github.com/tc39/proposal-array-from-async
$$1W({ target: 'Array', stat: true }, {
  fromAsync: fromAsync
});

// TODO: remove from `core-js@4`
var $$1V = _export;
var $filterReject$3 = arrayIteration.filterReject;
var addToUnscopables$7 = addToUnscopables$h;

// `Array.prototype.filterOut` method
// https://github.com/tc39/proposal-array-filtering
$$1V({ target: 'Array', proto: true }, {
  filterOut: function filterOut(callbackfn /* , thisArg */) {
    return $filterReject$3(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$7('filterOut');

var $$1U = _export;
var $filterReject$2 = arrayIteration.filterReject;
var addToUnscopables$6 = addToUnscopables$h;

// `Array.prototype.filterReject` method
// https://github.com/tc39/proposal-array-filtering
$$1U({ target: 'Array', proto: true }, {
  filterReject: function filterReject(callbackfn /* , thisArg */) {
    return $filterReject$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$6('filterReject');

var bind$f = functionBindContext;
var IndexedObject$1 = indexedObject;
var toObject$7 = toObject$z;
var toLength$4 = toLength$D;

// `Array.prototype.{ findLast, findLastIndex }` methods implementation
var createMethod = function (TYPE) {
  var IS_FIND_LAST_INDEX = TYPE == 1;
  return function ($this, callbackfn, that) {
    var O = toObject$7($this);
    var self = IndexedObject$1(O);
    var boundFunction = bind$f(callbackfn, that, 3);
    var index = toLength$4(self.length);
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
  findLast: createMethod(0),
  // `Array.prototype.findLastIndex` method
  // https://github.com/tc39/proposal-array-find-from-last
  findLastIndex: createMethod(1)
};

var $$1T = _export;
var $findLast$1 = arrayIterationFromLast.findLast;
var addToUnscopables$5 = addToUnscopables$h;

// `Array.prototype.findLast` method
// https://github.com/tc39/proposal-array-find-from-last
$$1T({ target: 'Array', proto: true }, {
  findLast: function findLast(callbackfn /* , that = undefined */) {
    return $findLast$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$5('findLast');

var $$1S = _export;
var $findLastIndex$1 = arrayIterationFromLast.findLastIndex;
var addToUnscopables$4 = addToUnscopables$h;

// `Array.prototype.findLastIndex` method
// https://github.com/tc39/proposal-array-find-from-last
$$1S({ target: 'Array', proto: true }, {
  findLastIndex: function findLastIndex(callbackfn /* , that = undefined */) {
    return $findLastIndex$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$4('findLastIndex');

var bind$e = functionBindContext;
var IndexedObject = indexedObject;
var toObject$6 = toObject$z;
var toLength$3 = toLength$D;
var toPropertyKey = toPropertyKey$9;
var objectCreate = objectCreate$1;
var arrayFromConstructorAndList$1 = arrayFromConstructorAndList$3;

var push$2 = [].push;

var arrayGroupBy = function ($this, callbackfn, that, specificConstructor) {
  var O = toObject$6($this);
  var self = IndexedObject(O);
  var boundFunction = bind$e(callbackfn, that, 3);
  var target = objectCreate(null);
  var length = toLength$3(self.length);
  var index = 0;
  var Constructor, key, value;
  for (;length > index; index++) {
    value = self[index];
    key = toPropertyKey(boundFunction(value, index, O));
    // in some IE10 builds, `hasOwnProperty` returns incorrect result on integer keys
    // but since it's a `null` prototype object, we can safely use `in`
    if (key in target) push$2.call(target[key], value);
    else target[key] = [value];
  }
  if (specificConstructor) {
    Constructor = specificConstructor(O);
    if (Constructor !== Array) {
      for (key in target) target[key] = arrayFromConstructorAndList$1(Constructor, target[key]);
    }
  } return target;
};

var $$1R = _export;
var $groupBy$1 = arrayGroupBy;
var arraySpeciesConstructor = arraySpeciesConstructor$2;
var addToUnscopables$3 = addToUnscopables$h;

// `Array.prototype.groupBy` method
// https://github.com/tc39/proposal-array-grouping
$$1R({ target: 'Array', proto: true }, {
  groupBy: function groupBy(callbackfn /* , thisArg */) {
    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
    return $groupBy$1(this, callbackfn, thisArg, arraySpeciesConstructor);
  }
});

addToUnscopables$3('groupBy');

var $$1Q = _export;
var isArray = isArray$8;

// eslint-disable-next-line es/no-object-isfrozen -- safe
var isFrozen = Object.isFrozen;

var isFrozenStringArray = function (array, allowUndefined) {
  if (!isFrozen || !isArray(array) || !isFrozen(array)) return false;
  var index = 0;
  var length = array.length;
  var element;
  while (index < length) {
    element = array[index++];
    if (!(typeof element === 'string' || (allowUndefined && typeof element === 'undefined'))) {
      return false;
    }
  } return length !== 0;
};

// `Array.isTemplateObject` method
// https://github.com/tc39/proposal-array-is-template-object
$$1Q({ target: 'Array', stat: true }, {
  isTemplateObject: function isTemplateObject(value) {
    if (!isFrozenStringArray(value, true)) return false;
    var raw = value.raw;
    if (raw.length !== value.length || !isFrozenStringArray(raw, false)) return false;
    return true;
  }
});

var DESCRIPTORS$4 = descriptors;
var addToUnscopables$2 = addToUnscopables$h;
var toObject$5 = toObject$z;
var toLength$2 = toLength$D;
var defineProperty$2 = objectDefineProperty.f;

// `Array.prototype.lastIndex` getter
// https://github.com/keithamus/proposal-array-last
if (DESCRIPTORS$4 && !('lastIndex' in [])) {
  defineProperty$2(Array.prototype, 'lastIndex', {
    configurable: true,
    get: function lastIndex() {
      var O = toObject$5(this);
      var len = toLength$2(O.length);
      return len == 0 ? 0 : len - 1;
    }
  });

  addToUnscopables$2('lastIndex');
}

var DESCRIPTORS$3 = descriptors;
var addToUnscopables$1 = addToUnscopables$h;
var toObject$4 = toObject$z;
var toLength$1 = toLength$D;
var defineProperty$1 = objectDefineProperty.f;

// `Array.prototype.lastIndex` accessor
// https://github.com/keithamus/proposal-array-last
if (DESCRIPTORS$3 && !('lastItem' in [])) {
  defineProperty$1(Array.prototype, 'lastItem', {
    configurable: true,
    get: function lastItem() {
      var O = toObject$4(this);
      var len = toLength$1(O.length);
      return len == 0 ? undefined : O[len - 1];
    },
    set: function lastItem(value) {
      var O = toObject$4(this);
      var len = toLength$1(O.length);
      return O[len == 0 ? 0 : len - 1] = value;
    }
  });

  addToUnscopables$1('lastItem');
}

var aCallable$z = aCallable$Q;
var toLength = toLength$D;
var toObject$3 = toObject$z;
var getBuiltIn$f = getBuiltIn$w;
var arraySpeciesCreate = arraySpeciesCreate$6;

var push$1 = [].push;

// `Array.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
var arrayUniqueBy$1 = function uniqueBy(resolver) {
  var that = toObject$3(this);
  var length = toLength(that.length);
  var result = arraySpeciesCreate(that, 0);
  var Map = getBuiltIn$f('Map');
  var map = new Map();
  var resolverFunction, index, item, key;
  if (resolver != null) resolverFunction = aCallable$z(resolver);
  else resolverFunction = function (value) {
    return value;
  };
  for (index = 0; index < length; index++) {
    item = that[index];
    key = resolverFunction(item);
    if (!map.has(key)) map.set(key, item);
  }
  map.forEach(function (value) {
    push$1.call(result, value);
  });
  return result;
};

var $$1P = _export;
var addToUnscopables = addToUnscopables$h;
var uniqueBy = arrayUniqueBy$1;

// `Array.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
$$1P({ target: 'Array', proto: true }, {
  uniqueBy: uniqueBy
});

addToUnscopables('uniqueBy');

// https://github.com/tc39/proposal-iterator-helpers
var $$1O = _export;
var anInstance$4 = anInstance$b;
var createNonEnumerableProperty$5 = createNonEnumerableProperty$h;
var has$3 = has$m;
var wellKnownSymbol$8 = wellKnownSymbol$G;
var AsyncIteratorPrototype$2 = asyncIteratorPrototype;
var IS_PURE$C = isPure;

var TO_STRING_TAG$4 = wellKnownSymbol$8('toStringTag');

var AsyncIteratorConstructor = function AsyncIterator() {
  anInstance$4(this, AsyncIteratorConstructor);
};

AsyncIteratorConstructor.prototype = AsyncIteratorPrototype$2;

if (!has$3(AsyncIteratorPrototype$2, TO_STRING_TAG$4)) {
  createNonEnumerableProperty$5(AsyncIteratorPrototype$2, TO_STRING_TAG$4, 'AsyncIterator');
}

if (!has$3(AsyncIteratorPrototype$2, 'constructor') || AsyncIteratorPrototype$2.constructor === Object) {
  createNonEnumerableProperty$5(AsyncIteratorPrototype$2, 'constructor', AsyncIteratorConstructor);
}

$$1O({ global: true, forced: IS_PURE$C }, {
  AsyncIterator: AsyncIteratorConstructor
});

var aCallable$y = aCallable$Q;
var anObject$10 = anObject$1C;
var create$4 = objectCreate$1;
var createNonEnumerableProperty$4 = createNonEnumerableProperty$h;
var redefineAll$3 = redefineAll$a;
var wellKnownSymbol$7 = wellKnownSymbol$G;
var InternalStateModule$8 = internalState;
var getBuiltIn$e = getBuiltIn$w;
var getMethod$3 = getMethod$h;
var AsyncIteratorPrototype$1 = asyncIteratorPrototype;

var Promise$2 = getBuiltIn$e('Promise');

var setInternalState$8 = InternalStateModule$8.set;
var getInternalState$6 = InternalStateModule$8.get;

var TO_STRING_TAG$3 = wellKnownSymbol$7('toStringTag');

var asyncIteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var AsyncIteratorProxy = function AsyncIterator(state) {
    state.next = aCallable$y(state.iterator.next);
    state.done = false;
    state.ignoreArgument = !IS_ITERATOR;
    setInternalState$8(this, state);
  };

  AsyncIteratorProxy.prototype = redefineAll$3(create$4(AsyncIteratorPrototype$1), {
    next: function next(arg) {
      var that = this;
      var hasArgument = !!arguments.length;
      return new Promise$2(function (resolve) {
        var state = getInternalState$6(that);
        var args = hasArgument ? [state.ignoreArgument ? undefined : arg] : IS_ITERATOR ? [] : [undefined];
        state.ignoreArgument = false;
        resolve(state.done ? { done: true, value: undefined } : anObject$10(nextHandler.call(state, Promise$2, args)));
      });
    },
    'return': function (value) {
      var that = this;
      return new Promise$2(function (resolve, reject) {
        var state = getInternalState$6(that);
        var iterator = state.iterator;
        state.done = true;
        var $$return = getMethod$3(iterator, 'return');
        if ($$return === undefined) return resolve({ done: true, value: value });
        Promise$2.resolve($$return.call(iterator, value)).then(function (result) {
          anObject$10(result);
          resolve({ done: true, value: value });
        }, reject);
      });
    },
    'throw': function (value) {
      var that = this;
      return new Promise$2(function (resolve, reject) {
        var state = getInternalState$6(that);
        var iterator = state.iterator;
        state.done = true;
        var $$throw = getMethod$3(iterator, 'throw');
        if ($$throw === undefined) return reject(value);
        resolve($$throw.call(iterator, value));
      });
    }
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty$4(AsyncIteratorProxy.prototype, TO_STRING_TAG$3, 'Generator');
  }

  return AsyncIteratorProxy;
};

// https://github.com/tc39/proposal-iterator-helpers
var $$1N = _export;
var anObject$$ = anObject$1C;
var createAsyncIteratorProxy$6 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$6 = createAsyncIteratorProxy$6(function (Promise, args) {
  var state = this;
  var iterator = state.iterator;

  return Promise.resolve(anObject$$(state.next.apply(iterator, args))).then(function (step) {
    if (anObject$$(step).done) {
      state.done = true;
      return { done: true, value: undefined };
    }
    return { done: false, value: [state.index++, step.value] };
  });
});

$$1N({ target: 'AsyncIterator', proto: true, real: true }, {
  asIndexedPairs: function asIndexedPairs() {
    return new AsyncIteratorProxy$6({
      iterator: anObject$$(this),
      index: 0
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1M = _export;
var anObject$_ = anObject$1C;
var toPositiveInteger$3 = toPositiveInteger$5;
var createAsyncIteratorProxy$5 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$5 = createAsyncIteratorProxy$5(function (Promise, args) {
  var state = this;

  return new Promise(function (resolve, reject) {
    var loop = function () {
      try {
        Promise.resolve(
          anObject$_(state.next.apply(state.iterator, state.remaining ? [] : args))
        ).then(function (step) {
          try {
            if (anObject$_(step).done) {
              state.done = true;
              resolve({ done: true, value: undefined });
            } else if (state.remaining) {
              state.remaining--;
              loop();
            } else resolve({ done: false, value: step.value });
          } catch (err) { reject(err); }
        }, reject);
      } catch (error) { reject(error); }
    };

    loop();
  });
});

$$1M({ target: 'AsyncIterator', proto: true, real: true }, {
  drop: function drop(limit) {
    return new AsyncIteratorProxy$5({
      iterator: anObject$_(this),
      remaining: toPositiveInteger$3(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1L = _export;
var $every = asyncIteratorIteration.every;

$$1L({ target: 'AsyncIterator', proto: true, real: true }, {
  every: function every(fn) {
    return $every(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1K = _export;
var aCallable$x = aCallable$Q;
var anObject$Z = anObject$1C;
var createAsyncIteratorProxy$4 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$4 = createAsyncIteratorProxy$4(function (Promise, args) {
  var state = this;
  var filterer = state.filterer;

  return new Promise(function (resolve, reject) {
    var loop = function () {
      try {
        Promise.resolve(anObject$Z(state.next.apply(state.iterator, args))).then(function (step) {
          try {
            if (anObject$Z(step).done) {
              state.done = true;
              resolve({ done: true, value: undefined });
            } else {
              var value = step.value;
              Promise.resolve(filterer(value)).then(function (selected) {
                selected ? resolve({ done: false, value: value }) : loop();
              }, reject);
            }
          } catch (err) { reject(err); }
        }, reject);
      } catch (error) { reject(error); }
    };

    loop();
  });
});

$$1K({ target: 'AsyncIterator', proto: true, real: true }, {
  filter: function filter(filterer) {
    return new AsyncIteratorProxy$4({
      iterator: anObject$Z(this),
      filterer: aCallable$x(filterer)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1J = _export;
var $find = asyncIteratorIteration.find;

$$1J({ target: 'AsyncIterator', proto: true, real: true }, {
  find: function find(fn) {
    return $find(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1I = _export;
var aCallable$w = aCallable$Q;
var anObject$Y = anObject$1C;
var createAsyncIteratorProxy$3 = asyncIteratorCreateProxy;
var getAsyncIterator$1 = getAsyncIterator$3;

var AsyncIteratorProxy$3 = createAsyncIteratorProxy$3(function (Promise) {
  var state = this;
  var mapper = state.mapper;
  var innerIterator;

  return new Promise(function (resolve, reject) {
    var outerLoop = function () {
      try {
        Promise.resolve(anObject$Y(state.next.call(state.iterator))).then(function (step) {
          try {
            if (anObject$Y(step).done) {
              state.done = true;
              resolve({ done: true, value: undefined });
            } else {
              Promise.resolve(mapper(step.value)).then(function (mapped) {
                try {
                  state.innerIterator = innerIterator = getAsyncIterator$1(mapped);
                  state.innerNext = aCallable$w(innerIterator.next);
                  return innerLoop();
                } catch (error2) { reject(error2); }
              }, reject);
            }
          } catch (error1) { reject(error1); }
        }, reject);
      } catch (error) { reject(error); }
    };

    var innerLoop = function () {
      if (innerIterator = state.innerIterator) {
        try {
          Promise.resolve(anObject$Y(state.innerNext.call(innerIterator))).then(function (result) {
            try {
              if (anObject$Y(result).done) {
                state.innerIterator = state.innerNext = null;
                outerLoop();
              } else resolve({ done: false, value: result.value });
            } catch (error1) { reject(error1); }
          }, reject);
        } catch (error) { reject(error); }
      } else outerLoop();
    };

    innerLoop();
  });
});

$$1I({ target: 'AsyncIterator', proto: true, real: true }, {
  flatMap: function flatMap(mapper) {
    return new AsyncIteratorProxy$3({
      iterator: anObject$Y(this),
      mapper: aCallable$w(mapper),
      innerIterator: null,
      innerNext: null
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1H = _export;
var $forEach = asyncIteratorIteration.forEach;

$$1H({ target: 'AsyncIterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    return $forEach(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1G = _export;
var anObject$X = anObject$1C;
var toObject$2 = toObject$z;
var AsyncIteratorPrototype = asyncIteratorPrototype;
var createAsyncIteratorProxy$2 = asyncIteratorCreateProxy;
var getAsyncIterator = getAsyncIterator$3;
var getIterator$5 = getIterator$b;
var getIteratorMethod$3 = getIteratorMethod$9;
var getMethod$2 = getMethod$h;
var wellKnownSymbol$6 = wellKnownSymbol$G;
var AsyncFromSyncIterator = asyncFromSyncIterator;

var ASYNC_ITERATOR = wellKnownSymbol$6('asyncIterator');

var isPrototypeOf$1 = {}.isPrototypeOf;

var AsyncIteratorProxy$2 = createAsyncIteratorProxy$2(function (Promise, args) {
  return anObject$X(this.next.apply(this.iterator, args));
}, true);

$$1G({ target: 'AsyncIterator', stat: true }, {
  from: function from(O) {
    var object = toObject$2(O);
    var usingIterator = getMethod$2(object, ASYNC_ITERATOR);
    var iterator;
    if (usingIterator) {
      iterator = getAsyncIterator(object, usingIterator);
      if (isPrototypeOf$1.call(AsyncIteratorPrototype, iterator)) return iterator;
    }
    if (iterator === undefined) {
      usingIterator = getIteratorMethod$3(object);
      if (usingIterator) return new AsyncFromSyncIterator(getIterator$5(object, usingIterator));
    }
    return new AsyncIteratorProxy$2({ iterator: iterator !== undefined ? iterator : object });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1F = _export;
var aCallable$v = aCallable$Q;
var anObject$W = anObject$1C;
var createAsyncIteratorProxy$1 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$1 = createAsyncIteratorProxy$1(function (Promise, args) {
  var state = this;
  var mapper = state.mapper;

  return Promise.resolve(anObject$W(state.next.apply(state.iterator, args))).then(function (step) {
    if (anObject$W(step).done) {
      state.done = true;
      return { done: true, value: undefined };
    }
    return Promise.resolve(mapper(step.value)).then(function (value) {
      return { done: false, value: value };
    });
  });
});

$$1F({ target: 'AsyncIterator', proto: true, real: true }, {
  map: function map(mapper) {
    return new AsyncIteratorProxy$1({
      iterator: anObject$W(this),
      mapper: aCallable$v(mapper)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1E = _export;
var aCallable$u = aCallable$Q;
var anObject$V = anObject$1C;
var getBuiltIn$d = getBuiltIn$w;

var Promise$1 = getBuiltIn$d('Promise');

$$1E({ target: 'AsyncIterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    var iterator = anObject$V(this);
    var next = aCallable$u(iterator.next);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aCallable$u(reducer);

    return new Promise$1(function (resolve, reject) {
      var loop = function () {
        try {
          Promise$1.resolve(anObject$V(next.call(iterator))).then(function (step) {
            try {
              if (anObject$V(step).done) {
                noInitial ? reject(TypeError('Reduce of empty iterator with no initial value')) : resolve(accumulator);
              } else {
                var value = step.value;
                if (noInitial) {
                  noInitial = false;
                  accumulator = value;
                  loop();
                } else {
                  Promise$1.resolve(reducer(accumulator, value)).then(function (result) {
                    accumulator = result;
                    loop();
                  }, reject);
                }
              }
            } catch (err) { reject(err); }
          }, reject);
        } catch (error) { reject(error); }
      };

      loop();
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1D = _export;
var $some = asyncIteratorIteration.some;

$$1D({ target: 'AsyncIterator', proto: true, real: true }, {
  some: function some(fn) {
    return $some(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1C = _export;
var anObject$U = anObject$1C;
var toPositiveInteger$2 = toPositiveInteger$5;
var createAsyncIteratorProxy = asyncIteratorCreateProxy;

var AsyncIteratorProxy = createAsyncIteratorProxy(function (Promise, args) {
  var iterator = this.iterator;
  var returnMethod, result;
  if (!this.remaining--) {
    result = { done: true, value: undefined };
    this.done = true;
    returnMethod = iterator['return'];
    if (returnMethod !== undefined) {
      return Promise.resolve(returnMethod.call(iterator)).then(function () {
        return result;
      });
    }
    return result;
  } return this.next.apply(iterator, args);
});

$$1C({ target: 'AsyncIterator', proto: true, real: true }, {
  take: function take(limit) {
    return new AsyncIteratorProxy({
      iterator: anObject$U(this),
      remaining: toPositiveInteger$2(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1B = _export;
var $toArray = asyncIteratorIteration.toArray;

$$1B({ target: 'AsyncIterator', proto: true, real: true }, {
  toArray: function toArray() {
    return $toArray(this, undefined, []);
  }
});

var InternalStateModule$7 = internalState;
var createIteratorConstructor$4 = createIteratorConstructor$7;
var isObject$3 = isObject$C;
var defineProperties$1 = objectDefineProperties;
var DESCRIPTORS$2 = descriptors;

var INCORRECT_RANGE = 'Incorrect Number.range arguments';
var NUMERIC_RANGE_ITERATOR = 'NumericRangeIterator';

var setInternalState$7 = InternalStateModule$7.set;
var getInternalState$5 = InternalStateModule$7.getterFor(NUMERIC_RANGE_ITERATOR);

var $RangeIterator = createIteratorConstructor$4(function NumericRangeIterator(start, end, option, type, zero, one) {
  if (typeof start != type || (end !== Infinity && end !== -Infinity && typeof end != type)) {
    throw new TypeError(INCORRECT_RANGE);
  }
  if (start === Infinity || start === -Infinity) {
    throw new RangeError(INCORRECT_RANGE);
  }
  var ifIncrease = end > start;
  var inclusiveEnd = false;
  var step;
  if (option === undefined) {
    step = undefined;
  } else if (isObject$3(option)) {
    step = option.step;
    inclusiveEnd = !!option.inclusive;
  } else if (typeof option == type) {
    step = option;
  } else {
    throw new TypeError(INCORRECT_RANGE);
  }
  if (step == null) {
    step = ifIncrease ? one : -one;
  }
  if (typeof step != type) {
    throw new TypeError(INCORRECT_RANGE);
  }
  if (step === Infinity || step === -Infinity || (step === zero && start !== end)) {
    throw new RangeError(INCORRECT_RANGE);
  }
  // eslint-disable-next-line no-self-compare -- NaN check
  var hitsEnd = start != start || end != end || step != step || (end > start) !== (step > zero);
  setInternalState$7(this, {
    type: NUMERIC_RANGE_ITERATOR,
    start: start,
    end: end,
    step: step,
    inclusiveEnd: inclusiveEnd,
    hitsEnd: hitsEnd,
    currentCount: zero,
    zero: zero
  });
  if (!DESCRIPTORS$2) {
    this.start = start;
    this.end = end;
    this.step = step;
    this.inclusive = inclusiveEnd;
  }
}, NUMERIC_RANGE_ITERATOR, function next() {
  var state = getInternalState$5(this);
  if (state.hitsEnd) return { value: undefined, done: true };
  var start = state.start;
  var end = state.end;
  var step = state.step;
  var currentYieldingValue = start + (step * state.currentCount++);
  if (currentYieldingValue === end) state.hitsEnd = true;
  var inclusiveEnd = state.inclusiveEnd;
  var endCondition;
  if (end > start) {
    endCondition = inclusiveEnd ? currentYieldingValue > end : currentYieldingValue >= end;
  } else {
    endCondition = inclusiveEnd ? end > currentYieldingValue : end >= currentYieldingValue;
  }
  if (endCondition) {
    return { value: undefined, done: state.hitsEnd = true };
  } return { value: currentYieldingValue, done: false };
});

var getter = function (fn) {
  return { get: fn, set: function () { /* empty */ }, configurable: true, enumerable: false };
};

if (DESCRIPTORS$2) {
  defineProperties$1($RangeIterator.prototype, {
    start: getter(function () {
      return getInternalState$5(this).start;
    }),
    end: getter(function () {
      return getInternalState$5(this).end;
    }),
    inclusive: getter(function () {
      return getInternalState$5(this).inclusiveEnd;
    }),
    step: getter(function () {
      return getInternalState$5(this).step;
    })
  });
}

var numericRangeIterator = $RangeIterator;

/* eslint-disable es/no-bigint -- safe */
var $$1A = _export;
var NumericRangeIterator$1 = numericRangeIterator;

// `BigInt.range` method
// https://github.com/tc39/proposal-Number.range
if (typeof BigInt == 'function') {
  $$1A({ target: 'BigInt', stat: true }, {
    range: function range(start, end, option) {
      return new NumericRangeIterator$1(start, end, option, 'bigint', BigInt(0), BigInt(1));
    }
  });
}

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
var Map$2 = es_map;
var WeakMap$1 = es_weakMap.exports;
var create$3 = objectCreate$1;
var isObject$2 = isObject$C;

var Node = function () {
  // keys
  this.object = null;
  this.symbol = null;
  // child nodes
  this.primitives = null;
  this.objectsByIndex = create$3(null);
};

Node.prototype.get = function (key, initializer) {
  return this[key] || (this[key] = initializer());
};

Node.prototype.next = function (i, it, IS_OBJECT) {
  var store = IS_OBJECT
    ? this.objectsByIndex[i] || (this.objectsByIndex[i] = new WeakMap$1())
    : this.primitives || (this.primitives = new Map$2());
  var entry = store.get(it);
  if (!entry) store.set(it, entry = new Node());
  return entry;
};

var root = new Node();

var compositeKey = function () {
  var active = root;
  var length = arguments.length;
  var i, it;
  // for prevent leaking, start from objects
  for (i = 0; i < length; i++) {
    if (isObject$2(it = arguments[i])) active = active.next(i, it, true);
  }
  if (this === Object && active === root) throw TypeError('Composite keys must contain a non-primitive component');
  for (i = 0; i < length; i++) {
    if (!isObject$2(it = arguments[i])) active = active.next(i, it, false);
  } return active;
};

var $$1z = _export;
var getCompositeKeyNode$1 = compositeKey;
var getBuiltIn$c = getBuiltIn$w;
var create$2 = objectCreate$1;

var initializer = function () {
  var freeze = getBuiltIn$c('Object', 'freeze');
  return freeze ? freeze(create$2(null)) : create$2(null);
};

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$$1z({ global: true }, {
  compositeKey: function compositeKey() {
    return getCompositeKeyNode$1.apply(Object, arguments).get('object', initializer);
  }
});

var $$1y = _export;
var getCompositeKeyNode = compositeKey;
var getBuiltIn$b = getBuiltIn$w;

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$$1y({ global: true }, {
  compositeSymbol: function compositeSymbol() {
    if (arguments.length === 1 && typeof arguments[0] === 'string') return getBuiltIn$b('Symbol')['for'](arguments[0]);
    return getCompositeKeyNode.apply(null, arguments).get('symbol', getBuiltIn$b('Symbol'));
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1x = _export;
var global$7 = global$R;
var anInstance$3 = anInstance$b;
var isCallable$5 = isCallable$z;
var createNonEnumerableProperty$3 = createNonEnumerableProperty$h;
var fails$2 = fails$15;
var has$2 = has$m;
var wellKnownSymbol$5 = wellKnownSymbol$G;
var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;

var TO_STRING_TAG$2 = wellKnownSymbol$5('toStringTag');

var NativeIterator = global$7.Iterator;

// FF56- have non-standard global helper `Iterator`
var FORCED$2 = !isCallable$5(NativeIterator)
  || NativeIterator.prototype !== IteratorPrototype$2
  // FF44- non-standard `Iterator` passes previous tests
  || !fails$2(function () { NativeIterator({}); });

var IteratorConstructor = function Iterator() {
  anInstance$3(this, IteratorConstructor);
};

if (!has$2(IteratorPrototype$2, TO_STRING_TAG$2)) {
  createNonEnumerableProperty$3(IteratorPrototype$2, TO_STRING_TAG$2, 'Iterator');
}

if (FORCED$2 || !has$2(IteratorPrototype$2, 'constructor') || IteratorPrototype$2.constructor === Object) {
  createNonEnumerableProperty$3(IteratorPrototype$2, 'constructor', IteratorConstructor);
}

IteratorConstructor.prototype = IteratorPrototype$2;

$$1x({ global: true, forced: FORCED$2 }, {
  Iterator: IteratorConstructor
});

var aCallable$t = aCallable$Q;
var anObject$T = anObject$1C;
var create$1 = objectCreate$1;
var createNonEnumerableProperty$2 = createNonEnumerableProperty$h;
var redefineAll$2 = redefineAll$a;
var wellKnownSymbol$4 = wellKnownSymbol$G;
var InternalStateModule$6 = internalState;
var getMethod$1 = getMethod$h;
var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;

var setInternalState$6 = InternalStateModule$6.set;
var getInternalState$4 = InternalStateModule$6.get;

var TO_STRING_TAG$1 = wellKnownSymbol$4('toStringTag');

var iteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var IteratorProxy = function Iterator(state) {
    state.next = aCallable$t(state.iterator.next);
    state.done = false;
    state.ignoreArg = !IS_ITERATOR;
    setInternalState$6(this, state);
  };

  IteratorProxy.prototype = redefineAll$2(create$1(IteratorPrototype$1), {
    next: function next(arg) {
      var state = getInternalState$4(this);
      var args = arguments.length ? [state.ignoreArg ? undefined : arg] : IS_ITERATOR ? [] : [undefined];
      state.ignoreArg = false;
      var result = state.done ? undefined : nextHandler.call(state, args);
      return { done: state.done, value: result };
    },
    'return': function (value) {
      var state = getInternalState$4(this);
      var iterator = state.iterator;
      state.done = true;
      var $$return = getMethod$1(iterator, 'return');
      return { done: true, value: $$return ? anObject$T($$return.call(iterator, value)).value : value };
    },
    'throw': function (value) {
      var state = getInternalState$4(this);
      var iterator = state.iterator;
      state.done = true;
      var $$throw = getMethod$1(iterator, 'throw');
      if ($$throw) return $$throw.call(iterator, value);
      throw value;
    }
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty$2(IteratorProxy.prototype, TO_STRING_TAG$1, 'Generator');
  }

  return IteratorProxy;
};

// https://github.com/tc39/proposal-iterator-helpers
var $$1w = _export;
var anObject$S = anObject$1C;
var createIteratorProxy$6 = iteratorCreateProxy;

var IteratorProxy$6 = createIteratorProxy$6(function (args) {
  var result = anObject$S(this.next.apply(this.iterator, args));
  var done = this.done = !!result.done;
  if (!done) return [this.index++, result.value];
});

$$1w({ target: 'Iterator', proto: true, real: true }, {
  asIndexedPairs: function asIndexedPairs() {
    return new IteratorProxy$6({
      iterator: anObject$S(this),
      index: 0
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1v = _export;
var anObject$R = anObject$1C;
var toPositiveInteger$1 = toPositiveInteger$5;
var createIteratorProxy$5 = iteratorCreateProxy;

var IteratorProxy$5 = createIteratorProxy$5(function (args) {
  var iterator = this.iterator;
  var next = this.next;
  var result, done;
  while (this.remaining) {
    this.remaining--;
    result = anObject$R(next.call(iterator));
    done = this.done = !!result.done;
    if (done) return;
  }
  result = anObject$R(next.apply(iterator, args));
  done = this.done = !!result.done;
  if (!done) return result.value;
});

$$1v({ target: 'Iterator', proto: true, real: true }, {
  drop: function drop(limit) {
    return new IteratorProxy$5({
      iterator: anObject$R(this),
      remaining: toPositiveInteger$1(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1u = _export;
var iterate$z = iterate$I;
var aCallable$s = aCallable$Q;
var anObject$Q = anObject$1C;

$$1u({ target: 'Iterator', proto: true, real: true }, {
  every: function every(fn) {
    anObject$Q(this);
    aCallable$s(fn);
    return !iterate$z(this, function (value, stop) {
      if (!fn(value)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1t = _export;
var aCallable$r = aCallable$Q;
var anObject$P = anObject$1C;
var createIteratorProxy$4 = iteratorCreateProxy;
var callWithSafeIterationClosing$1 = callWithSafeIterationClosing$3;

var IteratorProxy$4 = createIteratorProxy$4(function (args) {
  var iterator = this.iterator;
  var filterer = this.filterer;
  var next = this.next;
  var result, done, value;
  while (true) {
    result = anObject$P(next.apply(iterator, args));
    done = this.done = !!result.done;
    if (done) return;
    value = result.value;
    if (callWithSafeIterationClosing$1(iterator, filterer, value)) return value;
  }
});

$$1t({ target: 'Iterator', proto: true, real: true }, {
  filter: function filter(filterer) {
    return new IteratorProxy$4({
      iterator: anObject$P(this),
      filterer: aCallable$r(filterer)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1s = _export;
var iterate$y = iterate$I;
var aCallable$q = aCallable$Q;
var anObject$O = anObject$1C;

$$1s({ target: 'Iterator', proto: true, real: true }, {
  find: function find(fn) {
    anObject$O(this);
    aCallable$q(fn);
    return iterate$y(this, function (value, stop) {
      if (fn(value)) return stop(value);
    }, { IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1r = _export;
var aCallable$p = aCallable$Q;
var anObject$N = anObject$1C;
var getIteratorMethod$2 = getIteratorMethod$9;
var createIteratorProxy$3 = iteratorCreateProxy;
var iteratorClose$1 = iteratorClose$4;

var IteratorProxy$3 = createIteratorProxy$3(function () {
  var iterator = this.iterator;
  var mapper = this.mapper;
  var result, mapped, iteratorMethod, innerIterator;

  while (true) {
    try {
      if (innerIterator = this.innerIterator) {
        result = anObject$N(this.innerNext.call(innerIterator));
        if (!result.done) return result.value;
        this.innerIterator = this.innerNext = null;
      }

      result = anObject$N(this.next.call(iterator));

      if (this.done = !!result.done) return;

      mapped = mapper(result.value);
      iteratorMethod = getIteratorMethod$2(mapped);

      if (!iteratorMethod) {
        throw TypeError('.flatMap callback should return an iterable object');
      }

      this.innerIterator = innerIterator = anObject$N(iteratorMethod.call(mapped));
      this.innerNext = aCallable$p(innerIterator.next);
    } catch (error) {
      iteratorClose$1(iterator, 'throw', error);
    }
  }
});

$$1r({ target: 'Iterator', proto: true, real: true }, {
  flatMap: function flatMap(mapper) {
    return new IteratorProxy$3({
      iterator: anObject$N(this),
      mapper: aCallable$p(mapper),
      innerIterator: null,
      innerNext: null
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1q = _export;
var iterate$x = iterate$I;
var anObject$M = anObject$1C;

$$1q({ target: 'Iterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    iterate$x(anObject$M(this), fn, { IS_ITERATOR: true });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1p = _export;
var anObject$L = anObject$1C;
var toObject$1 = toObject$z;
var IteratorPrototype = iteratorsCore.IteratorPrototype;
var createIteratorProxy$2 = iteratorCreateProxy;
var getIterator$4 = getIterator$b;
var getIteratorMethod$1 = getIteratorMethod$9;

var isPrototypeOf = {}.isPrototypeOf;

var IteratorProxy$2 = createIteratorProxy$2(function (args) {
  var result = anObject$L(this.next.apply(this.iterator, args));
  var done = this.done = !!result.done;
  if (!done) return result.value;
}, true);

$$1p({ target: 'Iterator', stat: true }, {
  from: function from(O) {
    var object = toObject$1(O);
    var usingIterator = getIteratorMethod$1(object);
    var iterator;
    if (usingIterator) {
      iterator = getIterator$4(object, usingIterator);
      if (isPrototypeOf.call(IteratorPrototype, iterator)) return iterator;
    } else {
      iterator = object;
    } return new IteratorProxy$2({ iterator: iterator });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1o = _export;
var aCallable$o = aCallable$Q;
var anObject$K = anObject$1C;
var createIteratorProxy$1 = iteratorCreateProxy;
var callWithSafeIterationClosing = callWithSafeIterationClosing$3;

var IteratorProxy$1 = createIteratorProxy$1(function (args) {
  var iterator = this.iterator;
  var result = anObject$K(this.next.apply(iterator, args));
  var done = this.done = !!result.done;
  if (!done) return callWithSafeIterationClosing(iterator, this.mapper, result.value);
});

$$1o({ target: 'Iterator', proto: true, real: true }, {
  map: function map(mapper) {
    return new IteratorProxy$1({
      iterator: anObject$K(this),
      mapper: aCallable$o(mapper)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1n = _export;
var iterate$w = iterate$I;
var aCallable$n = aCallable$Q;
var anObject$J = anObject$1C;

$$1n({ target: 'Iterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    anObject$J(this);
    aCallable$n(reducer);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    iterate$w(this, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = reducer(accumulator, value);
      }
    }, { IS_ITERATOR: true });
    if (noInitial) throw TypeError('Reduce of empty iterator with no initial value');
    return accumulator;
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1m = _export;
var iterate$v = iterate$I;
var aCallable$m = aCallable$Q;
var anObject$I = anObject$1C;

$$1m({ target: 'Iterator', proto: true, real: true }, {
  some: function some(fn) {
    anObject$I(this);
    aCallable$m(fn);
    return iterate$v(this, function (value, stop) {
      if (fn(value)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1l = _export;
var anObject$H = anObject$1C;
var toPositiveInteger = toPositiveInteger$5;
var createIteratorProxy = iteratorCreateProxy;
var iteratorClose = iteratorClose$4;

var IteratorProxy = createIteratorProxy(function (args) {
  var iterator = this.iterator;
  if (!this.remaining--) {
    this.done = true;
    return iteratorClose(iterator, 'normal', undefined);
  }
  var result = anObject$H(this.next.apply(iterator, args));
  var done = this.done = !!result.done;
  if (!done) return result.value;
});

$$1l({ target: 'Iterator', proto: true, real: true }, {
  take: function take(limit) {
    return new IteratorProxy({
      iterator: anObject$H(this),
      remaining: toPositiveInteger(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$1k = _export;
var iterate$u = iterate$I;
var anObject$G = anObject$1C;

var push = [].push;

$$1k({ target: 'Iterator', proto: true, real: true }, {
  toArray: function toArray() {
    var result = [];
    iterate$u(anObject$G(this), push, { that: result, IS_ITERATOR: true });
    return result;
  }
});

var aCallable$l = aCallable$Q;
var anObject$F = anObject$1C;

// https://github.com/tc39/collection-methods
var collectionDeleteAll$4 = function (/* ...elements */) {
  var collection = anObject$F(this);
  var remover = aCallable$l(collection['delete']);
  var allDeleted = true;
  var wasDeleted;
  for (var k = 0, len = arguments.length; k < len; k++) {
    wasDeleted = remover.call(collection, arguments[k]);
    allDeleted = allDeleted && wasDeleted;
  }
  return !!allDeleted;
};

var $$1j = _export;
var IS_PURE$B = isPure;
var collectionDeleteAll$3 = collectionDeleteAll$4;

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$1j({ target: 'Map', proto: true, real: true, forced: IS_PURE$B }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll$3.apply(this, arguments);
  }
});

var anObject$E = anObject$1C;

// `Map.prototype.emplace` method
// https://github.com/thumbsupep/proposal-upsert
var mapEmplace = function emplace(key, handler) {
  var map = anObject$E(this);
  var value = (map.has(key) && 'update' in handler)
    ? handler.update(map.get(key), key, map)
    : handler.insert(key, map);
  map.set(key, value);
  return value;
};

var $$1i = _export;
var IS_PURE$A = isPure;
var $emplace$1 = mapEmplace;

// `Map.prototype.emplace` method
// https://github.com/thumbsupep/proposal-upsert
$$1i({ target: 'Map', proto: true, real: true, forced: IS_PURE$A }, {
  emplace: $emplace$1
});

var getMapIterator$a = function (it) {
  // eslint-disable-next-line es/no-map -- safe
  return Map.prototype.entries.call(it);
};

var $$1h = _export;
var IS_PURE$z = isPure;
var anObject$D = anObject$1C;
var bind$d = functionBindContext;
var getMapIterator$9 = getMapIterator$a;
var iterate$t = iterate$I;

// `Map.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
$$1h({ target: 'Map', proto: true, real: true, forced: IS_PURE$z }, {
  every: function every(callbackfn /* , thisArg */) {
    var map = anObject$D(this);
    var iterator = getMapIterator$9(map);
    var boundFunction = bind$d(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return !iterate$t(iterator, function (key, value, stop) {
      if (!boundFunction(value, key, map)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$1g = _export;
var IS_PURE$y = isPure;
var getBuiltIn$a = getBuiltIn$w;
var aCallable$k = aCallable$Q;
var anObject$C = anObject$1C;
var bind$c = functionBindContext;
var speciesConstructor$8 = speciesConstructor$f;
var getMapIterator$8 = getMapIterator$a;
var iterate$s = iterate$I;

// `Map.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$$1g({ target: 'Map', proto: true, real: true, forced: IS_PURE$y }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var map = anObject$C(this);
    var iterator = getMapIterator$8(map);
    var boundFunction = bind$c(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor$8(map, getBuiltIn$a('Map')))();
    var setter = aCallable$k(newMap.set);
    iterate$s(iterator, function (key, value) {
      if (boundFunction(value, key, map)) setter.call(newMap, key, value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

var $$1f = _export;
var IS_PURE$x = isPure;
var anObject$B = anObject$1C;
var bind$b = functionBindContext;
var getMapIterator$7 = getMapIterator$a;
var iterate$r = iterate$I;

// `Map.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$$1f({ target: 'Map', proto: true, real: true, forced: IS_PURE$x }, {
  find: function find(callbackfn /* , thisArg */) {
    var map = anObject$B(this);
    var iterator = getMapIterator$7(map);
    var boundFunction = bind$b(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$r(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop(value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

var $$1e = _export;
var IS_PURE$w = isPure;
var anObject$A = anObject$1C;
var bind$a = functionBindContext;
var getMapIterator$6 = getMapIterator$a;
var iterate$q = iterate$I;

// `Map.prototype.findKey` method
// https://github.com/tc39/proposal-collection-methods
$$1e({ target: 'Map', proto: true, real: true, forced: IS_PURE$w }, {
  findKey: function findKey(callbackfn /* , thisArg */) {
    var map = anObject$A(this);
    var iterator = getMapIterator$6(map);
    var boundFunction = bind$a(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$q(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop(key);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// https://tc39.github.io/proposal-setmap-offrom/
var aCallable$j = aCallable$Q;
var aConstructor$1 = aConstructor$5;
var bind$9 = functionBindContext;
var iterate$p = iterate$I;

var collectionFrom = function from(source /* , mapFn, thisArg */) {
  var length = arguments.length;
  var mapFn = length > 1 ? arguments[1] : undefined;
  var mapping, array, n, boundFunction;
  aConstructor$1(this);
  mapping = mapFn !== undefined;
  if (mapping) aCallable$j(mapFn);
  if (source == undefined) return new this();
  array = [];
  if (mapping) {
    n = 0;
    boundFunction = bind$9(mapFn, length > 2 ? arguments[2] : undefined, 2);
    iterate$p(source, function (nextItem) {
      array.push(boundFunction(nextItem, n++));
    });
  } else {
    iterate$p(source, array.push, { that: array });
  }
  return new this(array);
};

var $$1d = _export;
var from$4 = collectionFrom;

// `Map.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
$$1d({ target: 'Map', stat: true }, {
  from: from$4
});

var $$1c = _export;
var aCallable$i = aCallable$Q;
var getIterator$3 = getIterator$b;
var iterate$o = iterate$I;

// `Map.groupBy` method
// https://github.com/tc39/proposal-collection-methods
$$1c({ target: 'Map', stat: true }, {
  groupBy: function groupBy(iterable, keyDerivative) {
    aCallable$i(keyDerivative);
    var iterator = getIterator$3(iterable);
    var newMap = new this();
    var has = aCallable$i(newMap.has);
    var get = aCallable$i(newMap.get);
    var set = aCallable$i(newMap.set);
    iterate$o(iterator, function (element) {
      var derivedKey = keyDerivative(element);
      if (!has.call(newMap, derivedKey)) set.call(newMap, derivedKey, [element]);
      else get.call(newMap, derivedKey).push(element);
    }, { IS_ITERATOR: true });
    return newMap;
  }
});

// `SameValueZero` abstract operation
// https://tc39.es/ecma262/#sec-samevaluezero
var sameValueZero$1 = function (x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y || x != x && y != y;
};

var $$1b = _export;
var IS_PURE$v = isPure;
var anObject$z = anObject$1C;
var getMapIterator$5 = getMapIterator$a;
var sameValueZero = sameValueZero$1;
var iterate$n = iterate$I;

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
$$1b({ target: 'Map', proto: true, real: true, forced: IS_PURE$v }, {
  includes: function includes(searchElement) {
    return iterate$n(getMapIterator$5(anObject$z(this)), function (key, value, stop) {
      if (sameValueZero(value, searchElement)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$1a = _export;
var iterate$m = iterate$I;
var aCallable$h = aCallable$Q;

// `Map.keyBy` method
// https://github.com/tc39/proposal-collection-methods
$$1a({ target: 'Map', stat: true }, {
  keyBy: function keyBy(iterable, keyDerivative) {
    var newMap = new this();
    aCallable$h(keyDerivative);
    var setter = aCallable$h(newMap.set);
    iterate$m(iterable, function (element) {
      setter.call(newMap, keyDerivative(element), element);
    });
    return newMap;
  }
});

var $$19 = _export;
var IS_PURE$u = isPure;
var anObject$y = anObject$1C;
var getMapIterator$4 = getMapIterator$a;
var iterate$l = iterate$I;

// `Map.prototype.keyOf` method
// https://github.com/tc39/proposal-collection-methods
$$19({ target: 'Map', proto: true, real: true, forced: IS_PURE$u }, {
  keyOf: function keyOf(searchElement) {
    return iterate$l(getMapIterator$4(anObject$y(this)), function (key, value, stop) {
      if (value === searchElement) return stop(key);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

var $$18 = _export;
var IS_PURE$t = isPure;
var getBuiltIn$9 = getBuiltIn$w;
var aCallable$g = aCallable$Q;
var anObject$x = anObject$1C;
var bind$8 = functionBindContext;
var speciesConstructor$7 = speciesConstructor$f;
var getMapIterator$3 = getMapIterator$a;
var iterate$k = iterate$I;

// `Map.prototype.mapKeys` method
// https://github.com/tc39/proposal-collection-methods
$$18({ target: 'Map', proto: true, real: true, forced: IS_PURE$t }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = anObject$x(this);
    var iterator = getMapIterator$3(map);
    var boundFunction = bind$8(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor$7(map, getBuiltIn$9('Map')))();
    var setter = aCallable$g(newMap.set);
    iterate$k(iterator, function (key, value) {
      setter.call(newMap, boundFunction(value, key, map), value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

var $$17 = _export;
var IS_PURE$s = isPure;
var getBuiltIn$8 = getBuiltIn$w;
var aCallable$f = aCallable$Q;
var anObject$w = anObject$1C;
var bind$7 = functionBindContext;
var speciesConstructor$6 = speciesConstructor$f;
var getMapIterator$2 = getMapIterator$a;
var iterate$j = iterate$I;

// `Map.prototype.mapValues` method
// https://github.com/tc39/proposal-collection-methods
$$17({ target: 'Map', proto: true, real: true, forced: IS_PURE$s }, {
  mapValues: function mapValues(callbackfn /* , thisArg */) {
    var map = anObject$w(this);
    var iterator = getMapIterator$2(map);
    var boundFunction = bind$7(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor$6(map, getBuiltIn$8('Map')))();
    var setter = aCallable$f(newMap.set);
    iterate$j(iterator, function (key, value) {
      setter.call(newMap, key, boundFunction(value, key, map));
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

var $$16 = _export;
var IS_PURE$r = isPure;
var aCallable$e = aCallable$Q;
var anObject$v = anObject$1C;
var iterate$i = iterate$I;

// `Map.prototype.merge` method
// https://github.com/tc39/proposal-collection-methods
$$16({ target: 'Map', proto: true, real: true, forced: IS_PURE$r }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  merge: function merge(iterable /* ...iterbles */) {
    var map = anObject$v(this);
    var setter = aCallable$e(map.set);
    var argumentsLength = arguments.length;
    var i = 0;
    while (i < argumentsLength) {
      iterate$i(arguments[i++], setter, { that: map, AS_ENTRIES: true });
    }
    return map;
  }
});

// https://tc39.github.io/proposal-setmap-offrom/
var collectionOf = function of() {
  var length = arguments.length;
  var A = new Array(length);
  while (length--) A[length] = arguments[length];
  return new this(A);
};

var $$15 = _export;
var of$3 = collectionOf;

// `Map.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
$$15({ target: 'Map', stat: true }, {
  of: of$3
});

var $$14 = _export;
var IS_PURE$q = isPure;
var anObject$u = anObject$1C;
var aCallable$d = aCallable$Q;
var getMapIterator$1 = getMapIterator$a;
var iterate$h = iterate$I;

// `Map.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$$14({ target: 'Map', proto: true, real: true, forced: IS_PURE$q }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var map = anObject$u(this);
    var iterator = getMapIterator$1(map);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aCallable$d(callbackfn);
    iterate$h(iterator, function (key, value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, key, map);
      }
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    if (noInitial) throw TypeError('Reduce of empty map with no initial value');
    return accumulator;
  }
});

var $$13 = _export;
var IS_PURE$p = isPure;
var anObject$t = anObject$1C;
var bind$6 = functionBindContext;
var getMapIterator = getMapIterator$a;
var iterate$g = iterate$I;

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
$$13({ target: 'Map', proto: true, real: true, forced: IS_PURE$p }, {
  some: function some(callbackfn /* , thisArg */) {
    var map = anObject$t(this);
    var iterator = getMapIterator(map);
    var boundFunction = bind$6(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$g(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$12 = _export;
var IS_PURE$o = isPure;
var anObject$s = anObject$1C;
var aCallable$c = aCallable$Q;

// `Set.prototype.update` method
// https://github.com/tc39/proposal-collection-methods
$$12({ target: 'Map', proto: true, real: true, forced: IS_PURE$o }, {
  update: function update(key, callback /* , thunk */) {
    var map = anObject$s(this);
    var length = arguments.length;
    aCallable$c(callback);
    var isPresentInMap = map.has(key);
    if (!isPresentInMap && length < 3) {
      throw TypeError('Updating absent value');
    }
    var value = isPresentInMap ? map.get(key) : aCallable$c(length > 2 ? arguments[2] : undefined)(key, map);
    map.set(key, callback(value, key, map));
    return map;
  }
});

var isCallable$4 = isCallable$z;
var anObject$r = anObject$1C;

// `Map.prototype.upsert` method
// https://github.com/thumbsupep/proposal-upsert
var mapUpsert = function upsert(key, updateFn /* , insertFn */) {
  var map = anObject$r(this);
  var insertFn = arguments.length > 2 ? arguments[2] : undefined;
  var value;
  if (!isCallable$4(updateFn) && !isCallable$4(insertFn)) {
    throw TypeError('At least one callback required');
  }
  if (map.has(key)) {
    value = map.get(key);
    if (isCallable$4(updateFn)) {
      value = updateFn(value);
      map.set(key, value);
    }
  } else if (isCallable$4(insertFn)) {
    value = insertFn();
    map.set(key, value);
  } return value;
};

// TODO: remove from `core-js@4`
var $$11 = _export;
var IS_PURE$n = isPure;
var $upsert$2 = mapUpsert;

// `Map.prototype.updateOrInsert` method (replaced by `Map.prototype.emplace`)
// https://github.com/thumbsupep/proposal-upsert
$$11({ target: 'Map', proto: true, real: true, name: 'upsert', forced: IS_PURE$n }, {
  updateOrInsert: $upsert$2
});

// TODO: remove from `core-js@4`
var $$10 = _export;
var IS_PURE$m = isPure;
var $upsert$1 = mapUpsert;

// `Map.prototype.upsert` method (replaced by `Map.prototype.emplace`)
// https://github.com/thumbsupep/proposal-upsert
$$10({ target: 'Map', proto: true, real: true, forced: IS_PURE$m }, {
  upsert: $upsert$1
});

var $$$ = _export;

var min = Math.min;
var max = Math.max;

// `Math.clamp` method
// https://rwaldron.github.io/proposal-math-extensions/
$$$({ target: 'Math', stat: true }, {
  clamp: function clamp(x, lower, upper) {
    return min(upper, max(lower, x));
  }
});

var $$_ = _export;

// `Math.DEG_PER_RAD` constant
// https://rwaldron.github.io/proposal-math-extensions/
$$_({ target: 'Math', stat: true }, {
  DEG_PER_RAD: Math.PI / 180
});

var $$Z = _export;

var RAD_PER_DEG = 180 / Math.PI;

// `Math.degrees` method
// https://rwaldron.github.io/proposal-math-extensions/
$$Z({ target: 'Math', stat: true }, {
  degrees: function degrees(radians) {
    return radians * RAD_PER_DEG;
  }
});

// `Math.scale` method implementation
// https://rwaldron.github.io/proposal-math-extensions/
var mathScale = Math.scale || function scale(x, inLow, inHigh, outLow, outHigh) {
  if (
    arguments.length === 0
      /* eslint-disable no-self-compare -- NaN check */
      || x != x
      || inLow != inLow
      || inHigh != inHigh
      || outLow != outLow
      || outHigh != outHigh
      /* eslint-enable no-self-compare -- NaN check */
  ) return NaN;
  if (x === Infinity || x === -Infinity) return x;
  return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
};

var $$Y = _export;

var scale$1 = mathScale;
var fround = mathFround;

// `Math.fscale` method
// https://rwaldron.github.io/proposal-math-extensions/
$$Y({ target: 'Math', stat: true }, {
  fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
    return fround(scale$1(x, inLow, inHigh, outLow, outHigh));
  }
});

var $$X = _export;

// `Math.iaddh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$X({ target: 'Math', stat: true }, {
  iaddh: function iaddh(x0, x1, y0, y1) {
    var $x0 = x0 >>> 0;
    var $x1 = x1 >>> 0;
    var $y0 = y0 >>> 0;
    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
  }
});

var $$W = _export;

// `Math.imulh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$W({ target: 'Math', stat: true }, {
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

var $$V = _export;

// `Math.isubh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$V({ target: 'Math', stat: true }, {
  isubh: function isubh(x0, x1, y0, y1) {
    var $x0 = x0 >>> 0;
    var $x1 = x1 >>> 0;
    var $y0 = y0 >>> 0;
    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
  }
});

var $$U = _export;

// `Math.RAD_PER_DEG` constant
// https://rwaldron.github.io/proposal-math-extensions/
$$U({ target: 'Math', stat: true }, {
  RAD_PER_DEG: 180 / Math.PI
});

var $$T = _export;

var DEG_PER_RAD = Math.PI / 180;

// `Math.radians` method
// https://rwaldron.github.io/proposal-math-extensions/
$$T({ target: 'Math', stat: true }, {
  radians: function radians(degrees) {
    return degrees * DEG_PER_RAD;
  }
});

var $$S = _export;
var scale = mathScale;

// `Math.scale` method
// https://rwaldron.github.io/proposal-math-extensions/
$$S({ target: 'Math', stat: true }, {
  scale: scale
});

var $$R = _export;
var anObject$q = anObject$1C;
var numberIsFinite = numberIsFinite$2;
var createIteratorConstructor$3 = createIteratorConstructor$7;
var InternalStateModule$5 = internalState;

var SEEDED_RANDOM = 'Seeded Random';
var SEEDED_RANDOM_GENERATOR = SEEDED_RANDOM + ' Generator';
var setInternalState$5 = InternalStateModule$5.set;
var getInternalState$3 = InternalStateModule$5.getterFor(SEEDED_RANDOM_GENERATOR);
var SEED_TYPE_ERROR = 'Math.seededPRNG() argument should have a "seed" field with a finite value.';

var $SeededRandomGenerator = createIteratorConstructor$3(function SeededRandomGenerator(seed) {
  setInternalState$5(this, {
    type: SEEDED_RANDOM_GENERATOR,
    seed: seed % 2147483647
  });
}, SEEDED_RANDOM, function next() {
  var state = getInternalState$3(this);
  var seed = state.seed = (state.seed * 1103515245 + 12345) % 2147483647;
  return { value: (seed & 1073741823) / 1073741823, done: false };
});

// `Math.seededPRNG` method
// https://github.com/tc39/proposal-seeded-random
// based on https://github.com/tc39/proposal-seeded-random/blob/78b8258835b57fc2100d076151ab506bc3202ae6/demo.html
$$R({ target: 'Math', stat: true, forced: true }, {
  seededPRNG: function seededPRNG(it) {
    var seed = anObject$q(it).seed;
    if (!numberIsFinite(seed)) throw TypeError(SEED_TYPE_ERROR);
    return new $SeededRandomGenerator(seed);
  }
});

var $$Q = _export;

// `Math.signbit` method
// https://github.com/tc39/proposal-Math.signbit
$$Q({ target: 'Math', stat: true }, {
  signbit: function signbit(x) {
    return (x = +x) == x && x == 0 ? 1 / x == -Infinity : x < 0;
  }
});

var $$P = _export;

// `Math.umulh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$P({ target: 'Math', stat: true }, {
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

var $$O = _export;
var toInteger = toInteger$i;
var parseInt$1 = numberParseInt;

var INVALID_NUMBER_REPRESENTATION = 'Invalid number representation';
var INVALID_RADIX = 'Invalid radix';
var valid = /^[\da-z]+$/;

// `Number.fromString` method
// https://github.com/tc39/proposal-number-fromstring
$$O({ target: 'Number', stat: true }, {
  fromString: function fromString(string, radix) {
    var sign = 1;
    var R, mathNum;
    if (typeof string != 'string') throw TypeError(INVALID_NUMBER_REPRESENTATION);
    if (!string.length) throw SyntaxError(INVALID_NUMBER_REPRESENTATION);
    if (string.charAt(0) == '-') {
      sign = -1;
      string = string.slice(1);
      if (!string.length) throw SyntaxError(INVALID_NUMBER_REPRESENTATION);
    }
    R = radix === undefined ? 10 : toInteger(radix);
    if (R < 2 || R > 36) throw RangeError(INVALID_RADIX);
    if (!valid.test(string) || (mathNum = parseInt$1(string, R)).toString(R) !== string) {
      throw SyntaxError(INVALID_NUMBER_REPRESENTATION);
    }
    return sign * mathNum;
  }
});

var $$N = _export;
var NumericRangeIterator = numericRangeIterator;

// `Number.range` method
// https://github.com/tc39/proposal-Number.range
$$N({ target: 'Number', stat: true }, {
  range: function range(start, end, option) {
    return new NumericRangeIterator(start, end, option, 'number', 0, 1);
  }
});

var InternalStateModule$4 = internalState;
var createIteratorConstructor$2 = createIteratorConstructor$7;
var has$1 = has$m;
var objectKeys = objectKeys$5;
var toObject = toObject$z;

var OBJECT_ITERATOR = 'Object Iterator';
var setInternalState$4 = InternalStateModule$4.set;
var getInternalState$2 = InternalStateModule$4.getterFor(OBJECT_ITERATOR);

var objectIterator = createIteratorConstructor$2(function ObjectIterator(source, mode) {
  var object = toObject(source);
  setInternalState$4(this, {
    type: OBJECT_ITERATOR,
    mode: mode,
    object: object,
    keys: objectKeys(object),
    index: 0
  });
}, 'Object', function next() {
  var state = getInternalState$2(this);
  var keys = state.keys;
  while (true) {
    if (keys === null || state.index >= keys.length) {
      state.object = state.keys = null;
      return { value: undefined, done: true };
    }
    var key = keys[state.index++];
    var object = state.object;
    if (!has$1(object, key)) continue;
    switch (state.mode) {
      case 'keys': return { value: key, done: false };
      case 'values': return { value: object[key], done: false };
    } /* entries */ return { value: [key, object[key]], done: false };
  }
});

var $$M = _export;
var ObjectIterator$2 = objectIterator;

// `Object.iterateEntries` method
// https://github.com/tc39/proposal-object-iteration
$$M({ target: 'Object', stat: true }, {
  iterateEntries: function iterateEntries(object) {
    return new ObjectIterator$2(object, 'entries');
  }
});

var $$L = _export;
var ObjectIterator$1 = objectIterator;

// `Object.iterateKeys` method
// https://github.com/tc39/proposal-object-iteration
$$L({ target: 'Object', stat: true }, {
  iterateKeys: function iterateKeys(object) {
    return new ObjectIterator$1(object, 'keys');
  }
});

var $$K = _export;
var ObjectIterator = objectIterator;

// `Object.iterateValues` method
// https://github.com/tc39/proposal-object-iteration
$$K({ target: 'Object', stat: true }, {
  iterateValues: function iterateValues(object) {
    return new ObjectIterator(object, 'values');
  }
});

// https://github.com/tc39/proposal-observable
var $$J = _export;
var DESCRIPTORS$1 = descriptors;
var setSpecies = setSpecies$7;
var aCallable$b = aCallable$Q;
var isCallable$3 = isCallable$z;
var isConstructor = isConstructor$7;
var anObject$p = anObject$1C;
var isObject$1 = isObject$C;
var anInstance$2 = anInstance$b;
var defineProperty = objectDefineProperty.f;
var redefine$2 = redefine$l.exports;
var redefineAll$1 = redefineAll$a;
var getIterator$2 = getIterator$b;
var getMethod = getMethod$h;
var iterate$f = iterate$I;
var hostReportErrors = hostReportErrors$2;
var wellKnownSymbol$3 = wellKnownSymbol$G;
var InternalStateModule$3 = internalState;

var OBSERVABLE = wellKnownSymbol$3('observable');
var getInternalState$1 = InternalStateModule$3.get;
var setInternalState$3 = InternalStateModule$3.set;

var cleanupSubscription = function (subscriptionState) {
  var cleanup = subscriptionState.cleanup;
  if (cleanup) {
    subscriptionState.cleanup = undefined;
    try {
      cleanup();
    } catch (error) {
      hostReportErrors(error);
    }
  }
};

var subscriptionClosed = function (subscriptionState) {
  return subscriptionState.observer === undefined;
};

var close = function (subscriptionState) {
  var subscription = subscriptionState.facade;
  if (!DESCRIPTORS$1) {
    subscription.closed = true;
    var subscriptionObserver = subscriptionState.subscriptionObserver;
    if (subscriptionObserver) subscriptionObserver.closed = true;
  } subscriptionState.observer = undefined;
};

var Subscription = function (observer, subscriber) {
  var subscriptionState = setInternalState$3(this, {
    cleanup: undefined,
    observer: anObject$p(observer),
    subscriptionObserver: undefined
  });
  var start;
  if (!DESCRIPTORS$1) this.closed = false;
  try {
    if (start = getMethod(observer, 'start')) start.call(observer, this);
  } catch (error) {
    hostReportErrors(error);
  }
  if (subscriptionClosed(subscriptionState)) return;
  var subscriptionObserver = subscriptionState.subscriptionObserver = new SubscriptionObserver(this);
  try {
    var cleanup = subscriber(subscriptionObserver);
    var subscription = cleanup;
    if (cleanup != null) subscriptionState.cleanup = isCallable$3(cleanup.unsubscribe)
      ? function () { subscription.unsubscribe(); }
      : aCallable$b(cleanup);
  } catch (error) {
    subscriptionObserver.error(error);
    return;
  } if (subscriptionClosed(subscriptionState)) cleanupSubscription(subscriptionState);
};

Subscription.prototype = redefineAll$1({}, {
  unsubscribe: function unsubscribe() {
    var subscriptionState = getInternalState$1(this);
    if (!subscriptionClosed(subscriptionState)) {
      close(subscriptionState);
      cleanupSubscription(subscriptionState);
    }
  }
});

if (DESCRIPTORS$1) defineProperty(Subscription.prototype, 'closed', {
  configurable: true,
  get: function () {
    return subscriptionClosed(getInternalState$1(this));
  }
});

var SubscriptionObserver = function (subscription) {
  setInternalState$3(this, { subscription: subscription });
  if (!DESCRIPTORS$1) this.closed = false;
};

SubscriptionObserver.prototype = redefineAll$1({}, {
  next: function next(value) {
    var subscriptionState = getInternalState$1(getInternalState$1(this).subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      try {
        var nextMethod = getMethod(observer, 'next');
        if (nextMethod) nextMethod.call(observer, value);
      } catch (error) {
        hostReportErrors(error);
      }
    }
  },
  error: function error(value) {
    var subscriptionState = getInternalState$1(getInternalState$1(this).subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      close(subscriptionState);
      try {
        var errorMethod = getMethod(observer, 'error');
        if (errorMethod) errorMethod.call(observer, value);
        else hostReportErrors(value);
      } catch (err) {
        hostReportErrors(err);
      } cleanupSubscription(subscriptionState);
    }
  },
  complete: function complete() {
    var subscriptionState = getInternalState$1(getInternalState$1(this).subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      close(subscriptionState);
      try {
        var completeMethod = getMethod(observer, 'complete');
        if (completeMethod) completeMethod.call(observer);
      } catch (error) {
        hostReportErrors(error);
      } cleanupSubscription(subscriptionState);
    }
  }
});

if (DESCRIPTORS$1) defineProperty(SubscriptionObserver.prototype, 'closed', {
  configurable: true,
  get: function () {
    return subscriptionClosed(getInternalState$1(getInternalState$1(this).subscription));
  }
});

var $Observable = function Observable(subscriber) {
  anInstance$2(this, $Observable, 'Observable');
  setInternalState$3(this, { subscriber: aCallable$b(subscriber) });
};

redefineAll$1($Observable.prototype, {
  subscribe: function subscribe(observer) {
    var length = arguments.length;
    return new Subscription(isCallable$3(observer) ? {
      next: observer,
      error: length > 1 ? arguments[1] : undefined,
      complete: length > 2 ? arguments[2] : undefined
    } : isObject$1(observer) ? observer : {}, getInternalState$1(this).subscriber);
  }
});

redefineAll$1($Observable, {
  from: function from(x) {
    var C = isConstructor(this) ? this : $Observable;
    var observableMethod = getMethod(anObject$p(x), OBSERVABLE);
    if (observableMethod) {
      var observable = anObject$p(observableMethod.call(x));
      return observable.constructor === C ? observable : new C(function (observer) {
        return observable.subscribe(observer);
      });
    }
    var iterator = getIterator$2(x);
    return new C(function (observer) {
      iterate$f(iterator, function (it, stop) {
        observer.next(it);
        if (observer.closed) return stop();
      }, { IS_ITERATOR: true, INTERRUPTED: true });
      observer.complete();
    });
  },
  of: function of() {
    var C = isConstructor(this) ? this : $Observable;
    var length = arguments.length;
    var items = new Array(length);
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

redefine$2($Observable.prototype, OBSERVABLE, function () { return this; });

$$J({ global: true }, {
  Observable: $Observable
});

setSpecies('Observable');

var $$I = _export;
var newPromiseCapabilityModule = newPromiseCapability$2;
var perform = perform$4;

// `Promise.try` method
// https://github.com/tc39/proposal-promise-try
$$I({ target: 'Promise', stat: true }, {
  'try': function (callbackfn) {
    var promiseCapability = newPromiseCapabilityModule.f(this);
    var result = perform(callbackfn);
    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
    return promiseCapability.promise;
  }
});

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
var Map$1 = es_map;
var WeakMap = es_weakMap.exports;
var shared = shared$7.exports;

var metadata = shared('metadata');
var store$1 = metadata.store || (metadata.store = new WeakMap());

var getOrCreateMetadataMap$1 = function (target, targetKey, create) {
  var targetMetadata = store$1.get(target);
  if (!targetMetadata) {
    if (!create) return;
    store$1.set(target, targetMetadata = new Map$1());
  }
  var keyMetadata = targetMetadata.get(targetKey);
  if (!keyMetadata) {
    if (!create) return;
    targetMetadata.set(targetKey, keyMetadata = new Map$1());
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
  if (metadataMap) metadataMap.forEach(function (_, key) { keys.push(key); });
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

var $$H = _export;
var ReflectMetadataModule$8 = reflectMetadata;
var anObject$o = anObject$1C;

var toMetadataKey$8 = ReflectMetadataModule$8.toKey;
var ordinaryDefineOwnMetadata$1 = ReflectMetadataModule$8.set;

// `Reflect.defineMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$H({ target: 'Reflect', stat: true }, {
  defineMetadata: function defineMetadata(metadataKey, metadataValue, target /* , targetKey */) {
    var targetKey = arguments.length < 4 ? undefined : toMetadataKey$8(arguments[3]);
    ordinaryDefineOwnMetadata$1(metadataKey, metadataValue, anObject$o(target), targetKey);
  }
});

var $$G = _export;
var ReflectMetadataModule$7 = reflectMetadata;
var anObject$n = anObject$1C;

var toMetadataKey$7 = ReflectMetadataModule$7.toKey;
var getOrCreateMetadataMap = ReflectMetadataModule$7.getMap;
var store = ReflectMetadataModule$7.store;

// `Reflect.deleteMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$G({ target: 'Reflect', stat: true }, {
  deleteMetadata: function deleteMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$7(arguments[2]);
    var metadataMap = getOrCreateMetadataMap(anObject$n(target), targetKey, false);
    if (metadataMap === undefined || !metadataMap['delete'](metadataKey)) return false;
    if (metadataMap.size) return true;
    var targetMetadata = store.get(target);
    targetMetadata['delete'](targetKey);
    return !!targetMetadata.size || store['delete'](target);
  }
});

var $$F = _export;
var ReflectMetadataModule$6 = reflectMetadata;
var anObject$m = anObject$1C;
var getPrototypeOf$2 = objectGetPrototypeOf$1;

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
$$F({ target: 'Reflect', stat: true }, {
  getMetadata: function getMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$6(arguments[2]);
    return ordinaryGetMetadata(metadataKey, anObject$m(target), targetKey);
  }
});

var $$E = _export;
// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
var Set$1 = es_set;
var ReflectMetadataModule$5 = reflectMetadata;
var anObject$l = anObject$1C;
var getPrototypeOf$1 = objectGetPrototypeOf$1;
var iterate$e = iterate$I;

var ordinaryOwnMetadataKeys$1 = ReflectMetadataModule$5.keys;
var toMetadataKey$5 = ReflectMetadataModule$5.toKey;

var from$3 = function (iter) {
  var result = [];
  iterate$e(iter, result.push, { that: result });
  return result;
};

var ordinaryMetadataKeys = function (O, P) {
  var oKeys = ordinaryOwnMetadataKeys$1(O, P);
  var parent = getPrototypeOf$1(O);
  if (parent === null) return oKeys;
  var pKeys = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? from$3(new Set$1(oKeys.concat(pKeys))) : pKeys : oKeys;
};

// `Reflect.getMetadataKeys` method
// https://github.com/rbuckton/reflect-metadata
$$E({ target: 'Reflect', stat: true }, {
  getMetadataKeys: function getMetadataKeys(target /* , targetKey */) {
    var targetKey = arguments.length < 2 ? undefined : toMetadataKey$5(arguments[1]);
    return ordinaryMetadataKeys(anObject$l(target), targetKey);
  }
});

var $$D = _export;
var ReflectMetadataModule$4 = reflectMetadata;
var anObject$k = anObject$1C;

var ordinaryGetOwnMetadata = ReflectMetadataModule$4.get;
var toMetadataKey$4 = ReflectMetadataModule$4.toKey;

// `Reflect.getOwnMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$D({ target: 'Reflect', stat: true }, {
  getOwnMetadata: function getOwnMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$4(arguments[2]);
    return ordinaryGetOwnMetadata(metadataKey, anObject$k(target), targetKey);
  }
});

var $$C = _export;
var ReflectMetadataModule$3 = reflectMetadata;
var anObject$j = anObject$1C;

var ordinaryOwnMetadataKeys = ReflectMetadataModule$3.keys;
var toMetadataKey$3 = ReflectMetadataModule$3.toKey;

// `Reflect.getOwnMetadataKeys` method
// https://github.com/rbuckton/reflect-metadata
$$C({ target: 'Reflect', stat: true }, {
  getOwnMetadataKeys: function getOwnMetadataKeys(target /* , targetKey */) {
    var targetKey = arguments.length < 2 ? undefined : toMetadataKey$3(arguments[1]);
    return ordinaryOwnMetadataKeys(anObject$j(target), targetKey);
  }
});

var $$B = _export;
var ReflectMetadataModule$2 = reflectMetadata;
var anObject$i = anObject$1C;
var getPrototypeOf = objectGetPrototypeOf$1;

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
$$B({ target: 'Reflect', stat: true }, {
  hasMetadata: function hasMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$2(arguments[2]);
    return ordinaryHasMetadata(metadataKey, anObject$i(target), targetKey);
  }
});

var $$A = _export;
var ReflectMetadataModule$1 = reflectMetadata;
var anObject$h = anObject$1C;

var ordinaryHasOwnMetadata = ReflectMetadataModule$1.has;
var toMetadataKey$1 = ReflectMetadataModule$1.toKey;

// `Reflect.hasOwnMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$A({ target: 'Reflect', stat: true }, {
  hasOwnMetadata: function hasOwnMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$1(arguments[2]);
    return ordinaryHasOwnMetadata(metadataKey, anObject$h(target), targetKey);
  }
});

var $$z = _export;
var ReflectMetadataModule = reflectMetadata;
var anObject$g = anObject$1C;

var toMetadataKey = ReflectMetadataModule.toKey;
var ordinaryDefineOwnMetadata = ReflectMetadataModule.set;

// `Reflect.metadata` method
// https://github.com/rbuckton/reflect-metadata
$$z({ target: 'Reflect', stat: true }, {
  metadata: function metadata(metadataKey, metadataValue) {
    return function decorator(target, key) {
      ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject$g(target), toMetadataKey(key));
    };
  }
});

var aCallable$a = aCallable$Q;
var anObject$f = anObject$1C;

// https://github.com/tc39/collection-methods
var collectionAddAll$2 = function (/* ...elements */) {
  var set = anObject$f(this);
  var adder = aCallable$a(set.add);
  for (var k = 0, len = arguments.length; k < len; k++) {
    adder.call(set, arguments[k]);
  }
  return set;
};

var $$y = _export;
var IS_PURE$l = isPure;
var collectionAddAll$1 = collectionAddAll$2;

// `Set.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$$y({ target: 'Set', proto: true, real: true, forced: IS_PURE$l }, {
  addAll: function addAll(/* ...elements */) {
    return collectionAddAll$1.apply(this, arguments);
  }
});

var $$x = _export;
var IS_PURE$k = isPure;
var collectionDeleteAll$2 = collectionDeleteAll$4;

// `Set.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$x({ target: 'Set', proto: true, real: true, forced: IS_PURE$k }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll$2.apply(this, arguments);
  }
});

var $$w = _export;
var IS_PURE$j = isPure;
var getBuiltIn$7 = getBuiltIn$w;
var aCallable$9 = aCallable$Q;
var anObject$e = anObject$1C;
var speciesConstructor$5 = speciesConstructor$f;
var iterate$d = iterate$I;

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
$$w({ target: 'Set', proto: true, real: true, forced: IS_PURE$j }, {
  difference: function difference(iterable) {
    var set = anObject$e(this);
    var newSet = new (speciesConstructor$5(set, getBuiltIn$7('Set')))(set);
    var remover = aCallable$9(newSet['delete']);
    iterate$d(iterable, function (value) {
      remover.call(newSet, value);
    });
    return newSet;
  }
});

var getSetIterator$7 = function (it) {
  // eslint-disable-next-line es/no-set -- safe
  return Set.prototype.values.call(it);
};

var $$v = _export;
var IS_PURE$i = isPure;
var anObject$d = anObject$1C;
var bind$5 = functionBindContext;
var getSetIterator$6 = getSetIterator$7;
var iterate$c = iterate$I;

// `Set.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
$$v({ target: 'Set', proto: true, real: true, forced: IS_PURE$i }, {
  every: function every(callbackfn /* , thisArg */) {
    var set = anObject$d(this);
    var iterator = getSetIterator$6(set);
    var boundFunction = bind$5(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return !iterate$c(iterator, function (value, stop) {
      if (!boundFunction(value, value, set)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$u = _export;
var IS_PURE$h = isPure;
var getBuiltIn$6 = getBuiltIn$w;
var aCallable$8 = aCallable$Q;
var anObject$c = anObject$1C;
var bind$4 = functionBindContext;
var speciesConstructor$4 = speciesConstructor$f;
var getSetIterator$5 = getSetIterator$7;
var iterate$b = iterate$I;

// `Set.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$$u({ target: 'Set', proto: true, real: true, forced: IS_PURE$h }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var set = anObject$c(this);
    var iterator = getSetIterator$5(set);
    var boundFunction = bind$4(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newSet = new (speciesConstructor$4(set, getBuiltIn$6('Set')))();
    var adder = aCallable$8(newSet.add);
    iterate$b(iterator, function (value) {
      if (boundFunction(value, value, set)) adder.call(newSet, value);
    }, { IS_ITERATOR: true });
    return newSet;
  }
});

var $$t = _export;
var IS_PURE$g = isPure;
var anObject$b = anObject$1C;
var bind$3 = functionBindContext;
var getSetIterator$4 = getSetIterator$7;
var iterate$a = iterate$I;

// `Set.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$$t({ target: 'Set', proto: true, real: true, forced: IS_PURE$g }, {
  find: function find(callbackfn /* , thisArg */) {
    var set = anObject$b(this);
    var iterator = getSetIterator$4(set);
    var boundFunction = bind$3(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$a(iterator, function (value, stop) {
      if (boundFunction(value, value, set)) return stop(value);
    }, { IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

var $$s = _export;
var from$2 = collectionFrom;

// `Set.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
$$s({ target: 'Set', stat: true }, {
  from: from$2
});

var $$r = _export;
var IS_PURE$f = isPure;
var getBuiltIn$5 = getBuiltIn$w;
var aCallable$7 = aCallable$Q;
var anObject$a = anObject$1C;
var speciesConstructor$3 = speciesConstructor$f;
var iterate$9 = iterate$I;

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
$$r({ target: 'Set', proto: true, real: true, forced: IS_PURE$f }, {
  intersection: function intersection(iterable) {
    var set = anObject$a(this);
    var newSet = new (speciesConstructor$3(set, getBuiltIn$5('Set')))();
    var hasCheck = aCallable$7(set.has);
    var adder = aCallable$7(newSet.add);
    iterate$9(iterable, function (value) {
      if (hasCheck.call(set, value)) adder.call(newSet, value);
    });
    return newSet;
  }
});

var $$q = _export;
var IS_PURE$e = isPure;
var aCallable$6 = aCallable$Q;
var anObject$9 = anObject$1C;
var iterate$8 = iterate$I;

// `Set.prototype.isDisjointFrom` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isDisjointFrom
$$q({ target: 'Set', proto: true, real: true, forced: IS_PURE$e }, {
  isDisjointFrom: function isDisjointFrom(iterable) {
    var set = anObject$9(this);
    var hasCheck = aCallable$6(set.has);
    return !iterate$8(iterable, function (value, stop) {
      if (hasCheck.call(set, value) === true) return stop();
    }, { INTERRUPTED: true }).stopped;
  }
});

var $$p = _export;
var IS_PURE$d = isPure;
var getBuiltIn$4 = getBuiltIn$w;
var aCallable$5 = aCallable$Q;
var isCallable$2 = isCallable$z;
var anObject$8 = anObject$1C;
var getIterator$1 = getIterator$b;
var iterate$7 = iterate$I;

// `Set.prototype.isSubsetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
$$p({ target: 'Set', proto: true, real: true, forced: IS_PURE$d }, {
  isSubsetOf: function isSubsetOf(iterable) {
    var iterator = getIterator$1(this);
    var otherSet = anObject$8(iterable);
    var hasCheck = otherSet.has;
    if (!isCallable$2(hasCheck)) {
      otherSet = new (getBuiltIn$4('Set'))(iterable);
      hasCheck = aCallable$5(otherSet.has);
    }
    return !iterate$7(iterator, function (value, stop) {
      if (hasCheck.call(otherSet, value) === false) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$o = _export;
var IS_PURE$c = isPure;
var aCallable$4 = aCallable$Q;
var anObject$7 = anObject$1C;
var iterate$6 = iterate$I;

// `Set.prototype.isSupersetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSupersetOf
$$o({ target: 'Set', proto: true, real: true, forced: IS_PURE$c }, {
  isSupersetOf: function isSupersetOf(iterable) {
    var set = anObject$7(this);
    var hasCheck = aCallable$4(set.has);
    return !iterate$6(iterable, function (value, stop) {
      if (hasCheck.call(set, value) === false) return stop();
    }, { INTERRUPTED: true }).stopped;
  }
});

var $$n = _export;
var IS_PURE$b = isPure;
var anObject$6 = anObject$1C;
var getSetIterator$3 = getSetIterator$7;
var iterate$5 = iterate$I;

// `Set.prototype.join` method
// https://github.com/tc39/proposal-collection-methods
$$n({ target: 'Set', proto: true, real: true, forced: IS_PURE$b }, {
  join: function join(separator) {
    var set = anObject$6(this);
    var iterator = getSetIterator$3(set);
    var sep = separator === undefined ? ',' : String(separator);
    var result = [];
    iterate$5(iterator, result.push, { that: result, IS_ITERATOR: true });
    return result.join(sep);
  }
});

var $$m = _export;
var IS_PURE$a = isPure;
var getBuiltIn$3 = getBuiltIn$w;
var aCallable$3 = aCallable$Q;
var anObject$5 = anObject$1C;
var bind$2 = functionBindContext;
var speciesConstructor$2 = speciesConstructor$f;
var getSetIterator$2 = getSetIterator$7;
var iterate$4 = iterate$I;

// `Set.prototype.map` method
// https://github.com/tc39/proposal-collection-methods
$$m({ target: 'Set', proto: true, real: true, forced: IS_PURE$a }, {
  map: function map(callbackfn /* , thisArg */) {
    var set = anObject$5(this);
    var iterator = getSetIterator$2(set);
    var boundFunction = bind$2(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newSet = new (speciesConstructor$2(set, getBuiltIn$3('Set')))();
    var adder = aCallable$3(newSet.add);
    iterate$4(iterator, function (value) {
      adder.call(newSet, boundFunction(value, value, set));
    }, { IS_ITERATOR: true });
    return newSet;
  }
});

var $$l = _export;
var of$2 = collectionOf;

// `Set.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
$$l({ target: 'Set', stat: true }, {
  of: of$2
});

var $$k = _export;
var IS_PURE$9 = isPure;
var aCallable$2 = aCallable$Q;
var anObject$4 = anObject$1C;
var getSetIterator$1 = getSetIterator$7;
var iterate$3 = iterate$I;

// `Set.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$$k({ target: 'Set', proto: true, real: true, forced: IS_PURE$9 }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var set = anObject$4(this);
    var iterator = getSetIterator$1(set);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aCallable$2(callbackfn);
    iterate$3(iterator, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, value, set);
      }
    }, { IS_ITERATOR: true });
    if (noInitial) throw TypeError('Reduce of empty set with no initial value');
    return accumulator;
  }
});

var $$j = _export;
var IS_PURE$8 = isPure;
var anObject$3 = anObject$1C;
var bind$1 = functionBindContext;
var getSetIterator = getSetIterator$7;
var iterate$2 = iterate$I;

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
$$j({ target: 'Set', proto: true, real: true, forced: IS_PURE$8 }, {
  some: function some(callbackfn /* , thisArg */) {
    var set = anObject$3(this);
    var iterator = getSetIterator(set);
    var boundFunction = bind$1(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$2(iterator, function (value, stop) {
      if (boundFunction(value, value, set)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$i = _export;
var IS_PURE$7 = isPure;
var getBuiltIn$2 = getBuiltIn$w;
var aCallable$1 = aCallable$Q;
var anObject$2 = anObject$1C;
var speciesConstructor$1 = speciesConstructor$f;
var iterate$1 = iterate$I;

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
$$i({ target: 'Set', proto: true, real: true, forced: IS_PURE$7 }, {
  symmetricDifference: function symmetricDifference(iterable) {
    var set = anObject$2(this);
    var newSet = new (speciesConstructor$1(set, getBuiltIn$2('Set')))(set);
    var remover = aCallable$1(newSet['delete']);
    var adder = aCallable$1(newSet.add);
    iterate$1(iterable, function (value) {
      remover.call(newSet, value) || adder.call(newSet, value);
    });
    return newSet;
  }
});

var $$h = _export;
var IS_PURE$6 = isPure;
var getBuiltIn$1 = getBuiltIn$w;
var aCallable = aCallable$Q;
var anObject$1 = anObject$1C;
var speciesConstructor = speciesConstructor$f;
var iterate = iterate$I;

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
$$h({ target: 'Set', proto: true, real: true, forced: IS_PURE$6 }, {
  union: function union(iterable) {
    var set = anObject$1(this);
    var newSet = new (speciesConstructor(set, getBuiltIn$1('Set')))(set);
    iterate(iterable, aCallable(newSet.add), { that: newSet });
    return newSet;
  }
});

var $$g = _export;
var charAt$1 = stringMultibyte.charAt;
var fails$1 = fails$15;

var FORCED$1 = fails$1(function () {
  return '𠮷'.at(0) !== '𠮷';
});

// `String.prototype.at` method
// https://github.com/mathiasbynens/String.prototype.at
$$g({ target: 'String', proto: true, forced: FORCED$1 }, {
  at: function at(pos) {
    return charAt$1(this, pos);
  }
});

var $$f = _export;
var createIteratorConstructor$1 = createIteratorConstructor$7;
var requireObjectCoercible = requireObjectCoercible$j;
var toString = toString$t;
var InternalStateModule$2 = internalState;
var StringMultibyteModule = stringMultibyte;

var codeAt$1 = StringMultibyteModule.codeAt;
var charAt = StringMultibyteModule.charAt;
var STRING_ITERATOR = 'String Iterator';
var setInternalState$2 = InternalStateModule$2.set;
var getInternalState = InternalStateModule$2.getterFor(STRING_ITERATOR);

// TODO: unify with String#@@iterator
var $StringIterator = createIteratorConstructor$1(function StringIterator(string) {
  setInternalState$2(this, {
    type: STRING_ITERATOR,
    string: string,
    index: 0
  });
}, 'String', function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt(string, index);
  state.index += point.length;
  return { value: { codePoint: codeAt$1(point, 0), position: index }, done: false };
});

// `String.prototype.codePoints` method
// https://github.com/tc39/proposal-string-prototype-codepoints
$$f({ target: 'String', proto: true }, {
  codePoints: function codePoints() {
    return new $StringIterator(toString(requireObjectCoercible(this)));
  }
});

var defineWellKnownSymbol$6 = defineWellKnownSymbol$l;

// `Symbol.asyncDispose` well-known symbol
// https://github.com/tc39/proposal-using-statement
defineWellKnownSymbol$6('asyncDispose');

var defineWellKnownSymbol$5 = defineWellKnownSymbol$l;

// `Symbol.dispose` well-known symbol
// https://github.com/tc39/proposal-using-statement
defineWellKnownSymbol$5('dispose');

var defineWellKnownSymbol$4 = defineWellKnownSymbol$l;

// `Symbol.matcher` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol$4('matcher');

var defineWellKnownSymbol$3 = defineWellKnownSymbol$l;

// `Symbol.metadata` well-known symbol
// https://github.com/tc39/proposal-decorators
defineWellKnownSymbol$3('metadata');

var defineWellKnownSymbol$2 = defineWellKnownSymbol$l;

// `Symbol.observable` well-known symbol
// https://github.com/tc39/proposal-observable
defineWellKnownSymbol$2('observable');

// TODO: remove from `core-js@4`
var defineWellKnownSymbol$1 = defineWellKnownSymbol$l;

// `Symbol.patternMatch` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol$1('patternMatch');

// TODO: remove from `core-js@4`
var defineWellKnownSymbol = defineWellKnownSymbol$l;

defineWellKnownSymbol('replaceAll');

var aConstructor = aConstructor$5;
var arrayFromAsync = arrayFromAsync$1;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = typedArrayConstructorsRequireWrappers;
var ArrayBufferViewCore$6 = arrayBufferViewCore;
var arrayFromConstructorAndList = arrayFromConstructorAndList$3;

var aTypedArrayConstructor = ArrayBufferViewCore$6.aTypedArrayConstructor;
var exportTypedArrayStaticMethod = ArrayBufferViewCore$6.exportTypedArrayStaticMethod;

// `%TypedArray%.fromAsync` method
// https://github.com/tc39/proposal-array-from-async
// eslint-disable-next-line -- required for .length
exportTypedArrayStaticMethod('fromAsync', function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
  var C = aConstructor(this);
  return arrayFromAsync.apply(Array, arguments).then(function (list) {
    return arrayFromConstructorAndList(aTypedArrayConstructor(C), list);
  });
}, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);

// TODO: Remove from `core-js@4`
var ArrayBufferViewCore$5 = arrayBufferViewCore;
var $filterReject$1 = arrayIteration.filterReject;
var fromSpeciesAndList$2 = typedArrayFromSpeciesAndList;

var aTypedArray$5 = ArrayBufferViewCore$5.aTypedArray;
var exportTypedArrayMethod$5 = ArrayBufferViewCore$5.exportTypedArrayMethod;

// `%TypedArray%.prototype.filterOut` method
// https://github.com/tc39/proposal-array-filtering
exportTypedArrayMethod$5('filterOut', function filterOut(callbackfn /* , thisArg */) {
  var list = $filterReject$1(aTypedArray$5(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  return fromSpeciesAndList$2(this, list);
});

var ArrayBufferViewCore$4 = arrayBufferViewCore;
var $filterReject = arrayIteration.filterReject;
var fromSpeciesAndList$1 = typedArrayFromSpeciesAndList;

var aTypedArray$4 = ArrayBufferViewCore$4.aTypedArray;
var exportTypedArrayMethod$4 = ArrayBufferViewCore$4.exportTypedArrayMethod;

// `%TypedArray%.prototype.filterReject` method
// https://github.com/tc39/proposal-array-filtering
exportTypedArrayMethod$4('filterReject', function filterReject(callbackfn /* , thisArg */) {
  var list = $filterReject(aTypedArray$4(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  return fromSpeciesAndList$1(this, list);
});

var ArrayBufferViewCore$3 = arrayBufferViewCore;
var $findLast = arrayIterationFromLast.findLast;

var aTypedArray$3 = ArrayBufferViewCore$3.aTypedArray;
var exportTypedArrayMethod$3 = ArrayBufferViewCore$3.exportTypedArrayMethod;

// `%TypedArray%.prototype.findLast` method
// https://github.com/tc39/proposal-array-find-from-last
exportTypedArrayMethod$3('findLast', function findLast(predicate /* , thisArg */) {
  return $findLast(aTypedArray$3(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$2 = arrayBufferViewCore;
var $findLastIndex = arrayIterationFromLast.findLastIndex;

var aTypedArray$2 = ArrayBufferViewCore$2.aTypedArray;
var exportTypedArrayMethod$2 = ArrayBufferViewCore$2.exportTypedArrayMethod;

// `%TypedArray%.prototype.findLastIndex` method
// https://github.com/tc39/proposal-array-find-from-last
exportTypedArrayMethod$2('findLastIndex', function findLastIndex(predicate /* , thisArg */) {
  return $findLastIndex(aTypedArray$2(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$1 = arrayBufferViewCore;
var $groupBy = arrayGroupBy;
var typedArraySpeciesConstructor = typedArraySpeciesConstructor$5;

var aTypedArray$1 = ArrayBufferViewCore$1.aTypedArray;
var exportTypedArrayMethod$1 = ArrayBufferViewCore$1.exportTypedArrayMethod;

// `%TypedArray%.prototype.groupBy` method
// https://github.com/tc39/proposal-array-grouping
exportTypedArrayMethod$1('groupBy', function groupBy(callbackfn /* , thisArg */) {
  var thisArg = arguments.length > 1 ? arguments[1] : undefined;
  return $groupBy(aTypedArray$1(this), callbackfn, thisArg, typedArraySpeciesConstructor);
});

var ArrayBufferViewCore = arrayBufferViewCore;
var arrayUniqueBy = arrayUniqueBy$1;
var fromSpeciesAndList = typedArrayFromSpeciesAndList;

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
exportTypedArrayMethod('uniqueBy', function uniqueBy(resolver) {
  return fromSpeciesAndList(this, arrayUniqueBy.call(aTypedArray(this), resolver));
});

var $$e = _export;
var IS_PURE$5 = isPure;
var collectionDeleteAll$1 = collectionDeleteAll$4;

// `WeakMap.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$e({ target: 'WeakMap', proto: true, real: true, forced: IS_PURE$5 }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll$1.apply(this, arguments);
  }
});

var $$d = _export;
var from$1 = collectionFrom;

// `WeakMap.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from
$$d({ target: 'WeakMap', stat: true }, {
  from: from$1
});

var $$c = _export;
var of$1 = collectionOf;

// `WeakMap.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of
$$c({ target: 'WeakMap', stat: true }, {
  of: of$1
});

var $$b = _export;
var IS_PURE$4 = isPure;
var $emplace = mapEmplace;

// `WeakMap.prototype.emplace` method
// https://github.com/tc39/proposal-upsert
$$b({ target: 'WeakMap', proto: true, real: true, forced: IS_PURE$4 }, {
  emplace: $emplace
});

// TODO: remove from `core-js@4`
var $$a = _export;
var IS_PURE$3 = isPure;
var $upsert = mapUpsert;

// `WeakMap.prototype.upsert` method (replaced by `WeakMap.prototype.emplace`)
// https://github.com/tc39/proposal-upsert
$$a({ target: 'WeakMap', proto: true, real: true, forced: IS_PURE$3 }, {
  upsert: $upsert
});

var $$9 = _export;
var IS_PURE$2 = isPure;
var collectionAddAll = collectionAddAll$2;

// `WeakSet.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$$9({ target: 'WeakSet', proto: true, real: true, forced: IS_PURE$2 }, {
  addAll: function addAll(/* ...elements */) {
    return collectionAddAll.apply(this, arguments);
  }
});

var $$8 = _export;
var IS_PURE$1 = isPure;
var collectionDeleteAll = collectionDeleteAll$4;

// `WeakSet.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$8({ target: 'WeakSet', proto: true, real: true, forced: IS_PURE$1 }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll.apply(this, arguments);
  }
});

var $$7 = _export;
var from = collectionFrom;

// `WeakSet.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.from
$$7({ target: 'WeakSet', stat: true }, {
  from: from
});

var $$6 = _export;
var of = collectionOf;

// `WeakSet.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of
$$6({ target: 'WeakSet', stat: true }, {
  of: of
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

var global$6 = global$R;
var DOMIterables$1 = domIterables;
var DOMTokenListPrototype$1 = domTokenListPrototype;
var forEach = arrayForEach;
var createNonEnumerableProperty$1 = createNonEnumerableProperty$h;

var handlePrototype$1 = function (CollectionPrototype) {
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
    createNonEnumerableProperty$1(CollectionPrototype, 'forEach', forEach);
  } catch (error) {
    CollectionPrototype.forEach = forEach;
  }
};

for (var COLLECTION_NAME$1 in DOMIterables$1) {
  if (DOMIterables$1[COLLECTION_NAME$1]) {
    handlePrototype$1(global$6[COLLECTION_NAME$1] && global$6[COLLECTION_NAME$1].prototype);
  }
}

handlePrototype$1(DOMTokenListPrototype$1);

var global$5 = global$R;
var DOMIterables = domIterables;
var DOMTokenListPrototype = domTokenListPrototype;
var ArrayIteratorMethods = es_array_iterator;
var createNonEnumerableProperty = createNonEnumerableProperty$h;
var wellKnownSymbol$2 = wellKnownSymbol$G;

var ITERATOR$2 = wellKnownSymbol$2('iterator');
var TO_STRING_TAG = wellKnownSymbol$2('toStringTag');
var ArrayValues = ArrayIteratorMethods.values;

var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR$2] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR$2, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR$2] = ArrayValues;
    }
    if (!CollectionPrototype[TO_STRING_TAG]) {
      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
    }
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
  handlePrototype(global$5[COLLECTION_NAME] && global$5[COLLECTION_NAME].prototype, COLLECTION_NAME);
}

handlePrototype(DOMTokenListPrototype, 'DOMTokenList');

var $$5 = _export;
var global$4 = global$R;
var task = task$2;

var FORCED = !global$4.setImmediate || !global$4.clearImmediate;

// http://w3c.github.io/setImmediate/
$$5({ global: true, bind: true, enumerable: true, forced: FORCED }, {
  // `setImmediate` method
  // http://w3c.github.io/setImmediate/#si-setImmediate
  setImmediate: task.set,
  // `clearImmediate` method
  // http://w3c.github.io/setImmediate/#si-clearImmediate
  clearImmediate: task.clear
});

var $$4 = _export;
var global$3 = global$R;
var microtask = microtask$2;
var IS_NODE = engineIsNode;

var process = global$3.process;

// `queueMicrotask` method
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask
$$4({ global: true, enumerable: true, noTargetGet: true }, {
  queueMicrotask: function queueMicrotask(fn) {
    var domain = IS_NODE && process.domain;
    microtask(domain ? domain.bind(fn) : fn);
  }
});

var $$3 = _export;
var global$2 = global$R;
var isCallable$1 = isCallable$z;
var userAgent = engineUserAgent;

var slice = [].slice;
var MSIE = /MSIE .\./.test(userAgent); // <- dirty ie9- check

var wrap = function (scheduler) {
  return function (handler, timeout /* , ...arguments */) {
    var boundArgs = arguments.length > 2;
    var args = boundArgs ? slice.call(arguments, 2) : undefined;
    return scheduler(boundArgs ? function () {
      // eslint-disable-next-line no-new-func -- spec requirement
      (isCallable$1(handler) ? handler : Function(handler)).apply(this, args);
    } : handler, timeout);
  };
};

// ie9- setTimeout & setInterval additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
$$3({ global: true, bind: true, forced: MSIE }, {
  // `setTimeout` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
  setTimeout: wrap(global$2.setTimeout),
  // `setInterval` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
  setInterval: wrap(global$2.setInterval)
});

var fails = fails$15;
var wellKnownSymbol$1 = wellKnownSymbol$G;
var IS_PURE = isPure;

var ITERATOR$1 = wellKnownSymbol$1('iterator');

var nativeUrl = !fails(function () {
  var url = new URL('b?a=1&b=2&c=3', 'http://a');
  var searchParams = url.searchParams;
  var result = '';
  url.pathname = 'c%20d';
  searchParams.forEach(function (value, key) {
    searchParams['delete']('b');
    result += key + value;
  });
  return (IS_PURE && !url.toJSON)
    || !searchParams.sort
    || url.href !== 'http://a/c%20d?a=1&c=3'
    || searchParams.get('c') !== '3'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !searchParams[ITERATOR$1]
    // throws in Edge
    || new URL('https://a@b').username !== 'a'
    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
    // not punycoded in Edge
    || new URL('http://тест').host !== 'xn--e1aybc'
    // not escaped in Chrome 62-
    || new URL('http://a#б').hash !== '#%D0%B1'
    // fails in Chrome 66-
    || result !== 'a1c3'
    // throws in Safari
    || new URL('http://x', undefined).host !== 'x';
});

// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
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
var floor$1 = Math.floor;
var stringFromCharCode = String.fromCharCode;

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
    var value = string.charCodeAt(counter++);
    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
      // It's a high surrogate, and there is a next character.
      var extra = string.charCodeAt(counter++);
      if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
      } else {
        // It's an unmatched surrogate; only append this code unit, in case the
        // next code unit is the high surrogate of a surrogate pair.
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
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
  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
    delta = floor$1(delta / baseMinusTMin);
  }
  return floor$1(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
// eslint-disable-next-line max-statements -- TODO
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
      output.push(stringFromCharCode(currentValue));
    }
  }

  var basicLength = output.length; // number of basic code points.
  var handledCPCount = basicLength; // number of code points that have been handled;

  // Finish the basic string with a delimiter unless it's empty.
  if (basicLength) {
    output.push(delimiter);
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
      throw RangeError(OVERFLOW_ERROR);
    }

    delta += (m - n) * handledCPCountPlusOne;
    n = m;

    for (i = 0; i < input.length; i++) {
      currentValue = input[i];
      if (currentValue < n && ++delta > maxInt) {
        throw RangeError(OVERFLOW_ERROR);
      }
      if (currentValue == n) {
        // Represent delta as a generalized variable-length integer.
        var q = delta;
        for (var k = base; /* no condition */; k += base) {
          var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
          if (q < t) break;
          var qMinusT = q - t;
          var baseMinusT = base - t;
          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
          q = floor$1(qMinusT / baseMinusT);
        }

        output.push(stringFromCharCode(digitToBasic(q)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }

    ++delta;
    ++n;
  }
  return output.join('');
};

var stringPunycodeToAscii = function (input) {
  var encoded = [];
  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
  var i, label;
  for (i = 0; i < labels.length; i++) {
    label = labels[i];
    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
  }
  return encoded.join('.');
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

var $$2 = _export;
var getBuiltIn = getBuiltIn$w;
var USE_NATIVE_URL$1 = nativeUrl;
var redefine$1 = redefine$l.exports;
var redefineAll = redefineAll$a;
var setToStringTag$1 = setToStringTag$b;
var createIteratorConstructor = createIteratorConstructor$7;
var InternalStateModule$1 = internalState;
var anInstance$1 = anInstance$b;
var isCallable = isCallable$z;
var hasOwn = has$m;
var bind = functionBindContext;
var classof = classof$c;
var anObject = anObject$1C;
var isObject = isObject$C;
var $toString$1 = toString$t;
var create = objectCreate$1;
var createPropertyDescriptor = createPropertyDescriptor$9;
var getIterator = getIterator$b;
var getIteratorMethod = getIteratorMethod$9;
var wellKnownSymbol = wellKnownSymbol$G;

var nativeFetch = getBuiltIn('fetch');
var NativeRequest = getBuiltIn('Request');
var RequestPrototype = NativeRequest && NativeRequest.prototype;
var Headers = getBuiltIn('Headers');
var ITERATOR = wellKnownSymbol('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState$1 = InternalStateModule$1.set;
var getInternalParamsState = InternalStateModule$1.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = InternalStateModule$1.getterFor(URL_SEARCH_PARAMS_ITERATOR);

var plus = /\+/g;
var sequences = Array(4);

var percentSequence = function (bytes) {
  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
};

var percentDecode = function (sequence) {
  try {
    return decodeURIComponent(sequence);
  } catch (error) {
    return sequence;
  }
};

var deserialize = function (it) {
  var result = it.replace(plus, ' ');
  var bytes = 4;
  try {
    return decodeURIComponent(result);
  } catch (error) {
    while (bytes) {
      result = result.replace(percentSequence(bytes--), percentDecode);
    }
    return result;
  }
};

var find = /[!'()~]|%20/g;

var replace = {
  '!': '%21',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '~': '%7E',
  '%20': '+'
};

var replacer = function (match) {
  return replace[match];
};

var serialize = function (it) {
  return encodeURIComponent(it).replace(find, replacer);
};

var parseSearchParams = function (result, query) {
  if (query) {
    var attributes = query.split('&');
    var index = 0;
    var attribute, entry;
    while (index < attributes.length) {
      attribute = attributes[index++];
      if (attribute.length) {
        entry = attribute.split('=');
        result.push({
          key: deserialize(entry.shift()),
          value: deserialize(entry.join('='))
        });
      }
    }
  }
};

var updateSearchParams = function (query) {
  this.entries.length = 0;
  parseSearchParams(this.entries, query);
};

var validateArgumentsLength = function (passed, required) {
  if (passed < required) throw TypeError('Not enough arguments');
};

var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
  setInternalState$1(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    iterator: getIterator(getInternalParamsState(params).entries),
    kind: kind
  });
}, 'Iterator', function next() {
  var state = getInternalIteratorState(this);
  var kind = state.kind;
  var step = state.iterator.next();
  var entry = step.value;
  if (!step.done) {
    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
  } return step;
});

// `URLSearchParams` constructor
// https://url.spec.whatwg.org/#interface-urlsearchparams
var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
  anInstance$1(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  var that = this;
  var entries = [];
  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;

  setInternalState$1(that, {
    type: URL_SEARCH_PARAMS,
    entries: entries,
    updateURL: function () { /* empty */ },
    updateSearchParams: updateSearchParams
  });

  if (init !== undefined) {
    if (isObject(init)) {
      iteratorMethod = getIteratorMethod(init);
      if (iteratorMethod) {
        iterator = getIterator(init, iteratorMethod);
        next = iterator.next;
        while (!(step = next.call(iterator)).done) {
          entryIterator = getIterator(anObject(step.value));
          entryNext = entryIterator.next;
          if (
            (first = entryNext.call(entryIterator)).done ||
            (second = entryNext.call(entryIterator)).done ||
            !entryNext.call(entryIterator).done
          ) throw TypeError('Expected sequence with length 2');
          entries.push({ key: $toString$1(first.value), value: $toString$1(second.value) });
        }
      } else for (key in init) if (hasOwn(init, key)) entries.push({ key: key, value: $toString$1(init[key]) });
    } else {
      parseSearchParams(
        entries,
        typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : $toString$1(init)
      );
    }
  }
};

var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

redefineAll(URLSearchParamsPrototype, {
  // `URLSearchParams.prototype.append` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
  append: function append(name, value) {
    validateArgumentsLength(arguments.length, 2);
    var state = getInternalParamsState(this);
    state.entries.push({ key: $toString$1(name), value: $toString$1(value) });
    state.updateURL();
  },
  // `URLSearchParams.prototype.delete` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
  'delete': function (name) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var key = $toString$1(name);
    var index = 0;
    while (index < entries.length) {
      if (entries[index].key === key) entries.splice(index, 1);
      else index++;
    }
    state.updateURL();
  },
  // `URLSearchParams.prototype.get` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
  get: function get(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
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
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = $toString$1(name);
    var result = [];
    var index = 0;
    for (; index < entries.length; index++) {
      if (entries[index].key === key) result.push(entries[index].value);
    }
    return result;
  },
  // `URLSearchParams.prototype.has` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
  has: function has(name) {
    validateArgumentsLength(arguments.length, 1);
    var entries = getInternalParamsState(this).entries;
    var key = $toString$1(name);
    var index = 0;
    while (index < entries.length) {
      if (entries[index++].key === key) return true;
    }
    return false;
  },
  // `URLSearchParams.prototype.set` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
  set: function set(name, value) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var found = false;
    var key = $toString$1(name);
    var val = $toString$1(value);
    var index = 0;
    var entry;
    for (; index < entries.length; index++) {
      entry = entries[index];
      if (entry.key === key) {
        if (found) entries.splice(index--, 1);
        else {
          found = true;
          entry.value = val;
        }
      }
    }
    if (!found) entries.push({ key: key, value: val });
    state.updateURL();
  },
  // `URLSearchParams.prototype.sort` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
  sort: function sort() {
    var state = getInternalParamsState(this);
    var entries = state.entries;
    // Array#sort is not stable in some engines
    var slice = entries.slice();
    var entry, entriesIndex, sliceIndex;
    entries.length = 0;
    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
      entry = slice[sliceIndex];
      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
        if (entries[entriesIndex].key > entry.key) {
          entries.splice(entriesIndex, 0, entry);
          break;
        }
      }
      if (entriesIndex === sliceIndex) entries.push(entry);
    }
    state.updateURL();
  },
  // `URLSearchParams.prototype.forEach` method
  forEach: function forEach(callback /* , thisArg */) {
    var entries = getInternalParamsState(this).entries;
    var boundFunction = bind(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
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
redefine$1(URLSearchParamsPrototype, ITERATOR, URLSearchParamsPrototype.entries, { name: 'entries' });

// `URLSearchParams.prototype.toString` method
// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
redefine$1(URLSearchParamsPrototype, 'toString', function toString() {
  var entries = getInternalParamsState(this).entries;
  var result = [];
  var index = 0;
  var entry;
  while (index < entries.length) {
    entry = entries[index++];
    result.push(serialize(entry.key) + '=' + serialize(entry.value));
  } return result.join('&');
}, { enumerable: true });

setToStringTag$1(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

$$2({ global: true, forced: !USE_NATIVE_URL$1 }, {
  URLSearchParams: URLSearchParamsConstructor
});

// Wrap `fetch` and `Request` for correct work with polyfilled `URLSearchParams`
if (!USE_NATIVE_URL$1 && isCallable(Headers)) {
  var wrapRequestOptions = function (init) {
    if (isObject(init)) {
      var body = init.body;
      var headers;
      if (classof(body) === URL_SEARCH_PARAMS) {
        headers = init.headers ? new Headers(init.headers) : new Headers();
        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
        return create(init, {
          body: createPropertyDescriptor(0, String(body)),
          headers: createPropertyDescriptor(0, headers)
        });
      }
    } return init;
  };

  if (isCallable(nativeFetch)) {
    $$2({ global: true, enumerable: true, forced: true }, {
      fetch: function fetch(input /* , init */) {
        return nativeFetch(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
      }
    });
  }

  if (isCallable(NativeRequest)) {
    var RequestConstructor = function Request(input /* , init */) {
      anInstance$1(this, RequestConstructor, 'Request');
      return new NativeRequest(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
    };

    RequestPrototype.constructor = RequestConstructor;
    RequestConstructor.prototype = RequestPrototype;

    $$2({ global: true, forced: true }, {
      Request: RequestConstructor
    });
  }
}

var web_urlSearchParams = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

var $$1 = _export;
var DESCRIPTORS = descriptors;
var USE_NATIVE_URL = nativeUrl;
var global$1 = global$R;
var defineProperties = objectDefineProperties;
var redefine = redefine$l.exports;
var anInstance = anInstance$b;
var has = has$m;
var assign = objectAssign;
var arrayFrom = arrayFrom$1;
var codeAt = stringMultibyte.codeAt;
var toASCII = stringPunycodeToAscii;
var $toString = toString$t;
var setToStringTag = setToStringTag$b;
var URLSearchParamsModule = web_urlSearchParams;
var InternalStateModule = internalState;

var NativeURL = global$1.URL;
var URLSearchParams$1 = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;
var setInternalState = InternalStateModule.set;
var getInternalURLState = InternalStateModule.getterFor('URL');
var floor = Math.floor;
var pow = Math.pow;

var INVALID_AUTHORITY = 'Invalid authority';
var INVALID_SCHEME = 'Invalid scheme';
var INVALID_HOST = 'Invalid host';
var INVALID_PORT = 'Invalid port';

var ALPHA = /[A-Za-z]/;
// eslint-disable-next-line regexp/no-obscure-range -- safe
var ALPHANUMERIC = /[\d+-.A-Za-z]/;
var DIGIT = /\d/;
var HEX_START = /^0x/i;
var OCT = /^[0-7]+$/;
var DEC = /^\d+$/;
var HEX = /^[\dA-Fa-f]+$/;
/* eslint-disable regexp/no-control-character -- safe */
var FORBIDDEN_HOST_CODE_POINT = /[\0\t\n\r #%/:<>?@[\\\]^|]/;
var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\0\t\n\r #/:<>?@[\\\]^|]/;
var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u0020]+|[\u0000-\u0020]+$/g;
var TAB_AND_NEW_LINE = /[\t\n\r]/g;
/* eslint-enable regexp/no-control-character -- safe */
var EOF;

var parseHost = function (url, input) {
  var result, codePoints, index;
  if (input.charAt(0) == '[') {
    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
    result = parseIPv6(input.slice(1, -1));
    if (!result) return INVALID_HOST;
    url.host = result;
  // opaque host
  } else if (!isSpecial(url)) {
    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
    result = '';
    codePoints = arrayFrom(input);
    for (index = 0; index < codePoints.length; index++) {
      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
    }
    url.host = result;
  } else {
    input = toASCII(input);
    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
    result = parseIPv4(input);
    if (result === null) return INVALID_HOST;
    url.host = result;
  }
};

var parseIPv4 = function (input) {
  var parts = input.split('.');
  var partsLength, numbers, index, part, radix, number, ipv4;
  if (parts.length && parts[parts.length - 1] == '') {
    parts.pop();
  }
  partsLength = parts.length;
  if (partsLength > 4) return input;
  numbers = [];
  for (index = 0; index < partsLength; index++) {
    part = parts[index];
    if (part == '') return input;
    radix = 10;
    if (part.length > 1 && part.charAt(0) == '0') {
      radix = HEX_START.test(part) ? 16 : 8;
      part = part.slice(radix == 8 ? 1 : 2);
    }
    if (part === '') {
      number = 0;
    } else {
      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
      number = parseInt(part, radix);
    }
    numbers.push(number);
  }
  for (index = 0; index < partsLength; index++) {
    number = numbers[index];
    if (index == partsLength - 1) {
      if (number >= pow(256, 5 - partsLength)) return null;
    } else if (number > 255) return null;
  }
  ipv4 = numbers.pop();
  for (index = 0; index < numbers.length; index++) {
    ipv4 += numbers[index] * pow(256, 3 - index);
  }
  return ipv4;
};

// eslint-disable-next-line max-statements -- TODO
var parseIPv6 = function (input) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

  var chr = function () {
    return input.charAt(pointer);
  };

  if (chr() == ':') {
    if (input.charAt(1) != ':') return;
    pointer += 2;
    pieceIndex++;
    compress = pieceIndex;
  }
  while (chr()) {
    if (pieceIndex == 8) return;
    if (chr() == ':') {
      if (compress !== null) return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (length < 4 && HEX.test(chr())) {
      value = value * 16 + parseInt(chr(), 16);
      pointer++;
      length++;
    }
    if (chr() == '.') {
      if (length == 0) return;
      pointer -= length;
      if (pieceIndex > 6) return;
      numbersSeen = 0;
      while (chr()) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (chr() == '.' && numbersSeen < 4) pointer++;
          else return;
        }
        if (!DIGIT.test(chr())) return;
        while (DIGIT.test(chr())) {
          number = parseInt(chr(), 10);
          if (ipv4Piece === null) ipv4Piece = number;
          else if (ipv4Piece == 0) return;
          else ipv4Piece = ipv4Piece * 10 + number;
          if (ipv4Piece > 255) return;
          pointer++;
        }
        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
        numbersSeen++;
        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
      }
      if (numbersSeen != 4) return;
      break;
    } else if (chr() == ':') {
      pointer++;
      if (!chr()) return;
    } else if (chr()) return;
    address[pieceIndex++] = value;
  }
  if (compress !== null) {
    swaps = pieceIndex - compress;
    pieceIndex = 7;
    while (pieceIndex != 0 && swaps > 0) {
      swap = address[pieceIndex];
      address[pieceIndex--] = address[compress + swaps - 1];
      address[compress + --swaps] = swap;
    }
  } else if (pieceIndex != 8) return;
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
  if (currLength > maxLength) {
    maxIndex = currStart;
    maxLength = currLength;
  }
  return maxIndex;
};

var serializeHost = function (host) {
  var result, index, compress, ignore0;
  // ipv4
  if (typeof host == 'number') {
    result = [];
    for (index = 0; index < 4; index++) {
      result.unshift(host % 256);
      host = floor(host / 256);
    } return result.join('.');
  // ipv6
  } else if (typeof host == 'object') {
    result = '';
    compress = findLongestZeroSequence(host);
    for (index = 0; index < 8; index++) {
      if (ignore0 && host[index] === 0) continue;
      if (ignore0) ignore0 = false;
      if (compress === index) {
        result += index ? ':' : '::';
        ignore0 = true;
      } else {
        result += host[index].toString(16);
        if (index < 7) result += ':';
      }
    }
    return '[' + result + ']';
  } return host;
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
  return code > 0x20 && code < 0x7F && !has(set, chr) ? chr : encodeURIComponent(chr);
};

var specialSchemes = {
  ftp: 21,
  file: null,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443
};

var isSpecial = function (url) {
  return has(specialSchemes, url.scheme);
};

var includesCredentials = function (url) {
  return url.username != '' || url.password != '';
};

var cannotHaveUsernamePasswordPort = function (url) {
  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
};

var isWindowsDriveLetter = function (string, normalized) {
  var second;
  return string.length == 2 && ALPHA.test(string.charAt(0))
    && ((second = string.charAt(1)) == ':' || (!normalized && second == '|'));
};

var startsWithWindowsDriveLetter = function (string) {
  var third;
  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (
    string.length == 2 ||
    ((third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#')
  );
};

var shortenURLsPath = function (url) {
  var path = url.path;
  var pathSize = path.length;
  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
    path.pop();
  }
};

var isSingleDot = function (segment) {
  return segment === '.' || segment.toLowerCase() === '%2e';
};

var isDoubleDot = function (segment) {
  segment = segment.toLowerCase();
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

// eslint-disable-next-line max-statements -- TODO
var parseURL = function (url, input, stateOverride, base) {
  var state = stateOverride || SCHEME_START;
  var pointer = 0;
  var buffer = '';
  var seenAt = false;
  var seenBracket = false;
  var seenPasswordToken = false;
  var codePoints, chr, bufferCodePoints, failure;

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
    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
  }

  input = input.replace(TAB_AND_NEW_LINE, '');

  codePoints = arrayFrom(input);

  while (pointer <= codePoints.length) {
    chr = codePoints[pointer];
    switch (state) {
      case SCHEME_START:
        if (chr && ALPHA.test(chr)) {
          buffer += chr.toLowerCase();
          state = SCHEME;
        } else if (!stateOverride) {
          state = NO_SCHEME;
          continue;
        } else return INVALID_SCHEME;
        break;

      case SCHEME:
        if (chr && (ALPHANUMERIC.test(chr) || chr == '+' || chr == '-' || chr == '.')) {
          buffer += chr.toLowerCase();
        } else if (chr == ':') {
          if (stateOverride && (
            (isSpecial(url) != has(specialSchemes, buffer)) ||
            (buffer == 'file' && (includesCredentials(url) || url.port !== null)) ||
            (url.scheme == 'file' && !url.host)
          )) return;
          url.scheme = buffer;
          if (stateOverride) {
            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
            return;
          }
          buffer = '';
          if (url.scheme == 'file') {
            state = FILE;
          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
            state = SPECIAL_RELATIVE_OR_AUTHORITY;
          } else if (isSpecial(url)) {
            state = SPECIAL_AUTHORITY_SLASHES;
          } else if (codePoints[pointer + 1] == '/') {
            state = PATH_OR_AUTHORITY;
            pointer++;
          } else {
            url.cannotBeABaseURL = true;
            url.path.push('');
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
        if (!base || (base.cannotBeABaseURL && chr != '#')) return INVALID_SCHEME;
        if (base.cannotBeABaseURL && chr == '#') {
          url.scheme = base.scheme;
          url.path = base.path.slice();
          url.query = base.query;
          url.fragment = '';
          url.cannotBeABaseURL = true;
          state = FRAGMENT;
          break;
        }
        state = base.scheme == 'file' ? FILE : RELATIVE;
        continue;

      case SPECIAL_RELATIVE_OR_AUTHORITY:
        if (chr == '/' && codePoints[pointer + 1] == '/') {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          pointer++;
        } else {
          state = RELATIVE;
          continue;
        } break;

      case PATH_OR_AUTHORITY:
        if (chr == '/') {
          state = AUTHORITY;
          break;
        } else {
          state = PATH;
          continue;
        }

      case RELATIVE:
        url.scheme = base.scheme;
        if (chr == EOF) {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
        } else if (chr == '/' || (chr == '\\' && isSpecial(url))) {
          state = RELATIVE_SLASH;
        } else if (chr == '?') {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = '';
          state = QUERY;
        } else if (chr == '#') {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
          url.fragment = '';
          state = FRAGMENT;
        } else {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.path.pop();
          state = PATH;
          continue;
        } break;

      case RELATIVE_SLASH:
        if (isSpecial(url) && (chr == '/' || chr == '\\')) {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
        } else if (chr == '/') {
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
        if (chr != '/' || buffer.charAt(pointer + 1) != '/') continue;
        pointer++;
        break;

      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
        if (chr != '/' && chr != '\\') {
          state = AUTHORITY;
          continue;
        } break;

      case AUTHORITY:
        if (chr == '@') {
          if (seenAt) buffer = '%40' + buffer;
          seenAt = true;
          bufferCodePoints = arrayFrom(buffer);
          for (var i = 0; i < bufferCodePoints.length; i++) {
            var codePoint = bufferCodePoints[i];
            if (codePoint == ':' && !seenPasswordToken) {
              seenPasswordToken = true;
              continue;
            }
            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
            if (seenPasswordToken) url.password += encodedCodePoints;
            else url.username += encodedCodePoints;
          }
          buffer = '';
        } else if (
          chr == EOF || chr == '/' || chr == '?' || chr == '#' ||
          (chr == '\\' && isSpecial(url))
        ) {
          if (seenAt && buffer == '') return INVALID_AUTHORITY;
          pointer -= arrayFrom(buffer).length + 1;
          buffer = '';
          state = HOST;
        } else buffer += chr;
        break;

      case HOST:
      case HOSTNAME:
        if (stateOverride && url.scheme == 'file') {
          state = FILE_HOST;
          continue;
        } else if (chr == ':' && !seenBracket) {
          if (buffer == '') return INVALID_HOST;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PORT;
          if (stateOverride == HOSTNAME) return;
        } else if (
          chr == EOF || chr == '/' || chr == '?' || chr == '#' ||
          (chr == '\\' && isSpecial(url))
        ) {
          if (isSpecial(url) && buffer == '') return INVALID_HOST;
          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PATH_START;
          if (stateOverride) return;
          continue;
        } else {
          if (chr == '[') seenBracket = true;
          else if (chr == ']') seenBracket = false;
          buffer += chr;
        } break;

      case PORT:
        if (DIGIT.test(chr)) {
          buffer += chr;
        } else if (
          chr == EOF || chr == '/' || chr == '?' || chr == '#' ||
          (chr == '\\' && isSpecial(url)) ||
          stateOverride
        ) {
          if (buffer != '') {
            var port = parseInt(buffer, 10);
            if (port > 0xFFFF) return INVALID_PORT;
            url.port = (isSpecial(url) && port === specialSchemes[url.scheme]) ? null : port;
            buffer = '';
          }
          if (stateOverride) return;
          state = PATH_START;
          continue;
        } else return INVALID_PORT;
        break;

      case FILE:
        url.scheme = 'file';
        if (chr == '/' || chr == '\\') state = FILE_SLASH;
        else if (base && base.scheme == 'file') {
          if (chr == EOF) {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
          } else if (chr == '?') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = '';
            state = QUERY;
          } else if (chr == '#') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
            url.fragment = '';
            state = FRAGMENT;
          } else {
            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
              url.host = base.host;
              url.path = base.path.slice();
              shortenURLsPath(url);
            }
            state = PATH;
            continue;
          }
        } else {
          state = PATH;
          continue;
        } break;

      case FILE_SLASH:
        if (chr == '/' || chr == '\\') {
          state = FILE_HOST;
          break;
        }
        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);
          else url.host = base.host;
        }
        state = PATH;
        continue;

      case FILE_HOST:
        if (chr == EOF || chr == '/' || chr == '\\' || chr == '?' || chr == '#') {
          if (!stateOverride && isWindowsDriveLetter(buffer)) {
            state = PATH;
          } else if (buffer == '') {
            url.host = '';
            if (stateOverride) return;
            state = PATH_START;
          } else {
            failure = parseHost(url, buffer);
            if (failure) return failure;
            if (url.host == 'localhost') url.host = '';
            if (stateOverride) return;
            buffer = '';
            state = PATH_START;
          } continue;
        } else buffer += chr;
        break;

      case PATH_START:
        if (isSpecial(url)) {
          state = PATH;
          if (chr != '/' && chr != '\\') continue;
        } else if (!stateOverride && chr == '?') {
          url.query = '';
          state = QUERY;
        } else if (!stateOverride && chr == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (chr != EOF) {
          state = PATH;
          if (chr != '/') continue;
        } break;

      case PATH:
        if (
          chr == EOF || chr == '/' ||
          (chr == '\\' && isSpecial(url)) ||
          (!stateOverride && (chr == '?' || chr == '#'))
        ) {
          if (isDoubleDot(buffer)) {
            shortenURLsPath(url);
            if (chr != '/' && !(chr == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else if (isSingleDot(buffer)) {
            if (chr != '/' && !(chr == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else {
            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
              if (url.host) url.host = '';
              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
            }
            url.path.push(buffer);
          }
          buffer = '';
          if (url.scheme == 'file' && (chr == EOF || chr == '?' || chr == '#')) {
            while (url.path.length > 1 && url.path[0] === '') {
              url.path.shift();
            }
          }
          if (chr == '?') {
            url.query = '';
            state = QUERY;
          } else if (chr == '#') {
            url.fragment = '';
            state = FRAGMENT;
          }
        } else {
          buffer += percentEncode(chr, pathPercentEncodeSet);
        } break;

      case CANNOT_BE_A_BASE_URL_PATH:
        if (chr == '?') {
          url.query = '';
          state = QUERY;
        } else if (chr == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (chr != EOF) {
          url.path[0] += percentEncode(chr, C0ControlPercentEncodeSet);
        } break;

      case QUERY:
        if (!stateOverride && chr == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (chr != EOF) {
          if (chr == "'" && isSpecial(url)) url.query += '%27';
          else if (chr == '#') url.query += '%23';
          else url.query += percentEncode(chr, C0ControlPercentEncodeSet);
        } break;

      case FRAGMENT:
        if (chr != EOF) url.fragment += percentEncode(chr, fragmentPercentEncodeSet);
        break;
    }

    pointer++;
  }
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance(this, URLConstructor, 'URL');
  var base = arguments.length > 1 ? arguments[1] : undefined;
  var urlString = $toString(url);
  var state = setInternalState(that, { type: 'URL' });
  var baseState, failure;
  if (base !== undefined) {
    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
    else {
      failure = parseURL(baseState = {}, $toString(base));
      if (failure) throw TypeError(failure);
    }
  }
  failure = parseURL(state, urlString, null, baseState);
  if (failure) throw TypeError(failure);
  var searchParams = state.searchParams = new URLSearchParams$1();
  var searchParamsState = getInternalSearchParamsState(searchParams);
  searchParamsState.updateSearchParams(state.query);
  searchParamsState.updateURL = function () {
    state.query = String(searchParams) || null;
  };
  if (!DESCRIPTORS) {
    that.href = serializeURL.call(that);
    that.origin = getOrigin.call(that);
    that.protocol = getProtocol.call(that);
    that.username = getUsername.call(that);
    that.password = getPassword.call(that);
    that.host = getHost.call(that);
    that.hostname = getHostname.call(that);
    that.port = getPort.call(that);
    that.pathname = getPathname.call(that);
    that.search = getSearch.call(that);
    that.searchParams = getSearchParams.call(that);
    that.hash = getHash.call(that);
  }
};

var URLPrototype = URLConstructor.prototype;

var serializeURL = function () {
  var url = getInternalURLState(this);
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
    if (includesCredentials(url)) {
      output += username + (password ? ':' + password : '') + '@';
    }
    output += serializeHost(host);
    if (port !== null) output += ':' + port;
  } else if (scheme == 'file') output += '//';
  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
  if (query !== null) output += '?' + query;
  if (fragment !== null) output += '#' + fragment;
  return output;
};

var getOrigin = function () {
  var url = getInternalURLState(this);
  var scheme = url.scheme;
  var port = url.port;
  if (scheme == 'blob') try {
    return new URLConstructor(scheme.path[0]).origin;
  } catch (error) {
    return 'null';
  }
  if (scheme == 'file' || !isSpecial(url)) return 'null';
  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
};

var getProtocol = function () {
  return getInternalURLState(this).scheme + ':';
};

var getUsername = function () {
  return getInternalURLState(this).username;
};

var getPassword = function () {
  return getInternalURLState(this).password;
};

var getHost = function () {
  var url = getInternalURLState(this);
  var host = url.host;
  var port = url.port;
  return host === null ? ''
    : port === null ? serializeHost(host)
    : serializeHost(host) + ':' + port;
};

var getHostname = function () {
  var host = getInternalURLState(this).host;
  return host === null ? '' : serializeHost(host);
};

var getPort = function () {
  var port = getInternalURLState(this).port;
  return port === null ? '' : String(port);
};

var getPathname = function () {
  var url = getInternalURLState(this);
  var path = url.path;
  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
};

var getSearch = function () {
  var query = getInternalURLState(this).query;
  return query ? '?' + query : '';
};

var getSearchParams = function () {
  return getInternalURLState(this).searchParams;
};

var getHash = function () {
  var fragment = getInternalURLState(this).fragment;
  return fragment ? '#' + fragment : '';
};

var accessorDescriptor = function (getter, setter) {
  return { get: getter, set: setter, configurable: true, enumerable: true };
};

if (DESCRIPTORS) {
  defineProperties(URLPrototype, {
    // `URL.prototype.href` accessors pair
    // https://url.spec.whatwg.org/#dom-url-href
    href: accessorDescriptor(serializeURL, function (href) {
      var url = getInternalURLState(this);
      var urlString = $toString(href);
      var failure = parseURL(url, urlString);
      if (failure) throw TypeError(failure);
      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
    }),
    // `URL.prototype.origin` getter
    // https://url.spec.whatwg.org/#dom-url-origin
    origin: accessorDescriptor(getOrigin),
    // `URL.prototype.protocol` accessors pair
    // https://url.spec.whatwg.org/#dom-url-protocol
    protocol: accessorDescriptor(getProtocol, function (protocol) {
      var url = getInternalURLState(this);
      parseURL(url, $toString(protocol) + ':', SCHEME_START);
    }),
    // `URL.prototype.username` accessors pair
    // https://url.spec.whatwg.org/#dom-url-username
    username: accessorDescriptor(getUsername, function (username) {
      var url = getInternalURLState(this);
      var codePoints = arrayFrom($toString(username));
      if (cannotHaveUsernamePasswordPort(url)) return;
      url.username = '';
      for (var i = 0; i < codePoints.length; i++) {
        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
      }
    }),
    // `URL.prototype.password` accessors pair
    // https://url.spec.whatwg.org/#dom-url-password
    password: accessorDescriptor(getPassword, function (password) {
      var url = getInternalURLState(this);
      var codePoints = arrayFrom($toString(password));
      if (cannotHaveUsernamePasswordPort(url)) return;
      url.password = '';
      for (var i = 0; i < codePoints.length; i++) {
        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
      }
    }),
    // `URL.prototype.host` accessors pair
    // https://url.spec.whatwg.org/#dom-url-host
    host: accessorDescriptor(getHost, function (host) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      parseURL(url, $toString(host), HOST);
    }),
    // `URL.prototype.hostname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hostname
    hostname: accessorDescriptor(getHostname, function (hostname) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      parseURL(url, $toString(hostname), HOSTNAME);
    }),
    // `URL.prototype.port` accessors pair
    // https://url.spec.whatwg.org/#dom-url-port
    port: accessorDescriptor(getPort, function (port) {
      var url = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(url)) return;
      port = $toString(port);
      if (port == '') url.port = null;
      else parseURL(url, port, PORT);
    }),
    // `URL.prototype.pathname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-pathname
    pathname: accessorDescriptor(getPathname, function (pathname) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      url.path = [];
      parseURL(url, $toString(pathname), PATH_START);
    }),
    // `URL.prototype.search` accessors pair
    // https://url.spec.whatwg.org/#dom-url-search
    search: accessorDescriptor(getSearch, function (search) {
      var url = getInternalURLState(this);
      search = $toString(search);
      if (search == '') {
        url.query = null;
      } else {
        if ('?' == search.charAt(0)) search = search.slice(1);
        url.query = '';
        parseURL(url, search, QUERY);
      }
      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
    }),
    // `URL.prototype.searchParams` getter
    // https://url.spec.whatwg.org/#dom-url-searchparams
    searchParams: accessorDescriptor(getSearchParams),
    // `URL.prototype.hash` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hash
    hash: accessorDescriptor(getHash, function (hash) {
      var url = getInternalURLState(this);
      hash = $toString(hash);
      if (hash == '') {
        url.fragment = null;
        return;
      }
      if ('#' == hash.charAt(0)) hash = hash.slice(1);
      url.fragment = '';
      parseURL(url, hash, FRAGMENT);
    })
  });
}

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
redefine(URLPrototype, 'toJSON', function toJSON() {
  return serializeURL.call(this);
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
redefine(URLPrototype, 'toString', function toString() {
  return serializeURL.call(this);
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
    return nativeCreateObjectURL.apply(NativeURL, arguments);
  });
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
    return nativeRevokeObjectURL.apply(NativeURL, arguments);
  });
}

setToStringTag(URLConstructor, 'URL');

$$1({ global: true, forced: !USE_NATIVE_URL, sham: !DESCRIPTORS }, {
  URL: URLConstructor
});

var $ = _export;

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
$({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return URL.prototype.toString.call(this);
  }
});
