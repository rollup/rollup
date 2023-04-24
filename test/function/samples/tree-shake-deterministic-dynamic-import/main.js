export const allExports = () => Promise.all([
  (async () => {
    const value = (await import('./bail-1.js'))[named1]
    assert.strictEqual(value, 'bail1');
  })(),
  (async () => {
    const fn = (exports) => {
      assert.deepEqual(exports, {
        named2: 'bail2',
        default: '@included-bail-2'
      });
    }
    await import('./bail-2.js').then(fn)
  })(),
  (async () => {
    await import('./bail-3.js').then(({ default: _, ...args }) => {
      assert.deepEqual(args, {
        named3: 'bail3'
      });
    })
  })(),
  (async () => {
    const { [named4]: value } = await import('./bail-4.js')
    assert.strictEqual(value, 'bail4');
  })(),
]);
