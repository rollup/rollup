System.register(['./chunk2.js', './compact.js', './concat.js', './difference.js', './differenceBy.js', './differenceWith.js', './drop.js', './dropRight.js', './dropRightWhile.js', './dropWhile.js', './fill.js', './findIndex.js', './findLastIndex.js', './first.js', './flatten.js', './flattenDeep.js', './flattenDepth.js', './fromPairs.js', './head.js', './indexOf.js', './initial.js', './intersection.js', './intersectionBy.js', './intersectionWith.js', './join.js', './last.js', './lastIndexOf.js', './nth.js', './pull.js', './pullAll.js', './pullAllBy.js', './pullAllWith.js', './pullAt.js', './remove.js', './reverse.js', './slice.js', './sortedIndex.js', './sortedIndexBy.js', './sortedIndexOf.js', './sortedLastIndex.js', './sortedLastIndexBy.js', './sortedLastIndexOf.js', './sortedUniq.js', './sortedUniqBy.js', './tail.js', './take.js', './takeRight.js', './takeRightWhile.js', './takeWhile.js', './union.js', './unionBy.js', './unionWith.js', './uniq.js', './uniqBy.js', './uniqWith.js', './unzip.js', './unzipWith.js', './without.js', './xor.js', './xorBy.js', './xorWith.js', './zip.js', './zipObject.js', './zipObjectDeep.js', './zipWith.js'], function (exports, module) {
  'use strict';
  var chunk, compact, concat, difference, differenceBy, differenceWith, drop, dropRight, dropRightWhile, dropWhile, fill, findIndex, findLastIndex, head$1, flatten, flattenDeep, flattenDepth, fromPairs, head$1, indexOf, initial, intersection, intersectionBy, intersectionWith, join, last, lastIndexOf, nth, pull, pullAll, pullAllBy, pullAllWith, pullAt, remove, reverse, slice, sortedIndex, sortedIndexBy, sortedIndexOf, sortedLastIndex, sortedLastIndexBy, sortedLastIndexOf, sortedUniq, sortedUniqBy, tail, take, takeRight, takeRightWhile, takeWhile, union, unionBy, unionWith, uniq, uniqBy, uniqWith, unzip, unzipWith, without, xor, xorBy, xorWith, zip, zipObject, zipObjectDeep, zipWith;
  return {
    setters: [function (module) {
      chunk = module.default;
    }, function (module) {
      compact = module.default;
    }, function (module) {
      concat = module.default;
    }, function (module) {
      difference = module.default;
    }, function (module) {
      differenceBy = module.default;
    }, function (module) {
      differenceWith = module.default;
    }, function (module) {
      drop = module.default;
    }, function (module) {
      dropRight = module.default;
    }, function (module) {
      dropRightWhile = module.default;
    }, function (module) {
      dropWhile = module.default;
    }, function (module) {
      fill = module.default;
    }, function (module) {
      findIndex = module.default;
    }, function (module) {
      findLastIndex = module.default;
    }, function (module) {
      head$1 = module.default;
    }, function (module) {
      flatten = module.default;
    }, function (module) {
      flattenDeep = module.default;
    }, function (module) {
      flattenDepth = module.default;
    }, function (module) {
      fromPairs = module.default;
    }, function (module) {
      head$1 = module.default;
    }, function (module) {
      indexOf = module.default;
    }, function (module) {
      initial = module.default;
    }, function (module) {
      intersection = module.default;
    }, function (module) {
      intersectionBy = module.default;
    }, function (module) {
      intersectionWith = module.default;
    }, function (module) {
      join = module.default;
    }, function (module) {
      last = module.default;
    }, function (module) {
      lastIndexOf = module.default;
    }, function (module) {
      nth = module.default;
    }, function (module) {
      pull = module.default;
    }, function (module) {
      pullAll = module.default;
    }, function (module) {
      pullAllBy = module.default;
    }, function (module) {
      pullAllWith = module.default;
    }, function (module) {
      pullAt = module.default;
    }, function (module) {
      remove = module.default;
    }, function (module) {
      reverse = module.default;
    }, function (module) {
      slice = module.default;
    }, function (module) {
      sortedIndex = module.default;
    }, function (module) {
      sortedIndexBy = module.default;
    }, function (module) {
      sortedIndexOf = module.default;
    }, function (module) {
      sortedLastIndex = module.default;
    }, function (module) {
      sortedLastIndexBy = module.default;
    }, function (module) {
      sortedLastIndexOf = module.default;
    }, function (module) {
      sortedUniq = module.default;
    }, function (module) {
      sortedUniqBy = module.default;
    }, function (module) {
      tail = module.default;
    }, function (module) {
      take = module.default;
    }, function (module) {
      takeRight = module.default;
    }, function (module) {
      takeRightWhile = module.default;
    }, function (module) {
      takeWhile = module.default;
    }, function (module) {
      union = module.default;
    }, function (module) {
      unionBy = module.default;
    }, function (module) {
      unionWith = module.default;
    }, function (module) {
      uniq = module.default;
    }, function (module) {
      uniqBy = module.default;
    }, function (module) {
      uniqWith = module.default;
    }, function (module) {
      unzip = module.default;
    }, function (module) {
      unzipWith = module.default;
    }, function (module) {
      without = module.default;
    }, function (module) {
      xor = module.default;
    }, function (module) {
      xorBy = module.default;
    }, function (module) {
      xorWith = module.default;
    }, function (module) {
      zip = module.default;
    }, function (module) {
      zipObject = module.default;
    }, function (module) {
      zipObjectDeep = module.default;
    }, function (module) {
      zipWith = module.default;
    }],
    execute: function () {

      var array = exports('default', {
        chunk, compact, concat, difference, differenceBy,
        differenceWith, drop, dropRight, dropRightWhile, dropWhile,
        fill, findIndex, findLastIndex, first: head$1, flatten,
        flattenDeep, flattenDepth, fromPairs, head: head$1, indexOf,
        initial, intersection, intersectionBy, intersectionWith, join,
        last, lastIndexOf, nth, pull, pullAll,
        pullAllBy, pullAllWith, pullAt, remove, reverse,
        slice, sortedIndex, sortedIndexBy, sortedIndexOf, sortedLastIndex,
        sortedLastIndexBy, sortedLastIndexOf, sortedUniq, sortedUniqBy, tail,
        take, takeRight, takeRightWhile, takeWhile, union,
        unionBy, unionWith, uniq, uniqBy, uniqWith,
        unzip, unzipWith, without, xor, xorBy,
        xorWith, zip, zipObject, zipObjectDeep, zipWith
      });

    }
  };
});
