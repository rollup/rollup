import { BasicNode } from './shared/Node';
import { UNKNOWN_EXPRESSION } from '../values';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { Pattern, PatternNode } from './shared/Pattern';
import { Expression } from './shared/Expression';

export default class ArrayPattern extends BasicNode implements Pattern {
	type: 'ArrayPattern';
	elements: (PatternNode | null)[];

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 &&
		this.elements.forEach(child => child && child.reassignPath([], options));
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.someChild(child => child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, _init: Expression | null) {
		this.initialiseScope(parentScope);
		this.elements.forEach(child => child && child.initialiseAndDeclare(parentScope, kind, UNKNOWN_EXPRESSION));
	}
}
