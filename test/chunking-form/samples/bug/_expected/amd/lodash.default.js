define(['./array.js', './collection.js', './date.js', './function.js', './lang.js', './math.js', './number.js', './object.js', './seq.js', './string.js', './util.js', './_LazyWrapper.js', './_LodashWrapper.js', './_Symbol.js', './_arrayEach.js', './_arrayPush.js', './_baseForOwn.js', './_baseFunctions.js', './_baseInvoke.js', './_baseIteratee.js', './_baseRest.js', './_createHybrid.js', './identity.js', './isArray.js', './isObject.js', './keys.js', './last.js', './_lazyClone.js', './_lazyReverse.js', './_lazyValue.js', './mixin.js', './negate.js', './_realNames.js', './thru.js', './toInteger.js', './wrapperLodash.js'], function (__array_js, __collection_js, __date_js, __function_js, __lang_js, __math_js, __number_js, __object_js, __seq_js, __string_js, __util_js, ___LazyWrapper_js, ___LodashWrapper_js, ___Symbol_js, ___arrayEach_js, ___arrayPush_js, ___baseForOwn_js, ___baseFunctions_js, ___baseInvoke_js, ___baseIteratee_js, ___baseRest_js, ___createHybrid_js, __identity_js, __isArray_js, __isObject_js, __keys_js, __last_js, ___lazyClone_js, ___lazyReverse_js, ___lazyValue_js, __mixin_js, __negate_js, ___realNames_js, __thru_js, __toInteger_js, __wrapperLodash_js) { 'use strict';

  /**
   * @license
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="es" -o ./`
   * Copyright JS Foundation and other contributors <https://js.foundation/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as the semantic version number. */
  var VERSION = '4.17.5';

  /** Used to compose bitmasks for function metadata. */
  var WRAP_BIND_KEY_FLAG = 2;

  /** Used to indicate the type of lazy iteratees. */
  var LAZY_FILTER_FLAG = 1,
      LAZY_WHILE_FLAG = 3;

  /** Used as references for the maximum length and index of an array. */
  var MAX_ARRAY_LENGTH = 4294967295;

  /** Used for built-in method references. */
  var arrayProto = Array.prototype,
      objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Built-in value references. */
  var symIterator = ___Symbol_js.default ? ___Symbol_js.default.iterator : undefined;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
      nativeMin = Math.min;

  // wrap `_.mixin` so it works when provided only one argument
  var mixin = (function(func) {
    return function(object, source, options) {
      if (options == null) {
        var isObj = __isObject_js.default(source),
            props = isObj && __keys_js.default(source),
            methodNames = props && props.length && ___baseFunctions_js.default(source, props);

        if (!(methodNames ? methodNames.length : isObj)) {
          options = source;
          source = object;
          object = this;
        }
      }
      return func(object, source, options);
    };
  }(__mixin_js.default));

  // Add methods that return wrapped values in chain sequences.
  __wrapperLodash_js.default.after = __function_js.default.after;
  __wrapperLodash_js.default.ary = __function_js.default.ary;
  __wrapperLodash_js.default.assign = __object_js.default.assign;
  __wrapperLodash_js.default.assignIn = __object_js.default.assignIn;
  __wrapperLodash_js.default.assignInWith = __object_js.default.assignInWith;
  __wrapperLodash_js.default.assignWith = __object_js.default.assignWith;
  __wrapperLodash_js.default.at = __object_js.default.at;
  __wrapperLodash_js.default.before = __function_js.default.before;
  __wrapperLodash_js.default.bind = __function_js.default.bind;
  __wrapperLodash_js.default.bindAll = __util_js.default.bindAll;
  __wrapperLodash_js.default.bindKey = __function_js.default.bindKey;
  __wrapperLodash_js.default.castArray = __lang_js.default.castArray;
  __wrapperLodash_js.default.chain = __seq_js.default.chain;
  __wrapperLodash_js.default.chunk = __array_js.default.chunk;
  __wrapperLodash_js.default.compact = __array_js.default.compact;
  __wrapperLodash_js.default.concat = __array_js.default.concat;
  __wrapperLodash_js.default.cond = __util_js.default.cond;
  __wrapperLodash_js.default.conforms = __util_js.default.conforms;
  __wrapperLodash_js.default.constant = __util_js.default.constant;
  __wrapperLodash_js.default.countBy = __collection_js.default.countBy;
  __wrapperLodash_js.default.create = __object_js.default.create;
  __wrapperLodash_js.default.curry = __function_js.default.curry;
  __wrapperLodash_js.default.curryRight = __function_js.default.curryRight;
  __wrapperLodash_js.default.debounce = __function_js.default.debounce;
  __wrapperLodash_js.default.defaults = __object_js.default.defaults;
  __wrapperLodash_js.default.defaultsDeep = __object_js.default.defaultsDeep;
  __wrapperLodash_js.default.defer = __function_js.default.defer;
  __wrapperLodash_js.default.delay = __function_js.default.delay;
  __wrapperLodash_js.default.difference = __array_js.default.difference;
  __wrapperLodash_js.default.differenceBy = __array_js.default.differenceBy;
  __wrapperLodash_js.default.differenceWith = __array_js.default.differenceWith;
  __wrapperLodash_js.default.drop = __array_js.default.drop;
  __wrapperLodash_js.default.dropRight = __array_js.default.dropRight;
  __wrapperLodash_js.default.dropRightWhile = __array_js.default.dropRightWhile;
  __wrapperLodash_js.default.dropWhile = __array_js.default.dropWhile;
  __wrapperLodash_js.default.fill = __array_js.default.fill;
  __wrapperLodash_js.default.filter = __collection_js.default.filter;
  __wrapperLodash_js.default.flatMap = __collection_js.default.flatMap;
  __wrapperLodash_js.default.flatMapDeep = __collection_js.default.flatMapDeep;
  __wrapperLodash_js.default.flatMapDepth = __collection_js.default.flatMapDepth;
  __wrapperLodash_js.default.flatten = __array_js.default.flatten;
  __wrapperLodash_js.default.flattenDeep = __array_js.default.flattenDeep;
  __wrapperLodash_js.default.flattenDepth = __array_js.default.flattenDepth;
  __wrapperLodash_js.default.flip = __function_js.default.flip;
  __wrapperLodash_js.default.flow = __util_js.default.flow;
  __wrapperLodash_js.default.flowRight = __util_js.default.flowRight;
  __wrapperLodash_js.default.fromPairs = __array_js.default.fromPairs;
  __wrapperLodash_js.default.functions = __object_js.default.functions;
  __wrapperLodash_js.default.functionsIn = __object_js.default.functionsIn;
  __wrapperLodash_js.default.groupBy = __collection_js.default.groupBy;
  __wrapperLodash_js.default.initial = __array_js.default.initial;
  __wrapperLodash_js.default.intersection = __array_js.default.intersection;
  __wrapperLodash_js.default.intersectionBy = __array_js.default.intersectionBy;
  __wrapperLodash_js.default.intersectionWith = __array_js.default.intersectionWith;
  __wrapperLodash_js.default.invert = __object_js.default.invert;
  __wrapperLodash_js.default.invertBy = __object_js.default.invertBy;
  __wrapperLodash_js.default.invokeMap = __collection_js.default.invokeMap;
  __wrapperLodash_js.default.iteratee = __util_js.default.iteratee;
  __wrapperLodash_js.default.keyBy = __collection_js.default.keyBy;
  __wrapperLodash_js.default.keys = __keys_js.default;
  __wrapperLodash_js.default.keysIn = __object_js.default.keysIn;
  __wrapperLodash_js.default.map = __collection_js.default.map;
  __wrapperLodash_js.default.mapKeys = __object_js.default.mapKeys;
  __wrapperLodash_js.default.mapValues = __object_js.default.mapValues;
  __wrapperLodash_js.default.matches = __util_js.default.matches;
  __wrapperLodash_js.default.matchesProperty = __util_js.default.matchesProperty;
  __wrapperLodash_js.default.memoize = __function_js.default.memoize;
  __wrapperLodash_js.default.merge = __object_js.default.merge;
  __wrapperLodash_js.default.mergeWith = __object_js.default.mergeWith;
  __wrapperLodash_js.default.method = __util_js.default.method;
  __wrapperLodash_js.default.methodOf = __util_js.default.methodOf;
  __wrapperLodash_js.default.mixin = mixin;
  __wrapperLodash_js.default.negate = __negate_js.default;
  __wrapperLodash_js.default.nthArg = __util_js.default.nthArg;
  __wrapperLodash_js.default.omit = __object_js.default.omit;
  __wrapperLodash_js.default.omitBy = __object_js.default.omitBy;
  __wrapperLodash_js.default.once = __function_js.default.once;
  __wrapperLodash_js.default.orderBy = __collection_js.default.orderBy;
  __wrapperLodash_js.default.over = __util_js.default.over;
  __wrapperLodash_js.default.overArgs = __function_js.default.overArgs;
  __wrapperLodash_js.default.overEvery = __util_js.default.overEvery;
  __wrapperLodash_js.default.overSome = __util_js.default.overSome;
  __wrapperLodash_js.default.partial = __function_js.default.partial;
  __wrapperLodash_js.default.partialRight = __function_js.default.partialRight;
  __wrapperLodash_js.default.partition = __collection_js.default.partition;
  __wrapperLodash_js.default.pick = __object_js.default.pick;
  __wrapperLodash_js.default.pickBy = __object_js.default.pickBy;
  __wrapperLodash_js.default.property = __util_js.default.property;
  __wrapperLodash_js.default.propertyOf = __util_js.default.propertyOf;
  __wrapperLodash_js.default.pull = __array_js.default.pull;
  __wrapperLodash_js.default.pullAll = __array_js.default.pullAll;
  __wrapperLodash_js.default.pullAllBy = __array_js.default.pullAllBy;
  __wrapperLodash_js.default.pullAllWith = __array_js.default.pullAllWith;
  __wrapperLodash_js.default.pullAt = __array_js.default.pullAt;
  __wrapperLodash_js.default.range = __util_js.default.range;
  __wrapperLodash_js.default.rangeRight = __util_js.default.rangeRight;
  __wrapperLodash_js.default.rearg = __function_js.default.rearg;
  __wrapperLodash_js.default.reject = __collection_js.default.reject;
  __wrapperLodash_js.default.remove = __array_js.default.remove;
  __wrapperLodash_js.default.rest = __function_js.default.rest;
  __wrapperLodash_js.default.reverse = __array_js.default.reverse;
  __wrapperLodash_js.default.sampleSize = __collection_js.default.sampleSize;
  __wrapperLodash_js.default.set = __object_js.default.set;
  __wrapperLodash_js.default.setWith = __object_js.default.setWith;
  __wrapperLodash_js.default.shuffle = __collection_js.default.shuffle;
  __wrapperLodash_js.default.slice = __array_js.default.slice;
  __wrapperLodash_js.default.sortBy = __collection_js.default.sortBy;
  __wrapperLodash_js.default.sortedUniq = __array_js.default.sortedUniq;
  __wrapperLodash_js.default.sortedUniqBy = __array_js.default.sortedUniqBy;
  __wrapperLodash_js.default.split = __string_js.default.split;
  __wrapperLodash_js.default.spread = __function_js.default.spread;
  __wrapperLodash_js.default.tail = __array_js.default.tail;
  __wrapperLodash_js.default.take = __array_js.default.take;
  __wrapperLodash_js.default.takeRight = __array_js.default.takeRight;
  __wrapperLodash_js.default.takeRightWhile = __array_js.default.takeRightWhile;
  __wrapperLodash_js.default.takeWhile = __array_js.default.takeWhile;
  __wrapperLodash_js.default.tap = __seq_js.default.tap;
  __wrapperLodash_js.default.throttle = __function_js.default.throttle;
  __wrapperLodash_js.default.thru = __thru_js.default;
  __wrapperLodash_js.default.toArray = __lang_js.default.toArray;
  __wrapperLodash_js.default.toPairs = __object_js.default.toPairs;
  __wrapperLodash_js.default.toPairsIn = __object_js.default.toPairsIn;
  __wrapperLodash_js.default.toPath = __util_js.default.toPath;
  __wrapperLodash_js.default.toPlainObject = __lang_js.default.toPlainObject;
  __wrapperLodash_js.default.transform = __object_js.default.transform;
  __wrapperLodash_js.default.unary = __function_js.default.unary;
  __wrapperLodash_js.default.union = __array_js.default.union;
  __wrapperLodash_js.default.unionBy = __array_js.default.unionBy;
  __wrapperLodash_js.default.unionWith = __array_js.default.unionWith;
  __wrapperLodash_js.default.uniq = __array_js.default.uniq;
  __wrapperLodash_js.default.uniqBy = __array_js.default.uniqBy;
  __wrapperLodash_js.default.uniqWith = __array_js.default.uniqWith;
  __wrapperLodash_js.default.unset = __object_js.default.unset;
  __wrapperLodash_js.default.unzip = __array_js.default.unzip;
  __wrapperLodash_js.default.unzipWith = __array_js.default.unzipWith;
  __wrapperLodash_js.default.update = __object_js.default.update;
  __wrapperLodash_js.default.updateWith = __object_js.default.updateWith;
  __wrapperLodash_js.default.values = __object_js.default.values;
  __wrapperLodash_js.default.valuesIn = __object_js.default.valuesIn;
  __wrapperLodash_js.default.without = __array_js.default.without;
  __wrapperLodash_js.default.words = __string_js.default.words;
  __wrapperLodash_js.default.wrap = __function_js.default.wrap;
  __wrapperLodash_js.default.xor = __array_js.default.xor;
  __wrapperLodash_js.default.xorBy = __array_js.default.xorBy;
  __wrapperLodash_js.default.xorWith = __array_js.default.xorWith;
  __wrapperLodash_js.default.zip = __array_js.default.zip;
  __wrapperLodash_js.default.zipObject = __array_js.default.zipObject;
  __wrapperLodash_js.default.zipObjectDeep = __array_js.default.zipObjectDeep;
  __wrapperLodash_js.default.zipWith = __array_js.default.zipWith;

  // Add aliases.
  __wrapperLodash_js.default.entries = __object_js.default.toPairs;
  __wrapperLodash_js.default.entriesIn = __object_js.default.toPairsIn;
  __wrapperLodash_js.default.extend = __object_js.default.assignIn;
  __wrapperLodash_js.default.extendWith = __object_js.default.assignInWith;

  // Add methods to `lodash.prototype`.
  mixin(__wrapperLodash_js.default, __wrapperLodash_js.default);

  // Add methods that return unwrapped values in chain sequences.
  __wrapperLodash_js.default.add = __math_js.default.add;
  __wrapperLodash_js.default.attempt = __util_js.default.attempt;
  __wrapperLodash_js.default.camelCase = __string_js.default.camelCase;
  __wrapperLodash_js.default.capitalize = __string_js.default.capitalize;
  __wrapperLodash_js.default.ceil = __math_js.default.ceil;
  __wrapperLodash_js.default.clamp = __number_js.default.clamp;
  __wrapperLodash_js.default.clone = __lang_js.default.clone;
  __wrapperLodash_js.default.cloneDeep = __lang_js.default.cloneDeep;
  __wrapperLodash_js.default.cloneDeepWith = __lang_js.default.cloneDeepWith;
  __wrapperLodash_js.default.cloneWith = __lang_js.default.cloneWith;
  __wrapperLodash_js.default.conformsTo = __lang_js.default.conformsTo;
  __wrapperLodash_js.default.deburr = __string_js.default.deburr;
  __wrapperLodash_js.default.defaultTo = __util_js.default.defaultTo;
  __wrapperLodash_js.default.divide = __math_js.default.divide;
  __wrapperLodash_js.default.endsWith = __string_js.default.endsWith;
  __wrapperLodash_js.default.eq = __lang_js.default.eq;
  __wrapperLodash_js.default.escape = __string_js.default.escape;
  __wrapperLodash_js.default.escapeRegExp = __string_js.default.escapeRegExp;
  __wrapperLodash_js.default.every = __collection_js.default.every;
  __wrapperLodash_js.default.find = __collection_js.default.find;
  __wrapperLodash_js.default.findIndex = __array_js.default.findIndex;
  __wrapperLodash_js.default.findKey = __object_js.default.findKey;
  __wrapperLodash_js.default.findLast = __collection_js.default.findLast;
  __wrapperLodash_js.default.findLastIndex = __array_js.default.findLastIndex;
  __wrapperLodash_js.default.findLastKey = __object_js.default.findLastKey;
  __wrapperLodash_js.default.floor = __math_js.default.floor;
  __wrapperLodash_js.default.forEach = __collection_js.default.forEach;
  __wrapperLodash_js.default.forEachRight = __collection_js.default.forEachRight;
  __wrapperLodash_js.default.forIn = __object_js.default.forIn;
  __wrapperLodash_js.default.forInRight = __object_js.default.forInRight;
  __wrapperLodash_js.default.forOwn = __object_js.default.forOwn;
  __wrapperLodash_js.default.forOwnRight = __object_js.default.forOwnRight;
  __wrapperLodash_js.default.get = __object_js.default.get;
  __wrapperLodash_js.default.gt = __lang_js.default.gt;
  __wrapperLodash_js.default.gte = __lang_js.default.gte;
  __wrapperLodash_js.default.has = __object_js.default.has;
  __wrapperLodash_js.default.hasIn = __object_js.default.hasIn;
  __wrapperLodash_js.default.head = __array_js.default.head;
  __wrapperLodash_js.default.identity = __identity_js.default;
  __wrapperLodash_js.default.includes = __collection_js.default.includes;
  __wrapperLodash_js.default.indexOf = __array_js.default.indexOf;
  __wrapperLodash_js.default.inRange = __number_js.default.inRange;
  __wrapperLodash_js.default.invoke = __object_js.default.invoke;
  __wrapperLodash_js.default.isArguments = __lang_js.default.isArguments;
  __wrapperLodash_js.default.isArray = __isArray_js.default;
  __wrapperLodash_js.default.isArrayBuffer = __lang_js.default.isArrayBuffer;
  __wrapperLodash_js.default.isArrayLike = __lang_js.default.isArrayLike;
  __wrapperLodash_js.default.isArrayLikeObject = __lang_js.default.isArrayLikeObject;
  __wrapperLodash_js.default.isBoolean = __lang_js.default.isBoolean;
  __wrapperLodash_js.default.isBuffer = __lang_js.default.isBuffer;
  __wrapperLodash_js.default.isDate = __lang_js.default.isDate;
  __wrapperLodash_js.default.isElement = __lang_js.default.isElement;
  __wrapperLodash_js.default.isEmpty = __lang_js.default.isEmpty;
  __wrapperLodash_js.default.isEqual = __lang_js.default.isEqual;
  __wrapperLodash_js.default.isEqualWith = __lang_js.default.isEqualWith;
  __wrapperLodash_js.default.isError = __lang_js.default.isError;
  __wrapperLodash_js.default.isFinite = __lang_js.default.isFinite;
  __wrapperLodash_js.default.isFunction = __lang_js.default.isFunction;
  __wrapperLodash_js.default.isInteger = __lang_js.default.isInteger;
  __wrapperLodash_js.default.isLength = __lang_js.default.isLength;
  __wrapperLodash_js.default.isMap = __lang_js.default.isMap;
  __wrapperLodash_js.default.isMatch = __lang_js.default.isMatch;
  __wrapperLodash_js.default.isMatchWith = __lang_js.default.isMatchWith;
  __wrapperLodash_js.default.isNaN = __lang_js.default.isNaN;
  __wrapperLodash_js.default.isNative = __lang_js.default.isNative;
  __wrapperLodash_js.default.isNil = __lang_js.default.isNil;
  __wrapperLodash_js.default.isNull = __lang_js.default.isNull;
  __wrapperLodash_js.default.isNumber = __lang_js.default.isNumber;
  __wrapperLodash_js.default.isObject = __isObject_js.default;
  __wrapperLodash_js.default.isObjectLike = __lang_js.default.isObjectLike;
  __wrapperLodash_js.default.isPlainObject = __lang_js.default.isPlainObject;
  __wrapperLodash_js.default.isRegExp = __lang_js.default.isRegExp;
  __wrapperLodash_js.default.isSafeInteger = __lang_js.default.isSafeInteger;
  __wrapperLodash_js.default.isSet = __lang_js.default.isSet;
  __wrapperLodash_js.default.isString = __lang_js.default.isString;
  __wrapperLodash_js.default.isSymbol = __lang_js.default.isSymbol;
  __wrapperLodash_js.default.isTypedArray = __lang_js.default.isTypedArray;
  __wrapperLodash_js.default.isUndefined = __lang_js.default.isUndefined;
  __wrapperLodash_js.default.isWeakMap = __lang_js.default.isWeakMap;
  __wrapperLodash_js.default.isWeakSet = __lang_js.default.isWeakSet;
  __wrapperLodash_js.default.join = __array_js.default.join;
  __wrapperLodash_js.default.kebabCase = __string_js.default.kebabCase;
  __wrapperLodash_js.default.last = __last_js.default;
  __wrapperLodash_js.default.lastIndexOf = __array_js.default.lastIndexOf;
  __wrapperLodash_js.default.lowerCase = __string_js.default.lowerCase;
  __wrapperLodash_js.default.lowerFirst = __string_js.default.lowerFirst;
  __wrapperLodash_js.default.lt = __lang_js.default.lt;
  __wrapperLodash_js.default.lte = __lang_js.default.lte;
  __wrapperLodash_js.default.max = __math_js.default.max;
  __wrapperLodash_js.default.maxBy = __math_js.default.maxBy;
  __wrapperLodash_js.default.mean = __math_js.default.mean;
  __wrapperLodash_js.default.meanBy = __math_js.default.meanBy;
  __wrapperLodash_js.default.min = __math_js.default.min;
  __wrapperLodash_js.default.minBy = __math_js.default.minBy;
  __wrapperLodash_js.default.stubArray = __util_js.default.stubArray;
  __wrapperLodash_js.default.stubFalse = __util_js.default.stubFalse;
  __wrapperLodash_js.default.stubObject = __util_js.default.stubObject;
  __wrapperLodash_js.default.stubString = __util_js.default.stubString;
  __wrapperLodash_js.default.stubTrue = __util_js.default.stubTrue;
  __wrapperLodash_js.default.multiply = __math_js.default.multiply;
  __wrapperLodash_js.default.nth = __array_js.default.nth;
  __wrapperLodash_js.default.noop = __util_js.default.noop;
  __wrapperLodash_js.default.now = __date_js.default.now;
  __wrapperLodash_js.default.pad = __string_js.default.pad;
  __wrapperLodash_js.default.padEnd = __string_js.default.padEnd;
  __wrapperLodash_js.default.padStart = __string_js.default.padStart;
  __wrapperLodash_js.default.parseInt = __string_js.default.parseInt;
  __wrapperLodash_js.default.random = __number_js.default.random;
  __wrapperLodash_js.default.reduce = __collection_js.default.reduce;
  __wrapperLodash_js.default.reduceRight = __collection_js.default.reduceRight;
  __wrapperLodash_js.default.repeat = __string_js.default.repeat;
  __wrapperLodash_js.default.replace = __string_js.default.replace;
  __wrapperLodash_js.default.result = __object_js.default.result;
  __wrapperLodash_js.default.round = __math_js.default.round;
  __wrapperLodash_js.default.sample = __collection_js.default.sample;
  __wrapperLodash_js.default.size = __collection_js.default.size;
  __wrapperLodash_js.default.snakeCase = __string_js.default.snakeCase;
  __wrapperLodash_js.default.some = __collection_js.default.some;
  __wrapperLodash_js.default.sortedIndex = __array_js.default.sortedIndex;
  __wrapperLodash_js.default.sortedIndexBy = __array_js.default.sortedIndexBy;
  __wrapperLodash_js.default.sortedIndexOf = __array_js.default.sortedIndexOf;
  __wrapperLodash_js.default.sortedLastIndex = __array_js.default.sortedLastIndex;
  __wrapperLodash_js.default.sortedLastIndexBy = __array_js.default.sortedLastIndexBy;
  __wrapperLodash_js.default.sortedLastIndexOf = __array_js.default.sortedLastIndexOf;
  __wrapperLodash_js.default.startCase = __string_js.default.startCase;
  __wrapperLodash_js.default.startsWith = __string_js.default.startsWith;
  __wrapperLodash_js.default.subtract = __math_js.default.subtract;
  __wrapperLodash_js.default.sum = __math_js.default.sum;
  __wrapperLodash_js.default.sumBy = __math_js.default.sumBy;
  __wrapperLodash_js.default.template = __string_js.default.template;
  __wrapperLodash_js.default.times = __util_js.default.times;
  __wrapperLodash_js.default.toFinite = __lang_js.default.toFinite;
  __wrapperLodash_js.default.toInteger = __toInteger_js.default;
  __wrapperLodash_js.default.toLength = __lang_js.default.toLength;
  __wrapperLodash_js.default.toLower = __string_js.default.toLower;
  __wrapperLodash_js.default.toNumber = __lang_js.default.toNumber;
  __wrapperLodash_js.default.toSafeInteger = __lang_js.default.toSafeInteger;
  __wrapperLodash_js.default.toString = __lang_js.default.toString;
  __wrapperLodash_js.default.toUpper = __string_js.default.toUpper;
  __wrapperLodash_js.default.trim = __string_js.default.trim;
  __wrapperLodash_js.default.trimEnd = __string_js.default.trimEnd;
  __wrapperLodash_js.default.trimStart = __string_js.default.trimStart;
  __wrapperLodash_js.default.truncate = __string_js.default.truncate;
  __wrapperLodash_js.default.unescape = __string_js.default.unescape;
  __wrapperLodash_js.default.uniqueId = __util_js.default.uniqueId;
  __wrapperLodash_js.default.upperCase = __string_js.default.upperCase;
  __wrapperLodash_js.default.upperFirst = __string_js.default.upperFirst;

  // Add aliases.
  __wrapperLodash_js.default.each = __collection_js.default.forEach;
  __wrapperLodash_js.default.eachRight = __collection_js.default.forEachRight;
  __wrapperLodash_js.default.first = __array_js.default.head;

  mixin(__wrapperLodash_js.default, (function() {
    var source = {};
    ___baseForOwn_js.default(__wrapperLodash_js.default, function(func, methodName) {
      if (!hasOwnProperty.call(__wrapperLodash_js.default.prototype, methodName)) {
        source[methodName] = func;
      }
    });
    return source;
  }()), { 'chain': false });

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type {string}
   */
  __wrapperLodash_js.default.VERSION = VERSION;
  (__wrapperLodash_js.default.templateSettings = __string_js.default.templateSettings).imports._ = __wrapperLodash_js.default;

  // Assign default placeholders.
  ___arrayEach_js.default(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
    __wrapperLodash_js.default[methodName].placeholder = __wrapperLodash_js.default;
  });

  // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
  ___arrayEach_js.default(['drop', 'take'], function(methodName, index) {
    ___LazyWrapper_js.default.prototype[methodName] = function(n) {
      n = n === undefined ? 1 : nativeMax(__toInteger_js.default(n), 0);

      var result = (this.__filtered__ && !index)
        ? new ___LazyWrapper_js.default(this)
        : this.clone();

      if (result.__filtered__) {
        result.__takeCount__ = nativeMin(n, result.__takeCount__);
      } else {
        result.__views__.push({
          'size': nativeMin(n, MAX_ARRAY_LENGTH),
          'type': methodName + (result.__dir__ < 0 ? 'Right' : '')
        });
      }
      return result;
    };

    ___LazyWrapper_js.default.prototype[methodName + 'Right'] = function(n) {
      return this.reverse()[methodName](n).reverse();
    };
  });

  // Add `LazyWrapper` methods that accept an `iteratee` value.
  ___arrayEach_js.default(['filter', 'map', 'takeWhile'], function(methodName, index) {
    var type = index + 1,
        isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;

    ___LazyWrapper_js.default.prototype[methodName] = function(iteratee) {
      var result = this.clone();
      result.__iteratees__.push({
        'iteratee': ___baseIteratee_js.default(iteratee, 3),
        'type': type
      });
      result.__filtered__ = result.__filtered__ || isFilter;
      return result;
    };
  });

  // Add `LazyWrapper` methods for `_.head` and `_.last`.
  ___arrayEach_js.default(['head', 'last'], function(methodName, index) {
    var takeName = 'take' + (index ? 'Right' : '');

    ___LazyWrapper_js.default.prototype[methodName] = function() {
      return this[takeName](1).value()[0];
    };
  });

  // Add `LazyWrapper` methods for `_.initial` and `_.tail`.
  ___arrayEach_js.default(['initial', 'tail'], function(methodName, index) {
    var dropName = 'drop' + (index ? '' : 'Right');

    ___LazyWrapper_js.default.prototype[methodName] = function() {
      return this.__filtered__ ? new ___LazyWrapper_js.default(this) : this[dropName](1);
    };
  });

  ___LazyWrapper_js.default.prototype.compact = function() {
    return this.filter(__identity_js.default);
  };

  ___LazyWrapper_js.default.prototype.find = function(predicate) {
    return this.filter(predicate).head();
  };

  ___LazyWrapper_js.default.prototype.findLast = function(predicate) {
    return this.reverse().find(predicate);
  };

  ___LazyWrapper_js.default.prototype.invokeMap = ___baseRest_js.default(function(path, args) {
    if (typeof path == 'function') {
      return new ___LazyWrapper_js.default(this);
    }
    return this.map(function(value) {
      return ___baseInvoke_js.default(value, path, args);
    });
  });

  ___LazyWrapper_js.default.prototype.reject = function(predicate) {
    return this.filter(__negate_js.default(___baseIteratee_js.default(predicate)));
  };

  ___LazyWrapper_js.default.prototype.slice = function(start, end) {
    start = __toInteger_js.default(start);

    var result = this;
    if (result.__filtered__ && (start > 0 || end < 0)) {
      return new ___LazyWrapper_js.default(result);
    }
    if (start < 0) {
      result = result.takeRight(-start);
    } else if (start) {
      result = result.drop(start);
    }
    if (end !== undefined) {
      end = __toInteger_js.default(end);
      result = end < 0 ? result.dropRight(-end) : result.take(end - start);
    }
    return result;
  };

  ___LazyWrapper_js.default.prototype.takeRightWhile = function(predicate) {
    return this.reverse().takeWhile(predicate).reverse();
  };

  ___LazyWrapper_js.default.prototype.toArray = function() {
    return this.take(MAX_ARRAY_LENGTH);
  };

  // Add `LazyWrapper` methods to `lodash.prototype`.
  ___baseForOwn_js.default(___LazyWrapper_js.default.prototype, function(func, methodName) {
    var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName),
        isTaker = /^(?:head|last)$/.test(methodName),
        lodashFunc = __wrapperLodash_js.default[isTaker ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName],
        retUnwrapped = isTaker || /^find/.test(methodName);

    if (!lodashFunc) {
      return;
    }
    __wrapperLodash_js.default.prototype[methodName] = function() {
      var value = this.__wrapped__,
          args = isTaker ? [1] : arguments,
          isLazy = value instanceof ___LazyWrapper_js.default,
          iteratee = args[0],
          useLazy = isLazy || __isArray_js.default(value);

      var interceptor = function(value) {
        var result = lodashFunc.apply(__wrapperLodash_js.default, ___arrayPush_js.default([value], args));
        return (isTaker && chainAll) ? result[0] : result;
      };

      if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
        // Avoid lazy use if the iteratee has a "length" value other than `1`.
        isLazy = useLazy = false;
      }
      var chainAll = this.__chain__,
          isHybrid = !!this.__actions__.length,
          isUnwrapped = retUnwrapped && !chainAll,
          onlyLazy = isLazy && !isHybrid;

      if (!retUnwrapped && useLazy) {
        value = onlyLazy ? value : new ___LazyWrapper_js.default(this);
        var result = func.apply(value, args);
        result.__actions__.push({ 'func': __thru_js.default, 'args': [interceptor], 'thisArg': undefined });
        return new ___LodashWrapper_js.default(result, chainAll);
      }
      if (isUnwrapped && onlyLazy) {
        return func.apply(this, args);
      }
      result = this.thru(interceptor);
      return isUnwrapped ? (isTaker ? result.value()[0] : result.value()) : result;
    };
  });

  // Add `Array` methods to `lodash.prototype`.
  ___arrayEach_js.default(['pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {
    var func = arrayProto[methodName],
        chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
        retUnwrapped = /^(?:pop|shift)$/.test(methodName);

    __wrapperLodash_js.default.prototype[methodName] = function() {
      var args = arguments;
      if (retUnwrapped && !this.__chain__) {
        var value = this.value();
        return func.apply(__isArray_js.default(value) ? value : [], args);
      }
      return this[chainName](function(value) {
        return func.apply(__isArray_js.default(value) ? value : [], args);
      });
    };
  });

  // Map minified method names to their real names.
  ___baseForOwn_js.default(___LazyWrapper_js.default.prototype, function(func, methodName) {
    var lodashFunc = __wrapperLodash_js.default[methodName];
    if (lodashFunc) {
      var key = (lodashFunc.name + ''),
          names = ___realNames_js.default[key] || (___realNames_js.default[key] = []);

      names.push({ 'name': methodName, 'func': lodashFunc });
    }
  });

  ___realNames_js.default[___createHybrid_js.default(undefined, WRAP_BIND_KEY_FLAG).name] = [{
    'name': 'wrapper',
    'func': undefined
  }];

  // Add methods to `LazyWrapper`.
  ___LazyWrapper_js.default.prototype.clone = ___lazyClone_js.default;
  ___LazyWrapper_js.default.prototype.reverse = ___lazyReverse_js.default;
  ___LazyWrapper_js.default.prototype.value = ___lazyValue_js.default;

  // Add chain sequence methods to the `lodash` wrapper.
  __wrapperLodash_js.default.prototype.at = __seq_js.default.at;
  __wrapperLodash_js.default.prototype.chain = __seq_js.default.wrapperChain;
  __wrapperLodash_js.default.prototype.commit = __seq_js.default.commit;
  __wrapperLodash_js.default.prototype.next = __seq_js.default.next;
  __wrapperLodash_js.default.prototype.plant = __seq_js.default.plant;
  __wrapperLodash_js.default.prototype.reverse = __seq_js.default.reverse;
  __wrapperLodash_js.default.prototype.toJSON = __wrapperLodash_js.default.prototype.valueOf = __wrapperLodash_js.default.prototype.value = __seq_js.default.value;

  // Add lazy aliases.
  __wrapperLodash_js.default.prototype.first = __wrapperLodash_js.default.prototype.head;

  if (symIterator) {
    __wrapperLodash_js.default.prototype[symIterator] = __seq_js.default.toIterator;
  }

  return __wrapperLodash_js.default;

});
