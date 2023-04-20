export async function entry() {
  // simple
  const { foo1: foo } = await import('./sub1.js');

  // fail out
  const { foo2 } = await import('./sub2.js');
  const promise = import('./sub2.js') // this should make sub2.js not be tree-shaken

  // multiple
  ;(await import('./sub3')).bar3()
  const { foo3, baz3 } = await import('./sub3.js');

  console.log([
    foo(),
    foo2(),
    foo3(),
    baz3(),
  ]);
}
