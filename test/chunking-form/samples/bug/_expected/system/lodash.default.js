System.register(['./array.js', './collection.js', './date.js', './function.js', './lang.js', './math.js', './number.js', './object.js', './seq.js', './string.js', './util.js', './_LazyWrapper.js', './_LodashWrapper.js', './_Symbol.js', './_arrayEach.js', './_arrayPush.js', './_baseForOwn.js', './_baseFunctions.js', './_baseInvoke.js', './_baseIteratee.js', './_baseRest.js', './_createHybrid.js', './identity.js', './isArray.js', './isObject.js', './keys.js', './last.js', './_lazyClone.js', './_lazyReverse.js', './_lazyValue.js', './mixin.js', './negate.js', './_realNames.js', './thru.js', './toInteger.js', './wrapperLodash.js'], function (exports, module) {
  'use strict';
  var array, collection, date, func, lang, math, number, object, seq, string, util, LazyWrapper, LodashWrapper, Symbol, arrayEach, arrayPush, baseForOwn, baseFunctions, baseInvoke, baseIteratee, baseRest, createHybrid, identity, isArray, isObject, keys, last, lazyClone, lazyReverse, lazyValue, mixin, negate, realNames, thru, toInteger, lodash;
  return {
    setters: [function (module) {
      array = module.default;
    }, function (module) {
      collection = module.default;
    }, function (module) {
      date = module.default;
    }, function (module) {
      func = module.default;
    }, function (module) {
      lang = module.default;
    }, function (module) {
      math = module.default;
    }, function (module) {
      number = module.default;
    }, function (module) {
      object = module.default;
    }, function (module) {
      seq = module.default;
    }, function (module) {
      string = module.default;
    }, function (module) {
      util = module.default;
    }, function (module) {
      LazyWrapper = module.default;
    }, function (module) {
      LodashWrapper = module.default;
    }, function (module) {
      Symbol = module.default;
    }, function (module) {
      arrayEach = module.default;
    }, function (module) {
      arrayPush = module.default;
    }, function (module) {
      baseForOwn = module.default;
    }, function (module) {
      baseFunctions = module.default;
    }, function (module) {
      baseInvoke = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      createHybrid = module.default;
    }, function (module) {
      identity = module.default;
    }, function (module) {
      isArray = module.default;
    }, function (module) {
      isObject = module.default;
    }, function (module) {
      keys = module.default;
    }, function (module) {
      last = module.default;
    }, function (module) {
      lazyClone = module.default;
    }, function (module) {
      lazyReverse = module.default;
    }, function (module) {
      lazyValue = module.default;
    }, function (module) {
      mixin = module.default;
    }, function (module) {
      negate = module.default;
    }, function (module) {
      realNames = module.default;
    }, function (module) {
      thru = module.default;
    }, function (module) {
      toInteger = module.default;
    }, function (module) {
      lodash = module.default;
    }],
    execute: function () {

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
      var symIterator = Symbol ? Symbol.iterator : undefined;

      /* Built-in method references for those with the same name as other `lodash` methods. */
      var nativeMax = Math.max,
          nativeMin = Math.min;

      // wrap `_.mixin` so it works when provided only one argument
      var mixin$1 = (function(func) {
        return function(object, source, options) {
          if (options == null) {
            var isObj = isObject(source),
                props = isObj && keys(source),
                methodNames = props && props.length && baseFunctions(source, props);

            if (!(methodNames ? methodNames.length : isObj)) {
              options = source;
              source = object;
              object = this;
            }
          }
          return func(object, source, options);
        };
      }(mixin));

      // Add methods that return wrapped values in chain sequences.
      lodash.after = func.after;
      lodash.ary = func.ary;
      lodash.assign = object.assign;
      lodash.assignIn = object.assignIn;
      lodash.assignInWith = object.assignInWith;
      lodash.assignWith = object.assignWith;
      lodash.at = object.at;
      lodash.before = func.before;
      lodash.bind = func.bind;
      lodash.bindAll = util.bindAll;
      lodash.bindKey = func.bindKey;
      lodash.castArray = lang.castArray;
      lodash.chain = seq.chain;
      lodash.chunk = array.chunk;
      lodash.compact = array.compact;
      lodash.concat = array.concat;
      lodash.cond = util.cond;
      lodash.conforms = util.conforms;
      lodash.constant = util.constant;
      lodash.countBy = collection.countBy;
      lodash.create = object.create;
      lodash.curry = func.curry;
      lodash.curryRight = func.curryRight;
      lodash.debounce = func.debounce;
      lodash.defaults = object.defaults;
      lodash.defaultsDeep = object.defaultsDeep;
      lodash.defer = func.defer;
      lodash.delay = func.delay;
      lodash.difference = array.difference;
      lodash.differenceBy = array.differenceBy;
      lodash.differenceWith = array.differenceWith;
      lodash.drop = array.drop;
      lodash.dropRight = array.dropRight;
      lodash.dropRightWhile = array.dropRightWhile;
      lodash.dropWhile = array.dropWhile;
      lodash.fill = array.fill;
      lodash.filter = collection.filter;
      lodash.flatMap = collection.flatMap;
      lodash.flatMapDeep = collection.flatMapDeep;
      lodash.flatMapDepth = collection.flatMapDepth;
      lodash.flatten = array.flatten;
      lodash.flattenDeep = array.flattenDeep;
      lodash.flattenDepth = array.flattenDepth;
      lodash.flip = func.flip;
      lodash.flow = util.flow;
      lodash.flowRight = util.flowRight;
      lodash.fromPairs = array.fromPairs;
      lodash.functions = object.functions;
      lodash.functionsIn = object.functionsIn;
      lodash.groupBy = collection.groupBy;
      lodash.initial = array.initial;
      lodash.intersection = array.intersection;
      lodash.intersectionBy = array.intersectionBy;
      lodash.intersectionWith = array.intersectionWith;
      lodash.invert = object.invert;
      lodash.invertBy = object.invertBy;
      lodash.invokeMap = collection.invokeMap;
      lodash.iteratee = util.iteratee;
      lodash.keyBy = collection.keyBy;
      lodash.keys = keys;
      lodash.keysIn = object.keysIn;
      lodash.map = collection.map;
      lodash.mapKeys = object.mapKeys;
      lodash.mapValues = object.mapValues;
      lodash.matches = util.matches;
      lodash.matchesProperty = util.matchesProperty;
      lodash.memoize = func.memoize;
      lodash.merge = object.merge;
      lodash.mergeWith = object.mergeWith;
      lodash.method = util.method;
      lodash.methodOf = util.methodOf;
      lodash.mixin = mixin$1;
      lodash.negate = negate;
      lodash.nthArg = util.nthArg;
      lodash.omit = object.omit;
      lodash.omitBy = object.omitBy;
      lodash.once = func.once;
      lodash.orderBy = collection.orderBy;
      lodash.over = util.over;
      lodash.overArgs = func.overArgs;
      lodash.overEvery = util.overEvery;
      lodash.overSome = util.overSome;
      lodash.partial = func.partial;
      lodash.partialRight = func.partialRight;
      lodash.partition = collection.partition;
      lodash.pick = object.pick;
      lodash.pickBy = object.pickBy;
      lodash.property = util.property;
      lodash.propertyOf = util.propertyOf;
      lodash.pull = array.pull;
      lodash.pullAll = array.pullAll;
      lodash.pullAllBy = array.pullAllBy;
      lodash.pullAllWith = array.pullAllWith;
      lodash.pullAt = array.pullAt;
      lodash.range = util.range;
      lodash.rangeRight = util.rangeRight;
      lodash.rearg = func.rearg;
      lodash.reject = collection.reject;
      lodash.remove = array.remove;
      lodash.rest = func.rest;
      lodash.reverse = array.reverse;
      lodash.sampleSize = collection.sampleSize;
      lodash.set = object.set;
      lodash.setWith = object.setWith;
      lodash.shuffle = collection.shuffle;
      lodash.slice = array.slice;
      lodash.sortBy = collection.sortBy;
      lodash.sortedUniq = array.sortedUniq;
      lodash.sortedUniqBy = array.sortedUniqBy;
      lodash.split = string.split;
      lodash.spread = func.spread;
      lodash.tail = array.tail;
      lodash.take = array.take;
      lodash.takeRight = array.takeRight;
      lodash.takeRightWhile = array.takeRightWhile;
      lodash.takeWhile = array.takeWhile;
      lodash.tap = seq.tap;
      lodash.throttle = func.throttle;
      lodash.thru = thru;
      lodash.toArray = lang.toArray;
      lodash.toPairs = object.toPairs;
      lodash.toPairsIn = object.toPairsIn;
      lodash.toPath = util.toPath;
      lodash.toPlainObject = lang.toPlainObject;
      lodash.transform = object.transform;
      lodash.unary = func.unary;
      lodash.union = array.union;
      lodash.unionBy = array.unionBy;
      lodash.unionWith = array.unionWith;
      lodash.uniq = array.uniq;
      lodash.uniqBy = array.uniqBy;
      lodash.uniqWith = array.uniqWith;
      lodash.unset = object.unset;
      lodash.unzip = array.unzip;
      lodash.unzipWith = array.unzipWith;
      lodash.update = object.update;
      lodash.updateWith = object.updateWith;
      lodash.values = object.values;
      lodash.valuesIn = object.valuesIn;
      lodash.without = array.without;
      lodash.words = string.words;
      lodash.wrap = func.wrap;
      lodash.xor = array.xor;
      lodash.xorBy = array.xorBy;
      lodash.xorWith = array.xorWith;
      lodash.zip = array.zip;
      lodash.zipObject = array.zipObject;
      lodash.zipObjectDeep = array.zipObjectDeep;
      lodash.zipWith = array.zipWith;

      // Add aliases.
      lodash.entries = object.toPairs;
      lodash.entriesIn = object.toPairsIn;
      lodash.extend = object.assignIn;
      lodash.extendWith = object.assignInWith;

      // Add methods to `lodash.prototype`.
      mixin$1(lodash, lodash);

      // Add methods that return unwrapped values in chain sequences.
      lodash.add = math.add;
      lodash.attempt = util.attempt;
      lodash.camelCase = string.camelCase;
      lodash.capitalize = string.capitalize;
      lodash.ceil = math.ceil;
      lodash.clamp = number.clamp;
      lodash.clone = lang.clone;
      lodash.cloneDeep = lang.cloneDeep;
      lodash.cloneDeepWith = lang.cloneDeepWith;
      lodash.cloneWith = lang.cloneWith;
      lodash.conformsTo = lang.conformsTo;
      lodash.deburr = string.deburr;
      lodash.defaultTo = util.defaultTo;
      lodash.divide = math.divide;
      lodash.endsWith = string.endsWith;
      lodash.eq = lang.eq;
      lodash.escape = string.escape;
      lodash.escapeRegExp = string.escapeRegExp;
      lodash.every = collection.every;
      lodash.find = collection.find;
      lodash.findIndex = array.findIndex;
      lodash.findKey = object.findKey;
      lodash.findLast = collection.findLast;
      lodash.findLastIndex = array.findLastIndex;
      lodash.findLastKey = object.findLastKey;
      lodash.floor = math.floor;
      lodash.forEach = collection.forEach;
      lodash.forEachRight = collection.forEachRight;
      lodash.forIn = object.forIn;
      lodash.forInRight = object.forInRight;
      lodash.forOwn = object.forOwn;
      lodash.forOwnRight = object.forOwnRight;
      lodash.get = object.get;
      lodash.gt = lang.gt;
      lodash.gte = lang.gte;
      lodash.has = object.has;
      lodash.hasIn = object.hasIn;
      lodash.head = array.head;
      lodash.identity = identity;
      lodash.includes = collection.includes;
      lodash.indexOf = array.indexOf;
      lodash.inRange = number.inRange;
      lodash.invoke = object.invoke;
      lodash.isArguments = lang.isArguments;
      lodash.isArray = isArray;
      lodash.isArrayBuffer = lang.isArrayBuffer;
      lodash.isArrayLike = lang.isArrayLike;
      lodash.isArrayLikeObject = lang.isArrayLikeObject;
      lodash.isBoolean = lang.isBoolean;
      lodash.isBuffer = lang.isBuffer;
      lodash.isDate = lang.isDate;
      lodash.isElement = lang.isElement;
      lodash.isEmpty = lang.isEmpty;
      lodash.isEqual = lang.isEqual;
      lodash.isEqualWith = lang.isEqualWith;
      lodash.isError = lang.isError;
      lodash.isFinite = lang.isFinite;
      lodash.isFunction = lang.isFunction;
      lodash.isInteger = lang.isInteger;
      lodash.isLength = lang.isLength;
      lodash.isMap = lang.isMap;
      lodash.isMatch = lang.isMatch;
      lodash.isMatchWith = lang.isMatchWith;
      lodash.isNaN = lang.isNaN;
      lodash.isNative = lang.isNative;
      lodash.isNil = lang.isNil;
      lodash.isNull = lang.isNull;
      lodash.isNumber = lang.isNumber;
      lodash.isObject = isObject;
      lodash.isObjectLike = lang.isObjectLike;
      lodash.isPlainObject = lang.isPlainObject;
      lodash.isRegExp = lang.isRegExp;
      lodash.isSafeInteger = lang.isSafeInteger;
      lodash.isSet = lang.isSet;
      lodash.isString = lang.isString;
      lodash.isSymbol = lang.isSymbol;
      lodash.isTypedArray = lang.isTypedArray;
      lodash.isUndefined = lang.isUndefined;
      lodash.isWeakMap = lang.isWeakMap;
      lodash.isWeakSet = lang.isWeakSet;
      lodash.join = array.join;
      lodash.kebabCase = string.kebabCase;
      lodash.last = last;
      lodash.lastIndexOf = array.lastIndexOf;
      lodash.lowerCase = string.lowerCase;
      lodash.lowerFirst = string.lowerFirst;
      lodash.lt = lang.lt;
      lodash.lte = lang.lte;
      lodash.max = math.max;
      lodash.maxBy = math.maxBy;
      lodash.mean = math.mean;
      lodash.meanBy = math.meanBy;
      lodash.min = math.min;
      lodash.minBy = math.minBy;
      lodash.stubArray = util.stubArray;
      lodash.stubFalse = util.stubFalse;
      lodash.stubObject = util.stubObject;
      lodash.stubString = util.stubString;
      lodash.stubTrue = util.stubTrue;
      lodash.multiply = math.multiply;
      lodash.nth = array.nth;
      lodash.noop = util.noop;
      lodash.now = date.now;
      lodash.pad = string.pad;
      lodash.padEnd = string.padEnd;
      lodash.padStart = string.padStart;
      lodash.parseInt = string.parseInt;
      lodash.random = number.random;
      lodash.reduce = collection.reduce;
      lodash.reduceRight = collection.reduceRight;
      lodash.repeat = string.repeat;
      lodash.replace = string.replace;
      lodash.result = object.result;
      lodash.round = math.round;
      lodash.sample = collection.sample;
      lodash.size = collection.size;
      lodash.snakeCase = string.snakeCase;
      lodash.some = collection.some;
      lodash.sortedIndex = array.sortedIndex;
      lodash.sortedIndexBy = array.sortedIndexBy;
      lodash.sortedIndexOf = array.sortedIndexOf;
      lodash.sortedLastIndex = array.sortedLastIndex;
      lodash.sortedLastIndexBy = array.sortedLastIndexBy;
      lodash.sortedLastIndexOf = array.sortedLastIndexOf;
      lodash.startCase = string.startCase;
      lodash.startsWith = string.startsWith;
      lodash.subtract = math.subtract;
      lodash.sum = math.sum;
      lodash.sumBy = math.sumBy;
      lodash.template = string.template;
      lodash.times = util.times;
      lodash.toFinite = lang.toFinite;
      lodash.toInteger = toInteger;
      lodash.toLength = lang.toLength;
      lodash.toLower = string.toLower;
      lodash.toNumber = lang.toNumber;
      lodash.toSafeInteger = lang.toSafeInteger;
      lodash.toString = lang.toString;
      lodash.toUpper = string.toUpper;
      lodash.trim = string.trim;
      lodash.trimEnd = string.trimEnd;
      lodash.trimStart = string.trimStart;
      lodash.truncate = string.truncate;
      lodash.unescape = string.unescape;
      lodash.uniqueId = util.uniqueId;
      lodash.upperCase = string.upperCase;
      lodash.upperFirst = string.upperFirst;

      // Add aliases.
      lodash.each = collection.forEach;
      lodash.eachRight = collection.forEachRight;
      lodash.first = array.head;

      mixin$1(lodash, (function() {
        var source = {};
        baseForOwn(lodash, function(func, methodName) {
          if (!hasOwnProperty.call(lodash.prototype, methodName)) {
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
      lodash.VERSION = VERSION;
      (lodash.templateSettings = string.templateSettings).imports._ = lodash;

      // Assign default placeholders.
      arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
        lodash[methodName].placeholder = lodash;
      });

      // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
      arrayEach(['drop', 'take'], function(methodName, index) {
        LazyWrapper.prototype[methodName] = function(n) {
          n = n === undefined ? 1 : nativeMax(toInteger(n), 0);

          var result = (this.__filtered__ && !index)
            ? new LazyWrapper(this)
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

        LazyWrapper.prototype[methodName + 'Right'] = function(n) {
          return this.reverse()[methodName](n).reverse();
        };
      });

      // Add `LazyWrapper` methods that accept an `iteratee` value.
      arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
        var type = index + 1,
            isFilter = type == LAZY_FILTER_FLAG || type == LAZY_WHILE_FLAG;

        LazyWrapper.prototype[methodName] = function(iteratee) {
          var result = this.clone();
          result.__iteratees__.push({
            'iteratee': baseIteratee(iteratee, 3),
            'type': type
          });
          result.__filtered__ = result.__filtered__ || isFilter;
          return result;
        };
      });

      // Add `LazyWrapper` methods for `_.head` and `_.last`.
      arrayEach(['head', 'last'], function(methodName, index) {
        var takeName = 'take' + (index ? 'Right' : '');

        LazyWrapper.prototype[methodName] = function() {
          return this[takeName](1).value()[0];
        };
      });

      // Add `LazyWrapper` methods for `_.initial` and `_.tail`.
      arrayEach(['initial', 'tail'], function(methodName, index) {
        var dropName = 'drop' + (index ? '' : 'Right');

        LazyWrapper.prototype[methodName] = function() {
          return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
        };
      });

      LazyWrapper.prototype.compact = function() {
        return this.filter(identity);
      };

      LazyWrapper.prototype.find = function(predicate) {
        return this.filter(predicate).head();
      };

      LazyWrapper.prototype.findLast = function(predicate) {
        return this.reverse().find(predicate);
      };

      LazyWrapper.prototype.invokeMap = baseRest(function(path, args) {
        if (typeof path == 'function') {
          return new LazyWrapper(this);
        }
        return this.map(function(value) {
          return baseInvoke(value, path, args);
        });
      });

      LazyWrapper.prototype.reject = function(predicate) {
        return this.filter(negate(baseIteratee(predicate)));
      };

      LazyWrapper.prototype.slice = function(start, end) {
        start = toInteger(start);

        var result = this;
        if (result.__filtered__ && (start > 0 || end < 0)) {
          return new LazyWrapper(result);
        }
        if (start < 0) {
          result = result.takeRight(-start);
        } else if (start) {
          result = result.drop(start);
        }
        if (end !== undefined) {
          end = toInteger(end);
          result = end < 0 ? result.dropRight(-end) : result.take(end - start);
        }
        return result;
      };

      LazyWrapper.prototype.takeRightWhile = function(predicate) {
        return this.reverse().takeWhile(predicate).reverse();
      };

      LazyWrapper.prototype.toArray = function() {
        return this.take(MAX_ARRAY_LENGTH);
      };

      // Add `LazyWrapper` methods to `lodash.prototype`.
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var checkIteratee = /^(?:filter|find|map|reject)|While$/.test(methodName),
            isTaker = /^(?:head|last)$/.test(methodName),
            lodashFunc = lodash[isTaker ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName],
            retUnwrapped = isTaker || /^find/.test(methodName);

        if (!lodashFunc) {
          return;
        }
        lodash.prototype[methodName] = function() {
          var value = this.__wrapped__,
              args = isTaker ? [1] : arguments,
              isLazy = value instanceof LazyWrapper,
              iteratee = args[0],
              useLazy = isLazy || isArray(value);

          var interceptor = function(value) {
            var result = lodashFunc.apply(lodash, arrayPush([value], args));
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
            value = onlyLazy ? value : new LazyWrapper(this);
            var result = func.apply(value, args);
            result.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined });
            return new LodashWrapper(result, chainAll);
          }
          if (isUnwrapped && onlyLazy) {
            return func.apply(this, args);
          }
          result = this.thru(interceptor);
          return isUnwrapped ? (isTaker ? result.value()[0] : result.value()) : result;
        };
      });

      // Add `Array` methods to `lodash.prototype`.
      arrayEach(['pop', 'push', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {
        var func = arrayProto[methodName],
            chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
            retUnwrapped = /^(?:pop|shift)$/.test(methodName);

        lodash.prototype[methodName] = function() {
          var args = arguments;
          if (retUnwrapped && !this.__chain__) {
            var value = this.value();
            return func.apply(isArray(value) ? value : [], args);
          }
          return this[chainName](function(value) {
            return func.apply(isArray(value) ? value : [], args);
          });
        };
      });

      // Map minified method names to their real names.
      baseForOwn(LazyWrapper.prototype, function(func, methodName) {
        var lodashFunc = lodash[methodName];
        if (lodashFunc) {
          var key = (lodashFunc.name + ''),
              names = realNames[key] || (realNames[key] = []);

          names.push({ 'name': methodName, 'func': lodashFunc });
        }
      });

      realNames[createHybrid(undefined, WRAP_BIND_KEY_FLAG).name] = [{
        'name': 'wrapper',
        'func': undefined
      }];

      // Add methods to `LazyWrapper`.
      LazyWrapper.prototype.clone = lazyClone;
      LazyWrapper.prototype.reverse = lazyReverse;
      LazyWrapper.prototype.value = lazyValue;

      // Add chain sequence methods to the `lodash` wrapper.
      lodash.prototype.at = seq.at;
      lodash.prototype.chain = seq.wrapperChain;
      lodash.prototype.commit = seq.commit;
      lodash.prototype.next = seq.next;
      lodash.prototype.plant = seq.plant;
      lodash.prototype.reverse = seq.reverse;
      lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = seq.value;

      // Add lazy aliases.
      lodash.prototype.first = lodash.prototype.head;

      if (symIterator) {
        lodash.prototype[symIterator] = seq.toIterator;
      }
      exports('default', lodash);

    }
  };
});
