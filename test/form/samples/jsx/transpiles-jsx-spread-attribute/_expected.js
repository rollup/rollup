import react from 'react';

const obj$2 = { value1: true };
console.log(obj$2);

const obj$1 = { value2: true };
console.log(obj$1);

const obj = { value3: true };
console.log(obj);

const Foo = () => {};
const result1 = /*#__PURE__*/react.createElement(Foo, obj$1);
const result2 = /*#__PURE__*/react.createElement(Foo, Object.assign({}, obj$1, { prop: true }));
const result3 = /*#__PURE__*/react.createElement(Foo,
  Object.assign({ prop1: true,
  prop2: true },
  obj$1,
  obj$1));

export { result1, result2, result3 };
