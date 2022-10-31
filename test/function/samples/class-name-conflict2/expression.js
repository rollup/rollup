import { bar as bar$ } from './bar.js';

{
  let bar = class extends bar$ {
  };

  assert.strictEqual(bar.name, 'bar');
  assert.ok(bar.base);
}
