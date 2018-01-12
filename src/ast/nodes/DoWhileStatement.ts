import ExecutionPathOptions from '../ExecutionPathOptions';
import { StatementBase, StatementNode } from './shared/Statement';
import { ExpressionNode } from './shared/Node';
import { NodeType } from './NodeType';

export default class DoWhileStatement extends StatementBase {
	type: NodeType.DoWhileStatement;
	body: StatementNode;
	test: ExpressionNode;

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
