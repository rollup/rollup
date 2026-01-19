import { jsx } from 'react/jsx-runtime';

/*#__PURE__*/jsx(Foo, {}, 123);
const b = /*#__PURE__*/jsx(Foo, {}, 123);
/*#__PURE__*/jsx(Foo, { a: "1", b: "2" }, 123);
const d = /*#__PURE__*/jsx(Foo, { a: "1", b: "2" }, 123);
/*#__PURE__*/jsx(Foo, {}, 123);
const f = /*#__PURE__*/jsx(Foo, {}, 123);
/*#__PURE__*/jsx(Foo, { a: "1", b: "2" }, 123);
const h = /*#__PURE__*/jsx(Foo, { a: "1", b: "2" }, 123);
console.log(b,d,f,h);
