export async function entry() {
  // simple
  const { foo1: foo } = await import('./sub1.js');
  const { doesNotExists } = await import('./sub1.js');

  // multiple
  ;(await import('./sub2.js')).bar2()
  const { foo2 } = await import('./sub2.js');
  const { foo3 } = await import('./sub2.js');
  import('./sub2.js').then(({ baz2 }) => baz2)
  import('./sub2.js').then(function({ reexported }) { reexported })

  // external with unknown namespace
  const { foo4, x } = await import('./sub4');

  // side-effect only
  import('./effect-1.js')
  await import('./effect-2.js')
  import('./effect-3.js').then(function() { })
  import('./effect-4.js').then()
  import('./effect-5.js').catch(() => {})
  import('./effect-6.js').finally(() => {})

  // bail out
  const { named1 } = await import('./bail-1.js');
  const promise = import('./bail-1.js') // this make it bail out

  const { ...named2 } = await import('./bail-2.js')

  (await import('./bail-3.js'))[foo]

  await import('./bail-4.js').name4 // access on promise, not on export

  import('./bail-5.js').then(foo)

  await import('./bail-6.js').then(function({ named6, ...args }) { })

  const promises = [
    import('./bail-7.js'),
    import('./bail-8.js'),
  ]

  const { [foo]: bar } = await import('./bail-9.js')

  import('./bail-10.js').then(({ [foo]: bar }) => {})

  {
    const [name11] = await import('./bail-11.js');
  }
}
