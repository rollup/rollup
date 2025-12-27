class B {
  async foo() {
    const foo = await import('./generated-foo.js');
    return new foo.Foo();
  }
}
await Promise.resolve();

class A extends B {}

export { A };
