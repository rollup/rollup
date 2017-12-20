import Node from '../Node';

export default class Literal extends Node {
	type: 'Literal';
	value: string | boolean | null | number | RegExp;

	getValue () {
		return this.value;
	}

	hasEffectsWhenAccessedAtPath (path: string[]) {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath (path: string[]) {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	render (code) {
		if (typeof this.value === 'string') {
			code.indentExclusionRanges.push([this.start + 1, this.end - 1]);
		}
	}
}
