import * as dep from './dep.js';

export function getValue() {
	const conflict = 'main';
	const conflict1 = 'main';
	const conflict$1 = 'main';
	const conflict$$1 = 'main';
	return conflict + conflict1 + conflict$1 + conflict$$1 + dep.conflict;
}
