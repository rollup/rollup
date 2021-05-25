getObj().getThis().method();
getObj().getThis().getThis().method();

function getObj() {
	return {
		getThis() {
			return this;
		},
		method() {},
	};
}
