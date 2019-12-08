import './lib2.js';

export default () => {
	const lib2 = 1;
	return import('./lib2.js').then(ns => ns.foo + lib2);
};
