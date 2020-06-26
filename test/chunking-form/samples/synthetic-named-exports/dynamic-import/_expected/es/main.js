import('./generated-dep.js').then(function (n) { return n.d; }).then(({ foo, bar, baz }) => console.log(foo, bar, baz));
