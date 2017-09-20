import Node from '../Node.js';

export default class Literal extends Node {
	getValue () {
		return this.value;
	}

	hasEffectsWhenAssignedAtPath ( path ) {
		if (this.value === null) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	hasEffectsWhenMutatedAtPath ( path ) {
		if (this.value === null) {
			return true;
		}
		return path.length > 0;
	}

	render ( code ) {
		if ( typeof this.value === 'string' ) {
			code.indentExclusionRanges.push( [ this.start + 1, this.end - 1 ] );
		}
	}
}
