'use strict';

Promise.resolve().then(function () { return require('./generated-dep.js'); }).then(({ obj }) => {
  console.log(obj.a);
});
