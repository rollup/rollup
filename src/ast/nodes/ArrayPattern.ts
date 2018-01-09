import { UNKNOWN_EXPRESSION } from '../values';
import Scope from '../scopes/Scope';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { PatternBase, PatternNode } from './shared/Pattern';
import { ExpressionEntity } from './shared/Expression';

export default class ArrayPattern extends PatternBase {
	type: 'ArrayPattern';
	elements: (PatternNode | null)[];

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 &&
		this.elements.forEach(child => child && child.reassignPath([], options));
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions) {
		return (
			path.length > 0 ||
			this.elements.some(child => child && child.hasEffectsWhenAssignedAtPath([], options))
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, _init: ExpressionEntity | null) {
		this.initialiseScope(parentScope);
		this.elements.forEach(child => child && child.initialiseAndDeclare(parentScope, kind, UNKNOWN_EXPRESSION));
	}
}
