const fn = async () => {
	const obj = {
		test() {
			if (typeof obj.testfn === 'function') {
				obj.testfn();
			}
		}
	};
	return obj;
};

export let toggled = false;

export const test = async function () {
	const obj1 = await fn();
	const obj2 = await fn();
	obj1.testfn = () => (toggled = true);
	obj1.test();
};
