import * as imported1 from 'external1';
export { imported1 as external1 };
import { imported2 } from 'external2';
import * as external2 from 'external2';
export { external2 };

console.log(imported1, imported2);
