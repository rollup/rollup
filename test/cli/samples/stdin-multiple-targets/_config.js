module.exports = {
	description: 'uses stdin in multiple targets',
	command: `shx echo "import {PRINT as p} from './a'; import C from  './b'; 0 && fail() || p(C); export {C as value, p as print}" | rollup -c`
};
