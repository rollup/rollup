function getReturnExpressionBeforeInit() {
	const bar = {
		[foo.value()]: true
	};
	if (bar.baz) {
		console.log('retained');
	}
}

const foo = {
	get value() {
		return () => 'baz';
	}
};

getReturnExpressionBeforeInit();
