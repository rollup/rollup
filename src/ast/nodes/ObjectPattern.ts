import Node from '../Node';
import AssignmentProperty from './AssignmentProperty';
import Scope from '../scopes/Scope';
import Expression from './Expression';
import { UnknownAssignment, UndefinedAssignment } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Declaration from './Declaration';

export default class ObjectPattern extends Node {
	type: 'ObjectPattern';
	properties: AssignmentProperty[];

	reassignPath (path: string[], options: ExecutionPathOptions) {
		path.length === 0 &&
			this.properties.forEach(child => child.reassignPath(path, options));
	}

	hasEffectsWhenAssignedAtPath (path: string[], options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.someChild(child => child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, init: Declaration | Expression | UnknownAssignment | UndefinedAssignment | null) {
		this.initialiseScope(parentScope);
		this.properties.forEach(child =>
			child.initialiseAndDeclare(parentScope, kind, init)
		);
	}
}
