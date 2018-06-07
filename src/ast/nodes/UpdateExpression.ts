import { ExecutionPathOptions, NEW_EXECUTION_PATH } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath } from '../values';
import { isIdentifier } from './Identifier';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class UpdateExpression extends NodeBase {
	type: NodeType.tUpdateExpression;
	operator: '++' | '--' | '**';
	argument: ExpressionNode;
	prefix: boolean;

	bind() {
		super.bind();
		this.argument.reassignPath(EMPTY_PATH, NEW_EXECUTION_PATH);
		if (isIdentifier(this.argument)) {
			const variable = this.scope.findVariable(this.argument.name);
			variable.isReassigned = true;
		}
	}

	hasEffects(options: ExecutionPathOptions): boolean {
		return (
			this.argument.hasEffects(options) ||
			this.argument.hasEffectsWhenAssignedAtPath(EMPTY_PATH, options)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, _options: ExecutionPathOptions) {
		return path.length > 1;
	}
}
