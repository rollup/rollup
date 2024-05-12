import react from 'react';

const Foo = () => {};
const element = /*#__PURE__*/react.createElement(Foo, null, "some&\\text");
const fragment = /*#__PURE__*/react.createElement(react.Fragment, null, "other&\\text");

export { element, fragment };
