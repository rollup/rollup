import json from './foo.json';
console.log(json);

export { default as json } from './foo.json';

import('./foo.json').then(console.log);
