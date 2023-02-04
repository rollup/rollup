import esmDep from 'esm-dep';

export default {
	input: 'main.js',
	output: {
		banner: `/* ${esmDep} */`,
		format: 'es',
		dir: '_actual'
	}
};
