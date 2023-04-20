export async function entry() {
  // simple
  const { foo1: foo } = await import('./sub1.js');

  // multiple
  ;(await import('./sub2.js')).bar3()
  const { foo3, baz3 } = await import('./sub2.js');
  const { foo4 } = await import('./sub2.js');

  // bail out
  const { bail1 } = await import('./bail1.js');
  const promise = import('./bail1.js') // this should make full1.js not be tree-shaken

  const { ...bail2 } = await import('./bail2.js')

  (await import('./bail3.js'))[foo]

  await import('./bail4.js').bail4
}
