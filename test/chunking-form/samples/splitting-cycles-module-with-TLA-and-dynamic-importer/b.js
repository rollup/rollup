export default class B {
  async foo() {
    const foo = await import("./foo.js");
    return new foo.Foo();
  }
}
await Promise.resolve();
