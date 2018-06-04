export const obj1 = {
	reassigned() {}
};

const obj2 = {
	reassigned() {}
};
export { obj2 };

export function test() {
	obj1.reassigned();
	obj2.reassigned();
}
