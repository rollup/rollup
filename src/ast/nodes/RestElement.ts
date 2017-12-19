import Node from '../Node';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class RestElement extends Node {
	reassignPath (path, options) {
		path.length === 0 && this.argument.reassignPath([], options);
	}

	hasEffectsWhenAssignedAtPath (path, options) {
		return (
			path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	initialiseAndDeclare (parentScope, kind) {
		this.initialiseScope(parentScope);
		this.argument.initialiseAndDeclare(parentScope, kind, UNKNOWN_ASSIGNMENT);
	}
}
