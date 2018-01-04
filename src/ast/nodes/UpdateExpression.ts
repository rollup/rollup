import disallowIllegalReassignment from './shared/disallowIllegalReassignment';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { BasicExpressionNode, ExpressionNode } from './shared/Expression';
import { isIdentifier } from './Identifier';

export default class UpdateExpression extends BasicExpressionNode {
	type: 'UpdateExpression';
	operator: '++' | '--' | '**';
	argument: ExpressionNode;
	prefix: boolean;

	bindNode () {
		disallowIllegalReassignment(this.scope, this.argument);
		this.argument.reassignPath([], ExecutionPathOptions.create());
		if (isIdentifier(this.argument)) {
			const variable = this.scope.findVariable(this.argument.name);
			variable.isReassigned = true;
		}
	}

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.argument.hasEffects(options) ||
			this.argument.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	hasEffectsWhenAccessedAtPath (path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}
}
