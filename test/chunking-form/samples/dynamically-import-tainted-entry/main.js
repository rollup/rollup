import value from './dep.js';

export const promise = import('./dynamic').then(result => console.log('main', result, value));
