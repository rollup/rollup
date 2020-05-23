var lib = {};

console.log('side-effect', lib);

const component = import('./generated-component.js');

export { component, lib };
