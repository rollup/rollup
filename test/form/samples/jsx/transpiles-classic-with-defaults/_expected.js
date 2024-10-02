const Foo = () => {};
const obj = { key: '2' };

console.log(/*#__PURE__*/React.createElement(Foo, null));
console.log(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Foo, null)));
console.log(/*#__PURE__*/React.createElement(Foo, null, /*#__PURE__*/React.createElement(Foo, null), /*#__PURE__*/React.createElement(Foo, null)));
console.log(/*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Foo, null), /*#__PURE__*/React.createElement(Foo, null)));
console.log(/*#__PURE__*/React.createElement(Foo, Object.assign({}, obj, { key: "1" })));
