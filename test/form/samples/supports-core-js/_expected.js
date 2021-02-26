var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global$L =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func
  (function () { return this; })() || Function('return this')();

var objectGetOwnPropertyDescriptor = {};

var fails$Y = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var fails$X = fails$Y;

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails$X(function () {
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var objectPropertyIsEnumerable = {};

var nativePropertyIsEnumerable$1 = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor$8 = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor$8 && !nativePropertyIsEnumerable$1.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor$8(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable$1;

var createPropertyDescriptor$9 = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var toString$2 = {}.toString;

var classofRaw$1 = function (it) {
  return toString$2.call(it).slice(8, -1);
};

var fails$W = fails$Y;
var classof$d = classofRaw$1;

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails$W(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof$d(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible$h = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings
var IndexedObject$4 = indexedObject;
var requireObjectCoercible$g = requireObjectCoercible$h;

var toIndexedObject$d = function (it) {
  return IndexedObject$4(requireObjectCoercible$g(it));
};

var isObject$B = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var isObject$A = isObject$B;

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var toPrimitive$b = function (input, PREFERRED_STRING) {
  if (!isObject$A(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$A(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject$A(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject$A(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var hasOwnProperty = {}.hasOwnProperty;

var has$o = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var global$K = global$L;
var isObject$z = isObject$B;

var document$3 = global$K.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject$z(document$3) && isObject$z(document$3.createElement);

var documentCreateElement$1 = function (it) {
  return EXISTS ? document$3.createElement(it) : {};
};

var DESCRIPTORS$z = descriptors;
var fails$V = fails$Y;
var createElement$1 = documentCreateElement$1;

// Thank's IE8 for his funny defineProperty
var ie8DomDefine = !DESCRIPTORS$z && !fails$V(function () {
  return Object.defineProperty(createElement$1('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

var DESCRIPTORS$y = descriptors;
var propertyIsEnumerableModule$2 = objectPropertyIsEnumerable;
var createPropertyDescriptor$8 = createPropertyDescriptor$9;
var toIndexedObject$c = toIndexedObject$d;
var toPrimitive$a = toPrimitive$b;
var has$n = has$o;
var IE8_DOM_DEFINE$1 = ie8DomDefine;

var nativeGetOwnPropertyDescriptor$3 = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
objectGetOwnPropertyDescriptor.f = DESCRIPTORS$y ? nativeGetOwnPropertyDescriptor$3 : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject$c(O);
  P = toPrimitive$a(P, true);
  if (IE8_DOM_DEFINE$1) try {
    return nativeGetOwnPropertyDescriptor$3(O, P);
  } catch (error) { /* empty */ }
  if (has$n(O, P)) return createPropertyDescriptor$8(!propertyIsEnumerableModule$2.f.call(O, P), O[P]);
};

var objectDefineProperty = {};

var isObject$y = isObject$B;

var anObject$1z = function (it) {
  if (!isObject$y(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};

var DESCRIPTORS$x = descriptors;
var IE8_DOM_DEFINE = ie8DomDefine;
var anObject$1y = anObject$1z;
var toPrimitive$9 = toPrimitive$b;

var nativeDefineProperty$2 = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
objectDefineProperty.f = DESCRIPTORS$x ? nativeDefineProperty$2 : function defineProperty(O, P, Attributes) {
  anObject$1y(O);
  P = toPrimitive$9(P, true);
  anObject$1y(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty$2(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var DESCRIPTORS$w = descriptors;
var definePropertyModule$c = objectDefineProperty;
var createPropertyDescriptor$7 = createPropertyDescriptor$9;

var createNonEnumerableProperty$m = DESCRIPTORS$w ? function (object, key, value) {
  return definePropertyModule$c.f(object, key, createPropertyDescriptor$7(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var redefine$g = {exports: {}};

var global$J = global$L;
var createNonEnumerableProperty$l = createNonEnumerableProperty$m;

var setGlobal$3 = function (key, value) {
  try {
    createNonEnumerableProperty$l(global$J, key, value);
  } catch (error) {
    global$J[key] = value;
  } return value;
};

var global$I = global$L;
var setGlobal$2 = setGlobal$3;

var SHARED = '__core-js_shared__';
var store$5 = global$I[SHARED] || setGlobal$2(SHARED, {});

var sharedStore = store$5;

var store$4 = sharedStore;

var functionToString = Function.toString;

// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
if (typeof store$4.inspectSource != 'function') {
  store$4.inspectSource = function (it) {
    return functionToString.call(it);
  };
}

var inspectSource$3 = store$4.inspectSource;

var global$H = global$L;
var inspectSource$2 = inspectSource$3;

var WeakMap$3 = global$H.WeakMap;

var nativeWeakMap = typeof WeakMap$3 === 'function' && /native code/.test(inspectSource$2(WeakMap$3));

var shared$6 = {exports: {}};

var isPure = false;

var store$3 = sharedStore;

(shared$6.exports = function (key, value) {
  return store$3[key] || (store$3[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.8.3',
  mode: 'global',
  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
});

var id$2 = 0;
var postfix = Math.random();

var uid$5 = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id$2 + postfix).toString(36);
};

var shared$5 = shared$6.exports;
var uid$4 = uid$5;

var keys$3 = shared$5('keys');

var sharedKey$4 = function (key) {
  return keys$3[key] || (keys$3[key] = uid$4(key));
};

var hiddenKeys$6 = {};

var NATIVE_WEAK_MAP$1 = nativeWeakMap;
var global$G = global$L;
var isObject$x = isObject$B;
var createNonEnumerableProperty$k = createNonEnumerableProperty$m;
var objectHas = has$o;
var shared$4 = sharedStore;
var sharedKey$3 = sharedKey$4;
var hiddenKeys$5 = hiddenKeys$6;

var WeakMap$2 = global$G.WeakMap;
var set$3, get$2, has$m;

var enforce = function (it) {
  return has$m(it) ? get$2(it) : set$3(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject$x(it) || (state = get$2(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP$1) {
  var store$2 = shared$4.state || (shared$4.state = new WeakMap$2());
  var wmget = store$2.get;
  var wmhas = store$2.has;
  var wmset = store$2.set;
  set$3 = function (it, metadata) {
    metadata.facade = it;
    wmset.call(store$2, it, metadata);
    return metadata;
  };
  get$2 = function (it) {
    return wmget.call(store$2, it) || {};
  };
  has$m = function (it) {
    return wmhas.call(store$2, it);
  };
} else {
  var STATE = sharedKey$3('state');
  hiddenKeys$5[STATE] = true;
  set$3 = function (it, metadata) {
    metadata.facade = it;
    createNonEnumerableProperty$k(it, STATE, metadata);
    return metadata;
  };
  get$2 = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has$m = function (it) {
    return objectHas(it, STATE);
  };
}

var internalState = {
  set: set$3,
  get: get$2,
  has: has$m,
  enforce: enforce,
  getterFor: getterFor
};

var global$F = global$L;
var createNonEnumerableProperty$j = createNonEnumerableProperty$m;
var has$l = has$o;
var setGlobal$1 = setGlobal$3;
var inspectSource$1 = inspectSource$3;
var InternalStateModule$i = internalState;

var getInternalState$f = InternalStateModule$i.get;
var enforceInternalState = InternalStateModule$i.enforce;
var TEMPLATE = String(String).split('String');

(redefine$g.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  var state;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has$l(value, 'name')) {
      createNonEnumerableProperty$j(value, 'name', key);
    }
    state = enforceInternalState(value);
    if (!state.source) {
      state.source = TEMPLATE.join(typeof key == 'string' ? key : '');
    }
  }
  if (O === global$F) {
    if (simple) O[key] = value;
    else setGlobal$1(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty$j(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState$f(this).source || inspectSource$1(this);
});

var global$E = global$L;

var path$6 = global$E;

var path$5 = path$6;
var global$D = global$L;

var aFunction$S = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

var getBuiltIn$t = function (namespace, method) {
  return arguments.length < 2 ? aFunction$S(path$5[namespace]) || aFunction$S(global$D[namespace])
    : path$5[namespace] && path$5[namespace][method] || global$D[namespace] && global$D[namespace][method];
};

var objectGetOwnPropertyNames = {};

var ceil$2 = Math.ceil;
var floor$9 = Math.floor;

// `ToInteger` abstract operation
// https://tc39.es/ecma262/#sec-tointeger
var toInteger$f = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor$9 : ceil$2)(argument);
};

var toInteger$e = toInteger$f;

var min$9 = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength$y = function (argument) {
  return argument > 0 ? min$9(toInteger$e(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var toInteger$d = toInteger$f;

var max$5 = Math.max;
var min$8 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex$8 = function (index, length) {
  var integer = toInteger$d(index);
  return integer < 0 ? max$5(integer + length, 0) : min$8(integer, length);
};

var toIndexedObject$b = toIndexedObject$d;
var toLength$x = toLength$y;
var toAbsoluteIndex$7 = toAbsoluteIndex$8;

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod$7 = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject$b($this);
    var length = toLength$x(O.length);
    var index = toAbsoluteIndex$7(fromIndex, length);
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
  includes: createMethod$7(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod$7(false)
};

var has$k = has$o;
var toIndexedObject$a = toIndexedObject$d;
var indexOf = arrayIncludes.indexOf;
var hiddenKeys$4 = hiddenKeys$6;

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject$a(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has$k(hiddenKeys$4, key) && has$k(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has$k(O, key = names[i++])) {
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
objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys$1(O, hiddenKeys$3);
};

var objectGetOwnPropertySymbols = {};

objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

var getBuiltIn$s = getBuiltIn$t;
var getOwnPropertyNamesModule$1 = objectGetOwnPropertyNames;
var getOwnPropertySymbolsModule$2 = objectGetOwnPropertySymbols;
var anObject$1x = anObject$1z;

// all object keys, includes non-enumerable and symbols
var ownKeys$3 = getBuiltIn$s('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule$1.f(anObject$1x(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule$2.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};

var has$j = has$o;
var ownKeys$2 = ownKeys$3;
var getOwnPropertyDescriptorModule$6 = objectGetOwnPropertyDescriptor;
var definePropertyModule$b = objectDefineProperty;

var copyConstructorProperties$2 = function (target, source) {
  var keys = ownKeys$2(source);
  var defineProperty = definePropertyModule$b.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule$6.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has$j(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};

var fails$U = fails$Y;

var replacement = /#|\.prototype\./;

var isForced$5 = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails$U(detection)
    : !!detection;
};

var normalize = isForced$5.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced$5.data = {};
var NATIVE = isForced$5.NATIVE = 'N';
var POLYFILL = isForced$5.POLYFILL = 'P';

var isForced_1 = isForced$5;

var global$C = global$L;
var getOwnPropertyDescriptor$7 = objectGetOwnPropertyDescriptor.f;
var createNonEnumerableProperty$i = createNonEnumerableProperty$m;
var redefine$f = redefine$g.exports;
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
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global$C;
  } else if (STATIC) {
    target = global$C[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global$C[TARGET] || {}).prototype;
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
      createNonEnumerableProperty$i(sourceProperty, 'sham', true);
    }
    // extend global
    redefine$f(target, key, sourceProperty, options);
  }
};

var fails$T = fails$Y;

var nativeSymbol = !!Object.getOwnPropertySymbols && !fails$T(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});

var NATIVE_SYMBOL$2 = nativeSymbol;

var useSymbolAsUid = NATIVE_SYMBOL$2
  // eslint-disable-next-line no-undef
  && !Symbol.sham
  // eslint-disable-next-line no-undef
  && typeof Symbol.iterator == 'symbol';

var classof$c = classofRaw$1;

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
var isArray$8 = Array.isArray || function isArray(arg) {
  return classof$c(arg) == 'Array';
};

var requireObjectCoercible$f = requireObjectCoercible$h;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject$u = function (argument) {
  return Object(requireObjectCoercible$f(argument));
};

var internalObjectKeys = objectKeysInternal;
var enumBugKeys$1 = enumBugKeys$3;

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
var objectKeys$5 = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys$1);
};

var DESCRIPTORS$v = descriptors;
var definePropertyModule$a = objectDefineProperty;
var anObject$1w = anObject$1z;
var objectKeys$4 = objectKeys$5;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
var objectDefineProperties = DESCRIPTORS$v ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject$1w(O);
  var keys = objectKeys$4(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule$a.f(O, key = keys[index++], Properties[key]);
  return O;
};

var getBuiltIn$r = getBuiltIn$t;

var html$2 = getBuiltIn$r('document', 'documentElement');

var anObject$1v = anObject$1z;
var defineProperties$3 = objectDefineProperties;
var enumBugKeys = enumBugKeys$3;
var hiddenKeys$2 = hiddenKeys$6;
var html$1 = html$2;
var documentCreateElement = documentCreateElement$1;
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
  var iframe = documentCreateElement('iframe');
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
  var length = enumBugKeys.length;
  while (length--) delete NullProtoObject[PROTOTYPE$2][enumBugKeys[length]];
  return NullProtoObject();
};

hiddenKeys$2[IE_PROTO$1] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
var objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE$2] = anObject$1v(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE$2] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : defineProperties$3(result, Properties);
};

var objectGetOwnPropertyNamesExternal = {};

var toIndexedObject$9 = toIndexedObject$d;
var nativeGetOwnPropertyNames$2 = objectGetOwnPropertyNames.f;

var toString$1 = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return nativeGetOwnPropertyNames$2(it);
  } catch (error) {
    return windowNames.slice();
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
  return windowNames && toString$1.call(it) == '[object Window]'
    ? getWindowNames(it)
    : nativeGetOwnPropertyNames$2(toIndexedObject$9(it));
};

var global$B = global$L;
var shared$3 = shared$6.exports;
var has$i = has$o;
var uid$3 = uid$5;
var NATIVE_SYMBOL$1 = nativeSymbol;
var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

var WellKnownSymbolsStore$1 = shared$3('wks');
var Symbol$1 = global$B.Symbol;
var createWellKnownSymbol = USE_SYMBOL_AS_UID$1 ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$3;

var wellKnownSymbol$C = function (name) {
  if (!has$i(WellKnownSymbolsStore$1, name)) {
    if (NATIVE_SYMBOL$1 && has$i(Symbol$1, name)) WellKnownSymbolsStore$1[name] = Symbol$1[name];
    else WellKnownSymbolsStore$1[name] = createWellKnownSymbol('Symbol.' + name);
  } return WellKnownSymbolsStore$1[name];
};

var wellKnownSymbolWrapped = {};

var wellKnownSymbol$B = wellKnownSymbol$C;

wellKnownSymbolWrapped.f = wellKnownSymbol$B;

var path$4 = path$6;
var has$h = has$o;
var wrappedWellKnownSymbolModule$1 = wellKnownSymbolWrapped;
var defineProperty$f = objectDefineProperty.f;

var defineWellKnownSymbol$j = function (NAME) {
  var Symbol = path$4.Symbol || (path$4.Symbol = {});
  if (!has$h(Symbol, NAME)) defineProperty$f(Symbol, NAME, {
    value: wrappedWellKnownSymbolModule$1.f(NAME)
  });
};

var defineProperty$e = objectDefineProperty.f;
var has$g = has$o;
var wellKnownSymbol$A = wellKnownSymbol$C;

var TO_STRING_TAG$8 = wellKnownSymbol$A('toStringTag');

var setToStringTag$b = function (it, TAG, STATIC) {
  if (it && !has$g(it = STATIC ? it : it.prototype, TO_STRING_TAG$8)) {
    defineProperty$e(it, TO_STRING_TAG$8, { configurable: true, value: TAG });
  }
};

var aFunction$R = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};

var aFunction$Q = aFunction$R;

// optional / simple context binding
var functionBindContext = function (fn, that, length) {
  aFunction$Q(fn);
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

var isObject$w = isObject$B;
var isArray$7 = isArray$8;
var wellKnownSymbol$z = wellKnownSymbol$C;

var SPECIES$6 = wellKnownSymbol$z('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate$6 = function (originalArray, length) {
  var C;
  if (isArray$7(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray$7(C.prototype))) C = undefined;
    else if (isObject$w(C)) {
      C = C[SPECIES$6];
      if (C === null) C = undefined;
    }
  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};

var bind$n = functionBindContext;
var IndexedObject$3 = indexedObject;
var toObject$t = toObject$u;
var toLength$w = toLength$y;
var arraySpeciesCreate$5 = arraySpeciesCreate$6;

var push$3 = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterOut }` methods implementation
var createMethod$6 = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var IS_FILTER_OUT = TYPE == 7;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject$t($this);
    var self = IndexedObject$3(O);
    var boundFunction = bind$n(callbackfn, that, 3);
    var length = toLength$w(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate$5;
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
          case 2: push$3.call(target, value); // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push$3.call(target, value); // filterOut
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$6(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod$6(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod$6(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod$6(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod$6(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod$6(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$6(6),
  // `Array.prototype.filterOut` method
  // https://github.com/tc39/proposal-array-filtering
  filterOut: createMethod$6(7)
};

var $$44 = _export;
var global$A = global$L;
var getBuiltIn$q = getBuiltIn$t;
var DESCRIPTORS$u = descriptors;
var NATIVE_SYMBOL = nativeSymbol;
var USE_SYMBOL_AS_UID = useSymbolAsUid;
var fails$S = fails$Y;
var has$f = has$o;
var isArray$6 = isArray$8;
var isObject$v = isObject$B;
var anObject$1u = anObject$1z;
var toObject$s = toObject$u;
var toIndexedObject$8 = toIndexedObject$d;
var toPrimitive$8 = toPrimitive$b;
var createPropertyDescriptor$6 = createPropertyDescriptor$9;
var nativeObjectCreate = objectCreate;
var objectKeys$3 = objectKeys$5;
var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternal = objectGetOwnPropertyNamesExternal;
var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
var getOwnPropertyDescriptorModule$5 = objectGetOwnPropertyDescriptor;
var definePropertyModule$9 = objectDefineProperty;
var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
var createNonEnumerableProperty$h = createNonEnumerableProperty$m;
var redefine$e = redefine$g.exports;
var shared$2 = shared$6.exports;
var sharedKey$1 = sharedKey$4;
var hiddenKeys$1 = hiddenKeys$6;
var uid$2 = uid$5;
var wellKnownSymbol$y = wellKnownSymbol$C;
var wrappedWellKnownSymbolModule = wellKnownSymbolWrapped;
var defineWellKnownSymbol$i = defineWellKnownSymbol$j;
var setToStringTag$a = setToStringTag$b;
var InternalStateModule$h = internalState;
var $forEach$3 = arrayIteration.forEach;

var HIDDEN = sharedKey$1('hidden');
var SYMBOL = 'Symbol';
var PROTOTYPE$1 = 'prototype';
var TO_PRIMITIVE$1 = wellKnownSymbol$y('toPrimitive');
var setInternalState$i = InternalStateModule$h.set;
var getInternalState$e = InternalStateModule$h.getterFor(SYMBOL);
var ObjectPrototype$3 = Object[PROTOTYPE$1];
var $Symbol = global$A.Symbol;
var $stringify$1 = getBuiltIn$q('JSON', 'stringify');
var nativeGetOwnPropertyDescriptor$2 = getOwnPropertyDescriptorModule$5.f;
var nativeDefineProperty$1 = definePropertyModule$9.f;
var nativeGetOwnPropertyNames$1 = getOwnPropertyNamesExternal.f;
var nativePropertyIsEnumerable = propertyIsEnumerableModule$1.f;
var AllSymbols = shared$2('symbols');
var ObjectPrototypeSymbols = shared$2('op-symbols');
var StringToSymbolRegistry = shared$2('string-to-symbol-registry');
var SymbolToStringRegistry = shared$2('symbol-to-string-registry');
var WellKnownSymbolsStore = shared$2('wks');
var QObject = global$A.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var USE_SETTER = !QObject || !QObject[PROTOTYPE$1] || !QObject[PROTOTYPE$1].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDescriptor = DESCRIPTORS$u && fails$S(function () {
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

var isSymbol = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return Object(it) instanceof $Symbol;
};

var $defineProperty = function defineProperty(O, P, Attributes) {
  if (O === ObjectPrototype$3) $defineProperty(ObjectPrototypeSymbols, P, Attributes);
  anObject$1u(O);
  var key = toPrimitive$8(P, true);
  anObject$1u(Attributes);
  if (has$f(AllSymbols, key)) {
    if (!Attributes.enumerable) {
      if (!has$f(O, HIDDEN)) nativeDefineProperty$1(O, HIDDEN, createPropertyDescriptor$6(1, {}));
      O[HIDDEN][key] = true;
    } else {
      if (has$f(O, HIDDEN) && O[HIDDEN][key]) O[HIDDEN][key] = false;
      Attributes = nativeObjectCreate(Attributes, { enumerable: createPropertyDescriptor$6(0, false) });
    } return setSymbolDescriptor(O, key, Attributes);
  } return nativeDefineProperty$1(O, key, Attributes);
};

var $defineProperties = function defineProperties(O, Properties) {
  anObject$1u(O);
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
  var P = toPrimitive$8(V, true);
  var enumerable = nativePropertyIsEnumerable.call(this, P);
  if (this === ObjectPrototype$3 && has$f(AllSymbols, P) && !has$f(ObjectPrototypeSymbols, P)) return false;
  return enumerable || !has$f(this, P) || !has$f(AllSymbols, P) || has$f(this, HIDDEN) && this[HIDDEN][P] ? enumerable : true;
};

var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(O, P) {
  var it = toIndexedObject$8(O);
  var key = toPrimitive$8(P, true);
  if (it === ObjectPrototype$3 && has$f(AllSymbols, key) && !has$f(ObjectPrototypeSymbols, key)) return;
  var descriptor = nativeGetOwnPropertyDescriptor$2(it, key);
  if (descriptor && has$f(AllSymbols, key) && !(has$f(it, HIDDEN) && it[HIDDEN][key])) {
    descriptor.enumerable = true;
  }
  return descriptor;
};

var $getOwnPropertyNames = function getOwnPropertyNames(O) {
  var names = nativeGetOwnPropertyNames$1(toIndexedObject$8(O));
  var result = [];
  $forEach$3(names, function (key) {
    if (!has$f(AllSymbols, key) && !has$f(hiddenKeys$1, key)) result.push(key);
  });
  return result;
};

var $getOwnPropertySymbols = function getOwnPropertySymbols(O) {
  var IS_OBJECT_PROTOTYPE = O === ObjectPrototype$3;
  var names = nativeGetOwnPropertyNames$1(IS_OBJECT_PROTOTYPE ? ObjectPrototypeSymbols : toIndexedObject$8(O));
  var result = [];
  $forEach$3(names, function (key) {
    if (has$f(AllSymbols, key) && (!IS_OBJECT_PROTOTYPE || has$f(ObjectPrototype$3, key))) {
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
    var description = !arguments.length || arguments[0] === undefined ? undefined : String(arguments[0]);
    var tag = uid$2(description);
    var setter = function (value) {
      if (this === ObjectPrototype$3) setter.call(ObjectPrototypeSymbols, value);
      if (has$f(this, HIDDEN) && has$f(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDescriptor(this, tag, createPropertyDescriptor$6(1, value));
    };
    if (DESCRIPTORS$u && USE_SETTER) setSymbolDescriptor(ObjectPrototype$3, tag, { configurable: true, set: setter });
    return wrap$1(tag, description);
  };

  redefine$e($Symbol[PROTOTYPE$1], 'toString', function toString() {
    return getInternalState$e(this).tag;
  });

  redefine$e($Symbol, 'withoutSetter', function (description) {
    return wrap$1(uid$2(description), description);
  });

  propertyIsEnumerableModule$1.f = $propertyIsEnumerable;
  definePropertyModule$9.f = $defineProperty;
  getOwnPropertyDescriptorModule$5.f = $getOwnPropertyDescriptor;
  getOwnPropertyNamesModule.f = getOwnPropertyNamesExternal.f = $getOwnPropertyNames;
  getOwnPropertySymbolsModule$1.f = $getOwnPropertySymbols;

  wrappedWellKnownSymbolModule.f = function (name) {
    return wrap$1(wellKnownSymbol$y(name), name);
  };

  if (DESCRIPTORS$u) {
    // https://github.com/tc39/proposal-Symbol-description
    nativeDefineProperty$1($Symbol[PROTOTYPE$1], 'description', {
      configurable: true,
      get: function description() {
        return getInternalState$e(this).description;
      }
    });
    {
      redefine$e(ObjectPrototype$3, 'propertyIsEnumerable', $propertyIsEnumerable, { unsafe: true });
    }
  }
}

$$44({ global: true, wrap: true, forced: !NATIVE_SYMBOL, sham: !NATIVE_SYMBOL }, {
  Symbol: $Symbol
});

$forEach$3(objectKeys$3(WellKnownSymbolsStore), function (name) {
  defineWellKnownSymbol$i(name);
});

$$44({ target: SYMBOL, stat: true, forced: !NATIVE_SYMBOL }, {
  // `Symbol.for` method
  // https://tc39.es/ecma262/#sec-symbol.for
  'for': function (key) {
    var string = String(key);
    if (has$f(StringToSymbolRegistry, string)) return StringToSymbolRegistry[string];
    var symbol = $Symbol(string);
    StringToSymbolRegistry[string] = symbol;
    SymbolToStringRegistry[symbol] = string;
    return symbol;
  },
  // `Symbol.keyFor` method
  // https://tc39.es/ecma262/#sec-symbol.keyfor
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol');
    if (has$f(SymbolToStringRegistry, sym)) return SymbolToStringRegistry[sym];
  },
  useSetter: function () { USE_SETTER = true; },
  useSimple: function () { USE_SETTER = false; }
});

$$44({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL, sham: !DESCRIPTORS$u }, {
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

$$44({ target: 'Object', stat: true, forced: !NATIVE_SYMBOL }, {
  // `Object.getOwnPropertyNames` method
  // https://tc39.es/ecma262/#sec-object.getownpropertynames
  getOwnPropertyNames: $getOwnPropertyNames,
  // `Object.getOwnPropertySymbols` method
  // https://tc39.es/ecma262/#sec-object.getownpropertysymbols
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
// https://bugs.chromium.org/p/v8/issues/detail?id=3443
$$44({ target: 'Object', stat: true, forced: fails$S(function () { getOwnPropertySymbolsModule$1.f(1); }) }, {
  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
    return getOwnPropertySymbolsModule$1.f(toObject$s(it));
  }
});

// `JSON.stringify` method behavior with symbols
// https://tc39.es/ecma262/#sec-json.stringify
if ($stringify$1) {
  var FORCED_JSON_STRINGIFY = !NATIVE_SYMBOL || fails$S(function () {
    var symbol = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    return $stringify$1([symbol]) != '[null]'
      // WebKit converts symbol values to JSON as null
      || $stringify$1({ a: symbol }) != '{}'
      // V8 throws on boxed symbols
      || $stringify$1(Object(symbol)) != '{}';
  });

  $$44({ target: 'JSON', stat: true, forced: FORCED_JSON_STRINGIFY }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var args = [it];
      var index = 1;
      var $replacer;
      while (arguments.length > index) args.push(arguments[index++]);
      $replacer = replacer;
      if (!isObject$v(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!isArray$6(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return $stringify$1.apply(null, args);
    }
  });
}

// `Symbol.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-symbol.prototype-@@toprimitive
if (!$Symbol[PROTOTYPE$1][TO_PRIMITIVE$1]) {
  createNonEnumerableProperty$h($Symbol[PROTOTYPE$1], TO_PRIMITIVE$1, $Symbol[PROTOTYPE$1].valueOf);
}
// `Symbol.prototype[@@toStringTag]` property
// https://tc39.es/ecma262/#sec-symbol.prototype-@@tostringtag
setToStringTag$a($Symbol, SYMBOL);

hiddenKeys$1[HIDDEN] = true;

var defineWellKnownSymbol$h = defineWellKnownSymbol$j;

// `Symbol.asyncIterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.asynciterator
defineWellKnownSymbol$h('asyncIterator');

var $$43 = _export;
var DESCRIPTORS$t = descriptors;
var global$z = global$L;
var has$e = has$o;
var isObject$u = isObject$B;
var defineProperty$d = objectDefineProperty.f;
var copyConstructorProperties = copyConstructorProperties$2;

var NativeSymbol = global$z.Symbol;

if (DESCRIPTORS$t && typeof NativeSymbol == 'function' && (!('description' in NativeSymbol.prototype) ||
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
  var native = String(NativeSymbol('test')) == 'Symbol(test)';
  var regexp = /^Symbol\((.*)\)[^)]+$/;
  defineProperty$d(symbolPrototype, 'description', {
    configurable: true,
    get: function description() {
      var symbol = isObject$u(this) ? this.valueOf() : this;
      var string = symbolToString.call(symbol);
      if (has$e(EmptyStringDescriptionStore, symbol)) return '';
      var desc = native ? string.slice(7, -1) : string.replace(regexp, '$1');
      return desc === '' ? undefined : desc;
    }
  });

  $$43({ global: true, forced: true }, {
    Symbol: SymbolWrapper
  });
}

var defineWellKnownSymbol$g = defineWellKnownSymbol$j;

// `Symbol.hasInstance` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.hasinstance
defineWellKnownSymbol$g('hasInstance');

var defineWellKnownSymbol$f = defineWellKnownSymbol$j;

// `Symbol.isConcatSpreadable` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.isconcatspreadable
defineWellKnownSymbol$f('isConcatSpreadable');

var defineWellKnownSymbol$e = defineWellKnownSymbol$j;

// `Symbol.iterator` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.iterator
defineWellKnownSymbol$e('iterator');

var defineWellKnownSymbol$d = defineWellKnownSymbol$j;

// `Symbol.match` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.match
defineWellKnownSymbol$d('match');

var defineWellKnownSymbol$c = defineWellKnownSymbol$j;

// `Symbol.matchAll` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.matchall
defineWellKnownSymbol$c('matchAll');

var defineWellKnownSymbol$b = defineWellKnownSymbol$j;

// `Symbol.replace` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.replace
defineWellKnownSymbol$b('replace');

var defineWellKnownSymbol$a = defineWellKnownSymbol$j;

// `Symbol.search` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.search
defineWellKnownSymbol$a('search');

var defineWellKnownSymbol$9 = defineWellKnownSymbol$j;

// `Symbol.species` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.species
defineWellKnownSymbol$9('species');

var defineWellKnownSymbol$8 = defineWellKnownSymbol$j;

// `Symbol.split` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.split
defineWellKnownSymbol$8('split');

var defineWellKnownSymbol$7 = defineWellKnownSymbol$j;

// `Symbol.toPrimitive` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.toprimitive
defineWellKnownSymbol$7('toPrimitive');

var defineWellKnownSymbol$6 = defineWellKnownSymbol$j;

// `Symbol.toStringTag` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.tostringtag
defineWellKnownSymbol$6('toStringTag');

var defineWellKnownSymbol$5 = defineWellKnownSymbol$j;

// `Symbol.unscopables` well-known symbol
// https://tc39.es/ecma262/#sec-symbol.unscopables
defineWellKnownSymbol$5('unscopables');

var fails$R = fails$Y;

var correctPrototypeGetter = !fails$R(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var has$d = has$o;
var toObject$r = toObject$u;
var sharedKey = sharedKey$4;
var CORRECT_PROTOTYPE_GETTER$2 = correctPrototypeGetter;

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype$2 = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
var objectGetPrototypeOf$1 = CORRECT_PROTOTYPE_GETTER$2 ? Object.getPrototypeOf : function (O) {
  O = toObject$r(O);
  if (has$d(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype$2 : null;
};

var isObject$t = isObject$B;

var aPossiblePrototype$2 = function (it) {
  if (!isObject$t(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};

var anObject$1t = anObject$1z;
var aPossiblePrototype$1 = aPossiblePrototype$2;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var objectSetPrototypeOf$1 = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject$1t(O);
    aPossiblePrototype$1(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var iterators = {};

var wellKnownSymbol$x = wellKnownSymbol$C;
var Iterators$4 = iterators;

var ITERATOR$8 = wellKnownSymbol$x('iterator');
var ArrayPrototype$1 = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod$3 = function (it) {
  return it !== undefined && (Iterators$4.Array === it || ArrayPrototype$1[ITERATOR$8] === it);
};

var wellKnownSymbol$w = wellKnownSymbol$C;

var TO_STRING_TAG$7 = wellKnownSymbol$w('toStringTag');
var test$2 = {};

test$2[TO_STRING_TAG$7] = 'z';

var toStringTagSupport = String(test$2) === '[object z]';

var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
var classofRaw = classofRaw$1;
var wellKnownSymbol$v = wellKnownSymbol$C;

var TO_STRING_TAG$6 = wellKnownSymbol$v('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof$b = TO_STRING_TAG_SUPPORT$2 ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$6)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};

var classof$a = classof$b;
var Iterators$3 = iterators;
var wellKnownSymbol$u = wellKnownSymbol$C;

var ITERATOR$7 = wellKnownSymbol$u('iterator');

var getIteratorMethod$8 = function (it) {
  if (it != undefined) return it[ITERATOR$7]
    || it['@@iterator']
    || Iterators$3[classof$a(it)];
};

var anObject$1s = anObject$1z;

var iteratorClose$4 = function (iterator) {
  var returnMethod = iterator['return'];
  if (returnMethod !== undefined) {
    return anObject$1s(returnMethod.call(iterator)).value;
  }
};

var anObject$1r = anObject$1z;
var isArrayIteratorMethod$2 = isArrayIteratorMethod$3;
var toLength$v = toLength$y;
var bind$m = functionBindContext;
var getIteratorMethod$7 = getIteratorMethod$8;
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
  var fn = bind$m(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose$3(iterator);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject$1r(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod$7(iterable);
    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod$2(iterFn)) {
      for (index = 0, length = toLength$v(iterable.length); length > index; index++) {
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
      iteratorClose$3(iterator);
      throw error;
    }
    if (typeof result == 'object' && result && result instanceof Result) return result;
  } return new Result(false);
};

var $$42 = _export;
var getPrototypeOf$d = objectGetPrototypeOf$1;
var setPrototypeOf$6 = objectSetPrototypeOf$1;
var create$c = objectCreate;
var createNonEnumerableProperty$g = createNonEnumerableProperty$m;
var createPropertyDescriptor$5 = createPropertyDescriptor$9;
var iterate$H = iterate$I;

var $AggregateError = function AggregateError(errors, message) {
  var that = this;
  if (!(that instanceof $AggregateError)) return new $AggregateError(errors, message);
  if (setPrototypeOf$6) {
    // eslint-disable-next-line unicorn/error-message
    that = setPrototypeOf$6(new Error(undefined), getPrototypeOf$d(that));
  }
  if (message !== undefined) createNonEnumerableProperty$g(that, 'message', String(message));
  var errorsArray = [];
  iterate$H(errors, errorsArray.push, { that: errorsArray });
  createNonEnumerableProperty$g(that, 'errors', errorsArray);
  return that;
};

$AggregateError.prototype = create$c(Error.prototype, {
  constructor: createPropertyDescriptor$5(5, $AggregateError),
  message: createPropertyDescriptor$5(5, ''),
  name: createPropertyDescriptor$5(5, 'AggregateError')
});

// `AggregateError` constructor
// https://tc39.es/ecma262/#sec-aggregate-error-constructor
$$42({ global: true }, {
  AggregateError: $AggregateError
});

var anObject$1q = anObject$1z;
var iteratorClose$2 = iteratorClose$4;

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing$3 = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject$1q(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    iteratorClose$2(iterator);
    throw error;
  }
};

var toPrimitive$7 = toPrimitive$b;
var definePropertyModule$8 = objectDefineProperty;
var createPropertyDescriptor$4 = createPropertyDescriptor$9;

var createProperty$7 = function (object, key, value) {
  var propertyKey = toPrimitive$7(key);
  if (propertyKey in object) definePropertyModule$8.f(object, propertyKey, createPropertyDescriptor$4(0, value));
  else object[propertyKey] = value;
};

var bind$l = functionBindContext;
var toObject$q = toObject$u;
var callWithSafeIterationClosing$2 = callWithSafeIterationClosing$3;
var isArrayIteratorMethod$1 = isArrayIteratorMethod$3;
var toLength$u = toLength$y;
var createProperty$6 = createProperty$7;
var getIteratorMethod$6 = getIteratorMethod$8;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
var arrayFrom$1 = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject$q(arrayLike);
  var C = typeof this == 'function' ? this : Array;
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod$6(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  if (mapping) mapfn = bind$l(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod$1(iteratorMethod))) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    result = new C();
    for (;!(step = next.call(iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing$2(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty$6(result, index, value);
    }
  } else {
    length = toLength$u(O.length);
    result = new C(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty$6(result, index, value);
    }
  }
  result.length = index;
  return result;
};

var wellKnownSymbol$t = wellKnownSymbol$C;

var ITERATOR$6 = wellKnownSymbol$t('iterator');
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
  iteratorWithReturn[ITERATOR$6] = function () {
    return this;
  };
  // eslint-disable-next-line no-throw-literal
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration$4 = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$6] = function () {
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

var $$41 = _export;
var from$5 = arrayFrom$1;
var checkCorrectnessOfIteration$3 = checkCorrectnessOfIteration$4;

var INCORRECT_ITERATION$1 = !checkCorrectnessOfIteration$3(function (iterable) {
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
$$41({ target: 'Array', stat: true, forced: INCORRECT_ITERATION$1 }, {
  from: from$5
});

var $$40 = _export;
var isArray$5 = isArray$8;

// `Array.isArray` method
// https://tc39.es/ecma262/#sec-array.isarray
$$40({ target: 'Array', stat: true }, {
  isArray: isArray$5
});

var $$3$ = _export;
var fails$Q = fails$Y;
var createProperty$5 = createProperty$7;

var ISNT_GENERIC = fails$Q(function () {
  function F() { /* empty */ }
  return !(Array.of.call(F) instanceof F);
});

// `Array.of` method
// https://tc39.es/ecma262/#sec-array.of
// WebKit Array.of isn't generic
$$3$({ target: 'Array', stat: true, forced: ISNT_GENERIC }, {
  of: function of(/* ...args */) {
    var index = 0;
    var argumentsLength = arguments.length;
    var result = new (typeof this == 'function' ? this : Array)(argumentsLength);
    while (argumentsLength > index) createProperty$5(result, index, arguments[index++]);
    result.length = argumentsLength;
    return result;
  }
});

var getBuiltIn$p = getBuiltIn$t;

var engineUserAgent = getBuiltIn$p('navigator', 'userAgent') || '';

var global$y = global$L;
var userAgent$4 = engineUserAgent;

var process$4 = global$y.process;
var versions = process$4 && process$4.versions;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] + match[1];
} else if (userAgent$4) {
  match = userAgent$4.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent$4.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

var engineV8Version = version && +version;

var fails$P = fails$Y;
var wellKnownSymbol$s = wellKnownSymbol$C;
var V8_VERSION$2 = engineV8Version;

var SPECIES$5 = wellKnownSymbol$s('species');

var arrayMethodHasSpeciesSupport$5 = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION$2 >= 51 || !fails$P(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$5] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var $$3_ = _export;
var fails$O = fails$Y;
var isArray$4 = isArray$8;
var isObject$s = isObject$B;
var toObject$p = toObject$u;
var toLength$t = toLength$y;
var createProperty$4 = createProperty$7;
var arraySpeciesCreate$4 = arraySpeciesCreate$6;
var arrayMethodHasSpeciesSupport$4 = arrayMethodHasSpeciesSupport$5;
var wellKnownSymbol$r = wellKnownSymbol$C;
var V8_VERSION$1 = engineV8Version;

var IS_CONCAT_SPREADABLE = wellKnownSymbol$r('isConcatSpreadable');
var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION$1 >= 51 || !fails$O(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport$4('concat');

var isConcatSpreadable = function (O) {
  if (!isObject$s(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray$4(O);
};

var FORCED$r = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$$3_({ target: 'Array', proto: true, forced: FORCED$r }, {
  concat: function concat(arg) { // eslint-disable-line no-unused-vars
    var O = toObject$p(this);
    var A = arraySpeciesCreate$4(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = toLength$t(E.length);
        if (n + len > MAX_SAFE_INTEGER$1) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty$4(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER$1) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty$4(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var toObject$o = toObject$u;
var toAbsoluteIndex$6 = toAbsoluteIndex$8;
var toLength$s = toLength$y;

var min$7 = Math.min;

// `Array.prototype.copyWithin` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject$o(this);
  var len = toLength$s(O.length);
  var to = toAbsoluteIndex$6(target, len);
  var from = toAbsoluteIndex$6(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = min$7((end === undefined ? len : toAbsoluteIndex$6(end, len)) - from, len - to);
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

var wellKnownSymbol$q = wellKnownSymbol$C;
var create$b = objectCreate;
var definePropertyModule$7 = objectDefineProperty;

var UNSCOPABLES = wellKnownSymbol$q('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  definePropertyModule$7.f(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: create$b(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables$d = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

var $$3Z = _export;
var copyWithin = arrayCopyWithin;
var addToUnscopables$c = addToUnscopables$d;

// `Array.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
$$3Z({ target: 'Array', proto: true }, {
  copyWithin: copyWithin
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$c('copyWithin');

var fails$N = fails$Y;

var arrayMethodIsStrict$9 = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails$N(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () { throw 1; }, 1);
  });
};

var DESCRIPTORS$s = descriptors;
var fails$M = fails$Y;
var has$c = has$o;

var defineProperty$c = Object.defineProperty;
var cache = {};

var thrower = function (it) { throw it; };

var arrayMethodUsesToLength$e = function (METHOD_NAME, options) {
  if (has$c(cache, METHOD_NAME)) return cache[METHOD_NAME];
  if (!options) options = {};
  var method = [][METHOD_NAME];
  var ACCESSORS = has$c(options, 'ACCESSORS') ? options.ACCESSORS : false;
  var argument0 = has$c(options, 0) ? options[0] : thrower;
  var argument1 = has$c(options, 1) ? options[1] : undefined;

  return cache[METHOD_NAME] = !!method && !fails$M(function () {
    if (ACCESSORS && !DESCRIPTORS$s) return true;
    var O = { length: -1 };

    if (ACCESSORS) defineProperty$c(O, 1, { enumerable: true, get: thrower });
    else O[1] = 1;

    method.call(O, argument0, argument1);
  });
};

var $$3Y = _export;
var $every$2 = arrayIteration.every;
var arrayMethodIsStrict$8 = arrayMethodIsStrict$9;
var arrayMethodUsesToLength$d = arrayMethodUsesToLength$e;

var STRICT_METHOD$8 = arrayMethodIsStrict$8('every');
var USES_TO_LENGTH$d = arrayMethodUsesToLength$d('every');

// `Array.prototype.every` method
// https://tc39.es/ecma262/#sec-array.prototype.every
$$3Y({ target: 'Array', proto: true, forced: !STRICT_METHOD$8 || !USES_TO_LENGTH$d }, {
  every: function every(callbackfn /* , thisArg */) {
    return $every$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var toObject$n = toObject$u;
var toAbsoluteIndex$5 = toAbsoluteIndex$8;
var toLength$r = toLength$y;

// `Array.prototype.fill` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.fill
var arrayFill$1 = function fill(value /* , start = 0, end = @length */) {
  var O = toObject$n(this);
  var length = toLength$r(O.length);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex$5(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex$5(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

var $$3X = _export;
var fill = arrayFill$1;
var addToUnscopables$b = addToUnscopables$d;

// `Array.prototype.fill` method
// https://tc39.es/ecma262/#sec-array.prototype.fill
$$3X({ target: 'Array', proto: true }, {
  fill: fill
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$b('fill');

var $$3W = _export;
var $filter$1 = arrayIteration.filter;
var arrayMethodHasSpeciesSupport$3 = arrayMethodHasSpeciesSupport$5;
var arrayMethodUsesToLength$c = arrayMethodUsesToLength$e;

var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport$3('filter');
// Edge 14- issue
var USES_TO_LENGTH$c = arrayMethodUsesToLength$c('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$$3W({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 || !USES_TO_LENGTH$c }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3V = _export;
var $find$2 = arrayIteration.find;
var addToUnscopables$a = addToUnscopables$d;
var arrayMethodUsesToLength$b = arrayMethodUsesToLength$e;

var FIND = 'find';
var SKIPS_HOLES$1 = true;

var USES_TO_LENGTH$b = arrayMethodUsesToLength$b(FIND);

// Shouldn't skip holes
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES$1 = false; });

// `Array.prototype.find` method
// https://tc39.es/ecma262/#sec-array.prototype.find
$$3V({ target: 'Array', proto: true, forced: SKIPS_HOLES$1 || !USES_TO_LENGTH$b }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$a(FIND);

var $$3U = _export;
var $findIndex$1 = arrayIteration.findIndex;
var addToUnscopables$9 = addToUnscopables$d;
var arrayMethodUsesToLength$a = arrayMethodUsesToLength$e;

var FIND_INDEX = 'findIndex';
var SKIPS_HOLES = true;

var USES_TO_LENGTH$a = arrayMethodUsesToLength$a(FIND_INDEX);

// Shouldn't skip holes
if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

// `Array.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findindex
$$3U({ target: 'Array', proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH$a }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $findIndex$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$9(FIND_INDEX);

var isArray$3 = isArray$8;
var toLength$q = toLength$y;
var bind$k = functionBindContext;

// `FlattenIntoArray` abstract operation
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var flattenIntoArray$2 = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? bind$k(mapper, thisArg, 3) : false;
  var element;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

      if (depth > 0 && isArray$3(element)) {
        targetIndex = flattenIntoArray$2(target, original, element, toLength$q(element.length), targetIndex, depth - 1) - 1;
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

var $$3T = _export;
var flattenIntoArray$1 = flattenIntoArray_1;
var toObject$m = toObject$u;
var toLength$p = toLength$y;
var toInteger$c = toInteger$f;
var arraySpeciesCreate$3 = arraySpeciesCreate$6;

// `Array.prototype.flat` method
// https://tc39.es/ecma262/#sec-array.prototype.flat
$$3T({ target: 'Array', proto: true }, {
  flat: function flat(/* depthArg = 1 */) {
    var depthArg = arguments.length ? arguments[0] : undefined;
    var O = toObject$m(this);
    var sourceLen = toLength$p(O.length);
    var A = arraySpeciesCreate$3(O, 0);
    A.length = flattenIntoArray$1(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toInteger$c(depthArg));
    return A;
  }
});

var $$3S = _export;
var flattenIntoArray = flattenIntoArray_1;
var toObject$l = toObject$u;
var toLength$o = toLength$y;
var aFunction$P = aFunction$R;
var arraySpeciesCreate$2 = arraySpeciesCreate$6;

// `Array.prototype.flatMap` method
// https://tc39.es/ecma262/#sec-array.prototype.flatmap
$$3S({ target: 'Array', proto: true }, {
  flatMap: function flatMap(callbackfn /* , thisArg */) {
    var O = toObject$l(this);
    var sourceLen = toLength$o(O.length);
    var A;
    aFunction$P(callbackfn);
    A = arraySpeciesCreate$2(O, 0);
    A.length = flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return A;
  }
});

var $forEach$2 = arrayIteration.forEach;
var arrayMethodIsStrict$7 = arrayMethodIsStrict$9;
var arrayMethodUsesToLength$9 = arrayMethodUsesToLength$e;

var STRICT_METHOD$7 = arrayMethodIsStrict$7('forEach');
var USES_TO_LENGTH$9 = arrayMethodUsesToLength$9('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = (!STRICT_METHOD$7 || !USES_TO_LENGTH$9) ? function forEach(callbackfn /* , thisArg */) {
  return $forEach$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
} : [].forEach;

var $$3R = _export;
var forEach$2 = arrayForEach;

// `Array.prototype.forEach` method
// https://tc39.es/ecma262/#sec-array.prototype.foreach
$$3R({ target: 'Array', proto: true, forced: [].forEach != forEach$2 }, {
  forEach: forEach$2
});

var $$3Q = _export;
var $includes$1 = arrayIncludes.includes;
var addToUnscopables$8 = addToUnscopables$d;
var arrayMethodUsesToLength$8 = arrayMethodUsesToLength$e;

var USES_TO_LENGTH$8 = arrayMethodUsesToLength$8('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$$3Q({ target: 'Array', proto: true, forced: !USES_TO_LENGTH$8 }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes$1(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$8('includes');

var $$3P = _export;
var $indexOf$1 = arrayIncludes.indexOf;
var arrayMethodIsStrict$6 = arrayMethodIsStrict$9;
var arrayMethodUsesToLength$7 = arrayMethodUsesToLength$e;

var nativeIndexOf = [].indexOf;

var NEGATIVE_ZERO$1 = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
var STRICT_METHOD$6 = arrayMethodIsStrict$6('indexOf');
var USES_TO_LENGTH$7 = arrayMethodUsesToLength$7('indexOf', { ACCESSORS: true, 1: 0 });

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
$$3P({ target: 'Array', proto: true, forced: NEGATIVE_ZERO$1 || !STRICT_METHOD$6 || !USES_TO_LENGTH$7 }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return NEGATIVE_ZERO$1
      // convert -0 to +0
      ? nativeIndexOf.apply(this, arguments) || 0
      : $indexOf$1(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3O = _export;
var IndexedObject$2 = indexedObject;
var toIndexedObject$7 = toIndexedObject$d;
var arrayMethodIsStrict$5 = arrayMethodIsStrict$9;

var nativeJoin = [].join;

var ES3_STRINGS = IndexedObject$2 != Object;
var STRICT_METHOD$5 = arrayMethodIsStrict$5('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
$$3O({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$5 }, {
  join: function join(separator) {
    return nativeJoin.call(toIndexedObject$7(this), separator === undefined ? ',' : separator);
  }
});

var toIndexedObject$6 = toIndexedObject$d;
var toInteger$b = toInteger$f;
var toLength$n = toLength$y;
var arrayMethodIsStrict$4 = arrayMethodIsStrict$9;
var arrayMethodUsesToLength$6 = arrayMethodUsesToLength$e;

var min$6 = Math.min;
var nativeLastIndexOf = [].lastIndexOf;
var NEGATIVE_ZERO = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
var STRICT_METHOD$4 = arrayMethodIsStrict$4('lastIndexOf');
// For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method
var USES_TO_LENGTH$6 = arrayMethodUsesToLength$6('indexOf', { ACCESSORS: true, 1: 0 });
var FORCED$q = NEGATIVE_ZERO || !STRICT_METHOD$4 || !USES_TO_LENGTH$6;

// `Array.prototype.lastIndexOf` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
var arrayLastIndexOf = FORCED$q ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
  // convert -0 to +0
  if (NEGATIVE_ZERO) return nativeLastIndexOf.apply(this, arguments) || 0;
  var O = toIndexedObject$6(this);
  var length = toLength$n(O.length);
  var index = length - 1;
  if (arguments.length > 1) index = min$6(index, toInteger$b(arguments[1]));
  if (index < 0) index = length + index;
  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
  return -1;
} : nativeLastIndexOf;

var $$3N = _export;
var lastIndexOf = arrayLastIndexOf;

// `Array.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
$$3N({ target: 'Array', proto: true, forced: lastIndexOf !== [].lastIndexOf }, {
  lastIndexOf: lastIndexOf
});

var $$3M = _export;
var $map$1 = arrayIteration.map;
var arrayMethodHasSpeciesSupport$2 = arrayMethodHasSpeciesSupport$5;
var arrayMethodUsesToLength$5 = arrayMethodUsesToLength$e;

var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport$2('map');
// FF49- issue
var USES_TO_LENGTH$5 = arrayMethodUsesToLength$5('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
$$3M({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 || !USES_TO_LENGTH$5 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var aFunction$O = aFunction$R;
var toObject$k = toObject$u;
var IndexedObject$1 = indexedObject;
var toLength$m = toLength$y;

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod$5 = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    aFunction$O(callbackfn);
    var O = toObject$k(that);
    var self = IndexedObject$1(O);
    var length = toLength$m(O.length);
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
  left: createMethod$5(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod$5(true)
};

var classof$9 = classofRaw$1;
var global$x = global$L;

var engineIsNode = classof$9(global$x.process) == 'process';

var $$3L = _export;
var $reduce$1 = arrayReduce.left;
var arrayMethodIsStrict$3 = arrayMethodIsStrict$9;
var arrayMethodUsesToLength$4 = arrayMethodUsesToLength$e;
var CHROME_VERSION$1 = engineV8Version;
var IS_NODE$5 = engineIsNode;

var STRICT_METHOD$3 = arrayMethodIsStrict$3('reduce');
var USES_TO_LENGTH$4 = arrayMethodUsesToLength$4('reduce', { 1: 0 });
// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG$1 = !IS_NODE$5 && CHROME_VERSION$1 > 79 && CHROME_VERSION$1 < 83;

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
$$3L({ target: 'Array', proto: true, forced: !STRICT_METHOD$3 || !USES_TO_LENGTH$4 || CHROME_BUG$1 }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    return $reduce$1(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3K = _export;
var $reduceRight$1 = arrayReduce.right;
var arrayMethodIsStrict$2 = arrayMethodIsStrict$9;
var arrayMethodUsesToLength$3 = arrayMethodUsesToLength$e;
var CHROME_VERSION = engineV8Version;
var IS_NODE$4 = engineIsNode;

var STRICT_METHOD$2 = arrayMethodIsStrict$2('reduceRight');
// For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method
var USES_TO_LENGTH$3 = arrayMethodUsesToLength$3('reduce', { 1: 0 });
// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !IS_NODE$4 && CHROME_VERSION > 79 && CHROME_VERSION < 83;

// `Array.prototype.reduceRight` method
// https://tc39.es/ecma262/#sec-array.prototype.reduceright
$$3K({ target: 'Array', proto: true, forced: !STRICT_METHOD$2 || !USES_TO_LENGTH$3 || CHROME_BUG }, {
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return $reduceRight$1(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3J = _export;
var isArray$2 = isArray$8;

var nativeReverse = [].reverse;
var test$1 = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.es/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
$$3J({ target: 'Array', proto: true, forced: String(test$1) === String(test$1.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign
    if (isArray$2(this)) this.length = this.length;
    return nativeReverse.call(this);
  }
});

var $$3I = _export;
var isObject$r = isObject$B;
var isArray$1 = isArray$8;
var toAbsoluteIndex$4 = toAbsoluteIndex$8;
var toLength$l = toLength$y;
var toIndexedObject$5 = toIndexedObject$d;
var createProperty$3 = createProperty$7;
var wellKnownSymbol$p = wellKnownSymbol$C;
var arrayMethodHasSpeciesSupport$1 = arrayMethodHasSpeciesSupport$5;
var arrayMethodUsesToLength$2 = arrayMethodUsesToLength$e;

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport$1('slice');
var USES_TO_LENGTH$2 = arrayMethodUsesToLength$2('slice', { ACCESSORS: true, 0: 0, 1: 2 });

var SPECIES$4 = wellKnownSymbol$p('species');
var nativeSlice = [].slice;
var max$4 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$$3I({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$2 }, {
  slice: function slice(start, end) {
    var O = toIndexedObject$5(this);
    var length = toLength$l(O.length);
    var k = toAbsoluteIndex$4(start, length);
    var fin = toAbsoluteIndex$4(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray$1(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (typeof Constructor == 'function' && (Constructor === Array || isArray$1(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject$r(Constructor)) {
        Constructor = Constructor[SPECIES$4];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array || Constructor === undefined) {
        return nativeSlice.call(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array : Constructor)(max$4(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty$3(result, n, O[k]);
    result.length = n;
    return result;
  }
});

var $$3H = _export;
var $some$2 = arrayIteration.some;
var arrayMethodIsStrict$1 = arrayMethodIsStrict$9;
var arrayMethodUsesToLength$1 = arrayMethodUsesToLength$e;

var STRICT_METHOD$1 = arrayMethodIsStrict$1('some');
var USES_TO_LENGTH$1 = arrayMethodUsesToLength$1('some');

// `Array.prototype.some` method
// https://tc39.es/ecma262/#sec-array.prototype.some
$$3H({ target: 'Array', proto: true, forced: !STRICT_METHOD$1 || !USES_TO_LENGTH$1 }, {
  some: function some(callbackfn /* , thisArg */) {
    return $some$2(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$3G = _export;
var aFunction$N = aFunction$R;
var toObject$j = toObject$u;
var fails$L = fails$Y;
var arrayMethodIsStrict = arrayMethodIsStrict$9;

var test = [];
var nativeSort = test.sort;

// IE8-
var FAILS_ON_UNDEFINED = fails$L(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails$L(function () {
  test.sort(null);
});
// Old WebKit
var STRICT_METHOD = arrayMethodIsStrict('sort');

var FORCED$p = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD;

// `Array.prototype.sort` method
// https://tc39.es/ecma262/#sec-array.prototype.sort
$$3G({ target: 'Array', proto: true, forced: FORCED$p }, {
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? nativeSort.call(toObject$j(this))
      : nativeSort.call(toObject$j(this), aFunction$N(comparefn));
  }
});

var $$3F = _export;
var toAbsoluteIndex$3 = toAbsoluteIndex$8;
var toInteger$a = toInteger$f;
var toLength$k = toLength$y;
var toObject$i = toObject$u;
var arraySpeciesCreate$1 = arraySpeciesCreate$6;
var createProperty$2 = createProperty$7;
var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$5;
var arrayMethodUsesToLength = arrayMethodUsesToLength$e;

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');
var USES_TO_LENGTH = arrayMethodUsesToLength('splice', { ACCESSORS: true, 0: 0, 1: 2 });

var max$3 = Math.max;
var min$5 = Math.min;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
// with adding support of @@species
$$3F({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject$i(this);
    var len = toLength$k(O.length);
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
      actualDeleteCount = min$5(max$3(toInteger$a(deleteCount), 0), len - actualStart);
    }
    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
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

var getBuiltIn$o = getBuiltIn$t;
var definePropertyModule$6 = objectDefineProperty;
var wellKnownSymbol$o = wellKnownSymbol$C;
var DESCRIPTORS$r = descriptors;

var SPECIES$3 = wellKnownSymbol$o('species');

var setSpecies$7 = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn$o(CONSTRUCTOR_NAME);
  var defineProperty = definePropertyModule$6.f;

  if (DESCRIPTORS$r && Constructor && !Constructor[SPECIES$3]) {
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

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$7 = addToUnscopables$d;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$7('flat');

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$6 = addToUnscopables$d;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$6('flatMap');

var fails$K = fails$Y;
var getPrototypeOf$c = objectGetPrototypeOf$1;
var createNonEnumerableProperty$f = createNonEnumerableProperty$m;
var has$b = has$o;
var wellKnownSymbol$n = wellKnownSymbol$C;

var ITERATOR$5 = wellKnownSymbol$n('iterator');
var BUGGY_SAFARI_ITERATORS$1 = false;

var returnThis$2 = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype$3, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf$c(getPrototypeOf$c(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$3 = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = IteratorPrototype$3 == undefined || fails$K(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype$3[ITERATOR$5].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$3 = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!has$b(IteratorPrototype$3, ITERATOR$5)) {
  createNonEnumerableProperty$f(IteratorPrototype$3, ITERATOR$5, returnThis$2);
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype$3,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
};

var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
var create$a = objectCreate;
var createPropertyDescriptor$3 = createPropertyDescriptor$9;
var setToStringTag$9 = setToStringTag$b;
var Iterators$2 = iterators;

var returnThis$1 = function () { return this; };

var createIteratorConstructor$7 = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create$a(IteratorPrototype$2, { next: createPropertyDescriptor$3(1, next) });
  setToStringTag$9(IteratorConstructor, TO_STRING_TAG, false);
  Iterators$2[TO_STRING_TAG] = returnThis$1;
  return IteratorConstructor;
};

var $$3E = _export;
var createIteratorConstructor$6 = createIteratorConstructor$7;
var getPrototypeOf$b = objectGetPrototypeOf$1;
var setPrototypeOf$5 = objectSetPrototypeOf$1;
var setToStringTag$8 = setToStringTag$b;
var createNonEnumerableProperty$e = createNonEnumerableProperty$m;
var redefine$d = redefine$g.exports;
var wellKnownSymbol$m = wellKnownSymbol$C;
var Iterators$1 = iterators;
var IteratorsCore = iteratorsCore;

var IteratorPrototype$1 = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$4 = wellKnownSymbol$m('iterator');
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
  var nativeIterator = IterablePrototype[ITERATOR$4]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf$b(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype$1 !== Object.prototype && CurrentIteratorPrototype.next) {
      if (getPrototypeOf$b(CurrentIteratorPrototype) !== IteratorPrototype$1) {
        if (setPrototypeOf$5) {
          setPrototypeOf$5(CurrentIteratorPrototype, IteratorPrototype$1);
        } else if (typeof CurrentIteratorPrototype[ITERATOR$4] != 'function') {
          createNonEnumerableProperty$e(CurrentIteratorPrototype, ITERATOR$4, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag$8(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if (IterablePrototype[ITERATOR$4] !== defaultIterator) {
    createNonEnumerableProperty$e(IterablePrototype, ITERATOR$4, defaultIterator);
  }
  Iterators$1[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine$d(IterablePrototype, KEY, methods[KEY]);
      }
    } else $$3E({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};

var toIndexedObject$4 = toIndexedObject$d;
var addToUnscopables$5 = addToUnscopables$d;
var Iterators = iterators;
var InternalStateModule$g = internalState;
var defineIterator$2 = defineIterator$3;

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$h = InternalStateModule$g.set;
var getInternalState$d = InternalStateModule$g.getterFor(ARRAY_ITERATOR);

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
    target: toIndexedObject$4(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$d(this);
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
addToUnscopables$5('keys');
addToUnscopables$5('values');
addToUnscopables$5('entries');

var aFunction$M = aFunction$R;
var isObject$q = isObject$B;

var slice$1 = [].slice;
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
  var fn = aFunction$M(this);
  var partArgs = slice$1.call(arguments, 1);
  var boundFunction = function bound(/* args... */) {
    var args = partArgs.concat(slice$1.call(arguments));
    return this instanceof boundFunction ? construct(fn, args.length, args) : fn.apply(that, args);
  };
  if (isObject$q(fn.prototype)) boundFunction.prototype = fn.prototype;
  return boundFunction;
};

var $$3D = _export;
var bind$j = functionBind;

// `Function.prototype.bind` method
// https://tc39.es/ecma262/#sec-function.prototype.bind
$$3D({ target: 'Function', proto: true }, {
  bind: bind$j
});

var DESCRIPTORS$q = descriptors;
var defineProperty$b = objectDefineProperty.f;

var FunctionPrototype$1 = Function.prototype;
var FunctionPrototypeToString = FunctionPrototype$1.toString;
var nameRE = /^\s*function ([^ (]*)/;
var NAME$1 = 'name';

// Function instances `.name` property
// https://tc39.es/ecma262/#sec-function-instances-name
if (DESCRIPTORS$q && !(NAME$1 in FunctionPrototype$1)) {
  defineProperty$b(FunctionPrototype$1, NAME$1, {
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

var isObject$p = isObject$B;
var definePropertyModule$5 = objectDefineProperty;
var getPrototypeOf$a = objectGetPrototypeOf$1;
var wellKnownSymbol$l = wellKnownSymbol$C;

var HAS_INSTANCE = wellKnownSymbol$l('hasInstance');
var FunctionPrototype = Function.prototype;

// `Function.prototype[@@hasInstance]` method
// https://tc39.es/ecma262/#sec-function.prototype-@@hasinstance
if (!(HAS_INSTANCE in FunctionPrototype)) {
  definePropertyModule$5.f(FunctionPrototype, HAS_INSTANCE, { value: function (O) {
    if (typeof this != 'function' || !isObject$p(O)) return false;
    if (!isObject$p(this.prototype)) return O instanceof this;
    // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
    while (O = getPrototypeOf$a(O)) if (this.prototype === O) return true;
    return false;
  } });
}

var $$3C = _export;
var global$w = global$L;

// `globalThis` object
// https://tc39.es/ecma262/#sec-globalthis
$$3C({ global: true }, {
  globalThis: global$w
});

var DESCRIPTORS$p = descriptors;
var fails$J = fails$Y;
var objectKeys$2 = objectKeys$5;
var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
var propertyIsEnumerableModule = objectPropertyIsEnumerable;
var toObject$h = toObject$u;
var IndexedObject = indexedObject;

var nativeAssign = Object.assign;
var defineProperty$a = Object.defineProperty;

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
var objectAssign = !nativeAssign || fails$J(function () {
  // should have correct order of operations (Edge bug)
  if (DESCRIPTORS$p && nativeAssign({ b: 1 }, nativeAssign(defineProperty$a({}, 'a', {
    enumerable: true,
    get: function () {
      defineProperty$a(this, 'b', {
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
  return nativeAssign({}, A)[symbol] != 7 || objectKeys$2(nativeAssign({}, B)).join('') != alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject$h(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? objectKeys$2(S).concat(getOwnPropertySymbols(S)) : objectKeys$2(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS$p || propertyIsEnumerable.call(S, key)) T[key] = S[key];
    }
  } return T;
} : nativeAssign;

var $$3B = _export;
var assign$1 = objectAssign;

// `Object.assign` method
// https://tc39.es/ecma262/#sec-object.assign
$$3B({ target: 'Object', stat: true, forced: Object.assign !== assign$1 }, {
  assign: assign$1
});

var $$3A = _export;
var DESCRIPTORS$o = descriptors;
var create$9 = objectCreate;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
$$3A({ target: 'Object', stat: true, sham: !DESCRIPTORS$o }, {
  create: create$9
});

var $$3z = _export;
var DESCRIPTORS$n = descriptors;
var objectDefinePropertyModile = objectDefineProperty;

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
$$3z({ target: 'Object', stat: true, forced: !DESCRIPTORS$n, sham: !DESCRIPTORS$n }, {
  defineProperty: objectDefinePropertyModile.f
});

var $$3y = _export;
var DESCRIPTORS$m = descriptors;
var defineProperties$2 = objectDefineProperties;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
$$3y({ target: 'Object', stat: true, forced: !DESCRIPTORS$m, sham: !DESCRIPTORS$m }, {
  defineProperties: defineProperties$2
});

var DESCRIPTORS$l = descriptors;
var objectKeys$1 = objectKeys$5;
var toIndexedObject$3 = toIndexedObject$d;
var propertyIsEnumerable = objectPropertyIsEnumerable.f;

// `Object.{ entries, values }` methods implementation
var createMethod$4 = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject$3(it);
    var keys = objectKeys$1(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS$l || propertyIsEnumerable.call(O, key)) {
        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

var objectToArray = {
  // `Object.entries` method
  // https://tc39.es/ecma262/#sec-object.entries
  entries: createMethod$4(true),
  // `Object.values` method
  // https://tc39.es/ecma262/#sec-object.values
  values: createMethod$4(false)
};

var $$3x = _export;
var $entries = objectToArray.entries;

// `Object.entries` method
// https://tc39.es/ecma262/#sec-object.entries
$$3x({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return $entries(O);
  }
});

var fails$I = fails$Y;

var freezing = !fails$I(function () {
  return Object.isExtensible(Object.preventExtensions({}));
});

var internalMetadata = {exports: {}};

var hiddenKeys = hiddenKeys$6;
var isObject$o = isObject$B;
var has$a = has$o;
var defineProperty$9 = objectDefineProperty.f;
var uid$1 = uid$5;
var FREEZING$4 = freezing;

var METADATA = uid$1('meta');
var id$1 = 0;

var isExtensible$1 = Object.isExtensible || function () {
  return true;
};

var setMetadata = function (it) {
  defineProperty$9(it, METADATA, { value: {
    objectID: 'O' + ++id$1, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey$1 = function (it, create) {
  // return a primitive with prefix
  if (!isObject$o(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has$a(it, METADATA)) {
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
  if (!has$a(it, METADATA)) {
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
  if (FREEZING$4 && meta.REQUIRED && isExtensible$1(it) && !has$a(it, METADATA)) setMetadata(it);
  return it;
};

var meta = internalMetadata.exports = {
  REQUIRED: false,
  fastKey: fastKey$1,
  getWeakData: getWeakData$1,
  onFreeze: onFreeze$3
};

hiddenKeys[METADATA] = true;

var $$3w = _export;
var FREEZING$3 = freezing;
var fails$H = fails$Y;
var isObject$n = isObject$B;
var onFreeze$2 = internalMetadata.exports.onFreeze;

var nativeFreeze = Object.freeze;
var FAILS_ON_PRIMITIVES$9 = fails$H(function () { nativeFreeze(1); });

// `Object.freeze` method
// https://tc39.es/ecma262/#sec-object.freeze
$$3w({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$9, sham: !FREEZING$3 }, {
  freeze: function freeze(it) {
    return nativeFreeze && isObject$n(it) ? nativeFreeze(onFreeze$2(it)) : it;
  }
});

var $$3v = _export;
var iterate$G = iterate$I;
var createProperty$1 = createProperty$7;

// `Object.fromEntries` method
// https://github.com/tc39/proposal-object-from-entries
$$3v({ target: 'Object', stat: true }, {
  fromEntries: function fromEntries(iterable) {
    var obj = {};
    iterate$G(iterable, function (k, v) {
      createProperty$1(obj, k, v);
    }, { AS_ENTRIES: true });
    return obj;
  }
});

var $$3u = _export;
var fails$G = fails$Y;
var toIndexedObject$2 = toIndexedObject$d;
var nativeGetOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var DESCRIPTORS$k = descriptors;

var FAILS_ON_PRIMITIVES$8 = fails$G(function () { nativeGetOwnPropertyDescriptor$1(1); });
var FORCED$o = !DESCRIPTORS$k || FAILS_ON_PRIMITIVES$8;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
$$3u({ target: 'Object', stat: true, forced: FORCED$o, sham: !DESCRIPTORS$k }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(it, key) {
    return nativeGetOwnPropertyDescriptor$1(toIndexedObject$2(it), key);
  }
});

var $$3t = _export;
var DESCRIPTORS$j = descriptors;
var ownKeys$1 = ownKeys$3;
var toIndexedObject$1 = toIndexedObject$d;
var getOwnPropertyDescriptorModule$4 = objectGetOwnPropertyDescriptor;
var createProperty = createProperty$7;

// `Object.getOwnPropertyDescriptors` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptors
$$3t({ target: 'Object', stat: true, sham: !DESCRIPTORS$j }, {
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

var $$3s = _export;
var fails$F = fails$Y;
var nativeGetOwnPropertyNames = objectGetOwnPropertyNamesExternal.f;

var FAILS_ON_PRIMITIVES$7 = fails$F(function () { return !Object.getOwnPropertyNames(1); });

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
$$3s({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$7 }, {
  getOwnPropertyNames: nativeGetOwnPropertyNames
});

var $$3r = _export;
var fails$E = fails$Y;
var toObject$g = toObject$u;
var nativeGetPrototypeOf = objectGetPrototypeOf$1;
var CORRECT_PROTOTYPE_GETTER$1 = correctPrototypeGetter;

var FAILS_ON_PRIMITIVES$6 = fails$E(function () { nativeGetPrototypeOf(1); });

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
$$3r({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$6, sham: !CORRECT_PROTOTYPE_GETTER$1 }, {
  getPrototypeOf: function getPrototypeOf(it) {
    return nativeGetPrototypeOf(toObject$g(it));
  }
});

// `SameValue` abstract operation
// https://tc39.es/ecma262/#sec-samevalue
var sameValue$1 = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

var $$3q = _export;
var is = sameValue$1;

// `Object.is` method
// https://tc39.es/ecma262/#sec-object.is
$$3q({ target: 'Object', stat: true }, {
  is: is
});

var $$3p = _export;
var fails$D = fails$Y;
var isObject$m = isObject$B;

var nativeIsExtensible = Object.isExtensible;
var FAILS_ON_PRIMITIVES$5 = fails$D(function () { nativeIsExtensible(1); });

// `Object.isExtensible` method
// https://tc39.es/ecma262/#sec-object.isextensible
$$3p({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$5 }, {
  isExtensible: function isExtensible(it) {
    return isObject$m(it) ? nativeIsExtensible ? nativeIsExtensible(it) : true : false;
  }
});

var $$3o = _export;
var fails$C = fails$Y;
var isObject$l = isObject$B;

var nativeIsFrozen = Object.isFrozen;
var FAILS_ON_PRIMITIVES$4 = fails$C(function () { nativeIsFrozen(1); });

// `Object.isFrozen` method
// https://tc39.es/ecma262/#sec-object.isfrozen
$$3o({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$4 }, {
  isFrozen: function isFrozen(it) {
    return isObject$l(it) ? nativeIsFrozen ? nativeIsFrozen(it) : false : true;
  }
});

var $$3n = _export;
var fails$B = fails$Y;
var isObject$k = isObject$B;

var nativeIsSealed = Object.isSealed;
var FAILS_ON_PRIMITIVES$3 = fails$B(function () { nativeIsSealed(1); });

// `Object.isSealed` method
// https://tc39.es/ecma262/#sec-object.issealed
$$3n({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$3 }, {
  isSealed: function isSealed(it) {
    return isObject$k(it) ? nativeIsSealed ? nativeIsSealed(it) : false : true;
  }
});

var $$3m = _export;
var toObject$f = toObject$u;
var nativeKeys = objectKeys$5;
var fails$A = fails$Y;

var FAILS_ON_PRIMITIVES$2 = fails$A(function () { nativeKeys(1); });

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
$$3m({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$2 }, {
  keys: function keys(it) {
    return nativeKeys(toObject$f(it));
  }
});

var $$3l = _export;
var isObject$j = isObject$B;
var onFreeze$1 = internalMetadata.exports.onFreeze;
var FREEZING$2 = freezing;
var fails$z = fails$Y;

var nativePreventExtensions = Object.preventExtensions;
var FAILS_ON_PRIMITIVES$1 = fails$z(function () { nativePreventExtensions(1); });

// `Object.preventExtensions` method
// https://tc39.es/ecma262/#sec-object.preventextensions
$$3l({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES$1, sham: !FREEZING$2 }, {
  preventExtensions: function preventExtensions(it) {
    return nativePreventExtensions && isObject$j(it) ? nativePreventExtensions(onFreeze$1(it)) : it;
  }
});

var $$3k = _export;
var isObject$i = isObject$B;
var onFreeze = internalMetadata.exports.onFreeze;
var FREEZING$1 = freezing;
var fails$y = fails$Y;

var nativeSeal = Object.seal;
var FAILS_ON_PRIMITIVES = fails$y(function () { nativeSeal(1); });

// `Object.seal` method
// https://tc39.es/ecma262/#sec-object.seal
$$3k({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES, sham: !FREEZING$1 }, {
  seal: function seal(it) {
    return nativeSeal && isObject$i(it) ? nativeSeal(onFreeze(it)) : it;
  }
});

var $$3j = _export;
var setPrototypeOf$4 = objectSetPrototypeOf$1;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
$$3j({ target: 'Object', stat: true }, {
  setPrototypeOf: setPrototypeOf$4
});

var $$3i = _export;
var $values = objectToArray.values;

// `Object.values` method
// https://tc39.es/ecma262/#sec-object.values
$$3i({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});

var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
var classof$8 = classof$b;

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
  return '[object ' + classof$8(this) + ']';
};

var TO_STRING_TAG_SUPPORT = toStringTagSupport;
var redefine$c = redefine$g.exports;
var toString = objectToString;

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT) {
  redefine$c(Object.prototype, 'toString', toString, { unsafe: true });
}

var global$v = global$L;
var fails$x = fails$Y;

// Forced replacement object prototype accessors methods
var objectPrototypeAccessorsForced = !fails$x(function () {
  var key = Math.random();
  // In FF throws only define methods
  // eslint-disable-next-line no-undef, no-useless-call
  __defineSetter__.call(null, key, function () { /* empty */ });
  delete global$v[key];
});

var $$3h = _export;
var DESCRIPTORS$i = descriptors;
var FORCED$n = objectPrototypeAccessorsForced;
var toObject$e = toObject$u;
var aFunction$L = aFunction$R;
var definePropertyModule$4 = objectDefineProperty;

// `Object.prototype.__defineGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineGetter__
if (DESCRIPTORS$i) {
  $$3h({ target: 'Object', proto: true, forced: FORCED$n }, {
    __defineGetter__: function __defineGetter__(P, getter) {
      definePropertyModule$4.f(toObject$e(this), P, { get: aFunction$L(getter), enumerable: true, configurable: true });
    }
  });
}

var $$3g = _export;
var DESCRIPTORS$h = descriptors;
var FORCED$m = objectPrototypeAccessorsForced;
var toObject$d = toObject$u;
var aFunction$K = aFunction$R;
var definePropertyModule$3 = objectDefineProperty;

// `Object.prototype.__defineSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__defineSetter__
if (DESCRIPTORS$h) {
  $$3g({ target: 'Object', proto: true, forced: FORCED$m }, {
    __defineSetter__: function __defineSetter__(P, setter) {
      definePropertyModule$3.f(toObject$d(this), P, { set: aFunction$K(setter), enumerable: true, configurable: true });
    }
  });
}

var $$3f = _export;
var DESCRIPTORS$g = descriptors;
var FORCED$l = objectPrototypeAccessorsForced;
var toObject$c = toObject$u;
var toPrimitive$6 = toPrimitive$b;
var getPrototypeOf$9 = objectGetPrototypeOf$1;
var getOwnPropertyDescriptor$6 = objectGetOwnPropertyDescriptor.f;

// `Object.prototype.__lookupGetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupGetter__
if (DESCRIPTORS$g) {
  $$3f({ target: 'Object', proto: true, forced: FORCED$l }, {
    __lookupGetter__: function __lookupGetter__(P) {
      var O = toObject$c(this);
      var key = toPrimitive$6(P, true);
      var desc;
      do {
        if (desc = getOwnPropertyDescriptor$6(O, key)) return desc.get;
      } while (O = getPrototypeOf$9(O));
    }
  });
}

var $$3e = _export;
var DESCRIPTORS$f = descriptors;
var FORCED$k = objectPrototypeAccessorsForced;
var toObject$b = toObject$u;
var toPrimitive$5 = toPrimitive$b;
var getPrototypeOf$8 = objectGetPrototypeOf$1;
var getOwnPropertyDescriptor$5 = objectGetOwnPropertyDescriptor.f;

// `Object.prototype.__lookupSetter__` method
// https://tc39.es/ecma262/#sec-object.prototype.__lookupSetter__
if (DESCRIPTORS$f) {
  $$3e({ target: 'Object', proto: true, forced: FORCED$k }, {
    __lookupSetter__: function __lookupSetter__(P) {
      var O = toObject$b(this);
      var key = toPrimitive$5(P, true);
      var desc;
      do {
        if (desc = getOwnPropertyDescriptor$5(O, key)) return desc.set;
      } while (O = getPrototypeOf$8(O));
    }
  });
}

var $$3d = _export;
var toAbsoluteIndex$2 = toAbsoluteIndex$8;

var fromCharCode = String.fromCharCode;
var nativeFromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
var INCORRECT_LENGTH = !!nativeFromCodePoint && nativeFromCodePoint.length != 1;

// `String.fromCodePoint` method
// https://tc39.es/ecma262/#sec-string.fromcodepoint
$$3d({ target: 'String', stat: true, forced: INCORRECT_LENGTH }, {
  fromCodePoint: function fromCodePoint(x) { // eslint-disable-line no-unused-vars
    var elements = [];
    var length = arguments.length;
    var i = 0;
    var code;
    while (length > i) {
      code = +arguments[i++];
      if (toAbsoluteIndex$2(code, 0x10FFFF) !== code) throw RangeError(code + ' is not a valid code point');
      elements.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00)
      );
    } return elements.join('');
  }
});

var $$3c = _export;
var toIndexedObject = toIndexedObject$d;
var toLength$j = toLength$y;

// `String.raw` method
// https://tc39.es/ecma262/#sec-string.raw
$$3c({ target: 'String', stat: true }, {
  raw: function raw(template) {
    var rawTemplate = toIndexedObject(template.raw);
    var literalSegments = toLength$j(rawTemplate.length);
    var argumentsLength = arguments.length;
    var elements = [];
    var i = 0;
    while (literalSegments > i) {
      elements.push(String(rawTemplate[i++]));
      if (i < argumentsLength) elements.push(String(arguments[i]));
    } return elements.join('');
  }
});

var toInteger$9 = toInteger$f;
var requireObjectCoercible$e = requireObjectCoercible$h;

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod$3 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible$e($this));
    var position = toInteger$9(pos);
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
  codeAt: createMethod$3(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$3(true)
};

var $$3b = _export;
var codeAt$2 = stringMultibyte.codeAt;

// `String.prototype.codePointAt` method
// https://tc39.es/ecma262/#sec-string.prototype.codepointat
$$3b({ target: 'String', proto: true }, {
  codePointAt: function codePointAt(pos) {
    return codeAt$2(this, pos);
  }
});

var isObject$h = isObject$B;
var classof$7 = classofRaw$1;
var wellKnownSymbol$k = wellKnownSymbol$C;

var MATCH$2 = wellKnownSymbol$k('match');

// `IsRegExp` abstract operation
// https://tc39.es/ecma262/#sec-isregexp
var isRegexp = function (it) {
  var isRegExp;
  return isObject$h(it) && ((isRegExp = it[MATCH$2]) !== undefined ? !!isRegExp : classof$7(it) == 'RegExp');
};

var isRegExp$4 = isRegexp;

var notARegexp = function (it) {
  if (isRegExp$4(it)) {
    throw TypeError("The method doesn't accept regular expressions");
  } return it;
};

var wellKnownSymbol$j = wellKnownSymbol$C;

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

var $$3a = _export;
var getOwnPropertyDescriptor$4 = objectGetOwnPropertyDescriptor.f;
var toLength$i = toLength$y;
var notARegExp$2 = notARegexp;
var requireObjectCoercible$d = requireObjectCoercible$h;
var correctIsRegExpLogic$2 = correctIsRegexpLogic;

var nativeEndsWith = ''.endsWith;
var min$4 = Math.min;

var CORRECT_IS_REGEXP_LOGIC$1 = correctIsRegExpLogic$2('endsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG$1 = !CORRECT_IS_REGEXP_LOGIC$1 && !!function () {
  var descriptor = getOwnPropertyDescriptor$4(String.prototype, 'endsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.endsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.endswith
$$3a({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG$1 && !CORRECT_IS_REGEXP_LOGIC$1 }, {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = String(requireObjectCoercible$d(this));
    notARegExp$2(searchString);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength$i(that.length);
    var end = endPosition === undefined ? len : min$4(toLength$i(endPosition), len);
    var search = String(searchString);
    return nativeEndsWith
      ? nativeEndsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});

var $$39 = _export;
var notARegExp$1 = notARegexp;
var requireObjectCoercible$c = requireObjectCoercible$h;
var correctIsRegExpLogic$1 = correctIsRegexpLogic;

// `String.prototype.includes` method
// https://tc39.es/ecma262/#sec-string.prototype.includes
$$39({ target: 'String', proto: true, forced: !correctIsRegExpLogic$1('includes') }, {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~String(requireObjectCoercible$c(this))
      .indexOf(notARegExp$1(searchString), arguments.length > 1 ? arguments[1] : undefined);
  }
});

var anObject$1p = anObject$1z;

// `RegExp.prototype.flags` getter implementation
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
var regexpFlags$1 = function () {
  var that = anObject$1p(this);
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

var fails$w = fails$Y;

// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
// so we use an intermediate function.
function RE(s, f) {
  return RegExp(s, f);
}

regexpStickyHelpers.UNSUPPORTED_Y = fails$w(function () {
  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
  var re = RE('a', 'y');
  re.lastIndex = 2;
  return re.exec('abcd') != null;
});

regexpStickyHelpers.BROKEN_CARET = fails$w(function () {
  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
  var re = RE('^r', 'gy');
  re.lastIndex = 2;
  return re.exec('str') != null;
});

var regexpFlags = regexpFlags$1;
var stickyHelpers$1 = regexpStickyHelpers;

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

var UNSUPPORTED_Y$3 = stickyHelpers$1.UNSUPPORTED_Y || stickyHelpers$1.BROKEN_CARET;

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$3;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;
    var sticky = UNSUPPORTED_Y$3 && re.sticky;
    var flags = regexpFlags.call(re);
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

var regexpExec$3 = patchedExec;

var $$38 = _export;
var exec = regexpExec$3;

// `RegExp.prototype.exec` method
// https://tc39.es/ecma262/#sec-regexp.prototype.exec
$$38({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
  exec: exec
});

// TODO: Remove from `core-js@4` since it's moved to entry points

var redefine$b = redefine$g.exports;
var fails$v = fails$Y;
var wellKnownSymbol$i = wellKnownSymbol$C;
var regexpExec$2 = regexpExec$3;
var createNonEnumerableProperty$d = createNonEnumerableProperty$m;

var SPECIES$2 = wellKnownSymbol$i('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails$v(function () {
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

var REPLACE$1 = wellKnownSymbol$i('replace');
// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
  if (/./[REPLACE$1]) {
    return /./[REPLACE$1]('a', '$0') === '';
  }
  return false;
})();

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails$v(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol$i(KEY);

  var DELEGATES_TO_SYMBOL = !fails$v(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails$v(function () {
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
      re.constructor[SPECIES$2] = function () { return re; };
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
      if (regexp.exec === regexpExec$2) {
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

    redefine$b(String.prototype, KEY, stringMethod);
    redefine$b(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
  }

  if (sham) createNonEnumerableProperty$d(RegExp.prototype[SYMBOL], 'sham', true);
};

var charAt$3 = stringMultibyte.charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.es/ecma262/#sec-advancestringindex
var advanceStringIndex$4 = function (S, index, unicode) {
  return index + (unicode ? charAt$3(S, index).length : 1);
};

var classof$6 = classofRaw$1;
var regexpExec$1 = regexpExec$3;

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

  if (classof$6(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec$1.call(R, S);
};

var fixRegExpWellKnownSymbolLogic$3 = fixRegexpWellKnownSymbolLogic;
var anObject$1o = anObject$1z;
var toLength$h = toLength$y;
var requireObjectCoercible$b = requireObjectCoercible$h;
var advanceStringIndex$3 = advanceStringIndex$4;
var regExpExec$3 = regexpExecAbstract;

// @@match logic
fixRegExpWellKnownSymbolLogic$3('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.es/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible$b(this);
      var matcher = regexp == undefined ? undefined : regexp[MATCH];
      return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative(nativeMatch, regexp, this);
      if (res.done) return res.value;

      var rx = anObject$1o(regexp);
      var S = String(this);

      if (!rx.global) return regExpExec$3(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec$3(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex$3(S, toLength$h(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});

var anObject$1n = anObject$1z;
var aFunction$J = aFunction$R;
var wellKnownSymbol$h = wellKnownSymbol$C;

var SPECIES$1 = wellKnownSymbol$h('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor$j = function (O, defaultConstructor) {
  var C = anObject$1n(O).constructor;
  var S;
  return C === undefined || (S = anObject$1n(C)[SPECIES$1]) == undefined ? defaultConstructor : aFunction$J(S);
};

var $$37 = _export;
var createIteratorConstructor$5 = createIteratorConstructor$7;
var requireObjectCoercible$a = requireObjectCoercible$h;
var toLength$g = toLength$y;
var aFunction$I = aFunction$R;
var anObject$1m = anObject$1z;
var classof$5 = classofRaw$1;
var isRegExp$3 = isRegexp;
var getRegExpFlags$1 = regexpFlags$1;
var createNonEnumerableProperty$c = createNonEnumerableProperty$m;
var fails$u = fails$Y;
var wellKnownSymbol$g = wellKnownSymbol$C;
var speciesConstructor$i = speciesConstructor$j;
var advanceStringIndex$2 = advanceStringIndex$4;
var InternalStateModule$f = internalState;
var IS_PURE$D = isPure;

var MATCH_ALL = wellKnownSymbol$g('matchAll');
var REGEXP_STRING = 'RegExp String';
var REGEXP_STRING_ITERATOR = REGEXP_STRING + ' Iterator';
var setInternalState$g = InternalStateModule$f.set;
var getInternalState$c = InternalStateModule$f.getterFor(REGEXP_STRING_ITERATOR);
var RegExpPrototype$4 = RegExp.prototype;
var regExpBuiltinExec = RegExpPrototype$4.exec;
var nativeMatchAll = ''.matchAll;

var WORKS_WITH_NON_GLOBAL_REGEX = !!nativeMatchAll && !fails$u(function () {
  'a'.matchAll(/./);
});

var regExpExec$2 = function (R, S) {
  var exec = R.exec;
  var result;
  if (typeof exec == 'function') {
    result = exec.call(R, S);
    if (typeof result != 'object') throw TypeError('Incorrect exec result');
    return result;
  } return regExpBuiltinExec.call(R, S);
};

// eslint-disable-next-line max-len
var $RegExpStringIterator = createIteratorConstructor$5(function RegExpStringIterator(regexp, string, global, fullUnicode) {
  setInternalState$g(this, {
    type: REGEXP_STRING_ITERATOR,
    regexp: regexp,
    string: string,
    global: global,
    unicode: fullUnicode,
    done: false
  });
}, REGEXP_STRING, function next() {
  var state = getInternalState$c(this);
  if (state.done) return { value: undefined, done: true };
  var R = state.regexp;
  var S = state.string;
  var match = regExpExec$2(R, S);
  if (match === null) return { value: undefined, done: state.done = true };
  if (state.global) {
    if (String(match[0]) == '') R.lastIndex = advanceStringIndex$2(S, toLength$g(R.lastIndex), state.unicode);
    return { value: match, done: false };
  }
  state.done = true;
  return { value: match, done: false };
});

var $matchAll = function (string) {
  var R = anObject$1m(this);
  var S = String(string);
  var C, flagsValue, flags, matcher, global, fullUnicode;
  C = speciesConstructor$i(R, RegExp);
  flagsValue = R.flags;
  if (flagsValue === undefined && R instanceof RegExp && !('flags' in RegExpPrototype$4)) {
    flagsValue = getRegExpFlags$1.call(R);
  }
  flags = flagsValue === undefined ? '' : String(flagsValue);
  matcher = new C(C === RegExp ? R.source : R, flags);
  global = !!~flags.indexOf('g');
  fullUnicode = !!~flags.indexOf('u');
  matcher.lastIndex = toLength$g(R.lastIndex);
  return new $RegExpStringIterator(matcher, S, global, fullUnicode);
};

// `String.prototype.matchAll` method
// https://tc39.es/ecma262/#sec-string.prototype.matchall
$$37({ target: 'String', proto: true, forced: WORKS_WITH_NON_GLOBAL_REGEX }, {
  matchAll: function matchAll(regexp) {
    var O = requireObjectCoercible$a(this);
    var flags, S, matcher, rx;
    if (regexp != null) {
      if (isRegExp$3(regexp)) {
        flags = String(requireObjectCoercible$a('flags' in RegExpPrototype$4
          ? regexp.flags
          : getRegExpFlags$1.call(regexp)
        ));
        if (!~flags.indexOf('g')) throw TypeError('`.matchAll` does not allow non-global regexes');
      }
      if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll.apply(O, arguments);
      matcher = regexp[MATCH_ALL];
      if (matcher === undefined && IS_PURE$D && classof$5(regexp) == 'RegExp') matcher = $matchAll;
      if (matcher != null) return aFunction$I(matcher).call(regexp, O);
    } else if (WORKS_WITH_NON_GLOBAL_REGEX) return nativeMatchAll.apply(O, arguments);
    S = String(O);
    rx = new RegExp(regexp, 'g');
    return rx[MATCH_ALL](S);
  }
});

MATCH_ALL in RegExpPrototype$4 || createNonEnumerableProperty$c(RegExpPrototype$4, MATCH_ALL, $matchAll);

var toInteger$8 = toInteger$f;
var requireObjectCoercible$9 = requireObjectCoercible$h;

// `String.prototype.repeat` method implementation
// https://tc39.es/ecma262/#sec-string.prototype.repeat
var stringRepeat = ''.repeat || function repeat(count) {
  var str = String(requireObjectCoercible$9(this));
  var result = '';
  var n = toInteger$8(count);
  if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
  return result;
};

// https://github.com/tc39/proposal-string-pad-start-end
var toLength$f = toLength$y;
var repeat$2 = stringRepeat;
var requireObjectCoercible$8 = requireObjectCoercible$h;

var ceil$1 = Math.ceil;

// `String.prototype.{ padStart, padEnd }` methods implementation
var createMethod$2 = function (IS_END) {
  return function ($this, maxLength, fillString) {
    var S = String(requireObjectCoercible$8($this));
    var stringLength = S.length;
    var fillStr = fillString === undefined ? ' ' : String(fillString);
    var intMaxLength = toLength$f(maxLength);
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
  start: createMethod$2(false),
  // `String.prototype.padEnd` method
  // https://tc39.es/ecma262/#sec-string.prototype.padend
  end: createMethod$2(true)
};

// https://github.com/zloirock/core-js/issues/280
var userAgent$3 = engineUserAgent;

// eslint-disable-next-line unicorn/no-unsafe-regex
var stringPadWebkitBug = /Version\/10\.\d+(\.\d+)?( Mobile\/\w+)? Safari\//.test(userAgent$3);

var $$36 = _export;
var $padEnd = stringPad.end;
var WEBKIT_BUG$1 = stringPadWebkitBug;

// `String.prototype.padEnd` method
// https://tc39.es/ecma262/#sec-string.prototype.padend
$$36({ target: 'String', proto: true, forced: WEBKIT_BUG$1 }, {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return $padEnd(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$35 = _export;
var $padStart = stringPad.start;
var WEBKIT_BUG = stringPadWebkitBug;

// `String.prototype.padStart` method
// https://tc39.es/ecma262/#sec-string.prototype.padstart
$$35({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$34 = _export;
var repeat$1 = stringRepeat;

// `String.prototype.repeat` method
// https://tc39.es/ecma262/#sec-string.prototype.repeat
$$34({ target: 'String', proto: true }, {
  repeat: repeat$1
});

var toObject$a = toObject$u;

var floor$8 = Math.floor;
var replace$1 = ''.replace;
var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

// https://tc39.es/ecma262/#sec-getsubstitution
var getSubstitution$2 = function (matched, str, position, captures, namedCaptures, replacement) {
  var tailPos = position + matched.length;
  var m = captures.length;
  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
  if (namedCaptures !== undefined) {
    namedCaptures = toObject$a(namedCaptures);
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
          var f = floor$8(n / 10);
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
var anObject$1l = anObject$1z;
var toLength$e = toLength$y;
var toInteger$7 = toInteger$f;
var requireObjectCoercible$7 = requireObjectCoercible$h;
var advanceStringIndex$1 = advanceStringIndex$4;
var getSubstitution$1 = getSubstitution$2;
var regExpExec$1 = regexpExecAbstract;

var max$2 = Math.max;
var min$3 = Math.min;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
fixRegExpWellKnownSymbolLogic$2('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

  return [
    // `String.prototype.replace` method
    // https://tc39.es/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = requireObjectCoercible$7(this);
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

      var rx = anObject$1l(regexp);
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
        var result = regExpExec$1(rx, S);
        if (result === null) break;

        results.push(result);
        if (!global) break;

        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = advanceStringIndex$1(S, toLength$e(rx.lastIndex), fullUnicode);
      }

      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];

        var matched = String(result[0]);
        var position = max$2(min$3(toInteger$7(result.index), S.length), 0);
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

var fixRegExpWellKnownSymbolLogic$1 = fixRegexpWellKnownSymbolLogic;
var anObject$1k = anObject$1z;
var requireObjectCoercible$6 = requireObjectCoercible$h;
var sameValue = sameValue$1;
var regExpExec = regexpExecAbstract;

// @@search logic
fixRegExpWellKnownSymbolLogic$1('search', 1, function (SEARCH, nativeSearch, maybeCallNative) {
  return [
    // `String.prototype.search` method
    // https://tc39.es/ecma262/#sec-string.prototype.search
    function search(regexp) {
      var O = requireObjectCoercible$6(this);
      var searcher = regexp == undefined ? undefined : regexp[SEARCH];
      return searcher !== undefined ? searcher.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
    },
    // `RegExp.prototype[@@search]` method
    // https://tc39.es/ecma262/#sec-regexp.prototype-@@search
    function (regexp) {
      var res = maybeCallNative(nativeSearch, regexp, this);
      if (res.done) return res.value;

      var rx = anObject$1k(regexp);
      var S = String(this);

      var previousLastIndex = rx.lastIndex;
      if (!sameValue(previousLastIndex, 0)) rx.lastIndex = 0;
      var result = regExpExec(rx, S);
      if (!sameValue(rx.lastIndex, previousLastIndex)) rx.lastIndex = previousLastIndex;
      return result === null ? -1 : result.index;
    }
  ];
});

var fixRegExpWellKnownSymbolLogic = fixRegexpWellKnownSymbolLogic;
var isRegExp$2 = isRegexp;
var anObject$1j = anObject$1z;
var requireObjectCoercible$5 = requireObjectCoercible$h;
var speciesConstructor$h = speciesConstructor$j;
var advanceStringIndex = advanceStringIndex$4;
var toLength$d = toLength$y;
var callRegExpExec = regexpExecAbstract;
var regexpExec = regexpExec$3;
var fails$t = fails$Y;

var arrayPush = [].push;
var min$2 = Math.min;
var MAX_UINT32 = 0xFFFFFFFF;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails$t(function () { return !RegExp(MAX_UINT32, 'y'); });

// @@split logic
fixRegExpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
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
      var string = String(requireObjectCoercible$5(this));
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
      var O = requireObjectCoercible$5(this);
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

      var rx = anObject$1j(regexp);
      var S = String(this);
      var C = speciesConstructor$h(rx, RegExp);

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
          (e = min$2(toLength$d(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
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
}, !SUPPORTS_Y);

var $$33 = _export;
var getOwnPropertyDescriptor$3 = objectGetOwnPropertyDescriptor.f;
var toLength$c = toLength$y;
var notARegExp = notARegexp;
var requireObjectCoercible$4 = requireObjectCoercible$h;
var correctIsRegExpLogic = correctIsRegexpLogic;

var nativeStartsWith = ''.startsWith;
var min$1 = Math.min;

var CORRECT_IS_REGEXP_LOGIC = correctIsRegExpLogic('startsWith');
// https://github.com/zloirock/core-js/pull/702
var MDN_POLYFILL_BUG = !CORRECT_IS_REGEXP_LOGIC && !!function () {
  var descriptor = getOwnPropertyDescriptor$3(String.prototype, 'startsWith');
  return descriptor && !descriptor.writable;
}();

// `String.prototype.startsWith` method
// https://tc39.es/ecma262/#sec-string.prototype.startswith
$$33({ target: 'String', proto: true, forced: !MDN_POLYFILL_BUG && !CORRECT_IS_REGEXP_LOGIC }, {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = String(requireObjectCoercible$4(this));
    notARegExp(searchString);
    var index = toLength$c(min$1(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return nativeStartsWith
      ? nativeStartsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});

// a string of all valid unicode whitespaces
// eslint-disable-next-line max-len
var whitespaces$4 = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var requireObjectCoercible$3 = requireObjectCoercible$h;
var whitespaces$3 = whitespaces$4;

var whitespace = '[' + whitespaces$3 + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$1 = function (TYPE) {
  return function ($this) {
    var string = String(requireObjectCoercible$3($this));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod$1(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod$1(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod$1(3)
};

var fails$s = fails$Y;
var whitespaces$2 = whitespaces$4;

var non = '\u200B\u0085\u180E';

// check that a method works with the correct list
// of whitespaces and has a correct name
var stringTrimForced = function (METHOD_NAME) {
  return fails$s(function () {
    return !!whitespaces$2[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces$2[METHOD_NAME].name !== METHOD_NAME;
  });
};

var $$32 = _export;
var $trim = stringTrim.trim;
var forcedStringTrimMethod$2 = stringTrimForced;

// `String.prototype.trim` method
// https://tc39.es/ecma262/#sec-string.prototype.trim
$$32({ target: 'String', proto: true, forced: forcedStringTrimMethod$2('trim') }, {
  trim: function trim() {
    return $trim(this);
  }
});

var $$31 = _export;
var $trimStart = stringTrim.start;
var forcedStringTrimMethod$1 = stringTrimForced;

var FORCED$j = forcedStringTrimMethod$1('trimStart');

var trimStart = FORCED$j ? function trimStart() {
  return $trimStart(this);
} : ''.trimStart;

// `String.prototype.{ trimStart, trimLeft }` methods
// https://tc39.es/ecma262/#sec-string.prototype.trimstart
// https://tc39.es/ecma262/#String.prototype.trimleft
$$31({ target: 'String', proto: true, forced: FORCED$j }, {
  trimStart: trimStart,
  trimLeft: trimStart
});

var $$30 = _export;
var $trimEnd = stringTrim.end;
var forcedStringTrimMethod = stringTrimForced;

var FORCED$i = forcedStringTrimMethod('trimEnd');

var trimEnd = FORCED$i ? function trimEnd() {
  return $trimEnd(this);
} : ''.trimEnd;

// `String.prototype.{ trimEnd, trimRight }` methods
// https://tc39.es/ecma262/#sec-string.prototype.trimend
// https://tc39.es/ecma262/#String.prototype.trimright
$$30({ target: 'String', proto: true, forced: FORCED$i }, {
  trimEnd: trimEnd,
  trimRight: trimEnd
});

var charAt$2 = stringMultibyte.charAt;
var InternalStateModule$e = internalState;
var defineIterator$1 = defineIterator$3;

var STRING_ITERATOR$1 = 'String Iterator';
var setInternalState$f = InternalStateModule$e.set;
var getInternalState$b = InternalStateModule$e.getterFor(STRING_ITERATOR$1);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator$1(String, 'String', function (iterated) {
  setInternalState$f(this, {
    type: STRING_ITERATOR$1,
    string: String(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState$b(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt$2(string, index);
  state.index += point.length;
  return { value: point, done: false };
});

var requireObjectCoercible$2 = requireObjectCoercible$h;

var quot = /"/g;

// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
// https://tc39.es/ecma262/#sec-createhtml
var createHtml = function (string, tag, attribute, value) {
  var S = String(requireObjectCoercible$2(string));
  var p1 = '<' + tag;
  if (attribute !== '') p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};

var fails$r = fails$Y;

// check the existence of a method, lowercase
// of a tag and escaping quotes in arguments
var stringHtmlForced = function (METHOD_NAME) {
  return fails$r(function () {
    var test = ''[METHOD_NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  });
};

var $$2$ = _export;
var createHTML$c = createHtml;
var forcedStringHTMLMethod$c = stringHtmlForced;

// `String.prototype.anchor` method
// https://tc39.es/ecma262/#sec-string.prototype.anchor
$$2$({ target: 'String', proto: true, forced: forcedStringHTMLMethod$c('anchor') }, {
  anchor: function anchor(name) {
    return createHTML$c(this, 'a', 'name', name);
  }
});

var $$2_ = _export;
var createHTML$b = createHtml;
var forcedStringHTMLMethod$b = stringHtmlForced;

// `String.prototype.big` method
// https://tc39.es/ecma262/#sec-string.prototype.big
$$2_({ target: 'String', proto: true, forced: forcedStringHTMLMethod$b('big') }, {
  big: function big() {
    return createHTML$b(this, 'big', '', '');
  }
});

var $$2Z = _export;
var createHTML$a = createHtml;
var forcedStringHTMLMethod$a = stringHtmlForced;

// `String.prototype.blink` method
// https://tc39.es/ecma262/#sec-string.prototype.blink
$$2Z({ target: 'String', proto: true, forced: forcedStringHTMLMethod$a('blink') }, {
  blink: function blink() {
    return createHTML$a(this, 'blink', '', '');
  }
});

var $$2Y = _export;
var createHTML$9 = createHtml;
var forcedStringHTMLMethod$9 = stringHtmlForced;

// `String.prototype.bold` method
// https://tc39.es/ecma262/#sec-string.prototype.bold
$$2Y({ target: 'String', proto: true, forced: forcedStringHTMLMethod$9('bold') }, {
  bold: function bold() {
    return createHTML$9(this, 'b', '', '');
  }
});

var $$2X = _export;
var createHTML$8 = createHtml;
var forcedStringHTMLMethod$8 = stringHtmlForced;

// `String.prototype.fixed` method
// https://tc39.es/ecma262/#sec-string.prototype.fixed
$$2X({ target: 'String', proto: true, forced: forcedStringHTMLMethod$8('fixed') }, {
  fixed: function fixed() {
    return createHTML$8(this, 'tt', '', '');
  }
});

var $$2W = _export;
var createHTML$7 = createHtml;
var forcedStringHTMLMethod$7 = stringHtmlForced;

// `String.prototype.fontcolor` method
// https://tc39.es/ecma262/#sec-string.prototype.fontcolor
$$2W({ target: 'String', proto: true, forced: forcedStringHTMLMethod$7('fontcolor') }, {
  fontcolor: function fontcolor(color) {
    return createHTML$7(this, 'font', 'color', color);
  }
});

var $$2V = _export;
var createHTML$6 = createHtml;
var forcedStringHTMLMethod$6 = stringHtmlForced;

// `String.prototype.fontsize` method
// https://tc39.es/ecma262/#sec-string.prototype.fontsize
$$2V({ target: 'String', proto: true, forced: forcedStringHTMLMethod$6('fontsize') }, {
  fontsize: function fontsize(size) {
    return createHTML$6(this, 'font', 'size', size);
  }
});

var $$2U = _export;
var createHTML$5 = createHtml;
var forcedStringHTMLMethod$5 = stringHtmlForced;

// `String.prototype.italics` method
// https://tc39.es/ecma262/#sec-string.prototype.italics
$$2U({ target: 'String', proto: true, forced: forcedStringHTMLMethod$5('italics') }, {
  italics: function italics() {
    return createHTML$5(this, 'i', '', '');
  }
});

var $$2T = _export;
var createHTML$4 = createHtml;
var forcedStringHTMLMethod$4 = stringHtmlForced;

// `String.prototype.link` method
// https://tc39.es/ecma262/#sec-string.prototype.link
$$2T({ target: 'String', proto: true, forced: forcedStringHTMLMethod$4('link') }, {
  link: function link(url) {
    return createHTML$4(this, 'a', 'href', url);
  }
});

var $$2S = _export;
var createHTML$3 = createHtml;
var forcedStringHTMLMethod$3 = stringHtmlForced;

// `String.prototype.small` method
// https://tc39.es/ecma262/#sec-string.prototype.small
$$2S({ target: 'String', proto: true, forced: forcedStringHTMLMethod$3('small') }, {
  small: function small() {
    return createHTML$3(this, 'small', '', '');
  }
});

var $$2R = _export;
var createHTML$2 = createHtml;
var forcedStringHTMLMethod$2 = stringHtmlForced;

// `String.prototype.strike` method
// https://tc39.es/ecma262/#sec-string.prototype.strike
$$2R({ target: 'String', proto: true, forced: forcedStringHTMLMethod$2('strike') }, {
  strike: function strike() {
    return createHTML$2(this, 'strike', '', '');
  }
});

var $$2Q = _export;
var createHTML$1 = createHtml;
var forcedStringHTMLMethod$1 = stringHtmlForced;

// `String.prototype.sub` method
// https://tc39.es/ecma262/#sec-string.prototype.sub
$$2Q({ target: 'String', proto: true, forced: forcedStringHTMLMethod$1('sub') }, {
  sub: function sub() {
    return createHTML$1(this, 'sub', '', '');
  }
});

var $$2P = _export;
var createHTML = createHtml;
var forcedStringHTMLMethod = stringHtmlForced;

// `String.prototype.sup` method
// https://tc39.es/ecma262/#sec-string.prototype.sup
$$2P({ target: 'String', proto: true, forced: forcedStringHTMLMethod('sup') }, {
  sup: function sup() {
    return createHTML(this, 'sup', '', '');
  }
});

var $$2O = _export;
var requireObjectCoercible$1 = requireObjectCoercible$h;
var isRegExp$1 = isRegexp;
var getRegExpFlags = regexpFlags$1;
var getSubstitution = getSubstitution$2;
var wellKnownSymbol$f = wellKnownSymbol$C;

var REPLACE = wellKnownSymbol$f('replace');
var RegExpPrototype$3 = RegExp.prototype;
var max$1 = Math.max;

var stringIndexOf = function (string, searchValue, fromIndex) {
  if (fromIndex > string.length) return -1;
  if (searchValue === '') return fromIndex;
  return string.indexOf(searchValue, fromIndex);
};

// `String.prototype.replaceAll` method
// https://tc39.es/ecma262/#sec-string.prototype.replaceall
$$2O({ target: 'String', proto: true }, {
  replaceAll: function replaceAll(searchValue, replaceValue) {
    var O = requireObjectCoercible$1(this);
    var IS_REG_EXP, flags, replacer, string, searchString, functionalReplace, searchLength, advanceBy, replacement;
    var position = 0;
    var endOfLastMatch = 0;
    var result = '';
    if (searchValue != null) {
      IS_REG_EXP = isRegExp$1(searchValue);
      if (IS_REG_EXP) {
        flags = String(requireObjectCoercible$1('flags' in RegExpPrototype$3
          ? searchValue.flags
          : getRegExpFlags.call(searchValue)
        ));
        if (!~flags.indexOf('g')) throw TypeError('`.replaceAll` does not allow non-global regexes');
      }
      replacer = searchValue[REPLACE];
      if (replacer !== undefined) {
        return replacer.call(searchValue, O, replaceValue);
      }
    }
    string = String(O);
    searchString = String(searchValue);
    functionalReplace = typeof replaceValue === 'function';
    if (!functionalReplace) replaceValue = String(replaceValue);
    searchLength = searchString.length;
    advanceBy = max$1(1, searchLength);
    position = stringIndexOf(string, searchString, 0);
    while (position !== -1) {
      if (functionalReplace) {
        replacement = String(replaceValue(searchString, position, string));
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

var isObject$g = isObject$B;
var setPrototypeOf$3 = objectSetPrototypeOf$1;

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired$4 = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf$3 &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    typeof (NewTarget = dummy.constructor) == 'function' &&
    NewTarget !== Wrapper &&
    isObject$g(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf$3($this, NewTargetPrototype);
  return $this;
};

var DESCRIPTORS$e = descriptors;
var global$u = global$L;
var isForced$3 = isForced_1;
var inheritIfRequired$3 = inheritIfRequired$4;
var defineProperty$8 = objectDefineProperty.f;
var getOwnPropertyNames$3 = objectGetOwnPropertyNames.f;
var isRegExp = isRegexp;
var getFlags = regexpFlags$1;
var stickyHelpers = regexpStickyHelpers;
var redefine$a = redefine$g.exports;
var fails$q = fails$Y;
var setInternalState$e = internalState.set;
var setSpecies$5 = setSpecies$7;
var wellKnownSymbol$e = wellKnownSymbol$C;

var MATCH = wellKnownSymbol$e('match');
var NativeRegExp = global$u.RegExp;
var RegExpPrototype$2 = NativeRegExp.prototype;
var re1 = /a/g;
var re2 = /a/g;

// "new" should create a new object, old webkit bug
var CORRECT_NEW = new NativeRegExp(re1) !== re1;

var UNSUPPORTED_Y$2 = stickyHelpers.UNSUPPORTED_Y;

var FORCED$h = DESCRIPTORS$e && isForced$3('RegExp', (!CORRECT_NEW || UNSUPPORTED_Y$2 || fails$q(function () {
  re2[MATCH] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
})));

// `RegExp` constructor
// https://tc39.es/ecma262/#sec-regexp-constructor
if (FORCED$h) {
  var RegExpWrapper = function RegExp(pattern, flags) {
    var thisIsRegExp = this instanceof RegExpWrapper;
    var patternIsRegExp = isRegExp(pattern);
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

    if (UNSUPPORTED_Y$2) {
      sticky = !!flags && flags.indexOf('y') > -1;
      if (sticky) flags = flags.replace(/y/g, '');
    }

    var result = inheritIfRequired$3(
      CORRECT_NEW ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags),
      thisIsRegExp ? this : RegExpPrototype$2,
      RegExpWrapper
    );

    if (UNSUPPORTED_Y$2 && sticky) setInternalState$e(result, { sticky: sticky });

    return result;
  };
  var proxy = function (key) {
    key in RegExpWrapper || defineProperty$8(RegExpWrapper, key, {
      configurable: true,
      get: function () { return NativeRegExp[key]; },
      set: function (it) { NativeRegExp[key] = it; }
    });
  };
  var keys$2 = getOwnPropertyNames$3(NativeRegExp);
  var index = 0;
  while (keys$2.length > index) proxy(keys$2[index++]);
  RegExpPrototype$2.constructor = RegExpWrapper;
  RegExpWrapper.prototype = RegExpPrototype$2;
  redefine$a(global$u, 'RegExp', RegExpWrapper);
}

// https://tc39.es/ecma262/#sec-get-regexp-@@species
setSpecies$5('RegExp');

var DESCRIPTORS$d = descriptors;
var objectDefinePropertyModule = objectDefineProperty;
var regExpFlags = regexpFlags$1;
var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y;

// `RegExp.prototype.flags` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
if (DESCRIPTORS$d && (/./g.flags != 'g' || UNSUPPORTED_Y$1)) {
  objectDefinePropertyModule.f(RegExp.prototype, 'flags', {
    configurable: true,
    get: regExpFlags
  });
}

var DESCRIPTORS$c = descriptors;
var UNSUPPORTED_Y = regexpStickyHelpers.UNSUPPORTED_Y;
var defineProperty$7 = objectDefineProperty.f;
var getInternalState$a = internalState.get;
var RegExpPrototype$1 = RegExp.prototype;

// `RegExp.prototype.sticky` getter
// https://tc39.es/ecma262/#sec-get-regexp.prototype.sticky
if (DESCRIPTORS$c && UNSUPPORTED_Y) {
  defineProperty$7(RegExp.prototype, 'sticky', {
    configurable: true,
    get: function () {
      if (this === RegExpPrototype$1) return undefined;
      // We can't use InternalStateModule.getterFor because
      // we don't add metadata for regexps created by a literal.
      if (this instanceof RegExp) {
        return !!getInternalState$a(this).sticky;
      }
      throw TypeError('Incompatible receiver, RegExp required');
    }
  });
}

// TODO: Remove from `core-js@4` since it's moved to entry points

var $$2N = _export;
var isObject$f = isObject$B;

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
$$2N({ target: 'RegExp', proto: true, forced: !DELEGATES_TO_EXEC }, {
  test: function (str) {
    if (typeof this.exec !== 'function') {
      return nativeTest.call(this, str);
    }
    var result = this.exec(str);
    if (result !== null && !isObject$f(result)) {
      throw new Error('RegExp exec method returned something other than an Object or null');
    }
    return !!result;
  }
});

var redefine$9 = redefine$g.exports;
var anObject$1i = anObject$1z;
var fails$p = fails$Y;
var flags = regexpFlags$1;

var TO_STRING$1 = 'toString';
var RegExpPrototype = RegExp.prototype;
var nativeToString = RegExpPrototype[TO_STRING$1];

var NOT_GENERIC = fails$p(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = nativeToString.name != TO_STRING$1;

// `RegExp.prototype.toString` method
// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine$9(RegExp.prototype, TO_STRING$1, function toString() {
    var R = anObject$1i(this);
    var p = String(R.source);
    var rf = R.flags;
    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? flags.call(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}

var global$t = global$L;
var trim$2 = stringTrim.trim;
var whitespaces$1 = whitespaces$4;

var $parseInt = global$t.parseInt;
var hex = /^[+-]?0[Xx]/;
var FORCED$g = $parseInt(whitespaces$1 + '08') !== 8 || $parseInt(whitespaces$1 + '0x16') !== 22;

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
var numberParseInt = FORCED$g ? function parseInt(string, radix) {
  var S = trim$2(String(string));
  return $parseInt(S, (radix >>> 0) || (hex.test(S) ? 16 : 10));
} : $parseInt;

var $$2M = _export;
var parseIntImplementation = numberParseInt;

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
$$2M({ global: true, forced: parseInt != parseIntImplementation }, {
  parseInt: parseIntImplementation
});

var global$s = global$L;
var trim$1 = stringTrim.trim;
var whitespaces = whitespaces$4;

var $parseFloat = global$s.parseFloat;
var FORCED$f = 1 / $parseFloat(whitespaces + '-0') !== -Infinity;

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
var numberParseFloat = FORCED$f ? function parseFloat(string) {
  var trimmedString = trim$1(String(string));
  var result = $parseFloat(trimmedString);
  return result === 0 && trimmedString.charAt(0) == '-' ? -0 : result;
} : $parseFloat;

var $$2L = _export;
var parseFloatImplementation = numberParseFloat;

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
$$2L({ global: true, forced: parseFloat != parseFloatImplementation }, {
  parseFloat: parseFloatImplementation
});

var DESCRIPTORS$b = descriptors;
var global$r = global$L;
var isForced$2 = isForced_1;
var redefine$8 = redefine$g.exports;
var has$9 = has$o;
var classof$4 = classofRaw$1;
var inheritIfRequired$2 = inheritIfRequired$4;
var toPrimitive$4 = toPrimitive$b;
var fails$o = fails$Y;
var create$8 = objectCreate;
var getOwnPropertyNames$2 = objectGetOwnPropertyNames.f;
var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
var defineProperty$6 = objectDefineProperty.f;
var trim = stringTrim.trim;

var NUMBER = 'Number';
var NativeNumber = global$r[NUMBER];
var NumberPrototype = NativeNumber.prototype;

// Opera ~12 has broken Object#toString
var BROKEN_CLASSOF = classof$4(create$8(NumberPrototype)) == NUMBER;

// `ToNumber` abstract operation
// https://tc39.es/ecma262/#sec-tonumber
var toNumber = function (argument) {
  var it = toPrimitive$4(argument, false);
  var first, third, radix, maxCode, digits, length, index, code;
  if (typeof it == 'string' && it.length > 2) {
    it = trim(it);
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
      && (BROKEN_CLASSOF ? fails$o(function () { NumberPrototype.valueOf.call(dummy); }) : classof$4(dummy) != NUMBER)
        ? inheritIfRequired$2(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
  };
  for (var keys$1 = DESCRIPTORS$b ? getOwnPropertyNames$2(NativeNumber) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger,' +
    // ESNext
    'fromString,range'
  ).split(','), j$1 = 0, key$1; keys$1.length > j$1; j$1++) {
    if (has$9(NativeNumber, key$1 = keys$1[j$1]) && !has$9(NumberWrapper, key$1)) {
      defineProperty$6(NumberWrapper, key$1, getOwnPropertyDescriptor$2(NativeNumber, key$1));
    }
  }
  NumberWrapper.prototype = NumberPrototype;
  NumberPrototype.constructor = NumberWrapper;
  redefine$8(global$r, NUMBER, NumberWrapper);
}

var $$2K = _export;

// `Number.EPSILON` constant
// https://tc39.es/ecma262/#sec-number.epsilon
$$2K({ target: 'Number', stat: true }, {
  EPSILON: Math.pow(2, -52)
});

var global$q = global$L;

var globalIsFinite = global$q.isFinite;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
var numberIsFinite$2 = Number.isFinite || function isFinite(it) {
  return typeof it == 'number' && globalIsFinite(it);
};

var $$2J = _export;
var numberIsFinite$1 = numberIsFinite$2;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
$$2J({ target: 'Number', stat: true }, { isFinite: numberIsFinite$1 });

var isObject$e = isObject$B;

var floor$7 = Math.floor;

// `Number.isInteger` method implementation
// https://tc39.es/ecma262/#sec-number.isinteger
var isInteger$2 = function isInteger(it) {
  return !isObject$e(it) && isFinite(it) && floor$7(it) === it;
};

var $$2I = _export;
var isInteger$1 = isInteger$2;

// `Number.isInteger` method
// https://tc39.es/ecma262/#sec-number.isinteger
$$2I({ target: 'Number', stat: true }, {
  isInteger: isInteger$1
});

var $$2H = _export;

// `Number.isNaN` method
// https://tc39.es/ecma262/#sec-number.isnan
$$2H({ target: 'Number', stat: true }, {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});

var $$2G = _export;
var isInteger = isInteger$2;

var abs$7 = Math.abs;

// `Number.isSafeInteger` method
// https://tc39.es/ecma262/#sec-number.issafeinteger
$$2G({ target: 'Number', stat: true }, {
  isSafeInteger: function isSafeInteger(number) {
    return isInteger(number) && abs$7(number) <= 0x1FFFFFFFFFFFFF;
  }
});

var $$2F = _export;

// `Number.MAX_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.max_safe_integer
$$2F({ target: 'Number', stat: true }, {
  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
});

var $$2E = _export;

// `Number.MIN_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.min_safe_integer
$$2E({ target: 'Number', stat: true }, {
  MIN_SAFE_INTEGER: -0x1FFFFFFFFFFFFF
});

var $$2D = _export;
var parseFloat$1 = numberParseFloat;

// `Number.parseFloat` method
// https://tc39.es/ecma262/#sec-number.parseFloat
$$2D({ target: 'Number', stat: true, forced: Number.parseFloat != parseFloat$1 }, {
  parseFloat: parseFloat$1
});

var $$2C = _export;
var parseInt$2 = numberParseInt;

// `Number.parseInt` method
// https://tc39.es/ecma262/#sec-number.parseint
$$2C({ target: 'Number', stat: true, forced: Number.parseInt != parseInt$2 }, {
  parseInt: parseInt$2
});

var classof$3 = classofRaw$1;

// `thisNumberValue` abstract operation
// https://tc39.es/ecma262/#sec-thisnumbervalue
var thisNumberValue$2 = function (value) {
  if (typeof value != 'number' && classof$3(value) != 'Number') {
    throw TypeError('Incorrect invocation');
  }
  return +value;
};

var $$2B = _export;
var toInteger$6 = toInteger$f;
var thisNumberValue$1 = thisNumberValue$2;
var repeat = stringRepeat;
var fails$n = fails$Y;

var nativeToFixed = 1.0.toFixed;
var floor$6 = Math.floor;

var pow$4 = function (x, n, acc) {
  return n === 0 ? acc : n % 2 === 1 ? pow$4(x, n - 1, acc * x) : pow$4(x * x, n / 2, acc);
};

var log$8 = function (x) {
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

var FORCED$e = nativeToFixed && (
  0.00008.toFixed(3) !== '0.000' ||
  0.9.toFixed(0) !== '1' ||
  1.255.toFixed(2) !== '1.25' ||
  1000000000000000128.0.toFixed(0) !== '1000000000000000128'
) || !fails$n(function () {
  // V8 ~ Android 4.3-
  nativeToFixed.call({});
});

// `Number.prototype.toFixed` method
// https://tc39.es/ecma262/#sec-number.prototype.tofixed
$$2B({ target: 'Number', proto: true, forced: FORCED$e }, {
  // eslint-disable-next-line max-statements
  toFixed: function toFixed(fractionDigits) {
    var number = thisNumberValue$1(this);
    var fractDigits = toInteger$6(fractionDigits);
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
        c2 = floor$6(c2 / 1e7);
      }
    };

    var divide = function (n) {
      var index = 6;
      var c = 0;
      while (--index >= 0) {
        c += data[index];
        data[index] = floor$6(c / n);
        c = (c % n) * 1e7;
      }
    };

    var dataToString = function () {
      var index = 6;
      var s = '';
      while (--index >= 0) {
        if (s !== '' || index === 0 || data[index] !== 0) {
          var t = String(data[index]);
          s = s === '' ? t : s + repeat.call('0', 7 - t.length) + t;
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
      e = log$8(number * pow$4(2, 69, 1)) - 69;
      z = e < 0 ? number * pow$4(2, -e, 1) : number / pow$4(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if (e > 0) {
        multiply(0, z);
        j = fractDigits;
        while (j >= 7) {
          multiply(1e7, 0);
          j -= 7;
        }
        multiply(pow$4(10, j, 1), 0);
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
        result = dataToString() + repeat.call('0', fractDigits);
      }
    }
    if (fractDigits > 0) {
      k = result.length;
      result = sign + (k <= fractDigits
        ? '0.' + repeat.call('0', fractDigits - k) + result
        : result.slice(0, k - fractDigits) + '.' + result.slice(k - fractDigits));
    } else {
      result = sign + result;
    } return result;
  }
});

var $$2A = _export;
var fails$m = fails$Y;
var thisNumberValue = thisNumberValue$2;

var nativeToPrecision = 1.0.toPrecision;

var FORCED$d = fails$m(function () {
  // IE7-
  return nativeToPrecision.call(1, undefined) !== '1';
}) || !fails$m(function () {
  // V8 ~ Android 4.3-
  nativeToPrecision.call({});
});

// `Number.prototype.toPrecision` method
// https://tc39.es/ecma262/#sec-number.prototype.toprecision
$$2A({ target: 'Number', proto: true, forced: FORCED$d }, {
  toPrecision: function toPrecision(precision) {
    return precision === undefined
      ? nativeToPrecision.call(thisNumberValue(this))
      : nativeToPrecision.call(thisNumberValue(this), precision);
  }
});

var log$7 = Math.log;

// `Math.log1p` method implementation
// https://tc39.es/ecma262/#sec-math.log1p
var mathLog1p = Math.log1p || function log1p(x) {
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log$7(1 + x);
};

var $$2z = _export;
var log1p$1 = mathLog1p;

var nativeAcosh = Math.acosh;
var log$6 = Math.log;
var sqrt$2 = Math.sqrt;
var LN2$2 = Math.LN2;

var FORCED$c = !nativeAcosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  || Math.floor(nativeAcosh(Number.MAX_VALUE)) != 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  || nativeAcosh(Infinity) != Infinity;

// `Math.acosh` method
// https://tc39.es/ecma262/#sec-math.acosh
$$2z({ target: 'Math', stat: true, forced: FORCED$c }, {
  acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? log$6(x) + LN2$2
      : log1p$1(x - 1 + sqrt$2(x - 1) * sqrt$2(x + 1));
  }
});

var $$2y = _export;

var nativeAsinh = Math.asinh;
var log$5 = Math.log;
var sqrt$1 = Math.sqrt;

function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log$5(x + sqrt$1(x * x + 1));
}

// `Math.asinh` method
// https://tc39.es/ecma262/#sec-math.asinh
// Tor Browser bug: Math.asinh(0) -> -0
$$2y({ target: 'Math', stat: true, forced: !(nativeAsinh && 1 / nativeAsinh(0) > 0) }, {
  asinh: asinh
});

var $$2x = _export;

var nativeAtanh = Math.atanh;
var log$4 = Math.log;

// `Math.atanh` method
// https://tc39.es/ecma262/#sec-math.atanh
// Tor Browser bug: Math.atanh(-0) -> 0
$$2x({ target: 'Math', stat: true, forced: !(nativeAtanh && 1 / nativeAtanh(-0) < 0) }, {
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

var $$2w = _export;
var sign$2 = mathSign;

var abs$6 = Math.abs;
var pow$3 = Math.pow;

// `Math.cbrt` method
// https://tc39.es/ecma262/#sec-math.cbrt
$$2w({ target: 'Math', stat: true }, {
  cbrt: function cbrt(x) {
    return sign$2(x = +x) * pow$3(abs$6(x), 1 / 3);
  }
});

var $$2v = _export;

var floor$5 = Math.floor;
var log$3 = Math.log;
var LOG2E = Math.LOG2E;

// `Math.clz32` method
// https://tc39.es/ecma262/#sec-math.clz32
$$2v({ target: 'Math', stat: true }, {
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - floor$5(log$3(x + 0.5) * LOG2E) : 32;
  }
});

var nativeExpm1 = Math.expm1;
var exp$2 = Math.exp;

// `Math.expm1` method implementation
// https://tc39.es/ecma262/#sec-math.expm1
var mathExpm1 = (!nativeExpm1
  // Old FF bug
  || nativeExpm1(10) > 22025.465794806719 || nativeExpm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || nativeExpm1(-2e-17) != -2e-17
) ? function expm1(x) {
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp$2(x) - 1;
} : nativeExpm1;

var $$2u = _export;
var expm1$3 = mathExpm1;

var nativeCosh = Math.cosh;
var abs$5 = Math.abs;
var E$1 = Math.E;

// `Math.cosh` method
// https://tc39.es/ecma262/#sec-math.cosh
$$2u({ target: 'Math', stat: true, forced: !nativeCosh || nativeCosh(710) === Infinity }, {
  cosh: function cosh(x) {
    var t = expm1$3(abs$5(x) - 1) + 1;
    return (t + 1 / (t * E$1 * E$1)) * (E$1 / 2);
  }
});

var $$2t = _export;
var expm1$2 = mathExpm1;

// `Math.expm1` method
// https://tc39.es/ecma262/#sec-math.expm1
$$2t({ target: 'Math', stat: true, forced: expm1$2 != Math.expm1 }, { expm1: expm1$2 });

var sign$1 = mathSign;

var abs$4 = Math.abs;
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
  var $abs = abs$4(x);
  var $sign = sign$1(x);
  var a, result;
  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
  a = (1 + EPSILON32 / EPSILON) * $abs;
  result = a - (a - $abs);
  // eslint-disable-next-line no-self-compare
  if (result > MAX32 || result != result) return $sign * Infinity;
  return $sign * result;
};

var $$2s = _export;
var fround$1 = mathFround;

// `Math.fround` method
// https://tc39.es/ecma262/#sec-math.fround
$$2s({ target: 'Math', stat: true }, { fround: fround$1 });

var $$2r = _export;

var $hypot = Math.hypot;
var abs$3 = Math.abs;
var sqrt = Math.sqrt;

// Chrome 77 bug
// https://bugs.chromium.org/p/v8/issues/detail?id=9546
var BUGGY = !!$hypot && $hypot(Infinity, NaN) !== Infinity;

// `Math.hypot` method
// https://tc39.es/ecma262/#sec-math.hypot
$$2r({ target: 'Math', stat: true, forced: BUGGY }, {
  hypot: function hypot(value1, value2) { // eslint-disable-line no-unused-vars
    var sum = 0;
    var i = 0;
    var aLen = arguments.length;
    var larg = 0;
    var arg, div;
    while (i < aLen) {
      arg = abs$3(arguments[i++]);
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

var $$2q = _export;
var fails$l = fails$Y;

var nativeImul = Math.imul;

var FORCED$b = fails$l(function () {
  return nativeImul(0xFFFFFFFF, 5) != -5 || nativeImul.length != 2;
});

// `Math.imul` method
// https://tc39.es/ecma262/#sec-math.imul
// some WebKit versions fails with big numbers, some has wrong arity
$$2q({ target: 'Math', stat: true, forced: FORCED$b }, {
  imul: function imul(x, y) {
    var UINT16 = 0xFFFF;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});

var $$2p = _export;

var log$2 = Math.log;
var LOG10E = Math.LOG10E;

// `Math.log10` method
// https://tc39.es/ecma262/#sec-math.log10
$$2p({ target: 'Math', stat: true }, {
  log10: function log10(x) {
    return log$2(x) * LOG10E;
  }
});

var $$2o = _export;
var log1p = mathLog1p;

// `Math.log1p` method
// https://tc39.es/ecma262/#sec-math.log1p
$$2o({ target: 'Math', stat: true }, { log1p: log1p });

var $$2n = _export;

var log$1 = Math.log;
var LN2$1 = Math.LN2;

// `Math.log2` method
// https://tc39.es/ecma262/#sec-math.log2
$$2n({ target: 'Math', stat: true }, {
  log2: function log2(x) {
    return log$1(x) / LN2$1;
  }
});

var $$2m = _export;
var sign = mathSign;

// `Math.sign` method
// https://tc39.es/ecma262/#sec-math.sign
$$2m({ target: 'Math', stat: true }, {
  sign: sign
});

var $$2l = _export;
var fails$k = fails$Y;
var expm1$1 = mathExpm1;

var abs$2 = Math.abs;
var exp$1 = Math.exp;
var E = Math.E;

var FORCED$a = fails$k(function () {
  return Math.sinh(-2e-17) != -2e-17;
});

// `Math.sinh` method
// https://tc39.es/ecma262/#sec-math.sinh
// V8 near Chromium 38 has a problem with very small numbers
$$2l({ target: 'Math', stat: true, forced: FORCED$a }, {
  sinh: function sinh(x) {
    return abs$2(x = +x) < 1 ? (expm1$1(x) - expm1$1(-x)) / 2 : (exp$1(x - 1) - exp$1(-x - 1)) * (E / 2);
  }
});

var $$2k = _export;
var expm1 = mathExpm1;

var exp = Math.exp;

// `Math.tanh` method
// https://tc39.es/ecma262/#sec-math.tanh
$$2k({ target: 'Math', stat: true }, {
  tanh: function tanh(x) {
    var a = expm1(x = +x);
    var b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});

var setToStringTag$7 = setToStringTag$b;

// Math[@@toStringTag] property
// https://tc39.es/ecma262/#sec-math-@@tostringtag
setToStringTag$7(Math, 'Math', true);

var $$2j = _export;

var ceil = Math.ceil;
var floor$4 = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
$$2j({ target: 'Math', stat: true }, {
  trunc: function trunc(it) {
    return (it > 0 ? floor$4 : ceil)(it);
  }
});

var $$2i = _export;

// `Date.now` method
// https://tc39.es/ecma262/#sec-date.now
$$2i({ target: 'Date', stat: true }, {
  now: function now() {
    return new Date().getTime();
  }
});

var $$2h = _export;
var fails$j = fails$Y;
var toObject$9 = toObject$u;
var toPrimitive$3 = toPrimitive$b;

var FORCED$9 = fails$j(function () {
  return new Date(NaN).toJSON() !== null
    || Date.prototype.toJSON.call({ toISOString: function () { return 1; } }) !== 1;
});

// `Date.prototype.toJSON` method
// https://tc39.es/ecma262/#sec-date.prototype.tojson
$$2h({ target: 'Date', proto: true, forced: FORCED$9 }, {
  // eslint-disable-next-line no-unused-vars
  toJSON: function toJSON(key) {
    var O = toObject$9(this);
    var pv = toPrimitive$3(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});

var fails$i = fails$Y;
var padStart = stringPad.start;

var abs$1 = Math.abs;
var DatePrototype$2 = Date.prototype;
var getTime$1 = DatePrototype$2.getTime;
var nativeDateToISOString = DatePrototype$2.toISOString;

// `Date.prototype.toISOString` method implementation
// https://tc39.es/ecma262/#sec-date.prototype.toisostring
// PhantomJS / old WebKit fails here:
var dateToIsoString = (fails$i(function () {
  return nativeDateToISOString.call(new Date(-5e13 - 1)) != '0385-07-25T07:06:39.999Z';
}) || !fails$i(function () {
  nativeDateToISOString.call(new Date(NaN));
})) ? function toISOString() {
  if (!isFinite(getTime$1.call(this))) throw RangeError('Invalid time value');
  var date = this;
  var year = date.getUTCFullYear();
  var milliseconds = date.getUTCMilliseconds();
  var sign = year < 0 ? '-' : year > 9999 ? '+' : '';
  return sign + padStart(abs$1(year), sign ? 6 : 4, 0) +
    '-' + padStart(date.getUTCMonth() + 1, 2, 0) +
    '-' + padStart(date.getUTCDate(), 2, 0) +
    'T' + padStart(date.getUTCHours(), 2, 0) +
    ':' + padStart(date.getUTCMinutes(), 2, 0) +
    ':' + padStart(date.getUTCSeconds(), 2, 0) +
    '.' + padStart(milliseconds, 3, 0) +
    'Z';
} : nativeDateToISOString;

var $$2g = _export;
var toISOString = dateToIsoString;

// `Date.prototype.toISOString` method
// https://tc39.es/ecma262/#sec-date.prototype.toisostring
// PhantomJS / old WebKit has a broken implementations
$$2g({ target: 'Date', proto: true, forced: Date.prototype.toISOString !== toISOString }, {
  toISOString: toISOString
});

var redefine$7 = redefine$g.exports;

var DatePrototype$1 = Date.prototype;
var INVALID_DATE = 'Invalid Date';
var TO_STRING = 'toString';
var nativeDateToString = DatePrototype$1[TO_STRING];
var getTime = DatePrototype$1.getTime;

// `Date.prototype.toString` method
// https://tc39.es/ecma262/#sec-date.prototype.tostring
if (new Date(NaN) + '' != INVALID_DATE) {
  redefine$7(DatePrototype$1, TO_STRING, function toString() {
    var value = getTime.call(this);
    // eslint-disable-next-line no-self-compare
    return value === value ? nativeDateToString.call(this) : INVALID_DATE;
  });
}

var anObject$1h = anObject$1z;
var toPrimitive$2 = toPrimitive$b;

var dateToPrimitive$1 = function (hint) {
  if (hint !== 'string' && hint !== 'number' && hint !== 'default') {
    throw TypeError('Incorrect hint');
  } return toPrimitive$2(anObject$1h(this), hint !== 'number');
};

var createNonEnumerableProperty$b = createNonEnumerableProperty$m;
var dateToPrimitive = dateToPrimitive$1;
var wellKnownSymbol$d = wellKnownSymbol$C;

var TO_PRIMITIVE = wellKnownSymbol$d('toPrimitive');
var DatePrototype = Date.prototype;

// `Date.prototype[@@toPrimitive]` method
// https://tc39.es/ecma262/#sec-date.prototype-@@toprimitive
if (!(TO_PRIMITIVE in DatePrototype)) {
  createNonEnumerableProperty$b(DatePrototype, TO_PRIMITIVE, dateToPrimitive);
}

var $$2f = _export;
var getBuiltIn$n = getBuiltIn$t;
var fails$h = fails$Y;

var $stringify = getBuiltIn$n('JSON', 'stringify');
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

var FORCED$8 = fails$h(function () {
  return $stringify('\uDF06\uD834') !== '"\\udf06\\ud834"'
    || $stringify('\uDEAD') !== '"\\udead"';
});

if ($stringify) {
  // `JSON.stringify` method
  // https://tc39.es/ecma262/#sec-json.stringify
  // https://github.com/tc39/proposal-well-formed-stringify
  $$2f({ target: 'JSON', stat: true, forced: FORCED$8 }, {
    // eslint-disable-next-line no-unused-vars
    stringify: function stringify(it, replacer, space) {
      var result = $stringify.apply(null, arguments);
      return typeof result == 'string' ? result.replace(re, fix) : result;
    }
  });
}

var global$p = global$L;
var setToStringTag$6 = setToStringTag$b;

// JSON[@@toStringTag] property
// https://tc39.es/ecma262/#sec-json-@@tostringtag
setToStringTag$6(global$p.JSON, 'JSON', true);

var global$o = global$L;

var nativePromiseConstructor = global$o.Promise;

var redefine$6 = redefine$g.exports;

var redefineAll$9 = function (target, src, options) {
  for (var key in src) redefine$6(target, key, src[key], options);
  return target;
};

var anInstance$b = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
  } return it;
};

var userAgent$2 = engineUserAgent;

var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(userAgent$2);

var global$n = global$L;
var fails$g = fails$Y;
var bind$i = functionBindContext;
var html = html$2;
var createElement = documentCreateElement$1;
var IS_IOS$1 = engineIsIos;
var IS_NODE$3 = engineIsNode;

var location = global$n.location;
var set$2 = global$n.setImmediate;
var clear = global$n.clearImmediate;
var process$3 = global$n.process;
var MessageChannel = global$n.MessageChannel;
var Dispatch = global$n.Dispatch;
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
  global$n.postMessage(id + '', location.protocol + '//' + location.host);
};

// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!set$2 || !clear) {
  set$2 = function setImmediate(fn) {
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
    defer = bind$i(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (
    global$n.addEventListener &&
    typeof postMessage == 'function' &&
    !global$n.importScripts &&
    location && location.protocol !== 'file:' &&
    !fails$g(post)
  ) {
    defer = post;
    global$n.addEventListener('message', listener, false);
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
  set: set$2,
  clear: clear
};

var userAgent$1 = engineUserAgent;

var engineIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent$1);

var global$m = global$L;
var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var macrotask = task$2.set;
var IS_IOS = engineIsIos;
var IS_WEBOS_WEBKIT = engineIsWebosWebkit;
var IS_NODE$2 = engineIsNode;

var MutationObserver = global$m.MutationObserver || global$m.WebKitMutationObserver;
var document$2 = global$m.document;
var process$2 = global$m.process;
var Promise$4 = global$m.Promise;
// Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
var queueMicrotaskDescriptor = getOwnPropertyDescriptor$1(global$m, 'queueMicrotask');
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
  } else if (Promise$4 && Promise$4.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    promise = Promise$4.resolve(undefined);
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
      macrotask.call(global$m, flush);
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

var aFunction$H = aFunction$R;

var PromiseCapability = function (C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction$H(resolve);
  this.reject = aFunction$H(reject);
};

// 25.4.1.5 NewPromiseCapability(C)
newPromiseCapability$2.f = function (C) {
  return new PromiseCapability(C);
};

var anObject$1g = anObject$1z;
var isObject$d = isObject$B;
var newPromiseCapability$1 = newPromiseCapability$2;

var promiseResolve$2 = function (C, x) {
  anObject$1g(C);
  if (isObject$d(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability$1.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var global$l = global$L;

var hostReportErrors$2 = function (a, b) {
  var console = global$l.console;
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

var $$2e = _export;
var global$k = global$L;
var getBuiltIn$m = getBuiltIn$t;
var NativePromise$1 = nativePromiseConstructor;
var redefine$5 = redefine$g.exports;
var redefineAll$8 = redefineAll$9;
var setToStringTag$5 = setToStringTag$b;
var setSpecies$4 = setSpecies$7;
var isObject$c = isObject$B;
var aFunction$G = aFunction$R;
var anInstance$a = anInstance$b;
var inspectSource = inspectSource$3;
var iterate$F = iterate$I;
var checkCorrectnessOfIteration$2 = checkCorrectnessOfIteration$4;
var speciesConstructor$g = speciesConstructor$j;
var task$1 = task$2.set;
var microtask$1 = microtask$2;
var promiseResolve$1 = promiseResolve$2;
var hostReportErrors$1 = hostReportErrors$2;
var newPromiseCapabilityModule$3 = newPromiseCapability$2;
var perform$3 = perform$4;
var InternalStateModule$d = internalState;
var isForced$1 = isForced_1;
var wellKnownSymbol$c = wellKnownSymbol$C;
var IS_NODE$1 = engineIsNode;
var V8_VERSION = engineV8Version;

var SPECIES = wellKnownSymbol$c('species');
var PROMISE = 'Promise';
var getInternalState$9 = InternalStateModule$d.get;
var setInternalState$d = InternalStateModule$d.set;
var getInternalPromiseState = InternalStateModule$d.getterFor(PROMISE);
var PromiseConstructor = NativePromise$1;
var TypeError$1 = global$k.TypeError;
var document$1 = global$k.document;
var process$1 = global$k.process;
var $fetch$1 = getBuiltIn$m('fetch');
var newPromiseCapability = newPromiseCapabilityModule$3.f;
var newGenericPromiseCapability = newPromiseCapability;
var DISPATCH_EVENT = !!(document$1 && document$1.createEvent && global$k.dispatchEvent);
var NATIVE_REJECTION_EVENT = typeof PromiseRejectionEvent == 'function';
var UNHANDLED_REJECTION = 'unhandledrejection';
var REJECTION_HANDLED = 'rejectionhandled';
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;
var HANDLED = 1;
var UNHANDLED = 2;
var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

var FORCED$7 = isForced$1(PROMISE, function () {
  var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
  if (!GLOBAL_CORE_JS_PROMISE) {
    // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
    // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
    // We can't detect it synchronously, so just check versions
    if (V8_VERSION === 66) return true;
    // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    if (!IS_NODE$1 && !NATIVE_REJECTION_EVENT) return true;
  }
  // We can't use @@species feature detection in V8 since it causes
  // deoptimization and performance degradation
  // https://github.com/zloirock/core-js/issues/679
  if (V8_VERSION >= 51 && /native code/.test(PromiseConstructor)) return false;
  // Detect correctness of subclassing with @@species support
  var promise = PromiseConstructor.resolve(1);
  var FakePromise = function (exec) {
    exec(function () { /* empty */ }, function () { /* empty */ });
  };
  var constructor = promise.constructor = {};
  constructor[SPECIES] = FakePromise;
  return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
});

var INCORRECT_ITERATION = FORCED$7 || !checkCorrectnessOfIteration$2(function (iterable) {
  PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
});

// helpers
var isThenable = function (it) {
  var then;
  return isObject$c(it) && typeof (then = it.then) == 'function' ? then : false;
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
    global$k.dispatchEvent(event);
  } else event = { promise: promise, reason: reason };
  if (!NATIVE_REJECTION_EVENT && (handler = global$k['on' + name])) handler(event);
  else if (name === UNHANDLED_REJECTION) hostReportErrors$1('Unhandled promise rejection', reason);
};

var onUnhandled = function (state) {
  task$1.call(global$k, function () {
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
  task$1.call(global$k, function () {
    var promise = state.facade;
    if (IS_NODE$1) {
      process$1.emit('rejectionHandled', promise);
    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
  });
};

var bind$h = function (fn, state, unwrap) {
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
            bind$h(internalResolve, wrapper, state),
            bind$h(internalReject, wrapper, state)
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
if (FORCED$7) {
  // 25.4.3.1 Promise(executor)
  PromiseConstructor = function Promise(executor) {
    anInstance$a(this, PromiseConstructor, PROMISE);
    aFunction$G(executor);
    Internal.call(this);
    var state = getInternalState$9(this);
    try {
      executor(bind$h(internalResolve, state), bind$h(internalReject, state));
    } catch (error) {
      internalReject(state, error);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    setInternalState$d(this, {
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
  Internal.prototype = redefineAll$8(PromiseConstructor.prototype, {
    // `Promise.prototype.then` method
    // https://tc39.es/ecma262/#sec-promise.prototype.then
    then: function then(onFulfilled, onRejected) {
      var state = getInternalPromiseState(this);
      var reaction = newPromiseCapability(speciesConstructor$g(this, PromiseConstructor));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
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
    var state = getInternalState$9(promise);
    this.promise = promise;
    this.resolve = bind$h(internalResolve, state);
    this.reject = bind$h(internalReject, state);
  };
  newPromiseCapabilityModule$3.f = newPromiseCapability = function (C) {
    return C === PromiseConstructor || C === PromiseWrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };

  if (typeof NativePromise$1 == 'function') {
    nativeThen = NativePromise$1.prototype.then;

    // wrap native Promise#then for native async functions
    redefine$5(NativePromise$1.prototype, 'then', function then(onFulfilled, onRejected) {
      var that = this;
      return new PromiseConstructor(function (resolve, reject) {
        nativeThen.call(that, resolve, reject);
      }).then(onFulfilled, onRejected);
    // https://github.com/zloirock/core-js/issues/640
    }, { unsafe: true });

    // wrap fetch result
    if (typeof $fetch$1 == 'function') $$2e({ global: true, enumerable: true, forced: true }, {
      // eslint-disable-next-line no-unused-vars
      fetch: function fetch(input /* , init */) {
        return promiseResolve$1(PromiseConstructor, $fetch$1.apply(global$k, arguments));
      }
    });
  }
}

$$2e({ global: true, wrap: true, forced: FORCED$7 }, {
  Promise: PromiseConstructor
});

setToStringTag$5(PromiseConstructor, PROMISE, false);
setSpecies$4(PROMISE);

PromiseWrapper = getBuiltIn$m(PROMISE);

// statics
$$2e({ target: PROMISE, stat: true, forced: FORCED$7 }, {
  // `Promise.reject` method
  // https://tc39.es/ecma262/#sec-promise.reject
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    capability.reject.call(undefined, r);
    return capability.promise;
  }
});

$$2e({ target: PROMISE, stat: true, forced: FORCED$7 }, {
  // `Promise.resolve` method
  // https://tc39.es/ecma262/#sec-promise.resolve
  resolve: function resolve(x) {
    return promiseResolve$1(this, x);
  }
});

$$2e({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
  // `Promise.all` method
  // https://tc39.es/ecma262/#sec-promise.all
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$3(function () {
      var $promiseResolve = aFunction$G(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$F(iterable, function (promise) {
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
      var $promiseResolve = aFunction$G(C.resolve);
      iterate$F(iterable, function (promise) {
        $promiseResolve.call(C, promise).then(capability.resolve, reject);
      });
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$2d = _export;
var aFunction$F = aFunction$R;
var newPromiseCapabilityModule$2 = newPromiseCapability$2;
var perform$2 = perform$4;
var iterate$E = iterate$I;

// `Promise.allSettled` method
// https://tc39.es/ecma262/#sec-promise.allsettled
$$2d({ target: 'Promise', stat: true }, {
  allSettled: function allSettled(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$2.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$2(function () {
      var promiseResolve = aFunction$F(C.resolve);
      var values = [];
      var counter = 0;
      var remaining = 1;
      iterate$E(iterable, function (promise) {
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

var $$2c = _export;
var aFunction$E = aFunction$R;
var getBuiltIn$l = getBuiltIn$t;
var newPromiseCapabilityModule$1 = newPromiseCapability$2;
var perform$1 = perform$4;
var iterate$D = iterate$I;

var PROMISE_ANY_ERROR = 'No one promise resolved';

// `Promise.any` method
// https://tc39.es/ecma262/#sec-promise.any
$$2c({ target: 'Promise', stat: true }, {
  any: function any(iterable) {
    var C = this;
    var capability = newPromiseCapabilityModule$1.f(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform$1(function () {
      var promiseResolve = aFunction$E(C.resolve);
      var errors = [];
      var counter = 0;
      var remaining = 1;
      var alreadyResolved = false;
      iterate$D(iterable, function (promise) {
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
          --remaining || reject(new (getBuiltIn$l('AggregateError'))(errors, PROMISE_ANY_ERROR));
        });
      });
      --remaining || reject(new (getBuiltIn$l('AggregateError'))(errors, PROMISE_ANY_ERROR));
    });
    if (result.error) reject(result.value);
    return capability.promise;
  }
});

var $$2b = _export;
var NativePromise = nativePromiseConstructor;
var fails$f = fails$Y;
var getBuiltIn$k = getBuiltIn$t;
var speciesConstructor$f = speciesConstructor$j;
var promiseResolve = promiseResolve$2;
var redefine$4 = redefine$g.exports;

// Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
var NON_GENERIC = !!NativePromise && fails$f(function () {
  NativePromise.prototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
});

// `Promise.prototype.finally` method
// https://tc39.es/ecma262/#sec-promise.prototype.finally
$$2b({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
  'finally': function (onFinally) {
    var C = speciesConstructor$f(this, getBuiltIn$k('Promise'));
    var isFunction = typeof onFinally == 'function';
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

// patch native Promise.prototype for native async functions
if (typeof NativePromise == 'function' && !NativePromise.prototype['finally']) {
  redefine$4(NativePromise.prototype, 'finally', getBuiltIn$k('Promise').prototype['finally']);
}

var $$2a = _export;
var global$j = global$L;
var isForced = isForced_1;
var redefine$3 = redefine$g.exports;
var InternalMetadataModule$1 = internalMetadata.exports;
var iterate$C = iterate$I;
var anInstance$9 = anInstance$b;
var isObject$b = isObject$B;
var fails$e = fails$Y;
var checkCorrectnessOfIteration$1 = checkCorrectnessOfIteration$4;
var setToStringTag$4 = setToStringTag$b;
var inheritIfRequired$1 = inheritIfRequired$4;

var collection$4 = function (CONSTRUCTOR_NAME, wrapper, common) {
  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
  var ADDER = IS_MAP ? 'set' : 'add';
  var NativeConstructor = global$j[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var exported = {};

  var fixMethod = function (KEY) {
    var nativeMethod = NativePrototype[KEY];
    redefine$3(NativePrototype, KEY,
      KEY == 'add' ? function add(value) {
        nativeMethod.call(this, value === 0 ? 0 : value);
        return this;
      } : KEY == 'delete' ? function (key) {
        return IS_WEAK && !isObject$b(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'get' ? function get(key) {
        return IS_WEAK && !isObject$b(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'has' ? function has(key) {
        return IS_WEAK && !isObject$b(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        nativeMethod.call(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  // eslint-disable-next-line max-len
  if (isForced(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails$e(function () {
    new NativeConstructor().entries().next();
  })))) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
    InternalMetadataModule$1.REQUIRED = true;
  } else if (isForced(CONSTRUCTOR_NAME, true)) {
    var instance = new Constructor();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails$e(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration$1(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails$e(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance$9(dummy, Constructor, CONSTRUCTOR_NAME);
        var that = inheritIfRequired$1(new NativeConstructor(), dummy, Constructor);
        if (iterable != undefined) iterate$C(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
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
  $$2a({ global: true, forced: Constructor != NativeConstructor }, exported);

  setToStringTag$4(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};

var defineProperty$5 = objectDefineProperty.f;
var create$7 = objectCreate;
var redefineAll$7 = redefineAll$9;
var bind$g = functionBindContext;
var anInstance$8 = anInstance$b;
var iterate$B = iterate$I;
var defineIterator = defineIterator$3;
var setSpecies$3 = setSpecies$7;
var DESCRIPTORS$a = descriptors;
var fastKey = internalMetadata.exports.fastKey;
var InternalStateModule$c = internalState;

var setInternalState$c = InternalStateModule$c.set;
var internalStateGetterFor$1 = InternalStateModule$c.getterFor;

var collectionStrong$2 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance$8(that, C, CONSTRUCTOR_NAME);
      setInternalState$c(that, {
        type: CONSTRUCTOR_NAME,
        index: create$7(null),
        first: undefined,
        last: undefined,
        size: 0
      });
      if (!DESCRIPTORS$a) that.size = 0;
      if (iterable != undefined) iterate$B(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
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
        if (DESCRIPTORS$a) state.size++;
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

    redefineAll$7(C.prototype, {
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
        if (DESCRIPTORS$a) state.size = 0;
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
          if (DESCRIPTORS$a) state.size--;
          else that.size--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind$g(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
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

    redefineAll$7(C.prototype, IS_MAP ? {
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
    if (DESCRIPTORS$a) defineProperty$5(C.prototype, 'size', {
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
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
      setInternalState$c(this, {
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
    setSpecies$3(CONSTRUCTOR_NAME);
  }
};

var collection$3 = collection$4;
var collectionStrong$1 = collectionStrong$2;

// `Map` constructor
// https://tc39.es/ecma262/#sec-map-objects
var es_map = collection$3('Map', function (init) {
  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong$1);

var collection$2 = collection$4;
var collectionStrong = collectionStrong$2;

// `Set` constructor
// https://tc39.es/ecma262/#sec-set-objects
var es_set = collection$2('Set', function (init) {
  return function Set() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong);

var es_weakMap = {exports: {}};

var redefineAll$6 = redefineAll$9;
var getWeakData = internalMetadata.exports.getWeakData;
var anObject$1f = anObject$1z;
var isObject$a = isObject$B;
var anInstance$7 = anInstance$b;
var iterate$A = iterate$I;
var ArrayIterationModule = arrayIteration;
var $has = has$o;
var InternalStateModule$b = internalState;

var setInternalState$b = InternalStateModule$b.set;
var internalStateGetterFor = InternalStateModule$b.getterFor;
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
      anInstance$7(that, C, CONSTRUCTOR_NAME);
      setInternalState$b(that, {
        type: CONSTRUCTOR_NAME,
        id: id++,
        frozen: undefined
      });
      if (iterable != undefined) iterate$A(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var data = getWeakData(anObject$1f(key), true);
      if (data === true) uncaughtFrozenStore(state).set(key, value);
      else data[state.id] = value;
      return that;
    };

    redefineAll$6(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function (key) {
        var state = getInternalState(this);
        if (!isObject$a(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
        return data && $has(data, state.id) && delete data[state.id];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key) {
        var state = getInternalState(this);
        if (!isObject$a(key)) return false;
        var data = getWeakData(key);
        if (data === true) return uncaughtFrozenStore(state).has(key);
        return data && $has(data, state.id);
      }
    });

    redefineAll$6(C.prototype, IS_MAP ? {
      // 23.3.3.3 WeakMap.prototype.get(key)
      get: function get(key) {
        var state = getInternalState(this);
        if (isObject$a(key)) {
          var data = getWeakData(key);
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

var global$i = global$L;
var redefineAll$5 = redefineAll$9;
var InternalMetadataModule = internalMetadata.exports;
var collection$1 = collection$4;
var collectionWeak$1 = collectionWeak$2;
var isObject$9 = isObject$B;
var enforceIternalState = internalState.enforce;
var NATIVE_WEAK_MAP = nativeWeakMap;

var IS_IE11 = !global$i.ActiveXObject && 'ActiveXObject' in global$i;
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
  InternalMetadataModule.REQUIRED = true;
  var WeakMapPrototype = $WeakMap.prototype;
  var nativeDelete = WeakMapPrototype['delete'];
  var nativeHas = WeakMapPrototype.has;
  var nativeGet = WeakMapPrototype.get;
  var nativeSet = WeakMapPrototype.set;
  redefineAll$5(WeakMapPrototype, {
    'delete': function (key) {
      if (isObject$9(key) && !isExtensible(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeDelete.call(this, key) || state.frozen['delete'](key);
      } return nativeDelete.call(this, key);
    },
    has: function has(key) {
      if (isObject$9(key) && !isExtensible(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas.call(this, key) || state.frozen.has(key);
      } return nativeHas.call(this, key);
    },
    get: function get(key) {
      if (isObject$9(key) && !isExtensible(key)) {
        var state = enforceIternalState(this);
        if (!state.frozen) state.frozen = new InternalWeakMap();
        return nativeHas.call(this, key) ? nativeGet.call(this, key) : state.frozen.get(key);
      } return nativeGet.call(this, key);
    },
    set: function set(key, value) {
      if (isObject$9(key) && !isExtensible(key)) {
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

var arrayBufferNative = typeof ArrayBuffer !== 'undefined' && typeof DataView !== 'undefined';

var toInteger$5 = toInteger$f;
var toLength$b = toLength$y;

// `ToIndex` abstract operation
// https://tc39.es/ecma262/#sec-toindex
var toIndex$2 = function (it) {
  if (it === undefined) return 0;
  var number = toInteger$5(it);
  var length = toLength$b(number);
  if (number !== length) throw RangeError('Wrong length or index');
  return length;
};

// IEEE754 conversions based on https://github.com/feross/ieee754
// eslint-disable-next-line no-shadow-restricted-names
var Infinity$1 = 1 / 0;
var abs = Math.abs;
var pow$1 = Math.pow;
var floor$3 = Math.floor;
var log = Math.log;
var LN2 = Math.LN2;

var pack = function (number, mantissaLength, bytes) {
  var buffer = new Array(bytes);
  var exponentLength = bytes * 8 - mantissaLength - 1;
  var eMax = (1 << exponentLength) - 1;
  var eBias = eMax >> 1;
  var rt = mantissaLength === 23 ? pow$1(2, -24) - pow$1(2, -77) : 0;
  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
  var index = 0;
  var exponent, mantissa, c;
  number = abs(number);
  // eslint-disable-next-line no-self-compare
  if (number != number || number === Infinity$1) {
    // eslint-disable-next-line no-self-compare
    mantissa = number != number ? 1 : 0;
    exponent = eMax;
  } else {
    exponent = floor$3(log(number) / LN2);
    if (number * (c = pow$1(2, -exponent)) < 1) {
      exponent--;
      c *= 2;
    }
    if (exponent + eBias >= 1) {
      number += rt / c;
    } else {
      number += rt * pow$1(2, 1 - eBias);
    }
    if (number * c >= 2) {
      exponent++;
      c /= 2;
    }
    if (exponent + eBias >= eMax) {
      mantissa = 0;
      exponent = eMax;
    } else if (exponent + eBias >= 1) {
      mantissa = (number * c - 1) * pow$1(2, mantissaLength);
      exponent = exponent + eBias;
    } else {
      mantissa = number * pow$1(2, eBias - 1) * pow$1(2, mantissaLength);
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
    mantissa = mantissa + pow$1(2, mantissaLength);
    exponent = exponent - eBias;
  } return (sign ? -1 : 1) * mantissa * pow$1(2, exponent - mantissaLength);
};

var ieee754 = {
  pack: pack,
  unpack: unpack
};

var global$h = global$L;
var DESCRIPTORS$9 = descriptors;
var NATIVE_ARRAY_BUFFER$2 = arrayBufferNative;
var createNonEnumerableProperty$a = createNonEnumerableProperty$m;
var redefineAll$4 = redefineAll$9;
var fails$d = fails$Y;
var anInstance$6 = anInstance$b;
var toInteger$4 = toInteger$f;
var toLength$a = toLength$y;
var toIndex$1 = toIndex$2;
var IEEE754 = ieee754;
var getPrototypeOf$7 = objectGetPrototypeOf$1;
var setPrototypeOf$2 = objectSetPrototypeOf$1;
var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;
var defineProperty$4 = objectDefineProperty.f;
var arrayFill = arrayFill$1;
var setToStringTag$3 = setToStringTag$b;
var InternalStateModule$a = internalState;

var getInternalState$8 = InternalStateModule$a.get;
var setInternalState$a = InternalStateModule$a.set;
var ARRAY_BUFFER$1 = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var WRONG_LENGTH$1 = 'Wrong length';
var WRONG_INDEX = 'Wrong index';
var NativeArrayBuffer$1 = global$h[ARRAY_BUFFER$1];
var $ArrayBuffer = NativeArrayBuffer$1;
var $DataView = global$h[DATA_VIEW];
var $DataViewPrototype = $DataView && $DataView[PROTOTYPE];
var ObjectPrototype$1 = Object.prototype;
var RangeError$2 = global$h.RangeError;

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
  defineProperty$4(Constructor[PROTOTYPE], key, { get: function () { return getInternalState$8(this)[key]; } });
};

var get$1 = function (view, count, index, isLittleEndian) {
  var intIndex = toIndex$1(index);
  var store = getInternalState$8(view);
  if (intIndex + count > store.byteLength) throw RangeError$2(WRONG_INDEX);
  var bytes = getInternalState$8(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = bytes.slice(start, start + count);
  return isLittleEndian ? pack : pack.reverse();
};

var set$1 = function (view, count, index, conversion, value, isLittleEndian) {
  var intIndex = toIndex$1(index);
  var store = getInternalState$8(view);
  if (intIndex + count > store.byteLength) throw RangeError$2(WRONG_INDEX);
  var bytes = getInternalState$8(store.buffer).bytes;
  var start = intIndex + store.byteOffset;
  var pack = conversion(+value);
  for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
};

if (!NATIVE_ARRAY_BUFFER$2) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance$6(this, $ArrayBuffer, ARRAY_BUFFER$1);
    var byteLength = toIndex$1(length);
    setInternalState$a(this, {
      bytes: arrayFill.call(new Array(byteLength), 0),
      byteLength: byteLength
    });
    if (!DESCRIPTORS$9) this.byteLength = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance$6(this, $DataView, DATA_VIEW);
    anInstance$6(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = getInternalState$8(buffer).byteLength;
    var offset = toInteger$4(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError$2('Wrong offset');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength$a(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError$2(WRONG_LENGTH$1);
    setInternalState$a(this, {
      buffer: buffer,
      byteLength: byteLength,
      byteOffset: offset
    });
    if (!DESCRIPTORS$9) {
      this.buffer = buffer;
      this.byteLength = byteLength;
      this.byteOffset = offset;
    }
  };

  if (DESCRIPTORS$9) {
    addGetter$1($ArrayBuffer, 'byteLength');
    addGetter$1($DataView, 'buffer');
    addGetter$1($DataView, 'byteLength');
    addGetter$1($DataView, 'byteOffset');
  }

  redefineAll$4($DataView[PROTOTYPE], {
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
      set$1(this, 1, byteOffset, packInt8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set$1(this, 1, byteOffset, packInt8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set$1(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set$1(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set$1(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set$1(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set$1(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : undefined);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set$1(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : undefined);
    }
  });
} else {
  if (!fails$d(function () {
    NativeArrayBuffer$1(1);
  }) || !fails$d(function () {
    new NativeArrayBuffer$1(-1); // eslint-disable-line no-new
  }) || fails$d(function () {
    new NativeArrayBuffer$1(); // eslint-disable-line no-new
    new NativeArrayBuffer$1(1.5); // eslint-disable-line no-new
    new NativeArrayBuffer$1(NaN); // eslint-disable-line no-new
    return NativeArrayBuffer$1.name != ARRAY_BUFFER$1;
  })) {
    $ArrayBuffer = function ArrayBuffer(length) {
      anInstance$6(this, $ArrayBuffer);
      return new NativeArrayBuffer$1(toIndex$1(length));
    };
    var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE] = NativeArrayBuffer$1[PROTOTYPE];
    for (var keys = getOwnPropertyNames$1(NativeArrayBuffer$1), j = 0, key; keys.length > j;) {
      if (!((key = keys[j++]) in $ArrayBuffer)) {
        createNonEnumerableProperty$a($ArrayBuffer, key, NativeArrayBuffer$1[key]);
      }
    }
    ArrayBufferPrototype.constructor = $ArrayBuffer;
  }

  // WebKit bug - the same parent prototype for typed arrays and data view
  if (setPrototypeOf$2 && getPrototypeOf$7($DataViewPrototype) !== ObjectPrototype$1) {
    setPrototypeOf$2($DataViewPrototype, ObjectPrototype$1);
  }

  // iOS Safari 7.x bug
  var testView = new $DataView(new $ArrayBuffer(2));
  var nativeSetInt8 = $DataViewPrototype.setInt8;
  testView.setInt8(0, 2147483648);
  testView.setInt8(1, 2147483649);
  if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll$4($DataViewPrototype, {
    setInt8: function setInt8(byteOffset, value) {
      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, { unsafe: true });
}

setToStringTag$3($ArrayBuffer, ARRAY_BUFFER$1);
setToStringTag$3($DataView, DATA_VIEW);

var arrayBuffer = {
  ArrayBuffer: $ArrayBuffer,
  DataView: $DataView
};

var $$29 = _export;
var global$g = global$L;
var arrayBufferModule = arrayBuffer;
var setSpecies$2 = setSpecies$7;

var ARRAY_BUFFER = 'ArrayBuffer';
var ArrayBuffer$4 = arrayBufferModule[ARRAY_BUFFER];
var NativeArrayBuffer = global$g[ARRAY_BUFFER];

// `ArrayBuffer` constructor
// https://tc39.es/ecma262/#sec-arraybuffer-constructor
$$29({ global: true, forced: NativeArrayBuffer !== ArrayBuffer$4 }, {
  ArrayBuffer: ArrayBuffer$4
});

setSpecies$2(ARRAY_BUFFER);

var NATIVE_ARRAY_BUFFER$1 = arrayBufferNative;
var DESCRIPTORS$8 = descriptors;
var global$f = global$L;
var isObject$8 = isObject$B;
var has$8 = has$o;
var classof$2 = classof$b;
var createNonEnumerableProperty$9 = createNonEnumerableProperty$m;
var redefine$2 = redefine$g.exports;
var defineProperty$3 = objectDefineProperty.f;
var getPrototypeOf$6 = objectGetPrototypeOf$1;
var setPrototypeOf$1 = objectSetPrototypeOf$1;
var wellKnownSymbol$b = wellKnownSymbol$C;
var uid = uid$5;

var Int8Array$3 = global$f.Int8Array;
var Int8ArrayPrototype = Int8Array$3 && Int8Array$3.prototype;
var Uint8ClampedArray = global$f.Uint8ClampedArray;
var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
var TypedArray$1 = Int8Array$3 && getPrototypeOf$6(Int8Array$3);
var TypedArrayPrototype$1 = Int8ArrayPrototype && getPrototypeOf$6(Int8ArrayPrototype);
var ObjectPrototype = Object.prototype;
var isPrototypeOf = ObjectPrototype.isPrototypeOf;

var TO_STRING_TAG$5 = wellKnownSymbol$b('toStringTag');
var TYPED_ARRAY_TAG$1 = uid('TYPED_ARRAY_TAG');
// Fixing native typed arrays in Opera Presto crashes the browser, see #595
var NATIVE_ARRAY_BUFFER_VIEWS$3 = NATIVE_ARRAY_BUFFER$1 && !!setPrototypeOf$1 && classof$2(global$f.opera) !== 'Opera';
var TYPED_ARRAY_TAG_REQIRED = false;
var NAME;

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
  if (!isObject$8(it)) return false;
  var klass = classof$2(it);
  return klass === 'DataView'
    || has$8(TypedArrayConstructorsList, klass)
    || has$8(BigIntArrayConstructorsList, klass);
};

var isTypedArray$1 = function (it) {
  if (!isObject$8(it)) return false;
  var klass = classof$2(it);
  return has$8(TypedArrayConstructorsList, klass)
    || has$8(BigIntArrayConstructorsList, klass);
};

var aTypedArray$o = function (it) {
  if (isTypedArray$1(it)) return it;
  throw TypeError('Target is not a typed array');
};

var aTypedArrayConstructor$7 = function (C) {
  if (setPrototypeOf$1) {
    if (isPrototypeOf.call(TypedArray$1, C)) return C;
  } else for (var ARRAY in TypedArrayConstructorsList) if (has$8(TypedArrayConstructorsList, NAME)) {
    var TypedArrayConstructor = global$f[ARRAY];
    if (TypedArrayConstructor && (C === TypedArrayConstructor || isPrototypeOf.call(TypedArrayConstructor, C))) {
      return C;
    }
  } throw TypeError('Target is not a typed array constructor');
};

var exportTypedArrayMethod$p = function (KEY, property, forced) {
  if (!DESCRIPTORS$8) return;
  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
    var TypedArrayConstructor = global$f[ARRAY];
    if (TypedArrayConstructor && has$8(TypedArrayConstructor.prototype, KEY)) {
      delete TypedArrayConstructor.prototype[KEY];
    }
  }
  if (!TypedArrayPrototype$1[KEY] || forced) {
    redefine$2(TypedArrayPrototype$1, KEY, forced ? property
      : NATIVE_ARRAY_BUFFER_VIEWS$3 && Int8ArrayPrototype[KEY] || property);
  }
};

var exportTypedArrayStaticMethod$2 = function (KEY, property, forced) {
  var ARRAY, TypedArrayConstructor;
  if (!DESCRIPTORS$8) return;
  if (setPrototypeOf$1) {
    if (forced) for (ARRAY in TypedArrayConstructorsList) {
      TypedArrayConstructor = global$f[ARRAY];
      if (TypedArrayConstructor && has$8(TypedArrayConstructor, KEY)) {
        delete TypedArrayConstructor[KEY];
      }
    }
    if (!TypedArray$1[KEY] || forced) {
      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
      try {
        return redefine$2(TypedArray$1, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS$3 && Int8Array$3[KEY] || property);
      } catch (error) { /* empty */ }
    } else return;
  }
  for (ARRAY in TypedArrayConstructorsList) {
    TypedArrayConstructor = global$f[ARRAY];
    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
      redefine$2(TypedArrayConstructor, KEY, property);
    }
  }
};

for (NAME in TypedArrayConstructorsList) {
  if (!global$f[NAME]) NATIVE_ARRAY_BUFFER_VIEWS$3 = false;
}

// WebKit bug - typed arrays constructors prototype is Object.prototype
if (!NATIVE_ARRAY_BUFFER_VIEWS$3 || typeof TypedArray$1 != 'function' || TypedArray$1 === Function.prototype) {
  // eslint-disable-next-line no-shadow
  TypedArray$1 = function TypedArray() {
    throw TypeError('Incorrect invocation');
  };
  if (NATIVE_ARRAY_BUFFER_VIEWS$3) for (NAME in TypedArrayConstructorsList) {
    if (global$f[NAME]) setPrototypeOf$1(global$f[NAME], TypedArray$1);
  }
}

if (!NATIVE_ARRAY_BUFFER_VIEWS$3 || !TypedArrayPrototype$1 || TypedArrayPrototype$1 === ObjectPrototype) {
  TypedArrayPrototype$1 = TypedArray$1.prototype;
  if (NATIVE_ARRAY_BUFFER_VIEWS$3) for (NAME in TypedArrayConstructorsList) {
    if (global$f[NAME]) setPrototypeOf$1(global$f[NAME].prototype, TypedArrayPrototype$1);
  }
}

// WebKit bug - one more object in Uint8ClampedArray prototype chain
if (NATIVE_ARRAY_BUFFER_VIEWS$3 && getPrototypeOf$6(Uint8ClampedArrayPrototype) !== TypedArrayPrototype$1) {
  setPrototypeOf$1(Uint8ClampedArrayPrototype, TypedArrayPrototype$1);
}

if (DESCRIPTORS$8 && !has$8(TypedArrayPrototype$1, TO_STRING_TAG$5)) {
  TYPED_ARRAY_TAG_REQIRED = true;
  defineProperty$3(TypedArrayPrototype$1, TO_STRING_TAG$5, { get: function () {
    return isObject$8(this) ? this[TYPED_ARRAY_TAG$1] : undefined;
  } });
  for (NAME in TypedArrayConstructorsList) if (global$f[NAME]) {
    createNonEnumerableProperty$9(global$f[NAME], TYPED_ARRAY_TAG$1, NAME);
  }
}

var arrayBufferViewCore = {
  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS$3,
  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG$1,
  aTypedArray: aTypedArray$o,
  aTypedArrayConstructor: aTypedArrayConstructor$7,
  exportTypedArrayMethod: exportTypedArrayMethod$p,
  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod$2,
  isView: isView,
  isTypedArray: isTypedArray$1,
  TypedArray: TypedArray$1,
  TypedArrayPrototype: TypedArrayPrototype$1
};

var $$28 = _export;
var ArrayBufferViewCore$q = arrayBufferViewCore;

var NATIVE_ARRAY_BUFFER_VIEWS$2 = ArrayBufferViewCore$q.NATIVE_ARRAY_BUFFER_VIEWS;

// `ArrayBuffer.isView` method
// https://tc39.es/ecma262/#sec-arraybuffer.isview
$$28({ target: 'ArrayBuffer', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS$2 }, {
  isView: ArrayBufferViewCore$q.isView
});

var $$27 = _export;
var fails$c = fails$Y;
var ArrayBufferModule$2 = arrayBuffer;
var anObject$1e = anObject$1z;
var toAbsoluteIndex$1 = toAbsoluteIndex$8;
var toLength$9 = toLength$y;
var speciesConstructor$e = speciesConstructor$j;

var ArrayBuffer$3 = ArrayBufferModule$2.ArrayBuffer;
var DataView$2 = ArrayBufferModule$2.DataView;
var nativeArrayBufferSlice = ArrayBuffer$3.prototype.slice;

var INCORRECT_SLICE = fails$c(function () {
  return !new ArrayBuffer$3(2).slice(1, undefined).byteLength;
});

// `ArrayBuffer.prototype.slice` method
// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
$$27({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
  slice: function slice(start, end) {
    if (nativeArrayBufferSlice !== undefined && end === undefined) {
      return nativeArrayBufferSlice.call(anObject$1e(this), start); // FF fix
    }
    var length = anObject$1e(this).byteLength;
    var first = toAbsoluteIndex$1(start, length);
    var fin = toAbsoluteIndex$1(end === undefined ? length : end, length);
    var result = new (speciesConstructor$e(this, ArrayBuffer$3))(toLength$9(fin - first));
    var viewSource = new DataView$2(this);
    var viewTarget = new DataView$2(result);
    var index = 0;
    while (first < fin) {
      viewTarget.setUint8(index++, viewSource.getUint8(first++));
    } return result;
  }
});

var $$26 = _export;
var ArrayBufferModule$1 = arrayBuffer;
var NATIVE_ARRAY_BUFFER = arrayBufferNative;

// `DataView` constructor
// https://tc39.es/ecma262/#sec-dataview-constructor
$$26({ global: true, forced: !NATIVE_ARRAY_BUFFER }, {
  DataView: ArrayBufferModule$1.DataView
});

var typedArrayConstructor = {exports: {}};

/* eslint-disable no-new */

var global$e = global$L;
var fails$b = fails$Y;
var checkCorrectnessOfIteration = checkCorrectnessOfIteration$4;
var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

var ArrayBuffer$2 = global$e.ArrayBuffer;
var Int8Array$2 = global$e.Int8Array;

var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails$b(function () {
  Int8Array$2(1);
}) || !fails$b(function () {
  new Int8Array$2(-1);
}) || !checkCorrectnessOfIteration(function (iterable) {
  new Int8Array$2();
  new Int8Array$2(null);
  new Int8Array$2(1.5);
  new Int8Array$2(iterable);
}, true) || fails$b(function () {
  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
  return new Int8Array$2(new ArrayBuffer$2(2), 1, undefined).length !== 1;
});

var toInteger$3 = toInteger$f;

var toPositiveInteger$5 = function (it) {
  var result = toInteger$3(it);
  if (result < 0) throw RangeError("The argument can't be less than 0");
  return result;
};

var toPositiveInteger$4 = toPositiveInteger$5;

var toOffset$2 = function (it, BYTES) {
  var offset = toPositiveInteger$4(it);
  if (offset % BYTES) throw RangeError('Wrong offset');
  return offset;
};

var toObject$8 = toObject$u;
var toLength$8 = toLength$y;
var getIteratorMethod$5 = getIteratorMethod$8;
var isArrayIteratorMethod = isArrayIteratorMethod$3;
var bind$f = functionBindContext;
var aTypedArrayConstructor$6 = arrayBufferViewCore.aTypedArrayConstructor;

var typedArrayFrom$2 = function from(source /* , mapfn, thisArg */) {
  var O = toObject$8(source);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  var iteratorMethod = getIteratorMethod$5(O);
  var i, length, result, step, iterator, next;
  if (iteratorMethod != undefined && !isArrayIteratorMethod(iteratorMethod)) {
    iterator = iteratorMethod.call(O);
    next = iterator.next;
    O = [];
    while (!(step = next.call(iterator)).done) {
      O.push(step.value);
    }
  }
  if (mapping && argumentsLength > 2) {
    mapfn = bind$f(mapfn, arguments[2], 2);
  }
  length = toLength$8(O.length);
  result = new (aTypedArrayConstructor$6(this))(length);
  for (i = 0; length > i; i++) {
    result[i] = mapping ? mapfn(O[i], i) : O[i];
  }
  return result;
};

var $$25 = _export;
var global$d = global$L;
var DESCRIPTORS$7 = descriptors;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$2 = typedArrayConstructorsRequireWrappers;
var ArrayBufferViewCore$p = arrayBufferViewCore;
var ArrayBufferModule = arrayBuffer;
var anInstance$5 = anInstance$b;
var createPropertyDescriptor$2 = createPropertyDescriptor$9;
var createNonEnumerableProperty$8 = createNonEnumerableProperty$m;
var toLength$7 = toLength$y;
var toIndex = toIndex$2;
var toOffset$1 = toOffset$2;
var toPrimitive$1 = toPrimitive$b;
var has$7 = has$o;
var classof$1 = classof$b;
var isObject$7 = isObject$B;
var create$6 = objectCreate;
var setPrototypeOf = objectSetPrototypeOf$1;
var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var typedArrayFrom$1 = typedArrayFrom$2;
var forEach$1 = arrayIteration.forEach;
var setSpecies$1 = setSpecies$7;
var definePropertyModule$2 = objectDefineProperty;
var getOwnPropertyDescriptorModule$3 = objectGetOwnPropertyDescriptor;
var InternalStateModule$9 = internalState;
var inheritIfRequired = inheritIfRequired$4;

var getInternalState$7 = InternalStateModule$9.get;
var setInternalState$9 = InternalStateModule$9.set;
var nativeDefineProperty = definePropertyModule$2.f;
var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule$3.f;
var round = Math.round;
var RangeError$1 = global$d.RangeError;
var ArrayBuffer$1 = ArrayBufferModule.ArrayBuffer;
var DataView$1 = ArrayBufferModule.DataView;
var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore$p.NATIVE_ARRAY_BUFFER_VIEWS;
var TYPED_ARRAY_TAG = ArrayBufferViewCore$p.TYPED_ARRAY_TAG;
var TypedArray = ArrayBufferViewCore$p.TypedArray;
var TypedArrayPrototype = ArrayBufferViewCore$p.TypedArrayPrototype;
var aTypedArrayConstructor$5 = ArrayBufferViewCore$p.aTypedArrayConstructor;
var isTypedArray = ArrayBufferViewCore$p.isTypedArray;
var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
var WRONG_LENGTH = 'Wrong length';

var fromList = function (C, list) {
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor$5(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var addGetter = function (it, key) {
  nativeDefineProperty(it, key, { get: function () {
    return getInternalState$7(this)[key];
  } });
};

var isArrayBuffer = function (it) {
  var klass;
  return it instanceof ArrayBuffer$1 || (klass = classof$1(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
};

var isTypedArrayIndex = function (target, key) {
  return isTypedArray(target)
    && typeof key != 'symbol'
    && key in target
    && String(+key) == String(key);
};

var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
  return isTypedArrayIndex(target, key = toPrimitive$1(key, true))
    ? createPropertyDescriptor$2(2, target[key])
    : nativeGetOwnPropertyDescriptor(target, key);
};

var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
  if (isTypedArrayIndex(target, key = toPrimitive$1(key, true))
    && isObject$7(descriptor)
    && has$7(descriptor, 'value')
    && !has$7(descriptor, 'get')
    && !has$7(descriptor, 'set')
    // TODO: add validation descriptor w/o calling accessors
    && !descriptor.configurable
    && (!has$7(descriptor, 'writable') || descriptor.writable)
    && (!has$7(descriptor, 'enumerable') || descriptor.enumerable)
  ) {
    target[key] = descriptor.value;
    return target;
  } return nativeDefineProperty(target, key, descriptor);
};

if (DESCRIPTORS$7) {
  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
    getOwnPropertyDescriptorModule$3.f = wrappedGetOwnPropertyDescriptor;
    definePropertyModule$2.f = wrappedDefineProperty;
    addGetter(TypedArrayPrototype, 'buffer');
    addGetter(TypedArrayPrototype, 'byteOffset');
    addGetter(TypedArrayPrototype, 'byteLength');
    addGetter(TypedArrayPrototype, 'length');
  }

  $$25({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
    defineProperty: wrappedDefineProperty
  });

  typedArrayConstructor.exports = function (TYPE, wrapper, CLAMPED) {
    var BYTES = TYPE.match(/\d+$/)[0] / 8;
    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + TYPE;
    var SETTER = 'set' + TYPE;
    var NativeTypedArrayConstructor = global$d[CONSTRUCTOR_NAME];
    var TypedArrayConstructor = NativeTypedArrayConstructor;
    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
    var exported = {};

    var getter = function (that, index) {
      var data = getInternalState$7(that);
      return data.view[GETTER](index * BYTES + data.byteOffset, true);
    };

    var setter = function (that, index, value) {
      var data = getInternalState$7(that);
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
        anInstance$5(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
        var index = 0;
        var byteOffset = 0;
        var buffer, byteLength, length;
        if (!isObject$7(data)) {
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
            byteLength = toLength$7($length) * BYTES;
            if (byteLength + byteOffset > $len) throw RangeError$1(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (isTypedArray(data)) {
          return fromList(TypedArrayConstructor, data);
        } else {
          return typedArrayFrom$1.call(TypedArrayConstructor, data);
        }
        setInternalState$9(that, {
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
    } else if (TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$2) {
      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
        anInstance$5(dummy, TypedArrayConstructor, CONSTRUCTOR_NAME);
        return inheritIfRequired(function () {
          if (!isObject$7(data)) return new NativeTypedArrayConstructor(toIndex(data));
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
          createNonEnumerableProperty$8(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
        }
      });
      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
    }

    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
      createNonEnumerableProperty$8(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
    }

    if (TYPED_ARRAY_TAG) {
      createNonEnumerableProperty$8(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
    }

    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

    $$25({
      global: true, forced: TypedArrayConstructor != NativeTypedArrayConstructor, sham: !NATIVE_ARRAY_BUFFER_VIEWS
    }, exported);

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
      createNonEnumerableProperty$8(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
    }

    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
      createNonEnumerableProperty$8(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
    }

    setSpecies$1(CONSTRUCTOR_NAME);
  };
} else typedArrayConstructor.exports = function () { /* empty */ };

var createTypedArrayConstructor$8 = typedArrayConstructor.exports;

// `Int8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$8('Int8', function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$7 = typedArrayConstructor.exports;

// `Uint8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$7('Uint8', function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$6 = typedArrayConstructor.exports;

// `Uint8ClampedArray` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$6('Uint8', function (init) {
  return function Uint8ClampedArray(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
}, true);

var createTypedArrayConstructor$5 = typedArrayConstructor.exports;

// `Int16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$5('Int16', function (init) {
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

var createTypedArrayConstructor$3 = typedArrayConstructor.exports;

// `Int32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$3('Int32', function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$2 = typedArrayConstructor.exports;

// `Uint32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$2('Uint32', function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor$1 = typedArrayConstructor.exports;

// `Float32Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor$1('Float32', function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var createTypedArrayConstructor = typedArrayConstructor.exports;

// `Float64Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
createTypedArrayConstructor('Float64', function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1 = typedArrayConstructorsRequireWrappers;
var exportTypedArrayStaticMethod$1 = arrayBufferViewCore.exportTypedArrayStaticMethod;
var typedArrayFrom = typedArrayFrom$2;

// `%TypedArray%.from` method
// https://tc39.es/ecma262/#sec-%typedarray%.from
exportTypedArrayStaticMethod$1('from', typedArrayFrom, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS$1);

var ArrayBufferViewCore$o = arrayBufferViewCore;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = typedArrayConstructorsRequireWrappers;

var aTypedArrayConstructor$4 = ArrayBufferViewCore$o.aTypedArrayConstructor;
var exportTypedArrayStaticMethod = ArrayBufferViewCore$o.exportTypedArrayStaticMethod;

// `%TypedArray%.of` method
// https://tc39.es/ecma262/#sec-%typedarray%.of
exportTypedArrayStaticMethod('of', function of(/* ...items */) {
  var index = 0;
  var length = arguments.length;
  var result = new (aTypedArrayConstructor$4(this))(length);
  while (length > index) result[index] = arguments[index++];
  return result;
}, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);

var ArrayBufferViewCore$n = arrayBufferViewCore;
var $copyWithin = arrayCopyWithin;

var aTypedArray$n = ArrayBufferViewCore$n.aTypedArray;
var exportTypedArrayMethod$o = ArrayBufferViewCore$n.exportTypedArrayMethod;

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
exportTypedArrayMethod$o('copyWithin', function copyWithin(target, start /* , end */) {
  return $copyWithin.call(aTypedArray$n(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
});

var ArrayBufferViewCore$m = arrayBufferViewCore;
var $every$1 = arrayIteration.every;

var aTypedArray$m = ArrayBufferViewCore$m.aTypedArray;
var exportTypedArrayMethod$n = ArrayBufferViewCore$m.exportTypedArrayMethod;

// `%TypedArray%.prototype.every` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
exportTypedArrayMethod$n('every', function every(callbackfn /* , thisArg */) {
  return $every$1(aTypedArray$m(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$l = arrayBufferViewCore;
var $fill = arrayFill$1;

var aTypedArray$l = ArrayBufferViewCore$l.aTypedArray;
var exportTypedArrayMethod$m = ArrayBufferViewCore$l.exportTypedArrayMethod;

// `%TypedArray%.prototype.fill` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
// eslint-disable-next-line no-unused-vars
exportTypedArrayMethod$m('fill', function fill(value /* , start, end */) {
  return $fill.apply(aTypedArray$l(this), arguments);
});

var ArrayBufferViewCore$k = arrayBufferViewCore;
var $filter = arrayIteration.filter;
var speciesConstructor$d = speciesConstructor$j;

var aTypedArray$k = ArrayBufferViewCore$k.aTypedArray;
var aTypedArrayConstructor$3 = ArrayBufferViewCore$k.aTypedArrayConstructor;
var exportTypedArrayMethod$l = ArrayBufferViewCore$k.exportTypedArrayMethod;

// `%TypedArray%.prototype.filter` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
exportTypedArrayMethod$l('filter', function filter(callbackfn /* , thisArg */) {
  var list = $filter(aTypedArray$k(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  var C = speciesConstructor$d(this, this.constructor);
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor$3(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
});

var ArrayBufferViewCore$j = arrayBufferViewCore;
var $find$1 = arrayIteration.find;

var aTypedArray$j = ArrayBufferViewCore$j.aTypedArray;
var exportTypedArrayMethod$k = ArrayBufferViewCore$j.exportTypedArrayMethod;

// `%TypedArray%.prototype.find` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
exportTypedArrayMethod$k('find', function find(predicate /* , thisArg */) {
  return $find$1(aTypedArray$j(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$i = arrayBufferViewCore;
var $findIndex = arrayIteration.findIndex;

var aTypedArray$i = ArrayBufferViewCore$i.aTypedArray;
var exportTypedArrayMethod$j = ArrayBufferViewCore$i.exportTypedArrayMethod;

// `%TypedArray%.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
exportTypedArrayMethod$j('findIndex', function findIndex(predicate /* , thisArg */) {
  return $findIndex(aTypedArray$i(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$h = arrayBufferViewCore;
var $forEach$1 = arrayIteration.forEach;

var aTypedArray$h = ArrayBufferViewCore$h.aTypedArray;
var exportTypedArrayMethod$i = ArrayBufferViewCore$h.exportTypedArrayMethod;

// `%TypedArray%.prototype.forEach` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
exportTypedArrayMethod$i('forEach', function forEach(callbackfn /* , thisArg */) {
  $forEach$1(aTypedArray$h(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$g = arrayBufferViewCore;
var $includes = arrayIncludes.includes;

var aTypedArray$g = ArrayBufferViewCore$g.aTypedArray;
var exportTypedArrayMethod$h = ArrayBufferViewCore$g.exportTypedArrayMethod;

// `%TypedArray%.prototype.includes` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
exportTypedArrayMethod$h('includes', function includes(searchElement /* , fromIndex */) {
  return $includes(aTypedArray$g(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$f = arrayBufferViewCore;
var $indexOf = arrayIncludes.indexOf;

var aTypedArray$f = ArrayBufferViewCore$f.aTypedArray;
var exportTypedArrayMethod$g = ArrayBufferViewCore$f.exportTypedArrayMethod;

// `%TypedArray%.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
exportTypedArrayMethod$g('indexOf', function indexOf(searchElement /* , fromIndex */) {
  return $indexOf(aTypedArray$f(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
});

var global$c = global$L;
var ArrayBufferViewCore$e = arrayBufferViewCore;
var ArrayIterators = es_array_iterator;
var wellKnownSymbol$a = wellKnownSymbol$C;

var ITERATOR$3 = wellKnownSymbol$a('iterator');
var Uint8Array$1 = global$c.Uint8Array;
var arrayValues = ArrayIterators.values;
var arrayKeys = ArrayIterators.keys;
var arrayEntries = ArrayIterators.entries;
var aTypedArray$e = ArrayBufferViewCore$e.aTypedArray;
var exportTypedArrayMethod$f = ArrayBufferViewCore$e.exportTypedArrayMethod;
var nativeTypedArrayIterator = Uint8Array$1 && Uint8Array$1.prototype[ITERATOR$3];

var CORRECT_ITER_NAME = !!nativeTypedArrayIterator
  && (nativeTypedArrayIterator.name == 'values' || nativeTypedArrayIterator.name == undefined);

var typedArrayValues = function values() {
  return arrayValues.call(aTypedArray$e(this));
};

// `%TypedArray%.prototype.entries` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
exportTypedArrayMethod$f('entries', function entries() {
  return arrayEntries.call(aTypedArray$e(this));
});
// `%TypedArray%.prototype.keys` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
exportTypedArrayMethod$f('keys', function keys() {
  return arrayKeys.call(aTypedArray$e(this));
});
// `%TypedArray%.prototype.values` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
exportTypedArrayMethod$f('values', typedArrayValues, !CORRECT_ITER_NAME);
// `%TypedArray%.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
exportTypedArrayMethod$f(ITERATOR$3, typedArrayValues, !CORRECT_ITER_NAME);

var ArrayBufferViewCore$d = arrayBufferViewCore;

var aTypedArray$d = ArrayBufferViewCore$d.aTypedArray;
var exportTypedArrayMethod$e = ArrayBufferViewCore$d.exportTypedArrayMethod;
var $join = [].join;

// `%TypedArray%.prototype.join` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
// eslint-disable-next-line no-unused-vars
exportTypedArrayMethod$e('join', function join(separator) {
  return $join.apply(aTypedArray$d(this), arguments);
});

var ArrayBufferViewCore$c = arrayBufferViewCore;
var $lastIndexOf = arrayLastIndexOf;

var aTypedArray$c = ArrayBufferViewCore$c.aTypedArray;
var exportTypedArrayMethod$d = ArrayBufferViewCore$c.exportTypedArrayMethod;

// `%TypedArray%.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
// eslint-disable-next-line no-unused-vars
exportTypedArrayMethod$d('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
  return $lastIndexOf.apply(aTypedArray$c(this), arguments);
});

var ArrayBufferViewCore$b = arrayBufferViewCore;
var $map = arrayIteration.map;
var speciesConstructor$c = speciesConstructor$j;

var aTypedArray$b = ArrayBufferViewCore$b.aTypedArray;
var aTypedArrayConstructor$2 = ArrayBufferViewCore$b.aTypedArrayConstructor;
var exportTypedArrayMethod$c = ArrayBufferViewCore$b.exportTypedArrayMethod;

// `%TypedArray%.prototype.map` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
exportTypedArrayMethod$c('map', function map(mapfn /* , thisArg */) {
  return $map(aTypedArray$b(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
    return new (aTypedArrayConstructor$2(speciesConstructor$c(O, O.constructor)))(length);
  });
});

var ArrayBufferViewCore$a = arrayBufferViewCore;
var $reduce = arrayReduce.left;

var aTypedArray$a = ArrayBufferViewCore$a.aTypedArray;
var exportTypedArrayMethod$b = ArrayBufferViewCore$a.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduce` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
exportTypedArrayMethod$b('reduce', function reduce(callbackfn /* , initialValue */) {
  return $reduce(aTypedArray$a(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$9 = arrayBufferViewCore;
var $reduceRight = arrayReduce.right;

var aTypedArray$9 = ArrayBufferViewCore$9.aTypedArray;
var exportTypedArrayMethod$a = ArrayBufferViewCore$9.exportTypedArrayMethod;

// `%TypedArray%.prototype.reduceRicht` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
exportTypedArrayMethod$a('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
  return $reduceRight(aTypedArray$9(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$8 = arrayBufferViewCore;

var aTypedArray$8 = ArrayBufferViewCore$8.aTypedArray;
var exportTypedArrayMethod$9 = ArrayBufferViewCore$8.exportTypedArrayMethod;
var floor$2 = Math.floor;

// `%TypedArray%.prototype.reverse` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
exportTypedArrayMethod$9('reverse', function reverse() {
  var that = this;
  var length = aTypedArray$8(that).length;
  var middle = floor$2(length / 2);
  var index = 0;
  var value;
  while (index < middle) {
    value = that[index];
    that[index++] = that[--length];
    that[length] = value;
  } return that;
});

var ArrayBufferViewCore$7 = arrayBufferViewCore;
var toLength$6 = toLength$y;
var toOffset = toOffset$2;
var toObject$7 = toObject$u;
var fails$a = fails$Y;

var aTypedArray$7 = ArrayBufferViewCore$7.aTypedArray;
var exportTypedArrayMethod$8 = ArrayBufferViewCore$7.exportTypedArrayMethod;

var FORCED$6 = fails$a(function () {
  // eslint-disable-next-line no-undef
  new Int8Array(1).set({});
});

// `%TypedArray%.prototype.set` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
exportTypedArrayMethod$8('set', function set(arrayLike /* , offset */) {
  aTypedArray$7(this);
  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
  var length = this.length;
  var src = toObject$7(arrayLike);
  var len = toLength$6(src.length);
  var index = 0;
  if (len + offset > length) throw RangeError('Wrong length');
  while (index < len) this[offset + index] = src[index++];
}, FORCED$6);

var ArrayBufferViewCore$6 = arrayBufferViewCore;
var speciesConstructor$b = speciesConstructor$j;
var fails$9 = fails$Y;

var aTypedArray$6 = ArrayBufferViewCore$6.aTypedArray;
var aTypedArrayConstructor$1 = ArrayBufferViewCore$6.aTypedArrayConstructor;
var exportTypedArrayMethod$7 = ArrayBufferViewCore$6.exportTypedArrayMethod;
var $slice$1 = [].slice;

var FORCED$5 = fails$9(function () {
  // eslint-disable-next-line no-undef
  new Int8Array(1).slice();
});

// `%TypedArray%.prototype.slice` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
exportTypedArrayMethod$7('slice', function slice(start, end) {
  var list = $slice$1.call(aTypedArray$6(this), start, end);
  var C = speciesConstructor$b(this, this.constructor);
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor$1(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
}, FORCED$5);

var ArrayBufferViewCore$5 = arrayBufferViewCore;
var $some$1 = arrayIteration.some;

var aTypedArray$5 = ArrayBufferViewCore$5.aTypedArray;
var exportTypedArrayMethod$6 = ArrayBufferViewCore$5.exportTypedArrayMethod;

// `%TypedArray%.prototype.some` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
exportTypedArrayMethod$6('some', function some(callbackfn /* , thisArg */) {
  return $some$1(aTypedArray$5(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
});

var ArrayBufferViewCore$4 = arrayBufferViewCore;

var aTypedArray$4 = ArrayBufferViewCore$4.aTypedArray;
var exportTypedArrayMethod$5 = ArrayBufferViewCore$4.exportTypedArrayMethod;
var $sort = [].sort;

// `%TypedArray%.prototype.sort` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.sort
exportTypedArrayMethod$5('sort', function sort(comparefn) {
  return $sort.call(aTypedArray$4(this), comparefn);
});

var ArrayBufferViewCore$3 = arrayBufferViewCore;
var toLength$5 = toLength$y;
var toAbsoluteIndex = toAbsoluteIndex$8;
var speciesConstructor$a = speciesConstructor$j;

var aTypedArray$3 = ArrayBufferViewCore$3.aTypedArray;
var exportTypedArrayMethod$4 = ArrayBufferViewCore$3.exportTypedArrayMethod;

// `%TypedArray%.prototype.subarray` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.subarray
exportTypedArrayMethod$4('subarray', function subarray(begin, end) {
  var O = aTypedArray$3(this);
  var length = O.length;
  var beginIndex = toAbsoluteIndex(begin, length);
  return new (speciesConstructor$a(O, O.constructor))(
    O.buffer,
    O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
    toLength$5((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
  );
});

var global$b = global$L;
var ArrayBufferViewCore$2 = arrayBufferViewCore;
var fails$8 = fails$Y;

var Int8Array$1 = global$b.Int8Array;
var aTypedArray$2 = ArrayBufferViewCore$2.aTypedArray;
var exportTypedArrayMethod$3 = ArrayBufferViewCore$2.exportTypedArrayMethod;
var $toLocaleString = [].toLocaleString;
var $slice = [].slice;

// iOS Safari 6.x fails here
var TO_LOCALE_STRING_BUG = !!Int8Array$1 && fails$8(function () {
  $toLocaleString.call(new Int8Array$1(1));
});

var FORCED$4 = fails$8(function () {
  return [1, 2].toLocaleString() != new Int8Array$1([1, 2]).toLocaleString();
}) || !fails$8(function () {
  Int8Array$1.prototype.toLocaleString.call([1, 2]);
});

// `%TypedArray%.prototype.toLocaleString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
exportTypedArrayMethod$3('toLocaleString', function toLocaleString() {
  return $toLocaleString.apply(TO_LOCALE_STRING_BUG ? $slice.call(aTypedArray$2(this)) : aTypedArray$2(this), arguments);
}, FORCED$4);

var exportTypedArrayMethod$2 = arrayBufferViewCore.exportTypedArrayMethod;
var fails$7 = fails$Y;
var global$a = global$L;

var Uint8Array = global$a.Uint8Array;
var Uint8ArrayPrototype = Uint8Array && Uint8Array.prototype || {};
var arrayToString = [].toString;
var arrayJoin = [].join;

if (fails$7(function () { arrayToString.call({}); })) {
  arrayToString = function toString() {
    return arrayJoin.call(this);
  };
}

var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString;

// `%TypedArray%.prototype.toString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
exportTypedArrayMethod$2('toString', arrayToString, IS_NOT_ARRAY_METHOD);

var $$24 = _export;
var getBuiltIn$j = getBuiltIn$t;
var aFunction$D = aFunction$R;
var anObject$1d = anObject$1z;
var fails$6 = fails$Y;

var nativeApply = getBuiltIn$j('Reflect', 'apply');
var functionApply = Function.apply;

// MS Edge argumentsList argument is optional
var OPTIONAL_ARGUMENTS_LIST = !fails$6(function () {
  nativeApply(function () { /* empty */ });
});

// `Reflect.apply` method
// https://tc39.es/ecma262/#sec-reflect.apply
$$24({ target: 'Reflect', stat: true, forced: OPTIONAL_ARGUMENTS_LIST }, {
  apply: function apply(target, thisArgument, argumentsList) {
    aFunction$D(target);
    anObject$1d(argumentsList);
    return nativeApply
      ? nativeApply(target, thisArgument, argumentsList)
      : functionApply.call(target, thisArgument, argumentsList);
  }
});

var $$23 = _export;
var getBuiltIn$i = getBuiltIn$t;
var aFunction$C = aFunction$R;
var anObject$1c = anObject$1z;
var isObject$6 = isObject$B;
var create$5 = objectCreate;
var bind$e = functionBind;
var fails$5 = fails$Y;

var nativeConstruct = getBuiltIn$i('Reflect', 'construct');

// `Reflect.construct` method
// https://tc39.es/ecma262/#sec-reflect.construct
// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails$5(function () {
  function F() { /* empty */ }
  return !(nativeConstruct(function () { /* empty */ }, [], F) instanceof F);
});
var ARGS_BUG = !fails$5(function () {
  nativeConstruct(function () { /* empty */ });
});
var FORCED$3 = NEW_TARGET_BUG || ARGS_BUG;

$$23({ target: 'Reflect', stat: true, forced: FORCED$3, sham: FORCED$3 }, {
  construct: function construct(Target, args /* , newTarget */) {
    aFunction$C(Target);
    anObject$1c(args);
    var newTarget = arguments.length < 3 ? Target : aFunction$C(arguments[2]);
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
      return new (bind$e.apply(Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = create$5(isObject$6(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return isObject$6(result) ? result : instance;
  }
});

var $$22 = _export;
var DESCRIPTORS$6 = descriptors;
var anObject$1b = anObject$1z;
var toPrimitive = toPrimitive$b;
var definePropertyModule$1 = objectDefineProperty;
var fails$4 = fails$Y;

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
var ERROR_INSTEAD_OF_FALSE = fails$4(function () {
  // eslint-disable-next-line no-undef
  Reflect.defineProperty(definePropertyModule$1.f({}, 1, { value: 1 }), 1, { value: 2 });
});

// `Reflect.defineProperty` method
// https://tc39.es/ecma262/#sec-reflect.defineproperty
$$22({ target: 'Reflect', stat: true, forced: ERROR_INSTEAD_OF_FALSE, sham: !DESCRIPTORS$6 }, {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    anObject$1b(target);
    var key = toPrimitive(propertyKey, true);
    anObject$1b(attributes);
    try {
      definePropertyModule$1.f(target, key, attributes);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$21 = _export;
var anObject$1a = anObject$1z;
var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

// `Reflect.deleteProperty` method
// https://tc39.es/ecma262/#sec-reflect.deleteproperty
$$21({ target: 'Reflect', stat: true }, {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var descriptor = getOwnPropertyDescriptor(anObject$1a(target), propertyKey);
    return descriptor && !descriptor.configurable ? false : delete target[propertyKey];
  }
});

var $$20 = _export;
var isObject$5 = isObject$B;
var anObject$19 = anObject$1z;
var has$6 = has$o;
var getOwnPropertyDescriptorModule$2 = objectGetOwnPropertyDescriptor;
var getPrototypeOf$5 = objectGetPrototypeOf$1;

// `Reflect.get` method
// https://tc39.es/ecma262/#sec-reflect.get
function get(target, propertyKey /* , receiver */) {
  var receiver = arguments.length < 3 ? target : arguments[2];
  var descriptor, prototype;
  if (anObject$19(target) === receiver) return target[propertyKey];
  if (descriptor = getOwnPropertyDescriptorModule$2.f(target, propertyKey)) return has$6(descriptor, 'value')
    ? descriptor.value
    : descriptor.get === undefined
      ? undefined
      : descriptor.get.call(receiver);
  if (isObject$5(prototype = getPrototypeOf$5(target))) return get(prototype, propertyKey, receiver);
}

$$20({ target: 'Reflect', stat: true }, {
  get: get
});

var $$1$ = _export;
var DESCRIPTORS$5 = descriptors;
var anObject$18 = anObject$1z;
var getOwnPropertyDescriptorModule$1 = objectGetOwnPropertyDescriptor;

// `Reflect.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-reflect.getownpropertydescriptor
$$1$({ target: 'Reflect', stat: true, sham: !DESCRIPTORS$5 }, {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return getOwnPropertyDescriptorModule$1.f(anObject$18(target), propertyKey);
  }
});

var $$1_ = _export;
var anObject$17 = anObject$1z;
var objectGetPrototypeOf = objectGetPrototypeOf$1;
var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

// `Reflect.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.getprototypeof
$$1_({ target: 'Reflect', stat: true, sham: !CORRECT_PROTOTYPE_GETTER }, {
  getPrototypeOf: function getPrototypeOf(target) {
    return objectGetPrototypeOf(anObject$17(target));
  }
});

var $$1Z = _export;

// `Reflect.has` method
// https://tc39.es/ecma262/#sec-reflect.has
$$1Z({ target: 'Reflect', stat: true }, {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});

var $$1Y = _export;
var anObject$16 = anObject$1z;

var objectIsExtensible = Object.isExtensible;

// `Reflect.isExtensible` method
// https://tc39.es/ecma262/#sec-reflect.isextensible
$$1Y({ target: 'Reflect', stat: true }, {
  isExtensible: function isExtensible(target) {
    anObject$16(target);
    return objectIsExtensible ? objectIsExtensible(target) : true;
  }
});

var $$1X = _export;
var ownKeys = ownKeys$3;

// `Reflect.ownKeys` method
// https://tc39.es/ecma262/#sec-reflect.ownkeys
$$1X({ target: 'Reflect', stat: true }, {
  ownKeys: ownKeys
});

var $$1W = _export;
var getBuiltIn$h = getBuiltIn$t;
var anObject$15 = anObject$1z;
var FREEZING = freezing;

// `Reflect.preventExtensions` method
// https://tc39.es/ecma262/#sec-reflect.preventextensions
$$1W({ target: 'Reflect', stat: true, sham: !FREEZING }, {
  preventExtensions: function preventExtensions(target) {
    anObject$15(target);
    try {
      var objectPreventExtensions = getBuiltIn$h('Object', 'preventExtensions');
      if (objectPreventExtensions) objectPreventExtensions(target);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$1V = _export;
var anObject$14 = anObject$1z;
var isObject$4 = isObject$B;
var has$5 = has$o;
var fails$3 = fails$Y;
var definePropertyModule = objectDefineProperty;
var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
var getPrototypeOf$4 = objectGetPrototypeOf$1;
var createPropertyDescriptor$1 = createPropertyDescriptor$9;

// `Reflect.set` method
// https://tc39.es/ecma262/#sec-reflect.set
function set(target, propertyKey, V /* , receiver */) {
  var receiver = arguments.length < 4 ? target : arguments[3];
  var ownDescriptor = getOwnPropertyDescriptorModule.f(anObject$14(target), propertyKey);
  var existingDescriptor, prototype;
  if (!ownDescriptor) {
    if (isObject$4(prototype = getPrototypeOf$4(target))) {
      return set(prototype, propertyKey, V, receiver);
    }
    ownDescriptor = createPropertyDescriptor$1(0);
  }
  if (has$5(ownDescriptor, 'value')) {
    if (ownDescriptor.writable === false || !isObject$4(receiver)) return false;
    if (existingDescriptor = getOwnPropertyDescriptorModule.f(receiver, propertyKey)) {
      if (existingDescriptor.get || existingDescriptor.set || existingDescriptor.writable === false) return false;
      existingDescriptor.value = V;
      definePropertyModule.f(receiver, propertyKey, existingDescriptor);
    } else definePropertyModule.f(receiver, propertyKey, createPropertyDescriptor$1(0, V));
    return true;
  }
  return ownDescriptor.set === undefined ? false : (ownDescriptor.set.call(receiver, V), true);
}

// MS Edge 17-18 Reflect.set allows setting the property to object
// with non-writable property on the prototype
var MS_EDGE_BUG = fails$3(function () {
  var Constructor = function () { /* empty */ };
  var object = definePropertyModule.f(new Constructor(), 'a', { configurable: true });
  // eslint-disable-next-line no-undef
  return Reflect.set(Constructor.prototype, 'a', 1, object) !== false;
});

$$1V({ target: 'Reflect', stat: true, forced: MS_EDGE_BUG }, {
  set: set
});

var $$1U = _export;
var anObject$13 = anObject$1z;
var aPossiblePrototype = aPossiblePrototype$2;
var objectSetPrototypeOf = objectSetPrototypeOf$1;

// `Reflect.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-reflect.setprototypeof
if (objectSetPrototypeOf) $$1U({ target: 'Reflect', stat: true }, {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    anObject$13(target);
    aPossiblePrototype(proto);
    try {
      objectSetPrototypeOf(target, proto);
      return true;
    } catch (error) {
      return false;
    }
  }
});

var $$1T = _export;
var global$9 = global$L;
var setToStringTag$2 = setToStringTag$b;

$$1T({ global: true }, { Reflect: {} });

// Reflect[@@toStringTag] property
// https://tc39.es/ecma262/#sec-reflect-@@tostringtag
setToStringTag$2(global$9.Reflect, 'Reflect', true);

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
var Map$2 = es_map;
var WeakMap$1 = es_weakMap.exports;
var shared$1 = shared$6.exports;

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

var $$1S = _export;
var ReflectMetadataModule$8 = reflectMetadata;
var anObject$12 = anObject$1z;

var toMetadataKey$8 = ReflectMetadataModule$8.toKey;
var ordinaryDefineOwnMetadata$1 = ReflectMetadataModule$8.set;

// `Reflect.defineMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$1S({ target: 'Reflect', stat: true }, {
  defineMetadata: function defineMetadata(metadataKey, metadataValue, target /* , targetKey */) {
    var targetKey = arguments.length < 4 ? undefined : toMetadataKey$8(arguments[3]);
    ordinaryDefineOwnMetadata$1(metadataKey, metadataValue, anObject$12(target), targetKey);
  }
});

var $$1R = _export;
var ReflectMetadataModule$7 = reflectMetadata;
var anObject$11 = anObject$1z;

var toMetadataKey$7 = ReflectMetadataModule$7.toKey;
var getOrCreateMetadataMap = ReflectMetadataModule$7.getMap;
var store = ReflectMetadataModule$7.store;

// `Reflect.deleteMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$1R({ target: 'Reflect', stat: true }, {
  deleteMetadata: function deleteMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$7(arguments[2]);
    var metadataMap = getOrCreateMetadataMap(anObject$11(target), targetKey, false);
    if (metadataMap === undefined || !metadataMap['delete'](metadataKey)) return false;
    if (metadataMap.size) return true;
    var targetMetadata = store.get(target);
    targetMetadata['delete'](targetKey);
    return !!targetMetadata.size || store['delete'](target);
  }
});

var $$1Q = _export;
var ReflectMetadataModule$6 = reflectMetadata;
var anObject$10 = anObject$1z;
var getPrototypeOf$3 = objectGetPrototypeOf$1;

var ordinaryHasOwnMetadata$2 = ReflectMetadataModule$6.has;
var ordinaryGetOwnMetadata$1 = ReflectMetadataModule$6.get;
var toMetadataKey$6 = ReflectMetadataModule$6.toKey;

var ordinaryGetMetadata = function (MetadataKey, O, P) {
  var hasOwn = ordinaryHasOwnMetadata$2(MetadataKey, O, P);
  if (hasOwn) return ordinaryGetOwnMetadata$1(MetadataKey, O, P);
  var parent = getPrototypeOf$3(O);
  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
};

// `Reflect.getMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$1Q({ target: 'Reflect', stat: true }, {
  getMetadata: function getMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$6(arguments[2]);
    return ordinaryGetMetadata(metadataKey, anObject$10(target), targetKey);
  }
});

var $$1P = _export;
// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
var Set$1 = es_set;
var ReflectMetadataModule$5 = reflectMetadata;
var anObject$$ = anObject$1z;
var getPrototypeOf$2 = objectGetPrototypeOf$1;
var iterate$z = iterate$I;

var ordinaryOwnMetadataKeys$1 = ReflectMetadataModule$5.keys;
var toMetadataKey$5 = ReflectMetadataModule$5.toKey;

var from$4 = function (iter) {
  var result = [];
  iterate$z(iter, result.push, { that: result });
  return result;
};

var ordinaryMetadataKeys = function (O, P) {
  var oKeys = ordinaryOwnMetadataKeys$1(O, P);
  var parent = getPrototypeOf$2(O);
  if (parent === null) return oKeys;
  var pKeys = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? from$4(new Set$1(oKeys.concat(pKeys))) : pKeys : oKeys;
};

// `Reflect.getMetadataKeys` method
// https://github.com/rbuckton/reflect-metadata
$$1P({ target: 'Reflect', stat: true }, {
  getMetadataKeys: function getMetadataKeys(target /* , targetKey */) {
    var targetKey = arguments.length < 2 ? undefined : toMetadataKey$5(arguments[1]);
    return ordinaryMetadataKeys(anObject$$(target), targetKey);
  }
});

var $$1O = _export;
var ReflectMetadataModule$4 = reflectMetadata;
var anObject$_ = anObject$1z;

var ordinaryGetOwnMetadata = ReflectMetadataModule$4.get;
var toMetadataKey$4 = ReflectMetadataModule$4.toKey;

// `Reflect.getOwnMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$1O({ target: 'Reflect', stat: true }, {
  getOwnMetadata: function getOwnMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$4(arguments[2]);
    return ordinaryGetOwnMetadata(metadataKey, anObject$_(target), targetKey);
  }
});

var $$1N = _export;
var ReflectMetadataModule$3 = reflectMetadata;
var anObject$Z = anObject$1z;

var ordinaryOwnMetadataKeys = ReflectMetadataModule$3.keys;
var toMetadataKey$3 = ReflectMetadataModule$3.toKey;

// `Reflect.getOwnMetadataKeys` method
// https://github.com/rbuckton/reflect-metadata
$$1N({ target: 'Reflect', stat: true }, {
  getOwnMetadataKeys: function getOwnMetadataKeys(target /* , targetKey */) {
    var targetKey = arguments.length < 2 ? undefined : toMetadataKey$3(arguments[1]);
    return ordinaryOwnMetadataKeys(anObject$Z(target), targetKey);
  }
});

var $$1M = _export;
var ReflectMetadataModule$2 = reflectMetadata;
var anObject$Y = anObject$1z;
var getPrototypeOf$1 = objectGetPrototypeOf$1;

var ordinaryHasOwnMetadata$1 = ReflectMetadataModule$2.has;
var toMetadataKey$2 = ReflectMetadataModule$2.toKey;

var ordinaryHasMetadata = function (MetadataKey, O, P) {
  var hasOwn = ordinaryHasOwnMetadata$1(MetadataKey, O, P);
  if (hasOwn) return true;
  var parent = getPrototypeOf$1(O);
  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
};

// `Reflect.hasMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$1M({ target: 'Reflect', stat: true }, {
  hasMetadata: function hasMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$2(arguments[2]);
    return ordinaryHasMetadata(metadataKey, anObject$Y(target), targetKey);
  }
});

var $$1L = _export;
var ReflectMetadataModule$1 = reflectMetadata;
var anObject$X = anObject$1z;

var ordinaryHasOwnMetadata = ReflectMetadataModule$1.has;
var toMetadataKey$1 = ReflectMetadataModule$1.toKey;

// `Reflect.hasOwnMetadata` method
// https://github.com/rbuckton/reflect-metadata
$$1L({ target: 'Reflect', stat: true }, {
  hasOwnMetadata: function hasOwnMetadata(metadataKey, target /* , targetKey */) {
    var targetKey = arguments.length < 3 ? undefined : toMetadataKey$1(arguments[2]);
    return ordinaryHasOwnMetadata(metadataKey, anObject$X(target), targetKey);
  }
});

var $$1K = _export;
var ReflectMetadataModule = reflectMetadata;
var anObject$W = anObject$1z;

var toMetadataKey = ReflectMetadataModule.toKey;
var ordinaryDefineOwnMetadata = ReflectMetadataModule.set;

// `Reflect.metadata` method
// https://github.com/rbuckton/reflect-metadata
$$1K({ target: 'Reflect', stat: true }, {
  metadata: function metadata(metadataKey, metadataValue) {
    return function decorator(target, key) {
      ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject$W(target), toMetadataKey(key));
    };
  }
});

var $$1J = _export;

// `Math.iaddh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$1J({ target: 'Math', stat: true }, {
  iaddh: function iaddh(x0, x1, y0, y1) {
    var $x0 = x0 >>> 0;
    var $x1 = x1 >>> 0;
    var $y0 = y0 >>> 0;
    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
  }
});

var $$1I = _export;

// `Math.isubh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$1I({ target: 'Math', stat: true }, {
  isubh: function isubh(x0, x1, y0, y1) {
    var $x0 = x0 >>> 0;
    var $x1 = x1 >>> 0;
    var $y0 = y0 >>> 0;
    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
  }
});

var $$1H = _export;

// `Math.imulh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$1H({ target: 'Math', stat: true }, {
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

var $$1G = _export;

// `Math.umulh` method
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
// TODO: Remove from `core-js@4`
$$1G({ target: 'Math', stat: true }, {
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

var $$1F = _export;
var charAt$1 = stringMultibyte.charAt;
var fails$2 = fails$Y;

var FORCED$2 = fails$2(function () {
  return '𠮷'.at(0) !== '𠮷';
});

// `String.prototype.at` method
// https://github.com/mathiasbynens/String.prototype.at
$$1F({ target: 'String', proto: true, forced: FORCED$2 }, {
  at: function at(pos) {
    return charAt$1(this, pos);
  }
});

var fails$1 = fails$Y;
var wellKnownSymbol$9 = wellKnownSymbol$C;
var IS_PURE$C = isPure;

var ITERATOR$2 = wellKnownSymbol$9('iterator');

var nativeUrl = !fails$1(function () {
  var url = new URL('b?a=1&b=2&c=3', 'http://a');
  var searchParams = url.searchParams;
  var result = '';
  url.pathname = 'c%20d';
  searchParams.forEach(function (value, key) {
    searchParams['delete']('b');
    result += key + value;
  });
  return (IS_PURE$C && !url.toJSON)
    || !searchParams.sort
    || url.href !== 'http://a/c%20d?a=1&c=3'
    || searchParams.get('c') !== '3'
    || String(new URLSearchParams('?a=1')) !== 'a=1'
    || !searchParams[ITERATOR$2]
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

var anObject$V = anObject$1z;
var getIteratorMethod$4 = getIteratorMethod$8;

var getIterator$3 = function (it) {
  var iteratorMethod = getIteratorMethod$4(it);
  if (typeof iteratorMethod != 'function') {
    throw TypeError(String(it) + ' is not iterable');
  } return anObject$V(iteratorMethod.call(it));
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

var $$1E = _export;
var getBuiltIn$g = getBuiltIn$t;
var USE_NATIVE_URL$1 = nativeUrl;
var redefine$1 = redefine$g.exports;
var redefineAll$3 = redefineAll$9;
var setToStringTag$1 = setToStringTag$b;
var createIteratorConstructor$4 = createIteratorConstructor$7;
var InternalStateModule$8 = internalState;
var anInstance$4 = anInstance$b;
var hasOwn = has$o;
var bind$d = functionBindContext;
var classof = classof$b;
var anObject$U = anObject$1z;
var isObject$3 = isObject$B;
var create$4 = objectCreate;
var createPropertyDescriptor = createPropertyDescriptor$9;
var getIterator$2 = getIterator$3;
var getIteratorMethod$3 = getIteratorMethod$8;
var wellKnownSymbol$8 = wellKnownSymbol$C;

var $fetch = getBuiltIn$g('fetch');
var Headers = getBuiltIn$g('Headers');
var ITERATOR$1 = wellKnownSymbol$8('iterator');
var URL_SEARCH_PARAMS = 'URLSearchParams';
var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
var setInternalState$8 = InternalStateModule$8.set;
var getInternalParamsState = InternalStateModule$8.getterFor(URL_SEARCH_PARAMS);
var getInternalIteratorState = InternalStateModule$8.getterFor(URL_SEARCH_PARAMS_ITERATOR);

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

var URLSearchParamsIterator = createIteratorConstructor$4(function Iterator(params, kind) {
  setInternalState$8(this, {
    type: URL_SEARCH_PARAMS_ITERATOR,
    iterator: getIterator$2(getInternalParamsState(params).entries),
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
  anInstance$4(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
  var init = arguments.length > 0 ? arguments[0] : undefined;
  var that = this;
  var entries = [];
  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;

  setInternalState$8(that, {
    type: URL_SEARCH_PARAMS,
    entries: entries,
    updateURL: function () { /* empty */ },
    updateSearchParams: updateSearchParams
  });

  if (init !== undefined) {
    if (isObject$3(init)) {
      iteratorMethod = getIteratorMethod$3(init);
      if (typeof iteratorMethod === 'function') {
        iterator = iteratorMethod.call(init);
        next = iterator.next;
        while (!(step = next.call(iterator)).done) {
          entryIterator = getIterator$2(anObject$U(step.value));
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

redefineAll$3(URLSearchParamsPrototype, {
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
    var boundFunction = bind$d(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
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
redefine$1(URLSearchParamsPrototype, ITERATOR$1, URLSearchParamsPrototype.entries);

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

$$1E({ global: true, forced: !USE_NATIVE_URL$1 }, {
  URLSearchParams: URLSearchParamsConstructor
});

// Wrap `fetch` for correct work with polyfilled `URLSearchParams`
// https://github.com/zloirock/core-js/issues/674
if (!USE_NATIVE_URL$1 && typeof $fetch == 'function' && typeof Headers == 'function') {
  $$1E({ global: true, enumerable: true, forced: true }, {
    fetch: function fetch(input /* , init */) {
      var args = [input];
      var init, body, headers;
      if (arguments.length > 1) {
        init = arguments[1];
        if (isObject$3(init)) {
          body = init.body;
          if (classof(body) === URL_SEARCH_PARAMS) {
            headers = init.headers ? new Headers(init.headers) : new Headers();
            if (!headers.has('content-type')) {
              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
            }
            init = create$4(init, {
              body: createPropertyDescriptor(0, String(body)),
              headers: createPropertyDescriptor(0, headers)
            });
          }
        }
        args.push(init);
      } return $fetch.apply(this, args);
    }
  });
}

var web_urlSearchParams = {
  URLSearchParams: URLSearchParamsConstructor,
  getState: getInternalParamsState
};

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

var $$1D = _export;
var DESCRIPTORS$4 = descriptors;
var USE_NATIVE_URL = nativeUrl;
var global$8 = global$L;
var defineProperties$1 = objectDefineProperties;
var redefine = redefine$g.exports;
var anInstance$3 = anInstance$b;
var has$4 = has$o;
var assign = objectAssign;
var arrayFrom = arrayFrom$1;
var codeAt$1 = stringMultibyte.codeAt;
var toASCII = stringPunycodeToAscii;
var setToStringTag = setToStringTag$b;
var URLSearchParamsModule = web_urlSearchParams;
var InternalStateModule$7 = internalState;

var NativeURL = global$8.URL;
var URLSearchParams$1 = URLSearchParamsModule.URLSearchParams;
var getInternalSearchParamsState = URLSearchParamsModule.getState;
var setInternalState$7 = InternalStateModule$7.set;
var getInternalURLState = InternalStateModule$7.getterFor('URL');
var floor = Math.floor;
var pow = Math.pow;

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

var percentEncode = function (char, set) {
  var code = codeAt$1(char, 0);
  return code > 0x20 && code < 0x7F && !has$4(set, char) ? char : encodeURIComponent(char);
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
  return has$4(specialSchemes, url.scheme);
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

  codePoints = arrayFrom(input);

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
            (isSpecial(url) != has$4(specialSchemes, buffer)) ||
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
          char == EOF || char == '/' || char == '?' || char == '#' ||
          (char == '\\' && isSpecial(url))
        ) {
          if (seenAt && buffer == '') return INVALID_AUTHORITY;
          pointer -= arrayFrom(buffer).length + 1;
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
  var that = anInstance$3(this, URLConstructor, 'URL');
  var base = arguments.length > 1 ? arguments[1] : undefined;
  var urlString = String(url);
  var state = setInternalState$7(that, { type: 'URL' });
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
  if (!DESCRIPTORS$4) {
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

if (DESCRIPTORS$4) {
  defineProperties$1(URLPrototype, {
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
      var codePoints = arrayFrom(String(username));
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
      var codePoints = arrayFrom(String(password));
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
  // eslint-disable-next-line no-unused-vars
  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
    return nativeCreateObjectURL.apply(NativeURL, arguments);
  });
  // `URL.revokeObjectURL` method
  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
  // eslint-disable-next-line no-unused-vars
  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
    return nativeRevokeObjectURL.apply(NativeURL, arguments);
  });
}

setToStringTag(URLConstructor, 'URL');

$$1D({ global: true, forced: !USE_NATIVE_URL, sham: !DESCRIPTORS$4 }, {
  URL: URLConstructor
});

var $$1C = _export;

// `URL.prototype.toJSON` method
// https://url.spec.whatwg.org/#dom-url-tojson
$$1C({ target: 'URL', proto: true, enumerable: true }, {
  toJSON: function toJSON() {
    return URL.prototype.toString.call(this);
  }
});

var $$1B = _export;
var $filterOut$1 = arrayIteration.filterOut;
var addToUnscopables$4 = addToUnscopables$d;

// `Array.prototype.filterOut` method
// https://github.com/tc39/proposal-array-filtering
$$1B({ target: 'Array', proto: true }, {
  filterOut: function filterOut(callbackfn /* , thisArg */) {
    return $filterOut$1(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$4('filterOut');

var ArrayBufferViewCore$1 = arrayBufferViewCore;
var $filterOut = arrayIteration.filterOut;
var speciesConstructor$9 = speciesConstructor$j;

var aTypedArray$1 = ArrayBufferViewCore$1.aTypedArray;
var aTypedArrayConstructor = ArrayBufferViewCore$1.aTypedArrayConstructor;
var exportTypedArrayMethod$1 = ArrayBufferViewCore$1.exportTypedArrayMethod;

// `%TypedArray%.prototype.filterOut` method
// https://github.com/tc39/proposal-array-filtering
exportTypedArrayMethod$1('filterOut', function filterOut(callbackfn /* , thisArg */) {
  var list = $filterOut(aTypedArray$1(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  var C = speciesConstructor$9(this, this.constructor);
  var index = 0;
  var length = list.length;
  var result = new (aTypedArrayConstructor(C))(length);
  while (length > index) result[index] = list[index++];
  return result;
});

var DESCRIPTORS$3 = descriptors;
var addToUnscopables$3 = addToUnscopables$d;
var toObject$6 = toObject$u;
var toLength$4 = toLength$y;
var defineProperty$2 = objectDefineProperty.f;

// `Array.prototype.lastIndex` getter
// https://github.com/keithamus/proposal-array-last
if (DESCRIPTORS$3 && !('lastIndex' in [])) {
  defineProperty$2(Array.prototype, 'lastIndex', {
    configurable: true,
    get: function lastIndex() {
      var O = toObject$6(this);
      var len = toLength$4(O.length);
      return len == 0 ? 0 : len - 1;
    }
  });

  addToUnscopables$3('lastIndex');
}

var DESCRIPTORS$2 = descriptors;
var addToUnscopables$2 = addToUnscopables$d;
var toObject$5 = toObject$u;
var toLength$3 = toLength$y;
var defineProperty$1 = objectDefineProperty.f;

// `Array.prototype.lastIndex` accessor
// https://github.com/keithamus/proposal-array-last
if (DESCRIPTORS$2 && !('lastItem' in [])) {
  defineProperty$1(Array.prototype, 'lastItem', {
    configurable: true,
    get: function lastItem() {
      var O = toObject$5(this);
      var len = toLength$3(O.length);
      return len == 0 ? undefined : O[len - 1];
    },
    set: function lastItem(value) {
      var O = toObject$5(this);
      var len = toLength$3(O.length);
      return O[len == 0 ? 0 : len - 1] = value;
    }
  });

  addToUnscopables$2('lastItem');
}

var $$1A = _export;
var toLength$2 = toLength$y;
var toObject$4 = toObject$u;
var getBuiltIn$f = getBuiltIn$t;
var arraySpeciesCreate = arraySpeciesCreate$6;
var addToUnscopables$1 = addToUnscopables$d;

var push$2 = [].push;

// `Array.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
$$1A({ target: 'Array', proto: true }, {
  uniqueBy: function uniqueBy(resolver) {
    var that = toObject$4(this);
    var length = toLength$2(that.length);
    var result = arraySpeciesCreate(that, 0);
    var Map = getBuiltIn$f('Map');
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
      push$2.call(result, value);
    });
    return result;
  }
});

addToUnscopables$1('uniqueBy');

var $$1z = _export;
var iterate$y = iterate$I;
var aFunction$B = aFunction$R;

// `Map.groupBy` method
// https://github.com/tc39/proposal-collection-methods
$$1z({ target: 'Map', stat: true }, {
  groupBy: function groupBy(iterable, keyDerivative) {
    var newMap = new this();
    aFunction$B(keyDerivative);
    var has = aFunction$B(newMap.has);
    var get = aFunction$B(newMap.get);
    var set = aFunction$B(newMap.set);
    iterate$y(iterable, function (element) {
      var derivedKey = keyDerivative(element);
      if (!has.call(newMap, derivedKey)) set.call(newMap, derivedKey, [element]);
      else get.call(newMap, derivedKey).push(element);
    });
    return newMap;
  }
});

var $$1y = _export;
var iterate$x = iterate$I;
var aFunction$A = aFunction$R;

// `Map.keyBy` method
// https://github.com/tc39/proposal-collection-methods
$$1y({ target: 'Map', stat: true }, {
  keyBy: function keyBy(iterable, keyDerivative) {
    var newMap = new this();
    aFunction$A(keyDerivative);
    var setter = aFunction$A(newMap.set);
    iterate$x(iterable, function (element) {
      setter.call(newMap, keyDerivative(element), element);
    });
    return newMap;
  }
});

var anObject$T = anObject$1z;
var aFunction$z = aFunction$R;

// https://github.com/tc39/collection-methods
var collectionDeleteAll$4 = function (/* ...elements */) {
  var collection = anObject$T(this);
  var remover = aFunction$z(collection['delete']);
  var allDeleted = true;
  var wasDeleted;
  for (var k = 0, len = arguments.length; k < len; k++) {
    wasDeleted = remover.call(collection, arguments[k]);
    allDeleted = allDeleted && wasDeleted;
  }
  return !!allDeleted;
};

var $$1x = _export;
var IS_PURE$B = isPure;
var collectionDeleteAll$3 = collectionDeleteAll$4;

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$1x({ target: 'Map', proto: true, real: true, forced: IS_PURE$B }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll$3.apply(this, arguments);
  }
});

var getMapIterator$a = function (it) {
  // eslint-disable-next-line no-undef
  return Map.prototype.entries.call(it);
};

var $$1w = _export;
var IS_PURE$A = isPure;
var anObject$S = anObject$1z;
var bind$c = functionBindContext;
var getMapIterator$9 = getMapIterator$a;
var iterate$w = iterate$I;

// `Map.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
$$1w({ target: 'Map', proto: true, real: true, forced: IS_PURE$A }, {
  every: function every(callbackfn /* , thisArg */) {
    var map = anObject$S(this);
    var iterator = getMapIterator$9(map);
    var boundFunction = bind$c(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return !iterate$w(iterator, function (key, value, stop) {
      if (!boundFunction(value, key, map)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$1v = _export;
var IS_PURE$z = isPure;
var getBuiltIn$e = getBuiltIn$t;
var anObject$R = anObject$1z;
var aFunction$y = aFunction$R;
var bind$b = functionBindContext;
var speciesConstructor$8 = speciesConstructor$j;
var getMapIterator$8 = getMapIterator$a;
var iterate$v = iterate$I;

// `Map.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$$1v({ target: 'Map', proto: true, real: true, forced: IS_PURE$z }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var map = anObject$R(this);
    var iterator = getMapIterator$8(map);
    var boundFunction = bind$b(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor$8(map, getBuiltIn$e('Map')))();
    var setter = aFunction$y(newMap.set);
    iterate$v(iterator, function (key, value) {
      if (boundFunction(value, key, map)) setter.call(newMap, key, value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

var $$1u = _export;
var IS_PURE$y = isPure;
var anObject$Q = anObject$1z;
var bind$a = functionBindContext;
var getMapIterator$7 = getMapIterator$a;
var iterate$u = iterate$I;

// `Map.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$$1u({ target: 'Map', proto: true, real: true, forced: IS_PURE$y }, {
  find: function find(callbackfn /* , thisArg */) {
    var map = anObject$Q(this);
    var iterator = getMapIterator$7(map);
    var boundFunction = bind$a(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$u(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop(value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

var $$1t = _export;
var IS_PURE$x = isPure;
var anObject$P = anObject$1z;
var bind$9 = functionBindContext;
var getMapIterator$6 = getMapIterator$a;
var iterate$t = iterate$I;

// `Map.prototype.findKey` method
// https://github.com/tc39/proposal-collection-methods
$$1t({ target: 'Map', proto: true, real: true, forced: IS_PURE$x }, {
  findKey: function findKey(callbackfn /* , thisArg */) {
    var map = anObject$P(this);
    var iterator = getMapIterator$6(map);
    var boundFunction = bind$9(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$t(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop(key);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// `SameValueZero` abstract operation
// https://tc39.es/ecma262/#sec-samevaluezero
var sameValueZero$1 = function (x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y || x != x && y != y;
};

var $$1s = _export;
var IS_PURE$w = isPure;
var anObject$O = anObject$1z;
var getMapIterator$5 = getMapIterator$a;
var sameValueZero = sameValueZero$1;
var iterate$s = iterate$I;

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
$$1s({ target: 'Map', proto: true, real: true, forced: IS_PURE$w }, {
  includes: function includes(searchElement) {
    return iterate$s(getMapIterator$5(anObject$O(this)), function (key, value, stop) {
      if (sameValueZero(value, searchElement)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$1r = _export;
var IS_PURE$v = isPure;
var anObject$N = anObject$1z;
var getMapIterator$4 = getMapIterator$a;
var iterate$r = iterate$I;

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
$$1r({ target: 'Map', proto: true, real: true, forced: IS_PURE$v }, {
  keyOf: function keyOf(searchElement) {
    return iterate$r(getMapIterator$4(anObject$N(this)), function (key, value, stop) {
      if (value === searchElement) return stop(key);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

var $$1q = _export;
var IS_PURE$u = isPure;
var getBuiltIn$d = getBuiltIn$t;
var anObject$M = anObject$1z;
var aFunction$x = aFunction$R;
var bind$8 = functionBindContext;
var speciesConstructor$7 = speciesConstructor$j;
var getMapIterator$3 = getMapIterator$a;
var iterate$q = iterate$I;

// `Map.prototype.mapKeys` method
// https://github.com/tc39/proposal-collection-methods
$$1q({ target: 'Map', proto: true, real: true, forced: IS_PURE$u }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = anObject$M(this);
    var iterator = getMapIterator$3(map);
    var boundFunction = bind$8(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor$7(map, getBuiltIn$d('Map')))();
    var setter = aFunction$x(newMap.set);
    iterate$q(iterator, function (key, value) {
      setter.call(newMap, boundFunction(value, key, map), value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

var $$1p = _export;
var IS_PURE$t = isPure;
var getBuiltIn$c = getBuiltIn$t;
var anObject$L = anObject$1z;
var aFunction$w = aFunction$R;
var bind$7 = functionBindContext;
var speciesConstructor$6 = speciesConstructor$j;
var getMapIterator$2 = getMapIterator$a;
var iterate$p = iterate$I;

// `Map.prototype.mapValues` method
// https://github.com/tc39/proposal-collection-methods
$$1p({ target: 'Map', proto: true, real: true, forced: IS_PURE$t }, {
  mapValues: function mapValues(callbackfn /* , thisArg */) {
    var map = anObject$L(this);
    var iterator = getMapIterator$2(map);
    var boundFunction = bind$7(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor$6(map, getBuiltIn$c('Map')))();
    var setter = aFunction$w(newMap.set);
    iterate$p(iterator, function (key, value) {
      setter.call(newMap, key, boundFunction(value, key, map));
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

var $$1o = _export;
var IS_PURE$s = isPure;
var anObject$K = anObject$1z;
var aFunction$v = aFunction$R;
var iterate$o = iterate$I;

// `Map.prototype.merge` method
// https://github.com/tc39/proposal-collection-methods
$$1o({ target: 'Map', proto: true, real: true, forced: IS_PURE$s }, {
  // eslint-disable-next-line no-unused-vars
  merge: function merge(iterable /* ...iterbles */) {
    var map = anObject$K(this);
    var setter = aFunction$v(map.set);
    var i = 0;
    while (i < arguments.length) {
      iterate$o(arguments[i++], setter, { that: map, AS_ENTRIES: true });
    }
    return map;
  }
});

var $$1n = _export;
var IS_PURE$r = isPure;
var anObject$J = anObject$1z;
var aFunction$u = aFunction$R;
var getMapIterator$1 = getMapIterator$a;
var iterate$n = iterate$I;

// `Map.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$$1n({ target: 'Map', proto: true, real: true, forced: IS_PURE$r }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var map = anObject$J(this);
    var iterator = getMapIterator$1(map);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aFunction$u(callbackfn);
    iterate$n(iterator, function (key, value) {
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

var $$1m = _export;
var IS_PURE$q = isPure;
var anObject$I = anObject$1z;
var bind$6 = functionBindContext;
var getMapIterator = getMapIterator$a;
var iterate$m = iterate$I;

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
$$1m({ target: 'Map', proto: true, real: true, forced: IS_PURE$q }, {
  some: function some(callbackfn /* , thisArg */) {
    var map = anObject$I(this);
    var iterator = getMapIterator(map);
    var boundFunction = bind$6(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$m(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$1l = _export;
var IS_PURE$p = isPure;
var anObject$H = anObject$1z;
var aFunction$t = aFunction$R;

// `Set.prototype.update` method
// https://github.com/tc39/proposal-collection-methods
$$1l({ target: 'Map', proto: true, real: true, forced: IS_PURE$p }, {
  update: function update(key, callback /* , thunk */) {
    var map = anObject$H(this);
    var length = arguments.length;
    aFunction$t(callback);
    var isPresentInMap = map.has(key);
    if (!isPresentInMap && length < 3) {
      throw TypeError('Updating absent value');
    }
    var value = isPresentInMap ? map.get(key) : aFunction$t(length > 2 ? arguments[2] : undefined)(key, map);
    map.set(key, callback(value, key, map));
    return map;
  }
});

var anObject$G = anObject$1z;
var aFunction$s = aFunction$R;

// https://github.com/tc39/collection-methods
var collectionAddAll$2 = function (/* ...elements */) {
  var set = anObject$G(this);
  var adder = aFunction$s(set.add);
  for (var k = 0, len = arguments.length; k < len; k++) {
    adder.call(set, arguments[k]);
  }
  return set;
};

var $$1k = _export;
var IS_PURE$o = isPure;
var collectionAddAll$1 = collectionAddAll$2;

// `Set.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$$1k({ target: 'Set', proto: true, real: true, forced: IS_PURE$o }, {
  addAll: function addAll(/* ...elements */) {
    return collectionAddAll$1.apply(this, arguments);
  }
});

var $$1j = _export;
var IS_PURE$n = isPure;
var collectionDeleteAll$2 = collectionDeleteAll$4;

// `Set.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$1j({ target: 'Set', proto: true, real: true, forced: IS_PURE$n }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll$2.apply(this, arguments);
  }
});

var getSetIterator$7 = function (it) {
  // eslint-disable-next-line no-undef
  return Set.prototype.values.call(it);
};

var $$1i = _export;
var IS_PURE$m = isPure;
var anObject$F = anObject$1z;
var bind$5 = functionBindContext;
var getSetIterator$6 = getSetIterator$7;
var iterate$l = iterate$I;

// `Set.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
$$1i({ target: 'Set', proto: true, real: true, forced: IS_PURE$m }, {
  every: function every(callbackfn /* , thisArg */) {
    var set = anObject$F(this);
    var iterator = getSetIterator$6(set);
    var boundFunction = bind$5(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return !iterate$l(iterator, function (value, stop) {
      if (!boundFunction(value, value, set)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$1h = _export;
var IS_PURE$l = isPure;
var getBuiltIn$b = getBuiltIn$t;
var anObject$E = anObject$1z;
var aFunction$r = aFunction$R;
var bind$4 = functionBindContext;
var speciesConstructor$5 = speciesConstructor$j;
var getSetIterator$5 = getSetIterator$7;
var iterate$k = iterate$I;

// `Set.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
$$1h({ target: 'Set', proto: true, real: true, forced: IS_PURE$l }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var set = anObject$E(this);
    var iterator = getSetIterator$5(set);
    var boundFunction = bind$4(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newSet = new (speciesConstructor$5(set, getBuiltIn$b('Set')))();
    var adder = aFunction$r(newSet.add);
    iterate$k(iterator, function (value) {
      if (boundFunction(value, value, set)) adder.call(newSet, value);
    }, { IS_ITERATOR: true });
    return newSet;
  }
});

var $$1g = _export;
var IS_PURE$k = isPure;
var anObject$D = anObject$1z;
var bind$3 = functionBindContext;
var getSetIterator$4 = getSetIterator$7;
var iterate$j = iterate$I;

// `Set.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
$$1g({ target: 'Set', proto: true, real: true, forced: IS_PURE$k }, {
  find: function find(callbackfn /* , thisArg */) {
    var set = anObject$D(this);
    var iterator = getSetIterator$4(set);
    var boundFunction = bind$3(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$j(iterator, function (value, stop) {
      if (boundFunction(value, value, set)) return stop(value);
    }, { IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

var $$1f = _export;
var IS_PURE$j = isPure;
var anObject$C = anObject$1z;
var getSetIterator$3 = getSetIterator$7;
var iterate$i = iterate$I;

// `Set.prototype.join` method
// https://github.com/tc39/proposal-collection-methods
$$1f({ target: 'Set', proto: true, real: true, forced: IS_PURE$j }, {
  join: function join(separator) {
    var set = anObject$C(this);
    var iterator = getSetIterator$3(set);
    var sep = separator === undefined ? ',' : String(separator);
    var result = [];
    iterate$i(iterator, result.push, { that: result, IS_ITERATOR: true });
    return result.join(sep);
  }
});

var $$1e = _export;
var IS_PURE$i = isPure;
var getBuiltIn$a = getBuiltIn$t;
var anObject$B = anObject$1z;
var aFunction$q = aFunction$R;
var bind$2 = functionBindContext;
var speciesConstructor$4 = speciesConstructor$j;
var getSetIterator$2 = getSetIterator$7;
var iterate$h = iterate$I;

// `Set.prototype.map` method
// https://github.com/tc39/proposal-collection-methods
$$1e({ target: 'Set', proto: true, real: true, forced: IS_PURE$i }, {
  map: function map(callbackfn /* , thisArg */) {
    var set = anObject$B(this);
    var iterator = getSetIterator$2(set);
    var boundFunction = bind$2(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newSet = new (speciesConstructor$4(set, getBuiltIn$a('Set')))();
    var adder = aFunction$q(newSet.add);
    iterate$h(iterator, function (value) {
      adder.call(newSet, boundFunction(value, value, set));
    }, { IS_ITERATOR: true });
    return newSet;
  }
});

var $$1d = _export;
var IS_PURE$h = isPure;
var anObject$A = anObject$1z;
var aFunction$p = aFunction$R;
var getSetIterator$1 = getSetIterator$7;
var iterate$g = iterate$I;

// `Set.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$$1d({ target: 'Set', proto: true, real: true, forced: IS_PURE$h }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var set = anObject$A(this);
    var iterator = getSetIterator$1(set);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aFunction$p(callbackfn);
    iterate$g(iterator, function (value) {
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

var $$1c = _export;
var IS_PURE$g = isPure;
var anObject$z = anObject$1z;
var bind$1 = functionBindContext;
var getSetIterator = getSetIterator$7;
var iterate$f = iterate$I;

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
$$1c({ target: 'Set', proto: true, real: true, forced: IS_PURE$g }, {
  some: function some(callbackfn /* , thisArg */) {
    var set = anObject$z(this);
    var iterator = getSetIterator(set);
    var boundFunction = bind$1(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate$f(iterator, function (value, stop) {
      if (boundFunction(value, value, set)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$1b = _export;
var IS_PURE$f = isPure;
var collectionDeleteAll$1 = collectionDeleteAll$4;

// `WeakMap.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$1b({ target: 'WeakMap', proto: true, real: true, forced: IS_PURE$f }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll$1.apply(this, arguments);
  }
});

var $$1a = _export;
var IS_PURE$e = isPure;
var collectionAddAll = collectionAddAll$2;

// `WeakSet.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
$$1a({ target: 'WeakSet', proto: true, real: true, forced: IS_PURE$e }, {
  addAll: function addAll(/* ...elements */) {
    return collectionAddAll.apply(this, arguments);
  }
});

var $$19 = _export;
var IS_PURE$d = isPure;
var collectionDeleteAll = collectionDeleteAll$4;

// `WeakSet.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
$$19({ target: 'WeakSet', proto: true, real: true, forced: IS_PURE$d }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll.apply(this, arguments);
  }
});

// https://tc39.github.io/proposal-setmap-offrom/
var aFunction$o = aFunction$R;
var bind = functionBindContext;
var iterate$e = iterate$I;

var collectionFrom = function from(source /* , mapFn, thisArg */) {
  var length = arguments.length;
  var mapFn = length > 1 ? arguments[1] : undefined;
  var mapping, array, n, boundFunction;
  aFunction$o(this);
  mapping = mapFn !== undefined;
  if (mapping) aFunction$o(mapFn);
  if (source == undefined) return new this();
  array = [];
  if (mapping) {
    n = 0;
    boundFunction = bind(mapFn, length > 2 ? arguments[2] : undefined, 2);
    iterate$e(source, function (nextItem) {
      array.push(boundFunction(nextItem, n++));
    });
  } else {
    iterate$e(source, array.push, { that: array });
  }
  return new this(array);
};

var $$18 = _export;
var from$3 = collectionFrom;

// `Map.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.from
$$18({ target: 'Map', stat: true }, {
  from: from$3
});

// https://tc39.github.io/proposal-setmap-offrom/
var collectionOf = function of() {
  var length = arguments.length;
  var A = new Array(length);
  while (length--) A[length] = arguments[length];
  return new this(A);
};

var $$17 = _export;
var of$3 = collectionOf;

// `Map.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-map.of
$$17({ target: 'Map', stat: true }, {
  of: of$3
});

var $$16 = _export;
var from$2 = collectionFrom;

// `Set.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.from
$$16({ target: 'Set', stat: true }, {
  from: from$2
});

var $$15 = _export;
var of$2 = collectionOf;

// `Set.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-set.of
$$15({ target: 'Set', stat: true }, {
  of: of$2
});

var $$14 = _export;
var from$1 = collectionFrom;

// `WeakMap.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.from
$$14({ target: 'WeakMap', stat: true }, {
  from: from$1
});

var $$13 = _export;
var of$1 = collectionOf;

// `WeakMap.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakmap.of
$$13({ target: 'WeakMap', stat: true }, {
  of: of$1
});

var $$12 = _export;
var from = collectionFrom;

// `WeakSet.from` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.from
$$12({ target: 'WeakSet', stat: true }, {
  from: from
});

var $$11 = _export;
var of = collectionOf;

// `WeakSet.of` method
// https://tc39.github.io/proposal-setmap-offrom/#sec-weakset.of
$$11({ target: 'WeakSet', stat: true }, {
  of: of
});

// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
var Map$1 = es_map;
var WeakMap = es_weakMap.exports;
var create$3 = objectCreate;
var isObject$2 = isObject$B;

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
    ? this.objectsByIndex[i] || (this.objectsByIndex[i] = new WeakMap())
    : this.primitives || (this.primitives = new Map$1());
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

var $$10 = _export;
var getCompositeKeyNode$1 = compositeKey;
var getBuiltIn$9 = getBuiltIn$t;
var create$2 = objectCreate;

var initializer = function () {
  var freeze = getBuiltIn$9('Object', 'freeze');
  return freeze ? freeze(create$2(null)) : create$2(null);
};

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$$10({ global: true }, {
  compositeKey: function compositeKey() {
    return getCompositeKeyNode$1.apply(Object, arguments).get('object', initializer);
  }
});

var $$$ = _export;
var getCompositeKeyNode = compositeKey;
var getBuiltIn$8 = getBuiltIn$t;

// https://github.com/tc39/proposal-richer-keys/tree/master/compositeKey
$$$({ global: true }, {
  compositeSymbol: function compositeSymbol() {
    if (arguments.length === 1 && typeof arguments[0] === 'string') return getBuiltIn$8('Symbol')['for'](arguments[0]);
    return getCompositeKeyNode.apply(null, arguments).get('symbol', getBuiltIn$8('Symbol'));
  }
});

var $$_ = _export;

var min = Math.min;
var max = Math.max;

// `Math.clamp` method
// https://rwaldron.github.io/proposal-math-extensions/
$$_({ target: 'Math', stat: true }, {
  clamp: function clamp(x, lower, upper) {
    return min(upper, max(lower, x));
  }
});

var $$Z = _export;

// `Math.DEG_PER_RAD` constant
// https://rwaldron.github.io/proposal-math-extensions/
$$Z({ target: 'Math', stat: true }, {
  DEG_PER_RAD: Math.PI / 180
});

var $$Y = _export;

var RAD_PER_DEG = 180 / Math.PI;

// `Math.degrees` method
// https://rwaldron.github.io/proposal-math-extensions/
$$Y({ target: 'Math', stat: true }, {
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

var $$X = _export;

var scale$1 = mathScale;
var fround = mathFround;

// `Math.fscale` method
// https://rwaldron.github.io/proposal-math-extensions/
$$X({ target: 'Math', stat: true }, {
  fscale: function fscale(x, inLow, inHigh, outLow, outHigh) {
    return fround(scale$1(x, inLow, inHigh, outLow, outHigh));
  }
});

var $$W = _export;

// `Math.RAD_PER_DEG` constant
// https://rwaldron.github.io/proposal-math-extensions/
$$W({ target: 'Math', stat: true }, {
  RAD_PER_DEG: 180 / Math.PI
});

var $$V = _export;

var DEG_PER_RAD = Math.PI / 180;

// `Math.radians` method
// https://rwaldron.github.io/proposal-math-extensions/
$$V({ target: 'Math', stat: true }, {
  radians: function radians(degrees) {
    return degrees * DEG_PER_RAD;
  }
});

var $$U = _export;
var scale = mathScale;

// `Math.scale` method
// https://rwaldron.github.io/proposal-math-extensions/
$$U({ target: 'Math', stat: true }, {
  scale: scale
});

var $$T = _export;

// `Math.signbit` method
// https://github.com/tc39/proposal-Math.signbit
$$T({ target: 'Math', stat: true }, {
  signbit: function signbit(x) {
    return (x = +x) == x && x == 0 ? 1 / x == -Infinity : x < 0;
  }
});

var $$S = _export;
var toInteger$2 = toInteger$f;
var parseInt$1 = numberParseInt;

var INVALID_NUMBER_REPRESENTATION = 'Invalid number representation';
var INVALID_RADIX = 'Invalid radix';
var valid = /^[\da-z]+$/;

// `Number.fromString` method
// https://github.com/tc39/proposal-number-fromstring
$$S({ target: 'Number', stat: true }, {
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
    R = radix === undefined ? 10 : toInteger$2(radix);
    if (R < 2 || R > 36) throw RangeError(INVALID_RADIX);
    if (!valid.test(string) || (mathNum = parseInt$1(string, R)).toString(R) !== string) {
      throw SyntaxError(INVALID_NUMBER_REPRESENTATION);
    }
    return sign * mathNum;
  }
});

var InternalStateModule$6 = internalState;
var createIteratorConstructor$3 = createIteratorConstructor$7;
var isObject$1 = isObject$B;
var defineProperties = objectDefineProperties;
var DESCRIPTORS$1 = descriptors;

var INCORRECT_RANGE = 'Incorrect Number.range arguments';
var RANGE_ITERATOR = 'RangeIterator';

var setInternalState$6 = InternalStateModule$6.set;
var getInternalState$6 = InternalStateModule$6.getterFor(RANGE_ITERATOR);

var $RangeIterator = createIteratorConstructor$3(function RangeIterator(start, end, option, type, zero, one) {
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
  } else if (isObject$1(option)) {
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
  setInternalState$6(this, {
    type: RANGE_ITERATOR,
    start: start,
    end: end,
    step: step,
    inclusiveEnd: inclusiveEnd,
    hitsEnd: hitsEnd,
    currentCount: zero,
    zero: zero
  });
  if (!DESCRIPTORS$1) {
    this.start = start;
    this.end = end;
    this.step = step;
    this.inclusive = inclusiveEnd;
  }
}, RANGE_ITERATOR, function next() {
  var state = getInternalState$6(this);
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

if (DESCRIPTORS$1) {
  defineProperties($RangeIterator.prototype, {
    start: getter(function () {
      return getInternalState$6(this).start;
    }),
    end: getter(function () {
      return getInternalState$6(this).end;
    }),
    inclusive: getter(function () {
      return getInternalState$6(this).inclusiveEnd;
    }),
    step: getter(function () {
      return getInternalState$6(this).step;
    })
  });
}

var rangeIterator = $RangeIterator;

var $$R = _export;
var RangeIterator$1 = rangeIterator;

// `BigInt.range` method
// https://github.com/tc39/proposal-Number.range
if (typeof BigInt == 'function') {
  $$R({ target: 'BigInt', stat: true }, {
    range: function range(start, end, option) {
      // eslint-disable-next-line no-undef
      return new RangeIterator$1(start, end, option, 'bigint', BigInt(0), BigInt(1));
    }
  });
}

var $$Q = _export;
var RangeIterator = rangeIterator;

// `Number.range` method
// https://github.com/tc39/proposal-Number.range
$$Q({ target: 'Number', stat: true }, {
  range: function range(start, end, option) {
    return new RangeIterator(start, end, option, 'number', 0, 1);
  }
});

var InternalStateModule$5 = internalState;
var createIteratorConstructor$2 = createIteratorConstructor$7;
var has$3 = has$o;
var objectKeys = objectKeys$5;
var toObject$3 = toObject$u;

var OBJECT_ITERATOR = 'Object Iterator';
var setInternalState$5 = InternalStateModule$5.set;
var getInternalState$5 = InternalStateModule$5.getterFor(OBJECT_ITERATOR);

var objectIterator = createIteratorConstructor$2(function ObjectIterator(source, mode) {
  var object = toObject$3(source);
  setInternalState$5(this, {
    type: OBJECT_ITERATOR,
    mode: mode,
    object: object,
    keys: objectKeys(object),
    index: 0
  });
}, 'Object', function next() {
  var state = getInternalState$5(this);
  var keys = state.keys;
  while (true) {
    if (keys === null || state.index >= keys.length) {
      state.object = state.keys = null;
      return { value: undefined, done: true };
    }
    var key = keys[state.index++];
    var object = state.object;
    if (!has$3(object, key)) continue;
    switch (state.mode) {
      case 'keys': return { value: key, done: false };
      case 'values': return { value: object[key], done: false };
    } /* entries */ return { value: [key, object[key]], done: false };
  }
});

var $$P = _export;
var ObjectIterator$2 = objectIterator;

// `Object.iterateEntries` method
// https://github.com/tc39/proposal-object-iteration
$$P({ target: 'Object', stat: true }, {
  iterateEntries: function iterateEntries(object) {
    return new ObjectIterator$2(object, 'entries');
  }
});

var $$O = _export;
var ObjectIterator$1 = objectIterator;

// `Object.iterateKeys` method
// https://github.com/tc39/proposal-object-iteration
$$O({ target: 'Object', stat: true }, {
  iterateKeys: function iterateKeys(object) {
    return new ObjectIterator$1(object, 'keys');
  }
});

var $$N = _export;
var ObjectIterator = objectIterator;

// `Object.iterateValues` method
// https://github.com/tc39/proposal-object-iteration
$$N({ target: 'Object', stat: true }, {
  iterateValues: function iterateValues(object) {
    return new ObjectIterator(object, 'values');
  }
});

// https://github.com/tc39/proposal-observable
var $$M = _export;
var DESCRIPTORS = descriptors;
var setSpecies = setSpecies$7;
var aFunction$n = aFunction$R;
var anObject$y = anObject$1z;
var isObject = isObject$B;
var anInstance$2 = anInstance$b;
var defineProperty = objectDefineProperty.f;
var createNonEnumerableProperty$7 = createNonEnumerableProperty$m;
var redefineAll$2 = redefineAll$9;
var getIterator$1 = getIterator$3;
var iterate$d = iterate$I;
var hostReportErrors = hostReportErrors$2;
var wellKnownSymbol$7 = wellKnownSymbol$C;
var InternalStateModule$4 = internalState;

var OBSERVABLE = wellKnownSymbol$7('observable');
var getInternalState$4 = InternalStateModule$4.get;
var setInternalState$4 = InternalStateModule$4.set;

var getMethod = function (fn) {
  return fn == null ? undefined : aFunction$n(fn);
};

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

var close = function (subscription, subscriptionState) {
  if (!DESCRIPTORS) {
    subscription.closed = true;
    var subscriptionObserver = subscriptionState.subscriptionObserver;
    if (subscriptionObserver) subscriptionObserver.closed = true;
  } subscriptionState.observer = undefined;
};

var Subscription = function (observer, subscriber) {
  var subscriptionState = setInternalState$4(this, {
    cleanup: undefined,
    observer: anObject$y(observer),
    subscriptionObserver: undefined
  });
  var start;
  if (!DESCRIPTORS) this.closed = false;
  try {
    if (start = getMethod(observer.start)) start.call(observer, this);
  } catch (error) {
    hostReportErrors(error);
  }
  if (subscriptionClosed(subscriptionState)) return;
  var subscriptionObserver = subscriptionState.subscriptionObserver = new SubscriptionObserver(this);
  try {
    var cleanup = subscriber(subscriptionObserver);
    var subscription = cleanup;
    if (cleanup != null) subscriptionState.cleanup = typeof cleanup.unsubscribe === 'function'
      ? function () { subscription.unsubscribe(); }
      : aFunction$n(cleanup);
  } catch (error) {
    subscriptionObserver.error(error);
    return;
  } if (subscriptionClosed(subscriptionState)) cleanupSubscription(subscriptionState);
};

Subscription.prototype = redefineAll$2({}, {
  unsubscribe: function unsubscribe() {
    var subscriptionState = getInternalState$4(this);
    if (!subscriptionClosed(subscriptionState)) {
      close(this, subscriptionState);
      cleanupSubscription(subscriptionState);
    }
  }
});

if (DESCRIPTORS) defineProperty(Subscription.prototype, 'closed', {
  configurable: true,
  get: function () {
    return subscriptionClosed(getInternalState$4(this));
  }
});

var SubscriptionObserver = function (subscription) {
  setInternalState$4(this, { subscription: subscription });
  if (!DESCRIPTORS) this.closed = false;
};

SubscriptionObserver.prototype = redefineAll$2({}, {
  next: function next(value) {
    var subscriptionState = getInternalState$4(getInternalState$4(this).subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      try {
        var nextMethod = getMethod(observer.next);
        if (nextMethod) nextMethod.call(observer, value);
      } catch (error) {
        hostReportErrors(error);
      }
    }
  },
  error: function error(value) {
    var subscription = getInternalState$4(this).subscription;
    var subscriptionState = getInternalState$4(subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      close(subscription, subscriptionState);
      try {
        var errorMethod = getMethod(observer.error);
        if (errorMethod) errorMethod.call(observer, value);
        else hostReportErrors(value);
      } catch (err) {
        hostReportErrors(err);
      } cleanupSubscription(subscriptionState);
    }
  },
  complete: function complete() {
    var subscription = getInternalState$4(this).subscription;
    var subscriptionState = getInternalState$4(subscription);
    if (!subscriptionClosed(subscriptionState)) {
      var observer = subscriptionState.observer;
      close(subscription, subscriptionState);
      try {
        var completeMethod = getMethod(observer.complete);
        if (completeMethod) completeMethod.call(observer);
      } catch (error) {
        hostReportErrors(error);
      } cleanupSubscription(subscriptionState);
    }
  }
});

if (DESCRIPTORS) defineProperty(SubscriptionObserver.prototype, 'closed', {
  configurable: true,
  get: function () {
    return subscriptionClosed(getInternalState$4(getInternalState$4(this).subscription));
  }
});

var $Observable = function Observable(subscriber) {
  anInstance$2(this, $Observable, 'Observable');
  setInternalState$4(this, { subscriber: aFunction$n(subscriber) });
};

redefineAll$2($Observable.prototype, {
  subscribe: function subscribe(observer) {
    var length = arguments.length;
    return new Subscription(typeof observer === 'function' ? {
      next: observer,
      error: length > 1 ? arguments[1] : undefined,
      complete: length > 2 ? arguments[2] : undefined
    } : isObject(observer) ? observer : {}, getInternalState$4(this).subscriber);
  }
});

redefineAll$2($Observable, {
  from: function from(x) {
    var C = typeof this === 'function' ? this : $Observable;
    var observableMethod = getMethod(anObject$y(x)[OBSERVABLE]);
    if (observableMethod) {
      var observable = anObject$y(observableMethod.call(x));
      return observable.constructor === C ? observable : new C(function (observer) {
        return observable.subscribe(observer);
      });
    }
    var iterator = getIterator$1(x);
    return new C(function (observer) {
      iterate$d(iterator, function (it, stop) {
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

createNonEnumerableProperty$7($Observable.prototype, OBSERVABLE, function () { return this; });

$$M({ global: true }, {
  Observable: $Observable
});

setSpecies('Observable');

var defineWellKnownSymbol$4 = defineWellKnownSymbol$j;

// `Symbol.observable` well-known symbol
// https://github.com/tc39/proposal-observable
defineWellKnownSymbol$4('observable');

var defineWellKnownSymbol$3 = defineWellKnownSymbol$j;

// `Symbol.patternMatch` well-known symbol
// https://github.com/tc39/proposal-pattern-matching
defineWellKnownSymbol$3('patternMatch');

var $$L = _export;
var newPromiseCapabilityModule = newPromiseCapability$2;
var perform = perform$4;

// `Promise.try` method
// https://github.com/tc39/proposal-promise-try
$$L({ target: 'Promise', stat: true }, {
  'try': function (callbackfn) {
    var promiseCapability = newPromiseCapabilityModule.f(this);
    var result = perform(callbackfn);
    (result.error ? promiseCapability.reject : promiseCapability.resolve)(result.value);
    return promiseCapability.promise;
  }
});

var $$K = _export;
var anObject$x = anObject$1z;
var numberIsFinite = numberIsFinite$2;
var createIteratorConstructor$1 = createIteratorConstructor$7;
var InternalStateModule$3 = internalState;

var SEEDED_RANDOM = 'Seeded Random';
var SEEDED_RANDOM_GENERATOR = SEEDED_RANDOM + ' Generator';
var setInternalState$3 = InternalStateModule$3.set;
var getInternalState$3 = InternalStateModule$3.getterFor(SEEDED_RANDOM_GENERATOR);
var SEED_TYPE_ERROR = 'Math.seededPRNG() argument should have a "seed" field with a finite value.';

var $SeededRandomGenerator = createIteratorConstructor$1(function SeededRandomGenerator(seed) {
  setInternalState$3(this, {
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
$$K({ target: 'Math', stat: true, forced: true }, {
  seededPRNG: function seededPRNG(it) {
    var seed = anObject$x(it).seed;
    if (!numberIsFinite(seed)) throw TypeError(SEED_TYPE_ERROR);
    return new $SeededRandomGenerator(seed);
  }
});

var $$J = _export;
var createIteratorConstructor = createIteratorConstructor$7;
var requireObjectCoercible = requireObjectCoercible$h;
var InternalStateModule$2 = internalState;
var StringMultibyteModule = stringMultibyte;

var codeAt = StringMultibyteModule.codeAt;
var charAt = StringMultibyteModule.charAt;
var STRING_ITERATOR = 'String Iterator';
var setInternalState$2 = InternalStateModule$2.set;
var getInternalState$2 = InternalStateModule$2.getterFor(STRING_ITERATOR);

// TODO: unify with String#@@iterator
var $StringIterator = createIteratorConstructor(function StringIterator(string) {
  setInternalState$2(this, {
    type: STRING_ITERATOR,
    string: string,
    index: 0
  });
}, 'String', function next() {
  var state = getInternalState$2(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return { value: undefined, done: true };
  point = charAt(string, index);
  state.index += point.length;
  return { value: { codePoint: codeAt(point, 0), position: index }, done: false };
});

// `String.prototype.codePoints` method
// https://github.com/tc39/proposal-string-prototype-codepoints
$$J({ target: 'String', proto: true }, {
  codePoints: function codePoints() {
    return new $StringIterator(String(requireObjectCoercible(this)));
  }
});

var $$I = _export;
var isArray = isArray$8;

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
$$I({ target: 'Array', stat: true }, {
  isTemplateObject: function isTemplateObject(value) {
    if (!isFrozenStringArray(value, true)) return false;
    var raw = value.raw;
    if (raw.length !== value.length || !isFrozenStringArray(raw, false)) return false;
    return true;
  }
});

var global$7 = global$L;
var shared = sharedStore;
var getPrototypeOf = objectGetPrototypeOf$1;
var has$2 = has$o;
var createNonEnumerableProperty$6 = createNonEnumerableProperty$m;
var wellKnownSymbol$6 = wellKnownSymbol$C;

var USE_FUNCTION_CONSTRUCTOR = 'USE_FUNCTION_CONSTRUCTOR';
var ASYNC_ITERATOR$1 = wellKnownSymbol$6('asyncIterator');
var AsyncIterator$1 = global$7.AsyncIterator;
var PassedAsyncIteratorPrototype = shared.AsyncIteratorPrototype;
var AsyncIteratorPrototype$1, prototype;

{
  if (PassedAsyncIteratorPrototype) {
    AsyncIteratorPrototype$1 = PassedAsyncIteratorPrototype;
  } else if (typeof AsyncIterator$1 == 'function') {
    AsyncIteratorPrototype$1 = AsyncIterator$1.prototype;
  } else if (shared[USE_FUNCTION_CONSTRUCTOR] || global$7[USE_FUNCTION_CONSTRUCTOR]) {
    try {
      // eslint-disable-next-line no-new-func
      prototype = getPrototypeOf(getPrototypeOf(getPrototypeOf(Function('return async function*(){}()')())));
      if (getPrototypeOf(prototype) === Object.prototype) AsyncIteratorPrototype$1 = prototype;
    } catch (error) { /* empty */ }
  }
}

if (!AsyncIteratorPrototype$1) AsyncIteratorPrototype$1 = {};

if (!has$2(AsyncIteratorPrototype$1, ASYNC_ITERATOR$1)) {
  createNonEnumerableProperty$6(AsyncIteratorPrototype$1, ASYNC_ITERATOR$1, function () {
    return this;
  });
}

var asyncIteratorPrototype = AsyncIteratorPrototype$1;

// https://github.com/tc39/proposal-iterator-helpers
var $$H = _export;
var anInstance$1 = anInstance$b;
var createNonEnumerableProperty$5 = createNonEnumerableProperty$m;
var has$1 = has$o;
var wellKnownSymbol$5 = wellKnownSymbol$C;
var AsyncIteratorPrototype = asyncIteratorPrototype;
var IS_PURE$c = isPure;

var TO_STRING_TAG$4 = wellKnownSymbol$5('toStringTag');

var AsyncIteratorConstructor = function AsyncIterator() {
  anInstance$1(this, AsyncIteratorConstructor);
};

AsyncIteratorConstructor.prototype = AsyncIteratorPrototype;

if (!has$1(AsyncIteratorPrototype, TO_STRING_TAG$4)) {
  createNonEnumerableProperty$5(AsyncIteratorPrototype, TO_STRING_TAG$4, 'AsyncIterator');
}

if (!has$1(AsyncIteratorPrototype, 'constructor') || AsyncIteratorPrototype.constructor === Object) {
  createNonEnumerableProperty$5(AsyncIteratorPrototype, 'constructor', AsyncIteratorConstructor);
}

$$H({ global: true, forced: IS_PURE$c }, {
  AsyncIterator: AsyncIteratorConstructor
});

var path$3 = path$6;
var aFunction$m = aFunction$R;
var anObject$w = anObject$1z;
var create$1 = objectCreate;
var createNonEnumerableProperty$4 = createNonEnumerableProperty$m;
var redefineAll$1 = redefineAll$9;
var wellKnownSymbol$4 = wellKnownSymbol$C;
var InternalStateModule$1 = internalState;
var getBuiltIn$7 = getBuiltIn$t;

var Promise$3 = getBuiltIn$7('Promise');

var setInternalState$1 = InternalStateModule$1.set;
var getInternalState$1 = InternalStateModule$1.get;

var TO_STRING_TAG$3 = wellKnownSymbol$4('toStringTag');

var $return$1 = function (value) {
  var iterator = getInternalState$1(this).iterator;
  var $$return = iterator['return'];
  return $$return === undefined
    ? Promise$3.resolve({ done: true, value: value })
    : anObject$w($$return.call(iterator, value));
};

var $throw$1 = function (value) {
  var iterator = getInternalState$1(this).iterator;
  var $$throw = iterator['throw'];
  return $$throw === undefined
    ? Promise$3.reject(value)
    : $$throw.call(iterator, value);
};

var asyncIteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var AsyncIteratorProxy = function AsyncIterator(state) {
    state.next = aFunction$m(state.iterator.next);
    state.done = false;
    setInternalState$1(this, state);
  };

  AsyncIteratorProxy.prototype = redefineAll$1(create$1(path$3.AsyncIterator.prototype), {
    next: function next(arg) {
      var state = getInternalState$1(this);
      if (state.done) return Promise$3.resolve({ done: true, value: undefined });
      try {
        return Promise$3.resolve(anObject$w(nextHandler.call(state, arg, Promise$3)));
      } catch (error) {
        return Promise$3.reject(error);
      }
    },
    'return': $return$1,
    'throw': $throw$1
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty$4(AsyncIteratorProxy.prototype, TO_STRING_TAG$3, 'Generator');
  }

  return AsyncIteratorProxy;
};

// https://github.com/tc39/proposal-iterator-helpers
var $$G = _export;
var anObject$v = anObject$1z;
var createAsyncIteratorProxy$6 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$6 = createAsyncIteratorProxy$6(function (arg, Promise) {
  var state = this;
  var iterator = state.iterator;

  return Promise.resolve(anObject$v(state.next.call(iterator, arg))).then(function (step) {
    if (anObject$v(step).done) {
      state.done = true;
      return { done: true, value: undefined };
    }
    return { done: false, value: [state.index++, step.value] };
  });
});

$$G({ target: 'AsyncIterator', proto: true, real: true }, {
  asIndexedPairs: function asIndexedPairs() {
    return new AsyncIteratorProxy$6({
      iterator: anObject$v(this),
      index: 0
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$F = _export;
var anObject$u = anObject$1z;
var toPositiveInteger$3 = toPositiveInteger$5;
var createAsyncIteratorProxy$5 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$5 = createAsyncIteratorProxy$5(function (arg, Promise) {
  var state = this;

  return new Promise(function (resolve, reject) {
    var loop = function () {
      try {
        Promise.resolve(
          anObject$u(state.next.call(state.iterator, state.remaining ? undefined : arg))
        ).then(function (step) {
          try {
            if (anObject$u(step).done) {
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

$$F({ target: 'AsyncIterator', proto: true, real: true }, {
  drop: function drop(limit) {
    return new AsyncIteratorProxy$5({
      iterator: anObject$u(this),
      remaining: toPositiveInteger$3(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var aFunction$l = aFunction$R;
var anObject$t = anObject$1z;
var getBuiltIn$6 = getBuiltIn$t;

var Promise$2 = getBuiltIn$6('Promise');
var push$1 = [].push;

var createMethod = function (TYPE) {
  var IS_TO_ARRAY = TYPE == 0;
  var IS_FOR_EACH = TYPE == 1;
  var IS_EVERY = TYPE == 2;
  var IS_SOME = TYPE == 3;
  return function (iterator, fn) {
    anObject$t(iterator);
    var next = aFunction$l(iterator.next);
    var array = IS_TO_ARRAY ? [] : undefined;
    if (!IS_TO_ARRAY) aFunction$l(fn);

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
          Promise$2.resolve(anObject$t(next.call(iterator))).then(function (step) {
            try {
              if (anObject$t(step).done) {
                resolve(IS_TO_ARRAY ? array : IS_SOME ? false : IS_EVERY || undefined);
              } else {
                var value = step.value;
                if (IS_TO_ARRAY) {
                  push$1.call(array, value);
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
  toArray: createMethod(0),
  forEach: createMethod(1),
  every: createMethod(2),
  some: createMethod(3),
  find: createMethod(4)
};

// https://github.com/tc39/proposal-iterator-helpers
var $$E = _export;
var $every = asyncIteratorIteration.every;

$$E({ target: 'AsyncIterator', proto: true, real: true }, {
  every: function every(fn) {
    return $every(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$D = _export;
var aFunction$k = aFunction$R;
var anObject$s = anObject$1z;
var createAsyncIteratorProxy$4 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$4 = createAsyncIteratorProxy$4(function (arg, Promise) {
  var state = this;
  var filterer = state.filterer;

  return new Promise(function (resolve, reject) {
    var loop = function () {
      try {
        Promise.resolve(anObject$s(state.next.call(state.iterator, arg))).then(function (step) {
          try {
            if (anObject$s(step).done) {
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

$$D({ target: 'AsyncIterator', proto: true, real: true }, {
  filter: function filter(filterer) {
    return new AsyncIteratorProxy$4({
      iterator: anObject$s(this),
      filterer: aFunction$k(filterer)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$C = _export;
var $find = asyncIteratorIteration.find;

$$C({ target: 'AsyncIterator', proto: true, real: true }, {
  find: function find(fn) {
    return $find(this, fn);
  }
});

var getIteratorMethod$2 = getIteratorMethod$8;
var wellKnownSymbol$3 = wellKnownSymbol$C;

var ASYNC_ITERATOR = wellKnownSymbol$3('asyncIterator');

var getAsyncIteratorMethod$2 = function (it) {
  var method = it[ASYNC_ITERATOR];
  return method === undefined ? getIteratorMethod$2(it) : method;
};

// https://github.com/tc39/proposal-iterator-helpers
var $$B = _export;
var aFunction$j = aFunction$R;
var anObject$r = anObject$1z;
var createAsyncIteratorProxy$3 = asyncIteratorCreateProxy;
var getAsyncIteratorMethod$1 = getAsyncIteratorMethod$2;

var AsyncIteratorProxy$3 = createAsyncIteratorProxy$3(function (arg, Promise) {
  var state = this;
  var mapper = state.mapper;
  var innerIterator, iteratorMethod;

  return new Promise(function (resolve, reject) {
    var outerLoop = function () {
      try {
        Promise.resolve(anObject$r(state.next.call(state.iterator, arg))).then(function (step) {
          try {
            if (anObject$r(step).done) {
              state.done = true;
              resolve({ done: true, value: undefined });
            } else {
              Promise.resolve(mapper(step.value)).then(function (mapped) {
                try {
                  iteratorMethod = getAsyncIteratorMethod$1(mapped);
                  if (iteratorMethod !== undefined) {
                    state.innerIterator = innerIterator = anObject$r(iteratorMethod.call(mapped));
                    state.innerNext = aFunction$j(innerIterator.next);
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
          Promise.resolve(anObject$r(state.innerNext.call(innerIterator))).then(function (result) {
            try {
              if (anObject$r(result).done) {
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

$$B({ target: 'AsyncIterator', proto: true, real: true }, {
  flatMap: function flatMap(mapper) {
    return new AsyncIteratorProxy$3({
      iterator: anObject$r(this),
      mapper: aFunction$j(mapper),
      innerIterator: null,
      innerNext: null
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$A = _export;
var $forEach = asyncIteratorIteration.forEach;

$$A({ target: 'AsyncIterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    return $forEach(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$z = _export;
var path$2 = path$6;
var aFunction$i = aFunction$R;
var anObject$q = anObject$1z;
var toObject$2 = toObject$u;
var createAsyncIteratorProxy$2 = asyncIteratorCreateProxy;
var getAsyncIteratorMethod = getAsyncIteratorMethod$2;

var AsyncIterator = path$2.AsyncIterator;

var AsyncIteratorProxy$2 = createAsyncIteratorProxy$2(function (arg) {
  return anObject$q(this.next.call(this.iterator, arg));
}, true);

$$z({ target: 'AsyncIterator', stat: true }, {
  from: function from(O) {
    var object = toObject$2(O);
    var usingIterator = getAsyncIteratorMethod(object);
    var iterator;
    if (usingIterator != null) {
      iterator = aFunction$i(usingIterator).call(object);
      if (iterator instanceof AsyncIterator) return iterator;
    } else {
      iterator = object;
    } return new AsyncIteratorProxy$2({
      iterator: iterator
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$y = _export;
var aFunction$h = aFunction$R;
var anObject$p = anObject$1z;
var createAsyncIteratorProxy$1 = asyncIteratorCreateProxy;

var AsyncIteratorProxy$1 = createAsyncIteratorProxy$1(function (arg, Promise) {
  var state = this;
  var mapper = state.mapper;

  return Promise.resolve(anObject$p(state.next.call(state.iterator, arg))).then(function (step) {
    if (anObject$p(step).done) {
      state.done = true;
      return { done: true, value: undefined };
    }
    return Promise.resolve(mapper(step.value)).then(function (value) {
      return { done: false, value: value };
    });
  });
});

$$y({ target: 'AsyncIterator', proto: true, real: true }, {
  map: function map(mapper) {
    return new AsyncIteratorProxy$1({
      iterator: anObject$p(this),
      mapper: aFunction$h(mapper)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$x = _export;
var aFunction$g = aFunction$R;
var anObject$o = anObject$1z;
var getBuiltIn$5 = getBuiltIn$t;

var Promise$1 = getBuiltIn$5('Promise');

$$x({ target: 'AsyncIterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    var iterator = anObject$o(this);
    var next = aFunction$g(iterator.next);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aFunction$g(reducer);

    return new Promise$1(function (resolve, reject) {
      var loop = function () {
        try {
          Promise$1.resolve(anObject$o(next.call(iterator))).then(function (step) {
            try {
              if (anObject$o(step).done) {
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
var $$w = _export;
var $some = asyncIteratorIteration.some;

$$w({ target: 'AsyncIterator', proto: true, real: true }, {
  some: function some(fn) {
    return $some(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$v = _export;
var anObject$n = anObject$1z;
var toPositiveInteger$2 = toPositiveInteger$5;
var createAsyncIteratorProxy = asyncIteratorCreateProxy;

var AsyncIteratorProxy = createAsyncIteratorProxy(function (arg, Promise) {
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

$$v({ target: 'AsyncIterator', proto: true, real: true }, {
  take: function take(limit) {
    return new AsyncIteratorProxy({
      iterator: anObject$n(this),
      remaining: toPositiveInteger$2(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$u = _export;
var $toArray = asyncIteratorIteration.toArray;

$$u({ target: 'AsyncIterator', proto: true, real: true }, {
  toArray: function toArray() {
    return $toArray(this);
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$t = _export;
var global$6 = global$L;
var anInstance = anInstance$b;
var createNonEnumerableProperty$3 = createNonEnumerableProperty$m;
var fails = fails$Y;
var has = has$o;
var wellKnownSymbol$2 = wellKnownSymbol$C;
var IteratorPrototype = iteratorsCore.IteratorPrototype;

wellKnownSymbol$2('iterator');
var TO_STRING_TAG$2 = wellKnownSymbol$2('toStringTag');

var NativeIterator = global$6.Iterator;

// FF56- have non-standard global helper `Iterator`
var FORCED$1 = typeof NativeIterator != 'function'
  || NativeIterator.prototype !== IteratorPrototype
  // FF44- non-standard `Iterator` passes previous tests
  || !fails(function () { NativeIterator({}); });

var IteratorConstructor = function Iterator() {
  anInstance(this, IteratorConstructor);
};

if (!has(IteratorPrototype, TO_STRING_TAG$2)) {
  createNonEnumerableProperty$3(IteratorPrototype, TO_STRING_TAG$2, 'Iterator');
}

if (FORCED$1 || !has(IteratorPrototype, 'constructor') || IteratorPrototype.constructor === Object) {
  createNonEnumerableProperty$3(IteratorPrototype, 'constructor', IteratorConstructor);
}

IteratorConstructor.prototype = IteratorPrototype;

$$t({ global: true, forced: FORCED$1 }, {
  Iterator: IteratorConstructor
});

var path$1 = path$6;
var aFunction$f = aFunction$R;
var anObject$m = anObject$1z;
var create = objectCreate;
var createNonEnumerableProperty$2 = createNonEnumerableProperty$m;
var redefineAll = redefineAll$9;
var wellKnownSymbol$1 = wellKnownSymbol$C;
var InternalStateModule = internalState;

var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.get;

var TO_STRING_TAG$1 = wellKnownSymbol$1('toStringTag');

var $return = function (value) {
  var iterator = getInternalState(this).iterator;
  var $$return = iterator['return'];
  return $$return === undefined ? { done: true, value: value } : anObject$m($$return.call(iterator, value));
};

var $throw = function (value) {
  var iterator = getInternalState(this).iterator;
  var $$throw = iterator['throw'];
  if ($$throw === undefined) throw value;
  return $$throw.call(iterator, value);
};

var iteratorCreateProxy = function (nextHandler, IS_ITERATOR) {
  var IteratorProxy = function Iterator(state) {
    state.next = aFunction$f(state.iterator.next);
    state.done = false;
    setInternalState(this, state);
  };

  IteratorProxy.prototype = redefineAll(create(path$1.Iterator.prototype), {
    next: function next() {
      var state = getInternalState(this);
      var result = state.done ? undefined : nextHandler.apply(state, arguments);
      return { done: state.done, value: result };
    },
    'return': $return,
    'throw': $throw
  });

  if (!IS_ITERATOR) {
    createNonEnumerableProperty$2(IteratorProxy.prototype, TO_STRING_TAG$1, 'Generator');
  }

  return IteratorProxy;
};

// https://github.com/tc39/proposal-iterator-helpers
var $$s = _export;
var anObject$l = anObject$1z;
var createIteratorProxy$6 = iteratorCreateProxy;

var IteratorProxy$6 = createIteratorProxy$6(function (arg) {
  var result = anObject$l(this.next.call(this.iterator, arg));
  var done = this.done = !!result.done;
  if (!done) return [this.index++, result.value];
});

$$s({ target: 'Iterator', proto: true, real: true }, {
  asIndexedPairs: function asIndexedPairs() {
    return new IteratorProxy$6({
      iterator: anObject$l(this),
      index: 0
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$r = _export;
var anObject$k = anObject$1z;
var toPositiveInteger$1 = toPositiveInteger$5;
var createIteratorProxy$5 = iteratorCreateProxy;

var IteratorProxy$5 = createIteratorProxy$5(function (arg) {
  var iterator = this.iterator;
  var next = this.next;
  var result, done;
  while (this.remaining) {
    this.remaining--;
    result = anObject$k(next.call(iterator));
    done = this.done = !!result.done;
    if (done) return;
  }
  result = anObject$k(next.call(iterator, arg));
  done = this.done = !!result.done;
  if (!done) return result.value;
});

$$r({ target: 'Iterator', proto: true, real: true }, {
  drop: function drop(limit) {
    return new IteratorProxy$5({
      iterator: anObject$k(this),
      remaining: toPositiveInteger$1(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$q = _export;
var iterate$c = iterate$I;
var aFunction$e = aFunction$R;
var anObject$j = anObject$1z;

$$q({ target: 'Iterator', proto: true, real: true }, {
  every: function every(fn) {
    anObject$j(this);
    aFunction$e(fn);
    return !iterate$c(this, function (value, stop) {
      if (!fn(value)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$p = _export;
var aFunction$d = aFunction$R;
var anObject$i = anObject$1z;
var createIteratorProxy$4 = iteratorCreateProxy;
var callWithSafeIterationClosing$1 = callWithSafeIterationClosing$3;

var IteratorProxy$4 = createIteratorProxy$4(function (arg) {
  var iterator = this.iterator;
  var filterer = this.filterer;
  var next = this.next;
  var result, done, value;
  while (true) {
    result = anObject$i(next.call(iterator, arg));
    done = this.done = !!result.done;
    if (done) return;
    value = result.value;
    if (callWithSafeIterationClosing$1(iterator, filterer, value)) return value;
  }
});

$$p({ target: 'Iterator', proto: true, real: true }, {
  filter: function filter(filterer) {
    return new IteratorProxy$4({
      iterator: anObject$i(this),
      filterer: aFunction$d(filterer)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$o = _export;
var iterate$b = iterate$I;
var aFunction$c = aFunction$R;
var anObject$h = anObject$1z;

$$o({ target: 'Iterator', proto: true, real: true }, {
  find: function find(fn) {
    anObject$h(this);
    aFunction$c(fn);
    return iterate$b(this, function (value, stop) {
      if (fn(value)) return stop(value);
    }, { IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$n = _export;
var aFunction$b = aFunction$R;
var anObject$g = anObject$1z;
var getIteratorMethod$1 = getIteratorMethod$8;
var createIteratorProxy$3 = iteratorCreateProxy;
var iteratorClose$1 = iteratorClose$4;

var IteratorProxy$3 = createIteratorProxy$3(function (arg) {
  var iterator = this.iterator;
  var mapper = this.mapper;
  var result, mapped, iteratorMethod, innerIterator;

  while (true) {
    try {
      if (innerIterator = this.innerIterator) {
        result = anObject$g(this.innerNext.call(innerIterator));
        if (!result.done) return result.value;
        this.innerIterator = this.innerNext = null;
      }

      result = anObject$g(this.next.call(iterator, arg));

      if (this.done = !!result.done) return;

      mapped = mapper(result.value);
      iteratorMethod = getIteratorMethod$1(mapped);

      if (iteratorMethod === undefined) {
        throw TypeError('.flatMap callback should return an iterable object');
      }

      this.innerIterator = innerIterator = anObject$g(iteratorMethod.call(mapped));
      this.innerNext = aFunction$b(innerIterator.next);
    } catch (error) {
      iteratorClose$1(iterator);
      throw error;
    }
  }
});

$$n({ target: 'Iterator', proto: true, real: true }, {
  flatMap: function flatMap(mapper) {
    return new IteratorProxy$3({
      iterator: anObject$g(this),
      mapper: aFunction$b(mapper),
      innerIterator: null,
      innerNext: null
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$m = _export;
var iterate$a = iterate$I;
var anObject$f = anObject$1z;

$$m({ target: 'Iterator', proto: true, real: true }, {
  forEach: function forEach(fn) {
    iterate$a(anObject$f(this), fn, { IS_ITERATOR: true });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$l = _export;
var path = path$6;
var aFunction$a = aFunction$R;
var anObject$e = anObject$1z;
var toObject$1 = toObject$u;
var createIteratorProxy$2 = iteratorCreateProxy;
var getIteratorMethod = getIteratorMethod$8;

var Iterator = path.Iterator;

var IteratorProxy$2 = createIteratorProxy$2(function (arg) {
  var result = anObject$e(this.next.call(this.iterator, arg));
  var done = this.done = !!result.done;
  if (!done) return result.value;
}, true);

$$l({ target: 'Iterator', stat: true }, {
  from: function from(O) {
    var object = toObject$1(O);
    var usingIterator = getIteratorMethod(object);
    var iterator;
    if (usingIterator != null) {
      iterator = aFunction$a(usingIterator).call(object);
      if (iterator instanceof Iterator) return iterator;
    } else {
      iterator = object;
    } return new IteratorProxy$2({
      iterator: iterator
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$k = _export;
var aFunction$9 = aFunction$R;
var anObject$d = anObject$1z;
var createIteratorProxy$1 = iteratorCreateProxy;
var callWithSafeIterationClosing = callWithSafeIterationClosing$3;

var IteratorProxy$1 = createIteratorProxy$1(function (arg) {
  var iterator = this.iterator;
  var result = anObject$d(this.next.call(iterator, arg));
  var done = this.done = !!result.done;
  if (!done) return callWithSafeIterationClosing(iterator, this.mapper, result.value);
});

$$k({ target: 'Iterator', proto: true, real: true }, {
  map: function map(mapper) {
    return new IteratorProxy$1({
      iterator: anObject$d(this),
      mapper: aFunction$9(mapper)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$j = _export;
var iterate$9 = iterate$I;
var aFunction$8 = aFunction$R;
var anObject$c = anObject$1z;

$$j({ target: 'Iterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    anObject$c(this);
    aFunction$8(reducer);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    iterate$9(this, function (value) {
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
var $$i = _export;
var iterate$8 = iterate$I;
var aFunction$7 = aFunction$R;
var anObject$b = anObject$1z;

$$i({ target: 'Iterator', proto: true, real: true }, {
  some: function some(fn) {
    anObject$b(this);
    aFunction$7(fn);
    return iterate$8(this, function (value, stop) {
      if (fn(value)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$h = _export;
var anObject$a = anObject$1z;
var toPositiveInteger = toPositiveInteger$5;
var createIteratorProxy = iteratorCreateProxy;
var iteratorClose = iteratorClose$4;

var IteratorProxy = createIteratorProxy(function (arg) {
  var iterator = this.iterator;
  if (!this.remaining--) {
    this.done = true;
    return iteratorClose(iterator);
  }
  var result = anObject$a(this.next.call(iterator, arg));
  var done = this.done = !!result.done;
  if (!done) return result.value;
});

$$h({ target: 'Iterator', proto: true, real: true }, {
  take: function take(limit) {
    return new IteratorProxy({
      iterator: anObject$a(this),
      remaining: toPositiveInteger(limit)
    });
  }
});

// https://github.com/tc39/proposal-iterator-helpers
var $$g = _export;
var iterate$7 = iterate$I;
var anObject$9 = anObject$1z;

var push = [].push;

$$g({ target: 'Iterator', proto: true, real: true }, {
  toArray: function toArray() {
    var result = [];
    iterate$7(anObject$9(this), push, { that: result, IS_ITERATOR: true });
    return result;
  }
});

var anObject$8 = anObject$1z;

// `Map.prototype.emplace` method
// https://github.com/thumbsupep/proposal-upsert
var mapEmplace = function emplace(key, handler) {
  var map = anObject$8(this);
  var value = (map.has(key) && 'update' in handler)
    ? handler.update(map.get(key), key, map)
    : handler.insert(key, map);
  map.set(key, value);
  return value;
};

var $$f = _export;
var IS_PURE$b = isPure;
var $emplace$1 = mapEmplace;

// `Map.prototype.emplace` method
// https://github.com/thumbsupep/proposal-upsert
$$f({ target: 'Map', proto: true, real: true, forced: IS_PURE$b }, {
  emplace: $emplace$1
});

var anObject$7 = anObject$1z;

// `Map.prototype.upsert` method
// https://github.com/thumbsupep/proposal-upsert
var mapUpsert = function upsert(key, updateFn /* , insertFn */) {
  var map = anObject$7(this);
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
var $$e = _export;
var IS_PURE$a = isPure;
var $upsert$2 = mapUpsert;

// `Map.prototype.updateOrInsert` method (replaced by `Map.prototype.emplace`)
// https://github.com/thumbsupep/proposal-upsert
$$e({ target: 'Map', proto: true, real: true, forced: IS_PURE$a }, {
  updateOrInsert: $upsert$2
});

// TODO: remove from `core-js@4`
var $$d = _export;
var IS_PURE$9 = isPure;
var $upsert$1 = mapUpsert;

// `Map.prototype.upsert` method (replaced by `Map.prototype.emplace`)
// https://github.com/thumbsupep/proposal-upsert
$$d({ target: 'Map', proto: true, real: true, forced: IS_PURE$9 }, {
  upsert: $upsert$1
});

var $$c = _export;
var IS_PURE$8 = isPure;
var $emplace = mapEmplace;

// `WeakMap.prototype.emplace` method
// https://github.com/tc39/proposal-upsert
$$c({ target: 'WeakMap', proto: true, real: true, forced: IS_PURE$8 }, {
  emplace: $emplace
});

// TODO: remove from `core-js@4`
var $$b = _export;
var IS_PURE$7 = isPure;
var $upsert = mapUpsert;

// `WeakMap.prototype.upsert` method (replaced by `WeakMap.prototype.emplace`)
// https://github.com/tc39/proposal-upsert
$$b({ target: 'WeakMap', proto: true, real: true, forced: IS_PURE$7 }, {
  upsert: $upsert
});

var $$a = _export;
var IS_PURE$6 = isPure;
var getBuiltIn$4 = getBuiltIn$t;
var anObject$6 = anObject$1z;
var aFunction$6 = aFunction$R;
var speciesConstructor$3 = speciesConstructor$j;
var iterate$6 = iterate$I;

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
$$a({ target: 'Set', proto: true, real: true, forced: IS_PURE$6 }, {
  difference: function difference(iterable) {
    var set = anObject$6(this);
    var newSet = new (speciesConstructor$3(set, getBuiltIn$4('Set')))(set);
    var remover = aFunction$6(newSet['delete']);
    iterate$6(iterable, function (value) {
      remover.call(newSet, value);
    });
    return newSet;
  }
});

var $$9 = _export;
var IS_PURE$5 = isPure;
var getBuiltIn$3 = getBuiltIn$t;
var anObject$5 = anObject$1z;
var aFunction$5 = aFunction$R;
var speciesConstructor$2 = speciesConstructor$j;
var iterate$5 = iterate$I;

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
$$9({ target: 'Set', proto: true, real: true, forced: IS_PURE$5 }, {
  intersection: function intersection(iterable) {
    var set = anObject$5(this);
    var newSet = new (speciesConstructor$2(set, getBuiltIn$3('Set')))();
    var hasCheck = aFunction$5(set.has);
    var adder = aFunction$5(newSet.add);
    iterate$5(iterable, function (value) {
      if (hasCheck.call(set, value)) adder.call(newSet, value);
    });
    return newSet;
  }
});

var $$8 = _export;
var IS_PURE$4 = isPure;
var anObject$4 = anObject$1z;
var aFunction$4 = aFunction$R;
var iterate$4 = iterate$I;

// `Set.prototype.isDisjointFrom` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isDisjointFrom
$$8({ target: 'Set', proto: true, real: true, forced: IS_PURE$4 }, {
  isDisjointFrom: function isDisjointFrom(iterable) {
    var set = anObject$4(this);
    var hasCheck = aFunction$4(set.has);
    return !iterate$4(iterable, function (value, stop) {
      if (hasCheck.call(set, value) === true) return stop();
    }, { INTERRUPTED: true }).stopped;
  }
});

var $$7 = _export;
var IS_PURE$3 = isPure;
var getBuiltIn$2 = getBuiltIn$t;
var anObject$3 = anObject$1z;
var aFunction$3 = aFunction$R;
var getIterator = getIterator$3;
var iterate$3 = iterate$I;

// `Set.prototype.isSubsetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
$$7({ target: 'Set', proto: true, real: true, forced: IS_PURE$3 }, {
  isSubsetOf: function isSubsetOf(iterable) {
    var iterator = getIterator(this);
    var otherSet = anObject$3(iterable);
    var hasCheck = otherSet.has;
    if (typeof hasCheck != 'function') {
      otherSet = new (getBuiltIn$2('Set'))(iterable);
      hasCheck = aFunction$3(otherSet.has);
    }
    return !iterate$3(iterator, function (value, stop) {
      if (hasCheck.call(otherSet, value) === false) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var $$6 = _export;
var IS_PURE$2 = isPure;
var anObject$2 = anObject$1z;
var aFunction$2 = aFunction$R;
var iterate$2 = iterate$I;

// `Set.prototype.isSupersetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSupersetOf
$$6({ target: 'Set', proto: true, real: true, forced: IS_PURE$2 }, {
  isSupersetOf: function isSupersetOf(iterable) {
    var set = anObject$2(this);
    var hasCheck = aFunction$2(set.has);
    return !iterate$2(iterable, function (value, stop) {
      if (hasCheck.call(set, value) === false) return stop();
    }, { INTERRUPTED: true }).stopped;
  }
});

var $$5 = _export;
var IS_PURE$1 = isPure;
var getBuiltIn$1 = getBuiltIn$t;
var anObject$1 = anObject$1z;
var aFunction$1 = aFunction$R;
var speciesConstructor$1 = speciesConstructor$j;
var iterate$1 = iterate$I;

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
$$5({ target: 'Set', proto: true, real: true, forced: IS_PURE$1 }, {
  union: function union(iterable) {
    var set = anObject$1(this);
    var newSet = new (speciesConstructor$1(set, getBuiltIn$1('Set')))(set);
    iterate$1(iterable, aFunction$1(newSet.add), { that: newSet });
    return newSet;
  }
});

var $$4 = _export;
var IS_PURE = isPure;
var getBuiltIn = getBuiltIn$t;
var anObject = anObject$1z;
var aFunction = aFunction$R;
var speciesConstructor = speciesConstructor$j;
var iterate = iterate$I;

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
$$4({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  symmetricDifference: function symmetricDifference(iterable) {
    var set = anObject(this);
    var newSet = new (speciesConstructor(set, getBuiltIn('Set')))(set);
    var remover = aFunction(newSet['delete']);
    var adder = aFunction(newSet.add);
    iterate(iterable, function (value) {
      remover.call(newSet, value) || adder.call(newSet, value);
    });
    return newSet;
  }
});

var defineWellKnownSymbol$2 = defineWellKnownSymbol$j;

// `Symbol.asyncDispose` well-known symbol
// https://github.com/tc39/proposal-using-statement
defineWellKnownSymbol$2('asyncDispose');

var defineWellKnownSymbol$1 = defineWellKnownSymbol$j;

// `Symbol.dispose` well-known symbol
// https://github.com/tc39/proposal-using-statement
defineWellKnownSymbol$1('dispose');

var $$3 = _export;
var toObject = toObject$u;
var toLength$1 = toLength$y;
var toInteger$1 = toInteger$f;
var addToUnscopables = addToUnscopables$d;

// `Array.prototype.at` method
// https://github.com/tc39/proposal-relative-indexing-method
$$3({ target: 'Array', proto: true }, {
  at: function at(index) {
    var O = toObject(this);
    var len = toLength$1(O.length);
    var relativeIndex = toInteger$1(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : O[k];
  }
});

addToUnscopables('at');

var ArrayBufferViewCore = arrayBufferViewCore;
var toLength = toLength$y;
var toInteger = toInteger$f;

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

// `%TypedArray%.prototype.at` method
// https://github.com/tc39/proposal-relative-indexing-method
exportTypedArrayMethod('at', function at(index) {
  var O = aTypedArray(this);
  var len = toLength(O.length);
  var relativeIndex = toInteger(index);
  var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
  return (k < 0 || k >= len) ? undefined : O[k];
});

// TODO: remove from `core-js@4`
var defineWellKnownSymbol = defineWellKnownSymbol$j;

defineWellKnownSymbol('replaceAll');

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

var global$5 = global$L;
var DOMIterables$1 = domIterables;
var forEach = arrayForEach;
var createNonEnumerableProperty$1 = createNonEnumerableProperty$m;

for (var COLLECTION_NAME$1 in DOMIterables$1) {
  var Collection$1 = global$5[COLLECTION_NAME$1];
  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
  // some Chrome versions have non-configurable methods on DOMTokenList
  if (CollectionPrototype$1 && CollectionPrototype$1.forEach !== forEach) try {
    createNonEnumerableProperty$1(CollectionPrototype$1, 'forEach', forEach);
  } catch (error) {
    CollectionPrototype$1.forEach = forEach;
  }
}

var global$4 = global$L;
var DOMIterables = domIterables;
var ArrayIteratorMethods = es_array_iterator;
var createNonEnumerableProperty = createNonEnumerableProperty$m;
var wellKnownSymbol = wellKnownSymbol$C;

var ITERATOR = wellKnownSymbol('iterator');
var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var ArrayValues = ArrayIteratorMethods.values;

for (var COLLECTION_NAME in DOMIterables) {
  var Collection = global$4[COLLECTION_NAME];
  var CollectionPrototype = Collection && Collection.prototype;
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR] = ArrayValues;
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
}

var $$2 = _export;
var global$3 = global$L;
var task = task$2;

var FORCED = !global$3.setImmediate || !global$3.clearImmediate;

// http://w3c.github.io/setImmediate/
$$2({ global: true, bind: true, enumerable: true, forced: FORCED }, {
  // `setImmediate` method
  // http://w3c.github.io/setImmediate/#si-setImmediate
  setImmediate: task.set,
  // `clearImmediate` method
  // http://w3c.github.io/setImmediate/#si-clearImmediate
  clearImmediate: task.clear
});

var $$1 = _export;
var global$2 = global$L;
var microtask = microtask$2;
var IS_NODE = engineIsNode;

var process = global$2.process;

// `queueMicrotask` method
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask
$$1({ global: true, enumerable: true, noTargetGet: true }, {
  queueMicrotask: function queueMicrotask(fn) {
    var domain = IS_NODE && process.domain;
    microtask(domain ? domain.bind(fn) : fn);
  }
});

var $ = _export;
var global$1 = global$L;
var userAgent = engineUserAgent;

var slice = [].slice;
var MSIE = /MSIE .\./.test(userAgent); // <- dirty ie9- check

var wrap = function (scheduler) {
  return function (handler, timeout /* , ...arguments */) {
    var boundArgs = arguments.length > 2;
    var args = boundArgs ? slice.call(arguments, 2) : undefined;
    return scheduler(boundArgs ? function () {
      // eslint-disable-next-line no-new-func
      (typeof handler == 'function' ? handler : Function(handler)).apply(this, args);
    } : handler, timeout);
  };
};

// ie9- setTimeout & setInterval additional parameters fix
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
$({ global: true, bind: true, forced: MSIE }, {
  // `setTimeout` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-settimeout
  setTimeout: wrap(global$1.setTimeout),
  // `setInterval` method
  // https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-setinterval
  setInterval: wrap(global$1.setInterval)
});
