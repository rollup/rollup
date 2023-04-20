export async function entry() {
  const { foo1 } = await import('./sub1.js');
  const { foo2: foo } = await import('./sub2.js');

  const promise = import('./sub2.js') // this should make sub2.js not be tree-shaken
}
