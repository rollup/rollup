function fn() {
	const obj = {
		test() {
			if (typeof obj.testfn === 'function') {
				obj.testfn();
			}
		}
	};

	return obj;
}

export let toggled = false;

export const test = async function () {
	const obj = await fn();
	obj.testfn = () => (toggled = true);
	obj.test();
};
