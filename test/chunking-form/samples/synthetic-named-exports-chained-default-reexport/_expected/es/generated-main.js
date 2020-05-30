const lib = { named: { named: 42 } };

console.log('side-effect', lib.named);

console.log('side-effect', lib.named.named);

const component = import('./generated-component.js');

export { component as c, lib as l };
