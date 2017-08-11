import { foo } from './foo';

var f = Math.random() <= 1 ? foo : {};
var f2;
f2 = Math.random() <= 1 ? f : {};
f2.wasMutated = true;

export var bar = 'whatever';
