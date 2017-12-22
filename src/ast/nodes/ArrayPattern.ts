import Node from '../Node';
import { UNKNOWN_ASSIGNMENT, UndefinedAssignment, UnknownAssignment } from '../values';
import Scope from '../Scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Pattern from './Pattern';
import Expression from './Expression';
import Declaration from './Declaration';

export default class ArrayPattern extends Node {
	type: 'ArrayPattern';
	elements: (Pattern | null)[];

	reassignPath (path: string[], options: ExecutionPathOptions) {
		path.length === 0 &&
			this.eachChild(child => child.reassignPath([], options));
	}

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.someChild(child => child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, _init: Declaration | Expression | UndefinedAssignment | UnknownAssignment | null) {
		this.initialiseScope(parentScope);
		this.eachChild((child: Pattern | null) =>
			child.initialiseAndDeclare(parentScope, kind, UNKNOWN_ASSIGNMENT)
		);
	}
}
