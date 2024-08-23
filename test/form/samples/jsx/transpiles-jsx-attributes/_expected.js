import react from 'react';

const Foo$2 = () => {};
const value$2 = 'value 1';
console.log(Foo$2, value$2);

const Foo$1 = () => {};
const value$1 = 'value 2';
console.log(Foo$1, value$1);

const Foo = () => {};
const value = 'value 3';
console.log(Foo, value);

const result = /*#__PURE__*/react.createElement(Foo$1,
  { bar: true,
  "baz:foo": "string",
  "quux-nix": value$1,
  element: /*#__PURE__*/react.createElement(Foo$1, null),
  fragment: /*#__PURE__*/react.createElement(react.Fragment, null) });

export { result };
