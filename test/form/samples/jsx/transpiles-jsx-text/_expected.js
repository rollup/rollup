import react from 'react';

const Foo = () => {};
const result = /*#__PURE__*/react.createElement(Foo, null, "some&\\text");

export { result };
