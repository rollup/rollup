import ExecutionPathOptions from '../ExecutionPathOptions';
import { StatementBase, StatementNode } from './shared/Statement';
import { NodeType } from './NodeType';
import { ExpressionNode } from './shared/Node';

export default class WhileStatement extends StatementBase {
	type: NodeType.WhileStatement;
	test: ExpressionNode;
	body: StatementNode;

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
