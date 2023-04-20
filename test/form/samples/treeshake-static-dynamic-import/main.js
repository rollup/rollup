export async function entry() {
  const { foo1: foo } = await import('./sub1.js');
  const { foo2 } = await import('./sub2.js');

  const promise = import('./sub2.js') // this should make sub2.js not be tree-shaken

  console.log(foo(), foo2());
}
