import react from 'react';

const obj = {
	Foo: () => {},
	bar: { Baz: () => {} }
};

const result1 = /*#__PURE__*/react.createElement(obj.Foo, null);
const result2 = /*#__PURE__*/react.createElement(obj.bar.Baz, null);

export { result1, result2 };
