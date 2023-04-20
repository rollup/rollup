export async function entry() {
  // simple
  const { foo1: foo } = await import('./sub1.js');

  // multiple
  ;(await import('./sub2.js')).bar2()
  const { foo2 } = await import('./sub2.js');
  const { foo3 } = await import('./sub2.js');
  import('./sub2.js').then(({ baz2 }) => baz2)
  import('./sub2.js').then(function({ reexported }) { reexported })

  // bail out
  const { named1 } = await import('./bail-1.js');
  const promise = import('./bail-1.js') // this make it bail out

  const { ...named2 } = await import('./bail-2.js')

  (await import('./bail-3.js'))[foo]

  await import('./bail-4.js').name4

  import('./bail-5.js').then(foo)

  await import('./bail-6.js').then(function({ named6, ...args }) { })
}
