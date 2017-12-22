import Node from '../Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import MagicString from 'magic-string';

export default class Literal extends Node {
	type: 'Literal';
	value: string | boolean | null | number | RegExp;

	getValue () {
		return this.value;
	}

	hasEffectsWhenAccessedAtPath (path: string[], _options: ExecutionPathOptions) {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath (path: string[], _options: ExecutionPathOptions) {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	render (code: MagicString, _es: boolean) {
		if (typeof this.value === 'string') {
			(<any> code).indentExclusionRanges.push([this.start + 1, this.end - 1]); // TODO TypeScript: Awaiting MagicString PR
		}
	}
}
