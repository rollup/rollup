const value = 0;
await import('./awaited.js').then(function (n) { return n.a; });
const loadDynamic = () => import('./generated-dynamic.js');

export { loadDynamic, value };
