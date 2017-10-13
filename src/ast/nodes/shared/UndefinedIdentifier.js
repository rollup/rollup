import Node from '../../Node';

export default class UndefinedIdentifier extends Node {
	hasEffects () {
		return false;
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 0;
	}

	hasEffectsWhenAssignedAtPath ( path ) {
		return path.length > 0;
	}

	toString () {
		return 'undefined';
	}
}
