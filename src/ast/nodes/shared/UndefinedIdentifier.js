import Node from '../../Node';

export default class UndefinedIdentifier extends Node {
	hasEffectsAsExpressionStatement () {
		return false;
	}

	hasEffectsWhenAssignedAtPath ( path ) {
		return path.length > 0;
	}

	hasEffectsWhenMutatedAtPath ( path ) {
		return path.length > 0;
	}
}
