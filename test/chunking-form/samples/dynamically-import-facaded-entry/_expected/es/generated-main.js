var value = 42;

const promise = import('./generated-dynamic.js').then(result => console.log('main', result, value));

export { promise as p, value as v };
