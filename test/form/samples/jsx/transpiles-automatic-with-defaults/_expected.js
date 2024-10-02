import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import react from 'react';

const Foo = () => {};
const obj = { key: '2' };

console.log(/*#__PURE__*/jsx(Foo, {}));
console.log(/*#__PURE__*/jsx(Fragment, { children: /*#__PURE__*/jsx(Foo, {}) }));
console.log(/*#__PURE__*/jsxs(Foo, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }));
console.log(/*#__PURE__*/jsxs(Fragment, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }));
console.log(/*#__PURE__*/react.createElement(Foo, Object.assign({}, obj, { key: "1" })));
