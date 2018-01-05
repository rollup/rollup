import ExecutionPathOptions from '../ExecutionPathOptions';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { GenericExpressionNode, ExpressionNode } from './shared/Expression';
import { isIdentifier } from './Identifier';

export default class UpdateExpression extends GenericExpressionNode {
	type: 'UpdateExpression';
	operator: '++' | '--' | '**';
	argument: ExpressionNode;
	prefix: boolean;

	bindNode () {
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
