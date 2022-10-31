import { foo as foo$ } from './foo.js';

{
  class foo extends foo$ {
  }

  assert.strictEqual(foo.name, 'foo');
  assert.ok(foo.base);
}
