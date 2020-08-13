import { foo } from 'external-all';
import { baz } from 'external-default-named';
import { bar } from 'external-named';
import { quux } from 'external-named-namespace';

console.log(foo, bar, baz, quux);
