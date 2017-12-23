import Node from '../Node';
import { UNKNOWN_ASSIGNMENT, UnknownAssignment } from '../values';
import Pattern from './Pattern';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Expression from './Expression';
import Scope from '../scopes/Scope';
import Declaration from './Declaration';
import { ObjectPath } from '../variables/VariableReassignmentTracker';

export default class RestElement extends Node {
	type: 'RestElement';
	argument: Pattern;

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 && this.argument.reassignPath([], options);
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 || this.argument.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	initialiseAndDeclare (
		parentScope: Scope, kind: string, _init: Declaration | Expression | UnknownAssignment | null) {
		this.initialiseScope(parentScope);
		this.argument.initialiseAndDeclare(parentScope, kind, UNKNOWN_ASSIGNMENT);
	}
}
