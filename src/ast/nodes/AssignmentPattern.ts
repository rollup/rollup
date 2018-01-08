import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { GenericPatternNode, PatternNode } from './shared/Pattern';
import { ExpressionEntity, ExpressionNode } from './shared/Expression';

export default class AssignmentPattern extends GenericPatternNode {
	type: 'AssignmentPattern';
	left: PatternNode;
	right: ExpressionNode;

	bindNode () {
		this.left.reassignPath([], ExecutionPathOptions.create());
	}

	reassignPath (path: ObjectPath, options: ExecutionPathOptions) {
		path.length === 0 && this.left.reassignPath(path, options);
	}

	hasEffectsWhenAssignedAtPath (path: ObjectPath, options: ExecutionPathOptions): boolean {
		return (
			path.length > 0 || this.left.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	initialiseAndDeclare (parentScope: Scope, kind: string, init: ExpressionEntity | null) {
		this.initialiseScope(parentScope);
		this.right.initialise(parentScope);
		this.left.initialiseAndDeclare(parentScope, kind, init);
	}
}
