const lib = { named: { named: 42 } };

console.log('side-effect', lib.named);

console.log('side-effect', lib.named.named);

const component = import('./generated-component.js').then(function (n) { return n.c; });

export { component as c, lib as l };
