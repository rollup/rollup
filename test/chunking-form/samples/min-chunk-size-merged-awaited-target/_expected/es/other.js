export { value } from './main.js';

const loadTarget = () => import('./awaited.js').then(function (n) { return n.t; });

export { loadTarget };
