import Node from '../Node';
import { UNKNOWN_ASSIGNMENT, UnknownAssignment } from '../values';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Pattern from './Pattern';
import Expression from './Expression';
import Declaration from './Declaration';
import { ObjectPath } from '../variables/VariableReassignmentTracker';

export default class ArrayPattern extends Node {
	type: 'ArrayPattern';
	elements: (Pattern | null)[];

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 &&
		this.eachChild(child => child.reassignPath([], options));
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.someChild(child => child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, _init: Declaration | Expression | UnknownAssignment | null) {
		this.initialiseScope(parentScope);
		this.eachChild((child: Pattern | null) =>
			child.initialiseAndDeclare(parentScope, kind, UNKNOWN_ASSIGNMENT)
		);
	}
}
