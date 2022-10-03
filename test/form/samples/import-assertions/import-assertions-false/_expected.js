import json from './foo.json';
export { default as json } from './foo.json';

console.log(json);

import('./foo.json').then(console.log);
