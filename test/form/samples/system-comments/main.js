const pureFunc = () => console.log('not really pure') || 0;

export var singleLine = /*#__PURE__*/pureFunc();

singleLine = /*#__PURE__*/pureFunc();

export var multiLine =
	/*#__PURE__*/
	pureFunc();

multiLine =
	/*#__PURE__*/
	pureFunc();
