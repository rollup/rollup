import { jsx, Fragment, jsxs } from 'react/jsx-runtime';
import react from 'react';

const Foo = () => {};
const obj = { key: '2' };

// jsx
console.log(/*#__PURE__*/jsx(Foo, {}));
console.log(/*#__PURE__*/jsx(Foo, { x: true }));
console.log(/*#__PURE__*/jsx(Foo, { x: "1" }));
console.log(/*#__PURE__*/jsx(Foo, { x: "1" }));
console.log(/*#__PURE__*/jsx(Foo, {}, true));
console.log(/*#__PURE__*/jsx(Foo, {}, "1"));
console.log(/*#__PURE__*/jsx(Foo, {}, "1"));
console.log(/*#__PURE__*/jsx(Foo, obj));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({}, obj, { x: "1" })));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({}, obj), "1"));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({}, obj), true));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({ x: "1", y: "1" }, obj, obj)));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({ x: "1", y: "1" }, obj, obj), "1"));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({ x: "1", y: "1" }, obj, obj), true));

console.log(/*#__PURE__*/jsx(Foo, {}));
console.log(/*#__PURE__*/jsx(Foo, { x: "1" }));
console.log(/*#__PURE__*/jsx(Foo, {}, "1"));
console.log(/*#__PURE__*/jsx(Foo, {}, true));

console.log(/*#__PURE__*/jsx(Foo, { children: /*#__PURE__*/jsx(Foo, {}) }));
console.log(/*#__PURE__*/jsx(Foo, { x: "1", children: /*#__PURE__*/jsx(Foo, {}) }));
console.log(/*#__PURE__*/jsx(Foo, { children: /*#__PURE__*/jsx(Foo, {}) }, "1"));
console.log(/*#__PURE__*/jsx(Foo, { children: /*#__PURE__*/jsx(Foo, {}) }, true));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({}, obj, { children: /*#__PURE__*/jsx(Foo, {}) })));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({}, obj, { x: "1", children: /*#__PURE__*/jsx(Foo, {}) })));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({}, obj, { children: /*#__PURE__*/jsx(Foo, {}) }), "1"));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({}, obj, { children: /*#__PURE__*/jsx(Foo, {}) }), true));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({ x: "1", y: "1" }, obj, obj, { children: /*#__PURE__*/jsx(Foo, {}) })));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({ x: "1", y: "1" }, obj, obj, { children: /*#__PURE__*/jsx(Foo, {}) }), "1"));
console.log(/*#__PURE__*/jsx(Foo, Object.assign({ x: "1", y: "1" }, obj, obj, { children: /*#__PURE__*/jsx(Foo, {}) }), true));

console.log(/*#__PURE__*/jsx(Foo, { children: /*#__PURE__*/jsx(Foo, {}) }));

console.log(/*#__PURE__*/jsx(Fragment, {}));
console.log(/*#__PURE__*/jsx(Fragment, { children: /*#__PURE__*/jsx(Foo, {}) }));

// jsxs
console.log(/*#__PURE__*/jsxs(Foo, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }));
console.log(/*#__PURE__*/jsxs(Foo, { x: "1", children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }));
console.log(/*#__PURE__*/jsxs(Foo, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }, "1"));
console.log(/*#__PURE__*/jsxs(Foo, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }, true));
console.log(/*#__PURE__*/jsxs(Foo, Object.assign({}, obj, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] })));
console.log(/*#__PURE__*/jsxs(Foo, Object.assign({}, obj, { x: "1", children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] })));
console.log(/*#__PURE__*/jsxs(Foo, Object.assign({}, obj, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }), "1"));
console.log(/*#__PURE__*/jsxs(Foo, Object.assign({}, obj, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }), true));
console.log(/*#__PURE__*/jsxs(Foo, Object.assign({ x: "1", y: "1" }, obj, obj, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] })));
console.log(/*#__PURE__*/jsxs(Foo, Object.assign({ x: "1", y: "1" }, obj, obj, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }), "1"));
console.log(/*#__PURE__*/jsxs(Foo, Object.assign({ x: "1", y: "1" }, obj, obj, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }), true));

console.log(/*#__PURE__*/jsxs(Fragment, { children: [/*#__PURE__*/jsx(Foo, {}), /*#__PURE__*/jsx(Foo, {})] }));

// createElement
console.log(/*#__PURE__*/react.createElement(Foo, Object.assign({}, obj, { key: "1" })));
console.log(/*#__PURE__*/react.createElement(Foo, Object.assign({}, obj, { key: true })));
console.log(/*#__PURE__*/react.createElement(Foo, Object.assign({}, obj, obj, { x: "1", key: "1", y: "1" })));
console.log(/*#__PURE__*/react.createElement(Foo, Object.assign({}, obj, obj, { x: "1", key: true, y: "1" })));
console.log(/*#__PURE__*/react.createElement(Foo, Object.assign({}, obj, { key: "1" })));
console.log(/*#__PURE__*/react.createElement(Foo, Object.assign({}, obj, { key: "1" }), /*#__PURE__*/jsx(Foo, {})));

