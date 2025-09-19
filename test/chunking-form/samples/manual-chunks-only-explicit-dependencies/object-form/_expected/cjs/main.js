'use strict';

// Using dynamic imports for clearer expected output
const load = async () => {
  console.log(
    await Promise.resolve().then(function () { return require('./generated-manual.js'); }).then(function (n) { return n.manual1; }).then((m) => m.manual1),
    await Promise.resolve().then(function () { return require('./generated-manual.js'); }).then(function (n) { return n.manual2; }).then((m) => m.manual2),
  );
};
load();

console.log('main');
