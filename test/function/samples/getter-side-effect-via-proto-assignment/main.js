let sideEffect = false;

const obj = {};
obj.__proto__ = {
	get prop() {
		sideEffect = true;
	}
};

obj.prop;

if (!sideEffect) {
	throw new Error('Getter side effect was not preserved');
}
