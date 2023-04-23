module.exports = defineTest({
	description:
		'does not replace input with stdin but allows referencing it when using a config file',
	skipIfWindows: true,
	command: `echo "import {PRINT as p} from './a'; import C from  './b'; 0 && fail() || p(C); export {C as value, p as print}" | rollup -c`
});
