export const test = import('./dep.js').then(n => n.test());
