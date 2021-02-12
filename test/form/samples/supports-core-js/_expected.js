var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global$1 =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func
  (function () { return this; })() || Function('return this')();

var objectGetOwnPropertyDescriptor = {};

var fails = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var fails$1 = fails;

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails$1(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var objectPropertyIsEnumerable = {};

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;

var createPropertyDescriptor = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var toString = {}.toString;

var classofRaw = function (it) {
  return toString.call(it).slice(8, -1);
};

var fails$2 = fails;
var classof = classofRaw;

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails$2(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = indexedObject;
var requireObjectCoercible$1 = requireObjectCoercible;

var toIndexedObject = function (it) {
  return IndexedObject(requireObjectCoercible$1(it));
};

var isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var isObject$1 = isObject;

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var toPrimitive = function (input, PREFERRED_STRING) {
  if (!isObject$1(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$1(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject$1(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$1(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var hasOwnProperty = {}.hasOwnProperty;

var has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var global$2 = global$1;
var isObject$2 = isObject;

var document$1 = global$2.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject$2(document$1) && isObject$2(document$1.createElement);

var documentCreateElement = function (it) {
  return EXISTS ? document$1.createElement(it) : {};
};

var DESCRIPTORS = descriptors;
var fails$3 = fails;
var createElement = documentCreateElement;

// Thank's IE8 for his funny defineProperty
var ie8DomDefine = !DESCRIPTORS && !fails$3(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

var DESCRIPTORS$1 = descriptors;
var propertyIsEnumerableModule = objectPropertyIsEnumerable;
var createPropertyDescriptor$1 = createPropertyDescriptor;
var toIndexedObject$1 = toIndexedObject;
var toPrimitive$1 = toPrimitive;
var has$1 = has;
var IE8_DOM_DEFINE = ie8DomDefine;

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
objectGetOwnPropertyDescriptor.f = DESCRIPTORS$1 ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject$1(O);
  P = toPrimitive$1(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has$1(O, P)) return createPropertyDescriptor$1(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};

var objectDefineProperty = {};

var isObject$3 = isObject;

var anObject = function (it) {
  if (!isObject$3(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};

var DESCRIPTORS$2 = descriptors;
var IE8_DOM_DEFINE$1 = ie8DomDefine;
var anObject$1 = anObject;
var toPrimitive$2 = toPrimitive;

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
objectDefineProperty.f = DESCRIPTORS$2 ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject$1(O);
  P = toPrimitive$2(P, true);
  anObject$1(Attributes);
  if (IE8_DOM_DEFINE$1) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var DESCRIPTORS$3 = descriptors;
var definePropertyModule = objectDefineProperty;
var createPropertyDescriptor$2 = createPropertyDescriptor;

var createNonEnumerableProperty = DESCRIPTORS$3 ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor$2(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var redefine = {exports: {}};

var global$3 = global$1;
var createNonEnumerableProperty$1 = createNonEnumerableProperty;

var setGlobal = function (key, value) {
  try {
    createNonEnumerableProperty$1(global$3, key, value);
  } catch (error) {
    global$3[key] = value;
  } return value;
};

var global$4 = global$1;
var setGlobal$1 = setGlobal;

var SHARED = '__core-js_shared__';
var store = global$4[SHARED] || setGlobal$1(SHARED, {});

var sharedStore = store;

var store$1 = sharedStore;

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof store$1.inspectSource != 'function') {
  store$1.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

var inspectSource = store$1.inspectSource;

var global$5 = global$1;
var inspectSource$1 = inspectSource;

var WeakMap = global$5.WeakMap;

var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource$1(WeakMap));

var shared = {exports: {}};

var isPure = false;

var store$2 = sharedStore;

(shared.exports = function (key, value) {
  return store$2[key] || (store$2[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.8.3',
  mode: 'global',
  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
});

var id = 0;
var postfix = Math.random();

var uid = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};

var shared$1 = shared.exports;
var uid$1 = uid;

var keys = shared$1('keys');

var sharedKey = function (key) {
  return keys[key] || (keys[key] = uid$1(key));
};

var hiddenKeys = {};

var NATIVE_WEAK_MAP = nativeWeakMap;
var global$6 = global$1;
var isObject$4 = isObject;
var createNonEnumerableProperty$2 = createNonEnumerableProperty;
var objectHas = has;
var shared$2 = sharedStore;
var sharedKey$1 = sharedKey;
var hiddenKeys$1 = hiddenKeys;

var WeakMap$1 = global$6.WeakMap;
var set, get, has$2;

var enforce = function (it) {
  return has$2(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject$4(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store$3 = shared$2.state || (shared$2.state = new WeakMap$1());
  var wmget = store$3.get;
  var wmhas = store$3.has;
  var wmset = store$3.set;
  set = function (it, metadata) {
    metadata.facade = it;
    wmset.call(store$3, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store$3, it) || {};
  };
  has$2 = function (it) {
    return wmhas.call(store$3, it);
  };
} else {
  var STATE = sharedKey$1('state');
  hiddenKeys$1[STATE] = true;
  set = function (it, metadata) {
    metadata.facade = it;
    createNonEnumerableProperty$2(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has$2 = function (it) {
    return objectHas(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has$2,
  enforce: enforce,
  getterFor: getterFor
};

var global$7 = global$1;
var createNonEnumerableProperty$3 = createNonEnumerableProperty;
var has$3 = has;
var setGlobal$2 = setGlobal;
var inspectSource$2 = inspectSource;
var InternalStateModule = internalState;

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(String).split('String');

(redefine.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  var state;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has$3(value, 'name')) {
      createNonEnumerableProperty$3(value, 'name', key);
    }
    state = enforceInternalState(value);
    if (!state.source) {
      state.source = TEMPLATE.join(typeof key == 'string' ? key : '');
    }
  }
  if (O === global$7) {
    if (simple) O[key] = value;
    else setGlobal$2(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty$3(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || inspectSource$2(this);
});

var global$8 = global$1;

var path = global$8;

var path$1 = path;
var global$9 = global$1;

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

var getBuiltIn = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path$1[namespace]) || aFunction(global$9[namespace])
    : path$1[namespace] && path$1[namespace][method] || global$9[namespace] && global$9[namespace][method];
};

var objectGetOwnPropertyNames = {};

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.es/ecma262/#sec-tointeger
var toInteger = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};

var toInteger$1 = toInteger;

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength = function (argument) {
  return argument > 0 ? min(toInteger$1(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var toInteger$2 = toInteger;

var max = Math.max;
var min$1 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex = function (index, length) {
  var integer = toInteger$2(index);
  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
};

var toIndexedObject$2 = toIndexedObject;
var toLength$1 = toLength;
var toAbsoluteIndex$1 = toAbsoluteIndex;

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject$2($this);
    var length = toLength$1(O.length);
    var index = toAbsoluteIndex$1(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
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
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};

var has$4 = has;
var toIndexedObject$3 = toIndexedObject;
var indexOf = arrayIncludes.indexOf;
var hiddenKeys$2 = hiddenKeys;

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject$3(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has$4(hiddenKeys$2, key) && has$4(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has$4(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var internalObjectKeys = objectKeysInternal;
var enumBugKeys$1 = enumBugKeys;

var hiddenKeys$3 = enumBugKeys$1.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys$3);
};

var objectGetOwnPropertySymbols = {};

objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

var getBuiltIn$1 = getBuiltIn;
var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
var anObject$2 = anObject;

// all object keys, includes non-enumerable and symbols
var ownKeys = getBuiltIn$1('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject$2(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

var has$5 = has;
var ownKeys$1 = ownKeys;
var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
var definePropertyModule$1 = objectDefineProperty;

var copyConstructorProperties = function (target, source) {
  var keys = ownKeys$1(source);
  var defineProperty = definePropertyModule$1.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has$5(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

var fails$4 = fails;

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails$4(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

var isForced_1 = isForced;

var global$a = global$1;
var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var createNonEnumerableProperty$4 = createNonEnumerableProperty;
var redefine$1 = redefine.exports;
var setGlobal$3 = setGlobal;
var copyConstructorProperties$1 = copyConstructorProperties;
var isForced$1 = isForced_1;

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
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global$a;
  } else if (STATIC) {
    target = global$a[TARGET] || setGlobal$3(TARGET, {});
  } else {
    target = (global$a[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor$1(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced$1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties$1(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty$4(sourceProperty, 'sham', true);
    }
    // extend global
    redefine$1(target, key, sourceProperty, options);
  }
};

var fails$5 = fails;

var nativeSymbol = !!Object.getOwnPropertySymbols && !fails$5(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});

var NATIVE_SYMBOL = nativeSymbol;

var useSymbolAsUid = NATIVE_SYMBOL
  // eslint-disable-next-line no-undef
  && !Symbol.sham
  // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';

var classof$1 = classofRaw;

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
var isArray = Array.isArray || function isArray(arg) {
  return classof$1(arg) == 'Array';
};

var requireObjectCoercible$2 = requireObjectCoercible;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject = function (argument) {
  return Object(requireObjectCoercible$2(argument));
};

var internalObjectKeys$1 = objectKeysInternal;
var enumBugKeys$2 = enumBugKeys;

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
var objectKeys = Object.keys || function keys(O) {
  return internalObjectKeys$1(O, enumBugKeys$2);
};

var DESCRIPTORS$4 = descriptors;
var definePropertyModule$2 = objectDefineProperty;
var anObject$3 = anObject;
var objectKeys$1 = objectKeys;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
var objectDefineProperties = DESCRIPTORS$4 ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject$3(O);
  var keys = objectKeys$1(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule$2.f(O, key = keys[index++], Properties[key]);
  return O;
};

var getBuiltIn$2 = getBuiltIn;

var html = getBuiltIn$2('document', 'documentElement');

var anObject$4 = anObject;
var defineProperties = objectDefineProperties;
var enumBugKeys$3 = enumBugKeys;
var hiddenKeys$4 = hiddenKeys;
var html$1 = html;
var documentCreateElement$1 = documentCreateElement;
var sharedKey$2 = sharedKey;

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO = sharedKey$2('IE_PROTO');

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
    /* global ActiveXObject */
    activeXDocument = document.domain && new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
  var length = enumBugKeys$3.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys$3[length]];
  return NullProtoObject();
};

hiddenKeys$4[IE_PROTO] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
var objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject$4(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : defineProperties(result, Properties);
};

var objectGetOwnPropertyNamesExternal = {};

var toIndexedObject$4 = toIndexedObject;
var nativeGetOwnPropertyNames = objectGetOwnPropertyNames.f;

var toString$1 = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return nativeGetOwnPropertyNames(it);
  } catch (error) {
    return windowNames.slice();
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
  return windowNames && toString$1.call(it) == '[object Window]'
    ? getWindowNames(it)
    : nativeGetOwnPropertyNames(toIndexedObject$4(it));
};

var global$b = global$1;
var shared$3 = shared.exports;
var has$6 = has;
var uid$2 = uid;
var NATIVE_SYMBOL$1 = nativeSymbol;
var USE_SYMBOL_AS_UID = useSymbolAsUid;

var WellKnownSymbolsStore = shared$3('wks');
var Symbol$1 = global$b.Symbol;
var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$2;

var wellKnownSymbol = function (name) {
  if (!has$6(WellKnownSymbolsStore, name)) {
    if (NATIVE_SYMBOL$1 && has$6(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];
    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore[name];
};

var wellKnownSymbolWrapped = {};

var wellKnownSymbol$1 = wellKnownSymbol;

wellKnownSymbolWrapped.f = wellKnownSymbol$1;

var path$2 = path;
var has$7 = has;
var wrappedWellKnownSymbolModule = wellKnownSymbolWrapped;
var defineProperty = objectDefineProperty.f;

var defineWellKnownSymbol = function (NAME) {
  var Symbol = path$2.Symbol || (path$2.Symbol = {});
  if (!has$7(Symbol, NAME)) defineProperty(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule.f(NAME)
  });
};

var defineProperty$1 = objectDefineProperty.f;
var has$8 = has;
var wellKnownSymbol$2 = wellKnownSymbol;

var TO_STRING_TAG = wellKnownSymbol$2('toStringTag');

var setToStringTag = function (it, TAG, STATIC) {
  if (it && !has$8(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
    defineProperty$1(it, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};

var aFunction$1 = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};

var aFunction$2 = aFunction$1;

// optional / simple context binding
var functionBindContext = function (fn, that, length) {
  aFunction$2(fn);
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

var isObject$5 = isObject;
var isArray$1 = isArray;
var wellKnownSymbol$3 = wellKnownSymbol;

var SPECIES = wellKnownSymbol$3('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate = function (originalArray, length) {
  var C;
  if (isArray$1(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray$1(C.prototype))) C = undefined;
    else if (isObject$5(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};

var bind = functionBindContext;
var IndexedObject$1 = indexedObject;
var toObject$1 = toObject;
var toLength$2 = toLength;
var arraySpeciesCreate$1 = arraySpeciesCreate;

var push = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterOut }` methods implementation
var createMethod$1 = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var IS_FILTER_OUT = TYPE == 7;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject$1($this);
    var self = IndexedObject$1(O);
    var boundFunction = bind(callbackfn, that, 3);
    var length = toLength$2(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate$1;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_OUT ? create($this, 0) : undefined;
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
          case 2: push.call(target, value); // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push.call(target, value); // filterOut
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$1(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod$1(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod$1(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod$1(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod$1(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod$1(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$1(6),
  // `Array.prototype.filterOut` method
  // https://github.com/tc39/proposal-array-filtering
  filterOut: createMethod$1(7)
};

var $ = _export;
var global$c = global$1;
var getBuiltIn$3 = getBuiltIn;
var DESCRIPTORS$5 = descriptors;
var NATIVE_SYMBOL$2 = nativeSymbol;
var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;
var fails$6 = fails;
var has$9 = has;
var isArray$2 = isArray;
var isObject$6 = isObject;
var anObject$5 = anObject;
var toObject$2 = toObject;
var toIndexedObject$5 = toIndexedObject;
var toPrimitive$3 = toPrimitive;
var createPropertyDescriptor$3 = createPropertyDescriptor;
var nativeObjectCreate = objectCreate;
var objectKeys$2 = objectKeys;
var getOwnPropertyNamesModule$1 = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternal = objectGetOwnPropertyNamesExternal;
var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
var getOwnPropertyDescriptorModule$1 = objectGetOwnPropertyDescriptor;
var definePropertyModule$3 = objectDefineProperty;
var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
var createNonEnumerableProperty$5 = createNonEnumerableProperty;
var redefine$2 = redefine.exports;
var shared$4 = shared.exports;
var sharedKey$3 = sharedKey;
var hiddenKeys$5 = hiddenKeys;
var uid$3 = uid;
var wellKnownSymbol$4 = wellKnownSymbol;
var wrappedWellKnownSymbolModule$1 = wellKnownSymbolWrapped;
var defineWellKnownSymbol$1 = defineWellKnownSymbol;
var setToStringTag$1 = setToStringTag;
var InternalStateModule$1 = internalState;
var $forEach = arrayIteration.forEach;

var HIDDEN = sharedKey$3('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE$1 = 'prototype';
var TO_PRIMITIVE = wellKnownSymbol$4('toPrimitive');
var setInternalState = InternalStateModule$1.set;
var getInternalState$1 = InternalStateModule$1.getterFor(SYMBOL);
var ObjectPrototype = Object[PROTOTYPE$1];
var $Symbol = global$c.Symbol;
var $stringify = getBuiltIn$3('JSON', 'stringify');
var nativeGetOwnPropertyDescriptor$1 = getOwnPropertyDescriptorModule$1.f;
var nativeDefineProperty$1 = definePropertyModule$3.f;
var nativeGetOwnPropertyNames$1 = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable$1 = propertyIsEnumerableModule$1.f;
var AllSymbols = shared$4('symbols');
var ObjectPrototypeSymbols = shared$4('op-symbols');
var StringToSymbolRegistry = shared$4('string-to-symbol-registry');
var SymbolToStringRegistry = shared$4('symbol-to-string-registry');
var WellKnownSymbolsStore$1 = shared$4('wks');
var QObject = global$c.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDescriptor = DESCRIPTORS$5 && fails$6(function () {
  return nativeObjectCreate(nativeDefineProperty$1({}, 'a', {
    get: function () { return nativeDefineProperty$1(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (O, P, Attributes) {
  var ObjectPrototypeDescriptor = nativeGetOwnPropertyDescriptor$1(ObjectPrototype, P);
  if (ObjectPrototypeDescriptor) delete ObjectPrototype[P];
  nativeDefineProperty$1(O, P, Attributes);
  if (ObjectPrototypeDescriptor && O !== ObjectPrototype) {
    nativeDefineProperty$1(ObjectPrototype, P, ObjectPrototypeDescriptor);
  }
} : nativeDefineProperty$1;

var wrap = function (tag, description) {
  var symbol = AllSymbols[tag] = nativeObjectCreate($Symbol[PROTOTYPE$1]);
  setInternalState(symbol, {
    type: SYMBOL,
    tag: tag,
    description: description
  });
  if (!DESCRIPTORS$5) symbol.description = description;
  return symbol;
};

var isSymbol = USE_SYMBOL_AS_UID$1 ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return Object(it) instanceof $Symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject$5(O);
  var key = toPrimitive$3(P, true);
  anObject$5(Attributes);
  if (has$9(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!has$9(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor$3(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (has$9(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor$3(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty$1(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject$5(O);
  var properties = toIndexedObject$5(Properties);
  var keys = objectKeys$2(properties).concat($getOwnPropertySymbols(properties));
  $forEach(keys, function (key) {
    if (!DESCRIPTORS$5 || $propertyIsEnumerable.call(properties, key)) $defineProperty(O, key, properties[key]);
  });
  return O;
};

var $create = function create(O, Properties) {
  return Properties === undefined ? nativeObjectCreate(O) : $defineProperties(nativeObjectCreate(O), Properties);
};

var $propertyIsEnumerable = function propertyIsEnumerable(V) {
  var P = toPrimitive$3(V, true);
  var enumerable = nativePropertyIsEnumerable$1.call(this, P);
  if (this === ObjectPrototype && has$9(AllSymbols, P) && !has$9(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !has$9(this, P) || !has$9(AllSymbols, P) || has$9(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject$5(O);
  var key = toPrimitive$3(P, true);
  if (it === ObjectPrototype && has$9(AllSymbols, key) && !has$9(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor$1(it, key);
  if (descriptor && has$9(AllSymbols, key) && !(has$9(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames$1(toIndexedObject$5(O));
  var result = [];
  $forEach(names, function (key) {
    if (!has$9(AllSymbols, key) && !has$9(hiddenKeys$5, key)) result.push(key);
  });
  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype;
  var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject$5(O));
  var result = [];
  $forEach(names, function (key) {
    if (has$9(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has$9(ObjectPrototype, key))) {
      result.push(AllSymbols[key]);
    }
  });
  return result;
};

// `Symbol` constructor
// https://tc39.es/ecma262/#sec-symbol-constructor
if (!NATIVE_SYMBOL$2) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor');
    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
    var tag = uid$3(description);
    var setter = function (value) {
      if (this === ObjectPrototype) setter.call(ObjectPrototypeSymbols, value);
      if (has$9(this, HIDDEN) && has$9(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDescriptor(this, tag, createPropertyDescriptor$3(1, value));
    };
    if (DESCRIPTORS$5 && USE_SETTER) setSymbolDescriptor(ObjectPrototype, tag, { configurable: true, set: setter });
    return wrap(tag, description);
  };

  redefine$2($Symbol[PROTOTYPE$1], 'toString', function toString() {
    return getInternalState$1(this).tag;
  });

  redefine$2($Symbol, 'withoutSetter', function (description) {
    return wrap(uid$3(description), description);
  });

  propertyIsEnumerableModule$1.f = $propertyIsEnumerable;
  definePropertyModule$3.f = $defineProperty;
  getOwnPropertyDescriptorModule$1.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule$1.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule$1.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule$1.f = function (name) {
    return wrap(wellKnownSymbol$4(name), name);
  };

  if (DESCRIPTORS$5) {
    // https://github.com/tc39/proposal-Symbol-description
    nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
      configurable: true,
      get: function description() {
        return getInternalState$1(this).description;
      }
    });
    {
      redefine$2(ObjectPrototype, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
    }
  }
}

$({ global: true, wrap: true, forced: !NATIVE_SYMBOL$2, sham: !NATIVE_SYMBOL$2 }, {
  Symbol: $Symbol
});

$forEach(objectKeys$2(WellKnownSymbolsStore$1), function (name) {
  defineWellKnownSymbol$1(name);
});

$({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL$2 }, {
  // `Symbol.for` method
  // https://tc39.es/ecma262/#sec-symbol.for
  'for': function (key) {
    var string = String(key);
    if (has$9(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = $Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
  // `Symbol.keyFor` method
  // https://tc39.es/ecma262/#sec-symbol.keyfor
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
    if (has$9(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL$2, sham: !DESCRIPTORS$5 }, {
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

$({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL$2 }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames,
  // `Object.getOwnPropertySymbols` method
  // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
$({ target: 'Object', stat: true, forced: fails$6(function () { getOwnPropertySymbolsModule$1.f(1); }) }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return getOwnPropertySymbolsModule$1.f(toObject$2(it));
  }
});

// `JSON.stringify` method behavior with symbols
// https://tc39.es/ecma262/#sec-json.stringify
if ($stringify) {
  var FORCED_JSON_STRINGIFY = !NATIVE_SYMBOL$2 || fails$6(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return $stringify([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || $stringify(Object(symbol)) != '{}';
  });

  $({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var args = [it];
      var index = 1;
      var $replacer;
      while (arguments.length > index) args.push(arguments[index++]);
      $replacer = replacer;
      if (!isObject$6(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray$2(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return $stringify.apply(null, args);
    }
  });
}

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE]) {
  createNonEnumerableProperty$5($Symbol[PROTOTYPE$1], TO_PRIMITIVE, $Symbol[PROTOTYPE$1].valueOf);
}
// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag$1($Symbol, SYMBOL);

hiddenKeys$5[HIDDEN] = true;

var defineWellKnownSymbol$2 = defineWellKnownSymbol;

// `Symbol.asyncIterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.asynciterator
defineWellKnownSymbol$2('asyncIterator');

var $$1 = _export;
var DESCRIPTORS$6 = descriptors;
var global$d = global$1;
var has$a = has;
var isObject$7 = isObject;
var defineProperty$2 = objectDefineProperty.f;
var copyConstructorProperties$2 = copyConstructorProperties;

var NativeSymbol = global$d.Symbol;

if (DESCRIPTORS$6 && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
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
  copyConstructorProperties$2(SymbolWrapper, NativeSymbol);
  var symbolPrototype = SymbolWrapper.prototype = NativeSymbol.prototype;
  symbolPrototype.constructor = SymbolWrapper;

  var symbolToString = symbolPrototype.toString;
  var native = String(NativeSymbol('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  defineProperty$2(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject$7(this) ? this.valueOf() : this;
      var string = symbolToString.call(symbol);
      if (has$a(EmptyStringDescriptionStore, symbol)) return '';
      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  $$1({ global: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}

var defineWellKnownSymbol$3 = defineWellKnownSymbol;

// `Symbol.hasInstance` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.hasinstance
defineWellKnownSymbol$3('hasInstance');

var defineWellKnownSymbol$4 = defineWellKnownSymbol;

// `Symbol.isConcatSpreadable` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.isconcatspreadable
defineWellKnownSymbol$4('isConcatSpreadable');

var defineWellKnownSymbol$5 = defineWellKnownSymbol;

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
defineWellKnownSymbol$5('iterator');

var defineWellKnownSymbol$6 = defineWellKnownSymbol;

// `Symbol.match` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.match
defineWellKnownSymbol$6('match');

var defineWellKnownSymbol$7 = defineWellKnownSymbol;

// `Symbol.matchAll` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.matchall
defineWellKnownSymbol$7('matchAll');

var defineWellKnownSymbol$8 = defineWellKnownSymbol;

// `Symbol.replace` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.replace
defineWellKnownSymbol$8('replace');

var defineWellKnownSymbol$9 = defineWellKnownSymbol;

// `Symbol.search` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.search
defineWellKnownSymbol$9('search');

var defineWellKnownSymbol$a = defineWellKnownSymbol;

// `Symbol.species` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.species
defineWellKnownSymbol$a('species');

var defineWellKnownSymbol$b = defineWellKnownSymbol;

// `Symbol.split` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.split
defineWellKnownSymbol$b('split');

var defineWellKnownSymbol$c = defineWellKnownSymbol;

// `Symbol.toPrimitive` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.toprimitive
defineWellKnownSymbol$c('toPrimitive');

var defineWellKnownSymbol$d = defineWellKnownSymbol;

// `Symbol.toStringTag` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.tostringtag
defineWellKnownSymbol$d('toStringTag');

var defineWellKnownSymbol$e = defineWellKnownSymbol;

// `Symbol.unscopables` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.unscopables
defineWellKnownSymbol$e('unscopables');

var fails$7 = fails;

var correctPrototypeGetter = !fails$7(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var has$b = has;
var toObject$3 = toObject;
var sharedKey$4 = sharedKey;
var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

var IE_PROTO$1 = sharedKey$4('IE_PROTO');
var ObjectPrototype$1 = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
  O = toObject$3(O);
  if (has$b(O, IE_PROTO$1)) return O[IE_PROTO$1];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype$1 : null;
};

var isObject$8 = isObject;

var aPossiblePrototype = function (it) {
  if (!isObject$8(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};

var anObject$6 = anObject;
var aPossiblePrototype$1 = aPossiblePrototype;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject$6(O);
    aPossiblePrototype$1(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var iterators = {};

var wellKnownSymbol$5 = wellKnownSymbol;
var Iterators = iterators;

var ITERATOR = wellKnownSymbol$5('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};

var wellKnownSymbol$6 = wellKnownSymbol;

var TO_STRING_TAG$1 = wellKnownSymbol$6('toStringTag');
var test = {};

test[TO_STRING_TAG$1] = 'z';

var toStringTagSupport = String(test) === '[object z]';

var TO_STRING_TAG_SUPPORT = toStringTagSupport;
var classofRaw$1 = classofRaw;
var wellKnownSymbol$7 = wellKnownSymbol;

var TO_STRING_TAG$2 = wellKnownSymbol$7('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw$1(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof$2 = TO_STRING_TAG_SUPPORT ? classofRaw$1 : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw$1(O)
    // ES3 arguments fallback
    : (result = classofRaw$1(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};

var classof$3 = classof$2;
var Iterators$1 = iterators;
var wellKnownSymbol$8 = wellKnownSymbol;

var ITERATOR$1 = wellKnownSymbol$8('iterator');

var getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$1]
    || it['@@iterator']
    || Iterators$1[classof$3(it)];
};

var anObject$7 = anObject;

var iteratorClose = function (iterator) {
  var returnMethod = iterator['return'];
  if (returnMethod !== undefined) {
    return anObject$7(returnMethod.call(iterator)).value;
  }
};

var anObject$8 = anObject;
var isArrayIteratorMethod$1 = isArrayIteratorMethod;
var toLength$3 = toLength;
var bind$1 = functionBindContext;
var getIteratorMethod$1 = getIteratorMethod;
var iteratorClose$1 = iteratorClose;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var iterate = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = bind$1(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose$1(iterator);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject$8(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod$1(iterable);
    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod$1(iterFn)) {
      for (index = 0, length = toLength$3(iterable.length); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && result instanceof Result) return result;
      } return new Result(false);
    }
    iterator = iterFn.call(iterable);
  }

  next = iterator.next;
  while (!(step = next.call(iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose$1(iterator);
      throw error;
    }
    if (typeof result == 'object' && result && result instanceof Result) return result;
  } return new Result(false);
};

var $$2 = _export;
var getPrototypeOf = objectGetPrototypeOf;
var setPrototypeOf = objectSetPrototypeOf;
var create = objectCreate;
var createNonEnumerableProperty$6 = createNonEnumerableProperty;
var createPropertyDescriptor$4 = createPropertyDescriptor;
var iterate$1 = iterate;

var $AggregateError = function AggregateError(errors, message) {
  var that = this;
  if (!(that instanceof $AggregateError)) return new $AggregateError(errors, message);
  if (setPrototypeOf) {
    // eslint-disable-next-line unicorn/error-message
    that = setPrototypeOf(new Error(undefined), getPrototypeOf(that));
  }
  if (message !== undefined) createNonEnumerableProperty$6(that, 'message', String(message));
  var errorsArray = [];
  iterate$1(errors, errorsArray.push, { that: errorsArray });
  createNonEnumerableProperty$6(that, 'errors', errorsArray);
  return that;
};

$AggregateError.prototype = create(Error.prototype, {
  constructor: createPropertyDescriptor$4(5, $AggregateError),
  message: createPropertyDescriptor$4(5, ''),
  name: createPropertyDescriptor$4(5, 'AggregateError')
});

// `AggregateError` constructor
// https://tc39.es/ecma262/#sec-aggregate-error-constructor
$$2({ global: true }, {
  AggregateError: $AggregateError
});

var anObject$9 = anObject;
var iteratorClose$2 = iteratorClose;

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject$9(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    iteratorClose$2(iterator);
    throw error;
  }
};

var toPrimitive$4 = toPrimitive;
var definePropertyModule$4 = objectDefineProperty;
var createPropertyDescriptor$5 = createPropertyDescriptor;

var createProperty = function (object, key, value) {
  var propertyKey = toPrimitive$4(key);
  if (propertyKey in object) definePropertyModule$4.f(object, propertyKey, createPropertyDescriptor$5(0, value));
  else object[propertyKey] = value;
};

var bind$2 = functionBindContext;
var toObject$4 = toObject;
var callWithSafeIterationClosing$1 = callWithSafeIterationClosing;
var isArrayIteratorMethod$2 = isArrayIteratorMethod;
var toLength$4 = toLength;
var createProperty$1 = createProperty;
var getIteratorMethod$2 = getIteratorMethod;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject$4(arrayLike);
  var C = typeof this == 'function' ? this : Array;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod$2(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  if (mapping) mapfn = bind$2(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod$2(iteratorMethod))) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    result = new C();
    for (;!(step = next.call(iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing$1(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty$1(result, index, value);
    }
  } else {
    length = toLength$4(O.length);
    result = new C(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty$1(result, index, value);
    }
  }
  result.length = index;
  return result;
};

var wellKnownSymbol$9 = wellKnownSymbol;

var ITERATOR$2 = wellKnownSymbol$9('iterator');
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
  iteratorWithReturn[ITERATOR$2] = function () {
    return this;
  };
  // eslint-disable-next-line no-throw-literal
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$2] = function () {
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

var $$3 = _export;
var from = arrayFrom;
var checkCorrectnessOfIteration$1 = checkCorrectnessOfIteration;

var INCORRECT_ITERATION = !checkCorrectnessOfIteration$1(function (iterable) {
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
$$3({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from
});

var $$4 = _export;
var isArray$3 = isArray;

// `Array.isArray` method
// https://tc39.es/ecma262/#sec-array.isarray
$$4({ target: 'Array', stat: true }, {
  isArray: isArray$3
});

var $$5 = _export;
var fails$8 = fails;
var createProperty$2 = createProperty;

var ISNT_GENERIC = fails$8(function () {
  function F() { /* empty */ }
  return !(Array.of.call(F) instanceof F);
});

// `Array.of` method
// https://tc39.es/ecma262/#sec-array.of
// WebKit Array.of isn't generic
$$5({ target: 'Array', stat: true, forced: ISNT_GENERIC }, {
  of: function of(/* ...args */) {
    var index = 0;
    var argumentsLength = arguments.length;
    var result = new (typeof this == 'function' ? this : Array)(argumentsLength);
    while (argumentsLength > index) createProperty$2(result, index, arguments[index++]);
    result.length = argumentsLength;
    return result;
  }
});

var getBuiltIn$4 = getBuiltIn;

var engineUserAgent = getBuiltIn$4('navigator', 'userAgent') || '';

var global$e = global$1;
var userAgent = engineUserAgent;

var process = global$e.process;
var versions = process && process.versions;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] + match[1];
} else if (userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

var engineV8Version = version && +version;

var fails$9 = fails;
var wellKnownSymbol$a = wellKnownSymbol;
var V8_VERSION = engineV8Version;

var SPECIES$1 = wellKnownSymbol$a('species');

var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION >= 51 || !fails$9(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$1] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var $$6 = _export;
var fails$a = fails;
var isArray$4 = isArray;
var isObject$9 = isObject;
var toObject$5 = toObject;
var toLength$5 = toLength;
var createProperty$3 = createProperty;
var arraySpeciesCreate$2 = arraySpeciesCreate;
var arrayMethodHasSpeciesSupport$1 = arrayMethodHasSpeciesSupport;
var wellKnownSymbol$b = wellKnownSymbol;
var V8_VERSION$1 = engineV8Version;

var IS_CONCAT_SPREADABLE = wellKnownSymbol$b('isConcatSpreadable');
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION$1 >= 51 || !fails$a(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport$1('concat');

var isConcatSpreadable = function (O) {
  if (!isObject$9(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray$4(O);
};

var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$$6({ target: 'Array', proto: true, forced: FORCED }, {
  concat: function concat(arg) { // eslint-disable-line no-unused-vars
    var O = toObject$5(this);
    var A = arraySpeciesCreate$2(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = toLength$5(E.length);
        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty$3(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty$3(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var toObject$6 = toObject;
var toAbsoluteIndex$2 = toAbsoluteIndex;
var toLength$6 = toLength;

var min$2 = Math.min;

// `Array.prototype.copyWithin` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject$6(this);
  var len = toLength$6(O.length);
  var to = toAbsoluteIndex$2(target, len);
  var from = toAbsoluteIndex$2(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = min$2((end === undefined ? len : toAbsoluteIndex$2(end, len)) - from, len - to);
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

var wellKnownSymbol$c = wellKnownSymbol;
var create$1 = objectCreate;
var definePropertyModule$5 = objectDefineProperty;

var UNSCOPABLES = wellKnownSymbol$c('unscopables');
var ArrayPrototype$1 = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
  definePropertyModule$5.f(ArrayPrototype$1, UNSCOPABLES, {
    configurable: true,
    value: create$1(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables = function (key) {
  ArrayPrototype$1[UNSCOPABLES][key] = true;
};

var $$7 = _export;
var copyWithin = arrayCopyWithin;
var addToUnscopables$1 = addToUnscopables;

// `Array.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
$$7({ target: 'Array', proto: true }, {
  copyWithin: copyWithin
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$1('copyWithin');

var fails$b = fails;

var arrayMethodIsStrict = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails$b(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () { throw 1; }, 1);
  });
};

var DESCRIPTORS$7 = descriptors;
var fails$c = fails;
var has$c = has;

var defineProperty$3 = Object.defineProperty;
var cache = {};

var thrower = function (it) { throw it; };

var arrayMethodUsesToLength = function (METHOD_NAME, options) {
  if (has$c(cache, METHOD_NAME)) return cache[METHOD_NAME];
  if (!options) options = {};
  var method = [][METHOD_NAME];
  var ACCESSORS = has$c(options, 'ACCESSORS') ? options.ACCESSORS : false;
  var argument0 = has$c(options, 0) ? options[0] : thrower;
  var argument1 = has$c(options, 1) ? options[1] : undefined;

  return cache[METHOD_NAME] = !!method && !fails$c(function () {
    if (ACCESSORS && !DESCRIPTORS$7) return true;
    var O = { length: -1 };

    if (ACCESSORS) defineProperty$3(O, 1, { enumerable: true, get: thrower });
    else O[1] = 1;

    method.call(O, argument0, argument1);
  });
};

var $$8 = _export;
var $every = arrayIteration.every;
var arrayMethodIsStrict$1 = arrayMethodIsStrict;
var arrayMethodUsesToLength$1 = arrayMethodUsesToLength;

var STRICT_METHOD = arrayMethodIsStrict$1('every');
var USES_TO_LENGTH = arrayMethodUsesToLength$1('every');

// `Array.prototype.every` method
// https://tc39.es/ecma262/#sec-array.prototype.every
$$8({ target: 'Array', proto: true, forced: !STRICT_METHOD || !USES_TO_LENGTH }, {
  every: function every(callbackfn /* , thisArg */) {
    return $every(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var toObject$7 = toObject;
var toAbsoluteIndex$3 = toAbsoluteIndex;
var toLength$7 = toLength;

// `Array.prototype.fill` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.fill
var arrayFill = function fill(value /* , start = 0, end = @length */) {
  var O = toObject$7(this);
  var length = toLength$7(O.length);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex$3(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex$3(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

var $$9 = _export;
var fill = arrayFill;
var addToUnscopables$2 = addToUnscopables;

// `Array.prototype.fill` method
// https://tc39.es/ecma262/#sec-array.prototype.fill
$$9({ target: 'Array', proto: true }, {
  fill: fill
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$2('fill');

var $$a = _export;
var $filter = arrayIteration.filter;
var arrayMethodHasSpeciesSupport$2 = arrayMethodHasSpeciesSupport;
var arrayMethodUsesToLength$2 = arrayMethodUsesToLength;

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport$2('filter');
// Edge 14- issue
var USES_TO_LENGTH$1 = arrayMethodUsesToLength$2('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$$a({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$1 }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$b = _export;
var $find = arrayIteration.find;
var addToUnscopables$3 = addToUnscopables;
var arrayMethodUsesToLength$3 = arrayMethodUsesToLength;

var FIND = 'find';
var SKIPS_HOLES = true;

var USES_TO_LENGTH$2 = arrayMethodUsesToLength$3(FIND);

// Shouldn't skip holes
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

// `Array.prototype.find` method
// https://tc39.es/ecma262/#sec-array.prototype.find
$$b({ target: 'Array', proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH$2 }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$3(FIND);

var $$c = _export;
var $findIndex = arrayIteration.findIndex;
var addToUnscopables$4 = addToUnscopables;
var arrayMethodUsesToLength$4 = arrayMethodUsesToLength;

var FIND_INDEX = 'findIndex';
var SKIPS_HOLES$1 = true;

var USES_TO_LENGTH$3 = arrayMethodUsesToLength$4(FIND_INDEX);

// Shouldn't skip holes
if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES$1 = false; });

// `Array.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findindex
$$c({ target: 'Array', proto: true, forced: SKIPS_HOLES$1 || !USES_TO_LENGTH$3 }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$4(FIND_INDEX);

var isArray$5 = isArray;
var toLength$8 = toLength;
var bind$3 = functionBindContext;

// `FlattenIntoArray` abstract operation
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var flattenIntoArray = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? bind$3(mapper, thisArg, 3) : false;
  var element;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

      if (depth > 0 && isArray$5(element)) {
        targetIndex = flattenIntoArray(target, original, element, toLength$8(element.length), targetIndex, depth - 1) - 1;
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

var flattenIntoArray_1 = flattenIntoArray;

var $$d = _export;
var flattenIntoArray$1 = flattenIntoArray_1;
var toObject$8 = toObject;
var toLength$9 = toLength;
var toInteger$3 = toInteger;
var arraySpeciesCreate$3 = arraySpeciesCreate;

// `Array.prototype.flat` method
// https://tc39.es/ecma262/#sec-array.prototype.flat
$$d({ target: 'Array', proto: true }, {
  flat: function flat(/* depthArg = 1 */) {
    var depthArg = arguments.length ? arguments[0] : undefined;
    var O = toObject$8(this);
    var sourceLen = toLength$9(O.length);
    var A = arraySpeciesCreate$3(O, 0);
    A.length = flattenIntoArray$1(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toInteger$3(depthArg));
    return A;
  }
});

var $$e = _export;
var flattenIntoArray$2 = flattenIntoArray_1;
var toObject$9 = toObject;
var toLength$a = toLength;
var aFunction$3 = aFunction$1;
var arraySpeciesCreate$4 = arraySpeciesCreate;

// `Array.prototype.flatMap` method
// https://tc39.es/ecma262/#sec-array.prototype.flatmap
$$e({ target: 'Array', proto: true }, {
  flatMap: function flatMap(callbackfn /* , thisArg */) {
    var O = toObject$9(this);
    var sourceLen = toLength$a(O.length);
    var A;
    aFunction$3(callbackfn);
    A = arraySpeciesCreate$4(O, 0);
    A.length = flattenIntoArray$2(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return A;
  }
});

var $forEach$1 = arrayIteration.forEach;
var arrayMethodIsStrict$2 = arrayMethodIsStrict;
var arrayMethodUsesToLength$5 = arrayMethodUsesToLength;

var STRICT_METHOD$1 = arrayMethodIsStrict$2('forEach');
var USES_TO_LENGTH$4 = arrayMethodUsesToLength$5('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = (!STRICT_METHOD$1 || !USES_TO_LENGTH$4) ? function forEach(callbackfn /* , thisArg */) {
  return $forEach$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
} : [].forEach;

var $$f = _export;
var forEach = arrayForEach;

// `Array.prototype.forEach` method
// https://tc39.es/ecma262/#sec-array.prototype.foreach
$$f({ target: 'Array', proto: true, forced: [].forEach != forEach }, {
  forEach: forEach
});

var $$g = _export;
var $includes = arrayIncludes.includes;
var addToUnscopables$5 = addToUnscopables;
var arrayMethodUsesToLength$6 = arrayMethodUsesToLength;

var USES_TO_LENGTH$5 = arrayMethodUsesToLength$6('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$$g({ target: 'Array', proto: true, forced: !USES_TO_LENGTH$5 }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$5('includes');

var $$h = _export;
var $indexOf = arrayIncludes.indexOf;
var arrayMethodIsStrict$3 = arrayMethodIsStrict;
var arrayMethodUsesToLength$7 = arrayMethodUsesToLength;

var nativeIndexOf = [].indexOf;

var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
var STRICT_METHOD$2 = arrayMethodIsStrict$3('indexOf');
var USES_TO_LENGTH$6 = arrayMethodUsesToLength$7('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
$$h({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD$2 || !USES_TO_LENGTH$6 }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? nativeIndexOf.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$i = _export;
var IndexedObject$2 = indexedObject;
var toIndexedObject$6 = toIndexedObject;
var arrayMethodIsStrict$4 = arrayMethodIsStrict;

var nativeJoin = [].join;

var ES3_STRINGS = IndexedObject$2 != Object;
var STRICT_METHOD$3 = arrayMethodIsStrict$4('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
$$i({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$3 }, {
  join: function join(separator) {
    return nativeJoin.call(toIndexedObject$6(this), separator === undefined ? ',' : separator);
  }
});

var toIndexedObject$7 = toIndexedObject;
var toInteger$4 = toInteger;
var toLength$b = toLength;
var arrayMethodIsStrict$5 = arrayMethodIsStrict;
var arrayMethodUsesToLength$8 = arrayMethodUsesToLength;

var min$3 = Math.min;
var nativeLastIndexOf = [].lastIndexOf;
var NEGATIVE_ZERO$1 = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
var STRICT_METHOD$4 = arrayMethodIsStrict$5('lastIndexOf');
// For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method
var USES_TO_LENGTH$7 = arrayMethodUsesToLength$8('indexOf', { ACCESSORS: true, 1: 0 });
var FORCED$1 = NEGATIVE_ZERO$1 || !STRICT_METHOD$4 || !USES_TO_LENGTH$7;

// `Array.prototype.lastIndexOf` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
var arrayLastIndexOf = FORCED$1 ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
  // convert -0 to +0
  if (NEGATIVE_ZERO$1) return nativeLastIndexOf.apply(this, arguments) || 0;
  var O = toIndexedObject$7(this);
  var length = toLength$b(O.length);
  var index = length - 1;
  if (arguments.length > 1) index = min$3(index, toInteger$4(arguments[1]));
  if (index < 0) index = length + index;
  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
  return -1;
} : nativeLastIndexOf;

var $$j = _export;
var lastIndexOf = arrayLastIndexOf;

// `Array.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
$$j({ target: 'Array', proto: true, forced: lastIndexOf !== [].lastIndexOf }, {
  lastIndexOf: lastIndexOf
});

var $$k = _export;
var $map = arrayIteration.map;
var arrayMethodHasSpeciesSupport$3 = arrayMethodHasSpeciesSupport;
var arrayMethodUsesToLength$9 = arrayMethodUsesToLength;

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport$3('map');
// FF49- issue
var USES_TO_LENGTH$8 = arrayMethodUsesToLength$9('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
$$k({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$8 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var aFunction$4 = aFunction$1;
var toObject$a = toObject;
var IndexedObject$3 = indexedObject;
var toLength$c = toLength;

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod$2 = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    aFunction$4(callbackfn);
    var O = toObject$a(that);
    var self = IndexedObject$3(O);
    var length = toLength$c(O.length);
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
  left: createMethod$2(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod$2(true)
};

var classof$4 = classofRaw;
var global$f = global$1;

var engineIsNode = classof$4(global$f.process) == 'process';

var $$l = _export;
var $reduce = arrayReduce.left;
var arrayMethodIsStrict$6 = arrayMethodIsStrict;
var arrayMethodUsesToLength$a = arrayMethodUsesToLength;
var CHROME_VERSION = engineV8Version;
var IS_NODE = engineIsNode;

var STRICT_METHOD$5 = arrayMethodIsStrict$6('reduce');
var USES_TO_LENGTH$9 = arrayMethodUsesToLength$a('reduce', { 1: 0 });
// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !IS_NODE && CHROME_VERSION > 79 && CHROME_VERSION < 83;

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
$$l({ target: 'Array', proto: true, forced: !STRICT_METHOD$5 || !USES_TO_LENGTH$9 || CHROME_BUG }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$m = _export;
var $reduceRight = arrayReduce.right;
var arrayMethodIsStrict$7 = arrayMethodIsStrict;
var arrayMethodUsesToLength$b = arrayMethodUsesToLength;
var CHROME_VERSION$1 = engineV8Version;
var IS_NODE$1 = engineIsNode;

var STRICT_METHOD$6 = arrayMethodIsStrict$7('reduceRight');
// For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method
var USES_TO_LENGTH$a = arrayMethodUsesToLength$b('reduce', { 1: 0 });
// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG$1 = !IS_NODE$1 && CHROME_VERSION$1 > 79 && CHROME_VERSION$1 < 83;

// `Array.prototype.reduceRight` method
// https://tc39.es/ecma262/#sec-array.prototype.reduceright
$$m({ target: 'Array', proto: true, forced: !STRICT_METHOD$6 || !USES_TO_LENGTH$a || CHROME_BUG$1 }, {
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return $reduceRight(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$n = _export;
var isArray$6 = isArray;

var nativeReverse = [].reverse;
var test$1 = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.es/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
$$n({ target: 'Array', proto: true, forced: String(test$1) === String(test$1.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign
    if (isArray$6(this)) this.length = this.length;
    return nativeReverse.call(this);
  }
});

var $$o = _export;
var isObject$a = isObject;
var isArray$7 = isArray;
var toAbsoluteIndex$4 = toAbsoluteIndex;
var toLength$d = toLength;
var toIndexedObject$8 = toIndexedObject;
var createProperty$4 = createProperty;
var wellKnownSymbol$d = wellKnownSymbol;
var arrayMethodHasSpeciesSupport$4 = arrayMethodHasSpeciesSupport;
var arrayMethodUsesToLength$c = arrayMethodUsesToLength;

var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport$4('slice');
var USES_TO_LENGTH$b = arrayMethodUsesToLength$c('slice', { ACCESSORS: true, 0: 0, 1: 2 });

var SPECIES$2 = wellKnownSymbol$d('species');
var nativeSlice = [].slice;
var max$1 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$$o({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 || !USES_TO_LENGTH$b }, {
  slice: function slice(start, end) {
    var O = toIndexedObject$8(this);
    var length = toLength$d(O.length);
    var k = toAbsoluteIndex$4(start, length);
    var fin = toAbsoluteIndex$4(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray$7(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (typeof Constructor == 'function' && (Constructor === Array || isArray$7(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject$a(Constructor)) {
        Constructor = Constructor[SPECIES$2];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array || Constructor === undefined) {
        return nativeSlice.call(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty$4(result, n, O[k]);
    result.length = n;
    return result;
  }
});

var $$p = _export;
var $some = arrayIteration.some;
var arrayMethodIsStrict$8 = arrayMethodIsStrict;
var arrayMethodUsesToLength$d = arrayMethodUsesToLength;

var STRICT_METHOD$7 = arrayMethodIsStrict$8('some');
var USES_TO_LENGTH$c = arrayMethodUsesToLength$d('some');

// `Array.prototype.some` method
// https://tc39.es/ecma262/#sec-array.prototype.some
$$p({ target: 'Array', proto: true, forced: !STRICT_METHOD$7 || !USES_TO_LENGTH$c }, {
  some: function some(callbackfn /* , thisArg */) {
    return $some(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$q = _export;
var aFunction$5 = aFunction$1;
var toObject$b = toObject;
var fails$d = fails;
var arrayMethodIsStrict$9 = arrayMethodIsStrict;

var test$2 = [];
var nativeSort = test$2.sort;

// IE8-
var FAILS_ON_UNDEFINED = fails$d(function () {
  test$2.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails$d(function () {
  test$2.sort(null);
});
// Old WebKit
var STRICT_METHOD$8 = arrayMethodIsStrict$9('sort');

var FORCED$2 = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD$8;

// `Array.prototype.sort` method
// https://tc39.es/ecma262/#sec-array.prototype.sort
$$q({ target: 'Array', proto: true, forced: FORCED$2 }, {
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? nativeSort.call(toObject$b(this))
      : nativeSort.call(toObject$b(this), aFunction$5(comparefn));
  }
});

var $$r = _export;
var toAbsoluteIndex$5 = toAbsoluteIndex;
var toInteger$5 = toInteger;
var toLength$e = toLength;
var toObject$c = toObject;
var arraySpeciesCreate$5 = arraySpeciesCreate;
var createProperty$5 = createProperty;
var arrayMethodHasSpeciesSupport$5 = arrayMethodHasSpeciesSupport;
var arrayMethodUsesToLength$e = arrayMethodUsesToLength;

var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport$5('splice');
var USES_TO_LENGTH$d = arrayMethodUsesToLength$e('splice', { ACCESSORS: true, 0: 0, 1: 2 });

var max$2 = Math.max;
var min$4 = Math.min;
var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
// with adding support of @@species
$$r({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 || !USES_TO_LENGTH$d }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject$c(this);
    var len = toLength$e(O.length);
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
      actualDeleteCount = min$4(max$2(toInteger$5(deleteCount), 0), len - actualStart);
    }
    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER$1) {
      throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
    }
    A = arraySpeciesCreate$5(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty$5(A, k, O[from]);
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

var getBuiltIn$5 = getBuiltIn;
var definePropertyModule$6 = objectDefineProperty;
var wellKnownSymbol$e = wellKnownSymbol;
var DESCRIPTORS$8 = descriptors;

var SPECIES$3 = wellKnownSymbol$e('species');

var setSpecies = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn$5(CONSTRUCTOR_NAME);
  var defineProperty = definePropertyModule$6.f;

  if (DESCRIPTORS$8 && Constructor && !Constructor[SPECIES$3]) {
    defineProperty(Constructor, SPECIES$3, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var setSpecies$1 = setSpecies;

// `Array[@@species]` getter
// https://tc39.es/ecma262/#sec-get-array-@@species
setSpecies$1('Array');

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$6 = addToUnscopables;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$6('flat');

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$7 = addToUnscopables;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$7('flatMap');

var fails$e = fails;
var getPrototypeOf$1 = objectGetPrototypeOf;
var createNonEnumerableProperty$7 = createNonEnumerableProperty;
var has$d = has;
var wellKnownSymbol$f = wellKnownSymbol;

var ITERATOR$3 = wellKnownSymbol$f('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf$1(getPrototypeOf$1(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = IteratorPrototype == undefined || fails$e(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype[ITERATOR$3].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!has$d(IteratorPrototype, ITERATOR$3)) {
  createNonEnumerableProperty$7(IteratorPrototype, ITERATOR$3, returnThis);
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};

var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
var create$2 = objectCreate;
var createPropertyDescriptor$6 = createPropertyDescriptor;
var setToStringTag$2 = setToStringTag;
var Iterators$2 = iterators;

var returnThis$1 = function () { return this; };

var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create$2(IteratorPrototype$1, { next: createPropertyDescriptor$6(1, next) });
  setToStringTag$2(IteratorConstructor, TO_STRING_TAG, false);
  Iterators$2[TO_STRING_TAG] = returnThis$1;
  return IteratorConstructor;
};

var $$s = _export;
var createIteratorConstructor$1 = createIteratorConstructor;
var getPrototypeOf$2 = objectGetPrototypeOf;
var setPrototypeOf$1 = objectSetPrototypeOf;
var setToStringTag$3 = setToStringTag;
var createNonEnumerableProperty$8 = createNonEnumerableProperty;
var redefine$3 = redefine.exports;
var wellKnownSymbol$g = wellKnownSymbol;
var Iterators$3 = iterators;
var IteratorsCore = iteratorsCore;

var IteratorPrototype$2 = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS$1 = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$4 = wellKnownSymbol$g('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis$2 = function () { return this; };

var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor$1(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$4]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf$2(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
      if (getPrototypeOf$2(CurrentIteratorPrototype) !== IteratorPrototype$2) {
        if (setPrototypeOf$1) {
          setPrototypeOf$1(CurrentIteratorPrototype, IteratorPrototype$2);
        } else if (typeof CurrentIteratorPrototype[ITERATOR$4] != 'function') {
          createNonEnumerableProperty$8(CurrentIteratorPrototype, ITERATOR$4, returnThis$2);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag$3(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if (IterablePrototype[ITERATOR$4] !== defaultIterator) {
    createNonEnumerableProperty$8(IterablePrototype, ITERATOR$4, defaultIterator);
  }
  Iterators$3[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine$3(IterablePrototype, KEY, methods[KEY]);
      }
    } else $$s({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};

var toIndexedObject$9 = toIndexedObject;
var addToUnscopables$8 = addToUnscopables;
var Iterators$4 = iterators;
var InternalStateModule$2 = internalState;
var defineIterator$1 = defineIterator;

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$1 = InternalStateModule$2.set;
var getInternalState$2 = InternalStateModule$2.getterFor(ARRAY_ITERATOR);

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
var es_array_iterator = defineIterator$1(Array, 'Array', function (iterated, kind) {
  setInternalState$1(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject$9(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$2(this);
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
Iterators$4.Arguments = Iterators$4.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$8('keys');
addToUnscopables$8('values');
addToUnscopables$8('entries');

var aFunction$6 = aFunction$1;
var isObject$b = isObject;

var slice = [].slice;
var factories = {};

var construct = function (C, argsLength, args) {
  if (!(argsLength in factories)) {
    for (var list = [], i = 0; i < argsLength; i++) list[i] = 'a[' + i + ']';
    // eslint-disable-next-line no-new-func
    factories[argsLength] = Function('C,a', 'return new C(' + list.join(',') + ')');
  } return factories[argsLength](C, args);
};

// `Function.prototype.bind` method implementation
// https://tc39.es/ecma262/#sec-function.prototype.bind
var functionBind = Function.bind || function bind(that /* , ...args */) {
  var fn = aFunction$6(this);
  var partArgs = slice.call(arguments, 1);
  var boundFunction = function bound(/* args... */) {
    var args = partArgs.concat(slice.call(arguments));
    return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
  };
  if (isObject$b(fn.prototype)) boundFunction.prototype = fn.prototype;
  return boundFunction;
};

var $$t = _export;
var bind$4 = functionBind;

// `Function.prototype.bind` method
// https://tc39.es/ecma262/#sec-function.prototype.bind
$$t({ target: 'Function', proto: true }, {
  bind: bind$4
});

var DESCRIPTORS$9 = descriptors;
var defineProperty$4 = objectDefineProperty.f;

var FunctionPrototype = Function.prototype;
var FunctionPrototypeToString = FunctionPrototype.toString;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (DESCRIPTORS$9 && !(NAME in FunctionPrototype)) {
  defineProperty$4(FunctionPrototype, NAME, {
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

var isObject$c = isObject;
var definePropertyModule$7 = objectDefineProperty;
var getPrototypeOf$3 = objectGetPrototypeOf;
var wellKnownSymbol$h = wellKnownSymbol;

var HAS_INSTANCE = wellKnownSymbol$h('hasInstance');
var FunctionPrototype$1 = Function.prototype;

// `Function.prototype[@@hasInstance]` method
// https://tc39.es/ecma262/#sec-function.prototype-@@hasinstance
if (!(HAS_INSTANCE in FunctionPrototype$1)) {
  definePropertyModule$7.f(FunctionPrototype$1, HAS_INSTANCE, { value: function (O) {
    if (typeof this != 'function' || !isObject$c(O)) return false;
    if (!isObject$c(this.prototype)) return O instanceof this;
    // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
    while (O = getPrototypeOf$3(O)) if (this.prototype === O) return true;
    return false;
  } });
}

var $$u = _export;
var global$g = global$1;

// `globalThis` object
// https://tc39.es/ecma262/#sec-globalthis
$$u({ global: true }, {
  globalThis: global$g
});

var DESCRIPTORS$a = descriptors;
var fails$f = fails;
var objectKeys$3 = objectKeys;
var getOwnPropertySymbolsModule$2 = objectGetOwnPropertySymbols;
var propertyIsEnumerableModule$2 = objectPropertyIsEnumerable;
var toObject$d = toObject;
var IndexedObject$4 = indexedObject;

var nativeAssign = Object.assign;
var defineProperty$5 = Object.defineProperty;

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
var objectAssign = !nativeAssign || fails$f(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS$a && nativeAssign({ b: 1 }, nativeAssign(defineProperty$5({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty$5(this, 'b', {
        value: 3,
        enumerable: false
      });
    }
  }), { b: 2 })).b !== 1) return true;
  // should work with symbols and should have deterministic property order (V8 bug)
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var symbol = Symbol();
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return nativeAssign({}, A)[symbol] != 7 || objectKeys$3(nativeAssign({}, B)).join('') != alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject$d(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule$2.f;
  var propertyIsEnumerable = propertyIsEnumerableModule$2.f;
  while (argumentsLength > index) {
    var S = IndexedObject$4(arguments[index++]);
    var keys = getOwnPropertySymbols ? objectKeys$3(S).concat(getOwnPropertySymbols(S)) : objectKeys$3(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS$a || propertyIsEnumerable.call(S, key)) T[key] = S[key];
    }
  } return T;
} : nativeAssign;

var $$v = _export;
var assign = objectAssign;

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
$$v({ target: 'Object', stat: true, forced: Object.assign !== assign }, {
  assign: assign
});

var $$w = _export;
var DESCRIPTORS$b = descriptors;
var create$3 = objectCreate;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
$$w({ target: 'Object', stat: true, sham: !DESCRIPTORS$b }, {
  create: create$3
});

var $$x = _export;
var DESCRIPTORS$c = descriptors;
var objectDefinePropertyModile = objectDefineProperty;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
$$x({ target: 'Object', stat: true, forced: !DESCRIPTORS$c, sham: !DESCRIPTORS$c }, {
  defineProperty: objectDefinePropertyModile.f
});

var $$y = _export;
var DESCRIPTORS$d = descriptors;
var defineProperties$1 = objectDefineProperties;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
$$y({ target: 'Object', stat: true, forced: !DESCRIPTORS$d, sham: !DESCRIPTORS$d }, {
  defineProperties: defineProperties$1
});

var DESCRIPTORS$e = descriptors;
var objectKeys$4 = objectKeys;
var toIndexedObject$a = toIndexedObject;
var propertyIsEnumerable = objectPropertyIsEnumerable.f;

// `Object.{ entries, values }` methods implementation
var createMethod$3 = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject$a(it);
    var keys = objectKeys$4(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS$e || propertyIsEnumerable.call(O, key)) {
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

var $$z = _export;
var $entries = objectToArray.entries;

// `Object.entries` method
// https://tc39.es/ecma262/#sec-object.entries
$$z({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return $entries(O);
  }
});

var fails$g = fails;

var freezing = !fails$g(function () {
  return Object.isExtensible(Object.preventExtensions({}));
});

var internalMetadata = {exports: {}};

var hiddenKeys$6 = hiddenKeys;
var isObject$d = isObject;
var has$e = has;
var defineProperty$6 = objectDefineProperty.f;
var uid$4 = uid;
var FREEZING = freezing;

var METADATA = uid$4('meta');
var id$1 = 0;

var isExtensible = Object.isExtensible || function () {
  return true;
};

var setMetadata = function (it) {
  defineProperty$6(it, METADATA, { value: {
    objectID: 'O' + ++id$1, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey = function (it, create) {
  // return a primitive with prefix
  if (!isObject$d(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has$e(it, METADATA)) {
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
  if (!has$e(it, METADATA)) {
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
  if (FREEZING && meta.REQUIRED && isExtensible(it) && !has$e(it, METADATA)) setMetadata(it);
  return it;
};

var meta = internalMetadata.exports = {
  REQUIRED: false,
  fastKey: fastKey,
  getWeakData: getWeakData,
  onFreeze: onFreeze
};

hiddenKeys$6[METADATA] = true;

var $$A = _export;
var FREEZING$1 = freezing;
var fails$h = fails;
var isObject$e = isObject;
var onFreeze$1 = internalMetadata.exports.onFreeze;

var nativeFreeze = Object.freeze;
var FAILS_ON_PRIMITIVES = fails$h(function () { nativeFreeze(1); });

// `Object.freeze` method
// https://tc39.es/ecma262/#sec-object.freeze
$$A({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING$1 }, {
  freeze: function freeze(it) {
    return nativeFreeze && isObject$e(it) ? nativeFreeze(onFreeze$1(it)) : it;
  }
});

var $$B = _export;
var iterate$2 = iterate;
var createProperty$6 = createProperty;

// `Object.fromEntries` method
// https://github.com/tc39/proposal-object-from-entries
$$B({ target: 'Object', stat: true }, {
  fromEntries: function fromEntries(iterable) {
    var obj = {};
    iterate$2(iterable, function (k, v) {
      createProperty$6(obj, k, v);
    }, { AS_ENTRIES: true });
    return obj;
  }
});

var $$C = _export;
var fails$i = fails;
var toIndexedObject$b = toIndexedObject;
var nativeGetOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
var DESCRIPTORS$f = descriptors;

var FAILS_ON_PRIMITIVES$1 = fails$i(function () { nativeGetOwnPropertyDescriptor$2(1); });
var FORCED$3 = !DESCRIPTORS$f || FAILS_ON_PRIMITIVES$1;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
$$C({ target: 'Object', stat: true, forced: FORCED$3, sham: !DESCRIPTORS$f }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor$2(toIndexedObject$b(it), key);
  }
});

var $$D = _export;
var DESCRIPTORS$g = descriptors;
var ownKeys$2 = ownKeys;
var toIndexedObject$c = toIndexedObject;
var getOwnPropertyDescriptorModule$2 = objectGetOwnPropertyDescriptor;
var createProperty$7 = createProperty;

// `Object.getOwnPropertyDescriptors` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
$$D({ target: 'Object', stat: true, sham: !DESCRIPTORS$g }, {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIndexedObject$c(object);
    var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$2.f;
    var keys = ownKeys$2(O);
    var result = {};
    var index = 0;
    var key, descriptor;
    while (keys.length > index) {
      descriptor = getOwnPropertyDescriptor(O, key = keys[index++]);
      if (descriptor !== undefined) createProperty$7(result, key, descriptor);
    }
    return result;
  }
});

var $$E = _export;
var fails$j = fails;
var nativeGetOwnPropertyNames$2 = objectGetOwnPropertyNamesExternal.f;

var FAILS_ON_PRIMITIVES$2 = fails$j(function () { return !Object.getOwnPropertyNames(1); });

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
$$E({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2 }, {
  getOwnPropertyNames: nativeGetOwnPropertyNames$2
});

var $$F = _export;
var fails$k = fails;
var toObject$e = toObject;
var nativeGetPrototypeOf = objectGetPrototypeOf;
var CORRECT_PROTOTYPE_GETTER$1 = correctPrototypeGetter;

var FAILS_ON_PRIMITIVES$3 = fails$k(function () { nativeGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
$$F({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$3, sham: !CORRECT_PROTOTYPE_GETTER$1 }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject$e(it));
  }
});

// `SameValue` abstract operation
// https://tc39.es/ecma262/#sec-samevalue
var sameValue = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

var $$G = _export;
var is = sameValue;

// `Object.is` method
// https://tc39.es/ecma262/#sec-object.is
$$G({ target: 'Object', stat: true }, {
  is: is
});

var $$H = _export;
var fails$l = fails;
var isObject$f = isObject;

var nativeIsExtensible = Object.isExtensible;
var FAILS_ON_PRIMITIVES$4 = fails$l(function () { nativeIsExtensible(1); });

// `Object.isExtensible` method
// https://tc39.es/ecma262/#sec-object.isextensible
$$H({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$4 }, {
  isExtensible: function isExtensible(it) {
    return isObject$f(it) ? nativeIsExtensible ? nativeIsExtensible(it) : true : false;
  }
});

var $$I = _export;
var fails$m = fails;
var isObject$g = isObject;

var nativeIsFrozen = Object.isFrozen;
var FAILS_ON_PRIMITIVES$5 = fails$m(function () { nativeIsFrozen(1); });

// `Object.isFrozen` method
// https://tc39.es/ecma262/#sec-object.isfrozen
$$I({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$5 }, {
  isFrozen: function isFrozen(it) {
    return isObject$g(it) ? nativeIsFrozen ? nativeIsFrozen(it) : false : true;
  }
});

var $$J = _export;
var fails$n = fails;
var isObject$h = isObject;

var nativeIsSealed = Object.isSealed;
var FAILS_ON_PRIMITIVES$6 = fails$n(function () { nativeIsSealed(1); });

// `Object.isSealed` method
// https://tc39.es/ecma262/#sec-object.issealed
$$J({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$6 }, {
  isSealed: function isSealed(it) {
    return isObject$h(it) ? nativeIsSealed ? nativeIsSealed(it) : false : true;
  }
});

var $$K = _export;
var toObject$f = toObject;
var nativeKeys = objectKeys;
var fails$o = fails;

var FAILS_ON_PRIMITIVES$7 = fails$o(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
$$K({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$7 }, {
  keys: function keys(it) {
    return nativeKeys(toObject$f(it));
  }
});

var $$L = _export;
var isObject$i = isObject;
var onFreeze$2 = internalMetadata.exports.onFreeze;
var FREEZING$2 = freezing;
var fails$p = fails;

var nativePreventExtensions = Object.preventExtensions;
var FAILS_ON_PRIMITIVES$8 = fails$p(function () { nativePreventExtensions(1); });

// `Object.preventExtensions` method
// https://tc39.es/ecma262/#sec-object.preventextensions
$$L({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$8, sham: !FREEZING$2 }, {
  preventExtensions: function preventExtensions(it) {
    return nativePreventExtensions && isObject$i(it) ? nativePreventExtensions(onFreeze$2(it)) : it;
  }
});

var $$M = _export;
var isObject$j = isObject;
var onFreeze$3 = internalMetadata.exports.onFreeze;
var FREEZING$3 = freezing;
var fails$q = fails;

var nativeSeal = Object.seal;
var FAILS_ON_PRIMITIVES$9 = fails$q(function () { nativeSeal(1); });

// `Object.seal` method
// https://tc39.es/ecma262/#sec-object.seal
$$M({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$9, sham: !FREEZING$3 }, {
  seal: function seal(it) {
    return nativeSeal && isObject$j(it) ? nativeSeal(onFreeze$3(it)) : it;
  }
});

var $$N = _export;
var setPrototypeOf$2 = objectSetPrototypeOf;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
$$N({ target: 'Object', stat: true }, {
  setPrototypeOf: setPrototypeOf$2
});

var $$O = _export;
var $values = objectToArray.values;

// `Object.values` method
// https://tc39.es/ecma262/#sec-object.values
$$O({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});

var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
var classof$5 = classof$2;

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
  return '[object ' + classof$5(this) + ']';
};

var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
var redefine$4 = redefine.exports;
var toString$2 = objectToString;

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT$2) {
  redefine$4(Object.prototype, 'toString', toString$2, { unsafe: true });
}

var global$h = global$1;
var fails$r = fails;

// Forced replacement object prototype accessors methods
var objectPrototypeAccessorsForced = !fails$r(function () {
  var key = Math.random();
  // In FF throws only define methods
  // eslint-disable-next-line no-undef, no-useless-call
  __defineSetter__.call(null, key, function () { /* empty */ });
  delete global$h[key];
});

var $$P = _export;
var DESCRIPTORS$h = descriptors;
var FORCED$4 = objectPrototypeAccessorsForced;
var toObject$g = toObject;
var aFunction$7 = aFunction$1;
var definePropertyModule$8 = objectDefineProperty;

// `Object.prototype.__defineGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineGetter__
if (DESCRIPTORS$h) {
  $$P({ target: 'Object', proto: true, forced: FORCED$4 }, {
    __defineGetter__: function __defineGetter__(P, getter) {
      definePropertyModule$8.f(toObject$g(this), P, { get: aFunction$7(getter), enumerable: true, configurable: true });
    }
  });
}

var $$Q = _export;
var DESCRIPTORS$i = descriptors;
var FORCED$5 = objectPrototypeAccessorsForced;
var toObject$h = toObject;
var aFunction$8 = aFunction$1;
var definePropertyModule$9 = objectDefineProperty;

// `Object.prototype.__defineSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineSetter__
if (DESCRIPTORS$i) {
  $$Q({ target: 'Object', proto: true, forced: FORCED$5 }, {
    __defineSetter__: function __defineSetter__(P, setter) {
      definePropertyModule$9.f(toObject$h(this), P, { set: aFunction$8(setter), enumerable: true, configurable: true });
    }
  });
}

var $$R = _export;
var DESCRIPTORS$j = descriptors;
var FORCED$6 = objectPrototypeAccessorsForced;
var toObject$i = toObject;
var toPrimitive$5 = toPrimitive;
var getPrototypeOf$4 = objectGetPrototypeOf;
var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;

// `Object.prototype.__lookupGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupGetter__
if (DESCRIPTORS$j) {
  $$R({ target: 'Object', proto: true, forced: FORCED$6 }, {
    __lookupGetter__: function __lookupGetter__(P) {
      var O = toObject$i(this);
      var key = toPrimitive$5(P, true);
      var desc;
      do {
        if (desc = getOwnPropertyDescriptor$2(O, key)) return desc.get;
      } while (O = getPrototypeOf$4(O));
    }
  });
}

var $$S = _export;
var DESCRIPTORS$k = descriptors;
var FORCED$7 = objectPrototypeAccessorsForced;
var toObject$j = toObject;
var toPrimitive$6 = toPrimitive;
var getPrototypeOf$5 = objectGetPrototypeOf;
var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;

// `Object.prototype.__lookupSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupSetter__
if (DESCRIPTORS$k) {
  $$S({ target: 'Object', proto: true, forced: FORCED$7 }, {
    __lookupSetter__: function __lookupSetter__(P) {
      var O = toObject$j(this);
      var key = toPrimitive$6(P, true);
      var desc;
      do {
        if (desc = getOwnPropertyDescriptor$3(O, key)) return desc.set;
      } while (O = getPrototypeOf$5(O));
    }
  });
}

var $$T = _export;
var toAbsoluteIndex$6 = toAbsoluteIndex;

var fromCharCode = String.fromCharCode;
var nativeFromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
var INCORRECT_LENGTH = !!nativeFromCodePoint && nativeFromCodePoint.length != 1;

// `String.fromCodePoint` method
// https://tc39.es/ecma262/#sec-string.fromcodepoint
$$T({ target: 'String', stat: true, forced: INCORRECT_LENGTH }, {
  fromCodePoint: function fromCodePoint(x) { // eslint-disable-line no-unused-vars
    var elements = [];
    var length = arguments.length;
    var i = 0;
    var code;
    while (length > i) {
      code = +arguments[i++];
      if (toAbsoluteIndex$6(code, 0x10FFFF) !== code) throw RangeError(code + ' is not a valid code point');
      elements.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00)
      );
    } return elements.join('');
  }
});

var $$U = _export;
var toIndexedObject$d = toIndexedObject;
var toLength$f = toLength;

// `String.raw` method
// https://tc39.es/ecma262/#sec-string.raw
$$U({ target: 'String', stat: true }, {
  raw: function raw(template) {
    var rawTemplate = toIndexedObject$d(template.raw);
    var literalSegments = toLength$f(rawTemplate.length);
    var argumentsLength = arguments.length;
    var elements = [];
    var i = 0;
    while (literalSegments > i) {
      elements.push(String(rawTemplate[i++]));
      if (i < argumentsLength) elements.push(String(arguments[i]));
    } return elements.join('');
  }
});

var toInteger$6 = toInteger;
var requireObjectCoercible$3 = requireObjectCoercible;

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod$4 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible$3($this));
    var position = toInteger$6(pos);
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
  codeAt: createMethod$4(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$4(true)
};

var $$V = _export;
var codeAt = stringMultibyte.codeAt;

// `String.prototype.codePointAt` method
// https://tc39.es/ecma262/#sec-string.prototype.codepointat
$$V({ target: 'String', proto: true }, {
  codePointAt: function codePointAt(pos) {
    return codeAt(this, pos);
  }
});

var isObject$k = isObject;
var classof$6 = classofRaw;
var wellKnownSymbol$i = wellKnownSymbol;

var MATCH = wellKnownSymbol$i('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject$k(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classof$6(it) == 'RegExp');
};

var isRegExp = isRegexp;

var notARegexp = function (it) {
  if (isRegExp(it)) {
    throw TypeError("The method doesn't accept regular expressions");
  } return it;
};

var wellKnownSymbol$j = wellKnownSymbol;

var MATCH$1 = wellKnownSymbol$j('match');

var correctIsRegexpLogic = function (METHOD_NAME) {
  var regexp = /./;
  try {
    '/./'[METHOD_NAME](regexp);
  } catch (error1) {
    try {
      regexp[MATCH$1] = false;
      return '/./'[METHOD_NAME](regexp);
    } catch (error2) { /* empty */ }
  } return false;
};

var $$W = _export;
var getOwnPropertyDescriptor$4 = objectGetOwnPropertyDescriptor.f;
var toLength$g = toLength;
var notARegExp = notARegexp;
var requireObjectCoercible$4 = requireObjectCoercible;
var correctIsRegExpLogic = correctIsRegexpLogic;

var nativeEndsWith = ''.endsWith;
var min$5 = Math.min;

var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic('endsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG = !CORRECT_IS_REGEXP_LOGIC && !!function () {
  var descriptor = getOwnPropertyDescriptor$4(String.prototype, 'endsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.endsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.endswith
$$W({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = String(requireObjectCoercible$4(this));
    notARegExp(searchString);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength$g(that.length);
    var end = endPosition === undefined ? len : min$5(toLength$g(endPosition), len);
    var search = String(searchString);
    return nativeEndsWith
      ? nativeEndsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});

var $$X = _export;
var notARegExp$1 = notARegexp;
var requireObjectCoercible$5 = requireObjectCoercible;
var correctIsRegExpLogic$1 = correctIsRegexpLogic;

// `String.prototype.includes` method
// https://tc39.es/ecma262/#sec-string.prototype.includes
$$X({ target: 'String', proto: true, forced: !correctIsRegExpLogic$1('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~String(requireObjectCoercible$5(this))
      .indexOf(notARegExp$1(searchString), arguments.length > 1 ? arguments[1] : undefined);
  }
});

var anObject$a = anObject;

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags = function () {
  var that = anObject$a(this);
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

var fails$s = fails;

// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
// so we use an intermediate function.
function RE(s, f) {
  return RegExp(s, f);
}

regexpStickyHelpers.UNSUPPORTED_Y = fails$s(function () {
  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
  var re = RE('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

regexpStickyHelpers.BROKEN_CARET = fails$s(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = RE('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});

var regexpFlags$1 = regexpFlags;
var stickyHelpers = regexpStickyHelpers;

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

var UNSUPPORTED_Y = stickyHelpers.UNSUPPORTED_Y || stickyHelpers.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;
    var sticky = UNSUPPORTED_Y && re.sticky;
    var flags = regexpFlags$1.call(re);
    var source = re.source;
    var charsAdded = 0;
    var strCopy = str;

    if (sticky) {
      flags = flags.replace('y', '');
      if (flags.indexOf('g') === -1) {
        flags += 'g';
      }

      strCopy = String(str).slice(re.lastIndex);
      // Support anchored sticky behavior.
      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
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

    return match;
  };
}

var regexpExec = patchedExec;

var $$Y = _export;
var exec = regexpExec;

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
$$Y({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
  exec: exec
});

// TODO: Remove from `core-js@4` since it's moved to entry points

var redefine$5 = redefine.exports;
var fails$t = fails;
var wellKnownSymbol$k = wellKnownSymbol;
var regexpExec$1 = regexpExec;
var createNonEnumerableProperty$9 = createNonEnumerableProperty;

var SPECIES$4 = wellKnownSymbol$k('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails$t(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

// IE <= 11 replaces $0 with the whole match, as if it was $&
// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
var REPLACE_KEEPS_$0 = (function () {
  return 'a'.replace(/./, '$0') === '$0';
})();

var REPLACE = wellKnownSymbol$k('replace');
// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE]) {
    return /./[REPLACE]('a', '$0') === '';
  }
  return false;
})();

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails$t(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol$k(KEY);

  var DELEGATES_TO_SYMBOL = !fails$t(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$t(function () {
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
      re.constructor[SPECIES$4] = function () { return re; };
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
    (KEY === 'replace' && !(
      REPLACE_SUPPORTS_NAMED_GROUPS &&
      REPLACE_KEEPS_$0 &&
      !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    )) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === regexpExec$1) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    }, {
      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
    });
    var stringMethod = methods[0];
    var regexMethod = methods[1];

    redefine$5(String.prototype, KEY, stringMethod);
    redefine$5(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
  }

  if (sham) createNonEnumerableProperty$9(RegExp.prototype[SYMBOL], 'sham', true);
};

var charAt = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
var advanceStringIndex = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};

var classof$7 = classofRaw;
var regexpExec$2 = regexpExec;

// `RegExpExec` abstract operation
// https://tc39.es/ecma262/#sec-regexpexec
var regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }

  if (classof$7(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec$2.call(R, S);
};

var fixRegExpWellKnownSymbolLogic = fixRegexpWellKnownSymbolLogic;
var anObject$b = anObject;
var toLength$h = toLength;
var requireObjectCoercible$6 = requireObjectCoercible;
var advanceStringIndex$1 = advanceStringIndex;
var regExpExec = regexpExecAbstract;

// @@match logic
fixRegExpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.es/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible$6(this);
      var matcher = regexp == undefined ? undefined : regexp[MATCH];
      return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative(nativeMatch, regexp, this);
      if (res.done) return res.value;

      var rx = anObject$b(regexp);
      var S = String(this);

      if (!rx.global) return regExpExec(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex$1(S, toLength$h(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

var anObject$c = anObject;
var aFunction$9 = aFunction$1;
var wellKnownSymbol$l = wellKnownSymbol;

var SPECIES$5 = wellKnownSymbol$l('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor = function (O, defaultConstructor) {
  var C = anObject$c(O).constructor;
  var S;
  return C === undefined || (S = anObject$c(C)[SPECIES$5]) == undefined ? defaultConstructor : aFunction$9(S);
};

var $$Z = _export;
var createIteratorConstructor$2 = createIteratorConstructor;
var requireObjectCoercible$7 = requireObjectCoercible;
var toLength$i = toLength;
var aFunction$a = aFunction$1;
var anObject$d = anObject;
var classof$8 = classofRaw;
var isRegExp$1 = isRegexp;
var getRegExpFlags = regexpFlags;
var createNonEnumerableProperty$a = createNonEnumerableProperty;
var fails$u = fails;
var wellKnownSymbol$m = wellKnownSymbol;
var speciesConstructor$1 = speciesConstructor;
var advanceStringIndex$2 = advanceStringIndex;
var InternalStateModule$3 = internalState;
var IS_PURE = isPure;

var MATCH_ALL = wellKnownSymbol$m('matchAll');
var REGEXP_STRING = 'RegExp String';
var REGEXP_STRING_ITERATOR = REGEXP_STRING + ' Iterator';
var setInternalState$2 = InternalStateModule$3.set;
var getInternalState$3 = InternalStateModule$3.getterFor(REGEXP_STRING_ITERATOR);
var RegExpPrototype = RegExp.prototype;
var regExpBuiltinExec = RegExpPrototype.exec;
var nativeMatchAll = ''.matchAll;

var WORKS_WITH_NON_GLOBAL_REGEX = !!nativeMatchAll && !fails$u(function () {
  'a'.matchAll(/./);
});

var regExpExec$1 = function (R, S) {
  var exec = R.exec;
  var result;
  if (typeof exec == 'function') {
    result = exec.call(R, S);
    if (typeof result != 'object') throw TypeError('Incorrect exec result');
    return result;
  } return regExpBuiltinExec.call(R, S);
};

// eslint-disable-next-line max-len
var $RegExpStringIterator = createIteratorConstructor$2(function RegExpStringIterator(regexp, string, global, fullUnicode) {
  setInternalState$2(this, {
    type: REGEXP_STRING_ITERATOR,
    regexp: regexp,
    string: string,
    global: global,
    unicode: fullUnicode,
    done: false
  });
}, REGEXP_STRING, function next() {
  var state = getInternalState$3(this);
  if (state.done) return { value: undefined, done: true };
  var R = state.regexp;
  var S = state.string;
  var match = regExpExec$1(R, S);
  if (match === null) return { value: undefined, done: state.done = true };
  if (state.global) {
    if (String(match[0]) == '') R.lastIndex = advanceStringIndex$2(S, toLength$i(R.lastIndex), state.unicode);
    return { value: match, done: false };
  }
  state.done = true;
  return { value: match, done: false };
});

var $matchAll = function (string) {
  var R = anObject$d(this);
  var S = String(string);
  var C, flagsValue, flags, matcher, global, fullUnicode;
  C = speciesConstructor$1(R, RegExp);
  flagsValue = R.flags;
  if (flagsValue === undefined && R instanceof RegExp && !('flags' in RegExpPrototype)) {
    flagsValue = getRegExpFlags.call(R);
  }
  flags = flagsValue === undefined ? '' : String(flagsValue);
  matcher = new C(C === RegExp ? R.source : R, flags);
  global = !!~flags.indexOf('g');
  fullUnicode = !!~flags.indexOf('u');
  matcher.lastIndex = toLength$i(R.lastIndex);
  return new $RegExpStringIterator(matcher, S, global, fullUnicode);
};

// `String.prototype.matchAll` method
// https://tc39.es/ecma262/#sec-string.prototype.matchall
$$Z({ target: 'String', proto: true, forced: WORKS_WITH_NON_GLOBAL_REGEX }, {
  matchAll: function matchAll(regexp) {
    var O = requireObjectCoercible$7(this);
    var flags, S, matcher, rx;
    if (regexp != null) {
      if (isRegExp$1(regexp)) {
        flags = String(requireObjectCoercible$7('flags' in RegExpPrototype
          ? regexp.flags
          : getRegExpFlags.call(regexp)
        ));
        if (!~flags.indexOf('g')) throw TypeError('`.matchAll` does not allow non-global regexes');
      }
      if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll.apply(O, arguments);
      matcher = regexp[MATCH_ALL];
      if (matcher === undefined && IS_PURE && classof$8(regexp) == 'RegExp') matcher = $matchAll;
      if (matcher != null) return aFunction$a(matcher).call(regexp, O);
    } else if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll.apply(O, arguments);
    S = String(O);
    rx = new RegExp(regexp, 'g');
    return rx[MATCH_ALL](S);
  }
});

MATCH_ALL in RegExpPrototype || createNonEnumerableProperty$a(RegExpPrototype, MATCH_ALL, $matchAll);

var toInteger$7 = toInteger;
var requireObjectCoercible$8 = requireObjectCoercible;

// `String.prototype.repeat` method implementation
// https://tc39.es/ecma262/#sec-string.prototype.repeat
var stringRepeat = ''.repeat || function repeat(count) {
  var str = String(requireObjectCoercible$8(this));
  var result = '';
  var n = toInteger$7(count);
  if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
  return result;
};

// https://github.com/tc39/proposal-string-pad-start-end
var toLength$j = toLength;
var repeat = stringRepeat;
var requireObjectCoercible$9 = requireObjectCoercible;

var ceil$1 = Math.ceil;

// `String.prototype.{ padStart, padEnd }` methods implementation
var createMethod$5 = function (IS_END) {
  return function ($this, maxLength, fillString) {
    var S = String(requireObjectCoercible$9($this));
    var stringLength = S.length;
    var fillStr = fillString === undefined ? ' ' : String(fillString);
    var intMaxLength = toLength$j(maxLength);
    var fillLen, stringFiller;
    if (intMaxLength <= stringLength || fillStr == '') return S;
    fillLen = intMaxLength - stringLength;
    stringFiller = repeat.call(fillStr, ceil$1(fillLen / fillStr.length));
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

// https://github.com/zloirock/core-js/issues/280
var userAgent$1 = engineUserAgent;

// eslint-disable-next-line unicorn/no-unsafe-regex
var stringPadWebkitBug = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(userAgent$1);

var $$_ = _export;
var $padEnd = stringPad.end;
var WEBKIT_BUG = stringPadWebkitBug;

// `String.prototype.padEnd` method
// https://tc39.es/ecma262/#sec-string.prototype.padend
$$_({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return $padEnd(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$$ = _export;
var $padStart = stringPad.start;
var WEBKIT_BUG$1 = stringPadWebkitBug;

// `String.prototype.padStart` method
// https://tc39.es/ecma262/#sec-string.prototype.padstart
$$$({ target: 'String', proto: true, forced: WEBKIT_BUG$1 }, {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$10 = _export;
var repeat$1 = stringRepeat;

// `String.prototype.repeat` method
// https://tc39.es/ecma262/#sec-string.prototype.repeat
$$10({ target: 'String', proto: true }, {
  repeat: repeat$1
});

var toObject$k = toObject;

var floor$1 = Math.floor;
var replace = ''.replace;
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

// https://tc39.es/ecma262/#sec-getsubstitution
var getSubstitution = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject$k(namedCaptures);
    symbols = SUBSTITUTION_SYMBOLS;
  }
  return replace.call(replacement, symbols, function (match, ch) {
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
          var f = floor$1(n / 10);
          if (f === 0) return match;
          if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
          return match;
        }
        capture = captures[n - 1];
    }
    return capture === undefined ? '' : capture;
  });
};

var fixRegExpWellKnownSymbolLogic$1 = fixRegexpWellKnownSymbolLogic;
var anObject$e = anObject;
var toLength$k = toLength;
var toInteger$8 = toInteger;
var requireObjectCoercible$a = requireObjectCoercible;
var advanceStringIndex$3 = advanceStringIndex;
var getSubstitution$1 = getSubstitution;
var regExpExec$2 = regexpExecAbstract;

var max$3 = Math.max;
var min$6 = Math.min;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
fixRegExpWellKnownSymbolLogic$1('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible$a(this);
      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
      return replacer !== undefined
        ? replacer.call(searchValue, O, replaceValue)
        : nativeReplace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      if (
        (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0) ||
        (typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1)
      ) {
        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
        if (res.done) return res.value;
      }

      var rx = anObject$e(regexp);
      var S = String(this);

      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);

      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = regExpExec$2(rx, S);
        if (result === null) break;

        results.push(result);
        if (!global) break;

        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex$3(S, toLength$k(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = String(result[0]);
        var position = max$3(min$6(toInteger$8(result.index), S.length), 0);
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
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
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
});

var fixRegExpWellKnownSymbolLogic$2 = fixRegexpWellKnownSymbolLogic;
var anObject$f = anObject;
var requireObjectCoercible$b = requireObjectCoercible;
var sameValue$1 = sameValue;
var regExpExec$3 = regexpExecAbstract;

// @@search logic
fixRegExpWellKnownSymbolLogic$2('search', 1, function (SEARCH, nativeSearch, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.es/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = requireObjectCoercible$b(this);
      var searcher = regexp == undefined ? undefined : regexp[SEARCH];
      return searcher !== undefined ? searcher.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@search
    function (regexp) {
      var res = maybeCallNative(nativeSearch, regexp, this);
      if (res.done) return res.value;

      var rx = anObject$f(regexp);
      var S = String(this);

      var previousLastIndex = rx.lastIndex;
      if (!sameValue$1(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = regExpExec$3(rx, S);
      if (!sameValue$1(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});

var fixRegExpWellKnownSymbolLogic$3 = fixRegexpWellKnownSymbolLogic;
var isRegExp$2 = isRegexp;
var anObject$g = anObject;
var requireObjectCoercible$c = requireObjectCoercible;
var speciesConstructor$2 = speciesConstructor;
var advanceStringIndex$4 = advanceStringIndex;
var toLength$l = toLength;
var callRegExpExec = regexpExecAbstract;
var regexpExec$3 = regexpExec;
var fails$v = fails;

var arrayPush = [].push;
var min$7 = Math.min;
var MAX_UINT32 = 0xFFFFFFFF;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails$v(function () { return !RegExp(MAX_UINT32, 'y'); });

// @@split logic
fixRegExpWellKnownSymbolLogic$3('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'.split(/(b)*/)[1] == 'c' ||
    'test'.split(/(?:)/, -1).length != 4 ||
    'ab'.split(/(?:ab)*/).length != 2 ||
    '.'.split(/(.?)(.?)/).length != 4 ||
    '.'.split(/()()/).length > 1 ||
    ''.split(/.?/).length
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(requireObjectCoercible$c(this));
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (separator === undefined) return [string];
      // If `separator` is not a regex, use native split
      if (!isRegExp$2(separator)) {
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
      while (match = regexpExec$3.call(separatorCopy, string)) {
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
      var O = requireObjectCoercible$c(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
      if (res.done) return res.value;

      var rx = anObject$g(regexp);
      var S = String(this);
      var C = speciesConstructor$2(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = min$7(toLength$l(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex$4(S, q, unicodeMatching);
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
}, !SUPPORTS_Y);

var $$11 = _export;
var getOwnPropertyDescriptor$5 = objectGetOwnPropertyDescriptor.f;
var toLength$m = toLength;
var notARegExp$2 = notARegexp;
var requireObjectCoercible$d = requireObjectCoercible;
var correctIsRegExpLogic$2 = correctIsRegexpLogic;

var nativeStartsWith = ''.startsWith;
var min$8 = Math.min;

var CORRECT_IS_REGEXP_LOGIC$1 = correctIsRegExpLogic$2('startsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG$1 = !CORRECT_IS_REGEXP_LOGIC$1 && !!function () {
  var descriptor = getOwnPropertyDescriptor$5(String.prototype, 'startsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.startsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.startswith
$$11({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG$1 && !CORRECT_IS_REGEXP_LOGIC$1 }, {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = String(requireObjectCoercible$d(this));
    notARegExp$2(searchString);
    var index = toLength$m(min$8(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return nativeStartsWith
      ? nativeStartsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});

// a string of all valid unicode whitespaces
// eslint-disable-next-line max-len
var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var requireObjectCoercible$e = requireObjectCoercible;
var whitespaces$1 = whitespaces;

var whitespace = '[' + whitespaces$1 + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$6 = function (TYPE) {
  return function ($this) {
    var string = String(requireObjectCoercible$e($this));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod$6(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod$6(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod$6(3)
};

var fails$w = fails;
var whitespaces$2 = whitespaces;

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
var stringTrimForced = function (METHOD_NAME) {
  return fails$w(function () {
    return !!whitespaces$2[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces$2[METHOD_NAME].name !== METHOD_NAME;
  });
};

var $$12 = _export;
var $trim = stringTrim.trim;
var forcedStringTrimMethod = stringTrimForced;

// `String.prototype.trim` method
// https://tc39.es/ecma262/#sec-string.prototype.trim
$$12({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});

var $$13 = _export;
var $trimStart = stringTrim.start;
var forcedStringTrimMethod$1 = stringTrimForced;

var FORCED$8 = forcedStringTrimMethod$1('trimStart');

var trimStart = FORCED$8 ? function trimStart() {
  return $trimStart(this);
} : ''.trimStart;

// `String.prototype.{ trimStart, trimLeft }` methods
// https://tc39.es/ecma262/#sec-string.prototype.trimstart
// https://tc39.es/ecma262/#String.prototype.trimleft
$$13({ target: 'String', proto: true, forced: FORCED$8 }, {
  trimStart: trimStart,
  trimLeft: trimStart
});

var $$14 = _export;
var $trimEnd = stringTrim.end;
var forcedStringTrimMethod$2 = stringTrimForced;

var FORCED$9 = forcedStringTrimMethod$2('trimEnd');

var trimEnd = FORCED$9 ? function trimEnd() {
  return $trimEnd(this);
} : ''.trimEnd;

// `String.prototype.{ trimEnd, trimRight }` methods
// https://tc39.es/ecma262/#sec-string.prototype.trimend
// https://tc39.es/ecma262/#String.prototype.trimright
$$14({ target: 'String', proto: true, forced: FORCED$9 }, {
  trimEnd: trimEnd,
  trimRight: trimEnd
});

var charAt$1 = stringMultibyte.charAt;
var InternalStateModule$4 = internalState;
var defineIterator$2 = defineIterator;

var STRING_ITERATOR = 'String Iterator';
var setInternalState$3 = InternalStateModule$4.set;
var getInternalState$4 = InternalStateModule$4.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator$2(String, 'String', function (iterated) {
  setInternalState$3(this, {
    type: STRING_ITERATOR,
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$4(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt$1(string, index);
  state.index += point.length;
  return { value: point, done: false };
});

var requireObjectCoercible$f = requireObjectCoercible;

var quot = /"/g;

// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
// https://tc39.es/ecma262/#sec-createhtml
var createHtml = function (string, tag, attribute, value) {
  var S = String(requireObjectCoercible$f(string));
  var p1 = '<' + tag;
  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};

var fails$x = fails;

// check the existence of a method, lowercase
// of a tag and escaping quotes in arguments
var stringHtmlForced = function (METHOD_NAME) {
  return fails$x(function () {
    var test = ''[METHOD_NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  });
};

var $$15 = _export;
var createHTML = createHtml;
var forcedStringHTMLMethod = stringHtmlForced;

// `String.prototype.anchor` method
// https://tc39.es/ecma262/#sec-string.prototype.anchor
$$15({ target: 'String', proto: true, forced: forcedStringHTMLMethod('anchor') }, {
  anchor: function anchor(name) {
    return createHTML(this, 'a', 'name', name);
  }
});

var $$16 = _export;
var createHTML$1 = createHtml;
var forcedStringHTMLMethod$1 = stringHtmlForced;

// `String.prototype.big` method
// https://tc39.es/ecma262/#sec-string.prototype.big
$$16({ target: 'String', proto: true, forced: forcedStringHTMLMethod$1('big') }, {
  big: function big() {
    return createHTML$1(this, 'big', '', '');
  }
});

var $$17 = _export;
var createHTML$2 = createHtml;
var forcedStringHTMLMethod$2 = stringHtmlForced;

// `String.prototype.blink` method
// https://tc39.es/ecma262/#sec-string.prototype.blink
$$17({ target: 'String', proto: true, forced: forcedStringHTMLMethod$2('blink') }, {
  blink: function blink() {
    return createHTML$2(this, 'blink', '', '');
  }
});

var $$18 = _export;
var createHTML$3 = createHtml;
var forcedStringHTMLMethod$3 = stringHtmlForced;

// `String.prototype.bold` method
// https://tc39.es/ecma262/#sec-string.prototype.bold
$$18({ target: 'String', proto: true, forced: forcedStringHTMLMethod$3('bold') }, {
  bold: function bold() {
    return createHTML$3(this, 'b', '', '');
  }
});

var $$19 = _export;
var createHTML$4 = createHtml;
var forcedStringHTMLMethod$4 = stringHtmlForced;

// `String.prototype.fixed` method
// https://tc39.es/ecma262/#sec-string.prototype.fixed
$$19({ target: 'String', proto: true, forced: forcedStringHTMLMethod$4('fixed') }, {
  fixed: function fixed() {
    return createHTML$4(this, 'tt', '', '');
  }
});

var $$1a = _export;
var createHTML$5 = createHtml;
var forcedStringHTMLMethod$5 = stringHtmlForced;

// `String.prototype.fontcolor` method
// https://tc39.es/ecma262/#sec-string.prototype.fontcolor
$$1a({ target: 'String', proto: true, forced: forcedStringHTMLMethod$5('fontcolor') }, {
  fontcolor: function fontcolor(color) {
    return createHTML$5(this, 'font', 'color', color);
  }
});

var $$1b = _export;
var createHTML$6 = createHtml;
var forcedStringHTMLMethod$6 = stringHtmlForced;

// `String.prototype.fontsize` method
// https://tc39.es/ecma262/#sec-string.prototype.fontsize
$$1b({ target: 'String', proto: true, forced: forcedStringHTMLMethod$6('fontsize') }, {
  fontsize: function fontsize(size) {
    return createHTML$6(this, 'font', 'size', size);
  }
});

var $$1c = _export;
var createHTML$7 = createHtml;
var forcedStringHTMLMethod$7 = stringHtmlForced;

// `String.prototype.italics` method
// https://tc39.es/ecma262/#sec-string.prototype.italics
$$1c({ target: 'String', proto: true, forced: forcedStringHTMLMethod$7('italics') }, {
  italics: function italics() {
    return createHTML$7(this, 'i', '', '');
  }
});

var $$1d = _export;
var createHTML$8 = createHtml;
var forcedStringHTMLMethod$8 = stringHtmlForced;

// `String.prototype.link` method
// https://tc39.es/ecma262/#sec-string.prototype.link
$$1d({ target: 'String', proto: true, forced: forcedStringHTMLMethod$8('link') }, {
  link: function link(url) {
    return createHTML$8(this, 'a', 'href', url);
  }
});

var $$1e = _export;
var createHTML$9 = createHtml;
var forcedStringHTMLMethod$9 = stringHtmlForced;

// `String.prototype.small` method
// https://tc39.es/ecma262/#sec-string.prototype.small
$$1e({ target: 'String', proto: true, forced: forcedStringHTMLMethod$9('small') }, {
  small: function small() {
    return createHTML$9(this, 'small', '', '');
  }
});

var $$1f = _export;
var createHTML$a = createHtml;
var forcedStringHTMLMethod$a = stringHtmlForced;

// `String.prototype.strike` method
// https://tc39.es/ecma262/#sec-string.prototype.strike
$$1f({ target: 'String', proto: true, forced: forcedStringHTMLMethod$a('strike') }, {
  strike: function strike() {
    return createHTML$a(this, 'strike', '', '');
  }
});

var $$1g = _export;
var createHTML$b = createHtml;
var forcedStringHTMLMethod$b = stringHtmlForced;

// `String.prototype.sub` method
// https://tc39.es/ecma262/#sec-string.prototype.sub
$$1g({ target: 'String', proto: true, forced: forcedStringHTMLMethod$b('sub') }, {
  sub: function sub() {
    return createHTML$b(this, 'sub', '', '');
  }
});

var $$1h = _export;
var createHTML$c = createHtml;
var forcedStringHTMLMethod$c = stringHtmlForced;

// `String.prototype.sup` method
// https://tc39.es/ecma262/#sec-string.prototype.sup
$$1h({ target: 'String', proto: true, forced: forcedStringHTMLMethod$c('sup') }, {
  sup: function sup() {
    return createHTML$c(this, 'sup', '', '');
  }
});

var $$1i = _export;
var requireObjectCoercible$g = requireObjectCoercible;
var isRegExp$3 = isRegexp;
var getRegExpFlags$1 = regexpFlags;
var getSubstitution$2 = getSubstitution;
var wellKnownSymbol$n = wellKnownSymbol;

var REPLACE$1 = wellKnownSymbol$n('replace');
var RegExpPrototype$1 = RegExp.prototype;
var max$4 = Math.max;

var stringIndexOf = function (string, searchValue, fromIndex) {
  if (fromIndex > string.length) return -1;
  if (searchValue === '') return fromIndex;
  return string.indexOf(searchValue, fromIndex);
};

// `String.prototype.replaceAll` method
// https://tc39.es/ecma262/#sec-string.prototype.replaceall
$$1i({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    var O = requireObjectCoercible$g(this);
    var IS_REG_EXP, flags, replacer, string, searchString, functionalReplace, searchLength, advanceBy, replacement;
    var position = 0;
    var endOfLastMatch = 0;
    var result = '';
    if (searchValue != null) {
      IS_REG_EXP = isRegExp$3(searchValue);
      if (IS_REG_EXP) {
        flags = String(requireObjectCoercible$g('flags' in RegExpPrototype$1
          ? searchValue.flags
          : getRegExpFlags$1.call(searchValue)
        ));
        if (!~flags.indexOf('g')) throw TypeError('`.replaceAll` does not allow non-global regexes');
      }
      replacer = searchValue[REPLACE$1];
      if (replacer !== undefined) {
        return replacer.call(searchValue, O, replaceValue);
      }
    }
    string = String(O);
    searchString = String(searchValue);
    functionalReplace = typeof replaceValue === 'function';
    if (!functionalReplace) replaceValue = String(replaceValue);
    searchLength = searchString.length;
    advanceBy = max$4(1, searchLength);
    position = stringIndexOf(string, searchString, 0);
    while (position !== -1) {
      if (functionalReplace) {
        replacement = String(replaceValue(searchString, position, string));
      } else {
        replacement = getSubstitution$2(searchString, string, position, [], undefined, replaceValue);
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

var isObject$l = isObject;
var setPrototypeOf$3 = objectSetPrototypeOf;

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf$3 &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    typeof (NewTarget = dummy.constructor) == 'function' &&
    NewTarget !== Wrapper &&
    isObject$l(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf$3($this, NewTargetPrototype);
  return $this;
};

var DESCRIPTORS$l = descriptors;
var global$i = global$1;
var isForced$2 = isForced_1;
var inheritIfRequired$1 = inheritIfRequired;
var defineProperty$7 = objectDefineProperty.f;
var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var isRegExp$4 = isRegexp;
var getFlags = regexpFlags;
var stickyHelpers$1 = regexpStickyHelpers;
var redefine$6 = redefine.exports;
var fails$y = fails;
var setInternalState$4 = internalState.set;
var setSpecies$2 = setSpecies;
var wellKnownSymbol$o = wellKnownSymbol;

var MATCH$2 = wellKnownSymbol$o('match');
var NativeRegExp = global$i.RegExp;
var RegExpPrototype$2 = NativeRegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;

// "new" should create a new object, old webkit bug
var CORRECT_NEW = new NativeRegExp(re1) !== re1;

var UNSUPPORTED_Y$1 = stickyHelpers$1.UNSUPPORTED_Y;

var FORCED$a = DESCRIPTORS$l && isForced$2('RegExp', (!CORRECT_NEW || UNSUPPORTED_Y$1 || fails$y(function () {
  re2[MATCH$2] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
})));

// `RegExp` constructor
// https://tc39.es/ecma262/#sec-regexp-constructor
if (FORCED$a) {
  var RegExpWrapper = function RegExp(pattern, flags) {
    var thisIsRegExp = this instanceof RegExpWrapper;
    var patternIsRegExp = isRegExp$4(pattern);
    var flagsAreUndefined = flags === undefined;
    var sticky;

    if (!thisIsRegExp && patternIsRegExp && pattern.constructor === RegExpWrapper && flagsAreUndefined) {
      return pattern;
    }

    if (CORRECT_NEW) {
      if (patternIsRegExp && !flagsAreUndefined) pattern = pattern.source;
    } else if (pattern instanceof RegExpWrapper) {
      if (flagsAreUndefined) flags = getFlags.call(pattern);
      pattern = pattern.source;
    }

    if (UNSUPPORTED_Y$1) {
      sticky = !!flags && flags.indexOf('y') > -1;
      if (sticky) flags = flags.replace(/y/g, '');
    }

    var result = inheritIfRequired$1(
      CORRECT_NEW ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags),
      thisIsRegExp ? this : RegExpPrototype$2,
      RegExpWrapper
    );

    if (UNSUPPORTED_Y$1 && sticky) setInternalState$4(result, { sticky: sticky });

    return result;
  };
  var proxy = function (key) {
    key in RegExpWrapper || defineProperty$7(RegExpWrapper, key, {
      configurable: true,
      get: function () { return NativeRegExp[key]; },
      set: function (it) { NativeRegExp[key] = it; }
    });
  };
  var keys$1 = getOwnPropertyNames(NativeRegExp);
  var index = 0;
  while (keys$1.length > index) proxy(keys$1[index++]);
  RegExpPrototype$2.constructor = RegExpWrapper;
  RegExpWrapper.prototype = RegExpPrototype$2;
  redefine$6(global$i, 'RegExp', RegExpWrapper);
}

// https://tc39.es/ecma262/#sec-get-regexp-@@species
setSpecies$2('RegExp');

var DESCRIPTORS$m = descriptors;
var objectDefinePropertyModule = objectDefineProperty;
var regExpFlags = regexpFlags;
var UNSUPPORTED_Y$2 = regexpStickyHelpers.UNSUPPORTED_Y;

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
if (DESCRIPTORS$m && (/./g.flags != 'g' || UNSUPPORTED_Y$2)) {
  objectDefinePropertyModule.f(RegExp.prototype, 'flags', {
    configurable: true,
    get: regExpFlags
  });
}

var DESCRIPTORS$n = descriptors;
var UNSUPPORTED_Y$3 = regexpStickyHelpers.UNSUPPORTED_Y;
var defineProperty$8 = objectDefineProperty.f;
var getInternalState$5 = internalState.get;
var RegExpPrototype$3 = RegExp.prototype;

// `RegExp.prototype.sticky` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.sticky
if (DESCRIPTORS$n && UNSUPPORTED_Y$3) {
  defineProperty$8(RegExp.prototype, 'sticky', {
    configurable: true,
    get: function () {
      if (this === RegExpPrototype$3) return undefined;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (this instanceof RegExp) {
        return !!getInternalState$5(this).sticky;
      }
      throw TypeError('Incompatible receiver, RegExp required');
    }
  });
}

// TODO: Remove from `core-js@4` since it's moved to entry points

var $$1j = _export;
var isObject$m = isObject;

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
$$1j({ target: 'RegExp', proto: true, forced: !DELEGATES_TO_EXEC }, {
  test: function (str) {
    if (typeof this.exec !== 'function') {
      return nativeTest.call(this, str);
    }
    var result = this.exec(str);
    if (result !== null && !isObject$m(result)) {
      throw new Error('RegExp exec method returned something other than an Object or null');
    }
    return !!result;
  }
});

var redefine$7 = redefine.exports;
var anObject$h = anObject;
var fails$z = fails;
var flags = regexpFlags;

var TO_STRING = 'toString';
var RegExpPrototype$4 = RegExp.prototype;
var nativeToString = RegExpPrototype$4[TO_STRING];

var NOT_GENERIC = fails$z(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = nativeToString.name != TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine$7(RegExp.prototype, TO_STRING, function toString() {
    var R = anObject$h(this);
    var p = String(R.source);
    var rf = R.flags;
    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype$4) ? flags.call(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}

var global$j = global$1;
var trim = stringTrim.trim;
var whitespaces$3 = whitespaces;

var $parseInt = global$j.parseInt;
var hex = /^[+-]?0[Xx]/;
var FORCED$b = $parseInt(whitespaces$3 + '08') !== 8 || $parseInt(whitespaces$3 + '0x16') !== 22;

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
var numberParseInt = FORCED$b ? function parseInt(string, radix) {
  var S = trim(String(string));
  return $parseInt(S, (radix >>> 0) || (hex.test(S) ? 16 : 10));
} : $parseInt;

var $$1k = _export;
var parseIntImplementation = numberParseInt;

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
$$1k({ global: true, forced: parseInt != parseIntImplementation }, {
  parseInt: parseIntImplementation
});

var global$k = global$1;
var trim$1 = stringTrim.trim;
var whitespaces$4 = whitespaces;

var $parseFloat = global$k.parseFloat;
var FORCED$c = 1 / $parseFloat(whitespaces$4 + '-0') !== -Infinity;

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
var numberParseFloat = FORCED$c ? function parseFloat(string) {
  var trimmedString = trim$1(String(string));
  var result = $parseFloat(trimmedString);
  return result === 0 && trimmedString.charAt(0) == '-' ? -0 : result;
} : $parseFloat;

var $$1l = _export;
var parseFloatImplementation = numberParseFloat;

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
$$1l({ global: true, forced: parseFloat != parseFloatImplementation }, {
  parseFloat: parseFloatImplementation
});

var DESCRIPTORS$o = descriptors;
var global$l = global$1;
var isForced$3 = isForced_1;
var redefine$8 = redefine.exports;
var has$f = has;
var classof$9 = classofRaw;
var inheritIfRequired$2 = inheritIfRequired;
var toPrimitive$7 = toPrimitive;
var fails$A = fails;
var create$4 = objectCreate;
var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
var getOwnPropertyDescriptor$6 = objectGetOwnPropertyDescriptor.f;
var defineProperty$9 = objectDefineProperty.f;
var trim$2 = stringTrim.trim;

var NUMBER = 'Number';
var NativeNumber = global$l[NUMBER];
var NumberPrototype = NativeNumber.prototype;

// Opera ~12 has broken Object#toString
var BROKEN_CLASSOF = classof$9(create$4(NumberPrototype)) == NUMBER;

// `ToNumber` abstract operation
// https://tc39.es/ecma262/#sec-tonumber
var toNumber = function (argument) {
  var it = toPrimitive$7(argument, false);
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
if (isForced$3(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
  var NumberWrapper = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var dummy = this;
    return dummy instanceof NumberWrapper
      // check on 1..constructor(foo) case
      && (BROKEN_CLASSOF ? fails$A(function () { NumberPrototype.valueOf.call(dummy); }) : classof$9(dummy) != NUMBER)
        ? inheritIfRequired$2(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
  };
  for (var keys$2 = DESCRIPTORS$o ? getOwnPropertyNames$1(NativeNumber) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger,' +
    // ESNext
    'fromString,range'
  ).split(','), j = 0, key; keys$2.length > j; j++) {
    if (has$f(NativeNumber, key = keys$2[j]) && !has$f(NumberWrapper, key)) {
      defineProperty$9(NumberWrapper, key, getOwnPropertyDescriptor$6(NativeNumber, key));
    }
  }
  NumberWrapper.prototype = NumberPrototype;
  NumberPrototype.constructor = NumberWrapper;
  redefine$8(global$l, NUMBER, NumberWrapper);
}

var $$1m = _export;

// `Number.EPSILON` constant
// https://tc39.es/ecma262/#sec-number.epsilon
$$1m({ target: 'Number', stat: true }, {
  EPSILON: Math.pow(2, -52)
});

var global$m = global$1;

var globalIsFinite = global$m.isFinite;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
var numberIsFinite = Number.isFinite || function isFinite(it) {
  return typeof it == 'number' && globalIsFinite(it);
};

var $$1n = _export;
var numberIsFinite$1 = numberIsFinite;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
$$1n({ target: 'Number', stat: true }, { isFinite: numberIsFinite$1 });

var isObject$n = isObject;

var floor$2 = Math.floor;

// `Number.isInteger` method implementation
// https://tc39.es/ecma262/#sec-number.isinteger
var isInteger = function isInteger(it) {
  return !isObject$n(it) && isFinite(it) && floor$2(it) === it;
};

var $$1o = _export;
var isInteger$1 = isInteger;

// `Number.isInteger` method
// https://tc39.es/ecma262/#sec-number.isinteger
$$1o({ target: 'Number', stat: true }, {
  isInteger: isInteger$1
});

var $$1p = _export;

// `Number.isNaN` method
// https://tc39.es/ecma262/#sec-number.isnan
$$1p({ target: 'Number', stat: true }, {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});

var $$1q = _export;
var isInteger$2 = isInteger;

var abs = Math.abs;

// `Number.isSafeInteger` method
// https://tc39.es/ecma262/#sec-number.issafeinteger
$$1q({ target: 'Number', stat: true }, {
  isSafeInteger: function isSafeInteger(number) {
    return isInteger$2(number) && abs(number) <= 0x1FFFFFFFFFFFFF;
  }
});

var $$1r = _export;

// `Number.MAX_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.max_safe_integer
$$1r({ target: 'Number', stat: true }, {
  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
});

var $$1s = _export;

// `Number.MIN_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.min_safe_integer
$$1s({ target: 'Number', stat: true }, {
  MIN_SAFE_INTEGER: -0x1FFFFFFFFFFFFF
});

var $$1t = _export;
var parseFloat$1 = numberParseFloat;

// `Number.parseFloat` method
// https://tc39.es/ecma262/#sec-number.parseFloat
$$1t({ target: 'Number', stat: true, forced: Number.parseFloat != parseFloat$1 }, {
  parseFloat: parseFloat$1
});

var $$1u = _export;
var parseInt$1 = numberParseInt;

// `Number.parseInt` method
// https://tc39.es/ecma262/#sec-number.parseint
$$1u({ target: 'Number', stat: true, forced: Number.parseInt != parseInt$1 }, {
  parseInt: parseInt$1
});

var classof$a = classofRaw;

// `thisNumberValue` abstract operation
// https://tc39.es/ecma262/#sec-thisnumbervalue
var thisNumberValue = function (value) {
  if (typeof value != 'number' && classof$a(value) != 'Number') {
    throw TypeError('Incorrect invocation');
  }
  return +value;
};

var $$1v = _export;
var toInteger$9 = toInteger;
var thisNumberValue$1 = thisNumberValue;
var repeat$2 = stringRepeat;
var fails$B = fails;

var nativeToFixed = 1.0.toFixed;
var floor$3 = Math.floor;

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

var FORCED$d = nativeToFixed && (
  0.00008.toFixed(3) !== '0.000' ||
  0.9.toFixed(0) !== '1' ||
  1.255.toFixed(2) !== '1.25' ||
  1000000000000000128.0.toFixed(0) !== '1000000000000000128'
) || !fails$B(function () {
  // V8 ~ Android 4.3-
  nativeToFixed.call({});
});

// `Number.prototype.toFixed` method
// https://tc39.es/ecma262/#sec-number.prototype.tofixed
$$1v({ target: 'Number', proto: true, forced: FORCED$d }, {
  // eslint-disable-next-line max-statements
  toFixed: function toFixed(fractionDigits) {
    var number = thisNumberValue$1(this);
    var fractDigits = toInteger$9(fractionDigits);
    var data = [0, 0, 0, 0, 0, 0];
    var sign = '';
    var result = '0';
    var e, z, j, k;

    var multiply = function (n, c) {
      var index = -1;
      var c2 = c;
      while (++index < 6) {
        c2 += n * data[index];
        data[index] = c2 % 1e7;
        c2 = floor$3(c2 / 1e7);
      }
    };

    var divide = function (n) {
      var index = 6;
      var c = 0;
      while (--index >= 0) {
        c += data[index];
        data[index] = floor$3(c / n);
        c = (c % n) * 1e7;
      }
    };

    var dataToString = function () {
      var index = 6;
      var s = '';
      while (--index >= 0) {
        if (s !== '' || index === 0 || data[index] !== 0) {
          var t = String(data[index]);
          s = s === '' ? t : s + repeat$2.call('0', 7 - t.length) + t;
        }
      } return s;
    };

    if (fractDigits < 0 || fractDigits > 20) throw RangeError('Incorrect fraction digits');
    // eslint-disable-next-line no-self-compare
    if (number != number) return 'NaN';
    if (number <= -1e21 || number >= 1e21) return String(number);
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
        multiply(0, z);
        j = fractDigits;
        while (j >= 7) {
          multiply(1e7, 0);
          j -= 7;
        }
        multiply(pow(10, j, 1), 0);
        j = e - 1;
        while (j >= 23) {
          divide(1 << 23);
          j -= 23;
        }
        divide(1 << j);
        multiply(1, 1);
        divide(2);
        result = dataToString();
      } else {
        multiply(0, z);
        multiply(1 << -e, 0);
        result = dataToString() + repeat$2.call('0', fractDigits);
      }
    }
    if (fractDigits > 0) {
      k = result.length;
      result = sign + (k <= fractDigits
        ? '0.' + repeat$2.call('0', fractDigits - k) + result
        : result.slice(0, k - fractDigits) + '.' + result.slice(k - fractDigits));
    } else {
      result = sign + result;
    } return result;
  }
});

var $$1w = _export;
var fails$C = fails;
var thisNumberValue$2 = thisNumberValue;

var nativeToPrecision = 1.0.toPrecision;

var FORCED$e = fails$C(function () {
  // IE7-
  return nativeToPrecision.call(1, undefined) !== '1';
}) || !fails$C(function () {
  // V8 ~ Android 4.3-
  nativeToPrecision.call({});
});

// `Number.prototype.toPrecision` method
// https://tc39.es/ecma262/#sec-number.prototype.toprecision
$$1w({ target: 'Number', proto: true, forced: FORCED$e }, {
  toPrecision: function toPrecision(precision) {
    return precision === undefined
      ? nativeToPrecision.call(thisNumberValue$2(this))
      : nativeToPrecision.call(thisNumberValue$2(this), precision);
  }
});

var log$1 = Math.log;

// `Math.log1p` method implementation
// https://tc39.es/ecma262/#sec-math.log1p
var mathLog1p = Math.log1p || function log1p(x) {
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log$1(1 + x);
};

var $$1x = _export;
var log1p = mathLog1p;

var nativeAcosh = Math.acosh;
var log$2 = Math.log;
var sqrt = Math.sqrt;
var LN2 = Math.LN2;

var FORCED$f = !nativeAcosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  || Math.floor(nativeAcosh(Number.MAX_VALUE)) != 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  || nativeAcosh(Infinity) != Infinity;

// `Math.acosh` method
// https://tc39.es/ecma262/#sec-math.acosh
$$1x({ target: 'Math', stat: true, forced: FORCED$f }, {
  acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? log$2(x) + LN2
      : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }
});

var $$1y = _export;

var nativeAsinh = Math.asinh;
var log$3 = Math.log;
var sqrt$1 = Math.sqrt;

function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log$3(x + sqrt$1(x * x + 1));
}

// `Math.asinh` method
// https://tc39.es/ecma262/#sec-math.asinh
// Tor Browser bug: Math.asinh(0) -> -0
$$1y({ target: 'Math', stat: true, forced: !(nativeAsinh && 1 / nativeAsinh(0) > 0) }, {
  asinh: asinh
});

var $$1z = _export;

var nativeAtanh = Math.atanh;
var log$4 = Math.log;

// `Math.atanh` method
// https://tc39.es/ecma262/#sec-math.atanh
// Tor Browser bug: Math.atanh(-0) -> 0
$$1z({ target: 'Math', stat: true, forced: !(nativeAtanh && 1 / nativeAtanh(-0) < 0) }, {
  atanh: function atanh(x) {
    return (x = +x) == 0 ? x : log$4((1 + x) / (1 - x)) / 2;
  }
});

// `Math.sign` method implementation
// https://tc39.es/ecma262/#sec-math.sign
var mathSign = Math.sign || function sign(x) {
  // eslint-disable-next-line no-self-compare
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};

var $$1A = _export;
var sign = mathSign;

var abs$1 = Math.abs;
var pow$1 = Math.pow;

// `Math.cbrt` method
// https://tc39.es/ecma262/#sec-math.cbrt
$$1A({ target: 'Math', stat: true }, {
  cbrt: function cbrt(x) {
    return sign(x = +x) * pow$1(abs$1(x), 1 / 3);
  }
});

var $$1B = _export;

var floor$4 = Math.floor;
var log$5 = Math.log;
var LOG2E = Math.LOG2E;

// `Math.clz32` method
// https://tc39.es/ecma262/#sec-math.clz32
$$1B({ target: 'Math', stat: true }, {
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - floor$4(log$5(x + 0.5) * LOG2E) : 32;
  }
});

var nativeExpm1 = Math.expm1;
var exp = Math.exp;

// `Math.expm1` method implementation
// https://tc39.es/ecma262/#sec-math.expm1
var mathExpm1 = (!nativeExpm1
  // Old FF bug
  || nativeExpm1(10) > 22025.465794806719 || nativeExpm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || nativeExpm1(-2e-17) != -2e-17
) ? function expm1(x) {
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
} : nativeExpm1;

var $$1C = _export;
var expm1 = mathExpm1;

var nativeCosh = Math.cosh;
var abs$2 = Math.abs;
var E = Math.E;

// `Math.cosh` method
// https://tc39.es/ecma262/#sec-math.cosh
$$1C({ target: 'Math', stat: true, forced: !nativeCosh || nativeCosh(710) === Infinity }, {
  cosh: function cosh(x) {
    var t = expm1(abs$2(x) - 1) + 1;
    return (t + 1 / (t * E * E)) * (E / 2);
  }
});

var $$1D = _export;
var expm1$1 = mathExpm1;

// `Math.expm1` method
// https://tc39.es/ecma262/#sec-math.expm1
$$1D({ target: 'Math', stat: true, forced: expm1$1 != Math.expm1 }, { expm1: expm1$1 });

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
var mathFround = Math.fround || function fround(x) {
  var $abs = abs$3(x);
  var $sign = sign$1(x);
  var a, result;
  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
  a = (1 + EPSILON32 / EPSILON) * $abs;
  result = a - (a - $abs);
  // eslint-disable-next-line no-self-compare
  if (result > MAX32 || result != result) return $sign * Infinity;
  return $sign * result;
};

var $$1E = _export;
var fround = mathFround;

// `Math.fround` method
// https://tc39.es/ecma262/#sec-math.fround
$$1E({ target: 'Math', stat: true }, { fround: fround });

var $$1F = _export;

var $hypot = Math.hypot;
var abs$4 = Math.abs;
var sqrt$2 = Math.sqrt;

// Chrome 77 bug
// https://bugs.chromium.org/p/v8/issues/detail?id=9546
var BUGGY = !!$hypot && $hypot(Infinity, NaN) !== Infinity;

// `Math.hypot` method
// https://tc39.es/ecma262/#sec-math.hypot
$$1F({ target: 'Math', stat: true, forced: BUGGY }, {
  hypot: function hypot(value1, value2) { // eslint-disable-line no-unused-vars
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
    return larg === Infinity ? Infinity : larg * sqrt$2(sum);
  }
});

var $$1G = _export;
var fails$D = fails;

var nativeImul = Math.imul;

var FORCED$g = fails$D(function () {
  return nativeImul(0xFFFFFFFF, 5) != -5 || nativeImul.length != 2;
});

// `Math.imul` method
// https://tc39.es/ecma262/#sec-math.imul
// some WebKit versions fails with big numbers, some has wrong arity
$$1G({ target: 'Math', stat: true, forced: FORCED$g }, {
  imul: function imul(x, y) {
    var UINT16 = 0xFFFF;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});

var $$1H = _export;

var log$6 = Math.log;
var LOG10E = Math.LOG10E;

// `Math.log10` method
// https://tc39.es/ecma262/#sec-math.log10
$$1H({ target: 'Math', stat: true }, {
  log10: function log10(x) {
    return log$6(x) * LOG10E;
  }
});

var $$1I = _export;
var log1p$1 = mathLog1p;

// `Math.log1p` method
// https://tc39.es/ecma262/#sec-math.log1p
$$1I({ target: 'Math', stat: true }, { log1p: log1p$1 });

var $$1J = _export;

var log$7 = Math.log;
var LN2$1 = Math.LN2;

// `Math.log2` method
// https://tc39.es/ecma262/#sec-math.log2
$$1J({ target: 'Math', stat: true }, {
  log2: function log2(x) {
    return log$7(x) / LN2$1;
  }
});

var $$1K = _export;
var sign$2 = mathSign;

// `Math.sign` method
// https://tc39.es/ecma262/#sec-math.sign
$$1K({ target: 'Math', stat: true }, {
  sign: sign$2
});

var $$1L = _export;
var fails$E = fails;
var expm1$2 = mathExpm1;

var abs$5 = Math.abs;
var exp$1 = Math.exp;
var E$1 = Math.E;

var FORCED$h = fails$E(function () {
  return Math.sinh(-2e-17) != -2e-17;
});

// `Math.sinh` method
// https://tc39.es/ecma262/#sec-math.sinh
// V8 near Chromium 38 has a problem with very small numbers
$$1L({ target: 'Math', stat: true, forced: FORCED$h }, {
  sinh: function sinh(x) {
    return abs$5(x = +x) < 1 ? (expm1$2(x) - expm1$2(-x)) / 2 : (exp$1(x - 1) - exp$1(-x - 1)) * (E$1 / 2);
  }
});

var $$1M = _export;
var expm1$3 = mathExpm1;

var exp$2 = Math.exp;

// `Math.tanh` method
// https://tc39.es/ecma262/#sec-math.tanh
$$1M({ target: 'Math', stat: true }, {
  tanh: function tanh(x) {
    var a = expm1$3(x = +x);
    var b = expm1$3(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp$2(x) + exp$2(-x));
  }
});

var setToStringTag$4 = setToStringTag;

// Math[@@toStringTag] property
// https://tc39.es/ecma262/#sec-math-@@tostringtag
setToStringTag$4(Math, 'Math', true);

var $$1N = _export;

var ceil$2 = Math.ceil;
var floor$5 = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
$$1N({ target: 'Math', stat: true }, {
  trunc: function trunc(it) {
    return (it > 0 ? floor$5 : ceil$2)(it);
  }
});

var $$1O = _export;

// `Date.now` method
// https://tc39.es/ecma262/#sec-date.now
$$1O({ target: 'Date', stat: true }, {
  now: function now() {
    return new Date().getTime();
  }
});

var $$1P = _export;
var fails$F = fails;
var toObject$l = toObject;
var toPrimitive$8 = toPrimitive;

var FORCED$i = fails$F(function () {
  return new Date(NaN).toJSON() !== null
    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
});

// `Date.prototype.toJSON` method
// https://tc39.es/ecma262/#sec-date.prototype.tojson
$$1P({ target: 'Date', proto: true, forced: FORCED$i }, {
  // eslint-disable-next-line no-unused-vars
  toJSON: function toJSON(key) {
    var O = toObject$l(this);
    var pv = toPrimitive$8(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});

var fails$G = fails;
var padStart = stringPad.start;

var abs$6 = Math.abs;
var DatePrototype = Date.prototype;
var getTime = DatePrototype.getTime;
var nativeDateToISOString = DatePrototype.toISOString;

// `Date.prototype.toISOString` method implementation
// https://tc39.es/ecma262/#sec-date.prototype.toisostring
// PhantomJS / old WebKit fails here:
var dateToIsoString = (fails$G(function () {
  return nativeDateToISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
}) || !fails$G(function () {
  nativeDateToISOString.call(new Date(NaN));
})) ? function toISOString() {
  if (!isFinite(getTime.call(this))) throw RangeError('Invalid time value');
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

var $$1Q = _export;
var toISOString = dateToIsoString;

// `Date.prototype.toISOString` method
// https://tc39.es/ecma262/#sec-date.prototype.toisostring
// PhantomJS / old WebKit has a broken implementations
$$1Q({ target: 'Date', proto: true, forced: Date.prototype.toISOString !== toISOString }, {
  toISOString: toISOString
});

var redefine$9 = redefine.exports;

var DatePrototype$1 = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING$1 = 'toString';
var nativeDateToString = DatePrototype$1[TO_STRING$1];
var getTime$1 = DatePrototype$1.getTime;

// `Date.prototype.toString` method
// https://tc39.es/ecma262/#sec-date.prototype.tostring
if (new Date(NaN) + '' != INVALID_DATE) {
  redefine$9(DatePrototype$1, TO_STRING$1, function toString() {
    var value = getTime$1.call(this);
    // eslint-disable-next-line no-self-compare
    return value === value ? nativeDateToString.call(this) : INVALID_DATE;
  });
}

var anObject$i = anObject;
var toPrimitive$9 = toPrimitive;

var dateToPrimitive = function (hint) {
  if (hint !== 'string' && hint !== 'number' && hint !== 'default') {
    throw TypeError('Incorrect hint');
  } return toPrimitive$9(anObject$i(this), hint !== 'number');
};

var createNonEnumerableProperty$b = createNonEnumerableProperty;
var dateToPrimitive$1 = dateToPrimitive;
var wellKnownSymbol$p = wellKnownSymbol;

var TO_PRIMITIVE$1 = wellKnownSymbol$p('toPrimitive');
var DatePrototype$2 = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
if (!(TO_PRIMITIVE$1 in DatePrototype$2)) {
  createNonEnumerableProperty$b(DatePrototype$2, TO_PRIMITIVE$1, dateToPrimitive$1);
}

var $$1R = _export;
var getBuiltIn$6 = getBuiltIn;
var fails$H = fails;

var $stringify$1 = getBuiltIn$6('JSON', 'stringify');
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

var FORCED$j = fails$H(function () {
  return $stringify$1('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify$1('\uDEAD') !== '"\\udead"';
});

if ($stringify$1) {
  // `JSON.stringify` method
  // https://tc39.es/ecma262/#sec-json.stringify
  // https://github.com/tc39/proposal-well-formed-stringify
  $$1R({ target: 'JSON', stat: true, forced: FORCED$j }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var result = $stringify$1.apply(null, arguments);
      return typeof result == 'string' ? result.replace(re, fix) : result;
    }
  });
}

var global$n = global$1;
var setToStringTag$5 = setToStringTag;

// JSON[@@toStringTag] property
// https://tc39.es/ecma262/#sec-json-@@tostringtag
setToStringTag$5(global$n.JSON, 'JSON', true);

var global$o = global$1;

var nativePromiseConstructor = global$o.Promise;

var redefine$a = redefine.exports;

var redefineAll = function (target, src, options) {
  for (var key in src) redefine$a(target, key, src[key], options);
  return target;
};

var anInstance = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
  } return it;
};

var userAgent$2 = engineUserAgent;

var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(userAgent$2);

var global$p = global$1;
var fails$I = fails;
var bind$5 = functionBindContext;
var html$2 = html;
var createElement$1 = documentCreateElement;
var IS_IOS = engineIsIos;
var IS_NODE$2 = engineIsNode;

var location = global$p.location;
var set$1 = global$p.setImmediate;
var clear = global$p.clearImmediate;
var process$1 = global$p.process;
var MessageChannel = global$p.MessageChannel;
var Dispatch = global$p.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;

var run = function (id) {
  // eslint-disable-next-line no-prototype-builtins
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
  global$p.postMessage(id + '', location.protocol + '//' + location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set$1 || !clear) {
  set$1 = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
    };
    defer(counter);
    return counter;
  };
  clear = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (IS_NODE$2) {
    defer = function (id) {
      process$1.nextTick(runner(id));
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
    channel.port1.onmessage = listener;
    defer = bind$5(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    global$p.addEventListener &&
    typeof postMessage == 'function' &&
    !global$p.importScripts &&
    location && location.protocol !== 'file:' &&
    !fails$I(post)
  ) {
    defer = post;
    global$p.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in createElement$1('script')) {
    defer = function (id) {
      html$2.appendChild(createElement$1('script'))[ONREADYSTATECHANGE] = function () {
        html$2.removeChild(this);
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

var task = {
  set: set$1,
  clear: clear
};

var userAgent$3 = engineUserAgent;

var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent$3);

var global$q = global$1;
var getOwnPropertyDescriptor$7 = objectGetOwnPropertyDescriptor.f;
var macrotask = task.set;
var IS_IOS$1 = engineIsIos;
var IS_WEBOS_WEBKIT = engineIsWebosWebkit;
var IS_NODE$3 = engineIsNode;

var MutationObserver = global$q.MutationObserver || global$q.WebKitMutationObserver;
var document$2 = global$q.document;
var process$2 = global$q.process;
var Promise = global$q.Promise;
// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
var queueMicrotaskDescriptor = getOwnPropertyDescriptor$7(global$q, 'queueMicrotask');
var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

var flush, head, last, notify, toggle, node, promise, then;

// modern engines have queueMicrotask method
if (!queueMicrotask) {
  flush = function () {
    var parent, fn;
    if (IS_NODE$3 && (parent = process$2.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (error) {
        if (head) notify();
        else last = undefined;
        throw error;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
  if (!IS_IOS$1 && !IS_NODE$3 && !IS_WEBOS_WEBKIT && MutationObserver && document$2) {
    toggle = true;
    node = document$2.createTextNode('');
    new MutationObserver(flush).observe(node, { characterData: true });
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise.resolve(undefined);
    then = promise.then;
    notify = function () {
      then.call(promise, flush);
    };
  // Node.js without promises
  } else if (IS_NODE$3) {
    notify = function () {
      process$2.nextTick(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global$q, flush);
    };
  }
}

var microtask = queueMicrotask || function (fn) {
  var task = { fn: fn, next: undefined };
  if (last) last.next = task;
  if (!head) {
    head = task;
    notify();
  } last = task;
};

var newPromiseCapability = {};

var aFunction$b = aFunction$1;

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction$b(resolve);
  this.reject = aFunction$b(reject);
};

// 25.4.1.5 NewPromiseCapability(C)
newPromiseCapability.f = function (C) {
  return new PromiseCapability(C);
};

var anObject$j = anObject;
var isObject$o = isObject;
var newPromiseCapability$1 = newPromiseCapability;

var promiseResolve = function (C, x) {
  anObject$j(C);
  if (isObject$o(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability$1.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var global$r = global$1;

var hostReportErrors = function (a, b) {
  var console = global$r.console;
  if (console && console.error) {
    arguments.length === 1 ? console.error(a) : console.error(a, b);
  }
};

var perform = function (exec) {
  try {
    return { error: false, value: exec() };
  } catch (error) {
    return { error: true, value: error };
  }
};

var $$1S = _export;
var global$s = global$1;
var getBuiltIn$7 = getBuiltIn;
var NativePromise = nativePromiseConstructor;
var redefine$b = redefine.exports;
var redefineAll$1 = redefineAll;
var setToStringTag$6 = setToStringTag;
var setSpecies$3 = setSpecies;
var isObject$p = isObject;
var aFunction$c = aFunction$1;
var anInstance$1 = anInstance;
var inspectSource$3 = inspectSource;
var iterate$3 = iterate;
var checkCorrectnessOfIteration$2 = checkCorrectnessOfIteration;
var speciesConstructor$3 = speciesConstructor;
var task$1 = task.set;
var microtask$1 = microtask;
var promiseResolve$1 = promiseResolve;
var hostReportErrors$1 = hostReportErrors;
var newPromiseCapabilityModule = newPromiseCapability;
var perform$1 = perform;
var InternalStateModule$5 = internalState;
var isForced$4 = isForced_1;
var wellKnownSymbol$q = wellKnownSymbol;
var IS_NODE$4 = engineIsNode;
var V8_VERSION$2 = engineV8Version;

var SPECIES$6 = wellKnownSymbol$q('species');
var PROMISE = 'Promise';
var getInternalState$6 = InternalStateModule$5.get;
var setInternalState$5 = InternalStateModule$5.set;
var getInternalPromiseState = InternalStateModule$5.getterFor(PROMISE);
var PromiseConstructor = NativePromise;
var TypeError$1 = global$s.TypeError;
var document$3 = global$s.document;
var process$3 = global$s.process;
var $fetch = getBuiltIn$7('fetch');
var newPromiseCapability$2 = newPromiseCapabilityModule.f;
var newGenericPromiseCapability = newPromiseCapability$2;
var DISPATCH_EVENT = !!(document$3 && document$3.createEvent && global$s.dispatchEvent);
var NATIVE_REJECTION_EVENT = typeof PromiseRejectionEvent == 'function';
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

var FORCED$k = isForced$4(PROMISE, function () {
  var GLOBAL_CORE_JS_PROMISE = inspectSource$3(PromiseConstructor) !== String(PromiseConstructor);
  if (!GLOBAL_CORE_JS_PROMISE) {
    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
    // We can't detect it synchronously, so just check versions
    if (V8_VERSION$2 === 66) return true;
    // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    if (!IS_NODE$4 && !NATIVE_REJECTION_EVENT) return true;
  }
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (V8_VERSION$2 >= 51 && /native code/.test(PromiseConstructor)) return false;
  // Detect correctness of subclassing with @@species support
  var promise = PromiseConstructor.resolve(1);
  var FakePromise = function (exec) {
    exec(function () { /* empty */ }, function () { /* empty */ });
  };
  var constructor = promise.constructor = {};
  constructor[SPECIES$6] = FakePromise;
  return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
});

var INCORRECT_ITERATION$1 = FORCED$k || !checkCorrectnessOfIteration$2(function (iterable) {
  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
});

// helpers
var isThenable = function (it) {
  var then;
  return isObject$p(it) && typeof (then = it.then) == 'function' ? then : false;
};

var notify$1 = function (state, isReject) {
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
    event = document$3.createEvent('Event');
    event.promise = promise;
    event.reason = reason;
    event.initEvent(name, false, true);
    global$s.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (!NATIVE_REJECTION_EVENT && (handler = global$s['on' + name])) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors$1('Unhandled promise rejection', reason);
};

var onUnhandled = function (state) {
  task$1.call(global$s, function () {
    var promise = state.facade;
    var value = state.value;
    var IS_UNHANDLED = isUnhandled(state);
    var result;
    if (IS_UNHANDLED) {
      result = perform$1(function () {
        if (IS_NODE$4) {
          process$3.emit('unhandledRejection', value, promise);
        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      state.rejection = IS_NODE$4 || isUnhandled(state) ? UNHANDLED : HANDLED;
      if (result.error) throw result.value;
    }
  });
};

var isUnhandled = function (state) {
  return state.rejection !== HANDLED && !state.parent;
};

var onHandleUnhandled = function (state) {
  task$1.call(global$s, function () {
    var promise = state.facade;
    if (IS_NODE$4) {
      process$3.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind$6 = function (fn, state, unwrap) {
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
  notify$1(state, true);
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
            bind$6(internalResolve, wrapper, state),
            bind$6(internalReject, wrapper, state)
          );
        } catch (error) {
          internalReject(wrapper, error, state);
        }
      });
    } else {
      state.value = value;
      state.state = FULFILLED;
      notify$1(state, false);
    }
  } catch (error) {
    internalReject({ done: false }, error, state);
  }
};

// constructor polyfill
if (FORCED$k) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance$1(this, PromiseConstructor, PROMISE);
    aFunction$c(executor);
    Internal.call(this);
    var state = getInternalState$6(this);
    try {
      executor(bind$6(internalResolve, state), bind$6(internalReject, state));
    } catch (error) {
      internalReject(state, error);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    setInternalState$5(this, {
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
  Internal.prototype = redefineAll$1(PromiseConstructor.prototype, {
    // `Promise.prototype.then` method
    // https://tc39.es/ecma262/#sec-promise.prototype.then
    then: function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability$2(speciesConstructor$3(this, PromiseConstructor));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = IS_NODE$4 ? process$3.domain : undefined;
      state.parent = true;
      state.reactions.push(reaction);
      if (state.state != PENDING) notify$1(state, false);
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
    var state = getInternalState$6(promise);
    this.promise = promise;
    this.resolve = bind$6(internalResolve, state);
    this.reject = bind$6(internalReject, state);
  };
  newPromiseCapabilityModule.f = newPromiseCapability$2 = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  if (typeof NativePromise == 'function') {
    nativeThen = NativePromise.prototype.then;

    // wrap native Promise#then for native async functions
    redefine$b(NativePromise.prototype, 'then', function then(onFulfilled, onRejected) {
      var that = this;
      return new PromiseConstructor(function (resolve, reject) {
        nativeThen.call(that, resolve, reject);
      }).then(onFulfilled, onRejected);
    // https://github.com/zloirock/core-js/issues/640
    }, { unsafe: true });

    // wrap fetch result
    if (typeof $fetch == 'function') $$1S({ global: true, enumerable: true, forced: true }, {
      // eslint-disable-next-line no-unused-vars
      fetch: function fetch(input /* , init */) {
        return promiseResolve$1(PromiseConstructor, $fetch.apply(global$s, arguments));
      }
    });
  }
}

$$1S({ global: true, wrap: true, forced: FORCED$k }, {
  Promise: PromiseConstructor
});

setToStringTag$6(PromiseConstructor, PROMISE, false);
setSpecies$3(PROMISE);

PromiseWrapper = getBuiltIn$7(PROMISE);

// statics
$$1S({ target: PROMISE, stat: true, forced: FORCED$k }, {
  // `Promise.reject` method
  // https://tc39.es/ecma262/#sec-promise.reject
  reject: function reject(r) {
    var capability = newPromiseCapability$2(this);
    capability.reject.call(undefined, r);
    return capability.promise;
  }
});

$$1S({ target: PROMISE, stat: true, forced: FORCED$k }, {
  // `Promise.resolve` method
  // https://tc39.es/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve$1(this, x);
  }
});

$$1S({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION$1 }, {
  // `Promise.all` method
  // https://tc39.es/ecma262/#sec-promise.all
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability$2(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$1(function () {
      var $promiseResolve = aFunction$c(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$3(iterable, function (promise) {
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
    var capability = newPromiseCapability$2(C);
    var reject = capability.reject;
    var result = perform$1(function () {
      var $promiseResolve = aFunction$c(C.resolve);
      iterate$3(iterable, function (promise) {
        $promiseResolve.call(C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$1T = _export;
var aFunction$d = aFunction$1;
var newPromiseCapabilityModule$1 = newPromiseCapability;
var perform$2 = perform;
var iterate$4 = iterate;

// `Promise.allSettled` method
// https://tc39.es/ecma262/#sec-promise.allsettled
$$1T({ target: 'Promise', stat: true }, {
  allSettled: function allSettled(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$1.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$2(function () {
      var promiseResolve = aFunction$d(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$4(iterable, function (promise) {
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

var $$1U = _export;
var aFunction$e = aFunction$1;
var getBuiltIn$8 = getBuiltIn;
var newPromiseCapabilityModule$2 = newPromiseCapability;
var perform$3 = perform;
var iterate$5 = iterate;

var PROMISE_ANY_ERROR = 'No one promise resolved';

// `Promise.any` method
// https://tc39.es/ecma262/#sec-promise.any
$$1U({ target: 'Promise', stat: true }, {
  any: function any(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$2.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$3(function () {
      var promiseResolve = aFunction$e(C.resolve);
      var errors = [];
      var counter = 0;
      var remaining = 1;
      var alreadyResolved = false;
      iterate$5(iterable, function (promise) {
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
          --remaining || reject(new (getBuiltIn$8('AggregateError'))(errors, PROMISE_ANY_ERROR));
        });
      });
      --remaining || reject(new (getBuiltIn$8('AggregateError'))(errors, PROMISE_ANY_ERROR));
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$1V = _export;
var NativePromise$1 = nativePromiseConstructor;
var fails$J = fails;
var getBuiltIn$9 = getBuiltIn;
var speciesConstructor$4 = speciesConstructor;
var promiseResolve$2 = promiseResolve;
var redefine$c = redefine.exports;

// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
var NON_GENERIC = !!NativePromise$1 && fails$J(function () {
  NativePromise$1.prototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
});

// `Promise.prototype.finally` method
// https://tc39.es/ecma262/#sec-promise.prototype.finally
$$1V({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
  'finally': function (onFinally) {
    var C = speciesConstructor$4(this, getBuiltIn$9('Promise'));
    var isFunction = typeof onFinally == 'function';
    return this.then(
      isFunction ? function (x) {
        return promiseResolve$2(C, onFinally()).then(function () { return x; });
      } : onFinally,
      isFunction ? function (e) {
        return promiseResolve$2(C, onFinally()).then(function () { throw e; });
      } : onFinally
    );
  }
});

// patch native Promise.prototype for native async functions
if (typeof NativePromise$1 == 'function' && !NativePromise$1.prototype['finally']) {
  redefine$c(NativePromise$1.prototype, 'finally', getBuiltIn$9('Promise').prototype['finally']);
}

var $$1W = _export;
var global$t = global$1;
var isForced$5 = isForced_1;
var redefine$d = redefine.exports;
var InternalMetadataModule = internalMetadata.exports;
var iterate$6 = iterate;
var anInstance$2 = anInstance;
var isObject$q = isObject;
var fails$K = fails;
var checkCorrectnessOfIteration$3 = checkCorrectnessOfIteration;
var setToStringTag$7 = setToStringTag;
var inheritIfRequired$3 = inheritIfRequired;

var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
  var ADDER = IS_MAP ? 'set' : 'add';
  var NativeConstructor = global$t[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var exported = {};

  var fixMethod = function (KEY) {
    var nativeMethod = NativePrototype[KEY];
    redefine$d(NativePrototype, KEY,
      KEY == 'add' ? function add(value) {
        nativeMethod.call(this, value === 0 ? 0 : value);
        return this;
      } : KEY == 'delete' ? function (key) {
        return IS_WEAK && !isObject$q(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'get' ? function get(key) {
        return IS_WEAK && !isObject$q(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'has' ? function has(key) {
        return IS_WEAK && !isObject$q(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        nativeMethod.call(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  // eslint-disable-next-line max-len
  if (isForced$5(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails$K(function () {
    new NativeConstructor().entries().next();
  })))) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
    InternalMetadataModule.REQUIRED = true;
  } else if (isForced$5(CONSTRUCTOR_NAME, true)) {
    var instance = new Constructor();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails$K(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration$3(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails$K(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance$2(dummy, Constructor, CONSTRUCTOR_NAME);
        var that = inheritIfRequired$3(new NativeConstructor(), dummy, Constructor);
        if (iterable != undefined) iterate$6(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
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
  $$1W({ global: true, forced: Constructor != NativeConstructor }, exported);

  setToStringTag$7(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};

var defineProperty$a = objectDefineProperty.f;
var create$5 = objectCreate;
var redefineAll$2 = redefineAll;
var bind$7 = functionBindContext;
var anInstance$3 = anInstance;
var iterate$7 = iterate;
var defineIterator$3 = defineIterator;
var setSpecies$4 = setSpecies;
var DESCRIPTORS$p = descriptors;
var fastKey$1 = internalMetadata.exports.fastKey;
var InternalStateModule$6 = internalState;

var setInternalState$6 = InternalStateModule$6.set;
var internalStateGetterFor = InternalStateModule$6.getterFor;

var collectionStrong = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance$3(that, C, CONSTRUCTOR_NAME);
      setInternalState$6(that, {
        type: CONSTRUCTOR_NAME,
        index: create$5(null),
        first: undefined,
        last: undefined,
        size: 0
      });
      if (!DESCRIPTORS$p) that.size = 0;
      if (iterable != undefined) iterate$7(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

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
          index: index = fastKey$1(key, true),
          key: key,
          value: value,
          previous: previous = state.last,
          next: undefined,
          removed: false
        };
        if (!state.first) state.first = entry;
        if (previous) previous.next = entry;
        if (DESCRIPTORS$p) state.size++;
        else that.size++;
        // add to index
        if (index !== 'F') state.index[index] = entry;
      } return that;
    };

    var getEntry = function (that, key) {
      var state = getInternalState(that);
      // fast case
      var index = fastKey$1(key);
      var entry;
      if (index !== 'F') return state.index[index];
      // frozen object case
      for (entry = state.first; entry; entry = entry.next) {
        if (entry.key == key) return entry;
      }
    };

    redefineAll$2(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
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
        if (DESCRIPTORS$p) state.size = 0;
        else that.size = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
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
          if (DESCRIPTORS$p) state.size--;
          else that.size--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind$7(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.next : state.first) {
          boundFunction(entry.value, entry.key, this);
          // revert to the last existing entry
          while (entry && entry.removed) entry = entry.previous;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(this, key);
      }
    });

    redefineAll$2(C.prototype, IS_MAP ? {
      // 23.1.3.6 Map.prototype.get(key)
      get: function get(key) {
        var entry = getEntry(this, key);
        return entry && entry.value;
      },
      // 23.1.3.9 Map.prototype.set(key, value)
      set: function set(key, value) {
        return define(this, key === 0 ? 0 : key, value);
      }
    } : {
      // 23.2.3.1 Set.prototype.add(value)
      add: function add(value) {
        return define(this, value = value === 0 ? 0 : value, value);
      }
    });
    if (DESCRIPTORS$p) defineProperty$a(C.prototype, 'size', {
      get: function () {
        return getInternalState(this).size;
      }
    });
    return C;
  },
  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    defineIterator$3(C, CONSTRUCTOR_NAME, function (iterated, kind) {
      setInternalState$6(this, {
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

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies$4(CONSTRUCTOR_NAME);
  }
};

var collection$1 = collection;
var collectionStrong$1 = collectionStrong;

// `Map` constructor
// https://tc39.es/ecma262/#sec-map-objects
var es_map = collection$1('Map', function (init) {
  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong$1);

var collection$2 = collection;
var collectionStrong$2 = collectionStrong;

// `Set` constructor
// https://tc39.es/ecma262/#sec-set-objects
var es_set = collection$2('Set', function (init) {
  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong$2);

var es_weakMap = {exports: {}};

var redefineAll$3 = redefineAll;
var getWeakData$1 = internalMetadata.exports.getWeakData;
var anObject$k = anObject;
var isObject$r = isObject;
var anInstance$4 = anInstance;
var iterate$8 = iterate;
var ArrayIterationModule = arrayIteration;
var $has = has;
var InternalStateModule$7 = internalState;

var setInternalState$7 = InternalStateModule$7.set;
var internalStateGetterFor$1 = InternalStateModule$7.getterFor;
var find = ArrayIterationModule.find;
var findIndex = ArrayIterationModule.findIndex;
var id$2 = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function (store) {
  return store.frozen || (store.frozen = new UncaughtFrozenStore());
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
    if (~index) this.entries.splice(index, 1);
    return !!~index;
  }
};

var collectionWeak = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance$4(that, C, CONSTRUCTOR_NAME);
      setInternalState$7(that, {
        type: CONSTRUCTOR_NAME,
        id: id$2++,
        frozen: undefined
      });
      if (iterable != undefined) iterate$8(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var getInternalState = internalStateGetterFor$1(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var data = getWeakData$1(anObject$k(key), true);
      if (data === true) uncaughtFrozenStore(state).set(key, value);
      else data[state.id] = value;
      return that;
    };

    redefineAll$3(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function (key) {
        var state = getInternalState(this);
        if (!isObject$r(key)) return false;
        var data = getWeakData$1(key);
        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
        return data && $has(data, state.id) && delete data[state.id];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key) {
        var state = getInternalState(this);
        if (!isObject$r(key)) return false;
        var data = getWeakData$1(key);
        if (data === true) return uncaughtFrozenStore(state).has(key);
        return data && $has(data, state.id);
      }
    });

    redefineAll$3(C.prototype, IS_MAP ? {
      // 23.3.3.3 WeakMap.prototype.get(key)
      get: function get(key) {
        var state = getInternalState(this);
        if (isObject$r(key)) {
          var data = getWeakData$1(key);
          if (data === true) return uncaughtFrozenStore(state).get(key);
          return data ? data[state.id] : undefined;
        }
      },
      // 23.3.3.5 WeakMap.prototype.set(key, value)
      set: function set(key, value) {
        return define(this, key, value);
      }
    } : {
      // 23.4.3.1 WeakSet.prototype.add(value)
      add: function add(value) {
        return define(this, value, true);
      }
    });

    return C;
  }
};

var global$u = global$1;
var redefineAll$4 = redefineAll;
var InternalMetadataModule$1 = internalMetadata.exports;
var collection$3 = collection;
var collectionWeak$1 = collectionWeak;
var isObject$s = isObject;
var enforceIternalState = internalState.enforce;
var NATIVE_WEAK_MAP$1 = nativeWeakMap;

var IS_IE11 = !global$u.ActiveXObject && 'ActiveXObject' in global$u;
var isExtensible$1 = Object.isExtensible;
var InternalWeakMap;

var wrapper = function (init) {
  return function WeakMap() {
    return init(this, arguments.length ? arguments[0] : undefined);
  };
};

// `WeakMap` constructor
// https://tc39.es/ecma262/#sec-weakmap-constructor
var $WeakMap = es_weakMap.exports = collection$3('WeakMap', wrapper, collectionWeak$1);

// IE11 WeakMap frozen keys fix
// We can't use feature detection because it crash some old IE builds
// https://github.com/zloirock/core-js/issues/485
if (NATIVE_WEAK_MAP$1 && IS_IE11) {
  InternalWeakMap = collectionWeak$1.getConstructor(wrapper, 'WeakMap', true);
  InternalMetadataModule$1.REQUIRED = true;
  var WeakMapPrototype = $WeakMap.prototype;
  var nativeDelete = WeakMapPrototype['delete'];
  var nativeHas = WeakMapPrototype.has;
  var nativeGet = WeakMapPrototype.get;
  var nativeSet = WeakMapPrototype.set;
  redefineAll$4(WeakMapPrototype, {
    'delete': function (key) {
      if (isObject$s(key) && !isExtensible$1(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeDelete.call(this, key) || state.frozen['delete'](key);
      } return nativeDelete.call(this, key);
    },
    has: function has(key) {
      if (isObject$s(key) && !isExtensible$1(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas.call(this, key) || state.frozen.has(key);
      } return nativeHas.call(this, key);
    },
    get: function get(key) {
      if (isObject$s(key) && !isExtensible$1(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas.call(this, key) ? nativeGet.call(this, key) : state.frozen.get(key);
      } return nativeGet.call(this, key);
    },
    set: function set(key, value) {
      if (isObject$s(key) && !isExtensible$1(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        nativeHas.call(this, key) ? nativeSet.call(this, key, value) : state.frozen.set(key, value);
      } else nativeSet.call(this, key, value);
      return this;
    }
  });
}

var collection$4 = collection;
var collectionWeak$2 = collectionWeak;

// `WeakSet` constructor
// https://tc39.es/ecma262/#sec-weakset-constructor
collection$4('WeakSet', function (init) {
  return function WeakSet() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionWeak$2);

var arrayBufferNative = typeof ArrayBuffer !== 'undefined' && typeof DataView !== 'undefined';

var toInteger$a = toInteger;
var toLength$n = toLength;

// `ToIndex` abstract operation
// https://tc39.es/ecma262/#sec-toindex
var toIndex = function (it) {
  if (it === undefined) return 0;
  var number = toInteger$a(it);
  var length = toLength$n(number);
  if (number !== length) throw RangeError('Wrong length or index');
  return length;
};

// IEEE754 conversions based on https://github.com/feross/ieee754
// eslint-disable-next-line no-shadow-restricted-names
var Infinity$1 = 1 / 0;
var abs$7 = Math.abs;
var pow$3 = Math.pow;
var floor$6 = Math.floor;
var log$8 = Math.log;
var LN2$2 = Math.LN2;

var pack = function (number, mantissaLength, bytes) {
  var buffer = new Array(bytes);
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var rt = mantissaLength === 23 ? pow$3(2, -24) - pow$3(2, -77) : 0;
  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
  var index = 0;
  var exponent, mantissa, c;
  number = abs$7(number);
  // eslint-disable-next-line no-self-compare
  if (number != number || number === Infinity$1) {
    // eslint-disable-next-line no-self-compare
    mantissa = number != number ? 1 : 0;
    exponent = eMax;
  } else {
    exponent = floor$6(log$8(number) / LN2$2);
    if (number * (c = pow$3(2, -exponent)) < 1) {
      exponent--;
      c *= 2;
    }
    if (exponent + eBias >= 1) {
      number += rt / c;
    } else {
      number += rt * pow$3(2, 1 - eBias);
    }
    if (number * c >= 2) {
      exponent++;
      c /= 2;
    }
    if (exponent + eBias >= eMax) {
      mantissa = 0;
      exponent = eMax;
    } else if (exponent + eBias >= 1) {
      mantissa = (number * c - 1) * pow$3(2, mantissaLength);
      exponent = exponent + eBias;
    } else {
      mantissa = number * pow$3(2, eBias - 1) * pow$3(2, mantissaLength);
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
    return mantissa ? NaN : sign ? -Infinity$1 : Infinity$1;
  } else {
    mantissa = mantissa + pow$3(2, mantissaLength);
    exponent = exponent - eBias;
  } return (sign ? -1 : 1) * mantissa * pow$3(2, exponent - mantissaLength);
};

var ieee754 = {
  pack: pack,
  unpack: unpack
};

var global$v = global$1;
var DESCRIPTORS$q = descriptors;
var NATIVE_ARRAY_BUFFER = arrayBufferNative;
var createNonEnumerableProperty$c = createNonEnumerableProperty;
var redefineAll$5 = redefineAll;
var fails$L = fails;
var anInstance$5 = anInstance;
var toInteger$b = toInteger;
var toLength$o = toLength;
var toIndex$1 = toIndex;
var IEEE754 = ieee754;
var getPrototypeOf$6 = objectGetPrototypeOf;
var setPrototypeOf$4 = objectSetPrototypeOf;
var getOwnPropertyNames$2 = objectGetOwnPropertyNames.f;
var defineProperty$b = objectDefineProperty.f;
var arrayFill$1 = arrayFill;
var setToStringTag$8 = setToStringTag;
var InternalStateModule$8 = internalState;

var getInternalState$7 = InternalStateModule$8.get;
var setInternalState$8 = InternalStateModule$8.set;
var ARRAY_BUFFER = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE$2 = 'prototype';
var WRONG_LENGTH = 'Wrong length';
var WRONG_INDEX = 'Wrong index';
var NativeArrayBuffer = global$v[ARRAY_BUFFER];
var $ArrayBuffer = NativeArrayBuffer;
var $DataView = global$v[DATA_VIEW];
var $DataViewPrototype = $DataView && $DataView[PROTOTYPE$2];
var ObjectPrototype$2 = Object.prototype;
var RangeError$1 = global$v.RangeError;

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

var addGetter = function (Constructor, key) {
  defineProperty$b(Constructor[PROTOTYPE$2], key, { get: function () { return getInternalState$7(this)[key]; } });
};

var get$1 = function (view, count, index, isLittleEndian) {
  var intIndex = toIndex$1(index);
  var store = getInternalState$7(view);
  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
  var bytes = getInternalState$7(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = bytes.slice(start, start + count);
  return isLittleEndian ? pack : pack.reverse();
};

var set$2 = function (view, count, index, conversion, value, isLittleEndian) {
  var intIndex = toIndex$1(index);
  var store = getInternalState$7(view);
  if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
  var bytes = getInternalState$7(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = conversion(+value);
  for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
};

if (!NATIVE_ARRAY_BUFFER) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance$5(this, $ArrayBuffer, ARRAY_BUFFER);
    var byteLength = toIndex$1(length);
    setInternalState$8(this, {
      bytes: arrayFill$1.call(new Array(byteLength), 0),
      byteLength: byteLength
    });
    if (!DESCRIPTORS$q) this.byteLength = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance$5(this, $DataView, DATA_VIEW);
    anInstance$5(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = getInternalState$7(buffer).byteLength;
    var offset = toInteger$b(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError$1('Wrong offset');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength$o(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError$1(WRONG_LENGTH);
    setInternalState$8(this, {
      buffer: buffer,
      byteLength: byteLength,
      byteOffset: offset
    });
    if (!DESCRIPTORS$q) {
      this.buffer = buffer;
      this.byteLength = byteLength;
      this.byteOffset = offset;
    }
  };

  if (DESCRIPTORS$q) {
    addGetter($ArrayBuffer, 'byteLength');
    addGetter($DataView, 'buffer');
    addGetter($DataView, 'byteLength');
    addGetter($DataView, 'byteOffset');
  }

  redefineAll$5($DataView[PROTOTYPE$2], {
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
  if (!fails$L(function () {
    NativeArrayBuffer(1);
  }) || !fails$L(function () {
    new NativeArrayBuffer(-1); // eslint-disable-line no-new
  }) || fails$L(function () {
    new NativeArrayBuffer(); // eslint-disable-line no-new
    new NativeArrayBuffer(1.5); // eslint-disable-line no-new
    new NativeArrayBuffer(NaN); // eslint-disable-line no-new
    return NativeArrayBuffer.name != ARRAY_BUFFER;
  })) {
    $ArrayBuffer = function ArrayBuffer(length) {
      anInstance$5(this, $ArrayBuffer);
      return new NativeArrayBuffer(toIndex$1(length));
    };
    var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE$2] = NativeArrayBuffer[PROTOTYPE$2];
    for (var keys$3 = getOwnPropertyNames$2(NativeArrayBuffer), j$1 = 0, key$1; keys$3.length > j$1;) {
      if (!((key$1 = keys$3[j$1++]) in $ArrayBuffer)) {
        createNonEnumerableProperty$c($ArrayBuffer, key$1, NativeArrayBuffer[key$1]);
      }
    }
    ArrayBufferPrototype.constructor = $ArrayBuffer;
  }

  // WebKit bug - the same parent prototype for typed arrays and data view
  if (setPrototypeOf$4 && getPrototypeOf$6($DataViewPrototype) !== ObjectPrototype$2) {
    setPrototypeOf$4($DataViewPrototype, ObjectPrototype$2);
  }

  // iOS Safari 7.x bug
  var testView = new $DataView(new $ArrayBuffer(2));
  var nativeSetInt8 = $DataViewPrototype.setInt8;
  testView.setInt8(0, 2147483648);
  testView.setInt8(1, 2147483649);
  if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll$5($DataViewPrototype, {
    setInt8: function setInt8(byteOffset, value) {
      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, { unsafe: true });
}

setToStringTag$8($ArrayBuffer, ARRAY_BUFFER);
setToStringTag$8($DataView, DATA_VIEW);

var arrayBuffer = {
  ArrayBuffer: $ArrayBuffer,
  DataView: $DataView
};

var $$1X = _export;
var global$w = global$1;
var arrayBufferModule = arrayBuffer;
var setSpecies$5 = setSpecies;

var ARRAY_BUFFER$1 = 'ArrayBuffer';
var ArrayBuffer$1 = arrayBufferModule[ARRAY_BUFFER$1];
var NativeArrayBuffer$1 = global$w[ARRAY_BUFFER$1];

// `ArrayBuffer` constructor
// https://tc39.es/ecma262/#sec-arraybuffer-constructor
$$1X({ global: true, forced: NativeArrayBuffer$1 !== ArrayBuffer$1 }, {
  ArrayBuffer: ArrayBuffer$1
});

setSpecies$5(ARRAY_BUFFER$1);

var NATIVE_ARRAY_BUFFER$1 = arrayBufferNative;
var DESCRIPTORS$r = descriptors;
var global$x = global$1;
var isObject$t = isObject;
var has$g = has;
var classof$b = classof$2;
var createNonEnumerableProperty$d = createNonEnumerableProperty;
var redefine$e = redefine.exports;
var defineProperty$c = objectDefineProperty.f;
var getPrototypeOf$7 = objectGetPrototypeOf;
var setPrototypeOf$5 = objectSetPrototypeOf;
var wellKnownSymbol$r = wellKnownSymbol;
var uid$5 = uid;

var Int8Array$1 = global$x.Int8Array;
var Int8ArrayPrototype = Int8Array$1 && Int8Array$1.prototype;
var Uint8ClampedArray = global$x.Uint8ClampedArray;
var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
var TypedArray = Int8Array$1 && getPrototypeOf$7(Int8Array$1);
var TypedArrayPrototype = Int8ArrayPrototype && getPrototypeOf$7(Int8ArrayPrototype);
var ObjectPrototype$3 = Object.prototype;
var isPrototypeOf = ObjectPrototype$3.isPrototypeOf;

var TO_STRING_TAG$3 = wellKnownSymbol$r('toStringTag');
var TYPED_ARRAY_TAG = uid$5('TYPED_ARRAY_TAG');
// Fixing native typed arrays in Opera Presto crashes the browser, see #595
var NATIVE_ARRAY_BUFFER_VIEWS = NATIVE_ARRAY_BUFFER$1 && !!setPrototypeOf$5 && classof$b(global$x.opera) !== 'Opera';
var TYPED_ARRAY_TAG_REQIRED = false;
var NAME$1;

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
  if (!isObject$t(it)) return false;
  var klass = classof$b(it);
  return klass === 'DataView'
    || has$g(TypedArrayConstructorsList, klass)
    || has$g(BigIntArrayConstructorsList, klass);
};

var isTypedArray = function (it) {
  if (!isObject$t(it)) return false;
  var klass = classof$b(it);
  return has$g(TypedArrayConstructorsList, klass)
    || has$g(BigIntArrayConstructorsList, klass);
};

var aTypedArray = function (it) {
  if (isTypedArray(it)) return it;
  throw TypeError('Target is not a typed array');
};

var aTypedArrayConstructor = function (C) {
  if (setPrototypeOf$5) {
    if (isPrototypeOf.call(TypedArray, C)) return C;
  } else for (var ARRAY in TypedArrayConstructorsList) if (has$g(TypedArrayConstructorsList, NAME$1)) {
    var TypedArrayConstructor = global$x[ARRAY];
    if (TypedArrayConstructor && (C === TypedArrayConstructor || isPrototypeOf.call(TypedArrayConstructor, C))) {
      return C;
    }
  } throw TypeError('Target is not a typed array constructor');
};

var exportTypedArrayMethod = function (KEY, property, forced) {
  if (!DESCRIPTORS$r) return;
  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
    var TypedArrayConstructor = global$x[ARRAY];
    if (TypedArrayConstructor && has$g(TypedArrayConstructor.prototype, KEY)) {
      delete TypedArrayConstructor.prototype[KEY];
    }
  }
  if (!TypedArrayPrototype[KEY] || forced) {
    redefine$e(TypedArrayPrototype, KEY, forced ? property
      : NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property);
  }
};

var exportTypedArrayStaticMethod = function (KEY, property, forced) {
  var ARRAY, TypedArrayConstructor;
  if (!DESCRIPTORS$r) return;
  if (setPrototypeOf$5) {
    if (forced) for (ARRAY in TypedArrayConstructorsList) {
      TypedArrayConstructor = global$x[ARRAY];
      if (TypedArrayConstructor && has$g(TypedArrayConstructor, KEY)) {
        delete TypedArrayConstructor[KEY];
      }
    }
    if (!TypedArray[KEY] || forced) {
      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
      try {
        return redefine$e(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && Int8Array$1[KEY] || property);
      } catch (error) { /* empty */ }
    } else return;
  }
  for (ARRAY in TypedArrayConstructorsList) {
    TypedArrayConstructor = global$x[ARRAY];
    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
      redefine$e(TypedArrayConstructor, KEY, property);
    }
  }
};

for (NAME$1 in TypedArrayConstructorsList) {
  if (!global$x[NAME$1]) NATIVE_ARRAY_BUFFER_VIEWS = false;
}

// WebKit bug - typed arrays constructors prototype is Object.prototype
if (!NATIVE_ARRAY_BUFFER_VIEWS || typeof TypedArray != 'function' || TypedArray === Function.prototype) {
  // eslint-disable-next-line no-shadow
  TypedArray = function TypedArray() {
    throw TypeError('Incorrect invocation');
  };
  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME$1 in TypedArrayConstructorsList) {
    if (global$x[NAME$1]) setPrototypeOf$5(global$x[NAME$1], TypedArray);
  }
}

if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype$3) {
  TypedArrayPrototype = TypedArray.prototype;
  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME$1 in TypedArrayConstructorsList) {
    if (global$x[NAME$1]) setPrototypeOf$5(global$x[NAME$1].prototype, TypedArrayPrototype);
  }
}

// WebKit bug - one more object in Uint8ClampedArray prototype chain
if (NATIVE_ARRAY_BUFFER_VIEWS && getPrototypeOf$7(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
  setPrototypeOf$5(Uint8ClampedArrayPrototype, TypedArrayPrototype);
}

if (DESCRIPTORS$r && !has$g(TypedArrayPrototype, TO_STRING_TAG$3)) {
  TYPED_ARRAY_TAG_REQIRED = true;
  defineProperty$c(TypedArrayPrototype, TO_STRING_TAG$3, { get: function () {
    return isObject$t(this) ? this[TYPED_ARRAY_TAG] : undefined;
  } });
  for (NAME$1 in TypedArrayConstructorsList) if (global$x[NAME$1]) {
    createNonEnumerableProperty$d(global$x[NAME$1], TYPED_ARRAY_TAG, NAME$1);
  }
}

var arrayBufferViewCore = {
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG,
  aTypedArray: aTypedArray,
  aTypedArrayConstructor: aTypedArrayConstructor,
  exportTypedArrayMethod: exportTypedArrayMethod,
  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
  isView: isView,
  isTypedArray: isTypedArray,
  TypedArray: TypedArray,
  TypedArrayPrototype: TypedArrayPrototype
};

var $$1Y = _export;
var ArrayBufferViewCore = arrayBufferViewCore;

var NATIVE_ARRAY_BUFFER_VIEWS$1 = ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

// `ArrayBuffer.isView` method
// https://tc39.es/ecma262/#sec-arraybuffer.isview
$$1Y({ target: 'ArrayBuffer', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS$1 }, {
  isView: ArrayBufferViewCore.isView
});

var $$1Z = _export;
var fails$M = fails;
var ArrayBufferModule = arrayBuffer;
var anObject$l = anObject;
var toAbsoluteIndex$7 = toAbsoluteIndex;
var toLength$p = toLength;
var speciesConstructor$5 = speciesConstructor;

var ArrayBuffer$2 = ArrayBufferModule.ArrayBuffer;
var DataView$1 = ArrayBufferModule.DataView;
var nativeArrayBufferSlice = ArrayBuffer$2.prototype.slice;

var INCORRECT_SLICE = fails$M(function () {
  return !new ArrayBuffer$2(2).slice(1, undefined).byteLength;
});

// `ArrayBuffer.prototype.slice` method
// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
$$1Z({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  slice: function slice(start, end) {
    if (nativeArrayBufferSlice !== undefined && end === undefined) {
      return nativeArrayBufferSlice.call(anObject$l(this), start); // FF fix
    }
    var length = anObject$l(this).byteLength;
    var first = toAbsoluteIndex$7(start, length);
    var fin = toAbsoluteIndex$7(end === undefined ? length : end, length);
    var result = new (speciesConstructor$5(this, ArrayBuffer$2))(toLength$p(fin - first));
    var viewSource = new DataView$1(this);
    var viewTarget = new DataView$1(result);
    var index = 0;
    while (first < fin) {
      viewTarget.setUint8(index++, viewSource.getUint8(first++));
    } return result;
  }
});

var $$1_ = _export;
var ArrayBufferModule$1 = arrayBuffer;
var NATIVE_ARRAY_BUFFER$2 = arrayBufferNative;

// `DataView` constructor
// https://tc39.es/ecma262/#sec-dataview-constructor
$$1_({ global: true, forced: !NATIVE_ARRAY_BUFFER$2 }, {
  DataView: ArrayBufferModule$1.DataView
});

var typedArrayConstructor = {exports: {}};

/* eslint-disable no-new */

var global$y = global$1;
var fails$N = fails;
var checkCorrectnessOfIteration$4 = checkCorrectnessOfIteration;
var NATIVE_ARRAY_BUFFER_VIEWS$2 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

var ArrayBuffer$3 = global$y.ArrayBuffer;
var Int8Array$2 = global$y.Int8Array;

var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$2 || !fails$N(function () {
  Int8Array$2(1);
}) || !fails$N(function () {
  new Int8Array$2(-1);
}) || !checkCorrectnessOfIteration$4(function (iterable) {
  new Int8Array$2();
  new Int8Array$2(null);
  new Int8Array$2(1.5);
  new Int8Array$2(iterable);
}, true) || fails$N(function () {
  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
  return new Int8Array$2(new ArrayBuffer$3(2), 1, undefined).length !== 1;
});

var toInteger$c = toInteger;

var toPositiveInteger = function (it) {
  var result = toInteger$c(it);
  if (result < 0) throw RangeError("The argument can't be less than 0");
  return result;
};

var toPositiveInteger$1 = toPositiveInteger;

var toOffset = function (it, BYTES) {
  var offset = toPositiveInteger$1(it);
  if (offset % BYTES) throw RangeError('Wrong offset');
  return offset;
};

var toObject$m = toObject;
var toLength$q = toLength;
var getIteratorMethod$3 = getIteratorMethod;
var isArrayIteratorMethod$3 = isArrayIteratorMethod;
var bind$8 = functionBindContext;
var aTypedArrayConstructor$1 = arrayBufferViewCore.aTypedArrayConstructor;

var typedArrayFrom = function from(source /* , mapfn, thisArg */) {
  var O = toObject$m(source);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod$3(O);
  var i, length, result, step, iterator, next;
  if (iteratorMethod != undefined && !isArrayIteratorMethod$3(iteratorMethod)) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    O = [];
    while (!(step = next.call(iterator)).done) {
      O.push(step.value);
    }
  }
  if (mapping && argumentsLength > 2) {
    mapfn = bind$8(mapfn, arguments[2], 2);
  }
  length = toLength$q(O.length);
  result = new (aTypedArrayConstructor$1(this))(length);
  for (i = 0; length > i; i++) {
    result[i] = mapping ? mapfn(O[i], i) : O[i];
  }
  return result;
};

var $$1$ = _export;
var global$z = global$1;
var DESCRIPTORS$s = descriptors;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = typedArrayConstructorsRequireWrappers;
var ArrayBufferViewCore$1 = arrayBufferViewCore;
var ArrayBufferModule$2 = arrayBuffer;
var anInstance$6 = anInstance;
var createPropertyDescriptor$7 = createPropertyDescriptor;
var createNonEnumerableProperty$e = createNonEnumerableProperty;
var toLength$r = toLength;
var toIndex$2 = toIndex;
var toOffset$1 = toOffset;
var toPrimitive$a = toPrimitive;
var has$h = has;
var classof$c = classof$2;
var isObject$u = isObject;
var create$6 = objectCreate;
var setPrototypeOf$6 = objectSetPrototypeOf;
var getOwnPropertyNames$3 = objectGetOwnPropertyNames.f;
var typedArrayFrom$1 = typedArrayFrom;
var forEach$1 = arrayIteration.forEach;
var setSpecies$6 = setSpecies;
var definePropertyModule$a = objectDefineProperty;
var getOwnPropertyDescriptorModule$3 = objectGetOwnPropertyDescriptor;
var InternalStateModule$9 = internalState;
var inheritIfRequired$4 = inheritIfRequired;

var getInternalState$8 = InternalStateModule$9.get;
var setInternalState$9 = InternalStateModule$9.set;
var nativeDefineProperty$2 = definePropertyModule$a.f;
var nativeGetOwnPropertyDescriptor$3 = getOwnPropertyDescriptorModule$3.f;
var round = Math.round;
var RangeError$2 = global$z.RangeError;
var ArrayBuffer$4 = ArrayBufferModule$2.ArrayBuffer;
var DataView$2 = ArrayBufferModule$2.DataView;
var NATIVE_ARRAY_BUFFER_VIEWS$3 = ArrayBufferViewCore$1.NATIVE_ARRAY_BUFFER_VIEWS;
var TYPED_ARRAY_TAG$1 = ArrayBufferViewCore$1.TYPED_ARRAY_TAG;
var TypedArray$1 = ArrayBufferViewCore$1.TypedArray;
var TypedArrayPrototype$1 = ArrayBufferViewCore$1.TypedArrayPrototype;
var aTypedArrayConstructor$2 = ArrayBufferViewCore$1.aTypedArrayConstructor;
var isTypedArray$1 = ArrayBufferViewCore$1.isTypedArray;
var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
var WRONG_LENGTH$1 = 'Wrong length';

var fromList = function (C, list) {
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor$2(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var addGetter$1 = function (it, key) {
  nativeDefineProperty$2(it, key, { get: function () {
    return getInternalState$8(this)[key];
  } });
};

var isArrayBuffer = function (it) {
  var klass;
  return it instanceof ArrayBuffer$4 || (klass = classof$c(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
};

var isTypedArrayIndex = function (target, key) {
  return isTypedArray$1(target)
    && typeof key != 'symbol'
    && key in target
    && String(+key) == String(key);
};

var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
  return isTypedArrayIndex(target, key = toPrimitive$a(key, true))
    ? createPropertyDescriptor$7(2, target[key])
    : nativeGetOwnPropertyDescriptor$3(target, key);
};

var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
  if (isTypedArrayIndex(target, key = toPrimitive$a(key, true))
    && isObject$u(descriptor)
    && has$h(descriptor, 'value')
    && !has$h(descriptor, 'get')
    && !has$h(descriptor, 'set')
    // TODO: add validation descriptor w/o calling accessors
    && !descriptor.configurable
    && (!has$h(descriptor, 'writable') || descriptor.writable)
    && (!has$h(descriptor, 'enumerable') || descriptor.enumerable)
  ) {
    target[key] = descriptor.value;
    return target;
  } return nativeDefineProperty$2(target, key, descriptor);
};

if (DESCRIPTORS$s) {
  if (!NATIVE_ARRAY_BUFFER_VIEWS$3) {
    getOwnPropertyDescriptorModule$3.f = wrappedGetOwnPropertyDescriptor;
    definePropertyModule$a.f = wrappedDefineProperty;
    addGetter$1(TypedArrayPrototype$1, 'buffer');
    addGetter$1(TypedArrayPrototype$1, 'byteOffset');
    addGetter$1(TypedArrayPrototype$1, 'byteLength');
    addGetter$1(TypedArrayPrototype$1, 'length');
  }

  $$1$({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS$3 }, {
    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
    defineProperty: wrappedDefineProperty
  });

  typedArrayConstructor.exports = function (TYPE, wrapper, CLAMPED) {
    var BYTES = TYPE.match(/\d+$/)[0] / 8;
    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + TYPE;
    var SETTER = 'set' + TYPE;
    var NativeTypedArrayConstructor = global$z[CONSTRUCTOR_NAME];
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
      nativeDefineProperty$2(that, index, {
        get: function () {
          return getter(this, index);
        },
        set: function (value) {
          return setter(this, index, value);
        },
        enumerable: true
      });
    };

    if (!NATIVE_ARRAY_BUFFER_VIEWS$3) {
      TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
        anInstance$6(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
        var index = 0;
        var byteOffset = 0;
        var buffer, byteLength, length;
        if (!isObject$u(data)) {
          length = toIndex$2(data);
          byteLength = length * BYTES;
          buffer = new ArrayBuffer$4(byteLength);
        } else if (isArrayBuffer(data)) {
          buffer = data;
          byteOffset = toOffset$1(offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw RangeError$2(WRONG_LENGTH$1);
            byteLength = $len - byteOffset;
            if (byteLength < 0) throw RangeError$2(WRONG_LENGTH$1);
          } else {
            byteLength = toLength$r($length) * BYTES;
            if (byteLength + byteOffset > $len) throw RangeError$2(WRONG_LENGTH$1);
          }
          length = byteLength / BYTES;
        } else if (isTypedArray$1(data)) {
          return fromList(TypedArrayConstructor, data);
        } else {
          return typedArrayFrom$1.call(TypedArrayConstructor, data);
        }
        setInternalState$9(that, {
          buffer: buffer,
          byteOffset: byteOffset,
          byteLength: byteLength,
          length: length,
          view: new DataView$2(buffer)
        });
        while (index < length) addElement(that, index++);
      });

      if (setPrototypeOf$6) setPrototypeOf$6(TypedArrayConstructor, TypedArray$1);
      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = create$6(TypedArrayPrototype$1);
    } else if (TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS) {
      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
        anInstance$6(dummy, TypedArrayConstructor, CONSTRUCTOR_NAME);
        return inheritIfRequired$4(function () {
          if (!isObject$u(data)) return new NativeTypedArrayConstructor(toIndex$2(data));
          if (isArrayBuffer(data)) return $length !== undefined
            ? new NativeTypedArrayConstructor(data, toOffset$1(typedArrayOffset, BYTES), $length)
            : typedArrayOffset !== undefined
              ? new NativeTypedArrayConstructor(data, toOffset$1(typedArrayOffset, BYTES))
              : new NativeTypedArrayConstructor(data);
          if (isTypedArray$1(data)) return fromList(TypedArrayConstructor, data);
          return typedArrayFrom$1.call(TypedArrayConstructor, data);
        }(), dummy, TypedArrayConstructor);
      });

      if (setPrototypeOf$6) setPrototypeOf$6(TypedArrayConstructor, TypedArray$1);
      forEach$1(getOwnPropertyNames$3(NativeTypedArrayConstructor), function (key) {
        if (!(key in TypedArrayConstructor)) {
          createNonEnumerableProperty$e(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
        }
      });
      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
    }

    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
      createNonEnumerableProperty$e(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
    }

    if (TYPED_ARRAY_TAG$1) {
      createNonEnumerableProperty$e(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG$1, CONSTRUCTOR_NAME);
    }

    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

    $$1$({
      global: true, forced: TypedArrayConstructor != NativeTypedArrayConstructor, sham: !NATIVE_ARRAY_BUFFER_VIEWS$3
    }, exported);

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
      createNonEnumerableProperty$e(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
    }

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
      createNonEnumerableProperty$e(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
    }

    setSpecies$6(CONSTRUCTOR_NAME);
  };
} else typedArrayConstructor.exports = function () { /* empty */ };

var createTypedArrayConstructor = typedArrayConstructor.exports;

// `Int8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor('Int8', function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$1 = typedArrayConstructor.exports;

// `Uint8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$1('Uint8', function (init) {
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

var createTypedArrayConstructor$3 = typedArrayConstructor.exports;

// `Int16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$3('Int16', function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$4 = typedArrayConstructor.exports;

// `Uint16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$4('Uint16', function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$5 = typedArrayConstructor.exports;

// `Int32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$5('Int32', function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$6 = typedArrayConstructor.exports;

// `Uint32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$6('Uint32', function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$7 = typedArrayConstructor.exports;

// `Float32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$7('Float32', function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$8 = typedArrayConstructor.exports;

// `Float64Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$8('Float64', function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1 = typedArrayConstructorsRequireWrappers;
var exportTypedArrayStaticMethod$1 = arrayBufferViewCore.exportTypedArrayStaticMethod;
var typedArrayFrom$2 = typedArrayFrom;

// `%TypedArray%.from` method
// https://tc39.es/ecma262/#sec-%typedarray%.from
exportTypedArrayStaticMethod$1('from', typedArrayFrom$2, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1);

var ArrayBufferViewCore$2 = arrayBufferViewCore;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$2 = typedArrayConstructorsRequireWrappers;

var aTypedArrayConstructor$3 = ArrayBufferViewCore$2.aTypedArrayConstructor;
var exportTypedArrayStaticMethod$2 = ArrayBufferViewCore$2.exportTypedArrayStaticMethod;

// `%TypedArray%.of` method
// https://tc39.es/ecma262/#sec-%typedarray%.of
exportTypedArrayStaticMethod$2('of', function of(/* ...items */) {
  var index = 0;
  var length = arguments.length;
  var result = new (aTypedArrayConstructor$3(this))(length);
  while (length > index) result[index] = arguments[index++];
  return result;
}, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$2);

var ArrayBufferViewCore$3 = arrayBufferViewCore;
var $copyWithin = arrayCopyWithin;

var aTypedArray$1 = ArrayBufferViewCore$3.aTypedArray;
var exportTypedArrayMethod$1 = ArrayBufferViewCore$3.exportTypedArrayMethod;

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
exportTypedArrayMethod$1('copyWithin', function copyWithin(target, start /* , end */) {
  return $copyWithin.call(aTypedArray$1(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
});

var ArrayBufferViewCore$4 = arrayBufferViewCore;
var $every$1 = arrayIteration.every;

var aTypedArray$2 = ArrayBufferViewCore$4.aTypedArray;
var exportTypedArrayMethod$2 = ArrayBufferViewCore$4.exportTypedArrayMethod;

// `%TypedArray%.prototype.every` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
exportTypedArrayMethod$2('every', function every(callbackfn /* , thisArg */) {
  return $every$1(aTypedArray$2(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$5 = arrayBufferViewCore;
var $fill = arrayFill;

var aTypedArray$3 = ArrayBufferViewCore$5.aTypedArray;
var exportTypedArrayMethod$3 = ArrayBufferViewCore$5.exportTypedArrayMethod;

// `%TypedArray%.prototype.fill` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
// eslint-disable-next-line no-unused-vars
exportTypedArrayMethod$3('fill', function fill(value /* , start, end */) {
  return $fill.apply(aTypedArray$3(this), arguments);
});

var ArrayBufferViewCore$6 = arrayBufferViewCore;
var $filter$1 = arrayIteration.filter;
var speciesConstructor$6 = speciesConstructor;

var aTypedArray$4 = ArrayBufferViewCore$6.aTypedArray;
var aTypedArrayConstructor$4 = ArrayBufferViewCore$6.aTypedArrayConstructor;
var exportTypedArrayMethod$4 = ArrayBufferViewCore$6.exportTypedArrayMethod;

// `%TypedArray%.prototype.filter` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
exportTypedArrayMethod$4('filter', function filter(callbackfn /* , thisArg */) {
  var list = $filter$1(aTypedArray$4(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  var C = speciesConstructor$6(this, this.constructor);
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor$4(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
});

var ArrayBufferViewCore$7 = arrayBufferViewCore;
var $find$1 = arrayIteration.find;

var aTypedArray$5 = ArrayBufferViewCore$7.aTypedArray;
var exportTypedArrayMethod$5 = ArrayBufferViewCore$7.exportTypedArrayMethod;

// `%TypedArray%.prototype.find` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
exportTypedArrayMethod$5('find', function find(predicate /* , thisArg */) {
  return $find$1(aTypedArray$5(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$8 = arrayBufferViewCore;
var $findIndex$1 = arrayIteration.findIndex;

var aTypedArray$6 = ArrayBufferViewCore$8.aTypedArray;
var exportTypedArrayMethod$6 = ArrayBufferViewCore$8.exportTypedArrayMethod;

// `%TypedArray%.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
exportTypedArrayMethod$6('findIndex', function findIndex(predicate /* , thisArg */) {
  return $findIndex$1(aTypedArray$6(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$9 = arrayBufferViewCore;
var $forEach$2 = arrayIteration.forEach;

var aTypedArray$7 = ArrayBufferViewCore$9.aTypedArray;
var exportTypedArrayMethod$7 = ArrayBufferViewCore$9.exportTypedArrayMethod;

// `%TypedArray%.prototype.forEach` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
exportTypedArrayMethod$7('forEach', function forEach(callbackfn /* , thisArg */) {
  $forEach$2(aTypedArray$7(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$a = arrayBufferViewCore;
var $includes$1 = arrayIncludes.includes;

var aTypedArray$8 = ArrayBufferViewCore$a.aTypedArray;
var exportTypedArrayMethod$8 = ArrayBufferViewCore$a.exportTypedArrayMethod;

// `%TypedArray%.prototype.includes` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
exportTypedArrayMethod$8('includes', function includes(searchElement /* , fromIndex */) {
  return $includes$1(aTypedArray$8(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$b = arrayBufferViewCore;
var $indexOf$1 = arrayIncludes.indexOf;

var aTypedArray$9 = ArrayBufferViewCore$b.aTypedArray;
var exportTypedArrayMethod$9 = ArrayBufferViewCore$b.exportTypedArrayMethod;

// `%TypedArray%.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
exportTypedArrayMethod$9('indexOf', function indexOf(searchElement /* , fromIndex */) {
  return $indexOf$1(aTypedArray$9(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var global$A = global$1;
var ArrayBufferViewCore$c = arrayBufferViewCore;
var ArrayIterators = es_array_iterator;
var wellKnownSymbol$s = wellKnownSymbol;

var ITERATOR$5 = wellKnownSymbol$s('iterator');
var Uint8Array = global$A.Uint8Array;
var arrayValues = ArrayIterators.values;
var arrayKeys = ArrayIterators.keys;
var arrayEntries = ArrayIterators.entries;
var aTypedArray$a = ArrayBufferViewCore$c.aTypedArray;
var exportTypedArrayMethod$a = ArrayBufferViewCore$c.exportTypedArrayMethod;
var nativeTypedArrayIterator = Uint8Array && Uint8Array.prototype[ITERATOR$5];

var CORRECT_ITER_NAME = !!nativeTypedArrayIterator
  && (nativeTypedArrayIterator.name == 'values' || nativeTypedArrayIterator.name == undefined);

var typedArrayValues = function values() {
  return arrayValues.call(aTypedArray$a(this));
};

// `%TypedArray%.prototype.entries` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
exportTypedArrayMethod$a('entries', function entries() {
  return arrayEntries.call(aTypedArray$a(this));
});
// `%TypedArray%.prototype.keys` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
exportTypedArrayMethod$a('keys', function keys() {
  return arrayKeys.call(aTypedArray$a(this));
});
// `%TypedArray%.prototype.values` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
exportTypedArrayMethod$a('values', typedArrayValues, !CORRECT_ITER_NAME);
// `%TypedArray%.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
exportTypedArrayMethod$a(ITERATOR$5, typedArrayValues, !CORRECT_ITER_NAME);

var ArrayBufferViewCore$d = arrayBufferViewCore;

var aTypedArray$b = ArrayBufferViewCore$d.aTypedArray;
var exportTypedArrayMethod$b = ArrayBufferViewCore$d.exportTypedArrayMethod;
var $join = [].join;

// `%TypedArray%.prototype.join` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
// eslint-disable-next-line no-unused-vars
exportTypedArrayMethod$b('join', function join(separator) {
  return $join.apply(aTypedArray$b(this), arguments);
});

var ArrayBufferViewCore$e = arrayBufferViewCore;
var $lastIndexOf = arrayLastIndexOf;

var aTypedArray$c = ArrayBufferViewCore$e.aTypedArray;
var exportTypedArrayMethod$c = ArrayBufferViewCore$e.exportTypedArrayMethod;

// `%TypedArray%.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
// eslint-disable-next-line no-unused-vars
exportTypedArrayMethod$c('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
  return $lastIndexOf.apply(aTypedArray$c(this), arguments);
});

var ArrayBufferViewCore$f = arrayBufferViewCore;
var $map$1 = arrayIteration.map;
var speciesConstructor$7 = speciesConstructor;

var aTypedArray$d = ArrayBufferViewCore$f.aTypedArray;
var aTypedArrayConstructor$5 = ArrayBufferViewCore$f.aTypedArrayConstructor;
var exportTypedArrayMethod$d = ArrayBufferViewCore$f.exportTypedArrayMethod;

// `%TypedArray%.prototype.map` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
exportTypedArrayMethod$d('map', function map(mapfn /* , thisArg */) {
  return $map$1(aTypedArray$d(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
    return new (aTypedArrayConstructor$5(speciesConstructor$7(O, O.constructor)))(length);
  });
});

var ArrayBufferViewCore$g = arrayBufferViewCore;
var $reduce$1 = arrayReduce.left;

var aTypedArray$e = ArrayBufferViewCore$g.aTypedArray;
var exportTypedArrayMethod$e = ArrayBufferViewCore$g.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduce` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
exportTypedArrayMethod$e('reduce', function reduce(callbackfn /* , initialValue */) {
  return $reduce$1(aTypedArray$e(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$h = arrayBufferViewCore;
var $reduceRight$1 = arrayReduce.right;

var aTypedArray$f = ArrayBufferViewCore$h.aTypedArray;
var exportTypedArrayMethod$f = ArrayBufferViewCore$h.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduceRicht` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
exportTypedArrayMethod$f('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
  return $reduceRight$1(aTypedArray$f(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$i = arrayBufferViewCore;

var aTypedArray$g = ArrayBufferViewCore$i.aTypedArray;
var exportTypedArrayMethod$g = ArrayBufferViewCore$i.exportTypedArrayMethod;
var floor$7 = Math.floor;

// `%TypedArray%.prototype.reverse` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
exportTypedArrayMethod$g('reverse', function reverse() {
  var that = this;
  var length = aTypedArray$g(that).length;
  var middle = floor$7(length / 2);
  var index = 0;
  var value;
  while (index < middle) {
    value = that[index];
    that[index++] = that[--length];
    that[length] = value;
  } return that;
});

var ArrayBufferViewCore$j = arrayBufferViewCore;
var toLength$s = toLength;
var toOffset$2 = toOffset;
var toObject$n = toObject;
var fails$O = fails;

var aTypedArray$h = ArrayBufferViewCore$j.aTypedArray;
var exportTypedArrayMethod$h = ArrayBufferViewCore$j.exportTypedArrayMethod;

var FORCED$l = fails$O(function () {
  // eslint-disable-next-line no-undef
  new Int8Array(1).set({});
});

// `%TypedArray%.prototype.set` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
exportTypedArrayMethod$h('set', function set(arrayLike /* , offset */) {
  aTypedArray$h(this);
  var offset = toOffset$2(arguments.length > 1 ? arguments[1] : undefined, 1);
  var length = this.length;
  var src = toObject$n(arrayLike);
  var len = toLength$s(src.length);
  var index = 0;
  if (len + offset > length) throw RangeError('Wrong length');
  while (index < len) this[offset + index] = src[index++];
}, FORCED$l);

var ArrayBufferViewCore$k = arrayBufferViewCore;
var speciesConstructor$8 = speciesConstructor;
var fails$P = fails;

var aTypedArray$i = ArrayBufferViewCore$k.aTypedArray;
var aTypedArrayConstructor$6 = ArrayBufferViewCore$k.aTypedArrayConstructor;
var exportTypedArrayMethod$i = ArrayBufferViewCore$k.exportTypedArrayMethod;
var $slice = [].slice;

var FORCED$m = fails$P(function () {
  // eslint-disable-next-line no-undef
  new Int8Array(1).slice();
});

// `%TypedArray%.prototype.slice` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
exportTypedArrayMethod$i('slice', function slice(start, end) {
  var list = $slice.call(aTypedArray$i(this), start, end);
  var C = speciesConstructor$8(this, this.constructor);
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor$6(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
}, FORCED$m);

var ArrayBufferViewCore$l = arrayBufferViewCore;
var $some$1 = arrayIteration.some;

var aTypedArray$j = ArrayBufferViewCore$l.aTypedArray;
var exportTypedArrayMethod$j = ArrayBufferViewCore$l.exportTypedArrayMethod;

// `%TypedArray%.prototype.some` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
exportTypedArrayMethod$j('some', function some(callbackfn /* , thisArg */) {
  return $some$1(aTypedArray$j(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$m = arrayBufferViewCore;

var aTypedArray$k = ArrayBufferViewCore$m.aTypedArray;
var exportTypedArrayMethod$k = ArrayBufferViewCore$m.exportTypedArrayMethod;
var $sort = [].sort;

// `%TypedArray%.prototype.sort` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.sort
exportTypedArrayMethod$k('sort', function sort(comparefn) {
  return $sort.call(aTypedArray$k(this), comparefn);
});

var ArrayBufferViewCore$n = arrayBufferViewCore;
var toLength$t = toLength;
var toAbsoluteIndex$8 = toAbsoluteIndex;
var speciesConstructor$9 = speciesConstructor;

var aTypedArray$l = ArrayBufferViewCore$n.aTypedArray;
var exportTypedArrayMethod$l = ArrayBufferViewCore$n.exportTypedArrayMethod;

// `%TypedArray%.prototype.subarray` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
exportTypedArrayMethod$l('subarray', function subarray(begin, end) {
  var O = aTypedArray$l(this);
  var length = O.length;
  var beginIndex = toAbsoluteIndex$8(begin, length);
  return new (speciesConstructor$9(O, O.constructor))(
    O.buffer,
    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
    toLength$t((end === undefined ? length : toAbsoluteIndex$8(end, length)) - beginIndex)
  );
});

var global$B = global$1;
var ArrayBufferViewCore$o = arrayBufferViewCore;
var fails$Q = fails;

var Int8Array$3 = global$B.Int8Array;
var aTypedArray$m = ArrayBufferViewCore$o.aTypedArray;
var exportTypedArrayMethod$m = ArrayBufferViewCore$o.exportTypedArrayMethod;
var $toLocaleString = [].toLocaleString;
var $slice$1 = [].slice;

// iOS Safari 6.x fails here
var TO_LOCALE_STRING_BUG = !!Int8Array$3 && fails$Q(function () {
  $toLocaleString.call(new Int8Array$3(1));
});

var FORCED$n = fails$Q(function () {
  return [1, 2].toLocaleString() != new Int8Array$3([1, 2]).toLocaleString();
}) || !fails$Q(function () {
  Int8Array$3.prototype.toLocaleString.call([1, 2]);
});

// `%TypedArray%.prototype.toLocaleString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
exportTypedArrayMethod$m('toLocaleString', function toLocaleString() {
  return $toLocaleString.apply(TO_LOCALE_STRING_BUG ? $slice$1.call(aTypedArray$m(this)) : aTypedArray$m(this), arguments);
}, FORCED$n);

var exportTypedArrayMethod$n = arrayBufferViewCore.exportTypedArrayMethod;
var fails$R = fails;
var global$C = global$1;

var Uint8Array$1 = global$C.Uint8Array;
var Uint8ArrayPrototype = Uint8Array$1 && Uint8Array$1.prototype || {};
var arrayToString = [].toString;
var arrayJoin = [].join;

if (fails$R(function () { arrayToString.call({}); })) {
  arrayToString = function toString() {
    return arrayJoin.call(this);
  };
}

var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString;

// `%TypedArray%.prototype.toString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
exportTypedArrayMethod$n('toString', arrayToString, IS_NOT_ARRAY_METHOD);

var $$20 = _export;
var getBuiltIn$a = getBuiltIn;
var aFunction$f = aFunction$1;
var anObject$m = anObject;
var fails$S = fails;

var nativeApply = getBuiltIn$a('Reflect', 'apply');
var functionApply = Function.apply;

// MS Edge argumentsList argument is optional
var OPTIONAL_ARGUMENTS_LIST = !fails$S(function () {
  nativeApply(function () { /* empty */ });
});

// `Reflect.apply` method
// https://tc39.es/ecma262/#sec-reflect.apply
$$20({ target: 'Reflect', stat: true, forced: OPTIONAL_ARGUMENTS_LIST }, {
  apply: function apply(target, thisArgument, argumentsList) {
    aFunction$f(target);
    anObject$m(argumentsList);
    return nativeApply
      ? nativeApply(target, thisArgument, argumentsList)
      : functionApply.call(target, thisArgument, argumentsList);
  }
});

var $$21 = _export;
var getBuiltIn$b = getBuiltIn;
var aFunction$g = aFunction$1;
var anObject$n = anObject;
var isObject$v = isObject;
var create$7 = objectCreate;
var bind$9 = functionBind;
var fails$T = fails;

var nativeConstruct = getBuiltIn$b('Reflect', 'construct');

// `Reflect.construct` method
// https://tc39.es/ecma262/#sec-reflect.construct
// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails$T(function () {
  function F() { /* empty */ }
  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
});
var ARGS_BUG = !fails$T(function () {
  nativeConstruct(function () { /* empty */ });
});
var FORCED$o = NEW_TARGET_BUG || ARGS_BUG;

$$21({ target: 'Reflect', stat: true, forced: FORCED$o, sham: FORCED$o }, {
  construct: function construct(Target, args /* , newTarget */) {
    aFunction$g(Target);
    anObject$n(args);
    var newTarget = arguments.length < 3 ? Target : aFunction$g(arguments[2]);
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
      return new (bind$9.apply(Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = create$7(isObject$v(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return isObject$v(result) ? result : instance;
  }
});

var $$22 = _export;
var DESCRIPTORS$t = descriptors;
var anObject$o = anObject;
var toPrimitive$b = toPrimitive;
var definePropertyModule$b = objectDefineProperty;
var fails$U = fails;

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
var ERROR_INSTEAD_OF_FALSE = fails$U(function () {
  // eslint-disable-next-line no-undef
  Reflect.defineProperty(definePropertyModule$b.f({}, 1, { value: 1 }), 1, { value: 2 });
});

// `Reflect.defineProperty` method
// https://tc39.es/ecma262/#sec-reflect.defineproperty
$$22({ target: 'Reflect', stat: true, forced: ERROR_INSTEAD_OF_FALSE, sham: !DESCRIPTORS$t }, {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    anObject$o(target);
    var key = toPrimitive$b(propertyKey, true);
    anObject$o(attributes);
    try {
      definePropertyModule$b.f(target, key, attributes);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$23 = _export;
var anObject$p = anObject;
var getOwnPropertyDescriptor$8 = objectGetOwnPropertyDescriptor.f;

// `Reflect.deleteProperty` method
// https://tc39.es/ecma262/#sec-reflect.deleteproperty
$$23({ target: 'Reflect', stat: true }, {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var descriptor = getOwnPropertyDescriptor$8(anObject$p(target), propertyKey);
    return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
  }
});

var $$24 = _export;
var isObject$w = isObject;
var anObject$q = anObject;
var has$i = has;
var getOwnPropertyDescriptorModule$4 = objectGetOwnPropertyDescriptor;
var getPrototypeOf$8 = objectGetPrototypeOf;

// `Reflect.get` method
// https://tc39.es/ecma262/#sec-reflect.get
function get$2(target, propertyKey /* , receiver */) {
  var receiver = arguments.length < 3 ? target : arguments[2];
  var descriptor, prototype;
  if (anObject$q(target) === receiver) return target[propertyKey];
  if (descriptor = getOwnPropertyDescriptorModule$4.f(target, propertyKey)) return has$i(descriptor, 'value')
    ? descriptor.value
    : descriptor.get === undefined
      ? undefined
      : descriptor.get.call(receiver);
  if (isObject$w(prototype = getPrototypeOf$8(target))) return get$2(prototype, propertyKey, receiver);
}

$$24({ target: 'Reflect', stat: true }, {
  get: get$2
});

var $$25 = _export;
var DESCRIPTORS$u = descriptors;
var anObject$r = anObject;
var getOwnPropertyDescriptorModule$5 = objectGetOwnPropertyDescriptor;

// `Reflect.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-reflect.getownpropertydescriptor
$$25({ target: 'Reflect', stat: true, sham: !DESCRIPTORS$u }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return getOwnPropertyDescriptorModule$5.f(anObject$r(target), propertyKey);
  }
});

var $$26 = _export;
var anObject$s = anObject;
var objectGetPrototypeOf$1 = objectGetPrototypeOf;
var CORRECT_PROTOTYPE_GETTER$2 = correctPrototypeGetter;

// `Reflect.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.getprototypeof
$$26({ target: 'Reflect', stat: true, sham: !CORRECT_PROTOTYPE_GETTER$2 }, {
  getPrototypeOf: function getPrototypeOf(target) {
    return objectGetPrototypeOf$1(anObject$s(target));
  }
});

var $$27 = _export;

// `Reflect.has` method
// https://tc39.es/ecma262/#sec-reflect.has
$$27({ target: 'Reflect', stat: true }, {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});

var $$28 = _export;
var anObject$t = anObject;

var objectIsExtensible = Object.isExtensible;

// `Reflect.isExtensible` method
// https://tc39.es/ecma262/#sec-reflect.isextensible
$$28({ target: 'Reflect', stat: true }, {
  isExtensible: function isExtensible(target) {
    anObject$t(target);
    return objectIsExtensible ? objectIsExtensible(target) : true;
  }
});

var $$29 = _export;
var ownKeys$3 = ownKeys;

// `Reflect.ownKeys` method
// https://tc39.es/ecma262/#sec-reflect.ownkeys
$$29({ target: 'Reflect', stat: true }, {
  ownKeys: ownKeys$3
});

var $$2a = _export;
var getBuiltIn$c = getBuiltIn;
var anObject$u = anObject;
var FREEZING$4 = freezing;

// `Reflect.preventExtensions` method
// https://tc39.es/ecma262/#sec-reflect.preventextensions
$$2a({ target: 'Reflect', stat: true, sham: !FREEZING$4 }, {
  preventExtensions: function preventExtensions(target) {
    anObject$u(target);
    try {
      var objectPreventExtensions = getBuiltIn$c('Object', 'preventExtensions');
      if (objectPreventExtensions) objectPreventExtensions(target);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$2b = _export;
var anObject$v = anObject;
var isObject$x = isObject;
var has$j = has;
var fails$V = fails;
var definePropertyModule$c = objectDefineProperty;
var getOwnPropertyDescriptorModule$6 = objectGetOwnPropertyDescriptor;
var getPrototypeOf$9 = objectGetPrototypeOf;
var createPropertyDescriptor$8 = createPropertyDescriptor;

// `Reflect.set` method
// https://tc39.es/ecma262/#sec-reflect.set
function set$3(target, propertyKey, V /* , receiver */) {
  var receiver = arguments.length < 4 ? target : arguments[3];
  var ownDescriptor = getOwnPropertyDescriptorModule$6.f(anObject$v(target), propertyKey);
  var existingDescriptor, prototype;
  if (!ownDescriptor) {
    if (isObject$x(prototype = getPrototypeOf$9(target))) {
      return set$3(prototype, propertyKey, V, receiver);
    }
    ownDescriptor = createPropertyDescriptor$8(0);
  }
  if (has$j(ownDescriptor, 'value')) {
    if (ownDescriptor.writable === false || !isObject$x(receiver)) return false;
    if (existingDescriptor = getOwnPropertyDescriptorModule$6.f(receiver, propertyKey)) {
      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
      existingDescriptor.value = V;
      definePropertyModule$c.f(receiver, propertyKey, existingDescriptor);
    } else definePropertyModule$c.f(receiver, propertyKey, createPropertyDescriptor$8(0, V));
    return true;
  }
  return ownDescriptor.set === undefined ? false : (ownDescriptor.set.call(receiver, V), true);
}

// MS Edge 17-18 Reflect.set allows setting the property to object
// with non-writable property on the prototype
var MS_EDGE_BUG = fails$V(function () {
  var Constructor = function () { /* empty */ };
  var object = definePropertyModule$c.f(new Constructor(), 'a', { configurable: true });
  // eslint-disable-next-line no-undef
  return Reflect.set(Constructor.prototype, 'a', 1, object) !== false;
});

$$2b({ target: 'Reflect', stat: true, forced: MS_EDGE_BUG }, {
  set: set$3
});

var $$2c = _export;
var anObject$w = anObject;
var aPossiblePrototype$2 = aPossiblePrototype;
var objectSetPrototypeOf$1 = objectSetPrototypeOf;

// `Reflect.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.setprototypeof
if (objectSetPrototypeOf$1) $$2c({ target: 'Reflect', stat: true }, {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    anObject$w(target);
    aPossiblePrototype$2(proto);
    try {
      objectSetPrototypeOf$1(target, proto);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$2d = _export;
var global$D = global$1;
var setToStringTag$9 = setToStringTag;

$$2d({ global: true }, { Reflect: {} });

// Reflect[@@toStringTag] property
// https://tc39.es/ecma262/#sec-reflect-@@tostringtag
setToStringTag$9(global$D.Reflect, 'Reflect', true);

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
var Map$1 = es_map;
var WeakMap$2 = es_weakMap.exports;
var shared$5 = shared.exports;

var metadata = shared$5('metadata');
var store$4 = metadata.store || (metadata.store = new WeakMap$2());

var getOrCreateMetadataMap = function (target, targetKey, create) {
  var targetMetadata = store$4.get(target);
  if (!targetMetadata) {
    if (!create) return;
    store$4.set(target, targetMetadata = new Map$1());
  }
  var keyMetadata = targetMetadata.get(targetKey);
  if (!keyMetadata) {
    if (!create) return;
    targetMetadata.set(targetKey, keyMetadata = new Map$1());
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
  if (metadataMap) metadataMap.forEach(function (_, key) { keys.push(key); });
  return keys;
};

var toMetadataKey = function (it) {
  return it === undefined || typeof it == 'symbol' ? it : String(it);
};

var reflectMetadata = {
  store: store$4,
  getMap: getOrCreateMetadataMap,
  has: ordinaryHasOwnMetadata,
  get: ordinaryGetOwnMetadata,
  set: ordinaryDefineOwnMetadata,
  keys: ordinaryOwnMetadataKeys,
  toKey: toMetadataKey
};

var $$2e = _export;
var ReflectMetadataModule = reflectMetadata;
var anObject$x = anObject;

var toMetadataKey$1 = ReflectMetadataModule.toKey;
var ordinaryDefineOwnMetadata$1 = ReflectMetadataModule.set;

// `Reflect.defineMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$2e({ target: 'Reflect', stat: true }, {
  defineMetadata: function defineMetadata(metadataKey, metadataValue, target /* , targetKey */) {
    var targetKey = arguments.length < 4 ? undefined : toMetadataKey$1(arguments[3]);
    ordinaryDefineOwnMetadata$1(metadataKey, metadataValue, anObject$x(target), targetKey);
  }
});

var $$2f = _export;
var ReflectMetadataModule$1 = reflectMetadata;
var anObject$y = anObject;

var toMetadataKey$2 = ReflectMetadataModule$1.toKey;
var getOrCreateMetadataMap$1 = ReflectMetadataModule$1.getMap;
var store$5 = ReflectMetadataModule$1.store;

// `Reflect.deleteMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$2f({ target: 'Reflect', stat: true }, {
  deleteMetadata: function deleteMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$2(arguments[2]);
    var metadataMap = getOrCreateMetadataMap$1(anObject$y(target), targetKey, false);
    if (metadataMap === undefined || !metadataMap['delete'](metadataKey)) return false;
    if (metadataMap.size) return true;
    var targetMetadata = store$5.get(target);
    targetMetadata['delete'](targetKey);
    return !!targetMetadata.size || store$5['delete'](target);
  }
});

var $$2g = _export;
var ReflectMetadataModule$2 = reflectMetadata;
var anObject$z = anObject;
var getPrototypeOf$a = objectGetPrototypeOf;

var ordinaryHasOwnMetadata$1 = ReflectMetadataModule$2.has;
var ordinaryGetOwnMetadata$1 = ReflectMetadataModule$2.get;
var toMetadataKey$3 = ReflectMetadataModule$2.toKey;

var ordinaryGetMetadata = function (MetadataKey, O, P) {
  var hasOwn = ordinaryHasOwnMetadata$1(MetadataKey, O, P);
  if (hasOwn) return ordinaryGetOwnMetadata$1(MetadataKey, O, P);
  var parent = getPrototypeOf$a(O);
  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
};

// `Reflect.getMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$2g({ target: 'Reflect', stat: true }, {
  getMetadata: function getMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$3(arguments[2]);
    return ordinaryGetMetadata(metadataKey, anObject$z(target), targetKey);
  }
});

var $$2h = _export;
// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
var Set$1 = es_set;
var ReflectMetadataModule$3 = reflectMetadata;
var anObject$A = anObject;
var getPrototypeOf$b = objectGetPrototypeOf;
var iterate$9 = iterate;

var ordinaryOwnMetadataKeys$1 = ReflectMetadataModule$3.keys;
var toMetadataKey$4 = ReflectMetadataModule$3.toKey;

var from$1 = function (iter) {
  var result = [];
  iterate$9(iter, result.push, { that: result });
  return result;
};

var ordinaryMetadataKeys = function (O, P) {
  var oKeys = ordinaryOwnMetadataKeys$1(O, P);
  var parent = getPrototypeOf$b(O);
  if (parent === null) return oKeys;
  var pKeys = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? from$1(new Set$1(oKeys.concat(pKeys))) : pKeys : oKeys;
};

// `Reflect.getMetadataKeys` method
// https://github.com/rbuckton/reflect-metadata
$$2h({ target: 'Reflect', stat: true }, {
  getMetadataKeys: function getMetadataKeys(target /* , targetKey */) {
    var targetKey = arguments.length < 2 ? undefined : toMetadataKey$4(arguments[1]);
    return ordinaryMetadataKeys(anObject$A(target), targetKey);
  }
});

var $$2i = _export;
var ReflectMetadataModule$4 = reflectMetadata;
var anObject$B = anObject;

var ordinaryGetOwnMetadata$2 = ReflectMetadataModule$4.get;
var toMetadataKey$5 = ReflectMetadataModule$4.toKey;

// `Reflect.getOwnMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$2i({ target: 'Reflect', stat: true }, {
  getOwnMetadata: function getOwnMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$5(arguments[2]);
    return ordinaryGetOwnMetadata$2(metadataKey, anObject$B(target), targetKey);
  }
});

var $$2j = _export;
var ReflectMetadataModule$5 = reflectMetadata;
var anObject$C = anObject;

var ordinaryOwnMetadataKeys$2 = ReflectMetadataModule$5.keys;
var toMetadataKey$6 = ReflectMetadataModule$5.toKey;

// `Reflect.getOwnMetadataKeys` method
// https://github.com/rbuckton/reflect-metadata
$$2j({ target: 'Reflect', stat: true }, {
  getOwnMetadataKeys: function getOwnMetadataKeys(target /* , targetKey */) {
    var targetKey = arguments.length < 2 ? undefined : toMetadataKey$6(arguments[1]);
    return ordinaryOwnMetadataKeys$2(anObject$C(target), targetKey);
  }
});

var $$2k = _export;
var ReflectMetadataModule$6 = reflectMetadata;
var anObject$D = anObject;
var getPrototypeOf$c = objectGetPrototypeOf;

var ordinaryHasOwnMetadata$2 = ReflectMetadataModule$6.has;
var toMetadataKey$7 = ReflectMetadataModule$6.toKey;

var ordinaryHasMetadata = function (MetadataKey, O, P) {
  var hasOwn = ordinaryHasOwnMetadata$2(MetadataKey, O, P);
  if (hasOwn) return true;
  var parent = getPrototypeOf$c(O);
  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
};

// `Reflect.hasMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$2k({ target: 'Reflect', stat: true }, {
  hasMetadata: function hasMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$7(arguments[2]);
    return ordinaryHasMetadata(metadataKey, anObject$D(target), targetKey);
  }
});

var $$2l = _export;
var ReflectMetadataModule$7 = reflectMetadata;
var anObject$E = anObject;

var ordinaryHasOwnMetadata$3 = ReflectMetadataModule$7.has;
var toMetadataKey$8 = ReflectMetadataModule$7.toKey;

// `Reflect.hasOwnMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$2l({ target: 'Reflect', stat: true }, {
  hasOwnMetadata: function hasOwnMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$8(arguments[2]);
    return ordinaryHasOwnMetadata$3(metadataKey, anObject$E(target), targetKey);
  }
});

var $$2m = _export;
var ReflectMetadataModule$8 = reflectMetadata;
var anObject$F = anObject;

var toMetadataKey$9 = ReflectMetadataModule$8.toKey;
var ordinaryDefineOwnMetadata$2 = ReflectMetadataModule$8.set;

// `Reflect.metadata` method
// https://github.com/rbuckton/reflect-metadata
$$2m({ target: 'Reflect', stat: true }, {
  metadata: function metadata(metadataKey, metadataValue) {
    return function decorator(target, key) {
      ordinaryDefineOwnMetadata$2(metadataKey, metadataValue, anObject$F(target), toMetadataKey$9(key));
    };
  }
});

var $$2n = _export;

// `Math.iaddh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$2n({ target: 'Math', stat: true }, {
  iaddh: function iaddh(x0, x1, y0, y1) {
    var $x0 = x0 >>> 0;
    var $x1 = x1 >>> 0;
    var $y0 = y0 >>> 0;
    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
  }
});

var $$2o = _export;

// `Math.isubh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$2o({ target: 'Math', stat: true }, {
  isubh: function isubh(x0, x1, y0, y1) {
    var $x0 = x0 >>> 0;
    var $x1 = x1 >>> 0;
    var $y0 = y0 >>> 0;
    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
  }
});

var $$2p = _export;

// `Math.imulh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$2p({ target: 'Math', stat: true }, {
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

var $$2q = _export;

// `Math.umulh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$2q({ target: 'Math', stat: true }, {
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

var $$2r = _export;
var charAt$2 = stringMultibyte.charAt;
var fails$W = fails;

var FORCED$p = fails$W(function () {
  return '𠮷'.at(0) !== '𠮷';
});

// `String.prototype.at` method
// https://github.com/mathiasbynens/String.prototype.at
$$2r({ target: 'String', proto: true, forced: FORCED$p }, {
  at: function at(pos) {
    return charAt$2(this, pos);
  }
});

var fails$X = fails;
var wellKnownSymbol$t = wellKnownSymbol;
var IS_PURE$1 = isPure;

var ITERATOR$6 = wellKnownSymbol$t('iterator');

var nativeUrl = !fails$X(function () {
  var url = new URL('b?a=1&b=2&c=3', 'http://a');
  var searchParams = url.searchParams;
  var result = '';
  url.pathname = 'c%20d';
  searchParams.forEach(function (value, key) {
    searchParams['delete']('b');
    result += key + value;
  });
  return (IS_PURE$1 && !url.toJSON)
    || !searchParams.sort
    || url.href !== 'http://a/c%20d?a=1&c=3'
    || searchParams.get('c') !== '3'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !searchParams[ITERATOR$6]
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
var floor$8 = Math.floor;
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
  delta = firstTime ? floor$8(delta / damp) : delta >> 1;
  delta += floor$8(delta / numPoints);
  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
    delta = floor$8(delta / baseMinusTMin);
  }
  return floor$8(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 */
// eslint-disable-next-line  max-statements
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
    if (m - n > floor$8((maxInt - delta) / handledCPCountPlusOne)) {
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
          q = floor$8(qMinusT / baseMinusT);
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

var anObject$G = anObject;
var getIteratorMethod$4 = getIteratorMethod;

var getIterator = function (it) {
  var iteratorMethod = getIteratorMethod$4(it);
  if (typeof iteratorMethod != 'function') {
    throw TypeError(String(it) + ' is not iterable');
  } return anObject$G(iteratorMethod.call(it));
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

var $$2s = _export;
var getBuiltIn$d = getBuiltIn;
var USE_NATIVE_URL = nativeUrl;
var redefine$f = redefine.exports;
var redefineAll$6 = redefineAll;
var setToStringTag$a = setToStringTag;
var createIteratorConstructor$3 = createIteratorConstructor;
var InternalStateModule$a = internalState;
var anInstance$7 = anInstance;
var hasOwn = has;
var bind$a = functionBindContext;
var classof$d = classof$2;
var anObject$H = anObject;
var isObject$y = isObject;
var create$8 = objectCreate;
var createPropertyDescriptor$9 = createPropertyDescriptor;
var getIterator$1 = getIterator;
var getIteratorMethod$5 = getIteratorMethod;
var wellKnownSymbol$u = wellKnownSymbol;

var $fetch$1 = getBuiltIn$d('fetch');
var Headers = getBuiltIn$d('Headers');
var ITERATOR$7 = wellKnownSymbol$u('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState$a = InternalStateModule$a.set;
var getInternalParamsState = InternalStateModule$a.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = InternalStateModule$a.getterFor(URL_SEARCH_PARAMS_ITERATOR);

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

var find$1 = /[!'()~]|%20/g;

var replace$1 = {
  '!': '%21',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '~': '%7E',
  '%20': '+'
};

var replacer = function (match) {
  return replace$1[match];
};

var serialize = function (it) {
  return encodeURIComponent(it).replace(find$1, replacer);
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

var URLSearchParamsIterator = createIteratorConstructor$3(function Iterator(params, kind) {
  setInternalState$a(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    iterator: getIterator$1(getInternalParamsState(params).entries),
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
  anInstance$7(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  var that = this;
  var entries = [];
  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;

  setInternalState$a(that, {
    type: URL_SEARCH_PARAMS,
    entries: entries,
    updateURL: function () { /* empty */ },
    updateSearchParams: updateSearchParams
  });

  if (init !== undefined) {
    if (isObject$y(init)) {
      iteratorMethod = getIteratorMethod$5(init);
      if (typeof iteratorMethod === 'function') {
        iterator = iteratorMethod.call(init);
        next = iterator.next;
        while (!(step = next.call(iterator)).done) {
          entryIterator = getIterator$1(anObject$H(step.value));
          entryNext = entryIterator.next;
          if (
            (first = entryNext.call(entryIterator)).done ||
            (second = entryNext.call(entryIterator)).done ||
            !entryNext.call(entryIterator).done
          ) throw TypeError('Expected sequence with length 2');
          entries.push({ key: first.value + '', value: second.value + '' });
        }
      } else for (key in init) if (hasOwn(init, key)) entries.push({ key: key, value: init[key] + '' });
    } else {
      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
    }
  }
};

var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

redefineAll$6(URLSearchParamsPrototype, {
  // `URLSearchParams.prototype.append` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
  append: function append(name, value) {
    validateArgumentsLength(arguments.length, 2);
    var state = getInternalParamsState(this);
    state.entries.push({ key: name + '', value: value + '' });
    state.updateURL();
  },
  // `URLSearchParams.prototype.delete` method
  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
  'delete': function (name) {
    validateArgumentsLength(arguments.length, 1);
    var state = getInternalParamsState(this);
    var entries = state.entries;
    var key = name + '';
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
    var key = name + '';
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
    var key = name + '';
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
    var key = name + '';
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
    var key = name + '';
    var val = value + '';
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
    var boundFunction = bind$a(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
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
redefine$f(URLSearchParamsPrototype, ITERATOR$7, URLSearchParamsPrototype.entries);

// `URLSearchParams.prototype.toString` method
// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
redefine$f(URLSearchParamsPrototype, 'toString', function toString() {
  var entries = getInternalParamsState(this).entries;
  var result = [];
  var index = 0;
  var entry;
  while (index < entries.length) {
    entry = entries[index++];
    result.push(serialize(entry.key) + '=' + serialize(entry.value));
  } return result.join('&');
}, { enumerable: true });

setToStringTag$a(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

$$2s({ global: true, forced: !USE_NATIVE_URL }, {
  URLSearchParams: URLSearchParamsConstructor
});

// Wrap `fetch` for correct work with polyfilled `URLSearchParams`
// https://github.com/zloirock/core-js/issues/674
if (!USE_NATIVE_URL && typeof $fetch$1 == 'function' && typeof Headers == 'function') {
  $$2s({ global: true, enumerable: true, forced: true }, {
    fetch: function fetch(input /* , init */) {
      var args = [input];
      var init, body, headers;
      if (arguments.length > 1) {
        init = arguments[1];
        if (isObject$y(init)) {
          body = init.body;
          if (classof$d(body) === URL_SEARCH_PARAMS) {
            headers = init.headers ? new Headers(init.headers) : new Headers();
            if (!headers.has('content-type')) {
              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
            }
            init = create$8(init, {
              body: createPropertyDescriptor$9(0, String(body)),
              headers: createPropertyDescriptor$9(0, headers)
            });
          }
        }
        args.push(init);
      } return $fetch$1.apply(this, args);
    }
  });
}

var web_urlSearchParams = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

var $$2t = _export;
var DESCRIPTORS$v = descriptors;
var USE_NATIVE_URL$1 = nativeUrl;
var global$E = global$1;
var defineProperties$2 = objectDefineProperties;
var redefine$g = redefine.exports;
var anInstance$8 = anInstance;
var has$k = has;
var assign$1 = objectAssign;
var arrayFrom$1 = arrayFrom;
var codeAt$1 = stringMultibyte.codeAt;
var toASCII = stringPunycodeToAscii;
var setToStringTag$b = setToStringTag;
var URLSearchParamsModule = web_urlSearchParams;
var InternalStateModule$b = internalState;

var NativeURL = global$E.URL;
var URLSearchParams$1 = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;
var setInternalState$b = InternalStateModule$b.set;
var getInternalURLState = InternalStateModule$b.getterFor('URL');
var floor$9 = Math.floor;
var pow$4 = Math.pow;

var INVALID_AUTHORITY = 'Invalid authority';
var INVALID_SCHEME = 'Invalid scheme';
var INVALID_HOST = 'Invalid host';
var INVALID_PORT = 'Invalid port';

var ALPHA = /[A-Za-z]/;
var ALPHANUMERIC = /[\d+-.A-Za-z]/;
var DIGIT = /\d/;
var HEX_START = /^(0x|0X)/;
var OCT = /^[0-7]+$/;
var DEC = /^\d+$/;
var HEX = /^[\dA-Fa-f]+$/;
// eslint-disable-next-line no-control-regex
var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/;
// eslint-disable-next-line no-control-regex
var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/;
// eslint-disable-next-line no-control-regex
var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g;
// eslint-disable-next-line no-control-regex
var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
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
    codePoints = arrayFrom$1(input);
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
      if (number >= pow$4(256, 5 - partsLength)) return null;
    } else if (number > 255) return null;
  }
  ipv4 = numbers.pop();
  for (index = 0; index < numbers.length; index++) {
    ipv4 += numbers[index] * pow$4(256, 3 - index);
  }
  return ipv4;
};

// eslint-disable-next-line max-statements
var parseIPv6 = function (input) {
  var address = [0, 0, 0, 0, 0, 0, 0, 0];
  var pieceIndex = 0;
  var compress = null;
  var pointer = 0;
  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

  var char = function () {
    return input.charAt(pointer);
  };

  if (char() == ':') {
    if (input.charAt(1) != ':') return;
    pointer += 2;
    pieceIndex++;
    compress = pieceIndex;
  }
  while (char()) {
    if (pieceIndex == 8) return;
    if (char() == ':') {
      if (compress !== null) return;
      pointer++;
      pieceIndex++;
      compress = pieceIndex;
      continue;
    }
    value = length = 0;
    while (length < 4 && HEX.test(char())) {
      value = value * 16 + parseInt(char(), 16);
      pointer++;
      length++;
    }
    if (char() == '.') {
      if (length == 0) return;
      pointer -= length;
      if (pieceIndex > 6) return;
      numbersSeen = 0;
      while (char()) {
        ipv4Piece = null;
        if (numbersSeen > 0) {
          if (char() == '.' && numbersSeen < 4) pointer++;
          else return;
        }
        if (!DIGIT.test(char())) return;
        while (DIGIT.test(char())) {
          number = parseInt(char(), 10);
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
    } else if (char() == ':') {
      pointer++;
      if (!char()) return;
    } else if (char()) return;
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
      host = floor$9(host / 256);
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
var fragmentPercentEncodeSet = assign$1({}, C0ControlPercentEncodeSet, {
  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
});
var pathPercentEncodeSet = assign$1({}, fragmentPercentEncodeSet, {
  '#': 1, '?': 1, '{': 1, '}': 1
});
var userinfoPercentEncodeSet = assign$1({}, pathPercentEncodeSet, {
  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
});

var percentEncode = function (char, set) {
  var code = codeAt$1(char, 0);
  return code > 0x20 && code < 0x7F && !has$k(set, char) ? char : encodeURIComponent(char);
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
  return has$k(specialSchemes, url.scheme);
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

// eslint-disable-next-line max-statements
var parseURL = function (url, input, stateOverride, base) {
  var state = stateOverride || SCHEME_START;
  var pointer = 0;
  var buffer = '';
  var seenAt = false;
  var seenBracket = false;
  var seenPasswordToken = false;
  var codePoints, char, bufferCodePoints, failure;

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

  codePoints = arrayFrom$1(input);

  while (pointer <= codePoints.length) {
    char = codePoints[pointer];
    switch (state) {
      case SCHEME_START:
        if (char && ALPHA.test(char)) {
          buffer += char.toLowerCase();
          state = SCHEME;
        } else if (!stateOverride) {
          state = NO_SCHEME;
          continue;
        } else return INVALID_SCHEME;
        break;

      case SCHEME:
        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
          buffer += char.toLowerCase();
        } else if (char == ':') {
          if (stateOverride && (
            (isSpecial(url) != has$k(specialSchemes, buffer)) ||
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
        if (!base || (base.cannotBeABaseURL && char != '#')) return INVALID_SCHEME;
        if (base.cannotBeABaseURL && char == '#') {
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
        if (char == '/' && codePoints[pointer + 1] == '/') {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
          pointer++;
        } else {
          state = RELATIVE;
          continue;
        } break;

      case PATH_OR_AUTHORITY:
        if (char == '/') {
          state = AUTHORITY;
          break;
        } else {
          state = PATH;
          continue;
        }

      case RELATIVE:
        url.scheme = base.scheme;
        if (char == EOF) {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = base.query;
        } else if (char == '/' || (char == '\\' && isSpecial(url))) {
          state = RELATIVE_SLASH;
        } else if (char == '?') {
          url.username = base.username;
          url.password = base.password;
          url.host = base.host;
          url.port = base.port;
          url.path = base.path.slice();
          url.query = '';
          state = QUERY;
        } else if (char == '#') {
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
        if (isSpecial(url) && (char == '/' || char == '\\')) {
          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
        } else if (char == '/') {
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
        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
        pointer++;
        break;

      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
        if (char != '/' && char != '\\') {
          state = AUTHORITY;
          continue;
        } break;

      case AUTHORITY:
        if (char == '@') {
          if (seenAt) buffer = '%40' + buffer;
          seenAt = true;
          bufferCodePoints = arrayFrom$1(buffer);
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
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url))
        ) {
          if (seenAt && buffer == '') return INVALID_AUTHORITY;
          pointer -= arrayFrom$1(buffer).length + 1;
          buffer = '';
          state = HOST;
        } else buffer += char;
        break;

      case HOST:
      case HOSTNAME:
        if (stateOverride && url.scheme == 'file') {
          state = FILE_HOST;
          continue;
        } else if (char == ':' && !seenBracket) {
          if (buffer == '') return INVALID_HOST;
          failure = parseHost(url, buffer);
          if (failure) return failure;
          buffer = '';
          state = PORT;
          if (stateOverride == HOSTNAME) return;
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url))
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
          if (char == '[') seenBracket = true;
          else if (char == ']') seenBracket = false;
          buffer += char;
        } break;

      case PORT:
        if (DIGIT.test(char)) {
          buffer += char;
        } else if (
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url)) ||
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
        if (char == '/' || char == '\\') state = FILE_SLASH;
        else if (base && base.scheme == 'file') {
          if (char == EOF) {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = base.query;
          } else if (char == '?') {
            url.host = base.host;
            url.path = base.path.slice();
            url.query = '';
            state = QUERY;
          } else if (char == '#') {
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
        if (char == '/' || char == '\\') {
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
        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
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
        } else buffer += char;
        break;

      case PATH_START:
        if (isSpecial(url)) {
          state = PATH;
          if (char != '/' && char != '\\') continue;
        } else if (!stateOverride && char == '?') {
          url.query = '';
          state = QUERY;
        } else if (!stateOverride && char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          state = PATH;
          if (char != '/') continue;
        } break;

      case PATH:
        if (
          char == EOF || char == '/' ||
          (char == '\\' && isSpecial(url)) ||
          (!stateOverride && (char == '?' || char == '#'))
        ) {
          if (isDoubleDot(buffer)) {
            shortenURLsPath(url);
            if (char != '/' && !(char == '\\' && isSpecial(url))) {
              url.path.push('');
            }
          } else if (isSingleDot(buffer)) {
            if (char != '/' && !(char == '\\' && isSpecial(url))) {
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
          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
            while (url.path.length > 1 && url.path[0] === '') {
              url.path.shift();
            }
          }
          if (char == '?') {
            url.query = '';
            state = QUERY;
          } else if (char == '#') {
            url.fragment = '';
            state = FRAGMENT;
          }
        } else {
          buffer += percentEncode(char, pathPercentEncodeSet);
        } break;

      case CANNOT_BE_A_BASE_URL_PATH:
        if (char == '?') {
          url.query = '';
          state = QUERY;
        } else if (char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
        } break;

      case QUERY:
        if (!stateOverride && char == '#') {
          url.fragment = '';
          state = FRAGMENT;
        } else if (char != EOF) {
          if (char == "'" && isSpecial(url)) url.query += '%27';
          else if (char == '#') url.query += '%23';
          else url.query += percentEncode(char, C0ControlPercentEncodeSet);
        } break;

      case FRAGMENT:
        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
        break;
    }

    pointer++;
  }
};

// `URL` constructor
// https://url.spec.whatwg.org/#url-class
var URLConstructor = function URL(url /* , base */) {
  var that = anInstance$8(this, URLConstructor, 'URL');
  var base = arguments.length > 1 ? arguments[1] : undefined;
  var urlString = String(url);
  var state = setInternalState$b(that, { type: 'URL' });
  var baseState, failure;
  if (base !== undefined) {
    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
    else {
      failure = parseURL(baseState = {}, String(base));
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
  if (!DESCRIPTORS$v) {
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
    return new URL(scheme.path[0]).origin;
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

if (DESCRIPTORS$v) {
  defineProperties$2(URLPrototype, {
    // `URL.prototype.href` accessors pair
    // https://url.spec.whatwg.org/#dom-url-href
    href: accessorDescriptor(serializeURL, function (href) {
      var url = getInternalURLState(this);
      var urlString = String(href);
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
      parseURL(url, String(protocol) + ':', SCHEME_START);
    }),
    // `URL.prototype.username` accessors pair
    // https://url.spec.whatwg.org/#dom-url-username
    username: accessorDescriptor(getUsername, function (username) {
      var url = getInternalURLState(this);
      var codePoints = arrayFrom$1(String(username));
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
      var codePoints = arrayFrom$1(String(password));
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
      parseURL(url, String(host), HOST);
    }),
    // `URL.prototype.hostname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-hostname
    hostname: accessorDescriptor(getHostname, function (hostname) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      parseURL(url, String(hostname), HOSTNAME);
    }),
    // `URL.prototype.port` accessors pair
    // https://url.spec.whatwg.org/#dom-url-port
    port: accessorDescriptor(getPort, function (port) {
      var url = getInternalURLState(this);
      if (cannotHaveUsernamePasswordPort(url)) return;
      port = String(port);
      if (port == '') url.port = null;
      else parseURL(url, port, PORT);
    }),
    // `URL.prototype.pathname` accessors pair
    // https://url.spec.whatwg.org/#dom-url-pathname
    pathname: accessorDescriptor(getPathname, function (pathname) {
      var url = getInternalURLState(this);
      if (url.cannotBeABaseURL) return;
      url.path = [];
      parseURL(url, pathname + '', PATH_START);
    }),
    // `URL.prototype.search` accessors pair
    // https://url.spec.whatwg.org/#dom-url-search
    search: accessorDescriptor(getSearch, function (search) {
      var url = getInternalURLState(this);
      search = String(search);
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
      hash = String(hash);
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
redefine$g(URLPrototype, 'toJSON', function toJSON() {
  return serializeURL.call(this);
}, { enumerable: true });

// `URL.prototype.toString` method
// https://url.spec.whatwg.org/#URL-stringification-behavior
redefine$g(URLPrototype, 'toString', function toString() {
  return serializeURL.call(this);
}, { enumerable: true });

if (NativeURL) {
  var nativeCreateObjectURL = NativeURL.createObjectURL;
  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
  // `URL.createObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeCreateObjectURL) redefine$g(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
    return nativeCreateObjectURL.apply(NativeURL, arguments);
  });
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeRevokeObjectURL) redefine$g(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
    return nativeRevokeObjectURL.apply(NativeURL, arguments);
  });
}

setToStringTag$b(URLConstructor, 'URL');

$$2t({ global: true, forced: !USE_NATIVE_URL$1, sham: !DESCRIPTORS$v }, {
  URL: URLConstructor
});

var $$2u = _export;

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
$$2u({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return URL.prototype.toString.call(this);
  }
});

var $$2v = _export;
var $filterOut = arrayIteration.filterOut;
var addToUnscopables$9 = addToUnscopables;

// `Array.prototype.filterOut` method
// https://github.com/tc39/proposal-array-filtering
$$2v({ target: 'Array', proto: true }, {
  filterOut: function filterOut(callbackfn /* , thisArg */) {
    return $filterOut(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$9('filterOut');

var ArrayBufferViewCore$p = arrayBufferViewCore;
var $filterOut$1 = arrayIteration.filterOut;
var speciesConstructor$a = speciesConstructor;

var aTypedArray$n = ArrayBufferViewCore$p.aTypedArray;
var aTypedArrayConstructor$7 = ArrayBufferViewCore$p.aTypedArrayConstructor;
var exportTypedArrayMethod$o = ArrayBufferViewCore$p.exportTypedArrayMethod;

// `%TypedArray%.prototype.filterOut` method
// https://github.com/tc39/proposal-array-filtering
exportTypedArrayMethod$o('filterOut', function filterOut(callbackfn /* , thisArg */) {
  var list = $filterOut$1(aTypedArray$n(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  var C = speciesConstructor$a(this, this.constructor);
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor$7(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
});

var DESCRIPTORS$w = descriptors;
var addToUnscopables$a = addToUnscopables;
var toObject$o = toObject;
var toLength$u = toLength;
var defineProperty$d = objectDefineProperty.f;

// `Array.prototype.lastIndex` getter
// https://github.com/keithamus/proposal-array-last
if (DESCRIPTORS$w && !('lastIndex' in [])) {
  defineProperty$d(Array.prototype, 'lastIndex', {
    configurable: true,
    get: function lastIndex() {
      var O = toObject$o(this);
      var len = toLength$u(O.length);
      return len == 0 ? 0 : len - 1;
    }
  });

  addToUnscopables$a('lastIndex');
}

var DESCRIPTORS$x = descriptors;
var addToUnscopables$b = addToUnscopables;
var toObject$p = toObject;
var toLength$v = toLength;
var defineProperty$e = objectDefineProperty.f;

// `Array.prototype.lastIndex` accessor
// https://github.com/keithamus/proposal-array-last
if (DESCRIPTORS$x && !('lastItem' in [])) {
  defineProperty$e(Array.prototype, 'lastItem', {
    configurable: true,
    get: function lastItem() {
      var O = toObject$p(this);
      var len = toLength$v(O.length);
      return len == 0 ? undefined : O[len - 1];
    },
    set: function lastItem(value) {
      var O = toObject$p(this);
      var len = toLength$v(O.length);
      return O[len == 0 ? 0 : len - 1] = value;
    }
  });

  addToUnscopables$b('lastItem');
}

var $$2w = _export;
var toLength$w = toLength;
var toObject$q = toObject;
var getBuiltIn$e = getBuiltIn;
var arraySpeciesCreate$6 = arraySpeciesCreate;
var addToUnscopables$c = addToUnscopables;

var push$1 = [].push;

// `Array.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
$$2w({ target: 'Array', proto: true }, {
  uniqueBy: function uniqueBy(resolver) {
    var that = toObject$q(this);
    var length = toLength$w(that.length);
    var result = arraySpeciesCreate$6(that, 0);
    var Map = getBuiltIn$e('Map');
    var map = new Map();
    var resolverFunction, index, item, key;
    if (typeof resolver == 'function') resolverFunction = resolver;
    else if (resolver == null) resolverFunction = function (value) {
      return value;
    };
    else throw new TypeError('Incorrect resolver!');
    for (index = 0; index < length; index++) {
      item = that[index];
      key = resolverFunction(item);
      if (!map.has(key)) map.set(key, item);
    }
    map.forEach(function (value) {
      push$1.call(result, value);
    });
    return result;
  }
});

addToUnscopables$c('uniqueBy');

var $$2x = _export;
var iterate$a = iterate;
var aFunction$h = aFunction$1;

// `Map.groupBy` method
// https://github.com/tc39/proposal-collection-methods
$$2x({ target: 'Map', stat: true }, {
  groupBy: function groupBy(iterable, keyDerivative) {
    var newMap = new this();
    aFunction$h(keyDerivative);
    var has = aFunction$h(newMap.has);
    var get = aFunction$h(newMap.get);
    var set = aFunction$h(newMap.set);
    iterate$a(iterable, function (element) {
      var derivedKey = keyDerivative(element);
      if (!has.call(newMap, derivedKey)) set.call(newMap, derivedKey, [element]);
      else get.call(newMap, derivedKey).push(element);
    });
    return newMap;
  }
});

var $$2y = _export;
var iterate$b = iterate;
var aFunction$i = aFunction$1;

// `Map.keyBy` method
// https://github.com/tc39/proposal-collection-methods
$$2y({ target: 'Map', stat: true }, {
  keyBy: function keyBy(iterable, keyDerivative) {
    var newMap = new this();
    aFunction$i(keyDerivative);
    var setter = aFunction$i(newMap.set);
    iterate$b(iterable, function (element) {
      setter.call(newMap, keyDerivative(element), element);
    });
    return newMap;
  }
});

var anObject$I = anObject;
var aFunction$j = aFunction$1;

// https://github.com/tc39/collection-methods
var collectionDeleteAll = function (/* ...elements */) {
  var collection = anObject$I(this);
  var remover = aFunction$j(collection['delete']);
  var allDeleted = true;
  var wasDeleted;
  for (var k = 0, len = arguments.length; k < len; k++) {
    wasDeleted = remover.call(collection, arguments[k]);
    allDeleted = allDeleted && wasDeleted;
  }
  return !!allDeleted;
};

var $$2z = _export;
var IS_PURE$2 = isPure;
var collectionDeleteAll$1 = collectionDeleteAll;

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$2z({ target: 'Map', proto: true, real: true, forced: IS_PURE$2 }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll$1.apply(this, arguments);
  }
});

var getMapIterator = function (it) {
  // eslint-disable-next-line no-undef
  return Map.prototype.entries.call(it);
};

var $$2A = _export;
var IS_PURE$3 = isPure;
var anObject$J = anObject;
var bind$b = functionBindContext;
var getMapIterator$1 = getMapIterator;
var iterate$c = iterate;

// `Map.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
$$2A({ target: 'Map', proto: true, real: true, forced: IS_PURE$3 }, {
  every: function every(callbackfn /* , thisArg */) {
    var map = anObject$J(this);
    var iterator = getMapIterator$1(map);
    var boundFunction = bind$b(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return !iterate$c(iterator, function (key, value, stop) {
      if (!boundFunction(value, key, map)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$2B = _export;
var IS_PURE$4 = isPure;
var getBuiltIn$f = getBuiltIn;
var anObject$K = anObject;
var aFunction$k = aFunction$1;
var bind$c = functionBindContext;
var speciesConstructor$b = speciesConstructor;
var getMapIterator$2 = getMapIterator;
var iterate$d = iterate;

// `Map.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$$2B({ target: 'Map', proto: true, real: true, forced: IS_PURE$4 }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var map = anObject$K(this);
    var iterator = getMapIterator$2(map);
    var boundFunction = bind$c(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor$b(map, getBuiltIn$f('Map')))();
    var setter = aFunction$k(newMap.set);
    iterate$d(iterator, function (key, value) {
      if (boundFunction(value, key, map)) setter.call(newMap, key, value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

var $$2C = _export;
var IS_PURE$5 = isPure;
var anObject$L = anObject;
var bind$d = functionBindContext;
var getMapIterator$3 = getMapIterator;
var iterate$e = iterate;

// `Map.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$$2C({ target: 'Map', proto: true, real: true, forced: IS_PURE$5 }, {
  find: function find(callbackfn /* , thisArg */) {
    var map = anObject$L(this);
    var iterator = getMapIterator$3(map);
    var boundFunction = bind$d(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$e(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop(value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

var $$2D = _export;
var IS_PURE$6 = isPure;
var anObject$M = anObject;
var bind$e = functionBindContext;
var getMapIterator$4 = getMapIterator;
var iterate$f = iterate;

// `Map.prototype.findKey` method
// https://github.com/tc39/proposal-collection-methods
$$2D({ target: 'Map', proto: true, real: true, forced: IS_PURE$6 }, {
  findKey: function findKey(callbackfn /* , thisArg */) {
    var map = anObject$M(this);
    var iterator = getMapIterator$4(map);
    var boundFunction = bind$e(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$f(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop(key);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// `SameValueZero` abstract operation
// https://tc39.es/ecma262/#sec-samevaluezero
var sameValueZero = function (x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y || x != x && y != y;
};

var $$2E = _export;
var IS_PURE$7 = isPure;
var anObject$N = anObject;
var getMapIterator$5 = getMapIterator;
var sameValueZero$1 = sameValueZero;
var iterate$g = iterate;

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
$$2E({ target: 'Map', proto: true, real: true, forced: IS_PURE$7 }, {
  includes: function includes(searchElement) {
    return iterate$g(getMapIterator$5(anObject$N(this)), function (key, value, stop) {
      if (sameValueZero$1(value, searchElement)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$2F = _export;
var IS_PURE$8 = isPure;
var anObject$O = anObject;
var getMapIterator$6 = getMapIterator;
var iterate$h = iterate;

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
$$2F({ target: 'Map', proto: true, real: true, forced: IS_PURE$8 }, {
  keyOf: function keyOf(searchElement) {
    return iterate$h(getMapIterator$6(anObject$O(this)), function (key, value, stop) {
      if (value === searchElement) return stop(key);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

var $$2G = _export;
var IS_PURE$9 = isPure;
var getBuiltIn$g = getBuiltIn;
var anObject$P = anObject;
var aFunction$l = aFunction$1;
var bind$f = functionBindContext;
var speciesConstructor$c = speciesConstructor;
var getMapIterator$7 = getMapIterator;
var iterate$i = iterate;

// `Map.prototype.mapKeys` method
// https://github.com/tc39/proposal-collection-methods
$$2G({ target: 'Map', proto: true, real: true, forced: IS_PURE$9 }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = anObject$P(this);
    var iterator = getMapIterator$7(map);
    var boundFunction = bind$f(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor$c(map, getBuiltIn$g('Map')))();
    var setter = aFunction$l(newMap.set);
    iterate$i(iterator, function (key, value) {
      setter.call(newMap, boundFunction(value, key, map), value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

var $$2H = _export;
var IS_PURE$a = isPure;
var getBuiltIn$h = getBuiltIn;
var anObject$Q = anObject;
var aFunction$m = aFunction$1;
var bind$g = functionBindContext;
var speciesConstructor$d = speciesConstructor;
var getMapIterator$8 = getMapIterator;
var iterate$j = iterate;

// `Map.prototype.mapValues` method
// https://github.com/tc39/proposal-collection-methods
$$2H({ target: 'Map', proto: true, real: true, forced: IS_PURE$a }, {
  mapValues: function mapValues(callbackfn /* , thisArg */) {
    var map = anObject$Q(this);
    var iterator = getMapIterator$8(map);
    var boundFunction = bind$g(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor$d(map, getBuiltIn$h('Map')))();
    var setter = aFunction$m(newMap.set);
    iterate$j(iterator, function (key, value) {
      setter.call(newMap, key, boundFunction(value, key, map));
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

var $$2I = _export;
var IS_PURE$b = isPure;
var anObject$R = anObject;
var aFunction$n = aFunction$1;
var iterate$k = iterate;

// `Map.prototype.merge` method
// https://github.com/tc39/proposal-collection-methods
$$2I({ target: 'Map', proto: true, real: true, forced: IS_PURE$b }, {
  // eslint-disable-next-line no-unused-vars
  merge: function merge(iterable /* ...iterbles */) {
    var map = anObject$R(this);
    var setter = aFunction$n(map.set);
    var i = 0;
    while (i < arguments.length) {
      iterate$k(arguments[i++], setter, { that: map, AS_ENTRIES: true });
    }
    return map;
  }
});

var $$2J = _export;
var IS_PURE$c = isPure;
var anObject$S = anObject;
var aFunction$o = aFunction$1;
var getMapIterator$9 = getMapIterator;
var iterate$l = iterate;

// `Map.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$$2J({ target: 'Map', proto: true, real: true, forced: IS_PURE$c }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var map = anObject$S(this);
    var iterator = getMapIterator$9(map);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aFunction$o(callbackfn);
    iterate$l(iterator, function (key, value) {
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

var $$2K = _export;
var IS_PURE$d = isPure;
var anObject$T = anObject;
var bind$h = functionBindContext;
var getMapIterator$a = getMapIterator;
var iterate$m = iterate;

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
$$2K({ target: 'Map', proto: true, real: true, forced: IS_PURE$d }, {
  some: function some(callbackfn /* , thisArg */) {
    var map = anObject$T(this);
    var iterator = getMapIterator$a(map);
    var boundFunction = bind$h(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$m(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$2L = _export;
var IS_PURE$e = isPure;
var anObject$U = anObject;
var aFunction$p = aFunction$1;

// `Set.prototype.update` method
// https://github.com/tc39/proposal-collection-methods
$$2L({ target: 'Map', proto: true, real: true, forced: IS_PURE$e }, {
  update: function update(key, callback /* , thunk */) {
    var map = anObject$U(this);
    var length = arguments.length;
    aFunction$p(callback);
    var isPresentInMap = map.has(key);
    if (!isPresentInMap && length < 3) {
      throw TypeError('Updating absent value');
    }
    var value = isPresentInMap ? map.get(key) : aFunction$p(length > 2 ? arguments[2] : undefined)(key, map);
    map.set(key, callback(value, key, map));
    return map;
  }
});

var anObject$V = anObject;
var aFunction$q = aFunction$1;

// https://github.com/tc39/collection-methods
var collectionAddAll = function (/* ...elements */) {
  var set = anObject$V(this);
  var adder = aFunction$q(set.add);
  for (var k = 0, len = arguments.length; k < len; k++) {
    adder.call(set, arguments[k]);
  }
  return set;
};

var $$2M = _export;
var IS_PURE$f = isPure;
var collectionAddAll$1 = collectionAddAll;

// `Set.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$$2M({ target: 'Set', proto: true, real: true, forced: IS_PURE$f }, {
  addAll: function addAll(/* ...elements */) {
    return collectionAddAll$1.apply(this, arguments);
  }
});

var $$2N = _export;
var IS_PURE$g = isPure;
var collectionDeleteAll$2 = collectionDeleteAll;

// `Set.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$2N({ target: 'Set', proto: true, real: true, forced: IS_PURE$g }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll$2.apply(this, arguments);
  }
});

var getSetIterator = function (it) {
  // eslint-disable-next-line no-undef
  return Set.prototype.values.call(it);
};

var $$2O = _export;
var IS_PURE$h = isPure;
var anObject$W = anObject;
var bind$i = functionBindContext;
var getSetIterator$1 = getSetIterator;
var iterate$n = iterate;

// `Set.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
$$2O({ target: 'Set', proto: true, real: true, forced: IS_PURE$h }, {
  every: function every(callbackfn /* , thisArg */) {
    var set = anObject$W(this);
    var iterator = getSetIterator$1(set);
    var boundFunction = bind$i(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return !iterate$n(iterator, function (value, stop) {
      if (!boundFunction(value, value, set)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$2P = _export;
var IS_PURE$i = isPure;
var getBuiltIn$i = getBuiltIn;
var anObject$X = anObject;
var aFunction$r = aFunction$1;
var bind$j = functionBindContext;
var speciesConstructor$e = speciesConstructor;
var getSetIterator$2 = getSetIterator;
var iterate$o = iterate;

// `Set.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$$2P({ target: 'Set', proto: true, real: true, forced: IS_PURE$i }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var set = anObject$X(this);
    var iterator = getSetIterator$2(set);
    var boundFunction = bind$j(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newSet = new (speciesConstructor$e(set, getBuiltIn$i('Set')))();
    var adder = aFunction$r(newSet.add);
    iterate$o(iterator, function (value) {
      if (boundFunction(value, value, set)) adder.call(newSet, value);
    }, { IS_ITERATOR: true });
    return newSet;
  }
});

var $$2Q = _export;
var IS_PURE$j = isPure;
var anObject$Y = anObject;
var bind$k = functionBindContext;
var getSetIterator$3 = getSetIterator;
var iterate$p = iterate;

// `Set.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$$2Q({ target: 'Set', proto: true, real: true, forced: IS_PURE$j }, {
  find: function find(callbackfn /* , thisArg */) {
    var set = anObject$Y(this);
    var iterator = getSetIterator$3(set);
    var boundFunction = bind$k(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$p(iterator, function (value, stop) {
      if (boundFunction(value, value, set)) return stop(value);
    }, { IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

var $$2R = _export;
var IS_PURE$k = isPure;
var anObject$Z = anObject;
var getSetIterator$4 = getSetIterator;
var iterate$q = iterate;

// `Set.prototype.join` method
// https://github.com/tc39/proposal-collection-methods
$$2R({ target: 'Set', proto: true, real: true, forced: IS_PURE$k }, {
  join: function join(separator) {
    var set = anObject$Z(this);
    var iterator = getSetIterator$4(set);
    var sep = separator === undefined ? ',' : String(separator);
    var result = [];
    iterate$q(iterator, result.push, { that: result, IS_ITERATOR: true });
    return result.join(sep);
  }
});

var $$2S = _export;
var IS_PURE$l = isPure;
var getBuiltIn$j = getBuiltIn;
var anObject$_ = anObject;
var aFunction$s = aFunction$1;
var bind$l = functionBindContext;
var speciesConstructor$f = speciesConstructor;
var getSetIterator$5 = getSetIterator;
var iterate$r = iterate;

// `Set.prototype.map` method
// https://github.com/tc39/proposal-collection-methods
$$2S({ target: 'Set', proto: true, real: true, forced: IS_PURE$l }, {
  map: function map(callbackfn /* , thisArg */) {
    var set = anObject$_(this);
    var iterator = getSetIterator$5(set);
    var boundFunction = bind$l(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newSet = new (speciesConstructor$f(set, getBuiltIn$j('Set')))();
    var adder = aFunction$s(newSet.add);
    iterate$r(iterator, function (value) {
      adder.call(newSet, boundFunction(value, value, set));
    }, { IS_ITERATOR: true });
    return newSet;
  }
});

var $$2T = _export;
var IS_PURE$m = isPure;
var anObject$$ = anObject;
var aFunction$t = aFunction$1;
var getSetIterator$6 = getSetIterator;
var iterate$s = iterate;

// `Set.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$$2T({ target: 'Set', proto: true, real: true, forced: IS_PURE$m }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var set = anObject$$(this);
    var iterator = getSetIterator$6(set);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aFunction$t(callbackfn);
    iterate$s(iterator, function (value) {
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

var $$2U = _export;
var IS_PURE$n = isPure;
var anObject$10 = anObject;
var bind$m = functionBindContext;
var getSetIterator$7 = getSetIterator;
var iterate$t = iterate;

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
$$2U({ target: 'Set', proto: true, real: true, forced: IS_PURE$n }, {
  some: function some(callbackfn /* , thisArg */) {
    var set = anObject$10(this);
    var iterator = getSetIterator$7(set);
    var boundFunction = bind$m(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$t(iterator, function (value, stop) {
      if (boundFunction(value, value, set)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$2V = _export;
var IS_PURE$o = isPure;
var collectionDeleteAll$3 = collectionDeleteAll;

// `WeakMap.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$2V({ target: 'WeakMap', proto: true, real: true, forced: IS_PURE$o }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll$3.apply(this, arguments);
  }
});

var $$2W = _export;
var IS_PURE$p = isPure;
var collectionAddAll$2 = collectionAddAll;

// `WeakSet.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$$2W({ target: 'WeakSet', proto: true, real: true, forced: IS_PURE$p }, {
  addAll: function addAll(/* ...elements */) {
    return collectionAddAll$2.apply(this, arguments);
  }
});

var $$2X = _export;
var IS_PURE$q = isPure;
var collectionDeleteAll$4 = collectionDeleteAll;

// `WeakSet.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$2X({ target: 'WeakSet', proto: true, real: true, forced: IS_PURE$q }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll$4.apply(this, arguments);
  }
});

// https://tc39.github.io/proposal-setmap-offrom/
var aFunction$u = aFunction$1;
var bind$n = functionBindContext;
var iterate$u = iterate;

var collectionFrom = function from(source /* , mapFn, thisArg */) {
  var length = arguments.length;
  var mapFn = length > 1 ? arguments[1] : undefined;
  var mapping, array, n, boundFunction;
  aFunction$u(this);
  mapping = mapFn !== undefined;
  if (mapping) aFunction$u(mapFn);
  if (source == undefined) return new this();
  array = [];
  if (mapping) {
    n = 0;
    boundFunction = bind$n(mapFn, length > 2 ? arguments[2] : undefined, 2);
    iterate$u(source, function (nextItem) {
      array.push(boundFunction(nextItem, n++));
    });
  } else {
    iterate$u(source, array.push, { that: array });
  }
  return new this(array);
};

var $$2Y = _export;
var from$2 = collectionFrom;

// `Map.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
$$2Y({ target: 'Map', stat: true }, {
  from: from$2
});

// https://tc39.github.io/proposal-setmap-offrom/
var collectionOf = function of() {
  var length = arguments.length;
  var A = new Array(length);
  while (length--) A[length] = arguments[length];
  return new this(A);
};

var $$2Z = _export;
var of = collectionOf;

// `Map.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
$$2Z({ target: 'Map', stat: true }, {
  of: of
});

var $$2_ = _export;
var from$3 = collectionFrom;

// `Set.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
$$2_({ target: 'Set', stat: true }, {
  from: from$3
});

var $$2$ = _export;
var of$1 = collectionOf;

// `Set.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
$$2$({ target: 'Set', stat: true }, {
  of: of$1
});

var $$30 = _export;
var from$4 = collectionFrom;

// `WeakMap.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from
$$30({ target: 'WeakMap', stat: true }, {
  from: from$4
});

var $$31 = _export;
var of$2 = collectionOf;

// `WeakMap.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of
$$31({ target: 'WeakMap', stat: true }, {
  of: of$2
});

var $$32 = _export;
var from$5 = collectionFrom;

// `WeakSet.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.from
$$32({ target: 'WeakSet', stat: true }, {
  from: from$5
});

var $$33 = _export;
var of$3 = collectionOf;

// `WeakSet.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of
$$33({ target: 'WeakSet', stat: true }, {
  of: of$3
});

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
var Map$2 = es_map;
var WeakMap$3 = es_weakMap.exports;
var create$9 = objectCreate;
var isObject$z = isObject;

var Node = function () {
  // keys
  this.object = null;
  this.symbol = null;
  // child nodes
  this.primitives = null;
  this.objectsByIndex = create$9(null);
};

Node.prototype.get = function (key, initializer) {
  return this[key] || (this[key] = initializer());
};

Node.prototype.next = function (i, it, IS_OBJECT) {
  var store = IS_OBJECT
    ? this.objectsByIndex[i] || (this.objectsByIndex[i] = new WeakMap$3())
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
    if (isObject$z(it = arguments[i])) active = active.next(i, it, true);
  }
  if (this === Object && active === root) throw TypeError('Composite keys must contain a non-primitive component');
  for (i = 0; i < length; i++) {
    if (!isObject$z(it = arguments[i])) active = active.next(i, it, false);
  } return active;
};

var $$34 = _export;
var getCompositeKeyNode = compositeKey;
var getBuiltIn$k = getBuiltIn;
var create$a = objectCreate;

var initializer = function () {
  var freeze = getBuiltIn$k('Object', 'freeze');
  return freeze ? freeze(create$a(null)) : create$a(null);
};

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$$34({ global: true }, {
  compositeKey: function compositeKey() {
    return getCompositeKeyNode.apply(Object, arguments).get('object', initializer);
  }
});

var $$35 = _export;
var getCompositeKeyNode$1 = compositeKey;
var getBuiltIn$l = getBuiltIn;

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$$35({ global: true }, {
  compositeSymbol: function compositeSymbol() {
    if (arguments.length === 1 && typeof arguments[0] === 'string') return getBuiltIn$l('Symbol')['for'](arguments[0]);
    return getCompositeKeyNode$1.apply(null, arguments).get('symbol', getBuiltIn$l('Symbol'));
  }
});

var $$36 = _export;

var min$9 = Math.min;
var max$5 = Math.max;

// `Math.clamp` method
// https://rwaldron.github.io/proposal-math-extensions/
$$36({ target: 'Math', stat: true }, {
  clamp: function clamp(x, lower, upper) {
    return min$9(upper, max$5(lower, x));
  }
});

var $$37 = _export;

// `Math.DEG_PER_RAD` constant
// https://rwaldron.github.io/proposal-math-extensions/
$$37({ target: 'Math', stat: true }, {
  DEG_PER_RAD: Math.PI / 180
});

var $$38 = _export;

var RAD_PER_DEG = 180 / Math.PI;

// `Math.degrees` method
// https://rwaldron.github.io/proposal-math-extensions/
$$38({ target: 'Math', stat: true }, {
  degrees: function degrees(radians) {
    return radians * RAD_PER_DEG;
  }
});

// `Math.scale` method implementation
// https://rwaldron.github.io/proposal-math-extensions/
var mathScale = Math.scale || function scale(x, inLow, inHigh, outLow, outHigh) {
  if (
    arguments.length === 0
      /* eslint-disable no-self-compare */
      || x != x
      || inLow != inLow
      || inHigh != inHigh
      || outLow != outLow
      || outHigh != outHigh
      /* eslint-enable no-self-compare */
  ) return NaN;
  if (x === Infinity || x === -Infinity) return x;
  return (x - inLow) * (outHigh - outLow) / (inHigh - inLow) + outLow;
};

var $$39 = _export;

var scale = mathScale;
var fround$1 = mathFround;

// `Math.fscale` method
// https://rwaldron.github.io/proposal-math-extensions/
$$39({ target: 'Math', stat: true }, {
  fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
    return fround$1(scale(x, inLow, inHigh, outLow, outHigh));
  }
});

var $$3a = _export;

// `Math.RAD_PER_DEG` constant
// https://rwaldron.github.io/proposal-math-extensions/
$$3a({ target: 'Math', stat: true }, {
  RAD_PER_DEG: 180 / Math.PI
});

var $$3b = _export;

var DEG_PER_RAD = Math.PI / 180;

// `Math.radians` method
// https://rwaldron.github.io/proposal-math-extensions/
$$3b({ target: 'Math', stat: true }, {
  radians: function radians(degrees) {
    return degrees * DEG_PER_RAD;
  }
});

var $$3c = _export;
var scale$1 = mathScale;

// `Math.scale` method
// https://rwaldron.github.io/proposal-math-extensions/
$$3c({ target: 'Math', stat: true }, {
  scale: scale$1
});

var $$3d = _export;

// `Math.signbit` method
// https://github.com/tc39/proposal-Math.signbit
$$3d({ target: 'Math', stat: true }, {
  signbit: function signbit(x) {
    return (x = +x) == x && x == 0 ? 1 / x == -Infinity : x < 0;
  }
});

var $$3e = _export;
var toInteger$d = toInteger;
var parseInt$2 = numberParseInt;

var INVALID_NUMBER_REPRESENTATION = 'Invalid number representation';
var INVALID_RADIX = 'Invalid radix';
var valid = /^[\da-z]+$/;

// `Number.fromString` method
// https://github.com/tc39/proposal-number-fromstring
$$3e({ target: 'Number', stat: true }, {
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
    R = radix === undefined ? 10 : toInteger$d(radix);
    if (R < 2 || R > 36) throw RangeError(INVALID_RADIX);
    if (!valid.test(string) || (mathNum = parseInt$2(string, R)).toString(R) !== string) {
      throw SyntaxError(INVALID_NUMBER_REPRESENTATION);
    }
    return sign * mathNum;
  }
});

var InternalStateModule$c = internalState;
var createIteratorConstructor$4 = createIteratorConstructor;
var isObject$A = isObject;
var defineProperties$3 = objectDefineProperties;
var DESCRIPTORS$y = descriptors;

var INCORRECT_RANGE = 'Incorrect Number.range arguments';
var RANGE_ITERATOR = 'RangeIterator';

var setInternalState$c = InternalStateModule$c.set;
var getInternalState$9 = InternalStateModule$c.getterFor(RANGE_ITERATOR);

var $RangeIterator = createIteratorConstructor$4(function RangeIterator(start, end, option, type, zero, one) {
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
  } else if (isObject$A(option)) {
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
  // eslint-disable-next-line no-self-compare
  var hitsEnd = start != start || end != end || step != step || (end > start) !== (step > zero);
  setInternalState$c(this, {
    type: RANGE_ITERATOR,
    start: start,
    end: end,
    step: step,
    inclusiveEnd: inclusiveEnd,
    hitsEnd: hitsEnd,
    currentCount: zero,
    zero: zero
  });
  if (!DESCRIPTORS$y) {
    this.start = start;
    this.end = end;
    this.step = step;
    this.inclusive = inclusiveEnd;
  }
}, RANGE_ITERATOR, function next() {
  var state = getInternalState$9(this);
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

if (DESCRIPTORS$y) {
  defineProperties$3($RangeIterator.prototype, {
    start: getter(function () {
      return getInternalState$9(this).start;
    }),
    end: getter(function () {
      return getInternalState$9(this).end;
    }),
    inclusive: getter(function () {
      return getInternalState$9(this).inclusiveEnd;
    }),
    step: getter(function () {
      return getInternalState$9(this).step;
    })
  });
}

var rangeIterator = $RangeIterator;

var $$3f = _export;
var RangeIterator = rangeIterator;

// `BigInt.range` method
// https://github.com/tc39/proposal-Number.range
if (typeof BigInt == 'function') {
  $$3f({ target: 'BigInt', stat: true }, {
    range: function range(start, end, option) {
      // eslint-disable-next-line no-undef
      return new RangeIterator(start, end, option, 'bigint', BigInt(0), BigInt(1));
    }
  });
}

var $$3g = _export;
var RangeIterator$1 = rangeIterator;

// `Number.range` method
// https://github.com/tc39/proposal-Number.range
$$3g({ target: 'Number', stat: true }, {
  range: function range(start, end, option) {
    return new RangeIterator$1(start, end, option, 'number', 0, 1);
  }
});

var InternalStateModule$d = internalState;
var createIteratorConstructor$5 = createIteratorConstructor;
var has$l = has;
var objectKeys$5 = objectKeys;
var toObject$r = toObject;

var OBJECT_ITERATOR = 'Object Iterator';
var setInternalState$d = InternalStateModule$d.set;
var getInternalState$a = InternalStateModule$d.getterFor(OBJECT_ITERATOR);

var objectIterator = createIteratorConstructor$5(function ObjectIterator(source, mode) {
  var object = toObject$r(source);
  setInternalState$d(this, {
    type: OBJECT_ITERATOR,
    mode: mode,
    object: object,
    keys: objectKeys$5(object),
    index: 0
  });
}, 'Object', function next() {
  var state = getInternalState$a(this);
  var keys = state.keys;
  while (true) {
    if (keys === null || state.index >= keys.length) {
      state.object = state.keys = null;
      return { value: undefined, done: true };
    }
    var key = keys[state.index++];
    var object = state.object;
    if (!has$l(object, key)) continue;
    switch (state.mode) {
      case 'keys': return { value: key, done: false };
      case 'values': return { value: object[key], done: false };
    } /* entries */ return { value: [key, object[key]], done: false };
  }
});

var $$3h = _export;
var ObjectIterator = objectIterator;

// `Object.iterateEntries` method
// https://github.com/tc39/proposal-object-iteration
$$3h({ target: 'Object', stat: true }, {
  iterateEntries: function iterateEntries(object) {
    return new ObjectIterator(object, 'entries');
  }
});

var $$3i = _export;
var ObjectIterator$1 = objectIterator;

// `Object.iterateKeys` method
// https://github.com/tc39/proposal-object-iteration
$$3i({ target: 'Object', stat: true }, {
  iterateKeys: function iterateKeys(object) {
    return new ObjectIterator$1(object, 'keys');
  }
});

var $$3j = _export;
var ObjectIterator$2 = objectIterator;

// `Object.iterateValues` method
// https://github.com/tc39/proposal-object-iteration
$$3j({ target: 'Object', stat: true }, {
  iterateValues: function iterateValues(object) {
    return new ObjectIterator$2(object, 'values');
  }
});

// https://github.com/tc39/proposal-observable
var $$3k = _export;
var DESCRIPTORS$z = descriptors;
var setSpecies$7 = setSpecies;
var aFunction$v = aFunction$1;
var anObject$11 = anObject;
var isObject$B = isObject;
var anInstance$9 = anInstance;
var defineProperty$f = objectDefineProperty.f;
var createNonEnumerableProperty$f = createNonEnumerableProperty;
var redefineAll$7 = redefineAll;
var getIterator$2 = getIterator;
var iterate$v = iterate;
var hostReportErrors$2 = hostReportErrors;
var wellKnownSymbol$v = wellKnownSymbol;
var InternalStateModule$e = internalState;

var OBSERVABLE = wellKnownSymbol$v('observable');
var getInternalState$b = InternalStateModule$e.get;
var setInternalState$e = InternalStateModule$e.set;

var getMethod = function (fn) {
  return fn == null ? undefined : aFunction$v(fn);
};

var cleanupSubscription = function (subscriptionState) {
  var cleanup = subscriptionState.cleanup;
  if (cleanup) {
    subscriptionState.cleanup = undefined;
    try {
      cleanup();
    } catch (error) {
      hostReportErrors$2(error);
    }
  }
};

var subscriptionClosed = function (subscriptionState) {
  return subscriptionState.observer === undefined;
};

var close = function (subscription, subscriptionState) {
  if (!DESCRIPTORS$z) {
    subscription.closed = true;
    var subscriptionObserver = subscriptionState.subscriptionObserver;
    if (subscriptionObserver) subscriptionObserver.closed = true;
  } subscriptionState.observer = undefined;
};

var Subscription = function (observer, subscriber) {
  var subscriptionState = setInternalState$e(this, {
    cleanup: undefined,
    observer: anObject$11(observer),
    subscriptionObserver: undefined
  });
  var start;
  if (!DESCRIPTORS$z) this.closed = false;
  try {
    if (start = getMethod(observer.start)) start.call(observer, this);
  } catch (error) {
    hostReportErrors$2(error);
  }
  if (subscriptionClosed(subscriptionState)) return;
  var subscriptionObserver = subscriptionState.subscriptionObserver = new SubscriptionObserver(this);
  try {
    var cleanup = subscriber(subscriptionObserver);
    var subscription = cleanup;
    if (cleanup != null) subscriptionState.cleanup = typeof cleanup.unsubscribe === 'function'
      ? function () { subscription.unsubscribe(); }
      : aFunction$v(cleanup);
  } catch (error) {
    subscriptionObserver.error(error);
    return;
  } if (subscriptionClosed(subscriptionState)) cleanupSubscription(subscriptionState);
};

Subscription.prototype = redefineAll$7({}, {
  unsubscribe: function unsubscribe() {
    var subscriptionState = getInternalState$b(this);
    if (!subscriptionClosed(subscriptionState)) {
      close(this, subscriptionState);
      cleanupSubscription(subscriptionState);
    }
  }
});

if (DESCRIPTORS$z) defineProperty$f(Subscription.prototype, 'closed', {
  configurable: true,
  get: function () {
    return subscriptionClosed(getInternalState$b(this));
  }
});

var SubscriptionObserver = function (subscription) {
  setInternalState$e(this, { subscription: subscription });
  if (!DESCRIPTORS$z) this.closed = false;
};

SubscriptionObserver.prototype = redefineAll$7({}, {
  next: function next(value) {
    var subscriptionState = getInternalState$b(getInternalState$b(this).subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      try {
        var nextMethod = getMethod(observer.next);
        if (nextMethod) nextMethod.call(observer, value);
      } catch (error) {
        hostReportErrors$2(error);
      }
    }
  },
  error: function error(value) {
    var subscription = getInternalState$b(this).subscription;
    var subscriptionState = getInternalState$b(subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      close(subscription, subscriptionState);
      try {
        var errorMethod = getMethod(observer.error);
        if (errorMethod) errorMethod.call(observer, value);
        else hostReportErrors$2(value);
      } catch (err) {
        hostReportErrors$2(err);
      } cleanupSubscription(subscriptionState);
    }
  },
  complete: function complete() {
    var subscription = getInternalState$b(this).subscription;
    var subscriptionState = getInternalState$b(subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      close(subscription, subscriptionState);
      try {
        var completeMethod = getMethod(observer.complete);
        if (completeMethod) completeMethod.call(observer);
      } catch (error) {
        hostReportErrors$2(error);
      } cleanupSubscription(subscriptionState);
    }
  }
});

if (DESCRIPTORS$z) defineProperty$f(SubscriptionObserver.prototype, 'closed', {
  configurable: true,
  get: function () {
    return subscriptionClosed(getInternalState$b(getInternalState$b(this).subscription));
  }
});

var $Observable = function Observable(subscriber) {
  anInstance$9(this, $Observable, 'Observable');
  setInternalState$e(this, { subscriber: aFunction$v(subscriber) });
};

redefineAll$7($Observable.prototype, {
  subscribe: function subscribe(observer) {
    var length = arguments.length;
    return new Subscription(typeof observer === 'function' ? {
      next: observer,
      error: length > 1 ? arguments[1] : undefined,
      complete: length > 2 ? arguments[2] : undefined
    } : isObject$B(observer) ? observer : {}, getInternalState$b(this).subscriber);
  }
});

redefineAll$7($Observable, {
  from: function from(x) {
    var C = typeof this === 'function' ? this : $Observable;
    var observableMethod = getMethod(anObject$11(x)[OBSERVABLE]);
    if (observableMethod) {
      var observable = anObject$11(observableMethod.call(x));
      return observable.constructor === C ? observable : new C(function (observer) {
        return observable.subscribe(observer);
      });
    }
    var iterator = getIterator$2(x);
    return new C(function (observer) {
      iterate$v(iterator, function (it, stop) {
        observer.next(it);
        if (observer.closed) return stop();
      }, { IS_ITERATOR: true, INTERRUPTED: true });
      observer.complete();
    });
  },
  of: function of() {
    var C = typeof this === 'function' ? this : $Observable;
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

createNonEnumerableProperty$f($Observable.prototype, OBSERVABLE, function () { return this; });

$$3k({ global: true }, {
  Observable: $Observable
});

setSpecies$7('Observable');

var defineWellKnownSymbol$f = defineWellKnownSymbol;

// `Symbol.observable` well-known symbol
// https://github.com/tc39/proposal-observable
defineWellKnownSymbol$f('observable');

var defineWellKnownSymbol$g = defineWellKnownSymbol;

// `Symbol.patternMatch` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol$g('patternMatch');

var $$3l = _export;
var newPromiseCapabilityModule$3 = newPromiseCapability;
var perform$4 = perform;

// `Promise.try` method
// https://github.com/tc39/proposal-promise-try
$$3l({ target: 'Promise', stat: true }, {
  'try': function (callbackfn) {
    var promiseCapability = newPromiseCapabilityModule$3.f(this);
    var result = perform$4(callbackfn);
    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
    return promiseCapability.promise;
  }
});

var $$3m = _export;
var anObject$12 = anObject;
var numberIsFinite$2 = numberIsFinite;
var createIteratorConstructor$6 = createIteratorConstructor;
var InternalStateModule$f = internalState;

var SEEDED_RANDOM = 'Seeded Random';
var SEEDED_RANDOM_GENERATOR = SEEDED_RANDOM + ' Generator';
var setInternalState$f = InternalStateModule$f.set;
var getInternalState$c = InternalStateModule$f.getterFor(SEEDED_RANDOM_GENERATOR);
var SEED_TYPE_ERROR = 'Math.seededPRNG() argument should have a "seed" field with a finite value.';

var $SeededRandomGenerator = createIteratorConstructor$6(function SeededRandomGenerator(seed) {
  setInternalState$f(this, {
    type: SEEDED_RANDOM_GENERATOR,
    seed: seed % 2147483647
  });
}, SEEDED_RANDOM, function next() {
  var state = getInternalState$c(this);
  var seed = state.seed = (state.seed * 1103515245 + 12345) % 2147483647;
  return { value: (seed & 1073741823) / 1073741823, done: false };
});

// `Math.seededPRNG` method
// https://github.com/tc39/proposal-seeded-random
// based on https://github.com/tc39/proposal-seeded-random/blob/78b8258835b57fc2100d076151ab506bc3202ae6/demo.html
$$3m({ target: 'Math', stat: true, forced: true }, {
  seededPRNG: function seededPRNG(it) {
    var seed = anObject$12(it).seed;
    if (!numberIsFinite$2(seed)) throw TypeError(SEED_TYPE_ERROR);
    return new $SeededRandomGenerator(seed);
  }
});

var $$3n = _export;
var createIteratorConstructor$7 = createIteratorConstructor;
var requireObjectCoercible$h = requireObjectCoercible;
var InternalStateModule$g = internalState;
var StringMultibyteModule = stringMultibyte;

var codeAt$2 = StringMultibyteModule.codeAt;
var charAt$3 = StringMultibyteModule.charAt;
var STRING_ITERATOR$1 = 'String Iterator';
var setInternalState$g = InternalStateModule$g.set;
var getInternalState$d = InternalStateModule$g.getterFor(STRING_ITERATOR$1);

// TODO: unify with String#@@iterator
var $StringIterator = createIteratorConstructor$7(function StringIterator(string) {
  setInternalState$g(this, {
    type: STRING_ITERATOR$1,
    string: string,
    index: 0
  });
}, 'String', function next() {
  var state = getInternalState$d(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt$3(string, index);
  state.index += point.length;
  return { value: { codePoint: codeAt$2(point, 0), position: index }, done: false };
});

// `String.prototype.codePoints` method
// https://github.com/tc39/proposal-string-prototype-codepoints
$$3n({ target: 'String', proto: true }, {
  codePoints: function codePoints() {
    return new $StringIterator(String(requireObjectCoercible$h(this)));
  }
});

var $$3o = _export;
var isArray$8 = isArray;

var isFrozen = Object.isFrozen;

var isFrozenStringArray = function (array, allowUndefined) {
  if (!isFrozen || !isArray$8(array) || !isFrozen(array)) return false;
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
$$3o({ target: 'Array', stat: true }, {
  isTemplateObject: function isTemplateObject(value) {
    if (!isFrozenStringArray(value, true)) return false;
    var raw = value.raw;
    if (raw.length !== value.length || !isFrozenStringArray(raw, false)) return false;
    return true;
  }
});

var global$F = global$1;
var shared$6 = sharedStore;
var getPrototypeOf$d = objectGetPrototypeOf;
var has$m = has;
var createNonEnumerableProperty$g = createNonEnumerableProperty;
var wellKnownSymbol$w = wellKnownSymbol;

var USE_FUNCTION_CONSTRUCTOR = 'USE_FUNCTION_CONSTRUCTOR';
var ASYNC_ITERATOR = wellKnownSymbol$w('asyncIterator');
var AsyncIterator = global$F.AsyncIterator;
var PassedAsyncIteratorPrototype = shared$6.AsyncIteratorPrototype;
var AsyncIteratorPrototype, prototype;

{
  if (PassedAsyncIteratorPrototype) {
    AsyncIteratorPrototype = PassedAsyncIteratorPrototype;
  } else if (typeof AsyncIterator == 'function') {
    AsyncIteratorPrototype = AsyncIterator.prototype;
  } else if (shared$6[USE_FUNCTION_CONSTRUCTOR] || global$F[USE_FUNCTION_CONSTRUCTOR]) {
    try {
      // eslint-disable-next-line no-new-func
      prototype = getPrototypeOf$d(getPrototypeOf$d(getPrototypeOf$d(Function('return async function*(){}()')())));
      if (getPrototypeOf$d(prototype) === Object.prototype) AsyncIteratorPrototype = prototype;
    } catch (error) { /* empty */ }
  }
}

if (!AsyncIteratorPrototype) AsyncIteratorPrototype = {};

if (!has$m(AsyncIteratorPrototype, ASYNC_ITERATOR)) {
  createNonEnumerableProperty$g(AsyncIteratorPrototype, ASYNC_ITERATOR, function () {
    return this;
  });
}

var asyncIteratorPrototype = AsyncIteratorPrototype;

// https://github.com/tc39/proposal-iterator-helpers
var $$3p = _export;
var anInstance$a = anInstance;
var createNonEnumerableProperty$h = createNonEnumerableProperty;
var has$n = has;
var wellKnownSymbol$x = wellKnownSymbol;
var AsyncIteratorPrototype$1 = asyncIteratorPrototype;
var IS_PURE$r = isPure;

var TO_STRING_TAG$4 = wellKnownSymbol$x('toStringTag');

var AsyncIteratorConstructor = function AsyncIterator() {
  anInstance$a(this, AsyncIteratorConstructor);
};

AsyncIteratorConstructor.prototype = AsyncIteratorPrototype$1;

if (!has$n(AsyncIteratorPrototype$1, TO_STRING_TAG$4)) {
  createNonEnumerableProperty$h(AsyncIteratorPrototype$1, TO_STRING_TAG$4, 'AsyncIterator');
}

if (!has$n(AsyncIteratorPrototype$1, 'constructor') || AsyncIteratorPrototype$1.constructor === Object) {
  createNonEnumerableProperty$h(AsyncIteratorPrototype$1, 'constructor', AsyncIteratorConstructor);
}

$$3p({ global: true, forced: IS_PURE$r }, {
  AsyncIterator: AsyncIteratorConstructor
});

var path$3 = path;
var aFunction$w = aFunction$1;
var anObject$13 = anObject;
var create$b = objectCreate;
var createNonEnumerableProperty$i = createNonEnumerableProperty;
var redefineAll$8 = redefineAll;
var wellKnownSymbol$y = wellKnownSymbol;
var InternalStateModule$h = internalState;
var getBuiltIn$m = getBuiltIn;

var Promise$1 = getBuiltIn$m('Promise');

var setInternalState$h = InternalStateModule$h.set;
var getInternalState$e = InternalStateModule$h.get;

var TO_STRING_TAG$5 = wellKnownSymbol$y('toStringTag');

var $return = function (value) {
  var iterator = getInternalState$e(this).iterator;
  var $$return = iterator['return'];
  return $$return === undefined
    ? Promise$1.resolve({ done: true, value: value })
    : anObject$13($$return.call(iterator, value));
};

var $throw = function (value) {
  var iterator = getInternalState$e(this).iterator;
  var $$throw = iterator['throw'];
  return $$throw === undefined
    ? Promise$1.reject(value)
    : $$throw.call(iterator, value);
};

var asyncIteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var AsyncIteratorProxy = function AsyncIterator(state) {
    state.next = aFunction$w(state.iterator.next);
    state.done = false;
    setInternalState$h(this, state);
  };

  AsyncIteratorProxy.prototype = redefineAll$8(create$b(path$3.AsyncIterator.prototype), {
    next: function next(arg) {
      var state = getInternalState$e(this);
      if (state.done) return Promise$1.resolve({ done: true, value: undefined });
      try {
        return Promise$1.resolve(anObject$13(nextHandler.call(state, arg, Promise$1)));
      } catch (error) {
        return Promise$1.reject(error);
      }
    },
    'return': $return,
    'throw': $throw
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty$i(AsyncIteratorProxy.prototype, TO_STRING_TAG$5, 'Generator');
  }

  return AsyncIteratorProxy;
};

// https://github.com/tc39/proposal-iterator-helpers
var $$3q = _export;
var anObject$14 = anObject;
var createAsyncIteratorProxy = asyncIteratorCreateProxy;

var AsyncIteratorProxy = createAsyncIteratorProxy(function (arg, Promise) {
  var state = this;
  var iterator = state.iterator;

  return Promise.resolve(anObject$14(state.next.call(iterator, arg))).then(function (step) {
    if (anObject$14(step).done) {
      state.done = true;
      return { done: true, value: undefined };
    }
    return { done: false, value: [state.index++, step.value] };
  });
});

$$3q({ target: 'AsyncIterator', proto: true, real: true }, {
  asIndexedPairs: function asIndexedPairs() {
    return new AsyncIteratorProxy({
      iterator: anObject$14(this),
      index: 0
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3r = _export;
var anObject$15 = anObject;
var toPositiveInteger$2 = toPositiveInteger;
var createAsyncIteratorProxy$1 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$1 = createAsyncIteratorProxy$1(function (arg, Promise) {
  var state = this;

  return new Promise(function (resolve, reject) {
    var loop = function () {
      try {
        Promise.resolve(
          anObject$15(state.next.call(state.iterator, state.remaining ? undefined : arg))
        ).then(function (step) {
          try {
            if (anObject$15(step).done) {
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

$$3r({ target: 'AsyncIterator', proto: true, real: true }, {
  drop: function drop(limit) {
    return new AsyncIteratorProxy$1({
      iterator: anObject$15(this),
      remaining: toPositiveInteger$2(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var aFunction$x = aFunction$1;
var anObject$16 = anObject;
var getBuiltIn$n = getBuiltIn;

var Promise$2 = getBuiltIn$n('Promise');
var push$2 = [].push;

var createMethod$7 = function (TYPE) {
  var IS_TO_ARRAY = TYPE == 0;
  var IS_FOR_EACH = TYPE == 1;
  var IS_EVERY = TYPE == 2;
  var IS_SOME = TYPE == 3;
  return function (iterator, fn) {
    anObject$16(iterator);
    var next = aFunction$x(iterator.next);
    var array = IS_TO_ARRAY ? [] : undefined;
    if (!IS_TO_ARRAY) aFunction$x(fn);

    return new Promise$2(function (resolve, reject) {
      var closeIteration = function (method, argument) {
        try {
          var returnMethod = iterator['return'];
          if (returnMethod !== undefined) {
            return Promise$2.resolve(returnMethod.call(iterator)).then(function () {
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
          Promise$2.resolve(anObject$16(next.call(iterator))).then(function (step) {
            try {
              if (anObject$16(step).done) {
                resolve(IS_TO_ARRAY ? array : IS_SOME ? false : IS_EVERY || undefined);
              } else {
                var value = step.value;
                if (IS_TO_ARRAY) {
                  push$2.call(array, value);
                  loop();
                } else {
                  Promise$2.resolve(fn(value)).then(function (result) {
                    if (IS_FOR_EACH) {
                      loop();
                    } else if (IS_EVERY) {
                      result ? loop() : closeIteration(resolve, false);
                    } else {
                      result ? closeIteration(resolve, IS_SOME || value) : loop();
                    }
                  }, onError);
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
  toArray: createMethod$7(0),
  forEach: createMethod$7(1),
  every: createMethod$7(2),
  some: createMethod$7(3),
  find: createMethod$7(4)
};

// https://github.com/tc39/proposal-iterator-helpers
var $$3s = _export;
var $every$2 = asyncIteratorIteration.every;

$$3s({ target: 'AsyncIterator', proto: true, real: true }, {
  every: function every(fn) {
    return $every$2(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3t = _export;
var aFunction$y = aFunction$1;
var anObject$17 = anObject;
var createAsyncIteratorProxy$2 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$2 = createAsyncIteratorProxy$2(function (arg, Promise) {
  var state = this;
  var filterer = state.filterer;

  return new Promise(function (resolve, reject) {
    var loop = function () {
      try {
        Promise.resolve(anObject$17(state.next.call(state.iterator, arg))).then(function (step) {
          try {
            if (anObject$17(step).done) {
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

$$3t({ target: 'AsyncIterator', proto: true, real: true }, {
  filter: function filter(filterer) {
    return new AsyncIteratorProxy$2({
      iterator: anObject$17(this),
      filterer: aFunction$y(filterer)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3u = _export;
var $find$2 = asyncIteratorIteration.find;

$$3u({ target: 'AsyncIterator', proto: true, real: true }, {
  find: function find(fn) {
    return $find$2(this, fn);
  }
});

var getIteratorMethod$6 = getIteratorMethod;
var wellKnownSymbol$z = wellKnownSymbol;

var ASYNC_ITERATOR$1 = wellKnownSymbol$z('asyncIterator');

var getAsyncIteratorMethod = function (it) {
  var method = it[ASYNC_ITERATOR$1];
  return method === undefined ? getIteratorMethod$6(it) : method;
};

// https://github.com/tc39/proposal-iterator-helpers
var $$3v = _export;
var aFunction$z = aFunction$1;
var anObject$18 = anObject;
var createAsyncIteratorProxy$3 = asyncIteratorCreateProxy;
var getAsyncIteratorMethod$1 = getAsyncIteratorMethod;

var AsyncIteratorProxy$3 = createAsyncIteratorProxy$3(function (arg, Promise) {
  var state = this;
  var mapper = state.mapper;
  var innerIterator, iteratorMethod;

  return new Promise(function (resolve, reject) {
    var outerLoop = function () {
      try {
        Promise.resolve(anObject$18(state.next.call(state.iterator, arg))).then(function (step) {
          try {
            if (anObject$18(step).done) {
              state.done = true;
              resolve({ done: true, value: undefined });
            } else {
              Promise.resolve(mapper(step.value)).then(function (mapped) {
                try {
                  iteratorMethod = getAsyncIteratorMethod$1(mapped);
                  if (iteratorMethod !== undefined) {
                    state.innerIterator = innerIterator = anObject$18(iteratorMethod.call(mapped));
                    state.innerNext = aFunction$z(innerIterator.next);
                    return innerLoop();
                  } reject(TypeError('.flatMap callback should return an iterable object'));
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
          Promise.resolve(anObject$18(state.innerNext.call(innerIterator))).then(function (result) {
            try {
              if (anObject$18(result).done) {
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

$$3v({ target: 'AsyncIterator', proto: true, real: true }, {
  flatMap: function flatMap(mapper) {
    return new AsyncIteratorProxy$3({
      iterator: anObject$18(this),
      mapper: aFunction$z(mapper),
      innerIterator: null,
      innerNext: null
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3w = _export;
var $forEach$3 = asyncIteratorIteration.forEach;

$$3w({ target: 'AsyncIterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    return $forEach$3(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3x = _export;
var path$4 = path;
var aFunction$A = aFunction$1;
var anObject$19 = anObject;
var toObject$s = toObject;
var createAsyncIteratorProxy$4 = asyncIteratorCreateProxy;
var getAsyncIteratorMethod$2 = getAsyncIteratorMethod;

var AsyncIterator$1 = path$4.AsyncIterator;

var AsyncIteratorProxy$4 = createAsyncIteratorProxy$4(function (arg) {
  return anObject$19(this.next.call(this.iterator, arg));
}, true);

$$3x({ target: 'AsyncIterator', stat: true }, {
  from: function from(O) {
    var object = toObject$s(O);
    var usingIterator = getAsyncIteratorMethod$2(object);
    var iterator;
    if (usingIterator != null) {
      iterator = aFunction$A(usingIterator).call(object);
      if (iterator instanceof AsyncIterator$1) return iterator;
    } else {
      iterator = object;
    } return new AsyncIteratorProxy$4({
      iterator: iterator
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3y = _export;
var aFunction$B = aFunction$1;
var anObject$1a = anObject;
var createAsyncIteratorProxy$5 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$5 = createAsyncIteratorProxy$5(function (arg, Promise) {
  var state = this;
  var mapper = state.mapper;

  return Promise.resolve(anObject$1a(state.next.call(state.iterator, arg))).then(function (step) {
    if (anObject$1a(step).done) {
      state.done = true;
      return { done: true, value: undefined };
    }
    return Promise.resolve(mapper(step.value)).then(function (value) {
      return { done: false, value: value };
    });
  });
});

$$3y({ target: 'AsyncIterator', proto: true, real: true }, {
  map: function map(mapper) {
    return new AsyncIteratorProxy$5({
      iterator: anObject$1a(this),
      mapper: aFunction$B(mapper)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3z = _export;
var aFunction$C = aFunction$1;
var anObject$1b = anObject;
var getBuiltIn$o = getBuiltIn;

var Promise$3 = getBuiltIn$o('Promise');

$$3z({ target: 'AsyncIterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    var iterator = anObject$1b(this);
    var next = aFunction$C(iterator.next);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aFunction$C(reducer);

    return new Promise$3(function (resolve, reject) {
      var loop = function () {
        try {
          Promise$3.resolve(anObject$1b(next.call(iterator))).then(function (step) {
            try {
              if (anObject$1b(step).done) {
                noInitial ? reject(TypeError('Reduce of empty iterator with no initial value')) : resolve(accumulator);
              } else {
                var value = step.value;
                if (noInitial) {
                  noInitial = false;
                  accumulator = value;
                  loop();
                } else {
                  Promise$3.resolve(reducer(accumulator, value)).then(function (result) {
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
var $$3A = _export;
var $some$2 = asyncIteratorIteration.some;

$$3A({ target: 'AsyncIterator', proto: true, real: true }, {
  some: function some(fn) {
    return $some$2(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3B = _export;
var anObject$1c = anObject;
var toPositiveInteger$3 = toPositiveInteger;
var createAsyncIteratorProxy$6 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$6 = createAsyncIteratorProxy$6(function (arg, Promise) {
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
  } return this.next.call(iterator, arg);
});

$$3B({ target: 'AsyncIterator', proto: true, real: true }, {
  take: function take(limit) {
    return new AsyncIteratorProxy$6({
      iterator: anObject$1c(this),
      remaining: toPositiveInteger$3(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3C = _export;
var $toArray = asyncIteratorIteration.toArray;

$$3C({ target: 'AsyncIterator', proto: true, real: true }, {
  toArray: function toArray() {
    return $toArray(this);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3D = _export;
var global$G = global$1;
var anInstance$b = anInstance;
var createNonEnumerableProperty$j = createNonEnumerableProperty;
var fails$Y = fails;
var has$o = has;
var wellKnownSymbol$A = wellKnownSymbol;
var IteratorPrototype$3 = iteratorsCore.IteratorPrototype;

wellKnownSymbol$A('iterator');
var TO_STRING_TAG$6 = wellKnownSymbol$A('toStringTag');

var NativeIterator = global$G.Iterator;

// FF56- have non-standard global helper `Iterator`
var FORCED$q = typeof NativeIterator != 'function'
  || NativeIterator.prototype !== IteratorPrototype$3
  // FF44- non-standard `Iterator` passes previous tests
  || !fails$Y(function () { NativeIterator({}); });

var IteratorConstructor = function Iterator() {
  anInstance$b(this, IteratorConstructor);
};

if (!has$o(IteratorPrototype$3, TO_STRING_TAG$6)) {
  createNonEnumerableProperty$j(IteratorPrototype$3, TO_STRING_TAG$6, 'Iterator');
}

if (FORCED$q || !has$o(IteratorPrototype$3, 'constructor') || IteratorPrototype$3.constructor === Object) {
  createNonEnumerableProperty$j(IteratorPrototype$3, 'constructor', IteratorConstructor);
}

IteratorConstructor.prototype = IteratorPrototype$3;

$$3D({ global: true, forced: FORCED$q }, {
  Iterator: IteratorConstructor
});

var path$5 = path;
var aFunction$D = aFunction$1;
var anObject$1d = anObject;
var create$c = objectCreate;
var createNonEnumerableProperty$k = createNonEnumerableProperty;
var redefineAll$9 = redefineAll;
var wellKnownSymbol$B = wellKnownSymbol;
var InternalStateModule$i = internalState;

var setInternalState$i = InternalStateModule$i.set;
var getInternalState$f = InternalStateModule$i.get;

var TO_STRING_TAG$7 = wellKnownSymbol$B('toStringTag');

var $return$1 = function (value) {
  var iterator = getInternalState$f(this).iterator;
  var $$return = iterator['return'];
  return $$return === undefined ? { done: true, value: value } : anObject$1d($$return.call(iterator, value));
};

var $throw$1 = function (value) {
  var iterator = getInternalState$f(this).iterator;
  var $$throw = iterator['throw'];
  if ($$throw === undefined) throw value;
  return $$throw.call(iterator, value);
};

var iteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var IteratorProxy = function Iterator(state) {
    state.next = aFunction$D(state.iterator.next);
    state.done = false;
    setInternalState$i(this, state);
  };

  IteratorProxy.prototype = redefineAll$9(create$c(path$5.Iterator.prototype), {
    next: function next() {
      var state = getInternalState$f(this);
      var result = state.done ? undefined : nextHandler.apply(state, arguments);
      return { done: state.done, value: result };
    },
    'return': $return$1,
    'throw': $throw$1
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty$k(IteratorProxy.prototype, TO_STRING_TAG$7, 'Generator');
  }

  return IteratorProxy;
};

// https://github.com/tc39/proposal-iterator-helpers
var $$3E = _export;
var anObject$1e = anObject;
var createIteratorProxy = iteratorCreateProxy;

var IteratorProxy = createIteratorProxy(function (arg) {
  var result = anObject$1e(this.next.call(this.iterator, arg));
  var done = this.done = !!result.done;
  if (!done) return [this.index++, result.value];
});

$$3E({ target: 'Iterator', proto: true, real: true }, {
  asIndexedPairs: function asIndexedPairs() {
    return new IteratorProxy({
      iterator: anObject$1e(this),
      index: 0
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3F = _export;
var anObject$1f = anObject;
var toPositiveInteger$4 = toPositiveInteger;
var createIteratorProxy$1 = iteratorCreateProxy;

var IteratorProxy$1 = createIteratorProxy$1(function (arg) {
  var iterator = this.iterator;
  var next = this.next;
  var result, done;
  while (this.remaining) {
    this.remaining--;
    result = anObject$1f(next.call(iterator));
    done = this.done = !!result.done;
    if (done) return;
  }
  result = anObject$1f(next.call(iterator, arg));
  done = this.done = !!result.done;
  if (!done) return result.value;
});

$$3F({ target: 'Iterator', proto: true, real: true }, {
  drop: function drop(limit) {
    return new IteratorProxy$1({
      iterator: anObject$1f(this),
      remaining: toPositiveInteger$4(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3G = _export;
var iterate$w = iterate;
var aFunction$E = aFunction$1;
var anObject$1g = anObject;

$$3G({ target: 'Iterator', proto: true, real: true }, {
  every: function every(fn) {
    anObject$1g(this);
    aFunction$E(fn);
    return !iterate$w(this, function (value, stop) {
      if (!fn(value)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3H = _export;
var aFunction$F = aFunction$1;
var anObject$1h = anObject;
var createIteratorProxy$2 = iteratorCreateProxy;
var callWithSafeIterationClosing$2 = callWithSafeIterationClosing;

var IteratorProxy$2 = createIteratorProxy$2(function (arg) {
  var iterator = this.iterator;
  var filterer = this.filterer;
  var next = this.next;
  var result, done, value;
  while (true) {
    result = anObject$1h(next.call(iterator, arg));
    done = this.done = !!result.done;
    if (done) return;
    value = result.value;
    if (callWithSafeIterationClosing$2(iterator, filterer, value)) return value;
  }
});

$$3H({ target: 'Iterator', proto: true, real: true }, {
  filter: function filter(filterer) {
    return new IteratorProxy$2({
      iterator: anObject$1h(this),
      filterer: aFunction$F(filterer)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3I = _export;
var iterate$x = iterate;
var aFunction$G = aFunction$1;
var anObject$1i = anObject;

$$3I({ target: 'Iterator', proto: true, real: true }, {
  find: function find(fn) {
    anObject$1i(this);
    aFunction$G(fn);
    return iterate$x(this, function (value, stop) {
      if (fn(value)) return stop(value);
    }, { IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3J = _export;
var aFunction$H = aFunction$1;
var anObject$1j = anObject;
var getIteratorMethod$7 = getIteratorMethod;
var createIteratorProxy$3 = iteratorCreateProxy;
var iteratorClose$3 = iteratorClose;

var IteratorProxy$3 = createIteratorProxy$3(function (arg) {
  var iterator = this.iterator;
  var mapper = this.mapper;
  var result, mapped, iteratorMethod, innerIterator;

  while (true) {
    try {
      if (innerIterator = this.innerIterator) {
        result = anObject$1j(this.innerNext.call(innerIterator));
        if (!result.done) return result.value;
        this.innerIterator = this.innerNext = null;
      }

      result = anObject$1j(this.next.call(iterator, arg));

      if (this.done = !!result.done) return;

      mapped = mapper(result.value);
      iteratorMethod = getIteratorMethod$7(mapped);

      if (iteratorMethod === undefined) {
        throw TypeError('.flatMap callback should return an iterable object');
      }

      this.innerIterator = innerIterator = anObject$1j(iteratorMethod.call(mapped));
      this.innerNext = aFunction$H(innerIterator.next);
    } catch (error) {
      iteratorClose$3(iterator);
      throw error;
    }
  }
});

$$3J({ target: 'Iterator', proto: true, real: true }, {
  flatMap: function flatMap(mapper) {
    return new IteratorProxy$3({
      iterator: anObject$1j(this),
      mapper: aFunction$H(mapper),
      innerIterator: null,
      innerNext: null
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3K = _export;
var iterate$y = iterate;
var anObject$1k = anObject;

$$3K({ target: 'Iterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    iterate$y(anObject$1k(this), fn, { IS_ITERATOR: true });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3L = _export;
var path$6 = path;
var aFunction$I = aFunction$1;
var anObject$1l = anObject;
var toObject$t = toObject;
var createIteratorProxy$4 = iteratorCreateProxy;
var getIteratorMethod$8 = getIteratorMethod;

var Iterator = path$6.Iterator;

var IteratorProxy$4 = createIteratorProxy$4(function (arg) {
  var result = anObject$1l(this.next.call(this.iterator, arg));
  var done = this.done = !!result.done;
  if (!done) return result.value;
}, true);

$$3L({ target: 'Iterator', stat: true }, {
  from: function from(O) {
    var object = toObject$t(O);
    var usingIterator = getIteratorMethod$8(object);
    var iterator;
    if (usingIterator != null) {
      iterator = aFunction$I(usingIterator).call(object);
      if (iterator instanceof Iterator) return iterator;
    } else {
      iterator = object;
    } return new IteratorProxy$4({
      iterator: iterator
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3M = _export;
var aFunction$J = aFunction$1;
var anObject$1m = anObject;
var createIteratorProxy$5 = iteratorCreateProxy;
var callWithSafeIterationClosing$3 = callWithSafeIterationClosing;

var IteratorProxy$5 = createIteratorProxy$5(function (arg) {
  var iterator = this.iterator;
  var result = anObject$1m(this.next.call(iterator, arg));
  var done = this.done = !!result.done;
  if (!done) return callWithSafeIterationClosing$3(iterator, this.mapper, result.value);
});

$$3M({ target: 'Iterator', proto: true, real: true }, {
  map: function map(mapper) {
    return new IteratorProxy$5({
      iterator: anObject$1m(this),
      mapper: aFunction$J(mapper)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3N = _export;
var iterate$z = iterate;
var aFunction$K = aFunction$1;
var anObject$1n = anObject;

$$3N({ target: 'Iterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    anObject$1n(this);
    aFunction$K(reducer);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    iterate$z(this, function (value) {
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
var $$3O = _export;
var iterate$A = iterate;
var aFunction$L = aFunction$1;
var anObject$1o = anObject;

$$3O({ target: 'Iterator', proto: true, real: true }, {
  some: function some(fn) {
    anObject$1o(this);
    aFunction$L(fn);
    return iterate$A(this, function (value, stop) {
      if (fn(value)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3P = _export;
var anObject$1p = anObject;
var toPositiveInteger$5 = toPositiveInteger;
var createIteratorProxy$6 = iteratorCreateProxy;
var iteratorClose$4 = iteratorClose;

var IteratorProxy$6 = createIteratorProxy$6(function (arg) {
  var iterator = this.iterator;
  if (!this.remaining--) {
    this.done = true;
    return iteratorClose$4(iterator);
  }
  var result = anObject$1p(this.next.call(iterator, arg));
  var done = this.done = !!result.done;
  if (!done) return result.value;
});

$$3P({ target: 'Iterator', proto: true, real: true }, {
  take: function take(limit) {
    return new IteratorProxy$6({
      iterator: anObject$1p(this),
      remaining: toPositiveInteger$5(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$3Q = _export;
var iterate$B = iterate;
var anObject$1q = anObject;

var push$3 = [].push;

$$3Q({ target: 'Iterator', proto: true, real: true }, {
  toArray: function toArray() {
    var result = [];
    iterate$B(anObject$1q(this), push$3, { that: result, IS_ITERATOR: true });
    return result;
  }
});

var anObject$1r = anObject;

// `Map.prototype.emplace` method
// https://github.com/thumbsupep/proposal-upsert
var mapEmplace = function emplace(key, handler) {
  var map = anObject$1r(this);
  var value = (map.has(key) && 'update' in handler)
    ? handler.update(map.get(key), key, map)
    : handler.insert(key, map);
  map.set(key, value);
  return value;
};

var $$3R = _export;
var IS_PURE$s = isPure;
var $emplace = mapEmplace;

// `Map.prototype.emplace` method
// https://github.com/thumbsupep/proposal-upsert
$$3R({ target: 'Map', proto: true, real: true, forced: IS_PURE$s }, {
  emplace: $emplace
});

var anObject$1s = anObject;

// `Map.prototype.upsert` method
// https://github.com/thumbsupep/proposal-upsert
var mapUpsert = function upsert(key, updateFn /* , insertFn */) {
  var map = anObject$1s(this);
  var insertFn = arguments.length > 2 ? arguments[2] : undefined;
  var value;
  if (typeof updateFn != 'function' && typeof insertFn != 'function') {
    throw TypeError('At least one callback required');
  }
  if (map.has(key)) {
    value = map.get(key);
    if (typeof updateFn == 'function') {
      value = updateFn(value);
      map.set(key, value);
    }
  } else if (typeof insertFn == 'function') {
    value = insertFn();
    map.set(key, value);
  } return value;
};

// TODO: remove from `core-js@4`
var $$3S = _export;
var IS_PURE$t = isPure;
var $upsert = mapUpsert;

// `Map.prototype.updateOrInsert` method (replaced by `Map.prototype.emplace`)
// https://github.com/thumbsupep/proposal-upsert
$$3S({ target: 'Map', proto: true, real: true, forced: IS_PURE$t }, {
  updateOrInsert: $upsert
});

// TODO: remove from `core-js@4`
var $$3T = _export;
var IS_PURE$u = isPure;
var $upsert$1 = mapUpsert;

// `Map.prototype.upsert` method (replaced by `Map.prototype.emplace`)
// https://github.com/thumbsupep/proposal-upsert
$$3T({ target: 'Map', proto: true, real: true, forced: IS_PURE$u }, {
  upsert: $upsert$1
});

var $$3U = _export;
var IS_PURE$v = isPure;
var $emplace$1 = mapEmplace;

// `WeakMap.prototype.emplace` method
// https://github.com/tc39/proposal-upsert
$$3U({ target: 'WeakMap', proto: true, real: true, forced: IS_PURE$v }, {
  emplace: $emplace$1
});

// TODO: remove from `core-js@4`
var $$3V = _export;
var IS_PURE$w = isPure;
var $upsert$2 = mapUpsert;

// `WeakMap.prototype.upsert` method (replaced by `WeakMap.prototype.emplace`)
// https://github.com/tc39/proposal-upsert
$$3V({ target: 'WeakMap', proto: true, real: true, forced: IS_PURE$w }, {
  upsert: $upsert$2
});

var $$3W = _export;
var IS_PURE$x = isPure;
var getBuiltIn$p = getBuiltIn;
var anObject$1t = anObject;
var aFunction$M = aFunction$1;
var speciesConstructor$g = speciesConstructor;
var iterate$C = iterate;

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
$$3W({ target: 'Set', proto: true, real: true, forced: IS_PURE$x }, {
  difference: function difference(iterable) {
    var set = anObject$1t(this);
    var newSet = new (speciesConstructor$g(set, getBuiltIn$p('Set')))(set);
    var remover = aFunction$M(newSet['delete']);
    iterate$C(iterable, function (value) {
      remover.call(newSet, value);
    });
    return newSet;
  }
});

var $$3X = _export;
var IS_PURE$y = isPure;
var getBuiltIn$q = getBuiltIn;
var anObject$1u = anObject;
var aFunction$N = aFunction$1;
var speciesConstructor$h = speciesConstructor;
var iterate$D = iterate;

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
$$3X({ target: 'Set', proto: true, real: true, forced: IS_PURE$y }, {
  intersection: function intersection(iterable) {
    var set = anObject$1u(this);
    var newSet = new (speciesConstructor$h(set, getBuiltIn$q('Set')))();
    var hasCheck = aFunction$N(set.has);
    var adder = aFunction$N(newSet.add);
    iterate$D(iterable, function (value) {
      if (hasCheck.call(set, value)) adder.call(newSet, value);
    });
    return newSet;
  }
});

var $$3Y = _export;
var IS_PURE$z = isPure;
var anObject$1v = anObject;
var aFunction$O = aFunction$1;
var iterate$E = iterate;

// `Set.prototype.isDisjointFrom` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isDisjointFrom
$$3Y({ target: 'Set', proto: true, real: true, forced: IS_PURE$z }, {
  isDisjointFrom: function isDisjointFrom(iterable) {
    var set = anObject$1v(this);
    var hasCheck = aFunction$O(set.has);
    return !iterate$E(iterable, function (value, stop) {
      if (hasCheck.call(set, value) === true) return stop();
    }, { INTERRUPTED: true }).stopped;
  }
});

var $$3Z = _export;
var IS_PURE$A = isPure;
var getBuiltIn$r = getBuiltIn;
var anObject$1w = anObject;
var aFunction$P = aFunction$1;
var getIterator$3 = getIterator;
var iterate$F = iterate;

// `Set.prototype.isSubsetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
$$3Z({ target: 'Set', proto: true, real: true, forced: IS_PURE$A }, {
  isSubsetOf: function isSubsetOf(iterable) {
    var iterator = getIterator$3(this);
    var otherSet = anObject$1w(iterable);
    var hasCheck = otherSet.has;
    if (typeof hasCheck != 'function') {
      otherSet = new (getBuiltIn$r('Set'))(iterable);
      hasCheck = aFunction$P(otherSet.has);
    }
    return !iterate$F(iterator, function (value, stop) {
      if (hasCheck.call(otherSet, value) === false) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$3_ = _export;
var IS_PURE$B = isPure;
var anObject$1x = anObject;
var aFunction$Q = aFunction$1;
var iterate$G = iterate;

// `Set.prototype.isSupersetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSupersetOf
$$3_({ target: 'Set', proto: true, real: true, forced: IS_PURE$B }, {
  isSupersetOf: function isSupersetOf(iterable) {
    var set = anObject$1x(this);
    var hasCheck = aFunction$Q(set.has);
    return !iterate$G(iterable, function (value, stop) {
      if (hasCheck.call(set, value) === false) return stop();
    }, { INTERRUPTED: true }).stopped;
  }
});

var $$3$ = _export;
var IS_PURE$C = isPure;
var getBuiltIn$s = getBuiltIn;
var anObject$1y = anObject;
var aFunction$R = aFunction$1;
var speciesConstructor$i = speciesConstructor;
var iterate$H = iterate;

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
$$3$({ target: 'Set', proto: true, real: true, forced: IS_PURE$C }, {
  union: function union(iterable) {
    var set = anObject$1y(this);
    var newSet = new (speciesConstructor$i(set, getBuiltIn$s('Set')))(set);
    iterate$H(iterable, aFunction$R(newSet.add), { that: newSet });
    return newSet;
  }
});

var $$40 = _export;
var IS_PURE$D = isPure;
var getBuiltIn$t = getBuiltIn;
var anObject$1z = anObject;
var aFunction$S = aFunction$1;
var speciesConstructor$j = speciesConstructor;
var iterate$I = iterate;

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
$$40({ target: 'Set', proto: true, real: true, forced: IS_PURE$D }, {
  symmetricDifference: function symmetricDifference(iterable) {
    var set = anObject$1z(this);
    var newSet = new (speciesConstructor$j(set, getBuiltIn$t('Set')))(set);
    var remover = aFunction$S(newSet['delete']);
    var adder = aFunction$S(newSet.add);
    iterate$I(iterable, function (value) {
      remover.call(newSet, value) || adder.call(newSet, value);
    });
    return newSet;
  }
});

var defineWellKnownSymbol$h = defineWellKnownSymbol;

// `Symbol.asyncDispose` well-known symbol
// https://github.com/tc39/proposal-using-statement
defineWellKnownSymbol$h('asyncDispose');

var defineWellKnownSymbol$i = defineWellKnownSymbol;

// `Symbol.dispose` well-known symbol
// https://github.com/tc39/proposal-using-statement
defineWellKnownSymbol$i('dispose');

var $$41 = _export;
var toObject$u = toObject;
var toLength$x = toLength;
var toInteger$e = toInteger;
var addToUnscopables$d = addToUnscopables;

// `Array.prototype.at` method
// https://github.com/tc39/proposal-relative-indexing-method
$$41({ target: 'Array', proto: true }, {
  at: function at(index) {
    var O = toObject$u(this);
    var len = toLength$x(O.length);
    var relativeIndex = toInteger$e(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : O[k];
  }
});

addToUnscopables$d('at');

var ArrayBufferViewCore$q = arrayBufferViewCore;
var toLength$y = toLength;
var toInteger$f = toInteger;

var aTypedArray$o = ArrayBufferViewCore$q.aTypedArray;
var exportTypedArrayMethod$p = ArrayBufferViewCore$q.exportTypedArrayMethod;

// `%TypedArray%.prototype.at` method
// https://github.com/tc39/proposal-relative-indexing-method
exportTypedArrayMethod$p('at', function at(index) {
  var O = aTypedArray$o(this);
  var len = toLength$y(O.length);
  var relativeIndex = toInteger$f(index);
  var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
  return (k < 0 || k >= len) ? undefined : O[k];
});

// TODO: remove from `core-js@4`
var defineWellKnownSymbol$j = defineWellKnownSymbol;

defineWellKnownSymbol$j('replaceAll');

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

var global$H = global$1;
var DOMIterables = domIterables;
var forEach$2 = arrayForEach;
var createNonEnumerableProperty$l = createNonEnumerableProperty;

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global$H[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype && CollectionPrototype.forEach !== forEach$2) try {
    createNonEnumerableProperty$l(CollectionPrototype, 'forEach', forEach$2);
  } catch (error) {
    CollectionPrototype.forEach = forEach$2;
  }
}

var global$I = global$1;
var DOMIterables$1 = domIterables;
var ArrayIteratorMethods = es_array_iterator;
var createNonEnumerableProperty$m = createNonEnumerableProperty;
var wellKnownSymbol$C = wellKnownSymbol;

var ITERATOR$8 = wellKnownSymbol$C('iterator');
var TO_STRING_TAG$8 = wellKnownSymbol$C('toStringTag');
var ArrayValues = ArrayIteratorMethods.values;

for (var COLLECTION_NAME$1 in DOMIterables$1) {
  var Collection$1 = global$I[COLLECTION_NAME$1];
  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
  if (CollectionPrototype$1) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype$1[ITERATOR$8] !== ArrayValues) try {
      createNonEnumerableProperty$m(CollectionPrototype$1, ITERATOR$8, ArrayValues);
    } catch (error) {
      CollectionPrototype$1[ITERATOR$8] = ArrayValues;
    }
    if (!CollectionPrototype$1[TO_STRING_TAG$8]) {
      createNonEnumerableProperty$m(CollectionPrototype$1, TO_STRING_TAG$8, COLLECTION_NAME$1);
    }
    if (DOMIterables$1[COLLECTION_NAME$1]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype$1[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        createNonEnumerableProperty$m(CollectionPrototype$1, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype$1[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
}

var $$42 = _export;
var global$J = global$1;
var task$2 = task;

var FORCED$r = !global$J.setImmediate || !global$J.clearImmediate;

// http://w3c.github.io/setImmediate/
$$42({ global: true, bind: true, enumerable: true, forced: FORCED$r }, {
  // `setImmediate` method
  // http://w3c.github.io/setImmediate/#si-setImmediate
  setImmediate: task$2.set,
  // `clearImmediate` method
  // http://w3c.github.io/setImmediate/#si-clearImmediate
  clearImmediate: task$2.clear
});

var $$43 = _export;
var global$K = global$1;
var microtask$2 = microtask;
var IS_NODE$5 = engineIsNode;

var process$4 = global$K.process;

// `queueMicrotask` method
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask
$$43({ global: true, enumerable: true, noTargetGet: true }, {
  queueMicrotask: function queueMicrotask(fn) {
    var domain = IS_NODE$5 && process$4.domain;
    microtask$2(domain ? domain.bind(fn) : fn);
  }
});

var $$44 = _export;
var global$L = global$1;
var userAgent$4 = engineUserAgent;

var slice$1 = [].slice;
var MSIE = /MSIE .\./.test(userAgent$4); // <- dirty ie9- check

var wrap$1 = function (scheduler) {
  return function (handler, timeout /* , ...arguments */) {
    var boundArgs = arguments.length > 2;
    var args = boundArgs ? slice$1.call(arguments, 2) : undefined;
    return scheduler(boundArgs ? function () {
      // eslint-disable-next-line no-new-func
      (typeof handler == 'function' ? handler : Function(handler)).apply(this, args);
    } : handler, timeout);
  };
};

// ie9- setTimeout & setInterval additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
$$44({ global: true, bind: true, forced: MSIE }, {
  // `setTimeout` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
  setTimeout: wrap$1(global$L.setTimeout),
  // `setInterval` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
  setInterval: wrap$1(global$L.setInterval)
});
