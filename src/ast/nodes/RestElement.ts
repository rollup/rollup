import Node from '../Node';
import { UNKNOWN_ASSIGNMENT } from '../values';
import Pattern from './Pattern';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class RestElement extends Node {
	type: 'RestElement';
	argument: Pattern;

	reassignPath (path: string[], options) {
		path.length === 0 && this.argument.reassignPath([], options);
	}

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions) {
		return (
			path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind) {
		this.initialiseScope(parentScope);
		this.argument.initialiseAndDeclare(parentScope, kind, UNKNOWN_ASSIGNMENT);
	}
}
