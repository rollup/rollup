import { finally as baz, catch as bazinga } from 'external';
console.log(baz, bazinga); // retain those local bindings

const legal = 10;

export { legal as await };

export { bar as return, const, for as in } from 'external';

import * as lib from 'external';
export { lib as yield };
