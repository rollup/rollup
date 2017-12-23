import Node from '../Node';
import AssignmentProperty from './AssignmentProperty';
import Scope from '../scopes/Scope';
import Expression from './Expression';
import { UnknownAssignment } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Declaration from './Declaration';
import { ObjectPath } from '../variables/VariableReassignmentTracker';

export default class ObjectPattern extends Node {
	type: 'ObjectPattern';
	properties: AssignmentProperty[];

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 &&
		this.properties.forEach(child => child.reassignPath(path, options));
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.someChild(child => child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, init: Declaration | Expression | UnknownAssignment | null) {
		this.initialiseScope(parentScope);
		this.properties.forEach(child =>
			child.initialiseAndDeclare(parentScope, kind, init)
		);
	}
}
