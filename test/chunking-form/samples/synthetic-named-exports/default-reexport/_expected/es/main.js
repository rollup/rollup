var lib = {};

console.log('side-effect', lib);

const component = import('./generated-component.js').then(function (n) { return n.c; });

export { component, lib };
