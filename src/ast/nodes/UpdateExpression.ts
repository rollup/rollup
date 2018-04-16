import ExecutionPathOptions from '../ExecutionPathOptions';
import { isIdentifier } from './Identifier';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { ObjectPath } from '../values';

export default class UpdateExpression extends NodeBase {
	type: NodeType.UpdateExpression;
	operator: '++' | '--' | '**';
	argument: ExpressionNode;
	prefix: boolean;

	bind() {
		super.bind();
		this.argument.reassignPath([], ExecutionPathOptions.create());
		if (isIdentifier(this.argument)) {
			const variable = this.scope.findVariable(this.argument.name);
			variable.isReassigned = true;
		}
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.argument.hasEffects(options) || this.argument.hasEffectsWhenAssignedAtPath([], options)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}
}
