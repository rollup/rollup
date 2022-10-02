import json from './foo.json' assert { type: 'json' };
export { default as json } from './foo.json' assert { type: 'json' };

console.log(json);

import('./foo.json', { assert: { type: 'json' } }).then(console.log);
