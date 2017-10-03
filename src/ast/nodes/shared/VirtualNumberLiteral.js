import Node from '../../Node';

export default class VirtualNumberLiteral extends Node {
	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenMutatedAtPath ( path ) {
		return path.length > 0;
	}

	toString () {
		return '[[VIRTUAL NUMBER]]';
	}
}
