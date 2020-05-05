import('./generated-dep1.js').then(function (n) { return n.d; }).then(({ bar }) => console.log(bar()));
