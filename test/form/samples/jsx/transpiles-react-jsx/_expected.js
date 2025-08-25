import { jsx as jsx$2, Fragment, jsxs as jsxs$2 } from 'react/jsx-runtime';
import react from 'react';

const Foo$2 = 'wrong Foo 1';
const obj$2 = 'wrong obj 1';
const jsx$1 = 'wrong jsx 1';
const jsxs$1 = 'wrong jsxs 1';
console.log(Foo$2, obj$2, jsx$1, jsxs$1);

const Foo$1 = () => {};
const obj$1 = { key: '2' };

// jsx
console.log(/*#__PURE__*/jsx$2(Foo$1, {}));
console.log(/*#__PURE__*/jsx$2(Foo$1, { x: true }));
console.log(/*#__PURE__*/jsx$2(Foo$1, { x: "1" }));
console.log(/*#__PURE__*/jsx$2(Foo$1, { x: "1" }));
console.log(/*#__PURE__*/jsx$2(Foo$1, {}, true));
console.log(/*#__PURE__*/jsx$2(Foo$1, {}, "1"));
console.log(/*#__PURE__*/jsx$2(Foo$1, {}, "1"));
console.log(/*#__PURE__*/jsx$2(Foo$1, obj$1));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({}, obj$1, { x: "1" })));
console.log(/*#__PURE__*/jsx$2(Foo$1, obj$1, "1"));
console.log(/*#__PURE__*/jsx$2(Foo$1, obj$1, true));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({ x: "1", y: "1" }, obj$1, obj$1)));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({ x: "1", y: "1" }, obj$1, obj$1), "1"));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({ x: "1", y: "1" }, obj$1, obj$1), true));

console.log(/*#__PURE__*/jsx$2(Foo$1, {}));
console.log(/*#__PURE__*/jsx$2(Foo$1, { x: "1" }));
console.log(/*#__PURE__*/jsx$2(Foo$1, {}, "1"));
console.log(/*#__PURE__*/jsx$2(Foo$1, {}, true));

console.log(/*#__PURE__*/jsx$2(Foo$1, { children: /*#__PURE__*/jsx$2(Foo$1, {}) }));
console.log(/*#__PURE__*/jsx$2(Foo$1, { x: "1", children: /*#__PURE__*/jsx$2(Foo$1, {}) }));
console.log(/*#__PURE__*/jsx$2(Foo$1, { children: /*#__PURE__*/jsx$2(Foo$1, {}) }, "1"));
console.log(/*#__PURE__*/jsx$2(Foo$1, { children: /*#__PURE__*/jsx$2(Foo$1, {}) }, true));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({}, obj$1, { children: /*#__PURE__*/jsx$2(Foo$1, {}) })));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({}, obj$1, { x: "1", children: /*#__PURE__*/jsx$2(Foo$1, {}) })));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({}, obj$1, { children: /*#__PURE__*/jsx$2(Foo$1, {}) }), "1"));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({}, obj$1, { children: /*#__PURE__*/jsx$2(Foo$1, {}) }), true));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({ x: "1", y: "1" }, obj$1, obj$1, { children: /*#__PURE__*/jsx$2(Foo$1, {}) })));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({ x: "1", y: "1" }, obj$1, obj$1, { children: /*#__PURE__*/jsx$2(Foo$1, {}) }), "1"));
console.log(/*#__PURE__*/jsx$2(Foo$1, Object.assign({ x: "1", y: "1" }, obj$1, obj$1, { children: /*#__PURE__*/jsx$2(Foo$1, {}) }), true));

console.log(/*#__PURE__*/jsx$2(Foo$1, { children: /*#__PURE__*/jsx$2(Foo$1, {}) }));

console.log(/*#__PURE__*/jsx$2(Fragment, {}));
console.log(/*#__PURE__*/jsx$2(Fragment, { children: /*#__PURE__*/jsx$2(Foo$1, {}) }));

// jsxs
console.log(/*#__PURE__*/jsxs$2(Foo$1, { children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] }));
console.log(/*#__PURE__*/jsxs$2(Foo$1, { x: "1", children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] }));
console.log(/*#__PURE__*/jsxs$2(Foo$1, { children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] }, "1"));
console.log(/*#__PURE__*/jsxs$2(Foo$1, { children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] }, true));
console.log(/*#__PURE__*/jsxs$2(Foo$1, Object.assign({}, obj$1, { children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] })));
console.log(/*#__PURE__*/jsxs$2(Foo$1, Object.assign({}, obj$1, { x: "1", children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] })));
console.log(/*#__PURE__*/jsxs$2(Foo$1, Object.assign({}, obj$1, { children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] }), "1"));
console.log(/*#__PURE__*/jsxs$2(Foo$1, Object.assign({}, obj$1, { children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] }), true));
console.log(/*#__PURE__*/jsxs$2(Foo$1, Object.assign({ x: "1", y: "1" }, obj$1, obj$1, { children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] })));
console.log(/*#__PURE__*/jsxs$2(Foo$1, Object.assign({ x: "1", y: "1" }, obj$1, obj$1, { children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] }), "1"));
console.log(/*#__PURE__*/jsxs$2(Foo$1, Object.assign({ x: "1", y: "1" }, obj$1, obj$1, { children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] }), true));

console.log(/*#__PURE__*/jsxs$2(Fragment, { children: [/*#__PURE__*/jsx$2(Foo$1, {}), /*#__PURE__*/jsx$2(Foo$1, {})] }));

// createElement
console.log(/*#__PURE__*/react.createElement(Foo$1, Object.assign({}, obj$1, { key: "1" })));
console.log(/*#__PURE__*/react.createElement(Foo$1, Object.assign({}, obj$1, { key: true })));
console.log(/*#__PURE__*/react.createElement(Foo$1, Object.assign({}, obj$1, obj$1, { x: "1", key: "1", y: "1" })));
console.log(/*#__PURE__*/react.createElement(Foo$1, Object.assign({}, obj$1, obj$1, { x: "1", key: true, y: "1" })));
console.log(/*#__PURE__*/react.createElement(Foo$1, Object.assign({}, obj$1, { key: "1" })));
console.log(/*#__PURE__*/react.createElement(Foo$1, Object.assign({}, obj$1, { key: "1" }), /*#__PURE__*/jsx$2(Foo$1, {})));

// whitespace nightmares
console.log(
  /*#__PURE__*/jsxs$2("div", { children: ["Hello World", /*#__PURE__*/jsxs$2("p", { children: [" JSX ", /*#__PURE__*/jsx$2("b", { children: "whitespaces" }), " are so  A N N O Y I N G  to deal with!! "] }), /*#__PURE__*/jsx$2("span", { foo: "bar\n      baz" }), /*#__PURE__*/jsx$2("p", { children: "x y" }), /*#__PURE__*/jsx$2(Fragment, { children: /*#__PURE__*/jsx$2("div", {}) }), /*#__PURE__*/jsx$2(Fragment, { children: /*#__PURE__*/jsx$2("div", {}) })] })
);

const Foo = 'wrong Foo 2';
const obj = 'wrong obj 2';
const jsx = 'wrong jsx 2';
const jsxs = 'wrong jsxs 2';
console.log(Foo, obj, jsx, jsxs);
