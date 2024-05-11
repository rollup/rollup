import react from "react";

const Foo = () => {};
const result = /*#__PURE__*/react.createElement(Foo, {
  bar: true,
  baz: "string",
  quux: 'expression'
});

export { result };
