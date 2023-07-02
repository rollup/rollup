const importA = () => import('./generated-a.js');
const importB = () => import('./generated-b.js');

console.log(importA, importB);
