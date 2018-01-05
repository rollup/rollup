import ExecutionPathOptions from '../ExecutionPathOptions';
import { GenericStatementNode, StatementNode } from './shared/Statement';
import { ExpressionNode } from './shared/Expression';

export default class DoWhileStatement extends GenericStatementNode {
	type: 'DoWhileStatement';
	body: StatementNode;
	test: ExpressionNode;

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
