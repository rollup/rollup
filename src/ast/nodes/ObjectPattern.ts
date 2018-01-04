import { BasicNode } from './shared/Node';
import AssignmentProperty from './AssignmentProperty';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { Pattern } from './shared/Pattern';
import { Expression } from './shared/Expression';

export default class ObjectPattern extends BasicNode implements Pattern {
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

	initialiseAndDeclare (parentScope: Scope, kind: string, init: Expression | null) {
		this.initialiseScope(parentScope);
		this.properties.forEach(child =>
			child.initialiseAndDeclare(parentScope, kind, init)
		);
	}
}
