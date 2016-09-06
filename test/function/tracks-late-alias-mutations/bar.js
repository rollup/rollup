import { foo } from './foo';

var f;
f = foo;
f.wasMutated = true;

export var bar = 'whatever';
