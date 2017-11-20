import Node from '../../Node';

export default class VirtualObjectExpression extends Node {
	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath ( path ) {
		return path.length > 1;
	}

	toString () {
		return '[[VIRTUAL OBJECT]]';
	}
}
