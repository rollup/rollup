import { obj as directObj } from './dep.js';

export const test = () =>
	import('./dep.js').then(({ obj }) => {
		obj.mutated = true;
		assert.ok(directObj.mutated ? true : false);
	});
