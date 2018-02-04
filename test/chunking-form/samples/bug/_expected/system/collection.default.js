System.register(['./countBy.js', './each.js', './eachRight.js', './every.js', './filter.js', './find.js', './findLast.js', './flatMap.js', './flatMapDeep.js', './flatMapDepth.js', './forEach.js', './forEachRight.js', './groupBy.js', './includes.js', './invokeMap.js', './keyBy.js', './map.js', './orderBy.js', './partition.js', './reduce.js', './reduceRight.js', './reject.js', './sample.js', './sampleSize.js', './shuffle.js', './size.js', './some.js', './sortBy.js'], function (exports, module) {
  'use strict';
  var countBy, forEach$1, forEachRight$1, every, filter, find, findLast, flatMap, flatMapDeep, flatMapDepth, forEach$1, forEachRight$1, groupBy, includes, invokeMap, keyBy, map, orderBy, partition, reduce, reduceRight, reject, sample, sampleSize, shuffle, size, some, sortBy;
  return {
    setters: [function (module) {
      countBy = module.default;
    }, function (module) {
      forEach$1 = module.default;
    }, function (module) {
      forEachRight$1 = module.default;
    }, function (module) {
      every = module.default;
    }, function (module) {
      filter = module.default;
    }, function (module) {
      find = module.default;
    }, function (module) {
      findLast = module.default;
    }, function (module) {
      flatMap = module.default;
    }, function (module) {
      flatMapDeep = module.default;
    }, function (module) {
      flatMapDepth = module.default;
    }, function (module) {
      forEach$1 = module.default;
    }, function (module) {
      forEachRight$1 = module.default;
    }, function (module) {
      groupBy = module.default;
    }, function (module) {
      includes = module.default;
    }, function (module) {
      invokeMap = module.default;
    }, function (module) {
      keyBy = module.default;
    }, function (module) {
      map = module.default;
    }, function (module) {
      orderBy = module.default;
    }, function (module) {
      partition = module.default;
    }, function (module) {
      reduce = module.default;
    }, function (module) {
      reduceRight = module.default;
    }, function (module) {
      reject = module.default;
    }, function (module) {
      sample = module.default;
    }, function (module) {
      sampleSize = module.default;
    }, function (module) {
      shuffle = module.default;
    }, function (module) {
      size = module.default;
    }, function (module) {
      some = module.default;
    }, function (module) {
      sortBy = module.default;
    }],
    execute: function () {

      var collection = exports('default', {
        countBy, each: forEach$1, eachRight: forEachRight$1, every, filter,
        find, findLast, flatMap, flatMapDeep, flatMapDepth,
        forEach: forEach$1, forEachRight: forEachRight$1, groupBy, includes, invokeMap,
        keyBy, map, orderBy, partition, reduce,
        reduceRight, reject, sample, sampleSize, shuffle,
        size, some, sortBy
      });

    }
  };
});
