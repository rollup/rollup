const Foo$2 = () => {};
const value$2 = 'value 1';
console.log(Foo$2, value$2);

const Foo$1 = () => {};
const value$1 = 'value 2';
console.log(Foo$1, value$1);

const Foo = () => {};
const value = 'value 3';
console.log(Foo, value);

const result = <Foo$1
  bar
  baz:foo="string"
  quux-nix={value$1}
  element=<Foo$1/>
  fragment=<></>
/>;

export { result };
