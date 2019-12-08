export * as external1 from 'external1';
import * as imported1 from 'external1';
export * as external2 from 'external2';
import { imported2 } from 'external2';

console.log(imported1, imported2);
