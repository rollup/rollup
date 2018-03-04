import { update as updateFoo, foo } from './foo';
import { update as updateBar, bar } from './bar';
import { update as updateBaz, baz } from './baz';

console.log(foo);
updateFoo();
console.log(foo);
console.log(bar);
updateBar();
console.log(bar);
console.log(baz);
updateBaz();
console.log(baz);

export { updateFoo, updateBar, updateBaz, foo, bar, baz }
