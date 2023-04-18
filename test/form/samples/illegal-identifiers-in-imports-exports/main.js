import { ':' as baz, '🤷‍♂️' as bazinga } from 'external';
console.log(baz, bazinga); // retain those local bindings

const legal = 10;

export { legal as '🔥illegal' };

export { bar as '-', '/', '😂' as '😭' } from 'external';

import * as lib from 'external';
export { lib as '🍅' }
