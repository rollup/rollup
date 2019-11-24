export default () => {
	const foo = 1;
	return import('./foo.js').then(ns => ns.value + foo);
};
