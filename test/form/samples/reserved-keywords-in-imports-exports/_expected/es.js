import { finally as _finally, catch as _catch } from 'external';
import * as external from 'external';
export { external as yield };
export { const, for as in, bar as return } from 'external';

console.log(_finally, _catch); // retain those local bindings

const legal = 10;

export { legal as await };
