let flag = false;
const array = [];

Object.defineProperty(array, 'prop', {
	get() {
		flag = true;
	}
});

array.prop;

if (!flag) {
	throw new Error('Mutation not detected');
}
