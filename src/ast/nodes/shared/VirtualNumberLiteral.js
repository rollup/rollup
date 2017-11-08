import Node from '../../Node';

export default class VirtualNumberLiteral extends Node {
	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath ( path ) {
		return path.length > 1;
	}

	toString () {
		return '[[VIRTUAL NUMBER]]';
	}
}
