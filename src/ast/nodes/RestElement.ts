import Node from '../Node';
import { UNKNOWN_ASSIGNMENT, UnknownAssignment, UndefinedAssignment } from '../values';
import Pattern from './Pattern';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Expression from './Expression';
import Scope from '../scopes/Scope';
import Declaration from './Declaration';

export default class RestElement extends Node {
	type: 'RestElement';
	argument: Pattern;

	reassignPath (path: string[], options: ExecutionPathOptions) {
		path.length === 0 && this.argument.reassignPath([], options);
	}

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, init: Declaration | Expression | UnknownAssignment | UndefinedAssignment | null) {
		this.initialiseScope(parentScope);
		this.argument.initialiseAndDeclare(parentScope, kind, UNKNOWN_ASSIGNMENT);
	}
}
